const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const DEFAULT_SPRING = { stiffness: 170, damping: 16, mass: 1 };\r
\r
const smoothstep = (edge0, edge1, value) => {\r
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const registry = new Set();\r
const field = { pointer: null, owner: null };\r
let detach = null;\r
\r
const reach = (rect, pointer) => {\r
  const dx = pointer.x - (rect.left + rect.width / 2);\r
  const dy = pointer.y - (rect.top + rect.height / 2);\r
  const outside = Math.hypot(Math.max(0, Math.abs(dx) - rect.width / 2), Math.max(0, Math.abs(dy) - rect.height / 2));\r
  return { dx, dy, outside };\r
};\r
\r
const arbitrate = () => {\r
  let winner = null;\r
  let nearest = Infinity;\r
  let closest = Infinity;\r
  for (const entry of registry) {\r
    const s = entry.settings.current;\r
    let near = null;\r
    if (field.pointer && !s.disabled && !entry.reduce) {\r
      near = reach(entry.wrapper.getBoundingClientRect(), field.pointer);\r
      if (near.outside > s.padding) near = null;\r
    }\r
    if (!s.exclusive) {\r
      if (near || entry.active) entry.wake();\r
      continue;\r
    }\r
    if (!near) continue;\r
    const center = Math.hypot(near.dx, near.dy);\r
    if (near.outside < nearest || (near.outside === nearest && center < closest)) {\r
      winner = entry;\r
      nearest = near.outside;\r
      closest = center;\r
    }\r
  }\r
  const previous = field.owner;\r
  field.owner = winner;\r
  if (previous && previous !== winner) previous.wake();\r
  if (winner) winner.wake();\r
};\r
\r
const attach = () => {\r
  const onPointerMove = event => {\r
    if (event.pointerType === 'touch') return;\r
    field.pointer = { x: event.clientX, y: event.clientY };\r
    arbitrate();\r
  };\r
  const onLeave = () => {\r
    field.pointer = null;\r
    arbitrate();\r
  };\r
  window.addEventListener('pointermove', onPointerMove, { passive: true });\r
  window.addEventListener('scroll', arbitrate, { passive: true, capture: true });\r
  document.documentElement.addEventListener('pointerleave', onLeave);\r
  window.addEventListener('blur', onLeave);\r
  return () => {\r
    window.removeEventListener('pointermove', onPointerMove);\r
    window.removeEventListener('scroll', arbitrate, { capture: true });\r
    document.documentElement.removeEventListener('pointerleave', onLeave);\r
    window.removeEventListener('blur', onLeave);\r
  };\r
};\r
\r
const Magnet = ({\r
  children,\r
  padding = 100,\r
  disabled = false,\r
  magnetStrength = 2,\r
  maxOffset,\r
  exclusive = true,\r
  axis = 'both',\r
  tilt = 0,\r
  scale = 1,\r
  spring,\r
  onActiveChange,\r
  wrapperClassName = '',\r
  innerClassName = '',\r
  style,\r
  ...props\r
}) => {\r
  const wrapperRef = useRef(null);\r
  const innerRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    padding: Math.max(0, padding),\r
    disabled,\r
    strength: Math.max(0.1, magnetStrength),\r
    maxOffset,\r
    exclusive,\r
    axis,\r
    tilt,\r
    scale,\r
    stiffness: Math.max(1, spring?.stiffness ?? DEFAULT_SPRING.stiffness),\r
    damping: Math.max(0, spring?.damping ?? DEFAULT_SPRING.damping),\r
    mass: Math.max(0.01, spring?.mass ?? DEFAULT_SPRING.mass),\r
    onActiveChange\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const wrapper = wrapperRef.current;\r
    const inner = innerRef.current;\r
    if (!wrapper || !inner) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const current = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 1 };\r
    const velocity = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 0 };\r
    let active = false;\r
    let raf = 0;\r
    let last = 0;\r
\r
    const solve = (target, dt) => {\r
      const s = settingsRef.current;\r
      let resting = true;\r
      Object.keys(current).forEach(key => {\r
        const force = s.stiffness * (target[key] - current[key]) - s.damping * velocity[key];\r
        velocity[key] += (force / s.mass) * dt;\r
        current[key] += velocity[key] * dt;\r
        const epsilon = key === 'scale' ? 0.001 : 0.05;\r
        if (Math.abs(target[key] - current[key]) > epsilon || Math.abs(velocity[key]) > epsilon) resting = false;\r
      });\r
      return resting;\r
    };\r
