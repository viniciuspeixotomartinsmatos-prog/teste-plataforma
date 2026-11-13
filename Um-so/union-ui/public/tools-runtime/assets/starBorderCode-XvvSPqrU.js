const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './StarBorder.css';\r
\r
const THEMES = {\r
  dark: {\r
    surface: '#0c0c0f',\r
    text: '#fafafa',\r
    track: 'rgba(255, 255, 255, 0.1)',\r
    light: '#ffffff'\r
  },\r
  light: {\r
    surface: '#ffffff',\r
    text: '#18181b',\r
    track: 'rgba(24, 24, 27, 0.12)',\r
    light: '#18181b'\r
  }\r
};\r
\r
const HOVERS = ['lap', 'brighten', 'reveal', 'none'];\r
const BLEED = 48;\r
const LAP = 0.9;\r
const TAU = Math.PI * 2;\r
const WHITE = [255, 255, 255];\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const wrap = (value, total) => ((value % total) + total) % total;\r
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - (2 - 2 * t) ** 3 / 2);\r
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];\r
const rgba = (rgb, alpha) =>\r
  \`rgba(\${Math.round(rgb[0])}, \${Math.round(rgb[1])}, \${Math.round(rgb[2])}, \${clamp(alpha, 0, 1).toFixed(3)})\`;\r
\r
let colorContext = null;\r
\r
const toRgb = color => {\r
  colorContext = colorContext ?? document.createElement('canvas').getContext('2d');\r
  if (!colorContext) return WHITE;\r
  colorContext.fillStyle = '#000000';\r
  colorContext.fillStyle = color;\r
  const value = String(colorContext.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? WHITE;\r
  return [parts[0], parts[1], parts[2]];\r
};\r
\r
const outline = (width, height, radius) => {\r
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));\r
  const arc = (Math.PI * r) / 2;\r
  const across = Math.max(0, width - 2 * r);\r
  const down = Math.max(0, height - 2 * r);\r
  const segments = [\r
    { length: across, x: r, y: 0, dx: 1, dy: 0, angle: null },\r
    { length: arc, x: width - r, y: r, dx: 0, dy: 0, angle: -Math.PI / 2 },\r
    { length: down, x: width, y: r, dx: 0, dy: 1, angle: null },\r
    { length: arc, x: width - r, y: height - r, dx: 0, dy: 0, angle: 0 },\r
    { length: across, x: width - r, y: height, dx: -1, dy: 0, angle: null },\r
    { length: arc, x: r, y: height - r, dx: 0, dy: 0, angle: Math.PI / 2 },\r
    { length: down, x: 0, y: height - r, dx: 0, dy: -1, angle: null },\r
    { length: arc, x: r, y: r, dx: 0, dy: 0, angle: Math.PI }\r
  ];\r
  return {\r
    r,\r
    segments,\r
    total: Math.max(\r
      1,\r
      segments.reduce((sum, segment) => sum + segment.length, 0)\r
    )\r
  };\r
};\r
\r
const pointAt = (shape, distance, point) => {\r
  let s = wrap(distance, shape.total);\r
  for (const segment of shape.segments) {\r
    if (segment.length > 0 && s <= segment.length) {\r
      if (segment.angle === null) {\r
        point.x = segment.x + segment.dx * s;\r
        point.y = segment.y + segment.dy * s;\r
        point.nx = segment.dy;\r
        point.ny = -segment.dx;\r
      } else {\r
        const angle = segment.angle + s / shape.r;\r
        point.nx = Math.cos(angle);\r
        point.ny = Math.sin(angle);\r
        point.x = segment.x + point.nx * shape.r;\r
        point.y = segment.y + point.ny * shape.r;\r
      }\r
      return point;\r
    }\r
    s -= segment.length;\r
  }\r
  return point;\r
};\r
\r
const project = (shape, px, py) => {\r
  let best = Infinity;\r
  let found = 0;\r
  let offset = 0;\r
  shape.segments.forEach(segment => {\r
    if (segment.length > 0) {\r
      let s = 0;\r
      let x = 0;\r
      let y = 0;\r
      if (segment.angle === null) {\r
        s = clamp((px - segment.x) * segment.dx + (py - segment.y) * segment.dy, 0, segment.length);\r
        x = segment.x + segment.dx * s;\r
        y = segment.y + segment.dy * s;\r
      } else {\r
        let angle = wrap(Math.atan2(py - segment.y, px - segment.x) - segment.angle, TAU);\r
        if (angle > Math.PI / 2) angle = angle > Math.PI * 1.25 ? 0 : Math.PI / 2;\r
        s = angle * shape.r;\r
        x = segment.x + Math.cos(segment.angle + angle) * shape.r;\r
        y = segment.y + Math.sin(segment.angle + angle) * shape.r;\r
      }\r
      const distance = (px - x) ** 2 + (py - y) ** 2;\r
      if (distance < best) {\r
        best = distance;\r
        found = offset + s;\r
      }\r
    }\r
    offset += segment.length;\r
  });\r
  return found;\r
};\r
\r
const StarBorder = ({\r
  as: Component = 'button',\r
  children,\r
  className = '',\r
  style,\r
  color,\r
  trailColor,\r
  duration = 4,\r
  thickness = 1,\r
  radius = 12,\r
  trailLength = 0.3,\r
  stars = 1,\r
  glow = 0.6,\r
  sparkle = false,\r
  direction = 'clockwise',\r
  hover = 'lap',\r
  clickPulse = true,\r
  theme = 'dark',\r
  backgroundColor,\r
  textColor,\r
  borderColor,\r
  ...rest\r
}) => {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const light = color ?? palette.light;\r
  const settings = {\r
    light: theme === 'light',\r
    color: light,\r
    trailColor: trailColor ?? light,\r
    duration: Math.max(0.3, duration),\r
    thickness: Math.max(0.5, thickness),\r
    radius: Math.max(0, radius),\r
    trailLength: clamp(trailLength, 0, 1),\r
    stars: clamp(Math.round(stars), 1, 6),\r
    glow: clamp(glow, 0, 1),\r
    sparkle,\r
    direction: direction === 'counterclockwise' ? -1 : 1,\r
    hover: HOVERS.includes(hover) ? hover : 'lap',\r
    clickPulse\r
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
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const point = { x: 0, y: 0, nx: 0, ny: -1 };\r
    const state = {\r
      width: 0,\r
      height: 0,\r
      dpr: 1,\r
      phase: 0,\r
      velocity: 0,\r
      motion: 0,\r
      lap: -1,\r
      time: 0,\r
      reveal: 0,\r
      boost: 0,\r
      flash: 0,\r
      emit: 0,\r
      hovered: false,\r
      focused: false,\r
      pointerX: 0,\r
      pointerY: 0,\r
      visible: true\r
    };\r
    const pulses = [];\r
    const dust = [];\r
    const colors = { key: '', head: WHITE, tail: WHITE };\r
    let raf = 0;\r
    let last = performance.now();\r
    let alive = true;\r
\r
    const measure = () => {\r
      state.width = root.offsetWidth;\r
      state.height = root.offsetHeight;\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round((state.width + BLEED * 2) * state.dpr));\r
      canvas.height = Math.max(1, Math.round((state.height + BLEED * 2) * state.dpr));\r
      wake();\r
    };\r
\r
    const local = event => {\r
      const rect = root.getBoundingClientRect();\r
      const scaleX = rect.width ? state.width / rect.width : 1;\r
      const scaleY = rect.height ? state.height / rect.height : 1;\r
      return [(event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY];\r
    };\r
\r
    const shapeFor = s =>\r
      outline(\r
        Math.max(1, state.width - s.thickness),\r
        Math.max(1, state.height - s.thickness),\r
        s.radius - s.thickness / 2\r
      );\r
\r
    const stroke = (x1, y1, x2, y2, width, style) => {\r
      ctx.lineWidth = width;\r
      ctx.strokeStyle = style;\r
      ctx.beginPath();\r
      ctx.moveTo(x1, y1);\r
      ctx.lineTo(x2, y2);\r
      ctx.stroke();\r
    };\r
\r
    const drawTrail = (s, shape, head, length, sign, intensity, tip = true) => {\r
      if (length < 0.5 || intensity <= 0) return;\r
      const steps = clamp(Math.ceil(length / 2), 2, 90);\r
      pointAt(shape, head, point);\r
      let px = point.x;\r
      let py = point.y;\r
      for (let i = 1; i <= steps; i++) {\r
        pointAt(shape, head - sign * length * (i / steps), point);\r
        const u = 1 - (i - 0.5) / steps;\r
        const fade = u * u * intensity;\r
        let tone = mix(colors.tail, colors.head, u);\r
        if (!s.light) tone = mix(tone, WHITE, u ** 6 * 0.65);\r
        ctx.lineCap = tip && i === 1 ? 'round' : 'butt';\r
        stroke(px, py, point.x, point.y, 2 + 6 * s.glow, rgba(tone, fade * (s.light ? 0.1 : 0.2) * s.glow));\r
        stroke(px, py, point.x, point.y, s.thickness, rgba(tone, fade));\r
        px = point.x;\r
        py = point.y;\r
      }\r
    };\r
\r
    const drawHead = (s, x, y, intensity, twinkle) => {\r
      if (intensity <= 0) return;\r
      const tone = colors.head;\r
      const reach = (12 + 40 * s.glow) * (s.light ? 0.6 : 1);\r
      const bloom = ctx.createRadialGradient(x, y, 0, x, y, reach);\r
      const strength = (s.light ? 0.08 : 0.4) * s.glow * intensity;\r
      bloom.addColorStop(0, rgba(tone, strength));\r
      bloom.addColorStop(0.2, rgba(tone, strength * 0.4));\r
      bloom.addColorStop(0.5, rgba(tone, strength * 0.1));\r
      bloom.addColorStop(1, rgba(tone, 0));\r
      ctx.fillStyle = bloom;\r
      ctx.fillRect(x - reach, y - reach, reach * 2, reach * 2);\r
      if (!s.sparkle) return;\r
\r
      const size = (1 + s.thickness * 0.6) * (s.light ? 0.85 : 1);\r
      const core = ctx.createRadialGradient(x, y, 0, x, y, size * 2.2);\r
      core.addColorStop(0, rgba(s.light ? tone : WHITE, intensity));\r
      core.addColorStop(s.light ? 0.3 : 0.4, rgba(s.light ? tone : mix(tone, WHITE, 0.5), intensity * 0.9));\r
      core.addColorStop(s.light ? 0.55 : 1, rgba(tone, s.light ? intensity * 0.12 : 0));\r
      core.addColorStop(1, rgba(tone, 0));\r
      ctx.fillStyle = core;\r
      ctx.beginPath();\r
      ctx.arc(x, y, size * 2.2, 0, TAU);\r
      ctx.fill();\r
\r
      const spike = (3 + 4 * s.glow + s.thickness * 1.5) * twinkle;\r
      const center = s.light ? tone : WHITE;\r
      const horizontal = ctx.createLinearGradient(x - spike, y, x + spike, y);\r
      horizontal.addColorStop(0, rgba(tone, 0));\r
      horizontal.addColorStop(0.5, rgba(center, intensity * 0.95));\r
      horizontal.addColorStop(1, rgba(tone, 0));\r
      stroke(x - spike, y, x + spike, y, s.light ? 0.75 : 1, horizontal);\r
      const vertical = ctx.createLinearGradient(x, y - spike, x, y + spike);\r
      vertical.addColorStop(0, rgba(tone, 0));\r
      vertical.addColorStop(0.5, rgba(center, intensity * 0.95));\r
      vertical.addColorStop(1, rgba(tone, 0));\r
      stroke(x, y - spike, x, y + spike, s.light ? 0.75 : 1, vertical);\r
    };\r
\r
    const spawnDust = (x, y, nx, ny, speed) => {\r
      if (dust.length > 48) return;\r
      const push = 3 + Math.random() * 10;\r
      const drift = (Math.random() - 0.5) * 8;\r
      dust.push({\r
        x: x + nx * (Math.random() * 3 - 1),\r
        y: y + ny * (Math.random() * 3 - 1),\r
        vx: nx * push - ny * drift - speed * -ny * 0.04,\r
        vy: ny * push + nx * drift - speed * nx * 0.04,\r
        age: 0,\r
        life: 0.35 + Math.random() * 0.5,\r
        size: 0.45 + Math.random() * 0.7,\r
        seed: Math.random() * TAU\r
      });\r
    };\r
\r
    const draw = (base, shape) => {\r
      const s = state.boost > 0.001 ? { ...base, glow: Math.min(1.5, base.glow + 0.4 * state.boost) } : base;\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      if (state.width < 2 || state.height < 2) return;\r
      const offset = (BLEED + s.thickness / 2) * state.dpr;\r
      ctx.setTransform(state.dpr, 0, 0, state.dpr, offset, offset);\r
      ctx.globalCompositeOperation = s.light ? 'source-over' : 'lighter';\r
      ctx.lineCap = 'butt';\r
\r
      const total = shape.total;\r
      const spacing = total / s.stars;\r
      const speed = Math.abs(state.motion);\r
      const sign = state.motion >= 0 ? 1 : -1;\r
      const span = s.trailLength * s.duration;\r
      const length = Math.min(speed * span, spacing * 0.92, total * 0.6);\r
      const intensity = state.reveal * (1 + 0.4 * state.boost + 0.6 * state.flash);\r
\r
      const ring = state.flash * (s.light ? 0.18 : 0.32) + state.boost * state.reveal * (s.light ? 0.07 : 0.12);\r
      if (ring > 0.005) {\r
        ctx.lineWidth = s.thickness + 2 * s.glow;\r
        ctx.strokeStyle = rgba(colors.head, ring);\r
        ctx.beginPath();\r
        ctx.roundRect(\r
          0,\r
          0,\r
          Math.max(1, state.width - s.thickness),\r
          Math.max(1, state.height - s.thickness),\r
          Math.max(0, shape.r)\r
        );\r
        ctx.stroke();\r
      }\r
\r
      const still = clamp(1 - speed / Math.max(1, (total / s.duration) * 0.6), 0, 1) * Math.min(1, intensity);\r
      const rest = (10 + 14 * s.glow + s.thickness * 2) * still;\r
      for (let i = 0; i < s.stars; i++) {\r
        const head = state.phase + i * spacing;\r
        drawTrail(s, shape, head, length, sign, Math.min(1, intensity));\r
        if (still > 0.01) {\r
          drawTrail(s, shape, head, rest, 1, still, false);\r
          drawTrail(s, shape, head, rest, -1, still, false);\r
        }\r
      }\r
\r
      pulses.forEach(pulse => {\r
        const progress = pulse.age / 0.65;\r
        const fade = (1 - progress) ** 2;\r
        const travel = (total / 2) * (1 - (1 - Math.min(1, pulse.age / 0.5)) ** 2);\r
        const tail = Math.min(travel, total * 0.16);\r
        [1, -1].forEach(way => {\r
          const front = pulse.origin + way * travel;\r
          drawTrail(s, shape, front, tail, way, fade);\r
          pointAt(shape, front, point);\r
          drawHead(s, point.x, point.y, fade * 0.8, 0.8);\r
        });\r
      });\r
\r
      for (let i = 0; i < s.stars; i++) {\r
        pointAt(shape, state.phase + i * spacing, point);\r
        const twinkle = 0.82 + 0.18 * Math.sin(state.time * 6.1 + i * 2.3) * Math.sin(state.time * 2.7 + i);\r
        drawHead(s, point.x, point.y, Math.min(1.3, intensity), twinkle);\r
      }\r
\r
      dust.forEach(mote => {\r
        const left = 1 - mote.age / mote.life;\r
        const shimmer = 0.45 + 0.55 * Math.sin(state.time * 20 + mote.seed);\r
        const alpha = left * shimmer * state.reveal * (s.light ? 0.35 : 0.9);\r
        if (alpha <= 0.01) return;\r
        ctx.fillStyle = rgba(s.light ? colors.head : mix(colors.tail, WHITE, 0.6), alpha);\r
        ctx.beginPath();\r
        ctx.arc(mote.x, mote.y, mote.size * (0.6 + 0.4 * left), 0, TAU);\r
        ctx.fill();\r
      });\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      state.time += dt;\r
\r
      const key = \`\${s.color}|\${s.trailColor}\`;\r
      if (key !== colors.key) {\r
        colors.key = key;\r
        colors.head = toRgb(s.color);\r
        colors.tail = toRgb(s.trailColor);\r
      }\r
\r
      const shape = shapeFor(s);\r
      const total = shape.total;\r
      const spacing = total / s.stars;\r
      const engaged = state.hovered || state.focused;\r
      const cruise = reduce ? 0 : (s.direction * total) / s.duration;\r
\r
      const revealTarget = s.hover === 'reveal' && !engaged ? 0 : 1;\r
      state.reveal += (revealTarget - state.reveal) * (1 - Math.exp(-dt / (revealTarget > state.reveal ? 0.16 : 0.45)));\r
      const boostTarget = s.hover === 'brighten' && engaged ? 1 : 0;\r
      state.boost += (boostTarget - state.boost) * (1 - Math.exp(-dt / (boostTarget > state.boost ? 0.18 : 0.5)));\r
      state.flash *= Math.exp(-dt / 0.22);\r
\r
      state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / 0.45));\r
      let extra = 0;\r
      if (state.lap >= 0) {\r
        const before = ease(Math.min(1, state.lap / LAP));\r
        state.lap += dt;\r
        extra = (ease(Math.min(1, state.lap / LAP)) - before) * total * s.direction;\r
        if (state.lap >= LAP) state.lap = -1;\r
      }\r
      state.motion = state.velocity + extra / dt;\r
      state.phase = wrap(state.phase + state.velocity * dt + extra, total);\r
\r
      const pace = Math.abs(state.motion) / Math.max(1, Math.abs(total / s.duration));\r
      if (s.sparkle && !reduce && state.reveal > 0.05) {\r
        state.emit += dt * (2 + 6 * Math.min(2, pace)) * s.stars;\r
        while (state.emit > 1) {\r
          state.emit -= 1;\r
          pointAt(shape, state.phase + Math.floor(Math.random() * s.stars) * spacing, point);\r
          spawnDust(point.x, point.y, point.nx, point.ny, state.motion);\r
        }\r
      }\r
      for (let i = dust.length - 1; i >= 0; i--) {\r
        const mote = dust[i];\r
        mote.age += dt;\r
        mote.x += mote.vx * dt;\r
        mote.y += mote.vy * dt;\r
        mote.vx *= Math.exp(-dt * 2.2);\r
        mote.vy *= Math.exp(-dt * 2.2);\r
        if (mote.age >= mote.life) dust.splice(i, 1);\r
      }\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age >= 0.65) pulses.splice(i, 1);\r
      }\r
\r
      draw(s, shape);\r
\r
      const settling =\r
        Math.abs(revealTarget - state.reveal) > 0.002 ||\r
        Math.abs(boostTarget - state.boost) > 0.002 ||\r
        state.flash > 0.01 ||\r
        pulses.length > 0 ||\r
        dust.length > 0;\r
      const moving = Math.abs(state.motion) > 0.05 || cruise !== 0 || state.lap >= 0;\r
      const showing = state.reveal > 0.002 || revealTarget > 0;\r
      if (state.visible && (settling || (moving && showing) || state.hovered)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !state.visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const onEnter = event => {\r
      const s = settingsRef.current;\r
      [state.pointerX, state.pointerY] = local(event);\r
      state.hovered = true;\r
      if (s.hover === 'reveal' && state.reveal < 0.15) {\r
        state.phase = project(shapeFor(s), state.pointerX - s.thickness / 2, state.pointerY - s.thickness / 2);\r
        state.velocity = 0;\r
      }\r
      if (s.hover === 'lap' && state.lap < 0 && !reduce) state.lap = 0;\r
      wake();\r
    };\r
    const onLeave = () => {\r
      state.hovered = false;\r
      wake();\r
    };\r
    const pulse = origin => {\r
      if (!settingsRef.current.clickPulse) return;\r
      pulses.push({ origin, age: 0 });\r
      if (pulses.length > 4) pulses.shift();\r
      state.flash = 1;\r
      wake();\r
    };\r
    const onDown = event => {\r
      if (event.button !== 0 && event.pointerType === 'mouse') return;\r
      const s = settingsRef.current;\r
      const [x, y] = local(event);\r
      pulse(project(shapeFor(s), x - s.thickness / 2, y - s.thickness / 2));\r
    };\r
    const onClick = event => {\r
      if (event.detail === 0) pulse(state.phase);\r
    };\r
    const onFocus = () => {\r
      state.focused = root.matches(':focus-visible');\r
      if (state.focused && settingsRef.current.hover === 'lap' && state.lap < 0 && !reduce) state.lap = 0;\r
      wake();\r
    };\r
    const onBlur = () => {\r
      state.focused = false;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(measure);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(root);\r
    root.addEventListener('pointerenter', onEnter);\r
    root.addEventListener('pointerleave', onLeave);\r
    root.addEventListener('pointerdown', onDown);\r
    root.addEventListener('click', onClick);\r
    root.addEventListener('focus', onFocus);\r
    root.addEventListener('blur', onBlur);\r
    measure();\r
\r
    return () => {\r
      alive = false;\r
      wakeRef.current = null;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      root.removeEventListener('pointerenter', onEnter);\r
      root.removeEventListener('pointerleave', onLeave);\r
      root.removeEventListener('pointerdown', onDown);\r
      root.removeEventListener('click', onClick);\r
      root.removeEventListener('focus', onFocus);\r
      root.removeEventListener('blur', onBlur);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <Component\r
      ref={rootRef}\r
      className={\`star-border\${className ? \` \${className}\` : ''}\`}\r
      style={{\r
        '--star-border-radius': \`\${settings.radius}px\`,\r
        '--star-border-thickness': \`\${settings.thickness}px\`,\r
        '--star-border-surface': backgroundColor ?? palette.surface,\r
        '--star-border-text': textColor ?? palette.text,\r
        '--star-border-track': borderColor ?? palette.track,\r
        ...style\r
      }}\r
      {...(Component === 'button' && rest.type === undefined ? { type: 'button' } : null)}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="star-border__light" aria-hidden="true" />\r
      {children}\r
    </Component>\r
  );\r
};\r
\r
export default StarBorder;\r
`,t=`.star-border {\r
  position: relative;\r
  isolation: isolate;\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
  gap: 0.5rem;\r
  margin: 0;\r
  padding: 0.875rem 1.5rem;\r
  border: 0;\r
  border-radius: var(--star-border-radius);\r
  background: var(--star-border-surface);\r
  color: var(--star-border-text);\r
  font: inherit;\r
  font-weight: 500;\r
  line-height: 1.25;\r
  text-decoration: none;\r
  -webkit-tap-highlight-color: transparent;\r
}\r
\r
.star-border::before {\r
  content: '';\r
  position: absolute;\r
  inset: 0;\r
  z-index: -1;\r
  border-radius: inherit;\r
  box-shadow: inset 0 0 0 var(--star-border-thickness) var(--star-border-track);\r
  pointer-events: none;\r
}\r
\r
.star-border__light {\r
  position: absolute;\r
  top: -48px;\r
  left: -48px;\r
  z-index: -1;\r
  width: calc(100% + 96px);\r
  height: calc(100% + 96px);\r
  pointer-events: none;\r
}\r
\r
button.star-border,\r
a.star-border {\r
  cursor: pointer;\r
}\r
\r
.star-border:focus-visible {\r
  outline: 2px solid var(--star-border-track);\r
  outline-offset: 3px;\r
}\r
\r
.star-border:disabled {\r
  cursor: not-allowed;\r
  opacity: 0.5;\r
}\r
`,r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const ROOT =\r
  "relative isolate m-0 inline-flex items-center justify-center gap-2 rounded-[var(--star-border-radius)] border-0 px-6 py-3.5 font-medium leading-tight no-underline [background:var(--star-border-surface)] text-[color:var(--star-border-text)] [-webkit-tap-highlight-color:transparent] before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:shadow-[inset_0_0_0_var(--star-border-thickness)_var(--star-border-track)] before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--star-border-track)] disabled:cursor-not-allowed disabled:opacity-50";\r
