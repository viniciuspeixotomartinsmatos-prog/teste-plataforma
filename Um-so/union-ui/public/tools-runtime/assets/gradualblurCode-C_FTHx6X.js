const n=`'use client';\r
\r
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';\r
\r
import './GradualBlur.css';\r
\r
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;\r
\r
const CURVES = {\r
  linear: t => t,\r
  bezier: t => t * t * (3 - 2 * t),\r
  'ease-in': t => t * t,\r
  'ease-out': t => 1 - (1 - t) * (1 - t),\r
  'ease-in-out': t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)\r
};\r
\r
const DIRECTIONS = { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' };\r
\r
const clamp01 = value => Math.min(Math.max(value, 0), 1);\r
\r
const toLength = value => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const toTime = value => (typeof value === 'number' ? \`\${value}s\` : value);\r
\r
const findScroller = (container, root, target, vertical) => {\r
  if (container) {\r
    if (typeof container === 'string') return document.querySelector(container);\r
    return 'current' in container ? container.current : container;\r
  }\r
  if (target === 'page') return window;\r
  const parent = root.parentElement;\r
  if (!parent) return null;\r
  const scrolls = node => {\r
    const style = getComputedStyle(node);\r
    return /(auto|scroll|overlay)/.test(vertical ? style.overflowY : style.overflowX);\r
  };\r
  const sibling = Array.from(parent.children).find(child => child !== root && scrolls(child));\r
  return sibling || (scrolls(parent) ? parent : null);\r
};\r
\r
const GradualBlur = ({\r
  position = 'bottom',\r
  target = 'parent',\r
  height = '6rem',\r
  width,\r
  strength = 2,\r
  layers = 8,\r
  curve = 'linear',\r
  exponential = true,\r
  opacity = 1,\r
  saturation = 1,\r
  tint = 'transparent',\r
  autoHide = false,\r
  container,\r
  hoverIntensity = 1,\r
  duration = 0.3,\r
  easing = 'ease-out',\r
  zIndex = 1000,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const edge = DIRECTIONS[position] ? position : 'bottom';\r
  const vertical = edge === 'top' || edge === 'bottom';\r
\r
  const stack = useMemo(() => {\r
    const count = Math.min(Math.max(Math.round(layers) || 1, 1), 16);\r
    const shape = CURVES[curve] || CURVES.linear;\r
    const maxBlur = Math.max(strength, 0) * 12;\r
    const level = u => {\r
      const t = shape(clamp01(u));\r
      return maxBlur * (exponential ? (Math.pow(2, 4 * t) - 1) / 15 : t);\r
    };\r
    const boost = Math.pow(Math.max(saturation, 0), 1 / count);\r
    const fade = \`\${toTime(duration)} \${easing}\`;\r
    const direction = DIRECTIONS[edge];\r
    const steps = [];\r
    for (let i = 0; i < count; i++) {\r
      const from = level(i / count);\r
      const to = level((i + 1) / count);\r
      const radius = Math.sqrt(Math.max(to * to - from * from, 0));\r
      const filter = [\r
        \`blur(calc(\${radius.toFixed(3)}px * var(--gradual-blur-reveal, 1) * var(--gradual-blur-hover, 1)))\`,\r
        boost !== 1 ? \`saturate(calc(1 + \${(boost - 1).toFixed(4)} * var(--gradual-blur-reveal, 1)))\` : ''\r
      ]\r
        .filter(Boolean)\r
        .join(' ');\r
      const mask = \`linear-gradient(\${direction}, transparent \${((i / count) * 100).toFixed(2)}%, #000 \${(((i + 1) / count) * 100).toFixed(2)}%)\`;\r
      steps.push({\r
        position: 'absolute',\r
        inset: 0,\r
        borderRadius: 'inherit',\r
        backdropFilter: filter,\r
        WebkitBackdropFilter: filter,\r
        maskImage: mask,\r
        WebkitMaskImage: mask,\r
        opacity,\r
        transition: \`backdrop-filter \${fade}, -webkit-backdrop-filter \${fade}\`\r
      });\r
    }\r
    const stops = Array.from({ length: 9 }, (_, k) => {\r
      const u = k / 8;\r
      const t = shape(u);\r
      const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
      return \`rgba(0, 0, 0, \${alpha.toFixed(3)}) \${(u * 100).toFixed(1)}%\`;\r
    }).join(', ');\r
    const tintMask = \`linear-gradient(\${direction}, \${stops})\`;\r
    const wash =\r
      tint && tint !== 'transparent'\r
        ? {\r
            position: 'absolute',\r
            inset: 0,\r
            borderRadius: 'inherit',\r
            background: tint,\r
            maskImage: tintMask,\r
            WebkitMaskImage: tintMask,\r
            opacity: 'calc(var(--gradual-blur-reveal, 1) * min(var(--gradual-blur-hover, 1), 1))',\r
            transition: \`opacity \${fade}\`\r
          }\r
        : null;\r
    return { steps, wash };\r
  }, [layers, curve, strength, exponential, saturation, duration, easing, edge, opacity, tint]);\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
    if (!autoHide) {\r
      root.style.removeProperty('--gradual-blur-reveal');\r
      return undefined;\r
    }\r
    const scroller = findScroller(container, root, target, vertical);\r
    if (!scroller) return undefined;\r
    const element = scroller instanceof Element ? scroller : null;\r
    const start = edge === 'top' || edge === 'left';\r
\r
    const update = () => {\r
      const page = document.documentElement;\r
      const offset = element\r
        ? vertical\r
          ? element.scrollTop\r
          : element.scrollLeft\r
        : vertical\r
          ? window.scrollY\r
          : window.scrollX;\r
      const limit = element\r
        ? vertical\r
          ? element.scrollHeight - element.clientHeight\r
          : element.scrollWidth - element.clientWidth\r
        : vertical\r
          ? page.scrollHeight - window.innerHeight\r
          : page.scrollWidth - window.innerWidth;\r
      const box = root.getBoundingClientRect();\r
      const reach = Math.max(vertical ? box.height : box.width, 1);\r
      const room = start ? offset : limit - offset;\r
      root.style.setProperty('--gradual-blur-reveal', clamp01(room / reach).toFixed(3));\r
    };\r
\r
    update();\r
    const source = element ?? window;\r
    source.addEventListener('scroll', update, { passive: true });\r
    window.addEventListener('resize', update);\r
    const observer = element && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;\r
    if (observer && element) {\r
      observer.observe(element);\r
      if (element.firstElementChild) observer.observe(element.firstElementChild);\r
    }\r
    return () => {\r
      source.removeEventListener('scroll', update);\r
      window.removeEventListener('resize', update);\r
      observer?.disconnect();\r
    };\r
  }, [autoHide, container, target, edge, vertical]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root || hoverIntensity === 1) return undefined;\r
    let frame = 0;\r
    let inside = false;\r
    let point = null;\r
\r
    const check = () => {\r
      frame = 0;\r
      if (!point) return;\r
      const box = root.getBoundingClientRect();\r
      const now = point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;\r
      if (now === inside) return;\r
      inside = now;\r
      root.style.setProperty('--gradual-blur-hover', inside ? String(Math.max(hoverIntensity, 0)) : '1');\r
    };\r
\r
    const onMove = event => {\r
      point = { x: event.clientX, y: event.clientY };\r
      if (!frame) frame = requestAnimationFrame(check);\r
    };\r
\r
    const onLeave = () => {\r
      point = null;\r
      inside = false;\r
      root.style.setProperty('--gradual-blur-hover', '1');\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    return () => {\r
      cancelAnimationFrame(frame);\r
      window.removeEventListener('pointermove', onMove);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      root.style.removeProperty('--gradual-blur-hover');\r
    };\r
  }, [hoverIntensity]);\r
\r
  const depth = toLength(vertical ? height : (width ?? height));\r
  const span = vertical && width != null ? toLength(width) : null;\r
\r
  const rounded = target !== 'page' && !span;\r
  const corner = (a, b) => (rounded && (edge === a || edge === b) ? 'inherit' : undefined);\r
\r
  const rootStyle = {\r
    position: target === 'page' ? 'fixed' : 'absolute',\r
    zIndex,\r
    borderTopLeftRadius: corner('top', 'left'),\r
    borderTopRightRadius: corner('top', 'right'),\r
    borderBottomLeftRadius: corner('bottom', 'left'),\r
    borderBottomRightRadius: corner('bottom', 'right'),\r
    top: edge === 'bottom' ? undefined : 0,\r
    bottom: edge === 'top' ? undefined : 0,\r
    left: edge === 'right' ? undefined : 0,\r
    right: edge === 'left' ? undefined : 0,\r
    height: vertical ? depth : undefined,\r
    width: vertical ? (span ?? undefined) : depth,\r
    marginInline: span ? 'auto' : undefined,\r
    ...style\r
  };\r
\r
  return (\r
    <div ref={rootRef} className={\`gradual-blur \${className}\`.trim()} style={rootStyle} aria-hidden="true">\r
      {stack.steps.map((layer, index) => (\r
        <div key={index} style={layer} />\r
      ))}\r
      {stack.wash && <div style={stack.wash} />}\r
    </div>\r
  );\r
};\r
\r
export default GradualBlur;\r
`,r=`'use client';\r
\r
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';\r
\r
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;\r
\r
const CURVES = {\r
  linear: t => t,\r
  bezier: t => t * t * (3 - 2 * t),\r
  'ease-in': t => t * t,\r
  'ease-out': t => 1 - (1 - t) * (1 - t),\r
  'ease-in-out': t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)\r
};\r
\r
const DIRECTIONS = { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' };\r
\r
const clamp01 = value => Math.min(Math.max(value, 0), 1);\r
\r
const toLength = value => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const toTime = value => (typeof value === 'number' ? \`\${value}s\` : value);\r
\r
const findScroller = (container, root, target, vertical) => {\r
  if (container) {\r
    if (typeof container === 'string') return document.querySelector(container);\r
    return 'current' in container ? container.current : container;\r
  }\r
  if (target === 'page') return window;\r
  const parent = root.parentElement;\r
  if (!parent) return null;\r
  const scrolls = node => {\r
    const style = getComputedStyle(node);\r
    return /(auto|scroll|overlay)/.test(vertical ? style.overflowY : style.overflowX);\r
  };\r
  const sibling = Array.from(parent.children).find(child => child !== root && scrolls(child));\r
  return sibling || (scrolls(parent) ? parent : null);\r
};\r
\r
const GradualBlur = ({\r
  position = 'bottom',\r
  target = 'parent',\r
  height = '6rem',\r
  width,\r
  strength = 2,\r
  layers = 8,\r
  curve = 'linear',\r
  exponential = true,\r
  opacity = 1,\r
  saturation = 1,\r
  tint = 'transparent',\r
  autoHide = false,\r
  container,\r
  hoverIntensity = 1,\r
  duration = 0.3,\r
  easing = 'ease-out',\r
  zIndex = 1000,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const edge = DIRECTIONS[position] ? position : 'bottom';\r
  const vertical = edge === 'top' || edge === 'bottom';\r
\r
  const stack = useMemo(() => {\r
    const count = Math.min(Math.max(Math.round(layers) || 1, 1), 16);\r
    const shape = CURVES[curve] || CURVES.linear;\r
    const maxBlur = Math.max(strength, 0) * 12;\r
    const level = u => {\r
      const t = shape(clamp01(u));\r
      return maxBlur * (exponential ? (Math.pow(2, 4 * t) - 1) / 15 : t);\r
    };\r
    const boost = Math.pow(Math.max(saturation, 0), 1 / count);\r
    const fade = \`\${toTime(duration)} \${easing}\`;\r
    const direction = DIRECTIONS[edge];\r
    const steps = [];\r
    for (let i = 0; i < count; i++) {\r
      const from = level(i / count);\r
      const to = level((i + 1) / count);\r
      const radius = Math.sqrt(Math.max(to * to - from * from, 0));\r
      const filter = [\r
        \`blur(calc(\${radius.toFixed(3)}px * var(--gradual-blur-reveal, 1) * var(--gradual-blur-hover, 1)))\`,\r
        boost !== 1 ? \`saturate(calc(1 + \${(boost - 1).toFixed(4)} * var(--gradual-blur-reveal, 1)))\` : ''\r
      ]\r
        .filter(Boolean)\r
        .join(' ');\r
      const mask = \`linear-gradient(\${direction}, transparent \${((i / count) * 100).toFixed(2)}%, #000 \${(((i + 1) / count) * 100).toFixed(2)}%)\`;\r
      steps.push({\r
        position: 'absolute',\r
        inset: 0,\r
        borderRadius: 'inherit',\r
        backdropFilter: filter,\r
        WebkitBackdropFilter: filter,\r
        maskImage: mask,\r
        WebkitMaskImage: mask,\r
        opacity,\r
        transition: \`backdrop-filter \${fade}, -webkit-backdrop-filter \${fade}\`\r
      });\r
    }\r
    const stops = Array.from({ length: 9 }, (_, k) => {\r
      const u = k / 8;\r
      const t = shape(u);\r
      const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
      return \`rgba(0, 0, 0, \${alpha.toFixed(3)}) \${(u * 100).toFixed(1)}%\`;\r
    }).join(', ');\r
    const tintMask = \`linear-gradient(\${direction}, \${stops})\`;\r
    const wash =\r
      tint && tint !== 'transparent'\r
        ? {\r
            position: 'absolute',\r
            inset: 0,\r
            borderRadius: 'inherit',\r
            background: tint,\r
            maskImage: tintMask,\r
            WebkitMaskImage: tintMask,\r
            opacity: 'calc(var(--gradual-blur-reveal, 1) * min(var(--gradual-blur-hover, 1), 1))',\r
            transition: \`opacity \${fade}\`\r
          }\r
        : null;\r
    return { steps, wash };\r
  }, [layers, curve, strength, exponential, saturation, duration, easing, edge, opacity, tint]);\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
    if (!autoHide) {\r
      root.style.removeProperty('--gradual-blur-reveal');\r
      return undefined;\r
    }\r
    const scroller = findScroller(container, root, target, vertical);\r
    if (!scroller) return undefined;\r
    const element = scroller instanceof Element ? scroller : null;\r
    const start = edge === 'top' || edge === 'left';\r
\r
    const update = () => {\r
      const page = document.documentElement;\r
      const offset = element\r
        ? vertical\r
          ? element.scrollTop\r
          : element.scrollLeft\r
        : vertical\r
          ? window.scrollY\r
          : window.scrollX;\r
      const limit = element\r
        ? vertical\r
          ? element.scrollHeight - element.clientHeight\r
          : element.scrollWidth - element.clientWidth\r
        : vertical\r
          ? page.scrollHeight - window.innerHeight\r
          : page.scrollWidth - window.innerWidth;\r
      const box = root.getBoundingClientRect();\r
      const reach = Math.max(vertical ? box.height : box.width, 1);\r
      const room = start ? offset : limit - offset;\r
      root.style.setProperty('--gradual-blur-reveal', clamp01(room / reach).toFixed(3));\r
    };\r
\r
    update();\r
    const source = element ?? window;\r
    source.addEventListener('scroll', update, { passive: true });\r
    window.addEventListener('resize', update);\r
    const observer = element && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;\r
    if (observer && element) {\r
      observer.observe(element);\r
      if (element.firstElementChild) observer.observe(element.firstElementChild);\r
    }\r
    return () => {\r
      source.removeEventListener('scroll', update);\r
      window.removeEventListener('resize', update);\r
      observer?.disconnect();\r
    };\r
  }, [autoHide, container, target, edge, vertical]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root || hoverIntensity === 1) return undefined;\r
    let frame = 0;\r
    let inside = false;\r
    let point = null;\r
\r
    const check = () => {\r
      frame = 0;\r
      if (!point) return;\r
      const box = root.getBoundingClientRect();\r
      const now = point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;\r
      if (now === inside) return;\r
      inside = now;\r
      root.style.setProperty('--gradual-blur-hover', inside ? String(Math.max(hoverIntensity, 0)) : '1');\r
    };\r
\r
    const onMove = event => {\r
      point = { x: event.clientX, y: event.clientY };\r
      if (!frame) frame = requestAnimationFrame(check);\r
    };\r
\r
    const onLeave = () => {\r
      point = null;\r
      inside = false;\r
      root.style.setProperty('--gradual-blur-hover', '1');\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    return () => {\r
      cancelAnimationFrame(frame);\r
      window.removeEventListener('pointermove', onMove);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      root.style.removeProperty('--gradual-blur-hover');\r
    };\r
  }, [hoverIntensity]);\r
\r
  const depth = toLength(vertical ? height : (width ?? height));\r
  const span = vertical && width != null ? toLength(width) : null;\r
\r
  const rounded = target !== 'page' && !span;\r
  const corner = (a, b) => (rounded && (edge === a || edge === b) ? 'inherit' : undefined);\r
\r
  const rootStyle = {\r
    position: target === 'page' ? 'fixed' : 'absolute',\r
    zIndex,\r
    borderTopLeftRadius: corner('top', 'left'),\r
    borderTopRightRadius: corner('top', 'right'),\r
    borderBottomLeftRadius: corner('bottom', 'left'),\r
    borderBottomRightRadius: corner('bottom', 'right'),\r
    top: edge === 'bottom' ? undefined : 0,\r
    bottom: edge === 'top' ? undefined : 0,\r
    left: edge === 'right' ? undefined : 0,\r
    right: edge === 'left' ? undefined : 0,\r
    height: vertical ? depth : undefined,\r
    width: vertical ? (span ?? undefined) : depth,\r
    marginInline: span ? 'auto' : undefined,\r
    ...style\r
  };\r
\r
  return (\r
    <div ref={rootRef} className={\`pointer-events-none \${className}\`.trim()} style={rootStyle} aria-hidden="true">\r
      {stack.steps.map((layer, index) => (\r
        <div key={index} style={layer} />\r
      ))}\r
      {stack.wash && <div style={stack.wash} />}\r
    </div>\r
  );\r
};\r
\r
export default GradualBlur;\r
`,e=`.gradual-blur {\r
  pointer-events: none;\r
}\r
`,t=`'use client';\r
\r
import { useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties, type RefObject } from 'react';\r
\r
import './GradualBlur.css';\r
\r
export type GradualBlurPosition = 'top' | 'bottom' | 'left' | 'right';\r
export type GradualBlurCurve = 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';\r
\r
export interface GradualBlurProps {\r
  position?: GradualBlurPosition;\r
  target?: 'parent' | 'page';\r
  height?: string | number;\r
  width?: string | number;\r
  strength?: number;\r
  layers?: number;\r
  curve?: GradualBlurCurve;\r
  exponential?: boolean;\r
  opacity?: number;\r
  saturation?: number;\r
  tint?: string;\r
  autoHide?: boolean;\r
  container?: Element | string | RefObject<Element | null> | null;\r
  hoverIntensity?: number;\r
  duration?: number | string;\r
  easing?: string;\r
  zIndex?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;\r
\r
const CURVES: Record<string, (t: number) => number> = {\r
  linear: t => t,\r
  bezier: t => t * t * (3 - 2 * t),\r
  'ease-in': t => t * t,\r
  'ease-out': t => 1 - (1 - t) * (1 - t),\r
  'ease-in-out': t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)\r
};\r
\r
const DIRECTIONS: Record<string, string> = { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' };\r
\r
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);\r
\r
const toLength = (value: string | number) => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const toTime = (value: string | number) => (typeof value === 'number' ? \`\${value}s\` : value);\r
\r
const findScroller = (\r
  container: GradualBlurProps['container'],\r
  root: HTMLElement,\r
  target: string,\r
  vertical: boolean\r
): Element | Window | null => {\r
  if (container) {\r
    if (typeof container === 'string') return document.querySelector(container);\r
    return 'current' in container ? container.current : container;\r
  }\r
  if (target === 'page') return window;\r
  const parent = root.parentElement;\r
  if (!parent) return null;\r
  const scrolls = (node: Element) => {\r
    const style = getComputedStyle(node);\r
    return /(auto|scroll|overlay)/.test(vertical ? style.overflowY : style.overflowX);\r
  };\r
  const sibling = Array.from(parent.children).find(child => child !== root && scrolls(child));\r
  return sibling || (scrolls(parent) ? parent : null);\r
};\r
\r
const GradualBlur = ({\r
  position = 'bottom',\r
  target = 'parent',\r
  height = '6rem',\r
  width,\r
  strength = 2,\r
  layers = 8,\r
  curve = 'linear',\r
  exponential = true,\r
  opacity = 1,\r
  saturation = 1,\r
  tint = 'transparent',\r
  autoHide = false,\r
  container,\r
  hoverIntensity = 1,\r
  duration = 0.3,\r
  easing = 'ease-out',\r
  zIndex = 1000,\r
  className = '',\r
  style\r
}: GradualBlurProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const edge = DIRECTIONS[position] ? position : 'bottom';\r
  const vertical = edge === 'top' || edge === 'bottom';\r
\r
  const stack = useMemo(() => {\r
    const count = Math.min(Math.max(Math.round(layers) || 1, 1), 16);\r
    const shape = CURVES[curve] || CURVES.linear;\r
    const maxBlur = Math.max(strength, 0) * 12;\r
    const level = (u: number) => {\r
      const t = shape(clamp01(u));\r
      return maxBlur * (exponential ? (Math.pow(2, 4 * t) - 1) / 15 : t);\r
    };\r
    const boost = Math.pow(Math.max(saturation, 0), 1 / count);\r
    const fade = \`\${toTime(duration)} \${easing}\`;\r
    const direction = DIRECTIONS[edge];\r
    const steps: CSSProperties[] = [];\r
    for (let i = 0; i < count; i++) {\r
      const from = level(i / count);\r
      const to = level((i + 1) / count);\r
      const radius = Math.sqrt(Math.max(to * to - from * from, 0));\r
      const filter = [\r
        \`blur(calc(\${radius.toFixed(3)}px * var(--gradual-blur-reveal, 1) * var(--gradual-blur-hover, 1)))\`,\r
        boost !== 1 ? \`saturate(calc(1 + \${(boost - 1).toFixed(4)} * var(--gradual-blur-reveal, 1)))\` : ''\r
      ]\r
        .filter(Boolean)\r
        .join(' ');\r
      const mask = \`linear-gradient(\${direction}, transparent \${((i / count) * 100).toFixed(2)}%, #000 \${(((i + 1) / count) * 100).toFixed(2)}%)\`;\r
      steps.push({\r
        position: 'absolute',\r
        inset: 0,\r
        borderRadius: 'inherit',\r
        backdropFilter: filter,\r
        WebkitBackdropFilter: filter,\r
        maskImage: mask,\r
        WebkitMaskImage: mask,\r
        opacity,\r
        transition: \`backdrop-filter \${fade}, -webkit-backdrop-filter \${fade}\`\r
      });\r
    }\r
    const stops = Array.from({ length: 9 }, (_, k) => {\r
      const u = k / 8;\r
      const t = shape(u);\r
      const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
      return \`rgba(0, 0, 0, \${alpha.toFixed(3)}) \${(u * 100).toFixed(1)}%\`;\r
    }).join(', ');\r
    const tintMask = \`linear-gradient(\${direction}, \${stops})\`;\r
    const wash: CSSProperties | null =\r
      tint && tint !== 'transparent'\r
        ? {\r
            position: 'absolute',\r
            inset: 0,\r
            borderRadius: 'inherit',\r
            background: tint,\r
            maskImage: tintMask,\r
            WebkitMaskImage: tintMask,\r
            opacity: 'calc(var(--gradual-blur-reveal, 1) * min(var(--gradual-blur-hover, 1), 1))',\r
            transition: \`opacity \${fade}\`\r
          }\r
        : null;\r
    return { steps, wash };\r
  }, [layers, curve, strength, exponential, saturation, duration, easing, edge, opacity, tint]);\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
    if (!autoHide) {\r
      root.style.removeProperty('--gradual-blur-reveal');\r
      return undefined;\r
    }\r
    const scroller = findScroller(container, root, target, vertical);\r
    if (!scroller) return undefined;\r
    const element = scroller instanceof Element ? scroller : null;\r
    const start = edge === 'top' || edge === 'left';\r
\r
    const update = () => {\r
      const page = document.documentElement;\r
      const offset = element\r
        ? vertical\r
          ? element.scrollTop\r
          : element.scrollLeft\r
        : vertical\r
          ? window.scrollY\r
          : window.scrollX;\r
      const limit = element\r
        ? vertical\r
          ? element.scrollHeight - element.clientHeight\r
          : element.scrollWidth - element.clientWidth\r
        : vertical\r
          ? page.scrollHeight - window.innerHeight\r
          : page.scrollWidth - window.innerWidth;\r
      const box = root.getBoundingClientRect();\r
      const reach = Math.max(vertical ? box.height : box.width, 1);\r
      const room = start ? offset : limit - offset;\r
      root.style.setProperty('--gradual-blur-reveal', clamp01(room / reach).toFixed(3));\r
    };\r
\r
    update();\r
    const source = element ?? window;\r
    source.addEventListener('scroll', update, { passive: true });\r
    window.addEventListener('resize', update);\r
    const observer = element && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;\r
    if (observer && element) {\r
      observer.observe(element);\r
      if (element.firstElementChild) observer.observe(element.firstElementChild);\r
    }\r
    return () => {\r
      source.removeEventListener('scroll', update);\r
      window.removeEventListener('resize', update);\r
      observer?.disconnect();\r
    };\r
  }, [autoHide, container, target, edge, vertical]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root || hoverIntensity === 1) return undefined;\r
    let frame = 0;\r
    let inside = false;\r
    let point: { x: number; y: number } | null = null;\r
\r
    const check = () => {\r
      frame = 0;\r
      if (!point) return;\r
      const box = root.getBoundingClientRect();\r
      const now = point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;\r
      if (now === inside) return;\r
      inside = now;\r
      root.style.setProperty('--gradual-blur-hover', inside ? String(Math.max(hoverIntensity, 0)) : '1');\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      point = { x: event.clientX, y: event.clientY };\r
      if (!frame) frame = requestAnimationFrame(check);\r
    };\r
\r
    const onLeave = () => {\r
      point = null;\r
      inside = false;\r
      root.style.setProperty('--gradual-blur-hover', '1');\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    return () => {\r
      cancelAnimationFrame(frame);\r
      window.removeEventListener('pointermove', onMove);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      root.style.removeProperty('--gradual-blur-hover');\r
    };\r
  }, [hoverIntensity]);\r
\r
  const depth = toLength(vertical ? height : (width ?? height));\r
  const span = vertical && width != null ? toLength(width) : null;\r
\r
  const rounded = target !== 'page' && !span;\r
  const corner = (a: string, b: string) => (rounded && (edge === a || edge === b) ? 'inherit' : undefined);\r
\r
  const rootStyle: CSSProperties = {\r
    position: target === 'page' ? 'fixed' : 'absolute',\r
    zIndex,\r
    borderTopLeftRadius: corner('top', 'left'),\r
    borderTopRightRadius: corner('top', 'right'),\r
    borderBottomLeftRadius: corner('bottom', 'left'),\r
    borderBottomRightRadius: corner('bottom', 'right'),\r
    top: edge === 'bottom' ? undefined : 0,\r
    bottom: edge === 'top' ? undefined : 0,\r
    left: edge === 'right' ? undefined : 0,\r
    right: edge === 'left' ? undefined : 0,\r
    height: vertical ? depth : undefined,\r
    width: vertical ? (span ?? undefined) : depth,\r
    marginInline: span ? 'auto' : undefined,\r
    ...style\r
  };\r
\r
  return (\r
    <div ref={rootRef} className={\`gradual-blur \${className}\`.trim()} style={rootStyle} aria-hidden="true">\r
      {stack.steps.map((layer, index) => (\r
        <div key={index} style={layer} />\r
      ))}\r
      {stack.wash && <div style={stack.wash} />}\r
    </div>\r
  );\r
};\r
\r
export default GradualBlur;\r
`,o=`'use client';\r
\r
import { useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties, type RefObject } from 'react';\r
\r
export type GradualBlurPosition = 'top' | 'bottom' | 'left' | 'right';\r
export type GradualBlurCurve = 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';\r
\r
export interface GradualBlurProps {\r
  position?: GradualBlurPosition;\r
  target?: 'parent' | 'page';\r
  height?: string | number;\r
  width?: string | number;\r
  strength?: number;\r
  layers?: number;\r
  curve?: GradualBlurCurve;\r
  exponential?: boolean;\r
  opacity?: number;\r
  saturation?: number;\r
  tint?: string;\r
  autoHide?: boolean;\r
  container?: Element | string | RefObject<Element | null> | null;\r
  hoverIntensity?: number;\r
  duration?: number | string;\r
  easing?: string;\r
  zIndex?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;\r
\r
const CURVES: Record<string, (t: number) => number> = {\r
  linear: t => t,\r
  bezier: t => t * t * (3 - 2 * t),\r
  'ease-in': t => t * t,\r
  'ease-out': t => 1 - (1 - t) * (1 - t),\r
  'ease-in-out': t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)\r
};\r
\r
const DIRECTIONS: Record<string, string> = { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' };\r
\r
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);\r
\r
const toLength = (value: string | number) => (typeof value === 'number' ? \`\${value}px\` : value);\r
\r
const toTime = (value: string | number) => (typeof value === 'number' ? \`\${value}s\` : value);\r
\r
const findScroller = (\r
  container: GradualBlurProps['container'],\r
  root: HTMLElement,\r
  target: string,\r
  vertical: boolean\r
): Element | Window | null => {\r
  if (container) {\r
    if (typeof container === 'string') return document.querySelector(container);\r
    return 'current' in container ? container.current : container;\r
  }\r
  if (target === 'page') return window;\r
  const parent = root.parentElement;\r
  if (!parent) return null;\r
  const scrolls = (node: Element) => {\r
    const style = getComputedStyle(node);\r
    return /(auto|scroll|overlay)/.test(vertical ? style.overflowY : style.overflowX);\r
  };\r
  const sibling = Array.from(parent.children).find(child => child !== root && scrolls(child));\r
  return sibling || (scrolls(parent) ? parent : null);\r
};\r
\r
const GradualBlur = ({\r
  position = 'bottom',\r
  target = 'parent',\r
  height = '6rem',\r
  width,\r
  strength = 2,\r
  layers = 8,\r
  curve = 'linear',\r
  exponential = true,\r
  opacity = 1,\r
  saturation = 1,\r
  tint = 'transparent',\r
  autoHide = false,\r
  container,\r
  hoverIntensity = 1,\r
  duration = 0.3,\r
  easing = 'ease-out',\r
  zIndex = 1000,\r
  className = '',\r
  style\r
}: GradualBlurProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const edge = DIRECTIONS[position] ? position : 'bottom';\r
  const vertical = edge === 'top' || edge === 'bottom';\r
\r
  const stack = useMemo(() => {\r
    const count = Math.min(Math.max(Math.round(layers) || 1, 1), 16);\r
    const shape = CURVES[curve] || CURVES.linear;\r
    const maxBlur = Math.max(strength, 0) * 12;\r
    const level = (u: number) => {\r
      const t = shape(clamp01(u));\r
      return maxBlur * (exponential ? (Math.pow(2, 4 * t) - 1) / 15 : t);\r
    };\r
    const boost = Math.pow(Math.max(saturation, 0), 1 / count);\r
    const fade = \`\${toTime(duration)} \${easing}\`;\r
    const direction = DIRECTIONS[edge];\r
    const steps: CSSProperties[] = [];\r
    for (let i = 0; i < count; i++) {\r
      const from = level(i / count);\r
      const to = level((i + 1) / count);\r
      const radius = Math.sqrt(Math.max(to * to - from * from, 0));\r
      const filter = [\r
        \`blur(calc(\${radius.toFixed(3)}px * var(--gradual-blur-reveal, 1) * var(--gradual-blur-hover, 1)))\`,\r
        boost !== 1 ? \`saturate(calc(1 + \${(boost - 1).toFixed(4)} * var(--gradual-blur-reveal, 1)))\` : ''\r
      ]\r
        .filter(Boolean)\r
        .join(' ');\r
      const mask = \`linear-gradient(\${direction}, transparent \${((i / count) * 100).toFixed(2)}%, #000 \${(((i + 1) / count) * 100).toFixed(2)}%)\`;\r
      steps.push({\r
        position: 'absolute',\r
        inset: 0,\r
        borderRadius: 'inherit',\r
        backdropFilter: filter,\r
        WebkitBackdropFilter: filter,\r
        maskImage: mask,\r
        WebkitMaskImage: mask,\r
        opacity,\r
        transition: \`backdrop-filter \${fade}, -webkit-backdrop-filter \${fade}\`\r
      });\r
    }\r
    const stops = Array.from({ length: 9 }, (_, k) => {\r
      const u = k / 8;\r
      const t = shape(u);\r
      const alpha = t * t * t * (t * (t * 6 - 15) + 10);\r
      return \`rgba(0, 0, 0, \${alpha.toFixed(3)}) \${(u * 100).toFixed(1)}%\`;\r
    }).join(', ');\r
    const tintMask = \`linear-gradient(\${direction}, \${stops})\`;\r
    const wash: CSSProperties | null =\r
      tint && tint !== 'transparent'\r
        ? {\r
            position: 'absolute',\r
            inset: 0,\r
            borderRadius: 'inherit',\r
            background: tint,\r
            maskImage: tintMask,\r
            WebkitMaskImage: tintMask,\r
            opacity: 'calc(var(--gradual-blur-reveal, 1) * min(var(--gradual-blur-hover, 1), 1))',\r
            transition: \`opacity \${fade}\`\r
          }\r
        : null;\r
    return { steps, wash };\r
  }, [layers, curve, strength, exponential, saturation, duration, easing, edge, opacity, tint]);\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
    if (!autoHide) {\r
      root.style.removeProperty('--gradual-blur-reveal');\r
      return undefined;\r
    }\r
    const scroller = findScroller(container, root, target, vertical);\r
    if (!scroller) return undefined;\r
    const element = scroller instanceof Element ? scroller : null;\r
    const start = edge === 'top' || edge === 'left';\r
\r
    const update = () => {\r
      const page = document.documentElement;\r
      const offset = element\r
        ? vertical\r
          ? element.scrollTop\r
          : element.scrollLeft\r
        : vertical\r
          ? window.scrollY\r
          : window.scrollX;\r
      const limit = element\r
        ? vertical\r
          ? element.scrollHeight - element.clientHeight\r
          : element.scrollWidth - element.clientWidth\r
        : vertical\r
          ? page.scrollHeight - window.innerHeight\r
          : page.scrollWidth - window.innerWidth;\r
      const box = root.getBoundingClientRect();\r
      const reach = Math.max(vertical ? box.height : box.width, 1);\r
      const room = start ? offset : limit - offset;\r
      root.style.setProperty('--gradual-blur-reveal', clamp01(room / reach).toFixed(3));\r
    };\r
\r
    update();\r
    const source = element ?? window;\r
    source.addEventListener('scroll', update, { passive: true });\r
    window.addEventListener('resize', update);\r
    const observer = element && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;\r
    if (observer && element) {\r
      observer.observe(element);\r
      if (element.firstElementChild) observer.observe(element.firstElementChild);\r
    }\r
    return () => {\r
      source.removeEventListener('scroll', update);\r
      window.removeEventListener('resize', update);\r
      observer?.disconnect();\r
    };\r
  }, [autoHide, container, target, edge, vertical]);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root || hoverIntensity === 1) return undefined;\r
    let frame = 0;\r
    let inside = false;\r
    let point: { x: number; y: number } | null = null;\r
\r
    const check = () => {\r
      frame = 0;\r
      if (!point) return;\r
      const box = root.getBoundingClientRect();\r
      const now = point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;\r
      if (now === inside) return;\r
      inside = now;\r
      root.style.setProperty('--gradual-blur-hover', inside ? String(Math.max(hoverIntensity, 0)) : '1');\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      point = { x: event.clientX, y: event.clientY };\r
      if (!frame) frame = requestAnimationFrame(check);\r
    };\r
\r
    const onLeave = () => {\r
      point = null;\r
      inside = false;\r
      root.style.setProperty('--gradual-blur-hover', '1');\r
    };\r
\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onLeave);\r
    return () => {\r
      cancelAnimationFrame(frame);\r
      window.removeEventListener('pointermove', onMove);\r
      document.documentElement.removeEventListener('pointerleave', onLeave);\r
      root.style.removeProperty('--gradual-blur-hover');\r
    };\r
  }, [hoverIntensity]);\r
\r
  const depth = toLength(vertical ? height : (width ?? height));\r
  const span = vertical && width != null ? toLength(width) : null;\r
\r
  const rounded = target !== 'page' && !span;\r
  const corner = (a: string, b: string) => (rounded && (edge === a || edge === b) ? 'inherit' : undefined);\r
\r
  const rootStyle: CSSProperties = {\r
    position: target === 'page' ? 'fixed' : 'absolute',\r
    zIndex,\r
    borderTopLeftRadius: corner('top', 'left'),\r
    borderTopRightRadius: corner('top', 'right'),\r
    borderBottomLeftRadius: corner('bottom', 'left'),\r
    borderBottomRightRadius: corner('bottom', 'right'),\r
    top: edge === 'bottom' ? undefined : 0,\r
    bottom: edge === 'top' ? undefined : 0,\r
    left: edge === 'right' ? undefined : 0,\r
    right: edge === 'left' ? undefined : 0,\r
    height: vertical ? depth : undefined,\r
    width: vertical ? (span ?? undefined) : depth,\r
    marginInline: span ? 'auto' : undefined,\r
    ...style\r
  };\r
\r
  return (\r
    <div ref={rootRef} className={\`pointer-events-none \${className}\`.trim()} style={rootStyle} aria-hidden="true">\r
      {stack.steps.map((layer, index) => (\r
        <div key={index} style={layer} />\r
      ))}\r
      {stack.wash && <div style={stack.wash} />}\r
    </div>\r
  );\r
};\r
\r
export default GradualBlur;\r
`,i={usage:`// Component added by Ansh - github.com/ansh-dhanani

import GradualBlur from './GradualBlur';

<section style={{ position: 'relative', height: 500, overflow: 'hidden' }}>
  <div style={{ height: '100%', overflowY: 'auto' }}>
    {/* Scrolling content */}
  </div>

  <GradualBlur
    position="bottom"
    height="6rem"
    strength={2}
    layers={8}
    curve="linear"
    exponential
    tint="rgba(18, 15, 23, 0.6)"
    autoHide
  />
</section>`,code:n,css:e,tailwind:r,tsCode:t,tsTailwind:o};export{i as gradualBlur};
