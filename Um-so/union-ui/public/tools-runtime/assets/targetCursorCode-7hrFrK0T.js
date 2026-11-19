const n=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import { createPortal } from 'react-dom';\r
import './TargetCursor.css';\r
\r
const CORNER_ANGLES = [0, 90, 180, 270];\r
const QUARTER = Math.PI / 2;\r
\r
const spring = (state, goal, stiffness, damping, dt) => {\r
  const steps = 2;\r
  const h = dt / steps;\r
  for (let i = 0; i < steps; i++) {\r
    state.v += (stiffness * (goal - state.x) - damping * state.v) * h;\r
    state.x += state.v * h;\r
  }\r
};\r
\r
const resolveElement = value => (value && 'current' in value ? value.current : value) || null;\r
\r
const TargetCursor = ({\r
  targetSelector = '.cursor-target',\r
  cursorColor = '#ffffff',\r
  cursorColorOnTarget,\r
  spinDuration = 2,\r
  hoverDuration = 0.2,\r
  parallaxOn = true,\r
  hideDefaultCursor = true,\r
  size = 36,\r
  cornerSize = 12,\r
  thickness = 3,\r
  padding = 6,\r
  matchRadius = true,\r
  dotSize = 4,\r
  blendMode = 'difference',\r
  showLabel = true,\r
  clickEffect = true,\r
  container\r
}) => {\r
  const [host, setHost] = useState(null);\r
  const rootRef = useRef(null);\r
  const cornerRefs = useRef([]);\r
  const dotRef = useRef(null);\r
  const labelRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    targetSelector,\r
    cursorColor,\r
    cursorColorOnTarget,\r
    spinDuration,\r
    hoverDuration: Math.max(0.05, hoverDuration),\r
    parallaxOn,\r
    hideDefaultCursor,\r
    size: Math.max(4, size),\r
    cornerSize: Math.max(2, cornerSize),\r
    thickness: Math.max(0.5, thickness),\r
    padding,\r
    matchRadius,\r
    dotSize: Math.max(0, dotSize),\r
    showLabel,\r
    clickEffect,\r
    container\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');\r
    const update = () => setHost(finePointer.matches ? document.body : null);\r
    update();\r
    finePointer.addEventListener('change', update);\r
    return () => finePointer.removeEventListener('change', update);\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!host || !root) return undefined;\r
\r
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const style = document.createElement('style');\r
    document.head.appendChild(style);\r
\r
    const pointer = { x: 0, y: 0, inside: false, seen: false, pressed: false };\r
    const centerX = { x: 0, v: 0 };\r
    const centerY = { x: 0, v: 0 };\r
    const halfW = { x: 0, v: 0 };\r
    const halfH = { x: 0, v: 0 };\r
    const radius = { x: 0, v: 0 };\r
    const turn = { x: 0, v: 0 };\r
    const lock = { x: 0, v: 0 };\r
    const press = { x: 0, v: 0 };\r
    const presence = { x: 0, v: 0 };\r
    let target = null;\r
    let targetRadius = 0;\r
    let quarter = 0;\r
    let spinSpeed = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let lastLabel = '';\r
    let lastColor = '';\r
    let lastScope = null;\r
\r
    const scopeOf = () => resolveElement(settingsRef.current.container);\r
