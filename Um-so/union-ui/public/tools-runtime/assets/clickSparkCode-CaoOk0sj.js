const r=`'use client';\r
\r
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';\r
\r
const EASINGS = {\r
  linear: t => t,\r
  'ease-in': t => t * t,\r
  'ease-out': t => 1 - Math.pow(1 - t, 3),\r
  'ease-in-out': t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),\r
  spring: t => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)\r
};\r
\r
const SHAPES = ['line', 'streak', 'dot', 'star'];\r
const MAX_BURSTS = 32;\r
const GRAVITY = 500;\r
const REDUCED_MS = 320;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const smoothstep = (a, b, x) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const toColors = value => {\r
  const list = (Array.isArray(value) ? value : [value]).filter(Boolean);\r
  return list.length ? list : ['#ffffff'];\r
};\r
\r
const starPath = (ctx, x, y, radius, rotation) => {\r
  const pinch = radius * 0.16;\r
  ctx.beginPath();\r
  ctx.moveTo(x + Math.cos(rotation) * radius, y + Math.sin(rotation) * radius);\r
  for (let i = 1; i <= 4; i++) {\r
    const a = rotation + (i * Math.PI) / 2;\r
    const mid = a - Math.PI / 4;\r
    ctx.quadraticCurveTo(\r
      x + Math.cos(mid) * pinch,\r
      y + Math.sin(mid) * pinch,\r
      x + Math.cos(a) * radius,\r
      y + Math.sin(a) * radius\r
    );\r
  }\r
  ctx.closePath();\r
};\r
\r
const channels = (ctx, color) => {\r
  ctx.fillStyle = color;\r
  const normal = String(ctx.fillStyle);\r
  const hex = /^#([0-9a-f]{6})$/i.exec(normal);\r
  if (hex) {\r
    const value = parseInt(hex[1], 16);\r
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];\r
  }\r
  const rgb = /^rgba?\\(([^)]+)\\)$/i.exec(normal);\r
  if (rgb)\r
    return rgb[1]\r
      .split(',')\r
      .slice(0, 3)\r
      .map(part => parseFloat(part));\r
  return [0, 0, 0];\r
};\r
\r
const ClickSpark = forwardRef(\r
  (\r
    {\r
      sparkColor = '#fff',\r
      sparkSize = 14,\r
      sparkRadius = 30,\r
      sparkCount = 8,\r
      sparkWidth = 2,\r
      duration = 500,\r
      easing = 'ease-out',\r
      extraScale = 1,\r
      shape = 'line',\r
      randomness = 0.2,\r
      gravity = 0,\r
      spread = 360,\r
      direction = 0,\r
      glow = 0,\r
      ring = false,\r
      layer = 'front',\r
      disabled = false,\r
      className = '',\r
      style,\r
      children\r
    },\r
    ref\r
  ) => {\r
    const rootRef = useRef(null);\r
    const layerRef = useRef(null);\r
    const engineRef = useRef(null);\r
    const settings = {\r
      colors: toColors(sparkColor),\r
      size: Math.max(0, sparkSize),\r
      radius: Math.max(0, sparkRadius) * Math.max(0, extraScale),\r
      count: clamp(Math.round(sparkCount), 1, 64),\r
      width: Math.max(0.5, sparkWidth),\r
      duration: Math.max(60, duration),\r
      ease: EASINGS[easing] ?? EASINGS['ease-out'],\r
      shape: SHAPES.includes(shape) ? shape : 'line',\r
      randomness: clamp(randomness, 0, 1),\r
      gravity: Math.max(0, gravity),\r
      spread: clamp(spread, 0, 360),\r
      direction,\r
      glow: clamp(glow, 0, 1),\r
      ring,\r
      disabled\r
    };\r
    const settingsRef = useRef(settings);\r
    settingsRef.current = settings;\r
\r
    useEffect(() => {\r
      const root = rootRef.current;\r
      const layer = layerRef.current;\r
      if (!root || !layer) return;\r
\r
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
      const bursts = [];\r
      let raf = 0;\r
      let lastPress = { time: -1e9, x: 0, y: 0 };\r
\r
      const drop = (s, seconds) => 0.5 * s.gravity * GRAVITY * seconds * seconds;\r
\r
      const position = (burst, spark, distance, seconds) => [\r
        burst.x + Math.cos(spark.angle) * distance,\r
        burst.y + Math.sin(spark.angle) * distance + drop(burst.settings, seconds)\r
      ];\r
\r
      const drawSpark = (ctx, burst, spark, elapsed) => {\r
        const s = burst.settings;\r
        const life = reduced ? REDUCED_MS : s.duration * spark.life;\r
        const p = elapsed / life;\r
        if (p >= 1) return false;\r
        const e = reduced ? 0.55 : s.ease(clamp(p, 0, 1));\r
        const seconds = reduced ? 0 : elapsed / 1000;\r
        const distance = s.radius * spark.reach * e;\r
        const width = s.width * spark.scale;\r
        const fade = reduced ? 1 - p : 1 - smoothstep(s.shape === 'line' ? 0.55 : 0.7, 1, p);\r
        if (fade <= 0) return true;\r
        ctx.strokeStyle = spark.color;\r
        ctx.fillStyle = spark.color;\r
\r
        if (s.shape === 'line') {\r
          const length = s.size * spark.scale * (reduced ? 0.5 : Math.pow(1 - p, 1.6));\r
          const [x1, y1] = position(burst, spark, distance, seconds);\r
          const [x2, y2] = position(burst, spark, distance + Math.max(0.01, length), seconds);\r
          ctx.lineCap = 'round';\r
          if (spark.glow > 0) {\r
            ctx.globalAlpha = fade * 0.14 * spark.glow;\r
            ctx.lineWidth = width * 4.5;\r
            ctx.beginPath();\r
            ctx.moveTo(x1, y1);\r
            ctx.lineTo(x2, y2);\r
            ctx.stroke();\r
          }\r
          ctx.globalAlpha = fade;\r
          ctx.lineWidth = width;\r
          ctx.beginPath();\r
          ctx.moveTo(x1, y1);\r
          ctx.lineTo(x2, y2);\r
          ctx.stroke();\r
          return true;\r
        }\r
\r
        if (s.shape === 'streak') {\r
          const lag = reduced ? 0 : Math.min(elapsed, 70 + s.size * 4 * spark.scale);\r
          const back = reduced ? 0.4 : s.ease(clamp((elapsed - lag) / life, 0, 1));\r
          const [hx, hy] = position(burst, spark, distance, seconds);\r
          const [tx, ty] = position(burst, spark, s.radius * spark.reach * back, Math.max(0, seconds - lag / 1000));\r
          const dx = hx - tx;\r
          const dy = hy - ty;\r
          const length = Math.hypot(dx, dy) || 1;\r
          const nx = (-dy / length) * width * 0.5;\r
          const ny = (dx / length) * width * 0.5;\r
          const paint = (spreadWidth, alpha) => {\r
            const gradient = ctx.createLinearGradient(tx, ty, hx, hy);\r
            gradient.addColorStop(0, spark.clear);\r
            gradient.addColorStop(1, spark.color);\r
            ctx.globalAlpha = alpha;\r
            ctx.fillStyle = gradient;\r
            ctx.beginPath();\r
            ctx.moveTo(tx, ty);\r
            ctx.lineTo(hx + nx * spreadWidth, hy + ny * spreadWidth);\r
            ctx.lineTo(hx - nx * spreadWidth, hy - ny * spreadWidth);\r
            ctx.closePath();\r
            ctx.fill();\r
            ctx.fillStyle = spark.color;\r
            ctx.beginPath();\r
            ctx.arc(hx, hy, width * 0.5 * spreadWidth, 0, Math.PI * 2);\r
            ctx.fill();\r
          };\r
          if (spark.glow > 0) paint(3.2, fade * 0.16 * spark.glow);\r
          paint(1, fade);\r
          return true;\r
        }\r
\r
        if (s.shape === 'dot') {\r
          const [x, y] = position(burst, spark, distance, seconds);\r
          const radius = width * 1.25 * (1 - 0.5 * e);\r
          if (spark.glow > 0) {\r
            ctx.globalAlpha = fade * 0.18 * spark.glow;\r
            ctx.beginPath();\r
            ctx.arc(x, y, radius * 2.6, 0, Math.PI * 2);\r
            ctx.fill();\r
          }\r
          ctx.globalAlpha = fade;\r
          ctx.beginPath();\r
          ctx.arc(x, y, radius, 0, Math.PI * 2);\r
          ctx.fill();\r
          return true;\r
        }\r
\r
        const [x, y] = position(burst, spark, distance, seconds);\r
        const twinkle = reduced ? 1 - p : Math.pow(Math.sin(Math.PI * clamp(p * 1.1, 0, 1)), 0.7);\r
        const radius = s.size * 0.6 * spark.scale * twinkle;\r
        const rotation = spark.angle + spark.spin * p * Math.PI * 0.5;\r
        if (radius <= 0.05) return true;\r
        if (spark.glow > 0) {\r
          ctx.globalAlpha = fade * 0.2 * spark.glow;\r
          ctx.beginPath();\r
          ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);\r
          ctx.fill();\r
        }\r
        ctx.globalAlpha = fade;\r
        starPath(ctx, x, y, radius, rotation);\r
        ctx.fill();\r
        return true;\r
      };\r
\r
      const drawRing = (ctx, burst, elapsed) => {\r
        const s = burst.settings;\r
        const life = reduced ? REDUCED_MS : s.duration * 0.8;\r
        const p = elapsed / life;\r
        if (p >= 1) return false;\r
        const radius = 2 + s.radius * 0.6 * (reduced ? 0.6 : EASINGS['ease-out'](p));\r
        ctx.globalAlpha = Math.pow(1 - p, 2) * 0.7;\r
        ctx.strokeStyle = burst.sparks[0]?.color ?? s.colors[0];\r
        ctx.lineWidth = Math.max(0.5, s.width * (1 - p) * 0.9);\r
        ctx.beginPath();\r
        ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);\r
        ctx.stroke();\r
        return true;\r
      };\r
\r
      const remove = burst => {\r
        burst.canvas.remove();\r
        const index = bursts.indexOf(burst);\r
        if (index >= 0) bursts.splice(index, 1);\r
      };\r
\r
      const frame = now => {\r
        raf = 0;\r
        for (const burst of [...bursts]) {\r
          const elapsed = now - burst.start;\r
          const ctx = burst.ctx;\r
          ctx.setTransform(1, 0, 0, 1, 0, 0);\r
          ctx.clearRect(0, 0, burst.canvas.width, burst.canvas.height);\r
          ctx.setTransform(burst.ratio, 0, 0, burst.ratio, -burst.left * burst.ratio, -burst.top * burst.ratio);\r
          let alive = false;\r
          if (burst.settings.ring && drawRing(ctx, burst, elapsed)) alive = true;\r
          for (const spark of burst.sparks) {\r
            if (drawSpark(ctx, burst, spark, elapsed)) alive = true;\r
          }\r
          ctx.globalAlpha = 1;\r
          if (!alive) remove(burst);\r
        }\r
        if (bursts.length) raf = requestAnimationFrame(frame);\r
      };\r
\r
      const spawn = (clientX, clientY) => {\r
        const s = settingsRef.current;\r
        if (s.disabled) return;\r
        const rect = root.getBoundingClientRect();\r
        const offset = Math.floor(Math.random() * s.colors.length);\r
        const full = s.spread >= 359.5;\r
        const arc = (s.spread * Math.PI) / 180;\r
        const heading = ((s.direction - 90) * Math.PI) / 180;\r
        const step = full ? (Math.PI * 2) / s.count : s.count > 1 ? arc / (s.count - 1) : 0;\r
        const sparks = Array.from({ length: s.count }, (_, i) => {\r
          const base = full ? heading + step * i : s.count > 1 ? heading - arc / 2 + step * i : heading;\r
          const jitter = (Math.random() - 0.5) * s.randomness;\r
          return {\r
            angle: base + jitter * (step || arc || 1) * 0.9,\r
            reach: 1 + (Math.random() - 0.5) * 0.7 * s.randomness,\r
            scale: 1 + (Math.random() - 0.5) * 0.8 * s.randomness,\r
            life: 1 + (Math.random() - 0.5) * 0.5 * s.randomness,\r
            spin: Math.random() - 0.5,\r
            color: s.colors[(i + offset) % s.colors.length],\r
            clear: '',\r
            glow: 0\r
          };\r
        });\r
        const longest = s.duration * (1 + 0.25 * s.randomness);\r
        const fall = drop(s, longest / 1000);\r
        const reach =\r
          s.radius * (1 + 0.35 * s.randomness) * (s.ease === EASINGS.spring ? 1.15 : 1) +\r
          s.size * (1 + 0.4 * s.randomness) +\r
          s.width * (s.glow > 0 ? 6 : 2) +\r
          6;\r
        const box = {\r
          left: Math.max(clientX - reach, 0),\r
          top: Math.max(clientY - reach, 0),\r
          right: Math.min(clientX + reach, window.innerWidth),\r
          bottom: Math.min(clientY + reach + fall, window.innerHeight)\r
        };\r
        if (box.right - box.left < 1 || box.bottom - box.top < 1) return;\r
        const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
        const canvas = document.createElement('canvas');\r
        canvas.width = Math.ceil((box.right - box.left) * ratio);\r
        canvas.height = Math.ceil((box.bottom - box.top) * ratio);\r
        Object.assign(canvas.style, {\r
          position: 'absolute',\r
          left: \`\${box.left - rect.left}px\`,\r
          top: \`\${box.top - rect.top}px\`,\r
          width: \`\${box.right - box.left}px\`,\r
          height: \`\${box.bottom - box.top}px\`,\r
          display: 'block',\r
          pointerEvents: 'none'\r
        });\r
        canvas.setAttribute('aria-hidden', 'true');\r
        layer.appendChild(canvas);\r
        const ctx = canvas.getContext('2d');\r
        if (!ctx) {\r
          canvas.remove();\r
          return;\r
        }\r
        for (const spark of sparks) {\r
          const [r, g, b] = channels(ctx, spark.color);\r
          spark.clear = \`rgba(\${r}, \${g}, \${b}, 0)\`;\r
          spark.glow = s.glow * (0.35 + 0.65 * ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255));\r
        }\r
        bursts.push({\r
          x: clientX,\r
          y: clientY,\r
          start: performance.now(),\r
          sparks,\r
          settings: { ...s },\r
          canvas,\r
          ctx,\r
          ratio,\r
          left: box.left,\r
          top: box.top\r
        });\r
        while (bursts.length > MAX_BURSTS) remove(bursts[0]);\r
        if (!raf) raf = requestAnimationFrame(frame);\r
      };\r
\r
      const onPointerDown = event => {\r
        if (event.pointerType !== 'mouse' || event.button !== 0) return;\r
        lastPress = { time: performance.now(), x: event.clientX, y: event.clientY };\r
        spawn(event.clientX, event.clientY);\r
      };\r
\r
      const onClick = event => {\r
        if ('pointerType' in event && event.pointerType === 'mouse') return;\r
        if (event.detail === 0) {\r
          const target = event.target instanceof Element ? event.target : root;\r
          const rect = target.getBoundingClientRect();\r
          spawn(rect.left + rect.width / 2, rect.top + rect.height / 2);\r
          return;\r
        }\r
        const recent =\r
          performance.now() - lastPress.time < 700 &&\r
          Math.hypot(event.clientX - lastPress.x, event.clientY - lastPress.y) < 12;\r
        if (!recent) spawn(event.clientX, event.clientY);\r
      };\r
\r
      root.addEventListener('pointerdown', onPointerDown);\r
      root.addEventListener('click', onClick);\r
\r
      engineRef.current = {\r
        spark: (x, y) => {\r
          const rect = root.getBoundingClientRect();\r
          spawn(rect.left + (x ?? rect.width / 2), rect.top + (y ?? rect.height / 2));\r
        }\r
      };\r
\r
      return () => {\r
        cancelAnimationFrame(raf);\r
        root.removeEventListener('pointerdown', onPointerDown);\r
        root.removeEventListener('click', onClick);\r
        for (const burst of [...bursts]) remove(burst);\r
        engineRef.current = null;\r
      };\r
    }, []);\r
\r
    useImperativeHandle(\r
      ref,\r
      () => ({\r
        spark: (x, y) => engineRef.current?.spark(x, y)\r
      }),\r
      []\r
    );\r
\r
    return (\r
      <div\r
        ref={rootRef}\r
        className={className}\r
        style={{ position: 'relative', width: '100%', height: '100%', isolation: 'isolate', ...style }}\r
      >\r
        {children}\r
        <span\r
          ref={layerRef}\r
          aria-hidden="true"\r
          style={{\r
            position: 'absolute',\r
            inset: 0,\r
            zIndex: layer === 'back' ? -1 : 1,\r
            overflow: 'visible',\r
            pointerEvents: 'none'\r
          }}\r
        />\r
      </div>\r
    );\r
  }\r
);\r
\r
ClickSpark.displayName = 'ClickSpark';\r
\r
export default ClickSpark;\r
`,n=`'use client';\r
\r
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';\r
\r
const EASINGS = {\r
  linear: t => t,\r
  'ease-in': t => t * t,\r
  'ease-out': t => 1 - Math.pow(1 - t, 3),\r
  'ease-in-out': t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),\r
  spring: t => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)\r
};\r
\r
const SHAPES = ['line', 'streak', 'dot', 'star'];\r
const MAX_BURSTS = 32;\r
const GRAVITY = 500;\r
const REDUCED_MS = 320;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const smoothstep = (a, b, x) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const toColors = value => {\r
  const list = (Array.isArray(value) ? value : [value]).filter(Boolean);\r
  return list.length ? list : ['#ffffff'];\r
};\r
\r
const starPath = (ctx, x, y, radius, rotation) => {\r
  const pinch = radius * 0.16;\r
  ctx.beginPath();\r
  ctx.moveTo(x + Math.cos(rotation) * radius, y + Math.sin(rotation) * radius);\r
  for (let i = 1; i <= 4; i++) {\r
    const a = rotation + (i * Math.PI) / 2;\r
    const mid = a - Math.PI / 4;\r
    ctx.quadraticCurveTo(\r
      x + Math.cos(mid) * pinch,\r
      y + Math.sin(mid) * pinch,\r
      x + Math.cos(a) * radius,\r
      y + Math.sin(a) * radius\r
    );\r
  }\r
  ctx.closePath();\r
};\r
\r
const channels = (ctx, color) => {\r
  ctx.fillStyle = color;\r
  const normal = String(ctx.fillStyle);\r
  const hex = /^#([0-9a-f]{6})$/i.exec(normal);\r
  if (hex) {\r
    const value = parseInt(hex[1], 16);\r
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];\r
  }\r
  const rgb = /^rgba?\\(([^)]+)\\)$/i.exec(normal);\r
  if (rgb)\r
    return rgb[1]\r
      .split(',')\r
      .slice(0, 3)\r
      .map(part => parseFloat(part));\r
  return [0, 0, 0];\r
};\r
\r
const ClickSpark = forwardRef(\r
  (\r
    {\r
      sparkColor = '#fff',\r
      sparkSize = 14,\r
      sparkRadius = 30,\r
      sparkCount = 8,\r
      sparkWidth = 2,\r
      duration = 500,\r
      easing = 'ease-out',\r
      extraScale = 1,\r
      shape = 'line',\r
      randomness = 0.2,\r
      gravity = 0,\r
      spread = 360,\r
      direction = 0,\r
      glow = 0,\r
      ring = false,\r
      layer = 'front',\r
      disabled = false,\r
      className = '',\r
      style,\r
      children\r
    },\r
    ref\r
  ) => {\r
    const rootRef = useRef(null);\r
    const layerRef = useRef(null);\r
    const engineRef = useRef(null);\r
    const settings = {\r
      colors: toColors(sparkColor),\r
      size: Math.max(0, sparkSize),\r
      radius: Math.max(0, sparkRadius) * Math.max(0, extraScale),\r
      count: clamp(Math.round(sparkCount), 1, 64),\r
      width: Math.max(0.5, sparkWidth),\r
      duration: Math.max(60, duration),\r
      ease: EASINGS[easing] ?? EASINGS['ease-out'],\r
      shape: SHAPES.includes(shape) ? shape : 'line',\r
      randomness: clamp(randomness, 0, 1),\r
      gravity: Math.max(0, gravity),\r
      spread: clamp(spread, 0, 360),\r
      direction,\r
      glow: clamp(glow, 0, 1),\r
      ring,\r
      disabled\r
    };\r
    const settingsRef = useRef(settings);\r
    settingsRef.current = settings;\r
\r
    useEffect(() => {\r
      const root = rootRef.current;\r
      const layer = layerRef.current;\r
      if (!root || !layer) return;\r
\r
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
      const bursts = [];\r
      let raf = 0;\r
      let lastPress = { time: -1e9, x: 0, y: 0 };\r
\r
      const drop = (s, seconds) => 0.5 * s.gravity * GRAVITY * seconds * seconds;\r
\r
      const position = (burst, spark, distance, seconds) => [\r
        burst.x + Math.cos(spark.angle) * distance,\r
        burst.y + Math.sin(spark.angle) * distance + drop(burst.settings, seconds)\r
      ];\r
\r
      const drawSpark = (ctx, burst, spark, elapsed) => {\r
        const s = burst.settings;\r
        const life = reduced ? REDUCED_MS : s.duration * spark.life;\r
        const p = elapsed / life;\r
        if (p >= 1) return false;\r
        const e = reduced ? 0.55 : s.ease(clamp(p, 0, 1));\r
        const seconds = reduced ? 0 : elapsed / 1000;\r
        const distance = s.radius * spark.reach * e;\r
        const width = s.width * spark.scale;\r
        const fade = reduced ? 1 - p : 1 - smoothstep(s.shape === 'line' ? 0.55 : 0.7, 1, p);\r
        if (fade <= 0) return true;\r
        ctx.strokeStyle = spark.color;\r
        ctx.fillStyle = spark.color;\r
\r
        if (s.shape === 'line') {\r
          const length = s.size * spark.scale * (reduced ? 0.5 : Math.pow(1 - p, 1.6));\r
          const [x1, y1] = position(burst, spark, distance, seconds);\r
          const [x2, y2] = position(burst, spark, distance + Math.max(0.01, length), seconds);\r
          ctx.lineCap = 'round';\r
          if (spark.glow > 0) {\r
            ctx.globalAlpha = fade * 0.14 * spark.glow;\r
            ctx.lineWidth = width * 4.5;\r
            ctx.beginPath();\r
            ctx.moveTo(x1, y1);\r
            ctx.lineTo(x2, y2);\r
            ctx.stroke();\r
          }\r
          ctx.globalAlpha = fade;\r
          ctx.lineWidth = width;\r
          ctx.beginPath();\r
          ctx.moveTo(x1, y1);\r
          ctx.lineTo(x2, y2);\r
          ctx.stroke();\r
          return true;\r
        }\r
\r
        if (s.shape === 'streak') {\r
          const lag = reduced ? 0 : Math.min(elapsed, 70 + s.size * 4 * spark.scale);\r
          const back = reduced ? 0.4 : s.ease(clamp((elapsed - lag) / life, 0, 1));\r
          const [hx, hy] = position(burst, spark, distance, seconds);\r
          const [tx, ty] = position(burst, spark, s.radius * spark.reach * back, Math.max(0, seconds - lag / 1000));\r
          const dx = hx - tx;\r
          const dy = hy - ty;\r
          const length = Math.hypot(dx, dy) || 1;\r
          const nx = (-dy / length) * width * 0.5;\r
          const ny = (dx / length) * width * 0.5;\r
          const paint = (spreadWidth, alpha) => {\r
            const gradient = ctx.createLinearGradient(tx, ty, hx, hy);\r
            gradient.addColorStop(0, spark.clear);\r
            gradient.addColorStop(1, spark.color);\r
            ctx.globalAlpha = alpha;\r
            ctx.fillStyle = gradient;\r
            ctx.beginPath();\r
            ctx.moveTo(tx, ty);\r
            ctx.lineTo(hx + nx * spreadWidth, hy + ny * spreadWidth);\r
            ctx.lineTo(hx - nx * spreadWidth, hy - ny * spreadWidth);\r
            ctx.closePath();\r
            ctx.fill();\r
            ctx.fillStyle = spark.color;\r
            ctx.beginPath();\r
            ctx.arc(hx, hy, width * 0.5 * spreadWidth, 0, Math.PI * 2);\r
            ctx.fill();\r
          };\r
          if (spark.glow > 0) paint(3.2, fade * 0.16 * spark.glow);\r
          paint(1, fade);\r
          return true;\r
        }\r
\r
        if (s.shape === 'dot') {\r
          const [x, y] = position(burst, spark, distance, seconds);\r
          const radius = width * 1.25 * (1 - 0.5 * e);\r
          if (spark.glow > 0) {\r
            ctx.globalAlpha = fade * 0.18 * spark.glow;\r
            ctx.beginPath();\r
            ctx.arc(x, y, radius * 2.6, 0, Math.PI * 2);\r
            ctx.fill();\r
          }\r
          ctx.globalAlpha = fade;\r
          ctx.beginPath();\r
          ctx.arc(x, y, radius, 0, Math.PI * 2);\r
          ctx.fill();\r
          return true;\r
        }\r
\r
        const [x, y] = position(burst, spark, distance, seconds);\r
        const twinkle = reduced ? 1 - p : Math.pow(Math.sin(Math.PI * clamp(p * 1.1, 0, 1)), 0.7);\r
        const radius = s.size * 0.6 * spark.scale * twinkle;\r
        const rotation = spark.angle + spark.spin * p * Math.PI * 0.5;\r
        if (radius <= 0.05) return true;\r
        if (spark.glow > 0) {\r
          ctx.globalAlpha = fade * 0.2 * spark.glow;\r
          ctx.beginPath();\r
          ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);\r
          ctx.fill();\r
        }\r
        ctx.globalAlpha = fade;\r
        starPath(ctx, x, y, radius, rotation);\r
        ctx.fill();\r
        return true;\r
      };\r
\r
      const drawRing = (ctx, burst, elapsed) => {\r
        const s = burst.settings;\r
        const life = reduced ? REDUCED_MS : s.duration * 0.8;\r
        const p = elapsed / life;\r
        if (p >= 1) return false;\r
        const radius = 2 + s.radius * 0.6 * (reduced ? 0.6 : EASINGS['ease-out'](p));\r
        ctx.globalAlpha = Math.pow(1 - p, 2) * 0.7;\r
        ctx.strokeStyle = burst.sparks[0]?.color ?? s.colors[0];\r
        ctx.lineWidth = Math.max(0.5, s.width * (1 - p) * 0.9);\r
        ctx.beginPath();\r
        ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);\r
        ctx.stroke();\r
        return true;\r
      };\r
\r
      const remove = burst => {\r
        burst.canvas.remove();\r
        const index = bursts.indexOf(burst);\r
        if (index >= 0) bursts.splice(index, 1);\r
      };\r
\r
      const frame = now => {\r
        raf = 0;\r
        for (const burst of [...bursts]) {\r
          const elapsed = now - burst.start;\r
          const ctx = burst.ctx;\r
          ctx.setTransform(1, 0, 0, 1, 0, 0);\r
          ctx.clearRect(0, 0, burst.canvas.width, burst.canvas.height);\r
          ctx.setTransform(burst.ratio, 0, 0, burst.ratio, -burst.left * burst.ratio, -burst.top * burst.ratio);\r
          let alive = false;\r
          if (burst.settings.ring && drawRing(ctx, burst, elapsed)) alive = true;\r
          for (const spark of burst.sparks) {\r
            if (drawSpark(ctx, burst, spark, elapsed)) alive = true;\r
          }\r
          ctx.globalAlpha = 1;\r
          if (!alive) remove(burst);\r
        }\r
        if (bursts.length) raf = requestAnimationFrame(frame);\r
      };\r
\r
      const spawn = (clientX, clientY) => {\r
        const s = settingsRef.current;\r
        if (s.disabled) return;\r
        const rect = root.getBoundingClientRect();\r
        const offset = Math.floor(Math.random() * s.colors.length);\r
        const full = s.spread >= 359.5;\r
        const arc = (s.spread * Math.PI) / 180;\r
        const heading = ((s.direction - 90) * Math.PI) / 180;\r
        const step = full ? (Math.PI * 2) / s.count : s.count > 1 ? arc / (s.count - 1) : 0;\r
        const sparks = Array.from({ length: s.count }, (_, i) => {\r
          const base = full ? heading + step * i : s.count > 1 ? heading - arc / 2 + step * i : heading;\r
          const jitter = (Math.random() - 0.5) * s.randomness;\r
          return {\r
            angle: base + jitter * (step || arc || 1) * 0.9,\r
            reach: 1 + (Math.random() - 0.5) * 0.7 * s.randomness,\r
            scale: 1 + (Math.random() - 0.5) * 0.8 * s.randomness,\r
            life: 1 + (Math.random() - 0.5) * 0.5 * s.randomness,\r
            spin: Math.random() - 0.5,\r
            color: s.colors[(i + offset) % s.colors.length],\r
            clear: '',\r
            glow: 0\r
          };\r
        });\r
        const longest = s.duration * (1 + 0.25 * s.randomness);\r
        const fall = drop(s, longest / 1000);\r
        const reach =\r
          s.radius * (1 + 0.35 * s.randomness) * (s.ease === EASINGS.spring ? 1.15 : 1) +\r
          s.size * (1 + 0.4 * s.randomness) +\r
          s.width * (s.glow > 0 ? 6 : 2) +\r
          6;\r
        const box = {\r
          left: Math.max(clientX - reach, 0),\r
          top: Math.max(clientY - reach, 0),\r
          right: Math.min(clientX + reach, window.innerWidth),\r
          bottom: Math.min(clientY + reach + fall, window.innerHeight)\r
        };\r
        if (box.right - box.left < 1 || box.bottom - box.top < 1) return;\r
        const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
        const canvas = document.createElement('canvas');\r
        canvas.width = Math.ceil((box.right - box.left) * ratio);\r
        canvas.height = Math.ceil((box.bottom - box.top) * ratio);\r
        Object.assign(canvas.style, {\r
          position: 'absolute',\r
          left: \`\${box.left - rect.left}px\`,\r
          top: \`\${box.top - rect.top}px\`,\r
          width: \`\${box.right - box.left}px\`,\r
          height: \`\${box.bottom - box.top}px\`,\r
          display: 'block',\r
          pointerEvents: 'none'\r
        });\r
        canvas.setAttribute('aria-hidden', 'true');\r
        layer.appendChild(canvas);\r
        const ctx = canvas.getContext('2d');\r
        if (!ctx) {\r
          canvas.remove();\r
          return;\r
        }\r
        for (const spark of sparks) {\r
          const [r, g, b] = channels(ctx, spark.color);\r
          spark.clear = \`rgba(\${r}, \${g}, \${b}, 0)\`;\r
          spark.glow = s.glow * (0.35 + 0.65 * ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255));\r
        }\r
        bursts.push({\r
          x: clientX,\r
          y: clientY,\r
          start: performance.now(),\r
          sparks,\r
          settings: { ...s },\r
          canvas,\r
          ctx,\r
          ratio,\r
          left: box.left,\r
          top: box.top\r
        });\r
        while (bursts.length > MAX_BURSTS) remove(bursts[0]);\r
        if (!raf) raf = requestAnimationFrame(frame);\r
      };\r
\r
      const onPointerDown = event => {\r
        if (event.pointerType !== 'mouse' || event.button !== 0) return;\r
        lastPress = { time: performance.now(), x: event.clientX, y: event.clientY };\r
        spawn(event.clientX, event.clientY);\r
      };\r
\r
      const onClick = event => {\r
        if ('pointerType' in event && event.pointerType === 'mouse') return;\r
        if (event.detail === 0) {\r
          const target = event.target instanceof Element ? event.target : root;\r
          const rect = target.getBoundingClientRect();\r
          spawn(rect.left + rect.width / 2, rect.top + rect.height / 2);\r
          return;\r
        }\r
        const recent =\r
          performance.now() - lastPress.time < 700 &&\r
          Math.hypot(event.clientX - lastPress.x, event.clientY - lastPress.y) < 12;\r
        if (!recent) spawn(event.clientX, event.clientY);\r
      };\r
\r
      root.addEventListener('pointerdown', onPointerDown);\r
      root.addEventListener('click', onClick);\r
\r
      engineRef.current = {\r
        spark: (x, y) => {\r
          const rect = root.getBoundingClientRect();\r
          spawn(rect.left + (x ?? rect.width / 2), rect.top + (y ?? rect.height / 2));\r
        }\r
      };\r
\r
      return () => {\r
        cancelAnimationFrame(raf);\r
        root.removeEventListener('pointerdown', onPointerDown);\r
        root.removeEventListener('click', onClick);\r
        for (const burst of [...bursts]) remove(burst);\r
        engineRef.current = null;\r
      };\r
    }, []);\r
\r
    useImperativeHandle(\r
      ref,\r
      () => ({\r
        spark: (x, y) => engineRef.current?.spark(x, y)\r
      }),\r
      []\r
    );\r
\r
    return (\r
      <div ref={rootRef} className={\`relative isolate h-full w-full \${className}\`.trim()} style={style}>\r
        {children}\r
        <span\r
          ref={layerRef}\r
          aria-hidden="true"\r
          className={\`pointer-events-none absolute inset-0 overflow-visible \${layer === 'back' ? 'z-[-1]' : 'z-[1]'}\`}\r
        />\r
      </div>\r
    );\r
  }\r
);\r
\r
ClickSpark.displayName = 'ClickSpark';\r
\r
export default ClickSpark;\r
`,t=`'use client';\r
\r
import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties, type ReactNode } from 'react';\r
\r
export type ClickSparkShape = 'line' | 'streak' | 'dot' | 'star';\r
\r
export type ClickSparkEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';\r
\r
export interface ClickSparkProps {\r
  sparkColor?: string | string[];\r
  sparkSize?: number;\r
  sparkRadius?: number;\r
  sparkCount?: number;\r
  sparkWidth?: number;\r
  duration?: number;\r
  easing?: ClickSparkEasing;\r
  extraScale?: number;\r
  shape?: ClickSparkShape;\r
  randomness?: number;\r
  gravity?: number;\r
  spread?: number;\r
  direction?: number;\r
  glow?: number;\r
  ring?: boolean;\r
  layer?: 'front' | 'back';\r
  disabled?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
  children?: ReactNode;\r
}\r
\r
export interface ClickSparkHandle {\r
  spark: (x?: number, y?: number) => void;\r
}\r
\r
interface Settings {\r
  colors: string[];\r
  size: number;\r
  radius: number;\r
  count: number;\r
  width: number;\r
  duration: number;\r
  ease: (t: number) => number;\r
  shape: ClickSparkShape;\r
  randomness: number;\r
  gravity: number;\r
  spread: number;\r
  direction: number;\r
  glow: number;\r
  ring: boolean;\r
  disabled: boolean;\r
}\r
\r
interface Spark {\r
  angle: number;\r
  reach: number;\r
  scale: number;\r
  life: number;\r
  spin: number;\r
  color: string;\r
  clear: string;\r
  glow: number;\r
}\r
\r
interface Burst {\r
  x: number;\r
  y: number;\r
  start: number;\r
  sparks: Spark[];\r
  settings: Settings;\r
  canvas: HTMLCanvasElement;\r
  ctx: CanvasRenderingContext2D;\r
  ratio: number;\r
  left: number;\r
  top: number;\r
}\r
\r
const EASINGS: Record<string, (t: number) => number> = {\r
  linear: t => t,\r
  'ease-in': t => t * t,\r
  'ease-out': t => 1 - Math.pow(1 - t, 3),\r
  'ease-in-out': t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),\r
  spring: t => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)\r
};\r
\r
const SHAPES: ClickSparkShape[] = ['line', 'streak', 'dot', 'star'];\r
const MAX_BURSTS = 32;\r
const GRAVITY = 500;\r
const REDUCED_MS = 320;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const smoothstep = (a: number, b: number, x: number) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const toColors = (value: string | string[]): string[] => {\r
  const list = (Array.isArray(value) ? value : [value]).filter(Boolean);\r
  return list.length ? list : ['#ffffff'];\r
};\r
\r
const starPath = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, rotation: number) => {\r
  const pinch = radius * 0.16;\r
  ctx.beginPath();\r
  ctx.moveTo(x + Math.cos(rotation) * radius, y + Math.sin(rotation) * radius);\r
  for (let i = 1; i <= 4; i++) {\r
    const a = rotation + (i * Math.PI) / 2;\r
    const mid = a - Math.PI / 4;\r
    ctx.quadraticCurveTo(\r
      x + Math.cos(mid) * pinch,\r
      y + Math.sin(mid) * pinch,\r
      x + Math.cos(a) * radius,\r
      y + Math.sin(a) * radius\r
    );\r
  }\r
  ctx.closePath();\r
};\r
\r
const channels = (ctx: CanvasRenderingContext2D, color: string): number[] => {\r
  ctx.fillStyle = color;\r
  const normal = String(ctx.fillStyle);\r
  const hex = /^#([0-9a-f]{6})$/i.exec(normal);\r
  if (hex) {\r
    const value = parseInt(hex[1], 16);\r
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];\r
  }\r
  const rgb = /^rgba?\\(([^)]+)\\)$/i.exec(normal);\r
  if (rgb)\r
    return rgb[1]\r
      .split(',')\r
      .slice(0, 3)\r
      .map(part => parseFloat(part));\r
  return [0, 0, 0];\r
};\r
\r
const ClickSpark = forwardRef<ClickSparkHandle, ClickSparkProps>(\r
  (\r
    {\r
      sparkColor = '#fff',\r
      sparkSize = 14,\r
      sparkRadius = 30,\r
      sparkCount = 8,\r
      sparkWidth = 2,\r
      duration = 500,\r
      easing = 'ease-out',\r
      extraScale = 1,\r
      shape = 'line',\r
      randomness = 0.2,\r
      gravity = 0,\r
      spread = 360,\r
      direction = 0,\r
      glow = 0,\r
      ring = false,\r
      layer = 'front',\r
      disabled = false,\r
      className = '',\r
      style,\r
      children\r
    },\r
    ref\r
  ) => {\r
    const rootRef = useRef<HTMLDivElement>(null);\r
    const layerRef = useRef<HTMLSpanElement>(null);\r
    const engineRef = useRef<ClickSparkHandle | null>(null);\r
    const settings: Settings = {\r
      colors: toColors(sparkColor),\r
      size: Math.max(0, sparkSize),\r
      radius: Math.max(0, sparkRadius) * Math.max(0, extraScale),\r
      count: clamp(Math.round(sparkCount), 1, 64),\r
      width: Math.max(0.5, sparkWidth),\r
      duration: Math.max(60, duration),\r
      ease: EASINGS[easing] ?? EASINGS['ease-out'],\r
      shape: SHAPES.includes(shape) ? shape : 'line',\r
      randomness: clamp(randomness, 0, 1),\r
      gravity: Math.max(0, gravity),\r
      spread: clamp(spread, 0, 360),\r
      direction,\r
      glow: clamp(glow, 0, 1),\r
      ring,\r
      disabled\r
    };\r
    const settingsRef = useRef(settings);\r
    settingsRef.current = settings;\r
\r
    useEffect(() => {\r
      const root = rootRef.current;\r
      const layer = layerRef.current;\r
      if (!root || !layer) return;\r
\r
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
      const bursts: Burst[] = [];\r
      let raf = 0;\r
      let lastPress = { time: -1e9, x: 0, y: 0 };\r
\r
      const drop = (s: Settings, seconds: number) => 0.5 * s.gravity * GRAVITY * seconds * seconds;\r
\r
      const position = (burst: Burst, spark: Spark, distance: number, seconds: number) => [\r
        burst.x + Math.cos(spark.angle) * distance,\r
        burst.y + Math.sin(spark.angle) * distance + drop(burst.settings, seconds)\r
      ];\r
\r
      const drawSpark = (ctx: CanvasRenderingContext2D, burst: Burst, spark: Spark, elapsed: number) => {\r
        const s = burst.settings;\r
        const life = reduced ? REDUCED_MS : s.duration * spark.life;\r
        const p = elapsed / life;\r
        if (p >= 1) return false;\r
        const e = reduced ? 0.55 : s.ease(clamp(p, 0, 1));\r
        const seconds = reduced ? 0 : elapsed / 1000;\r
        const distance = s.radius * spark.reach * e;\r
        const width = s.width * spark.scale;\r
        const fade = reduced ? 1 - p : 1 - smoothstep(s.shape === 'line' ? 0.55 : 0.7, 1, p);\r
        if (fade <= 0) return true;\r
        ctx.strokeStyle = spark.color;\r
        ctx.fillStyle = spark.color;\r
\r
        if (s.shape === 'line') {\r
          const length = s.size * spark.scale * (reduced ? 0.5 : Math.pow(1 - p, 1.6));\r
          const [x1, y1] = position(burst, spark, distance, seconds);\r
          const [x2, y2] = position(burst, spark, distance + Math.max(0.01, length), seconds);\r
          ctx.lineCap = 'round';\r
          if (spark.glow > 0) {\r
            ctx.globalAlpha = fade * 0.14 * spark.glow;\r
            ctx.lineWidth = width * 4.5;\r
            ctx.beginPath();\r
            ctx.moveTo(x1, y1);\r
            ctx.lineTo(x2, y2);\r
            ctx.stroke();\r
          }\r
          ctx.globalAlpha = fade;\r
          ctx.lineWidth = width;\r
          ctx.beginPath();\r
          ctx.moveTo(x1, y1);\r
          ctx.lineTo(x2, y2);\r
          ctx.stroke();\r
          return true;\r
        }\r
\r
        if (s.shape === 'streak') {\r
          const lag = reduced ? 0 : Math.min(elapsed, 70 + s.size * 4 * spark.scale);\r
          const back = reduced ? 0.4 : s.ease(clamp((elapsed - lag) / life, 0, 1));\r
          const [hx, hy] = position(burst, spark, distance, seconds);\r
          const [tx, ty] = position(burst, spark, s.radius * spark.reach * back, Math.max(0, seconds - lag / 1000));\r
          const dx = hx - tx;\r
          const dy = hy - ty;\r
          const length = Math.hypot(dx, dy) || 1;\r
          const nx = (-dy / length) * width * 0.5;\r
          const ny = (dx / length) * width * 0.5;\r
          const paint = (spreadWidth: number, alpha: number) => {\r
            const gradient = ctx.createLinearGradient(tx, ty, hx, hy);\r
            gradient.addColorStop(0, spark.clear);\r
            gradient.addColorStop(1, spark.color);\r
            ctx.globalAlpha = alpha;\r
            ctx.fillStyle = gradient;\r
            ctx.beginPath();\r
            ctx.moveTo(tx, ty);\r
            ctx.lineTo(hx + nx * spreadWidth, hy + ny * spreadWidth);\r
            ctx.lineTo(hx - nx * spreadWidth, hy - ny * spreadWidth);\r
            ctx.closePath();\r
            ctx.fill();\r
            ctx.fillStyle = spark.color;\r
            ctx.beginPath();\r
            ctx.arc(hx, hy, width * 0.5 * spreadWidth, 0, Math.PI * 2);\r
            ctx.fill();\r
          };\r
          if (spark.glow > 0) paint(3.2, fade * 0.16 * spark.glow);\r
          paint(1, fade);\r
          return true;\r
        }\r
\r
        if (s.shape === 'dot') {\r
          const [x, y] = position(burst, spark, distance, seconds);\r
          const radius = width * 1.25 * (1 - 0.5 * e);\r
          if (spark.glow > 0) {\r
            ctx.globalAlpha = fade * 0.18 * spark.glow;\r
            ctx.beginPath();\r
            ctx.arc(x, y, radius * 2.6, 0, Math.PI * 2);\r
            ctx.fill();\r
          }\r
          ctx.globalAlpha = fade;\r
          ctx.beginPath();\r
          ctx.arc(x, y, radius, 0, Math.PI * 2);\r
          ctx.fill();\r
          return true;\r
        }\r
\r
        const [x, y] = position(burst, spark, distance, seconds);\r
        const twinkle = reduced ? 1 - p : Math.pow(Math.sin(Math.PI * clamp(p * 1.1, 0, 1)), 0.7);\r
        const radius = s.size * 0.6 * spark.scale * twinkle;\r
        const rotation = spark.angle + spark.spin * p * Math.PI * 0.5;\r
        if (radius <= 0.05) return true;\r
        if (spark.glow > 0) {\r
          ctx.globalAlpha = fade * 0.2 * spark.glow;\r
          ctx.beginPath();\r
          ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);\r
          ctx.fill();\r
        }\r
        ctx.globalAlpha = fade;\r
        starPath(ctx, x, y, radius, rotation);\r
        ctx.fill();\r
        return true;\r
      };\r
\r
      const drawRing = (ctx: CanvasRenderingContext2D, burst: Burst, elapsed: number) => {\r
        const s = burst.settings;\r
        const life = reduced ? REDUCED_MS : s.duration * 0.8;\r
        const p = elapsed / life;\r
        if (p >= 1) return false;\r
        const radius = 2 + s.radius * 0.6 * (reduced ? 0.6 : EASINGS['ease-out'](p));\r
        ctx.globalAlpha = Math.pow(1 - p, 2) * 0.7;\r
        ctx.strokeStyle = burst.sparks[0]?.color ?? s.colors[0];\r
        ctx.lineWidth = Math.max(0.5, s.width * (1 - p) * 0.9);\r
        ctx.beginPath();\r
        ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);\r
        ctx.stroke();\r
        return true;\r
      };\r
\r
      const remove = (burst: Burst) => {\r
        burst.canvas.remove();\r
        const index = bursts.indexOf(burst);\r
        if (index >= 0) bursts.splice(index, 1);\r
      };\r
\r
      const frame = (now: number) => {\r
        raf = 0;\r
        for (const burst of [...bursts]) {\r
          const elapsed = now - burst.start;\r
          const ctx = burst.ctx;\r
          ctx.setTransform(1, 0, 0, 1, 0, 0);\r
          ctx.clearRect(0, 0, burst.canvas.width, burst.canvas.height);\r
          ctx.setTransform(burst.ratio, 0, 0, burst.ratio, -burst.left * burst.ratio, -burst.top * burst.ratio);\r
          let alive = false;\r
          if (burst.settings.ring && drawRing(ctx, burst, elapsed)) alive = true;\r
          for (const spark of burst.sparks) {\r
            if (drawSpark(ctx, burst, spark, elapsed)) alive = true;\r
          }\r
          ctx.globalAlpha = 1;\r
          if (!alive) remove(burst);\r
        }\r
        if (bursts.length) raf = requestAnimationFrame(frame);\r
      };\r
\r
      const spawn = (clientX: number, clientY: number) => {\r
        const s = settingsRef.current;\r
        if (s.disabled) return;\r
        const rect = root.getBoundingClientRect();\r
        const offset = Math.floor(Math.random() * s.colors.length);\r
        const full = s.spread >= 359.5;\r
        const arc = (s.spread * Math.PI) / 180;\r
        const heading = ((s.direction - 90) * Math.PI) / 180;\r
        const step = full ? (Math.PI * 2) / s.count : s.count > 1 ? arc / (s.count - 1) : 0;\r
        const sparks: Spark[] = Array.from({ length: s.count }, (_, i) => {\r
          const base = full ? heading + step * i : s.count > 1 ? heading - arc / 2 + step * i : heading;\r
          const jitter = (Math.random() - 0.5) * s.randomness;\r
          return {\r
            angle: base + jitter * (step || arc || 1) * 0.9,\r
            reach: 1 + (Math.random() - 0.5) * 0.7 * s.randomness,\r
            scale: 1 + (Math.random() - 0.5) * 0.8 * s.randomness,\r
            life: 1 + (Math.random() - 0.5) * 0.5 * s.randomness,\r
            spin: Math.random() - 0.5,\r
            color: s.colors[(i + offset) % s.colors.length],\r
            clear: '',\r
            glow: 0\r
          };\r
        });\r
        const longest = s.duration * (1 + 0.25 * s.randomness);\r
        const fall = drop(s, longest / 1000);\r
        const reach =\r
          s.radius * (1 + 0.35 * s.randomness) * (s.ease === EASINGS.spring ? 1.15 : 1) +\r
          s.size * (1 + 0.4 * s.randomness) +\r
          s.width * (s.glow > 0 ? 6 : 2) +\r
          6;\r
        const box = {\r
          left: Math.max(clientX - reach, 0),\r
          top: Math.max(clientY - reach, 0),\r
          right: Math.min(clientX + reach, window.innerWidth),\r
          bottom: Math.min(clientY + reach + fall, window.innerHeight)\r
        };\r
        if (box.right - box.left < 1 || box.bottom - box.top < 1) return;\r
        const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
        const canvas = document.createElement('canvas');\r
        canvas.width = Math.ceil((box.right - box.left) * ratio);\r
        canvas.height = Math.ceil((box.bottom - box.top) * ratio);\r
        Object.assign(canvas.style, {\r
          position: 'absolute',\r
          left: \`\${box.left - rect.left}px\`,\r
          top: \`\${box.top - rect.top}px\`,\r
          width: \`\${box.right - box.left}px\`,\r
          height: \`\${box.bottom - box.top}px\`,\r
          display: 'block',\r
          pointerEvents: 'none'\r
        });\r
        canvas.setAttribute('aria-hidden', 'true');\r
        layer.appendChild(canvas);\r
        const ctx = canvas.getContext('2d');\r
        if (!ctx) {\r
          canvas.remove();\r
          return;\r
        }\r
        for (const spark of sparks) {\r
          const [r, g, b] = channels(ctx, spark.color);\r
          spark.clear = \`rgba(\${r}, \${g}, \${b}, 0)\`;\r
          spark.glow = s.glow * (0.35 + 0.65 * ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255));\r
        }\r
        bursts.push({\r
          x: clientX,\r
          y: clientY,\r
          start: performance.now(),\r
          sparks,\r
          settings: { ...s },\r
          canvas,\r
          ctx,\r
          ratio,\r
          left: box.left,\r
          top: box.top\r
        });\r
        while (bursts.length > MAX_BURSTS) remove(bursts[0]);\r
        if (!raf) raf = requestAnimationFrame(frame);\r
      };\r
\r
      const onPointerDown = (event: PointerEvent) => {\r
        if (event.pointerType !== 'mouse' || event.button !== 0) return;\r
        lastPress = { time: performance.now(), x: event.clientX, y: event.clientY };\r
        spawn(event.clientX, event.clientY);\r
      };\r
\r
      const onClick = (event: MouseEvent) => {\r
        if ('pointerType' in event && event.pointerType === 'mouse') return;\r
        if (event.detail === 0) {\r
          const target = event.target instanceof Element ? event.target : root;\r
          const rect = target.getBoundingClientRect();\r
          spawn(rect.left + rect.width / 2, rect.top + rect.height / 2);\r
          return;\r
        }\r
        const recent =\r
          performance.now() - lastPress.time < 700 &&\r
          Math.hypot(event.clientX - lastPress.x, event.clientY - lastPress.y) < 12;\r
        if (!recent) spawn(event.clientX, event.clientY);\r
      };\r
\r
      root.addEventListener('pointerdown', onPointerDown);\r
      root.addEventListener('click', onClick);\r
\r
      engineRef.current = {\r
        spark: (x?: number, y?: number) => {\r
          const rect = root.getBoundingClientRect();\r
          spawn(rect.left + (x ?? rect.width / 2), rect.top + (y ?? rect.height / 2));\r
        }\r
      };\r
\r
      return () => {\r
        cancelAnimationFrame(raf);\r
        root.removeEventListener('pointerdown', onPointerDown);\r
        root.removeEventListener('click', onClick);\r
        for (const burst of [...bursts]) remove(burst);\r
        engineRef.current = null;\r
      };\r
    }, []);\r
\r
    useImperativeHandle(\r
      ref,\r
      () => ({\r
        spark: (x?: number, y?: number) => engineRef.current?.spark(x, y)\r
      }),\r
      []\r
    );\r
\r
    return (\r
      <div\r
        ref={rootRef}\r
        className={className}\r
        style={{ position: 'relative', width: '100%', height: '100%', isolation: 'isolate', ...style }}\r
      >\r
        {children}\r
        <span\r
          ref={layerRef}\r
          aria-hidden="true"\r
          style={{\r
            position: 'absolute',\r
            inset: 0,\r
            zIndex: layer === 'back' ? -1 : 1,\r
            overflow: 'visible',\r
            pointerEvents: 'none'\r
          }}\r
        />\r
      </div>\r
    );\r
  }\r
);\r
\r
ClickSpark.displayName = 'ClickSpark';\r
\r
export default ClickSpark;\r
`,e=`'use client';\r
\r
import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties, type ReactNode } from 'react';\r
\r
export type ClickSparkShape = 'line' | 'streak' | 'dot' | 'star';\r
\r
export type ClickSparkEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';\r
\r
export interface ClickSparkProps {\r
  sparkColor?: string | string[];\r
  sparkSize?: number;\r
  sparkRadius?: number;\r
  sparkCount?: number;\r
  sparkWidth?: number;\r
  duration?: number;\r
  easing?: ClickSparkEasing;\r
  extraScale?: number;\r
  shape?: ClickSparkShape;\r
  randomness?: number;\r
  gravity?: number;\r
  spread?: number;\r
  direction?: number;\r
  glow?: number;\r
  ring?: boolean;\r
  layer?: 'front' | 'back';\r
  disabled?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
  children?: ReactNode;\r
}\r
\r
export interface ClickSparkHandle {\r
  spark: (x?: number, y?: number) => void;\r
}\r
\r
interface Settings {\r
  colors: string[];\r
  size: number;\r
  radius: number;\r
  count: number;\r
  width: number;\r
  duration: number;\r
  ease: (t: number) => number;\r
  shape: ClickSparkShape;\r
  randomness: number;\r
  gravity: number;\r
  spread: number;\r
  direction: number;\r
  glow: number;\r
  ring: boolean;\r
  disabled: boolean;\r
}\r
\r
interface Spark {\r
  angle: number;\r
  reach: number;\r
  scale: number;\r
  life: number;\r
  spin: number;\r
  color: string;\r
  clear: string;\r
  glow: number;\r
}\r
\r
interface Burst {\r
  x: number;\r
  y: number;\r
  start: number;\r
  sparks: Spark[];\r
  settings: Settings;\r
  canvas: HTMLCanvasElement;\r
  ctx: CanvasRenderingContext2D;\r
  ratio: number;\r
  left: number;\r
  top: number;\r
}\r
\r
const EASINGS: Record<string, (t: number) => number> = {\r
  linear: t => t,\r
  'ease-in': t => t * t,\r
  'ease-out': t => 1 - Math.pow(1 - t, 3),\r
  'ease-in-out': t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),\r
  spring: t => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)\r
};\r
\r
const SHAPES: ClickSparkShape[] = ['line', 'streak', 'dot', 'star'];\r
const MAX_BURSTS = 32;\r
const GRAVITY = 500;\r
const REDUCED_MS = 320;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const smoothstep = (a: number, b: number, x: number) => {\r
  const t = clamp((x - a) / (b - a), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const toColors = (value: string | string[]): string[] => {\r
  const list = (Array.isArray(value) ? value : [value]).filter(Boolean);\r
  return list.length ? list : ['#ffffff'];\r
};\r
\r
const starPath = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, rotation: number) => {\r
  const pinch = radius * 0.16;\r
  ctx.beginPath();\r
  ctx.moveTo(x + Math.cos(rotation) * radius, y + Math.sin(rotation) * radius);\r
  for (let i = 1; i <= 4; i++) {\r
    const a = rotation + (i * Math.PI) / 2;\r
    const mid = a - Math.PI / 4;\r
    ctx.quadraticCurveTo(\r
      x + Math.cos(mid) * pinch,\r
      y + Math.sin(mid) * pinch,\r
      x + Math.cos(a) * radius,\r
      y + Math.sin(a) * radius\r
    );\r
  }\r
  ctx.closePath();\r
};\r
\r
const channels = (ctx: CanvasRenderingContext2D, color: string): number[] => {\r
  ctx.fillStyle = color;\r
  const normal = String(ctx.fillStyle);\r
  const hex = /^#([0-9a-f]{6})$/i.exec(normal);\r
  if (hex) {\r
    const value = parseInt(hex[1], 16);\r
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];\r
  }\r
  const rgb = /^rgba?\\(([^)]+)\\)$/i.exec(normal);\r
  if (rgb)\r
    return rgb[1]\r
      .split(',')\r
      .slice(0, 3)\r
      .map(part => parseFloat(part));\r
  return [0, 0, 0];\r
};\r
\r
const ClickSpark = forwardRef<ClickSparkHandle, ClickSparkProps>(\r
  (\r
    {\r
      sparkColor = '#fff',\r
      sparkSize = 14,\r
      sparkRadius = 30,\r
      sparkCount = 8,\r
      sparkWidth = 2,\r
      duration = 500,\r
      easing = 'ease-out',\r
      extraScale = 1,\r
      shape = 'line',\r
      randomness = 0.2,\r
      gravity = 0,\r
      spread = 360,\r
      direction = 0,\r
      glow = 0,\r
      ring = false,\r
      layer = 'front',\r
      disabled = false,\r
      className = '',\r
      style,\r
      children\r
    },\r
    ref\r
  ) => {\r
    const rootRef = useRef<HTMLDivElement>(null);\r
    const layerRef = useRef<HTMLSpanElement>(null);\r
    const engineRef = useRef<ClickSparkHandle | null>(null);\r
    const settings: Settings = {\r
      colors: toColors(sparkColor),\r
      size: Math.max(0, sparkSize),\r
      radius: Math.max(0, sparkRadius) * Math.max(0, extraScale),\r
      count: clamp(Math.round(sparkCount), 1, 64),\r
      width: Math.max(0.5, sparkWidth),\r
      duration: Math.max(60, duration),\r
      ease: EASINGS[easing] ?? EASINGS['ease-out'],\r
      shape: SHAPES.includes(shape) ? shape : 'line',\r
      randomness: clamp(randomness, 0, 1),\r
      gravity: Math.max(0, gravity),\r
      spread: clamp(spread, 0, 360),\r
      direction,\r
      glow: clamp(glow, 0, 1),\r
      ring,\r
      disabled\r
    };\r
    const settingsRef = useRef(settings);\r
    settingsRef.current = settings;\r
\r
    useEffect(() => {\r
      const root = rootRef.current;\r
      const layer = layerRef.current;\r
      if (!root || !layer) return;\r
\r
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
      const bursts: Burst[] = [];\r
      let raf = 0;\r
      let lastPress = { time: -1e9, x: 0, y: 0 };\r
\r
      const drop = (s: Settings, seconds: number) => 0.5 * s.gravity * GRAVITY * seconds * seconds;\r
\r
      const position = (burst: Burst, spark: Spark, distance: number, seconds: number) => [\r
        burst.x + Math.cos(spark.angle) * distance,\r
        burst.y + Math.sin(spark.angle) * distance + drop(burst.settings, seconds)\r
      ];\r
\r
      const drawSpark = (ctx: CanvasRenderingContext2D, burst: Burst, spark: Spark, elapsed: number) => {\r
        const s = burst.settings;\r
        const life = reduced ? REDUCED_MS : s.duration * spark.life;\r
        const p = elapsed / life;\r
        if (p >= 1) return false;\r
        const e = reduced ? 0.55 : s.ease(clamp(p, 0, 1));\r
        const seconds = reduced ? 0 : elapsed / 1000;\r
        const distance = s.radius * spark.reach * e;\r
        const width = s.width * spark.scale;\r
        const fade = reduced ? 1 - p : 1 - smoothstep(s.shape === 'line' ? 0.55 : 0.7, 1, p);\r
        if (fade <= 0) return true;\r
        ctx.strokeStyle = spark.color;\r
        ctx.fillStyle = spark.color;\r
\r
        if (s.shape === 'line') {\r
          const length = s.size * spark.scale * (reduced ? 0.5 : Math.pow(1 - p, 1.6));\r
          const [x1, y1] = position(burst, spark, distance, seconds);\r
          const [x2, y2] = position(burst, spark, distance + Math.max(0.01, length), seconds);\r
          ctx.lineCap = 'round';\r
          if (spark.glow > 0) {\r
            ctx.globalAlpha = fade * 0.14 * spark.glow;\r
            ctx.lineWidth = width * 4.5;\r
            ctx.beginPath();\r
            ctx.moveTo(x1, y1);\r
            ctx.lineTo(x2, y2);\r
            ctx.stroke();\r
          }\r
          ctx.globalAlpha = fade;\r
          ctx.lineWidth = width;\r
          ctx.beginPath();\r
          ctx.moveTo(x1, y1);\r
          ctx.lineTo(x2, y2);\r
          ctx.stroke();\r
          return true;\r
        }\r
\r
        if (s.shape === 'streak') {\r
          const lag = reduced ? 0 : Math.min(elapsed, 70 + s.size * 4 * spark.scale);\r
          const back = reduced ? 0.4 : s.ease(clamp((elapsed - lag) / life, 0, 1));\r
          const [hx, hy] = position(burst, spark, distance, seconds);\r
          const [tx, ty] = position(burst, spark, s.radius * spark.reach * back, Math.max(0, seconds - lag / 1000));\r
          const dx = hx - tx;\r
          const dy = hy - ty;\r
          const length = Math.hypot(dx, dy) || 1;\r
          const nx = (-dy / length) * width * 0.5;\r
          const ny = (dx / length) * width * 0.5;\r
          const paint = (spreadWidth: number, alpha: number) => {\r
            const gradient = ctx.createLinearGradient(tx, ty, hx, hy);\r
            gradient.addColorStop(0, spark.clear);\r
            gradient.addColorStop(1, spark.color);\r
            ctx.globalAlpha = alpha;\r
            ctx.fillStyle = gradient;\r
            ctx.beginPath();\r
            ctx.moveTo(tx, ty);\r
            ctx.lineTo(hx + nx * spreadWidth, hy + ny * spreadWidth);\r
            ctx.lineTo(hx - nx * spreadWidth, hy - ny * spreadWidth);\r
            ctx.closePath();\r
            ctx.fill();\r
            ctx.fillStyle = spark.color;\r
            ctx.beginPath();\r
            ctx.arc(hx, hy, width * 0.5 * spreadWidth, 0, Math.PI * 2);\r
            ctx.fill();\r
          };\r
          if (spark.glow > 0) paint(3.2, fade * 0.16 * spark.glow);\r
          paint(1, fade);\r
          return true;\r
        }\r
\r
        if (s.shape === 'dot') {\r
          const [x, y] = position(burst, spark, distance, seconds);\r
          const radius = width * 1.25 * (1 - 0.5 * e);\r
          if (spark.glow > 0) {\r
            ctx.globalAlpha = fade * 0.18 * spark.glow;\r
            ctx.beginPath();\r
            ctx.arc(x, y, radius * 2.6, 0, Math.PI * 2);\r
            ctx.fill();\r
          }\r
          ctx.globalAlpha = fade;\r
          ctx.beginPath();\r
          ctx.arc(x, y, radius, 0, Math.PI * 2);\r
          ctx.fill();\r
          return true;\r
        }\r
\r
        const [x, y] = position(burst, spark, distance, seconds);\r
        const twinkle = reduced ? 1 - p : Math.pow(Math.sin(Math.PI * clamp(p * 1.1, 0, 1)), 0.7);\r
        const radius = s.size * 0.6 * spark.scale * twinkle;\r
        const rotation = spark.angle + spark.spin * p * Math.PI * 0.5;\r
        if (radius <= 0.05) return true;\r
        if (spark.glow > 0) {\r
          ctx.globalAlpha = fade * 0.2 * spark.glow;\r
          ctx.beginPath();\r
          ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);\r
          ctx.fill();\r
        }\r
        ctx.globalAlpha = fade;\r
        starPath(ctx, x, y, radius, rotation);\r
        ctx.fill();\r
        return true;\r
      };\r
\r
      const drawRing = (ctx: CanvasRenderingContext2D, burst: Burst, elapsed: number) => {\r
        const s = burst.settings;\r
        const life = reduced ? REDUCED_MS : s.duration * 0.8;\r
        const p = elapsed / life;\r
        if (p >= 1) return false;\r
        const radius = 2 + s.radius * 0.6 * (reduced ? 0.6 : EASINGS['ease-out'](p));\r
        ctx.globalAlpha = Math.pow(1 - p, 2) * 0.7;\r
        ctx.strokeStyle = burst.sparks[0]?.color ?? s.colors[0];\r
        ctx.lineWidth = Math.max(0.5, s.width * (1 - p) * 0.9);\r
        ctx.beginPath();\r
        ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);\r
        ctx.stroke();\r
        return true;\r
      };\r
\r
      const remove = (burst: Burst) => {\r
        burst.canvas.remove();\r
        const index = bursts.indexOf(burst);\r
        if (index >= 0) bursts.splice(index, 1);\r
      };\r
\r
      const frame = (now: number) => {\r
        raf = 0;\r
        for (const burst of [...bursts]) {\r
          const elapsed = now - burst.start;\r
          const ctx = burst.ctx;\r
          ctx.setTransform(1, 0, 0, 1, 0, 0);\r
          ctx.clearRect(0, 0, burst.canvas.width, burst.canvas.height);\r
          ctx.setTransform(burst.ratio, 0, 0, burst.ratio, -burst.left * burst.ratio, -burst.top * burst.ratio);\r
          let alive = false;\r
          if (burst.settings.ring && drawRing(ctx, burst, elapsed)) alive = true;\r
          for (const spark of burst.sparks) {\r
            if (drawSpark(ctx, burst, spark, elapsed)) alive = true;\r
          }\r
          ctx.globalAlpha = 1;\r
          if (!alive) remove(burst);\r
        }\r
        if (bursts.length) raf = requestAnimationFrame(frame);\r
      };\r
\r
      const spawn = (clientX: number, clientY: number) => {\r
        const s = settingsRef.current;\r
        if (s.disabled) return;\r
        const rect = root.getBoundingClientRect();\r
        const offset = Math.floor(Math.random() * s.colors.length);\r
        const full = s.spread >= 359.5;\r
        const arc = (s.spread * Math.PI) / 180;\r
        const heading = ((s.direction - 90) * Math.PI) / 180;\r
        const step = full ? (Math.PI * 2) / s.count : s.count > 1 ? arc / (s.count - 1) : 0;\r
        const sparks: Spark[] = Array.from({ length: s.count }, (_, i) => {\r
          const base = full ? heading + step * i : s.count > 1 ? heading - arc / 2 + step * i : heading;\r
          const jitter = (Math.random() - 0.5) * s.randomness;\r
          return {\r
            angle: base + jitter * (step || arc || 1) * 0.9,\r
            reach: 1 + (Math.random() - 0.5) * 0.7 * s.randomness,\r
            scale: 1 + (Math.random() - 0.5) * 0.8 * s.randomness,\r
            life: 1 + (Math.random() - 0.5) * 0.5 * s.randomness,\r
            spin: Math.random() - 0.5,\r
            color: s.colors[(i + offset) % s.colors.length],\r
            clear: '',\r
            glow: 0\r
          };\r
        });\r
        const longest = s.duration * (1 + 0.25 * s.randomness);\r
        const fall = drop(s, longest / 1000);\r
        const reach =\r
          s.radius * (1 + 0.35 * s.randomness) * (s.ease === EASINGS.spring ? 1.15 : 1) +\r
          s.size * (1 + 0.4 * s.randomness) +\r
          s.width * (s.glow > 0 ? 6 : 2) +\r
          6;\r
        const box = {\r
          left: Math.max(clientX - reach, 0),\r
          top: Math.max(clientY - reach, 0),\r
          right: Math.min(clientX + reach, window.innerWidth),\r
          bottom: Math.min(clientY + reach + fall, window.innerHeight)\r
        };\r
        if (box.right - box.left < 1 || box.bottom - box.top < 1) return;\r
        const ratio = Math.min(window.devicePixelRatio || 1, 2);\r
        const canvas = document.createElement('canvas');\r
        canvas.width = Math.ceil((box.right - box.left) * ratio);\r
        canvas.height = Math.ceil((box.bottom - box.top) * ratio);\r
        Object.assign(canvas.style, {\r
          position: 'absolute',\r
          left: \`\${box.left - rect.left}px\`,\r
          top: \`\${box.top - rect.top}px\`,\r
          width: \`\${box.right - box.left}px\`,\r
          height: \`\${box.bottom - box.top}px\`,\r
          display: 'block',\r
          pointerEvents: 'none'\r
        });\r
        canvas.setAttribute('aria-hidden', 'true');\r
        layer.appendChild(canvas);\r
        const ctx = canvas.getContext('2d');\r
        if (!ctx) {\r
          canvas.remove();\r
          return;\r
        }\r
        for (const spark of sparks) {\r
          const [r, g, b] = channels(ctx, spark.color);\r
          spark.clear = \`rgba(\${r}, \${g}, \${b}, 0)\`;\r
          spark.glow = s.glow * (0.35 + 0.65 * ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255));\r
        }\r
        bursts.push({\r
          x: clientX,\r
          y: clientY,\r
          start: performance.now(),\r
          sparks,\r
          settings: { ...s },\r
          canvas,\r
          ctx,\r
          ratio,\r
          left: box.left,\r
          top: box.top\r
        });\r
        while (bursts.length > MAX_BURSTS) remove(bursts[0]);\r
        if (!raf) raf = requestAnimationFrame(frame);\r
      };\r
\r
      const onPointerDown = (event: PointerEvent) => {\r
        if (event.pointerType !== 'mouse' || event.button !== 0) return;\r
        lastPress = { time: performance.now(), x: event.clientX, y: event.clientY };\r
        spawn(event.clientX, event.clientY);\r
      };\r
\r
      const onClick = (event: MouseEvent) => {\r
        if ('pointerType' in event && event.pointerType === 'mouse') return;\r
        if (event.detail === 0) {\r
          const target = event.target instanceof Element ? event.target : root;\r
          const rect = target.getBoundingClientRect();\r
          spawn(rect.left + rect.width / 2, rect.top + rect.height / 2);\r
          return;\r
        }\r
        const recent =\r
          performance.now() - lastPress.time < 700 &&\r
          Math.hypot(event.clientX - lastPress.x, event.clientY - lastPress.y) < 12;\r
        if (!recent) spawn(event.clientX, event.clientY);\r
      };\r
\r
      root.addEventListener('pointerdown', onPointerDown);\r
      root.addEventListener('click', onClick);\r
\r
      engineRef.current = {\r
        spark: (x?: number, y?: number) => {\r
          const rect = root.getBoundingClientRect();\r
          spawn(rect.left + (x ?? rect.width / 2), rect.top + (y ?? rect.height / 2));\r
        }\r
      };\r
\r
      return () => {\r
        cancelAnimationFrame(raf);\r
        root.removeEventListener('pointerdown', onPointerDown);\r
        root.removeEventListener('click', onClick);\r
        for (const burst of [...bursts]) remove(burst);\r
        engineRef.current = null;\r
      };\r
    }, []);\r
\r
    useImperativeHandle(\r
      ref,\r
      () => ({\r
        spark: (x?: number, y?: number) => engineRef.current?.spark(x, y)\r
      }),\r
      []\r
    );\r
\r
    return (\r
      <div ref={rootRef} className={\`relative isolate h-full w-full \${className}\`.trim()} style={style}>\r
        {children}\r
        <span\r
          ref={layerRef}\r
          aria-hidden="true"\r
          className={\`pointer-events-none absolute inset-0 overflow-visible \${layer === 'back' ? 'z-[-1]' : 'z-[1]'}\`}\r
        />\r
      </div>\r
    );\r
  }\r
);\r
\r
ClickSpark.displayName = 'ClickSpark';\r
\r
export default ClickSpark;\r
`,s={usage:`import ClickSpark from './ClickSpark';

<ClickSpark
  sparkColor="#fff"
  shape="line"
  sparkCount={8}
  sparkSize={14}
  sparkRadius={30}
  duration={500}
>
  {/* Your content here */}
</ClickSpark>`,code:r,tailwind:n,tsCode:t,tsTailwind:e};export{s as clickSpark};
