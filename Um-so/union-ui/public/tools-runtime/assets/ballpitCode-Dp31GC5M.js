const n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const FOV = 50;\r
const CAMERA_Z = 20;\r
const MAX_ASPECT = 1.5;\r
const MAX_SPEED = 16;\r
const STRIDE = 12;\r
const SLOP = 0.01;\r
\r
const MATERIALS = {\r
  satin: { roughness: 0.42, metalness: 0, coat: 0.35, coatRoughness: 0.22, scatter: 1, frost: 0 },\r
  matte: { roughness: 0.92, metalness: 0, coat: 0, coatRoughness: 0.5, scatter: 0.5, frost: 0 },\r
  gloss: { roughness: 0.2, metalness: 0, coat: 1, coatRoughness: 0.08, scatter: 1, frost: 0 },\r
  frosted: { roughness: 0.55, metalness: 0, coat: 0.6, coatRoughness: 0.18, scatter: 1.5, frost: 1 },\r
  metal: { roughness: 0.3, metalness: 1, coat: 0, coatRoughness: 0.2, scatter: 0, frost: 0 }\r
};\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aSphere;\r
layout(location = 2) in vec4 aColor;\r
layout(location = 3) in vec4 aShade;\r
uniform mat4 uProj;\r
uniform float uCameraZ;\r
uniform float uPixel;\r
out vec3 vPoint;\r
flat out vec3 vCenter;\r
flat out float vRadius;\r
flat out vec4 vColor;\r
flat out vec4 vShade;\r
void main() {\r
  vec3 c = vec3(aSphere.xy, aSphere.z - uCameraZ);\r
  float r = aSphere.w;\r
  float d = length(c);\r
  vec3 toCamera = -c / d;\r
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), toCamera));\r
  vec3 up = cross(toCamera, right);\r
  float reach = r * d / sqrt(max(d * d - r * r, 1e-4)) + uPixel * d * 2.0;\r
  vec3 p = c + (right * aCorner.x + up * aCorner.y) * reach;\r
  vPoint = p;\r
  vCenter = c;\r
  vRadius = r;\r
  vColor = aColor;\r
  vShade = aShade;\r
  gl_Position = uProj * vec4(p, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec3 vPoint;\r
flat in vec3 vCenter;\r
flat in float vRadius;\r
flat in vec4 vColor;\r
flat in vec4 vShade;\r
uniform mat4 uProj;\r
uniform vec3 uLightPos;\r
uniform vec3 uLight;\r
uniform float uExposure;\r
uniform float uShadow;\r
uniform vec4 uSurface;\r
uniform vec2 uExtra;\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
\r
float lobe(vec3 d, vec3 axis, float sharp) {\r
  return pow(max(dot(d, axis), 0.0), sharp) * (sharp + 1.0) * 0.16;\r
}\r
\r
vec3 studio(vec3 d, float rough) {\r
  float r = clamp(rough, 0.0, 1.0);\r
  float sharp = mix(60.0, 1.2, sqrt(r));\r
  vec3 col = mix(vec3(0.085, 0.085, 0.09), vec3(0.38, 0.38, 0.39), smoothstep(-0.7, 0.9, d.y));\r
  col += vec3(1.0, 0.99, 0.97) * 2.6 * lobe(d, normalize(vec3(-0.42, 0.78, 0.47)), sharp);\r
  col += vec3(0.97, 0.98, 1.0) * 1.1 * lobe(d, normalize(vec3(0.78, 0.22, 0.58)), sharp * 0.7);\r
  col += vec3(1.0) * 1.3 * lobe(d, normalize(vec3(0.15, 0.55, -0.82)), sharp * 0.8);\r
  return col;\r
}\r
\r
vec2 envBRDF(float NoV, float rough) {\r
  vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);\r
  vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);\r
  vec4 r = rough * c0 + c1;\r
  float a = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;\r
  return vec2(-1.04, 1.04) * a + r.zw;\r
}\r
\r
float ggx(float NoH, float a) {\r
  float a2 = a * a;\r
  float d = NoH * NoH * (a2 - 1.0) + 1.0;\r
  return a2 / (PI * d * d);\r
}\r
\r
float smith(float NoV, float NoL, float a) {\r
  float k = a * 0.5;\r
  return 0.25 / max((NoV * (1.0 - k) + k) * (NoL * (1.0 - k) + k), 1e-4);\r
}\r
\r
vec3 aces(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec3 rd = normalize(vPoint);\r
  float b = dot(vCenter, rd);\r
  float h = length(vCenter - rd * b);\r
  float r = vRadius;\r
  float aa = max(fwidth(h), 1e-5);\r
  float cover = clamp((r - h) / aa + 0.5, 0.0, 1.0);\r
  if (cover <= 0.002) discard;\r
  float hc = min(h, r * 0.9995);\r
  float t = b - sqrt(r * r - hc * hc);\r
  vec3 pos = rd * t;\r
  vec3 n = normalize(pos - vCenter);\r
  vec4 clip = uProj * vec4(pos, 1.0);\r
  gl_FragDepth = clamp(clip.z / clip.w * 0.5 + 0.5, 0.0, 1.0);\r
\r
  vec3 v = -rd;\r
  vec3 albedo = vColor.rgb;\r
  bool lamp = vColor.a > 0.5;\r
  vec3 dn = fwidth(n);\r
  float rough = sqrt(min(uSurface.x * uSurface.x + dot(dn, dn) * 0.6, 1.0));\r
  float metal = uSurface.y;\r
  float coat = uSurface.z;\r
  float coatRough = sqrt(min(uSurface.w * uSurface.w + dot(dn, dn) * 0.6, 1.0));\r
  float NoV = clamp(dot(n, v), 1e-4, 1.0);\r
  vec3 R = reflect(-v, n);\r
\r
  float occlusion = vShade.w * smoothstep(-0.15, 0.9, dot(n, vShade.xyz));\r
  float ao = 1.0 - uShadow * occlusion;\r
  float specAo = 1.0 - uShadow * occlusion * 0.7;\r
\r
  vec3 L = uLightPos - pos;\r
  float dist2 = dot(L, L);\r
  L *= inversesqrt(dist2);\r
  vec3 radiance = lamp ? vec3(0.0) : uLight / (dist2 + 1.0);\r
  float NoL = clamp(dot(n, L), 0.0, 1.0);\r
  vec3 H = normalize(L + v);\r
  float NoH = clamp(dot(n, H), 0.0, 1.0);\r
  float VoH = clamp(dot(v, H), 0.0, 1.0);\r
\r
  vec3 F0 = mix(vec3(0.04), albedo, metal);\r
  vec2 ab = envBRDF(NoV, rough);\r
  vec3 Fr = max(vec3(1.0 - rough), F0) - F0;\r
  vec3 kS = F0 + Fr * pow(1.0 - NoV, 5.0);\r
  vec3 diffuseColor = albedo * (1.0 - metal);\r
  vec3 irradiance = studio(n, 1.0) * 1.15;\r
  vec3 envSpec = studio(R, rough) * (F0 * ab.x + ab.y);\r
  vec3 col = diffuseColor * irradiance * (1.0 - kS) * ao + envSpec * specAo;\r
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - VoH, 5.0);\r
  float a = max(rough * rough, 0.06);\r
  vec3 spec = ggx(NoH, a) * smith(NoV, NoL, a) * F;\r
  float wrap = clamp((dot(n, L) + 0.3) / 1.3, 0.0, 1.0);\r
  col += (diffuseColor * (1.0 - F) / PI * wrap + spec * NoL) * radiance;\r
  vec3 sh = normalize(L + n * 0.1);\r
  float scatter = pow(clamp(dot(v, -sh), 0.0, 1.0), 2.0) * 10.0 + 0.04;\r
  col += scatter * albedo * radiance * 0.03 * uExtra.x;\r
  float alpha = 1.0;\r
  if (uExtra.y > 0.5) {\r
    float rim = pow(1.0 - NoV, 2.5);\r
    col += albedo * (studio(-R, 1.0) * 0.35 + 0.06) * (1.0 - rim);\r
    col += radiance * albedo * pow(max(dot(-v, L), 0.0), 3.0) * 0.08;\r
    alpha = mix(0.5, 0.96, rim);\r
  }\r
  if (coat > 0.0) {\r
    float Fc = 0.04 + 0.96 * pow(1.0 - NoV, 5.0);\r
    float ca = max(coatRough * coatRough, 0.03);\r
    vec3 coatEnv = studio(R, coatRough) * Fc;\r
    float coatSpec = ggx(NoH, ca) * smith(NoV, NoL, ca) * (0.04 + 0.96 * pow(1.0 - VoH, 5.0)) * NoL;\r
    col = col * (1.0 - Fc * coat) + (coatEnv * specAo + radiance * coatSpec) * coat;\r
    alpha = mix(alpha, 1.0, Fc * coat);\r
  }\r
  if (lamp) col += uLight * 0.0025 * (0.4 + 0.6 * albedo);\r
  col = aces(col * uExposure);\r
  col = pow(col, vec3(1.0 / 2.2));\r
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;\r
  float a2 = alpha * cover;\r
  outColor = vec4(col * a2, a2);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
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
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toLinear = value => {\r
  let rgb;\r
  if (typeof value === 'number') {\r
    rgb = [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];\r
  } else {\r
    let hex = String(value || '#ffffff')\r
      .replace('#', '')\r
      .trim();\r
    if (hex.length === 3 || hex.length === 4)\r
      hex = hex\r
        .slice(0, 3)\r
        .split('')\r
        .map(c => c + c)\r
        .join('');\r
    const num = parseInt(hex.slice(0, 6), 16);\r
    rgb = Number.isNaN(num) ? [1, 1, 1] : [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
  }\r
  return rgb.map(c => Math.pow(c, 2.2));\r
};\r
\r
const Ballpit = ({\r
  count = 200,\r
  colors = ['#ffffff'],\r
  material = 'satin',\r
  minSize = 0.5,\r
  maxSize = 1,\r
  gravity = 0.5,\r
  friction = 0.9975,\r
  wallBounce = 0.95,\r
  bounce = 0.85,\r
  depth = 2,\r
  drift = 0,\r
  followCursor = true,\r
  cursorSize = 1,\r
  grab = true,\r
  clickEffect = 'burst',\r
  lightColor = '#ffffff',\r
  lightIntensity = 1,\r
  exposure = 1,\r
  shadows = 0.6,\r
  intro = true,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    count: Math.round(clamp(count, 1, 4000)),\r
    colors: Array.isArray(colors) && colors.length ? colors : ['#ffffff'],\r
    material: MATERIALS[material] ? material : 'satin',\r
    minSize: Math.max(0.05, Math.min(minSize, maxSize)),\r
    maxSize: Math.max(0.05, Math.max(minSize, maxSize)),\r
    gravity,\r
    friction: clamp(friction, 0.5, 1),\r
    wallBounce: clamp(wallBounce, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    depth: Math.max(0, depth),\r
    drift: Math.max(0, drift),\r
    followCursor,\r
    cursorSize: Math.max(0, cursorSize),\r
    grab,\r
    clickEffect,\r
    lightColor,\r
    lightIntensity: lightIntensity > 20 ? lightIntensity / 200 : Math.max(0, lightIntensity),\r
    exposure: Math.max(0, exposure),\r
    shadows: clamp(shadows, 0, 1),\r
    intro,\r
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
      depth: true,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, halfW: 9, halfH: 9, fit: 1, tan: Math.tan((FOV * Math.PI) / 360) };\r
    const projection = new Float32Array(16);\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const quad = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const instances = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
    for (let k = 0; k < 3; k++) {\r
      gl.enableVertexAttribArray(1 + k);\r
      gl.vertexAttribPointer(1 + k, 4, gl.FLOAT, false, STRIDE * 4, k * 16);\r
      gl.vertexAttribDivisor(1 + k, 1);\r
    }\r
    gl.bindVertexArray(null);\r
\r
    let capacity = 0;\r
    let n = 0;\r
    let px = new Float32Array(0);\r
    let py = new Float32Array(0);\r
    let pz = new Float32Array(0);\r
    let vx = new Float32Array(0);\r
    let vy = new Float32Array(0);\r
    let vz = new Float32Array(0);\r
    let rad = new Float32Array(0);\r
    let inv = new Float32Array(0);\r
    let size = new Float32Array(0);\r
    let phase = new Float32Array(0);\r
    let occ = new Float32Array(0);\r
    let still = new Float32Array(0);\r
    let tone = new Uint16Array(0);\r
    let entered = new Uint8Array(0);\r
    let cellOf = new Int32Array(0);\r
    let sorted = new Int32Array(0);\r
    let order = new Int32Array(1);\r
    let data = new Float32Array(STRIDE);\r
    let table = new Int32Array(2);\r
    let starts = new Int32Array(2);\r
    let palette = [];\r
    let paletteKey = '';\r
    let lastSizes = '';\r
\r
    const allocate = total => {\r
      const grow = (old, width = 1) => {\r
        const next = new Float32Array(total * width);\r
        next.set(old.subarray(0, Math.min(old.length, next.length)));\r
        return next;\r
      };\r
      const growUint8 = old => {\r
        const next = new Uint8Array(total);\r
        next.set(old.subarray(0, Math.min(old.length, next.length)));\r
        return next;\r
      };\r
      px = grow(px);\r
      py = grow(py);\r
      pz = grow(pz);\r
      vx = grow(vx);\r
      vy = grow(vy);\r
      vz = grow(vz);\r
      rad = grow(rad);\r
      inv = grow(inv);\r
      size = grow(size);\r
      phase = grow(phase);\r
      occ = grow(occ, 4);\r
      still = grow(still, 3);\r
      const nextTone = new Uint16Array(total);\r
      nextTone.set(tone.subarray(0, Math.min(tone.length, total)));\r
      tone = nextTone;\r
      entered = growUint8(entered);\r
      cellOf = new Int32Array(total);\r
      sorted = new Int32Array(total);\r
      order = new Int32Array(total + 1);\r
      data = new Float32Array((total + 1) * STRIDE);\r
      capacity = total;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
      gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const pointer = { x: 0, y: 0, inside: false, down: false, downX: 0, downY: 0, downAt: 0, moved: false };\r
    const cursor = { x: 0, y: 0, z: 0, r: 0, tx: 0, ty: 0, vx: 0, vy: 0 };\r
    const light = { x: 0, y: 5, z: 6, flash: 0 };\r
    const held = { index: -1, ox: 0, oy: 0, tx: 0, ty: 0, vx: 0, vy: 0 };\r
    let elapsed = 0;\r
    let glide = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const spawn = (i, s, fromTop) => {\r
      const r = rad[i];\r
      const zr = Math.max(s.depth - r, 0);\r
      entered[i] = 1;\r
      if (fromTop && s.gravity > 0.05) {\r
        px[i] = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        py[i] = view.halfH + r + Math.random() * view.halfH * 2.2;\r
        pz[i] = (Math.random() * 2 - 1) * zr;\r
        vx[i] = (Math.random() - 0.5) * 2;\r
        vy[i] = -(4 + Math.random() * 5);\r
        vz[i] = 0;\r
        entered[i] = 0;\r
      } else if (fromTop) {\r
        const tx = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        const ty = (Math.random() * 2 - 1) * Math.max(view.halfH - r, 0.01);\r
        const tz = (Math.random() * 2 - 1) * zr;\r
        px[i] = (Math.random() * 2 - 1) * 0.6;\r
        py[i] = (Math.random() * 2 - 1) * 0.6;\r
        pz[i] = (Math.random() * 2 - 1) * Math.min(zr, 0.3);\r
        vx[i] = (tx - px[i]) * 2.2;\r
        vy[i] = (ty - py[i]) * 2.2;\r
        vz[i] = (tz - pz[i]) * 2.2;\r
        glide = 1;\r
      } else {\r
        px[i] = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        py[i] = (Math.random() * 2 - 1) * Math.max(view.halfH - r, 0.01);\r
        pz[i] = (Math.random() * 2 - 1) * zr;\r
        vx[i] = 0;\r
        vy[i] = 0;\r
        vz[i] = 0;\r
      }\r
    };\r
\r
    const applySizes = s => {\r
      for (let i = 0; i < n; i++) {\r
        rad[i] = (s.minSize + size[i] * (s.maxSize - s.minSize)) * view.fit;\r
        inv[i] = 1 / (rad[i] * rad[i] * rad[i]);\r
      }\r
    };\r
\r
    const applyPalette = s => {\r
      palette = s.colors.map(toLinear);\r
      paletteKey = s.colors.join('|');\r
    };\r
\r
    const sync = (s, first) => {\r
      const key = \`\${s.minSize}:\${s.maxSize}:\${view.fit}\`;\r
      if (s.count !== n) {\r
        if (s.count > capacity) allocate(Math.max(s.count, Math.ceil(capacity * 1.5)));\r
        const from = n;\r
        n = s.count;\r
        for (let i = from; i < n; i++) {\r
          size[i] = Math.random();\r
          tone[i] = i;\r
          phase[i] = Math.random() * Math.PI * 2;\r
          rad[i] = (s.minSize + size[i] * (s.maxSize - s.minSize)) * view.fit;\r
          inv[i] = 1 / (rad[i] * rad[i] * rad[i]);\r
          spawn(i, s, (first ? s.intro : true) && !reduce);\r
        }\r
        for (let i = 0; i <= n; i++) order[i] = i;\r
      }\r
      if (key !== lastSizes) {\r
        lastSizes = key;\r
        applySizes(s);\r
      }\r
      if (s.colors.join('|') !== paletteKey) applyPalette(s);\r
    };\r
\r
    let contacts = new Float32Array(0);\r
    let contactCount = 0;\r
\r
    const grid = { scale: 1, x0: 0, y0: 0, z0: 0, nx: 1, ny: 1, nz: 1 };\r
\r
    const buildGrid = (cell, s) => {\r
      grid.scale = 1 / cell;\r
      grid.x0 = -view.halfW - cell;\r
      grid.y0 = -view.halfH - cell;\r
      grid.z0 = -Math.max(s.depth, s.maxSize) - cell;\r
      grid.nx = Math.max(1, Math.ceil((view.halfW * 2 + cell * 2) * grid.scale) + 1);\r
      grid.ny = Math.max(1, Math.ceil((view.halfH * 2 + cell * 2) * grid.scale) + 1);\r
      grid.nz = Math.max(1, Math.ceil((Math.max(s.depth, s.maxSize) * 2 + cell * 2) * grid.scale) + 1);\r
      const cells = grid.nx * grid.ny * grid.nz;\r
      if (table.length < cells + 1) {\r
        table = new Int32Array(cells + 1);\r
        starts = new Int32Array(cells + 1);\r
      }\r
      table.fill(0, 0, cells + 1);\r
      for (let i = 0; i < n; i++) {\r
        const cx = clamp(Math.floor((px[i] - grid.x0) * grid.scale), 0, grid.nx - 1);\r
        const cy = clamp(Math.floor((py[i] - grid.y0) * grid.scale), 0, grid.ny - 1);\r
        const cz = clamp(Math.floor((pz[i] - grid.z0) * grid.scale), 0, grid.nz - 1);\r
        const c = (cz * grid.ny + cy) * grid.nx + cx;\r
        cellOf[i] = c;\r
        table[c + 1]++;\r
      }\r
      for (let c = 1; c <= cells; c++) table[c] += table[c - 1];\r
      starts.set(table.subarray(0, cells + 1));\r
      for (let i = 0; i < n; i++) sorted[starts[cellOf[i]]++] = i;\r
    };\r
\r
    const wall = (i, gap, nx, ny, nz, bounce, margin) => {\r
      if (gap >= margin || contactCount * 8 >= contacts.length) return;\r
      const approach = vx[i] * nx + vy[i] * ny + vz[i] * nz;\r
      const o = contactCount * 8;\r
      contacts[o] = i;\r
      contacts[o + 1] = -2;\r
      contacts[o + 2] = nx;\r
      contacts[o + 3] = ny;\r
      contacts[o + 4] = nz;\r
      contacts[o + 5] = gap;\r
      contacts[o + 6] = approach < -1.5 ? -bounce * approach : 0;\r
      contacts[o + 7] = 0;\r
      contactCount++;\r
    };\r
\r
    const findContacts = (s, dt, shade, margin) => {\r
      const heldIndex = held.index;\r
      const { nx: gx, ny: gy, nz: gz } = grid;\r
      contactCount = 0;\r
      for (let i = 0; i < n; i++) {\r
        const c = cellOf[i];\r
        const cx = c % gx;\r
        const cy = Math.floor(c / gx) % gy;\r
        const cz = Math.floor(c / (gx * gy));\r
        for (let dz = cz > 0 ? -1 : 0; dz <= (cz < gz - 1 ? 1 : 0); dz++) {\r
          for (let dy = cy > 0 ? -1 : 0; dy <= (cy < gy - 1 ? 1 : 0); dy++) {\r
            const row = ((cz + dz) * gy + cy + dy) * gx;\r
            for (let dx = cx > 0 ? -1 : 0; dx <= (cx < gx - 1 ? 1 : 0); dx++) {\r
              const cell = row + cx + dx;\r
              for (let k = table[cell]; k < table[cell + 1]; k++) {\r
                const j = sorted[k];\r
                if (j <= i) continue;\r
                const ddx = px[j] - px[i];\r
                const ddy = py[j] - py[i];\r
                const ddz = pz[j] - pz[i];\r
                const d2 = ddx * ddx + ddy * ddy + ddz * ddz;\r
                const sum = rad[i] + rad[j];\r
                const reach = Math.max(sum + margin, shade ? sum * 1.4 : 0);\r
                if (d2 >= reach * reach || d2 < 1e-12) continue;\r
                const d = Math.sqrt(d2);\r
                const nx = ddx / d;\r
                const ny = ddy / d;\r
                const nz = ddz / d;\r
                if (shade) {\r
                  const w = clamp(1 - (d - sum) / (sum * 0.4), 0, 1);\r
                  occ[i * 4] += nx * w;\r
                  occ[i * 4 + 1] += ny * w;\r
                  occ[i * 4 + 2] += nz * w;\r
                  occ[i * 4 + 3] += w;\r
                  occ[j * 4] -= nx * w;\r
                  occ[j * 4 + 1] -= ny * w;\r
                  occ[j * 4 + 2] -= nz * w;\r
                  occ[j * 4 + 3] += w;\r
                }\r
                if (d >= sum + margin || contactCount * 8 >= contacts.length) continue;\r
                if (i === heldIndex && j === heldIndex) continue;\r
                const approach = (vx[j] - vx[i]) * nx + (vy[j] - vy[i]) * ny + (vz[j] - vz[i]) * nz;\r
                const o = contactCount * 8;\r
                contacts[o] = i;\r
                contacts[o + 1] = j;\r
                contacts[o + 2] = nx;\r
                contacts[o + 3] = ny;\r
                contacts[o + 4] = nz;\r
                contacts[o + 5] = d - sum;\r
                contacts[o + 6] = approach < -1.5 ? -s.bounce * approach : 0;\r
                contacts[o + 7] = 0;\r
                contactCount++;\r
              }\r
            }\r
          }\r
        }\r
        if (i !== heldIndex) {\r
          const r = rad[i];\r
          const zr = Math.max(s.depth - r, 0);\r
          wall(i, px[i] + view.halfW - r, 1, 0, 0, s.wallBounce, margin);\r
          wall(i, view.halfW - r - px[i], -1, 0, 0, s.wallBounce, margin);\r
          wall(i, py[i] + view.halfH - r, 0, 1, 0, s.wallBounce, margin);\r
          if (entered[i]) wall(i, view.halfH - r - py[i], 0, -1, 0, s.wallBounce, margin);\r
          wall(i, pz[i] + zr, 0, 0, 1, s.wallBounce, margin);\r
          wall(i, zr - pz[i], 0, 0, -1, s.wallBounce, margin);\r
        }\r
        if (cursor.r > 0.01 && i !== heldIndex && contactCount * 8 < contacts.length) {\r
          const ddx = px[i] - cursor.x;\r
          const ddy = py[i] - cursor.y;\r
          const ddz = pz[i] - cursor.z;\r
          const sum = rad[i] + cursor.r;\r
          const d2 = ddx * ddx + ddy * ddy + ddz * ddz;\r
          if (d2 < (sum + margin) * (sum + margin) && d2 > 1e-12) {\r
            const d = Math.sqrt(d2);\r
            const nx = ddx / d;\r
            const ny = ddy / d;\r
            const nz = ddz / d;\r
            const approach = (vx[i] - cursor.vx) * nx + (vy[i] - cursor.vy) * ny + vz[i] * nz;\r
            const o = contactCount * 8;\r
            contacts[o] = i;\r
            contacts[o + 1] = -1;\r
            contacts[o + 2] = nx;\r
            contacts[o + 3] = ny;\r
            contacts[o + 4] = nz;\r
            contacts[o + 5] = d - sum;\r
            contacts[o + 6] = approach < -1.5 ? -s.bounce * approach : 0;\r
            contacts[o + 7] = 0;\r
            contactCount++;\r
          }\r
        }\r
      }\r
    };\r
\r
    const solveVelocities = dt => {\r
      const heldIndex = held.index;\r
      const iterations = n > 800 ? 5 : 8;\r
      for (let iteration = 0; iteration < iterations; iteration++) {\r
        for (let c = 0; c < contactCount; c++) {\r
          const o = c * 8;\r
          const i = contacts[o];\r
          const j = contacts[o + 1];\r
          const nx = contacts[o + 2];\r
          const ny = contacts[o + 3];\r
          const nz = contacts[o + 4];\r
          const gap = contacts[o + 5];\r
          const target = gap > 0 ? -gap / dt : contacts[o + 6];\r
          const before = contacts[o + 7];\r
          if (j < 0) {\r
            const vn =\r
              j === -1\r
                ? (vx[i] - cursor.vx) * nx + (vy[i] - cursor.vy) * ny + vz[i] * nz\r
                : vx[i] * nx + vy[i] * ny + vz[i] * nz;\r
            const after = Math.max(before + target - vn, 0);\r
            const change = after - before;\r
            contacts[o + 7] = after;\r
            vx[i] += change * nx;\r
            vy[i] += change * ny;\r
            vz[i] += change * nz;\r
            continue;\r
          }\r
          const wi = i === heldIndex ? 0 : inv[i];\r
          const wj = j === heldIndex ? 0 : inv[j];\r
          const w = wi + wj;\r
          if (w <= 0) continue;\r
          const vn = (vx[j] - vx[i]) * nx + (vy[j] - vy[i]) * ny + (vz[j] - vz[i]) * nz;\r
          const after = Math.max(before + (target - vn) / w, 0);\r
          const change = after - before;\r
          contacts[o + 7] = after;\r
          vx[i] -= change * wi * nx;\r
          vy[i] -= change * wi * ny;\r
          vz[i] -= change * wi * nz;\r
          vx[j] += change * wj * nx;\r
          vy[j] += change * wj * ny;\r
          vz[j] += change * wj * nz;\r
        }\r
      }\r
    };\r
\r
    const correctPositions = () => {\r
      const heldIndex = held.index;\r
      for (let pass = 0; pass < 2; pass++) {\r
        for (let c = 0; c < contactCount; c++) {\r
          const o = c * 8;\r
          const i = contacts[o];\r
          const j = contacts[o + 1];\r
          if (j === -2) continue;\r
          if (j < 0) {\r
            const ddx = px[i] - cursor.x;\r
            const ddy = py[i] - cursor.y;\r
            const ddz = pz[i] - cursor.z;\r
            const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);\r
            const overlap = rad[i] + cursor.r - d - SLOP;\r
            if (overlap <= 0 || d < 1e-6) continue;\r
            const k = (overlap * 0.5) / d;\r
            px[i] += ddx * k;\r
            py[i] += ddy * k;\r
            pz[i] += ddz * k;\r
            continue;\r
          }\r
          const ddx = px[j] - px[i];\r
          const ddy = py[j] - py[i];\r
          const ddz = pz[j] - pz[i];\r
          const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);\r
          const overlap = rad[i] + rad[j] - d - SLOP;\r
          if (overlap <= 0 || d < 1e-6) continue;\r
          const wi = i === heldIndex ? 0 : inv[i];\r
          const wj = j === heldIndex ? 0 : inv[j];\r
          const w = wi + wj;\r
          if (w <= 0) continue;\r
          const k = (overlap * 0.3) / (d * w);\r
          px[i] -= ddx * k * wi;\r
          py[i] -= ddy * k * wi;\r
          pz[i] -= ddz * k * wi;\r
          px[j] += ddx * k * wj;\r
          py[j] += ddy * k * wj;\r
          pz[j] += ddz * k * wj;\r
        }\r
      }\r
    };\r
\r
    const walls = s => {\r
      const hw = view.halfW;\r
      const hh = view.halfH;\r
      const e = s.wallBounce;\r
      for (let i = 0; i < n; i++) {\r
        const r = rad[i];\r
        if (px[i] < -hw + r) {\r
          px[i] = -hw + r;\r
          if (vx[i] < 0) vx[i] = vx[i] < -1.5 ? -vx[i] * e : 0;\r
        } else if (px[i] > hw - r) {\r
          px[i] = hw - r;\r
          if (vx[i] > 0) vx[i] = vx[i] > 1.5 ? -vx[i] * e : 0;\r
        }\r
        if (py[i] < -hh + r) {\r
          py[i] = -hh + r;\r
          if (vy[i] < 0) vy[i] = vy[i] < -1.5 ? -vy[i] * e : 0;\r
          vx[i] *= 0.995;\r
          vz[i] *= 0.995;\r
        } else if (entered[i] && py[i] > hh - r) {\r
          py[i] = hh - r;\r
          if (vy[i] > 0) vy[i] = vy[i] > 1.5 ? -vy[i] * e : 0;\r
        }\r
        if (!entered[i] && py[i] < hh - r) entered[i] = 1;\r
        const zr = Math.max(s.depth - r, 0);\r
        if (pz[i] < -zr) {\r
          pz[i] = -zr;\r
          if (vz[i] < 0) vz[i] = vz[i] < -1.5 ? -vz[i] * e : 0;\r
        } else if (pz[i] > zr) {\r
          pz[i] = zr;\r
          if (vz[i] > 0) vz[i] = vz[i] > 1.5 ? -vz[i] * e : 0;\r
        }\r
      }\r
    };\r
\r
    const step = (s, dt, shade) => {\r
      const g = s.gravity * 45;\r
      const damp = Math.pow(s.friction, dt * 60) * (glide > 0 ? Math.exp(-2.2 * dt) : 1);\r
      const wander = reduce ? 0 : s.drift * 2.2;\r
      const biggest = s.maxSize * view.fit;\r
      const margin = biggest * 0.3;\r
      if (contacts.length < n * 96) contacts = new Float32Array(n * 96);\r
      for (let i = 0; i < n; i++) {\r
        if (i === held.index) {\r
          const f = 1 - Math.exp(-dt / 0.02);\r
          vx[i] = ((held.tx - px[i]) * f) / dt;\r
          vy[i] = ((held.ty - py[i]) * f) / dt;\r
          vz[i] = 0;\r
          continue;\r
        }\r
        vy[i] -= g * dt;\r
        if (wander) {\r
          const p = phase[i];\r
          vx[i] += Math.sin(elapsed * 0.63 + p) * wander * dt;\r
          vy[i] += Math.cos(elapsed * 0.47 + p * 1.7) * wander * dt;\r
          vz[i] += Math.sin(elapsed * 0.41 + p * 2.3) * wander * dt * 0.5;\r
        }\r
        vx[i] *= damp;\r
        vy[i] *= damp;\r
        vz[i] *= damp;\r
        const sp = vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i];\r
        if (sp > MAX_SPEED * MAX_SPEED) {\r
          const f = MAX_SPEED / Math.sqrt(sp);\r
          vx[i] *= f;\r
          vy[i] *= f;\r
          vz[i] *= f;\r
        }\r
      }\r
      buildGrid(biggest * (shade ? 2.8 : 2.3), s);\r
      if (shade) occ.fill(0, 0, n * 4);\r
      findContacts(s, dt, shade, margin);\r
      solveVelocities(dt);\r
      for (let i = 0; i < n; i++) {\r
        px[i] += vx[i] * dt;\r
        py[i] += vy[i] * dt;\r
        pz[i] += vz[i] * dt;\r
      }\r
      correctPositions();\r
      walls(s);\r
      if (shade) {\r
        for (let i = 0; i < n; i++) {\r
          const gap = py[i] - rad[i] + view.halfH;\r
          const reach = rad[i] * 0.5;\r
          if (gap >= reach) continue;\r
          const w = 1 - Math.max(gap, 0) / reach;\r
          occ[i * 4 + 1] -= w;\r
          occ[i * 4 + 3] += w;\r
        }\r
      }\r
      if (held.index >= 0) {\r
        const i = held.index;\r
        held.vx += (vx[i] - held.vx) * (1 - Math.exp(-dt / 0.05));\r
        held.vy += (vy[i] - held.vy) * (1 - Math.exp(-dt / 0.05));\r
      }\r
    };\r
\r
    const rayTo = (clientX, clientY) => {\r
      const rect = container.getBoundingClientRect();\r
      const nx = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;\r
      const ny = 1 - ((clientY - rect.top) / Math.max(rect.height, 1)) * 2;\r
      return [nx * view.tan * (view.width / view.height), ny * view.tan, -1];\r
    };\r
\r
    const onPlane = (ray, z) => {\r
      const t = (z - CAMERA_Z) / ray[2];\r
      return [ray[0] * t, ray[1] * t];\r
    };\r
\r
    const pick = ray => {\r
      const len = Math.hypot(ray[0], ray[1], ray[2]);\r
      const dx = ray[0] / len;\r
      const dy = ray[1] / len;\r
      const dz = ray[2] / len;\r
      let best = -1;\r
      let bestT = Infinity;\r
      for (let i = 0; i < n; i++) {\r
        const ox = -px[i];\r
        const oy = -py[i];\r
        const oz = CAMERA_Z - pz[i];\r
        const b = ox * dx + oy * dy + oz * dz;\r
        const r = rad[i] * 1.15;\r
        const c = ox * ox + oy * oy + oz * oz - r * r;\r
        const disc = b * b - c;\r
        if (disc < 0) continue;\r
        const t = -b - Math.sqrt(disc);\r
        if (t > 0 && t < bestT) {\r
          bestT = t;\r
          best = i;\r
        }\r
      }\r
      return best;\r
    };\r
\r
    const burst = (x, y) => {\r
      const s = settingsRef.current;\r
      const reach = view.halfH * 0.7;\r
      for (let i = 0; i < n; i++) {\r
        const dx = px[i] - x;\r
        const dy = py[i] - y;\r
        const dz = pz[i];\r
        const d = Math.hypot(dx, dy, dz);\r
        if (d >= reach || d < 1e-4) continue;\r
        const f = Math.pow(1 - d / reach, 2) * 26 * (1 + 0.6 / (rad[i] + 0.4));\r
        vx[i] += (dx / d) * f;\r
        vy[i] += (dy / d) * f + f * 0.25;\r
        vz[i] += (dz / d) * f * 0.5;\r
      }\r
      light.x = x;\r
      light.y = y;\r
      light.z = Math.max(s.depth, 1) + 1.5;\r
      light.flash = 1;\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const aspect = view.width / view.height;\r
      const base = Math.tan((FOV * Math.PI) / 360);\r
      view.tan = aspect > MAX_ASPECT ? (base * MAX_ASPECT) / aspect : base;\r
      view.halfH = view.tan * CAMERA_Z;\r
      view.halfW = view.halfH * aspect;\r
      view.fit = clamp(Math.sqrt((view.halfW * view.halfH) / (base * base * CAMERA_Z * CAMERA_Z * MAX_ASPECT)), 0.4, 1);\r
      const f = 1 / view.tan;\r
      const near = 1;\r
      const far = 80;\r
      projection.fill(0);\r
      projection[0] = f / aspect;\r
      projection[5] = f;\r
      projection[10] = (far + near) / (near - far);\r
      projection[11] = -1;\r
      projection[14] = (2 * far * near) / (near - far);\r
      if (!n) sync(s, true);\r
      draw();\r
      wake();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const mat = MATERIALS[s.material];\r
      let count = 0;\r
      const total = n + 1;\r
      for (let a = 1; a < total; a++) {\r
        const item = order[a];\r
        const z = item === n ? cursor.z : pz[item];\r
        let b = a - 1;\r
        while (b >= 0 && (order[b] === n ? cursor.z : pz[order[b]]) > z) {\r
          order[b + 1] = order[b];\r
          b--;\r
        }\r
        order[b + 1] = item;\r
      }\r
      for (let k = 0; k < total; k++) {\r
        const i = order[k];\r
        const o = count * STRIDE;\r
        if (i === n) {\r
          if (cursor.r < 0.01 || !s.followCursor) continue;\r
          const c = palette[0] || [1, 1, 1];\r
          data[o] = cursor.x;\r
          data[o + 1] = cursor.y;\r
          data[o + 2] = cursor.z;\r
          data[o + 3] = cursor.r;\r
          data[o + 4] = c[0];\r
          data[o + 5] = c[1];\r
          data[o + 6] = c[2];\r
          data[o + 7] = 1;\r
          data[o + 8] = 0;\r
          data[o + 9] = 0;\r
          data[o + 10] = 0;\r
          data[o + 11] = 0;\r
        } else {\r
          const c = palette[tone[i] % palette.length];\r
          data[o] = px[i];\r
          data[o + 1] = py[i];\r
          data[o + 2] = pz[i];\r
          data[o + 3] = rad[i];\r
          data[o + 4] = c[0];\r
          data[o + 5] = c[1];\r
          data[o + 6] = c[2];\r
          data[o + 7] = 0;\r
          const w = occ[i * 4 + 3];\r
          const len = Math.hypot(occ[i * 4], occ[i * 4 + 1], occ[i * 4 + 2]) || 1;\r
          data[o + 8] = occ[i * 4] / len;\r
          data[o + 9] = occ[i * 4 + 1] / len;\r
          data[o + 10] = occ[i * 4 + 2] / len;\r
          data[o + 11] = Math.min(w * 0.55, 1);\r
        }\r
        count++;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!count) return;\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.depthFunc(gl.LEQUAL);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.uniformMatrix4fv(u.uProj, false, projection);\r
      gl.uniform1f(u.uCameraZ, CAMERA_Z);\r
      gl.uniform1f(u.uPixel, (2 * view.tan) / canvas.height);\r
      const lc = toLinear(s.lightColor);\r
      const power = s.lightIntensity * 60 * (1 + light.flash * 3);\r
      gl.uniform3f(u.uLight, lc[0] * power, lc[1] * power, lc[2] * power);\r
      gl.uniform3f(u.uLightPos, light.x, light.y, light.z - CAMERA_Z);\r
      gl.uniform1f(u.uExposure, s.exposure);\r
      gl.uniform1f(u.uShadow, s.shadows);\r
      gl.uniform4f(u.uSurface, mat.roughness, mat.metalness, mat.coat, mat.coatRoughness);\r
      gl.uniform2f(u.uExtra, mat.scatter, mat.frost);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, count * STRIDE);\r
      gl.bindVertexArray(vao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      elapsed += dt;\r
      glide = Math.max(0, glide - dt);\r
      sync(s, false);\r
      const targetR = s.followCursor && pointer.inside && held.index < 0 ? s.cursorSize * view.fit : 0;\r
      cursor.r += (targetR - cursor.r) * (1 - Math.exp(-dt / 0.12));\r
      const follow = 1 - Math.exp(-dt / 0.06);\r
      const fromX = cursor.x;\r
      const fromY = cursor.y;\r
      cursor.x += (cursor.tx - cursor.x) * follow;\r
      cursor.y += (cursor.ty - cursor.y) * follow;\r
      cursor.vx = clamp((cursor.x - fromX) / Math.max(dt, 1e-3), -MAX_SPEED, MAX_SPEED);\r
      cursor.vy = clamp((cursor.y - fromY) / Math.max(dt, 1e-3), -MAX_SPEED, MAX_SPEED);\r
      const restX = 0;\r
      const restY = view.halfH * 0.75;\r
      const restZ = s.depth + 4;\r
      const lightTarget = pointer.inside\r
        ? [cursor.x, cursor.y, s.followCursor ? cursor.z : 1.5]\r
        : light.flash > 0.05\r
          ? [light.x, light.y, light.z]\r
          : [restX, restY, restZ];\r
      const lf = 1 - Math.exp(-dt / 0.08);\r
      light.x += (lightTarget[0] - light.x) * lf;\r
      light.y += (lightTarget[1] - light.y) * lf;\r
      light.z += (lightTarget[2] - light.z) * lf;\r
      light.flash *= Math.exp(-dt / 0.3);\r
      if (dt > 1e-4) {\r
        const steps = Math.min(6, Math.max(1, Math.ceil(dt / (1 / 180))));\r
        const h = dt / steps;\r
        for (let k = 0; k < steps; k++) step(s, h, k === steps - 1);\r
      }\r
      draw();\r
      let moved = 0;\r
      for (let i = 0; i < n; i++) {\r
        const k = i * 3;\r
        const d = Math.abs(px[i] - still[k]) + Math.abs(py[i] - still[k + 1]) + Math.abs(pz[i] - still[k + 2]);\r
        if (d > moved) moved = d;\r
        still[k] = px[i];\r
        still[k + 1] = py[i];\r
        still[k + 2] = pz[i];\r
      }\r
      const motion = moved / Math.max(dt, 1e-3);\r
      const busy =\r
        motion > 0.6 ||\r
        pointer.inside ||\r
        held.index >= 0 ||\r
        light.flash > 0.01 ||\r
        glide > 0 ||\r
        cursor.r > 0.01 ||\r
        (s.drift > 0 && !reduce);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.8) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const inside = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
    };\r
\r
    const aim = event => {\r
      const ray = rayTo(event.clientX, event.clientY);\r
      const [x, y] = onPlane(ray, cursor.z);\r
      cursor.tx = x;\r
      cursor.ty = y;\r
      if (held.index >= 0) {\r
        const [hx, hy] = onPlane(ray, pz[held.index]);\r
        held.tx = hx - held.ox;\r
        held.ty = hy - held.oy;\r
      }\r
      return ray;\r
    };\r
\r
    const onPointerMove = event => {\r
      const was = pointer.inside;\r
      pointer.inside = inside(event) || held.index >= 0;\r
      if (pointer.inside) {\r
        aim(event);\r
        if (!was) {\r
          cursor.x = cursor.tx;\r
          cursor.y = cursor.ty;\r
        }\r
        if (pointer.down && Math.hypot(event.clientX - pointer.downX, event.clientY - pointer.downY) > 6)\r
          pointer.moved = true;\r
      }\r
      if (pointer.inside || was) wake();\r
    };\r
\r
    const interactive = target =>\r
      target instanceof Element && target.closest('a, button, input, textarea, select, label, [role="button"]');\r
\r
    const onPointerDown = event => {\r
      if (event.button !== 0 || !inside(event) || interactive(event.target)) return;\r
      const s = settingsRef.current;\r
      pointer.down = true;\r
      pointer.moved = false;\r
      pointer.downX = event.clientX;\r
      pointer.downY = event.clientY;\r
      pointer.downAt = performance.now();\r
      const ray = aim(event);\r
      if (s.grab) {\r
        const i = pick(ray);\r
        if (i >= 0) {\r
          const [hx, hy] = onPlane(ray, pz[i]);\r
          held.index = i;\r
          held.ox = hx - px[i];\r
          held.oy = hy - py[i];\r
          held.tx = px[i];\r
          held.ty = py[i];\r
          held.vx = 0;\r
          held.vy = 0;\r
          if (event.pointerType === 'mouse') event.preventDefault();\r
        }\r
      }\r
      wake();\r
    };\r
\r
    const release = event => {\r
      const s = settingsRef.current;\r
      if (held.index >= 0) {\r
        const i = held.index;\r
        const sp = Math.hypot(held.vx, held.vy);\r
        const k = sp > 22 ? 22 / sp : 1;\r
        vx[i] = held.vx * k;\r
        vy[i] = held.vy * k;\r
        held.index = -1;\r
        entered[i] = 1;\r
      } else if (\r
        event &&\r
        pointer.down &&\r
        !pointer.moved &&\r
        performance.now() - pointer.downAt < 400 &&\r
        s.clickEffect === 'burst' &&\r
        !reduce &&\r
        inside(event)\r
      ) {\r
        const [x, y] = onPlane(rayTo(event.clientX, event.clientY), 0);\r
        burst(x, y);\r
      }\r
      pointer.down = false;\r
      wake();\r
    };\r
\r
    const onPointerUp = event => release(event);\r
    const onPointerCancel = () => release(null);\r
    const onPointerLeave = () => {\r
      pointer.inside = held.index >= 0;\r
      wake();\r
    };\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown);\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerCancel);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(quad);\r
      gl.deleteBuffer(instances);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      className={className}\r
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}\r
    >\r
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Ballpit;\r
`,r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const FOV = 50;\r
const CAMERA_Z = 20;\r
const MAX_ASPECT = 1.5;\r
const MAX_SPEED = 16;\r
const STRIDE = 12;\r
const SLOP = 0.01;\r
\r
const MATERIALS = {\r
  satin: { roughness: 0.42, metalness: 0, coat: 0.35, coatRoughness: 0.22, scatter: 1, frost: 0 },\r
  matte: { roughness: 0.92, metalness: 0, coat: 0, coatRoughness: 0.5, scatter: 0.5, frost: 0 },\r
  gloss: { roughness: 0.2, metalness: 0, coat: 1, coatRoughness: 0.08, scatter: 1, frost: 0 },\r
  frosted: { roughness: 0.55, metalness: 0, coat: 0.6, coatRoughness: 0.18, scatter: 1.5, frost: 1 },\r
  metal: { roughness: 0.3, metalness: 1, coat: 0, coatRoughness: 0.2, scatter: 0, frost: 0 }\r
};\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aSphere;\r
layout(location = 2) in vec4 aColor;\r
layout(location = 3) in vec4 aShade;\r
uniform mat4 uProj;\r
uniform float uCameraZ;\r
uniform float uPixel;\r
out vec3 vPoint;\r
flat out vec3 vCenter;\r
flat out float vRadius;\r
flat out vec4 vColor;\r
flat out vec4 vShade;\r
void main() {\r
  vec3 c = vec3(aSphere.xy, aSphere.z - uCameraZ);\r
  float r = aSphere.w;\r
  float d = length(c);\r
  vec3 toCamera = -c / d;\r
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), toCamera));\r
  vec3 up = cross(toCamera, right);\r
  float reach = r * d / sqrt(max(d * d - r * r, 1e-4)) + uPixel * d * 2.0;\r
  vec3 p = c + (right * aCorner.x + up * aCorner.y) * reach;\r
  vPoint = p;\r
  vCenter = c;\r
  vRadius = r;\r
  vColor = aColor;\r
  vShade = aShade;\r
  gl_Position = uProj * vec4(p, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec3 vPoint;\r
flat in vec3 vCenter;\r
flat in float vRadius;\r
flat in vec4 vColor;\r
flat in vec4 vShade;\r
uniform mat4 uProj;\r
uniform vec3 uLightPos;\r
uniform vec3 uLight;\r
uniform float uExposure;\r
uniform float uShadow;\r
uniform vec4 uSurface;\r
uniform vec2 uExtra;\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
\r
float lobe(vec3 d, vec3 axis, float sharp) {\r
  return pow(max(dot(d, axis), 0.0), sharp) * (sharp + 1.0) * 0.16;\r
}\r
\r
vec3 studio(vec3 d, float rough) {\r
  float r = clamp(rough, 0.0, 1.0);\r
  float sharp = mix(60.0, 1.2, sqrt(r));\r
  vec3 col = mix(vec3(0.085, 0.085, 0.09), vec3(0.38, 0.38, 0.39), smoothstep(-0.7, 0.9, d.y));\r
  col += vec3(1.0, 0.99, 0.97) * 2.6 * lobe(d, normalize(vec3(-0.42, 0.78, 0.47)), sharp);\r
  col += vec3(0.97, 0.98, 1.0) * 1.1 * lobe(d, normalize(vec3(0.78, 0.22, 0.58)), sharp * 0.7);\r
  col += vec3(1.0) * 1.3 * lobe(d, normalize(vec3(0.15, 0.55, -0.82)), sharp * 0.8);\r
  return col;\r
}\r
\r
vec2 envBRDF(float NoV, float rough) {\r
  vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);\r
  vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);\r
  vec4 r = rough * c0 + c1;\r
  float a = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;\r
  return vec2(-1.04, 1.04) * a + r.zw;\r
}\r
\r
float ggx(float NoH, float a) {\r
  float a2 = a * a;\r
  float d = NoH * NoH * (a2 - 1.0) + 1.0;\r
  return a2 / (PI * d * d);\r
}\r
\r
float smith(float NoV, float NoL, float a) {\r
  float k = a * 0.5;\r
  return 0.25 / max((NoV * (1.0 - k) + k) * (NoL * (1.0 - k) + k), 1e-4);\r
}\r
\r
vec3 aces(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec3 rd = normalize(vPoint);\r
  float b = dot(vCenter, rd);\r
  float h = length(vCenter - rd * b);\r
  float r = vRadius;\r
  float aa = max(fwidth(h), 1e-5);\r
  float cover = clamp((r - h) / aa + 0.5, 0.0, 1.0);\r
  if (cover <= 0.002) discard;\r
  float hc = min(h, r * 0.9995);\r
  float t = b - sqrt(r * r - hc * hc);\r
  vec3 pos = rd * t;\r
  vec3 n = normalize(pos - vCenter);\r
  vec4 clip = uProj * vec4(pos, 1.0);\r
  gl_FragDepth = clamp(clip.z / clip.w * 0.5 + 0.5, 0.0, 1.0);\r
\r
  vec3 v = -rd;\r
  vec3 albedo = vColor.rgb;\r
  bool lamp = vColor.a > 0.5;\r
  vec3 dn = fwidth(n);\r
  float rough = sqrt(min(uSurface.x * uSurface.x + dot(dn, dn) * 0.6, 1.0));\r
  float metal = uSurface.y;\r
  float coat = uSurface.z;\r
  float coatRough = sqrt(min(uSurface.w * uSurface.w + dot(dn, dn) * 0.6, 1.0));\r
  float NoV = clamp(dot(n, v), 1e-4, 1.0);\r
  vec3 R = reflect(-v, n);\r
\r
  float occlusion = vShade.w * smoothstep(-0.15, 0.9, dot(n, vShade.xyz));\r
  float ao = 1.0 - uShadow * occlusion;\r
  float specAo = 1.0 - uShadow * occlusion * 0.7;\r
\r
  vec3 L = uLightPos - pos;\r
  float dist2 = dot(L, L);\r
  L *= inversesqrt(dist2);\r
  vec3 radiance = lamp ? vec3(0.0) : uLight / (dist2 + 1.0);\r
  float NoL = clamp(dot(n, L), 0.0, 1.0);\r
  vec3 H = normalize(L + v);\r
  float NoH = clamp(dot(n, H), 0.0, 1.0);\r
  float VoH = clamp(dot(v, H), 0.0, 1.0);\r
\r
  vec3 F0 = mix(vec3(0.04), albedo, metal);\r
  vec2 ab = envBRDF(NoV, rough);\r
  vec3 Fr = max(vec3(1.0 - rough), F0) - F0;\r
  vec3 kS = F0 + Fr * pow(1.0 - NoV, 5.0);\r
  vec3 diffuseColor = albedo * (1.0 - metal);\r
  vec3 irradiance = studio(n, 1.0) * 1.15;\r
  vec3 envSpec = studio(R, rough) * (F0 * ab.x + ab.y);\r
  vec3 col = diffuseColor * irradiance * (1.0 - kS) * ao + envSpec * specAo;\r
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - VoH, 5.0);\r
  float a = max(rough * rough, 0.06);\r
  vec3 spec = ggx(NoH, a) * smith(NoV, NoL, a) * F;\r
  float wrap = clamp((dot(n, L) + 0.3) / 1.3, 0.0, 1.0);\r
  col += (diffuseColor * (1.0 - F) / PI * wrap + spec * NoL) * radiance;\r
  vec3 sh = normalize(L + n * 0.1);\r
  float scatter = pow(clamp(dot(v, -sh), 0.0, 1.0), 2.0) * 10.0 + 0.04;\r
  col += scatter * albedo * radiance * 0.03 * uExtra.x;\r
  float alpha = 1.0;\r
  if (uExtra.y > 0.5) {\r
    float rim = pow(1.0 - NoV, 2.5);\r
    col += albedo * (studio(-R, 1.0) * 0.35 + 0.06) * (1.0 - rim);\r
    col += radiance * albedo * pow(max(dot(-v, L), 0.0), 3.0) * 0.08;\r
    alpha = mix(0.5, 0.96, rim);\r
  }\r
  if (coat > 0.0) {\r
    float Fc = 0.04 + 0.96 * pow(1.0 - NoV, 5.0);\r
    float ca = max(coatRough * coatRough, 0.03);\r
    vec3 coatEnv = studio(R, coatRough) * Fc;\r
    float coatSpec = ggx(NoH, ca) * smith(NoV, NoL, ca) * (0.04 + 0.96 * pow(1.0 - VoH, 5.0)) * NoL;\r
    col = col * (1.0 - Fc * coat) + (coatEnv * specAo + radiance * coatSpec) * coat;\r
    alpha = mix(alpha, 1.0, Fc * coat);\r
  }\r
  if (lamp) col += uLight * 0.0025 * (0.4 + 0.6 * albedo);\r
  col = aces(col * uExposure);\r
  col = pow(col, vec3(1.0 / 2.2));\r
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;\r
  float a2 = alpha * cover;\r
  outColor = vec4(col * a2, a2);\r
}\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
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
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toLinear = value => {\r
  let rgb;\r
  if (typeof value === 'number') {\r
    rgb = [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];\r
  } else {\r
    let hex = String(value || '#ffffff')\r
      .replace('#', '')\r
      .trim();\r
    if (hex.length === 3 || hex.length === 4)\r
      hex = hex\r
        .slice(0, 3)\r
        .split('')\r
        .map(c => c + c)\r
        .join('');\r
    const num = parseInt(hex.slice(0, 6), 16);\r
    rgb = Number.isNaN(num) ? [1, 1, 1] : [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
  }\r
  return rgb.map(c => Math.pow(c, 2.2));\r
};\r
\r
const Ballpit = ({\r
  count = 200,\r
  colors = ['#ffffff'],\r
  material = 'satin',\r
  minSize = 0.5,\r
  maxSize = 1,\r
  gravity = 0.5,\r
  friction = 0.9975,\r
  wallBounce = 0.95,\r
  bounce = 0.85,\r
  depth = 2,\r
  drift = 0,\r
  followCursor = true,\r
  cursorSize = 1,\r
  grab = true,\r
  clickEffect = 'burst',\r
  lightColor = '#ffffff',\r
  lightIntensity = 1,\r
  exposure = 1,\r
  shadows = 0.6,\r
  intro = true,\r
  dpr,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    count: Math.round(clamp(count, 1, 4000)),\r
    colors: Array.isArray(colors) && colors.length ? colors : ['#ffffff'],\r
    material: MATERIALS[material] ? material : 'satin',\r
    minSize: Math.max(0.05, Math.min(minSize, maxSize)),\r
    maxSize: Math.max(0.05, Math.max(minSize, maxSize)),\r
    gravity,\r
    friction: clamp(friction, 0.5, 1),\r
    wallBounce: clamp(wallBounce, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    depth: Math.max(0, depth),\r
    drift: Math.max(0, drift),\r
    followCursor,\r
    cursorSize: Math.max(0, cursorSize),\r
    grab,\r
    clickEffect,\r
    lightColor,\r
    lightIntensity: lightIntensity > 20 ? lightIntensity / 200 : Math.max(0, lightIntensity),\r
    exposure: Math.max(0, exposure),\r
    shadows: clamp(shadows, 0, 1),\r
    intro,\r
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
      depth: true,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, halfW: 9, halfH: 9, fit: 1, tan: Math.tan((FOV * Math.PI) / 360) };\r
    const projection = new Float32Array(16);\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const quad = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const instances = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
    for (let k = 0; k < 3; k++) {\r
      gl.enableVertexAttribArray(1 + k);\r
      gl.vertexAttribPointer(1 + k, 4, gl.FLOAT, false, STRIDE * 4, k * 16);\r
      gl.vertexAttribDivisor(1 + k, 1);\r
    }\r
    gl.bindVertexArray(null);\r
\r
    let capacity = 0;\r
    let n = 0;\r
    let px = new Float32Array(0);\r
    let py = new Float32Array(0);\r
    let pz = new Float32Array(0);\r
    let vx = new Float32Array(0);\r
    let vy = new Float32Array(0);\r
    let vz = new Float32Array(0);\r
    let rad = new Float32Array(0);\r
    let inv = new Float32Array(0);\r
    let size = new Float32Array(0);\r
    let phase = new Float32Array(0);\r
    let occ = new Float32Array(0);\r
    let still = new Float32Array(0);\r
    let tone = new Uint16Array(0);\r
    let entered = new Uint8Array(0);\r
    let cellOf = new Int32Array(0);\r
    let sorted = new Int32Array(0);\r
    let order = new Int32Array(1);\r
    let data = new Float32Array(STRIDE);\r
    let table = new Int32Array(2);\r
    let starts = new Int32Array(2);\r
    let palette = [];\r
    let paletteKey = '';\r
    let lastSizes = '';\r
\r
    const allocate = total => {\r
      const grow = (old, width = 1) => {\r
        const next = new Float32Array(total * width);\r
        next.set(old.subarray(0, Math.min(old.length, next.length)));\r
        return next;\r
      };\r
      const growUint8 = old => {\r
        const next = new Uint8Array(total);\r
        next.set(old.subarray(0, Math.min(old.length, next.length)));\r
        return next;\r
      };\r
      px = grow(px);\r
      py = grow(py);\r
      pz = grow(pz);\r
      vx = grow(vx);\r
      vy = grow(vy);\r
      vz = grow(vz);\r
      rad = grow(rad);\r
      inv = grow(inv);\r
      size = grow(size);\r
      phase = grow(phase);\r
      occ = grow(occ, 4);\r
      still = grow(still, 3);\r
      const nextTone = new Uint16Array(total);\r
      nextTone.set(tone.subarray(0, Math.min(tone.length, total)));\r
      tone = nextTone;\r
      entered = growUint8(entered);\r
      cellOf = new Int32Array(total);\r
      sorted = new Int32Array(total);\r
      order = new Int32Array(total + 1);\r
      data = new Float32Array((total + 1) * STRIDE);\r
      capacity = total;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
      gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const pointer = { x: 0, y: 0, inside: false, down: false, downX: 0, downY: 0, downAt: 0, moved: false };\r
    const cursor = { x: 0, y: 0, z: 0, r: 0, tx: 0, ty: 0, vx: 0, vy: 0 };\r
    const light = { x: 0, y: 5, z: 6, flash: 0 };\r
    const held = { index: -1, ox: 0, oy: 0, tx: 0, ty: 0, vx: 0, vy: 0 };\r
    let elapsed = 0;\r
    let glide = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const spawn = (i, s, fromTop) => {\r
      const r = rad[i];\r
      const zr = Math.max(s.depth - r, 0);\r
      entered[i] = 1;\r
      if (fromTop && s.gravity > 0.05) {\r
        px[i] = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        py[i] = view.halfH + r + Math.random() * view.halfH * 2.2;\r
        pz[i] = (Math.random() * 2 - 1) * zr;\r
        vx[i] = (Math.random() - 0.5) * 2;\r
        vy[i] = -(4 + Math.random() * 5);\r
        vz[i] = 0;\r
        entered[i] = 0;\r
      } else if (fromTop) {\r
        const tx = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        const ty = (Math.random() * 2 - 1) * Math.max(view.halfH - r, 0.01);\r
        const tz = (Math.random() * 2 - 1) * zr;\r
        px[i] = (Math.random() * 2 - 1) * 0.6;\r
        py[i] = (Math.random() * 2 - 1) * 0.6;\r
        pz[i] = (Math.random() * 2 - 1) * Math.min(zr, 0.3);\r
        vx[i] = (tx - px[i]) * 2.2;\r
        vy[i] = (ty - py[i]) * 2.2;\r
        vz[i] = (tz - pz[i]) * 2.2;\r
        glide = 1;\r
      } else {\r
        px[i] = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        py[i] = (Math.random() * 2 - 1) * Math.max(view.halfH - r, 0.01);\r
        pz[i] = (Math.random() * 2 - 1) * zr;\r
        vx[i] = 0;\r
        vy[i] = 0;\r
        vz[i] = 0;\r
      }\r
    };\r
\r
    const applySizes = s => {\r
      for (let i = 0; i < n; i++) {\r
        rad[i] = (s.minSize + size[i] * (s.maxSize - s.minSize)) * view.fit;\r
        inv[i] = 1 / (rad[i] * rad[i] * rad[i]);\r
      }\r
    };\r
\r
    const applyPalette = s => {\r
      palette = s.colors.map(toLinear);\r
      paletteKey = s.colors.join('|');\r
    };\r
\r
    const sync = (s, first) => {\r
      const key = \`\${s.minSize}:\${s.maxSize}:\${view.fit}\`;\r
      if (s.count !== n) {\r
        if (s.count > capacity) allocate(Math.max(s.count, Math.ceil(capacity * 1.5)));\r
        const from = n;\r
        n = s.count;\r
        for (let i = from; i < n; i++) {\r
          size[i] = Math.random();\r
          tone[i] = i;\r
          phase[i] = Math.random() * Math.PI * 2;\r
          rad[i] = (s.minSize + size[i] * (s.maxSize - s.minSize)) * view.fit;\r
          inv[i] = 1 / (rad[i] * rad[i] * rad[i]);\r
          spawn(i, s, (first ? s.intro : true) && !reduce);\r
        }\r
        for (let i = 0; i <= n; i++) order[i] = i;\r
      }\r
      if (key !== lastSizes) {\r
        lastSizes = key;\r
        applySizes(s);\r
      }\r
      if (s.colors.join('|') !== paletteKey) applyPalette(s);\r
    };\r
\r
    let contacts = new Float32Array(0);\r
    let contactCount = 0;\r
\r
    const grid = { scale: 1, x0: 0, y0: 0, z0: 0, nx: 1, ny: 1, nz: 1 };\r
\r
    const buildGrid = (cell, s) => {\r
      grid.scale = 1 / cell;\r
      grid.x0 = -view.halfW - cell;\r
      grid.y0 = -view.halfH - cell;\r
      grid.z0 = -Math.max(s.depth, s.maxSize) - cell;\r
      grid.nx = Math.max(1, Math.ceil((view.halfW * 2 + cell * 2) * grid.scale) + 1);\r
      grid.ny = Math.max(1, Math.ceil((view.halfH * 2 + cell * 2) * grid.scale) + 1);\r
      grid.nz = Math.max(1, Math.ceil((Math.max(s.depth, s.maxSize) * 2 + cell * 2) * grid.scale) + 1);\r
      const cells = grid.nx * grid.ny * grid.nz;\r
      if (table.length < cells + 1) {\r
        table = new Int32Array(cells + 1);\r
        starts = new Int32Array(cells + 1);\r
      }\r
      table.fill(0, 0, cells + 1);\r
      for (let i = 0; i < n; i++) {\r
        const cx = clamp(Math.floor((px[i] - grid.x0) * grid.scale), 0, grid.nx - 1);\r
        const cy = clamp(Math.floor((py[i] - grid.y0) * grid.scale), 0, grid.ny - 1);\r
        const cz = clamp(Math.floor((pz[i] - grid.z0) * grid.scale), 0, grid.nz - 1);\r
        const c = (cz * grid.ny + cy) * grid.nx + cx;\r
        cellOf[i] = c;\r
        table[c + 1]++;\r
      }\r
      for (let c = 1; c <= cells; c++) table[c] += table[c - 1];\r
      starts.set(table.subarray(0, cells + 1));\r
      for (let i = 0; i < n; i++) sorted[starts[cellOf[i]]++] = i;\r
    };\r
\r
    const wall = (i, gap, nx, ny, nz, bounce, margin) => {\r
      if (gap >= margin || contactCount * 8 >= contacts.length) return;\r
      const approach = vx[i] * nx + vy[i] * ny + vz[i] * nz;\r
      const o = contactCount * 8;\r
      contacts[o] = i;\r
      contacts[o + 1] = -2;\r
      contacts[o + 2] = nx;\r
      contacts[o + 3] = ny;\r
      contacts[o + 4] = nz;\r
      contacts[o + 5] = gap;\r
      contacts[o + 6] = approach < -1.5 ? -bounce * approach : 0;\r
      contacts[o + 7] = 0;\r
      contactCount++;\r
    };\r
\r
    const findContacts = (s, dt, shade, margin) => {\r
      const heldIndex = held.index;\r
      const { nx: gx, ny: gy, nz: gz } = grid;\r
      contactCount = 0;\r
      for (let i = 0; i < n; i++) {\r
        const c = cellOf[i];\r
        const cx = c % gx;\r
        const cy = Math.floor(c / gx) % gy;\r
        const cz = Math.floor(c / (gx * gy));\r
        for (let dz = cz > 0 ? -1 : 0; dz <= (cz < gz - 1 ? 1 : 0); dz++) {\r
          for (let dy = cy > 0 ? -1 : 0; dy <= (cy < gy - 1 ? 1 : 0); dy++) {\r
            const row = ((cz + dz) * gy + cy + dy) * gx;\r
            for (let dx = cx > 0 ? -1 : 0; dx <= (cx < gx - 1 ? 1 : 0); dx++) {\r
              const cell = row + cx + dx;\r
              for (let k = table[cell]; k < table[cell + 1]; k++) {\r
                const j = sorted[k];\r
                if (j <= i) continue;\r
                const ddx = px[j] - px[i];\r
                const ddy = py[j] - py[i];\r
                const ddz = pz[j] - pz[i];\r
                const d2 = ddx * ddx + ddy * ddy + ddz * ddz;\r
                const sum = rad[i] + rad[j];\r
                const reach = Math.max(sum + margin, shade ? sum * 1.4 : 0);\r
                if (d2 >= reach * reach || d2 < 1e-12) continue;\r
                const d = Math.sqrt(d2);\r
                const nx = ddx / d;\r
                const ny = ddy / d;\r
                const nz = ddz / d;\r
                if (shade) {\r
                  const w = clamp(1 - (d - sum) / (sum * 0.4), 0, 1);\r
                  occ[i * 4] += nx * w;\r
                  occ[i * 4 + 1] += ny * w;\r
                  occ[i * 4 + 2] += nz * w;\r
                  occ[i * 4 + 3] += w;\r
                  occ[j * 4] -= nx * w;\r
                  occ[j * 4 + 1] -= ny * w;\r
                  occ[j * 4 + 2] -= nz * w;\r
                  occ[j * 4 + 3] += w;\r
                }\r
                if (d >= sum + margin || contactCount * 8 >= contacts.length) continue;\r
                if (i === heldIndex && j === heldIndex) continue;\r
                const approach = (vx[j] - vx[i]) * nx + (vy[j] - vy[i]) * ny + (vz[j] - vz[i]) * nz;\r
                const o = contactCount * 8;\r
                contacts[o] = i;\r
                contacts[o + 1] = j;\r
                contacts[o + 2] = nx;\r
                contacts[o + 3] = ny;\r
                contacts[o + 4] = nz;\r
                contacts[o + 5] = d - sum;\r
                contacts[o + 6] = approach < -1.5 ? -s.bounce * approach : 0;\r
                contacts[o + 7] = 0;\r
                contactCount++;\r
              }\r
            }\r
          }\r
        }\r
        if (i !== heldIndex) {\r
          const r = rad[i];\r
          const zr = Math.max(s.depth - r, 0);\r
          wall(i, px[i] + view.halfW - r, 1, 0, 0, s.wallBounce, margin);\r
          wall(i, view.halfW - r - px[i], -1, 0, 0, s.wallBounce, margin);\r
          wall(i, py[i] + view.halfH - r, 0, 1, 0, s.wallBounce, margin);\r
          if (entered[i]) wall(i, view.halfH - r - py[i], 0, -1, 0, s.wallBounce, margin);\r
          wall(i, pz[i] + zr, 0, 0, 1, s.wallBounce, margin);\r
          wall(i, zr - pz[i], 0, 0, -1, s.wallBounce, margin);\r
        }\r
        if (cursor.r > 0.01 && i !== heldIndex && contactCount * 8 < contacts.length) {\r
          const ddx = px[i] - cursor.x;\r
          const ddy = py[i] - cursor.y;\r
          const ddz = pz[i] - cursor.z;\r
          const sum = rad[i] + cursor.r;\r
          const d2 = ddx * ddx + ddy * ddy + ddz * ddz;\r
          if (d2 < (sum + margin) * (sum + margin) && d2 > 1e-12) {\r
            const d = Math.sqrt(d2);\r
            const nx = ddx / d;\r
            const ny = ddy / d;\r
            const nz = ddz / d;\r
            const approach = (vx[i] - cursor.vx) * nx + (vy[i] - cursor.vy) * ny + vz[i] * nz;\r
            const o = contactCount * 8;\r
            contacts[o] = i;\r
            contacts[o + 1] = -1;\r
            contacts[o + 2] = nx;\r
            contacts[o + 3] = ny;\r
            contacts[o + 4] = nz;\r
            contacts[o + 5] = d - sum;\r
            contacts[o + 6] = approach < -1.5 ? -s.bounce * approach : 0;\r
            contacts[o + 7] = 0;\r
            contactCount++;\r
          }\r
        }\r
      }\r
    };\r
\r
    const solveVelocities = dt => {\r
      const heldIndex = held.index;\r
      const iterations = n > 800 ? 5 : 8;\r
      for (let iteration = 0; iteration < iterations; iteration++) {\r
        for (let c = 0; c < contactCount; c++) {\r
          const o = c * 8;\r
          const i = contacts[o];\r
          const j = contacts[o + 1];\r
          const nx = contacts[o + 2];\r
          const ny = contacts[o + 3];\r
          const nz = contacts[o + 4];\r
          const gap = contacts[o + 5];\r
          const target = gap > 0 ? -gap / dt : contacts[o + 6];\r
          const before = contacts[o + 7];\r
          if (j < 0) {\r
            const vn =\r
              j === -1\r
                ? (vx[i] - cursor.vx) * nx + (vy[i] - cursor.vy) * ny + vz[i] * nz\r
                : vx[i] * nx + vy[i] * ny + vz[i] * nz;\r
            const after = Math.max(before + target - vn, 0);\r
            const change = after - before;\r
            contacts[o + 7] = after;\r
            vx[i] += change * nx;\r
            vy[i] += change * ny;\r
            vz[i] += change * nz;\r
            continue;\r
          }\r
          const wi = i === heldIndex ? 0 : inv[i];\r
          const wj = j === heldIndex ? 0 : inv[j];\r
          const w = wi + wj;\r
          if (w <= 0) continue;\r
          const vn = (vx[j] - vx[i]) * nx + (vy[j] - vy[i]) * ny + (vz[j] - vz[i]) * nz;\r
          const after = Math.max(before + (target - vn) / w, 0);\r
          const change = after - before;\r
          contacts[o + 7] = after;\r
          vx[i] -= change * wi * nx;\r
          vy[i] -= change * wi * ny;\r
          vz[i] -= change * wi * nz;\r
          vx[j] += change * wj * nx;\r
          vy[j] += change * wj * ny;\r
          vz[j] += change * wj * nz;\r
        }\r
      }\r
    };\r
\r
    const correctPositions = () => {\r
      const heldIndex = held.index;\r
      for (let pass = 0; pass < 2; pass++) {\r
        for (let c = 0; c < contactCount; c++) {\r
          const o = c * 8;\r
          const i = contacts[o];\r
          const j = contacts[o + 1];\r
          if (j === -2) continue;\r
          if (j < 0) {\r
            const ddx = px[i] - cursor.x;\r
            const ddy = py[i] - cursor.y;\r
            const ddz = pz[i] - cursor.z;\r
            const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);\r
            const overlap = rad[i] + cursor.r - d - SLOP;\r
            if (overlap <= 0 || d < 1e-6) continue;\r
            const k = (overlap * 0.5) / d;\r
            px[i] += ddx * k;\r
            py[i] += ddy * k;\r
            pz[i] += ddz * k;\r
            continue;\r
          }\r
          const ddx = px[j] - px[i];\r
          const ddy = py[j] - py[i];\r
          const ddz = pz[j] - pz[i];\r
          const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);\r
          const overlap = rad[i] + rad[j] - d - SLOP;\r
          if (overlap <= 0 || d < 1e-6) continue;\r
          const wi = i === heldIndex ? 0 : inv[i];\r
          const wj = j === heldIndex ? 0 : inv[j];\r
          const w = wi + wj;\r
          if (w <= 0) continue;\r
          const k = (overlap * 0.3) / (d * w);\r
          px[i] -= ddx * k * wi;\r
          py[i] -= ddy * k * wi;\r
          pz[i] -= ddz * k * wi;\r
          px[j] += ddx * k * wj;\r
          py[j] += ddy * k * wj;\r
          pz[j] += ddz * k * wj;\r
        }\r
      }\r
    };\r
\r
    const walls = s => {\r
      const hw = view.halfW;\r
      const hh = view.halfH;\r
      const e = s.wallBounce;\r
      for (let i = 0; i < n; i++) {\r
        const r = rad[i];\r
        if (px[i] < -hw + r) {\r
          px[i] = -hw + r;\r
          if (vx[i] < 0) vx[i] = vx[i] < -1.5 ? -vx[i] * e : 0;\r
        } else if (px[i] > hw - r) {\r
          px[i] = hw - r;\r
          if (vx[i] > 0) vx[i] = vx[i] > 1.5 ? -vx[i] * e : 0;\r
        }\r
        if (py[i] < -hh + r) {\r
          py[i] = -hh + r;\r
          if (vy[i] < 0) vy[i] = vy[i] < -1.5 ? -vy[i] * e : 0;\r
          vx[i] *= 0.995;\r
          vz[i] *= 0.995;\r
        } else if (entered[i] && py[i] > hh - r) {\r
          py[i] = hh - r;\r
          if (vy[i] > 0) vy[i] = vy[i] > 1.5 ? -vy[i] * e : 0;\r
        }\r
        if (!entered[i] && py[i] < hh - r) entered[i] = 1;\r
        const zr = Math.max(s.depth - r, 0);\r
        if (pz[i] < -zr) {\r
          pz[i] = -zr;\r
          if (vz[i] < 0) vz[i] = vz[i] < -1.5 ? -vz[i] * e : 0;\r
        } else if (pz[i] > zr) {\r
          pz[i] = zr;\r
          if (vz[i] > 0) vz[i] = vz[i] > 1.5 ? -vz[i] * e : 0;\r
        }\r
      }\r
    };\r
\r
    const step = (s, dt, shade) => {\r
      const g = s.gravity * 45;\r
      const damp = Math.pow(s.friction, dt * 60) * (glide > 0 ? Math.exp(-2.2 * dt) : 1);\r
      const wander = reduce ? 0 : s.drift * 2.2;\r
      const biggest = s.maxSize * view.fit;\r
      const margin = biggest * 0.3;\r
      if (contacts.length < n * 96) contacts = new Float32Array(n * 96);\r
      for (let i = 0; i < n; i++) {\r
        if (i === held.index) {\r
          const f = 1 - Math.exp(-dt / 0.02);\r
          vx[i] = ((held.tx - px[i]) * f) / dt;\r
          vy[i] = ((held.ty - py[i]) * f) / dt;\r
          vz[i] = 0;\r
          continue;\r
        }\r
        vy[i] -= g * dt;\r
        if (wander) {\r
          const p = phase[i];\r
          vx[i] += Math.sin(elapsed * 0.63 + p) * wander * dt;\r
          vy[i] += Math.cos(elapsed * 0.47 + p * 1.7) * wander * dt;\r
          vz[i] += Math.sin(elapsed * 0.41 + p * 2.3) * wander * dt * 0.5;\r
        }\r
        vx[i] *= damp;\r
        vy[i] *= damp;\r
        vz[i] *= damp;\r
        const sp = vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i];\r
        if (sp > MAX_SPEED * MAX_SPEED) {\r
          const f = MAX_SPEED / Math.sqrt(sp);\r
          vx[i] *= f;\r
          vy[i] *= f;\r
          vz[i] *= f;\r
        }\r
      }\r
      buildGrid(biggest * (shade ? 2.8 : 2.3), s);\r
      if (shade) occ.fill(0, 0, n * 4);\r
      findContacts(s, dt, shade, margin);\r
      solveVelocities(dt);\r
      for (let i = 0; i < n; i++) {\r
        px[i] += vx[i] * dt;\r
        py[i] += vy[i] * dt;\r
        pz[i] += vz[i] * dt;\r
      }\r
      correctPositions();\r
      walls(s);\r
      if (shade) {\r
        for (let i = 0; i < n; i++) {\r
          const gap = py[i] - rad[i] + view.halfH;\r
          const reach = rad[i] * 0.5;\r
          if (gap >= reach) continue;\r
          const w = 1 - Math.max(gap, 0) / reach;\r
          occ[i * 4 + 1] -= w;\r
          occ[i * 4 + 3] += w;\r
        }\r
      }\r
      if (held.index >= 0) {\r
        const i = held.index;\r
        held.vx += (vx[i] - held.vx) * (1 - Math.exp(-dt / 0.05));\r
        held.vy += (vy[i] - held.vy) * (1 - Math.exp(-dt / 0.05));\r
      }\r
    };\r
\r
    const rayTo = (clientX, clientY) => {\r
      const rect = container.getBoundingClientRect();\r
      const nx = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;\r
      const ny = 1 - ((clientY - rect.top) / Math.max(rect.height, 1)) * 2;\r
      return [nx * view.tan * (view.width / view.height), ny * view.tan, -1];\r
    };\r
\r
    const onPlane = (ray, z) => {\r
      const t = (z - CAMERA_Z) / ray[2];\r
      return [ray[0] * t, ray[1] * t];\r
    };\r
\r
    const pick = ray => {\r
      const len = Math.hypot(ray[0], ray[1], ray[2]);\r
      const dx = ray[0] / len;\r
      const dy = ray[1] / len;\r
      const dz = ray[2] / len;\r
      let best = -1;\r
      let bestT = Infinity;\r
      for (let i = 0; i < n; i++) {\r
        const ox = -px[i];\r
        const oy = -py[i];\r
        const oz = CAMERA_Z - pz[i];\r
        const b = ox * dx + oy * dy + oz * dz;\r
        const r = rad[i] * 1.15;\r
        const c = ox * ox + oy * oy + oz * oz - r * r;\r
        const disc = b * b - c;\r
        if (disc < 0) continue;\r
        const t = -b - Math.sqrt(disc);\r
        if (t > 0 && t < bestT) {\r
          bestT = t;\r
          best = i;\r
        }\r
      }\r
      return best;\r
    };\r
\r
    const burst = (x, y) => {\r
      const s = settingsRef.current;\r
      const reach = view.halfH * 0.7;\r
      for (let i = 0; i < n; i++) {\r
        const dx = px[i] - x;\r
        const dy = py[i] - y;\r
        const dz = pz[i];\r
        const d = Math.hypot(dx, dy, dz);\r
        if (d >= reach || d < 1e-4) continue;\r
        const f = Math.pow(1 - d / reach, 2) * 26 * (1 + 0.6 / (rad[i] + 0.4));\r
        vx[i] += (dx / d) * f;\r
        vy[i] += (dy / d) * f + f * 0.25;\r
        vz[i] += (dz / d) * f * 0.5;\r
      }\r
      light.x = x;\r
      light.y = y;\r
      light.z = Math.max(s.depth, 1) + 1.5;\r
      light.flash = 1;\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const aspect = view.width / view.height;\r
      const base = Math.tan((FOV * Math.PI) / 360);\r
      view.tan = aspect > MAX_ASPECT ? (base * MAX_ASPECT) / aspect : base;\r
      view.halfH = view.tan * CAMERA_Z;\r
      view.halfW = view.halfH * aspect;\r
      view.fit = clamp(Math.sqrt((view.halfW * view.halfH) / (base * base * CAMERA_Z * CAMERA_Z * MAX_ASPECT)), 0.4, 1);\r
      const f = 1 / view.tan;\r
      const near = 1;\r
      const far = 80;\r
      projection.fill(0);\r
      projection[0] = f / aspect;\r
      projection[5] = f;\r
      projection[10] = (far + near) / (near - far);\r
      projection[11] = -1;\r
      projection[14] = (2 * far * near) / (near - far);\r
      if (!n) sync(s, true);\r
      draw();\r
      wake();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const mat = MATERIALS[s.material];\r
      let count = 0;\r
      const total = n + 1;\r
      for (let a = 1; a < total; a++) {\r
        const item = order[a];\r
        const z = item === n ? cursor.z : pz[item];\r
        let b = a - 1;\r
        while (b >= 0 && (order[b] === n ? cursor.z : pz[order[b]]) > z) {\r
          order[b + 1] = order[b];\r
          b--;\r
        }\r
        order[b + 1] = item;\r
      }\r
      for (let k = 0; k < total; k++) {\r
        const i = order[k];\r
        const o = count * STRIDE;\r
        if (i === n) {\r
          if (cursor.r < 0.01 || !s.followCursor) continue;\r
          const c = palette[0] || [1, 1, 1];\r
          data[o] = cursor.x;\r
          data[o + 1] = cursor.y;\r
          data[o + 2] = cursor.z;\r
          data[o + 3] = cursor.r;\r
          data[o + 4] = c[0];\r
          data[o + 5] = c[1];\r
          data[o + 6] = c[2];\r
          data[o + 7] = 1;\r
          data[o + 8] = 0;\r
          data[o + 9] = 0;\r
          data[o + 10] = 0;\r
          data[o + 11] = 0;\r
        } else {\r
          const c = palette[tone[i] % palette.length];\r
          data[o] = px[i];\r
          data[o + 1] = py[i];\r
          data[o + 2] = pz[i];\r
          data[o + 3] = rad[i];\r
          data[o + 4] = c[0];\r
          data[o + 5] = c[1];\r
          data[o + 6] = c[2];\r
          data[o + 7] = 0;\r
          const w = occ[i * 4 + 3];\r
          const len = Math.hypot(occ[i * 4], occ[i * 4 + 1], occ[i * 4 + 2]) || 1;\r
          data[o + 8] = occ[i * 4] / len;\r
          data[o + 9] = occ[i * 4 + 1] / len;\r
          data[o + 10] = occ[i * 4 + 2] / len;\r
          data[o + 11] = Math.min(w * 0.55, 1);\r
        }\r
        count++;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!count) return;\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.depthFunc(gl.LEQUAL);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.uniformMatrix4fv(u.uProj, false, projection);\r
      gl.uniform1f(u.uCameraZ, CAMERA_Z);\r
      gl.uniform1f(u.uPixel, (2 * view.tan) / canvas.height);\r
      const lc = toLinear(s.lightColor);\r
      const power = s.lightIntensity * 60 * (1 + light.flash * 3);\r
      gl.uniform3f(u.uLight, lc[0] * power, lc[1] * power, lc[2] * power);\r
      gl.uniform3f(u.uLightPos, light.x, light.y, light.z - CAMERA_Z);\r
      gl.uniform1f(u.uExposure, s.exposure);\r
      gl.uniform1f(u.uShadow, s.shadows);\r
      gl.uniform4f(u.uSurface, mat.roughness, mat.metalness, mat.coat, mat.coatRoughness);\r
      gl.uniform2f(u.uExtra, mat.scatter, mat.frost);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, count * STRIDE);\r
      gl.bindVertexArray(vao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      elapsed += dt;\r
      glide = Math.max(0, glide - dt);\r
      sync(s, false);\r
      const targetR = s.followCursor && pointer.inside && held.index < 0 ? s.cursorSize * view.fit : 0;\r
      cursor.r += (targetR - cursor.r) * (1 - Math.exp(-dt / 0.12));\r
      const follow = 1 - Math.exp(-dt / 0.06);\r
      const fromX = cursor.x;\r
      const fromY = cursor.y;\r
      cursor.x += (cursor.tx - cursor.x) * follow;\r
      cursor.y += (cursor.ty - cursor.y) * follow;\r
      cursor.vx = clamp((cursor.x - fromX) / Math.max(dt, 1e-3), -MAX_SPEED, MAX_SPEED);\r
      cursor.vy = clamp((cursor.y - fromY) / Math.max(dt, 1e-3), -MAX_SPEED, MAX_SPEED);\r
      const restX = 0;\r
      const restY = view.halfH * 0.75;\r
      const restZ = s.depth + 4;\r
      const lightTarget = pointer.inside\r
        ? [cursor.x, cursor.y, s.followCursor ? cursor.z : 1.5]\r
        : light.flash > 0.05\r
          ? [light.x, light.y, light.z]\r
          : [restX, restY, restZ];\r
      const lf = 1 - Math.exp(-dt / 0.08);\r
      light.x += (lightTarget[0] - light.x) * lf;\r
      light.y += (lightTarget[1] - light.y) * lf;\r
      light.z += (lightTarget[2] - light.z) * lf;\r
      light.flash *= Math.exp(-dt / 0.3);\r
      if (dt > 1e-4) {\r
        const steps = Math.min(6, Math.max(1, Math.ceil(dt / (1 / 180))));\r
        const h = dt / steps;\r
        for (let k = 0; k < steps; k++) step(s, h, k === steps - 1);\r
      }\r
      draw();\r
      let moved = 0;\r
      for (let i = 0; i < n; i++) {\r
        const k = i * 3;\r
        const d = Math.abs(px[i] - still[k]) + Math.abs(py[i] - still[k + 1]) + Math.abs(pz[i] - still[k + 2]);\r
        if (d > moved) moved = d;\r
        still[k] = px[i];\r
        still[k + 1] = py[i];\r
        still[k + 2] = pz[i];\r
      }\r
      const motion = moved / Math.max(dt, 1e-3);\r
      const busy =\r
        motion > 0.6 ||\r
        pointer.inside ||\r
        held.index >= 0 ||\r
        light.flash > 0.01 ||\r
        glide > 0 ||\r
        cursor.r > 0.01 ||\r
        (s.drift > 0 && !reduce);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.8) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const inside = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
    };\r
\r
    const aim = event => {\r
      const ray = rayTo(event.clientX, event.clientY);\r
      const [x, y] = onPlane(ray, cursor.z);\r
      cursor.tx = x;\r
      cursor.ty = y;\r
      if (held.index >= 0) {\r
        const [hx, hy] = onPlane(ray, pz[held.index]);\r
        held.tx = hx - held.ox;\r
        held.ty = hy - held.oy;\r
      }\r
      return ray;\r
    };\r
\r
    const onPointerMove = event => {\r
      const was = pointer.inside;\r
      pointer.inside = inside(event) || held.index >= 0;\r
      if (pointer.inside) {\r
        aim(event);\r
        if (!was) {\r
          cursor.x = cursor.tx;\r
          cursor.y = cursor.ty;\r
        }\r
        if (pointer.down && Math.hypot(event.clientX - pointer.downX, event.clientY - pointer.downY) > 6)\r
          pointer.moved = true;\r
      }\r
      if (pointer.inside || was) wake();\r
    };\r
\r
    const interactive = target =>\r
      target instanceof Element && target.closest('a, button, input, textarea, select, label, [role="button"]');\r
\r
    const onPointerDown = event => {\r
      if (event.button !== 0 || !inside(event) || interactive(event.target)) return;\r
      const s = settingsRef.current;\r
      pointer.down = true;\r
      pointer.moved = false;\r
      pointer.downX = event.clientX;\r
      pointer.downY = event.clientY;\r
      pointer.downAt = performance.now();\r
      const ray = aim(event);\r
      if (s.grab) {\r
        const i = pick(ray);\r
        if (i >= 0) {\r
          const [hx, hy] = onPlane(ray, pz[i]);\r
          held.index = i;\r
          held.ox = hx - px[i];\r
          held.oy = hy - py[i];\r
          held.tx = px[i];\r
          held.ty = py[i];\r
          held.vx = 0;\r
          held.vy = 0;\r
          if (event.pointerType === 'mouse') event.preventDefault();\r
        }\r
      }\r
      wake();\r
    };\r
\r
    const release = event => {\r
      const s = settingsRef.current;\r
      if (held.index >= 0) {\r
        const i = held.index;\r
        const sp = Math.hypot(held.vx, held.vy);\r
        const k = sp > 22 ? 22 / sp : 1;\r
        vx[i] = held.vx * k;\r
        vy[i] = held.vy * k;\r
        held.index = -1;\r
        entered[i] = 1;\r
      } else if (\r
        event &&\r
        pointer.down &&\r
        !pointer.moved &&\r
        performance.now() - pointer.downAt < 400 &&\r
        s.clickEffect === 'burst' &&\r
        !reduce &&\r
        inside(event)\r
      ) {\r
        const [x, y] = onPlane(rayTo(event.clientX, event.clientY), 0);\r
        burst(x, y);\r
      }\r
      pointer.down = false;\r
      wake();\r
    };\r
\r
    const onPointerUp = event => release(event);\r
    const onPointerCancel = () => release(null);\r
    const onPointerLeave = () => {\r
      pointer.inside = held.index >= 0;\r
      wake();\r
    };\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown);\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerCancel);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(quad);\r
      gl.deleteBuffer(instances);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      className={['relative w-full h-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Ballpit;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
const FOV = 50;\r
const CAMERA_Z = 20;\r
const MAX_ASPECT = 1.5;\r
const MAX_SPEED = 16;\r
const STRIDE = 12;\r
const SLOP = 0.01;\r
\r
export type BallpitMaterial = 'satin' | 'matte' | 'gloss' | 'frosted' | 'metal';\r
\r
export interface BallpitProps {\r
  count?: number;\r
  colors?: Array<string | number>;\r
  material?: BallpitMaterial;\r
  minSize?: number;\r
  maxSize?: number;\r
  gravity?: number;\r
  friction?: number;\r
  wallBounce?: number;\r
  bounce?: number;\r
  depth?: number;\r
  drift?: number;\r
  followCursor?: boolean;\r
  cursorSize?: number;\r
  grab?: boolean;\r
  clickEffect?: 'burst' | 'none';\r
  lightColor?: string;\r
  lightIntensity?: number;\r
  exposure?: number;\r
  shadows?: number;\r
  intro?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Material {\r
  roughness: number;\r
  metalness: number;\r
  coat: number;\r
  coatRoughness: number;\r
  scatter: number;\r
  frost: number;\r
}\r
\r
const MATERIALS: Record<string, Material> = {\r
  satin: { roughness: 0.42, metalness: 0, coat: 0.35, coatRoughness: 0.22, scatter: 1, frost: 0 },\r
  matte: { roughness: 0.92, metalness: 0, coat: 0, coatRoughness: 0.5, scatter: 0.5, frost: 0 },\r
  gloss: { roughness: 0.2, metalness: 0, coat: 1, coatRoughness: 0.08, scatter: 1, frost: 0 },\r
  frosted: { roughness: 0.55, metalness: 0, coat: 0.6, coatRoughness: 0.18, scatter: 1.5, frost: 1 },\r
  metal: { roughness: 0.3, metalness: 1, coat: 0, coatRoughness: 0.2, scatter: 0, frost: 0 }\r
};\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aSphere;\r
layout(location = 2) in vec4 aColor;\r
layout(location = 3) in vec4 aShade;\r
uniform mat4 uProj;\r
uniform float uCameraZ;\r
uniform float uPixel;\r
out vec3 vPoint;\r
flat out vec3 vCenter;\r
flat out float vRadius;\r
flat out vec4 vColor;\r
flat out vec4 vShade;\r
void main() {\r
  vec3 c = vec3(aSphere.xy, aSphere.z - uCameraZ);\r
  float r = aSphere.w;\r
  float d = length(c);\r
  vec3 toCamera = -c / d;\r
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), toCamera));\r
  vec3 up = cross(toCamera, right);\r
  float reach = r * d / sqrt(max(d * d - r * r, 1e-4)) + uPixel * d * 2.0;\r
  vec3 p = c + (right * aCorner.x + up * aCorner.y) * reach;\r
  vPoint = p;\r
  vCenter = c;\r
  vRadius = r;\r
  vColor = aColor;\r
  vShade = aShade;\r
  gl_Position = uProj * vec4(p, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec3 vPoint;\r
flat in vec3 vCenter;\r
flat in float vRadius;\r
flat in vec4 vColor;\r
flat in vec4 vShade;\r
uniform mat4 uProj;\r
uniform vec3 uLightPos;\r
uniform vec3 uLight;\r
uniform float uExposure;\r
uniform float uShadow;\r
uniform vec4 uSurface;\r
uniform vec2 uExtra;\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
\r
float lobe(vec3 d, vec3 axis, float sharp) {\r
  return pow(max(dot(d, axis), 0.0), sharp) * (sharp + 1.0) * 0.16;\r
}\r
\r
vec3 studio(vec3 d, float rough) {\r
  float r = clamp(rough, 0.0, 1.0);\r
  float sharp = mix(60.0, 1.2, sqrt(r));\r
  vec3 col = mix(vec3(0.085, 0.085, 0.09), vec3(0.38, 0.38, 0.39), smoothstep(-0.7, 0.9, d.y));\r
  col += vec3(1.0, 0.99, 0.97) * 2.6 * lobe(d, normalize(vec3(-0.42, 0.78, 0.47)), sharp);\r
  col += vec3(0.97, 0.98, 1.0) * 1.1 * lobe(d, normalize(vec3(0.78, 0.22, 0.58)), sharp * 0.7);\r
  col += vec3(1.0) * 1.3 * lobe(d, normalize(vec3(0.15, 0.55, -0.82)), sharp * 0.8);\r
  return col;\r
}\r
\r
vec2 envBRDF(float NoV, float rough) {\r
  vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);\r
  vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);\r
  vec4 r = rough * c0 + c1;\r
  float a = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;\r
  return vec2(-1.04, 1.04) * a + r.zw;\r
}\r
\r
float ggx(float NoH, float a) {\r
  float a2 = a * a;\r
  float d = NoH * NoH * (a2 - 1.0) + 1.0;\r
  return a2 / (PI * d * d);\r
}\r
\r
float smith(float NoV, float NoL, float a) {\r
  float k = a * 0.5;\r
  return 0.25 / max((NoV * (1.0 - k) + k) * (NoL * (1.0 - k) + k), 1e-4);\r
}\r
\r
vec3 aces(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec3 rd = normalize(vPoint);\r
  float b = dot(vCenter, rd);\r
  float h = length(vCenter - rd * b);\r
  float r = vRadius;\r
  float aa = max(fwidth(h), 1e-5);\r
  float cover = clamp((r - h) / aa + 0.5, 0.0, 1.0);\r
  if (cover <= 0.002) discard;\r
  float hc = min(h, r * 0.9995);\r
  float t = b - sqrt(r * r - hc * hc);\r
  vec3 pos = rd * t;\r
  vec3 n = normalize(pos - vCenter);\r
  vec4 clip = uProj * vec4(pos, 1.0);\r
  gl_FragDepth = clamp(clip.z / clip.w * 0.5 + 0.5, 0.0, 1.0);\r
\r
  vec3 v = -rd;\r
  vec3 albedo = vColor.rgb;\r
  bool lamp = vColor.a > 0.5;\r
  vec3 dn = fwidth(n);\r
  float rough = sqrt(min(uSurface.x * uSurface.x + dot(dn, dn) * 0.6, 1.0));\r
  float metal = uSurface.y;\r
  float coat = uSurface.z;\r
  float coatRough = sqrt(min(uSurface.w * uSurface.w + dot(dn, dn) * 0.6, 1.0));\r
  float NoV = clamp(dot(n, v), 1e-4, 1.0);\r
  vec3 R = reflect(-v, n);\r
\r
  float occlusion = vShade.w * smoothstep(-0.15, 0.9, dot(n, vShade.xyz));\r
  float ao = 1.0 - uShadow * occlusion;\r
  float specAo = 1.0 - uShadow * occlusion * 0.7;\r
\r
  vec3 L = uLightPos - pos;\r
  float dist2 = dot(L, L);\r
  L *= inversesqrt(dist2);\r
  vec3 radiance = lamp ? vec3(0.0) : uLight / (dist2 + 1.0);\r
  float NoL = clamp(dot(n, L), 0.0, 1.0);\r
  vec3 H = normalize(L + v);\r
  float NoH = clamp(dot(n, H), 0.0, 1.0);\r
  float VoH = clamp(dot(v, H), 0.0, 1.0);\r
\r
  vec3 F0 = mix(vec3(0.04), albedo, metal);\r
  vec2 ab = envBRDF(NoV, rough);\r
  vec3 Fr = max(vec3(1.0 - rough), F0) - F0;\r
  vec3 kS = F0 + Fr * pow(1.0 - NoV, 5.0);\r
  vec3 diffuseColor = albedo * (1.0 - metal);\r
  vec3 irradiance = studio(n, 1.0) * 1.15;\r
  vec3 envSpec = studio(R, rough) * (F0 * ab.x + ab.y);\r
  vec3 col = diffuseColor * irradiance * (1.0 - kS) * ao + envSpec * specAo;\r
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - VoH, 5.0);\r
  float a = max(rough * rough, 0.06);\r
  vec3 spec = ggx(NoH, a) * smith(NoV, NoL, a) * F;\r
  float wrap = clamp((dot(n, L) + 0.3) / 1.3, 0.0, 1.0);\r
  col += (diffuseColor * (1.0 - F) / PI * wrap + spec * NoL) * radiance;\r
  vec3 sh = normalize(L + n * 0.1);\r
  float scatter = pow(clamp(dot(v, -sh), 0.0, 1.0), 2.0) * 10.0 + 0.04;\r
  col += scatter * albedo * radiance * 0.03 * uExtra.x;\r
  float alpha = 1.0;\r
  if (uExtra.y > 0.5) {\r
    float rim = pow(1.0 - NoV, 2.5);\r
    col += albedo * (studio(-R, 1.0) * 0.35 + 0.06) * (1.0 - rim);\r
    col += radiance * albedo * pow(max(dot(-v, L), 0.0), 3.0) * 0.08;\r
    alpha = mix(0.5, 0.96, rim);\r
  }\r
  if (coat > 0.0) {\r
    float Fc = 0.04 + 0.96 * pow(1.0 - NoV, 5.0);\r
    float ca = max(coatRough * coatRough, 0.03);\r
    vec3 coatEnv = studio(R, coatRough) * Fc;\r
    float coatSpec = ggx(NoH, ca) * smith(NoV, NoL, ca) * (0.04 + 0.96 * pow(1.0 - VoH, 5.0)) * NoL;\r
    col = col * (1.0 - Fc * coat) + (coatEnv * specAo + radiance * coatSpec) * coat;\r
    alpha = mix(alpha, 1.0, Fc * coat);\r
  }\r
  if (lamp) col += uLight * 0.0025 * (0.4 + 0.6 * albedo);\r
  col = aces(col * uExposure);\r
  col = pow(col, vec3(1.0 / 2.2));\r
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;\r
  float a2 = alpha * cover;\r
  outColor = vec4(col * a2, a2);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
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
const link = (gl: WebGL2RenderingContext) => {\r
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
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toLinear = (value: string | number): number[] => {\r
  let rgb: number[];\r
  if (typeof value === 'number') {\r
    rgb = [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];\r
  } else {\r
    let hex = String(value || '#ffffff')\r
      .replace('#', '')\r
      .trim();\r
    if (hex.length === 3 || hex.length === 4)\r
      hex = hex\r
        .slice(0, 3)\r
        .split('')\r
        .map(c => c + c)\r
        .join('');\r
    const num = parseInt(hex.slice(0, 6), 16);\r
    rgb = Number.isNaN(num) ? [1, 1, 1] : [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
  }\r
  return rgb.map(c => Math.pow(c, 2.2));\r
};\r
\r
const Ballpit = ({\r
  count = 200,\r
  colors = ['#ffffff'],\r
  material = 'satin',\r
  minSize = 0.5,\r
  maxSize = 1,\r
  gravity = 0.5,\r
  friction = 0.9975,\r
  wallBounce = 0.95,\r
  bounce = 0.85,\r
  depth = 2,\r
  drift = 0,\r
  followCursor = true,\r
  cursorSize = 1,\r
  grab = true,\r
  clickEffect = 'burst',\r
  lightColor = '#ffffff',\r
  lightIntensity = 1,\r
  exposure = 1,\r
  shadows = 0.6,\r
  intro = true,\r
  dpr,\r
  className = '',\r
  style\r
}: BallpitProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings = {\r
    count: Math.round(clamp(count, 1, 4000)),\r
    colors: Array.isArray(colors) && colors.length ? colors : ['#ffffff'],\r
    material: MATERIALS[material] ? material : 'satin',\r
    minSize: Math.max(0.05, Math.min(minSize, maxSize)),\r
    maxSize: Math.max(0.05, Math.max(minSize, maxSize)),\r
    gravity,\r
    friction: clamp(friction, 0.5, 1),\r
    wallBounce: clamp(wallBounce, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    depth: Math.max(0, depth),\r
    drift: Math.max(0, drift),\r
    followCursor,\r
    cursorSize: Math.max(0, cursorSize),\r
    grab,\r
    clickEffect,\r
    lightColor,\r
    lightIntensity: lightIntensity > 20 ? lightIntensity / 200 : Math.max(0, lightIntensity),\r
    exposure: Math.max(0, exposure),\r
    shadows: clamp(shadows, 0, 1),\r
    intro,\r
    dpr\r
  };\r
  type Settings = typeof settings;\r
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
      depth: true,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, halfW: 9, halfH: 9, fit: 1, tan: Math.tan((FOV * Math.PI) / 360) };\r
    const projection = new Float32Array(16);\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const quad = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const instances = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
    for (let k = 0; k < 3; k++) {\r
      gl.enableVertexAttribArray(1 + k);\r
      gl.vertexAttribPointer(1 + k, 4, gl.FLOAT, false, STRIDE * 4, k * 16);\r
      gl.vertexAttribDivisor(1 + k, 1);\r
    }\r
    gl.bindVertexArray(null);\r
\r
    let capacity = 0;\r
    let n = 0;\r
    let px = new Float32Array(0);\r
    let py = new Float32Array(0);\r
    let pz = new Float32Array(0);\r
    let vx = new Float32Array(0);\r
    let vy = new Float32Array(0);\r
    let vz = new Float32Array(0);\r
    let rad = new Float32Array(0);\r
    let inv = new Float32Array(0);\r
    let size = new Float32Array(0);\r
    let phase = new Float32Array(0);\r
    let occ = new Float32Array(0);\r
    let still = new Float32Array(0);\r
    let tone = new Uint16Array(0);\r
    let entered = new Uint8Array(0);\r
    let cellOf = new Int32Array(0);\r
    let sorted = new Int32Array(0);\r
    let order = new Int32Array(1);\r
    let data = new Float32Array(STRIDE);\r
    let table = new Int32Array(2);\r
    let starts = new Int32Array(2);\r
    let palette: number[][] = [];\r
    let paletteKey = '';\r
    let lastSizes = '';\r
\r
    const allocate = (total: number) => {\r
      const grow = (old: Float32Array, width = 1) => {\r
        const next = new Float32Array(total * width);\r
        next.set(old.subarray(0, Math.min(old.length, next.length)));\r
        return next;\r
      };\r
      const growUint8 = (old: Uint8Array) => {\r
        const next = new Uint8Array(total);\r
        next.set(old.subarray(0, Math.min(old.length, next.length)));\r
        return next;\r
      };\r
      px = grow(px);\r
      py = grow(py);\r
      pz = grow(pz);\r
      vx = grow(vx);\r
      vy = grow(vy);\r
      vz = grow(vz);\r
      rad = grow(rad);\r
      inv = grow(inv);\r
      size = grow(size);\r
      phase = grow(phase);\r
      occ = grow(occ, 4);\r
      still = grow(still, 3);\r
      const nextTone = new Uint16Array(total);\r
      nextTone.set(tone.subarray(0, Math.min(tone.length, total)));\r
      tone = nextTone;\r
      entered = growUint8(entered);\r
      cellOf = new Int32Array(total);\r
      sorted = new Int32Array(total);\r
      order = new Int32Array(total + 1);\r
      data = new Float32Array((total + 1) * STRIDE);\r
      capacity = total;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
      gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const pointer = { x: 0, y: 0, inside: false, down: false, downX: 0, downY: 0, downAt: 0, moved: false };\r
    const cursor = { x: 0, y: 0, z: 0, r: 0, tx: 0, ty: 0, vx: 0, vy: 0 };\r
    const light = { x: 0, y: 5, z: 6, flash: 0 };\r
    const held = { index: -1, ox: 0, oy: 0, tx: 0, ty: 0, vx: 0, vy: 0 };\r
    let elapsed = 0;\r
    let glide = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const spawn = (i: number, s: Settings, fromTop: boolean) => {\r
      const r = rad[i];\r
      const zr = Math.max(s.depth - r, 0);\r
      entered[i] = 1;\r
      if (fromTop && s.gravity > 0.05) {\r
        px[i] = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        py[i] = view.halfH + r + Math.random() * view.halfH * 2.2;\r
        pz[i] = (Math.random() * 2 - 1) * zr;\r
        vx[i] = (Math.random() - 0.5) * 2;\r
        vy[i] = -(4 + Math.random() * 5);\r
        vz[i] = 0;\r
        entered[i] = 0;\r
      } else if (fromTop) {\r
        const tx = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        const ty = (Math.random() * 2 - 1) * Math.max(view.halfH - r, 0.01);\r
        const tz = (Math.random() * 2 - 1) * zr;\r
        px[i] = (Math.random() * 2 - 1) * 0.6;\r
        py[i] = (Math.random() * 2 - 1) * 0.6;\r
        pz[i] = (Math.random() * 2 - 1) * Math.min(zr, 0.3);\r
        vx[i] = (tx - px[i]) * 2.2;\r
        vy[i] = (ty - py[i]) * 2.2;\r
        vz[i] = (tz - pz[i]) * 2.2;\r
        glide = 1;\r
      } else {\r
        px[i] = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        py[i] = (Math.random() * 2 - 1) * Math.max(view.halfH - r, 0.01);\r
        pz[i] = (Math.random() * 2 - 1) * zr;\r
        vx[i] = 0;\r
        vy[i] = 0;\r
        vz[i] = 0;\r
      }\r
    };\r
\r
    const applySizes = (s: Settings) => {\r
      for (let i = 0; i < n; i++) {\r
        rad[i] = (s.minSize + size[i] * (s.maxSize - s.minSize)) * view.fit;\r
        inv[i] = 1 / (rad[i] * rad[i] * rad[i]);\r
      }\r
    };\r
\r
    const applyPalette = (s: Settings) => {\r
      palette = s.colors.map(toLinear);\r
      paletteKey = s.colors.join('|');\r
    };\r
\r
    const sync = (s: Settings, first: boolean) => {\r
      const key = \`\${s.minSize}:\${s.maxSize}:\${view.fit}\`;\r
      if (s.count !== n) {\r
        if (s.count > capacity) allocate(Math.max(s.count, Math.ceil(capacity * 1.5)));\r
        const from = n;\r
        n = s.count;\r
        for (let i = from; i < n; i++) {\r
          size[i] = Math.random();\r
          tone[i] = i;\r
          phase[i] = Math.random() * Math.PI * 2;\r
          rad[i] = (s.minSize + size[i] * (s.maxSize - s.minSize)) * view.fit;\r
          inv[i] = 1 / (rad[i] * rad[i] * rad[i]);\r
          spawn(i, s, (first ? s.intro : true) && !reduce);\r
        }\r
        for (let i = 0; i <= n; i++) order[i] = i;\r
      }\r
      if (key !== lastSizes) {\r
        lastSizes = key;\r
        applySizes(s);\r
      }\r
      if (s.colors.join('|') !== paletteKey) applyPalette(s);\r
    };\r
\r
    let contacts = new Float32Array(0);\r
    let contactCount = 0;\r
\r
    const grid = { scale: 1, x0: 0, y0: 0, z0: 0, nx: 1, ny: 1, nz: 1 };\r
\r
    const buildGrid = (cell: number, s: Settings) => {\r
      grid.scale = 1 / cell;\r
      grid.x0 = -view.halfW - cell;\r
      grid.y0 = -view.halfH - cell;\r
      grid.z0 = -Math.max(s.depth, s.maxSize) - cell;\r
      grid.nx = Math.max(1, Math.ceil((view.halfW * 2 + cell * 2) * grid.scale) + 1);\r
      grid.ny = Math.max(1, Math.ceil((view.halfH * 2 + cell * 2) * grid.scale) + 1);\r
      grid.nz = Math.max(1, Math.ceil((Math.max(s.depth, s.maxSize) * 2 + cell * 2) * grid.scale) + 1);\r
      const cells = grid.nx * grid.ny * grid.nz;\r
      if (table.length < cells + 1) {\r
        table = new Int32Array(cells + 1);\r
        starts = new Int32Array(cells + 1);\r
      }\r
      table.fill(0, 0, cells + 1);\r
      for (let i = 0; i < n; i++) {\r
        const cx = clamp(Math.floor((px[i] - grid.x0) * grid.scale), 0, grid.nx - 1);\r
        const cy = clamp(Math.floor((py[i] - grid.y0) * grid.scale), 0, grid.ny - 1);\r
        const cz = clamp(Math.floor((pz[i] - grid.z0) * grid.scale), 0, grid.nz - 1);\r
        const c = (cz * grid.ny + cy) * grid.nx + cx;\r
        cellOf[i] = c;\r
        table[c + 1]++;\r
      }\r
      for (let c = 1; c <= cells; c++) table[c] += table[c - 1];\r
      starts.set(table.subarray(0, cells + 1));\r
      for (let i = 0; i < n; i++) sorted[starts[cellOf[i]]++] = i;\r
    };\r
\r
    const wall = (i: number, gap: number, nx: number, ny: number, nz: number, bounce: number, margin: number) => {\r
      if (gap >= margin || contactCount * 8 >= contacts.length) return;\r
      const approach = vx[i] * nx + vy[i] * ny + vz[i] * nz;\r
      const o = contactCount * 8;\r
      contacts[o] = i;\r
      contacts[o + 1] = -2;\r
      contacts[o + 2] = nx;\r
      contacts[o + 3] = ny;\r
      contacts[o + 4] = nz;\r
      contacts[o + 5] = gap;\r
      contacts[o + 6] = approach < -1.5 ? -bounce * approach : 0;\r
      contacts[o + 7] = 0;\r
      contactCount++;\r
    };\r
\r
    const findContacts = (s: Settings, dt: number, shade: boolean, margin: number) => {\r
      const heldIndex = held.index;\r
      const { nx: gx, ny: gy, nz: gz } = grid;\r
      contactCount = 0;\r
      for (let i = 0; i < n; i++) {\r
        const c = cellOf[i];\r
        const cx = c % gx;\r
        const cy = Math.floor(c / gx) % gy;\r
        const cz = Math.floor(c / (gx * gy));\r
        for (let dz = cz > 0 ? -1 : 0; dz <= (cz < gz - 1 ? 1 : 0); dz++) {\r
          for (let dy = cy > 0 ? -1 : 0; dy <= (cy < gy - 1 ? 1 : 0); dy++) {\r
            const row = ((cz + dz) * gy + cy + dy) * gx;\r
            for (let dx = cx > 0 ? -1 : 0; dx <= (cx < gx - 1 ? 1 : 0); dx++) {\r
              const cell = row + cx + dx;\r
              for (let k = table[cell]; k < table[cell + 1]; k++) {\r
                const j = sorted[k];\r
                if (j <= i) continue;\r
                const ddx = px[j] - px[i];\r
                const ddy = py[j] - py[i];\r
                const ddz = pz[j] - pz[i];\r
                const d2 = ddx * ddx + ddy * ddy + ddz * ddz;\r
                const sum = rad[i] + rad[j];\r
                const reach = Math.max(sum + margin, shade ? sum * 1.4 : 0);\r
                if (d2 >= reach * reach || d2 < 1e-12) continue;\r
                const d = Math.sqrt(d2);\r
                const nx = ddx / d;\r
                const ny = ddy / d;\r
                const nz = ddz / d;\r
                if (shade) {\r
                  const w = clamp(1 - (d - sum) / (sum * 0.4), 0, 1);\r
                  occ[i * 4] += nx * w;\r
                  occ[i * 4 + 1] += ny * w;\r
                  occ[i * 4 + 2] += nz * w;\r
                  occ[i * 4 + 3] += w;\r
                  occ[j * 4] -= nx * w;\r
                  occ[j * 4 + 1] -= ny * w;\r
                  occ[j * 4 + 2] -= nz * w;\r
                  occ[j * 4 + 3] += w;\r
                }\r
                if (d >= sum + margin || contactCount * 8 >= contacts.length) continue;\r
                if (i === heldIndex && j === heldIndex) continue;\r
                const approach = (vx[j] - vx[i]) * nx + (vy[j] - vy[i]) * ny + (vz[j] - vz[i]) * nz;\r
                const o = contactCount * 8;\r
                contacts[o] = i;\r
                contacts[o + 1] = j;\r
                contacts[o + 2] = nx;\r
                contacts[o + 3] = ny;\r
                contacts[o + 4] = nz;\r
                contacts[o + 5] = d - sum;\r
                contacts[o + 6] = approach < -1.5 ? -s.bounce * approach : 0;\r
                contacts[o + 7] = 0;\r
                contactCount++;\r
              }\r
            }\r
          }\r
        }\r
        if (i !== heldIndex) {\r
          const r = rad[i];\r
          const zr = Math.max(s.depth - r, 0);\r
          wall(i, px[i] + view.halfW - r, 1, 0, 0, s.wallBounce, margin);\r
          wall(i, view.halfW - r - px[i], -1, 0, 0, s.wallBounce, margin);\r
          wall(i, py[i] + view.halfH - r, 0, 1, 0, s.wallBounce, margin);\r
          if (entered[i]) wall(i, view.halfH - r - py[i], 0, -1, 0, s.wallBounce, margin);\r
          wall(i, pz[i] + zr, 0, 0, 1, s.wallBounce, margin);\r
          wall(i, zr - pz[i], 0, 0, -1, s.wallBounce, margin);\r
        }\r
        if (cursor.r > 0.01 && i !== heldIndex && contactCount * 8 < contacts.length) {\r
          const ddx = px[i] - cursor.x;\r
          const ddy = py[i] - cursor.y;\r
          const ddz = pz[i] - cursor.z;\r
          const sum = rad[i] + cursor.r;\r
          const d2 = ddx * ddx + ddy * ddy + ddz * ddz;\r
          if (d2 < (sum + margin) * (sum + margin) && d2 > 1e-12) {\r
            const d = Math.sqrt(d2);\r
            const nx = ddx / d;\r
            const ny = ddy / d;\r
            const nz = ddz / d;\r
            const approach = (vx[i] - cursor.vx) * nx + (vy[i] - cursor.vy) * ny + vz[i] * nz;\r
            const o = contactCount * 8;\r
            contacts[o] = i;\r
            contacts[o + 1] = -1;\r
            contacts[o + 2] = nx;\r
            contacts[o + 3] = ny;\r
            contacts[o + 4] = nz;\r
            contacts[o + 5] = d - sum;\r
            contacts[o + 6] = approach < -1.5 ? -s.bounce * approach : 0;\r
            contacts[o + 7] = 0;\r
            contactCount++;\r
          }\r
        }\r
      }\r
    };\r
\r
    const solveVelocities = (dt: number) => {\r
      const heldIndex = held.index;\r
      const iterations = n > 800 ? 5 : 8;\r
      for (let iteration = 0; iteration < iterations; iteration++) {\r
        for (let c = 0; c < contactCount; c++) {\r
          const o = c * 8;\r
          const i = contacts[o];\r
          const j = contacts[o + 1];\r
          const nx = contacts[o + 2];\r
          const ny = contacts[o + 3];\r
          const nz = contacts[o + 4];\r
          const gap = contacts[o + 5];\r
          const target = gap > 0 ? -gap / dt : contacts[o + 6];\r
          const before = contacts[o + 7];\r
          if (j < 0) {\r
            const vn =\r
              j === -1\r
                ? (vx[i] - cursor.vx) * nx + (vy[i] - cursor.vy) * ny + vz[i] * nz\r
                : vx[i] * nx + vy[i] * ny + vz[i] * nz;\r
            const after = Math.max(before + target - vn, 0);\r
            const change = after - before;\r
            contacts[o + 7] = after;\r
            vx[i] += change * nx;\r
            vy[i] += change * ny;\r
            vz[i] += change * nz;\r
            continue;\r
          }\r
          const wi = i === heldIndex ? 0 : inv[i];\r
          const wj = j === heldIndex ? 0 : inv[j];\r
          const w = wi + wj;\r
          if (w <= 0) continue;\r
          const vn = (vx[j] - vx[i]) * nx + (vy[j] - vy[i]) * ny + (vz[j] - vz[i]) * nz;\r
          const after = Math.max(before + (target - vn) / w, 0);\r
          const change = after - before;\r
          contacts[o + 7] = after;\r
          vx[i] -= change * wi * nx;\r
          vy[i] -= change * wi * ny;\r
          vz[i] -= change * wi * nz;\r
          vx[j] += change * wj * nx;\r
          vy[j] += change * wj * ny;\r
          vz[j] += change * wj * nz;\r
        }\r
      }\r
    };\r
\r
    const correctPositions = () => {\r
      const heldIndex = held.index;\r
      for (let pass = 0; pass < 2; pass++) {\r
        for (let c = 0; c < contactCount; c++) {\r
          const o = c * 8;\r
          const i = contacts[o];\r
          const j = contacts[o + 1];\r
          if (j === -2) continue;\r
          if (j < 0) {\r
            const ddx = px[i] - cursor.x;\r
            const ddy = py[i] - cursor.y;\r
            const ddz = pz[i] - cursor.z;\r
            const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);\r
            const overlap = rad[i] + cursor.r - d - SLOP;\r
            if (overlap <= 0 || d < 1e-6) continue;\r
            const k = (overlap * 0.5) / d;\r
            px[i] += ddx * k;\r
            py[i] += ddy * k;\r
            pz[i] += ddz * k;\r
            continue;\r
          }\r
          const ddx = px[j] - px[i];\r
          const ddy = py[j] - py[i];\r
          const ddz = pz[j] - pz[i];\r
          const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);\r
          const overlap = rad[i] + rad[j] - d - SLOP;\r
          if (overlap <= 0 || d < 1e-6) continue;\r
          const wi = i === heldIndex ? 0 : inv[i];\r
          const wj = j === heldIndex ? 0 : inv[j];\r
          const w = wi + wj;\r
          if (w <= 0) continue;\r
          const k = (overlap * 0.3) / (d * w);\r
          px[i] -= ddx * k * wi;\r
          py[i] -= ddy * k * wi;\r
          pz[i] -= ddz * k * wi;\r
          px[j] += ddx * k * wj;\r
          py[j] += ddy * k * wj;\r
          pz[j] += ddz * k * wj;\r
        }\r
      }\r
    };\r
\r
    const walls = (s: Settings) => {\r
      const hw = view.halfW;\r
      const hh = view.halfH;\r
      const e = s.wallBounce;\r
      for (let i = 0; i < n; i++) {\r
        const r = rad[i];\r
        if (px[i] < -hw + r) {\r
          px[i] = -hw + r;\r
          if (vx[i] < 0) vx[i] = vx[i] < -1.5 ? -vx[i] * e : 0;\r
        } else if (px[i] > hw - r) {\r
          px[i] = hw - r;\r
          if (vx[i] > 0) vx[i] = vx[i] > 1.5 ? -vx[i] * e : 0;\r
        }\r
        if (py[i] < -hh + r) {\r
          py[i] = -hh + r;\r
          if (vy[i] < 0) vy[i] = vy[i] < -1.5 ? -vy[i] * e : 0;\r
          vx[i] *= 0.995;\r
          vz[i] *= 0.995;\r
        } else if (entered[i] && py[i] > hh - r) {\r
          py[i] = hh - r;\r
          if (vy[i] > 0) vy[i] = vy[i] > 1.5 ? -vy[i] * e : 0;\r
        }\r
        if (!entered[i] && py[i] < hh - r) entered[i] = 1;\r
        const zr = Math.max(s.depth - r, 0);\r
        if (pz[i] < -zr) {\r
          pz[i] = -zr;\r
          if (vz[i] < 0) vz[i] = vz[i] < -1.5 ? -vz[i] * e : 0;\r
        } else if (pz[i] > zr) {\r
          pz[i] = zr;\r
          if (vz[i] > 0) vz[i] = vz[i] > 1.5 ? -vz[i] * e : 0;\r
        }\r
      }\r
    };\r
\r
    const step = (s: Settings, dt: number, shade: boolean) => {\r
      const g = s.gravity * 45;\r
      const damp = Math.pow(s.friction, dt * 60) * (glide > 0 ? Math.exp(-2.2 * dt) : 1);\r
      const wander = reduce ? 0 : s.drift * 2.2;\r
      const biggest = s.maxSize * view.fit;\r
      const margin = biggest * 0.3;\r
      if (contacts.length < n * 96) contacts = new Float32Array(n * 96);\r
      for (let i = 0; i < n; i++) {\r
        if (i === held.index) {\r
          const f = 1 - Math.exp(-dt / 0.02);\r
          vx[i] = ((held.tx - px[i]) * f) / dt;\r
          vy[i] = ((held.ty - py[i]) * f) / dt;\r
          vz[i] = 0;\r
          continue;\r
        }\r
        vy[i] -= g * dt;\r
        if (wander) {\r
          const p = phase[i];\r
          vx[i] += Math.sin(elapsed * 0.63 + p) * wander * dt;\r
          vy[i] += Math.cos(elapsed * 0.47 + p * 1.7) * wander * dt;\r
          vz[i] += Math.sin(elapsed * 0.41 + p * 2.3) * wander * dt * 0.5;\r
        }\r
        vx[i] *= damp;\r
        vy[i] *= damp;\r
        vz[i] *= damp;\r
        const sp = vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i];\r
        if (sp > MAX_SPEED * MAX_SPEED) {\r
          const f = MAX_SPEED / Math.sqrt(sp);\r
          vx[i] *= f;\r
          vy[i] *= f;\r
          vz[i] *= f;\r
        }\r
      }\r
      buildGrid(biggest * (shade ? 2.8 : 2.3), s);\r
      if (shade) occ.fill(0, 0, n * 4);\r
      findContacts(s, dt, shade, margin);\r
      solveVelocities(dt);\r
      for (let i = 0; i < n; i++) {\r
        px[i] += vx[i] * dt;\r
        py[i] += vy[i] * dt;\r
        pz[i] += vz[i] * dt;\r
      }\r
      correctPositions();\r
      walls(s);\r
      if (shade) {\r
        for (let i = 0; i < n; i++) {\r
          const gap = py[i] - rad[i] + view.halfH;\r
          const reach = rad[i] * 0.5;\r
          if (gap >= reach) continue;\r
          const w = 1 - Math.max(gap, 0) / reach;\r
          occ[i * 4 + 1] -= w;\r
          occ[i * 4 + 3] += w;\r
        }\r
      }\r
      if (held.index >= 0) {\r
        const i = held.index;\r
        held.vx += (vx[i] - held.vx) * (1 - Math.exp(-dt / 0.05));\r
        held.vy += (vy[i] - held.vy) * (1 - Math.exp(-dt / 0.05));\r
      }\r
    };\r
\r
    const rayTo = (clientX: number, clientY: number) => {\r
      const rect = container.getBoundingClientRect();\r
      const nx = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;\r
      const ny = 1 - ((clientY - rect.top) / Math.max(rect.height, 1)) * 2;\r
      return [nx * view.tan * (view.width / view.height), ny * view.tan, -1];\r
    };\r
\r
    const onPlane = (ray: number[], z: number) => {\r
      const t = (z - CAMERA_Z) / ray[2];\r
      return [ray[0] * t, ray[1] * t];\r
    };\r
\r
    const pick = (ray: number[]) => {\r
      const len = Math.hypot(ray[0], ray[1], ray[2]);\r
      const dx = ray[0] / len;\r
      const dy = ray[1] / len;\r
      const dz = ray[2] / len;\r
      let best = -1;\r
      let bestT = Infinity;\r
      for (let i = 0; i < n; i++) {\r
        const ox = -px[i];\r
        const oy = -py[i];\r
        const oz = CAMERA_Z - pz[i];\r
        const b = ox * dx + oy * dy + oz * dz;\r
        const r = rad[i] * 1.15;\r
        const c = ox * ox + oy * oy + oz * oz - r * r;\r
        const disc = b * b - c;\r
        if (disc < 0) continue;\r
        const t = -b - Math.sqrt(disc);\r
        if (t > 0 && t < bestT) {\r
          bestT = t;\r
          best = i;\r
        }\r
      }\r
      return best;\r
    };\r
\r
    const burst = (x: number, y: number) => {\r
      const s = settingsRef.current;\r
      const reach = view.halfH * 0.7;\r
      for (let i = 0; i < n; i++) {\r
        const dx = px[i] - x;\r
        const dy = py[i] - y;\r
        const dz = pz[i];\r
        const d = Math.hypot(dx, dy, dz);\r
        if (d >= reach || d < 1e-4) continue;\r
        const f = Math.pow(1 - d / reach, 2) * 26 * (1 + 0.6 / (rad[i] + 0.4));\r
        vx[i] += (dx / d) * f;\r
        vy[i] += (dy / d) * f + f * 0.25;\r
        vz[i] += (dz / d) * f * 0.5;\r
      }\r
      light.x = x;\r
      light.y = y;\r
      light.z = Math.max(s.depth, 1) + 1.5;\r
      light.flash = 1;\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const aspect = view.width / view.height;\r
      const base = Math.tan((FOV * Math.PI) / 360);\r
      view.tan = aspect > MAX_ASPECT ? (base * MAX_ASPECT) / aspect : base;\r
      view.halfH = view.tan * CAMERA_Z;\r
      view.halfW = view.halfH * aspect;\r
      view.fit = clamp(Math.sqrt((view.halfW * view.halfH) / (base * base * CAMERA_Z * CAMERA_Z * MAX_ASPECT)), 0.4, 1);\r
      const f = 1 / view.tan;\r
      const near = 1;\r
      const far = 80;\r
      projection.fill(0);\r
      projection[0] = f / aspect;\r
      projection[5] = f;\r
      projection[10] = (far + near) / (near - far);\r
      projection[11] = -1;\r
      projection[14] = (2 * far * near) / (near - far);\r
      if (!n) sync(s, true);\r
      draw();\r
      wake();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const mat = MATERIALS[s.material];\r
      let count = 0;\r
      const total = n + 1;\r
      for (let a = 1; a < total; a++) {\r
        const item = order[a];\r
        const z = item === n ? cursor.z : pz[item];\r
        let b = a - 1;\r
        while (b >= 0 && (order[b] === n ? cursor.z : pz[order[b]]) > z) {\r
          order[b + 1] = order[b];\r
          b--;\r
        }\r
        order[b + 1] = item;\r
      }\r
      for (let k = 0; k < total; k++) {\r
        const i = order[k];\r
        const o = count * STRIDE;\r
        if (i === n) {\r
          if (cursor.r < 0.01 || !s.followCursor) continue;\r
          const c = palette[0] || [1, 1, 1];\r
          data[o] = cursor.x;\r
          data[o + 1] = cursor.y;\r
          data[o + 2] = cursor.z;\r
          data[o + 3] = cursor.r;\r
          data[o + 4] = c[0];\r
          data[o + 5] = c[1];\r
          data[o + 6] = c[2];\r
          data[o + 7] = 1;\r
          data[o + 8] = 0;\r
          data[o + 9] = 0;\r
          data[o + 10] = 0;\r
          data[o + 11] = 0;\r
        } else {\r
          const c = palette[tone[i] % palette.length];\r
          data[o] = px[i];\r
          data[o + 1] = py[i];\r
          data[o + 2] = pz[i];\r
          data[o + 3] = rad[i];\r
          data[o + 4] = c[0];\r
          data[o + 5] = c[1];\r
          data[o + 6] = c[2];\r
          data[o + 7] = 0;\r
          const w = occ[i * 4 + 3];\r
          const len = Math.hypot(occ[i * 4], occ[i * 4 + 1], occ[i * 4 + 2]) || 1;\r
          data[o + 8] = occ[i * 4] / len;\r
          data[o + 9] = occ[i * 4 + 1] / len;\r
          data[o + 10] = occ[i * 4 + 2] / len;\r
          data[o + 11] = Math.min(w * 0.55, 1);\r
        }\r
        count++;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!count) return;\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.depthFunc(gl.LEQUAL);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.uniformMatrix4fv(u.uProj, false, projection);\r
      gl.uniform1f(u.uCameraZ, CAMERA_Z);\r
      gl.uniform1f(u.uPixel, (2 * view.tan) / canvas.height);\r
      const lc = toLinear(s.lightColor);\r
      const power = s.lightIntensity * 60 * (1 + light.flash * 3);\r
      gl.uniform3f(u.uLight, lc[0] * power, lc[1] * power, lc[2] * power);\r
      gl.uniform3f(u.uLightPos, light.x, light.y, light.z - CAMERA_Z);\r
      gl.uniform1f(u.uExposure, s.exposure);\r
      gl.uniform1f(u.uShadow, s.shadows);\r
      gl.uniform4f(u.uSurface, mat.roughness, mat.metalness, mat.coat, mat.coatRoughness);\r
      gl.uniform2f(u.uExtra, mat.scatter, mat.frost);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, count * STRIDE);\r
      gl.bindVertexArray(vao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      elapsed += dt;\r
      glide = Math.max(0, glide - dt);\r
      sync(s, false);\r
      const targetR = s.followCursor && pointer.inside && held.index < 0 ? s.cursorSize * view.fit : 0;\r
      cursor.r += (targetR - cursor.r) * (1 - Math.exp(-dt / 0.12));\r
      const follow = 1 - Math.exp(-dt / 0.06);\r
      const fromX = cursor.x;\r
      const fromY = cursor.y;\r
      cursor.x += (cursor.tx - cursor.x) * follow;\r
      cursor.y += (cursor.ty - cursor.y) * follow;\r
      cursor.vx = clamp((cursor.x - fromX) / Math.max(dt, 1e-3), -MAX_SPEED, MAX_SPEED);\r
      cursor.vy = clamp((cursor.y - fromY) / Math.max(dt, 1e-3), -MAX_SPEED, MAX_SPEED);\r
      const restX = 0;\r
      const restY = view.halfH * 0.75;\r
      const restZ = s.depth + 4;\r
      const lightTarget = pointer.inside\r
        ? [cursor.x, cursor.y, s.followCursor ? cursor.z : 1.5]\r
        : light.flash > 0.05\r
          ? [light.x, light.y, light.z]\r
          : [restX, restY, restZ];\r
      const lf = 1 - Math.exp(-dt / 0.08);\r
      light.x += (lightTarget[0] - light.x) * lf;\r
      light.y += (lightTarget[1] - light.y) * lf;\r
      light.z += (lightTarget[2] - light.z) * lf;\r
      light.flash *= Math.exp(-dt / 0.3);\r
      if (dt > 1e-4) {\r
        const steps = Math.min(6, Math.max(1, Math.ceil(dt / (1 / 180))));\r
        const h = dt / steps;\r
        for (let k = 0; k < steps; k++) step(s, h, k === steps - 1);\r
      }\r
      draw();\r
      let moved = 0;\r
      for (let i = 0; i < n; i++) {\r
        const k = i * 3;\r
        const d = Math.abs(px[i] - still[k]) + Math.abs(py[i] - still[k + 1]) + Math.abs(pz[i] - still[k + 2]);\r
        if (d > moved) moved = d;\r
        still[k] = px[i];\r
        still[k + 1] = py[i];\r
        still[k + 2] = pz[i];\r
      }\r
      const motion = moved / Math.max(dt, 1e-3);\r
      const busy =\r
        motion > 0.6 ||\r
        pointer.inside ||\r
        held.index >= 0 ||\r
        light.flash > 0.01 ||\r
        glide > 0 ||\r
        cursor.r > 0.01 ||\r
        (s.drift > 0 && !reduce);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.8) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const inside = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
    };\r
\r
    const aim = (event: PointerEvent) => {\r
      const ray = rayTo(event.clientX, event.clientY);\r
      const [x, y] = onPlane(ray, cursor.z);\r
      cursor.tx = x;\r
      cursor.ty = y;\r
      if (held.index >= 0) {\r
        const [hx, hy] = onPlane(ray, pz[held.index]);\r
        held.tx = hx - held.ox;\r
        held.ty = hy - held.oy;\r
      }\r
      return ray;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const was = pointer.inside;\r
      pointer.inside = inside(event) || held.index >= 0;\r
      if (pointer.inside) {\r
        aim(event);\r
        if (!was) {\r
          cursor.x = cursor.tx;\r
          cursor.y = cursor.ty;\r
        }\r
        if (pointer.down && Math.hypot(event.clientX - pointer.downX, event.clientY - pointer.downY) > 6)\r
          pointer.moved = true;\r
      }\r
      if (pointer.inside || was) wake();\r
    };\r
\r
    const interactive = (target: EventTarget | null) =>\r
      target instanceof Element && target.closest('a, button, input, textarea, select, label, [role="button"]');\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      if (event.button !== 0 || !inside(event) || interactive(event.target)) return;\r
      const s = settingsRef.current;\r
      pointer.down = true;\r
      pointer.moved = false;\r
      pointer.downX = event.clientX;\r
      pointer.downY = event.clientY;\r
      pointer.downAt = performance.now();\r
      const ray = aim(event);\r
      if (s.grab) {\r
        const i = pick(ray);\r
        if (i >= 0) {\r
          const [hx, hy] = onPlane(ray, pz[i]);\r
          held.index = i;\r
          held.ox = hx - px[i];\r
          held.oy = hy - py[i];\r
          held.tx = px[i];\r
          held.ty = py[i];\r
          held.vx = 0;\r
          held.vy = 0;\r
          if (event.pointerType === 'mouse') event.preventDefault();\r
        }\r
      }\r
      wake();\r
    };\r
\r
    const release = (event: PointerEvent | null) => {\r
      const s = settingsRef.current;\r
      if (held.index >= 0) {\r
        const i = held.index;\r
        const sp = Math.hypot(held.vx, held.vy);\r
        const k = sp > 22 ? 22 / sp : 1;\r
        vx[i] = held.vx * k;\r
        vy[i] = held.vy * k;\r
        held.index = -1;\r
        entered[i] = 1;\r
      } else if (\r
        event &&\r
        pointer.down &&\r
        !pointer.moved &&\r
        performance.now() - pointer.downAt < 400 &&\r
        s.clickEffect === 'burst' &&\r
        !reduce &&\r
        inside(event)\r
      ) {\r
        const [x, y] = onPlane(rayTo(event.clientX, event.clientY), 0);\r
        burst(x, y);\r
      }\r
      pointer.down = false;\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => release(event);\r
    const onPointerCancel = () => release(null);\r
    const onPointerLeave = () => {\r
      pointer.inside = held.index >= 0;\r
      wake();\r
    };\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown);\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerCancel);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(quad);\r
      gl.deleteBuffer(instances);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      className={className}\r
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}\r
    >\r
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Ballpit;\r
`,e=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
\r
const FOV = 50;\r
const CAMERA_Z = 20;\r
const MAX_ASPECT = 1.5;\r
const MAX_SPEED = 16;\r
const STRIDE = 12;\r
const SLOP = 0.01;\r
\r
export type BallpitMaterial = 'satin' | 'matte' | 'gloss' | 'frosted' | 'metal';\r
\r
export interface BallpitProps {\r
  count?: number;\r
  colors?: Array<string | number>;\r
  material?: BallpitMaterial;\r
  minSize?: number;\r
  maxSize?: number;\r
  gravity?: number;\r
  friction?: number;\r
  wallBounce?: number;\r
  bounce?: number;\r
  depth?: number;\r
  drift?: number;\r
  followCursor?: boolean;\r
  cursorSize?: number;\r
  grab?: boolean;\r
  clickEffect?: 'burst' | 'none';\r
  lightColor?: string;\r
  lightIntensity?: number;\r
  exposure?: number;\r
  shadows?: number;\r
  intro?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Material {\r
  roughness: number;\r
  metalness: number;\r
  coat: number;\r
  coatRoughness: number;\r
  scatter: number;\r
  frost: number;\r
}\r
\r
const MATERIALS: Record<string, Material> = {\r
  satin: { roughness: 0.42, metalness: 0, coat: 0.35, coatRoughness: 0.22, scatter: 1, frost: 0 },\r
  matte: { roughness: 0.92, metalness: 0, coat: 0, coatRoughness: 0.5, scatter: 0.5, frost: 0 },\r
  gloss: { roughness: 0.2, metalness: 0, coat: 1, coatRoughness: 0.08, scatter: 1, frost: 0 },\r
  frosted: { roughness: 0.55, metalness: 0, coat: 0.6, coatRoughness: 0.18, scatter: 1.5, frost: 1 },\r
  metal: { roughness: 0.3, metalness: 1, coat: 0, coatRoughness: 0.2, scatter: 0, frost: 0 }\r
};\r
\r
const VERTEX = \`#version 300 es\r
precision highp float;\r
layout(location = 0) in vec2 aCorner;\r
layout(location = 1) in vec4 aSphere;\r
layout(location = 2) in vec4 aColor;\r
layout(location = 3) in vec4 aShade;\r
uniform mat4 uProj;\r
uniform float uCameraZ;\r
uniform float uPixel;\r
out vec3 vPoint;\r
flat out vec3 vCenter;\r
flat out float vRadius;\r
flat out vec4 vColor;\r
flat out vec4 vShade;\r
void main() {\r
  vec3 c = vec3(aSphere.xy, aSphere.z - uCameraZ);\r
  float r = aSphere.w;\r
  float d = length(c);\r
  vec3 toCamera = -c / d;\r
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), toCamera));\r
  vec3 up = cross(toCamera, right);\r
  float reach = r * d / sqrt(max(d * d - r * r, 1e-4)) + uPixel * d * 2.0;\r
  vec3 p = c + (right * aCorner.x + up * aCorner.y) * reach;\r
  vPoint = p;\r
  vCenter = c;\r
  vRadius = r;\r
  vColor = aColor;\r
  vShade = aShade;\r
  gl_Position = uProj * vec4(p, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec3 vPoint;\r
flat in vec3 vCenter;\r
flat in float vRadius;\r
flat in vec4 vColor;\r
flat in vec4 vShade;\r
uniform mat4 uProj;\r
uniform vec3 uLightPos;\r
uniform vec3 uLight;\r
uniform float uExposure;\r
uniform float uShadow;\r
uniform vec4 uSurface;\r
uniform vec2 uExtra;\r
out vec4 outColor;\r
\r
const float PI = 3.14159265;\r
\r
float lobe(vec3 d, vec3 axis, float sharp) {\r
  return pow(max(dot(d, axis), 0.0), sharp) * (sharp + 1.0) * 0.16;\r
}\r
\r
vec3 studio(vec3 d, float rough) {\r
  float r = clamp(rough, 0.0, 1.0);\r
  float sharp = mix(60.0, 1.2, sqrt(r));\r
  vec3 col = mix(vec3(0.085, 0.085, 0.09), vec3(0.38, 0.38, 0.39), smoothstep(-0.7, 0.9, d.y));\r
  col += vec3(1.0, 0.99, 0.97) * 2.6 * lobe(d, normalize(vec3(-0.42, 0.78, 0.47)), sharp);\r
  col += vec3(0.97, 0.98, 1.0) * 1.1 * lobe(d, normalize(vec3(0.78, 0.22, 0.58)), sharp * 0.7);\r
  col += vec3(1.0) * 1.3 * lobe(d, normalize(vec3(0.15, 0.55, -0.82)), sharp * 0.8);\r
  return col;\r
}\r
\r
vec2 envBRDF(float NoV, float rough) {\r
  vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);\r
  vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);\r
  vec4 r = rough * c0 + c1;\r
  float a = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;\r
  return vec2(-1.04, 1.04) * a + r.zw;\r
}\r
\r
float ggx(float NoH, float a) {\r
  float a2 = a * a;\r
  float d = NoH * NoH * (a2 - 1.0) + 1.0;\r
  return a2 / (PI * d * d);\r
}\r
\r
float smith(float NoV, float NoL, float a) {\r
  float k = a * 0.5;\r
  return 0.25 / max((NoV * (1.0 - k) + k) * (NoL * (1.0 - k) + k), 1e-4);\r
}\r
\r
vec3 aces(vec3 x) {\r
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);\r
}\r
\r
void main() {\r
  vec3 rd = normalize(vPoint);\r
  float b = dot(vCenter, rd);\r
  float h = length(vCenter - rd * b);\r
  float r = vRadius;\r
  float aa = max(fwidth(h), 1e-5);\r
  float cover = clamp((r - h) / aa + 0.5, 0.0, 1.0);\r
  if (cover <= 0.002) discard;\r
  float hc = min(h, r * 0.9995);\r
  float t = b - sqrt(r * r - hc * hc);\r
  vec3 pos = rd * t;\r
  vec3 n = normalize(pos - vCenter);\r
  vec4 clip = uProj * vec4(pos, 1.0);\r
  gl_FragDepth = clamp(clip.z / clip.w * 0.5 + 0.5, 0.0, 1.0);\r
\r
  vec3 v = -rd;\r
  vec3 albedo = vColor.rgb;\r
  bool lamp = vColor.a > 0.5;\r
  vec3 dn = fwidth(n);\r
  float rough = sqrt(min(uSurface.x * uSurface.x + dot(dn, dn) * 0.6, 1.0));\r
  float metal = uSurface.y;\r
  float coat = uSurface.z;\r
  float coatRough = sqrt(min(uSurface.w * uSurface.w + dot(dn, dn) * 0.6, 1.0));\r
  float NoV = clamp(dot(n, v), 1e-4, 1.0);\r
  vec3 R = reflect(-v, n);\r
\r
  float occlusion = vShade.w * smoothstep(-0.15, 0.9, dot(n, vShade.xyz));\r
  float ao = 1.0 - uShadow * occlusion;\r
  float specAo = 1.0 - uShadow * occlusion * 0.7;\r
\r
  vec3 L = uLightPos - pos;\r
  float dist2 = dot(L, L);\r
  L *= inversesqrt(dist2);\r
  vec3 radiance = lamp ? vec3(0.0) : uLight / (dist2 + 1.0);\r
  float NoL = clamp(dot(n, L), 0.0, 1.0);\r
  vec3 H = normalize(L + v);\r
  float NoH = clamp(dot(n, H), 0.0, 1.0);\r
  float VoH = clamp(dot(v, H), 0.0, 1.0);\r
\r
  vec3 F0 = mix(vec3(0.04), albedo, metal);\r
  vec2 ab = envBRDF(NoV, rough);\r
  vec3 Fr = max(vec3(1.0 - rough), F0) - F0;\r
  vec3 kS = F0 + Fr * pow(1.0 - NoV, 5.0);\r
  vec3 diffuseColor = albedo * (1.0 - metal);\r
  vec3 irradiance = studio(n, 1.0) * 1.15;\r
  vec3 envSpec = studio(R, rough) * (F0 * ab.x + ab.y);\r
  vec3 col = diffuseColor * irradiance * (1.0 - kS) * ao + envSpec * specAo;\r
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - VoH, 5.0);\r
  float a = max(rough * rough, 0.06);\r
  vec3 spec = ggx(NoH, a) * smith(NoV, NoL, a) * F;\r
  float wrap = clamp((dot(n, L) + 0.3) / 1.3, 0.0, 1.0);\r
  col += (diffuseColor * (1.0 - F) / PI * wrap + spec * NoL) * radiance;\r
  vec3 sh = normalize(L + n * 0.1);\r
  float scatter = pow(clamp(dot(v, -sh), 0.0, 1.0), 2.0) * 10.0 + 0.04;\r
  col += scatter * albedo * radiance * 0.03 * uExtra.x;\r
  float alpha = 1.0;\r
  if (uExtra.y > 0.5) {\r
    float rim = pow(1.0 - NoV, 2.5);\r
    col += albedo * (studio(-R, 1.0) * 0.35 + 0.06) * (1.0 - rim);\r
    col += radiance * albedo * pow(max(dot(-v, L), 0.0), 3.0) * 0.08;\r
    alpha = mix(0.5, 0.96, rim);\r
  }\r
  if (coat > 0.0) {\r
    float Fc = 0.04 + 0.96 * pow(1.0 - NoV, 5.0);\r
    float ca = max(coatRough * coatRough, 0.03);\r
    vec3 coatEnv = studio(R, coatRough) * Fc;\r
    float coatSpec = ggx(NoH, ca) * smith(NoV, NoL, ca) * (0.04 + 0.96 * pow(1.0 - VoH, 5.0)) * NoL;\r
    col = col * (1.0 - Fc * coat) + (coatEnv * specAo + radiance * coatSpec) * coat;\r
    alpha = mix(alpha, 1.0, Fc * coat);\r
  }\r
  if (lamp) col += uLight * 0.0025 * (0.4 + 0.6 * albedo);\r
  col = aces(col * uExposure);\r
  col = pow(col, vec3(1.0 / 2.2));\r
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;\r
  float a2 = alpha * cover;\r
  outColor = vec4(col * a2, a2);\r
}\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
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
const link = (gl: WebGL2RenderingContext) => {\r
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
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);\r
  for (let i = 0; i < total; i++) {\r
    const info = gl.getActiveUniform(program, i);\r
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toLinear = (value: string | number): number[] => {\r
  let rgb: number[];\r
  if (typeof value === 'number') {\r
    rgb = [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];\r
  } else {\r
    let hex = String(value || '#ffffff')\r
      .replace('#', '')\r
      .trim();\r
    if (hex.length === 3 || hex.length === 4)\r
      hex = hex\r
        .slice(0, 3)\r
        .split('')\r
        .map(c => c + c)\r
        .join('');\r
    const num = parseInt(hex.slice(0, 6), 16);\r
    rgb = Number.isNaN(num) ? [1, 1, 1] : [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
  }\r
  return rgb.map(c => Math.pow(c, 2.2));\r
};\r
\r
const Ballpit = ({\r
  count = 200,\r
  colors = ['#ffffff'],\r
  material = 'satin',\r
  minSize = 0.5,\r
  maxSize = 1,\r
  gravity = 0.5,\r
  friction = 0.9975,\r
  wallBounce = 0.95,\r
  bounce = 0.85,\r
  depth = 2,\r
  drift = 0,\r
  followCursor = true,\r
  cursorSize = 1,\r
  grab = true,\r
  clickEffect = 'burst',\r
  lightColor = '#ffffff',\r
  lightIntensity = 1,\r
  exposure = 1,\r
  shadows = 0.6,\r
  intro = true,\r
  dpr,\r
  className = '',\r
  style\r
}: BallpitProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings = {\r
    count: Math.round(clamp(count, 1, 4000)),\r
    colors: Array.isArray(colors) && colors.length ? colors : ['#ffffff'],\r
    material: MATERIALS[material] ? material : 'satin',\r
    minSize: Math.max(0.05, Math.min(minSize, maxSize)),\r
    maxSize: Math.max(0.05, Math.max(minSize, maxSize)),\r
    gravity,\r
    friction: clamp(friction, 0.5, 1),\r
    wallBounce: clamp(wallBounce, 0, 1),\r
    bounce: clamp(bounce, 0, 1),\r
    depth: Math.max(0, depth),\r
    drift: Math.max(0, drift),\r
    followCursor,\r
    cursorSize: Math.max(0, cursorSize),\r
    grab,\r
    clickEffect,\r
    lightColor,\r
    lightIntensity: lightIntensity > 20 ? lightIntensity / 200 : Math.max(0, lightIntensity),\r
    exposure: Math.max(0, exposure),\r
    shadows: clamp(shadows, 0, 1),\r
    intro,\r
    dpr\r
  };\r
  type Settings = typeof settings;\r
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
      depth: true,\r
      stencil: false,\r
      powerPreference: 'high-performance'\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
    const u = shader.uniforms;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, halfW: 9, halfH: 9, fit: 1, tan: Math.tan((FOV * Math.PI) / 360) };\r
    const projection = new Float32Array(16);\r
\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const quad = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);\r
    const instances = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
    for (let k = 0; k < 3; k++) {\r
      gl.enableVertexAttribArray(1 + k);\r
      gl.vertexAttribPointer(1 + k, 4, gl.FLOAT, false, STRIDE * 4, k * 16);\r
      gl.vertexAttribDivisor(1 + k, 1);\r
    }\r
    gl.bindVertexArray(null);\r
\r
    let capacity = 0;\r
    let n = 0;\r
    let px = new Float32Array(0);\r
    let py = new Float32Array(0);\r
    let pz = new Float32Array(0);\r
    let vx = new Float32Array(0);\r
    let vy = new Float32Array(0);\r
    let vz = new Float32Array(0);\r
    let rad = new Float32Array(0);\r
    let inv = new Float32Array(0);\r
    let size = new Float32Array(0);\r
    let phase = new Float32Array(0);\r
    let occ = new Float32Array(0);\r
    let still = new Float32Array(0);\r
    let tone = new Uint16Array(0);\r
    let entered = new Uint8Array(0);\r
    let cellOf = new Int32Array(0);\r
    let sorted = new Int32Array(0);\r
    let order = new Int32Array(1);\r
    let data = new Float32Array(STRIDE);\r
    let table = new Int32Array(2);\r
    let starts = new Int32Array(2);\r
    let palette: number[][] = [];\r
    let paletteKey = '';\r
    let lastSizes = '';\r
\r
    const allocate = (total: number) => {\r
      const grow = (old: Float32Array, width = 1) => {\r
        const next = new Float32Array(total * width);\r
        next.set(old.subarray(0, Math.min(old.length, next.length)));\r
        return next;\r
      };\r
      const growUint8 = (old: Uint8Array) => {\r
        const next = new Uint8Array(total);\r
        next.set(old.subarray(0, Math.min(old.length, next.length)));\r
        return next;\r
      };\r
      px = grow(px);\r
      py = grow(py);\r
      pz = grow(pz);\r
      vx = grow(vx);\r
      vy = grow(vy);\r
      vz = grow(vz);\r
      rad = grow(rad);\r
      inv = grow(inv);\r
      size = grow(size);\r
      phase = grow(phase);\r
      occ = grow(occ, 4);\r
      still = grow(still, 3);\r
      const nextTone = new Uint16Array(total);\r
      nextTone.set(tone.subarray(0, Math.min(tone.length, total)));\r
      tone = nextTone;\r
      entered = growUint8(entered);\r
      cellOf = new Int32Array(total);\r
      sorted = new Int32Array(total);\r
      order = new Int32Array(total + 1);\r
      data = new Float32Array((total + 1) * STRIDE);\r
      capacity = total;\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
      gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);\r
    };\r
\r
    const pointer = { x: 0, y: 0, inside: false, down: false, downX: 0, downY: 0, downAt: 0, moved: false };\r
    const cursor = { x: 0, y: 0, z: 0, r: 0, tx: 0, ty: 0, vx: 0, vy: 0 };\r
    const light = { x: 0, y: 5, z: 6, flash: 0 };\r
    const held = { index: -1, ox: 0, oy: 0, tx: 0, ty: 0, vx: 0, vy: 0 };\r
    let elapsed = 0;\r
    let glide = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const spawn = (i: number, s: Settings, fromTop: boolean) => {\r
      const r = rad[i];\r
      const zr = Math.max(s.depth - r, 0);\r
      entered[i] = 1;\r
      if (fromTop && s.gravity > 0.05) {\r
        px[i] = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        py[i] = view.halfH + r + Math.random() * view.halfH * 2.2;\r
        pz[i] = (Math.random() * 2 - 1) * zr;\r
        vx[i] = (Math.random() - 0.5) * 2;\r
        vy[i] = -(4 + Math.random() * 5);\r
        vz[i] = 0;\r
        entered[i] = 0;\r
      } else if (fromTop) {\r
        const tx = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        const ty = (Math.random() * 2 - 1) * Math.max(view.halfH - r, 0.01);\r
        const tz = (Math.random() * 2 - 1) * zr;\r
        px[i] = (Math.random() * 2 - 1) * 0.6;\r
        py[i] = (Math.random() * 2 - 1) * 0.6;\r
        pz[i] = (Math.random() * 2 - 1) * Math.min(zr, 0.3);\r
        vx[i] = (tx - px[i]) * 2.2;\r
        vy[i] = (ty - py[i]) * 2.2;\r
        vz[i] = (tz - pz[i]) * 2.2;\r
        glide = 1;\r
      } else {\r
        px[i] = (Math.random() * 2 - 1) * Math.max(view.halfW - r, 0.01);\r
        py[i] = (Math.random() * 2 - 1) * Math.max(view.halfH - r, 0.01);\r
        pz[i] = (Math.random() * 2 - 1) * zr;\r
        vx[i] = 0;\r
        vy[i] = 0;\r
        vz[i] = 0;\r
      }\r
    };\r
\r
    const applySizes = (s: Settings) => {\r
      for (let i = 0; i < n; i++) {\r
        rad[i] = (s.minSize + size[i] * (s.maxSize - s.minSize)) * view.fit;\r
        inv[i] = 1 / (rad[i] * rad[i] * rad[i]);\r
      }\r
    };\r
\r
    const applyPalette = (s: Settings) => {\r
      palette = s.colors.map(toLinear);\r
      paletteKey = s.colors.join('|');\r
    };\r
\r
    const sync = (s: Settings, first: boolean) => {\r
      const key = \`\${s.minSize}:\${s.maxSize}:\${view.fit}\`;\r
      if (s.count !== n) {\r
        if (s.count > capacity) allocate(Math.max(s.count, Math.ceil(capacity * 1.5)));\r
        const from = n;\r
        n = s.count;\r
        for (let i = from; i < n; i++) {\r
          size[i] = Math.random();\r
          tone[i] = i;\r
          phase[i] = Math.random() * Math.PI * 2;\r
          rad[i] = (s.minSize + size[i] * (s.maxSize - s.minSize)) * view.fit;\r
          inv[i] = 1 / (rad[i] * rad[i] * rad[i]);\r
          spawn(i, s, (first ? s.intro : true) && !reduce);\r
        }\r
        for (let i = 0; i <= n; i++) order[i] = i;\r
      }\r
      if (key !== lastSizes) {\r
        lastSizes = key;\r
        applySizes(s);\r
      }\r
      if (s.colors.join('|') !== paletteKey) applyPalette(s);\r
    };\r
\r
    let contacts = new Float32Array(0);\r
    let contactCount = 0;\r
\r
    const grid = { scale: 1, x0: 0, y0: 0, z0: 0, nx: 1, ny: 1, nz: 1 };\r
\r
    const buildGrid = (cell: number, s: Settings) => {\r
      grid.scale = 1 / cell;\r
      grid.x0 = -view.halfW - cell;\r
      grid.y0 = -view.halfH - cell;\r
      grid.z0 = -Math.max(s.depth, s.maxSize) - cell;\r
      grid.nx = Math.max(1, Math.ceil((view.halfW * 2 + cell * 2) * grid.scale) + 1);\r
      grid.ny = Math.max(1, Math.ceil((view.halfH * 2 + cell * 2) * grid.scale) + 1);\r
      grid.nz = Math.max(1, Math.ceil((Math.max(s.depth, s.maxSize) * 2 + cell * 2) * grid.scale) + 1);\r
      const cells = grid.nx * grid.ny * grid.nz;\r
      if (table.length < cells + 1) {\r
        table = new Int32Array(cells + 1);\r
        starts = new Int32Array(cells + 1);\r
      }\r
      table.fill(0, 0, cells + 1);\r
      for (let i = 0; i < n; i++) {\r
        const cx = clamp(Math.floor((px[i] - grid.x0) * grid.scale), 0, grid.nx - 1);\r
        const cy = clamp(Math.floor((py[i] - grid.y0) * grid.scale), 0, grid.ny - 1);\r
        const cz = clamp(Math.floor((pz[i] - grid.z0) * grid.scale), 0, grid.nz - 1);\r
        const c = (cz * grid.ny + cy) * grid.nx + cx;\r
        cellOf[i] = c;\r
        table[c + 1]++;\r
      }\r
      for (let c = 1; c <= cells; c++) table[c] += table[c - 1];\r
      starts.set(table.subarray(0, cells + 1));\r
      for (let i = 0; i < n; i++) sorted[starts[cellOf[i]]++] = i;\r
    };\r
\r
    const wall = (i: number, gap: number, nx: number, ny: number, nz: number, bounce: number, margin: number) => {\r
      if (gap >= margin || contactCount * 8 >= contacts.length) return;\r
      const approach = vx[i] * nx + vy[i] * ny + vz[i] * nz;\r
      const o = contactCount * 8;\r
      contacts[o] = i;\r
      contacts[o + 1] = -2;\r
      contacts[o + 2] = nx;\r
      contacts[o + 3] = ny;\r
      contacts[o + 4] = nz;\r
      contacts[o + 5] = gap;\r
      contacts[o + 6] = approach < -1.5 ? -bounce * approach : 0;\r
      contacts[o + 7] = 0;\r
      contactCount++;\r
    };\r
\r
    const findContacts = (s: Settings, dt: number, shade: boolean, margin: number) => {\r
      const heldIndex = held.index;\r
      const { nx: gx, ny: gy, nz: gz } = grid;\r
      contactCount = 0;\r
      for (let i = 0; i < n; i++) {\r
        const c = cellOf[i];\r
        const cx = c % gx;\r
        const cy = Math.floor(c / gx) % gy;\r
        const cz = Math.floor(c / (gx * gy));\r
        for (let dz = cz > 0 ? -1 : 0; dz <= (cz < gz - 1 ? 1 : 0); dz++) {\r
          for (let dy = cy > 0 ? -1 : 0; dy <= (cy < gy - 1 ? 1 : 0); dy++) {\r
            const row = ((cz + dz) * gy + cy + dy) * gx;\r
            for (let dx = cx > 0 ? -1 : 0; dx <= (cx < gx - 1 ? 1 : 0); dx++) {\r
              const cell = row + cx + dx;\r
              for (let k = table[cell]; k < table[cell + 1]; k++) {\r
                const j = sorted[k];\r
                if (j <= i) continue;\r
                const ddx = px[j] - px[i];\r
                const ddy = py[j] - py[i];\r
                const ddz = pz[j] - pz[i];\r
                const d2 = ddx * ddx + ddy * ddy + ddz * ddz;\r
                const sum = rad[i] + rad[j];\r
                const reach = Math.max(sum + margin, shade ? sum * 1.4 : 0);\r
                if (d2 >= reach * reach || d2 < 1e-12) continue;\r
                const d = Math.sqrt(d2);\r
                const nx = ddx / d;\r
                const ny = ddy / d;\r
                const nz = ddz / d;\r
                if (shade) {\r
                  const w = clamp(1 - (d - sum) / (sum * 0.4), 0, 1);\r
                  occ[i * 4] += nx * w;\r
                  occ[i * 4 + 1] += ny * w;\r
                  occ[i * 4 + 2] += nz * w;\r
                  occ[i * 4 + 3] += w;\r
                  occ[j * 4] -= nx * w;\r
                  occ[j * 4 + 1] -= ny * w;\r
                  occ[j * 4 + 2] -= nz * w;\r
                  occ[j * 4 + 3] += w;\r
                }\r
                if (d >= sum + margin || contactCount * 8 >= contacts.length) continue;\r
                if (i === heldIndex && j === heldIndex) continue;\r
                const approach = (vx[j] - vx[i]) * nx + (vy[j] - vy[i]) * ny + (vz[j] - vz[i]) * nz;\r
                const o = contactCount * 8;\r
                contacts[o] = i;\r
                contacts[o + 1] = j;\r
                contacts[o + 2] = nx;\r
                contacts[o + 3] = ny;\r
                contacts[o + 4] = nz;\r
                contacts[o + 5] = d - sum;\r
                contacts[o + 6] = approach < -1.5 ? -s.bounce * approach : 0;\r
                contacts[o + 7] = 0;\r
                contactCount++;\r
              }\r
            }\r
          }\r
        }\r
        if (i !== heldIndex) {\r
          const r = rad[i];\r
          const zr = Math.max(s.depth - r, 0);\r
          wall(i, px[i] + view.halfW - r, 1, 0, 0, s.wallBounce, margin);\r
          wall(i, view.halfW - r - px[i], -1, 0, 0, s.wallBounce, margin);\r
          wall(i, py[i] + view.halfH - r, 0, 1, 0, s.wallBounce, margin);\r
          if (entered[i]) wall(i, view.halfH - r - py[i], 0, -1, 0, s.wallBounce, margin);\r
          wall(i, pz[i] + zr, 0, 0, 1, s.wallBounce, margin);\r
          wall(i, zr - pz[i], 0, 0, -1, s.wallBounce, margin);\r
        }\r
        if (cursor.r > 0.01 && i !== heldIndex && contactCount * 8 < contacts.length) {\r
          const ddx = px[i] - cursor.x;\r
          const ddy = py[i] - cursor.y;\r
          const ddz = pz[i] - cursor.z;\r
          const sum = rad[i] + cursor.r;\r
          const d2 = ddx * ddx + ddy * ddy + ddz * ddz;\r
          if (d2 < (sum + margin) * (sum + margin) && d2 > 1e-12) {\r
            const d = Math.sqrt(d2);\r
            const nx = ddx / d;\r
            const ny = ddy / d;\r
            const nz = ddz / d;\r
            const approach = (vx[i] - cursor.vx) * nx + (vy[i] - cursor.vy) * ny + vz[i] * nz;\r
            const o = contactCount * 8;\r
            contacts[o] = i;\r
            contacts[o + 1] = -1;\r
            contacts[o + 2] = nx;\r
            contacts[o + 3] = ny;\r
            contacts[o + 4] = nz;\r
            contacts[o + 5] = d - sum;\r
            contacts[o + 6] = approach < -1.5 ? -s.bounce * approach : 0;\r
            contacts[o + 7] = 0;\r
            contactCount++;\r
          }\r
        }\r
      }\r
    };\r
\r
    const solveVelocities = (dt: number) => {\r
      const heldIndex = held.index;\r
      const iterations = n > 800 ? 5 : 8;\r
      for (let iteration = 0; iteration < iterations; iteration++) {\r
        for (let c = 0; c < contactCount; c++) {\r
          const o = c * 8;\r
          const i = contacts[o];\r
          const j = contacts[o + 1];\r
          const nx = contacts[o + 2];\r
          const ny = contacts[o + 3];\r
          const nz = contacts[o + 4];\r
          const gap = contacts[o + 5];\r
          const target = gap > 0 ? -gap / dt : contacts[o + 6];\r
          const before = contacts[o + 7];\r
          if (j < 0) {\r
            const vn =\r
              j === -1\r
                ? (vx[i] - cursor.vx) * nx + (vy[i] - cursor.vy) * ny + vz[i] * nz\r
                : vx[i] * nx + vy[i] * ny + vz[i] * nz;\r
            const after = Math.max(before + target - vn, 0);\r
            const change = after - before;\r
            contacts[o + 7] = after;\r
            vx[i] += change * nx;\r
            vy[i] += change * ny;\r
            vz[i] += change * nz;\r
            continue;\r
          }\r
          const wi = i === heldIndex ? 0 : inv[i];\r
          const wj = j === heldIndex ? 0 : inv[j];\r
          const w = wi + wj;\r
          if (w <= 0) continue;\r
          const vn = (vx[j] - vx[i]) * nx + (vy[j] - vy[i]) * ny + (vz[j] - vz[i]) * nz;\r
          const after = Math.max(before + (target - vn) / w, 0);\r
          const change = after - before;\r
          contacts[o + 7] = after;\r
          vx[i] -= change * wi * nx;\r
          vy[i] -= change * wi * ny;\r
          vz[i] -= change * wi * nz;\r
          vx[j] += change * wj * nx;\r
          vy[j] += change * wj * ny;\r
          vz[j] += change * wj * nz;\r
        }\r
      }\r
    };\r
\r
    const correctPositions = () => {\r
      const heldIndex = held.index;\r
      for (let pass = 0; pass < 2; pass++) {\r
        for (let c = 0; c < contactCount; c++) {\r
          const o = c * 8;\r
          const i = contacts[o];\r
          const j = contacts[o + 1];\r
          if (j === -2) continue;\r
          if (j < 0) {\r
            const ddx = px[i] - cursor.x;\r
            const ddy = py[i] - cursor.y;\r
            const ddz = pz[i] - cursor.z;\r
            const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);\r
            const overlap = rad[i] + cursor.r - d - SLOP;\r
            if (overlap <= 0 || d < 1e-6) continue;\r
            const k = (overlap * 0.5) / d;\r
            px[i] += ddx * k;\r
            py[i] += ddy * k;\r
            pz[i] += ddz * k;\r
            continue;\r
          }\r
          const ddx = px[j] - px[i];\r
          const ddy = py[j] - py[i];\r
          const ddz = pz[j] - pz[i];\r
          const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);\r
          const overlap = rad[i] + rad[j] - d - SLOP;\r
          if (overlap <= 0 || d < 1e-6) continue;\r
          const wi = i === heldIndex ? 0 : inv[i];\r
          const wj = j === heldIndex ? 0 : inv[j];\r
          const w = wi + wj;\r
          if (w <= 0) continue;\r
          const k = (overlap * 0.3) / (d * w);\r
          px[i] -= ddx * k * wi;\r
          py[i] -= ddy * k * wi;\r
          pz[i] -= ddz * k * wi;\r
          px[j] += ddx * k * wj;\r
          py[j] += ddy * k * wj;\r
          pz[j] += ddz * k * wj;\r
        }\r
      }\r
    };\r
\r
    const walls = (s: Settings) => {\r
      const hw = view.halfW;\r
      const hh = view.halfH;\r
      const e = s.wallBounce;\r
      for (let i = 0; i < n; i++) {\r
        const r = rad[i];\r
        if (px[i] < -hw + r) {\r
          px[i] = -hw + r;\r
          if (vx[i] < 0) vx[i] = vx[i] < -1.5 ? -vx[i] * e : 0;\r
        } else if (px[i] > hw - r) {\r
          px[i] = hw - r;\r
          if (vx[i] > 0) vx[i] = vx[i] > 1.5 ? -vx[i] * e : 0;\r
        }\r
        if (py[i] < -hh + r) {\r
          py[i] = -hh + r;\r
          if (vy[i] < 0) vy[i] = vy[i] < -1.5 ? -vy[i] * e : 0;\r
          vx[i] *= 0.995;\r
          vz[i] *= 0.995;\r
        } else if (entered[i] && py[i] > hh - r) {\r
          py[i] = hh - r;\r
          if (vy[i] > 0) vy[i] = vy[i] > 1.5 ? -vy[i] * e : 0;\r
        }\r
        if (!entered[i] && py[i] < hh - r) entered[i] = 1;\r
        const zr = Math.max(s.depth - r, 0);\r
        if (pz[i] < -zr) {\r
          pz[i] = -zr;\r
          if (vz[i] < 0) vz[i] = vz[i] < -1.5 ? -vz[i] * e : 0;\r
        } else if (pz[i] > zr) {\r
          pz[i] = zr;\r
          if (vz[i] > 0) vz[i] = vz[i] > 1.5 ? -vz[i] * e : 0;\r
        }\r
      }\r
    };\r
\r
    const step = (s: Settings, dt: number, shade: boolean) => {\r
      const g = s.gravity * 45;\r
      const damp = Math.pow(s.friction, dt * 60) * (glide > 0 ? Math.exp(-2.2 * dt) : 1);\r
      const wander = reduce ? 0 : s.drift * 2.2;\r
      const biggest = s.maxSize * view.fit;\r
      const margin = biggest * 0.3;\r
      if (contacts.length < n * 96) contacts = new Float32Array(n * 96);\r
      for (let i = 0; i < n; i++) {\r
        if (i === held.index) {\r
          const f = 1 - Math.exp(-dt / 0.02);\r
          vx[i] = ((held.tx - px[i]) * f) / dt;\r
          vy[i] = ((held.ty - py[i]) * f) / dt;\r
          vz[i] = 0;\r
          continue;\r
        }\r
        vy[i] -= g * dt;\r
        if (wander) {\r
          const p = phase[i];\r
          vx[i] += Math.sin(elapsed * 0.63 + p) * wander * dt;\r
          vy[i] += Math.cos(elapsed * 0.47 + p * 1.7) * wander * dt;\r
          vz[i] += Math.sin(elapsed * 0.41 + p * 2.3) * wander * dt * 0.5;\r
        }\r
        vx[i] *= damp;\r
        vy[i] *= damp;\r
        vz[i] *= damp;\r
        const sp = vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i];\r
        if (sp > MAX_SPEED * MAX_SPEED) {\r
          const f = MAX_SPEED / Math.sqrt(sp);\r
          vx[i] *= f;\r
          vy[i] *= f;\r
          vz[i] *= f;\r
        }\r
      }\r
      buildGrid(biggest * (shade ? 2.8 : 2.3), s);\r
      if (shade) occ.fill(0, 0, n * 4);\r
      findContacts(s, dt, shade, margin);\r
      solveVelocities(dt);\r
      for (let i = 0; i < n; i++) {\r
        px[i] += vx[i] * dt;\r
        py[i] += vy[i] * dt;\r
        pz[i] += vz[i] * dt;\r
      }\r
      correctPositions();\r
      walls(s);\r
      if (shade) {\r
        for (let i = 0; i < n; i++) {\r
          const gap = py[i] - rad[i] + view.halfH;\r
          const reach = rad[i] * 0.5;\r
          if (gap >= reach) continue;\r
          const w = 1 - Math.max(gap, 0) / reach;\r
          occ[i * 4 + 1] -= w;\r
          occ[i * 4 + 3] += w;\r
        }\r
      }\r
      if (held.index >= 0) {\r
        const i = held.index;\r
        held.vx += (vx[i] - held.vx) * (1 - Math.exp(-dt / 0.05));\r
        held.vy += (vy[i] - held.vy) * (1 - Math.exp(-dt / 0.05));\r
      }\r
    };\r
\r
    const rayTo = (clientX: number, clientY: number) => {\r
      const rect = container.getBoundingClientRect();\r
      const nx = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;\r
      const ny = 1 - ((clientY - rect.top) / Math.max(rect.height, 1)) * 2;\r
      return [nx * view.tan * (view.width / view.height), ny * view.tan, -1];\r
    };\r
\r
    const onPlane = (ray: number[], z: number) => {\r
      const t = (z - CAMERA_Z) / ray[2];\r
      return [ray[0] * t, ray[1] * t];\r
    };\r
\r
    const pick = (ray: number[]) => {\r
      const len = Math.hypot(ray[0], ray[1], ray[2]);\r
      const dx = ray[0] / len;\r
      const dy = ray[1] / len;\r
      const dz = ray[2] / len;\r
      let best = -1;\r
      let bestT = Infinity;\r
      for (let i = 0; i < n; i++) {\r
        const ox = -px[i];\r
        const oy = -py[i];\r
        const oz = CAMERA_Z - pz[i];\r
        const b = ox * dx + oy * dy + oz * dz;\r
        const r = rad[i] * 1.15;\r
        const c = ox * ox + oy * oy + oz * oz - r * r;\r
        const disc = b * b - c;\r
        if (disc < 0) continue;\r
        const t = -b - Math.sqrt(disc);\r
        if (t > 0 && t < bestT) {\r
          bestT = t;\r
          best = i;\r
        }\r
      }\r
      return best;\r
    };\r
\r
    const burst = (x: number, y: number) => {\r
      const s = settingsRef.current;\r
      const reach = view.halfH * 0.7;\r
      for (let i = 0; i < n; i++) {\r
        const dx = px[i] - x;\r
        const dy = py[i] - y;\r
        const dz = pz[i];\r
        const d = Math.hypot(dx, dy, dz);\r
        if (d >= reach || d < 1e-4) continue;\r
        const f = Math.pow(1 - d / reach, 2) * 26 * (1 + 0.6 / (rad[i] + 0.4));\r
        vx[i] += (dx / d) * f;\r
        vy[i] += (dy / d) * f + f * 0.25;\r
        vz[i] += (dz / d) * f * 0.5;\r
      }\r
      light.x = x;\r
      light.y = y;\r
      light.z = Math.max(s.depth, 1) + 1.5;\r
      light.flash = 1;\r
    };\r
\r
    let sizedDpr = settingsRef.current.dpr;\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      sizedDpr = s.dpr;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      const aspect = view.width / view.height;\r
      const base = Math.tan((FOV * Math.PI) / 360);\r
      view.tan = aspect > MAX_ASPECT ? (base * MAX_ASPECT) / aspect : base;\r
      view.halfH = view.tan * CAMERA_Z;\r
      view.halfW = view.halfH * aspect;\r
      view.fit = clamp(Math.sqrt((view.halfW * view.halfH) / (base * base * CAMERA_Z * CAMERA_Z * MAX_ASPECT)), 0.4, 1);\r
      const f = 1 / view.tan;\r
      const near = 1;\r
      const far = 80;\r
      projection.fill(0);\r
      projection[0] = f / aspect;\r
      projection[5] = f;\r
      projection[10] = (far + near) / (near - far);\r
      projection[11] = -1;\r
      projection[14] = (2 * far * near) / (near - far);\r
      if (!n) sync(s, true);\r
      draw();\r
      wake();\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const mat = MATERIALS[s.material];\r
      let count = 0;\r
      const total = n + 1;\r
      for (let a = 1; a < total; a++) {\r
        const item = order[a];\r
        const z = item === n ? cursor.z : pz[item];\r
        let b = a - 1;\r
        while (b >= 0 && (order[b] === n ? cursor.z : pz[order[b]]) > z) {\r
          order[b + 1] = order[b];\r
          b--;\r
        }\r
        order[b + 1] = item;\r
      }\r
      for (let k = 0; k < total; k++) {\r
        const i = order[k];\r
        const o = count * STRIDE;\r
        if (i === n) {\r
          if (cursor.r < 0.01 || !s.followCursor) continue;\r
          const c = palette[0] || [1, 1, 1];\r
          data[o] = cursor.x;\r
          data[o + 1] = cursor.y;\r
          data[o + 2] = cursor.z;\r
          data[o + 3] = cursor.r;\r
          data[o + 4] = c[0];\r
          data[o + 5] = c[1];\r
          data[o + 6] = c[2];\r
          data[o + 7] = 1;\r
          data[o + 8] = 0;\r
          data[o + 9] = 0;\r
          data[o + 10] = 0;\r
          data[o + 11] = 0;\r
        } else {\r
          const c = palette[tone[i] % palette.length];\r
          data[o] = px[i];\r
          data[o + 1] = py[i];\r
          data[o + 2] = pz[i];\r
          data[o + 3] = rad[i];\r
          data[o + 4] = c[0];\r
          data[o + 5] = c[1];\r
          data[o + 6] = c[2];\r
          data[o + 7] = 0;\r
          const w = occ[i * 4 + 3];\r
          const len = Math.hypot(occ[i * 4], occ[i * 4 + 1], occ[i * 4 + 2]) || 1;\r
          data[o + 8] = occ[i * 4] / len;\r
          data[o + 9] = occ[i * 4 + 1] / len;\r
          data[o + 10] = occ[i * 4 + 2] / len;\r
          data[o + 11] = Math.min(w * 0.55, 1);\r
        }\r
        count++;\r
      }\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clearDepth(1);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!count) return;\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.depthFunc(gl.LEQUAL);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      gl.useProgram(shader.program);\r
      gl.uniformMatrix4fv(u.uProj, false, projection);\r
      gl.uniform1f(u.uCameraZ, CAMERA_Z);\r
      gl.uniform1f(u.uPixel, (2 * view.tan) / canvas.height);\r
      const lc = toLinear(s.lightColor);\r
      const power = s.lightIntensity * 60 * (1 + light.flash * 3);\r
      gl.uniform3f(u.uLight, lc[0] * power, lc[1] * power, lc[2] * power);\r
      gl.uniform3f(u.uLightPos, light.x, light.y, light.z - CAMERA_Z);\r
      gl.uniform1f(u.uExposure, s.exposure);\r
      gl.uniform1f(u.uShadow, s.shadows);\r
      gl.uniform4f(u.uSurface, mat.roughness, mat.metalness, mat.coat, mat.coatRoughness);\r
      gl.uniform2f(u.uExtra, mat.scatter, mat.frost);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instances);\r
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, count * STRIDE);\r
      gl.bindVertexArray(vao);\r
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      if (s.dpr !== sizedDpr) resize();\r
      const dt = last ? clamp((now - last) / 1000, 0, 1 / 20) : 1 / 60;\r
      last = now;\r
      elapsed += dt;\r
      glide = Math.max(0, glide - dt);\r
      sync(s, false);\r
      const targetR = s.followCursor && pointer.inside && held.index < 0 ? s.cursorSize * view.fit : 0;\r
      cursor.r += (targetR - cursor.r) * (1 - Math.exp(-dt / 0.12));\r
      const follow = 1 - Math.exp(-dt / 0.06);\r
      const fromX = cursor.x;\r
      const fromY = cursor.y;\r
      cursor.x += (cursor.tx - cursor.x) * follow;\r
      cursor.y += (cursor.ty - cursor.y) * follow;\r
      cursor.vx = clamp((cursor.x - fromX) / Math.max(dt, 1e-3), -MAX_SPEED, MAX_SPEED);\r
      cursor.vy = clamp((cursor.y - fromY) / Math.max(dt, 1e-3), -MAX_SPEED, MAX_SPEED);\r
      const restX = 0;\r
      const restY = view.halfH * 0.75;\r
      const restZ = s.depth + 4;\r
      const lightTarget = pointer.inside\r
        ? [cursor.x, cursor.y, s.followCursor ? cursor.z : 1.5]\r
        : light.flash > 0.05\r
          ? [light.x, light.y, light.z]\r
          : [restX, restY, restZ];\r
      const lf = 1 - Math.exp(-dt / 0.08);\r
      light.x += (lightTarget[0] - light.x) * lf;\r
      light.y += (lightTarget[1] - light.y) * lf;\r
      light.z += (lightTarget[2] - light.z) * lf;\r
      light.flash *= Math.exp(-dt / 0.3);\r
      if (dt > 1e-4) {\r
        const steps = Math.min(6, Math.max(1, Math.ceil(dt / (1 / 180))));\r
        const h = dt / steps;\r
        for (let k = 0; k < steps; k++) step(s, h, k === steps - 1);\r
      }\r
      draw();\r
      let moved = 0;\r
      for (let i = 0; i < n; i++) {\r
        const k = i * 3;\r
        const d = Math.abs(px[i] - still[k]) + Math.abs(py[i] - still[k + 1]) + Math.abs(pz[i] - still[k + 2]);\r
        if (d > moved) moved = d;\r
        still[k] = px[i];\r
        still[k + 1] = py[i];\r
        still[k + 2] = pz[i];\r
      }\r
      const motion = moved / Math.max(dt, 1e-3);\r
      const busy =\r
        motion > 0.6 ||\r
        pointer.inside ||\r
        held.index >= 0 ||\r
        light.flash > 0.01 ||\r
        glide > 0 ||\r
        cursor.r > 0.01 ||\r
        (s.drift > 0 && !reduce);\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 0.8) raf = requestAnimationFrame(frame);\r
    };\r
\r
    function wake() {\r
      quiet = 0;\r
      if (!raf && visible && !document.hidden) {\r
        last = 0;\r
        raf = requestAnimationFrame(frame);\r
      }\r
    }\r
\r
    const inside = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
    };\r
\r
    const aim = (event: PointerEvent) => {\r
      const ray = rayTo(event.clientX, event.clientY);\r
      const [x, y] = onPlane(ray, cursor.z);\r
      cursor.tx = x;\r
      cursor.ty = y;\r
      if (held.index >= 0) {\r
        const [hx, hy] = onPlane(ray, pz[held.index]);\r
        held.tx = hx - held.ox;\r
        held.ty = hy - held.oy;\r
      }\r
      return ray;\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const was = pointer.inside;\r
      pointer.inside = inside(event) || held.index >= 0;\r
      if (pointer.inside) {\r
        aim(event);\r
        if (!was) {\r
          cursor.x = cursor.tx;\r
          cursor.y = cursor.ty;\r
        }\r
        if (pointer.down && Math.hypot(event.clientX - pointer.downX, event.clientY - pointer.downY) > 6)\r
          pointer.moved = true;\r
      }\r
      if (pointer.inside || was) wake();\r
    };\r
\r
    const interactive = (target: EventTarget | null) =>\r
      target instanceof Element && target.closest('a, button, input, textarea, select, label, [role="button"]');\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      if (event.button !== 0 || !inside(event) || interactive(event.target)) return;\r
      const s = settingsRef.current;\r
      pointer.down = true;\r
      pointer.moved = false;\r
      pointer.downX = event.clientX;\r
      pointer.downY = event.clientY;\r
      pointer.downAt = performance.now();\r
      const ray = aim(event);\r
      if (s.grab) {\r
        const i = pick(ray);\r
        if (i >= 0) {\r
          const [hx, hy] = onPlane(ray, pz[i]);\r
          held.index = i;\r
          held.ox = hx - px[i];\r
          held.oy = hy - py[i];\r
          held.tx = px[i];\r
          held.ty = py[i];\r
          held.vx = 0;\r
          held.vy = 0;\r
          if (event.pointerType === 'mouse') event.preventDefault();\r
        }\r
      }\r
      wake();\r
    };\r
\r
    const release = (event: PointerEvent | null) => {\r
      const s = settingsRef.current;\r
      if (held.index >= 0) {\r
        const i = held.index;\r
        const sp = Math.hypot(held.vx, held.vy);\r
        const k = sp > 22 ? 22 / sp : 1;\r
        vx[i] = held.vx * k;\r
        vy[i] = held.vy * k;\r
        held.index = -1;\r
        entered[i] = 1;\r
      } else if (\r
        event &&\r
        pointer.down &&\r
        !pointer.moved &&\r
        performance.now() - pointer.downAt < 400 &&\r
        s.clickEffect === 'burst' &&\r
        !reduce &&\r
        inside(event)\r
      ) {\r
        const [x, y] = onPlane(rayTo(event.clientX, event.clientY), 0);\r
        burst(x, y);\r
      }\r
      pointer.down = false;\r
      wake();\r
    };\r
\r
    const onPointerUp = (event: PointerEvent) => release(event);\r
    const onPointerCancel = () => release(null);\r
    const onPointerLeave = () => {\r
      pointer.inside = held.index >= 0;\r
      wake();\r
    };\r
    const onVisibility = () => wake();\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const intersection = new IntersectionObserver(entries => {\r
      visible = entries.some(entry => entry.isIntersecting);\r
      if (visible) wake();\r
    });\r
    intersection.observe(container);\r
    window.addEventListener('pointermove', onPointerMove, { passive: true });\r
    window.addEventListener('pointerdown', onPointerDown);\r
    window.addEventListener('pointerup', onPointerUp, { passive: true });\r
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });\r
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wakeRef.current = wake;\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      window.removeEventListener('pointerdown', onPointerDown);\r
      window.removeEventListener('pointerup', onPointerUp);\r
      window.removeEventListener('pointercancel', onPointerCancel);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(quad);\r
      gl.deleteBuffer(instances);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      className={['relative w-full h-full overflow-hidden', className].filter(Boolean).join(' ')}\r
      style={style}\r
    >\r
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Ballpit;\r
`,o={usage:`// Component inspired by Kevin Levron:
// https://x.com/soju22/status/1858925191671271801

import Ballpit from './Ballpit';

<div style={{ position: 'relative', overflow: 'hidden', height: '500px', width: '100%' }}>
  <Ballpit
    count={200}
    colors={['#ffffff']}
    material="satin"
    gravity={0}
    drift={0.4}
    followCursor
    grab
    clickEffect="burst"
  />
</div>`,code:n,tailwind:r,tsCode:t,tsTailwind:e};export{o as ballpit};
