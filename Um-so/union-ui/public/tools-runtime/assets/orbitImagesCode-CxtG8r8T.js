const n=`'use client';\r
\r
// Component created by Dominik Koch\r
// https://x.com/dominikkoch\r
\r
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';\r
import './OrbitImages.css';\r
\r
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const SAMPLES = 720;\r
const FRONT_GROW = 0.3;\r
const BACK_SHRINK = 0.45;\r
const BACK_DIM = 0.55;\r
const INTRO_SPREAD = 1.3;\r
const INTRO_FADE = 0.45;\r
const DRAG_THRESHOLD = 5;\r
\r
function generateEllipsePath(cx, cy, rx, ry) {\r
  return \`M \${cx - rx} \${cy} A \${rx} \${ry} 0 1 0 \${cx + rx} \${cy} A \${rx} \${ry} 0 1 0 \${cx - rx} \${cy}\`;\r
}\r
\r
function generateCirclePath(cx, cy, r) {\r
  return generateEllipsePath(cx, cy, r, r);\r
}\r
\r
function generateSquarePath(cx, cy, size) {\r
  const h = size / 2;\r
  return \`M \${cx - h} \${cy - h} L \${cx + h} \${cy - h} L \${cx + h} \${cy + h} L \${cx - h} \${cy + h} Z\`;\r
}\r
\r
function generateRectanglePath(cx, cy, w, h) {\r
  const hw = w / 2;\r
  const hh = h / 2;\r
  return \`M \${cx - hw} \${cy - hh} L \${cx + hw} \${cy - hh} L \${cx + hw} \${cy + hh} L \${cx - hw} \${cy + hh} Z\`;\r
}\r
\r
function generateTrianglePath(cx, cy, size) {\r
  const height = (size * Math.sqrt(3)) / 2;\r
  const hs = size / 2;\r
  return \`M \${cx} \${cy - height / 1.5} L \${cx + hs} \${cy + height / 3} L \${cx - hs} \${cy + height / 3} Z\`;\r
}\r
\r
function generateStarPath(cx, cy, outerR, innerR, points) {\r
  const step = Math.PI / points;\r
  let path = '';\r
  for (let i = 0; i < 2 * points; i++) {\r
    const r = i % 2 === 0 ? outerR : innerR;\r
    const angle = i * step - Math.PI / 2;\r
    const x = cx + r * Math.cos(angle);\r
    const y = cy + r * Math.sin(angle);\r
    path += i === 0 ? \`M \${x} \${y}\` : \` L \${x} \${y}\`;\r
  }\r
  return path + ' Z';\r
}\r
\r
function generateHeartPath(cx, cy, size) {\r
  const s = size / 30;\r
  return \`M \${cx} \${cy + 12 * s} C \${cx - 20 * s} \${cy - 5 * s}, \${cx - 12 * s} \${cy - 18 * s}, \${cx} \${cy - 8 * s} C \${cx + 12 * s} \${cy - 18 * s}, \${cx + 20 * s} \${cy - 5 * s}, \${cx} \${cy + 12 * s}\`;\r
}\r
\r
function generateInfinityPath(cx, cy, w, h) {\r
  const hw = w / 2;\r
  const hh = h / 2;\r
  return \`M \${cx} \${cy} C \${cx + hw * 0.5} \${cy - hh}, \${cx + hw} \${cy - hh}, \${cx + hw} \${cy} C \${cx + hw} \${cy + hh}, \${cx + hw * 0.5} \${cy + hh}, \${cx} \${cy} C \${cx - hw * 0.5} \${cy + hh}, \${cx - hw} \${cy + hh}, \${cx - hw} \${cy} C \${cx - hw} \${cy - hh}, \${cx - hw * 0.5} \${cy - hh}, \${cx} \${cy}\`;\r
}\r
\r
function generateWavePath(cx, cy, w, amplitude, waves) {\r
  const pts = [];\r
  const segs = waves * 20;\r
  const hw = w / 2;\r
  for (let i = 0; i <= segs; i++) {\r
    const x = cx - hw + (w * i) / segs;\r
    const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;\r
    pts.push(i === 0 ? \`M \${x} \${y}\` : \`L \${x} \${y}\`);\r
  }\r
  for (let i = segs; i >= 0; i--) {\r
    const x = cx - hw + (w * i) / segs;\r
    const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;\r
    pts.push(\`L \${x} \${y}\`);\r
  }\r
  return pts.join(' ') + ' Z';\r
}\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toCssLength = value => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const wrapSigned = value => value - Math.round(value);\r
\r
const cubicBezier = (x1, y1, x2, y2) => {\r
  const sample = (a1, a2, t) => ((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t * t + 3 * a1 * t;\r
  const slope = (a1, a2, t) => 3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;\r
  return x => {\r
    if (x <= 0 || x >= 1) return x;\r
    let t = x;\r
    for (let i = 0; i < 8; i++) {\r
      const s = slope(x1, x2, t);\r
      if (Math.abs(s) < 1e-6) break;\r
      t = clamp(t - (sample(x1, x2, t) - x) / s, 0, 1);\r
    }\r
    return sample(y1, y2, t);\r
  };\r
};\r
\r
const EASINGS = {\r
  linear: t => t,\r
  easeIn: cubicBezier(0.42, 0, 1, 1),\r
  easeOut: cubicBezier(0, 0, 0.58, 1),\r
  easeInOut: cubicBezier(0.42, 0, 0.58, 1)\r
};\r
\r
const easeOutQuint = t => 1 - Math.pow(1 - t, 5);\r
\r
const estimateAspect = ({ shape, radiusX, radiusY, radius, itemSize }) => {\r
  const wide = shape === 'ellipse' || shape === 'rectangle' || shape === 'infinity' || shape === 'wave';\r
  const w = (wide ? radiusX : radius) * 2 + itemSize * 1.6;\r
  const h = (wide ? radiusY : radius) * 2 + itemSize * 1.6;\r
  return w > 0 && h > 0 ? w / h : 1;\r
};\r
\r
const createEngine = (root, config, setAspect) => {\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const st = {\r
    lut: null,\r
    length: 0,\r
    front: 0,\r
    yMid: 0,\r
    yHalf: 1,\r
    bbox: [0, 0, 1, 1],\r
    width: 0,\r
    height: 0,\r
    scale: 0,\r
    size: 0,\r
    items: [],\r
    strokes: [],\r
    lap: 0,\r
    manual: 0,\r
    glide: 0,\r
    speed: 1,\r
    drag: null,\r
    seek: null,\r
    hovered: false,\r
    hoverIndex: -1,\r
    suppressUntil: 0,\r
    introStart: -1,\r
    introDone: !config.current.intro,\r
    visible: typeof IntersectionObserver === 'undefined',\r
    reduced: !!query?.matches,\r
    raf: 0,\r
    last: 0,\r
    destroyed: false\r
  };\r
  st.speed = st.reduced || config.current.paused ? 0 : 1;\r
\r
  const collect = () => {\r
    st.items = Array.from(root.querySelectorAll('[data-orbit-item]')).map(el => ({ el, t: '', o: '', z: '' }));\r
    st.strokes = Array.from(root.querySelectorAll('[data-orbit-stroke]'));\r
  };\r
\r
  const build = () => {\r
    const cfg = config.current;\r
    const path = root.querySelector('[data-orbit-path]');\r
    let length = 0;\r
    try {\r
      length = path ? path.getTotalLength() : 0;\r
    } catch {\r
      length = 0;\r
    }\r
    if (!path || !length || !isFinite(length)) {\r
      st.lut = null;\r
      return;\r
    }\r
    const lut = new Float32Array(SAMPLES * 2);\r
    const angle = (cfg.rotation * Math.PI) / 180;\r
    const cos = Math.cos(angle);\r
    const sin = Math.sin(angle);\r
    const origin = cfg.baseWidth / 2;\r
    let x0 = Infinity;\r
    let x1 = -Infinity;\r
    let y0 = Infinity;\r
    let y1 = -Infinity;\r
    let front = 0;\r
    for (let i = 0; i < SAMPLES; i++) {\r
      const point = path.getPointAtLength((i / SAMPLES) * length);\r
      const dx = point.x - origin;\r
      const dy = point.y - origin;\r
      const x = origin + dx * cos - dy * sin;\r
      const y = origin + dx * sin + dy * cos;\r
      lut[i * 2] = x;\r
      lut[i * 2 + 1] = y;\r
      x0 = Math.min(x0, x);\r
      x1 = Math.max(x1, x);\r
      y0 = Math.min(y0, y);\r
      y1 = Math.max(y1, y);\r
      if (y > lut[front * 2 + 1] + 1e-6) front = i;\r
    }\r
    st.lut = lut;\r
    st.length = length;\r
    st.front = front / SAMPLES;\r
    st.yMid = (y0 + y1) / 2;\r
    st.yHalf = Math.max(1e-3, (y1 - y0) / 2);\r
    const depth = clamp(cfg.depth, 0, 1);\r
    const margin = (cfg.itemSize / 2) * (1 + depth * FRONT_GROW) * Math.max(1, cfg.hoverScale) + 2;\r
    st.bbox = [x0 - margin, y0 - margin, x1 + margin, y1 + margin];\r
    setAspect((x1 - x0 + margin * 2) / (y1 - y0 + margin * 2));\r
  };\r
\r
  const layout = () => {\r
    const cfg = config.current;\r
    st.width = root.clientWidth;\r
    st.height = root.clientHeight;\r
    if (!st.lut) return;\r
    const [bx0, by0, bx1, by1] = st.bbox;\r
    const scale = Math.min(st.width / (bx1 - bx0), st.height / (by1 - by0));\r
    st.scale = scale > 0 && isFinite(scale) ? scale : 0;\r
    st.size = cfg.itemSize * st.scale;\r
    for (const it of st.items) {\r
      it.el.style.width = \`\${st.size}px\`;\r
      it.el.style.height = \`\${st.size}px\`;\r
    }\r
    if (!st.scale) return;\r
    const vw = st.width / st.scale;\r
    const vh = st.height / st.scale;\r
    const cx = (bx0 + bx1) / 2;\r
    const cy = (by0 + by1) / 2;\r
    root.querySelectorAll('[data-orbit-svg]').forEach(svg => {\r
      svg.setAttribute('viewBox', \`\${cx - vw / 2} \${cy - vh / 2} \${vw} \${vh}\`);\r
    });\r
    const clip = root.querySelector('[data-orbit-clip]');\r
    if (clip) {\r
      clip.setAttribute('x', String(cx - vw));\r
      clip.setAttribute('y', String(st.yMid));\r
      clip.setAttribute('width', String(vw * 2));\r
      clip.setAttribute('height', String(vh * 2));\r
    }\r
    for (const stroke of st.strokes) {\r
      stroke.style.strokeWidth = String(cfg.pathWidth / st.scale);\r
    }\r
    applyDash(1);\r
  };\r
\r
  const applyDash = reveal => {\r
    const cfg = config.current;\r
    const dash = cfg.pathDash > 0 && st.scale ? cfg.pathDash / st.scale : 0;\r
    for (const stroke of st.strokes) {\r
      if (reveal < 1 && !dash) {\r
        stroke.style.strokeDasharray = \`\${st.length} \${st.length}\`;\r
        stroke.style.strokeDashoffset = String(st.length * (1 - reveal));\r
        stroke.style.opacity = '';\r
      } else {\r
        stroke.style.strokeDasharray = dash ? \`\${dash} \${dash * 1.6}\` : '';\r
        stroke.style.strokeDashoffset = '';\r
        stroke.style.opacity = reveal < 1 ? String(reveal) : '';\r
      }\r
    }\r
  };\r
\r
  const sample = u => {\r
    const f = (((u % 1) + 1) % 1) * SAMPLES;\r
    const i0 = Math.floor(f) % SAMPLES;\r
    const i1 = (i0 + 1) % SAMPLES;\r
    const t = f - Math.floor(f);\r
    const lut = st.lut;\r
    return [lut[i0 * 2] + (lut[i1 * 2] - lut[i0 * 2]) * t, lut[i0 * 2 + 1] + (lut[i1 * 2 + 1] - lut[i0 * 2 + 1]) * t];\r
  };\r
\r
  const heading = u => {\r
    const a = sample(u - 2 / SAMPLES);\r
    const b = sample(u + 2 / SAMPLES);\r
    return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;\r
  };\r
\r
  const progress = () => {\r
    const cfg = config.current;\r
    const ease = EASINGS[cfg.easing] || EASINGS.linear;\r
    const whole = Math.floor(st.lap);\r
    return (whole + ease(st.lap - whole)) * (cfg.direction === 'reverse' ? -1 : 1) + st.manual;\r
  };\r
\r
  const offsetOf = (index, count) => {\r
    const cfg = config.current;\r
    if (cfg.fill) return index / Math.max(1, count);\r
    return (-index * cfg.itemSize * 1.3) / Math.max(1, st.length);\r
  };\r
\r
  const write = (it, key, prop, value) => {\r
    if (it[key] !== value) {\r
      it[key] = value;\r
      it.el.style[prop] = value;\r
    }\r
  };\r
\r
  const render = now => {\r
    const cfg = config.current;\r
    if (!st.lut || !st.scale) return;\r
    const p = progress();\r
    const count = st.items.length;\r
    const depth = clamp(cfg.depth, 0, 1);\r
    const [bx0, by0, bx1, by1] = st.bbox;\r
    const cx = (bx0 + bx1) / 2;\r
    const cy = (by0 + by1) / 2;\r
    const half = st.size / 2;\r
    const introRunning = st.introStart >= 0;\r
    const elapsed = introRunning ? (now - st.introStart) / 1000 : 0;\r
    const spread = introRunning ? easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)) : 1;\r
    const appear = introRunning ? clamp(elapsed / INTRO_FADE, 0, 1) : 1;\r
    for (let i = 0; i < count; i++) {\r
      const it = st.items[i];\r
      let u = p + offsetOf(i, count);\r
      if (introRunning) u = st.front + wrapSigned(u - st.front) * spread;\r
      const [x, y] = sample(u);\r
      const d = clamp((y - st.yMid) / st.yHalf, -1, 1);\r
      const w = (d + 1) / 2;\r
      let scale = 1 + depth * (FRONT_GROW * w - BACK_SHRINK * (1 - w));\r
      let opacity = 1 - depth * BACK_DIM * (1 - w);\r
      if (introRunning) {\r
        scale *= 0.7 + 0.3 * appear;\r
        opacity *= appear * appear * (3 - 2 * appear);\r
      }\r
      const sx = (x - cx) * st.scale + st.width / 2 - half;\r
      const sy = (y - cy) * st.scale + st.height / 2 - half;\r
      const rot = cfg.alignToPath ? heading(u) : 0;\r
      let z = depth > 0 ? (d <= 0 ? 10 + Math.round((d + 1) * 80) : 110 + Math.round(d * 80)) : 1;\r
      if (i === st.hoverIndex) z += 200;\r
      write(\r
        it,\r
        't',\r
        'transform',\r
        \`translate3d(\${sx.toFixed(2)}px, \${sy.toFixed(2)}px, 0px)\${rot ? \` rotate(\${rot.toFixed(2)}deg)\` : ''} scale(\${scale.toFixed(4)})\`\r
      );\r
      write(it, 'o', 'opacity', opacity > 0.999 ? '' : opacity.toFixed(3));\r
      write(it, 'z', 'zIndex', String(z));\r
    }\r
    if (introRunning) applyDash(easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)));\r
  };\r
\r
  const frame = now => {\r
    st.raf = 0;\r
    if (st.destroyed) return;\r
    const cfg = config.current;\r
    const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.1) : 0;\r
    st.last = now;\r
    let busy = false;\r
    if (st.lut && st.scale && st.introStart === -1 && !st.introDone && st.visible) {\r
      if (cfg.intro && !st.reduced) {\r
        st.introStart = now;\r
      } else {\r
        st.introDone = true;\r
      }\r
      root.removeAttribute('data-intro');\r
    }\r
    if (st.introStart >= 0) {\r
      if ((now - st.introStart) / 1000 >= INTRO_SPREAD) {\r
        st.introStart = -2;\r
        st.introDone = true;\r
        applyDash(1);\r
      } else {\r
        busy = true;\r
      }\r
    }\r
    const want = cfg.paused || st.reduced ? 0 : st.hovered ? clamp(cfg.hoverSpeed, 0, 1) : 1;\r
    if (st.speed !== want) {\r
      st.speed += (want - st.speed) * (1 - Math.exp(-dt / 0.35));\r
      if (Math.abs(st.speed - want) < 0.002) st.speed = want;\r
      busy = true;\r
    }\r
    if (st.speed > 0 && cfg.duration > 0) {\r
      st.lap += (dt * st.speed) / cfg.duration;\r
      busy = true;\r
    }\r
    if (st.drag?.active) {\r
      busy = true;\r
    } else if (st.seek) {\r
      st.seek.t = Math.min(1, st.seek.t + dt / st.seek.dur);\r
      const e = st.seek.t < 0.5 ? 4 * st.seek.t ** 3 : 1 - Math.pow(-2 * st.seek.t + 2, 3) / 2;\r
      st.manual = st.seek.from + st.seek.delta * e;\r
      if (st.seek.t >= 1) st.seek = null;\r
      busy = true;\r
    } else if (st.glide) {\r
      st.manual += st.glide * dt;\r
      st.glide *= Math.exp(-dt / 0.7);\r
      if (Math.abs(st.glide) < 0.0004) st.glide = 0;\r
      busy = true;\r
    }\r
    render(now);\r
    const whole = Math.floor(st.lap);\r
    if (whole) st.lap -= whole;\r
    if (!st.drag && !st.seek) st.manual -= Math.floor(st.manual);\r
    if (busy && st.visible && !st.destroyed) st.raf = requestAnimationFrame(frame);\r
  };\r
\r
  const wake = () => {\r
    if (st.raf || st.destroyed || !st.visible) return;\r
    st.last = 0;\r
    st.raf = requestAnimationFrame(frame);\r
  };\r
\r
  const local = e => {\r
    const r = root.getBoundingClientRect();\r
    const k = root.offsetWidth ? r.width / root.offsetWidth || 1 : 1;\r
    return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];\r
  };\r
\r
  const dragRate = () => {\r
    if (!st.lut || !st.scale) return 0;\r
    const a = sample(st.front - 3 / SAMPLES);\r
    const b = sample(st.front + 3 / SAMPLES);\r
    const along = ((b[0] - a[0]) / (6 / SAMPLES)) * st.scale;\r
    const floor = st.length * st.scale * 0.35;\r
    return Math.abs(along) < floor ? Math.sign(along || 1) * floor : along;\r
  };\r
\r
  const itemIndex = target => {\r
    const el = target instanceof Element ? target.closest('[data-orbit-item]') : null;\r
    return el && root.contains(el) ? Number(el.getAttribute('data-orbit-item')) : -1;\r
  };\r
\r
  const bringToFront = index => {\r
    if (!st.lut || index < 0) return;\r
    const u = progress() + offsetOf(index, st.items.length);\r
    const delta = wrapSigned(st.front - u);\r
    st.glide = 0;\r
    st.seek = { from: st.manual, delta, t: 0, dur: 0.45 + Math.abs(delta) * 1.4 };\r
    wake();\r
  };\r
\r
  const onEnter = () => {\r
    st.hovered = true;\r
    wake();\r
  };\r
\r
  const onLeave = () => {\r
    st.hovered = false;\r
    st.hoverIndex = -1;\r
    wake();\r
  };\r
\r
  const onOver = e => {\r
    const index = itemIndex(e.target);\r
    if (index !== st.hoverIndex) {\r
      st.hoverIndex = index;\r
      if (st.lut) render(performance.now());\r
    }\r
  };\r
\r
  const onDown = e => {\r
    const cfg = config.current;\r
    if (!cfg.draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
    if (e.target instanceof Element && e.target.closest('[data-orbit-center]')) return;\r
    const [x, y] = local(e);\r
    st.drag = { id: e.pointerId, x, y, active: false, samples: [], rate: dragRate(), anchor: 0, manual: 0 };\r
  };\r
\r
  const onMove = e => {\r
    const d = st.drag;\r
    if (!d || e.pointerId !== d.id) return;\r
    const [x, y] = local(e);\r
    const along = x - d.x;\r
    if (!d.active) {\r
      if (Math.abs(along) < DRAG_THRESHOLD) return;\r
      if (Math.abs(y - d.y) > Math.abs(along)) {\r
        st.drag = null;\r
        return;\r
      }\r
      d.active = true;\r
      d.anchor = along;\r
      d.manual = st.manual;\r
      st.seek = null;\r
      st.glide = 0;\r
      try {\r
        root.setPointerCapture(e.pointerId);\r
      } catch {}\r
      root.setAttribute('data-dragging', '');\r
    }\r
    if (d.rate) st.manual = d.manual + (along - d.anchor) / d.rate;\r
    const now = performance.now();\r
    d.samples.push([now, along]);\r
    while (d.samples.length > 2 && now - d.samples[0][0] > 100) d.samples.shift();\r
    wake();\r
  };\r
\r
  const endDrag = (e, cancelled) => {\r
    const d = st.drag;\r
    if (!d || e.pointerId !== d.id) return;\r
    st.drag = null;\r
    if (!d.active) return;\r
    root.removeAttribute('data-dragging');\r
    try {\r
      root.releasePointerCapture(e.pointerId);\r
    } catch {}\r
    const now = performance.now();\r
    st.suppressUntil = now + 400;\r
    const s = d.samples;\r
    if (!cancelled && s.length > 1 && d.rate) {\r
      const [t0, a0] = s[0];\r
      const [t1, a1] = s[s.length - 1];\r
      if (t1 > t0 && now - t1 < 80) st.glide = clamp((((a1 - a0) / (t1 - t0)) * 1000) / d.rate, -3, 3);\r
    }\r
    wake();\r
  };\r
\r
  const onUp = e => endDrag(e, false);\r
  const onCancel = e => endDrag(e, true);\r
\r
  const activate = index => {\r
    const cfg = config.current;\r
    if (index < 0) return;\r
    if (cfg.clickToFront) bringToFront(index);\r
    cfg.onItemClick?.(index, cfg.sources[index]);\r
  };\r
\r
  const onClick = e => {\r
    if (performance.now() < st.suppressUntil) {\r
      e.preventDefault();\r
      e.stopPropagation();\r
      st.suppressUntil = 0;\r
      return;\r
    }\r
    activate(itemIndex(e.target));\r
  };\r
\r
  const onKey = e => {\r
    if (e.key !== 'Enter' && e.key !== ' ') return;\r
    const index = itemIndex(e.target);\r
    if (index < 0) return;\r
    e.preventDefault();\r
    activate(index);\r
  };\r
\r
  const onFocus = e => {\r
    const index = itemIndex(e.target);\r
    if (index >= 0 && config.current.clickToFront && e.target instanceof Element && e.target.matches(':focus-visible'))\r
      bringToFront(index);\r
  };\r
\r
  const onMotion = () => {\r
    st.reduced = !!query?.matches;\r
    wake();\r
  };\r
\r
  root.addEventListener('pointerenter', onEnter);\r
  root.addEventListener('pointerleave', onLeave);\r
  root.addEventListener('pointerover', onOver);\r
  root.addEventListener('pointerdown', onDown);\r
  root.addEventListener('pointermove', onMove);\r
  root.addEventListener('pointerup', onUp);\r
  root.addEventListener('pointercancel', onCancel);\r
  root.addEventListener('lostpointercapture', onCancel);\r
  root.addEventListener('click', onClick);\r
  root.addEventListener('keydown', onKey);\r
  root.addEventListener('focusin', onFocus);\r
  query?.addEventListener?.('change', onMotion);\r
\r
  let resizeObserver = null;\r
  if (typeof ResizeObserver !== 'undefined') {\r
    resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      render(performance.now());\r
      wake();\r
    });\r
    resizeObserver.observe(root);\r
  }\r
\r
  let intersection = null;\r
  if (typeof IntersectionObserver !== 'undefined') {\r
    intersection = new IntersectionObserver(\r
      entries => {\r
        st.visible = entries[entries.length - 1].isIntersecting;\r
        if (st.visible) wake();\r
      },\r
      { threshold: 0.05 }\r
    );\r
    intersection.observe(root);\r
  }\r
\r
  const onVisibility = () => {\r
    if (!document.hidden) wake();\r
  };\r
  document.addEventListener('visibilitychange', onVisibility);\r
  window.addEventListener('resize', wake);\r
\r
  const refresh = () => {\r
    collect();\r
    build();\r
    layout();\r
    render(performance.now());\r
    wake();\r
  };\r
\r
  const destroy = () => {\r
    st.destroyed = true;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    root.removeEventListener('pointerenter', onEnter);\r
    root.removeEventListener('pointerleave', onLeave);\r
    root.removeEventListener('pointerover', onOver);\r
    root.removeEventListener('pointerdown', onDown);\r
    root.removeEventListener('pointermove', onMove);\r
    root.removeEventListener('pointerup', onUp);\r
    root.removeEventListener('pointercancel', onCancel);\r
    root.removeEventListener('lostpointercapture', onCancel);\r
    root.removeEventListener('click', onClick);\r
    root.removeEventListener('keydown', onKey);\r
    root.removeEventListener('focusin', onFocus);\r
    query?.removeEventListener?.('change', onMotion);\r
    document.removeEventListener('visibilitychange', onVisibility);\r
    window.removeEventListener('resize', wake);\r
    resizeObserver?.disconnect();\r
    intersection?.disconnect();\r
  };\r
\r
  return { refresh, wake, destroy };\r
};\r
\r
export default function OrbitImages({\r
  images = [],\r
  altPrefix = 'Orbiting image',\r
  shape = 'ellipse',\r
  customPath,\r
  baseWidth = 1400,\r
  radiusX = 700,\r
  radiusY = 170,\r
  radius = 300,\r
  starPoints = 5,\r
  starInnerRatio = 0.5,\r
  rotation = -8,\r
  duration = 40,\r
  itemSize = 64,\r
  direction = 'normal',\r
  fill = true,\r
  width = '100%',\r
  height = 'auto',\r
  className = '',\r
  showPath = false,\r
  pathColor = 'rgba(128,128,128,0.35)',\r
  pathWidth = 2,\r
  pathDash = 0,\r
  easing = 'linear',\r
  paused = false,\r
  depth = 0.5,\r
  itemRadius = 12,\r
  shadow = 0.3,\r
  hoverScale = 1.08,\r
  hoverSpeed = 0.3,\r
  draggable = true,\r
  clickToFront = true,\r
  onItemClick,\r
  alignToPath = false,\r
  intro = true,\r
  centerContent\r
}) {\r
  const rootRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const clipId = useId().replace(/:/g, '');\r
  const [introPending] = useState(intro);\r
  const [measuredAspect, setAspect] = useState(null);\r
\r
  const center = baseWidth / 2;\r
\r
  const path = useMemo(() => {\r
    switch (shape) {\r
      case 'circle':\r
        return generateCirclePath(center, center, radius);\r
      case 'ellipse':\r
        return generateEllipsePath(center, center, radiusX, radiusY);\r
      case 'square':\r
        return generateSquarePath(center, center, radius * 2);\r
      case 'rectangle':\r
        return generateRectanglePath(center, center, radiusX * 2, radiusY * 2);\r
      case 'triangle':\r
        return generateTrianglePath(center, center, radius * 2);\r
      case 'star':\r
        return generateStarPath(center, center, radius, radius * starInnerRatio, starPoints);\r
      case 'heart':\r
        return generateHeartPath(center, center, radius * 2);\r
      case 'infinity':\r
        return generateInfinityPath(center, center, radiusX * 2, radiusY * 2);\r
      case 'wave':\r
        return generateWavePath(center, center, radiusX * 2, radiusY, 3);\r
      case 'custom':\r
        return customPath || generateCirclePath(center, center, radius);\r
      default:\r
        return generateEllipsePath(center, center, radiusX, radiusY);\r
    }\r
  }, [shape, customPath, center, radiusX, radiusY, radius, starPoints, starInnerRatio]);\r
\r
  const items = useMemo(\r
    () =>\r
      images.map((image, index) =>\r
        typeof image === 'string'\r
          ? { src: image, alt: \`\${altPrefix} \${index + 1}\` }\r
          : { src: image.src, alt: image.alt ?? \`\${altPrefix} \${index + 1}\` }\r
      ),\r
    [images, altPrefix]\r
  );\r
\r
  const interactive = !!onItemClick;\r
\r
  const config = useRef(null);\r
  config.current = {\r
    baseWidth,\r
    rotation,\r
    duration,\r
    itemSize,\r
    direction,\r
    fill,\r
    pathWidth,\r
    pathDash,\r
    easing,\r
    paused,\r
    depth,\r
    hoverScale,\r
    hoverSpeed,\r
    draggable,\r
    clickToFront,\r
    onItemClick,\r
    alignToPath,\r
    intro,\r
    sources: items.map(item => item.src)\r
  };\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const engine = createEngine(rootRef.current, config, setAspect);\r
    engineRef.current = engine;\r
    return () => {\r
      engine.destroy();\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useIsomorphicLayoutEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [\r
    path,\r
    rotation,\r
    baseWidth,\r
    itemSize,\r
    depth,\r
    hoverScale,\r
    items.length,\r
    showPath,\r
    pathWidth,\r
    pathDash,\r
    measuredAspect,\r
    height\r
  ]);\r
\r
  useEffect(() => {\r
    engineRef.current?.wake();\r
  });\r
\r
  const aspect = measuredAspect ?? estimateAspect({ shape, radiusX, radiusY, radius, itemSize });\r
  const autoHeight = height === 'auto' || height === undefined;\r
  const layered = depth > 0 && !!centerContent;\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`orbit-container \${className}\`.trim()}\r
      style={{\r
        width: toCssLength(width),\r
        height: autoHeight ? undefined : toCssLength(height),\r
        aspectRatio: autoHeight ? String(aspect) : undefined,\r
        '--orbit-radius':\r
          typeof itemRadius === 'number' ? \`\${(itemRadius / Math.max(1, itemSize)) * 100}%\` : itemRadius,\r
        '--orbit-shadow': String(clamp(shadow, 0, 1)),\r
        '--orbit-hover-scale': String(hoverScale)\r
      }}\r
      aria-hidden={interactive ? undefined : true}\r
      data-intro={introPending ? '' : undefined}\r
      data-draggable={draggable ? '' : undefined}\r
    >\r
      <svg\r
        className="orbit-path-svg"\r
        data-orbit-svg=""\r
        preserveAspectRatio="none"\r
        style={{ zIndex: 0, visibility: showPath ? undefined : 'hidden' }}\r
        aria-hidden="true"\r
      >\r
        <path\r
          data-orbit-path=""\r
          data-orbit-stroke=""\r
          d={path}\r
          fill="none"\r
          stroke={pathColor}\r
          strokeLinecap="round"\r
          transform={\`rotate(\${rotation} \${center} \${center})\`}\r
        />\r
      </svg>\r
      {showPath && layered && (\r
        <svg\r
          className="orbit-path-svg"\r
          data-orbit-svg=""\r
          preserveAspectRatio="none"\r
          style={{ zIndex: 105 }}\r
          aria-hidden="true"\r
        >\r
          <defs>\r
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">\r
              <rect data-orbit-clip="" />\r
            </clipPath>\r
          </defs>\r
          <g clipPath={\`url(#\${clipId})\`}>\r
            <path\r
              data-orbit-stroke=""\r
              d={path}\r
              fill="none"\r
              stroke={pathColor}\r
              strokeLinecap="round"\r
              transform={\`rotate(\${rotation} \${center} \${center})\`}\r
            />\r
          </g>\r
        </svg>\r
      )}\r
      {items.map((item, index) => (\r
        <div\r
          key={index}\r
          className="orbit-item"\r
          data-orbit-item={index}\r
          data-clickable={clickToFront || interactive ? '' : undefined}\r
          role={interactive ? 'button' : undefined}\r
          tabIndex={interactive ? 0 : undefined}\r
          aria-label={interactive ? item.alt : undefined}\r
        >\r
          <div className="orbit-item-inner">\r
            <img src={item.src} alt={item.alt} draggable={false} decoding="async" className="orbit-image" />\r
          </div>\r
        </div>\r
      ))}\r
      {centerContent && (\r
        <div className="orbit-center-content" data-orbit-center="">\r
          {centerContent}\r
        </div>\r
      )}\r
    </div>\r
  );\r
}\r
`,r=`.orbit-container {\r
  position: relative;\r
  margin-left: auto;\r
  margin-right: auto;\r
  isolation: isolate;\r
  user-select: none;\r
  -webkit-user-select: none;\r
  -webkit-tap-highlight-color: transparent;\r
}\r
\r
.orbit-container[data-draggable] {\r
  cursor: grab;\r
  touch-action: pan-y pinch-zoom;\r
}\r
\r
.orbit-container[data-dragging],\r
.orbit-container[data-dragging] * {\r
  cursor: grabbing;\r
}\r
\r
.orbit-path-svg {\r
  position: absolute;\r
  inset: 0;\r
  width: 100%;\r
  height: 100%;\r
  overflow: visible;\r
  pointer-events: none;\r
}\r
\r
.orbit-item {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  will-change: transform, opacity;\r
}\r
\r
.orbit-container[data-intro] .orbit-item {\r
  opacity: 0;\r
}\r
\r
.orbit-item[data-clickable] {\r
  cursor: pointer;\r
}\r
\r
.orbit-item-inner {\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
  border-radius: var(--orbit-radius, 0px);\r
  box-shadow: 0 calc(var(--orbit-shadow, 0) * 16px) calc(var(--orbit-shadow, 0) * 36px)\r
    rgba(0, 0, 0, calc(var(--orbit-shadow, 0) * 0.45));\r
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);\r
}\r
\r
.orbit-item:hover .orbit-item-inner,\r
.orbit-item:focus-visible .orbit-item-inner {\r
  transform: scale(var(--orbit-hover-scale, 1));\r
}\r
\r
.orbit-item:focus-visible {\r
  outline: none;\r
}\r
\r
.orbit-item:focus-visible .orbit-item-inner {\r
  outline: 2px solid currentColor;\r
  outline-offset: 3px;\r
}\r
\r
.orbit-image {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  object-fit: cover;\r
  pointer-events: none;\r
  -webkit-user-drag: none;\r
}\r
\r
.orbit-center-content {\r
  position: absolute;\r
  inset: 0;\r
  z-index: 100;\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  pointer-events: none;\r
}\r
\r
.orbit-center-content > * {\r
  pointer-events: auto;\r
}\r
\r
@media (prefers-reduced-motion: reduce) {\r
  .orbit-item-inner {\r
    transition: none;\r
  }\r
}\r
`,e=`'use client';\r
\r
// Component created by Dominik Koch\r
// https://x.com/dominikkoch\r
\r
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';\r
\r
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const cx = (...parts) => parts.filter(Boolean).join(' ');\r
\r
const SAMPLES = 720;\r
const FRONT_GROW = 0.3;\r
const BACK_SHRINK = 0.45;\r
const BACK_DIM = 0.55;\r
const INTRO_SPREAD = 1.3;\r
const INTRO_FADE = 0.45;\r
const DRAG_THRESHOLD = 5;\r
\r
function generateEllipsePath(cx, cy, rx, ry) {\r
  return \`M \${cx - rx} \${cy} A \${rx} \${ry} 0 1 0 \${cx + rx} \${cy} A \${rx} \${ry} 0 1 0 \${cx - rx} \${cy}\`;\r
}\r
\r
function generateCirclePath(cx, cy, r) {\r
  return generateEllipsePath(cx, cy, r, r);\r
}\r
\r
function generateSquarePath(cx, cy, size) {\r
  const h = size / 2;\r
  return \`M \${cx - h} \${cy - h} L \${cx + h} \${cy - h} L \${cx + h} \${cy + h} L \${cx - h} \${cy + h} Z\`;\r
}\r
\r
function generateRectanglePath(cx, cy, w, h) {\r
  const hw = w / 2;\r
  const hh = h / 2;\r
  return \`M \${cx - hw} \${cy - hh} L \${cx + hw} \${cy - hh} L \${cx + hw} \${cy + hh} L \${cx - hw} \${cy + hh} Z\`;\r
}\r
\r
function generateTrianglePath(cx, cy, size) {\r
  const height = (size * Math.sqrt(3)) / 2;\r
  const hs = size / 2;\r
  return \`M \${cx} \${cy - height / 1.5} L \${cx + hs} \${cy + height / 3} L \${cx - hs} \${cy + height / 3} Z\`;\r
}\r
\r
function generateStarPath(cx, cy, outerR, innerR, points) {\r
  const step = Math.PI / points;\r
  let path = '';\r
  for (let i = 0; i < 2 * points; i++) {\r
    const r = i % 2 === 0 ? outerR : innerR;\r
    const angle = i * step - Math.PI / 2;\r
    const x = cx + r * Math.cos(angle);\r
    const y = cy + r * Math.sin(angle);\r
    path += i === 0 ? \`M \${x} \${y}\` : \` L \${x} \${y}\`;\r
  }\r
  return path + ' Z';\r
}\r
\r
function generateHeartPath(cx, cy, size) {\r
  const s = size / 30;\r
  return \`M \${cx} \${cy + 12 * s} C \${cx - 20 * s} \${cy - 5 * s}, \${cx - 12 * s} \${cy - 18 * s}, \${cx} \${cy - 8 * s} C \${cx + 12 * s} \${cy - 18 * s}, \${cx + 20 * s} \${cy - 5 * s}, \${cx} \${cy + 12 * s}\`;\r
}\r
\r
function generateInfinityPath(cx, cy, w, h) {\r
  const hw = w / 2;\r
  const hh = h / 2;\r
  return \`M \${cx} \${cy} C \${cx + hw * 0.5} \${cy - hh}, \${cx + hw} \${cy - hh}, \${cx + hw} \${cy} C \${cx + hw} \${cy + hh}, \${cx + hw * 0.5} \${cy + hh}, \${cx} \${cy} C \${cx - hw * 0.5} \${cy + hh}, \${cx - hw} \${cy + hh}, \${cx - hw} \${cy} C \${cx - hw} \${cy - hh}, \${cx - hw * 0.5} \${cy - hh}, \${cx} \${cy}\`;\r
}\r
\r
function generateWavePath(cx, cy, w, amplitude, waves) {\r
  const pts = [];\r
  const segs = waves * 20;\r
  const hw = w / 2;\r
  for (let i = 0; i <= segs; i++) {\r
    const x = cx - hw + (w * i) / segs;\r
    const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;\r
    pts.push(i === 0 ? \`M \${x} \${y}\` : \`L \${x} \${y}\`);\r
  }\r
  for (let i = segs; i >= 0; i--) {\r
    const x = cx - hw + (w * i) / segs;\r
    const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;\r
    pts.push(\`L \${x} \${y}\`);\r
  }\r
  return pts.join(' ') + ' Z';\r
}\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toCssLength = value => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const wrapSigned = value => value - Math.round(value);\r
\r
const cubicBezier = (x1, y1, x2, y2) => {\r
  const sample = (a1, a2, t) => ((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t * t + 3 * a1 * t;\r
  const slope = (a1, a2, t) => 3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;\r
  return x => {\r
    if (x <= 0 || x >= 1) return x;\r
    let t = x;\r
    for (let i = 0; i < 8; i++) {\r
      const s = slope(x1, x2, t);\r
      if (Math.abs(s) < 1e-6) break;\r
      t = clamp(t - (sample(x1, x2, t) - x) / s, 0, 1);\r
    }\r
    return sample(y1, y2, t);\r
  };\r
};\r
\r
const EASINGS = {\r
  linear: t => t,\r
  easeIn: cubicBezier(0.42, 0, 1, 1),\r
  easeOut: cubicBezier(0, 0, 0.58, 1),\r
  easeInOut: cubicBezier(0.42, 0, 0.58, 1)\r
};\r
\r
const easeOutQuint = t => 1 - Math.pow(1 - t, 5);\r
\r
const estimateAspect = ({ shape, radiusX, radiusY, radius, itemSize }) => {\r
  const wide = shape === 'ellipse' || shape === 'rectangle' || shape === 'infinity' || shape === 'wave';\r
  const w = (wide ? radiusX : radius) * 2 + itemSize * 1.6;\r
  const h = (wide ? radiusY : radius) * 2 + itemSize * 1.6;\r
  return w > 0 && h > 0 ? w / h : 1;\r
};\r
\r
const createEngine = (root, config, setAspect) => {\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const st = {\r
    lut: null,\r
    length: 0,\r
    front: 0,\r
    yMid: 0,\r
    yHalf: 1,\r
    bbox: [0, 0, 1, 1],\r
    width: 0,\r
    height: 0,\r
    scale: 0,\r
    size: 0,\r
    items: [],\r
    strokes: [],\r
    lap: 0,\r
    manual: 0,\r
    glide: 0,\r
    speed: 1,\r
    drag: null,\r
    seek: null,\r
    hovered: false,\r
    hoverIndex: -1,\r
    suppressUntil: 0,\r
    introStart: -1,\r
    introDone: !config.current.intro,\r
    visible: typeof IntersectionObserver === 'undefined',\r
    reduced: !!query?.matches,\r
    raf: 0,\r
    last: 0,\r
    destroyed: false\r
  };\r
  st.speed = st.reduced || config.current.paused ? 0 : 1;\r
\r
  const collect = () => {\r
    st.items = Array.from(root.querySelectorAll('[data-orbit-item]')).map(el => ({ el, t: '', o: '', z: '' }));\r
    st.strokes = Array.from(root.querySelectorAll('[data-orbit-stroke]'));\r
  };\r
\r
  const build = () => {\r
    const cfg = config.current;\r
    const path = root.querySelector('[data-orbit-path]');\r
    let length = 0;\r
    try {\r
      length = path ? path.getTotalLength() : 0;\r
    } catch {\r
      length = 0;\r
    }\r
    if (!path || !length || !isFinite(length)) {\r
      st.lut = null;\r
      return;\r
    }\r
    const lut = new Float32Array(SAMPLES * 2);\r
    const angle = (cfg.rotation * Math.PI) / 180;\r
    const cos = Math.cos(angle);\r
    const sin = Math.sin(angle);\r
    const origin = cfg.baseWidth / 2;\r
    let x0 = Infinity;\r
    let x1 = -Infinity;\r
    let y0 = Infinity;\r
    let y1 = -Infinity;\r
    let front = 0;\r
    for (let i = 0; i < SAMPLES; i++) {\r
      const point = path.getPointAtLength((i / SAMPLES) * length);\r
      const dx = point.x - origin;\r
      const dy = point.y - origin;\r
      const x = origin + dx * cos - dy * sin;\r
      const y = origin + dx * sin + dy * cos;\r
      lut[i * 2] = x;\r
      lut[i * 2 + 1] = y;\r
      x0 = Math.min(x0, x);\r
      x1 = Math.max(x1, x);\r
      y0 = Math.min(y0, y);\r
      y1 = Math.max(y1, y);\r
      if (y > lut[front * 2 + 1] + 1e-6) front = i;\r
    }\r
    st.lut = lut;\r
    st.length = length;\r
    st.front = front / SAMPLES;\r
    st.yMid = (y0 + y1) / 2;\r
    st.yHalf = Math.max(1e-3, (y1 - y0) / 2);\r
    const depth = clamp(cfg.depth, 0, 1);\r
    const margin = (cfg.itemSize / 2) * (1 + depth * FRONT_GROW) * Math.max(1, cfg.hoverScale) + 2;\r
    st.bbox = [x0 - margin, y0 - margin, x1 + margin, y1 + margin];\r
    setAspect((x1 - x0 + margin * 2) / (y1 - y0 + margin * 2));\r
  };\r
\r
  const layout = () => {\r
    const cfg = config.current;\r
    st.width = root.clientWidth;\r
    st.height = root.clientHeight;\r
    if (!st.lut) return;\r
    const [bx0, by0, bx1, by1] = st.bbox;\r
    const scale = Math.min(st.width / (bx1 - bx0), st.height / (by1 - by0));\r
    st.scale = scale > 0 && isFinite(scale) ? scale : 0;\r
    st.size = cfg.itemSize * st.scale;\r
    for (const it of st.items) {\r
      it.el.style.width = \`\${st.size}px\`;\r
      it.el.style.height = \`\${st.size}px\`;\r
    }\r
    if (!st.scale) return;\r
    const vw = st.width / st.scale;\r
    const vh = st.height / st.scale;\r
    const cx = (bx0 + bx1) / 2;\r
    const cy = (by0 + by1) / 2;\r
    root.querySelectorAll('[data-orbit-svg]').forEach(svg => {\r
      svg.setAttribute('viewBox', \`\${cx - vw / 2} \${cy - vh / 2} \${vw} \${vh}\`);\r
    });\r
    const clip = root.querySelector('[data-orbit-clip]');\r
    if (clip) {\r
      clip.setAttribute('x', String(cx - vw));\r
      clip.setAttribute('y', String(st.yMid));\r
      clip.setAttribute('width', String(vw * 2));\r
      clip.setAttribute('height', String(vh * 2));\r
    }\r
    for (const stroke of st.strokes) {\r
      stroke.style.strokeWidth = String(cfg.pathWidth / st.scale);\r
    }\r
    applyDash(1);\r
  };\r
\r
  const applyDash = reveal => {\r
    const cfg = config.current;\r
    const dash = cfg.pathDash > 0 && st.scale ? cfg.pathDash / st.scale : 0;\r
    for (const stroke of st.strokes) {\r
      if (reveal < 1 && !dash) {\r
        stroke.style.strokeDasharray = \`\${st.length} \${st.length}\`;\r
        stroke.style.strokeDashoffset = String(st.length * (1 - reveal));\r
        stroke.style.opacity = '';\r
      } else {\r
        stroke.style.strokeDasharray = dash ? \`\${dash} \${dash * 1.6}\` : '';\r
        stroke.style.strokeDashoffset = '';\r
        stroke.style.opacity = reveal < 1 ? String(reveal) : '';\r
      }\r
    }\r
  };\r
\r
  const sample = u => {\r
    const f = (((u % 1) + 1) % 1) * SAMPLES;\r
    const i0 = Math.floor(f) % SAMPLES;\r
    const i1 = (i0 + 1) % SAMPLES;\r
    const t = f - Math.floor(f);\r
    const lut = st.lut;\r
    return [lut[i0 * 2] + (lut[i1 * 2] - lut[i0 * 2]) * t, lut[i0 * 2 + 1] + (lut[i1 * 2 + 1] - lut[i0 * 2 + 1]) * t];\r
  };\r
\r
  const heading = u => {\r
    const a = sample(u - 2 / SAMPLES);\r
    const b = sample(u + 2 / SAMPLES);\r
    return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;\r
  };\r
\r
  const progress = () => {\r
    const cfg = config.current;\r
    const ease = EASINGS[cfg.easing] || EASINGS.linear;\r
    const whole = Math.floor(st.lap);\r
    return (whole + ease(st.lap - whole)) * (cfg.direction === 'reverse' ? -1 : 1) + st.manual;\r
  };\r
\r
  const offsetOf = (index, count) => {\r
    const cfg = config.current;\r
    if (cfg.fill) return index / Math.max(1, count);\r
    return (-index * cfg.itemSize * 1.3) / Math.max(1, st.length);\r
  };\r
\r
  const write = (it, key, prop, value) => {\r
    if (it[key] !== value) {\r
      it[key] = value;\r
      it.el.style[prop] = value;\r
    }\r
  };\r
\r
  const render = now => {\r
    const cfg = config.current;\r
    if (!st.lut || !st.scale) return;\r
    const p = progress();\r
    const count = st.items.length;\r
    const depth = clamp(cfg.depth, 0, 1);\r
    const [bx0, by0, bx1, by1] = st.bbox;\r
    const cx = (bx0 + bx1) / 2;\r
    const cy = (by0 + by1) / 2;\r
    const half = st.size / 2;\r
    const introRunning = st.introStart >= 0;\r
    const elapsed = introRunning ? (now - st.introStart) / 1000 : 0;\r
    const spread = introRunning ? easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)) : 1;\r
    const appear = introRunning ? clamp(elapsed / INTRO_FADE, 0, 1) : 1;\r
    for (let i = 0; i < count; i++) {\r
      const it = st.items[i];\r
      let u = p + offsetOf(i, count);\r
      if (introRunning) u = st.front + wrapSigned(u - st.front) * spread;\r
      const [x, y] = sample(u);\r
      const d = clamp((y - st.yMid) / st.yHalf, -1, 1);\r
      const w = (d + 1) / 2;\r
      let scale = 1 + depth * (FRONT_GROW * w - BACK_SHRINK * (1 - w));\r
      let opacity = 1 - depth * BACK_DIM * (1 - w);\r
      if (introRunning) {\r
        scale *= 0.7 + 0.3 * appear;\r
        opacity *= appear * appear * (3 - 2 * appear);\r
      }\r
      const sx = (x - cx) * st.scale + st.width / 2 - half;\r
      const sy = (y - cy) * st.scale + st.height / 2 - half;\r
      const rot = cfg.alignToPath ? heading(u) : 0;\r
      let z = depth > 0 ? (d <= 0 ? 10 + Math.round((d + 1) * 80) : 110 + Math.round(d * 80)) : 1;\r
      if (i === st.hoverIndex) z += 200;\r
      write(\r
        it,\r
        't',\r
        'transform',\r
        \`translate3d(\${sx.toFixed(2)}px, \${sy.toFixed(2)}px, 0px)\${rot ? \` rotate(\${rot.toFixed(2)}deg)\` : ''} scale(\${scale.toFixed(4)})\`\r
      );\r
      write(it, 'o', 'opacity', opacity > 0.999 ? '' : opacity.toFixed(3));\r
      write(it, 'z', 'zIndex', String(z));\r
    }\r
    if (introRunning) applyDash(easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)));\r
  };\r
\r
  const frame = now => {\r
    st.raf = 0;\r
    if (st.destroyed) return;\r
    const cfg = config.current;\r
    const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.1) : 0;\r
    st.last = now;\r
    let busy = false;\r
    if (st.lut && st.scale && st.introStart === -1 && !st.introDone && st.visible) {\r
      if (cfg.intro && !st.reduced) {\r
        st.introStart = now;\r
      } else {\r
        st.introDone = true;\r
      }\r
      root.removeAttribute('data-intro');\r
    }\r
    if (st.introStart >= 0) {\r
      if ((now - st.introStart) / 1000 >= INTRO_SPREAD) {\r
        st.introStart = -2;\r
        st.introDone = true;\r
        applyDash(1);\r
      } else {\r
        busy = true;\r
      }\r
    }\r
    const want = cfg.paused || st.reduced ? 0 : st.hovered ? clamp(cfg.hoverSpeed, 0, 1) : 1;\r
    if (st.speed !== want) {\r
      st.speed += (want - st.speed) * (1 - Math.exp(-dt / 0.35));\r
      if (Math.abs(st.speed - want) < 0.002) st.speed = want;\r
      busy = true;\r
    }\r
    if (st.speed > 0 && cfg.duration > 0) {\r
      st.lap += (dt * st.speed) / cfg.duration;\r
      busy = true;\r
    }\r
    if (st.drag?.active) {\r
      busy = true;\r
    } else if (st.seek) {\r
      st.seek.t = Math.min(1, st.seek.t + dt / st.seek.dur);\r
      const e = st.seek.t < 0.5 ? 4 * st.seek.t ** 3 : 1 - Math.pow(-2 * st.seek.t + 2, 3) / 2;\r
      st.manual = st.seek.from + st.seek.delta * e;\r
      if (st.seek.t >= 1) st.seek = null;\r
      busy = true;\r
    } else if (st.glide) {\r
      st.manual += st.glide * dt;\r
      st.glide *= Math.exp(-dt / 0.7);\r
      if (Math.abs(st.glide) < 0.0004) st.glide = 0;\r
      busy = true;\r
    }\r
    render(now);\r
    const whole = Math.floor(st.lap);\r
    if (whole) st.lap -= whole;\r
    if (!st.drag && !st.seek) st.manual -= Math.floor(st.manual);\r
    if (busy && st.visible && !st.destroyed) st.raf = requestAnimationFrame(frame);\r
  };\r
\r
  const wake = () => {\r
    if (st.raf || st.destroyed || !st.visible) return;\r
    st.last = 0;\r
    st.raf = requestAnimationFrame(frame);\r
  };\r
\r
  const local = e => {\r
    const r = root.getBoundingClientRect();\r
    const k = root.offsetWidth ? r.width / root.offsetWidth || 1 : 1;\r
    return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];\r
  };\r
\r
  const dragRate = () => {\r
    if (!st.lut || !st.scale) return 0;\r
    const a = sample(st.front - 3 / SAMPLES);\r
    const b = sample(st.front + 3 / SAMPLES);\r
    const along = ((b[0] - a[0]) / (6 / SAMPLES)) * st.scale;\r
    const floor = st.length * st.scale * 0.35;\r
    return Math.abs(along) < floor ? Math.sign(along || 1) * floor : along;\r
  };\r
\r
  const itemIndex = target => {\r
    const el = target instanceof Element ? target.closest('[data-orbit-item]') : null;\r
    return el && root.contains(el) ? Number(el.getAttribute('data-orbit-item')) : -1;\r
  };\r
\r
  const bringToFront = index => {\r
    if (!st.lut || index < 0) return;\r
    const u = progress() + offsetOf(index, st.items.length);\r
    const delta = wrapSigned(st.front - u);\r
    st.glide = 0;\r
    st.seek = { from: st.manual, delta, t: 0, dur: 0.45 + Math.abs(delta) * 1.4 };\r
    wake();\r
  };\r
\r
  const onEnter = () => {\r
    st.hovered = true;\r
    wake();\r
  };\r
\r
  const onLeave = () => {\r
    st.hovered = false;\r
    st.hoverIndex = -1;\r
    wake();\r
  };\r
\r
  const onOver = e => {\r
    const index = itemIndex(e.target);\r
    if (index !== st.hoverIndex) {\r
      st.hoverIndex = index;\r
      if (st.lut) render(performance.now());\r
    }\r
  };\r
\r
  const onDown = e => {\r
    const cfg = config.current;\r
    if (!cfg.draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
    if (e.target instanceof Element && e.target.closest('[data-orbit-center]')) return;\r
    const [x, y] = local(e);\r
    st.drag = { id: e.pointerId, x, y, active: false, samples: [], rate: dragRate(), anchor: 0, manual: 0 };\r
  };\r
\r
  const onMove = e => {\r
    const d = st.drag;\r
    if (!d || e.pointerId !== d.id) return;\r
    const [x, y] = local(e);\r
    const along = x - d.x;\r
    if (!d.active) {\r
      if (Math.abs(along) < DRAG_THRESHOLD) return;\r
      if (Math.abs(y - d.y) > Math.abs(along)) {\r
        st.drag = null;\r
        return;\r
      }\r
      d.active = true;\r
      d.anchor = along;\r
      d.manual = st.manual;\r
      st.seek = null;\r
      st.glide = 0;\r
      try {\r
        root.setPointerCapture(e.pointerId);\r
      } catch {}\r
      root.setAttribute('data-dragging', '');\r
    }\r
    if (d.rate) st.manual = d.manual + (along - d.anchor) / d.rate;\r
    const now = performance.now();\r
    d.samples.push([now, along]);\r
    while (d.samples.length > 2 && now - d.samples[0][0] > 100) d.samples.shift();\r
    wake();\r
  };\r
\r
  const endDrag = (e, cancelled) => {\r
    const d = st.drag;\r
    if (!d || e.pointerId !== d.id) return;\r
    st.drag = null;\r
    if (!d.active) return;\r
    root.removeAttribute('data-dragging');\r
    try {\r
      root.releasePointerCapture(e.pointerId);\r
    } catch {}\r
    const now = performance.now();\r
    st.suppressUntil = now + 400;\r
    const s = d.samples;\r
    if (!cancelled && s.length > 1 && d.rate) {\r
      const [t0, a0] = s[0];\r
      const [t1, a1] = s[s.length - 1];\r
      if (t1 > t0 && now - t1 < 80) st.glide = clamp((((a1 - a0) / (t1 - t0)) * 1000) / d.rate, -3, 3);\r
    }\r
    wake();\r
  };\r
\r
  const onUp = e => endDrag(e, false);\r
  const onCancel = e => endDrag(e, true);\r
\r
  const activate = index => {\r
    const cfg = config.current;\r
    if (index < 0) return;\r
    if (cfg.clickToFront) bringToFront(index);\r
    cfg.onItemClick?.(index, cfg.sources[index]);\r
  };\r
\r
  const onClick = e => {\r
    if (performance.now() < st.suppressUntil) {\r
      e.preventDefault();\r
      e.stopPropagation();\r
      st.suppressUntil = 0;\r
      return;\r
    }\r
    activate(itemIndex(e.target));\r
  };\r
\r
  const onKey = e => {\r
    if (e.key !== 'Enter' && e.key !== ' ') return;\r
    const index = itemIndex(e.target);\r
    if (index < 0) return;\r
    e.preventDefault();\r
    activate(index);\r
  };\r
\r
  const onFocus = e => {\r
    const index = itemIndex(e.target);\r
    if (index >= 0 && config.current.clickToFront && e.target instanceof Element && e.target.matches(':focus-visible'))\r
      bringToFront(index);\r
  };\r
\r
  const onMotion = () => {\r
    st.reduced = !!query?.matches;\r
    wake();\r
  };\r
\r
  root.addEventListener('pointerenter', onEnter);\r
  root.addEventListener('pointerleave', onLeave);\r
  root.addEventListener('pointerover', onOver);\r
  root.addEventListener('pointerdown', onDown);\r
  root.addEventListener('pointermove', onMove);\r
  root.addEventListener('pointerup', onUp);\r
  root.addEventListener('pointercancel', onCancel);\r
  root.addEventListener('lostpointercapture', onCancel);\r
  root.addEventListener('click', onClick);\r
  root.addEventListener('keydown', onKey);\r
  root.addEventListener('focusin', onFocus);\r
  query?.addEventListener?.('change', onMotion);\r
\r
  let resizeObserver = null;\r
  if (typeof ResizeObserver !== 'undefined') {\r
    resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      render(performance.now());\r
      wake();\r
    });\r
    resizeObserver.observe(root);\r
  }\r
\r
  let intersection = null;\r
  if (typeof IntersectionObserver !== 'undefined') {\r
    intersection = new IntersectionObserver(\r
      entries => {\r
        st.visible = entries[entries.length - 1].isIntersecting;\r
        if (st.visible) wake();\r
      },\r
      { threshold: 0.05 }\r
    );\r
    intersection.observe(root);\r
  }\r
\r
  const onVisibility = () => {\r
    if (!document.hidden) wake();\r
  };\r
  document.addEventListener('visibilitychange', onVisibility);\r
  window.addEventListener('resize', wake);\r
\r
  const refresh = () => {\r
    collect();\r
    build();\r
    layout();\r
    render(performance.now());\r
    wake();\r
  };\r
\r
  const destroy = () => {\r
    st.destroyed = true;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    root.removeEventListener('pointerenter', onEnter);\r
    root.removeEventListener('pointerleave', onLeave);\r
    root.removeEventListener('pointerover', onOver);\r
    root.removeEventListener('pointerdown', onDown);\r
    root.removeEventListener('pointermove', onMove);\r
    root.removeEventListener('pointerup', onUp);\r
    root.removeEventListener('pointercancel', onCancel);\r
    root.removeEventListener('lostpointercapture', onCancel);\r
    root.removeEventListener('click', onClick);\r
    root.removeEventListener('keydown', onKey);\r
    root.removeEventListener('focusin', onFocus);\r
    query?.removeEventListener?.('change', onMotion);\r
    document.removeEventListener('visibilitychange', onVisibility);\r
    window.removeEventListener('resize', wake);\r
    resizeObserver?.disconnect();\r
    intersection?.disconnect();\r
  };\r
\r
  return { refresh, wake, destroy };\r
};\r
\r
export default function OrbitImages({\r
  images = [],\r
  altPrefix = 'Orbiting image',\r
  shape = 'ellipse',\r
  customPath,\r
  baseWidth = 1400,\r
  radiusX = 700,\r
  radiusY = 170,\r
  radius = 300,\r
  starPoints = 5,\r
  starInnerRatio = 0.5,\r
  rotation = -8,\r
  duration = 40,\r
  itemSize = 64,\r
  direction = 'normal',\r
  fill = true,\r
  width = '100%',\r
  height = 'auto',\r
  className = '',\r
  showPath = false,\r
  pathColor = 'rgba(128,128,128,0.35)',\r
  pathWidth = 2,\r
  pathDash = 0,\r
  easing = 'linear',\r
  paused = false,\r
  depth = 0.5,\r
  itemRadius = 12,\r
  shadow = 0.3,\r
  hoverScale = 1.08,\r
  hoverSpeed = 0.3,\r
  draggable = true,\r
  clickToFront = true,\r
  onItemClick,\r
  alignToPath = false,\r
  intro = true,\r
  centerContent\r
}) {\r
  const rootRef = useRef(null);\r
  const engineRef = useRef(null);\r
  const clipId = useId().replace(/:/g, '');\r
  const [introPending] = useState(intro);\r
  const [measuredAspect, setAspect] = useState(null);\r
\r
  const center = baseWidth / 2;\r
\r
  const path = useMemo(() => {\r
    switch (shape) {\r
      case 'circle':\r
        return generateCirclePath(center, center, radius);\r
      case 'ellipse':\r
        return generateEllipsePath(center, center, radiusX, radiusY);\r
      case 'square':\r
        return generateSquarePath(center, center, radius * 2);\r
      case 'rectangle':\r
        return generateRectanglePath(center, center, radiusX * 2, radiusY * 2);\r
      case 'triangle':\r
        return generateTrianglePath(center, center, radius * 2);\r
      case 'star':\r
        return generateStarPath(center, center, radius, radius * starInnerRatio, starPoints);\r
      case 'heart':\r
        return generateHeartPath(center, center, radius * 2);\r
      case 'infinity':\r
        return generateInfinityPath(center, center, radiusX * 2, radiusY * 2);\r
      case 'wave':\r
        return generateWavePath(center, center, radiusX * 2, radiusY, 3);\r
      case 'custom':\r
        return customPath || generateCirclePath(center, center, radius);\r
      default:\r
        return generateEllipsePath(center, center, radiusX, radiusY);\r
    }\r
  }, [shape, customPath, center, radiusX, radiusY, radius, starPoints, starInnerRatio]);\r
\r
  const items = useMemo(\r
    () =>\r
      images.map((image, index) =>\r
        typeof image === 'string'\r
          ? { src: image, alt: \`\${altPrefix} \${index + 1}\` }\r
          : { src: image.src, alt: image.alt ?? \`\${altPrefix} \${index + 1}\` }\r
      ),\r
    [images, altPrefix]\r
  );\r
\r
  const interactive = !!onItemClick;\r
\r
  const config = useRef(null);\r
  config.current = {\r
    baseWidth,\r
    rotation,\r
    duration,\r
    itemSize,\r
    direction,\r
    fill,\r
    pathWidth,\r
    pathDash,\r
    easing,\r
    paused,\r
    depth,\r
    hoverScale,\r
    hoverSpeed,\r
    draggable,\r
    clickToFront,\r
    onItemClick,\r
    alignToPath,\r
    intro,\r
    sources: items.map(item => item.src)\r
  };\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const engine = createEngine(rootRef.current, config, setAspect);\r
    engineRef.current = engine;\r
    return () => {\r
      engine.destroy();\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useIsomorphicLayoutEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [\r
    path,\r
    rotation,\r
    baseWidth,\r
    itemSize,\r
    depth,\r
    hoverScale,\r
    items.length,\r
    showPath,\r
    pathWidth,\r
    pathDash,\r
    measuredAspect,\r
    height\r
  ]);\r
\r
  useEffect(() => {\r
    engineRef.current?.wake();\r
  });\r
\r
  const aspect = measuredAspect ?? estimateAspect({ shape, radiusX, radiusY, radius, itemSize });\r
  const autoHeight = height === 'auto' || height === undefined;\r
  const layered = depth > 0 && !!centerContent;\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={cx(\r
        'group/orbit relative isolate mx-auto select-none [-webkit-user-select:none] [-webkit-tap-highlight-color:transparent]',\r
        draggable &&\r
          'cursor-grab [touch-action:pan-y_pinch-zoom] data-[dragging]:cursor-grabbing [&[data-dragging]_*]:cursor-grabbing',\r
        className\r
      )}\r
      style={{\r
        width: toCssLength(width),\r
        height: autoHeight ? undefined : toCssLength(height),\r
        aspectRatio: autoHeight ? String(aspect) : undefined,\r
        '--orbit-radius':\r
          typeof itemRadius === 'number' ? \`\${(itemRadius / Math.max(1, itemSize)) * 100}%\` : itemRadius,\r
        '--orbit-shadow': String(clamp(shadow, 0, 1)),\r
        '--orbit-hover-scale': String(hoverScale)\r
      }}\r
      aria-hidden={interactive ? undefined : true}\r
      data-intro={introPending ? '' : undefined}\r
      data-draggable={draggable ? '' : undefined}\r
    >\r
      <svg\r
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"\r
        data-orbit-svg=""\r
        preserveAspectRatio="none"\r
        style={{ zIndex: 0, visibility: showPath ? undefined : 'hidden' }}\r
        aria-hidden="true"\r
      >\r
        <path\r
          data-orbit-path=""\r
          data-orbit-stroke=""\r
          d={path}\r
          fill="none"\r
          stroke={pathColor}\r
          strokeLinecap="round"\r
          transform={\`rotate(\${rotation} \${center} \${center})\`}\r
        />\r
      </svg>\r
      {showPath && layered && (\r
        <svg\r
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"\r
          data-orbit-svg=""\r
          preserveAspectRatio="none"\r
          style={{ zIndex: 105 }}\r
          aria-hidden="true"\r
        >\r
          <defs>\r
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">\r
              <rect data-orbit-clip="" />\r
            </clipPath>\r
          </defs>\r
          <g clipPath={\`url(#\${clipId})\`}>\r
            <path\r
              data-orbit-stroke=""\r
              d={path}\r
              fill="none"\r
              stroke={pathColor}\r
              strokeLinecap="round"\r
              transform={\`rotate(\${rotation} \${center} \${center})\`}\r
            />\r
          </g>\r
        </svg>\r
      )}\r
      {items.map((item, index) => (\r
        <div\r
          key={index}\r
          className={cx(\r
            'group/item absolute left-0 top-0 will-change-[transform,opacity] focus-visible:outline-none group-data-[intro]/orbit:opacity-0',\r
            (clickToFront || interactive) && 'cursor-pointer'\r
          )}\r
          data-orbit-item={index}\r
          data-clickable={clickToFront || interactive ? '' : undefined}\r
          role={interactive ? 'button' : undefined}\r
          tabIndex={interactive ? 0 : undefined}\r
          aria-label={interactive ? item.alt : undefined}\r
        >\r
          <div className="h-full w-full overflow-hidden rounded-[var(--orbit-radius)] [box-shadow:0_calc(var(--orbit-shadow)*16px)_calc(var(--orbit-shadow)*36px)_rgba(0,0,0,calc(var(--orbit-shadow)*0.45))] transition-transform duration-[450ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none group-hover/item:scale-[var(--orbit-hover-scale)] group-focus-visible/item:scale-[var(--orbit-hover-scale)] group-focus-visible/item:outline-2 group-focus-visible/item:outline-offset-[3px] group-focus-visible/item:outline-current">\r
            <img\r
              src={item.src}\r
              alt={item.alt}\r
              draggable={false}\r
              decoding="async"\r
              className="pointer-events-none block h-full w-full object-cover [-webkit-user-drag:none]"\r
            />\r
          </div>\r
        </div>\r
      ))}\r
      {centerContent && (\r
        <div\r
          className="pointer-events-none absolute inset-0 z-[100] flex items-center justify-center [&>*]:pointer-events-auto"\r
          data-orbit-center=""\r
        >\r
          {centerContent}\r
        </div>\r
      )}\r
    </div>\r
  );\r
}\r
`,t=`'use client';\r
\r
// Component created by Dominik Koch\r
// https://x.com/dominikkoch\r
\r
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';\r
import './OrbitImages.css';\r
\r
type OrbitShape =\r
  | 'ellipse'\r
  | 'circle'\r
  | 'square'\r
  | 'rectangle'\r
  | 'triangle'\r
  | 'star'\r
  | 'heart'\r
  | 'infinity'\r
  | 'wave'\r
  | 'custom';\r
\r
export type OrbitImage = string | { src: string; alt?: string };\r
\r
export interface OrbitImagesProps {\r
  images?: OrbitImage[];\r
  altPrefix?: string;\r
  shape?: OrbitShape;\r
  customPath?: string;\r
  baseWidth?: number;\r
  radiusX?: number;\r
  radiusY?: number;\r
  radius?: number;\r
  starPoints?: number;\r
  starInnerRatio?: number;\r
  rotation?: number;\r
  duration?: number;\r
  itemSize?: number;\r
  direction?: 'normal' | 'reverse';\r
  fill?: boolean;\r
  width?: number | string;\r
  height?: number | string;\r
  className?: string;\r
  showPath?: boolean;\r
  pathColor?: string;\r
  pathWidth?: number;\r
  pathDash?: number;\r
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';\r
  paused?: boolean;\r
  depth?: number;\r
  itemRadius?: number | string;\r
  shadow?: number;\r
  hoverScale?: number;\r
  hoverSpeed?: number;\r
  draggable?: boolean;\r
  clickToFront?: boolean;\r
  onItemClick?: (index: number, src: string) => void;\r
  alignToPath?: boolean;\r
  intro?: boolean;\r
  centerContent?: ReactNode;\r
  responsive?: boolean;\r
}\r
\r
interface OrbitConfig {\r
  baseWidth: number;\r
  rotation: number;\r
  duration: number;\r
  itemSize: number;\r
  direction: 'normal' | 'reverse';\r
  fill: boolean;\r
  pathWidth: number;\r
  pathDash: number;\r
  easing: string;\r
  paused: boolean;\r
  depth: number;\r
  hoverScale: number;\r
  hoverSpeed: number;\r
  draggable: boolean;\r
  clickToFront: boolean;\r
  onItemClick?: (index: number, src: string) => void;\r
  alignToPath: boolean;\r
  intro: boolean;\r
  sources: string[];\r
}\r
\r
interface OrbitItemState {\r
  el: HTMLElement;\r
  t: string;\r
  o: string;\r
  z: string;\r
}\r
\r
interface Drag {\r
  id: number;\r
  x: number;\r
  y: number;\r
  active: boolean;\r
  samples: [number, number][];\r
  rate: number;\r
  anchor: number;\r
  manual: number;\r
}\r
\r
interface Seek {\r
  from: number;\r
  delta: number;\r
  t: number;\r
  dur: number;\r
}\r
\r
interface EngineState {\r
  lut: Float32Array | null;\r
  length: number;\r
  front: number;\r
  yMid: number;\r
  yHalf: number;\r
  bbox: [number, number, number, number];\r
  width: number;\r
  height: number;\r
  scale: number;\r
  size: number;\r
  items: OrbitItemState[];\r
  strokes: SVGPathElement[];\r
  lap: number;\r
  manual: number;\r
  glide: number;\r
  speed: number;\r
  drag: Drag | null;\r
  seek: Seek | null;\r
  hovered: boolean;\r
  hoverIndex: number;\r
  suppressUntil: number;\r
  introStart: number;\r
  introDone: boolean;\r
  visible: boolean;\r
  reduced: boolean;\r
  raf: number;\r
  last: number;\r
  destroyed: boolean;\r
}\r
\r
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const SAMPLES = 720;\r
const FRONT_GROW = 0.3;\r
const BACK_SHRINK = 0.45;\r
const BACK_DIM = 0.55;\r
const INTRO_SPREAD = 1.3;\r
const INTRO_FADE = 0.45;\r
const DRAG_THRESHOLD = 5;\r
\r
function generateEllipsePath(cx: number, cy: number, rx: number, ry: number): string {\r
  return \`M \${cx - rx} \${cy} A \${rx} \${ry} 0 1 0 \${cx + rx} \${cy} A \${rx} \${ry} 0 1 0 \${cx - rx} \${cy}\`;\r
}\r
\r
function generateCirclePath(cx: number, cy: number, r: number): string {\r
  return generateEllipsePath(cx, cy, r, r);\r
}\r
\r
function generateSquarePath(cx: number, cy: number, size: number): string {\r
  const h = size / 2;\r
  return \`M \${cx - h} \${cy - h} L \${cx + h} \${cy - h} L \${cx + h} \${cy + h} L \${cx - h} \${cy + h} Z\`;\r
}\r
\r
function generateRectanglePath(cx: number, cy: number, w: number, h: number): string {\r
  const hw = w / 2;\r
  const hh = h / 2;\r
  return \`M \${cx - hw} \${cy - hh} L \${cx + hw} \${cy - hh} L \${cx + hw} \${cy + hh} L \${cx - hw} \${cy + hh} Z\`;\r
}\r
\r
function generateTrianglePath(cx: number, cy: number, size: number): string {\r
  const height = (size * Math.sqrt(3)) / 2;\r
  const hs = size / 2;\r
  return \`M \${cx} \${cy - height / 1.5} L \${cx + hs} \${cy + height / 3} L \${cx - hs} \${cy + height / 3} Z\`;\r
}\r
\r
function generateStarPath(cx: number, cy: number, outerR: number, innerR: number, points: number): string {\r
  const step = Math.PI / points;\r
  let path = '';\r
  for (let i = 0; i < 2 * points; i++) {\r
    const r = i % 2 === 0 ? outerR : innerR;\r
    const angle = i * step - Math.PI / 2;\r
    const x = cx + r * Math.cos(angle);\r
    const y = cy + r * Math.sin(angle);\r
    path += i === 0 ? \`M \${x} \${y}\` : \` L \${x} \${y}\`;\r
  }\r
  return path + ' Z';\r
}\r
\r
function generateHeartPath(cx: number, cy: number, size: number): string {\r
  const s = size / 30;\r
  return \`M \${cx} \${cy + 12 * s} C \${cx - 20 * s} \${cy - 5 * s}, \${cx - 12 * s} \${cy - 18 * s}, \${cx} \${cy - 8 * s} C \${cx + 12 * s} \${cy - 18 * s}, \${cx + 20 * s} \${cy - 5 * s}, \${cx} \${cy + 12 * s}\`;\r
}\r
\r
function generateInfinityPath(cx: number, cy: number, w: number, h: number): string {\r
  const hw = w / 2;\r
  const hh = h / 2;\r
  return \`M \${cx} \${cy} C \${cx + hw * 0.5} \${cy - hh}, \${cx + hw} \${cy - hh}, \${cx + hw} \${cy} C \${cx + hw} \${cy + hh}, \${cx + hw * 0.5} \${cy + hh}, \${cx} \${cy} C \${cx - hw * 0.5} \${cy + hh}, \${cx - hw} \${cy + hh}, \${cx - hw} \${cy} C \${cx - hw} \${cy - hh}, \${cx - hw * 0.5} \${cy - hh}, \${cx} \${cy}\`;\r
}\r
\r
function generateWavePath(cx: number, cy: number, w: number, amplitude: number, waves: number): string {\r
  const pts: string[] = [];\r
  const segs = waves * 20;\r
  const hw = w / 2;\r
  for (let i = 0; i <= segs; i++) {\r
    const x = cx - hw + (w * i) / segs;\r
    const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;\r
    pts.push(i === 0 ? \`M \${x} \${y}\` : \`L \${x} \${y}\`);\r
  }\r
  for (let i = segs; i >= 0; i--) {\r
    const x = cx - hw + (w * i) / segs;\r
    const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;\r
    pts.push(\`L \${x} \${y}\`);\r
  }\r
  return pts.join(' ') + ' Z';\r
}\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toCssLength = (value: number | string | undefined) => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const wrapSigned = (value: number) => value - Math.round(value);\r
\r
const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {\r
  const sample = (a1: number, a2: number, t: number) =>\r
    ((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t * t + 3 * a1 * t;\r
  const slope = (a1: number, a2: number, t: number) =>\r
    3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;\r
  return (x: number) => {\r
    if (x <= 0 || x >= 1) return x;\r
    let t = x;\r
    for (let i = 0; i < 8; i++) {\r
      const s = slope(x1, x2, t);\r
      if (Math.abs(s) < 1e-6) break;\r
      t = clamp(t - (sample(x1, x2, t) - x) / s, 0, 1);\r
    }\r
    return sample(y1, y2, t);\r
  };\r
};\r
\r
const EASINGS: Record<string, (t: number) => number> = {\r
  linear: (t: number) => t,\r
  easeIn: cubicBezier(0.42, 0, 1, 1),\r
  easeOut: cubicBezier(0, 0, 0.58, 1),\r
  easeInOut: cubicBezier(0.42, 0, 0.58, 1)\r
};\r
\r
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);\r
\r
const estimateAspect = ({\r
  shape,\r
  radiusX,\r
  radiusY,\r
  radius,\r
  itemSize\r
}: {\r
  shape: string;\r
  radiusX: number;\r
  radiusY: number;\r
  radius: number;\r
  itemSize: number;\r
}) => {\r
  const wide = shape === 'ellipse' || shape === 'rectangle' || shape === 'infinity' || shape === 'wave';\r
  const w = (wide ? radiusX : radius) * 2 + itemSize * 1.6;\r
  const h = (wide ? radiusY : radius) * 2 + itemSize * 1.6;\r
  return w > 0 && h > 0 ? w / h : 1;\r
};\r
\r
const createEngine = (\r
  root: HTMLDivElement,\r
  config: React.MutableRefObject<OrbitConfig>,\r
  setAspect: (aspect: number) => void\r
) => {\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const st: EngineState = {\r
    lut: null,\r
    length: 0,\r
    front: 0,\r
    yMid: 0,\r
    yHalf: 1,\r
    bbox: [0, 0, 1, 1],\r
    width: 0,\r
    height: 0,\r
    scale: 0,\r
    size: 0,\r
    items: [],\r
    strokes: [],\r
    lap: 0,\r
    manual: 0,\r
    glide: 0,\r
    speed: 1,\r
    drag: null,\r
    seek: null,\r
    hovered: false,\r
    hoverIndex: -1,\r
    suppressUntil: 0,\r
    introStart: -1,\r
    introDone: !config.current.intro,\r
    visible: typeof IntersectionObserver === 'undefined',\r
    reduced: !!query?.matches,\r
    raf: 0,\r
    last: 0,\r
    destroyed: false\r
  };\r
  st.speed = st.reduced || config.current.paused ? 0 : 1;\r
\r
  const collect = () => {\r
    st.items = Array.from(root.querySelectorAll<HTMLElement>('[data-orbit-item]')).map(el => ({\r
      el,\r
      t: '',\r
      o: '',\r
      z: ''\r
    }));\r
    st.strokes = Array.from(root.querySelectorAll<SVGPathElement>('[data-orbit-stroke]'));\r
  };\r
\r
  const build = () => {\r
    const cfg = config.current;\r
    const path = root.querySelector<SVGPathElement>('[data-orbit-path]');\r
    let length = 0;\r
    try {\r
      length = path ? path.getTotalLength() : 0;\r
    } catch {\r
      length = 0;\r
    }\r
    if (!path || !length || !isFinite(length)) {\r
      st.lut = null;\r
      return;\r
    }\r
    const lut = new Float32Array(SAMPLES * 2);\r
    const angle = (cfg.rotation * Math.PI) / 180;\r
    const cos = Math.cos(angle);\r
    const sin = Math.sin(angle);\r
    const origin = cfg.baseWidth / 2;\r
    let x0 = Infinity;\r
    let x1 = -Infinity;\r
    let y0 = Infinity;\r
    let y1 = -Infinity;\r
    let front = 0;\r
    for (let i = 0; i < SAMPLES; i++) {\r
      const point = path.getPointAtLength((i / SAMPLES) * length);\r
      const dx = point.x - origin;\r
      const dy = point.y - origin;\r
      const x = origin + dx * cos - dy * sin;\r
      const y = origin + dx * sin + dy * cos;\r
      lut[i * 2] = x;\r
      lut[i * 2 + 1] = y;\r
      x0 = Math.min(x0, x);\r
      x1 = Math.max(x1, x);\r
      y0 = Math.min(y0, y);\r
      y1 = Math.max(y1, y);\r
      if (y > lut[front * 2 + 1] + 1e-6) front = i;\r
    }\r
    st.lut = lut;\r
    st.length = length;\r
    st.front = front / SAMPLES;\r
    st.yMid = (y0 + y1) / 2;\r
    st.yHalf = Math.max(1e-3, (y1 - y0) / 2);\r
    const depth = clamp(cfg.depth, 0, 1);\r
    const margin = (cfg.itemSize / 2) * (1 + depth * FRONT_GROW) * Math.max(1, cfg.hoverScale) + 2;\r
    st.bbox = [x0 - margin, y0 - margin, x1 + margin, y1 + margin];\r
    setAspect((x1 - x0 + margin * 2) / (y1 - y0 + margin * 2));\r
  };\r
\r
  const layout = () => {\r
    const cfg = config.current;\r
    st.width = root.clientWidth;\r
    st.height = root.clientHeight;\r
    if (!st.lut) return;\r
    const [bx0, by0, bx1, by1] = st.bbox;\r
    const scale = Math.min(st.width / (bx1 - bx0), st.height / (by1 - by0));\r
    st.scale = scale > 0 && isFinite(scale) ? scale : 0;\r
    st.size = cfg.itemSize * st.scale;\r
    for (const it of st.items) {\r
      it.el.style.width = \`\${st.size}px\`;\r
      it.el.style.height = \`\${st.size}px\`;\r
    }\r
    if (!st.scale) return;\r
    const vw = st.width / st.scale;\r
    const vh = st.height / st.scale;\r
    const cx = (bx0 + bx1) / 2;\r
    const cy = (by0 + by1) / 2;\r
    root.querySelectorAll('[data-orbit-svg]').forEach(svg => {\r
      svg.setAttribute('viewBox', \`\${cx - vw / 2} \${cy - vh / 2} \${vw} \${vh}\`);\r
    });\r
    const clip = root.querySelector('[data-orbit-clip]');\r
    if (clip) {\r
      clip.setAttribute('x', String(cx - vw));\r
      clip.setAttribute('y', String(st.yMid));\r
      clip.setAttribute('width', String(vw * 2));\r
      clip.setAttribute('height', String(vh * 2));\r
    }\r
    for (const stroke of st.strokes) {\r
      stroke.style.strokeWidth = String(cfg.pathWidth / st.scale);\r
    }\r
    applyDash(1);\r
  };\r
\r
  const applyDash = (reveal: number) => {\r
    const cfg = config.current;\r
    const dash = cfg.pathDash > 0 && st.scale ? cfg.pathDash / st.scale : 0;\r
    for (const stroke of st.strokes) {\r
      if (reveal < 1 && !dash) {\r
        stroke.style.strokeDasharray = \`\${st.length} \${st.length}\`;\r
        stroke.style.strokeDashoffset = String(st.length * (1 - reveal));\r
        stroke.style.opacity = '';\r
      } else {\r
        stroke.style.strokeDasharray = dash ? \`\${dash} \${dash * 1.6}\` : '';\r
        stroke.style.strokeDashoffset = '';\r
        stroke.style.opacity = reveal < 1 ? String(reveal) : '';\r
      }\r
    }\r
  };\r
\r
  const sample = (u: number): [number, number] => {\r
    const f = (((u % 1) + 1) % 1) * SAMPLES;\r
    const i0 = Math.floor(f) % SAMPLES;\r
    const i1 = (i0 + 1) % SAMPLES;\r
    const t = f - Math.floor(f);\r
    const lut = st.lut as Float32Array;\r
    return [lut[i0 * 2] + (lut[i1 * 2] - lut[i0 * 2]) * t, lut[i0 * 2 + 1] + (lut[i1 * 2 + 1] - lut[i0 * 2 + 1]) * t];\r
  };\r
\r
  const heading = (u: number) => {\r
    const a = sample(u - 2 / SAMPLES);\r
    const b = sample(u + 2 / SAMPLES);\r
    return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;\r
  };\r
\r
  const progress = () => {\r
    const cfg = config.current;\r
    const ease = EASINGS[cfg.easing] || EASINGS.linear;\r
    const whole = Math.floor(st.lap);\r
    return (whole + ease(st.lap - whole)) * (cfg.direction === 'reverse' ? -1 : 1) + st.manual;\r
  };\r
\r
  const offsetOf = (index: number, count: number) => {\r
    const cfg = config.current;\r
    if (cfg.fill) return index / Math.max(1, count);\r
    return (-index * cfg.itemSize * 1.3) / Math.max(1, st.length);\r
  };\r
\r
  const write = (it: OrbitItemState, key: 't' | 'o' | 'z', prop: 'transform' | 'opacity' | 'zIndex', value: string) => {\r
    if (it[key] !== value) {\r
      it[key] = value;\r
      it.el.style[prop] = value;\r
    }\r
  };\r
\r
  const render = (now: number) => {\r
    const cfg = config.current;\r
    if (!st.lut || !st.scale) return;\r
    const p = progress();\r
    const count = st.items.length;\r
    const depth = clamp(cfg.depth, 0, 1);\r
    const [bx0, by0, bx1, by1] = st.bbox;\r
    const cx = (bx0 + bx1) / 2;\r
    const cy = (by0 + by1) / 2;\r
    const half = st.size / 2;\r
    const introRunning = st.introStart >= 0;\r
    const elapsed = introRunning ? (now - st.introStart) / 1000 : 0;\r
    const spread = introRunning ? easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)) : 1;\r
    const appear = introRunning ? clamp(elapsed / INTRO_FADE, 0, 1) : 1;\r
    for (let i = 0; i < count; i++) {\r
      const it = st.items[i];\r
      let u = p + offsetOf(i, count);\r
      if (introRunning) u = st.front + wrapSigned(u - st.front) * spread;\r
      const [x, y] = sample(u);\r
      const d = clamp((y - st.yMid) / st.yHalf, -1, 1);\r
      const w = (d + 1) / 2;\r
      let scale = 1 + depth * (FRONT_GROW * w - BACK_SHRINK * (1 - w));\r
      let opacity = 1 - depth * BACK_DIM * (1 - w);\r
      if (introRunning) {\r
        scale *= 0.7 + 0.3 * appear;\r
        opacity *= appear * appear * (3 - 2 * appear);\r
      }\r
      const sx = (x - cx) * st.scale + st.width / 2 - half;\r
      const sy = (y - cy) * st.scale + st.height / 2 - half;\r
      const rot = cfg.alignToPath ? heading(u) : 0;\r
      let z = depth > 0 ? (d <= 0 ? 10 + Math.round((d + 1) * 80) : 110 + Math.round(d * 80)) : 1;\r
      if (i === st.hoverIndex) z += 200;\r
      write(\r
        it,\r
        't',\r
        'transform',\r
        \`translate3d(\${sx.toFixed(2)}px, \${sy.toFixed(2)}px, 0px)\${rot ? \` rotate(\${rot.toFixed(2)}deg)\` : ''} scale(\${scale.toFixed(4)})\`\r
      );\r
      write(it, 'o', 'opacity', opacity > 0.999 ? '' : opacity.toFixed(3));\r
      write(it, 'z', 'zIndex', String(z));\r
    }\r
    if (introRunning) applyDash(easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)));\r
  };\r
\r
  const frame = (now: number) => {\r
    st.raf = 0;\r
    if (st.destroyed) return;\r
    const cfg = config.current;\r
    const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.1) : 0;\r
    st.last = now;\r
    let busy = false;\r
    if (st.lut && st.scale && st.introStart === -1 && !st.introDone && st.visible) {\r
      if (cfg.intro && !st.reduced) {\r
        st.introStart = now;\r
      } else {\r
        st.introDone = true;\r
      }\r
      root.removeAttribute('data-intro');\r
    }\r
    if (st.introStart >= 0) {\r
      if ((now - st.introStart) / 1000 >= INTRO_SPREAD) {\r
        st.introStart = -2;\r
        st.introDone = true;\r
        applyDash(1);\r
      } else {\r
        busy = true;\r
      }\r
    }\r
    const want = cfg.paused || st.reduced ? 0 : st.hovered ? clamp(cfg.hoverSpeed, 0, 1) : 1;\r
    if (st.speed !== want) {\r
      st.speed += (want - st.speed) * (1 - Math.exp(-dt / 0.35));\r
      if (Math.abs(st.speed - want) < 0.002) st.speed = want;\r
      busy = true;\r
    }\r
    if (st.speed > 0 && cfg.duration > 0) {\r
      st.lap += (dt * st.speed) / cfg.duration;\r
      busy = true;\r
    }\r
    if (st.drag?.active) {\r
      busy = true;\r
    } else if (st.seek) {\r
      st.seek.t = Math.min(1, st.seek.t + dt / st.seek.dur);\r
      const e = st.seek.t < 0.5 ? 4 * st.seek.t ** 3 : 1 - Math.pow(-2 * st.seek.t + 2, 3) / 2;\r
      st.manual = st.seek.from + st.seek.delta * e;\r
      if (st.seek.t >= 1) st.seek = null;\r
      busy = true;\r
    } else if (st.glide) {\r
      st.manual += st.glide * dt;\r
      st.glide *= Math.exp(-dt / 0.7);\r
      if (Math.abs(st.glide) < 0.0004) st.glide = 0;\r
      busy = true;\r
    }\r
    render(now);\r
    const whole = Math.floor(st.lap);\r
    if (whole) st.lap -= whole;\r
    if (!st.drag && !st.seek) st.manual -= Math.floor(st.manual);\r
    if (busy && st.visible && !st.destroyed) st.raf = requestAnimationFrame(frame);\r
  };\r
\r
  const wake = () => {\r
    if (st.raf || st.destroyed || !st.visible) return;\r
    st.last = 0;\r
    st.raf = requestAnimationFrame(frame);\r
  };\r
\r
  const local = (e: PointerEvent): [number, number] => {\r
    const r = root.getBoundingClientRect();\r
    const k = root.offsetWidth ? r.width / root.offsetWidth || 1 : 1;\r
    return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];\r
  };\r
\r
  const dragRate = () => {\r
    if (!st.lut || !st.scale) return 0;\r
    const a = sample(st.front - 3 / SAMPLES);\r
    const b = sample(st.front + 3 / SAMPLES);\r
    const along = ((b[0] - a[0]) / (6 / SAMPLES)) * st.scale;\r
    const floor = st.length * st.scale * 0.35;\r
    return Math.abs(along) < floor ? Math.sign(along || 1) * floor : along;\r
  };\r
\r
  const itemIndex = (target: EventTarget | null) => {\r
    const el = target instanceof Element ? target.closest('[data-orbit-item]') : null;\r
    return el && root.contains(el) ? Number(el.getAttribute('data-orbit-item')) : -1;\r
  };\r
\r
  const bringToFront = (index: number) => {\r
    if (!st.lut || index < 0) return;\r
    const u = progress() + offsetOf(index, st.items.length);\r
    const delta = wrapSigned(st.front - u);\r
    st.glide = 0;\r
    st.seek = { from: st.manual, delta, t: 0, dur: 0.45 + Math.abs(delta) * 1.4 };\r
    wake();\r
  };\r
\r
  const onEnter = () => {\r
    st.hovered = true;\r
    wake();\r
  };\r
\r
  const onLeave = () => {\r
    st.hovered = false;\r
    st.hoverIndex = -1;\r
    wake();\r
  };\r
\r
  const onOver = (e: PointerEvent) => {\r
    const index = itemIndex(e.target);\r
    if (index !== st.hoverIndex) {\r
      st.hoverIndex = index;\r
      if (st.lut) render(performance.now());\r
    }\r
  };\r
\r
  const onDown = (e: PointerEvent) => {\r
    const cfg = config.current;\r
    if (!cfg.draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
    if (e.target instanceof Element && e.target.closest('[data-orbit-center]')) return;\r
    const [x, y] = local(e);\r
    st.drag = { id: e.pointerId, x, y, active: false, samples: [], rate: dragRate(), anchor: 0, manual: 0 };\r
  };\r
\r
  const onMove = (e: PointerEvent) => {\r
    const d = st.drag;\r
    if (!d || e.pointerId !== d.id) return;\r
    const [x, y] = local(e);\r
    const along = x - d.x;\r
    if (!d.active) {\r
      if (Math.abs(along) < DRAG_THRESHOLD) return;\r
      if (Math.abs(y - d.y) > Math.abs(along)) {\r
        st.drag = null;\r
        return;\r
      }\r
      d.active = true;\r
      d.anchor = along;\r
      d.manual = st.manual;\r
      st.seek = null;\r
      st.glide = 0;\r
      try {\r
        root.setPointerCapture(e.pointerId);\r
      } catch {}\r
      root.setAttribute('data-dragging', '');\r
    }\r
    if (d.rate) st.manual = d.manual + (along - d.anchor) / d.rate;\r
    const now = performance.now();\r
    d.samples.push([now, along]);\r
    while (d.samples.length > 2 && now - d.samples[0][0] > 100) d.samples.shift();\r
    wake();\r
  };\r
\r
  const endDrag = (e: PointerEvent, cancelled: boolean) => {\r
    const d = st.drag;\r
    if (!d || e.pointerId !== d.id) return;\r
    st.drag = null;\r
    if (!d.active) return;\r
    root.removeAttribute('data-dragging');\r
    try {\r
      root.releasePointerCapture(e.pointerId);\r
    } catch {}\r
    const now = performance.now();\r
    st.suppressUntil = now + 400;\r
    const s = d.samples;\r
    if (!cancelled && s.length > 1 && d.rate) {\r
      const [t0, a0] = s[0];\r
      const [t1, a1] = s[s.length - 1];\r
      if (t1 > t0 && now - t1 < 80) st.glide = clamp((((a1 - a0) / (t1 - t0)) * 1000) / d.rate, -3, 3);\r
    }\r
    wake();\r
  };\r
\r
  const onUp = (e: PointerEvent) => endDrag(e, false);\r
  const onCancel = (e: PointerEvent) => endDrag(e, true);\r
\r
  const activate = (index: number) => {\r
    const cfg = config.current;\r
    if (index < 0) return;\r
    if (cfg.clickToFront) bringToFront(index);\r
    cfg.onItemClick?.(index, cfg.sources[index]);\r
  };\r
\r
  const onClick = (e: MouseEvent) => {\r
    if (performance.now() < st.suppressUntil) {\r
      e.preventDefault();\r
      e.stopPropagation();\r
      st.suppressUntil = 0;\r
      return;\r
    }\r
    activate(itemIndex(e.target));\r
  };\r
\r
  const onKey = (e: KeyboardEvent) => {\r
    if (e.key !== 'Enter' && e.key !== ' ') return;\r
    const index = itemIndex(e.target);\r
    if (index < 0) return;\r
    e.preventDefault();\r
    activate(index);\r
  };\r
\r
  const onFocus = (e: FocusEvent) => {\r
    const index = itemIndex(e.target);\r
    if (index >= 0 && config.current.clickToFront && e.target instanceof Element && e.target.matches(':focus-visible'))\r
      bringToFront(index);\r
  };\r
\r
  const onMotion = () => {\r
    st.reduced = !!query?.matches;\r
    wake();\r
  };\r
\r
  root.addEventListener('pointerenter', onEnter);\r
  root.addEventListener('pointerleave', onLeave);\r
  root.addEventListener('pointerover', onOver);\r
  root.addEventListener('pointerdown', onDown);\r
  root.addEventListener('pointermove', onMove);\r
  root.addEventListener('pointerup', onUp);\r
  root.addEventListener('pointercancel', onCancel);\r
  root.addEventListener('lostpointercapture', onCancel);\r
  root.addEventListener('click', onClick);\r
  root.addEventListener('keydown', onKey);\r
  root.addEventListener('focusin', onFocus);\r
  query?.addEventListener?.('change', onMotion);\r
\r
  let resizeObserver: ResizeObserver | null = null;\r
  if (typeof ResizeObserver !== 'undefined') {\r
    resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      render(performance.now());\r
      wake();\r
    });\r
    resizeObserver.observe(root);\r
  }\r
\r
  let intersection: IntersectionObserver | null = null;\r
  if (typeof IntersectionObserver !== 'undefined') {\r
    intersection = new IntersectionObserver(\r
      entries => {\r
        st.visible = entries[entries.length - 1].isIntersecting;\r
        if (st.visible) wake();\r
      },\r
      { threshold: 0.05 }\r
    );\r
    intersection.observe(root);\r
  }\r
\r
  const onVisibility = () => {\r
    if (!document.hidden) wake();\r
  };\r
  document.addEventListener('visibilitychange', onVisibility);\r
  window.addEventListener('resize', wake);\r
\r
  const refresh = () => {\r
    collect();\r
    build();\r
    layout();\r
    render(performance.now());\r
    wake();\r
  };\r
\r
  const destroy = () => {\r
    st.destroyed = true;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    root.removeEventListener('pointerenter', onEnter);\r
    root.removeEventListener('pointerleave', onLeave);\r
    root.removeEventListener('pointerover', onOver);\r
    root.removeEventListener('pointerdown', onDown);\r
    root.removeEventListener('pointermove', onMove);\r
    root.removeEventListener('pointerup', onUp);\r
    root.removeEventListener('pointercancel', onCancel);\r
    root.removeEventListener('lostpointercapture', onCancel);\r
    root.removeEventListener('click', onClick);\r
    root.removeEventListener('keydown', onKey);\r
    root.removeEventListener('focusin', onFocus);\r
    query?.removeEventListener?.('change', onMotion);\r
    document.removeEventListener('visibilitychange', onVisibility);\r
    window.removeEventListener('resize', wake);\r
    resizeObserver?.disconnect();\r
    intersection?.disconnect();\r
  };\r
\r
  return { refresh, wake, destroy };\r
};\r
\r
export default function OrbitImages({\r
  images = [],\r
  altPrefix = 'Orbiting image',\r
  shape = 'ellipse',\r
  customPath,\r
  baseWidth = 1400,\r
  radiusX = 700,\r
  radiusY = 170,\r
  radius = 300,\r
  starPoints = 5,\r
  starInnerRatio = 0.5,\r
  rotation = -8,\r
  duration = 40,\r
  itemSize = 64,\r
  direction = 'normal',\r
  fill = true,\r
  width = '100%',\r
  height = 'auto',\r
  className = '',\r
  showPath = false,\r
  pathColor = 'rgba(128,128,128,0.35)',\r
  pathWidth = 2,\r
  pathDash = 0,\r
  easing = 'linear',\r
  paused = false,\r
  depth = 0.5,\r
  itemRadius = 12,\r
  shadow = 0.3,\r
  hoverScale = 1.08,\r
  hoverSpeed = 0.3,\r
  draggable = true,\r
  clickToFront = true,\r
  onItemClick,\r
  alignToPath = false,\r
  intro = true,\r
  centerContent\r
}: OrbitImagesProps) {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);\r
  const clipId = useId().replace(/:/g, '');\r
  const [introPending] = useState(intro);\r
  const [measuredAspect, setAspect] = useState<number | null>(null);\r
\r
  const center = baseWidth / 2;\r
\r
  const path = useMemo(() => {\r
    switch (shape) {\r
      case 'circle':\r
        return generateCirclePath(center, center, radius);\r
      case 'ellipse':\r
        return generateEllipsePath(center, center, radiusX, radiusY);\r
      case 'square':\r
        return generateSquarePath(center, center, radius * 2);\r
      case 'rectangle':\r
        return generateRectanglePath(center, center, radiusX * 2, radiusY * 2);\r
      case 'triangle':\r
        return generateTrianglePath(center, center, radius * 2);\r
      case 'star':\r
        return generateStarPath(center, center, radius, radius * starInnerRatio, starPoints);\r
      case 'heart':\r
        return generateHeartPath(center, center, radius * 2);\r
      case 'infinity':\r
        return generateInfinityPath(center, center, radiusX * 2, radiusY * 2);\r
      case 'wave':\r
        return generateWavePath(center, center, radiusX * 2, radiusY, 3);\r
      case 'custom':\r
        return customPath || generateCirclePath(center, center, radius);\r
      default:\r
        return generateEllipsePath(center, center, radiusX, radiusY);\r
    }\r
  }, [shape, customPath, center, radiusX, radiusY, radius, starPoints, starInnerRatio]);\r
\r
  const items = useMemo(\r
    () =>\r
      images.map((image, index) =>\r
        typeof image === 'string'\r
          ? { src: image, alt: \`\${altPrefix} \${index + 1}\` }\r
          : { src: image.src, alt: image.alt ?? \`\${altPrefix} \${index + 1}\` }\r
      ),\r
    [images, altPrefix]\r
  );\r
\r
  const interactive = !!onItemClick;\r
\r
  const config = useRef<OrbitConfig>({} as OrbitConfig);\r
  config.current = {\r
    baseWidth,\r
    rotation,\r
    duration,\r
    itemSize,\r
    direction,\r
    fill,\r
    pathWidth,\r
    pathDash,\r
    easing,\r
    paused,\r
    depth,\r
    hoverScale,\r
    hoverSpeed,\r
    draggable,\r
    clickToFront,\r
    onItemClick,\r
    alignToPath,\r
    intro,\r
    sources: items.map(item => item.src)\r
  };\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const engine = createEngine(rootRef.current as HTMLDivElement, config, setAspect);\r
    engineRef.current = engine;\r
    return () => {\r
      engine.destroy();\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useIsomorphicLayoutEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [\r
    path,\r
    rotation,\r
    baseWidth,\r
    itemSize,\r
    depth,\r
    hoverScale,\r
    items.length,\r
    showPath,\r
    pathWidth,\r
    pathDash,\r
    measuredAspect,\r
    height\r
  ]);\r
\r
  useEffect(() => {\r
    engineRef.current?.wake();\r
  });\r
\r
  const aspect = measuredAspect ?? estimateAspect({ shape, radiusX, radiusY, radius, itemSize });\r
  const autoHeight = height === 'auto' || height === undefined;\r
  const layered = depth > 0 && !!centerContent;\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`orbit-container \${className}\`.trim()}\r
      style={\r
        {\r
          width: toCssLength(width),\r
          height: autoHeight ? undefined : toCssLength(height),\r
          aspectRatio: autoHeight ? String(aspect) : undefined,\r
          '--orbit-radius':\r
            typeof itemRadius === 'number' ? \`\${(itemRadius / Math.max(1, itemSize)) * 100}%\` : itemRadius,\r
          '--orbit-shadow': String(clamp(shadow, 0, 1)),\r
          '--orbit-hover-scale': String(hoverScale)\r
        } as React.CSSProperties\r
      }\r
      aria-hidden={interactive ? undefined : true}\r
      data-intro={introPending ? '' : undefined}\r
      data-draggable={draggable ? '' : undefined}\r
    >\r
      <svg\r
        className="orbit-path-svg"\r
        data-orbit-svg=""\r
        preserveAspectRatio="none"\r
        style={{ zIndex: 0, visibility: showPath ? undefined : 'hidden' }}\r
        aria-hidden="true"\r
      >\r
        <path\r
          data-orbit-path=""\r
          data-orbit-stroke=""\r
          d={path}\r
          fill="none"\r
          stroke={pathColor}\r
          strokeLinecap="round"\r
          transform={\`rotate(\${rotation} \${center} \${center})\`}\r
        />\r
      </svg>\r
      {showPath && layered && (\r
        <svg\r
          className="orbit-path-svg"\r
          data-orbit-svg=""\r
          preserveAspectRatio="none"\r
          style={{ zIndex: 105 }}\r
          aria-hidden="true"\r
        >\r
          <defs>\r
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">\r
              <rect data-orbit-clip="" />\r
            </clipPath>\r
          </defs>\r
          <g clipPath={\`url(#\${clipId})\`}>\r
            <path\r
              data-orbit-stroke=""\r
              d={path}\r
              fill="none"\r
              stroke={pathColor}\r
              strokeLinecap="round"\r
              transform={\`rotate(\${rotation} \${center} \${center})\`}\r
            />\r
          </g>\r
        </svg>\r
      )}\r
      {items.map((item, index) => (\r
        <div\r
          key={index}\r
          className="orbit-item"\r
          data-orbit-item={index}\r
          data-clickable={clickToFront || interactive ? '' : undefined}\r
          role={interactive ? 'button' : undefined}\r
          tabIndex={interactive ? 0 : undefined}\r
          aria-label={interactive ? item.alt : undefined}\r
        >\r
          <div className="orbit-item-inner">\r
            <img src={item.src} alt={item.alt} draggable={false} decoding="async" className="orbit-image" />\r
          </div>\r
        </div>\r
      ))}\r
      {centerContent && (\r
        <div className="orbit-center-content" data-orbit-center="">\r
          {centerContent}\r
        </div>\r
      )}\r
    </div>\r
  );\r
}\r
`,s=`'use client';\r
\r
// Component created by Dominik Koch\r
// https://x.com/dominikkoch\r
\r
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';\r
\r
type OrbitShape =\r
  | 'ellipse'\r
  | 'circle'\r
  | 'square'\r
  | 'rectangle'\r
  | 'triangle'\r
  | 'star'\r
  | 'heart'\r
  | 'infinity'\r
  | 'wave'\r
  | 'custom';\r
\r
export type OrbitImage = string | { src: string; alt?: string };\r
\r
export interface OrbitImagesProps {\r
  images?: OrbitImage[];\r
  altPrefix?: string;\r
  shape?: OrbitShape;\r
  customPath?: string;\r
  baseWidth?: number;\r
  radiusX?: number;\r
  radiusY?: number;\r
  radius?: number;\r
  starPoints?: number;\r
  starInnerRatio?: number;\r
  rotation?: number;\r
  duration?: number;\r
  itemSize?: number;\r
  direction?: 'normal' | 'reverse';\r
  fill?: boolean;\r
  width?: number | string;\r
  height?: number | string;\r
  className?: string;\r
  showPath?: boolean;\r
  pathColor?: string;\r
  pathWidth?: number;\r
  pathDash?: number;\r
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';\r
  paused?: boolean;\r
  depth?: number;\r
  itemRadius?: number | string;\r
  shadow?: number;\r
  hoverScale?: number;\r
  hoverSpeed?: number;\r
  draggable?: boolean;\r
  clickToFront?: boolean;\r
  onItemClick?: (index: number, src: string) => void;\r
  alignToPath?: boolean;\r
  intro?: boolean;\r
  centerContent?: ReactNode;\r
  responsive?: boolean;\r
}\r
\r
interface OrbitConfig {\r
  baseWidth: number;\r
  rotation: number;\r
  duration: number;\r
  itemSize: number;\r
  direction: 'normal' | 'reverse';\r
  fill: boolean;\r
  pathWidth: number;\r
  pathDash: number;\r
  easing: string;\r
  paused: boolean;\r
  depth: number;\r
  hoverScale: number;\r
  hoverSpeed: number;\r
  draggable: boolean;\r
  clickToFront: boolean;\r
  onItemClick?: (index: number, src: string) => void;\r
  alignToPath: boolean;\r
  intro: boolean;\r
  sources: string[];\r
}\r
\r
interface OrbitItemState {\r
  el: HTMLElement;\r
  t: string;\r
  o: string;\r
  z: string;\r
}\r
\r
interface Drag {\r
  id: number;\r
  x: number;\r
  y: number;\r
  active: boolean;\r
  samples: [number, number][];\r
  rate: number;\r
  anchor: number;\r
  manual: number;\r
}\r
\r
interface Seek {\r
  from: number;\r
  delta: number;\r
  t: number;\r
  dur: number;\r
}\r
\r
interface EngineState {\r
  lut: Float32Array | null;\r
  length: number;\r
  front: number;\r
  yMid: number;\r
  yHalf: number;\r
  bbox: [number, number, number, number];\r
  width: number;\r
  height: number;\r
  scale: number;\r
  size: number;\r
  items: OrbitItemState[];\r
  strokes: SVGPathElement[];\r
  lap: number;\r
  manual: number;\r
  glide: number;\r
  speed: number;\r
  drag: Drag | null;\r
  seek: Seek | null;\r
  hovered: boolean;\r
  hoverIndex: number;\r
  suppressUntil: number;\r
  introStart: number;\r
  introDone: boolean;\r
  visible: boolean;\r
  reduced: boolean;\r
  raf: number;\r
  last: number;\r
  destroyed: boolean;\r
}\r
\r
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');\r
\r
const SAMPLES = 720;\r
const FRONT_GROW = 0.3;\r
const BACK_SHRINK = 0.45;\r
const BACK_DIM = 0.55;\r
const INTRO_SPREAD = 1.3;\r
const INTRO_FADE = 0.45;\r
const DRAG_THRESHOLD = 5;\r
\r
function generateEllipsePath(cx: number, cy: number, rx: number, ry: number): string {\r
  return \`M \${cx - rx} \${cy} A \${rx} \${ry} 0 1 0 \${cx + rx} \${cy} A \${rx} \${ry} 0 1 0 \${cx - rx} \${cy}\`;\r
}\r
\r
function generateCirclePath(cx: number, cy: number, r: number): string {\r
  return generateEllipsePath(cx, cy, r, r);\r
}\r
\r
function generateSquarePath(cx: number, cy: number, size: number): string {\r
  const h = size / 2;\r
  return \`M \${cx - h} \${cy - h} L \${cx + h} \${cy - h} L \${cx + h} \${cy + h} L \${cx - h} \${cy + h} Z\`;\r
}\r
\r
function generateRectanglePath(cx: number, cy: number, w: number, h: number): string {\r
  const hw = w / 2;\r
  const hh = h / 2;\r
  return \`M \${cx - hw} \${cy - hh} L \${cx + hw} \${cy - hh} L \${cx + hw} \${cy + hh} L \${cx - hw} \${cy + hh} Z\`;\r
}\r
\r
function generateTrianglePath(cx: number, cy: number, size: number): string {\r
  const height = (size * Math.sqrt(3)) / 2;\r
  const hs = size / 2;\r
  return \`M \${cx} \${cy - height / 1.5} L \${cx + hs} \${cy + height / 3} L \${cx - hs} \${cy + height / 3} Z\`;\r
}\r
\r
function generateStarPath(cx: number, cy: number, outerR: number, innerR: number, points: number): string {\r
  const step = Math.PI / points;\r
  let path = '';\r
  for (let i = 0; i < 2 * points; i++) {\r
    const r = i % 2 === 0 ? outerR : innerR;\r
    const angle = i * step - Math.PI / 2;\r
    const x = cx + r * Math.cos(angle);\r
    const y = cy + r * Math.sin(angle);\r
    path += i === 0 ? \`M \${x} \${y}\` : \` L \${x} \${y}\`;\r
  }\r
  return path + ' Z';\r
}\r
\r
function generateHeartPath(cx: number, cy: number, size: number): string {\r
  const s = size / 30;\r
  return \`M \${cx} \${cy + 12 * s} C \${cx - 20 * s} \${cy - 5 * s}, \${cx - 12 * s} \${cy - 18 * s}, \${cx} \${cy - 8 * s} C \${cx + 12 * s} \${cy - 18 * s}, \${cx + 20 * s} \${cy - 5 * s}, \${cx} \${cy + 12 * s}\`;\r
}\r
\r
function generateInfinityPath(cx: number, cy: number, w: number, h: number): string {\r
  const hw = w / 2;\r
  const hh = h / 2;\r
  return \`M \${cx} \${cy} C \${cx + hw * 0.5} \${cy - hh}, \${cx + hw} \${cy - hh}, \${cx + hw} \${cy} C \${cx + hw} \${cy + hh}, \${cx + hw * 0.5} \${cy + hh}, \${cx} \${cy} C \${cx - hw * 0.5} \${cy + hh}, \${cx - hw} \${cy + hh}, \${cx - hw} \${cy} C \${cx - hw} \${cy - hh}, \${cx - hw * 0.5} \${cy - hh}, \${cx} \${cy}\`;\r
}\r
\r
function generateWavePath(cx: number, cy: number, w: number, amplitude: number, waves: number): string {\r
  const pts: string[] = [];\r
  const segs = waves * 20;\r
  const hw = w / 2;\r
  for (let i = 0; i <= segs; i++) {\r
    const x = cx - hw + (w * i) / segs;\r
    const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;\r
    pts.push(i === 0 ? \`M \${x} \${y}\` : \`L \${x} \${y}\`);\r
  }\r
  for (let i = segs; i >= 0; i--) {\r
    const x = cx - hw + (w * i) / segs;\r
    const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;\r
    pts.push(\`L \${x} \${y}\`);\r
  }\r
  return pts.join(' ') + ' Z';\r
}\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toCssLength = (value: number | string | undefined) => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const wrapSigned = (value: number) => value - Math.round(value);\r
\r
const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {\r
  const sample = (a1: number, a2: number, t: number) =>\r
    ((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t * t + 3 * a1 * t;\r
  const slope = (a1: number, a2: number, t: number) =>\r
    3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;\r
  return (x: number) => {\r
    if (x <= 0 || x >= 1) return x;\r
    let t = x;\r
    for (let i = 0; i < 8; i++) {\r
      const s = slope(x1, x2, t);\r
      if (Math.abs(s) < 1e-6) break;\r
      t = clamp(t - (sample(x1, x2, t) - x) / s, 0, 1);\r
    }\r
    return sample(y1, y2, t);\r
  };\r
};\r
\r
const EASINGS: Record<string, (t: number) => number> = {\r
  linear: (t: number) => t,\r
  easeIn: cubicBezier(0.42, 0, 1, 1),\r
  easeOut: cubicBezier(0, 0, 0.58, 1),\r
  easeInOut: cubicBezier(0.42, 0, 0.58, 1)\r
};\r
\r
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);\r
\r
const estimateAspect = ({\r
  shape,\r
  radiusX,\r
  radiusY,\r
  radius,\r
  itemSize\r
}: {\r
  shape: string;\r
  radiusX: number;\r
  radiusY: number;\r
  radius: number;\r
  itemSize: number;\r
}) => {\r
  const wide = shape === 'ellipse' || shape === 'rectangle' || shape === 'infinity' || shape === 'wave';\r
  const w = (wide ? radiusX : radius) * 2 + itemSize * 1.6;\r
  const h = (wide ? radiusY : radius) * 2 + itemSize * 1.6;\r
  return w > 0 && h > 0 ? w / h : 1;\r
};\r
\r
const createEngine = (\r
  root: HTMLDivElement,\r
  config: React.MutableRefObject<OrbitConfig>,\r
  setAspect: (aspect: number) => void\r
) => {\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const st: EngineState = {\r
    lut: null,\r
    length: 0,\r
    front: 0,\r
    yMid: 0,\r
    yHalf: 1,\r
    bbox: [0, 0, 1, 1],\r
    width: 0,\r
    height: 0,\r
    scale: 0,\r
    size: 0,\r
    items: [],\r
    strokes: [],\r
    lap: 0,\r
    manual: 0,\r
    glide: 0,\r
    speed: 1,\r
    drag: null,\r
    seek: null,\r
    hovered: false,\r
    hoverIndex: -1,\r
    suppressUntil: 0,\r
    introStart: -1,\r
    introDone: !config.current.intro,\r
    visible: typeof IntersectionObserver === 'undefined',\r
    reduced: !!query?.matches,\r
    raf: 0,\r
    last: 0,\r
    destroyed: false\r
  };\r
  st.speed = st.reduced || config.current.paused ? 0 : 1;\r
\r
  const collect = () => {\r
    st.items = Array.from(root.querySelectorAll<HTMLElement>('[data-orbit-item]')).map(el => ({\r
      el,\r
      t: '',\r
      o: '',\r
      z: ''\r
    }));\r
    st.strokes = Array.from(root.querySelectorAll<SVGPathElement>('[data-orbit-stroke]'));\r
  };\r
\r
  const build = () => {\r
    const cfg = config.current;\r
    const path = root.querySelector<SVGPathElement>('[data-orbit-path]');\r
    let length = 0;\r
    try {\r
      length = path ? path.getTotalLength() : 0;\r
    } catch {\r
      length = 0;\r
    }\r
    if (!path || !length || !isFinite(length)) {\r
      st.lut = null;\r
      return;\r
    }\r
    const lut = new Float32Array(SAMPLES * 2);\r
    const angle = (cfg.rotation * Math.PI) / 180;\r
    const cos = Math.cos(angle);\r
    const sin = Math.sin(angle);\r
    const origin = cfg.baseWidth / 2;\r
    let x0 = Infinity;\r
    let x1 = -Infinity;\r
    let y0 = Infinity;\r
    let y1 = -Infinity;\r
    let front = 0;\r
    for (let i = 0; i < SAMPLES; i++) {\r
      const point = path.getPointAtLength((i / SAMPLES) * length);\r
      const dx = point.x - origin;\r
      const dy = point.y - origin;\r
      const x = origin + dx * cos - dy * sin;\r
      const y = origin + dx * sin + dy * cos;\r
      lut[i * 2] = x;\r
      lut[i * 2 + 1] = y;\r
      x0 = Math.min(x0, x);\r
      x1 = Math.max(x1, x);\r
      y0 = Math.min(y0, y);\r
      y1 = Math.max(y1, y);\r
      if (y > lut[front * 2 + 1] + 1e-6) front = i;\r
    }\r
    st.lut = lut;\r
    st.length = length;\r
    st.front = front / SAMPLES;\r
    st.yMid = (y0 + y1) / 2;\r
    st.yHalf = Math.max(1e-3, (y1 - y0) / 2);\r
    const depth = clamp(cfg.depth, 0, 1);\r
    const margin = (cfg.itemSize / 2) * (1 + depth * FRONT_GROW) * Math.max(1, cfg.hoverScale) + 2;\r
    st.bbox = [x0 - margin, y0 - margin, x1 + margin, y1 + margin];\r
    setAspect((x1 - x0 + margin * 2) / (y1 - y0 + margin * 2));\r
  };\r
\r
  const layout = () => {\r
    const cfg = config.current;\r
    st.width = root.clientWidth;\r
    st.height = root.clientHeight;\r
    if (!st.lut) return;\r
    const [bx0, by0, bx1, by1] = st.bbox;\r
    const scale = Math.min(st.width / (bx1 - bx0), st.height / (by1 - by0));\r
    st.scale = scale > 0 && isFinite(scale) ? scale : 0;\r
    st.size = cfg.itemSize * st.scale;\r
    for (const it of st.items) {\r
      it.el.style.width = \`\${st.size}px\`;\r
      it.el.style.height = \`\${st.size}px\`;\r
    }\r
    if (!st.scale) return;\r
    const vw = st.width / st.scale;\r
    const vh = st.height / st.scale;\r
    const cx = (bx0 + bx1) / 2;\r
    const cy = (by0 + by1) / 2;\r
    root.querySelectorAll('[data-orbit-svg]').forEach(svg => {\r
      svg.setAttribute('viewBox', \`\${cx - vw / 2} \${cy - vh / 2} \${vw} \${vh}\`);\r
    });\r
    const clip = root.querySelector('[data-orbit-clip]');\r
    if (clip) {\r
      clip.setAttribute('x', String(cx - vw));\r
      clip.setAttribute('y', String(st.yMid));\r
      clip.setAttribute('width', String(vw * 2));\r
      clip.setAttribute('height', String(vh * 2));\r
    }\r
    for (const stroke of st.strokes) {\r
      stroke.style.strokeWidth = String(cfg.pathWidth / st.scale);\r
    }\r
    applyDash(1);\r
  };\r
\r
  const applyDash = (reveal: number) => {\r
    const cfg = config.current;\r
    const dash = cfg.pathDash > 0 && st.scale ? cfg.pathDash / st.scale : 0;\r
    for (const stroke of st.strokes) {\r
      if (reveal < 1 && !dash) {\r
        stroke.style.strokeDasharray = \`\${st.length} \${st.length}\`;\r
        stroke.style.strokeDashoffset = String(st.length * (1 - reveal));\r
        stroke.style.opacity = '';\r
      } else {\r
        stroke.style.strokeDasharray = dash ? \`\${dash} \${dash * 1.6}\` : '';\r
        stroke.style.strokeDashoffset = '';\r
        stroke.style.opacity = reveal < 1 ? String(reveal) : '';\r
      }\r
    }\r
  };\r
\r
  const sample = (u: number): [number, number] => {\r
    const f = (((u % 1) + 1) % 1) * SAMPLES;\r
    const i0 = Math.floor(f) % SAMPLES;\r
    const i1 = (i0 + 1) % SAMPLES;\r
    const t = f - Math.floor(f);\r
    const lut = st.lut as Float32Array;\r
    return [lut[i0 * 2] + (lut[i1 * 2] - lut[i0 * 2]) * t, lut[i0 * 2 + 1] + (lut[i1 * 2 + 1] - lut[i0 * 2 + 1]) * t];\r
  };\r
\r
  const heading = (u: number) => {\r
    const a = sample(u - 2 / SAMPLES);\r
    const b = sample(u + 2 / SAMPLES);\r
    return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;\r
  };\r
\r
  const progress = () => {\r
    const cfg = config.current;\r
    const ease = EASINGS[cfg.easing] || EASINGS.linear;\r
    const whole = Math.floor(st.lap);\r
    return (whole + ease(st.lap - whole)) * (cfg.direction === 'reverse' ? -1 : 1) + st.manual;\r
  };\r
\r
  const offsetOf = (index: number, count: number) => {\r
    const cfg = config.current;\r
    if (cfg.fill) return index / Math.max(1, count);\r
    return (-index * cfg.itemSize * 1.3) / Math.max(1, st.length);\r
  };\r
\r
  const write = (it: OrbitItemState, key: 't' | 'o' | 'z', prop: 'transform' | 'opacity' | 'zIndex', value: string) => {\r
    if (it[key] !== value) {\r
      it[key] = value;\r
      it.el.style[prop] = value;\r
    }\r
  };\r
\r
  const render = (now: number) => {\r
    const cfg = config.current;\r
    if (!st.lut || !st.scale) return;\r
    const p = progress();\r
    const count = st.items.length;\r
    const depth = clamp(cfg.depth, 0, 1);\r
    const [bx0, by0, bx1, by1] = st.bbox;\r
    const cx = (bx0 + bx1) / 2;\r
    const cy = (by0 + by1) / 2;\r
    const half = st.size / 2;\r
    const introRunning = st.introStart >= 0;\r
    const elapsed = introRunning ? (now - st.introStart) / 1000 : 0;\r
    const spread = introRunning ? easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)) : 1;\r
    const appear = introRunning ? clamp(elapsed / INTRO_FADE, 0, 1) : 1;\r
    for (let i = 0; i < count; i++) {\r
      const it = st.items[i];\r
      let u = p + offsetOf(i, count);\r
      if (introRunning) u = st.front + wrapSigned(u - st.front) * spread;\r
      const [x, y] = sample(u);\r
      const d = clamp((y - st.yMid) / st.yHalf, -1, 1);\r
      const w = (d + 1) / 2;\r
      let scale = 1 + depth * (FRONT_GROW * w - BACK_SHRINK * (1 - w));\r
      let opacity = 1 - depth * BACK_DIM * (1 - w);\r
      if (introRunning) {\r
        scale *= 0.7 + 0.3 * appear;\r
        opacity *= appear * appear * (3 - 2 * appear);\r
      }\r
      const sx = (x - cx) * st.scale + st.width / 2 - half;\r
      const sy = (y - cy) * st.scale + st.height / 2 - half;\r
      const rot = cfg.alignToPath ? heading(u) : 0;\r
      let z = depth > 0 ? (d <= 0 ? 10 + Math.round((d + 1) * 80) : 110 + Math.round(d * 80)) : 1;\r
      if (i === st.hoverIndex) z += 200;\r
      write(\r
        it,\r
        't',\r
        'transform',\r
        \`translate3d(\${sx.toFixed(2)}px, \${sy.toFixed(2)}px, 0px)\${rot ? \` rotate(\${rot.toFixed(2)}deg)\` : ''} scale(\${scale.toFixed(4)})\`\r
      );\r
      write(it, 'o', 'opacity', opacity > 0.999 ? '' : opacity.toFixed(3));\r
      write(it, 'z', 'zIndex', String(z));\r
    }\r
    if (introRunning) applyDash(easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)));\r
  };\r
\r
  const frame = (now: number) => {\r
    st.raf = 0;\r
    if (st.destroyed) return;\r
    const cfg = config.current;\r
    const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.1) : 0;\r
    st.last = now;\r
    let busy = false;\r
    if (st.lut && st.scale && st.introStart === -1 && !st.introDone && st.visible) {\r
      if (cfg.intro && !st.reduced) {\r
        st.introStart = now;\r
      } else {\r
        st.introDone = true;\r
      }\r
      root.removeAttribute('data-intro');\r
    }\r
    if (st.introStart >= 0) {\r
      if ((now - st.introStart) / 1000 >= INTRO_SPREAD) {\r
        st.introStart = -2;\r
        st.introDone = true;\r
        applyDash(1);\r
      } else {\r
        busy = true;\r
      }\r
    }\r
    const want = cfg.paused || st.reduced ? 0 : st.hovered ? clamp(cfg.hoverSpeed, 0, 1) : 1;\r
    if (st.speed !== want) {\r
      st.speed += (want - st.speed) * (1 - Math.exp(-dt / 0.35));\r
      if (Math.abs(st.speed - want) < 0.002) st.speed = want;\r
      busy = true;\r
    }\r
    if (st.speed > 0 && cfg.duration > 0) {\r
      st.lap += (dt * st.speed) / cfg.duration;\r
      busy = true;\r
    }\r
    if (st.drag?.active) {\r
      busy = true;\r
    } else if (st.seek) {\r
      st.seek.t = Math.min(1, st.seek.t + dt / st.seek.dur);\r
      const e = st.seek.t < 0.5 ? 4 * st.seek.t ** 3 : 1 - Math.pow(-2 * st.seek.t + 2, 3) / 2;\r
      st.manual = st.seek.from + st.seek.delta * e;\r
      if (st.seek.t >= 1) st.seek = null;\r
      busy = true;\r
    } else if (st.glide) {\r
      st.manual += st.glide * dt;\r
      st.glide *= Math.exp(-dt / 0.7);\r
      if (Math.abs(st.glide) < 0.0004) st.glide = 0;\r
      busy = true;\r
    }\r
    render(now);\r
    const whole = Math.floor(st.lap);\r
    if (whole) st.lap -= whole;\r
    if (!st.drag && !st.seek) st.manual -= Math.floor(st.manual);\r
    if (busy && st.visible && !st.destroyed) st.raf = requestAnimationFrame(frame);\r
  };\r
\r
  const wake = () => {\r
    if (st.raf || st.destroyed || !st.visible) return;\r
    st.last = 0;\r
    st.raf = requestAnimationFrame(frame);\r
  };\r
\r
  const local = (e: PointerEvent): [number, number] => {\r
    const r = root.getBoundingClientRect();\r
    const k = root.offsetWidth ? r.width / root.offsetWidth || 1 : 1;\r
    return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];\r
  };\r
\r
  const dragRate = () => {\r
    if (!st.lut || !st.scale) return 0;\r
    const a = sample(st.front - 3 / SAMPLES);\r
    const b = sample(st.front + 3 / SAMPLES);\r
    const along = ((b[0] - a[0]) / (6 / SAMPLES)) * st.scale;\r
    const floor = st.length * st.scale * 0.35;\r
    return Math.abs(along) < floor ? Math.sign(along || 1) * floor : along;\r
  };\r
\r
  const itemIndex = (target: EventTarget | null) => {\r
    const el = target instanceof Element ? target.closest('[data-orbit-item]') : null;\r
    return el && root.contains(el) ? Number(el.getAttribute('data-orbit-item')) : -1;\r
  };\r
\r
  const bringToFront = (index: number) => {\r
    if (!st.lut || index < 0) return;\r
    const u = progress() + offsetOf(index, st.items.length);\r
    const delta = wrapSigned(st.front - u);\r
    st.glide = 0;\r
    st.seek = { from: st.manual, delta, t: 0, dur: 0.45 + Math.abs(delta) * 1.4 };\r
    wake();\r
  };\r
\r
  const onEnter = () => {\r
    st.hovered = true;\r
    wake();\r
  };\r
\r
  const onLeave = () => {\r
    st.hovered = false;\r
    st.hoverIndex = -1;\r
    wake();\r
  };\r
\r
  const onOver = (e: PointerEvent) => {\r
    const index = itemIndex(e.target);\r
    if (index !== st.hoverIndex) {\r
      st.hoverIndex = index;\r
      if (st.lut) render(performance.now());\r
    }\r
  };\r
\r
  const onDown = (e: PointerEvent) => {\r
    const cfg = config.current;\r
    if (!cfg.draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
    if (e.target instanceof Element && e.target.closest('[data-orbit-center]')) return;\r
    const [x, y] = local(e);\r
    st.drag = { id: e.pointerId, x, y, active: false, samples: [], rate: dragRate(), anchor: 0, manual: 0 };\r
  };\r
\r
  const onMove = (e: PointerEvent) => {\r
    const d = st.drag;\r
    if (!d || e.pointerId !== d.id) return;\r
    const [x, y] = local(e);\r
    const along = x - d.x;\r
    if (!d.active) {\r
      if (Math.abs(along) < DRAG_THRESHOLD) return;\r
      if (Math.abs(y - d.y) > Math.abs(along)) {\r
        st.drag = null;\r
        return;\r
      }\r
      d.active = true;\r
      d.anchor = along;\r
      d.manual = st.manual;\r
      st.seek = null;\r
      st.glide = 0;\r
      try {\r
        root.setPointerCapture(e.pointerId);\r
      } catch {}\r
      root.setAttribute('data-dragging', '');\r
    }\r
    if (d.rate) st.manual = d.manual + (along - d.anchor) / d.rate;\r
    const now = performance.now();\r
    d.samples.push([now, along]);\r
    while (d.samples.length > 2 && now - d.samples[0][0] > 100) d.samples.shift();\r
    wake();\r
  };\r
\r
  const endDrag = (e: PointerEvent, cancelled: boolean) => {\r
    const d = st.drag;\r
    if (!d || e.pointerId !== d.id) return;\r
    st.drag = null;\r
    if (!d.active) return;\r
    root.removeAttribute('data-dragging');\r
    try {\r
      root.releasePointerCapture(e.pointerId);\r
    } catch {}\r
    const now = performance.now();\r
    st.suppressUntil = now + 400;\r
    const s = d.samples;\r
    if (!cancelled && s.length > 1 && d.rate) {\r
      const [t0, a0] = s[0];\r
      const [t1, a1] = s[s.length - 1];\r
      if (t1 > t0 && now - t1 < 80) st.glide = clamp((((a1 - a0) / (t1 - t0)) * 1000) / d.rate, -3, 3);\r
    }\r
    wake();\r
  };\r
\r
  const onUp = (e: PointerEvent) => endDrag(e, false);\r
  const onCancel = (e: PointerEvent) => endDrag(e, true);\r
\r
  const activate = (index: number) => {\r
    const cfg = config.current;\r
    if (index < 0) return;\r
    if (cfg.clickToFront) bringToFront(index);\r
    cfg.onItemClick?.(index, cfg.sources[index]);\r
  };\r
\r
  const onClick = (e: MouseEvent) => {\r
    if (performance.now() < st.suppressUntil) {\r
      e.preventDefault();\r
      e.stopPropagation();\r
      st.suppressUntil = 0;\r
      return;\r
    }\r
    activate(itemIndex(e.target));\r
  };\r
\r
  const onKey = (e: KeyboardEvent) => {\r
    if (e.key !== 'Enter' && e.key !== ' ') return;\r
    const index = itemIndex(e.target);\r
    if (index < 0) return;\r
    e.preventDefault();\r
    activate(index);\r
  };\r
\r
  const onFocus = (e: FocusEvent) => {\r
    const index = itemIndex(e.target);\r
    if (index >= 0 && config.current.clickToFront && e.target instanceof Element && e.target.matches(':focus-visible'))\r
      bringToFront(index);\r
  };\r
\r
  const onMotion = () => {\r
    st.reduced = !!query?.matches;\r
    wake();\r
  };\r
\r
  root.addEventListener('pointerenter', onEnter);\r
  root.addEventListener('pointerleave', onLeave);\r
  root.addEventListener('pointerover', onOver);\r
  root.addEventListener('pointerdown', onDown);\r
  root.addEventListener('pointermove', onMove);\r
  root.addEventListener('pointerup', onUp);\r
  root.addEventListener('pointercancel', onCancel);\r
  root.addEventListener('lostpointercapture', onCancel);\r
  root.addEventListener('click', onClick);\r
  root.addEventListener('keydown', onKey);\r
  root.addEventListener('focusin', onFocus);\r
  query?.addEventListener?.('change', onMotion);\r
\r
  let resizeObserver: ResizeObserver | null = null;\r
  if (typeof ResizeObserver !== 'undefined') {\r
    resizeObserver = new ResizeObserver(() => {\r
      layout();\r
      render(performance.now());\r
      wake();\r
    });\r
    resizeObserver.observe(root);\r
  }\r
\r
  let intersection: IntersectionObserver | null = null;\r
  if (typeof IntersectionObserver !== 'undefined') {\r
    intersection = new IntersectionObserver(\r
      entries => {\r
        st.visible = entries[entries.length - 1].isIntersecting;\r
        if (st.visible) wake();\r
      },\r
      { threshold: 0.05 }\r
    );\r
    intersection.observe(root);\r
  }\r
\r
  const onVisibility = () => {\r
    if (!document.hidden) wake();\r
  };\r
  document.addEventListener('visibilitychange', onVisibility);\r
  window.addEventListener('resize', wake);\r
\r
  const refresh = () => {\r
    collect();\r
    build();\r
    layout();\r
    render(performance.now());\r
    wake();\r
  };\r
\r
  const destroy = () => {\r
    st.destroyed = true;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    root.removeEventListener('pointerenter', onEnter);\r
    root.removeEventListener('pointerleave', onLeave);\r
    root.removeEventListener('pointerover', onOver);\r
    root.removeEventListener('pointerdown', onDown);\r
    root.removeEventListener('pointermove', onMove);\r
    root.removeEventListener('pointerup', onUp);\r
    root.removeEventListener('pointercancel', onCancel);\r
    root.removeEventListener('lostpointercapture', onCancel);\r
    root.removeEventListener('click', onClick);\r
    root.removeEventListener('keydown', onKey);\r
    root.removeEventListener('focusin', onFocus);\r
    query?.removeEventListener?.('change', onMotion);\r
    document.removeEventListener('visibilitychange', onVisibility);\r
    window.removeEventListener('resize', wake);\r
    resizeObserver?.disconnect();\r
    intersection?.disconnect();\r
  };\r
\r
  return { refresh, wake, destroy };\r
};\r
\r
export default function OrbitImages({\r
  images = [],\r
  altPrefix = 'Orbiting image',\r
  shape = 'ellipse',\r
  customPath,\r
  baseWidth = 1400,\r
  radiusX = 700,\r
  radiusY = 170,\r
  radius = 300,\r
  starPoints = 5,\r
  starInnerRatio = 0.5,\r
  rotation = -8,\r
  duration = 40,\r
  itemSize = 64,\r
  direction = 'normal',\r
  fill = true,\r
  width = '100%',\r
  height = 'auto',\r
  className = '',\r
  showPath = false,\r
  pathColor = 'rgba(128,128,128,0.35)',\r
  pathWidth = 2,\r
  pathDash = 0,\r
  easing = 'linear',\r
  paused = false,\r
  depth = 0.5,\r
  itemRadius = 12,\r
  shadow = 0.3,\r
  hoverScale = 1.08,\r
  hoverSpeed = 0.3,\r
  draggable = true,\r
  clickToFront = true,\r
  onItemClick,\r
  alignToPath = false,\r
  intro = true,\r
  centerContent\r
}: OrbitImagesProps) {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);\r
  const clipId = useId().replace(/:/g, '');\r
  const [introPending] = useState(intro);\r
  const [measuredAspect, setAspect] = useState<number | null>(null);\r
\r
  const center = baseWidth / 2;\r
\r
  const path = useMemo(() => {\r
    switch (shape) {\r
      case 'circle':\r
        return generateCirclePath(center, center, radius);\r
      case 'ellipse':\r
        return generateEllipsePath(center, center, radiusX, radiusY);\r
      case 'square':\r
        return generateSquarePath(center, center, radius * 2);\r
      case 'rectangle':\r
        return generateRectanglePath(center, center, radiusX * 2, radiusY * 2);\r
      case 'triangle':\r
        return generateTrianglePath(center, center, radius * 2);\r
      case 'star':\r
        return generateStarPath(center, center, radius, radius * starInnerRatio, starPoints);\r
      case 'heart':\r
        return generateHeartPath(center, center, radius * 2);\r
      case 'infinity':\r
        return generateInfinityPath(center, center, radiusX * 2, radiusY * 2);\r
      case 'wave':\r
        return generateWavePath(center, center, radiusX * 2, radiusY, 3);\r
      case 'custom':\r
        return customPath || generateCirclePath(center, center, radius);\r
      default:\r
        return generateEllipsePath(center, center, radiusX, radiusY);\r
    }\r
  }, [shape, customPath, center, radiusX, radiusY, radius, starPoints, starInnerRatio]);\r
\r
  const items = useMemo(\r
    () =>\r
      images.map((image, index) =>\r
        typeof image === 'string'\r
          ? { src: image, alt: \`\${altPrefix} \${index + 1}\` }\r
          : { src: image.src, alt: image.alt ?? \`\${altPrefix} \${index + 1}\` }\r
      ),\r
    [images, altPrefix]\r
  );\r
\r
  const interactive = !!onItemClick;\r
\r
  const config = useRef<OrbitConfig>({} as OrbitConfig);\r
  config.current = {\r
    baseWidth,\r
    rotation,\r
    duration,\r
    itemSize,\r
    direction,\r
    fill,\r
    pathWidth,\r
    pathDash,\r
    easing,\r
    paused,\r
    depth,\r
    hoverScale,\r
    hoverSpeed,\r
    draggable,\r
    clickToFront,\r
    onItemClick,\r
    alignToPath,\r
    intro,\r
    sources: items.map(item => item.src)\r
  };\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const engine = createEngine(rootRef.current as HTMLDivElement, config, setAspect);\r
    engineRef.current = engine;\r
    return () => {\r
      engine.destroy();\r
      engineRef.current = null;\r
    };\r
  }, []);\r
\r
  useIsomorphicLayoutEffect(() => {\r
    engineRef.current?.refresh();\r
  }, [\r
    path,\r
    rotation,\r
    baseWidth,\r
    itemSize,\r
    depth,\r
    hoverScale,\r
    items.length,\r
    showPath,\r
    pathWidth,\r
    pathDash,\r
    measuredAspect,\r
    height\r
  ]);\r
\r
  useEffect(() => {\r
    engineRef.current?.wake();\r
  });\r
\r
  const aspect = measuredAspect ?? estimateAspect({ shape, radiusX, radiusY, radius, itemSize });\r
  const autoHeight = height === 'auto' || height === undefined;\r
  const layered = depth > 0 && !!centerContent;\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={cx(\r
        'group/orbit relative isolate mx-auto select-none [-webkit-user-select:none] [-webkit-tap-highlight-color:transparent]',\r
        draggable &&\r
          'cursor-grab [touch-action:pan-y_pinch-zoom] data-[dragging]:cursor-grabbing [&[data-dragging]_*]:cursor-grabbing',\r
        className\r
      )}\r
      style={\r
        {\r
          width: toCssLength(width),\r
          height: autoHeight ? undefined : toCssLength(height),\r
          aspectRatio: autoHeight ? String(aspect) : undefined,\r
          '--orbit-radius':\r
            typeof itemRadius === 'number' ? \`\${(itemRadius / Math.max(1, itemSize)) * 100}%\` : itemRadius,\r
          '--orbit-shadow': String(clamp(shadow, 0, 1)),\r
          '--orbit-hover-scale': String(hoverScale)\r
        } as React.CSSProperties\r
      }\r
      aria-hidden={interactive ? undefined : true}\r
      data-intro={introPending ? '' : undefined}\r
      data-draggable={draggable ? '' : undefined}\r
    >\r
      <svg\r
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"\r
        data-orbit-svg=""\r
        preserveAspectRatio="none"\r
        style={{ zIndex: 0, visibility: showPath ? undefined : 'hidden' }}\r
        aria-hidden="true"\r
      >\r
        <path\r
          data-orbit-path=""\r
          data-orbit-stroke=""\r
          d={path}\r
          fill="none"\r
          stroke={pathColor}\r
          strokeLinecap="round"\r
          transform={\`rotate(\${rotation} \${center} \${center})\`}\r
        />\r
      </svg>\r
      {showPath && layered && (\r
        <svg\r
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"\r
          data-orbit-svg=""\r
          preserveAspectRatio="none"\r
          style={{ zIndex: 105 }}\r
          aria-hidden="true"\r
        >\r
          <defs>\r
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">\r
              <rect data-orbit-clip="" />\r
            </clipPath>\r
          </defs>\r
          <g clipPath={\`url(#\${clipId})\`}>\r
            <path\r
              data-orbit-stroke=""\r
              d={path}\r
              fill="none"\r
              stroke={pathColor}\r
              strokeLinecap="round"\r
              transform={\`rotate(\${rotation} \${center} \${center})\`}\r
            />\r
          </g>\r
        </svg>\r
      )}\r
      {items.map((item, index) => (\r
        <div\r
          key={index}\r
          className={cx(\r
            'group/item absolute left-0 top-0 will-change-[transform,opacity] focus-visible:outline-none group-data-[intro]/orbit:opacity-0',\r
            (clickToFront || interactive) && 'cursor-pointer'\r
          )}\r
          data-orbit-item={index}\r
          data-clickable={clickToFront || interactive ? '' : undefined}\r
          role={interactive ? 'button' : undefined}\r
          tabIndex={interactive ? 0 : undefined}\r
          aria-label={interactive ? item.alt : undefined}\r
        >\r
          <div className="h-full w-full overflow-hidden rounded-[var(--orbit-radius)] [box-shadow:0_calc(var(--orbit-shadow)*16px)_calc(var(--orbit-shadow)*36px)_rgba(0,0,0,calc(var(--orbit-shadow)*0.45))] transition-transform duration-[450ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none group-hover/item:scale-[var(--orbit-hover-scale)] group-focus-visible/item:scale-[var(--orbit-hover-scale)] group-focus-visible/item:outline-2 group-focus-visible/item:outline-offset-[3px] group-focus-visible/item:outline-current">\r
            <img\r
              src={item.src}\r
              alt={item.alt}\r
              draggable={false}\r
              decoding="async"\r
              className="pointer-events-none block h-full w-full object-cover [-webkit-user-drag:none]"\r
            />\r
          </div>\r
        </div>\r
      ))}\r
      {centerContent && (\r
        <div\r
          className="pointer-events-none absolute inset-0 z-[100] flex items-center justify-center [&>*]:pointer-events-auto"\r
          data-orbit-center=""\r
        >\r
          {centerContent}\r
        </div>\r
      )}\r
    </div>\r
  );\r
}\r
`,i={usage:`// Component created by Dominik Koch
// https://x.com/dominikkoch

import OrbitImages from './OrbitImages'

const images = [
  "https://picsum.photos/300/300?grayscale&random=1",
  "https://picsum.photos/300/300?grayscale&random=2",
  "https://picsum.photos/300/300?grayscale&random=3",
  "https://picsum.photos/300/300?grayscale&random=4",
  "https://picsum.photos/300/300?grayscale&random=5",
  "https://picsum.photos/300/300?grayscale&random=6",
];

<OrbitImages
  images={images}
  shape="ellipse"
  radiusX={340}
  radiusY={80}
  rotation={-8}
  duration={30}
  itemSize={90}
  depth={0.6}
  showPath
  centerContent={<h2>Moments</h2>}
/>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:s};export{i as orbitImages};
