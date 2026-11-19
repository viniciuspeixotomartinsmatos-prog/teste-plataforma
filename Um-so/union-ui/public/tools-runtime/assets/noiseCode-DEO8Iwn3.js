const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './Noise.css';\r
\r
const TILE = 256;\r
const TAU = Math.PI * 2;\r
const BLENDS = ['normal', 'overlay', 'soft-light', 'multiply', 'screen', 'difference'];\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const generator = seed => {\r
  let state = seed >>> 0 || 1;\r
  return () => {\r
    state = (state + 0x6d2b79f5) | 0;\r
    let t = Math.imul(state ^ (state >>> 15), 1 | state);\r
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const paintTile = (contrast, colored) => {\r
  const canvas = document.createElement('canvas');\r
  canvas.width = TILE;\r
  canvas.height = TILE;\r
  const ctx = canvas.getContext('2d');\r
  if (!ctx) return null;\r
  const image = ctx.createImageData(TILE, TILE);\r
  const data = image.data;\r
  const random = generator(1013904223);\r
  const range = 0.5 + contrast * 1.1;\r
  const sample = () => clamp(0.5 + (random() + random() - 1) * range, 0, 1) * 255;\r
  for (let i = 0; i < data.length; i += 4) {\r
    const value = sample();\r
    data[i] = value;\r
    data[i + 1] = colored ? sample() : value;\r
    data[i + 2] = colored ? sample() : value;\r
    data[i + 3] = 255;\r
  }\r
  ctx.putImageData(image, 0, 0);\r
  return canvas;\r
};\r
\r
const drawSpeck = (ctx, x, y, radius, tone, alpha) => {\r
  const lobes = 1 + Math.floor(Math.random() * 3);\r
  for (let k = 0; k < lobes; k++) {\r
    const ox = x + (Math.random() - 0.5) * radius * 1.4;\r
    const oy = y + (Math.random() - 0.5) * radius * 1.4;\r
    const size = radius * (0.55 + Math.random() * 0.5);\r
    const fill = ctx.createRadialGradient(ox, oy, 0, ox, oy, size);\r
    fill.addColorStop(0, \`rgba(\${tone}, \${alpha})\`);\r
    fill.addColorStop(0.55, \`rgba(\${tone}, \${alpha * 0.85})\`);\r
    fill.addColorStop(1, \`rgba(\${tone}, 0)\`);\r
    ctx.fillStyle = fill;\r
    ctx.beginPath();\r
    ctx.arc(ox, oy, size, 0, TAU);\r
    ctx.fill();\r
  }\r
};\r
\r
const drawHair = (ctx, width, height) => {\r
  const x = Math.random() * width;\r
  const y = Math.random() * height;\r
  const length = 14 + Math.random() * 46;\r
  const angle = Math.random() * TAU;\r
  const bend = (Math.random() - 0.5) * length * 0.9;\r
  const ex = x + Math.cos(angle) * length;\r
  const ey = y + Math.sin(angle) * length;\r
  const cx = (x + ex) / 2 - Math.sin(angle) * bend;\r
  const cy = (y + ey) / 2 + Math.cos(angle) * bend;\r
  ctx.strokeStyle = \`rgba(16, 12, 9, \${0.4 + Math.random() * 0.35})\`;\r
  ctx.lineWidth = 0.6 + Math.random() * 0.7;\r
  ctx.lineCap = 'round';\r
  ctx.beginPath();\r
  ctx.moveTo(x, y);\r
  ctx.quadraticCurveTo(cx, cy, ex, ey);\r
  ctx.stroke();\r
};\r
\r
const Noise = ({\r
  opacity = 0.2,\r
  size = 1,\r
  fps = 24,\r
  blendMode = 'overlay',\r
  contrast = 0.6,\r
  colored = false,\r
  dust = 0,\r
  scratches = 0,\r
  scanlines = 0,\r
  flicker = 0,\r
  fixed = false,\r
  zIndex,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const grainRef = useRef(null);\r
  const dustRef = useRef(null);\r
  const linesRef = useRef(null);\r
  const urlRef = useRef('');\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    opacity: clamp(opacity, 0, 1),\r
    size: Math.max(0.5, size),\r
    fps: clamp(fps, 0, 60),\r
    flicker: clamp(flicker, 0, 1),\r
    dust: clamp(dust, 0, 1),\r
    scratches: clamp(scratches, 0, 1)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const blend = BLENDS.includes(blendMode) ? blendMode : 'normal';\r
\r
  useEffect(() => {\r
    const grain = grainRef.current;\r
    if (!grain) return undefined;\r
    let alive = true;\r
    const canvas = paintTile(clamp(contrast, 0, 1), colored);\r
    canvas?.toBlob(blob => {\r
      if (!alive || !blob) return;\r
      const previous = urlRef.current;\r
      urlRef.current = URL.createObjectURL(blob);\r
      grain.style.backgroundImage = \`url("\${urlRef.current}")\`;\r
      if (previous) URL.revokeObjectURL(previous);\r
    });\r
    return () => {\r
      alive = false;\r
    };\r
  }, [contrast, colored]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const grain = grainRef.current;\r
    const canvas = dustRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!root || !grain || !canvas || !ctx) return undefined;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const scratchList = [];\r
    let raf = 0;\r
    let last = 0;\r
    let roll = 0;\r
    let visible = true;\r
    let alive = true;\r
    let width = 1;\r
    let height = 1;\r
\r
    const paintDust = (s, step) => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      if (s.dust <= 0 && s.scratches <= 0 && scratchList.length === 0) return;\r
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);\r
      const area = (width * height) / 400000;\r
\r
      if (s.dust > 0) {\r
        const specks = Math.round(s.dust * 42 * area * (0.6 + Math.random() * 0.8));\r
        for (let i = 0; i < specks; i++) {\r
          const light = Math.random() < 0.3;\r
          drawSpeck(\r
            ctx,\r
            Math.random() * width,\r
            Math.random() * height,\r
            0.6 + Math.random() ** 2.5 * 3.4,\r
            light ? '255, 250, 240' : '18, 14, 10',\r
            0.6 + Math.random() * 0.35\r
          );\r
        }\r
        const hairs = Math.random() < s.dust * 0.7 ? 1 + Math.floor(Math.random() * s.dust * 2.4) : 0;\r
        for (let i = 0; i < hairs; i++) drawHair(ctx, width, height);\r
      }\r
\r
      if (step) {\r
        if (scratchList.length < 3 && Math.random() < s.scratches * 0.06) {\r
          scratchList.push({\r
            x: Math.random() * width,\r
            age: 0,\r
            life: 0.6 + Math.random() * 2.6,\r
            weight: 0.6 + Math.random() * 0.8,\r
            light: Math.random() < 0.7,\r
            phase: Math.random() * TAU\r
          });\r
        }\r
        for (let i = scratchList.length - 1; i >= 0; i--) {\r
          const scratch = scratchList[i];\r
          scratch.age += step;\r
          scratch.x += (Math.random() - 0.5) * 1.2;\r
          if (scratch.age >= scratch.life) scratchList.splice(i, 1);\r
        }\r
      }\r
      scratchList.forEach(scratch => {\r
        const fade = Math.min(1, scratch.age / 0.15, (scratch.life - scratch.age) / 0.3);\r
        const alpha = (0.25 + Math.random() * 0.35) * fade;\r
        ctx.strokeStyle = scratch.light ? \`rgba(255, 252, 245, \${alpha})\` : \`rgba(14, 11, 8, \${alpha})\`;\r
        ctx.lineWidth = scratch.weight;\r
        ctx.beginPath();\r
        for (let y = 0; y <= height; y += 24) {\r
          const x = scratch.x + Math.sin(y * 0.012 + scratch.phase) * 1.4;\r
          if (y === 0) ctx.moveTo(x, y);\r
          else ctx.lineTo(x, y);\r
        }\r
        ctx.stroke();\r
      });\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      width = Math.max(1, root.clientWidth);\r
      height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(width * dpr);\r
      canvas.height = Math.round(height * dpr);\r
      paintDust(settingsRef.current, 0);\r
    };\r
\r
    const tick = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const rate = reduce ? 0 : s.fps;\r
      if (rate > 0 && now - last >= 1000 / rate) {\r
        const step = last ? Math.min(0.2, (now - last) / 1000) : 1 / rate;\r
        last = now;\r
        const span = TILE * s.size;\r
        grain.style.backgroundPosition = \`\${(Math.random() * span).toFixed(1)}px \${(Math.random() * span).toFixed(1)}px\`;\r
        grain.style.opacity = String(s.opacity * (1 - s.flicker * Math.random() * 0.7));\r
        roll = (roll + 1) % 3;\r
        linesRef.current?.style.setProperty('background-position', \`0 \${roll}px\`);\r
        paintDust(s, step);\r
      }\r
      if (visible && rate > 0) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const wake = () => {\r
      paintDust(settingsRef.current, 0);\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(tick);\r
    };\r
    wakeRef.current = wake;\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    visibility.observe(root);\r
    resize();\r
    wake();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);\r
      urlRef.current = '';\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`noise\${fixed ? ' noise--fixed' : ''}\${className ? \` \${className}\` : ''}\`}\r
      style={{ zIndex, ...style }}\r
      aria-hidden="true"\r
    >\r
      <div\r
        ref={grainRef}\r
        className="noise__grain"\r
        style={{\r
          opacity: settings.opacity,\r
          mixBlendMode: blend,\r
          backgroundSize: \`\${TILE * settings.size}px \${TILE * settings.size}px\`\r
        }}\r
      />\r
      <canvas ref={dustRef} className="noise__dust" />\r
      {scanlines > 0 && (\r
        <div ref={linesRef} className="noise__lines" style={{ opacity: clamp(scanlines, 0, 1), mixBlendMode: blend }} />\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default Noise;\r
`,r=`.noise {\r
  position: absolute;\r
  inset: 0;\r
  overflow: hidden;\r
  pointer-events: none;\r
}\r
\r
.noise--fixed {\r
  position: fixed;\r
}\r
\r
.noise__grain {\r
  position: absolute;\r
  inset: 0;\r
  background-repeat: repeat;\r
  image-rendering: pixelated;\r
}\r
\r
.noise__dust {\r
  position: absolute;\r
  inset: 0;\r
  width: 100%;\r
  height: 100%;\r
}\r
\r
.noise__lines {\r
  position: absolute;\r
  inset: 0;\r
  background-image: repeating-linear-gradient(\r
    to bottom,\r
    rgba(0, 0, 0, 0.55) 0,\r
    rgba(0, 0, 0, 0.55) 1px,\r
    transparent 1px,\r
    transparent 3px\r
  );\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const ROOT = 'pointer-events-none absolute inset-0 overflow-hidden';\r
const FIXED = 'pointer-events-none fixed inset-0 overflow-hidden';\r
const GRAIN = 'absolute inset-0 bg-repeat [image-rendering:pixelated]';\r
const DUST = 'absolute inset-0 h-full w-full';\r
const LINES =\r
  'absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.55)_0,rgba(0,0,0,0.55)_1px,transparent_1px,transparent_3px)]';\r
\r
const TILE = 256;\r
const TAU = Math.PI * 2;\r
const BLENDS = ['normal', 'overlay', 'soft-light', 'multiply', 'screen', 'difference'];\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const generator = seed => {\r
  let state = seed >>> 0 || 1;\r
  return () => {\r
    state = (state + 0x6d2b79f5) | 0;\r
    let t = Math.imul(state ^ (state >>> 15), 1 | state);\r
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const paintTile = (contrast, colored) => {\r
  const canvas = document.createElement('canvas');\r
  canvas.width = TILE;\r
  canvas.height = TILE;\r
  const ctx = canvas.getContext('2d');\r
  if (!ctx) return null;\r
  const image = ctx.createImageData(TILE, TILE);\r
  const data = image.data;\r
  const random = generator(1013904223);\r
  const range = 0.5 + contrast * 1.1;\r
  const sample = () => clamp(0.5 + (random() + random() - 1) * range, 0, 1) * 255;\r
  for (let i = 0; i < data.length; i += 4) {\r
    const value = sample();\r
    data[i] = value;\r
    data[i + 1] = colored ? sample() : value;\r
    data[i + 2] = colored ? sample() : value;\r
    data[i + 3] = 255;\r
  }\r
  ctx.putImageData(image, 0, 0);\r
  return canvas;\r
};\r
\r
const drawSpeck = (ctx, x, y, radius, tone, alpha) => {\r
  const lobes = 1 + Math.floor(Math.random() * 3);\r
  for (let k = 0; k < lobes; k++) {\r
    const ox = x + (Math.random() - 0.5) * radius * 1.4;\r
    const oy = y + (Math.random() - 0.5) * radius * 1.4;\r
    const size = radius * (0.55 + Math.random() * 0.5);\r
    const fill = ctx.createRadialGradient(ox, oy, 0, ox, oy, size);\r
    fill.addColorStop(0, \`rgba(\${tone}, \${alpha})\`);\r
    fill.addColorStop(0.55, \`rgba(\${tone}, \${alpha * 0.85})\`);\r
    fill.addColorStop(1, \`rgba(\${tone}, 0)\`);\r
    ctx.fillStyle = fill;\r
    ctx.beginPath();\r
    ctx.arc(ox, oy, size, 0, TAU);\r
    ctx.fill();\r
  }\r
};\r
\r
const drawHair = (ctx, width, height) => {\r
  const x = Math.random() * width;\r
  const y = Math.random() * height;\r
  const length = 14 + Math.random() * 46;\r
  const angle = Math.random() * TAU;\r
  const bend = (Math.random() - 0.5) * length * 0.9;\r
  const ex = x + Math.cos(angle) * length;\r
  const ey = y + Math.sin(angle) * length;\r
  const cx = (x + ex) / 2 - Math.sin(angle) * bend;\r
  const cy = (y + ey) / 2 + Math.cos(angle) * bend;\r
  ctx.strokeStyle = \`rgba(16, 12, 9, \${0.4 + Math.random() * 0.35})\`;\r
  ctx.lineWidth = 0.6 + Math.random() * 0.7;\r
  ctx.lineCap = 'round';\r
  ctx.beginPath();\r
  ctx.moveTo(x, y);\r
  ctx.quadraticCurveTo(cx, cy, ex, ey);\r
  ctx.stroke();\r
};\r
\r
const Noise = ({\r
  opacity = 0.2,\r
  size = 1,\r
  fps = 24,\r
  blendMode = 'overlay',\r
  contrast = 0.6,\r
  colored = false,\r
  dust = 0,\r
  scratches = 0,\r
  scanlines = 0,\r
  flicker = 0,\r
  fixed = false,\r
  zIndex,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const grainRef = useRef(null);\r
  const dustRef = useRef(null);\r
  const linesRef = useRef(null);\r
  const urlRef = useRef('');\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    opacity: clamp(opacity, 0, 1),\r
    size: Math.max(0.5, size),\r
    fps: clamp(fps, 0, 60),\r
    flicker: clamp(flicker, 0, 1),\r
    dust: clamp(dust, 0, 1),\r
    scratches: clamp(scratches, 0, 1)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const blend = BLENDS.includes(blendMode) ? blendMode : 'normal';\r
\r
  useEffect(() => {\r
    const grain = grainRef.current;\r
    if (!grain) return undefined;\r
    let alive = true;\r
    const canvas = paintTile(clamp(contrast, 0, 1), colored);\r
    canvas?.toBlob(blob => {\r
      if (!alive || !blob) return;\r
      const previous = urlRef.current;\r
      urlRef.current = URL.createObjectURL(blob);\r
      grain.style.backgroundImage = \`url("\${urlRef.current}")\`;\r
      if (previous) URL.revokeObjectURL(previous);\r
    });\r
    return () => {\r
      alive = false;\r
    };\r
  }, [contrast, colored]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const grain = grainRef.current;\r
    const canvas = dustRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!root || !grain || !canvas || !ctx) return undefined;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const scratchList = [];\r
    let raf = 0;\r
    let last = 0;\r
    let roll = 0;\r
    let visible = true;\r
    let alive = true;\r
    let width = 1;\r
    let height = 1;\r
\r
    const paintDust = (s, step) => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      if (s.dust <= 0 && s.scratches <= 0 && scratchList.length === 0) return;\r
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);\r
      const area = (width * height) / 400000;\r
\r
      if (s.dust > 0) {\r
        const specks = Math.round(s.dust * 42 * area * (0.6 + Math.random() * 0.8));\r
        for (let i = 0; i < specks; i++) {\r
          const light = Math.random() < 0.3;\r
          drawSpeck(\r
            ctx,\r
            Math.random() * width,\r
            Math.random() * height,\r
            0.6 + Math.random() ** 2.5 * 3.4,\r
            light ? '255, 250, 240' : '18, 14, 10',\r
            0.6 + Math.random() * 0.35\r
          );\r
        }\r
        const hairs = Math.random() < s.dust * 0.7 ? 1 + Math.floor(Math.random() * s.dust * 2.4) : 0;\r
        for (let i = 0; i < hairs; i++) drawHair(ctx, width, height);\r
      }\r
\r
      if (step) {\r
        if (scratchList.length < 3 && Math.random() < s.scratches * 0.06) {\r
          scratchList.push({\r
            x: Math.random() * width,\r
            age: 0,\r
            life: 0.6 + Math.random() * 2.6,\r
            weight: 0.6 + Math.random() * 0.8,\r
            light: Math.random() < 0.7,\r
            phase: Math.random() * TAU\r
          });\r
        }\r
        for (let i = scratchList.length - 1; i >= 0; i--) {\r
          const scratch = scratchList[i];\r
          scratch.age += step;\r
          scratch.x += (Math.random() - 0.5) * 1.2;\r
          if (scratch.age >= scratch.life) scratchList.splice(i, 1);\r
        }\r
      }\r
      scratchList.forEach(scratch => {\r
        const fade = Math.min(1, scratch.age / 0.15, (scratch.life - scratch.age) / 0.3);\r
        const alpha = (0.25 + Math.random() * 0.35) * fade;\r
        ctx.strokeStyle = scratch.light ? \`rgba(255, 252, 245, \${alpha})\` : \`rgba(14, 11, 8, \${alpha})\`;\r
        ctx.lineWidth = scratch.weight;\r
        ctx.beginPath();\r
        for (let y = 0; y <= height; y += 24) {\r
          const x = scratch.x + Math.sin(y * 0.012 + scratch.phase) * 1.4;\r
          if (y === 0) ctx.moveTo(x, y);\r
          else ctx.lineTo(x, y);\r
        }\r
        ctx.stroke();\r
      });\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      width = Math.max(1, root.clientWidth);\r
      height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(width * dpr);\r
      canvas.height = Math.round(height * dpr);\r
      paintDust(settingsRef.current, 0);\r
    };\r
\r
    const tick = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const rate = reduce ? 0 : s.fps;\r
      if (rate > 0 && now - last >= 1000 / rate) {\r
        const step = last ? Math.min(0.2, (now - last) / 1000) : 1 / rate;\r
        last = now;\r
        const span = TILE * s.size;\r
        grain.style.backgroundPosition = \`\${(Math.random() * span).toFixed(1)}px \${(Math.random() * span).toFixed(1)}px\`;\r
        grain.style.opacity = String(s.opacity * (1 - s.flicker * Math.random() * 0.7));\r
        roll = (roll + 1) % 3;\r
        linesRef.current?.style.setProperty('background-position', \`0 \${roll}px\`);\r
        paintDust(s, step);\r
      }\r
      if (visible && rate > 0) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const wake = () => {\r
      paintDust(settingsRef.current, 0);\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(tick);\r
    };\r
    wakeRef.current = wake;\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    visibility.observe(root);\r
    resize();\r
    wake();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);\r
      urlRef.current = '';\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`\${fixed ? FIXED : ROOT}\${className ? \` \${className}\` : ''}\`}\r
      style={{ zIndex, ...style }}\r
      aria-hidden="true"\r
    >\r
      <div\r
        ref={grainRef}\r
        className={GRAIN}\r
        style={{\r
          opacity: settings.opacity,\r
          mixBlendMode: blend,\r
          backgroundSize: \`\${TILE * settings.size}px \${TILE * settings.size}px\`\r
        }}\r
      />\r
      <canvas ref={dustRef} className={DUST} />\r
      {scanlines > 0 && (\r
        <div ref={linesRef} className={LINES} style={{ opacity: clamp(scanlines, 0, 1), mixBlendMode: blend }} />\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default Noise;\r
`,t=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
import './Noise.css';\r
\r
export type NoiseBlendMode = 'normal' | 'overlay' | 'soft-light' | 'multiply' | 'screen' | 'difference';\r
\r
export type NoiseProps = {\r
  opacity?: number;\r
  size?: number;\r
  fps?: number;\r
  blendMode?: NoiseBlendMode;\r
  contrast?: number;\r
  colored?: boolean;\r
  dust?: number;\r
  scratches?: number;\r
  scanlines?: number;\r
  flicker?: number;\r
  fixed?: boolean;\r
  zIndex?: number;\r
  className?: string;\r
  style?: React.CSSProperties;\r
};\r
\r
const TILE = 256;\r
const TAU = Math.PI * 2;\r
const BLENDS: NoiseBlendMode[] = ['normal', 'overlay', 'soft-light', 'multiply', 'screen', 'difference'];\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const generator = (seed: number) => {\r
  let state = seed >>> 0 || 1;\r
  return () => {\r
    state = (state + 0x6d2b79f5) | 0;\r
    let t = Math.imul(state ^ (state >>> 15), 1 | state);\r
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const paintTile = (contrast: number, colored: boolean) => {\r
  const canvas = document.createElement('canvas');\r
  canvas.width = TILE;\r
  canvas.height = TILE;\r
  const ctx = canvas.getContext('2d');\r
  if (!ctx) return null;\r
  const image = ctx.createImageData(TILE, TILE);\r
  const data = image.data;\r
  const random = generator(1013904223);\r
  const range = 0.5 + contrast * 1.1;\r
  const sample = () => clamp(0.5 + (random() + random() - 1) * range, 0, 1) * 255;\r
  for (let i = 0; i < data.length; i += 4) {\r
    const value = sample();\r
    data[i] = value;\r
    data[i + 1] = colored ? sample() : value;\r
    data[i + 2] = colored ? sample() : value;\r
    data[i + 3] = 255;\r
  }\r
  ctx.putImageData(image, 0, 0);\r
  return canvas;\r
};\r
\r
const drawSpeck = (\r
  ctx: CanvasRenderingContext2D,\r
  x: number,\r
  y: number,\r
  radius: number,\r
  tone: string,\r
  alpha: number\r
) => {\r
  const lobes = 1 + Math.floor(Math.random() * 3);\r
  for (let k = 0; k < lobes; k++) {\r
    const ox = x + (Math.random() - 0.5) * radius * 1.4;\r
    const oy = y + (Math.random() - 0.5) * radius * 1.4;\r
    const size = radius * (0.55 + Math.random() * 0.5);\r
    const fill = ctx.createRadialGradient(ox, oy, 0, ox, oy, size);\r
    fill.addColorStop(0, \`rgba(\${tone}, \${alpha})\`);\r
    fill.addColorStop(0.55, \`rgba(\${tone}, \${alpha * 0.85})\`);\r
    fill.addColorStop(1, \`rgba(\${tone}, 0)\`);\r
    ctx.fillStyle = fill;\r
    ctx.beginPath();\r
    ctx.arc(ox, oy, size, 0, TAU);\r
    ctx.fill();\r
  }\r
};\r
\r
const drawHair = (ctx: CanvasRenderingContext2D, width: number, height: number) => {\r
  const x = Math.random() * width;\r
  const y = Math.random() * height;\r
  const length = 14 + Math.random() * 46;\r
  const angle = Math.random() * TAU;\r
  const bend = (Math.random() - 0.5) * length * 0.9;\r
  const ex = x + Math.cos(angle) * length;\r
  const ey = y + Math.sin(angle) * length;\r
  const cx = (x + ex) / 2 - Math.sin(angle) * bend;\r
  const cy = (y + ey) / 2 + Math.cos(angle) * bend;\r
  ctx.strokeStyle = \`rgba(16, 12, 9, \${0.4 + Math.random() * 0.35})\`;\r
  ctx.lineWidth = 0.6 + Math.random() * 0.7;\r
  ctx.lineCap = 'round';\r
  ctx.beginPath();\r
  ctx.moveTo(x, y);\r
  ctx.quadraticCurveTo(cx, cy, ex, ey);\r
  ctx.stroke();\r
};\r
\r
const Noise = ({\r
  opacity = 0.2,\r
  size = 1,\r
  fps = 24,\r
  blendMode = 'overlay',\r
  contrast = 0.6,\r
  colored = false,\r
  dust = 0,\r
  scratches = 0,\r
  scanlines = 0,\r
  flicker = 0,\r
  fixed = false,\r
  zIndex,\r
  className = '',\r
  style\r
}: NoiseProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const grainRef = useRef<HTMLDivElement>(null);\r
  const dustRef = useRef<HTMLCanvasElement>(null);\r
  const linesRef = useRef<HTMLDivElement>(null);\r
  const urlRef = useRef('');\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings = {\r
    opacity: clamp(opacity, 0, 1),\r
    size: Math.max(0.5, size),\r
    fps: clamp(fps, 0, 60),\r
    flicker: clamp(flicker, 0, 1),\r
    dust: clamp(dust, 0, 1),\r
    scratches: clamp(scratches, 0, 1)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const blend = BLENDS.includes(blendMode) ? blendMode : 'normal';\r
\r
  useEffect(() => {\r
    const grain = grainRef.current;\r
    if (!grain) return undefined;\r
    let alive = true;\r
    const canvas = paintTile(clamp(contrast, 0, 1), colored);\r
    canvas?.toBlob(blob => {\r
      if (!alive || !blob) return;\r
      const previous = urlRef.current;\r
      urlRef.current = URL.createObjectURL(blob);\r
      grain.style.backgroundImage = \`url("\${urlRef.current}")\`;\r
      if (previous) URL.revokeObjectURL(previous);\r
    });\r
    return () => {\r
      alive = false;\r
    };\r
  }, [contrast, colored]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const grain = grainRef.current;\r
    const canvas = dustRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!root || !grain || !canvas || !ctx) return undefined;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const scratchList: { x: number; age: number; life: number; weight: number; light: boolean; phase: number }[] = [];\r
    let raf = 0;\r
    let last = 0;\r
    let roll = 0;\r
    let visible = true;\r
    let alive = true;\r
    let width = 1;\r
    let height = 1;\r
\r
    const paintDust = (s: typeof settings, step: number) => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      if (s.dust <= 0 && s.scratches <= 0 && scratchList.length === 0) return;\r
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);\r
      const area = (width * height) / 400000;\r
\r
      if (s.dust > 0) {\r
        const specks = Math.round(s.dust * 42 * area * (0.6 + Math.random() * 0.8));\r
        for (let i = 0; i < specks; i++) {\r
          const light = Math.random() < 0.3;\r
          drawSpeck(\r
            ctx,\r
            Math.random() * width,\r
            Math.random() * height,\r
            0.6 + Math.random() ** 2.5 * 3.4,\r
            light ? '255, 250, 240' : '18, 14, 10',\r
            0.6 + Math.random() * 0.35\r
          );\r
        }\r
        const hairs = Math.random() < s.dust * 0.7 ? 1 + Math.floor(Math.random() * s.dust * 2.4) : 0;\r
        for (let i = 0; i < hairs; i++) drawHair(ctx, width, height);\r
      }\r
\r
      if (step) {\r
        if (scratchList.length < 3 && Math.random() < s.scratches * 0.06) {\r
          scratchList.push({\r
            x: Math.random() * width,\r
            age: 0,\r
            life: 0.6 + Math.random() * 2.6,\r
            weight: 0.6 + Math.random() * 0.8,\r
            light: Math.random() < 0.7,\r
            phase: Math.random() * TAU\r
          });\r
        }\r
        for (let i = scratchList.length - 1; i >= 0; i--) {\r
          const scratch = scratchList[i];\r
          scratch.age += step;\r
          scratch.x += (Math.random() - 0.5) * 1.2;\r
          if (scratch.age >= scratch.life) scratchList.splice(i, 1);\r
        }\r
      }\r
      scratchList.forEach(scratch => {\r
        const fade = Math.min(1, scratch.age / 0.15, (scratch.life - scratch.age) / 0.3);\r
        const alpha = (0.25 + Math.random() * 0.35) * fade;\r
        ctx.strokeStyle = scratch.light ? \`rgba(255, 252, 245, \${alpha})\` : \`rgba(14, 11, 8, \${alpha})\`;\r
        ctx.lineWidth = scratch.weight;\r
        ctx.beginPath();\r
        for (let y = 0; y <= height; y += 24) {\r
          const x = scratch.x + Math.sin(y * 0.012 + scratch.phase) * 1.4;\r
          if (y === 0) ctx.moveTo(x, y);\r
          else ctx.lineTo(x, y);\r
        }\r
        ctx.stroke();\r
      });\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      width = Math.max(1, root.clientWidth);\r
      height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(width * dpr);\r
      canvas.height = Math.round(height * dpr);\r
      paintDust(settingsRef.current, 0);\r
    };\r
\r
    const tick = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const rate = reduce ? 0 : s.fps;\r
      if (rate > 0 && now - last >= 1000 / rate) {\r
        const step = last ? Math.min(0.2, (now - last) / 1000) : 1 / rate;\r
        last = now;\r
        const span = TILE * s.size;\r
        grain.style.backgroundPosition = \`\${(Math.random() * span).toFixed(1)}px \${(Math.random() * span).toFixed(1)}px\`;\r
        grain.style.opacity = String(s.opacity * (1 - s.flicker * Math.random() * 0.7));\r
        roll = (roll + 1) % 3;\r
        linesRef.current?.style.setProperty('background-position', \`0 \${roll}px\`);\r
        paintDust(s, step);\r
      }\r
      if (visible && rate > 0) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const wake = () => {\r
      paintDust(settingsRef.current, 0);\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(tick);\r
    };\r
    wakeRef.current = wake;\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    visibility.observe(root);\r
    resize();\r
    wake();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);\r
      urlRef.current = '';\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`noise\${fixed ? ' noise--fixed' : ''}\${className ? \` \${className}\` : ''}\`}\r
      style={{ zIndex, ...style }}\r
      aria-hidden="true"\r
    >\r
      <div\r
        ref={grainRef}\r
        className="noise__grain"\r
        style={{\r
          opacity: settings.opacity,\r
          mixBlendMode: blend,\r
          backgroundSize: \`\${TILE * settings.size}px \${TILE * settings.size}px\`\r
        }}\r
      />\r
      <canvas ref={dustRef} className="noise__dust" />\r
      {scanlines > 0 && (\r
        <div ref={linesRef} className="noise__lines" style={{ opacity: clamp(scanlines, 0, 1), mixBlendMode: blend }} />\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default Noise;\r
`,a=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
export type NoiseBlendMode = 'normal' | 'overlay' | 'soft-light' | 'multiply' | 'screen' | 'difference';\r
\r
export type NoiseProps = {\r
  opacity?: number;\r
  size?: number;\r
  fps?: number;\r
  blendMode?: NoiseBlendMode;\r
  contrast?: number;\r
  colored?: boolean;\r
  dust?: number;\r
  scratches?: number;\r
  scanlines?: number;\r
  flicker?: number;\r
  fixed?: boolean;\r
  zIndex?: number;\r
  className?: string;\r
  style?: React.CSSProperties;\r
};\r
\r
const ROOT = 'pointer-events-none absolute inset-0 overflow-hidden';\r
const FIXED = 'pointer-events-none fixed inset-0 overflow-hidden';\r
const GRAIN = 'absolute inset-0 bg-repeat [image-rendering:pixelated]';\r
const DUST = 'absolute inset-0 h-full w-full';\r
const LINES =\r
  'absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.55)_0,rgba(0,0,0,0.55)_1px,transparent_1px,transparent_3px)]';\r
\r
const TILE = 256;\r
const TAU = Math.PI * 2;\r
const BLENDS: NoiseBlendMode[] = ['normal', 'overlay', 'soft-light', 'multiply', 'screen', 'difference'];\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const generator = (seed: number) => {\r
  let state = seed >>> 0 || 1;\r
  return () => {\r
    state = (state + 0x6d2b79f5) | 0;\r
    let t = Math.imul(state ^ (state >>> 15), 1 | state);\r
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
  };\r
};\r
\r
const paintTile = (contrast: number, colored: boolean) => {\r
  const canvas = document.createElement('canvas');\r
  canvas.width = TILE;\r
  canvas.height = TILE;\r
  const ctx = canvas.getContext('2d');\r
  if (!ctx) return null;\r
  const image = ctx.createImageData(TILE, TILE);\r
  const data = image.data;\r
  const random = generator(1013904223);\r
  const range = 0.5 + contrast * 1.1;\r
  const sample = () => clamp(0.5 + (random() + random() - 1) * range, 0, 1) * 255;\r
  for (let i = 0; i < data.length; i += 4) {\r
    const value = sample();\r
    data[i] = value;\r
    data[i + 1] = colored ? sample() : value;\r
    data[i + 2] = colored ? sample() : value;\r
    data[i + 3] = 255;\r
  }\r
  ctx.putImageData(image, 0, 0);\r
  return canvas;\r
};\r
\r
const drawSpeck = (\r
  ctx: CanvasRenderingContext2D,\r
  x: number,\r
  y: number,\r
  radius: number,\r
  tone: string,\r
  alpha: number\r
) => {\r
  const lobes = 1 + Math.floor(Math.random() * 3);\r
  for (let k = 0; k < lobes; k++) {\r
    const ox = x + (Math.random() - 0.5) * radius * 1.4;\r
    const oy = y + (Math.random() - 0.5) * radius * 1.4;\r
    const size = radius * (0.55 + Math.random() * 0.5);\r
    const fill = ctx.createRadialGradient(ox, oy, 0, ox, oy, size);\r
    fill.addColorStop(0, \`rgba(\${tone}, \${alpha})\`);\r
    fill.addColorStop(0.55, \`rgba(\${tone}, \${alpha * 0.85})\`);\r
    fill.addColorStop(1, \`rgba(\${tone}, 0)\`);\r
    ctx.fillStyle = fill;\r
    ctx.beginPath();\r
    ctx.arc(ox, oy, size, 0, TAU);\r
    ctx.fill();\r
  }\r
};\r
\r
const drawHair = (ctx: CanvasRenderingContext2D, width: number, height: number) => {\r
  const x = Math.random() * width;\r
  const y = Math.random() * height;\r
  const length = 14 + Math.random() * 46;\r
  const angle = Math.random() * TAU;\r
  const bend = (Math.random() - 0.5) * length * 0.9;\r
  const ex = x + Math.cos(angle) * length;\r
  const ey = y + Math.sin(angle) * length;\r
  const cx = (x + ex) / 2 - Math.sin(angle) * bend;\r
  const cy = (y + ey) / 2 + Math.cos(angle) * bend;\r
  ctx.strokeStyle = \`rgba(16, 12, 9, \${0.4 + Math.random() * 0.35})\`;\r
  ctx.lineWidth = 0.6 + Math.random() * 0.7;\r
  ctx.lineCap = 'round';\r
  ctx.beginPath();\r
  ctx.moveTo(x, y);\r
  ctx.quadraticCurveTo(cx, cy, ex, ey);\r
  ctx.stroke();\r
};\r
\r
const Noise = ({\r
  opacity = 0.2,\r
  size = 1,\r
  fps = 24,\r
  blendMode = 'overlay',\r
  contrast = 0.6,\r
  colored = false,\r
  dust = 0,\r
  scratches = 0,\r
  scanlines = 0,\r
  flicker = 0,\r
  fixed = false,\r
  zIndex,\r
  className = '',\r
  style\r
}: NoiseProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const grainRef = useRef<HTMLDivElement>(null);\r
  const dustRef = useRef<HTMLCanvasElement>(null);\r
  const linesRef = useRef<HTMLDivElement>(null);\r
  const urlRef = useRef('');\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings = {\r
    opacity: clamp(opacity, 0, 1),\r
    size: Math.max(0.5, size),\r
    fps: clamp(fps, 0, 60),\r
    flicker: clamp(flicker, 0, 1),\r
    dust: clamp(dust, 0, 1),\r
    scratches: clamp(scratches, 0, 1)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const blend = BLENDS.includes(blendMode) ? blendMode : 'normal';\r
\r
  useEffect(() => {\r
    const grain = grainRef.current;\r
    if (!grain) return undefined;\r
    let alive = true;\r
    const canvas = paintTile(clamp(contrast, 0, 1), colored);\r
    canvas?.toBlob(blob => {\r
      if (!alive || !blob) return;\r
      const previous = urlRef.current;\r
      urlRef.current = URL.createObjectURL(blob);\r
      grain.style.backgroundImage = \`url("\${urlRef.current}")\`;\r
      if (previous) URL.revokeObjectURL(previous);\r
    });\r
    return () => {\r
      alive = false;\r
    };\r
  }, [contrast, colored]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const grain = grainRef.current;\r
    const canvas = dustRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!root || !grain || !canvas || !ctx) return undefined;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const scratchList: { x: number; age: number; life: number; weight: number; light: boolean; phase: number }[] = [];\r
    let raf = 0;\r
    let last = 0;\r
    let roll = 0;\r
    let visible = true;\r
    let alive = true;\r
    let width = 1;\r
    let height = 1;\r
\r
    const paintDust = (s: typeof settings, step: number) => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      if (s.dust <= 0 && s.scratches <= 0 && scratchList.length === 0) return;\r
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);\r
      const area = (width * height) / 400000;\r
\r
      if (s.dust > 0) {\r
        const specks = Math.round(s.dust * 42 * area * (0.6 + Math.random() * 0.8));\r
        for (let i = 0; i < specks; i++) {\r
          const light = Math.random() < 0.3;\r
          drawSpeck(\r
            ctx,\r
            Math.random() * width,\r
            Math.random() * height,\r
            0.6 + Math.random() ** 2.5 * 3.4,\r
            light ? '255, 250, 240' : '18, 14, 10',\r
            0.6 + Math.random() * 0.35\r
          );\r
        }\r
        const hairs = Math.random() < s.dust * 0.7 ? 1 + Math.floor(Math.random() * s.dust * 2.4) : 0;\r
        for (let i = 0; i < hairs; i++) drawHair(ctx, width, height);\r
      }\r
\r
      if (step) {\r
        if (scratchList.length < 3 && Math.random() < s.scratches * 0.06) {\r
          scratchList.push({\r
            x: Math.random() * width,\r
            age: 0,\r
            life: 0.6 + Math.random() * 2.6,\r
            weight: 0.6 + Math.random() * 0.8,\r
            light: Math.random() < 0.7,\r
            phase: Math.random() * TAU\r
          });\r
        }\r
        for (let i = scratchList.length - 1; i >= 0; i--) {\r
          const scratch = scratchList[i];\r
          scratch.age += step;\r
          scratch.x += (Math.random() - 0.5) * 1.2;\r
          if (scratch.age >= scratch.life) scratchList.splice(i, 1);\r
        }\r
      }\r
      scratchList.forEach(scratch => {\r
        const fade = Math.min(1, scratch.age / 0.15, (scratch.life - scratch.age) / 0.3);\r
        const alpha = (0.25 + Math.random() * 0.35) * fade;\r
        ctx.strokeStyle = scratch.light ? \`rgba(255, 252, 245, \${alpha})\` : \`rgba(14, 11, 8, \${alpha})\`;\r
        ctx.lineWidth = scratch.weight;\r
        ctx.beginPath();\r
        for (let y = 0; y <= height; y += 24) {\r
          const x = scratch.x + Math.sin(y * 0.012 + scratch.phase) * 1.4;\r
          if (y === 0) ctx.moveTo(x, y);\r
          else ctx.lineTo(x, y);\r
        }\r
        ctx.stroke();\r
      });\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      width = Math.max(1, root.clientWidth);\r
      height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(width * dpr);\r
      canvas.height = Math.round(height * dpr);\r
      paintDust(settingsRef.current, 0);\r
    };\r
\r
    const tick = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const rate = reduce ? 0 : s.fps;\r
      if (rate > 0 && now - last >= 1000 / rate) {\r
        const step = last ? Math.min(0.2, (now - last) / 1000) : 1 / rate;\r
        last = now;\r
        const span = TILE * s.size;\r
        grain.style.backgroundPosition = \`\${(Math.random() * span).toFixed(1)}px \${(Math.random() * span).toFixed(1)}px\`;\r
        grain.style.opacity = String(s.opacity * (1 - s.flicker * Math.random() * 0.7));\r
        roll = (roll + 1) % 3;\r
        linesRef.current?.style.setProperty('background-position', \`0 \${roll}px\`);\r
        paintDust(s, step);\r
      }\r
      if (visible && rate > 0) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const wake = () => {\r
      paintDust(settingsRef.current, 0);\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(tick);\r
    };\r
    wakeRef.current = wake;\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    visibility.observe(root);\r
    resize();\r
    wake();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);\r
      urlRef.current = '';\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`\${fixed ? FIXED : ROOT}\${className ? \` \${className}\` : ''}\`}\r
      style={{ zIndex, ...style }}\r
      aria-hidden="true"\r
    >\r
      <div\r
        ref={grainRef}\r
        className={GRAIN}\r
        style={{\r
          opacity: settings.opacity,\r
          mixBlendMode: blend,\r
          backgroundSize: \`\${TILE * settings.size}px \${TILE * settings.size}px\`\r
        }}\r
      />\r
      <canvas ref={dustRef} className={DUST} />\r
      {scanlines > 0 && (\r
        <div ref={linesRef} className={LINES} style={{ opacity: clamp(scanlines, 0, 1), mixBlendMode: blend }} />\r
      )}\r
    </div>\r
  );\r
};\r
\r
export default Noise;\r
`,s={usage:`import Noise from './Noise';

<div style={{ position: 'relative', width: '100%', height: 500 }}>
  <img src="/photo.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  <Noise
    opacity={0.2}
    size={1}
    fps={24}
    blendMode="overlay"
    contrast={0.6}
    colored={false}
    dust={0}
    scratches={0}
    scanlines={0}
    flicker={0}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:a};export{s as noise};
