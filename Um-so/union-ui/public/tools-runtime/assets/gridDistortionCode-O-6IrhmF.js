const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './GridDistortion.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uImage;\r
uniform sampler2D uField;\r
uniform vec2 uGrid;\r
uniform vec2 uCover;\r
uniform float uSoftness;\r
uniform float uChroma;\r
uniform float uReveal;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec2 fieldAt(ivec2 cell) {\r
  return texelFetch(uField, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0).rg;\r
}\r
\r
vec3 sampleImage(vec2 uv) {\r
  return texture(uImage, (uv - 0.5) * uCover + 0.5).rgb;\r
}\r
\r
void main() {\r
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);\r
  vec2 g = uv * uGrid;\r
  vec2 blocky = fieldAt(ivec2(floor(g)));\r
  vec2 p = g - 0.5;\r
  ivec2 base = ivec2(floor(p));\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  vec2 soft = mix(\r
    mix(fieldAt(base), fieldAt(base + ivec2(1, 0)), f.x),\r
    mix(fieldAt(base + ivec2(0, 1)), fieldAt(base + ivec2(1, 1)), f.x),\r
    f.y\r
  );\r
  vec2 shift = mix(blocky, soft, uSoftness);\r
  float spread = uChroma * 0.35;\r
  vec3 color = vec3(\r
    sampleImage(uv - shift * (1.0 + spread)).r,\r
    sampleImage(uv - shift).g,\r
    sampleImage(uv - shift * (1.0 - spread)).b\r
  );\r
  outColor = vec4(color * uReveal, uReveal);\r
}\`;\r
\r
const MODES = ['drag', 'push', 'swirl'];\r
const GAIN = 18;\r
const RIPPLE_LIFE = 1.6;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const hash = (x, y, z) => {\r
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(z, 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 2147483648 - 1;\r
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
const GridDistortion = ({\r
  imageSrc,\r
  grid = 15,\r
  radius = 0.18,\r
  strength = 0.15,\r
  relaxation = 0.96,\r
  mode = 'drag',\r
  softness = 0,\r
  chroma = 0,\r
  idle = 0.3,\r
  clickRipple = true,\r
  intro = true,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const controlRef = useRef(null);\r
  const settings = {\r
    grid: clamp(Math.round(grid), 2, 120),\r
    radius: clamp(radius, 0.01, 1),\r
    strength: Math.max(0, strength),\r
    relaxation: clamp(relaxation, 0, 0.995),\r
    mode: MODES.includes(mode) ? mode : 'drag',\r
    softness: clamp(softness, 0, 1),\r
    chroma: clamp(chroma, 0, 2),\r
    idle: clamp(idle, 0, 1),\r
    clickRipple,\r
    intro\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniforms = {};\r
    for (const name of ['uImage', 'uField', 'uGrid', 'uCover', 'uSoftness', 'uChroma', 'uReveal']) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
    gl.uniform1i(uniforms.uImage, 0);\r
    gl.uniform1i(uniforms.uField, 1);\r
\r
    const imageTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE1);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, px: 0, py: 0, inside: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      cols: 0,\r
      rows: 0,\r
      sim: new Float32Array(0),\r
      out: new Float32Array(0),\r
      ripples: [],\r
      time: 0,\r
      reveal: 0,\r
      loaded: false,\r
      imageAspect: 1,\r
      request: 0,\r
      lastMove: -10,\r
      phantom: 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const layout = () => {\r
      const cols = settingsRef.current.grid;\r
      const rows = Math.max(1, Math.round((cols * state.height) / state.width));\r
      if (cols === state.cols && rows === state.rows) return;\r
      state.cols = cols;\r
      state.rows = rows;\r
      state.sim = new Float32Array(cols * rows * 2);\r
      state.out = new Float32Array(cols * rows * 2);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, cols, rows, 0, gl.RG, gl.FLOAT, state.out);\r
    };\r
\r
    const scramble = () => {\r
      const { sim, cols, rows, width, height } = state;\r
      const reach = Math.min(width, height) * 0.12;\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const i = (row * cols + col) * 2;\r
          sim[i] = (hash(col + 1, row + 1, 11) * reach) / width;\r
          sim[i + 1] = (hash(col + 1, row + 1, 23) * reach) / height;\r
        }\r
      }\r
    };\r
\r
    const brush = (s, x, y, dx, dy, weight) => {\r
      const { sim, cols, rows, width, height } = state;\r
      const reach = Math.max(1, s.radius * width);\r
      const cellWidth = width / cols;\r
      const cellHeight = height / rows;\r
      const speed = Math.hypot(dx, dy);\r
      const limit = (0.25 + s.strength) * 0.4 * width;\r
      const fromCol = Math.max(0, Math.floor((x - reach) / cellWidth));\r
      const toCol = Math.min(cols - 1, Math.floor((x + reach) / cellWidth));\r
      const fromRow = Math.max(0, Math.floor((y - reach) / cellHeight));\r
      const toRow = Math.min(rows - 1, Math.floor((y + reach) / cellHeight));\r
      for (let row = fromRow; row <= toRow; row++) {\r
        for (let col = fromCol; col <= toCol; col++) {\r
          const ox = (col + 0.5) * cellWidth - x;\r
          const oy = (row + 0.5) * cellHeight - y;\r
          const distance = Math.hypot(ox, oy);\r
          if (distance >= reach) continue;\r
          const t = 1 - (distance / reach) ** 2;\r
          const k = s.strength * GAIN * weight * t * t;\r
          let vx = dx;\r
          let vy = dy;\r
          if (s.mode !== 'drag') {\r
            const nx = distance > 0 ? ox / distance : 0;\r
            const ny = distance > 0 ? oy / distance : 0;\r
            vx = s.mode === 'push' ? nx * speed : -ny * speed;\r
            vy = s.mode === 'push' ? ny * speed : nx * speed;\r
          }\r
          const i = (row * cols + col) * 2;\r
          const px = sim[i] * width + vx * k;\r
          const py = sim[i + 1] * height + vy * k;\r
          const length = Math.hypot(px, py);\r
          const scale = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
          sim[i] = (px * scale) / width;\r
          sim[i + 1] = (py * scale) / height;\r
        }\r
      }\r
    };\r
\r
    const wander = t => [\r
      state.width * (0.5 + 0.34 * Math.sin(t * 0.43) + 0.08 * Math.sin(t * 1.21 + 1.7)),\r
      state.height * (0.5 + 0.3 * Math.sin(t * 0.61 + 0.9) + 0.08 * Math.cos(t * 1.03 + 0.4))\r
    ];\r
\r
    const simulate = (s, dt) => {\r
      const { sim } = state;\r
      const decay = Math.pow(s.relaxation, dt * 60);\r
      let peak = 0;\r
      for (let i = 0; i < sim.length; i++) {\r
        sim[i] *= decay;\r
        if (Math.abs(sim[i]) < 1e-5) sim[i] = 0;\r
        else peak = Math.max(peak, Math.abs(sim[i]));\r
      }\r
      if (s.strength <= 0) return peak;\r
\r
      const dx = pointer.x - pointer.px;\r
      const dy = pointer.y - pointer.py;\r
      pointer.px = pointer.x;\r
      pointer.py = pointer.y;\r
      if (pointer.inside && (dx || dy)) {\r
        state.lastMove = state.time;\r
        brush(s, pointer.x, pointer.y, dx, dy, 1);\r
        peak = Math.max(peak, 1e-3);\r
      }\r
\r
      const drift = reduce ? 0 : s.idle;\r
      const resting = state.time - state.lastMove > 2.5;\r
      state.phantom = clamp(state.phantom + (resting ? dt : -dt * 3), 0, 1);\r
      if (drift > 0 && state.phantom > 0) {\r
        const [x, y] = wander(state.time);\r
        const [px, py] = wander(state.time - dt);\r
        brush(s, x, y, x - px, y - py, drift * 0.6 * state.phantom * state.phantom);\r
      }\r
      return peak;\r
    };\r
\r
    const compose = s => {\r
      const { sim, out, cols, rows, width, height, time } = state;\r
      out.set(sim);\r
      if (state.ripples.length) {\r
        const cellWidth = width / cols;\r
        const cellHeight = height / rows;\r
        const span = Math.hypot(width, height);\r
        const band = Math.max(cellWidth, cellHeight) * 1.2 + span * 0.03;\r
        const amount = width * (0.03 + s.strength * 0.3);\r
        state.ripples = state.ripples.filter(ripple => time - ripple.start < RIPPLE_LIFE);\r
        for (const ripple of state.ripples) {\r
          const age = (time - ripple.start) / RIPPLE_LIFE;\r
          const front = age * span * 0.75;\r
          const fade = (1 - age) ** 2;\r
          for (let row = 0; row < rows; row++) {\r
            for (let col = 0; col < cols; col++) {\r
              const ox = (col + 0.5) * cellWidth - ripple.x;\r
              const oy = (row + 0.5) * cellHeight - ripple.y;\r
              const distance = Math.hypot(ox, oy);\r
              const wave = Math.exp(-(((distance - front) / band) ** 2)) * fade;\r
              if (wave < 0.002 || distance === 0) continue;\r
              const i = (row * cols + col) * 2;\r
              out[i] += (ox / distance) * ((wave * amount) / width);\r
              out[i + 1] += (oy / distance) * ((wave * amount) / height);\r
            }\r
          }\r
        }\r
      }\r
    };\r
\r
    const render = () => {\r
      const { width, height } = state;\r
      const aspect = width / height;\r
      const cover = aspect > state.imageAspect ? [1, state.imageAspect / aspect] : [aspect / state.imageAspect, 1];\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, state.cols, state.rows, gl.RG, gl.FLOAT, state.out);\r
      const s = settingsRef.current;\r
      gl.uniform2f(uniforms.uGrid, state.cols, state.rows);\r
      gl.uniform2f(uniforms.uCover, cover[0], cover[1]);\r
      gl.uniform1f(uniforms.uSoftness, s.softness);\r
      gl.uniform1f(uniforms.uChroma, s.chroma);\r
      gl.uniform1f(uniforms.uReveal, state.reveal);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      layout();\r
      if (state.loaded) state.reveal = reduce ? 1 : Math.min(1, state.reveal + dt / 0.6);\r
      const peak = simulate(s, dt);\r
      compose(s);\r
      render();\r
      const busy = peak > 0 || state.ripples.length > 0 || (s.idle > 0 && !reduce) || state.reveal < 1;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const load = src => {\r
      const request = ++state.request;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || request !== state.request) return;\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
        state.imageAspect = image.naturalWidth / Math.max(1, image.naturalHeight);\r
        layout();\r
        if (settingsRef.current.intro && !reduce) scramble();\r
        state.loaded = true;\r
        wake();\r
      };\r
      image.src = src;\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (inside && !pointer.inside) {\r
        pointer.px = x;\r
        pointer.py = y;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      if (!settingsRef.current.clickRipple || reduce) return;\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.ripples.push({ x, y, start: state.time });\r
      if (state.ripples.length > 4) state.ripples.shift();\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(state.width * dpr);\r
      canvas.height = Math.round(state.height * dpr);\r
      layout();\r
      if (!raf) {\r
        compose(settingsRef.current);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    controlRef.current = { load, wake };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      gl.deleteShader(vertex);\r
      gl.deleteShader(fragment);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    controlRef.current?.load(imageSrc);\r
  }, [imageSrc]);\r
\r
  useEffect(() => {\r
    controlRef.current?.wake();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`distortion-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="distortion-container__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GridDistortion;\r