\r
const LIGHT = 'pointer-events-none absolute top-[-48px] left-[-48px] -z-1 h-[calc(100%+96px)] w-[calc(100%+96px)]';\r
\r
const THEMES = {\r
  dark: {\r
    surface: '#0c0c0f',\r
    text: '#fafafa',\r
    track: 'rgba(255, 255, 255, 0.1)',\r
    light: '#ffffff'\r
  },\r
  light: {\r
    surface: '#ffffff',\r
    text: '#18181b',\r
    track: 'rgba(24, 24, 27, 0.12)',\r
    light: '#18181b'\r
  }\r
};\r
\r
const HOVERS = ['lap', 'brighten', 'reveal', 'none'];\r
const BLEED = 48;\r
const LAP = 0.9;\r
const TAU = Math.PI * 2;\r
const WHITE = [255, 255, 255];\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const wrap = (value, total) => ((value % total) + total) % total;\r
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - (2 - 2 * t) ** 3 / 2);\r
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];\r
const rgba = (rgb, alpha) =>\r
  \`rgba(\${Math.round(rgb[0])}, \${Math.round(rgb[1])}, \${Math.round(rgb[2])}, \${clamp(alpha, 0, 1).toFixed(3)})\`;\r
\r
let colorContext = null;\r
\r
const toRgb = color => {\r
  colorContext = colorContext ?? document.createElement('canvas').getContext('2d');\r
  if (!colorContext) return WHITE;\r
  colorContext.fillStyle = '#000000';\r
  colorContext.fillStyle = color;\r
  const value = String(colorContext.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? WHITE;\r
  return [parts[0], parts[1], parts[2]];\r
};\r
\r
const outline = (width, height, radius) => {\r
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));\r
  const arc = (Math.PI * r) / 2;\r
  const across = Math.max(0, width - 2 * r);\r
  const down = Math.max(0, height - 2 * r);\r
  const segments = [\r
    { length: across, x: r, y: 0, dx: 1, dy: 0, angle: null },\r
    { length: arc, x: width - r, y: r, dx: 0, dy: 0, angle: -Math.PI / 2 },\r
    { length: down, x: width, y: r, dx: 0, dy: 1, angle: null },\r
    { length: arc, x: width - r, y: height - r, dx: 0, dy: 0, angle: 0 },\r
    { length: across, x: width - r, y: height, dx: -1, dy: 0, angle: null },\r
    { length: arc, x: r, y: height - r, dx: 0, dy: 0, angle: Math.PI / 2 },\r
    { length: down, x: 0, y: height - r, dx: 0, dy: -1, angle: null },\r
    { length: arc, x: r, y: r, dx: 0, dy: 0, angle: Math.PI }\r
  ];\r
  return {\r
    r,\r
    segments,\r
    total: Math.max(\r
      1,\r
      segments.reduce((sum, segment) => sum + segment.length, 0)\r
    )\r
  };\r
};\r
\r
const pointAt = (shape, distance, point) => {\r
  let s = wrap(distance, shape.total);\r
  for (const segment of shape.segments) {\r
    if (segment.length > 0 && s <= segment.length) {\r
      if (segment.angle === null) {\r
        point.x = segment.x + segment.dx * s;\r
        point.y = segment.y + segment.dy * s;\r
        point.nx = segment.dy;\r
        point.ny = -segment.dx;\r
      } else {\r
        const angle = segment.angle + s / shape.r;\r
        point.nx = Math.cos(angle);\r
        point.ny = Math.sin(angle);\r
        point.x = segment.x + point.nx * shape.r;\r
        point.y = segment.y + point.ny * shape.r;\r
      }\r
      return point;\r
    }\r
    s -= segment.length;\r
  }\r
  return point;\r
};\r
\r
const project = (shape, px, py) => {\r
  let best = Infinity;\r
  let found = 0;\r
  let offset = 0;\r
  shape.segments.forEach(segment => {\r
    if (segment.length > 0) {\r
      let s = 0;\r
      let x = 0;\r
      let y = 0;\r
      if (segment.angle === null) {\r
        s = clamp((px - segment.x) * segment.dx + (py - segment.y) * segment.dy, 0, segment.length);\r
        x = segment.x + segment.dx * s;\r
        y = segment.y + segment.dy * s;\r
      } else {\r
        let angle = wrap(Math.atan2(py - segment.y, px - segment.x) - segment.angle, TAU);\r
        if (angle > Math.PI / 2) angle = angle > Math.PI * 1.25 ? 0 : Math.PI / 2;\r
        s = angle * shape.r;\r
        x = segment.x + Math.cos(segment.angle + angle) * shape.r;\r
        y = segment.y + Math.sin(segment.angle + angle) * shape.r;\r
      }\r
      const distance = (px - x) ** 2 + (py - y) ** 2;\r
      if (distance < best) {\r
        best = distance;\r
        found = offset + s;\r
      }\r
    }\r
    offset += segment.length;\r
  });\r
  return found;\r
};\r
\r
const StarBorder = ({\r
  as: Component = 'button',\r
  children,\r
  className = '',\r
  style,\r
  color,\r
  trailColor,\r
  duration = 4,\r
  thickness = 1,\r
  radius = 12,\r
  trailLength = 0.3,\r
  stars = 1,\r
  glow = 0.6,\r
  sparkle = false,\r
  direction = 'clockwise',\r
  hover = 'lap',\r
  clickPulse = true,\r
  theme = 'dark',\r
  backgroundColor,\r
  textColor,\r
  borderColor,\r
  ...rest\r
}) => {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const light = color ?? palette.light;\r
  const settings = {\r
    light: theme === 'light',\r
    color: light,\r
    trailColor: trailColor ?? light,\r
    duration: Math.max(0.3, duration),\r
    thickness: Math.max(0.5, thickness),\r
    radius: Math.max(0, radius),\r
    trailLength: clamp(trailLength, 0, 1),\r
    stars: clamp(Math.round(stars), 1, 6),\r
    glow: clamp(glow, 0, 1),\r
    sparkle,\r
    direction: direction === 'counterclockwise' ? -1 : 1,\r
    hover: HOVERS.includes(hover) ? hover : 'lap',\r
    clickPulse\r
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
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const point = { x: 0, y: 0, nx: 0, ny: -1 };\r
    const state = {\r
      width: 0,\r
      height: 0,\r
      dpr: 1,\r
      phase: 0,\r
      velocity: 0,\r
      motion: 0,\r
      lap: -1,\r
      time: 0,\r
      reveal: 0,\r
      boost: 0,\r
      flash: 0,\r
      emit: 0,\r
      hovered: false,\r
      focused: false,\r
      pointerX: 0,\r
      pointerY: 0,\r
      visible: true\r
    };\r
    const pulses = [];\r
    const dust = [];\r
    const colors = { key: '', head: WHITE, tail: WHITE };\r
    let raf = 0;\r
    let last = performance.now();\r
    let alive = true;\r
\r
    const measure = () => {\r
      state.width = root.offsetWidth;\r
      state.height = root.offsetHeight;\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round((state.width + BLEED * 2) * state.dpr));\r
      canvas.height = Math.max(1, Math.round((state.height + BLEED * 2) * state.dpr));\r
      wake();\r
    };\r
\r
    const local = event => {\r
      const rect = root.getBoundingClientRect();\r
      const scaleX = rect.width ? state.width / rect.width : 1;\r
      const scaleY = rect.height ? state.height / rect.height : 1;\r
      return [(event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY];\r
    };\r
\r
    const shapeFor = s =>\r
      outline(\r
        Math.max(1, state.width - s.thickness),\r
        Math.max(1, state.height - s.thickness),\r
        s.radius - s.thickness / 2\r
      );\r
\r
    const stroke = (x1, y1, x2, y2, width, style) => {\r
      ctx.lineWidth = width;\r
      ctx.strokeStyle = style;\r
      ctx.beginPath();\r
      ctx.moveTo(x1, y1);\r
      ctx.lineTo(x2, y2);\r
      ctx.stroke();\r
    };\r
\r
    const drawTrail = (s, shape, head, length, sign, intensity, tip = true) => {\r
      if (length < 0.5 || intensity <= 0) return;\r
      const steps = clamp(Math.ceil(length / 2), 2, 90);\r
      pointAt(shape, head, point);\r
      let px = point.x;\r
      let py = point.y;\r
      for (let i = 1; i <= steps; i++) {\r
        pointAt(shape, head - sign * length * (i / steps), point);\r
        const u = 1 - (i - 0.5) / steps;\r
        const fade = u * u * intensity;\r
        let tone = mix(colors.tail, colors.head, u);\r
        if (!s.light) tone = mix(tone, WHITE, u ** 6 * 0.65);\r
        ctx.lineCap = tip && i === 1 ? 'round' : 'butt';\r
        stroke(px, py, point.x, point.y, 2 + 6 * s.glow, rgba(tone, fade * (s.light ? 0.1 : 0.2) * s.glow));\r
        stroke(px, py, point.x, point.y, s.thickness, rgba(tone, fade));\r
        px = point.x;\r
        py = point.y;\r
      }\r
    };\r
\r
    const drawHead = (s, x, y, intensity, twinkle) => {\r
      if (intensity <= 0) return;\r
      const tone = colors.head;\r
      const reach = (12 + 40 * s.glow) * (s.light ? 0.6 : 1);\r
      const bloom = ctx.createRadialGradient(x, y, 0, x, y, reach);\r
      const strength = (s.light ? 0.08 : 0.4) * s.glow * intensity;\r
      bloom.addColorStop(0, rgba(tone, strength));\r
      bloom.addColorStop(0.2, rgba(tone, strength * 0.4));\r
      bloom.addColorStop(0.5, rgba(tone, strength * 0.1));\r
      bloom.addColorStop(1, rgba(tone, 0));\r
      ctx.fillStyle = bloom;\r
      ctx.fillRect(x - reach, y - reach, reach * 2, reach * 2);\r
      if (!s.sparkle) return;\r
\r
      const size = (1 + s.thickness * 0.6) * (s.light ? 0.85 : 1);\r
      const core = ctx.createRadialGradient(x, y, 0, x, y, size * 2.2);\r
      core.addColorStop(0, rgba(s.light ? tone : WHITE, intensity));\r
      core.addColorStop(s.light ? 0.3 : 0.4, rgba(s.light ? tone : mix(tone, WHITE, 0.5), intensity * 0.9));\r
      core.addColorStop(s.light ? 0.55 : 1, rgba(tone, s.light ? intensity * 0.12 : 0));\r
      core.addColorStop(1, rgba(tone, 0));\r
      ctx.fillStyle = core;\r
      ctx.beginPath();\r
      ctx.arc(x, y, size * 2.2, 0, TAU);\r
      ctx.fill();\r
\r
      const spike = (3 + 4 * s.glow + s.thickness * 1.5) * twinkle;\r
      const center = s.light ? tone : WHITE;\r
      const horizontal = ctx.createLinearGradient(x - spike, y, x + spike, y);\r
      horizontal.addColorStop(0, rgba(tone, 0));\r
      horizontal.addColorStop(0.5, rgba(center, intensity * 0.95));\r
      horizontal.addColorStop(1, rgba(tone, 0));\r
      stroke(x - spike, y, x + spike, y, s.light ? 0.75 : 1, horizontal);\r
      const vertical = ctx.createLinearGradient(x, y - spike, x, y + spike);\r
      vertical.addColorStop(0, rgba(tone, 0));\r
      vertical.addColorStop(0.5, rgba(center, intensity * 0.95));\r
      vertical.addColorStop(1, rgba(tone, 0));\r
      stroke(x, y - spike, x, y + spike, s.light ? 0.75 : 1, vertical);\r
    };\r
\r
    const spawnDust = (x, y, nx, ny, speed) => {\r
      if (dust.length > 48) return;\r
      const push = 3 + Math.random() * 10;\r
      const drift = (Math.random() - 0.5) * 8;\r
      dust.push({\r
        x: x + nx * (Math.random() * 3 - 1),\r
        y: y + ny * (Math.random() * 3 - 1),\r
        vx: nx * push - ny * drift - speed * -ny * 0.04,\r
        vy: ny * push + nx * drift - speed * nx * 0.04,\r
        age: 0,\r
        life: 0.35 + Math.random() * 0.5,\r
        size: 0.45 + Math.random() * 0.7,\r
        seed: Math.random() * TAU\r
      });\r
    };\r
\r
    const draw = (base, shape) => {\r
      const s = state.boost > 0.001 ? { ...base, glow: Math.min(1.5, base.glow + 0.4 * state.boost) } : base;\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      if (state.width < 2 || state.height < 2) return;\r
      const offset = (BLEED + s.thickness / 2) * state.dpr;\r
      ctx.setTransform(state.dpr, 0, 0, state.dpr, offset, offset);\r
      ctx.globalCompositeOperation = s.light ? 'source-over' : 'lighter';\r
      ctx.lineCap = 'butt';\r
\r
      const total = shape.total;\r
      const spacing = total / s.stars;\r
      const speed = Math.abs(state.motion);\r
      const sign = state.motion >= 0 ? 1 : -1;\r
      const span = s.trailLength * s.duration;\r
      const length = Math.min(speed * span, spacing * 0.92, total * 0.6);\r
      const intensity = state.reveal * (1 + 0.4 * state.boost + 0.6 * state.flash);\r
\r
      const ring = state.flash * (s.light ? 0.18 : 0.32) + state.boost * state.reveal * (s.light ? 0.07 : 0.12);\r
      if (ring > 0.005) {\r
        ctx.lineWidth = s.thickness + 2 * s.glow;\r
        ctx.strokeStyle = rgba(colors.head, ring);\r
        ctx.beginPath();\r
        ctx.roundRect(\r
          0,\r
          0,\r
          Math.max(1, state.width - s.thickness),\r
          Math.max(1, state.height - s.thickness),\r
          Math.max(0, shape.r)\r
        );\r
        ctx.stroke();\r
      }\r
\r
      const still = clamp(1 - speed / Math.max(1, (total / s.duration) * 0.6), 0, 1) * Math.min(1, intensity);\r
      const rest = (10 + 14 * s.glow + s.thickness * 2) * still;\r
      for (let i = 0; i < s.stars; i++) {\r
        const head = state.phase + i * spacing;\r
        drawTrail(s, shape, head, length, sign, Math.min(1, intensity));\r
        if (still > 0.01) {\r
          drawTrail(s, shape, head, rest, 1, still, false);\r
          drawTrail(s, shape, head, rest, -1, still, false);\r
        }\r
      }\r
\r
      pulses.forEach(pulse => {\r
        const progress = pulse.age / 0.65;\r
        const fade = (1 - progress) ** 2;\r
        const travel = (total / 2) * (1 - (1 - Math.min(1, pulse.age / 0.5)) ** 2);\r
        const tail = Math.min(travel, total * 0.16);\r
        [1, -1].forEach(way => {\r
          const front = pulse.origin + way * travel;\r
          drawTrail(s, shape, front, tail, way, fade);\r
          pointAt(shape, front, point);\r
          drawHead(s, point.x, point.y, fade * 0.8, 0.8);\r
        });\r
      });\r
\r
      for (let i = 0; i < s.stars; i++) {\r
        pointAt(shape, state.phase + i * spacing, point);\r
        const twinkle = 0.82 + 0.18 * Math.sin(state.time * 6.1 + i * 2.3) * Math.sin(state.time * 2.7 + i);\r
        drawHead(s, point.x, point.y, Math.min(1.3, intensity), twinkle);\r
      }\r
\r
      dust.forEach(mote => {\r
        const left = 1 - mote.age / mote.life;\r
        const shimmer = 0.45 + 0.55 * Math.sin(state.time * 20 + mote.seed);\r
        const alpha = left * shimmer * state.reveal * (s.light ? 0.35 : 0.9);\r
        if (alpha <= 0.01) return;\r
        ctx.fillStyle = rgba(s.light ? colors.head : mix(colors.tail, WHITE, 0.6), alpha);\r
        ctx.beginPath();\r
        ctx.arc(mote.x, mote.y, mote.size * (0.6 + 0.4 * left), 0, TAU);\r
        ctx.fill();\r
      });\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      state.time += dt;\r
\r
      const key = \`\${s.color}|\${s.trailColor}\`;\r
      if (key !== colors.key) {\r
        colors.key = key;\r
        colors.head = toRgb(s.color);\r
        colors.tail = toRgb(s.trailColor);\r
      }\r
\r
      const shape = shapeFor(s);\r
      const total = shape.total;\r
      const spacing = total / s.stars;\r
      const engaged = state.hovered || state.focused;\r
      const cruise = reduce ? 0 : (s.direction * total) / s.duration;\r
\r
      const revealTarget = s.hover === 'reveal' && !engaged ? 0 : 1;\r
      state.reveal += (revealTarget - state.reveal) * (1 - Math.exp(-dt / (revealTarget > state.reveal ? 0.16 : 0.45)));\r
      const boostTarget = s.hover === 'brighten' && engaged ? 1 : 0;\r
      state.boost += (boostTarget - state.boost) * (1 - Math.exp(-dt / (boostTarget > state.boost ? 0.18 : 0.5)));\r
      state.flash *= Math.exp(-dt / 0.22);\r
\r
      state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / 0.45));\r
      let extra = 0;\r
      if (state.lap >= 0) {\r
        const before = ease(Math.min(1, state.lap / LAP));\r
        state.lap += dt;\r
        extra = (ease(Math.min(1, state.lap / LAP)) - before) * total * s.direction;\r
        if (state.lap >= LAP) state.lap = -1;\r
      }\r
      state.motion = state.velocity + extra / dt;\r
      state.phase = wrap(state.phase + state.velocity * dt + extra, total);\r
\r
      const pace = Math.abs(state.motion) / Math.max(1, Math.abs(total / s.duration));\r
      if (s.sparkle && !reduce && state.reveal > 0.05) {\r
        state.emit += dt * (2 + 6 * Math.min(2, pace)) * s.stars;\r
        while (state.emit > 1) {\r
          state.emit -= 1;\r
          pointAt(shape, state.phase + Math.floor(Math.random() * s.stars) * spacing, point);\r
          spawnDust(point.x, point.y, point.nx, point.ny, state.motion);\r
        }\r
      }\r
      for (let i = dust.length - 1; i >= 0; i--) {\r
        const mote = dust[i];\r
        mote.age += dt;\r
        mote.x += mote.vx * dt;\r
        mote.y += mote.vy * dt;\r
        mote.vx *= Math.exp(-dt * 2.2);\r
        mote.vy *= Math.exp(-dt * 2.2);\r
        if (mote.age >= mote.life) dust.splice(i, 1);\r
      }\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age >= 0.65) pulses.splice(i, 1);\r
      }\r
\r
      draw(s, shape);\r
\r
      const settling =\r
        Math.abs(revealTarget - state.reveal) > 0.002 ||\r
        Math.abs(boostTarget - state.boost) > 0.002 ||\r
        state.flash > 0.01 ||\r
        pulses.length > 0 ||\r
        dust.length > 0;\r
      const moving = Math.abs(state.motion) > 0.05 || cruise !== 0 || state.lap >= 0;\r
      const showing = state.reveal > 0.002 || revealTarget > 0;\r
      if (state.visible && (settling || (moving && showing) || state.hovered)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !state.visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const onEnter = event => {\r
      const s = settingsRef.current;\r
      [state.pointerX, state.pointerY] = local(event);\r
      state.hovered = true;\r
      if (s.hover === 'reveal' && state.reveal < 0.15) {\r
        state.phase = project(shapeFor(s), state.pointerX - s.thickness / 2, state.pointerY - s.thickness / 2);\r
        state.velocity = 0;\r
      }\r
      if (s.hover === 'lap' && state.lap < 0 && !reduce) state.lap = 0;\r
      wake();\r
    };\r
    const onLeave = () => {\r
      state.hovered = false;\r
      wake();\r
    };\r
    const pulse = origin => {\r
      if (!settingsRef.current.clickPulse) return;\r
      pulses.push({ origin, age: 0 });\r
      if (pulses.length > 4) pulses.shift();\r
      state.flash = 1;\r
      wake();\r
    };\r
    const onDown = event => {\r
      if (event.button !== 0 && event.pointerType === 'mouse') return;\r
      const s = settingsRef.current;\r
      const [x, y] = local(event);\r
      pulse(project(shapeFor(s), x - s.thickness / 2, y - s.thickness / 2));\r
    };\r
    const onClick = event => {\r
      if (event.detail === 0) pulse(state.phase);\r
    };\r
    const onFocus = () => {\r
      state.focused = root.matches(':focus-visible');\r
      if (state.focused && settingsRef.current.hover === 'lap' && state.lap < 0 && !reduce) state.lap = 0;\r
      wake();\r
    };\r
    const onBlur = () => {\r
      state.focused = false;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(measure);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(root);\r
    root.addEventListener('pointerenter', onEnter);\r
    root.addEventListener('pointerleave', onLeave);\r
    root.addEventListener('pointerdown', onDown);\r
    root.addEventListener('click', onClick);\r
    root.addEventListener('focus', onFocus);\r
    root.addEventListener('blur', onBlur);\r
    measure();\r
\r
    return () => {\r
      alive = false;\r
      wakeRef.current = null;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      root.removeEventListener('pointerenter', onEnter);\r
      root.removeEventListener('pointerleave', onLeave);\r
      root.removeEventListener('pointerdown', onDown);\r
      root.removeEventListener('click', onClick);\r
      root.removeEventListener('focus', onFocus);\r
      root.removeEventListener('blur', onBlur);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <Component\r
      ref={rootRef}\r
      className={\`\${ROOT}\${Component === 'button' || Component === 'a' ? ' cursor-pointer' : ''}\${className ? \` \${className}\` : ''}\`}\r
      style={{\r
        '--star-border-radius': \`\${settings.radius}px\`,\r
        '--star-border-thickness': \`\${settings.thickness}px\`,\r
        '--star-border-surface': backgroundColor ?? palette.surface,\r
        '--star-border-text': textColor ?? palette.text,\r
        '--star-border-track': borderColor ?? palette.track,\r
        ...style\r
      }}\r
      {...(Component === 'button' && rest.type === undefined ? { type: 'button' } : null)}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className={LIGHT} aria-hidden="true" />\r
      {children}\r
    </Component>\r
  );\r
};\r
\r
export default StarBorder;\r
`,e=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
import './StarBorder.css';\r
\r
export type StarBorderTheme = 'dark' | 'light';\r
\r
export type StarBorderHover = 'lap' | 'brighten' | 'reveal' | 'none';\r
\r
type StarBorderOwnProps = {\r
  children?: React.ReactNode;\r
  className?: string;\r
  style?: React.CSSProperties;\r
  color?: string;\r
  trailColor?: string;\r
  duration?: number;\r
  thickness?: number;\r
  radius?: number;\r
  trailLength?: number;\r
  stars?: number;\r
  glow?: number;\r
  sparkle?: boolean;\r
  direction?: 'clockwise' | 'counterclockwise';\r
  hover?: StarBorderHover;\r
  clickPulse?: boolean;\r
  theme?: StarBorderTheme;\r
  backgroundColor?: string;\r
  textColor?: string;\r
  borderColor?: string;\r
};\r
\r
export type StarBorderProps<T extends React.ElementType = 'button'> = StarBorderOwnProps & {\r
  as?: T;\r
} & Omit<React.ComponentPropsWithoutRef<T>, keyof StarBorderOwnProps | 'as'>;\r
\r
type Palette = { surface: string; text: string; track: string; light: string };\r
\r
type Rgb = [number, number, number];\r
\r
type Segment = { length: number; x: number; y: number; dx: number; dy: number; angle: number | null };\r
\r
type Shape = { r: number; segments: Segment[]; total: number };\r
\r
type Point = { x: number; y: number; nx: number; ny: number };\r
\r
type Pulse = { origin: number; age: number };\r
\r
type Mote = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; seed: number };\r
\r
type Settings = {\r
  light: boolean;\r
  color: string;\r
  trailColor: string;\r
  duration: number;\r
  thickness: number;\r
  radius: number;\r
  trailLength: number;\r
  stars: number;\r
  glow: number;\r
  sparkle: boolean;\r
  direction: number;\r
  hover: StarBorderHover;\r
  clickPulse: boolean;\r
};\r
\r
const THEMES: Record<StarBorderTheme, Palette> = {\r
  dark: {\r
    surface: '#0c0c0f',\r
    text: '#fafafa',\r
    track: 'rgba(255, 255, 255, 0.1)',\r
    light: '#ffffff'\r
  },\r
  light: {\r
    surface: '#ffffff',\r
    text: '#18181b',\r
    track: 'rgba(24, 24, 27, 0.12)',\r
    light: '#18181b'\r
  }\r
};\r
\r
const HOVERS: StarBorderHover[] = ['lap', 'brighten', 'reveal', 'none'];\r
const BLEED = 48;\r
const LAP = 0.9;\r
const TAU = Math.PI * 2;\r
const WHITE: Rgb = [255, 255, 255];\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const wrap = (value: number, total: number) => ((value % total) + total) % total;\r
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (2 - 2 * t) ** 3 / 2);\r
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [\r
  a[0] + (b[0] - a[0]) * t,\r
  a[1] + (b[1] - a[1]) * t,\r
  a[2] + (b[2] - a[2]) * t\r
];\r
const rgba = (rgb: Rgb, alpha: number) =>\r
  \`rgba(\${Math.round(rgb[0])}, \${Math.round(rgb[1])}, \${Math.round(rgb[2])}, \${clamp(alpha, 0, 1).toFixed(3)})\`;\r
\r
let colorContext: CanvasRenderingContext2D | null = null;\r
\r
const toRgb = (color: string): Rgb => {\r
  colorContext = colorContext ?? document.createElement('canvas').getContext('2d');\r
  if (!colorContext) return WHITE;\r
  colorContext.fillStyle = '#000000';\r
  colorContext.fillStyle = color;\r
  const value = String(colorContext.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? WHITE;\r
  return [parts[0], parts[1], parts[2]];\r
};\r
\r
const outline = (width: number, height: number, radius: number): Shape => {\r
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));\r
  const arc = (Math.PI * r) / 2;\r
  const across = Math.max(0, width - 2 * r);\r
  const down = Math.max(0, height - 2 * r);\r
  const segments: Segment[] = [\r
    { length: across, x: r, y: 0, dx: 1, dy: 0, angle: null },\r
    { length: arc, x: width - r, y: r, dx: 0, dy: 0, angle: -Math.PI / 2 },\r
    { length: down, x: width, y: r, dx: 0, dy: 1, angle: null },\r
    { length: arc, x: width - r, y: height - r, dx: 0, dy: 0, angle: 0 },\r
    { length: across, x: width - r, y: height, dx: -1, dy: 0, angle: null },\r
    { length: arc, x: r, y: height - r, dx: 0, dy: 0, angle: Math.PI / 2 },\r
    { length: down, x: 0, y: height - r, dx: 0, dy: -1, angle: null },\r
    { length: arc, x: r, y: r, dx: 0, dy: 0, angle: Math.PI }\r
  ];\r
  return {\r
    r,\r
    segments,\r
    total: Math.max(\r
      1,\r
      segments.reduce((sum, segment) => sum + segment.length, 0)\r
    )\r
  };\r
};\r
\r
const pointAt = (shape: Shape, distance: number, point: Point) => {\r
  let s = wrap(distance, shape.total);\r
  for (const segment of shape.segments) {\r
    if (segment.length > 0 && s <= segment.length) {\r
      if (segment.angle === null) {\r
        point.x = segment.x + segment.dx * s;\r
        point.y = segment.y + segment.dy * s;\r
        point.nx = segment.dy;\r
        point.ny = -segment.dx;\r
      } else {\r
        const angle = segment.angle + s / shape.r;\r
        point.nx = Math.cos(angle);\r
        point.ny = Math.sin(angle);\r
        point.x = segment.x + point.nx * shape.r;\r
        point.y = segment.y + point.ny * shape.r;\r
      }\r
      return point;\r
    }\r
    s -= segment.length;\r
  }\r
  return point;\r
};\r
\r
const project = (shape: Shape, px: number, py: number) => {\r
  let best = Infinity;\r
  let found = 0;\r
  let offset = 0;\r
  shape.segments.forEach(segment => {\r
    if (segment.length > 0) {\r
      let s = 0;\r
      let x = 0;\r
      let y = 0;\r
      if (segment.angle === null) {\r
        s = clamp((px - segment.x) * segment.dx + (py - segment.y) * segment.dy, 0, segment.length);\r
        x = segment.x + segment.dx * s;\r
        y = segment.y + segment.dy * s;\r
      } else {\r
        let angle = wrap(Math.atan2(py - segment.y, px - segment.x) - segment.angle, TAU);\r
        if (angle > Math.PI / 2) angle = angle > Math.PI * 1.25 ? 0 : Math.PI / 2;\r
        s = angle * shape.r;\r
        x = segment.x + Math.cos(segment.angle + angle) * shape.r;\r
        y = segment.y + Math.sin(segment.angle + angle) * shape.r;\r
      }\r
      const distance = (px - x) ** 2 + (py - y) ** 2;\r
      if (distance < best) {\r
        best = distance;\r
        found = offset + s;\r
      }\r
    }\r
    offset += segment.length;\r
  });\r
  return found;\r
};\r
\r
const StarBorder = <T extends React.ElementType = 'button'>({\r
  as,\r
  children,\r
  className = '',\r
  style,\r
  color,\r
  trailColor,\r
  duration = 4,\r
  thickness = 1,\r
  radius = 12,\r
  trailLength = 0.3,\r
  stars = 1,\r
  glow = 0.6,\r
  sparkle = false,\r
  direction = 'clockwise',\r
  hover = 'lap',\r
  clickPulse = true,\r
  theme = 'dark',\r
  backgroundColor,\r
  textColor,\r
  borderColor,\r
  ...rest\r
}: StarBorderProps<T>) => {\r
  const tag = as || 'button';\r
  const Component = tag as unknown as React.FC<Record<string, unknown>>;\r
  const rootRef = useRef<HTMLElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const light = color ?? palette.light;\r
  const settings: Settings = {\r
    light: theme === 'light',\r
    color: light,\r
    trailColor: trailColor ?? light,\r
    duration: Math.max(0.3, duration),\r
    thickness: Math.max(0.5, thickness),\r
    radius: Math.max(0, radius),\r
    trailLength: clamp(trailLength, 0, 1),\r
    stars: clamp(Math.round(stars), 1, 6),\r
    glow: clamp(glow, 0, 1),\r
    sparkle,\r
    direction: direction === 'counterclockwise' ? -1 : 1,\r
    hover: HOVERS.includes(hover) ? hover : 'lap',\r
    clickPulse\r
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
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const point: Point = { x: 0, y: 0, nx: 0, ny: -1 };\r
    const state = {\r
      width: 0,\r
      height: 0,\r
      dpr: 1,\r
      phase: 0,\r
      velocity: 0,\r
      motion: 0,\r
      lap: -1,\r
      time: 0,\r
      reveal: 0,\r
      boost: 0,\r
      flash: 0,\r
      emit: 0,\r
      hovered: false,\r
      focused: false,\r
      pointerX: 0,\r
      pointerY: 0,\r
      visible: true\r
    };\r
    const pulses: Pulse[] = [];\r
    const dust: Mote[] = [];\r
    const colors = { key: '', head: WHITE, tail: WHITE };\r
    let raf = 0;\r
    let last = performance.now();\r
    let alive = true;\r
\r
    const measure = () => {\r
      state.width = root.offsetWidth;\r
      state.height = root.offsetHeight;\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round((state.width + BLEED * 2) * state.dpr));\r
      canvas.height = Math.max(1, Math.round((state.height + BLEED * 2) * state.dpr));\r
      wake();\r
    };\r
\r
    const local = (event: MouseEvent): [number, number] => {\r
      const rect = root.getBoundingClientRect();\r
      const scaleX = rect.width ? state.width / rect.width : 1;\r
      const scaleY = rect.height ? state.height / rect.height : 1;\r
      return [(event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY];\r
    };\r
\r
    const shapeFor = (s: Settings) =>\r
      outline(\r
        Math.max(1, state.width - s.thickness),\r
        Math.max(1, state.height - s.thickness),\r
        s.radius - s.thickness / 2\r
      );\r
\r
    const stroke = (x1: number, y1: number, x2: number, y2: number, width: number, style: string | CanvasGradient) => {\r
      ctx.lineWidth = width;\r
      ctx.strokeStyle = style;\r
      ctx.beginPath();\r
      ctx.moveTo(x1, y1);\r
      ctx.lineTo(x2, y2);\r
      ctx.stroke();\r
    };\r
\r
    const drawTrail = (\r
      s: Settings,\r
      shape: Shape,\r
      head: number,\r
      length: number,\r
      sign: number,\r
      intensity: number,\r
      tip = true\r
    ) => {\r
      if (length < 0.5 || intensity <= 0) return;\r
      const steps = clamp(Math.ceil(length / 2), 2, 90);\r
      pointAt(shape, head, point);\r
      let px = point.x;\r
      let py = point.y;\r
      for (let i = 1; i <= steps; i++) {\r
        pointAt(shape, head - sign * length * (i / steps), point);\r
        const u = 1 - (i - 0.5) / steps;\r
        const fade = u * u * intensity;\r
        let tone = mix(colors.tail, colors.head, u);\r
        if (!s.light) tone = mix(tone, WHITE, u ** 6 * 0.65);\r
        ctx.lineCap = tip && i === 1 ? 'round' : 'butt';\r
        stroke(px, py, point.x, point.y, 2 + 6 * s.glow, rgba(tone, fade * (s.light ? 0.1 : 0.2) * s.glow));\r
        stroke(px, py, point.x, point.y, s.thickness, rgba(tone, fade));\r
        px = point.x;\r
        py = point.y;\r
      }\r
    };\r
\r
    const drawHead = (s: Settings, x: number, y: number, intensity: number, twinkle: number) => {\r
      if (intensity <= 0) return;\r
      const tone = colors.head;\r
      const reach = (12 + 40 * s.glow) * (s.light ? 0.6 : 1);\r
      const bloom = ctx.createRadialGradient(x, y, 0, x, y, reach);\r
      const strength = (s.light ? 0.08 : 0.4) * s.glow * intensity;\r
      bloom.addColorStop(0, rgba(tone, strength));\r
      bloom.addColorStop(0.2, rgba(tone, strength * 0.4));\r
      bloom.addColorStop(0.5, rgba(tone, strength * 0.1));\r
      bloom.addColorStop(1, rgba(tone, 0));\r
      ctx.fillStyle = bloom;\r
      ctx.fillRect(x - reach, y - reach, reach * 2, reach * 2);\r
      if (!s.sparkle) return;\r
\r
      const size = (1 + s.thickness * 0.6) * (s.light ? 0.85 : 1);\r
      const core = ctx.createRadialGradient(x, y, 0, x, y, size * 2.2);\r
      core.addColorStop(0, rgba(s.light ? tone : WHITE, intensity));\r
      core.addColorStop(s.light ? 0.3 : 0.4, rgba(s.light ? tone : mix(tone, WHITE, 0.5), intensity * 0.9));\r
      core.addColorStop(s.light ? 0.55 : 1, rgba(tone, s.light ? intensity * 0.12 : 0));\r
      core.addColorStop(1, rgba(tone, 0));\r
      ctx.fillStyle = core;\r
      ctx.beginPath();\r
      ctx.arc(x, y, size * 2.2, 0, TAU);\r
      ctx.fill();\r
\r
      const spike = (3 + 4 * s.glow + s.thickness * 1.5) * twinkle;\r
      const center = s.light ? tone : WHITE;\r
      const horizontal = ctx.createLinearGradient(x - spike, y, x + spike, y);\r
      horizontal.addColorStop(0, rgba(tone, 0));\r
      horizontal.addColorStop(0.5, rgba(center, intensity * 0.95));\r
      horizontal.addColorStop(1, rgba(tone, 0));\r
      stroke(x - spike, y, x + spike, y, s.light ? 0.75 : 1, horizontal);\r
      const vertical = ctx.createLinearGradient(x, y - spike, x, y + spike);\r
      vertical.addColorStop(0, rgba(tone, 0));\r
      vertical.addColorStop(0.5, rgba(center, intensity * 0.95));\r
      vertical.addColorStop(1, rgba(tone, 0));\r
      stroke(x, y - spike, x, y + spike, s.light ? 0.75 : 1, vertical);\r
    };\r
\r
    const spawnDust = (x: number, y: number, nx: number, ny: number, speed: number) => {\r
      if (dust.length > 48) return;\r
      const push = 3 + Math.random() * 10;\r
      const drift = (Math.random() - 0.5) * 8;\r
      dust.push({\r
        x: x + nx * (Math.random() * 3 - 1),\r
        y: y + ny * (Math.random() * 3 - 1),\r
        vx: nx * push - ny * drift - speed * -ny * 0.04,\r
        vy: ny * push + nx * drift - speed * nx * 0.04,\r
        age: 0,\r
        life: 0.35 + Math.random() * 0.5,\r
        size: 0.45 + Math.random() * 0.7,\r
        seed: Math.random() * TAU\r
      });\r
    };\r
\r
    const draw = (base: Settings, shape: Shape) => {\r
      const s = state.boost > 0.001 ? { ...base, glow: Math.min(1.5, base.glow + 0.4 * state.boost) } : base;\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      if (state.width < 2 || state.height < 2) return;\r
      const offset = (BLEED + s.thickness / 2) * state.dpr;\r
      ctx.setTransform(state.dpr, 0, 0, state.dpr, offset, offset);\r
      ctx.globalCompositeOperation = s.light ? 'source-over' : 'lighter';\r
      ctx.lineCap = 'butt';\r
\r
      const total = shape.total;\r
      const spacing = total / s.stars;\r
      const speed = Math.abs(state.motion);\r
      const sign = state.motion >= 0 ? 1 : -1;\r
      const span = s.trailLength * s.duration;\r
      const length = Math.min(speed * span, spacing * 0.92, total * 0.6);\r
      const intensity = state.reveal * (1 + 0.4 * state.boost + 0.6 * state.flash);\r
\r
      const ring = state.flash * (s.light ? 0.18 : 0.32) + state.boost * state.reveal * (s.light ? 0.07 : 0.12);\r
      if (ring > 0.005) {\r
        ctx.lineWidth = s.thickness + 2 * s.glow;\r
        ctx.strokeStyle = rgba(colors.head, ring);\r
        ctx.beginPath();\r
        ctx.roundRect(\r
          0,\r
          0,\r
          Math.max(1, state.width - s.thickness),\r
          Math.max(1, state.height - s.thickness),\r
          Math.max(0, shape.r)\r
        );\r
        ctx.stroke();\r
      }\r
\r
      const still = clamp(1 - speed / Math.max(1, (total / s.duration) * 0.6), 0, 1) * Math.min(1, intensity);\r
      const rest = (10 + 14 * s.glow + s.thickness * 2) * still;\r
      for (let i = 0; i < s.stars; i++) {\r
        const head = state.phase + i * spacing;\r
        drawTrail(s, shape, head, length, sign, Math.min(1, intensity));\r
        if (still > 0.01) {\r
          drawTrail(s, shape, head, rest, 1, still, false);\r
          drawTrail(s, shape, head, rest, -1, still, false);\r
        }\r
      }\r
\r
      pulses.forEach(pulse => {\r
        const progress = pulse.age / 0.65;\r
        const fade = (1 - progress) ** 2;\r
        const travel = (total / 2) * (1 - (1 - Math.min(1, pulse.age / 0.5)) ** 2);\r
        const tail = Math.min(travel, total * 0.16);\r
        [1, -1].forEach(way => {\r
          const front = pulse.origin + way * travel;\r
          drawTrail(s, shape, front, tail, way, fade);\r
          pointAt(shape, front, point);\r
          drawHead(s, point.x, point.y, fade * 0.8, 0.8);\r
        });\r
      });\r
\r
      for (let i = 0; i < s.stars; i++) {\r
        pointAt(shape, state.phase + i * spacing, point);\r
        const twinkle = 0.82 + 0.18 * Math.sin(state.time * 6.1 + i * 2.3) * Math.sin(state.time * 2.7 + i);\r
        drawHead(s, point.x, point.y, Math.min(1.3, intensity), twinkle);\r
      }\r
\r
      dust.forEach(mote => {\r
        const left = 1 - mote.age / mote.life;\r
        const shimmer = 0.45 + 0.55 * Math.sin(state.time * 20 + mote.seed);\r
        const alpha = left * shimmer * state.reveal * (s.light ? 0.35 : 0.9);\r
        if (alpha <= 0.01) return;\r
        ctx.fillStyle = rgba(s.light ? colors.head : mix(colors.tail, WHITE, 0.6), alpha);\r
        ctx.beginPath();\r
        ctx.arc(mote.x, mote.y, mote.size * (0.6 + 0.4 * left), 0, TAU);\r
        ctx.fill();\r
      });\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      state.time += dt;\r
\r
      const key = \`\${s.color}|\${s.trailColor}\`;\r
      if (key !== colors.key) {\r
        colors.key = key;\r
        colors.head = toRgb(s.color);\r
        colors.tail = toRgb(s.trailColor);\r
      }\r
\r
      const shape = shapeFor(s);\r
      const total = shape.total;\r
      const spacing = total / s.stars;\r
      const engaged = state.hovered || state.focused;\r
      const cruise = reduce ? 0 : (s.direction * total) / s.duration;\r
\r
      const revealTarget = s.hover === 'reveal' && !engaged ? 0 : 1;\r
      state.reveal += (revealTarget - state.reveal) * (1 - Math.exp(-dt / (revealTarget > state.reveal ? 0.16 : 0.45)));\r
      const boostTarget = s.hover === 'brighten' && engaged ? 1 : 0;\r
      state.boost += (boostTarget - state.boost) * (1 - Math.exp(-dt / (boostTarget > state.boost ? 0.18 : 0.5)));\r
      state.flash *= Math.exp(-dt / 0.22);\r
\r
      state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / 0.45));\r
      let extra = 0;\r
      if (state.lap >= 0) {\r
        const before = ease(Math.min(1, state.lap / LAP));\r
        state.lap += dt;\r
        extra = (ease(Math.min(1, state.lap / LAP)) - before) * total * s.direction;\r
        if (state.lap >= LAP) state.lap = -1;\r
      }\r
      state.motion = state.velocity + extra / dt;\r
      state.phase = wrap(state.phase + state.velocity * dt + extra, total);\r
\r
      const pace = Math.abs(state.motion) / Math.max(1, Math.abs(total / s.duration));\r
      if (s.sparkle && !reduce && state.reveal > 0.05) {\r
        state.emit += dt * (2 + 6 * Math.min(2, pace)) * s.stars;\r
        while (state.emit > 1) {\r
          state.emit -= 1;\r
          pointAt(shape, state.phase + Math.floor(Math.random() * s.stars) * spacing, point);\r
          spawnDust(point.x, point.y, point.nx, point.ny, state.motion);\r
        }\r
      }\r
      for (let i = dust.length - 1; i >= 0; i--) {\r
        const mote = dust[i];\r
        mote.age += dt;\r
        mote.x += mote.vx * dt;\r
        mote.y += mote.vy * dt;\r
        mote.vx *= Math.exp(-dt * 2.2);\r
        mote.vy *= Math.exp(-dt * 2.2);\r
        if (mote.age >= mote.life) dust.splice(i, 1);\r
      }\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age >= 0.65) pulses.splice(i, 1);\r
      }\r
\r
      draw(s, shape);\r
\r
      const settling =\r
        Math.abs(revealTarget - state.reveal) > 0.002 ||\r
        Math.abs(boostTarget - state.boost) > 0.002 ||\r
        state.flash > 0.01 ||\r
        pulses.length > 0 ||\r
        dust.length > 0;\r
      const moving = Math.abs(state.motion) > 0.05 || cruise !== 0 || state.lap >= 0;\r
      const showing = state.reveal > 0.002 || revealTarget > 0;\r
      if (state.visible && (settling || (moving && showing) || state.hovered)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !state.visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const onEnter = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      [state.pointerX, state.pointerY] = local(event);\r
      state.hovered = true;\r
      if (s.hover === 'reveal' && state.reveal < 0.15) {\r
        state.phase = project(shapeFor(s), state.pointerX - s.thickness / 2, state.pointerY - s.thickness / 2);\r
        state.velocity = 0;\r
      }\r
      if (s.hover === 'lap' && state.lap < 0 && !reduce) state.lap = 0;\r
      wake();\r
    };\r
    const onLeave = () => {\r
      state.hovered = false;\r
      wake();\r
    };\r
    const pulse = (origin: number) => {\r
      if (!settingsRef.current.clickPulse) return;\r
      pulses.push({ origin, age: 0 });\r
      if (pulses.length > 4) pulses.shift();\r
      state.flash = 1;\r
      wake();\r
    };\r
    const onDown = (event: PointerEvent) => {\r
      if (event.button !== 0 && event.pointerType === 'mouse') return;\r
      const s = settingsRef.current;\r
      const [x, y] = local(event);\r
      pulse(project(shapeFor(s), x - s.thickness / 2, y - s.thickness / 2));\r
    };\r
    const onClick = (event: MouseEvent) => {\r
      if (event.detail === 0) pulse(state.phase);\r
    };\r
    const onFocus = () => {\r
      state.focused = root.matches(':focus-visible');\r
      if (state.focused && settingsRef.current.hover === 'lap' && state.lap < 0 && !reduce) state.lap = 0;\r
      wake();\r
    };\r
    const onBlur = () => {\r
      state.focused = false;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(measure);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(root);\r
    root.addEventListener('pointerenter', onEnter);\r
    root.addEventListener('pointerleave', onLeave);\r
    root.addEventListener('pointerdown', onDown);\r
    root.addEventListener('click', onClick);\r
    root.addEventListener('focus', onFocus);\r
    root.addEventListener('blur', onBlur);\r
    measure();\r
\r
    return () => {\r
      alive = false;\r
      wakeRef.current = null;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      root.removeEventListener('pointerenter', onEnter);\r
      root.removeEventListener('pointerleave', onLeave);\r
      root.removeEventListener('pointerdown', onDown);\r
      root.removeEventListener('click', onClick);\r
      root.removeEventListener('focus', onFocus);\r
      root.removeEventListener('blur', onBlur);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <Component\r
      ref={rootRef}\r
      className={\`star-border\${className ? \` \${className}\` : ''}\`}\r
      style={\r
        {\r
          '--star-border-radius': \`\${settings.radius}px\`,\r
          '--star-border-thickness': \`\${settings.thickness}px\`,\r
          '--star-border-surface': backgroundColor ?? palette.surface,\r
          '--star-border-text': textColor ?? palette.text,\r
          '--star-border-track': borderColor ?? palette.track,\r
          ...style\r
        } as React.CSSProperties\r
      }\r
      {...(tag === 'button' && (rest as { type?: string }).type === undefined ? { type: 'button' } : null)}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="star-border__light" aria-hidden="true" />\r
      {children}\r
    </Component>\r
  );\r
};\r
\r
export default StarBorder;\r
`,s=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
export type StarBorderTheme = 'dark' | 'light';\r
\r
export type StarBorderHover = 'lap' | 'brighten' | 'reveal' | 'none';\r
\r
type StarBorderOwnProps = {\r
  children?: React.ReactNode;\r
  className?: string;\r
  style?: React.CSSProperties;\r
  color?: string;\r
  trailColor?: string;\r
  duration?: number;\r
  thickness?: number;\r
  radius?: number;\r
  trailLength?: number;\r
  stars?: number;\r
  glow?: number;\r
  sparkle?: boolean;\r
  direction?: 'clockwise' | 'counterclockwise';\r
  hover?: StarBorderHover;\r
  clickPulse?: boolean;\r
  theme?: StarBorderTheme;\r
  backgroundColor?: string;\r
  textColor?: string;\r
  borderColor?: string;\r
};\r
\r
export type StarBorderProps<T extends React.ElementType = 'button'> = StarBorderOwnProps & {\r
  as?: T;\r
} & Omit<React.ComponentPropsWithoutRef<T>, keyof StarBorderOwnProps | 'as'>;\r
\r
type Palette = { surface: string; text: string; track: string; light: string };\r
\r
type Rgb = [number, number, number];\r
\r
type Segment = { length: number; x: number; y: number; dx: number; dy: number; angle: number | null };\r
\r
type Shape = { r: number; segments: Segment[]; total: number };\r
\r
type Point = { x: number; y: number; nx: number; ny: number };\r
\r
type Pulse = { origin: number; age: number };\r
\r
type Mote = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; seed: number };\r
\r
type Settings = {\r
  light: boolean;\r
  color: string;\r
  trailColor: string;\r
  duration: number;\r
  thickness: number;\r
  radius: number;\r
  trailLength: number;\r
  stars: number;\r
  glow: number;\r
  sparkle: boolean;\r
  direction: number;\r
  hover: StarBorderHover;\r
  clickPulse: boolean;\r
};\r
\r
const ROOT =\r
  "relative isolate m-0 inline-flex items-center justify-center gap-2 rounded-[var(--star-border-radius)] border-0 px-6 py-3.5 font-medium leading-tight no-underline [background:var(--star-border-surface)] text-[color:var(--star-border-text)] [-webkit-tap-highlight-color:transparent] before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:shadow-[inset_0_0_0_var(--star-border-thickness)_var(--star-border-track)] before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--star-border-track)] disabled:cursor-not-allowed disabled:opacity-50";\r