\r
    const measure = () => {\r
      const s = settingsRef.current;\r
      const target = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 1 };\r
      if (s.disabled || reduce || !field.pointer) return { target, engaged: false };\r
      if (s.exclusive && field.owner !== entry) return { target, engaged: false };\r
      const rect = wrapper.getBoundingClientRect();\r
      const { dx, dy, outside } = reach(rect, field.pointer);\r
      if (outside > s.padding) return { target, engaged: false };\r
      const pull = s.padding > 0 ? 1 - smoothstep(s.padding * 0.5, s.padding, outside) : 1;\r
      let x = s.axis === 'y' ? 0 : (dx / s.strength) * pull;\r
      let y = s.axis === 'x' ? 0 : (dy / s.strength) * pull;\r
      if (s.maxOffset !== undefined && s.maxOffset !== null) {\r
        const length = Math.hypot(x, y);\r
        if (length > s.maxOffset) {\r
          x *= s.maxOffset / length;\r
          y *= s.maxOffset / length;\r
        }\r
      }\r
      const nx = Math.max(-1, Math.min(1, dx / Math.max(rect.width / 2, 1)));\r
      const ny = Math.max(-1, Math.min(1, dy / Math.max(rect.height / 2, 1)));\r
      target.x = x;\r
      target.y = y;\r
      target.tiltX = -ny * s.tilt * pull;\r
      target.tiltY = nx * s.tilt * pull;\r
      target.scale = 1 + (s.scale - 1) * pull;\r
      return { target, engaged: true };\r
    };\r
