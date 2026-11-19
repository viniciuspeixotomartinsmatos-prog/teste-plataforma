const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './PixelTransition.css';\r
\r
const PATTERNS = ['random', 'dither', 'ripple', 'wipe'];\r
const ANIMATIONS = ['pop', 'grow', 'fade'];\r
const SHAPES = ['square', 'rounded', 'circle'];\r
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];\r
const WINDOW = 0.35;\r
const SEAL = 0.22;\r
const TONES = 5;\r
const LEVELS = 16;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const smooth = t => t * t * (3 - 2 * t);\r
\r
const hash = (x, y, seed) => {\r
  let h = Math.imul(x + 1, 0x27d4eb2d) ^ Math.imul(y + 1, 0x165667b1) ^ Math.imul(seed + 1, 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;\r
};\r
\r
function PixelTransition({\r
  firstContent,\r
  secondContent,\r
  gridSize = 10,\r
  pixelColor = '#ffffff',\r
  mosaic = 0,\r
  animationStepDuration = 0.4,\r
  pattern = 'random',\r
  randomness = 0.3,\r
  pixelAnimation = 'pop',\r
  pixelShape = 'square',\r
  gap = 0,\r
  fps = 0,\r
  trigger = 'hover',\r
  active,\r
  once = false,\r
  onActiveChange,\r
  aspectRatio = '100%',\r
  className = '',\r
  style\r
}) {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const firstRef = useRef(null);\r
  const secondRef = useRef(null);\r
  const controlRef = useRef(null);\r
  const pointRef = useRef(null);\r
  const hoverRef = useRef(false);\r
  const focusRef = useRef(false);\r
  const pointerRef = useRef('mouse');\r
  const initialRef = useRef(active ? 1 : 0);\r
  const settings = {\r
    gridSize: clamp(Math.round(gridSize), 2, 80),\r
    pixelColor,\r
    mosaic: clamp(mosaic, 0, 1),\r
    duration: Math.max(0.05, animationStepDuration),\r
    pattern: PATTERNS.includes(pattern) ? pattern : 'random',\r
    randomness: clamp(randomness, 0, 1),\r
    animation: ANIMATIONS.includes(pixelAnimation) ? pixelAnimation : 'pop',\r
    shape: SHAPES.includes(pixelShape) ? pixelShape : 'square',\r
    gap: Math.max(0, gap),\r
    fps: clamp(fps, 0, 120),\r
    once\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!root || !canvas || !ctx) return undefined;\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      progress: 0,\r
      base: initialRef.current,\r
      goal: initialRef.current,\r
      shown: initialRef.current,\r
      seed: 1,\r
      originX: 0.5,\r
      originY: 0.5,\r
      edge: 'left',\r
      tones: ['#ffffff'],\r
      toneKey: '',\r
      dpr: 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let drawnAt = 0;\r
    let alive = true;\r
\r
    const resolveTones = () => {\r
      const s = settingsRef.current;\r
      canvas.style.color = s.pixelColor;\r
      const color = getComputedStyle(canvas).color;\r
      canvas.style.color = '';\r
      let rgba = [255, 255, 255, 1];\r
      if (probeCtx) {\r
        probeCtx.clearRect(0, 0, 1, 1);\r
        probeCtx.fillStyle = color;\r
        probeCtx.fillRect(0, 0, 1, 1);\r
        const data = probeCtx.getImageData(0, 0, 1, 1).data;\r
        rgba = [data[0], data[1], data[2], data[3] / 255];\r
      }\r
      const target = (0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2]) / 255 > 0.5 ? 0 : 255;\r
      state.tones = Array.from({ length: TONES }, (_, index) => {\r
        const mix = s.mosaic * 0.5 * (index / (TONES - 1));\r
        const [r, g, b] = rgba.slice(0, 3).map(value => Math.round(value + (target - value) * mix));\r
        return \`rgba(\${r}, \${g}, \${b}, \${rgba[3]})\`;\r
      });\r
      state.toneKey = \`\${s.pixelColor}|\${s.mosaic}\`;\r
    };\r
\r
    const show = index => {\r
      state.shown = index;\r
      if (firstRef.current) firstRef.current.style.visibility = index === 0 ? '' : 'hidden';\r
      if (secondRef.current) secondRef.current.style.visibility = index === 1 ? '' : 'hidden';\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { width, height } = canvas;\r
      ctx.globalAlpha = 1;\r
      ctx.clearRect(0, 0, width, height);\r
      const progress = state.progress;\r
      if (progress <= 0 || progress >= 1) return;\r
      if (state.toneKey !== \`\${s.pixelColor}|\${s.mosaic}\`) resolveTones();\r
\r
      const covering = progress < 0.5;\r
      const local = covering ? progress * 2 : progress * 2 - 1;\r
      const seal = covering ? smooth(clamp((local - 1 + SEAL) / SEAL, 0, 1)) : 1 - smooth(clamp(local / SEAL, 0, 1));\r
      const cols = s.gridSize;\r
      const cell = width / cols;\r
      const rows = Math.ceil(height / cell);\r
      const top = (height - rows * cell) / 2;\r
      const gap = Math.min(cell * 0.8, s.gap * state.dpr) * (1 - seal);\r
      const ox = state.originX * width;\r
      const oy = state.originY * height;\r
      const far = Math.max(\r
        Math.hypot(ox, oy),\r
        Math.hypot(width - ox, oy),\r
        Math.hypot(ox, height - oy),\r
        Math.hypot(width - ox, height - oy)\r
      );\r
      const paths = new Map();\r
\r
      for (let row = 0; row < rows; row++) {\r
        const y0 = top + row * cell;\r
        const cy = y0 + cell / 2;\r
        for (let col = 0; col < cols; col++) {\r
          const x0 = col * cell;\r
          const cx = x0 + cell / 2;\r
          const noise = hash(col, row, state.seed);\r
          let delay = noise;\r
          if (s.pattern === 'dither') delay = (BAYER[(row & 3) * 4 + (col & 3)] + noise) / 16;\r
          else if (s.pattern !== 'random') {\r
            let base;\r
            if (s.pattern === 'ripple') base = Math.hypot(cx - ox, cy - oy) / Math.max(1, far);\r
            else if (state.edge === 'left') base = cx / width;\r
            else if (state.edge === 'right') base = 1 - cx / width;\r
            else if (state.edge === 'top') base = cy / height;\r
            else base = 1 - cy / height;\r
            delay = clamp(base, 0, 1) * (1 - s.randomness) + noise * s.randomness;\r
          }\r
\r
          let amount;\r
          if (s.animation === 'pop') amount = local >= delay === covering ? 1 : 0;\r
          else {\r
            const t = smooth(clamp((local - delay * (1 - WINDOW)) / WINDOW, 0, 1));\r
            amount = covering ? t : 1 - t;\r
          }\r
          if (amount <= 0.002) continue;\r
\r
          const size = (s.animation === 'grow' ? cell * amount : cell) - gap;\r
          if (size <= 0) continue;\r
          const level = s.animation === 'fade' ? Math.max(1, Math.round(amount * LEVELS)) : LEVELS;\r
          const tone = s.mosaic > 0 ? Math.floor(hash(col, row, 7) * TONES) : 0;\r
          const key = tone * (LEVELS + 1) + level;\r
          let path = paths.get(key);\r
          if (!path) {\r
            path = new Path2D();\r
            paths.set(key, path);\r
          }\r
\r
          if (s.shape === 'circle') {\r
            const radius = (size / 2) * (1 + 0.45 * seal);\r
            path.moveTo(cx + radius, cy);\r
            path.arc(cx, cy, radius, 0, Math.PI * 2);\r
          } else if (s.shape === 'rounded' && seal < 1 && path.roundRect) {\r
            path.roundRect(cx - size / 2, cy - size / 2, size, size, size * 0.3 * (1 - seal));\r
          } else if (size >= cell - 0.01) {\r
            const left = Math.round(x0);\r
            const upper = Math.round(y0);\r
            path.rect(left, upper, Math.round(x0 + cell) - left, Math.round(y0 + cell) - upper);\r
          } else {\r
            path.rect(cx - size / 2, cy - size / 2, size, size);\r
          }\r
        }\r
      }\r
\r
      paths.forEach((path, key) => {\r
        ctx.globalAlpha = (key % (LEVELS + 1)) / LEVELS;\r
        ctx.fillStyle = state.tones[Math.floor(key / (LEVELS + 1))] ?? state.tones[0];\r
        ctx.fill(path);\r
      });\r
      ctx.globalAlpha = 1;\r
    };\r
\r
    const paint = () => {\r
      const index = state.progress >= 0.5 ? 1 - state.base : state.base;\r
      if (index !== state.shown) show(index);\r
      draw();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const aim = state.goal === state.base ? 0 : 1;\r
      const step = reduce ? 1 : dt / (2 * s.duration);\r
      state.progress =\r
        aim > state.progress ? Math.min(aim, state.progress + step) : Math.max(aim, state.progress - step);\r
      const settled = state.progress === aim;\r
      if (settled && aim === 1) {\r
        state.base = 1 - state.base;\r
        state.progress = 0;\r
      }\r
      if (settled || !s.fps || now - drawnAt >= 1000 / s.fps - 2) {\r
        drawnAt = now;\r
        paint();\r
      }\r
      if (!settled) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = point => {\r
      const rect = root.getBoundingClientRect();\r
      const x = point ? clamp((point.x - rect.left) / Math.max(1, rect.width), 0, 1) : 0.5;\r
      const y = point ? clamp((point.y - rect.top) / Math.max(1, rect.height), 0, 1) : 0.5;\r
      state.originX = x;\r
      state.originY = y;\r
      state.seed = Math.floor(Math.random() * 65536);\r
      if (!point) state.edge = 'left';\r
      else {\r
        const sides = [\r
          ['left', x * rect.width],\r
          ['right', (1 - x) * rect.width],\r
          ['top', y * rect.height],\r
          ['bottom', (1 - y) * rect.height]\r
        ];\r
        state.edge = sides.reduce((best, side) => (side[1] < best[1] ? side : best))[0];\r
      }\r
      resolveTones();\r
    };\r
\r
    const go = (next, point) => {\r
      const goal = next ? 1 : 0;\r
      if (goal === state.goal) return;\r
      if (!goal && settingsRef.current.once) return;\r
      state.goal = goal;\r
      if (state.progress === 0 && goal !== state.base) start(point);\r
      if (raf) return;\r
      last = 0;\r
      drawnAt = 0;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    controlRef.current = { go, goal: () => state.goal };\r
\r
    const resize = () => {\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(root.clientWidth * state.dpr));\r
      canvas.height = Math.max(1, Math.round(root.clientHeight * state.dpr));\r
      draw();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (active === undefined) return;\r
    controlRef.current?.go(active, pointRef.current);\r
    pointRef.current = null;\r
  }, [active]);\r
\r
  const hover = trigger !== 'click';\r
\r
  const request = (next, point) => {\r
    const control = controlRef.current;\r
    if (!control || (!next && once && control.goal() === 1)) return;\r
    if (active === undefined) control.go(next, point);\r
    else pointRef.current = point;\r
    onActiveChange?.(next);\r
  };\r
\r
  const pointOf = event => ({ x: event.clientX, y: event.clientY });\r
\r
  const onPointerEnter = event => {\r
    if (event.pointerType === 'touch') return;\r
    hoverRef.current = true;\r
    if (hover) request(true, pointOf(event));\r
  };\r
\r
  const onPointerLeave = event => {\r
    if (event.pointerType === 'touch') return;\r
    hoverRef.current = false;\r
    if (hover && !focusRef.current) request(false, pointOf(event));\r
  };\r
\r
  const onPointerDown = event => {\r
    pointerRef.current = event.pointerType;\r
  };\r
\r
  const onClick = event => {\r
    if (hover && pointerRef.current !== 'touch') return;\r
    request(controlRef.current?.goal() !== 1, pointOf(event));\r
  };\r
\r
  const onFocus = event => {\r
    if (!hover || event.currentTarget.contains(event.relatedTarget)) return;\r
    if (!event.target.matches(':focus-visible')) return;\r
    focusRef.current = true;\r
    request(true, null);\r
  };\r
\r
  const onBlur = event => {\r
    if (!focusRef.current || event.currentTarget.contains(event.relatedTarget)) return;\r
    focusRef.current = false;\r
    if (!hoverRef.current) request(false, null);\r
  };\r
\r
  const onKeyDown = event => {\r
    if (hover || event.target !== event.currentTarget) return;\r
    if (event.key !== 'Enter' && event.key !== ' ') return;\r
    event.preventDefault();\r
    request(controlRef.current?.goal() !== 1, null);\r
  };\r
\r
  const ratio = String(aspectRatio).trim();\r
  const padded = ratio.endsWith('%');\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`pixelated-image-card\${className ? \` \${className}\` : ''}\`}\r
      style={padded ? style : { aspectRatio: ratio, ...style }}\r
      tabIndex={0}\r
      role={hover ? undefined : 'button'}\r
      onPointerEnter={onPointerEnter}\r
      onPointerLeave={onPointerLeave}\r
      onPointerDown={onPointerDown}\r
      onClick={onClick}\r
      onFocus={onFocus}\r
      onBlur={onBlur}\r
      onKeyDown={onKeyDown}\r
    >\r
      {padded && <div style={{ paddingTop: ratio }} />}\r
      <div\r
        ref={firstRef}\r
        className="pixelated-image-card__default"\r
        style={{ visibility: initialRef.current === 0 ? undefined : 'hidden' }}\r
      >\r
        {firstContent}\r
      </div>\r
      <div\r
        ref={secondRef}\r
        className="pixelated-image-card__active"\r
        style={{ visibility: initialRef.current === 1 ? undefined : 'hidden' }}\r
      >\r
        {secondContent}\r
      </div>\r
      <canvas ref={canvasRef} className="pixelated-image-card__pixels" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
\r
export default PixelTransition;\r
`,e=`.pixelated-image-card {\r
  position: relative;\r
  width: 300px;\r
  max-width: 100%;\r
  overflow: hidden;\r
  border-radius: 16px;\r
  isolation: isolate;\r
  -webkit-tap-highlight-color: transparent;\r
}\r
\r
.pixelated-image-card:focus-visible {\r
  outline: 2px solid currentColor;\r
  outline-offset: 3px;\r
}\r
\r
.pixelated-image-card__default,\r
.pixelated-image-card__active {\r
  position: absolute;\r
  inset: 0;\r
}\r
\r
.pixelated-image-card__pixels {\r
  position: absolute;\r
  inset: 0;\r
  z-index: 1;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  pointer-events: none;\r
}\r
`,r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const PATTERNS = ['random', 'dither', 'ripple', 'wipe'];\r
const ANIMATIONS = ['pop', 'grow', 'fade'];\r
const SHAPES = ['square', 'rounded', 'circle'];\r
const ROOT =\r
  'relative isolate w-[300px] max-w-full overflow-hidden rounded-[16px] [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-current';\r
const LAYER = 'absolute inset-0';\r
const PIXELS = 'pointer-events-none absolute inset-0 z-[1] block h-full w-full';\r
\r
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];\r
const WINDOW = 0.35;\r
const SEAL = 0.22;\r
const TONES = 5;\r
const LEVELS = 16;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const smooth = t => t * t * (3 - 2 * t);\r
\r
const hash = (x, y, seed) => {\r
  let h = Math.imul(x + 1, 0x27d4eb2d) ^ Math.imul(y + 1, 0x165667b1) ^ Math.imul(seed + 1, 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;\r
};\r
\r
function PixelTransition({\r
  firstContent,\r
  secondContent,\r
  gridSize = 10,\r
  pixelColor = '#ffffff',\r
  mosaic = 0,\r
  animationStepDuration = 0.4,\r
  pattern = 'random',\r
  randomness = 0.3,\r
  pixelAnimation = 'pop',\r
  pixelShape = 'square',\r
  gap = 0,\r
  fps = 0,\r
  trigger = 'hover',\r
  active,\r
  once = false,\r
  onActiveChange,\r
  aspectRatio = '100%',\r
  className = '',\r
  style\r
}) {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const firstRef = useRef(null);\r
  const secondRef = useRef(null);\r
  const controlRef = useRef(null);\r
  const pointRef = useRef(null);\r
  const hoverRef = useRef(false);\r
  const focusRef = useRef(false);\r
  const pointerRef = useRef('mouse');\r
  const initialRef = useRef(active ? 1 : 0);\r
  const settings = {\r
    gridSize: clamp(Math.round(gridSize), 2, 80),\r
    pixelColor,\r
    mosaic: clamp(mosaic, 0, 1),\r
    duration: Math.max(0.05, animationStepDuration),\r
    pattern: PATTERNS.includes(pattern) ? pattern : 'random',\r
    randomness: clamp(randomness, 0, 1),\r
    animation: ANIMATIONS.includes(pixelAnimation) ? pixelAnimation : 'pop',\r
    shape: SHAPES.includes(pixelShape) ? pixelShape : 'square',\r
    gap: Math.max(0, gap),\r
    fps: clamp(fps, 0, 120),\r
    once\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!root || !canvas || !ctx) return undefined;\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      progress: 0,\r
      base: initialRef.current,\r
      goal: initialRef.current,\r
      shown: initialRef.current,\r
      seed: 1,\r
      originX: 0.5,\r
      originY: 0.5,\r
      edge: 'left',\r
      tones: ['#ffffff'],\r
      toneKey: '',\r
      dpr: 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let drawnAt = 0;\r
    let alive = true;\r
\r
    const resolveTones = () => {\r
      const s = settingsRef.current;\r
      canvas.style.color = s.pixelColor;\r
      const color = getComputedStyle(canvas).color;\r
      canvas.style.color = '';\r
      let rgba = [255, 255, 255, 1];\r
      if (probeCtx) {\r
        probeCtx.clearRect(0, 0, 1, 1);\r
        probeCtx.fillStyle = color;\r
        probeCtx.fillRect(0, 0, 1, 1);\r
        const data = probeCtx.getImageData(0, 0, 1, 1).data;\r
        rgba = [data[0], data[1], data[2], data[3] / 255];\r
      }\r
      const target = (0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2]) / 255 > 0.5 ? 0 : 255;\r
      state.tones = Array.from({ length: TONES }, (_, index) => {\r
        const mix = s.mosaic * 0.5 * (index / (TONES - 1));\r
        const [r, g, b] = rgba.slice(0, 3).map(value => Math.round(value + (target - value) * mix));\r
        return \`rgba(\${r}, \${g}, \${b}, \${rgba[3]})\`;\r
      });\r
      state.toneKey = \`\${s.pixelColor}|\${s.mosaic}\`;\r
    };\r
\r
    const show = index => {\r
      state.shown = index;\r
      if (firstRef.current) firstRef.current.style.visibility = index === 0 ? '' : 'hidden';\r
      if (secondRef.current) secondRef.current.style.visibility = index === 1 ? '' : 'hidden';\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { width, height } = canvas;\r
      ctx.globalAlpha = 1;\r
      ctx.clearRect(0, 0, width, height);\r
      const progress = state.progress;\r
      if (progress <= 0 || progress >= 1) return;\r
      if (state.toneKey !== \`\${s.pixelColor}|\${s.mosaic}\`) resolveTones();\r
\r
      const covering = progress < 0.5;\r
      const local = covering ? progress * 2 : progress * 2 - 1;\r
      const seal = covering ? smooth(clamp((local - 1 + SEAL) / SEAL, 0, 1)) : 1 - smooth(clamp(local / SEAL, 0, 1));\r
      const cols = s.gridSize;\r
      const cell = width / cols;\r
      const rows = Math.ceil(height / cell);\r
      const top = (height - rows * cell) / 2;\r
      const gap = Math.min(cell * 0.8, s.gap * state.dpr) * (1 - seal);\r
      const ox = state.originX * width;\r
      const oy = state.originY * height;\r
      const far = Math.max(\r
        Math.hypot(ox, oy),\r
        Math.hypot(width - ox, oy),\r
        Math.hypot(ox, height - oy),\r
        Math.hypot(width - ox, height - oy)\r
      );\r
      const paths = new Map();\r
\r
      for (let row = 0; row < rows; row++) {\r
        const y0 = top + row * cell;\r
        const cy = y0 + cell / 2;\r
        for (let col = 0; col < cols; col++) {\r
          const x0 = col * cell;\r
          const cx = x0 + cell / 2;\r
          const noise = hash(col, row, state.seed);\r
          let delay = noise;\r
          if (s.pattern === 'dither') delay = (BAYER[(row & 3) * 4 + (col & 3)] + noise) / 16;\r
          else if (s.pattern !== 'random') {\r
            let base;\r
            if (s.pattern === 'ripple') base = Math.hypot(cx - ox, cy - oy) / Math.max(1, far);\r
            else if (state.edge === 'left') base = cx / width;\r
            else if (state.edge === 'right') base = 1 - cx / width;\r
            else if (state.edge === 'top') base = cy / height;\r
            else base = 1 - cy / height;\r
            delay = clamp(base, 0, 1) * (1 - s.randomness) + noise * s.randomness;\r
          }\r
\r
          let amount;\r
          if (s.animation === 'pop') amount = local >= delay === covering ? 1 : 0;\r
          else {\r
            const t = smooth(clamp((local - delay * (1 - WINDOW)) / WINDOW, 0, 1));\r
            amount = covering ? t : 1 - t;\r
          }\r
          if (amount <= 0.002) continue;\r
\r
          const size = (s.animation === 'grow' ? cell * amount : cell) - gap;\r
          if (size <= 0) continue;\r
          const level = s.animation === 'fade' ? Math.max(1, Math.round(amount * LEVELS)) : LEVELS;\r
          const tone = s.mosaic > 0 ? Math.floor(hash(col, row, 7) * TONES) : 0;\r
          const key = tone * (LEVELS + 1) + level;\r
          let path = paths.get(key);\r
          if (!path) {\r
            path = new Path2D();\r
            paths.set(key, path);\r
          }\r
\r
          if (s.shape === 'circle') {\r
            const radius = (size / 2) * (1 + 0.45 * seal);\r
            path.moveTo(cx + radius, cy);\r
            path.arc(cx, cy, radius, 0, Math.PI * 2);\r
          } else if (s.shape === 'rounded' && seal < 1 && path.roundRect) {\r
            path.roundRect(cx - size / 2, cy - size / 2, size, size, size * 0.3 * (1 - seal));\r
          } else if (size >= cell - 0.01) {\r
            const left = Math.round(x0);\r
            const upper = Math.round(y0);\r
            path.rect(left, upper, Math.round(x0 + cell) - left, Math.round(y0 + cell) - upper);\r
          } else {\r
            path.rect(cx - size / 2, cy - size / 2, size, size);\r
          }\r
        }\r
      }\r
\r
      paths.forEach((path, key) => {\r
        ctx.globalAlpha = (key % (LEVELS + 1)) / LEVELS;\r
        ctx.fillStyle = state.tones[Math.floor(key / (LEVELS + 1))] ?? state.tones[0];\r
        ctx.fill(path);\r
      });\r
      ctx.globalAlpha = 1;\r
    };\r
\r
    const paint = () => {\r
      const index = state.progress >= 0.5 ? 1 - state.base : state.base;\r
      if (index !== state.shown) show(index);\r
      draw();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const aim = state.goal === state.base ? 0 : 1;\r
      const step = reduce ? 1 : dt / (2 * s.duration);\r
      state.progress =\r
        aim > state.progress ? Math.min(aim, state.progress + step) : Math.max(aim, state.progress - step);\r
      const settled = state.progress === aim;\r
      if (settled && aim === 1) {\r
        state.base = 1 - state.base;\r
        state.progress = 0;\r
      }\r
      if (settled || !s.fps || now - drawnAt >= 1000 / s.fps - 2) {\r
        drawnAt = now;\r
        paint();\r
      }\r
      if (!settled) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = point => {\r
      const rect = root.getBoundingClientRect();\r
      const x = point ? clamp((point.x - rect.left) / Math.max(1, rect.width), 0, 1) : 0.5;\r
      const y = point ? clamp((point.y - rect.top) / Math.max(1, rect.height), 0, 1) : 0.5;\r
      state.originX = x;\r
      state.originY = y;\r
      state.seed = Math.floor(Math.random() * 65536);\r
      if (!point) state.edge = 'left';\r
      else {\r
        const sides = [\r
          ['left', x * rect.width],\r
          ['right', (1 - x) * rect.width],\r
          ['top', y * rect.height],\r
          ['bottom', (1 - y) * rect.height]\r
        ];\r
        state.edge = sides.reduce((best, side) => (side[1] < best[1] ? side : best))[0];\r
      }\r
      resolveTones();\r
    };\r
\r
    const go = (next, point) => {\r
      const goal = next ? 1 : 0;\r
      if (goal === state.goal) return;\r
      if (!goal && settingsRef.current.once) return;\r
      state.goal = goal;\r
      if (state.progress === 0 && goal !== state.base) start(point);\r
      if (raf) return;\r
      last = 0;\r
      drawnAt = 0;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    controlRef.current = { go, goal: () => state.goal };\r
\r
    const resize = () => {\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(root.clientWidth * state.dpr));\r
      canvas.height = Math.max(1, Math.round(root.clientHeight * state.dpr));\r
      draw();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (active === undefined) return;\r
    controlRef.current?.go(active, pointRef.current);\r
    pointRef.current = null;\r
  }, [active]);\r
\r
  const hover = trigger !== 'click';\r
\r
  const request = (next, point) => {\r
    const control = controlRef.current;\r
    if (!control || (!next && once && control.goal() === 1)) return;\r
    if (active === undefined) control.go(next, point);\r
    else pointRef.current = point;\r
    onActiveChange?.(next);\r
  };\r
\r
  const pointOf = event => ({ x: event.clientX, y: event.clientY });\r
\r
  const onPointerEnter = event => {\r
    if (event.pointerType === 'touch') return;\r
    hoverRef.current = true;\r
    if (hover) request(true, pointOf(event));\r
  };\r
\r
  const onPointerLeave = event => {\r
    if (event.pointerType === 'touch') return;\r
    hoverRef.current = false;\r
    if (hover && !focusRef.current) request(false, pointOf(event));\r
  };\r
\r
  const onPointerDown = event => {\r
    pointerRef.current = event.pointerType;\r
  };\r
\r
  const onClick = event => {\r
    if (hover && pointerRef.current !== 'touch') return;\r
    request(controlRef.current?.goal() !== 1, pointOf(event));\r
  };\r
\r
  const onFocus = event => {\r
    if (!hover || event.currentTarget.contains(event.relatedTarget)) return;\r
    if (!event.target.matches(':focus-visible')) return;\r
    focusRef.current = true;\r
    request(true, null);\r
  };\r
\r
  const onBlur = event => {\r
    if (!focusRef.current || event.currentTarget.contains(event.relatedTarget)) return;\r
    focusRef.current = false;\r
    if (!hoverRef.current) request(false, null);\r
  };\r
\r
  const onKeyDown = event => {\r
    if (hover || event.target !== event.currentTarget) return;\r
    if (event.key !== 'Enter' && event.key !== ' ') return;\r
    event.preventDefault();\r
    request(controlRef.current?.goal() !== 1, null);\r
  };\r
\r
  const ratio = String(aspectRatio).trim();\r
  const padded = ratio.endsWith('%');\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`}\r
      style={padded ? style : { aspectRatio: ratio, ...style }}\r
      tabIndex={0}\r
      role={hover ? undefined : 'button'}\r
      onPointerEnter={onPointerEnter}\r
      onPointerLeave={onPointerLeave}\r
      onPointerDown={onPointerDown}\r
      onClick={onClick}\r
      onFocus={onFocus}\r
      onBlur={onBlur}\r
      onKeyDown={onKeyDown}\r
    >\r
      {padded && <div style={{ paddingTop: ratio }} />}\r
      <div ref={firstRef} className={LAYER} style={{ visibility: initialRef.current === 0 ? undefined : 'hidden' }}>\r
        {firstContent}\r
      </div>\r
      <div ref={secondRef} className={LAYER} style={{ visibility: initialRef.current === 1 ? undefined : 'hidden' }}>\r
        {secondContent}\r
      </div>\r
      <canvas ref={canvasRef} className={PIXELS} aria-hidden="true" />\r
    </div>\r
  );\r
}\r
\r
export default PixelTransition;\r
`,t=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
import './PixelTransition.css';\r
\r
export type PixelTransitionPattern = 'random' | 'dither' | 'ripple' | 'wipe';\r
export type PixelTransitionAnimation = 'pop' | 'grow' | 'fade';\r
export type PixelTransitionShape = 'square' | 'rounded' | 'circle';\r
\r
export interface PixelTransitionProps {\r
  firstContent: React.ReactNode;\r
  secondContent: React.ReactNode;\r
  gridSize?: number;\r
  pixelColor?: string;\r
  mosaic?: number;\r
  animationStepDuration?: number;\r
  pattern?: PixelTransitionPattern;\r
  randomness?: number;\r
  pixelAnimation?: PixelTransitionAnimation;\r
  pixelShape?: PixelTransitionShape;\r
  gap?: number;\r
  fps?: number;\r
  trigger?: 'hover' | 'click';\r
  active?: boolean;\r
  once?: boolean;\r
  onActiveChange?: (active: boolean) => void;\r
  aspectRatio?: string;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
type Point = { x: number; y: number };\r
\r
type Control = { go: (next: boolean, point: Point | null) => void; goal: () => number };\r
\r
const PATTERNS: PixelTransitionPattern[] = ['random', 'dither', 'ripple', 'wipe'];\r
const ANIMATIONS: PixelTransitionAnimation[] = ['pop', 'grow', 'fade'];\r
const SHAPES: PixelTransitionShape[] = ['square', 'rounded', 'circle'];\r
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];\r
const WINDOW = 0.35;\r
const SEAL = 0.22;\r
const TONES = 5;\r
const LEVELS = 16;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const smooth = (t: number) => t * t * (3 - 2 * t);\r
\r
const hash = (x: number, y: number, seed: number) => {\r
  let h = Math.imul(x + 1, 0x27d4eb2d) ^ Math.imul(y + 1, 0x165667b1) ^ Math.imul(seed + 1, 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;\r
};\r
\r
function PixelTransition({\r
  firstContent,\r
  secondContent,\r
  gridSize = 10,\r
  pixelColor = '#ffffff',\r
  mosaic = 0,\r
  animationStepDuration = 0.4,\r
  pattern = 'random',\r
  randomness = 0.3,\r
  pixelAnimation = 'pop',\r
  pixelShape = 'square',\r
  gap = 0,\r
  fps = 0,\r
  trigger = 'hover',\r
  active,\r
  once = false,\r
  onActiveChange,\r
  aspectRatio = '100%',\r
  className = '',\r
  style\r
}: PixelTransitionProps) {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const firstRef = useRef<HTMLDivElement>(null);\r
  const secondRef = useRef<HTMLDivElement>(null);\r
  const controlRef = useRef<Control | null>(null);\r
  const pointRef = useRef<Point | null>(null);\r
  const hoverRef = useRef(false);\r
  const focusRef = useRef(false);\r
  const pointerRef = useRef<string>('mouse');\r
  const initialRef = useRef(active ? 1 : 0);\r
  const settings = {\r
    gridSize: clamp(Math.round(gridSize), 2, 80),\r
    pixelColor,\r
    mosaic: clamp(mosaic, 0, 1),\r
    duration: Math.max(0.05, animationStepDuration),\r
    pattern: PATTERNS.includes(pattern) ? pattern : ('random' as PixelTransitionPattern),\r
    randomness: clamp(randomness, 0, 1),\r
    animation: ANIMATIONS.includes(pixelAnimation) ? pixelAnimation : ('pop' as PixelTransitionAnimation),\r
    shape: SHAPES.includes(pixelShape) ? pixelShape : ('square' as PixelTransitionShape),\r
    gap: Math.max(0, gap),\r
    fps: clamp(fps, 0, 120),\r
    once\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!root || !canvas || !ctx) return undefined;\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      progress: 0,\r
      base: initialRef.current,\r
      goal: initialRef.current,\r
      shown: initialRef.current,\r
      seed: 1,\r
      originX: 0.5,\r
      originY: 0.5,\r
      edge: 'left' as 'left' | 'right' | 'top' | 'bottom',\r
      tones: ['#ffffff'] as string[],\r
      toneKey: '',\r
      dpr: 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let drawnAt = 0;\r
    let alive = true;\r
\r
    const resolveTones = () => {\r
      const s = settingsRef.current;\r
      canvas.style.color = s.pixelColor;\r
      const color = getComputedStyle(canvas).color;\r
      canvas.style.color = '';\r
      let rgba = [255, 255, 255, 1];\r
      if (probeCtx) {\r
        probeCtx.clearRect(0, 0, 1, 1);\r
        probeCtx.fillStyle = color;\r
        probeCtx.fillRect(0, 0, 1, 1);\r
        const data = probeCtx.getImageData(0, 0, 1, 1).data;\r
        rgba = [data[0], data[1], data[2], data[3] / 255];\r
      }\r
      const target = (0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2]) / 255 > 0.5 ? 0 : 255;\r
      state.tones = Array.from({ length: TONES }, (_, index) => {\r
        const mix = s.mosaic * 0.5 * (index / (TONES - 1));\r
        const [r, g, b] = rgba.slice(0, 3).map(value => Math.round(value + (target - value) * mix));\r
        return \`rgba(\${r}, \${g}, \${b}, \${rgba[3]})\`;\r
      });\r
      state.toneKey = \`\${s.pixelColor}|\${s.mosaic}\`;\r
    };\r
\r
    const show = (index: number) => {\r
      state.shown = index;\r
      if (firstRef.current) firstRef.current.style.visibility = index === 0 ? '' : 'hidden';\r
      if (secondRef.current) secondRef.current.style.visibility = index === 1 ? '' : 'hidden';\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { width, height } = canvas;\r
      ctx.globalAlpha = 1;\r
      ctx.clearRect(0, 0, width, height);\r
      const progress = state.progress;\r
      if (progress <= 0 || progress >= 1) return;\r
      if (state.toneKey !== \`\${s.pixelColor}|\${s.mosaic}\`) resolveTones();\r
\r
      const covering = progress < 0.5;\r
      const local = covering ? progress * 2 : progress * 2 - 1;\r
      const seal = covering ? smooth(clamp((local - 1 + SEAL) / SEAL, 0, 1)) : 1 - smooth(clamp(local / SEAL, 0, 1));\r
      const cols = s.gridSize;\r
      const cell = width / cols;\r
      const rows = Math.ceil(height / cell);\r
      const top = (height - rows * cell) / 2;\r
      const gap = Math.min(cell * 0.8, s.gap * state.dpr) * (1 - seal);\r
      const ox = state.originX * width;\r
      const oy = state.originY * height;\r
      const far = Math.max(\r
        Math.hypot(ox, oy),\r
        Math.hypot(width - ox, oy),\r
        Math.hypot(ox, height - oy),\r
        Math.hypot(width - ox, height - oy)\r
      );\r
      const paths = new Map<number, Path2D>();\r
\r
      for (let row = 0; row < rows; row++) {\r
        const y0 = top + row * cell;\r
        const cy = y0 + cell / 2;\r
        for (let col = 0; col < cols; col++) {\r
          const x0 = col * cell;\r
          const cx = x0 + cell / 2;\r
          const noise = hash(col, row, state.seed);\r
          let delay = noise;\r
          if (s.pattern === 'dither') delay = (BAYER[(row & 3) * 4 + (col & 3)] + noise) / 16;\r
          else if (s.pattern !== 'random') {\r
            let base;\r
            if (s.pattern === 'ripple') base = Math.hypot(cx - ox, cy - oy) / Math.max(1, far);\r
            else if (state.edge === 'left') base = cx / width;\r
            else if (state.edge === 'right') base = 1 - cx / width;\r
            else if (state.edge === 'top') base = cy / height;\r
            else base = 1 - cy / height;\r
            delay = clamp(base, 0, 1) * (1 - s.randomness) + noise * s.randomness;\r
          }\r
\r
          let amount;\r
          if (s.animation === 'pop') amount = local >= delay === covering ? 1 : 0;\r
          else {\r
            const t = smooth(clamp((local - delay * (1 - WINDOW)) / WINDOW, 0, 1));\r
            amount = covering ? t : 1 - t;\r
          }\r
          if (amount <= 0.002) continue;\r
\r
          const size = (s.animation === 'grow' ? cell * amount : cell) - gap;\r
          if (size <= 0) continue;\r
          const level = s.animation === 'fade' ? Math.max(1, Math.round(amount * LEVELS)) : LEVELS;\r
          const tone = s.mosaic > 0 ? Math.floor(hash(col, row, 7) * TONES) : 0;\r
          const key = tone * (LEVELS + 1) + level;\r
          let path = paths.get(key);\r
          if (!path) {\r
            path = new Path2D();\r
            paths.set(key, path);\r
          }\r
\r
          if (s.shape === 'circle') {\r
            const radius = (size / 2) * (1 + 0.45 * seal);\r
            path.moveTo(cx + radius, cy);\r
            path.arc(cx, cy, radius, 0, Math.PI * 2);\r
          } else if (s.shape === 'rounded' && seal < 1 && path.roundRect) {\r
            path.roundRect(cx - size / 2, cy - size / 2, size, size, size * 0.3 * (1 - seal));\r
          } else if (size >= cell - 0.01) {\r
            const left = Math.round(x0);\r
            const upper = Math.round(y0);\r
            path.rect(left, upper, Math.round(x0 + cell) - left, Math.round(y0 + cell) - upper);\r
          } else {\r
            path.rect(cx - size / 2, cy - size / 2, size, size);\r
          }\r
        }\r
      }\r
\r
      paths.forEach((path, key) => {\r
        ctx.globalAlpha = (key % (LEVELS + 1)) / LEVELS;\r
        ctx.fillStyle = state.tones[Math.floor(key / (LEVELS + 1))] ?? state.tones[0];\r
        ctx.fill(path);\r
      });\r
      ctx.globalAlpha = 1;\r
    };\r
\r
    const paint = () => {\r
      const index = state.progress >= 0.5 ? 1 - state.base : state.base;\r
      if (index !== state.shown) show(index);\r
      draw();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const aim = state.goal === state.base ? 0 : 1;\r
      const step = reduce ? 1 : dt / (2 * s.duration);\r
      state.progress =\r
        aim > state.progress ? Math.min(aim, state.progress + step) : Math.max(aim, state.progress - step);\r
      const settled = state.progress === aim;\r
      if (settled && aim === 1) {\r
        state.base = 1 - state.base;\r
        state.progress = 0;\r
      }\r
      if (settled || !s.fps || now - drawnAt >= 1000 / s.fps - 2) {\r
        drawnAt = now;\r
        paint();\r
      }\r
      if (!settled) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = (point: Point | null) => {\r
      const rect = root.getBoundingClientRect();\r
      const x = point ? clamp((point.x - rect.left) / Math.max(1, rect.width), 0, 1) : 0.5;\r
      const y = point ? clamp((point.y - rect.top) / Math.max(1, rect.height), 0, 1) : 0.5;\r
      state.originX = x;\r
      state.originY = y;\r
      state.seed = Math.floor(Math.random() * 65536);\r
      if (!point) state.edge = 'left';\r
      else {\r
        const sides: ['left' | 'right' | 'top' | 'bottom', number][] = [\r
          ['left', x * rect.width],\r
          ['right', (1 - x) * rect.width],\r
          ['top', y * rect.height],\r
          ['bottom', (1 - y) * rect.height]\r
        ];\r
        state.edge = sides.reduce((best, side) => (side[1] < best[1] ? side : best))[0];\r
      }\r
      resolveTones();\r
    };\r
\r
    const go = (next: boolean, point: Point | null) => {\r
      const goal = next ? 1 : 0;\r
      if (goal === state.goal) return;\r
      if (!goal && settingsRef.current.once) return;\r
      state.goal = goal;\r
      if (state.progress === 0 && goal !== state.base) start(point);\r
      if (raf) return;\r
      last = 0;\r
      drawnAt = 0;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    controlRef.current = { go, goal: () => state.goal };\r
\r
    const resize = () => {\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(root.clientWidth * state.dpr));\r
      canvas.height = Math.max(1, Math.round(root.clientHeight * state.dpr));\r
      draw();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (active === undefined) return;\r
    controlRef.current?.go(active, pointRef.current);\r
    pointRef.current = null;\r
  }, [active]);\r
\r
  const hover = trigger !== 'click';\r
\r
  const request = (next: boolean, point: Point | null) => {\r
    const control = controlRef.current;\r
    if (!control || (!next && once && control.goal() === 1)) return;\r
    if (active === undefined) control.go(next, point);\r
    else pointRef.current = point;\r
    onActiveChange?.(next);\r
  };\r
\r
  const pointOf = (event: React.PointerEvent | React.MouseEvent): Point => ({ x: event.clientX, y: event.clientY });\r
\r
  const onPointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {\r
    if (event.pointerType === 'touch') return;\r
    hoverRef.current = true;\r
    if (hover) request(true, pointOf(event));\r
  };\r
\r
  const onPointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {\r
    if (event.pointerType === 'touch') return;\r
    hoverRef.current = false;\r
    if (hover && !focusRef.current) request(false, pointOf(event));\r
  };\r
\r
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {\r
    pointerRef.current = event.pointerType;\r
  };\r
\r
  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {\r
    if (hover && pointerRef.current !== 'touch') return;\r
    request(controlRef.current?.goal() !== 1, pointOf(event));\r
  };\r
\r
  const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {\r
    if (!hover || event.currentTarget.contains(event.relatedTarget as Node | null)) return;\r
    if (!(event.target as HTMLElement).matches(':focus-visible')) return;\r
    focusRef.current = true;\r
    request(true, null);\r
  };\r
\r
  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {\r
    if (!focusRef.current || event.currentTarget.contains(event.relatedTarget as Node | null)) return;\r
    focusRef.current = false;\r
    if (!hoverRef.current) request(false, null);\r
  };\r
\r
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {\r
    if (hover || event.target !== event.currentTarget) return;\r
    if (event.key !== 'Enter' && event.key !== ' ') return;\r
    event.preventDefault();\r
    request(controlRef.current?.goal() !== 1, null);\r
  };\r
\r
  const ratio = String(aspectRatio).trim();\r
  const padded = ratio.endsWith('%');\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`pixelated-image-card\${className ? \` \${className}\` : ''}\`}\r
      style={padded ? style : ({ aspectRatio: ratio, ...style } as React.CSSProperties)}\r
      tabIndex={0}\r
      role={hover ? undefined : 'button'}\r
      onPointerEnter={onPointerEnter}\r
      onPointerLeave={onPointerLeave}\r
      onPointerDown={onPointerDown}\r
      onClick={onClick}\r
      onFocus={onFocus}\r
      onBlur={onBlur}\r
      onKeyDown={onKeyDown}\r
    >\r
      {padded && <div style={{ paddingTop: ratio }} />}\r
      <div\r
        ref={firstRef}\r
        className="pixelated-image-card__default"\r
        style={{ visibility: initialRef.current === 0 ? undefined : 'hidden' }}\r
      >\r
        {firstContent}\r
      </div>\r
      <div\r
        ref={secondRef}\r
        className="pixelated-image-card__active"\r
        style={{ visibility: initialRef.current === 1 ? undefined : 'hidden' }}\r
      >\r
        {secondContent}\r
      </div>\r
      <canvas ref={canvasRef} className="pixelated-image-card__pixels" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
\r
export default PixelTransition;\r
`,o=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
export type PixelTransitionPattern = 'random' | 'dither' | 'ripple' | 'wipe';\r
export type PixelTransitionAnimation = 'pop' | 'grow' | 'fade';\r
export type PixelTransitionShape = 'square' | 'rounded' | 'circle';\r
\r
export interface PixelTransitionProps {\r
  firstContent: React.ReactNode;\r
  secondContent: React.ReactNode;\r
  gridSize?: number;\r
  pixelColor?: string;\r
  mosaic?: number;\r
  animationStepDuration?: number;\r
  pattern?: PixelTransitionPattern;\r
  randomness?: number;\r
  pixelAnimation?: PixelTransitionAnimation;\r
  pixelShape?: PixelTransitionShape;\r
  gap?: number;\r
  fps?: number;\r
  trigger?: 'hover' | 'click';\r
  active?: boolean;\r
  once?: boolean;\r
  onActiveChange?: (active: boolean) => void;\r
  aspectRatio?: string;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
type Point = { x: number; y: number };\r
\r
type Control = { go: (next: boolean, point: Point | null) => void; goal: () => number };\r
\r
const PATTERNS: PixelTransitionPattern[] = ['random', 'dither', 'ripple', 'wipe'];\r
const ANIMATIONS: PixelTransitionAnimation[] = ['pop', 'grow', 'fade'];\r
const SHAPES: PixelTransitionShape[] = ['square', 'rounded', 'circle'];\r
const ROOT =\r
  'relative isolate w-[300px] max-w-full overflow-hidden rounded-[16px] [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-current';\r
const LAYER = 'absolute inset-0';\r
const PIXELS = 'pointer-events-none absolute inset-0 z-[1] block h-full w-full';\r
\r
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];\r
const WINDOW = 0.35;\r
const SEAL = 0.22;\r
const TONES = 5;\r
const LEVELS = 16;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const smooth = (t: number) => t * t * (3 - 2 * t);\r
\r
const hash = (x: number, y: number, seed: number) => {\r
  let h = Math.imul(x + 1, 0x27d4eb2d) ^ Math.imul(y + 1, 0x165667b1) ^ Math.imul(seed + 1, 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;\r
};\r
\r
function PixelTransition({\r
  firstContent,\r
  secondContent,\r
  gridSize = 10,\r
  pixelColor = '#ffffff',\r
  mosaic = 0,\r
  animationStepDuration = 0.4,\r
  pattern = 'random',\r
  randomness = 0.3,\r
  pixelAnimation = 'pop',\r
  pixelShape = 'square',\r
  gap = 0,\r
  fps = 0,\r
  trigger = 'hover',\r
  active,\r
  once = false,\r
  onActiveChange,\r
  aspectRatio = '100%',\r
  className = '',\r
  style\r
}: PixelTransitionProps) {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const firstRef = useRef<HTMLDivElement>(null);\r
  const secondRef = useRef<HTMLDivElement>(null);\r
  const controlRef = useRef<Control | null>(null);\r
  const pointRef = useRef<Point | null>(null);\r
  const hoverRef = useRef(false);\r
  const focusRef = useRef(false);\r
  const pointerRef = useRef<string>('mouse');\r
  const initialRef = useRef(active ? 1 : 0);\r
  const settings = {\r
    gridSize: clamp(Math.round(gridSize), 2, 80),\r
    pixelColor,\r
    mosaic: clamp(mosaic, 0, 1),\r
    duration: Math.max(0.05, animationStepDuration),\r
    pattern: PATTERNS.includes(pattern) ? pattern : ('random' as PixelTransitionPattern),\r
    randomness: clamp(randomness, 0, 1),\r
    animation: ANIMATIONS.includes(pixelAnimation) ? pixelAnimation : ('pop' as PixelTransitionAnimation),\r
    shape: SHAPES.includes(pixelShape) ? pixelShape : ('square' as PixelTransitionShape),\r
    gap: Math.max(0, gap),\r
    fps: clamp(fps, 0, 120),\r
    once\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!root || !canvas || !ctx) return undefined;\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      progress: 0,\r
      base: initialRef.current,\r
      goal: initialRef.current,\r
      shown: initialRef.current,\r
      seed: 1,\r
      originX: 0.5,\r
      originY: 0.5,\r
      edge: 'left' as 'left' | 'right' | 'top' | 'bottom',\r
      tones: ['#ffffff'] as string[],\r
      toneKey: '',\r
      dpr: 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let drawnAt = 0;\r
    let alive = true;\r
\r
    const resolveTones = () => {\r
      const s = settingsRef.current;\r
      canvas.style.color = s.pixelColor;\r
      const color = getComputedStyle(canvas).color;\r
      canvas.style.color = '';\r
      let rgba = [255, 255, 255, 1];\r
      if (probeCtx) {\r
        probeCtx.clearRect(0, 0, 1, 1);\r
        probeCtx.fillStyle = color;\r
        probeCtx.fillRect(0, 0, 1, 1);\r
        const data = probeCtx.getImageData(0, 0, 1, 1).data;\r
        rgba = [data[0], data[1], data[2], data[3] / 255];\r
      }\r
      const target = (0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2]) / 255 > 0.5 ? 0 : 255;\r
      state.tones = Array.from({ length: TONES }, (_, index) => {\r
        const mix = s.mosaic * 0.5 * (index / (TONES - 1));\r
        const [r, g, b] = rgba.slice(0, 3).map(value => Math.round(value + (target - value) * mix));\r
        return \`rgba(\${r}, \${g}, \${b}, \${rgba[3]})\`;\r
      });\r
      state.toneKey = \`\${s.pixelColor}|\${s.mosaic}\`;\r
    };\r
\r
    const show = (index: number) => {\r
      state.shown = index;\r
      if (firstRef.current) firstRef.current.style.visibility = index === 0 ? '' : 'hidden';\r
      if (secondRef.current) secondRef.current.style.visibility = index === 1 ? '' : 'hidden';\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const { width, height } = canvas;\r
      ctx.globalAlpha = 1;\r
      ctx.clearRect(0, 0, width, height);\r
      const progress = state.progress;\r
      if (progress <= 0 || progress >= 1) return;\r
      if (state.toneKey !== \`\${s.pixelColor}|\${s.mosaic}\`) resolveTones();\r
\r
      const covering = progress < 0.5;\r
      const local = covering ? progress * 2 : progress * 2 - 1;\r
      const seal = covering ? smooth(clamp((local - 1 + SEAL) / SEAL, 0, 1)) : 1 - smooth(clamp(local / SEAL, 0, 1));\r
      const cols = s.gridSize;\r
      const cell = width / cols;\r
      const rows = Math.ceil(height / cell);\r
      const top = (height - rows * cell) / 2;\r
      const gap = Math.min(cell * 0.8, s.gap * state.dpr) * (1 - seal);\r
      const ox = state.originX * width;\r
      const oy = state.originY * height;\r
      const far = Math.max(\r
        Math.hypot(ox, oy),\r
        Math.hypot(width - ox, oy),\r
        Math.hypot(ox, height - oy),\r
        Math.hypot(width - ox, height - oy)\r
      );\r
      const paths = new Map<number, Path2D>();\r
\r
      for (let row = 0; row < rows; row++) {\r
        const y0 = top + row * cell;\r
        const cy = y0 + cell / 2;\r
        for (let col = 0; col < cols; col++) {\r
          const x0 = col * cell;\r
          const cx = x0 + cell / 2;\r
          const noise = hash(col, row, state.seed);\r
          let delay = noise;\r
          if (s.pattern === 'dither') delay = (BAYER[(row & 3) * 4 + (col & 3)] + noise) / 16;\r
          else if (s.pattern !== 'random') {\r
            let base;\r
            if (s.pattern === 'ripple') base = Math.hypot(cx - ox, cy - oy) / Math.max(1, far);\r
            else if (state.edge === 'left') base = cx / width;\r
            else if (state.edge === 'right') base = 1 - cx / width;\r
            else if (state.edge === 'top') base = cy / height;\r
            else base = 1 - cy / height;\r
            delay = clamp(base, 0, 1) * (1 - s.randomness) + noise * s.randomness;\r
          }\r
\r
          let amount;\r
          if (s.animation === 'pop') amount = local >= delay === covering ? 1 : 0;\r
          else {\r
            const t = smooth(clamp((local - delay * (1 - WINDOW)) / WINDOW, 0, 1));\r
            amount = covering ? t : 1 - t;\r
          }\r
          if (amount <= 0.002) continue;\r
\r
          const size = (s.animation === 'grow' ? cell * amount : cell) - gap;\r
          if (size <= 0) continue;\r
          const level = s.animation === 'fade' ? Math.max(1, Math.round(amount * LEVELS)) : LEVELS;\r
          const tone = s.mosaic > 0 ? Math.floor(hash(col, row, 7) * TONES) : 0;\r
          const key = tone * (LEVELS + 1) + level;\r
          let path = paths.get(key);\r
          if (!path) {\r
            path = new Path2D();\r
            paths.set(key, path);\r
          }\r
\r
          if (s.shape === 'circle') {\r
            const radius = (size / 2) * (1 + 0.45 * seal);\r
            path.moveTo(cx + radius, cy);\r
            path.arc(cx, cy, radius, 0, Math.PI * 2);\r
          } else if (s.shape === 'rounded' && seal < 1 && path.roundRect) {\r
            path.roundRect(cx - size / 2, cy - size / 2, size, size, size * 0.3 * (1 - seal));\r
          } else if (size >= cell - 0.01) {\r
            const left = Math.round(x0);\r
            const upper = Math.round(y0);\r
            path.rect(left, upper, Math.round(x0 + cell) - left, Math.round(y0 + cell) - upper);\r
          } else {\r
            path.rect(cx - size / 2, cy - size / 2, size, size);\r
          }\r
        }\r
      }\r
\r
      paths.forEach((path, key) => {\r
        ctx.globalAlpha = (key % (LEVELS + 1)) / LEVELS;\r
        ctx.fillStyle = state.tones[Math.floor(key / (LEVELS + 1))] ?? state.tones[0];\r
        ctx.fill(path);\r
      });\r
      ctx.globalAlpha = 1;\r
    };\r
\r
    const paint = () => {\r
      const index = state.progress >= 0.5 ? 1 - state.base : state.base;\r
      if (index !== state.shown) show(index);\r
      draw();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const aim = state.goal === state.base ? 0 : 1;\r
      const step = reduce ? 1 : dt / (2 * s.duration);\r
      state.progress =\r
        aim > state.progress ? Math.min(aim, state.progress + step) : Math.max(aim, state.progress - step);\r
      const settled = state.progress === aim;\r
      if (settled && aim === 1) {\r
        state.base = 1 - state.base;\r
        state.progress = 0;\r
      }\r
      if (settled || !s.fps || now - drawnAt >= 1000 / s.fps - 2) {\r
        drawnAt = now;\r
        paint();\r
      }\r
      if (!settled) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = (point: Point | null) => {\r
      const rect = root.getBoundingClientRect();\r
      const x = point ? clamp((point.x - rect.left) / Math.max(1, rect.width), 0, 1) : 0.5;\r
      const y = point ? clamp((point.y - rect.top) / Math.max(1, rect.height), 0, 1) : 0.5;\r
      state.originX = x;\r
      state.originY = y;\r
      state.seed = Math.floor(Math.random() * 65536);\r
      if (!point) state.edge = 'left';\r
      else {\r
        const sides: ['left' | 'right' | 'top' | 'bottom', number][] = [\r
          ['left', x * rect.width],\r
          ['right', (1 - x) * rect.width],\r
          ['top', y * rect.height],\r
          ['bottom', (1 - y) * rect.height]\r
        ];\r
        state.edge = sides.reduce((best, side) => (side[1] < best[1] ? side : best))[0];\r
      }\r
      resolveTones();\r
    };\r
\r
    const go = (next: boolean, point: Point | null) => {\r
      const goal = next ? 1 : 0;\r
      if (goal === state.goal) return;\r
      if (!goal && settingsRef.current.once) return;\r
      state.goal = goal;\r
      if (state.progress === 0 && goal !== state.base) start(point);\r
      if (raf) return;\r
      last = 0;\r
      drawnAt = 0;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    controlRef.current = { go, goal: () => state.goal };\r
\r
    const resize = () => {\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(root.clientWidth * state.dpr));\r
      canvas.height = Math.max(1, Math.round(root.clientHeight * state.dpr));\r
      draw();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (active === undefined) return;\r
    controlRef.current?.go(active, pointRef.current);\r
    pointRef.current = null;\r
  }, [active]);\r
\r
  const hover = trigger !== 'click';\r
\r
  const request = (next: boolean, point: Point | null) => {\r
    const control = controlRef.current;\r
    if (!control || (!next && once && control.goal() === 1)) return;\r
    if (active === undefined) control.go(next, point);\r
    else pointRef.current = point;\r
    onActiveChange?.(next);\r
  };\r
\r
  const pointOf = (event: React.PointerEvent | React.MouseEvent): Point => ({ x: event.clientX, y: event.clientY });\r
\r
  const onPointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {\r
    if (event.pointerType === 'touch') return;\r
    hoverRef.current = true;\r
    if (hover) request(true, pointOf(event));\r
  };\r
\r
  const onPointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {\r
    if (event.pointerType === 'touch') return;\r
    hoverRef.current = false;\r
    if (hover && !focusRef.current) request(false, pointOf(event));\r
  };\r
\r
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {\r
    pointerRef.current = event.pointerType;\r
  };\r
\r
  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {\r
    if (hover && pointerRef.current !== 'touch') return;\r
    request(controlRef.current?.goal() !== 1, pointOf(event));\r
  };\r
\r
  const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {\r
    if (!hover || event.currentTarget.contains(event.relatedTarget as Node | null)) return;\r
    if (!(event.target as HTMLElement).matches(':focus-visible')) return;\r
    focusRef.current = true;\r
    request(true, null);\r
  };\r
\r
  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {\r
    if (!focusRef.current || event.currentTarget.contains(event.relatedTarget as Node | null)) return;\r
    focusRef.current = false;\r
    if (!hoverRef.current) request(false, null);\r
  };\r
\r
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {\r
    if (hover || event.target !== event.currentTarget) return;\r
    if (event.key !== 'Enter' && event.key !== ' ') return;\r
    event.preventDefault();\r
    request(controlRef.current?.goal() !== 1, null);\r
  };\r
\r
  const ratio = String(aspectRatio).trim();\r
  const padded = ratio.endsWith('%');\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`}\r
      style={padded ? style : ({ aspectRatio: ratio, ...style } as React.CSSProperties)}\r
      tabIndex={0}\r
      role={hover ? undefined : 'button'}\r
      onPointerEnter={onPointerEnter}\r
      onPointerLeave={onPointerLeave}\r
      onPointerDown={onPointerDown}\r
      onClick={onClick}\r
      onFocus={onFocus}\r
      onBlur={onBlur}\r
      onKeyDown={onKeyDown}\r
    >\r
      {padded && <div style={{ paddingTop: ratio }} />}\r
      <div ref={firstRef} className={LAYER} style={{ visibility: initialRef.current === 0 ? undefined : 'hidden' }}>\r
        {firstContent}\r
      </div>\r
      <div ref={secondRef} className={LAYER} style={{ visibility: initialRef.current === 1 ? undefined : 'hidden' }}>\r
        {secondContent}\r
      </div>\r
      <canvas ref={canvasRef} className={PIXELS} aria-hidden="true" />\r
    </div>\r
  );\r
}\r
\r
export default PixelTransition;\r
`,s={usage:`import PixelTransition from './PixelTransition';

<PixelTransition
  firstContent={
    <img
      src="/assets/demo/day-portrait.webp"
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  }
  secondContent={
    <img
      src="/assets/demo/night-portrait.webp"
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  }
  pixelColor="#ffffff"
  mosaic={0}
  gridSize={10}
  pixelShape="square"
  gap={0}
  pattern="random"
  pixelAnimation="pop"
  randomness={0.3}
  animationStepDuration={0.4}
  fps={0}
  trigger="hover"
  once={false}
  aspectRatio="125%"
  style={{ width: 300 }}
/>`,code:n,css:e,tailwind:r,tsCode:t,tsTailwind:o};export{s as pixelTransition};
