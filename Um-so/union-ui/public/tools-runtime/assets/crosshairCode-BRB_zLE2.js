const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const LINE_STYLES = ['solid', 'dashed', 'dotted'];\r
const EFFECTS = ['lock', 'glitch', 'none'];\r
const FONT = '500 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const HIDDEN = 'crosshair-cursor-hidden';\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toRgb = (ctx, color) => {\r
  ctx.fillStyle = '#000';\r
  ctx.fillStyle = color;\r
  const value = String(ctx.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255, a: 1 };\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? [255, 255, 255, 1];\r
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };\r
};\r
\r
const Crosshair = ({\r
  color = '#ffffff',\r
  containerRef = null,\r
  thickness = 1,\r
  opacity = 0.85,\r
  lineStyle = 'solid',\r
  gap = 0,\r
  fade = 0,\r
  smoothing = 0.35,\r
  showCoordinates = true,\r
  targetEffect = 'lock',\r
  targetSelector = 'a, button, [data-crosshair-target]',\r
  clickPulse = true,\r
  hideCursor = false,\r
  blendMode = 'normal',\r
  className = '',\r
  style\r
}) => {\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color,\r
    thickness: clamp(thickness, 0.5, 8),\r
    opacity: clamp(opacity, 0, 1),\r
    lineStyle: LINE_STYLES.includes(lineStyle) ? lineStyle : 'solid',\r
    gap: Math.max(0, gap),\r
    fade: clamp(fade, 0, 1),\r
    smoothing: clamp(smoothing, 0, 1),\r
    showCoordinates,\r
    targetEffect: EFFECTS.includes(targetEffect) ? targetEffect : 'lock',\r
    targetSelector,\r
    clickPulse,\r
    hideCursor\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!canvas || !ctx) return undefined;\r
    const host = containerRef?.current ?? null;\r
    const scope = host ?? window;\r
    const cursorOwner = host ?? document.documentElement;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      x: 0,\r
      y: 0,\r
      tx: 0,\r
      ty: 0,\r
      clientX: 0,\r
      clientY: 0,\r
      inside: false,\r
      seen: false,\r
      presence: 0,\r
      glitch: 0,\r
      target: null,\r
      lock: { x: 0, y: 0, w: 0, h: 0, alpha: 0 },\r
      pulses: []\r
    };\r
    const size = { w: 0, h: 0, dpr: 1 };\r
    let ink = toRgb(ctx, settingsRef.current.color);\r
    let inkSource = settingsRef.current.color;\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      size.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      size.w = rect.width;\r
      size.h = rect.height;\r
      canvas.width = Math.max(1, Math.round(rect.width * size.dpr));\r
      canvas.height = Math.max(1, Math.round(rect.height * size.dpr));\r
      wake();\r
    };\r