\r
    const apply = () => {\r
      const { x, y, tiltX, tiltY, scale } = current;\r
      const turned = Math.abs(tiltX) > 0.01 || Math.abs(tiltY) > 0.01;\r
      inner.style.transform = \`translate3d(\${x.toFixed(2)}px, \${y.toFixed(2)}px, 0)\${\r
        turned ? \` perspective(800px) rotateX(\${tiltX.toFixed(2)}deg) rotateY(\${tiltY.toFixed(2)}deg)\` : ''\r
      }\${Math.abs(scale - 1) > 0.0005 ? \` scale(\${scale.toFixed(4)})\` : ''}\`;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;\r
      last = now;\r
      const { target, engaged } = measure();\r
      if (engaged !== active) {\r
        active = engaged;\r
        entry.active = engaged;\r
        if (engaged) wrapper.setAttribute('data-magnet-active', '');\r
        else wrapper.removeAttribute('data-magnet-active');\r
        settingsRef.current.onActiveChange?.(engaged);\r
      }\r
      const steps = Math.ceil(dt / (1 / 120));\r
      let resting = true;\r
      for (let i = 0; i < steps; i++) resting = solve(target, dt / steps);\r
      if (resting) {\r
        Object.keys(current).forEach(key => {\r
          current[key] = target[key];\r
          velocity[key] = 0;\r
        });\r
      }\r
      apply();\r
      if (!resting) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const entry = { wrapper, settings: settingsRef, reduce, wake, active: false };\r
    registry.add(entry);\r
    if (!detach) detach = attach();\r
    wakeRef.current = () => {\r
      arbitrate();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      registry.delete(entry);\r
      if (field.owner === entry) field.owner = null;\r
      if (!registry.size && detach) {\r
        detach();\r
        detach = null;\r
      }\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={wrapperRef}\r
      className={wrapperClassName}\r
      style={{ position: 'relative', display: 'inline-block', ...style }}\r
      {...props}\r
    >\r
      <div ref={innerRef} className={innerClassName} style={{ willChange: 'transform' }}>\r
        {children}\r
      </div>\r
    </div>\r
  );\r
};\r
\r
export default Magnet;\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const DEFAULT_SPRING = { stiffness: 170, damping: 16, mass: 1 };\r
\r
const smoothstep = (edge0, edge1, value) => {\r
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const registry = new Set();\r
const field = { pointer: null, owner: null };\r
let detach = null;\r
\r
const reach = (rect, pointer) => {\r
  const dx = pointer.x - (rect.left + rect.width / 2);\r
  const dy = pointer.y - (rect.top + rect.height / 2);\r
  const outside = Math.hypot(Math.max(0, Math.abs(dx) - rect.width / 2), Math.max(0, Math.abs(dy) - rect.height / 2));\r
  return { dx, dy, outside };\r
};\r
\r
const arbitrate = () => {\r
  let winner = null;\r
  let nearest = Infinity;\r
  let closest = Infinity;\r
  for (const entry of registry) {\r
    const s = entry.settings.current;\r
    let near = null;\r
    if (field.pointer && !s.disabled && !entry.reduce) {\r
      near = reach(entry.wrapper.getBoundingClientRect(), field.pointer);\r
      if (near.outside > s.padding) near = null;\r
    }\r
    if (!s.exclusive) {\r
      if (near || entry.active) entry.wake();\r
      continue;\r
    }\r
    if (!near) continue;\r
    const center = Math.hypot(near.dx, near.dy);\r
    if (near.outside < nearest || (near.outside === nearest && center < closest)) {\r
      winner = entry;\r
      nearest = near.outside;\r
      closest = center;\r
    }\r
  }\r
  const previous = field.owner;\r
  field.owner = winner;\r
  if (previous && previous !== winner) previous.wake();\r
  if (winner) winner.wake();\r
};\r
\r
const attach = () => {\r
  const onPointerMove = event => {\r
    if (event.pointerType === 'touch') return;\r
    field.pointer = { x: event.clientX, y: event.clientY };\r
    arbitrate();\r
  };\r
  const onLeave = () => {\r
    field.pointer = null;\r
    arbitrate();\r
  };\r
  window.addEventListener('pointermove', onPointerMove, { passive: true });\r
  window.addEventListener('scroll', arbitrate, { passive: true, capture: true });\r
  document.documentElement.addEventListener('pointerleave', onLeave);\r
  window.addEventListener('blur', onLeave);\r
  return () => {\r
    window.removeEventListener('pointermove', onPointerMove);\r
    window.removeEventListener('scroll', arbitrate, { capture: true });\r
    document.documentElement.removeEventListener('pointerleave', onLeave);\r
    window.removeEventListener('blur', onLeave);\r
  };\r
};\r
\r
const Magnet = ({\r
  children,\r
  padding = 100,\r
  disabled = false,\r
  magnetStrength = 2,\r
  maxOffset,\r
  exclusive = true,\r
  axis = 'both',\r
  tilt = 0,\r
  scale = 1,\r
  spring,\r
  onActiveChange,\r
  wrapperClassName = '',\r
  innerClassName = '',\r
  style,\r
  ...props\r
}) => {\r
  const wrapperRef = useRef(null);\r
  const innerRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    padding: Math.max(0, padding),\r
    disabled,\r
    strength: Math.max(0.1, magnetStrength),\r
    maxOffset,\r
    exclusive,\r
    axis,\r
    tilt,\r
    scale,\r
    stiffness: Math.max(1, spring?.stiffness ?? DEFAULT_SPRING.stiffness),\r
    damping: Math.max(0, spring?.damping ?? DEFAULT_SPRING.damping),\r
    mass: Math.max(0.01, spring?.mass ?? DEFAULT_SPRING.mass),\r
    onActiveChange\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const wrapper = wrapperRef.current;\r
    const inner = innerRef.current;\r
    if (!wrapper || !inner) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const current = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 1 };\r
    const velocity = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 0 };\r
    let active = false;\r
    let raf = 0;\r
    let last = 0;\r
\r
    const solve = (target, dt) => {\r
      const s = settingsRef.current;\r
      let resting = true;\r
      Object.keys(current).forEach(key => {\r
        const force = s.stiffness * (target[key] - current[key]) - s.damping * velocity[key];\r
        velocity[key] += (force / s.mass) * dt;\r
        current[key] += velocity[key] * dt;\r
        const epsilon = key === 'scale' ? 0.001 : 0.05;\r
        if (Math.abs(target[key] - current[key]) > epsilon || Math.abs(velocity[key]) > epsilon) resting = false;\r
      });\r
      return resting;\r
    };\r
\r
    const measure = () => {\r
      const s = settingsRef.current;\r
      const target = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 1 };\r
      if (s.disabled || reduce || !field.pointer) return { target, engaged: false };\r
      if (s.exclusive && field.owner !== entry) return { target, engaged: false };\r
      const rect = wrapper.getBoundingClientRect();\r
      const { dx, dy, outside } = reach(rect, field.pointer);\r
      if (outside > s.padding) return { target, engaged: false };\r
      const pull = s.padding > 0 ? 1 - smoothstep(s.padding * 0.5, s.padding, outside) : 1;\r
      let x = s.axis === 'y' ? 0 : (dx / s.strength) * pull;\r
      let y = s.axis === 'x' ? 0 : (dy / s.strength) * pull;\r
      if (s.maxOffset !== undefined && s.maxOffset !== null) {\r
        const length = Math.hypot(x, y);\r
        if (length > s.maxOffset) {\r
          x *= s.maxOffset / length;\r
          y *= s.maxOffset / length;\r
        }\r
      }\r
      const nx = Math.max(-1, Math.min(1, dx / Math.max(rect.width / 2, 1)));\r
      const ny = Math.max(-1, Math.min(1, dy / Math.max(rect.height / 2, 1)));\r
      target.x = x;\r
      target.y = y;\r
      target.tiltX = -ny * s.tilt * pull;\r
      target.tiltY = nx * s.tilt * pull;\r
      target.scale = 1 + (s.scale - 1) * pull;\r
      return { target, engaged: true };\r
    };\r
\r
    const apply = () => {\r
      const { x, y, tiltX, tiltY, scale } = current;\r
      const turned = Math.abs(tiltX) > 0.01 || Math.abs(tiltY) > 0.01;\r
      inner.style.transform = \`translate3d(\${x.toFixed(2)}px, \${y.toFixed(2)}px, 0)\${\r
        turned ? \` perspective(800px) rotateX(\${tiltX.toFixed(2)}deg) rotateY(\${tiltY.toFixed(2)}deg)\` : ''\r
      }\${Math.abs(scale - 1) > 0.0005 ? \` scale(\${scale.toFixed(4)})\` : ''}\`;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;\r
      last = now;\r
      const { target, engaged } = measure();\r
      if (engaged !== active) {\r
        active = engaged;\r
        entry.active = engaged;\r
        if (engaged) wrapper.setAttribute('data-magnet-active', '');\r
        else wrapper.removeAttribute('data-magnet-active');\r
        settingsRef.current.onActiveChange?.(engaged);\r
      }\r
      const steps = Math.ceil(dt / (1 / 120));\r
      let resting = true;\r
      for (let i = 0; i < steps; i++) resting = solve(target, dt / steps);\r
      if (resting) {\r
        Object.keys(current).forEach(key => {\r
          current[key] = target[key];\r
          velocity[key] = 0;\r
        });\r
      }\r
      apply();\r
      if (!resting) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const entry = { wrapper, settings: settingsRef, reduce, wake, active: false };\r
    registry.add(entry);\r
    if (!detach) detach = attach();\r
    wakeRef.current = () => {\r
      arbitrate();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      registry.delete(entry);\r
      if (field.owner === entry) field.owner = null;\r
      if (!registry.size && detach) {\r
        detach();\r
        detach = null;\r
      }\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={wrapperRef}\r
      className={wrapperClassName}\r
      style={{ position: 'relative', display: 'inline-block', ...style }}\r
      {...props}\r
    >\r
      <div ref={innerRef} className={innerClassName} style={{ willChange: 'transform' }}>\r
        {children}\r
      </div>\r
    </div>\r
  );\r
};\r
\r
export default Magnet;\r
`,r=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';\r
\r
export type MagnetAxis = 'both' | 'x' | 'y';\r
\r
export interface MagnetSpring {\r
  stiffness?: number;\r
  damping?: number;\r
  mass?: number;\r
}\r
\r
export interface MagnetProps extends HTMLAttributes<HTMLDivElement> {\r
  children: ReactNode;\r
  padding?: number;\r
  disabled?: boolean;\r
  magnetStrength?: number;\r
  maxOffset?: number;\r
  exclusive?: boolean;\r
  axis?: MagnetAxis;\r
  tilt?: number;\r
  scale?: number;\r
  spring?: MagnetSpring;\r
  onActiveChange?: (active: boolean) => void;\r
  wrapperClassName?: string;\r
  innerClassName?: string;\r
}\r
\r
type Motion = { x: number; y: number; tiltX: number; tiltY: number; scale: number };\r
\r
type Point = { x: number; y: number };\r
\r
type Settings = {\r
  padding: number;\r
  disabled: boolean;\r
  strength: number;\r
  maxOffset?: number;\r
  exclusive: boolean;\r
  axis: MagnetAxis;\r
  tilt: number;\r
  scale: number;\r
  stiffness: number;\r
  damping: number;\r
  mass: number;\r
  onActiveChange?: (active: boolean) => void;\r
};\r
\r
type Entry = {\r
  wrapper: HTMLDivElement;\r
  settings: { current: Settings };\r
  reduce: boolean;\r
  wake: () => void;\r
  active: boolean;\r
};\r
\r
const DEFAULT_SPRING = { stiffness: 170, damping: 16, mass: 1 };\r
\r
const smoothstep = (edge0: number, edge1: number, value: number) => {\r
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const registry = new Set<Entry>();\r
const field: { pointer: Point | null; owner: Entry | null } = { pointer: null, owner: null };\r
let detach: (() => void) | null = null;\r
\r
const reach = (rect: DOMRect, pointer: Point) => {\r
  const dx = pointer.x - (rect.left + rect.width / 2);\r
  const dy = pointer.y - (rect.top + rect.height / 2);\r
  const outside = Math.hypot(Math.max(0, Math.abs(dx) - rect.width / 2), Math.max(0, Math.abs(dy) - rect.height / 2));\r
  return { dx, dy, outside };\r
};\r
\r
const arbitrate = () => {\r
  let winner: Entry | null = null;\r
  let nearest = Infinity;\r
  let closest = Infinity;\r
  for (const entry of registry) {\r
    const s = entry.settings.current;\r
    let near: { dx: number; dy: number; outside: number } | null = null;\r
    if (field.pointer && !s.disabled && !entry.reduce) {\r
      near = reach(entry.wrapper.getBoundingClientRect(), field.pointer);\r
      if (near.outside > s.padding) near = null;\r
    }\r
    if (!s.exclusive) {\r
      if (near || entry.active) entry.wake();\r
      continue;\r
    }\r
    if (!near) continue;\r
    const center = Math.hypot(near.dx, near.dy);\r
    if (near.outside < nearest || (near.outside === nearest && center < closest)) {\r
      winner = entry;\r
      nearest = near.outside;\r
      closest = center;\r
    }\r
  }\r
  const previous = field.owner;\r
  field.owner = winner;\r
  if (previous && previous !== winner) previous.wake();\r
  if (winner) winner.wake();\r
};\r
\r
const attach = () => {\r
  const onPointerMove = (event: PointerEvent) => {\r
    if (event.pointerType === 'touch') return;\r
    field.pointer = { x: event.clientX, y: event.clientY };\r
    arbitrate();\r
  };\r
  const onLeave = () => {\r
    field.pointer = null;\r
    arbitrate();\r
  };\r
  window.addEventListener('pointermove', onPointerMove, { passive: true });\r
  window.addEventListener('scroll', arbitrate, { passive: true, capture: true });\r
  document.documentElement.addEventListener('pointerleave', onLeave);\r
  window.addEventListener('blur', onLeave);\r
  return () => {\r
    window.removeEventListener('pointermove', onPointerMove);\r
    window.removeEventListener('scroll', arbitrate, { capture: true });\r
    document.documentElement.removeEventListener('pointerleave', onLeave);\r
    window.removeEventListener('blur', onLeave);\r
  };\r
};\r
\r
const Magnet = ({\r
  children,\r
  padding = 100,\r
  disabled = false,\r
  magnetStrength = 2,\r
  maxOffset,\r
  exclusive = true,\r
  axis = 'both',\r
  tilt = 0,\r
  scale = 1,\r
  spring,\r
  onActiveChange,\r
  wrapperClassName = '',\r
  innerClassName = '',\r
  style,\r
  ...props\r
}: MagnetProps) => {\r
  const wrapperRef = useRef<HTMLDivElement>(null);\r
  const innerRef = useRef<HTMLDivElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    padding: Math.max(0, padding),\r
    disabled,\r
    strength: Math.max(0.1, magnetStrength),\r
    maxOffset,\r
    exclusive,\r
    axis,\r
    tilt,\r
    scale,\r
    stiffness: Math.max(1, spring?.stiffness ?? DEFAULT_SPRING.stiffness),\r
    damping: Math.max(0, spring?.damping ?? DEFAULT_SPRING.damping),\r
    mass: Math.max(0.01, spring?.mass ?? DEFAULT_SPRING.mass),\r
    onActiveChange\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const wrapper = wrapperRef.current;\r
    const inner = innerRef.current;\r
    if (!wrapper || !inner) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const current: Motion = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 1 };\r
    const velocity: Motion = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 0 };\r
    let active = false;\r
    let raf = 0;\r
    let last = 0;\r
\r
    const solve = (target: Motion, dt: number) => {\r
      const s = settingsRef.current;\r
      let resting = true;\r
      (Object.keys(current) as (keyof Motion)[]).forEach(key => {\r
        const force = s.stiffness * (target[key] - current[key]) - s.damping * velocity[key];\r
        velocity[key] += (force / s.mass) * dt;\r
        current[key] += velocity[key] * dt;\r
        const epsilon = key === 'scale' ? 0.001 : 0.05;\r
        if (Math.abs(target[key] - current[key]) > epsilon || Math.abs(velocity[key]) > epsilon) resting = false;\r
      });\r
      return resting;\r
    };\r
\r
    const measure = () => {\r
      const s = settingsRef.current;\r
      const target: Motion = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 1 };\r
      if (s.disabled || reduce || !field.pointer) return { target, engaged: false };\r
      if (s.exclusive && field.owner !== entry) return { target, engaged: false };\r
      const rect = wrapper.getBoundingClientRect();\r
      const { dx, dy, outside } = reach(rect, field.pointer);\r
      if (outside > s.padding) return { target, engaged: false };\r
      const pull = s.padding > 0 ? 1 - smoothstep(s.padding * 0.5, s.padding, outside) : 1;\r
      let x = s.axis === 'y' ? 0 : (dx / s.strength) * pull;\r
      let y = s.axis === 'x' ? 0 : (dy / s.strength) * pull;\r
      if (s.maxOffset !== undefined && s.maxOffset !== null) {\r
        const length = Math.hypot(x, y);\r
        if (length > s.maxOffset) {\r
          x *= s.maxOffset / length;\r
          y *= s.maxOffset / length;\r
        }\r
      }\r
      const nx = Math.max(-1, Math.min(1, dx / Math.max(rect.width / 2, 1)));\r
      const ny = Math.max(-1, Math.min(1, dy / Math.max(rect.height / 2, 1)));\r
      target.x = x;\r
      target.y = y;\r
      target.tiltX = -ny * s.tilt * pull;\r
      target.tiltY = nx * s.tilt * pull;\r
      target.scale = 1 + (s.scale - 1) * pull;\r
      return { target, engaged: true };\r
    };\r