`,n=`.distortion-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  min-width: 0;\r
  min-height: 0;\r
  overflow: hidden;\r
}\r
\r
.distortion-container__canvas {\r
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
const ROOT = 'relative h-full w-full min-h-0 min-w-0 overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uImage;\r
uniform sampler2D uField;\r
uniform vec2 uGrid;\r
uniform vec2 uCover;\r
uniform float uSoftness;\r
uniform float uChroma;\r
uniform float uReveal;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec2 fieldAt(ivec2 cell) {\r
  return texelFetch(uField, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0).rg;\r
}\r
\r
vec3 sampleImage(vec2 uv) {\r
  return texture(uImage, (uv - 0.5) * uCover + 0.5).rgb;\r
}\r
\r
void main() {\r
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);\r
  vec2 g = uv * uGrid;\r
  vec2 blocky = fieldAt(ivec2(floor(g)));\r
  vec2 p = g - 0.5;\r
  ivec2 base = ivec2(floor(p));\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  vec2 soft = mix(\r
    mix(fieldAt(base), fieldAt(base + ivec2(1, 0)), f.x),\r
    mix(fieldAt(base + ivec2(0, 1)), fieldAt(base + ivec2(1, 1)), f.x),\r
    f.y\r
  );\r
  vec2 shift = mix(blocky, soft, uSoftness);\r
  float spread = uChroma * 0.35;\r
  vec3 color = vec3(\r
    sampleImage(uv - shift * (1.0 + spread)).r,\r
    sampleImage(uv - shift).g,\r
    sampleImage(uv - shift * (1.0 - spread)).b\r
  );\r
  outColor = vec4(color * uReveal, uReveal);\r
}\`;\r
\r
const MODES = ['drag', 'push', 'swirl'];\r
const GAIN = 18;\r
const RIPPLE_LIFE = 1.6;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const hash = (x, y, z) => {\r
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(z, 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 2147483648 - 1;\r
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
const GridDistortion = ({\r
  imageSrc,\r
  grid = 15,\r
  radius = 0.18,\r
  strength = 0.15,\r
  relaxation = 0.96,\r
  mode = 'drag',\r
  softness = 0,\r
  chroma = 0,\r
  idle = 0.3,\r
  clickRipple = true,\r
  intro = true,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const controlRef = useRef(null);\r
  const settings = {\r
    grid: clamp(Math.round(grid), 2, 120),\r
    radius: clamp(radius, 0.01, 1),\r
    strength: Math.max(0, strength),\r
    relaxation: clamp(relaxation, 0, 0.995),\r
    mode: MODES.includes(mode) ? mode : 'drag',\r
    softness: clamp(softness, 0, 1),\r
    chroma: clamp(chroma, 0, 2),\r
    idle: clamp(idle, 0, 1),\r
    clickRipple,\r
    intro\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniforms = {};\r
    for (const name of ['uImage', 'uField', 'uGrid', 'uCover', 'uSoftness', 'uChroma', 'uReveal']) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
    gl.uniform1i(uniforms.uImage, 0);\r
    gl.uniform1i(uniforms.uField, 1);\r
\r
    const imageTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE1);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, px: 0, py: 0, inside: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      cols: 0,\r
      rows: 0,\r
      sim: new Float32Array(0),\r
      out: new Float32Array(0),\r
      ripples: [],\r
      time: 0,\r
      reveal: 0,\r
      loaded: false,\r
      imageAspect: 1,\r
      request: 0,\r
      lastMove: -10,\r
      phantom: 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const layout = () => {\r
      const cols = settingsRef.current.grid;\r
      const rows = Math.max(1, Math.round((cols * state.height) / state.width));\r
      if (cols === state.cols && rows === state.rows) return;\r
      state.cols = cols;\r
      state.rows = rows;\r
      state.sim = new Float32Array(cols * rows * 2);\r
      state.out = new Float32Array(cols * rows * 2);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, cols, rows, 0, gl.RG, gl.FLOAT, state.out);\r
    };\r
\r
    const scramble = () => {\r
      const { sim, cols, rows, width, height } = state;\r
      const reach = Math.min(width, height) * 0.12;\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const i = (row * cols + col) * 2;\r
          sim[i] = (hash(col + 1, row + 1, 11) * reach) / width;\r
          sim[i + 1] = (hash(col + 1, row + 1, 23) * reach) / height;\r
        }\r
      }\r
    };\r
\r
    const brush = (s, x, y, dx, dy, weight) => {\r
      const { sim, cols, rows, width, height } = state;\r
      const reach = Math.max(1, s.radius * width);\r
      const cellWidth = width / cols;\r
      const cellHeight = height / rows;\r
      const speed = Math.hypot(dx, dy);\r
      const limit = (0.25 + s.strength) * 0.4 * width;\r
      const fromCol = Math.max(0, Math.floor((x - reach) / cellWidth));\r
      const toCol = Math.min(cols - 1, Math.floor((x + reach) / cellWidth));\r
      const fromRow = Math.max(0, Math.floor((y - reach) / cellHeight));\r
      const toRow = Math.min(rows - 1, Math.floor((y + reach) / cellHeight));\r
      for (let row = fromRow; row <= toRow; row++) {\r
        for (let col = fromCol; col <= toCol; col++) {\r
          const ox = (col + 0.5) * cellWidth - x;\r
          const oy = (row + 0.5) * cellHeight - y;\r
          const distance = Math.hypot(ox, oy);\r
          if (distance >= reach) continue;\r
          const t = 1 - (distance / reach) ** 2;\r
          const k = s.strength * GAIN * weight * t * t;\r
          let vx = dx;\r
          let vy = dy;\r
          if (s.mode !== 'drag') {\r
            const nx = distance > 0 ? ox / distance : 0;\r
            const ny = distance > 0 ? oy / distance : 0;\r
            vx = s.mode === 'push' ? nx * speed : -ny * speed;\r
            vy = s.mode === 'push' ? ny * speed : nx * speed;\r
          }\r
          const i = (row * cols + col) * 2;\r
          const px = sim[i] * width + vx * k;\r
          const py = sim[i + 1] * height + vy * k;\r
          const length = Math.hypot(px, py);\r
          const scale = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
          sim[i] = (px * scale) / width;\r
          sim[i + 1] = (py * scale) / height;\r
        }\r
      }\r
    };\r
\r
    const wander = t => [\r
      state.width * (0.5 + 0.34 * Math.sin(t * 0.43) + 0.08 * Math.sin(t * 1.21 + 1.7)),\r
      state.height * (0.5 + 0.3 * Math.sin(t * 0.61 + 0.9) + 0.08 * Math.cos(t * 1.03 + 0.4))\r
    ];\r
\r
    const simulate = (s, dt) => {\r
      const { sim } = state;\r
      const decay = Math.pow(s.relaxation, dt * 60);\r
      let peak = 0;\r
      for (let i = 0; i < sim.length; i++) {\r
        sim[i] *= decay;\r
        if (Math.abs(sim[i]) < 1e-5) sim[i] = 0;\r
        else peak = Math.max(peak, Math.abs(sim[i]));\r
      }\r
      if (s.strength <= 0) return peak;\r
\r
      const dx = pointer.x - pointer.px;\r
      const dy = pointer.y - pointer.py;\r
      pointer.px = pointer.x;\r
      pointer.py = pointer.y;\r
      if (pointer.inside && (dx || dy)) {\r
        state.lastMove = state.time;\r
        brush(s, pointer.x, pointer.y, dx, dy, 1);\r
        peak = Math.max(peak, 1e-3);\r
      }\r
\r
      const drift = reduce ? 0 : s.idle;\r
      const resting = state.time - state.lastMove > 2.5;\r
      state.phantom = clamp(state.phantom + (resting ? dt : -dt * 3), 0, 1);\r
      if (drift > 0 && state.phantom > 0) {\r
        const [x, y] = wander(state.time);\r
        const [px, py] = wander(state.time - dt);\r
        brush(s, x, y, x - px, y - py, drift * 0.6 * state.phantom * state.phantom);\r
      }\r
      return peak;\r
    };\r
\r
    const compose = s => {\r
      const { sim, out, cols, rows, width, height, time } = state;\r
      out.set(sim);\r
      if (state.ripples.length) {\r
        const cellWidth = width / cols;\r
        const cellHeight = height / rows;\r
        const span = Math.hypot(width, height);\r
        const band = Math.max(cellWidth, cellHeight) * 1.2 + span * 0.03;\r
        const amount = width * (0.03 + s.strength * 0.3);\r
        state.ripples = state.ripples.filter(ripple => time - ripple.start < RIPPLE_LIFE);\r
        for (const ripple of state.ripples) {\r
          const age = (time - ripple.start) / RIPPLE_LIFE;\r
          const front = age * span * 0.75;\r
          const fade = (1 - age) ** 2;\r
          for (let row = 0; row < rows; row++) {\r
            for (let col = 0; col < cols; col++) {\r
              const ox = (col + 0.5) * cellWidth - ripple.x;\r
              const oy = (row + 0.5) * cellHeight - ripple.y;\r
              const distance = Math.hypot(ox, oy);\r
              const wave = Math.exp(-(((distance - front) / band) ** 2)) * fade;\r
              if (wave < 0.002 || distance === 0) continue;\r
              const i = (row * cols + col) * 2;\r
              out[i] += (ox / distance) * ((wave * amount) / width);\r
              out[i + 1] += (oy / distance) * ((wave * amount) / height);\r
            }\r
          }\r
        }\r
      }\r
    };\r
\r
    const render = () => {\r
      const { width, height } = state;\r
      const aspect = width / height;\r
      const cover = aspect > state.imageAspect ? [1, state.imageAspect / aspect] : [aspect / state.imageAspect, 1];\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, state.cols, state.rows, gl.RG, gl.FLOAT, state.out);\r
      const s = settingsRef.current;\r
      gl.uniform2f(uniforms.uGrid, state.cols, state.rows);\r
      gl.uniform2f(uniforms.uCover, cover[0], cover[1]);\r
      gl.uniform1f(uniforms.uSoftness, s.softness);\r
      gl.uniform1f(uniforms.uChroma, s.chroma);\r
      gl.uniform1f(uniforms.uReveal, state.reveal);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      layout();\r
      if (state.loaded) state.reveal = reduce ? 1 : Math.min(1, state.reveal + dt / 0.6);\r
      const peak = simulate(s, dt);\r
      compose(s);\r
      render();\r
      const busy = peak > 0 || state.ripples.length > 0 || (s.idle > 0 && !reduce) || state.reveal < 1;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const load = src => {\r
      const request = ++state.request;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || request !== state.request) return;\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
        state.imageAspect = image.naturalWidth / Math.max(1, image.naturalHeight);\r
        layout();\r
        if (settingsRef.current.intro && !reduce) scramble();\r
        state.loaded = true;\r
        wake();\r
      };\r
      image.src = src;\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (inside && !pointer.inside) {\r
        pointer.px = x;\r
        pointer.py = y;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      if (!settingsRef.current.clickRipple || reduce) return;\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.ripples.push({ x, y, start: state.time });\r
      if (state.ripples.length > 4) state.ripples.shift();\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(state.width * dpr);\r
      canvas.height = Math.round(state.height * dpr);\r
      layout();\r
      if (!raf) {\r
        compose(settingsRef.current);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    controlRef.current = { load, wake };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      gl.deleteShader(vertex);\r
      gl.deleteShader(fragment);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    controlRef.current?.load(imageSrc);\r
  }, [imageSrc]);\r
\r
  useEffect(() => {\r
    controlRef.current?.wake();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className={CANVAS} aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GridDistortion;\r
`,t=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
import './GridDistortion.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uImage;\r
uniform sampler2D uField;\r
uniform vec2 uGrid;\r
uniform vec2 uCover;\r
uniform float uSoftness;\r
uniform float uChroma;\r
uniform float uReveal;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec2 fieldAt(ivec2 cell) {\r
  return texelFetch(uField, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0).rg;\r
}\r
\r
vec3 sampleImage(vec2 uv) {\r
  return texture(uImage, (uv - 0.5) * uCover + 0.5).rgb;\r
}\r
\r
void main() {\r
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);\r
  vec2 g = uv * uGrid;\r
  vec2 blocky = fieldAt(ivec2(floor(g)));\r
  vec2 p = g - 0.5;\r
  ivec2 base = ivec2(floor(p));\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  vec2 soft = mix(\r
    mix(fieldAt(base), fieldAt(base + ivec2(1, 0)), f.x),\r
    mix(fieldAt(base + ivec2(0, 1)), fieldAt(base + ivec2(1, 1)), f.x),\r
    f.y\r
  );\r
  vec2 shift = mix(blocky, soft, uSoftness);\r
  float spread = uChroma * 0.35;\r
  vec3 color = vec3(\r
    sampleImage(uv - shift * (1.0 + spread)).r,\r
    sampleImage(uv - shift).g,\r
    sampleImage(uv - shift * (1.0 - spread)).b\r
  );\r
  outColor = vec4(color * uReveal, uReveal);\r
}\`;\r
\r
export type GridDistortionMode = 'drag' | 'push' | 'swirl';\r
\r
export interface GridDistortionProps {\r
  imageSrc: string;\r
  grid?: number;\r
  radius?: number;\r
  strength?: number;\r
  relaxation?: number;\r
  mode?: GridDistortionMode;\r
  softness?: number;\r
  chroma?: number;\r
  idle?: number;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
type Ripple = { x: number; y: number; start: number };\r
\r
type Control = { load: (src?: string) => void; wake: () => void };\r
\r
const MODES: GridDistortionMode[] = ['drag', 'push', 'swirl'];\r
const GAIN = 18;\r
const RIPPLE_LIFE = 1.6;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const hash = (x: number, y: number, z: number) => {\r
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(z, 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 2147483648 - 1;\r
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
const GridDistortion = ({\r
  imageSrc,\r
  grid = 15,\r
  radius = 0.18,\r
  strength = 0.15,\r
  relaxation = 0.96,\r
  mode = 'drag',\r
  softness = 0,\r
  chroma = 0,\r
  idle = 0.3,\r
  clickRipple = true,\r
  intro = true,\r
  className = '',\r
  style\r
}: GridDistortionProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const controlRef = useRef<Control | null>(null);\r
  const settings = {\r
    grid: clamp(Math.round(grid), 2, 120),\r
    radius: clamp(radius, 0.01, 1),\r
    strength: Math.max(0, strength),\r
    relaxation: clamp(relaxation, 0, 0.995),\r
    mode: MODES.includes(mode) ? mode : ('drag' as GridDistortionMode),\r
    softness: clamp(softness, 0, 1),\r
    chroma: clamp(chroma, 0, 2),\r
    idle: clamp(idle, 0, 1),\r
    clickRipple,\r
    intro\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    for (const name of ['uImage', 'uField', 'uGrid', 'uCover', 'uSoftness', 'uChroma', 'uReveal']) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
    gl.uniform1i(uniforms.uImage, 0);\r
    gl.uniform1i(uniforms.uField, 1);\r
\r
    const imageTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE1);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, px: 0, py: 0, inside: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      cols: 0,\r
      rows: 0,\r
      sim: new Float32Array(0),\r
      out: new Float32Array(0),\r
      ripples: [] as Ripple[],\r
      time: 0,\r
      reveal: 0,\r
      loaded: false,\r
      imageAspect: 1,\r
      request: 0,\r
      lastMove: -10,\r
      phantom: 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const layout = () => {\r
      const cols = settingsRef.current.grid;\r
      const rows = Math.max(1, Math.round((cols * state.height) / state.width));\r
      if (cols === state.cols && rows === state.rows) return;\r
      state.cols = cols;\r
      state.rows = rows;\r
      state.sim = new Float32Array(cols * rows * 2);\r
      state.out = new Float32Array(cols * rows * 2);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, cols, rows, 0, gl.RG, gl.FLOAT, state.out);\r
    };\r
\r
    const scramble = () => {\r
      const { sim, cols, rows, width, height } = state;\r
      const reach = Math.min(width, height) * 0.12;\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const i = (row * cols + col) * 2;\r
          sim[i] = (hash(col + 1, row + 1, 11) * reach) / width;\r
          sim[i + 1] = (hash(col + 1, row + 1, 23) * reach) / height;\r
        }\r
      }\r
    };\r
\r
    const brush = (s: typeof settings, x: number, y: number, dx: number, dy: number, weight: number) => {\r
      const { sim, cols, rows, width, height } = state;\r
      const reach = Math.max(1, s.radius * width);\r
      const cellWidth = width / cols;\r
      const cellHeight = height / rows;\r
      const speed = Math.hypot(dx, dy);\r
      const limit = (0.25 + s.strength) * 0.4 * width;\r
      const fromCol = Math.max(0, Math.floor((x - reach) / cellWidth));\r
      const toCol = Math.min(cols - 1, Math.floor((x + reach) / cellWidth));\r
      const fromRow = Math.max(0, Math.floor((y - reach) / cellHeight));\r
      const toRow = Math.min(rows - 1, Math.floor((y + reach) / cellHeight));\r
      for (let row = fromRow; row <= toRow; row++) {\r
        for (let col = fromCol; col <= toCol; col++) {\r
          const ox = (col + 0.5) * cellWidth - x;\r
          const oy = (row + 0.5) * cellHeight - y;\r
          const distance = Math.hypot(ox, oy);\r
          if (distance >= reach) continue;\r
          const t = 1 - (distance / reach) ** 2;\r
          const k = s.strength * GAIN * weight * t * t;\r
          let vx = dx;\r
          let vy = dy;\r
          if (s.mode !== 'drag') {\r
            const nx = distance > 0 ? ox / distance : 0;\r
            const ny = distance > 0 ? oy / distance : 0;\r
            vx = s.mode === 'push' ? nx * speed : -ny * speed;\r
            vy = s.mode === 'push' ? ny * speed : nx * speed;\r
          }\r
          const i = (row * cols + col) * 2;\r
          const px = sim[i] * width + vx * k;\r
          const py = sim[i + 1] * height + vy * k;\r
          const length = Math.hypot(px, py);\r
          const scale = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
          sim[i] = (px * scale) / width;\r
          sim[i + 1] = (py * scale) / height;\r
        }\r
      }\r
    };\r
\r
    const wander = (t: number) => [\r
      state.width * (0.5 + 0.34 * Math.sin(t * 0.43) + 0.08 * Math.sin(t * 1.21 + 1.7)),\r
      state.height * (0.5 + 0.3 * Math.sin(t * 0.61 + 0.9) + 0.08 * Math.cos(t * 1.03 + 0.4))\r
    ];\r
\r
    const simulate = (s: typeof settings, dt: number) => {\r
      const { sim } = state;\r
      const decay = Math.pow(s.relaxation, dt * 60);\r
      let peak = 0;\r
      for (let i = 0; i < sim.length; i++) {\r
        sim[i] *= decay;\r
        if (Math.abs(sim[i]) < 1e-5) sim[i] = 0;\r
        else peak = Math.max(peak, Math.abs(sim[i]));\r
      }\r
      if (s.strength <= 0) return peak;\r
\r
      const dx = pointer.x - pointer.px;\r
      const dy = pointer.y - pointer.py;\r
      pointer.px = pointer.x;\r
      pointer.py = pointer.y;\r
      if (pointer.inside && (dx || dy)) {\r
        state.lastMove = state.time;\r
        brush(s, pointer.x, pointer.y, dx, dy, 1);\r
        peak = Math.max(peak, 1e-3);\r
      }\r
\r
      const drift = reduce ? 0 : s.idle;\r
      const resting = state.time - state.lastMove > 2.5;\r
      state.phantom = clamp(state.phantom + (resting ? dt : -dt * 3), 0, 1);\r
      if (drift > 0 && state.phantom > 0) {\r
        const [x, y] = wander(state.time);\r
        const [px, py] = wander(state.time - dt);\r
        brush(s, x, y, x - px, y - py, drift * 0.6 * state.phantom * state.phantom);\r
      }\r
      return peak;\r
    };\r
\r
    const compose = (s: typeof settings) => {\r
      const { sim, out, cols, rows, width, height, time } = state;\r
      out.set(sim);\r
      if (state.ripples.length) {\r
        const cellWidth = width / cols;\r
        const cellHeight = height / rows;\r
        const span = Math.hypot(width, height);\r
        const band = Math.max(cellWidth, cellHeight) * 1.2 + span * 0.03;\r
        const amount = width * (0.03 + s.strength * 0.3);\r
        state.ripples = state.ripples.filter(ripple => time - ripple.start < RIPPLE_LIFE);\r
        for (const ripple of state.ripples) {\r
          const age = (time - ripple.start) / RIPPLE_LIFE;\r
          const front = age * span * 0.75;\r
          const fade = (1 - age) ** 2;\r
          for (let row = 0; row < rows; row++) {\r
            for (let col = 0; col < cols; col++) {\r
              const ox = (col + 0.5) * cellWidth - ripple.x;\r
              const oy = (row + 0.5) * cellHeight - ripple.y;\r
              const distance = Math.hypot(ox, oy);\r
              const wave = Math.exp(-(((distance - front) / band) ** 2)) * fade;\r
              if (wave < 0.002 || distance === 0) continue;\r
              const i = (row * cols + col) * 2;\r
              out[i] += (ox / distance) * ((wave * amount) / width);\r
              out[i + 1] += (oy / distance) * ((wave * amount) / height);\r
            }\r
          }\r
        }\r
      }\r
    };\r
\r
    const render = () => {\r
      const { width, height } = state;\r
      const aspect = width / height;\r
      const cover = aspect > state.imageAspect ? [1, state.imageAspect / aspect] : [aspect / state.imageAspect, 1];\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, state.cols, state.rows, gl.RG, gl.FLOAT, state.out);\r
      const s = settingsRef.current;\r
      gl.uniform2f(uniforms.uGrid, state.cols, state.rows);\r
      gl.uniform2f(uniforms.uCover, cover[0], cover[1]);\r
      gl.uniform1f(uniforms.uSoftness, s.softness);\r
      gl.uniform1f(uniforms.uChroma, s.chroma);\r
      gl.uniform1f(uniforms.uReveal, state.reveal);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      layout();\r
      if (state.loaded) state.reveal = reduce ? 1 : Math.min(1, state.reveal + dt / 0.6);\r
      const peak = simulate(s, dt);\r
      compose(s);\r
      render();\r
      const busy = peak > 0 || state.ripples.length > 0 || (s.idle > 0 && !reduce) || state.reveal < 1;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const load = (src?: string) => {\r
      const request = ++state.request;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || request !== state.request) return;\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
        state.imageAspect = image.naturalWidth / Math.max(1, image.naturalHeight);\r
        layout();\r
        if (settingsRef.current.intro && !reduce) scramble();\r
        state.loaded = true;\r
        wake();\r
      };\r
      image.src = src;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (inside && !pointer.inside) {\r
        pointer.px = x;\r
        pointer.py = y;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      if (!settingsRef.current.clickRipple || reduce) return;\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.ripples.push({ x, y, start: state.time });\r
      if (state.ripples.length > 4) state.ripples.shift();\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(state.width * dpr);\r
      canvas.height = Math.round(state.height * dpr);\r
      layout();\r
      if (!raf) {\r
        compose(settingsRef.current);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    controlRef.current = { load, wake };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      gl.deleteShader(vertex);\r
      gl.deleteShader(fragment);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    controlRef.current?.load(imageSrc);\r
  }, [imageSrc]);\r
\r
  useEffect(() => {\r
    controlRef.current?.wake();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`distortion-container\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className="distortion-container__canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GridDistortion;\r
