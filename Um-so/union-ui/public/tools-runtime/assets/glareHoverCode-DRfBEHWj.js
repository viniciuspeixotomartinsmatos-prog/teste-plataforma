const e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './GlareHover.css';\r
\r
const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const bump = (t, center, half) => {\r
  const distance = Math.abs(t - center);\r
  return distance >= half ? 0 : smootherstep(1 - distance / half);\r
};\r
\r
const PROFILES = {\r
  streak: (t, softness) => bump(t, 0.5, 0.06 + 0.16 * softness) + 0.32 * bump(t, 0.5, 0.5),\r
  twin: (t, softness) =>\r
    bump(t, 0.36, 0.08 + 0.18 * softness) + 0.85 * bump(t, 0.7, 0.03 + 0.06 * softness) + 0.26 * bump(t, 0.5, 0.5),\r
  sheen: (t, softness) => 0.55 * bump(t, 0.5, 0.25 + 0.25 * softness) + 0.3 * bump(t, 0.5, 0.5)\r
};\r
\r
const gradient = (color, opacity, variant, softness) => {\r
  const profile = PROFILES[variant] ?? PROFILES.streak;\r
  const stops = Array.from({ length: 33 }, (_, index) => {\r
    const t = index / 32;\r
    const alpha = Math.round(Math.min(1, profile(t, softness) * opacity) * 1000) / 10;\r
    return \`color-mix(in srgb, \${color} \${alpha}%, transparent) \${(t * 100).toFixed(1)}%\`;\r
  });\r
  return \`linear-gradient(90deg, \${stops.join(', ')})\`;\r
};\r
\r
const ease = t => (1 - Math.cos(Math.PI * t)) / 2;\r
\r
const GlareHover = ({\r
  width = 'auto',\r
  height = 'auto',\r
  background = 'transparent',\r
  borderRadius = '10px',\r
  borderColor = 'transparent',\r
  children,\r
  glareColor = '#ffffff',\r
  glareOpacity = 0.5,\r
  glareAngle = -45,\r
  glareSize = 30,\r
  softness = 0.6,\r
  variant = 'streak',\r
  blendMode = 'screen',\r
  rimGlint = true,\r
  mode = 'hover',\r
  transitionDuration = 650,\r
  interval = 3,\r
  playOnce = false,\r
  intro = false,\r
  className = '',\r
  style = {}\r
}) => {\r
  const rootRef = useRef(null);\r
  const glareRef = useRef(null);\r
  const bandRef = useRef(null);\r
  const rimRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const introRef = useRef(false);\r
  const settings = { glareAngle, glareSize, transitionDuration, interval, playOnce, intro };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const glare = glareRef.current;\r
    if (!root || !glare) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const geometry = { band: 0, reach: 0, ux: 0, uy: -1, angle: 0 };\r
    const state = { pos: 0, velocity: 0, target: 0, presence: 0, presenceTarget: 0, sweep: null, visible: true };\r
    let raf = 0;\r
    let last = 0;\r
    let timer = 0;\r
\r
    const bands = () => [bandRef.current, rimRef.current].filter(Boolean);\r
\r
    const write = () => {\r
      const transform = \`translate(-50%, -50%) rotate(\${geometry.angle - 90}deg) translateX(\${state.pos.toFixed(2)}px)\`;\r
      for (const band of bands()) band.style.transform = transform;\r
      glare.style.opacity = state.presence.toFixed(3);\r
    };\r
\r
    const measure = () => {\r
      const { glareAngle: angle, glareSize: size } = settingsRef.current;\r
      const width = root.clientWidth;\r
      const height = root.clientHeight;\r
      const radians = (angle * Math.PI) / 180;\r
      const ux = Math.sin(radians);\r
      const uy = -Math.cos(radians);\r
      const diagonal = Math.hypot(width, height);\r
      const band = Math.max(8, (diagonal * size) / 100);\r
      const reach = (Math.abs(width * ux) + Math.abs(height * uy)) / 2 + band / 2 + 2;\r
      const resting = !state.sweep && mode !== 'follow';\r
      Object.assign(geometry, { band, reach, ux, uy, angle });\r
      for (const element of bands()) {\r
        element.style.width = \`\${band}px\`;\r
        element.style.height = \`\${diagonal + band}px\`;\r
      }\r
      if (resting) state.pos = state.pos > 0 ? reach : -reach;\r
      write();\r
    };\r
\r
    const frame = now => {\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      let moving = false;\r
      if (state.sweep) {\r
        const sweep = state.sweep;\r
        const t = Math.min(1, (now - sweep.start) / sweep.duration);\r
        state.pos = sweep.from + (sweep.to - sweep.from) * ease(t);\r
        if (t < 1) moving = true;\r
        else state.sweep = null;\r
      } else if (mode === 'follow') {\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
        const h = dt / steps;\r
        for (let i = 0; i < steps; i++) {\r
          state.velocity += (170 * (state.target - state.pos) - 24 * state.velocity) * h;\r
          state.pos += state.velocity * h;\r
        }\r
        const tau = state.presenceTarget > state.presence ? 0.18 : 0.4;\r
        state.presence += (state.presenceTarget - state.presence) * (1 - Math.exp(-dt / tau));\r
        moving =\r
          Math.abs(state.target - state.pos) > 0.05 ||\r
          Math.abs(state.velocity) > 0.05 ||\r
          Math.abs(state.presenceTarget - state.presence) > 0.002;\r
        if (!moving) state.presence = state.presenceTarget;\r
      }\r
      write();\r
      raf = moving ? requestAnimationFrame(frame) : 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const sweep = sign => {\r
      if (reduced || !geometry.reach) return;\r
      const end = sign * geometry.reach;\r
      const from = state.sweep || Math.abs(state.pos) < geometry.reach ? state.pos : -end;\r
      if (from === end) return;\r
      const share = Math.abs(end - from) / (2 * geometry.reach);\r
      state.sweep = {\r
        from,\r
        to: end,\r
        start: performance.now(),\r
        duration: Math.max(120, settingsRef.current.transitionDuration * share)\r
      };\r
      wake();\r
    };\r
\r
    const along = event => {\r
      const rect = root.getBoundingClientRect();\r
      const dx = event.clientX - (rect.left + rect.width / 2);\r
      const dy = event.clientY - (rect.top + rect.height / 2);\r
      return dx * geometry.ux + dy * geometry.uy;\r
    };\r
\r
    const follow = event => {\r
      state.target = Math.max(-geometry.reach, Math.min(geometry.reach, along(event)));\r
      wake();\r
    };\r
\r
    const onEnter = event => {\r
      if (mode === 'hover') sweep(along(event) > 0 ? -1 : 1);\r
      if (mode === 'follow') {\r
        if (state.presence < 0.02) {\r
          state.pos = Math.max(-geometry.reach, Math.min(geometry.reach, along(event)));\r
          state.velocity = 0;\r
        }\r
        state.presenceTarget = reduced ? 0 : 1;\r
        follow(event);\r
      }\r
    };\r
\r
    const onMove = event => {\r
      if (mode === 'follow') follow(event);\r
    };\r
\r
    const onLeave = event => {\r
      if (mode === 'hover' && !settingsRef.current.playOnce) sweep(along(event) > 0 ? 1 : -1);\r
      if (mode === 'follow') {\r
        state.presenceTarget = 0;\r
        wake();\r
      }\r
    };\r
\r
    const onDown = event => {\r
      if (mode === 'click') sweep(along(event) > 0 ? -1 : 1);\r
    };\r
\r
    const onFocus = event => {\r
      if (mode !== 'follow' && event.target.matches?.(':focus-visible')) sweep(1);\r
    };\r
\r
    const schedule = () => {\r
      window.clearTimeout(timer);\r
      if (mode !== 'loop' || reduced) return;\r
      timer = window.setTimeout(\r
        () => {\r
          if (state.visible && !document.hidden) sweep(1);\r
          schedule();\r
        },\r
        Math.max(0.5, settingsRef.current.interval) * 1000\r
      );\r
    };\r
\r
    root.addEventListener('pointerenter', onEnter);\r
    root.addEventListener('pointermove', onMove);\r
    root.addEventListener('pointerleave', onLeave);\r
    root.addEventListener('pointerdown', onDown);\r
    root.addEventListener('focusin', onFocus);\r
\r
    const resizeObserver = new ResizeObserver(measure);\r
    resizeObserver.observe(root);\r
\r
    const visibilityObserver = new IntersectionObserver(\r
      ([entry]) => {\r
        state.visible = entry.isIntersecting;\r
        if (entry.isIntersecting && settingsRef.current.intro && !introRef.current) {\r
          introRef.current = true;\r
          sweep(1);\r
        }\r
      },\r
      { threshold: 0.4 }\r
    );\r
    visibilityObserver.observe(root);\r
\r
    state.presence = mode === 'follow' ? 0 : 1;\r
    state.presenceTarget = state.presence;\r
    state.pos = -1e4;\r
    measure();\r
    schedule();\r
    engineRef.current = { measure };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(timer);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      root.removeEventListener('pointerenter', onEnter);\r
      root.removeEventListener('pointermove', onMove);\r
      root.removeEventListener('pointerleave', onLeave);\r
      root.removeEventListener('pointerdown', onDown);\r
      root.removeEventListener('focusin', onFocus);\r
      engineRef.current = null;\r
    };\r
  }, [mode]);\r
\r
  useEffect(() => {\r
    engineRef.current?.measure();\r
  }, [glareAngle, glareSize, rimGlint]);\r
\r
  const glare = gradient(glareColor, glareOpacity, variant, softness);\r
  const rim = gradient(glareColor, Math.min(1, glareOpacity * 1.8), variant, softness);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`glare-hover \${className}\`.trim()}\r
      style={{\r
        '--gh-width': width,\r
        '--gh-height': height,\r
        '--gh-bg': background,\r
        '--gh-br': borderRadius,\r
        '--gh-border': borderColor,\r
        '--gh-glare': glare,\r
        '--gh-rim': rim,\r
        '--gh-blend': blendMode,\r
        ...style\r
      }}\r
    >\r
      {children}\r
      <span ref={glareRef} className="glare-hover__glare" aria-hidden="true">\r
        <span ref={bandRef} className="glare-hover__band" />\r
        {rimGlint && (\r
          <span className="glare-hover__rim">\r
            <span ref={rimRef} className="glare-hover__band glare-hover__band--rim" />\r
          </span>\r
        )}\r
      </span>\r
    </div>\r
  );\r
};\r
\r
export default GlareHover;\r
`,n=`.glare-hover {\r
  position: relative;\r
  display: inline-grid;\r
  vertical-align: top;\r
  place-items: center;\r
  width: var(--gh-width);\r
  height: var(--gh-height);\r
  background: var(--gh-bg);\r
  border: 1px solid var(--gh-border);\r
  border-radius: var(--gh-br);\r
  overflow: hidden;\r
  isolation: isolate;\r
}\r
\r
.glare-hover__glare {\r
  position: absolute;\r
  inset: 0;\r
  z-index: 2;\r
  border-radius: inherit;\r
  opacity: 0;\r
  mix-blend-mode: var(--gh-blend);\r
  pointer-events: none;\r
}\r
\r
.glare-hover__band {\r
  position: absolute;\r
  top: 50%;\r
  left: 50%;\r
  background: var(--gh-glare);\r
  will-change: transform;\r
}\r
\r
.glare-hover__rim {\r
  position: absolute;\r
  inset: 0;\r
  padding: 1px;\r
  border-radius: inherit;\r
  -webkit-mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);\r
  -webkit-mask-clip: content-box, border-box;\r
  -webkit-mask-composite: xor;\r
  mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);\r
  mask-clip: content-box, border-box;\r
  mask-composite: exclude;\r
}\r
\r
.glare-hover__band--rim {\r
  background: var(--gh-rim);\r
}\r
`,r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const bump = (t, center, half) => {\r
  const distance = Math.abs(t - center);\r
  return distance >= half ? 0 : smootherstep(1 - distance / half);\r
};\r
\r
const PROFILES = {\r
  streak: (t, softness) => bump(t, 0.5, 0.06 + 0.16 * softness) + 0.32 * bump(t, 0.5, 0.5),\r
  twin: (t, softness) =>\r
    bump(t, 0.36, 0.08 + 0.18 * softness) + 0.85 * bump(t, 0.7, 0.03 + 0.06 * softness) + 0.26 * bump(t, 0.5, 0.5),\r
  sheen: (t, softness) => 0.55 * bump(t, 0.5, 0.25 + 0.25 * softness) + 0.3 * bump(t, 0.5, 0.5)\r
};\r
\r
const gradient = (color, opacity, variant, softness) => {\r
  const profile = PROFILES[variant] ?? PROFILES.streak;\r
  const stops = Array.from({ length: 33 }, (_, index) => {\r
    const t = index / 32;\r
    const alpha = Math.round(Math.min(1, profile(t, softness) * opacity) * 1000) / 10;\r
    return \`color-mix(in srgb, \${color} \${alpha}%, transparent) \${(t * 100).toFixed(1)}%\`;\r
  });\r
  return \`linear-gradient(90deg, \${stops.join(', ')})\`;\r
};\r
\r
const RIM_MASK = {\r
  WebkitMaskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',\r
  WebkitMaskClip: 'content-box, border-box',\r
  WebkitMaskComposite: 'xor',\r
  maskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',\r
  maskClip: 'content-box, border-box',\r
  maskComposite: 'exclude'\r
};\r
\r
const ROOT = 'relative isolate inline-grid place-items-center overflow-hidden border border-solid align-top';\r
const GLARE = 'pointer-events-none absolute inset-0 z-[2] rounded-[inherit] opacity-0';\r
const BAND = 'absolute left-1/2 top-1/2 will-change-transform';\r
const RIM = 'absolute inset-0 rounded-[inherit] p-px';\r
\r
const ease = t => (1 - Math.cos(Math.PI * t)) / 2;\r
\r
const GlareHover = ({\r
  width = 'auto',\r
  height = 'auto',\r
  background = 'transparent',\r
  borderRadius = '10px',\r
  borderColor = 'transparent',\r
  children,\r
  glareColor = '#ffffff',\r
  glareOpacity = 0.5,\r
  glareAngle = -45,\r
  glareSize = 30,\r
  softness = 0.6,\r
  variant = 'streak',\r
  blendMode = 'screen',\r
  rimGlint = true,\r
  mode = 'hover',\r
  transitionDuration = 650,\r
  interval = 3,\r
  playOnce = false,\r
  intro = false,\r
  className = '',\r
  style = {}\r
}) => {\r
  const rootRef = useRef(null);\r
  const glareRef = useRef(null);\r
  const bandRef = useRef(null);\r
  const rimRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const introRef = useRef(false);\r
  const settings = { glareAngle, glareSize, transitionDuration, interval, playOnce, intro };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const glare = glareRef.current;\r
    if (!root || !glare) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const geometry = { band: 0, reach: 0, ux: 0, uy: -1, angle: 0 };\r
    const state = { pos: 0, velocity: 0, target: 0, presence: 0, presenceTarget: 0, sweep: null, visible: true };\r
    let raf = 0;\r
    let last = 0;\r
    let timer = 0;\r
\r
    const bands = () => [bandRef.current, rimRef.current].filter(Boolean);\r
\r
    const write = () => {\r
      const transform = \`translate(-50%, -50%) rotate(\${geometry.angle - 90}deg) translateX(\${state.pos.toFixed(2)}px)\`;\r
      for (const band of bands()) band.style.transform = transform;\r
      glare.style.opacity = state.presence.toFixed(3);\r
    };\r
\r
    const measure = () => {\r
      const { glareAngle: angle, glareSize: size } = settingsRef.current;\r
      const width = root.clientWidth;\r
      const height = root.clientHeight;\r
      const radians = (angle * Math.PI) / 180;\r
      const ux = Math.sin(radians);\r
      const uy = -Math.cos(radians);\r
      const diagonal = Math.hypot(width, height);\r
      const band = Math.max(8, (diagonal * size) / 100);\r
      const reach = (Math.abs(width * ux) + Math.abs(height * uy)) / 2 + band / 2 + 2;\r
      const resting = !state.sweep && mode !== 'follow';\r
      Object.assign(geometry, { band, reach, ux, uy, angle });\r
      for (const element of bands()) {\r
        element.style.width = \`\${band}px\`;\r
        element.style.height = \`\${diagonal + band}px\`;\r
      }\r
      if (resting) state.pos = state.pos > 0 ? reach : -reach;\r
      write();\r
    };\r
\r
    const frame = now => {\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      let moving = false;\r
      if (state.sweep) {\r
        const sweep = state.sweep;\r
        const t = Math.min(1, (now - sweep.start) / sweep.duration);\r
        state.pos = sweep.from + (sweep.to - sweep.from) * ease(t);\r
        if (t < 1) moving = true;\r
        else state.sweep = null;\r
      } else if (mode === 'follow') {\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
        const h = dt / steps;\r
        for (let i = 0; i < steps; i++) {\r
          state.velocity += (170 * (state.target - state.pos) - 24 * state.velocity) * h;\r
          state.pos += state.velocity * h;\r
        }\r
        const tau = state.presenceTarget > state.presence ? 0.18 : 0.4;\r
        state.presence += (state.presenceTarget - state.presence) * (1 - Math.exp(-dt / tau));\r
        moving =\r
          Math.abs(state.target - state.pos) > 0.05 ||\r
          Math.abs(state.velocity) > 0.05 ||\r
          Math.abs(state.presenceTarget - state.presence) > 0.002;\r
        if (!moving) state.presence = state.presenceTarget;\r
      }\r
      write();\r
      raf = moving ? requestAnimationFrame(frame) : 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const sweep = sign => {\r
      if (reduced || !geometry.reach) return;\r
      const end = sign * geometry.reach;\r
      const from = state.sweep || Math.abs(state.pos) < geometry.reach ? state.pos : -end;\r
      if (from === end) return;\r
      const share = Math.abs(end - from) / (2 * geometry.reach);\r
      state.sweep = {\r
        from,\r
        to: end,\r
        start: performance.now(),\r
        duration: Math.max(120, settingsRef.current.transitionDuration * share)\r
      };\r
      wake();\r
    };\r
\r
    const along = event => {\r
      const rect = root.getBoundingClientRect();\r
      const dx = event.clientX - (rect.left + rect.width / 2);\r
      const dy = event.clientY - (rect.top + rect.height / 2);\r
      return dx * geometry.ux + dy * geometry.uy;\r
    };\r
\r
    const follow = event => {\r
      state.target = Math.max(-geometry.reach, Math.min(geometry.reach, along(event)));\r
      wake();\r
    };\r
\r
    const onEnter = event => {\r
      if (mode === 'hover') sweep(along(event) > 0 ? -1 : 1);\r
      if (mode === 'follow') {\r
        if (state.presence < 0.02) {\r
          state.pos = Math.max(-geometry.reach, Math.min(geometry.reach, along(event)));\r
          state.velocity = 0;\r
        }\r
        state.presenceTarget = reduced ? 0 : 1;\r
        follow(event);\r
      }\r
    };\r
\r
    const onMove = event => {\r
      if (mode === 'follow') follow(event);\r
    };\r
\r
    const onLeave = event => {\r
      if (mode === 'hover' && !settingsRef.current.playOnce) sweep(along(event) > 0 ? 1 : -1);\r
      if (mode === 'follow') {\r
        state.presenceTarget = 0;\r
        wake();\r
      }\r
    };\r
\r
    const onDown = event => {\r
      if (mode === 'click') sweep(along(event) > 0 ? -1 : 1);\r
    };\r
\r
    const onFocus = event => {\r
      if (mode !== 'follow' && event.target.matches?.(':focus-visible')) sweep(1);\r
    };\r
\r
    const schedule = () => {\r
      window.clearTimeout(timer);\r
      if (mode !== 'loop' || reduced) return;\r
      timer = window.setTimeout(\r
        () => {\r
          if (state.visible && !document.hidden) sweep(1);\r
          schedule();\r
        },\r
        Math.max(0.5, settingsRef.current.interval) * 1000\r
      );\r
    };\r
\r
    root.addEventListener('pointerenter', onEnter);\r
    root.addEventListener('pointermove', onMove);\r
    root.addEventListener('pointerleave', onLeave);\r
    root.addEventListener('pointerdown', onDown);\r
    root.addEventListener('focusin', onFocus);\r
\r
    const resizeObserver = new ResizeObserver(measure);\r
    resizeObserver.observe(root);\r
\r
    const visibilityObserver = new IntersectionObserver(\r
      ([entry]) => {\r
        state.visible = entry.isIntersecting;\r
        if (entry.isIntersecting && settingsRef.current.intro && !introRef.current) {\r
          introRef.current = true;\r
          sweep(1);\r
        }\r
      },\r
      { threshold: 0.4 }\r
    );\r
    visibilityObserver.observe(root);\r
\r
    state.presence = mode === 'follow' ? 0 : 1;\r
    state.presenceTarget = state.presence;\r
    state.pos = -1e4;\r
    measure();\r
    schedule();\r
    engineRef.current = { measure };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(timer);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      root.removeEventListener('pointerenter', onEnter);\r
      root.removeEventListener('pointermove', onMove);\r
      root.removeEventListener('pointerleave', onLeave);\r
      root.removeEventListener('pointerdown', onDown);\r
      root.removeEventListener('focusin', onFocus);\r
      engineRef.current = null;\r
    };\r
  }, [mode]);\r
\r
  useEffect(() => {\r
    engineRef.current?.measure();\r
  }, [glareAngle, glareSize, rimGlint]);\r
\r
  const glare = gradient(glareColor, glareOpacity, variant, softness);\r
  const rim = gradient(glareColor, Math.min(1, glareOpacity * 1.8), variant, softness);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`\${ROOT} \${className}\`.trim()}\r
      style={{\r
        width,\r
        height,\r
        background,\r
        borderRadius,\r
        borderColor,\r
        ...style\r
      }}\r
    >\r
      {children}\r
      <span ref={glareRef} className={GLARE} style={{ mixBlendMode: blendMode }} aria-hidden="true">\r
        <span ref={bandRef} className={BAND} style={{ background: glare }} />\r
        {rimGlint && (\r
          <span className={RIM} style={RIM_MASK}>\r
            <span ref={rimRef} className={BAND} style={{ background: rim }} />\r
          </span>\r
        )}\r
      </span>\r
    </div>\r
  );\r
};\r
\r
export default GlareHover;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';\r
\r
import './GlareHover.css';\r
\r
type Variant = 'streak' | 'twin' | 'sheen';\r
type Mode = 'hover' | 'follow' | 'loop' | 'click';\r
\r
interface GlareHoverProps {\r
  width?: string;\r
  height?: string;\r
  background?: string;\r
  borderRadius?: string;\r
  borderColor?: string;\r
  children?: ReactNode;\r
  glareColor?: string;\r
  glareOpacity?: number;\r
  glareAngle?: number;\r
  glareSize?: number;\r
  softness?: number;\r
  variant?: Variant;\r
  blendMode?: CSSProperties['mixBlendMode'];\r
  rimGlint?: boolean;\r
  mode?: Mode;\r
  transitionDuration?: number;\r
  interval?: number;\r
  playOnce?: boolean;\r
  intro?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Sweep {\r
  from: number;\r
  to: number;\r
  start: number;\r
  duration: number;\r
}\r
\r
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const bump = (t: number, center: number, half: number) => {\r
  const distance = Math.abs(t - center);\r
  return distance >= half ? 0 : smootherstep(1 - distance / half);\r
};\r
\r
const PROFILES: Record<Variant, (t: number, softness: number) => number> = {\r
  streak: (t: number, softness: number) => bump(t, 0.5, 0.06 + 0.16 * softness) + 0.32 * bump(t, 0.5, 0.5),\r
  twin: (t: number, softness: number) =>\r
    bump(t, 0.36, 0.08 + 0.18 * softness) + 0.85 * bump(t, 0.7, 0.03 + 0.06 * softness) + 0.26 * bump(t, 0.5, 0.5),\r
  sheen: (t: number, softness: number) => 0.55 * bump(t, 0.5, 0.25 + 0.25 * softness) + 0.3 * bump(t, 0.5, 0.5)\r
};\r
\r
const gradient = (color: string, opacity: number, variant: Variant, softness: number) => {\r
  const profile = PROFILES[variant] ?? PROFILES.streak;\r
  const stops = Array.from({ length: 33 }, (_, index) => {\r
    const t = index / 32;\r
    const alpha = Math.round(Math.min(1, profile(t, softness) * opacity) * 1000) / 10;\r
    return \`color-mix(in srgb, \${color} \${alpha}%, transparent) \${(t * 100).toFixed(1)}%\`;\r
  });\r
  return \`linear-gradient(90deg, \${stops.join(', ')})\`;\r
};\r
\r
const ease = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;\r
\r
const GlareHover = ({\r
  width = 'auto',\r
  height = 'auto',\r
  background = 'transparent',\r
  borderRadius = '10px',\r
  borderColor = 'transparent',\r
  children,\r
  glareColor = '#ffffff',\r
  glareOpacity = 0.5,\r
  glareAngle = -45,\r
  glareSize = 30,\r
  softness = 0.6,\r
  variant = 'streak',\r
  blendMode = 'screen',\r
  rimGlint = true,\r
  mode = 'hover',\r
  transitionDuration = 650,\r
  interval = 3,\r
  playOnce = false,\r
  intro = false,\r
  className = '',\r
  style = {}\r
}: GlareHoverProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const glareRef = useRef<HTMLSpanElement>(null);\r
  const bandRef = useRef<HTMLSpanElement>(null);\r
  const rimRef = useRef<HTMLSpanElement>(null);\r
  const engineRef = useRef<{ measure: () => void } | null>(null);\r
  const introRef = useRef(false);\r
  const settings = { glareAngle, glareSize, transitionDuration, interval, playOnce, intro };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const glare = glareRef.current;\r
    if (!root || !glare) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const geometry = { band: 0, reach: 0, ux: 0, uy: -1, angle: 0 };\r
    const state = {\r
      pos: 0,\r
      velocity: 0,\r
      target: 0,\r
      presence: 0,\r
      presenceTarget: 0,\r
      sweep: null as Sweep | null,\r
      visible: true\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let timer = 0;\r
\r
    const bands = () => [bandRef.current, rimRef.current].filter((band): band is HTMLSpanElement => Boolean(band));\r
\r
    const write = () => {\r
      const transform = \`translate(-50%, -50%) rotate(\${geometry.angle - 90}deg) translateX(\${state.pos.toFixed(2)}px)\`;\r
      for (const band of bands()) band.style.transform = transform;\r
      glare.style.opacity = state.presence.toFixed(3);\r
    };\r
\r
    const measure = () => {\r
      const { glareAngle: angle, glareSize: size } = settingsRef.current;\r
      const width = root.clientWidth;\r
      const height = root.clientHeight;\r
      const radians = (angle * Math.PI) / 180;\r
      const ux = Math.sin(radians);\r
      const uy = -Math.cos(radians);\r
      const diagonal = Math.hypot(width, height);\r
      const band = Math.max(8, (diagonal * size) / 100);\r
      const reach = (Math.abs(width * ux) + Math.abs(height * uy)) / 2 + band / 2 + 2;\r
      const resting = !state.sweep && mode !== 'follow';\r
      Object.assign(geometry, { band, reach, ux, uy, angle });\r
      for (const element of bands()) {\r
        element.style.width = \`\${band}px\`;\r
        element.style.height = \`\${diagonal + band}px\`;\r
      }\r
      if (resting) state.pos = state.pos > 0 ? reach : -reach;\r
      write();\r
    };\r
\r
    const frame = (now: number) => {\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      let moving = false;\r
      if (state.sweep) {\r
        const sweep = state.sweep;\r
        const t = Math.min(1, (now - sweep.start) / sweep.duration);\r
        state.pos = sweep.from + (sweep.to - sweep.from) * ease(t);\r
        if (t < 1) moving = true;\r
        else state.sweep = null;\r
      } else if (mode === 'follow') {\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
        const h = dt / steps;\r
        for (let i = 0; i < steps; i++) {\r
          state.velocity += (170 * (state.target - state.pos) - 24 * state.velocity) * h;\r
          state.pos += state.velocity * h;\r
        }\r
        const tau = state.presenceTarget > state.presence ? 0.18 : 0.4;\r
        state.presence += (state.presenceTarget - state.presence) * (1 - Math.exp(-dt / tau));\r
        moving =\r
          Math.abs(state.target - state.pos) > 0.05 ||\r
          Math.abs(state.velocity) > 0.05 ||\r
          Math.abs(state.presenceTarget - state.presence) > 0.002;\r
        if (!moving) state.presence = state.presenceTarget;\r
      }\r
      write();\r
      raf = moving ? requestAnimationFrame(frame) : 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const sweep = (sign: number) => {\r
      if (reduced || !geometry.reach) return;\r
      const end = sign * geometry.reach;\r
      const from = state.sweep || Math.abs(state.pos) < geometry.reach ? state.pos : -end;\r
      if (from === end) return;\r
      const share = Math.abs(end - from) / (2 * geometry.reach);\r
      state.sweep = {\r
        from,\r
        to: end,\r
        start: performance.now(),\r
        duration: Math.max(120, settingsRef.current.transitionDuration * share)\r
      };\r
      wake();\r
    };\r
\r
    const along = (event: PointerEvent) => {\r
      const rect = root.getBoundingClientRect();\r
      const dx = event.clientX - (rect.left + rect.width / 2);\r
      const dy = event.clientY - (rect.top + rect.height / 2);\r
      return dx * geometry.ux + dy * geometry.uy;\r
    };\r
\r
    const follow = (event: PointerEvent) => {\r
      state.target = Math.max(-geometry.reach, Math.min(geometry.reach, along(event)));\r
      wake();\r
    };\r
\r
    const onEnter = (event: PointerEvent) => {\r
      if (mode === 'hover') sweep(along(event) > 0 ? -1 : 1);\r
      if (mode === 'follow') {\r
        if (state.presence < 0.02) {\r
          state.pos = Math.max(-geometry.reach, Math.min(geometry.reach, along(event)));\r
          state.velocity = 0;\r
        }\r
        state.presenceTarget = reduced ? 0 : 1;\r
        follow(event);\r
      }\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      if (mode === 'follow') follow(event);\r
    };\r
\r
    const onLeave = (event: PointerEvent) => {\r
      if (mode === 'hover' && !settingsRef.current.playOnce) sweep(along(event) > 0 ? 1 : -1);\r
      if (mode === 'follow') {\r
        state.presenceTarget = 0;\r
        wake();\r
      }\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      if (mode === 'click') sweep(along(event) > 0 ? -1 : 1);\r
    };\r
\r
    const onFocus = (event: FocusEvent) => {\r
      if (mode !== 'follow' && (event.target as Element | null)?.matches?.(':focus-visible')) sweep(1);\r
    };\r
\r
    const schedule = () => {\r
      window.clearTimeout(timer);\r
      if (mode !== 'loop' || reduced) return;\r
      timer = window.setTimeout(\r
        () => {\r
          if (state.visible && !document.hidden) sweep(1);\r
          schedule();\r
        },\r
        Math.max(0.5, settingsRef.current.interval) * 1000\r
      );\r
    };\r
\r
    root.addEventListener('pointerenter', onEnter);\r
    root.addEventListener('pointermove', onMove);\r
    root.addEventListener('pointerleave', onLeave);\r
    root.addEventListener('pointerdown', onDown);\r
    root.addEventListener('focusin', onFocus);\r
\r
    const resizeObserver = new ResizeObserver(measure);\r
    resizeObserver.observe(root);\r
\r
    const visibilityObserver = new IntersectionObserver(\r
      ([entry]) => {\r
        state.visible = entry.isIntersecting;\r
        if (entry.isIntersecting && settingsRef.current.intro && !introRef.current) {\r
          introRef.current = true;\r
          sweep(1);\r
        }\r
      },\r
      { threshold: 0.4 }\r
    );\r
    visibilityObserver.observe(root);\r
\r
    state.presence = mode === 'follow' ? 0 : 1;\r
    state.presenceTarget = state.presence;\r
    state.pos = -1e4;\r
    measure();\r
    schedule();\r
    engineRef.current = { measure };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(timer);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      root.removeEventListener('pointerenter', onEnter);\r
      root.removeEventListener('pointermove', onMove);\r
      root.removeEventListener('pointerleave', onLeave);\r
      root.removeEventListener('pointerdown', onDown);\r
      root.removeEventListener('focusin', onFocus);\r
      engineRef.current = null;\r
    };\r
  }, [mode]);\r
\r
  useEffect(() => {\r
    engineRef.current?.measure();\r
  }, [glareAngle, glareSize, rimGlint]);\r
\r
  const glare = gradient(glareColor, glareOpacity, variant, softness);\r
  const rim = gradient(glareColor, Math.min(1, glareOpacity * 1.8), variant, softness);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`glare-hover \${className}\`.trim()}\r
      style={\r
        {\r
          '--gh-width': width,\r
          '--gh-height': height,\r
          '--gh-bg': background,\r
          '--gh-br': borderRadius,\r
          '--gh-border': borderColor,\r
          '--gh-glare': glare,\r
          '--gh-rim': rim,\r
          '--gh-blend': blendMode,\r
          ...style\r
        } as CSSProperties\r
      }\r
    >\r
      {children}\r
      <span ref={glareRef} className="glare-hover__glare" aria-hidden="true">\r
        <span ref={bandRef} className="glare-hover__band" />\r
        {rimGlint && (\r
          <span className="glare-hover__rim">\r
            <span ref={rimRef} className="glare-hover__band glare-hover__band--rim" />\r
          </span>\r
        )}\r
      </span>\r
    </div>\r
  );\r
};\r
\r
export default GlareHover;\r
`,s=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';\r
\r
type Variant = 'streak' | 'twin' | 'sheen';\r
type Mode = 'hover' | 'follow' | 'loop' | 'click';\r
\r
interface GlareHoverProps {\r
  width?: string;\r
  height?: string;\r
  background?: string;\r
  borderRadius?: string;\r
  borderColor?: string;\r
  children?: ReactNode;\r
  glareColor?: string;\r
  glareOpacity?: number;\r
  glareAngle?: number;\r
  glareSize?: number;\r
  softness?: number;\r
  variant?: Variant;\r
  blendMode?: CSSProperties['mixBlendMode'];\r
  rimGlint?: boolean;\r
  mode?: Mode;\r
  transitionDuration?: number;\r
  interval?: number;\r
  playOnce?: boolean;\r
  intro?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Sweep {\r
  from: number;\r
  to: number;\r
  start: number;\r
  duration: number;\r
}\r
\r
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const bump = (t: number, center: number, half: number) => {\r
  const distance = Math.abs(t - center);\r
  return distance >= half ? 0 : smootherstep(1 - distance / half);\r
};\r
\r
const PROFILES: Record<Variant, (t: number, softness: number) => number> = {\r
  streak: (t: number, softness: number) => bump(t, 0.5, 0.06 + 0.16 * softness) + 0.32 * bump(t, 0.5, 0.5),\r
  twin: (t: number, softness: number) =>\r
    bump(t, 0.36, 0.08 + 0.18 * softness) + 0.85 * bump(t, 0.7, 0.03 + 0.06 * softness) + 0.26 * bump(t, 0.5, 0.5),\r
  sheen: (t: number, softness: number) => 0.55 * bump(t, 0.5, 0.25 + 0.25 * softness) + 0.3 * bump(t, 0.5, 0.5)\r
};\r
\r
const gradient = (color: string, opacity: number, variant: Variant, softness: number) => {\r
  const profile = PROFILES[variant] ?? PROFILES.streak;\r
  const stops = Array.from({ length: 33 }, (_, index) => {\r
    const t = index / 32;\r
    const alpha = Math.round(Math.min(1, profile(t, softness) * opacity) * 1000) / 10;\r
    return \`color-mix(in srgb, \${color} \${alpha}%, transparent) \${(t * 100).toFixed(1)}%\`;\r
  });\r
  return \`linear-gradient(90deg, \${stops.join(', ')})\`;\r
};\r
\r
const RIM_MASK: CSSProperties = {\r
  WebkitMaskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',\r
  WebkitMaskClip: 'content-box, border-box',\r
  WebkitMaskComposite: 'xor',\r
  maskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',\r
  maskClip: 'content-box, border-box',\r
  maskComposite: 'exclude'\r
};\r
\r
const ROOT = 'relative isolate inline-grid place-items-center overflow-hidden border border-solid align-top';\r
const GLARE = 'pointer-events-none absolute inset-0 z-[2] rounded-[inherit] opacity-0';\r
const BAND = 'absolute left-1/2 top-1/2 will-change-transform';\r
const RIM = 'absolute inset-0 rounded-[inherit] p-px';\r
\r
const ease = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;\r
\r
const GlareHover = ({\r
  width = 'auto',\r
  height = 'auto',\r
  background = 'transparent',\r
  borderRadius = '10px',\r
  borderColor = 'transparent',\r
  children,\r
  glareColor = '#ffffff',\r
  glareOpacity = 0.5,\r
  glareAngle = -45,\r
  glareSize = 30,\r
  softness = 0.6,\r
  variant = 'streak',\r
  blendMode = 'screen',\r
  rimGlint = true,\r
  mode = 'hover',\r
  transitionDuration = 650,\r
  interval = 3,\r
  playOnce = false,\r
  intro = false,\r
  className = '',\r
  style = {}\r
}: GlareHoverProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const glareRef = useRef<HTMLSpanElement>(null);\r
  const bandRef = useRef<HTMLSpanElement>(null);\r
  const rimRef = useRef<HTMLSpanElement>(null);\r
  const engineRef = useRef<{ measure: () => void } | null>(null);\r
  const introRef = useRef(false);\r
  const settings = { glareAngle, glareSize, transitionDuration, interval, playOnce, intro };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const glare = glareRef.current;\r
    if (!root || !glare) return;\r
\r
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const geometry = { band: 0, reach: 0, ux: 0, uy: -1, angle: 0 };\r
    const state = {\r
      pos: 0,\r
      velocity: 0,\r
      target: 0,\r
      presence: 0,\r
      presenceTarget: 0,\r
      sweep: null as Sweep | null,\r
      visible: true\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let timer = 0;\r
\r
    const bands = () => [bandRef.current, rimRef.current].filter((band): band is HTMLSpanElement => Boolean(band));\r
\r
    const write = () => {\r
      const transform = \`translate(-50%, -50%) rotate(\${geometry.angle - 90}deg) translateX(\${state.pos.toFixed(2)}px)\`;\r
      for (const band of bands()) band.style.transform = transform;\r
      glare.style.opacity = state.presence.toFixed(3);\r
    };\r
\r
    const measure = () => {\r
      const { glareAngle: angle, glareSize: size } = settingsRef.current;\r
      const width = root.clientWidth;\r
      const height = root.clientHeight;\r
      const radians = (angle * Math.PI) / 180;\r
      const ux = Math.sin(radians);\r
      const uy = -Math.cos(radians);\r
      const diagonal = Math.hypot(width, height);\r
      const band = Math.max(8, (diagonal * size) / 100);\r
      const reach = (Math.abs(width * ux) + Math.abs(height * uy)) / 2 + band / 2 + 2;\r
      const resting = !state.sweep && mode !== 'follow';\r
      Object.assign(geometry, { band, reach, ux, uy, angle });\r
      for (const element of bands()) {\r
        element.style.width = \`\${band}px\`;\r
        element.style.height = \`\${diagonal + band}px\`;\r
      }\r
      if (resting) state.pos = state.pos > 0 ? reach : -reach;\r
      write();\r
    };\r
\r
    const frame = (now: number) => {\r
      const dt = Math.min(0.05, (now - last) / 1000 || 0);\r
      last = now;\r
      let moving = false;\r
      if (state.sweep) {\r
        const sweep = state.sweep;\r
        const t = Math.min(1, (now - sweep.start) / sweep.duration);\r
        state.pos = sweep.from + (sweep.to - sweep.from) * ease(t);\r
        if (t < 1) moving = true;\r
        else state.sweep = null;\r
      } else if (mode === 'follow') {\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
        const h = dt / steps;\r
        for (let i = 0; i < steps; i++) {\r
          state.velocity += (170 * (state.target - state.pos) - 24 * state.velocity) * h;\r
          state.pos += state.velocity * h;\r
        }\r
        const tau = state.presenceTarget > state.presence ? 0.18 : 0.4;\r
        state.presence += (state.presenceTarget - state.presence) * (1 - Math.exp(-dt / tau));\r
        moving =\r
          Math.abs(state.target - state.pos) > 0.05 ||\r
          Math.abs(state.velocity) > 0.05 ||\r
          Math.abs(state.presenceTarget - state.presence) > 0.002;\r
        if (!moving) state.presence = state.presenceTarget;\r
      }\r
      write();\r
      raf = moving ? requestAnimationFrame(frame) : 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const sweep = (sign: number) => {\r
      if (reduced || !geometry.reach) return;\r
      const end = sign * geometry.reach;\r
      const from = state.sweep || Math.abs(state.pos) < geometry.reach ? state.pos : -end;\r
      if (from === end) return;\r
      const share = Math.abs(end - from) / (2 * geometry.reach);\r
      state.sweep = {\r
        from,\r
        to: end,\r
        start: performance.now(),\r
        duration: Math.max(120, settingsRef.current.transitionDuration * share)\r
      };\r
      wake();\r
    };\r
\r
    const along = (event: PointerEvent) => {\r
      const rect = root.getBoundingClientRect();\r
      const dx = event.clientX - (rect.left + rect.width / 2);\r
      const dy = event.clientY - (rect.top + rect.height / 2);\r
      return dx * geometry.ux + dy * geometry.uy;\r
    };\r
\r
    const follow = (event: PointerEvent) => {\r
      state.target = Math.max(-geometry.reach, Math.min(geometry.reach, along(event)));\r
      wake();\r
    };\r
\r
    const onEnter = (event: PointerEvent) => {\r
      if (mode === 'hover') sweep(along(event) > 0 ? -1 : 1);\r
      if (mode === 'follow') {\r
        if (state.presence < 0.02) {\r
          state.pos = Math.max(-geometry.reach, Math.min(geometry.reach, along(event)));\r
          state.velocity = 0;\r
        }\r
        state.presenceTarget = reduced ? 0 : 1;\r
        follow(event);\r
      }\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      if (mode === 'follow') follow(event);\r
    };\r
\r
    const onLeave = (event: PointerEvent) => {\r
      if (mode === 'hover' && !settingsRef.current.playOnce) sweep(along(event) > 0 ? 1 : -1);\r
      if (mode === 'follow') {\r
        state.presenceTarget = 0;\r
        wake();\r
      }\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      if (mode === 'click') sweep(along(event) > 0 ? -1 : 1);\r
    };\r
\r
    const onFocus = (event: FocusEvent) => {\r
      if (mode !== 'follow' && (event.target as Element | null)?.matches?.(':focus-visible')) sweep(1);\r
    };\r
\r
    const schedule = () => {\r
      window.clearTimeout(timer);\r
      if (mode !== 'loop' || reduced) return;\r
      timer = window.setTimeout(\r
        () => {\r
          if (state.visible && !document.hidden) sweep(1);\r
          schedule();\r
        },\r
        Math.max(0.5, settingsRef.current.interval) * 1000\r
      );\r
    };\r
\r
    root.addEventListener('pointerenter', onEnter);\r
    root.addEventListener('pointermove', onMove);\r
    root.addEventListener('pointerleave', onLeave);\r
    root.addEventListener('pointerdown', onDown);\r
    root.addEventListener('focusin', onFocus);\r
\r
    const resizeObserver = new ResizeObserver(measure);\r
    resizeObserver.observe(root);\r
\r
    const visibilityObserver = new IntersectionObserver(\r
      ([entry]) => {\r
        state.visible = entry.isIntersecting;\r
        if (entry.isIntersecting && settingsRef.current.intro && !introRef.current) {\r
          introRef.current = true;\r
          sweep(1);\r
        }\r
      },\r
      { threshold: 0.4 }\r
    );\r
    visibilityObserver.observe(root);\r
\r
    state.presence = mode === 'follow' ? 0 : 1;\r
    state.presenceTarget = state.presence;\r
    state.pos = -1e4;\r
    measure();\r
    schedule();\r
    engineRef.current = { measure };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      window.clearTimeout(timer);\r
      resizeObserver.disconnect();\r
      visibilityObserver.disconnect();\r
      root.removeEventListener('pointerenter', onEnter);\r
      root.removeEventListener('pointermove', onMove);\r
      root.removeEventListener('pointerleave', onLeave);\r
      root.removeEventListener('pointerdown', onDown);\r
      root.removeEventListener('focusin', onFocus);\r
      engineRef.current = null;\r
    };\r
  }, [mode]);\r
\r
  useEffect(() => {\r
    engineRef.current?.measure();\r
  }, [glareAngle, glareSize, rimGlint]);\r
\r
  const glare = gradient(glareColor, glareOpacity, variant, softness);\r
  const rim = gradient(glareColor, Math.min(1, glareOpacity * 1.8), variant, softness);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`\${ROOT} \${className}\`.trim()}\r
      style={{\r
        width,\r
        height,\r
        background,\r
        borderRadius,\r
        borderColor,\r
        ...style\r
      }}\r
    >\r
      {children}\r
      <span ref={glareRef} className={GLARE} style={{ mixBlendMode: blendMode }} aria-hidden="true">\r
        <span ref={bandRef} className={BAND} style={{ background: glare }} />\r
        {rimGlint && (\r
          <span className={RIM} style={RIM_MASK}>\r
            <span ref={rimRef} className={BAND} style={{ background: rim }} />\r
          </span>\r
        )}\r
      </span>\r
    </div>\r
  );\r
};\r
\r
export default GlareHover;\r
`,o={usage:`import GlareHover from './GlareHover';

<GlareHover
  width="360px"
  height="240px"
  borderRadius="20px"
  mode="hover"
  variant="streak"
  glareColor="#ffffff"
  glareOpacity={0.5}
  glareSize={30}
  softness={0.6}
  glareAngle={-45}
  blendMode="screen"
  rimGlint={true}
  transitionDuration={650}
>
  <img src="/photo.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
</GlareHover>`,code:e,css:n,tailwind:r,tsCode:t,tsTailwind:s};export{o as glareHover};