\r
    const apply = () => {\r
      const { x, y, tiltX, tiltY, scale } = current;\r
      const turned = Math.abs(tiltX) > 0.01 || Math.abs(tiltY) > 0.01;\r
      inner.style.transform = \`translate3d(\${x.toFixed(2)}px, \${y.toFixed(2)}px, 0)\${\r
        turned ? \` perspective(800px) rotateX(\${tiltX.toFixed(2)}deg) rotateY(\${tiltY.toFixed(2)}deg)\` : ''\r
      }\${Math.abs(scale - 1) > 0.0005 ? \` scale(\${scale.toFixed(4)})\` : ''}\`;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;\r
      last = now;\r
      const { target, engaged } = measure();\r
      if (engaged !== active) {\r
        active = engaged;\r
        entry.active = engaged;\r
        if (engaged) wrapper.setAttribute('data-magnet-active', '');\r
        else wrapper.removeAttribute('data-magnet-active');\r
        settingsRef.current.onActiveChange?.(engaged);\r
      }\r
      const steps = Math.ceil(dt / (1 / 120));\r
      let resting = true;\r
      for (let i = 0; i < steps; i++) resting = solve(target, dt / steps);\r
      if (resting) {\r
        (Object.keys(current) as (keyof Motion)[]).forEach(key => {\r
          current[key] = target[key];\r
          velocity[key] = 0;\r
        });\r
      }\r
      apply();\r
      if (!resting) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const entry: Entry = { wrapper, settings: settingsRef, reduce, wake, active: false };\r
    registry.add(entry);\r
    if (!detach) detach = attach();\r
    wakeRef.current = () => {\r
      arbitrate();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      registry.delete(entry);\r
      if (field.owner === entry) field.owner = null;\r
      if (!registry.size && detach) {\r
        detach();\r
        detach = null;\r
      }\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={wrapperRef}\r
      className={wrapperClassName}\r
      style={{ position: 'relative', display: 'inline-block', ...style }}\r
      {...props}\r
    >\r
      <div ref={innerRef} className={innerClassName} style={{ willChange: 'transform' }}>\r
        {children}\r
      </div>\r
    </div>\r
  );\r
};\r
\r
export default Magnet;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';\r
\r
export type MagnetAxis = 'both' | 'x' | 'y';\r
\r
export interface MagnetSpring {\r
  stiffness?: number;\r
  damping?: number;\r
  mass?: number;\r
}\r
\r
export interface MagnetProps extends HTMLAttributes<HTMLDivElement> {\r
  children: ReactNode;\r
  padding?: number;\r
  disabled?: boolean;\r
  magnetStrength?: number;\r
  maxOffset?: number;\r
  exclusive?: boolean;\r
  axis?: MagnetAxis;\r
  tilt?: number;\r
  scale?: number;\r
  spring?: MagnetSpring;\r
  onActiveChange?: (active: boolean) => void;\r
  wrapperClassName?: string;\r
  innerClassName?: string;\r
}\r
\r
type Motion = { x: number; y: number; tiltX: number; tiltY: number; scale: number };\r
\r
type Point = { x: number; y: number };\r
\r
type Settings = {\r
  padding: number;\r
  disabled: boolean;\r
  strength: number;\r
  maxOffset?: number;\r
  exclusive: boolean;\r
  axis: MagnetAxis;\r
  tilt: number;\r
  scale: number;\r
  stiffness: number;\r
  damping: number;\r
  mass: number;\r
  onActiveChange?: (active: boolean) => void;\r
};\r
\r
type Entry = {\r
  wrapper: HTMLDivElement;\r
  settings: { current: Settings };\r
  reduce: boolean;\r
  wake: () => void;\r
  active: boolean;\r
};\r
\r
const DEFAULT_SPRING = { stiffness: 170, damping: 16, mass: 1 };\r
\r
const smoothstep = (edge0: number, edge1: number, value: number) => {\r
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const registry = new Set<Entry>();\r
const field: { pointer: Point | null; owner: Entry | null } = { pointer: null, owner: null };\r
let detach: (() => void) | null = null;\r
\r
const reach = (rect: DOMRect, pointer: Point) => {\r
  const dx = pointer.x - (rect.left + rect.width / 2);\r
  const dy = pointer.y - (rect.top + rect.height / 2);\r
  const outside = Math.hypot(Math.max(0, Math.abs(dx) - rect.width / 2), Math.max(0, Math.abs(dy) - rect.height / 2));\r
  return { dx, dy, outside };\r
};\r
\r
const arbitrate = () => {\r
  let winner: Entry | null = null;\r
  let nearest = Infinity;\r
  let closest = Infinity;\r
  for (const entry of registry) {\r
    const s = entry.settings.current;\r
    let near: { dx: number; dy: number; outside: number } | null = null;\r
    if (field.pointer && !s.disabled && !entry.reduce) {\r
      near = reach(entry.wrapper.getBoundingClientRect(), field.pointer);\r
      if (near.outside > s.padding) near = null;\r
    }\r
    if (!s.exclusive) {\r
      if (near || entry.active) entry.wake();\r
      continue;\r
    }\r
    if (!near) continue;\r
    const center = Math.hypot(near.dx, near.dy);\r
    if (near.outside < nearest || (near.outside === nearest && center < closest)) {\r
      winner = entry;\r
      nearest = near.outside;\r
      closest = center;\r
    }\r
  }\r
  const previous = field.owner;\r
  field.owner = winner;\r
  if (previous && previous !== winner) previous.wake();\r
  if (winner) winner.wake();\r
};\r
\r
const attach = () => {\r
  const onPointerMove = (event: PointerEvent) => {\r
    if (event.pointerType === 'touch') return;\r
    field.pointer = { x: event.clientX, y: event.clientY };\r
    arbitrate();\r
  };\r
  const onLeave = () => {\r
    field.pointer = null;\r
    arbitrate();\r
  };\r
  window.addEventListener('pointermove', onPointerMove, { passive: true });\r
  window.addEventListener('scroll', arbitrate, { passive: true, capture: true });\r
  document.documentElement.addEventListener('pointerleave', onLeave);\r
  window.addEventListener('blur', onLeave);\r
  return () => {\r
    window.removeEventListener('pointermove', onPointerMove);\r
    window.removeEventListener('scroll', arbitrate, { capture: true });\r
    document.documentElement.removeEventListener('pointerleave', onLeave);\r
    window.removeEventListener('blur', onLeave);\r
  };\r
};\r
\r
const Magnet = ({\r
  children,\r
  padding = 100,\r
  disabled = false,\r
  magnetStrength = 2,\r
  maxOffset,\r
  exclusive = true,\r
  axis = 'both',\r
  tilt = 0,\r
  scale = 1,\r
  spring,\r
  onActiveChange,\r
  wrapperClassName = '',\r
  innerClassName = '',\r
  style,\r
  ...props\r
}: MagnetProps) => {\r
  const wrapperRef = useRef<HTMLDivElement>(null);\r
  const innerRef = useRef<HTMLDivElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    padding: Math.max(0, padding),\r
    disabled,\r
    strength: Math.max(0.1, magnetStrength),\r
    maxOffset,\r
    exclusive,\r
    axis,\r
    tilt,\r
    scale,\r
    stiffness: Math.max(1, spring?.stiffness ?? DEFAULT_SPRING.stiffness),\r
    damping: Math.max(0, spring?.damping ?? DEFAULT_SPRING.damping),\r
    mass: Math.max(0.01, spring?.mass ?? DEFAULT_SPRING.mass),\r
    onActiveChange\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const wrapper = wrapperRef.current;\r
    const inner = innerRef.current;\r
    if (!wrapper || !inner) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const current: Motion = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 1 };\r
    const velocity: Motion = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 0 };\r
    let active = false;\r
    let raf = 0;\r
    let last = 0;\r
\r
    const solve = (target: Motion, dt: number) => {\r
      const s = settingsRef.current;\r
      let resting = true;\r
      (Object.keys(current) as (keyof Motion)[]).forEach(key => {\r
        const force = s.stiffness * (target[key] - current[key]) - s.damping * velocity[key];\r
        velocity[key] += (force / s.mass) * dt;\r
        current[key] += velocity[key] * dt;\r
        const epsilon = key === 'scale' ? 0.001 : 0.05;\r
        if (Math.abs(target[key] - current[key]) > epsilon || Math.abs(velocity[key]) > epsilon) resting = false;\r
      });\r
      return resting;\r
    };\r
\r
    const measure = () => {\r
      const s = settingsRef.current;\r
      const target: Motion = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 1 };\r
      if (s.disabled || reduce || !field.pointer) return { target, engaged: false };\r
      if (s.exclusive && field.owner !== entry) return { target, engaged: false };\r
      const rect = wrapper.getBoundingClientRect();\r
      const { dx, dy, outside } = reach(rect, field.pointer);\r
      if (outside > s.padding) return { target, engaged: false };\r
      const pull = s.padding > 0 ? 1 - smoothstep(s.padding * 0.5, s.padding, outside) : 1;\r
      let x = s.axis === 'y' ? 0 : (dx / s.strength) * pull;\r
      let y = s.axis === 'x' ? 0 : (dy / s.strength) * pull;\r
      if (s.maxOffset !== undefined && s.maxOffset !== null) {\r
        const length = Math.hypot(x, y);\r
        if (length > s.maxOffset) {\r
          x *= s.maxOffset / length;\r
          y *= s.maxOffset / length;\r
        }\r
      }\r
      const nx = Math.max(-1, Math.min(1, dx / Math.max(rect.width / 2, 1)));\r
      const ny = Math.max(-1, Math.min(1, dy / Math.max(rect.height / 2, 1)));\r
      target.x = x;\r
      target.y = y;\r
      target.tiltX = -ny * s.tilt * pull;\r
      target.tiltY = nx * s.tilt * pull;\r
      target.scale = 1 + (s.scale - 1) * pull;\r
      return { target, engaged: true };\r
    };\r
\r
    const apply = () => {\r
      const { x, y, tiltX, tiltY, scale } = current;\r
      const turned = Math.abs(tiltX) > 0.01 || Math.abs(tiltY) > 0.01;\r
      inner.style.transform = \`translate3d(\${x.toFixed(2)}px, \${y.toFixed(2)}px, 0)\${\r
        turned ? \` perspective(800px) rotateX(\${tiltX.toFixed(2)}deg) rotateY(\${tiltY.toFixed(2)}deg)\` : ''\r
      }\${Math.abs(scale - 1) > 0.0005 ? \` scale(\${scale.toFixed(4)})\` : ''}\`;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;\r
      last = now;\r
      const { target, engaged } = measure();\r
      if (engaged !== active) {\r
        active = engaged;\r
        entry.active = engaged;\r
        if (engaged) wrapper.setAttribute('data-magnet-active', '');\r
        else wrapper.removeAttribute('data-magnet-active');\r
        settingsRef.current.onActiveChange?.(engaged);\r
      }\r
      const steps = Math.ceil(dt / (1 / 120));\r
      let resting = true;\r
      for (let i = 0; i < steps; i++) resting = solve(target, dt / steps);\r
      if (resting) {\r
        (Object.keys(current) as (keyof Motion)[]).forEach(key => {\r
          current[key] = target[key];\r
          velocity[key] = 0;\r
        });\r
      }\r
      apply();\r
      if (!resting) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const entry: Entry = { wrapper, settings: settingsRef, reduce, wake, active: false };\r
    registry.add(entry);\r
    if (!detach) detach = attach();\r
    wakeRef.current = () => {\r
      arbitrate();\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      registry.delete(entry);\r
      if (field.owner === entry) field.owner = null;\r
      if (!registry.size && detach) {\r
        detach();\r
        detach = null;\r
      }\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={wrapperRef}\r
      className={wrapperClassName}\r
      style={{ position: 'relative', display: 'inline-block', ...style }}\r
      {...props}\r
    >\r
      <div ref={innerRef} className={innerClassName} style={{ willChange: 'transform' }}>\r
        {children}\r
      </div>\r
    </div>\r
  );\r
};\r
\r
export default Magnet;\r
`,s={usage:`import Magnet from './Magnet'

<Magnet padding={100} magnetStrength={2}>
  <button>Star React Bits on GitHub</button>
</Magnet>`,code:n,tailwind:e,tsCode:r,tsTailwind:t};export{s as magnet};
