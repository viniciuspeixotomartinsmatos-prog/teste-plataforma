const r=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import { Renderer, Program, Mesh, Triangle, RenderTarget, Texture } from 'ogl';\r
\r
import './MicroSlats.css';\r
\r
const SWELL_PRESETS = {\r
  swell: {\r
    scale: 1.5,\r
    speed: 0.6,\r
    direction: 250,\r
    chop: 0.55,\r
    stretch: 0,\r
    glint: 0.7,\r
    contrast: 1.25,\r
    perspective: 0.55,\r
    fog: 0.55\r
  },\r
  tide: {\r
    scale: 1.3,\r
    speed: 0.5,\r
    direction: 262,\r
    chop: 0.2,\r
    stretch: 0.12,\r
    glint: 0.45,\r
    contrast: 1.1,\r
    perspective: 0.5,\r
    fog: 0.4\r
  },\r
  storm: {\r
    scale: 0.55,\r
    speed: 1.6,\r
    direction: 236,\r
    chop: 1,\r
    stretch: 0.3,\r
    glint: 1.3,\r
    contrast: 1.8,\r
    perspective: 0.8,\r
    fog: 0.35\r
  },\r
  signal: {\r
    scale: 0.85,\r
    speed: 1.2,\r
    direction: 180,\r
    chop: 0.6,\r
    stretch: 0.85,\r
    glint: 0.25,\r
    contrast: 1.2,\r
    perspective: 0,\r
    fog: 0\r
  }\r
};\r
\r
const FLUID_SIZE = 96;\r
const PRESSURE_STEPS = 16;\r
const SPLAT_FORCE = 6900;\r
const SPLASH_JETS = 3;\r
const PIXEL_BUDGET = 4.5e6;\r
\r
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);\r
\r
const parseColor = (value, fallback) => {\r
  try {\r
    const ctx = document.createElement('canvas').getContext('2d');\r
    if (!ctx) return fallback;\r
    ctx.fillStyle = '#000000';\r
    ctx.fillStyle = value;\r
    const resolved = ctx.fillStyle;\r
    if (resolved.startsWith('#')) {\r
      const n = parseInt(resolved.slice(1), 16);\r
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];\r
    }\r
    const parts = resolved.match(/[\\d.]+/g);\r
    if (!parts || parts.length < 3) return fallback;\r
    return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255, parts[3] ? Number(parts[3]) : 1];\r
  } catch {\r
    return fallback;\r
  }\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fluidVertex = \`#version 300 es\r
in vec2 position;\r
uniform vec2 uTexel;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = position * 0.5 + 0.5;\r
  vL = vUv - vec2(uTexel.x, 0.0);\r
  vR = vUv + vec2(uTexel.x, 0.0);\r
  vT = vUv + vec2(0.0, uTexel.y);\r
  vB = vUv - vec2(0.0, uTexel.y);\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fluidHead = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
in vec2 vL;\r
in vec2 vR;\r
in vec2 vT;\r
in vec2 vB;\r
out vec4 fragColor;\r
\`;\r
\r
const splatFragment = \`\${fluidHead}\r
uniform sampler2D uTarget;\r
uniform float uAspect;\r
uniform vec2 uPoint;\r
uniform vec3 uValue;\r
uniform float uRadius;\r
void main() {\r
  vec2 offset = vUv - uPoint;\r
  offset.x *= uAspect;\r
  float falloff = exp(-dot(offset, offset) / uRadius);\r
  fragColor = vec4(texture(uTarget, vUv).xyz + uValue * falloff, 1.0);\r
}\r
\`;\r
\r
const curlFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uVelocity, vL).y;\r
  float right = texture(uVelocity, vR).y;\r
  float top = texture(uVelocity, vT).x;\r
  float bottom = texture(uVelocity, vB).x;\r
  fragColor = vec4(0.5 * (right - left - top + bottom), 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const vorticityFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uCurl;\r
uniform float uSwirl;\r
uniform float uDt;\r
void main() {\r
  float left = texture(uCurl, vL).x;\r
  float right = texture(uCurl, vR).x;\r
  float top = texture(uCurl, vT).x;\r
  float bottom = texture(uCurl, vB).x;\r
  float middle = texture(uCurl, vUv).x;\r
  vec2 force = 0.5 * vec2(abs(top) - abs(bottom), abs(right) - abs(left));\r
  force = force / (length(force) + 0.0001) * uSwirl * middle;\r
  force.y = -force.y;\r
  vec2 velocity = texture(uVelocity, vUv).xy + force * uDt;\r
  fragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);\r
}\r
\`;\r
\r
const divergenceFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
void main() {\r
  vec2 middle = texture(uVelocity, vUv).xy;\r
  float left = vL.x < 0.0 ? -middle.x : texture(uVelocity, vL).x;\r
  float right = vR.x > 1.0 ? -middle.x : texture(uVelocity, vR).x;\r
  float top = vT.y > 1.0 ? -middle.y : texture(uVelocity, vT).y;\r
  float bottom = vB.y < 0.0 ? -middle.y : texture(uVelocity, vB).y;\r
  fragColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const pressureFragment = \`\${fluidHead}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  fragColor = vec4((left + right + top + bottom - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const projectFragment = \`\${fluidHead}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\r
\`;\r
\r
const advectFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform float uDt;\r
uniform float uFade;\r
void main() {\r
  vec2 from = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;\r
  fragColor = texture(uSource, from) / (1.0 + uFade * uDt);\r
}\r
\`;\r
\r
const scaleFragment = \`\${fluidHead}\r
uniform sampler2D uSource;\r
uniform float uValue;\r
void main() {\r
  fragColor = texture(uSource, vUv) * uValue;\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
uniform vec2 uSize;\r
uniform vec4 uGrid;\r
uniform vec2 uOrigin;\r
uniform vec2 uSlat;\r
uniform float uTime;\r
uniform float uScale;\r
uniform float uDirection;\r
uniform float uChop;\r
uniform float uStretch;\r
uniform float uGlint;\r
uniform float uContrast;\r
uniform float uPerspective;\r
uniform float uFog;\r
uniform float uIntro;\r
uniform sampler2D tVelocity;\r
uniform sampler2D tInk;\r
uniform vec2 uFluidTexel;\r
uniform float uFluid;\r
uniform float uInk;\r
uniform float uLean;\r
out vec4 fragColor;\r
\r
const float TURN[4] = float[4](0.0, -0.95, 0.78, 1.62);\r
const float LENGTH[4] = float[4](2.6, 1.7, 1.12, 0.76);\r
const float HEIGHT[4] = float[4](1.0, 0.75, 0.5, 0.3);\r
const float SHIFT[4] = float[4](0.0, 2.3, 4.1, 1.1);\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  float row = uGrid.y - 1.0 - cell.y;\r
  vec2 center = uOrigin + vec2(cell.x, row) * uGrid.zw + uSlat * 0.5;\r
  float v = clamp(center.y / uSize.y, 0.0, 1.0);\r
\r
  vec2 flow = vec2(0.0);\r
  float ink = 0.0;\r
  if (uFluid > 0.5) {\r
    vec2 fluidUv = clamp(vec2(center.x / uSize.x, 1.0 - center.y / uSize.y), 0.0, 1.0);\r
    flow = texture(tVelocity, fluidUv).xy * uFluidTexel * uSize;\r
    ink = texture(tInk, fluidUv).x;\r
  }\r
\r
  float horizon = mix(8.0, 0.5, uPerspective);\r
  float depth = (1.0 + horizon) / (v + horizon);\r
  vec2 world = vec2((center.x - uSize.x * 0.5) / uSize.y * depth, (depth - 1.0) * horizon * 2.2);\r
  world -= flow * 0.00018 * depth;\r
  world /= max(uScale, 0.05);\r
\r
  float meander = 0.55 * sin(dot(world, vec2(0.23, 0.41)) * 0.9 + uTime * 0.13)\r
    + 0.3 * sin(dot(world, vec2(-0.37, 0.19)) * 1.4 - uTime * 0.09);\r
\r
  float steep = uChop * 0.45;\r
  float height = 0.0;\r
  float total = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    float angle = uDirection + TURN[i];\r
    vec2 heading = vec2(cos(angle), sin(angle));\r
    float k = 6.2831853 / LENGTH[i];\r
    float omega = sqrt(9.81 * k) * 0.35;\r
    float theta = k * dot(world, heading) - omega * uTime + SHIFT[i] + meander * (0.6 + 0.3 * float(i));\r
    height += HEIGHT[i] * (cos(theta) + steep * cos(2.0 * theta));\r
    total += HEIGHT[i] * (1.0 + steep);\r
  }\r
  float level = clamp(0.5 + 0.5 * height / (total * 0.85), 0.0, 1.0);\r
  float crest = smoothstep(0.6, 1.0, level);\r
  float glint = crest * crest * uGlint;\r
\r
  float haze = mix(1.0, 1.0 - uFog, pow(1.0 - v, 1.4));\r
  float light = (pow(level, uContrast) + glint * 0.8) * haze;\r
  float glow = 1.0 - exp(-max(ink, 0.0) * uInk * 1.6);\r
  light = 1.0 - (1.0 - clamp(light, 0.0, 1.0)) * (1.0 - glow);\r
\r
  float front = uIntro * 1.35;\r
  float reveal = 1.0 - smoothstep(front - 0.35, front, v);\r
  float sweep = exp(-pow((v - front + 0.22) / 0.07, 2.0)) * (1.0 - uIntro);\r
  light = (light + sweep * 0.8) * reveal;\r
  light = max(light, 0.045 * reveal);\r
  float span = mix(1.0 - uStretch, 1.0, level) + glow * 0.3;\r
  span = clamp(span, 0.08, 1.0) * mix(0.1, 1.0, reveal);\r
  float tint = clamp(max(glint * 1.4, glow * 0.9) + sweep, 0.0, 1.0);\r
  float lean = clamp(flow.x / 1400.0, -1.0, 1.0) * uLean * reveal;\r
\r
  fragColor = vec4(clamp(light, 0.0, 1.0), span, tint, 0.5 + 0.5 * lean);\r
}\r
\`;\r
\r
const slatFragment = \`#version 300 es\r
precision highp float;\r
uniform sampler2D tField;\r
uniform vec2 uSize;\r
uniform float uDpr;\r
uniform vec4 uGrid;\r
uniform vec2 uOrigin;\r
uniform vec2 uSlat;\r
uniform float uRound;\r
uniform float uTilt;\r
uniform vec3 uColor;\r
uniform vec3 uGlintColor;\r
uniform vec4 uBackground;\r
out vec4 fragColor;\r
\r
float pill(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;\r
  vec2 local = p - uOrigin;\r
  vec2 cell = floor(local / uGrid.zw);\r
  vec4 background = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  vec4 slat = vec4(0.0);\r
  int reach = uTilt > 0.0 ? 1 : 0;\r
  for (int dx = -1; dx <= 1; dx++) {\r
    if (abs(dx) > reach) continue;\r
    vec2 neighbour = cell + vec2(float(dx), 0.0);\r
    if (neighbour.x < 0.0 || neighbour.y < 0.0 || neighbour.x >= uGrid.x || neighbour.y >= uGrid.y) continue;\r
    vec4 field = texelFetch(tField, ivec2(int(neighbour.x), int(uGrid.y - 1.0 - neighbour.y)), 0);\r
    vec2 offset = local - neighbour * uGrid.zw - uSlat * 0.5;\r
    float angle = (field.a - 0.5) * 2.0 * uTilt;\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    vec2 turned = vec2(c * offset.x + s * offset.y, c * offset.y - s * offset.x);\r
    vec2 halfSize = vec2(uSlat.x * 0.5, uSlat.y * 0.5 * field.g);\r
    float radius = uRound * min(halfSize.x, halfSize.y);\r
    float alpha = clamp(0.5 - pill(turned, halfSize, radius) * uDpr, 0.0, 1.0) * field.r;\r
    if (alpha > slat.a) slat = vec4(mix(uColor, uGlintColor, field.b) * alpha, alpha);\r
  }\r
  fragColor = slat + background * (1.0 - slat.a);\r
}\r
\`;\r
\r
const MicroSlats = ({\r
  preset = 'swell',\r
  color = '#A855F7',\r
  glintColor = '#ffffff',\r
  backgroundColor = '#000000',\r
  slatWidth = 10,\r
  slatHeight = 25,\r
  gap = 3,\r
  roundness = 0.75,\r
  scale,\r
  speed,\r
  direction,\r
  chop,\r
  stretch,\r
  glint,\r
  contrast,\r
  perspective,\r
  fog,\r
  interactive = true,\r
  cursorStrength = 1,\r
  cursorSize = 40,\r
  swirl = 0,\r
  trail = 1.4,\r
  lean = 0,\r
  intro = true,\r
  introDuration = 1.5,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const wakeRef = useRef(null);\r
\r
  const base = SWELL_PRESETS[preset] || SWELL_PRESETS.swell;\r
  const pick = (value, key) => (value === undefined || value === null ? base[key] : value);\r
\r
  const colors = useMemo(\r
    () => ({\r
      color: parseColor(color, [0.66, 0.33, 0.97, 1]),\r
      glintColor: parseColor(glintColor, [1, 1, 1, 1]),\r
      backgroundColor: parseColor(backgroundColor, [0, 0, 0, 1])\r
    }),\r
    [color, glintColor, backgroundColor]\r
  );\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      slatWidth,\r
      slatHeight,\r
      gap,\r
      roundness,\r
      scale: pick(scale, 'scale'),\r
      speed: pick(speed, 'speed'),\r
      direction: pick(direction, 'direction'),\r
      chop: pick(chop, 'chop'),\r
      stretch: pick(stretch, 'stretch'),\r
      glint: pick(glint, 'glint'),\r
      contrast: pick(contrast, 'contrast'),\r
      perspective: pick(perspective, 'perspective'),\r
      fog: pick(fog, 'fog'),\r
      interactive,\r
      cursorStrength,\r
      cursorSize,\r
      swirl,\r
      trail,\r
      lean,\r
      intro,\r
      introDuration,\r
      paused\r
    };\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, depth: false });\r
    const gl = renderer.gl;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    gl.clearColor(0, 0, 0, 0);\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    container.appendChild(canvas);\r
\r
    const geometry = new Triangle(gl);\r
    const blank = new Texture(gl);\r
    const floatTargets = !!(\r
      gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')\r
    );\r
\r
    const dispose = target => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
\r
    let fieldTarget = new RenderTarget(gl, {\r
      width: 1,\r
      height: 1,\r
      depth: false,\r
      minFilter: gl.NEAREST,\r
      magFilter: gl.NEAREST\r
    });\r
\r
    const fieldUniforms = {\r
      uSize: { value: [1, 1] },\r
      uGrid: { value: [1, 1, 1, 1] },\r
      uOrigin: { value: [0, 0] },\r
      uSlat: { value: [1, 1] },\r
      uTime: { value: 0 },\r
      uScale: { value: 1 },\r
      uDirection: { value: 0 },\r
      uChop: { value: 0.5 },\r
      uStretch: { value: 0.3 },\r
      uGlint: { value: 1 },\r
      uContrast: { value: 1 },\r
      uPerspective: { value: 0.7 },\r
      uFog: { value: 0.5 },\r
      uIntro: { value: 0 },\r
      tVelocity: { value: blank },\r
      tInk: { value: blank },\r
      uFluidTexel: { value: [1, 1] },\r
      uFluid: { value: 0 },\r
      uInk: { value: 1 },\r
      uLean: { value: 0.5 }\r
    };\r
    const fieldMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: fieldFragment,\r
        uniforms: fieldUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const slatUniforms = {\r
      tField: { value: fieldTarget.texture },\r
      uSize: { value: [1, 1] },\r
      uDpr: { value: 1 },\r
      uGrid: { value: [1, 1, 1, 1] },\r
      uOrigin: { value: [0, 0] },\r
      uSlat: { value: [1, 1] },\r
      uRound: { value: 1 },\r
      uTilt: { value: 0 },\r
      uColor: { value: [1, 1, 1] },\r
      uGlintColor: { value: [1, 1, 1] },\r
      uBackground: { value: [0, 0, 0, 1] }\r
    };\r
    const slatMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: slatFragment,\r
        uniforms: slatUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const fluidTexel = { value: [1, 1] };\r
    const fluidPass = (fragment, uniforms) =>\r
      new Mesh(gl, {\r
        geometry,\r
        program: new Program(gl, {\r
          vertex: fluidVertex,\r
          fragment,\r
          uniforms: { uTexel: fluidTexel, ...uniforms },\r
          depthTest: false,\r
          depthWrite: false\r
        })\r
      });\r
    const splatPass = fluidPass(splatFragment, {\r
      uTarget: { value: blank },\r
      uAspect: { value: 1 },\r
      uPoint: { value: [0, 0] },\r
      uValue: { value: [0, 0, 0] },\r
      uRadius: { value: 0.01 }\r
    });\r
    const curlPass = fluidPass(curlFragment, { uVelocity: { value: blank } });\r
    const vorticityPass = fluidPass(vorticityFragment, {\r
      uVelocity: { value: blank },\r
      uCurl: { value: blank },\r
      uSwirl: { value: 20 },\r
      uDt: { value: 0.016 }\r
    });\r
    const divergencePass = fluidPass(divergenceFragment, { uVelocity: { value: blank } });\r
    const pressurePass = fluidPass(pressureFragment, { uPressure: { value: blank }, uDivergence: { value: blank } });\r
    const projectPass = fluidPass(projectFragment, { uPressure: { value: blank }, uVelocity: { value: blank } });\r
    const advectPass = fluidPass(advectFragment, {\r
      uVelocity: { value: blank },\r
      uSource: { value: blank },\r
      uDt: { value: 0.016 },\r
      uFade: { value: 1 }\r
    });\r
    const scalePass = fluidPass(scaleFragment, { uSource: { value: blank }, uValue: { value: 0 } });\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let time = 0;\r
    let introClock = 0;\r
    let visible = true;\r
    let alive = true;\r
    let fluid = null;\r
    let fluidUntil = 0;\r
    let fluidDirty = false;\r
    let splashTurn = 0;\r
    const splats = [];\r
    const pointer = { x: 0, y: 0, tracked: false };\r
\r
    const run = (mesh, target) => renderer.render({ scene: mesh, target, clear: false });\r
\r
    const floatTarget = (w, h) =>\r
      new RenderTarget(gl, {\r
        width: w,\r
        height: h,\r
        depth: false,\r
        type: gl.HALF_FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: gl.RGBA16F,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR\r
      });\r
\r
    const swapPair = (w, h) => ({\r
      read: floatTarget(w, h),\r
      write: floatTarget(w, h),\r
      swap() {\r
        const next = this.read;\r
        this.read = this.write;\r
        this.write = next;\r
      }\r
    });\r
\r
    const disposeFluid = () => {\r
      if (!fluid) return;\r
      [fluid.velocity, fluid.ink, fluid.pressure].forEach(pair => {\r
        dispose(pair.read);\r
        dispose(pair.write);\r
      });\r
      dispose(fluid.divergence);\r
      dispose(fluid.curl);\r
      fluid = null;\r
    };\r
\r
    const buildFluid = () => {\r
      if (!floatTargets) return;\r
      const aspect = width / height;\r
      const w = Math.max(8, Math.round(aspect >= 1 ? FLUID_SIZE * aspect : FLUID_SIZE));\r
      const h = Math.max(8, Math.round(aspect >= 1 ? FLUID_SIZE : FLUID_SIZE / aspect));\r
      if (fluid && fluid.width === w && fluid.height === h) return;\r
      disposeFluid();\r
      fluid = {\r
        width: w,\r
        height: h,\r
        velocity: swapPair(w, h),\r
        ink: swapPair(w, h),\r
        pressure: swapPair(w, h),\r
        divergence: floatTarget(w, h),\r
        curl: floatTarget(w, h)\r
      };\r
      fluidTexel.value = [1 / w, 1 / h];\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      buildFluid();\r
      start();\r
    };\r
\r
    const layout = s => {\r
      const slatW = clamp(s.slatWidth, 1, 64);\r
      const slatH = clamp(s.slatHeight, 2, 240);\r
      const gapSize = clamp(s.gap, 0, 64);\r
      const pitchX = slatW + gapSize;\r
      const pitchY = slatH + gapSize;\r
      const cols = Math.min(2048, Math.ceil((width + gapSize) / pitchX) + 1);\r
      const rows = Math.min(2048, Math.ceil((height + gapSize) / pitchY) + 1);\r
      const originX = (width - (cols * pitchX - gapSize)) / 2;\r
      const originY = (height - (rows * pitchY - gapSize)) / 2;\r
      if (fieldTarget.width !== cols || fieldTarget.height !== rows) {\r
        dispose(fieldTarget);\r
        fieldTarget = new RenderTarget(gl, {\r
          width: cols,\r
          height: rows,\r
          depth: false,\r
          minFilter: gl.NEAREST,\r
          magFilter: gl.NEAREST\r
        });\r
        slatUniforms.tField.value = fieldTarget.texture;\r
      }\r
      const tilt = Math.min(0.42, Math.asin(clamp((pitchX * 1.5 - slatW * 0.5) / (slatH * 0.5), 0, 1)));\r
      return { slatW, slatH, tilt, grid: [cols, rows, pitchX, pitchY], origin: [originX, originY] };\r
    };\r
\r
    const splat = (pair, point, value, radius) => {\r
      const u = splatPass.program.uniforms;\r
      u.uTarget.value = pair.read.texture;\r
      u.uAspect.value = width / height;\r
      u.uPoint.value = point;\r
      u.uValue.value = value;\r
      u.uRadius.value = radius;\r
      run(splatPass, pair.write);\r
      pair.swap();\r
    };\r
\r
    const stepFluid = (f, dt, s) => {\r
      if (s.swirl > 0) {\r
        curlPass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
        run(curlPass, f.curl);\r
\r
        const vorticity = vorticityPass.program.uniforms;\r
        vorticity.uVelocity.value = f.velocity.read.texture;\r
        vorticity.uCurl.value = f.curl.texture;\r
        vorticity.uSwirl.value = clamp(s.swirl, 0, 2) * 40;\r
        vorticity.uDt.value = dt;\r
        run(vorticityPass, f.velocity.write);\r
        f.velocity.swap();\r
      }\r
\r
      divergencePass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
      run(divergencePass, f.divergence);\r
\r
      scalePass.program.uniforms.uSource.value = f.pressure.read.texture;\r
      scalePass.program.uniforms.uValue.value = 0.8;\r
      run(scalePass, f.pressure.write);\r
      f.pressure.swap();\r
\r
      pressurePass.program.uniforms.uDivergence.value = f.divergence.texture;\r
      for (let i = 0; i < PRESSURE_STEPS; i++) {\r
        pressurePass.program.uniforms.uPressure.value = f.pressure.read.texture;\r
        run(pressurePass, f.pressure.write);\r
        f.pressure.swap();\r
      }\r
\r
      projectPass.program.uniforms.uPressure.value = f.pressure.read.texture;\r
      projectPass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
      run(projectPass, f.velocity.write);\r
      f.velocity.swap();\r
\r
      const fade = 1 / clamp(s.trail, 0.1, 10);\r
      const advect = advectPass.program.uniforms;\r
      advect.uDt.value = dt;\r
      advect.uVelocity.value = f.velocity.read.texture;\r
      advect.uSource.value = f.velocity.read.texture;\r
      advect.uFade.value = fade * 1.4;\r
      run(advectPass, f.velocity.write);\r
      f.velocity.swap();\r
\r
      advect.uVelocity.value = f.velocity.read.texture;\r
      advect.uSource.value = f.ink.read.texture;\r
      advect.uFade.value = fade;\r
      run(advectPass, f.ink.write);\r
      f.ink.swap();\r
    };\r
\r
    const clearFluid = f => {\r
      scalePass.program.uniforms.uValue.value = 0;\r
      [f.velocity, f.ink, f.pressure].forEach(pair => {\r
        scalePass.program.uniforms.uSource.value = pair.read.texture;\r
        run(scalePass, pair.write);\r
        pair.swap();\r
      });\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      if (!s.paused && !reducedMotion) time += dt * s.speed;\r
      introClock = s.intro && !reducedMotion ? introClock + dt / Math.max(0.2, s.introDuration) : 1;\r
      const introLinear = Math.min(introClock, 1);\r
      const introEase =\r
        introLinear < 0.5 ? 4 * introLinear * introLinear * introLinear : 1 - Math.pow(-2 * introLinear + 2, 3) / 2;\r
\r
      if (fluid && splats.length) {\r
        const radius = Math.pow(clamp(s.cursorSize, 4, 600) / height, 2) * 0.35;\r
        const aspect = width / height;\r
        for (const [u, v, du, dv, turn] of splats) {\r
          if (turn === null) {\r
            splat(fluid.velocity, [u, v], [du * SPLAT_FORCE, dv * SPLAT_FORCE, 0], radius);\r
            splat(fluid.ink, [u, v], [0.13, 0, 0], radius);\r
            continue;\r
          }\r
          const jet = radius * 0.55;\r
          const reach = Math.sqrt(jet * 0.5) * 1.9;\r
          const push = SPLAT_FORCE * 0.08;\r
          for (let i = 0; i < SPLASH_JETS; i++) {\r
            const angle = turn + (i / SPLASH_JETS) * Math.PI * 2;\r
            const dx = Math.cos(angle);\r
            const dy = Math.sin(angle);\r
            const point = [u + (dx * reach) / aspect, v + dy * reach];\r
            const spin = [(dx - dy) * Math.SQRT1_2 * push, (dy + dx) * Math.SQRT1_2 * push, 0];\r
            splat(fluid.velocity, point, spin, jet);\r
            splat(fluid.ink, point, [0.75, 0, 0], jet);\r
          }\r
          splat(fluid.ink, [u, v], [0.45, 0, 0], radius);\r
        }\r
        splats.length = 0;\r
        fluidDirty = true;\r
      }\r
      const fluidActive = fluid !== null && now < fluidUntil;\r
      if (fluid) {\r
        if (fluidActive) stepFluid(fluid, Math.min(Math.max(dt, 1 / 240), 1 / 30), s);\r
        else if (fluidDirty) {\r
          clearFluid(fluid);\r
          fluidDirty = false;\r
        }\r
      }\r
\r
      const grid = layout(s);\r
\r
      fieldUniforms.uSize.value = [width, height];\r
      fieldUniforms.uGrid.value = grid.grid;\r
      fieldUniforms.uOrigin.value = grid.origin;\r
      fieldUniforms.uSlat.value = [grid.slatW, grid.slatH];\r
      fieldUniforms.uTime.value = time;\r
      fieldUniforms.uScale.value = s.scale;\r
      fieldUniforms.uDirection.value = (s.direction * Math.PI) / 180;\r
      fieldUniforms.uChop.value = clamp(s.chop, 0, 1.5);\r
      fieldUniforms.uStretch.value = clamp(s.stretch, 0, 0.95);\r
      fieldUniforms.uGlint.value = Math.max(0, s.glint);\r
      fieldUniforms.uContrast.value = clamp(s.contrast, 0.2, 4);\r
      fieldUniforms.uPerspective.value = clamp(s.perspective, 0, 1);\r
      fieldUniforms.uFog.value = clamp(s.fog, 0, 1);\r
      fieldUniforms.uIntro.value = introEase;\r
      fieldUniforms.uFluid.value = fluidActive ? 1 : 0;\r
      fieldUniforms.tVelocity.value = fluid ? fluid.velocity.read.texture : blank;\r
      fieldUniforms.tInk.value = fluid ? fluid.ink.read.texture : blank;\r
      fieldUniforms.uFluidTexel.value = fluidTexel.value;\r
      fieldUniforms.uInk.value = clamp(s.cursorStrength, 0, 3);\r
      fieldUniforms.uLean.value = clamp(s.lean, 0, 1);\r
      renderer.render({ scene: fieldMesh, target: fieldTarget });\r
\r
      slatUniforms.uSize.value = [width, height];\r
      slatUniforms.uDpr.value = renderer.dpr;\r
      slatUniforms.uGrid.value = grid.grid;\r
      slatUniforms.uOrigin.value = grid.origin;\r
      slatUniforms.uSlat.value = [grid.slatW, grid.slatH];\r
      slatUniforms.uRound.value = clamp(s.roundness, 0, 1);\r
      slatUniforms.uTilt.value = fluidActive && s.lean > 0 ? grid.tilt : 0;\r
      slatUniforms.uColor.value = s.color.slice(0, 3);\r
      slatUniforms.uGlintColor.value = s.glintColor.slice(0, 3);\r
      slatUniforms.uBackground.value = s.backgroundColor;\r
      renderer.render({ scene: slatMesh });\r
\r
      const moving = (!s.paused && !reducedMotion && s.speed !== 0) || introClock < 1;\r
      if (visible && (moving || fluidActive || fluidDirty)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = e => {\r
      const rect = container.getBoundingClientRect();\r
      const x = e.clientX - rect.left;\r
      const y = e.clientY - rect.top;\r
      const w = Math.max(1, rect.width);\r
      const h = Math.max(1, rect.height);\r
      return { x, y, u: x / w, v: 1 - y / h, h, inside: x >= 0 && y >= 0 && x <= w && y <= h };\r
    };\r
\r
    const queue = (u, v, du, dv, turn) => {\r
      if (splats.length > 32) splats.shift();\r
      splats.push([u, v, du, dv, turn]);\r
      const s = settingsRef.current;\r
      fluidUntil = performance.now() + Math.max(1.5, (s ? s.trail : 1.4) * 5) * 1000;\r
      start();\r
    };\r
\r
    const onPointerMove = e => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!fluid || !s || !s.interactive || reducedMotion || !spot.inside) {\r
        pointer.tracked = false;\r
        return;\r
      }\r
      if (pointer.tracked && (spot.x !== pointer.x || spot.y !== pointer.y)) {\r
        queue(spot.u, spot.v, (spot.x - pointer.x) / spot.h, (pointer.y - spot.y) / spot.h, null);\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.tracked = true;\r
    };\r
\r
    const onPointerDown = e => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!fluid || !s || !s.interactive || reducedMotion || !spot.inside) return;\r
      splashTurn += 2.39996;\r
      queue(spot.u, spot.v, 0, 0, splashTurn);\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.tracked = false;\r
    };\r
\r
    const onPointerOut = e => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('blur', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    wakeRef.current = start;\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerout', onPointerOut);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      disposeFluid();\r
      dispose(fieldTarget);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`micro-slats \${className}\`.trim()} style={style} />;\r
};\r
\r
export default MicroSlats;\r
`,n=`.micro-slats {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import { Renderer, Program, Mesh, Triangle, RenderTarget, Texture } from 'ogl';\r
\r
const SWELL_PRESETS = {\r
  swell: {\r
    scale: 1.5,\r
    speed: 0.6,\r
    direction: 250,\r
    chop: 0.55,\r
    stretch: 0,\r
    glint: 0.7,\r
    contrast: 1.25,\r
    perspective: 0.55,\r
    fog: 0.55\r
  },\r
  tide: {\r
    scale: 1.3,\r
    speed: 0.5,\r
    direction: 262,\r
    chop: 0.2,\r
    stretch: 0.12,\r
    glint: 0.45,\r
    contrast: 1.1,\r
    perspective: 0.5,\r
    fog: 0.4\r
  },\r
  storm: {\r
    scale: 0.55,\r
    speed: 1.6,\r
    direction: 236,\r
    chop: 1,\r
    stretch: 0.3,\r
    glint: 1.3,\r
    contrast: 1.8,\r
    perspective: 0.8,\r
    fog: 0.35\r
  },\r
  signal: {\r
    scale: 0.85,\r
    speed: 1.2,\r
    direction: 180,\r
    chop: 0.6,\r
    stretch: 0.85,\r
    glint: 0.25,\r
    contrast: 1.2,\r
    perspective: 0,\r
    fog: 0\r
  }\r
};\r
\r
const FLUID_SIZE = 96;\r
const PRESSURE_STEPS = 16;\r
const SPLAT_FORCE = 6900;\r
const SPLASH_JETS = 3;\r
const PIXEL_BUDGET = 4.5e6;\r
\r
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);\r
\r
const parseColor = (value, fallback) => {\r
  try {\r
    const ctx = document.createElement('canvas').getContext('2d');\r
    if (!ctx) return fallback;\r
    ctx.fillStyle = '#000000';\r
    ctx.fillStyle = value;\r
    const resolved = ctx.fillStyle;\r
    if (resolved.startsWith('#')) {\r
      const n = parseInt(resolved.slice(1), 16);\r
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];\r
    }\r
    const parts = resolved.match(/[\\d.]+/g);\r
    if (!parts || parts.length < 3) return fallback;\r
    return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255, parts[3] ? Number(parts[3]) : 1];\r
  } catch {\r
    return fallback;\r
  }\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fluidVertex = \`#version 300 es\r
in vec2 position;\r
uniform vec2 uTexel;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = position * 0.5 + 0.5;\r
  vL = vUv - vec2(uTexel.x, 0.0);\r
  vR = vUv + vec2(uTexel.x, 0.0);\r
  vT = vUv + vec2(0.0, uTexel.y);\r
  vB = vUv - vec2(0.0, uTexel.y);\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fluidHead = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
in vec2 vL;\r
in vec2 vR;\r
in vec2 vT;\r
in vec2 vB;\r
out vec4 fragColor;\r
\`;\r
\r
const splatFragment = \`\${fluidHead}\r
uniform sampler2D uTarget;\r
uniform float uAspect;\r
uniform vec2 uPoint;\r
uniform vec3 uValue;\r
uniform float uRadius;\r
void main() {\r
  vec2 offset = vUv - uPoint;\r
  offset.x *= uAspect;\r
  float falloff = exp(-dot(offset, offset) / uRadius);\r
  fragColor = vec4(texture(uTarget, vUv).xyz + uValue * falloff, 1.0);\r
}\r
\`;\r
\r
const curlFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uVelocity, vL).y;\r
  float right = texture(uVelocity, vR).y;\r
  float top = texture(uVelocity, vT).x;\r
  float bottom = texture(uVelocity, vB).x;\r
  fragColor = vec4(0.5 * (right - left - top + bottom), 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const vorticityFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uCurl;\r
uniform float uSwirl;\r
uniform float uDt;\r
void main() {\r
  float left = texture(uCurl, vL).x;\r
  float right = texture(uCurl, vR).x;\r
  float top = texture(uCurl, vT).x;\r
  float bottom = texture(uCurl, vB).x;\r
  float middle = texture(uCurl, vUv).x;\r
  vec2 force = 0.5 * vec2(abs(top) - abs(bottom), abs(right) - abs(left));\r
  force = force / (length(force) + 0.0001) * uSwirl * middle;\r
  force.y = -force.y;\r
  vec2 velocity = texture(uVelocity, vUv).xy + force * uDt;\r
  fragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);\r
}\r
\`;\r
\r
const divergenceFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
void main() {\r
  vec2 middle = texture(uVelocity, vUv).xy;\r
  float left = vL.x < 0.0 ? -middle.x : texture(uVelocity, vL).x;\r
  float right = vR.x > 1.0 ? -middle.x : texture(uVelocity, vR).x;\r
  float top = vT.y > 1.0 ? -middle.y : texture(uVelocity, vT).y;\r
  float bottom = vB.y < 0.0 ? -middle.y : texture(uVelocity, vB).y;\r
  fragColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const pressureFragment = \`\${fluidHead}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  fragColor = vec4((left + right + top + bottom - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const projectFragment = \`\${fluidHead}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\r
\`;\r
\r
const advectFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform float uDt;\r
uniform float uFade;\r
void main() {\r
  vec2 from = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;\r
  fragColor = texture(uSource, from) / (1.0 + uFade * uDt);\r
}\r
\`;\r
\r
const scaleFragment = \`\${fluidHead}\r
uniform sampler2D uSource;\r
uniform float uValue;\r
void main() {\r
  fragColor = texture(uSource, vUv) * uValue;\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
uniform vec2 uSize;\r
uniform vec4 uGrid;\r
uniform vec2 uOrigin;\r
uniform vec2 uSlat;\r
uniform float uTime;\r
uniform float uScale;\r
uniform float uDirection;\r
uniform float uChop;\r
uniform float uStretch;\r
uniform float uGlint;\r
uniform float uContrast;\r
uniform float uPerspective;\r
uniform float uFog;\r
uniform float uIntro;\r
uniform sampler2D tVelocity;\r
uniform sampler2D tInk;\r
uniform vec2 uFluidTexel;\r
uniform float uFluid;\r
uniform float uInk;\r
uniform float uLean;\r
out vec4 fragColor;\r
\r
const float TURN[4] = float[4](0.0, -0.95, 0.78, 1.62);\r
const float LENGTH[4] = float[4](2.6, 1.7, 1.12, 0.76);\r
const float HEIGHT[4] = float[4](1.0, 0.75, 0.5, 0.3);\r
const float SHIFT[4] = float[4](0.0, 2.3, 4.1, 1.1);\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  float row = uGrid.y - 1.0 - cell.y;\r
  vec2 center = uOrigin + vec2(cell.x, row) * uGrid.zw + uSlat * 0.5;\r
  float v = clamp(center.y / uSize.y, 0.0, 1.0);\r
\r
  vec2 flow = vec2(0.0);\r
  float ink = 0.0;\r
  if (uFluid > 0.5) {\r
    vec2 fluidUv = clamp(vec2(center.x / uSize.x, 1.0 - center.y / uSize.y), 0.0, 1.0);\r
    flow = texture(tVelocity, fluidUv).xy * uFluidTexel * uSize;\r
    ink = texture(tInk, fluidUv).x;\r
  }\r
\r
  float horizon = mix(8.0, 0.5, uPerspective);\r
  float depth = (1.0 + horizon) / (v + horizon);\r
  vec2 world = vec2((center.x - uSize.x * 0.5) / uSize.y * depth, (depth - 1.0) * horizon * 2.2);\r
  world -= flow * 0.00018 * depth;\r
  world /= max(uScale, 0.05);\r
\r
  float meander = 0.55 * sin(dot(world, vec2(0.23, 0.41)) * 0.9 + uTime * 0.13)\r
    + 0.3 * sin(dot(world, vec2(-0.37, 0.19)) * 1.4 - uTime * 0.09);\r
\r
  float steep = uChop * 0.45;\r
  float height = 0.0;\r
  float total = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    float angle = uDirection + TURN[i];\r
    vec2 heading = vec2(cos(angle), sin(angle));\r
    float k = 6.2831853 / LENGTH[i];\r
    float omega = sqrt(9.81 * k) * 0.35;\r
    float theta = k * dot(world, heading) - omega * uTime + SHIFT[i] + meander * (0.6 + 0.3 * float(i));\r
    height += HEIGHT[i] * (cos(theta) + steep * cos(2.0 * theta));\r
    total += HEIGHT[i] * (1.0 + steep);\r
  }\r
  float level = clamp(0.5 + 0.5 * height / (total * 0.85), 0.0, 1.0);\r
  float crest = smoothstep(0.6, 1.0, level);\r
  float glint = crest * crest * uGlint;\r
\r
  float haze = mix(1.0, 1.0 - uFog, pow(1.0 - v, 1.4));\r
  float light = (pow(level, uContrast) + glint * 0.8) * haze;\r
  float glow = 1.0 - exp(-max(ink, 0.0) * uInk * 1.6);\r
  light = 1.0 - (1.0 - clamp(light, 0.0, 1.0)) * (1.0 - glow);\r
\r
  float front = uIntro * 1.35;\r
  float reveal = 1.0 - smoothstep(front - 0.35, front, v);\r
  float sweep = exp(-pow((v - front + 0.22) / 0.07, 2.0)) * (1.0 - uIntro);\r
  light = (light + sweep * 0.8) * reveal;\r
  light = max(light, 0.045 * reveal);\r
  float span = mix(1.0 - uStretch, 1.0, level) + glow * 0.3;\r
  span = clamp(span, 0.08, 1.0) * mix(0.1, 1.0, reveal);\r
  float tint = clamp(max(glint * 1.4, glow * 0.9) + sweep, 0.0, 1.0);\r
  float lean = clamp(flow.x / 1400.0, -1.0, 1.0) * uLean * reveal;\r
\r
  fragColor = vec4(clamp(light, 0.0, 1.0), span, tint, 0.5 + 0.5 * lean);\r
}\r
\`;\r
\r
const slatFragment = \`#version 300 es\r
precision highp float;\r
uniform sampler2D tField;\r
uniform vec2 uSize;\r
uniform float uDpr;\r
uniform vec4 uGrid;\r
uniform vec2 uOrigin;\r
uniform vec2 uSlat;\r
uniform float uRound;\r
uniform float uTilt;\r
uniform vec3 uColor;\r
uniform vec3 uGlintColor;\r
uniform vec4 uBackground;\r
out vec4 fragColor;\r
\r
float pill(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;\r
  vec2 local = p - uOrigin;\r
  vec2 cell = floor(local / uGrid.zw);\r
  vec4 background = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  vec4 slat = vec4(0.0);\r
  int reach = uTilt > 0.0 ? 1 : 0;\r
  for (int dx = -1; dx <= 1; dx++) {\r
    if (abs(dx) > reach) continue;\r
    vec2 neighbour = cell + vec2(float(dx), 0.0);\r
    if (neighbour.x < 0.0 || neighbour.y < 0.0 || neighbour.x >= uGrid.x || neighbour.y >= uGrid.y) continue;\r
    vec4 field = texelFetch(tField, ivec2(int(neighbour.x), int(uGrid.y - 1.0 - neighbour.y)), 0);\r
    vec2 offset = local - neighbour * uGrid.zw - uSlat * 0.5;\r
    float angle = (field.a - 0.5) * 2.0 * uTilt;\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    vec2 turned = vec2(c * offset.x + s * offset.y, c * offset.y - s * offset.x);\r
    vec2 halfSize = vec2(uSlat.x * 0.5, uSlat.y * 0.5 * field.g);\r
    float radius = uRound * min(halfSize.x, halfSize.y);\r
    float alpha = clamp(0.5 - pill(turned, halfSize, radius) * uDpr, 0.0, 1.0) * field.r;\r
    if (alpha > slat.a) slat = vec4(mix(uColor, uGlintColor, field.b) * alpha, alpha);\r
  }\r
  fragColor = slat + background * (1.0 - slat.a);\r
}\r
\`;\r
\r
const MicroSlats = ({\r
  preset = 'swell',\r
  color = '#A855F7',\r
  glintColor = '#ffffff',\r
  backgroundColor = '#000000',\r
  slatWidth = 10,\r
  slatHeight = 25,\r
  gap = 3,\r
  roundness = 0.75,\r
  scale,\r
  speed,\r
  direction,\r
  chop,\r
  stretch,\r
  glint,\r
  contrast,\r
  perspective,\r
  fog,\r
  interactive = true,\r
  cursorStrength = 1,\r
  cursorSize = 40,\r
  swirl = 0,\r
  trail = 1.4,\r
  lean = 0,\r
  intro = true,\r
  introDuration = 1.5,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const wakeRef = useRef(null);\r
\r
  const base = SWELL_PRESETS[preset] || SWELL_PRESETS.swell;\r
  const pick = (value, key) => (value === undefined || value === null ? base[key] : value);\r
\r
  const colors = useMemo(\r
    () => ({\r
      color: parseColor(color, [0.66, 0.33, 0.97, 1]),\r
      glintColor: parseColor(glintColor, [1, 1, 1, 1]),\r
      backgroundColor: parseColor(backgroundColor, [0, 0, 0, 1])\r
    }),\r
    [color, glintColor, backgroundColor]\r
  );\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      slatWidth,\r
      slatHeight,\r
      gap,\r
      roundness,\r
      scale: pick(scale, 'scale'),\r
      speed: pick(speed, 'speed'),\r
      direction: pick(direction, 'direction'),\r
      chop: pick(chop, 'chop'),\r
      stretch: pick(stretch, 'stretch'),\r
      glint: pick(glint, 'glint'),\r
      contrast: pick(contrast, 'contrast'),\r
      perspective: pick(perspective, 'perspective'),\r
      fog: pick(fog, 'fog'),\r
      interactive,\r
      cursorStrength,\r
      cursorSize,\r
      swirl,\r
      trail,\r
      lean,\r
      intro,\r
      introDuration,\r
      paused\r
    };\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, depth: false });\r
    const gl = renderer.gl;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    gl.clearColor(0, 0, 0, 0);\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    container.appendChild(canvas);\r
\r
    const geometry = new Triangle(gl);\r
    const blank = new Texture(gl);\r
    const floatTargets = !!(\r
      gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')\r
    );\r
\r
    const dispose = target => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
\r
    let fieldTarget = new RenderTarget(gl, {\r
      width: 1,\r
      height: 1,\r
      depth: false,\r
      minFilter: gl.NEAREST,\r
      magFilter: gl.NEAREST\r
    });\r
\r
    const fieldUniforms = {\r
      uSize: { value: [1, 1] },\r
      uGrid: { value: [1, 1, 1, 1] },\r
      uOrigin: { value: [0, 0] },\r
      uSlat: { value: [1, 1] },\r
      uTime: { value: 0 },\r
      uScale: { value: 1 },\r
      uDirection: { value: 0 },\r
      uChop: { value: 0.5 },\r
      uStretch: { value: 0.3 },\r
      uGlint: { value: 1 },\r
      uContrast: { value: 1 },\r
      uPerspective: { value: 0.7 },\r
      uFog: { value: 0.5 },\r
      uIntro: { value: 0 },\r
      tVelocity: { value: blank },\r
      tInk: { value: blank },\r
      uFluidTexel: { value: [1, 1] },\r
      uFluid: { value: 0 },\r
      uInk: { value: 1 },\r
      uLean: { value: 0.5 }\r
    };\r
    const fieldMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: fieldFragment,\r
        uniforms: fieldUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const slatUniforms = {\r
      tField: { value: fieldTarget.texture },\r
      uSize: { value: [1, 1] },\r
      uDpr: { value: 1 },\r
      uGrid: { value: [1, 1, 1, 1] },\r
      uOrigin: { value: [0, 0] },\r
      uSlat: { value: [1, 1] },\r
      uRound: { value: 1 },\r
      uTilt: { value: 0 },\r
      uColor: { value: [1, 1, 1] },\r
      uGlintColor: { value: [1, 1, 1] },\r
      uBackground: { value: [0, 0, 0, 1] }\r
    };\r
    const slatMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: slatFragment,\r
        uniforms: slatUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const fluidTexel = { value: [1, 1] };\r
    const fluidPass = (fragment, uniforms) =>\r
      new Mesh(gl, {\r
        geometry,\r
        program: new Program(gl, {\r
          vertex: fluidVertex,\r
          fragment,\r
          uniforms: { uTexel: fluidTexel, ...uniforms },\r
          depthTest: false,\r
          depthWrite: false\r
        })\r
      });\r
    const splatPass = fluidPass(splatFragment, {\r
      uTarget: { value: blank },\r
      uAspect: { value: 1 },\r
      uPoint: { value: [0, 0] },\r
      uValue: { value: [0, 0, 0] },\r
      uRadius: { value: 0.01 }\r
    });\r
    const curlPass = fluidPass(curlFragment, { uVelocity: { value: blank } });\r
    const vorticityPass = fluidPass(vorticityFragment, {\r
      uVelocity: { value: blank },\r
      uCurl: { value: blank },\r
      uSwirl: { value: 20 },\r
      uDt: { value: 0.016 }\r
    });\r
    const divergencePass = fluidPass(divergenceFragment, { uVelocity: { value: blank } });\r
    const pressurePass = fluidPass(pressureFragment, { uPressure: { value: blank }, uDivergence: { value: blank } });\r
    const projectPass = fluidPass(projectFragment, { uPressure: { value: blank }, uVelocity: { value: blank } });\r
    const advectPass = fluidPass(advectFragment, {\r
      uVelocity: { value: blank },\r
      uSource: { value: blank },\r
      uDt: { value: 0.016 },\r
      uFade: { value: 1 }\r
    });\r
    const scalePass = fluidPass(scaleFragment, { uSource: { value: blank }, uValue: { value: 0 } });\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let time = 0;\r
    let introClock = 0;\r
    let visible = true;\r
    let alive = true;\r
    let fluid = null;\r
    let fluidUntil = 0;\r
    let fluidDirty = false;\r
    let splashTurn = 0;\r
    const splats = [];\r
    const pointer = { x: 0, y: 0, tracked: false };\r
\r
    const run = (mesh, target) => renderer.render({ scene: mesh, target, clear: false });\r
\r
    const floatTarget = (w, h) =>\r
      new RenderTarget(gl, {\r
        width: w,\r
        height: h,\r
        depth: false,\r
        type: gl.HALF_FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: gl.RGBA16F,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR\r
      });\r
\r
    const swapPair = (w, h) => ({\r
      read: floatTarget(w, h),\r
      write: floatTarget(w, h),\r
      swap() {\r
        const next = this.read;\r
        this.read = this.write;\r
        this.write = next;\r
      }\r
    });\r
\r
    const disposeFluid = () => {\r
      if (!fluid) return;\r
      [fluid.velocity, fluid.ink, fluid.pressure].forEach(pair => {\r
        dispose(pair.read);\r
        dispose(pair.write);\r
      });\r
      dispose(fluid.divergence);\r
      dispose(fluid.curl);\r
      fluid = null;\r
    };\r
\r
    const buildFluid = () => {\r
      if (!floatTargets) return;\r
      const aspect = width / height;\r
      const w = Math.max(8, Math.round(aspect >= 1 ? FLUID_SIZE * aspect : FLUID_SIZE));\r
      const h = Math.max(8, Math.round(aspect >= 1 ? FLUID_SIZE : FLUID_SIZE / aspect));\r
      if (fluid && fluid.width === w && fluid.height === h) return;\r
      disposeFluid();\r
      fluid = {\r
        width: w,\r
        height: h,\r
        velocity: swapPair(w, h),\r
        ink: swapPair(w, h),\r
        pressure: swapPair(w, h),\r
        divergence: floatTarget(w, h),\r
        curl: floatTarget(w, h)\r
      };\r
      fluidTexel.value = [1 / w, 1 / h];\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      buildFluid();\r
      start();\r
    };\r
\r
    const layout = s => {\r
      const slatW = clamp(s.slatWidth, 1, 64);\r
      const slatH = clamp(s.slatHeight, 2, 240);\r
      const gapSize = clamp(s.gap, 0, 64);\r
      const pitchX = slatW + gapSize;\r
      const pitchY = slatH + gapSize;\r
      const cols = Math.min(2048, Math.ceil((width + gapSize) / pitchX) + 1);\r
      const rows = Math.min(2048, Math.ceil((height + gapSize) / pitchY) + 1);\r
      const originX = (width - (cols * pitchX - gapSize)) / 2;\r
      const originY = (height - (rows * pitchY - gapSize)) / 2;\r
      if (fieldTarget.width !== cols || fieldTarget.height !== rows) {\r
        dispose(fieldTarget);\r
        fieldTarget = new RenderTarget(gl, {\r
          width: cols,\r
          height: rows,\r
          depth: false,\r
          minFilter: gl.NEAREST,\r
          magFilter: gl.NEAREST\r
        });\r
        slatUniforms.tField.value = fieldTarget.texture;\r
      }\r
      const tilt = Math.min(0.42, Math.asin(clamp((pitchX * 1.5 - slatW * 0.5) / (slatH * 0.5), 0, 1)));\r
      return { slatW, slatH, tilt, grid: [cols, rows, pitchX, pitchY], origin: [originX, originY] };\r
    };\r
\r
    const splat = (pair, point, value, radius) => {\r
      const u = splatPass.program.uniforms;\r
      u.uTarget.value = pair.read.texture;\r
      u.uAspect.value = width / height;\r
      u.uPoint.value = point;\r
      u.uValue.value = value;\r
      u.uRadius.value = radius;\r
      run(splatPass, pair.write);\r
      pair.swap();\r
    };\r
\r
    const stepFluid = (f, dt, s) => {\r
      if (s.swirl > 0) {\r
        curlPass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
        run(curlPass, f.curl);\r
\r
        const vorticity = vorticityPass.program.uniforms;\r
        vorticity.uVelocity.value = f.velocity.read.texture;\r
        vorticity.uCurl.value = f.curl.texture;\r
        vorticity.uSwirl.value = clamp(s.swirl, 0, 2) * 40;\r
        vorticity.uDt.value = dt;\r
        run(vorticityPass, f.velocity.write);\r
        f.velocity.swap();\r
      }\r
\r
      divergencePass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
      run(divergencePass, f.divergence);\r
\r
      scalePass.program.uniforms.uSource.value = f.pressure.read.texture;\r
      scalePass.program.uniforms.uValue.value = 0.8;\r
      run(scalePass, f.pressure.write);\r
      f.pressure.swap();\r
\r
      pressurePass.program.uniforms.uDivergence.value = f.divergence.texture;\r
      for (let i = 0; i < PRESSURE_STEPS; i++) {\r
        pressurePass.program.uniforms.uPressure.value = f.pressure.read.texture;\r
        run(pressurePass, f.pressure.write);\r
        f.pressure.swap();\r
      }\r
\r
      projectPass.program.uniforms.uPressure.value = f.pressure.read.texture;\r
      projectPass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
      run(projectPass, f.velocity.write);\r
      f.velocity.swap();\r
\r
      const fade = 1 / clamp(s.trail, 0.1, 10);\r
      const advect = advectPass.program.uniforms;\r
      advect.uDt.value = dt;\r
      advect.uVelocity.value = f.velocity.read.texture;\r
      advect.uSource.value = f.velocity.read.texture;\r
      advect.uFade.value = fade * 1.4;\r
      run(advectPass, f.velocity.write);\r
      f.velocity.swap();\r
\r
      advect.uVelocity.value = f.velocity.read.texture;\r
      advect.uSource.value = f.ink.read.texture;\r
      advect.uFade.value = fade;\r
      run(advectPass, f.ink.write);\r
      f.ink.swap();\r
    };\r
\r
    const clearFluid = f => {\r
      scalePass.program.uniforms.uValue.value = 0;\r
      [f.velocity, f.ink, f.pressure].forEach(pair => {\r
        scalePass.program.uniforms.uSource.value = pair.read.texture;\r
        run(scalePass, pair.write);\r
        pair.swap();\r
      });\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      if (!s.paused && !reducedMotion) time += dt * s.speed;\r
      introClock = s.intro && !reducedMotion ? introClock + dt / Math.max(0.2, s.introDuration) : 1;\r
      const introLinear = Math.min(introClock, 1);\r
      const introEase =\r
        introLinear < 0.5 ? 4 * introLinear * introLinear * introLinear : 1 - Math.pow(-2 * introLinear + 2, 3) / 2;\r
\r
      if (fluid && splats.length) {\r
        const radius = Math.pow(clamp(s.cursorSize, 4, 600) / height, 2) * 0.35;\r
        const aspect = width / height;\r
        for (const [u, v, du, dv, turn] of splats) {\r
          if (turn === null) {\r
            splat(fluid.velocity, [u, v], [du * SPLAT_FORCE, dv * SPLAT_FORCE, 0], radius);\r
            splat(fluid.ink, [u, v], [0.13, 0, 0], radius);\r
            continue;\r
          }\r
          const jet = radius * 0.55;\r
          const reach = Math.sqrt(jet * 0.5) * 1.9;\r
          const push = SPLAT_FORCE * 0.08;\r
          for (let i = 0; i < SPLASH_JETS; i++) {\r
            const angle = turn + (i / SPLASH_JETS) * Math.PI * 2;\r
            const dx = Math.cos(angle);\r
            const dy = Math.sin(angle);\r
            const point = [u + (dx * reach) / aspect, v + dy * reach];\r
            const spin = [(dx - dy) * Math.SQRT1_2 * push, (dy + dx) * Math.SQRT1_2 * push, 0];\r
            splat(fluid.velocity, point, spin, jet);\r
            splat(fluid.ink, point, [0.75, 0, 0], jet);\r
          }\r
          splat(fluid.ink, [u, v], [0.45, 0, 0], radius);\r
        }\r
        splats.length = 0;\r
        fluidDirty = true;\r
      }\r
      const fluidActive = fluid !== null && now < fluidUntil;\r
      if (fluid) {\r
        if (fluidActive) stepFluid(fluid, Math.min(Math.max(dt, 1 / 240), 1 / 30), s);\r
        else if (fluidDirty) {\r
          clearFluid(fluid);\r
          fluidDirty = false;\r
        }\r
      }\r
\r
      const grid = layout(s);\r
\r
      fieldUniforms.uSize.value = [width, height];\r
      fieldUniforms.uGrid.value = grid.grid;\r
      fieldUniforms.uOrigin.value = grid.origin;\r
      fieldUniforms.uSlat.value = [grid.slatW, grid.slatH];\r
      fieldUniforms.uTime.value = time;\r
      fieldUniforms.uScale.value = s.scale;\r
      fieldUniforms.uDirection.value = (s.direction * Math.PI) / 180;\r
      fieldUniforms.uChop.value = clamp(s.chop, 0, 1.5);\r
      fieldUniforms.uStretch.value = clamp(s.stretch, 0, 0.95);\r
      fieldUniforms.uGlint.value = Math.max(0, s.glint);\r
      fieldUniforms.uContrast.value = clamp(s.contrast, 0.2, 4);\r
      fieldUniforms.uPerspective.value = clamp(s.perspective, 0, 1);\r
      fieldUniforms.uFog.value = clamp(s.fog, 0, 1);\r
      fieldUniforms.uIntro.value = introEase;\r
      fieldUniforms.uFluid.value = fluidActive ? 1 : 0;\r
      fieldUniforms.tVelocity.value = fluid ? fluid.velocity.read.texture : blank;\r
      fieldUniforms.tInk.value = fluid ? fluid.ink.read.texture : blank;\r
      fieldUniforms.uFluidTexel.value = fluidTexel.value;\r
      fieldUniforms.uInk.value = clamp(s.cursorStrength, 0, 3);\r
      fieldUniforms.uLean.value = clamp(s.lean, 0, 1);\r
      renderer.render({ scene: fieldMesh, target: fieldTarget });\r
\r
      slatUniforms.uSize.value = [width, height];\r
      slatUniforms.uDpr.value = renderer.dpr;\r
      slatUniforms.uGrid.value = grid.grid;\r
      slatUniforms.uOrigin.value = grid.origin;\r
      slatUniforms.uSlat.value = [grid.slatW, grid.slatH];\r
      slatUniforms.uRound.value = clamp(s.roundness, 0, 1);\r
      slatUniforms.uTilt.value = fluidActive && s.lean > 0 ? grid.tilt : 0;\r
      slatUniforms.uColor.value = s.color.slice(0, 3);\r
      slatUniforms.uGlintColor.value = s.glintColor.slice(0, 3);\r
      slatUniforms.uBackground.value = s.backgroundColor;\r
      renderer.render({ scene: slatMesh });\r
\r
      const moving = (!s.paused && !reducedMotion && s.speed !== 0) || introClock < 1;\r
      if (visible && (moving || fluidActive || fluidDirty)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = e => {\r
      const rect = container.getBoundingClientRect();\r
      const x = e.clientX - rect.left;\r
      const y = e.clientY - rect.top;\r
      const w = Math.max(1, rect.width);\r
      const h = Math.max(1, rect.height);\r
      return { x, y, u: x / w, v: 1 - y / h, h, inside: x >= 0 && y >= 0 && x <= w && y <= h };\r
    };\r
\r
    const queue = (u, v, du, dv, turn) => {\r
      if (splats.length > 32) splats.shift();\r
      splats.push([u, v, du, dv, turn]);\r
      const s = settingsRef.current;\r
      fluidUntil = performance.now() + Math.max(1.5, (s ? s.trail : 1.4) * 5) * 1000;\r
      start();\r
    };\r
\r
    const onPointerMove = e => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!fluid || !s || !s.interactive || reducedMotion || !spot.inside) {\r
        pointer.tracked = false;\r
        return;\r
      }\r
      if (pointer.tracked && (spot.x !== pointer.x || spot.y !== pointer.y)) {\r
        queue(spot.u, spot.v, (spot.x - pointer.x) / spot.h, (pointer.y - spot.y) / spot.h, null);\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.tracked = true;\r
    };\r
\r
    const onPointerDown = e => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!fluid || !s || !s.interactive || reducedMotion || !spot.inside) return;\r
      splashTurn += 2.39996;\r
      queue(spot.u, spot.v, 0, 0, splashTurn);\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.tracked = false;\r
    };\r
\r
    const onPointerOut = e => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('blur', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    wakeRef.current = start;\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerout', onPointerOut);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      disposeFluid();\r
      dispose(fieldTarget);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full overflow-hidden \${className}\`.trim()} style={style} />\r
  );\r
};\r
\r
export default MicroSlats;\r
`,t=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Triangle, RenderTarget, Texture } from 'ogl';\r
\r
import './MicroSlats.css';\r
\r
type SwellPreset = 'swell' | 'tide' | 'storm' | 'signal';\r
type Rgba = [number, number, number, number];\r
\r
interface WaveValues {\r
  scale: number;\r
  speed: number;\r
  direction: number;\r
  chop: number;\r
  stretch: number;\r
  glint: number;\r
  contrast: number;\r
  perspective: number;\r
  fog: number;\r
}\r
\r
export interface MicroSlatsProps extends Partial<WaveValues> {\r
  preset?: SwellPreset;\r
  color?: string;\r
  glintColor?: string;\r
  backgroundColor?: string;\r
  slatWidth?: number;\r
  slatHeight?: number;\r
  gap?: number;\r
  roundness?: number;\r
  interactive?: boolean;\r
  cursorStrength?: number;\r
  cursorSize?: number;\r
  swirl?: number;\r
  trail?: number;\r
  lean?: number;\r
  intro?: boolean;\r
  introDuration?: number;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings extends WaveValues {\r
  color: Rgba;\r
  glintColor: Rgba;\r
  backgroundColor: Rgba;\r
  slatWidth: number;\r
  slatHeight: number;\r
  gap: number;\r
  roundness: number;\r
  interactive: boolean;\r
  cursorStrength: number;\r
  cursorSize: number;\r
  swirl: number;\r
  trail: number;\r
  lean: number;\r
  intro: boolean;\r
  introDuration: number;\r
  paused: boolean;\r
}\r
\r
interface GridLayout {\r
  slatW: number;\r
  slatH: number;\r
  tilt: number;\r
  grid: number[];\r
  origin: number[];\r
}\r
\r
interface Pair {\r
  read: RenderTarget;\r
  write: RenderTarget;\r
  swap: () => void;\r
}\r
\r
interface Fluid {\r
  width: number;\r
  height: number;\r
  velocity: Pair;\r
  ink: Pair;\r
  pressure: Pair;\r
  divergence: RenderTarget;\r
  curl: RenderTarget;\r
}\r
\r
type Splat = [number, number, number, number, number | null];\r
\r
const SWELL_PRESETS: Record<SwellPreset, WaveValues> = {\r
  swell: {\r
    scale: 1.5,\r
    speed: 0.6,\r
    direction: 250,\r
    chop: 0.55,\r
    stretch: 0,\r
    glint: 0.7,\r
    contrast: 1.25,\r
    perspective: 0.55,\r
    fog: 0.55\r
  },\r
  tide: {\r
    scale: 1.3,\r
    speed: 0.5,\r
    direction: 262,\r
    chop: 0.2,\r
    stretch: 0.12,\r
    glint: 0.45,\r
    contrast: 1.1,\r
    perspective: 0.5,\r
    fog: 0.4\r
  },\r
  storm: {\r
    scale: 0.55,\r
    speed: 1.6,\r
    direction: 236,\r
    chop: 1,\r
    stretch: 0.3,\r
    glint: 1.3,\r
    contrast: 1.8,\r
    perspective: 0.8,\r
    fog: 0.35\r
  },\r
  signal: {\r
    scale: 0.85,\r
    speed: 1.2,\r
    direction: 180,\r
    chop: 0.6,\r
    stretch: 0.85,\r
    glint: 0.25,\r
    contrast: 1.2,\r
    perspective: 0,\r
    fog: 0\r
  }\r
};\r
\r
const FLUID_SIZE = 96;\r
const PRESSURE_STEPS = 16;\r
const SPLAT_FORCE = 6900;\r
const SPLASH_JETS = 3;\r
const PIXEL_BUDGET = 4.5e6;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);\r
\r
const parseColor = (value: string, fallback: Rgba): Rgba => {\r
  try {\r
    const ctx = document.createElement('canvas').getContext('2d');\r
    if (!ctx) return fallback;\r
    ctx.fillStyle = '#000000';\r
    ctx.fillStyle = value;\r
    const resolved = ctx.fillStyle;\r
    if (resolved.startsWith('#')) {\r
      const n = parseInt(resolved.slice(1), 16);\r
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];\r
    }\r
    const parts = resolved.match(/[\\d.]+/g);\r
    if (!parts || parts.length < 3) return fallback;\r
    return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255, parts[3] ? Number(parts[3]) : 1];\r
  } catch {\r
    return fallback;\r
  }\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fluidVertex = \`#version 300 es\r
in vec2 position;\r
uniform vec2 uTexel;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = position * 0.5 + 0.5;\r
  vL = vUv - vec2(uTexel.x, 0.0);\r
  vR = vUv + vec2(uTexel.x, 0.0);\r
  vT = vUv + vec2(0.0, uTexel.y);\r
  vB = vUv - vec2(0.0, uTexel.y);\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fluidHead = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
in vec2 vL;\r
in vec2 vR;\r
in vec2 vT;\r
in vec2 vB;\r
out vec4 fragColor;\r
\`;\r
\r
const splatFragment = \`\${fluidHead}\r
uniform sampler2D uTarget;\r
uniform float uAspect;\r
uniform vec2 uPoint;\r
uniform vec3 uValue;\r
uniform float uRadius;\r
void main() {\r
  vec2 offset = vUv - uPoint;\r
  offset.x *= uAspect;\r
  float falloff = exp(-dot(offset, offset) / uRadius);\r
  fragColor = vec4(texture(uTarget, vUv).xyz + uValue * falloff, 1.0);\r
}\r
\`;\r
\r
const curlFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uVelocity, vL).y;\r
  float right = texture(uVelocity, vR).y;\r
  float top = texture(uVelocity, vT).x;\r
  float bottom = texture(uVelocity, vB).x;\r
  fragColor = vec4(0.5 * (right - left - top + bottom), 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const vorticityFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uCurl;\r
uniform float uSwirl;\r
uniform float uDt;\r
void main() {\r
  float left = texture(uCurl, vL).x;\r
  float right = texture(uCurl, vR).x;\r
  float top = texture(uCurl, vT).x;\r
  float bottom = texture(uCurl, vB).x;\r
  float middle = texture(uCurl, vUv).x;\r
  vec2 force = 0.5 * vec2(abs(top) - abs(bottom), abs(right) - abs(left));\r
  force = force / (length(force) + 0.0001) * uSwirl * middle;\r
  force.y = -force.y;\r
  vec2 velocity = texture(uVelocity, vUv).xy + force * uDt;\r
  fragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);\r
}\r
\`;\r
\r
const divergenceFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
void main() {\r
  vec2 middle = texture(uVelocity, vUv).xy;\r
  float left = vL.x < 0.0 ? -middle.x : texture(uVelocity, vL).x;\r
  float right = vR.x > 1.0 ? -middle.x : texture(uVelocity, vR).x;\r
  float top = vT.y > 1.0 ? -middle.y : texture(uVelocity, vT).y;\r
  float bottom = vB.y < 0.0 ? -middle.y : texture(uVelocity, vB).y;\r
  fragColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const pressureFragment = \`\${fluidHead}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  fragColor = vec4((left + right + top + bottom - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const projectFragment = \`\${fluidHead}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\r
\`;\r
\r
const advectFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform float uDt;\r
uniform float uFade;\r
void main() {\r
  vec2 from = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;\r
  fragColor = texture(uSource, from) / (1.0 + uFade * uDt);\r
}\r
\`;\r
\r
const scaleFragment = \`\${fluidHead}\r
uniform sampler2D uSource;\r
uniform float uValue;\r
void main() {\r
  fragColor = texture(uSource, vUv) * uValue;\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
uniform vec2 uSize;\r
uniform vec4 uGrid;\r
uniform vec2 uOrigin;\r
uniform vec2 uSlat;\r
uniform float uTime;\r
uniform float uScale;\r
uniform float uDirection;\r
uniform float uChop;\r
uniform float uStretch;\r
uniform float uGlint;\r
uniform float uContrast;\r
uniform float uPerspective;\r
uniform float uFog;\r
uniform float uIntro;\r
uniform sampler2D tVelocity;\r
uniform sampler2D tInk;\r
uniform vec2 uFluidTexel;\r
uniform float uFluid;\r
uniform float uInk;\r
uniform float uLean;\r
out vec4 fragColor;\r
\r
const float TURN[4] = float[4](0.0, -0.95, 0.78, 1.62);\r
const float LENGTH[4] = float[4](2.6, 1.7, 1.12, 0.76);\r
const float HEIGHT[4] = float[4](1.0, 0.75, 0.5, 0.3);\r
const float SHIFT[4] = float[4](0.0, 2.3, 4.1, 1.1);\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  float row = uGrid.y - 1.0 - cell.y;\r
  vec2 center = uOrigin + vec2(cell.x, row) * uGrid.zw + uSlat * 0.5;\r
  float v = clamp(center.y / uSize.y, 0.0, 1.0);\r
\r
  vec2 flow = vec2(0.0);\r
  float ink = 0.0;\r
  if (uFluid > 0.5) {\r
    vec2 fluidUv = clamp(vec2(center.x / uSize.x, 1.0 - center.y / uSize.y), 0.0, 1.0);\r
    flow = texture(tVelocity, fluidUv).xy * uFluidTexel * uSize;\r
    ink = texture(tInk, fluidUv).x;\r
  }\r
\r
  float horizon = mix(8.0, 0.5, uPerspective);\r
  float depth = (1.0 + horizon) / (v + horizon);\r
  vec2 world = vec2((center.x - uSize.x * 0.5) / uSize.y * depth, (depth - 1.0) * horizon * 2.2);\r
  world -= flow * 0.00018 * depth;\r
  world /= max(uScale, 0.05);\r
\r
  float meander = 0.55 * sin(dot(world, vec2(0.23, 0.41)) * 0.9 + uTime * 0.13)\r
    + 0.3 * sin(dot(world, vec2(-0.37, 0.19)) * 1.4 - uTime * 0.09);\r
\r
  float steep = uChop * 0.45;\r
  float height = 0.0;\r
  float total = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    float angle = uDirection + TURN[i];\r
    vec2 heading = vec2(cos(angle), sin(angle));\r
    float k = 6.2831853 / LENGTH[i];\r
    float omega = sqrt(9.81 * k) * 0.35;\r
    float theta = k * dot(world, heading) - omega * uTime + SHIFT[i] + meander * (0.6 + 0.3 * float(i));\r
    height += HEIGHT[i] * (cos(theta) + steep * cos(2.0 * theta));\r
    total += HEIGHT[i] * (1.0 + steep);\r
  }\r
  float level = clamp(0.5 + 0.5 * height / (total * 0.85), 0.0, 1.0);\r
  float crest = smoothstep(0.6, 1.0, level);\r
  float glint = crest * crest * uGlint;\r
\r
  float haze = mix(1.0, 1.0 - uFog, pow(1.0 - v, 1.4));\r
  float light = (pow(level, uContrast) + glint * 0.8) * haze;\r
  float glow = 1.0 - exp(-max(ink, 0.0) * uInk * 1.6);\r
  light = 1.0 - (1.0 - clamp(light, 0.0, 1.0)) * (1.0 - glow);\r
\r
  float front = uIntro * 1.35;\r
  float reveal = 1.0 - smoothstep(front - 0.35, front, v);\r
  float sweep = exp(-pow((v - front + 0.22) / 0.07, 2.0)) * (1.0 - uIntro);\r
  light = (light + sweep * 0.8) * reveal;\r
  light = max(light, 0.045 * reveal);\r
  float span = mix(1.0 - uStretch, 1.0, level) + glow * 0.3;\r
  span = clamp(span, 0.08, 1.0) * mix(0.1, 1.0, reveal);\r
  float tint = clamp(max(glint * 1.4, glow * 0.9) + sweep, 0.0, 1.0);\r
  float lean = clamp(flow.x / 1400.0, -1.0, 1.0) * uLean * reveal;\r
\r
  fragColor = vec4(clamp(light, 0.0, 1.0), span, tint, 0.5 + 0.5 * lean);\r
}\r
\`;\r
\r
const slatFragment = \`#version 300 es\r
precision highp float;\r
uniform sampler2D tField;\r
uniform vec2 uSize;\r
uniform float uDpr;\r
uniform vec4 uGrid;\r
uniform vec2 uOrigin;\r
uniform vec2 uSlat;\r
uniform float uRound;\r
uniform float uTilt;\r
uniform vec3 uColor;\r
uniform vec3 uGlintColor;\r
uniform vec4 uBackground;\r
out vec4 fragColor;\r
\r
float pill(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;\r
  vec2 local = p - uOrigin;\r
  vec2 cell = floor(local / uGrid.zw);\r
  vec4 background = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  vec4 slat = vec4(0.0);\r
  int reach = uTilt > 0.0 ? 1 : 0;\r
  for (int dx = -1; dx <= 1; dx++) {\r
    if (abs(dx) > reach) continue;\r
    vec2 neighbour = cell + vec2(float(dx), 0.0);\r
    if (neighbour.x < 0.0 || neighbour.y < 0.0 || neighbour.x >= uGrid.x || neighbour.y >= uGrid.y) continue;\r
    vec4 field = texelFetch(tField, ivec2(int(neighbour.x), int(uGrid.y - 1.0 - neighbour.y)), 0);\r
    vec2 offset = local - neighbour * uGrid.zw - uSlat * 0.5;\r
    float angle = (field.a - 0.5) * 2.0 * uTilt;\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    vec2 turned = vec2(c * offset.x + s * offset.y, c * offset.y - s * offset.x);\r
    vec2 halfSize = vec2(uSlat.x * 0.5, uSlat.y * 0.5 * field.g);\r
    float radius = uRound * min(halfSize.x, halfSize.y);\r
    float alpha = clamp(0.5 - pill(turned, halfSize, radius) * uDpr, 0.0, 1.0) * field.r;\r
    if (alpha > slat.a) slat = vec4(mix(uColor, uGlintColor, field.b) * alpha, alpha);\r
  }\r
  fragColor = slat + background * (1.0 - slat.a);\r
}\r
\`;\r
\r
const MicroSlats = ({\r
  preset = 'swell',\r
  color = '#A855F7',\r
  glintColor = '#ffffff',\r
  backgroundColor = '#000000',\r
  slatWidth = 10,\r
  slatHeight = 25,\r
  gap = 3,\r
  roundness = 0.75,\r
  scale,\r
  speed,\r
  direction,\r
  chop,\r
  stretch,\r
  glint,\r
  contrast,\r
  perspective,\r
  fog,\r
  interactive = true,\r
  cursorStrength = 1,\r
  cursorSize = 40,\r
  swirl = 0,\r
  trail = 1.4,\r
  lean = 0,\r
  intro = true,\r
  introDuration = 1.5,\r
  paused = false,\r
  className = '',\r
  style\r
}: MicroSlatsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
\r
  const base = SWELL_PRESETS[preset] || SWELL_PRESETS.swell;\r
  const pick = <K extends keyof WaveValues>(value: WaveValues[K] | undefined, key: K): WaveValues[K] =>\r
    value === undefined || value === null ? base[key] : value;\r
\r
  const colors = useMemo(\r
    () => ({\r
      color: parseColor(color, [0.66, 0.33, 0.97, 1]),\r
      glintColor: parseColor(glintColor, [1, 1, 1, 1]),\r
      backgroundColor: parseColor(backgroundColor, [0, 0, 0, 1])\r
    }),\r
    [color, glintColor, backgroundColor]\r
  );\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      slatWidth,\r
      slatHeight,\r
      gap,\r
      roundness,\r
      scale: pick(scale, 'scale'),\r
      speed: pick(speed, 'speed'),\r
      direction: pick(direction, 'direction'),\r
      chop: pick(chop, 'chop'),\r
      stretch: pick(stretch, 'stretch'),\r
      glint: pick(glint, 'glint'),\r
      contrast: pick(contrast, 'contrast'),\r
      perspective: pick(perspective, 'perspective'),\r
      fog: pick(fog, 'fog'),\r
      interactive,\r
      cursorStrength,\r
      cursorSize,\r
      swirl,\r
      trail,\r
      lean,\r
      intro,\r
      introDuration,\r
      paused\r
    };\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, depth: false });\r
    const gl = renderer.gl;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    gl.clearColor(0, 0, 0, 0);\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    container.appendChild(canvas);\r
\r
    const geometry = new Triangle(gl);\r
    const blank = new Texture(gl);\r
    const floatTargets = !!(\r
      gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')\r
    );\r
\r
    const dispose = (target: RenderTarget) => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
\r
    let fieldTarget = new RenderTarget(gl, {\r
      width: 1,\r
      height: 1,\r
      depth: false,\r
      minFilter: gl.NEAREST,\r
      magFilter: gl.NEAREST\r
    });\r
\r
    const fieldUniforms = {\r
      uSize: { value: [1, 1] },\r
      uGrid: { value: [1, 1, 1, 1] },\r
      uOrigin: { value: [0, 0] },\r
      uSlat: { value: [1, 1] },\r
      uTime: { value: 0 },\r
      uScale: { value: 1 },\r
      uDirection: { value: 0 },\r
      uChop: { value: 0.5 },\r
      uStretch: { value: 0.3 },\r
      uGlint: { value: 1 },\r
      uContrast: { value: 1 },\r
      uPerspective: { value: 0.7 },\r
      uFog: { value: 0.5 },\r
      uIntro: { value: 0 },\r
      tVelocity: { value: blank },\r
      tInk: { value: blank },\r
      uFluidTexel: { value: [1, 1] },\r
      uFluid: { value: 0 },\r
      uInk: { value: 1 },\r
      uLean: { value: 0.5 }\r
    };\r
    const fieldMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: fieldFragment,\r
        uniforms: fieldUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const slatUniforms = {\r
      tField: { value: fieldTarget.texture },\r
      uSize: { value: [1, 1] },\r
      uDpr: { value: 1 },\r
      uGrid: { value: [1, 1, 1, 1] },\r
      uOrigin: { value: [0, 0] },\r
      uSlat: { value: [1, 1] },\r
      uRound: { value: 1 },\r
      uTilt: { value: 0 },\r
      uColor: { value: [1, 1, 1] },\r
      uGlintColor: { value: [1, 1, 1] },\r
      uBackground: { value: [0, 0, 0, 1] }\r
    };\r
    const slatMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: slatFragment,\r
        uniforms: slatUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const fluidTexel = { value: [1, 1] };\r
    const fluidPass = (fragment: string, uniforms: Record<string, { value: unknown }>) =>\r
      new Mesh(gl, {\r
        geometry,\r
        program: new Program(gl, {\r
          vertex: fluidVertex,\r
          fragment,\r
          uniforms: { uTexel: fluidTexel, ...uniforms },\r
          depthTest: false,\r
          depthWrite: false\r
        })\r
      });\r
    const splatPass = fluidPass(splatFragment, {\r
      uTarget: { value: blank },\r
      uAspect: { value: 1 },\r
      uPoint: { value: [0, 0] },\r
      uValue: { value: [0, 0, 0] },\r
      uRadius: { value: 0.01 }\r
    });\r
    const curlPass = fluidPass(curlFragment, { uVelocity: { value: blank } });\r
    const vorticityPass = fluidPass(vorticityFragment, {\r
      uVelocity: { value: blank },\r
      uCurl: { value: blank },\r
      uSwirl: { value: 20 },\r
      uDt: { value: 0.016 }\r
    });\r
    const divergencePass = fluidPass(divergenceFragment, { uVelocity: { value: blank } });\r
    const pressurePass = fluidPass(pressureFragment, { uPressure: { value: blank }, uDivergence: { value: blank } });\r
    const projectPass = fluidPass(projectFragment, { uPressure: { value: blank }, uVelocity: { value: blank } });\r
    const advectPass = fluidPass(advectFragment, {\r
      uVelocity: { value: blank },\r
      uSource: { value: blank },\r
      uDt: { value: 0.016 },\r
      uFade: { value: 1 }\r
    });\r
    const scalePass = fluidPass(scaleFragment, { uSource: { value: blank }, uValue: { value: 0 } });\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let time = 0;\r
    let introClock = 0;\r
    let visible = true;\r
    let alive = true;\r
    let fluid: Fluid | null = null;\r
    let fluidUntil = 0;\r
    let fluidDirty = false;\r
    let splashTurn = 0;\r
    const splats: Splat[] = [];\r
    const pointer = { x: 0, y: 0, tracked: false };\r
\r
    const run = (mesh: Mesh, target?: RenderTarget) => renderer.render({ scene: mesh, target, clear: false });\r
\r
    const floatTarget = (w: number, h: number) =>\r
      new RenderTarget(gl, {\r
        width: w,\r
        height: h,\r
        depth: false,\r
        type: (gl as unknown as WebGL2RenderingContext).HALF_FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: (gl as unknown as WebGL2RenderingContext).RGBA16F,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR\r
      });\r
\r
    const swapPair = (w: number, h: number): Pair => ({\r
      read: floatTarget(w, h),\r
      write: floatTarget(w, h),\r
      swap() {\r
        const next = this.read;\r
        this.read = this.write;\r
        this.write = next;\r
      }\r
    });\r
\r
    const disposeFluid = () => {\r
      if (!fluid) return;\r
      [fluid.velocity, fluid.ink, fluid.pressure].forEach(pair => {\r
        dispose(pair.read);\r
        dispose(pair.write);\r
      });\r
      dispose(fluid.divergence);\r
      dispose(fluid.curl);\r
      fluid = null;\r
    };\r
\r
    const buildFluid = () => {\r
      if (!floatTargets) return;\r
      const aspect = width / height;\r
      const w = Math.max(8, Math.round(aspect >= 1 ? FLUID_SIZE * aspect : FLUID_SIZE));\r
      const h = Math.max(8, Math.round(aspect >= 1 ? FLUID_SIZE : FLUID_SIZE / aspect));\r
      if (fluid && fluid.width === w && fluid.height === h) return;\r
      disposeFluid();\r
      fluid = {\r
        width: w,\r
        height: h,\r
        velocity: swapPair(w, h),\r
        ink: swapPair(w, h),\r
        pressure: swapPair(w, h),\r
        divergence: floatTarget(w, h),\r
        curl: floatTarget(w, h)\r
      };\r
      fluidTexel.value = [1 / w, 1 / h];\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      buildFluid();\r
      start();\r
    };\r
\r
    const layout = (s: Settings): GridLayout => {\r
      const slatW = clamp(s.slatWidth, 1, 64);\r
      const slatH = clamp(s.slatHeight, 2, 240);\r
      const gapSize = clamp(s.gap, 0, 64);\r
      const pitchX = slatW + gapSize;\r
      const pitchY = slatH + gapSize;\r
      const cols = Math.min(2048, Math.ceil((width + gapSize) / pitchX) + 1);\r
      const rows = Math.min(2048, Math.ceil((height + gapSize) / pitchY) + 1);\r
      const originX = (width - (cols * pitchX - gapSize)) / 2;\r
      const originY = (height - (rows * pitchY - gapSize)) / 2;\r
      if (fieldTarget.width !== cols || fieldTarget.height !== rows) {\r
        dispose(fieldTarget);\r
        fieldTarget = new RenderTarget(gl, {\r
          width: cols,\r
          height: rows,\r
          depth: false,\r
          minFilter: gl.NEAREST,\r
          magFilter: gl.NEAREST\r
        });\r
        slatUniforms.tField.value = fieldTarget.texture;\r
      }\r
      const tilt = Math.min(0.42, Math.asin(clamp((pitchX * 1.5 - slatW * 0.5) / (slatH * 0.5), 0, 1)));\r
      return { slatW, slatH, tilt, grid: [cols, rows, pitchX, pitchY], origin: [originX, originY] };\r
    };\r
\r
    const splat = (pair: Pair, point: number[], value: number[], radius: number) => {\r
      const u = splatPass.program.uniforms;\r
      u.uTarget.value = pair.read.texture;\r
      u.uAspect.value = width / height;\r
      u.uPoint.value = point;\r
      u.uValue.value = value;\r
      u.uRadius.value = radius;\r
      run(splatPass, pair.write);\r
      pair.swap();\r
    };\r
\r
    const stepFluid = (f: Fluid, dt: number, s: Settings) => {\r
      if (s.swirl > 0) {\r
        curlPass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
        run(curlPass, f.curl);\r
\r
        const vorticity = vorticityPass.program.uniforms;\r
        vorticity.uVelocity.value = f.velocity.read.texture;\r
        vorticity.uCurl.value = f.curl.texture;\r
        vorticity.uSwirl.value = clamp(s.swirl, 0, 2) * 40;\r
        vorticity.uDt.value = dt;\r
        run(vorticityPass, f.velocity.write);\r
        f.velocity.swap();\r
      }\r
\r
      divergencePass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
      run(divergencePass, f.divergence);\r
\r
      scalePass.program.uniforms.uSource.value = f.pressure.read.texture;\r
      scalePass.program.uniforms.uValue.value = 0.8;\r
      run(scalePass, f.pressure.write);\r
      f.pressure.swap();\r
\r
      pressurePass.program.uniforms.uDivergence.value = f.divergence.texture;\r
      for (let i = 0; i < PRESSURE_STEPS; i++) {\r
        pressurePass.program.uniforms.uPressure.value = f.pressure.read.texture;\r
        run(pressurePass, f.pressure.write);\r
        f.pressure.swap();\r
      }\r
\r
      projectPass.program.uniforms.uPressure.value = f.pressure.read.texture;\r
      projectPass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
      run(projectPass, f.velocity.write);\r
      f.velocity.swap();\r
\r
      const fade = 1 / clamp(s.trail, 0.1, 10);\r
      const advect = advectPass.program.uniforms;\r
      advect.uDt.value = dt;\r
      advect.uVelocity.value = f.velocity.read.texture;\r
      advect.uSource.value = f.velocity.read.texture;\r
      advect.uFade.value = fade * 1.4;\r
      run(advectPass, f.velocity.write);\r
      f.velocity.swap();\r
\r
      advect.uVelocity.value = f.velocity.read.texture;\r
      advect.uSource.value = f.ink.read.texture;\r
      advect.uFade.value = fade;\r
      run(advectPass, f.ink.write);\r
      f.ink.swap();\r
    };\r
\r
    const clearFluid = (f: Fluid) => {\r
      scalePass.program.uniforms.uValue.value = 0;\r
      [f.velocity, f.ink, f.pressure].forEach(pair => {\r
        scalePass.program.uniforms.uSource.value = pair.read.texture;\r
        run(scalePass, pair.write);\r
        pair.swap();\r
      });\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      if (!s.paused && !reducedMotion) time += dt * s.speed;\r
      introClock = s.intro && !reducedMotion ? introClock + dt / Math.max(0.2, s.introDuration) : 1;\r
      const introLinear = Math.min(introClock, 1);\r
      const introEase =\r
        introLinear < 0.5 ? 4 * introLinear * introLinear * introLinear : 1 - Math.pow(-2 * introLinear + 2, 3) / 2;\r
\r
      if (fluid && splats.length) {\r
        const radius = Math.pow(clamp(s.cursorSize, 4, 600) / height, 2) * 0.35;\r
        const aspect = width / height;\r
        for (const [u, v, du, dv, turn] of splats) {\r
          if (turn === null) {\r
            splat(fluid.velocity, [u, v], [du * SPLAT_FORCE, dv * SPLAT_FORCE, 0], radius);\r
            splat(fluid.ink, [u, v], [0.13, 0, 0], radius);\r
            continue;\r
          }\r
          const jet = radius * 0.55;\r
          const reach = Math.sqrt(jet * 0.5) * 1.9;\r
          const push = SPLAT_FORCE * 0.08;\r
          for (let i = 0; i < SPLASH_JETS; i++) {\r
            const angle = turn + (i / SPLASH_JETS) * Math.PI * 2;\r
            const dx = Math.cos(angle);\r
            const dy = Math.sin(angle);\r
            const point = [u + (dx * reach) / aspect, v + dy * reach];\r
            const spin = [(dx - dy) * Math.SQRT1_2 * push, (dy + dx) * Math.SQRT1_2 * push, 0];\r
            splat(fluid.velocity, point, spin, jet);\r
            splat(fluid.ink, point, [0.75, 0, 0], jet);\r
          }\r
          splat(fluid.ink, [u, v], [0.45, 0, 0], radius);\r
        }\r
        splats.length = 0;\r
        fluidDirty = true;\r
      }\r
      const fluidActive = fluid !== null && now < fluidUntil;\r
      if (fluid) {\r
        if (fluidActive) stepFluid(fluid, Math.min(Math.max(dt, 1 / 240), 1 / 30), s);\r
        else if (fluidDirty) {\r
          clearFluid(fluid);\r
          fluidDirty = false;\r
        }\r
      }\r
\r
      const grid = layout(s);\r
\r
      fieldUniforms.uSize.value = [width, height];\r
      fieldUniforms.uGrid.value = grid.grid;\r
      fieldUniforms.uOrigin.value = grid.origin;\r
      fieldUniforms.uSlat.value = [grid.slatW, grid.slatH];\r
      fieldUniforms.uTime.value = time;\r
      fieldUniforms.uScale.value = s.scale;\r
      fieldUniforms.uDirection.value = (s.direction * Math.PI) / 180;\r
      fieldUniforms.uChop.value = clamp(s.chop, 0, 1.5);\r
      fieldUniforms.uStretch.value = clamp(s.stretch, 0, 0.95);\r
      fieldUniforms.uGlint.value = Math.max(0, s.glint);\r
      fieldUniforms.uContrast.value = clamp(s.contrast, 0.2, 4);\r
      fieldUniforms.uPerspective.value = clamp(s.perspective, 0, 1);\r
      fieldUniforms.uFog.value = clamp(s.fog, 0, 1);\r
      fieldUniforms.uIntro.value = introEase;\r
      fieldUniforms.uFluid.value = fluidActive ? 1 : 0;\r
      fieldUniforms.tVelocity.value = fluid ? fluid.velocity.read.texture : blank;\r
      fieldUniforms.tInk.value = fluid ? fluid.ink.read.texture : blank;\r
      fieldUniforms.uFluidTexel.value = fluidTexel.value;\r
      fieldUniforms.uInk.value = clamp(s.cursorStrength, 0, 3);\r
      fieldUniforms.uLean.value = clamp(s.lean, 0, 1);\r
      renderer.render({ scene: fieldMesh, target: fieldTarget });\r
\r
      slatUniforms.uSize.value = [width, height];\r
      slatUniforms.uDpr.value = renderer.dpr;\r
      slatUniforms.uGrid.value = grid.grid;\r
      slatUniforms.uOrigin.value = grid.origin;\r
      slatUniforms.uSlat.value = [grid.slatW, grid.slatH];\r
      slatUniforms.uRound.value = clamp(s.roundness, 0, 1);\r
      slatUniforms.uTilt.value = fluidActive && s.lean > 0 ? grid.tilt : 0;\r
      slatUniforms.uColor.value = s.color.slice(0, 3);\r
      slatUniforms.uGlintColor.value = s.glintColor.slice(0, 3);\r
      slatUniforms.uBackground.value = s.backgroundColor;\r
      renderer.render({ scene: slatMesh });\r
\r
      const moving = (!s.paused && !reducedMotion && s.speed !== 0) || introClock < 1;\r
      if (visible && (moving || fluidActive || fluidDirty)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (e: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = e.clientX - rect.left;\r
      const y = e.clientY - rect.top;\r
      const w = Math.max(1, rect.width);\r
      const h = Math.max(1, rect.height);\r
      return { x, y, u: x / w, v: 1 - y / h, h, inside: x >= 0 && y >= 0 && x <= w && y <= h };\r
    };\r
\r
    const queue = (u: number, v: number, du: number, dv: number, turn: number | null) => {\r
      if (splats.length > 32) splats.shift();\r
      splats.push([u, v, du, dv, turn]);\r
      const s = settingsRef.current;\r
      fluidUntil = performance.now() + Math.max(1.5, (s ? s.trail : 1.4) * 5) * 1000;\r
      start();\r
    };\r
\r
    const onPointerMove = (e: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!fluid || !s || !s.interactive || reducedMotion || !spot.inside) {\r
        pointer.tracked = false;\r
        return;\r
      }\r
      if (pointer.tracked && (spot.x !== pointer.x || spot.y !== pointer.y)) {\r
        queue(spot.u, spot.v, (spot.x - pointer.x) / spot.h, (pointer.y - spot.y) / spot.h, null);\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.tracked = true;\r
    };\r
\r
    const onPointerDown = (e: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!fluid || !s || !s.interactive || reducedMotion || !spot.inside) return;\r
      splashTurn += 2.39996;\r
      queue(spot.u, spot.v, 0, 0, splashTurn);\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.tracked = false;\r
    };\r
\r
    const onPointerOut = (e: PointerEvent) => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('blur', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    wakeRef.current = start;\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerout', onPointerOut);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      disposeFluid();\r
      dispose(fieldTarget);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`micro-slats \${className}\`.trim()} style={style} />;\r
};\r
\r
export default MicroSlats;\r
`,i=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Triangle, RenderTarget, Texture } from 'ogl';\r
\r
type SwellPreset = 'swell' | 'tide' | 'storm' | 'signal';\r
type Rgba = [number, number, number, number];\r
\r
interface WaveValues {\r
  scale: number;\r
  speed: number;\r
  direction: number;\r
  chop: number;\r
  stretch: number;\r
  glint: number;\r
  contrast: number;\r
  perspective: number;\r
  fog: number;\r
}\r
\r
export interface MicroSlatsProps extends Partial<WaveValues> {\r
  preset?: SwellPreset;\r
  color?: string;\r
  glintColor?: string;\r
  backgroundColor?: string;\r
  slatWidth?: number;\r
  slatHeight?: number;\r
  gap?: number;\r
  roundness?: number;\r
  interactive?: boolean;\r
  cursorStrength?: number;\r
  cursorSize?: number;\r
  swirl?: number;\r
  trail?: number;\r
  lean?: number;\r
  intro?: boolean;\r
  introDuration?: number;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings extends WaveValues {\r
  color: Rgba;\r
  glintColor: Rgba;\r
  backgroundColor: Rgba;\r
  slatWidth: number;\r
  slatHeight: number;\r
  gap: number;\r
  roundness: number;\r
  interactive: boolean;\r
  cursorStrength: number;\r
  cursorSize: number;\r
  swirl: number;\r
  trail: number;\r
  lean: number;\r
  intro: boolean;\r
  introDuration: number;\r
  paused: boolean;\r
}\r
\r
interface GridLayout {\r
  slatW: number;\r
  slatH: number;\r
  tilt: number;\r
  grid: number[];\r
  origin: number[];\r
}\r
\r
interface Pair {\r
  read: RenderTarget;\r
  write: RenderTarget;\r
  swap: () => void;\r
}\r
\r
interface Fluid {\r
  width: number;\r
  height: number;\r
  velocity: Pair;\r
  ink: Pair;\r
  pressure: Pair;\r
  divergence: RenderTarget;\r
  curl: RenderTarget;\r
}\r
\r
type Splat = [number, number, number, number, number | null];\r
\r
const SWELL_PRESETS: Record<SwellPreset, WaveValues> = {\r
  swell: {\r
    scale: 1.5,\r
    speed: 0.6,\r
    direction: 250,\r
    chop: 0.55,\r
    stretch: 0,\r
    glint: 0.7,\r
    contrast: 1.25,\r
    perspective: 0.55,\r
    fog: 0.55\r
  },\r
  tide: {\r
    scale: 1.3,\r
    speed: 0.5,\r
    direction: 262,\r
    chop: 0.2,\r
    stretch: 0.12,\r
    glint: 0.45,\r
    contrast: 1.1,\r
    perspective: 0.5,\r
    fog: 0.4\r
  },\r
  storm: {\r
    scale: 0.55,\r
    speed: 1.6,\r
    direction: 236,\r
    chop: 1,\r
    stretch: 0.3,\r
    glint: 1.3,\r
    contrast: 1.8,\r
    perspective: 0.8,\r
    fog: 0.35\r
  },\r
  signal: {\r
    scale: 0.85,\r
    speed: 1.2,\r
    direction: 180,\r
    chop: 0.6,\r
    stretch: 0.85,\r
    glint: 0.25,\r
    contrast: 1.2,\r
    perspective: 0,\r
    fog: 0\r
  }\r
};\r
\r
const FLUID_SIZE = 96;\r
const PRESSURE_STEPS = 16;\r
const SPLAT_FORCE = 6900;\r
const SPLASH_JETS = 3;\r
const PIXEL_BUDGET = 4.5e6;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);\r
\r
const parseColor = (value: string, fallback: Rgba): Rgba => {\r
  try {\r
    const ctx = document.createElement('canvas').getContext('2d');\r
    if (!ctx) return fallback;\r
    ctx.fillStyle = '#000000';\r
    ctx.fillStyle = value;\r
    const resolved = ctx.fillStyle;\r
    if (resolved.startsWith('#')) {\r
      const n = parseInt(resolved.slice(1), 16);\r
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];\r
    }\r
    const parts = resolved.match(/[\\d.]+/g);\r
    if (!parts || parts.length < 3) return fallback;\r
    return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255, parts[3] ? Number(parts[3]) : 1];\r
  } catch {\r
    return fallback;\r
  }\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fluidVertex = \`#version 300 es\r
in vec2 position;\r
uniform vec2 uTexel;\r
out vec2 vUv;\r
out vec2 vL;\r
out vec2 vR;\r
out vec2 vT;\r
out vec2 vB;\r
void main() {\r
  vUv = position * 0.5 + 0.5;\r
  vL = vUv - vec2(uTexel.x, 0.0);\r
  vR = vUv + vec2(uTexel.x, 0.0);\r
  vT = vUv + vec2(0.0, uTexel.y);\r
  vB = vUv - vec2(0.0, uTexel.y);\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fluidHead = \`#version 300 es\r
precision highp float;\r
in vec2 vUv;\r
in vec2 vL;\r
in vec2 vR;\r
in vec2 vT;\r
in vec2 vB;\r
out vec4 fragColor;\r
\`;\r
\r
const splatFragment = \`\${fluidHead}\r
uniform sampler2D uTarget;\r
uniform float uAspect;\r
uniform vec2 uPoint;\r
uniform vec3 uValue;\r
uniform float uRadius;\r
void main() {\r
  vec2 offset = vUv - uPoint;\r
  offset.x *= uAspect;\r
  float falloff = exp(-dot(offset, offset) / uRadius);\r
  fragColor = vec4(texture(uTarget, vUv).xyz + uValue * falloff, 1.0);\r
}\r
\`;\r
\r
const curlFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uVelocity, vL).y;\r
  float right = texture(uVelocity, vR).y;\r
  float top = texture(uVelocity, vT).x;\r
  float bottom = texture(uVelocity, vB).x;\r
  fragColor = vec4(0.5 * (right - left - top + bottom), 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const vorticityFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uCurl;\r
uniform float uSwirl;\r
uniform float uDt;\r
void main() {\r
  float left = texture(uCurl, vL).x;\r
  float right = texture(uCurl, vR).x;\r
  float top = texture(uCurl, vT).x;\r
  float bottom = texture(uCurl, vB).x;\r
  float middle = texture(uCurl, vUv).x;\r
  vec2 force = 0.5 * vec2(abs(top) - abs(bottom), abs(right) - abs(left));\r
  force = force / (length(force) + 0.0001) * uSwirl * middle;\r
  force.y = -force.y;\r
  vec2 velocity = texture(uVelocity, vUv).xy + force * uDt;\r
  fragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);\r
}\r
\`;\r
\r
const divergenceFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
void main() {\r
  vec2 middle = texture(uVelocity, vUv).xy;\r
  float left = vL.x < 0.0 ? -middle.x : texture(uVelocity, vL).x;\r
  float right = vR.x > 1.0 ? -middle.x : texture(uVelocity, vR).x;\r
  float top = vT.y > 1.0 ? -middle.y : texture(uVelocity, vT).y;\r
  float bottom = vB.y < 0.0 ? -middle.y : texture(uVelocity, vB).y;\r
  fragColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const pressureFragment = \`\${fluidHead}\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  float divergence = texture(uDivergence, vUv).x;\r
  fragColor = vec4((left + right + top + bottom - divergence) * 0.25, 0.0, 0.0, 1.0);\r
}\r
\`;\r
\r
const projectFragment = \`\${fluidHead}\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
void main() {\r
  float left = texture(uPressure, vL).x;\r
  float right = texture(uPressure, vR).x;\r
  float top = texture(uPressure, vT).x;\r
  float bottom = texture(uPressure, vB).x;\r
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom);\r
  fragColor = vec4(velocity, 0.0, 1.0);\r
}\r
\`;\r
\r
const advectFragment = \`\${fluidHead}\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 uTexel;\r
uniform float uDt;\r
uniform float uFade;\r
void main() {\r
  vec2 from = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;\r
  fragColor = texture(uSource, from) / (1.0 + uFade * uDt);\r
}\r
\`;\r
\r
const scaleFragment = \`\${fluidHead}\r
uniform sampler2D uSource;\r
uniform float uValue;\r
void main() {\r
  fragColor = texture(uSource, vUv) * uValue;\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
uniform vec2 uSize;\r
uniform vec4 uGrid;\r
uniform vec2 uOrigin;\r
uniform vec2 uSlat;\r
uniform float uTime;\r
uniform float uScale;\r
uniform float uDirection;\r
uniform float uChop;\r
uniform float uStretch;\r
uniform float uGlint;\r
uniform float uContrast;\r
uniform float uPerspective;\r
uniform float uFog;\r
uniform float uIntro;\r
uniform sampler2D tVelocity;\r
uniform sampler2D tInk;\r
uniform vec2 uFluidTexel;\r
uniform float uFluid;\r
uniform float uInk;\r
uniform float uLean;\r
out vec4 fragColor;\r
\r
const float TURN[4] = float[4](0.0, -0.95, 0.78, 1.62);\r
const float LENGTH[4] = float[4](2.6, 1.7, 1.12, 0.76);\r
const float HEIGHT[4] = float[4](1.0, 0.75, 0.5, 0.3);\r
const float SHIFT[4] = float[4](0.0, 2.3, 4.1, 1.1);\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  float row = uGrid.y - 1.0 - cell.y;\r
  vec2 center = uOrigin + vec2(cell.x, row) * uGrid.zw + uSlat * 0.5;\r
  float v = clamp(center.y / uSize.y, 0.0, 1.0);\r
\r
  vec2 flow = vec2(0.0);\r
  float ink = 0.0;\r
  if (uFluid > 0.5) {\r
    vec2 fluidUv = clamp(vec2(center.x / uSize.x, 1.0 - center.y / uSize.y), 0.0, 1.0);\r
    flow = texture(tVelocity, fluidUv).xy * uFluidTexel * uSize;\r
    ink = texture(tInk, fluidUv).x;\r
  }\r
\r
  float horizon = mix(8.0, 0.5, uPerspective);\r
  float depth = (1.0 + horizon) / (v + horizon);\r
  vec2 world = vec2((center.x - uSize.x * 0.5) / uSize.y * depth, (depth - 1.0) * horizon * 2.2);\r
  world -= flow * 0.00018 * depth;\r
  world /= max(uScale, 0.05);\r
\r
  float meander = 0.55 * sin(dot(world, vec2(0.23, 0.41)) * 0.9 + uTime * 0.13)\r
    + 0.3 * sin(dot(world, vec2(-0.37, 0.19)) * 1.4 - uTime * 0.09);\r
\r
  float steep = uChop * 0.45;\r
  float height = 0.0;\r
  float total = 0.0;\r
  for (int i = 0; i < 4; i++) {\r
    float angle = uDirection + TURN[i];\r
    vec2 heading = vec2(cos(angle), sin(angle));\r
    float k = 6.2831853 / LENGTH[i];\r
    float omega = sqrt(9.81 * k) * 0.35;\r
    float theta = k * dot(world, heading) - omega * uTime + SHIFT[i] + meander * (0.6 + 0.3 * float(i));\r
    height += HEIGHT[i] * (cos(theta) + steep * cos(2.0 * theta));\r
    total += HEIGHT[i] * (1.0 + steep);\r
  }\r
  float level = clamp(0.5 + 0.5 * height / (total * 0.85), 0.0, 1.0);\r
  float crest = smoothstep(0.6, 1.0, level);\r
  float glint = crest * crest * uGlint;\r
\r
  float haze = mix(1.0, 1.0 - uFog, pow(1.0 - v, 1.4));\r
  float light = (pow(level, uContrast) + glint * 0.8) * haze;\r
  float glow = 1.0 - exp(-max(ink, 0.0) * uInk * 1.6);\r
  light = 1.0 - (1.0 - clamp(light, 0.0, 1.0)) * (1.0 - glow);\r
\r
  float front = uIntro * 1.35;\r
  float reveal = 1.0 - smoothstep(front - 0.35, front, v);\r
  float sweep = exp(-pow((v - front + 0.22) / 0.07, 2.0)) * (1.0 - uIntro);\r
  light = (light + sweep * 0.8) * reveal;\r
  light = max(light, 0.045 * reveal);\r
  float span = mix(1.0 - uStretch, 1.0, level) + glow * 0.3;\r
  span = clamp(span, 0.08, 1.0) * mix(0.1, 1.0, reveal);\r
  float tint = clamp(max(glint * 1.4, glow * 0.9) + sweep, 0.0, 1.0);\r
  float lean = clamp(flow.x / 1400.0, -1.0, 1.0) * uLean * reveal;\r
\r
  fragColor = vec4(clamp(light, 0.0, 1.0), span, tint, 0.5 + 0.5 * lean);\r
}\r
\`;\r
\r
const slatFragment = \`#version 300 es\r
precision highp float;\r
uniform sampler2D tField;\r
uniform vec2 uSize;\r
uniform float uDpr;\r
uniform vec4 uGrid;\r
uniform vec2 uOrigin;\r
uniform vec2 uSlat;\r
uniform float uRound;\r
uniform float uTilt;\r
uniform vec3 uColor;\r
uniform vec3 uGlintColor;\r
uniform vec4 uBackground;\r
out vec4 fragColor;\r
\r
float pill(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
void main() {\r
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;\r
  vec2 local = p - uOrigin;\r
  vec2 cell = floor(local / uGrid.zw);\r
  vec4 background = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  vec4 slat = vec4(0.0);\r
  int reach = uTilt > 0.0 ? 1 : 0;\r
  for (int dx = -1; dx <= 1; dx++) {\r
    if (abs(dx) > reach) continue;\r
    vec2 neighbour = cell + vec2(float(dx), 0.0);\r
    if (neighbour.x < 0.0 || neighbour.y < 0.0 || neighbour.x >= uGrid.x || neighbour.y >= uGrid.y) continue;\r
    vec4 field = texelFetch(tField, ivec2(int(neighbour.x), int(uGrid.y - 1.0 - neighbour.y)), 0);\r
    vec2 offset = local - neighbour * uGrid.zw - uSlat * 0.5;\r
    float angle = (field.a - 0.5) * 2.0 * uTilt;\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    vec2 turned = vec2(c * offset.x + s * offset.y, c * offset.y - s * offset.x);\r
    vec2 halfSize = vec2(uSlat.x * 0.5, uSlat.y * 0.5 * field.g);\r
    float radius = uRound * min(halfSize.x, halfSize.y);\r
    float alpha = clamp(0.5 - pill(turned, halfSize, radius) * uDpr, 0.0, 1.0) * field.r;\r
    if (alpha > slat.a) slat = vec4(mix(uColor, uGlintColor, field.b) * alpha, alpha);\r
  }\r
  fragColor = slat + background * (1.0 - slat.a);\r
}\r
\`;\r
\r
const MicroSlats = ({\r
  preset = 'swell',\r
  color = '#A855F7',\r
  glintColor = '#ffffff',\r
  backgroundColor = '#000000',\r
  slatWidth = 10,\r
  slatHeight = 25,\r
  gap = 3,\r
  roundness = 0.75,\r
  scale,\r
  speed,\r
  direction,\r
  chop,\r
  stretch,\r
  glint,\r
  contrast,\r
  perspective,\r
  fog,\r
  interactive = true,\r
  cursorStrength = 1,\r
  cursorSize = 40,\r
  swirl = 0,\r
  trail = 1.4,\r
  lean = 0,\r
  intro = true,\r
  introDuration = 1.5,\r
  paused = false,\r
  className = '',\r
  style\r
}: MicroSlatsProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
\r
  const base = SWELL_PRESETS[preset] || SWELL_PRESETS.swell;\r
  const pick = <K extends keyof WaveValues>(value: WaveValues[K] | undefined, key: K): WaveValues[K] =>\r
    value === undefined || value === null ? base[key] : value;\r
\r
  const colors = useMemo(\r
    () => ({\r
      color: parseColor(color, [0.66, 0.33, 0.97, 1]),\r
      glintColor: parseColor(glintColor, [1, 1, 1, 1]),\r
      backgroundColor: parseColor(backgroundColor, [0, 0, 0, 1])\r
    }),\r
    [color, glintColor, backgroundColor]\r
  );\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      slatWidth,\r
      slatHeight,\r
      gap,\r
      roundness,\r
      scale: pick(scale, 'scale'),\r
      speed: pick(speed, 'speed'),\r
      direction: pick(direction, 'direction'),\r
      chop: pick(chop, 'chop'),\r
      stretch: pick(stretch, 'stretch'),\r
      glint: pick(glint, 'glint'),\r
      contrast: pick(contrast, 'contrast'),\r
      perspective: pick(perspective, 'perspective'),\r
      fog: pick(fog, 'fog'),\r
      interactive,\r
      cursorStrength,\r
      cursorSize,\r
      swirl,\r
      trail,\r
      lean,\r
      intro,\r
      introDuration,\r
      paused\r
    };\r
    wakeRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, depth: false });\r
    const gl = renderer.gl;\r
    if (!renderer.isWebgl2) {\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      return undefined;\r
    }\r
    gl.clearColor(0, 0, 0, 0);\r
    const canvas = gl.canvas;\r
    canvas.style.display = 'block';\r
    canvas.style.width = '100%';\r
    canvas.style.height = '100%';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    container.appendChild(canvas);\r
\r
    const geometry = new Triangle(gl);\r
    const blank = new Texture(gl);\r
    const floatTargets = !!(\r
      gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')\r
    );\r
\r
    const dispose = (target: RenderTarget) => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
\r
    let fieldTarget = new RenderTarget(gl, {\r
      width: 1,\r
      height: 1,\r
      depth: false,\r
      minFilter: gl.NEAREST,\r
      magFilter: gl.NEAREST\r
    });\r
\r
    const fieldUniforms = {\r
      uSize: { value: [1, 1] },\r
      uGrid: { value: [1, 1, 1, 1] },\r
      uOrigin: { value: [0, 0] },\r
      uSlat: { value: [1, 1] },\r
      uTime: { value: 0 },\r
      uScale: { value: 1 },\r
      uDirection: { value: 0 },\r
      uChop: { value: 0.5 },\r
      uStretch: { value: 0.3 },\r
      uGlint: { value: 1 },\r
      uContrast: { value: 1 },\r
      uPerspective: { value: 0.7 },\r
      uFog: { value: 0.5 },\r
      uIntro: { value: 0 },\r
      tVelocity: { value: blank },\r
      tInk: { value: blank },\r
      uFluidTexel: { value: [1, 1] },\r
      uFluid: { value: 0 },\r
      uInk: { value: 1 },\r
      uLean: { value: 0.5 }\r
    };\r
    const fieldMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: fieldFragment,\r
        uniforms: fieldUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const slatUniforms = {\r
      tField: { value: fieldTarget.texture },\r
      uSize: { value: [1, 1] },\r
      uDpr: { value: 1 },\r
      uGrid: { value: [1, 1, 1, 1] },\r
      uOrigin: { value: [0, 0] },\r
      uSlat: { value: [1, 1] },\r
      uRound: { value: 1 },\r
      uTilt: { value: 0 },\r
      uColor: { value: [1, 1, 1] },\r
      uGlintColor: { value: [1, 1, 1] },\r
      uBackground: { value: [0, 0, 0, 1] }\r
    };\r
    const slatMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: slatFragment,\r
        uniforms: slatUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const fluidTexel = { value: [1, 1] };\r
    const fluidPass = (fragment: string, uniforms: Record<string, { value: unknown }>) =>\r
      new Mesh(gl, {\r
        geometry,\r
        program: new Program(gl, {\r
          vertex: fluidVertex,\r
          fragment,\r
          uniforms: { uTexel: fluidTexel, ...uniforms },\r
          depthTest: false,\r
          depthWrite: false\r
        })\r
      });\r
    const splatPass = fluidPass(splatFragment, {\r
      uTarget: { value: blank },\r
      uAspect: { value: 1 },\r
      uPoint: { value: [0, 0] },\r
      uValue: { value: [0, 0, 0] },\r
      uRadius: { value: 0.01 }\r
    });\r
    const curlPass = fluidPass(curlFragment, { uVelocity: { value: blank } });\r
    const vorticityPass = fluidPass(vorticityFragment, {\r
      uVelocity: { value: blank },\r
      uCurl: { value: blank },\r
      uSwirl: { value: 20 },\r
      uDt: { value: 0.016 }\r
    });\r
    const divergencePass = fluidPass(divergenceFragment, { uVelocity: { value: blank } });\r
    const pressurePass = fluidPass(pressureFragment, { uPressure: { value: blank }, uDivergence: { value: blank } });\r
    const projectPass = fluidPass(projectFragment, { uPressure: { value: blank }, uVelocity: { value: blank } });\r
    const advectPass = fluidPass(advectFragment, {\r
      uVelocity: { value: blank },\r
      uSource: { value: blank },\r
      uDt: { value: 0.016 },\r
      uFade: { value: 1 }\r
    });\r
    const scalePass = fluidPass(scaleFragment, { uSource: { value: blank }, uValue: { value: 0 } });\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
\r
    let width = 1;\r
    let height = 1;\r
    let raf = 0;\r
    let last = performance.now();\r
    let time = 0;\r
    let introClock = 0;\r
    let visible = true;\r
    let alive = true;\r
    let fluid: Fluid | null = null;\r
    let fluidUntil = 0;\r
    let fluidDirty = false;\r
    let splashTurn = 0;\r
    const splats: Splat[] = [];\r
    const pointer = { x: 0, y: 0, tracked: false };\r
\r
    const run = (mesh: Mesh, target?: RenderTarget) => renderer.render({ scene: mesh, target, clear: false });\r
\r
    const floatTarget = (w: number, h: number) =>\r
      new RenderTarget(gl, {\r
        width: w,\r
        height: h,\r
        depth: false,\r
        type: (gl as unknown as WebGL2RenderingContext).HALF_FLOAT,\r
        format: gl.RGBA,\r
        internalFormat: (gl as unknown as WebGL2RenderingContext).RGBA16F,\r
        minFilter: gl.LINEAR,\r
        magFilter: gl.LINEAR\r
      });\r
\r
    const swapPair = (w: number, h: number): Pair => ({\r
      read: floatTarget(w, h),\r
      write: floatTarget(w, h),\r
      swap() {\r
        const next = this.read;\r
        this.read = this.write;\r
        this.write = next;\r
      }\r
    });\r
\r
    const disposeFluid = () => {\r
      if (!fluid) return;\r
      [fluid.velocity, fluid.ink, fluid.pressure].forEach(pair => {\r
        dispose(pair.read);\r
        dispose(pair.write);\r
      });\r
      dispose(fluid.divergence);\r
      dispose(fluid.curl);\r
      fluid = null;\r
    };\r
\r
    const buildFluid = () => {\r
      if (!floatTargets) return;\r
      const aspect = width / height;\r
      const w = Math.max(8, Math.round(aspect >= 1 ? FLUID_SIZE * aspect : FLUID_SIZE));\r
      const h = Math.max(8, Math.round(aspect >= 1 ? FLUID_SIZE : FLUID_SIZE / aspect));\r
      if (fluid && fluid.width === w && fluid.height === h) return;\r
      disposeFluid();\r
      fluid = {\r
        width: w,\r
        height: h,\r
        velocity: swapPair(w, h),\r
        ink: swapPair(w, h),\r
        pressure: swapPair(w, h),\r
        divergence: floatTarget(w, h),\r
        curl: floatTarget(w, h)\r
      };\r
      fluidTexel.value = [1 / w, 1 / h];\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      buildFluid();\r
      start();\r
    };\r
\r
    const layout = (s: Settings): GridLayout => {\r
      const slatW = clamp(s.slatWidth, 1, 64);\r
      const slatH = clamp(s.slatHeight, 2, 240);\r
      const gapSize = clamp(s.gap, 0, 64);\r
      const pitchX = slatW + gapSize;\r
      const pitchY = slatH + gapSize;\r
      const cols = Math.min(2048, Math.ceil((width + gapSize) / pitchX) + 1);\r
      const rows = Math.min(2048, Math.ceil((height + gapSize) / pitchY) + 1);\r
      const originX = (width - (cols * pitchX - gapSize)) / 2;\r
      const originY = (height - (rows * pitchY - gapSize)) / 2;\r
      if (fieldTarget.width !== cols || fieldTarget.height !== rows) {\r
        dispose(fieldTarget);\r
        fieldTarget = new RenderTarget(gl, {\r
          width: cols,\r
          height: rows,\r
          depth: false,\r
          minFilter: gl.NEAREST,\r
          magFilter: gl.NEAREST\r
        });\r
        slatUniforms.tField.value = fieldTarget.texture;\r
      }\r
      const tilt = Math.min(0.42, Math.asin(clamp((pitchX * 1.5 - slatW * 0.5) / (slatH * 0.5), 0, 1)));\r
      return { slatW, slatH, tilt, grid: [cols, rows, pitchX, pitchY], origin: [originX, originY] };\r
    };\r
\r
    const splat = (pair: Pair, point: number[], value: number[], radius: number) => {\r
      const u = splatPass.program.uniforms;\r
      u.uTarget.value = pair.read.texture;\r
      u.uAspect.value = width / height;\r
      u.uPoint.value = point;\r
      u.uValue.value = value;\r
      u.uRadius.value = radius;\r
      run(splatPass, pair.write);\r
      pair.swap();\r
    };\r
\r
    const stepFluid = (f: Fluid, dt: number, s: Settings) => {\r
      if (s.swirl > 0) {\r
        curlPass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
        run(curlPass, f.curl);\r
\r
        const vorticity = vorticityPass.program.uniforms;\r
        vorticity.uVelocity.value = f.velocity.read.texture;\r
        vorticity.uCurl.value = f.curl.texture;\r
        vorticity.uSwirl.value = clamp(s.swirl, 0, 2) * 40;\r
        vorticity.uDt.value = dt;\r
        run(vorticityPass, f.velocity.write);\r
        f.velocity.swap();\r
      }\r
\r
      divergencePass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
      run(divergencePass, f.divergence);\r
\r
      scalePass.program.uniforms.uSource.value = f.pressure.read.texture;\r
      scalePass.program.uniforms.uValue.value = 0.8;\r
      run(scalePass, f.pressure.write);\r
      f.pressure.swap();\r
\r
      pressurePass.program.uniforms.uDivergence.value = f.divergence.texture;\r
      for (let i = 0; i < PRESSURE_STEPS; i++) {\r
        pressurePass.program.uniforms.uPressure.value = f.pressure.read.texture;\r
        run(pressurePass, f.pressure.write);\r
        f.pressure.swap();\r
      }\r
\r
      projectPass.program.uniforms.uPressure.value = f.pressure.read.texture;\r
      projectPass.program.uniforms.uVelocity.value = f.velocity.read.texture;\r
      run(projectPass, f.velocity.write);\r
      f.velocity.swap();\r
\r
      const fade = 1 / clamp(s.trail, 0.1, 10);\r
      const advect = advectPass.program.uniforms;\r
      advect.uDt.value = dt;\r
      advect.uVelocity.value = f.velocity.read.texture;\r
      advect.uSource.value = f.velocity.read.texture;\r
      advect.uFade.value = fade * 1.4;\r
      run(advectPass, f.velocity.write);\r
      f.velocity.swap();\r
\r
      advect.uVelocity.value = f.velocity.read.texture;\r
      advect.uSource.value = f.ink.read.texture;\r
      advect.uFade.value = fade;\r
      run(advectPass, f.ink.write);\r
      f.ink.swap();\r
    };\r
\r
    const clearFluid = (f: Fluid) => {\r
      scalePass.program.uniforms.uValue.value = 0;\r
      [f.velocity, f.ink, f.pressure].forEach(pair => {\r
        scalePass.program.uniforms.uSource.value = pair.read.texture;\r
        run(scalePass, pair.write);\r
        pair.swap();\r
      });\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      if (!s.paused && !reducedMotion) time += dt * s.speed;\r
      introClock = s.intro && !reducedMotion ? introClock + dt / Math.max(0.2, s.introDuration) : 1;\r
      const introLinear = Math.min(introClock, 1);\r
      const introEase =\r
        introLinear < 0.5 ? 4 * introLinear * introLinear * introLinear : 1 - Math.pow(-2 * introLinear + 2, 3) / 2;\r
\r
      if (fluid && splats.length) {\r
        const radius = Math.pow(clamp(s.cursorSize, 4, 600) / height, 2) * 0.35;\r
        const aspect = width / height;\r
        for (const [u, v, du, dv, turn] of splats) {\r
          if (turn === null) {\r
            splat(fluid.velocity, [u, v], [du * SPLAT_FORCE, dv * SPLAT_FORCE, 0], radius);\r
            splat(fluid.ink, [u, v], [0.13, 0, 0], radius);\r
            continue;\r
          }\r
          const jet = radius * 0.55;\r
          const reach = Math.sqrt(jet * 0.5) * 1.9;\r
          const push = SPLAT_FORCE * 0.08;\r
          for (let i = 0; i < SPLASH_JETS; i++) {\r
            const angle = turn + (i / SPLASH_JETS) * Math.PI * 2;\r
            const dx = Math.cos(angle);\r
            const dy = Math.sin(angle);\r
            const point = [u + (dx * reach) / aspect, v + dy * reach];\r
            const spin = [(dx - dy) * Math.SQRT1_2 * push, (dy + dx) * Math.SQRT1_2 * push, 0];\r
            splat(fluid.velocity, point, spin, jet);\r
            splat(fluid.ink, point, [0.75, 0, 0], jet);\r
          }\r
          splat(fluid.ink, [u, v], [0.45, 0, 0], radius);\r
        }\r
        splats.length = 0;\r
        fluidDirty = true;\r
      }\r
      const fluidActive = fluid !== null && now < fluidUntil;\r
      if (fluid) {\r
        if (fluidActive) stepFluid(fluid, Math.min(Math.max(dt, 1 / 240), 1 / 30), s);\r
        else if (fluidDirty) {\r
          clearFluid(fluid);\r
          fluidDirty = false;\r
        }\r
      }\r
\r
      const grid = layout(s);\r
\r
      fieldUniforms.uSize.value = [width, height];\r
      fieldUniforms.uGrid.value = grid.grid;\r
      fieldUniforms.uOrigin.value = grid.origin;\r
      fieldUniforms.uSlat.value = [grid.slatW, grid.slatH];\r
      fieldUniforms.uTime.value = time;\r
      fieldUniforms.uScale.value = s.scale;\r
      fieldUniforms.uDirection.value = (s.direction * Math.PI) / 180;\r
      fieldUniforms.uChop.value = clamp(s.chop, 0, 1.5);\r
      fieldUniforms.uStretch.value = clamp(s.stretch, 0, 0.95);\r
      fieldUniforms.uGlint.value = Math.max(0, s.glint);\r
      fieldUniforms.uContrast.value = clamp(s.contrast, 0.2, 4);\r
      fieldUniforms.uPerspective.value = clamp(s.perspective, 0, 1);\r
      fieldUniforms.uFog.value = clamp(s.fog, 0, 1);\r
      fieldUniforms.uIntro.value = introEase;\r
      fieldUniforms.uFluid.value = fluidActive ? 1 : 0;\r
      fieldUniforms.tVelocity.value = fluid ? fluid.velocity.read.texture : blank;\r
      fieldUniforms.tInk.value = fluid ? fluid.ink.read.texture : blank;\r
      fieldUniforms.uFluidTexel.value = fluidTexel.value;\r
      fieldUniforms.uInk.value = clamp(s.cursorStrength, 0, 3);\r
      fieldUniforms.uLean.value = clamp(s.lean, 0, 1);\r
      renderer.render({ scene: fieldMesh, target: fieldTarget });\r
\r
      slatUniforms.uSize.value = [width, height];\r
      slatUniforms.uDpr.value = renderer.dpr;\r
      slatUniforms.uGrid.value = grid.grid;\r
      slatUniforms.uOrigin.value = grid.origin;\r
      slatUniforms.uSlat.value = [grid.slatW, grid.slatH];\r
      slatUniforms.uRound.value = clamp(s.roundness, 0, 1);\r
      slatUniforms.uTilt.value = fluidActive && s.lean > 0 ? grid.tilt : 0;\r
      slatUniforms.uColor.value = s.color.slice(0, 3);\r
      slatUniforms.uGlintColor.value = s.glintColor.slice(0, 3);\r
      slatUniforms.uBackground.value = s.backgroundColor;\r
      renderer.render({ scene: slatMesh });\r
\r
      const moving = (!s.paused && !reducedMotion && s.speed !== 0) || introClock < 1;\r
      if (visible && (moving || fluidActive || fluidDirty)) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const start = () => {\r
      if (raf || !visible || !alive) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const locate = (e: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = e.clientX - rect.left;\r
      const y = e.clientY - rect.top;\r
      const w = Math.max(1, rect.width);\r
      const h = Math.max(1, rect.height);\r
      return { x, y, u: x / w, v: 1 - y / h, h, inside: x >= 0 && y >= 0 && x <= w && y <= h };\r
    };\r
\r
    const queue = (u: number, v: number, du: number, dv: number, turn: number | null) => {\r
      if (splats.length > 32) splats.shift();\r
      splats.push([u, v, du, dv, turn]);\r
      const s = settingsRef.current;\r
      fluidUntil = performance.now() + Math.max(1.5, (s ? s.trail : 1.4) * 5) * 1000;\r
      start();\r
    };\r
\r
    const onPointerMove = (e: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!fluid || !s || !s.interactive || reducedMotion || !spot.inside) {\r
        pointer.tracked = false;\r
        return;\r
      }\r
      if (pointer.tracked && (spot.x !== pointer.x || spot.y !== pointer.y)) {\r
        queue(spot.u, spot.v, (spot.x - pointer.x) / spot.h, (pointer.y - spot.y) / spot.h, null);\r
      }\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.tracked = true;\r
    };\r
\r
    const onPointerDown = (e: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const spot = locate(e);\r
      if (!fluid || !s || !s.interactive || reducedMotion || !spot.inside) return;\r
      splashTurn += 2.39996;\r
      queue(spot.u, spot.v, 0, 0, splashTurn);\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.tracked = false;\r
    };\r
\r
    const onPointerOut = (e: PointerEvent) => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('blur', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersectionObserver = new IntersectionObserver(([entry]) => {\r
      visible = entry.isIntersecting;\r
      start();\r
    });\r
    intersectionObserver.observe(container);\r
\r
    wakeRef.current = start;\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      visible = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      intersectionObserver.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerout', onPointerOut);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      disposeFluid();\r
      dispose(fieldTarget);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return (\r
    <div ref={containerRef} className={\`relative h-full w-full overflow-hidden \${className}\`.trim()} style={style} />\r
  );\r
};\r
\r
export default MicroSlats;\r
`,o={dependencies:"ogl",usage:`import MicroSlats from './MicroSlats';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <MicroSlats
    preset="swell"
    color="#A855F7"
    glintColor="#ffffff"
    backgroundColor="#000000"
    slatWidth={10}
    slatHeight={25}
    gap={3}
    roundness={0.75}
    interactive
    cursorStrength={1}
    cursorSize={40}
    swirl={0}
    trail={1.4}
    lean={0}
    intro
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:i};export{o as microSlats};