\r
    const rgba = alpha => \`rgba(\${ink.r}, \${ink.g}, \${ink.b}, \${clamp(alpha * ink.a, 0, 1)})\`;\r
    const crisp = (value, width) => {\r
      const device = Math.round(width * size.dpr);\r
      return (Math.round(value * size.dpr) + (device % 2 ? 0.5 : 0)) / size.dpr;\r
    };\r
\r
    const tag = (text, x, y, align) => {\r
      ctx.font = FONT;\r
      const width = ctx.measureText(text).width + 10;\r
      const height = 16;\r
      let left = align === 'center' ? x - width / 2 : x;\r
      let top = align === 'middle' ? y - height / 2 : y;\r
      left = clamp(left, 4, size.w - width - 4);\r
      top = clamp(top, 4, size.h - height - 4);\r
      const light = ink.r * 0.2126 + ink.g * 0.7152 + ink.b * 0.0722 > 150;\r
      ctx.fillStyle = rgba(1);\r
      ctx.beginPath();\r
      ctx.roundRect(left, top, width, height, 3);\r
      ctx.fill();\r
      ctx.fillStyle = light ? '#0a0a0a' : '#ffffff';\r
      ctx.textBaseline = 'middle';\r
      ctx.textAlign = 'center';\r
      ctx.fillText(text, left + width / 2, top + height / 2 + 0.5);\r
    };\r
\r
    const segment = (x1, y1, x2, y2, horizontal, s) => {\r
      const length = horizontal ? x2 - x1 : y2 - y1;\r
      if (length <= 0) return;\r
      if (s.fade > 0) {\r
        const gradient = horizontal\r
          ? ctx.createLinearGradient(0, 0, size.w, 0)\r
          : ctx.createLinearGradient(0, 0, 0, size.h);\r
        const at = clamp(horizontal ? state.x / size.w : state.y / size.h, 0.001, 0.999);\r
        gradient.addColorStop(0, rgba(1 - s.fade));\r
        gradient.addColorStop(at, rgba(1));\r
        gradient.addColorStop(1, rgba(1 - s.fade));\r
        ctx.strokeStyle = gradient;\r
      } else {\r
        ctx.strokeStyle = rgba(1);\r
      }\r
      ctx.beginPath();\r
      if (state.glitch > 0.01) {\r
        const pieces = Math.max(4, Math.round(length / 28));\r
        for (let i = 0; i < pieces; i++) {\r
          const jitter = (Math.random() - 0.5) * 14 * state.glitch;\r
          const from = i / pieces;\r
          const to = (i + 1) / pieces;\r
          if (horizontal) {\r
            ctx.moveTo(x1 + length * from, y1 + jitter);\r
            ctx.lineTo(x1 + length * to, y1 + jitter);\r
          } else {\r
            ctx.moveTo(x1 + jitter, y1 + length * from);\r
            ctx.lineTo(x1 + jitter, y1 + length * to);\r
          }\r
        }\r
      } else {\r
        ctx.moveTo(x1, y1);\r
        ctx.lineTo(x2, y2);\r
      }\r
      ctx.stroke();\r
    };\r
\r
    const brackets = (x, y, w, h, alpha) => {\r
      const arm = Math.min(14, w / 3, h / 3);\r
      ctx.strokeStyle = rgba(alpha);\r
      ctx.lineWidth = Math.max(1.5, settingsRef.current.thickness);\r
      ctx.setLineDash([]);\r
      ctx.lineCap = 'square';\r
      ctx.beginPath();\r
      ctx.moveTo(x, y + arm);\r
      ctx.lineTo(x, y);\r
      ctx.lineTo(x + arm, y);\r
      ctx.moveTo(x + w - arm, y);\r
      ctx.lineTo(x + w, y);\r
      ctx.lineTo(x + w, y + arm);\r
      ctx.moveTo(x + w, y + h - arm);\r
      ctx.lineTo(x + w, y + h);\r
      ctx.lineTo(x + w - arm, y + h);\r
      ctx.moveTo(x + arm, y + h);\r
      ctx.lineTo(x, y + h);\r
      ctx.lineTo(x, y + h - arm);\r
      ctx.stroke();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);\r
      ctx.clearRect(0, 0, size.w, size.h);\r
      if (state.presence > 0.001) {\r
        ctx.globalAlpha = state.presence * s.opacity * (1 - 0.6 * state.lock.alpha);\r
        ctx.lineWidth = s.thickness;\r
        ctx.lineCap = s.lineStyle === 'dotted' ? 'round' : 'butt';\r
        if (s.lineStyle === 'dashed') ctx.setLineDash([s.thickness * 6, s.thickness * 5]);\r
        else if (s.lineStyle === 'dotted') ctx.setLineDash([0, s.thickness * 4]);\r
        else ctx.setLineDash([]);\r
        const x = crisp(state.x, s.thickness);\r
        const y = crisp(state.y, s.thickness);\r
        segment(0, y, x - s.gap, y, true, s);\r
        segment(x + s.gap, y, size.w, y, true, s);\r
        segment(x, 0, x, y - s.gap, false, s);\r
        segment(x, y + s.gap, x, size.h, false, s);\r
        if (s.hideCursor) {\r
          ctx.fillStyle = rgba(1);\r
          ctx.beginPath();\r
          ctx.arc(state.x, state.y, Math.max(1.5, s.thickness * 1.5), 0, Math.PI * 2);\r
          ctx.fill();\r
        }\r
        if (s.showCoordinates && state.lock.alpha < 0.999) {\r
          ctx.globalAlpha = state.presence * s.opacity * (1 - state.lock.alpha);\r
          tag(String(Math.round(state.x)), state.x, 8, 'center');\r
          tag(String(Math.round(state.y)), 8, state.y, 'middle');\r
        }\r
      }\r
      if (state.lock.alpha > 0.001) {\r
        const { x, y, w, h, alpha } = state.lock;\r
        ctx.globalAlpha = alpha * s.opacity;\r
        brackets(x, y, w, h, 1);\r
        if (s.showCoordinates && state.target) {\r
          const box = state.target.getBoundingClientRect();\r
          tag(\`\${Math.round(box.width)} × \${Math.round(box.height)}\`, x + w / 2, y + h + 8, 'center');\r
        }\r
      }\r
      state.pulses.forEach(pulse => {\r
        const t = pulse.age / 0.55;\r
        const eased = 1 - (1 - t) ** 3;\r
        ctx.globalAlpha = (1 - t) ** 2 * s.opacity;\r
        ctx.strokeStyle = rgba(1);\r
        ctx.lineWidth = Math.max(1, s.thickness);\r
        ctx.setLineDash([]);\r
        ctx.beginPath();\r
        ctx.arc(pulse.x, pulse.y, 3 + 30 * eased, 0, Math.PI * 2);\r
        ctx.stroke();\r
      });\r
      ctx.globalAlpha = 1;\r
    };\r
\r
    const relative = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      state.tx = state.clientX - rect.left;\r
      state.ty = state.clientY - rect.top;\r
      return rect;\r
    };\r
\r
    const tick = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      if (s.color !== inkSource) {\r
        inkSource = s.color;\r
        ink = toRgb(ctx, s.color);\r
      }\r
      const rect = relative();\r
      const follow = reduce || s.smoothing === 0 ? 1 : 1 - Math.exp(-dt / (0.008 + s.smoothing * 0.16));\r
      state.x += (state.tx - state.x) * follow;\r
      state.y += (state.ty - state.y) * follow;\r
      const wanted = state.inside ? 1 : 0;\r
      state.presence += (wanted - state.presence) * (reduce ? 1 : 1 - Math.exp(-dt / (wanted ? 0.12 : 0.25)));\r
      if (Math.abs(wanted - state.presence) < 0.002) state.presence = wanted;\r
      const lock = state.lock;\r
      const locked = s.targetEffect === 'lock' && state.inside ? state.target : null;\r
      let goal;\r
      if (locked) {\r
        const box = locked.getBoundingClientRect();\r
        goal = { x: box.left - rect.left - 6, y: box.top - rect.top - 6, w: box.width + 12, h: box.height + 12 };\r
      } else {\r
        goal = { x: state.x - 10, y: state.y - 10, w: 20, h: 20 };\r
      }\r
      const snap = reduce ? 1 : 1 - Math.exp(-dt / 0.085);\r
      lock.x += (goal.x - lock.x) * snap;\r
      lock.y += (goal.y - lock.y) * snap;\r
      lock.w += (goal.w - lock.w) * snap;\r
      lock.h += (goal.h - lock.h) * snap;\r
      const shown = locked ? 1 : 0;\r
      lock.alpha += (shown - lock.alpha) * (reduce ? 1 : 1 - Math.exp(-dt / (shown ? 0.08 : 0.14)));\r
      if (Math.abs(shown - lock.alpha) < 0.002) lock.alpha = shown;\r
      state.glitch = reduce ? 0 : Math.max(0, state.glitch - dt / 0.5);\r
      state.pulses = state.pulses.filter(pulse => (pulse.age += dt) < 0.55);\r
      draw();\r
      const settling =\r
        Math.abs(state.tx - state.x) > 0.05 ||\r
        Math.abs(state.ty - state.y) > 0.05 ||\r
        state.presence !== wanted ||\r
        lock.alpha !== shown ||\r
        (locked && Math.abs(goal.w - lock.w) + Math.abs(goal.x - lock.x) + Math.abs(goal.y - lock.y) > 0.1) ||\r
        state.glitch > 0 ||\r
        state.pulses.length > 0;\r
      if (settling) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    const setCursorHidden = hidden => {\r
      cursorOwner.classList.toggle(HIDDEN, hidden);\r
    };\r
\r
    wakeRef.current = () => {\r
      setCursorHidden(state.inside && settingsRef.current.hideCursor);\r
      wake();\r
    };\r
\r
    const pick = element => {\r
      const s = settingsRef.current;\r
      if (s.targetEffect === 'none' || !(element instanceof Element)) return null;\r
      let found = null;\r
      try {\r
        found = element.closest(s.targetSelector);\r
      } catch {\r
        found = null;\r
      }\r
      if (found && host && !host.contains(found)) return null;\r
      return found;\r
    };\r
\r
    const retarget = element => {\r
      const next = pick(element);\r
      if (next === state.target) return;\r
      state.target = next;\r
      if (next && settingsRef.current.targetEffect === 'glitch') state.glitch = 1;\r
    };\r
\r
    const enter = () => {\r
      if (!state.seen) {\r
        state.seen = true;\r
        relative();\r
        state.x = state.tx;\r
        state.y = state.ty;\r
        state.lock.x = state.x - 10;\r
        state.lock.y = state.y - 10;\r
        state.lock.w = 20;\r
        state.lock.h = 20;\r
      }\r
      state.inside = true;\r
      setCursorHidden(settingsRef.current.hideCursor);\r
    };\r
\r
    const leave = () => {\r
      state.inside = false;\r
      state.target = null;\r
      setCursorHidden(false);\r
      wake();\r
    };\r
\r
    const onMove = event => {\r
      state.clientX = event.clientX;\r
      state.clientY = event.clientY;\r
      if (event.pointerType === 'touch' && event.buttons === 0) return;\r
      enter();\r
      retarget(event.target);\r
      wake();\r
    };\r
\r
    const onDown = event => {\r
      onMove(event);\r
      if (!settingsRef.current.clickPulse || reduce) return;\r
      relative();\r
      state.pulses.push({ x: state.tx, y: state.ty, age: 0 });\r
      wake();\r
    };\r
\r
    const onUp = event => {\r
      if (event.pointerType !== 'mouse') leave();\r
    };\r
\r
    const onWindowOut = event => {\r
      if (!event.relatedTarget) leave();\r
    };\r
\r
    const onScroll = () => {\r
      if (!state.inside) return;\r
      retarget(document.elementFromPoint(state.clientX, state.clientY));\r
      wake();\r
    };\r
\r
    const observer = new ResizeObserver(resize);\r
    observer.observe(canvas);\r
    scope.addEventListener('pointermove', onMove);\r
    scope.addEventListener('pointerdown', onDown);\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('pointercancel', onUp);\r
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });\r
    if (host) host.addEventListener('pointerleave', leave);\r
    else document.addEventListener('pointerout', onWindowOut);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      observer.disconnect();\r
      scope.removeEventListener('pointermove', onMove);\r
      scope.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      window.removeEventListener('scroll', onScroll, { capture: true });\r
      if (host) host.removeEventListener('pointerleave', leave);\r
      else document.removeEventListener('pointerout', onWindowOut);\r
      setCursorHidden(false);\r
      wakeRef.current = null;\r
    };\r
  }, [containerRef]);\r
\r
  return (\r
    <>\r
      <style>{\`.\${HIDDEN}, .\${HIDDEN} * { cursor: none !important; }\`}</style>\r
      <canvas\r
        ref={canvasRef}\r
        aria-hidden="true"\r
        className={className}\r
        style={{\r
          position: containerRef ? 'absolute' : 'fixed',\r
          inset: 0,\r
          width: '100%',\r
          height: '100%',\r
          pointerEvents: 'none',\r
          zIndex: 10000,\r
          mixBlendMode: blendMode,\r
          ...style\r
        }}\r
      />\r
    </>\r
  );\r
};\r
\r
export default Crosshair;\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const LINE_STYLES = ['solid', 'dashed', 'dotted'];\r
const EFFECTS = ['lock', 'glitch', 'none'];\r
const FONT = '500 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const HIDDEN = 'crosshair-cursor-hidden';\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toRgb = (ctx, color) => {\r
  ctx.fillStyle = '#000';\r
  ctx.fillStyle = color;\r
  const value = String(ctx.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255, a: 1 };\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? [255, 255, 255, 1];\r
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };\r
};\r
\r
const Crosshair = ({\r
  color = '#ffffff',\r
  containerRef = null,\r
  thickness = 1,\r
  opacity = 0.85,\r
  lineStyle = 'solid',\r
  gap = 0,\r
  fade = 0,\r
  smoothing = 0.35,\r
  showCoordinates = true,\r
  targetEffect = 'lock',\r
  targetSelector = 'a, button, [data-crosshair-target]',\r
  clickPulse = true,\r
  hideCursor = false,\r
  blendMode = 'normal',\r
  className = '',\r
  style\r
}) => {\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    color,\r
    thickness: clamp(thickness, 0.5, 8),\r
    opacity: clamp(opacity, 0, 1),\r
    lineStyle: LINE_STYLES.includes(lineStyle) ? lineStyle : 'solid',\r
    gap: Math.max(0, gap),\r
    fade: clamp(fade, 0, 1),\r
    smoothing: clamp(smoothing, 0, 1),\r
    showCoordinates,\r
    targetEffect: EFFECTS.includes(targetEffect) ? targetEffect : 'lock',\r
    targetSelector,\r
    clickPulse,\r
    hideCursor\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!canvas || !ctx) return undefined;\r
    const host = containerRef?.current ?? null;\r
    const scope = host ?? window;\r
    const cursorOwner = host ?? document.documentElement;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      x: 0,\r
      y: 0,\r
      tx: 0,\r
      ty: 0,\r
      clientX: 0,\r
      clientY: 0,\r
      inside: false,\r
      seen: false,\r
      presence: 0,\r
      glitch: 0,\r
      target: null,\r
      lock: { x: 0, y: 0, w: 0, h: 0, alpha: 0 },\r
      pulses: []\r
    };\r
    const size = { w: 0, h: 0, dpr: 1 };\r
    let ink = toRgb(ctx, settingsRef.current.color);\r
    let inkSource = settingsRef.current.color;\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      size.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      size.w = rect.width;\r
      size.h = rect.height;\r
      canvas.width = Math.max(1, Math.round(rect.width * size.dpr));\r
      canvas.height = Math.max(1, Math.round(rect.height * size.dpr));\r
      wake();\r
    };\r
\r
    const rgba = alpha => \`rgba(\${ink.r}, \${ink.g}, \${ink.b}, \${clamp(alpha * ink.a, 0, 1)})\`;\r
    const crisp = (value, width) => {\r
      const device = Math.round(width * size.dpr);\r
      return (Math.round(value * size.dpr) + (device % 2 ? 0.5 : 0)) / size.dpr;\r
    };\r
\r
    const tag = (text, x, y, align) => {\r
      ctx.font = FONT;\r
      const width = ctx.measureText(text).width + 10;\r
      const height = 16;\r
      let left = align === 'center' ? x - width / 2 : x;\r
      let top = align === 'middle' ? y - height / 2 : y;\r
      left = clamp(left, 4, size.w - width - 4);\r
      top = clamp(top, 4, size.h - height - 4);\r
      const light = ink.r * 0.2126 + ink.g * 0.7152 + ink.b * 0.0722 > 150;\r
      ctx.fillStyle = rgba(1);\r
      ctx.beginPath();\r
      ctx.roundRect(left, top, width, height, 3);\r
      ctx.fill();\r
      ctx.fillStyle = light ? '#0a0a0a' : '#ffffff';\r
      ctx.textBaseline = 'middle';\r
      ctx.textAlign = 'center';\r
      ctx.fillText(text, left + width / 2, top + height / 2 + 0.5);\r
    };\r
\r
    const segment = (x1, y1, x2, y2, horizontal, s) => {\r
      const length = horizontal ? x2 - x1 : y2 - y1;\r
      if (length <= 0) return;\r
      if (s.fade > 0) {\r
        const gradient = horizontal\r
          ? ctx.createLinearGradient(0, 0, size.w, 0)\r
          : ctx.createLinearGradient(0, 0, 0, size.h);\r
        const at = clamp(horizontal ? state.x / size.w : state.y / size.h, 0.001, 0.999);\r
        gradient.addColorStop(0, rgba(1 - s.fade));\r
        gradient.addColorStop(at, rgba(1));\r
        gradient.addColorStop(1, rgba(1 - s.fade));\r
        ctx.strokeStyle = gradient;\r
      } else {\r
        ctx.strokeStyle = rgba(1);\r
      }\r
      ctx.beginPath();\r
      if (state.glitch > 0.01) {\r
        const pieces = Math.max(4, Math.round(length / 28));\r
        for (let i = 0; i < pieces; i++) {\r
          const jitter = (Math.random() - 0.5) * 14 * state.glitch;\r
          const from = i / pieces;\r
          const to = (i + 1) / pieces;\r
          if (horizontal) {\r
            ctx.moveTo(x1 + length * from, y1 + jitter);\r
            ctx.lineTo(x1 + length * to, y1 + jitter);\r
          } else {\r
            ctx.moveTo(x1 + jitter, y1 + length * from);\r
            ctx.lineTo(x1 + jitter, y1 + length * to);\r
          }\r
        }\r
      } else {\r
        ctx.moveTo(x1, y1);\r
        ctx.lineTo(x2, y2);\r
      }\r
      ctx.stroke();\r
    };\r
\r
    const brackets = (x, y, w, h, alpha) => {\r
      const arm = Math.min(14, w / 3, h / 3);\r
      ctx.strokeStyle = rgba(alpha);\r
      ctx.lineWidth = Math.max(1.5, settingsRef.current.thickness);\r
      ctx.setLineDash([]);\r
      ctx.lineCap = 'square';\r
      ctx.beginPath();\r
      ctx.moveTo(x, y + arm);\r
      ctx.lineTo(x, y);\r
      ctx.lineTo(x + arm, y);\r
      ctx.moveTo(x + w - arm, y);\r
      ctx.lineTo(x + w, y);\r
      ctx.lineTo(x + w, y + arm);\r
      ctx.moveTo(x + w, y + h - arm);\r
      ctx.lineTo(x + w, y + h);\r
      ctx.lineTo(x + w - arm, y + h);\r
      ctx.moveTo(x + arm, y + h);\r
      ctx.lineTo(x, y + h);\r
      ctx.lineTo(x, y + h - arm);\r
      ctx.stroke();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);\r
      ctx.clearRect(0, 0, size.w, size.h);\r
      if (state.presence > 0.001) {\r
        ctx.globalAlpha = state.presence * s.opacity * (1 - 0.6 * state.lock.alpha);\r
        ctx.lineWidth = s.thickness;\r
        ctx.lineCap = s.lineStyle === 'dotted' ? 'round' : 'butt';\r
        if (s.lineStyle === 'dashed') ctx.setLineDash([s.thickness * 6, s.thickness * 5]);\r
        else if (s.lineStyle === 'dotted') ctx.setLineDash([0, s.thickness * 4]);\r
        else ctx.setLineDash([]);\r
        const x = crisp(state.x, s.thickness);\r
        const y = crisp(state.y, s.thickness);\r
        segment(0, y, x - s.gap, y, true, s);\r
        segment(x + s.gap, y, size.w, y, true, s);\r
        segment(x, 0, x, y - s.gap, false, s);\r
        segment(x, y + s.gap, x, size.h, false, s);\r
        if (s.hideCursor) {\r
          ctx.fillStyle = rgba(1);\r
          ctx.beginPath();\r
          ctx.arc(state.x, state.y, Math.max(1.5, s.thickness * 1.5), 0, Math.PI * 2);\r
          ctx.fill();\r
        }\r
        if (s.showCoordinates && state.lock.alpha < 0.999) {\r
          ctx.globalAlpha = state.presence * s.opacity * (1 - state.lock.alpha);\r
          tag(String(Math.round(state.x)), state.x, 8, 'center');\r
          tag(String(Math.round(state.y)), 8, state.y, 'middle');\r
        }\r
      }\r
      if (state.lock.alpha > 0.001) {\r
        const { x, y, w, h, alpha } = state.lock;\r
        ctx.globalAlpha = alpha * s.opacity;\r
        brackets(x, y, w, h, 1);\r
        if (s.showCoordinates && state.target) {\r
          const box = state.target.getBoundingClientRect();\r
          tag(\`\${Math.round(box.width)} × \${Math.round(box.height)}\`, x + w / 2, y + h + 8, 'center');\r
        }\r
      }\r
      state.pulses.forEach(pulse => {\r
        const t = pulse.age / 0.55;\r
        const eased = 1 - (1 - t) ** 3;\r
        ctx.globalAlpha = (1 - t) ** 2 * s.opacity;\r
        ctx.strokeStyle = rgba(1);\r
        ctx.lineWidth = Math.max(1, s.thickness);\r
        ctx.setLineDash([]);\r
        ctx.beginPath();\r
        ctx.arc(pulse.x, pulse.y, 3 + 30 * eased, 0, Math.PI * 2);\r
        ctx.stroke();\r
      });\r
      ctx.globalAlpha = 1;\r
    };\r
\r
    const relative = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      state.tx = state.clientX - rect.left;\r
      state.ty = state.clientY - rect.top;\r
      return rect;\r
    };\r
\r
    const tick = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      if (s.color !== inkSource) {\r
        inkSource = s.color;\r
        ink = toRgb(ctx, s.color);\r
      }\r
      const rect = relative();\r
      const follow = reduce || s.smoothing === 0 ? 1 : 1 - Math.exp(-dt / (0.008 + s.smoothing * 0.16));\r
      state.x += (state.tx - state.x) * follow;\r
      state.y += (state.ty - state.y) * follow;\r
      const wanted = state.inside ? 1 : 0;\r
      state.presence += (wanted - state.presence) * (reduce ? 1 : 1 - Math.exp(-dt / (wanted ? 0.12 : 0.25)));\r
      if (Math.abs(wanted - state.presence) < 0.002) state.presence = wanted;\r
      const lock = state.lock;\r
      const locked = s.targetEffect === 'lock' && state.inside ? state.target : null;\r
      let goal;\r
      if (locked) {\r
        const box = locked.getBoundingClientRect();\r
        goal = { x: box.left - rect.left - 6, y: box.top - rect.top - 6, w: box.width + 12, h: box.height + 12 };\r
      } else {\r
        goal = { x: state.x - 10, y: state.y - 10, w: 20, h: 20 };\r
      }\r
      const snap = reduce ? 1 : 1 - Math.exp(-dt / 0.085);\r
      lock.x += (goal.x - lock.x) * snap;\r
      lock.y += (goal.y - lock.y) * snap;\r
      lock.w += (goal.w - lock.w) * snap;\r
      lock.h += (goal.h - lock.h) * snap;\r
      const shown = locked ? 1 : 0;\r
      lock.alpha += (shown - lock.alpha) * (reduce ? 1 : 1 - Math.exp(-dt / (shown ? 0.08 : 0.14)));\r
      if (Math.abs(shown - lock.alpha) < 0.002) lock.alpha = shown;\r
      state.glitch = reduce ? 0 : Math.max(0, state.glitch - dt / 0.5);\r
      state.pulses = state.pulses.filter(pulse => (pulse.age += dt) < 0.55);\r
      draw();\r
      const settling =\r
        Math.abs(state.tx - state.x) > 0.05 ||\r
        Math.abs(state.ty - state.y) > 0.05 ||\r
        state.presence !== wanted ||\r
        lock.alpha !== shown ||\r
        (locked && Math.abs(goal.w - lock.w) + Math.abs(goal.x - lock.x) + Math.abs(goal.y - lock.y) > 0.1) ||\r
        state.glitch > 0 ||\r
        state.pulses.length > 0;\r
      if (settling) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    const setCursorHidden = hidden => {\r
      cursorOwner.classList.toggle(HIDDEN, hidden);\r
    };\r
\r
    wakeRef.current = () => {\r
      setCursorHidden(state.inside && settingsRef.current.hideCursor);\r
      wake();\r
    };\r
\r
    const pick = element => {\r
      const s = settingsRef.current;\r
      if (s.targetEffect === 'none' || !(element instanceof Element)) return null;\r
      let found = null;\r
      try {\r
        found = element.closest(s.targetSelector);\r
      } catch {\r
        found = null;\r
      }\r
      if (found && host && !host.contains(found)) return null;\r
      return found;\r
    };\r
\r
    const retarget = element => {\r
      const next = pick(element);\r
      if (next === state.target) return;\r
      state.target = next;\r
      if (next && settingsRef.current.targetEffect === 'glitch') state.glitch = 1;\r
    };\r
\r
    const enter = () => {\r
      if (!state.seen) {\r
        state.seen = true;\r
        relative();\r
        state.x = state.tx;\r
        state.y = state.ty;\r
        state.lock.x = state.x - 10;\r
        state.lock.y = state.y - 10;\r
        state.lock.w = 20;\r
        state.lock.h = 20;\r
      }\r
      state.inside = true;\r
      setCursorHidden(settingsRef.current.hideCursor);\r
    };\r
\r
    const leave = () => {\r
      state.inside = false;\r
      state.target = null;\r
      setCursorHidden(false);\r
      wake();\r
    };\r
\r
    const onMove = event => {\r
      state.clientX = event.clientX;\r
      state.clientY = event.clientY;\r
      if (event.pointerType === 'touch' && event.buttons === 0) return;\r
      enter();\r
      retarget(event.target);\r
      wake();\r
    };\r
\r
    const onDown = event => {\r
      onMove(event);\r
      if (!settingsRef.current.clickPulse || reduce) return;\r
      relative();\r
      state.pulses.push({ x: state.tx, y: state.ty, age: 0 });\r
      wake();\r
    };\r
\r
    const onUp = event => {\r
      if (event.pointerType !== 'mouse') leave();\r
    };\r
\r
    const onWindowOut = event => {\r
      if (!event.relatedTarget) leave();\r
    };\r
\r
    const onScroll = () => {\r
      if (!state.inside) return;\r
      retarget(document.elementFromPoint(state.clientX, state.clientY));\r
      wake();\r
    };\r
\r
    const observer = new ResizeObserver(resize);\r
    observer.observe(canvas);\r
    scope.addEventListener('pointermove', onMove);\r
    scope.addEventListener('pointerdown', onDown);\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('pointercancel', onUp);\r
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });\r
    if (host) host.addEventListener('pointerleave', leave);\r
    else document.addEventListener('pointerout', onWindowOut);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      observer.disconnect();\r
      scope.removeEventListener('pointermove', onMove);\r
      scope.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      window.removeEventListener('scroll', onScroll, { capture: true });\r
      if (host) host.removeEventListener('pointerleave', leave);\r
      else document.removeEventListener('pointerout', onWindowOut);\r
      setCursorHidden(false);\r
      wakeRef.current = null;\r
    };\r
  }, [containerRef]);\r
\r
  return (\r
    <>\r
      <style>{\`.\${HIDDEN}, .\${HIDDEN} * { cursor: none !important; }\`}</style>\r
      <canvas\r
        ref={canvasRef}\r
        aria-hidden="true"\r
        className={[\r
          containerRef ? 'absolute' : 'fixed',\r
          'inset-0 h-full w-full pointer-events-none z-[10000]',\r
          className\r
        ]\r
          .filter(Boolean)\r
          .join(' ')}\r
        style={{ mixBlendMode: blendMode, ...style }}\r
      />\r
    </>\r
  );\r
};\r
\r
export default Crosshair;\r
`,t=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
export type CrosshairLineStyle = 'solid' | 'dashed' | 'dotted';\r
\r
export type CrosshairTargetEffect = 'lock' | 'glitch' | 'none';\r
\r
export type CrosshairProps = {\r
  color?: string;\r
  containerRef?: React.RefObject<HTMLElement | null> | null;\r
  thickness?: number;\r
  opacity?: number;\r
  lineStyle?: CrosshairLineStyle;\r
  gap?: number;\r
  fade?: number;\r
  smoothing?: number;\r
  showCoordinates?: boolean;\r
  targetEffect?: CrosshairTargetEffect;\r
  targetSelector?: string;\r
  clickPulse?: boolean;\r
  hideCursor?: boolean;\r
  blendMode?: 'normal' | 'difference';\r
  className?: string;\r
  style?: React.CSSProperties;\r
};\r
\r
type Ink = { r: number; g: number; b: number; a: number };\r
\r
type Pulse = { x: number; y: number; age: number };\r
\r
type Box = { x: number; y: number; w: number; h: number };\r
\r
type Settings = {\r
  color: string;\r
  thickness: number;\r
  opacity: number;\r
  lineStyle: CrosshairLineStyle;\r
  gap: number;\r
  fade: number;\r
  smoothing: number;\r
  showCoordinates: boolean;\r
  targetEffect: CrosshairTargetEffect;\r
  targetSelector: string;\r
  clickPulse: boolean;\r
  hideCursor: boolean;\r
};\r
\r
const LINE_STYLES: CrosshairLineStyle[] = ['solid', 'dashed', 'dotted'];\r
const EFFECTS: CrosshairTargetEffect[] = ['lock', 'glitch', 'none'];\r
const FONT = '500 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const HIDDEN = 'crosshair-cursor-hidden';\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toRgb = (ctx: CanvasRenderingContext2D, color: string): Ink => {\r
  ctx.fillStyle = '#000';\r
  ctx.fillStyle = color;\r
  const value = String(ctx.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255, a: 1 };\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? [255, 255, 255, 1];\r
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };\r
};\r
\r
const Crosshair = ({\r
  color = '#ffffff',\r
  containerRef = null,\r
  thickness = 1,\r
  opacity = 0.85,\r
  lineStyle = 'solid',\r
  gap = 0,\r
  fade = 0,\r
  smoothing = 0.35,\r
  showCoordinates = true,\r
  targetEffect = 'lock',\r
  targetSelector = 'a, button, [data-crosshair-target]',\r
  clickPulse = true,\r
  hideCursor = false,\r
  blendMode = 'normal',\r
  className = '',\r
  style\r
}: CrosshairProps) => {\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color,\r
    thickness: clamp(thickness, 0.5, 8),\r
    opacity: clamp(opacity, 0, 1),\r
    lineStyle: LINE_STYLES.includes(lineStyle) ? lineStyle : 'solid',\r
    gap: Math.max(0, gap),\r
    fade: clamp(fade, 0, 1),\r
    smoothing: clamp(smoothing, 0, 1),\r
    showCoordinates,\r
    targetEffect: EFFECTS.includes(targetEffect) ? targetEffect : 'lock',\r
    targetSelector,\r
    clickPulse,\r
    hideCursor\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!canvas || !ctx) return undefined;\r
    const host = containerRef?.current ?? null;\r
    const scope = (host ?? window) as HTMLElement;\r
    const cursorOwner = host ?? document.documentElement;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      x: 0,\r
      y: 0,\r
      tx: 0,\r
      ty: 0,\r
      clientX: 0,\r
      clientY: 0,\r
      inside: false,\r
      seen: false,\r
      presence: 0,\r
      glitch: 0,\r
      target: null as Element | null,\r
      lock: { x: 0, y: 0, w: 0, h: 0, alpha: 0 },\r
      pulses: [] as Pulse[]\r
    };\r
    const size = { w: 0, h: 0, dpr: 1 };\r
    let ink = toRgb(ctx, settingsRef.current.color);\r
    let inkSource = settingsRef.current.color;\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      size.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      size.w = rect.width;\r
      size.h = rect.height;\r
      canvas.width = Math.max(1, Math.round(rect.width * size.dpr));\r
      canvas.height = Math.max(1, Math.round(rect.height * size.dpr));\r
      wake();\r
    };\r