\r
const LIGHT = 'pointer-events-none absolute top-[-48px] left-[-48px] -z-1 h-[calc(100%+96px)] w-[calc(100%+96px)]';\r
\r
const THEMES: Record<StarBorderTheme, Palette> = {\r
  dark: {\r
    surface: '#0c0c0f',\r
    text: '#fafafa',\r
    track: 'rgba(255, 255, 255, 0.1)',\r
    light: '#ffffff'\r
  },\r
  light: {\r
    surface: '#ffffff',\r
    text: '#18181b',\r
    track: 'rgba(24, 24, 27, 0.12)',\r
    light: '#18181b'\r
  }\r
};\r
\r
const HOVERS: StarBorderHover[] = ['lap', 'brighten', 'reveal', 'none'];\r
const BLEED = 48;\r
const LAP = 0.9;\r
const TAU = Math.PI * 2;\r
const WHITE: Rgb = [255, 255, 255];\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const wrap = (value: number, total: number) => ((value % total) + total) % total;\r
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (2 - 2 * t) ** 3 / 2);\r
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [\r
  a[0] + (b[0] - a[0]) * t,\r
  a[1] + (b[1] - a[1]) * t,\r
  a[2] + (b[2] - a[2]) * t\r
];\r
const rgba = (rgb: Rgb, alpha: number) =>\r
  \`rgba(\${Math.round(rgb[0])}, \${Math.round(rgb[1])}, \${Math.round(rgb[2])}, \${clamp(alpha, 0, 1).toFixed(3)})\`;\r
\r
let colorContext: CanvasRenderingContext2D | null = null;\r
\r
const toRgb = (color: string): Rgb => {\r
  colorContext = colorContext ?? document.createElement('canvas').getContext('2d');\r
  if (!colorContext) return WHITE;\r
  colorContext.fillStyle = '#000000';\r
  colorContext.fillStyle = color;\r
  const value = String(colorContext.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? WHITE;\r
  return [parts[0], parts[1], parts[2]];\r
};\r
\r
const outline = (width: number, height: number, radius: number): Shape => {\r
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));\r
  const arc = (Math.PI * r) / 2;\r
  const across = Math.max(0, width - 2 * r);\r
  const down = Math.max(0, height - 2 * r);\r
  const segments: Segment[] = [\r
    { length: across, x: r, y: 0, dx: 1, dy: 0, angle: null },\r
    { length: arc, x: width - r, y: r, dx: 0, dy: 0, angle: -Math.PI / 2 },\r
    { length: down, x: width, y: r, dx: 0, dy: 1, angle: null },\r
    { length: arc, x: width - r, y: height - r, dx: 0, dy: 0, angle: 0 },\r
    { length: across, x: width - r, y: height, dx: -1, dy: 0, angle: null },\r
    { length: arc, x: r, y: height - r, dx: 0, dy: 0, angle: Math.PI / 2 },\r
    { length: down, x: 0, y: height - r, dx: 0, dy: -1, angle: null },\r
    { length: arc, x: r, y: r, dx: 0, dy: 0, angle: Math.PI }\r
  ];\r
  return {\r
    r,\r
    segments,\r
    total: Math.max(\r
      1,\r
      segments.reduce((sum, segment) => sum + segment.length, 0)\r
    )\r
  };\r
};\r
\r
const pointAt = (shape: Shape, distance: number, point: Point) => {\r
  let s = wrap(distance, shape.total);\r
  for (const segment of shape.segments) {\r
    if (segment.length > 0 && s <= segment.length) {\r
      if (segment.angle === null) {\r
        point.x = segment.x + segment.dx * s;\r
        point.y = segment.y + segment.dy * s;\r
        point.nx = segment.dy;\r
        point.ny = -segment.dx;\r
      } else {\r
        const angle = segment.angle + s / shape.r;\r
        point.nx = Math.cos(angle);\r
        point.ny = Math.sin(angle);\r
        point.x = segment.x + point.nx * shape.r;\r
        point.y = segment.y + point.ny * shape.r;\r
      }\r
      return point;\r
    }\r
    s -= segment.length;\r
  }\r
  return point;\r
};\r
\r
const project = (shape: Shape, px: number, py: number) => {\r
  let best = Infinity;\r
  let found = 0;\r
  let offset = 0;\r
  shape.segments.forEach(segment => {\r
    if (segment.length > 0) {\r
      let s = 0;\r
      let x = 0;\r
      let y = 0;\r
      if (segment.angle === null) {\r
        s = clamp((px - segment.x) * segment.dx + (py - segment.y) * segment.dy, 0, segment.length);\r
        x = segment.x + segment.dx * s;\r
        y = segment.y + segment.dy * s;\r
      } else {\r
        let angle = wrap(Math.atan2(py - segment.y, px - segment.x) - segment.angle, TAU);\r
        if (angle > Math.PI / 2) angle = angle > Math.PI * 1.25 ? 0 : Math.PI / 2;\r
        s = angle * shape.r;\r
        x = segment.x + Math.cos(segment.angle + angle) * shape.r;\r
        y = segment.y + Math.sin(segment.angle + angle) * shape.r;\r
      }\r
      const distance = (px - x) ** 2 + (py - y) ** 2;\r
      if (distance < best) {\r
        best = distance;\r
        found = offset + s;\r
      }\r
    }\r
    offset += segment.length;\r
  });\r
  return found;\r
};\r
\r
const StarBorder = <T extends React.ElementType = 'button'>({\r
  as,\r
  children,\r
  className = '',\r
  style,\r
  color,\r
  trailColor,\r
  duration = 4,\r
  thickness = 1,\r
  radius = 12,\r
  trailLength = 0.3,\r
  stars = 1,\r
  glow = 0.6,\r
  sparkle = false,\r
  direction = 'clockwise',\r
  hover = 'lap',\r
  clickPulse = true,\r
  theme = 'dark',\r
  backgroundColor,\r
  textColor,\r
  borderColor,\r
  ...rest\r
}: StarBorderProps<T>) => {\r
  const tag = as || 'button';\r
  const Component = tag as unknown as React.FC<Record<string, unknown>>;\r
  const rootRef = useRef<HTMLElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const light = color ?? palette.light;\r
  const settings: Settings = {\r
    light: theme === 'light',\r
    color: light,\r
    trailColor: trailColor ?? light,\r
    duration: Math.max(0.3, duration),\r
    thickness: Math.max(0.5, thickness),\r
    radius: Math.max(0, radius),\r
    trailLength: clamp(trailLength, 0, 1),\r
    stars: clamp(Math.round(stars), 1, 6),\r
    glow: clamp(glow, 0, 1),\r
    sparkle,\r
    direction: direction === 'counterclockwise' ? -1 : 1,\r
    hover: HOVERS.includes(hover) ? hover : 'lap',\r
    clickPulse\r
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
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const point: Point = { x: 0, y: 0, nx: 0, ny: -1 };\r
    const state = {\r
      width: 0,\r
      height: 0,\r
      dpr: 1,\r
      phase: 0,\r
      velocity: 0,\r
      motion: 0,\r
      lap: -1,\r
      time: 0,\r
      reveal: 0,\r
      boost: 0,\r
      flash: 0,\r
      emit: 0,\r
      hovered: false,\r
      focused: false,\r
      pointerX: 0,\r
      pointerY: 0,\r
      visible: true\r
    };\r
    const pulses: Pulse[] = [];\r
    const dust: Mote[] = [];\r
    const colors = { key: '', head: WHITE, tail: WHITE };\r
    let raf = 0;\r
    let last = performance.now();\r
    let alive = true;\r
\r
    const measure = () => {\r
      state.width = root.offsetWidth;\r
      state.height = root.offsetHeight;\r
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round((state.width + BLEED * 2) * state.dpr));\r
      canvas.height = Math.max(1, Math.round((state.height + BLEED * 2) * state.dpr));\r
      wake();\r
    };\r
\r
    const local = (event: MouseEvent): [number, number] => {\r
      const rect = root.getBoundingClientRect();\r
      const scaleX = rect.width ? state.width / rect.width : 1;\r
      const scaleY = rect.height ? state.height / rect.height : 1;\r
      return [(event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY];\r
    };\r
\r
    const shapeFor = (s: Settings) =>\r
      outline(\r
        Math.max(1, state.width - s.thickness),\r
        Math.max(1, state.height - s.thickness),\r
        s.radius - s.thickness / 2\r
      );\r
\r
    const stroke = (x1: number, y1: number, x2: number, y2: number, width: number, style: string | CanvasGradient) => {\r
      ctx.lineWidth = width;\r
      ctx.strokeStyle = style;\r
      ctx.beginPath();\r
      ctx.moveTo(x1, y1);\r
      ctx.lineTo(x2, y2);\r
      ctx.stroke();\r
    };\r
\r
    const drawTrail = (\r
      s: Settings,\r
      shape: Shape,\r
      head: number,\r
      length: number,\r
      sign: number,\r
      intensity: number,\r
      tip = true\r
    ) => {\r
      if (length < 0.5 || intensity <= 0) return;\r
      const steps = clamp(Math.ceil(length / 2), 2, 90);\r
      pointAt(shape, head, point);\r
      let px = point.x;\r
      let py = point.y;\r
      for (let i = 1; i <= steps; i++) {\r
        pointAt(shape, head - sign * length * (i / steps), point);\r
        const u = 1 - (i - 0.5) / steps;\r
        const fade = u * u * intensity;\r
        let tone = mix(colors.tail, colors.head, u);\r
        if (!s.light) tone = mix(tone, WHITE, u ** 6 * 0.65);\r
        ctx.lineCap = tip && i === 1 ? 'round' : 'butt';\r
        stroke(px, py, point.x, point.y, 2 + 6 * s.glow, rgba(tone, fade * (s.light ? 0.1 : 0.2) * s.glow));\r
        stroke(px, py, point.x, point.y, s.thickness, rgba(tone, fade));\r
        px = point.x;\r
        py = point.y;\r
      }\r
    };\r
\r
    const drawHead = (s: Settings, x: number, y: number, intensity: number, twinkle: number) => {\r
      if (intensity <= 0) return;\r
      const tone = colors.head;\r
      const reach = (12 + 40 * s.glow) * (s.light ? 0.6 : 1);\r
      const bloom = ctx.createRadialGradient(x, y, 0, x, y, reach);\r
      const strength = (s.light ? 0.08 : 0.4) * s.glow * intensity;\r
      bloom.addColorStop(0, rgba(tone, strength));\r
      bloom.addColorStop(0.2, rgba(tone, strength * 0.4));\r
      bloom.addColorStop(0.5, rgba(tone, strength * 0.1));\r
      bloom.addColorStop(1, rgba(tone, 0));\r
      ctx.fillStyle = bloom;\r
      ctx.fillRect(x - reach, y - reach, reach * 2, reach * 2);\r
      if (!s.sparkle) return;\r
\r
      const size = (1 + s.thickness * 0.6) * (s.light ? 0.85 : 1);\r
      const core = ctx.createRadialGradient(x, y, 0, x, y, size * 2.2);\r
      core.addColorStop(0, rgba(s.light ? tone : WHITE, intensity));\r
      core.addColorStop(s.light ? 0.3 : 0.4, rgba(s.light ? tone : mix(tone, WHITE, 0.5), intensity * 0.9));\r
      core.addColorStop(s.light ? 0.55 : 1, rgba(tone, s.light ? intensity * 0.12 : 0));\r
      core.addColorStop(1, rgba(tone, 0));\r
      ctx.fillStyle = core;\r
      ctx.beginPath();\r
      ctx.arc(x, y, size * 2.2, 0, TAU);\r
      ctx.fill();\r
\r
      const spike = (3 + 4 * s.glow + s.thickness * 1.5) * twinkle;\r
      const center = s.light ? tone : WHITE;\r
      const horizontal = ctx.createLinearGradient(x - spike, y, x + spike, y);\r
      horizontal.addColorStop(0, rgba(tone, 0));\r
      horizontal.addColorStop(0.5, rgba(center, intensity * 0.95));\r
      horizontal.addColorStop(1, rgba(tone, 0));\r
      stroke(x - spike, y, x + spike, y, s.light ? 0.75 : 1, horizontal);\r
      const vertical = ctx.createLinearGradient(x, y - spike, x, y + spike);\r
      vertical.addColorStop(0, rgba(tone, 0));\r
      vertical.addColorStop(0.5, rgba(center, intensity * 0.95));\r
      vertical.addColorStop(1, rgba(tone, 0));\r
      stroke(x, y - spike, x, y + spike, s.light ? 0.75 : 1, vertical);\r
    };\r
\r
    const spawnDust = (x: number, y: number, nx: number, ny: number, speed: number) => {\r
      if (dust.length > 48) return;\r
      const push = 3 + Math.random() * 10;\r
      const drift = (Math.random() - 0.5) * 8;\r
      dust.push({\r
        x: x + nx * (Math.random() * 3 - 1),\r
        y: y + ny * (Math.random() * 3 - 1),\r
        vx: nx * push - ny * drift - speed * -ny * 0.04,\r
        vy: ny * push + nx * drift - speed * nx * 0.04,\r
        age: 0,\r
        life: 0.35 + Math.random() * 0.5,\r
        size: 0.45 + Math.random() * 0.7,\r
        seed: Math.random() * TAU\r
      });\r
    };\r
\r
    const draw = (base: Settings, shape: Shape) => {\r
      const s = state.boost > 0.001 ? { ...base, glow: Math.min(1.5, base.glow + 0.4 * state.boost) } : base;\r
      ctx.setTransform(1, 0, 0, 1, 0, 0);\r
      ctx.clearRect(0, 0, canvas.width, canvas.height);\r
      if (state.width < 2 || state.height < 2) return;\r
      const offset = (BLEED + s.thickness / 2) * state.dpr;\r
      ctx.setTransform(state.dpr, 0, 0, state.dpr, offset, offset);\r
      ctx.globalCompositeOperation = s.light ? 'source-over' : 'lighter';\r
      ctx.lineCap = 'butt';\r
\r
      const total = shape.total;\r
      const spacing = total / s.stars;\r
      const speed = Math.abs(state.motion);\r
      const sign = state.motion >= 0 ? 1 : -1;\r
      const span = s.trailLength * s.duration;\r
      const length = Math.min(speed * span, spacing * 0.92, total * 0.6);\r
      const intensity = state.reveal * (1 + 0.4 * state.boost + 0.6 * state.flash);\r
\r
      const ring = state.flash * (s.light ? 0.18 : 0.32) + state.boost * state.reveal * (s.light ? 0.07 : 0.12);\r
      if (ring > 0.005) {\r
        ctx.lineWidth = s.thickness + 2 * s.glow;\r
        ctx.strokeStyle = rgba(colors.head, ring);\r
        ctx.beginPath();\r
        ctx.roundRect(\r
          0,\r
          0,\r
          Math.max(1, state.width - s.thickness),\r
          Math.max(1, state.height - s.thickness),\r
          Math.max(0, shape.r)\r
        );\r
        ctx.stroke();\r
      }\r
\r
      const still = clamp(1 - speed / Math.max(1, (total / s.duration) * 0.6), 0, 1) * Math.min(1, intensity);\r
      const rest = (10 + 14 * s.glow + s.thickness * 2) * still;\r
      for (let i = 0; i < s.stars; i++) {\r
        const head = state.phase + i * spacing;\r
        drawTrail(s, shape, head, length, sign, Math.min(1, intensity));\r
        if (still > 0.01) {\r
          drawTrail(s, shape, head, rest, 1, still, false);\r
          drawTrail(s, shape, head, rest, -1, still, false);\r
        }\r
      }\r
\r
      pulses.forEach(pulse => {\r
        const progress = pulse.age / 0.65;\r
        const fade = (1 - progress) ** 2;\r
        const travel = (total / 2) * (1 - (1 - Math.min(1, pulse.age / 0.5)) ** 2);\r
        const tail = Math.min(travel, total * 0.16);\r
        [1, -1].forEach(way => {\r
          const front = pulse.origin + way * travel;\r
          drawTrail(s, shape, front, tail, way, fade);\r
          pointAt(shape, front, point);\r
          drawHead(s, point.x, point.y, fade * 0.8, 0.8);\r
        });\r
      });\r
\r
      for (let i = 0; i < s.stars; i++) {\r
        pointAt(shape, state.phase + i * spacing, point);\r
        const twinkle = 0.82 + 0.18 * Math.sin(state.time * 6.1 + i * 2.3) * Math.sin(state.time * 2.7 + i);\r
        drawHead(s, point.x, point.y, Math.min(1.3, intensity), twinkle);\r
      }\r
\r
      dust.forEach(mote => {\r
        const left = 1 - mote.age / mote.life;\r
        const shimmer = 0.45 + 0.55 * Math.sin(state.time * 20 + mote.seed);\r
        const alpha = left * shimmer * state.reveal * (s.light ? 0.35 : 0.9);\r
        if (alpha <= 0.01) return;\r
        ctx.fillStyle = rgba(s.light ? colors.head : mix(colors.tail, WHITE, 0.6), alpha);\r
        ctx.beginPath();\r
        ctx.arc(mote.x, mote.y, mote.size * (0.6 + 0.4 * left), 0, TAU);\r
        ctx.fill();\r
      });\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      state.time += dt;\r
\r
      const key = \`\${s.color}|\${s.trailColor}\`;\r
      if (key !== colors.key) {\r
        colors.key = key;\r
        colors.head = toRgb(s.color);\r
        colors.tail = toRgb(s.trailColor);\r
      }\r
\r
      const shape = shapeFor(s);\r
      const total = shape.total;\r
      const spacing = total / s.stars;\r
      const engaged = state.hovered || state.focused;\r
      const cruise = reduce ? 0 : (s.direction * total) / s.duration;\r
\r
      const revealTarget = s.hover === 'reveal' && !engaged ? 0 : 1;\r
      state.reveal += (revealTarget - state.reveal) * (1 - Math.exp(-dt / (revealTarget > state.reveal ? 0.16 : 0.45)));\r
      const boostTarget = s.hover === 'brighten' && engaged ? 1 : 0;\r
      state.boost += (boostTarget - state.boost) * (1 - Math.exp(-dt / (boostTarget > state.boost ? 0.18 : 0.5)));\r
      state.flash *= Math.exp(-dt / 0.22);\r
\r
      state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / 0.45));\r
      let extra = 0;\r
      if (state.lap >= 0) {\r
        const before = ease(Math.min(1, state.lap / LAP));\r
        state.lap += dt;\r
        extra = (ease(Math.min(1, state.lap / LAP)) - before) * total * s.direction;\r
        if (state.lap >= LAP) state.lap = -1;\r
      }\r
      state.motion = state.velocity + extra / dt;\r
      state.phase = wrap(state.phase + state.velocity * dt + extra, total);\r
\r
      const pace = Math.abs(state.motion) / Math.max(1, Math.abs(total / s.duration));\r
      if (s.sparkle && !reduce && state.reveal > 0.05) {\r
        state.emit += dt * (2 + 6 * Math.min(2, pace)) * s.stars;\r
        while (state.emit > 1) {\r
          state.emit -= 1;\r
          pointAt(shape, state.phase + Math.floor(Math.random() * s.stars) * spacing, point);\r
          spawnDust(point.x, point.y, point.nx, point.ny, state.motion);\r
        }\r
      }\r
      for (let i = dust.length - 1; i >= 0; i--) {\r
        const mote = dust[i];\r
        mote.age += dt;\r
        mote.x += mote.vx * dt;\r
        mote.y += mote.vy * dt;\r
        mote.vx *= Math.exp(-dt * 2.2);\r
        mote.vy *= Math.exp(-dt * 2.2);\r
        if (mote.age >= mote.life) dust.splice(i, 1);\r
      }\r
      for (let i = pulses.length - 1; i >= 0; i--) {\r
        pulses[i].age += dt;\r
        if (pulses[i].age >= 0.65) pulses.splice(i, 1);\r
      }\r
\r
      draw(s, shape);\r
\r
      const settling =\r
        Math.abs(revealTarget - state.reveal) > 0.002 ||\r
        Math.abs(boostTarget - state.boost) > 0.002 ||\r
        state.flash > 0.01 ||\r
        pulses.length > 0 ||\r
        dust.length > 0;\r
      const moving = Math.abs(state.motion) > 0.05 || cruise !== 0 || state.lap >= 0;\r
      const showing = state.reveal > 0.002 || revealTarget > 0;\r
      if (state.visible && (settling || (moving && showing) || state.hovered)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !state.visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = wake;\r
\r
    const onEnter = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      [state.pointerX, state.pointerY] = local(event);\r
      state.hovered = true;\r
      if (s.hover === 'reveal' && state.reveal < 0.15) {\r
        state.phase = project(shapeFor(s), state.pointerX - s.thickness / 2, state.pointerY - s.thickness / 2);\r
        state.velocity = 0;\r
      }\r
      if (s.hover === 'lap' && state.lap < 0 && !reduce) state.lap = 0;\r
      wake();\r
    };\r
    const onLeave = () => {\r
      state.hovered = false;\r
      wake();\r
    };\r
    const pulse = (origin: number) => {\r
      if (!settingsRef.current.clickPulse) return;\r
      pulses.push({ origin, age: 0 });\r
      if (pulses.length > 4) pulses.shift();\r
      state.flash = 1;\r
      wake();\r
    };\r
    const onDown = (event: PointerEvent) => {\r
      if (event.button !== 0 && event.pointerType === 'mouse') return;\r
      const s = settingsRef.current;\r
      const [x, y] = local(event);\r
      pulse(project(shapeFor(s), x - s.thickness / 2, y - s.thickness / 2));\r
    };\r
    const onClick = (event: MouseEvent) => {\r
      if (event.detail === 0) pulse(state.phase);\r
    };\r
    const onFocus = () => {\r
      state.focused = root.matches(':focus-visible');\r
      if (state.focused && settingsRef.current.hover === 'lap' && state.lap < 0 && !reduce) state.lap = 0;\r
      wake();\r
    };\r
    const onBlur = () => {\r
      state.focused = false;\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(measure);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(root);\r
    root.addEventListener('pointerenter', onEnter);\r
    root.addEventListener('pointerleave', onLeave);\r
    root.addEventListener('pointerdown', onDown);\r
    root.addEventListener('click', onClick);\r
    root.addEventListener('focus', onFocus);\r
    root.addEventListener('blur', onBlur);\r
    measure();\r
\r
    return () => {\r
      alive = false;\r
      wakeRef.current = null;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      root.removeEventListener('pointerenter', onEnter);\r
      root.removeEventListener('pointerleave', onLeave);\r
      root.removeEventListener('pointerdown', onDown);\r
      root.removeEventListener('click', onClick);\r
      root.removeEventListener('focus', onFocus);\r
      root.removeEventListener('blur', onBlur);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <Component\r
      ref={rootRef}\r
      className={\`\${ROOT}\${tag === 'button' || tag === 'a' ? ' cursor-pointer' : ''}\${className ? \` \${className}\` : ''}\`}\r
      style={\r
        {\r
          '--star-border-radius': \`\${settings.radius}px\`,\r
          '--star-border-thickness': \`\${settings.thickness}px\`,\r
          '--star-border-surface': backgroundColor ?? palette.surface,\r
          '--star-border-text': textColor ?? palette.text,\r
          '--star-border-track': borderColor ?? palette.track,\r
          ...style\r
        } as React.CSSProperties\r
      }\r
      {...(tag === 'button' && (rest as { type?: string }).type === undefined ? { type: 'button' } : null)}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className={LIGHT} aria-hidden="true" />\r
      {children}\r
    </Component>\r
  );\r
};\r
\r
export default StarBorder;\r
`,a={usage:`import StarBorder from './StarBorder';

<StarBorder
  color="#ffffff"
  trailColor="#ffffff"
  duration={4}
  direction="clockwise"
  stars={1}
  trailLength={0.3}
  thickness={1}
  radius={12}
  glow={0.6}
  hover="lap"
  sparkle={false}
  clickPulse
  theme="dark"
>
  Get started
</StarBorder>`,code:n,css:t,tailwind:r,tsCode:e,tsTailwind:s};export{a as starBorder};
