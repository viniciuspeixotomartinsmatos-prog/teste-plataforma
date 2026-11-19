const r=`'use client';\r
\r
import { useCallback, useEffect, useRef } from 'react';\r
\r
import './ScrollExpand.css';\r
\r
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);\r
\r
const smoothstep = (edge0, edge1, x) => {\r
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const ScrollExpand = ({\r
  src = '',\r
  mediaType = 'image',\r
  poster = '',\r
  alt = '',\r
  title = '',\r
  scrollHint = '',\r
  startWidth = 42,\r
  startHeight = 58,\r
  startRadius = 24,\r
  endRadius = 0,\r
  mediaZoom = 1.35,\r
  scrollDistance = 1.2,\r
  holdDistance = 0.35,\r
  smoothing = 0.1,\r
  overlayScrim = 0.45,\r
  useWindowScroll = false,\r
  enabled = true,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const rootRef = useRef(null);\r
  const trackRef = useRef(null);\r
  const stageRef = useRef(null);\r
  const frameRef = useRef(null);\r
  const mediaRef = useRef(null);\r
  const titleRef = useRef(null);\r
  const overlayRef = useRef(null);\r
  const scrimRef = useRef(null);\r
  const hintRef = useRef(null);\r
\r
  const propsRef = useRef({});\r
  propsRef.current = {\r
    startWidth,\r
    startHeight,\r
    startRadius,\r
    endRadius,\r
    mediaZoom,\r
    scrollDistance,\r
    holdDistance,\r
    smoothing,\r
    overlayScrim,\r
    useWindowScroll,\r
    enabled\r
  };\r
\r
  const applyProgress = useCallback(p => {\r
    const frame = frameRef.current;\r
    const media = mediaRef.current;\r
    if (!frame || !media) return;\r
    const c = propsRef.current;\r
\r
    const e = smoothstep(0, 1, p);\r
\r
    const w = c.startWidth + (100 - c.startWidth) * e;\r
    const h = c.startHeight + (100 - c.startHeight) * e;\r
    const ix = Math.max(0, (100 - w) / 2);\r
    const iy = Math.max(0, (100 - h) / 2);\r
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;\r
    frame.style.clipPath = \`inset(\${iy}% \${ix}% \${iy}% \${ix}% round \${r}px)\`;\r
\r
    media.style.transform = \`scale(\${c.mediaZoom + (1 - c.mediaZoom) * e})\`;\r
\r
    if (scrimRef.current) scrimRef.current.style.opacity = \`\${c.overlayScrim * e}\`;\r
\r
    if (titleRef.current) {\r
      const out = smoothstep(0.4, 0.88, p);\r
      titleRef.current.style.opacity = \`\${1 - out}\`;\r
      titleRef.current.style.transform = \`translate3d(0, \${-28 * out}px, 0) scale(\${1 + 0.06 * out})\`;\r
    }\r
\r
    if (hintRef.current) {\r
      const gone = smoothstep(0, 0.12, p);\r
      hintRef.current.style.opacity = \`\${1 - gone}\`;\r
      hintRef.current.style.transform = \`translate3d(0, \${8 * gone}px, 0)\`;\r
    }\r
\r
    if (overlayRef.current) {\r
      const inn = smoothstep(0.68, 1, p);\r
      overlayRef.current.style.opacity = \`\${inn}\`;\r
      overlayRef.current.style.transform = \`translate3d(0, \${18 * (1 - inn)}px, 0)\`;\r
    }\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const track = trackRef.current;\r
    const stage = stageRef.current;\r
    if (!root || !track || !stage) return;\r
\r
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    let raf = 0;\r
    let current = 0;\r
    let target = 0;\r
    let stageH = 0;\r
    let running = false;\r
\r
    const measure = () => {\r
      const c = propsRef.current;\r
      stageH = c.useWindowScroll ? window.innerHeight : root.clientHeight;\r
      if (stageH <= 0) return;\r
      stage.style.height = \`\${stageH}px\`;\r
      track.style.height = \`\${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px\`;\r
\r
      const w = root.clientWidth || stageH;\r
      stage.style.setProperty('--se-title-size', \`\${clamp(w * 0.075, 20, 84)}px\`);\r
    };\r
\r
    const readProgress = () => {\r
      const c = propsRef.current;\r
      if (!c.enabled) return 1;\r
      const span = stageH * Math.max(0.01, c.scrollDistance);\r
      if (c.useWindowScroll) {\r
        const top = track.getBoundingClientRect().top;\r
        return clamp(-top / span, 0, 1);\r
      }\r
      return clamp(root.scrollTop / span, 0, 1);\r
    };\r
\r
    const tick = () => {\r
      const c = propsRef.current;\r
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));\r
      current += (target - current) * k;\r
      if (Math.abs(target - current) < 0.0004) {\r
        current = target;\r
        running = false;\r
      }\r
      applyProgress(current);\r
      raf = running ? requestAnimationFrame(tick) : 0;\r
    };\r
\r
    const kick = () => {\r
      if (running) return;\r
      running = true;\r
      if (!raf) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const onScroll = () => {\r
      target = readProgress();\r
      if (propsRef.current.smoothing <= 0 || reduceMotion) {\r
        current = target;\r
        applyProgress(current);\r
        return;\r
      }\r
      kick();\r
    };\r
\r
    const onResize = () => {\r
      measure();\r
      target = readProgress();\r
      current = target;\r
      applyProgress(current);\r
    };\r
\r
    measure();\r
    target = readProgress();\r
    current = target;\r
    applyProgress(current);\r
\r
    const scroller = useWindowScroll ? window : root;\r
    scroller.addEventListener('scroll', onScroll, { passive: true });\r
    window.addEventListener('resize', onResize);\r
    const ro = new ResizeObserver(onResize);\r
    ro.observe(root);\r
\r
    return () => {\r
      if (raf) cancelAnimationFrame(raf);\r
      scroller.removeEventListener('scroll', onScroll);\r
      window.removeEventListener('resize', onResize);\r
      ro.disconnect();\r
    };\r
  }, [applyProgress, useWindowScroll]);\r
\r
  const media =\r
    mediaType === 'video' ? (\r
      <video\r
        ref={mediaRef}\r
        className="scroll-expand__media"\r
        src={src}\r
        poster={poster}\r
        autoPlay\r
        muted\r
        loop\r
        playsInline\r
      />\r
    ) : (\r
      <img ref={mediaRef} className="scroll-expand__media" src={src} alt={alt} draggable={false} />\r
    );\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`scroll-expand \${useWindowScroll ? '' : 'scroll-expand--scroller'} \${className}\`.trim()}\r
      style={style}\r
      {...rest}\r
    >\r
      <div ref={trackRef} className="scroll-expand__track">\r
        <div ref={stageRef} className="scroll-expand__stage">\r
          <div ref={frameRef} className="scroll-expand__frame">\r
            {media}\r
            <div ref={scrimRef} className="scroll-expand__scrim" />\r
            {children ? (\r
              <div ref={overlayRef} className="scroll-expand__overlay">\r
                {children}\r
              </div>\r
            ) : null}\r
          </div>\r
          {title ? (\r
            <div ref={titleRef} className="scroll-expand__title">\r
              {title}\r
            </div>\r
          ) : null}\r
          {scrollHint ? (\r
            <div ref={hintRef} className="scroll-expand__hint">\r
              {scrollHint}\r
            </div>\r
          ) : null}\r
        </div>\r
      </div>\r
    </div>\r
  );\r
};\r
\r
export default ScrollExpand;\r
`,n=`.scroll-expand {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
}\r
\r
.scroll-expand--scroller {\r
  overflow-y: auto;\r
  overflow-x: hidden;\r
  scrollbar-width: none;\r
  -ms-overflow-style: none;\r
  overscroll-behavior: contain;\r
}\r
\r
.scroll-expand--scroller::-webkit-scrollbar {\r
  display: none;\r
}\r
\r
.scroll-expand__track {\r
  position: relative;\r
  width: 100%;\r
}\r
\r
.scroll-expand__stage {\r
  position: sticky;\r
  top: 0;\r
  width: 100%;\r
  overflow: hidden;\r
  --se-title-size: 4rem;\r
}\r
\r
.scroll-expand__frame {\r
  position: absolute;\r
  inset: 0;\r
  clip-path: inset(21% 29% 21% 29% round 24px);\r
  will-change: clip-path;\r
}\r
\r
.scroll-expand__media {\r
  position: absolute;\r
  inset: 0;\r
  width: 100%;\r
  height: 100%;\r
  object-fit: cover;\r
  will-change: transform;\r
  transform-origin: center;\r
  user-select: none;\r
  -webkit-user-drag: none;\r
}\r
\r
.scroll-expand__scrim {\r
  position: absolute;\r
  inset: 0;\r
  pointer-events: none;\r
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.1) 45%, rgba(0, 0, 0, 0.35));\r
  opacity: 0;\r
}\r
\r
.scroll-expand__overlay {\r
  position: absolute;\r
  inset: 0;\r
  display: flex;\r
  flex-direction: column;\r
  align-items: center;\r
  justify-content: center;\r
  text-align: center;\r
  padding: 6%;\r
  opacity: 0;\r
  will-change: opacity, transform;\r
}\r
\r
.scroll-expand__title {\r
  position: absolute;\r
  inset: 0;\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  margin: 0;\r
  padding: 0 6%;\r
  text-align: center;\r
  font-size: var(--se-title-size);\r
  font-weight: 700;\r
  letter-spacing: -0.03em;\r
  line-height: 1;\r
  color: #fff;\r
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.45);\r
  pointer-events: none;\r
  will-change: opacity, transform;\r
}\r
\r
.scroll-expand__hint {\r
  position: absolute;\r
  left: 0;\r
  right: 0;\r
  bottom: 1.25rem;\r
  text-align: center;\r
  font-size: 0.8125rem;\r
  letter-spacing: 0.02em;\r
  color: rgba(255, 255, 255, 0.55);\r
  pointer-events: none;\r
  will-change: opacity, transform;\r
}\r
`,e=`'use client';\r
\r
import { useCallback, useEffect, useRef } from 'react';\r
\r
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);\r
\r
const smoothstep = (edge0, edge1, x) => {\r
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
const ScrollExpand = ({\r
  src = '',\r
  mediaType = 'image',\r
  poster = '',\r
  alt = '',\r
  title = '',\r
  scrollHint = '',\r
  startWidth = 42,\r
  startHeight = 58,\r
  startRadius = 24,\r
  endRadius = 0,\r
  mediaZoom = 1.35,\r
  scrollDistance = 1.2,\r
  holdDistance = 0.35,\r
  smoothing = 0.1,\r
  overlayScrim = 0.45,\r
  useWindowScroll = false,\r
  enabled = true,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const rootRef = useRef(null);\r
  const trackRef = useRef(null);\r
  const stageRef = useRef(null);\r
  const frameRef = useRef(null);\r
  const mediaRef = useRef(null);\r
  const titleRef = useRef(null);\r
  const overlayRef = useRef(null);\r
  const scrimRef = useRef(null);\r
  const hintRef = useRef(null);\r
\r
  const propsRef = useRef({});\r
  propsRef.current = {\r
    startWidth,\r
    startHeight,\r
    startRadius,\r
    endRadius,\r
    mediaZoom,\r
    scrollDistance,\r
    holdDistance,\r
    smoothing,\r
    overlayScrim,\r
    useWindowScroll,\r
    enabled\r
  };\r
\r
  const applyProgress = useCallback(p => {\r
    const frame = frameRef.current;\r
    const media = mediaRef.current;\r
    if (!frame || !media) return;\r
    const c = propsRef.current;\r
\r
    const e = smoothstep(0, 1, p);\r
\r
    const w = c.startWidth + (100 - c.startWidth) * e;\r
    const h = c.startHeight + (100 - c.startHeight) * e;\r
    const ix = Math.max(0, (100 - w) / 2);\r
    const iy = Math.max(0, (100 - h) / 2);\r
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;\r
    frame.style.clipPath = \`inset(\${iy}% \${ix}% \${iy}% \${ix}% round \${r}px)\`;\r
\r
    media.style.transform = \`scale(\${c.mediaZoom + (1 - c.mediaZoom) * e})\`;\r
\r
    if (scrimRef.current) scrimRef.current.style.opacity = \`\${c.overlayScrim * e}\`;\r
\r
    if (titleRef.current) {\r
      const out = smoothstep(0.4, 0.88, p);\r
      titleRef.current.style.opacity = \`\${1 - out}\`;\r
      titleRef.current.style.transform = \`translate3d(0, \${-28 * out}px, 0) scale(\${1 + 0.06 * out})\`;\r
    }\r
\r
    if (hintRef.current) {\r
      const gone = smoothstep(0, 0.12, p);\r
      hintRef.current.style.opacity = \`\${1 - gone}\`;\r
      hintRef.current.style.transform = \`translate3d(0, \${8 * gone}px, 0)\`;\r
    }\r
\r
    if (overlayRef.current) {\r
      const inn = smoothstep(0.68, 1, p);\r
      overlayRef.current.style.opacity = \`\${inn}\`;\r
      overlayRef.current.style.transform = \`translate3d(0, \${18 * (1 - inn)}px, 0)\`;\r
    }\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const track = trackRef.current;\r
    const stage = stageRef.current;\r
    if (!root || !track || !stage) return;\r
\r
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    let raf = 0;\r
    let current = 0;\r
    let target = 0;\r
    let stageH = 0;\r
    let running = false;\r
\r
    const measure = () => {\r
      const c = propsRef.current;\r
      stageH = c.useWindowScroll ? window.innerHeight : root.clientHeight;\r
      if (stageH <= 0) return;\r
      stage.style.height = \`\${stageH}px\`;\r
      track.style.height = \`\${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px\`;\r
\r
      const w = root.clientWidth || stageH;\r
      stage.style.setProperty('--se-title-size', \`\${clamp(w * 0.075, 20, 84)}px\`);\r
    };\r
\r
    const readProgress = () => {\r
      const c = propsRef.current;\r
      if (!c.enabled) return 1;\r
      const span = stageH * Math.max(0.01, c.scrollDistance);\r
      if (c.useWindowScroll) {\r
        const top = track.getBoundingClientRect().top;\r
        return clamp(-top / span, 0, 1);\r
      }\r
      return clamp(root.scrollTop / span, 0, 1);\r
    };\r
\r
    const tick = () => {\r
      const c = propsRef.current;\r
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));\r
      current += (target - current) * k;\r
      if (Math.abs(target - current) < 0.0004) {\r
        current = target;\r
        running = false;\r
      }\r
      applyProgress(current);\r
      raf = running ? requestAnimationFrame(tick) : 0;\r
    };\r
\r
    const kick = () => {\r
      if (running) return;\r
      running = true;\r
      if (!raf) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const onScroll = () => {\r
      target = readProgress();\r
      if (propsRef.current.smoothing <= 0 || reduceMotion) {\r
        current = target;\r
        applyProgress(current);\r
        return;\r
      }\r
      kick();\r
    };\r
\r
    const onResize = () => {\r
      measure();\r
      target = readProgress();\r
      current = target;\r
      applyProgress(current);\r
    };\r
\r
    measure();\r
    target = readProgress();\r
    current = target;\r
    applyProgress(current);\r
\r
    const scroller = useWindowScroll ? window : root;\r
    scroller.addEventListener('scroll', onScroll, { passive: true });\r
    window.addEventListener('resize', onResize);\r
    const ro = new ResizeObserver(onResize);\r
    ro.observe(root);\r
\r
    return () => {\r
      if (raf) cancelAnimationFrame(raf);\r
      scroller.removeEventListener('scroll', onScroll);\r
      window.removeEventListener('resize', onResize);\r
      ro.disconnect();\r
    };\r
  }, [applyProgress, useWindowScroll]);\r
\r
  const media =\r
    mediaType === 'video' ? (\r
      <video\r
        ref={mediaRef}\r
        className="absolute inset-0 w-full h-full object-cover origin-center select-none [will-change:transform]"\r
        src={src}\r
        poster={poster}\r
        autoPlay\r
        muted\r
        loop\r
        playsInline\r
      />\r
    ) : (\r
      <img\r
        ref={mediaRef}\r
        className="absolute inset-0 w-full h-full object-cover origin-center select-none [will-change:transform]"\r
        src={src}\r
        alt={alt}\r
        draggable={false}\r
      />\r
    );\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`relative w-full h-full \${useWindowScroll ? '' : 'overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'} \${className}\`.trim()}\r
      style={style}\r
      {...rest}\r
    >\r
      <div ref={trackRef} className="relative w-full">\r
        <div ref={stageRef} className="sticky top-0 w-full overflow-hidden [--se-title-size:4rem]">\r
          <div\r
            ref={frameRef}\r
            className="absolute inset-0 [clip-path:inset(21%_29%_21%_29%_round_24px)] [will-change:clip-path]"\r
          >\r
            {media}\r
            <div\r
              ref={scrimRef}\r
              className="absolute inset-0 opacity-0 pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.75),rgba(0,0,0,0.1)_45%,rgba(0,0,0,0.35))]"\r
            />\r
            {children ? (\r
              <div\r
                ref={overlayRef}\r
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-[6%] opacity-0 [will-change:opacity,transform]"\r
              >\r
                {children}\r
              </div>\r
            ) : null}\r
          </div>\r
          {title ? (\r
            <div\r
              ref={titleRef}\r
              className="absolute inset-0 flex items-center justify-center m-0 px-[6%] text-center font-bold leading-none tracking-[-0.03em] text-white [font-size:var(--se-title-size)] [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] pointer-events-none [will-change:opacity,transform]"\r
            >\r
              {title}\r
            </div>\r
          ) : null}\r
          {scrollHint ? (\r
            <div\r
              ref={hintRef}\r
              className="absolute inset-x-0 bottom-5 text-center text-[0.8125rem] tracking-[0.02em] text-white/55 pointer-events-none [will-change:opacity,transform]"\r
            >\r
              {scrollHint}\r
            </div>\r
          ) : null}\r
        </div>\r
      </div>\r
    </div>\r
  );\r
};\r
\r
export default ScrollExpand;\r
`,t=`'use client';\r
\r
import { useCallback, useEffect, useRef } from 'react';\r
import type { CSSProperties, ReactNode } from 'react';\r
\r
import './ScrollExpand.css';\r
\r
const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);\r
\r
const smoothstep = (edge0: number, edge1: number, x: number): number => {\r
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
type ConfigKey =\r
  | 'startWidth'\r
  | 'startHeight'\r
  | 'startRadius'\r
  | 'endRadius'\r
  | 'mediaZoom'\r
  | 'scrollDistance'\r
  | 'holdDistance'\r
  | 'smoothing'\r
  | 'overlayScrim'\r
  | 'useWindowScroll'\r
  | 'enabled';\r
\r
export interface ScrollExpandProps {\r
  src?: string;\r
  mediaType?: 'image' | 'video';\r
  poster?: string;\r
  alt?: string;\r
  title?: string;\r
  scrollHint?: string;\r
  startWidth?: number;\r
  startHeight?: number;\r
  startRadius?: number;\r
  endRadius?: number;\r
  mediaZoom?: number;\r
  scrollDistance?: number;\r
  holdDistance?: number;\r
  smoothing?: number;\r
  overlayScrim?: number;\r
  useWindowScroll?: boolean;\r
  enabled?: boolean;\r
  children?: ReactNode;\r
  className?: string;\r
  style?: CSSProperties;\r
  [key: string]: unknown;\r
}\r
\r
const ScrollExpand: React.FC<ScrollExpandProps> = ({\r
  src = '',\r
  mediaType = 'image',\r
  poster = '',\r
  alt = '',\r
  title = '',\r
  scrollHint = '',\r
  startWidth = 42,\r
  startHeight = 58,\r
  startRadius = 24,\r
  endRadius = 0,\r
  mediaZoom = 1.35,\r
  scrollDistance = 1.2,\r
  holdDistance = 0.35,\r
  smoothing = 0.1,\r
  overlayScrim = 0.45,\r
  useWindowScroll = false,\r
  enabled = true,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}: ScrollExpandProps) => {\r
  const rootRef = useRef<HTMLDivElement | null>(null);\r
  const trackRef = useRef<HTMLDivElement | null>(null);\r
  const stageRef = useRef<HTMLDivElement | null>(null);\r
  const frameRef = useRef<HTMLDivElement | null>(null);\r
  const mediaRef = useRef<HTMLImageElement & HTMLVideoElement>(null);\r
  const titleRef = useRef<HTMLDivElement | null>(null);\r
  const overlayRef = useRef<HTMLDivElement | null>(null);\r
  const scrimRef = useRef<HTMLDivElement | null>(null);\r
  const hintRef = useRef<HTMLDivElement | null>(null);\r
\r
  const propsRef = useRef<Required<Pick<ScrollExpandProps, ConfigKey>>>(\r
    {} as Required<Pick<ScrollExpandProps, ConfigKey>>\r
  );\r
  propsRef.current = {\r
    startWidth,\r
    startHeight,\r
    startRadius,\r
    endRadius,\r
    mediaZoom,\r
    scrollDistance,\r
    holdDistance,\r
    smoothing,\r
    overlayScrim,\r
    useWindowScroll,\r
    enabled\r
  };\r
\r
  const applyProgress = useCallback((p: number) => {\r
    const frame = frameRef.current;\r
    const media = mediaRef.current;\r
    if (!frame || !media) return;\r
    const c = propsRef.current;\r
\r
    const e = smoothstep(0, 1, p);\r
\r
    const w = c.startWidth + (100 - c.startWidth) * e;\r
    const h = c.startHeight + (100 - c.startHeight) * e;\r
    const ix = Math.max(0, (100 - w) / 2);\r
    const iy = Math.max(0, (100 - h) / 2);\r
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;\r
    frame.style.clipPath = \`inset(\${iy}% \${ix}% \${iy}% \${ix}% round \${r}px)\`;\r
\r
    media.style.transform = \`scale(\${c.mediaZoom + (1 - c.mediaZoom) * e})\`;\r
\r
    if (scrimRef.current) scrimRef.current.style.opacity = \`\${c.overlayScrim * e}\`;\r
\r
    if (titleRef.current) {\r
      const out = smoothstep(0.4, 0.88, p);\r
      titleRef.current.style.opacity = \`\${1 - out}\`;\r
      titleRef.current.style.transform = \`translate3d(0, \${-28 * out}px, 0) scale(\${1 + 0.06 * out})\`;\r
    }\r
\r
    if (hintRef.current) {\r
      const gone = smoothstep(0, 0.12, p);\r
      hintRef.current.style.opacity = \`\${1 - gone}\`;\r
      hintRef.current.style.transform = \`translate3d(0, \${8 * gone}px, 0)\`;\r
    }\r
\r
    if (overlayRef.current) {\r
      const inn = smoothstep(0.68, 1, p);\r
      overlayRef.current.style.opacity = \`\${inn}\`;\r
      overlayRef.current.style.transform = \`translate3d(0, \${18 * (1 - inn)}px, 0)\`;\r
    }\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const track = trackRef.current;\r
    const stage = stageRef.current;\r
    if (!root || !track || !stage) return;\r
\r
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    let raf = 0;\r
    let current = 0;\r
    let target = 0;\r
    let stageH = 0;\r
    let running = false;\r
\r
    const measure = () => {\r
      const c = propsRef.current;\r
      stageH = c.useWindowScroll ? window.innerHeight : root.clientHeight;\r
      if (stageH <= 0) return;\r
      stage.style.height = \`\${stageH}px\`;\r
      track.style.height = \`\${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px\`;\r
\r
      const w = root.clientWidth || stageH;\r
      stage.style.setProperty('--se-title-size', \`\${clamp(w * 0.075, 20, 84)}px\`);\r
    };\r
\r
    const readProgress = () => {\r
      const c = propsRef.current;\r
      if (!c.enabled) return 1;\r
      const span = stageH * Math.max(0.01, c.scrollDistance);\r
      if (c.useWindowScroll) {\r
        const top = track.getBoundingClientRect().top;\r
        return clamp(-top / span, 0, 1);\r
      }\r
      return clamp(root.scrollTop / span, 0, 1);\r
    };\r
\r
    const tick = () => {\r
      const c = propsRef.current;\r
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));\r
      current += (target - current) * k;\r
      if (Math.abs(target - current) < 0.0004) {\r
        current = target;\r
        running = false;\r
      }\r
      applyProgress(current);\r
      raf = running ? requestAnimationFrame(tick) : 0;\r
    };\r
\r
    const kick = () => {\r
      if (running) return;\r
      running = true;\r
      if (!raf) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const onScroll = () => {\r
      target = readProgress();\r
      if (propsRef.current.smoothing <= 0 || reduceMotion) {\r
        current = target;\r
        applyProgress(current);\r
        return;\r
      }\r
      kick();\r
    };\r
\r
    const onResize = () => {\r
      measure();\r
      target = readProgress();\r
      current = target;\r
      applyProgress(current);\r
    };\r
\r
    measure();\r
    target = readProgress();\r
    current = target;\r
    applyProgress(current);\r
\r
    const scroller = useWindowScroll ? window : root;\r
    scroller.addEventListener('scroll', onScroll, { passive: true });\r
    window.addEventListener('resize', onResize);\r
    const ro = new ResizeObserver(onResize);\r
    ro.observe(root);\r
\r
    return () => {\r
      if (raf) cancelAnimationFrame(raf);\r
      scroller.removeEventListener('scroll', onScroll);\r
      window.removeEventListener('resize', onResize);\r
      ro.disconnect();\r
    };\r
  }, [applyProgress, useWindowScroll]);\r
\r
  const media =\r
    mediaType === 'video' ? (\r
      <video\r
        ref={mediaRef}\r
        className="scroll-expand__media"\r
        src={src}\r
        poster={poster}\r
        autoPlay\r
        muted\r
        loop\r
        playsInline\r
      />\r
    ) : (\r
      <img ref={mediaRef} className="scroll-expand__media" src={src} alt={alt} draggable={false} />\r
    );\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`scroll-expand \${useWindowScroll ? '' : 'scroll-expand--scroller'} \${className}\`.trim()}\r
      style={style}\r
      {...rest}\r
    >\r
      <div ref={trackRef} className="scroll-expand__track">\r
        <div ref={stageRef} className="scroll-expand__stage">\r
          <div ref={frameRef} className="scroll-expand__frame">\r
            {media}\r
            <div ref={scrimRef} className="scroll-expand__scrim" />\r
            {children ? (\r
              <div ref={overlayRef} className="scroll-expand__overlay">\r
                {children}\r
              </div>\r
            ) : null}\r
          </div>\r
          {title ? (\r
            <div ref={titleRef} className="scroll-expand__title">\r
              {title}\r
            </div>\r
          ) : null}\r
          {scrollHint ? (\r
            <div ref={hintRef} className="scroll-expand__hint">\r
              {scrollHint}\r
            </div>\r
          ) : null}\r
        </div>\r
      </div>\r
    </div>\r
  );\r
};\r
\r
export default ScrollExpand;\r
`,s=`'use client';\r
\r
import { useCallback, useEffect, useRef } from 'react';\r
import type { CSSProperties, ReactNode } from 'react';\r
\r
const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);\r
\r
const smoothstep = (edge0: number, edge1: number, x: number): number => {\r
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);\r
  return t * t * (3 - 2 * t);\r
};\r
\r
type ConfigKey =\r
  | 'startWidth'\r
  | 'startHeight'\r
  | 'startRadius'\r
  | 'endRadius'\r
  | 'mediaZoom'\r
  | 'scrollDistance'\r
  | 'holdDistance'\r
  | 'smoothing'\r
  | 'overlayScrim'\r
  | 'useWindowScroll'\r
  | 'enabled';\r
\r
export interface ScrollExpandProps {\r
  src?: string;\r
  mediaType?: 'image' | 'video';\r
  poster?: string;\r
  alt?: string;\r
  title?: string;\r
  scrollHint?: string;\r
  startWidth?: number;\r
  startHeight?: number;\r
  startRadius?: number;\r
  endRadius?: number;\r
  mediaZoom?: number;\r
  scrollDistance?: number;\r
  holdDistance?: number;\r
  smoothing?: number;\r
  overlayScrim?: number;\r
  useWindowScroll?: boolean;\r
  enabled?: boolean;\r
  children?: ReactNode;\r
  className?: string;\r
  style?: CSSProperties;\r
  [key: string]: unknown;\r
}\r
\r
const ScrollExpand: React.FC<ScrollExpandProps> = ({\r
  src = '',\r
  mediaType = 'image',\r
  poster = '',\r
  alt = '',\r
  title = '',\r
  scrollHint = '',\r
  startWidth = 42,\r
  startHeight = 58,\r
  startRadius = 24,\r
  endRadius = 0,\r
  mediaZoom = 1.35,\r
  scrollDistance = 1.2,\r
  holdDistance = 0.35,\r
  smoothing = 0.1,\r
  overlayScrim = 0.45,\r
  useWindowScroll = false,\r
  enabled = true,\r
  children,\r
  className = '',\r
  style,\r
  ...rest\r
}: ScrollExpandProps) => {\r
  const rootRef = useRef<HTMLDivElement | null>(null);\r
  const trackRef = useRef<HTMLDivElement | null>(null);\r
  const stageRef = useRef<HTMLDivElement | null>(null);\r
  const frameRef = useRef<HTMLDivElement | null>(null);\r
  const mediaRef = useRef<HTMLImageElement & HTMLVideoElement>(null);\r
  const titleRef = useRef<HTMLDivElement | null>(null);\r
  const overlayRef = useRef<HTMLDivElement | null>(null);\r
  const scrimRef = useRef<HTMLDivElement | null>(null);\r
  const hintRef = useRef<HTMLDivElement | null>(null);\r
\r
  const propsRef = useRef<Required<Pick<ScrollExpandProps, ConfigKey>>>(\r
    {} as Required<Pick<ScrollExpandProps, ConfigKey>>\r
  );\r
  propsRef.current = {\r
    startWidth,\r
    startHeight,\r
    startRadius,\r
    endRadius,\r
    mediaZoom,\r
    scrollDistance,\r
    holdDistance,\r
    smoothing,\r
    overlayScrim,\r
    useWindowScroll,\r
    enabled\r
  };\r
\r
  const applyProgress = useCallback((p: number) => {\r
    const frame = frameRef.current;\r
    const media = mediaRef.current;\r
    if (!frame || !media) return;\r
    const c = propsRef.current;\r
\r
    const e = smoothstep(0, 1, p);\r
\r
    const w = c.startWidth + (100 - c.startWidth) * e;\r
    const h = c.startHeight + (100 - c.startHeight) * e;\r
    const ix = Math.max(0, (100 - w) / 2);\r
    const iy = Math.max(0, (100 - h) / 2);\r
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;\r
    frame.style.clipPath = \`inset(\${iy}% \${ix}% \${iy}% \${ix}% round \${r}px)\`;\r
\r
    media.style.transform = \`scale(\${c.mediaZoom + (1 - c.mediaZoom) * e})\`;\r
\r
    if (scrimRef.current) scrimRef.current.style.opacity = \`\${c.overlayScrim * e}\`;\r
\r
    if (titleRef.current) {\r
      const out = smoothstep(0.4, 0.88, p);\r
      titleRef.current.style.opacity = \`\${1 - out}\`;\r
      titleRef.current.style.transform = \`translate3d(0, \${-28 * out}px, 0) scale(\${1 + 0.06 * out})\`;\r
    }\r
\r
    if (hintRef.current) {\r
      const gone = smoothstep(0, 0.12, p);\r
      hintRef.current.style.opacity = \`\${1 - gone}\`;\r
      hintRef.current.style.transform = \`translate3d(0, \${8 * gone}px, 0)\`;\r
    }\r
\r
    if (overlayRef.current) {\r
      const inn = smoothstep(0.68, 1, p);\r
      overlayRef.current.style.opacity = \`\${inn}\`;\r
      overlayRef.current.style.transform = \`translate3d(0, \${18 * (1 - inn)}px, 0)\`;\r
    }\r
  }, []);\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const track = trackRef.current;\r
    const stage = stageRef.current;\r
    if (!root || !track || !stage) return;\r
\r
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\r
\r
    let raf = 0;\r
    let current = 0;\r
    let target = 0;\r
    let stageH = 0;\r
    let running = false;\r
\r
    const measure = () => {\r
      const c = propsRef.current;\r
      stageH = c.useWindowScroll ? window.innerHeight : root.clientHeight;\r
      if (stageH <= 0) return;\r
      stage.style.height = \`\${stageH}px\`;\r
      track.style.height = \`\${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px\`;\r
\r
      const w = root.clientWidth || stageH;\r
      stage.style.setProperty('--se-title-size', \`\${clamp(w * 0.075, 20, 84)}px\`);\r
    };\r
\r
    const readProgress = () => {\r
      const c = propsRef.current;\r
      if (!c.enabled) return 1;\r
      const span = stageH * Math.max(0.01, c.scrollDistance);\r
      if (c.useWindowScroll) {\r
        const top = track.getBoundingClientRect().top;\r
        return clamp(-top / span, 0, 1);\r
      }\r
      return clamp(root.scrollTop / span, 0, 1);\r
    };\r
\r
    const tick = () => {\r
      const c = propsRef.current;\r
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));\r
      current += (target - current) * k;\r
      if (Math.abs(target - current) < 0.0004) {\r
        current = target;\r
        running = false;\r
      }\r
      applyProgress(current);\r
      raf = running ? requestAnimationFrame(tick) : 0;\r
    };\r
\r
    const kick = () => {\r
      if (running) return;\r
      running = true;\r
      if (!raf) raf = requestAnimationFrame(tick);\r
    };\r
\r
    const onScroll = () => {\r
      target = readProgress();\r
      if (propsRef.current.smoothing <= 0 || reduceMotion) {\r
        current = target;\r
        applyProgress(current);\r
        return;\r
      }\r
      kick();\r
    };\r
\r
    const onResize = () => {\r
      measure();\r
      target = readProgress();\r
      current = target;\r
      applyProgress(current);\r
    };\r
\r
    measure();\r
    target = readProgress();\r
    current = target;\r
    applyProgress(current);\r
\r
    const scroller = useWindowScroll ? window : root;\r
    scroller.addEventListener('scroll', onScroll, { passive: true });\r
    window.addEventListener('resize', onResize);\r
    const ro = new ResizeObserver(onResize);\r
    ro.observe(root);\r
\r
    return () => {\r
      if (raf) cancelAnimationFrame(raf);\r
      scroller.removeEventListener('scroll', onScroll);\r
      window.removeEventListener('resize', onResize);\r
      ro.disconnect();\r
    };\r
  }, [applyProgress, useWindowScroll]);\r
\r
  const media =\r
    mediaType === 'video' ? (\r
      <video\r
        ref={mediaRef}\r
        className="absolute inset-0 w-full h-full object-cover origin-center select-none [will-change:transform]"\r
        src={src}\r
        poster={poster}\r
        autoPlay\r
        muted\r
        loop\r
        playsInline\r
      />\r
    ) : (\r
      <img\r
        ref={mediaRef}\r
        className="absolute inset-0 w-full h-full object-cover origin-center select-none [will-change:transform]"\r
        src={src}\r
        alt={alt}\r
        draggable={false}\r
      />\r
    );\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`relative w-full h-full \${useWindowScroll ? '' : 'overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'} \${className}\`.trim()}\r
      style={style}\r
      {...rest}\r
    >\r
      <div ref={trackRef} className="relative w-full">\r
        <div ref={stageRef} className="sticky top-0 w-full overflow-hidden [--se-title-size:4rem]">\r
          <div\r
            ref={frameRef}\r
            className="absolute inset-0 [clip-path:inset(21%_29%_21%_29%_round_24px)] [will-change:clip-path]"\r
          >\r
            {media}\r
            <div\r
              ref={scrimRef}\r
              className="absolute inset-0 opacity-0 pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.75),rgba(0,0,0,0.1)_45%,rgba(0,0,0,0.35))]"\r
            />\r
            {children ? (\r
              <div\r
                ref={overlayRef}\r
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-[6%] opacity-0 [will-change:opacity,transform]"\r
              >\r
                {children}\r
              </div>\r
            ) : null}\r
          </div>\r
          {title ? (\r
            <div\r
              ref={titleRef}\r
              className="absolute inset-0 flex items-center justify-center m-0 px-[6%] text-center font-bold leading-none tracking-[-0.03em] text-white [font-size:var(--se-title-size)] [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] pointer-events-none [will-change:opacity,transform]"\r
            >\r
              {title}\r
            </div>\r
          ) : null}\r
          {scrollHint ? (\r
            <div\r
              ref={hintRef}\r
              className="absolute inset-x-0 bottom-5 text-center text-[0.8125rem] tracking-[0.02em] text-white/55 pointer-events-none [will-change:opacity,transform]"\r
            >\r
              {scrollHint}\r
            </div>\r
          ) : null}\r
        </div>\r
      </div>\r
    </div>\r
  );\r
};\r
\r
export default ScrollExpand;\r
`,o={usage:`import ScrollExpand from './ScrollExpand';

<ScrollExpand
  src="/hero.jpg"
  alt="Product hero"
  title="Built to scale"
  scrollHint="Scroll"
  useWindowScroll
>
  <h2>Every pixel, everywhere</h2>
  <p>The frame opens up as you scroll and hands the whole stage to your media.</p>
</ScrollExpand>

<div style={{ height: '520px' }}>
  <ScrollExpand src="/hero.jpg" title="Built to scale" mediaZoom={1.35} />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:s};export{o as scrollExpand};