\r
    const rgba = (alpha: number) => \`rgba(\${ink.r}, \${ink.g}, \${ink.b}, \${clamp(alpha * ink.a, 0, 1)})\`;\r
    const crisp = (value: number, width: number) => {\r
      const device = Math.round(width * size.dpr);\r
      return (Math.round(value * size.dpr) + (device % 2 ? 0.5 : 0)) / size.dpr;\r
    };\r
\r
    const tag = (text: string, x: number, y: number, align: 'center' | 'middle') => {\r
      ctx.font = FONT;\r
      const width = ctx.measureText(text).width + 10;\r
      const height = 16;\r
      let left = align === 'center' ? x - width / 2 : x;\r
      let top = align === 'middle' ? y - height / 2 : y;\r
      left = clamp(left, 4, size.w - width - 4);\r
      top = clamp(top, 4, size.h - height - 4);\r
      const light = ink.r * 0.2126 + ink.g * 0.7152 + ink.b * 0.0722 > 150;\r
      ctx.fillStyle = rgba(1);\r
      ctx.beginPath();\r
      ctx.roundRect(left, top, width, height, 3);\r
      ctx.fill();\r
      ctx.fillStyle = light ? '#0a0a0a' : '#ffffff';\r
      ctx.textBaseline = 'middle';\r
      ctx.textAlign = 'center';\r
      ctx.fillText(text, left + width / 2, top + height / 2 + 0.5);\r
    };\r
\r
    const segment = (x1: number, y1: number, x2: number, y2: number, horizontal: boolean, s: Settings) => {\r
      const length = horizontal ? x2 - x1 : y2 - y1;\r
      if (length <= 0) return;\r
      if (s.fade > 0) {\r
        const gradient = horizontal\r
          ? ctx.createLinearGradient(0, 0, size.w, 0)\r
          : ctx.createLinearGradient(0, 0, 0, size.h);\r
        const at = clamp(horizontal ? state.x / size.w : state.y / size.h, 0.001, 0.999);\r
        gradient.addColorStop(0, rgba(1 - s.fade));\r
        gradient.addColorStop(at, rgba(1));\r
        gradient.addColorStop(1, rgba(1 - s.fade));\r
        ctx.strokeStyle = gradient;\r
      } else {\r
        ctx.strokeStyle = rgba(1);\r
      }\r
      ctx.beginPath();\r
      if (state.glitch > 0.01) {\r
        const pieces = Math.max(4, Math.round(length / 28));\r
        for (let i = 0; i < pieces; i++) {\r
          const jitter = (Math.random() - 0.5) * 14 * state.glitch;\r
          const from = i / pieces;\r
          const to = (i + 1) / pieces;\r
          if (horizontal) {\r
            ctx.moveTo(x1 + length * from, y1 + jitter);\r
            ctx.lineTo(x1 + length * to, y1 + jitter);\r
          } else {\r
            ctx.moveTo(x1 + jitter, y1 + length * from);\r
            ctx.lineTo(x1 + jitter, y1 + length * to);\r
          }\r
        }\r
      } else {\r
        ctx.moveTo(x1, y1);\r
        ctx.lineTo(x2, y2);\r
      }\r
      ctx.stroke();\r
    };\r
\r
    const brackets = (x: number, y: number, w: number, h: number, alpha: number) => {\r
      const arm = Math.min(14, w / 3, h / 3);\r
      ctx.strokeStyle = rgba(alpha);\r
      ctx.lineWidth = Math.max(1.5, settingsRef.current.thickness);\r
      ctx.setLineDash([]);\r
      ctx.lineCap = 'square';\r
      ctx.beginPath();\r
      ctx.moveTo(x, y + arm);\r
      ctx.lineTo(x, y);\r
      ctx.lineTo(x + arm, y);\r
      ctx.moveTo(x + w - arm, y);\r
      ctx.lineTo(x + w, y);\r
      ctx.lineTo(x + w, y + arm);\r
      ctx.moveTo(x + w, y + h - arm);\r
      ctx.lineTo(x + w, y + h);\r
      ctx.lineTo(x + w - arm, y + h);\r
      ctx.moveTo(x + arm, y + h);\r
      ctx.lineTo(x, y + h);\r
      ctx.lineTo(x, y + h - arm);\r
      ctx.stroke();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);\r
      ctx.clearRect(0, 0, size.w, size.h);\r
      if (state.presence > 0.001) {\r
        ctx.globalAlpha = state.presence * s.opacity * (1 - 0.6 * state.lock.alpha);\r
        ctx.lineWidth = s.thickness;\r
        ctx.lineCap = s.lineStyle === 'dotted' ? 'round' : 'butt';\r
        if (s.lineStyle === 'dashed') ctx.setLineDash([s.thickness * 6, s.thickness * 5]);\r
        else if (s.lineStyle === 'dotted') ctx.setLineDash([0, s.thickness * 4]);\r
        else ctx.setLineDash([]);\r
        const x = crisp(state.x, s.thickness);\r
        const y = crisp(state.y, s.thickness);\r
        segment(0, y, x - s.gap, y, true, s);\r
        segment(x + s.gap, y, size.w, y, true, s);\r
        segment(x, 0, x, y - s.gap, false, s);\r
        segment(x, y + s.gap, x, size.h, false, s);\r
        if (s.hideCursor) {\r
          ctx.fillStyle = rgba(1);\r
          ctx.beginPath();\r
          ctx.arc(state.x, state.y, Math.max(1.5, s.thickness * 1.5), 0, Math.PI * 2);\r
          ctx.fill();\r
        }\r
        if (s.showCoordinates && state.lock.alpha < 0.999) {\r
          ctx.globalAlpha = state.presence * s.opacity * (1 - state.lock.alpha);\r
          tag(String(Math.round(state.x)), state.x, 8, 'center');\r
          tag(String(Math.round(state.y)), 8, state.y, 'middle');\r
        }\r
      }\r
      if (state.lock.alpha > 0.001) {\r
        const { x, y, w, h, alpha } = state.lock;\r
        ctx.globalAlpha = alpha * s.opacity;\r
        brackets(x, y, w, h, 1);\r
        if (s.showCoordinates && state.target) {\r
          const box = state.target.getBoundingClientRect();\r
          tag(\`\${Math.round(box.width)} × \${Math.round(box.height)}\`, x + w / 2, y + h + 8, 'center');\r
        }\r
      }\r
      state.pulses.forEach(pulse => {\r
        const t = pulse.age / 0.55;\r
        const eased = 1 - (1 - t) ** 3;\r
        ctx.globalAlpha = (1 - t) ** 2 * s.opacity;\r
        ctx.strokeStyle = rgba(1);\r
        ctx.lineWidth = Math.max(1, s.thickness);\r
        ctx.setLineDash([]);\r
        ctx.beginPath();\r
        ctx.arc(pulse.x, pulse.y, 3 + 30 * eased, 0, Math.PI * 2);\r
        ctx.stroke();\r
      });\r
      ctx.globalAlpha = 1;\r
    };\r
\r
    const relative = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      state.tx = state.clientX - rect.left;\r
      state.ty = state.clientY - rect.top;\r
      return rect;\r
    };\r
\r
    const tick = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      if (s.color !== inkSource) {\r
        inkSource = s.color;\r
        ink = toRgb(ctx, s.color);\r
      }\r
      const rect = relative();\r
      const follow = reduce || s.smoothing === 0 ? 1 : 1 - Math.exp(-dt / (0.008 + s.smoothing * 0.16));\r
      state.x += (state.tx - state.x) * follow;\r
      state.y += (state.ty - state.y) * follow;\r
      const wanted = state.inside ? 1 : 0;\r
      state.presence += (wanted - state.presence) * (reduce ? 1 : 1 - Math.exp(-dt / (wanted ? 0.12 : 0.25)));\r
      if (Math.abs(wanted - state.presence) < 0.002) state.presence = wanted;\r
      const lock = state.lock;\r
      const locked = s.targetEffect === 'lock' && state.inside ? state.target : null;\r
      let goal: Box;\r
      if (locked) {\r
        const box = locked.getBoundingClientRect();\r
        goal = { x: box.left - rect.left - 6, y: box.top - rect.top - 6, w: box.width + 12, h: box.height + 12 };\r
      } else {\r
        goal = { x: state.x - 10, y: state.y - 10, w: 20, h: 20 };\r
      }\r
      const snap = reduce ? 1 : 1 - Math.exp(-dt / 0.085);\r
      lock.x += (goal.x - lock.x) * snap;\r
      lock.y += (goal.y - lock.y) * snap;\r
      lock.w += (goal.w - lock.w) * snap;\r
      lock.h += (goal.h - lock.h) * snap;\r
      const shown = locked ? 1 : 0;\r
      lock.alpha += (shown - lock.alpha) * (reduce ? 1 : 1 - Math.exp(-dt / (shown ? 0.08 : 0.14)));\r
      if (Math.abs(shown - lock.alpha) < 0.002) lock.alpha = shown;\r
      state.glitch = reduce ? 0 : Math.max(0, state.glitch - dt / 0.5);\r
      state.pulses = state.pulses.filter(pulse => (pulse.age += dt) < 0.55);\r
      draw();\r
      const settling =\r
        Math.abs(state.tx - state.x) > 0.05 ||\r
        Math.abs(state.ty - state.y) > 0.05 ||\r
        state.presence !== wanted ||\r
        lock.alpha !== shown ||\r
        (locked && Math.abs(goal.w - lock.w) + Math.abs(goal.x - lock.x) + Math.abs(goal.y - lock.y) > 0.1) ||\r
        state.glitch > 0 ||\r
        state.pulses.length > 0;\r
      if (settling) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    const setCursorHidden = (hidden: boolean) => {\r
      cursorOwner.classList.toggle(HIDDEN, hidden);\r
    };\r
\r
    wakeRef.current = () => {\r
      setCursorHidden(state.inside && settingsRef.current.hideCursor);\r
      wake();\r
    };\r
\r
    const pick = (element: EventTarget | null): Element | null => {\r
      const s = settingsRef.current;\r
      if (s.targetEffect === 'none' || !(element instanceof Element)) return null;\r
      let found: Element | null = null;\r
      try {\r
        found = element.closest(s.targetSelector);\r
      } catch {\r
        found = null;\r
      }\r
      if (found && host && !host.contains(found)) return null;\r
      return found;\r
    };\r
\r
    const retarget = (element: EventTarget | null) => {\r
      const next = pick(element);\r
      if (next === state.target) return;\r
      state.target = next;\r
      if (next && settingsRef.current.targetEffect === 'glitch') state.glitch = 1;\r
    };\r
\r
    const enter = () => {\r
      if (!state.seen) {\r
        state.seen = true;\r
        relative();\r
        state.x = state.tx;\r
        state.y = state.ty;\r
        state.lock.x = state.x - 10;\r
        state.lock.y = state.y - 10;\r
        state.lock.w = 20;\r
        state.lock.h = 20;\r
      }\r
      state.inside = true;\r
      setCursorHidden(settingsRef.current.hideCursor);\r
    };\r
\r
    const leave = () => {\r
      state.inside = false;\r
      state.target = null;\r
      setCursorHidden(false);\r
      wake();\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      state.clientX = event.clientX;\r
      state.clientY = event.clientY;\r
      if (event.pointerType === 'touch' && event.buttons === 0) return;\r
      enter();\r
      retarget(event.target);\r
      wake();\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      onMove(event);\r
      if (!settingsRef.current.clickPulse || reduce) return;\r
      relative();\r
      state.pulses.push({ x: state.tx, y: state.ty, age: 0 });\r
      wake();\r
    };\r
\r
    const onUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') leave();\r
    };\r
\r
    const onWindowOut = (event: PointerEvent) => {\r
      if (!event.relatedTarget) leave();\r
    };\r
\r
    const onScroll = () => {\r
      if (!state.inside) return;\r
      retarget(document.elementFromPoint(state.clientX, state.clientY));\r
      wake();\r
    };\r
\r
    const observer = new ResizeObserver(resize);\r
    observer.observe(canvas);\r
    scope.addEventListener('pointermove', onMove);\r
    scope.addEventListener('pointerdown', onDown);\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('pointercancel', onUp);\r
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });\r
    if (host) host.addEventListener('pointerleave', leave);\r
    else document.addEventListener('pointerout', onWindowOut);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      observer.disconnect();\r
      scope.removeEventListener('pointermove', onMove);\r
      scope.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      window.removeEventListener('scroll', onScroll, { capture: true });\r
      if (host) host.removeEventListener('pointerleave', leave);\r
      else document.removeEventListener('pointerout', onWindowOut);\r
      setCursorHidden(false);\r
      wakeRef.current = null;\r
    };\r
  }, [containerRef]);\r
\r
  return (\r
    <>\r
      <style>{\`.\${HIDDEN}, .\${HIDDEN} * { cursor: none !important; }\`}</style>\r
      <canvas\r
        ref={canvasRef}\r
        aria-hidden="true"\r
        className={className}\r
        style={{\r
          position: containerRef ? 'absolute' : 'fixed',\r
          inset: 0,\r
          width: '100%',\r
          height: '100%',\r
          pointerEvents: 'none',\r
          zIndex: 10000,\r
          mixBlendMode: blendMode,\r
          ...style\r
        }}\r
      />\r
    </>\r
  );\r
};\r
\r
export default Crosshair;\r
`,r=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
export type CrosshairLineStyle = 'solid' | 'dashed' | 'dotted';\r
\r
export type CrosshairTargetEffect = 'lock' | 'glitch' | 'none';\r
\r
export type CrosshairProps = {\r
  color?: string;\r
  containerRef?: React.RefObject<HTMLElement | null> | null;\r
  thickness?: number;\r
  opacity?: number;\r
  lineStyle?: CrosshairLineStyle;\r
  gap?: number;\r
  fade?: number;\r
  smoothing?: number;\r
  showCoordinates?: boolean;\r
  targetEffect?: CrosshairTargetEffect;\r
  targetSelector?: string;\r
  clickPulse?: boolean;\r
  hideCursor?: boolean;\r
  blendMode?: 'normal' | 'difference';\r
  className?: string;\r
  style?: React.CSSProperties;\r
};\r
\r
type Ink = { r: number; g: number; b: number; a: number };\r
\r
type Pulse = { x: number; y: number; age: number };\r
\r
type Box = { x: number; y: number; w: number; h: number };\r
\r
type Settings = {\r
  color: string;\r
  thickness: number;\r
  opacity: number;\r
  lineStyle: CrosshairLineStyle;\r
  gap: number;\r
  fade: number;\r
  smoothing: number;\r
  showCoordinates: boolean;\r
  targetEffect: CrosshairTargetEffect;\r
  targetSelector: string;\r
  clickPulse: boolean;\r
  hideCursor: boolean;\r
};\r
\r
const LINE_STYLES: CrosshairLineStyle[] = ['solid', 'dashed', 'dotted'];\r
const EFFECTS: CrosshairTargetEffect[] = ['lock', 'glitch', 'none'];\r
const FONT = '500 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const HIDDEN = 'crosshair-cursor-hidden';\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toRgb = (ctx: CanvasRenderingContext2D, color: string): Ink => {\r
  ctx.fillStyle = '#000';\r
  ctx.fillStyle = color;\r
  const value = String(ctx.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255, a: 1 };\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? [255, 255, 255, 1];\r
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };\r
};\r
\r
const Crosshair = ({\r
  color = '#ffffff',\r
  containerRef = null,\r
  thickness = 1,\r
  opacity = 0.85,\r
  lineStyle = 'solid',\r
  gap = 0,\r
  fade = 0,\r
  smoothing = 0.35,\r
  showCoordinates = true,\r
  targetEffect = 'lock',\r
  targetSelector = 'a, button, [data-crosshair-target]',\r
  clickPulse = true,\r
  hideCursor = false,\r
  blendMode = 'normal',\r
  className = '',\r
  style\r
}: CrosshairProps) => {\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    color,\r
    thickness: clamp(thickness, 0.5, 8),\r
    opacity: clamp(opacity, 0, 1),\r
    lineStyle: LINE_STYLES.includes(lineStyle) ? lineStyle : 'solid',\r
    gap: Math.max(0, gap),\r
    fade: clamp(fade, 0, 1),\r
    smoothing: clamp(smoothing, 0, 1),\r
    showCoordinates,\r
    targetEffect: EFFECTS.includes(targetEffect) ? targetEffect : 'lock',\r
    targetSelector,\r
    clickPulse,\r
    hideCursor\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const canvas = canvasRef.current;\r
    const ctx = canvas?.getContext('2d');\r
    if (!canvas || !ctx) return undefined;\r
    const host = containerRef?.current ?? null;\r
    const scope = (host ?? window) as HTMLElement;\r
    const cursorOwner = host ?? document.documentElement;\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      x: 0,\r
      y: 0,\r
      tx: 0,\r
      ty: 0,\r
      clientX: 0,\r
      clientY: 0,\r
      inside: false,\r
      seen: false,\r
      presence: 0,\r
      glitch: 0,\r
      target: null as Element | null,\r
      lock: { x: 0, y: 0, w: 0, h: 0, alpha: 0 },\r
      pulses: [] as Pulse[]\r
    };\r
    const size = { w: 0, h: 0, dpr: 1 };\r
    let ink = toRgb(ctx, settingsRef.current.color);\r
    let inkSource = settingsRef.current.color;\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
