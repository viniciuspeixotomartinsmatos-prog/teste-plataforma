const n=`'use client';\r
\r
import { useEffect, useLayoutEffect, useRef, useState } from 'react';\r
import './PixelSwap.css';\r
\r
const MAX_PIXELS = 600;\r
const STEP = 1 / 240;\r
const PATTERNS = [\r
  'pointer',\r
  'random',\r
  'center',\r
  'edges',\r
  'left-to-right',\r
  'right-to-left',\r
  'top-to-bottom',\r
  'bottom-to-top',\r
  'diagonal',\r
  'spiral'\r
];\r
\r
const ROOT = 'pixel-swap';\r
const LAYER = 'pixel-swap__layer';\r
\r
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smoothstep = (edge0, edge1, value) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const hash = index => {\r
  let h = Math.imul(index + 1, 0x27d4eb2d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;\r
};\r
\r
const round = value => Math.round(value * 10) / 10;\r
\r
const buildGrid = (width, height, pixelSize, gap) => {\r
  let size = pixelSize;\r
  let columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));\r
  let rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));\r
  if (columns * rows > MAX_PIXELS) {\r
    size = Math.ceil(size * Math.sqrt((columns * rows) / MAX_PIXELS));\r
    columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));\r
    rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));\r
  }\r
  const stride = size + gap;\r
  const startX = (width - (columns * stride - gap)) / 2;\r
  const startY = (height - (rows * stride - gap)) / 2;\r
  const count = columns * rows;\r
  const cx = new Float32Array(count);\r
  const cy = new Float32Array(count);\r
  const gx = new Float32Array(count);\r
  const gy = new Float32Array(count);\r
  for (let row = 0; row < rows; row++) {\r
    for (let column = 0; column < columns; column++) {\r
      const index = row * columns + column;\r
      cx[index] = startX + column * stride + size / 2;\r
      cy[index] = startY + row * stride + size / 2;\r
      gx[index] = columns > 1 ? column / (columns - 1) : 0.5;\r
      gy[index] = rows > 1 ? row / (rows - 1) : 0.5;\r
    }\r
  }\r
  return { count, size, stride, gap, width, height, cx, cy, gx, gy };\r
};\r
\r
const orderOf = (grid, index, pattern, point) => {\r
  const x = grid.gx[index];\r
  const y = grid.gy[index];\r
  if (pattern === 'random') return hash(index + 11);\r
  if (pattern === 'center') return Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2;\r
  if (pattern === 'edges') return 1 - Math.min(x, 1 - x, y, 1 - y) * 2;\r
  if (pattern === 'left-to-right') return x;\r
  if (pattern === 'right-to-left') return 1 - x;\r
  if (pattern === 'top-to-bottom') return y;\r
  if (pattern === 'bottom-to-top') return 1 - y;\r
  if (pattern === 'diagonal') return (x + y) / 2;\r
  if (pattern === 'spiral') {\r
    const angle = (Math.atan2(y - 0.5, x - 0.5) + Math.PI) / (Math.PI * 2);\r
    return (angle + Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2) / 2;\r
  }\r
  const px = point ? point.x : grid.width / 2;\r
  const py = point ? point.y : grid.height / 2;\r
  const reach = Math.max(\r
    Math.hypot(px, py),\r
    Math.hypot(grid.width - px, py),\r
    Math.hypot(px, grid.height - py),\r
    Math.hypot(grid.width - px, grid.height - py),\r
    1\r
  );\r
  return Math.hypot(grid.cx[index] - px, grid.cy[index] - py) / reach;\r
};\r
\r
const pixelPath = (x, y, half, radius, angle) => {\r
  if (!angle) {\r
    const x0 = round(x - half);\r
    const x1 = round(x + half);\r
    const y0 = round(y - half);\r
    const y1 = round(y + half);\r
    if (radius < 0.2) return \`M\${x0} \${y0}H\${x1}V\${y1}H\${x0}Z\`;\r
    const r = round(radius);\r
    return \`M\${round(x0 + r)} \${y0}H\${round(x1 - r)}A\${r} \${r} 0 0 1 \${x1} \${round(y0 + r)}V\${round(y1 - r)}A\${r} \${r} 0 0 1 \${round(x1 - r)} \${y1}H\${round(x0 + r)}A\${r} \${r} 0 0 1 \${x0} \${round(y1 - r)}V\${round(y0 + r)}A\${r} \${r} 0 0 1 \${round(x0 + r)} \${y0}Z\`;\r
  }\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  const at = (u, v) => \`\${round(x + u * cos - v * sin)} \${round(y + u * sin + v * cos)}\`;\r
  const h = half;\r
  if (radius < 0.2) return \`M\${at(-h, -h)}L\${at(h, -h)}L\${at(h, h)}L\${at(-h, h)}Z\`;\r
  const r = round(radius);\r
  const k = h - radius;\r
  return \`M\${at(-k, -h)}L\${at(k, -h)}A\${r} \${r} 0 0 1 \${at(h, -k)}L\${at(h, k)}A\${r} \${r} 0 0 1 \${at(k, h)}L\${at(-k, h)}A\${r} \${r} 0 0 1 \${at(-h, k)}L\${at(-h, -k)}A\${r} \${r} 0 0 1 \${at(-k, -h)}Z\`;\r
};\r
\r
function PixelSwap({\r
  firstContent,\r
  secondContent,\r
  pattern = 'pointer',\r
  pixelSize = 48,\r
  gap = 0,\r
  pixelRadius = 0,\r
  pixelScale = 0,\r
  pixelSpin = 0,\r
  duration = 400,\r
  pixelDuration = 350,\r
  randomness = 0.2,\r
  bounce = 0.3,\r
  trigger = 'hover',\r
  intro = true,\r
  initialActive = false,\r
  active,\r
  onActiveChange,\r
  onComplete,\r
  aspectRatio = '16 / 10',\r
  className = '',\r
  style\r
}) {\r
  const controlled = active !== undefined;\r
  const [shown, setShown] = useState(controlled ? active : initialActive);\r
  const rootRef = useRef(null);\r
  const layerRefs = useRef([]);\r
  const shownRef = useRef(shown);\r
  const desiredRef = useRef(shown);\r
  const pointRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const waitingRef = useRef(false);\r
\r
  const settings = {\r
    pattern: PATTERNS.includes(pattern) ? pattern : 'pointer',\r
    pixelSize: Math.max(8, Math.round(pixelSize)),\r
    gap: Math.max(0, gap),\r
    pixelRadius: clamp(pixelRadius, 0, 50),\r
    pixelScale: clamp(pixelScale, 0, 0.9),\r
    pixelSpin: (clamp(pixelSpin, -360, 360) * Math.PI) / 180,\r
    duration: Math.max(0, duration),\r
    pixelDuration: Math.max(60, pixelDuration),\r
    randomness: clamp(randomness, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    onComplete\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  const setLayer = (index, visible, clip) => {\r
    const layer = layerRefs.current[index];\r
    if (!layer) return;\r
    layer.setAttribute('data-visible', String(visible));\r
    layer.style.clipPath = clip || '';\r
  };\r
\r
  const finish = () => {\r
    const engine = engineRef.current;\r
    if (!engine) return;\r
    engine.running = false;\r
    rootRef.current?.removeAttribute('data-swapping');\r
    if (engine.mode === 'intro') {\r
      setLayer(0, !shownRef.current, '');\r
      engine.mode = 'swap';\r
      if (desiredRef.current !== shownRef.current) requestRef.current(desiredRef.current, pointRef.current);\r
      return;\r
    }\r
    const target = engine.desired === 1;\r
    setLayer(1, target, '');\r
    setLayer(0, !target, '');\r
    shownRef.current = target;\r
    setShown(target);\r
    settingsRef.current.onComplete?.(target);\r
  };\r
\r
  const frame = now => {\r
    const engine = engineRef.current;\r
    if (!engine) return;\r
    const s = settingsRef.current;\r
    const grid = engine.grid;\r
    const { value, velocity, flipAt, target } = engine;\r
    const elapsed = clamp((now - engine.last) / 1000, 0, 1 / 20);\r
    engine.last = now;\r
    const omega = (Math.PI * 2) / (s.pixelDuration / 1000);\r
    const zeta = clamp(1 - s.bounce, 0.15, 1);\r
    const steps = Math.max(1, Math.ceil(elapsed / STEP));\r
    const dt = elapsed / steps;\r
    const pop = s.pixelScale;\r
    const half = grid.size / 2;\r
    const cover = grid.gap / 2 + 0.5;\r
    let moving = false;\r
    let path = '';\r
\r
    for (let i = 0; i < grid.count; i++) {\r
      if (now >= flipAt[i] && target[i] !== engine.desired) {\r
        target[i] = engine.desired;\r
        if (target[i] === 1 && value[i] < pop) value[i] = pop;\r
      }\r
      let x = value[i];\r
      let v = velocity[i];\r
      const goal = target[i];\r
      for (let n = 0; n < steps; n++) {\r
        v += (-omega * omega * (x - goal) - 2 * zeta * omega * v) * dt;\r
        x += v * dt;\r
      }\r
      if (goal === 0 && x <= pop) {\r
        x = 0;\r
        v = 0;\r
      }\r
      if (Math.abs(x - goal) > 0.001 || Math.abs(v) > 0.01 || now < flipAt[i]) moving = true;\r
      else {\r
        x = goal;\r
        v = 0;\r
      }\r
      value[i] = x;\r
      velocity[i] = v;\r
      if (x <= 0.002) continue;\r
      const size = Math.min(x * 1.08, 1.25) * (half + cover * smoothstep(0.6, 0.93, x));\r
      const radius = Math.min(size, (s.pixelRadius / 50) * size * (1 - smoothstep(0.6, 0.93, x)));\r
      path += pixelPath(grid.cx[i], grid.cy[i], size, radius, s.pixelSpin * (1 - x));\r
    }\r
\r
    const layer = engine.mode === 'intro' ? 0 : 1;\r
    setLayer(layer, path !== '', path ? \`path('\${path}')\` : '');\r
\r
    if (moving) engine.raf = requestAnimationFrame(frame);\r
    else finish();\r
  };\r
\r
  const launch = (mode, to, point) => {\r
    const root = rootRef.current;\r
    const s = settingsRef.current;\r
    let engine = engineRef.current;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const width = root?.clientWidth ?? 0;\r
    const height = root?.clientHeight ?? 0;\r
    if (!root || reduce || !width || !height) return false;\r
\r
    const now = performance.now();\r
    if (!engine?.running) {\r
      const grid = buildGrid(width, height, s.pixelSize, s.gap);\r
      const start = mode === 'intro' ? 0 : shownRef.current ? 1 : 0;\r
      engine = {\r
        mode,\r
        grid,\r
        value: new Float32Array(grid.count).fill(start),\r
        velocity: new Float32Array(grid.count),\r
        flipAt: new Float64Array(grid.count),\r
        target: new Uint8Array(grid.count).fill(start),\r
        desired: start,\r
        last: now,\r
        running: true,\r
        raf: engineRef.current?.raf ?? 0\r
      };\r
      engineRef.current = engine;\r
    }\r
    engine.desired = to ? 1 : 0;\r
    const grid = engine.grid;\r
    const orders = new Float32Array(grid.count);\r
    let first = Infinity;\r
    for (let i = 0; i < grid.count; i++) {\r
      orders[i] = orderOf(grid, i, s.pattern, point) * (1 - s.randomness) + hash(i) * s.randomness;\r
      const settled = engine.target[i] === engine.desired && Math.abs(engine.value[i] - engine.desired) < 0.001;\r
      if (!settled) first = Math.min(first, orders[i]);\r
    }\r
    if (first === Infinity) first = 0;\r
    for (let i = 0; i < grid.count; i++) engine.flipAt[i] = now + Math.max(0, orders[i] - first) * s.duration;\r
    root.setAttribute('data-swapping', '');\r
    if (mode === 'swap') setLayer(0, true, '');\r
    cancelAnimationFrame(engine.raf);\r
    engine.raf = requestAnimationFrame(frame);\r
    return true;\r
  };\r
\r
  const request = (to, point) => {\r
    const engine = engineRef.current;\r
    if (waitingRef.current || (engine?.running && engine.mode === 'intro')) return;\r
    if (!engine?.running && shownRef.current === to) return;\r
    if (launch('swap', to, point)) return;\r
    setLayer(1, to, '');\r
    setLayer(0, !to, '');\r
    shownRef.current = to;\r
    setShown(to);\r
    settingsRef.current.onComplete?.(to);\r
  };\r
  const requestRef = useRef(request);\r
  requestRef.current = request;\r
\r
  const ask = (next, point) => {\r
    desiredRef.current = next;\r
    pointRef.current = point;\r
    onActiveChange?.(next);\r
    if (!controlled) request(next, point);\r
  };\r
\r
  const launchRef = useRef(launch);\r
  launchRef.current = launch;\r
\r
  useIsoLayoutEffect(() => {\r
    if (!intro || shownRef.current) return;\r
    const images = [...(layerRefs.current[0]?.querySelectorAll('img') ?? [])].filter(image => !image.complete);\r
    let started = false;\r
    let timer = 0;\r
    const begin = () => {\r
      if (started) return;\r
      started = true;\r
      clearTimeout(timer);\r
      waitingRef.current = false;\r
      if (launchRef.current('intro', true, null)) return;\r
      setLayer(0, true, '');\r
      if (desiredRef.current !== shownRef.current) requestRef.current(desiredRef.current, pointRef.current);\r
    };\r
    setLayer(0, false, '');\r
    if (!images.length) {\r
      begin();\r
      return undefined;\r
    }\r
    waitingRef.current = true;\r
    let left = images.length;\r
    const settle = () => {\r
      left -= 1;\r
      if (left <= 0) begin();\r
    };\r
    images.forEach(image => {\r
      image.addEventListener('load', settle, { once: true });\r
      image.addEventListener('error', settle, { once: true });\r
    });\r
    timer = setTimeout(begin, 3000);\r
    return () => {\r
      started = true;\r
      clearTimeout(timer);\r
      waitingRef.current = false;\r
      images.forEach(image => {\r
        image.removeEventListener('load', settle);\r
        image.removeEventListener('error', settle);\r
      });\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (active === undefined) return;\r
    desiredRef.current = active;\r
    requestRef.current(active, pointRef.current);\r
  }, [active]);\r
\r
  useEffect(\r
    () => () => {\r
      const engine = engineRef.current;\r
      if (!engine) return;\r
      cancelAnimationFrame(engine.raf);\r
      engine.running = false;\r
    },\r
    []\r
  );\r
\r
  const pointOf = event => {\r
    const rect = rootRef.current?.getBoundingClientRect();\r
    if (!rect || (event.detail === 0 && event.clientX === 0 && event.clientY === 0)) return null;\r
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };\r
  };\r
\r
  const handlers = {};\r
  if (trigger === 'hover') {\r
    handlers.onPointerEnter = event => {\r
      if (event.pointerType !== 'touch') ask(true, pointOf(event));\r
    };\r
    handlers.onPointerLeave = event => {\r
      if (event.pointerType !== 'touch') ask(false, pointOf(event));\r
    };\r
    handlers.onClick = event => {\r
      const native = event.nativeEvent;\r
      const touch = 'pointerType' in native && native.pointerType === 'touch';\r
      if (event.detail === 0 || touch) ask(!desiredRef.current, pointOf(event));\r
    };\r
    handlers.onFocus = event => {\r
      if (event.target === event.currentTarget && event.currentTarget.matches(':focus-visible')) ask(true, null);\r
    };\r
    handlers.onBlur = () => ask(false, null);\r
    handlers.tabIndex = 0;\r
  } else if (trigger === 'click') {\r
    handlers.onClick = event => ask(!desiredRef.current, pointOf(event));\r
    handlers.onKeyDown = event => {\r
      if (event.key !== 'Enter' && event.key !== ' ') return;\r
      event.preventDefault();\r
      ask(!desiredRef.current, null);\r
    };\r
    handlers.role = 'button';\r
    handlers.tabIndex = 0;\r
    handlers['aria-pressed'] = shown;\r
  }\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={[ROOT, className].filter(Boolean).join(' ')}\r
      style={{ aspectRatio, ...style }}\r
      data-active={shown ? '' : undefined}\r
      {...handlers}\r
    >\r
      {[firstContent, secondContent].map((content, index) => (\r
        <div\r
          key={index}\r
          ref={element => {\r
            layerRefs.current[index] = element;\r
          }}\r
          className={LAYER}\r
          style={{ zIndex: index }}\r
          data-visible={String(index === (shown ? 1 : 0))}\r
          aria-hidden={index !== (shown ? 1 : 0)}\r
        >\r
          {content}\r
        </div>\r
      ))}\r
    </div>\r
  );\r
}\r
\r
export default PixelSwap;\r
`,r=`.pixel-swap {\r
  position: relative;\r
  width: 100%;\r
  overflow: hidden;\r
  isolation: isolate;\r
  outline: none;\r
}\r
\r
.pixel-swap:focus-visible {\r
  outline: 2px solid currentColor;\r
  outline-offset: 3px;\r
}\r
\r
.pixel-swap__layer {\r
  position: absolute;\r
  inset: 0;\r
  width: 100%;\r
  height: 100%;\r
}\r
\r
.pixel-swap__layer[data-visible='false'] {\r
  visibility: hidden;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useLayoutEffect, useRef, useState } from 'react';\r
\r
const MAX_PIXELS = 600;\r
const STEP = 1 / 240;\r
const PATTERNS = [\r
  'pointer',\r
  'random',\r
  'center',\r
  'edges',\r
  'left-to-right',\r
  'right-to-left',\r
  'top-to-bottom',\r
  'bottom-to-top',\r
  'diagonal',\r
  'spiral'\r
];\r
\r
const ROOT =\r
  'relative isolate w-full overflow-hidden outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current';\r
const LAYER = 'absolute inset-0 h-full w-full data-[visible=false]:invisible';\r
\r
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smoothstep = (edge0, edge1, value) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const hash = index => {\r
  let h = Math.imul(index + 1, 0x27d4eb2d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;\r
};\r
\r
const round = value => Math.round(value * 10) / 10;\r
\r
const buildGrid = (width, height, pixelSize, gap) => {\r
  let size = pixelSize;\r
  let columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));\r
  let rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));\r
  if (columns * rows > MAX_PIXELS) {\r
    size = Math.ceil(size * Math.sqrt((columns * rows) / MAX_PIXELS));\r
    columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));\r
    rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));\r
  }\r
  const stride = size + gap;\r
  const startX = (width - (columns * stride - gap)) / 2;\r
  const startY = (height - (rows * stride - gap)) / 2;\r
  const count = columns * rows;\r
  const cx = new Float32Array(count);\r
  const cy = new Float32Array(count);\r
  const gx = new Float32Array(count);\r
  const gy = new Float32Array(count);\r
  for (let row = 0; row < rows; row++) {\r
    for (let column = 0; column < columns; column++) {\r
      const index = row * columns + column;\r
      cx[index] = startX + column * stride + size / 2;\r
      cy[index] = startY + row * stride + size / 2;\r
      gx[index] = columns > 1 ? column / (columns - 1) : 0.5;\r
      gy[index] = rows > 1 ? row / (rows - 1) : 0.5;\r
    }\r
  }\r
  return { count, size, stride, gap, width, height, cx, cy, gx, gy };\r
};\r
\r
const orderOf = (grid, index, pattern, point) => {\r
  const x = grid.gx[index];\r
  const y = grid.gy[index];\r
  if (pattern === 'random') return hash(index + 11);\r
  if (pattern === 'center') return Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2;\r
  if (pattern === 'edges') return 1 - Math.min(x, 1 - x, y, 1 - y) * 2;\r
  if (pattern === 'left-to-right') return x;\r
  if (pattern === 'right-to-left') return 1 - x;\r
  if (pattern === 'top-to-bottom') return y;\r
  if (pattern === 'bottom-to-top') return 1 - y;\r
  if (pattern === 'diagonal') return (x + y) / 2;\r
  if (pattern === 'spiral') {\r
    const angle = (Math.atan2(y - 0.5, x - 0.5) + Math.PI) / (Math.PI * 2);\r
    return (angle + Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2) / 2;\r
  }\r
  const px = point ? point.x : grid.width / 2;\r
  const py = point ? point.y : grid.height / 2;\r
  const reach = Math.max(\r
    Math.hypot(px, py),\r
    Math.hypot(grid.width - px, py),\r
    Math.hypot(px, grid.height - py),\r
    Math.hypot(grid.width - px, grid.height - py),\r
    1\r
  );\r
  return Math.hypot(grid.cx[index] - px, grid.cy[index] - py) / reach;\r
};\r
\r
const pixelPath = (x, y, half, radius, angle) => {\r
  if (!angle) {\r
    const x0 = round(x - half);\r
    const x1 = round(x + half);\r
    const y0 = round(y - half);\r
    const y1 = round(y + half);\r
    if (radius < 0.2) return \`M\${x0} \${y0}H\${x1}V\${y1}H\${x0}Z\`;\r
    const r = round(radius);\r
    return \`M\${round(x0 + r)} \${y0}H\${round(x1 - r)}A\${r} \${r} 0 0 1 \${x1} \${round(y0 + r)}V\${round(y1 - r)}A\${r} \${r} 0 0 1 \${round(x1 - r)} \${y1}H\${round(x0 + r)}A\${r} \${r} 0 0 1 \${x0} \${round(y1 - r)}V\${round(y0 + r)}A\${r} \${r} 0 0 1 \${round(x0 + r)} \${y0}Z\`;\r
  }\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  const at = (u, v) => \`\${round(x + u * cos - v * sin)} \${round(y + u * sin + v * cos)}\`;\r
  const h = half;\r
  if (radius < 0.2) return \`M\${at(-h, -h)}L\${at(h, -h)}L\${at(h, h)}L\${at(-h, h)}Z\`;\r
  const r = round(radius);\r
  const k = h - radius;\r
  return \`M\${at(-k, -h)}L\${at(k, -h)}A\${r} \${r} 0 0 1 \${at(h, -k)}L\${at(h, k)}A\${r} \${r} 0 0 1 \${at(k, h)}L\${at(-k, h)}A\${r} \${r} 0 0 1 \${at(-h, k)}L\${at(-h, -k)}A\${r} \${r} 0 0 1 \${at(-k, -h)}Z\`;\r
};\r
\r
function PixelSwap({\r
  firstContent,\r
  secondContent,\r
  pattern = 'pointer',\r
  pixelSize = 48,\r
  gap = 0,\r
  pixelRadius = 0,\r
  pixelScale = 0,\r
  pixelSpin = 0,\r
  duration = 400,\r
  pixelDuration = 350,\r
  randomness = 0.2,\r
  bounce = 0.3,\r
  trigger = 'hover',\r
  intro = true,\r
  initialActive = false,\r
  active,\r
  onActiveChange,\r
  onComplete,\r
  aspectRatio = '16 / 10',\r
  className = '',\r
  style\r
}) {\r
  const controlled = active !== undefined;\r
  const [shown, setShown] = useState(controlled ? active : initialActive);\r
  const rootRef = useRef(null);\r
  const layerRefs = useRef([]);\r
  const shownRef = useRef(shown);\r
  const desiredRef = useRef(shown);\r
  const pointRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const waitingRef = useRef(false);\r
\r
  const settings = {\r
    pattern: PATTERNS.includes(pattern) ? pattern : 'pointer',\r
    pixelSize: Math.max(8, Math.round(pixelSize)),\r
    gap: Math.max(0, gap),\r
    pixelRadius: clamp(pixelRadius, 0, 50),\r
    pixelScale: clamp(pixelScale, 0, 0.9),\r
    pixelSpin: (clamp(pixelSpin, -360, 360) * Math.PI) / 180,\r
    duration: Math.max(0, duration),\r
    pixelDuration: Math.max(60, pixelDuration),\r
    randomness: clamp(randomness, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    onComplete\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  const setLayer = (index, visible, clip) => {\r
    const layer = layerRefs.current[index];\r
    if (!layer) return;\r
    layer.setAttribute('data-visible', String(visible));\r
    layer.style.clipPath = clip || '';\r
  };\r
\r
  const finish = () => {\r
    const engine = engineRef.current;\r
    if (!engine) return;\r
    engine.running = false;\r
    rootRef.current?.removeAttribute('data-swapping');\r
    if (engine.mode === 'intro') {\r
      setLayer(0, !shownRef.current, '');\r
      engine.mode = 'swap';\r
      if (desiredRef.current !== shownRef.current) requestRef.current(desiredRef.current, pointRef.current);\r
      return;\r
    }\r
    const target = engine.desired === 1;\r
    setLayer(1, target, '');\r
    setLayer(0, !target, '');\r
    shownRef.current = target;\r
    setShown(target);\r
    settingsRef.current.onComplete?.(target);\r
  };\r
\r
  const frame = now => {\r
    const engine = engineRef.current;\r
    if (!engine) return;\r
    const s = settingsRef.current;\r
    const grid = engine.grid;\r
    const { value, velocity, flipAt, target } = engine;\r
    const elapsed = clamp((now - engine.last) / 1000, 0, 1 / 20);\r
    engine.last = now;\r
    const omega = (Math.PI * 2) / (s.pixelDuration / 1000);\r
    const zeta = clamp(1 - s.bounce, 0.15, 1);\r
    const steps = Math.max(1, Math.ceil(elapsed / STEP));\r
    const dt = elapsed / steps;\r
    const pop = s.pixelScale;\r
    const half = grid.size / 2;\r
    const cover = grid.gap / 2 + 0.5;\r
    let moving = false;\r
    let path = '';\r
\r
    for (let i = 0; i < grid.count; i++) {\r
      if (now >= flipAt[i] && target[i] !== engine.desired) {\r
        target[i] = engine.desired;\r
        if (target[i] === 1 && value[i] < pop) value[i] = pop;\r
      }\r
      let x = value[i];\r
      let v = velocity[i];\r
      const goal = target[i];\r
      for (let n = 0; n < steps; n++) {\r
        v += (-omega * omega * (x - goal) - 2 * zeta * omega * v) * dt;\r
        x += v * dt;\r
      }\r
      if (goal === 0 && x <= pop) {\r
        x = 0;\r
        v = 0;\r
      }\r
      if (Math.abs(x - goal) > 0.001 || Math.abs(v) > 0.01 || now < flipAt[i]) moving = true;\r
      else {\r
        x = goal;\r
        v = 0;\r
      }\r
      value[i] = x;\r
      velocity[i] = v;\r
      if (x <= 0.002) continue;\r
      const size = Math.min(x * 1.08, 1.25) * (half + cover * smoothstep(0.6, 0.93, x));\r
      const radius = Math.min(size, (s.pixelRadius / 50) * size * (1 - smoothstep(0.6, 0.93, x)));\r
      path += pixelPath(grid.cx[i], grid.cy[i], size, radius, s.pixelSpin * (1 - x));\r
    }\r
\r
    const layer = engine.mode === 'intro' ? 0 : 1;\r
    setLayer(layer, path !== '', path ? \`path('\${path}')\` : '');\r
\r
    if (moving) engine.raf = requestAnimationFrame(frame);\r
    else finish();\r
  };\r
\r
  const launch = (mode, to, point) => {\r
    const root = rootRef.current;\r
    const s = settingsRef.current;\r
    let engine = engineRef.current;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const width = root?.clientWidth ?? 0;\r
    const height = root?.clientHeight ?? 0;\r
    if (!root || reduce || !width || !height) return false;\r
\r
    const now = performance.now();\r
    if (!engine?.running) {\r
      const grid = buildGrid(width, height, s.pixelSize, s.gap);\r
      const start = mode === 'intro' ? 0 : shownRef.current ? 1 : 0;\r
      engine = {\r
        mode,\r
        grid,\r
        value: new Float32Array(grid.count).fill(start),\r
        velocity: new Float32Array(grid.count),\r
        flipAt: new Float64Array(grid.count),\r
        target: new Uint8Array(grid.count).fill(start),\r
        desired: start,\r
        last: now,\r
        running: true,\r
        raf: engineRef.current?.raf ?? 0\r
      };\r
      engineRef.current = engine;\r
    }\r
    engine.desired = to ? 1 : 0;\r
    const grid = engine.grid;\r
    const orders = new Float32Array(grid.count);\r
    let first = Infinity;\r
    for (let i = 0; i < grid.count; i++) {\r
      orders[i] = orderOf(grid, i, s.pattern, point) * (1 - s.randomness) + hash(i) * s.randomness;\r
      const settled = engine.target[i] === engine.desired && Math.abs(engine.value[i] - engine.desired) < 0.001;\r
      if (!settled) first = Math.min(first, orders[i]);\r
    }\r
    if (first === Infinity) first = 0;\r
    for (let i = 0; i < grid.count; i++) engine.flipAt[i] = now + Math.max(0, orders[i] - first) * s.duration;\r
    root.setAttribute('data-swapping', '');\r
    if (mode === 'swap') setLayer(0, true, '');\r
    cancelAnimationFrame(engine.raf);\r
    engine.raf = requestAnimationFrame(frame);\r
    return true;\r
  };\r
\r
  const request = (to, point) => {\r
    const engine = engineRef.current;\r
    if (waitingRef.current || (engine?.running && engine.mode === 'intro')) return;\r
    if (!engine?.running && shownRef.current === to) return;\r
    if (launch('swap', to, point)) return;\r
    setLayer(1, to, '');\r
    setLayer(0, !to, '');\r
    shownRef.current = to;\r
    setShown(to);\r
    settingsRef.current.onComplete?.(to);\r
  };\r
  const requestRef = useRef(request);\r
  requestRef.current = request;\r
\r
  const ask = (next, point) => {\r
    desiredRef.current = next;\r
    pointRef.current = point;\r
    onActiveChange?.(next);\r
    if (!controlled) request(next, point);\r
  };\r
\r
  const launchRef = useRef(launch);\r
  launchRef.current = launch;\r
\r
  useIsoLayoutEffect(() => {\r
    if (!intro || shownRef.current) return;\r
    const images = [...(layerRefs.current[0]?.querySelectorAll('img') ?? [])].filter(image => !image.complete);\r
    let started = false;\r
    let timer = 0;\r
    const begin = () => {\r
      if (started) return;\r
      started = true;\r
      clearTimeout(timer);\r
      waitingRef.current = false;\r
      if (launchRef.current('intro', true, null)) return;\r
      setLayer(0, true, '');\r
      if (desiredRef.current !== shownRef.current) requestRef.current(desiredRef.current, pointRef.current);\r
    };\r
    setLayer(0, false, '');\r
    if (!images.length) {\r
      begin();\r
      return undefined;\r
    }\r
    waitingRef.current = true;\r
    let left = images.length;\r
    const settle = () => {\r
      left -= 1;\r
      if (left <= 0) begin();\r
    };\r
    images.forEach(image => {\r
      image.addEventListener('load', settle, { once: true });\r
      image.addEventListener('error', settle, { once: true });\r
    });\r
    timer = setTimeout(begin, 3000);\r
    return () => {\r
      started = true;\r
      clearTimeout(timer);\r
      waitingRef.current = false;\r
      images.forEach(image => {\r
        image.removeEventListener('load', settle);\r
        image.removeEventListener('error', settle);\r
      });\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (active === undefined) return;\r
    desiredRef.current = active;\r
    requestRef.current(active, pointRef.current);\r
  }, [active]);\r
\r
  useEffect(\r
    () => () => {\r
      const engine = engineRef.current;\r
      if (!engine) return;\r
      cancelAnimationFrame(engine.raf);\r
      engine.running = false;\r
    },\r
    []\r
  );\r
\r
  const pointOf = event => {\r
    const rect = rootRef.current?.getBoundingClientRect();\r
    if (!rect || (event.detail === 0 && event.clientX === 0 && event.clientY === 0)) return null;\r
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };\r
  };\r
\r
  const handlers = {};\r
  if (trigger === 'hover') {\r
    handlers.onPointerEnter = event => {\r
      if (event.pointerType !== 'touch') ask(true, pointOf(event));\r
    };\r
    handlers.onPointerLeave = event => {\r
      if (event.pointerType !== 'touch') ask(false, pointOf(event));\r
    };\r
    handlers.onClick = event => {\r
      const native = event.nativeEvent;\r
      const touch = 'pointerType' in native && native.pointerType === 'touch';\r
      if (event.detail === 0 || touch) ask(!desiredRef.current, pointOf(event));\r
    };\r
    handlers.onFocus = event => {\r
      if (event.target === event.currentTarget && event.currentTarget.matches(':focus-visible')) ask(true, null);\r
    };\r
    handlers.onBlur = () => ask(false, null);\r
    handlers.tabIndex = 0;\r
  } else if (trigger === 'click') {\r
    handlers.onClick = event => ask(!desiredRef.current, pointOf(event));\r
    handlers.onKeyDown = event => {\r
      if (event.key !== 'Enter' && event.key !== ' ') return;\r
      event.preventDefault();\r
      ask(!desiredRef.current, null);\r
    };\r
    handlers.role = 'button';\r
    handlers.tabIndex = 0;\r
    handlers['aria-pressed'] = shown;\r
  }\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={[ROOT, className].filter(Boolean).join(' ')}\r
      style={{ aspectRatio, ...style }}\r
      data-active={shown ? '' : undefined}\r
      {...handlers}\r
    >\r
      {[firstContent, secondContent].map((content, index) => (\r
        <div\r
          key={index}\r
          ref={element => {\r
            layerRefs.current[index] = element;\r
          }}\r
          className={LAYER}\r
          style={{ zIndex: index }}\r
          data-visible={String(index === (shown ? 1 : 0))}\r
          aria-hidden={index !== (shown ? 1 : 0)}\r
        >\r
          {content}\r
        </div>\r
      ))}\r
    </div>\r
  );\r
}\r
\r
export default PixelSwap;\r
`,t=`'use client';\r
\r
import {\r
  useEffect,\r
  useLayoutEffect,\r
  useRef,\r
  useState,\r
  type CSSProperties,\r
  type HTMLAttributes,\r
  type MouseEvent as ReactMouseEvent,\r
  type ReactNode\r
} from 'react';\r
import './PixelSwap.css';\r
\r
export interface PixelSwapProps {\r
  firstContent?: ReactNode;\r
  secondContent?: ReactNode;\r
  pattern?:\r
    | 'pointer'\r
    | 'random'\r
    | 'center'\r
    | 'edges'\r
    | 'left-to-right'\r
    | 'right-to-left'\r
    | 'top-to-bottom'\r
    | 'bottom-to-top'\r
    | 'diagonal'\r
    | 'spiral';\r
  pixelSize?: number;\r
  gap?: number;\r
  pixelRadius?: number;\r
  pixelScale?: number;\r
  pixelSpin?: number;\r
  duration?: number;\r
  pixelDuration?: number;\r
  randomness?: number;\r
  bounce?: number;\r
  trigger?: 'hover' | 'click' | 'none';\r
  intro?: boolean;\r
  initialActive?: boolean;\r
  active?: boolean;\r
  onActiveChange?: (active: boolean) => void;\r
  onComplete?: (active: boolean) => void;\r
  aspectRatio?: string;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Point {\r
  x: number;\r
  y: number;\r
}\r
\r
interface Grid {\r
  count: number;\r
  size: number;\r
  stride: number;\r
  gap: number;\r
  width: number;\r
  height: number;\r
  cx: Float32Array;\r
  cy: Float32Array;\r
  gx: Float32Array;\r
  gy: Float32Array;\r
}\r
\r
interface Engine {\r
  mode: 'intro' | 'swap';\r
  grid: Grid;\r
  value: Float32Array;\r
  velocity: Float32Array;\r
  flipAt: Float64Array;\r
  target: Uint8Array;\r
  desired: number;\r
  last: number;\r
  running: boolean;\r
  raf: number;\r
}\r
\r
const MAX_PIXELS = 600;\r
const STEP = 1 / 240;\r
const PATTERNS = [\r
  'pointer',\r
  'random',\r
  'center',\r
  'edges',\r
  'left-to-right',\r
  'right-to-left',\r
  'top-to-bottom',\r
  'bottom-to-top',\r
  'diagonal',\r
  'spiral'\r
];\r
\r
const ROOT = 'pixel-swap';\r
const LAYER = 'pixel-swap__layer';\r
\r
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smoothstep = (edge0: number, edge1: number, value: number) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const hash = (index: number) => {\r
  let h = Math.imul(index + 1, 0x27d4eb2d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;\r
};\r
\r
const round = (value: number) => Math.round(value * 10) / 10;\r
\r
const buildGrid = (width: number, height: number, pixelSize: number, gap: number): Grid => {\r
  let size = pixelSize;\r
  let columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));\r
  let rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));\r
  if (columns * rows > MAX_PIXELS) {\r
    size = Math.ceil(size * Math.sqrt((columns * rows) / MAX_PIXELS));\r
    columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));\r
    rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));\r
  }\r
  const stride = size + gap;\r
  const startX = (width - (columns * stride - gap)) / 2;\r
  const startY = (height - (rows * stride - gap)) / 2;\r
  const count = columns * rows;\r
  const cx = new Float32Array(count);\r
  const cy = new Float32Array(count);\r
  const gx = new Float32Array(count);\r
  const gy = new Float32Array(count);\r
  for (let row = 0; row < rows; row++) {\r
    for (let column = 0; column < columns; column++) {\r
      const index = row * columns + column;\r
      cx[index] = startX + column * stride + size / 2;\r
      cy[index] = startY + row * stride + size / 2;\r
      gx[index] = columns > 1 ? column / (columns - 1) : 0.5;\r
      gy[index] = rows > 1 ? row / (rows - 1) : 0.5;\r
    }\r
  }\r
  return { count, size, stride, gap, width, height, cx, cy, gx, gy };\r
};\r
\r
const orderOf = (grid: Grid, index: number, pattern: string, point: Point | null) => {\r
  const x = grid.gx[index];\r
  const y = grid.gy[index];\r
  if (pattern === 'random') return hash(index + 11);\r
  if (pattern === 'center') return Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2;\r
  if (pattern === 'edges') return 1 - Math.min(x, 1 - x, y, 1 - y) * 2;\r
  if (pattern === 'left-to-right') return x;\r
  if (pattern === 'right-to-left') return 1 - x;\r
  if (pattern === 'top-to-bottom') return y;\r
  if (pattern === 'bottom-to-top') return 1 - y;\r
  if (pattern === 'diagonal') return (x + y) / 2;\r
  if (pattern === 'spiral') {\r
    const angle = (Math.atan2(y - 0.5, x - 0.5) + Math.PI) / (Math.PI * 2);\r
    return (angle + Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2) / 2;\r
  }\r
  const px = point ? point.x : grid.width / 2;\r
  const py = point ? point.y : grid.height / 2;\r
  const reach = Math.max(\r
    Math.hypot(px, py),\r
    Math.hypot(grid.width - px, py),\r
    Math.hypot(px, grid.height - py),\r
    Math.hypot(grid.width - px, grid.height - py),\r
    1\r
  );\r
  return Math.hypot(grid.cx[index] - px, grid.cy[index] - py) / reach;\r
};\r
\r
const pixelPath = (x: number, y: number, half: number, radius: number, angle: number) => {\r
  if (!angle) {\r
    const x0 = round(x - half);\r
    const x1 = round(x + half);\r
    const y0 = round(y - half);\r
    const y1 = round(y + half);\r
    if (radius < 0.2) return \`M\${x0} \${y0}H\${x1}V\${y1}H\${x0}Z\`;\r
    const r = round(radius);\r
    return \`M\${round(x0 + r)} \${y0}H\${round(x1 - r)}A\${r} \${r} 0 0 1 \${x1} \${round(y0 + r)}V\${round(y1 - r)}A\${r} \${r} 0 0 1 \${round(x1 - r)} \${y1}H\${round(x0 + r)}A\${r} \${r} 0 0 1 \${x0} \${round(y1 - r)}V\${round(y0 + r)}A\${r} \${r} 0 0 1 \${round(x0 + r)} \${y0}Z\`;\r
  }\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  const at = (u: number, v: number) => \`\${round(x + u * cos - v * sin)} \${round(y + u * sin + v * cos)}\`;\r
  const h = half;\r
  if (radius < 0.2) return \`M\${at(-h, -h)}L\${at(h, -h)}L\${at(h, h)}L\${at(-h, h)}Z\`;\r
  const r = round(radius);\r
  const k = h - radius;\r
  return \`M\${at(-k, -h)}L\${at(k, -h)}A\${r} \${r} 0 0 1 \${at(h, -k)}L\${at(h, k)}A\${r} \${r} 0 0 1 \${at(k, h)}L\${at(-k, h)}A\${r} \${r} 0 0 1 \${at(-h, k)}L\${at(-h, -k)}A\${r} \${r} 0 0 1 \${at(-k, -h)}Z\`;\r
};\r
\r
function PixelSwap({\r
  firstContent,\r
  secondContent,\r
  pattern = 'pointer',\r
  pixelSize = 48,\r
  gap = 0,\r
  pixelRadius = 0,\r
  pixelScale = 0,\r
  pixelSpin = 0,\r
  duration = 400,\r
  pixelDuration = 350,\r
  randomness = 0.2,\r
  bounce = 0.3,\r
  trigger = 'hover',\r
  intro = true,\r
  initialActive = false,\r
  active,\r
  onActiveChange,\r
  onComplete,\r
  aspectRatio = '16 / 10',\r
  className = '',\r
  style\r
}: PixelSwapProps) {\r
  const controlled = active !== undefined;\r
  const [shown, setShown] = useState(controlled ? active : initialActive);\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);\r
  const shownRef = useRef(shown);\r
  const desiredRef = useRef(shown);\r
  const pointRef = useRef<Point | null>(null);\r
  const engineRef = useRef<Engine | null>(null);\r
  const waitingRef = useRef(false);\r
\r
  const settings = {\r
    pattern: PATTERNS.includes(pattern) ? pattern : 'pointer',\r
    pixelSize: Math.max(8, Math.round(pixelSize)),\r
    gap: Math.max(0, gap),\r
    pixelRadius: clamp(pixelRadius, 0, 50),\r
    pixelScale: clamp(pixelScale, 0, 0.9),\r
    pixelSpin: (clamp(pixelSpin, -360, 360) * Math.PI) / 180,\r
    duration: Math.max(0, duration),\r
    pixelDuration: Math.max(60, pixelDuration),\r
    randomness: clamp(randomness, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    onComplete\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  const setLayer = (index: number, visible: boolean, clip: string) => {\r
    const layer = layerRefs.current[index];\r
    if (!layer) return;\r
    layer.setAttribute('data-visible', String(visible));\r
    layer.style.clipPath = clip || '';\r
  };\r
\r
  const finish = () => {\r
    const engine = engineRef.current;\r
    if (!engine) return;\r
    engine.running = false;\r
    rootRef.current?.removeAttribute('data-swapping');\r
    if (engine.mode === 'intro') {\r
      setLayer(0, !shownRef.current, '');\r
      engine.mode = 'swap';\r
      if (desiredRef.current !== shownRef.current) requestRef.current(desiredRef.current, pointRef.current);\r
      return;\r
    }\r
    const target = engine.desired === 1;\r
    setLayer(1, target, '');\r
    setLayer(0, !target, '');\r
    shownRef.current = target;\r
    setShown(target);\r
    settingsRef.current.onComplete?.(target);\r
  };\r
\r
  const frame = (now: number) => {\r
    const engine = engineRef.current;\r
    if (!engine) return;\r
    const s = settingsRef.current;\r
    const grid = engine.grid;\r
    const { value, velocity, flipAt, target } = engine;\r
    const elapsed = clamp((now - engine.last) / 1000, 0, 1 / 20);\r
    engine.last = now;\r
    const omega = (Math.PI * 2) / (s.pixelDuration / 1000);\r
    const zeta = clamp(1 - s.bounce, 0.15, 1);\r
    const steps = Math.max(1, Math.ceil(elapsed / STEP));\r
    const dt = elapsed / steps;\r
    const pop = s.pixelScale;\r
    const half = grid.size / 2;\r
    const cover = grid.gap / 2 + 0.5;\r
    let moving = false;\r
    let path = '';\r
\r
    for (let i = 0; i < grid.count; i++) {\r
      if (now >= flipAt[i] && target[i] !== engine.desired) {\r
        target[i] = engine.desired;\r
        if (target[i] === 1 && value[i] < pop) value[i] = pop;\r
      }\r
      let x = value[i];\r
      let v = velocity[i];\r
      const goal = target[i];\r
      for (let n = 0; n < steps; n++) {\r
        v += (-omega * omega * (x - goal) - 2 * zeta * omega * v) * dt;\r
        x += v * dt;\r
      }\r
      if (goal === 0 && x <= pop) {\r
        x = 0;\r
        v = 0;\r
      }\r
      if (Math.abs(x - goal) > 0.001 || Math.abs(v) > 0.01 || now < flipAt[i]) moving = true;\r
      else {\r
        x = goal;\r
        v = 0;\r
      }\r
      value[i] = x;\r
      velocity[i] = v;\r
      if (x <= 0.002) continue;\r
      const size = Math.min(x * 1.08, 1.25) * (half + cover * smoothstep(0.6, 0.93, x));\r
      const radius = Math.min(size, (s.pixelRadius / 50) * size * (1 - smoothstep(0.6, 0.93, x)));\r
      path += pixelPath(grid.cx[i], grid.cy[i], size, radius, s.pixelSpin * (1 - x));\r
    }\r
\r
    const layer = engine.mode === 'intro' ? 0 : 1;\r
    setLayer(layer, path !== '', path ? \`path('\${path}')\` : '');\r
\r
    if (moving) engine.raf = requestAnimationFrame(frame);\r
    else finish();\r
  };\r
\r
  const launch = (mode: Engine['mode'], to: boolean, point: Point | null) => {\r
    const root = rootRef.current;\r
    const s = settingsRef.current;\r
    let engine: Engine | null = engineRef.current;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const width = root?.clientWidth ?? 0;\r
    const height = root?.clientHeight ?? 0;\r
    if (!root || reduce || !width || !height) return false;\r
\r
    const now = performance.now();\r
    if (!engine?.running) {\r
      const grid = buildGrid(width, height, s.pixelSize, s.gap);\r
      const start = mode === 'intro' ? 0 : shownRef.current ? 1 : 0;\r
      engine = {\r
        mode,\r
        grid,\r
        value: new Float32Array(grid.count).fill(start),\r
        velocity: new Float32Array(grid.count),\r
        flipAt: new Float64Array(grid.count),\r
        target: new Uint8Array(grid.count).fill(start),\r
        desired: start,\r
        last: now,\r
        running: true,\r
        raf: engineRef.current?.raf ?? 0\r
      };\r
      engineRef.current = engine;\r
    }\r
    engine.desired = to ? 1 : 0;\r
    const grid = engine.grid;\r
    const orders = new Float32Array(grid.count);\r
    let first = Infinity;\r
    for (let i = 0; i < grid.count; i++) {\r
      orders[i] = orderOf(grid, i, s.pattern, point) * (1 - s.randomness) + hash(i) * s.randomness;\r
      const settled = engine.target[i] === engine.desired && Math.abs(engine.value[i] - engine.desired) < 0.001;\r
      if (!settled) first = Math.min(first, orders[i]);\r
    }\r
    if (first === Infinity) first = 0;\r
    for (let i = 0; i < grid.count; i++) engine.flipAt[i] = now + Math.max(0, orders[i] - first) * s.duration;\r
    root.setAttribute('data-swapping', '');\r
    if (mode === 'swap') setLayer(0, true, '');\r
    cancelAnimationFrame(engine.raf);\r
    engine.raf = requestAnimationFrame(frame);\r
    return true;\r
  };\r
\r
  const request = (to: boolean, point: Point | null) => {\r
    const engine = engineRef.current;\r
    if (waitingRef.current || (engine?.running && engine.mode === 'intro')) return;\r
    if (!engine?.running && shownRef.current === to) return;\r
    if (launch('swap', to, point)) return;\r
    setLayer(1, to, '');\r
    setLayer(0, !to, '');\r
    shownRef.current = to;\r
    setShown(to);\r
    settingsRef.current.onComplete?.(to);\r
  };\r
  const requestRef = useRef(request);\r
  requestRef.current = request;\r
\r
  const ask = (next: boolean, point: Point | null) => {\r
    desiredRef.current = next;\r
    pointRef.current = point;\r
    onActiveChange?.(next);\r
    if (!controlled) request(next, point);\r
  };\r
\r
  const launchRef = useRef(launch);\r
  launchRef.current = launch;\r
\r
  useIsoLayoutEffect(() => {\r
    if (!intro || shownRef.current) return;\r
    const images = [...(layerRefs.current[0]?.querySelectorAll('img') ?? [])].filter(image => !image.complete);\r
    let started = false;\r
    let timer = 0;\r
    const begin = () => {\r
      if (started) return;\r
      started = true;\r
      clearTimeout(timer);\r
      waitingRef.current = false;\r
      if (launchRef.current('intro', true, null)) return;\r
      setLayer(0, true, '');\r
      if (desiredRef.current !== shownRef.current) requestRef.current(desiredRef.current, pointRef.current);\r
    };\r
    setLayer(0, false, '');\r
    if (!images.length) {\r
      begin();\r
      return undefined;\r
    }\r
    waitingRef.current = true;\r
    let left = images.length;\r
    const settle = () => {\r
      left -= 1;\r
      if (left <= 0) begin();\r
    };\r
    images.forEach(image => {\r
      image.addEventListener('load', settle, { once: true });\r
      image.addEventListener('error', settle, { once: true });\r
    });\r
    timer = setTimeout(begin, 3000);\r
    return () => {\r
      started = true;\r
      clearTimeout(timer);\r
      waitingRef.current = false;\r
      images.forEach(image => {\r
        image.removeEventListener('load', settle);\r
        image.removeEventListener('error', settle);\r
      });\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (active === undefined) return;\r
    desiredRef.current = active;\r
    requestRef.current(active, pointRef.current);\r
  }, [active]);\r
\r
  useEffect(\r
    () => () => {\r
      const engine = engineRef.current;\r
      if (!engine) return;\r
      cancelAnimationFrame(engine.raf);\r
      engine.running = false;\r
    },\r
    []\r
  );\r
\r
  const pointOf = (event: ReactMouseEvent<HTMLDivElement>): Point | null => {\r
    const rect = rootRef.current?.getBoundingClientRect();\r
    if (!rect || (event.detail === 0 && event.clientX === 0 && event.clientY === 0)) return null;\r
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };\r
  };\r
\r
  const handlers: HTMLAttributes<HTMLDivElement> = {};\r
  if (trigger === 'hover') {\r
    handlers.onPointerEnter = event => {\r
      if (event.pointerType !== 'touch') ask(true, pointOf(event));\r
    };\r
    handlers.onPointerLeave = event => {\r
      if (event.pointerType !== 'touch') ask(false, pointOf(event));\r
    };\r
    handlers.onClick = event => {\r
      const native = event.nativeEvent;\r
      const touch = 'pointerType' in native && native.pointerType === 'touch';\r
      if (event.detail === 0 || touch) ask(!desiredRef.current, pointOf(event));\r
    };\r
    handlers.onFocus = event => {\r
      if (event.target === event.currentTarget && event.currentTarget.matches(':focus-visible')) ask(true, null);\r
    };\r
    handlers.onBlur = () => ask(false, null);\r
    handlers.tabIndex = 0;\r
  } else if (trigger === 'click') {\r
    handlers.onClick = event => ask(!desiredRef.current, pointOf(event));\r
    handlers.onKeyDown = event => {\r
      if (event.key !== 'Enter' && event.key !== ' ') return;\r
      event.preventDefault();\r
      ask(!desiredRef.current, null);\r
    };\r
    handlers.role = 'button';\r
    handlers.tabIndex = 0;\r
    handlers['aria-pressed'] = shown;\r
  }\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={[ROOT, className].filter(Boolean).join(' ')}\r
      style={{ aspectRatio, ...style }}\r
      data-active={shown ? '' : undefined}\r
      {...handlers}\r
    >\r
      {[firstContent, secondContent].map((content, index) => (\r
        <div\r
          key={index}\r
          ref={element => {\r
            layerRefs.current[index] = element;\r
          }}\r
          className={LAYER}\r
          style={{ zIndex: index }}\r
          data-visible={String(index === (shown ? 1 : 0))}\r
          aria-hidden={index !== (shown ? 1 : 0)}\r
        >\r
          {content}\r
        </div>\r
      ))}\r
    </div>\r
  );\r
}\r
\r
export default PixelSwap;\r
`,i=`'use client';\r
\r
import {\r
  useEffect,\r
  useLayoutEffect,\r
  useRef,\r
  useState,\r
  type CSSProperties,\r
  type HTMLAttributes,\r
  type MouseEvent as ReactMouseEvent,\r
  type ReactNode\r
} from 'react';\r
\r
export interface PixelSwapProps {\r
  firstContent?: ReactNode;\r
  secondContent?: ReactNode;\r
  pattern?:\r
    | 'pointer'\r
    | 'random'\r
    | 'center'\r
    | 'edges'\r
    | 'left-to-right'\r
    | 'right-to-left'\r
    | 'top-to-bottom'\r
    | 'bottom-to-top'\r
    | 'diagonal'\r
    | 'spiral';\r
  pixelSize?: number;\r
  gap?: number;\r
  pixelRadius?: number;\r
  pixelScale?: number;\r
  pixelSpin?: number;\r
  duration?: number;\r
  pixelDuration?: number;\r
  randomness?: number;\r
  bounce?: number;\r
  trigger?: 'hover' | 'click' | 'none';\r
  intro?: boolean;\r
  initialActive?: boolean;\r
  active?: boolean;\r
  onActiveChange?: (active: boolean) => void;\r
  onComplete?: (active: boolean) => void;\r
  aspectRatio?: string;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Point {\r
  x: number;\r
  y: number;\r
}\r
\r
interface Grid {\r
  count: number;\r
  size: number;\r
  stride: number;\r
  gap: number;\r
  width: number;\r
  height: number;\r
  cx: Float32Array;\r
  cy: Float32Array;\r
  gx: Float32Array;\r
  gy: Float32Array;\r
}\r
\r
interface Engine {\r
  mode: 'intro' | 'swap';\r
  grid: Grid;\r
  value: Float32Array;\r
  velocity: Float32Array;\r
  flipAt: Float64Array;\r
  target: Uint8Array;\r
  desired: number;\r
  last: number;\r
  running: boolean;\r
  raf: number;\r
}\r
\r
const MAX_PIXELS = 600;\r
const STEP = 1 / 240;\r
const PATTERNS = [\r
  'pointer',\r
  'random',\r
  'center',\r
  'edges',\r
  'left-to-right',\r
  'right-to-left',\r
  'top-to-bottom',\r
  'bottom-to-top',\r
  'diagonal',\r
  'spiral'\r
];\r
\r
const ROOT =\r
  'relative isolate w-full overflow-hidden outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current';\r
const LAYER = 'absolute inset-0 h-full w-full data-[visible=false]:invisible';\r
\r
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smoothstep = (edge0: number, edge1: number, value: number) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const hash = (index: number) => {\r
  let h = Math.imul(index + 1, 0x27d4eb2d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;\r
};\r
\r
const round = (value: number) => Math.round(value * 10) / 10;\r
\r
const buildGrid = (width: number, height: number, pixelSize: number, gap: number): Grid => {\r
  let size = pixelSize;\r
  let columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));\r
  let rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));\r
  if (columns * rows > MAX_PIXELS) {\r
    size = Math.ceil(size * Math.sqrt((columns * rows) / MAX_PIXELS));\r
    columns = Math.max(1, Math.ceil((width + gap) / (size + gap)));\r
    rows = Math.max(1, Math.ceil((height + gap) / (size + gap)));\r
  }\r
  const stride = size + gap;\r
  const startX = (width - (columns * stride - gap)) / 2;\r
  const startY = (height - (rows * stride - gap)) / 2;\r
  const count = columns * rows;\r
  const cx = new Float32Array(count);\r
  const cy = new Float32Array(count);\r
  const gx = new Float32Array(count);\r
  const gy = new Float32Array(count);\r
  for (let row = 0; row < rows; row++) {\r
    for (let column = 0; column < columns; column++) {\r
      const index = row * columns + column;\r
      cx[index] = startX + column * stride + size / 2;\r
      cy[index] = startY + row * stride + size / 2;\r
      gx[index] = columns > 1 ? column / (columns - 1) : 0.5;\r
      gy[index] = rows > 1 ? row / (rows - 1) : 0.5;\r
    }\r
  }\r
  return { count, size, stride, gap, width, height, cx, cy, gx, gy };\r
};\r
\r
const orderOf = (grid: Grid, index: number, pattern: string, point: Point | null) => {\r
  const x = grid.gx[index];\r
  const y = grid.gy[index];\r
  if (pattern === 'random') return hash(index + 11);\r
  if (pattern === 'center') return Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2;\r
  if (pattern === 'edges') return 1 - Math.min(x, 1 - x, y, 1 - y) * 2;\r
  if (pattern === 'left-to-right') return x;\r
  if (pattern === 'right-to-left') return 1 - x;\r
  if (pattern === 'top-to-bottom') return y;\r
  if (pattern === 'bottom-to-top') return 1 - y;\r
  if (pattern === 'diagonal') return (x + y) / 2;\r
  if (pattern === 'spiral') {\r
    const angle = (Math.atan2(y - 0.5, x - 0.5) + Math.PI) / (Math.PI * 2);\r
    return (angle + Math.hypot(x - 0.5, y - 0.5) / Math.SQRT1_2) / 2;\r
  }\r
  const px = point ? point.x : grid.width / 2;\r
  const py = point ? point.y : grid.height / 2;\r
  const reach = Math.max(\r
    Math.hypot(px, py),\r
    Math.hypot(grid.width - px, py),\r
    Math.hypot(px, grid.height - py),\r
    Math.hypot(grid.width - px, grid.height - py),\r
    1\r
  );\r
  return Math.hypot(grid.cx[index] - px, grid.cy[index] - py) / reach;\r
};\r
\r
const pixelPath = (x: number, y: number, half: number, radius: number, angle: number) => {\r
  if (!angle) {\r
    const x0 = round(x - half);\r
    const x1 = round(x + half);\r
    const y0 = round(y - half);\r
    const y1 = round(y + half);\r
    if (radius < 0.2) return \`M\${x0} \${y0}H\${x1}V\${y1}H\${x0}Z\`;\r
    const r = round(radius);\r
    return \`M\${round(x0 + r)} \${y0}H\${round(x1 - r)}A\${r} \${r} 0 0 1 \${x1} \${round(y0 + r)}V\${round(y1 - r)}A\${r} \${r} 0 0 1 \${round(x1 - r)} \${y1}H\${round(x0 + r)}A\${r} \${r} 0 0 1 \${x0} \${round(y1 - r)}V\${round(y0 + r)}A\${r} \${r} 0 0 1 \${round(x0 + r)} \${y0}Z\`;\r
  }\r
  const cos = Math.cos(angle);\r
  const sin = Math.sin(angle);\r
  const at = (u: number, v: number) => \`\${round(x + u * cos - v * sin)} \${round(y + u * sin + v * cos)}\`;\r
  const h = half;\r
  if (radius < 0.2) return \`M\${at(-h, -h)}L\${at(h, -h)}L\${at(h, h)}L\${at(-h, h)}Z\`;\r
  const r = round(radius);\r
  const k = h - radius;\r
  return \`M\${at(-k, -h)}L\${at(k, -h)}A\${r} \${r} 0 0 1 \${at(h, -k)}L\${at(h, k)}A\${r} \${r} 0 0 1 \${at(k, h)}L\${at(-k, h)}A\${r} \${r} 0 0 1 \${at(-h, k)}L\${at(-h, -k)}A\${r} \${r} 0 0 1 \${at(-k, -h)}Z\`;\r
};\r
\r
function PixelSwap({\r
  firstContent,\r
  secondContent,\r
  pattern = 'pointer',\r
  pixelSize = 48,\r
  gap = 0,\r
  pixelRadius = 0,\r
  pixelScale = 0,\r
  pixelSpin = 0,\r
  duration = 400,\r
  pixelDuration = 350,\r
  randomness = 0.2,\r
  bounce = 0.3,\r
  trigger = 'hover',\r
  intro = true,\r
  initialActive = false,\r
  active,\r
  onActiveChange,\r
  onComplete,\r
  aspectRatio = '16 / 10',\r
  className = '',\r
  style\r
}: PixelSwapProps) {\r
  const controlled = active !== undefined;\r
  const [shown, setShown] = useState(controlled ? active : initialActive);\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);\r
  const shownRef = useRef(shown);\r
  const desiredRef = useRef(shown);\r
  const pointRef = useRef<Point | null>(null);\r
  const engineRef = useRef<Engine | null>(null);\r
  const waitingRef = useRef(false);\r
\r
  const settings = {\r
    pattern: PATTERNS.includes(pattern) ? pattern : 'pointer',\r
    pixelSize: Math.max(8, Math.round(pixelSize)),\r
    gap: Math.max(0, gap),\r
    pixelRadius: clamp(pixelRadius, 0, 50),\r
    pixelScale: clamp(pixelScale, 0, 0.9),\r
    pixelSpin: (clamp(pixelSpin, -360, 360) * Math.PI) / 180,\r
    duration: Math.max(0, duration),\r
    pixelDuration: Math.max(60, pixelDuration),\r
    randomness: clamp(randomness, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    onComplete\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  const setLayer = (index: number, visible: boolean, clip: string) => {\r
    const layer = layerRefs.current[index];\r
    if (!layer) return;\r
    layer.setAttribute('data-visible', String(visible));\r
    layer.style.clipPath = clip || '';\r
  };\r
\r
  const finish = () => {\r
    const engine = engineRef.current;\r
    if (!engine) return;\r
    engine.running = false;\r
    rootRef.current?.removeAttribute('data-swapping');\r
    if (engine.mode === 'intro') {\r
      setLayer(0, !shownRef.current, '');\r
      engine.mode = 'swap';\r
      if (desiredRef.current !== shownRef.current) requestRef.current(desiredRef.current, pointRef.current);\r
      return;\r
    }\r
    const target = engine.desired === 1;\r
    setLayer(1, target, '');\r
    setLayer(0, !target, '');\r
    shownRef.current = target;\r
    setShown(target);\r
    settingsRef.current.onComplete?.(target);\r
  };\r
\r
  const frame = (now: number) => {\r
    const engine = engineRef.current;\r
    if (!engine) return;\r
    const s = settingsRef.current;\r
    const grid = engine.grid;\r
    const { value, velocity, flipAt, target } = engine;\r
    const elapsed = clamp((now - engine.last) / 1000, 0, 1 / 20);\r
    engine.last = now;\r
    const omega = (Math.PI * 2) / (s.pixelDuration / 1000);\r
    const zeta = clamp(1 - s.bounce, 0.15, 1);\r
    const steps = Math.max(1, Math.ceil(elapsed / STEP));\r
    const dt = elapsed / steps;\r
    const pop = s.pixelScale;\r
    const half = grid.size / 2;\r
    const cover = grid.gap / 2 + 0.5;\r
    let moving = false;\r
    let path = '';\r
\r
    for (let i = 0; i < grid.count; i++) {\r
      if (now >= flipAt[i] && target[i] !== engine.desired) {\r
        target[i] = engine.desired;\r
        if (target[i] === 1 && value[i] < pop) value[i] = pop;\r
      }\r
      let x = value[i];\r
      let v = velocity[i];\r
      const goal = target[i];\r
      for (let n = 0; n < steps; n++) {\r
        v += (-omega * omega * (x - goal) - 2 * zeta * omega * v) * dt;\r
        x += v * dt;\r
      }\r
      if (goal === 0 && x <= pop) {\r
        x = 0;\r
        v = 0;\r
      }\r
      if (Math.abs(x - goal) > 0.001 || Math.abs(v) > 0.01 || now < flipAt[i]) moving = true;\r
      else {\r
        x = goal;\r
        v = 0;\r
      }\r
      value[i] = x;\r
      velocity[i] = v;\r
      if (x <= 0.002) continue;\r
      const size = Math.min(x * 1.08, 1.25) * (half + cover * smoothstep(0.6, 0.93, x));\r
      const radius = Math.min(size, (s.pixelRadius / 50) * size * (1 - smoothstep(0.6, 0.93, x)));\r
      path += pixelPath(grid.cx[i], grid.cy[i], size, radius, s.pixelSpin * (1 - x));\r
    }\r
\r
    const layer = engine.mode === 'intro' ? 0 : 1;\r
    setLayer(layer, path !== '', path ? \`path('\${path}')\` : '');\r
\r
    if (moving) engine.raf = requestAnimationFrame(frame);\r
    else finish();\r
  };\r
\r
  const launch = (mode: Engine['mode'], to: boolean, point: Point | null) => {\r
    const root = rootRef.current;\r
    const s = settingsRef.current;\r
    let engine: Engine | null = engineRef.current;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const width = root?.clientWidth ?? 0;\r
    const height = root?.clientHeight ?? 0;\r
    if (!root || reduce || !width || !height) return false;\r
\r
    const now = performance.now();\r
    if (!engine?.running) {\r
      const grid = buildGrid(width, height, s.pixelSize, s.gap);\r
      const start = mode === 'intro' ? 0 : shownRef.current ? 1 : 0;\r
      engine = {\r
        mode,\r
        grid,\r
        value: new Float32Array(grid.count).fill(start),\r
        velocity: new Float32Array(grid.count),\r
        flipAt: new Float64Array(grid.count),\r
        target: new Uint8Array(grid.count).fill(start),\r
        desired: start,\r
        last: now,\r
        running: true,\r
        raf: engineRef.current?.raf ?? 0\r
      };\r
      engineRef.current = engine;\r
    }\r
    engine.desired = to ? 1 : 0;\r
    const grid = engine.grid;\r
    const orders = new Float32Array(grid.count);\r
    let first = Infinity;\r
    for (let i = 0; i < grid.count; i++) {\r
      orders[i] = orderOf(grid, i, s.pattern, point) * (1 - s.randomness) + hash(i) * s.randomness;\r
      const settled = engine.target[i] === engine.desired && Math.abs(engine.value[i] - engine.desired) < 0.001;\r
      if (!settled) first = Math.min(first, orders[i]);\r
    }\r
    if (first === Infinity) first = 0;\r
    for (let i = 0; i < grid.count; i++) engine.flipAt[i] = now + Math.max(0, orders[i] - first) * s.duration;\r
    root.setAttribute('data-swapping', '');\r
    if (mode === 'swap') setLayer(0, true, '');\r
    cancelAnimationFrame(engine.raf);\r
    engine.raf = requestAnimationFrame(frame);\r
    return true;\r
  };\r
\r
  const request = (to: boolean, point: Point | null) => {\r
    const engine = engineRef.current;\r
    if (waitingRef.current || (engine?.running && engine.mode === 'intro')) return;\r
    if (!engine?.running && shownRef.current === to) return;\r
    if (launch('swap', to, point)) return;\r
    setLayer(1, to, '');\r
    setLayer(0, !to, '');\r
    shownRef.current = to;\r
    setShown(to);\r
    settingsRef.current.onComplete?.(to);\r
  };\r
  const requestRef = useRef(request);\r
  requestRef.current = request;\r
\r
  const ask = (next: boolean, point: Point | null) => {\r
    desiredRef.current = next;\r
    pointRef.current = point;\r
    onActiveChange?.(next);\r
    if (!controlled) request(next, point);\r
  };\r
\r
  const launchRef = useRef(launch);\r
  launchRef.current = launch;\r
\r
  useIsoLayoutEffect(() => {\r
    if (!intro || shownRef.current) return;\r
    const images = [...(layerRefs.current[0]?.querySelectorAll('img') ?? [])].filter(image => !image.complete);\r
    let started = false;\r
    let timer = 0;\r
    const begin = () => {\r
      if (started) return;\r
      started = true;\r
      clearTimeout(timer);\r
      waitingRef.current = false;\r
      if (launchRef.current('intro', true, null)) return;\r
      setLayer(0, true, '');\r
      if (desiredRef.current !== shownRef.current) requestRef.current(desiredRef.current, pointRef.current);\r
    };\r
    setLayer(0, false, '');\r
    if (!images.length) {\r
      begin();\r
      return undefined;\r
    }\r
    waitingRef.current = true;\r
    let left = images.length;\r
    const settle = () => {\r
      left -= 1;\r
      if (left <= 0) begin();\r
    };\r
    images.forEach(image => {\r
      image.addEventListener('load', settle, { once: true });\r
      image.addEventListener('error', settle, { once: true });\r
    });\r
    timer = setTimeout(begin, 3000);\r
    return () => {\r
      started = true;\r
      clearTimeout(timer);\r
      waitingRef.current = false;\r
      images.forEach(image => {\r
        image.removeEventListener('load', settle);\r
        image.removeEventListener('error', settle);\r
      });\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (active === undefined) return;\r
    desiredRef.current = active;\r
    requestRef.current(active, pointRef.current);\r
  }, [active]);\r
\r
  useEffect(\r
    () => () => {\r
      const engine = engineRef.current;\r
      if (!engine) return;\r
      cancelAnimationFrame(engine.raf);\r
      engine.running = false;\r
    },\r
    []\r
  );\r
\r
  const pointOf = (event: ReactMouseEvent<HTMLDivElement>): Point | null => {\r
    const rect = rootRef.current?.getBoundingClientRect();\r
    if (!rect || (event.detail === 0 && event.clientX === 0 && event.clientY === 0)) return null;\r
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };\r
  };\r
\r
  const handlers: HTMLAttributes<HTMLDivElement> = {};\r
  if (trigger === 'hover') {\r
    handlers.onPointerEnter = event => {\r
      if (event.pointerType !== 'touch') ask(true, pointOf(event));\r
    };\r
    handlers.onPointerLeave = event => {\r
      if (event.pointerType !== 'touch') ask(false, pointOf(event));\r
    };\r
    handlers.onClick = event => {\r
      const native = event.nativeEvent;\r
      const touch = 'pointerType' in native && native.pointerType === 'touch';\r
      if (event.detail === 0 || touch) ask(!desiredRef.current, pointOf(event));\r
    };\r
    handlers.onFocus = event => {\r
      if (event.target === event.currentTarget && event.currentTarget.matches(':focus-visible')) ask(true, null);\r
    };\r
    handlers.onBlur = () => ask(false, null);\r
    handlers.tabIndex = 0;\r
  } else if (trigger === 'click') {\r
    handlers.onClick = event => ask(!desiredRef.current, pointOf(event));\r
    handlers.onKeyDown = event => {\r
      if (event.key !== 'Enter' && event.key !== ' ') return;\r
      event.preventDefault();\r
      ask(!desiredRef.current, null);\r
    };\r
    handlers.role = 'button';\r
    handlers.tabIndex = 0;\r
    handlers['aria-pressed'] = shown;\r
  }\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={[ROOT, className].filter(Boolean).join(' ')}\r
      style={{ aspectRatio, ...style }}\r
      data-active={shown ? '' : undefined}\r
      {...handlers}\r
    >\r
      {[firstContent, secondContent].map((content, index) => (\r
        <div\r
          key={index}\r
          ref={element => {\r
            layerRefs.current[index] = element;\r
          }}\r
          className={LAYER}\r
          style={{ zIndex: index }}\r
          data-visible={String(index === (shown ? 1 : 0))}\r
          aria-hidden={index !== (shown ? 1 : 0)}\r
        >\r
          {content}\r
        </div>\r
      ))}\r
    </div>\r
  );\r
}\r
\r
export default PixelSwap;\r
`,o={usage:`import PixelSwap from './PixelSwap';

<div style={{ width: 560 }}>
  <PixelSwap
    firstContent={
      <img
        src="/assets/demo/day-sky.webp"
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    }
    secondContent={
      <img
        src="/assets/demo/night-sky.webp"
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    }
    pattern="pointer"
    pixelSize={48}
    pixelRadius={0}
    duration={400}
    pixelDuration={350}
    randomness={0.2}
    bounce={0.3}
    trigger="hover"
    style={{ borderRadius: 18 }}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:i};export{o as pixelSwap};