`,o=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
\r
const ROOT = 'relative h-full w-full min-h-0 min-w-0 overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
out vec2 vUv;\r
void main() {\r
  vUv = aPosition * 0.5 + 0.5;\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
uniform sampler2D uImage;\r
uniform sampler2D uField;\r
uniform vec2 uGrid;\r
uniform vec2 uCover;\r
uniform float uSoftness;\r
uniform float uChroma;\r
uniform float uReveal;\r
in vec2 vUv;\r
out vec4 outColor;\r
\r
vec2 fieldAt(ivec2 cell) {\r
  return texelFetch(uField, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0).rg;\r
}\r
\r
vec3 sampleImage(vec2 uv) {\r
  return texture(uImage, (uv - 0.5) * uCover + 0.5).rgb;\r
}\r
\r
void main() {\r
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);\r
  vec2 g = uv * uGrid;\r
  vec2 blocky = fieldAt(ivec2(floor(g)));\r
  vec2 p = g - 0.5;\r
  ivec2 base = ivec2(floor(p));\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  vec2 soft = mix(\r
    mix(fieldAt(base), fieldAt(base + ivec2(1, 0)), f.x),\r
    mix(fieldAt(base + ivec2(0, 1)), fieldAt(base + ivec2(1, 1)), f.x),\r
    f.y\r
  );\r
  vec2 shift = mix(blocky, soft, uSoftness);\r
  float spread = uChroma * 0.35;\r
  vec3 color = vec3(\r
    sampleImage(uv - shift * (1.0 + spread)).r,\r
    sampleImage(uv - shift).g,\r
    sampleImage(uv - shift * (1.0 - spread)).b\r
  );\r
  outColor = vec4(color * uReveal, uReveal);\r
}\`;\r
\r
export type GridDistortionMode = 'drag' | 'push' | 'swirl';\r
\r
export interface GridDistortionProps {\r
  imageSrc: string;\r
  grid?: number;\r
  radius?: number;\r
  strength?: number;\r
  relaxation?: number;\r
  mode?: GridDistortionMode;\r
  softness?: number;\r
  chroma?: number;\r
  idle?: number;\r
  clickRipple?: boolean;\r
  intro?: boolean;\r
  className?: string;\r
  style?: React.CSSProperties;\r
}\r
\r
type Ripple = { x: number; y: number; start: number };\r
\r
type Control = { load: (src?: string) => void; wake: () => void };\r
\r
const MODES: GridDistortionMode[] = ['drag', 'push', 'swirl'];\r
const GAIN = 18;\r
const RIPPLE_LIFE = 1.6;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const hash = (x: number, y: number, z: number) => {\r
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(z, 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);\r
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);\r
  return ((h ^ (h >>> 16)) >>> 0) / 2147483648 - 1;\r
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
const GridDistortion = ({\r
  imageSrc,\r
  grid = 15,\r
  radius = 0.18,\r
  strength = 0.15,\r
  relaxation = 0.96,\r
  mode = 'drag',\r
  softness = 0,\r
  chroma = 0,\r
  idle = 0.3,\r
  clickRipple = true,\r
  intro = true,\r
  className = '',\r
  style\r
}: GridDistortionProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const controlRef = useRef<Control | null>(null);\r
  const settings = {\r
    grid: clamp(Math.round(grid), 2, 120),\r
    radius: clamp(radius, 0.01, 1),\r
    strength: Math.max(0, strength),\r
    relaxation: clamp(relaxation, 0, 0.995),\r
    mode: MODES.includes(mode) ? mode : ('drag' as GridDistortionMode),\r
    softness: clamp(softness, 0, 1),\r
    chroma: clamp(chroma, 0, 2),\r
    idle: clamp(idle, 0, 1),\r
    clickRipple,\r
    intro\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    const canvas = canvasRef.current;\r
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });\r
    if (!root || !canvas || !gl) return undefined;\r
\r
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);\r
    const program = gl.createProgram();\r
    if (!vertex || !fragment || !program) return undefined;\r
    gl.attachShader(program, vertex);\r
    gl.attachShader(program, fragment);\r
    gl.linkProgram(program);\r
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;\r
    gl.useProgram(program);\r
\r
    const buffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const position = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(position);\r
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);\r
\r
    const uniforms: Record<string, WebGLUniformLocation | null> = {};\r
    for (const name of ['uImage', 'uField', 'uGrid', 'uCover', 'uSoftness', 'uChroma', 'uReveal']) {\r
      uniforms[name] = gl.getUniformLocation(program, name);\r
    }\r
    gl.uniform1i(uniforms.uImage, 0);\r
    gl.uniform1i(uniforms.uField, 1);\r
\r
    const imageTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE0);\r
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
\r
    const fieldTexture = gl.createTexture();\r
    gl.activeTexture(gl.TEXTURE1);\r
    gl.bindTexture(gl.TEXTURE_2D, fieldTexture);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const pointer = { x: 0, y: 0, px: 0, py: 0, inside: false };\r
    const state = {\r
      width: 1,\r
      height: 1,\r
      cols: 0,\r
      rows: 0,\r
      sim: new Float32Array(0),\r
      out: new Float32Array(0),\r
      ripples: [] as Ripple[],\r
      time: 0,\r
      reveal: 0,\r
      loaded: false,\r
      imageAspect: 1,\r
      request: 0,\r
      lastMove: -10,\r
      phantom: 1\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const layout = () => {\r
      const cols = settingsRef.current.grid;\r
      const rows = Math.max(1, Math.round((cols * state.height) / state.width));\r
      if (cols === state.cols && rows === state.rows) return;\r
      state.cols = cols;\r
      state.rows = rows;\r
      state.sim = new Float32Array(cols * rows * 2);\r
      state.out = new Float32Array(cols * rows * 2);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, cols, rows, 0, gl.RG, gl.FLOAT, state.out);\r
    };\r
\r
    const scramble = () => {\r
      const { sim, cols, rows, width, height } = state;\r
      const reach = Math.min(width, height) * 0.12;\r
      for (let row = 0; row < rows; row++) {\r
        for (let col = 0; col < cols; col++) {\r
          const i = (row * cols + col) * 2;\r
          sim[i] = (hash(col + 1, row + 1, 11) * reach) / width;\r
          sim[i + 1] = (hash(col + 1, row + 1, 23) * reach) / height;\r
        }\r
      }\r
    };\r
\r
    const brush = (s: typeof settings, x: number, y: number, dx: number, dy: number, weight: number) => {\r
      const { sim, cols, rows, width, height } = state;\r
      const reach = Math.max(1, s.radius * width);\r
      const cellWidth = width / cols;\r
      const cellHeight = height / rows;\r
      const speed = Math.hypot(dx, dy);\r
      const limit = (0.25 + s.strength) * 0.4 * width;\r
      const fromCol = Math.max(0, Math.floor((x - reach) / cellWidth));\r
      const toCol = Math.min(cols - 1, Math.floor((x + reach) / cellWidth));\r
      const fromRow = Math.max(0, Math.floor((y - reach) / cellHeight));\r
      const toRow = Math.min(rows - 1, Math.floor((y + reach) / cellHeight));\r
      for (let row = fromRow; row <= toRow; row++) {\r
        for (let col = fromCol; col <= toCol; col++) {\r
          const ox = (col + 0.5) * cellWidth - x;\r
          const oy = (row + 0.5) * cellHeight - y;\r
          const distance = Math.hypot(ox, oy);\r
          if (distance >= reach) continue;\r
          const t = 1 - (distance / reach) ** 2;\r
          const k = s.strength * GAIN * weight * t * t;\r
          let vx = dx;\r
          let vy = dy;\r
          if (s.mode !== 'drag') {\r
            const nx = distance > 0 ? ox / distance : 0;\r
            const ny = distance > 0 ? oy / distance : 0;\r
            vx = s.mode === 'push' ? nx * speed : -ny * speed;\r
            vy = s.mode === 'push' ? ny * speed : nx * speed;\r
          }\r
          const i = (row * cols + col) * 2;\r
          const px = sim[i] * width + vx * k;\r
          const py = sim[i + 1] * height + vy * k;\r
          const length = Math.hypot(px, py);\r
          const scale = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;\r
          sim[i] = (px * scale) / width;\r
          sim[i + 1] = (py * scale) / height;\r
        }\r
      }\r
    };\r
\r
    const wander = (t: number) => [\r
      state.width * (0.5 + 0.34 * Math.sin(t * 0.43) + 0.08 * Math.sin(t * 1.21 + 1.7)),\r
      state.height * (0.5 + 0.3 * Math.sin(t * 0.61 + 0.9) + 0.08 * Math.cos(t * 1.03 + 0.4))\r
    ];\r
\r
    const simulate = (s: typeof settings, dt: number) => {\r
      const { sim } = state;\r
      const decay = Math.pow(s.relaxation, dt * 60);\r
      let peak = 0;\r
      for (let i = 0; i < sim.length; i++) {\r
        sim[i] *= decay;\r
        if (Math.abs(sim[i]) < 1e-5) sim[i] = 0;\r
        else peak = Math.max(peak, Math.abs(sim[i]));\r
      }\r
      if (s.strength <= 0) return peak;\r
\r
      const dx = pointer.x - pointer.px;\r
      const dy = pointer.y - pointer.py;\r
      pointer.px = pointer.x;\r
      pointer.py = pointer.y;\r
      if (pointer.inside && (dx || dy)) {\r
        state.lastMove = state.time;\r
        brush(s, pointer.x, pointer.y, dx, dy, 1);\r
        peak = Math.max(peak, 1e-3);\r
      }\r
\r
      const drift = reduce ? 0 : s.idle;\r
      const resting = state.time - state.lastMove > 2.5;\r
      state.phantom = clamp(state.phantom + (resting ? dt : -dt * 3), 0, 1);\r
      if (drift > 0 && state.phantom > 0) {\r
        const [x, y] = wander(state.time);\r
        const [px, py] = wander(state.time - dt);\r
        brush(s, x, y, x - px, y - py, drift * 0.6 * state.phantom * state.phantom);\r
      }\r
      return peak;\r
    };\r
\r
    const compose = (s: typeof settings) => {\r
      const { sim, out, cols, rows, width, height, time } = state;\r
      out.set(sim);\r
      if (state.ripples.length) {\r
        const cellWidth = width / cols;\r
        const cellHeight = height / rows;\r
        const span = Math.hypot(width, height);\r
        const band = Math.max(cellWidth, cellHeight) * 1.2 + span * 0.03;\r
        const amount = width * (0.03 + s.strength * 0.3);\r
        state.ripples = state.ripples.filter(ripple => time - ripple.start < RIPPLE_LIFE);\r
        for (const ripple of state.ripples) {\r
          const age = (time - ripple.start) / RIPPLE_LIFE;\r
          const front = age * span * 0.75;\r
          const fade = (1 - age) ** 2;\r
          for (let row = 0; row < rows; row++) {\r
            for (let col = 0; col < cols; col++) {\r
              const ox = (col + 0.5) * cellWidth - ripple.x;\r
              const oy = (row + 0.5) * cellHeight - ripple.y;\r
              const distance = Math.hypot(ox, oy);\r
              const wave = Math.exp(-(((distance - front) / band) ** 2)) * fade;\r
              if (wave < 0.002 || distance === 0) continue;\r
              const i = (row * cols + col) * 2;\r
              out[i] += (ox / distance) * ((wave * amount) / width);\r
              out[i + 1] += (oy / distance) * ((wave * amount) / height);\r
            }\r
          }\r
        }\r
      }\r
    };\r
\r
    const render = () => {\r
      const { width, height } = state;\r
      const aspect = width / height;\r
      const cover = aspect > state.imageAspect ? [1, state.imageAspect / aspect] : [aspect / state.imageAspect, 1];\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, state.cols, state.rows, gl.RG, gl.FLOAT, state.out);\r
      const s = settingsRef.current;\r
      gl.uniform2f(uniforms.uGrid, state.cols, state.rows);\r
      gl.uniform2f(uniforms.uCover, cover[0], cover[1]);\r
      gl.uniform1f(uniforms.uSoftness, s.softness);\r
      gl.uniform1f(uniforms.uChroma, s.chroma);\r
      gl.uniform1f(uniforms.uReveal, state.reveal);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      state.time += dt;\r
      layout();\r
      if (state.loaded) state.reveal = reduce ? 1 : Math.min(1, state.reveal + dt / 0.6);\r
      const peak = simulate(s, dt);\r
      compose(s);\r
      render();\r
      const busy = peak > 0 || state.ripples.length > 0 || (s.idle > 0 && !reduce) || state.reveal < 1;\r
      if (busy) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !visible) return;\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const load = (src?: string) => {\r
      const request = ++state.request;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || request !== state.request) return;\r
        gl.activeTexture(gl.TEXTURE0);\r
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\r
        gl.generateMipmap(gl.TEXTURE_2D);\r
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);\r
        state.imageAspect = image.naturalWidth / Math.max(1, image.naturalHeight);\r
        layout();\r
        if (settingsRef.current.intro && !reduce) scramble();\r
        state.loaded = true;\r
        wake();\r
      };\r
      image.src = src;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      if (inside && !pointer.inside) {\r
        pointer.px = x;\r
        pointer.py = y;\r
      }\r
      pointer.x = x;\r
      pointer.y = y;\r
      pointer.inside = inside;\r
      if (inside) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      if (!settingsRef.current.clickRipple || reduce) return;\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;\r
      state.ripples.push({ x, y, start: state.time });\r
      if (state.ripples.length > 4) state.ripples.shift();\r
      wake();\r
    };\r
\r
    const resize = () => {\r
      const dpr = Math.min(window.devicePixelRatio || 1, 2);\r
      state.width = Math.max(1, root.clientWidth);\r
      state.height = Math.max(1, root.clientHeight);\r
      canvas.width = Math.round(state.width * dpr);\r
      canvas.height = Math.round(state.height * dpr);\r
      layout();\r
      if (!raf) {\r
        compose(settingsRef.current);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    controlRef.current = { load, wake };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    const visibility = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) {\r
        last = 0;\r
        wake();\r
      }\r
    });\r
    visibility.observe(root);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      controlRef.current = null;\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      gl.deleteTexture(imageTexture);\r
      gl.deleteTexture(fieldTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteProgram(program);\r
      gl.deleteShader(vertex);\r
      gl.deleteShader(fragment);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    controlRef.current?.load(imageSrc);\r
  }, [imageSrc]);\r
\r
  useEffect(() => {\r
    controlRef.current?.wake();\r
  });\r
\r
  return (\r
    <div ref={rootRef} className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`} style={style}>\r
      <canvas ref={canvasRef} className={CANVAS} aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default GridDistortion;\r
`,s={usage:`import GridDistortion from './GridDistortion';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <GridDistortion
    imageSrc="/assets/demo/night-landscape.webp"
    grid={15}
    radius={0.18}
    strength={0.15}
    relaxation={0.96}
    mode="drag"
    softness={0}
    chroma={0}
    idle={0.3}
    clickRipple={true}
    intro={true}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{s as gridDistortion};
