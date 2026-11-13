const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './MetallicPaint.css';\r
\r
const WORKING_SIZE = 512;\r
const MAX_SIDE = 2048;\r
const MAX_PIXELS = 2560 * 1600 * 2;\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 a_position;\r
uniform vec2 u_resolution;\r
uniform float u_imageAspect;\r
uniform float u_scale;\r
uniform float u_rotation;\r
out vec2 v_imageUV;\r
\r
void main() {\r
  gl_Position = vec4(a_position, 0.0, 1.0);\r
  vec2 uv = a_position * 0.5;\r
  float r = u_rotation * 3.14159265358979323846 / 180.0;\r
  mat2 turn = mat2(cos(r), sin(r), -sin(r), cos(r));\r
  vec2 imageBox;\r
  imageBox.x = min(u_resolution.x / u_imageAspect, u_resolution.y) * u_imageAspect;\r
  imageBox.y = imageBox.x / u_imageAspect;\r
  v_imageUV = uv * (u_resolution / imageBox) / u_scale;\r
  v_imageUV.x *= u_imageAspect;\r
  v_imageUV = turn * v_imageUV;\r
  v_imageUV.x /= u_imageAspect;\r
  v_imageUV += 0.5;\r
  v_imageUV.y = 1.0 - v_imageUV.y;\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D u_image;\r
uniform vec2 u_resolution;\r
uniform float u_time;\r
uniform vec4 u_colorBack;\r
uniform vec4 u_colorTint;\r
uniform float u_softness;\r
uniform float u_repetition;\r
uniform float u_shiftRed;\r
uniform float u_shiftBlue;\r
uniform float u_distortion;\r
uniform float u_contour;\r
uniform float u_angle;\r
uniform vec2 u_tilt;\r
uniform float u_reveal;\r
uniform float u_light;\r
\r
in vec2 v_imageUV;\r
\r
out vec4 fragColor;\r
\r
#define PI 3.14159265358979323846\r
\r
vec2 rotate(vec2 uv, float th) {\r
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;\r
}\r
\r
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }\r
\r
float snoise(vec2 v) {\r
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);\r
  vec2 i = floor(v + dot(v, C.yy));\r
  vec2 x0 = v - i + dot(i, C.xx);\r
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r
  vec4 x12 = x0.xyxy + C.xxzz;\r
  x12.xy -= i1;\r
  i = mod(i, 289.0);\r
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\r
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\r
  m = m * m;\r
  m = m * m;\r
  vec3 x = 2.0 * fract(p * C.www) - 1.0;\r
  vec3 h = abs(x) - 0.5;\r
  vec3 ox = floor(x + 0.5);\r
  vec3 a0 = x - ox;\r
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\r
  vec3 g;\r
  g.x = a0.x * x0.x + h.x * x0.y;\r
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r
  return 130.0 * dot(m, g);\r
}\r
\r
float getColorChanges(float c1, float c2, float stripe, vec3 w, float blur, float bump, float tint) {\r
  float ch = mix(c2, c1, smoothstep(0.0, 2.0 * blur, stripe));\r
  float border = w[0];\r
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));\r
  bump = smoothstep(0.2, 0.8, bump);\r
  border = w[0] + 0.4 * (1.0 - bump) * w[1];\r
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));\r
  border = w[0] + 0.5 * (1.0 - bump) * w[1];\r
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));\r
  border = w[0] + w[1];\r
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));\r
  float gradientT = (stripe - w[0] - w[1]) / w[2];\r
  float gradient = mix(c1, c2, smoothstep(0.0, 1.0, gradientT));\r
  ch = mix(ch, gradient, smoothstep(border, border + 0.5 * blur, stripe));\r
  ch = mix(ch, 1.0 - min(1.0, (1.0 - ch) / max(tint, 0.0001)), u_colorTint.a);\r
  return ch;\r
}\r
\r
float getImgFrame(vec2 uv, float th) {\r
  float frame = 1.0;\r
  frame *= smoothstep(0.0, th, uv.y);\r
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.y);\r
  frame *= smoothstep(0.0, th, uv.x);\r
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.x);\r
  return frame;\r
}\r
\r
float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {\r
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));\r
  vec2 r = radius * texel;\r
  float sum = 4.0 * centerSample;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;\r
  return sum / 16.0;\r
}\r
\r
void main() {\r
  const float firstFrameOffset = 2.8;\r
  float t = 0.3 * (u_time + firstFrameOffset);\r
\r
  vec2 uv = v_imageUV;\r
  vec2 dudx = dFdx(v_imageUV);\r
  vec2 dudy = dFdy(v_imageUV);\r
  vec4 img = textureGrad(u_image, uv, dudx, dudy);\r
\r
  float cycleWidth = u_repetition;\r
\r
  vec2 rotatedUV = uv - vec2(0.5);\r
  float angle = (-u_angle + 70.0) * PI / 180.0;\r
  float cosA = cos(angle);\r
  float sinA = sin(angle);\r
  rotatedUV = vec2(rotatedUV.x * cosA - rotatedUV.y * sinA, rotatedUV.x * sinA + rotatedUV.y * cosA) + vec2(0.5);\r
\r
  float edge = blurEdge3x3(u_image, uv, dudx, dudy, 6.0, img.r);\r
  edge = pow(edge, 1.6);\r
  edge *= smoothstep(0.0, 0.4, u_contour);\r
\r
  float opacity = img.g * getImgFrame(v_imageUV, 0.0);\r
  float depth = img.r;\r
\r
  float diagBLtoTR = rotatedUV.x - rotatedUV.y;\r
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;\r
\r
  vec3 color1 = mix(vec3(0.98, 0.98, 1.0), vec3(0.9, 0.9, 0.93), u_light);\r
  vec3 color2 = vec3(0.1, 0.1, 0.1 + 0.1 * smoothstep(0.7, 1.3, diagTLtoBR));\r
\r
  vec2 gradUV = uv - 0.5 - u_tilt * vec2(0.18, -0.12);\r
  float dist = length(gradUV + vec2(0.0, 0.2 * diagBLtoTR));\r
  gradUV = rotate(gradUV, (0.25 - 0.2 * diagBLtoTR) * PI);\r
  float direction = gradUV.x;\r
\r
  float bump = pow(1.8 * dist, 1.2);\r
  bump = 1.0 - bump;\r
  bump *= pow(uv.y, 0.3);\r
\r
  float thinStrip1 = 0.12 / cycleWidth * (1.0 - 0.4 * bump);\r
  float thinStrip2 = 0.07 / cycleWidth * (1.0 + 0.4 * bump);\r
  float wideStrip = 1.0 - thinStrip1 - thinStrip2;\r
\r
  float noise = snoise(uv - t);\r
  edge += (1.0 - edge) * u_distortion * noise;\r
\r
  direction += diagBLtoTR;\r
  direction -= 2.0 * noise * diagBLtoTR * (smoothstep(0.0, 1.0, edge) * (1.0 - smoothstep(0.0, 1.0, edge)));\r
  direction *= mix(1.0, 1.0 - edge, smoothstep(0.5, 1.0, u_contour));\r
  direction -= 1.7 * edge * smoothstep(0.5, 1.0, u_contour);\r
  direction += 0.2 * pow(u_contour, 4.0) * (1.0 - smoothstep(0.0, 1.0, edge));\r
\r
  bump *= clamp(pow(uv.y, 0.1), 0.3, 1.0);\r
  direction *= 0.1 + (1.1 - edge) * bump;\r
  direction *= 0.4 + 0.6 * (1.0 - smoothstep(0.5, 1.0, edge));\r
  direction += 0.18 * (smoothstep(0.1, 0.2, uv.y) * (1.0 - smoothstep(0.2, 0.4, uv.y)));\r
  direction += 0.03 * (smoothstep(0.1, 0.2, 1.0 - uv.y) * (1.0 - smoothstep(0.2, 0.4, 1.0 - uv.y)));\r
  direction *= 0.5 + 0.5 * pow(uv.y, 2.0);\r
  direction *= cycleWidth;\r
  direction -= t + dot(u_tilt, vec2(0.35, 0.2));\r
\r
  float colorDispersion = clamp(1.0 - bump, 0.0, 1.0);\r
  float dispersionRed = colorDispersion;\r
  dispersionRed += 0.03 * bump * noise;\r
  dispersionRed += 5.0 * (smoothstep(-0.1, 0.2, uv.y) * (1.0 - smoothstep(0.1, 0.5, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 1.0, bump)));\r
  dispersionRed -= diagBLtoTR;\r
\r
  float dispersionBlue = colorDispersion * 1.3;\r
  dispersionBlue += (smoothstep(0.0, 0.4, uv.y) * (1.0 - smoothstep(0.1, 0.8, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 0.8, bump)));\r
  dispersionBlue -= 0.2 * edge;\r
\r
  dispersionRed *= u_shiftRed / 20.0;\r
  dispersionBlue *= u_shiftBlue / 20.0;\r
\r
  float softness = 0.05 * u_softness;\r
  float blur = softness + 0.5 * smoothstep(1.0, 10.0, u_repetition) * smoothstep(0.0, 1.0, edge);\r
  float smallCanvas = 1.0 - smoothstep(100.0, 500.0, min(u_resolution.x, u_resolution.y));\r
  blur += smallCanvas * smoothstep(0.0, 1.0, edge);\r
  float rExtraBlur = softness * (0.05 + 0.1 * (u_shiftRed / 20.0) * bump);\r
  float gExtraBlur = softness * 0.05 / max(0.001, abs(1.0 - diagBLtoTR));\r
\r
  vec3 w = vec3(thinStrip1 * cycleWidth, thinStrip2 * cycleWidth, wideStrip);\r
  w[1] -= 0.02 * smoothstep(0.0, 1.0, edge + bump);\r
  float stripeR = fract(direction + dispersionRed);\r
  float r = getColorChanges(color1.r, color2.r, stripeR, w, blur + fwidth(stripeR) + rExtraBlur, bump, u_colorTint.r);\r
  float stripeG = fract(direction);\r
  float g = getColorChanges(color1.g, color2.g, stripeG, w, blur + fwidth(stripeG) + gExtraBlur, bump, u_colorTint.g);\r
  float stripeB = fract(direction - dispersionBlue);\r
  float b = getColorChanges(color1.b, color2.b, stripeB, w, blur + fwidth(stripeB), bump, u_colorTint.b);\r
\r
  vec3 sheen = mix(vec3(1.0), u_colorTint.rgb, 0.45 * u_colorTint.a);\r
  r *= sheen.r;\r
  g *= sheen.g;\r
  b *= sheen.b;\r
\r
  float rim = smoothstep(0.78, 1.0, depth) * u_light;\r
  r *= 1.0 - rim * 0.62;\r
  g *= 1.0 - rim * 0.62;\r
  b *= 1.0 - rim * 0.58;\r
\r
  float pour = u_reveal * 1.25 - 0.1;\r
  opacity *= smoothstep(1.0 - pour, 1.15 - pour, depth) * smoothstep(0.0, 0.25, u_reveal);\r
\r
  vec3 color = vec3(r, g, b) * opacity;\r
  vec3 back = u_colorBack.rgb * u_colorBack.a;\r
  color += back * (1.0 - opacity);\r
  opacity += u_colorBack.a * (1.0 - opacity);\r
  color += 1.0 / 256.0 * (fract(sin(dot(0.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5);\r
  fragColor = vec4(color, opacity);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (() => {\r
  let context = null;\r
  return (value, fallback) => {\r
    if (typeof document === 'undefined') return fallback;\r
    context ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = 'rgba(0, 0, 0, 0)';\r
    context.fillStyle = String(value);\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255, a / 255];\r
  };\r
})();\r
\r
const loadImage = src =>\r
  new Promise((resolve, reject) => {\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.onload = () => resolve(image);\r
    image.onerror = () => reject(new Error('MetallicPaint: failed to load the image'));\r
    image.src = src;\r
  });\r
\r
const isVector = async src => {\r
  if (/\\.svg($|[?#])/i.test(src) || src.startsWith('data:image/svg+xml')) return true;\r
  if (!src.startsWith('blob:')) return false;\r
  try {\r
    const blob = await (await fetch(src)).blob();\r
    return blob.type === 'image/svg+xml';\r
  } catch {\r
    return false;\r
  }\r
};\r
\r
const drawImageSource = async src => {\r
  const [image, vector] = await Promise.all([loadImage(src), isVector(src)]);\r
  let width = image.naturalWidth || image.width || MAX_SIDE;\r
  let height = image.naturalHeight || image.height || MAX_SIDE;\r
  const longest = Math.max(width, height);\r
  const fit = vector ? MAX_SIDE / longest : clamp(1024 / longest, 1, MAX_SIDE / longest);\r
  width = Math.max(1, Math.round(width * fit));\r
  height = Math.max(1, Math.round(height * fit));\r
  const canvas = document.createElement('canvas');\r
  canvas.width = width;\r
  canvas.height = height;\r
  const ctx = canvas.getContext('2d', { willReadFrequently: true });\r
  ctx.drawImage(image, 0, 0, width, height);\r
  const data = ctx.getImageData(0, 0, width, height);\r
  let opaque = true;\r
  for (let i = 3; i < data.data.length; i += 4) {\r
    if (data.data[i] < 250) {\r
      opaque = false;\r
      break;\r
    }\r
  }\r
  if (opaque) {\r
    for (let i = 0; i < data.data.length; i += 4) {\r
      const light = Math.min(data.data[i], data.data[i + 1], data.data[i + 2]);\r
      data.data[i + 3] = Math.round(clamp((250 - light) / 30, 0, 1) * 255);\r
    }\r
    ctx.putImageData(data, 0, 0);\r
  }\r
  return canvas;\r
};\r
\r
const drawTextSource = async (text, fontFamily, fontWeight) => {\r
  const size = 320;\r
  const font = \`\${fontWeight} \${size}px \${fontFamily}\`;\r
  try {\r
    await document.fonts?.load(font, text);\r
  } catch {\r
    return null;\r
  }\r
  const probe = document.createElement('canvas').getContext('2d');\r
  probe.font = font;\r
  const metrics = probe.measureText(text);\r
  const ascent = metrics.actualBoundingBoxAscent || size * 0.8;\r
  const descent = metrics.actualBoundingBoxDescent || size * 0.2;\r
  const left = metrics.actualBoundingBoxLeft || 0;\r
  const right = metrics.actualBoundingBoxRight || metrics.width;\r
  const pad = size * 0.12;\r
  const canvas = document.createElement('canvas');\r
  canvas.width = Math.ceil(left + right + pad * 2);\r
  canvas.height = Math.ceil(ascent + descent + pad * 2);\r
  const ctx = canvas.getContext('2d');\r
  ctx.font = font;\r
  ctx.fillStyle = '#000';\r
  ctx.textBaseline = 'alphabetic';\r
  ctx.fillText(text, pad + left, pad + ascent);\r
  return canvas;\r
};\r
\r
const solvePoisson = (mask, width, height) => {\r
  const interior = [];\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      const i = y * width + x;\r
      if (!mask[i]) continue;\r
      const boundary =\r
        x === 0 ||\r
        y === 0 ||\r
        x === width - 1 ||\r
        y === height - 1 ||\r
        !mask[i - 1] ||\r
        !mask[i + 1] ||\r
        !mask[i - width] ||\r
        !mask[i + width] ||\r
        !mask[i - width - 1] ||\r
        !mask[i - width + 1] ||\r
        !mask[i + width - 1] ||\r
        !mask[i + width + 1];\r
      if (!boundary) interior.push(i);\r
    }\r
  }\r
  const field = new Float32Array(width * height);\r
  const red = [];\r
  const black = [];\r
  interior.forEach(i => (((i % width) + Math.floor(i / width)) % 2 === 0 ? red.push(i) : black.push(i)));\r
  const relax = list => {\r
    for (let k = 0; k < list.length; k++) {\r
      const i = list[k];\r
      const sum = field[i + 1] + field[i - 1] + field[i - width] + field[i + width];\r
      field[i] = 1.9 * ((0.01 + sum) / 4) - 0.9 * field[i];\r
    }\r
  };\r
  for (let iteration = 0; iteration < 40; iteration++) {\r
    relax(red);\r
    relax(black);\r
  }\r
  let peak = 0;\r
  interior.forEach(i => {\r
    if (field[i] > peak) peak = field[i];\r
  });\r
  return { field, peak: peak || 1 };\r
};\r
\r
const processShape = source => {\r
  const width = source.width;\r
  const height = source.height;\r
  const fit = WORKING_SIZE / Math.min(width, height);\r
  const workW = Math.max(2, Math.round(width * fit));\r
  const workH = Math.max(2, Math.round(height * fit));\r
\r
  const small = document.createElement('canvas');\r
  small.width = workW;\r
  small.height = workH;\r
  const smallCtx = small.getContext('2d', { willReadFrequently: true });\r
  smallCtx.drawImage(source, 0, 0, workW, workH);\r
  const smallData = smallCtx.getImageData(0, 0, workW, workH).data;\r
  const mask = new Uint8Array(workW * workH);\r
  for (let i = 0; i < mask.length; i++) mask[i] = smallData[i * 4 + 3] > 0 ? 1 : 0;\r
\r
  const { field, peak } = solvePoisson(mask, workW, workH);\r
  const gradient = smallCtx.createImageData(workW, workH);\r
  for (let i = 0; i < mask.length; i++) {\r
    const p = i * 4;\r
    const value = mask[i] ? 255 * (1 - field[i] / peak) : 255;\r
    gradient.data[p] = value;\r
    gradient.data[p + 1] = value;\r
    gradient.data[p + 2] = value;\r
    gradient.data[p + 3] = mask[i] ? 255 : 0;\r
  }\r
  smallCtx.putImageData(gradient, 0, 0);\r
\r
  const out = document.createElement('canvas');\r
  out.width = width;\r
  out.height = height;\r
  const outCtx = out.getContext('2d', { willReadFrequently: true });\r
  outCtx.imageSmoothingEnabled = true;\r
  outCtx.imageSmoothingQuality = 'high';\r
  outCtx.drawImage(small, 0, 0, workW, workH, 0, 0, width, height);\r
  const result = outCtx.getImageData(0, 0, width, height);\r
  const original = source.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height).data;\r
  for (let i = 0; i < result.data.length; i += 4) {\r
    const alpha = original[i + 3];\r
    if (alpha === 0) {\r
      result.data[i] = 255;\r
      result.data[i + 1] = 0;\r
    } else {\r
      result.data[i] = result.data[i + 3] === 0 ? 0 : result.data[i];\r
      result.data[i + 1] = alpha;\r
    }\r
    result.data[i + 2] = 255;\r
    result.data[i + 3] = 255;\r
  }\r
  return result;\r
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
export default function MetallicPaint({\r
  imageSrc,\r
  text,\r
  fontFamily = 'system-ui, sans-serif',\r
  fontWeight = 800,\r
  color = '#ffffff',\r
  backgroundColor = 'transparent',\r
  density = 2,\r
  softness = 0.1,\r
  dispersion = 0.3,\r
  distortion = 0.07,\r
  edgeBend = 0.6,\r
  angle = 70,\r
  speed = 1,\r
  scale = 0.6,\r
  rotation = 0,\r
  mouseTilt = 0.5,\r
  lightMode = false,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const settingsRef = useRef(null);\r
\r
  settingsRef.current = {\r
    tint: parseColor(color, [1, 1, 1, 1]),\r
    back: parseColor(backgroundColor, [0, 0, 0, 0]),\r
    density: clamp(density, 0.5, 12),\r
    softness: clamp(softness, 0, 1),\r
    dispersion: clamp(dispersion, -1, 1),\r
    distortion: clamp(distortion, 0, 1),\r
    edgeBend: clamp(edgeBend, 0, 1),\r
    angle,\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    rotation,\r
    mouseTilt: clamp(mouseTilt, 0, 1.5),\r
    lightMode,\r
    intro,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms = {};\r
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < count; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const texture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.uniform1i(uniforms.u_image, 0);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      pending: false,\r
      hasImage: false,\r
      imageAspect: 1,\r
      width: 0,\r
      height: 0,\r
      revealStart: -1,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1,\r
      tiltX: 0,\r
      tiltY: 0,\r
      velocityX: 0,\r
      velocityY: 0,\r
      targetX: 0,\r
      targetY: 0,\r
      alive: true\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const base = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      let ratio = Math.max(base, 2);\r
      const pixels = rect.width * rect.height * ratio * ratio;\r
      if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels);\r
      const width = Math.max(1, Math.round(rect.width * ratio));\r
      const height = Math.max(1, Math.round(rect.height * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
      gl.viewport(0, 0, width, height);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      if (state.pending || !state.hasImage) {\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        return;\r
      }\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.u_resolution, state.width, state.height);\r
      gl.uniform1f(uniforms.u_time, state.time);\r
      gl.uniform1f(uniforms.u_imageAspect, state.imageAspect);\r
      gl.uniform1f(uniforms.u_scale, s.scale);\r
      gl.uniform1f(uniforms.u_rotation, s.rotation);\r
      gl.uniform4f(uniforms.u_colorBack, s.back[0], s.back[1], s.back[2], s.back[3]);\r
      gl.uniform4f(uniforms.u_colorTint, s.tint[0], s.tint[1], s.tint[2], s.tint[3]);\r
      gl.uniform1f(uniforms.u_softness, s.softness);\r
      gl.uniform1f(uniforms.u_repetition, s.density);\r
      gl.uniform1f(uniforms.u_shiftRed, s.dispersion);\r
      gl.uniform1f(uniforms.u_shiftBlue, s.dispersion);\r
      gl.uniform1f(uniforms.u_distortion, s.distortion);\r
      gl.uniform1f(uniforms.u_contour, s.edgeBend);\r
      gl.uniform1f(uniforms.u_angle, s.angle);\r
      gl.uniform2f(uniforms.u_tilt, state.tiltX, state.tiltY);\r
      gl.uniform1f(uniforms.u_reveal, state.reveal);\r
      gl.uniform1f(uniforms.u_light, s.lightMode ? 1 : 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = now => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      const moving = !s.paused && !reduce && s.speed !== 0;\r
      if (moving) state.time += dt * s.speed;\r
\r
      let busy = moving;\r
      if (state.reveal < 1 && !state.pending) {\r
        if (state.revealStart < 0) state.revealStart = now;\r
        const progress = clamp((now - state.revealStart) / 1600, 0, 1);\r
        state.reveal = 1 - (1 - progress) ** 3;\r
        if (moving) state.time += dt * 2.4 * (1 - progress) ** 2;\r
        busy = true;\r
      }\r
\r
      const stiffness = 60;\r
      const damping = 14;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        state.velocityX += (stiffness * (state.targetX * s.mouseTilt - state.tiltX) - damping * state.velocityX) * h;\r
        state.velocityY += (stiffness * (state.targetY * s.mouseTilt - state.tiltY) - damping * state.velocityY) * h;\r
        state.tiltX += state.velocityX * h;\r
        state.tiltY += state.velocityY * h;\r
      }\r
      if (\r
        Math.abs(state.targetX * s.mouseTilt - state.tiltX) > 0.0005 ||\r
        Math.abs(state.targetY * s.mouseTilt - state.tiltY) > 0.0005 ||\r
        Math.abs(state.velocityX) + Math.abs(state.velocityY) > 0.0005\r
      ) {\r
        busy = true;\r
      }\r
\r
      draw();\r
      if (busy && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      state.targetX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1.2, 1.2);\r
      state.targetY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1.2, 1.2);\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.targetX = 0;\r
      state.targetY = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
\r
    engineRef.current = {\r
      setPending: value => {\r
        state.pending = value;\r
        draw();\r
      },\r
      setImage: data => {\r
        state.pending = false;\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        if (data) {\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
          gl.generateMipmap(gl.TEXTURE_2D);\r
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
          state.imageAspect = data.width / data.height;\r
          state.hasImage = true;\r
        } else {\r
          gl.texImage2D(\r
            gl.TEXTURE_2D,\r
            0,\r
            gl.RGBA,\r
            1,\r
            1,\r
            0,\r
            gl.RGBA,\r
            gl.UNSIGNED_BYTE,\r
            new Uint8Array([255, 0, 255, 255])\r
          );\r
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
          state.imageAspect = 1;\r
          state.hasImage = false;\r
        }\r
        draw();\r
        wake();\r
      },\r
      wake,\r
      redraw: () => {\r
        resize();\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    draw();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      engineRef.current = null;\r
      gl.deleteTexture(texture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    let active = true;\r
    const source = text ? drawTextSource(text, fontFamily, fontWeight) : imageSrc ? drawImageSource(imageSrc) : null;\r
    if (!source) {\r
      engineRef.current?.setImage(null);\r
      return undefined;\r
    }\r
    engineRef.current?.setPending(true);\r
    source\r
      .then(canvas => {\r
        if (!active || !canvas) return;\r
        const data = processShape(canvas);\r
        if (active) engineRef.current?.setImage(data);\r
      })\r
      .catch(() => {\r
        if (active) engineRef.current?.setImage(null);\r
      });\r
    return () => {\r
      active = false;\r
    };\r
  }, [imageSrc, text, fontFamily, fontWeight]);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`metallic-paint \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="metallic-paint-canvas" />\r
    </div>\r
  );\r
}\r
`,n=`.metallic-paint {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
}\r
\r
.metallic-paint-canvas {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const WORKING_SIZE = 512;\r
const MAX_SIDE = 2048;\r
const MAX_PIXELS = 2560 * 1600 * 2;\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 a_position;\r
uniform vec2 u_resolution;\r
uniform float u_imageAspect;\r
uniform float u_scale;\r
uniform float u_rotation;\r
out vec2 v_imageUV;\r
\r
void main() {\r
  gl_Position = vec4(a_position, 0.0, 1.0);\r
  vec2 uv = a_position * 0.5;\r
  float r = u_rotation * 3.14159265358979323846 / 180.0;\r
  mat2 turn = mat2(cos(r), sin(r), -sin(r), cos(r));\r
  vec2 imageBox;\r
  imageBox.x = min(u_resolution.x / u_imageAspect, u_resolution.y) * u_imageAspect;\r
  imageBox.y = imageBox.x / u_imageAspect;\r
  v_imageUV = uv * (u_resolution / imageBox) / u_scale;\r
  v_imageUV.x *= u_imageAspect;\r
  v_imageUV = turn * v_imageUV;\r
  v_imageUV.x /= u_imageAspect;\r
  v_imageUV += 0.5;\r
  v_imageUV.y = 1.0 - v_imageUV.y;\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D u_image;\r
uniform vec2 u_resolution;\r
uniform float u_time;\r
uniform vec4 u_colorBack;\r
uniform vec4 u_colorTint;\r
uniform float u_softness;\r
uniform float u_repetition;\r
uniform float u_shiftRed;\r
uniform float u_shiftBlue;\r
uniform float u_distortion;\r
uniform float u_contour;\r
uniform float u_angle;\r
uniform vec2 u_tilt;\r
uniform float u_reveal;\r
uniform float u_light;\r
\r
in vec2 v_imageUV;\r
\r
out vec4 fragColor;\r
\r
#define PI 3.14159265358979323846\r
\r
vec2 rotate(vec2 uv, float th) {\r
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;\r
}\r
\r
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }\r
\r
float snoise(vec2 v) {\r
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);\r
  vec2 i = floor(v + dot(v, C.yy));\r
  vec2 x0 = v - i + dot(i, C.xx);\r
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r
  vec4 x12 = x0.xyxy + C.xxzz;\r
  x12.xy -= i1;\r
  i = mod(i, 289.0);\r
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\r
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\r
  m = m * m;\r
  m = m * m;\r
  vec3 x = 2.0 * fract(p * C.www) - 1.0;\r
  vec3 h = abs(x) - 0.5;\r
  vec3 ox = floor(x + 0.5);\r
  vec3 a0 = x - ox;\r
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\r
  vec3 g;\r
  g.x = a0.x * x0.x + h.x * x0.y;\r
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r
  return 130.0 * dot(m, g);\r
}\r
\r
float getColorChanges(float c1, float c2, float stripe, vec3 w, float blur, float bump, float tint) {\r
  float ch = mix(c2, c1, smoothstep(0.0, 2.0 * blur, stripe));\r
  float border = w[0];\r
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));\r
  bump = smoothstep(0.2, 0.8, bump);\r
  border = w[0] + 0.4 * (1.0 - bump) * w[1];\r
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));\r
  border = w[0] + 0.5 * (1.0 - bump) * w[1];\r
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));\r
  border = w[0] + w[1];\r
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));\r
  float gradientT = (stripe - w[0] - w[1]) / w[2];\r
  float gradient = mix(c1, c2, smoothstep(0.0, 1.0, gradientT));\r
  ch = mix(ch, gradient, smoothstep(border, border + 0.5 * blur, stripe));\r
  ch = mix(ch, 1.0 - min(1.0, (1.0 - ch) / max(tint, 0.0001)), u_colorTint.a);\r
  return ch;\r
}\r
\r
float getImgFrame(vec2 uv, float th) {\r
  float frame = 1.0;\r
  frame *= smoothstep(0.0, th, uv.y);\r
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.y);\r
  frame *= smoothstep(0.0, th, uv.x);\r
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.x);\r
  return frame;\r
}\r
\r
float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {\r
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));\r
  vec2 r = radius * texel;\r
  float sum = 4.0 * centerSample;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;\r
  return sum / 16.0;\r
}\r
\r
void main() {\r
  const float firstFrameOffset = 2.8;\r
  float t = 0.3 * (u_time + firstFrameOffset);\r
\r
  vec2 uv = v_imageUV;\r
  vec2 dudx = dFdx(v_imageUV);\r
  vec2 dudy = dFdy(v_imageUV);\r
  vec4 img = textureGrad(u_image, uv, dudx, dudy);\r
\r
  float cycleWidth = u_repetition;\r
\r
  vec2 rotatedUV = uv - vec2(0.5);\r
  float angle = (-u_angle + 70.0) * PI / 180.0;\r
  float cosA = cos(angle);\r
  float sinA = sin(angle);\r
  rotatedUV = vec2(rotatedUV.x * cosA - rotatedUV.y * sinA, rotatedUV.x * sinA + rotatedUV.y * cosA) + vec2(0.5);\r
\r
  float edge = blurEdge3x3(u_image, uv, dudx, dudy, 6.0, img.r);\r
  edge = pow(edge, 1.6);\r
  edge *= smoothstep(0.0, 0.4, u_contour);\r
\r
  float opacity = img.g * getImgFrame(v_imageUV, 0.0);\r
  float depth = img.r;\r
\r
  float diagBLtoTR = rotatedUV.x - rotatedUV.y;\r
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;\r
\r
  vec3 color1 = mix(vec3(0.98, 0.98, 1.0), vec3(0.9, 0.9, 0.93), u_light);\r
  vec3 color2 = vec3(0.1, 0.1, 0.1 + 0.1 * smoothstep(0.7, 1.3, diagTLtoBR));\r
\r
  vec2 gradUV = uv - 0.5 - u_tilt * vec2(0.18, -0.12);\r
  float dist = length(gradUV + vec2(0.0, 0.2 * diagBLtoTR));\r
  gradUV = rotate(gradUV, (0.25 - 0.2 * diagBLtoTR) * PI);\r
  float direction = gradUV.x;\r
\r
  float bump = pow(1.8 * dist, 1.2);\r
  bump = 1.0 - bump;\r
  bump *= pow(uv.y, 0.3);\r
\r
  float thinStrip1 = 0.12 / cycleWidth * (1.0 - 0.4 * bump);\r
  float thinStrip2 = 0.07 / cycleWidth * (1.0 + 0.4 * bump);\r
  float wideStrip = 1.0 - thinStrip1 - thinStrip2;\r
\r
  float noise = snoise(uv - t);\r
  edge += (1.0 - edge) * u_distortion * noise;\r
\r
  direction += diagBLtoTR;\r
  direction -= 2.0 * noise * diagBLtoTR * (smoothstep(0.0, 1.0, edge) * (1.0 - smoothstep(0.0, 1.0, edge)));\r
  direction *= mix(1.0, 1.0 - edge, smoothstep(0.5, 1.0, u_contour));\r
  direction -= 1.7 * edge * smoothstep(0.5, 1.0, u_contour);\r
  direction += 0.2 * pow(u_contour, 4.0) * (1.0 - smoothstep(0.0, 1.0, edge));\r
\r
  bump *= clamp(pow(uv.y, 0.1), 0.3, 1.0);\r
  direction *= 0.1 + (1.1 - edge) * bump;\r
  direction *= 0.4 + 0.6 * (1.0 - smoothstep(0.5, 1.0, edge));\r
  direction += 0.18 * (smoothstep(0.1, 0.2, uv.y) * (1.0 - smoothstep(0.2, 0.4, uv.y)));\r
  direction += 0.03 * (smoothstep(0.1, 0.2, 1.0 - uv.y) * (1.0 - smoothstep(0.2, 0.4, 1.0 - uv.y)));\r
  direction *= 0.5 + 0.5 * pow(uv.y, 2.0);\r
  direction *= cycleWidth;\r
  direction -= t + dot(u_tilt, vec2(0.35, 0.2));\r
\r
  float colorDispersion = clamp(1.0 - bump, 0.0, 1.0);\r
  float dispersionRed = colorDispersion;\r
  dispersionRed += 0.03 * bump * noise;\r
  dispersionRed += 5.0 * (smoothstep(-0.1, 0.2, uv.y) * (1.0 - smoothstep(0.1, 0.5, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 1.0, bump)));\r
  dispersionRed -= diagBLtoTR;\r
\r
  float dispersionBlue = colorDispersion * 1.3;\r
  dispersionBlue += (smoothstep(0.0, 0.4, uv.y) * (1.0 - smoothstep(0.1, 0.8, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 0.8, bump)));\r
  dispersionBlue -= 0.2 * edge;\r
\r
  dispersionRed *= u_shiftRed / 20.0;\r
  dispersionBlue *= u_shiftBlue / 20.0;\r
\r
  float softness = 0.05 * u_softness;\r
  float blur = softness + 0.5 * smoothstep(1.0, 10.0, u_repetition) * smoothstep(0.0, 1.0, edge);\r
  float smallCanvas = 1.0 - smoothstep(100.0, 500.0, min(u_resolution.x, u_resolution.y));\r
  blur += smallCanvas * smoothstep(0.0, 1.0, edge);\r
  float rExtraBlur = softness * (0.05 + 0.1 * (u_shiftRed / 20.0) * bump);\r
  float gExtraBlur = softness * 0.05 / max(0.001, abs(1.0 - diagBLtoTR));\r
\r
  vec3 w = vec3(thinStrip1 * cycleWidth, thinStrip2 * cycleWidth, wideStrip);\r
  w[1] -= 0.02 * smoothstep(0.0, 1.0, edge + bump);\r
  float stripeR = fract(direction + dispersionRed);\r
  float r = getColorChanges(color1.r, color2.r, stripeR, w, blur + fwidth(stripeR) + rExtraBlur, bump, u_colorTint.r);\r
  float stripeG = fract(direction);\r
  float g = getColorChanges(color1.g, color2.g, stripeG, w, blur + fwidth(stripeG) + gExtraBlur, bump, u_colorTint.g);\r
  float stripeB = fract(direction - dispersionBlue);\r
  float b = getColorChanges(color1.b, color2.b, stripeB, w, blur + fwidth(stripeB), bump, u_colorTint.b);\r
\r
  vec3 sheen = mix(vec3(1.0), u_colorTint.rgb, 0.45 * u_colorTint.a);\r
  r *= sheen.r;\r
  g *= sheen.g;\r
  b *= sheen.b;\r
\r
  float rim = smoothstep(0.78, 1.0, depth) * u_light;\r
  r *= 1.0 - rim * 0.62;\r
  g *= 1.0 - rim * 0.62;\r
  b *= 1.0 - rim * 0.58;\r
\r
  float pour = u_reveal * 1.25 - 0.1;\r
  opacity *= smoothstep(1.0 - pour, 1.15 - pour, depth) * smoothstep(0.0, 0.25, u_reveal);\r
\r
  vec3 color = vec3(r, g, b) * opacity;\r
  vec3 back = u_colorBack.rgb * u_colorBack.a;\r
  color += back * (1.0 - opacity);\r
  opacity += u_colorBack.a * (1.0 - opacity);\r
  color += 1.0 / 256.0 * (fract(sin(dot(0.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5);\r
  fragColor = vec4(color, opacity);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (() => {\r
  let context = null;\r
  return (value, fallback) => {\r
    if (typeof document === 'undefined') return fallback;\r
    context ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = 'rgba(0, 0, 0, 0)';\r
    context.fillStyle = String(value);\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255, a / 255];\r
  };\r
})();\r
\r
const loadImage = src =>\r
  new Promise((resolve, reject) => {\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.onload = () => resolve(image);\r
    image.onerror = () => reject(new Error('MetallicPaint: failed to load the image'));\r
    image.src = src;\r
  });\r
\r
const isVector = async src => {\r
  if (/\\.svg($|[?#])/i.test(src) || src.startsWith('data:image/svg+xml')) return true;\r
  if (!src.startsWith('blob:')) return false;\r
  try {\r
    const blob = await (await fetch(src)).blob();\r
    return blob.type === 'image/svg+xml';\r
  } catch {\r
    return false;\r
  }\r
};\r
\r
const drawImageSource = async src => {\r
  const [image, vector] = await Promise.all([loadImage(src), isVector(src)]);\r
  let width = image.naturalWidth || image.width || MAX_SIDE;\r
  let height = image.naturalHeight || image.height || MAX_SIDE;\r
  const longest = Math.max(width, height);\r
  const fit = vector ? MAX_SIDE / longest : clamp(1024 / longest, 1, MAX_SIDE / longest);\r
  width = Math.max(1, Math.round(width * fit));\r
  height = Math.max(1, Math.round(height * fit));\r
  const canvas = document.createElement('canvas');\r
  canvas.width = width;\r
  canvas.height = height;\r
  const ctx = canvas.getContext('2d', { willReadFrequently: true });\r
  ctx.drawImage(image, 0, 0, width, height);\r
  const data = ctx.getImageData(0, 0, width, height);\r
  let opaque = true;\r
  for (let i = 3; i < data.data.length; i += 4) {\r
    if (data.data[i] < 250) {\r
      opaque = false;\r
      break;\r
    }\r
  }\r
  if (opaque) {\r
    for (let i = 0; i < data.data.length; i += 4) {\r
      const light = Math.min(data.data[i], data.data[i + 1], data.data[i + 2]);\r
      data.data[i + 3] = Math.round(clamp((250 - light) / 30, 0, 1) * 255);\r
    }\r
    ctx.putImageData(data, 0, 0);\r
  }\r
  return canvas;\r
};\r
\r
const drawTextSource = async (text, fontFamily, fontWeight) => {\r
  const size = 320;\r
  const font = \`\${fontWeight} \${size}px \${fontFamily}\`;\r
  try {\r
    await document.fonts?.load(font, text);\r
  } catch {\r
    return null;\r
  }\r
  const probe = document.createElement('canvas').getContext('2d');\r
  probe.font = font;\r
  const metrics = probe.measureText(text);\r
  const ascent = metrics.actualBoundingBoxAscent || size * 0.8;\r
  const descent = metrics.actualBoundingBoxDescent || size * 0.2;\r
  const left = metrics.actualBoundingBoxLeft || 0;\r
  const right = metrics.actualBoundingBoxRight || metrics.width;\r
  const pad = size * 0.12;\r
  const canvas = document.createElement('canvas');\r
  canvas.width = Math.ceil(left + right + pad * 2);\r
  canvas.height = Math.ceil(ascent + descent + pad * 2);\r
  const ctx = canvas.getContext('2d');\r
  ctx.font = font;\r
  ctx.fillStyle = '#000';\r
  ctx.textBaseline = 'alphabetic';\r
  ctx.fillText(text, pad + left, pad + ascent);\r
  return canvas;\r
};\r
\r
const solvePoisson = (mask, width, height) => {\r
  const interior = [];\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      const i = y * width + x;\r
      if (!mask[i]) continue;\r
      const boundary =\r
        x === 0 ||\r
        y === 0 ||\r
        x === width - 1 ||\r
        y === height - 1 ||\r
        !mask[i - 1] ||\r
        !mask[i + 1] ||\r
        !mask[i - width] ||\r
        !mask[i + width] ||\r
        !mask[i - width - 1] ||\r
        !mask[i - width + 1] ||\r
        !mask[i + width - 1] ||\r
        !mask[i + width + 1];\r
      if (!boundary) interior.push(i);\r
    }\r
  }\r
  const field = new Float32Array(width * height);\r
  const red = [];\r
  const black = [];\r
  interior.forEach(i => (((i % width) + Math.floor(i / width)) % 2 === 0 ? red.push(i) : black.push(i)));\r
  const relax = list => {\r
    for (let k = 0; k < list.length; k++) {\r
      const i = list[k];\r
      const sum = field[i + 1] + field[i - 1] + field[i - width] + field[i + width];\r
      field[i] = 1.9 * ((0.01 + sum) / 4) - 0.9 * field[i];\r
    }\r
  };\r
  for (let iteration = 0; iteration < 40; iteration++) {\r
    relax(red);\r
    relax(black);\r
  }\r
  let peak = 0;\r
  interior.forEach(i => {\r
    if (field[i] > peak) peak = field[i];\r
  });\r
  return { field, peak: peak || 1 };\r
};\r
\r
const processShape = source => {\r
  const width = source.width;\r
  const height = source.height;\r
  const fit = WORKING_SIZE / Math.min(width, height);\r
  const workW = Math.max(2, Math.round(width * fit));\r
  const workH = Math.max(2, Math.round(height * fit));\r
\r
  const small = document.createElement('canvas');\r
  small.width = workW;\r
  small.height = workH;\r
  const smallCtx = small.getContext('2d', { willReadFrequently: true });\r
  smallCtx.drawImage(source, 0, 0, workW, workH);\r
  const smallData = smallCtx.getImageData(0, 0, workW, workH).data;\r
  const mask = new Uint8Array(workW * workH);\r
  for (let i = 0; i < mask.length; i++) mask[i] = smallData[i * 4 + 3] > 0 ? 1 : 0;\r
\r
  const { field, peak } = solvePoisson(mask, workW, workH);\r
  const gradient = smallCtx.createImageData(workW, workH);\r
  for (let i = 0; i < mask.length; i++) {\r
    const p = i * 4;\r
    const value = mask[i] ? 255 * (1 - field[i] / peak) : 255;\r
    gradient.data[p] = value;\r
    gradient.data[p + 1] = value;\r
    gradient.data[p + 2] = value;\r
    gradient.data[p + 3] = mask[i] ? 255 : 0;\r
  }\r
  smallCtx.putImageData(gradient, 0, 0);\r
\r
  const out = document.createElement('canvas');\r
  out.width = width;\r
  out.height = height;\r
  const outCtx = out.getContext('2d', { willReadFrequently: true });\r
  outCtx.imageSmoothingEnabled = true;\r
  outCtx.imageSmoothingQuality = 'high';\r
  outCtx.drawImage(small, 0, 0, workW, workH, 0, 0, width, height);\r
  const result = outCtx.getImageData(0, 0, width, height);\r
  const original = source.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height).data;\r
  for (let i = 0; i < result.data.length; i += 4) {\r
    const alpha = original[i + 3];\r
    if (alpha === 0) {\r
      result.data[i] = 255;\r
      result.data[i + 1] = 0;\r
    } else {\r
      result.data[i] = result.data[i + 3] === 0 ? 0 : result.data[i];\r
      result.data[i + 1] = alpha;\r
    }\r
    result.data[i + 2] = 255;\r
    result.data[i + 3] = 255;\r
  }\r
  return result;\r
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
export default function MetallicPaint({\r
  imageSrc,\r
  text,\r
  fontFamily = 'system-ui, sans-serif',\r
  fontWeight = 800,\r
  color = '#ffffff',\r
  backgroundColor = 'transparent',\r
  density = 2,\r
  softness = 0.1,\r
  dispersion = 0.3,\r
  distortion = 0.07,\r
  edgeBend = 0.6,\r
  angle = 70,\r
  speed = 1,\r
  scale = 0.6,\r
  rotation = 0,\r
  mouseTilt = 0.5,\r
  lightMode = false,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}) {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const settingsRef = useRef(null);\r
\r
  settingsRef.current = {\r
    tint: parseColor(color, [1, 1, 1, 1]),\r
    back: parseColor(backgroundColor, [0, 0, 0, 0]),\r
    density: clamp(density, 0.5, 12),\r
    softness: clamp(softness, 0, 1),\r
    dispersion: clamp(dispersion, -1, 1),\r
    distortion: clamp(distortion, 0, 1),\r
    edgeBend: clamp(edgeBend, 0, 1),\r
    angle,\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    rotation,\r
    mouseTilt: clamp(mouseTilt, 0, 1.5),\r
    lightMode,\r
    intro,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms = {};\r
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < count; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const texture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.uniform1i(uniforms.u_image, 0);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      pending: false,\r
      hasImage: false,\r
      imageAspect: 1,\r
      width: 0,\r
      height: 0,\r
      revealStart: -1,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1,\r
      tiltX: 0,\r
      tiltY: 0,\r
      velocityX: 0,\r
      velocityY: 0,\r
      targetX: 0,\r
      targetY: 0,\r
      alive: true\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const base = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      let ratio = Math.max(base, 2);\r
      const pixels = rect.width * rect.height * ratio * ratio;\r
      if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels);\r
      const width = Math.max(1, Math.round(rect.width * ratio));\r
      const height = Math.max(1, Math.round(rect.height * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
      gl.viewport(0, 0, width, height);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      if (state.pending || !state.hasImage) {\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        return;\r
      }\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.u_resolution, state.width, state.height);\r
      gl.uniform1f(uniforms.u_time, state.time);\r
      gl.uniform1f(uniforms.u_imageAspect, state.imageAspect);\r
      gl.uniform1f(uniforms.u_scale, s.scale);\r
      gl.uniform1f(uniforms.u_rotation, s.rotation);\r
      gl.uniform4f(uniforms.u_colorBack, s.back[0], s.back[1], s.back[2], s.back[3]);\r
      gl.uniform4f(uniforms.u_colorTint, s.tint[0], s.tint[1], s.tint[2], s.tint[3]);\r
      gl.uniform1f(uniforms.u_softness, s.softness);\r
      gl.uniform1f(uniforms.u_repetition, s.density);\r
      gl.uniform1f(uniforms.u_shiftRed, s.dispersion);\r
      gl.uniform1f(uniforms.u_shiftBlue, s.dispersion);\r
      gl.uniform1f(uniforms.u_distortion, s.distortion);\r
      gl.uniform1f(uniforms.u_contour, s.edgeBend);\r
      gl.uniform1f(uniforms.u_angle, s.angle);\r
      gl.uniform2f(uniforms.u_tilt, state.tiltX, state.tiltY);\r
      gl.uniform1f(uniforms.u_reveal, state.reveal);\r
      gl.uniform1f(uniforms.u_light, s.lightMode ? 1 : 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = now => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      const moving = !s.paused && !reduce && s.speed !== 0;\r
      if (moving) state.time += dt * s.speed;\r
\r
      let busy = moving;\r
      if (state.reveal < 1 && !state.pending) {\r
        if (state.revealStart < 0) state.revealStart = now;\r
        const progress = clamp((now - state.revealStart) / 1600, 0, 1);\r
        state.reveal = 1 - (1 - progress) ** 3;\r
        if (moving) state.time += dt * 2.4 * (1 - progress) ** 2;\r
        busy = true;\r
      }\r
\r
      const stiffness = 60;\r
      const damping = 14;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        state.velocityX += (stiffness * (state.targetX * s.mouseTilt - state.tiltX) - damping * state.velocityX) * h;\r
        state.velocityY += (stiffness * (state.targetY * s.mouseTilt - state.tiltY) - damping * state.velocityY) * h;\r
        state.tiltX += state.velocityX * h;\r
        state.tiltY += state.velocityY * h;\r
      }\r
      if (\r
        Math.abs(state.targetX * s.mouseTilt - state.tiltX) > 0.0005 ||\r
        Math.abs(state.targetY * s.mouseTilt - state.tiltY) > 0.0005 ||\r
        Math.abs(state.velocityX) + Math.abs(state.velocityY) > 0.0005\r
      ) {\r
        busy = true;\r
      }\r
\r
      draw();\r
      if (busy && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      state.targetX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1.2, 1.2);\r
      state.targetY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1.2, 1.2);\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.targetX = 0;\r
      state.targetY = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = event => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
\r
    engineRef.current = {\r
      setPending: value => {\r
        state.pending = value;\r
        draw();\r
      },\r
      setImage: data => {\r
        state.pending = false;\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        if (data) {\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
          gl.generateMipmap(gl.TEXTURE_2D);\r
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
          state.imageAspect = data.width / data.height;\r
          state.hasImage = true;\r
        } else {\r
          gl.texImage2D(\r
            gl.TEXTURE_2D,\r
            0,\r
            gl.RGBA,\r
            1,\r
            1,\r
            0,\r
            gl.RGBA,\r
            gl.UNSIGNED_BYTE,\r
            new Uint8Array([255, 0, 255, 255])\r
          );\r
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
          state.imageAspect = 1;\r
          state.hasImage = false;\r
        }\r
        draw();\r
        wake();\r
      },\r
      wake,\r
      redraw: () => {\r
        resize();\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    draw();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      engineRef.current = null;\r
      gl.deleteTexture(texture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    let active = true;\r
    const source = text ? drawTextSource(text, fontFamily, fontWeight) : imageSrc ? drawImageSource(imageSrc) : null;\r
    if (!source) {\r
      engineRef.current?.setImage(null);\r
      return undefined;\r
    }\r
    engineRef.current?.setPending(true);\r
    source\r
      .then(canvas => {\r
        if (!active || !canvas) return;\r
        const data = processShape(canvas);\r
        if (active) engineRef.current?.setImage(data);\r
      })\r
      .catch(() => {\r
        if (active) engineRef.current?.setImage(null);\r
      });\r
    return () => {\r
      active = false;\r
    };\r
  }, [imageSrc, text, fontFamily, fontWeight]);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="block h-full w-full" />\r
    </div>\r
  );\r
}\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
import './MetallicPaint.css';\r
\r
export interface MetallicPaintProps {\r
  imageSrc?: string;\r
  text?: string;\r
  fontFamily?: string;\r
  fontWeight?: number | string;\r
  color?: string;\r
  backgroundColor?: string;\r
  density?: number;\r
  softness?: number;\r
  dispersion?: number;\r
  distortion?: number;\r
  edgeBend?: number;\r
  angle?: number;\r
  speed?: number;\r
  scale?: number;\r
  rotation?: number;\r
  mouseTilt?: number;\r
  lightMode?: boolean;\r
  intro?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Rgba = number[];\r
\r
interface Settings {\r
  tint: Rgba;\r
  back: Rgba;\r
  density: number;\r
  softness: number;\r
  dispersion: number;\r
  distortion: number;\r
  edgeBend: number;\r
  angle: number;\r
  speed: number;\r
  scale: number;\r
  rotation: number;\r
  mouseTilt: number;\r
  lightMode: boolean;\r
  intro: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
}\r
\r
interface Engine {\r
  setPending: (value: boolean) => void;\r
  setImage: (data: ImageData | null) => void;\r
  wake: () => void;\r
  redraw: () => void;\r
}\r
\r
const WORKING_SIZE = 512;\r
const MAX_SIDE = 2048;\r
const MAX_PIXELS = 2560 * 1600 * 2;\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 a_position;\r
uniform vec2 u_resolution;\r
uniform float u_imageAspect;\r
uniform float u_scale;\r
uniform float u_rotation;\r
out vec2 v_imageUV;\r
\r
void main() {\r
  gl_Position = vec4(a_position, 0.0, 1.0);\r
  vec2 uv = a_position * 0.5;\r
  float r = u_rotation * 3.14159265358979323846 / 180.0;\r
  mat2 turn = mat2(cos(r), sin(r), -sin(r), cos(r));\r
  vec2 imageBox;\r
  imageBox.x = min(u_resolution.x / u_imageAspect, u_resolution.y) * u_imageAspect;\r
  imageBox.y = imageBox.x / u_imageAspect;\r
  v_imageUV = uv * (u_resolution / imageBox) / u_scale;\r
  v_imageUV.x *= u_imageAspect;\r
  v_imageUV = turn * v_imageUV;\r
  v_imageUV.x /= u_imageAspect;\r
  v_imageUV += 0.5;\r
  v_imageUV.y = 1.0 - v_imageUV.y;\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D u_image;\r
uniform vec2 u_resolution;\r
uniform float u_time;\r
uniform vec4 u_colorBack;\r
uniform vec4 u_colorTint;\r
uniform float u_softness;\r
uniform float u_repetition;\r
uniform float u_shiftRed;\r
uniform float u_shiftBlue;\r
uniform float u_distortion;\r
uniform float u_contour;\r
uniform float u_angle;\r
uniform vec2 u_tilt;\r
uniform float u_reveal;\r
uniform float u_light;\r
\r
in vec2 v_imageUV;\r
\r
out vec4 fragColor;\r
\r
#define PI 3.14159265358979323846\r
\r
vec2 rotate(vec2 uv, float th) {\r
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;\r
}\r
\r
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }\r
\r
float snoise(vec2 v) {\r
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);\r
  vec2 i = floor(v + dot(v, C.yy));\r
  vec2 x0 = v - i + dot(i, C.xx);\r
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r
  vec4 x12 = x0.xyxy + C.xxzz;\r
  x12.xy -= i1;\r
  i = mod(i, 289.0);\r
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\r
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\r
  m = m * m;\r
  m = m * m;\r
  vec3 x = 2.0 * fract(p * C.www) - 1.0;\r
  vec3 h = abs(x) - 0.5;\r
  vec3 ox = floor(x + 0.5);\r
  vec3 a0 = x - ox;\r
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\r
  vec3 g;\r
  g.x = a0.x * x0.x + h.x * x0.y;\r
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r
  return 130.0 * dot(m, g);\r
}\r
\r
float getColorChanges(float c1, float c2, float stripe, vec3 w, float blur, float bump, float tint) {\r
  float ch = mix(c2, c1, smoothstep(0.0, 2.0 * blur, stripe));\r
  float border = w[0];\r
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));\r
  bump = smoothstep(0.2, 0.8, bump);\r
  border = w[0] + 0.4 * (1.0 - bump) * w[1];\r
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));\r
  border = w[0] + 0.5 * (1.0 - bump) * w[1];\r
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));\r
  border = w[0] + w[1];\r
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));\r
  float gradientT = (stripe - w[0] - w[1]) / w[2];\r
  float gradient = mix(c1, c2, smoothstep(0.0, 1.0, gradientT));\r
  ch = mix(ch, gradient, smoothstep(border, border + 0.5 * blur, stripe));\r
  ch = mix(ch, 1.0 - min(1.0, (1.0 - ch) / max(tint, 0.0001)), u_colorTint.a);\r
  return ch;\r
}\r
\r
float getImgFrame(vec2 uv, float th) {\r
  float frame = 1.0;\r
  frame *= smoothstep(0.0, th, uv.y);\r
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.y);\r
  frame *= smoothstep(0.0, th, uv.x);\r
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.x);\r
  return frame;\r
}\r
\r
float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {\r
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));\r
  vec2 r = radius * texel;\r
  float sum = 4.0 * centerSample;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;\r
  return sum / 16.0;\r
}\r
\r
void main() {\r
  const float firstFrameOffset = 2.8;\r
  float t = 0.3 * (u_time + firstFrameOffset);\r
\r
  vec2 uv = v_imageUV;\r
  vec2 dudx = dFdx(v_imageUV);\r
  vec2 dudy = dFdy(v_imageUV);\r
  vec4 img = textureGrad(u_image, uv, dudx, dudy);\r
\r
  float cycleWidth = u_repetition;\r
\r
  vec2 rotatedUV = uv - vec2(0.5);\r
  float angle = (-u_angle + 70.0) * PI / 180.0;\r
  float cosA = cos(angle);\r
  float sinA = sin(angle);\r
  rotatedUV = vec2(rotatedUV.x * cosA - rotatedUV.y * sinA, rotatedUV.x * sinA + rotatedUV.y * cosA) + vec2(0.5);\r
\r
  float edge = blurEdge3x3(u_image, uv, dudx, dudy, 6.0, img.r);\r
  edge = pow(edge, 1.6);\r
  edge *= smoothstep(0.0, 0.4, u_contour);\r
\r
  float opacity = img.g * getImgFrame(v_imageUV, 0.0);\r
  float depth = img.r;\r
\r
  float diagBLtoTR = rotatedUV.x - rotatedUV.y;\r
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;\r
\r
  vec3 color1 = mix(vec3(0.98, 0.98, 1.0), vec3(0.9, 0.9, 0.93), u_light);\r
  vec3 color2 = vec3(0.1, 0.1, 0.1 + 0.1 * smoothstep(0.7, 1.3, diagTLtoBR));\r
\r
  vec2 gradUV = uv - 0.5 - u_tilt * vec2(0.18, -0.12);\r
  float dist = length(gradUV + vec2(0.0, 0.2 * diagBLtoTR));\r
  gradUV = rotate(gradUV, (0.25 - 0.2 * diagBLtoTR) * PI);\r
  float direction = gradUV.x;\r
\r
  float bump = pow(1.8 * dist, 1.2);\r
  bump = 1.0 - bump;\r
  bump *= pow(uv.y, 0.3);\r
\r
  float thinStrip1 = 0.12 / cycleWidth * (1.0 - 0.4 * bump);\r
  float thinStrip2 = 0.07 / cycleWidth * (1.0 + 0.4 * bump);\r
  float wideStrip = 1.0 - thinStrip1 - thinStrip2;\r
\r
  float noise = snoise(uv - t);\r
  edge += (1.0 - edge) * u_distortion * noise;\r
\r
  direction += diagBLtoTR;\r
  direction -= 2.0 * noise * diagBLtoTR * (smoothstep(0.0, 1.0, edge) * (1.0 - smoothstep(0.0, 1.0, edge)));\r
  direction *= mix(1.0, 1.0 - edge, smoothstep(0.5, 1.0, u_contour));\r
  direction -= 1.7 * edge * smoothstep(0.5, 1.0, u_contour);\r
  direction += 0.2 * pow(u_contour, 4.0) * (1.0 - smoothstep(0.0, 1.0, edge));\r
\r
  bump *= clamp(pow(uv.y, 0.1), 0.3, 1.0);\r
  direction *= 0.1 + (1.1 - edge) * bump;\r
  direction *= 0.4 + 0.6 * (1.0 - smoothstep(0.5, 1.0, edge));\r
  direction += 0.18 * (smoothstep(0.1, 0.2, uv.y) * (1.0 - smoothstep(0.2, 0.4, uv.y)));\r
  direction += 0.03 * (smoothstep(0.1, 0.2, 1.0 - uv.y) * (1.0 - smoothstep(0.2, 0.4, 1.0 - uv.y)));\r
  direction *= 0.5 + 0.5 * pow(uv.y, 2.0);\r
  direction *= cycleWidth;\r
  direction -= t + dot(u_tilt, vec2(0.35, 0.2));\r
\r
  float colorDispersion = clamp(1.0 - bump, 0.0, 1.0);\r
  float dispersionRed = colorDispersion;\r
  dispersionRed += 0.03 * bump * noise;\r
  dispersionRed += 5.0 * (smoothstep(-0.1, 0.2, uv.y) * (1.0 - smoothstep(0.1, 0.5, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 1.0, bump)));\r
  dispersionRed -= diagBLtoTR;\r
\r
  float dispersionBlue = colorDispersion * 1.3;\r
  dispersionBlue += (smoothstep(0.0, 0.4, uv.y) * (1.0 - smoothstep(0.1, 0.8, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 0.8, bump)));\r
  dispersionBlue -= 0.2 * edge;\r
\r
  dispersionRed *= u_shiftRed / 20.0;\r
  dispersionBlue *= u_shiftBlue / 20.0;\r
\r
  float softness = 0.05 * u_softness;\r
  float blur = softness + 0.5 * smoothstep(1.0, 10.0, u_repetition) * smoothstep(0.0, 1.0, edge);\r
  float smallCanvas = 1.0 - smoothstep(100.0, 500.0, min(u_resolution.x, u_resolution.y));\r
  blur += smallCanvas * smoothstep(0.0, 1.0, edge);\r
  float rExtraBlur = softness * (0.05 + 0.1 * (u_shiftRed / 20.0) * bump);\r
  float gExtraBlur = softness * 0.05 / max(0.001, abs(1.0 - diagBLtoTR));\r
\r
  vec3 w = vec3(thinStrip1 * cycleWidth, thinStrip2 * cycleWidth, wideStrip);\r
  w[1] -= 0.02 * smoothstep(0.0, 1.0, edge + bump);\r
  float stripeR = fract(direction + dispersionRed);\r
  float r = getColorChanges(color1.r, color2.r, stripeR, w, blur + fwidth(stripeR) + rExtraBlur, bump, u_colorTint.r);\r
  float stripeG = fract(direction);\r
  float g = getColorChanges(color1.g, color2.g, stripeG, w, blur + fwidth(stripeG) + gExtraBlur, bump, u_colorTint.g);\r
  float stripeB = fract(direction - dispersionBlue);\r
  float b = getColorChanges(color1.b, color2.b, stripeB, w, blur + fwidth(stripeB), bump, u_colorTint.b);\r
\r
  vec3 sheen = mix(vec3(1.0), u_colorTint.rgb, 0.45 * u_colorTint.a);\r
  r *= sheen.r;\r
  g *= sheen.g;\r
  b *= sheen.b;\r
\r
  float rim = smoothstep(0.78, 1.0, depth) * u_light;\r
  r *= 1.0 - rim * 0.62;\r
  g *= 1.0 - rim * 0.62;\r
  b *= 1.0 - rim * 0.58;\r
\r
  float pour = u_reveal * 1.25 - 0.1;\r
  opacity *= smoothstep(1.0 - pour, 1.15 - pour, depth) * smoothstep(0.0, 0.25, u_reveal);\r
\r
  vec3 color = vec3(r, g, b) * opacity;\r
  vec3 back = u_colorBack.rgb * u_colorBack.a;\r
  color += back * (1.0 - opacity);\r
  opacity += u_colorBack.a * (1.0 - opacity);\r
  color += 1.0 / 256.0 * (fract(sin(dot(0.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5);\r
  fragColor = vec4(color, opacity);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (() => {\r
  let context: CanvasRenderingContext2D | null = null;\r
  return (value: string, fallback: Rgba): Rgba => {\r
    if (typeof document === 'undefined') return fallback;\r
    context ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = 'rgba(0, 0, 0, 0)';\r
    context.fillStyle = String(value);\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255, a / 255];\r
  };\r
})();\r
\r
const loadImage = (src: string) =>\r
  new Promise<HTMLImageElement>((resolve, reject) => {\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.onload = () => resolve(image);\r
    image.onerror = () => reject(new Error('MetallicPaint: failed to load the image'));\r
    image.src = src;\r
  });\r
\r
const isVector = async (src: string): Promise<boolean> => {\r
  if (/\\.svg($|[?#])/i.test(src) || src.startsWith('data:image/svg+xml')) return true;\r
  if (!src.startsWith('blob:')) return false;\r
  try {\r
    const blob = await (await fetch(src)).blob();\r
    return blob.type === 'image/svg+xml';\r
  } catch {\r
    return false;\r
  }\r
};\r
\r
const drawImageSource = async (src: string): Promise<HTMLCanvasElement> => {\r
  const [image, vector] = await Promise.all([loadImage(src), isVector(src)]);\r
  let width = image.naturalWidth || image.width || MAX_SIDE;\r
  let height = image.naturalHeight || image.height || MAX_SIDE;\r
  const longest = Math.max(width, height);\r
  const fit = vector ? MAX_SIDE / longest : clamp(1024 / longest, 1, MAX_SIDE / longest);\r
  width = Math.max(1, Math.round(width * fit));\r
  height = Math.max(1, Math.round(height * fit));\r
  const canvas = document.createElement('canvas');\r
  canvas.width = width;\r
  canvas.height = height;\r
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;\r
  ctx.drawImage(image, 0, 0, width, height);\r
  const data = ctx.getImageData(0, 0, width, height);\r
  let opaque = true;\r
  for (let i = 3; i < data.data.length; i += 4) {\r
    if (data.data[i] < 250) {\r
      opaque = false;\r
      break;\r
    }\r
  }\r
  if (opaque) {\r
    for (let i = 0; i < data.data.length; i += 4) {\r
      const light = Math.min(data.data[i], data.data[i + 1], data.data[i + 2]);\r
      data.data[i + 3] = Math.round(clamp((250 - light) / 30, 0, 1) * 255);\r
    }\r
    ctx.putImageData(data, 0, 0);\r
  }\r
  return canvas;\r
};\r
\r
const drawTextSource = async (\r
  text: string,\r
  fontFamily: string,\r
  fontWeight: number | string\r
): Promise<HTMLCanvasElement | null> => {\r
  const size = 320;\r
  const font = \`\${fontWeight} \${size}px \${fontFamily}\`;\r
  try {\r
    await document.fonts?.load(font, text);\r
  } catch {\r
    return null;\r
  }\r
  const probe = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;\r
  probe.font = font;\r
  const metrics = probe.measureText(text);\r
  const ascent = metrics.actualBoundingBoxAscent || size * 0.8;\r
  const descent = metrics.actualBoundingBoxDescent || size * 0.2;\r
  const left = metrics.actualBoundingBoxLeft || 0;\r
  const right = metrics.actualBoundingBoxRight || metrics.width;\r
  const pad = size * 0.12;\r
  const canvas = document.createElement('canvas');\r
  canvas.width = Math.ceil(left + right + pad * 2);\r
  canvas.height = Math.ceil(ascent + descent + pad * 2);\r
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;\r
  ctx.font = font;\r
  ctx.fillStyle = '#000';\r
  ctx.textBaseline = 'alphabetic';\r
  ctx.fillText(text, pad + left, pad + ascent);\r
  return canvas;\r
};\r
\r
const solvePoisson = (mask: Uint8Array, width: number, height: number) => {\r
  const interior: number[] = [];\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      const i = y * width + x;\r
      if (!mask[i]) continue;\r
      const boundary =\r
        x === 0 ||\r
        y === 0 ||\r
        x === width - 1 ||\r
        y === height - 1 ||\r
        !mask[i - 1] ||\r
        !mask[i + 1] ||\r
        !mask[i - width] ||\r
        !mask[i + width] ||\r
        !mask[i - width - 1] ||\r
        !mask[i - width + 1] ||\r
        !mask[i + width - 1] ||\r
        !mask[i + width + 1];\r
      if (!boundary) interior.push(i);\r
    }\r
  }\r
  const field = new Float32Array(width * height);\r
  const red: number[] = [];\r
  const black: number[] = [];\r
  interior.forEach(i => (((i % width) + Math.floor(i / width)) % 2 === 0 ? red.push(i) : black.push(i)));\r
  const relax = (list: number[]) => {\r
    for (let k = 0; k < list.length; k++) {\r
      const i = list[k];\r
      const sum = field[i + 1] + field[i - 1] + field[i - width] + field[i + width];\r
      field[i] = 1.9 * ((0.01 + sum) / 4) - 0.9 * field[i];\r
    }\r
  };\r
  for (let iteration = 0; iteration < 40; iteration++) {\r
    relax(red);\r
    relax(black);\r
  }\r
  let peak = 0;\r
  interior.forEach(i => {\r
    if (field[i] > peak) peak = field[i];\r
  });\r
  return { field, peak: peak || 1 };\r
};\r
\r
const processShape = (source: HTMLCanvasElement): ImageData => {\r
  const width = source.width;\r
  const height = source.height;\r
  const fit = WORKING_SIZE / Math.min(width, height);\r
  const workW = Math.max(2, Math.round(width * fit));\r
  const workH = Math.max(2, Math.round(height * fit));\r
\r
  const small = document.createElement('canvas');\r
  small.width = workW;\r
  small.height = workH;\r
  const smallCtx = small.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;\r
  smallCtx.drawImage(source, 0, 0, workW, workH);\r
  const smallData = smallCtx.getImageData(0, 0, workW, workH).data;\r
  const mask = new Uint8Array(workW * workH);\r
  for (let i = 0; i < mask.length; i++) mask[i] = smallData[i * 4 + 3] > 0 ? 1 : 0;\r
\r
  const { field, peak } = solvePoisson(mask, workW, workH);\r
  const gradient = smallCtx.createImageData(workW, workH);\r
  for (let i = 0; i < mask.length; i++) {\r
    const p = i * 4;\r
    const value = mask[i] ? 255 * (1 - field[i] / peak) : 255;\r
    gradient.data[p] = value;\r
    gradient.data[p + 1] = value;\r
    gradient.data[p + 2] = value;\r
    gradient.data[p + 3] = mask[i] ? 255 : 0;\r
  }\r
  smallCtx.putImageData(gradient, 0, 0);\r
\r
  const out = document.createElement('canvas');\r
  out.width = width;\r
  out.height = height;\r
  const outCtx = out.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;\r
  outCtx.imageSmoothingEnabled = true;\r
  outCtx.imageSmoothingQuality = 'high';\r
  outCtx.drawImage(small, 0, 0, workW, workH, 0, 0, width, height);\r
  const result = outCtx.getImageData(0, 0, width, height);\r
  const original = (source.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D).getImageData(\r
    0,\r
    0,\r
    width,\r
    height\r
  ).data;\r
  for (let i = 0; i < result.data.length; i += 4) {\r
    const alpha = original[i + 3];\r
    if (alpha === 0) {\r
      result.data[i] = 255;\r
      result.data[i + 1] = 0;\r
    } else {\r
      result.data[i] = result.data[i + 3] === 0 ? 0 : result.data[i];\r
      result.data[i + 1] = alpha;\r
    }\r
    result.data[i + 2] = 255;\r
    result.data[i + 3] = 255;\r
  }\r
  return result;\r
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
export default function MetallicPaint({\r
  imageSrc,\r
  text,\r
  fontFamily = 'system-ui, sans-serif',\r
  fontWeight = 800,\r
  color = '#ffffff',\r
  backgroundColor = 'transparent',\r
  density = 2,\r
  softness = 0.1,\r
  dispersion = 0.3,\r
  distortion = 0.07,\r
  edgeBend = 0.6,\r
  angle = 70,\r
  speed = 1,\r
  scale = 0.6,\r
  rotation = 0,\r
  mouseTilt = 0.5,\r
  lightMode = false,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: MetallicPaintProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<Engine | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
\r
  settingsRef.current = {\r
    tint: parseColor(color, [1, 1, 1, 1]),\r
    back: parseColor(backgroundColor, [0, 0, 0, 0]),\r
    density: clamp(density, 0.5, 12),\r
    softness: clamp(softness, 0, 1),\r
    dispersion: clamp(dispersion, -1, 1),\r
    distortion: clamp(distortion, 0, 1),\r
    edgeBend: clamp(edgeBend, 0, 1),\r
    angle,\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    rotation,\r
    mouseTilt: clamp(mouseTilt, 0, 1.5),\r
    lightMode,\r
    intro,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < count; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const texture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.uniform1i(uniforms.u_image, 0);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      pending: false,\r
      hasImage: false,\r
      imageAspect: 1,\r
      width: 0,\r
      height: 0,\r
      revealStart: -1,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1,\r
      tiltX: 0,\r
      tiltY: 0,\r
      velocityX: 0,\r
      velocityY: 0,\r
      targetX: 0,\r
      targetY: 0,\r
      alive: true\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const base = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      let ratio = Math.max(base, 2);\r
      const pixels = rect.width * rect.height * ratio * ratio;\r
      if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels);\r
      const width = Math.max(1, Math.round(rect.width * ratio));\r
      const height = Math.max(1, Math.round(rect.height * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
      gl.viewport(0, 0, width, height);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      if (state.pending || !state.hasImage) {\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        return;\r
      }\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.u_resolution, state.width, state.height);\r
      gl.uniform1f(uniforms.u_time, state.time);\r
      gl.uniform1f(uniforms.u_imageAspect, state.imageAspect);\r
      gl.uniform1f(uniforms.u_scale, s.scale);\r
      gl.uniform1f(uniforms.u_rotation, s.rotation);\r
      gl.uniform4f(uniforms.u_colorBack, s.back[0], s.back[1], s.back[2], s.back[3]);\r
      gl.uniform4f(uniforms.u_colorTint, s.tint[0], s.tint[1], s.tint[2], s.tint[3]);\r
      gl.uniform1f(uniforms.u_softness, s.softness);\r
      gl.uniform1f(uniforms.u_repetition, s.density);\r
      gl.uniform1f(uniforms.u_shiftRed, s.dispersion);\r
      gl.uniform1f(uniforms.u_shiftBlue, s.dispersion);\r
      gl.uniform1f(uniforms.u_distortion, s.distortion);\r
      gl.uniform1f(uniforms.u_contour, s.edgeBend);\r
      gl.uniform1f(uniforms.u_angle, s.angle);\r
      gl.uniform2f(uniforms.u_tilt, state.tiltX, state.tiltY);\r
      gl.uniform1f(uniforms.u_reveal, state.reveal);\r
      gl.uniform1f(uniforms.u_light, s.lightMode ? 1 : 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = (now: number) => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      const moving = !s.paused && !reduce && s.speed !== 0;\r
      if (moving) state.time += dt * s.speed;\r
\r
      let busy = moving;\r
      if (state.reveal < 1 && !state.pending) {\r
        if (state.revealStart < 0) state.revealStart = now;\r
        const progress = clamp((now - state.revealStart) / 1600, 0, 1);\r
        state.reveal = 1 - (1 - progress) ** 3;\r
        if (moving) state.time += dt * 2.4 * (1 - progress) ** 2;\r
        busy = true;\r
      }\r
\r
      const stiffness = 60;\r
      const damping = 14;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        state.velocityX += (stiffness * (state.targetX * s.mouseTilt - state.tiltX) - damping * state.velocityX) * h;\r
        state.velocityY += (stiffness * (state.targetY * s.mouseTilt - state.tiltY) - damping * state.velocityY) * h;\r
        state.tiltX += state.velocityX * h;\r
        state.tiltY += state.velocityY * h;\r
      }\r
      if (\r
        Math.abs(state.targetX * s.mouseTilt - state.tiltX) > 0.0005 ||\r
        Math.abs(state.targetY * s.mouseTilt - state.tiltY) > 0.0005 ||\r
        Math.abs(state.velocityX) + Math.abs(state.velocityY) > 0.0005\r
      ) {\r
        busy = true;\r
      }\r
\r
      draw();\r
      if (busy && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      state.targetX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1.2, 1.2);\r
      state.targetY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1.2, 1.2);\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.targetX = 0;\r
      state.targetY = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
\r
    engineRef.current = {\r
      setPending: (value: boolean) => {\r
        state.pending = value;\r
        draw();\r
      },\r
      setImage: (data: ImageData | null) => {\r
        state.pending = false;\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        if (data) {\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
          gl.generateMipmap(gl.TEXTURE_2D);\r
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
          state.imageAspect = data.width / data.height;\r
          state.hasImage = true;\r
        } else {\r
          gl.texImage2D(\r
            gl.TEXTURE_2D,\r
            0,\r
            gl.RGBA,\r
            1,\r
            1,\r
            0,\r
            gl.RGBA,\r
            gl.UNSIGNED_BYTE,\r
            new Uint8Array([255, 0, 255, 255])\r
          );\r
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
          state.imageAspect = 1;\r
          state.hasImage = false;\r
        }\r
        draw();\r
        wake();\r
      },\r
      wake,\r
      redraw: () => {\r
        resize();\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    draw();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      engineRef.current = null;\r
      gl.deleteTexture(texture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    let active = true;\r
    const source = text ? drawTextSource(text, fontFamily, fontWeight) : imageSrc ? drawImageSource(imageSrc) : null;\r
    if (!source) {\r
      engineRef.current?.setImage(null);\r
      return undefined;\r
    }\r
    engineRef.current?.setPending(true);\r
    source\r
      .then(canvas => {\r
        if (!active || !canvas) return;\r
        const data = processShape(canvas);\r
        if (active) engineRef.current?.setImage(data);\r
      })\r
      .catch(() => {\r
        if (active) engineRef.current?.setImage(null);\r
      });\r
    return () => {\r
      active = false;\r
    };\r
  }, [imageSrc, text, fontFamily, fontWeight]);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`metallic-paint \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="metallic-paint-canvas" />\r
    </div>\r
  );\r
}\r
`,a=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
export interface MetallicPaintProps {\r
  imageSrc?: string;\r
  text?: string;\r
  fontFamily?: string;\r
  fontWeight?: number | string;\r
  color?: string;\r
  backgroundColor?: string;\r
  density?: number;\r
  softness?: number;\r
  dispersion?: number;\r
  distortion?: number;\r
  edgeBend?: number;\r
  angle?: number;\r
  speed?: number;\r
  scale?: number;\r
  rotation?: number;\r
  mouseTilt?: number;\r
  lightMode?: boolean;\r
  intro?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Rgba = number[];\r
\r
interface Settings {\r
  tint: Rgba;\r
  back: Rgba;\r
  density: number;\r
  softness: number;\r
  dispersion: number;\r
  distortion: number;\r
  edgeBend: number;\r
  angle: number;\r
  speed: number;\r
  scale: number;\r
  rotation: number;\r
  mouseTilt: number;\r
  lightMode: boolean;\r
  intro: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
}\r
\r
interface Engine {\r
  setPending: (value: boolean) => void;\r
  setImage: (data: ImageData | null) => void;\r
  wake: () => void;\r
  redraw: () => void;\r
}\r
\r
const WORKING_SIZE = 512;\r
const MAX_SIDE = 2048;\r
const MAX_PIXELS = 2560 * 1600 * 2;\r
\r
const VERTEX = \`#version 300 es\r
layout(location = 0) in vec2 a_position;\r
uniform vec2 u_resolution;\r
uniform float u_imageAspect;\r
uniform float u_scale;\r
uniform float u_rotation;\r
out vec2 v_imageUV;\r
\r
void main() {\r
  gl_Position = vec4(a_position, 0.0, 1.0);\r
  vec2 uv = a_position * 0.5;\r
  float r = u_rotation * 3.14159265358979323846 / 180.0;\r
  mat2 turn = mat2(cos(r), sin(r), -sin(r), cos(r));\r
  vec2 imageBox;\r
  imageBox.x = min(u_resolution.x / u_imageAspect, u_resolution.y) * u_imageAspect;\r
  imageBox.y = imageBox.x / u_imageAspect;\r
  v_imageUV = uv * (u_resolution / imageBox) / u_scale;\r
  v_imageUV.x *= u_imageAspect;\r
  v_imageUV = turn * v_imageUV;\r
  v_imageUV.x /= u_imageAspect;\r
  v_imageUV += 0.5;\r
  v_imageUV.y = 1.0 - v_imageUV.y;\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
\r
uniform sampler2D u_image;\r
uniform vec2 u_resolution;\r
uniform float u_time;\r
uniform vec4 u_colorBack;\r
uniform vec4 u_colorTint;\r
uniform float u_softness;\r
uniform float u_repetition;\r
uniform float u_shiftRed;\r
uniform float u_shiftBlue;\r
uniform float u_distortion;\r
uniform float u_contour;\r
uniform float u_angle;\r
uniform vec2 u_tilt;\r
uniform float u_reveal;\r
uniform float u_light;\r
\r
in vec2 v_imageUV;\r
\r
out vec4 fragColor;\r
\r
#define PI 3.14159265358979323846\r
\r
vec2 rotate(vec2 uv, float th) {\r
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;\r
}\r
\r
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }\r
\r
float snoise(vec2 v) {\r
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);\r
  vec2 i = floor(v + dot(v, C.yy));\r
  vec2 x0 = v - i + dot(i, C.xx);\r
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r
  vec4 x12 = x0.xyxy + C.xxzz;\r
  x12.xy -= i1;\r
  i = mod(i, 289.0);\r
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\r
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\r
  m = m * m;\r
  m = m * m;\r
  vec3 x = 2.0 * fract(p * C.www) - 1.0;\r
  vec3 h = abs(x) - 0.5;\r
  vec3 ox = floor(x + 0.5);\r
  vec3 a0 = x - ox;\r
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\r
  vec3 g;\r
  g.x = a0.x * x0.x + h.x * x0.y;\r
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r
  return 130.0 * dot(m, g);\r
}\r
\r
float getColorChanges(float c1, float c2, float stripe, vec3 w, float blur, float bump, float tint) {\r
  float ch = mix(c2, c1, smoothstep(0.0, 2.0 * blur, stripe));\r
  float border = w[0];\r
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));\r
  bump = smoothstep(0.2, 0.8, bump);\r
  border = w[0] + 0.4 * (1.0 - bump) * w[1];\r
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));\r
  border = w[0] + 0.5 * (1.0 - bump) * w[1];\r
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));\r
  border = w[0] + w[1];\r
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));\r
  float gradientT = (stripe - w[0] - w[1]) / w[2];\r
  float gradient = mix(c1, c2, smoothstep(0.0, 1.0, gradientT));\r
  ch = mix(ch, gradient, smoothstep(border, border + 0.5 * blur, stripe));\r
  ch = mix(ch, 1.0 - min(1.0, (1.0 - ch) / max(tint, 0.0001)), u_colorTint.a);\r
  return ch;\r
}\r
\r
float getImgFrame(vec2 uv, float th) {\r
  float frame = 1.0;\r
  frame *= smoothstep(0.0, th, uv.y);\r
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.y);\r
  frame *= smoothstep(0.0, th, uv.x);\r
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.x);\r
  return frame;\r
}\r
\r
float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {\r
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));\r
  vec2 r = radius * texel;\r
  float sum = 4.0 * centerSample;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;\r
  sum += 2.0 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;\r
  sum += textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;\r
  return sum / 16.0;\r
}\r
\r
void main() {\r
  const float firstFrameOffset = 2.8;\r
  float t = 0.3 * (u_time + firstFrameOffset);\r
\r
  vec2 uv = v_imageUV;\r
  vec2 dudx = dFdx(v_imageUV);\r
  vec2 dudy = dFdy(v_imageUV);\r
  vec4 img = textureGrad(u_image, uv, dudx, dudy);\r
\r
  float cycleWidth = u_repetition;\r
\r
  vec2 rotatedUV = uv - vec2(0.5);\r
  float angle = (-u_angle + 70.0) * PI / 180.0;\r
  float cosA = cos(angle);\r
  float sinA = sin(angle);\r
  rotatedUV = vec2(rotatedUV.x * cosA - rotatedUV.y * sinA, rotatedUV.x * sinA + rotatedUV.y * cosA) + vec2(0.5);\r
\r
  float edge = blurEdge3x3(u_image, uv, dudx, dudy, 6.0, img.r);\r
  edge = pow(edge, 1.6);\r
  edge *= smoothstep(0.0, 0.4, u_contour);\r
\r
  float opacity = img.g * getImgFrame(v_imageUV, 0.0);\r
  float depth = img.r;\r
\r
  float diagBLtoTR = rotatedUV.x - rotatedUV.y;\r
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;\r
\r
  vec3 color1 = mix(vec3(0.98, 0.98, 1.0), vec3(0.9, 0.9, 0.93), u_light);\r
  vec3 color2 = vec3(0.1, 0.1, 0.1 + 0.1 * smoothstep(0.7, 1.3, diagTLtoBR));\r
\r
  vec2 gradUV = uv - 0.5 - u_tilt * vec2(0.18, -0.12);\r
  float dist = length(gradUV + vec2(0.0, 0.2 * diagBLtoTR));\r
  gradUV = rotate(gradUV, (0.25 - 0.2 * diagBLtoTR) * PI);\r
  float direction = gradUV.x;\r
\r
  float bump = pow(1.8 * dist, 1.2);\r
  bump = 1.0 - bump;\r
  bump *= pow(uv.y, 0.3);\r
\r
  float thinStrip1 = 0.12 / cycleWidth * (1.0 - 0.4 * bump);\r
  float thinStrip2 = 0.07 / cycleWidth * (1.0 + 0.4 * bump);\r
  float wideStrip = 1.0 - thinStrip1 - thinStrip2;\r
\r
  float noise = snoise(uv - t);\r
  edge += (1.0 - edge) * u_distortion * noise;\r
\r
  direction += diagBLtoTR;\r
  direction -= 2.0 * noise * diagBLtoTR * (smoothstep(0.0, 1.0, edge) * (1.0 - smoothstep(0.0, 1.0, edge)));\r
  direction *= mix(1.0, 1.0 - edge, smoothstep(0.5, 1.0, u_contour));\r
  direction -= 1.7 * edge * smoothstep(0.5, 1.0, u_contour);\r
  direction += 0.2 * pow(u_contour, 4.0) * (1.0 - smoothstep(0.0, 1.0, edge));\r
\r
  bump *= clamp(pow(uv.y, 0.1), 0.3, 1.0);\r
  direction *= 0.1 + (1.1 - edge) * bump;\r
  direction *= 0.4 + 0.6 * (1.0 - smoothstep(0.5, 1.0, edge));\r
  direction += 0.18 * (smoothstep(0.1, 0.2, uv.y) * (1.0 - smoothstep(0.2, 0.4, uv.y)));\r
  direction += 0.03 * (smoothstep(0.1, 0.2, 1.0 - uv.y) * (1.0 - smoothstep(0.2, 0.4, 1.0 - uv.y)));\r
  direction *= 0.5 + 0.5 * pow(uv.y, 2.0);\r
  direction *= cycleWidth;\r
  direction -= t + dot(u_tilt, vec2(0.35, 0.2));\r
\r
  float colorDispersion = clamp(1.0 - bump, 0.0, 1.0);\r
  float dispersionRed = colorDispersion;\r
  dispersionRed += 0.03 * bump * noise;\r
  dispersionRed += 5.0 * (smoothstep(-0.1, 0.2, uv.y) * (1.0 - smoothstep(0.1, 0.5, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 1.0, bump)));\r
  dispersionRed -= diagBLtoTR;\r
\r
  float dispersionBlue = colorDispersion * 1.3;\r
  dispersionBlue += (smoothstep(0.0, 0.4, uv.y) * (1.0 - smoothstep(0.1, 0.8, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 0.8, bump)));\r
  dispersionBlue -= 0.2 * edge;\r
\r
  dispersionRed *= u_shiftRed / 20.0;\r
  dispersionBlue *= u_shiftBlue / 20.0;\r
\r
  float softness = 0.05 * u_softness;\r
  float blur = softness + 0.5 * smoothstep(1.0, 10.0, u_repetition) * smoothstep(0.0, 1.0, edge);\r
  float smallCanvas = 1.0 - smoothstep(100.0, 500.0, min(u_resolution.x, u_resolution.y));\r
  blur += smallCanvas * smoothstep(0.0, 1.0, edge);\r
  float rExtraBlur = softness * (0.05 + 0.1 * (u_shiftRed / 20.0) * bump);\r
  float gExtraBlur = softness * 0.05 / max(0.001, abs(1.0 - diagBLtoTR));\r
\r
  vec3 w = vec3(thinStrip1 * cycleWidth, thinStrip2 * cycleWidth, wideStrip);\r
  w[1] -= 0.02 * smoothstep(0.0, 1.0, edge + bump);\r
  float stripeR = fract(direction + dispersionRed);\r
  float r = getColorChanges(color1.r, color2.r, stripeR, w, blur + fwidth(stripeR) + rExtraBlur, bump, u_colorTint.r);\r
  float stripeG = fract(direction);\r
  float g = getColorChanges(color1.g, color2.g, stripeG, w, blur + fwidth(stripeG) + gExtraBlur, bump, u_colorTint.g);\r
  float stripeB = fract(direction - dispersionBlue);\r
  float b = getColorChanges(color1.b, color2.b, stripeB, w, blur + fwidth(stripeB), bump, u_colorTint.b);\r
\r
  vec3 sheen = mix(vec3(1.0), u_colorTint.rgb, 0.45 * u_colorTint.a);\r
  r *= sheen.r;\r
  g *= sheen.g;\r
  b *= sheen.b;\r
\r
  float rim = smoothstep(0.78, 1.0, depth) * u_light;\r
  r *= 1.0 - rim * 0.62;\r
  g *= 1.0 - rim * 0.62;\r
  b *= 1.0 - rim * 0.58;\r
\r
  float pour = u_reveal * 1.25 - 0.1;\r
  opacity *= smoothstep(1.0 - pour, 1.15 - pour, depth) * smoothstep(0.0, 0.25, u_reveal);\r
\r
  vec3 color = vec3(r, g, b) * opacity;\r
  vec3 back = u_colorBack.rgb * u_colorBack.a;\r
  color += back * (1.0 - opacity);\r
  opacity += u_colorBack.a * (1.0 - opacity);\r
  color += 1.0 / 256.0 * (fract(sin(dot(0.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5);\r
  fragColor = vec4(color, opacity);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const parseColor = (() => {\r
  let context: CanvasRenderingContext2D | null = null;\r
  return (value: string, fallback: Rgba): Rgba => {\r
    if (typeof document === 'undefined') return fallback;\r
    context ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    if (!context) return fallback;\r
    context.clearRect(0, 0, 1, 1);\r
    context.fillStyle = 'rgba(0, 0, 0, 0)';\r
    context.fillStyle = String(value);\r
    context.fillRect(0, 0, 1, 1);\r
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;\r
    return [r / 255, g / 255, b / 255, a / 255];\r
  };\r
})();\r
\r
const loadImage = (src: string) =>\r
  new Promise<HTMLImageElement>((resolve, reject) => {\r
    const image = new Image();\r
    image.crossOrigin = 'anonymous';\r
    image.onload = () => resolve(image);\r
    image.onerror = () => reject(new Error('MetallicPaint: failed to load the image'));\r
    image.src = src;\r
  });\r
\r
const isVector = async (src: string): Promise<boolean> => {\r
  if (/\\.svg($|[?#])/i.test(src) || src.startsWith('data:image/svg+xml')) return true;\r
  if (!src.startsWith('blob:')) return false;\r
  try {\r
    const blob = await (await fetch(src)).blob();\r
    return blob.type === 'image/svg+xml';\r
  } catch {\r
    return false;\r
  }\r
};\r
\r
const drawImageSource = async (src: string): Promise<HTMLCanvasElement> => {\r
  const [image, vector] = await Promise.all([loadImage(src), isVector(src)]);\r
  let width = image.naturalWidth || image.width || MAX_SIDE;\r
  let height = image.naturalHeight || image.height || MAX_SIDE;\r
  const longest = Math.max(width, height);\r
  const fit = vector ? MAX_SIDE / longest : clamp(1024 / longest, 1, MAX_SIDE / longest);\r
  width = Math.max(1, Math.round(width * fit));\r
  height = Math.max(1, Math.round(height * fit));\r
  const canvas = document.createElement('canvas');\r
  canvas.width = width;\r
  canvas.height = height;\r
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;\r
  ctx.drawImage(image, 0, 0, width, height);\r
  const data = ctx.getImageData(0, 0, width, height);\r
  let opaque = true;\r
  for (let i = 3; i < data.data.length; i += 4) {\r
    if (data.data[i] < 250) {\r
      opaque = false;\r
      break;\r
    }\r
  }\r
  if (opaque) {\r
    for (let i = 0; i < data.data.length; i += 4) {\r
      const light = Math.min(data.data[i], data.data[i + 1], data.data[i + 2]);\r
      data.data[i + 3] = Math.round(clamp((250 - light) / 30, 0, 1) * 255);\r
    }\r
    ctx.putImageData(data, 0, 0);\r
  }\r
  return canvas;\r
};\r
\r
const drawTextSource = async (\r
  text: string,\r
  fontFamily: string,\r
  fontWeight: number | string\r
): Promise<HTMLCanvasElement | null> => {\r
  const size = 320;\r
  const font = \`\${fontWeight} \${size}px \${fontFamily}\`;\r
  try {\r
    await document.fonts?.load(font, text);\r
  } catch {\r
    return null;\r
  }\r
  const probe = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;\r
  probe.font = font;\r
  const metrics = probe.measureText(text);\r
  const ascent = metrics.actualBoundingBoxAscent || size * 0.8;\r
  const descent = metrics.actualBoundingBoxDescent || size * 0.2;\r
  const left = metrics.actualBoundingBoxLeft || 0;\r
  const right = metrics.actualBoundingBoxRight || metrics.width;\r
  const pad = size * 0.12;\r
  const canvas = document.createElement('canvas');\r
  canvas.width = Math.ceil(left + right + pad * 2);\r
  canvas.height = Math.ceil(ascent + descent + pad * 2);\r
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;\r
  ctx.font = font;\r
  ctx.fillStyle = '#000';\r
  ctx.textBaseline = 'alphabetic';\r
  ctx.fillText(text, pad + left, pad + ascent);\r
  return canvas;\r
};\r
\r
const solvePoisson = (mask: Uint8Array, width: number, height: number) => {\r
  const interior: number[] = [];\r
  for (let y = 0; y < height; y++) {\r
    for (let x = 0; x < width; x++) {\r
      const i = y * width + x;\r
      if (!mask[i]) continue;\r
      const boundary =\r
        x === 0 ||\r
        y === 0 ||\r
        x === width - 1 ||\r
        y === height - 1 ||\r
        !mask[i - 1] ||\r
        !mask[i + 1] ||\r
        !mask[i - width] ||\r
        !mask[i + width] ||\r
        !mask[i - width - 1] ||\r
        !mask[i - width + 1] ||\r
        !mask[i + width - 1] ||\r
        !mask[i + width + 1];\r
      if (!boundary) interior.push(i);\r
    }\r
  }\r
  const field = new Float32Array(width * height);\r
  const red: number[] = [];\r
  const black: number[] = [];\r
  interior.forEach(i => (((i % width) + Math.floor(i / width)) % 2 === 0 ? red.push(i) : black.push(i)));\r
  const relax = (list: number[]) => {\r
    for (let k = 0; k < list.length; k++) {\r
      const i = list[k];\r
      const sum = field[i + 1] + field[i - 1] + field[i - width] + field[i + width];\r
      field[i] = 1.9 * ((0.01 + sum) / 4) - 0.9 * field[i];\r
    }\r
  };\r
  for (let iteration = 0; iteration < 40; iteration++) {\r
    relax(red);\r
    relax(black);\r
  }\r
  let peak = 0;\r
  interior.forEach(i => {\r
    if (field[i] > peak) peak = field[i];\r
  });\r
  return { field, peak: peak || 1 };\r
};\r
\r
const processShape = (source: HTMLCanvasElement): ImageData => {\r
  const width = source.width;\r
  const height = source.height;\r
  const fit = WORKING_SIZE / Math.min(width, height);\r
  const workW = Math.max(2, Math.round(width * fit));\r
  const workH = Math.max(2, Math.round(height * fit));\r
\r
  const small = document.createElement('canvas');\r
  small.width = workW;\r
  small.height = workH;\r
  const smallCtx = small.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;\r
  smallCtx.drawImage(source, 0, 0, workW, workH);\r
  const smallData = smallCtx.getImageData(0, 0, workW, workH).data;\r
  const mask = new Uint8Array(workW * workH);\r
  for (let i = 0; i < mask.length; i++) mask[i] = smallData[i * 4 + 3] > 0 ? 1 : 0;\r
\r
  const { field, peak } = solvePoisson(mask, workW, workH);\r
  const gradient = smallCtx.createImageData(workW, workH);\r
  for (let i = 0; i < mask.length; i++) {\r
    const p = i * 4;\r
    const value = mask[i] ? 255 * (1 - field[i] / peak) : 255;\r
    gradient.data[p] = value;\r
    gradient.data[p + 1] = value;\r
    gradient.data[p + 2] = value;\r
    gradient.data[p + 3] = mask[i] ? 255 : 0;\r
  }\r
  smallCtx.putImageData(gradient, 0, 0);\r
\r
  const out = document.createElement('canvas');\r
  out.width = width;\r
  out.height = height;\r
  const outCtx = out.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;\r
  outCtx.imageSmoothingEnabled = true;\r
  outCtx.imageSmoothingQuality = 'high';\r
  outCtx.drawImage(small, 0, 0, workW, workH, 0, 0, width, height);\r
  const result = outCtx.getImageData(0, 0, width, height);\r
  const original = (source.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D).getImageData(\r
    0,\r
    0,\r
    width,\r
    height\r
  ).data;\r
  for (let i = 0; i < result.data.length; i += 4) {\r
    const alpha = original[i + 3];\r
    if (alpha === 0) {\r
      result.data[i] = 255;\r
      result.data[i + 1] = 0;\r
    } else {\r
      result.data[i] = result.data[i + 3] === 0 ? 0 : result.data[i];\r
      result.data[i + 1] = alpha;\r
    }\r
    result.data[i + 2] = 255;\r
    result.data[i + 3] = 255;\r
  }\r
  return result;\r
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
export default function MetallicPaint({\r
  imageSrc,\r
  text,\r
  fontFamily = 'system-ui, sans-serif',\r
  fontWeight = 800,\r
  color = '#ffffff',\r
  backgroundColor = 'transparent',\r
  density = 2,\r
  softness = 0.1,\r
  dispersion = 0.3,\r
  distortion = 0.07,\r
  edgeBend = 0.6,\r
  angle = 70,\r
  speed = 1,\r
  scale = 0.6,\r
  rotation = 0,\r
  mouseTilt = 0.5,\r
  lightMode = false,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: MetallicPaintProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<Engine | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
\r
  settingsRef.current = {\r
    tint: parseColor(color, [1, 1, 1, 1]),\r
    back: parseColor(backgroundColor, [0, 0, 0, 0]),\r
    density: clamp(density, 0.5, 12),\r
    softness: clamp(softness, 0, 1),\r
    dispersion: clamp(dispersion, -1, 1),\r
    distortion: clamp(distortion, 0, 1),\r
    edgeBend: clamp(edgeBend, 0, 1),\r
    angle,\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    rotation,\r
    mouseTilt: clamp(mouseTilt, 0, 1.5),\r
    lightMode,\r
    intro,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!gl) return undefined;\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    gl.deleteShader(vertex);\r
    gl.deleteShader(fragment);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
    for (let i = 0; i < count; i++) {\r
      const info = gl.getActiveUniform(program, i);\r
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
    }\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
\r
    const texture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, texture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.uniform1i(uniforms.u_image, 0);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      pending: false,\r
      hasImage: false,\r
      imageAspect: 1,\r
      width: 0,\r
      height: 0,\r
      revealStart: -1,\r
      reveal: settingsRef.current.intro && !reduce ? 0 : 1,\r
      tiltX: 0,\r
      tiltY: 0,\r
      velocityX: 0,\r
      velocityY: 0,\r
      targetX: 0,\r
      targetY: 0,\r
      alive: true\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const rect = container.getBoundingClientRect();\r
      const base = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      let ratio = Math.max(base, 2);\r
      const pixels = rect.width * rect.height * ratio * ratio;\r
      if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels);\r
      const width = Math.max(1, Math.round(rect.width * ratio));\r
      const height = Math.max(1, Math.round(rect.height * ratio));\r
      if (width === state.width && height === state.height) return;\r
      state.width = width;\r
      state.height = height;\r
      canvas.width = width;\r
      canvas.height = height;\r
      gl.viewport(0, 0, width, height);\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      if (state.pending || !state.hasImage) {\r
        gl.clearColor(0, 0, 0, 0);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
        return;\r
      }\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.u_resolution, state.width, state.height);\r
      gl.uniform1f(uniforms.u_time, state.time);\r
      gl.uniform1f(uniforms.u_imageAspect, state.imageAspect);\r
      gl.uniform1f(uniforms.u_scale, s.scale);\r
      gl.uniform1f(uniforms.u_rotation, s.rotation);\r
      gl.uniform4f(uniforms.u_colorBack, s.back[0], s.back[1], s.back[2], s.back[3]);\r
      gl.uniform4f(uniforms.u_colorTint, s.tint[0], s.tint[1], s.tint[2], s.tint[3]);\r
      gl.uniform1f(uniforms.u_softness, s.softness);\r
      gl.uniform1f(uniforms.u_repetition, s.density);\r
      gl.uniform1f(uniforms.u_shiftRed, s.dispersion);\r
      gl.uniform1f(uniforms.u_shiftBlue, s.dispersion);\r
      gl.uniform1f(uniforms.u_distortion, s.distortion);\r
      gl.uniform1f(uniforms.u_contour, s.edgeBend);\r
      gl.uniform1f(uniforms.u_angle, s.angle);\r
      gl.uniform2f(uniforms.u_tilt, state.tiltX, state.tiltY);\r
      gl.uniform1f(uniforms.u_reveal, state.reveal);\r
      gl.uniform1f(uniforms.u_light, s.lightMode ? 1 : 0);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);\r
    };\r
\r
    const frame = (now: number) => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      const moving = !s.paused && !reduce && s.speed !== 0;\r
      if (moving) state.time += dt * s.speed;\r
\r
      let busy = moving;\r
      if (state.reveal < 1 && !state.pending) {\r
        if (state.revealStart < 0) state.revealStart = now;\r
        const progress = clamp((now - state.revealStart) / 1600, 0, 1);\r
        state.reveal = 1 - (1 - progress) ** 3;\r
        if (moving) state.time += dt * 2.4 * (1 - progress) ** 2;\r
        busy = true;\r
      }\r
\r
      const stiffness = 60;\r
      const damping = 14;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      for (let i = 0; i < steps; i++) {\r
        state.velocityX += (stiffness * (state.targetX * s.mouseTilt - state.tiltX) - damping * state.velocityX) * h;\r
        state.velocityY += (stiffness * (state.targetY * s.mouseTilt - state.tiltY) - damping * state.velocityY) * h;\r
        state.tiltX += state.velocityX * h;\r
        state.tiltY += state.velocityY * h;\r
      }\r
      if (\r
        Math.abs(state.targetX * s.mouseTilt - state.tiltX) > 0.0005 ||\r
        Math.abs(state.targetY * s.mouseTilt - state.tiltY) > 0.0005 ||\r
        Math.abs(state.velocityX) + Math.abs(state.velocityY) > 0.0005\r
      ) {\r
        busy = true;\r
      }\r
\r
      draw();\r
      if (busy && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      state.targetX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1.2, 1.2);\r
      state.targetY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1.2, 1.2);\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      state.targetX = 0;\r
      state.targetY = 0;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    const onLost = (event: Event) => {\r
      event.preventDefault();\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
    };\r
\r
    canvas.addEventListener('webglcontextlost', onLost);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
\r
    engineRef.current = {\r
      setPending: (value: boolean) => {\r
        state.pending = value;\r
        draw();\r
      },\r
      setImage: (data: ImageData | null) => {\r
        state.pending = false;\r
        gl.bindTexture(gl.TEXTURE_2D, texture);\r
        if (data) {\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
          gl.generateMipmap(gl.TEXTURE_2D);\r
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
          state.imageAspect = data.width / data.height;\r
          state.hasImage = true;\r
        } else {\r
          gl.texImage2D(\r
            gl.TEXTURE_2D,\r
            0,\r
            gl.RGBA,\r
            1,\r
            1,\r
            0,\r
            gl.RGBA,\r
            gl.UNSIGNED_BYTE,\r
            new Uint8Array([255, 0, 255, 255])\r
          );\r
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
          state.imageAspect = 1;\r
          state.hasImage = false;\r
        }\r
        draw();\r
        wake();\r
      },\r
      wake,\r
      redraw: () => {\r
        resize();\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    draw();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      canvas.removeEventListener('webglcontextlost', onLost);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      engineRef.current = null;\r
      gl.deleteTexture(texture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    let active = true;\r
    const source = text ? drawTextSource(text, fontFamily, fontWeight) : imageSrc ? drawImageSource(imageSrc) : null;\r
    if (!source) {\r
      engineRef.current?.setImage(null);\r
      return undefined;\r
    }\r
    engineRef.current?.setPending(true);\r
    source\r
      .then(canvas => {\r
        if (!active || !canvas) return;\r
        const data = processShape(canvas);\r
        if (active) engineRef.current?.setImage(data);\r
      })\r
      .catch(() => {\r
        if (active) engineRef.current?.setImage(null);\r
      });\r
    return () => {\r
      active = false;\r
    };\r
  }, [imageSrc, text, fontFamily, fontWeight]);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full \${className}\`.trim()} style={style}>\r
      <canvas ref={canvasRef} className="block h-full w-full" />\r
    </div>\r
  );\r
}\r
`,i={usage:`import MetallicPaint from './MetallicPaint';
import logo from './logo.svg';

<div style={{ width: '100%', height: 500 }}>
  <MetallicPaint imageSrc={logo} />
</div>

<div style={{ width: '100%', height: 300 }}>
  <MetallicPaint text="Liquid" color="#f2c46b" edgeBend={0.9} />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{i as metallicPaint};
