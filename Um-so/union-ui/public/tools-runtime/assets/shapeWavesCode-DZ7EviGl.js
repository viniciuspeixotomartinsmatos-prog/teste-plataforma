const r=`'use client';\r
\r
// Inspired by https://vercel.com/labs\r
import { useEffect, useRef, useState } from 'react';\r
import { effect, frame, init, sampler, storage, surface, target, uniforms } from 'vgpu';\r
\r
import './ShapeWaves.css';\r
\r
const SHAPE_MODES = { mixed: 0, squares: 1, circles: 2, triangles: 3 };\r
const MAX_DPR = 2;\r
const MAX_MASK_SIZE = 1024;\r
const NOISE_CELLS = 32;\r
const TIME_RATE = 0.1;\r
const SIMULATION_STEP = 1 / 60;\r
const WAVE_SPEED = 0.42;\r
const WAVE_FRICTION = 0.94;\r
const WAVE_DECAY = 0.972;\r
const SETTLED_THRESHOLD = 0.01;\r
const INTRO_BAND = 0.2;\r
const INTRO_WARP = 0.3;\r
const INTRO_JITTER = 0.16;\r
const INTRO_END = 1 + INTRO_WARP + INTRO_JITTER + INTRO_BAND;\r
\r
const NOISE_WGSL = \`\r
fn mod289v3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
fn mod289v4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
fn permute(x: vec4f) -> vec4f { return mod289v4(((x * 34.0) + 10.0) * x); }\r
fn taylorInvSqrt(r: vec4f) -> vec4f { return 1.79284291400159 - 0.85373472095314 * r; }\r
fn fadeCurve(t: vec3f) -> vec3f { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\r
\r
fn cnoise(P: vec3f) -> f32 {\r
  var Pi0 = floor(P);\r
  var Pi1 = Pi0 + vec3f(1.0);\r
  Pi0 = mod289v3(Pi0);\r
  Pi1 = mod289v3(Pi1);\r
  let Pf0 = fract(P);\r
  let Pf1 = Pf0 - vec3f(1.0);\r
  let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\r
  let iy = vec4f(Pi0.yy, Pi1.yy);\r
  let iz0 = Pi0.zzzz;\r
  let iz1 = Pi1.zzzz;\r
\r
  let ixy = permute(permute(ix) + iy);\r
  let ixy0 = permute(ixy + iz0);\r
  let ixy1 = permute(ixy + iz1);\r
\r
  var gx0 = ixy0 * (1.0 / 7.0);\r
  var gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\r
  gx0 = fract(gx0);\r
  let gz0 = vec4f(0.5) - abs(gx0) - abs(gy0);\r
  let sz0 = step(gz0, vec4f(0.0));\r
  gx0 -= sz0 * (step(vec4f(0.0), gx0) - 0.5);\r
  gy0 -= sz0 * (step(vec4f(0.0), gy0) - 0.5);\r
\r
  var gx1 = ixy1 * (1.0 / 7.0);\r
  var gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\r
  gx1 = fract(gx1);\r
  let gz1 = vec4f(0.5) - abs(gx1) - abs(gy1);\r
  let sz1 = step(gz1, vec4f(0.0));\r
  gx1 -= sz1 * (step(vec4f(0.0), gx1) - 0.5);\r
  gy1 -= sz1 * (step(vec4f(0.0), gy1) - 0.5);\r
\r
  var g000 = vec3f(gx0.x, gy0.x, gz0.x);\r
  var g100 = vec3f(gx0.y, gy0.y, gz0.y);\r
  var g010 = vec3f(gx0.z, gy0.z, gz0.z);\r
  var g110 = vec3f(gx0.w, gy0.w, gz0.w);\r
  var g001 = vec3f(gx1.x, gy1.x, gz1.x);\r
  var g101 = vec3f(gx1.y, gy1.y, gz1.y);\r
  var g011 = vec3f(gx1.z, gy1.z, gz1.z);\r
  var g111 = vec3f(gx1.w, gy1.w, gz1.w);\r
\r
  let norm0 = taylorInvSqrt(vec4f(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\r
  g000 *= norm0.x;\r
  g010 *= norm0.y;\r
  g100 *= norm0.z;\r
  g110 *= norm0.w;\r
  let norm1 = taylorInvSqrt(vec4f(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\r
  g001 *= norm1.x;\r
  g011 *= norm1.y;\r
  g101 *= norm1.z;\r
  g111 *= norm1.w;\r
\r
  let n000 = dot(g000, Pf0);\r
  let n100 = dot(g100, vec3f(Pf1.x, Pf0.yz));\r
  let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));\r
  let n110 = dot(g110, vec3f(Pf1.xy, Pf0.z));\r
  let n001 = dot(g001, vec3f(Pf0.xy, Pf1.z));\r
  let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));\r
  let n011 = dot(g011, vec3f(Pf0.x, Pf1.yz));\r
  let n111 = dot(g111, Pf1);\r
\r
  let f = fadeCurve(Pf0);\r
  let nz = mix(vec4f(n000, n100, n010, n110), vec4f(n001, n101, n011, n111), f.z);\r
  let ny = mix(nz.xy, nz.zw, f.y);\r
  return 2.2 * mix(ny.x, ny.y, f.x);\r
}\r
\r
fn fbm(p: vec3f) -> f32 {\r
  var total = 0.0;\r
  var amplitude = 1.0;\r
  var weight = 0.0;\r
  var frequency = 1.0;\r
  for (var i = 0; i < 2; i++) {\r
    total += amplitude * cnoise(p * frequency);\r
    weight += amplitude;\r
    amplitude *= 0.5;\r
    frequency *= 2.0;\r
  }\r
  return total / weight;\r
}\r
\`;\r
\r
const SCENE_SHADER = \`\r
struct Params {\r
  resolution: vec4f,\r
  placement: vec4f,\r
  grid: vec4f,\r
  field: vec4f,\r
  motion: vec4f,\r
  color: vec4f,\r
  hover: vec4f,\r
  background: vec4f,\r
}\r
@group(0) @binding(0) var<uniform> params: Params;\r
@group(0) @binding(1) var maskTexture: texture_2d<f32>;\r
@group(0) @binding(2) var maskSampler: sampler;\r
@group(0) @binding(3) var<storage, read> charges: array<f32>;\r
\r
const SEED = vec2f(12.9898, 78.233);\r
const GLOW_THRESHOLD = 0.6;\r
\${NOISE_WGSL}\r
\r
fn sdIsoscelesTriangle(point: vec2f, q: vec2f) -> f32 {\r
  let p = vec2f(abs(point.x), point.y);\r
  let a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);\r
  let b = p - q * vec2f(clamp(p.x / q.x, 0.0, 1.0), 1.0);\r
  let s = -sign(q.y);\r
  let d = min(vec2f(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2f(dot(b, b), s * (p.y - q.y)));\r
  return -sqrt(d.x) * sign(d.y);\r
}\r
\r
fn shapeDistance(p: vec2f, shape: i32, c: f32) -> f32 {\r
  if (shape == 0) { return max(abs(p.x), abs(p.y)) - c; }\r
  if (shape == 1) { return length(p) - c; }\r
  return sdIsoscelesTriangle(vec2f(p.x, p.y + c), vec2f(c, 2.0 * c));\r
}\r
\r
fn hash21(p: vec2f) -> f32 {\r
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);\r
}\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let resolution = params.resolution.xy;\r
  let cellPx = params.grid.x;\r
  let dotSize = params.grid.y;\r
  let mode = i32(params.grid.z + 0.5);\r
  let cols = i32(params.grid.w + 0.5);\r
  let background = params.background.rgb;\r
  let toSurface = params.hover.w < 0.5;\r
\r
  let pixel = uv * resolution;\r
  let origin = params.placement.xy;\r
  let rows = i32(params.placement.z + 0.5);\r
  let cell = floor((pixel - origin) / cellPx);\r
  if (cell.y < 0.0 || i32(cell.y) >= rows || cell.x < 0.0 || i32(cell.x) >= cols) {\r
    return vec4f(background, select(0.0, 1.0, toSurface));\r
  }\r
  let center = origin + (cell + 0.5) * cellPx;\r
  let local = (pixel - center) / (cellPx * 0.5);\r
  let cellUv = center / resolution;\r
\r
  if (params.motion.z > 0.5 && textureSampleLevel(maskTexture, maskSampler, cellUv, 0.0).r > 0.5) {\r
    return vec4f(background, select(0.0, 1.0, toSurface));\r
  }\r
\r
  var level = 1.0;\r
  let fade = params.motion.w;\r
  if (fade > 0.0) {\r
    let q = abs(uv * 2.0 - 1.0);\r
    let radius = pow(pow(q.x, 2.5) + pow(q.y, 2.5), 1.0 / 2.5) / pow(2.0, 1.0 / 2.5);\r
    level = 1.0 - smoothstep(max(0.0, 1.0 - fade * 2.2), 1.0, radius);\r
  }\r
  let noise = fbm(vec3f((center + params.motion.xy) / params.field.x + SEED, params.field.w));\r
  let tone = clamp((noise * 0.5 + 0.5 - params.field.y) * params.field.z + 0.5, 0.0, 1.0);\r
  let band = i32(min(tone, 0.999999) * 3.0);\r
\r
  var charge = 0.0;\r
  let index = i32(cell.y) * cols + i32(cell.x);\r
  if (index >= 0 && index < i32(arrayLength(&charges))) { charge = charges[index]; }\r
  let stepped = (band + i32(clamp(charge, 0.0, 0.999) * 3.0)) % 3;\r
\r
  var shape = 2 - stepped;\r
  var size = dotSize;\r
  if (mode != 0) {\r
    shape = mode - 1;\r
    size = dotSize * mix(0.45, 1.0, f32(stepped) / 2.0);\r
  }\r
  let introProgress = params.placement.w;\r
  var front = 0.0;\r
  if (introProgress < \${INTRO_END.toFixed(2)}) {\r
    let radial = length((center - resolution * 0.5) / (resolution * 0.5)) * 0.70710678;\r
    let warp = cnoise(vec3f(cellUv * vec2f(3.2, 2.4) + SEED, 4.7)) * \${INTRO_WARP.toFixed(2)};\r
    let jitter = hash21(cell) * \${INTRO_JITTER.toFixed(2)};\r
    let spread = radial + warp + jitter + \${INTRO_WARP.toFixed(2)};\r
    let band = \${INTRO_BAND.toFixed(2)} * (0.6 + 0.8 * hash21(cell + vec2f(17.0, 9.0)));\r
    let t = clamp((introProgress - spread) / band, 0.0, 1.0);\r
    if (t <= 0.0) {\r
      return vec4f(background, select(0.0, 1.0, toSurface));\r
    }\r
    let back = t - 1.0;\r
    size = max(size * (1.0 + 2.70158 * back * back * back + 1.70158 * back * back), 0.02);\r
    front = 1.0 - smoothstep(0.0, 1.0, abs(introProgress - spread) / band);\r
  }\r
  let aa = 2.0 / cellPx;\r
  let coverage = smoothstep(aa, -aa, shapeDistance(local, shape, size));\r
\r
  let tint = mix(params.color.rgb, params.hover.rgb, max(smoothstep(0.15, 0.85, charge), front * 0.35));\r
\r
  let rgb = mix(background, tint, coverage * level);\r
  if (toSurface) { return vec4f(rgb, 1.0); }\r
  let luminance = dot(tint * level, vec3f(0.2126, 0.7152, 0.0722));\r
  let glow = max(0.0, (luminance - GLOW_THRESHOLD) / (1.0 - GLOW_THRESHOLD)) * coverage;\r
  return vec4f(rgb, glow);\r
}\r
\`;\r
\r
const BLUR_SHADER = \`\r
struct Blur { direction: vec4f }\r
@group(0) @binding(0) var<uniform> blur: Blur;\r
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;\r
@group(0) @binding(2) var sourceSampler: sampler;\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let sigma = blur.direction.z;\r
  let radius = i32(ceil(3.0 * sigma));\r
  var sum = vec3f(0.0);\r
  var weight = 0.0;\r
  for (var i = -radius; i <= radius; i++) {\r
    let offset = f32(i);\r
    let w = exp(-(offset * offset) / (2.0 * sigma * sigma));\r
    let sample = textureSampleLevel(sourceTexture, sourceSampler, uv + offset * blur.direction.xy, 0.0);\r
    sum += select(sample.rgb, sample.rgb * sample.a, blur.direction.w > 0.5) * w;\r
    weight += w;\r
  }\r
  return vec4f(sum / weight, 1.0);\r
}\r
\`;\r
\r
const COMPOSITE_SHADER = \`\r
struct Composite { strength: vec4f }\r
@group(0) @binding(0) var<uniform> composite: Composite;\r
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;\r
@group(0) @binding(2) var glowTexture: texture_2d<f32>;\r
@group(0) @binding(3) var linearSampler: sampler;\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let scene = textureSampleLevel(sceneTexture, linearSampler, uv, 0.0).rgb;\r
  let glow = textureSampleLevel(glowTexture, linearSampler, uv, 0.0).rgb;\r
  return vec4f(scene + glow * composite.strength.x, 1.0);\r
}\r
\`;\r
\r
const parseColor = (value, fallback) => {\r
  const source = typeof value === 'string' ? value.trim() : '';\r
  const match = /^#?([\\da-f]{3}|[\\da-f]{6})$/i.exec(source) || /^#?([\\da-f]{6})$/i.exec(fallback);\r
  let hex = match[1];\r
  if (hex.length === 3) hex = hex.replace(/./g, char => char + char);\r
  return [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255);\r
};\r
\r
export default function ShapeWaves({\r
  text = '',\r
  fontFamily = 'Geist, "Geist Sans", system-ui, sans-serif',\r
  fontWeight = 500,\r
  textSize = 0.6,\r
  shapes = 'mixed',\r
  cellSize = 10,\r
  dotSize = 0.75,\r
  color = '#929292',\r
  hoverColor = '#ffffff',\r
  backgroundColor = '#000000',\r
  speed = 1,\r
  scale = 1,\r
  contrast = 1,\r
  brightness = 0.4,\r
  flow = 0,\r
  direction = 0,\r
  fade = 0.25,\r
  interactive = true,\r
  splashRadius = 40,\r
  splashStrength = 0.4,\r
  glow = 0.35,\r
  intro = true,\r
  introDuration = 1.6,\r
  introKey = 0,\r
  paused = false,\r
  onError,\r
  className = ''\r
}) {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const [ready, setReady] = useState(false);\r
  const settingsRef = useRef(null);\r
  const applySettingsRef = useRef(() => {});\r
  const applyMaskRef = useRef(() => {});\r
  const onErrorRef = useRef(onError);\r
\r
  settingsRef.current = {\r
    text: String(text ?? ''),\r
    fontFamily,\r
    fontWeight,\r
    textSize,\r
    shapes,\r
    cellSize: Math.max(2, cellSize),\r
    dotSize,\r
    color,\r
    hoverColor,\r
    backgroundColor,\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    contrast,\r
    brightness,\r
    flow,\r
    direction,\r
    fade,\r
    interactive,\r
    splashRadius,\r
    splashStrength,\r
    glow,\r
    intro,\r
    introDuration: Math.max(0.1, introDuration),\r
    introKey,\r
    paused\r
  };\r
  onErrorRef.current = onError;\r
\r
  const settingsSignature = [\r
    shapes,\r
    cellSize,\r
    dotSize,\r
    color,\r
    hoverColor,\r
    backgroundColor,\r
    speed,\r
    scale,\r
    contrast,\r
    brightness,\r
    flow,\r
    direction,\r
    fade,\r
    interactive,\r
    splashRadius,\r
    splashStrength,\r
    glow,\r
    intro,\r
    introDuration,\r
    paused\r
  ].join('|');\r
  const maskSignature = [text, fontFamily, fontWeight, textSize].join('|');\r
  const replayRef = useRef(() => {});\r
\r
  useEffect(() => {\r
    applySettingsRef.current();\r
  }, [settingsSignature]);\r
\r
  useEffect(() => {\r
    applyMaskRef.current();\r
  }, [maskSignature]);\r
\r
  useEffect(() => {\r
    if (introKey) replayRef.current();\r
  }, [introKey]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    if (!root || !canvas) return undefined;\r
\r
    let disposed = false;\r
    let failed = false;\r
    let gpu;\r
    let maskTexture;\r
    let chargeBuffer;\r
    let frameId = 0;\r
    let lastFrameTime = 0;\r
    let time = 0;\r
    let drift = [0, 0];\r
    let dpr = 1;\r
    let visible = true;\r
    let presented = false;\r
    let cols = 1;\r
    let rows = 1;\r
    let cellPx = 10;\r
    let gridOrigin = [0, 0];\r
    let charges = new Float32Array(1);\r
    let heights = new Float32Array(1);\r
    let previousHeights = new Float32Array(1);\r
    let simulationBacklog = 0;\r
    let introStart = 0;\r
    let introProgress = INTRO_END;\r
    let introArmed = false;\r
    let chargesActive = false;\r
    let bounds = null;\r
    let unsubscribeGpuError;\r
    let resizeObserver;\r
    let visibilityObserver;\r
    let wakeRenderer = () => {};\r
    const pointer = { x: 0, y: 0, at: 0, inside: false };\r
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');\r
    const maskCanvas = document.createElement('canvas');\r
    const maskContext = maskCanvas.getContext('2d');\r
\r
    const handleWake = () => wakeRenderer();\r
    const invalidateBounds = () => {\r
      bounds = null;\r
    };\r
    const splash = (x, y, strength) => {\r
      const settings = settingsRef.current;\r
      const sigma = Math.max(0.5, ((settings.splashRadius * dpr) / cellPx) * 0.5);\r
      const reach = Math.ceil(sigma * 2.5);\r
      const centerCol = (x * dpr - gridOrigin[0]) / cellPx - 0.5;\r
      const centerRow = (y * dpr - gridOrigin[1]) / cellPx - 0.5;\r
      const minRow = Math.max(0, Math.floor(centerRow - reach));\r
      const maxRow = Math.min(rows - 1, Math.ceil(centerRow + reach));\r
      const minCol = Math.max(0, Math.floor(centerCol - reach));\r
      const maxCol = Math.min(cols - 1, Math.ceil(centerCol + reach));\r
      for (let row = minRow; row <= maxRow; row++) {\r
        const dy = row - centerRow;\r
        for (let col = minCol; col <= maxCol; col++) {\r
          const dx = col - centerCol;\r
          const bump = strength * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));\r
          const index = row * cols + col;\r
          heights[index] = Math.min(1.2, heights[index] + bump);\r
        }\r
      }\r
      chargesActive = true;\r
    };\r
\r
    const handlePointerMove = event => {\r
      if (!settingsRef.current.interactive) return;\r
      if (!bounds) bounds = root.getBoundingClientRect();\r
      const now = performance.now();\r
      const x = event.clientX - bounds.left;\r
      const y = event.clientY - bounds.top;\r
      const inside = x >= 0 && y >= 0 && x <= bounds.width && y <= bounds.height;\r
      if (inside) {\r
        const elapsed = pointer.inside ? Math.max(8, now - pointer.at) : 16;\r
        const travelled = pointer.inside ? Math.hypot(x - pointer.x, y - pointer.y) : 0;\r
        const speed = (travelled / elapsed) * 1000;\r
        splash(x, y, Math.min(1, 0.22 + speed * 0.0006) * settingsRef.current.splashStrength);\r
        wakeRenderer();\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.at = now;\r
      pointer.inside = inside;\r
    };\r
\r
    const reportFailure = error => {\r
      if (disposed || failed) return;\r
      failed = true;\r
      if (frameId) cancelAnimationFrame(frameId);\r
      frameId = 0;\r
      resizeObserver?.disconnect();\r
      visibilityObserver?.disconnect();\r
      unsubscribeGpuError?.();\r
      applySettingsRef.current = () => {};\r
      applyMaskRef.current = () => {};\r
      const failedGpu = gpu;\r
      gpu = undefined;\r
      failedGpu?.dispose();\r
      setReady(false);\r
      onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));\r
    };\r
\r
    const measureSurface = () => {\r
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);\r
      return [Math.max(1, Math.round(canvas.clientWidth * dpr)), Math.max(1, Math.round(canvas.clientHeight * dpr))];\r
    };\r
\r
    void (async () => {\r
      try {\r
        gpu = await init({ powerPreference: 'low-power' });\r
        if (disposed) return gpu.dispose();\r
        unsubscribeGpuError = gpu.onError(reportFailure);\r
\r
        const initialSize = measureSurface();\r
        const outputFormat = navigator.gpu.getPreferredCanvasFormat();\r
        const output = surface(gpu, canvas, { dpr, size: initialSize, autoResize: false, format: outputFormat });\r
\r
        const params = uniforms(gpu, {\r
          resolution: [initialSize[0], initialSize[1], 1 / initialSize[0], 1 / initialSize[1]],\r
          placement: [0, 0, 1, 0],\r
          grid: [10, 0.75, 0, 1],\r
          field: [320, 0.5, 2.8, 0],\r
          motion: [0, 0, 0, 0.25],\r
          color: [0.573, 0.573, 0.573, 1],\r
          hover: [1, 1, 1, 0],\r
          background: [0, 0, 0, 1]\r
        });\r
        const linearSampler = sampler(gpu, {\r
          minFilter: 'linear',\r
          magFilter: 'linear',\r
          addressModeU: 'clamp-to-edge',\r
          addressModeV: 'clamp-to-edge'\r
        });\r
        const createMaskTexture = (maskWidth, maskHeight) =>\r
          gpu.device.createTexture({\r
            size: [maskWidth, maskHeight],\r
            format: 'rgba8unorm',\r
            usage: ['texture_binding', 'copy_dst', 'render_attachment'],\r
            label: 'shape-waves-mask'\r
          });\r
        maskTexture = createMaskTexture(1, 1);\r
        chargeBuffer = storage(gpu, 4, 'read');\r
        chargeBuffer.write(charges);\r
\r
        const scene = effect(gpu, SCENE_SHADER, {\r
          label: 'shape-waves-scene',\r
          set: { params, maskTexture, maskSampler: linearSampler, charges: chargeBuffer }\r
        });\r
        const sceneTarget = target(gpu, { size: initialSize, format: 'rgba8unorm', label: 'shape-waves-scene' });\r
        const glowSize = size => [Math.max(1, Math.ceil(size[0] / 2)), Math.max(1, Math.ceil(size[1] / 2))];\r
        const glowA = target(gpu, { size: glowSize(initialSize), format: 'rgba8unorm', label: 'shape-waves-glow-a' });\r
        const glowB = target(gpu, { size: glowSize(initialSize), format: 'rgba8unorm', label: 'shape-waves-glow-b' });\r
        const blurParamsX = uniforms(gpu, { direction: [0, 0, 4, 1] });\r
        const blurParamsY = uniforms(gpu, { direction: [0, 0, 4, 0] });\r
        const blurX = effect(gpu, BLUR_SHADER, {\r
          label: 'shape-waves-glow-x',\r
          set: { blur: blurParamsX, sourceTexture: sceneTarget, sourceSampler: linearSampler }\r
        });\r
        const blurY = effect(gpu, BLUR_SHADER, {\r
          label: 'shape-waves-glow-y',\r
          set: { blur: blurParamsY, sourceTexture: glowA, sourceSampler: linearSampler }\r
        });\r
        const compositeParams = uniforms(gpu, { strength: [2, 0, 0, 0] });\r
        const composite = effect(gpu, COMPOSITE_SHADER, {\r
          label: 'shape-waves-composite',\r
          set: { composite: compositeParams, sceneTexture: sceneTarget, glowTexture: glowB, linearSampler }\r
        });\r
        await Promise.all([\r
          scene.compile({ colors: [outputFormat] }),\r
          scene.compile(sceneTarget),\r
          blurX.compile(glowA),\r
          blurY.compile(glowB),\r
          composite.compile({ colors: [outputFormat] })\r
        ]);\r
        if (disposed) return;\r
\r
        const glowEnabled = () => settingsRef.current.glow > 0;\r
        let lastIntro = false;\r
\r
        const configureGrid = () => {\r
          const settings = settingsRef.current;\r
          const [width, height] = output.size;\r
          const nextCols = Math.max(1, Math.round(width / (settings.cellSize * dpr)));\r
          cellPx = width / nextCols;\r
          const nextRows = Math.max(1, Math.floor(height / cellPx));\r
          gridOrigin = [0, (height - nextRows * cellPx) / 2];\r
          if (nextCols === cols && nextRows === rows && charges.length === cols * rows) return;\r
          cols = nextCols;\r
          rows = nextRows;\r
          charges = new Float32Array(cols * rows);\r
          heights = new Float32Array(cols * rows);\r
          previousHeights = new Float32Array(cols * rows);\r
          chargesActive = false;\r
          const nextBuffer = storage(gpu, charges.byteLength, 'read');\r
          nextBuffer.write(charges);\r
          scene.set({ charges: nextBuffer });\r
          chargeBuffer.destroy();\r
          chargeBuffer = nextBuffer;\r
        };\r
\r
        const stepRipples = () => {\r
          const lastCol = cols - 1;\r
          const lastRow = rows - 1;\r
          let peak = 0;\r
          for (let row = 0; row < rows; row++) {\r
            const up = (row === 0 ? row : row - 1) * cols;\r
            const down = (row === lastRow ? row : row + 1) * cols;\r
            const base = row * cols;\r
            for (let col = 0; col < cols; col++) {\r
              const index = base + col;\r
              const left = base + (col === 0 ? col : col - 1);\r
              const right = base + (col === lastCol ? col : col + 1);\r
              const height = heights[index];\r
              const laplacian = heights[left] + heights[right] + heights[up + col] + heights[down + col] - 4 * height;\r
              const velocity = (height - previousHeights[index]) * WAVE_FRICTION;\r
              const next = (height + velocity + WAVE_SPEED * laplacian) * WAVE_DECAY;\r
              previousHeights[index] = next;\r
              const charge = Math.min(1, Math.max(0, next));\r
              charges[index] = charge;\r
              if (charge > peak) peak = charge;\r
            }\r
          }\r
          const swap = heights;\r
          heights = previousHeights;\r
          previousHeights = swap;\r
          return peak;\r
        };\r
\r
        const updateCharges = deltaSeconds => {\r
          if (!chargesActive) return false;\r
          simulationBacklog = Math.min(simulationBacklog + deltaSeconds, SIMULATION_STEP * 4);\r
          let peak = 1;\r
          while (simulationBacklog >= SIMULATION_STEP) {\r
            simulationBacklog -= SIMULATION_STEP;\r
            peak = stepRipples();\r
          }\r
          if (peak < SETTLED_THRESHOLD) {\r
            heights.fill(0);\r
            previousHeights.fill(0);\r
            charges.fill(0);\r
            chargesActive = false;\r
          }\r
          chargeBuffer.write(charges);\r
          return chargesActive;\r
        };\r
\r
        const isAnimating = () => {\r
          const settings = settingsRef.current;\r
          return visible && !document.hidden && !settings.paused && settings.speed > 0 && !reduceMotion.matches;\r
        };\r
\r
        const render = now => {\r
          frameId = 0;\r
          if (disposed || failed) return;\r
          const settings = settingsRef.current;\r
          const deltaSeconds = lastFrameTime ? Math.min(0.1, (now - lastFrameTime) / 1000) : 0;\r
          lastFrameTime = now;\r
          const animating = isAnimating();\r
          if (animating) {\r
            time += deltaSeconds * TIME_RATE * settings.speed;\r
            const angle = (settings.direction * Math.PI) / 180;\r
            const distance = settings.flow * cellPx * deltaSeconds;\r
            drift = [drift[0] + Math.cos(angle) * distance, drift[1] + Math.sin(angle) * distance];\r
          }\r
          const hovering = visible && !document.hidden && updateCharges(deltaSeconds);\r
          if (introArmed) {\r
            introArmed = false;\r
            introStart = now;\r
            introProgress = 0;\r
          }\r
          const introPlaying = introProgress < INTRO_END;\r
          if (introPlaying) {\r
            introProgress = Math.min(INTRO_END, ((now - introStart) / 1000 / settings.introDuration) * INTRO_END);\r
          }\r
          params.set({ placement: [gridOrigin[0], gridOrigin[1], rows, introProgress] });\r
          params.set({\r
            field: [\r
              NOISE_CELLS * cellPx * settings.scale,\r
              0.5 - (settings.brightness - 0.5) * 0.4,\r
              2.8 * settings.contrast,\r
              time\r
            ]\r
          });\r
          params.set({ motion: [drift[0], drift[1], settings.text.trim() ? 1 : 0, settings.fade] });\r
          try {\r
            frame(gpu, currentFrame => {\r
              if (!glowEnabled()) {\r
                currentFrame.pass(output, scene);\r
                return;\r
              }\r
              currentFrame.pass(sceneTarget, scene);\r
              currentFrame.pass(glowA, blurX);\r
              currentFrame.pass(glowB, blurY);\r
              currentFrame.pass(output, composite);\r
            });\r
          } catch (error) {\r
            reportFailure(error);\r
            return;\r
          }\r
          if (!presented) {\r
            presented = true;\r
            setReady(true);\r
          }\r
          if (animating || hovering || introPlaying) frameId = requestAnimationFrame(render);\r
          else lastFrameTime = 0;\r
        };\r
\r
        wakeRenderer = () => {\r
          if (disposed || failed || frameId) return;\r
          frameId = requestAnimationFrame(render);\r
        };\r
\r
        const drawMask = () => {\r
          const settings = settingsRef.current;\r
          const content = settings.text.trim();\r
          const [surfaceWidth, surfaceHeight] = output.size;\r
          const hasText = content.length > 0;\r
          const maskScale = hasText ? Math.min(1, MAX_MASK_SIZE / Math.max(surfaceWidth, surfaceHeight)) : 0;\r
          const maskWidth = hasText ? Math.max(1, Math.round(surfaceWidth * maskScale)) : 1;\r
          const maskHeight = hasText ? Math.max(1, Math.round(surfaceHeight * maskScale)) : 1;\r
\r
          maskCanvas.width = maskWidth;\r
          maskCanvas.height = maskHeight;\r
          maskContext.fillStyle = '#000';\r
          maskContext.fillRect(0, 0, maskWidth, maskHeight);\r
\r
          if (hasText) {\r
            let fontPx = Math.max(1, settings.textSize * maskHeight);\r
            maskContext.font = \`\${settings.fontWeight} \${fontPx}px \${settings.fontFamily}\`;\r
            const measured = maskContext.measureText(content).width;\r
            const maxWidth = maskWidth * 0.9;\r
            if (measured > maxWidth) {\r
              fontPx = Math.max(1, (fontPx * maxWidth) / measured);\r
              maskContext.font = \`\${settings.fontWeight} \${fontPx}px \${settings.fontFamily}\`;\r
            }\r
            maskContext.textAlign = 'center';\r
            maskContext.textBaseline = 'alphabetic';\r
            const metrics = maskContext.measureText(content);\r
            const x = (maskWidth + metrics.actualBoundingBoxLeft - metrics.actualBoundingBoxRight) / 2;\r
            const y = (maskHeight + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;\r
            maskContext.fillStyle = '#fff';\r
            maskContext.fillText(content, x, y);\r
          }\r
\r
          const nextTexture = createMaskTexture(maskWidth, maskHeight);\r
          gpu.gpu.queue.copyExternalImageToTexture({ source: maskCanvas }, { texture: nextTexture.gpu }, [\r
            maskWidth,\r
            maskHeight\r
          ]);\r
          scene.set({ maskTexture: nextTexture });\r
          maskTexture.destroy();\r
          maskTexture = nextTexture;\r
        };\r
\r
        const applySettings = () => {\r
          if (disposed || failed) return;\r
          const settings = settingsRef.current;\r
          configureGrid();\r
          params.set({\r
            placement: [gridOrigin[0], gridOrigin[1], rows, introProgress],\r
            grid: [cellPx, Math.min(1, Math.max(0.1, settings.dotSize)), SHAPE_MODES[settings.shapes] ?? 0, cols],\r
            color: [...parseColor(settings.color, '#929292'), 1],\r
            hover: [...parseColor(settings.hoverColor, '#ffffff'), glowEnabled() ? 1 : 0],\r
            background: [...parseColor(settings.backgroundColor, '#000000'), 1]\r
          });\r
          compositeParams.set({ strength: [2 * settings.glow, 0, 0, 0] });\r
          if (settings.intro !== lastIntro) {\r
            lastIntro = settings.intro;\r
            if (settings.intro && !reduceMotion.matches) introArmed = true;\r
          }\r
          if (!settings.interactive && chargesActive) {\r
            heights.fill(0);\r
            previousHeights.fill(0);\r
            charges.fill(0);\r
            chargesActive = false;\r
            chargeBuffer.write(charges);\r
          }\r
          wakeRenderer();\r
        };\r
\r
        const applyMask = () => {\r
          if (disposed || failed) return;\r
          drawMask();\r
          applySettings();\r
          const settings = settingsRef.current;\r
          if (!settings.text.trim() || !document.fonts?.load) return;\r
          document.fonts\r
            .load(\`\${settings.fontWeight} 32px \${settings.fontFamily}\`)\r
            .then(() => {\r
              if (disposed || failed) return;\r
              drawMask();\r
              wakeRenderer();\r
            })\r
            .catch(() => {});\r
        };\r
\r
        const resize = () => {\r
          if (disposed || failed) return;\r
          invalidateBounds();\r
          const nextSize = measureSurface();\r
          if (nextSize[0] !== output.size[0] || nextSize[1] !== output.size[1]) output.resize(nextSize);\r
          const [width, height] = output.size;\r
          sceneTarget.resize([width, height]);\r
          const half = glowSize([width, height]);\r
          glowA.resize(half);\r
          glowB.resize(half);\r
          blurParamsX.set({ direction: [1 / half[0], 0, 4, 1] });\r
          blurParamsY.set({ direction: [0, 1 / half[1], 4, 0] });\r
          params.set({ resolution: [width, height, 1 / width, 1 / height] });\r
          drawMask();\r
          applySettings();\r
        };\r
\r
        applySettingsRef.current = applySettings;\r
        applyMaskRef.current = applyMask;\r
        replayRef.current = () => {\r
          if (disposed || failed || !settingsRef.current.intro || reduceMotion.matches) return;\r
          introArmed = true;\r
          wakeRenderer();\r
        };\r
\r
        resizeObserver = new ResizeObserver(resize);\r
        resizeObserver.observe(root);\r
        visibilityObserver = new IntersectionObserver(\r
          entries => {\r
            visible = entries.some(entry => entry.isIntersecting);\r
            if (visible) wakeRenderer();\r
          },\r
          { threshold: 0 }\r
        );\r
        visibilityObserver.observe(root);\r
        document.addEventListener('visibilitychange', handleWake);\r
        reduceMotion.addEventListener('change', handleWake);\r
        window.addEventListener('pointermove', handlePointerMove, { passive: true });\r
        window.addEventListener('scroll', invalidateBounds, { capture: true, passive: true });\r
\r
        resize();\r
        applyMask();\r
      } catch (error) {\r
        reportFailure(error);\r
      }\r
    })();\r
\r
    return () => {\r
      disposed = true;\r
      wakeRenderer = () => {};\r
      applySettingsRef.current = () => {};\r
      applyMaskRef.current = () => {};\r
      replayRef.current = () => {};\r
      document.removeEventListener('visibilitychange', handleWake);\r
      reduceMotion.removeEventListener('change', handleWake);\r
      window.removeEventListener('pointermove', handlePointerMove);\r
      window.removeEventListener('scroll', invalidateBounds, { capture: true });\r
      resizeObserver?.disconnect();\r
      visibilityObserver?.disconnect();\r
      unsubscribeGpuError?.();\r
      if (frameId) cancelAnimationFrame(frameId);\r
      maskTexture?.destroy();\r
      chargeBuffer?.destroy();\r
      gpu?.dispose();\r
    };\r
  }, []);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`shape-waves \${className}\`}\r
      data-ready={ready}\r
      style={{ backgroundColor }}\r
      aria-hidden="true"\r
    >\r
      <canvas ref={canvasRef} className="shape-waves__canvas" />\r
    </div>\r
  );\r
}\r
`,e=`.shape-waves {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
  pointer-events: none;\r
  isolation: isolate;\r
}\r
\r
.shape-waves__canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  opacity: 0;\r
  transition: opacity 600ms cubic-bezier(0.22, 1, 0.36, 1);\r
  pointer-events: none;\r
}\r
\r
.shape-waves[data-ready='true'] .shape-waves__canvas {\r
  opacity: 1;\r
}\r
\r
@media (prefers-reduced-motion: reduce) {\r
  .shape-waves__canvas {\r
    transition: none;\r
  }\r
}\r
`,n=`'use client';\r
\r
// Inspired by https://vercel.com/labs\r
import { useEffect, useRef, useState } from 'react';\r
import { effect, frame, init, sampler, storage, surface, target, uniforms } from 'vgpu';\r
\r
const SHAPE_MODES = { mixed: 0, squares: 1, circles: 2, triangles: 3 };\r
const MAX_DPR = 2;\r
const MAX_MASK_SIZE = 1024;\r
const NOISE_CELLS = 32;\r
const TIME_RATE = 0.1;\r
const SIMULATION_STEP = 1 / 60;\r
const WAVE_SPEED = 0.42;\r
const WAVE_FRICTION = 0.94;\r
const WAVE_DECAY = 0.972;\r
const SETTLED_THRESHOLD = 0.01;\r
const INTRO_BAND = 0.2;\r
const INTRO_WARP = 0.3;\r
const INTRO_JITTER = 0.16;\r
const INTRO_END = 1 + INTRO_WARP + INTRO_JITTER + INTRO_BAND;\r
\r
const NOISE_WGSL = \`\r
fn mod289v3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
fn mod289v4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
fn permute(x: vec4f) -> vec4f { return mod289v4(((x * 34.0) + 10.0) * x); }\r
fn taylorInvSqrt(r: vec4f) -> vec4f { return 1.79284291400159 - 0.85373472095314 * r; }\r
fn fadeCurve(t: vec3f) -> vec3f { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\r
\r
fn cnoise(P: vec3f) -> f32 {\r
  var Pi0 = floor(P);\r
  var Pi1 = Pi0 + vec3f(1.0);\r
  Pi0 = mod289v3(Pi0);\r
  Pi1 = mod289v3(Pi1);\r
  let Pf0 = fract(P);\r
  let Pf1 = Pf0 - vec3f(1.0);\r
  let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\r
  let iy = vec4f(Pi0.yy, Pi1.yy);\r
  let iz0 = Pi0.zzzz;\r
  let iz1 = Pi1.zzzz;\r
\r
  let ixy = permute(permute(ix) + iy);\r
  let ixy0 = permute(ixy + iz0);\r
  let ixy1 = permute(ixy + iz1);\r
\r
  var gx0 = ixy0 * (1.0 / 7.0);\r
  var gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\r
  gx0 = fract(gx0);\r
  let gz0 = vec4f(0.5) - abs(gx0) - abs(gy0);\r
  let sz0 = step(gz0, vec4f(0.0));\r
  gx0 -= sz0 * (step(vec4f(0.0), gx0) - 0.5);\r
  gy0 -= sz0 * (step(vec4f(0.0), gy0) - 0.5);\r
\r
  var gx1 = ixy1 * (1.0 / 7.0);\r
  var gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\r
  gx1 = fract(gx1);\r
  let gz1 = vec4f(0.5) - abs(gx1) - abs(gy1);\r
  let sz1 = step(gz1, vec4f(0.0));\r
  gx1 -= sz1 * (step(vec4f(0.0), gx1) - 0.5);\r
  gy1 -= sz1 * (step(vec4f(0.0), gy1) - 0.5);\r
\r
  var g000 = vec3f(gx0.x, gy0.x, gz0.x);\r
  var g100 = vec3f(gx0.y, gy0.y, gz0.y);\r
  var g010 = vec3f(gx0.z, gy0.z, gz0.z);\r
  var g110 = vec3f(gx0.w, gy0.w, gz0.w);\r
  var g001 = vec3f(gx1.x, gy1.x, gz1.x);\r
  var g101 = vec3f(gx1.y, gy1.y, gz1.y);\r
  var g011 = vec3f(gx1.z, gy1.z, gz1.z);\r
  var g111 = vec3f(gx1.w, gy1.w, gz1.w);\r
\r
  let norm0 = taylorInvSqrt(vec4f(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\r
  g000 *= norm0.x;\r
  g010 *= norm0.y;\r
  g100 *= norm0.z;\r
  g110 *= norm0.w;\r
  let norm1 = taylorInvSqrt(vec4f(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\r
  g001 *= norm1.x;\r
  g011 *= norm1.y;\r
  g101 *= norm1.z;\r
  g111 *= norm1.w;\r
\r
  let n000 = dot(g000, Pf0);\r
  let n100 = dot(g100, vec3f(Pf1.x, Pf0.yz));\r
  let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));\r
  let n110 = dot(g110, vec3f(Pf1.xy, Pf0.z));\r
  let n001 = dot(g001, vec3f(Pf0.xy, Pf1.z));\r
  let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));\r
  let n011 = dot(g011, vec3f(Pf0.x, Pf1.yz));\r
  let n111 = dot(g111, Pf1);\r
\r
  let f = fadeCurve(Pf0);\r
  let nz = mix(vec4f(n000, n100, n010, n110), vec4f(n001, n101, n011, n111), f.z);\r
  let ny = mix(nz.xy, nz.zw, f.y);\r
  return 2.2 * mix(ny.x, ny.y, f.x);\r
}\r
\r
fn fbm(p: vec3f) -> f32 {\r
  var total = 0.0;\r
  var amplitude = 1.0;\r
  var weight = 0.0;\r
  var frequency = 1.0;\r
  for (var i = 0; i < 2; i++) {\r
    total += amplitude * cnoise(p * frequency);\r
    weight += amplitude;\r
    amplitude *= 0.5;\r
    frequency *= 2.0;\r
  }\r
  return total / weight;\r
}\r
\`;\r
\r
const SCENE_SHADER = \`\r
struct Params {\r
  resolution: vec4f,\r
  placement: vec4f,\r
  grid: vec4f,\r
  field: vec4f,\r
  motion: vec4f,\r
  color: vec4f,\r
  hover: vec4f,\r
  background: vec4f,\r
}\r
@group(0) @binding(0) var<uniform> params: Params;\r
@group(0) @binding(1) var maskTexture: texture_2d<f32>;\r
@group(0) @binding(2) var maskSampler: sampler;\r
@group(0) @binding(3) var<storage, read> charges: array<f32>;\r
\r
const SEED = vec2f(12.9898, 78.233);\r
const GLOW_THRESHOLD = 0.6;\r
\${NOISE_WGSL}\r
\r
fn sdIsoscelesTriangle(point: vec2f, q: vec2f) -> f32 {\r
  let p = vec2f(abs(point.x), point.y);\r
  let a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);\r
  let b = p - q * vec2f(clamp(p.x / q.x, 0.0, 1.0), 1.0);\r
  let s = -sign(q.y);\r
  let d = min(vec2f(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2f(dot(b, b), s * (p.y - q.y)));\r
  return -sqrt(d.x) * sign(d.y);\r
}\r
\r
fn shapeDistance(p: vec2f, shape: i32, c: f32) -> f32 {\r
  if (shape == 0) { return max(abs(p.x), abs(p.y)) - c; }\r
  if (shape == 1) { return length(p) - c; }\r
  return sdIsoscelesTriangle(vec2f(p.x, p.y + c), vec2f(c, 2.0 * c));\r
}\r
\r
fn hash21(p: vec2f) -> f32 {\r
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);\r
}\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let resolution = params.resolution.xy;\r
  let cellPx = params.grid.x;\r
  let dotSize = params.grid.y;\r
  let mode = i32(params.grid.z + 0.5);\r
  let cols = i32(params.grid.w + 0.5);\r
  let background = params.background.rgb;\r
  let toSurface = params.hover.w < 0.5;\r
\r
  let pixel = uv * resolution;\r
  let origin = params.placement.xy;\r
  let rows = i32(params.placement.z + 0.5);\r
  let cell = floor((pixel - origin) / cellPx);\r
  if (cell.y < 0.0 || i32(cell.y) >= rows || cell.x < 0.0 || i32(cell.x) >= cols) {\r
    return vec4f(background, select(0.0, 1.0, toSurface));\r
  }\r
  let center = origin + (cell + 0.5) * cellPx;\r
  let local = (pixel - center) / (cellPx * 0.5);\r
  let cellUv = center / resolution;\r
\r
  if (params.motion.z > 0.5 && textureSampleLevel(maskTexture, maskSampler, cellUv, 0.0).r > 0.5) {\r
    return vec4f(background, select(0.0, 1.0, toSurface));\r
  }\r
\r
  var level = 1.0;\r
  let fade = params.motion.w;\r
  if (fade > 0.0) {\r
    let q = abs(uv * 2.0 - 1.0);\r
    let radius = pow(pow(q.x, 2.5) + pow(q.y, 2.5), 1.0 / 2.5) / pow(2.0, 1.0 / 2.5);\r
    level = 1.0 - smoothstep(max(0.0, 1.0 - fade * 2.2), 1.0, radius);\r
  }\r
  let noise = fbm(vec3f((center + params.motion.xy) / params.field.x + SEED, params.field.w));\r
  let tone = clamp((noise * 0.5 + 0.5 - params.field.y) * params.field.z + 0.5, 0.0, 1.0);\r
  let band = i32(min(tone, 0.999999) * 3.0);\r
\r
  var charge = 0.0;\r
  let index = i32(cell.y) * cols + i32(cell.x);\r
  if (index >= 0 && index < i32(arrayLength(&charges))) { charge = charges[index]; }\r
  let stepped = (band + i32(clamp(charge, 0.0, 0.999) * 3.0)) % 3;\r
\r
  var shape = 2 - stepped;\r
  var size = dotSize;\r
  if (mode != 0) {\r
    shape = mode - 1;\r
    size = dotSize * mix(0.45, 1.0, f32(stepped) / 2.0);\r
  }\r
  let introProgress = params.placement.w;\r
  var front = 0.0;\r
  if (introProgress < \${INTRO_END.toFixed(2)}) {\r
    let radial = length((center - resolution * 0.5) / (resolution * 0.5)) * 0.70710678;\r
    let warp = cnoise(vec3f(cellUv * vec2f(3.2, 2.4) + SEED, 4.7)) * \${INTRO_WARP.toFixed(2)};\r
    let jitter = hash21(cell) * \${INTRO_JITTER.toFixed(2)};\r
    let spread = radial + warp + jitter + \${INTRO_WARP.toFixed(2)};\r
    let band = \${INTRO_BAND.toFixed(2)} * (0.6 + 0.8 * hash21(cell + vec2f(17.0, 9.0)));\r
    let t = clamp((introProgress - spread) / band, 0.0, 1.0);\r
    if (t <= 0.0) {\r
      return vec4f(background, select(0.0, 1.0, toSurface));\r
    }\r
    let back = t - 1.0;\r
    size = max(size * (1.0 + 2.70158 * back * back * back + 1.70158 * back * back), 0.02);\r
    front = 1.0 - smoothstep(0.0, 1.0, abs(introProgress - spread) / band);\r
  }\r
  let aa = 2.0 / cellPx;\r
  let coverage = smoothstep(aa, -aa, shapeDistance(local, shape, size));\r
\r
  let tint = mix(params.color.rgb, params.hover.rgb, max(smoothstep(0.15, 0.85, charge), front * 0.35));\r
\r
  let rgb = mix(background, tint, coverage * level);\r
  if (toSurface) { return vec4f(rgb, 1.0); }\r
  let luminance = dot(tint * level, vec3f(0.2126, 0.7152, 0.0722));\r
  let glow = max(0.0, (luminance - GLOW_THRESHOLD) / (1.0 - GLOW_THRESHOLD)) * coverage;\r
  return vec4f(rgb, glow);\r
}\r
\`;\r
\r
const BLUR_SHADER = \`\r
struct Blur { direction: vec4f }\r
@group(0) @binding(0) var<uniform> blur: Blur;\r
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;\r
@group(0) @binding(2) var sourceSampler: sampler;\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let sigma = blur.direction.z;\r
  let radius = i32(ceil(3.0 * sigma));\r
  var sum = vec3f(0.0);\r
  var weight = 0.0;\r
  for (var i = -radius; i <= radius; i++) {\r
    let offset = f32(i);\r
    let w = exp(-(offset * offset) / (2.0 * sigma * sigma));\r
    let sample = textureSampleLevel(sourceTexture, sourceSampler, uv + offset * blur.direction.xy, 0.0);\r
    sum += select(sample.rgb, sample.rgb * sample.a, blur.direction.w > 0.5) * w;\r
    weight += w;\r
  }\r
  return vec4f(sum / weight, 1.0);\r
}\r
\`;\r
\r
const COMPOSITE_SHADER = \`\r
struct Composite { strength: vec4f }\r
@group(0) @binding(0) var<uniform> composite: Composite;\r
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;\r
@group(0) @binding(2) var glowTexture: texture_2d<f32>;\r
@group(0) @binding(3) var linearSampler: sampler;\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let scene = textureSampleLevel(sceneTexture, linearSampler, uv, 0.0).rgb;\r
  let glow = textureSampleLevel(glowTexture, linearSampler, uv, 0.0).rgb;\r
  return vec4f(scene + glow * composite.strength.x, 1.0);\r
}\r
\`;\r
\r
const parseColor = (value, fallback) => {\r
  const source = typeof value === 'string' ? value.trim() : '';\r
  const match = /^#?([\\da-f]{3}|[\\da-f]{6})$/i.exec(source) || /^#?([\\da-f]{6})$/i.exec(fallback);\r
  let hex = match[1];\r
  if (hex.length === 3) hex = hex.replace(/./g, char => char + char);\r
  return [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255);\r
};\r
\r
export default function ShapeWaves({\r
  text = '',\r
  fontFamily = 'Geist, "Geist Sans", system-ui, sans-serif',\r
  fontWeight = 500,\r
  textSize = 0.6,\r
  shapes = 'mixed',\r
  cellSize = 10,\r
  dotSize = 0.75,\r
  color = '#929292',\r
  hoverColor = '#ffffff',\r
  backgroundColor = '#000000',\r
  speed = 1,\r
  scale = 1,\r
  contrast = 1,\r
  brightness = 0.4,\r
  flow = 0,\r
  direction = 0,\r
  fade = 0.25,\r
  interactive = true,\r
  splashRadius = 40,\r
  splashStrength = 0.4,\r
  glow = 0.35,\r
  intro = true,\r
  introDuration = 1.6,\r
  introKey = 0,\r
  paused = false,\r
  onError,\r
  className = ''\r
}) {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const [ready, setReady] = useState(false);\r
  const settingsRef = useRef(null);\r
  const applySettingsRef = useRef(() => {});\r
  const applyMaskRef = useRef(() => {});\r
  const onErrorRef = useRef(onError);\r
\r
  settingsRef.current = {\r
    text: String(text ?? ''),\r
    fontFamily,\r
    fontWeight,\r
    textSize,\r
    shapes,\r
    cellSize: Math.max(2, cellSize),\r
    dotSize,\r
    color,\r
    hoverColor,\r
    backgroundColor,\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    contrast,\r
    brightness,\r
    flow,\r
    direction,\r
    fade,\r
    interactive,\r
    splashRadius,\r
    splashStrength,\r
    glow,\r
    intro,\r
    introDuration: Math.max(0.1, introDuration),\r
    introKey,\r
    paused\r
  };\r
  onErrorRef.current = onError;\r
\r
  const settingsSignature = [\r
    shapes,\r
    cellSize,\r
    dotSize,\r
    color,\r
    hoverColor,\r
    backgroundColor,\r
    speed,\r
    scale,\r
    contrast,\r
    brightness,\r
    flow,\r
    direction,\r
    fade,\r
    interactive,\r
    splashRadius,\r
    splashStrength,\r
    glow,\r
    intro,\r
    introDuration,\r
    paused\r
  ].join('|');\r
  const maskSignature = [text, fontFamily, fontWeight, textSize].join('|');\r
  const replayRef = useRef(() => {});\r
\r
  useEffect(() => {\r
    applySettingsRef.current();\r
  }, [settingsSignature]);\r
\r
  useEffect(() => {\r
    applyMaskRef.current();\r
  }, [maskSignature]);\r
\r
  useEffect(() => {\r
    if (introKey) replayRef.current();\r
  }, [introKey]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    if (!root || !canvas) return undefined;\r
\r
    let disposed = false;\r
    let failed = false;\r
    let gpu;\r
    let maskTexture;\r
    let chargeBuffer;\r
    let frameId = 0;\r
    let lastFrameTime = 0;\r
    let time = 0;\r
    let drift = [0, 0];\r
    let dpr = 1;\r
    let visible = true;\r
    let presented = false;\r
    let cols = 1;\r
    let rows = 1;\r
    let cellPx = 10;\r
    let gridOrigin = [0, 0];\r
    let charges = new Float32Array(1);\r
    let heights = new Float32Array(1);\r
    let previousHeights = new Float32Array(1);\r
    let simulationBacklog = 0;\r
    let introStart = 0;\r
    let introProgress = INTRO_END;\r
    let introArmed = false;\r
    let chargesActive = false;\r
    let bounds = null;\r
    let unsubscribeGpuError;\r
    let resizeObserver;\r
    let visibilityObserver;\r
    let wakeRenderer = () => {};\r
    const pointer = { x: 0, y: 0, at: 0, inside: false };\r
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');\r
    const maskCanvas = document.createElement('canvas');\r
    const maskContext = maskCanvas.getContext('2d');\r
\r
    const handleWake = () => wakeRenderer();\r
    const invalidateBounds = () => {\r
      bounds = null;\r
    };\r
    const splash = (x, y, strength) => {\r
      const settings = settingsRef.current;\r
      const sigma = Math.max(0.5, ((settings.splashRadius * dpr) / cellPx) * 0.5);\r
      const reach = Math.ceil(sigma * 2.5);\r
      const centerCol = (x * dpr - gridOrigin[0]) / cellPx - 0.5;\r
      const centerRow = (y * dpr - gridOrigin[1]) / cellPx - 0.5;\r
      const minRow = Math.max(0, Math.floor(centerRow - reach));\r
      const maxRow = Math.min(rows - 1, Math.ceil(centerRow + reach));\r
      const minCol = Math.max(0, Math.floor(centerCol - reach));\r
      const maxCol = Math.min(cols - 1, Math.ceil(centerCol + reach));\r
      for (let row = minRow; row <= maxRow; row++) {\r
        const dy = row - centerRow;\r
        for (let col = minCol; col <= maxCol; col++) {\r
          const dx = col - centerCol;\r
          const bump = strength * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));\r
          const index = row * cols + col;\r
          heights[index] = Math.min(1.2, heights[index] + bump);\r
        }\r
      }\r
      chargesActive = true;\r
    };\r
\r
    const handlePointerMove = event => {\r
      if (!settingsRef.current.interactive) return;\r
      if (!bounds) bounds = root.getBoundingClientRect();\r
      const now = performance.now();\r
      const x = event.clientX - bounds.left;\r
      const y = event.clientY - bounds.top;\r
      const inside = x >= 0 && y >= 0 && x <= bounds.width && y <= bounds.height;\r
      if (inside) {\r
        const elapsed = pointer.inside ? Math.max(8, now - pointer.at) : 16;\r
        const travelled = pointer.inside ? Math.hypot(x - pointer.x, y - pointer.y) : 0;\r
        const speed = (travelled / elapsed) * 1000;\r
        splash(x, y, Math.min(1, 0.22 + speed * 0.0006) * settingsRef.current.splashStrength);\r
        wakeRenderer();\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.at = now;\r
      pointer.inside = inside;\r
    };\r
\r
    const reportFailure = error => {\r
      if (disposed || failed) return;\r
      failed = true;\r
      if (frameId) cancelAnimationFrame(frameId);\r
      frameId = 0;\r
      resizeObserver?.disconnect();\r
      visibilityObserver?.disconnect();\r
      unsubscribeGpuError?.();\r
      applySettingsRef.current = () => {};\r
      applyMaskRef.current = () => {};\r
      const failedGpu = gpu;\r
      gpu = undefined;\r
      failedGpu?.dispose();\r
      setReady(false);\r
      onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));\r
    };\r
\r
    const measureSurface = () => {\r
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);\r
      return [Math.max(1, Math.round(canvas.clientWidth * dpr)), Math.max(1, Math.round(canvas.clientHeight * dpr))];\r
    };\r
\r
    void (async () => {\r
      try {\r
        gpu = await init({ powerPreference: 'low-power' });\r
        if (disposed) return gpu.dispose();\r
        unsubscribeGpuError = gpu.onError(reportFailure);\r
\r
        const initialSize = measureSurface();\r
        const outputFormat = navigator.gpu.getPreferredCanvasFormat();\r
        const output = surface(gpu, canvas, { dpr, size: initialSize, autoResize: false, format: outputFormat });\r
\r
        const params = uniforms(gpu, {\r
          resolution: [initialSize[0], initialSize[1], 1 / initialSize[0], 1 / initialSize[1]],\r
          placement: [0, 0, 1, 0],\r
          grid: [10, 0.75, 0, 1],\r
          field: [320, 0.5, 2.8, 0],\r
          motion: [0, 0, 0, 0.25],\r
          color: [0.573, 0.573, 0.573, 1],\r
          hover: [1, 1, 1, 0],\r
          background: [0, 0, 0, 1]\r
        });\r
        const linearSampler = sampler(gpu, {\r
          minFilter: 'linear',\r
          magFilter: 'linear',\r
          addressModeU: 'clamp-to-edge',\r
          addressModeV: 'clamp-to-edge'\r
        });\r
        const createMaskTexture = (maskWidth, maskHeight) =>\r
          gpu.device.createTexture({\r
            size: [maskWidth, maskHeight],\r
            format: 'rgba8unorm',\r
            usage: ['texture_binding', 'copy_dst', 'render_attachment'],\r
            label: 'shape-waves-mask'\r
          });\r
        maskTexture = createMaskTexture(1, 1);\r
        chargeBuffer = storage(gpu, 4, 'read');\r
        chargeBuffer.write(charges);\r
\r
        const scene = effect(gpu, SCENE_SHADER, {\r
          label: 'shape-waves-scene',\r
          set: { params, maskTexture, maskSampler: linearSampler, charges: chargeBuffer }\r
        });\r
        const sceneTarget = target(gpu, { size: initialSize, format: 'rgba8unorm', label: 'shape-waves-scene' });\r
        const glowSize = size => [Math.max(1, Math.ceil(size[0] / 2)), Math.max(1, Math.ceil(size[1] / 2))];\r
        const glowA = target(gpu, { size: glowSize(initialSize), format: 'rgba8unorm', label: 'shape-waves-glow-a' });\r
        const glowB = target(gpu, { size: glowSize(initialSize), format: 'rgba8unorm', label: 'shape-waves-glow-b' });\r
        const blurParamsX = uniforms(gpu, { direction: [0, 0, 4, 1] });\r
        const blurParamsY = uniforms(gpu, { direction: [0, 0, 4, 0] });\r
        const blurX = effect(gpu, BLUR_SHADER, {\r
          label: 'shape-waves-glow-x',\r
          set: { blur: blurParamsX, sourceTexture: sceneTarget, sourceSampler: linearSampler }\r
        });\r
        const blurY = effect(gpu, BLUR_SHADER, {\r
          label: 'shape-waves-glow-y',\r
          set: { blur: blurParamsY, sourceTexture: glowA, sourceSampler: linearSampler }\r
        });\r
        const compositeParams = uniforms(gpu, { strength: [2, 0, 0, 0] });\r
        const composite = effect(gpu, COMPOSITE_SHADER, {\r
          label: 'shape-waves-composite',\r
          set: { composite: compositeParams, sceneTexture: sceneTarget, glowTexture: glowB, linearSampler }\r
        });\r
        await Promise.all([\r
          scene.compile({ colors: [outputFormat] }),\r
          scene.compile(sceneTarget),\r
          blurX.compile(glowA),\r
          blurY.compile(glowB),\r
          composite.compile({ colors: [outputFormat] })\r
        ]);\r
        if (disposed) return;\r
\r
        const glowEnabled = () => settingsRef.current.glow > 0;\r
        let lastIntro = false;\r
\r
        const configureGrid = () => {\r
          const settings = settingsRef.current;\r
          const [width, height] = output.size;\r
          const nextCols = Math.max(1, Math.round(width / (settings.cellSize * dpr)));\r
          cellPx = width / nextCols;\r
          const nextRows = Math.max(1, Math.floor(height / cellPx));\r
          gridOrigin = [0, (height - nextRows * cellPx) / 2];\r
          if (nextCols === cols && nextRows === rows && charges.length === cols * rows) return;\r
          cols = nextCols;\r
          rows = nextRows;\r
          charges = new Float32Array(cols * rows);\r
          heights = new Float32Array(cols * rows);\r
          previousHeights = new Float32Array(cols * rows);\r
          chargesActive = false;\r
          const nextBuffer = storage(gpu, charges.byteLength, 'read');\r
          nextBuffer.write(charges);\r
          scene.set({ charges: nextBuffer });\r
          chargeBuffer.destroy();\r
          chargeBuffer = nextBuffer;\r
        };\r
\r
        const stepRipples = () => {\r
          const lastCol = cols - 1;\r
          const lastRow = rows - 1;\r
          let peak = 0;\r
          for (let row = 0; row < rows; row++) {\r
            const up = (row === 0 ? row : row - 1) * cols;\r
            const down = (row === lastRow ? row : row + 1) * cols;\r
            const base = row * cols;\r
            for (let col = 0; col < cols; col++) {\r
              const index = base + col;\r
              const left = base + (col === 0 ? col : col - 1);\r
              const right = base + (col === lastCol ? col : col + 1);\r
              const height = heights[index];\r
              const laplacian = heights[left] + heights[right] + heights[up + col] + heights[down + col] - 4 * height;\r
              const velocity = (height - previousHeights[index]) * WAVE_FRICTION;\r
              const next = (height + velocity + WAVE_SPEED * laplacian) * WAVE_DECAY;\r
              previousHeights[index] = next;\r
              const charge = Math.min(1, Math.max(0, next));\r
              charges[index] = charge;\r
              if (charge > peak) peak = charge;\r
            }\r
          }\r
          const swap = heights;\r
          heights = previousHeights;\r
          previousHeights = swap;\r
          return peak;\r
        };\r
\r
        const updateCharges = deltaSeconds => {\r
          if (!chargesActive) return false;\r
          simulationBacklog = Math.min(simulationBacklog + deltaSeconds, SIMULATION_STEP * 4);\r
          let peak = 1;\r
          while (simulationBacklog >= SIMULATION_STEP) {\r
            simulationBacklog -= SIMULATION_STEP;\r
            peak = stepRipples();\r
          }\r
          if (peak < SETTLED_THRESHOLD) {\r
            heights.fill(0);\r
            previousHeights.fill(0);\r
            charges.fill(0);\r
            chargesActive = false;\r
          }\r
          chargeBuffer.write(charges);\r
          return chargesActive;\r
        };\r
\r
        const isAnimating = () => {\r
          const settings = settingsRef.current;\r
          return visible && !document.hidden && !settings.paused && settings.speed > 0 && !reduceMotion.matches;\r
        };\r
\r
        const render = now => {\r
          frameId = 0;\r
          if (disposed || failed) return;\r
          const settings = settingsRef.current;\r
          const deltaSeconds = lastFrameTime ? Math.min(0.1, (now - lastFrameTime) / 1000) : 0;\r
          lastFrameTime = now;\r
          const animating = isAnimating();\r
          if (animating) {\r
            time += deltaSeconds * TIME_RATE * settings.speed;\r
            const angle = (settings.direction * Math.PI) / 180;\r
            const distance = settings.flow * cellPx * deltaSeconds;\r
            drift = [drift[0] + Math.cos(angle) * distance, drift[1] + Math.sin(angle) * distance];\r
          }\r
          const hovering = visible && !document.hidden && updateCharges(deltaSeconds);\r
          if (introArmed) {\r
            introArmed = false;\r
            introStart = now;\r
            introProgress = 0;\r
          }\r
          const introPlaying = introProgress < INTRO_END;\r
          if (introPlaying) {\r
            introProgress = Math.min(INTRO_END, ((now - introStart) / 1000 / settings.introDuration) * INTRO_END);\r
          }\r
          params.set({ placement: [gridOrigin[0], gridOrigin[1], rows, introProgress] });\r
          params.set({\r
            field: [\r
              NOISE_CELLS * cellPx * settings.scale,\r
              0.5 - (settings.brightness - 0.5) * 0.4,\r
              2.8 * settings.contrast,\r
              time\r
            ]\r
          });\r
          params.set({ motion: [drift[0], drift[1], settings.text.trim() ? 1 : 0, settings.fade] });\r
          try {\r
            frame(gpu, currentFrame => {\r
              if (!glowEnabled()) {\r
                currentFrame.pass(output, scene);\r
                return;\r
              }\r
              currentFrame.pass(sceneTarget, scene);\r
              currentFrame.pass(glowA, blurX);\r
              currentFrame.pass(glowB, blurY);\r
              currentFrame.pass(output, composite);\r
            });\r
          } catch (error) {\r
            reportFailure(error);\r
            return;\r
          }\r
          if (!presented) {\r
            presented = true;\r
            setReady(true);\r
          }\r
          if (animating || hovering || introPlaying) frameId = requestAnimationFrame(render);\r
          else lastFrameTime = 0;\r
        };\r
\r
        wakeRenderer = () => {\r
          if (disposed || failed || frameId) return;\r
          frameId = requestAnimationFrame(render);\r
        };\r
\r
        const drawMask = () => {\r
          const settings = settingsRef.current;\r
          const content = settings.text.trim();\r
          const [surfaceWidth, surfaceHeight] = output.size;\r
          const hasText = content.length > 0;\r
          const maskScale = hasText ? Math.min(1, MAX_MASK_SIZE / Math.max(surfaceWidth, surfaceHeight)) : 0;\r
          const maskWidth = hasText ? Math.max(1, Math.round(surfaceWidth * maskScale)) : 1;\r
          const maskHeight = hasText ? Math.max(1, Math.round(surfaceHeight * maskScale)) : 1;\r
\r
          maskCanvas.width = maskWidth;\r
          maskCanvas.height = maskHeight;\r
          maskContext.fillStyle = '#000';\r
          maskContext.fillRect(0, 0, maskWidth, maskHeight);\r
\r
          if (hasText) {\r
            let fontPx = Math.max(1, settings.textSize * maskHeight);\r
            maskContext.font = \`\${settings.fontWeight} \${fontPx}px \${settings.fontFamily}\`;\r
            const measured = maskContext.measureText(content).width;\r
            const maxWidth = maskWidth * 0.9;\r
            if (measured > maxWidth) {\r
              fontPx = Math.max(1, (fontPx * maxWidth) / measured);\r
              maskContext.font = \`\${settings.fontWeight} \${fontPx}px \${settings.fontFamily}\`;\r
            }\r
            maskContext.textAlign = 'center';\r
            maskContext.textBaseline = 'alphabetic';\r
            const metrics = maskContext.measureText(content);\r
            const x = (maskWidth + metrics.actualBoundingBoxLeft - metrics.actualBoundingBoxRight) / 2;\r
            const y = (maskHeight + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;\r
            maskContext.fillStyle = '#fff';\r
            maskContext.fillText(content, x, y);\r
          }\r
\r
          const nextTexture = createMaskTexture(maskWidth, maskHeight);\r
          gpu.gpu.queue.copyExternalImageToTexture({ source: maskCanvas }, { texture: nextTexture.gpu }, [\r
            maskWidth,\r
            maskHeight\r
          ]);\r
          scene.set({ maskTexture: nextTexture });\r
          maskTexture.destroy();\r
          maskTexture = nextTexture;\r
        };\r
\r
        const applySettings = () => {\r
          if (disposed || failed) return;\r
          const settings = settingsRef.current;\r
          configureGrid();\r
          params.set({\r
            placement: [gridOrigin[0], gridOrigin[1], rows, introProgress],\r
            grid: [cellPx, Math.min(1, Math.max(0.1, settings.dotSize)), SHAPE_MODES[settings.shapes] ?? 0, cols],\r
            color: [...parseColor(settings.color, '#929292'), 1],\r
            hover: [...parseColor(settings.hoverColor, '#ffffff'), glowEnabled() ? 1 : 0],\r
            background: [...parseColor(settings.backgroundColor, '#000000'), 1]\r
          });\r
          compositeParams.set({ strength: [2 * settings.glow, 0, 0, 0] });\r
          if (settings.intro !== lastIntro) {\r
            lastIntro = settings.intro;\r
            if (settings.intro && !reduceMotion.matches) introArmed = true;\r
          }\r
          if (!settings.interactive && chargesActive) {\r
            heights.fill(0);\r
            previousHeights.fill(0);\r
            charges.fill(0);\r
            chargesActive = false;\r
            chargeBuffer.write(charges);\r
          }\r
          wakeRenderer();\r
        };\r
\r
        const applyMask = () => {\r
          if (disposed || failed) return;\r
          drawMask();\r
          applySettings();\r
          const settings = settingsRef.current;\r
          if (!settings.text.trim() || !document.fonts?.load) return;\r
          document.fonts\r
            .load(\`\${settings.fontWeight} 32px \${settings.fontFamily}\`)\r
            .then(() => {\r
              if (disposed || failed) return;\r
              drawMask();\r
              wakeRenderer();\r
            })\r
            .catch(() => {});\r
        };\r
\r
        const resize = () => {\r
          if (disposed || failed) return;\r
          invalidateBounds();\r
          const nextSize = measureSurface();\r
          if (nextSize[0] !== output.size[0] || nextSize[1] !== output.size[1]) output.resize(nextSize);\r
          const [width, height] = output.size;\r
          sceneTarget.resize([width, height]);\r
          const half = glowSize([width, height]);\r
          glowA.resize(half);\r
          glowB.resize(half);\r
          blurParamsX.set({ direction: [1 / half[0], 0, 4, 1] });\r
          blurParamsY.set({ direction: [0, 1 / half[1], 4, 0] });\r
          params.set({ resolution: [width, height, 1 / width, 1 / height] });\r
          drawMask();\r
          applySettings();\r
        };\r
\r
        applySettingsRef.current = applySettings;\r
        applyMaskRef.current = applyMask;\r
        replayRef.current = () => {\r
          if (disposed || failed || !settingsRef.current.intro || reduceMotion.matches) return;\r
          introArmed = true;\r
          wakeRenderer();\r
        };\r
\r
        resizeObserver = new ResizeObserver(resize);\r
        resizeObserver.observe(root);\r
        visibilityObserver = new IntersectionObserver(\r
          entries => {\r
            visible = entries.some(entry => entry.isIntersecting);\r
            if (visible) wakeRenderer();\r
          },\r
          { threshold: 0 }\r
        );\r
        visibilityObserver.observe(root);\r
        document.addEventListener('visibilitychange', handleWake);\r
        reduceMotion.addEventListener('change', handleWake);\r
        window.addEventListener('pointermove', handlePointerMove, { passive: true });\r
        window.addEventListener('scroll', invalidateBounds, { capture: true, passive: true });\r
\r
        resize();\r
        applyMask();\r
      } catch (error) {\r
        reportFailure(error);\r
      }\r
    })();\r
\r
    return () => {\r
      disposed = true;\r
      wakeRenderer = () => {};\r
      applySettingsRef.current = () => {};\r
      applyMaskRef.current = () => {};\r
      replayRef.current = () => {};\r
      document.removeEventListener('visibilitychange', handleWake);\r
      reduceMotion.removeEventListener('change', handleWake);\r
      window.removeEventListener('pointermove', handlePointerMove);\r
      window.removeEventListener('scroll', invalidateBounds, { capture: true });\r
      resizeObserver?.disconnect();\r
      visibilityObserver?.disconnect();\r
      unsubscribeGpuError?.();\r
      if (frameId) cancelAnimationFrame(frameId);\r
      maskTexture?.destroy();\r
      chargeBuffer?.destroy();\r
      gpu?.dispose();\r
    };\r
  }, []);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`pointer-events-none relative isolate h-full w-full overflow-hidden \${className}\`}\r
      data-ready={ready}\r
      style={{ backgroundColor }}\r
      aria-hidden="true"\r
    >\r
      <canvas\r
        ref={canvasRef}\r
        className={\`pointer-events-none absolute inset-0 block h-full w-full transition-opacity duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none \${ready ? 'opacity-100' : 'opacity-0'}\`}\r
      />\r
    </div>\r
  );\r
}\r
`,t=`'use client';\r
\r
// Inspired by https://vercel.com/labs\r
import { useEffect, useRef, useState } from 'react';\r
import { effect, frame, init, sampler, storage, surface, target, uniforms } from 'vgpu';\r
import type { Gpu, StorageBuffer, Texture } from 'vgpu';\r
\r
type ChargeBuffer = StorageBuffer & { destroy(): void };\r
\r
import './ShapeWaves.css';\r
\r
const SHAPE_MODES = { mixed: 0, squares: 1, circles: 2, triangles: 3 } as const;\r
\r
export type ShapeWavesShapes = keyof typeof SHAPE_MODES;\r
const MAX_DPR = 2;\r
const MAX_MASK_SIZE = 1024;\r
const NOISE_CELLS = 32;\r
const TIME_RATE = 0.1;\r
const SIMULATION_STEP = 1 / 60;\r
const WAVE_SPEED = 0.42;\r
const WAVE_FRICTION = 0.94;\r
const WAVE_DECAY = 0.972;\r
const SETTLED_THRESHOLD = 0.01;\r
const INTRO_BAND = 0.2;\r
const INTRO_WARP = 0.3;\r
const INTRO_JITTER = 0.16;\r
const INTRO_END = 1 + INTRO_WARP + INTRO_JITTER + INTRO_BAND;\r
\r
const NOISE_WGSL = \`\r
fn mod289v3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
fn mod289v4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
fn permute(x: vec4f) -> vec4f { return mod289v4(((x * 34.0) + 10.0) * x); }\r
fn taylorInvSqrt(r: vec4f) -> vec4f { return 1.79284291400159 - 0.85373472095314 * r; }\r
fn fadeCurve(t: vec3f) -> vec3f { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\r
\r
fn cnoise(P: vec3f) -> f32 {\r
  var Pi0 = floor(P);\r
  var Pi1 = Pi0 + vec3f(1.0);\r
  Pi0 = mod289v3(Pi0);\r
  Pi1 = mod289v3(Pi1);\r
  let Pf0 = fract(P);\r
  let Pf1 = Pf0 - vec3f(1.0);\r
  let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\r
  let iy = vec4f(Pi0.yy, Pi1.yy);\r
  let iz0 = Pi0.zzzz;\r
  let iz1 = Pi1.zzzz;\r
\r
  let ixy = permute(permute(ix) + iy);\r
  let ixy0 = permute(ixy + iz0);\r
  let ixy1 = permute(ixy + iz1);\r
\r
  var gx0 = ixy0 * (1.0 / 7.0);\r
  var gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\r
  gx0 = fract(gx0);\r
  let gz0 = vec4f(0.5) - abs(gx0) - abs(gy0);\r
  let sz0 = step(gz0, vec4f(0.0));\r
  gx0 -= sz0 * (step(vec4f(0.0), gx0) - 0.5);\r
  gy0 -= sz0 * (step(vec4f(0.0), gy0) - 0.5);\r
\r
  var gx1 = ixy1 * (1.0 / 7.0);\r
  var gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\r
  gx1 = fract(gx1);\r
  let gz1 = vec4f(0.5) - abs(gx1) - abs(gy1);\r
  let sz1 = step(gz1, vec4f(0.0));\r
  gx1 -= sz1 * (step(vec4f(0.0), gx1) - 0.5);\r
  gy1 -= sz1 * (step(vec4f(0.0), gy1) - 0.5);\r
\r
  var g000 = vec3f(gx0.x, gy0.x, gz0.x);\r
  var g100 = vec3f(gx0.y, gy0.y, gz0.y);\r
  var g010 = vec3f(gx0.z, gy0.z, gz0.z);\r
  var g110 = vec3f(gx0.w, gy0.w, gz0.w);\r
  var g001 = vec3f(gx1.x, gy1.x, gz1.x);\r
  var g101 = vec3f(gx1.y, gy1.y, gz1.y);\r
  var g011 = vec3f(gx1.z, gy1.z, gz1.z);\r
  var g111 = vec3f(gx1.w, gy1.w, gz1.w);\r
\r
  let norm0 = taylorInvSqrt(vec4f(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\r
  g000 *= norm0.x;\r
  g010 *= norm0.y;\r
  g100 *= norm0.z;\r
  g110 *= norm0.w;\r
  let norm1 = taylorInvSqrt(vec4f(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\r
  g001 *= norm1.x;\r
  g011 *= norm1.y;\r
  g101 *= norm1.z;\r
  g111 *= norm1.w;\r
\r
  let n000 = dot(g000, Pf0);\r
  let n100 = dot(g100, vec3f(Pf1.x, Pf0.yz));\r
  let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));\r
  let n110 = dot(g110, vec3f(Pf1.xy, Pf0.z));\r
  let n001 = dot(g001, vec3f(Pf0.xy, Pf1.z));\r
  let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));\r
  let n011 = dot(g011, vec3f(Pf0.x, Pf1.yz));\r
  let n111 = dot(g111, Pf1);\r
\r
  let f = fadeCurve(Pf0);\r
  let nz = mix(vec4f(n000, n100, n010, n110), vec4f(n001, n101, n011, n111), f.z);\r
  let ny = mix(nz.xy, nz.zw, f.y);\r
  return 2.2 * mix(ny.x, ny.y, f.x);\r
}\r
\r
fn fbm(p: vec3f) -> f32 {\r
  var total = 0.0;\r
  var amplitude = 1.0;\r
  var weight = 0.0;\r
  var frequency = 1.0;\r
  for (var i = 0; i < 2; i++) {\r
    total += amplitude * cnoise(p * frequency);\r
    weight += amplitude;\r
    amplitude *= 0.5;\r
    frequency *= 2.0;\r
  }\r
  return total / weight;\r
}\r
\`;\r
\r
const SCENE_SHADER = \`\r
struct Params {\r
  resolution: vec4f,\r
  placement: vec4f,\r
  grid: vec4f,\r
  field: vec4f,\r
  motion: vec4f,\r
  color: vec4f,\r
  hover: vec4f,\r
  background: vec4f,\r
}\r
@group(0) @binding(0) var<uniform> params: Params;\r
@group(0) @binding(1) var maskTexture: texture_2d<f32>;\r
@group(0) @binding(2) var maskSampler: sampler;\r
@group(0) @binding(3) var<storage, read> charges: array<f32>;\r
\r
const SEED = vec2f(12.9898, 78.233);\r
const GLOW_THRESHOLD = 0.6;\r
\${NOISE_WGSL}\r
\r
fn sdIsoscelesTriangle(point: vec2f, q: vec2f) -> f32 {\r
  let p = vec2f(abs(point.x), point.y);\r
  let a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);\r
  let b = p - q * vec2f(clamp(p.x / q.x, 0.0, 1.0), 1.0);\r
  let s = -sign(q.y);\r
  let d = min(vec2f(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2f(dot(b, b), s * (p.y - q.y)));\r
  return -sqrt(d.x) * sign(d.y);\r
}\r
\r
fn shapeDistance(p: vec2f, shape: i32, c: f32) -> f32 {\r
  if (shape == 0) { return max(abs(p.x), abs(p.y)) - c; }\r
  if (shape == 1) { return length(p) - c; }\r
  return sdIsoscelesTriangle(vec2f(p.x, p.y + c), vec2f(c, 2.0 * c));\r
}\r
\r
fn hash21(p: vec2f) -> f32 {\r
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);\r
}\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let resolution = params.resolution.xy;\r
  let cellPx = params.grid.x;\r
  let dotSize = params.grid.y;\r
  let mode = i32(params.grid.z + 0.5);\r
  let cols = i32(params.grid.w + 0.5);\r
  let background = params.background.rgb;\r
  let toSurface = params.hover.w < 0.5;\r
\r
  let pixel = uv * resolution;\r
  let origin = params.placement.xy;\r
  let rows = i32(params.placement.z + 0.5);\r
  let cell = floor((pixel - origin) / cellPx);\r
  if (cell.y < 0.0 || i32(cell.y) >= rows || cell.x < 0.0 || i32(cell.x) >= cols) {\r
    return vec4f(background, select(0.0, 1.0, toSurface));\r
  }\r
  let center = origin + (cell + 0.5) * cellPx;\r
  let local = (pixel - center) / (cellPx * 0.5);\r
  let cellUv = center / resolution;\r
\r
  if (params.motion.z > 0.5 && textureSampleLevel(maskTexture, maskSampler, cellUv, 0.0).r > 0.5) {\r
    return vec4f(background, select(0.0, 1.0, toSurface));\r
  }\r
\r
  var level = 1.0;\r
  let fade = params.motion.w;\r
  if (fade > 0.0) {\r
    let q = abs(uv * 2.0 - 1.0);\r
    let radius = pow(pow(q.x, 2.5) + pow(q.y, 2.5), 1.0 / 2.5) / pow(2.0, 1.0 / 2.5);\r
    level = 1.0 - smoothstep(max(0.0, 1.0 - fade * 2.2), 1.0, radius);\r
  }\r
  let noise = fbm(vec3f((center + params.motion.xy) / params.field.x + SEED, params.field.w));\r
  let tone = clamp((noise * 0.5 + 0.5 - params.field.y) * params.field.z + 0.5, 0.0, 1.0);\r
  let band = i32(min(tone, 0.999999) * 3.0);\r
\r
  var charge = 0.0;\r
  let index = i32(cell.y) * cols + i32(cell.x);\r
  if (index >= 0 && index < i32(arrayLength(&charges))) { charge = charges[index]; }\r
  let stepped = (band + i32(clamp(charge, 0.0, 0.999) * 3.0)) % 3;\r
\r
  var shape = 2 - stepped;\r
  var size = dotSize;\r
  if (mode != 0) {\r
    shape = mode - 1;\r
    size = dotSize * mix(0.45, 1.0, f32(stepped) / 2.0);\r
  }\r
  let introProgress = params.placement.w;\r
  var front = 0.0;\r
  if (introProgress < \${INTRO_END.toFixed(2)}) {\r
    let radial = length((center - resolution * 0.5) / (resolution * 0.5)) * 0.70710678;\r
    let warp = cnoise(vec3f(cellUv * vec2f(3.2, 2.4) + SEED, 4.7)) * \${INTRO_WARP.toFixed(2)};\r
    let jitter = hash21(cell) * \${INTRO_JITTER.toFixed(2)};\r
    let spread = radial + warp + jitter + \${INTRO_WARP.toFixed(2)};\r
    let band = \${INTRO_BAND.toFixed(2)} * (0.6 + 0.8 * hash21(cell + vec2f(17.0, 9.0)));\r
    let t = clamp((introProgress - spread) / band, 0.0, 1.0);\r
    if (t <= 0.0) {\r
      return vec4f(background, select(0.0, 1.0, toSurface));\r
    }\r
    let back = t - 1.0;\r
    size = max(size * (1.0 + 2.70158 * back * back * back + 1.70158 * back * back), 0.02);\r
    front = 1.0 - smoothstep(0.0, 1.0, abs(introProgress - spread) / band);\r
  }\r
  let aa = 2.0 / cellPx;\r
  let coverage = smoothstep(aa, -aa, shapeDistance(local, shape, size));\r
\r
  let tint = mix(params.color.rgb, params.hover.rgb, max(smoothstep(0.15, 0.85, charge), front * 0.35));\r
\r
  let rgb = mix(background, tint, coverage * level);\r
  if (toSurface) { return vec4f(rgb, 1.0); }\r
  let luminance = dot(tint * level, vec3f(0.2126, 0.7152, 0.0722));\r
  let glow = max(0.0, (luminance - GLOW_THRESHOLD) / (1.0 - GLOW_THRESHOLD)) * coverage;\r
  return vec4f(rgb, glow);\r
}\r
\`;\r
\r
const BLUR_SHADER = \`\r
struct Blur { direction: vec4f }\r
@group(0) @binding(0) var<uniform> blur: Blur;\r
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;\r
@group(0) @binding(2) var sourceSampler: sampler;\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let sigma = blur.direction.z;\r
  let radius = i32(ceil(3.0 * sigma));\r
  var sum = vec3f(0.0);\r
  var weight = 0.0;\r
  for (var i = -radius; i <= radius; i++) {\r
    let offset = f32(i);\r
    let w = exp(-(offset * offset) / (2.0 * sigma * sigma));\r
    let sample = textureSampleLevel(sourceTexture, sourceSampler, uv + offset * blur.direction.xy, 0.0);\r
    sum += select(sample.rgb, sample.rgb * sample.a, blur.direction.w > 0.5) * w;\r
    weight += w;\r
  }\r
  return vec4f(sum / weight, 1.0);\r
}\r
\`;\r
\r
const COMPOSITE_SHADER = \`\r
struct Composite { strength: vec4f }\r
@group(0) @binding(0) var<uniform> composite: Composite;\r
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;\r
@group(0) @binding(2) var glowTexture: texture_2d<f32>;\r
@group(0) @binding(3) var linearSampler: sampler;\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let scene = textureSampleLevel(sceneTexture, linearSampler, uv, 0.0).rgb;\r
  let glow = textureSampleLevel(glowTexture, linearSampler, uv, 0.0).rgb;\r
  return vec4f(scene + glow * composite.strength.x, 1.0);\r
}\r
\`;\r
\r
const parseColor = (value: string | undefined, fallback: string): [number, number, number] => {\r
  const source = typeof value === 'string' ? value.trim() : '';\r
  const match = /^#?([\\da-f]{3}|[\\da-f]{6})$/i.exec(source) || /^#?([\\da-f]{6})$/i.exec(fallback);\r
  let hex = (match as RegExpExecArray)[1];\r
  if (hex.length === 3) hex = hex.replace(/./g, char => char + char);\r
  return [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255) as [number, number, number];\r
};\r
\r
export interface ShapeWavesProps {\r
  text?: string;\r
  fontFamily?: string;\r
  fontWeight?: string | number;\r
  textSize?: number;\r
  shapes?: ShapeWavesShapes;\r
  cellSize?: number;\r
  dotSize?: number;\r
  color?: string;\r
  hoverColor?: string;\r
  backgroundColor?: string;\r
  speed?: number;\r
  scale?: number;\r
  contrast?: number;\r
  brightness?: number;\r
  flow?: number;\r
  direction?: number;\r
  fade?: number;\r
  interactive?: boolean;\r
  splashRadius?: number;\r
  splashStrength?: number;\r
  glow?: number;\r
  intro?: boolean;\r
  introDuration?: number;\r
  introKey?: string | number;\r
  paused?: boolean;\r
  onError?: (error: Error) => void;\r
  className?: string;\r
}\r
\r
interface ShapeWavesSettings {\r
  text: string;\r
  fontFamily: string;\r
  fontWeight: string | number;\r
  textSize: number;\r
  shapes: ShapeWavesShapes;\r
  cellSize: number;\r
  dotSize: number;\r
  color: string;\r
  hoverColor: string;\r
  backgroundColor: string;\r
  speed: number;\r
  scale: number;\r
  contrast: number;\r
  brightness: number;\r
  flow: number;\r
  direction: number;\r
  fade: number;\r
  interactive: boolean;\r
  splashRadius: number;\r
  splashStrength: number;\r
  glow: number;\r
  intro: boolean;\r
  introDuration: number;\r
  introKey: string | number;\r
  paused: boolean;\r
}\r
\r
export default function ShapeWaves({\r
  text = '',\r
  fontFamily = 'Geist, "Geist Sans", system-ui, sans-serif',\r
  fontWeight = 500,\r
  textSize = 0.6,\r
  shapes = 'mixed',\r
  cellSize = 10,\r
  dotSize = 0.75,\r
  color = '#929292',\r
  hoverColor = '#ffffff',\r
  backgroundColor = '#000000',\r
  speed = 1,\r
  scale = 1,\r
  contrast = 1,\r
  brightness = 0.4,\r
  flow = 0,\r
  direction = 0,\r
  fade = 0.25,\r
  interactive = true,\r
  splashRadius = 40,\r
  splashStrength = 0.4,\r
  glow = 0.35,\r
  intro = true,\r
  introDuration = 1.6,\r
  introKey = 0,\r
  paused = false,\r
  onError,\r
  className = ''\r
}: ShapeWavesProps) {\r
  const rootRef = useRef<HTMLDivElement | null>(null);\r
  const canvasRef = useRef<HTMLCanvasElement | null>(null);\r
  const [ready, setReady] = useState(false);\r
  const settingsRef = useRef<ShapeWavesSettings>(null as unknown as ShapeWavesSettings);\r
  const applySettingsRef = useRef<() => void>(() => {});\r
  const applyMaskRef = useRef<() => void>(() => {});\r
  const onErrorRef = useRef<ShapeWavesProps['onError']>(onError);\r
\r
  settingsRef.current = {\r
    text: String(text ?? ''),\r
    fontFamily,\r
    fontWeight,\r
    textSize,\r
    shapes,\r
    cellSize: Math.max(2, cellSize),\r
    dotSize,\r
    color,\r
    hoverColor,\r
    backgroundColor,\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    contrast,\r
    brightness,\r
    flow,\r
    direction,\r
    fade,\r
    interactive,\r
    splashRadius,\r
    splashStrength,\r
    glow,\r
    intro,\r
    introDuration: Math.max(0.1, introDuration),\r
    introKey,\r
    paused\r
  };\r
  onErrorRef.current = onError;\r
\r
  const settingsSignature = [\r
    shapes,\r
    cellSize,\r
    dotSize,\r
    color,\r
    hoverColor,\r
    backgroundColor,\r
    speed,\r
    scale,\r
    contrast,\r
    brightness,\r
    flow,\r
    direction,\r
    fade,\r
    interactive,\r
    splashRadius,\r
    splashStrength,\r
    glow,\r
    intro,\r
    introDuration,\r
    paused\r
  ].join('|');\r
  const maskSignature = [text, fontFamily, fontWeight, textSize].join('|');\r
  const replayRef = useRef<() => void>(() => {});\r
\r
  useEffect(() => {\r
    applySettingsRef.current();\r
  }, [settingsSignature]);\r
\r
  useEffect(() => {\r
    applyMaskRef.current();\r
  }, [maskSignature]);\r
\r
  useEffect(() => {\r
    if (introKey) replayRef.current();\r
  }, [introKey]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    if (!root || !canvas) return undefined;\r
\r
    let disposed = false;\r
    let failed = false;\r
    let gpu: Gpu | undefined;\r
    let maskTexture: Texture | undefined;\r
    let chargeBuffer: ChargeBuffer | undefined;\r
    let frameId = 0;\r
    let lastFrameTime = 0;\r
    let time = 0;\r
    let drift: [number, number] = [0, 0];\r
    let dpr = 1;\r
    let visible = true;\r
    let presented = false;\r
    let cols = 1;\r
    let rows = 1;\r
    let cellPx = 10;\r
    let gridOrigin: [number, number] = [0, 0];\r
    let charges = new Float32Array(1);\r
    let heights = new Float32Array(1);\r
    let previousHeights = new Float32Array(1);\r
    let simulationBacklog = 0;\r
    let introStart = 0;\r
    let introProgress = INTRO_END;\r
    let introArmed = false;\r
    let chargesActive = false;\r
    let bounds: DOMRect | null = null;\r
    let unsubscribeGpuError: (() => void) | undefined;\r
    let resizeObserver: ResizeObserver | undefined;\r
    let visibilityObserver: IntersectionObserver | undefined;\r
    let wakeRenderer: () => void = () => {};\r
    const pointer = { x: 0, y: 0, at: 0, inside: false };\r
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');\r
    const maskCanvas = document.createElement('canvas');\r
    const maskContext = maskCanvas.getContext('2d') as CanvasRenderingContext2D;\r
\r
    const handleWake = () => wakeRenderer();\r
    const invalidateBounds = () => {\r
      bounds = null;\r
    };\r
    const splash = (x: number, y: number, strength: number) => {\r
      const settings = settingsRef.current;\r
      const sigma = Math.max(0.5, ((settings.splashRadius * dpr) / cellPx) * 0.5);\r
      const reach = Math.ceil(sigma * 2.5);\r
      const centerCol = (x * dpr - gridOrigin[0]) / cellPx - 0.5;\r
      const centerRow = (y * dpr - gridOrigin[1]) / cellPx - 0.5;\r
      const minRow = Math.max(0, Math.floor(centerRow - reach));\r
      const maxRow = Math.min(rows - 1, Math.ceil(centerRow + reach));\r
      const minCol = Math.max(0, Math.floor(centerCol - reach));\r
      const maxCol = Math.min(cols - 1, Math.ceil(centerCol + reach));\r
      for (let row = minRow; row <= maxRow; row++) {\r
        const dy = row - centerRow;\r
        for (let col = minCol; col <= maxCol; col++) {\r
          const dx = col - centerCol;\r
          const bump = strength * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));\r
          const index = row * cols + col;\r
          heights[index] = Math.min(1.2, heights[index] + bump);\r
        }\r
      }\r
      chargesActive = true;\r
    };\r
\r
    const handlePointerMove = (event: PointerEvent) => {\r
      if (!settingsRef.current.interactive) return;\r
      if (!bounds) bounds = root.getBoundingClientRect();\r
      const now = performance.now();\r
      const x = event.clientX - bounds.left;\r
      const y = event.clientY - bounds.top;\r
      const inside = x >= 0 && y >= 0 && x <= bounds.width && y <= bounds.height;\r
      if (inside) {\r
        const elapsed = pointer.inside ? Math.max(8, now - pointer.at) : 16;\r
        const travelled = pointer.inside ? Math.hypot(x - pointer.x, y - pointer.y) : 0;\r
        const speed = (travelled / elapsed) * 1000;\r
        splash(x, y, Math.min(1, 0.22 + speed * 0.0006) * settingsRef.current.splashStrength);\r
        wakeRenderer();\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.at = now;\r
      pointer.inside = inside;\r
    };\r
\r
    const reportFailure = (error: unknown) => {\r
      if (disposed || failed) return;\r
      failed = true;\r
      if (frameId) cancelAnimationFrame(frameId);\r
      frameId = 0;\r
      resizeObserver?.disconnect();\r
      visibilityObserver?.disconnect();\r
      unsubscribeGpuError?.();\r
      applySettingsRef.current = () => {};\r
      applyMaskRef.current = () => {};\r
      const failedGpu = gpu;\r
      gpu = undefined;\r
      failedGpu?.dispose();\r
      setReady(false);\r
      onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));\r
    };\r
\r
    const measureSurface = (): [number, number] => {\r
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);\r
      return [Math.max(1, Math.round(canvas.clientWidth * dpr)), Math.max(1, Math.round(canvas.clientHeight * dpr))];\r
    };\r
\r
    void (async () => {\r
      try {\r
        const activeGpu = await init({ powerPreference: 'low-power' });\r
        gpu = activeGpu;\r
        if (disposed) return activeGpu.dispose();\r
        unsubscribeGpuError = activeGpu.onError(reportFailure);\r
\r
        const initialSize = measureSurface();\r
        const outputFormat = (\r
          navigator as Navigator & { gpu: { getPreferredCanvasFormat(): string } }\r
        ).gpu.getPreferredCanvasFormat();\r
        const output = surface(activeGpu, canvas, { dpr, size: initialSize, autoResize: false, format: outputFormat });\r
\r
        const params = uniforms(activeGpu, {\r
          resolution: [initialSize[0], initialSize[1], 1 / initialSize[0], 1 / initialSize[1]],\r
          placement: [0, 0, 1, 0],\r
          grid: [10, 0.75, 0, 1],\r
          field: [320, 0.5, 2.8, 0],\r
          motion: [0, 0, 0, 0.25],\r
          color: [0.573, 0.573, 0.573, 1],\r
          hover: [1, 1, 1, 0],\r
          background: [0, 0, 0, 1]\r
        });\r
        const linearSampler = sampler(activeGpu, {\r
          minFilter: 'linear',\r
          magFilter: 'linear',\r
          addressModeU: 'clamp-to-edge',\r
          addressModeV: 'clamp-to-edge'\r
        });\r
        const createMaskTexture = (maskWidth: number, maskHeight: number) =>\r
          activeGpu.device.createTexture({\r
            size: [maskWidth, maskHeight],\r
            format: 'rgba8unorm',\r
            usage: ['texture_binding', 'copy_dst', 'render_attachment'],\r
            label: 'shape-waves-mask'\r
          });\r
        const initialMaskTexture = createMaskTexture(1, 1);\r
        maskTexture = initialMaskTexture;\r
        const initialChargeBuffer = storage(activeGpu, 4, 'read') as ChargeBuffer;\r
        initialChargeBuffer.write(charges);\r
        chargeBuffer = initialChargeBuffer;\r
\r
        const scene = effect(activeGpu, SCENE_SHADER, {\r
          label: 'shape-waves-scene',\r
          set: { params, maskTexture: initialMaskTexture, maskSampler: linearSampler, charges: initialChargeBuffer }\r
        });\r
        const sceneTarget = target(activeGpu, { size: initialSize, format: 'rgba8unorm', label: 'shape-waves-scene' });\r
        const glowSize = (size: readonly [number, number]): [number, number] => [\r
          Math.max(1, Math.ceil(size[0] / 2)),\r
          Math.max(1, Math.ceil(size[1] / 2))\r
        ];\r
        const glowA = target(activeGpu, {\r
          size: glowSize(initialSize),\r
          format: 'rgba8unorm',\r
          label: 'shape-waves-glow-a'\r
        });\r
        const glowB = target(activeGpu, {\r
          size: glowSize(initialSize),\r
          format: 'rgba8unorm',\r
          label: 'shape-waves-glow-b'\r
        });\r
        const blurParamsX = uniforms(activeGpu, { direction: [0, 0, 4, 1] });\r
        const blurParamsY = uniforms(activeGpu, { direction: [0, 0, 4, 0] });\r
        const blurX = effect(activeGpu, BLUR_SHADER, {\r
          label: 'shape-waves-glow-x',\r
          set: { blur: blurParamsX, sourceTexture: sceneTarget, sourceSampler: linearSampler }\r
        });\r
        const blurY = effect(activeGpu, BLUR_SHADER, {\r
          label: 'shape-waves-glow-y',\r
          set: { blur: blurParamsY, sourceTexture: glowA, sourceSampler: linearSampler }\r
        });\r
        const compositeParams = uniforms(activeGpu, { strength: [2, 0, 0, 0] });\r
        const composite = effect(activeGpu, COMPOSITE_SHADER, {\r
          label: 'shape-waves-composite',\r
          set: { composite: compositeParams, sceneTexture: sceneTarget, glowTexture: glowB, linearSampler }\r
        });\r
        await Promise.all([\r
          scene.compile({ colors: [outputFormat] }),\r
          scene.compile(sceneTarget),\r
          blurX.compile(glowA),\r
          blurY.compile(glowB),\r
          composite.compile({ colors: [outputFormat] })\r
        ]);\r
        if (disposed) return;\r
\r
        const glowEnabled = () => settingsRef.current.glow > 0;\r
        let lastIntro = false;\r
\r
        const configureGrid = () => {\r
          const settings = settingsRef.current;\r
          const [width, height] = output.size;\r
          const nextCols = Math.max(1, Math.round(width / (settings.cellSize * dpr)));\r
          cellPx = width / nextCols;\r
          const nextRows = Math.max(1, Math.floor(height / cellPx));\r
          gridOrigin = [0, (height - nextRows * cellPx) / 2];\r
          if (nextCols === cols && nextRows === rows && charges.length === cols * rows) return;\r
          cols = nextCols;\r
          rows = nextRows;\r
          charges = new Float32Array(cols * rows);\r
          heights = new Float32Array(cols * rows);\r
          previousHeights = new Float32Array(cols * rows);\r
          chargesActive = false;\r
          const nextBuffer = storage(activeGpu, charges.byteLength, 'read') as ChargeBuffer;\r
          nextBuffer.write(charges);\r
          scene.set({ charges: nextBuffer });\r
          chargeBuffer?.destroy();\r
          chargeBuffer = nextBuffer;\r
        };\r
\r
        const stepRipples = () => {\r
          const lastCol = cols - 1;\r
          const lastRow = rows - 1;\r
          let peak = 0;\r
          for (let row = 0; row < rows; row++) {\r
            const up = (row === 0 ? row : row - 1) * cols;\r
            const down = (row === lastRow ? row : row + 1) * cols;\r
            const base = row * cols;\r
            for (let col = 0; col < cols; col++) {\r
              const index = base + col;\r
              const left = base + (col === 0 ? col : col - 1);\r
              const right = base + (col === lastCol ? col : col + 1);\r
              const height = heights[index];\r
              const laplacian = heights[left] + heights[right] + heights[up + col] + heights[down + col] - 4 * height;\r
              const velocity = (height - previousHeights[index]) * WAVE_FRICTION;\r
              const next = (height + velocity + WAVE_SPEED * laplacian) * WAVE_DECAY;\r
              previousHeights[index] = next;\r
              const charge = Math.min(1, Math.max(0, next));\r
              charges[index] = charge;\r
              if (charge > peak) peak = charge;\r
            }\r
          }\r
          const swap = heights;\r
          heights = previousHeights;\r
          previousHeights = swap;\r
          return peak;\r
        };\r
\r
        const updateCharges = (deltaSeconds: number) => {\r
          if (!chargesActive) return false;\r
          simulationBacklog = Math.min(simulationBacklog + deltaSeconds, SIMULATION_STEP * 4);\r
          let peak = 1;\r
          while (simulationBacklog >= SIMULATION_STEP) {\r
            simulationBacklog -= SIMULATION_STEP;\r
            peak = stepRipples();\r
          }\r
          if (peak < SETTLED_THRESHOLD) {\r
            heights.fill(0);\r
            previousHeights.fill(0);\r
            charges.fill(0);\r
            chargesActive = false;\r
          }\r
          chargeBuffer?.write(charges);\r
          return chargesActive;\r
        };\r
\r
        const isAnimating = () => {\r
          const settings = settingsRef.current;\r
          return visible && !document.hidden && !settings.paused && settings.speed > 0 && !reduceMotion.matches;\r
        };\r
\r
        const render = (now: number) => {\r
          frameId = 0;\r
          if (disposed || failed) return;\r
          const settings = settingsRef.current;\r
          const deltaSeconds = lastFrameTime ? Math.min(0.1, (now - lastFrameTime) / 1000) : 0;\r
          lastFrameTime = now;\r
          const animating = isAnimating();\r
          if (animating) {\r
            time += deltaSeconds * TIME_RATE * settings.speed;\r
            const angle = (settings.direction * Math.PI) / 180;\r
            const distance = settings.flow * cellPx * deltaSeconds;\r
            drift = [drift[0] + Math.cos(angle) * distance, drift[1] + Math.sin(angle) * distance];\r
          }\r
          const hovering = visible && !document.hidden && updateCharges(deltaSeconds);\r
          if (introArmed) {\r
            introArmed = false;\r
            introStart = now;\r
            introProgress = 0;\r
          }\r
          const introPlaying = introProgress < INTRO_END;\r
          if (introPlaying) {\r
            introProgress = Math.min(INTRO_END, ((now - introStart) / 1000 / settings.introDuration) * INTRO_END);\r
          }\r
          params.set({ placement: [gridOrigin[0], gridOrigin[1], rows, introProgress] });\r
          params.set({\r
            field: [\r
              NOISE_CELLS * cellPx * settings.scale,\r
              0.5 - (settings.brightness - 0.5) * 0.4,\r
              2.8 * settings.contrast,\r
              time\r
            ]\r
          });\r
          params.set({ motion: [drift[0], drift[1], settings.text.trim() ? 1 : 0, settings.fade] });\r
          try {\r
            frame(activeGpu, currentFrame => {\r
              if (!glowEnabled()) {\r
                currentFrame.pass(output, scene);\r
                return;\r
              }\r
              currentFrame.pass(sceneTarget, scene);\r
              currentFrame.pass(glowA, blurX);\r
              currentFrame.pass(glowB, blurY);\r
              currentFrame.pass(output, composite);\r
            });\r
          } catch (error) {\r
            reportFailure(error);\r
            return;\r
          }\r
          if (!presented) {\r
            presented = true;\r
            setReady(true);\r
          }\r
          if (animating || hovering || introPlaying) frameId = requestAnimationFrame(render);\r
          else lastFrameTime = 0;\r
        };\r
\r
        wakeRenderer = () => {\r
          if (disposed || failed || frameId) return;\r
          frameId = requestAnimationFrame(render);\r
        };\r
\r
        const drawMask = () => {\r
          const settings = settingsRef.current;\r
          const content = settings.text.trim();\r
          const [surfaceWidth, surfaceHeight] = output.size;\r
          const hasText = content.length > 0;\r
          const maskScale = hasText ? Math.min(1, MAX_MASK_SIZE / Math.max(surfaceWidth, surfaceHeight)) : 0;\r
          const maskWidth = hasText ? Math.max(1, Math.round(surfaceWidth * maskScale)) : 1;\r
          const maskHeight = hasText ? Math.max(1, Math.round(surfaceHeight * maskScale)) : 1;\r
\r
          maskCanvas.width = maskWidth;\r
          maskCanvas.height = maskHeight;\r
          maskContext.fillStyle = '#000';\r
          maskContext.fillRect(0, 0, maskWidth, maskHeight);\r
\r
          if (hasText) {\r
            let fontPx = Math.max(1, settings.textSize * maskHeight);\r
            maskContext.font = \`\${settings.fontWeight} \${fontPx}px \${settings.fontFamily}\`;\r
            const measured = maskContext.measureText(content).width;\r
            const maxWidth = maskWidth * 0.9;\r
            if (measured > maxWidth) {\r
              fontPx = Math.max(1, (fontPx * maxWidth) / measured);\r
              maskContext.font = \`\${settings.fontWeight} \${fontPx}px \${settings.fontFamily}\`;\r
            }\r
            maskContext.textAlign = 'center';\r
            maskContext.textBaseline = 'alphabetic';\r
            const metrics = maskContext.measureText(content);\r
            const x = (maskWidth + metrics.actualBoundingBoxLeft - metrics.actualBoundingBoxRight) / 2;\r
            const y = (maskHeight + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;\r
            maskContext.fillStyle = '#fff';\r
            maskContext.fillText(content, x, y);\r
          }\r
\r
          const nextTexture = createMaskTexture(maskWidth, maskHeight);\r
          activeGpu.gpu.queue.copyExternalImageToTexture({ source: maskCanvas }, { texture: nextTexture.gpu }, [\r
            maskWidth,\r
            maskHeight\r
          ]);\r
          scene.set({ maskTexture: nextTexture });\r
          maskTexture?.destroy();\r
          maskTexture = nextTexture;\r
        };\r
\r
        const applySettings = () => {\r
          if (disposed || failed) return;\r
          const settings = settingsRef.current;\r
          configureGrid();\r
          params.set({\r
            placement: [gridOrigin[0], gridOrigin[1], rows, introProgress],\r
            grid: [cellPx, Math.min(1, Math.max(0.1, settings.dotSize)), SHAPE_MODES[settings.shapes] ?? 0, cols],\r
            color: [...parseColor(settings.color, '#929292'), 1],\r
            hover: [...parseColor(settings.hoverColor, '#ffffff'), glowEnabled() ? 1 : 0],\r
            background: [...parseColor(settings.backgroundColor, '#000000'), 1]\r
          });\r
          compositeParams.set({ strength: [2 * settings.glow, 0, 0, 0] });\r
          if (settings.intro !== lastIntro) {\r
            lastIntro = settings.intro;\r
            if (settings.intro && !reduceMotion.matches) introArmed = true;\r
          }\r
          if (!settings.interactive && chargesActive) {\r
            heights.fill(0);\r
            previousHeights.fill(0);\r
            charges.fill(0);\r
            chargesActive = false;\r
            chargeBuffer?.write(charges);\r
          }\r
          wakeRenderer();\r
        };\r
\r
        const applyMask = () => {\r
          if (disposed || failed) return;\r
          drawMask();\r
          applySettings();\r
          const settings = settingsRef.current;\r
          if (!settings.text.trim() || !document.fonts?.load) return;\r
          document.fonts\r
            .load(\`\${settings.fontWeight} 32px \${settings.fontFamily}\`)\r
            .then(() => {\r
              if (disposed || failed) return;\r
              drawMask();\r
              wakeRenderer();\r
            })\r
            .catch(() => {});\r
        };\r
\r
        const resize = () => {\r
          if (disposed || failed) return;\r
          invalidateBounds();\r
          const nextSize = measureSurface();\r
          if (nextSize[0] !== output.size[0] || nextSize[1] !== output.size[1]) output.resize(nextSize);\r
          const [width, height] = output.size;\r
          sceneTarget.resize([width, height]);\r
          const half = glowSize([width, height]);\r
          glowA.resize(half);\r
          glowB.resize(half);\r
          blurParamsX.set({ direction: [1 / half[0], 0, 4, 1] });\r
          blurParamsY.set({ direction: [0, 1 / half[1], 4, 0] });\r
          params.set({ resolution: [width, height, 1 / width, 1 / height] });\r
          drawMask();\r
          applySettings();\r
        };\r
\r
        applySettingsRef.current = applySettings;\r
        applyMaskRef.current = applyMask;\r
        replayRef.current = () => {\r
          if (disposed || failed || !settingsRef.current.intro || reduceMotion.matches) return;\r
          introArmed = true;\r
          wakeRenderer();\r
        };\r
\r
        resizeObserver = new ResizeObserver(resize);\r
        resizeObserver.observe(root);\r
        visibilityObserver = new IntersectionObserver(\r
          entries => {\r
            visible = entries.some(entry => entry.isIntersecting);\r
            if (visible) wakeRenderer();\r
          },\r
          { threshold: 0 }\r
        );\r
        visibilityObserver.observe(root);\r
        document.addEventListener('visibilitychange', handleWake);\r
        reduceMotion.addEventListener('change', handleWake);\r
        window.addEventListener('pointermove', handlePointerMove, { passive: true });\r
        window.addEventListener('scroll', invalidateBounds, { capture: true, passive: true });\r
\r
        resize();\r
        applyMask();\r
      } catch (error) {\r
        reportFailure(error);\r
      }\r
    })();\r
\r
    return () => {\r
      disposed = true;\r
      wakeRenderer = () => {};\r
      applySettingsRef.current = () => {};\r
      applyMaskRef.current = () => {};\r
      replayRef.current = () => {};\r
      document.removeEventListener('visibilitychange', handleWake);\r
      reduceMotion.removeEventListener('change', handleWake);\r
      window.removeEventListener('pointermove', handlePointerMove);\r
      window.removeEventListener('scroll', invalidateBounds, { capture: true } as EventListenerOptions);\r
      resizeObserver?.disconnect();\r
      visibilityObserver?.disconnect();\r
      unsubscribeGpuError?.();\r
      if (frameId) cancelAnimationFrame(frameId);\r
      maskTexture?.destroy();\r
      chargeBuffer?.destroy();\r
      gpu?.dispose();\r
    };\r
  }, []);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`shape-waves \${className}\`}\r
      data-ready={ready}\r
      style={{ backgroundColor }}\r
      aria-hidden="true"\r
    >\r
      <canvas ref={canvasRef} className="shape-waves__canvas" />\r
    </div>\r
  );\r
}\r
`,s=`'use client';\r
\r
// Inspired by https://vercel.com/labs\r
import { useEffect, useRef, useState } from 'react';\r
import { effect, frame, init, sampler, storage, surface, target, uniforms } from 'vgpu';\r
import type { Gpu, StorageBuffer, Texture } from 'vgpu';\r
\r
type ChargeBuffer = StorageBuffer & { destroy(): void };\r
\r
const SHAPE_MODES = { mixed: 0, squares: 1, circles: 2, triangles: 3 } as const;\r
\r
export type ShapeWavesShapes = keyof typeof SHAPE_MODES;\r
const MAX_DPR = 2;\r
const MAX_MASK_SIZE = 1024;\r
const NOISE_CELLS = 32;\r
const TIME_RATE = 0.1;\r
const SIMULATION_STEP = 1 / 60;\r
const WAVE_SPEED = 0.42;\r
const WAVE_FRICTION = 0.94;\r
const WAVE_DECAY = 0.972;\r
const SETTLED_THRESHOLD = 0.01;\r
const INTRO_BAND = 0.2;\r
const INTRO_WARP = 0.3;\r
const INTRO_JITTER = 0.16;\r
const INTRO_END = 1 + INTRO_WARP + INTRO_JITTER + INTRO_BAND;\r
\r
const NOISE_WGSL = \`\r
fn mod289v3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
fn mod289v4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }\r
fn permute(x: vec4f) -> vec4f { return mod289v4(((x * 34.0) + 10.0) * x); }\r
fn taylorInvSqrt(r: vec4f) -> vec4f { return 1.79284291400159 - 0.85373472095314 * r; }\r
fn fadeCurve(t: vec3f) -> vec3f { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\r
\r
fn cnoise(P: vec3f) -> f32 {\r
  var Pi0 = floor(P);\r
  var Pi1 = Pi0 + vec3f(1.0);\r
  Pi0 = mod289v3(Pi0);\r
  Pi1 = mod289v3(Pi1);\r
  let Pf0 = fract(P);\r
  let Pf1 = Pf0 - vec3f(1.0);\r
  let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\r
  let iy = vec4f(Pi0.yy, Pi1.yy);\r
  let iz0 = Pi0.zzzz;\r
  let iz1 = Pi1.zzzz;\r
\r
  let ixy = permute(permute(ix) + iy);\r
  let ixy0 = permute(ixy + iz0);\r
  let ixy1 = permute(ixy + iz1);\r
\r
  var gx0 = ixy0 * (1.0 / 7.0);\r
  var gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\r
  gx0 = fract(gx0);\r
  let gz0 = vec4f(0.5) - abs(gx0) - abs(gy0);\r
  let sz0 = step(gz0, vec4f(0.0));\r
  gx0 -= sz0 * (step(vec4f(0.0), gx0) - 0.5);\r
  gy0 -= sz0 * (step(vec4f(0.0), gy0) - 0.5);\r
\r
  var gx1 = ixy1 * (1.0 / 7.0);\r
  var gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\r
  gx1 = fract(gx1);\r
  let gz1 = vec4f(0.5) - abs(gx1) - abs(gy1);\r
  let sz1 = step(gz1, vec4f(0.0));\r
  gx1 -= sz1 * (step(vec4f(0.0), gx1) - 0.5);\r
  gy1 -= sz1 * (step(vec4f(0.0), gy1) - 0.5);\r
\r
  var g000 = vec3f(gx0.x, gy0.x, gz0.x);\r
  var g100 = vec3f(gx0.y, gy0.y, gz0.y);\r
  var g010 = vec3f(gx0.z, gy0.z, gz0.z);\r
  var g110 = vec3f(gx0.w, gy0.w, gz0.w);\r
  var g001 = vec3f(gx1.x, gy1.x, gz1.x);\r
  var g101 = vec3f(gx1.y, gy1.y, gz1.y);\r
  var g011 = vec3f(gx1.z, gy1.z, gz1.z);\r
  var g111 = vec3f(gx1.w, gy1.w, gz1.w);\r
\r
  let norm0 = taylorInvSqrt(vec4f(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\r
  g000 *= norm0.x;\r
  g010 *= norm0.y;\r
  g100 *= norm0.z;\r
  g110 *= norm0.w;\r
  let norm1 = taylorInvSqrt(vec4f(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\r
  g001 *= norm1.x;\r
  g011 *= norm1.y;\r
  g101 *= norm1.z;\r
  g111 *= norm1.w;\r
\r
  let n000 = dot(g000, Pf0);\r
  let n100 = dot(g100, vec3f(Pf1.x, Pf0.yz));\r
  let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));\r
  let n110 = dot(g110, vec3f(Pf1.xy, Pf0.z));\r
  let n001 = dot(g001, vec3f(Pf0.xy, Pf1.z));\r
  let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));\r
  let n011 = dot(g011, vec3f(Pf0.x, Pf1.yz));\r
  let n111 = dot(g111, Pf1);\r
\r
  let f = fadeCurve(Pf0);\r
  let nz = mix(vec4f(n000, n100, n010, n110), vec4f(n001, n101, n011, n111), f.z);\r
  let ny = mix(nz.xy, nz.zw, f.y);\r
  return 2.2 * mix(ny.x, ny.y, f.x);\r
}\r
\r
fn fbm(p: vec3f) -> f32 {\r
  var total = 0.0;\r
  var amplitude = 1.0;\r
  var weight = 0.0;\r
  var frequency = 1.0;\r
  for (var i = 0; i < 2; i++) {\r
    total += amplitude * cnoise(p * frequency);\r
    weight += amplitude;\r
    amplitude *= 0.5;\r
    frequency *= 2.0;\r
  }\r
  return total / weight;\r
}\r
\`;\r
\r
const SCENE_SHADER = \`\r
struct Params {\r
  resolution: vec4f,\r
  placement: vec4f,\r
  grid: vec4f,\r
  field: vec4f,\r
  motion: vec4f,\r
  color: vec4f,\r
  hover: vec4f,\r
  background: vec4f,\r
}\r
@group(0) @binding(0) var<uniform> params: Params;\r
@group(0) @binding(1) var maskTexture: texture_2d<f32>;\r
@group(0) @binding(2) var maskSampler: sampler;\r
@group(0) @binding(3) var<storage, read> charges: array<f32>;\r
\r
const SEED = vec2f(12.9898, 78.233);\r
const GLOW_THRESHOLD = 0.6;\r
\${NOISE_WGSL}\r
\r
fn sdIsoscelesTriangle(point: vec2f, q: vec2f) -> f32 {\r
  let p = vec2f(abs(point.x), point.y);\r
  let a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);\r
  let b = p - q * vec2f(clamp(p.x / q.x, 0.0, 1.0), 1.0);\r
  let s = -sign(q.y);\r
  let d = min(vec2f(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2f(dot(b, b), s * (p.y - q.y)));\r
  return -sqrt(d.x) * sign(d.y);\r
}\r
\r
fn shapeDistance(p: vec2f, shape: i32, c: f32) -> f32 {\r
  if (shape == 0) { return max(abs(p.x), abs(p.y)) - c; }\r
  if (shape == 1) { return length(p) - c; }\r
  return sdIsoscelesTriangle(vec2f(p.x, p.y + c), vec2f(c, 2.0 * c));\r
}\r
\r
fn hash21(p: vec2f) -> f32 {\r
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);\r
}\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let resolution = params.resolution.xy;\r
  let cellPx = params.grid.x;\r
  let dotSize = params.grid.y;\r
  let mode = i32(params.grid.z + 0.5);\r
  let cols = i32(params.grid.w + 0.5);\r
  let background = params.background.rgb;\r
  let toSurface = params.hover.w < 0.5;\r
\r
  let pixel = uv * resolution;\r
  let origin = params.placement.xy;\r
  let rows = i32(params.placement.z + 0.5);\r
  let cell = floor((pixel - origin) / cellPx);\r
  if (cell.y < 0.0 || i32(cell.y) >= rows || cell.x < 0.0 || i32(cell.x) >= cols) {\r
    return vec4f(background, select(0.0, 1.0, toSurface));\r
  }\r
  let center = origin + (cell + 0.5) * cellPx;\r
  let local = (pixel - center) / (cellPx * 0.5);\r
  let cellUv = center / resolution;\r
\r
  if (params.motion.z > 0.5 && textureSampleLevel(maskTexture, maskSampler, cellUv, 0.0).r > 0.5) {\r
    return vec4f(background, select(0.0, 1.0, toSurface));\r
  }\r
\r
  var level = 1.0;\r
  let fade = params.motion.w;\r
  if (fade > 0.0) {\r
    let q = abs(uv * 2.0 - 1.0);\r
    let radius = pow(pow(q.x, 2.5) + pow(q.y, 2.5), 1.0 / 2.5) / pow(2.0, 1.0 / 2.5);\r
    level = 1.0 - smoothstep(max(0.0, 1.0 - fade * 2.2), 1.0, radius);\r
  }\r
  let noise = fbm(vec3f((center + params.motion.xy) / params.field.x + SEED, params.field.w));\r
  let tone = clamp((noise * 0.5 + 0.5 - params.field.y) * params.field.z + 0.5, 0.0, 1.0);\r
  let band = i32(min(tone, 0.999999) * 3.0);\r
\r
  var charge = 0.0;\r
  let index = i32(cell.y) * cols + i32(cell.x);\r
  if (index >= 0 && index < i32(arrayLength(&charges))) { charge = charges[index]; }\r
  let stepped = (band + i32(clamp(charge, 0.0, 0.999) * 3.0)) % 3;\r
\r
  var shape = 2 - stepped;\r
  var size = dotSize;\r
  if (mode != 0) {\r
    shape = mode - 1;\r
    size = dotSize * mix(0.45, 1.0, f32(stepped) / 2.0);\r
  }\r
  let introProgress = params.placement.w;\r
  var front = 0.0;\r
  if (introProgress < \${INTRO_END.toFixed(2)}) {\r
    let radial = length((center - resolution * 0.5) / (resolution * 0.5)) * 0.70710678;\r
    let warp = cnoise(vec3f(cellUv * vec2f(3.2, 2.4) + SEED, 4.7)) * \${INTRO_WARP.toFixed(2)};\r
    let jitter = hash21(cell) * \${INTRO_JITTER.toFixed(2)};\r
    let spread = radial + warp + jitter + \${INTRO_WARP.toFixed(2)};\r
    let band = \${INTRO_BAND.toFixed(2)} * (0.6 + 0.8 * hash21(cell + vec2f(17.0, 9.0)));\r
    let t = clamp((introProgress - spread) / band, 0.0, 1.0);\r
    if (t <= 0.0) {\r
      return vec4f(background, select(0.0, 1.0, toSurface));\r
    }\r
    let back = t - 1.0;\r
    size = max(size * (1.0 + 2.70158 * back * back * back + 1.70158 * back * back), 0.02);\r
    front = 1.0 - smoothstep(0.0, 1.0, abs(introProgress - spread) / band);\r
  }\r
  let aa = 2.0 / cellPx;\r
  let coverage = smoothstep(aa, -aa, shapeDistance(local, shape, size));\r
\r
  let tint = mix(params.color.rgb, params.hover.rgb, max(smoothstep(0.15, 0.85, charge), front * 0.35));\r
\r
  let rgb = mix(background, tint, coverage * level);\r
  if (toSurface) { return vec4f(rgb, 1.0); }\r
  let luminance = dot(tint * level, vec3f(0.2126, 0.7152, 0.0722));\r
  let glow = max(0.0, (luminance - GLOW_THRESHOLD) / (1.0 - GLOW_THRESHOLD)) * coverage;\r
  return vec4f(rgb, glow);\r
}\r
\`;\r
\r
const BLUR_SHADER = \`\r
struct Blur { direction: vec4f }\r
@group(0) @binding(0) var<uniform> blur: Blur;\r
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;\r
@group(0) @binding(2) var sourceSampler: sampler;\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let sigma = blur.direction.z;\r
  let radius = i32(ceil(3.0 * sigma));\r
  var sum = vec3f(0.0);\r
  var weight = 0.0;\r
  for (var i = -radius; i <= radius; i++) {\r
    let offset = f32(i);\r
    let w = exp(-(offset * offset) / (2.0 * sigma * sigma));\r
    let sample = textureSampleLevel(sourceTexture, sourceSampler, uv + offset * blur.direction.xy, 0.0);\r
    sum += select(sample.rgb, sample.rgb * sample.a, blur.direction.w > 0.5) * w;\r
    weight += w;\r
  }\r
  return vec4f(sum / weight, 1.0);\r
}\r
\`;\r
\r
const COMPOSITE_SHADER = \`\r
struct Composite { strength: vec4f }\r
@group(0) @binding(0) var<uniform> composite: Composite;\r
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;\r
@group(0) @binding(2) var glowTexture: texture_2d<f32>;\r
@group(0) @binding(3) var linearSampler: sampler;\r
\r
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let scene = textureSampleLevel(sceneTexture, linearSampler, uv, 0.0).rgb;\r
  let glow = textureSampleLevel(glowTexture, linearSampler, uv, 0.0).rgb;\r
  return vec4f(scene + glow * composite.strength.x, 1.0);\r
}\r
\`;\r
\r
const parseColor = (value: string | undefined, fallback: string): [number, number, number] => {\r
  const source = typeof value === 'string' ? value.trim() : '';\r
  const match = /^#?([\\da-f]{3}|[\\da-f]{6})$/i.exec(source) || /^#?([\\da-f]{6})$/i.exec(fallback);\r
  let hex = (match as RegExpExecArray)[1];\r
  if (hex.length === 3) hex = hex.replace(/./g, char => char + char);\r
  return [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255) as [number, number, number];\r
};\r
\r
export interface ShapeWavesProps {\r
  text?: string;\r
  fontFamily?: string;\r
  fontWeight?: string | number;\r
  textSize?: number;\r
  shapes?: ShapeWavesShapes;\r
  cellSize?: number;\r
  dotSize?: number;\r
  color?: string;\r
  hoverColor?: string;\r
  backgroundColor?: string;\r
  speed?: number;\r
  scale?: number;\r
  contrast?: number;\r
  brightness?: number;\r
  flow?: number;\r
  direction?: number;\r
  fade?: number;\r
  interactive?: boolean;\r
  splashRadius?: number;\r
  splashStrength?: number;\r
  glow?: number;\r
  intro?: boolean;\r
  introDuration?: number;\r
  introKey?: string | number;\r
  paused?: boolean;\r
  onError?: (error: Error) => void;\r
  className?: string;\r
}\r
\r
interface ShapeWavesSettings {\r
  text: string;\r
  fontFamily: string;\r
  fontWeight: string | number;\r
  textSize: number;\r
  shapes: ShapeWavesShapes;\r
  cellSize: number;\r
  dotSize: number;\r
  color: string;\r
  hoverColor: string;\r
  backgroundColor: string;\r
  speed: number;\r
  scale: number;\r
  contrast: number;\r
  brightness: number;\r
  flow: number;\r
  direction: number;\r
  fade: number;\r
  interactive: boolean;\r
  splashRadius: number;\r
  splashStrength: number;\r
  glow: number;\r
  intro: boolean;\r
  introDuration: number;\r
  introKey: string | number;\r
  paused: boolean;\r
}\r
\r
export default function ShapeWaves({\r
  text = '',\r
  fontFamily = 'Geist, "Geist Sans", system-ui, sans-serif',\r
  fontWeight = 500,\r
  textSize = 0.6,\r
  shapes = 'mixed',\r
  cellSize = 10,\r
  dotSize = 0.75,\r
  color = '#929292',\r
  hoverColor = '#ffffff',\r
  backgroundColor = '#000000',\r
  speed = 1,\r
  scale = 1,\r
  contrast = 1,\r
  brightness = 0.4,\r
  flow = 0,\r
  direction = 0,\r
  fade = 0.25,\r
  interactive = true,\r
  splashRadius = 40,\r
  splashStrength = 0.4,\r
  glow = 0.35,\r
  intro = true,\r
  introDuration = 1.6,\r
  introKey = 0,\r
  paused = false,\r
  onError,\r
  className = ''\r
}: ShapeWavesProps) {\r
  const rootRef = useRef<HTMLDivElement | null>(null);\r
  const canvasRef = useRef<HTMLCanvasElement | null>(null);\r
  const [ready, setReady] = useState(false);\r
  const settingsRef = useRef<ShapeWavesSettings>(null as unknown as ShapeWavesSettings);\r
  const applySettingsRef = useRef<() => void>(() => {});\r
  const applyMaskRef = useRef<() => void>(() => {});\r
  const onErrorRef = useRef<ShapeWavesProps['onError']>(onError);\r
\r
  settingsRef.current = {\r
    text: String(text ?? ''),\r
    fontFamily,\r
    fontWeight,\r
    textSize,\r
    shapes,\r
    cellSize: Math.max(2, cellSize),\r
    dotSize,\r
    color,\r
    hoverColor,\r
    backgroundColor,\r
    speed,\r
    scale: Math.max(0.05, scale),\r
    contrast,\r
    brightness,\r
    flow,\r
    direction,\r
    fade,\r
    interactive,\r
    splashRadius,\r
    splashStrength,\r
    glow,\r
    intro,\r
    introDuration: Math.max(0.1, introDuration),\r
    introKey,\r
    paused\r
  };\r
  onErrorRef.current = onError;\r
\r
  const settingsSignature = [\r
    shapes,\r
    cellSize,\r
    dotSize,\r
    color,\r
    hoverColor,\r
    backgroundColor,\r
    speed,\r
    scale,\r
    contrast,\r
    brightness,\r
    flow,\r
    direction,\r
    fade,\r
    interactive,\r
    splashRadius,\r
    splashStrength,\r
    glow,\r
    intro,\r
    introDuration,\r
    paused\r
  ].join('|');\r
  const maskSignature = [text, fontFamily, fontWeight, textSize].join('|');\r
  const replayRef = useRef<() => void>(() => {});\r
\r
  useEffect(() => {\r
    applySettingsRef.current();\r
  }, [settingsSignature]);\r
\r
  useEffect(() => {\r
    applyMaskRef.current();\r
  }, [maskSignature]);\r
\r
  useEffect(() => {\r
    if (introKey) replayRef.current();\r
  }, [introKey]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    if (!root || !canvas) return undefined;\r
\r
    let disposed = false;\r
    let failed = false;\r
    let gpu: Gpu | undefined;\r
    let maskTexture: Texture | undefined;\r
    let chargeBuffer: ChargeBuffer | undefined;\r
    let frameId = 0;\r
    let lastFrameTime = 0;\r
    let time = 0;\r
    let drift: [number, number] = [0, 0];\r
    let dpr = 1;\r
    let visible = true;\r
    let presented = false;\r
    let cols = 1;\r
    let rows = 1;\r
    let cellPx = 10;\r
    let gridOrigin: [number, number] = [0, 0];\r
    let charges = new Float32Array(1);\r
    let heights = new Float32Array(1);\r
    let previousHeights = new Float32Array(1);\r
    let simulationBacklog = 0;\r
    let introStart = 0;\r
    let introProgress = INTRO_END;\r
    let introArmed = false;\r
    let chargesActive = false;\r
    let bounds: DOMRect | null = null;\r
    let unsubscribeGpuError: (() => void) | undefined;\r
    let resizeObserver: ResizeObserver | undefined;\r
    let visibilityObserver: IntersectionObserver | undefined;\r
    let wakeRenderer: () => void = () => {};\r
    const pointer = { x: 0, y: 0, at: 0, inside: false };\r
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');\r
    const maskCanvas = document.createElement('canvas');\r
    const maskContext = maskCanvas.getContext('2d') as CanvasRenderingContext2D;\r
\r
    const handleWake = () => wakeRenderer();\r
    const invalidateBounds = () => {\r
      bounds = null;\r
    };\r
    const splash = (x: number, y: number, strength: number) => {\r
      const settings = settingsRef.current;\r
      const sigma = Math.max(0.5, ((settings.splashRadius * dpr) / cellPx) * 0.5);\r
      const reach = Math.ceil(sigma * 2.5);\r
      const centerCol = (x * dpr - gridOrigin[0]) / cellPx - 0.5;\r
      const centerRow = (y * dpr - gridOrigin[1]) / cellPx - 0.5;\r
      const minRow = Math.max(0, Math.floor(centerRow - reach));\r
      const maxRow = Math.min(rows - 1, Math.ceil(centerRow + reach));\r
      const minCol = Math.max(0, Math.floor(centerCol - reach));\r
      const maxCol = Math.min(cols - 1, Math.ceil(centerCol + reach));\r
      for (let row = minRow; row <= maxRow; row++) {\r
        const dy = row - centerRow;\r
        for (let col = minCol; col <= maxCol; col++) {\r
          const dx = col - centerCol;\r
          const bump = strength * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));\r
          const index = row * cols + col;\r
          heights[index] = Math.min(1.2, heights[index] + bump);\r
        }\r
      }\r
      chargesActive = true;\r
    };\r
\r
    const handlePointerMove = (event: PointerEvent) => {\r
      if (!settingsRef.current.interactive) return;\r
      if (!bounds) bounds = root.getBoundingClientRect();\r
      const now = performance.now();\r
      const x = event.clientX - bounds.left;\r
      const y = event.clientY - bounds.top;\r
      const inside = x >= 0 && y >= 0 && x <= bounds.width && y <= bounds.height;\r
      if (inside) {\r
        const elapsed = pointer.inside ? Math.max(8, now - pointer.at) : 16;\r
        const travelled = pointer.inside ? Math.hypot(x - pointer.x, y - pointer.y) : 0;\r
        const speed = (travelled / elapsed) * 1000;\r
        splash(x, y, Math.min(1, 0.22 + speed * 0.0006) * settingsRef.current.splashStrength);\r
        wakeRenderer();\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.at = now;\r
      pointer.inside = inside;\r
    };\r
\r
    const reportFailure = (error: unknown) => {\r
      if (disposed || failed) return;\r
      failed = true;\r
      if (frameId) cancelAnimationFrame(frameId);\r
      frameId = 0;\r
      resizeObserver?.disconnect();\r
      visibilityObserver?.disconnect();\r
      unsubscribeGpuError?.();\r
      applySettingsRef.current = () => {};\r
      applyMaskRef.current = () => {};\r
      const failedGpu = gpu;\r
      gpu = undefined;\r
      failedGpu?.dispose();\r
      setReady(false);\r
      onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));\r
    };\r
\r
    const measureSurface = (): [number, number] => {\r
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);\r
      return [Math.max(1, Math.round(canvas.clientWidth * dpr)), Math.max(1, Math.round(canvas.clientHeight * dpr))];\r
    };\r
\r
    void (async () => {\r
      try {\r
        const activeGpu = await init({ powerPreference: 'low-power' });\r
        gpu = activeGpu;\r
        if (disposed) return activeGpu.dispose();\r
        unsubscribeGpuError = activeGpu.onError(reportFailure);\r
\r
        const initialSize = measureSurface();\r
        const outputFormat = (\r
          navigator as Navigator & { gpu: { getPreferredCanvasFormat(): string } }\r
        ).gpu.getPreferredCanvasFormat();\r
        const output = surface(activeGpu, canvas, { dpr, size: initialSize, autoResize: false, format: outputFormat });\r
\r
        const params = uniforms(activeGpu, {\r
          resolution: [initialSize[0], initialSize[1], 1 / initialSize[0], 1 / initialSize[1]],\r
          placement: [0, 0, 1, 0],\r
          grid: [10, 0.75, 0, 1],\r
          field: [320, 0.5, 2.8, 0],\r
          motion: [0, 0, 0, 0.25],\r
          color: [0.573, 0.573, 0.573, 1],\r
          hover: [1, 1, 1, 0],\r
          background: [0, 0, 0, 1]\r
        });\r
        const linearSampler = sampler(activeGpu, {\r
          minFilter: 'linear',\r
          magFilter: 'linear',\r
          addressModeU: 'clamp-to-edge',\r
          addressModeV: 'clamp-to-edge'\r
        });\r
        const createMaskTexture = (maskWidth: number, maskHeight: number) =>\r
          activeGpu.device.createTexture({\r
            size: [maskWidth, maskHeight],\r
            format: 'rgba8unorm',\r
            usage: ['texture_binding', 'copy_dst', 'render_attachment'],\r
            label: 'shape-waves-mask'\r
          });\r
        const initialMaskTexture = createMaskTexture(1, 1);\r
        maskTexture = initialMaskTexture;\r
        const initialChargeBuffer = storage(activeGpu, 4, 'read') as ChargeBuffer;\r
        initialChargeBuffer.write(charges);\r
        chargeBuffer = initialChargeBuffer;\r
\r
        const scene = effect(activeGpu, SCENE_SHADER, {\r
          label: 'shape-waves-scene',\r
          set: { params, maskTexture: initialMaskTexture, maskSampler: linearSampler, charges: initialChargeBuffer }\r
        });\r
        const sceneTarget = target(activeGpu, { size: initialSize, format: 'rgba8unorm', label: 'shape-waves-scene' });\r
        const glowSize = (size: readonly [number, number]): [number, number] => [\r
          Math.max(1, Math.ceil(size[0] / 2)),\r
          Math.max(1, Math.ceil(size[1] / 2))\r
        ];\r
        const glowA = target(activeGpu, {\r
          size: glowSize(initialSize),\r
          format: 'rgba8unorm',\r
          label: 'shape-waves-glow-a'\r
        });\r
        const glowB = target(activeGpu, {\r
          size: glowSize(initialSize),\r
          format: 'rgba8unorm',\r
          label: 'shape-waves-glow-b'\r
        });\r
        const blurParamsX = uniforms(activeGpu, { direction: [0, 0, 4, 1] });\r
        const blurParamsY = uniforms(activeGpu, { direction: [0, 0, 4, 0] });\r
        const blurX = effect(activeGpu, BLUR_SHADER, {\r
          label: 'shape-waves-glow-x',\r
          set: { blur: blurParamsX, sourceTexture: sceneTarget, sourceSampler: linearSampler }\r
        });\r
        const blurY = effect(activeGpu, BLUR_SHADER, {\r
          label: 'shape-waves-glow-y',\r
          set: { blur: blurParamsY, sourceTexture: glowA, sourceSampler: linearSampler }\r
        });\r
        const compositeParams = uniforms(activeGpu, { strength: [2, 0, 0, 0] });\r
        const composite = effect(activeGpu, COMPOSITE_SHADER, {\r
          label: 'shape-waves-composite',\r
          set: { composite: compositeParams, sceneTexture: sceneTarget, glowTexture: glowB, linearSampler }\r
        });\r
        await Promise.all([\r
          scene.compile({ colors: [outputFormat] }),\r
          scene.compile(sceneTarget),\r
          blurX.compile(glowA),\r
          blurY.compile(glowB),\r
          composite.compile({ colors: [outputFormat] })\r
        ]);\r
        if (disposed) return;\r
\r
        const glowEnabled = () => settingsRef.current.glow > 0;\r
        let lastIntro = false;\r
\r
        const configureGrid = () => {\r
          const settings = settingsRef.current;\r
          const [width, height] = output.size;\r
          const nextCols = Math.max(1, Math.round(width / (settings.cellSize * dpr)));\r
          cellPx = width / nextCols;\r
          const nextRows = Math.max(1, Math.floor(height / cellPx));\r
          gridOrigin = [0, (height - nextRows * cellPx) / 2];\r
          if (nextCols === cols && nextRows === rows && charges.length === cols * rows) return;\r
          cols = nextCols;\r
          rows = nextRows;\r
          charges = new Float32Array(cols * rows);\r
          heights = new Float32Array(cols * rows);\r
          previousHeights = new Float32Array(cols * rows);\r
          chargesActive = false;\r
          const nextBuffer = storage(activeGpu, charges.byteLength, 'read') as ChargeBuffer;\r
          nextBuffer.write(charges);\r
          scene.set({ charges: nextBuffer });\r
          chargeBuffer?.destroy();\r
          chargeBuffer = nextBuffer;\r
        };\r
\r
        const stepRipples = () => {\r
          const lastCol = cols - 1;\r
          const lastRow = rows - 1;\r
          let peak = 0;\r
          for (let row = 0; row < rows; row++) {\r
            const up = (row === 0 ? row : row - 1) * cols;\r
            const down = (row === lastRow ? row : row + 1) * cols;\r
            const base = row * cols;\r
            for (let col = 0; col < cols; col++) {\r
              const index = base + col;\r
              const left = base + (col === 0 ? col : col - 1);\r
              const right = base + (col === lastCol ? col : col + 1);\r
              const height = heights[index];\r
              const laplacian = heights[left] + heights[right] + heights[up + col] + heights[down + col] - 4 * height;\r
              const velocity = (height - previousHeights[index]) * WAVE_FRICTION;\r
              const next = (height + velocity + WAVE_SPEED * laplacian) * WAVE_DECAY;\r
              previousHeights[index] = next;\r
              const charge = Math.min(1, Math.max(0, next));\r
              charges[index] = charge;\r
              if (charge > peak) peak = charge;\r
            }\r
          }\r
          const swap = heights;\r
          heights = previousHeights;\r
          previousHeights = swap;\r
          return peak;\r
        };\r
\r
        const updateCharges = (deltaSeconds: number) => {\r
          if (!chargesActive) return false;\r
          simulationBacklog = Math.min(simulationBacklog + deltaSeconds, SIMULATION_STEP * 4);\r
          let peak = 1;\r
          while (simulationBacklog >= SIMULATION_STEP) {\r
            simulationBacklog -= SIMULATION_STEP;\r
            peak = stepRipples();\r
          }\r
          if (peak < SETTLED_THRESHOLD) {\r
            heights.fill(0);\r
            previousHeights.fill(0);\r
            charges.fill(0);\r
            chargesActive = false;\r
          }\r
          chargeBuffer?.write(charges);\r
          return chargesActive;\r
        };\r
\r
        const isAnimating = () => {\r
          const settings = settingsRef.current;\r
          return visible && !document.hidden && !settings.paused && settings.speed > 0 && !reduceMotion.matches;\r
        };\r
\r
        const render = (now: number) => {\r
          frameId = 0;\r
          if (disposed || failed) return;\r
          const settings = settingsRef.current;\r
          const deltaSeconds = lastFrameTime ? Math.min(0.1, (now - lastFrameTime) / 1000) : 0;\r
          lastFrameTime = now;\r
          const animating = isAnimating();\r
          if (animating) {\r
            time += deltaSeconds * TIME_RATE * settings.speed;\r
            const angle = (settings.direction * Math.PI) / 180;\r
            const distance = settings.flow * cellPx * deltaSeconds;\r
            drift = [drift[0] + Math.cos(angle) * distance, drift[1] + Math.sin(angle) * distance];\r
          }\r
          const hovering = visible && !document.hidden && updateCharges(deltaSeconds);\r
          if (introArmed) {\r
            introArmed = false;\r
            introStart = now;\r
            introProgress = 0;\r
          }\r
          const introPlaying = introProgress < INTRO_END;\r
          if (introPlaying) {\r
            introProgress = Math.min(INTRO_END, ((now - introStart) / 1000 / settings.introDuration) * INTRO_END);\r
          }\r
          params.set({ placement: [gridOrigin[0], gridOrigin[1], rows, introProgress] });\r
          params.set({\r
            field: [\r
              NOISE_CELLS * cellPx * settings.scale,\r
              0.5 - (settings.brightness - 0.5) * 0.4,\r
              2.8 * settings.contrast,\r
              time\r
            ]\r
          });\r
          params.set({ motion: [drift[0], drift[1], settings.text.trim() ? 1 : 0, settings.fade] });\r
          try {\r
            frame(activeGpu, currentFrame => {\r
              if (!glowEnabled()) {\r
                currentFrame.pass(output, scene);\r
                return;\r
              }\r
              currentFrame.pass(sceneTarget, scene);\r
              currentFrame.pass(glowA, blurX);\r
              currentFrame.pass(glowB, blurY);\r
              currentFrame.pass(output, composite);\r
            });\r
          } catch (error) {\r
            reportFailure(error);\r
            return;\r
          }\r
          if (!presented) {\r
            presented = true;\r
            setReady(true);\r
          }\r
          if (animating || hovering || introPlaying) frameId = requestAnimationFrame(render);\r
          else lastFrameTime = 0;\r
        };\r
\r
        wakeRenderer = () => {\r
          if (disposed || failed || frameId) return;\r
          frameId = requestAnimationFrame(render);\r
        };\r
\r
        const drawMask = () => {\r
          const settings = settingsRef.current;\r
          const content = settings.text.trim();\r
          const [surfaceWidth, surfaceHeight] = output.size;\r
          const hasText = content.length > 0;\r
          const maskScale = hasText ? Math.min(1, MAX_MASK_SIZE / Math.max(surfaceWidth, surfaceHeight)) : 0;\r
          const maskWidth = hasText ? Math.max(1, Math.round(surfaceWidth * maskScale)) : 1;\r
          const maskHeight = hasText ? Math.max(1, Math.round(surfaceHeight * maskScale)) : 1;\r
\r
          maskCanvas.width = maskWidth;\r
          maskCanvas.height = maskHeight;\r
          maskContext.fillStyle = '#000';\r
          maskContext.fillRect(0, 0, maskWidth, maskHeight);\r
\r
          if (hasText) {\r
            let fontPx = Math.max(1, settings.textSize * maskHeight);\r
            maskContext.font = \`\${settings.fontWeight} \${fontPx}px \${settings.fontFamily}\`;\r
            const measured = maskContext.measureText(content).width;\r
            const maxWidth = maskWidth * 0.9;\r
            if (measured > maxWidth) {\r
              fontPx = Math.max(1, (fontPx * maxWidth) / measured);\r
              maskContext.font = \`\${settings.fontWeight} \${fontPx}px \${settings.fontFamily}\`;\r
            }\r
            maskContext.textAlign = 'center';\r
            maskContext.textBaseline = 'alphabetic';\r
            const metrics = maskContext.measureText(content);\r
            const x = (maskWidth + metrics.actualBoundingBoxLeft - metrics.actualBoundingBoxRight) / 2;\r
            const y = (maskHeight + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;\r
            maskContext.fillStyle = '#fff';\r
            maskContext.fillText(content, x, y);\r
          }\r
\r
          const nextTexture = createMaskTexture(maskWidth, maskHeight);\r
          activeGpu.gpu.queue.copyExternalImageToTexture({ source: maskCanvas }, { texture: nextTexture.gpu }, [\r
            maskWidth,\r
            maskHeight\r
          ]);\r
          scene.set({ maskTexture: nextTexture });\r
          maskTexture?.destroy();\r
          maskTexture = nextTexture;\r
        };\r
\r
        const applySettings = () => {\r
          if (disposed || failed) return;\r
          const settings = settingsRef.current;\r
          configureGrid();\r
          params.set({\r
            placement: [gridOrigin[0], gridOrigin[1], rows, introProgress],\r
            grid: [cellPx, Math.min(1, Math.max(0.1, settings.dotSize)), SHAPE_MODES[settings.shapes] ?? 0, cols],\r
            color: [...parseColor(settings.color, '#929292'), 1],\r
            hover: [...parseColor(settings.hoverColor, '#ffffff'), glowEnabled() ? 1 : 0],\r
            background: [...parseColor(settings.backgroundColor, '#000000'), 1]\r
          });\r
          compositeParams.set({ strength: [2 * settings.glow, 0, 0, 0] });\r
          if (settings.intro !== lastIntro) {\r
            lastIntro = settings.intro;\r
            if (settings.intro && !reduceMotion.matches) introArmed = true;\r
          }\r
          if (!settings.interactive && chargesActive) {\r
            heights.fill(0);\r
            previousHeights.fill(0);\r
            charges.fill(0);\r
            chargesActive = false;\r
            chargeBuffer?.write(charges);\r
          }\r
          wakeRenderer();\r
        };\r
\r
        const applyMask = () => {\r
          if (disposed || failed) return;\r
          drawMask();\r
          applySettings();\r
          const settings = settingsRef.current;\r
          if (!settings.text.trim() || !document.fonts?.load) return;\r
          document.fonts\r
            .load(\`\${settings.fontWeight} 32px \${settings.fontFamily}\`)\r
            .then(() => {\r
              if (disposed || failed) return;\r
              drawMask();\r
              wakeRenderer();\r
            })\r
            .catch(() => {});\r
        };\r
\r
        const resize = () => {\r
          if (disposed || failed) return;\r
          invalidateBounds();\r
          const nextSize = measureSurface();\r
          if (nextSize[0] !== output.size[0] || nextSize[1] !== output.size[1]) output.resize(nextSize);\r
          const [width, height] = output.size;\r
          sceneTarget.resize([width, height]);\r
          const half = glowSize([width, height]);\r
          glowA.resize(half);\r
          glowB.resize(half);\r
          blurParamsX.set({ direction: [1 / half[0], 0, 4, 1] });\r
          blurParamsY.set({ direction: [0, 1 / half[1], 4, 0] });\r
          params.set({ resolution: [width, height, 1 / width, 1 / height] });\r
          drawMask();\r
          applySettings();\r
        };\r
\r
        applySettingsRef.current = applySettings;\r
        applyMaskRef.current = applyMask;\r
        replayRef.current = () => {\r
          if (disposed || failed || !settingsRef.current.intro || reduceMotion.matches) return;\r
          introArmed = true;\r
          wakeRenderer();\r
        };\r
\r
        resizeObserver = new ResizeObserver(resize);\r
        resizeObserver.observe(root);\r
        visibilityObserver = new IntersectionObserver(\r
          entries => {\r
            visible = entries.some(entry => entry.isIntersecting);\r
            if (visible) wakeRenderer();\r
          },\r
          { threshold: 0 }\r
        );\r
        visibilityObserver.observe(root);\r
        document.addEventListener('visibilitychange', handleWake);\r
        reduceMotion.addEventListener('change', handleWake);\r
        window.addEventListener('pointermove', handlePointerMove, { passive: true });\r
        window.addEventListener('scroll', invalidateBounds, { capture: true, passive: true });\r
\r
        resize();\r
        applyMask();\r
      } catch (error) {\r
        reportFailure(error);\r
      }\r
    })();\r
\r
    return () => {\r
      disposed = true;\r
      wakeRenderer = () => {};\r
      applySettingsRef.current = () => {};\r
      applyMaskRef.current = () => {};\r
      replayRef.current = () => {};\r
      document.removeEventListener('visibilitychange', handleWake);\r
      reduceMotion.removeEventListener('change', handleWake);\r
      window.removeEventListener('pointermove', handlePointerMove);\r
      window.removeEventListener('scroll', invalidateBounds, { capture: true } as EventListenerOptions);\r
      resizeObserver?.disconnect();\r
      visibilityObserver?.disconnect();\r
      unsubscribeGpuError?.();\r
      if (frameId) cancelAnimationFrame(frameId);\r
      maskTexture?.destroy();\r
      chargeBuffer?.destroy();\r
      gpu?.dispose();\r
    };\r
  }, []);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`pointer-events-none relative isolate h-full w-full overflow-hidden \${className}\`}\r
      data-ready={ready}\r
      style={{ backgroundColor }}\r
      aria-hidden="true"\r
    >\r
      <canvas\r
        ref={canvasRef}\r
        className={\`pointer-events-none absolute inset-0 block h-full w-full transition-opacity duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none \${ready ? 'opacity-100' : 'opacity-0'}\`}\r
      />\r
    </div>\r
  );\r
}\r
`,a={dependencies:"vgpu",usage:`import ShapeWaves from './ShapeWaves';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <ShapeWaves
    text="</>"
    fontFamily='Geist, "Geist Sans", system-ui, sans-serif'
    fontWeight={500}
    textSize={0.6}
    shapes="mixed"
    cellSize={10}
    dotSize={0.75}
    color="#929292"
    hoverColor="#ffffff"
    backgroundColor="#000000"
    speed={1}
    scale={1}
    contrast={1}
    brightness={0.4}
    flow={0}
    direction={0}
    fade={0.25}
    interactive={true}
    splashRadius={40}
    splashStrength={0.4}
    glow={0.35}
    intro={true}
    introDuration={1.6}
    paused={false}
  />
</div>`,code:r,css:e,tailwind:n,tsCode:t,tsTailwind:s};export{a as shapeWaves};
