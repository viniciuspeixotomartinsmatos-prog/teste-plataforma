const r=`'use client';\r
\r
import { useEffect, useLayoutEffect, useRef } from 'react';\r
import { gsap } from 'gsap';\r
import { ScrollTrigger } from 'gsap/ScrollTrigger';\r
\r
gsap.registerPlugin(ScrollTrigger);\r
\r
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;\r
\r
const SVG_NS = 'http://www.w3.org/2000/svg';\r
\r
const NOISE_EFFECTS = ['dissolve', 'mist', 'pixel'];\r
\r
const LEVELS = Array.from({ length: 33 }, (_, i) => 1 / (1 + Math.exp(-10.8 * (i / 32 - 0.5))));\r
\r
let maskCount = 0;\r
\r
const toSeconds = value => (typeof value === 'number' && value > 10 ? value / 1000 : value);\r
\r
const clamp01 = value => Math.min(Math.max(value, 0), 1);\r
\r
const smoothstep = (from, to, value) => {\r
  const t = clamp01((value - from) / (to - from));\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const noiseFor = (kind, size) => {\r
  if (kind === 'mist') {\r
    return { frequency: Math.min(Math.max(4 / size, 0.004), 0.02), octaves: 3, edge: 0.35, blur: 10, block: 0 };\r
  }\r
  if (kind === 'pixel') {\r
    const block = 2 * Math.round(Math.min(Math.max(size / 32, 6), 24) / 2);\r
    return { frequency: 0.5 / block, octaves: 1, edge: 0.06, blur: 0, block };\r
  }\r
  return { frequency: 0.6, octaves: 1, edge: 0.15, blur: 0, block: 0 };\r
};\r
\r
const createNoiseMask = (target, kind, floor, extraBlur) => {\r
  const box = target.getBoundingClientRect();\r
  const { frequency, octaves, edge, blur, block } = noiseFor(kind, Math.sqrt(Math.max(box.width * box.height, 1)));\r
  const node = (name, attrs, parent) => {\r
    const child = document.createElementNS(SVG_NS, name);\r
    Object.entries(attrs).forEach(([key, value]) => child.setAttribute(key, String(value)));\r
    parent.appendChild(child);\r
    return child;\r
  };\r
  const svg = node('svg', { width: 0, height: 0, 'aria-hidden': 'true' }, document.body);\r
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';\r
  const id = \`fade-content-mask-\${(maskCount += 1)}\`;\r
  const filter = node(\r
    'filter',\r
    { id, x: '-10%', y: '-10%', width: '120%', height: '120%', 'color-interpolation-filters': 'sRGB' },\r
    svg\r
  );\r
  node(\r
    'feTurbulence',\r
    {\r
      type: 'fractalNoise',\r
      baseFrequency: frequency,\r
      numOctaves: octaves,\r
      seed: Math.floor(Math.random() * 1000),\r
      result: 'noise'\r
    },\r
    filter\r
  );\r
  let source = 'noise';\r
  if (block > 0) {\r
    const dot = block / 2 - 1;\r
    node(\r
      'feColorMatrix',\r
      { in: 'noise', type: 'matrix', values: '1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1', result: 'gray' },\r
      filter\r
    );\r
    node('feFlood', { x: dot, y: dot, width: 2, height: 2, 'flood-color': '#000', result: 'dot' }, filter);\r
    node('feComposite', { in: 'dot', in2: 'dot', width: block, height: block, result: 'cell' }, filter);\r
    node('feTile', { in: 'cell', result: 'grid' }, filter);\r
    node('feComposite', { in: 'gray', in2: 'grid', operator: 'in', result: 'samples' }, filter);\r
    node('feMorphology', { in: 'samples', operator: 'dilate', radius: dot, result: 'blocks' }, filter);\r
    source = 'blocks';\r
  }\r
  node(\r
    'feColorMatrix',\r
    { in: source, type: 'matrix', values: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.43 0 0 0 -0.21' },\r
    filter\r
  );\r
  const curve = node('feFuncA', { type: 'table' }, node('feComponentTransfer', { result: 'mask' }, filter));\r
  node('feComposite', { in: 'SourceGraphic', in2: 'mask', operator: 'in' }, filter);\r
\r
  const url = \`url(#\${id})\`;\r
  const blurFrom = blur + extraBlur;\r
  const state = { progress: 0 };\r
  let drawn = -1;\r
\r
  const render = () => {\r
    const progress = state.progress;\r
    if (progress === drawn) return;\r
    drawn = progress;\r
    if (progress >= 1) {\r
      target.style.filter = '';\r
      target.style.visibility = 'inherit';\r
      return;\r
    }\r
    const front = progress * (1 + 2 * edge) - edge;\r
    curve.setAttribute(\r
      'tableValues',\r
      LEVELS.map(level => (floor + (1 - floor) * (1 - smoothstep(front - edge, front + edge, level))).toFixed(3)).join(\r
        ' '\r
      )\r
    );\r
    target.style.filter = blurFrom > 0 ? \`\${url} blur(\${(blurFrom * (1 - progress)).toFixed(2)}px)\` : url;\r
    target.style.visibility = progress <= 0 && floor <= 0 ? 'hidden' : 'inherit';\r
  };\r
\r
  render();\r
\r
  return {\r
    state,\r
    render,\r
    remove: () => {\r
      svg.remove();\r
      target.style.filter = '';\r
    }\r
  };\r
};\r
\r
const getLooks = (effect, blur, initialOpacity) => {\r
  const soften = amount => \`blur(\${amount}px)\`;\r
  if (effect === 'focus') {\r
    return [\r
      { from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 0.6 },\r
      { from: { filter: soften(12 + blur), scale: 0.97 }, to: { filter: soften(0), scale: 1 }, share: 1 }\r
    ];\r
  }\r
  if (effect === 'develop') {\r
    return [\r
      { from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 0.5 },\r
      {\r
        from: { filter: \`grayscale(1) contrast(0.55) brightness(1.3) \${soften(blur)}\` },\r
        to: { filter: \`grayscale(0) contrast(1) brightness(1) \${soften(0)}\` },\r
        share: 1\r
      }\r
    ];\r
  }\r
  if (blur > 0) {\r
    return [\r
      { from: { autoAlpha: initialOpacity, filter: soften(blur) }, to: { autoAlpha: 1, filter: soften(0) }, share: 1 }\r
    ];\r
  }\r
  return [{ from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 1 }];\r
};\r
\r
const FadeContent = ({\r
  children,\r
  container,\r
  effect = 'fade',\r
  blur = false,\r
  duration = 1,\r
  ease = 'power2.out',\r
  delay = 0,\r
  threshold = 0.1,\r
  initialOpacity = 0,\r
  stagger = 0,\r
  staggerFrom = 'start',\r
  trigger = 'scroll',\r
  once = true,\r
  exit = false,\r
  scrub = false,\r
  disappearAfter = 0,\r
  disappearDuration = 0.5,\r
  disappearEase = 'power2.in',\r
  onStart,\r
  onComplete,\r
  onDisappearanceComplete,\r
  className = '',\r
  style,\r
  ...props\r
}) => {\r
  const ref = useRef(null);\r
  const callbacksRef = useRef({ onStart, onComplete, onDisappearanceComplete });\r
  callbacksRef.current = { onStart, onComplete, onDisappearanceComplete };\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const el = ref.current;\r
    if (!el) return undefined;\r
\r
    const source = container || document.getElementById('snap-main-container') || null;\r
    const scroller = typeof source === 'string' ? document.querySelector(source) : source;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    let masks = [];\r
    let follow = null;\r
\r
    const ctx = gsap.context(() => {\r
      const targets = stagger > 0 && el.children.length ? Array.from(el.children) : [el];\r
      gsap.set(el, { visibility: 'visible' });\r
\r
      if (reduce) {\r
        callbacksRef.current.onComplete?.();\r
        return;\r
      }\r
\r
      const seconds = Math.max(toSeconds(duration) || 0, 0.01);\r
      const blurAmount = blur === true ? 10 : Math.max(Number(blur) || 0, 0);\r
      const startOpacity = clamp01(Number(initialOpacity) || 0);\r
      const staggerVars = stagger > 0 ? { stagger: { each: toSeconds(stagger), from: staggerFrom } } : {};\r
      const noisy = NOISE_EFFECTS.includes(effect);\r
      const looks = noisy ? [] : getLooks(effect, blurAmount, startOpacity);\r
\r
      if (noisy) masks = targets.map(target => createNoiseMask(target, effect, startOpacity, blurAmount));\r
      const proxies = masks.map(mask => mask.state);\r
      const draw = () => masks.forEach(mask => mask.render());\r
\r
      const reveal = (timeline, position) => {\r
        if (noisy) {\r
          timeline.fromTo(\r
            proxies,\r
            { progress: 0 },\r
            { progress: 1, duration: seconds, ease, ...staggerVars, onUpdate: draw },\r
            position\r
          );\r
          return;\r
        }\r
        looks.forEach(look =>\r
          timeline.fromTo(\r
            targets,\r
            look.from,\r
            { ...look.to, duration: seconds * look.share, ease, ...staggerVars },\r
            position\r
          )\r
        );\r
      };\r
\r
      const conceal = (timeline, vars) => {\r
        if (noisy) {\r
          timeline.to(proxies, { progress: 0, ...vars, onUpdate: draw }, 0);\r
          return;\r
        }\r
        looks.forEach(look => timeline.to(targets, { ...look.from, ...vars }, 0));\r
      };\r
\r
      const settle = () => {\r
        if (noisy) {\r
          masks.forEach(mask => mask.remove());\r
          masks = [];\r
          return;\r
        }\r
        gsap.set(targets, { clearProps: 'filter,transform' });\r
      };\r
\r
      const scrubbing = scrub && trigger !== 'mount';\r
      const replaying = !once || exit;\r
      const disappearing = disappearAfter > 0 && !replaying && !scrubbing;\r
\r
      const tl = gsap.timeline({\r
        paused: true,\r
        onStart: () => callbacksRef.current.onStart?.(),\r
        onComplete: () => {\r
          callbacksRef.current.onComplete?.();\r
          if (scrubbing) return;\r
          if (disappearing) {\r
            const out = gsap.timeline({\r
              delay: toSeconds(disappearAfter),\r
              onComplete: () => callbacksRef.current.onDisappearanceComplete?.()\r
            });\r
            conceal(out, {\r
              duration: Math.max(toSeconds(disappearDuration) || 0, 0.01),\r
              ease: disappearEase,\r
              ...staggerVars\r
            });\r
            return;\r
          }\r
          if (!replaying || !noisy) settle();\r
        }\r
      });\r
      reveal(tl, scrubbing ? 0 : Math.max(toSeconds(delay) || 0, 0));\r
\r
      if (trigger === 'mount') {\r
        tl.play();\r
        return;\r
      }\r
\r
      const measure = () => {\r
        const view = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight };\r
        const scrolled = scroller ? scroller.scrollTop : window.scrollY;\r
        const box = el.getBoundingClientRect();\r
        return {\r
          height: view.height,\r
          scrolled,\r
          limit: scroller\r
            ? scroller.scrollHeight - scroller.clientHeight\r
            : document.documentElement.scrollHeight - window.innerHeight,\r
          top: box.top - view.top + scrolled,\r
          bottom: box.bottom - view.top + scrolled\r
        };\r
      };\r
\r
      if (scrubbing) {\r
        const smoothing = scrub === true ? 0 : Math.max(Number(scrub) || 0, 0);\r
        const update = () => {\r
          const { height, scrolled, limit, top, bottom } = measure();\r
          const zone = height * Math.min(Math.max((1 - 2 * threshold) * 0.4, 0.05), 0.4);\r
          const revealed = Math.min(top - height * (1 - threshold) + zone, limit);\r
          let visible = clamp01((scrolled - revealed) / zone + 1);\r
          if (exit) {\r
            const outStart = Math.max(bottom - height * threshold - zone, 0);\r
            const outEnd = Math.max(bottom - height * threshold, outStart + zone / 2);\r
            visible = Math.min(visible, 1 - clamp01((scrolled - outStart) / (outEnd - outStart)));\r
          }\r
          visible = Math.round(visible * 1000) / 1000;\r
          if (smoothing > 0) {\r
            follow = gsap.to(tl, { progress: visible, duration: smoothing, ease: 'power3.out', overwrite: true });\r
          } else {\r
            tl.progress(visible);\r
          }\r
        };\r
        ScrollTrigger.create({\r
          trigger: el,\r
          scroller,\r
          start: 'top bottom',\r
          end: 'bottom top',\r
          onUpdate: update,\r
          onRefresh: update\r
        });\r
        update();\r
        return;\r
      }\r
\r
      ScrollTrigger.create({\r
        trigger: el,\r
        scroller,\r
        start: () => {\r
          const { height, limit, top } = measure();\r
          const start = top - height * (1 - threshold);\r
          return start > limit ? limit - 1 : start;\r
        },\r
        end: exit ? \`bottom \${threshold * 100}%\` : undefined,\r
        once: !replaying,\r
        onEnter: () => tl.play(),\r
        onLeave: exit ? () => tl.reverse() : undefined,\r
        onEnterBack: exit ? () => tl.play() : undefined,\r
        onLeaveBack: once ? undefined : () => tl.reverse()\r
      });\r
    }, el);\r
\r
    return () => {\r
      follow?.kill();\r
      ctx.revert();\r
      masks.forEach(mask => mask.remove());\r
    };\r
  }, [\r
    container,\r
    effect,\r
    blur,\r
    duration,\r
    ease,\r
    delay,\r
    threshold,\r
    initialOpacity,\r
    stagger,\r
    staggerFrom,\r
    trigger,\r
    once,\r
    exit,\r
    scrub,\r
    disappearAfter,\r
    disappearDuration,\r
    disappearEase\r
  ]);\r
\r
  return (\r
    <div ref={ref} className={className} style={{ visibility: 'hidden', ...style }} {...props}>\r
      {children}\r
    </div>\r
  );\r
};\r
\r
export default FadeContent;\r
`,n=`'use client';\r
\r
import { useEffect, useLayoutEffect, useRef } from 'react';\r
import { gsap } from 'gsap';\r
import { ScrollTrigger } from 'gsap/ScrollTrigger';\r
\r
gsap.registerPlugin(ScrollTrigger);\r
\r
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;\r
\r
const SVG_NS = 'http://www.w3.org/2000/svg';\r
\r
const NOISE_EFFECTS = ['dissolve', 'mist', 'pixel'];\r
\r
const LEVELS = Array.from({ length: 33 }, (_, i) => 1 / (1 + Math.exp(-10.8 * (i / 32 - 0.5))));\r
\r
let maskCount = 0;\r
\r
const toSeconds = value => (typeof value === 'number' && value > 10 ? value / 1000 : value);\r
\r
const clamp01 = value => Math.min(Math.max(value, 0), 1);\r
\r
const smoothstep = (from, to, value) => {\r
  const t = clamp01((value - from) / (to - from));\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const noiseFor = (kind, size) => {\r
  if (kind === 'mist') {\r
    return { frequency: Math.min(Math.max(4 / size, 0.004), 0.02), octaves: 3, edge: 0.35, blur: 10, block: 0 };\r
  }\r
  if (kind === 'pixel') {\r
    const block = 2 * Math.round(Math.min(Math.max(size / 32, 6), 24) / 2);\r
    return { frequency: 0.5 / block, octaves: 1, edge: 0.06, blur: 0, block };\r
  }\r
  return { frequency: 0.6, octaves: 1, edge: 0.15, blur: 0, block: 0 };\r
};\r
\r
const createNoiseMask = (target, kind, floor, extraBlur) => {\r
  const box = target.getBoundingClientRect();\r
  const { frequency, octaves, edge, blur, block } = noiseFor(kind, Math.sqrt(Math.max(box.width * box.height, 1)));\r
  const node = (name, attrs, parent) => {\r
    const child = document.createElementNS(SVG_NS, name);\r
    Object.entries(attrs).forEach(([key, value]) => child.setAttribute(key, String(value)));\r
    parent.appendChild(child);\r
    return child;\r
  };\r
  const svg = node('svg', { width: 0, height: 0, 'aria-hidden': 'true' }, document.body);\r
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';\r
  const id = \`fade-content-mask-\${(maskCount += 1)}\`;\r
  const filter = node(\r
    'filter',\r
    { id, x: '-10%', y: '-10%', width: '120%', height: '120%', 'color-interpolation-filters': 'sRGB' },\r
    svg\r
  );\r
  node(\r
    'feTurbulence',\r
    {\r
      type: 'fractalNoise',\r
      baseFrequency: frequency,\r
      numOctaves: octaves,\r
      seed: Math.floor(Math.random() * 1000),\r
      result: 'noise'\r
    },\r
    filter\r
  );\r
  let source = 'noise';\r
  if (block > 0) {\r
    const dot = block / 2 - 1;\r
    node(\r
      'feColorMatrix',\r
      { in: 'noise', type: 'matrix', values: '1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1', result: 'gray' },\r
      filter\r
    );\r
    node('feFlood', { x: dot, y: dot, width: 2, height: 2, 'flood-color': '#000', result: 'dot' }, filter);\r
    node('feComposite', { in: 'dot', in2: 'dot', width: block, height: block, result: 'cell' }, filter);\r
    node('feTile', { in: 'cell', result: 'grid' }, filter);\r
    node('feComposite', { in: 'gray', in2: 'grid', operator: 'in', result: 'samples' }, filter);\r
    node('feMorphology', { in: 'samples', operator: 'dilate', radius: dot, result: 'blocks' }, filter);\r
    source = 'blocks';\r
  }\r
  node(\r
    'feColorMatrix',\r
    { in: source, type: 'matrix', values: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.43 0 0 0 -0.21' },\r
    filter\r
  );\r
  const curve = node('feFuncA', { type: 'table' }, node('feComponentTransfer', { result: 'mask' }, filter));\r
  node('feComposite', { in: 'SourceGraphic', in2: 'mask', operator: 'in' }, filter);\r
\r
  const url = \`url(#\${id})\`;\r
  const blurFrom = blur + extraBlur;\r
  const state = { progress: 0 };\r
  let drawn = -1;\r
\r
  const render = () => {\r
    const progress = state.progress;\r
    if (progress === drawn) return;\r
    drawn = progress;\r
    if (progress >= 1) {\r
      target.style.filter = '';\r
      target.style.visibility = 'inherit';\r
      return;\r
    }\r
    const front = progress * (1 + 2 * edge) - edge;\r
    curve.setAttribute(\r
      'tableValues',\r
      LEVELS.map(level => (floor + (1 - floor) * (1 - smoothstep(front - edge, front + edge, level))).toFixed(3)).join(\r
        ' '\r
      )\r
    );\r
    target.style.filter = blurFrom > 0 ? \`\${url} blur(\${(blurFrom * (1 - progress)).toFixed(2)}px)\` : url;\r
    target.style.visibility = progress <= 0 && floor <= 0 ? 'hidden' : 'inherit';\r
  };\r
\r
  render();\r
\r
  return {\r
    state,\r
    render,\r
    remove: () => {\r
      svg.remove();\r
      target.style.filter = '';\r
    }\r
  };\r
};\r
\r
const getLooks = (effect, blur, initialOpacity) => {\r
  const soften = amount => \`blur(\${amount}px)\`;\r
  if (effect === 'focus') {\r
    return [\r
      { from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 0.6 },\r
      { from: { filter: soften(12 + blur), scale: 0.97 }, to: { filter: soften(0), scale: 1 }, share: 1 }\r
    ];\r
  }\r
  if (effect === 'develop') {\r
    return [\r
      { from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 0.5 },\r
      {\r
        from: { filter: \`grayscale(1) contrast(0.55) brightness(1.3) \${soften(blur)}\` },\r
        to: { filter: \`grayscale(0) contrast(1) brightness(1) \${soften(0)}\` },\r
        share: 1\r
      }\r
    ];\r
  }\r
  if (blur > 0) {\r
    return [\r
      { from: { autoAlpha: initialOpacity, filter: soften(blur) }, to: { autoAlpha: 1, filter: soften(0) }, share: 1 }\r
    ];\r
  }\r
  return [{ from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 1 }];\r
};\r
\r
const FadeContent = ({\r
  children,\r
  container,\r
  effect = 'fade',\r
  blur = false,\r
  duration = 1,\r
  ease = 'power2.out',\r
  delay = 0,\r
  threshold = 0.1,\r
  initialOpacity = 0,\r
  stagger = 0,\r
  staggerFrom = 'start',\r
  trigger = 'scroll',\r
  once = true,\r
  exit = false,\r
  scrub = false,\r
  disappearAfter = 0,\r
  disappearDuration = 0.5,\r
  disappearEase = 'power2.in',\r
  onStart,\r
  onComplete,\r
  onDisappearanceComplete,\r
  className = '',\r
  style,\r
  ...props\r
}) => {\r
  const ref = useRef(null);\r
  const callbacksRef = useRef({ onStart, onComplete, onDisappearanceComplete });\r
  callbacksRef.current = { onStart, onComplete, onDisappearanceComplete };\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const el = ref.current;\r
    if (!el) return undefined;\r
\r
    const source = container || document.getElementById('snap-main-container') || null;\r
    const scroller = typeof source === 'string' ? document.querySelector(source) : source;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    let masks = [];\r
    let follow = null;\r
\r
    const ctx = gsap.context(() => {\r
      const targets = stagger > 0 && el.children.length ? Array.from(el.children) : [el];\r
      gsap.set(el, { visibility: 'visible' });\r
\r
      if (reduce) {\r
        callbacksRef.current.onComplete?.();\r
        return;\r
      }\r
\r
      const seconds = Math.max(toSeconds(duration) || 0, 0.01);\r
      const blurAmount = blur === true ? 10 : Math.max(Number(blur) || 0, 0);\r
      const startOpacity = clamp01(Number(initialOpacity) || 0);\r
      const staggerVars = stagger > 0 ? { stagger: { each: toSeconds(stagger), from: staggerFrom } } : {};\r
      const noisy = NOISE_EFFECTS.includes(effect);\r
      const looks = noisy ? [] : getLooks(effect, blurAmount, startOpacity);\r
\r
      if (noisy) masks = targets.map(target => createNoiseMask(target, effect, startOpacity, blurAmount));\r
      const proxies = masks.map(mask => mask.state);\r
      const draw = () => masks.forEach(mask => mask.render());\r
\r
      const reveal = (timeline, position) => {\r
        if (noisy) {\r
          timeline.fromTo(\r
            proxies,\r
            { progress: 0 },\r
            { progress: 1, duration: seconds, ease, ...staggerVars, onUpdate: draw },\r
            position\r
          );\r
          return;\r
        }\r
        looks.forEach(look =>\r
          timeline.fromTo(\r
            targets,\r
            look.from,\r
            { ...look.to, duration: seconds * look.share, ease, ...staggerVars },\r
            position\r
          )\r
        );\r
      };\r
\r
      const conceal = (timeline, vars) => {\r
        if (noisy) {\r
          timeline.to(proxies, { progress: 0, ...vars, onUpdate: draw }, 0);\r
          return;\r
        }\r
        looks.forEach(look => timeline.to(targets, { ...look.from, ...vars }, 0));\r
      };\r
\r
      const settle = () => {\r
        if (noisy) {\r
          masks.forEach(mask => mask.remove());\r
          masks = [];\r
          return;\r
        }\r
        gsap.set(targets, { clearProps: 'filter,transform' });\r
      };\r
\r
      const scrubbing = scrub && trigger !== 'mount';\r
      const replaying = !once || exit;\r
      const disappearing = disappearAfter > 0 && !replaying && !scrubbing;\r
\r
      const tl = gsap.timeline({\r
        paused: true,\r
        onStart: () => callbacksRef.current.onStart?.(),\r
        onComplete: () => {\r
          callbacksRef.current.onComplete?.();\r
          if (scrubbing) return;\r
          if (disappearing) {\r
            const out = gsap.timeline({\r
              delay: toSeconds(disappearAfter),\r
              onComplete: () => callbacksRef.current.onDisappearanceComplete?.()\r
            });\r
            conceal(out, {\r
              duration: Math.max(toSeconds(disappearDuration) || 0, 0.01),\r
              ease: disappearEase,\r
              ...staggerVars\r
            });\r
            return;\r
          }\r
          if (!replaying || !noisy) settle();\r
        }\r
      });\r
      reveal(tl, scrubbing ? 0 : Math.max(toSeconds(delay) || 0, 0));\r
\r
      if (trigger === 'mount') {\r
        tl.play();\r
        return;\r
      }\r
\r
      const measure = () => {\r
        const view = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight };\r
        const scrolled = scroller ? scroller.scrollTop : window.scrollY;\r
        const box = el.getBoundingClientRect();\r
        return {\r
          height: view.height,\r
          scrolled,\r
          limit: scroller\r
            ? scroller.scrollHeight - scroller.clientHeight\r
            : document.documentElement.scrollHeight - window.innerHeight,\r
          top: box.top - view.top + scrolled,\r
          bottom: box.bottom - view.top + scrolled\r
        };\r
      };\r
\r
      if (scrubbing) {\r
        const smoothing = scrub === true ? 0 : Math.max(Number(scrub) || 0, 0);\r
        const update = () => {\r
          const { height, scrolled, limit, top, bottom } = measure();\r
          const zone = height * Math.min(Math.max((1 - 2 * threshold) * 0.4, 0.05), 0.4);\r
          const revealed = Math.min(top - height * (1 - threshold) + zone, limit);\r
          let visible = clamp01((scrolled - revealed) / zone + 1);\r
          if (exit) {\r
            const outStart = Math.max(bottom - height * threshold - zone, 0);\r
            const outEnd = Math.max(bottom - height * threshold, outStart + zone / 2);\r
            visible = Math.min(visible, 1 - clamp01((scrolled - outStart) / (outEnd - outStart)));\r
          }\r
          visible = Math.round(visible * 1000) / 1000;\r
          if (smoothing > 0) {\r
            follow = gsap.to(tl, { progress: visible, duration: smoothing, ease: 'power3.out', overwrite: true });\r
          } else {\r
            tl.progress(visible);\r
          }\r
        };\r
        ScrollTrigger.create({\r
          trigger: el,\r
          scroller,\r
          start: 'top bottom',\r
          end: 'bottom top',\r
          onUpdate: update,\r
          onRefresh: update\r
        });\r
        update();\r
        return;\r
      }\r
\r
      ScrollTrigger.create({\r
        trigger: el,\r
        scroller,\r
        start: () => {\r
          const { height, limit, top } = measure();\r
          const start = top - height * (1 - threshold);\r
          return start > limit ? limit - 1 : start;\r
        },\r
        end: exit ? \`bottom \${threshold * 100}%\` : undefined,\r
        once: !replaying,\r
        onEnter: () => tl.play(),\r
        onLeave: exit ? () => tl.reverse() : undefined,\r
        onEnterBack: exit ? () => tl.play() : undefined,\r
        onLeaveBack: once ? undefined : () => tl.reverse()\r
      });\r
    }, el);\r
\r
    return () => {\r
      follow?.kill();\r
      ctx.revert();\r
      masks.forEach(mask => mask.remove());\r
    };\r
  }, [\r
    container,\r
    effect,\r
    blur,\r
    duration,\r
    ease,\r
    delay,\r
    threshold,\r
    initialOpacity,\r
    stagger,\r
    staggerFrom,\r
    trigger,\r
    once,\r
    exit,\r
    scrub,\r
    disappearAfter,\r
    disappearDuration,\r
    disappearEase\r
  ]);\r
\r
  return (\r
    <div ref={ref} className={['invisible', className].filter(Boolean).join(' ')} style={style} {...props}>\r
      {children}\r
    </div>\r
  );\r
};\r
\r
export default FadeContent;\r
`,e=`'use client';\r
\r
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';\r
import { gsap } from 'gsap';\r
import { ScrollTrigger } from 'gsap/ScrollTrigger';\r
\r
gsap.registerPlugin(ScrollTrigger);\r
\r
export type FadeContentEffect = 'fade' | 'focus' | 'develop' | 'dissolve' | 'mist' | 'pixel';\r
export type FadeContentStaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random';\r
\r
export interface FadeContentProps extends HTMLAttributes<HTMLDivElement> {\r
  children?: ReactNode;\r
  container?: Element | string | null;\r
  effect?: FadeContentEffect;\r
  blur?: boolean | number;\r
  duration?: number;\r
  ease?: string;\r
  delay?: number;\r
  threshold?: number;\r
  initialOpacity?: number;\r
  stagger?: number;\r
  staggerFrom?: FadeContentStaggerFrom;\r
  trigger?: 'scroll' | 'mount';\r
  once?: boolean;\r
  exit?: boolean;\r
  scrub?: boolean | number;\r
  disappearAfter?: number;\r
  disappearDuration?: number;\r
  disappearEase?: string;\r
  onStart?: () => void;\r
  onComplete?: () => void;\r
  onDisappearanceComplete?: () => void;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Look {\r
  from: gsap.TweenVars;\r
  to: gsap.TweenVars;\r
  share: number;\r
}\r
\r
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;\r
\r
const SVG_NS = 'http://www.w3.org/2000/svg';\r
\r
const NOISE_EFFECTS = ['dissolve', 'mist', 'pixel'];\r
\r
const LEVELS = Array.from({ length: 33 }, (_, i) => 1 / (1 + Math.exp(-10.8 * (i / 32 - 0.5))));\r
\r
let maskCount = 0;\r
\r
const toSeconds = (value: number) => (typeof value === 'number' && value > 10 ? value / 1000 : value);\r
\r
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);\r
\r
const smoothstep = (from: number, to: number, value: number) => {\r
  const t = clamp01((value - from) / (to - from));\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const noiseFor = (kind: string, size: number) => {\r
  if (kind === 'mist') {\r
    return { frequency: Math.min(Math.max(4 / size, 0.004), 0.02), octaves: 3, edge: 0.35, blur: 10, block: 0 };\r
  }\r
  if (kind === 'pixel') {\r
    const block = 2 * Math.round(Math.min(Math.max(size / 32, 6), 24) / 2);\r
    return { frequency: 0.5 / block, octaves: 1, edge: 0.06, blur: 0, block };\r
  }\r
  return { frequency: 0.6, octaves: 1, edge: 0.15, blur: 0, block: 0 };\r
};\r
\r
const createNoiseMask = (target: HTMLElement, kind: string, floor: number, extraBlur: number) => {\r
  const box = target.getBoundingClientRect();\r
  const { frequency, octaves, edge, blur, block } = noiseFor(kind, Math.sqrt(Math.max(box.width * box.height, 1)));\r
  const node = (name: string, attrs: Record<string, string | number>, parent: Element) => {\r
    const child = document.createElementNS(SVG_NS, name) as SVGElement;\r
    Object.entries(attrs).forEach(([key, value]) => child.setAttribute(key, String(value)));\r
    parent.appendChild(child);\r
    return child;\r
  };\r
  const svg = node('svg', { width: 0, height: 0, 'aria-hidden': 'true' }, document.body);\r
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';\r
  const id = \`fade-content-mask-\${(maskCount += 1)}\`;\r
  const filter = node(\r
    'filter',\r
    { id, x: '-10%', y: '-10%', width: '120%', height: '120%', 'color-interpolation-filters': 'sRGB' },\r
    svg\r
  );\r
  node(\r
    'feTurbulence',\r
    {\r
      type: 'fractalNoise',\r
      baseFrequency: frequency,\r
      numOctaves: octaves,\r
      seed: Math.floor(Math.random() * 1000),\r
      result: 'noise'\r
    },\r
    filter\r
  );\r
  let source = 'noise';\r
  if (block > 0) {\r
    const dot = block / 2 - 1;\r
    node(\r
      'feColorMatrix',\r
      { in: 'noise', type: 'matrix', values: '1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1', result: 'gray' },\r
      filter\r
    );\r
    node('feFlood', { x: dot, y: dot, width: 2, height: 2, 'flood-color': '#000', result: 'dot' }, filter);\r
    node('feComposite', { in: 'dot', in2: 'dot', width: block, height: block, result: 'cell' }, filter);\r
    node('feTile', { in: 'cell', result: 'grid' }, filter);\r
    node('feComposite', { in: 'gray', in2: 'grid', operator: 'in', result: 'samples' }, filter);\r
    node('feMorphology', { in: 'samples', operator: 'dilate', radius: dot, result: 'blocks' }, filter);\r
    source = 'blocks';\r
  }\r
  node(\r
    'feColorMatrix',\r
    { in: source, type: 'matrix', values: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.43 0 0 0 -0.21' },\r
    filter\r
  );\r
  const curve = node('feFuncA', { type: 'table' }, node('feComponentTransfer', { result: 'mask' }, filter));\r
  node('feComposite', { in: 'SourceGraphic', in2: 'mask', operator: 'in' }, filter);\r
\r
  const url = \`url(#\${id})\`;\r
  const blurFrom = blur + extraBlur;\r
  const state = { progress: 0 };\r
  let drawn = -1;\r
\r
  const render = () => {\r
    const progress = state.progress;\r
    if (progress === drawn) return;\r
    drawn = progress;\r
    if (progress >= 1) {\r
      target.style.filter = '';\r
      target.style.visibility = 'inherit';\r
      return;\r
    }\r
    const front = progress * (1 + 2 * edge) - edge;\r
    curve.setAttribute(\r
      'tableValues',\r
      LEVELS.map(level => (floor + (1 - floor) * (1 - smoothstep(front - edge, front + edge, level))).toFixed(3)).join(\r
        ' '\r
      )\r
    );\r
    target.style.filter = blurFrom > 0 ? \`\${url} blur(\${(blurFrom * (1 - progress)).toFixed(2)}px)\` : url;\r
    target.style.visibility = progress <= 0 && floor <= 0 ? 'hidden' : 'inherit';\r
  };\r
\r
  render();\r
\r
  return {\r
    state,\r
    render,\r
    remove: () => {\r
      svg.remove();\r
      target.style.filter = '';\r
    }\r
  };\r
};\r
\r
const getLooks = (effect: string, blur: number, initialOpacity: number): Look[] => {\r
  const soften = (amount: number) => \`blur(\${amount}px)\`;\r
  if (effect === 'focus') {\r
    return [\r
      { from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 0.6 },\r
      { from: { filter: soften(12 + blur), scale: 0.97 }, to: { filter: soften(0), scale: 1 }, share: 1 }\r
    ];\r
  }\r
  if (effect === 'develop') {\r
    return [\r
      { from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 0.5 },\r
      {\r
        from: { filter: \`grayscale(1) contrast(0.55) brightness(1.3) \${soften(blur)}\` },\r
        to: { filter: \`grayscale(0) contrast(1) brightness(1) \${soften(0)}\` },\r
        share: 1\r
      }\r
    ];\r
  }\r
  if (blur > 0) {\r
    return [\r
      { from: { autoAlpha: initialOpacity, filter: soften(blur) }, to: { autoAlpha: 1, filter: soften(0) }, share: 1 }\r
    ];\r
  }\r
  return [{ from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 1 }];\r
};\r
\r
const FadeContent = ({\r
  children,\r
  container,\r
  effect = 'fade',\r
  blur = false,\r
  duration = 1,\r
  ease = 'power2.out',\r
  delay = 0,\r
  threshold = 0.1,\r
  initialOpacity = 0,\r
  stagger = 0,\r
  staggerFrom = 'start',\r
  trigger = 'scroll',\r
  once = true,\r
  exit = false,\r
  scrub = false,\r
  disappearAfter = 0,\r
  disappearDuration = 0.5,\r
  disappearEase = 'power2.in',\r
  onStart,\r
  onComplete,\r
  onDisappearanceComplete,\r
  className = '',\r
  style,\r
  ...props\r
}: FadeContentProps) => {\r
  const ref = useRef<HTMLDivElement>(null);\r
  const callbacksRef = useRef({ onStart, onComplete, onDisappearanceComplete });\r
  callbacksRef.current = { onStart, onComplete, onDisappearanceComplete };\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const el = ref.current;\r
    if (!el) return undefined;\r
\r
    const source: Element | string | null = container || document.getElementById('snap-main-container') || null;\r
    const scroller: Element | null = typeof source === 'string' ? document.querySelector(source) : source;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    let masks: ReturnType<typeof createNoiseMask>[] = [];\r
    let follow: gsap.core.Tween | null = null;\r
\r
    const ctx = gsap.context(() => {\r
      const targets: HTMLElement[] =\r
        stagger > 0 && el.children.length ? (Array.from(el.children) as HTMLElement[]) : [el];\r
      gsap.set(el, { visibility: 'visible' });\r
\r
      if (reduce) {\r
        callbacksRef.current.onComplete?.();\r
        return;\r
      }\r
\r
      const seconds = Math.max(toSeconds(duration) || 0, 0.01);\r
      const blurAmount = blur === true ? 10 : Math.max(Number(blur) || 0, 0);\r
      const startOpacity = clamp01(Number(initialOpacity) || 0);\r
      const staggerVars: gsap.TweenVars =\r
        stagger > 0 ? { stagger: { each: toSeconds(stagger), from: staggerFrom } } : {};\r
      const noisy = NOISE_EFFECTS.includes(effect);\r
      const looks = noisy ? [] : getLooks(effect, blurAmount, startOpacity);\r
\r
      if (noisy) masks = targets.map(target => createNoiseMask(target, effect, startOpacity, blurAmount));\r
      const proxies = masks.map(mask => mask.state);\r
      const draw = () => masks.forEach(mask => mask.render());\r
\r
      const reveal = (timeline: gsap.core.Timeline, position: number) => {\r
        if (noisy) {\r
          timeline.fromTo(\r
            proxies,\r
            { progress: 0 },\r
            { progress: 1, duration: seconds, ease, ...staggerVars, onUpdate: draw },\r
            position\r
          );\r
          return;\r
        }\r
        looks.forEach(look =>\r
          timeline.fromTo(\r
            targets,\r
            look.from,\r
            { ...look.to, duration: seconds * look.share, ease, ...staggerVars },\r
            position\r
          )\r
        );\r
      };\r
\r
      const conceal = (timeline: gsap.core.Timeline, vars: gsap.TweenVars) => {\r
        if (noisy) {\r
          timeline.to(proxies, { progress: 0, ...vars, onUpdate: draw }, 0);\r
          return;\r
        }\r
        looks.forEach(look => timeline.to(targets, { ...look.from, ...vars }, 0));\r
      };\r
\r
      const settle = () => {\r
        if (noisy) {\r
          masks.forEach(mask => mask.remove());\r
          masks = [];\r
          return;\r
        }\r
        gsap.set(targets, { clearProps: 'filter,transform' });\r
      };\r
\r
      const scrubbing = scrub && trigger !== 'mount';\r
      const replaying = !once || exit;\r
      const disappearing = disappearAfter > 0 && !replaying && !scrubbing;\r
\r
      const tl = gsap.timeline({\r
        paused: true,\r
        onStart: () => callbacksRef.current.onStart?.(),\r
        onComplete: () => {\r
          callbacksRef.current.onComplete?.();\r
          if (scrubbing) return;\r
          if (disappearing) {\r
            const out = gsap.timeline({\r
              delay: toSeconds(disappearAfter),\r
              onComplete: () => callbacksRef.current.onDisappearanceComplete?.()\r
            });\r
            conceal(out, {\r
              duration: Math.max(toSeconds(disappearDuration) || 0, 0.01),\r
              ease: disappearEase,\r
              ...staggerVars\r
            });\r
            return;\r
          }\r
          if (!replaying || !noisy) settle();\r
        }\r
      });\r
      reveal(tl, scrubbing ? 0 : Math.max(toSeconds(delay) || 0, 0));\r
\r
      if (trigger === 'mount') {\r
        tl.play();\r
        return;\r
      }\r
\r
      const measure = () => {\r
        const view = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight };\r
        const scrolled = scroller ? scroller.scrollTop : window.scrollY;\r
        const box = el.getBoundingClientRect();\r
        return {\r
          height: view.height,\r
          scrolled,\r
          limit: scroller\r
            ? scroller.scrollHeight - scroller.clientHeight\r
            : document.documentElement.scrollHeight - window.innerHeight,\r
          top: box.top - view.top + scrolled,\r
          bottom: box.bottom - view.top + scrolled\r
        };\r
      };\r
\r
      if (scrubbing) {\r
        const smoothing = scrub === true ? 0 : Math.max(Number(scrub) || 0, 0);\r
        const update = () => {\r
          const { height, scrolled, limit, top, bottom } = measure();\r
          const zone = height * Math.min(Math.max((1 - 2 * threshold) * 0.4, 0.05), 0.4);\r
          const revealed = Math.min(top - height * (1 - threshold) + zone, limit);\r
          let visible = clamp01((scrolled - revealed) / zone + 1);\r
          if (exit) {\r
            const outStart = Math.max(bottom - height * threshold - zone, 0);\r
            const outEnd = Math.max(bottom - height * threshold, outStart + zone / 2);\r
            visible = Math.min(visible, 1 - clamp01((scrolled - outStart) / (outEnd - outStart)));\r
          }\r
          visible = Math.round(visible * 1000) / 1000;\r
          if (smoothing > 0) {\r
            follow = gsap.to(tl, { progress: visible, duration: smoothing, ease: 'power3.out', overwrite: true });\r
          } else {\r
            tl.progress(visible);\r
          }\r
        };\r
        ScrollTrigger.create({\r
          trigger: el,\r
          scroller,\r
          start: 'top bottom',\r
          end: 'bottom top',\r
          onUpdate: update,\r
          onRefresh: update\r
        });\r
        update();\r
        return;\r
      }\r
\r
      ScrollTrigger.create({\r
        trigger: el,\r
        scroller,\r
        start: () => {\r
          const { height, limit, top } = measure();\r
          const start = top - height * (1 - threshold);\r
          return start > limit ? limit - 1 : start;\r
        },\r
        end: exit ? \`bottom \${threshold * 100}%\` : undefined,\r
        once: !replaying,\r
        onEnter: () => tl.play(),\r
        onLeave: exit ? () => tl.reverse() : undefined,\r
        onEnterBack: exit ? () => tl.play() : undefined,\r
        onLeaveBack: once ? undefined : () => tl.reverse()\r
      });\r
    }, el);\r
\r
    return () => {\r
      follow?.kill();\r
      ctx.revert();\r
      masks.forEach(mask => mask.remove());\r
    };\r
  }, [\r
    container,\r
    effect,\r
    blur,\r
    duration,\r
    ease,\r
    delay,\r
    threshold,\r
    initialOpacity,\r
    stagger,\r
    staggerFrom,\r
    trigger,\r
    once,\r
    exit,\r
    scrub,\r
    disappearAfter,\r
    disappearDuration,\r
    disappearEase\r
  ]);\r
\r
  return (\r
    <div ref={ref} className={className} style={{ visibility: 'hidden', ...style }} {...props}>\r
      {children}\r
    </div>\r
  );\r
};\r
\r
export default FadeContent;\r
`,t=`'use client';\r
\r
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';\r
import { gsap } from 'gsap';\r
import { ScrollTrigger } from 'gsap/ScrollTrigger';\r
\r
gsap.registerPlugin(ScrollTrigger);\r
\r
export type FadeContentEffect = 'fade' | 'focus' | 'develop' | 'dissolve' | 'mist' | 'pixel';\r
export type FadeContentStaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random';\r
\r
export interface FadeContentProps extends HTMLAttributes<HTMLDivElement> {\r
  children?: ReactNode;\r
  container?: Element | string | null;\r
  effect?: FadeContentEffect;\r
  blur?: boolean | number;\r
  duration?: number;\r
  ease?: string;\r
  delay?: number;\r
  threshold?: number;\r
  initialOpacity?: number;\r
  stagger?: number;\r
  staggerFrom?: FadeContentStaggerFrom;\r
  trigger?: 'scroll' | 'mount';\r
  once?: boolean;\r
  exit?: boolean;\r
  scrub?: boolean | number;\r
  disappearAfter?: number;\r
  disappearDuration?: number;\r
  disappearEase?: string;\r
  onStart?: () => void;\r
  onComplete?: () => void;\r
  onDisappearanceComplete?: () => void;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Look {\r
  from: gsap.TweenVars;\r
  to: gsap.TweenVars;\r
  share: number;\r
}\r
\r
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;\r
\r
const SVG_NS = 'http://www.w3.org/2000/svg';\r
\r
const NOISE_EFFECTS = ['dissolve', 'mist', 'pixel'];\r
\r
const LEVELS = Array.from({ length: 33 }, (_, i) => 1 / (1 + Math.exp(-10.8 * (i / 32 - 0.5))));\r
\r
let maskCount = 0;\r
\r
const toSeconds = (value: number) => (typeof value === 'number' && value > 10 ? value / 1000 : value);\r
\r
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);\r
\r
const smoothstep = (from: number, to: number, value: number) => {\r
  const t = clamp01((value - from) / (to - from));\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const noiseFor = (kind: string, size: number) => {\r
  if (kind === 'mist') {\r
    return { frequency: Math.min(Math.max(4 / size, 0.004), 0.02), octaves: 3, edge: 0.35, blur: 10, block: 0 };\r
  }\r
  if (kind === 'pixel') {\r
    const block = 2 * Math.round(Math.min(Math.max(size / 32, 6), 24) / 2);\r
    return { frequency: 0.5 / block, octaves: 1, edge: 0.06, blur: 0, block };\r
  }\r
  return { frequency: 0.6, octaves: 1, edge: 0.15, blur: 0, block: 0 };\r
};\r
\r
const createNoiseMask = (target: HTMLElement, kind: string, floor: number, extraBlur: number) => {\r
  const box = target.getBoundingClientRect();\r
  const { frequency, octaves, edge, blur, block } = noiseFor(kind, Math.sqrt(Math.max(box.width * box.height, 1)));\r
  const node = (name: string, attrs: Record<string, string | number>, parent: Element) => {\r
    const child = document.createElementNS(SVG_NS, name) as SVGElement;\r
    Object.entries(attrs).forEach(([key, value]) => child.setAttribute(key, String(value)));\r
    parent.appendChild(child);\r
    return child;\r
  };\r
  const svg = node('svg', { width: 0, height: 0, 'aria-hidden': 'true' }, document.body);\r
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';\r
  const id = \`fade-content-mask-\${(maskCount += 1)}\`;\r
  const filter = node(\r
    'filter',\r
    { id, x: '-10%', y: '-10%', width: '120%', height: '120%', 'color-interpolation-filters': 'sRGB' },\r
    svg\r
  );\r
  node(\r
    'feTurbulence',\r
    {\r
      type: 'fractalNoise',\r
      baseFrequency: frequency,\r
      numOctaves: octaves,\r
      seed: Math.floor(Math.random() * 1000),\r
      result: 'noise'\r
    },\r
    filter\r
  );\r
  let source = 'noise';\r
  if (block > 0) {\r
    const dot = block / 2 - 1;\r
    node(\r
      'feColorMatrix',\r
      { in: 'noise', type: 'matrix', values: '1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1', result: 'gray' },\r
      filter\r
    );\r
    node('feFlood', { x: dot, y: dot, width: 2, height: 2, 'flood-color': '#000', result: 'dot' }, filter);\r
    node('feComposite', { in: 'dot', in2: 'dot', width: block, height: block, result: 'cell' }, filter);\r
    node('feTile', { in: 'cell', result: 'grid' }, filter);\r
    node('feComposite', { in: 'gray', in2: 'grid', operator: 'in', result: 'samples' }, filter);\r
    node('feMorphology', { in: 'samples', operator: 'dilate', radius: dot, result: 'blocks' }, filter);\r
    source = 'blocks';\r
  }\r
  node(\r
    'feColorMatrix',\r
    { in: source, type: 'matrix', values: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.43 0 0 0 -0.21' },\r
    filter\r
  );\r
  const curve = node('feFuncA', { type: 'table' }, node('feComponentTransfer', { result: 'mask' }, filter));\r
  node('feComposite', { in: 'SourceGraphic', in2: 'mask', operator: 'in' }, filter);\r
\r
  const url = \`url(#\${id})\`;\r
  const blurFrom = blur + extraBlur;\r
  const state = { progress: 0 };\r
  let drawn = -1;\r
\r
  const render = () => {\r
    const progress = state.progress;\r
    if (progress === drawn) return;\r
    drawn = progress;\r
    if (progress >= 1) {\r
      target.style.filter = '';\r
      target.style.visibility = 'inherit';\r
      return;\r
    }\r
    const front = progress * (1 + 2 * edge) - edge;\r
    curve.setAttribute(\r
      'tableValues',\r
      LEVELS.map(level => (floor + (1 - floor) * (1 - smoothstep(front - edge, front + edge, level))).toFixed(3)).join(\r
        ' '\r
      )\r
    );\r
    target.style.filter = blurFrom > 0 ? \`\${url} blur(\${(blurFrom * (1 - progress)).toFixed(2)}px)\` : url;\r
    target.style.visibility = progress <= 0 && floor <= 0 ? 'hidden' : 'inherit';\r
  };\r
\r
  render();\r
\r
  return {\r
    state,\r
    render,\r
    remove: () => {\r
      svg.remove();\r
      target.style.filter = '';\r
    }\r
  };\r
};\r
\r
const getLooks = (effect: string, blur: number, initialOpacity: number): Look[] => {\r
  const soften = (amount: number) => \`blur(\${amount}px)\`;\r
  if (effect === 'focus') {\r
    return [\r
      { from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 0.6 },\r
      { from: { filter: soften(12 + blur), scale: 0.97 }, to: { filter: soften(0), scale: 1 }, share: 1 }\r
    ];\r
  }\r
  if (effect === 'develop') {\r
    return [\r
      { from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 0.5 },\r
      {\r
        from: { filter: \`grayscale(1) contrast(0.55) brightness(1.3) \${soften(blur)}\` },\r
        to: { filter: \`grayscale(0) contrast(1) brightness(1) \${soften(0)}\` },\r
        share: 1\r
      }\r
    ];\r
  }\r
  if (blur > 0) {\r
    return [\r
      { from: { autoAlpha: initialOpacity, filter: soften(blur) }, to: { autoAlpha: 1, filter: soften(0) }, share: 1 }\r
    ];\r
  }\r
  return [{ from: { autoAlpha: initialOpacity }, to: { autoAlpha: 1 }, share: 1 }];\r
};\r
\r
const FadeContent = ({\r
  children,\r
  container,\r
  effect = 'fade',\r
  blur = false,\r
  duration = 1,\r
  ease = 'power2.out',\r
  delay = 0,\r
  threshold = 0.1,\r
  initialOpacity = 0,\r
  stagger = 0,\r
  staggerFrom = 'start',\r
  trigger = 'scroll',\r
  once = true,\r
  exit = false,\r
  scrub = false,\r
  disappearAfter = 0,\r
  disappearDuration = 0.5,\r
  disappearEase = 'power2.in',\r
  onStart,\r
  onComplete,\r
  onDisappearanceComplete,\r
  className = '',\r
  style,\r
  ...props\r
}: FadeContentProps) => {\r
  const ref = useRef<HTMLDivElement>(null);\r
  const callbacksRef = useRef({ onStart, onComplete, onDisappearanceComplete });\r
  callbacksRef.current = { onStart, onComplete, onDisappearanceComplete };\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const el = ref.current;\r
    if (!el) return undefined;\r
\r
    const source: Element | string | null = container || document.getElementById('snap-main-container') || null;\r
    const scroller: Element | null = typeof source === 'string' ? document.querySelector(source) : source;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    let masks: ReturnType<typeof createNoiseMask>[] = [];\r
    let follow: gsap.core.Tween | null = null;\r
\r
    const ctx = gsap.context(() => {\r
      const targets: HTMLElement[] =\r
        stagger > 0 && el.children.length ? (Array.from(el.children) as HTMLElement[]) : [el];\r
      gsap.set(el, { visibility: 'visible' });\r
\r
      if (reduce) {\r
        callbacksRef.current.onComplete?.();\r
        return;\r
      }\r
\r
      const seconds = Math.max(toSeconds(duration) || 0, 0.01);\r
      const blurAmount = blur === true ? 10 : Math.max(Number(blur) || 0, 0);\r
      const startOpacity = clamp01(Number(initialOpacity) || 0);\r
      const staggerVars: gsap.TweenVars =\r
        stagger > 0 ? { stagger: { each: toSeconds(stagger), from: staggerFrom } } : {};\r
      const noisy = NOISE_EFFECTS.includes(effect);\r
      const looks = noisy ? [] : getLooks(effect, blurAmount, startOpacity);\r
\r
      if (noisy) masks = targets.map(target => createNoiseMask(target, effect, startOpacity, blurAmount));\r
      const proxies = masks.map(mask => mask.state);\r
      const draw = () => masks.forEach(mask => mask.render());\r
\r
      const reveal = (timeline: gsap.core.Timeline, position: number) => {\r
        if (noisy) {\r
          timeline.fromTo(\r
            proxies,\r
            { progress: 0 },\r
            { progress: 1, duration: seconds, ease, ...staggerVars, onUpdate: draw },\r
            position\r
          );\r
          return;\r
        }\r
        looks.forEach(look =>\r
          timeline.fromTo(\r
            targets,\r
            look.from,\r
            { ...look.to, duration: seconds * look.share, ease, ...staggerVars },\r
            position\r
          )\r
        );\r
      };\r
\r
      const conceal = (timeline: gsap.core.Timeline, vars: gsap.TweenVars) => {\r
        if (noisy) {\r
          timeline.to(proxies, { progress: 0, ...vars, onUpdate: draw }, 0);\r
          return;\r
        }\r
        looks.forEach(look => timeline.to(targets, { ...look.from, ...vars }, 0));\r
      };\r
\r
      const settle = () => {\r
        if (noisy) {\r
          masks.forEach(mask => mask.remove());\r
          masks = [];\r
          return;\r
        }\r
        gsap.set(targets, { clearProps: 'filter,transform' });\r
      };\r
\r
      const scrubbing = scrub && trigger !== 'mount';\r
      const replaying = !once || exit;\r
      const disappearing = disappearAfter > 0 && !replaying && !scrubbing;\r
\r
      const tl = gsap.timeline({\r
        paused: true,\r
        onStart: () => callbacksRef.current.onStart?.(),\r
        onComplete: () => {\r
          callbacksRef.current.onComplete?.();\r
          if (scrubbing) return;\r
          if (disappearing) {\r
            const out = gsap.timeline({\r
              delay: toSeconds(disappearAfter),\r
              onComplete: () => callbacksRef.current.onDisappearanceComplete?.()\r
            });\r
            conceal(out, {\r
              duration: Math.max(toSeconds(disappearDuration) || 0, 0.01),\r
              ease: disappearEase,\r
              ...staggerVars\r
            });\r
            return;\r
          }\r
          if (!replaying || !noisy) settle();\r
        }\r
      });\r
      reveal(tl, scrubbing ? 0 : Math.max(toSeconds(delay) || 0, 0));\r
\r
      if (trigger === 'mount') {\r
        tl.play();\r
        return;\r
      }\r
\r
      const measure = () => {\r
        const view = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight };\r
        const scrolled = scroller ? scroller.scrollTop : window.scrollY;\r
        const box = el.getBoundingClientRect();\r
        return {\r
          height: view.height,\r
          scrolled,\r
          limit: scroller\r
            ? scroller.scrollHeight - scroller.clientHeight\r
            : document.documentElement.scrollHeight - window.innerHeight,\r
          top: box.top - view.top + scrolled,\r
          bottom: box.bottom - view.top + scrolled\r
        };\r
      };\r
\r
      if (scrubbing) {\r
        const smoothing = scrub === true ? 0 : Math.max(Number(scrub) || 0, 0);\r
        const update = () => {\r
          const { height, scrolled, limit, top, bottom } = measure();\r
          const zone = height * Math.min(Math.max((1 - 2 * threshold) * 0.4, 0.05), 0.4);\r
          const revealed = Math.min(top - height * (1 - threshold) + zone, limit);\r
          let visible = clamp01((scrolled - revealed) / zone + 1);\r
          if (exit) {\r
            const outStart = Math.max(bottom - height * threshold - zone, 0);\r
            const outEnd = Math.max(bottom - height * threshold, outStart + zone / 2);\r
            visible = Math.min(visible, 1 - clamp01((scrolled - outStart) / (outEnd - outStart)));\r
          }\r
          visible = Math.round(visible * 1000) / 1000;\r
          if (smoothing > 0) {\r
            follow = gsap.to(tl, { progress: visible, duration: smoothing, ease: 'power3.out', overwrite: true });\r
          } else {\r
            tl.progress(visible);\r
          }\r
        };\r
        ScrollTrigger.create({\r
          trigger: el,\r
          scroller,\r
          start: 'top bottom',\r
          end: 'bottom top',\r
          onUpdate: update,\r
          onRefresh: update\r
        });\r
        update();\r
        return;\r
      }\r
\r
      ScrollTrigger.create({\r
        trigger: el,\r
        scroller,\r
        start: () => {\r
          const { height, limit, top } = measure();\r
          const start = top - height * (1 - threshold);\r
          return start > limit ? limit - 1 : start;\r
        },\r
        end: exit ? \`bottom \${threshold * 100}%\` : undefined,\r
        once: !replaying,\r
        onEnter: () => tl.play(),\r
        onLeave: exit ? () => tl.reverse() : undefined,\r
        onEnterBack: exit ? () => tl.play() : undefined,\r
        onLeaveBack: once ? undefined : () => tl.reverse()\r
      });\r
    }, el);\r
\r
    return () => {\r
      follow?.kill();\r
      ctx.revert();\r
      masks.forEach(mask => mask.remove());\r
    };\r
  }, [\r
    container,\r
    effect,\r
    blur,\r
    duration,\r
    ease,\r
    delay,\r
    threshold,\r
    initialOpacity,\r
    stagger,\r
    staggerFrom,\r
    trigger,\r
    once,\r
    exit,\r
    scrub,\r
    disappearAfter,\r
    disappearDuration,\r
    disappearEase\r
  ]);\r
\r
  return (\r
    <div ref={ref} className={['invisible', className].filter(Boolean).join(' ')} style={style} {...props}>\r
      {children}\r
    </div>\r
  );\r
};\r
\r
export default FadeContent;\r
`,o={dependencies:"gsap",usage:`import FadeContent from './FadeContent'

<FadeContent
  effect="mist"
  duration={1.8}
  ease="power2.out"
  stagger={0.1}
  threshold={0.1}
>
  <h2>Slow light over the bay</h2>
  <p>Every child fades in turn.</p>
</FadeContent>`,code:r,tailwind:n,tsCode:e,tsTailwind:t};export{o as fadeContent};
