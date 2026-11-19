const t=`'use client';\r
\r
import { isValidElement, useEffect, useMemo, useRef, useState } from 'react';\r
\r
import './GridMotion.css';\r
\r
const THEMES = {\r
  dark: {\r
    tile: '#1b1922',\r
    text: 'rgba(255, 255, 255, 0.78)',\r
    border: 'rgba(255, 255, 255, 0.07)'\r
  },\r
  light: {\r
    tile: '#f4f4f5',\r
    text: '#3f3f46',\r
    border: 'rgba(24, 24, 27, 0.08)'\r
  }\r
};\r
\r
const DIRECTIONS = ['alternate', 'left', 'right'];\r
const IMAGE = /^(https?:\\/\\/|\\/\\/|\\/|\\.\\.?\\/|data:image\\/|blob:)|\\.(avif|gif|jpe?g|png|svg|webp)(\\?.*)?$/i;\r
const INERTIA = [0.42, 0.32, 0.26, 0.22];\r
const PACE = [1, 0.86, 1.12, 0.94];\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const wrap = (value, total) => ((value % total) + total) % total;\r
const smoothstep = (edge0, edge1, value) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const feather = (side, zone) => {\r
  const stops = [];\r
  for (let i = 0; i <= 12; i++) {\r
    const t = i / 12;\r
    const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
    stops.push(\`rgba(0, 0, 0, \${alpha.toFixed(4)}) \${(t * zone).toFixed(2)}%\`);\r
  }\r
  const mirrored = stops.map((_, i) => {\r
    const t = (12 - i) / 12;\r
    const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
    return \`rgba(0, 0, 0, \${alpha.toFixed(4)}) \${(100 - t * zone).toFixed(2)}%\`;\r
  });\r
  return \`linear-gradient(\${side}, \${stops.join(', ')}, \${mirrored.join(', ')})\`;\r
};\r
\r
const toTile = item => {\r
  if (item === null || item === undefined || item === false) return { kind: 'empty' };\r
  if (isValidElement(item)) return { kind: 'node', node: item };\r
  if (typeof item === 'object' && 'src' in item && typeof item.src === 'string') {\r
    return { kind: 'image', src: item.src, alt: item.alt ?? '' };\r
  }\r
  const text = String(item).trim();\r
  return IMAGE.test(text) ? { kind: 'image', src: text, alt: '' } : { kind: 'text', text };\r
};\r
\r
const EMPTY = { kind: 'empty' };\r
\r
const Tile = ({ tile }) => (\r
  <div className="grid-motion__tile">\r
    {tile.kind === 'image' && <img src={tile.src} alt={tile.alt} draggable={false} decoding="async" />}\r
    {tile.kind === 'text' && <span className="grid-motion__text">{tile.text}</span>}\r
    {tile.kind === 'node' && tile.node}\r
  </div>\r
);\r
\r
const GridMotion = ({\r
  items = [],\r
  rows = 4,\r
  aspectRatio = 1.33,\r
  gap = 16,\r
  radius = 14,\r
  angle = -12,\r
  tilt = 0,\r
  speed = 24,\r
  direction = 'alternate',\r
  parallax = 0.5,\r
  spotlight = 0.6,\r
  dim = 0.35,\r
  grayscale = false,\r
  fade = 0.5,\r
  tileColor,\r
  textColor,\r
  theme = 'dark',\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const planeRef = useRef(null);\r
  const motionRef = useRef({ offsets: [], shifts: [], intro: 0, pointer: { x: 0, y: 0, active: false } });\r
  const [size, setSize] = useState({ width: 0, height: 0 });\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const settings = {\r
    rows: clamp(Math.round(rows), 1, 12),\r
    aspect: clamp(aspectRatio, 0.3, 4),\r
    gap: Math.max(0, gap),\r
    angle,\r
    tilt: clamp(tilt, 0, 75),\r
    speed,\r
    direction: DIRECTIONS.includes(direction) ? direction : 'alternate',\r
    parallax: clamp(parallax, 0, 1),\r
    spotlight: clamp(spotlight, 0, 1),\r
    dim: clamp(dim, 0, 1),\r
    fade: clamp(fade, 0, 1)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  const layout = useMemo(() => {\r
    const { width, height } = size;\r
    if (!width || !height) return null;\r
    const turn = (settings.angle * Math.PI) / 180;\r
    const lean = (settings.tilt * Math.PI) / 180;\r
    const cos = Math.abs(Math.cos(turn));\r
    const sin = Math.abs(Math.sin(turn));\r
    const planeHeight = ((width * sin + height * cos) / Math.max(0.3, Math.cos(lean))) * 1.12;\r
    const planeWidth = (width * cos + height * sin) * (1 + Math.sin(lean) * 0.9) * 1.12;\r
    const tileHeight = Math.max(16, (planeHeight - settings.gap * (settings.rows - 1)) / settings.rows);\r
    const tileWidth = tileHeight * settings.aspect;\r
    const step = tileWidth + settings.gap;\r
    const perRow = Math.ceil(planeWidth / step) + 1;\r
    const period = perRow * step;\r
    return {\r
      planeWidth,\r
      planeHeight,\r
      tileWidth,\r
      tileHeight,\r
      step,\r
      perRow,\r
      period,\r
      copies: Math.ceil(planeWidth / period) + 2,\r
      top: (planeHeight - settings.rows * tileHeight - (settings.rows - 1) * settings.gap) / 2,\r
      perspective: Math.max(width, height) * 1.5\r
    };\r
  }, [size, settings.angle, settings.tilt, settings.rows, settings.gap, settings.aspect]);\r
\r
  const tiles = useMemo(() => items.map(toTile), [items]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
    const observer = new ResizeObserver(() => {\r
      const width = Math.round(root.clientWidth);\r
      const height = Math.round(root.clientHeight);\r
      setSize(current => (current.width === width && current.height === height ? current : { width, height }));\r
    });\r
    observer.observe(root);\r
    const motion = motionRef.current;\r
    const onMove = event => {\r
      motion.pointer.x = event.clientX;\r
      motion.pointer.y = event.clientY;\r
      motion.pointer.active = true;\r
    };\r
    const onUp = event => {\r
      if (event.pointerType === 'touch') motion.pointer.active = false;\r
    };\r
    const onLeave = () => {\r
      motion.pointer.active = false;\r
    };\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onMove, { passive: true });\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('blur', onLeave);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    return () => {\r
      observer.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onMove);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('blur', onLeave);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const plane = planeRef.current;\r
    if (!root || !plane || !layout) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const motion = motionRef.current;\r
    const rowEls = Array.from(plane.children);\r
    const tileEls = rowEls.map(row => Array.from(row.children));\r
    const spots = tileEls.map(list => new Float32Array(list.length));\r
    const written = tileEls.map(list => new Float32Array(list.length));\r
    let raf = 0;\r
    let last = performance.now();\r
    let visible = true;\r
    let alive = true;\r
    if (motion.intro >= 1) plane.style.opacity = '1';\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
\r
      if (motion.intro < 1) {\r
        motion.intro = Math.min(1, motion.intro + dt / 0.9);\r
        plane.style.opacity = String(1 - (1 - motion.intro) ** 3);\r
      }\r
\r
      const rect = root.getBoundingClientRect();\r
      const scale = rect.width ? root.clientWidth / rect.width : 1;\r
      const halfWidth = root.clientWidth / 2 || 1;\r
      const halfHeight = root.clientHeight / 2 || 1;\r
      const px = (motion.pointer.x - rect.left) * scale - halfWidth;\r
      const py = (motion.pointer.y - rect.top) * scale - halfHeight;\r
      const inside = motion.pointer.active && Math.abs(px) <= halfWidth && Math.abs(py) <= halfHeight;\r
      const lean = (s.tilt * Math.PI) / 180;\r
      const turn = (s.angle * Math.PI) / 180;\r
      const depth = layout.perspective;\r
      let flatY = py;\r
      let flatX = px;\r
      if (lean > 0.0001) {\r
        flatY = (py * depth) / (depth * Math.cos(lean) + py * Math.sin(lean));\r
        flatX = (px * (depth - flatY * Math.sin(lean))) / depth;\r
      }\r
      const planeX = flatX * Math.cos(turn) + flatY * Math.sin(turn);\r
      const planeY = -flatX * Math.sin(turn) + flatY * Math.cos(turn);\r
      const nudge = motion.pointer.active ? clamp(px / halfWidth, -1, 1) : 0;\r
      const reach = (0.6 + 2.2 * s.spotlight) * Math.max(layout.tileWidth, layout.tileHeight);\r
      const settle = 1 - Math.exp(-dt / 0.22);\r
\r
      rowEls.forEach((row, r) => {\r
        const drift = s.direction === 'left' ? -1 : s.direction === 'right' ? 1 : r % 2 ? 1 : -1;\r
        if (motion.offsets[r] === undefined) {\r
          motion.offsets[r] = r * layout.step * 0.37;\r
          motion.shifts[r] = 0;\r
        }\r
        if (!reduce) motion.offsets[r] += s.speed * drift * PACE[r % PACE.length] * dt;\r
        const target = reduce ? 0 : s.parallax * layout.tileWidth * 1.2 * nudge * (r % 2 ? -1 : 1);\r
        motion.shifts[r] += (target - motion.shifts[r]) * (1 - Math.exp(-dt / INERTIA[r % INERTIA.length]));\r
        const x = -layout.period + wrap(motion.offsets[r] + motion.shifts[r], layout.period);\r
        row.style.transform = \`translate3d(\${x.toFixed(2)}px, 0, 0)\`;\r
\r
        const rowY = layout.top + r * (layout.tileHeight + s.gap) + layout.tileHeight / 2 - layout.planeHeight / 2;\r
        const left = x - layout.planeWidth / 2 + layout.tileWidth / 2;\r
        const list = tileEls[r];\r
        const values = spots[r];\r
        const marks = written[r];\r
        for (let k = 0; k < list.length; k++) {\r
          let wanted = 0;\r
          if (inside && s.spotlight > 0) {\r
            const distance = Math.hypot(left + k * layout.step - planeX, rowY - planeY) / reach;\r
            wanted = 1 - smoothstep(0.25, 1, distance);\r
          }\r
          values[k] += (wanted - values[k]) * settle;\r
          if (Math.abs(values[k] - marks[k]) > 0.004 || (wanted === 0 && values[k] < 0.004 && marks[k] !== 0)) {\r
            marks[k] = values[k] < 0.004 ? 0 : values[k];\r
            list[k].style.setProperty('--spot', marks[k].toFixed(3));\r
          }\r
        }\r
      });\r
\r
      if (visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible && !raf) {\r
        last = performance.now();\r
        raf = requestAnimationFrame(frame);\r
      }\r
    });\r
    visibility.observe(root);\r
    raf = requestAnimationFrame(frame);\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      visibility.disconnect();\r
    };\r
  }, [layout, tiles]);\r
\r
  const rowTiles = layout\r
    ? Array.from({ length: settings.rows }, (_, r) =>\r
        Array.from({ length: layout.perRow }, (_, j) =>\r
          tiles.length ? tiles[(r * layout.perRow + j) % tiles.length] : EMPTY\r
        )\r
      )\r
    : [];\r
  const mask =\r
    settings.fade > 0\r
      ? \`\${feather('to right', settings.fade * 34)}, \${feather('to bottom', settings.fade * 44)}\`\r
      : undefined;\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`grid-motion\${grayscale ? ' grid-motion--gray' : ''}\${className ? \` \${className}\` : ''}\`}\r
      style={{\r
        '--gm-tile': tileColor ?? palette.tile,\r
        '--gm-text': textColor ?? palette.text,\r
        '--gm-border': palette.border,\r
        '--gm-radius': \`\${Math.max(0, radius)}px\`,\r
        '--gm-dim': settings.dim,\r
        perspective: layout && settings.tilt > 0 ? \`\${layout.perspective}px\` : undefined,\r
        maskImage: mask,\r
        WebkitMaskImage: mask,\r
        maskComposite: mask ? 'intersect' : undefined,\r
        WebkitMaskComposite: mask ? 'source-in' : undefined,\r
        ...style\r
      }}\r
    >\r
      {layout && (\r
        <div\r
          ref={planeRef}\r
          className="grid-motion__plane"\r
          aria-hidden="true"\r
          style={{\r
            width: layout.planeWidth,\r
            height: layout.planeHeight,\r
            transform: \`translate(-50%, -50%) rotateX(\${settings.tilt}deg) rotateZ(\${settings.angle}deg)\`,\r
            '--gm-gap': \`\${settings.gap}px\`,\r
            '--gm-tile-w': \`\${layout.tileWidth}px\`,\r
            '--gm-tile-h': \`\${layout.tileHeight}px\`,\r
            '--gm-font': \`\${clamp(layout.tileHeight * 0.12, 12, 32)}px\`\r
          }}\r
        >\r
          {rowTiles.map((sequence, r) => (\r
            <div\r
              key={r}\r
              className="grid-motion__row"\r
              style={{ top: layout.top + r * (layout.tileHeight + settings.gap) }}\r
            >\r
              {Array.from({ length: layout.copies * layout.perRow }, (_, k) => (\r
                <Tile key={k} tile={sequence[k % layout.perRow]} />\r
              ))}\r
            </div>\r
          ))}\r
        </div>\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default GridMotion;\r
`,n=`.grid-motion {\r
  position: relative;\r
  isolation: isolate;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.grid-motion__plane {\r
  position: absolute;\r
  top: 50%;\r
  left: 50%;\r
  opacity: 0;\r
}\r
\r
.grid-motion__row {\r
  position: absolute;\r
  left: 0;\r
  display: flex;\r
  gap: var(--gm-gap);\r
  will-change: transform;\r
}\r
\r
.grid-motion__tile {\r
  position: relative;\r
  display: flex;\r
  flex: none;\r
  align-items: center;\r
  justify-content: center;\r
  width: var(--gm-tile-w);\r
  height: var(--gm-tile-h);\r
  overflow: hidden;\r
  border-radius: var(--gm-radius);\r
  background: var(--gm-tile);\r
  color: var(--gm-text);\r
  font-size: var(--gm-font);\r
  line-height: 1.2;\r
  text-align: center;\r
  opacity: calc(1 - var(--gm-dim) * (1 - var(--spot, 0)));\r
}\r
\r
.grid-motion__tile::after {\r
  content: '';\r
  position: absolute;\r
  inset: 0;\r
  border-radius: inherit;\r
  box-shadow: inset 0 0 0 1px var(--gm-border);\r
  pointer-events: none;\r
}\r
\r
.grid-motion--gray .grid-motion__tile {\r
  filter: grayscale(calc(1 - var(--spot, 0)));\r
}\r
\r
.grid-motion__tile img {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  object-fit: cover;\r
  pointer-events: none;\r
  user-select: none;\r
}\r
\r
.grid-motion__text {\r
  padding: 0 1em;\r
}\r
`,e=`'use client';\r
\r
import { isValidElement, useEffect, useMemo, useRef, useState } from 'react';\r
\r
const ROOT = 'relative isolate h-full w-full overflow-hidden';\r
const PLANE = 'absolute top-1/2 left-1/2 opacity-0';\r
const ROW = 'absolute left-0 flex gap-[var(--gm-gap)] will-change-transform';\r
const TILE =\r
  "relative flex h-[var(--gm-tile-h)] w-[var(--gm-tile-w)] flex-none items-center justify-center overflow-hidden rounded-[var(--gm-radius)] [background:var(--gm-tile)] text-center text-[length:var(--gm-font)] leading-[1.2] text-[color:var(--gm-text)] opacity-[calc(1_-_var(--gm-dim)_*_(1_-_var(--spot,0)))] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_var(--gm-border)] after:content-['']";\r
const TILE_GRAY = '[filter:grayscale(calc(1_-_var(--spot,0)))]';\r
const IMG = 'pointer-events-none block h-full w-full object-cover select-none';\r
\r
const THEMES = {\r
  dark: {\r
    tile: '#1b1922',\r
    text: 'rgba(255, 255, 255, 0.78)',\r
    border: 'rgba(255, 255, 255, 0.07)'\r
  },\r
  light: {\r
    tile: '#f4f4f5',\r
    text: '#3f3f46',\r
    border: 'rgba(24, 24, 27, 0.08)'\r
  }\r
};\r
\r
const DIRECTIONS = ['alternate', 'left', 'right'];\r
const IMAGE = /^(https?:\\/\\/|\\/\\/|\\/|\\.\\.?\\/|data:image\\/|blob:)|\\.(avif|gif|jpe?g|png|svg|webp)(\\?.*)?$/i;\r
const INERTIA = [0.42, 0.32, 0.26, 0.22];\r
const PACE = [1, 0.86, 1.12, 0.94];\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const wrap = (value, total) => ((value % total) + total) % total;\r
const smoothstep = (edge0, edge1, value) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const feather = (side, zone) => {\r
  const stops = [];\r
  for (let i = 0; i <= 12; i++) {\r
    const t = i / 12;\r
    const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
    stops.push(\`rgba(0, 0, 0, \${alpha.toFixed(4)}) \${(t * zone).toFixed(2)}%\`);\r
  }\r
  const mirrored = stops.map((_, i) => {\r
    const t = (12 - i) / 12;\r
    const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
    return \`rgba(0, 0, 0, \${alpha.toFixed(4)}) \${(100 - t * zone).toFixed(2)}%\`;\r
  });\r
  return \`linear-gradient(\${side}, \${stops.join(', ')}, \${mirrored.join(', ')})\`;\r
};\r
\r
const toTile = item => {\r
  if (item === null || item === undefined || item === false) return { kind: 'empty' };\r
  if (isValidElement(item)) return { kind: 'node', node: item };\r
  if (typeof item === 'object' && 'src' in item && typeof item.src === 'string') {\r
    return { kind: 'image', src: item.src, alt: item.alt ?? '' };\r
  }\r
  const text = String(item).trim();\r
  return IMAGE.test(text) ? { kind: 'image', src: text, alt: '' } : { kind: 'text', text };\r
};\r
\r
const EMPTY = { kind: 'empty' };\r
\r
const Tile = ({ tile, gray }) => (\r
  <div className={gray ? \`\${TILE} \${TILE_GRAY}\` : TILE}>\r
    {tile.kind === 'image' && <img className={IMG} src={tile.src} alt={tile.alt} draggable={false} decoding="async" />}\r
    {tile.kind === 'text' && <span className="px-[1em]">{tile.text}</span>}\r
    {tile.kind === 'node' && tile.node}\r
  </div>\r
);\r
\r
const GridMotion = ({\r
  items = [],\r
  rows = 4,\r
  aspectRatio = 1.33,\r
  gap = 16,\r
  radius = 14,\r
  angle = -12,\r
  tilt = 0,\r
  speed = 24,\r
  direction = 'alternate',\r
  parallax = 0.5,\r
  spotlight = 0.6,\r
  dim = 0.35,\r
  grayscale = false,\r
  fade = 0.5,\r
  tileColor,\r
  textColor,\r
  theme = 'dark',\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const planeRef = useRef(null);\r
  const motionRef = useRef({ offsets: [], shifts: [], intro: 0, pointer: { x: 0, y: 0, active: false } });\r
  const [size, setSize] = useState({ width: 0, height: 0 });\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const settings = {\r
    rows: clamp(Math.round(rows), 1, 12),\r
    aspect: clamp(aspectRatio, 0.3, 4),\r
    gap: Math.max(0, gap),\r
    angle,\r
    tilt: clamp(tilt, 0, 75),\r
    speed,\r
    direction: DIRECTIONS.includes(direction) ? direction : 'alternate',\r
    parallax: clamp(parallax, 0, 1),\r
    spotlight: clamp(spotlight, 0, 1),\r
    dim: clamp(dim, 0, 1),\r
    fade: clamp(fade, 0, 1)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  const layout = useMemo(() => {\r
    const { width, height } = size;\r
    if (!width || !height) return null;\r
    const turn = (settings.angle * Math.PI) / 180;\r
    const lean = (settings.tilt * Math.PI) / 180;\r
    const cos = Math.abs(Math.cos(turn));\r
    const sin = Math.abs(Math.sin(turn));\r
    const planeHeight = ((width * sin + height * cos) / Math.max(0.3, Math.cos(lean))) * 1.12;\r
    const planeWidth = (width * cos + height * sin) * (1 + Math.sin(lean) * 0.9) * 1.12;\r
    const tileHeight = Math.max(16, (planeHeight - settings.gap * (settings.rows - 1)) / settings.rows);\r
    const tileWidth = tileHeight * settings.aspect;\r
    const step = tileWidth + settings.gap;\r
    const perRow = Math.ceil(planeWidth / step) + 1;\r
    const period = perRow * step;\r
    return {\r
      planeWidth,\r
      planeHeight,\r
      tileWidth,\r
      tileHeight,\r
      step,\r
      perRow,\r
      period,\r
      copies: Math.ceil(planeWidth / period) + 2,\r
      top: (planeHeight - settings.rows * tileHeight - (settings.rows - 1) * settings.gap) / 2,\r
      perspective: Math.max(width, height) * 1.5\r
    };\r
  }, [size, settings.angle, settings.tilt, settings.rows, settings.gap, settings.aspect]);\r
\r
  const tiles = useMemo(() => items.map(toTile), [items]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
    const observer = new ResizeObserver(() => {\r
      const width = Math.round(root.clientWidth);\r
      const height = Math.round(root.clientHeight);\r
      setSize(current => (current.width === width && current.height === height ? current : { width, height }));\r
    });\r
    observer.observe(root);\r
    const motion = motionRef.current;\r
    const onMove = event => {\r
      motion.pointer.x = event.clientX;\r
      motion.pointer.y = event.clientY;\r
      motion.pointer.active = true;\r
    };\r
    const onUp = event => {\r
      if (event.pointerType === 'touch') motion.pointer.active = false;\r
    };\r
    const onLeave = () => {\r
      motion.pointer.active = false;\r
    };\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onMove, { passive: true });\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('blur', onLeave);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    return () => {\r
      observer.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onMove);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('blur', onLeave);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const plane = planeRef.current;\r
    if (!root || !plane || !layout) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const motion = motionRef.current;\r
    const rowEls = Array.from(plane.children);\r
    const tileEls = rowEls.map(row => Array.from(row.children));\r
    const spots = tileEls.map(list => new Float32Array(list.length));\r
    const written = tileEls.map(list => new Float32Array(list.length));\r
    let raf = 0;\r
    let last = performance.now();\r
    let visible = true;\r
    let alive = true;\r
    if (motion.intro >= 1) plane.style.opacity = '1';\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
\r
      if (motion.intro < 1) {\r
        motion.intro = Math.min(1, motion.intro + dt / 0.9);\r
        plane.style.opacity = String(1 - (1 - motion.intro) ** 3);\r
      }\r
\r
      const rect = root.getBoundingClientRect();\r
      const scale = rect.width ? root.clientWidth / rect.width : 1;\r
      const halfWidth = root.clientWidth / 2 || 1;\r
      const halfHeight = root.clientHeight / 2 || 1;\r
      const px = (motion.pointer.x - rect.left) * scale - halfWidth;\r
      const py = (motion.pointer.y - rect.top) * scale - halfHeight;\r
      const inside = motion.pointer.active && Math.abs(px) <= halfWidth && Math.abs(py) <= halfHeight;\r
      const lean = (s.tilt * Math.PI) / 180;\r
      const turn = (s.angle * Math.PI) / 180;\r
      const depth = layout.perspective;\r
      let flatY = py;\r
      let flatX = px;\r
      if (lean > 0.0001) {\r
        flatY = (py * depth) / (depth * Math.cos(lean) + py * Math.sin(lean));\r
        flatX = (px * (depth - flatY * Math.sin(lean))) / depth;\r
      }\r
      const planeX = flatX * Math.cos(turn) + flatY * Math.sin(turn);\r
      const planeY = -flatX * Math.sin(turn) + flatY * Math.cos(turn);\r
      const nudge = motion.pointer.active ? clamp(px / halfWidth, -1, 1) : 0;\r
      const reach = (0.6 + 2.2 * s.spotlight) * Math.max(layout.tileWidth, layout.tileHeight);\r
      const settle = 1 - Math.exp(-dt / 0.22);\r
\r
      rowEls.forEach((row, r) => {\r
        const drift = s.direction === 'left' ? -1 : s.direction === 'right' ? 1 : r % 2 ? 1 : -1;\r
        if (motion.offsets[r] === undefined) {\r
          motion.offsets[r] = r * layout.step * 0.37;\r
          motion.shifts[r] = 0;\r
        }\r
        if (!reduce) motion.offsets[r] += s.speed * drift * PACE[r % PACE.length] * dt;\r
        const target = reduce ? 0 : s.parallax * layout.tileWidth * 1.2 * nudge * (r % 2 ? -1 : 1);\r
        motion.shifts[r] += (target - motion.shifts[r]) * (1 - Math.exp(-dt / INERTIA[r % INERTIA.length]));\r
        const x = -layout.period + wrap(motion.offsets[r] + motion.shifts[r], layout.period);\r
        row.style.transform = \`translate3d(\${x.toFixed(2)}px, 0, 0)\`;\r
\r
        const rowY = layout.top + r * (layout.tileHeight + s.gap) + layout.tileHeight / 2 - layout.planeHeight / 2;\r
        const left = x - layout.planeWidth / 2 + layout.tileWidth / 2;\r
        const list = tileEls[r];\r
        const values = spots[r];\r
        const marks = written[r];\r
        for (let k = 0; k < list.length; k++) {\r
          let wanted = 0;\r
          if (inside && s.spotlight > 0) {\r
            const distance = Math.hypot(left + k * layout.step - planeX, rowY - planeY) / reach;\r
            wanted = 1 - smoothstep(0.25, 1, distance);\r
          }\r
          values[k] += (wanted - values[k]) * settle;\r
          if (Math.abs(values[k] - marks[k]) > 0.004 || (wanted === 0 && values[k] < 0.004 && marks[k] !== 0)) {\r
            marks[k] = values[k] < 0.004 ? 0 : values[k];\r
            list[k].style.setProperty('--spot', marks[k].toFixed(3));\r
          }\r
        }\r
      });\r
\r
      if (visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible && !raf) {\r
        last = performance.now();\r
        raf = requestAnimationFrame(frame);\r
      }\r
    });\r
    visibility.observe(root);\r
    raf = requestAnimationFrame(frame);\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      visibility.disconnect();\r
    };\r
  }, [layout, tiles]);\r
\r
  const rowTiles = layout\r
    ? Array.from({ length: settings.rows }, (_, r) =>\r
        Array.from({ length: layout.perRow }, (_, j) =>\r
          tiles.length ? tiles[(r * layout.perRow + j) % tiles.length] : EMPTY\r
        )\r
      )\r
    : [];\r
  const mask =\r
    settings.fade > 0\r
      ? \`\${feather('to right', settings.fade * 34)}, \${feather('to bottom', settings.fade * 44)}\`\r
      : undefined;\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`}\r
      style={{\r
        '--gm-tile': tileColor ?? palette.tile,\r
        '--gm-text': textColor ?? palette.text,\r
        '--gm-border': palette.border,\r
        '--gm-radius': \`\${Math.max(0, radius)}px\`,\r
        '--gm-dim': settings.dim,\r
        perspective: layout && settings.tilt > 0 ? \`\${layout.perspective}px\` : undefined,\r
        maskImage: mask,\r
        WebkitMaskImage: mask,\r
        maskComposite: mask ? 'intersect' : undefined,\r
        WebkitMaskComposite: mask ? 'source-in' : undefined,\r
        ...style\r
      }}\r
    >\r
      {layout && (\r
        <div\r
          ref={planeRef}\r
          className={PLANE}\r
          aria-hidden="true"\r
          style={{\r
            width: layout.planeWidth,\r
            height: layout.planeHeight,\r
            transform: \`translate(-50%, -50%) rotateX(\${settings.tilt}deg) rotateZ(\${settings.angle}deg)\`,\r
            '--gm-gap': \`\${settings.gap}px\`,\r
            '--gm-tile-w': \`\${layout.tileWidth}px\`,\r
            '--gm-tile-h': \`\${layout.tileHeight}px\`,\r
            '--gm-font': \`\${clamp(layout.tileHeight * 0.12, 12, 32)}px\`\r
          }}\r
        >\r
          {rowTiles.map((sequence, r) => (\r
            <div key={r} className={ROW} style={{ top: layout.top + r * (layout.tileHeight + settings.gap) }}>\r
              {Array.from({ length: layout.copies * layout.perRow }, (_, k) => (\r
                <Tile key={k} tile={sequence[k % layout.perRow]} gray={grayscale} />\r
              ))}\r
            </div>\r
          ))}\r
        </div>\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default GridMotion;\r
`,r=`'use client';\r
\r
import React, { isValidElement, useEffect, useMemo, useRef, useState } from 'react';\r
\r
import './GridMotion.css';\r
\r
export type GridMotionItem = React.ReactNode | { src: string; alt?: string };\r
\r
export type GridMotionDirection = 'alternate' | 'left' | 'right';\r
\r
export type GridMotionProps = {\r
  items?: GridMotionItem[];\r
  rows?: number;\r
  aspectRatio?: number;\r
  gap?: number;\r
  radius?: number;\r
  angle?: number;\r
  tilt?: number;\r
  speed?: number;\r
  direction?: GridMotionDirection;\r
  parallax?: number;\r
  spotlight?: number;\r
  dim?: number;\r
  grayscale?: boolean;\r
  fade?: number;\r
  tileColor?: string;\r
  textColor?: string;\r
  theme?: 'dark' | 'light';\r
  className?: string;\r
  style?: React.CSSProperties;\r
};\r
\r
type TileData =\r
  | { kind: 'empty' }\r
  | { kind: 'node'; node: React.ReactNode }\r
  | { kind: 'image'; src: string; alt: string }\r
  | { kind: 'text'; text: string };\r
\r
type Motion = {\r
  offsets: number[];\r
  shifts: number[];\r
  intro: number;\r
  pointer: { x: number; y: number; active: boolean };\r
};\r
\r
const THEMES = {\r
  dark: {\r
    tile: '#1b1922',\r
    text: 'rgba(255, 255, 255, 0.78)',\r
    border: 'rgba(255, 255, 255, 0.07)'\r
  },\r
  light: {\r
    tile: '#f4f4f5',\r
    text: '#3f3f46',\r
    border: 'rgba(24, 24, 27, 0.08)'\r
  }\r
};\r
\r
const DIRECTIONS: GridMotionDirection[] = ['alternate', 'left', 'right'];\r
const IMAGE = /^(https?:\\/\\/|\\/\\/|\\/|\\.\\.?\\/|data:image\\/|blob:)|\\.(avif|gif|jpe?g|png|svg|webp)(\\?.*)?$/i;\r
const INERTIA = [0.42, 0.32, 0.26, 0.22];\r
const PACE = [1, 0.86, 1.12, 0.94];\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const wrap = (value: number, total: number) => ((value % total) + total) % total;\r
const smoothstep = (edge0: number, edge1: number, value: number) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const feather = (side: string, zone: number) => {\r
  const stops: string[] = [];\r
  for (let i = 0; i <= 12; i++) {\r
    const t = i / 12;\r
    const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
    stops.push(\`rgba(0, 0, 0, \${alpha.toFixed(4)}) \${(t * zone).toFixed(2)}%\`);\r
  }\r
  const mirrored = stops.map((_, i) => {\r
    const t = (12 - i) / 12;\r
    const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
    return \`rgba(0, 0, 0, \${alpha.toFixed(4)}) \${(100 - t * zone).toFixed(2)}%\`;\r
  });\r
  return \`linear-gradient(\${side}, \${stops.join(', ')}, \${mirrored.join(', ')})\`;\r
};\r
\r
const toTile = (item: GridMotionItem): TileData => {\r
  if (item === null || item === undefined || item === false) return { kind: 'empty' };\r
  if (isValidElement(item)) return { kind: 'node', node: item };\r
  if (typeof item === 'object' && 'src' in item && typeof item.src === 'string') {\r
    return { kind: 'image', src: item.src, alt: item.alt ?? '' };\r
  }\r
  const text = String(item).trim();\r
  return IMAGE.test(text) ? { kind: 'image', src: text, alt: '' } : { kind: 'text', text };\r
};\r
\r
const EMPTY: TileData = { kind: 'empty' };\r
\r
const Tile = ({ tile }: { tile: TileData }) => (\r
  <div className="grid-motion__tile">\r
    {tile.kind === 'image' && <img src={tile.src} alt={tile.alt} draggable={false} decoding="async" />}\r
    {tile.kind === 'text' && <span className="grid-motion__text">{tile.text}</span>}\r
    {tile.kind === 'node' && tile.node}\r
  </div>\r
);\r
\r
const GridMotion = ({\r
  items = [],\r
  rows = 4,\r
  aspectRatio = 1.33,\r
  gap = 16,\r
  radius = 14,\r
  angle = -12,\r
  tilt = 0,\r
  speed = 24,\r
  direction = 'alternate',\r
  parallax = 0.5,\r
  spotlight = 0.6,\r
  dim = 0.35,\r
  grayscale = false,\r
  fade = 0.5,\r
  tileColor,\r
  textColor,\r
  theme = 'dark',\r
  className = '',\r
  style\r
}: GridMotionProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const planeRef = useRef<HTMLDivElement>(null);\r
  const motionRef = useRef<Motion>({ offsets: [], shifts: [], intro: 0, pointer: { x: 0, y: 0, active: false } });\r
  const [size, setSize] = useState({ width: 0, height: 0 });\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const settings = {\r
    rows: clamp(Math.round(rows), 1, 12),\r
    aspect: clamp(aspectRatio, 0.3, 4),\r
    gap: Math.max(0, gap),\r
    angle,\r
    tilt: clamp(tilt, 0, 75),\r
    speed,\r
    direction: DIRECTIONS.includes(direction) ? direction : 'alternate',\r
    parallax: clamp(parallax, 0, 1),\r
    spotlight: clamp(spotlight, 0, 1),\r
    dim: clamp(dim, 0, 1),\r
    fade: clamp(fade, 0, 1)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  const layout = useMemo(() => {\r
    const { width, height } = size;\r
    if (!width || !height) return null;\r
    const turn = (settings.angle * Math.PI) / 180;\r
    const lean = (settings.tilt * Math.PI) / 180;\r
    const cos = Math.abs(Math.cos(turn));\r
    const sin = Math.abs(Math.sin(turn));\r
    const planeHeight = ((width * sin + height * cos) / Math.max(0.3, Math.cos(lean))) * 1.12;\r
    const planeWidth = (width * cos + height * sin) * (1 + Math.sin(lean) * 0.9) * 1.12;\r
    const tileHeight = Math.max(16, (planeHeight - settings.gap * (settings.rows - 1)) / settings.rows);\r
    const tileWidth = tileHeight * settings.aspect;\r
    const step = tileWidth + settings.gap;\r
    const perRow = Math.ceil(planeWidth / step) + 1;\r
    const period = perRow * step;\r
    return {\r
      planeWidth,\r
      planeHeight,\r
      tileWidth,\r
      tileHeight,\r
      step,\r
      perRow,\r
      period,\r
      copies: Math.ceil(planeWidth / period) + 2,\r
      top: (planeHeight - settings.rows * tileHeight - (settings.rows - 1) * settings.gap) / 2,\r
      perspective: Math.max(width, height) * 1.5\r
    };\r
  }, [size, settings.angle, settings.tilt, settings.rows, settings.gap, settings.aspect]);\r
\r
  const tiles = useMemo(() => items.map(toTile), [items]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
    const observer = new ResizeObserver(() => {\r
      const width = Math.round(root.clientWidth);\r
      const height = Math.round(root.clientHeight);\r
      setSize(current => (current.width === width && current.height === height ? current : { width, height }));\r
    });\r
    observer.observe(root);\r
    const motion = motionRef.current;\r
    const onMove = (event: PointerEvent) => {\r
      motion.pointer.x = event.clientX;\r
      motion.pointer.y = event.clientY;\r
      motion.pointer.active = true;\r
    };\r
    const onUp = (event: PointerEvent) => {\r
      if (event.pointerType === 'touch') motion.pointer.active = false;\r
    };\r
    const onLeave = () => {\r
      motion.pointer.active = false;\r
    };\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onMove, { passive: true });\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('blur', onLeave);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    return () => {\r
      observer.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onMove);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('blur', onLeave);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const plane = planeRef.current;\r
    if (!root || !plane || !layout) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const motion = motionRef.current;\r
    const rowEls = Array.from(plane.children) as HTMLElement[];\r
    const tileEls = rowEls.map(row => Array.from(row.children) as HTMLElement[]);\r
    const spots = tileEls.map(list => new Float32Array(list.length));\r
    const written = tileEls.map(list => new Float32Array(list.length));\r
    let raf = 0;\r
    let last = performance.now();\r
    let visible = true;\r
    let alive = true;\r
    if (motion.intro >= 1) plane.style.opacity = '1';\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
\r
      if (motion.intro < 1) {\r
        motion.intro = Math.min(1, motion.intro + dt / 0.9);\r
        plane.style.opacity = String(1 - (1 - motion.intro) ** 3);\r
      }\r
\r
      const rect = root.getBoundingClientRect();\r
      const scale = rect.width ? root.clientWidth / rect.width : 1;\r
      const halfWidth = root.clientWidth / 2 || 1;\r
      const halfHeight = root.clientHeight / 2 || 1;\r
      const px = (motion.pointer.x - rect.left) * scale - halfWidth;\r
      const py = (motion.pointer.y - rect.top) * scale - halfHeight;\r
      const inside = motion.pointer.active && Math.abs(px) <= halfWidth && Math.abs(py) <= halfHeight;\r
      const lean = (s.tilt * Math.PI) / 180;\r
      const turn = (s.angle * Math.PI) / 180;\r
      const depth = layout.perspective;\r
      let flatY = py;\r
      let flatX = px;\r
      if (lean > 0.0001) {\r
        flatY = (py * depth) / (depth * Math.cos(lean) + py * Math.sin(lean));\r
        flatX = (px * (depth - flatY * Math.sin(lean))) / depth;\r
      }\r
      const planeX = flatX * Math.cos(turn) + flatY * Math.sin(turn);\r
      const planeY = -flatX * Math.sin(turn) + flatY * Math.cos(turn);\r
      const nudge = motion.pointer.active ? clamp(px / halfWidth, -1, 1) : 0;\r
      const reach = (0.6 + 2.2 * s.spotlight) * Math.max(layout.tileWidth, layout.tileHeight);\r
      const settle = 1 - Math.exp(-dt / 0.22);\r
\r
      rowEls.forEach((row, r) => {\r
        const drift = s.direction === 'left' ? -1 : s.direction === 'right' ? 1 : r % 2 ? 1 : -1;\r
        if (motion.offsets[r] === undefined) {\r
          motion.offsets[r] = r * layout.step * 0.37;\r
          motion.shifts[r] = 0;\r
        }\r
        if (!reduce) motion.offsets[r] += s.speed * drift * PACE[r % PACE.length] * dt;\r
        const target = reduce ? 0 : s.parallax * layout.tileWidth * 1.2 * nudge * (r % 2 ? -1 : 1);\r
        motion.shifts[r] += (target - motion.shifts[r]) * (1 - Math.exp(-dt / INERTIA[r % INERTIA.length]));\r
        const x = -layout.period + wrap(motion.offsets[r] + motion.shifts[r], layout.period);\r
        row.style.transform = \`translate3d(\${x.toFixed(2)}px, 0, 0)\`;\r
\r
        const rowY = layout.top + r * (layout.tileHeight + s.gap) + layout.tileHeight / 2 - layout.planeHeight / 2;\r
        const left = x - layout.planeWidth / 2 + layout.tileWidth / 2;\r
        const list = tileEls[r];\r
        const values = spots[r];\r
        const marks = written[r];\r
        for (let k = 0; k < list.length; k++) {\r
          let wanted = 0;\r
          if (inside && s.spotlight > 0) {\r
            const distance = Math.hypot(left + k * layout.step - planeX, rowY - planeY) / reach;\r
            wanted = 1 - smoothstep(0.25, 1, distance);\r
          }\r
          values[k] += (wanted - values[k]) * settle;\r
          if (Math.abs(values[k] - marks[k]) > 0.004 || (wanted === 0 && values[k] < 0.004 && marks[k] !== 0)) {\r
            marks[k] = values[k] < 0.004 ? 0 : values[k];\r
            list[k].style.setProperty('--spot', marks[k].toFixed(3));\r
          }\r
        }\r
      });\r
\r
      if (visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible && !raf) {\r
        last = performance.now();\r
        raf = requestAnimationFrame(frame);\r
      }\r
    });\r
    visibility.observe(root);\r
    raf = requestAnimationFrame(frame);\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      visibility.disconnect();\r
    };\r
  }, [layout, tiles]);\r
\r
  const rowTiles = layout\r
    ? Array.from({ length: settings.rows }, (_, r) =>\r
        Array.from({ length: layout.perRow }, (_, j) =>\r
          tiles.length ? tiles[(r * layout.perRow + j) % tiles.length] : EMPTY\r
        )\r
      )\r
    : [];\r
  const mask =\r
    settings.fade > 0\r
      ? \`\${feather('to right', settings.fade * 34)}, \${feather('to bottom', settings.fade * 44)}\`\r
      : undefined;\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`grid-motion\${grayscale ? ' grid-motion--gray' : ''}\${className ? \` \${className}\` : ''}\`}\r
      style={\r
        {\r
          '--gm-tile': tileColor ?? palette.tile,\r
          '--gm-text': textColor ?? palette.text,\r
          '--gm-border': palette.border,\r
          '--gm-radius': \`\${Math.max(0, radius)}px\`,\r
          '--gm-dim': settings.dim,\r
          perspective: layout && settings.tilt > 0 ? \`\${layout.perspective}px\` : undefined,\r
          maskImage: mask,\r
          WebkitMaskImage: mask,\r
          maskComposite: mask ? 'intersect' : undefined,\r
          WebkitMaskComposite: mask ? 'source-in' : undefined,\r
          ...style\r
        } as React.CSSProperties\r
      }\r
    >\r
      {layout && (\r
        <div\r
          ref={planeRef}\r
          className="grid-motion__plane"\r
          aria-hidden="true"\r
          style={\r
            {\r
              width: layout.planeWidth,\r
              height: layout.planeHeight,\r
              transform: \`translate(-50%, -50%) rotateX(\${settings.tilt}deg) rotateZ(\${settings.angle}deg)\`,\r
              '--gm-gap': \`\${settings.gap}px\`,\r
              '--gm-tile-w': \`\${layout.tileWidth}px\`,\r
              '--gm-tile-h': \`\${layout.tileHeight}px\`,\r
              '--gm-font': \`\${clamp(layout.tileHeight * 0.12, 12, 32)}px\`\r
            } as React.CSSProperties\r
          }\r
        >\r
          {rowTiles.map((sequence, r) => (\r
            <div\r
              key={r}\r
              className="grid-motion__row"\r
              style={{ top: layout.top + r * (layout.tileHeight + settings.gap) }}\r
            >\r
              {Array.from({ length: layout.copies * layout.perRow }, (_, k) => (\r
                <Tile key={k} tile={sequence[k % layout.perRow]} />\r
              ))}\r
            </div>\r
          ))}\r
        </div>\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default GridMotion;\r
`,i=`'use client';\r
\r
import React, { isValidElement, useEffect, useMemo, useRef, useState } from 'react';\r
\r
export type GridMotionItem = React.ReactNode | { src: string; alt?: string };\r
\r
export type GridMotionDirection = 'alternate' | 'left' | 'right';\r
\r
export type GridMotionProps = {\r
  items?: GridMotionItem[];\r
  rows?: number;\r
  aspectRatio?: number;\r
  gap?: number;\r
  radius?: number;\r
  angle?: number;\r
  tilt?: number;\r
  speed?: number;\r
  direction?: GridMotionDirection;\r
  parallax?: number;\r
  spotlight?: number;\r
  dim?: number;\r
  grayscale?: boolean;\r
  fade?: number;\r
  tileColor?: string;\r
  textColor?: string;\r
  theme?: 'dark' | 'light';\r
  className?: string;\r
  style?: React.CSSProperties;\r
};\r
\r
type TileData =\r
  | { kind: 'empty' }\r
  | { kind: 'node'; node: React.ReactNode }\r
  | { kind: 'image'; src: string; alt: string }\r
  | { kind: 'text'; text: string };\r
\r
type Motion = {\r
  offsets: number[];\r
  shifts: number[];\r
  intro: number;\r
  pointer: { x: number; y: number; active: boolean };\r
};\r
\r
const ROOT = 'relative isolate h-full w-full overflow-hidden';\r
const PLANE = 'absolute top-1/2 left-1/2 opacity-0';\r
const ROW = 'absolute left-0 flex gap-[var(--gm-gap)] will-change-transform';\r
const TILE =\r
  "relative flex h-[var(--gm-tile-h)] w-[var(--gm-tile-w)] flex-none items-center justify-center overflow-hidden rounded-[var(--gm-radius)] [background:var(--gm-tile)] text-center text-[length:var(--gm-font)] leading-[1.2] text-[color:var(--gm-text)] opacity-[calc(1_-_var(--gm-dim)_*_(1_-_var(--spot,0)))] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_var(--gm-border)] after:content-['']";\r
const TILE_GRAY = '[filter:grayscale(calc(1_-_var(--spot,0)))]';\r
const IMG = 'pointer-events-none block h-full w-full object-cover select-none';\r
\r
const THEMES = {\r
  dark: {\r
    tile: '#1b1922',\r
    text: 'rgba(255, 255, 255, 0.78)',\r
    border: 'rgba(255, 255, 255, 0.07)'\r
  },\r
  light: {\r
    tile: '#f4f4f5',\r
    text: '#3f3f46',\r
    border: 'rgba(24, 24, 27, 0.08)'\r
  }\r
};\r
\r
const DIRECTIONS: GridMotionDirection[] = ['alternate', 'left', 'right'];\r
const IMAGE = /^(https?:\\/\\/|\\/\\/|\\/|\\.\\.?\\/|data:image\\/|blob:)|\\.(avif|gif|jpe?g|png|svg|webp)(\\?.*)?$/i;\r
const INERTIA = [0.42, 0.32, 0.26, 0.22];\r
const PACE = [1, 0.86, 1.12, 0.94];\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const wrap = (value: number, total: number) => ((value % total) + total) % total;\r
const smoothstep = (edge0: number, edge1: number, value: number) => {\r
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const feather = (side: string, zone: number) => {\r
  const stops: string[] = [];\r
  for (let i = 0; i <= 12; i++) {\r
    const t = i / 12;\r
    const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
    stops.push(\`rgba(0, 0, 0, \${alpha.toFixed(4)}) \${(t * zone).toFixed(2)}%\`);\r
  }\r
  const mirrored = stops.map((_, i) => {\r
    const t = (12 - i) / 12;\r
    const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
    return \`rgba(0, 0, 0, \${alpha.toFixed(4)}) \${(100 - t * zone).toFixed(2)}%\`;\r
  });\r
  return \`linear-gradient(\${side}, \${stops.join(', ')}, \${mirrored.join(', ')})\`;\r
};\r
\r
const toTile = (item: GridMotionItem): TileData => {\r
  if (item === null || item === undefined || item === false) return { kind: 'empty' };\r
  if (isValidElement(item)) return { kind: 'node', node: item };\r
  if (typeof item === 'object' && 'src' in item && typeof item.src === 'string') {\r
    return { kind: 'image', src: item.src, alt: item.alt ?? '' };\r
  }\r
  const text = String(item).trim();\r
  return IMAGE.test(text) ? { kind: 'image', src: text, alt: '' } : { kind: 'text', text };\r
};\r
\r
const EMPTY: TileData = { kind: 'empty' };\r
\r
const Tile = ({ tile, gray }: { tile: TileData; gray: boolean }) => (\r
  <div className={gray ? \`\${TILE} \${TILE_GRAY}\` : TILE}>\r
    {tile.kind === 'image' && <img className={IMG} src={tile.src} alt={tile.alt} draggable={false} decoding="async" />}\r
    {tile.kind === 'text' && <span className="px-[1em]">{tile.text}</span>}\r
    {tile.kind === 'node' && tile.node}\r
  </div>\r
);\r
\r
const GridMotion = ({\r
  items = [],\r
  rows = 4,\r
  aspectRatio = 1.33,\r
  gap = 16,\r
  radius = 14,\r
  angle = -12,\r
  tilt = 0,\r
  speed = 24,\r
  direction = 'alternate',\r
  parallax = 0.5,\r
  spotlight = 0.6,\r
  dim = 0.35,\r
  grayscale = false,\r
  fade = 0.5,\r
  tileColor,\r
  textColor,\r
  theme = 'dark',\r
  className = '',\r
  style\r
}: GridMotionProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const planeRef = useRef<HTMLDivElement>(null);\r
  const motionRef = useRef<Motion>({ offsets: [], shifts: [], intro: 0, pointer: { x: 0, y: 0, active: false } });\r
  const [size, setSize] = useState({ width: 0, height: 0 });\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const settings = {\r
    rows: clamp(Math.round(rows), 1, 12),\r
    aspect: clamp(aspectRatio, 0.3, 4),\r
    gap: Math.max(0, gap),\r
    angle,\r
    tilt: clamp(tilt, 0, 75),\r
    speed,\r
    direction: DIRECTIONS.includes(direction) ? direction : 'alternate',\r
    parallax: clamp(parallax, 0, 1),\r
    spotlight: clamp(spotlight, 0, 1),\r
    dim: clamp(dim, 0, 1),\r
    fade: clamp(fade, 0, 1)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  const layout = useMemo(() => {\r
    const { width, height } = size;\r
    if (!width || !height) return null;\r
    const turn = (settings.angle * Math.PI) / 180;\r
    const lean = (settings.tilt * Math.PI) / 180;\r
    const cos = Math.abs(Math.cos(turn));\r
    const sin = Math.abs(Math.sin(turn));\r
    const planeHeight = ((width * sin + height * cos) / Math.max(0.3, Math.cos(lean))) * 1.12;\r
    const planeWidth = (width * cos + height * sin) * (1 + Math.sin(lean) * 0.9) * 1.12;\r
    const tileHeight = Math.max(16, (planeHeight - settings.gap * (settings.rows - 1)) / settings.rows);\r
    const tileWidth = tileHeight * settings.aspect;\r
    const step = tileWidth + settings.gap;\r
    const perRow = Math.ceil(planeWidth / step) + 1;\r
    const period = perRow * step;\r
    return {\r
      planeWidth,\r
      planeHeight,\r
      tileWidth,\r
      tileHeight,\r
      step,\r
      perRow,\r
      period,\r
      copies: Math.ceil(planeWidth / period) + 2,\r
      top: (planeHeight - settings.rows * tileHeight - (settings.rows - 1) * settings.gap) / 2,\r
      perspective: Math.max(width, height) * 1.5\r
    };\r
  }, [size, settings.angle, settings.tilt, settings.rows, settings.gap, settings.aspect]);\r
\r
  const tiles = useMemo(() => items.map(toTile), [items]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
    const observer = new ResizeObserver(() => {\r
      const width = Math.round(root.clientWidth);\r
      const height = Math.round(root.clientHeight);\r
      setSize(current => (current.width === width && current.height === height ? current : { width, height }));\r
    });\r
    observer.observe(root);\r
    const motion = motionRef.current;\r
    const onMove = (event: PointerEvent) => {\r
      motion.pointer.x = event.clientX;\r
      motion.pointer.y = event.clientY;\r
      motion.pointer.active = true;\r
    };\r
    const onUp = (event: PointerEvent) => {\r
      if (event.pointerType === 'touch') motion.pointer.active = false;\r
    };\r
    const onLeave = () => {\r
      motion.pointer.active = false;\r
    };\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onMove, { passive: true });\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('blur', onLeave);\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    return () => {\r
      observer.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onMove);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('blur', onLeave);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const plane = planeRef.current;\r
    if (!root || !plane || !layout) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const motion = motionRef.current;\r
    const rowEls = Array.from(plane.children) as HTMLElement[];\r
    const tileEls = rowEls.map(row => Array.from(row.children) as HTMLElement[]);\r
    const spots = tileEls.map(list => new Float32Array(list.length));\r
    const written = tileEls.map(list => new Float32Array(list.length));\r
    let raf = 0;\r
    let last = performance.now();\r
    let visible = true;\r
    let alive = true;\r
    if (motion.intro >= 1) plane.style.opacity = '1';\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
\r
      if (motion.intro < 1) {\r
        motion.intro = Math.min(1, motion.intro + dt / 0.9);\r
        plane.style.opacity = String(1 - (1 - motion.intro) ** 3);\r
      }\r
\r
      const rect = root.getBoundingClientRect();\r
      const scale = rect.width ? root.clientWidth / rect.width : 1;\r
      const halfWidth = root.clientWidth / 2 || 1;\r
      const halfHeight = root.clientHeight / 2 || 1;\r
      const px = (motion.pointer.x - rect.left) * scale - halfWidth;\r
      const py = (motion.pointer.y - rect.top) * scale - halfHeight;\r
      const inside = motion.pointer.active && Math.abs(px) <= halfWidth && Math.abs(py) <= halfHeight;\r
      const lean = (s.tilt * Math.PI) / 180;\r
      const turn = (s.angle * Math.PI) / 180;\r
      const depth = layout.perspective;\r
      let flatY = py;\r
      let flatX = px;\r
      if (lean > 0.0001) {\r
        flatY = (py * depth) / (depth * Math.cos(lean) + py * Math.sin(lean));\r
        flatX = (px * (depth - flatY * Math.sin(lean))) / depth;\r
      }\r
      const planeX = flatX * Math.cos(turn) + flatY * Math.sin(turn);\r
      const planeY = -flatX * Math.sin(turn) + flatY * Math.cos(turn);\r
      const nudge = motion.pointer.active ? clamp(px / halfWidth, -1, 1) : 0;\r
      const reach = (0.6 + 2.2 * s.spotlight) * Math.max(layout.tileWidth, layout.tileHeight);\r
      const settle = 1 - Math.exp(-dt / 0.22);\r
\r
      rowEls.forEach((row, r) => {\r
        const drift = s.direction === 'left' ? -1 : s.direction === 'right' ? 1 : r % 2 ? 1 : -1;\r
        if (motion.offsets[r] === undefined) {\r
          motion.offsets[r] = r * layout.step * 0.37;\r
          motion.shifts[r] = 0;\r
        }\r
        if (!reduce) motion.offsets[r] += s.speed * drift * PACE[r % PACE.length] * dt;\r
        const target = reduce ? 0 : s.parallax * layout.tileWidth * 1.2 * nudge * (r % 2 ? -1 : 1);\r
        motion.shifts[r] += (target - motion.shifts[r]) * (1 - Math.exp(-dt / INERTIA[r % INERTIA.length]));\r
        const x = -layout.period + wrap(motion.offsets[r] + motion.shifts[r], layout.period);\r
        row.style.transform = \`translate3d(\${x.toFixed(2)}px, 0, 0)\`;\r
\r
        const rowY = layout.top + r * (layout.tileHeight + s.gap) + layout.tileHeight / 2 - layout.planeHeight / 2;\r
        const left = x - layout.planeWidth / 2 + layout.tileWidth / 2;\r
        const list = tileEls[r];\r
        const values = spots[r];\r
        const marks = written[r];\r
        for (let k = 0; k < list.length; k++) {\r
          let wanted = 0;\r
          if (inside && s.spotlight > 0) {\r
            const distance = Math.hypot(left + k * layout.step - planeX, rowY - planeY) / reach;\r
            wanted = 1 - smoothstep(0.25, 1, distance);\r
          }\r
          values[k] += (wanted - values[k]) * settle;\r
          if (Math.abs(values[k] - marks[k]) > 0.004 || (wanted === 0 && values[k] < 0.004 && marks[k] !== 0)) {\r
            marks[k] = values[k] < 0.004 ? 0 : values[k];\r
            list[k].style.setProperty('--spot', marks[k].toFixed(3));\r
          }\r
        }\r
      });\r
\r
      if (visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible && !raf) {\r
        last = performance.now();\r
        raf = requestAnimationFrame(frame);\r
      }\r
    });\r
    visibility.observe(root);\r
    raf = requestAnimationFrame(frame);\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      visibility.disconnect();\r
    };\r
  }, [layout, tiles]);\r
\r
  const rowTiles = layout\r
    ? Array.from({ length: settings.rows }, (_, r) =>\r
        Array.from({ length: layout.perRow }, (_, j) =>\r
          tiles.length ? tiles[(r * layout.perRow + j) % tiles.length] : EMPTY\r
        )\r
      )\r
    : [];\r
  const mask =\r
    settings.fade > 0\r
      ? \`\${feather('to right', settings.fade * 34)}, \${feather('to bottom', settings.fade * 44)}\`\r
      : undefined;\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`}\r
      style={\r
        {\r
          '--gm-tile': tileColor ?? palette.tile,\r
          '--gm-text': textColor ?? palette.text,\r
          '--gm-border': palette.border,\r
          '--gm-radius': \`\${Math.max(0, radius)}px\`,\r
          '--gm-dim': settings.dim,\r
          perspective: layout && settings.tilt > 0 ? \`\${layout.perspective}px\` : undefined,\r
          maskImage: mask,\r
          WebkitMaskImage: mask,\r
          maskComposite: mask ? 'intersect' : undefined,\r
          WebkitMaskComposite: mask ? 'source-in' : undefined,\r
          ...style\r
        } as React.CSSProperties\r
      }\r
    >\r
      {layout && (\r
        <div\r
          ref={planeRef}\r
          className={PLANE}\r
          aria-hidden="true"\r
          style={\r
            {\r
              width: layout.planeWidth,\r
              height: layout.planeHeight,\r
              transform: \`translate(-50%, -50%) rotateX(\${settings.tilt}deg) rotateZ(\${settings.angle}deg)\`,\r
              '--gm-gap': \`\${settings.gap}px\`,\r
              '--gm-tile-w': \`\${layout.tileWidth}px\`,\r
              '--gm-tile-h': \`\${layout.tileHeight}px\`,\r
              '--gm-font': \`\${clamp(layout.tileHeight * 0.12, 12, 32)}px\`\r
            } as React.CSSProperties\r
          }\r
        >\r
          {rowTiles.map((sequence, r) => (\r
            <div key={r} className={ROW} style={{ top: layout.top + r * (layout.tileHeight + settings.gap) }}>\r
              {Array.from({ length: layout.copies * layout.perRow }, (_, k) => (\r
                <Tile key={k} tile={sequence[k % layout.perRow]} gray={grayscale} />\r
              ))}\r
            </div>\r
          ))}\r
        </div>\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default GridMotion;\r
`,o={usage:`import GridMotion from './GridMotion';

const items = [
  'https://images.unsplash.com/photo-1705032033999-efa3082e1a4e?w=640&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1721407964262-f9864b562453?w=640&q=75&auto=format&fit=crop',
  'Any text works too',
  <div key="custom">Or your own JSX</div>
];

<div style={{ position: 'relative', width: '100%', height: 600 }}>
  <GridMotion
    items={items}
    rows={4}
    aspectRatio={1.33}
    gap={16}
    radius={14}
    angle={-12}
    tilt={0}
    speed={24}
    direction="alternate"
    parallax={0.5}
    spotlight={0.6}
    dim={0.35}
    fade={0.5}
    grayscale={false}
  />
</div>`,code:t,css:n,tailwind:e,tsCode:r,tsTailwind:i};export{o as gridMotion};
