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
const WIPES = {\r
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  center:\r
    'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'\r
};\r
\r
const AnimatedContent = ({\r
  children,\r
  container,\r
  distance = 100,\r
  direction = 'vertical',\r
  reverse = false,\r
  duration = 0.8,\r
  ease = 'power3.out',\r
  initialOpacity = 0,\r
  animateOpacity = true,\r
  scale = 1,\r
  blur = 0,\r
  rotate = 0,\r
  tilt = 0,\r
  wipe = 'none',\r
  threshold = 0.1,\r
  delay = 0,\r
  stagger = 0,\r
  staggerFrom = 'start',\r
  trigger = 'scroll',\r
  once = true,\r
  scrub = false,\r
  disappearAfter = 0,\r
  disappearDuration = 0.5,\r
  disappearEase = 'power3.in',\r
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
    let scroller = container || document.getElementById('snap-main-container') || null;\r
    if (typeof scroller === 'string') scroller = document.querySelector(scroller);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const ctx = gsap.context(() => {\r
      const targets = stagger > 0 && el.children.length ? Array.from(el.children) : [el];\r
      const horizontal = direction === 'horizontal';\r
      const axis = horizontal ? 'x' : 'y';\r
      const sign = reverse ? -1 : 1;\r
      const mask = WIPES[wipe];\r
\r
      gsap.set(el, { visibility: 'visible' });\r
\r
      if (reduce) {\r
        callbacksRef.current.onComplete?.();\r
        return;\r
      }\r
\r
      const from = {\r
        [axis]: distance * sign,\r
        scale,\r
        opacity: animateOpacity ? initialOpacity : 1\r
      };\r
      const to = {\r
        [axis]: 0,\r
        scale: 1,\r
        opacity: 1,\r
        duration,\r
        ease\r
      };\r
\r
      if (blur > 0) {\r
        from.filter = \`blur(\${blur}px)\`;\r
        to.filter = 'blur(0px)';\r
      }\r
      if (rotate) {\r
        from.rotation = rotate * sign;\r
        to.rotation = 0;\r
      }\r
      if (tilt) {\r
        const tiltAxis = horizontal ? 'rotationY' : 'rotationX';\r
        from[tiltAxis] = horizontal ? -tilt * sign : tilt * sign;\r
        to[tiltAxis] = 0;\r
        from.transformPerspective = 900;\r
        to.transformPerspective = 900;\r
      }\r
      if (mask) {\r
        gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });\r
        from['--ac-wipe'] = 0;\r
        to['--ac-wipe'] = 1;\r
      }\r
      if (stagger > 0) to.stagger = { each: stagger, from: staggerFrom };\r
\r
      const settle = () => {\r
        if (scrub) return;\r
        gsap.set(targets, { clearProps: mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform' });\r
      };\r
\r
      const disappear = () => {\r
        if (disappearAfter <= 0) return;\r
        const out = {\r
          [axis]: -distance * sign,\r
          scale: 0.8,\r
          opacity: animateOpacity ? initialOpacity : 0,\r
          delay: disappearAfter,\r
          duration: disappearDuration,\r
          ease: disappearEase,\r
          onComplete: () => callbacksRef.current.onDisappearanceComplete?.()\r
        };\r
        if (blur > 0) out.filter = \`blur(\${blur}px)\`;\r
        if (stagger > 0) out.stagger = { each: stagger, from: staggerFrom };\r
        gsap.to(targets, out);\r
      };\r
\r
      const tl = gsap.timeline({\r
        paused: true,\r
        onStart: () => callbacksRef.current.onStart?.(),\r
        onComplete: () => {\r
          callbacksRef.current.onComplete?.();\r
          settle();\r
          if (once && !scrub) disappear();\r
        }\r
      });\r
      tl.fromTo(targets, from, to, scrub ? 0 : Math.max(delay, 0));\r
\r
      if (trigger === 'mount') {\r
        tl.play();\r
        return;\r
      }\r
\r
      const start = \`top \${(1 - threshold) * 100}%\`;\r
\r
      if (scrub) {\r
        ScrollTrigger.create({\r
          trigger: el,\r
          scroller,\r
          start,\r
          end: \`top \${Math.max((1 - threshold) * 100 - 45, 5)}%\`,\r
          scrub: scrub === true ? true : Math.max(Number(scrub) || 0, 0.01),\r
          animation: tl\r
        });\r
        return;\r
      }\r
\r
      ScrollTrigger.create({\r
        trigger: el,\r
        scroller,\r
        start,\r
        once,\r
        onEnter: () => tl.play(),\r
        onLeaveBack: once\r
          ? undefined\r
          : () => {\r
              if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });\r
              tl.reverse();\r
            }\r
      });\r
    }, el);\r
\r
    return () => ctx.revert();\r
  }, [\r
    container,\r
    distance,\r
    direction,\r
    reverse,\r
    duration,\r
    ease,\r
    initialOpacity,\r
    animateOpacity,\r
    scale,\r
    blur,\r
    rotate,\r
    tilt,\r
    wipe,\r
    threshold,\r
    delay,\r
    stagger,\r
    staggerFrom,\r
    trigger,\r
    once,\r
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
export default AnimatedContent;\r
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
const WIPES = {\r
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  center:\r
    'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'\r
};\r
\r
const AnimatedContent = ({\r
  children,\r
  container,\r
  distance = 100,\r
  direction = 'vertical',\r
  reverse = false,\r
  duration = 0.8,\r
  ease = 'power3.out',\r
  initialOpacity = 0,\r
  animateOpacity = true,\r
  scale = 1,\r
  blur = 0,\r
  rotate = 0,\r
  tilt = 0,\r
  wipe = 'none',\r
  threshold = 0.1,\r
  delay = 0,\r
  stagger = 0,\r
  staggerFrom = 'start',\r
  trigger = 'scroll',\r
  once = true,\r
  scrub = false,\r
  disappearAfter = 0,\r
  disappearDuration = 0.5,\r
  disappearEase = 'power3.in',\r
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
    let scroller = container || document.getElementById('snap-main-container') || null;\r
    if (typeof scroller === 'string') scroller = document.querySelector(scroller);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const ctx = gsap.context(() => {\r
      const targets = stagger > 0 && el.children.length ? Array.from(el.children) : [el];\r
      const horizontal = direction === 'horizontal';\r
      const axis = horizontal ? 'x' : 'y';\r
      const sign = reverse ? -1 : 1;\r
      const mask = WIPES[wipe];\r
\r
      gsap.set(el, { visibility: 'visible' });\r
\r
      if (reduce) {\r
        callbacksRef.current.onComplete?.();\r
        return;\r
      }\r
\r
      const from = {\r
        [axis]: distance * sign,\r
        scale,\r
        opacity: animateOpacity ? initialOpacity : 1\r
      };\r
      const to = {\r
        [axis]: 0,\r
        scale: 1,\r
        opacity: 1,\r
        duration,\r
        ease\r
      };\r
\r
      if (blur > 0) {\r
        from.filter = \`blur(\${blur}px)\`;\r
        to.filter = 'blur(0px)';\r
      }\r
      if (rotate) {\r
        from.rotation = rotate * sign;\r
        to.rotation = 0;\r
      }\r
      if (tilt) {\r
        const tiltAxis = horizontal ? 'rotationY' : 'rotationX';\r
        from[tiltAxis] = horizontal ? -tilt * sign : tilt * sign;\r
        to[tiltAxis] = 0;\r
        from.transformPerspective = 900;\r
        to.transformPerspective = 900;\r
      }\r
      if (mask) {\r
        gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });\r
        from['--ac-wipe'] = 0;\r
        to['--ac-wipe'] = 1;\r
      }\r
      if (stagger > 0) to.stagger = { each: stagger, from: staggerFrom };\r
\r
      const settle = () => {\r
        if (scrub) return;\r
        gsap.set(targets, { clearProps: mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform' });\r
      };\r
\r
      const disappear = () => {\r
        if (disappearAfter <= 0) return;\r
        const out = {\r
          [axis]: -distance * sign,\r
          scale: 0.8,\r
          opacity: animateOpacity ? initialOpacity : 0,\r
          delay: disappearAfter,\r
          duration: disappearDuration,\r
          ease: disappearEase,\r
          onComplete: () => callbacksRef.current.onDisappearanceComplete?.()\r
        };\r
        if (blur > 0) out.filter = \`blur(\${blur}px)\`;\r
        if (stagger > 0) out.stagger = { each: stagger, from: staggerFrom };\r
        gsap.to(targets, out);\r
      };\r
\r
      const tl = gsap.timeline({\r
        paused: true,\r
        onStart: () => callbacksRef.current.onStart?.(),\r
        onComplete: () => {\r
          callbacksRef.current.onComplete?.();\r
          settle();\r
          if (once && !scrub) disappear();\r
        }\r
      });\r
      tl.fromTo(targets, from, to, scrub ? 0 : Math.max(delay, 0));\r
\r
      if (trigger === 'mount') {\r
        tl.play();\r
        return;\r
      }\r
\r
      const start = \`top \${(1 - threshold) * 100}%\`;\r
\r
      if (scrub) {\r
        ScrollTrigger.create({\r
          trigger: el,\r
          scroller,\r
          start,\r
          end: \`top \${Math.max((1 - threshold) * 100 - 45, 5)}%\`,\r
          scrub: scrub === true ? true : Math.max(Number(scrub) || 0, 0.01),\r
          animation: tl\r
        });\r
        return;\r
      }\r
\r
      ScrollTrigger.create({\r
        trigger: el,\r
        scroller,\r
        start,\r
        once,\r
        onEnter: () => tl.play(),\r
        onLeaveBack: once\r
          ? undefined\r
          : () => {\r
              if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });\r
              tl.reverse();\r
            }\r
      });\r
    }, el);\r
\r
    return () => ctx.revert();\r
  }, [\r
    container,\r
    distance,\r
    direction,\r
    reverse,\r
    duration,\r
    ease,\r
    initialOpacity,\r
    animateOpacity,\r
    scale,\r
    blur,\r
    rotate,\r
    tilt,\r
    wipe,\r
    threshold,\r
    delay,\r
    stagger,\r
    staggerFrom,\r
    trigger,\r
    once,\r
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
export default AnimatedContent;\r
`,e=`'use client';\r
\r
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';\r
import { gsap } from 'gsap';\r
import { ScrollTrigger } from 'gsap/ScrollTrigger';\r
\r
gsap.registerPlugin(ScrollTrigger);\r
\r
export type AnimatedContentWipe = 'none' | 'up' | 'down' | 'left' | 'right' | 'center';\r
export type AnimatedContentStaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random';\r
\r
export interface AnimatedContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart'> {\r
  children?: ReactNode;\r
  container?: Element | string | null;\r
  distance?: number;\r
  direction?: 'vertical' | 'horizontal';\r
  reverse?: boolean;\r
  duration?: number;\r
  ease?: string;\r
  initialOpacity?: number;\r
  animateOpacity?: boolean;\r
  scale?: number;\r
  blur?: number;\r
  rotate?: number;\r
  tilt?: number;\r
  wipe?: AnimatedContentWipe;\r
  threshold?: number;\r
  delay?: number;\r
  stagger?: number;\r
  staggerFrom?: AnimatedContentStaggerFrom;\r
  trigger?: 'scroll' | 'mount';\r
  once?: boolean;\r
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
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;\r
\r
const WIPES: Record<string, string> = {\r
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  center:\r
    'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'\r
};\r
\r
const AnimatedContent = ({\r
  children,\r
  container,\r
  distance = 100,\r
  direction = 'vertical',\r
  reverse = false,\r
  duration = 0.8,\r
  ease = 'power3.out',\r
  initialOpacity = 0,\r
  animateOpacity = true,\r
  scale = 1,\r
  blur = 0,\r
  rotate = 0,\r
  tilt = 0,\r
  wipe = 'none',\r
  threshold = 0.1,\r
  delay = 0,\r
  stagger = 0,\r
  staggerFrom = 'start',\r
  trigger = 'scroll',\r
  once = true,\r
  scrub = false,\r
  disappearAfter = 0,\r
  disappearDuration = 0.5,\r
  disappearEase = 'power3.in',\r
  onStart,\r
  onComplete,\r
  onDisappearanceComplete,\r
  className = '',\r
  style,\r
  ...props\r
}: AnimatedContentProps) => {\r
  const ref = useRef<HTMLDivElement>(null);\r
  const callbacksRef = useRef({ onStart, onComplete, onDisappearanceComplete });\r
  callbacksRef.current = { onStart, onComplete, onDisappearanceComplete };\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const el = ref.current;\r
    if (!el) return undefined;\r
\r
    let scroller: Element | string | null = container || document.getElementById('snap-main-container') || null;\r
    if (typeof scroller === 'string') scroller = document.querySelector(scroller);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const ctx = gsap.context(() => {\r
      const targets: Element[] = stagger > 0 && el.children.length ? Array.from(el.children) : [el];\r
      const horizontal = direction === 'horizontal';\r
      const axis = horizontal ? 'x' : 'y';\r
      const sign = reverse ? -1 : 1;\r
      const mask = WIPES[wipe];\r
\r
      gsap.set(el, { visibility: 'visible' });\r
\r
      if (reduce) {\r
        callbacksRef.current.onComplete?.();\r
        return;\r
      }\r
\r
      const from: gsap.TweenVars = {\r
        [axis]: distance * sign,\r
        scale,\r
        opacity: animateOpacity ? initialOpacity : 1\r
      };\r
      const to: gsap.TweenVars = {\r
        [axis]: 0,\r
        scale: 1,\r
        opacity: 1,\r
        duration,\r
        ease\r
      };\r
\r
      if (blur > 0) {\r
        from.filter = \`blur(\${blur}px)\`;\r
        to.filter = 'blur(0px)';\r
      }\r
      if (rotate) {\r
        from.rotation = rotate * sign;\r
        to.rotation = 0;\r
      }\r
      if (tilt) {\r
        const tiltAxis = horizontal ? 'rotationY' : 'rotationX';\r
        from[tiltAxis] = horizontal ? -tilt * sign : tilt * sign;\r
        to[tiltAxis] = 0;\r
        from.transformPerspective = 900;\r
        to.transformPerspective = 900;\r
      }\r
      if (mask) {\r
        gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });\r
        from['--ac-wipe'] = 0;\r
        to['--ac-wipe'] = 1;\r
      }\r
      if (stagger > 0) to.stagger = { each: stagger, from: staggerFrom };\r
\r
      const settle = () => {\r
        if (scrub) return;\r
        gsap.set(targets, { clearProps: mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform' });\r
      };\r
\r
      const disappear = () => {\r
        if (disappearAfter <= 0) return;\r
        const out: gsap.TweenVars = {\r
          [axis]: -distance * sign,\r
          scale: 0.8,\r
          opacity: animateOpacity ? initialOpacity : 0,\r
          delay: disappearAfter,\r
          duration: disappearDuration,\r
          ease: disappearEase,\r
          onComplete: () => callbacksRef.current.onDisappearanceComplete?.()\r
        };\r
        if (blur > 0) out.filter = \`blur(\${blur}px)\`;\r
        if (stagger > 0) out.stagger = { each: stagger, from: staggerFrom };\r
        gsap.to(targets, out);\r
      };\r
\r
      const tl = gsap.timeline({\r
        paused: true,\r
        onStart: () => callbacksRef.current.onStart?.(),\r
        onComplete: () => {\r
          callbacksRef.current.onComplete?.();\r
          settle();\r
          if (once && !scrub) disappear();\r
        }\r
      });\r
      tl.fromTo(targets, from, to, scrub ? 0 : Math.max(delay, 0));\r
\r
      if (trigger === 'mount') {\r
        tl.play();\r
        return;\r
      }\r
\r
      const start = \`top \${(1 - threshold) * 100}%\`;\r
\r
      if (scrub) {\r
        ScrollTrigger.create({\r
          trigger: el,\r
          scroller,\r
          start,\r
          end: \`top \${Math.max((1 - threshold) * 100 - 45, 5)}%\`,\r
          scrub: scrub === true ? true : Math.max(Number(scrub) || 0, 0.01),\r
          animation: tl\r
        });\r
        return;\r
      }\r
\r
      ScrollTrigger.create({\r
        trigger: el,\r
        scroller,\r
        start,\r
        once,\r
        onEnter: () => tl.play(),\r
        onLeaveBack: once\r
          ? undefined\r
          : () => {\r
              if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });\r
              tl.reverse();\r
            }\r
      });\r
    }, el);\r
\r
    return () => ctx.revert();\r
  }, [\r
    container,\r
    distance,\r
    direction,\r
    reverse,\r
    duration,\r
    ease,\r
    initialOpacity,\r
    animateOpacity,\r
    scale,\r
    blur,\r
    rotate,\r
    tilt,\r
    wipe,\r
    threshold,\r
    delay,\r
    stagger,\r
    staggerFrom,\r
    trigger,\r
    once,\r
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
export default AnimatedContent;\r
`,t=`'use client';\r
\r
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';\r
import { gsap } from 'gsap';\r
import { ScrollTrigger } from 'gsap/ScrollTrigger';\r
\r
gsap.registerPlugin(ScrollTrigger);\r
\r
export type AnimatedContentWipe = 'none' | 'up' | 'down' | 'left' | 'right' | 'center';\r
export type AnimatedContentStaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random';\r
\r
export interface AnimatedContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart'> {\r
  children?: ReactNode;\r
  container?: Element | string | null;\r
  distance?: number;\r
  direction?: 'vertical' | 'horizontal';\r
  reverse?: boolean;\r
  duration?: number;\r
  ease?: string;\r
  initialOpacity?: number;\r
  animateOpacity?: boolean;\r
  scale?: number;\r
  blur?: number;\r
  rotate?: number;\r
  tilt?: number;\r
  wipe?: AnimatedContentWipe;\r
  threshold?: number;\r
  delay?: number;\r
  stagger?: number;\r
  staggerFrom?: AnimatedContentStaggerFrom;\r
  trigger?: 'scroll' | 'mount';\r
  once?: boolean;\r
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
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;\r
\r
const WIPES: Record<string, string> = {\r
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',\r
  center:\r
    'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'\r
};\r
\r
const AnimatedContent = ({\r
  children,\r
  container,\r
  distance = 100,\r
  direction = 'vertical',\r
  reverse = false,\r
  duration = 0.8,\r
  ease = 'power3.out',\r
  initialOpacity = 0,\r
  animateOpacity = true,\r
  scale = 1,\r
  blur = 0,\r
  rotate = 0,\r
  tilt = 0,\r
  wipe = 'none',\r
  threshold = 0.1,\r
  delay = 0,\r
  stagger = 0,\r
  staggerFrom = 'start',\r
  trigger = 'scroll',\r
  once = true,\r
  scrub = false,\r
  disappearAfter = 0,\r
  disappearDuration = 0.5,\r
  disappearEase = 'power3.in',\r
  onStart,\r
  onComplete,\r
  onDisappearanceComplete,\r
  className = '',\r
  style,\r
  ...props\r
}: AnimatedContentProps) => {\r
  const ref = useRef<HTMLDivElement>(null);\r
  const callbacksRef = useRef({ onStart, onComplete, onDisappearanceComplete });\r
  callbacksRef.current = { onStart, onComplete, onDisappearanceComplete };\r
\r
  useIsomorphicLayoutEffect(() => {\r
    const el = ref.current;\r
    if (!el) return undefined;\r
\r
    let scroller: Element | string | null = container || document.getElementById('snap-main-container') || null;\r
    if (typeof scroller === 'string') scroller = document.querySelector(scroller);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    const ctx = gsap.context(() => {\r
      const targets: Element[] = stagger > 0 && el.children.length ? Array.from(el.children) : [el];\r
      const horizontal = direction === 'horizontal';\r
      const axis = horizontal ? 'x' : 'y';\r
      const sign = reverse ? -1 : 1;\r
      const mask = WIPES[wipe];\r
\r
      gsap.set(el, { visibility: 'visible' });\r
\r
      if (reduce) {\r
        callbacksRef.current.onComplete?.();\r
        return;\r
      }\r
\r
      const from: gsap.TweenVars = {\r
        [axis]: distance * sign,\r
        scale,\r
        opacity: animateOpacity ? initialOpacity : 1\r
      };\r
      const to: gsap.TweenVars = {\r
        [axis]: 0,\r
        scale: 1,\r
        opacity: 1,\r
        duration,\r
        ease\r
      };\r
\r
      if (blur > 0) {\r
        from.filter = \`blur(\${blur}px)\`;\r
        to.filter = 'blur(0px)';\r
      }\r
      if (rotate) {\r
        from.rotation = rotate * sign;\r
        to.rotation = 0;\r
      }\r
      if (tilt) {\r
        const tiltAxis = horizontal ? 'rotationY' : 'rotationX';\r
        from[tiltAxis] = horizontal ? -tilt * sign : tilt * sign;\r
        to[tiltAxis] = 0;\r
        from.transformPerspective = 900;\r
        to.transformPerspective = 900;\r
      }\r
      if (mask) {\r
        gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });\r
        from['--ac-wipe'] = 0;\r
        to['--ac-wipe'] = 1;\r
      }\r
      if (stagger > 0) to.stagger = { each: stagger, from: staggerFrom };\r
\r
      const settle = () => {\r
        if (scrub) return;\r
        gsap.set(targets, { clearProps: mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform' });\r
      };\r
\r
      const disappear = () => {\r
        if (disappearAfter <= 0) return;\r
        const out: gsap.TweenVars = {\r
          [axis]: -distance * sign,\r
          scale: 0.8,\r
          opacity: animateOpacity ? initialOpacity : 0,\r
          delay: disappearAfter,\r
          duration: disappearDuration,\r
          ease: disappearEase,\r
          onComplete: () => callbacksRef.current.onDisappearanceComplete?.()\r
        };\r
        if (blur > 0) out.filter = \`blur(\${blur}px)\`;\r
        if (stagger > 0) out.stagger = { each: stagger, from: staggerFrom };\r
        gsap.to(targets, out);\r
      };\r
\r
      const tl = gsap.timeline({\r
        paused: true,\r
        onStart: () => callbacksRef.current.onStart?.(),\r
        onComplete: () => {\r
          callbacksRef.current.onComplete?.();\r
          settle();\r
          if (once && !scrub) disappear();\r
        }\r
      });\r
      tl.fromTo(targets, from, to, scrub ? 0 : Math.max(delay, 0));\r
\r
      if (trigger === 'mount') {\r
        tl.play();\r
        return;\r
      }\r
\r
      const start = \`top \${(1 - threshold) * 100}%\`;\r
\r
      if (scrub) {\r
        ScrollTrigger.create({\r
          trigger: el,\r
          scroller,\r
          start,\r
          end: \`top \${Math.max((1 - threshold) * 100 - 45, 5)}%\`,\r
          scrub: scrub === true ? true : Math.max(Number(scrub) || 0, 0.01),\r
          animation: tl\r
        });\r
        return;\r
      }\r
\r
      ScrollTrigger.create({\r
        trigger: el,\r
        scroller,\r
        start,\r
        once,\r
        onEnter: () => tl.play(),\r
        onLeaveBack: once\r
          ? undefined\r
          : () => {\r
              if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });\r
              tl.reverse();\r
            }\r
      });\r
    }, el);\r
\r
    return () => ctx.revert();\r
  }, [\r
    container,\r
    distance,\r
    direction,\r
    reverse,\r
    duration,\r
    ease,\r
    initialOpacity,\r
    animateOpacity,\r
    scale,\r
    blur,\r
    rotate,\r
    tilt,\r
    wipe,\r
    threshold,\r
    delay,\r
    stagger,\r
    staggerFrom,\r
    trigger,\r
    once,\r
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
export default AnimatedContent;\r
`,a={dependencies:"gsap",usage:`import AnimatedContent from './AnimatedContent'

<AnimatedContent
  distance={100}
  direction="vertical"
  duration={0.8}
  ease="power3.out"
  blur={0}
  stagger={0.08}
  threshold={0.1}
>
  <h2>Ship it before lunch</h2>
  <p>Every child animates in turn.</p>
</AnimatedContent>`,code:r,tailwind:n,tsCode:e,tsTailwind:t};export{a as animatedContent};
