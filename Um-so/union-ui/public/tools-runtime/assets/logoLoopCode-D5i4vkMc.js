const n=`'use client';\r
\r
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';\r
import './LogoLoop.css';\r
\r
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const SMOOTH_TAU = 0.25;\r
const GLIDE_TAU = 0.8;\r
const DRAG_THRESHOLD = 6;\r
const MAX_FLING = 4000;\r
const INTRO_TIME = 0.7;\r
const INTRO_STAGGER = 0.45;\r
const HALF_SQRT_PI = Math.sqrt(Math.PI) / 2;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toCssLength = value => (typeof value === 'number' ? \`\${value}px\` : (value ?? undefined));\r
\r
const erf = x => {\r
  const a = Math.abs(x);\r
  const t = 1 / (1 + 0.3275911 * a);\r
  const y =\r
    1 -\r
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);\r
  return x < 0 ? -y : y;\r
};\r
\r
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);\r
\r
const easeOut = t => 1 - Math.pow(1 - t, 3);\r
\r
const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const fadeMask = (size, vertical) => {\r
  const span = clamp(size, 0, 0.5) * 100;\r
  if (span <= 0) return undefined;\r
  const stops = [];\r
  for (let i = 0; i <= 12; i++) {\r
    stops.push(\`rgba(0,0,0,\${smootherstep(i / 12).toFixed(4)}) \${((span * i) / 12).toFixed(3)}%\`);\r
  }\r
  for (let i = 12; i >= 0; i--) {\r
    stops.push(\`rgba(0,0,0,\${smootherstep(i / 12).toFixed(4)}) \${(100 - (span * i) / 12).toFixed(3)}%\`);\r
  }\r
  return \`linear-gradient(\${vertical ? 'to bottom' : 'to right'}, \${stops.join(', ')})\`;\r
};\r
\r
const rotationMatrix = (degX, degY) => {\r
  const a = (degX * Math.PI) / 180;\r
  const b = (degY * Math.PI) / 180;\r
  const ca = Math.cos(a);\r
  const sa = Math.sin(a);\r
  const cb = Math.cos(b);\r
  const sb = Math.sin(b);\r
  return [cb, 0, sb, sa * sb, ca, -sa * cb, -ca * sb, sa, ca * cb];\r
};\r
\r
const unproject = (m, depth, sx, sy) => {\r
  const den = m[8] * depth - m[2] * sx - m[5] * sy;\r
  if (den <= 1e-6) return null;\r
  const t = (m[8] * depth) / den;\r
  if (t <= 0) return null;\r
  const qx = t * sx;\r
  const qy = t * sy;\r
  const qz = depth * (1 - t);\r
  return [m[0] * qx + m[3] * qy + m[6] * qz, m[1] * qx + m[4] * qy + m[7] * qz];\r
};\r
\r
const project = (m, depth, px, py) => {\r
  const k = depth / (depth - (m[6] * px + m[7] * py));\r
  return [(m[0] * px + m[1] * py) * k, (m[3] * px + m[4] * py) * k];\r
};\r
\r
const createEngine = (root, track, config, setLayout) => {\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const st = {\r
    offset: 0,\r
    velocity: 0,\r
    period: 0,\r
    length: 0,\r
    box: [0, 0],\r
    items: [],\r
    snaps: [],\r
    pitch: 0,\r
    crossMax: 0,\r
    sizeMax: 0,\r
    tipMax: 0,\r
    geo: null,\r
    layout: { copies: 2, primary: 0 },\r
    hovered: false,\r
    focused: false,\r
    pointer: null,\r
    pointerInside: false,\r
    mag: 0,\r
    magU: 0,\r
    magReady: false,\r
    drag: null,\r
    glide: false,\r
    suppressUntil: 0,\r
    pressedAt: -1e9,\r
    move: null,\r
    hold: 0,\r
    seek: null,\r
    scrollVel: 0,\r
    scrollY: window.scrollY,\r
    scrollT: 0,\r
    visible: typeof IntersectionObserver === 'undefined',\r
    introStart: -1,\r
    introDone: !config.current.intro,\r
    itemMode: false,\r
    active: null,\r
    raf: 0,\r
    last: 0,\r
    reduced: !!query?.matches,\r
    destroyed: false\r
  };\r
\r
  const collect = () => {\r
    const items = [];\r
    Array.from(track.children).forEach((list, copy) => {\r
      Array.from(list.children).forEach((el, index) => {\r
        items.push({\r
          el,\r
          copy,\r
          index,\r
          content: el.children[0] || null,\r
          tip: el.children[1] || null,\r
          center: 0,\r
          size: 0,\r
          cross: 0,\r
          t: '',\r
          o: '',\r
          v: '',\r
          z: '',\r
          s: '',\r
          p: ''\r
        });\r
      });\r
    });\r
    st.items = items;\r
    st.active = null;\r
  };\r
\r
  const clearItems = () => {\r
    for (const it of st.items) {\r
      it.el.style.transform = '';\r
      it.el.style.opacity = '';\r
      it.el.style.visibility = '';\r
      it.el.style.zIndex = '';\r
      if (it.content) it.content.style.transform = '';\r
      if (it.tip) it.tip.style.transform = '';\r
      it.t = it.o = it.v = it.z = it.s = it.p = '';\r
    }\r
  };\r
\r
  const geometry = () => {\r
    const cfg = config.current;\r
    const L = st.length;\r
    const P = st.period;\r
    const hc = st.crossMax;\r
    const w = st.sizeMax;\r
    const bend = clamp(cfg.bend, -1, 1);\r
    const geo = {\r
      mode: cfg.layout,\r
      shift: 0,\r
      uMin: -L / 2 - w,\r
      uMax: L / 2 + w,\r
      lead: 0,\r
      focus: clamp(cfg.focus, 0, 1) * 0.9,\r
      focusSigma: Math.max(40, L * 0.18),\r
      magnify: clamp(cfg.magnify, 0, 1),\r
      magSigma: Math.max(hc * 1.4, st.pitch * 1.1),\r
      amp: 0,\r
      k: 0,\r
      R: 0,\r
      sign: 1,\r
      limit: 0,\r
      C: 0,\r
      alpha: 0,\r
      depth: 0,\r
      pf: 1,\r
      tilted: false,\r
      tiltX: 0,\r
      tiltY: 0,\r
      m: [1, 0, 0, 0, 1, 0, 0, 0, 1],\r
      persp: 0\r
    };\r
    let pad = cfg.scaleOnHover ? hc * 0.1 : 0;\r
    const lens = (1 + geo.focus) * (1 + geo.magnify) - 1;\r
    if (geo.mode === 'wave') {\r
      geo.amp = bend * (hc * 0.6 + L * 0.035);\r
      geo.k = (2 * Math.PI) / Math.max(1, L / 1.25);\r
      pad += Math.abs(geo.amp) + (lens * hc) / 2 + hc * 0.08;\r
    } else if (geo.mode === 'arc' && Math.abs(bend) > 0.005) {\r
      const edge = Math.abs(bend) * (Math.PI / 4);\r
      const R = L / 2 / Math.sin(edge);\r
      const sag = R * (1 - Math.cos(edge));\r
      geo.R = R;\r
      geo.sign = Math.sign(bend);\r
      geo.shift = sag / 2;\r
      geo.limit = Math.PI * 0.6;\r
      const reach = R * Math.min(Math.PI / 2, Math.asin(Math.min(1, (L / 2 + w) / R))) + w;\r
      geo.uMin = -reach;\r
      geo.uMax = reach;\r
      pad += sag / 2 + (w / 2) * Math.sin(edge) + (lens * hc) / 2;\r
    } else if (geo.mode === 'orbit') {\r
      const R = Math.max(40, L * 0.43 - w * 0.2);\r
      const k = Math.max(1, Math.round((2 * Math.PI * R) / P));\r
      const alpha = Math.sign(bend) * Math.atan2(Math.abs(bend) * Math.max(hc * 2, R * 0.36), R);\r
      const depth = R * 5;\r
      const pf = depth / (depth - R * Math.cos(alpha));\r
      const pb = depth / (depth + R * Math.cos(alpha));\r
      const yf = R * Math.sin(alpha) * pf;\r
      const yb = -R * Math.sin(alpha) * pb;\r
      const grow = (1 + lens) * (cfg.scaleOnHover ? 1.2 : 1);\r
      const lo = Math.min(yf - (hc * pf * grow) / 2, yb - (hc * pb) / 2);\r
      const hi = Math.max(yf + (hc * pf * grow) / 2, yb + (hc * pb) / 2);\r
      geo.R = R;\r
      geo.C = k * P;\r
      geo.alpha = alpha;\r
      geo.depth = depth;\r
      geo.pf = pf;\r
      geo.shift = (lo + hi) / 2;\r
      geo.uMin = -geo.C / 2;\r
      geo.uMax = geo.C / 2;\r
      pad = Math.max(0, (hi - lo) / 2 - hc / 2);\r
    } else {\r
      pad += (lens * hc) / 2;\r
    }\r
    if (cfg.labels === 'hover') pad += cfg.vertical ? st.tipMax : hc * 0.2 + Math.max(11, hc * 0.26) * 1.3;\r
    const tx = clamp(cfg.tiltX, -60, 60);\r
    const ty = clamp(cfg.tiltY, -60, 60);\r
    if (Math.abs(tx) > 0.01 || Math.abs(ty) > 0.01) {\r
      geo.tilted = true;\r
      geo.tiltX = tx;\r
      geo.tiltY = ty;\r
      geo.m = rotationMatrix(tx, ty);\r
      geo.persp = Math.max(L, 480) * 1.3;\r
      const edge = L / 2 + w;\r
      const along = s => {\r
        const p = cfg.vertical ? unproject(geo.m, geo.persp, 0, s) : unproject(geo.m, geo.persp, s, 0);\r
        if (!p) return Math.sign(s) * L * 4;\r
        return clamp(cfg.vertical ? p[1] : p[0], -L * 4, L * 4);\r
      };\r
      const a = along(-edge);\r
      const b = along(edge);\r
      geo.uMin = Math.min(geo.uMin, a, b) - w;\r
      geo.uMax = Math.max(geo.uMax, a, b) + w;\r
      const band = hc / 2 + pad;\r
      let reach = band;\r
      for (const u of [a, b, 0]) {\r
        for (const v of [-band, band]) {\r
          const q = cfg.vertical ? project(geo.m, geo.persp, v, u) : project(geo.m, geo.persp, u, v);\r
          reach = Math.max(reach, Math.abs(cfg.vertical ? q[0] : q[1]));\r
        }\r
      }\r
      pad = reach - hc / 2;\r
    }\r
    const extra = cfg.links ? 2 : 0;\r
    geo.lead = (Math.max(0, Math.ceil((-geo.uMin - L / 2) / P)) + extra) * P;\r
    const copies = Math.max(2, Math.ceil((geo.uMax + L / 2 + geo.lead) / P) + 2 + (extra ? 1 : 0));\r
    const primary = Math.min(copies - 1, Math.floor((geo.lead + L / 2) / P));\r
    st.geo = geo;\r
    root.style.setProperty('--logoloop-pad', \`\${Math.ceil(pad)}px\`);\r
    root.style.perspective = geo.tilted ? \`\${geo.persp}px\` : '';\r
    track.style.transformOrigin = geo.tilted ? (cfg.vertical ? \`50% \${L / 2}px\` : \`\${L / 2}px 50%\`) : '';\r
    if (copies !== st.layout.copies || primary !== st.layout.primary) {\r
      st.layout = { copies, primary };\r
      setLayout(st.layout);\r
    }\r
  };\r
\r
  const measure = () => {\r
    const cfg = config.current;\r
    const lists = track.children;\r
    if (!lists.length || !st.items.length) {\r
      st.period = 0;\r
      return;\r
    }\r
    if (cfg.vertical) {\r
      const parentHeight = root.parentElement?.clientHeight ?? 0;\r
      if (parentHeight > 0 && root.style.height !== \`\${Math.ceil(parentHeight)}px\`) {\r
        root.style.height = \`\${Math.ceil(parentHeight)}px\`;\r
      }\r
    } else if (root.style.height) {\r
      root.style.height = '';\r
    }\r
    track.style.transform = 'none';\r
    clearItems();\r
    const rootRect = root.getBoundingClientRect();\r
    const k = root.offsetWidth ? rootRect.width / root.offsetWidth || 1 : 1;\r
    const trackRect = track.getBoundingClientRect();\r
    const origin = cfg.vertical ? trackRect.top : trackRect.left;\r
    let crossMax = 0;\r
    let sizeMax = 0;\r
    let tipMax = 0;\r
    for (const it of st.items) {\r
      const r = it.el.getBoundingClientRect();\r
      it.center = ((cfg.vertical ? r.top + r.height / 2 : r.left + r.width / 2) - origin) / k;\r
      it.size = (cfg.vertical ? r.height : r.width) / k;\r
      it.cross = (cfg.vertical ? r.width : r.height) / k;\r
      crossMax = Math.max(crossMax, it.cross);\r
      sizeMax = Math.max(sizeMax, it.size);\r
      if (it.tip && it.copy === 0) tipMax = Math.max(tipMax, it.tip.offsetWidth);\r
    }\r
    const a = lists[0].getBoundingClientRect();\r
    const b = lists[1] ? lists[1].getBoundingClientRect() : null;\r
    st.period = (b ? (cfg.vertical ? b.top - a.top : b.left - a.left) : cfg.vertical ? a.height : a.width) / k;\r
    const cs = getComputedStyle(root);\r
    st.box = [root.offsetWidth, root.offsetHeight];\r
    st.length = cfg.vertical\r
      ? root.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)\r
      : root.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);\r
    st.crossMax = crossMax;\r
    st.sizeMax = sizeMax;\r
    st.tipMax = tipMax + crossMax * 0.25;\r
    const first = st.items.filter(it => it.copy === 0);\r
    st.pitch = first.length ? st.period / first.length : st.period;\r
    st.snaps = first.map(it => it.center);\r
    st.itemMode = false;\r
    if (st.period <= 0) return;\r
    geometry();\r
  };\r
\r
  const pointerU = () => {\r
    const geo = st.geo;\r
    if (!st.pointer || !geo) return null;\r
    const cfg = config.current;\r
    let sx = st.pointer[0] - st.box[0] / 2;\r
    let sy = st.pointer[1] - st.box[1] / 2;\r
    if (geo.tilted) {\r
      const p = unproject(geo.m, geo.persp, sx, sy);\r
      if (!p) return null;\r
      sx = p[0];\r
      sy = p[1];\r
    }\r
    const s = cfg.vertical ? sy : sx;\r
    if (geo.mode === 'arc' && geo.R) return geo.R * Math.asin(clamp(s / geo.R, -1, 1));\r
    if (geo.mode === 'orbit') return Math.asin(clamp(s / (geo.R * geo.pf), -1, 1));\r
    return s;\r
  };\r
\r
  const snapTarget = (from, dir) => {\r
    const P = st.period;\r
    const base = st.length / 2 + (st.geo?.lead ?? 0);\r
    let best = null;\r
    for (const c of st.snaps) {\r
      const s = c - base;\r
      const candidate = dir > 0 ? s + P * Math.ceil((from + 0.5 - s) / P) : s + P * Math.floor((from - 0.5 - s) / P);\r
      if (best === null || (dir > 0 ? candidate < best : candidate > best)) best = candidate;\r
    }\r
    return best ?? from;\r
  };\r
\r
  const nearestSnap = value => {\r
    const P = st.period;\r
    const base = st.length / 2 + (st.geo?.lead ?? 0);\r
    let best = value;\r
    let dist = Infinity;\r
    for (const c of st.snaps) {\r
      const s = c - base;\r
      const candidate = s + P * Math.round((value - s) / P);\r
      if (Math.abs(candidate - value) < dist) {\r
        dist = Math.abs(candidate - value);\r
        best = candidate;\r
      }\r
    }\r
    return best;\r
  };\r
\r
  const startMove = (target, duration) => {\r
    st.move = { from: st.offset, delta: target - st.offset, t: 0, dur: duration };\r
  };\r
\r
  const stepTiming = speed => {\r
    const cycle = st.pitch / Math.max(1, Math.abs(speed));\r
    const move = clamp(cycle * 0.55, 0.35, 0.9);\r
    return { move, hold: Math.max(0.35, cycle - move) };\r
  };\r
\r
  const write = (it, key, prop, value, target) => {\r
    if (it[key] !== value) {\r
      it[key] = value;\r
      target.style[prop] = value;\r
    }\r
  };\r
\r
  const render = now => {\r
    const cfg = config.current;\r
    const geo = st.geo;\r
    const L = st.length;\r
    const half = L / 2;\r
    const T = -st.offset - geo.lead;\r
    const lineT = cfg.vertical\r
      ? \`translate3d(0px, \${T.toFixed(2)}px, 0px)\`\r
      : \`translate3d(\${T.toFixed(2)}px, 0px, 0px)\`;\r
    track.style.transform = geo.tilted ? \`rotateX(\${geo.tiltX}deg) rotateY(\${geo.tiltY}deg) \${lineT}\` : lineT;\r
    const introRunning = st.introStart >= 0;\r
    const elapsed = introRunning ? (now - st.introStart) / 1000 : 0;\r
    const lensFocus = geo.mode === 'orbit' ? clamp(cfg.focus, 0, 1) * 0.9 : geo.focus;\r
    const lensMag = geo.magnify * st.mag;\r
    const cursorActive = lensMag > 0 && st.mag > 0.5 && geo.mode !== 'orbit';\r
    const wantsActive = cfg.focus > 0 || cfg.step || cursorActive;\r
    const needItems = geo.mode !== 'line' || lensFocus > 0 || lensMag > 0.0005 || introRunning;\r
    if (!needItems && st.itemMode) clearItems();\r
    st.itemMode = needItems;\r
    if (!needItems && !wantsActive) {\r
      if (st.active) {\r
        st.active.el.removeAttribute('data-active');\r
        st.active = null;\r
      }\r
      return;\r
    }\r
    let best = null;\r
    let bestDist = Infinity;\r
    for (const it of st.items) {\r
      const u = T + it.center - half;\r
      let x = u;\r
      let y = 0;\r
      let rot = 0;\r
      let scale = 1;\r
      let opacity = 1;\r
      let z = '';\r
      let hidden = false;\r
      let dist = Math.abs(u);\r
      if (geo.mode === 'orbit') {\r
        if (u < -geo.C / 2 || u >= geo.C / 2) {\r
          hidden = true;\r
        } else {\r
          const th = (2 * Math.PI * u) / geo.C;\r
          const Z = geo.R * Math.cos(th);\r
          const p = geo.depth / (geo.depth - Z * Math.cos(geo.alpha));\r
          x = geo.R * Math.sin(th) * p;\r
          y = Z * Math.sin(geo.alpha) * p - geo.shift;\r
          scale = p;\r
          if (lensFocus > 0) scale *= 1 + lensFocus * Math.exp(-((th / 0.55) ** 2));\r
          if (lensMag > 0) {\r
            const span = (geo.magSigma * 2 * Math.PI) / geo.C;\r
            scale *= 1 + lensMag * Math.max(0, Math.cos(th)) * Math.exp(-(((th - st.magU) / span) ** 2));\r
          }\r
          const facing = (Math.cos(th) + 1) / 2;\r
          opacity = 0.25 + 0.75 * facing * facing;\r
          z = String(Math.round(facing * 1000));\r
          dist = Math.cos(th) > 0 ? Math.abs(th) * geo.R : Infinity;\r
        }\r
      } else {\r
        let w = u;\r
        if (lensFocus > 0) {\r
          const kf = w / geo.focusSigma;\r
          scale *= 1 + lensFocus * Math.exp(-kf * kf);\r
          opacity *= 1 - 0.45 * lensFocus * (1 - Math.exp(-((u / (geo.focusSigma * 1.8)) ** 2)));\r
          w += lensFocus * geo.focusSigma * HALF_SQRT_PI * erf(kf);\r
        }\r
        const near = Math.abs(w - st.magU);\r
        if (lensMag > 0) {\r
          const km = (w - st.magU) / geo.magSigma;\r
          scale *= 1 + lensMag * Math.exp(-km * km);\r
          w += lensMag * geo.magSigma * HALF_SQRT_PI * erf(km);\r
        }\r
        x = w;\r
        if (geo.mode === 'wave') {\r
          y = geo.amp * Math.sin(geo.k * w);\r
          rot = (Math.atan(geo.amp * geo.k * Math.cos(geo.k * w)) * 90) / Math.PI;\r
        } else if (geo.mode === 'arc' && geo.R) {\r
          const phi = w / geo.R;\r
          if (Math.abs(phi) > geo.limit) hidden = true;\r
          x = geo.R * Math.sin(phi);\r
          y = geo.sign * (geo.R * (1 - Math.cos(phi)) - geo.shift);\r
          rot = (geo.sign * phi * 180) / Math.PI;\r
        }\r
        dist = cursorActive ? near : Math.abs(x);\r
      }\r
      if (introRunning && !hidden) {\r
        const pos = clamp((x + half) / Math.max(1, L), 0, 1);\r
        const e = easeOut(clamp((elapsed - pos * INTRO_STAGGER) / INTRO_TIME, 0, 1));\r
        opacity *= e;\r
        y += (1 - e) * 14;\r
      }\r
      if (wantsActive && !hidden && dist < bestDist) {\r
        bestDist = dist;\r
        best = it;\r
      }\r
      if (!needItems) continue;\r
      const along = x - u;\r
      const t = hidden\r
        ? ''\r
        : \`\${cfg.vertical ? \`translate3d(\${y.toFixed(2)}px, \${along.toFixed(2)}px, 0px)\` : \`translate3d(\${along.toFixed(2)}px, \${y.toFixed(2)}px, 0px)\`}\${\r
            rot ? \` rotate(\${(cfg.vertical ? -rot : rot).toFixed(2)}deg)\` : ''\r
          }\`;\r
      write(it, 't', 'transform', t, it.el);\r
      write(it, 'o', 'opacity', hidden ? '0' : opacity > 0.999 ? '' : opacity.toFixed(3), it.el);\r
      write(it, 'v', 'visibility', hidden ? 'hidden' : '', it.el);\r
      write(it, 'z', 'zIndex', z, it.el);\r
      if (it.content)\r
        write(it, 's', 'transform', Math.abs(scale - 1) < 0.0005 ? '' : \`scale(\${scale.toFixed(4)})\`, it.content);\r
      if (it.tip) {\r
        const lift = ((scale - 1) * it.cross) / 2;\r
        write(\r
          it,\r
          'p',\r
          'transform',\r
          Math.abs(lift) < 0.05\r
            ? ''\r
            : cfg.vertical\r
              ? \`translateX(\${lift.toFixed(2)}px)\`\r
              : \`translateY(\${lift.toFixed(2)}px)\`,\r
          it.tip\r
        );\r
      }\r
    }\r
    const active = best && bestDist < Math.max(best.size, st.pitch) / 2 + 1 ? best : null;\r
    if (active !== st.active) {\r
      st.active?.el.removeAttribute('data-active');\r
      active?.el.setAttribute('data-active', '');\r
      st.active = active;\r
    }\r
  };\r
\r
  const frame = now => {\r
    st.raf = 0;\r
    if (st.destroyed || !st.geo || st.period <= 0) return;\r
    const cfg = config.current;\r
    const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.1) : 0;\r
    st.last = now;\r
    const P = st.period;\r
    let busy = false;\r
    if (st.introStart === -1 && !st.introDone && st.visible) {\r
      if (cfg.intro && !st.reduced) {\r
        st.introStart = now;\r
      } else {\r
        st.introDone = true;\r
      }\r
      root.removeAttribute('data-intro');\r
    }\r
    if (st.introStart >= 0) {\r
      if ((now - st.introStart) / 1000 >= INTRO_TIME + INTRO_STAGGER) {\r
        st.introStart = -2;\r
        st.introDone = true;\r
      } else {\r
        busy = true;\r
      }\r
    }\r
    const travel = Math.sign(cfg.speed) || 1;\r
    const paused = st.focused || (st.hovered && cfg.hoverValue !== undefined);\r
    const pausedSpeed = st.focused ? 0 : (cfg.hoverValue ?? 0);\r
    let target = st.reduced ? 0 : paused ? pausedSpeed * travel * cfg.dirSign : cfg.speed * cfg.dirSign;\r
    if (cfg.scrollBoost > 0 && !st.reduced) {\r
      st.scrollVel *= Math.exp(-dt / 0.18);\r
      if (Math.abs(st.scrollVel) > 1) busy = true;\r
      target += clamp(st.scrollVel * cfg.scrollBoost, -3000, 3000) * travel * cfg.dirSign;\r
    }\r
    if (st.drag?.active) {\r
      busy = true;\r
    } else if (st.seek) {\r
      st.seek.t = Math.min(1, st.seek.t + dt / st.seek.dur);\r
      st.offset = st.seek.from + st.seek.delta * easeInOut(st.seek.t);\r
      st.velocity = 0;\r
      if (st.seek.t >= 1) st.seek = null;\r
      busy = true;\r
    } else if (st.move) {\r
      st.move.t = Math.min(1, st.move.t + dt / st.move.dur);\r
      st.offset = st.move.from + st.move.delta * easeInOut(st.move.t);\r
      st.velocity = 0;\r
      busy = true;\r
      if (st.move.t >= 1) {\r
        st.move = null;\r
        st.hold = stepTiming(paused ? pausedSpeed : cfg.speed).hold;\r
      }\r
    } else if (cfg.step && !st.reduced) {\r
      const speed = paused ? pausedSpeed : cfg.speed;\r
      st.velocity = 0;\r
      if (speed) {\r
        busy = true;\r
        st.hold -= dt;\r
        if (st.hold <= 0) {\r
          const dir = Math.sign(speed) * cfg.dirSign;\r
          startMove(snapTarget(st.offset, dir), stepTiming(speed).move);\r
        }\r
      }\r
    } else {\r
      const tau = st.glide ? GLIDE_TAU : SMOOTH_TAU;\r
      st.velocity += (target - st.velocity) * (1 - Math.exp(-dt / tau));\r
      if (st.glide && Math.abs(st.velocity - target) < 2) st.glide = false;\r
      if (Math.abs(st.velocity - target) < 0.01) st.velocity = target;\r
      st.offset += st.velocity * dt;\r
      if (st.velocity !== 0 || target !== 0) busy = true;\r
    }\r
    if (!st.focused && !st.seek && !st.drag?.active) {\r
      const wrapped = ((st.offset % P) + P) % P;\r
      if (st.move) st.move.from += wrapped - st.offset;\r
      st.offset = wrapped;\r
    }\r
    const wantMag = cfg.magnify > 0 && st.pointerInside && !st.reduced ? 1 : 0;\r
    if (st.mag !== wantMag) {\r
      st.mag += (wantMag - st.mag) * (1 - Math.exp(-dt / (wantMag ? 0.12 : 0.25)));\r
      if (Math.abs(wantMag - st.mag) < 0.002) st.mag = wantMag;\r
      busy = true;\r
    }\r
    const pu = st.mag > 0 ? pointerU() : null;\r
    if (pu !== null) {\r
      if (!st.magReady) {\r
        st.magU = pu;\r
        st.magReady = true;\r
      }\r
      const next = st.magU + (pu - st.magU) * (1 - Math.exp(-dt / 0.06));\r
      if (Math.abs(next - pu) > 0.05) busy = true;\r
      st.magU = Math.abs(next - pu) > 0.05 ? next : pu;\r
    } else if (st.mag === 0) {\r
      st.magReady = false;\r
    }\r
    render(now);\r
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
  const dragScale = () => {\r
    const geo = st.geo;\r
    if (!geo) return 1;\r
    if (geo.mode === 'orbit') return geo.C / (2 * Math.PI * geo.R * geo.pf);\r
    const pu = pointerU();\r
    if (pu === null || geo.focus <= 0) return 1;\r
    const kf = pu / geo.focusSigma;\r
    return 1 / (1 + geo.focus * Math.exp(-kf * kf));\r
  };\r
\r
  const onEnter = e => {\r
    st.hovered = true;\r
    if (e.pointerType !== 'touch') {\r
      st.pointerInside = true;\r
      st.pointer = local(e);\r
    }\r
    wake();\r
  };\r
\r
  const onLeave = () => {\r
    st.hovered = false;\r
    st.pointerInside = false;\r
    wake();\r
  };\r
\r
  const onDown = e => {\r
    st.pressedAt = performance.now();\r
    if (!config.current.draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
    const [x, y] = local(e);\r
    if (e.pointerType !== 'touch') st.pointer = [x, y];\r
    st.drag = { id: e.pointerId, x, y, active: false, samples: [], scale: dragScale(), anchor: 0, offset: 0 };\r
  };\r
\r
  const onMove = e => {\r
    const cfg = config.current;\r
    if (e.pointerType !== 'touch') {\r
      st.pointer = local(e);\r
      st.pointerInside = true;\r
    }\r
    const d = st.drag;\r
    if (d && e.pointerId === d.id) {\r
      const [x, y] = local(e);\r
      const along = cfg.vertical ? y - d.y : x - d.x;\r
      const across = cfg.vertical ? x - d.x : y - d.y;\r
      if (!d.active) {\r
        if (Math.abs(along) < DRAG_THRESHOLD) return wake();\r
        if (Math.abs(across) > Math.abs(along)) {\r
          st.drag = null;\r
          return wake();\r
        }\r
        d.active = true;\r
        d.anchor = along;\r
        d.offset = st.offset;\r
        st.move = null;\r
        st.seek = null;\r
        st.glide = false;\r
        st.velocity = 0;\r
        try {\r
          root.setPointerCapture(e.pointerId);\r
        } catch {}\r
        root.setAttribute('data-dragging', '');\r
      }\r
      const next = d.offset - (along - d.anchor) * d.scale;\r
      const P = st.period || 1;\r
      st.offset = ((next % P) + P) % P;\r
      d.offset += st.offset - next;\r
      const now = performance.now();\r
      d.samples.push([now, along]);\r
      while (d.samples.length > 2 && now - d.samples[0][0] > 100) d.samples.shift();\r
    }\r
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
    const cfg = config.current;\r
    const now = performance.now();\r
    st.suppressUntil = now + 400;\r
    let v = 0;\r
    const s = d.samples;\r
    if (!cancelled && s.length > 1) {\r
      const [t0, a0] = s[0];\r
      const [t1, a1] = s[s.length - 1];\r
      if (t1 > t0 && now - t1 < 80) v = clamp((-(a1 - a0) / (t1 - t0)) * 1000 * d.scale, -MAX_FLING, MAX_FLING);\r
    }\r
    if (cfg.step && !st.reduced) {\r
      const target = nearestSnap(st.offset + v * 0.35);\r
      startMove(target, clamp(0.3 + Math.abs(target - st.offset) / 1800, 0.3, 0.8));\r
      st.velocity = 0;\r
    } else {\r
      st.velocity = v;\r
      st.glide = Math.abs(v) > 30;\r
    }\r
    wake();\r
  };\r
\r
  const onUp = e => endDrag(e, false);\r
  const onCancel = e => endDrag(e, true);\r
\r
  const onClick = e => {\r
    if (performance.now() < st.suppressUntil) {\r
      e.preventDefault();\r
      e.stopPropagation();\r
      st.suppressUntil = 0;\r
    }\r
  };\r
\r
  const onDragStart = e => {\r
    if (config.current.draggable) e.preventDefault();\r
  };\r
\r
  const onFocusIn = e => {\r
    const target = e.target;\r
    if (performance.now() - st.pressedAt < 800) return;\r
    st.focused = true;\r
    const it = st.items.find(item => item.el.contains(target));\r
    if (it && st.geo) {\r
      const u = -st.offset - st.geo.lead + it.center - st.length / 2;\r
      const comfortable = st.geo.mode === 'orbit' ? 1 : Math.max(0, st.length / 2 - it.size);\r
      if (Math.abs(u) > comfortable) {\r
        st.move = null;\r
        st.seek = { from: st.offset, delta: u, t: 0, dur: clamp(0.35 + Math.abs(u) / 2000, 0.35, 0.8) };\r
      }\r
    }\r
    wake();\r
  };\r
\r
  const onFocusOut = e => {\r
    if (root.contains(e.relatedTarget)) return;\r
    st.focused = false;\r
    wake();\r
  };\r
\r
  const onRootScroll = () => {\r
    if (root.scrollLeft || root.scrollTop) {\r
      root.scrollLeft = 0;\r
      root.scrollTop = 0;\r
    }\r
  };\r
\r
  const onScroll = () => {\r
    const now = performance.now();\r
    const y = window.scrollY;\r
    if (st.scrollT && now > st.scrollT) {\r
      const v = ((y - st.scrollY) / (now - st.scrollT)) * 1000;\r
      st.scrollVel += (clamp(v, -6000, 6000) - st.scrollVel) * 0.5;\r
    }\r
    st.scrollY = y;\r
    st.scrollT = now;\r
    if (config.current.scrollBoost > 0) wake();\r
  };\r
\r
  const onMotion = () => {\r
    st.reduced = !!query?.matches;\r
    wake();\r
  };\r
\r
  root.addEventListener('pointerenter', onEnter);\r
  root.addEventListener('pointerleave', onLeave);\r
  root.addEventListener('pointerdown', onDown);\r
  root.addEventListener('pointermove', onMove);\r
  root.addEventListener('pointerup', onUp);\r
  root.addEventListener('pointercancel', onCancel);\r
  root.addEventListener('lostpointercapture', onCancel);\r
  root.addEventListener('click', onClick, true);\r
  root.addEventListener('dragstart', onDragStart);\r
  root.addEventListener('focusin', onFocusIn);\r
  root.addEventListener('focusout', onFocusOut);\r
  root.addEventListener('scroll', onRootScroll);\r
  window.addEventListener('scroll', onScroll, { passive: true });\r
  query?.addEventListener?.('change', onMotion);\r
\r
  let resizeObserver = null;\r
  const observed = new Set();\r
  const refresh = () => {\r
    collect();\r
    measure();\r
    if (resizeObserver) {\r
      const first = track.children[0];\r
      for (const el of [root, first]) {\r
        if (el && !observed.has(el)) {\r
          resizeObserver.observe(el);\r
          observed.add(el);\r
        }\r
      }\r
    }\r
    st.last = 0;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    st.raf = 0;\r
    if (st.geo && st.period > 0) frame(performance.now());\r
  };\r
\r
  if (typeof ResizeObserver !== 'undefined') {\r
    resizeObserver = new ResizeObserver(() => {\r
      measure();\r
      if (st.geo && st.period > 0) render(performance.now());\r
      wake();\r
    });\r
  } else {\r
    window.addEventListener('resize', refresh);\r
  }\r
\r
  let intersection = null;\r
  if (typeof IntersectionObserver !== 'undefined') {\r
    intersection = new IntersectionObserver(\r
      entries => {\r
        const entry = entries[entries.length - 1];\r
        st.visible = entry.isIntersecting;\r
        if (st.visible) wake();\r
      },\r
      { threshold: 0.1 }\r
    );\r
    intersection.observe(root);\r
  }\r
\r
  const onVisibility = () => {\r
    if (!document.hidden) wake();\r
  };\r
  document.addEventListener('visibilitychange', onVisibility);\r
\r
  const destroy = () => {\r
    st.destroyed = true;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    root.removeEventListener('pointerenter', onEnter);\r
    root.removeEventListener('pointerleave', onLeave);\r
    root.removeEventListener('pointerdown', onDown);\r
    root.removeEventListener('pointermove', onMove);\r
    root.removeEventListener('pointerup', onUp);\r
    root.removeEventListener('pointercancel', onCancel);\r
    root.removeEventListener('lostpointercapture', onCancel);\r
    root.removeEventListener('click', onClick, true);\r
    root.removeEventListener('dragstart', onDragStart);\r
    root.removeEventListener('focusin', onFocusIn);\r
    root.removeEventListener('focusout', onFocusOut);\r
    root.removeEventListener('scroll', onRootScroll);\r
    window.removeEventListener('scroll', onScroll);\r
    window.removeEventListener('resize', refresh);\r
    document.removeEventListener('visibilitychange', onVisibility);\r
    query?.removeEventListener?.('change', onMotion);\r
    resizeObserver?.disconnect();\r
    intersection?.disconnect();\r
  };\r
\r
  return { refresh, wake, destroy, state: st };\r
};\r
\r
export const LogoLoop = memo(\r
  ({\r
    logos,\r
    speed = 120,\r
    direction = 'left',\r
    width = '100%',\r
    logoHeight = 28,\r
    gap = 32,\r
    pauseOnHover,\r
    hoverSpeed,\r
    fadeOut = true,\r
    fadeOutWidth = 0.12,\r
    scaleOnHover = false,\r
    layout = 'line',\r
    bend = 0.5,\r
    focus = 0,\r
    magnify = 0,\r
    tiltX = 0,\r
    tiltY = 0,\r
    step = false,\r
    muted = 0,\r
    labels = 'none',\r
    draggable = true,\r
    scrollBoost = 0,\r
    intro = true,\r
    renderItem,\r
    ariaLabel = 'Partner logos',\r
    className,\r
    style\r
  }) => {\r
    const rootRef = useRef(null);\r
    const trackRef = useRef(null);\r
    const engineRef = useRef(null);\r
    const [{ copies, primary }, setLayout] = useState({ copies: 3, primary: 1 });\r
    const [introPending] = useState(intro);\r
\r
    const vertical = direction === 'up' || direction === 'down';\r
    const config = useRef(null);\r
    config.current = {\r
      speed,\r
      dirSign: (vertical ? direction === 'up' : direction !== 'right') ? 1 : -1,\r
      hoverValue: hoverSpeed !== undefined ? hoverSpeed : pauseOnHover === false ? undefined : 0,\r
      vertical,\r
      layout,\r
      bend,\r
      focus,\r
      magnify,\r
      tiltX,\r
      tiltY,\r
      step,\r
      draggable,\r
      scrollBoost,\r
      intro,\r
      scaleOnHover,\r
      labels,\r
      links: logos.some(item => item.href)\r
    };\r
\r
    useIsomorphicLayoutEffect(() => {\r
      const engine = createEngine(rootRef.current, trackRef.current, config, setLayout);\r
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
      copies,\r
      primary,\r
      logos,\r
      vertical,\r
      logoHeight,\r
      gap,\r
      labels,\r
      layout,\r
      bend,\r
      focus,\r
      magnify,\r
      tiltX,\r
      tiltY,\r
      scaleOnHover\r
    ]);\r
\r
    useEffect(() => {\r
      engineRef.current?.wake();\r
    });\r
\r
    const lists = useMemo(\r
      () =>\r
        Array.from({ length: copies }, (_, copyIndex) => {\r
          const isPrimary = copyIndex === primary;\r
          return (\r
            <ul className="logoloop__list" key={copyIndex} role="list" aria-hidden={isPrimary ? undefined : true}>\r
              {logos.map((item, itemIndex) => {\r
                const key = \`\${copyIndex}-\${itemIndex}\`;\r
                const isNode = 'node' in item;\r
                const visual = renderItem ? (\r
                  renderItem(item, key)\r
                ) : isNode ? (\r
                  <span className="logoloop__node" aria-hidden={!!item.href && !item.ariaLabel}>\r
                    {item.node}\r
                  </span>\r
                ) : (\r
                  <img\r
                    src={item.src}\r
                    srcSet={item.srcSet}\r
                    sizes={item.sizes}\r
                    width={item.width}\r
                    height={item.height}\r
                    alt={item.alt ?? ''}\r
                    title={item.title}\r
                    loading="lazy"\r
                    decoding="async"\r
                    draggable={false}\r
                  />\r
                );\r
                const text = (labels === 'inline' || labels === 'below') && item.title ? item.title : null;\r
                const inner = (\r
                  <>\r
                    {visual}\r
                    {text && (\r
                      <span className="logoloop__label" aria-hidden={!isNode && !!item.alt}>\r
                        {text}\r
                      </span>\r
                    )}\r
                  </>\r
                );\r
                const name = isNode ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);\r
                return (\r
                  <li\r
                    className="logoloop__item"\r
                    key={key}\r
                    role="listitem"\r
                    data-color={item.hoverColor ? '' : undefined}\r
                    style={item.hoverColor ? { '--logoloop-item-color': item.hoverColor } : undefined}\r
                  >\r
                    {item.href ? (\r
                      <a\r
                        className="logoloop__content"\r
                        href={item.href}\r
                        aria-label={name || 'logo link'}\r
                        target="_blank"\r
                        rel="noreferrer noopener"\r
                        draggable={false}\r
                        tabIndex={isPrimary ? undefined : -1}\r
                      >\r
                        {inner}\r
                      </a>\r
                    ) : (\r
                      <div className="logoloop__content">{inner}</div>\r
                    )}\r
                    {labels === 'hover' && item.title && (\r
                      <span className="logoloop__tip" aria-hidden="true">\r
                        {item.title}\r
                      </span>\r
                    )}\r
                  </li>\r
                );\r
              })}\r
            </ul>\r
          );\r
        }),\r
      [copies, primary, logos, renderItem, labels]\r
    );\r
\r
    const mask = fadeOut ? fadeMask(fadeOutWidth, vertical) : undefined;\r
    const amount = clamp(muted, 0, 1);\r
\r
    const containerStyle = {\r
      width: vertical\r
        ? toCssLength(width) === '100%'\r
          ? undefined\r
          : toCssLength(width)\r
        : (toCssLength(width) ?? '100%'),\r
      '--logoloop-gap': \`\${gap}px\`,\r
      '--logoloop-logoHeight': \`\${logoHeight}px\`,\r
      ...(amount > 0 && {\r
        '--logoloop-gray': Math.min(1, amount * 2).toFixed(3),\r
        '--logoloop-dim': (1 - amount * 0.6).toFixed(3)\r
      }),\r
      ...(mask && { WebkitMaskImage: mask, maskImage: mask }),\r
      ...style\r
    };\r
\r
    const rootClassName = [\r
      'logoloop',\r
      vertical ? 'logoloop--vertical' : 'logoloop--horizontal',\r
      scaleOnHover && 'logoloop--scale-hover',\r
      className\r
    ]\r
      .filter(Boolean)\r
      .join(' ');\r
\r
    return (\r
      <div\r
        ref={rootRef}\r
        className={rootClassName}\r
        style={containerStyle}\r
        role="region"\r
        aria-label={ariaLabel}\r
        data-intro={introPending ? '' : undefined}\r
        data-draggable={draggable ? '' : undefined}\r
        data-muted={amount > 0 ? '' : undefined}\r
        data-labels={labels !== 'none' ? labels : undefined}\r
      >\r
        <div className="logoloop__track" ref={trackRef}>\r
          {lists}\r
        </div>\r
      </div>\r
    );\r
  }\r
);\r
\r
LogoLoop.displayName = 'LogoLoop';\r
\r
export default LogoLoop;\r
`,r=`.logoloop {\r
  --logoloop-gap: 32px;\r
  --logoloop-logoHeight: 28px;\r
  --logoloop-pad: 0px;\r
  position: relative;\r
  overflow: hidden;\r
  overflow: clip;\r
  padding-top: var(--logoloop-pad);\r
  padding-bottom: var(--logoloop-pad);\r
  -webkit-tap-highlight-color: transparent;\r
}\r
\r
.logoloop--vertical {\r
  display: inline-block;\r
  height: 100%;\r
  padding: 0 var(--logoloop-pad);\r
}\r
\r
.logoloop[data-draggable] {\r
  cursor: grab;\r
  touch-action: pan-y pinch-zoom;\r
}\r
\r
.logoloop--vertical[data-draggable] {\r
  touch-action: pan-x pinch-zoom;\r
}\r
\r
.logoloop[data-dragging],\r
.logoloop[data-dragging] * {\r
  cursor: grabbing;\r
}\r
\r
.logoloop__track {\r
  position: relative;\r
  z-index: 0;\r
  display: flex;\r
  width: max-content;\r
  will-change: transform;\r
  user-select: none;\r
  -webkit-user-select: none;\r
}\r
\r
.logoloop--vertical .logoloop__track {\r
  flex-direction: column;\r
  width: 100%;\r
  height: max-content;\r
}\r
\r
.logoloop__list {\r
  display: flex;\r
  align-items: center;\r
  margin: 0;\r
  padding: 0;\r
  list-style: none;\r
}\r
\r
.logoloop--vertical .logoloop__list {\r
  flex-direction: column;\r
}\r
\r
.logoloop__item {\r
  position: relative;\r
  flex: 0 0 auto;\r
  margin-right: var(--logoloop-gap);\r
  font-size: var(--logoloop-logoHeight);\r
  line-height: 1;\r
}\r
\r
.logoloop--vertical .logoloop__item {\r
  margin-right: 0;\r
  margin-bottom: var(--logoloop-gap);\r
}\r
\r
.logoloop[data-intro] .logoloop__item {\r
  opacity: 0;\r
}\r
\r
.logoloop__content {\r
  display: inline-flex;\r
  align-items: center;\r
  gap: calc(var(--logoloop-logoHeight) * 0.3);\r
  border-radius: 4px;\r
  color: inherit;\r
  text-decoration: none;\r
  transition:\r
    opacity 0.35s ease,\r
    filter 0.35s ease,\r
    color 0.35s ease;\r
}\r
\r
.logoloop[data-labels='below'] .logoloop__content {\r
  flex-direction: column;\r
  gap: calc(var(--logoloop-logoHeight) * 0.22);\r
}\r
\r
.logoloop__content:focus-visible {\r
  outline: 2px solid currentColor;\r
  outline-offset: 2px;\r
}\r
\r
.logoloop__node {\r
  display: inline-flex;\r
  align-items: center;\r
}\r
\r
.logoloop__item img {\r
  display: block;\r
  width: auto;\r
  height: var(--logoloop-logoHeight);\r
  object-fit: contain;\r
  image-rendering: -webkit-optimize-contrast;\r
  -webkit-user-drag: none;\r
  pointer-events: none;\r
}\r
\r
.logoloop__node,\r
.logoloop__item img {\r
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);\r
}\r
\r
.logoloop--scale-hover .logoloop__item:hover img,\r
.logoloop--scale-hover .logoloop__item:hover .logoloop__node {\r
  transform: scale(1.2);\r
}\r
\r
.logoloop__label {\r
  font-size: max(12px, calc(var(--logoloop-logoHeight) * 0.5));\r
  font-weight: 600;\r
  line-height: 1.2;\r
  letter-spacing: -0.01em;\r
  white-space: nowrap;\r
}\r
\r
.logoloop[data-labels='below'] .logoloop__label {\r
  font-size: max(11px, calc(var(--logoloop-logoHeight) * 0.26));\r
  font-weight: 500;\r
  letter-spacing: 0;\r
  opacity: 0.72;\r
}\r
\r
.logoloop__tip {\r
  position: absolute;\r
  top: 100%;\r
  left: 50%;\r
  margin-top: calc(var(--logoloop-logoHeight) * 0.2);\r
  font-size: max(11px, calc(var(--logoloop-logoHeight) * 0.26));\r
  font-weight: 500;\r
  line-height: 1.2;\r
  white-space: nowrap;\r
  opacity: 0;\r
  translate: -50% 4px;\r
  pointer-events: none;\r
  transition:\r
    opacity 0.25s ease,\r
    translate 0.25s ease;\r
}\r
\r
.logoloop--vertical .logoloop__tip {\r
  top: 50%;\r
  left: 100%;\r
  margin-top: 0;\r
  margin-left: calc(var(--logoloop-logoHeight) * 0.25);\r
  translate: 4px -50%;\r
}\r
\r
.logoloop__item:hover .logoloop__tip,\r
.logoloop__item:focus-within .logoloop__tip,\r
.logoloop__item[data-active] .logoloop__tip {\r
  opacity: 0.8;\r
  translate: -50% 0;\r
}\r
\r
.logoloop--vertical .logoloop__item:hover .logoloop__tip,\r
.logoloop--vertical .logoloop__item:focus-within .logoloop__tip,\r
.logoloop--vertical .logoloop__item[data-active] .logoloop__tip {\r
  translate: 0 -50%;\r
}\r
\r
.logoloop[data-muted] .logoloop__content {\r
  filter: grayscale(var(--logoloop-gray, 1));\r
  opacity: var(--logoloop-dim, 0.5);\r
}\r
\r
.logoloop[data-muted] .logoloop__item:hover .logoloop__content,\r
.logoloop[data-muted] .logoloop__item:focus-within .logoloop__content,\r
.logoloop[data-muted] .logoloop__item[data-active] .logoloop__content {\r
  filter: none;\r
  opacity: 1;\r
}\r
\r
.logoloop__item[data-color]:hover .logoloop__content,\r
.logoloop__item[data-color]:focus-within .logoloop__content,\r
.logoloop__item[data-color][data-active] .logoloop__content {\r
  color: var(--logoloop-item-color);\r
}\r
\r
.logoloop:not([data-muted]) .logoloop__item:not([data-color]) a.logoloop__content:hover {\r
  opacity: 0.8;\r
}\r
\r
@media (prefers-reduced-motion: reduce) {\r
  .logoloop__content,\r
  .logoloop__node,\r
  .logoloop__item img,\r
  .logoloop__tip {\r
    transition: none;\r
  }\r
}\r
`,e=`'use client';\r
\r
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';\r
\r
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const cx = (...parts) => parts.filter(Boolean).join(' ');\r
\r
const SMOOTH_TAU = 0.25;\r
const GLIDE_TAU = 0.8;\r
const DRAG_THRESHOLD = 6;\r
const MAX_FLING = 4000;\r
const INTRO_TIME = 0.7;\r
const INTRO_STAGGER = 0.45;\r
const HALF_SQRT_PI = Math.sqrt(Math.PI) / 2;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const toCssLength = value => (typeof value === 'number' ? \`\${value}px\` : (value ?? undefined));\r
\r
const erf = x => {\r
  const a = Math.abs(x);\r
  const t = 1 / (1 + 0.3275911 * a);\r
  const y =\r
    1 -\r
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);\r
  return x < 0 ? -y : y;\r
};\r
\r
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);\r
\r
const easeOut = t => 1 - Math.pow(1 - t, 3);\r
\r
const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const fadeMask = (size, vertical) => {\r
  const span = clamp(size, 0, 0.5) * 100;\r
  if (span <= 0) return undefined;\r
  const stops = [];\r
  for (let i = 0; i <= 12; i++) {\r
    stops.push(\`rgba(0,0,0,\${smootherstep(i / 12).toFixed(4)}) \${((span * i) / 12).toFixed(3)}%\`);\r
  }\r
  for (let i = 12; i >= 0; i--) {\r
    stops.push(\`rgba(0,0,0,\${smootherstep(i / 12).toFixed(4)}) \${(100 - (span * i) / 12).toFixed(3)}%\`);\r
  }\r
  return \`linear-gradient(\${vertical ? 'to bottom' : 'to right'}, \${stops.join(', ')})\`;\r
};\r
\r
const rotationMatrix = (degX, degY) => {\r
  const a = (degX * Math.PI) / 180;\r
  const b = (degY * Math.PI) / 180;\r
  const ca = Math.cos(a);\r
  const sa = Math.sin(a);\r
  const cb = Math.cos(b);\r
  const sb = Math.sin(b);\r
  return [cb, 0, sb, sa * sb, ca, -sa * cb, -ca * sb, sa, ca * cb];\r
};\r
\r
const unproject = (m, depth, sx, sy) => {\r
  const den = m[8] * depth - m[2] * sx - m[5] * sy;\r
  if (den <= 1e-6) return null;\r
  const t = (m[8] * depth) / den;\r
  if (t <= 0) return null;\r
  const qx = t * sx;\r
  const qy = t * sy;\r
  const qz = depth * (1 - t);\r
  return [m[0] * qx + m[3] * qy + m[6] * qz, m[1] * qx + m[4] * qy + m[7] * qz];\r
};\r
\r
const project = (m, depth, px, py) => {\r
  const k = depth / (depth - (m[6] * px + m[7] * py));\r
  return [(m[0] * px + m[1] * py) * k, (m[3] * px + m[4] * py) * k];\r
};\r
\r
const createEngine = (root, track, config, setLayout) => {\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const st = {\r
    offset: 0,\r
    velocity: 0,\r
    period: 0,\r
    length: 0,\r
    box: [0, 0],\r
    items: [],\r
    snaps: [],\r
    pitch: 0,\r
    crossMax: 0,\r
    sizeMax: 0,\r
    tipMax: 0,\r
    geo: null,\r
    layout: { copies: 2, primary: 0 },\r
    hovered: false,\r
    focused: false,\r
    pointer: null,\r
    pointerInside: false,\r
    mag: 0,\r
    magU: 0,\r
    magReady: false,\r
    drag: null,\r
    glide: false,\r
    suppressUntil: 0,\r
    pressedAt: -1e9,\r
    move: null,\r
    hold: 0,\r
    seek: null,\r
    scrollVel: 0,\r
    scrollY: window.scrollY,\r
    scrollT: 0,\r
    visible: typeof IntersectionObserver === 'undefined',\r
    introStart: -1,\r
    introDone: !config.current.intro,\r
    itemMode: false,\r
    active: null,\r
    raf: 0,\r
    last: 0,\r
    reduced: !!query?.matches,\r
    destroyed: false\r
  };\r
\r
  const collect = () => {\r
    const items = [];\r
    Array.from(track.children).forEach((list, copy) => {\r
      Array.from(list.children).forEach((el, index) => {\r
        items.push({\r
          el,\r
          copy,\r
          index,\r
          content: el.children[0] || null,\r
          tip: el.children[1] || null,\r
          center: 0,\r
          size: 0,\r
          cross: 0,\r
          t: '',\r
          o: '',\r
          v: '',\r
          z: '',\r
          s: '',\r
          p: ''\r
        });\r
      });\r
    });\r
    st.items = items;\r
    st.active = null;\r
  };\r
\r
  const clearItems = () => {\r
    for (const it of st.items) {\r
      it.el.style.transform = '';\r
      it.el.style.opacity = '';\r
      it.el.style.visibility = '';\r
      it.el.style.zIndex = '';\r
      if (it.content) it.content.style.transform = '';\r
      if (it.tip) it.tip.style.transform = '';\r
      it.t = it.o = it.v = it.z = it.s = it.p = '';\r
    }\r
  };\r
\r
  const geometry = () => {\r
    const cfg = config.current;\r
    const L = st.length;\r
    const P = st.period;\r
    const hc = st.crossMax;\r
    const w = st.sizeMax;\r
    const bend = clamp(cfg.bend, -1, 1);\r
    const geo = {\r
      mode: cfg.layout,\r
      shift: 0,\r
      uMin: -L / 2 - w,\r
      uMax: L / 2 + w,\r
      lead: 0,\r
      focus: clamp(cfg.focus, 0, 1) * 0.9,\r
      focusSigma: Math.max(40, L * 0.18),\r
      magnify: clamp(cfg.magnify, 0, 1),\r
      magSigma: Math.max(hc * 1.4, st.pitch * 1.1),\r
      amp: 0,\r
      k: 0,\r
      R: 0,\r
      sign: 1,\r
      limit: 0,\r
      C: 0,\r
      alpha: 0,\r
      depth: 0,\r
      pf: 1,\r
      tilted: false,\r
      tiltX: 0,\r
      tiltY: 0,\r
      m: [1, 0, 0, 0, 1, 0, 0, 0, 1],\r
      persp: 0\r
    };\r
    let pad = cfg.scaleOnHover ? hc * 0.1 : 0;\r
    const lens = (1 + geo.focus) * (1 + geo.magnify) - 1;\r
    if (geo.mode === 'wave') {\r
      geo.amp = bend * (hc * 0.6 + L * 0.035);\r
      geo.k = (2 * Math.PI) / Math.max(1, L / 1.25);\r
      pad += Math.abs(geo.amp) + (lens * hc) / 2 + hc * 0.08;\r
    } else if (geo.mode === 'arc' && Math.abs(bend) > 0.005) {\r
      const edge = Math.abs(bend) * (Math.PI / 4);\r
      const R = L / 2 / Math.sin(edge);\r
      const sag = R * (1 - Math.cos(edge));\r
      geo.R = R;\r
      geo.sign = Math.sign(bend);\r
      geo.shift = sag / 2;\r
      geo.limit = Math.PI * 0.6;\r
      const reach = R * Math.min(Math.PI / 2, Math.asin(Math.min(1, (L / 2 + w) / R))) + w;\r
      geo.uMin = -reach;\r
      geo.uMax = reach;\r
      pad += sag / 2 + (w / 2) * Math.sin(edge) + (lens * hc) / 2;\r
    } else if (geo.mode === 'orbit') {\r
      const R = Math.max(40, L * 0.43 - w * 0.2);\r
      const k = Math.max(1, Math.round((2 * Math.PI * R) / P));\r
      const alpha = Math.sign(bend) * Math.atan2(Math.abs(bend) * Math.max(hc * 2, R * 0.36), R);\r
      const depth = R * 5;\r
      const pf = depth / (depth - R * Math.cos(alpha));\r
      const pb = depth / (depth + R * Math.cos(alpha));\r
      const yf = R * Math.sin(alpha) * pf;\r
      const yb = -R * Math.sin(alpha) * pb;\r
      const grow = (1 + lens) * (cfg.scaleOnHover ? 1.2 : 1);\r
      const lo = Math.min(yf - (hc * pf * grow) / 2, yb - (hc * pb) / 2);\r
      const hi = Math.max(yf + (hc * pf * grow) / 2, yb + (hc * pb) / 2);\r
      geo.R = R;\r
      geo.C = k * P;\r
      geo.alpha = alpha;\r
      geo.depth = depth;\r
      geo.pf = pf;\r
      geo.shift = (lo + hi) / 2;\r
      geo.uMin = -geo.C / 2;\r
      geo.uMax = geo.C / 2;\r
      pad = Math.max(0, (hi - lo) / 2 - hc / 2);\r
    } else {\r
      pad += (lens * hc) / 2;\r
    }\r
    if (cfg.labels === 'hover') pad += cfg.vertical ? st.tipMax : hc * 0.2 + Math.max(11, hc * 0.26) * 1.3;\r
    const tx = clamp(cfg.tiltX, -60, 60);\r
    const ty = clamp(cfg.tiltY, -60, 60);\r
    if (Math.abs(tx) > 0.01 || Math.abs(ty) > 0.01) {\r
      geo.tilted = true;\r
      geo.tiltX = tx;\r
      geo.tiltY = ty;\r
      geo.m = rotationMatrix(tx, ty);\r
      geo.persp = Math.max(L, 480) * 1.3;\r
      const edge = L / 2 + w;\r
      const along = s => {\r
        const p = cfg.vertical ? unproject(geo.m, geo.persp, 0, s) : unproject(geo.m, geo.persp, s, 0);\r
        if (!p) return Math.sign(s) * L * 4;\r
        return clamp(cfg.vertical ? p[1] : p[0], -L * 4, L * 4);\r
      };\r
      const a = along(-edge);\r
      const b = along(edge);\r
      geo.uMin = Math.min(geo.uMin, a, b) - w;\r
      geo.uMax = Math.max(geo.uMax, a, b) + w;\r
      const band = hc / 2 + pad;\r
      let reach = band;\r
      for (const u of [a, b, 0]) {\r
        for (const v of [-band, band]) {\r
          const q = cfg.vertical ? project(geo.m, geo.persp, v, u) : project(geo.m, geo.persp, u, v);\r
          reach = Math.max(reach, Math.abs(cfg.vertical ? q[0] : q[1]));\r
        }\r
      }\r
      pad = reach - hc / 2;\r
    }\r
    const extra = cfg.links ? 2 : 0;\r
    geo.lead = (Math.max(0, Math.ceil((-geo.uMin - L / 2) / P)) + extra) * P;\r
    const copies = Math.max(2, Math.ceil((geo.uMax + L / 2 + geo.lead) / P) + 2 + (extra ? 1 : 0));\r
    const primary = Math.min(copies - 1, Math.floor((geo.lead + L / 2) / P));\r
    st.geo = geo;\r
    root.style.setProperty('--logoloop-pad', \`\${Math.ceil(pad)}px\`);\r
    root.style.perspective = geo.tilted ? \`\${geo.persp}px\` : '';\r
    track.style.transformOrigin = geo.tilted ? (cfg.vertical ? \`50% \${L / 2}px\` : \`\${L / 2}px 50%\`) : '';\r
    if (copies !== st.layout.copies || primary !== st.layout.primary) {\r
      st.layout = { copies, primary };\r
      setLayout(st.layout);\r
    }\r
  };\r
\r
  const measure = () => {\r
    const cfg = config.current;\r
    const lists = track.children;\r
    if (!lists.length || !st.items.length) {\r
      st.period = 0;\r
      return;\r
    }\r
    if (cfg.vertical) {\r
      const parentHeight = root.parentElement?.clientHeight ?? 0;\r
      if (parentHeight > 0 && root.style.height !== \`\${Math.ceil(parentHeight)}px\`) {\r
        root.style.height = \`\${Math.ceil(parentHeight)}px\`;\r
      }\r
    } else if (root.style.height) {\r
      root.style.height = '';\r
    }\r
    track.style.transform = 'none';\r
    clearItems();\r
    const rootRect = root.getBoundingClientRect();\r
    const k = root.offsetWidth ? rootRect.width / root.offsetWidth || 1 : 1;\r
    const trackRect = track.getBoundingClientRect();\r
    const origin = cfg.vertical ? trackRect.top : trackRect.left;\r
    let crossMax = 0;\r
    let sizeMax = 0;\r
    let tipMax = 0;\r
    for (const it of st.items) {\r
      const r = it.el.getBoundingClientRect();\r
      it.center = ((cfg.vertical ? r.top + r.height / 2 : r.left + r.width / 2) - origin) / k;\r
      it.size = (cfg.vertical ? r.height : r.width) / k;\r
      it.cross = (cfg.vertical ? r.width : r.height) / k;\r
      crossMax = Math.max(crossMax, it.cross);\r
      sizeMax = Math.max(sizeMax, it.size);\r
      if (it.tip && it.copy === 0) tipMax = Math.max(tipMax, it.tip.offsetWidth);\r
    }\r
    const a = lists[0].getBoundingClientRect();\r
    const b = lists[1] ? lists[1].getBoundingClientRect() : null;\r
    st.period = (b ? (cfg.vertical ? b.top - a.top : b.left - a.left) : cfg.vertical ? a.height : a.width) / k;\r
    const cs = getComputedStyle(root);\r
    st.box = [root.offsetWidth, root.offsetHeight];\r
    st.length = cfg.vertical\r
      ? root.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)\r
      : root.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);\r
    st.crossMax = crossMax;\r
    st.sizeMax = sizeMax;\r
    st.tipMax = tipMax + crossMax * 0.25;\r
    const first = st.items.filter(it => it.copy === 0);\r
    st.pitch = first.length ? st.period / first.length : st.period;\r
    st.snaps = first.map(it => it.center);\r
    st.itemMode = false;\r
    if (st.period <= 0) return;\r
    geometry();\r
  };\r
\r
  const pointerU = () => {\r
    const geo = st.geo;\r
    if (!st.pointer || !geo) return null;\r
    const cfg = config.current;\r
    let sx = st.pointer[0] - st.box[0] / 2;\r
    let sy = st.pointer[1] - st.box[1] / 2;\r
    if (geo.tilted) {\r
      const p = unproject(geo.m, geo.persp, sx, sy);\r
      if (!p) return null;\r
      sx = p[0];\r
      sy = p[1];\r
    }\r
    const s = cfg.vertical ? sy : sx;\r
    if (geo.mode === 'arc' && geo.R) return geo.R * Math.asin(clamp(s / geo.R, -1, 1));\r
    if (geo.mode === 'orbit') return Math.asin(clamp(s / (geo.R * geo.pf), -1, 1));\r
    return s;\r
  };\r
\r
  const snapTarget = (from, dir) => {\r
    const P = st.period;\r
    const base = st.length / 2 + (st.geo?.lead ?? 0);\r
    let best = null;\r
    for (const c of st.snaps) {\r
      const s = c - base;\r
      const candidate = dir > 0 ? s + P * Math.ceil((from + 0.5 - s) / P) : s + P * Math.floor((from - 0.5 - s) / P);\r
      if (best === null || (dir > 0 ? candidate < best : candidate > best)) best = candidate;\r
    }\r
    return best ?? from;\r
  };\r
\r
  const nearestSnap = value => {\r
    const P = st.period;\r
    const base = st.length / 2 + (st.geo?.lead ?? 0);\r
    let best = value;\r
    let dist = Infinity;\r
    for (const c of st.snaps) {\r
      const s = c - base;\r
      const candidate = s + P * Math.round((value - s) / P);\r
      if (Math.abs(candidate - value) < dist) {\r
        dist = Math.abs(candidate - value);\r
        best = candidate;\r
      }\r
    }\r
    return best;\r
  };\r
\r
  const startMove = (target, duration) => {\r
    st.move = { from: st.offset, delta: target - st.offset, t: 0, dur: duration };\r
  };\r
\r
  const stepTiming = speed => {\r
    const cycle = st.pitch / Math.max(1, Math.abs(speed));\r
    const move = clamp(cycle * 0.55, 0.35, 0.9);\r
    return { move, hold: Math.max(0.35, cycle - move) };\r
  };\r
\r
  const write = (it, key, prop, value, target) => {\r
    if (it[key] !== value) {\r
      it[key] = value;\r
      target.style[prop] = value;\r
    }\r
  };\r
\r
  const render = now => {\r
    const cfg = config.current;\r
    const geo = st.geo;\r
    const L = st.length;\r
    const half = L / 2;\r
    const T = -st.offset - geo.lead;\r
    const lineT = cfg.vertical\r
      ? \`translate3d(0px, \${T.toFixed(2)}px, 0px)\`\r
      : \`translate3d(\${T.toFixed(2)}px, 0px, 0px)\`;\r
    track.style.transform = geo.tilted ? \`rotateX(\${geo.tiltX}deg) rotateY(\${geo.tiltY}deg) \${lineT}\` : lineT;\r
    const introRunning = st.introStart >= 0;\r
    const elapsed = introRunning ? (now - st.introStart) / 1000 : 0;\r
    const lensFocus = geo.mode === 'orbit' ? clamp(cfg.focus, 0, 1) * 0.9 : geo.focus;\r
    const lensMag = geo.magnify * st.mag;\r
    const cursorActive = lensMag > 0 && st.mag > 0.5 && geo.mode !== 'orbit';\r
    const wantsActive = cfg.focus > 0 || cfg.step || cursorActive;\r
    const needItems = geo.mode !== 'line' || lensFocus > 0 || lensMag > 0.0005 || introRunning;\r
    if (!needItems && st.itemMode) clearItems();\r
    st.itemMode = needItems;\r
    if (!needItems && !wantsActive) {\r
      if (st.active) {\r
        st.active.el.removeAttribute('data-active');\r
        st.active = null;\r
      }\r
      return;\r
    }\r
    let best = null;\r
    let bestDist = Infinity;\r
    for (const it of st.items) {\r
      const u = T + it.center - half;\r
      let x = u;\r
      let y = 0;\r
      let rot = 0;\r
      let scale = 1;\r
      let opacity = 1;\r
      let z = '';\r
      let hidden = false;\r
      let dist = Math.abs(u);\r
      if (geo.mode === 'orbit') {\r
        if (u < -geo.C / 2 || u >= geo.C / 2) {\r
          hidden = true;\r
        } else {\r
          const th = (2 * Math.PI * u) / geo.C;\r
          const Z = geo.R * Math.cos(th);\r
          const p = geo.depth / (geo.depth - Z * Math.cos(geo.alpha));\r
          x = geo.R * Math.sin(th) * p;\r
          y = Z * Math.sin(geo.alpha) * p - geo.shift;\r
          scale = p;\r
          if (lensFocus > 0) scale *= 1 + lensFocus * Math.exp(-((th / 0.55) ** 2));\r
          if (lensMag > 0) {\r
            const span = (geo.magSigma * 2 * Math.PI) / geo.C;\r
            scale *= 1 + lensMag * Math.max(0, Math.cos(th)) * Math.exp(-(((th - st.magU) / span) ** 2));\r
          }\r
          const facing = (Math.cos(th) + 1) / 2;\r
          opacity = 0.25 + 0.75 * facing * facing;\r
          z = String(Math.round(facing * 1000));\r
          dist = Math.cos(th) > 0 ? Math.abs(th) * geo.R : Infinity;\r
        }\r
      } else {\r
        let w = u;\r
        if (lensFocus > 0) {\r
          const kf = w / geo.focusSigma;\r
          scale *= 1 + lensFocus * Math.exp(-kf * kf);\r
          opacity *= 1 - 0.45 * lensFocus * (1 - Math.exp(-((u / (geo.focusSigma * 1.8)) ** 2)));\r
          w += lensFocus * geo.focusSigma * HALF_SQRT_PI * erf(kf);\r
        }\r
        const near = Math.abs(w - st.magU);\r
        if (lensMag > 0) {\r
          const km = (w - st.magU) / geo.magSigma;\r
          scale *= 1 + lensMag * Math.exp(-km * km);\r
          w += lensMag * geo.magSigma * HALF_SQRT_PI * erf(km);\r
        }\r
        x = w;\r
        if (geo.mode === 'wave') {\r
          y = geo.amp * Math.sin(geo.k * w);\r
          rot = (Math.atan(geo.amp * geo.k * Math.cos(geo.k * w)) * 90) / Math.PI;\r
        } else if (geo.mode === 'arc' && geo.R) {\r
          const phi = w / geo.R;\r
          if (Math.abs(phi) > geo.limit) hidden = true;\r
          x = geo.R * Math.sin(phi);\r
          y = geo.sign * (geo.R * (1 - Math.cos(phi)) - geo.shift);\r
          rot = (geo.sign * phi * 180) / Math.PI;\r
        }\r
        dist = cursorActive ? near : Math.abs(x);\r
      }\r
      if (introRunning && !hidden) {\r
        const pos = clamp((x + half) / Math.max(1, L), 0, 1);\r
        const e = easeOut(clamp((elapsed - pos * INTRO_STAGGER) / INTRO_TIME, 0, 1));\r
        opacity *= e;\r
        y += (1 - e) * 14;\r
      }\r
      if (wantsActive && !hidden && dist < bestDist) {\r
        bestDist = dist;\r
        best = it;\r
      }\r
      if (!needItems) continue;\r
      const along = x - u;\r
      const t = hidden\r
        ? ''\r
        : \`\${cfg.vertical ? \`translate3d(\${y.toFixed(2)}px, \${along.toFixed(2)}px, 0px)\` : \`translate3d(\${along.toFixed(2)}px, \${y.toFixed(2)}px, 0px)\`}\${\r
            rot ? \` rotate(\${(cfg.vertical ? -rot : rot).toFixed(2)}deg)\` : ''\r
          }\`;\r
      write(it, 't', 'transform', t, it.el);\r
      write(it, 'o', 'opacity', hidden ? '0' : opacity > 0.999 ? '' : opacity.toFixed(3), it.el);\r
      write(it, 'v', 'visibility', hidden ? 'hidden' : '', it.el);\r
      write(it, 'z', 'zIndex', z, it.el);\r
      if (it.content)\r
        write(it, 's', 'transform', Math.abs(scale - 1) < 0.0005 ? '' : \`scale(\${scale.toFixed(4)})\`, it.content);\r
      if (it.tip) {\r
        const lift = ((scale - 1) * it.cross) / 2;\r
        write(\r
          it,\r
          'p',\r
          'transform',\r
          Math.abs(lift) < 0.05\r
            ? ''\r
            : cfg.vertical\r
              ? \`translateX(\${lift.toFixed(2)}px)\`\r
              : \`translateY(\${lift.toFixed(2)}px)\`,\r
          it.tip\r
        );\r
      }\r
    }\r
    const active = best && bestDist < Math.max(best.size, st.pitch) / 2 + 1 ? best : null;\r
    if (active !== st.active) {\r
      st.active?.el.removeAttribute('data-active');\r
      active?.el.setAttribute('data-active', '');\r
      st.active = active;\r
    }\r
  };\r
\r
  const frame = now => {\r
    st.raf = 0;\r
    if (st.destroyed || !st.geo || st.period <= 0) return;\r
    const cfg = config.current;\r
    const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.1) : 0;\r
    st.last = now;\r
    const P = st.period;\r
    let busy = false;\r
    if (st.introStart === -1 && !st.introDone && st.visible) {\r
      if (cfg.intro && !st.reduced) {\r
        st.introStart = now;\r
      } else {\r
        st.introDone = true;\r
      }\r
      root.removeAttribute('data-intro');\r
    }\r
    if (st.introStart >= 0) {\r
      if ((now - st.introStart) / 1000 >= INTRO_TIME + INTRO_STAGGER) {\r
        st.introStart = -2;\r
        st.introDone = true;\r
      } else {\r
        busy = true;\r
      }\r
    }\r
    const travel = Math.sign(cfg.speed) || 1;\r
    const paused = st.focused || (st.hovered && cfg.hoverValue !== undefined);\r
    const pausedSpeed = st.focused ? 0 : (cfg.hoverValue ?? 0);\r
    let target = st.reduced ? 0 : paused ? pausedSpeed * travel * cfg.dirSign : cfg.speed * cfg.dirSign;\r
    if (cfg.scrollBoost > 0 && !st.reduced) {\r
      st.scrollVel *= Math.exp(-dt / 0.18);\r
      if (Math.abs(st.scrollVel) > 1) busy = true;\r
      target += clamp(st.scrollVel * cfg.scrollBoost, -3000, 3000) * travel * cfg.dirSign;\r
    }\r
    if (st.drag?.active) {\r
      busy = true;\r
    } else if (st.seek) {\r
      st.seek.t = Math.min(1, st.seek.t + dt / st.seek.dur);\r
      st.offset = st.seek.from + st.seek.delta * easeInOut(st.seek.t);\r
      st.velocity = 0;\r
      if (st.seek.t >= 1) st.seek = null;\r
      busy = true;\r
    } else if (st.move) {\r
      st.move.t = Math.min(1, st.move.t + dt / st.move.dur);\r
      st.offset = st.move.from + st.move.delta * easeInOut(st.move.t);\r
      st.velocity = 0;\r
      busy = true;\r
      if (st.move.t >= 1) {\r
        st.move = null;\r
        st.hold = stepTiming(paused ? pausedSpeed : cfg.speed).hold;\r
      }\r
    } else if (cfg.step && !st.reduced) {\r
      const speed = paused ? pausedSpeed : cfg.speed;\r
      st.velocity = 0;\r
      if (speed) {\r
        busy = true;\r
        st.hold -= dt;\r
        if (st.hold <= 0) {\r
          const dir = Math.sign(speed) * cfg.dirSign;\r
          startMove(snapTarget(st.offset, dir), stepTiming(speed).move);\r
        }\r
      }\r
    } else {\r
      const tau = st.glide ? GLIDE_TAU : SMOOTH_TAU;\r
      st.velocity += (target - st.velocity) * (1 - Math.exp(-dt / tau));\r
      if (st.glide && Math.abs(st.velocity - target) < 2) st.glide = false;\r
      if (Math.abs(st.velocity - target) < 0.01) st.velocity = target;\r
      st.offset += st.velocity * dt;\r
      if (st.velocity !== 0 || target !== 0) busy = true;\r
    }\r
    if (!st.focused && !st.seek && !st.drag?.active) {\r
      const wrapped = ((st.offset % P) + P) % P;\r
      if (st.move) st.move.from += wrapped - st.offset;\r
      st.offset = wrapped;\r
    }\r
    const wantMag = cfg.magnify > 0 && st.pointerInside && !st.reduced ? 1 : 0;\r
    if (st.mag !== wantMag) {\r
      st.mag += (wantMag - st.mag) * (1 - Math.exp(-dt / (wantMag ? 0.12 : 0.25)));\r
      if (Math.abs(wantMag - st.mag) < 0.002) st.mag = wantMag;\r
      busy = true;\r
    }\r
    const pu = st.mag > 0 ? pointerU() : null;\r
    if (pu !== null) {\r
      if (!st.magReady) {\r
        st.magU = pu;\r
        st.magReady = true;\r
      }\r
      const next = st.magU + (pu - st.magU) * (1 - Math.exp(-dt / 0.06));\r
      if (Math.abs(next - pu) > 0.05) busy = true;\r
      st.magU = Math.abs(next - pu) > 0.05 ? next : pu;\r
    } else if (st.mag === 0) {\r
      st.magReady = false;\r
    }\r
    render(now);\r
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
  const dragScale = () => {\r
    const geo = st.geo;\r
    if (!geo) return 1;\r
    if (geo.mode === 'orbit') return geo.C / (2 * Math.PI * geo.R * geo.pf);\r
    const pu = pointerU();\r
    if (pu === null || geo.focus <= 0) return 1;\r
    const kf = pu / geo.focusSigma;\r
    return 1 / (1 + geo.focus * Math.exp(-kf * kf));\r
  };\r
\r
  const onEnter = e => {\r
    st.hovered = true;\r
    if (e.pointerType !== 'touch') {\r
      st.pointerInside = true;\r
      st.pointer = local(e);\r
    }\r
    wake();\r
  };\r
\r
  const onLeave = () => {\r
    st.hovered = false;\r
    st.pointerInside = false;\r
    wake();\r
  };\r
\r
  const onDown = e => {\r
    st.pressedAt = performance.now();\r
    if (!config.current.draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
    const [x, y] = local(e);\r
    if (e.pointerType !== 'touch') st.pointer = [x, y];\r
    st.drag = { id: e.pointerId, x, y, active: false, samples: [], scale: dragScale(), anchor: 0, offset: 0 };\r
  };\r
\r
  const onMove = e => {\r
    const cfg = config.current;\r
    if (e.pointerType !== 'touch') {\r
      st.pointer = local(e);\r
      st.pointerInside = true;\r
    }\r
    const d = st.drag;\r
    if (d && e.pointerId === d.id) {\r
      const [x, y] = local(e);\r
      const along = cfg.vertical ? y - d.y : x - d.x;\r
      const across = cfg.vertical ? x - d.x : y - d.y;\r
      if (!d.active) {\r
        if (Math.abs(along) < DRAG_THRESHOLD) return wake();\r
        if (Math.abs(across) > Math.abs(along)) {\r
          st.drag = null;\r
          return wake();\r
        }\r
        d.active = true;\r
        d.anchor = along;\r
        d.offset = st.offset;\r
        st.move = null;\r
        st.seek = null;\r
        st.glide = false;\r
        st.velocity = 0;\r
        try {\r
          root.setPointerCapture(e.pointerId);\r
        } catch {}\r
        root.setAttribute('data-dragging', '');\r
      }\r
      const next = d.offset - (along - d.anchor) * d.scale;\r
      const P = st.period || 1;\r
      st.offset = ((next % P) + P) % P;\r
      d.offset += st.offset - next;\r
      const now = performance.now();\r
      d.samples.push([now, along]);\r
      while (d.samples.length > 2 && now - d.samples[0][0] > 100) d.samples.shift();\r
    }\r
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
    const cfg = config.current;\r
    const now = performance.now();\r
    st.suppressUntil = now + 400;\r
    let v = 0;\r
    const s = d.samples;\r
    if (!cancelled && s.length > 1) {\r
      const [t0, a0] = s[0];\r
      const [t1, a1] = s[s.length - 1];\r
      if (t1 > t0 && now - t1 < 80) v = clamp((-(a1 - a0) / (t1 - t0)) * 1000 * d.scale, -MAX_FLING, MAX_FLING);\r
    }\r
    if (cfg.step && !st.reduced) {\r
      const target = nearestSnap(st.offset + v * 0.35);\r
      startMove(target, clamp(0.3 + Math.abs(target - st.offset) / 1800, 0.3, 0.8));\r
      st.velocity = 0;\r
    } else {\r
      st.velocity = v;\r
      st.glide = Math.abs(v) > 30;\r
    }\r
    wake();\r
  };\r
\r
  const onUp = e => endDrag(e, false);\r
  const onCancel = e => endDrag(e, true);\r
\r
  const onClick = e => {\r
    if (performance.now() < st.suppressUntil) {\r
      e.preventDefault();\r
      e.stopPropagation();\r
      st.suppressUntil = 0;\r
    }\r
  };\r
\r
  const onDragStart = e => {\r
    if (config.current.draggable) e.preventDefault();\r
  };\r
\r
  const onFocusIn = e => {\r
    const target = e.target;\r
    if (performance.now() - st.pressedAt < 800) return;\r
    st.focused = true;\r
    const it = st.items.find(item => item.el.contains(target));\r
    if (it && st.geo) {\r
      const u = -st.offset - st.geo.lead + it.center - st.length / 2;\r
      const comfortable = st.geo.mode === 'orbit' ? 1 : Math.max(0, st.length / 2 - it.size);\r
      if (Math.abs(u) > comfortable) {\r
        st.move = null;\r
        st.seek = { from: st.offset, delta: u, t: 0, dur: clamp(0.35 + Math.abs(u) / 2000, 0.35, 0.8) };\r
      }\r
    }\r
    wake();\r
  };\r
\r
  const onFocusOut = e => {\r
    if (root.contains(e.relatedTarget)) return;\r
    st.focused = false;\r
    wake();\r
  };\r
\r
  const onRootScroll = () => {\r
    if (root.scrollLeft || root.scrollTop) {\r
      root.scrollLeft = 0;\r
      root.scrollTop = 0;\r
    }\r
  };\r
\r
  const onScroll = () => {\r
    const now = performance.now();\r
    const y = window.scrollY;\r
    if (st.scrollT && now > st.scrollT) {\r
      const v = ((y - st.scrollY) / (now - st.scrollT)) * 1000;\r
      st.scrollVel += (clamp(v, -6000, 6000) - st.scrollVel) * 0.5;\r
    }\r
    st.scrollY = y;\r
    st.scrollT = now;\r
    if (config.current.scrollBoost > 0) wake();\r
  };\r
\r
  const onMotion = () => {\r
    st.reduced = !!query?.matches;\r
    wake();\r
  };\r
\r
  root.addEventListener('pointerenter', onEnter);\r
  root.addEventListener('pointerleave', onLeave);\r
  root.addEventListener('pointerdown', onDown);\r
  root.addEventListener('pointermove', onMove);\r
  root.addEventListener('pointerup', onUp);\r
  root.addEventListener('pointercancel', onCancel);\r
  root.addEventListener('lostpointercapture', onCancel);\r
  root.addEventListener('click', onClick, true);\r
  root.addEventListener('dragstart', onDragStart);\r
  root.addEventListener('focusin', onFocusIn);\r
  root.addEventListener('focusout', onFocusOut);\r
  root.addEventListener('scroll', onRootScroll);\r
  window.addEventListener('scroll', onScroll, { passive: true });\r
  query?.addEventListener?.('change', onMotion);\r
\r
  let resizeObserver = null;\r
  const observed = new Set();\r
  const refresh = () => {\r
    collect();\r
    measure();\r
    if (resizeObserver) {\r
      const first = track.children[0];\r
      for (const el of [root, first]) {\r
        if (el && !observed.has(el)) {\r
          resizeObserver.observe(el);\r
          observed.add(el);\r
        }\r
      }\r
    }\r
    st.last = 0;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    st.raf = 0;\r
    if (st.geo && st.period > 0) frame(performance.now());\r
  };\r
\r
  if (typeof ResizeObserver !== 'undefined') {\r
    resizeObserver = new ResizeObserver(() => {\r
      measure();\r
      if (st.geo && st.period > 0) render(performance.now());\r
      wake();\r
    });\r
  } else {\r
    window.addEventListener('resize', refresh);\r
  }\r
\r
  let intersection = null;\r
  if (typeof IntersectionObserver !== 'undefined') {\r
    intersection = new IntersectionObserver(\r
      entries => {\r
        const entry = entries[entries.length - 1];\r
        st.visible = entry.isIntersecting;\r
        if (st.visible) wake();\r
      },\r
      { threshold: 0.1 }\r
    );\r
    intersection.observe(root);\r
  }\r
\r
  const onVisibility = () => {\r
    if (!document.hidden) wake();\r
  };\r
  document.addEventListener('visibilitychange', onVisibility);\r
\r
  const destroy = () => {\r
    st.destroyed = true;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    root.removeEventListener('pointerenter', onEnter);\r
    root.removeEventListener('pointerleave', onLeave);\r
    root.removeEventListener('pointerdown', onDown);\r
    root.removeEventListener('pointermove', onMove);\r
    root.removeEventListener('pointerup', onUp);\r
    root.removeEventListener('pointercancel', onCancel);\r
    root.removeEventListener('lostpointercapture', onCancel);\r
    root.removeEventListener('click', onClick, true);\r
    root.removeEventListener('dragstart', onDragStart);\r
    root.removeEventListener('focusin', onFocusIn);\r
    root.removeEventListener('focusout', onFocusOut);\r
    root.removeEventListener('scroll', onRootScroll);\r
    window.removeEventListener('scroll', onScroll);\r
    window.removeEventListener('resize', refresh);\r
    document.removeEventListener('visibilitychange', onVisibility);\r
    query?.removeEventListener?.('change', onMotion);\r
    resizeObserver?.disconnect();\r
    intersection?.disconnect();\r
  };\r
\r
  return { refresh, wake, destroy, state: st };\r
};\r
\r
export const LogoLoop = memo(\r
  ({\r
    logos,\r
    speed = 120,\r
    direction = 'left',\r
    width = '100%',\r
    logoHeight = 28,\r
    gap = 32,\r
    pauseOnHover,\r
    hoverSpeed,\r
    fadeOut = true,\r
    fadeOutWidth = 0.12,\r
    scaleOnHover = false,\r
    layout = 'line',\r
    bend = 0.5,\r
    focus = 0,\r
    magnify = 0,\r
    tiltX = 0,\r
    tiltY = 0,\r
    step = false,\r
    muted = 0,\r
    labels = 'none',\r
    draggable = true,\r
    scrollBoost = 0,\r
    intro = true,\r
    renderItem,\r
    ariaLabel = 'Partner logos',\r
    className,\r
    style\r
  }) => {\r
    const rootRef = useRef(null);\r
    const trackRef = useRef(null);\r
    const engineRef = useRef(null);\r
    const [{ copies, primary }, setLayout] = useState({ copies: 3, primary: 1 });\r
    const [introPending] = useState(intro);\r
\r
    const vertical = direction === 'up' || direction === 'down';\r
    const config = useRef(null);\r
    config.current = {\r
      speed,\r
      dirSign: (vertical ? direction === 'up' : direction !== 'right') ? 1 : -1,\r
      hoverValue: hoverSpeed !== undefined ? hoverSpeed : pauseOnHover === false ? undefined : 0,\r
      vertical,\r
      layout,\r
      bend,\r
      focus,\r
      magnify,\r
      tiltX,\r
      tiltY,\r
      step,\r
      draggable,\r
      scrollBoost,\r
      intro,\r
      scaleOnHover,\r
      labels,\r
      links: logos.some(item => item.href)\r
    };\r
\r
    useIsomorphicLayoutEffect(() => {\r
      const engine = createEngine(rootRef.current, trackRef.current, config, setLayout);\r
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
      copies,\r
      primary,\r
      logos,\r
      vertical,\r
      logoHeight,\r
      gap,\r
      labels,\r
      layout,\r
      bend,\r
      focus,\r
      magnify,\r
      tiltX,\r
      tiltY,\r
      scaleOnHover\r
    ]);\r
\r
    useEffect(() => {\r
      engineRef.current?.wake();\r
    });\r
\r
    const amount = clamp(muted, 0, 1);\r
    const isMuted = amount > 0;\r
\r
    const lists = useMemo(() => {\r
      const itemClass = cx(\r
        'group/item relative flex-none text-[length:var(--logoloop-logoHeight)] leading-none group-data-[intro]/loop:opacity-0',\r
        vertical ? 'mb-[var(--logoloop-gap)]' : 'mr-[var(--logoloop-gap)]'\r
      );\r
      const contentClass = item =>\r
        cx(\r
          'inline-flex items-center rounded text-inherit no-underline transition-[opacity,filter,color] duration-[350ms] ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none',\r
          labels === 'below'\r
            ? 'flex-col gap-[calc(var(--logoloop-logoHeight)*0.22)]'\r
            : 'gap-[calc(var(--logoloop-logoHeight)*0.3)]',\r
          isMuted &&\r
            '[filter:grayscale(var(--logoloop-gray))] opacity-[var(--logoloop-dim)] group-hover/item:[filter:none] group-hover/item:opacity-100 group-focus-within/item:[filter:none] group-focus-within/item:opacity-100 group-data-[active]/item:[filter:none] group-data-[active]/item:opacity-100',\r
          item.hoverColor &&\r
            'group-hover/item:text-[var(--logoloop-item-color)] group-focus-within/item:text-[var(--logoloop-item-color)] group-data-[active]/item:text-[var(--logoloop-item-color)]',\r
          !isMuted && !item.hoverColor && !!item.href && 'hover:opacity-80'\r
        );\r
      const zoomClass = cx(\r
        'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',\r
        scaleOnHover && 'group-hover/item:scale-120'\r
      );\r
      const labelClass =\r
        labels === 'below'\r
          ? 'whitespace-nowrap text-[length:max(11px,calc(var(--logoloop-logoHeight)*0.26))] font-medium leading-[1.2] opacity-[0.72]'\r
          : 'whitespace-nowrap text-[length:max(12px,calc(var(--logoloop-logoHeight)*0.5))] font-semibold leading-[1.2] tracking-[-0.01em]';\r
      const tipClass = cx(\r
        'pointer-events-none absolute whitespace-nowrap text-[length:max(11px,calc(var(--logoloop-logoHeight)*0.26))] font-medium leading-[1.2] opacity-0 transition-[opacity,translate] duration-[250ms] ease-[ease] motion-reduce:transition-none group-hover/item:opacity-80 group-focus-within/item:opacity-80 group-data-[active]/item:opacity-80',\r
        vertical\r
          ? 'left-full top-1/2 ml-[calc(var(--logoloop-logoHeight)*0.25)] [translate:4px_-50%] group-hover/item:[translate:0_-50%] group-focus-within/item:[translate:0_-50%] group-data-[active]/item:[translate:0_-50%]'\r
          : 'left-1/2 top-full mt-[calc(var(--logoloop-logoHeight)*0.2)] [translate:-50%_4px] group-hover/item:[translate:-50%_0] group-focus-within/item:[translate:-50%_0] group-data-[active]/item:[translate:-50%_0]'\r
      );\r
      return Array.from({ length: copies }, (_, copyIndex) => {\r
        const isPrimary = copyIndex === primary;\r
        return (\r
          <ul\r
            className={cx('m-0 flex list-none items-center p-0', vertical && 'flex-col')}\r
            key={copyIndex}\r
            role="list"\r
            aria-hidden={isPrimary ? undefined : true}\r
          >\r
            {logos.map((item, itemIndex) => {\r
              const key = \`\${copyIndex}-\${itemIndex}\`;\r
              const isNode = 'node' in item;\r
              const visual = renderItem ? (\r
                renderItem(item, key)\r
              ) : isNode ? (\r
                <span\r
                  className={cx('inline-flex items-center', zoomClass)}\r
                  aria-hidden={!!item.href && !item.ariaLabel}\r
                >\r
                  {item.node}\r
                </span>\r
              ) : (\r
                <img\r
                  className={cx(\r
                    'pointer-events-none block h-[var(--logoloop-logoHeight)] w-auto object-contain [-webkit-user-drag:none] [image-rendering:-webkit-optimize-contrast]',\r
                    zoomClass\r
                  )}\r
                  src={item.src}\r
                  srcSet={item.srcSet}\r
                  sizes={item.sizes}\r
                  width={item.width}\r
                  height={item.height}\r
                  alt={item.alt ?? ''}\r
                  title={item.title}\r
                  loading="lazy"\r
                  decoding="async"\r
                  draggable={false}\r
                />\r
              );\r
              const text = (labels === 'inline' || labels === 'below') && item.title ? item.title : null;\r
              const inner = (\r
                <>\r
                  {visual}\r
                  {text && (\r
                    <span className={labelClass} aria-hidden={!isNode && !!item.alt}>\r
                      {text}\r
                    </span>\r
                  )}\r
                </>\r
              );\r
              const name = isNode ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);\r
              return (\r
                <li\r
                  className={itemClass}\r
                  key={key}\r
                  role="listitem"\r
                  data-color={item.hoverColor ? '' : undefined}\r
                  style={item.hoverColor ? { '--logoloop-item-color': item.hoverColor } : undefined}\r
                >\r
                  {item.href ? (\r
                    <a\r
                      className={contentClass(item)}\r
                      href={item.href}\r
                      aria-label={name || 'logo link'}\r
                      target="_blank"\r
                      rel="noreferrer noopener"\r
                      draggable={false}\r
                      tabIndex={isPrimary ? undefined : -1}\r
                    >\r
                      {inner}\r
                    </a>\r
                  ) : (\r
                    <div className={contentClass(item)}>{inner}</div>\r
                  )}\r
                  {labels === 'hover' && item.title && (\r
                    <span className={tipClass} aria-hidden="true">\r
                      {item.title}\r
                    </span>\r
                  )}\r
                </li>\r
              );\r
            })}\r
          </ul>\r
        );\r
      });\r
    }, [copies, primary, logos, renderItem, labels, vertical, scaleOnHover, isMuted]);\r
\r
    const mask = fadeOut ? fadeMask(fadeOutWidth, vertical) : undefined;\r
\r
    const containerStyle = {\r
      width: vertical\r
        ? toCssLength(width) === '100%'\r
          ? undefined\r
          : toCssLength(width)\r
        : (toCssLength(width) ?? '100%'),\r
      '--logoloop-gap': \`\${gap}px\`,\r
      '--logoloop-logoHeight': \`\${logoHeight}px\`,\r
      ...(amount > 0 && {\r
        '--logoloop-gray': Math.min(1, amount * 2).toFixed(3),\r
        '--logoloop-dim': (1 - amount * 0.6).toFixed(3)\r
      }),\r
      ...(mask && { WebkitMaskImage: mask, maskImage: mask }),\r
      ...style\r
    };\r
\r
    const rootClassName = cx(\r
      'group/loop relative overflow-hidden [-webkit-tap-highlight-color:transparent]',\r
      vertical ? 'inline-block h-full px-[var(--logoloop-pad)]' : 'py-[var(--logoloop-pad)]',\r
      draggable && 'cursor-grab data-[dragging]:cursor-grabbing [&[data-dragging]_*]:cursor-grabbing',\r
      draggable && (vertical ? '[touch-action:pan-x_pinch-zoom]' : '[touch-action:pan-y_pinch-zoom]'),\r
      className\r
    );\r
\r
    return (\r
      <div\r
        ref={rootRef}\r
        className={rootClassName}\r
        style={containerStyle}\r
        role="region"\r
        aria-label={ariaLabel}\r
        data-intro={introPending ? '' : undefined}\r
        data-draggable={draggable ? '' : undefined}\r
        data-muted={amount > 0 ? '' : undefined}\r
        data-labels={labels !== 'none' ? labels : undefined}\r
      >\r
        <div\r
          className={cx(\r
            'relative z-0 flex select-none will-change-transform [-webkit-user-select:none]',\r
            vertical ? 'h-max w-full flex-col' : 'w-max'\r
          )}\r
          ref={trackRef}\r
        >\r
          {lists}\r
        </div>\r
      </div>\r
    );\r
  }\r
);\r
\r
LogoLoop.displayName = 'LogoLoop';\r
\r
export default LogoLoop;\r
`,t=`'use client';\r
\r
import React, { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';\r
import './LogoLoop.css';\r
\r
export type LogoItem =\r
  | {\r
      node: React.ReactNode;\r
      href?: string;\r
      title?: string;\r
      ariaLabel?: string;\r
      hoverColor?: string;\r
    }\r
  | {\r
      src: string;\r
      alt?: string;\r
      href?: string;\r
      title?: string;\r
      srcSet?: string;\r
      sizes?: string;\r
      width?: number;\r
      height?: number;\r
      hoverColor?: string;\r
    };\r
\r
export interface LogoLoopProps {\r
  logos: LogoItem[];\r
  speed?: number;\r
  direction?: 'left' | 'right' | 'up' | 'down';\r
  width?: number | string;\r
  logoHeight?: number;\r
  gap?: number;\r
  pauseOnHover?: boolean;\r
  hoverSpeed?: number;\r
  fadeOut?: boolean;\r
  fadeOutWidth?: number;\r
  fadeOutColor?: string;\r
  scaleOnHover?: boolean;\r
  layout?: 'line' | 'wave' | 'arc' | 'orbit';\r
  bend?: number;\r
  focus?: number;\r
  magnify?: number;\r
  tiltX?: number;\r
  tiltY?: number;\r
  step?: boolean;\r
  muted?: number;\r
  labels?: 'none' | 'inline' | 'below' | 'hover';\r
  draggable?: boolean;\r
  scrollBoost?: number;\r
  intro?: boolean;\r
  renderItem?: (item: LogoItem, key: React.Key) => React.ReactNode;\r
  ariaLabel?: string;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
interface LoopConfig {\r
  speed: number;\r
  dirSign: number;\r
  hoverValue: number | undefined;\r
  vertical: boolean;\r
  layout: string;\r
  bend: number;\r
  focus: number;\r
  magnify: number;\r
  tiltX: number;\r
  tiltY: number;\r
  step: boolean;\r
  draggable: boolean;\r
  scrollBoost: number;\r
  intro: boolean;\r
  scaleOnHover: boolean;\r
  labels: string;\r
  links: boolean;\r
}\r
\r
interface LoopLayout {\r
  copies: number;\r
  primary: number;\r
}\r
\r
interface LoopItem {\r
  el: HTMLElement;\r
  copy: number;\r
  index: number;\r
  content: HTMLElement | null;\r
  tip: HTMLElement | null;\r
  center: number;\r
  size: number;\r
  cross: number;\r
  t: string;\r
  o: string;\r
  v: string;\r
  z: string;\r
  s: string;\r
  p: string;\r
}\r
\r
interface Geometry {\r
  mode: string;\r
  shift: number;\r
  uMin: number;\r
  uMax: number;\r
  lead: number;\r
  focus: number;\r
  focusSigma: number;\r
  magnify: number;\r
  magSigma: number;\r
  amp: number;\r
  k: number;\r
  R: number;\r
  sign: number;\r
  limit: number;\r
  C: number;\r
  alpha: number;\r
  depth: number;\r
  pf: number;\r
  tilted: boolean;\r
  tiltX: number;\r
  tiltY: number;\r
  m: number[];\r
  persp: number;\r
}\r
\r
interface Drag {\r
  id: number;\r
  x: number;\r
  y: number;\r
  active: boolean;\r
  samples: [number, number][];\r
  scale: number;\r
  anchor: number;\r
  offset: number;\r
}\r
\r
interface Move {\r
  from: number;\r
  delta: number;\r
  t: number;\r
  dur: number;\r
}\r
\r
interface EngineState {\r
  offset: number;\r
  velocity: number;\r
  period: number;\r
  length: number;\r
  box: [number, number];\r
  items: LoopItem[];\r
  snaps: number[];\r
  pitch: number;\r
  crossMax: number;\r
  sizeMax: number;\r
  tipMax: number;\r
  geo: Geometry | null;\r
  layout: LoopLayout;\r
  hovered: boolean;\r
  focused: boolean;\r
  pointer: [number, number] | null;\r
  pointerInside: boolean;\r
  mag: number;\r
  magU: number;\r
  magReady: boolean;\r
  drag: Drag | null;\r
  glide: boolean;\r
  suppressUntil: number;\r
  pressedAt: number;\r
  move: Move | null;\r
  hold: number;\r
  seek: Move | null;\r
  scrollVel: number;\r
  scrollY: number;\r
  scrollT: number;\r
  visible: boolean;\r
  introStart: number;\r
  introDone: boolean;\r
  itemMode: boolean;\r
  active: LoopItem | null;\r
  raf: number;\r
  last: number;\r
  reduced: boolean;\r
  destroyed: boolean;\r
}\r
\r
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const SMOOTH_TAU = 0.25;\r
const GLIDE_TAU = 0.8;\r
const DRAG_THRESHOLD = 6;\r
const MAX_FLING = 4000;\r
const INTRO_TIME = 0.7;\r
const INTRO_STAGGER = 0.45;\r
const HALF_SQRT_PI = Math.sqrt(Math.PI) / 2;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toCssLength = (value?: number | string): string | undefined =>\r
  typeof value === 'number' ? \`\${value}px\` : (value ?? undefined);\r
\r
const erf = (x: number) => {\r
  const a = Math.abs(x);\r
  const t = 1 / (1 + 0.3275911 * a);\r
  const y =\r
    1 -\r
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);\r
  return x < 0 ? -y : y;\r
};\r
\r
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);\r
\r
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);\r
\r
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const fadeMask = (size: number, vertical: boolean) => {\r
  const span = clamp(size, 0, 0.5) * 100;\r
  if (span <= 0) return undefined;\r
  const stops: string[] = [];\r
  for (let i = 0; i <= 12; i++) {\r
    stops.push(\`rgba(0,0,0,\${smootherstep(i / 12).toFixed(4)}) \${((span * i) / 12).toFixed(3)}%\`);\r
  }\r
  for (let i = 12; i >= 0; i--) {\r
    stops.push(\`rgba(0,0,0,\${smootherstep(i / 12).toFixed(4)}) \${(100 - (span * i) / 12).toFixed(3)}%\`);\r
  }\r
  return \`linear-gradient(\${vertical ? 'to bottom' : 'to right'}, \${stops.join(', ')})\`;\r
};\r
\r
const rotationMatrix = (degX: number, degY: number): number[] => {\r
  const a = (degX * Math.PI) / 180;\r
  const b = (degY * Math.PI) / 180;\r
  const ca = Math.cos(a);\r
  const sa = Math.sin(a);\r
  const cb = Math.cos(b);\r
  const sb = Math.sin(b);\r
  return [cb, 0, sb, sa * sb, ca, -sa * cb, -ca * sb, sa, ca * cb];\r
};\r
\r
const unproject = (m: number[], depth: number, sx: number, sy: number): [number, number] | null => {\r
  const den = m[8] * depth - m[2] * sx - m[5] * sy;\r
  if (den <= 1e-6) return null;\r
  const t = (m[8] * depth) / den;\r
  if (t <= 0) return null;\r
  const qx = t * sx;\r
  const qy = t * sy;\r
  const qz = depth * (1 - t);\r
  return [m[0] * qx + m[3] * qy + m[6] * qz, m[1] * qx + m[4] * qy + m[7] * qz];\r
};\r
\r
const project = (m: number[], depth: number, px: number, py: number): [number, number] => {\r
  const k = depth / (depth - (m[6] * px + m[7] * py));\r
  return [(m[0] * px + m[1] * py) * k, (m[3] * px + m[4] * py) * k];\r
};\r
\r
const createEngine = (\r
  root: HTMLDivElement,\r
  track: HTMLDivElement,\r
  config: React.MutableRefObject<LoopConfig>,\r
  setLayout: (layout: LoopLayout) => void\r
) => {\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const st: EngineState = {\r
    offset: 0,\r
    velocity: 0,\r
    period: 0,\r
    length: 0,\r
    box: [0, 0],\r
    items: [],\r
    snaps: [],\r
    pitch: 0,\r
    crossMax: 0,\r
    sizeMax: 0,\r
    tipMax: 0,\r
    geo: null,\r
    layout: { copies: 2, primary: 0 },\r
    hovered: false,\r
    focused: false,\r
    pointer: null,\r
    pointerInside: false,\r
    mag: 0,\r
    magU: 0,\r
    magReady: false,\r
    drag: null,\r
    glide: false,\r
    suppressUntil: 0,\r
    pressedAt: -1e9,\r
    move: null,\r
    hold: 0,\r
    seek: null,\r
    scrollVel: 0,\r
    scrollY: window.scrollY,\r
    scrollT: 0,\r
    visible: typeof IntersectionObserver === 'undefined',\r
    introStart: -1,\r
    introDone: !config.current.intro,\r
    itemMode: false,\r
    active: null,\r
    raf: 0,\r
    last: 0,\r
    reduced: !!query?.matches,\r
    destroyed: false\r
  };\r
\r
  const collect = () => {\r
    const items: LoopItem[] = [];\r
    Array.from(track.children).forEach((list, copy) => {\r
      Array.from(list.children).forEach((el, index) => {\r
        items.push({\r
          el: el as HTMLElement,\r
          copy,\r
          index,\r
          content: (el.children[0] as HTMLElement) || null,\r
          tip: (el.children[1] as HTMLElement) || null,\r
          center: 0,\r
          size: 0,\r
          cross: 0,\r
          t: '',\r
          o: '',\r
          v: '',\r
          z: '',\r
          s: '',\r
          p: ''\r
        });\r
      });\r
    });\r
    st.items = items;\r
    st.active = null;\r
  };\r
\r
  const clearItems = () => {\r
    for (const it of st.items) {\r
      it.el.style.transform = '';\r
      it.el.style.opacity = '';\r
      it.el.style.visibility = '';\r
      it.el.style.zIndex = '';\r
      if (it.content) it.content.style.transform = '';\r
      if (it.tip) it.tip.style.transform = '';\r
      it.t = it.o = it.v = it.z = it.s = it.p = '';\r
    }\r
  };\r
\r
  const geometry = () => {\r
    const cfg = config.current;\r
    const L = st.length;\r
    const P = st.period;\r
    const hc = st.crossMax;\r
    const w = st.sizeMax;\r
    const bend = clamp(cfg.bend, -1, 1);\r
    const geo: Geometry = {\r
      mode: cfg.layout,\r
      shift: 0,\r
      uMin: -L / 2 - w,\r
      uMax: L / 2 + w,\r
      lead: 0,\r
      focus: clamp(cfg.focus, 0, 1) * 0.9,\r
      focusSigma: Math.max(40, L * 0.18),\r
      magnify: clamp(cfg.magnify, 0, 1),\r
      magSigma: Math.max(hc * 1.4, st.pitch * 1.1),\r
      amp: 0,\r
      k: 0,\r
      R: 0,\r
      sign: 1,\r
      limit: 0,\r
      C: 0,\r
      alpha: 0,\r
      depth: 0,\r
      pf: 1,\r
      tilted: false,\r
      tiltX: 0,\r
      tiltY: 0,\r
      m: [1, 0, 0, 0, 1, 0, 0, 0, 1],\r
      persp: 0\r
    };\r
    let pad = cfg.scaleOnHover ? hc * 0.1 : 0;\r
    const lens = (1 + geo.focus) * (1 + geo.magnify) - 1;\r
    if (geo.mode === 'wave') {\r
      geo.amp = bend * (hc * 0.6 + L * 0.035);\r
      geo.k = (2 * Math.PI) / Math.max(1, L / 1.25);\r
      pad += Math.abs(geo.amp) + (lens * hc) / 2 + hc * 0.08;\r
    } else if (geo.mode === 'arc' && Math.abs(bend) > 0.005) {\r
      const edge = Math.abs(bend) * (Math.PI / 4);\r
      const R = L / 2 / Math.sin(edge);\r
      const sag = R * (1 - Math.cos(edge));\r
      geo.R = R;\r
      geo.sign = Math.sign(bend);\r
      geo.shift = sag / 2;\r
      geo.limit = Math.PI * 0.6;\r
      const reach = R * Math.min(Math.PI / 2, Math.asin(Math.min(1, (L / 2 + w) / R))) + w;\r
      geo.uMin = -reach;\r
      geo.uMax = reach;\r
      pad += sag / 2 + (w / 2) * Math.sin(edge) + (lens * hc) / 2;\r
    } else if (geo.mode === 'orbit') {\r
      const R = Math.max(40, L * 0.43 - w * 0.2);\r
      const k = Math.max(1, Math.round((2 * Math.PI * R) / P));\r
      const alpha = Math.sign(bend) * Math.atan2(Math.abs(bend) * Math.max(hc * 2, R * 0.36), R);\r
      const depth = R * 5;\r
      const pf = depth / (depth - R * Math.cos(alpha));\r
      const pb = depth / (depth + R * Math.cos(alpha));\r
      const yf = R * Math.sin(alpha) * pf;\r
      const yb = -R * Math.sin(alpha) * pb;\r
      const grow = (1 + lens) * (cfg.scaleOnHover ? 1.2 : 1);\r
      const lo = Math.min(yf - (hc * pf * grow) / 2, yb - (hc * pb) / 2);\r
      const hi = Math.max(yf + (hc * pf * grow) / 2, yb + (hc * pb) / 2);\r
      geo.R = R;\r
      geo.C = k * P;\r
      geo.alpha = alpha;\r
      geo.depth = depth;\r
      geo.pf = pf;\r
      geo.shift = (lo + hi) / 2;\r
      geo.uMin = -geo.C / 2;\r
      geo.uMax = geo.C / 2;\r
      pad = Math.max(0, (hi - lo) / 2 - hc / 2);\r
    } else {\r
      pad += (lens * hc) / 2;\r
    }\r
    if (cfg.labels === 'hover') pad += cfg.vertical ? st.tipMax : hc * 0.2 + Math.max(11, hc * 0.26) * 1.3;\r
    const tx = clamp(cfg.tiltX, -60, 60);\r
    const ty = clamp(cfg.tiltY, -60, 60);\r
    if (Math.abs(tx) > 0.01 || Math.abs(ty) > 0.01) {\r
      geo.tilted = true;\r
      geo.tiltX = tx;\r
      geo.tiltY = ty;\r
      geo.m = rotationMatrix(tx, ty);\r
      geo.persp = Math.max(L, 480) * 1.3;\r
      const edge = L / 2 + w;\r
      const along = (s: number) => {\r
        const p = cfg.vertical ? unproject(geo.m, geo.persp, 0, s) : unproject(geo.m, geo.persp, s, 0);\r
        if (!p) return Math.sign(s) * L * 4;\r
        return clamp(cfg.vertical ? p[1] : p[0], -L * 4, L * 4);\r
      };\r
      const a = along(-edge);\r
      const b = along(edge);\r
      geo.uMin = Math.min(geo.uMin, a, b) - w;\r
      geo.uMax = Math.max(geo.uMax, a, b) + w;\r
      const band = hc / 2 + pad;\r
      let reach = band;\r
      for (const u of [a, b, 0]) {\r
        for (const v of [-band, band]) {\r
          const q = cfg.vertical ? project(geo.m, geo.persp, v, u) : project(geo.m, geo.persp, u, v);\r
          reach = Math.max(reach, Math.abs(cfg.vertical ? q[0] : q[1]));\r
        }\r
      }\r
      pad = reach - hc / 2;\r
    }\r
    const extra = cfg.links ? 2 : 0;\r
    geo.lead = (Math.max(0, Math.ceil((-geo.uMin - L / 2) / P)) + extra) * P;\r
    const copies = Math.max(2, Math.ceil((geo.uMax + L / 2 + geo.lead) / P) + 2 + (extra ? 1 : 0));\r
    const primary = Math.min(copies - 1, Math.floor((geo.lead + L / 2) / P));\r
    st.geo = geo;\r
    root.style.setProperty('--logoloop-pad', \`\${Math.ceil(pad)}px\`);\r
    root.style.perspective = geo.tilted ? \`\${geo.persp}px\` : '';\r
    track.style.transformOrigin = geo.tilted ? (cfg.vertical ? \`50% \${L / 2}px\` : \`\${L / 2}px 50%\`) : '';\r
    if (copies !== st.layout.copies || primary !== st.layout.primary) {\r
      st.layout = { copies, primary };\r
      setLayout(st.layout);\r
    }\r
  };\r
\r
  const measure = () => {\r
    const cfg = config.current;\r
    const lists = track.children;\r
    if (!lists.length || !st.items.length) {\r
      st.period = 0;\r
      return;\r
    }\r
    if (cfg.vertical) {\r
      const parentHeight = root.parentElement?.clientHeight ?? 0;\r
      if (parentHeight > 0 && root.style.height !== \`\${Math.ceil(parentHeight)}px\`) {\r
        root.style.height = \`\${Math.ceil(parentHeight)}px\`;\r
      }\r
    } else if (root.style.height) {\r
      root.style.height = '';\r
    }\r
    track.style.transform = 'none';\r
    clearItems();\r
    const rootRect = root.getBoundingClientRect();\r
    const k = root.offsetWidth ? rootRect.width / root.offsetWidth || 1 : 1;\r
    const trackRect = track.getBoundingClientRect();\r
    const origin = cfg.vertical ? trackRect.top : trackRect.left;\r
    let crossMax = 0;\r
    let sizeMax = 0;\r
    let tipMax = 0;\r
    for (const it of st.items) {\r
      const r = it.el.getBoundingClientRect();\r
      it.center = ((cfg.vertical ? r.top + r.height / 2 : r.left + r.width / 2) - origin) / k;\r
      it.size = (cfg.vertical ? r.height : r.width) / k;\r
      it.cross = (cfg.vertical ? r.width : r.height) / k;\r
      crossMax = Math.max(crossMax, it.cross);\r
      sizeMax = Math.max(sizeMax, it.size);\r
      if (it.tip && it.copy === 0) tipMax = Math.max(tipMax, it.tip.offsetWidth);\r
    }\r
    const a = lists[0].getBoundingClientRect();\r
    const b = lists[1] ? lists[1].getBoundingClientRect() : null;\r
    st.period = (b ? (cfg.vertical ? b.top - a.top : b.left - a.left) : cfg.vertical ? a.height : a.width) / k;\r
    const cs = getComputedStyle(root);\r
    st.box = [root.offsetWidth, root.offsetHeight];\r
    st.length = cfg.vertical\r
      ? root.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)\r
      : root.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);\r
    st.crossMax = crossMax;\r
    st.sizeMax = sizeMax;\r
    st.tipMax = tipMax + crossMax * 0.25;\r
    const first = st.items.filter(it => it.copy === 0);\r
    st.pitch = first.length ? st.period / first.length : st.period;\r
    st.snaps = first.map(it => it.center);\r
    st.itemMode = false;\r
    if (st.period <= 0) return;\r
    geometry();\r
  };\r
\r
  const pointerU = () => {\r
    const geo = st.geo;\r
    if (!st.pointer || !geo) return null;\r
    const cfg = config.current;\r
    let sx = st.pointer[0] - st.box[0] / 2;\r
    let sy = st.pointer[1] - st.box[1] / 2;\r
    if (geo.tilted) {\r
      const p = unproject(geo.m, geo.persp, sx, sy);\r
      if (!p) return null;\r
      sx = p[0];\r
      sy = p[1];\r
    }\r
    const s = cfg.vertical ? sy : sx;\r
    if (geo.mode === 'arc' && geo.R) return geo.R * Math.asin(clamp(s / geo.R, -1, 1));\r
    if (geo.mode === 'orbit') return Math.asin(clamp(s / (geo.R * geo.pf), -1, 1));\r
    return s;\r
  };\r
\r
  const snapTarget = (from: number, dir: number) => {\r
    const P = st.period;\r
    const base = st.length / 2 + (st.geo?.lead ?? 0);\r
    let best: number | null = null;\r
    for (const c of st.snaps) {\r
      const s = c - base;\r
      const candidate = dir > 0 ? s + P * Math.ceil((from + 0.5 - s) / P) : s + P * Math.floor((from - 0.5 - s) / P);\r
      if (best === null || (dir > 0 ? candidate < best : candidate > best)) best = candidate;\r
    }\r
    return best ?? from;\r
  };\r
\r
  const nearestSnap = (value: number) => {\r
    const P = st.period;\r
    const base = st.length / 2 + (st.geo?.lead ?? 0);\r
    let best = value;\r
    let dist = Infinity;\r
    for (const c of st.snaps) {\r
      const s = c - base;\r
      const candidate = s + P * Math.round((value - s) / P);\r
      if (Math.abs(candidate - value) < dist) {\r
        dist = Math.abs(candidate - value);\r
        best = candidate;\r
      }\r
    }\r
    return best;\r
  };\r
\r
  const startMove = (target: number, duration: number) => {\r
    st.move = { from: st.offset, delta: target - st.offset, t: 0, dur: duration };\r
  };\r
\r
  const stepTiming = (speed: number) => {\r
    const cycle = st.pitch / Math.max(1, Math.abs(speed));\r
    const move = clamp(cycle * 0.55, 0.35, 0.9);\r
    return { move, hold: Math.max(0.35, cycle - move) };\r
  };\r
\r
  const write = (\r
    it: LoopItem,\r
    key: 't' | 'o' | 'v' | 'z' | 's' | 'p',\r
    prop: 'transform' | 'opacity' | 'visibility' | 'zIndex',\r
    value: string,\r
    target: HTMLElement\r
  ) => {\r
    if (it[key] !== value) {\r
      it[key] = value;\r
      target.style[prop] = value;\r
    }\r
  };\r
\r
  const render = (now: number) => {\r
    const cfg = config.current;\r
    const geo = st.geo as Geometry;\r
    const L = st.length;\r
    const half = L / 2;\r
    const T = -st.offset - geo.lead;\r
    const lineT = cfg.vertical\r
      ? \`translate3d(0px, \${T.toFixed(2)}px, 0px)\`\r
      : \`translate3d(\${T.toFixed(2)}px, 0px, 0px)\`;\r
    track.style.transform = geo.tilted ? \`rotateX(\${geo.tiltX}deg) rotateY(\${geo.tiltY}deg) \${lineT}\` : lineT;\r
    const introRunning = st.introStart >= 0;\r
    const elapsed = introRunning ? (now - st.introStart) / 1000 : 0;\r
    const lensFocus = geo.mode === 'orbit' ? clamp(cfg.focus, 0, 1) * 0.9 : geo.focus;\r
    const lensMag = geo.magnify * st.mag;\r
    const cursorActive = lensMag > 0 && st.mag > 0.5 && geo.mode !== 'orbit';\r
    const wantsActive = cfg.focus > 0 || cfg.step || cursorActive;\r
    const needItems = geo.mode !== 'line' || lensFocus > 0 || lensMag > 0.0005 || introRunning;\r
    if (!needItems && st.itemMode) clearItems();\r
    st.itemMode = needItems;\r
    if (!needItems && !wantsActive) {\r
      if (st.active) {\r
        st.active.el.removeAttribute('data-active');\r
        st.active = null;\r
      }\r
      return;\r
    }\r
    let best: LoopItem | null = null;\r
    let bestDist = Infinity;\r
    for (const it of st.items) {\r
      const u = T + it.center - half;\r
      let x = u;\r
      let y = 0;\r
      let rot = 0;\r
      let scale = 1;\r
      let opacity = 1;\r
      let z = '';\r
      let hidden = false;\r
      let dist = Math.abs(u);\r
      if (geo.mode === 'orbit') {\r
        if (u < -geo.C / 2 || u >= geo.C / 2) {\r
          hidden = true;\r
        } else {\r
          const th = (2 * Math.PI * u) / geo.C;\r
          const Z = geo.R * Math.cos(th);\r
          const p = geo.depth / (geo.depth - Z * Math.cos(geo.alpha));\r
          x = geo.R * Math.sin(th) * p;\r
          y = Z * Math.sin(geo.alpha) * p - geo.shift;\r
          scale = p;\r
          if (lensFocus > 0) scale *= 1 + lensFocus * Math.exp(-((th / 0.55) ** 2));\r
          if (lensMag > 0) {\r
            const span = (geo.magSigma * 2 * Math.PI) / geo.C;\r
            scale *= 1 + lensMag * Math.max(0, Math.cos(th)) * Math.exp(-(((th - st.magU) / span) ** 2));\r
          }\r
          const facing = (Math.cos(th) + 1) / 2;\r
          opacity = 0.25 + 0.75 * facing * facing;\r
          z = String(Math.round(facing * 1000));\r
          dist = Math.cos(th) > 0 ? Math.abs(th) * geo.R : Infinity;\r
        }\r
      } else {\r
        let w = u;\r
        if (lensFocus > 0) {\r
          const kf = w / geo.focusSigma;\r
          scale *= 1 + lensFocus * Math.exp(-kf * kf);\r
          opacity *= 1 - 0.45 * lensFocus * (1 - Math.exp(-((u / (geo.focusSigma * 1.8)) ** 2)));\r
          w += lensFocus * geo.focusSigma * HALF_SQRT_PI * erf(kf);\r
        }\r
        const near = Math.abs(w - st.magU);\r
        if (lensMag > 0) {\r
          const km = (w - st.magU) / geo.magSigma;\r
          scale *= 1 + lensMag * Math.exp(-km * km);\r
          w += lensMag * geo.magSigma * HALF_SQRT_PI * erf(km);\r
        }\r
        x = w;\r
        if (geo.mode === 'wave') {\r
          y = geo.amp * Math.sin(geo.k * w);\r
          rot = (Math.atan(geo.amp * geo.k * Math.cos(geo.k * w)) * 90) / Math.PI;\r
        } else if (geo.mode === 'arc' && geo.R) {\r
          const phi = w / geo.R;\r
          if (Math.abs(phi) > geo.limit) hidden = true;\r
          x = geo.R * Math.sin(phi);\r
          y = geo.sign * (geo.R * (1 - Math.cos(phi)) - geo.shift);\r
          rot = (geo.sign * phi * 180) / Math.PI;\r
        }\r
        dist = cursorActive ? near : Math.abs(x);\r
      }\r
      if (introRunning && !hidden) {\r
        const pos = clamp((x + half) / Math.max(1, L), 0, 1);\r
        const e = easeOut(clamp((elapsed - pos * INTRO_STAGGER) / INTRO_TIME, 0, 1));\r
        opacity *= e;\r
        y += (1 - e) * 14;\r
      }\r
      if (wantsActive && !hidden && dist < bestDist) {\r
        bestDist = dist;\r
        best = it;\r
      }\r
      if (!needItems) continue;\r
      const along = x - u;\r
      const t = hidden\r
        ? ''\r
        : \`\${cfg.vertical ? \`translate3d(\${y.toFixed(2)}px, \${along.toFixed(2)}px, 0px)\` : \`translate3d(\${along.toFixed(2)}px, \${y.toFixed(2)}px, 0px)\`}\${\r
            rot ? \` rotate(\${(cfg.vertical ? -rot : rot).toFixed(2)}deg)\` : ''\r
          }\`;\r
      write(it, 't', 'transform', t, it.el);\r
      write(it, 'o', 'opacity', hidden ? '0' : opacity > 0.999 ? '' : opacity.toFixed(3), it.el);\r
      write(it, 'v', 'visibility', hidden ? 'hidden' : '', it.el);\r
      write(it, 'z', 'zIndex', z, it.el);\r
      if (it.content)\r
        write(it, 's', 'transform', Math.abs(scale - 1) < 0.0005 ? '' : \`scale(\${scale.toFixed(4)})\`, it.content);\r
      if (it.tip) {\r
        const lift = ((scale - 1) * it.cross) / 2;\r
        write(\r
          it,\r
          'p',\r
          'transform',\r
          Math.abs(lift) < 0.05\r
            ? ''\r
            : cfg.vertical\r
              ? \`translateX(\${lift.toFixed(2)}px)\`\r
              : \`translateY(\${lift.toFixed(2)}px)\`,\r
          it.tip\r
        );\r
      }\r
    }\r
    const active = best && bestDist < Math.max(best.size, st.pitch) / 2 + 1 ? best : null;\r
    if (active !== st.active) {\r
      st.active?.el.removeAttribute('data-active');\r
      active?.el.setAttribute('data-active', '');\r
      st.active = active;\r
    }\r
  };\r
\r
  const frame = (now: number) => {\r
    st.raf = 0;\r
    if (st.destroyed || !st.geo || st.period <= 0) return;\r
    const cfg = config.current;\r
    const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.1) : 0;\r
    st.last = now;\r
    const P = st.period;\r
    let busy = false;\r
    if (st.introStart === -1 && !st.introDone && st.visible) {\r
      if (cfg.intro && !st.reduced) {\r
        st.introStart = now;\r
      } else {\r
        st.introDone = true;\r
      }\r
      root.removeAttribute('data-intro');\r
    }\r
    if (st.introStart >= 0) {\r
      if ((now - st.introStart) / 1000 >= INTRO_TIME + INTRO_STAGGER) {\r
        st.introStart = -2;\r
        st.introDone = true;\r
      } else {\r
        busy = true;\r
      }\r
    }\r
    const travel = Math.sign(cfg.speed) || 1;\r
    const paused = st.focused || (st.hovered && cfg.hoverValue !== undefined);\r
    const pausedSpeed = st.focused ? 0 : (cfg.hoverValue ?? 0);\r
    let target = st.reduced ? 0 : paused ? pausedSpeed * travel * cfg.dirSign : cfg.speed * cfg.dirSign;\r
    if (cfg.scrollBoost > 0 && !st.reduced) {\r
      st.scrollVel *= Math.exp(-dt / 0.18);\r
      if (Math.abs(st.scrollVel) > 1) busy = true;\r
      target += clamp(st.scrollVel * cfg.scrollBoost, -3000, 3000) * travel * cfg.dirSign;\r
    }\r
    if (st.drag?.active) {\r
      busy = true;\r
    } else if (st.seek) {\r
      st.seek.t = Math.min(1, st.seek.t + dt / st.seek.dur);\r
      st.offset = st.seek.from + st.seek.delta * easeInOut(st.seek.t);\r
      st.velocity = 0;\r
      if (st.seek.t >= 1) st.seek = null;\r
      busy = true;\r
    } else if (st.move) {\r
      st.move.t = Math.min(1, st.move.t + dt / st.move.dur);\r
      st.offset = st.move.from + st.move.delta * easeInOut(st.move.t);\r
      st.velocity = 0;\r
      busy = true;\r
      if (st.move.t >= 1) {\r
        st.move = null;\r
        st.hold = stepTiming(paused ? pausedSpeed : cfg.speed).hold;\r
      }\r
    } else if (cfg.step && !st.reduced) {\r
      const speed = paused ? pausedSpeed : cfg.speed;\r
      st.velocity = 0;\r
      if (speed) {\r
        busy = true;\r
        st.hold -= dt;\r
        if (st.hold <= 0) {\r
          const dir = Math.sign(speed) * cfg.dirSign;\r
          startMove(snapTarget(st.offset, dir), stepTiming(speed).move);\r
        }\r
      }\r
    } else {\r
      const tau = st.glide ? GLIDE_TAU : SMOOTH_TAU;\r
      st.velocity += (target - st.velocity) * (1 - Math.exp(-dt / tau));\r
      if (st.glide && Math.abs(st.velocity - target) < 2) st.glide = false;\r
      if (Math.abs(st.velocity - target) < 0.01) st.velocity = target;\r
      st.offset += st.velocity * dt;\r
      if (st.velocity !== 0 || target !== 0) busy = true;\r
    }\r
    if (!st.focused && !st.seek && !st.drag?.active) {\r
      const wrapped = ((st.offset % P) + P) % P;\r
      if (st.move) st.move.from += wrapped - st.offset;\r
      st.offset = wrapped;\r
    }\r
    const wantMag = cfg.magnify > 0 && st.pointerInside && !st.reduced ? 1 : 0;\r
    if (st.mag !== wantMag) {\r
      st.mag += (wantMag - st.mag) * (1 - Math.exp(-dt / (wantMag ? 0.12 : 0.25)));\r
      if (Math.abs(wantMag - st.mag) < 0.002) st.mag = wantMag;\r
      busy = true;\r
    }\r
    const pu = st.mag > 0 ? pointerU() : null;\r
    if (pu !== null) {\r
      if (!st.magReady) {\r
        st.magU = pu;\r
        st.magReady = true;\r
      }\r
      const next = st.magU + (pu - st.magU) * (1 - Math.exp(-dt / 0.06));\r
      if (Math.abs(next - pu) > 0.05) busy = true;\r
      st.magU = Math.abs(next - pu) > 0.05 ? next : pu;\r
    } else if (st.mag === 0) {\r
      st.magReady = false;\r
    }\r
    render(now);\r
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
  const dragScale = () => {\r
    const geo = st.geo;\r
    if (!geo) return 1;\r
    if (geo.mode === 'orbit') return geo.C / (2 * Math.PI * geo.R * geo.pf);\r
    const pu = pointerU();\r
    if (pu === null || geo.focus <= 0) return 1;\r
    const kf = pu / geo.focusSigma;\r
    return 1 / (1 + geo.focus * Math.exp(-kf * kf));\r
  };\r
\r
  const onEnter = (e: PointerEvent) => {\r
    st.hovered = true;\r
    if (e.pointerType !== 'touch') {\r
      st.pointerInside = true;\r
      st.pointer = local(e);\r
    }\r
    wake();\r
  };\r
\r
  const onLeave = () => {\r
    st.hovered = false;\r
    st.pointerInside = false;\r
    wake();\r
  };\r
\r
  const onDown = (e: PointerEvent) => {\r
    st.pressedAt = performance.now();\r
    if (!config.current.draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
    const [x, y] = local(e);\r
    if (e.pointerType !== 'touch') st.pointer = [x, y];\r
    st.drag = { id: e.pointerId, x, y, active: false, samples: [], scale: dragScale(), anchor: 0, offset: 0 };\r
  };\r
\r
  const onMove = (e: PointerEvent) => {\r
    const cfg = config.current;\r
    if (e.pointerType !== 'touch') {\r
      st.pointer = local(e);\r
      st.pointerInside = true;\r
    }\r
    const d = st.drag;\r
    if (d && e.pointerId === d.id) {\r
      const [x, y] = local(e);\r
      const along = cfg.vertical ? y - d.y : x - d.x;\r
      const across = cfg.vertical ? x - d.x : y - d.y;\r
      if (!d.active) {\r
        if (Math.abs(along) < DRAG_THRESHOLD) return wake();\r
        if (Math.abs(across) > Math.abs(along)) {\r
          st.drag = null;\r
          return wake();\r
        }\r
        d.active = true;\r
        d.anchor = along;\r
        d.offset = st.offset;\r
        st.move = null;\r
        st.seek = null;\r
        st.glide = false;\r
        st.velocity = 0;\r
        try {\r
          root.setPointerCapture(e.pointerId);\r
        } catch {}\r
        root.setAttribute('data-dragging', '');\r
      }\r
      const next = d.offset - (along - d.anchor) * d.scale;\r
      const P = st.period || 1;\r
      st.offset = ((next % P) + P) % P;\r
      d.offset += st.offset - next;\r
      const now = performance.now();\r
      d.samples.push([now, along]);\r
      while (d.samples.length > 2 && now - d.samples[0][0] > 100) d.samples.shift();\r
    }\r
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
    const cfg = config.current;\r
    const now = performance.now();\r
    st.suppressUntil = now + 400;\r
    let v = 0;\r
    const s = d.samples;\r
    if (!cancelled && s.length > 1) {\r
      const [t0, a0] = s[0];\r
      const [t1, a1] = s[s.length - 1];\r
      if (t1 > t0 && now - t1 < 80) v = clamp((-(a1 - a0) / (t1 - t0)) * 1000 * d.scale, -MAX_FLING, MAX_FLING);\r
    }\r
    if (cfg.step && !st.reduced) {\r
      const target = nearestSnap(st.offset + v * 0.35);\r
      startMove(target, clamp(0.3 + Math.abs(target - st.offset) / 1800, 0.3, 0.8));\r
      st.velocity = 0;\r
    } else {\r
      st.velocity = v;\r
      st.glide = Math.abs(v) > 30;\r
    }\r
    wake();\r
  };\r
\r
  const onUp = (e: PointerEvent) => endDrag(e, false);\r
  const onCancel = (e: PointerEvent) => endDrag(e, true);\r
\r
  const onClick = (e: MouseEvent) => {\r
    if (performance.now() < st.suppressUntil) {\r
      e.preventDefault();\r
      e.stopPropagation();\r
      st.suppressUntil = 0;\r
    }\r
  };\r
\r
  const onDragStart = (e: DragEvent) => {\r
    if (config.current.draggable) e.preventDefault();\r
  };\r
\r
  const onFocusIn = (e: FocusEvent) => {\r
    const target = e.target as Node | null;\r
    if (performance.now() - st.pressedAt < 800) return;\r
    st.focused = true;\r
    const it = st.items.find(item => item.el.contains(target));\r
    if (it && st.geo) {\r
      const u = -st.offset - st.geo.lead + it.center - st.length / 2;\r
      const comfortable = st.geo.mode === 'orbit' ? 1 : Math.max(0, st.length / 2 - it.size);\r
      if (Math.abs(u) > comfortable) {\r
        st.move = null;\r
        st.seek = { from: st.offset, delta: u, t: 0, dur: clamp(0.35 + Math.abs(u) / 2000, 0.35, 0.8) };\r
      }\r
    }\r
    wake();\r
  };\r
\r
  const onFocusOut = (e: FocusEvent) => {\r
    if (root.contains(e.relatedTarget as Node | null)) return;\r
    st.focused = false;\r
    wake();\r
  };\r
\r
  const onRootScroll = () => {\r
    if (root.scrollLeft || root.scrollTop) {\r
      root.scrollLeft = 0;\r
      root.scrollTop = 0;\r
    }\r
  };\r
\r
  const onScroll = () => {\r
    const now = performance.now();\r
    const y = window.scrollY;\r
    if (st.scrollT && now > st.scrollT) {\r
      const v = ((y - st.scrollY) / (now - st.scrollT)) * 1000;\r
      st.scrollVel += (clamp(v, -6000, 6000) - st.scrollVel) * 0.5;\r
    }\r
    st.scrollY = y;\r
    st.scrollT = now;\r
    if (config.current.scrollBoost > 0) wake();\r
  };\r
\r
  const onMotion = () => {\r
    st.reduced = !!query?.matches;\r
    wake();\r
  };\r
\r
  root.addEventListener('pointerenter', onEnter);\r
  root.addEventListener('pointerleave', onLeave);\r
  root.addEventListener('pointerdown', onDown);\r
  root.addEventListener('pointermove', onMove);\r
  root.addEventListener('pointerup', onUp);\r
  root.addEventListener('pointercancel', onCancel);\r
  root.addEventListener('lostpointercapture', onCancel);\r
  root.addEventListener('click', onClick, true);\r
  root.addEventListener('dragstart', onDragStart);\r
  root.addEventListener('focusin', onFocusIn);\r
  root.addEventListener('focusout', onFocusOut);\r
  root.addEventListener('scroll', onRootScroll);\r
  window.addEventListener('scroll', onScroll, { passive: true });\r
  query?.addEventListener?.('change', onMotion);\r
\r
  let resizeObserver: ResizeObserver | null = null;\r
  const observed = new Set<Element>();\r
  const refresh = () => {\r
    collect();\r
    measure();\r
    if (resizeObserver) {\r
      const first = track.children[0];\r
      for (const el of [root, first]) {\r
        if (el && !observed.has(el)) {\r
          resizeObserver.observe(el);\r
          observed.add(el);\r
        }\r
      }\r
    }\r
    st.last = 0;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    st.raf = 0;\r
    if (st.geo && st.period > 0) frame(performance.now());\r
  };\r
\r
  if (typeof ResizeObserver !== 'undefined') {\r
    resizeObserver = new ResizeObserver(() => {\r
      measure();\r
      if (st.geo && st.period > 0) render(performance.now());\r
      wake();\r
    });\r
  } else {\r
    window.addEventListener('resize', refresh);\r
  }\r
\r
  let intersection: IntersectionObserver | null = null;\r
  if (typeof IntersectionObserver !== 'undefined') {\r
    intersection = new IntersectionObserver(\r
      entries => {\r
        const entry = entries[entries.length - 1];\r
        st.visible = entry.isIntersecting;\r
        if (st.visible) wake();\r
      },\r
      { threshold: 0.1 }\r
    );\r
    intersection.observe(root);\r
  }\r
\r
  const onVisibility = () => {\r
    if (!document.hidden) wake();\r
  };\r
  document.addEventListener('visibilitychange', onVisibility);\r
\r
  const destroy = () => {\r
    st.destroyed = true;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    root.removeEventListener('pointerenter', onEnter);\r
    root.removeEventListener('pointerleave', onLeave);\r
    root.removeEventListener('pointerdown', onDown);\r
    root.removeEventListener('pointermove', onMove);\r
    root.removeEventListener('pointerup', onUp);\r
    root.removeEventListener('pointercancel', onCancel);\r
    root.removeEventListener('lostpointercapture', onCancel);\r
    root.removeEventListener('click', onClick, true);\r
    root.removeEventListener('dragstart', onDragStart);\r
    root.removeEventListener('focusin', onFocusIn);\r
    root.removeEventListener('focusout', onFocusOut);\r
    root.removeEventListener('scroll', onRootScroll);\r
    window.removeEventListener('scroll', onScroll);\r
    window.removeEventListener('resize', refresh);\r
    document.removeEventListener('visibilitychange', onVisibility);\r
    query?.removeEventListener?.('change', onMotion);\r
    resizeObserver?.disconnect();\r
    intersection?.disconnect();\r
  };\r
\r
  return { refresh, wake, destroy, state: st };\r
};\r
\r
export const LogoLoop = memo<LogoLoopProps>(\r
  ({\r
    logos,\r
    speed = 120,\r
    direction = 'left',\r
    width = '100%',\r
    logoHeight = 28,\r
    gap = 32,\r
    pauseOnHover,\r
    hoverSpeed,\r
    fadeOut = true,\r
    fadeOutWidth = 0.12,\r
    scaleOnHover = false,\r
    layout = 'line',\r
    bend = 0.5,\r
    focus = 0,\r
    magnify = 0,\r
    tiltX = 0,\r
    tiltY = 0,\r
    step = false,\r
    muted = 0,\r
    labels = 'none',\r
    draggable = true,\r
    scrollBoost = 0,\r
    intro = true,\r
    renderItem,\r
    ariaLabel = 'Partner logos',\r
    className,\r
    style\r
  }) => {\r
    const rootRef = useRef<HTMLDivElement>(null);\r
    const trackRef = useRef<HTMLDivElement>(null);\r
    const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);\r
    const [{ copies, primary }, setLayout] = useState<LoopLayout>({ copies: 3, primary: 1 });\r
    const [introPending] = useState(intro);\r
\r
    const vertical = direction === 'up' || direction === 'down';\r
    const config = useRef<LoopConfig>({} as LoopConfig);\r
    config.current = {\r
      speed,\r
      dirSign: (vertical ? direction === 'up' : direction !== 'right') ? 1 : -1,\r
      hoverValue: hoverSpeed !== undefined ? hoverSpeed : pauseOnHover === false ? undefined : 0,\r
      vertical,\r
      layout,\r
      bend,\r
      focus,\r
      magnify,\r
      tiltX,\r
      tiltY,\r
      step,\r
      draggable,\r
      scrollBoost,\r
      intro,\r
      scaleOnHover,\r
      labels,\r
      links: logos.some(item => item.href)\r
    };\r
\r
    useIsomorphicLayoutEffect(() => {\r
      const engine = createEngine(\r
        rootRef.current as HTMLDivElement,\r
        trackRef.current as HTMLDivElement,\r
        config,\r
        setLayout\r
      );\r
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
      copies,\r
      primary,\r
      logos,\r
      vertical,\r
      logoHeight,\r
      gap,\r
      labels,\r
      layout,\r
      bend,\r
      focus,\r
      magnify,\r
      tiltX,\r
      tiltY,\r
      scaleOnHover\r
    ]);\r
\r
    useEffect(() => {\r
      engineRef.current?.wake();\r
    });\r
\r
    const lists = useMemo(\r
      () =>\r
        Array.from({ length: copies }, (_, copyIndex) => {\r
          const isPrimary = copyIndex === primary;\r
          return (\r
            <ul className="logoloop__list" key={copyIndex} role="list" aria-hidden={isPrimary ? undefined : true}>\r
              {logos.map((item, itemIndex) => {\r
                const key = \`\${copyIndex}-\${itemIndex}\`;\r
                const isNode = 'node' in item;\r
                const visual = renderItem ? (\r
                  renderItem(item, key)\r
                ) : isNode ? (\r
                  <span className="logoloop__node" aria-hidden={!!item.href && !item.ariaLabel}>\r
                    {item.node}\r
                  </span>\r
                ) : (\r
                  <img\r
                    src={item.src}\r
                    srcSet={item.srcSet}\r
                    sizes={item.sizes}\r
                    width={item.width}\r
                    height={item.height}\r
                    alt={item.alt ?? ''}\r
                    title={item.title}\r
                    loading="lazy"\r
                    decoding="async"\r
                    draggable={false}\r
                  />\r
                );\r
                const text = (labels === 'inline' || labels === 'below') && item.title ? item.title : null;\r
                const inner = (\r
                  <>\r
                    {visual}\r
                    {text && (\r
                      <span className="logoloop__label" aria-hidden={!isNode && !!item.alt}>\r
                        {text}\r
                      </span>\r
                    )}\r
                  </>\r
                );\r
                const name = isNode ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);\r
                return (\r
                  <li\r
                    className="logoloop__item"\r
                    key={key}\r
                    role="listitem"\r
                    data-color={item.hoverColor ? '' : undefined}\r
                    style={\r
                      item.hoverColor\r
                        ? ({ '--logoloop-item-color': item.hoverColor } as React.CSSProperties)\r
                        : undefined\r
                    }\r
                  >\r
                    {item.href ? (\r
                      <a\r
                        className="logoloop__content"\r
                        href={item.href}\r
                        aria-label={name || 'logo link'}\r
                        target="_blank"\r
                        rel="noreferrer noopener"\r
                        draggable={false}\r
                        tabIndex={isPrimary ? undefined : -1}\r
                      >\r
                        {inner}\r
                      </a>\r
                    ) : (\r
                      <div className="logoloop__content">{inner}</div>\r
                    )}\r
                    {labels === 'hover' && item.title && (\r
                      <span className="logoloop__tip" aria-hidden="true">\r
                        {item.title}\r
                      </span>\r
                    )}\r
                  </li>\r
                );\r
              })}\r
            </ul>\r
          );\r
        }),\r
      [copies, primary, logos, renderItem, labels]\r
    );\r
\r
    const mask = fadeOut ? fadeMask(fadeOutWidth, vertical) : undefined;\r
    const amount = clamp(muted, 0, 1);\r
\r
    const containerStyle = {\r
      width: vertical\r
        ? toCssLength(width) === '100%'\r
          ? undefined\r
          : toCssLength(width)\r
        : (toCssLength(width) ?? '100%'),\r
      '--logoloop-gap': \`\${gap}px\`,\r
      '--logoloop-logoHeight': \`\${logoHeight}px\`,\r
      ...(amount > 0 && {\r
        '--logoloop-gray': Math.min(1, amount * 2).toFixed(3),\r
        '--logoloop-dim': (1 - amount * 0.6).toFixed(3)\r
      }),\r
      ...(mask && { WebkitMaskImage: mask, maskImage: mask }),\r
      ...style\r
    } as React.CSSProperties;\r
\r
    const rootClassName = [\r
      'logoloop',\r
      vertical ? 'logoloop--vertical' : 'logoloop--horizontal',\r
      scaleOnHover && 'logoloop--scale-hover',\r
      className\r
    ]\r
      .filter(Boolean)\r
      .join(' ');\r
\r
    return (\r
      <div\r
        ref={rootRef}\r
        className={rootClassName}\r
        style={containerStyle}\r
        role="region"\r
        aria-label={ariaLabel}\r
        data-intro={introPending ? '' : undefined}\r
        data-draggable={draggable ? '' : undefined}\r
        data-muted={amount > 0 ? '' : undefined}\r
        data-labels={labels !== 'none' ? labels : undefined}\r
      >\r
        <div className="logoloop__track" ref={trackRef}>\r
          {lists}\r
        </div>\r
      </div>\r
    );\r
  }\r
);\r
\r
LogoLoop.displayName = 'LogoLoop';\r
\r
export default LogoLoop;\r
`,o=`'use client';\r
\r
import React, { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';\r
\r
export type LogoItem =\r
  | {\r
      node: React.ReactNode;\r
      href?: string;\r
      title?: string;\r
      ariaLabel?: string;\r
      hoverColor?: string;\r
    }\r
  | {\r
      src: string;\r
      alt?: string;\r
      href?: string;\r
      title?: string;\r
      srcSet?: string;\r
      sizes?: string;\r
      width?: number;\r
      height?: number;\r
      hoverColor?: string;\r
    };\r
\r
export interface LogoLoopProps {\r
  logos: LogoItem[];\r
  speed?: number;\r
  direction?: 'left' | 'right' | 'up' | 'down';\r
  width?: number | string;\r
  logoHeight?: number;\r
  gap?: number;\r
  pauseOnHover?: boolean;\r
  hoverSpeed?: number;\r
  fadeOut?: boolean;\r
  fadeOutWidth?: number;\r
  fadeOutColor?: string;\r
  scaleOnHover?: boolean;\r
  layout?: 'line' | 'wave' | 'arc' | 'orbit';\r
  bend?: number;\r
  focus?: number;\r
  magnify?: number;\r
  tiltX?: number;\r
  tiltY?: number;\r
  step?: boolean;\r
  muted?: number;\r
  labels?: 'none' | 'inline' | 'below' | 'hover';\r
  draggable?: boolean;\r
  scrollBoost?: number;\r
  intro?: boolean;\r
  renderItem?: (item: LogoItem, key: React.Key) => React.ReactNode;\r
  ariaLabel?: string;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
interface LoopConfig {\r
  speed: number;\r
  dirSign: number;\r
  hoverValue: number | undefined;\r
  vertical: boolean;\r
  layout: string;\r
  bend: number;\r
  focus: number;\r
  magnify: number;\r
  tiltX: number;\r
  tiltY: number;\r
  step: boolean;\r
  draggable: boolean;\r
  scrollBoost: number;\r
  intro: boolean;\r
  scaleOnHover: boolean;\r
  labels: string;\r
  links: boolean;\r
}\r
\r
interface LoopLayout {\r
  copies: number;\r
  primary: number;\r
}\r
\r
interface LoopItem {\r
  el: HTMLElement;\r
  copy: number;\r
  index: number;\r
  content: HTMLElement | null;\r
  tip: HTMLElement | null;\r
  center: number;\r
  size: number;\r
  cross: number;\r
  t: string;\r
  o: string;\r
  v: string;\r
  z: string;\r
  s: string;\r
  p: string;\r
}\r
\r
interface Geometry {\r
  mode: string;\r
  shift: number;\r
  uMin: number;\r
  uMax: number;\r
  lead: number;\r
  focus: number;\r
  focusSigma: number;\r
  magnify: number;\r
  magSigma: number;\r
  amp: number;\r
  k: number;\r
  R: number;\r
  sign: number;\r
  limit: number;\r
  C: number;\r
  alpha: number;\r
  depth: number;\r
  pf: number;\r
  tilted: boolean;\r
  tiltX: number;\r
  tiltY: number;\r
  m: number[];\r
  persp: number;\r
}\r
\r
interface Drag {\r
  id: number;\r
  x: number;\r
  y: number;\r
  active: boolean;\r
  samples: [number, number][];\r
  scale: number;\r
  anchor: number;\r
  offset: number;\r
}\r
\r
interface Move {\r
  from: number;\r
  delta: number;\r
  t: number;\r
  dur: number;\r
}\r
\r
interface EngineState {\r
  offset: number;\r
  velocity: number;\r
  period: number;\r
  length: number;\r
  box: [number, number];\r
  items: LoopItem[];\r
  snaps: number[];\r
  pitch: number;\r
  crossMax: number;\r
  sizeMax: number;\r
  tipMax: number;\r
  geo: Geometry | null;\r
  layout: LoopLayout;\r
  hovered: boolean;\r
  focused: boolean;\r
  pointer: [number, number] | null;\r
  pointerInside: boolean;\r
  mag: number;\r
  magU: number;\r
  magReady: boolean;\r
  drag: Drag | null;\r
  glide: boolean;\r
  suppressUntil: number;\r
  pressedAt: number;\r
  move: Move | null;\r
  hold: number;\r
  seek: Move | null;\r
  scrollVel: number;\r
  scrollY: number;\r
  scrollT: number;\r
  visible: boolean;\r
  introStart: number;\r
  introDone: boolean;\r
  itemMode: boolean;\r
  active: LoopItem | null;\r
  raf: number;\r
  last: number;\r
  reduced: boolean;\r
  destroyed: boolean;\r
}\r
\r
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;\r
\r
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');\r
\r
const SMOOTH_TAU = 0.25;\r
const GLIDE_TAU = 0.8;\r
const DRAG_THRESHOLD = 6;\r
const MAX_FLING = 4000;\r
const INTRO_TIME = 0.7;\r
const INTRO_STAGGER = 0.45;\r
const HALF_SQRT_PI = Math.sqrt(Math.PI) / 2;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const toCssLength = (value?: number | string): string | undefined =>\r
  typeof value === 'number' ? \`\${value}px\` : (value ?? undefined);\r
\r
const erf = (x: number) => {\r
  const a = Math.abs(x);\r
  const t = 1 / (1 + 0.3275911 * a);\r
  const y =\r
    1 -\r
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);\r
  return x < 0 ? -y : y;\r
};\r
\r
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);\r
\r
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);\r
\r
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);\r
\r
const fadeMask = (size: number, vertical: boolean) => {\r
  const span = clamp(size, 0, 0.5) * 100;\r
  if (span <= 0) return undefined;\r
  const stops: string[] = [];\r
  for (let i = 0; i <= 12; i++) {\r
    stops.push(\`rgba(0,0,0,\${smootherstep(i / 12).toFixed(4)}) \${((span * i) / 12).toFixed(3)}%\`);\r
  }\r
  for (let i = 12; i >= 0; i--) {\r
    stops.push(\`rgba(0,0,0,\${smootherstep(i / 12).toFixed(4)}) \${(100 - (span * i) / 12).toFixed(3)}%\`);\r
  }\r
  return \`linear-gradient(\${vertical ? 'to bottom' : 'to right'}, \${stops.join(', ')})\`;\r
};\r
\r
const rotationMatrix = (degX: number, degY: number): number[] => {\r
  const a = (degX * Math.PI) / 180;\r
  const b = (degY * Math.PI) / 180;\r
  const ca = Math.cos(a);\r
  const sa = Math.sin(a);\r
  const cb = Math.cos(b);\r
  const sb = Math.sin(b);\r
  return [cb, 0, sb, sa * sb, ca, -sa * cb, -ca * sb, sa, ca * cb];\r
};\r
\r
const unproject = (m: number[], depth: number, sx: number, sy: number): [number, number] | null => {\r
  const den = m[8] * depth - m[2] * sx - m[5] * sy;\r
  if (den <= 1e-6) return null;\r
  const t = (m[8] * depth) / den;\r
  if (t <= 0) return null;\r
  const qx = t * sx;\r
  const qy = t * sy;\r
  const qz = depth * (1 - t);\r
  return [m[0] * qx + m[3] * qy + m[6] * qz, m[1] * qx + m[4] * qy + m[7] * qz];\r
};\r
\r
const project = (m: number[], depth: number, px: number, py: number): [number, number] => {\r
  const k = depth / (depth - (m[6] * px + m[7] * py));\r
  return [(m[0] * px + m[1] * py) * k, (m[3] * px + m[4] * py) * k];\r
};\r
\r
const createEngine = (\r
  root: HTMLDivElement,\r
  track: HTMLDivElement,\r
  config: React.MutableRefObject<LoopConfig>,\r
  setLayout: (layout: LoopLayout) => void\r
) => {\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const st: EngineState = {\r
    offset: 0,\r
    velocity: 0,\r
    period: 0,\r
    length: 0,\r
    box: [0, 0],\r
    items: [],\r
    snaps: [],\r
    pitch: 0,\r
    crossMax: 0,\r
    sizeMax: 0,\r
    tipMax: 0,\r
    geo: null,\r
    layout: { copies: 2, primary: 0 },\r
    hovered: false,\r
    focused: false,\r
    pointer: null,\r
    pointerInside: false,\r
    mag: 0,\r
    magU: 0,\r
    magReady: false,\r
    drag: null,\r
    glide: false,\r
    suppressUntil: 0,\r
    pressedAt: -1e9,\r
    move: null,\r
    hold: 0,\r
    seek: null,\r
    scrollVel: 0,\r
    scrollY: window.scrollY,\r
    scrollT: 0,\r
    visible: typeof IntersectionObserver === 'undefined',\r
    introStart: -1,\r
    introDone: !config.current.intro,\r
    itemMode: false,\r
    active: null,\r
    raf: 0,\r
    last: 0,\r
    reduced: !!query?.matches,\r
    destroyed: false\r
  };\r
\r
  const collect = () => {\r
    const items: LoopItem[] = [];\r
    Array.from(track.children).forEach((list, copy) => {\r
      Array.from(list.children).forEach((el, index) => {\r
        items.push({\r
          el: el as HTMLElement,\r
          copy,\r
          index,\r
          content: (el.children[0] as HTMLElement) || null,\r
          tip: (el.children[1] as HTMLElement) || null,\r
          center: 0,\r
          size: 0,\r
          cross: 0,\r
          t: '',\r
          o: '',\r
          v: '',\r
          z: '',\r
          s: '',\r
          p: ''\r
        });\r
      });\r
    });\r
    st.items = items;\r
    st.active = null;\r
  };\r
\r
  const clearItems = () => {\r
    for (const it of st.items) {\r
      it.el.style.transform = '';\r
      it.el.style.opacity = '';\r
      it.el.style.visibility = '';\r
      it.el.style.zIndex = '';\r
      if (it.content) it.content.style.transform = '';\r
      if (it.tip) it.tip.style.transform = '';\r
      it.t = it.o = it.v = it.z = it.s = it.p = '';\r
    }\r
  };\r
\r
  const geometry = () => {\r
    const cfg = config.current;\r
    const L = st.length;\r
    const P = st.period;\r
    const hc = st.crossMax;\r
    const w = st.sizeMax;\r
    const bend = clamp(cfg.bend, -1, 1);\r
    const geo: Geometry = {\r
      mode: cfg.layout,\r
      shift: 0,\r
      uMin: -L / 2 - w,\r
      uMax: L / 2 + w,\r
      lead: 0,\r
      focus: clamp(cfg.focus, 0, 1) * 0.9,\r
      focusSigma: Math.max(40, L * 0.18),\r
      magnify: clamp(cfg.magnify, 0, 1),\r
      magSigma: Math.max(hc * 1.4, st.pitch * 1.1),\r
      amp: 0,\r
      k: 0,\r
      R: 0,\r
      sign: 1,\r
      limit: 0,\r
      C: 0,\r
      alpha: 0,\r
      depth: 0,\r
      pf: 1,\r
      tilted: false,\r
      tiltX: 0,\r
      tiltY: 0,\r
      m: [1, 0, 0, 0, 1, 0, 0, 0, 1],\r
      persp: 0\r
    };\r
    let pad = cfg.scaleOnHover ? hc * 0.1 : 0;\r
    const lens = (1 + geo.focus) * (1 + geo.magnify) - 1;\r
    if (geo.mode === 'wave') {\r
      geo.amp = bend * (hc * 0.6 + L * 0.035);\r
      geo.k = (2 * Math.PI) / Math.max(1, L / 1.25);\r
      pad += Math.abs(geo.amp) + (lens * hc) / 2 + hc * 0.08;\r
    } else if (geo.mode === 'arc' && Math.abs(bend) > 0.005) {\r
      const edge = Math.abs(bend) * (Math.PI / 4);\r
      const R = L / 2 / Math.sin(edge);\r
      const sag = R * (1 - Math.cos(edge));\r
      geo.R = R;\r
      geo.sign = Math.sign(bend);\r
      geo.shift = sag / 2;\r
      geo.limit = Math.PI * 0.6;\r
      const reach = R * Math.min(Math.PI / 2, Math.asin(Math.min(1, (L / 2 + w) / R))) + w;\r
      geo.uMin = -reach;\r
      geo.uMax = reach;\r
      pad += sag / 2 + (w / 2) * Math.sin(edge) + (lens * hc) / 2;\r
    } else if (geo.mode === 'orbit') {\r
      const R = Math.max(40, L * 0.43 - w * 0.2);\r
      const k = Math.max(1, Math.round((2 * Math.PI * R) / P));\r
      const alpha = Math.sign(bend) * Math.atan2(Math.abs(bend) * Math.max(hc * 2, R * 0.36), R);\r
      const depth = R * 5;\r
      const pf = depth / (depth - R * Math.cos(alpha));\r
      const pb = depth / (depth + R * Math.cos(alpha));\r
      const yf = R * Math.sin(alpha) * pf;\r
      const yb = -R * Math.sin(alpha) * pb;\r
      const grow = (1 + lens) * (cfg.scaleOnHover ? 1.2 : 1);\r
      const lo = Math.min(yf - (hc * pf * grow) / 2, yb - (hc * pb) / 2);\r
      const hi = Math.max(yf + (hc * pf * grow) / 2, yb + (hc * pb) / 2);\r
      geo.R = R;\r
      geo.C = k * P;\r
      geo.alpha = alpha;\r
      geo.depth = depth;\r
      geo.pf = pf;\r
      geo.shift = (lo + hi) / 2;\r
      geo.uMin = -geo.C / 2;\r
      geo.uMax = geo.C / 2;\r
      pad = Math.max(0, (hi - lo) / 2 - hc / 2);\r
    } else {\r
      pad += (lens * hc) / 2;\r
    }\r
    if (cfg.labels === 'hover') pad += cfg.vertical ? st.tipMax : hc * 0.2 + Math.max(11, hc * 0.26) * 1.3;\r
    const tx = clamp(cfg.tiltX, -60, 60);\r
    const ty = clamp(cfg.tiltY, -60, 60);\r
    if (Math.abs(tx) > 0.01 || Math.abs(ty) > 0.01) {\r
      geo.tilted = true;\r
      geo.tiltX = tx;\r
      geo.tiltY = ty;\r
      geo.m = rotationMatrix(tx, ty);\r
      geo.persp = Math.max(L, 480) * 1.3;\r
      const edge = L / 2 + w;\r
      const along = (s: number) => {\r
        const p = cfg.vertical ? unproject(geo.m, geo.persp, 0, s) : unproject(geo.m, geo.persp, s, 0);\r
        if (!p) return Math.sign(s) * L * 4;\r
        return clamp(cfg.vertical ? p[1] : p[0], -L * 4, L * 4);\r
      };\r
      const a = along(-edge);\r
      const b = along(edge);\r
      geo.uMin = Math.min(geo.uMin, a, b) - w;\r
      geo.uMax = Math.max(geo.uMax, a, b) + w;\r
      const band = hc / 2 + pad;\r
      let reach = band;\r
      for (const u of [a, b, 0]) {\r
        for (const v of [-band, band]) {\r
          const q = cfg.vertical ? project(geo.m, geo.persp, v, u) : project(geo.m, geo.persp, u, v);\r
          reach = Math.max(reach, Math.abs(cfg.vertical ? q[0] : q[1]));\r
        }\r
      }\r
      pad = reach - hc / 2;\r
    }\r
    const extra = cfg.links ? 2 : 0;\r
    geo.lead = (Math.max(0, Math.ceil((-geo.uMin - L / 2) / P)) + extra) * P;\r
    const copies = Math.max(2, Math.ceil((geo.uMax + L / 2 + geo.lead) / P) + 2 + (extra ? 1 : 0));\r
    const primary = Math.min(copies - 1, Math.floor((geo.lead + L / 2) / P));\r
    st.geo = geo;\r
    root.style.setProperty('--logoloop-pad', \`\${Math.ceil(pad)}px\`);\r
    root.style.perspective = geo.tilted ? \`\${geo.persp}px\` : '';\r
    track.style.transformOrigin = geo.tilted ? (cfg.vertical ? \`50% \${L / 2}px\` : \`\${L / 2}px 50%\`) : '';\r
    if (copies !== st.layout.copies || primary !== st.layout.primary) {\r
      st.layout = { copies, primary };\r
      setLayout(st.layout);\r
    }\r
  };\r
\r
  const measure = () => {\r
    const cfg = config.current;\r
    const lists = track.children;\r
    if (!lists.length || !st.items.length) {\r
      st.period = 0;\r
      return;\r
    }\r
    if (cfg.vertical) {\r
      const parentHeight = root.parentElement?.clientHeight ?? 0;\r
      if (parentHeight > 0 && root.style.height !== \`\${Math.ceil(parentHeight)}px\`) {\r
        root.style.height = \`\${Math.ceil(parentHeight)}px\`;\r
      }\r
    } else if (root.style.height) {\r
      root.style.height = '';\r
    }\r
    track.style.transform = 'none';\r
    clearItems();\r
    const rootRect = root.getBoundingClientRect();\r
    const k = root.offsetWidth ? rootRect.width / root.offsetWidth || 1 : 1;\r
    const trackRect = track.getBoundingClientRect();\r
    const origin = cfg.vertical ? trackRect.top : trackRect.left;\r
    let crossMax = 0;\r
    let sizeMax = 0;\r
    let tipMax = 0;\r
    for (const it of st.items) {\r
      const r = it.el.getBoundingClientRect();\r
      it.center = ((cfg.vertical ? r.top + r.height / 2 : r.left + r.width / 2) - origin) / k;\r
      it.size = (cfg.vertical ? r.height : r.width) / k;\r
      it.cross = (cfg.vertical ? r.width : r.height) / k;\r
      crossMax = Math.max(crossMax, it.cross);\r
      sizeMax = Math.max(sizeMax, it.size);\r
      if (it.tip && it.copy === 0) tipMax = Math.max(tipMax, it.tip.offsetWidth);\r
    }\r
    const a = lists[0].getBoundingClientRect();\r
    const b = lists[1] ? lists[1].getBoundingClientRect() : null;\r
    st.period = (b ? (cfg.vertical ? b.top - a.top : b.left - a.left) : cfg.vertical ? a.height : a.width) / k;\r
    const cs = getComputedStyle(root);\r
    st.box = [root.offsetWidth, root.offsetHeight];\r
    st.length = cfg.vertical\r
      ? root.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)\r
      : root.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);\r
    st.crossMax = crossMax;\r
    st.sizeMax = sizeMax;\r
    st.tipMax = tipMax + crossMax * 0.25;\r
    const first = st.items.filter(it => it.copy === 0);\r
    st.pitch = first.length ? st.period / first.length : st.period;\r
    st.snaps = first.map(it => it.center);\r
    st.itemMode = false;\r
    if (st.period <= 0) return;\r
    geometry();\r
  };\r
\r
  const pointerU = () => {\r
    const geo = st.geo;\r
    if (!st.pointer || !geo) return null;\r
    const cfg = config.current;\r
    let sx = st.pointer[0] - st.box[0] / 2;\r
    let sy = st.pointer[1] - st.box[1] / 2;\r
    if (geo.tilted) {\r
      const p = unproject(geo.m, geo.persp, sx, sy);\r
      if (!p) return null;\r
      sx = p[0];\r
      sy = p[1];\r
    }\r
    const s = cfg.vertical ? sy : sx;\r
    if (geo.mode === 'arc' && geo.R) return geo.R * Math.asin(clamp(s / geo.R, -1, 1));\r
    if (geo.mode === 'orbit') return Math.asin(clamp(s / (geo.R * geo.pf), -1, 1));\r
    return s;\r
  };\r
\r
  const snapTarget = (from: number, dir: number) => {\r
    const P = st.period;\r
    const base = st.length / 2 + (st.geo?.lead ?? 0);\r
    let best: number | null = null;\r
    for (const c of st.snaps) {\r
      const s = c - base;\r
      const candidate = dir > 0 ? s + P * Math.ceil((from + 0.5 - s) / P) : s + P * Math.floor((from - 0.5 - s) / P);\r
      if (best === null || (dir > 0 ? candidate < best : candidate > best)) best = candidate;\r
    }\r
    return best ?? from;\r
  };\r
\r
  const nearestSnap = (value: number) => {\r
    const P = st.period;\r
    const base = st.length / 2 + (st.geo?.lead ?? 0);\r
    let best = value;\r
    let dist = Infinity;\r
    for (const c of st.snaps) {\r
      const s = c - base;\r
      const candidate = s + P * Math.round((value - s) / P);\r
      if (Math.abs(candidate - value) < dist) {\r
        dist = Math.abs(candidate - value);\r
        best = candidate;\r
      }\r
    }\r
    return best;\r
  };\r
\r
  const startMove = (target: number, duration: number) => {\r
    st.move = { from: st.offset, delta: target - st.offset, t: 0, dur: duration };\r
  };\r
\r
  const stepTiming = (speed: number) => {\r
    const cycle = st.pitch / Math.max(1, Math.abs(speed));\r
    const move = clamp(cycle * 0.55, 0.35, 0.9);\r
    return { move, hold: Math.max(0.35, cycle - move) };\r
  };\r
\r
  const write = (\r
    it: LoopItem,\r
    key: 't' | 'o' | 'v' | 'z' | 's' | 'p',\r
    prop: 'transform' | 'opacity' | 'visibility' | 'zIndex',\r
    value: string,\r
    target: HTMLElement\r
  ) => {\r
    if (it[key] !== value) {\r
      it[key] = value;\r
      target.style[prop] = value;\r
    }\r
  };\r
\r
  const render = (now: number) => {\r
    const cfg = config.current;\r
    const geo = st.geo as Geometry;\r
    const L = st.length;\r
    const half = L / 2;\r
    const T = -st.offset - geo.lead;\r
    const lineT = cfg.vertical\r
      ? \`translate3d(0px, \${T.toFixed(2)}px, 0px)\`\r
      : \`translate3d(\${T.toFixed(2)}px, 0px, 0px)\`;\r
    track.style.transform = geo.tilted ? \`rotateX(\${geo.tiltX}deg) rotateY(\${geo.tiltY}deg) \${lineT}\` : lineT;\r
    const introRunning = st.introStart >= 0;\r
    const elapsed = introRunning ? (now - st.introStart) / 1000 : 0;\r
    const lensFocus = geo.mode === 'orbit' ? clamp(cfg.focus, 0, 1) * 0.9 : geo.focus;\r
    const lensMag = geo.magnify * st.mag;\r
    const cursorActive = lensMag > 0 && st.mag > 0.5 && geo.mode !== 'orbit';\r
    const wantsActive = cfg.focus > 0 || cfg.step || cursorActive;\r
    const needItems = geo.mode !== 'line' || lensFocus > 0 || lensMag > 0.0005 || introRunning;\r
    if (!needItems && st.itemMode) clearItems();\r
    st.itemMode = needItems;\r
    if (!needItems && !wantsActive) {\r
      if (st.active) {\r
        st.active.el.removeAttribute('data-active');\r
        st.active = null;\r
      }\r
      return;\r
    }\r
    let best: LoopItem | null = null;\r
    let bestDist = Infinity;\r
    for (const it of st.items) {\r
      const u = T + it.center - half;\r
      let x = u;\r
      let y = 0;\r
      let rot = 0;\r
      let scale = 1;\r
      let opacity = 1;\r
      let z = '';\r
      let hidden = false;\r
      let dist = Math.abs(u);\r
      if (geo.mode === 'orbit') {\r
        if (u < -geo.C / 2 || u >= geo.C / 2) {\r
          hidden = true;\r
        } else {\r
          const th = (2 * Math.PI * u) / geo.C;\r
          const Z = geo.R * Math.cos(th);\r
          const p = geo.depth / (geo.depth - Z * Math.cos(geo.alpha));\r
          x = geo.R * Math.sin(th) * p;\r
          y = Z * Math.sin(geo.alpha) * p - geo.shift;\r
          scale = p;\r
          if (lensFocus > 0) scale *= 1 + lensFocus * Math.exp(-((th / 0.55) ** 2));\r
          if (lensMag > 0) {\r
            const span = (geo.magSigma * 2 * Math.PI) / geo.C;\r
            scale *= 1 + lensMag * Math.max(0, Math.cos(th)) * Math.exp(-(((th - st.magU) / span) ** 2));\r
          }\r
          const facing = (Math.cos(th) + 1) / 2;\r
          opacity = 0.25 + 0.75 * facing * facing;\r
          z = String(Math.round(facing * 1000));\r
          dist = Math.cos(th) > 0 ? Math.abs(th) * geo.R : Infinity;\r
        }\r
      } else {\r
        let w = u;\r
        if (lensFocus > 0) {\r
          const kf = w / geo.focusSigma;\r
          scale *= 1 + lensFocus * Math.exp(-kf * kf);\r
          opacity *= 1 - 0.45 * lensFocus * (1 - Math.exp(-((u / (geo.focusSigma * 1.8)) ** 2)));\r
          w += lensFocus * geo.focusSigma * HALF_SQRT_PI * erf(kf);\r
        }\r
        const near = Math.abs(w - st.magU);\r
        if (lensMag > 0) {\r
          const km = (w - st.magU) / geo.magSigma;\r
          scale *= 1 + lensMag * Math.exp(-km * km);\r
          w += lensMag * geo.magSigma * HALF_SQRT_PI * erf(km);\r
        }\r
        x = w;\r
        if (geo.mode === 'wave') {\r
          y = geo.amp * Math.sin(geo.k * w);\r
          rot = (Math.atan(geo.amp * geo.k * Math.cos(geo.k * w)) * 90) / Math.PI;\r
        } else if (geo.mode === 'arc' && geo.R) {\r
          const phi = w / geo.R;\r
          if (Math.abs(phi) > geo.limit) hidden = true;\r
          x = geo.R * Math.sin(phi);\r
          y = geo.sign * (geo.R * (1 - Math.cos(phi)) - geo.shift);\r
          rot = (geo.sign * phi * 180) / Math.PI;\r
        }\r
        dist = cursorActive ? near : Math.abs(x);\r
      }\r
      if (introRunning && !hidden) {\r
        const pos = clamp((x + half) / Math.max(1, L), 0, 1);\r
        const e = easeOut(clamp((elapsed - pos * INTRO_STAGGER) / INTRO_TIME, 0, 1));\r
        opacity *= e;\r
        y += (1 - e) * 14;\r
      }\r
      if (wantsActive && !hidden && dist < bestDist) {\r
        bestDist = dist;\r
        best = it;\r
      }\r
      if (!needItems) continue;\r
      const along = x - u;\r
      const t = hidden\r
        ? ''\r
        : \`\${cfg.vertical ? \`translate3d(\${y.toFixed(2)}px, \${along.toFixed(2)}px, 0px)\` : \`translate3d(\${along.toFixed(2)}px, \${y.toFixed(2)}px, 0px)\`}\${\r
            rot ? \` rotate(\${(cfg.vertical ? -rot : rot).toFixed(2)}deg)\` : ''\r
          }\`;\r
      write(it, 't', 'transform', t, it.el);\r
      write(it, 'o', 'opacity', hidden ? '0' : opacity > 0.999 ? '' : opacity.toFixed(3), it.el);\r
      write(it, 'v', 'visibility', hidden ? 'hidden' : '', it.el);\r
      write(it, 'z', 'zIndex', z, it.el);\r
      if (it.content)\r
        write(it, 's', 'transform', Math.abs(scale - 1) < 0.0005 ? '' : \`scale(\${scale.toFixed(4)})\`, it.content);\r
      if (it.tip) {\r
        const lift = ((scale - 1) * it.cross) / 2;\r
        write(\r
          it,\r
          'p',\r
          'transform',\r
          Math.abs(lift) < 0.05\r
            ? ''\r
            : cfg.vertical\r
              ? \`translateX(\${lift.toFixed(2)}px)\`\r
              : \`translateY(\${lift.toFixed(2)}px)\`,\r
          it.tip\r
        );\r
      }\r
    }\r
    const active = best && bestDist < Math.max(best.size, st.pitch) / 2 + 1 ? best : null;\r
    if (active !== st.active) {\r
      st.active?.el.removeAttribute('data-active');\r
      active?.el.setAttribute('data-active', '');\r
      st.active = active;\r
    }\r
  };\r
\r
  const frame = (now: number) => {\r
    st.raf = 0;\r
    if (st.destroyed || !st.geo || st.period <= 0) return;\r
    const cfg = config.current;\r
    const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.1) : 0;\r
    st.last = now;\r
    const P = st.period;\r
    let busy = false;\r
    if (st.introStart === -1 && !st.introDone && st.visible) {\r
      if (cfg.intro && !st.reduced) {\r
        st.introStart = now;\r
      } else {\r
        st.introDone = true;\r
      }\r
      root.removeAttribute('data-intro');\r
    }\r
    if (st.introStart >= 0) {\r
      if ((now - st.introStart) / 1000 >= INTRO_TIME + INTRO_STAGGER) {\r
        st.introStart = -2;\r
        st.introDone = true;\r
      } else {\r
        busy = true;\r
      }\r
    }\r
    const travel = Math.sign(cfg.speed) || 1;\r
    const paused = st.focused || (st.hovered && cfg.hoverValue !== undefined);\r
    const pausedSpeed = st.focused ? 0 : (cfg.hoverValue ?? 0);\r
    let target = st.reduced ? 0 : paused ? pausedSpeed * travel * cfg.dirSign : cfg.speed * cfg.dirSign;\r
    if (cfg.scrollBoost > 0 && !st.reduced) {\r
      st.scrollVel *= Math.exp(-dt / 0.18);\r
      if (Math.abs(st.scrollVel) > 1) busy = true;\r
      target += clamp(st.scrollVel * cfg.scrollBoost, -3000, 3000) * travel * cfg.dirSign;\r
    }\r
    if (st.drag?.active) {\r
      busy = true;\r
    } else if (st.seek) {\r
      st.seek.t = Math.min(1, st.seek.t + dt / st.seek.dur);\r
      st.offset = st.seek.from + st.seek.delta * easeInOut(st.seek.t);\r
      st.velocity = 0;\r
      if (st.seek.t >= 1) st.seek = null;\r
      busy = true;\r
    } else if (st.move) {\r
      st.move.t = Math.min(1, st.move.t + dt / st.move.dur);\r
      st.offset = st.move.from + st.move.delta * easeInOut(st.move.t);\r
      st.velocity = 0;\r
      busy = true;\r
      if (st.move.t >= 1) {\r
        st.move = null;\r
        st.hold = stepTiming(paused ? pausedSpeed : cfg.speed).hold;\r
      }\r
    } else if (cfg.step && !st.reduced) {\r
      const speed = paused ? pausedSpeed : cfg.speed;\r
      st.velocity = 0;\r
      if (speed) {\r
        busy = true;\r
        st.hold -= dt;\r
        if (st.hold <= 0) {\r
          const dir = Math.sign(speed) * cfg.dirSign;\r
          startMove(snapTarget(st.offset, dir), stepTiming(speed).move);\r
        }\r
      }\r
    } else {\r
      const tau = st.glide ? GLIDE_TAU : SMOOTH_TAU;\r
      st.velocity += (target - st.velocity) * (1 - Math.exp(-dt / tau));\r
      if (st.glide && Math.abs(st.velocity - target) < 2) st.glide = false;\r
      if (Math.abs(st.velocity - target) < 0.01) st.velocity = target;\r
      st.offset += st.velocity * dt;\r
      if (st.velocity !== 0 || target !== 0) busy = true;\r
    }\r
    if (!st.focused && !st.seek && !st.drag?.active) {\r
      const wrapped = ((st.offset % P) + P) % P;\r
      if (st.move) st.move.from += wrapped - st.offset;\r
      st.offset = wrapped;\r
    }\r
    const wantMag = cfg.magnify > 0 && st.pointerInside && !st.reduced ? 1 : 0;\r
    if (st.mag !== wantMag) {\r
      st.mag += (wantMag - st.mag) * (1 - Math.exp(-dt / (wantMag ? 0.12 : 0.25)));\r
      if (Math.abs(wantMag - st.mag) < 0.002) st.mag = wantMag;\r
      busy = true;\r
    }\r
    const pu = st.mag > 0 ? pointerU() : null;\r
    if (pu !== null) {\r
      if (!st.magReady) {\r
        st.magU = pu;\r
        st.magReady = true;\r
      }\r
      const next = st.magU + (pu - st.magU) * (1 - Math.exp(-dt / 0.06));\r
      if (Math.abs(next - pu) > 0.05) busy = true;\r
      st.magU = Math.abs(next - pu) > 0.05 ? next : pu;\r
    } else if (st.mag === 0) {\r
      st.magReady = false;\r
    }\r
    render(now);\r
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
  const dragScale = () => {\r
    const geo = st.geo;\r
    if (!geo) return 1;\r
    if (geo.mode === 'orbit') return geo.C / (2 * Math.PI * geo.R * geo.pf);\r
    const pu = pointerU();\r
    if (pu === null || geo.focus <= 0) return 1;\r
    const kf = pu / geo.focusSigma;\r
    return 1 / (1 + geo.focus * Math.exp(-kf * kf));\r
  };\r
\r
  const onEnter = (e: PointerEvent) => {\r
    st.hovered = true;\r
    if (e.pointerType !== 'touch') {\r
      st.pointerInside = true;\r
      st.pointer = local(e);\r
    }\r
    wake();\r
  };\r
\r
  const onLeave = () => {\r
    st.hovered = false;\r
    st.pointerInside = false;\r
    wake();\r
  };\r
\r
  const onDown = (e: PointerEvent) => {\r
    st.pressedAt = performance.now();\r
    if (!config.current.draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;\r
    const [x, y] = local(e);\r
    if (e.pointerType !== 'touch') st.pointer = [x, y];\r
    st.drag = { id: e.pointerId, x, y, active: false, samples: [], scale: dragScale(), anchor: 0, offset: 0 };\r
  };\r
\r
  const onMove = (e: PointerEvent) => {\r
    const cfg = config.current;\r
    if (e.pointerType !== 'touch') {\r
      st.pointer = local(e);\r
      st.pointerInside = true;\r
    }\r
    const d = st.drag;\r
    if (d && e.pointerId === d.id) {\r
      const [x, y] = local(e);\r
      const along = cfg.vertical ? y - d.y : x - d.x;\r
      const across = cfg.vertical ? x - d.x : y - d.y;\r
      if (!d.active) {\r
        if (Math.abs(along) < DRAG_THRESHOLD) return wake();\r
        if (Math.abs(across) > Math.abs(along)) {\r
          st.drag = null;\r
          return wake();\r
        }\r
        d.active = true;\r
        d.anchor = along;\r
        d.offset = st.offset;\r
        st.move = null;\r
        st.seek = null;\r
        st.glide = false;\r
        st.velocity = 0;\r
        try {\r
          root.setPointerCapture(e.pointerId);\r
        } catch {}\r
        root.setAttribute('data-dragging', '');\r
      }\r
      const next = d.offset - (along - d.anchor) * d.scale;\r
      const P = st.period || 1;\r
      st.offset = ((next % P) + P) % P;\r
      d.offset += st.offset - next;\r
      const now = performance.now();\r
      d.samples.push([now, along]);\r
      while (d.samples.length > 2 && now - d.samples[0][0] > 100) d.samples.shift();\r
    }\r
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
    const cfg = config.current;\r
    const now = performance.now();\r
    st.suppressUntil = now + 400;\r
    let v = 0;\r
    const s = d.samples;\r
    if (!cancelled && s.length > 1) {\r
      const [t0, a0] = s[0];\r
      const [t1, a1] = s[s.length - 1];\r
      if (t1 > t0 && now - t1 < 80) v = clamp((-(a1 - a0) / (t1 - t0)) * 1000 * d.scale, -MAX_FLING, MAX_FLING);\r
    }\r
    if (cfg.step && !st.reduced) {\r
      const target = nearestSnap(st.offset + v * 0.35);\r
      startMove(target, clamp(0.3 + Math.abs(target - st.offset) / 1800, 0.3, 0.8));\r
      st.velocity = 0;\r
    } else {\r
      st.velocity = v;\r
      st.glide = Math.abs(v) > 30;\r
    }\r
    wake();\r
  };\r
\r
  const onUp = (e: PointerEvent) => endDrag(e, false);\r
  const onCancel = (e: PointerEvent) => endDrag(e, true);\r
\r
  const onClick = (e: MouseEvent) => {\r
    if (performance.now() < st.suppressUntil) {\r
      e.preventDefault();\r
      e.stopPropagation();\r
      st.suppressUntil = 0;\r
    }\r
  };\r
\r
  const onDragStart = (e: DragEvent) => {\r
    if (config.current.draggable) e.preventDefault();\r
  };\r
\r
  const onFocusIn = (e: FocusEvent) => {\r
    const target = e.target as Node | null;\r
    if (performance.now() - st.pressedAt < 800) return;\r
    st.focused = true;\r
    const it = st.items.find(item => item.el.contains(target));\r
    if (it && st.geo) {\r
      const u = -st.offset - st.geo.lead + it.center - st.length / 2;\r
      const comfortable = st.geo.mode === 'orbit' ? 1 : Math.max(0, st.length / 2 - it.size);\r
      if (Math.abs(u) > comfortable) {\r
        st.move = null;\r
        st.seek = { from: st.offset, delta: u, t: 0, dur: clamp(0.35 + Math.abs(u) / 2000, 0.35, 0.8) };\r
      }\r
    }\r
    wake();\r
  };\r
\r
  const onFocusOut = (e: FocusEvent) => {\r
    if (root.contains(e.relatedTarget as Node | null)) return;\r
    st.focused = false;\r
    wake();\r
  };\r
\r
  const onRootScroll = () => {\r
    if (root.scrollLeft || root.scrollTop) {\r
      root.scrollLeft = 0;\r
      root.scrollTop = 0;\r
    }\r
  };\r
\r
  const onScroll = () => {\r
    const now = performance.now();\r
    const y = window.scrollY;\r
    if (st.scrollT && now > st.scrollT) {\r
      const v = ((y - st.scrollY) / (now - st.scrollT)) * 1000;\r
      st.scrollVel += (clamp(v, -6000, 6000) - st.scrollVel) * 0.5;\r
    }\r
    st.scrollY = y;\r
    st.scrollT = now;\r
    if (config.current.scrollBoost > 0) wake();\r
  };\r
\r
  const onMotion = () => {\r
    st.reduced = !!query?.matches;\r
    wake();\r
  };\r
\r
  root.addEventListener('pointerenter', onEnter);\r
  root.addEventListener('pointerleave', onLeave);\r
  root.addEventListener('pointerdown', onDown);\r
  root.addEventListener('pointermove', onMove);\r
  root.addEventListener('pointerup', onUp);\r
  root.addEventListener('pointercancel', onCancel);\r
  root.addEventListener('lostpointercapture', onCancel);\r
  root.addEventListener('click', onClick, true);\r
  root.addEventListener('dragstart', onDragStart);\r
  root.addEventListener('focusin', onFocusIn);\r
  root.addEventListener('focusout', onFocusOut);\r
  root.addEventListener('scroll', onRootScroll);\r
  window.addEventListener('scroll', onScroll, { passive: true });\r
  query?.addEventListener?.('change', onMotion);\r
\r
  let resizeObserver: ResizeObserver | null = null;\r
  const observed = new Set<Element>();\r
  const refresh = () => {\r
    collect();\r
    measure();\r
    if (resizeObserver) {\r
      const first = track.children[0];\r
      for (const el of [root, first]) {\r
        if (el && !observed.has(el)) {\r
          resizeObserver.observe(el);\r
          observed.add(el);\r
        }\r
      }\r
    }\r
    st.last = 0;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    st.raf = 0;\r
    if (st.geo && st.period > 0) frame(performance.now());\r
  };\r
\r
  if (typeof ResizeObserver !== 'undefined') {\r
    resizeObserver = new ResizeObserver(() => {\r
      measure();\r
      if (st.geo && st.period > 0) render(performance.now());\r
      wake();\r
    });\r
  } else {\r
    window.addEventListener('resize', refresh);\r
  }\r
\r
  let intersection: IntersectionObserver | null = null;\r
  if (typeof IntersectionObserver !== 'undefined') {\r
    intersection = new IntersectionObserver(\r
      entries => {\r
        const entry = entries[entries.length - 1];\r
        st.visible = entry.isIntersecting;\r
        if (st.visible) wake();\r
      },\r
      { threshold: 0.1 }\r
    );\r
    intersection.observe(root);\r
  }\r
\r
  const onVisibility = () => {\r
    if (!document.hidden) wake();\r
  };\r
  document.addEventListener('visibilitychange', onVisibility);\r
\r
  const destroy = () => {\r
    st.destroyed = true;\r
    if (st.raf) cancelAnimationFrame(st.raf);\r
    root.removeEventListener('pointerenter', onEnter);\r
    root.removeEventListener('pointerleave', onLeave);\r
    root.removeEventListener('pointerdown', onDown);\r
    root.removeEventListener('pointermove', onMove);\r
    root.removeEventListener('pointerup', onUp);\r
    root.removeEventListener('pointercancel', onCancel);\r
    root.removeEventListener('lostpointercapture', onCancel);\r
    root.removeEventListener('click', onClick, true);\r
    root.removeEventListener('dragstart', onDragStart);\r
    root.removeEventListener('focusin', onFocusIn);\r
    root.removeEventListener('focusout', onFocusOut);\r
    root.removeEventListener('scroll', onRootScroll);\r
    window.removeEventListener('scroll', onScroll);\r
    window.removeEventListener('resize', refresh);\r
    document.removeEventListener('visibilitychange', onVisibility);\r
    query?.removeEventListener?.('change', onMotion);\r
    resizeObserver?.disconnect();\r
    intersection?.disconnect();\r
  };\r
\r
  return { refresh, wake, destroy, state: st };\r
};\r
\r
export const LogoLoop = memo<LogoLoopProps>(\r
  ({\r
    logos,\r
    speed = 120,\r
    direction = 'left',\r
    width = '100%',\r
    logoHeight = 28,\r
    gap = 32,\r
    pauseOnHover,\r
    hoverSpeed,\r
    fadeOut = true,\r
    fadeOutWidth = 0.12,\r
    scaleOnHover = false,\r
    layout = 'line',\r
    bend = 0.5,\r
    focus = 0,\r
    magnify = 0,\r
    tiltX = 0,\r
    tiltY = 0,\r
    step = false,\r
    muted = 0,\r
    labels = 'none',\r
    draggable = true,\r
    scrollBoost = 0,\r
    intro = true,\r
    renderItem,\r
    ariaLabel = 'Partner logos',\r
    className,\r
    style\r
  }) => {\r
    const rootRef = useRef<HTMLDivElement>(null);\r
    const trackRef = useRef<HTMLDivElement>(null);\r
    const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);\r
    const [{ copies, primary }, setLayout] = useState<LoopLayout>({ copies: 3, primary: 1 });\r
    const [introPending] = useState(intro);\r
\r
    const vertical = direction === 'up' || direction === 'down';\r
    const config = useRef<LoopConfig>({} as LoopConfig);\r
    config.current = {\r
      speed,\r
      dirSign: (vertical ? direction === 'up' : direction !== 'right') ? 1 : -1,\r
      hoverValue: hoverSpeed !== undefined ? hoverSpeed : pauseOnHover === false ? undefined : 0,\r
      vertical,\r
      layout,\r
      bend,\r
      focus,\r
      magnify,\r
      tiltX,\r
      tiltY,\r
      step,\r
      draggable,\r
      scrollBoost,\r
      intro,\r
      scaleOnHover,\r
      labels,\r
      links: logos.some(item => item.href)\r
    };\r
\r
    useIsomorphicLayoutEffect(() => {\r
      const engine = createEngine(\r
        rootRef.current as HTMLDivElement,\r
        trackRef.current as HTMLDivElement,\r
        config,\r
        setLayout\r
      );\r
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
      copies,\r
      primary,\r
      logos,\r
      vertical,\r
      logoHeight,\r
      gap,\r
      labels,\r
      layout,\r
      bend,\r
      focus,\r
      magnify,\r
      tiltX,\r
      tiltY,\r
      scaleOnHover\r
    ]);\r
\r
    useEffect(() => {\r
      engineRef.current?.wake();\r
    });\r
\r
    const amount = clamp(muted, 0, 1);\r
    const isMuted = amount > 0;\r
\r
    const lists = useMemo(() => {\r
      const itemClass = cx(\r
        'group/item relative flex-none text-[length:var(--logoloop-logoHeight)] leading-none group-data-[intro]/loop:opacity-0',\r
        vertical ? 'mb-[var(--logoloop-gap)]' : 'mr-[var(--logoloop-gap)]'\r
      );\r
      const contentClass = (item: LogoItem) =>\r
        cx(\r
          'inline-flex items-center rounded text-inherit no-underline transition-[opacity,filter,color] duration-[350ms] ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none',\r
          labels === 'below'\r
            ? 'flex-col gap-[calc(var(--logoloop-logoHeight)*0.22)]'\r
            : 'gap-[calc(var(--logoloop-logoHeight)*0.3)]',\r
          isMuted &&\r
            '[filter:grayscale(var(--logoloop-gray))] opacity-[var(--logoloop-dim)] group-hover/item:[filter:none] group-hover/item:opacity-100 group-focus-within/item:[filter:none] group-focus-within/item:opacity-100 group-data-[active]/item:[filter:none] group-data-[active]/item:opacity-100',\r
          item.hoverColor &&\r
            'group-hover/item:text-[var(--logoloop-item-color)] group-focus-within/item:text-[var(--logoloop-item-color)] group-data-[active]/item:text-[var(--logoloop-item-color)]',\r
          !isMuted && !item.hoverColor && !!item.href && 'hover:opacity-80'\r
        );\r
      const zoomClass = cx(\r
        'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',\r
        scaleOnHover && 'group-hover/item:scale-120'\r
      );\r
      const labelClass =\r
        labels === 'below'\r
          ? 'whitespace-nowrap text-[length:max(11px,calc(var(--logoloop-logoHeight)*0.26))] font-medium leading-[1.2] opacity-[0.72]'\r
          : 'whitespace-nowrap text-[length:max(12px,calc(var(--logoloop-logoHeight)*0.5))] font-semibold leading-[1.2] tracking-[-0.01em]';\r
      const tipClass = cx(\r
        'pointer-events-none absolute whitespace-nowrap text-[length:max(11px,calc(var(--logoloop-logoHeight)*0.26))] font-medium leading-[1.2] opacity-0 transition-[opacity,translate] duration-[250ms] ease-[ease] motion-reduce:transition-none group-hover/item:opacity-80 group-focus-within/item:opacity-80 group-data-[active]/item:opacity-80',\r
        vertical\r
          ? 'left-full top-1/2 ml-[calc(var(--logoloop-logoHeight)*0.25)] [translate:4px_-50%] group-hover/item:[translate:0_-50%] group-focus-within/item:[translate:0_-50%] group-data-[active]/item:[translate:0_-50%]'\r
          : 'left-1/2 top-full mt-[calc(var(--logoloop-logoHeight)*0.2)] [translate:-50%_4px] group-hover/item:[translate:-50%_0] group-focus-within/item:[translate:-50%_0] group-data-[active]/item:[translate:-50%_0]'\r
      );\r
      return Array.from({ length: copies }, (_, copyIndex) => {\r
        const isPrimary = copyIndex === primary;\r
        return (\r
          <ul\r
            className={cx('m-0 flex list-none items-center p-0', vertical && 'flex-col')}\r
            key={copyIndex}\r
            role="list"\r
            aria-hidden={isPrimary ? undefined : true}\r
          >\r
            {logos.map((item, itemIndex) => {\r
              const key = \`\${copyIndex}-\${itemIndex}\`;\r
              const isNode = 'node' in item;\r
              const visual = renderItem ? (\r
                renderItem(item, key)\r
              ) : isNode ? (\r
                <span\r
                  className={cx('inline-flex items-center', zoomClass)}\r
                  aria-hidden={!!item.href && !item.ariaLabel}\r
                >\r
                  {item.node}\r
                </span>\r
              ) : (\r
                <img\r
                  className={cx(\r
                    'pointer-events-none block h-[var(--logoloop-logoHeight)] w-auto object-contain [-webkit-user-drag:none] [image-rendering:-webkit-optimize-contrast]',\r
                    zoomClass\r
                  )}\r
                  src={item.src}\r
                  srcSet={item.srcSet}\r
                  sizes={item.sizes}\r
                  width={item.width}\r
                  height={item.height}\r
                  alt={item.alt ?? ''}\r
                  title={item.title}\r
                  loading="lazy"\r
                  decoding="async"\r
                  draggable={false}\r
                />\r
              );\r
              const text = (labels === 'inline' || labels === 'below') && item.title ? item.title : null;\r
              const inner = (\r
                <>\r
                  {visual}\r
                  {text && (\r
                    <span className={labelClass} aria-hidden={!isNode && !!item.alt}>\r
                      {text}\r
                    </span>\r
                  )}\r
                </>\r
              );\r
              const name = isNode ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);\r
              return (\r
                <li\r
                  className={itemClass}\r
                  key={key}\r
                  role="listitem"\r
                  data-color={item.hoverColor ? '' : undefined}\r
                  style={\r
                    item.hoverColor ? ({ '--logoloop-item-color': item.hoverColor } as React.CSSProperties) : undefined\r
                  }\r
                >\r
                  {item.href ? (\r
                    <a\r
                      className={contentClass(item)}\r
                      href={item.href}\r
                      aria-label={name || 'logo link'}\r
                      target="_blank"\r
                      rel="noreferrer noopener"\r
                      draggable={false}\r
                      tabIndex={isPrimary ? undefined : -1}\r
                    >\r
                      {inner}\r
                    </a>\r
                  ) : (\r
                    <div className={contentClass(item)}>{inner}</div>\r
                  )}\r
                  {labels === 'hover' && item.title && (\r
                    <span className={tipClass} aria-hidden="true">\r
                      {item.title}\r
                    </span>\r
                  )}\r
                </li>\r
              );\r
            })}\r
          </ul>\r
        );\r
      });\r
    }, [copies, primary, logos, renderItem, labels, vertical, scaleOnHover, isMuted]);\r
\r
    const mask = fadeOut ? fadeMask(fadeOutWidth, vertical) : undefined;\r
\r
    const containerStyle = {\r
      width: vertical\r
        ? toCssLength(width) === '100%'\r
          ? undefined\r
          : toCssLength(width)\r
        : (toCssLength(width) ?? '100%'),\r
      '--logoloop-gap': \`\${gap}px\`,\r
      '--logoloop-logoHeight': \`\${logoHeight}px\`,\r
      ...(amount > 0 && {\r
        '--logoloop-gray': Math.min(1, amount * 2).toFixed(3),\r
        '--logoloop-dim': (1 - amount * 0.6).toFixed(3)\r
      }),\r
      ...(mask && { WebkitMaskImage: mask, maskImage: mask }),\r
      ...style\r
    } as React.CSSProperties;\r
\r
    const rootClassName = cx(\r
      'group/loop relative overflow-hidden [-webkit-tap-highlight-color:transparent]',\r
      vertical ? 'inline-block h-full px-[var(--logoloop-pad)]' : 'py-[var(--logoloop-pad)]',\r
      draggable && 'cursor-grab data-[dragging]:cursor-grabbing [&[data-dragging]_*]:cursor-grabbing',\r
      draggable && (vertical ? '[touch-action:pan-x_pinch-zoom]' : '[touch-action:pan-y_pinch-zoom]'),\r
      className\r
    );\r
\r
    return (\r
      <div\r
        ref={rootRef}\r
        className={rootClassName}\r
        style={containerStyle}\r
        role="region"\r
        aria-label={ariaLabel}\r
        data-intro={introPending ? '' : undefined}\r
        data-draggable={draggable ? '' : undefined}\r
        data-muted={amount > 0 ? '' : undefined}\r
        data-labels={labels !== 'none' ? labels : undefined}\r
      >\r
        <div\r
          className={cx(\r
            'relative z-0 flex select-none will-change-transform [-webkit-user-select:none]',\r
            vertical ? 'h-max w-full flex-col' : 'w-max'\r
          )}\r
          ref={trackRef}\r
        >\r
          {lists}\r
        </div>\r
      </div>\r
    );\r
  }\r
);\r
\r
LogoLoop.displayName = 'LogoLoop';\r
\r
export default LogoLoop;\r
`,s={usage:`import LogoLoop from './LogoLoop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev", hoverColor: "#61dafb" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org", hoverColor: "#3178c6" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com", hoverColor: "#38bdf8" },
];

const imageLogos = [
  { src: "/logos/company1.png", alt: "Company 1", href: "https://company1.com" },
  { src: "/logos/company2.png", alt: "Company 2", href: "https://company2.com" },
  { src: "/logos/company3.png", alt: "Company 3", href: "https://company3.com" },
];

function App() {
  return (
    <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
      <LogoLoop
        logos={techLogos}
        speed={100}
        direction="left"
        logoHeight={48}
        gap={56}
        hoverSpeed={0}
        scaleOnHover
        ariaLabel="Technology partners"
      />

      <LogoLoop
        logos={techLogos}
        layout="orbit"
        bend={0.6}
        magnify={0.6}
        labels="hover"
        muted={0.5}
      />

      <LogoLoop logos={imageLogos} direction="up" focus={0.5} step />
    </div>
  );
}`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:o};export{s as logoLoop};