\r
    const resize = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      size.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      size.w = rect.width;\r
      size.h = rect.height;\r
      canvas.width = Math.max(1, Math.round(rect.width * size.dpr));\r
      canvas.height = Math.max(1, Math.round(rect.height * size.dpr));\r
      wake();\r
    };\r
\r
    const rgba = (alpha: number) => \`rgba(\${ink.r}, \${ink.g}, \${ink.b}, \${clamp(alpha * ink.a, 0, 1)})\`;\r
    const crisp = (value: number, width: number) => {\r
      const device = Math.round(width * size.dpr);\r
      return (Math.round(value * size.dpr) + (device % 2 ? 0.5 : 0)) / size.dpr;\r
    };\r
\r
    const tag = (text: string, x: number, y: number, align: 'center' | 'middle') => {\r
      ctx.font = FONT;\r
      const width = ctx.measureText(text).width + 10;\r
      const height = 16;\r
      let left = align === 'center' ? x - width / 2 : x;\r
      let top = align === 'middle' ? y - height / 2 : y;\r
      left = clamp(left, 4, size.w - width - 4);\r
      top = clamp(top, 4, size.h - height - 4);\r
      const light = ink.r * 0.2126 + ink.g * 0.7152 + ink.b * 0.0722 > 150;\r
      ctx.fillStyle = rgba(1);\r
      ctx.beginPath();\r
      ctx.roundRect(left, top, width, height, 3);\r
      ctx.fill();\r
      ctx.fillStyle = light ? '#0a0a0a' : '#ffffff';\r
      ctx.textBaseline = 'middle';\r
      ctx.textAlign = 'center';\r
      ctx.fillText(text, left + width / 2, top + height / 2 + 0.5);\r
    };\r
\r
    const segment = (x1: number, y1: number, x2: number, y2: number, horizontal: boolean, s: Settings) => {\r
      const length = horizontal ? x2 - x1 : y2 - y1;\r
      if (length <= 0) return;\r
      if (s.fade > 0) {\r
        const gradient = horizontal\r
          ? ctx.createLinearGradient(0, 0, size.w, 0)\r
          : ctx.createLinearGradient(0, 0, 0, size.h);\r
        const at = clamp(horizontal ? state.x / size.w : state.y / size.h, 0.001, 0.999);\r
        gradient.addColorStop(0, rgba(1 - s.fade));\r
        gradient.addColorStop(at, rgba(1));\r
        gradient.addColorStop(1, rgba(1 - s.fade));\r
        ctx.strokeStyle = gradient;\r
      } else {\r
        ctx.strokeStyle = rgba(1);\r
      }\r
      ctx.beginPath();\r
      if (state.glitch > 0.01) {\r
        const pieces = Math.max(4, Math.round(length / 28));\r
        for (let i = 0; i < pieces; i++) {\r
          const jitter = (Math.random() - 0.5) * 14 * state.glitch;\r
          const from = i / pieces;\r
          const to = (i + 1) / pieces;\r
          if (horizontal) {\r
            ctx.moveTo(x1 + length * from, y1 + jitter);\r
            ctx.lineTo(x1 + length * to, y1 + jitter);\r
          } else {\r
            ctx.moveTo(x1 + jitter, y1 + length * from);\r
            ctx.lineTo(x1 + jitter, y1 + length * to);\r
          }\r
        }\r
      } else {\r
        ctx.moveTo(x1, y1);\r
        ctx.lineTo(x2, y2);\r
      }\r
      ctx.stroke();\r
    };\r
\r
    const brackets = (x: number, y: number, w: number, h: number, alpha: number) => {\r
      const arm = Math.min(14, w / 3, h / 3);\r
      ctx.strokeStyle = rgba(alpha);\r
      ctx.lineWidth = Math.max(1.5, settingsRef.current.thickness);\r
      ctx.setLineDash([]);\r
      ctx.lineCap = 'square';\r
      ctx.beginPath();\r
      ctx.moveTo(x, y + arm);\r
      ctx.lineTo(x, y);\r
      ctx.lineTo(x + arm, y);\r
      ctx.moveTo(x + w - arm, y);\r
      ctx.lineTo(x + w, y);\r
      ctx.lineTo(x + w, y + arm);\r
      ctx.moveTo(x + w, y + h - arm);\r
      ctx.lineTo(x + w, y + h);\r
      ctx.lineTo(x + w - arm, y + h);\r
      ctx.moveTo(x + arm, y + h);\r
      ctx.lineTo(x, y + h);\r
      ctx.lineTo(x, y + h - arm);\r
      ctx.stroke();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);\r
      ctx.clearRect(0, 0, size.w, size.h);\r
      if (state.presence > 0.001) {\r
        ctx.globalAlpha = state.presence * s.opacity * (1 - 0.6 * state.lock.alpha);\r
        ctx.lineWidth = s.thickness;\r
        ctx.lineCap = s.lineStyle === 'dotted' ? 'round' : 'butt';\r
        if (s.lineStyle === 'dashed') ctx.setLineDash([s.thickness * 6, s.thickness * 5]);\r
        else if (s.lineStyle === 'dotted') ctx.setLineDash([0, s.thickness * 4]);\r
        else ctx.setLineDash([]);\r
        const x = crisp(state.x, s.thickness);\r
        const y = crisp(state.y, s.thickness);\r
        segment(0, y, x - s.gap, y, true, s);\r
        segment(x + s.gap, y, size.w, y, true, s);\r
        segment(x, 0, x, y - s.gap, false, s);\r
        segment(x, y + s.gap, x, size.h, false, s);\r
        if (s.hideCursor) {\r
          ctx.fillStyle = rgba(1);\r
          ctx.beginPath();\r
          ctx.arc(state.x, state.y, Math.max(1.5, s.thickness * 1.5), 0, Math.PI * 2);\r
          ctx.fill();\r
        }\r
        if (s.showCoordinates && state.lock.alpha < 0.999) {\r
          ctx.globalAlpha = state.presence * s.opacity * (1 - state.lock.alpha);\r
          tag(String(Math.round(state.x)), state.x, 8, 'center');\r
          tag(String(Math.round(state.y)), 8, state.y, 'middle');\r
        }\r
      }\r
      if (state.lock.alpha > 0.001) {\r
        const { x, y, w, h, alpha } = state.lock;\r
        ctx.globalAlpha = alpha * s.opacity;\r
        brackets(x, y, w, h, 1);\r
        if (s.showCoordinates && state.target) {\r
          const box = state.target.getBoundingClientRect();\r
          tag(\`\${Math.round(box.width)} × \${Math.round(box.height)}\`, x + w / 2, y + h + 8, 'center');\r
        }\r
      }\r
      state.pulses.forEach(pulse => {\r
        const t = pulse.age / 0.55;\r
        const eased = 1 - (1 - t) ** 3;\r
        ctx.globalAlpha = (1 - t) ** 2 * s.opacity;\r
        ctx.strokeStyle = rgba(1);\r
        ctx.lineWidth = Math.max(1, s.thickness);\r
        ctx.setLineDash([]);\r
        ctx.beginPath();\r
        ctx.arc(pulse.x, pulse.y, 3 + 30 * eased, 0, Math.PI * 2);\r
        ctx.stroke();\r
      });\r
      ctx.globalAlpha = 1;\r
    };\r
\r
    const relative = () => {\r
      const rect = canvas.getBoundingClientRect();\r
      state.tx = state.clientX - rect.left;\r
      state.ty = state.clientY - rect.top;\r
      return rect;\r
    };\r
\r
    const tick = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      if (s.color !== inkSource) {\r
        inkSource = s.color;\r
        ink = toRgb(ctx, s.color);\r
      }\r
      const rect = relative();\r
      const follow = reduce || s.smoothing === 0 ? 1 : 1 - Math.exp(-dt / (0.008 + s.smoothing * 0.16));\r
      state.x += (state.tx - state.x) * follow;\r
      state.y += (state.ty - state.y) * follow;\r
      const wanted = state.inside ? 1 : 0;\r
      state.presence += (wanted - state.presence) * (reduce ? 1 : 1 - Math.exp(-dt / (wanted ? 0.12 : 0.25)));\r
      if (Math.abs(wanted - state.presence) < 0.002) state.presence = wanted;\r
      const lock = state.lock;\r
      const locked = s.targetEffect === 'lock' && state.inside ? state.target : null;\r
      let goal: Box;\r
      if (locked) {\r
        const box = locked.getBoundingClientRect();\r
        goal = { x: box.left - rect.left - 6, y: box.top - rect.top - 6, w: box.width + 12, h: box.height + 12 };\r
      } else {\r
        goal = { x: state.x - 10, y: state.y - 10, w: 20, h: 20 };\r
      }\r
      const snap = reduce ? 1 : 1 - Math.exp(-dt / 0.085);\r
      lock.x += (goal.x - lock.x) * snap;\r
      lock.y += (goal.y - lock.y) * snap;\r
      lock.w += (goal.w - lock.w) * snap;\r
      lock.h += (goal.h - lock.h) * snap;\r
      const shown = locked ? 1 : 0;\r
      lock.alpha += (shown - lock.alpha) * (reduce ? 1 : 1 - Math.exp(-dt / (shown ? 0.08 : 0.14)));\r
      if (Math.abs(shown - lock.alpha) < 0.002) lock.alpha = shown;\r
      state.glitch = reduce ? 0 : Math.max(0, state.glitch - dt / 0.5);\r
      state.pulses = state.pulses.filter(pulse => (pulse.age += dt) < 0.55);\r
      draw();\r
      const settling =\r
        Math.abs(state.tx - state.x) > 0.05 ||\r
        Math.abs(state.ty - state.y) > 0.05 ||\r
        state.presence !== wanted ||\r
        lock.alpha !== shown ||\r
        (locked && Math.abs(goal.w - lock.w) + Math.abs(goal.x - lock.x) + Math.abs(goal.y - lock.y) > 0.1) ||\r
        state.glitch > 0 ||\r
        state.pulses.length > 0;\r
      if (settling) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    const setCursorHidden = (hidden: boolean) => {\r
      cursorOwner.classList.toggle(HIDDEN, hidden);\r
    };\r
\r
    wakeRef.current = () => {\r
      setCursorHidden(state.inside && settingsRef.current.hideCursor);\r
      wake();\r
    };\r
\r
    const pick = (element: EventTarget | null): Element | null => {\r
      const s = settingsRef.current;\r
      if (s.targetEffect === 'none' || !(element instanceof Element)) return null;\r
      let found: Element | null = null;\r
      try {\r
        found = element.closest(s.targetSelector);\r
      } catch {\r
        found = null;\r
      }\r
      if (found && host && !host.contains(found)) return null;\r
      return found;\r
    };\r
\r
    const retarget = (element: EventTarget | null) => {\r
      const next = pick(element);\r
      if (next === state.target) return;\r
      state.target = next;\r
      if (next && settingsRef.current.targetEffect === 'glitch') state.glitch = 1;\r
    };\r
\r
    const enter = () => {\r
      if (!state.seen) {\r
        state.seen = true;\r
        relative();\r
        state.x = state.tx;\r
        state.y = state.ty;\r
        state.lock.x = state.x - 10;\r
        state.lock.y = state.y - 10;\r
        state.lock.w = 20;\r
        state.lock.h = 20;\r
      }\r
      state.inside = true;\r
      setCursorHidden(settingsRef.current.hideCursor);\r
    };\r
\r
    const leave = () => {\r
      state.inside = false;\r
      state.target = null;\r
      setCursorHidden(false);\r
      wake();\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      state.clientX = event.clientX;\r
      state.clientY = event.clientY;\r
      if (event.pointerType === 'touch' && event.buttons === 0) return;\r
      enter();\r
      retarget(event.target);\r
      wake();\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      onMove(event);\r
      if (!settingsRef.current.clickPulse || reduce) return;\r
      relative();\r
      state.pulses.push({ x: state.tx, y: state.ty, age: 0 });\r
      wake();\r
    };\r
\r
    const onUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') leave();\r
    };\r
\r
    const onWindowOut = (event: PointerEvent) => {\r
      if (!event.relatedTarget) leave();\r
    };\r
\r
    const onScroll = () => {\r
      if (!state.inside) return;\r
      retarget(document.elementFromPoint(state.clientX, state.clientY));\r
      wake();\r
    };\r
\r
    const observer = new ResizeObserver(resize);\r
    observer.observe(canvas);\r
    scope.addEventListener('pointermove', onMove);\r
    scope.addEventListener('pointerdown', onDown);\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('pointercancel', onUp);\r
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });\r
    if (host) host.addEventListener('pointerleave', leave);\r
    else document.addEventListener('pointerout', onWindowOut);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      observer.disconnect();\r
      scope.removeEventListener('pointermove', onMove);\r
      scope.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      window.removeEventListener('scroll', onScroll, { capture: true });\r
      if (host) host.removeEventListener('pointerleave', leave);\r
      else document.removeEventListener('pointerout', onWindowOut);\r
      setCursorHidden(false);\r
      wakeRef.current = null;\r
    };\r
  }, [containerRef]);\r
\r
  return (\r
    <>\r
      <style>{\`.\${HIDDEN}, .\${HIDDEN} * { cursor: none !important; }\`}</style>\r
      <canvas\r
        ref={canvasRef}\r
        aria-hidden="true"\r
        className={[\r
          containerRef ? 'absolute' : 'fixed',\r
          'inset-0 h-full w-full pointer-events-none z-[10000]',\r
          className\r
        ]\r
          .filter(Boolean)\r
          .join(' ')}\r
        style={{ mixBlendMode: blendMode, ...style }}\r
      />\r
    </>\r
  );\r
};\r
\r
export default Crosshair;\r
`,s={dependencies:"",usage:`import { useRef } from 'react';
import Crosshair from './Crosshair';

const Hero = () => {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} style={{ position: 'relative', height: 400 }}>
      <Crosshair
        containerRef={containerRef}
        color="#ffffff"
        targetEffect="lock"
        thickness={1}
        opacity={0.85}
        smoothing={0.35}
        showCoordinates
      />
      <a href="/docs">Read the docs</a>
    </div>
  );
};`,code:n,tailwind:e,tsCode:t,tsTailwind:r};export{s as crosshair};
