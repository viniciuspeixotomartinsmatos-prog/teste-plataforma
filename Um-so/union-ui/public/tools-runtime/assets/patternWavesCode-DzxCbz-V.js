const r=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import { Renderer, Program, Mesh, Triangle, RenderTarget, Texture } from 'ogl';\r
\r
import './PatternWaves.css';\r
\r
const SURFACE_PRESETS = {\r
  silk: {\r
    pattern: 'dot',\r
    wave: 'silk',\r
    spacing: 9,\r
    markSize: 0.95,\r
    depth: 0.95,\r
    light: 0,\r
    shine: 0.8,\r
    contrast: 1.2,\r
    speed: 0.35,\r
    scale: 1,\r
    direction: 20\r
  },\r
  ocean: {\r
    pattern: 'dot',\r
    wave: 'swell',\r
    spacing: 10,\r
    markSize: 0.9,\r
    depth: 0.42,\r
    light: 0,\r
    shine: 1,\r
    contrast: 1.2,\r
    speed: 0.5,\r
    scale: 1,\r
    direction: 100\r
  },\r
  pond: {\r
    pattern: 'dot',\r
    wave: 'ripple',\r
    spacing: 10,\r
    markSize: 0.9,\r
    depth: 0.55,\r
    light: 0,\r
    shine: 1.2,\r
    contrast: 1.2,\r
    speed: 0.5,\r
    scale: 1,\r
    direction: 35\r
  },\r
  lines: {\r
    pattern: 'line',\r
    wave: 'silk',\r
    spacing: 12,\r
    markSize: 0.42,\r
    depth: 0.9,\r
    light: 0,\r
    shine: 0.6,\r
    contrast: 1.2,\r
    speed: 0.3,\r
    scale: 1,\r
    direction: 20\r
  },\r
  terminal: {\r
    pattern: 'glyph',\r
    wave: 'ripple',\r
    spacing: 13,\r
    markSize: 0.95,\r
    depth: 0.75,\r
    light: 0,\r
    shine: 0.9,\r
    contrast: 1.4,\r
    speed: 0.3,\r
    scale: 1.1,\r
    direction: 200\r
  },\r
  mesh: {\r
    pattern: 'plus',\r
    wave: 'silk',\r
    spacing: 14,\r
    markSize: 0.8,\r
    depth: 0.95,\r
    light: 0,\r
    shine: 1,\r
    contrast: 1.45,\r
    speed: 0.4,\r
    scale: 1.1,\r
    direction: 325\r
  }\r
};\r
\r
const PATTERNS = { dot: 0, square: 1, plus: 2, line: 3, glyph: 4 };\r
const WAVES = { silk: 0, swell: 1, ripple: 2 };\r
const FADES = { none: 0, edges: 1, center: 2, bottom: 3, top: 4 };\r
const DEFAULT_CHARACTERS = '.:-=+*#%@';\r
const GLYPH_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const ATLAS_TILE = 128;\r
const WAVE_UNIT = 520;\r
const RIPPLE_CELL = 8;\r
const RIPPLE_RATE = 60;\r
const PIXEL_BUDGET = 4.5e6;\r
const INTRO_SECONDS = 2;\r
\r
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);\r
\r
const luminance = rgba => 0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2];\r
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
const buildAtlas = characters => {\r
  const glyphs = Array.from(characters && characters.length ? characters : DEFAULT_CHARACTERS);\r
  const columns = Math.ceil(Math.sqrt(glyphs.length));\r
  const lines = Math.ceil(glyphs.length / columns);\r
  const canvas = document.createElement('canvas');\r
  canvas.width = columns * ATLAS_TILE;\r
  canvas.height = lines * ATLAS_TILE;\r
  const ctx = canvas.getContext('2d');\r
  if (!ctx) return null;\r
  ctx.fillStyle = '#ffffff';\r
  ctx.textAlign = 'center';\r
  ctx.textBaseline = 'middle';\r
  ctx.font = \`500 \${Math.round(ATLAS_TILE * 0.86)}px \${GLYPH_FONT}\`;\r
  glyphs.forEach((glyph, index) => {\r
    const x = (index % columns) * ATLAS_TILE + ATLAS_TILE / 2;\r
    const y = Math.floor(index / columns) * ATLAS_TILE + ATLAS_TILE / 2;\r
    ctx.fillText(glyph, x, y);\r
  });\r
  return { canvas, columns, lines, count: glyphs.length };\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uSize;\r
uniform float uDpr;\r
uniform vec2 uOrigin;\r
uniform vec2 uPitch;\r
uniform int uWave;\r
uniform float uTime;\r
uniform float uUnit;\r
uniform vec2 uHeading;\r
uniform float uAmp;\r
uniform float uDepth;\r
uniform vec3 uLight;\r
uniform float uShine;\r
uniform float uContrast;\r
uniform float uInk;\r
uniform float uOpacity;\r
uniform int uFade;\r
uniform float uFadeSize;\r
uniform float uAppear;\r
uniform sampler2D tRipple;\r
uniform float uRipple;\r
out vec4 fragColor;\r
\r
const float FOLDS = 5.5;\r
\r
uvec3 scramble(uvec3 v) {\r
  v = v * 1664525u + 1013904223u;\r
  v.x += v.y * v.z;\r
  v.y += v.z * v.x;\r
  v.z += v.x * v.y;\r
  v ^= v >> 16u;\r
  v.x += v.y * v.z;\r
  v.y += v.z * v.x;\r
  v.z += v.x * v.y;\r
  return v;\r
}\r
\r
vec3 lattice(vec3 corner) {\r
  uvec3 h = scramble(uvec3(ivec3(corner) + 4096));\r
  return vec3(h & 65535u) / 32767.5 - 1.0;\r
}\r
\r
float gradientNoise(vec3 p) {\r
  vec3 i = floor(p);\r
  vec3 f = p - i;\r
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float n000 = dot(lattice(i), f);\r
  float n100 = dot(lattice(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));\r
  float n010 = dot(lattice(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));\r
  float n110 = dot(lattice(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));\r
  float n001 = dot(lattice(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));\r
  float n101 = dot(lattice(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));\r
  float n011 = dot(lattice(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));\r
  float n111 = dot(lattice(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));\r
  return mix(\r
    mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),\r
    mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),\r
    u.z\r
  );\r
}\r
\r
vec2 turn(vec2 v, float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);\r
}\r
\r
float surface(vec2 p, float t) {\r
  if (uWave == 0) {\r
    vec2 side = vec2(-uHeading.y, uHeading.x);\r
    float u = dot(p, uHeading);\r
    float v = dot(p, side);\r
    float bend = gradientNoise(vec3(v * 0.85, u * 0.3, t * 0.05)) * 1.7 + 0.4 * sin(v * 1.6 + t * 0.2);\r
    float phase = u * FOLDS + bend - t * 0.45;\r
    float swell = 0.6 + 0.4 * gradientNoise(vec3(u * 0.55 + 3.0, v * 0.45, t * 0.04));\r
    float fold = sin(phase) + 0.32 * sin(2.0 * phase + 1.3);\r
    float ripple = 0.16 * sin(u * FOLDS * 2.5 + bend * 1.9 - t * 0.9 + 2.1);\r
    return (fold + ripple) * swell;\r
  }\r
  if (uWave == 1) {\r
    float bend = gradientNoise(vec3(p * 0.6, t * 0.05)) * 0.6;\r
    float phase = dot(p, uHeading) * 15.0 + bend * 2.2 - t * 1.4;\r
    float swell = sin(phase) + 0.3 * sin(2.0 * phase - 0.8);\r
    float roll = 0.75 + 0.25 * gradientNoise(vec3(p * 0.9 + 11.0, t * 0.05));\r
    return 0.8 * swell * roll;\r
  }\r
  float r = length(p + uHeading * 1.2);\r
  float bend = gradientNoise(vec3(p * 1.2, t * 0.05)) * 0.1;\r
  return sin((r + bend) * 9.0 - t * 1.8) * (0.45 + 0.55 * exp(-(r - 0.6) * 0.8));\r
}\r
\r
float heightAt(vec2 css) {\r
  float h = surface((css - 0.5 * uSize) / uUnit, uTime) * uAmp;\r
  if (uRipple > 0.0) h += texture(tRipple, css / uSize).r * uRipple;\r
  return h;\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  vec2 center = uOrigin + (cell + 0.5) * uPitch;\r
  vec2 css = center / uDpr;\r
  vec2 uv = css / uSize;\r
  float e = max(uPitch.y / uDpr, 4.0);\r
  float h = heightAt(css);\r
  float hx = (heightAt(css + vec2(e, 0.0)) - heightAt(css - vec2(e, 0.0))) / (2.0 * e);\r
  float hy = (heightAt(css + vec2(0.0, e)) - heightAt(css - vec2(0.0, e))) / (2.0 * e);\r
  vec2 grad = vec2(hx, hy) * uUnit * uDepth * 0.4;\r
  vec3 n = normalize(vec3(-grad, 1.0));\r
\r
  float diffuse = clamp(dot(n, uLight), 0.0, 1.0);\r
  vec3 halfway = normalize(uLight + vec3(0.0, 0.0, 1.0));\r
  float spec = pow(clamp(dot(n, halfway), 0.0, 1.0), 160.0) * uShine * 1.15;\r
  float hollow = 0.7 + 0.3 * clamp(h * 0.5 + 0.5, 0.0, 1.0);\r
  float tone = clamp(diffuse * hollow * 0.78 + spec, 0.0, 1.0);\r
  tone = clamp((tone - 0.42) * uContrast + 0.42, 0.0, 1.0);\r
\r
  float level = uInk > 0.5 ? pow(clamp(1.0 - tone / 0.46, 0.0, 1.0), 2.4) * 0.72 : pow(tone, 2.2);\r
  float emphasis = uInk > 0.5 ? smoothstep(0.55, 0.95, level) : clamp(spec * 1.6, 0.0, 1.0);\r
\r
  float fade = 1.0;\r
  vec2 c = uv * 2.0 - 1.0;\r
  if (uFade == 1) {\r
    fade = 1.0 - smoothstep(1.0 - uFadeSize, 1.18, length(c));\r
  } else if (uFade == 2) {\r
    fade = mix(0.05, 1.0, smoothstep(0.08, 0.08 + uFadeSize, length(c * vec2(1.0, 1.35))));\r
  } else if (uFade == 3) {\r
    fade = smoothstep(0.0, uFadeSize, uv.y);\r
  } else if (uFade == 4) {\r
    fade = smoothstep(0.0, uFadeSize, 1.0 - uv.y);\r
  }\r
\r
  float reach = length(css - 0.5 * uSize) / max(0.5 * length(uSize), 1.0);\r
  float appear = smoothstep(reach - 0.05, reach + 0.3, uAppear * 1.35);\r
\r
  float alpha = uOpacity * fade * appear * (0.22 + 0.78 * level);\r
  float lift = clamp(h * uDepth * 0.42, -0.48, 0.48);\r
  fragColor = vec4(level, alpha, emphasis, lift + 0.5);\r
}\r
\`;\r
\r
const rippleFragment = \`#version 300 es\r
precision highp float;\r
uniform sampler2D tState;\r
uniform vec2 uTexel;\r
uniform vec2 uSize;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uImpulse;\r
uniform float uDamping;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy * uTexel;\r
  vec2 state = texture(tState, uv).rg;\r
  float left = texture(tState, uv - vec2(uTexel.x, 0.0)).r;\r
  float right = texture(tState, uv + vec2(uTexel.x, 0.0)).r;\r
  float below = texture(tState, uv - vec2(0.0, uTexel.y)).r;\r
  float above = texture(tState, uv + vec2(0.0, uTexel.y)).r;\r
  float next = ((left + right + below + above) * 0.5 - state.g) * uDamping;\r
  vec2 p = uv * uSize;\r
  vec2 segment = uTo - uFrom;\r
  float along = clamp(dot(p - uFrom, segment) / max(dot(segment, segment), 1e-4), 0.0, 1.0);\r
  float d = length(p - uFrom - segment * along) / uRadius;\r
  next -= uImpulse * exp(-d * d * 2.0);\r
  fragColor = vec4(next, state.r, 0.0, 1.0);\r
}\r
\`;\r
\r
const markFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D tField;\r
uniform sampler2D tAtlas;\r
uniform vec2 uOrigin;\r
uniform vec2 uPitch;\r
uniform vec2 uGrid;\r
uniform int uPattern;\r
uniform float uMarkSize;\r
uniform float uStroke;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec4 uBackground;\r
uniform vec3 uAtlas;\r
out vec4 fragColor;\r
\r
float box(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
float coverage(vec2 local, float level) {\r
  float span = uPitch.y * uMarkSize;\r
  float area = max(sqrt(level), 0.14);\r
  if (uPattern == 0) {\r
    return clamp(0.5 - (length(local) - 0.5 * span * area), 0.0, 1.0);\r
  }\r
  if (uPattern == 1) {\r
    float extent = 0.5 * span * area;\r
    return clamp(0.5 - box(local, vec2(extent), extent * 0.3), 0.0, 1.0);\r
  }\r
  if (uPattern == 2) {\r
    float arm = 0.5 * span * mix(0.3, 1.0, level);\r
    float width = 0.5 * uStroke;\r
    return clamp(0.5 - min(box(local, vec2(arm, width), width), box(local, vec2(width, arm), width)), 0.0, 1.0);\r
  }\r
  if (uAtlas.z < 1.0) return 0.0;\r
  vec2 g = local / span + 0.5;\r
  if (g.x < 0.0 || g.y < 0.0 || g.x > 1.0 || g.y > 1.0) return 0.0;\r
  float index = min(floor(level * uAtlas.z), uAtlas.z - 1.0);\r
  vec2 tile = vec2(mod(index, uAtlas.x), floor(index / uAtlas.x));\r
  vec2 atlasUv = (tile + vec2(g.x, 1.0 - g.y)) / uAtlas.xy;\r
  vec2 texel = 1.0 / (span * uAtlas.xy);\r
  return textureGrad(tAtlas, atlasUv, vec2(texel.x, 0.0), vec2(0.0, texel.y)).a;\r
}\r
\r
vec4 lineInk(vec2 rel) {\r
  float fx = rel.x / uPitch.x - 0.5;\r
  float c0 = clamp(floor(fx), 0.0, uGrid.x - 1.0);\r
  float c1 = min(c0 + 1.0, uGrid.x - 1.0);\r
  float t = clamp(fx - c0, 0.0, 1.0);\r
  float row = floor(rel.y / uPitch.y);\r
  vec4 ink = vec4(0.0);\r
  for (int k = -1; k <= 1; k++) {\r
    float cy = row + float(k);\r
    if (cy < 0.0 || cy >= uGrid.y) continue;\r
    vec4 a = texelFetch(tField, ivec2(int(c0), int(cy)), 0);\r
    vec4 b = texelFetch(tField, ivec2(int(c1), int(cy)), 0);\r
    vec4 f = mix(a, b, t);\r
    if (f.g < 0.002) continue;\r
    float y = (cy + 0.5 + f.a - 0.5) * uPitch.y;\r
    float slope = (b.a - a.a) * uPitch.y / uPitch.x;\r
    float thickness = max(uStroke, uPitch.y * uMarkSize * f.r);\r
    float d = abs(rel.y - y) / sqrt(1.0 + slope * slope) - 0.5 * thickness;\r
    float alpha = clamp(0.5 - d, 0.0, 1.0) * f.g;\r
    if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);\r
  }\r
  return ink;\r
}\r
\r
void main() {\r
  vec2 rel = gl_FragCoord.xy - uOrigin;\r
  vec4 background = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  vec4 ink = vec4(0.0);\r
  if (uPattern == 3) {\r
    ink = lineInk(rel);\r
  } else {\r
    float cx = floor(rel.x / uPitch.x);\r
    float row = floor(rel.y / uPitch.y);\r
    if (cx >= 0.0 && cx < uGrid.x) {\r
      for (int k = -1; k <= 1; k++) {\r
        float cy = row + float(k);\r
        if (cy < 0.0 || cy >= uGrid.y) continue;\r
        vec4 f = texelFetch(tField, ivec2(int(cx), int(cy)), 0);\r
        if (f.g < 0.002) continue;\r
        vec2 center = (vec2(cx, cy) + 0.5) * uPitch + vec2(0.0, (f.a - 0.5) * uPitch.y);\r
        float alpha = coverage(rel - center, f.r) * f.g;\r
        if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);\r
      }\r
    }\r
  }\r
  fragColor = ink + background * (1.0 - ink.a);\r
}\r
\`;\r
\r
const PatternWaves = ({\r
  preset = 'silk',\r
  pattern,\r
  wave,\r
  spacing,\r
  markSize,\r
  depth,\r
  light,\r
  shine,\r
  contrast,\r
  speed,\r
  scale,\r
  direction,\r
  color = '#ffffff',\r
  backgroundColor = '#000000',\r
  opacity = 1,\r
  fade = 'edges',\r
  fadeSize = 0.5,\r
  characters = DEFAULT_CHARACTERS,\r
  interactive = true,\r
  cursorSize = 50,\r
  cursorStrength = 0.6,\r
  intro = true,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const wakeRef = useRef(null);\r
\r
  const base = SURFACE_PRESETS[preset] || SURFACE_PRESETS.silk;\r
  const pick = (value, key) => (value === undefined || value === null ? base[key] : value);\r
\r
  const colors = useMemo(\r
    () => ({\r
      color: parseColor(color, [1, 1, 1, 1]),\r
      background: parseColor(backgroundColor, [0, 0, 0, 1])\r
    }),\r
    [color, backgroundColor]\r
  );\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      pattern: pick(pattern, 'pattern'),\r
      wave: pick(wave, 'wave'),\r
      spacing: pick(spacing, 'spacing'),\r
      markSize: pick(markSize, 'markSize'),\r
      depth: pick(depth, 'depth'),\r
      light: pick(light, 'light'),\r
      shine: pick(shine, 'shine'),\r
      contrast: pick(contrast, 'contrast'),\r
      speed: pick(speed, 'speed'),\r
      scale: pick(scale, 'scale'),\r
      direction: pick(direction, 'direction'),\r
      opacity,\r
      fade,\r
      fadeSize,\r
      characters,\r
      interactive,\r
      cursorSize,\r
      cursorStrength,\r
      intro,\r
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
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
\r
    const dispose = target => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
\r
    const fieldTargetFor = (w, h) =>\r
      new RenderTarget(gl, { width: w, height: h, depth: false, minFilter: gl.NEAREST, magFilter: gl.NEAREST });\r
\r
    const rippleTargetFor = (w, h) =>\r
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
    let fieldTarget = fieldTargetFor(1, 1);\r
    let ripple = null;\r
\r
    const atlasTexture = new Texture(gl, {\r
      generateMipmaps: true,\r
      minFilter: gl.LINEAR_MIPMAP_LINEAR,\r
      magFilter: gl.LINEAR,\r
      flipY: false\r
    });\r
\r
    const fieldUniforms = {\r
      uSize: { value: [1, 1] },\r
      uDpr: { value: 1 },\r
      uOrigin: { value: [0, 0] },\r
      uPitch: { value: [1, 1] },\r
      uWave: { value: 0 },\r
      uTime: { value: 0 },\r
      uUnit: { value: WAVE_UNIT },\r
      uHeading: { value: [1, 0] },\r
      uAmp: { value: 0 },\r
      uDepth: { value: 0.5 },\r
      uLight: { value: [0, 0, 1] },\r
      uShine: { value: 0.8 },\r
      uContrast: { value: 1 },\r
      uInk: { value: 0 },\r
      uOpacity: { value: 1 },\r
      uFade: { value: 0 },\r
      uFadeSize: { value: 0.5 },\r
      uAppear: { value: 0 },\r
      tRipple: { value: blank },\r
      uRipple: { value: 0 }\r
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
    const rippleUniforms = {\r
      tState: { value: blank },\r
      uTexel: { value: [1, 1] },\r
      uSize: { value: [1, 1] },\r
      uFrom: { value: [0, 0] },\r
      uTo: { value: [0, 0] },\r
      uRadius: { value: 40 },\r
      uImpulse: { value: 0 },\r
      uDamping: { value: 0.975 }\r
    };\r
    const rippleMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: rippleFragment,\r
        uniforms: rippleUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const markUniforms = {\r
      tField: { value: fieldTarget.texture },\r
      tAtlas: { value: atlasTexture },\r
      uOrigin: { value: [0, 0] },\r
      uPitch: { value: [1, 1] },\r
      uGrid: { value: [1, 1] },\r
      uPattern: { value: 0 },\r
      uMarkSize: { value: 0.9 },\r
      uStroke: { value: 2 },\r
      uColor: { value: [1, 1, 1] },\r
      uAccent: { value: [1, 1, 1] },\r
      uBackground: { value: [0, 0, 0, 1] },\r
      uAtlas: { value: [1, 1, 0] }\r
    };\r
    const markMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: markFragment,\r
        uniforms: markUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
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
    let dirty = true;\r
    let rippleUntil = 0;\r
    let rippleLive = false;\r
    let rippleClock = 0;\r
    let atlasKey = '';\r
    const pointer = { x: 0, y: 0, inside: false, placed: false, lastX: 0, lastY: 0, burst: 0 };\r
\r
    const buildRipple = () => {\r
      if (!floatTargets) return;\r
      const w = clamp(Math.ceil(width / RIPPLE_CELL), 4, 512);\r
      const h = clamp(Math.ceil(height / RIPPLE_CELL), 4, 512);\r
      if (ripple && ripple.width === w && ripple.height === h) return;\r
      if (ripple) {\r
        dispose(ripple.read);\r
        dispose(ripple.write);\r
      }\r
      ripple = { width: w, height: h, read: rippleTargetFor(w, h), write: rippleTargetFor(w, h) };\r
      rippleLive = false;\r
    };\r
\r
    const clearRipple = () => {\r
      if (!ripple) return;\r
      [ripple.read, ripple.write].forEach(target => {\r
        renderer.bindFramebuffer(target);\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
      });\r
      renderer.bindFramebuffer();\r
    };\r
\r
    const refreshAtlas = s => {\r
      if (s.characters === atlasKey) return;\r
      atlasKey = s.characters;\r
      const built = buildAtlas(s.characters);\r
      if (!built) return;\r
      atlasTexture.image = built.canvas;\r
      markUniforms.uAtlas.value = [built.columns, built.lines, built.count];\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      buildRipple();\r
      dirty = true;\r
      start();\r
    };\r
\r
    const stepRipple = (field, s, dt) => {\r
      rippleClock = Math.min(rippleClock + dt * RIPPLE_RATE, 4);\r
      const strength = clamp(s.cursorStrength, 0, 1);\r
      const moved = Math.hypot(pointer.x - pointer.lastX, pointer.y - pointer.lastY);\r
      let impulse = (pointer.inside ? Math.min(moved / 14, 1) * 0.35 * strength : 0) + pointer.burst * strength;\r
      pointer.burst = 0;\r
      rippleUniforms.uTexel.value = [1 / field.width, 1 / field.height];\r
      rippleUniforms.uSize.value = [width, height];\r
      rippleUniforms.uFrom.value = [pointer.lastX, height - pointer.lastY];\r
      rippleUniforms.uTo.value = [pointer.x, height - pointer.y];\r
      rippleUniforms.uRadius.value = clamp(s.cursorSize, 8, 400);\r
      while (rippleClock >= 1) {\r
        rippleClock -= 1;\r
        rippleUniforms.tState.value = field.read.texture;\r
        rippleUniforms.uImpulse.value = impulse;\r
        renderer.render({ scene: rippleMesh, target: field.write, clear: false });\r
        const next = field.read;\r
        field.read = field.write;\r
        field.write = next;\r
        impulse = 0;\r
      }\r
      pointer.lastX = pointer.x;\r
      pointer.lastY = pointer.y;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      const moving = !s.paused && !reducedMotion && s.speed !== 0;\r
      if (moving) time += dt * s.speed;\r
      introClock = s.intro && !reducedMotion ? Math.min(1, introClock + dt / INTRO_SECONDS) : 1;\r
      const appear = 1 - Math.pow(1 - clamp(introClock / 0.75, 0, 1), 3);\r
      const rise = clamp((introClock - 0.1) / 0.9, 0, 1);\r
      const amp = rise * rise * (3 - 2 * rise);\r
\r
      const rippling = s.interactive && !reducedMotion && !!ripple && s.cursorStrength > 0;\r
      if (rippling && pointer.inside && !pointer.placed) {\r
        pointer.lastX = pointer.x;\r
        pointer.lastY = pointer.y;\r
        pointer.placed = true;\r
      }\r
      if (rippling && (pointer.inside || pointer.burst > 0)) rippleUntil = now + 5000;\r
      const rippleActive = rippling && now < rippleUntil;\r
      if (rippleActive && ripple) {\r
        stepRipple(ripple, s, dt);\r
        rippleLive = true;\r
      } else if (rippleLive) {\r
        clearRipple();\r
        rippleLive = false;\r
      }\r
\r
      const patternIndex = PATTERNS[s.pattern] ?? 0;\r
      if (patternIndex === 4) refreshAtlas(s);\r
\r
      const canvasW = gl.canvas.width;\r
      const canvasH = gl.canvas.height;\r
      const dpr = canvasW / width;\r
      const pitchY = Math.max(4, Math.round(clamp(s.spacing, 4, 120) * dpr));\r
      const pitchX = patternIndex === 3 ? Math.max(2, Math.round(pitchY / 4)) : pitchY;\r
      const cols = Math.min(4096, Math.ceil(canvasW / pitchX) + 1);\r
      const rows = Math.min(4096, Math.ceil(canvasH / pitchY) + 2);\r
      const origin = [Math.floor((canvasW - cols * pitchX) / 2), Math.floor((canvasH - rows * pitchY) / 2)];\r
      if (fieldTarget.width !== cols || fieldTarget.height !== rows) {\r
        dispose(fieldTarget);\r
        fieldTarget = fieldTargetFor(cols, rows);\r
        markUniforms.tField.value = fieldTarget.texture;\r
      }\r
      const heading = (s.direction * Math.PI) / 180;\r
      const lightAngle = ((s.direction + 180 + clamp(s.light, -90, 90)) * Math.PI) / 180;\r
      const background = s.background;\r
      const ink = background[3] > 0.02 ? luminance(s.color) < luminance(background) : luminance(s.color) < 0.5;\r
\r
      fieldUniforms.uSize.value = [width, height];\r
      fieldUniforms.uDpr.value = dpr;\r
      fieldUniforms.uOrigin.value = origin;\r
      fieldUniforms.uPitch.value = [pitchX, pitchY];\r
      fieldUniforms.uWave.value = WAVES[s.wave] ?? 0;\r
      fieldUniforms.uTime.value = time;\r
      fieldUniforms.uUnit.value = WAVE_UNIT * clamp(s.scale, 0.2, 5);\r
      fieldUniforms.uHeading.value = [Math.cos(heading), Math.sin(heading)];\r
      fieldUniforms.uAmp.value = amp;\r
      fieldUniforms.uDepth.value = clamp(s.depth, 0, 1.5);\r
      fieldUniforms.uLight.value = [Math.cos(lightAngle) * 0.78, Math.sin(lightAngle) * 0.78, 0.62];\r
      fieldUniforms.uShine.value = clamp(s.shine, 0, 2);\r
      fieldUniforms.uContrast.value = clamp(s.contrast, 0.3, 3);\r
      fieldUniforms.uInk.value = ink ? 1 : 0;\r
      fieldUniforms.uOpacity.value = clamp(s.opacity, 0, 1);\r
      fieldUniforms.uFade.value = FADES[s.fade] ?? 0;\r
      fieldUniforms.uFadeSize.value = clamp(s.fadeSize, 0.05, 1);\r
      fieldUniforms.uAppear.value = appear;\r
      fieldUniforms.tRipple.value = ripple && rippleLive ? ripple.read.texture : blank;\r
      fieldUniforms.uRipple.value = rippleLive ? 0.32 : 0;\r
      renderer.render({ scene: fieldMesh, target: fieldTarget });\r
\r
      markUniforms.uOrigin.value = origin;\r
      markUniforms.uPitch.value = [pitchX, pitchY];\r
      markUniforms.uGrid.value = [cols, rows];\r
      markUniforms.uPattern.value = patternIndex;\r
      markUniforms.uMarkSize.value = clamp(s.markSize, 0.05, 1);\r
      markUniforms.uStroke.value = patternIndex === 3 ? 0.9 * dpr : Math.max(1.1 * dpr, pitchY * 0.08);\r
      const tint = ink ? 0 : 1;\r
      const blend = ink ? 0.35 : 0.55;\r
      markUniforms.uColor.value = s.color.slice(0, 3);\r
      markUniforms.uAccent.value = s.color.slice(0, 3).map(channel => channel + (tint - channel) * blend);\r
      markUniforms.uBackground.value = background;\r
      renderer.render({ scene: markMesh });\r
      dirty = false;\r
\r
      if (visible && (moving || introClock < 1 || rippleActive || dirty)) raf = requestAnimationFrame(frame);\r
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
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = e => {\r
      const spot = locate(e);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      if (spot.inside !== pointer.inside) pointer.placed = false;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) start();\r
    };\r
\r
    const onPointerDown = e => {\r
      const spot = locate(e);\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      if (!pointer.inside) {\r
        pointer.lastX = spot.x;\r
        pointer.lastY = spot.y;\r
      }\r
      pointer.burst = 1.2;\r
      start();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      pointer.placed = false;\r
      start();\r
    };\r
\r
    const onPointerOut = e => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onPointerUp = e => {\r
      if (e.pointerType === 'touch') onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
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
    wakeRef.current = () => {\r
      dirty = true;\r
      start();\r
    };\r
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
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      if (ripple) {\r
        dispose(ripple.read);\r
        dispose(ripple.write);\r
      }\r
      dispose(fieldTarget);\r
      gl.deleteTexture(atlasTexture.texture);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`pattern-waves \${className}\`.trim()} style={style} />;\r
};\r
\r
export default PatternWaves;\r
`,n=`.pattern-waves {\r
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
const SURFACE_PRESETS = {\r
  silk: {\r
    pattern: 'dot',\r
    wave: 'silk',\r
    spacing: 9,\r
    markSize: 0.95,\r
    depth: 0.95,\r
    light: 0,\r
    shine: 0.8,\r
    contrast: 1.2,\r
    speed: 0.35,\r
    scale: 1,\r
    direction: 20\r
  },\r
  ocean: {\r
    pattern: 'dot',\r
    wave: 'swell',\r
    spacing: 10,\r
    markSize: 0.9,\r
    depth: 0.42,\r
    light: 0,\r
    shine: 1,\r
    contrast: 1.2,\r
    speed: 0.5,\r
    scale: 1,\r
    direction: 100\r
  },\r
  pond: {\r
    pattern: 'dot',\r
    wave: 'ripple',\r
    spacing: 10,\r
    markSize: 0.9,\r
    depth: 0.55,\r
    light: 0,\r
    shine: 1.2,\r
    contrast: 1.2,\r
    speed: 0.5,\r
    scale: 1,\r
    direction: 35\r
  },\r
  lines: {\r
    pattern: 'line',\r
    wave: 'silk',\r
    spacing: 12,\r
    markSize: 0.42,\r
    depth: 0.9,\r
    light: 0,\r
    shine: 0.6,\r
    contrast: 1.2,\r
    speed: 0.3,\r
    scale: 1,\r
    direction: 20\r
  },\r
  terminal: {\r
    pattern: 'glyph',\r
    wave: 'ripple',\r
    spacing: 13,\r
    markSize: 0.95,\r
    depth: 0.75,\r
    light: 0,\r
    shine: 0.9,\r
    contrast: 1.4,\r
    speed: 0.3,\r
    scale: 1.1,\r
    direction: 200\r
  },\r
  mesh: {\r
    pattern: 'plus',\r
    wave: 'silk',\r
    spacing: 14,\r
    markSize: 0.8,\r
    depth: 0.95,\r
    light: 0,\r
    shine: 1,\r
    contrast: 1.45,\r
    speed: 0.4,\r
    scale: 1.1,\r
    direction: 325\r
  }\r
};\r
\r
const PATTERNS = { dot: 0, square: 1, plus: 2, line: 3, glyph: 4 };\r
const WAVES = { silk: 0, swell: 1, ripple: 2 };\r
const FADES = { none: 0, edges: 1, center: 2, bottom: 3, top: 4 };\r
const DEFAULT_CHARACTERS = '.:-=+*#%@';\r
const GLYPH_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const ATLAS_TILE = 128;\r
const WAVE_UNIT = 520;\r
const RIPPLE_CELL = 8;\r
const RIPPLE_RATE = 60;\r
const PIXEL_BUDGET = 4.5e6;\r
const INTRO_SECONDS = 2;\r
\r
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);\r
\r
const luminance = rgba => 0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2];\r
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
const buildAtlas = characters => {\r
  const glyphs = Array.from(characters && characters.length ? characters : DEFAULT_CHARACTERS);\r
  const columns = Math.ceil(Math.sqrt(glyphs.length));\r
  const lines = Math.ceil(glyphs.length / columns);\r
  const canvas = document.createElement('canvas');\r
  canvas.width = columns * ATLAS_TILE;\r
  canvas.height = lines * ATLAS_TILE;\r
  const ctx = canvas.getContext('2d');\r
  if (!ctx) return null;\r
  ctx.fillStyle = '#ffffff';\r
  ctx.textAlign = 'center';\r
  ctx.textBaseline = 'middle';\r
  ctx.font = \`500 \${Math.round(ATLAS_TILE * 0.86)}px \${GLYPH_FONT}\`;\r
  glyphs.forEach((glyph, index) => {\r
    const x = (index % columns) * ATLAS_TILE + ATLAS_TILE / 2;\r
    const y = Math.floor(index / columns) * ATLAS_TILE + ATLAS_TILE / 2;\r
    ctx.fillText(glyph, x, y);\r
  });\r
  return { canvas, columns, lines, count: glyphs.length };\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uSize;\r
uniform float uDpr;\r
uniform vec2 uOrigin;\r
uniform vec2 uPitch;\r
uniform int uWave;\r
uniform float uTime;\r
uniform float uUnit;\r
uniform vec2 uHeading;\r
uniform float uAmp;\r
uniform float uDepth;\r
uniform vec3 uLight;\r
uniform float uShine;\r
uniform float uContrast;\r
uniform float uInk;\r
uniform float uOpacity;\r
uniform int uFade;\r
uniform float uFadeSize;\r
uniform float uAppear;\r
uniform sampler2D tRipple;\r
uniform float uRipple;\r
out vec4 fragColor;\r
\r
const float FOLDS = 5.5;\r
\r
uvec3 scramble(uvec3 v) {\r
  v = v * 1664525u + 1013904223u;\r
  v.x += v.y * v.z;\r
  v.y += v.z * v.x;\r
  v.z += v.x * v.y;\r
  v ^= v >> 16u;\r
  v.x += v.y * v.z;\r
  v.y += v.z * v.x;\r
  v.z += v.x * v.y;\r
  return v;\r
}\r
\r
vec3 lattice(vec3 corner) {\r
  uvec3 h = scramble(uvec3(ivec3(corner) + 4096));\r
  return vec3(h & 65535u) / 32767.5 - 1.0;\r
}\r
\r
float gradientNoise(vec3 p) {\r
  vec3 i = floor(p);\r
  vec3 f = p - i;\r
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float n000 = dot(lattice(i), f);\r
  float n100 = dot(lattice(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));\r
  float n010 = dot(lattice(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));\r
  float n110 = dot(lattice(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));\r
  float n001 = dot(lattice(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));\r
  float n101 = dot(lattice(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));\r
  float n011 = dot(lattice(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));\r
  float n111 = dot(lattice(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));\r
  return mix(\r
    mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),\r
    mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),\r
    u.z\r
  );\r
}\r
\r
vec2 turn(vec2 v, float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);\r
}\r
\r
float surface(vec2 p, float t) {\r
  if (uWave == 0) {\r
    vec2 side = vec2(-uHeading.y, uHeading.x);\r
    float u = dot(p, uHeading);\r
    float v = dot(p, side);\r
    float bend = gradientNoise(vec3(v * 0.85, u * 0.3, t * 0.05)) * 1.7 + 0.4 * sin(v * 1.6 + t * 0.2);\r
    float phase = u * FOLDS + bend - t * 0.45;\r
    float swell = 0.6 + 0.4 * gradientNoise(vec3(u * 0.55 + 3.0, v * 0.45, t * 0.04));\r
    float fold = sin(phase) + 0.32 * sin(2.0 * phase + 1.3);\r
    float ripple = 0.16 * sin(u * FOLDS * 2.5 + bend * 1.9 - t * 0.9 + 2.1);\r
    return (fold + ripple) * swell;\r
  }\r
  if (uWave == 1) {\r
    float bend = gradientNoise(vec3(p * 0.6, t * 0.05)) * 0.6;\r
    float phase = dot(p, uHeading) * 15.0 + bend * 2.2 - t * 1.4;\r
    float swell = sin(phase) + 0.3 * sin(2.0 * phase - 0.8);\r
    float roll = 0.75 + 0.25 * gradientNoise(vec3(p * 0.9 + 11.0, t * 0.05));\r
    return 0.8 * swell * roll;\r
  }\r
  float r = length(p + uHeading * 1.2);\r
  float bend = gradientNoise(vec3(p * 1.2, t * 0.05)) * 0.1;\r
  return sin((r + bend) * 9.0 - t * 1.8) * (0.45 + 0.55 * exp(-(r - 0.6) * 0.8));\r
}\r
\r
float heightAt(vec2 css) {\r
  float h = surface((css - 0.5 * uSize) / uUnit, uTime) * uAmp;\r
  if (uRipple > 0.0) h += texture(tRipple, css / uSize).r * uRipple;\r
  return h;\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  vec2 center = uOrigin + (cell + 0.5) * uPitch;\r
  vec2 css = center / uDpr;\r
  vec2 uv = css / uSize;\r
  float e = max(uPitch.y / uDpr, 4.0);\r
  float h = heightAt(css);\r
  float hx = (heightAt(css + vec2(e, 0.0)) - heightAt(css - vec2(e, 0.0))) / (2.0 * e);\r
  float hy = (heightAt(css + vec2(0.0, e)) - heightAt(css - vec2(0.0, e))) / (2.0 * e);\r
  vec2 grad = vec2(hx, hy) * uUnit * uDepth * 0.4;\r
  vec3 n = normalize(vec3(-grad, 1.0));\r
\r
  float diffuse = clamp(dot(n, uLight), 0.0, 1.0);\r
  vec3 halfway = normalize(uLight + vec3(0.0, 0.0, 1.0));\r
  float spec = pow(clamp(dot(n, halfway), 0.0, 1.0), 160.0) * uShine * 1.15;\r
  float hollow = 0.7 + 0.3 * clamp(h * 0.5 + 0.5, 0.0, 1.0);\r
  float tone = clamp(diffuse * hollow * 0.78 + spec, 0.0, 1.0);\r
  tone = clamp((tone - 0.42) * uContrast + 0.42, 0.0, 1.0);\r
\r
  float level = uInk > 0.5 ? pow(clamp(1.0 - tone / 0.46, 0.0, 1.0), 2.4) * 0.72 : pow(tone, 2.2);\r
  float emphasis = uInk > 0.5 ? smoothstep(0.55, 0.95, level) : clamp(spec * 1.6, 0.0, 1.0);\r
\r
  float fade = 1.0;\r
  vec2 c = uv * 2.0 - 1.0;\r
  if (uFade == 1) {\r
    fade = 1.0 - smoothstep(1.0 - uFadeSize, 1.18, length(c));\r
  } else if (uFade == 2) {\r
    fade = mix(0.05, 1.0, smoothstep(0.08, 0.08 + uFadeSize, length(c * vec2(1.0, 1.35))));\r
  } else if (uFade == 3) {\r
    fade = smoothstep(0.0, uFadeSize, uv.y);\r
  } else if (uFade == 4) {\r
    fade = smoothstep(0.0, uFadeSize, 1.0 - uv.y);\r
  }\r
\r
  float reach = length(css - 0.5 * uSize) / max(0.5 * length(uSize), 1.0);\r
  float appear = smoothstep(reach - 0.05, reach + 0.3, uAppear * 1.35);\r
\r
  float alpha = uOpacity * fade * appear * (0.22 + 0.78 * level);\r
  float lift = clamp(h * uDepth * 0.42, -0.48, 0.48);\r
  fragColor = vec4(level, alpha, emphasis, lift + 0.5);\r
}\r
\`;\r
\r
const rippleFragment = \`#version 300 es\r
precision highp float;\r
uniform sampler2D tState;\r
uniform vec2 uTexel;\r
uniform vec2 uSize;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uImpulse;\r
uniform float uDamping;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy * uTexel;\r
  vec2 state = texture(tState, uv).rg;\r
  float left = texture(tState, uv - vec2(uTexel.x, 0.0)).r;\r
  float right = texture(tState, uv + vec2(uTexel.x, 0.0)).r;\r
  float below = texture(tState, uv - vec2(0.0, uTexel.y)).r;\r
  float above = texture(tState, uv + vec2(0.0, uTexel.y)).r;\r
  float next = ((left + right + below + above) * 0.5 - state.g) * uDamping;\r
  vec2 p = uv * uSize;\r
  vec2 segment = uTo - uFrom;\r
  float along = clamp(dot(p - uFrom, segment) / max(dot(segment, segment), 1e-4), 0.0, 1.0);\r
  float d = length(p - uFrom - segment * along) / uRadius;\r
  next -= uImpulse * exp(-d * d * 2.0);\r
  fragColor = vec4(next, state.r, 0.0, 1.0);\r
}\r
\`;\r
\r
const markFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D tField;\r
uniform sampler2D tAtlas;\r
uniform vec2 uOrigin;\r
uniform vec2 uPitch;\r
uniform vec2 uGrid;\r
uniform int uPattern;\r
uniform float uMarkSize;\r
uniform float uStroke;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec4 uBackground;\r
uniform vec3 uAtlas;\r
out vec4 fragColor;\r
\r
float box(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
float coverage(vec2 local, float level) {\r
  float span = uPitch.y * uMarkSize;\r
  float area = max(sqrt(level), 0.14);\r
  if (uPattern == 0) {\r
    return clamp(0.5 - (length(local) - 0.5 * span * area), 0.0, 1.0);\r
  }\r
  if (uPattern == 1) {\r
    float extent = 0.5 * span * area;\r
    return clamp(0.5 - box(local, vec2(extent), extent * 0.3), 0.0, 1.0);\r
  }\r
  if (uPattern == 2) {\r
    float arm = 0.5 * span * mix(0.3, 1.0, level);\r
    float width = 0.5 * uStroke;\r
    return clamp(0.5 - min(box(local, vec2(arm, width), width), box(local, vec2(width, arm), width)), 0.0, 1.0);\r
  }\r
  if (uAtlas.z < 1.0) return 0.0;\r
  vec2 g = local / span + 0.5;\r
  if (g.x < 0.0 || g.y < 0.0 || g.x > 1.0 || g.y > 1.0) return 0.0;\r
  float index = min(floor(level * uAtlas.z), uAtlas.z - 1.0);\r
  vec2 tile = vec2(mod(index, uAtlas.x), floor(index / uAtlas.x));\r
  vec2 atlasUv = (tile + vec2(g.x, 1.0 - g.y)) / uAtlas.xy;\r
  vec2 texel = 1.0 / (span * uAtlas.xy);\r
  return textureGrad(tAtlas, atlasUv, vec2(texel.x, 0.0), vec2(0.0, texel.y)).a;\r
}\r
\r
vec4 lineInk(vec2 rel) {\r
  float fx = rel.x / uPitch.x - 0.5;\r
  float c0 = clamp(floor(fx), 0.0, uGrid.x - 1.0);\r
  float c1 = min(c0 + 1.0, uGrid.x - 1.0);\r
  float t = clamp(fx - c0, 0.0, 1.0);\r
  float row = floor(rel.y / uPitch.y);\r
  vec4 ink = vec4(0.0);\r
  for (int k = -1; k <= 1; k++) {\r
    float cy = row + float(k);\r
    if (cy < 0.0 || cy >= uGrid.y) continue;\r
    vec4 a = texelFetch(tField, ivec2(int(c0), int(cy)), 0);\r
    vec4 b = texelFetch(tField, ivec2(int(c1), int(cy)), 0);\r
    vec4 f = mix(a, b, t);\r
    if (f.g < 0.002) continue;\r
    float y = (cy + 0.5 + f.a - 0.5) * uPitch.y;\r
    float slope = (b.a - a.a) * uPitch.y / uPitch.x;\r
    float thickness = max(uStroke, uPitch.y * uMarkSize * f.r);\r
    float d = abs(rel.y - y) / sqrt(1.0 + slope * slope) - 0.5 * thickness;\r
    float alpha = clamp(0.5 - d, 0.0, 1.0) * f.g;\r
    if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);\r
  }\r
  return ink;\r
}\r
\r
void main() {\r
  vec2 rel = gl_FragCoord.xy - uOrigin;\r
  vec4 background = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  vec4 ink = vec4(0.0);\r
  if (uPattern == 3) {\r
    ink = lineInk(rel);\r
  } else {\r
    float cx = floor(rel.x / uPitch.x);\r
    float row = floor(rel.y / uPitch.y);\r
    if (cx >= 0.0 && cx < uGrid.x) {\r
      for (int k = -1; k <= 1; k++) {\r
        float cy = row + float(k);\r
        if (cy < 0.0 || cy >= uGrid.y) continue;\r
        vec4 f = texelFetch(tField, ivec2(int(cx), int(cy)), 0);\r
        if (f.g < 0.002) continue;\r
        vec2 center = (vec2(cx, cy) + 0.5) * uPitch + vec2(0.0, (f.a - 0.5) * uPitch.y);\r
        float alpha = coverage(rel - center, f.r) * f.g;\r
        if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);\r
      }\r
    }\r
  }\r
  fragColor = ink + background * (1.0 - ink.a);\r
}\r
\`;\r
\r
const PatternWaves = ({\r
  preset = 'silk',\r
  pattern,\r
  wave,\r
  spacing,\r
  markSize,\r
  depth,\r
  light,\r
  shine,\r
  contrast,\r
  speed,\r
  scale,\r
  direction,\r
  color = '#ffffff',\r
  backgroundColor = '#000000',\r
  opacity = 1,\r
  fade = 'edges',\r
  fadeSize = 0.5,\r
  characters = DEFAULT_CHARACTERS,\r
  interactive = true,\r
  cursorSize = 50,\r
  cursorStrength = 0.6,\r
  intro = true,\r
  paused = false,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const wakeRef = useRef(null);\r
\r
  const base = SURFACE_PRESETS[preset] || SURFACE_PRESETS.silk;\r
  const pick = (value, key) => (value === undefined || value === null ? base[key] : value);\r
\r
  const colors = useMemo(\r
    () => ({\r
      color: parseColor(color, [1, 1, 1, 1]),\r
      background: parseColor(backgroundColor, [0, 0, 0, 1])\r
    }),\r
    [color, backgroundColor]\r
  );\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      pattern: pick(pattern, 'pattern'),\r
      wave: pick(wave, 'wave'),\r
      spacing: pick(spacing, 'spacing'),\r
      markSize: pick(markSize, 'markSize'),\r
      depth: pick(depth, 'depth'),\r
      light: pick(light, 'light'),\r
      shine: pick(shine, 'shine'),\r
      contrast: pick(contrast, 'contrast'),\r
      speed: pick(speed, 'speed'),\r
      scale: pick(scale, 'scale'),\r
      direction: pick(direction, 'direction'),\r
      opacity,\r
      fade,\r
      fadeSize,\r
      characters,\r
      interactive,\r
      cursorSize,\r
      cursorStrength,\r
      intro,\r
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
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
\r
    const dispose = target => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
\r
    const fieldTargetFor = (w, h) =>\r
      new RenderTarget(gl, { width: w, height: h, depth: false, minFilter: gl.NEAREST, magFilter: gl.NEAREST });\r
\r
    const rippleTargetFor = (w, h) =>\r
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
    let fieldTarget = fieldTargetFor(1, 1);\r
    let ripple = null;\r
\r
    const atlasTexture = new Texture(gl, {\r
      generateMipmaps: true,\r
      minFilter: gl.LINEAR_MIPMAP_LINEAR,\r
      magFilter: gl.LINEAR,\r
      flipY: false\r
    });\r
\r
    const fieldUniforms = {\r
      uSize: { value: [1, 1] },\r
      uDpr: { value: 1 },\r
      uOrigin: { value: [0, 0] },\r
      uPitch: { value: [1, 1] },\r
      uWave: { value: 0 },\r
      uTime: { value: 0 },\r
      uUnit: { value: WAVE_UNIT },\r
      uHeading: { value: [1, 0] },\r
      uAmp: { value: 0 },\r
      uDepth: { value: 0.5 },\r
      uLight: { value: [0, 0, 1] },\r
      uShine: { value: 0.8 },\r
      uContrast: { value: 1 },\r
      uInk: { value: 0 },\r
      uOpacity: { value: 1 },\r
      uFade: { value: 0 },\r
      uFadeSize: { value: 0.5 },\r
      uAppear: { value: 0 },\r
      tRipple: { value: blank },\r
      uRipple: { value: 0 }\r
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
    const rippleUniforms = {\r
      tState: { value: blank },\r
      uTexel: { value: [1, 1] },\r
      uSize: { value: [1, 1] },\r
      uFrom: { value: [0, 0] },\r
      uTo: { value: [0, 0] },\r
      uRadius: { value: 40 },\r
      uImpulse: { value: 0 },\r
      uDamping: { value: 0.975 }\r
    };\r
    const rippleMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: rippleFragment,\r
        uniforms: rippleUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const markUniforms = {\r
      tField: { value: fieldTarget.texture },\r
      tAtlas: { value: atlasTexture },\r
      uOrigin: { value: [0, 0] },\r
      uPitch: { value: [1, 1] },\r
      uGrid: { value: [1, 1] },\r
      uPattern: { value: 0 },\r
      uMarkSize: { value: 0.9 },\r
      uStroke: { value: 2 },\r
      uColor: { value: [1, 1, 1] },\r
      uAccent: { value: [1, 1, 1] },\r
      uBackground: { value: [0, 0, 0, 1] },\r
      uAtlas: { value: [1, 1, 0] }\r
    };\r
    const markMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: markFragment,\r
        uniforms: markUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
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
    let dirty = true;\r
    let rippleUntil = 0;\r
    let rippleLive = false;\r
    let rippleClock = 0;\r
    let atlasKey = '';\r
    const pointer = { x: 0, y: 0, inside: false, placed: false, lastX: 0, lastY: 0, burst: 0 };\r
\r
    const buildRipple = () => {\r
      if (!floatTargets) return;\r
      const w = clamp(Math.ceil(width / RIPPLE_CELL), 4, 512);\r
      const h = clamp(Math.ceil(height / RIPPLE_CELL), 4, 512);\r
      if (ripple && ripple.width === w && ripple.height === h) return;\r
      if (ripple) {\r
        dispose(ripple.read);\r
        dispose(ripple.write);\r
      }\r
      ripple = { width: w, height: h, read: rippleTargetFor(w, h), write: rippleTargetFor(w, h) };\r
      rippleLive = false;\r
    };\r
\r
    const clearRipple = () => {\r
      if (!ripple) return;\r
      [ripple.read, ripple.write].forEach(target => {\r
        renderer.bindFramebuffer(target);\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
      });\r
      renderer.bindFramebuffer();\r
    };\r
\r
    const refreshAtlas = s => {\r
      if (s.characters === atlasKey) return;\r
      atlasKey = s.characters;\r
      const built = buildAtlas(s.characters);\r
      if (!built) return;\r
      atlasTexture.image = built.canvas;\r
      markUniforms.uAtlas.value = [built.columns, built.lines, built.count];\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      buildRipple();\r
      dirty = true;\r
      start();\r
    };\r
\r
    const stepRipple = (field, s, dt) => {\r
      rippleClock = Math.min(rippleClock + dt * RIPPLE_RATE, 4);\r
      const strength = clamp(s.cursorStrength, 0, 1);\r
      const moved = Math.hypot(pointer.x - pointer.lastX, pointer.y - pointer.lastY);\r
      let impulse = (pointer.inside ? Math.min(moved / 14, 1) * 0.35 * strength : 0) + pointer.burst * strength;\r
      pointer.burst = 0;\r
      rippleUniforms.uTexel.value = [1 / field.width, 1 / field.height];\r
      rippleUniforms.uSize.value = [width, height];\r
      rippleUniforms.uFrom.value = [pointer.lastX, height - pointer.lastY];\r
      rippleUniforms.uTo.value = [pointer.x, height - pointer.y];\r
      rippleUniforms.uRadius.value = clamp(s.cursorSize, 8, 400);\r
      while (rippleClock >= 1) {\r
        rippleClock -= 1;\r
        rippleUniforms.tState.value = field.read.texture;\r
        rippleUniforms.uImpulse.value = impulse;\r
        renderer.render({ scene: rippleMesh, target: field.write, clear: false });\r
        const next = field.read;\r
        field.read = field.write;\r
        field.write = next;\r
        impulse = 0;\r
      }\r
      pointer.lastX = pointer.x;\r
      pointer.lastY = pointer.y;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      const moving = !s.paused && !reducedMotion && s.speed !== 0;\r
      if (moving) time += dt * s.speed;\r
      introClock = s.intro && !reducedMotion ? Math.min(1, introClock + dt / INTRO_SECONDS) : 1;\r
      const appear = 1 - Math.pow(1 - clamp(introClock / 0.75, 0, 1), 3);\r
      const rise = clamp((introClock - 0.1) / 0.9, 0, 1);\r
      const amp = rise * rise * (3 - 2 * rise);\r
\r
      const rippling = s.interactive && !reducedMotion && !!ripple && s.cursorStrength > 0;\r
      if (rippling && pointer.inside && !pointer.placed) {\r
        pointer.lastX = pointer.x;\r
        pointer.lastY = pointer.y;\r
        pointer.placed = true;\r
      }\r
      if (rippling && (pointer.inside || pointer.burst > 0)) rippleUntil = now + 5000;\r
      const rippleActive = rippling && now < rippleUntil;\r
      if (rippleActive && ripple) {\r
        stepRipple(ripple, s, dt);\r
        rippleLive = true;\r
      } else if (rippleLive) {\r
        clearRipple();\r
        rippleLive = false;\r
      }\r
\r
      const patternIndex = PATTERNS[s.pattern] ?? 0;\r
      if (patternIndex === 4) refreshAtlas(s);\r
\r
      const canvasW = gl.canvas.width;\r
      const canvasH = gl.canvas.height;\r
      const dpr = canvasW / width;\r
      const pitchY = Math.max(4, Math.round(clamp(s.spacing, 4, 120) * dpr));\r
      const pitchX = patternIndex === 3 ? Math.max(2, Math.round(pitchY / 4)) : pitchY;\r
      const cols = Math.min(4096, Math.ceil(canvasW / pitchX) + 1);\r
      const rows = Math.min(4096, Math.ceil(canvasH / pitchY) + 2);\r
      const origin = [Math.floor((canvasW - cols * pitchX) / 2), Math.floor((canvasH - rows * pitchY) / 2)];\r
      if (fieldTarget.width !== cols || fieldTarget.height !== rows) {\r
        dispose(fieldTarget);\r
        fieldTarget = fieldTargetFor(cols, rows);\r
        markUniforms.tField.value = fieldTarget.texture;\r
      }\r
      const heading = (s.direction * Math.PI) / 180;\r
      const lightAngle = ((s.direction + 180 + clamp(s.light, -90, 90)) * Math.PI) / 180;\r
      const background = s.background;\r
      const ink = background[3] > 0.02 ? luminance(s.color) < luminance(background) : luminance(s.color) < 0.5;\r
\r
      fieldUniforms.uSize.value = [width, height];\r
      fieldUniforms.uDpr.value = dpr;\r
      fieldUniforms.uOrigin.value = origin;\r
      fieldUniforms.uPitch.value = [pitchX, pitchY];\r
      fieldUniforms.uWave.value = WAVES[s.wave] ?? 0;\r
      fieldUniforms.uTime.value = time;\r
      fieldUniforms.uUnit.value = WAVE_UNIT * clamp(s.scale, 0.2, 5);\r
      fieldUniforms.uHeading.value = [Math.cos(heading), Math.sin(heading)];\r
      fieldUniforms.uAmp.value = amp;\r
      fieldUniforms.uDepth.value = clamp(s.depth, 0, 1.5);\r
      fieldUniforms.uLight.value = [Math.cos(lightAngle) * 0.78, Math.sin(lightAngle) * 0.78, 0.62];\r
      fieldUniforms.uShine.value = clamp(s.shine, 0, 2);\r
      fieldUniforms.uContrast.value = clamp(s.contrast, 0.3, 3);\r
      fieldUniforms.uInk.value = ink ? 1 : 0;\r
      fieldUniforms.uOpacity.value = clamp(s.opacity, 0, 1);\r
      fieldUniforms.uFade.value = FADES[s.fade] ?? 0;\r
      fieldUniforms.uFadeSize.value = clamp(s.fadeSize, 0.05, 1);\r
      fieldUniforms.uAppear.value = appear;\r
      fieldUniforms.tRipple.value = ripple && rippleLive ? ripple.read.texture : blank;\r
      fieldUniforms.uRipple.value = rippleLive ? 0.32 : 0;\r
      renderer.render({ scene: fieldMesh, target: fieldTarget });\r
\r
      markUniforms.uOrigin.value = origin;\r
      markUniforms.uPitch.value = [pitchX, pitchY];\r
      markUniforms.uGrid.value = [cols, rows];\r
      markUniforms.uPattern.value = patternIndex;\r
      markUniforms.uMarkSize.value = clamp(s.markSize, 0.05, 1);\r
      markUniforms.uStroke.value = patternIndex === 3 ? 0.9 * dpr : Math.max(1.1 * dpr, pitchY * 0.08);\r
      const tint = ink ? 0 : 1;\r
      const blend = ink ? 0.35 : 0.55;\r
      markUniforms.uColor.value = s.color.slice(0, 3);\r
      markUniforms.uAccent.value = s.color.slice(0, 3).map(channel => channel + (tint - channel) * blend);\r
      markUniforms.uBackground.value = background;\r
      renderer.render({ scene: markMesh });\r
      dirty = false;\r
\r
      if (visible && (moving || introClock < 1 || rippleActive || dirty)) raf = requestAnimationFrame(frame);\r
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
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = e => {\r
      const spot = locate(e);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      if (spot.inside !== pointer.inside) pointer.placed = false;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) start();\r
    };\r
\r
    const onPointerDown = e => {\r
      const spot = locate(e);\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      if (!pointer.inside) {\r
        pointer.lastX = spot.x;\r
        pointer.lastY = spot.y;\r
      }\r
      pointer.burst = 1.2;\r
      start();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      pointer.placed = false;\r
      start();\r
    };\r
\r
    const onPointerOut = e => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onPointerUp = e => {\r
      if (e.pointerType === 'touch') onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
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
    wakeRef.current = () => {\r
      dirty = true;\r
      start();\r
    };\r
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
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      if (ripple) {\r
        dispose(ripple.read);\r
        dispose(ripple.write);\r
      }\r
      dispose(fieldTarget);\r
      gl.deleteTexture(atlasTexture.texture);\r
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
export default PatternWaves;\r
`,t=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Triangle, RenderTarget, Texture } from 'ogl';\r
\r
import './PatternWaves.css';\r
\r
type SurfacePreset = 'silk' | 'ocean' | 'pond' | 'lines' | 'terminal' | 'mesh';\r
type PatternKind = 'dot' | 'square' | 'plus' | 'line' | 'glyph';\r
type WaveKind = 'silk' | 'swell' | 'ripple';\r
type FadeKind = 'edges' | 'center' | 'bottom' | 'top' | 'none';\r
type Rgba = [number, number, number, number];\r
\r
interface PresetValues {\r
  pattern: PatternKind;\r
  wave: WaveKind;\r
  spacing: number;\r
  markSize: number;\r
  depth: number;\r
  light: number;\r
  shine: number;\r
  contrast: number;\r
  speed: number;\r
  scale: number;\r
  direction: number;\r
}\r
\r
export interface PatternWavesProps extends Partial<PresetValues> {\r
  preset?: SurfacePreset;\r
  color?: string;\r
  backgroundColor?: string;\r
  opacity?: number;\r
  fade?: FadeKind;\r
  fadeSize?: number;\r
  characters?: string;\r
  interactive?: boolean;\r
  cursorSize?: number;\r
  cursorStrength?: number;\r
  intro?: boolean;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings extends PresetValues {\r
  color: Rgba;\r
  background: Rgba;\r
  opacity: number;\r
  fade: FadeKind;\r
  fadeSize: number;\r
  characters: string;\r
  interactive: boolean;\r
  cursorSize: number;\r
  cursorStrength: number;\r
  intro: boolean;\r
  paused: boolean;\r
}\r
\r
interface RippleField {\r
  width: number;\r
  height: number;\r
  read: RenderTarget;\r
  write: RenderTarget;\r
}\r
\r
const SURFACE_PRESETS: Record<SurfacePreset, PresetValues> = {\r
  silk: {\r
    pattern: 'dot',\r
    wave: 'silk',\r
    spacing: 9,\r
    markSize: 0.95,\r
    depth: 0.95,\r
    light: 0,\r
    shine: 0.8,\r
    contrast: 1.2,\r
    speed: 0.35,\r
    scale: 1,\r
    direction: 20\r
  },\r
  ocean: {\r
    pattern: 'dot',\r
    wave: 'swell',\r
    spacing: 10,\r
    markSize: 0.9,\r
    depth: 0.42,\r
    light: 0,\r
    shine: 1,\r
    contrast: 1.2,\r
    speed: 0.5,\r
    scale: 1,\r
    direction: 100\r
  },\r
  pond: {\r
    pattern: 'dot',\r
    wave: 'ripple',\r
    spacing: 10,\r
    markSize: 0.9,\r
    depth: 0.55,\r
    light: 0,\r
    shine: 1.2,\r
    contrast: 1.2,\r
    speed: 0.5,\r
    scale: 1,\r
    direction: 35\r
  },\r
  lines: {\r
    pattern: 'line',\r
    wave: 'silk',\r
    spacing: 12,\r
    markSize: 0.42,\r
    depth: 0.9,\r
    light: 0,\r
    shine: 0.6,\r
    contrast: 1.2,\r
    speed: 0.3,\r
    scale: 1,\r
    direction: 20\r
  },\r
  terminal: {\r
    pattern: 'glyph',\r
    wave: 'ripple',\r
    spacing: 13,\r
    markSize: 0.95,\r
    depth: 0.75,\r
    light: 0,\r
    shine: 0.9,\r
    contrast: 1.4,\r
    speed: 0.3,\r
    scale: 1.1,\r
    direction: 200\r
  },\r
  mesh: {\r
    pattern: 'plus',\r
    wave: 'silk',\r
    spacing: 14,\r
    markSize: 0.8,\r
    depth: 0.95,\r
    light: 0,\r
    shine: 1,\r
    contrast: 1.45,\r
    speed: 0.4,\r
    scale: 1.1,\r
    direction: 325\r
  }\r
};\r
\r
const PATTERNS: Record<string, number> = { dot: 0, square: 1, plus: 2, line: 3, glyph: 4 };\r
const WAVES: Record<string, number> = { silk: 0, swell: 1, ripple: 2 };\r
const FADES: Record<string, number> = { none: 0, edges: 1, center: 2, bottom: 3, top: 4 };\r
const DEFAULT_CHARACTERS = '.:-=+*#%@';\r
const GLYPH_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const ATLAS_TILE = 128;\r
const WAVE_UNIT = 520;\r
const RIPPLE_CELL = 8;\r
const RIPPLE_RATE = 60;\r
const PIXEL_BUDGET = 4.5e6;\r
const INTRO_SECONDS = 2;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);\r
\r
const luminance = (rgba: number[]) => 0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2];\r
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
const buildAtlas = (characters: string) => {\r
  const glyphs = Array.from(characters && characters.length ? characters : DEFAULT_CHARACTERS);\r
  const columns = Math.ceil(Math.sqrt(glyphs.length));\r
  const lines = Math.ceil(glyphs.length / columns);\r
  const canvas = document.createElement('canvas');\r
  canvas.width = columns * ATLAS_TILE;\r
  canvas.height = lines * ATLAS_TILE;\r
  const ctx = canvas.getContext('2d');\r
  if (!ctx) return null;\r
  ctx.fillStyle = '#ffffff';\r
  ctx.textAlign = 'center';\r
  ctx.textBaseline = 'middle';\r
  ctx.font = \`500 \${Math.round(ATLAS_TILE * 0.86)}px \${GLYPH_FONT}\`;\r
  glyphs.forEach((glyph, index) => {\r
    const x = (index % columns) * ATLAS_TILE + ATLAS_TILE / 2;\r
    const y = Math.floor(index / columns) * ATLAS_TILE + ATLAS_TILE / 2;\r
    ctx.fillText(glyph, x, y);\r
  });\r
  return { canvas, columns, lines, count: glyphs.length };\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uSize;\r
uniform float uDpr;\r
uniform vec2 uOrigin;\r
uniform vec2 uPitch;\r
uniform int uWave;\r
uniform float uTime;\r
uniform float uUnit;\r
uniform vec2 uHeading;\r
uniform float uAmp;\r
uniform float uDepth;\r
uniform vec3 uLight;\r
uniform float uShine;\r
uniform float uContrast;\r
uniform float uInk;\r
uniform float uOpacity;\r
uniform int uFade;\r
uniform float uFadeSize;\r
uniform float uAppear;\r
uniform sampler2D tRipple;\r
uniform float uRipple;\r
out vec4 fragColor;\r
\r
const float FOLDS = 5.5;\r
\r
uvec3 scramble(uvec3 v) {\r
  v = v * 1664525u + 1013904223u;\r
  v.x += v.y * v.z;\r
  v.y += v.z * v.x;\r
  v.z += v.x * v.y;\r
  v ^= v >> 16u;\r
  v.x += v.y * v.z;\r
  v.y += v.z * v.x;\r
  v.z += v.x * v.y;\r
  return v;\r
}\r
\r
vec3 lattice(vec3 corner) {\r
  uvec3 h = scramble(uvec3(ivec3(corner) + 4096));\r
  return vec3(h & 65535u) / 32767.5 - 1.0;\r
}\r
\r
float gradientNoise(vec3 p) {\r
  vec3 i = floor(p);\r
  vec3 f = p - i;\r
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float n000 = dot(lattice(i), f);\r
  float n100 = dot(lattice(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));\r
  float n010 = dot(lattice(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));\r
  float n110 = dot(lattice(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));\r
  float n001 = dot(lattice(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));\r
  float n101 = dot(lattice(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));\r
  float n011 = dot(lattice(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));\r
  float n111 = dot(lattice(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));\r
  return mix(\r
    mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),\r
    mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),\r
    u.z\r
  );\r
}\r
\r
vec2 turn(vec2 v, float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);\r
}\r
\r
float surface(vec2 p, float t) {\r
  if (uWave == 0) {\r
    vec2 side = vec2(-uHeading.y, uHeading.x);\r
    float u = dot(p, uHeading);\r
    float v = dot(p, side);\r
    float bend = gradientNoise(vec3(v * 0.85, u * 0.3, t * 0.05)) * 1.7 + 0.4 * sin(v * 1.6 + t * 0.2);\r
    float phase = u * FOLDS + bend - t * 0.45;\r
    float swell = 0.6 + 0.4 * gradientNoise(vec3(u * 0.55 + 3.0, v * 0.45, t * 0.04));\r
    float fold = sin(phase) + 0.32 * sin(2.0 * phase + 1.3);\r
    float ripple = 0.16 * sin(u * FOLDS * 2.5 + bend * 1.9 - t * 0.9 + 2.1);\r
    return (fold + ripple) * swell;\r
  }\r
  if (uWave == 1) {\r
    float bend = gradientNoise(vec3(p * 0.6, t * 0.05)) * 0.6;\r
    float phase = dot(p, uHeading) * 15.0 + bend * 2.2 - t * 1.4;\r
    float swell = sin(phase) + 0.3 * sin(2.0 * phase - 0.8);\r
    float roll = 0.75 + 0.25 * gradientNoise(vec3(p * 0.9 + 11.0, t * 0.05));\r
    return 0.8 * swell * roll;\r
  }\r
  float r = length(p + uHeading * 1.2);\r
  float bend = gradientNoise(vec3(p * 1.2, t * 0.05)) * 0.1;\r
  return sin((r + bend) * 9.0 - t * 1.8) * (0.45 + 0.55 * exp(-(r - 0.6) * 0.8));\r
}\r
\r
float heightAt(vec2 css) {\r
  float h = surface((css - 0.5 * uSize) / uUnit, uTime) * uAmp;\r
  if (uRipple > 0.0) h += texture(tRipple, css / uSize).r * uRipple;\r
  return h;\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  vec2 center = uOrigin + (cell + 0.5) * uPitch;\r
  vec2 css = center / uDpr;\r
  vec2 uv = css / uSize;\r
  float e = max(uPitch.y / uDpr, 4.0);\r
  float h = heightAt(css);\r
  float hx = (heightAt(css + vec2(e, 0.0)) - heightAt(css - vec2(e, 0.0))) / (2.0 * e);\r
  float hy = (heightAt(css + vec2(0.0, e)) - heightAt(css - vec2(0.0, e))) / (2.0 * e);\r
  vec2 grad = vec2(hx, hy) * uUnit * uDepth * 0.4;\r
  vec3 n = normalize(vec3(-grad, 1.0));\r
\r
  float diffuse = clamp(dot(n, uLight), 0.0, 1.0);\r
  vec3 halfway = normalize(uLight + vec3(0.0, 0.0, 1.0));\r
  float spec = pow(clamp(dot(n, halfway), 0.0, 1.0), 160.0) * uShine * 1.15;\r
  float hollow = 0.7 + 0.3 * clamp(h * 0.5 + 0.5, 0.0, 1.0);\r
  float tone = clamp(diffuse * hollow * 0.78 + spec, 0.0, 1.0);\r
  tone = clamp((tone - 0.42) * uContrast + 0.42, 0.0, 1.0);\r
\r
  float level = uInk > 0.5 ? pow(clamp(1.0 - tone / 0.46, 0.0, 1.0), 2.4) * 0.72 : pow(tone, 2.2);\r
  float emphasis = uInk > 0.5 ? smoothstep(0.55, 0.95, level) : clamp(spec * 1.6, 0.0, 1.0);\r
\r
  float fade = 1.0;\r
  vec2 c = uv * 2.0 - 1.0;\r
  if (uFade == 1) {\r
    fade = 1.0 - smoothstep(1.0 - uFadeSize, 1.18, length(c));\r
  } else if (uFade == 2) {\r
    fade = mix(0.05, 1.0, smoothstep(0.08, 0.08 + uFadeSize, length(c * vec2(1.0, 1.35))));\r
  } else if (uFade == 3) {\r
    fade = smoothstep(0.0, uFadeSize, uv.y);\r
  } else if (uFade == 4) {\r
    fade = smoothstep(0.0, uFadeSize, 1.0 - uv.y);\r
  }\r
\r
  float reach = length(css - 0.5 * uSize) / max(0.5 * length(uSize), 1.0);\r
  float appear = smoothstep(reach - 0.05, reach + 0.3, uAppear * 1.35);\r
\r
  float alpha = uOpacity * fade * appear * (0.22 + 0.78 * level);\r
  float lift = clamp(h * uDepth * 0.42, -0.48, 0.48);\r
  fragColor = vec4(level, alpha, emphasis, lift + 0.5);\r
}\r
\`;\r
\r
const rippleFragment = \`#version 300 es\r
precision highp float;\r
uniform sampler2D tState;\r
uniform vec2 uTexel;\r
uniform vec2 uSize;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uImpulse;\r
uniform float uDamping;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy * uTexel;\r
  vec2 state = texture(tState, uv).rg;\r
  float left = texture(tState, uv - vec2(uTexel.x, 0.0)).r;\r
  float right = texture(tState, uv + vec2(uTexel.x, 0.0)).r;\r
  float below = texture(tState, uv - vec2(0.0, uTexel.y)).r;\r
  float above = texture(tState, uv + vec2(0.0, uTexel.y)).r;\r
  float next = ((left + right + below + above) * 0.5 - state.g) * uDamping;\r
  vec2 p = uv * uSize;\r
  vec2 segment = uTo - uFrom;\r
  float along = clamp(dot(p - uFrom, segment) / max(dot(segment, segment), 1e-4), 0.0, 1.0);\r
  float d = length(p - uFrom - segment * along) / uRadius;\r
  next -= uImpulse * exp(-d * d * 2.0);\r
  fragColor = vec4(next, state.r, 0.0, 1.0);\r
}\r
\`;\r
\r
const markFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D tField;\r
uniform sampler2D tAtlas;\r
uniform vec2 uOrigin;\r
uniform vec2 uPitch;\r
uniform vec2 uGrid;\r
uniform int uPattern;\r
uniform float uMarkSize;\r
uniform float uStroke;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec4 uBackground;\r
uniform vec3 uAtlas;\r
out vec4 fragColor;\r
\r
float box(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
float coverage(vec2 local, float level) {\r
  float span = uPitch.y * uMarkSize;\r
  float area = max(sqrt(level), 0.14);\r
  if (uPattern == 0) {\r
    return clamp(0.5 - (length(local) - 0.5 * span * area), 0.0, 1.0);\r
  }\r
  if (uPattern == 1) {\r
    float extent = 0.5 * span * area;\r
    return clamp(0.5 - box(local, vec2(extent), extent * 0.3), 0.0, 1.0);\r
  }\r
  if (uPattern == 2) {\r
    float arm = 0.5 * span * mix(0.3, 1.0, level);\r
    float width = 0.5 * uStroke;\r
    return clamp(0.5 - min(box(local, vec2(arm, width), width), box(local, vec2(width, arm), width)), 0.0, 1.0);\r
  }\r
  if (uAtlas.z < 1.0) return 0.0;\r
  vec2 g = local / span + 0.5;\r
  if (g.x < 0.0 || g.y < 0.0 || g.x > 1.0 || g.y > 1.0) return 0.0;\r
  float index = min(floor(level * uAtlas.z), uAtlas.z - 1.0);\r
  vec2 tile = vec2(mod(index, uAtlas.x), floor(index / uAtlas.x));\r
  vec2 atlasUv = (tile + vec2(g.x, 1.0 - g.y)) / uAtlas.xy;\r
  vec2 texel = 1.0 / (span * uAtlas.xy);\r
  return textureGrad(tAtlas, atlasUv, vec2(texel.x, 0.0), vec2(0.0, texel.y)).a;\r
}\r
\r
vec4 lineInk(vec2 rel) {\r
  float fx = rel.x / uPitch.x - 0.5;\r
  float c0 = clamp(floor(fx), 0.0, uGrid.x - 1.0);\r
  float c1 = min(c0 + 1.0, uGrid.x - 1.0);\r
  float t = clamp(fx - c0, 0.0, 1.0);\r
  float row = floor(rel.y / uPitch.y);\r
  vec4 ink = vec4(0.0);\r
  for (int k = -1; k <= 1; k++) {\r
    float cy = row + float(k);\r
    if (cy < 0.0 || cy >= uGrid.y) continue;\r
    vec4 a = texelFetch(tField, ivec2(int(c0), int(cy)), 0);\r
    vec4 b = texelFetch(tField, ivec2(int(c1), int(cy)), 0);\r
    vec4 f = mix(a, b, t);\r
    if (f.g < 0.002) continue;\r
    float y = (cy + 0.5 + f.a - 0.5) * uPitch.y;\r
    float slope = (b.a - a.a) * uPitch.y / uPitch.x;\r
    float thickness = max(uStroke, uPitch.y * uMarkSize * f.r);\r
    float d = abs(rel.y - y) / sqrt(1.0 + slope * slope) - 0.5 * thickness;\r
    float alpha = clamp(0.5 - d, 0.0, 1.0) * f.g;\r
    if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);\r
  }\r
  return ink;\r
}\r
\r
void main() {\r
  vec2 rel = gl_FragCoord.xy - uOrigin;\r
  vec4 background = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  vec4 ink = vec4(0.0);\r
  if (uPattern == 3) {\r
    ink = lineInk(rel);\r
  } else {\r
    float cx = floor(rel.x / uPitch.x);\r
    float row = floor(rel.y / uPitch.y);\r
    if (cx >= 0.0 && cx < uGrid.x) {\r
      for (int k = -1; k <= 1; k++) {\r
        float cy = row + float(k);\r
        if (cy < 0.0 || cy >= uGrid.y) continue;\r
        vec4 f = texelFetch(tField, ivec2(int(cx), int(cy)), 0);\r
        if (f.g < 0.002) continue;\r
        vec2 center = (vec2(cx, cy) + 0.5) * uPitch + vec2(0.0, (f.a - 0.5) * uPitch.y);\r
        float alpha = coverage(rel - center, f.r) * f.g;\r
        if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);\r
      }\r
    }\r
  }\r
  fragColor = ink + background * (1.0 - ink.a);\r
}\r
\`;\r
\r
const PatternWaves = ({\r
  preset = 'silk',\r
  pattern,\r
  wave,\r
  spacing,\r
  markSize,\r
  depth,\r
  light,\r
  shine,\r
  contrast,\r
  speed,\r
  scale,\r
  direction,\r
  color = '#ffffff',\r
  backgroundColor = '#000000',\r
  opacity = 1,\r
  fade = 'edges',\r
  fadeSize = 0.5,\r
  characters = DEFAULT_CHARACTERS,\r
  interactive = true,\r
  cursorSize = 50,\r
  cursorStrength = 0.6,\r
  intro = true,\r
  paused = false,\r
  className = '',\r
  style\r
}: PatternWavesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
\r
  const base = SURFACE_PRESETS[preset] || SURFACE_PRESETS.silk;\r
  const pick = <K extends keyof PresetValues>(value: PresetValues[K] | undefined, key: K): PresetValues[K] =>\r
    value === undefined || value === null ? base[key] : value;\r
\r
  const colors = useMemo(\r
    () => ({\r
      color: parseColor(color, [1, 1, 1, 1]),\r
      background: parseColor(backgroundColor, [0, 0, 0, 1])\r
    }),\r
    [color, backgroundColor]\r
  );\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      pattern: pick(pattern, 'pattern'),\r
      wave: pick(wave, 'wave'),\r
      spacing: pick(spacing, 'spacing'),\r
      markSize: pick(markSize, 'markSize'),\r
      depth: pick(depth, 'depth'),\r
      light: pick(light, 'light'),\r
      shine: pick(shine, 'shine'),\r
      contrast: pick(contrast, 'contrast'),\r
      speed: pick(speed, 'speed'),\r
      scale: pick(scale, 'scale'),\r
      direction: pick(direction, 'direction'),\r
      opacity,\r
      fade,\r
      fadeSize,\r
      characters,\r
      interactive,\r
      cursorSize,\r
      cursorStrength,\r
      intro,\r
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
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
\r
    const dispose = (target: RenderTarget) => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
\r
    const fieldTargetFor = (w: number, h: number) =>\r
      new RenderTarget(gl, { width: w, height: h, depth: false, minFilter: gl.NEAREST, magFilter: gl.NEAREST });\r
\r
    const rippleTargetFor = (w: number, h: number) =>\r
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
    let fieldTarget = fieldTargetFor(1, 1);\r
    let ripple: RippleField | null = null;\r
\r
    const atlasTexture = new Texture(gl, {\r
      generateMipmaps: true,\r
      minFilter: gl.LINEAR_MIPMAP_LINEAR,\r
      magFilter: gl.LINEAR,\r
      flipY: false\r
    });\r
\r
    const fieldUniforms = {\r
      uSize: { value: [1, 1] },\r
      uDpr: { value: 1 },\r
      uOrigin: { value: [0, 0] },\r
      uPitch: { value: [1, 1] },\r
      uWave: { value: 0 },\r
      uTime: { value: 0 },\r
      uUnit: { value: WAVE_UNIT },\r
      uHeading: { value: [1, 0] },\r
      uAmp: { value: 0 },\r
      uDepth: { value: 0.5 },\r
      uLight: { value: [0, 0, 1] },\r
      uShine: { value: 0.8 },\r
      uContrast: { value: 1 },\r
      uInk: { value: 0 },\r
      uOpacity: { value: 1 },\r
      uFade: { value: 0 },\r
      uFadeSize: { value: 0.5 },\r
      uAppear: { value: 0 },\r
      tRipple: { value: blank },\r
      uRipple: { value: 0 }\r
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
    const rippleUniforms = {\r
      tState: { value: blank },\r
      uTexel: { value: [1, 1] },\r
      uSize: { value: [1, 1] },\r
      uFrom: { value: [0, 0] },\r
      uTo: { value: [0, 0] },\r
      uRadius: { value: 40 },\r
      uImpulse: { value: 0 },\r
      uDamping: { value: 0.975 }\r
    };\r
    const rippleMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: rippleFragment,\r
        uniforms: rippleUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const markUniforms = {\r
      tField: { value: fieldTarget.texture },\r
      tAtlas: { value: atlasTexture },\r
      uOrigin: { value: [0, 0] },\r
      uPitch: { value: [1, 1] },\r
      uGrid: { value: [1, 1] },\r
      uPattern: { value: 0 },\r
      uMarkSize: { value: 0.9 },\r
      uStroke: { value: 2 },\r
      uColor: { value: [1, 1, 1] },\r
      uAccent: { value: [1, 1, 1] },\r
      uBackground: { value: [0, 0, 0, 1] },\r
      uAtlas: { value: [1, 1, 0] }\r
    };\r
    const markMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: markFragment,\r
        uniforms: markUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
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
    let dirty = true;\r
    let rippleUntil = 0;\r
    let rippleLive = false;\r
    let rippleClock = 0;\r
    let atlasKey = '';\r
    const pointer = { x: 0, y: 0, inside: false, placed: false, lastX: 0, lastY: 0, burst: 0 };\r
\r
    const buildRipple = () => {\r
      if (!floatTargets) return;\r
      const w = clamp(Math.ceil(width / RIPPLE_CELL), 4, 512);\r
      const h = clamp(Math.ceil(height / RIPPLE_CELL), 4, 512);\r
      if (ripple && ripple.width === w && ripple.height === h) return;\r
      if (ripple) {\r
        dispose(ripple.read);\r
        dispose(ripple.write);\r
      }\r
      ripple = { width: w, height: h, read: rippleTargetFor(w, h), write: rippleTargetFor(w, h) };\r
      rippleLive = false;\r
    };\r
\r
    const clearRipple = () => {\r
      if (!ripple) return;\r
      [ripple.read, ripple.write].forEach(target => {\r
        renderer.bindFramebuffer(target);\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
      });\r
      renderer.bindFramebuffer();\r
    };\r
\r
    const refreshAtlas = (s: Settings) => {\r
      if (s.characters === atlasKey) return;\r
      atlasKey = s.characters;\r
      const built = buildAtlas(s.characters);\r
      if (!built) return;\r
      atlasTexture.image = built.canvas;\r
      markUniforms.uAtlas.value = [built.columns, built.lines, built.count];\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      buildRipple();\r
      dirty = true;\r
      start();\r
    };\r
\r
    const stepRipple = (field: RippleField, s: Settings, dt: number) => {\r
      rippleClock = Math.min(rippleClock + dt * RIPPLE_RATE, 4);\r
      const strength = clamp(s.cursorStrength, 0, 1);\r
      const moved = Math.hypot(pointer.x - pointer.lastX, pointer.y - pointer.lastY);\r
      let impulse = (pointer.inside ? Math.min(moved / 14, 1) * 0.35 * strength : 0) + pointer.burst * strength;\r
      pointer.burst = 0;\r
      rippleUniforms.uTexel.value = [1 / field.width, 1 / field.height];\r
      rippleUniforms.uSize.value = [width, height];\r
      rippleUniforms.uFrom.value = [pointer.lastX, height - pointer.lastY];\r
      rippleUniforms.uTo.value = [pointer.x, height - pointer.y];\r
      rippleUniforms.uRadius.value = clamp(s.cursorSize, 8, 400);\r
      while (rippleClock >= 1) {\r
        rippleClock -= 1;\r
        rippleUniforms.tState.value = field.read.texture;\r
        rippleUniforms.uImpulse.value = impulse;\r
        renderer.render({ scene: rippleMesh, target: field.write, clear: false });\r
        const next = field.read;\r
        field.read = field.write;\r
        field.write = next;\r
        impulse = 0;\r
      }\r
      pointer.lastX = pointer.x;\r
      pointer.lastY = pointer.y;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      const moving = !s.paused && !reducedMotion && s.speed !== 0;\r
      if (moving) time += dt * s.speed;\r
      introClock = s.intro && !reducedMotion ? Math.min(1, introClock + dt / INTRO_SECONDS) : 1;\r
      const appear = 1 - Math.pow(1 - clamp(introClock / 0.75, 0, 1), 3);\r
      const rise = clamp((introClock - 0.1) / 0.9, 0, 1);\r
      const amp = rise * rise * (3 - 2 * rise);\r
\r
      const rippling = s.interactive && !reducedMotion && !!ripple && s.cursorStrength > 0;\r
      if (rippling && pointer.inside && !pointer.placed) {\r
        pointer.lastX = pointer.x;\r
        pointer.lastY = pointer.y;\r
        pointer.placed = true;\r
      }\r
      if (rippling && (pointer.inside || pointer.burst > 0)) rippleUntil = now + 5000;\r
      const rippleActive = rippling && now < rippleUntil;\r
      if (rippleActive && ripple) {\r
        stepRipple(ripple, s, dt);\r
        rippleLive = true;\r
      } else if (rippleLive) {\r
        clearRipple();\r
        rippleLive = false;\r
      }\r
\r
      const patternIndex = PATTERNS[s.pattern] ?? 0;\r
      if (patternIndex === 4) refreshAtlas(s);\r
\r
      const canvasW = gl.canvas.width;\r
      const canvasH = gl.canvas.height;\r
      const dpr = canvasW / width;\r
      const pitchY = Math.max(4, Math.round(clamp(s.spacing, 4, 120) * dpr));\r
      const pitchX = patternIndex === 3 ? Math.max(2, Math.round(pitchY / 4)) : pitchY;\r
      const cols = Math.min(4096, Math.ceil(canvasW / pitchX) + 1);\r
      const rows = Math.min(4096, Math.ceil(canvasH / pitchY) + 2);\r
      const origin = [Math.floor((canvasW - cols * pitchX) / 2), Math.floor((canvasH - rows * pitchY) / 2)];\r
      if (fieldTarget.width !== cols || fieldTarget.height !== rows) {\r
        dispose(fieldTarget);\r
        fieldTarget = fieldTargetFor(cols, rows);\r
        markUniforms.tField.value = fieldTarget.texture;\r
      }\r
      const heading = (s.direction * Math.PI) / 180;\r
      const lightAngle = ((s.direction + 180 + clamp(s.light, -90, 90)) * Math.PI) / 180;\r
      const background = s.background;\r
      const ink = background[3] > 0.02 ? luminance(s.color) < luminance(background) : luminance(s.color) < 0.5;\r
\r
      fieldUniforms.uSize.value = [width, height];\r
      fieldUniforms.uDpr.value = dpr;\r
      fieldUniforms.uOrigin.value = origin;\r
      fieldUniforms.uPitch.value = [pitchX, pitchY];\r
      fieldUniforms.uWave.value = WAVES[s.wave] ?? 0;\r
      fieldUniforms.uTime.value = time;\r
      fieldUniforms.uUnit.value = WAVE_UNIT * clamp(s.scale, 0.2, 5);\r
      fieldUniforms.uHeading.value = [Math.cos(heading), Math.sin(heading)];\r
      fieldUniforms.uAmp.value = amp;\r
      fieldUniforms.uDepth.value = clamp(s.depth, 0, 1.5);\r
      fieldUniforms.uLight.value = [Math.cos(lightAngle) * 0.78, Math.sin(lightAngle) * 0.78, 0.62];\r
      fieldUniforms.uShine.value = clamp(s.shine, 0, 2);\r
      fieldUniforms.uContrast.value = clamp(s.contrast, 0.3, 3);\r
      fieldUniforms.uInk.value = ink ? 1 : 0;\r
      fieldUniforms.uOpacity.value = clamp(s.opacity, 0, 1);\r
      fieldUniforms.uFade.value = FADES[s.fade] ?? 0;\r
      fieldUniforms.uFadeSize.value = clamp(s.fadeSize, 0.05, 1);\r
      fieldUniforms.uAppear.value = appear;\r
      fieldUniforms.tRipple.value = ripple && rippleLive ? ripple.read.texture : blank;\r
      fieldUniforms.uRipple.value = rippleLive ? 0.32 : 0;\r
      renderer.render({ scene: fieldMesh, target: fieldTarget });\r
\r
      markUniforms.uOrigin.value = origin;\r
      markUniforms.uPitch.value = [pitchX, pitchY];\r
      markUniforms.uGrid.value = [cols, rows];\r
      markUniforms.uPattern.value = patternIndex;\r
      markUniforms.uMarkSize.value = clamp(s.markSize, 0.05, 1);\r
      markUniforms.uStroke.value = patternIndex === 3 ? 0.9 * dpr : Math.max(1.1 * dpr, pitchY * 0.08);\r
      const tint = ink ? 0 : 1;\r
      const blend = ink ? 0.35 : 0.55;\r
      markUniforms.uColor.value = s.color.slice(0, 3);\r
      markUniforms.uAccent.value = s.color.slice(0, 3).map(channel => channel + (tint - channel) * blend);\r
      markUniforms.uBackground.value = background;\r
      renderer.render({ scene: markMesh });\r
      dirty = false;\r
\r
      if (visible && (moving || introClock < 1 || rippleActive || dirty)) raf = requestAnimationFrame(frame);\r
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
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (e: PointerEvent) => {\r
      const spot = locate(e);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      if (spot.inside !== pointer.inside) pointer.placed = false;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) start();\r
    };\r
\r
    const onPointerDown = (e: PointerEvent) => {\r
      const spot = locate(e);\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      if (!pointer.inside) {\r
        pointer.lastX = spot.x;\r
        pointer.lastY = spot.y;\r
      }\r
      pointer.burst = 1.2;\r
      start();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      pointer.placed = false;\r
      start();\r
    };\r
\r
    const onPointerOut = (e: PointerEvent) => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onPointerUp = (e: PointerEvent) => {\r
      if (e.pointerType === 'touch') onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
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
    wakeRef.current = () => {\r
      dirty = true;\r
      start();\r
    };\r
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
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      if (ripple) {\r
        dispose(ripple.read);\r
        dispose(ripple.write);\r
      }\r
      dispose(fieldTarget);\r
      gl.deleteTexture(atlasTexture.texture);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`pattern-waves \${className}\`.trim()} style={style} />;\r
};\r
\r
export default PatternWaves;\r
`,i=`'use client';\r
\r
import { useEffect, useMemo, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import { Renderer, Program, Mesh, Triangle, RenderTarget, Texture } from 'ogl';\r
\r
type SurfacePreset = 'silk' | 'ocean' | 'pond' | 'lines' | 'terminal' | 'mesh';\r
type PatternKind = 'dot' | 'square' | 'plus' | 'line' | 'glyph';\r
type WaveKind = 'silk' | 'swell' | 'ripple';\r
type FadeKind = 'edges' | 'center' | 'bottom' | 'top' | 'none';\r
type Rgba = [number, number, number, number];\r
\r
interface PresetValues {\r
  pattern: PatternKind;\r
  wave: WaveKind;\r
  spacing: number;\r
  markSize: number;\r
  depth: number;\r
  light: number;\r
  shine: number;\r
  contrast: number;\r
  speed: number;\r
  scale: number;\r
  direction: number;\r
}\r
\r
export interface PatternWavesProps extends Partial<PresetValues> {\r
  preset?: SurfacePreset;\r
  color?: string;\r
  backgroundColor?: string;\r
  opacity?: number;\r
  fade?: FadeKind;\r
  fadeSize?: number;\r
  characters?: string;\r
  interactive?: boolean;\r
  cursorSize?: number;\r
  cursorStrength?: number;\r
  intro?: boolean;\r
  paused?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings extends PresetValues {\r
  color: Rgba;\r
  background: Rgba;\r
  opacity: number;\r
  fade: FadeKind;\r
  fadeSize: number;\r
  characters: string;\r
  interactive: boolean;\r
  cursorSize: number;\r
  cursorStrength: number;\r
  intro: boolean;\r
  paused: boolean;\r
}\r
\r
interface RippleField {\r
  width: number;\r
  height: number;\r
  read: RenderTarget;\r
  write: RenderTarget;\r
}\r
\r
const SURFACE_PRESETS: Record<SurfacePreset, PresetValues> = {\r
  silk: {\r
    pattern: 'dot',\r
    wave: 'silk',\r
    spacing: 9,\r
    markSize: 0.95,\r
    depth: 0.95,\r
    light: 0,\r
    shine: 0.8,\r
    contrast: 1.2,\r
    speed: 0.35,\r
    scale: 1,\r
    direction: 20\r
  },\r
  ocean: {\r
    pattern: 'dot',\r
    wave: 'swell',\r
    spacing: 10,\r
    markSize: 0.9,\r
    depth: 0.42,\r
    light: 0,\r
    shine: 1,\r
    contrast: 1.2,\r
    speed: 0.5,\r
    scale: 1,\r
    direction: 100\r
  },\r
  pond: {\r
    pattern: 'dot',\r
    wave: 'ripple',\r
    spacing: 10,\r
    markSize: 0.9,\r
    depth: 0.55,\r
    light: 0,\r
    shine: 1.2,\r
    contrast: 1.2,\r
    speed: 0.5,\r
    scale: 1,\r
    direction: 35\r
  },\r
  lines: {\r
    pattern: 'line',\r
    wave: 'silk',\r
    spacing: 12,\r
    markSize: 0.42,\r
    depth: 0.9,\r
    light: 0,\r
    shine: 0.6,\r
    contrast: 1.2,\r
    speed: 0.3,\r
    scale: 1,\r
    direction: 20\r
  },\r
  terminal: {\r
    pattern: 'glyph',\r
    wave: 'ripple',\r
    spacing: 13,\r
    markSize: 0.95,\r
    depth: 0.75,\r
    light: 0,\r
    shine: 0.9,\r
    contrast: 1.4,\r
    speed: 0.3,\r
    scale: 1.1,\r
    direction: 200\r
  },\r
  mesh: {\r
    pattern: 'plus',\r
    wave: 'silk',\r
    spacing: 14,\r
    markSize: 0.8,\r
    depth: 0.95,\r
    light: 0,\r
    shine: 1,\r
    contrast: 1.45,\r
    speed: 0.4,\r
    scale: 1.1,\r
    direction: 325\r
  }\r
};\r
\r
const PATTERNS: Record<string, number> = { dot: 0, square: 1, plus: 2, line: 3, glyph: 4 };\r
const WAVES: Record<string, number> = { silk: 0, swell: 1, ripple: 2 };\r
const FADES: Record<string, number> = { none: 0, edges: 1, center: 2, bottom: 3, top: 4 };\r
const DEFAULT_CHARACTERS = '.:-=+*#%@';\r
const GLYPH_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';\r
const ATLAS_TILE = 128;\r
const WAVE_UNIT = 520;\r
const RIPPLE_CELL = 8;\r
const RIPPLE_RATE = 60;\r
const PIXEL_BUDGET = 4.5e6;\r
const INTRO_SECONDS = 2;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);\r
\r
const luminance = (rgba: number[]) => 0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2];\r
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
const buildAtlas = (characters: string) => {\r
  const glyphs = Array.from(characters && characters.length ? characters : DEFAULT_CHARACTERS);\r
  const columns = Math.ceil(Math.sqrt(glyphs.length));\r
  const lines = Math.ceil(glyphs.length / columns);\r
  const canvas = document.createElement('canvas');\r
  canvas.width = columns * ATLAS_TILE;\r
  canvas.height = lines * ATLAS_TILE;\r
  const ctx = canvas.getContext('2d');\r
  if (!ctx) return null;\r
  ctx.fillStyle = '#ffffff';\r
  ctx.textAlign = 'center';\r
  ctx.textBaseline = 'middle';\r
  ctx.font = \`500 \${Math.round(ATLAS_TILE * 0.86)}px \${GLYPH_FONT}\`;\r
  glyphs.forEach((glyph, index) => {\r
    const x = (index % columns) * ATLAS_TILE + ATLAS_TILE / 2;\r
    const y = Math.floor(index / columns) * ATLAS_TILE + ATLAS_TILE / 2;\r
    ctx.fillText(glyph, x, y);\r
  });\r
  return { canvas, columns, lines, count: glyphs.length };\r
};\r
\r
const passVertex = \`#version 300 es\r
in vec2 position;\r
void main() {\r
  gl_Position = vec4(position, 0.0, 1.0);\r
}\r
\`;\r
\r
const fieldFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform vec2 uSize;\r
uniform float uDpr;\r
uniform vec2 uOrigin;\r
uniform vec2 uPitch;\r
uniform int uWave;\r
uniform float uTime;\r
uniform float uUnit;\r
uniform vec2 uHeading;\r
uniform float uAmp;\r
uniform float uDepth;\r
uniform vec3 uLight;\r
uniform float uShine;\r
uniform float uContrast;\r
uniform float uInk;\r
uniform float uOpacity;\r
uniform int uFade;\r
uniform float uFadeSize;\r
uniform float uAppear;\r
uniform sampler2D tRipple;\r
uniform float uRipple;\r
out vec4 fragColor;\r
\r
const float FOLDS = 5.5;\r
\r
uvec3 scramble(uvec3 v) {\r
  v = v * 1664525u + 1013904223u;\r
  v.x += v.y * v.z;\r
  v.y += v.z * v.x;\r
  v.z += v.x * v.y;\r
  v ^= v >> 16u;\r
  v.x += v.y * v.z;\r
  v.y += v.z * v.x;\r
  v.z += v.x * v.y;\r
  return v;\r
}\r
\r
vec3 lattice(vec3 corner) {\r
  uvec3 h = scramble(uvec3(ivec3(corner) + 4096));\r
  return vec3(h & 65535u) / 32767.5 - 1.0;\r
}\r
\r
float gradientNoise(vec3 p) {\r
  vec3 i = floor(p);\r
  vec3 f = p - i;\r
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);\r
  float n000 = dot(lattice(i), f);\r
  float n100 = dot(lattice(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));\r
  float n010 = dot(lattice(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));\r
  float n110 = dot(lattice(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));\r
  float n001 = dot(lattice(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));\r
  float n101 = dot(lattice(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));\r
  float n011 = dot(lattice(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));\r
  float n111 = dot(lattice(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));\r
  return mix(\r
    mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),\r
    mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),\r
    u.z\r
  );\r
}\r
\r
vec2 turn(vec2 v, float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);\r
}\r
\r
float surface(vec2 p, float t) {\r
  if (uWave == 0) {\r
    vec2 side = vec2(-uHeading.y, uHeading.x);\r
    float u = dot(p, uHeading);\r
    float v = dot(p, side);\r
    float bend = gradientNoise(vec3(v * 0.85, u * 0.3, t * 0.05)) * 1.7 + 0.4 * sin(v * 1.6 + t * 0.2);\r
    float phase = u * FOLDS + bend - t * 0.45;\r
    float swell = 0.6 + 0.4 * gradientNoise(vec3(u * 0.55 + 3.0, v * 0.45, t * 0.04));\r
    float fold = sin(phase) + 0.32 * sin(2.0 * phase + 1.3);\r
    float ripple = 0.16 * sin(u * FOLDS * 2.5 + bend * 1.9 - t * 0.9 + 2.1);\r
    return (fold + ripple) * swell;\r
  }\r
  if (uWave == 1) {\r
    float bend = gradientNoise(vec3(p * 0.6, t * 0.05)) * 0.6;\r
    float phase = dot(p, uHeading) * 15.0 + bend * 2.2 - t * 1.4;\r
    float swell = sin(phase) + 0.3 * sin(2.0 * phase - 0.8);\r
    float roll = 0.75 + 0.25 * gradientNoise(vec3(p * 0.9 + 11.0, t * 0.05));\r
    return 0.8 * swell * roll;\r
  }\r
  float r = length(p + uHeading * 1.2);\r
  float bend = gradientNoise(vec3(p * 1.2, t * 0.05)) * 0.1;\r
  return sin((r + bend) * 9.0 - t * 1.8) * (0.45 + 0.55 * exp(-(r - 0.6) * 0.8));\r
}\r
\r
float heightAt(vec2 css) {\r
  float h = surface((css - 0.5 * uSize) / uUnit, uTime) * uAmp;\r
  if (uRipple > 0.0) h += texture(tRipple, css / uSize).r * uRipple;\r
  return h;\r
}\r
\r
void main() {\r
  vec2 cell = floor(gl_FragCoord.xy);\r
  vec2 center = uOrigin + (cell + 0.5) * uPitch;\r
  vec2 css = center / uDpr;\r
  vec2 uv = css / uSize;\r
  float e = max(uPitch.y / uDpr, 4.0);\r
  float h = heightAt(css);\r
  float hx = (heightAt(css + vec2(e, 0.0)) - heightAt(css - vec2(e, 0.0))) / (2.0 * e);\r
  float hy = (heightAt(css + vec2(0.0, e)) - heightAt(css - vec2(0.0, e))) / (2.0 * e);\r
  vec2 grad = vec2(hx, hy) * uUnit * uDepth * 0.4;\r
  vec3 n = normalize(vec3(-grad, 1.0));\r
\r
  float diffuse = clamp(dot(n, uLight), 0.0, 1.0);\r
  vec3 halfway = normalize(uLight + vec3(0.0, 0.0, 1.0));\r
  float spec = pow(clamp(dot(n, halfway), 0.0, 1.0), 160.0) * uShine * 1.15;\r
  float hollow = 0.7 + 0.3 * clamp(h * 0.5 + 0.5, 0.0, 1.0);\r
  float tone = clamp(diffuse * hollow * 0.78 + spec, 0.0, 1.0);\r
  tone = clamp((tone - 0.42) * uContrast + 0.42, 0.0, 1.0);\r
\r
  float level = uInk > 0.5 ? pow(clamp(1.0 - tone / 0.46, 0.0, 1.0), 2.4) * 0.72 : pow(tone, 2.2);\r
  float emphasis = uInk > 0.5 ? smoothstep(0.55, 0.95, level) : clamp(spec * 1.6, 0.0, 1.0);\r
\r
  float fade = 1.0;\r
  vec2 c = uv * 2.0 - 1.0;\r
  if (uFade == 1) {\r
    fade = 1.0 - smoothstep(1.0 - uFadeSize, 1.18, length(c));\r
  } else if (uFade == 2) {\r
    fade = mix(0.05, 1.0, smoothstep(0.08, 0.08 + uFadeSize, length(c * vec2(1.0, 1.35))));\r
  } else if (uFade == 3) {\r
    fade = smoothstep(0.0, uFadeSize, uv.y);\r
  } else if (uFade == 4) {\r
    fade = smoothstep(0.0, uFadeSize, 1.0 - uv.y);\r
  }\r
\r
  float reach = length(css - 0.5 * uSize) / max(0.5 * length(uSize), 1.0);\r
  float appear = smoothstep(reach - 0.05, reach + 0.3, uAppear * 1.35);\r
\r
  float alpha = uOpacity * fade * appear * (0.22 + 0.78 * level);\r
  float lift = clamp(h * uDepth * 0.42, -0.48, 0.48);\r
  fragColor = vec4(level, alpha, emphasis, lift + 0.5);\r
}\r
\`;\r
\r
const rippleFragment = \`#version 300 es\r
precision highp float;\r
uniform sampler2D tState;\r
uniform vec2 uTexel;\r
uniform vec2 uSize;\r
uniform vec2 uFrom;\r
uniform vec2 uTo;\r
uniform float uRadius;\r
uniform float uImpulse;\r
uniform float uDamping;\r
out vec4 fragColor;\r
\r
void main() {\r
  vec2 uv = gl_FragCoord.xy * uTexel;\r
  vec2 state = texture(tState, uv).rg;\r
  float left = texture(tState, uv - vec2(uTexel.x, 0.0)).r;\r
  float right = texture(tState, uv + vec2(uTexel.x, 0.0)).r;\r
  float below = texture(tState, uv - vec2(0.0, uTexel.y)).r;\r
  float above = texture(tState, uv + vec2(0.0, uTexel.y)).r;\r
  float next = ((left + right + below + above) * 0.5 - state.g) * uDamping;\r
  vec2 p = uv * uSize;\r
  vec2 segment = uTo - uFrom;\r
  float along = clamp(dot(p - uFrom, segment) / max(dot(segment, segment), 1e-4), 0.0, 1.0);\r
  float d = length(p - uFrom - segment * along) / uRadius;\r
  next -= uImpulse * exp(-d * d * 2.0);\r
  fragColor = vec4(next, state.r, 0.0, 1.0);\r
}\r
\`;\r
\r
const markFragment = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D tField;\r
uniform sampler2D tAtlas;\r
uniform vec2 uOrigin;\r
uniform vec2 uPitch;\r
uniform vec2 uGrid;\r
uniform int uPattern;\r
uniform float uMarkSize;\r
uniform float uStroke;\r
uniform vec3 uColor;\r
uniform vec3 uAccent;\r
uniform vec4 uBackground;\r
uniform vec3 uAtlas;\r
out vec4 fragColor;\r
\r
float box(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
float coverage(vec2 local, float level) {\r
  float span = uPitch.y * uMarkSize;\r
  float area = max(sqrt(level), 0.14);\r
  if (uPattern == 0) {\r
    return clamp(0.5 - (length(local) - 0.5 * span * area), 0.0, 1.0);\r
  }\r
  if (uPattern == 1) {\r
    float extent = 0.5 * span * area;\r
    return clamp(0.5 - box(local, vec2(extent), extent * 0.3), 0.0, 1.0);\r
  }\r
  if (uPattern == 2) {\r
    float arm = 0.5 * span * mix(0.3, 1.0, level);\r
    float width = 0.5 * uStroke;\r
    return clamp(0.5 - min(box(local, vec2(arm, width), width), box(local, vec2(width, arm), width)), 0.0, 1.0);\r
  }\r
  if (uAtlas.z < 1.0) return 0.0;\r
  vec2 g = local / span + 0.5;\r
  if (g.x < 0.0 || g.y < 0.0 || g.x > 1.0 || g.y > 1.0) return 0.0;\r
  float index = min(floor(level * uAtlas.z), uAtlas.z - 1.0);\r
  vec2 tile = vec2(mod(index, uAtlas.x), floor(index / uAtlas.x));\r
  vec2 atlasUv = (tile + vec2(g.x, 1.0 - g.y)) / uAtlas.xy;\r
  vec2 texel = 1.0 / (span * uAtlas.xy);\r
  return textureGrad(tAtlas, atlasUv, vec2(texel.x, 0.0), vec2(0.0, texel.y)).a;\r
}\r
\r
vec4 lineInk(vec2 rel) {\r
  float fx = rel.x / uPitch.x - 0.5;\r
  float c0 = clamp(floor(fx), 0.0, uGrid.x - 1.0);\r
  float c1 = min(c0 + 1.0, uGrid.x - 1.0);\r
  float t = clamp(fx - c0, 0.0, 1.0);\r
  float row = floor(rel.y / uPitch.y);\r
  vec4 ink = vec4(0.0);\r
  for (int k = -1; k <= 1; k++) {\r
    float cy = row + float(k);\r
    if (cy < 0.0 || cy >= uGrid.y) continue;\r
    vec4 a = texelFetch(tField, ivec2(int(c0), int(cy)), 0);\r
    vec4 b = texelFetch(tField, ivec2(int(c1), int(cy)), 0);\r
    vec4 f = mix(a, b, t);\r
    if (f.g < 0.002) continue;\r
    float y = (cy + 0.5 + f.a - 0.5) * uPitch.y;\r
    float slope = (b.a - a.a) * uPitch.y / uPitch.x;\r
    float thickness = max(uStroke, uPitch.y * uMarkSize * f.r);\r
    float d = abs(rel.y - y) / sqrt(1.0 + slope * slope) - 0.5 * thickness;\r
    float alpha = clamp(0.5 - d, 0.0, 1.0) * f.g;\r
    if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);\r
  }\r
  return ink;\r
}\r
\r
void main() {\r
  vec2 rel = gl_FragCoord.xy - uOrigin;\r
  vec4 background = vec4(uBackground.rgb * uBackground.a, uBackground.a);\r
  vec4 ink = vec4(0.0);\r
  if (uPattern == 3) {\r
    ink = lineInk(rel);\r
  } else {\r
    float cx = floor(rel.x / uPitch.x);\r
    float row = floor(rel.y / uPitch.y);\r
    if (cx >= 0.0 && cx < uGrid.x) {\r
      for (int k = -1; k <= 1; k++) {\r
        float cy = row + float(k);\r
        if (cy < 0.0 || cy >= uGrid.y) continue;\r
        vec4 f = texelFetch(tField, ivec2(int(cx), int(cy)), 0);\r
        if (f.g < 0.002) continue;\r
        vec2 center = (vec2(cx, cy) + 0.5) * uPitch + vec2(0.0, (f.a - 0.5) * uPitch.y);\r
        float alpha = coverage(rel - center, f.r) * f.g;\r
        if (alpha > ink.a) ink = vec4(mix(uColor, uAccent, f.b) * alpha, alpha);\r
      }\r
    }\r
  }\r
  fragColor = ink + background * (1.0 - ink.a);\r
}\r
\`;\r
\r
const PatternWaves = ({\r
  preset = 'silk',\r
  pattern,\r
  wave,\r
  spacing,\r
  markSize,\r
  depth,\r
  light,\r
  shine,\r
  contrast,\r
  speed,\r
  scale,\r
  direction,\r
  color = '#ffffff',\r
  backgroundColor = '#000000',\r
  opacity = 1,\r
  fade = 'edges',\r
  fadeSize = 0.5,\r
  characters = DEFAULT_CHARACTERS,\r
  interactive = true,\r
  cursorSize = 50,\r
  cursorStrength = 0.6,\r
  intro = true,\r
  paused = false,\r
  className = '',\r
  style\r
}: PatternWavesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
\r
  const base = SURFACE_PRESETS[preset] || SURFACE_PRESETS.silk;\r
  const pick = <K extends keyof PresetValues>(value: PresetValues[K] | undefined, key: K): PresetValues[K] =>\r
    value === undefined || value === null ? base[key] : value;\r
\r
  const colors = useMemo(\r
    () => ({\r
      color: parseColor(color, [1, 1, 1, 1]),\r
      background: parseColor(backgroundColor, [0, 0, 0, 1])\r
    }),\r
    [color, backgroundColor]\r
  );\r
\r
  useEffect(() => {\r
    settingsRef.current = {\r
      ...colors,\r
      pattern: pick(pattern, 'pattern'),\r
      wave: pick(wave, 'wave'),\r
      spacing: pick(spacing, 'spacing'),\r
      markSize: pick(markSize, 'markSize'),\r
      depth: pick(depth, 'depth'),\r
      light: pick(light, 'light'),\r
      shine: pick(shine, 'shine'),\r
      contrast: pick(contrast, 'contrast'),\r
      speed: pick(speed, 'speed'),\r
      scale: pick(scale, 'scale'),\r
      direction: pick(direction, 'direction'),\r
      opacity,\r
      fade,\r
      fadeSize,\r
      characters,\r
      interactive,\r
      cursorSize,\r
      cursorStrength,\r
      intro,\r
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
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');\r
\r
    const dispose = (target: RenderTarget) => {\r
      gl.deleteFramebuffer(target.buffer);\r
      gl.deleteTexture(target.texture.texture);\r
    };\r
\r
    const fieldTargetFor = (w: number, h: number) =>\r
      new RenderTarget(gl, { width: w, height: h, depth: false, minFilter: gl.NEAREST, magFilter: gl.NEAREST });\r
\r
    const rippleTargetFor = (w: number, h: number) =>\r
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
    let fieldTarget = fieldTargetFor(1, 1);\r
    let ripple: RippleField | null = null;\r
\r
    const atlasTexture = new Texture(gl, {\r
      generateMipmaps: true,\r
      minFilter: gl.LINEAR_MIPMAP_LINEAR,\r
      magFilter: gl.LINEAR,\r
      flipY: false\r
    });\r
\r
    const fieldUniforms = {\r
      uSize: { value: [1, 1] },\r
      uDpr: { value: 1 },\r
      uOrigin: { value: [0, 0] },\r
      uPitch: { value: [1, 1] },\r
      uWave: { value: 0 },\r
      uTime: { value: 0 },\r
      uUnit: { value: WAVE_UNIT },\r
      uHeading: { value: [1, 0] },\r
      uAmp: { value: 0 },\r
      uDepth: { value: 0.5 },\r
      uLight: { value: [0, 0, 1] },\r
      uShine: { value: 0.8 },\r
      uContrast: { value: 1 },\r
      uInk: { value: 0 },\r
      uOpacity: { value: 1 },\r
      uFade: { value: 0 },\r
      uFadeSize: { value: 0.5 },\r
      uAppear: { value: 0 },\r
      tRipple: { value: blank },\r
      uRipple: { value: 0 }\r
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
    const rippleUniforms = {\r
      tState: { value: blank },\r
      uTexel: { value: [1, 1] },\r
      uSize: { value: [1, 1] },\r
      uFrom: { value: [0, 0] },\r
      uTo: { value: [0, 0] },\r
      uRadius: { value: 40 },\r
      uImpulse: { value: 0 },\r
      uDamping: { value: 0.975 }\r
    };\r
    const rippleMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: rippleFragment,\r
        uniforms: rippleUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
\r
    const markUniforms = {\r
      tField: { value: fieldTarget.texture },\r
      tAtlas: { value: atlasTexture },\r
      uOrigin: { value: [0, 0] },\r
      uPitch: { value: [1, 1] },\r
      uGrid: { value: [1, 1] },\r
      uPattern: { value: 0 },\r
      uMarkSize: { value: 0.9 },\r
      uStroke: { value: 2 },\r
      uColor: { value: [1, 1, 1] },\r
      uAccent: { value: [1, 1, 1] },\r
      uBackground: { value: [0, 0, 0, 1] },\r
      uAtlas: { value: [1, 1, 0] }\r
    };\r
    const markMesh = new Mesh(gl, {\r
      geometry,\r
      program: new Program(gl, {\r
        vertex: passVertex,\r
        fragment: markFragment,\r
        uniforms: markUniforms,\r
        depthTest: false,\r
        depthWrite: false\r
      })\r
    });\r
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
    let dirty = true;\r
    let rippleUntil = 0;\r
    let rippleLive = false;\r
    let rippleClock = 0;\r
    let atlasKey = '';\r
    const pointer = { x: 0, y: 0, inside: false, placed: false, lastX: 0, lastY: 0, burst: 0 };\r
\r
    const buildRipple = () => {\r
      if (!floatTargets) return;\r
      const w = clamp(Math.ceil(width / RIPPLE_CELL), 4, 512);\r
      const h = clamp(Math.ceil(height / RIPPLE_CELL), 4, 512);\r
      if (ripple && ripple.width === w && ripple.height === h) return;\r
      if (ripple) {\r
        dispose(ripple.read);\r
        dispose(ripple.write);\r
      }\r
      ripple = { width: w, height: h, read: rippleTargetFor(w, h), write: rippleTargetFor(w, h) };\r
      rippleLive = false;\r
    };\r
\r
    const clearRipple = () => {\r
      if (!ripple) return;\r
      [ripple.read, ripple.write].forEach(target => {\r
        renderer.bindFramebuffer(target);\r
        gl.viewport(0, 0, target.width, target.height);\r
        gl.clear(gl.COLOR_BUFFER_BIT);\r
      });\r
      renderer.bindFramebuffer();\r
    };\r
\r
    const refreshAtlas = (s: Settings) => {\r
      if (s.characters === atlasKey) return;\r
      atlasKey = s.characters;\r
      const built = buildAtlas(s.characters);\r
      if (!built) return;\r
      atlasTexture.image = built.canvas;\r
      markUniforms.uAtlas.value = [built.columns, built.lines, built.count];\r
    };\r
\r
    const resize = () => {\r
      width = Math.max(1, container.clientWidth);\r
      height = Math.max(1, container.clientHeight);\r
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));\r
      renderer.setSize(width, height);\r
      buildRipple();\r
      dirty = true;\r
      start();\r
    };\r
\r
    const stepRipple = (field: RippleField, s: Settings, dt: number) => {\r
      rippleClock = Math.min(rippleClock + dt * RIPPLE_RATE, 4);\r
      const strength = clamp(s.cursorStrength, 0, 1);\r
      const moved = Math.hypot(pointer.x - pointer.lastX, pointer.y - pointer.lastY);\r
      let impulse = (pointer.inside ? Math.min(moved / 14, 1) * 0.35 * strength : 0) + pointer.burst * strength;\r
      pointer.burst = 0;\r
      rippleUniforms.uTexel.value = [1 / field.width, 1 / field.height];\r
      rippleUniforms.uSize.value = [width, height];\r
      rippleUniforms.uFrom.value = [pointer.lastX, height - pointer.lastY];\r
      rippleUniforms.uTo.value = [pointer.x, height - pointer.y];\r
      rippleUniforms.uRadius.value = clamp(s.cursorSize, 8, 400);\r
      while (rippleClock >= 1) {\r
        rippleClock -= 1;\r
        rippleUniforms.tState.value = field.read.texture;\r
        rippleUniforms.uImpulse.value = impulse;\r
        renderer.render({ scene: rippleMesh, target: field.write, clear: false });\r
        const next = field.read;\r
        field.read = field.write;\r
        field.write = next;\r
        impulse = 0;\r
      }\r
      pointer.lastX = pointer.x;\r
      pointer.lastY = pointer.y;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      if (!s) return;\r
\r
      const moving = !s.paused && !reducedMotion && s.speed !== 0;\r
      if (moving) time += dt * s.speed;\r
      introClock = s.intro && !reducedMotion ? Math.min(1, introClock + dt / INTRO_SECONDS) : 1;\r
      const appear = 1 - Math.pow(1 - clamp(introClock / 0.75, 0, 1), 3);\r
      const rise = clamp((introClock - 0.1) / 0.9, 0, 1);\r
      const amp = rise * rise * (3 - 2 * rise);\r
\r
      const rippling = s.interactive && !reducedMotion && !!ripple && s.cursorStrength > 0;\r
      if (rippling && pointer.inside && !pointer.placed) {\r
        pointer.lastX = pointer.x;\r
        pointer.lastY = pointer.y;\r
        pointer.placed = true;\r
      }\r
      if (rippling && (pointer.inside || pointer.burst > 0)) rippleUntil = now + 5000;\r
      const rippleActive = rippling && now < rippleUntil;\r
      if (rippleActive && ripple) {\r
        stepRipple(ripple, s, dt);\r
        rippleLive = true;\r
      } else if (rippleLive) {\r
        clearRipple();\r
        rippleLive = false;\r
      }\r
\r
      const patternIndex = PATTERNS[s.pattern] ?? 0;\r
      if (patternIndex === 4) refreshAtlas(s);\r
\r
      const canvasW = gl.canvas.width;\r
      const canvasH = gl.canvas.height;\r
      const dpr = canvasW / width;\r
      const pitchY = Math.max(4, Math.round(clamp(s.spacing, 4, 120) * dpr));\r
      const pitchX = patternIndex === 3 ? Math.max(2, Math.round(pitchY / 4)) : pitchY;\r
      const cols = Math.min(4096, Math.ceil(canvasW / pitchX) + 1);\r
      const rows = Math.min(4096, Math.ceil(canvasH / pitchY) + 2);\r
      const origin = [Math.floor((canvasW - cols * pitchX) / 2), Math.floor((canvasH - rows * pitchY) / 2)];\r
      if (fieldTarget.width !== cols || fieldTarget.height !== rows) {\r
        dispose(fieldTarget);\r
        fieldTarget = fieldTargetFor(cols, rows);\r
        markUniforms.tField.value = fieldTarget.texture;\r
      }\r
      const heading = (s.direction * Math.PI) / 180;\r
      const lightAngle = ((s.direction + 180 + clamp(s.light, -90, 90)) * Math.PI) / 180;\r
      const background = s.background;\r
      const ink = background[3] > 0.02 ? luminance(s.color) < luminance(background) : luminance(s.color) < 0.5;\r
\r
      fieldUniforms.uSize.value = [width, height];\r
      fieldUniforms.uDpr.value = dpr;\r
      fieldUniforms.uOrigin.value = origin;\r
      fieldUniforms.uPitch.value = [pitchX, pitchY];\r
      fieldUniforms.uWave.value = WAVES[s.wave] ?? 0;\r
      fieldUniforms.uTime.value = time;\r
      fieldUniforms.uUnit.value = WAVE_UNIT * clamp(s.scale, 0.2, 5);\r
      fieldUniforms.uHeading.value = [Math.cos(heading), Math.sin(heading)];\r
      fieldUniforms.uAmp.value = amp;\r
      fieldUniforms.uDepth.value = clamp(s.depth, 0, 1.5);\r
      fieldUniforms.uLight.value = [Math.cos(lightAngle) * 0.78, Math.sin(lightAngle) * 0.78, 0.62];\r
      fieldUniforms.uShine.value = clamp(s.shine, 0, 2);\r
      fieldUniforms.uContrast.value = clamp(s.contrast, 0.3, 3);\r
      fieldUniforms.uInk.value = ink ? 1 : 0;\r
      fieldUniforms.uOpacity.value = clamp(s.opacity, 0, 1);\r
      fieldUniforms.uFade.value = FADES[s.fade] ?? 0;\r
      fieldUniforms.uFadeSize.value = clamp(s.fadeSize, 0.05, 1);\r
      fieldUniforms.uAppear.value = appear;\r
      fieldUniforms.tRipple.value = ripple && rippleLive ? ripple.read.texture : blank;\r
      fieldUniforms.uRipple.value = rippleLive ? 0.32 : 0;\r
      renderer.render({ scene: fieldMesh, target: fieldTarget });\r
\r
      markUniforms.uOrigin.value = origin;\r
      markUniforms.uPitch.value = [pitchX, pitchY];\r
      markUniforms.uGrid.value = [cols, rows];\r
      markUniforms.uPattern.value = patternIndex;\r
      markUniforms.uMarkSize.value = clamp(s.markSize, 0.05, 1);\r
      markUniforms.uStroke.value = patternIndex === 3 ? 0.9 * dpr : Math.max(1.1 * dpr, pitchY * 0.08);\r
      const tint = ink ? 0 : 1;\r
      const blend = ink ? 0.35 : 0.55;\r
      markUniforms.uColor.value = s.color.slice(0, 3);\r
      markUniforms.uAccent.value = s.color.slice(0, 3).map(channel => channel + (tint - channel) * blend);\r
      markUniforms.uBackground.value = background;\r
      renderer.render({ scene: markMesh });\r
      dirty = false;\r
\r
      if (visible && (moving || introClock < 1 || rippleActive || dirty)) raf = requestAnimationFrame(frame);\r
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
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onPointerMove = (e: PointerEvent) => {\r
      const spot = locate(e);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      if (spot.inside !== pointer.inside) pointer.placed = false;\r
      pointer.inside = spot.inside;\r
      if (spot.inside) start();\r
    };\r
\r
    const onPointerDown = (e: PointerEvent) => {\r
      const spot = locate(e);\r
      if (!spot.inside) return;\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      if (!pointer.inside) {\r
        pointer.lastX = spot.x;\r
        pointer.lastY = spot.y;\r
      }\r
      pointer.burst = 1.2;\r
      start();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      pointer.placed = false;\r
      start();\r
    };\r
\r
    const onPointerOut = (e: PointerEvent) => {\r
      if (!e.relatedTarget) onPointerLeave();\r
    };\r
\r
    const onPointerUp = (e: PointerEvent) => {\r
      if (e.pointerType === 'touch') onPointerLeave();\r
    };\r
\r
    const onVisibility = () => {\r
      if (!document.hidden) start();\r
    };\r
\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerout', onPointerOut, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
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
    wakeRef.current = () => {\r
      dirty = true;\r
      start();\r
    };\r
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
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('blur', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      wakeRef.current = null;\r
      if (ripple) {\r
        dispose(ripple.read);\r
        dispose(ripple.write);\r
      }\r
      dispose(fieldTarget);\r
      gl.deleteTexture(atlasTexture.texture);\r
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
export default PatternWaves;\r
`,a={dependencies:"ogl",usage:`import PatternWaves from './PatternWaves';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <PatternWaves
    preset="silk"
    color="#ffffff"
    backgroundColor="#000000"
    fade="edges"
    interactive
    cursorSize={50}
    cursorStrength={0.6}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:i};export{a as patternWaves};
