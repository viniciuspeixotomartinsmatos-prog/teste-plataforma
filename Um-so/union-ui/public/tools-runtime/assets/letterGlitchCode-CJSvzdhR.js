const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './LetterGlitch.css';\r
\r
const DEFAULT_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789';\r
const DEFAULT_FONT = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";\r
const DARK_COLORS = ['#ffffff', '#61dca3'];\r
const LIGHT_COLORS = ['#18181b', '#0f9f6e'];\r
const MAX_COLORS = 8;\r
const INTRO_SECONDS = 1.4;\r
const REST_RATE = 0.2;\r
const GLITCH_RATE = 0.1;\r
const MAX_WALKERS = 48;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uAtlas;\r
uniform sampler2D uState;\r
uniform ivec2 uCell;\r
uniform ivec2 uGrid;\r
uniform int uAtlasColumns;\r
uniform vec2 uResolution;\r
uniform vec2 uOrigin;\r
uniform vec3 uBase;\r
uniform float uBaseOpacity;\r
uniform vec3 uColors[8];\r
uniform float uEdge;\r
uniform float uCenter;\r
uniform vec2 uPointer;\r
uniform float uRadius;\r
uniform float uPresence;\r
uniform float uReveal;\r
uniform float uTime;\r
uniform float uFlow;\r
uniform float uFlowScale;\r
uniform vec4 uBackground;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 w = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) - uOrigin;\r
  ivec2 q = ivec2(floor(frag));\r
  ivec2 cell = q / uCell;\r
  vec4 color = vec4(0.0);\r
  if (all(greaterThanEqual(q, ivec2(0))) && all(lessThan(cell, uGrid))) {\r
    vec4 state = texelFetch(uState, cell, 0);\r
    int glyph = int(state.r * 255.0 + 0.5);\r
    ivec2 texel = ivec2(glyph % uAtlasColumns, glyph / uAtlasColumns) * uCell + (q - cell * uCell);\r
    float coverage = texelFetch(uAtlas, texel, 0).a;\r
    if (coverage > 0.0) {\r
      vec2 center = vec2(cell * uCell) + vec2(uCell) * 0.5 + uOrigin;\r
      float mask = 1.0;\r
      if (uEdge > 0.0) {\r
        vec2 edge = min(center, uResolution - center) / uEdge;\r
        mask = smoother(edge.x) * smoother(edge.y);\r
      }\r
      if (uCenter > 0.0) {\r
        vec2 room = max(abs(center - uResolution * 0.5) - uResolution * vec2(0.3, 0.24), 0.0);\r
        float soft = min(uResolution.x, uResolution.y) * 0.24;\r
        mask *= 1.0 - uCenter * (1.0 - smoother(length(room) / soft));\r
      }\r
      float seed = hash(vec2(cell) + 17.0);\r
      float rest = state.g * uBaseOpacity * (0.8 + 0.2 * sin(uTime * (0.5 + 1.2 * seed) + seed * 40.0));\r
      if (uFlow > 0.0) {\r
        vec2 p = center / uFlowScale;\r
        float n = 0.65 * noise(p + vec2(uTime * 0.05, uTime * 0.03)) + 0.35 * noise(p * 2.03 - vec2(uTime * 0.04, -uTime * 0.06));\r
        rest *= mix(1.0, 0.1 + 1.7 * smoothstep(0.25, 0.8, n), uFlow);\r
      }\r
      if (uPresence > 0.0) {\r
        float d = length(center - uPointer) / uRadius;\r
        float f = clamp(1.0 - d * d, 0.0, 1.0);\r
        rest = mix(rest, max(rest, uReveal * step(0.004, state.g)), f * f * uPresence);\r
      }\r
      float heat = state.b;\r
      rest = min(rest, 1.0) * (1.0 - heat);\r
      vec3 tint = uColors[int(state.a * 255.0 + 0.5)];\r
      float weight = coverage * mask;\r
      color = vec4((uBase * rest + tint * heat) * weight, (rest + heat) * weight);\r
    }\r
  }\r
  outColor = color + uBackground * (1.0 - color.a);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const smoother = value => {\r
  const x = clamp(value, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;\r
  gl.deleteShader(shader);\r
  return null;\r
};\r
\r
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LetterGlitch = ({\r
  glitchColors,\r
  baseColor,\r
  characters = DEFAULT_CHARACTERS,\r
  fontFamily = DEFAULT_FONT,\r
  fontSize = 14,\r
  spacing = 0.6,\r
  density = 0.9,\r
  baseOpacity = 0.16,\r
  glitchAmount = 0.5,\r
  speed = 1,\r
  smooth = true,\r
  interactive = true,\r
  cursorRadius = 140,\r
  clickEffect = 'tear',\r
  flow = 0.5,\r
  edgeFade = 0,\r
  centerFade = 0,\r
  intro = true,\r
  lightMode = false,\r
  backgroundColor,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const customColors = Array.isArray(glitchColors) && glitchColors.length ? glitchColors : null;\r
  const settings = {\r
    colors: (customColors || (lightMode ? LIGHT_COLORS : DARK_COLORS)).slice(0, MAX_COLORS),\r
    baseColor: baseColor || (lightMode ? '#18181b' : '#ffffff'),\r
    characters: characters || DEFAULT_CHARACTERS,\r
    fontFamily: fontFamily || DEFAULT_FONT,\r
    fontSize: clamp(fontSize, 6, 96),\r
    spacing: clamp(spacing, 0, 2),\r
    density: clamp(density, 0, 1),\r
    baseOpacity: clamp(baseOpacity, 0, 1),\r
    glitchAmount: clamp(glitchAmount, 0, 1),\r
    speed: Math.max(0, speed),\r
    smooth,\r
    interactive,\r
    cursorRadius: Math.max(0, cursorRadius),\r
    clickEffect,\r
    flow: clamp(flow, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 0.5),\r
    centerFade: clamp(centerFade, 0, 1),\r
    intro,\r
    backgroundColor,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
    const vao = gl.createVertexArray();\r
    const makeTexture = () => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      return texture;\r
    };\r
    const atlasTexture = makeTexture();\r
    const stateTexture = makeTexture();\r
    const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);\r
    const atlas = document.createElement('canvas');\r
    const atlasContext = atlas.getContext('2d');\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    if (!atlasContext) return undefined;\r
\r
    const colorCache = new Map();\r
    const parse = value => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const grid = { cols: 0, rows: 0, cellW: 0, cellH: 0, originX: 0, originY: 0, atlasColumns: 1 };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, inside: false, presence: 0, stir: 0, fresh: true };\r
    const walkers = [];\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
    const loadedFonts = new Set();\r
    let pool = [0];\r
    let typeKey = '';\r
    let paletteKey = '';\r
    let colorCount = 1;\r
    let count = 0;\r
    let data = new Uint8Array(0);\r
    let heat = new Float32Array(0);\r
    let peak = new Float32Array(0);\r
    let hold = new Float32Array(0);\r
    let fade = new Float32Array(0);\r
    let wait = new Float32Array(0);\r
    let delay = new Float32Array(0);\r
    let luck = new Float32Array(0);\r
    let level = new Float32Array(0);\r
    let born = new Float32Array(0);\r
    let slot = new Int32Array(0);\r
    let active = new Int32Array(0);\r
    let activeCount = 0;\r
    let introLeft = settingsRef.current.intro && !reduce;\r
    let clock = 0;\r
    let time = 0;\r
    let density = -1;\r
    let restCarry = 0;\r
    let glitchCarry = 0;\r
    let cursorCarry = 0;\r
    let dirty = true;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const randomGlyph = () => pool[(Math.random() * pool.length) | 0];\r
    const randomColor = () => (Math.random() * colorCount) | 0;\r
\r
    const restValue = (i, appear = 1) =>\r
      luck[i] < settingsRef.current.density ? Math.round(level[i] * 255 * appear) : 0;\r
\r
    const cellAt = (x, y) => {\r
      const c = Math.floor((x - grid.originX) / grid.cellW);\r
      const r = Math.floor((y - grid.originY) / grid.cellH);\r
      if (c < 0 || r < 0 || c >= grid.cols || r >= grid.rows) return -1;\r
      return r * grid.cols + c;\r
    };\r
\r
    const ignite = (i, strength, holdTime, fadeTime, color, after = 0) => {\r
      if (slot[i] < 0) {\r
        slot[i] = activeCount;\r
        active[activeCount++] = i;\r
        heat[i] = 0;\r
        hold[i] = holdTime;\r
        peak[i] = strength;\r
        fade[i] = fadeTime;\r
        wait[i] = 0;\r
        delay[i] = after;\r
        data[i * 4 + 3] = color;\r
        return;\r
      }\r
      if (heat[i] < 0.15) data[i * 4 + 3] = color;\r
      peak[i] = hold[i] > 0 ? Math.max(peak[i], strength) : strength;\r
      hold[i] = Math.max(hold[i], holdTime);\r
      fade[i] = Math.max(fade[i], fadeTime);\r
      delay[i] = Math.min(delay[i], after);\r
    };\r
\r
    const release = k => {\r
      const i = active[k];\r
      const moved = active[--activeCount];\r
      active[k] = moved;\r
      slot[moved] = k;\r
      slot[i] = -1;\r
      heat[i] = 0;\r
      data[i * 4 + 2] = 0;\r
    };\r
\r
    const buildType = () => {\r
      const s = settingsRef.current;\r
      const size = s.fontSize * view.ratio;\r
      const font = \`\${size}px \${s.fontFamily}\`;\r
      const chars = Array.from(s.characters);\r
      const unique = Array.from(new Set(chars)).slice(0, 256);\r
      atlasContext.font = font;\r
      let advance = 1;\r
      unique.forEach(char => {\r
        advance = Math.max(advance, atlasContext.measureText(char).width);\r
      });\r
      const metrics = atlasContext.measureText('M');\r
      const cellW = Math.max(2, Math.ceil(advance + size * s.spacing));\r
      const cellH = Math.max(2, Math.ceil(size * (0.95 + s.spacing)));\r
      const columns = Math.max(1, Math.min(unique.length, Math.floor(maxSize / cellW)));\r
      atlas.width = columns * cellW;\r
      atlas.height = Math.ceil(unique.length / columns) * cellH;\r
      atlasContext.font = font;\r
      atlasContext.textAlign = 'center';\r
      atlasContext.textBaseline = 'alphabetic';\r
      atlasContext.fillStyle = '#ffffff';\r
      const baseline = cellH / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;\r
      unique.forEach((char, i) => {\r
        atlasContext.fillText(char, (i % columns) * cellW + cellW / 2, Math.floor(i / columns) * cellH + baseline);\r
      });\r
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);\r
      const lookup = new Map(unique.map((char, i) => [char, i]));\r
      const nextPool = chars.map(char => lookup.get(char)).filter(index => index !== undefined);\r
      const charsChanged = nextPool.length !== pool.length || nextPool.some((index, i) => index !== pool[i]);\r
      pool = nextPool.length ? nextPool : [0];\r
      const resized = cellW !== grid.cellW || cellH !== grid.cellH;\r
      grid.cellW = cellW;\r
      grid.cellH = cellH;\r
      grid.atlasColumns = columns;\r
      if (!loadedFonts.has(font) && document.fonts?.load) {\r
        loadedFonts.add(font);\r
        document.fonts\r
          .load(font, s.characters)\r
          .then(() => {\r
            if (!alive) return;\r
            typeKey = '';\r
            wake();\r
          })\r
          .catch(() => {});\r
      }\r
      return { resized, charsChanged };\r
    };\r
\r
    const birthTime = (c, r, cols, rows) => {\r
      const dx = (c + 0.5) / cols - 0.5;\r
      const dy = (r + 0.5) / rows - 0.5;\r
      const radial = Math.min(1, Math.hypot(dx, dy * 0.8) * 1.6);\r
      return INTRO_SECONDS * (0.3 * radial + 0.7 * Math.random() ** 1.3);\r
    };\r
\r
    const buildGrid = () => {\r
      const cols = Math.ceil(canvas.width / grid.cellW) + 1;\r
      const rows = Math.ceil(canvas.height / grid.cellH) + 1;\r
      grid.originX = Math.floor((canvas.width - cols * grid.cellW) / 2);\r
      grid.originY = Math.floor((canvas.height - rows * grid.cellH) / 2);\r
      if (cols === grid.cols && rows === grid.rows) return;\r
      const n = cols * rows;\r
      const nextData = new Uint8Array(n * 4);\r
      const nextLuck = new Float32Array(n);\r
      const nextLevel = new Float32Array(n);\r
      const nextBorn = new Float32Array(n);\r
      const shiftC = Math.floor((grid.cols - cols) / 2);\r
      const shiftR = Math.floor((grid.rows - rows) / 2);\r
      for (let r = 0; r < rows; r++) {\r
        for (let c = 0; c < cols; c++) {\r
          const i = r * cols + c;\r
          const oc = c + shiftC;\r
          const or = r + shiftR;\r
          if (oc >= 0 && or >= 0 && oc < grid.cols && or < grid.rows) {\r
            const j = or * grid.cols + oc;\r
            nextData[i * 4] = data[j * 4];\r
            nextData[i * 4 + 1] = data[j * 4 + 1];\r
            nextLuck[i] = luck[j];\r
            nextLevel[i] = level[j];\r
            nextBorn[i] = born[j];\r
          } else {\r
            nextData[i * 4] = randomGlyph();\r
            nextLuck[i] = Math.random();\r
            nextLevel[i] = 0.55 + 0.45 * Math.random();\r
            nextBorn[i] = introLeft ? birthTime(c, r, cols, rows) : -1;\r
          }\r
        }\r
      }\r
      grid.cols = cols;\r
      grid.rows = rows;\r
      count = n;\r
      data = nextData;\r
      luck = nextLuck;\r
      level = nextLevel;\r
      born = nextBorn;\r
      heat = new Float32Array(n);\r
      peak = new Float32Array(n);\r
      hold = new Float32Array(n);\r
      fade = new Float32Array(n);\r
      wait = new Float32Array(n);\r
      delay = new Float32Array(n);\r
      slot = new Int32Array(n).fill(-1);\r
      active = new Int32Array(n);\r
      activeCount = 0;\r
      walkers.length = 0;\r
      for (let i = 0; i < n; i++) data[i * 4 + 1] = born[i] >= 0 ? 0 : restValue(i);\r
      density = settingsRef.current.density;\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
      dirty = false;\r
    };\r
\r
    const syncType = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.fontSize * view.ratio}|\${s.fontFamily}|\${s.spacing}|\${s.characters}\`;\r
      if (key === typeKey) return;\r
      typeKey = key;\r
      const { resized, charsChanged } = buildType();\r
      if (resized || !grid.cols) buildGrid();\r
      if (charsChanged) {\r
        for (let i = 0; i < count; i++) data[i * 4] = randomGlyph();\r
        dirty = true;\r
      }\r
    };\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = s.colors.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      colorCount = Math.max(1, s.colors.length);\r
      for (let i = 0; i < MAX_COLORS; i++) {\r
        const rgb = parse(s.colors[Math.min(i, colorCount - 1)] ?? '#ffffff');\r
        palette[i * 3] = rgb[0];\r
        palette[i * 3 + 1] = rgb[1];\r
        palette[i * 3 + 2] = rgb[2];\r
      }\r
      for (let i = 0; i < count; i++) {\r
        if (data[i * 4 + 3] >= colorCount) data[i * 4 + 3] = randomColor();\r
      }\r
      dirty = true;\r
    };\r
\r
    const addWalker = walker => {\r
      if (walkers.length < MAX_WALKERS) walkers.push({ carry: 0, after: 0, wiggle: 0, branch: 0, ...walker });\r
    };\r
\r
    const spawnTear = (x, y) => {\r
      const center = cellAt(x, y);\r
      if (center < 0) return;\r
      const r0 = Math.floor(center / grid.cols);\r
      const width = grid.cols * grid.cellW;\r
      for (let dr = -2; dr <= 2; dr++) {\r
        const r = r0 + dr;\r
        if (r < 0 || r >= grid.rows) continue;\r
        const weight = 1 - Math.abs(dr) / 3;\r
        if (dr !== 0 && Math.random() > 0.3 + 0.6 * weight) continue;\r
        const color = randomColor();\r
        const rowY = grid.originY + (r + 0.5) * grid.cellH;\r
        const shift = (Math.random() - 0.5) * 6 * grid.cellW * (1 - weight);\r
        [0, Math.PI].forEach(angle => {\r
          const life = width * (0.12 + 0.5 * weight * (0.4 + 0.6 * Math.random()));\r
          addWalker({\r
            x: x + shift,\r
            y: rowY,\r
            angle,\r
            life,\r
            span: life,\r
            speed: (2200 + Math.random() * 1200) * view.ratio,\r
            after: Math.abs(dr) * 0.035 + Math.random() * 0.03,\r
            color\r
          });\r
        });\r
      }\r
    };\r
\r
    const spawnRays = (x, y) => {\r
      const reach = Math.min(view.width, view.height) * view.ratio;\r
      const rays = 5 + ((Math.random() * 3) | 0);\r
      const turn = Math.random() * Math.PI * 2;\r
      for (let k = 0; k < rays; k++) {\r
        const life = reach * (0.25 + Math.random() * 0.3);\r
        addWalker({\r
          x,\r
          y,\r
          angle: turn + (k / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.4,\r
          life,\r
          span: life,\r
          speed: (700 + Math.random() * 400) * view.ratio,\r
          wiggle: 0.2,\r
          branch: 0.03,\r
          color: randomColor()\r
        });\r
      }\r
    };\r
\r
    const spawnBurst = (x, y) => {\r
      const center = cellAt(x, y);\r
      if (center < 0) return;\r
      ignite(center, 1, 0.08, 0.8, randomColor());\r
      if (settingsRef.current.clickEffect === 'burst') spawnRays(x, y);\r
      else spawnTear(x, y);\r
    };\r
\r
    const stepWalkers = dt => {\r
      for (let k = walkers.length - 1; k >= 0; k--) {\r
        const w = walkers[k];\r
        if (w.after > 0) {\r
          w.after -= dt;\r
          continue;\r
        }\r
        const step = Math.max(\r
          1,\r
          Math.abs(Math.cos(w.angle)) * grid.cellW + Math.abs(Math.sin(w.angle)) * grid.cellH * 0.6\r
        );\r
        w.carry += w.speed * dt;\r
        while (w.carry >= step && w.life > 0) {\r
          w.carry -= step;\r
          w.life -= step;\r
          w.angle += (Math.random() - 0.5) * w.wiggle;\r
          w.x += Math.cos(w.angle) * step;\r
          w.y += Math.sin(w.angle) * step;\r
          const i = cellAt(w.x, w.y);\r
          if (i < 0) {\r
            w.life = 0;\r
            break;\r
          }\r
          const left = w.life / w.span;\r
          ignite(i, 0.5 + 0.5 * left, 0.03 + Math.random() * 0.05, 0.5 + 0.5 * left, w.color);\r
          if (w.branch && Math.random() < w.branch) {\r
            const side = Math.random() < 0.5 ? -1 : 1;\r
            const life = w.life * (0.45 + Math.random() * 0.3);\r
            addWalker({\r
              x: w.x,\r
              y: w.y,\r
              angle: w.angle + side * (0.5 + Math.random() * 0.5),\r
              life,\r
              span: w.span,\r
              speed: w.speed,\r
              wiggle: w.wiggle,\r
              color: w.color\r
            });\r
          }\r
        }\r
        if (w.life <= 0) walkers.splice(k, 1);\r
      }\r
    };\r
\r
    const ambient = dt => {\r
      const s = settingsRef.current;\r
      if (reduce || s.speed <= 0 || !count) return;\r
      restCarry += count * REST_RATE * s.speed * dt;\r
      let changes = Math.min(count, restCarry | 0);\r
      restCarry -= changes;\r
      while (changes-- > 0) {\r
        const i = (Math.random() * count) | 0;\r
        if (slot[i] < 0) {\r
          data[i * 4] = randomGlyph();\r
          dirty = true;\r
        }\r
      }\r
      const tempo = Math.max(s.speed, 0.2);\r
      glitchCarry += count * s.glitchAmount ** 1.6 * GLITCH_RATE * s.speed * dt;\r
      let events = Math.min(count, glitchCarry | 0);\r
      glitchCarry -= events;\r
      while (events-- > 0) {\r
        const i = (Math.random() * count) | 0;\r
        const color = randomColor();\r
        const strength = 0.45 + 0.55 * Math.random();\r
        const holdTime = (0.04 + Math.random() * 0.26) / tempo;\r
        const fadeTime = (0.45 + Math.random() * 0.6) / tempo;\r
        const roll = Math.random();\r
        if (roll < 0.24) {\r
          const c = i % grid.cols;\r
          const long = roll < 0.015;\r
          const length = Math.min(\r
            grid.cols - c,\r
            long ? 10 + ((Math.random() * 24) | 0) : 2 + ((Math.random() * 7) | 0)\r
          );\r
          const pace = (long ? 0.012 : 0.028) / tempo;\r
          for (let k = 0; k < length; k++) ignite(i + k, strength, holdTime, fadeTime, color, k * pace);\r
        } else {\r
          ignite(i, strength, holdTime, fadeTime, color);\r
        }\r
      }\r
    };\r
\r
    const excite = dt => {\r
      const s = settingsRef.current;\r
      if (pointer.presence < 0.02 || reduce || !count) return;\r
      const radius = s.cursorRadius * view.ratio;\r
      if (radius < 1) return;\r
      const c0 = Math.max(0, Math.floor((pointer.sx - radius - grid.originX) / grid.cellW));\r
      const c1 = Math.min(grid.cols - 1, Math.floor((pointer.sx + radius - grid.originX) / grid.cellW));\r
      const r0 = Math.max(0, Math.floor((pointer.sy - radius - grid.originY) / grid.cellH));\r
      const r1 = Math.min(grid.rows - 1, Math.floor((pointer.sy + radius - grid.originY) / grid.cellH));\r
      const chance = pointer.presence * (3 + 9 * pointer.stir) * dt;\r
      for (let r = r0; r <= r1; r++) {\r
        const dy = (grid.originY + (r + 0.5) * grid.cellH - pointer.sy) / radius;\r
        for (let c = c0; c <= c1; c++) {\r
          const dx = (grid.originX + (c + 0.5) * grid.cellW - pointer.sx) / radius;\r
          const d = dx * dx + dy * dy;\r
          if (d >= 1) continue;\r
          const i = r * grid.cols + c;\r
          if (slot[i] < 0 && Math.random() < (1 - d) * (1 - d) * chance) {\r
            data[i * 4] = randomGlyph();\r
            dirty = true;\r
          }\r
        }\r
      }\r
      const cells = (Math.PI * radius * radius) / (grid.cellW * grid.cellH);\r
      cursorCarry += cells * pointer.presence * (0.15 + 4 * pointer.stir) * dt;\r
      let sparks = Math.min(512, cursorCarry | 0);\r
      cursorCarry -= sparks;\r
      while (sparks-- > 0) {\r
        const angle = Math.random() * Math.PI * 2;\r
        const distance = Math.sqrt(Math.random());\r
        const falloff = (1 - distance * distance) ** 2;\r
        if (Math.random() > falloff) continue;\r
        const i = cellAt(\r
          pointer.sx + Math.cos(angle) * distance * radius,\r
          pointer.sy + Math.sin(angle) * distance * radius\r
        );\r
        if (i < 0) continue;\r
        ignite(\r
          i,\r
          (0.3 + 0.7 * Math.random()) * (0.45 + 0.55 * pointer.stir),\r
          0.02 + Math.random() * 0.08,\r
          0.35 + Math.random() * 0.4,\r
          randomColor()\r
        );\r
      }\r
    };\r
\r
    const settle = dt => {\r
      const s = settingsRef.current;\r
      const tempo = Math.max(s.speed, 0.5);\r
      const attack = 1 - Math.exp(-dt / 0.05);\r
      for (let k = 0; k < activeCount; ) {\r
        const i = active[k];\r
        if (delay[i] > 0) {\r
          delay[i] -= dt;\r
          k++;\r
          continue;\r
        }\r
        let h = heat[i];\r
        if (hold[i] > 0) {\r
          hold[i] -= dt;\r
          h = s.smooth ? h + (peak[i] - h) * attack : peak[i];\r
        } else {\r
          h = s.smooth ? h * Math.exp((-dt * 4) / Math.max(fade[i], 0.05)) : 0;\r
        }\r
        if (h < 0.012 && hold[i] <= 0) {\r
          release(k);\r
          dirty = true;\r
          continue;\r
        }\r
        heat[i] = h;\r
        wait[i] -= dt;\r
        if (wait[i] <= 0) {\r
          data[i * 4] = randomGlyph();\r
          wait[i] = ((0.045 + 0.45 * (1 - h) * (1 - h)) * (0.6 + 0.8 * Math.random())) / tempo;\r
        }\r
        data[i * 4 + 2] = Math.round(h * 255);\r
        dirty = true;\r
        k++;\r
      }\r
    };\r
\r
    const reveal = dt => {\r
      if (!introLeft) return;\r
      const s = settingsRef.current;\r
      let pending = false;\r
      for (let i = 0; i < count; i++) {\r
        const t = born[i];\r
        if (t < 0) continue;\r
        const age = clock - t;\r
        if (age < 0) {\r
          pending = true;\r
          continue;\r
        }\r
        if (age < dt && Math.random() < (luck[i] < s.density ? 0.45 : 0.12)) {\r
          ignite(i, 0.4 + 0.5 * Math.random(), 0.02, 0.35 + Math.random() * 0.35, randomColor());\r
        }\r
        const appear = s.smooth ? smoother(age / 0.35) : 1;\r
        data[i * 4 + 1] = restValue(i, appear);\r
        if (appear >= 1) born[i] = -1;\r
        else pending = true;\r
      }\r
      dirty = true;\r
      if (!pending) introLeft = false;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!reduce) time += dt * s.speed;\r
      syncType();\r
      syncPalette();\r
      if (s.density !== density) {\r
        density = s.density;\r
        for (let i = 0; i < count; i++) if (born[i] < 0) data[i * 4 + 1] = restValue(i);\r
        dirty = true;\r
      }\r
      const goal = s.interactive && pointer.inside && !reduce ? 1 : 0;\r
      pointer.presence += (goal - pointer.presence) * (1 - Math.exp(-dt / 0.25));\r
      if (Math.abs(goal - pointer.presence) < 0.002) pointer.presence = goal;\r
      const px = pointer.sx;\r
      const py = pointer.sy;\r
      const follow = 1 - Math.exp(-dt / 0.07);\r
      pointer.sx += (pointer.x - pointer.sx) * follow;\r
      pointer.sy += (pointer.y - pointer.sy) * follow;\r
      const moved = Math.hypot(pointer.sx - px, pointer.sy - py) / view.ratio / dt;\r
      pointer.stir += (clamp(moved / 1400, 0, 1) - pointer.stir) * (1 - Math.exp(-dt / 0.12));\r
      if (pointer.stir < 0.001) pointer.stir = 0;\r
      reveal(dt);\r
      ambient(dt);\r
      excite(dt);\r
      stepWalkers(dt);\r
      settle(dt);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      if (dirty) {\r
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, grid.cols, grid.rows, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
        dirty = false;\r
      }\r
      gl.uniform1i(u.uState, 1);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
      gl.uniform1i(u.uAtlas, 0);\r
      gl.uniform2i(u.uCell, grid.cellW, grid.cellH);\r
      gl.uniform2i(u.uGrid, grid.cols, grid.rows);\r
      gl.uniform1i(u.uAtlasColumns, grid.atlasColumns);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uOrigin, grid.originX, grid.originY);\r
      gl.uniform3fv(u.uBase, parse(s.baseColor));\r
      gl.uniform1f(u.uBaseOpacity, s.baseOpacity);\r
      gl.uniform3fv(u.uColors, palette);\r
      gl.uniform1f(u.uEdge, s.edgeFade * Math.min(canvas.width, canvas.height));\r
      gl.uniform1f(u.uCenter, s.centerFade);\r
      gl.uniform2f(u.uPointer, pointer.sx, pointer.sy);\r
      gl.uniform1f(u.uRadius, Math.max(1, s.cursorRadius * view.ratio));\r
      gl.uniform1f(u.uPresence, pointer.presence);\r
      gl.uniform1f(u.uReveal, Math.min(1, s.baseOpacity * 3.5));\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uFlow, s.flow);\r
      gl.uniform1f(u.uFlowScale, Math.max(canvas.width, canvas.height) * 0.32);\r
      if (s.backgroundColor) {\r
        const [r, g, b] = parse(s.backgroundColor);\r
        gl.uniform4f(u.uBackground, r, g, b, 1);\r
      } else {\r
        gl.uniform4f(u.uBackground, 0, 0, 0, 0);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const busy =\r
        (!reduce && s.speed > 0) ||\r
        activeCount > 0 ||\r
        walkers.length > 0 ||\r
        introLeft ||\r
        (pointer.presence !== 0 && pointer.presence !== 1) ||\r
        pointer.stir > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      syncType();\r
      if (grid.cols) buildGrid();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x * view.ratio;\r
      pointer.y = y * view.ratio;\r
      if (pointer.fresh || pointer.presence < 0.02) {\r
        pointer.sx = pointer.x;\r
        pointer.sy = pointer.y;\r
        pointer.fresh = false;\r
      }\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || s.clickEffect === 'none' || reduce || !count) return;\r
      spawnBurst(pointer.x, pointer.y);\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const onFonts = () => {\r
      typeKey = '';\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    document.fonts?.addEventListener?.('loadingdone', onFonts);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      document.fonts?.removeEventListener?.('loadingdone', onFonts);\r
      gl.deleteTexture(atlasTexture);\r
      gl.deleteTexture(stateTexture);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program.program);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`letter-glitch\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="letter-glitch-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LetterGlitch;\r
`,n=`.letter-glitch {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.letter-glitch-canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const DEFAULT_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789';\r
const DEFAULT_FONT = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";\r
const DARK_COLORS = ['#ffffff', '#61dca3'];\r
const LIGHT_COLORS = ['#18181b', '#0f9f6e'];\r
const MAX_COLORS = 8;\r
const INTRO_SECONDS = 1.4;\r
const REST_RATE = 0.2;\r
const GLITCH_RATE = 0.1;\r
const MAX_WALKERS = 48;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uAtlas;\r
uniform sampler2D uState;\r
uniform ivec2 uCell;\r
uniform ivec2 uGrid;\r
uniform int uAtlasColumns;\r
uniform vec2 uResolution;\r
uniform vec2 uOrigin;\r
uniform vec3 uBase;\r
uniform float uBaseOpacity;\r
uniform vec3 uColors[8];\r
uniform float uEdge;\r
uniform float uCenter;\r
uniform vec2 uPointer;\r
uniform float uRadius;\r
uniform float uPresence;\r
uniform float uReveal;\r
uniform float uTime;\r
uniform float uFlow;\r
uniform float uFlowScale;\r
uniform vec4 uBackground;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 w = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) - uOrigin;\r
  ivec2 q = ivec2(floor(frag));\r
  ivec2 cell = q / uCell;\r
  vec4 color = vec4(0.0);\r
  if (all(greaterThanEqual(q, ivec2(0))) && all(lessThan(cell, uGrid))) {\r
    vec4 state = texelFetch(uState, cell, 0);\r
    int glyph = int(state.r * 255.0 + 0.5);\r
    ivec2 texel = ivec2(glyph % uAtlasColumns, glyph / uAtlasColumns) * uCell + (q - cell * uCell);\r
    float coverage = texelFetch(uAtlas, texel, 0).a;\r
    if (coverage > 0.0) {\r
      vec2 center = vec2(cell * uCell) + vec2(uCell) * 0.5 + uOrigin;\r
      float mask = 1.0;\r
      if (uEdge > 0.0) {\r
        vec2 edge = min(center, uResolution - center) / uEdge;\r
        mask = smoother(edge.x) * smoother(edge.y);\r
      }\r
      if (uCenter > 0.0) {\r
        vec2 room = max(abs(center - uResolution * 0.5) - uResolution * vec2(0.3, 0.24), 0.0);\r
        float soft = min(uResolution.x, uResolution.y) * 0.24;\r
        mask *= 1.0 - uCenter * (1.0 - smoother(length(room) / soft));\r
      }\r
      float seed = hash(vec2(cell) + 17.0);\r
      float rest = state.g * uBaseOpacity * (0.8 + 0.2 * sin(uTime * (0.5 + 1.2 * seed) + seed * 40.0));\r
      if (uFlow > 0.0) {\r
        vec2 p = center / uFlowScale;\r
        float n = 0.65 * noise(p + vec2(uTime * 0.05, uTime * 0.03)) + 0.35 * noise(p * 2.03 - vec2(uTime * 0.04, -uTime * 0.06));\r
        rest *= mix(1.0, 0.1 + 1.7 * smoothstep(0.25, 0.8, n), uFlow);\r
      }\r
      if (uPresence > 0.0) {\r
        float d = length(center - uPointer) / uRadius;\r
        float f = clamp(1.0 - d * d, 0.0, 1.0);\r
        rest = mix(rest, max(rest, uReveal * step(0.004, state.g)), f * f * uPresence);\r
      }\r
      float heat = state.b;\r
      rest = min(rest, 1.0) * (1.0 - heat);\r
      vec3 tint = uColors[int(state.a * 255.0 + 0.5)];\r
      float weight = coverage * mask;\r
      color = vec4((uBase * rest + tint * heat) * weight, (rest + heat) * weight);\r
    }\r
  }\r
  outColor = color + uBackground * (1.0 - color.a);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const smoother = value => {\r
  const x = clamp(value, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const compile = (gl, type, source) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;\r
  gl.deleteShader(shader);\r
  return null;\r
};\r
\r
const link = gl => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LetterGlitch = ({\r
  glitchColors,\r
  baseColor,\r
  characters = DEFAULT_CHARACTERS,\r
  fontFamily = DEFAULT_FONT,\r
  fontSize = 14,\r
  spacing = 0.6,\r
  density = 0.9,\r
  baseOpacity = 0.16,\r
  glitchAmount = 0.5,\r
  speed = 1,\r
  smooth = true,\r
  interactive = true,\r
  cursorRadius = 140,\r
  clickEffect = 'tear',\r
  flow = 0.5,\r
  edgeFade = 0,\r
  centerFade = 0,\r
  intro = true,\r
  lightMode = false,\r
  backgroundColor,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const customColors = Array.isArray(glitchColors) && glitchColors.length ? glitchColors : null;\r
  const settings = {\r
    colors: (customColors || (lightMode ? LIGHT_COLORS : DARK_COLORS)).slice(0, MAX_COLORS),\r
    baseColor: baseColor || (lightMode ? '#18181b' : '#ffffff'),\r
    characters: characters || DEFAULT_CHARACTERS,\r
    fontFamily: fontFamily || DEFAULT_FONT,\r
    fontSize: clamp(fontSize, 6, 96),\r
    spacing: clamp(spacing, 0, 2),\r
    density: clamp(density, 0, 1),\r
    baseOpacity: clamp(baseOpacity, 0, 1),\r
    glitchAmount: clamp(glitchAmount, 0, 1),\r
    speed: Math.max(0, speed),\r
    smooth,\r
    interactive,\r
    cursorRadius: Math.max(0, cursorRadius),\r
    clickEffect,\r
    flow: clamp(flow, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 0.5),\r
    centerFade: clamp(centerFade, 0, 1),\r
    intro,\r
    backgroundColor,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
    const vao = gl.createVertexArray();\r
    const makeTexture = () => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      return texture;\r
    };\r
    const atlasTexture = makeTexture();\r
    const stateTexture = makeTexture();\r
    const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);\r
    const atlas = document.createElement('canvas');\r
    const atlasContext = atlas.getContext('2d');\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    if (!atlasContext) return undefined;\r
\r
    const colorCache = new Map();\r
    const parse = value => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const grid = { cols: 0, rows: 0, cellW: 0, cellH: 0, originX: 0, originY: 0, atlasColumns: 1 };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, inside: false, presence: 0, stir: 0, fresh: true };\r
    const walkers = [];\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
    const loadedFonts = new Set();\r
    let pool = [0];\r
    let typeKey = '';\r
    let paletteKey = '';\r
    let colorCount = 1;\r
    let count = 0;\r
    let data = new Uint8Array(0);\r
    let heat = new Float32Array(0);\r
    let peak = new Float32Array(0);\r
    let hold = new Float32Array(0);\r
    let fade = new Float32Array(0);\r
    let wait = new Float32Array(0);\r
    let delay = new Float32Array(0);\r
    let luck = new Float32Array(0);\r
    let level = new Float32Array(0);\r
    let born = new Float32Array(0);\r
    let slot = new Int32Array(0);\r
    let active = new Int32Array(0);\r
    let activeCount = 0;\r
    let introLeft = settingsRef.current.intro && !reduce;\r
    let clock = 0;\r
    let time = 0;\r
    let density = -1;\r
    let restCarry = 0;\r
    let glitchCarry = 0;\r
    let cursorCarry = 0;\r
    let dirty = true;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const randomGlyph = () => pool[(Math.random() * pool.length) | 0];\r
    const randomColor = () => (Math.random() * colorCount) | 0;\r
\r
    const restValue = (i, appear = 1) =>\r
      luck[i] < settingsRef.current.density ? Math.round(level[i] * 255 * appear) : 0;\r
\r
    const cellAt = (x, y) => {\r
      const c = Math.floor((x - grid.originX) / grid.cellW);\r
      const r = Math.floor((y - grid.originY) / grid.cellH);\r
      if (c < 0 || r < 0 || c >= grid.cols || r >= grid.rows) return -1;\r
      return r * grid.cols + c;\r
    };\r
\r
    const ignite = (i, strength, holdTime, fadeTime, color, after = 0) => {\r
      if (slot[i] < 0) {\r
        slot[i] = activeCount;\r
        active[activeCount++] = i;\r
        heat[i] = 0;\r
        hold[i] = holdTime;\r
        peak[i] = strength;\r
        fade[i] = fadeTime;\r
        wait[i] = 0;\r
        delay[i] = after;\r
        data[i * 4 + 3] = color;\r
        return;\r
      }\r
      if (heat[i] < 0.15) data[i * 4 + 3] = color;\r
      peak[i] = hold[i] > 0 ? Math.max(peak[i], strength) : strength;\r
      hold[i] = Math.max(hold[i], holdTime);\r
      fade[i] = Math.max(fade[i], fadeTime);\r
      delay[i] = Math.min(delay[i], after);\r
    };\r
\r
    const release = k => {\r
      const i = active[k];\r
      const moved = active[--activeCount];\r
      active[k] = moved;\r
      slot[moved] = k;\r
      slot[i] = -1;\r
      heat[i] = 0;\r
      data[i * 4 + 2] = 0;\r
    };\r
\r
    const buildType = () => {\r
      const s = settingsRef.current;\r
      const size = s.fontSize * view.ratio;\r
      const font = \`\${size}px \${s.fontFamily}\`;\r
      const chars = Array.from(s.characters);\r
      const unique = Array.from(new Set(chars)).slice(0, 256);\r
      atlasContext.font = font;\r
      let advance = 1;\r
      unique.forEach(char => {\r
        advance = Math.max(advance, atlasContext.measureText(char).width);\r
      });\r
      const metrics = atlasContext.measureText('M');\r
      const cellW = Math.max(2, Math.ceil(advance + size * s.spacing));\r
      const cellH = Math.max(2, Math.ceil(size * (0.95 + s.spacing)));\r
      const columns = Math.max(1, Math.min(unique.length, Math.floor(maxSize / cellW)));\r
      atlas.width = columns * cellW;\r
      atlas.height = Math.ceil(unique.length / columns) * cellH;\r
      atlasContext.font = font;\r
      atlasContext.textAlign = 'center';\r
      atlasContext.textBaseline = 'alphabetic';\r
      atlasContext.fillStyle = '#ffffff';\r
      const baseline = cellH / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;\r
      unique.forEach((char, i) => {\r
        atlasContext.fillText(char, (i % columns) * cellW + cellW / 2, Math.floor(i / columns) * cellH + baseline);\r
      });\r
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);\r
      const lookup = new Map(unique.map((char, i) => [char, i]));\r
      const nextPool = chars.map(char => lookup.get(char)).filter(index => index !== undefined);\r
      const charsChanged = nextPool.length !== pool.length || nextPool.some((index, i) => index !== pool[i]);\r
      pool = nextPool.length ? nextPool : [0];\r
      const resized = cellW !== grid.cellW || cellH !== grid.cellH;\r
      grid.cellW = cellW;\r
      grid.cellH = cellH;\r
      grid.atlasColumns = columns;\r
      if (!loadedFonts.has(font) && document.fonts?.load) {\r
        loadedFonts.add(font);\r
        document.fonts\r
          .load(font, s.characters)\r
          .then(() => {\r
            if (!alive) return;\r
            typeKey = '';\r
            wake();\r
          })\r
          .catch(() => {});\r
      }\r
      return { resized, charsChanged };\r
    };\r
\r
    const birthTime = (c, r, cols, rows) => {\r
      const dx = (c + 0.5) / cols - 0.5;\r
      const dy = (r + 0.5) / rows - 0.5;\r
      const radial = Math.min(1, Math.hypot(dx, dy * 0.8) * 1.6);\r
      return INTRO_SECONDS * (0.3 * radial + 0.7 * Math.random() ** 1.3);\r
    };\r
\r
    const buildGrid = () => {\r
      const cols = Math.ceil(canvas.width / grid.cellW) + 1;\r
      const rows = Math.ceil(canvas.height / grid.cellH) + 1;\r
      grid.originX = Math.floor((canvas.width - cols * grid.cellW) / 2);\r
      grid.originY = Math.floor((canvas.height - rows * grid.cellH) / 2);\r
      if (cols === grid.cols && rows === grid.rows) return;\r
      const n = cols * rows;\r
      const nextData = new Uint8Array(n * 4);\r
      const nextLuck = new Float32Array(n);\r
      const nextLevel = new Float32Array(n);\r
      const nextBorn = new Float32Array(n);\r
      const shiftC = Math.floor((grid.cols - cols) / 2);\r
      const shiftR = Math.floor((grid.rows - rows) / 2);\r
      for (let r = 0; r < rows; r++) {\r
        for (let c = 0; c < cols; c++) {\r
          const i = r * cols + c;\r
          const oc = c + shiftC;\r
          const or = r + shiftR;\r
          if (oc >= 0 && or >= 0 && oc < grid.cols && or < grid.rows) {\r
            const j = or * grid.cols + oc;\r
            nextData[i * 4] = data[j * 4];\r
            nextData[i * 4 + 1] = data[j * 4 + 1];\r
            nextLuck[i] = luck[j];\r
            nextLevel[i] = level[j];\r
            nextBorn[i] = born[j];\r
          } else {\r
            nextData[i * 4] = randomGlyph();\r
            nextLuck[i] = Math.random();\r
            nextLevel[i] = 0.55 + 0.45 * Math.random();\r
            nextBorn[i] = introLeft ? birthTime(c, r, cols, rows) : -1;\r
          }\r
        }\r
      }\r
      grid.cols = cols;\r
      grid.rows = rows;\r
      count = n;\r
      data = nextData;\r
      luck = nextLuck;\r
      level = nextLevel;\r
      born = nextBorn;\r
      heat = new Float32Array(n);\r
      peak = new Float32Array(n);\r
      hold = new Float32Array(n);\r
      fade = new Float32Array(n);\r
      wait = new Float32Array(n);\r
      delay = new Float32Array(n);\r
      slot = new Int32Array(n).fill(-1);\r
      active = new Int32Array(n);\r
      activeCount = 0;\r
      walkers.length = 0;\r
      for (let i = 0; i < n; i++) data[i * 4 + 1] = born[i] >= 0 ? 0 : restValue(i);\r
      density = settingsRef.current.density;\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
      dirty = false;\r
    };\r
\r
    const syncType = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.fontSize * view.ratio}|\${s.fontFamily}|\${s.spacing}|\${s.characters}\`;\r
      if (key === typeKey) return;\r
      typeKey = key;\r
      const { resized, charsChanged } = buildType();\r
      if (resized || !grid.cols) buildGrid();\r
      if (charsChanged) {\r
        for (let i = 0; i < count; i++) data[i * 4] = randomGlyph();\r
        dirty = true;\r
      }\r
    };\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = s.colors.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      colorCount = Math.max(1, s.colors.length);\r
      for (let i = 0; i < MAX_COLORS; i++) {\r
        const rgb = parse(s.colors[Math.min(i, colorCount - 1)] ?? '#ffffff');\r
        palette[i * 3] = rgb[0];\r
        palette[i * 3 + 1] = rgb[1];\r
        palette[i * 3 + 2] = rgb[2];\r
      }\r
      for (let i = 0; i < count; i++) {\r
        if (data[i * 4 + 3] >= colorCount) data[i * 4 + 3] = randomColor();\r
      }\r
      dirty = true;\r
    };\r
\r
    const addWalker = walker => {\r
      if (walkers.length < MAX_WALKERS) walkers.push({ carry: 0, after: 0, wiggle: 0, branch: 0, ...walker });\r
    };\r
\r
    const spawnTear = (x, y) => {\r
      const center = cellAt(x, y);\r
      if (center < 0) return;\r
      const r0 = Math.floor(center / grid.cols);\r
      const width = grid.cols * grid.cellW;\r
      for (let dr = -2; dr <= 2; dr++) {\r
        const r = r0 + dr;\r
        if (r < 0 || r >= grid.rows) continue;\r
        const weight = 1 - Math.abs(dr) / 3;\r
        if (dr !== 0 && Math.random() > 0.3 + 0.6 * weight) continue;\r
        const color = randomColor();\r
        const rowY = grid.originY + (r + 0.5) * grid.cellH;\r
        const shift = (Math.random() - 0.5) * 6 * grid.cellW * (1 - weight);\r
        [0, Math.PI].forEach(angle => {\r
          const life = width * (0.12 + 0.5 * weight * (0.4 + 0.6 * Math.random()));\r
          addWalker({\r
            x: x + shift,\r
            y: rowY,\r
            angle,\r
            life,\r
            span: life,\r
            speed: (2200 + Math.random() * 1200) * view.ratio,\r
            after: Math.abs(dr) * 0.035 + Math.random() * 0.03,\r
            color\r
          });\r
        });\r
      }\r
    };\r
\r
    const spawnRays = (x, y) => {\r
      const reach = Math.min(view.width, view.height) * view.ratio;\r
      const rays = 5 + ((Math.random() * 3) | 0);\r
      const turn = Math.random() * Math.PI * 2;\r
      for (let k = 0; k < rays; k++) {\r
        const life = reach * (0.25 + Math.random() * 0.3);\r
        addWalker({\r
          x,\r
          y,\r
          angle: turn + (k / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.4,\r
          life,\r
          span: life,\r
          speed: (700 + Math.random() * 400) * view.ratio,\r
          wiggle: 0.2,\r
          branch: 0.03,\r
          color: randomColor()\r
        });\r
      }\r
    };\r
\r
    const spawnBurst = (x, y) => {\r
      const center = cellAt(x, y);\r
      if (center < 0) return;\r
      ignite(center, 1, 0.08, 0.8, randomColor());\r
      if (settingsRef.current.clickEffect === 'burst') spawnRays(x, y);\r
      else spawnTear(x, y);\r
    };\r
\r
    const stepWalkers = dt => {\r
      for (let k = walkers.length - 1; k >= 0; k--) {\r
        const w = walkers[k];\r
        if (w.after > 0) {\r
          w.after -= dt;\r
          continue;\r
        }\r
        const step = Math.max(\r
          1,\r
          Math.abs(Math.cos(w.angle)) * grid.cellW + Math.abs(Math.sin(w.angle)) * grid.cellH * 0.6\r
        );\r
        w.carry += w.speed * dt;\r
        while (w.carry >= step && w.life > 0) {\r
          w.carry -= step;\r
          w.life -= step;\r
          w.angle += (Math.random() - 0.5) * w.wiggle;\r
          w.x += Math.cos(w.angle) * step;\r
          w.y += Math.sin(w.angle) * step;\r
          const i = cellAt(w.x, w.y);\r
          if (i < 0) {\r
            w.life = 0;\r
            break;\r
          }\r
          const left = w.life / w.span;\r
          ignite(i, 0.5 + 0.5 * left, 0.03 + Math.random() * 0.05, 0.5 + 0.5 * left, w.color);\r
          if (w.branch && Math.random() < w.branch) {\r
            const side = Math.random() < 0.5 ? -1 : 1;\r
            const life = w.life * (0.45 + Math.random() * 0.3);\r
            addWalker({\r
              x: w.x,\r
              y: w.y,\r
              angle: w.angle + side * (0.5 + Math.random() * 0.5),\r
              life,\r
              span: w.span,\r
              speed: w.speed,\r
              wiggle: w.wiggle,\r
              color: w.color\r
            });\r
          }\r
        }\r
        if (w.life <= 0) walkers.splice(k, 1);\r
      }\r
    };\r
\r
    const ambient = dt => {\r
      const s = settingsRef.current;\r
      if (reduce || s.speed <= 0 || !count) return;\r
      restCarry += count * REST_RATE * s.speed * dt;\r
      let changes = Math.min(count, restCarry | 0);\r
      restCarry -= changes;\r
      while (changes-- > 0) {\r
        const i = (Math.random() * count) | 0;\r
        if (slot[i] < 0) {\r
          data[i * 4] = randomGlyph();\r
          dirty = true;\r
        }\r
      }\r
      const tempo = Math.max(s.speed, 0.2);\r
      glitchCarry += count * s.glitchAmount ** 1.6 * GLITCH_RATE * s.speed * dt;\r
      let events = Math.min(count, glitchCarry | 0);\r
      glitchCarry -= events;\r
      while (events-- > 0) {\r
        const i = (Math.random() * count) | 0;\r
        const color = randomColor();\r
        const strength = 0.45 + 0.55 * Math.random();\r
        const holdTime = (0.04 + Math.random() * 0.26) / tempo;\r
        const fadeTime = (0.45 + Math.random() * 0.6) / tempo;\r
        const roll = Math.random();\r
        if (roll < 0.24) {\r
          const c = i % grid.cols;\r
          const long = roll < 0.015;\r
          const length = Math.min(\r
            grid.cols - c,\r
            long ? 10 + ((Math.random() * 24) | 0) : 2 + ((Math.random() * 7) | 0)\r
          );\r
          const pace = (long ? 0.012 : 0.028) / tempo;\r
          for (let k = 0; k < length; k++) ignite(i + k, strength, holdTime, fadeTime, color, k * pace);\r
        } else {\r
          ignite(i, strength, holdTime, fadeTime, color);\r
        }\r
      }\r
    };\r
\r
    const excite = dt => {\r
      const s = settingsRef.current;\r
      if (pointer.presence < 0.02 || reduce || !count) return;\r
      const radius = s.cursorRadius * view.ratio;\r
      if (radius < 1) return;\r
      const c0 = Math.max(0, Math.floor((pointer.sx - radius - grid.originX) / grid.cellW));\r
      const c1 = Math.min(grid.cols - 1, Math.floor((pointer.sx + radius - grid.originX) / grid.cellW));\r
      const r0 = Math.max(0, Math.floor((pointer.sy - radius - grid.originY) / grid.cellH));\r
      const r1 = Math.min(grid.rows - 1, Math.floor((pointer.sy + radius - grid.originY) / grid.cellH));\r
      const chance = pointer.presence * (3 + 9 * pointer.stir) * dt;\r
      for (let r = r0; r <= r1; r++) {\r
        const dy = (grid.originY + (r + 0.5) * grid.cellH - pointer.sy) / radius;\r
        for (let c = c0; c <= c1; c++) {\r
          const dx = (grid.originX + (c + 0.5) * grid.cellW - pointer.sx) / radius;\r
          const d = dx * dx + dy * dy;\r
          if (d >= 1) continue;\r
          const i = r * grid.cols + c;\r
          if (slot[i] < 0 && Math.random() < (1 - d) * (1 - d) * chance) {\r
            data[i * 4] = randomGlyph();\r
            dirty = true;\r
          }\r
        }\r
      }\r
      const cells = (Math.PI * radius * radius) / (grid.cellW * grid.cellH);\r
      cursorCarry += cells * pointer.presence * (0.15 + 4 * pointer.stir) * dt;\r
      let sparks = Math.min(512, cursorCarry | 0);\r
      cursorCarry -= sparks;\r
      while (sparks-- > 0) {\r
        const angle = Math.random() * Math.PI * 2;\r
        const distance = Math.sqrt(Math.random());\r
        const falloff = (1 - distance * distance) ** 2;\r
        if (Math.random() > falloff) continue;\r
        const i = cellAt(\r
          pointer.sx + Math.cos(angle) * distance * radius,\r
          pointer.sy + Math.sin(angle) * distance * radius\r
        );\r
        if (i < 0) continue;\r
        ignite(\r
          i,\r
          (0.3 + 0.7 * Math.random()) * (0.45 + 0.55 * pointer.stir),\r
          0.02 + Math.random() * 0.08,\r
          0.35 + Math.random() * 0.4,\r
          randomColor()\r
        );\r
      }\r
    };\r
\r
    const settle = dt => {\r
      const s = settingsRef.current;\r
      const tempo = Math.max(s.speed, 0.5);\r
      const attack = 1 - Math.exp(-dt / 0.05);\r
      for (let k = 0; k < activeCount; ) {\r
        const i = active[k];\r
        if (delay[i] > 0) {\r
          delay[i] -= dt;\r
          k++;\r
          continue;\r
        }\r
        let h = heat[i];\r
        if (hold[i] > 0) {\r
          hold[i] -= dt;\r
          h = s.smooth ? h + (peak[i] - h) * attack : peak[i];\r
        } else {\r
          h = s.smooth ? h * Math.exp((-dt * 4) / Math.max(fade[i], 0.05)) : 0;\r
        }\r
        if (h < 0.012 && hold[i] <= 0) {\r
          release(k);\r
          dirty = true;\r
          continue;\r
        }\r
        heat[i] = h;\r
        wait[i] -= dt;\r
        if (wait[i] <= 0) {\r
          data[i * 4] = randomGlyph();\r
          wait[i] = ((0.045 + 0.45 * (1 - h) * (1 - h)) * (0.6 + 0.8 * Math.random())) / tempo;\r
        }\r
        data[i * 4 + 2] = Math.round(h * 255);\r
        dirty = true;\r
        k++;\r
      }\r
    };\r
\r
    const reveal = dt => {\r
      if (!introLeft) return;\r
      const s = settingsRef.current;\r
      let pending = false;\r
      for (let i = 0; i < count; i++) {\r
        const t = born[i];\r
        if (t < 0) continue;\r
        const age = clock - t;\r
        if (age < 0) {\r
          pending = true;\r
          continue;\r
        }\r
        if (age < dt && Math.random() < (luck[i] < s.density ? 0.45 : 0.12)) {\r
          ignite(i, 0.4 + 0.5 * Math.random(), 0.02, 0.35 + Math.random() * 0.35, randomColor());\r
        }\r
        const appear = s.smooth ? smoother(age / 0.35) : 1;\r
        data[i * 4 + 1] = restValue(i, appear);\r
        if (appear >= 1) born[i] = -1;\r
        else pending = true;\r
      }\r
      dirty = true;\r
      if (!pending) introLeft = false;\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!reduce) time += dt * s.speed;\r
      syncType();\r
      syncPalette();\r
      if (s.density !== density) {\r
        density = s.density;\r
        for (let i = 0; i < count; i++) if (born[i] < 0) data[i * 4 + 1] = restValue(i);\r
        dirty = true;\r
      }\r
      const goal = s.interactive && pointer.inside && !reduce ? 1 : 0;\r
      pointer.presence += (goal - pointer.presence) * (1 - Math.exp(-dt / 0.25));\r
      if (Math.abs(goal - pointer.presence) < 0.002) pointer.presence = goal;\r
      const px = pointer.sx;\r
      const py = pointer.sy;\r
      const follow = 1 - Math.exp(-dt / 0.07);\r
      pointer.sx += (pointer.x - pointer.sx) * follow;\r
      pointer.sy += (pointer.y - pointer.sy) * follow;\r
      const moved = Math.hypot(pointer.sx - px, pointer.sy - py) / view.ratio / dt;\r
      pointer.stir += (clamp(moved / 1400, 0, 1) - pointer.stir) * (1 - Math.exp(-dt / 0.12));\r
      if (pointer.stir < 0.001) pointer.stir = 0;\r
      reveal(dt);\r
      ambient(dt);\r
      excite(dt);\r
      stepWalkers(dt);\r
      settle(dt);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      if (dirty) {\r
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, grid.cols, grid.rows, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
        dirty = false;\r
      }\r
      gl.uniform1i(u.uState, 1);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
      gl.uniform1i(u.uAtlas, 0);\r
      gl.uniform2i(u.uCell, grid.cellW, grid.cellH);\r
      gl.uniform2i(u.uGrid, grid.cols, grid.rows);\r
      gl.uniform1i(u.uAtlasColumns, grid.atlasColumns);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uOrigin, grid.originX, grid.originY);\r
      gl.uniform3fv(u.uBase, parse(s.baseColor));\r
      gl.uniform1f(u.uBaseOpacity, s.baseOpacity);\r
      gl.uniform3fv(u.uColors, palette);\r
      gl.uniform1f(u.uEdge, s.edgeFade * Math.min(canvas.width, canvas.height));\r
      gl.uniform1f(u.uCenter, s.centerFade);\r
      gl.uniform2f(u.uPointer, pointer.sx, pointer.sy);\r
      gl.uniform1f(u.uRadius, Math.max(1, s.cursorRadius * view.ratio));\r
      gl.uniform1f(u.uPresence, pointer.presence);\r
      gl.uniform1f(u.uReveal, Math.min(1, s.baseOpacity * 3.5));\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uFlow, s.flow);\r
      gl.uniform1f(u.uFlowScale, Math.max(canvas.width, canvas.height) * 0.32);\r
      if (s.backgroundColor) {\r
        const [r, g, b] = parse(s.backgroundColor);\r
        gl.uniform4f(u.uBackground, r, g, b, 1);\r
      } else {\r
        gl.uniform4f(u.uBackground, 0, 0, 0, 0);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const busy =\r
        (!reduce && s.speed > 0) ||\r
        activeCount > 0 ||\r
        walkers.length > 0 ||\r
        introLeft ||\r
        (pointer.presence !== 0 && pointer.presence !== 1) ||\r
        pointer.stir > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      syncType();\r
      if (grid.cols) buildGrid();\r
      wake();\r
    };\r
\r
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x * view.ratio;\r
      pointer.y = y * view.ratio;\r
      if (pointer.fresh || pointer.presence < 0.02) {\r
        pointer.sx = pointer.x;\r
        pointer.sy = pointer.y;\r
        pointer.fresh = false;\r
      }\r
    };\r
\r
    const onPointerMove = event => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || s.clickEffect === 'none' || reduce || !count) return;\r
      spawnBurst(pointer.x, pointer.y);\r
      wake();\r
    };\r
\r
    const onPointerUp = event => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const onFonts = () => {\r
      typeKey = '';\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    document.fonts?.addEventListener?.('loadingdone', onFonts);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      document.fonts?.removeEventListener?.('loadingdone', onFonts);\r
      gl.deleteTexture(atlasTexture);\r
      gl.deleteTexture(stateTexture);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program.program);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LetterGlitch;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
import './LetterGlitch.css';\r
\r
export type ClickEffect = 'tear' | 'burst' | 'none';\r
\r
export interface LetterGlitchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  glitchColors?: string[];\r
  baseColor?: string;\r
  characters?: string;\r
  fontFamily?: string;\r
  fontSize?: number;\r
  spacing?: number;\r
  density?: number;\r
  baseOpacity?: number;\r
  glitchAmount?: number;\r
  speed?: number;\r
  smooth?: boolean;\r
  interactive?: boolean;\r
  cursorRadius?: number;\r
  clickEffect?: ClickEffect;\r
  flow?: number;\r
  edgeFade?: number;\r
  centerFade?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  backgroundColor?: string;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  baseColor: string;\r
  characters: string;\r
  fontFamily: string;\r
  fontSize: number;\r
  spacing: number;\r
  density: number;\r
  baseOpacity: number;\r
  glitchAmount: number;\r
  speed: number;\r
  smooth: boolean;\r
  interactive: boolean;\r
  cursorRadius: number;\r
  clickEffect: ClickEffect;\r
  flow: number;\r
  edgeFade: number;\r
  centerFade: number;\r
  intro: boolean;\r
  backgroundColor?: string;\r
  dpr?: number;\r
};\r
\r
type Walker = {\r
  x: number;\r
  y: number;\r
  angle: number;\r
  life: number;\r
  span: number;\r
  speed: number;\r
  color: number;\r
  carry: number;\r
  after: number;\r
  wiggle: number;\r
  branch: number;\r
};\r
\r
type WalkerInput = Omit<Walker, 'carry' | 'after' | 'wiggle' | 'branch'> & Partial<Walker>;\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const DEFAULT_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789';\r
const DEFAULT_FONT = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";\r
const DARK_COLORS = ['#ffffff', '#61dca3'];\r
const LIGHT_COLORS = ['#18181b', '#0f9f6e'];\r
const MAX_COLORS = 8;\r
const INTRO_SECONDS = 1.4;\r
const REST_RATE = 0.2;\r
const GLITCH_RATE = 0.1;\r
const MAX_WALKERS = 48;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uAtlas;\r
uniform sampler2D uState;\r
uniform ivec2 uCell;\r
uniform ivec2 uGrid;\r
uniform int uAtlasColumns;\r
uniform vec2 uResolution;\r
uniform vec2 uOrigin;\r
uniform vec3 uBase;\r
uniform float uBaseOpacity;\r
uniform vec3 uColors[8];\r
uniform float uEdge;\r
uniform float uCenter;\r
uniform vec2 uPointer;\r
uniform float uRadius;\r
uniform float uPresence;\r
uniform float uReveal;\r
uniform float uTime;\r
uniform float uFlow;\r
uniform float uFlowScale;\r
uniform vec4 uBackground;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 w = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) - uOrigin;\r
  ivec2 q = ivec2(floor(frag));\r
  ivec2 cell = q / uCell;\r
  vec4 color = vec4(0.0);\r
  if (all(greaterThanEqual(q, ivec2(0))) && all(lessThan(cell, uGrid))) {\r
    vec4 state = texelFetch(uState, cell, 0);\r
    int glyph = int(state.r * 255.0 + 0.5);\r
    ivec2 texel = ivec2(glyph % uAtlasColumns, glyph / uAtlasColumns) * uCell + (q - cell * uCell);\r
    float coverage = texelFetch(uAtlas, texel, 0).a;\r
    if (coverage > 0.0) {\r
      vec2 center = vec2(cell * uCell) + vec2(uCell) * 0.5 + uOrigin;\r
      float mask = 1.0;\r
      if (uEdge > 0.0) {\r
        vec2 edge = min(center, uResolution - center) / uEdge;\r
        mask = smoother(edge.x) * smoother(edge.y);\r
      }\r
      if (uCenter > 0.0) {\r
        vec2 room = max(abs(center - uResolution * 0.5) - uResolution * vec2(0.3, 0.24), 0.0);\r
        float soft = min(uResolution.x, uResolution.y) * 0.24;\r
        mask *= 1.0 - uCenter * (1.0 - smoother(length(room) / soft));\r
      }\r
      float seed = hash(vec2(cell) + 17.0);\r
      float rest = state.g * uBaseOpacity * (0.8 + 0.2 * sin(uTime * (0.5 + 1.2 * seed) + seed * 40.0));\r
      if (uFlow > 0.0) {\r
        vec2 p = center / uFlowScale;\r
        float n = 0.65 * noise(p + vec2(uTime * 0.05, uTime * 0.03)) + 0.35 * noise(p * 2.03 - vec2(uTime * 0.04, -uTime * 0.06));\r
        rest *= mix(1.0, 0.1 + 1.7 * smoothstep(0.25, 0.8, n), uFlow);\r
      }\r
      if (uPresence > 0.0) {\r
        float d = length(center - uPointer) / uRadius;\r
        float f = clamp(1.0 - d * d, 0.0, 1.0);\r
        rest = mix(rest, max(rest, uReveal * step(0.004, state.g)), f * f * uPresence);\r
      }\r
      float heat = state.b;\r
      rest = min(rest, 1.0) * (1.0 - heat);\r
      vec3 tint = uColors[int(state.a * 255.0 + 0.5)];\r
      float weight = coverage * mask;\r
      color = vec4((uBase * rest + tint * heat) * weight, (rest + heat) * weight);\r
    }\r
  }\r
  outColor = color + uBackground * (1.0 - color.a);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const smoother = (value: number) => {\r
  const x = clamp(value, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;\r
  gl.deleteShader(shader);\r
  return null;\r
};\r
\r
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LetterGlitch = ({\r
  glitchColors,\r
  baseColor,\r
  characters = DEFAULT_CHARACTERS,\r
  fontFamily = DEFAULT_FONT,\r
  fontSize = 14,\r
  spacing = 0.6,\r
  density = 0.9,\r
  baseOpacity = 0.16,\r
  glitchAmount = 0.5,\r
  speed = 1,\r
  smooth = true,\r
  interactive = true,\r
  cursorRadius = 140,\r
  clickEffect = 'tear',\r
  flow = 0.5,\r
  edgeFade = 0,\r
  centerFade = 0,\r
  intro = true,\r
  lightMode = false,\r
  backgroundColor,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: LetterGlitchProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const customColors = Array.isArray(glitchColors) && glitchColors.length ? glitchColors : null;\r
  const settings: Settings = {\r
    colors: (customColors || (lightMode ? LIGHT_COLORS : DARK_COLORS)).slice(0, MAX_COLORS),\r
    baseColor: baseColor || (lightMode ? '#18181b' : '#ffffff'),\r
    characters: characters || DEFAULT_CHARACTERS,\r
    fontFamily: fontFamily || DEFAULT_FONT,\r
    fontSize: clamp(fontSize, 6, 96),\r
    spacing: clamp(spacing, 0, 2),\r
    density: clamp(density, 0, 1),\r
    baseOpacity: clamp(baseOpacity, 0, 1),\r
    glitchAmount: clamp(glitchAmount, 0, 1),\r
    speed: Math.max(0, speed),\r
    smooth,\r
    interactive,\r
    cursorRadius: Math.max(0, cursorRadius),\r
    clickEffect,\r
    flow: clamp(flow, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 0.5),\r
    centerFade: clamp(centerFade, 0, 1),\r
    intro,\r
    backgroundColor,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
    const vao = gl.createVertexArray();\r
    const makeTexture = () => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      return texture;\r
    };\r
    const atlasTexture = makeTexture();\r
    const stateTexture = makeTexture();\r
    const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);\r
    const atlas = document.createElement('canvas');\r
    const atlasContext = atlas.getContext('2d');\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    if (!atlasContext) return undefined;\r
\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const grid = { cols: 0, rows: 0, cellW: 0, cellH: 0, originX: 0, originY: 0, atlasColumns: 1 };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, inside: false, presence: 0, stir: 0, fresh: true };\r
    const walkers: Walker[] = [];\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
    const loadedFonts = new Set<string>();\r
    let pool: number[] = [0];\r
    let typeKey = '';\r
    let paletteKey = '';\r
    let colorCount = 1;\r
    let count = 0;\r
    let data = new Uint8Array(0);\r
    let heat = new Float32Array(0);\r
    let peak = new Float32Array(0);\r
    let hold = new Float32Array(0);\r
    let fade = new Float32Array(0);\r
    let wait = new Float32Array(0);\r
    let delay = new Float32Array(0);\r
    let luck = new Float32Array(0);\r
    let level = new Float32Array(0);\r
    let born = new Float32Array(0);\r
    let slot = new Int32Array(0);\r
    let active = new Int32Array(0);\r
    let activeCount = 0;\r
    let introLeft = settingsRef.current.intro && !reduce;\r
    let clock = 0;\r
    let time = 0;\r
    let density = -1;\r
    let restCarry = 0;\r
    let glitchCarry = 0;\r
    let cursorCarry = 0;\r
    let dirty = true;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const randomGlyph = () => pool[(Math.random() * pool.length) | 0];\r
    const randomColor = () => (Math.random() * colorCount) | 0;\r
\r
    const restValue = (i: number, appear = 1) =>\r
      luck[i] < settingsRef.current.density ? Math.round(level[i] * 255 * appear) : 0;\r
\r
    const cellAt = (x: number, y: number) => {\r
      const c = Math.floor((x - grid.originX) / grid.cellW);\r
      const r = Math.floor((y - grid.originY) / grid.cellH);\r
      if (c < 0 || r < 0 || c >= grid.cols || r >= grid.rows) return -1;\r
      return r * grid.cols + c;\r
    };\r
\r
    const ignite = (i: number, strength: number, holdTime: number, fadeTime: number, color: number, after = 0) => {\r
      if (slot[i] < 0) {\r
        slot[i] = activeCount;\r
        active[activeCount++] = i;\r
        heat[i] = 0;\r
        hold[i] = holdTime;\r
        peak[i] = strength;\r
        fade[i] = fadeTime;\r
        wait[i] = 0;\r
        delay[i] = after;\r
        data[i * 4 + 3] = color;\r
        return;\r
      }\r
      if (heat[i] < 0.15) data[i * 4 + 3] = color;\r
      peak[i] = hold[i] > 0 ? Math.max(peak[i], strength) : strength;\r
      hold[i] = Math.max(hold[i], holdTime);\r
      fade[i] = Math.max(fade[i], fadeTime);\r
      delay[i] = Math.min(delay[i], after);\r
    };\r
\r
    const release = (k: number) => {\r
      const i = active[k];\r
      const moved = active[--activeCount];\r
      active[k] = moved;\r
      slot[moved] = k;\r
      slot[i] = -1;\r
      heat[i] = 0;\r
      data[i * 4 + 2] = 0;\r
    };\r
\r
    const buildType = () => {\r
      const s = settingsRef.current;\r
      const size = s.fontSize * view.ratio;\r
      const font = \`\${size}px \${s.fontFamily}\`;\r
      const chars = Array.from(s.characters);\r
      const unique = Array.from(new Set(chars)).slice(0, 256);\r
      atlasContext.font = font;\r
      let advance = 1;\r
      unique.forEach(char => {\r
        advance = Math.max(advance, atlasContext.measureText(char).width);\r
      });\r
      const metrics = atlasContext.measureText('M');\r
      const cellW = Math.max(2, Math.ceil(advance + size * s.spacing));\r
      const cellH = Math.max(2, Math.ceil(size * (0.95 + s.spacing)));\r
      const columns = Math.max(1, Math.min(unique.length, Math.floor(maxSize / cellW)));\r
      atlas.width = columns * cellW;\r
      atlas.height = Math.ceil(unique.length / columns) * cellH;\r
      atlasContext.font = font;\r
      atlasContext.textAlign = 'center';\r
      atlasContext.textBaseline = 'alphabetic';\r
      atlasContext.fillStyle = '#ffffff';\r
      const baseline = cellH / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;\r
      unique.forEach((char, i) => {\r
        atlasContext.fillText(char, (i % columns) * cellW + cellW / 2, Math.floor(i / columns) * cellH + baseline);\r
      });\r
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);\r
      const lookup = new Map(unique.map((char, i) => [char, i]));\r
      const nextPool = chars.map(char => lookup.get(char)).filter((index): index is number => index !== undefined);\r
      const charsChanged = nextPool.length !== pool.length || nextPool.some((index, i) => index !== pool[i]);\r
      pool = nextPool.length ? nextPool : [0];\r
      const resized = cellW !== grid.cellW || cellH !== grid.cellH;\r
      grid.cellW = cellW;\r
      grid.cellH = cellH;\r
      grid.atlasColumns = columns;\r
      if (!loadedFonts.has(font) && document.fonts?.load) {\r
        loadedFonts.add(font);\r
        document.fonts\r
          .load(font, s.characters)\r
          .then(() => {\r
            if (!alive) return;\r
            typeKey = '';\r
            wake();\r
          })\r
          .catch(() => {});\r
      }\r
      return { resized, charsChanged };\r
    };\r
\r
    const birthTime = (c: number, r: number, cols: number, rows: number) => {\r
      const dx = (c + 0.5) / cols - 0.5;\r
      const dy = (r + 0.5) / rows - 0.5;\r
      const radial = Math.min(1, Math.hypot(dx, dy * 0.8) * 1.6);\r
      return INTRO_SECONDS * (0.3 * radial + 0.7 * Math.random() ** 1.3);\r
    };\r
\r
    const buildGrid = () => {\r
      const cols = Math.ceil(canvas.width / grid.cellW) + 1;\r
      const rows = Math.ceil(canvas.height / grid.cellH) + 1;\r
      grid.originX = Math.floor((canvas.width - cols * grid.cellW) / 2);\r
      grid.originY = Math.floor((canvas.height - rows * grid.cellH) / 2);\r
      if (cols === grid.cols && rows === grid.rows) return;\r
      const n = cols * rows;\r
      const nextData = new Uint8Array(n * 4);\r
      const nextLuck = new Float32Array(n);\r
      const nextLevel = new Float32Array(n);\r
      const nextBorn = new Float32Array(n);\r
      const shiftC = Math.floor((grid.cols - cols) / 2);\r
      const shiftR = Math.floor((grid.rows - rows) / 2);\r
      for (let r = 0; r < rows; r++) {\r
        for (let c = 0; c < cols; c++) {\r
          const i = r * cols + c;\r
          const oc = c + shiftC;\r
          const or = r + shiftR;\r
          if (oc >= 0 && or >= 0 && oc < grid.cols && or < grid.rows) {\r
            const j = or * grid.cols + oc;\r
            nextData[i * 4] = data[j * 4];\r
            nextData[i * 4 + 1] = data[j * 4 + 1];\r
            nextLuck[i] = luck[j];\r
            nextLevel[i] = level[j];\r
            nextBorn[i] = born[j];\r
          } else {\r
            nextData[i * 4] = randomGlyph();\r
            nextLuck[i] = Math.random();\r
            nextLevel[i] = 0.55 + 0.45 * Math.random();\r
            nextBorn[i] = introLeft ? birthTime(c, r, cols, rows) : -1;\r
          }\r
        }\r
      }\r
      grid.cols = cols;\r
      grid.rows = rows;\r
      count = n;\r
      data = nextData;\r
      luck = nextLuck;\r
      level = nextLevel;\r
      born = nextBorn;\r
      heat = new Float32Array(n);\r
      peak = new Float32Array(n);\r
      hold = new Float32Array(n);\r
      fade = new Float32Array(n);\r
      wait = new Float32Array(n);\r
      delay = new Float32Array(n);\r
      slot = new Int32Array(n).fill(-1);\r
      active = new Int32Array(n);\r
      activeCount = 0;\r
      walkers.length = 0;\r
      for (let i = 0; i < n; i++) data[i * 4 + 1] = born[i] >= 0 ? 0 : restValue(i);\r
      density = settingsRef.current.density;\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
      dirty = false;\r
    };\r
\r
    const syncType = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.fontSize * view.ratio}|\${s.fontFamily}|\${s.spacing}|\${s.characters}\`;\r
      if (key === typeKey) return;\r
      typeKey = key;\r
      const { resized, charsChanged } = buildType();\r
      if (resized || !grid.cols) buildGrid();\r
      if (charsChanged) {\r
        for (let i = 0; i < count; i++) data[i * 4] = randomGlyph();\r
        dirty = true;\r
      }\r
    };\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = s.colors.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      colorCount = Math.max(1, s.colors.length);\r
      for (let i = 0; i < MAX_COLORS; i++) {\r
        const rgb = parse(s.colors[Math.min(i, colorCount - 1)] ?? '#ffffff');\r
        palette[i * 3] = rgb[0];\r
        palette[i * 3 + 1] = rgb[1];\r
        palette[i * 3 + 2] = rgb[2];\r
      }\r
      for (let i = 0; i < count; i++) {\r
        if (data[i * 4 + 3] >= colorCount) data[i * 4 + 3] = randomColor();\r
      }\r
      dirty = true;\r
    };\r
\r
    const addWalker = (walker: WalkerInput) => {\r
      if (walkers.length < MAX_WALKERS) walkers.push({ carry: 0, after: 0, wiggle: 0, branch: 0, ...walker });\r
    };\r
\r
    const spawnTear = (x: number, y: number) => {\r
      const center = cellAt(x, y);\r
      if (center < 0) return;\r
      const r0 = Math.floor(center / grid.cols);\r
      const width = grid.cols * grid.cellW;\r
      for (let dr = -2; dr <= 2; dr++) {\r
        const r = r0 + dr;\r
        if (r < 0 || r >= grid.rows) continue;\r
        const weight = 1 - Math.abs(dr) / 3;\r
        if (dr !== 0 && Math.random() > 0.3 + 0.6 * weight) continue;\r
        const color = randomColor();\r
        const rowY = grid.originY + (r + 0.5) * grid.cellH;\r
        const shift = (Math.random() - 0.5) * 6 * grid.cellW * (1 - weight);\r
        [0, Math.PI].forEach(angle => {\r
          const life = width * (0.12 + 0.5 * weight * (0.4 + 0.6 * Math.random()));\r
          addWalker({\r
            x: x + shift,\r
            y: rowY,\r
            angle,\r
            life,\r
            span: life,\r
            speed: (2200 + Math.random() * 1200) * view.ratio,\r
            after: Math.abs(dr) * 0.035 + Math.random() * 0.03,\r
            color\r
          });\r
        });\r
      }\r
    };\r
\r
    const spawnRays = (x: number, y: number) => {\r
      const reach = Math.min(view.width, view.height) * view.ratio;\r
      const rays = 5 + ((Math.random() * 3) | 0);\r
      const turn = Math.random() * Math.PI * 2;\r
      for (let k = 0; k < rays; k++) {\r
        const life = reach * (0.25 + Math.random() * 0.3);\r
        addWalker({\r
          x,\r
          y,\r
          angle: turn + (k / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.4,\r
          life,\r
          span: life,\r
          speed: (700 + Math.random() * 400) * view.ratio,\r
          wiggle: 0.2,\r
          branch: 0.03,\r
          color: randomColor()\r
        });\r
      }\r
    };\r
\r
    const spawnBurst = (x: number, y: number) => {\r
      const center = cellAt(x, y);\r
      if (center < 0) return;\r
      ignite(center, 1, 0.08, 0.8, randomColor());\r
      if (settingsRef.current.clickEffect === 'burst') spawnRays(x, y);\r
      else spawnTear(x, y);\r
    };\r
\r
    const stepWalkers = (dt: number) => {\r
      for (let k = walkers.length - 1; k >= 0; k--) {\r
        const w = walkers[k];\r
        if (w.after > 0) {\r
          w.after -= dt;\r
          continue;\r
        }\r
        const step = Math.max(\r
          1,\r
          Math.abs(Math.cos(w.angle)) * grid.cellW + Math.abs(Math.sin(w.angle)) * grid.cellH * 0.6\r
        );\r
        w.carry += w.speed * dt;\r
        while (w.carry >= step && w.life > 0) {\r
          w.carry -= step;\r
          w.life -= step;\r
          w.angle += (Math.random() - 0.5) * w.wiggle;\r
          w.x += Math.cos(w.angle) * step;\r
          w.y += Math.sin(w.angle) * step;\r
          const i = cellAt(w.x, w.y);\r
          if (i < 0) {\r
            w.life = 0;\r
            break;\r
          }\r
          const left = w.life / w.span;\r
          ignite(i, 0.5 + 0.5 * left, 0.03 + Math.random() * 0.05, 0.5 + 0.5 * left, w.color);\r
          if (w.branch && Math.random() < w.branch) {\r
            const side = Math.random() < 0.5 ? -1 : 1;\r
            const life = w.life * (0.45 + Math.random() * 0.3);\r
            addWalker({\r
              x: w.x,\r
              y: w.y,\r
              angle: w.angle + side * (0.5 + Math.random() * 0.5),\r
              life,\r
              span: w.span,\r
              speed: w.speed,\r
              wiggle: w.wiggle,\r
              color: w.color\r
            });\r
          }\r
        }\r
        if (w.life <= 0) walkers.splice(k, 1);\r
      }\r
    };\r
\r
    const ambient = (dt: number) => {\r
      const s = settingsRef.current;\r
      if (reduce || s.speed <= 0 || !count) return;\r
      restCarry += count * REST_RATE * s.speed * dt;\r
      let changes = Math.min(count, restCarry | 0);\r
      restCarry -= changes;\r
      while (changes-- > 0) {\r
        const i = (Math.random() * count) | 0;\r
        if (slot[i] < 0) {\r
          data[i * 4] = randomGlyph();\r
          dirty = true;\r
        }\r
      }\r
      const tempo = Math.max(s.speed, 0.2);\r
      glitchCarry += count * s.glitchAmount ** 1.6 * GLITCH_RATE * s.speed * dt;\r
      let events = Math.min(count, glitchCarry | 0);\r
      glitchCarry -= events;\r
      while (events-- > 0) {\r
        const i = (Math.random() * count) | 0;\r
        const color = randomColor();\r
        const strength = 0.45 + 0.55 * Math.random();\r
        const holdTime = (0.04 + Math.random() * 0.26) / tempo;\r
        const fadeTime = (0.45 + Math.random() * 0.6) / tempo;\r
        const roll = Math.random();\r
        if (roll < 0.24) {\r
          const c = i % grid.cols;\r
          const long = roll < 0.015;\r
          const length = Math.min(\r
            grid.cols - c,\r
            long ? 10 + ((Math.random() * 24) | 0) : 2 + ((Math.random() * 7) | 0)\r
          );\r
          const pace = (long ? 0.012 : 0.028) / tempo;\r
          for (let k = 0; k < length; k++) ignite(i + k, strength, holdTime, fadeTime, color, k * pace);\r
        } else {\r
          ignite(i, strength, holdTime, fadeTime, color);\r
        }\r
      }\r
    };\r
\r
    const excite = (dt: number) => {\r
      const s = settingsRef.current;\r
      if (pointer.presence < 0.02 || reduce || !count) return;\r
      const radius = s.cursorRadius * view.ratio;\r
      if (radius < 1) return;\r
      const c0 = Math.max(0, Math.floor((pointer.sx - radius - grid.originX) / grid.cellW));\r
      const c1 = Math.min(grid.cols - 1, Math.floor((pointer.sx + radius - grid.originX) / grid.cellW));\r
      const r0 = Math.max(0, Math.floor((pointer.sy - radius - grid.originY) / grid.cellH));\r
      const r1 = Math.min(grid.rows - 1, Math.floor((pointer.sy + radius - grid.originY) / grid.cellH));\r
      const chance = pointer.presence * (3 + 9 * pointer.stir) * dt;\r
      for (let r = r0; r <= r1; r++) {\r
        const dy = (grid.originY + (r + 0.5) * grid.cellH - pointer.sy) / radius;\r
        for (let c = c0; c <= c1; c++) {\r
          const dx = (grid.originX + (c + 0.5) * grid.cellW - pointer.sx) / radius;\r
          const d = dx * dx + dy * dy;\r
          if (d >= 1) continue;\r
          const i = r * grid.cols + c;\r
          if (slot[i] < 0 && Math.random() < (1 - d) * (1 - d) * chance) {\r
            data[i * 4] = randomGlyph();\r
            dirty = true;\r
          }\r
        }\r
      }\r
      const cells = (Math.PI * radius * radius) / (grid.cellW * grid.cellH);\r
      cursorCarry += cells * pointer.presence * (0.15 + 4 * pointer.stir) * dt;\r
      let sparks = Math.min(512, cursorCarry | 0);\r
      cursorCarry -= sparks;\r
      while (sparks-- > 0) {\r
        const angle = Math.random() * Math.PI * 2;\r
        const distance = Math.sqrt(Math.random());\r
        const falloff = (1 - distance * distance) ** 2;\r
        if (Math.random() > falloff) continue;\r
        const i = cellAt(\r
          pointer.sx + Math.cos(angle) * distance * radius,\r
          pointer.sy + Math.sin(angle) * distance * radius\r
        );\r
        if (i < 0) continue;\r
        ignite(\r
          i,\r
          (0.3 + 0.7 * Math.random()) * (0.45 + 0.55 * pointer.stir),\r
          0.02 + Math.random() * 0.08,\r
          0.35 + Math.random() * 0.4,\r
          randomColor()\r
        );\r
      }\r
    };\r
\r
    const settle = (dt: number) => {\r
      const s = settingsRef.current;\r
      const tempo = Math.max(s.speed, 0.5);\r
      const attack = 1 - Math.exp(-dt / 0.05);\r
      for (let k = 0; k < activeCount; ) {\r
        const i = active[k];\r
        if (delay[i] > 0) {\r
          delay[i] -= dt;\r
          k++;\r
          continue;\r
        }\r
        let h = heat[i];\r
        if (hold[i] > 0) {\r
          hold[i] -= dt;\r
          h = s.smooth ? h + (peak[i] - h) * attack : peak[i];\r
        } else {\r
          h = s.smooth ? h * Math.exp((-dt * 4) / Math.max(fade[i], 0.05)) : 0;\r
        }\r
        if (h < 0.012 && hold[i] <= 0) {\r
          release(k);\r
          dirty = true;\r
          continue;\r
        }\r
        heat[i] = h;\r
        wait[i] -= dt;\r
        if (wait[i] <= 0) {\r
          data[i * 4] = randomGlyph();\r
          wait[i] = ((0.045 + 0.45 * (1 - h) * (1 - h)) * (0.6 + 0.8 * Math.random())) / tempo;\r
        }\r
        data[i * 4 + 2] = Math.round(h * 255);\r
        dirty = true;\r
        k++;\r
      }\r
    };\r
\r
    const reveal = (dt: number) => {\r
      if (!introLeft) return;\r
      const s = settingsRef.current;\r
      let pending = false;\r
      for (let i = 0; i < count; i++) {\r
        const t = born[i];\r
        if (t < 0) continue;\r
        const age = clock - t;\r
        if (age < 0) {\r
          pending = true;\r
          continue;\r
        }\r
        if (age < dt && Math.random() < (luck[i] < s.density ? 0.45 : 0.12)) {\r
          ignite(i, 0.4 + 0.5 * Math.random(), 0.02, 0.35 + Math.random() * 0.35, randomColor());\r
        }\r
        const appear = s.smooth ? smoother(age / 0.35) : 1;\r
        data[i * 4 + 1] = restValue(i, appear);\r
        if (appear >= 1) born[i] = -1;\r
        else pending = true;\r
      }\r
      dirty = true;\r
      if (!pending) introLeft = false;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!reduce) time += dt * s.speed;\r
      syncType();\r
      syncPalette();\r
      if (s.density !== density) {\r
        density = s.density;\r
        for (let i = 0; i < count; i++) if (born[i] < 0) data[i * 4 + 1] = restValue(i);\r
        dirty = true;\r
      }\r
      const goal = s.interactive && pointer.inside && !reduce ? 1 : 0;\r
      pointer.presence += (goal - pointer.presence) * (1 - Math.exp(-dt / 0.25));\r
      if (Math.abs(goal - pointer.presence) < 0.002) pointer.presence = goal;\r
      const px = pointer.sx;\r
      const py = pointer.sy;\r
      const follow = 1 - Math.exp(-dt / 0.07);\r
      pointer.sx += (pointer.x - pointer.sx) * follow;\r
      pointer.sy += (pointer.y - pointer.sy) * follow;\r
      const moved = Math.hypot(pointer.sx - px, pointer.sy - py) / view.ratio / dt;\r
      pointer.stir += (clamp(moved / 1400, 0, 1) - pointer.stir) * (1 - Math.exp(-dt / 0.12));\r
      if (pointer.stir < 0.001) pointer.stir = 0;\r
      reveal(dt);\r
      ambient(dt);\r
      excite(dt);\r
      stepWalkers(dt);\r
      settle(dt);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      if (dirty) {\r
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, grid.cols, grid.rows, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
        dirty = false;\r
      }\r
      gl.uniform1i(u.uState, 1);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
      gl.uniform1i(u.uAtlas, 0);\r
      gl.uniform2i(u.uCell, grid.cellW, grid.cellH);\r
      gl.uniform2i(u.uGrid, grid.cols, grid.rows);\r
      gl.uniform1i(u.uAtlasColumns, grid.atlasColumns);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uOrigin, grid.originX, grid.originY);\r
      gl.uniform3fv(u.uBase, parse(s.baseColor));\r
      gl.uniform1f(u.uBaseOpacity, s.baseOpacity);\r
      gl.uniform3fv(u.uColors, palette);\r
      gl.uniform1f(u.uEdge, s.edgeFade * Math.min(canvas.width, canvas.height));\r
      gl.uniform1f(u.uCenter, s.centerFade);\r
      gl.uniform2f(u.uPointer, pointer.sx, pointer.sy);\r
      gl.uniform1f(u.uRadius, Math.max(1, s.cursorRadius * view.ratio));\r
      gl.uniform1f(u.uPresence, pointer.presence);\r
      gl.uniform1f(u.uReveal, Math.min(1, s.baseOpacity * 3.5));\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uFlow, s.flow);\r
      gl.uniform1f(u.uFlowScale, Math.max(canvas.width, canvas.height) * 0.32);\r
      if (s.backgroundColor) {\r
        const [r, g, b] = parse(s.backgroundColor);\r
        gl.uniform4f(u.uBackground, r, g, b, 1);\r
      } else {\r
        gl.uniform4f(u.uBackground, 0, 0, 0, 0);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const busy =\r
        (!reduce && s.speed > 0) ||\r
        activeCount > 0 ||\r
        walkers.length > 0 ||\r
        introLeft ||\r
        (pointer.presence !== 0 && pointer.presence !== 1) ||\r
        pointer.stir > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      syncType();\r
      if (grid.cols) buildGrid();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x * view.ratio;\r
      pointer.y = y * view.ratio;\r
      if (pointer.fresh || pointer.presence < 0.02) {\r
        pointer.sx = pointer.x;\r
        pointer.sy = pointer.y;\r
        pointer.fresh = false;\r
      }\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || s.clickEffect === 'none' || reduce || !count) return;\r
      spawnBurst(pointer.x, pointer.y);\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const onFonts = () => {\r
      typeKey = '';\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    document.fonts?.addEventListener?.('loadingdone', onFonts);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      document.fonts?.removeEventListener?.('loadingdone', onFonts);\r
      gl.deleteTexture(atlasTexture);\r
      gl.deleteTexture(stateTexture);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program.program);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`letter-glitch\${className ? \` \${className}\` : ''}\`} style={style} {...rest}>\r
      <canvas ref={canvasRef} className="letter-glitch-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LetterGlitch;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
export type ClickEffect = 'tear' | 'burst' | 'none';\r
\r
export interface LetterGlitchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  glitchColors?: string[];\r
  baseColor?: string;\r
  characters?: string;\r
  fontFamily?: string;\r
  fontSize?: number;\r
  spacing?: number;\r
  density?: number;\r
  baseOpacity?: number;\r
  glitchAmount?: number;\r
  speed?: number;\r
  smooth?: boolean;\r
  interactive?: boolean;\r
  cursorRadius?: number;\r
  clickEffect?: ClickEffect;\r
  flow?: number;\r
  edgeFade?: number;\r
  centerFade?: number;\r
  intro?: boolean;\r
  lightMode?: boolean;\r
  backgroundColor?: string;\r
  dpr?: number;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  colors: string[];\r
  baseColor: string;\r
  characters: string;\r
  fontFamily: string;\r
  fontSize: number;\r
  spacing: number;\r
  density: number;\r
  baseOpacity: number;\r
  glitchAmount: number;\r
  speed: number;\r
  smooth: boolean;\r
  interactive: boolean;\r
  cursorRadius: number;\r
  clickEffect: ClickEffect;\r
  flow: number;\r
  edgeFade: number;\r
  centerFade: number;\r
  intro: boolean;\r
  backgroundColor?: string;\r
  dpr?: number;\r
};\r
\r
type Walker = {\r
  x: number;\r
  y: number;\r
  angle: number;\r
  life: number;\r
  span: number;\r
  speed: number;\r
  color: number;\r
  carry: number;\r
  after: number;\r
  wiggle: number;\r
  branch: number;\r
};\r
\r
type WalkerInput = Omit<Walker, 'carry' | 'after' | 'wiggle' | 'branch'> & Partial<Walker>;\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const DEFAULT_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789';\r
const DEFAULT_FONT = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";\r
const DARK_COLORS = ['#ffffff', '#61dca3'];\r
const LIGHT_COLORS = ['#18181b', '#0f9f6e'];\r
const MAX_COLORS = 8;\r
const INTRO_SECONDS = 1.4;\r
const REST_RATE = 0.2;\r
const GLITCH_RATE = 0.1;\r
const MAX_WALKERS = 48;\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
uniform sampler2D uAtlas;\r
uniform sampler2D uState;\r
uniform ivec2 uCell;\r
uniform ivec2 uGrid;\r
uniform int uAtlasColumns;\r
uniform vec2 uResolution;\r
uniform vec2 uOrigin;\r
uniform vec3 uBase;\r
uniform float uBaseOpacity;\r
uniform vec3 uColors[8];\r
uniform float uEdge;\r
uniform float uCenter;\r
uniform vec2 uPointer;\r
uniform float uRadius;\r
uniform float uPresence;\r
uniform float uReveal;\r
uniform float uTime;\r
uniform float uFlow;\r
uniform float uFlowScale;\r
uniform vec4 uBackground;\r
out vec4 outColor;\r
\r
float hash(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 w = f * f * (3.0 - 2.0 * f);\r
  float a = hash(i);\r
  float b = hash(i + vec2(1.0, 0.0));\r
  float c = hash(i + vec2(0.0, 1.0));\r
  float d = hash(i + vec2(1.0, 1.0));\r
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);\r
}\r
\r
float smoother(float x) {\r
  x = clamp(x, 0.0, 1.0);\r
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);\r
}\r
\r
void main() {\r
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) - uOrigin;\r
  ivec2 q = ivec2(floor(frag));\r
  ivec2 cell = q / uCell;\r
  vec4 color = vec4(0.0);\r
  if (all(greaterThanEqual(q, ivec2(0))) && all(lessThan(cell, uGrid))) {\r
    vec4 state = texelFetch(uState, cell, 0);\r
    int glyph = int(state.r * 255.0 + 0.5);\r
    ivec2 texel = ivec2(glyph % uAtlasColumns, glyph / uAtlasColumns) * uCell + (q - cell * uCell);\r
    float coverage = texelFetch(uAtlas, texel, 0).a;\r
    if (coverage > 0.0) {\r
      vec2 center = vec2(cell * uCell) + vec2(uCell) * 0.5 + uOrigin;\r
      float mask = 1.0;\r
      if (uEdge > 0.0) {\r
        vec2 edge = min(center, uResolution - center) / uEdge;\r
        mask = smoother(edge.x) * smoother(edge.y);\r
      }\r
      if (uCenter > 0.0) {\r
        vec2 room = max(abs(center - uResolution * 0.5) - uResolution * vec2(0.3, 0.24), 0.0);\r
        float soft = min(uResolution.x, uResolution.y) * 0.24;\r
        mask *= 1.0 - uCenter * (1.0 - smoother(length(room) / soft));\r
      }\r
      float seed = hash(vec2(cell) + 17.0);\r
      float rest = state.g * uBaseOpacity * (0.8 + 0.2 * sin(uTime * (0.5 + 1.2 * seed) + seed * 40.0));\r
      if (uFlow > 0.0) {\r
        vec2 p = center / uFlowScale;\r
        float n = 0.65 * noise(p + vec2(uTime * 0.05, uTime * 0.03)) + 0.35 * noise(p * 2.03 - vec2(uTime * 0.04, -uTime * 0.06));\r
        rest *= mix(1.0, 0.1 + 1.7 * smoothstep(0.25, 0.8, n), uFlow);\r
      }\r
      if (uPresence > 0.0) {\r
        float d = length(center - uPointer) / uRadius;\r
        float f = clamp(1.0 - d * d, 0.0, 1.0);\r
        rest = mix(rest, max(rest, uReveal * step(0.004, state.g)), f * f * uPresence);\r
      }\r
      float heat = state.b;\r
      rest = min(rest, 1.0) * (1.0 - heat);\r
      vec3 tint = uColors[int(state.a * 255.0 + 0.5)];\r
      float weight = coverage * mask;\r
      color = vec4((uBase * rest + tint * heat) * weight, (rest + heat) * weight);\r
    }\r
  }\r
  outColor = color + uBackground * (1.0 - color.a);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const smoother = (value: number) => {\r
  const x = clamp(value, 0, 1);\r
  return x * x * x * (x * (x * 6 - 15) + 10);\r
};\r
\r
const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {\r
  const shader = gl.createShader(type);\r
  if (!shader) return null;\r
  gl.shaderSource(shader, source);\r
  gl.compileShader(shader);\r
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;\r
  gl.deleteShader(shader);\r
  return null;\r
};\r
\r
const link = (gl: WebGL2RenderingContext): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\r
    gl.deleteProgram(program);\r
    return null;\r
  }\r
  const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < count; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (!info) continue;\r
    const name = info.name.replace(/\\[0\\]$/, '');\r
    uniforms[name] = gl.getUniformLocation(program, name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const LetterGlitch = ({\r
  glitchColors,\r
  baseColor,\r
  characters = DEFAULT_CHARACTERS,\r
  fontFamily = DEFAULT_FONT,\r
  fontSize = 14,\r
  spacing = 0.6,\r
  density = 0.9,\r
  baseOpacity = 0.16,\r
  glitchAmount = 0.5,\r
  speed = 1,\r
  smooth = true,\r
  interactive = true,\r
  cursorRadius = 140,\r
  clickEffect = 'tear',\r
  flow = 0.5,\r
  edgeFade = 0,\r
  centerFade = 0,\r
  intro = true,\r
  lightMode = false,\r
  backgroundColor,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: LetterGlitchProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const customColors = Array.isArray(glitchColors) && glitchColors.length ? glitchColors : null;\r
  const settings: Settings = {\r
    colors: (customColors || (lightMode ? LIGHT_COLORS : DARK_COLORS)).slice(0, MAX_COLORS),\r
    baseColor: baseColor || (lightMode ? '#18181b' : '#ffffff'),\r
    characters: characters || DEFAULT_CHARACTERS,\r
    fontFamily: fontFamily || DEFAULT_FONT,\r
    fontSize: clamp(fontSize, 6, 96),\r
    spacing: clamp(spacing, 0, 2),\r
    density: clamp(density, 0, 1),\r
    baseOpacity: clamp(baseOpacity, 0, 1),\r
    glitchAmount: clamp(glitchAmount, 0, 1),\r
    speed: Math.max(0, speed),\r
    smooth,\r
    interactive,\r
    cursorRadius: Math.max(0, cursorRadius),\r
    clickEffect,\r
    flow: clamp(flow, 0, 1),\r
    edgeFade: clamp(edgeFade, 0, 0.5),\r
    centerFade: clamp(centerFade, 0, 1),\r
    intro,\r
    backgroundColor,\r
    dpr\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', {\r
      alpha: true,\r
      premultipliedAlpha: true,\r
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl);\r
    if (!program) return undefined;\r
    const u = program.uniforms;\r
    const vao = gl.createVertexArray();\r
    const makeTexture = () => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      return texture;\r
    };\r
    const atlasTexture = makeTexture();\r
    const stateTexture = makeTexture();\r
    const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);\r
    const atlas = document.createElement('canvas');\r
    const atlasContext = atlas.getContext('2d');\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    if (!atlasContext) return undefined;\r
\r
    const colorCache = new Map<string, number[]>();\r
    const parse = (value: string): number[] => {\r
      const key = String(value);\r
      const cached = colorCache.get(key);\r
      if (cached) return cached;\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = key;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(key, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1 };\r
    const grid = { cols: 0, rows: 0, cellW: 0, cellH: 0, originX: 0, originY: 0, atlasColumns: 1 };\r
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, inside: false, presence: 0, stir: 0, fresh: true };\r
    const walkers: Walker[] = [];\r
    const palette = new Float32Array(MAX_COLORS * 3);\r
    const loadedFonts = new Set<string>();\r
    let pool: number[] = [0];\r
    let typeKey = '';\r
    let paletteKey = '';\r
    let colorCount = 1;\r
    let count = 0;\r
    let data = new Uint8Array(0);\r
    let heat = new Float32Array(0);\r
    let peak = new Float32Array(0);\r
    let hold = new Float32Array(0);\r
    let fade = new Float32Array(0);\r
    let wait = new Float32Array(0);\r
    let delay = new Float32Array(0);\r
    let luck = new Float32Array(0);\r
    let level = new Float32Array(0);\r
    let born = new Float32Array(0);\r
    let slot = new Int32Array(0);\r
    let active = new Int32Array(0);\r
    let activeCount = 0;\r
    let introLeft = settingsRef.current.intro && !reduce;\r
    let clock = 0;\r
    let time = 0;\r
    let density = -1;\r
    let restCarry = 0;\r
    let glitchCarry = 0;\r
    let cursorCarry = 0;\r
    let dirty = true;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const randomGlyph = () => pool[(Math.random() * pool.length) | 0];\r
    const randomColor = () => (Math.random() * colorCount) | 0;\r
\r
    const restValue = (i: number, appear = 1) =>\r
      luck[i] < settingsRef.current.density ? Math.round(level[i] * 255 * appear) : 0;\r
\r
    const cellAt = (x: number, y: number) => {\r
      const c = Math.floor((x - grid.originX) / grid.cellW);\r
      const r = Math.floor((y - grid.originY) / grid.cellH);\r
      if (c < 0 || r < 0 || c >= grid.cols || r >= grid.rows) return -1;\r
      return r * grid.cols + c;\r
    };\r
\r
    const ignite = (i: number, strength: number, holdTime: number, fadeTime: number, color: number, after = 0) => {\r
      if (slot[i] < 0) {\r
        slot[i] = activeCount;\r
        active[activeCount++] = i;\r
        heat[i] = 0;\r
        hold[i] = holdTime;\r
        peak[i] = strength;\r
        fade[i] = fadeTime;\r
        wait[i] = 0;\r
        delay[i] = after;\r
        data[i * 4 + 3] = color;\r
        return;\r
      }\r
      if (heat[i] < 0.15) data[i * 4 + 3] = color;\r
      peak[i] = hold[i] > 0 ? Math.max(peak[i], strength) : strength;\r
      hold[i] = Math.max(hold[i], holdTime);\r
      fade[i] = Math.max(fade[i], fadeTime);\r
      delay[i] = Math.min(delay[i], after);\r
    };\r
\r
    const release = (k: number) => {\r
      const i = active[k];\r
      const moved = active[--activeCount];\r
      active[k] = moved;\r
      slot[moved] = k;\r
      slot[i] = -1;\r
      heat[i] = 0;\r
      data[i * 4 + 2] = 0;\r
    };\r
\r
    const buildType = () => {\r
      const s = settingsRef.current;\r
      const size = s.fontSize * view.ratio;\r
      const font = \`\${size}px \${s.fontFamily}\`;\r
      const chars = Array.from(s.characters);\r
      const unique = Array.from(new Set(chars)).slice(0, 256);\r
      atlasContext.font = font;\r
      let advance = 1;\r
      unique.forEach(char => {\r
        advance = Math.max(advance, atlasContext.measureText(char).width);\r
      });\r
      const metrics = atlasContext.measureText('M');\r
      const cellW = Math.max(2, Math.ceil(advance + size * s.spacing));\r
      const cellH = Math.max(2, Math.ceil(size * (0.95 + s.spacing)));\r
      const columns = Math.max(1, Math.min(unique.length, Math.floor(maxSize / cellW)));\r
      atlas.width = columns * cellW;\r
      atlas.height = Math.ceil(unique.length / columns) * cellH;\r
      atlasContext.font = font;\r
      atlasContext.textAlign = 'center';\r
      atlasContext.textBaseline = 'alphabetic';\r
      atlasContext.fillStyle = '#ffffff';\r
      const baseline = cellH / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;\r
      unique.forEach((char, i) => {\r
        atlasContext.fillText(char, (i % columns) * cellW + cellW / 2, Math.floor(i / columns) * cellH + baseline);\r
      });\r
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);\r
      const lookup = new Map(unique.map((char, i) => [char, i]));\r
      const nextPool = chars.map(char => lookup.get(char)).filter((index): index is number => index !== undefined);\r
      const charsChanged = nextPool.length !== pool.length || nextPool.some((index, i) => index !== pool[i]);\r
      pool = nextPool.length ? nextPool : [0];\r
      const resized = cellW !== grid.cellW || cellH !== grid.cellH;\r
      grid.cellW = cellW;\r
      grid.cellH = cellH;\r
      grid.atlasColumns = columns;\r
      if (!loadedFonts.has(font) && document.fonts?.load) {\r
        loadedFonts.add(font);\r
        document.fonts\r
          .load(font, s.characters)\r
          .then(() => {\r
            if (!alive) return;\r
            typeKey = '';\r
            wake();\r
          })\r
          .catch(() => {});\r
      }\r
      return { resized, charsChanged };\r
    };\r
\r
    const birthTime = (c: number, r: number, cols: number, rows: number) => {\r
      const dx = (c + 0.5) / cols - 0.5;\r
      const dy = (r + 0.5) / rows - 0.5;\r
      const radial = Math.min(1, Math.hypot(dx, dy * 0.8) * 1.6);\r
      return INTRO_SECONDS * (0.3 * radial + 0.7 * Math.random() ** 1.3);\r
    };\r
\r
    const buildGrid = () => {\r
      const cols = Math.ceil(canvas.width / grid.cellW) + 1;\r
      const rows = Math.ceil(canvas.height / grid.cellH) + 1;\r
      grid.originX = Math.floor((canvas.width - cols * grid.cellW) / 2);\r
      grid.originY = Math.floor((canvas.height - rows * grid.cellH) / 2);\r
      if (cols === grid.cols && rows === grid.rows) return;\r
      const n = cols * rows;\r
      const nextData = new Uint8Array(n * 4);\r
      const nextLuck = new Float32Array(n);\r
      const nextLevel = new Float32Array(n);\r
      const nextBorn = new Float32Array(n);\r
      const shiftC = Math.floor((grid.cols - cols) / 2);\r
      const shiftR = Math.floor((grid.rows - rows) / 2);\r
      for (let r = 0; r < rows; r++) {\r
        for (let c = 0; c < cols; c++) {\r
          const i = r * cols + c;\r
          const oc = c + shiftC;\r
          const or = r + shiftR;\r
          if (oc >= 0 && or >= 0 && oc < grid.cols && or < grid.rows) {\r
            const j = or * grid.cols + oc;\r
            nextData[i * 4] = data[j * 4];\r
            nextData[i * 4 + 1] = data[j * 4 + 1];\r
            nextLuck[i] = luck[j];\r
            nextLevel[i] = level[j];\r
            nextBorn[i] = born[j];\r
          } else {\r
            nextData[i * 4] = randomGlyph();\r
            nextLuck[i] = Math.random();\r
            nextLevel[i] = 0.55 + 0.45 * Math.random();\r
            nextBorn[i] = introLeft ? birthTime(c, r, cols, rows) : -1;\r
          }\r
        }\r
      }\r
      grid.cols = cols;\r
      grid.rows = rows;\r
      count = n;\r
      data = nextData;\r
      luck = nextLuck;\r
      level = nextLevel;\r
      born = nextBorn;\r
      heat = new Float32Array(n);\r
      peak = new Float32Array(n);\r
      hold = new Float32Array(n);\r
      fade = new Float32Array(n);\r
      wait = new Float32Array(n);\r
      delay = new Float32Array(n);\r
      slot = new Int32Array(n).fill(-1);\r
      active = new Int32Array(n);\r
      activeCount = 0;\r
      walkers.length = 0;\r
      for (let i = 0; i < n; i++) data[i * 4 + 1] = born[i] >= 0 ? 0 : restValue(i);\r
      density = settingsRef.current.density;\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
      dirty = false;\r
    };\r
\r
    const syncType = () => {\r
      const s = settingsRef.current;\r
      const key = \`\${s.fontSize * view.ratio}|\${s.fontFamily}|\${s.spacing}|\${s.characters}\`;\r
      if (key === typeKey) return;\r
      typeKey = key;\r
      const { resized, charsChanged } = buildType();\r
      if (resized || !grid.cols) buildGrid();\r
      if (charsChanged) {\r
        for (let i = 0; i < count; i++) data[i * 4] = randomGlyph();\r
        dirty = true;\r
      }\r
    };\r
\r
    const syncPalette = () => {\r
      const s = settingsRef.current;\r
      const key = s.colors.join(',');\r
      if (key === paletteKey) return;\r
      paletteKey = key;\r
      colorCount = Math.max(1, s.colors.length);\r
      for (let i = 0; i < MAX_COLORS; i++) {\r
        const rgb = parse(s.colors[Math.min(i, colorCount - 1)] ?? '#ffffff');\r
        palette[i * 3] = rgb[0];\r
        palette[i * 3 + 1] = rgb[1];\r
        palette[i * 3 + 2] = rgb[2];\r
      }\r
      for (let i = 0; i < count; i++) {\r
        if (data[i * 4 + 3] >= colorCount) data[i * 4 + 3] = randomColor();\r
      }\r
      dirty = true;\r
    };\r
\r
    const addWalker = (walker: WalkerInput) => {\r
      if (walkers.length < MAX_WALKERS) walkers.push({ carry: 0, after: 0, wiggle: 0, branch: 0, ...walker });\r
    };\r
\r
    const spawnTear = (x: number, y: number) => {\r
      const center = cellAt(x, y);\r
      if (center < 0) return;\r
      const r0 = Math.floor(center / grid.cols);\r
      const width = grid.cols * grid.cellW;\r
      for (let dr = -2; dr <= 2; dr++) {\r
        const r = r0 + dr;\r
        if (r < 0 || r >= grid.rows) continue;\r
        const weight = 1 - Math.abs(dr) / 3;\r
        if (dr !== 0 && Math.random() > 0.3 + 0.6 * weight) continue;\r
        const color = randomColor();\r
        const rowY = grid.originY + (r + 0.5) * grid.cellH;\r
        const shift = (Math.random() - 0.5) * 6 * grid.cellW * (1 - weight);\r
        [0, Math.PI].forEach(angle => {\r
          const life = width * (0.12 + 0.5 * weight * (0.4 + 0.6 * Math.random()));\r
          addWalker({\r
            x: x + shift,\r
            y: rowY,\r
            angle,\r
            life,\r
            span: life,\r
            speed: (2200 + Math.random() * 1200) * view.ratio,\r
            after: Math.abs(dr) * 0.035 + Math.random() * 0.03,\r
            color\r
          });\r
        });\r
      }\r
    };\r
\r
    const spawnRays = (x: number, y: number) => {\r
      const reach = Math.min(view.width, view.height) * view.ratio;\r
      const rays = 5 + ((Math.random() * 3) | 0);\r
      const turn = Math.random() * Math.PI * 2;\r
      for (let k = 0; k < rays; k++) {\r
        const life = reach * (0.25 + Math.random() * 0.3);\r
        addWalker({\r
          x,\r
          y,\r
          angle: turn + (k / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.4,\r
          life,\r
          span: life,\r
          speed: (700 + Math.random() * 400) * view.ratio,\r
          wiggle: 0.2,\r
          branch: 0.03,\r
          color: randomColor()\r
        });\r
      }\r
    };\r
\r
    const spawnBurst = (x: number, y: number) => {\r
      const center = cellAt(x, y);\r
      if (center < 0) return;\r
      ignite(center, 1, 0.08, 0.8, randomColor());\r
      if (settingsRef.current.clickEffect === 'burst') spawnRays(x, y);\r
      else spawnTear(x, y);\r
    };\r
\r
    const stepWalkers = (dt: number) => {\r
      for (let k = walkers.length - 1; k >= 0; k--) {\r
        const w = walkers[k];\r
        if (w.after > 0) {\r
          w.after -= dt;\r
          continue;\r
        }\r
        const step = Math.max(\r
          1,\r
          Math.abs(Math.cos(w.angle)) * grid.cellW + Math.abs(Math.sin(w.angle)) * grid.cellH * 0.6\r
        );\r
        w.carry += w.speed * dt;\r
        while (w.carry >= step && w.life > 0) {\r
          w.carry -= step;\r
          w.life -= step;\r
          w.angle += (Math.random() - 0.5) * w.wiggle;\r
          w.x += Math.cos(w.angle) * step;\r
          w.y += Math.sin(w.angle) * step;\r
          const i = cellAt(w.x, w.y);\r
          if (i < 0) {\r
            w.life = 0;\r
            break;\r
          }\r
          const left = w.life / w.span;\r
          ignite(i, 0.5 + 0.5 * left, 0.03 + Math.random() * 0.05, 0.5 + 0.5 * left, w.color);\r
          if (w.branch && Math.random() < w.branch) {\r
            const side = Math.random() < 0.5 ? -1 : 1;\r
            const life = w.life * (0.45 + Math.random() * 0.3);\r
            addWalker({\r
              x: w.x,\r
              y: w.y,\r
              angle: w.angle + side * (0.5 + Math.random() * 0.5),\r
              life,\r
              span: w.span,\r
              speed: w.speed,\r
              wiggle: w.wiggle,\r
              color: w.color\r
            });\r
          }\r
        }\r
        if (w.life <= 0) walkers.splice(k, 1);\r
      }\r
    };\r
\r
    const ambient = (dt: number) => {\r
      const s = settingsRef.current;\r
      if (reduce || s.speed <= 0 || !count) return;\r
      restCarry += count * REST_RATE * s.speed * dt;\r
      let changes = Math.min(count, restCarry | 0);\r
      restCarry -= changes;\r
      while (changes-- > 0) {\r
        const i = (Math.random() * count) | 0;\r
        if (slot[i] < 0) {\r
          data[i * 4] = randomGlyph();\r
          dirty = true;\r
        }\r
      }\r
      const tempo = Math.max(s.speed, 0.2);\r
      glitchCarry += count * s.glitchAmount ** 1.6 * GLITCH_RATE * s.speed * dt;\r
      let events = Math.min(count, glitchCarry | 0);\r
      glitchCarry -= events;\r
      while (events-- > 0) {\r
        const i = (Math.random() * count) | 0;\r
        const color = randomColor();\r
        const strength = 0.45 + 0.55 * Math.random();\r
        const holdTime = (0.04 + Math.random() * 0.26) / tempo;\r
        const fadeTime = (0.45 + Math.random() * 0.6) / tempo;\r
        const roll = Math.random();\r
        if (roll < 0.24) {\r
          const c = i % grid.cols;\r
          const long = roll < 0.015;\r
          const length = Math.min(\r
            grid.cols - c,\r
            long ? 10 + ((Math.random() * 24) | 0) : 2 + ((Math.random() * 7) | 0)\r
          );\r
          const pace = (long ? 0.012 : 0.028) / tempo;\r
          for (let k = 0; k < length; k++) ignite(i + k, strength, holdTime, fadeTime, color, k * pace);\r
        } else {\r
          ignite(i, strength, holdTime, fadeTime, color);\r
        }\r
      }\r
    };\r
\r
    const excite = (dt: number) => {\r
      const s = settingsRef.current;\r
      if (pointer.presence < 0.02 || reduce || !count) return;\r
      const radius = s.cursorRadius * view.ratio;\r
      if (radius < 1) return;\r
      const c0 = Math.max(0, Math.floor((pointer.sx - radius - grid.originX) / grid.cellW));\r
      const c1 = Math.min(grid.cols - 1, Math.floor((pointer.sx + radius - grid.originX) / grid.cellW));\r
      const r0 = Math.max(0, Math.floor((pointer.sy - radius - grid.originY) / grid.cellH));\r
      const r1 = Math.min(grid.rows - 1, Math.floor((pointer.sy + radius - grid.originY) / grid.cellH));\r
      const chance = pointer.presence * (3 + 9 * pointer.stir) * dt;\r
      for (let r = r0; r <= r1; r++) {\r
        const dy = (grid.originY + (r + 0.5) * grid.cellH - pointer.sy) / radius;\r
        for (let c = c0; c <= c1; c++) {\r
          const dx = (grid.originX + (c + 0.5) * grid.cellW - pointer.sx) / radius;\r
          const d = dx * dx + dy * dy;\r
          if (d >= 1) continue;\r
          const i = r * grid.cols + c;\r
          if (slot[i] < 0 && Math.random() < (1 - d) * (1 - d) * chance) {\r
            data[i * 4] = randomGlyph();\r
            dirty = true;\r
          }\r
        }\r
      }\r
      const cells = (Math.PI * radius * radius) / (grid.cellW * grid.cellH);\r
      cursorCarry += cells * pointer.presence * (0.15 + 4 * pointer.stir) * dt;\r
      let sparks = Math.min(512, cursorCarry | 0);\r
      cursorCarry -= sparks;\r
      while (sparks-- > 0) {\r
        const angle = Math.random() * Math.PI * 2;\r
        const distance = Math.sqrt(Math.random());\r
        const falloff = (1 - distance * distance) ** 2;\r
        if (Math.random() > falloff) continue;\r
        const i = cellAt(\r
          pointer.sx + Math.cos(angle) * distance * radius,\r
          pointer.sy + Math.sin(angle) * distance * radius\r
        );\r
        if (i < 0) continue;\r
        ignite(\r
          i,\r
          (0.3 + 0.7 * Math.random()) * (0.45 + 0.55 * pointer.stir),\r
          0.02 + Math.random() * 0.08,\r
          0.35 + Math.random() * 0.4,\r
          randomColor()\r
        );\r
      }\r
    };\r
\r
    const settle = (dt: number) => {\r
      const s = settingsRef.current;\r
      const tempo = Math.max(s.speed, 0.5);\r
      const attack = 1 - Math.exp(-dt / 0.05);\r
      for (let k = 0; k < activeCount; ) {\r
        const i = active[k];\r
        if (delay[i] > 0) {\r
          delay[i] -= dt;\r
          k++;\r
          continue;\r
        }\r
        let h = heat[i];\r
        if (hold[i] > 0) {\r
          hold[i] -= dt;\r
          h = s.smooth ? h + (peak[i] - h) * attack : peak[i];\r
        } else {\r
          h = s.smooth ? h * Math.exp((-dt * 4) / Math.max(fade[i], 0.05)) : 0;\r
        }\r
        if (h < 0.012 && hold[i] <= 0) {\r
          release(k);\r
          dirty = true;\r
          continue;\r
        }\r
        heat[i] = h;\r
        wait[i] -= dt;\r
        if (wait[i] <= 0) {\r
          data[i * 4] = randomGlyph();\r
          wait[i] = ((0.045 + 0.45 * (1 - h) * (1 - h)) * (0.6 + 0.8 * Math.random())) / tempo;\r
        }\r
        data[i * 4 + 2] = Math.round(h * 255);\r
        dirty = true;\r
        k++;\r
      }\r
    };\r
\r
    const reveal = (dt: number) => {\r
      if (!introLeft) return;\r
      const s = settingsRef.current;\r
      let pending = false;\r
      for (let i = 0; i < count; i++) {\r
        const t = born[i];\r
        if (t < 0) continue;\r
        const age = clock - t;\r
        if (age < 0) {\r
          pending = true;\r
          continue;\r
        }\r
        if (age < dt && Math.random() < (luck[i] < s.density ? 0.45 : 0.12)) {\r
          ignite(i, 0.4 + 0.5 * Math.random(), 0.02, 0.35 + Math.random() * 0.35, randomColor());\r
        }\r
        const appear = s.smooth ? smoother(age / 0.35) : 1;\r
        data[i * 4 + 1] = restValue(i, appear);\r
        if (appear >= 1) born[i] = -1;\r
        else pending = true;\r
      }\r
      dirty = true;\r
      if (!pending) introLeft = false;\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!reduce) time += dt * s.speed;\r
      syncType();\r
      syncPalette();\r
      if (s.density !== density) {\r
        density = s.density;\r
        for (let i = 0; i < count; i++) if (born[i] < 0) data[i * 4 + 1] = restValue(i);\r
        dirty = true;\r
      }\r
      const goal = s.interactive && pointer.inside && !reduce ? 1 : 0;\r
      pointer.presence += (goal - pointer.presence) * (1 - Math.exp(-dt / 0.25));\r
      if (Math.abs(goal - pointer.presence) < 0.002) pointer.presence = goal;\r
      const px = pointer.sx;\r
      const py = pointer.sy;\r
      const follow = 1 - Math.exp(-dt / 0.07);\r
      pointer.sx += (pointer.x - pointer.sx) * follow;\r
      pointer.sy += (pointer.y - pointer.sy) * follow;\r
      const moved = Math.hypot(pointer.sx - px, pointer.sy - py) / view.ratio / dt;\r
      pointer.stir += (clamp(moved / 1400, 0, 1) - pointer.stir) * (1 - Math.exp(-dt / 0.12));\r
      if (pointer.stir < 0.001) pointer.stir = 0;\r
      reveal(dt);\r
      ambient(dt);\r
      excite(dt);\r
      stepWalkers(dt);\r
      settle(dt);\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(program.program);\r
      gl.bindVertexArray(vao);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);\r
      if (dirty) {\r
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, grid.cols, grid.rows, gl.RGBA, gl.UNSIGNED_BYTE, data);\r
        dirty = false;\r
      }\r
      gl.uniform1i(u.uState, 1);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);\r
      gl.uniform1i(u.uAtlas, 0);\r
      gl.uniform2i(u.uCell, grid.cellW, grid.cellH);\r
      gl.uniform2i(u.uGrid, grid.cols, grid.rows);\r
      gl.uniform1i(u.uAtlasColumns, grid.atlasColumns);\r
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);\r
      gl.uniform2f(u.uOrigin, grid.originX, grid.originY);\r
      gl.uniform3fv(u.uBase, parse(s.baseColor));\r
      gl.uniform1f(u.uBaseOpacity, s.baseOpacity);\r
      gl.uniform3fv(u.uColors, palette);\r
      gl.uniform1f(u.uEdge, s.edgeFade * Math.min(canvas.width, canvas.height));\r
      gl.uniform1f(u.uCenter, s.centerFade);\r
      gl.uniform2f(u.uPointer, pointer.sx, pointer.sy);\r
      gl.uniform1f(u.uRadius, Math.max(1, s.cursorRadius * view.ratio));\r
      gl.uniform1f(u.uPresence, pointer.presence);\r
      gl.uniform1f(u.uReveal, Math.min(1, s.baseOpacity * 3.5));\r
      gl.uniform1f(u.uTime, time);\r
      gl.uniform1f(u.uFlow, s.flow);\r
      gl.uniform1f(u.uFlowScale, Math.max(canvas.width, canvas.height) * 0.32);\r
      if (s.backgroundColor) {\r
        const [r, g, b] = parse(s.backgroundColor);\r
        gl.uniform4f(u.uBackground, r, g, b, 1);\r
      } else {\r
        gl.uniform4f(u.uBackground, 0, 0, 0, 0);\r
      }\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
\r
      const busy =\r
        (!reduce && s.speed > 0) ||\r
        activeCount > 0 ||\r
        walkers.length > 0 ||\r
        introLeft ||\r
        (pointer.presence !== 0 && pointer.presence !== 1) ||\r
        pointer.stir > 0;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    function wake() {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    }\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      syncType();\r
      if (grid.cols) buildGrid();\r
      wake();\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      pointer.x = x * view.ratio;\r
      pointer.y = y * view.ratio;\r
      if (pointer.fresh || pointer.presence < 0.02) {\r
        pointer.sx = pointer.x;\r
        pointer.sy = pointer.y;\r
        pointer.fresh = false;\r
      }\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      locate(event);\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      locate(event);\r
      const s = settingsRef.current;\r
      if (!pointer.inside || s.clickEffect === 'none' || reduce || !count) return;\r
      spawnBurst(pointer.x, pointer.y);\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => {\r
      if (event.pointerType !== 'mouse') pointer.inside = false;\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
      wake();\r
    };\r
\r
    const onFonts = () => {\r
      typeKey = '';\r
      wake();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerUp, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    document.fonts?.addEventListener?.('loadingdone', onFonts);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerUp);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      document.fonts?.removeEventListener?.('loadingdone', onFonts);\r
      gl.deleteTexture(atlasTexture);\r
      gl.deleteTexture(stateTexture);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program.program);\r
      gl.getExtension('WEBGL_lose_context')?.loseContext();\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LetterGlitch;\r
`,a={usage:`import LetterGlitch from './LetterGlitch';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <LetterGlitch
    glitchColors={['#ffffff', '#61dca3']}
    glitchAmount={0.5}
    speed={1}
    flow={0.5}
    clickEffect="tear"
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as letterGlitch};
