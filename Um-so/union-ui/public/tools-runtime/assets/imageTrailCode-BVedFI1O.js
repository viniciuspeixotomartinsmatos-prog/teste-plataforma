const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import { gsap } from 'gsap';\r
\r
import './ImageTrail.css';\r
\r
const lerp = (a, b, n) => (1 - n) * a + n * b;\r
\r
const toCssLength = value => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const createTrail = (container, config) => {\r
  const images = Array.from(container.querySelectorAll('[data-trail-image]')).map(el => ({\r
    el,\r
    inner: el.firstElementChild\r
  }));\r
  const total = images.length;\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const mouse = { x: 0, y: 0 };\r
  const last = { x: 0, y: 0 };\r
  const cache = { x: 0, y: 0 };\r
  const visible = [];\r
  let started = false;\r
  let raf = 0;\r
  let index = -1;\r
  let zIndex = 1;\r
  let active = 0;\r
  let lastAngle = 0;\r
  let destroyed = false;\r
\r
  const settle = () => {\r
    active = Math.max(0, active - 1);\r
    if (!active && !visible.length) zIndex = 1;\r
  };\r
\r
  const retire = img => {\r
    const cfg = config.current;\r
    gsap.to(img.el, {\r
      duration: 0.4,\r
      ease: 'power4',\r
      opacity: 0,\r
      scale: cfg.exitScale,\r
      onComplete: () => {\r
        if (!active && !visible.length) zIndex = 1;\r
      }\r
    });\r
  };\r
\r
  const spawn = () => {\r
    const cfg = config.current;\r
    if (!total) return;\r
    index = (index + 1) % total;\r
    const img = images[index];\r
    const width = img.el.offsetWidth;\r
    const height = img.el.offsetHeight;\r
    const dx = mouse.x - last.x;\r
    const dy = mouse.y - last.y;\r
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;\r
    let fromAngle = gsap.utils.random(-cfg.rotation, cfg.rotation);\r
    let toAngle = fromAngle * 0.4;\r
    if (cfg.alignToMotion) {\r
      fromAngle = lastAngle;\r
      toAngle = angle;\r
      while (toAngle - fromAngle > 180) toAngle -= 360;\r
      while (toAngle - fromAngle < -180) toAngle += 360;\r
      lastAngle = toAngle;\r
    }\r
    const scale = 1 + gsap.utils.random(-0.5, 0.6) * cfg.sizeVariance;\r
    const box = container.getBoundingClientRect();\r
    const tiltX = box.height ? -((mouse.y - box.height / 2) / (box.height / 2)) * cfg.tilt : 0;\r
    const tiltY = box.width ? ((mouse.x - box.width / 2) / (box.width / 2)) * cfg.tilt : 0;\r
    const drift = cfg.drift > 0;\r
    const slide = drift ? 0.6 * cfg.drift : 0;\r
\r
    ++zIndex;\r
    ++active;\r
    gsap.killTweensOf(img.el);\r
    gsap.killTweensOf(img.inner);\r
    const visibleIndex = visible.indexOf(img);\r
    if (visibleIndex >= 0) visible.splice(visibleIndex, 1);\r
\r
    const timeline = gsap.timeline({ onComplete: settle });\r
    timeline.fromTo(\r
      img.el,\r
      {\r
        opacity: 1,\r
        scale: cfg.appearScale * scale,\r
        zIndex,\r
        x: cache.x - width / 2,\r
        y: cache.y - height / 2,\r
        rotation: fromAngle,\r
        rotationX: tiltX * 0.5,\r
        rotationY: tiltY * 0.5\r
      },\r
      {\r
        duration: drift ? 0.9 : 0.4,\r
        ease: drift ? 'power2' : 'power1',\r
        scale,\r
        x: mouse.x - width / 2 + dx * slide,\r
        y: mouse.y - height / 2 + dy * slide,\r
        rotation: toAngle,\r
        rotationX: tiltX,\r
        rotationY: tiltY\r
      },\r
      0\r
    );\r
    if (cfg.zoom !== 1 || cfg.flash > 0) {\r
      timeline.fromTo(\r
        img.inner,\r
        { scale: cfg.zoom, filter: \`brightness(\${1 + cfg.flash * 1.5})\` },\r
        { duration: 0.5, ease: 'power1', scale: 1, filter: 'brightness(1)' },\r
        0\r
      );\r
    }\r
\r
    if (cfg.stack > 0) {\r
      visible.push(img);\r
      const keep = Math.max(1, Math.min(Math.round(cfg.stack), total - 1));\r
      while (visible.length > keep) {\r
        const old = visible.shift();\r
        if (old) retire(old);\r
      }\r
      return;\r
    }\r
\r
    timeline.to(\r
      img.el,\r
      {\r
        duration: 0.4,\r
        ease: drift ? 'expo' : 'power3',\r
        opacity: 0,\r
        scale: cfg.exitScale * scale\r
      },\r
      cfg.lifetime\r
    );\r
    if (drift) {\r
      timeline.to(\r
        img.el,\r
        {\r
          duration: 1.5,\r
          ease: 'power4',\r
          x: \`+=\${dx * cfg.drift * 1.2}\`,\r
          y: \`+=\${dy * cfg.drift * 1.2}\`\r
        },\r
        cfg.lifetime\r
      );\r
    }\r
  };\r
\r
  const loop = () => {\r
    raf = 0;\r
    if (destroyed) return;\r
    const cfg = config.current;\r
    cache.x = lerp(cache.x, mouse.x, 0.1);\r
    cache.y = lerp(cache.y, mouse.y, 0.1);\r
    if (!query?.matches && Math.hypot(mouse.x - last.x, mouse.y - last.y) > cfg.threshold) {\r
      spawn();\r
      last.x = mouse.x;\r
      last.y = mouse.y;\r
    }\r
    if (Math.abs(cache.x - mouse.x) > 0.5 || Math.abs(cache.y - mouse.y) > 0.5) {\r
      raf = requestAnimationFrame(loop);\r
    }\r
  };\r
\r
  const onMove = e => {\r
    const rect = container.getBoundingClientRect();\r
    const point = 'touches' in e ? e.touches[0] : e;\r
    if (!point) return;\r
    mouse.x = point.clientX - rect.left;\r
    mouse.y = point.clientY - rect.top;\r
    if (!started) {\r
      started = true;\r
      cache.x = last.x = mouse.x;\r
      cache.y = last.y = mouse.y;\r
    }\r
    if (!raf) raf = requestAnimationFrame(loop);\r
  };\r
\r
  container.addEventListener('mousemove', onMove);\r
  container.addEventListener('touchmove', onMove, { passive: true });\r
\r
  return () => {\r
    destroyed = true;\r
    if (raf) cancelAnimationFrame(raf);\r
    container.removeEventListener('mousemove', onMove);\r
    container.removeEventListener('touchmove', onMove);\r
    images.forEach(img => {\r
      gsap.killTweensOf(img.el);\r
      gsap.killTweensOf(img.inner);\r
    });\r
  };\r
};\r
\r
export default function ImageTrail({\r
  items = [],\r
  size = 190,\r
  aspectRatio = 1.1,\r
  radius = 15,\r
  threshold = 80,\r
  lifetime = 0.4,\r
  appearScale = 1,\r
  zoom = 1,\r
  flash = 0,\r
  exitScale = 0.2,\r
  drift = 0,\r
  rotation = 0,\r
  sizeVariance = 0,\r
  alignToMotion = false,\r
  stack = 0,\r
  tilt = 0,\r
  className = ''\r
}) {\r
  const containerRef = useRef(null);\r
  const config = useRef(null);\r
  config.current = {\r
    threshold,\r
    lifetime,\r
    appearScale,\r
    zoom,\r
    flash,\r
    exitScale,\r
    drift,\r
    rotation,\r
    sizeVariance,\r
    alignToMotion,\r
    stack,\r
    tilt\r
  };\r
\r
  useEffect(() => {\r
    if (!containerRef.current) return;\r
    return createTrail(containerRef.current, config);\r
  }, [items]);\r
\r
  return (\r
    <div\r
      className={\`content \${className}\`.trim()}\r
      ref={containerRef}\r
      style={{\r
        '--trail-size': toCssLength(size),\r
        '--trail-aspect': String(aspectRatio),\r
        '--trail-radius': toCssLength(radius),\r
        perspective: tilt ? '1000px' : undefined\r
      }}\r
    >\r
      {items.map((url, i) => (\r
        <div className="content__img" data-trail-image="" key={i}>\r
          <div className="content__img-inner" style={{ backgroundImage: \`url(\${url})\` }} />\r
        </div>\r
      ))}\r
    </div>\r
  );\r
}\r
`,r=`.content {\r
  width: 100%;\r
  height: 100%;\r
  position: relative;\r
  z-index: 100;\r
  border-radius: 8px;\r
  background: transparent;\r
  overflow: visible;\r
}\r
\r
.content__img {\r
  width: var(--trail-size, 190px);\r
  aspect-ratio: var(--trail-aspect, 1.1);\r
  border-radius: var(--trail-radius, 15px);\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  opacity: 0;\r
  overflow: hidden;\r
  pointer-events: none;\r
  will-change: transform, filter;\r
}\r
\r
.content__img-inner {\r
  background-position: 50% 50%;\r
  width: calc(100% + 20px);\r
  height: calc(100% + 20px);\r
  background-size: cover;\r
  position: absolute;\r
  top: calc(-1 * 20px / 2);\r
  left: calc(-1 * 20px / 2);\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import { gsap } from 'gsap';\r
\r
const lerp = (a, b, n) => (1 - n) * a + n * b;\r
\r
const toCssLength = value => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const createTrail = (container, config) => {\r
  const images = Array.from(container.querySelectorAll('[data-trail-image]')).map(el => ({\r
    el,\r
    inner: el.firstElementChild\r
  }));\r
  const total = images.length;\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const mouse = { x: 0, y: 0 };\r
  const last = { x: 0, y: 0 };\r
  const cache = { x: 0, y: 0 };\r
  const visible = [];\r
  let started = false;\r
  let raf = 0;\r
  let index = -1;\r
  let zIndex = 1;\r
  let active = 0;\r
  let lastAngle = 0;\r
  let destroyed = false;\r
\r
  const settle = () => {\r
    active = Math.max(0, active - 1);\r
    if (!active && !visible.length) zIndex = 1;\r
  };\r
\r
  const retire = img => {\r
    const cfg = config.current;\r
    gsap.to(img.el, {\r
      duration: 0.4,\r
      ease: 'power4',\r
      opacity: 0,\r
      scale: cfg.exitScale,\r
      onComplete: () => {\r
        if (!active && !visible.length) zIndex = 1;\r
      }\r
    });\r
  };\r
\r
  const spawn = () => {\r
    const cfg = config.current;\r
    if (!total) return;\r
    index = (index + 1) % total;\r
    const img = images[index];\r
    const width = img.el.offsetWidth;\r
    const height = img.el.offsetHeight;\r
    const dx = mouse.x - last.x;\r
    const dy = mouse.y - last.y;\r
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;\r
    let fromAngle = gsap.utils.random(-cfg.rotation, cfg.rotation);\r
    let toAngle = fromAngle * 0.4;\r
    if (cfg.alignToMotion) {\r
      fromAngle = lastAngle;\r
      toAngle = angle;\r
      while (toAngle - fromAngle > 180) toAngle -= 360;\r
      while (toAngle - fromAngle < -180) toAngle += 360;\r
      lastAngle = toAngle;\r
    }\r
    const scale = 1 + gsap.utils.random(-0.5, 0.6) * cfg.sizeVariance;\r
    const box = container.getBoundingClientRect();\r
    const tiltX = box.height ? -((mouse.y - box.height / 2) / (box.height / 2)) * cfg.tilt : 0;\r
    const tiltY = box.width ? ((mouse.x - box.width / 2) / (box.width / 2)) * cfg.tilt : 0;\r
    const drift = cfg.drift > 0;\r
    const slide = drift ? 0.6 * cfg.drift : 0;\r
\r
    ++zIndex;\r
    ++active;\r
    gsap.killTweensOf(img.el);\r
    gsap.killTweensOf(img.inner);\r
    const visibleIndex = visible.indexOf(img);\r
    if (visibleIndex >= 0) visible.splice(visibleIndex, 1);\r
\r
    const timeline = gsap.timeline({ onComplete: settle });\r
    timeline.fromTo(\r
      img.el,\r
      {\r
        opacity: 1,\r
        scale: cfg.appearScale * scale,\r
        zIndex,\r
        x: cache.x - width / 2,\r
        y: cache.y - height / 2,\r
        rotation: fromAngle,\r
        rotationX: tiltX * 0.5,\r
        rotationY: tiltY * 0.5\r
      },\r
      {\r
        duration: drift ? 0.9 : 0.4,\r
        ease: drift ? 'power2' : 'power1',\r
        scale,\r
        x: mouse.x - width / 2 + dx * slide,\r
        y: mouse.y - height / 2 + dy * slide,\r
        rotation: toAngle,\r
        rotationX: tiltX,\r
        rotationY: tiltY\r
      },\r
      0\r
    );\r
    if (cfg.zoom !== 1 || cfg.flash > 0) {\r
      timeline.fromTo(\r
        img.inner,\r
        { scale: cfg.zoom, filter: \`brightness(\${1 + cfg.flash * 1.5})\` },\r
        { duration: 0.5, ease: 'power1', scale: 1, filter: 'brightness(1)' },\r
        0\r
      );\r
    }\r
\r
    if (cfg.stack > 0) {\r
      visible.push(img);\r
      const keep = Math.max(1, Math.min(Math.round(cfg.stack), total - 1));\r
      while (visible.length > keep) {\r
        const old = visible.shift();\r
        if (old) retire(old);\r
      }\r
      return;\r
    }\r
\r
    timeline.to(\r
      img.el,\r
      {\r
        duration: 0.4,\r
        ease: drift ? 'expo' : 'power3',\r
        opacity: 0,\r
        scale: cfg.exitScale * scale\r
      },\r
      cfg.lifetime\r
    );\r
    if (drift) {\r
      timeline.to(\r
        img.el,\r
        {\r
          duration: 1.5,\r
          ease: 'power4',\r
          x: \`+=\${dx * cfg.drift * 1.2}\`,\r
          y: \`+=\${dy * cfg.drift * 1.2}\`\r
        },\r
        cfg.lifetime\r
      );\r
    }\r
  };\r
\r
  const loop = () => {\r
    raf = 0;\r
    if (destroyed) return;\r
    const cfg = config.current;\r
    cache.x = lerp(cache.x, mouse.x, 0.1);\r
    cache.y = lerp(cache.y, mouse.y, 0.1);\r
    if (!query?.matches && Math.hypot(mouse.x - last.x, mouse.y - last.y) > cfg.threshold) {\r
      spawn();\r
      last.x = mouse.x;\r
      last.y = mouse.y;\r
    }\r
    if (Math.abs(cache.x - mouse.x) > 0.5 || Math.abs(cache.y - mouse.y) > 0.5) {\r
      raf = requestAnimationFrame(loop);\r
    }\r
  };\r
\r
  const onMove = e => {\r
    const rect = container.getBoundingClientRect();\r
    const point = 'touches' in e ? e.touches[0] : e;\r
    if (!point) return;\r
    mouse.x = point.clientX - rect.left;\r
    mouse.y = point.clientY - rect.top;\r
    if (!started) {\r
      started = true;\r
      cache.x = last.x = mouse.x;\r
      cache.y = last.y = mouse.y;\r
    }\r
    if (!raf) raf = requestAnimationFrame(loop);\r
  };\r
\r
  container.addEventListener('mousemove', onMove);\r
  container.addEventListener('touchmove', onMove, { passive: true });\r
\r
  return () => {\r
    destroyed = true;\r
    if (raf) cancelAnimationFrame(raf);\r
    container.removeEventListener('mousemove', onMove);\r
    container.removeEventListener('touchmove', onMove);\r
    images.forEach(img => {\r
      gsap.killTweensOf(img.el);\r
      gsap.killTweensOf(img.inner);\r
    });\r
  };\r
};\r
\r
export default function ImageTrail({\r
  items = [],\r
  size = 190,\r
  aspectRatio = 1.1,\r
  radius = 15,\r
  threshold = 80,\r
  lifetime = 0.4,\r
  appearScale = 1,\r
  zoom = 1,\r
  flash = 0,\r
  exitScale = 0.2,\r
  drift = 0,\r
  rotation = 0,\r
  sizeVariance = 0,\r
  alignToMotion = false,\r
  stack = 0,\r
  tilt = 0,\r
  className = ''\r
}) {\r
  const containerRef = useRef(null);\r
  const config = useRef(null);\r
  config.current = {\r
    threshold,\r
    lifetime,\r
    appearScale,\r
    zoom,\r
    flash,\r
    exitScale,\r
    drift,\r
    rotation,\r
    sizeVariance,\r
    alignToMotion,\r
    stack,\r
    tilt\r
  };\r
\r
  useEffect(() => {\r
    if (!containerRef.current) return;\r
    return createTrail(containerRef.current, config);\r
  }, [items]);\r
\r
  return (\r
    <div\r
      className={\`relative z-[100] h-full w-full overflow-visible rounded-lg bg-transparent \${className}\`.trim()}\r
      ref={containerRef}\r
      style={{\r
        '--trail-size': toCssLength(size),\r
        '--trail-aspect': String(aspectRatio),\r
        '--trail-radius': toCssLength(radius),\r
        perspective: tilt ? '1000px' : undefined\r
      }}\r
    >\r
      {items.map((url, i) => (\r
        <div\r
          className="pointer-events-none absolute left-0 top-0 aspect-[var(--trail-aspect)] w-[var(--trail-size)] overflow-hidden rounded-[var(--trail-radius)] opacity-0 [will-change:transform,filter]"\r
          data-trail-image=""\r
          key={i}\r
        >\r
          <div\r
            className="absolute left-[-10px] top-[-10px] h-[calc(100%+20px)] w-[calc(100%+20px)] bg-cover bg-center"\r
            style={{ backgroundImage: \`url(\${url})\` }}\r
          />\r
        </div>\r
      ))}\r
    </div>\r
  );\r
}\r
`,t=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
import { gsap } from 'gsap';\r
\r
import './ImageTrail.css';\r
\r
interface ImageTrailProps {\r
  items?: string[];\r
  size?: number | string;\r
  aspectRatio?: number;\r
  radius?: number | string;\r
  threshold?: number;\r
  lifetime?: number;\r
  appearScale?: number;\r
  zoom?: number;\r
  flash?: number;\r
  exitScale?: number;\r
  drift?: number;\r
  rotation?: number;\r
  sizeVariance?: number;\r
  alignToMotion?: boolean;\r
  stack?: number;\r
  tilt?: number;\r
  className?: string;\r
}\r
\r
interface TrailConfig {\r
  threshold: number;\r
  lifetime: number;\r
  appearScale: number;\r
  zoom: number;\r
  flash: number;\r
  exitScale: number;\r
  drift: number;\r
  rotation: number;\r
  sizeVariance: number;\r
  alignToMotion: boolean;\r
  stack: number;\r
  tilt: number;\r
}\r
\r
interface TrailImage {\r
  el: HTMLElement;\r
  inner: HTMLElement;\r
}\r
\r
const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;\r
\r
const toCssLength = (value: number | string) => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const createTrail = (container: HTMLDivElement, config: React.MutableRefObject<TrailConfig>) => {\r
  const images: TrailImage[] = Array.from(container.querySelectorAll<HTMLElement>('[data-trail-image]')).map(el => ({\r
    el,\r
    inner: el.firstElementChild as HTMLElement\r
  }));\r
  const total = images.length;\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const mouse = { x: 0, y: 0 };\r
  const last = { x: 0, y: 0 };\r
  const cache = { x: 0, y: 0 };\r
  const visible: TrailImage[] = [];\r
  let started = false;\r
  let raf = 0;\r
  let index = -1;\r
  let zIndex = 1;\r
  let active = 0;\r
  let lastAngle = 0;\r
  let destroyed = false;\r
\r
  const settle = () => {\r
    active = Math.max(0, active - 1);\r
    if (!active && !visible.length) zIndex = 1;\r
  };\r
\r
  const retire = (img: TrailImage) => {\r
    const cfg = config.current;\r
    gsap.to(img.el, {\r
      duration: 0.4,\r
      ease: 'power4',\r
      opacity: 0,\r
      scale: cfg.exitScale,\r
      onComplete: () => {\r
        if (!active && !visible.length) zIndex = 1;\r
      }\r
    });\r
  };\r
\r
  const spawn = () => {\r
    const cfg = config.current;\r
    if (!total) return;\r
    index = (index + 1) % total;\r
    const img = images[index];\r
    const width = img.el.offsetWidth;\r
    const height = img.el.offsetHeight;\r
    const dx = mouse.x - last.x;\r
    const dy = mouse.y - last.y;\r
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;\r
    let fromAngle = gsap.utils.random(-cfg.rotation, cfg.rotation);\r
    let toAngle = fromAngle * 0.4;\r
    if (cfg.alignToMotion) {\r
      fromAngle = lastAngle;\r
      toAngle = angle;\r
      while (toAngle - fromAngle > 180) toAngle -= 360;\r
      while (toAngle - fromAngle < -180) toAngle += 360;\r
      lastAngle = toAngle;\r
    }\r
    const scale = 1 + gsap.utils.random(-0.5, 0.6) * cfg.sizeVariance;\r
    const box = container.getBoundingClientRect();\r
    const tiltX = box.height ? -((mouse.y - box.height / 2) / (box.height / 2)) * cfg.tilt : 0;\r
    const tiltY = box.width ? ((mouse.x - box.width / 2) / (box.width / 2)) * cfg.tilt : 0;\r
    const drift = cfg.drift > 0;\r
    const slide = drift ? 0.6 * cfg.drift : 0;\r
\r
    ++zIndex;\r
    ++active;\r
    gsap.killTweensOf(img.el);\r
    gsap.killTweensOf(img.inner);\r
    const visibleIndex = visible.indexOf(img);\r
    if (visibleIndex >= 0) visible.splice(visibleIndex, 1);\r
\r
    const timeline = gsap.timeline({ onComplete: settle });\r
    timeline.fromTo(\r
      img.el,\r
      {\r
        opacity: 1,\r
        scale: cfg.appearScale * scale,\r
        zIndex,\r
        x: cache.x - width / 2,\r
        y: cache.y - height / 2,\r
        rotation: fromAngle,\r
        rotationX: tiltX * 0.5,\r
        rotationY: tiltY * 0.5\r
      },\r
      {\r
        duration: drift ? 0.9 : 0.4,\r
        ease: drift ? 'power2' : 'power1',\r
        scale,\r
        x: mouse.x - width / 2 + dx * slide,\r
        y: mouse.y - height / 2 + dy * slide,\r
        rotation: toAngle,\r
        rotationX: tiltX,\r
        rotationY: tiltY\r
      },\r
      0\r
    );\r
    if (cfg.zoom !== 1 || cfg.flash > 0) {\r
      timeline.fromTo(\r
        img.inner,\r
        { scale: cfg.zoom, filter: \`brightness(\${1 + cfg.flash * 1.5})\` },\r
        { duration: 0.5, ease: 'power1', scale: 1, filter: 'brightness(1)' },\r
        0\r
      );\r
    }\r
\r
    if (cfg.stack > 0) {\r
      visible.push(img);\r
      const keep = Math.max(1, Math.min(Math.round(cfg.stack), total - 1));\r
      while (visible.length > keep) {\r
        const old = visible.shift();\r
        if (old) retire(old);\r
      }\r
      return;\r
    }\r
\r
    timeline.to(\r
      img.el,\r
      {\r
        duration: 0.4,\r
        ease: drift ? 'expo' : 'power3',\r
        opacity: 0,\r
        scale: cfg.exitScale * scale\r
      },\r
      cfg.lifetime\r
    );\r
    if (drift) {\r
      timeline.to(\r
        img.el,\r
        {\r
          duration: 1.5,\r
          ease: 'power4',\r
          x: \`+=\${dx * cfg.drift * 1.2}\`,\r
          y: \`+=\${dy * cfg.drift * 1.2}\`\r
        },\r
        cfg.lifetime\r
      );\r
    }\r
  };\r
\r
  const loop = () => {\r
    raf = 0;\r
    if (destroyed) return;\r
    const cfg = config.current;\r
    cache.x = lerp(cache.x, mouse.x, 0.1);\r
    cache.y = lerp(cache.y, mouse.y, 0.1);\r
    if (!query?.matches && Math.hypot(mouse.x - last.x, mouse.y - last.y) > cfg.threshold) {\r
      spawn();\r
      last.x = mouse.x;\r
      last.y = mouse.y;\r
    }\r
    if (Math.abs(cache.x - mouse.x) > 0.5 || Math.abs(cache.y - mouse.y) > 0.5) {\r
      raf = requestAnimationFrame(loop);\r
    }\r
  };\r
\r
  const onMove = (e: MouseEvent | TouchEvent) => {\r
    const rect = container.getBoundingClientRect();\r
    const point = 'touches' in e ? e.touches[0] : e;\r
    if (!point) return;\r
    mouse.x = point.clientX - rect.left;\r
    mouse.y = point.clientY - rect.top;\r
    if (!started) {\r
      started = true;\r
      cache.x = last.x = mouse.x;\r
      cache.y = last.y = mouse.y;\r
    }\r
    if (!raf) raf = requestAnimationFrame(loop);\r
  };\r
\r
  container.addEventListener('mousemove', onMove);\r
  container.addEventListener('touchmove', onMove, { passive: true });\r
\r
  return () => {\r
    destroyed = true;\r
    if (raf) cancelAnimationFrame(raf);\r
    container.removeEventListener('mousemove', onMove);\r
    container.removeEventListener('touchmove', onMove);\r
    images.forEach(img => {\r
      gsap.killTweensOf(img.el);\r
      gsap.killTweensOf(img.inner);\r
    });\r
  };\r
};\r
\r
export default function ImageTrail({\r
  items = [],\r
  size = 190,\r
  aspectRatio = 1.1,\r
  radius = 15,\r
  threshold = 80,\r
  lifetime = 0.4,\r
  appearScale = 1,\r
  zoom = 1,\r
  flash = 0,\r
  exitScale = 0.2,\r
  drift = 0,\r
  rotation = 0,\r
  sizeVariance = 0,\r
  alignToMotion = false,\r
  stack = 0,\r
  tilt = 0,\r
  className = ''\r
}: ImageTrailProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const config = useRef<TrailConfig>({} as TrailConfig);\r
  config.current = {\r
    threshold,\r
    lifetime,\r
    appearScale,\r
    zoom,\r
    flash,\r
    exitScale,\r
    drift,\r
    rotation,\r
    sizeVariance,\r
    alignToMotion,\r
    stack,\r
    tilt\r
  };\r
\r
  useEffect(() => {\r
    if (!containerRef.current) return;\r
    return createTrail(containerRef.current, config);\r
  }, [items]);\r
\r
  return (\r
    <div\r
      className={\`content \${className}\`.trim()}\r
      ref={containerRef}\r
      style={\r
        {\r
          '--trail-size': toCssLength(size),\r
          '--trail-aspect': String(aspectRatio),\r
          '--trail-radius': toCssLength(radius),\r
          perspective: tilt ? '1000px' : undefined\r
        } as React.CSSProperties\r
      }\r
    >\r
      {items.map((url, i) => (\r
        <div className="content__img" data-trail-image="" key={i}>\r
          <div className="content__img-inner" style={{ backgroundImage: \`url(\${url})\` }} />\r
        </div>\r
      ))}\r
    </div>\r
  );\r
}\r
`,i=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
import { gsap } from 'gsap';\r
\r
interface ImageTrailProps {\r
  items?: string[];\r
  size?: number | string;\r
  aspectRatio?: number;\r
  radius?: number | string;\r
  threshold?: number;\r
  lifetime?: number;\r
  appearScale?: number;\r
  zoom?: number;\r
  flash?: number;\r
  exitScale?: number;\r
  drift?: number;\r
  rotation?: number;\r
  sizeVariance?: number;\r
  alignToMotion?: boolean;\r
  stack?: number;\r
  tilt?: number;\r
  className?: string;\r
}\r
\r
interface TrailConfig {\r
  threshold: number;\r
  lifetime: number;\r
  appearScale: number;\r
  zoom: number;\r
  flash: number;\r
  exitScale: number;\r
  drift: number;\r
  rotation: number;\r
  sizeVariance: number;\r
  alignToMotion: boolean;\r
  stack: number;\r
  tilt: number;\r
}\r
\r
interface TrailImage {\r
  el: HTMLElement;\r
  inner: HTMLElement;\r
}\r
\r
const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;\r
\r
const toCssLength = (value: number | string) => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const createTrail = (container: HTMLDivElement, config: React.MutableRefObject<TrailConfig>) => {\r
  const images: TrailImage[] = Array.from(container.querySelectorAll<HTMLElement>('[data-trail-image]')).map(el => ({\r
    el,\r
    inner: el.firstElementChild as HTMLElement\r
  }));\r
  const total = images.length;\r
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;\r
  const mouse = { x: 0, y: 0 };\r
  const last = { x: 0, y: 0 };\r
  const cache = { x: 0, y: 0 };\r
  const visible: TrailImage[] = [];\r
  let started = false;\r
  let raf = 0;\r
  let index = -1;\r
  let zIndex = 1;\r
  let active = 0;\r
  let lastAngle = 0;\r
  let destroyed = false;\r
\r
  const settle = () => {\r
    active = Math.max(0, active - 1);\r
    if (!active && !visible.length) zIndex = 1;\r
  };\r
\r
  const retire = (img: TrailImage) => {\r
    const cfg = config.current;\r
    gsap.to(img.el, {\r
      duration: 0.4,\r
      ease: 'power4',\r
      opacity: 0,\r
      scale: cfg.exitScale,\r
      onComplete: () => {\r
        if (!active && !visible.length) zIndex = 1;\r
      }\r
    });\r
  };\r
\r
  const spawn = () => {\r
    const cfg = config.current;\r
    if (!total) return;\r
    index = (index + 1) % total;\r
    const img = images[index];\r
    const width = img.el.offsetWidth;\r
    const height = img.el.offsetHeight;\r
    const dx = mouse.x - last.x;\r
    const dy = mouse.y - last.y;\r
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;\r
    let fromAngle = gsap.utils.random(-cfg.rotation, cfg.rotation);\r
    let toAngle = fromAngle * 0.4;\r
    if (cfg.alignToMotion) {\r
      fromAngle = lastAngle;\r
      toAngle = angle;\r
      while (toAngle - fromAngle > 180) toAngle -= 360;\r
      while (toAngle - fromAngle < -180) toAngle += 360;\r
      lastAngle = toAngle;\r
    }\r
    const scale = 1 + gsap.utils.random(-0.5, 0.6) * cfg.sizeVariance;\r
    const box = container.getBoundingClientRect();\r
    const tiltX = box.height ? -((mouse.y - box.height / 2) / (box.height / 2)) * cfg.tilt : 0;\r
    const tiltY = box.width ? ((mouse.x - box.width / 2) / (box.width / 2)) * cfg.tilt : 0;\r
    const drift = cfg.drift > 0;\r
    const slide = drift ? 0.6 * cfg.drift : 0;\r
\r
    ++zIndex;\r
    ++active;\r
    gsap.killTweensOf(img.el);\r
    gsap.killTweensOf(img.inner);\r
    const visibleIndex = visible.indexOf(img);\r
    if (visibleIndex >= 0) visible.splice(visibleIndex, 1);\r
\r
    const timeline = gsap.timeline({ onComplete: settle });\r
    timeline.fromTo(\r
      img.el,\r
      {\r
        opacity: 1,\r
        scale: cfg.appearScale * scale,\r
        zIndex,\r
        x: cache.x - width / 2,\r
        y: cache.y - height / 2,\r
        rotation: fromAngle,\r
        rotationX: tiltX * 0.5,\r
        rotationY: tiltY * 0.5\r
      },\r
      {\r
        duration: drift ? 0.9 : 0.4,\r
        ease: drift ? 'power2' : 'power1',\r
        scale,\r
        x: mouse.x - width / 2 + dx * slide,\r
        y: mouse.y - height / 2 + dy * slide,\r
        rotation: toAngle,\r
        rotationX: tiltX,\r
        rotationY: tiltY\r
      },\r
      0\r
    );\r
    if (cfg.zoom !== 1 || cfg.flash > 0) {\r
      timeline.fromTo(\r
        img.inner,\r
        { scale: cfg.zoom, filter: \`brightness(\${1 + cfg.flash * 1.5})\` },\r
        { duration: 0.5, ease: 'power1', scale: 1, filter: 'brightness(1)' },\r
        0\r
      );\r
    }\r
\r
    if (cfg.stack > 0) {\r
      visible.push(img);\r
      const keep = Math.max(1, Math.min(Math.round(cfg.stack), total - 1));\r
      while (visible.length > keep) {\r
        const old = visible.shift();\r
        if (old) retire(old);\r
      }\r
      return;\r
    }\r
\r
    timeline.to(\r
      img.el,\r
      {\r
        duration: 0.4,\r
        ease: drift ? 'expo' : 'power3',\r
        opacity: 0,\r
        scale: cfg.exitScale * scale\r
      },\r
      cfg.lifetime\r
    );\r
    if (drift) {\r
      timeline.to(\r
        img.el,\r
        {\r
          duration: 1.5,\r
          ease: 'power4',\r
          x: \`+=\${dx * cfg.drift * 1.2}\`,\r
          y: \`+=\${dy * cfg.drift * 1.2}\`\r
        },\r
        cfg.lifetime\r
      );\r
    }\r
  };\r
\r
  const loop = () => {\r
    raf = 0;\r
    if (destroyed) return;\r
    const cfg = config.current;\r
    cache.x = lerp(cache.x, mouse.x, 0.1);\r
    cache.y = lerp(cache.y, mouse.y, 0.1);\r
    if (!query?.matches && Math.hypot(mouse.x - last.x, mouse.y - last.y) > cfg.threshold) {\r
      spawn();\r
      last.x = mouse.x;\r
      last.y = mouse.y;\r
    }\r
    if (Math.abs(cache.x - mouse.x) > 0.5 || Math.abs(cache.y - mouse.y) > 0.5) {\r
      raf = requestAnimationFrame(loop);\r
    }\r
  };\r
\r
  const onMove = (e: MouseEvent | TouchEvent) => {\r
    const rect = container.getBoundingClientRect();\r
    const point = 'touches' in e ? e.touches[0] : e;\r
    if (!point) return;\r
    mouse.x = point.clientX - rect.left;\r
    mouse.y = point.clientY - rect.top;\r
    if (!started) {\r
      started = true;\r
      cache.x = last.x = mouse.x;\r
      cache.y = last.y = mouse.y;\r
    }\r
    if (!raf) raf = requestAnimationFrame(loop);\r
  };\r
\r
  container.addEventListener('mousemove', onMove);\r
  container.addEventListener('touchmove', onMove, { passive: true });\r
\r
  return () => {\r
    destroyed = true;\r
    if (raf) cancelAnimationFrame(raf);\r
    container.removeEventListener('mousemove', onMove);\r
    container.removeEventListener('touchmove', onMove);\r
    images.forEach(img => {\r
      gsap.killTweensOf(img.el);\r
      gsap.killTweensOf(img.inner);\r
    });\r
  };\r
};\r
\r
export default function ImageTrail({\r
  items = [],\r
  size = 190,\r
  aspectRatio = 1.1,\r
  radius = 15,\r
  threshold = 80,\r
  lifetime = 0.4,\r
  appearScale = 1,\r
  zoom = 1,\r
  flash = 0,\r
  exitScale = 0.2,\r
  drift = 0,\r
  rotation = 0,\r
  sizeVariance = 0,\r
  alignToMotion = false,\r
  stack = 0,\r
  tilt = 0,\r
  className = ''\r
}: ImageTrailProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const config = useRef<TrailConfig>({} as TrailConfig);\r
  config.current = {\r
    threshold,\r
    lifetime,\r
    appearScale,\r
    zoom,\r
    flash,\r
    exitScale,\r
    drift,\r
    rotation,\r
    sizeVariance,\r
    alignToMotion,\r
    stack,\r
    tilt\r
  };\r
\r
  useEffect(() => {\r
    if (!containerRef.current) return;\r
    return createTrail(containerRef.current, config);\r
  }, [items]);\r
\r
  return (\r
    <div\r
      className={\`relative z-[100] h-full w-full overflow-visible rounded-lg bg-transparent \${className}\`.trim()}\r
      ref={containerRef}\r
      style={\r
        {\r
          '--trail-size': toCssLength(size),\r
          '--trail-aspect': String(aspectRatio),\r
          '--trail-radius': toCssLength(radius),\r
          perspective: tilt ? '1000px' : undefined\r
        } as React.CSSProperties\r
      }\r
    >\r
      {items.map((url, i) => (\r
        <div\r
          className="pointer-events-none absolute left-0 top-0 aspect-[var(--trail-aspect)] w-[var(--trail-size)] overflow-hidden rounded-[var(--trail-radius)] opacity-0 [will-change:transform,filter]"\r
          data-trail-image=""\r
          key={i}\r
        >\r
          <div\r
            className="absolute left-[-10px] top-[-10px] h-[calc(100%+20px)] w-[calc(100%+20px)] bg-cover bg-center"\r
            style={{ backgroundImage: \`url(\${url})\` }}\r
          />\r
        </div>\r
      ))}\r
    </div>\r
  );\r
}\r
`,o={dependencies:"gsap",usage:`import ImageTrail from './ImageTrail';

<div style={{ height: '500px', position: 'relative', overflow: 'hidden' }}>
  <ImageTrail
    items={[
      'https://picsum.photos/id/287/300/300',
      'https://picsum.photos/id/1001/300/300',
      'https://picsum.photos/id/1025/300/300',
      'https://picsum.photos/id/1026/300/300',
      'https://picsum.photos/id/1027/300/300',
      'https://picsum.photos/id/1028/300/300',
      'https://picsum.photos/id/1029/300/300',
      'https://picsum.photos/id/1030/300/300'
    ]}
    size={190}
    threshold={80}
    appearScale={0}
    zoom={2.4}
    flash={0.6}
  />
</div>`,code:n,css:r,tailwind:e,tsCode:t,tsTailwind:i};export{o as imageTrail};