\r
    const hideCursor = () => {\r
      const s = settingsRef.current;\r
      const scope = scopeOf();\r
      if (scope !== lastScope) {\r
        lastScope?.removeAttribute('data-target-cursor-scope');\r
        scope?.setAttribute('data-target-cursor-scope', '');\r
        lastScope = scope;\r
      }\r
      const selector = scope ? '[data-target-cursor-scope]' : 'html';\r
      const rule =\r
        s.hideDefaultCursor && pointer.inside ? \`\${selector}, \${selector} * { cursor: none !important; }\` : '';\r
      if (style.textContent !== rule) style.textContent = rule;\r
    };\r
\r
    const findTarget = (x, y, element) => {\r
      const s = settingsRef.current;\r
      const node = element || document.elementFromPoint(x, y);\r
      const found = node?.closest?.(s.targetSelector) || null;\r
      const scope = scopeOf();\r
      if (found && scope && !scope.contains(found)) return null;\r
      return found;\r
    };\r
\r
    const lockOn = next => {\r
      if (next === target) return;\r
      target = next;\r
      if (target) {\r
        const angle = turn.x;\r
        quarter = Math.round(angle / QUARTER);\r
        const corner = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;\r
        targetRadius = corner;\r
        spinSpeed = 0;\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
\r
      if (target && !target.isConnected) lockOn(null);\r
      const rect = target ? target.getBoundingClientRect() : null;\r
      const locked = !!rect && pointer.inside;\r
      const snapW = 4.6 / s.hoverDuration;\r
      const snapK = snapW * snapW;\r
      const snapC = 2 * 0.62 * snapW;\r
\r
      spring(presence, pointer.inside ? 1 : 0, 260, 32, dt);\r
      spring(lock, locked ? 1 : 0, snapK, 2 * snapW, dt);\r
      spring(press, pointer.pressed && s.clickEffect ? 1 : 0, 900, 40, dt);\r
\r
      let goalX = pointer.x;\r
      let goalY = pointer.y;\r
      let goalW = s.size / 2;\r
      let goalH = s.size / 2;\r
      let goalR = Math.min(2, s.cornerSize / 4);\r
      if (locked) {\r
        const cx = rect.left + rect.width / 2;\r
        const cy = rect.top + rect.height / 2;\r
        const lean = s.parallaxOn ? 0.08 : 0;\r
        goalX = cx + (pointer.x - cx) * lean;\r
        goalY = cy + (pointer.y - cy) * lean;\r
        const odd = Math.abs(quarter) % 2 === 1;\r
        const w = rect.width / 2 + s.padding;\r
        const h = rect.height / 2 + s.padding;\r
        goalW = odd ? h : w;\r
        goalH = odd ? w : h;\r
        goalR = s.matchRadius ? Math.min(targetRadius + Math.max(0, s.padding), s.cornerSize) : 0;\r
      }\r
\r
      if (!pointer.inside && presence.x < 0.01) pointer.seen = false;\r
      if (!pointer.seen) {\r
        centerX.x = goalX;\r
        centerY.x = goalY;\r
        halfW.x = goalW;\r
        halfH.x = goalH;\r
        pointer.seen = pointer.inside;\r
      }\r
\r
      const follow = locked ? snapK : 2200;\r
      const followC = locked ? snapC : 2 * Math.sqrt(2200);\r
      spring(centerX, goalX, follow, followC, dt);\r
      spring(centerY, goalY, follow, followC, dt);\r
      spring(halfW, goalW, snapK, snapC, dt);\r
      spring(halfH, goalH, snapK, snapC, dt);\r
      spring(radius, goalR, snapK, 2 * snapW, dt);\r
\r
      if (locked) {\r
        spring(turn, quarter * QUARTER, snapK, snapC, dt);\r
      } else {\r
        const speed = s.spinDuration > 0 && !reduce ? (Math.PI * 2) / s.spinDuration : 0;\r
        spinSpeed += (speed - spinSpeed) * (1 - Math.exp(-dt * 3));\r
        turn.v = spinSpeed;\r
        turn.x += spinSpeed * dt;\r
      }\r
\r
      const squeeze = 1 - press.x * 0.14;\r
      const cos = Math.cos(turn.x);\r
      const sin = Math.sin(turn.x);\r
      const w = Math.max(0, halfW.x) * squeeze;\r
      const h = Math.max(0, halfH.x) * squeeze;\r
      const local = [\r
        [-w, -h],\r
        [w, -h],\r
        [w, h],\r
        [-w, h]\r
      ];\r
      const r = Math.max(0, Math.min(radius.x, s.cornerSize));\r
      const degrees = (turn.x * 180) / Math.PI;\r
      let left = Infinity;\r
      let top = Infinity;\r
      cornerRefs.current.forEach((corner, i) => {\r
        if (!corner) return;\r
        const [lx, ly] = local[i];\r
        const x = centerX.x + lx * cos - ly * sin;\r
        const y = centerY.x + lx * sin + ly * cos;\r
        left = Math.min(left, x);\r
        top = Math.min(top, y);\r
        corner.style.transform = \`translate3d(\${x.toFixed(2)}px, \${y.toFixed(2)}px, 0) rotate(\${(CORNER_ANGLES[i] + degrees).toFixed(2)}deg)\`;\r
        corner.style.width = \`\${s.cornerSize}px\`;\r
        corner.style.height = \`\${s.cornerSize}px\`;\r
        corner.style.borderWidth = \`\${s.thickness}px 0 0 \${s.thickness}px\`;\r
        corner.style.borderTopLeftRadius = \`\${r.toFixed(2)}px\`;\r
      });\r
\r
      const dot = dotRef.current;\r
      if (dot) {\r
        const dotScale = 1 - press.x * 0.35;\r
        dot.style.transform = \`translate3d(\${pointer.x}px, \${pointer.y}px, 0) translate(-50%, -50%) scale(\${dotScale.toFixed(3)})\`;\r
        dot.style.width = \`\${s.dotSize}px\`;\r
        dot.style.height = \`\${s.dotSize}px\`;\r
      }\r
\r
      const label = labelRef.current;\r
      if (label) {\r
        const text = s.showLabel && target ? target.getAttribute('data-cursor-label') || '' : '';\r
        if (text && text !== lastLabel) label.textContent = text;\r
        if (text) lastLabel = text;\r
        const shown = text ? Math.max(0, Math.min(1, lock.x)) : 0;\r
        label.style.transform = \`translate3d(\${left.toFixed(2)}px, \${(top - 8).toFixed(2)}px, 0) translateY(-100%) translateY(\${((1 - shown) * 4).toFixed(2)}px)\`;\r
        label.style.opacity = shown.toFixed(3);\r
      }\r
\r
      const mix = s.cursorColorOnTarget ? Math.round(Math.max(0, Math.min(1, lock.x)) * 100) : 0;\r
      const color = mix ? \`color-mix(in oklab, \${s.cursorColorOnTarget} \${mix}%, \${s.cursorColor})\` : s.cursorColor;\r
      if (color !== lastColor) {\r
        root.style.setProperty('--target-cursor-color', color);\r
        lastColor = color;\r
      }\r
      root.style.opacity = Math.max(0, Math.min(1, presence.x)).toFixed(3);\r
\r
      const resting =\r
        !pointer.inside &&\r
        presence.x < 0.002 &&\r
        Math.abs(presence.v) < 0.002 &&\r
        Math.abs(lock.x) < 0.002 &&\r
        Math.abs(press.x) < 0.002;\r
      const spinning = pointer.inside && !locked && spinSpeed > 0.0001;\r
      const moving =\r
        Math.abs(centerX.v) + Math.abs(centerY.v) + Math.abs(halfW.v) + Math.abs(halfH.v) + Math.abs(turn.v) > 0.01 ||\r
        Math.abs(goalX - centerX.x) + Math.abs(goalY - centerY.x) > 0.05 ||\r
        Math.abs(lock.v) + Math.abs(press.v) + Math.abs(presence.v) > 0.001;\r
      if (!resting && (spinning || moving || locked)) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf) raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      hideCursor();\r
      wake();\r
    };\r
\r
    const insideScope = (x, y, element) => {\r
      const scope = scopeOf();\r
      if (!scope) return true;\r
      if (element && scope.contains(element)) return true;\r
      const box = scope.getBoundingClientRect();\r
      return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;\r
    };\r
\r
    const onPointerMove = event => {\r
      if (event.pointerType && event.pointerType !== 'mouse') return;\r
      pointer.x = event.clientX;\r
      pointer.y = event.clientY;\r
      const inside = insideScope(pointer.x, pointer.y, event.target);\r
      if (inside !== pointer.inside) {\r
        pointer.inside = inside;\r
        hideCursor();\r
      }\r
      lockOn(inside ? findTarget(pointer.x, pointer.y, event.target) : null);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      if (event.pointerType && event.pointerType !== 'mouse') return;\r
      pointer.pressed = true;\r
      wake();\r
    };\r
\r
    const onPointerUp = () => {\r
      pointer.pressed = false;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.pressed = false;\r
      lockOn(null);\r
      hideCursor();\r
      wake();\r
    };\r
\r
    const onScroll = () => {\r
      if (!pointer.inside) return;\r
      lockOn(findTarget(pointer.x, pointer.y));\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('scroll', onScroll, { capture: true });\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      lastScope?.removeAttribute('data-target-cursor-scope');\r
      style.remove();\r
    };\r
  }, [host]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  if (!host) return null;\r
\r
  return createPortal(\r
    <div ref={rootRef} className="target-cursor" style={{ mixBlendMode: blendMode, opacity: 0 }} aria-hidden="true">\r
      {CORNER_ANGLES.map((angle, i) => (\r
        <span\r
          key={angle}\r
          ref={element => {\r
            cornerRefs.current[i] = element;\r
          }}\r
          className="target-cursor__corner"\r
        />\r
      ))}\r
      <span ref={dotRef} className="target-cursor__dot" />\r
      <span ref={labelRef} className="target-cursor__label" />\r
    </div>,\r
    host\r
  );\r
};\r
\r
export default TargetCursor;\r
`,r=`.target-cursor {\r
  position: fixed;\r
  inset: 0;\r
  z-index: 2147483647;\r
  pointer-events: none;\r
}\r
\r
.target-cursor__corner {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  box-sizing: border-box;\r
  border-style: solid;\r
  border-color: var(--target-cursor-color, #ffffff);\r
  transform-origin: 0 0;\r
  will-change: transform;\r
}\r
\r
.target-cursor__dot {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  border-radius: 50%;\r
  background: var(--target-cursor-color, #ffffff);\r
  will-change: transform;\r
}\r
\r
.target-cursor__label {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  color: var(--target-cursor-color, #ffffff);\r
  font-size: 12px;\r
  font-weight: 500;\r
  line-height: 1;\r
  white-space: nowrap;\r
  opacity: 0;\r
  will-change: transform, opacity;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef, useState } from 'react';\r
import { createPortal } from 'react-dom';\r
\r
const CORNER_ANGLES = [0, 90, 180, 270];\r
const QUARTER = Math.PI / 2;\r
\r
const spring = (state, goal, stiffness, damping, dt) => {\r
  const steps = 2;\r
  const h = dt / steps;\r
  for (let i = 0; i < steps; i++) {\r
    state.v += (stiffness * (goal - state.x) - damping * state.v) * h;\r
    state.x += state.v * h;\r
  }\r
};\r
\r
const resolveElement = value => (value && 'current' in value ? value.current : value) || null;\r
\r
const TargetCursor = ({\r
  targetSelector = '.cursor-target',\r
  cursorColor = '#ffffff',\r
  cursorColorOnTarget,\r
  spinDuration = 2,\r
  hoverDuration = 0.2,\r
  parallaxOn = true,\r
  hideDefaultCursor = true,\r
  size = 36,\r
  cornerSize = 12,\r
  thickness = 3,\r
  padding = 6,\r
  matchRadius = true,\r
  dotSize = 4,\r
  blendMode = 'difference',\r
  showLabel = true,\r
  clickEffect = true,\r
  container\r
}) => {\r
  const [host, setHost] = useState(null);\r
  const rootRef = useRef(null);\r
  const cornerRefs = useRef([]);\r
  const dotRef = useRef(null);\r
  const labelRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    targetSelector,\r
    cursorColor,\r
    cursorColorOnTarget,\r
    spinDuration,\r
    hoverDuration: Math.max(0.05, hoverDuration),\r
    parallaxOn,\r
    hideDefaultCursor,\r
    size: Math.max(4, size),\r
    cornerSize: Math.max(2, cornerSize),\r
    thickness: Math.max(0.5, thickness),\r
    padding,\r
    matchRadius,\r
    dotSize: Math.max(0, dotSize),\r
    showLabel,\r
    clickEffect,\r
    container\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');\r
    const update = () => setHost(finePointer.matches ? document.body : null);\r
    update();\r
    finePointer.addEventListener('change', update);\r
    return () => finePointer.removeEventListener('change', update);\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!host || !root) return undefined;\r
\r
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const style = document.createElement('style');\r
    document.head.appendChild(style);\r
\r
    const pointer = { x: 0, y: 0, inside: false, seen: false, pressed: false };\r
    const centerX = { x: 0, v: 0 };\r
    const centerY = { x: 0, v: 0 };\r
    const halfW = { x: 0, v: 0 };\r
    const halfH = { x: 0, v: 0 };\r
    const radius = { x: 0, v: 0 };\r
    const turn = { x: 0, v: 0 };\r
    const lock = { x: 0, v: 0 };\r
    const press = { x: 0, v: 0 };\r
    const presence = { x: 0, v: 0 };\r
    let target = null;\r
    let targetRadius = 0;\r
    let quarter = 0;\r
    let spinSpeed = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let lastLabel = '';\r
    let lastColor = '';\r
    let lastScope = null;\r
\r
    const scopeOf = () => resolveElement(settingsRef.current.container);\r
\r
    const hideCursor = () => {\r
      const s = settingsRef.current;\r
      const scope = scopeOf();\r
      if (scope !== lastScope) {\r
        lastScope?.removeAttribute('data-target-cursor-scope');\r
        scope?.setAttribute('data-target-cursor-scope', '');\r
        lastScope = scope;\r
      }\r
      const selector = scope ? '[data-target-cursor-scope]' : 'html';\r
      const rule =\r
        s.hideDefaultCursor && pointer.inside ? \`\${selector}, \${selector} * { cursor: none !important; }\` : '';\r
      if (style.textContent !== rule) style.textContent = rule;\r
    };\r
\r
    const findTarget = (x, y, element) => {\r
      const s = settingsRef.current;\r
      const node = element || document.elementFromPoint(x, y);\r
      const found = node?.closest?.(s.targetSelector) || null;\r
      const scope = scopeOf();\r
      if (found && scope && !scope.contains(found)) return null;\r
      return found;\r
    };\r
\r
    const lockOn = next => {\r
      if (next === target) return;\r
      target = next;\r
      if (target) {\r
        const angle = turn.x;\r
        quarter = Math.round(angle / QUARTER);\r
        const corner = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;\r
        targetRadius = corner;\r
        spinSpeed = 0;\r
      }\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
\r
      if (target && !target.isConnected) lockOn(null);\r
      const rect = target ? target.getBoundingClientRect() : null;\r
      const locked = !!rect && pointer.inside;\r
      const snapW = 4.6 / s.hoverDuration;\r
      const snapK = snapW * snapW;\r
      const snapC = 2 * 0.62 * snapW;\r
\r
      spring(presence, pointer.inside ? 1 : 0, 260, 32, dt);\r
      spring(lock, locked ? 1 : 0, snapK, 2 * snapW, dt);\r
      spring(press, pointer.pressed && s.clickEffect ? 1 : 0, 900, 40, dt);\r
\r
      let goalX = pointer.x;\r
      let goalY = pointer.y;\r
      let goalW = s.size / 2;\r
      let goalH = s.size / 2;\r
      let goalR = Math.min(2, s.cornerSize / 4);\r
      if (locked) {\r
        const cx = rect.left + rect.width / 2;\r
        const cy = rect.top + rect.height / 2;\r
        const lean = s.parallaxOn ? 0.08 : 0;\r
        goalX = cx + (pointer.x - cx) * lean;\r
        goalY = cy + (pointer.y - cy) * lean;\r
        const odd = Math.abs(quarter) % 2 === 1;\r
        const w = rect.width / 2 + s.padding;\r
        const h = rect.height / 2 + s.padding;\r
        goalW = odd ? h : w;\r
        goalH = odd ? w : h;\r
        goalR = s.matchRadius ? Math.min(targetRadius + Math.max(0, s.padding), s.cornerSize) : 0;\r
      }\r
\r
      if (!pointer.inside && presence.x < 0.01) pointer.seen = false;\r
      if (!pointer.seen) {\r
        centerX.x = goalX;\r
        centerY.x = goalY;\r
        halfW.x = goalW;\r
        halfH.x = goalH;\r
        pointer.seen = pointer.inside;\r
      }\r
\r
      const follow = locked ? snapK : 2200;\r
      const followC = locked ? snapC : 2 * Math.sqrt(2200);\r
      spring(centerX, goalX, follow, followC, dt);\r
      spring(centerY, goalY, follow, followC, dt);\r
      spring(halfW, goalW, snapK, snapC, dt);\r
      spring(halfH, goalH, snapK, snapC, dt);\r
      spring(radius, goalR, snapK, 2 * snapW, dt);\r
\r
      if (locked) {\r
        spring(turn, quarter * QUARTER, snapK, snapC, dt);\r
      } else {\r
        const speed = s.spinDuration > 0 && !reduce ? (Math.PI * 2) / s.spinDuration : 0;\r
        spinSpeed += (speed - spinSpeed) * (1 - Math.exp(-dt * 3));\r
        turn.v = spinSpeed;\r
        turn.x += spinSpeed * dt;\r
      }\r
\r
      const squeeze = 1 - press.x * 0.14;\r
      const cos = Math.cos(turn.x);\r
      const sin = Math.sin(turn.x);\r
      const w = Math.max(0, halfW.x) * squeeze;\r
      const h = Math.max(0, halfH.x) * squeeze;\r
      const local = [\r
        [-w, -h],\r
        [w, -h],\r
        [w, h],\r
        [-w, h]\r
      ];\r
      const r = Math.max(0, Math.min(radius.x, s.cornerSize));\r
      const degrees = (turn.x * 180) / Math.PI;\r
      let left = Infinity;\r
      let top = Infinity;\r
      cornerRefs.current.forEach((corner, i) => {\r
        if (!corner) return;\r
        const [lx, ly] = local[i];\r
        const x = centerX.x + lx * cos - ly * sin;\r
        const y = centerY.x + lx * sin + ly * cos;\r
        left = Math.min(left, x);\r
        top = Math.min(top, y);\r
        corner.style.transform = \`translate3d(\${x.toFixed(2)}px, \${y.toFixed(2)}px, 0) rotate(\${(CORNER_ANGLES[i] + degrees).toFixed(2)}deg)\`;\r
        corner.style.width = \`\${s.cornerSize}px\`;\r
        corner.style.height = \`\${s.cornerSize}px\`;\r
        corner.style.borderWidth = \`\${s.thickness}px 0 0 \${s.thickness}px\`;\r
        corner.style.borderTopLeftRadius = \`\${r.toFixed(2)}px\`;\r
      });\r
\r
      const dot = dotRef.current;\r
      if (dot) {\r
        const dotScale = 1 - press.x * 0.35;\r
        dot.style.transform = \`translate3d(\${pointer.x}px, \${pointer.y}px, 0) translate(-50%, -50%) scale(\${dotScale.toFixed(3)})\`;\r
        dot.style.width = \`\${s.dotSize}px\`;\r
        dot.style.height = \`\${s.dotSize}px\`;\r
      }\r
\r
      const label = labelRef.current;\r
      if (label) {\r
        const text = s.showLabel && target ? target.getAttribute('data-cursor-label') || '' : '';\r
        if (text && text !== lastLabel) label.textContent = text;\r
        if (text) lastLabel = text;\r
        const shown = text ? Math.max(0, Math.min(1, lock.x)) : 0;\r
        label.style.transform = \`translate3d(\${left.toFixed(2)}px, \${(top - 8).toFixed(2)}px, 0) translateY(-100%) translateY(\${((1 - shown) * 4).toFixed(2)}px)\`;\r
        label.style.opacity = shown.toFixed(3);\r
      }\r
\r
      const mix = s.cursorColorOnTarget ? Math.round(Math.max(0, Math.min(1, lock.x)) * 100) : 0;\r
      const color = mix ? \`color-mix(in oklab, \${s.cursorColorOnTarget} \${mix}%, \${s.cursorColor})\` : s.cursorColor;\r
      if (color !== lastColor) {\r
        root.style.setProperty('--target-cursor-color', color);\r
        lastColor = color;\r
      }\r
      root.style.opacity = Math.max(0, Math.min(1, presence.x)).toFixed(3);\r
\r
      const resting =\r
        !pointer.inside &&\r
        presence.x < 0.002 &&\r
        Math.abs(presence.v) < 0.002 &&\r
        Math.abs(lock.x) < 0.002 &&\r
        Math.abs(press.x) < 0.002;\r
      const spinning = pointer.inside && !locked && spinSpeed > 0.0001;\r
      const moving =\r
        Math.abs(centerX.v) + Math.abs(centerY.v) + Math.abs(halfW.v) + Math.abs(halfH.v) + Math.abs(turn.v) > 0.01 ||\r
        Math.abs(goalX - centerX.x) + Math.abs(goalY - centerY.x) > 0.05 ||\r
        Math.abs(lock.v) + Math.abs(press.v) + Math.abs(presence.v) > 0.001;\r
      if (!resting && (spinning || moving || locked)) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf) raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      hideCursor();\r
      wake();\r
    };\r
\r
    const insideScope = (x, y, element) => {\r
      const scope = scopeOf();\r
      if (!scope) return true;\r
      if (element && scope.contains(element)) return true;\r
      const box = scope.getBoundingClientRect();\r
      return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;\r
    };\r
\r
    const onPointerMove = event => {\r
      if (event.pointerType && event.pointerType !== 'mouse') return;\r
      pointer.x = event.clientX;\r
      pointer.y = event.clientY;\r
      const inside = insideScope(pointer.x, pointer.y, event.target);\r
      if (inside !== pointer.inside) {\r
        pointer.inside = inside;\r
        hideCursor();\r
      }\r
      lockOn(inside ? findTarget(pointer.x, pointer.y, event.target) : null);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      if (event.pointerType && event.pointerType !== 'mouse') return;\r
      pointer.pressed = true;\r
      wake();\r
    };\r
\r
    const onPointerUp = () => {\r
      pointer.pressed = false;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.pressed = false;\r
      lockOn(null);\r
      hideCursor();\r
      wake();\r
    };\r
\r
    const onScroll = () => {\r
      if (!pointer.inside) return;\r
      lockOn(findTarget(pointer.x, pointer.y));\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('scroll', onScroll, { capture: true });\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      lastScope?.removeAttribute('data-target-cursor-scope');\r
      style.remove();\r
    };\r
  }, [host]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  if (!host) return null;\r
\r
  return createPortal(\r
    <div\r
      ref={rootRef}\r
      className="pointer-events-none fixed inset-0 z-[2147483647]"\r
      style={{ mixBlendMode: blendMode, opacity: 0 }}\r
      aria-hidden="true"\r
    >\r
      {CORNER_ANGLES.map((angle, i) => (\r
        <span\r
          key={angle}\r
          ref={element => {\r
            cornerRefs.current[i] = element;\r
          }}\r
          className="absolute top-0 left-0 box-border origin-top-left border-solid [border-color:var(--target-cursor-color,#ffffff)] will-change-transform"\r
        />\r
      ))}\r
      <span\r
        ref={dotRef}\r
        className="absolute top-0 left-0 rounded-full [background:var(--target-cursor-color,#ffffff)] will-change-transform"\r
      />\r
      <span\r
        ref={labelRef}\r
        className="absolute top-0 left-0 text-[12px] leading-none font-medium whitespace-nowrap opacity-0 [color:var(--target-cursor-color,#ffffff)] will-change-[transform,opacity]"\r
      />\r
    </div>,\r
    host\r
  );\r
};\r
\r
export default TargetCursor;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';\r
import { createPortal } from 'react-dom';\r
import './TargetCursor.css';\r
\r
export interface TargetCursorProps {\r
  targetSelector?: string;\r
  cursorColor?: string;\r
  cursorColorOnTarget?: string;\r
  spinDuration?: number;\r
  hoverDuration?: number;\r
  parallaxOn?: boolean;\r
  hideDefaultCursor?: boolean;\r
  size?: number;\r
  cornerSize?: number;\r
  thickness?: number;\r
  padding?: number;\r
  matchRadius?: boolean;\r
  dotSize?: number;\r
  blendMode?: CSSProperties['mixBlendMode'];\r
  showLabel?: boolean;\r
  clickEffect?: boolean;\r
  container?: RefObject<HTMLElement | null> | HTMLElement | null;\r
}\r
\r
type Spring = { x: number; v: number };\r
\r
const CORNER_ANGLES = [0, 90, 180, 270];\r
const QUARTER = Math.PI / 2;\r
\r
const spring = (state: Spring, goal: number, stiffness: number, damping: number, dt: number) => {\r
  const steps = 2;\r
  const h = dt / steps;\r
  for (let i = 0; i < steps; i++) {\r
    state.v += (stiffness * (goal - state.x) - damping * state.v) * h;\r
    state.x += state.v * h;\r
  }\r
};\r
\r
const resolveElement = (value: TargetCursorProps['container']): HTMLElement | null =>\r
  (value && 'current' in value ? value.current : value) || null;\r
\r
const TargetCursor = ({\r
  targetSelector = '.cursor-target',\r
  cursorColor = '#ffffff',\r
  cursorColorOnTarget,\r
  spinDuration = 2,\r
  hoverDuration = 0.2,\r
  parallaxOn = true,\r
  hideDefaultCursor = true,\r
  size = 36,\r
  cornerSize = 12,\r
  thickness = 3,\r
  padding = 6,\r
  matchRadius = true,\r
  dotSize = 4,\r
  blendMode = 'difference',\r
  showLabel = true,\r
  clickEffect = true,\r
  container\r
}: TargetCursorProps) => {\r
  const [host, setHost] = useState<HTMLElement | null>(null);\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const cornerRefs = useRef<(HTMLSpanElement | null)[]>([]);\r
  const dotRef = useRef<HTMLSpanElement>(null);\r
  const labelRef = useRef<HTMLSpanElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings = {\r
    targetSelector,\r
    cursorColor,\r
    cursorColorOnTarget,\r
    spinDuration,\r
    hoverDuration: Math.max(0.05, hoverDuration),\r
    parallaxOn,\r
    hideDefaultCursor,\r
    size: Math.max(4, size),\r
    cornerSize: Math.max(2, cornerSize),\r
    thickness: Math.max(0.5, thickness),\r
    padding,\r
    matchRadius,\r
    dotSize: Math.max(0, dotSize),\r
    showLabel,\r
    clickEffect,\r
    container\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');\r
    const update = () => setHost(finePointer.matches ? document.body : null);\r
    update();\r
    finePointer.addEventListener('change', update);\r
    return () => finePointer.removeEventListener('change', update);\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!host || !root) return undefined;\r
\r
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const style = document.createElement('style');\r
    document.head.appendChild(style);\r
\r
    const pointer = { x: 0, y: 0, inside: false, seen: false, pressed: false };\r
    const centerX = { x: 0, v: 0 };\r
    const centerY = { x: 0, v: 0 };\r
    const halfW = { x: 0, v: 0 };\r
    const halfH = { x: 0, v: 0 };\r
    const radius = { x: 0, v: 0 };\r
    const turn = { x: 0, v: 0 };\r
    const lock = { x: 0, v: 0 };\r
    const press = { x: 0, v: 0 };\r
    const presence = { x: 0, v: 0 };\r
    let target: Element | null = null;\r
    let targetRadius = 0;\r
    let quarter = 0;\r
    let spinSpeed = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let lastLabel = '';\r
    let lastColor = '';\r
    let lastScope: HTMLElement | null = null;\r
\r
    const scopeOf = () => resolveElement(settingsRef.current.container);\r
\r
    const hideCursor = () => {\r
      const s = settingsRef.current;\r
      const scope = scopeOf();\r
      if (scope !== lastScope) {\r
        lastScope?.removeAttribute('data-target-cursor-scope');\r
        scope?.setAttribute('data-target-cursor-scope', '');\r
        lastScope = scope;\r
      }\r
      const selector = scope ? '[data-target-cursor-scope]' : 'html';\r
      const rule =\r
        s.hideDefaultCursor && pointer.inside ? \`\${selector}, \${selector} * { cursor: none !important; }\` : '';\r
      if (style.textContent !== rule) style.textContent = rule;\r
    };\r
\r
    const findTarget = (x: number, y: number, element?: Element | null): Element | null => {\r
      const s = settingsRef.current;\r
      const node = element || document.elementFromPoint(x, y);\r
      const found = node?.closest(s.targetSelector) || null;\r
      const scope = scopeOf();\r
      if (found && scope && !scope.contains(found)) return null;\r
      return found;\r
    };\r
\r
    const lockOn = (next: Element | null) => {\r
      if (next === target) return;\r
      target = next;\r
      if (target) {\r
        const angle = turn.x;\r
        quarter = Math.round(angle / QUARTER);\r
        const corner = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;\r
        targetRadius = corner;\r
        spinSpeed = 0;\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
\r
      if (target && !target.isConnected) lockOn(null);\r
      const rect = target ? target.getBoundingClientRect() : null;\r
      const locked = !!rect && pointer.inside;\r
      const snapW = 4.6 / s.hoverDuration;\r
      const snapK = snapW * snapW;\r
      const snapC = 2 * 0.62 * snapW;\r
\r
      spring(presence, pointer.inside ? 1 : 0, 260, 32, dt);\r
      spring(lock, locked ? 1 : 0, snapK, 2 * snapW, dt);\r
      spring(press, pointer.pressed && s.clickEffect ? 1 : 0, 900, 40, dt);\r
\r
      let goalX = pointer.x;\r
      let goalY = pointer.y;\r
      let goalW = s.size / 2;\r
      let goalH = s.size / 2;\r
      let goalR = Math.min(2, s.cornerSize / 4);\r
      if (locked) {\r
        const cx = rect.left + rect.width / 2;\r
        const cy = rect.top + rect.height / 2;\r
        const lean = s.parallaxOn ? 0.08 : 0;\r
        goalX = cx + (pointer.x - cx) * lean;\r
        goalY = cy + (pointer.y - cy) * lean;\r
        const odd = Math.abs(quarter) % 2 === 1;\r
        const w = rect.width / 2 + s.padding;\r
        const h = rect.height / 2 + s.padding;\r
        goalW = odd ? h : w;\r
        goalH = odd ? w : h;\r
        goalR = s.matchRadius ? Math.min(targetRadius + Math.max(0, s.padding), s.cornerSize) : 0;\r
      }\r
\r
      if (!pointer.inside && presence.x < 0.01) pointer.seen = false;\r
      if (!pointer.seen) {\r
        centerX.x = goalX;\r
        centerY.x = goalY;\r
        halfW.x = goalW;\r
        halfH.x = goalH;\r
        pointer.seen = pointer.inside;\r
      }\r
\r
      const follow = locked ? snapK : 2200;\r
      const followC = locked ? snapC : 2 * Math.sqrt(2200);\r
      spring(centerX, goalX, follow, followC, dt);\r
      spring(centerY, goalY, follow, followC, dt);\r
      spring(halfW, goalW, snapK, snapC, dt);\r
      spring(halfH, goalH, snapK, snapC, dt);\r
      spring(radius, goalR, snapK, 2 * snapW, dt);\r
\r
      if (locked) {\r
        spring(turn, quarter * QUARTER, snapK, snapC, dt);\r
      } else {\r
        const speed = s.spinDuration > 0 && !reduce ? (Math.PI * 2) / s.spinDuration : 0;\r
        spinSpeed += (speed - spinSpeed) * (1 - Math.exp(-dt * 3));\r
        turn.v = spinSpeed;\r
        turn.x += spinSpeed * dt;\r
      }\r
\r
      const squeeze = 1 - press.x * 0.14;\r
      const cos = Math.cos(turn.x);\r
      const sin = Math.sin(turn.x);\r
      const w = Math.max(0, halfW.x) * squeeze;\r
      const h = Math.max(0, halfH.x) * squeeze;\r
      const local = [\r
        [-w, -h],\r
        [w, -h],\r
        [w, h],\r
        [-w, h]\r
      ];\r
      const r = Math.max(0, Math.min(radius.x, s.cornerSize));\r
      const degrees = (turn.x * 180) / Math.PI;\r
      let left = Infinity;\r
      let top = Infinity;\r
      cornerRefs.current.forEach((corner, i) => {\r
        if (!corner) return;\r
        const [lx, ly] = local[i];\r
        const x = centerX.x + lx * cos - ly * sin;\r
        const y = centerY.x + lx * sin + ly * cos;\r
        left = Math.min(left, x);\r
        top = Math.min(top, y);\r
        corner.style.transform = \`translate3d(\${x.toFixed(2)}px, \${y.toFixed(2)}px, 0) rotate(\${(CORNER_ANGLES[i] + degrees).toFixed(2)}deg)\`;\r
        corner.style.width = \`\${s.cornerSize}px\`;\r
        corner.style.height = \`\${s.cornerSize}px\`;\r
        corner.style.borderWidth = \`\${s.thickness}px 0 0 \${s.thickness}px\`;\r
        corner.style.borderTopLeftRadius = \`\${r.toFixed(2)}px\`;\r
      });\r
\r
      const dot = dotRef.current;\r
      if (dot) {\r
        const dotScale = 1 - press.x * 0.35;\r
        dot.style.transform = \`translate3d(\${pointer.x}px, \${pointer.y}px, 0) translate(-50%, -50%) scale(\${dotScale.toFixed(3)})\`;\r
        dot.style.width = \`\${s.dotSize}px\`;\r
        dot.style.height = \`\${s.dotSize}px\`;\r
      }\r
\r
      const label = labelRef.current;\r
      if (label) {\r
        const text = s.showLabel && target ? target.getAttribute('data-cursor-label') || '' : '';\r
        if (text && text !== lastLabel) label.textContent = text;\r
        if (text) lastLabel = text;\r
        const shown = text ? Math.max(0, Math.min(1, lock.x)) : 0;\r
        label.style.transform = \`translate3d(\${left.toFixed(2)}px, \${(top - 8).toFixed(2)}px, 0) translateY(-100%) translateY(\${((1 - shown) * 4).toFixed(2)}px)\`;\r
        label.style.opacity = shown.toFixed(3);\r
      }\r
\r
      const mix = s.cursorColorOnTarget ? Math.round(Math.max(0, Math.min(1, lock.x)) * 100) : 0;\r
      const color = mix ? \`color-mix(in oklab, \${s.cursorColorOnTarget} \${mix}%, \${s.cursorColor})\` : s.cursorColor;\r
      if (color !== lastColor) {\r
        root.style.setProperty('--target-cursor-color', color);\r
        lastColor = color;\r
      }\r
      root.style.opacity = Math.max(0, Math.min(1, presence.x)).toFixed(3);\r
\r
      const resting =\r
        !pointer.inside &&\r
        presence.x < 0.002 &&\r
        Math.abs(presence.v) < 0.002 &&\r
        Math.abs(lock.x) < 0.002 &&\r
        Math.abs(press.x) < 0.002;\r
      const spinning = pointer.inside && !locked && spinSpeed > 0.0001;\r
      const moving =\r
        Math.abs(centerX.v) + Math.abs(centerY.v) + Math.abs(halfW.v) + Math.abs(halfH.v) + Math.abs(turn.v) > 0.01 ||\r
        Math.abs(goalX - centerX.x) + Math.abs(goalY - centerY.x) > 0.05 ||\r
        Math.abs(lock.v) + Math.abs(press.v) + Math.abs(presence.v) > 0.001;\r
      if (!resting && (spinning || moving || locked)) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf) raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      hideCursor();\r
      wake();\r
    };\r
\r
    const insideScope = (x: number, y: number, element?: Element | null) => {\r
      const scope = scopeOf();\r
      if (!scope) return true;\r
      if (element && scope.contains(element)) return true;\r
      const box = scope.getBoundingClientRect();\r
      return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      if (event.pointerType && event.pointerType !== 'mouse') return;\r
      pointer.x = event.clientX;\r
      pointer.y = event.clientY;\r
      const inside = insideScope(pointer.x, pointer.y, event.target as Element | null);\r
      if (inside !== pointer.inside) {\r
        pointer.inside = inside;\r
        hideCursor();\r
      }\r
      lockOn(inside ? findTarget(pointer.x, pointer.y, event.target as Element | null) : null);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      if (event.pointerType && event.pointerType !== 'mouse') return;\r
      pointer.pressed = true;\r
      wake();\r
    };\r
\r
    const onPointerUp = () => {\r
      pointer.pressed = false;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.pressed = false;\r
      lockOn(null);\r
      hideCursor();\r
      wake();\r
    };\r
\r
    const onScroll = () => {\r
      if (!pointer.inside) return;\r
      lockOn(findTarget(pointer.x, pointer.y));\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('scroll', onScroll, { capture: true });\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      lastScope?.removeAttribute('data-target-cursor-scope');\r
      style.remove();\r
    };\r
  }, [host]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  if (!host) return null;\r
\r
  return createPortal(\r
    <div ref={rootRef} className="target-cursor" style={{ mixBlendMode: blendMode, opacity: 0 }} aria-hidden="true">\r
      {CORNER_ANGLES.map((angle, i) => (\r
        <span\r
          key={angle}\r
          ref={element => {\r
            cornerRefs.current[i] = element;\r
          }}\r
          className="target-cursor__corner"\r
        />\r
      ))}\r
      <span ref={dotRef} className="target-cursor__dot" />\r
      <span ref={labelRef} className="target-cursor__label" />\r
    </div>,\r
    host\r
  );\r
};\r
\r
export default TargetCursor;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';\r
import { createPortal } from 'react-dom';\r
\r
export interface TargetCursorProps {\r
  targetSelector?: string;\r
  cursorColor?: string;\r
  cursorColorOnTarget?: string;\r
  spinDuration?: number;\r
  hoverDuration?: number;\r
  parallaxOn?: boolean;\r
  hideDefaultCursor?: boolean;\r
  size?: number;\r
  cornerSize?: number;\r
  thickness?: number;\r
  padding?: number;\r
  matchRadius?: boolean;\r
  dotSize?: number;\r
  blendMode?: CSSProperties['mixBlendMode'];\r
  showLabel?: boolean;\r
  clickEffect?: boolean;\r
  container?: RefObject<HTMLElement | null> | HTMLElement | null;\r
}\r
\r
type Spring = { x: number; v: number };\r
\r
const CORNER_ANGLES = [0, 90, 180, 270];\r
const QUARTER = Math.PI / 2;\r
\r
const spring = (state: Spring, goal: number, stiffness: number, damping: number, dt: number) => {\r
  const steps = 2;\r
  const h = dt / steps;\r
  for (let i = 0; i < steps; i++) {\r
    state.v += (stiffness * (goal - state.x) - damping * state.v) * h;\r
    state.x += state.v * h;\r
  }\r
};\r
\r
const resolveElement = (value: TargetCursorProps['container']): HTMLElement | null =>\r
  (value && 'current' in value ? value.current : value) || null;\r
\r
const TargetCursor = ({\r
  targetSelector = '.cursor-target',\r
  cursorColor = '#ffffff',\r
  cursorColorOnTarget,\r
  spinDuration = 2,\r
  hoverDuration = 0.2,\r
  parallaxOn = true,\r
  hideDefaultCursor = true,\r
  size = 36,\r
  cornerSize = 12,\r
  thickness = 3,\r
  padding = 6,\r
  matchRadius = true,\r
  dotSize = 4,\r
  blendMode = 'difference',\r
  showLabel = true,\r
  clickEffect = true,\r
  container\r
}: TargetCursorProps) => {\r
  const [host, setHost] = useState<HTMLElement | null>(null);\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const cornerRefs = useRef<(HTMLSpanElement | null)[]>([]);\r
  const dotRef = useRef<HTMLSpanElement>(null);\r
  const labelRef = useRef<HTMLSpanElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings = {\r
    targetSelector,\r
    cursorColor,\r
    cursorColorOnTarget,\r
    spinDuration,\r
    hoverDuration: Math.max(0.05, hoverDuration),\r
    parallaxOn,\r
    hideDefaultCursor,\r
    size: Math.max(4, size),\r
    cornerSize: Math.max(2, cornerSize),\r
    thickness: Math.max(0.5, thickness),\r
    padding,\r
    matchRadius,\r
    dotSize: Math.max(0, dotSize),\r
    showLabel,\r
    clickEffect,\r
    container\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');\r
    const update = () => setHost(finePointer.matches ? document.body : null);\r
    update();\r
    finePointer.addEventListener('change', update);\r
    return () => finePointer.removeEventListener('change', update);\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!host || !root) return undefined;\r
\r
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
    const style = document.createElement('style');\r
    document.head.appendChild(style);\r
\r
    const pointer = { x: 0, y: 0, inside: false, seen: false, pressed: false };\r
    const centerX = { x: 0, v: 0 };\r
    const centerY = { x: 0, v: 0 };\r
    const halfW = { x: 0, v: 0 };\r
    const halfH = { x: 0, v: 0 };\r
    const radius = { x: 0, v: 0 };\r
    const turn = { x: 0, v: 0 };\r
    const lock = { x: 0, v: 0 };\r
    const press = { x: 0, v: 0 };\r
    const presence = { x: 0, v: 0 };\r
    let target: Element | null = null;\r
    let targetRadius = 0;\r
    let quarter = 0;\r
    let spinSpeed = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let lastLabel = '';\r
    let lastColor = '';\r
    let lastScope: HTMLElement | null = null;\r
\r
    const scopeOf = () => resolveElement(settingsRef.current.container);\r
\r
    const hideCursor = () => {\r
      const s = settingsRef.current;\r
      const scope = scopeOf();\r
      if (scope !== lastScope) {\r
        lastScope?.removeAttribute('data-target-cursor-scope');\r
        scope?.setAttribute('data-target-cursor-scope', '');\r
        lastScope = scope;\r
      }\r
      const selector = scope ? '[data-target-cursor-scope]' : 'html';\r
      const rule =\r
        s.hideDefaultCursor && pointer.inside ? \`\${selector}, \${selector} * { cursor: none !important; }\` : '';\r
      if (style.textContent !== rule) style.textContent = rule;\r
    };\r
\r
    const findTarget = (x: number, y: number, element?: Element | null): Element | null => {\r
      const s = settingsRef.current;\r
      const node = element || document.elementFromPoint(x, y);\r
      const found = node?.closest(s.targetSelector) || null;\r
      const scope = scopeOf();\r
      if (found && scope && !scope.contains(found)) return null;\r
      return found;\r
    };\r
\r
    const lockOn = (next: Element | null) => {\r
      if (next === target) return;\r
      target = next;\r
      if (target) {\r
        const angle = turn.x;\r
        quarter = Math.round(angle / QUARTER);\r
        const corner = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;\r
        targetRadius = corner;\r
        spinSpeed = 0;\r
      }\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
\r
      if (target && !target.isConnected) lockOn(null);\r
      const rect = target ? target.getBoundingClientRect() : null;\r
      const locked = !!rect && pointer.inside;\r
      const snapW = 4.6 / s.hoverDuration;\r
      const snapK = snapW * snapW;\r
      const snapC = 2 * 0.62 * snapW;\r
\r
      spring(presence, pointer.inside ? 1 : 0, 260, 32, dt);\r
      spring(lock, locked ? 1 : 0, snapK, 2 * snapW, dt);\r
      spring(press, pointer.pressed && s.clickEffect ? 1 : 0, 900, 40, dt);\r
\r
      let goalX = pointer.x;\r
      let goalY = pointer.y;\r
      let goalW = s.size / 2;\r
      let goalH = s.size / 2;\r
      let goalR = Math.min(2, s.cornerSize / 4);\r
      if (locked) {\r
        const cx = rect.left + rect.width / 2;\r
        const cy = rect.top + rect.height / 2;\r
        const lean = s.parallaxOn ? 0.08 : 0;\r
        goalX = cx + (pointer.x - cx) * lean;\r
        goalY = cy + (pointer.y - cy) * lean;\r
        const odd = Math.abs(quarter) % 2 === 1;\r
        const w = rect.width / 2 + s.padding;\r
        const h = rect.height / 2 + s.padding;\r
        goalW = odd ? h : w;\r
        goalH = odd ? w : h;\r
        goalR = s.matchRadius ? Math.min(targetRadius + Math.max(0, s.padding), s.cornerSize) : 0;\r
      }\r
\r
      if (!pointer.inside && presence.x < 0.01) pointer.seen = false;\r
      if (!pointer.seen) {\r
        centerX.x = goalX;\r
        centerY.x = goalY;\r
        halfW.x = goalW;\r
        halfH.x = goalH;\r
        pointer.seen = pointer.inside;\r
      }\r
\r
      const follow = locked ? snapK : 2200;\r
      const followC = locked ? snapC : 2 * Math.sqrt(2200);\r
      spring(centerX, goalX, follow, followC, dt);\r
      spring(centerY, goalY, follow, followC, dt);\r
      spring(halfW, goalW, snapK, snapC, dt);\r
      spring(halfH, goalH, snapK, snapC, dt);\r
      spring(radius, goalR, snapK, 2 * snapW, dt);\r
\r
      if (locked) {\r
        spring(turn, quarter * QUARTER, snapK, snapC, dt);\r
      } else {\r
        const speed = s.spinDuration > 0 && !reduce ? (Math.PI * 2) / s.spinDuration : 0;\r
        spinSpeed += (speed - spinSpeed) * (1 - Math.exp(-dt * 3));\r
        turn.v = spinSpeed;\r
        turn.x += spinSpeed * dt;\r
      }\r
\r
      const squeeze = 1 - press.x * 0.14;\r
      const cos = Math.cos(turn.x);\r
      const sin = Math.sin(turn.x);\r
      const w = Math.max(0, halfW.x) * squeeze;\r
      const h = Math.max(0, halfH.x) * squeeze;\r
      const local = [\r
        [-w, -h],\r
        [w, -h],\r
        [w, h],\r
        [-w, h]\r
      ];\r
      const r = Math.max(0, Math.min(radius.x, s.cornerSize));\r
      const degrees = (turn.x * 180) / Math.PI;\r
      let left = Infinity;\r
      let top = Infinity;\r
      cornerRefs.current.forEach((corner, i) => {\r
        if (!corner) return;\r
        const [lx, ly] = local[i];\r
        const x = centerX.x + lx * cos - ly * sin;\r
        const y = centerY.x + lx * sin + ly * cos;\r
        left = Math.min(left, x);\r
        top = Math.min(top, y);\r
        corner.style.transform = \`translate3d(\${x.toFixed(2)}px, \${y.toFixed(2)}px, 0) rotate(\${(CORNER_ANGLES[i] + degrees).toFixed(2)}deg)\`;\r
        corner.style.width = \`\${s.cornerSize}px\`;\r
        corner.style.height = \`\${s.cornerSize}px\`;\r
        corner.style.borderWidth = \`\${s.thickness}px 0 0 \${s.thickness}px\`;\r
        corner.style.borderTopLeftRadius = \`\${r.toFixed(2)}px\`;\r
      });\r
\r
      const dot = dotRef.current;\r
      if (dot) {\r
        const dotScale = 1 - press.x * 0.35;\r
        dot.style.transform = \`translate3d(\${pointer.x}px, \${pointer.y}px, 0) translate(-50%, -50%) scale(\${dotScale.toFixed(3)})\`;\r
        dot.style.width = \`\${s.dotSize}px\`;\r
        dot.style.height = \`\${s.dotSize}px\`;\r
      }\r
\r
      const label = labelRef.current;\r
      if (label) {\r
        const text = s.showLabel && target ? target.getAttribute('data-cursor-label') || '' : '';\r
        if (text && text !== lastLabel) label.textContent = text;\r
        if (text) lastLabel = text;\r
        const shown = text ? Math.max(0, Math.min(1, lock.x)) : 0;\r
        label.style.transform = \`translate3d(\${left.toFixed(2)}px, \${(top - 8).toFixed(2)}px, 0) translateY(-100%) translateY(\${((1 - shown) * 4).toFixed(2)}px)\`;\r
        label.style.opacity = shown.toFixed(3);\r
      }\r
\r
      const mix = s.cursorColorOnTarget ? Math.round(Math.max(0, Math.min(1, lock.x)) * 100) : 0;\r
      const color = mix ? \`color-mix(in oklab, \${s.cursorColorOnTarget} \${mix}%, \${s.cursorColor})\` : s.cursorColor;\r
      if (color !== lastColor) {\r
        root.style.setProperty('--target-cursor-color', color);\r
        lastColor = color;\r
      }\r
      root.style.opacity = Math.max(0, Math.min(1, presence.x)).toFixed(3);\r
\r
      const resting =\r
        !pointer.inside &&\r
        presence.x < 0.002 &&\r
        Math.abs(presence.v) < 0.002 &&\r
        Math.abs(lock.x) < 0.002 &&\r
        Math.abs(press.x) < 0.002;\r
      const spinning = pointer.inside && !locked && spinSpeed > 0.0001;\r
      const moving =\r
        Math.abs(centerX.v) + Math.abs(centerY.v) + Math.abs(halfW.v) + Math.abs(halfH.v) + Math.abs(turn.v) > 0.01 ||\r
        Math.abs(goalX - centerX.x) + Math.abs(goalY - centerY.x) > 0.05 ||\r
        Math.abs(lock.v) + Math.abs(press.v) + Math.abs(presence.v) > 0.001;\r
      if (!resting && (spinning || moving || locked)) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf) raf = requestAnimationFrame(frame);\r
    };\r
    wakeRef.current = () => {\r
      hideCursor();\r
      wake();\r
    };\r
\r
    const insideScope = (x: number, y: number, element?: Element | null) => {\r
      const scope = scopeOf();\r
      if (!scope) return true;\r
      if (element && scope.contains(element)) return true;\r
      const box = scope.getBoundingClientRect();\r
      return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      if (event.pointerType && event.pointerType !== 'mouse') return;\r
      pointer.x = event.clientX;\r
      pointer.y = event.clientY;\r
      const inside = insideScope(pointer.x, pointer.y, event.target as Element | null);\r
      if (inside !== pointer.inside) {\r
        pointer.inside = inside;\r
        hideCursor();\r
      }\r
      lockOn(inside ? findTarget(pointer.x, pointer.y, event.target as Element | null) : null);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      if (event.pointerType && event.pointerType !== 'mouse') return;\r
      pointer.pressed = true;\r
      wake();\r
    };\r
\r
    const onPointerUp = () => {\r
      pointer.pressed = false;\r
      wake();\r
    };\r
\r
    const onLeave = () => {\r
      pointer.inside = false;\r
      pointer.pressed = false;\r
      lockOn(null);\r
      hideCursor();\r
      wake();\r
    };\r
\r
    const onScroll = () => {\r
      if (!pointer.inside) return;\r
      lockOn(findTarget(pointer.x, pointer.y));\r
      wake();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    window.addEventListener('blur', onLeave);\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('scroll', onScroll, { capture: true });\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      window.removeEventListener('blur', onLeave);\r
      lastScope?.removeAttribute('data-target-cursor-scope');\r
      style.remove();\r
    };\r
  }, [host]);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  if (!host) return null;\r
\r
  return createPortal(\r
    <div\r
      ref={rootRef}\r
      className="pointer-events-none fixed inset-0 z-[2147483647]"\r
      style={{ mixBlendMode: blendMode, opacity: 0 }}\r
      aria-hidden="true"\r
    >\r
      {CORNER_ANGLES.map((angle, i) => (\r
        <span\r
          key={angle}\r
          ref={element => {\r
            cornerRefs.current[i] = element;\r
          }}\r
          className="absolute top-0 left-0 box-border origin-top-left border-solid [border-color:var(--target-cursor-color,#ffffff)] will-change-transform"\r
        />\r
      ))}\r
      <span\r
        ref={dotRef}\r
        className="absolute top-0 left-0 rounded-full [background:var(--target-cursor-color,#ffffff)] will-change-transform"\r
      />\r
      <span\r
        ref={labelRef}\r
        className="absolute top-0 left-0 text-[12px] leading-none font-medium whitespace-nowrap opacity-0 [color:var(--target-cursor-color,#ffffff)] will-change-[transform,opacity]"\r
      />\r
    </div>,\r
    host\r
  );\r
};\r
\r
export default TargetCursor;\r
`,s={usage:`import TargetCursor from './TargetCursor';

export default function App() {
  return (
    <div>
      <TargetCursor spinDuration={2} hideDefaultCursor parallaxOn />

      <h1>Hover over the elements below</h1>
      <button className="cursor-target" data-cursor-label="Open">Click me!</button>
      <div className="cursor-target">Hover target</div>
    </div>
  );
}`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{s as targetCursor};
