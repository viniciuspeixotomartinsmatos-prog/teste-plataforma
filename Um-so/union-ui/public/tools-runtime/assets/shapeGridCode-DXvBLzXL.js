const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './ShapeGrid.css';\r
\r
const SHAPES = ['square', 'tile', 'hexagon', 'triangle', 'diamond', 'circle', 'cross', 'dot'];\r
const DIRECTIONS = {\r
  right: [1, 0],\r
  left: [-1, 0],\r
  up: [0, -1],\r
  down: [0, 1],\r
  diagonal: [Math.SQRT1_2, -Math.SQRT1_2],\r
  none: [0, 0]\r
};\r
const SQRT3 = Math.sqrt(3);\r
const OFFSET = 32768;\r
const FAR = 2.5;\r
const MAX_PIXELS = 8e6;\r
\r
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);\r
\r
const smoothstep = (edge0, edge1, value) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const hash = (i, j) => {\r
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;\r
  return s - Math.floor(s);\r
};\r
\r
const keyOf = (i, j) => (i + OFFSET) * 65536 + (j + OFFSET);\r
\r
const fadeMask = amount => {\r
  if (amount <= 0) return 'none';\r
  const edge = amount * 26;\r
  const stops = [];\r
  for (let k = 0; k <= 8; k++) {\r
    const t = k / 8;\r
    stops.push(\`rgba(0, 0, 0, \${smootherstep(t).toFixed(3)}) \${(t * edge).toFixed(2)}%\`);\r
  }\r
  const inner = stops.join(', ');\r
  const outer = [...stops]\r
    .reverse()\r
    .map(stop => stop.replace(/ ([\\d.]+)%$/, (_, value) => \` \${(100 - parseFloat(value)).toFixed(2)}%\`))\r
    .join(', ');\r
  const axis = direction => \`linear-gradient(\${direction}, \${inner}, \${outer})\`;\r
  return \`\${axis('to right')}, \${axis('to bottom')}\`;\r
};\r
\r
const lightnessOf = color => {\r
  let hex = String(color).trim().replace(/^#/, '');\r
  if (hex.length === 3 || hex.length === 4) hex = hex.replace(/./g, '$&$&');\r
  hex = hex.slice(0, 6);\r
  if (!/^[0-9a-f]{6}$/i.test(hex)) return 0.6;\r
  const value = parseInt(hex, 16);\r
  const channels = [value >> 16, (value >> 8) & 255, value & 255];\r
  return (Math.max(...channels) + Math.min(...channels)) / 510;\r
};\r
\r
const tint = (hue, lightness) =>\r
  \`hsl(\${(((hue % 360) + 360) % 360).toFixed(1)}, 90%, \${(lightness * 100).toFixed(1)}%)\`;\r
\r
const multiply = (a, b) =>\r
  [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => {\r
    const r = k - (k % 3);\r
    const c = k % 3;\r
    return a[r] * b[c] + a[r + 1] * b[c + 3] + a[r + 2] * b[c + 6];\r
  });\r
\r
const invert = m => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const project = (m, x, y) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];\r
};\r
\r
const flatView = (width, height) => ({\r
  x0: 0,\r
  y0: 0,\r
  width,\r
  height,\r
  inverse: null,\r
  transform: 'none',\r
  mist: null,\r
  far: FAR,\r
  reach: Math.hypot(width, height) / 2\r
});\r
\r
const viewFor = (tiltX, tiltY, width, height, cellSize) => {\r
  if (!tiltX && !tiltY) return flatView(width, height);\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  const forward = multiply(multiply([1, 0, cx, 0, 1, cy, 0, 0, 1], tilt), [1, 0, -cx, 0, 1, -cy, 0, 0, 1]);\r
  const inverse = invert(forward);\r
  const facing = Math.cos(ax) * Math.cos(ay);\r
  const far = clamp(Math.sqrt((facing * cellSize) / 5), 1.15, FAR);\r
  const near = Math.min(Math.sqrt((facing * cellSize) / 14), far - 0.35);\r
  const nearness = (x, y) => inverse[6] * x + inverse[7] * y + inverse[8] - 1 / far;\r
  const corners = [\r
    [0, 0],\r
    [width, 0],\r
    [width, height],\r
    [0, height]\r
  ];\r
  let x0 = Infinity;\r
  let y0 = Infinity;\r
  let x1 = -Infinity;\r
  let y1 = -Infinity;\r
  const include = (x, y) => {\r
    const [px, py] = project(inverse, x, y);\r
    x0 = Math.min(x0, px);\r
    y0 = Math.min(y0, py);\r
    x1 = Math.max(x1, px);\r
    y1 = Math.max(y1, py);\r
  };\r
  corners.forEach((a, k) => {\r
    const b = corners[(k + 1) % 4];\r
    const na = nearness(a[0], a[1]);\r
    const nb = nearness(b[0], b[1]);\r
    if (na >= 0) include(a[0], a[1]);\r
    if (na >= 0 !== nb >= 0) {\r
      const t = na / (na - nb);\r
      include(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);\r
    }\r
  });\r
  if (!(x1 > x0 && y1 > y0)) return flatView(width, height);\r
  x0 = Math.floor(x0 / 16) * 16;\r
  y0 = Math.floor(y0 / 16) * 16;\r
  x1 = Math.ceil(x1 / 16) * 16;\r
  y1 = Math.ceil(y1 / 16) * 16;\r
  const m = multiply(forward, [1, 0, x0, 0, 1, y0, 0, 0, 1]);\r
  const transform = \`matrix3d(\${[m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, m[8]].join(', ')})\`;\r
  const gx = forward[6];\r
  const gy = forward[7];\r
  const slope = Math.hypot(gx, gy);\r
  const mist =\r
    slope > 1e-9\r
      ? [\r
          cx + (gx / slope) * ((near - 1) / slope),\r
          cy + (gy / slope) * ((near - 1) / slope),\r
          cx + (gx / slope) * ((far - 1) / slope),\r
          cy + (gy / slope) * ((far - 1) / slope)\r
        ]\r
      : null;\r
  const reach = Math.max(\r
    Math.hypot(x0 - cx, y0 - cy),\r
    Math.hypot(x1 - cx, y0 - cy),\r
    Math.hypot(x1 - cx, y1 - cy),\r
    Math.hypot(x0 - cx, y1 - cy)\r
  );\r
  return { x0, y0, width: x1 - x0, height: y1 - y0, inverse, transform, mist, far, reach };\r
};\r
\r
const layoutFor = (shape, size) => {\r
  if (shape === 'hexagon') {\r
    const radius = size / SQRT3;\r
    return { stepX: radius * 1.5, stepY: size, radius };\r
  }\r
  if (shape === 'triangle') {\r
    const side = (size * 2) / SQRT3;\r
    return { stepX: side / 2, stepY: size, side };\r
  }\r
  return { stepX: size, stepY: size };\r
};\r
\r
const centerOf = (shape, layout, i, j) => {\r
  const { stepX, stepY } = layout;\r
  if (shape === 'hexagon') return [i * stepX, j * stepY + (Math.abs(i) % 2 === 1 ? stepY / 2 : 0)];\r
  if (shape === 'triangle') {\r
    const up = (((i + j) % 2) + 2) % 2 === 0;\r
    return [i * stepX, j * stepY + (up ? stepY * (2 / 3) : stepY / 3)];\r
  }\r
  if (shape === 'cross' || shape === 'dot') return [i * stepX, j * stepY];\r
  return [(i + 0.5) * stepX, (j + 0.5) * stepY];\r
};\r
\r
const traceCell = (ctx, shape, layout, size, i, j, x, y, inset) => {\r
  if (shape === 'hexagon') {\r
    const r = layout.radius - inset;\r
    for (let k = 0; k < 6; k++) {\r
      const angle = (Math.PI / 3) * k;\r
      const px = x + r * Math.cos(angle);\r
      const py = y + r * Math.sin(angle);\r
      if (k === 0) ctx.moveTo(px, py);\r
      else ctx.lineTo(px, py);\r
    }\r
    ctx.closePath();\r
  } else if (shape === 'triangle') {\r
    const up = (((i + j) % 2) + 2) % 2 === 0;\r
    const half = layout.side / 2 - inset * 1.7;\r
    const height = size - inset * 2.6;\r
    const top = up ? y - height * (2 / 3) : y + height * (2 / 3);\r
    const base = up ? y + height / 3 : y - height / 3;\r
    ctx.moveTo(x, top);\r
    ctx.lineTo(x + half, base);\r
    ctx.lineTo(x - half, base);\r
    ctx.closePath();\r
  } else if (shape === 'diamond') {\r
    const r = size / 2 - inset;\r
    ctx.moveTo(x, y - r);\r
    ctx.lineTo(x + r, y);\r
    ctx.lineTo(x, y + r);\r
    ctx.lineTo(x - r, y);\r
    ctx.closePath();\r
  } else if (shape === 'circle') {\r
    ctx.moveTo(x + size / 2 - inset, y);\r
    ctx.arc(x, y, Math.max(0.5, size / 2 - inset), 0, Math.PI * 2);\r
  } else if (shape === 'tile') {\r
    const half = size / 2 - Math.max(inset, size * 0.06);\r
    const r = Math.min(half, size * 0.22);\r
    ctx.roundRect(x - half, y - half, half * 2, half * 2, r);\r
  } else if (shape === 'cross') {\r
    const arm = size * 0.16 + inset;\r
    ctx.moveTo(x - arm, y);\r
    ctx.lineTo(x + arm, y);\r
    ctx.moveTo(x, y - arm);\r
    ctx.lineTo(x, y + arm);\r
  } else if (shape === 'dot') {\r
    const r = size * 0.05 + inset;\r
    ctx.moveTo(x + r, y);\r
    ctx.arc(x, y, r, 0, Math.PI * 2);\r
  } else {\r
    const half = size / 2 - inset;\r
    ctx.rect(x - half, y - half, half * 2, half * 2);\r
  }\r
};\r
\r
export default function ShapeGrid({\r
  shape = 'square',\r
  cellSize = 40,\r
  lineWidth = 1,\r
  direction = 'diagonal',\r
  speed = 0.5,\r
  lineColor = '#2a2734',\r
  hoverColor = '#ffffff',\r
  hoverFillColor,\r
  fillOpacity = 0.15,\r
  rainbow = false,\r
  tiltX = 0,\r
  tiltY = 0,\r
  radius = 1.5,\r
  trail = 0.6,\r
  glow = 0.35,\r
  twinkle = 0,\r
  fade = 1,\r
  clickCascade = true,\r
  intro = true,\r
  opacity = 1,\r
  backgroundColor = 'transparent',\r
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
    shape: SHAPES.includes(shape) ? shape : 'square',\r
    cellSize: Math.max(8, cellSize),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    direction: DIRECTIONS[direction] ? direction : 'diagonal',\r
    speed: Math.max(0, speed),\r
    lineColor,\r
    hoverColor,\r
    hoverFillColor: hoverFillColor ?? hoverColor,\r
    fillOpacity: clamp(fillOpacity, 0, 1),\r
    rainbow,\r
    tone: clamp(lightnessOf(hoverColor), 0.45, 0.68),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    radius: Math.max(0, radius),\r
    trail: Math.max(0.05, trail),\r
    glow: clamp(glow, 0, 1),\r
    twinkle: clamp(twinkle, 0, 1),\r
    clickCascade,\r
    intro,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const ctx = canvas.getContext('2d');\r
    if (!ctx) return undefined;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      view: flatView(1, 1),\r
      offsetX: 0,\r
      offsetY: 0,\r
      started: false,\r
      startedAt: 0,\r
      inside: false,\r
      pointerX: 0,\r
      pointerY: 0,\r
      spotX: 0,\r
      spotY: 0,\r
      spotVX: 0,\r
      spotVY: 0,\r
      spotPower: 0,\r
      lit: new Map(),\r
      hues: new Map(),\r
      cascades: [],\r
      cascadeHue: 0\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const view = viewFor(s.tiltX, s.tiltY, width, height, s.cellSize);\r
      let ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const pixels = view.width * view.height * ratio * ratio;\r
      if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels);\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      state.view = view;\r
      const pixelWidth = Math.max(1, Math.round(view.width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(view.height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      const cssWidth = \`\${view.width}px\`;\r
      const cssHeight = \`\${view.height}px\`;\r
      if (canvas.style.width !== cssWidth) canvas.style.width = cssWidth;\r
      if (canvas.style.height !== cssHeight) canvas.style.height = cssHeight;\r
      if (canvas.style.transform !== view.transform) canvas.style.transform = view.transform;\r
    };\r
\r
    const toPlane = (x, y) => {\r
      const { inverse, far } = state.view;\r
      if (!inverse) return [x, y];\r
      if (inverse[6] * x + inverse[7] * y + inverse[8] < 1 / far) return null;\r
      return project(inverse, x, y);\r
    };\r
\r
    const range = (layout, margin) => {\r
      const { stepX, stepY } = layout;\r
      const { view } = state;\r
      return [\r
        Math.floor((state.offsetX + view.x0 - margin) / stepX) - 1,\r
        Math.ceil((state.offsetX + view.x0 + view.width + margin) / stepX) + 1,\r
        Math.floor((state.offsetY + view.y0 - margin) / stepY) - 1,\r
        Math.ceil((state.offsetY + view.y0 + view.height + margin) / stepY) + 1\r
      ];\r
    };\r
\r
    const nearestCell = (s, layout, wx, wy) => {\r
      const { stepX, stepY } = layout;\r
      const ci = Math.round(wx / stepX);\r
      const cj = Math.round(wy / stepY);\r
      let best = Infinity;\r
      let cell = [ci, cj];\r
      for (let i = ci - 2; i <= ci + 2; i++) {\r
        for (let j = cj - 2; j <= cj + 2; j++) {\r
          const [x, y] = centerOf(s.shape, layout, i, j);\r
          const d = (x - wx) ** 2 + (y - wy) ** 2;\r
          if (d < best) {\r
            best = d;\r
            cell = [i, j];\r
          }\r
        }\r
      }\r
      return cell;\r
    };\r
\r
    const illuminate = (s, layout, dt) => {\r
      const decay = Math.exp(-dt / s.trail);\r
      for (const [key, value] of state.lit) {\r
        const next = value * decay;\r
        if (next < 0.004) {\r
          state.lit.delete(key);\r
          state.hues.delete(key);\r
        } else state.lit.set(key, next);\r
      }\r
      if (state.spotPower < 0.01) return;\r
      const wx = state.spotX + state.offsetX;\r
      const wy = state.spotY + state.offsetY;\r
      const reach = Math.max(s.radius, 0.5) * s.cellSize;\r
      const [hi, hj] = nearestCell(s, layout, wx, wy);\r
      const spanI = Math.ceil(reach / layout.stepX) + 2;\r
      const spanJ = Math.ceil(reach / layout.stepY) + 2;\r
      const hue = state.time * 120;\r
      for (let i = hi - spanI; i <= hi + spanI; i++) {\r
        for (let j = hj - spanJ; j <= hj + spanJ; j++) {\r
          const [x, y] = centerOf(s.shape, layout, i, j);\r
          const distance = Math.hypot(x - wx, y - wy);\r
          let value = s.radius > 0 ? smoothstep(reach, reach * 0.15, distance) : 0;\r
          if (i === hi && j === hj) value = Math.max(value, 1);\r
          value *= state.spotPower;\r
          if (value <= 0.004) continue;\r
          const key = keyOf(i, j);\r
          if (value > (state.lit.get(key) ?? 0)) {\r
            state.lit.set(key, value);\r
            state.hues.set(key, hue + ((x + y) / s.cellSize) * 12);\r
          }\r
        }\r
      }\r
    };\r
\r
    const cascadeAt = (s, x, y) => {\r
      let value = 0;\r
      for (const cascade of state.cascades) {\r
        const ring = Math.round(Math.hypot(x - cascade.x, y - cascade.y) / s.cellSize);\r
        const local = state.time - cascade.time - ring * 0.055;\r
        if (local < 0) continue;\r
        const pulse = Math.exp(-((local / 0.085) ** 2)) * cascade.power * Math.max(0, 1 - ring / cascade.reach);\r
        if (pulse > value) {\r
          value = pulse;\r
          state.cascadeHue = cascade.hue + ring * 16;\r
        }\r
      }\r
      return value;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { view, ratio } = state;\r
      const layout = layoutFor(s.shape, s.cellSize);\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.globalCompositeOperation = 'source-over';\r
      ctx.globalAlpha = 1;\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      ctx.setTransform(ratio, 0, 0, ratio, -view.x0 * ratio, -view.y0 * ratio);\r
\r
      const left = view.x0;\r
      const top = view.y0;\r
      const right = view.x0 + view.width;\r
      const bottom = view.y0 + view.height;\r
      const size = s.cellSize;\r
      const [i0, i1, j0, j1] = range(layout, size);\r
      const markers = s.shape === 'cross' || s.shape === 'dot';\r
      const elapsed = state.time - state.startedAt;\r
      const introRadius = s.intro && !reduce ? elapsed * view.reach * 1.8 : Infinity;\r
      const originX = state.width / 2;\r
      const originY = state.height / 2;\r
      const centerX = originX + state.offsetX;\r
      const centerY = originY + state.offsetY;\r
\r
      ctx.lineWidth = s.lineWidth;\r
      ctx.lineJoin = 'round';\r
      ctx.lineCap = 'round';\r
      ctx.strokeStyle = s.lineColor;\r
      ctx.fillStyle = s.lineColor;\r
      ctx.beginPath();\r
      if (s.shape === 'square') {\r
        for (let i = i0; i <= i1; i++) {\r
          const x = i * layout.stepX - state.offsetX;\r
          ctx.moveTo(x, top - size);\r
          ctx.lineTo(x, bottom + size);\r
        }\r
        for (let j = j0; j <= j1; j++) {\r
          const y = j * layout.stepY - state.offsetY;\r
          ctx.moveTo(left - size, y);\r
          ctx.lineTo(right + size, y);\r
        }\r
      } else {\r
        for (let i = i0; i <= i1; i++) {\r
          for (let j = j0; j <= j1; j++) {\r
            const [cx, cy] = centerOf(s.shape, layout, i, j);\r
            traceCell(ctx, s.shape, layout, size, i, j, cx - state.offsetX, cy - state.offsetY, 0);\r
          }\r
        }\r
      }\r
      if (s.shape === 'dot') ctx.fill();\r
      else ctx.stroke();\r
\r
      if (introRadius !== Infinity) {\r
        const gradient = ctx.createRadialGradient(originX, originY, 0, originX, originY, Math.max(1, introRadius));\r
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');\r
        gradient.addColorStop(0.82, 'rgba(0, 0, 0, 1)');\r
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');\r
        ctx.globalCompositeOperation = 'destination-in';\r
        ctx.fillStyle = gradient;\r
        ctx.fillRect(left, top, view.width, view.height);\r
        ctx.globalCompositeOperation = 'source-over';\r
      }\r
\r
      const glowing = s.glow > 0;\r
      for (let i = i0; i <= i1; i++) {\r
        for (let j = j0; j <= j1; j++) {\r
          const [cx, cy] = centerOf(s.shape, layout, i, j);\r
          const key = keyOf(i, j);\r
          let value = state.lit.get(key) ?? 0;\r
          let hue = state.hues.get(key) ?? 0;\r
          if (state.cascades.length) {\r
            const pulse = cascadeAt(s, cx, cy);\r
            if (pulse > value) {\r
              value = pulse;\r
              hue = state.cascadeHue;\r
            }\r
          }\r
          if (s.twinkle > 0 && !reduce) {\r
            const seed = hash(i, j);\r
            const wave = Math.sin(state.time * (0.35 + seed * 0.5) + seed * 40);\r
            const sparkle = s.twinkle * 0.7 * Math.max(0, wave) ** 18;\r
            if (sparkle > value) {\r
              value = sparkle;\r
              hue = seed * 360;\r
            }\r
          }\r
          if (introRadius !== Infinity) {\r
            const front = introRadius - Math.hypot(cx - centerX, cy - centerY);\r
            if (front < 0) continue;\r
            const wave = Math.exp(-((front / (size * 1.4)) ** 2)) * 0.85;\r
            if (wave > value) {\r
              value = wave;\r
              hue = (Math.atan2(cy - centerY, cx - centerX) * 180) / Math.PI + state.time * 120;\r
            }\r
          }\r
          if (value <= 0.01) continue;\r
          const color = s.rainbow ? tint(hue, s.tone) : s.hoverColor;\r
          const x = cx - state.offsetX;\r
          const y = cy - state.offsetY;\r
          ctx.beginPath();\r
          traceCell(ctx, s.shape, layout, size, i, j, x, y, markers ? value * size * 0.08 : s.lineWidth * 0.5);\r
          if (markers) {\r
            ctx.globalAlpha = Math.min(1, value);\r
            if (glowing) {\r
              ctx.shadowColor = color;\r
              ctx.shadowBlur = s.glow * 14 * value;\r
            }\r
            if (s.shape === 'dot') {\r
              ctx.fillStyle = color;\r
              ctx.fill();\r
            } else {\r
              ctx.strokeStyle = color;\r
              ctx.lineWidth = s.lineWidth * (1 + value * 0.6);\r
              ctx.stroke();\r
            }\r
            ctx.shadowBlur = 0;\r
            continue;\r
          }\r
          if (s.fillOpacity > 0) {\r
            ctx.globalAlpha = Math.min(1, value) * s.fillOpacity;\r
            ctx.fillStyle = s.rainbow ? color : s.hoverFillColor;\r
            ctx.fill();\r
          }\r
          ctx.globalAlpha = Math.min(1, value) * 0.85;\r
          if (glowing) {\r
            ctx.shadowColor = color;\r
            ctx.shadowBlur = s.glow * 16 * value;\r
          }\r
          ctx.strokeStyle = color;\r
          ctx.lineWidth = s.lineWidth;\r
          ctx.stroke();\r
          ctx.shadowBlur = 0;\r
        }\r
      }\r
      ctx.globalAlpha = 1;\r
\r
      if (view.mist) {\r
        const [mx0, my0, mx1, my1] = view.mist;\r
        const gradient = ctx.createLinearGradient(mx0, my0, mx1, my1);\r
        for (let k = 0; k <= 8; k++) {\r
          const t = k / 8;\r
          gradient.addColorStop(t, \`rgba(0, 0, 0, \${(1 - smootherstep(t)).toFixed(3)})\`);\r
        }\r
        ctx.globalCompositeOperation = 'destination-in';\r
        ctx.fillStyle = gradient;\r
        ctx.fillRect(left, top, view.width, view.height);\r
        ctx.globalCompositeOperation = 'source-over';\r
      }\r
    };\r
\r
    const frame = now => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      resize();\r
      if (!state.started) {\r
        state.started = true;\r
        state.startedAt = state.time;\r
      }\r
      if (!s.paused) {\r
        state.time += dt;\r
        if (!reduce) {\r
          const [dx, dy] = DIRECTIONS[s.direction];\r
          state.offsetX -= dx * s.speed * 60 * dt;\r
          state.offsetY -= dy * s.speed * 60 * dt;\r
        }\r
        const want = state.inside ? 1 : 0;\r
        state.spotPower += (want - state.spotPower) * (1 - Math.exp(-(want ? 10 : 5) * dt));\r
        const stiffness = 220;\r
        const damping = 2 * Math.sqrt(stiffness) * 0.85;\r
        state.spotVX += (stiffness * (state.pointerX - state.spotX) - damping * state.spotVX) * dt;\r
        state.spotVY += (stiffness * (state.pointerY - state.spotY) - damping * state.spotVY) * dt;\r
        state.spotX += state.spotVX * dt;\r
        state.spotY += state.spotVY * dt;\r
        illuminate(s, layoutFor(s.shape, s.cellSize), dt);\r
        state.cascades = state.cascades.filter(cascade => state.time - cascade.time < cascade.reach * 0.055 + 0.4);\r
      }\r
      draw();\r
      const settled =\r
        s.paused ||\r
        (s.speed === 0 || s.direction === 'none' || reduce\r
          ? state.lit.size === 0 &&\r
            state.cascades.length === 0 &&\r
            s.twinkle === 0 &&\r
            state.spotPower < 0.005 &&\r
            state.time - state.startedAt > 3\r
          : false);\r
      if (!settled && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const pointFrom = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;\r
      return toPlane(x, y);\r
    };\r
\r
    const onMove = event => {\r
      const point = pointFrom(event);\r
      if (point && !state.inside && state.spotPower < 0.02) {\r
        state.spotX = point[0];\r
        state.spotY = point[1];\r
        state.spotVX = 0;\r
        state.spotVY = 0;\r
      }\r
      state.inside = point !== null;\r
      if (point) {\r
        state.pointerX = point[0];\r
        state.pointerY = point[1];\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
    };\r
\r
    const onDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickCascade) return;\r
      const point = pointFrom(event);\r
      if (!point) return;\r
      state.cascades.push({\r
        x: point[0] + state.offsetX,\r
        y: point[1] + state.offsetY,\r
        time: state.time,\r
        power: 1,\r
        reach: Math.hypot(state.view.width, state.view.height) / s.cellSize,\r
        hue: state.time * 120\r
      });\r
      if (state.cascades.length > 6) state.cascades.shift();\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    engineRef.current = {\r
      redraw: () => {\r
        resize();\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  const mask = fadeMask(clamp(fade, 0, 1));\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`shape-grid \${className}\`.trim()}\r
      style={{\r
        opacity: clamp(opacity, 0, 1),\r
        backgroundColor,\r
        ...(mask === 'none'\r
          ? null\r
          : { maskImage: mask, WebkitMaskImage: mask, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }),\r
        ...style\r
      }}\r
    >\r
      <canvas ref={canvasRef} className="shape-grid-canvas" />\r
    </div>\r
  );\r
}\r
`,r=`.shape-grid {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.shape-grid-canvas {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  display: block;\r
  transform-origin: 0 0;\r
}\r
`,t=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const SHAPES = ['square', 'tile', 'hexagon', 'triangle', 'diamond', 'circle', 'cross', 'dot'];\r
const DIRECTIONS = {\r
  right: [1, 0],\r
  left: [-1, 0],\r
  up: [0, -1],\r
  down: [0, 1],\r
  diagonal: [Math.SQRT1_2, -Math.SQRT1_2],\r
  none: [0, 0]\r
};\r
const SQRT3 = Math.sqrt(3);\r
const OFFSET = 32768;\r
const FAR = 2.5;\r
const MAX_PIXELS = 8e6;\r
\r
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);\r
\r
const smoothstep = (edge0, edge1, value) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const hash = (i, j) => {\r
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;\r
  return s - Math.floor(s);\r
};\r
\r
const keyOf = (i, j) => (i + OFFSET) * 65536 + (j + OFFSET);\r
\r
const fadeMask = amount => {\r
  if (amount <= 0) return 'none';\r
  const edge = amount * 26;\r
  const stops = [];\r
  for (let k = 0; k <= 8; k++) {\r
    const t = k / 8;\r
    stops.push(\`rgba(0, 0, 0, \${smootherstep(t).toFixed(3)}) \${(t * edge).toFixed(2)}%\`);\r
  }\r
  const inner = stops.join(', ');\r
  const outer = [...stops]\r
    .reverse()\r
    .map(stop => stop.replace(/ ([\\d.]+)%$/, (_, value) => \` \${(100 - parseFloat(value)).toFixed(2)}%\`))\r
    .join(', ');\r
  const axis = direction => \`linear-gradient(\${direction}, \${inner}, \${outer})\`;\r
  return \`\${axis('to right')}, \${axis('to bottom')}\`;\r
};\r
\r
const lightnessOf = color => {\r
  let hex = String(color).trim().replace(/^#/, '');\r
  if (hex.length === 3 || hex.length === 4) hex = hex.replace(/./g, '$&$&');\r
  hex = hex.slice(0, 6);\r
  if (!/^[0-9a-f]{6}$/i.test(hex)) return 0.6;\r
  const value = parseInt(hex, 16);\r
  const channels = [value >> 16, (value >> 8) & 255, value & 255];\r
  return (Math.max(...channels) + Math.min(...channels)) / 510;\r
};\r
\r
const tint = (hue, lightness) =>\r
  \`hsl(\${(((hue % 360) + 360) % 360).toFixed(1)}, 90%, \${(lightness * 100).toFixed(1)}%)\`;\r
\r
const multiply = (a, b) =>\r
  [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => {\r
    const r = k - (k % 3);\r
    const c = k % 3;\r
    return a[r] * b[c] + a[r + 1] * b[c + 3] + a[r + 2] * b[c + 6];\r
  });\r
\r
const invert = m => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const project = (m, x, y) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];\r
};\r
\r
const flatView = (width, height) => ({\r
  x0: 0,\r
  y0: 0,\r
  width,\r
  height,\r
  inverse: null,\r
  transform: 'none',\r
  mist: null,\r
  far: FAR,\r
  reach: Math.hypot(width, height) / 2\r
});\r
\r
const viewFor = (tiltX, tiltY, width, height, cellSize) => {\r
  if (!tiltX && !tiltY) return flatView(width, height);\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  const forward = multiply(multiply([1, 0, cx, 0, 1, cy, 0, 0, 1], tilt), [1, 0, -cx, 0, 1, -cy, 0, 0, 1]);\r
  const inverse = invert(forward);\r
  const facing = Math.cos(ax) * Math.cos(ay);\r
  const far = clamp(Math.sqrt((facing * cellSize) / 5), 1.15, FAR);\r
  const near = Math.min(Math.sqrt((facing * cellSize) / 14), far - 0.35);\r
  const nearness = (x, y) => inverse[6] * x + inverse[7] * y + inverse[8] - 1 / far;\r
  const corners = [\r
    [0, 0],\r
    [width, 0],\r
    [width, height],\r
    [0, height]\r
  ];\r
  let x0 = Infinity;\r
  let y0 = Infinity;\r
  let x1 = -Infinity;\r
  let y1 = -Infinity;\r
  const include = (x, y) => {\r
    const [px, py] = project(inverse, x, y);\r
    x0 = Math.min(x0, px);\r
    y0 = Math.min(y0, py);\r
    x1 = Math.max(x1, px);\r
    y1 = Math.max(y1, py);\r
  };\r
  corners.forEach((a, k) => {\r
    const b = corners[(k + 1) % 4];\r
    const na = nearness(a[0], a[1]);\r
    const nb = nearness(b[0], b[1]);\r
    if (na >= 0) include(a[0], a[1]);\r
    if (na >= 0 !== nb >= 0) {\r
      const t = na / (na - nb);\r
      include(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);\r
    }\r
  });\r
  if (!(x1 > x0 && y1 > y0)) return flatView(width, height);\r
  x0 = Math.floor(x0 / 16) * 16;\r
  y0 = Math.floor(y0 / 16) * 16;\r
  x1 = Math.ceil(x1 / 16) * 16;\r
  y1 = Math.ceil(y1 / 16) * 16;\r
  const m = multiply(forward, [1, 0, x0, 0, 1, y0, 0, 0, 1]);\r
  const transform = \`matrix3d(\${[m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, m[8]].join(', ')})\`;\r
  const gx = forward[6];\r
  const gy = forward[7];\r
  const slope = Math.hypot(gx, gy);\r
  const mist =\r
    slope > 1e-9\r
      ? [\r
          cx + (gx / slope) * ((near - 1) / slope),\r
          cy + (gy / slope) * ((near - 1) / slope),\r
          cx + (gx / slope) * ((far - 1) / slope),\r
          cy + (gy / slope) * ((far - 1) / slope)\r
        ]\r
      : null;\r
  const reach = Math.max(\r
    Math.hypot(x0 - cx, y0 - cy),\r
    Math.hypot(x1 - cx, y0 - cy),\r
    Math.hypot(x1 - cx, y1 - cy),\r
    Math.hypot(x0 - cx, y1 - cy)\r
  );\r
  return { x0, y0, width: x1 - x0, height: y1 - y0, inverse, transform, mist, far, reach };\r
};\r
\r
const layoutFor = (shape, size) => {\r
  if (shape === 'hexagon') {\r
    const radius = size / SQRT3;\r
    return { stepX: radius * 1.5, stepY: size, radius };\r
  }\r
  if (shape === 'triangle') {\r
    const side = (size * 2) / SQRT3;\r
    return { stepX: side / 2, stepY: size, side };\r
  }\r
  return { stepX: size, stepY: size };\r
};\r
\r
const centerOf = (shape, layout, i, j) => {\r
  const { stepX, stepY } = layout;\r
  if (shape === 'hexagon') return [i * stepX, j * stepY + (Math.abs(i) % 2 === 1 ? stepY / 2 : 0)];\r
  if (shape === 'triangle') {\r
    const up = (((i + j) % 2) + 2) % 2 === 0;\r
    return [i * stepX, j * stepY + (up ? stepY * (2 / 3) : stepY / 3)];\r
  }\r
  if (shape === 'cross' || shape === 'dot') return [i * stepX, j * stepY];\r
  return [(i + 0.5) * stepX, (j + 0.5) * stepY];\r
};\r
\r
const traceCell = (ctx, shape, layout, size, i, j, x, y, inset) => {\r
  if (shape === 'hexagon') {\r
    const r = layout.radius - inset;\r
    for (let k = 0; k < 6; k++) {\r
      const angle = (Math.PI / 3) * k;\r
      const px = x + r * Math.cos(angle);\r
      const py = y + r * Math.sin(angle);\r
      if (k === 0) ctx.moveTo(px, py);\r
      else ctx.lineTo(px, py);\r
    }\r
    ctx.closePath();\r
  } else if (shape === 'triangle') {\r
    const up = (((i + j) % 2) + 2) % 2 === 0;\r
    const half = layout.side / 2 - inset * 1.7;\r
    const height = size - inset * 2.6;\r
    const top = up ? y - height * (2 / 3) : y + height * (2 / 3);\r
    const base = up ? y + height / 3 : y - height / 3;\r
    ctx.moveTo(x, top);\r
    ctx.lineTo(x + half, base);\r
    ctx.lineTo(x - half, base);\r
    ctx.closePath();\r
  } else if (shape === 'diamond') {\r
    const r = size / 2 - inset;\r
    ctx.moveTo(x, y - r);\r
    ctx.lineTo(x + r, y);\r
    ctx.lineTo(x, y + r);\r
    ctx.lineTo(x - r, y);\r
    ctx.closePath();\r
  } else if (shape === 'circle') {\r
    ctx.moveTo(x + size / 2 - inset, y);\r
    ctx.arc(x, y, Math.max(0.5, size / 2 - inset), 0, Math.PI * 2);\r
  } else if (shape === 'tile') {\r
    const half = size / 2 - Math.max(inset, size * 0.06);\r
    const r = Math.min(half, size * 0.22);\r
    ctx.roundRect(x - half, y - half, half * 2, half * 2, r);\r
  } else if (shape === 'cross') {\r
    const arm = size * 0.16 + inset;\r
    ctx.moveTo(x - arm, y);\r
    ctx.lineTo(x + arm, y);\r
    ctx.moveTo(x, y - arm);\r
    ctx.lineTo(x, y + arm);\r
  } else if (shape === 'dot') {\r
    const r = size * 0.05 + inset;\r
    ctx.moveTo(x + r, y);\r
    ctx.arc(x, y, r, 0, Math.PI * 2);\r
  } else {\r
    const half = size / 2 - inset;\r
    ctx.rect(x - half, y - half, half * 2, half * 2);\r
  }\r
};\r
\r
export default function ShapeGrid({\r
  shape = 'square',\r
  cellSize = 40,\r
  lineWidth = 1,\r
  direction = 'diagonal',\r
  speed = 0.5,\r
  lineColor = '#2a2734',\r
  hoverColor = '#ffffff',\r
  hoverFillColor,\r
  fillOpacity = 0.15,\r
  rainbow = false,\r
  tiltX = 0,\r
  tiltY = 0,\r
  radius = 1.5,\r
  trail = 0.6,\r
  glow = 0.35,\r
  twinkle = 0,\r
  fade = 1,\r
  clickCascade = true,\r
  intro = true,\r
  opacity = 1,\r
  backgroundColor = 'transparent',\r
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
    shape: SHAPES.includes(shape) ? shape : 'square',\r
    cellSize: Math.max(8, cellSize),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    direction: DIRECTIONS[direction] ? direction : 'diagonal',\r
    speed: Math.max(0, speed),\r
    lineColor,\r
    hoverColor,\r
    hoverFillColor: hoverFillColor ?? hoverColor,\r
    fillOpacity: clamp(fillOpacity, 0, 1),\r
    rainbow,\r
    tone: clamp(lightnessOf(hoverColor), 0.45, 0.68),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    radius: Math.max(0, radius),\r
    trail: Math.max(0.05, trail),\r
    glow: clamp(glow, 0, 1),\r
    twinkle: clamp(twinkle, 0, 1),\r
    clickCascade,\r
    intro,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const ctx = canvas.getContext('2d');\r
    if (!ctx) return undefined;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      view: flatView(1, 1),\r
      offsetX: 0,\r
      offsetY: 0,\r
      started: false,\r
      startedAt: 0,\r
      inside: false,\r
      pointerX: 0,\r
      pointerY: 0,\r
      spotX: 0,\r
      spotY: 0,\r
      spotVX: 0,\r
      spotVY: 0,\r
      spotPower: 0,\r
      lit: new Map(),\r
      hues: new Map(),\r
      cascades: [],\r
      cascadeHue: 0\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const view = viewFor(s.tiltX, s.tiltY, width, height, s.cellSize);\r
      let ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const pixels = view.width * view.height * ratio * ratio;\r
      if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels);\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      state.view = view;\r
      const pixelWidth = Math.max(1, Math.round(view.width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(view.height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      const cssWidth = \`\${view.width}px\`;\r
      const cssHeight = \`\${view.height}px\`;\r
      if (canvas.style.width !== cssWidth) canvas.style.width = cssWidth;\r
      if (canvas.style.height !== cssHeight) canvas.style.height = cssHeight;\r
      if (canvas.style.transform !== view.transform) canvas.style.transform = view.transform;\r
    };\r
\r
    const toPlane = (x, y) => {\r
      const { inverse, far } = state.view;\r
      if (!inverse) return [x, y];\r
      if (inverse[6] * x + inverse[7] * y + inverse[8] < 1 / far) return null;\r
      return project(inverse, x, y);\r
    };\r
\r
    const range = (layout, margin) => {\r
      const { stepX, stepY } = layout;\r
      const { view } = state;\r
      return [\r
        Math.floor((state.offsetX + view.x0 - margin) / stepX) - 1,\r
        Math.ceil((state.offsetX + view.x0 + view.width + margin) / stepX) + 1,\r
        Math.floor((state.offsetY + view.y0 - margin) / stepY) - 1,\r
        Math.ceil((state.offsetY + view.y0 + view.height + margin) / stepY) + 1\r
      ];\r
    };\r
\r
    const nearestCell = (s, layout, wx, wy) => {\r
      const { stepX, stepY } = layout;\r
      const ci = Math.round(wx / stepX);\r
      const cj = Math.round(wy / stepY);\r
      let best = Infinity;\r
      let cell = [ci, cj];\r
      for (let i = ci - 2; i <= ci + 2; i++) {\r
        for (let j = cj - 2; j <= cj + 2; j++) {\r
          const [x, y] = centerOf(s.shape, layout, i, j);\r
          const d = (x - wx) ** 2 + (y - wy) ** 2;\r
          if (d < best) {\r
            best = d;\r
            cell = [i, j];\r
          }\r
        }\r
      }\r
      return cell;\r
    };\r
\r
    const illuminate = (s, layout, dt) => {\r
      const decay = Math.exp(-dt / s.trail);\r
      for (const [key, value] of state.lit) {\r
        const next = value * decay;\r
        if (next < 0.004) {\r
          state.lit.delete(key);\r
          state.hues.delete(key);\r
        } else state.lit.set(key, next);\r
      }\r
      if (state.spotPower < 0.01) return;\r
      const wx = state.spotX + state.offsetX;\r
      const wy = state.spotY + state.offsetY;\r
      const reach = Math.max(s.radius, 0.5) * s.cellSize;\r
      const [hi, hj] = nearestCell(s, layout, wx, wy);\r
      const spanI = Math.ceil(reach / layout.stepX) + 2;\r
      const spanJ = Math.ceil(reach / layout.stepY) + 2;\r
      const hue = state.time * 120;\r
      for (let i = hi - spanI; i <= hi + spanI; i++) {\r
        for (let j = hj - spanJ; j <= hj + spanJ; j++) {\r
          const [x, y] = centerOf(s.shape, layout, i, j);\r
          const distance = Math.hypot(x - wx, y - wy);\r
          let value = s.radius > 0 ? smoothstep(reach, reach * 0.15, distance) : 0;\r
          if (i === hi && j === hj) value = Math.max(value, 1);\r
          value *= state.spotPower;\r
          if (value <= 0.004) continue;\r
          const key = keyOf(i, j);\r
          if (value > (state.lit.get(key) ?? 0)) {\r
            state.lit.set(key, value);\r
            state.hues.set(key, hue + ((x + y) / s.cellSize) * 12);\r
          }\r
        }\r
      }\r
    };\r
\r
    const cascadeAt = (s, x, y) => {\r
      let value = 0;\r
      for (const cascade of state.cascades) {\r
        const ring = Math.round(Math.hypot(x - cascade.x, y - cascade.y) / s.cellSize);\r
        const local = state.time - cascade.time - ring * 0.055;\r
        if (local < 0) continue;\r
        const pulse = Math.exp(-((local / 0.085) ** 2)) * cascade.power * Math.max(0, 1 - ring / cascade.reach);\r
        if (pulse > value) {\r
          value = pulse;\r
          state.cascadeHue = cascade.hue + ring * 16;\r
        }\r
      }\r
      return value;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { view, ratio } = state;\r
      const layout = layoutFor(s.shape, s.cellSize);\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.globalCompositeOperation = 'source-over';\r
      ctx.globalAlpha = 1;\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      ctx.setTransform(ratio, 0, 0, ratio, -view.x0 * ratio, -view.y0 * ratio);\r
\r
      const left = view.x0;\r
      const top = view.y0;\r
      const right = view.x0 + view.width;\r
      const bottom = view.y0 + view.height;\r
      const size = s.cellSize;\r
      const [i0, i1, j0, j1] = range(layout, size);\r
      const markers = s.shape === 'cross' || s.shape === 'dot';\r
      const elapsed = state.time - state.startedAt;\r
      const introRadius = s.intro && !reduce ? elapsed * view.reach * 1.8 : Infinity;\r
      const originX = state.width / 2;\r
      const originY = state.height / 2;\r
      const centerX = originX + state.offsetX;\r
      const centerY = originY + state.offsetY;\r
\r
      ctx.lineWidth = s.lineWidth;\r
      ctx.lineJoin = 'round';\r
      ctx.lineCap = 'round';\r
      ctx.strokeStyle = s.lineColor;\r
      ctx.fillStyle = s.lineColor;\r
      ctx.beginPath();\r
      if (s.shape === 'square') {\r
        for (let i = i0; i <= i1; i++) {\r
          const x = i * layout.stepX - state.offsetX;\r
          ctx.moveTo(x, top - size);\r
          ctx.lineTo(x, bottom + size);\r
        }\r
        for (let j = j0; j <= j1; j++) {\r
          const y = j * layout.stepY - state.offsetY;\r
          ctx.moveTo(left - size, y);\r
          ctx.lineTo(right + size, y);\r
        }\r
      } else {\r
        for (let i = i0; i <= i1; i++) {\r
          for (let j = j0; j <= j1; j++) {\r
            const [cx, cy] = centerOf(s.shape, layout, i, j);\r
            traceCell(ctx, s.shape, layout, size, i, j, cx - state.offsetX, cy - state.offsetY, 0);\r
          }\r
        }\r
      }\r
      if (s.shape === 'dot') ctx.fill();\r
      else ctx.stroke();\r
\r
      if (introRadius !== Infinity) {\r
        const gradient = ctx.createRadialGradient(originX, originY, 0, originX, originY, Math.max(1, introRadius));\r
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');\r
        gradient.addColorStop(0.82, 'rgba(0, 0, 0, 1)');\r
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');\r
        ctx.globalCompositeOperation = 'destination-in';\r
        ctx.fillStyle = gradient;\r
        ctx.fillRect(left, top, view.width, view.height);\r
        ctx.globalCompositeOperation = 'source-over';\r
      }\r
\r
      const glowing = s.glow > 0;\r
      for (let i = i0; i <= i1; i++) {\r
        for (let j = j0; j <= j1; j++) {\r
          const [cx, cy] = centerOf(s.shape, layout, i, j);\r
          const key = keyOf(i, j);\r
          let value = state.lit.get(key) ?? 0;\r
          let hue = state.hues.get(key) ?? 0;\r
          if (state.cascades.length) {\r
            const pulse = cascadeAt(s, cx, cy);\r
            if (pulse > value) {\r
              value = pulse;\r
              hue = state.cascadeHue;\r
            }\r
          }\r
          if (s.twinkle > 0 && !reduce) {\r
            const seed = hash(i, j);\r
            const wave = Math.sin(state.time * (0.35 + seed * 0.5) + seed * 40);\r
            const sparkle = s.twinkle * 0.7 * Math.max(0, wave) ** 18;\r
            if (sparkle > value) {\r
              value = sparkle;\r
              hue = seed * 360;\r
            }\r
          }\r
          if (introRadius !== Infinity) {\r
            const front = introRadius - Math.hypot(cx - centerX, cy - centerY);\r
            if (front < 0) continue;\r
            const wave = Math.exp(-((front / (size * 1.4)) ** 2)) * 0.85;\r
            if (wave > value) {\r
              value = wave;\r
              hue = (Math.atan2(cy - centerY, cx - centerX) * 180) / Math.PI + state.time * 120;\r
            }\r
          }\r
          if (value <= 0.01) continue;\r
          const color = s.rainbow ? tint(hue, s.tone) : s.hoverColor;\r
          const x = cx - state.offsetX;\r
          const y = cy - state.offsetY;\r
          ctx.beginPath();\r
          traceCell(ctx, s.shape, layout, size, i, j, x, y, markers ? value * size * 0.08 : s.lineWidth * 0.5);\r
          if (markers) {\r
            ctx.globalAlpha = Math.min(1, value);\r
            if (glowing) {\r
              ctx.shadowColor = color;\r
              ctx.shadowBlur = s.glow * 14 * value;\r
            }\r
            if (s.shape === 'dot') {\r
              ctx.fillStyle = color;\r
              ctx.fill();\r
            } else {\r
              ctx.strokeStyle = color;\r
              ctx.lineWidth = s.lineWidth * (1 + value * 0.6);\r
              ctx.stroke();\r
            }\r
            ctx.shadowBlur = 0;\r
            continue;\r
          }\r
          if (s.fillOpacity > 0) {\r
            ctx.globalAlpha = Math.min(1, value) * s.fillOpacity;\r
            ctx.fillStyle = s.rainbow ? color : s.hoverFillColor;\r
            ctx.fill();\r
          }\r
          ctx.globalAlpha = Math.min(1, value) * 0.85;\r
          if (glowing) {\r
            ctx.shadowColor = color;\r
            ctx.shadowBlur = s.glow * 16 * value;\r
          }\r
          ctx.strokeStyle = color;\r
          ctx.lineWidth = s.lineWidth;\r
          ctx.stroke();\r
          ctx.shadowBlur = 0;\r
        }\r
      }\r
      ctx.globalAlpha = 1;\r
\r
      if (view.mist) {\r
        const [mx0, my0, mx1, my1] = view.mist;\r
        const gradient = ctx.createLinearGradient(mx0, my0, mx1, my1);\r
        for (let k = 0; k <= 8; k++) {\r
          const t = k / 8;\r
          gradient.addColorStop(t, \`rgba(0, 0, 0, \${(1 - smootherstep(t)).toFixed(3)})\`);\r
        }\r
        ctx.globalCompositeOperation = 'destination-in';\r
        ctx.fillStyle = gradient;\r
        ctx.fillRect(left, top, view.width, view.height);\r
        ctx.globalCompositeOperation = 'source-over';\r
      }\r
    };\r
\r
    const frame = now => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      resize();\r
      if (!state.started) {\r
        state.started = true;\r
        state.startedAt = state.time;\r
      }\r
      if (!s.paused) {\r
        state.time += dt;\r
        if (!reduce) {\r
          const [dx, dy] = DIRECTIONS[s.direction];\r
          state.offsetX -= dx * s.speed * 60 * dt;\r
          state.offsetY -= dy * s.speed * 60 * dt;\r
        }\r
        const want = state.inside ? 1 : 0;\r
        state.spotPower += (want - state.spotPower) * (1 - Math.exp(-(want ? 10 : 5) * dt));\r
        const stiffness = 220;\r
        const damping = 2 * Math.sqrt(stiffness) * 0.85;\r
        state.spotVX += (stiffness * (state.pointerX - state.spotX) - damping * state.spotVX) * dt;\r
        state.spotVY += (stiffness * (state.pointerY - state.spotY) - damping * state.spotVY) * dt;\r
        state.spotX += state.spotVX * dt;\r
        state.spotY += state.spotVY * dt;\r
        illuminate(s, layoutFor(s.shape, s.cellSize), dt);\r
        state.cascades = state.cascades.filter(cascade => state.time - cascade.time < cascade.reach * 0.055 + 0.4);\r
      }\r
      draw();\r
      const settled =\r
        s.paused ||\r
        (s.speed === 0 || s.direction === 'none' || reduce\r
          ? state.lit.size === 0 &&\r
            state.cascades.length === 0 &&\r
            s.twinkle === 0 &&\r
            state.spotPower < 0.005 &&\r
            state.time - state.startedAt > 3\r
          : false);\r
      if (!settled && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const pointFrom = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;\r
      return toPlane(x, y);\r
    };\r
\r
    const onMove = event => {\r
      const point = pointFrom(event);\r
      if (point && !state.inside && state.spotPower < 0.02) {\r
        state.spotX = point[0];\r
        state.spotY = point[1];\r
        state.spotVX = 0;\r
        state.spotVY = 0;\r
      }\r
      state.inside = point !== null;\r
      if (point) {\r
        state.pointerX = point[0];\r
        state.pointerY = point[1];\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
    };\r
\r
    const onDown = event => {\r
      const s = settingsRef.current;\r
      if (!s.clickCascade) return;\r
      const point = pointFrom(event);\r
      if (!point) return;\r
      state.cascades.push({\r
        x: point[0] + state.offsetX,\r
        y: point[1] + state.offsetY,\r
        time: state.time,\r
        power: 1,\r
        reach: Math.hypot(state.view.width, state.view.height) / s.cellSize,\r
        hue: state.time * 120\r
      });\r
      if (state.cascades.length > 6) state.cascades.shift();\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    engineRef.current = {\r
      redraw: () => {\r
        resize();\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  const mask = fadeMask(clamp(fade, 0, 1));\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`relative h-full w-full overflow-hidden \${className}\`.trim()}\r
      style={{\r
        opacity: clamp(opacity, 0, 1),\r
        backgroundColor,\r
        ...(mask === 'none'\r
          ? null\r
          : { maskImage: mask, WebkitMaskImage: mask, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }),\r
        ...style\r
      }}\r
    >\r
      <canvas ref={canvasRef} className="absolute left-0 top-0 block origin-top-left" />\r
    </div>\r
  );\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
import './ShapeGrid.css';\r
\r
export interface ShapeGridProps {\r
  shape?: 'square' | 'tile' | 'hexagon' | 'triangle' | 'diamond' | 'circle' | 'cross' | 'dot';\r
  cellSize?: number;\r
  lineWidth?: number;\r
  direction?: 'diagonal' | 'up' | 'down' | 'left' | 'right' | 'none';\r
  speed?: number;\r
  lineColor?: string;\r
  hoverColor?: string;\r
  hoverFillColor?: string;\r
  fillOpacity?: number;\r
  rainbow?: boolean;\r
  tiltX?: number;\r
  tiltY?: number;\r
  radius?: number;\r
  trail?: number;\r
  glow?: number;\r
  twinkle?: number;\r
  fade?: number;\r
  clickCascade?: boolean;\r
  intro?: boolean;\r
  opacity?: number;\r
  backgroundColor?: string;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Layout {\r
  stepX: number;\r
  stepY: number;\r
  radius?: number;\r
  side?: number;\r
}\r
\r
interface View {\r
  x0: number;\r
  y0: number;\r
  width: number;\r
  height: number;\r
  inverse: number[] | null;\r
  transform: string;\r
  mist: number[] | null;\r
  far: number;\r
  reach: number;\r
}\r
\r
interface Settings {\r
  shape: string;\r
  cellSize: number;\r
  lineWidth: number;\r
  direction: string;\r
  speed: number;\r
  lineColor: string;\r
  hoverColor: string;\r
  hoverFillColor: string;\r
  fillOpacity: number;\r
  rainbow: boolean;\r
  tone: number;\r
  tiltX: number;\r
  tiltY: number;\r
  radius: number;\r
  trail: number;\r
  glow: number;\r
  twinkle: number;\r
  clickCascade: boolean;\r
  intro: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
}\r
\r
interface Cascade {\r
  x: number;\r
  y: number;\r
  time: number;\r
  power: number;\r
  reach: number;\r
  hue: number;\r
}\r
\r
interface Engine {\r
  redraw: () => void;\r
}\r
\r
const SHAPES = ['square', 'tile', 'hexagon', 'triangle', 'diamond', 'circle', 'cross', 'dot'];\r
const DIRECTIONS: Record<string, number[]> = {\r
  right: [1, 0],\r
  left: [-1, 0],\r
  up: [0, -1],\r
  down: [0, 1],\r
  diagonal: [Math.SQRT1_2, -Math.SQRT1_2],\r
  none: [0, 0]\r
};\r
const SQRT3 = Math.sqrt(3);\r
const OFFSET = 32768;\r
const FAR = 2.5;\r
const MAX_PIXELS = 8e6;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);\r
\r
const smoothstep = (edge0: number, edge1: number, value: number) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const hash = (i: number, j: number) => {\r
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;\r
  return s - Math.floor(s);\r
};\r
\r
const keyOf = (i: number, j: number) => (i + OFFSET) * 65536 + (j + OFFSET);\r
\r
const fadeMask = (amount: number) => {\r
  if (amount <= 0) return 'none';\r
  const edge = amount * 26;\r
  const stops: string[] = [];\r
  for (let k = 0; k <= 8; k++) {\r
    const t = k / 8;\r
    stops.push(\`rgba(0, 0, 0, \${smootherstep(t).toFixed(3)}) \${(t * edge).toFixed(2)}%\`);\r
  }\r
  const inner = stops.join(', ');\r
  const outer = [...stops]\r
    .reverse()\r
    .map(stop => stop.replace(/ ([\\d.]+)%$/, (_: string, value: string) => \` \${(100 - parseFloat(value)).toFixed(2)}%\`))\r
    .join(', ');\r
  const axis = (direction: string) => \`linear-gradient(\${direction}, \${inner}, \${outer})\`;\r
  return \`\${axis('to right')}, \${axis('to bottom')}\`;\r
};\r
\r
const lightnessOf = (color: string) => {\r
  let hex = String(color).trim().replace(/^#/, '');\r
  if (hex.length === 3 || hex.length === 4) hex = hex.replace(/./g, '$&$&');\r
  hex = hex.slice(0, 6);\r
  if (!/^[0-9a-f]{6}$/i.test(hex)) return 0.6;\r
  const value = parseInt(hex, 16);\r
  const channels = [value >> 16, (value >> 8) & 255, value & 255];\r
  return (Math.max(...channels) + Math.min(...channels)) / 510;\r
};\r
\r
const tint = (hue: number, lightness: number) =>\r
  \`hsl(\${(((hue % 360) + 360) % 360).toFixed(1)}, 90%, \${(lightness * 100).toFixed(1)}%)\`;\r
\r
const multiply = (a: number[], b: number[]) =>\r
  [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => {\r
    const r = k - (k % 3);\r
    const c = k % 3;\r
    return a[r] * b[c] + a[r + 1] * b[c + 3] + a[r + 2] * b[c + 6];\r
  });\r
\r
const invert = (m: number[]) => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const project = (m: number[], x: number, y: number) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];\r
};\r
\r
const flatView = (width: number, height: number): View => ({\r
  x0: 0,\r
  y0: 0,\r
  width,\r
  height,\r
  inverse: null,\r
  transform: 'none',\r
  mist: null,\r
  far: FAR,\r
  reach: Math.hypot(width, height) / 2\r
});\r
\r
const viewFor = (tiltX: number, tiltY: number, width: number, height: number, cellSize: number): View => {\r
  if (!tiltX && !tiltY) return flatView(width, height);\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  const forward = multiply(multiply([1, 0, cx, 0, 1, cy, 0, 0, 1], tilt), [1, 0, -cx, 0, 1, -cy, 0, 0, 1]);\r
  const inverse = invert(forward);\r
  const facing = Math.cos(ax) * Math.cos(ay);\r
  const far = clamp(Math.sqrt((facing * cellSize) / 5), 1.15, FAR);\r
  const near = Math.min(Math.sqrt((facing * cellSize) / 14), far - 0.35);\r
  const nearness = (x: number, y: number) => inverse[6] * x + inverse[7] * y + inverse[8] - 1 / far;\r
  const corners = [\r
    [0, 0],\r
    [width, 0],\r
    [width, height],\r
    [0, height]\r
  ];\r
  let x0 = Infinity;\r
  let y0 = Infinity;\r
  let x1 = -Infinity;\r
  let y1 = -Infinity;\r
  const include = (x: number, y: number) => {\r
    const [px, py] = project(inverse, x, y);\r
    x0 = Math.min(x0, px);\r
    y0 = Math.min(y0, py);\r
    x1 = Math.max(x1, px);\r
    y1 = Math.max(y1, py);\r
  };\r
  corners.forEach((a, k) => {\r
    const b = corners[(k + 1) % 4];\r
    const na = nearness(a[0], a[1]);\r
    const nb = nearness(b[0], b[1]);\r
    if (na >= 0) include(a[0], a[1]);\r
    if (na >= 0 !== nb >= 0) {\r
      const t = na / (na - nb);\r
      include(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);\r
    }\r
  });\r
  if (!(x1 > x0 && y1 > y0)) return flatView(width, height);\r
  x0 = Math.floor(x0 / 16) * 16;\r
  y0 = Math.floor(y0 / 16) * 16;\r
  x1 = Math.ceil(x1 / 16) * 16;\r
  y1 = Math.ceil(y1 / 16) * 16;\r
  const m = multiply(forward, [1, 0, x0, 0, 1, y0, 0, 0, 1]);\r
  const transform = \`matrix3d(\${[m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, m[8]].join(', ')})\`;\r
  const gx = forward[6];\r
  const gy = forward[7];\r
  const slope = Math.hypot(gx, gy);\r
  const mist =\r
    slope > 1e-9\r
      ? [\r
          cx + (gx / slope) * ((near - 1) / slope),\r
          cy + (gy / slope) * ((near - 1) / slope),\r
          cx + (gx / slope) * ((far - 1) / slope),\r
          cy + (gy / slope) * ((far - 1) / slope)\r
        ]\r
      : null;\r
  const reach = Math.max(\r
    Math.hypot(x0 - cx, y0 - cy),\r
    Math.hypot(x1 - cx, y0 - cy),\r
    Math.hypot(x1 - cx, y1 - cy),\r
    Math.hypot(x0 - cx, y1 - cy)\r
  );\r
  return { x0, y0, width: x1 - x0, height: y1 - y0, inverse, transform, mist, far, reach };\r
};\r
\r
const layoutFor = (shape: string, size: number): Layout => {\r
  if (shape === 'hexagon') {\r
    const radius = size / SQRT3;\r
    return { stepX: radius * 1.5, stepY: size, radius };\r
  }\r
  if (shape === 'triangle') {\r
    const side = (size * 2) / SQRT3;\r
    return { stepX: side / 2, stepY: size, side };\r
  }\r
  return { stepX: size, stepY: size };\r
};\r
\r
const centerOf = (shape: string, layout: Layout, i: number, j: number): number[] => {\r
  const { stepX, stepY } = layout;\r
  if (shape === 'hexagon') return [i * stepX, j * stepY + (Math.abs(i) % 2 === 1 ? stepY / 2 : 0)];\r
  if (shape === 'triangle') {\r
    const up = (((i + j) % 2) + 2) % 2 === 0;\r
    return [i * stepX, j * stepY + (up ? stepY * (2 / 3) : stepY / 3)];\r
  }\r
  if (shape === 'cross' || shape === 'dot') return [i * stepX, j * stepY];\r
  return [(i + 0.5) * stepX, (j + 0.5) * stepY];\r
};\r
\r
const traceCell = (\r
  ctx: CanvasRenderingContext2D,\r
  shape: string,\r
  layout: Layout,\r
  size: number,\r
  i: number,\r
  j: number,\r
  x: number,\r
  y: number,\r
  inset: number\r
) => {\r
  if (shape === 'hexagon') {\r
    const r = (layout.radius ?? 0) - inset;\r
    for (let k = 0; k < 6; k++) {\r
      const angle = (Math.PI / 3) * k;\r
      const px = x + r * Math.cos(angle);\r
      const py = y + r * Math.sin(angle);\r
      if (k === 0) ctx.moveTo(px, py);\r
      else ctx.lineTo(px, py);\r
    }\r
    ctx.closePath();\r
  } else if (shape === 'triangle') {\r
    const up = (((i + j) % 2) + 2) % 2 === 0;\r
    const half = (layout.side ?? 0) / 2 - inset * 1.7;\r
    const height = size - inset * 2.6;\r
    const top = up ? y - height * (2 / 3) : y + height * (2 / 3);\r
    const base = up ? y + height / 3 : y - height / 3;\r
    ctx.moveTo(x, top);\r
    ctx.lineTo(x + half, base);\r
    ctx.lineTo(x - half, base);\r
    ctx.closePath();\r
  } else if (shape === 'diamond') {\r
    const r = size / 2 - inset;\r
    ctx.moveTo(x, y - r);\r
    ctx.lineTo(x + r, y);\r
    ctx.lineTo(x, y + r);\r
    ctx.lineTo(x - r, y);\r
    ctx.closePath();\r
  } else if (shape === 'circle') {\r
    ctx.moveTo(x + size / 2 - inset, y);\r
    ctx.arc(x, y, Math.max(0.5, size / 2 - inset), 0, Math.PI * 2);\r
  } else if (shape === 'tile') {\r
    const half = size / 2 - Math.max(inset, size * 0.06);\r
    const r = Math.min(half, size * 0.22);\r
    ctx.roundRect(x - half, y - half, half * 2, half * 2, r);\r
  } else if (shape === 'cross') {\r
    const arm = size * 0.16 + inset;\r
    ctx.moveTo(x - arm, y);\r
    ctx.lineTo(x + arm, y);\r
    ctx.moveTo(x, y - arm);\r
    ctx.lineTo(x, y + arm);\r
  } else if (shape === 'dot') {\r
    const r = size * 0.05 + inset;\r
    ctx.moveTo(x + r, y);\r
    ctx.arc(x, y, r, 0, Math.PI * 2);\r
  } else {\r
    const half = size / 2 - inset;\r
    ctx.rect(x - half, y - half, half * 2, half * 2);\r
  }\r
};\r
\r
export default function ShapeGrid({\r
  shape = 'square',\r
  cellSize = 40,\r
  lineWidth = 1,\r
  direction = 'diagonal',\r
  speed = 0.5,\r
  lineColor = '#2a2734',\r
  hoverColor = '#ffffff',\r
  hoverFillColor,\r
  fillOpacity = 0.15,\r
  rainbow = false,\r
  tiltX = 0,\r
  tiltY = 0,\r
  radius = 1.5,\r
  trail = 0.6,\r
  glow = 0.35,\r
  twinkle = 0,\r
  fade = 1,\r
  clickCascade = true,\r
  intro = true,\r
  opacity = 1,\r
  backgroundColor = 'transparent',\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: ShapeGridProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<Engine | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
\r
  settingsRef.current = {\r
    shape: SHAPES.includes(shape) ? shape : 'square',\r
    cellSize: Math.max(8, cellSize),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    direction: DIRECTIONS[direction] ? direction : 'diagonal',\r
    speed: Math.max(0, speed),\r
    lineColor,\r
    hoverColor,\r
    hoverFillColor: hoverFillColor ?? hoverColor,\r
    fillOpacity: clamp(fillOpacity, 0, 1),\r
    rainbow,\r
    tone: clamp(lightnessOf(hoverColor), 0.45, 0.68),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    radius: Math.max(0, radius),\r
    trail: Math.max(0.05, trail),\r
    glow: clamp(glow, 0, 1),\r
    twinkle: clamp(twinkle, 0, 1),\r
    clickCascade,\r
    intro,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const ctx = canvas.getContext('2d');\r
    if (!ctx) return undefined;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      view: flatView(1, 1),\r
      offsetX: 0,\r
      offsetY: 0,\r
      started: false,\r
      startedAt: 0,\r
      inside: false,\r
      pointerX: 0,\r
      pointerY: 0,\r
      spotX: 0,\r
      spotY: 0,\r
      spotVX: 0,\r
      spotVY: 0,\r
      spotPower: 0,\r
      lit: new Map<number, number>(),\r
      hues: new Map<number, number>(),\r
      cascades: [] as Cascade[],\r
      cascadeHue: 0\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const view = viewFor(s.tiltX, s.tiltY, width, height, s.cellSize);\r
      let ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const pixels = view.width * view.height * ratio * ratio;\r
      if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels);\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      state.view = view;\r
      const pixelWidth = Math.max(1, Math.round(view.width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(view.height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      const cssWidth = \`\${view.width}px\`;\r
      const cssHeight = \`\${view.height}px\`;\r
      if (canvas.style.width !== cssWidth) canvas.style.width = cssWidth;\r
      if (canvas.style.height !== cssHeight) canvas.style.height = cssHeight;\r
      if (canvas.style.transform !== view.transform) canvas.style.transform = view.transform;\r
    };\r
\r
    const toPlane = (x: number, y: number): number[] | null => {\r
      const { inverse, far } = state.view;\r
      if (!inverse) return [x, y];\r
      if (inverse[6] * x + inverse[7] * y + inverse[8] < 1 / far) return null;\r
      return project(inverse, x, y);\r
    };\r
\r
    const range = (layout: Layout, margin: number) => {\r
      const { stepX, stepY } = layout;\r
      const { view } = state;\r
      return [\r
        Math.floor((state.offsetX + view.x0 - margin) / stepX) - 1,\r
        Math.ceil((state.offsetX + view.x0 + view.width + margin) / stepX) + 1,\r
        Math.floor((state.offsetY + view.y0 - margin) / stepY) - 1,\r
        Math.ceil((state.offsetY + view.y0 + view.height + margin) / stepY) + 1\r
      ];\r
    };\r
\r
    const nearestCell = (s: Settings, layout: Layout, wx: number, wy: number) => {\r
      const { stepX, stepY } = layout;\r
      const ci = Math.round(wx / stepX);\r
      const cj = Math.round(wy / stepY);\r
      let best = Infinity;\r
      let cell = [ci, cj];\r
      for (let i = ci - 2; i <= ci + 2; i++) {\r
        for (let j = cj - 2; j <= cj + 2; j++) {\r
          const [x, y] = centerOf(s.shape, layout, i, j);\r
          const d = (x - wx) ** 2 + (y - wy) ** 2;\r
          if (d < best) {\r
            best = d;\r
            cell = [i, j];\r
          }\r
        }\r
      }\r
      return cell;\r
    };\r
\r
    const illuminate = (s: Settings, layout: Layout, dt: number) => {\r
      const decay = Math.exp(-dt / s.trail);\r
      for (const [key, value] of state.lit) {\r
        const next = value * decay;\r
        if (next < 0.004) {\r
          state.lit.delete(key);\r
          state.hues.delete(key);\r
        } else state.lit.set(key, next);\r
      }\r
      if (state.spotPower < 0.01) return;\r
      const wx = state.spotX + state.offsetX;\r
      const wy = state.spotY + state.offsetY;\r
      const reach = Math.max(s.radius, 0.5) * s.cellSize;\r
      const [hi, hj] = nearestCell(s, layout, wx, wy);\r
      const spanI = Math.ceil(reach / layout.stepX) + 2;\r
      const spanJ = Math.ceil(reach / layout.stepY) + 2;\r
      const hue = state.time * 120;\r
      for (let i = hi - spanI; i <= hi + spanI; i++) {\r
        for (let j = hj - spanJ; j <= hj + spanJ; j++) {\r
          const [x, y] = centerOf(s.shape, layout, i, j);\r
          const distance = Math.hypot(x - wx, y - wy);\r
          let value = s.radius > 0 ? smoothstep(reach, reach * 0.15, distance) : 0;\r
          if (i === hi && j === hj) value = Math.max(value, 1);\r
          value *= state.spotPower;\r
          if (value <= 0.004) continue;\r
          const key = keyOf(i, j);\r
          if (value > (state.lit.get(key) ?? 0)) {\r
            state.lit.set(key, value);\r
            state.hues.set(key, hue + ((x + y) / s.cellSize) * 12);\r
          }\r
        }\r
      }\r
    };\r
\r
    const cascadeAt = (s: Settings, x: number, y: number) => {\r
      let value = 0;\r
      for (const cascade of state.cascades) {\r
        const ring = Math.round(Math.hypot(x - cascade.x, y - cascade.y) / s.cellSize);\r
        const local = state.time - cascade.time - ring * 0.055;\r
        if (local < 0) continue;\r
        const pulse = Math.exp(-((local / 0.085) ** 2)) * cascade.power * Math.max(0, 1 - ring / cascade.reach);\r
        if (pulse > value) {\r
          value = pulse;\r
          state.cascadeHue = cascade.hue + ring * 16;\r
        }\r
      }\r
      return value;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { view, ratio } = state;\r
      const layout = layoutFor(s.shape, s.cellSize);\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.globalCompositeOperation = 'source-over';\r
      ctx.globalAlpha = 1;\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      ctx.setTransform(ratio, 0, 0, ratio, -view.x0 * ratio, -view.y0 * ratio);\r
\r
      const left = view.x0;\r
      const top = view.y0;\r
      const right = view.x0 + view.width;\r
      const bottom = view.y0 + view.height;\r
      const size = s.cellSize;\r
      const [i0, i1, j0, j1] = range(layout, size);\r
      const markers = s.shape === 'cross' || s.shape === 'dot';\r
      const elapsed = state.time - state.startedAt;\r
      const introRadius = s.intro && !reduce ? elapsed * view.reach * 1.8 : Infinity;\r
      const originX = state.width / 2;\r
      const originY = state.height / 2;\r
      const centerX = originX + state.offsetX;\r
      const centerY = originY + state.offsetY;\r
\r
      ctx.lineWidth = s.lineWidth;\r
      ctx.lineJoin = 'round';\r
      ctx.lineCap = 'round';\r
      ctx.strokeStyle = s.lineColor;\r
      ctx.fillStyle = s.lineColor;\r
      ctx.beginPath();\r
      if (s.shape === 'square') {\r
        for (let i = i0; i <= i1; i++) {\r
          const x = i * layout.stepX - state.offsetX;\r
          ctx.moveTo(x, top - size);\r
          ctx.lineTo(x, bottom + size);\r
        }\r
        for (let j = j0; j <= j1; j++) {\r
          const y = j * layout.stepY - state.offsetY;\r
          ctx.moveTo(left - size, y);\r
          ctx.lineTo(right + size, y);\r
        }\r
      } else {\r
        for (let i = i0; i <= i1; i++) {\r
          for (let j = j0; j <= j1; j++) {\r
            const [cx, cy] = centerOf(s.shape, layout, i, j);\r
            traceCell(ctx, s.shape, layout, size, i, j, cx - state.offsetX, cy - state.offsetY, 0);\r
          }\r
        }\r
      }\r
      if (s.shape === 'dot') ctx.fill();\r
      else ctx.stroke();\r
\r
      if (introRadius !== Infinity) {\r
        const gradient = ctx.createRadialGradient(originX, originY, 0, originX, originY, Math.max(1, introRadius));\r
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');\r
        gradient.addColorStop(0.82, 'rgba(0, 0, 0, 1)');\r
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');\r
        ctx.globalCompositeOperation = 'destination-in';\r
        ctx.fillStyle = gradient;\r
        ctx.fillRect(left, top, view.width, view.height);\r
        ctx.globalCompositeOperation = 'source-over';\r
      }\r
\r
      const glowing = s.glow > 0;\r
      for (let i = i0; i <= i1; i++) {\r
        for (let j = j0; j <= j1; j++) {\r
          const [cx, cy] = centerOf(s.shape, layout, i, j);\r
          const key = keyOf(i, j);\r
          let value = state.lit.get(key) ?? 0;\r
          let hue = state.hues.get(key) ?? 0;\r
          if (state.cascades.length) {\r
            const pulse = cascadeAt(s, cx, cy);\r
            if (pulse > value) {\r
              value = pulse;\r
              hue = state.cascadeHue;\r
            }\r
          }\r
          if (s.twinkle > 0 && !reduce) {\r
            const seed = hash(i, j);\r
            const wave = Math.sin(state.time * (0.35 + seed * 0.5) + seed * 40);\r
            const sparkle = s.twinkle * 0.7 * Math.max(0, wave) ** 18;\r
            if (sparkle > value) {\r
              value = sparkle;\r
              hue = seed * 360;\r
            }\r
          }\r
          if (introRadius !== Infinity) {\r
            const front = introRadius - Math.hypot(cx - centerX, cy - centerY);\r
            if (front < 0) continue;\r
            const wave = Math.exp(-((front / (size * 1.4)) ** 2)) * 0.85;\r
            if (wave > value) {\r
              value = wave;\r
              hue = (Math.atan2(cy - centerY, cx - centerX) * 180) / Math.PI + state.time * 120;\r
            }\r
          }\r
          if (value <= 0.01) continue;\r
          const color = s.rainbow ? tint(hue, s.tone) : s.hoverColor;\r
          const x = cx - state.offsetX;\r
          const y = cy - state.offsetY;\r
          ctx.beginPath();\r
          traceCell(ctx, s.shape, layout, size, i, j, x, y, markers ? value * size * 0.08 : s.lineWidth * 0.5);\r
          if (markers) {\r
            ctx.globalAlpha = Math.min(1, value);\r
            if (glowing) {\r
              ctx.shadowColor = color;\r
              ctx.shadowBlur = s.glow * 14 * value;\r
            }\r
            if (s.shape === 'dot') {\r
              ctx.fillStyle = color;\r
              ctx.fill();\r
            } else {\r
              ctx.strokeStyle = color;\r
              ctx.lineWidth = s.lineWidth * (1 + value * 0.6);\r
              ctx.stroke();\r
            }\r
            ctx.shadowBlur = 0;\r
            continue;\r
          }\r
          if (s.fillOpacity > 0) {\r
            ctx.globalAlpha = Math.min(1, value) * s.fillOpacity;\r
            ctx.fillStyle = s.rainbow ? color : s.hoverFillColor;\r
            ctx.fill();\r
          }\r
          ctx.globalAlpha = Math.min(1, value) * 0.85;\r
          if (glowing) {\r
            ctx.shadowColor = color;\r
            ctx.shadowBlur = s.glow * 16 * value;\r
          }\r
          ctx.strokeStyle = color;\r
          ctx.lineWidth = s.lineWidth;\r
          ctx.stroke();\r
          ctx.shadowBlur = 0;\r
        }\r
      }\r
      ctx.globalAlpha = 1;\r
\r
      if (view.mist) {\r
        const [mx0, my0, mx1, my1] = view.mist;\r
        const gradient = ctx.createLinearGradient(mx0, my0, mx1, my1);\r
        for (let k = 0; k <= 8; k++) {\r
          const t = k / 8;\r
          gradient.addColorStop(t, \`rgba(0, 0, 0, \${(1 - smootherstep(t)).toFixed(3)})\`);\r
        }\r
        ctx.globalCompositeOperation = 'destination-in';\r
        ctx.fillStyle = gradient;\r
        ctx.fillRect(left, top, view.width, view.height);\r
        ctx.globalCompositeOperation = 'source-over';\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      resize();\r
      if (!state.started) {\r
        state.started = true;\r
        state.startedAt = state.time;\r
      }\r
      if (!s.paused) {\r
        state.time += dt;\r
        if (!reduce) {\r
          const [dx, dy] = DIRECTIONS[s.direction];\r
          state.offsetX -= dx * s.speed * 60 * dt;\r
          state.offsetY -= dy * s.speed * 60 * dt;\r
        }\r
        const want = state.inside ? 1 : 0;\r
        state.spotPower += (want - state.spotPower) * (1 - Math.exp(-(want ? 10 : 5) * dt));\r
        const stiffness = 220;\r
        const damping = 2 * Math.sqrt(stiffness) * 0.85;\r
        state.spotVX += (stiffness * (state.pointerX - state.spotX) - damping * state.spotVX) * dt;\r
        state.spotVY += (stiffness * (state.pointerY - state.spotY) - damping * state.spotVY) * dt;\r
        state.spotX += state.spotVX * dt;\r
        state.spotY += state.spotVY * dt;\r
        illuminate(s, layoutFor(s.shape, s.cellSize), dt);\r
        state.cascades = state.cascades.filter(cascade => state.time - cascade.time < cascade.reach * 0.055 + 0.4);\r
      }\r
      draw();\r
      const settled =\r
        s.paused ||\r
        (s.speed === 0 || s.direction === 'none' || reduce\r
          ? state.lit.size === 0 &&\r
            state.cascades.length === 0 &&\r
            s.twinkle === 0 &&\r
            state.spotPower < 0.005 &&\r
            state.time - state.startedAt > 3\r
          : false);\r
      if (!settled && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const pointFrom = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;\r
      return toPlane(x, y);\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const point = pointFrom(event);\r
      if (point && !state.inside && state.spotPower < 0.02) {\r
        state.spotX = point[0];\r
        state.spotY = point[1];\r
        state.spotVX = 0;\r
        state.spotVY = 0;\r
      }\r
      state.inside = point !== null;\r
      if (point) {\r
        state.pointerX = point[0];\r
        state.pointerY = point[1];\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickCascade) return;\r
      const point = pointFrom(event);\r
      if (!point) return;\r
      state.cascades.push({\r
        x: point[0] + state.offsetX,\r
        y: point[1] + state.offsetY,\r
        time: state.time,\r
        power: 1,\r
        reach: Math.hypot(state.view.width, state.view.height) / s.cellSize,\r
        hue: state.time * 120\r
      });\r
      if (state.cascades.length > 6) state.cascades.shift();\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    engineRef.current = {\r
      redraw: () => {\r
        resize();\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  const mask = fadeMask(clamp(fade, 0, 1));\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`shape-grid \${className}\`.trim()}\r
      style={{\r
        opacity: clamp(opacity, 0, 1),\r
        backgroundColor,\r
        ...(mask === 'none'\r
          ? null\r
          : { maskImage: mask, WebkitMaskImage: mask, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }),\r
        ...style\r
      }}\r
    >\r
      <canvas ref={canvasRef} className="shape-grid-canvas" />\r
    </div>\r
  );\r
}\r
`,s=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
export interface ShapeGridProps {\r
  shape?: 'square' | 'tile' | 'hexagon' | 'triangle' | 'diamond' | 'circle' | 'cross' | 'dot';\r
  cellSize?: number;\r
  lineWidth?: number;\r
  direction?: 'diagonal' | 'up' | 'down' | 'left' | 'right' | 'none';\r
  speed?: number;\r
  lineColor?: string;\r
  hoverColor?: string;\r
  hoverFillColor?: string;\r
  fillOpacity?: number;\r
  rainbow?: boolean;\r
  tiltX?: number;\r
  tiltY?: number;\r
  radius?: number;\r
  trail?: number;\r
  glow?: number;\r
  twinkle?: number;\r
  fade?: number;\r
  clickCascade?: boolean;\r
  intro?: boolean;\r
  opacity?: number;\r
  backgroundColor?: string;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Layout {\r
  stepX: number;\r
  stepY: number;\r
  radius?: number;\r
  side?: number;\r
}\r
\r
interface View {\r
  x0: number;\r
  y0: number;\r
  width: number;\r
  height: number;\r
  inverse: number[] | null;\r
  transform: string;\r
  mist: number[] | null;\r
  far: number;\r
  reach: number;\r
}\r
\r
interface Settings {\r
  shape: string;\r
  cellSize: number;\r
  lineWidth: number;\r
  direction: string;\r
  speed: number;\r
  lineColor: string;\r
  hoverColor: string;\r
  hoverFillColor: string;\r
  fillOpacity: number;\r
  rainbow: boolean;\r
  tone: number;\r
  tiltX: number;\r
  tiltY: number;\r
  radius: number;\r
  trail: number;\r
  glow: number;\r
  twinkle: number;\r
  clickCascade: boolean;\r
  intro: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
}\r
\r
interface Cascade {\r
  x: number;\r
  y: number;\r
  time: number;\r
  power: number;\r
  reach: number;\r
  hue: number;\r
}\r
\r
interface Engine {\r
  redraw: () => void;\r
}\r
\r
const SHAPES = ['square', 'tile', 'hexagon', 'triangle', 'diamond', 'circle', 'cross', 'dot'];\r
const DIRECTIONS: Record<string, number[]> = {\r
  right: [1, 0],\r
  left: [-1, 0],\r
  up: [0, -1],\r
  down: [0, 1],\r
  diagonal: [Math.SQRT1_2, -Math.SQRT1_2],\r
  none: [0, 0]\r
};\r
const SQRT3 = Math.sqrt(3);\r
const OFFSET = 32768;\r
const FAR = 2.5;\r
const MAX_PIXELS = 8e6;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);\r
\r
const smoothstep = (edge0: number, edge1: number, value: number) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const hash = (i: number, j: number) => {\r
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;\r
  return s - Math.floor(s);\r
};\r
\r
const keyOf = (i: number, j: number) => (i + OFFSET) * 65536 + (j + OFFSET);\r
\r
const fadeMask = (amount: number) => {\r
  if (amount <= 0) return 'none';\r
  const edge = amount * 26;\r
  const stops: string[] = [];\r
  for (let k = 0; k <= 8; k++) {\r
    const t = k / 8;\r
    stops.push(\`rgba(0, 0, 0, \${smootherstep(t).toFixed(3)}) \${(t * edge).toFixed(2)}%\`);\r
  }\r
  const inner = stops.join(', ');\r
  const outer = [...stops]\r
    .reverse()\r
    .map(stop => stop.replace(/ ([\\d.]+)%$/, (_: string, value: string) => \` \${(100 - parseFloat(value)).toFixed(2)}%\`))\r
    .join(', ');\r
  const axis = (direction: string) => \`linear-gradient(\${direction}, \${inner}, \${outer})\`;\r
  return \`\${axis('to right')}, \${axis('to bottom')}\`;\r
};\r
\r
const lightnessOf = (color: string) => {\r
  let hex = String(color).trim().replace(/^#/, '');\r
  if (hex.length === 3 || hex.length === 4) hex = hex.replace(/./g, '$&$&');\r
  hex = hex.slice(0, 6);\r
  if (!/^[0-9a-f]{6}$/i.test(hex)) return 0.6;\r
  const value = parseInt(hex, 16);\r
  const channels = [value >> 16, (value >> 8) & 255, value & 255];\r
  return (Math.max(...channels) + Math.min(...channels)) / 510;\r
};\r
\r
const tint = (hue: number, lightness: number) =>\r
  \`hsl(\${(((hue % 360) + 360) % 360).toFixed(1)}, 90%, \${(lightness * 100).toFixed(1)}%)\`;\r
\r
const multiply = (a: number[], b: number[]) =>\r
  [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => {\r
    const r = k - (k % 3);\r
    const c = k % 3;\r
    return a[r] * b[c] + a[r + 1] * b[c + 3] + a[r + 2] * b[c + 6];\r
  });\r
\r
const invert = (m: number[]) => {\r
  const [a, b, c, d, e, f, g, h, i] = m;\r
  const A = e * i - f * h;\r
  const B = f * g - d * i;\r
  const C = d * h - e * g;\r
  const det = a * A + b * B + c * C;\r
  return [A, c * h - b * i, b * f - c * e, B, a * i - c * g, c * d - a * f, C, b * g - a * h, a * e - b * d].map(\r
    value => value / det\r
  );\r
};\r
\r
const project = (m: number[], x: number, y: number) => {\r
  const w = m[6] * x + m[7] * y + m[8];\r
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];\r
};\r
\r
const flatView = (width: number, height: number): View => ({\r
  x0: 0,\r
  y0: 0,\r
  width,\r
  height,\r
  inverse: null,\r
  transform: 'none',\r
  mist: null,\r
  far: FAR,\r
  reach: Math.hypot(width, height) / 2\r
});\r
\r
const viewFor = (tiltX: number, tiltY: number, width: number, height: number, cellSize: number): View => {\r
  if (!tiltX && !tiltY) return flatView(width, height);\r
  const ax = (tiltX * Math.PI) / 180;\r
  const ay = (tiltY * Math.PI) / 180;\r
  const depth = Math.max(width, height) * 1.25;\r
  const cx = width / 2;\r
  const cy = height / 2;\r
  const tilt = [\r
    Math.cos(ay),\r
    0,\r
    0,\r
    Math.sin(ax) * Math.sin(ay),\r
    Math.cos(ax),\r
    0,\r
    (Math.sin(ay) * Math.cos(ax)) / depth,\r
    -Math.sin(ax) / depth,\r
    1\r
  ];\r
  const forward = multiply(multiply([1, 0, cx, 0, 1, cy, 0, 0, 1], tilt), [1, 0, -cx, 0, 1, -cy, 0, 0, 1]);\r
  const inverse = invert(forward);\r
  const facing = Math.cos(ax) * Math.cos(ay);\r
  const far = clamp(Math.sqrt((facing * cellSize) / 5), 1.15, FAR);\r
  const near = Math.min(Math.sqrt((facing * cellSize) / 14), far - 0.35);\r
  const nearness = (x: number, y: number) => inverse[6] * x + inverse[7] * y + inverse[8] - 1 / far;\r
  const corners = [\r
    [0, 0],\r
    [width, 0],\r
    [width, height],\r
    [0, height]\r
  ];\r
  let x0 = Infinity;\r
  let y0 = Infinity;\r
  let x1 = -Infinity;\r
  let y1 = -Infinity;\r
  const include = (x: number, y: number) => {\r
    const [px, py] = project(inverse, x, y);\r
    x0 = Math.min(x0, px);\r
    y0 = Math.min(y0, py);\r
    x1 = Math.max(x1, px);\r
    y1 = Math.max(y1, py);\r
  };\r
  corners.forEach((a, k) => {\r
    const b = corners[(k + 1) % 4];\r
    const na = nearness(a[0], a[1]);\r
    const nb = nearness(b[0], b[1]);\r
    if (na >= 0) include(a[0], a[1]);\r
    if (na >= 0 !== nb >= 0) {\r
      const t = na / (na - nb);\r
      include(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);\r
    }\r
  });\r
  if (!(x1 > x0 && y1 > y0)) return flatView(width, height);\r
  x0 = Math.floor(x0 / 16) * 16;\r
  y0 = Math.floor(y0 / 16) * 16;\r
  x1 = Math.ceil(x1 / 16) * 16;\r
  y1 = Math.ceil(y1 / 16) * 16;\r
  const m = multiply(forward, [1, 0, x0, 0, 1, y0, 0, 0, 1]);\r
  const transform = \`matrix3d(\${[m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, m[8]].join(', ')})\`;\r
  const gx = forward[6];\r
  const gy = forward[7];\r
  const slope = Math.hypot(gx, gy);\r
  const mist =\r
    slope > 1e-9\r
      ? [\r
          cx + (gx / slope) * ((near - 1) / slope),\r
          cy + (gy / slope) * ((near - 1) / slope),\r
          cx + (gx / slope) * ((far - 1) / slope),\r
          cy + (gy / slope) * ((far - 1) / slope)\r
        ]\r
      : null;\r
  const reach = Math.max(\r
    Math.hypot(x0 - cx, y0 - cy),\r
    Math.hypot(x1 - cx, y0 - cy),\r
    Math.hypot(x1 - cx, y1 - cy),\r
    Math.hypot(x0 - cx, y1 - cy)\r
  );\r
  return { x0, y0, width: x1 - x0, height: y1 - y0, inverse, transform, mist, far, reach };\r
};\r
\r
const layoutFor = (shape: string, size: number): Layout => {\r
  if (shape === 'hexagon') {\r
    const radius = size / SQRT3;\r
    return { stepX: radius * 1.5, stepY: size, radius };\r
  }\r
  if (shape === 'triangle') {\r
    const side = (size * 2) / SQRT3;\r
    return { stepX: side / 2, stepY: size, side };\r
  }\r
  return { stepX: size, stepY: size };\r
};\r
\r
const centerOf = (shape: string, layout: Layout, i: number, j: number): number[] => {\r
  const { stepX, stepY } = layout;\r
  if (shape === 'hexagon') return [i * stepX, j * stepY + (Math.abs(i) % 2 === 1 ? stepY / 2 : 0)];\r
  if (shape === 'triangle') {\r
    const up = (((i + j) % 2) + 2) % 2 === 0;\r
    return [i * stepX, j * stepY + (up ? stepY * (2 / 3) : stepY / 3)];\r
  }\r
  if (shape === 'cross' || shape === 'dot') return [i * stepX, j * stepY];\r
  return [(i + 0.5) * stepX, (j + 0.5) * stepY];\r
};\r
\r
const traceCell = (\r
  ctx: CanvasRenderingContext2D,\r
  shape: string,\r
  layout: Layout,\r
  size: number,\r
  i: number,\r
  j: number,\r
  x: number,\r
  y: number,\r
  inset: number\r
) => {\r
  if (shape === 'hexagon') {\r
    const r = (layout.radius ?? 0) - inset;\r
    for (let k = 0; k < 6; k++) {\r
      const angle = (Math.PI / 3) * k;\r
      const px = x + r * Math.cos(angle);\r
      const py = y + r * Math.sin(angle);\r
      if (k === 0) ctx.moveTo(px, py);\r
      else ctx.lineTo(px, py);\r
    }\r
    ctx.closePath();\r
  } else if (shape === 'triangle') {\r
    const up = (((i + j) % 2) + 2) % 2 === 0;\r
    const half = (layout.side ?? 0) / 2 - inset * 1.7;\r
    const height = size - inset * 2.6;\r
    const top = up ? y - height * (2 / 3) : y + height * (2 / 3);\r
    const base = up ? y + height / 3 : y - height / 3;\r
    ctx.moveTo(x, top);\r
    ctx.lineTo(x + half, base);\r
    ctx.lineTo(x - half, base);\r
    ctx.closePath();\r
  } else if (shape === 'diamond') {\r
    const r = size / 2 - inset;\r
    ctx.moveTo(x, y - r);\r
    ctx.lineTo(x + r, y);\r
    ctx.lineTo(x, y + r);\r
    ctx.lineTo(x - r, y);\r
    ctx.closePath();\r
  } else if (shape === 'circle') {\r
    ctx.moveTo(x + size / 2 - inset, y);\r
    ctx.arc(x, y, Math.max(0.5, size / 2 - inset), 0, Math.PI * 2);\r
  } else if (shape === 'tile') {\r
    const half = size / 2 - Math.max(inset, size * 0.06);\r
    const r = Math.min(half, size * 0.22);\r
    ctx.roundRect(x - half, y - half, half * 2, half * 2, r);\r
  } else if (shape === 'cross') {\r
    const arm = size * 0.16 + inset;\r
    ctx.moveTo(x - arm, y);\r
    ctx.lineTo(x + arm, y);\r
    ctx.moveTo(x, y - arm);\r
    ctx.lineTo(x, y + arm);\r
  } else if (shape === 'dot') {\r
    const r = size * 0.05 + inset;\r
    ctx.moveTo(x + r, y);\r
    ctx.arc(x, y, r, 0, Math.PI * 2);\r
  } else {\r
    const half = size / 2 - inset;\r
    ctx.rect(x - half, y - half, half * 2, half * 2);\r
  }\r
};\r
\r
export default function ShapeGrid({\r
  shape = 'square',\r
  cellSize = 40,\r
  lineWidth = 1,\r
  direction = 'diagonal',\r
  speed = 0.5,\r
  lineColor = '#2a2734',\r
  hoverColor = '#ffffff',\r
  hoverFillColor,\r
  fillOpacity = 0.15,\r
  rainbow = false,\r
  tiltX = 0,\r
  tiltY = 0,\r
  radius = 1.5,\r
  trail = 0.6,\r
  glow = 0.35,\r
  twinkle = 0,\r
  fade = 1,\r
  clickCascade = true,\r
  intro = true,\r
  opacity = 1,\r
  backgroundColor = 'transparent',\r
  paused = false,\r
  dpr,\r
  className = '',\r
  style\r
}: ShapeGridProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const engineRef = useRef<Engine | null>(null);\r
  const settingsRef = useRef<Settings>(null as unknown as Settings);\r
\r
  settingsRef.current = {\r
    shape: SHAPES.includes(shape) ? shape : 'square',\r
    cellSize: Math.max(8, cellSize),\r
    lineWidth: Math.max(0.25, lineWidth),\r
    direction: DIRECTIONS[direction] ? direction : 'diagonal',\r
    speed: Math.max(0, speed),\r
    lineColor,\r
    hoverColor,\r
    hoverFillColor: hoverFillColor ?? hoverColor,\r
    fillOpacity: clamp(fillOpacity, 0, 1),\r
    rainbow,\r
    tone: clamp(lightnessOf(hoverColor), 0.45, 0.68),\r
    tiltX: clamp(tiltX, -70, 70),\r
    tiltY: clamp(tiltY, -70, 70),\r
    radius: Math.max(0, radius),\r
    trail: Math.max(0.05, trail),\r
    glow: clamp(glow, 0, 1),\r
    twinkle: clamp(twinkle, 0, 1),\r
    clickCascade,\r
    intro,\r
    paused,\r
    dpr\r
  };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    if (!container || !canvas) return undefined;\r
    const ctx = canvas.getContext('2d');\r
    if (!ctx) return undefined;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const state = {\r
      alive: true,\r
      raf: 0,\r
      last: 0,\r
      time: 0,\r
      visible: true,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      view: flatView(1, 1),\r
      offsetX: 0,\r
      offsetY: 0,\r
      started: false,\r
      startedAt: 0,\r
      inside: false,\r
      pointerX: 0,\r
      pointerY: 0,\r
      spotX: 0,\r
      spotY: 0,\r
      spotVX: 0,\r
      spotVY: 0,\r
      spotPower: 0,\r
      lit: new Map<number, number>(),\r
      hues: new Map<number, number>(),\r
      cascades: [] as Cascade[],\r
      cascadeHue: 0\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const view = viewFor(s.tiltX, s.tiltY, width, height, s.cellSize);\r
      let ratio = s.dpr ?? Math.min(window.devicePixelRatio || 1, 2);\r
      const pixels = view.width * view.height * ratio * ratio;\r
      if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels);\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = ratio;\r
      state.view = view;\r
      const pixelWidth = Math.max(1, Math.round(view.width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(view.height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      const cssWidth = \`\${view.width}px\`;\r
      const cssHeight = \`\${view.height}px\`;\r
      if (canvas.style.width !== cssWidth) canvas.style.width = cssWidth;\r
      if (canvas.style.height !== cssHeight) canvas.style.height = cssHeight;\r
      if (canvas.style.transform !== view.transform) canvas.style.transform = view.transform;\r
    };\r
\r
    const toPlane = (x: number, y: number): number[] | null => {\r
      const { inverse, far } = state.view;\r
      if (!inverse) return [x, y];\r
      if (inverse[6] * x + inverse[7] * y + inverse[8] < 1 / far) return null;\r
      return project(inverse, x, y);\r
    };\r
\r
    const range = (layout: Layout, margin: number) => {\r
      const { stepX, stepY } = layout;\r
      const { view } = state;\r
      return [\r
        Math.floor((state.offsetX + view.x0 - margin) / stepX) - 1,\r
        Math.ceil((state.offsetX + view.x0 + view.width + margin) / stepX) + 1,\r
        Math.floor((state.offsetY + view.y0 - margin) / stepY) - 1,\r
        Math.ceil((state.offsetY + view.y0 + view.height + margin) / stepY) + 1\r
      ];\r
    };\r
\r
    const nearestCell = (s: Settings, layout: Layout, wx: number, wy: number) => {\r
      const { stepX, stepY } = layout;\r
      const ci = Math.round(wx / stepX);\r
      const cj = Math.round(wy / stepY);\r
      let best = Infinity;\r
      let cell = [ci, cj];\r
      for (let i = ci - 2; i <= ci + 2; i++) {\r
        for (let j = cj - 2; j <= cj + 2; j++) {\r
          const [x, y] = centerOf(s.shape, layout, i, j);\r
          const d = (x - wx) ** 2 + (y - wy) ** 2;\r
          if (d < best) {\r
            best = d;\r
            cell = [i, j];\r
          }\r
        }\r
      }\r
      return cell;\r
    };\r
\r
    const illuminate = (s: Settings, layout: Layout, dt: number) => {\r
      const decay = Math.exp(-dt / s.trail);\r
      for (const [key, value] of state.lit) {\r
        const next = value * decay;\r
        if (next < 0.004) {\r
          state.lit.delete(key);\r
          state.hues.delete(key);\r
        } else state.lit.set(key, next);\r
      }\r
      if (state.spotPower < 0.01) return;\r
      const wx = state.spotX + state.offsetX;\r
      const wy = state.spotY + state.offsetY;\r
      const reach = Math.max(s.radius, 0.5) * s.cellSize;\r
      const [hi, hj] = nearestCell(s, layout, wx, wy);\r
      const spanI = Math.ceil(reach / layout.stepX) + 2;\r
      const spanJ = Math.ceil(reach / layout.stepY) + 2;\r
      const hue = state.time * 120;\r
      for (let i = hi - spanI; i <= hi + spanI; i++) {\r
        for (let j = hj - spanJ; j <= hj + spanJ; j++) {\r
          const [x, y] = centerOf(s.shape, layout, i, j);\r
          const distance = Math.hypot(x - wx, y - wy);\r
          let value = s.radius > 0 ? smoothstep(reach, reach * 0.15, distance) : 0;\r
          if (i === hi && j === hj) value = Math.max(value, 1);\r
          value *= state.spotPower;\r
          if (value <= 0.004) continue;\r
          const key = keyOf(i, j);\r
          if (value > (state.lit.get(key) ?? 0)) {\r
            state.lit.set(key, value);\r
            state.hues.set(key, hue + ((x + y) / s.cellSize) * 12);\r
          }\r
        }\r
      }\r
    };\r
\r
    const cascadeAt = (s: Settings, x: number, y: number) => {\r
      let value = 0;\r
      for (const cascade of state.cascades) {\r
        const ring = Math.round(Math.hypot(x - cascade.x, y - cascade.y) / s.cellSize);\r
        const local = state.time - cascade.time - ring * 0.055;\r
        if (local < 0) continue;\r
        const pulse = Math.exp(-((local / 0.085) ** 2)) * cascade.power * Math.max(0, 1 - ring / cascade.reach);\r
        if (pulse > value) {\r
          value = pulse;\r
          state.cascadeHue = cascade.hue + ring * 16;\r
        }\r
      }\r
      return value;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { view, ratio } = state;\r
      const layout = layoutFor(s.shape, s.cellSize);\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.globalCompositeOperation = 'source-over';\r
      ctx.globalAlpha = 1;\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      ctx.setTransform(ratio, 0, 0, ratio, -view.x0 * ratio, -view.y0 * ratio);\r
\r
      const left = view.x0;\r
      const top = view.y0;\r
      const right = view.x0 + view.width;\r
      const bottom = view.y0 + view.height;\r
      const size = s.cellSize;\r
      const [i0, i1, j0, j1] = range(layout, size);\r
      const markers = s.shape === 'cross' || s.shape === 'dot';\r
      const elapsed = state.time - state.startedAt;\r
      const introRadius = s.intro && !reduce ? elapsed * view.reach * 1.8 : Infinity;\r
      const originX = state.width / 2;\r
      const originY = state.height / 2;\r
      const centerX = originX + state.offsetX;\r
      const centerY = originY + state.offsetY;\r
\r
      ctx.lineWidth = s.lineWidth;\r
      ctx.lineJoin = 'round';\r
      ctx.lineCap = 'round';\r
      ctx.strokeStyle = s.lineColor;\r
      ctx.fillStyle = s.lineColor;\r
      ctx.beginPath();\r
      if (s.shape === 'square') {\r
        for (let i = i0; i <= i1; i++) {\r
          const x = i * layout.stepX - state.offsetX;\r
          ctx.moveTo(x, top - size);\r
          ctx.lineTo(x, bottom + size);\r
        }\r
        for (let j = j0; j <= j1; j++) {\r
          const y = j * layout.stepY - state.offsetY;\r
          ctx.moveTo(left - size, y);\r
          ctx.lineTo(right + size, y);\r
        }\r
      } else {\r
        for (let i = i0; i <= i1; i++) {\r
          for (let j = j0; j <= j1; j++) {\r
            const [cx, cy] = centerOf(s.shape, layout, i, j);\r
            traceCell(ctx, s.shape, layout, size, i, j, cx - state.offsetX, cy - state.offsetY, 0);\r
          }\r
        }\r
      }\r
      if (s.shape === 'dot') ctx.fill();\r
      else ctx.stroke();\r
\r
      if (introRadius !== Infinity) {\r
        const gradient = ctx.createRadialGradient(originX, originY, 0, originX, originY, Math.max(1, introRadius));\r
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');\r
        gradient.addColorStop(0.82, 'rgba(0, 0, 0, 1)');\r
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');\r
        ctx.globalCompositeOperation = 'destination-in';\r
        ctx.fillStyle = gradient;\r
        ctx.fillRect(left, top, view.width, view.height);\r
        ctx.globalCompositeOperation = 'source-over';\r
      }\r
\r
      const glowing = s.glow > 0;\r
      for (let i = i0; i <= i1; i++) {\r
        for (let j = j0; j <= j1; j++) {\r
          const [cx, cy] = centerOf(s.shape, layout, i, j);\r
          const key = keyOf(i, j);\r
          let value = state.lit.get(key) ?? 0;\r
          let hue = state.hues.get(key) ?? 0;\r
          if (state.cascades.length) {\r
            const pulse = cascadeAt(s, cx, cy);\r
            if (pulse > value) {\r
              value = pulse;\r
              hue = state.cascadeHue;\r
            }\r
          }\r
          if (s.twinkle > 0 && !reduce) {\r
            const seed = hash(i, j);\r
            const wave = Math.sin(state.time * (0.35 + seed * 0.5) + seed * 40);\r
            const sparkle = s.twinkle * 0.7 * Math.max(0, wave) ** 18;\r
            if (sparkle > value) {\r
              value = sparkle;\r
              hue = seed * 360;\r
            }\r
          }\r
          if (introRadius !== Infinity) {\r
            const front = introRadius - Math.hypot(cx - centerX, cy - centerY);\r
            if (front < 0) continue;\r
            const wave = Math.exp(-((front / (size * 1.4)) ** 2)) * 0.85;\r
            if (wave > value) {\r
              value = wave;\r
              hue = (Math.atan2(cy - centerY, cx - centerX) * 180) / Math.PI + state.time * 120;\r
            }\r
          }\r
          if (value <= 0.01) continue;\r
          const color = s.rainbow ? tint(hue, s.tone) : s.hoverColor;\r
          const x = cx - state.offsetX;\r
          const y = cy - state.offsetY;\r
          ctx.beginPath();\r
          traceCell(ctx, s.shape, layout, size, i, j, x, y, markers ? value * size * 0.08 : s.lineWidth * 0.5);\r
          if (markers) {\r
            ctx.globalAlpha = Math.min(1, value);\r
            if (glowing) {\r
              ctx.shadowColor = color;\r
              ctx.shadowBlur = s.glow * 14 * value;\r
            }\r
            if (s.shape === 'dot') {\r
              ctx.fillStyle = color;\r
              ctx.fill();\r
            } else {\r
              ctx.strokeStyle = color;\r
              ctx.lineWidth = s.lineWidth * (1 + value * 0.6);\r
              ctx.stroke();\r
            }\r
            ctx.shadowBlur = 0;\r
            continue;\r
          }\r
          if (s.fillOpacity > 0) {\r
            ctx.globalAlpha = Math.min(1, value) * s.fillOpacity;\r
            ctx.fillStyle = s.rainbow ? color : s.hoverFillColor;\r
            ctx.fill();\r
          }\r
          ctx.globalAlpha = Math.min(1, value) * 0.85;\r
          if (glowing) {\r
            ctx.shadowColor = color;\r
            ctx.shadowBlur = s.glow * 16 * value;\r
          }\r
          ctx.strokeStyle = color;\r
          ctx.lineWidth = s.lineWidth;\r
          ctx.stroke();\r
          ctx.shadowBlur = 0;\r
        }\r
      }\r
      ctx.globalAlpha = 1;\r
\r
      if (view.mist) {\r
        const [mx0, my0, mx1, my1] = view.mist;\r
        const gradient = ctx.createLinearGradient(mx0, my0, mx1, my1);\r
        for (let k = 0; k <= 8; k++) {\r
          const t = k / 8;\r
          gradient.addColorStop(t, \`rgba(0, 0, 0, \${(1 - smootherstep(t)).toFixed(3)})\`);\r
        }\r
        ctx.globalCompositeOperation = 'destination-in';\r
        ctx.fillStyle = gradient;\r
        ctx.fillRect(left, top, view.width, view.height);\r
        ctx.globalCompositeOperation = 'source-over';\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      state.raf = 0;\r
      if (!state.alive) return;\r
      const s = settingsRef.current;\r
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;\r
      state.last = now;\r
      resize();\r
      if (!state.started) {\r
        state.started = true;\r
        state.startedAt = state.time;\r
      }\r
      if (!s.paused) {\r
        state.time += dt;\r
        if (!reduce) {\r
          const [dx, dy] = DIRECTIONS[s.direction];\r
          state.offsetX -= dx * s.speed * 60 * dt;\r
          state.offsetY -= dy * s.speed * 60 * dt;\r
        }\r
        const want = state.inside ? 1 : 0;\r
        state.spotPower += (want - state.spotPower) * (1 - Math.exp(-(want ? 10 : 5) * dt));\r
        const stiffness = 220;\r
        const damping = 2 * Math.sqrt(stiffness) * 0.85;\r
        state.spotVX += (stiffness * (state.pointerX - state.spotX) - damping * state.spotVX) * dt;\r
        state.spotVY += (stiffness * (state.pointerY - state.spotY) - damping * state.spotVY) * dt;\r
        state.spotX += state.spotVX * dt;\r
        state.spotY += state.spotVY * dt;\r
        illuminate(s, layoutFor(s.shape, s.cellSize), dt);\r
        state.cascades = state.cascades.filter(cascade => state.time - cascade.time < cascade.reach * 0.055 + 0.4);\r
      }\r
      draw();\r
      const settled =\r
        s.paused ||\r
        (s.speed === 0 || s.direction === 'none' || reduce\r
          ? state.lit.size === 0 &&\r
            state.cascades.length === 0 &&\r
            s.twinkle === 0 &&\r
            state.spotPower < 0.005 &&\r
            state.time - state.startedAt > 3\r
          : false);\r
      if (!settled && state.visible) state.raf = requestAnimationFrame(frame);\r
      else state.last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!state.raf && state.alive && state.visible) state.raf = requestAnimationFrame(frame);\r
    };\r
\r
    const pointFrom = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;\r
      return toPlane(x, y);\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      const point = pointFrom(event);\r
      if (point && !state.inside && state.spotPower < 0.02) {\r
        state.spotX = point[0];\r
        state.spotY = point[1];\r
        state.spotVX = 0;\r
        state.spotVY = 0;\r
      }\r
      state.inside = point !== null;\r
      if (point) {\r
        state.pointerX = point[0];\r
        state.pointerY = point[1];\r
        wake();\r
      }\r
    };\r
\r
    const onLeave = () => {\r
      state.inside = false;\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      if (!s.clickCascade) return;\r
      const point = pointFrom(event);\r
      if (!point) return;\r
      state.cascades.push({\r
        x: point[0] + state.offsetX,\r
        y: point[1] + state.offsetY,\r
        time: state.time,\r
        power: 1,\r
        reach: Math.hypot(state.view.width, state.view.height) / s.cellSize,\r
        hue: state.time * 120\r
      });\r
      if (state.cascades.length > 6) state.cascades.shift();\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(() => {\r
      resize();\r
      draw();\r
      wake();\r
    });\r
    resizeObserver.observe(container);\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    engineRef.current = {\r
      redraw: () => {\r
        resize();\r
        draw();\r
        wake();\r
      }\r
    };\r
\r
    resize();\r
    wake();\r
\r
    return () => {\r
      state.alive = false;\r
      cancelAnimationFrame(state.raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    engineRef.current?.redraw();\r
  });\r
\r
  const mask = fadeMask(clamp(fade, 0, 1));\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`relative h-full w-full overflow-hidden \${className}\`.trim()}\r
      style={{\r
        opacity: clamp(opacity, 0, 1),\r
        backgroundColor,\r
        ...(mask === 'none'\r
          ? null\r
          : { maskImage: mask, WebkitMaskImage: mask, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }),\r
        ...style\r
      }}\r
    >\r
      <canvas ref={canvasRef} className="absolute left-0 top-0 block origin-top-left" />\r
    </div>\r
  );\r
}\r
`,a={usage:`import ShapeGrid from './ShapeGrid';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <ShapeGrid
    shape="square"
    direction="diagonal"
    lineColor="#2a2734"
    hoverColor="#ffffff"
    hoverFillColor="#ffffff"
    fillOpacity={0.15}
    cellSize={40}
    speed={0.5}
    tiltX={0}
    tiltY={0}
    rainbow={false}
  />
</div>`,code:n,css:r,tailwind:t,tsCode:e,tsTailwind:s};export{a as shapeGrid};
