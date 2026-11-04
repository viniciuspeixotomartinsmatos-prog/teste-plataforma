const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './Cubes.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec3 aPosition;\r
in vec3 aNormal;\r
in vec2 aUv;\r
in vec2 aCenter;\r
in vec4 aRotation;\r
in vec2 aState;\r
uniform mat4 uProjection;\r
uniform float uSize;\r
out vec3 vNormal;\r
out vec2 vUv;\r
out float vFlash;\r
\r
vec3 turn(vec4 q, vec3 v) {\r
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\r
}\r
\r
void main() {\r
  vec3 local = turn(aRotation, aPosition * uSize * aState.y);\r
  vNormal = turn(aRotation, aNormal);\r
  vUv = aUv;\r
  vFlash = aState.x;\r
  gl_Position = uProjection * vec4(vec3(aCenter, 0.0) + local, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec3 vNormal;\r
in vec2 vUv;\r
in float vFlash;\r
uniform vec3 uFace;\r
uniform vec3 uEdge;\r
uniform vec3 uRipple;\r
uniform vec3 uLight;\r
uniform float uShading;\r
uniform float uEdgeWidth;\r
uniform float uStyle;\r
uniform float uMarks;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 span = max(fwidth(vUv), vec2(0.00001));\r
  vec2 border = min(vUv, 1.0 - vUv) / span;\r
  bool vertical = border.x < border.y;\r
  float distance = min(border.x, border.y);\r
  float halfWidth = uEdgeWidth * 0.5;\r
  float cover = 1.0 - smoothstep(halfWidth - 0.5, halfWidth + 0.5, distance);\r
  float along = vertical ? vUv.y : vUv.x;\r
  float phase = along * uMarks;\r
  float step = max(vertical ? span.y : span.x, 0.00001) * uMarks;\r
  float offset = abs(fract(phase + 0.5) - 0.5);\r
  if (uStyle > 0.5 && uStyle < 1.5) {\r
    cover *= 1.0 - smoothstep(0.25 - step, 0.25 + step, offset);\r
  } else if (uStyle > 1.5 && uStyle < 2.5) {\r
    float radius = max(uEdgeWidth * 0.9, 1.0);\r
    float dot = length(vec2(offset / step, distance));\r
    cover = 1.0 - smoothstep(radius - 0.75, radius + 0.75, dot);\r
  } else if (uStyle > 2.5) {\r
    cover = 0.0;\r
  }\r
  vec3 normal = normalize(vNormal);\r
  cover *= smoothstep(0.06, 0.28, abs(normal.z));\r
  float side = clamp(1.0 - normal.z, 0.0, 1.0);\r
  float toward = clamp(0.6 + 0.6 * dot(normalize(normal.xy + vec2(0.00001)), normalize(uLight.xy)), 0.0, 1.0);\r
  vec3 face = mix(uFace, uEdge, side * mix(0.12, 0.42, toward) * uShading);\r
  face = mix(face, uRipple, vFlash * 0.22);\r
  vec3 edge = mix(uEdge, uRipple, vFlash);\r
  vec3 color = mix(face, edge, cover);\r
  float alpha = mix(uOpacity, 1.0, cover);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const FACES = [\r
  [0, 0, 1, 1, 0, 0, 0, 1, 0],\r
  [0, 0, -1, -1, 0, 0, 0, 1, 0],\r
  [1, 0, 0, 0, 0, -1, 0, 1, 0],\r
  [-1, 0, 0, 0, 0, 1, 0, 1, 0],\r
  [0, 1, 0, 1, 0, 0, 0, 0, -1],\r
  [0, -1, 0, 1, 0, 0, 0, 0, 1]\r
];\r
\r
const buildCube = () => {\r
  const vertices = [];\r
  const indices = [];\r
  FACES.forEach(([nx, ny, nz, ux, uy, uz, vx, vy, vz], face) => {\r
    [\r
      [0, 0],\r
      [1, 0],\r
      [1, 1],\r
      [0, 1]\r
    ].forEach(([u, v]) => {\r
      vertices.push(\r
        nx * 0.5 + (u - 0.5) * ux + (v - 0.5) * vx,\r
        ny * 0.5 + (u - 0.5) * uy + (v - 0.5) * vy,\r
        nz * 0.5 + (u - 0.5) * uz + (v - 0.5) * vz,\r
        nx,\r
        ny,\r
        nz,\r
        u,\r
        v\r
      );\r
    });\r
    const base = face * 4;\r
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);\r
  });\r
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };\r
};\r
\r
const STYLES = { solid: 0, dashed: 1, dotted: 2, none: 3 };\r
const INTRO_SECONDS = 1.1;\r
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
  ['aPosition', 'aNormal', 'aUv', 'aCenter', 'aRotation', 'aState'].forEach((name, index) =>\r
    gl.bindAttribLocation(program, index, name)\r
  );\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRotation = (rx, ry, out, offset) => {\r
  const angle = Math.hypot(rx, ry);\r
  if (angle < 0.000001) {\r
    out[offset] = 0;\r
    out[offset + 1] = 0;\r
    out[offset + 2] = 0;\r
    out[offset + 3] = 1;\r
    return;\r
  }\r
  const s = Math.sin(angle / 2) / angle;\r
  out[offset] = rx * s;\r
  out[offset + 1] = ry * s;\r
  out[offset + 2] = 0;\r
  out[offset + 3] = Math.cos(angle / 2);\r
};\r
\r
const multiply = (a, b, out, offset) => {\r
  const [ax, ay, az, aw] = a;\r
  const [bx, by, bz, bw] = b;\r
  out[offset] = aw * bx + ax * bw + ay * bz - az * by;\r
  out[offset + 1] = aw * by - ax * bz + ay * bw + az * bx;\r
  out[offset + 2] = aw * bz + ax * by - ay * bx + az * bw;\r
  out[offset + 3] = aw * bw - ax * bx - ay * by - az * bz;\r
};\r
\r
const projection = (width, height, scale, perspective) => {\r
  const halfWidth = width / 2 / scale;\r
  const halfHeight = height / 2 / scale;\r
  const depth = Math.max(halfWidth, halfHeight) * 4 + 4;\r
  if (perspective <= 0.001) {\r
    return new Float32Array([1 / halfWidth, 0, 0, 0, 0, 1 / halfHeight, 0, 0, 0, 0, -1 / depth, 0, 0, 0, 0, 1]);\r
  }\r
  const fov = ((8 + perspective * 52) * Math.PI) / 180;\r
  const distance = halfHeight / Math.tan(fov / 2);\r
  const near = Math.max(0.1, distance - depth);\r
  const far = distance + depth;\r
  const f = 1 / Math.tan(fov / 2);\r
  const aspect = halfWidth / halfHeight;\r
  return new Float32Array([\r
    f / aspect,\r
    0,\r
    0,\r
    0,\r
    0,\r
    f,\r
    0,\r
    0,\r
    0,\r
    0,\r
    (far + near) / (near - far),\r
    -1,\r
    0,\r
    0,\r
    (2 * far * near) / (near - far) - ((far + near) / (near - far)) * distance,\r
    distance\r
  ]);\r
};\r
\r
export const Cubes = ({\r
  gridSize = 10,\r
  gap = 0.18,\r
  faceColor = '#120F17',\r
  edgeColor = '#ffffff',\r
  edgeWidth = 1,\r
  edgeStyle = 'solid',\r
  faceOpacity = 1,\r
  shading = 0.6,\r
  maxAngle = 45,\r
  radius = 3,\r
  speed = 1,\r
  bounce = 0.4,\r
  brush = 1,\r
  perspective = 0,\r
  autoAnimate = true,\r
  rippleOnClick = true,\r
  rippleColor = '#ffffff',\r
  rippleSpeed = 1,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    gridSize: Math.round(clamp(gridSize, 1, 40)),\r
    gap: clamp(gap, 0, 0.9),\r
    faceColor: String(faceColor),\r
    edgeColor: String(edgeColor),\r
    edgeWidth: Math.max(0, edgeWidth),\r
    edgeStyle,\r
    faceOpacity: clamp(faceOpacity, 0, 1),\r
    shading: Math.max(0, shading),\r
    maxAngle,\r
    radius: Math.max(0.5, radius),\r
    speed: Math.max(0.05, speed),\r
    bounce: clamp(bounce, 0, 1),\r
    brush: Math.max(0, brush),\r
    perspective: clamp(perspective, 0, 1),\r
    autoAnimate,\r
    rippleOnClick,\r
    rippleColor: String(rippleColor),\r
    rippleSpeed: Math.max(0.05, rippleSpeed),\r
    intro,\r
    paused,\r
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
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
\r
    const cube = buildCube();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const vertexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);\r
    const instanceBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    [\r
      [3, 2, 0],\r
      [4, 4, 8],\r
      [5, 2, 24]\r
    ].forEach(([location, size, offset]) => {\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 32, offset);\r
      gl.vertexAttribDivisor(location, 1);\r
    });\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, scale: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, moved: 0 };\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, weight: 0, primed: false };\r
    const grid = { size: 0, count: 0 };\r
    let rx = new Float32Array(0);\r
    let ry = new Float32Array(0);\r
    let wx = new Float32Array(0);\r
    let wy = new Float32Array(0);\r
    let glow = new Float32Array(0);\r
    const rings = [];\r
    let delays = new Float32Array(0);\r
    let instances = new Float32Array(0);\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 99;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const allocate = size => {\r
      if (grid.size === size) return;\r
      grid.size = size;\r
      grid.count = size * size;\r
      rx = new Float32Array(grid.count);\r
      ry = new Float32Array(grid.count);\r
      wx = new Float32Array(grid.count);\r
      wy = new Float32Array(grid.count);\r
      glow = new Float32Array(grid.count);\r
      delays = new Float32Array(grid.count);\r
      instances = new Float32Array(grid.count * 8);\r
      const center = (size - 1) / 2;\r
      for (let i = 0; i < grid.count; i++) {\r
        const col = i % size;\r
        const row = Math.floor(i / size);\r
        delays[i] = Math.hypot(col - center, row - center) / Math.max(1, size / 2);\r
      }\r
    };\r
\r
    const cellOf = i => {\r
      const size = grid.size;\r
      const center = (size - 1) / 2;\r
      return [(i % size) - center, center - Math.floor(i / size)];\r
    };\r
\r
    const toWorld = (x, y) => [(x - view.width / 2) / view.scale, (view.height / 2 - y) / view.scale];\r
\r
    const ripple = (x, y) => {\r
      const s = settingsRef.current;\r
      if (!s.rippleOnClick || reduce) return;\r
      const [ox, oy] = toWorld(x, y);\r
      rings.push({ x: ox, y: oy, born: clock });\r
      if (rings.length > 6) rings.shift();\r
      wake();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!grid.count) return;\r
\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, instances, gl.DYNAMIC_DRAW);\r
      const u = shader.uniforms;\r
      gl.uniformMatrix4fv(u.uProjection, false, projection(view.width, view.height, view.scale, s.perspective));\r
      gl.uniform1f(u.uSize, 1 - s.gap);\r
      gl.uniform3fv(u.uFace, toRgb(s.faceColor));\r
      gl.uniform3fv(u.uEdge, toRgb(s.edgeColor));\r
      gl.uniform3fv(u.uRipple, toRgb(s.rippleColor));\r
      const light = [-0.42, 0.55, 0.72];\r
      const length = Math.hypot(...light);\r
      gl.uniform3f(u.uLight, light[0] / length, light[1] / length, light[2] / length);\r
      gl.uniform1f(u.uShading, s.shading);\r
      gl.uniform1f(u.uEdgeWidth, s.edgeWidth * view.ratio);\r
      gl.uniform1f(u.uStyle, STYLES[s.edgeStyle] ?? 0);\r
      const cubePixels = (1 - s.gap) * view.scale;\r
      const spacing = s.edgeStyle === 'dotted' ? Math.max(4, s.edgeWidth * 4) : Math.max(6, s.edgeWidth * 6);\r
      gl.uniform1f(u.uMarks, Math.max(1, Math.round(cubePixels / spacing)));\r
      gl.uniform1f(u.uOpacity, s.faceOpacity);\r
\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.enable(gl.CULL_FACE);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      if (s.faceOpacity >= 0.999) {\r
        gl.depthMask(true);\r
        gl.cullFace(gl.BACK);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
      } else {\r
        gl.depthMask(false);\r
        gl.cullFace(gl.FRONT);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
        gl.cullFace(gl.BACK);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
        gl.depthMask(true);\r
      }\r
    };\r
\r
    const step = dt => {\r
      const s = settingsRef.current;\r
      allocate(s.gridSize);\r
      clock += dt;\r
      if (introClock < 99) introClock += dt;\r
\r
      const live = s.autoAnimate && !reduce && (!pointer.inside || clock - pointer.moved > 3);\r
      let goalX = cursor.x;\r
      let goalY = cursor.y;\r
      let engaged = false;\r
      if (pointer.inside && clock - pointer.moved <= 3) {\r
        [goalX, goalY] = toWorld(pointer.x, pointer.y);\r
        engaged = true;\r
      } else if (live) {\r
        const reach = grid.size * 0.42;\r
        goalX = Math.sin(clock * 0.37) * reach * Math.cos(clock * 0.11);\r
        goalY = Math.sin(clock * 0.53 + 1.2) * reach;\r
        engaged = true;\r
      }\r
      if (!cursor.primed && engaged) {\r
        cursor.x = goalX;\r
        cursor.y = goalY;\r
        cursor.primed = true;\r
      }\r
      const follow = 1 - Math.exp(-dt * 18);\r
      const prevX = cursor.x;\r
      const prevY = cursor.y;\r
      cursor.x += (goalX - cursor.x) * follow;\r
      cursor.y += (goalY - cursor.y) * follow;\r
      const blend = 1 - Math.exp(-dt * 10);\r
      cursor.vx += ((cursor.x - prevX) / Math.max(dt, 0.001) - cursor.vx) * blend;\r
      cursor.vy += ((cursor.y - prevY) / Math.max(dt, 0.001) - cursor.vy) * blend;\r
      cursor.weight += ((engaged ? 1 : 0) - cursor.weight) * (1 - Math.exp(-dt * (engaged ? 6 : 2.5)));\r
\r
      const stiffness = 160 * s.speed * s.speed;\r
      const damping = 2 * (1 - 0.82 * s.bounce) * Math.sqrt(stiffness);\r
      const maxAngle = (s.maxAngle * Math.PI) / 180;\r
      const lift = 0.8;\r
      const travel = 8 * s.rippleSpeed;\r
      const fade = Math.exp(-dt * 3.2);\r
      const reachLimit = grid.size * 1.5 + 2;\r
      for (let k = rings.length - 1; k >= 0; k--) {\r
        if ((clock - rings[k].born) * travel > reachLimit) rings.splice(k, 1);\r
      }\r
      const speedNow = Math.hypot(cursor.vx, cursor.vy);\r
      const sweepX = speedNow > 0.0001 ? -cursor.vy / speedNow : 0;\r
      const sweepY = speedNow > 0.0001 ? cursor.vx / speedNow : 0;\r
      const sweep = reduce ? 0 : Math.min(speedNow, 40) * s.brush * 1.6;\r
      let moving = false;\r
\r
      for (let i = 0; i < grid.count; i++) {\r
        const [cx, cy] = cellOf(i);\r
        const dx = cx - cursor.x;\r
        const dy = cy - cursor.y;\r
        const distance = Math.hypot(dx, dy);\r
        const t = distance / s.radius;\r
        const falloff = t < 1 ? (1 - t * t) * (1 - t * t) * cursor.weight : 0;\r
        let targetX = 0;\r
        let targetY = 0;\r
        if (falloff > 0 && distance > 0.0001) {\r
          const tilt = maxAngle * falloff * (distance / Math.hypot(distance, lift));\r
          targetX = (dy / distance) * tilt;\r
          targetY = (-dx / distance) * tilt;\r
        }\r
        if (falloff > 0 && sweep > 0) {\r
          wx[i] += sweepX * sweep * falloff * dt * 4;\r
          wy[i] += sweepY * sweep * falloff * dt * 4;\r
        }\r
        glow[i] *= fade;\r
        for (let k = 0; k < rings.length; k++) {\r
          const ring = rings[k];\r
          const ox = cx - ring.x;\r
          const oy = cy - ring.y;\r
          const reach = Math.hypot(ox, oy);\r
          const now = (clock - ring.born) * travel;\r
          if (reach > now || reach <= now - travel * dt || reach < 0.0001) continue;\r
          const strength = Math.exp(-reach / (grid.size * 0.8));\r
          wx[i] -= (oy / reach) * 13 * strength;\r
          wy[i] += (ox / reach) * 13 * strength;\r
          glow[i] = Math.max(glow[i], strength);\r
        }\r
        if (glow[i] > 0.01) moving = true;\r
        if (reduce) {\r
          rx[i] = targetX;\r
          ry[i] = targetY;\r
          wx[i] = 0;\r
          wy[i] = 0;\r
        } else {\r
          wx[i] += (stiffness * (targetX - rx[i]) - damping * wx[i]) * dt;\r
          wy[i] += (stiffness * (targetY - ry[i]) - damping * wy[i]) * dt;\r
          rx[i] += wx[i] * dt;\r
          ry[i] += wy[i] * dt;\r
        }\r
        if (\r
          Math.abs(targetX - rx[i]) + Math.abs(targetY - ry[i]) > 0.0005 ||\r
          Math.abs(wx[i]) + Math.abs(wy[i]) > 0.0005\r
        ) {\r
          moving = true;\r
        }\r
\r
        let grow = 1;\r
        let tumble = 0;\r
        if (introClock < 99) {\r
          const local = clamp((introClock - delays[i] * 0.55) / INTRO_SECONDS, 0, 1);\r
          const eased = 1 - Math.pow(1 - local, 3);\r
          grow = eased;\r
          tumble = (1 - eased) * (Math.PI / 2);\r
          if (local < 1) moving = true;\r
        }\r
\r
        const tilt = [0, 0, 0, 1];\r
        toRotation(rx[i], ry[i], tilt, 0);\r
        const turn = [Math.sin(tumble / 2), 0, 0, Math.cos(tumble / 2)];\r
        const base = i * 8;\r
        instances[base] = cx;\r
        instances[base + 1] = cy;\r
        multiply(tilt, turn, instances, base + 2);\r
        instances[base + 6] = glow[i];\r
        instances[base + 7] = grow;\r
      }\r
      if (introClock >= INTRO_SECONDS + 0.6 && introClock < 99) introClock = 99;\r
      return (\r
        moving ||\r
        live ||\r
        rings.length > 0 ||\r
        (engaged && speedNow > 0.01) ||\r
        Math.abs((engaged ? 1 : 0) - cursor.weight) > 0.002\r
      );\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const active = s.paused ? false : step(dt);\r
      render();\r
      if (active) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      view.scale = Math.min(width, height) / (s.gridSize + 0.9);\r
      canvas.width = Math.max(1, Math.round(width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(height * view.ratio));\r
      allocate(s.gridSize);\r
      if (!raf) {\r
        step(0);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside) pointer.moved = clock;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const rect = container.getBoundingClientRect();\r
      ripple(event.clientX - rect.left, event.clientY - rect.top);\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    container.addEventListener('pointerdown', onPointerDown);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastSize = settingsRef.current.gridSize;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.gridSize !== lastSize || s.dpr !== lastDpr) {\r
        lastSize = s.gridSize;\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) {\r
        step(0);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      container.removeEventListener('pointerdown', onPointerDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(vertexBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`cubes-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="cubes-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Cubes;\r
`,n=`.cubes-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
  touch-action: pan-y;\r
}\r
\r
.cubes-canvas {\r
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
const VERTEX = \`#version 300 es\r
in vec3 aPosition;\r
in vec3 aNormal;\r
in vec2 aUv;\r
in vec2 aCenter;\r
in vec4 aRotation;\r
in vec2 aState;\r
uniform mat4 uProjection;\r
uniform float uSize;\r
out vec3 vNormal;\r
out vec2 vUv;\r
out float vFlash;\r
\r
vec3 turn(vec4 q, vec3 v) {\r
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\r
}\r
\r
void main() {\r
  vec3 local = turn(aRotation, aPosition * uSize * aState.y);\r
  vNormal = turn(aRotation, aNormal);\r
  vUv = aUv;\r
  vFlash = aState.x;\r
  gl_Position = uProjection * vec4(vec3(aCenter, 0.0) + local, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec3 vNormal;\r
in vec2 vUv;\r
in float vFlash;\r
uniform vec3 uFace;\r
uniform vec3 uEdge;\r
uniform vec3 uRipple;\r
uniform vec3 uLight;\r
uniform float uShading;\r
uniform float uEdgeWidth;\r
uniform float uStyle;\r
uniform float uMarks;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 span = max(fwidth(vUv), vec2(0.00001));\r
  vec2 border = min(vUv, 1.0 - vUv) / span;\r
  bool vertical = border.x < border.y;\r
  float distance = min(border.x, border.y);\r
  float halfWidth = uEdgeWidth * 0.5;\r
  float cover = 1.0 - smoothstep(halfWidth - 0.5, halfWidth + 0.5, distance);\r
  float along = vertical ? vUv.y : vUv.x;\r
  float phase = along * uMarks;\r
  float step = max(vertical ? span.y : span.x, 0.00001) * uMarks;\r
  float offset = abs(fract(phase + 0.5) - 0.5);\r
  if (uStyle > 0.5 && uStyle < 1.5) {\r
    cover *= 1.0 - smoothstep(0.25 - step, 0.25 + step, offset);\r
  } else if (uStyle > 1.5 && uStyle < 2.5) {\r
    float radius = max(uEdgeWidth * 0.9, 1.0);\r
    float dot = length(vec2(offset / step, distance));\r
    cover = 1.0 - smoothstep(radius - 0.75, radius + 0.75, dot);\r
  } else if (uStyle > 2.5) {\r
    cover = 0.0;\r
  }\r
  vec3 normal = normalize(vNormal);\r
  cover *= smoothstep(0.06, 0.28, abs(normal.z));\r
  float side = clamp(1.0 - normal.z, 0.0, 1.0);\r
  float toward = clamp(0.6 + 0.6 * dot(normalize(normal.xy + vec2(0.00001)), normalize(uLight.xy)), 0.0, 1.0);\r
  vec3 face = mix(uFace, uEdge, side * mix(0.12, 0.42, toward) * uShading);\r
  face = mix(face, uRipple, vFlash * 0.22);\r
  vec3 edge = mix(uEdge, uRipple, vFlash);\r
  vec3 color = mix(face, edge, cover);\r
  float alpha = mix(uOpacity, 1.0, cover);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const FACES = [\r
  [0, 0, 1, 1, 0, 0, 0, 1, 0],\r
  [0, 0, -1, -1, 0, 0, 0, 1, 0],\r
  [1, 0, 0, 0, 0, -1, 0, 1, 0],\r
  [-1, 0, 0, 0, 0, 1, 0, 1, 0],\r
  [0, 1, 0, 1, 0, 0, 0, 0, -1],\r
  [0, -1, 0, 1, 0, 0, 0, 0, 1]\r
];\r
\r
const buildCube = () => {\r
  const vertices = [];\r
  const indices = [];\r
  FACES.forEach(([nx, ny, nz, ux, uy, uz, vx, vy, vz], face) => {\r
    [\r
      [0, 0],\r
      [1, 0],\r
      [1, 1],\r
      [0, 1]\r
    ].forEach(([u, v]) => {\r
      vertices.push(\r
        nx * 0.5 + (u - 0.5) * ux + (v - 0.5) * vx,\r
        ny * 0.5 + (u - 0.5) * uy + (v - 0.5) * vy,\r
        nz * 0.5 + (u - 0.5) * uz + (v - 0.5) * vz,\r
        nx,\r
        ny,\r
        nz,\r
        u,\r
        v\r
      );\r
    });\r
    const base = face * 4;\r
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);\r
  });\r
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };\r
};\r
\r
const STYLES = { solid: 0, dashed: 1, dotted: 2, none: 3 };\r
const INTRO_SECONDS = 1.1;\r
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
  ['aPosition', 'aNormal', 'aUv', 'aCenter', 'aRotation', 'aState'].forEach((name, index) =>\r
    gl.bindAttribLocation(program, index, name)\r
  );\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRotation = (rx, ry, out, offset) => {\r
  const angle = Math.hypot(rx, ry);\r
  if (angle < 0.000001) {\r
    out[offset] = 0;\r
    out[offset + 1] = 0;\r
    out[offset + 2] = 0;\r
    out[offset + 3] = 1;\r
    return;\r
  }\r
  const s = Math.sin(angle / 2) / angle;\r
  out[offset] = rx * s;\r
  out[offset + 1] = ry * s;\r
  out[offset + 2] = 0;\r
  out[offset + 3] = Math.cos(angle / 2);\r
};\r
\r
const multiply = (a, b, out, offset) => {\r
  const [ax, ay, az, aw] = a;\r
  const [bx, by, bz, bw] = b;\r
  out[offset] = aw * bx + ax * bw + ay * bz - az * by;\r
  out[offset + 1] = aw * by - ax * bz + ay * bw + az * bx;\r
  out[offset + 2] = aw * bz + ax * by - ay * bx + az * bw;\r
  out[offset + 3] = aw * bw - ax * bx - ay * by - az * bz;\r
};\r
\r
const projection = (width, height, scale, perspective) => {\r
  const halfWidth = width / 2 / scale;\r
  const halfHeight = height / 2 / scale;\r
  const depth = Math.max(halfWidth, halfHeight) * 4 + 4;\r
  if (perspective <= 0.001) {\r
    return new Float32Array([1 / halfWidth, 0, 0, 0, 0, 1 / halfHeight, 0, 0, 0, 0, -1 / depth, 0, 0, 0, 0, 1]);\r
  }\r
  const fov = ((8 + perspective * 52) * Math.PI) / 180;\r
  const distance = halfHeight / Math.tan(fov / 2);\r
  const near = Math.max(0.1, distance - depth);\r
  const far = distance + depth;\r
  const f = 1 / Math.tan(fov / 2);\r
  const aspect = halfWidth / halfHeight;\r
  return new Float32Array([\r
    f / aspect,\r
    0,\r
    0,\r
    0,\r
    0,\r
    f,\r
    0,\r
    0,\r
    0,\r
    0,\r
    (far + near) / (near - far),\r
    -1,\r
    0,\r
    0,\r
    (2 * far * near) / (near - far) - ((far + near) / (near - far)) * distance,\r
    distance\r
  ]);\r
};\r
\r
export const Cubes = ({\r
  gridSize = 10,\r
  gap = 0.18,\r
  faceColor = '#120F17',\r
  edgeColor = '#ffffff',\r
  edgeWidth = 1,\r
  edgeStyle = 'solid',\r
  faceOpacity = 1,\r
  shading = 0.6,\r
  maxAngle = 45,\r
  radius = 3,\r
  speed = 1,\r
  bounce = 0.4,\r
  brush = 1,\r
  perspective = 0,\r
  autoAnimate = true,\r
  rippleOnClick = true,\r
  rippleColor = '#ffffff',\r
  rippleSpeed = 1,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    gridSize: Math.round(clamp(gridSize, 1, 40)),\r
    gap: clamp(gap, 0, 0.9),\r
    faceColor: String(faceColor),\r
    edgeColor: String(edgeColor),\r
    edgeWidth: Math.max(0, edgeWidth),\r
    edgeStyle,\r
    faceOpacity: clamp(faceOpacity, 0, 1),\r
    shading: Math.max(0, shading),\r
    maxAngle,\r
    radius: Math.max(0.5, radius),\r
    speed: Math.max(0.05, speed),\r
    bounce: clamp(bounce, 0, 1),\r
    brush: Math.max(0, brush),\r
    perspective: clamp(perspective, 0, 1),\r
    autoAnimate,\r
    rippleOnClick,\r
    rippleColor: String(rippleColor),\r
    rippleSpeed: Math.max(0.05, rippleSpeed),\r
    intro,\r
    paused,\r
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
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
\r
    const cube = buildCube();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const vertexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);\r
    const instanceBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    [\r
      [3, 2, 0],\r
      [4, 4, 8],\r
      [5, 2, 24]\r
    ].forEach(([location, size, offset]) => {\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 32, offset);\r
      gl.vertexAttribDivisor(location, 1);\r
    });\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map();\r
    const toRgb = value => {\r
      if (colorCache.has(value)) return colorCache.get(value);\r
      let rgb = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, scale: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, moved: 0 };\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, weight: 0, primed: false };\r
    const grid = { size: 0, count: 0 };\r
    let rx = new Float32Array(0);\r
    let ry = new Float32Array(0);\r
    let wx = new Float32Array(0);\r
    let wy = new Float32Array(0);\r
    let glow = new Float32Array(0);\r
    const rings = [];\r
    let delays = new Float32Array(0);\r
    let instances = new Float32Array(0);\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 99;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const allocate = size => {\r
      if (grid.size === size) return;\r
      grid.size = size;\r
      grid.count = size * size;\r
      rx = new Float32Array(grid.count);\r
      ry = new Float32Array(grid.count);\r
      wx = new Float32Array(grid.count);\r
      wy = new Float32Array(grid.count);\r
      glow = new Float32Array(grid.count);\r
      delays = new Float32Array(grid.count);\r
      instances = new Float32Array(grid.count * 8);\r
      const center = (size - 1) / 2;\r
      for (let i = 0; i < grid.count; i++) {\r
        const col = i % size;\r
        const row = Math.floor(i / size);\r
        delays[i] = Math.hypot(col - center, row - center) / Math.max(1, size / 2);\r
      }\r
    };\r
\r
    const cellOf = i => {\r
      const size = grid.size;\r
      const center = (size - 1) / 2;\r
      return [(i % size) - center, center - Math.floor(i / size)];\r
    };\r
\r
    const toWorld = (x, y) => [(x - view.width / 2) / view.scale, (view.height / 2 - y) / view.scale];\r
\r
    const ripple = (x, y) => {\r
      const s = settingsRef.current;\r
      if (!s.rippleOnClick || reduce) return;\r
      const [ox, oy] = toWorld(x, y);\r
      rings.push({ x: ox, y: oy, born: clock });\r
      if (rings.length > 6) rings.shift();\r
      wake();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!grid.count) return;\r
\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, instances, gl.DYNAMIC_DRAW);\r
      const u = shader.uniforms;\r
      gl.uniformMatrix4fv(u.uProjection, false, projection(view.width, view.height, view.scale, s.perspective));\r
      gl.uniform1f(u.uSize, 1 - s.gap);\r
      gl.uniform3fv(u.uFace, toRgb(s.faceColor));\r
      gl.uniform3fv(u.uEdge, toRgb(s.edgeColor));\r
      gl.uniform3fv(u.uRipple, toRgb(s.rippleColor));\r
      const light = [-0.42, 0.55, 0.72];\r
      const length = Math.hypot(...light);\r
      gl.uniform3f(u.uLight, light[0] / length, light[1] / length, light[2] / length);\r
      gl.uniform1f(u.uShading, s.shading);\r
      gl.uniform1f(u.uEdgeWidth, s.edgeWidth * view.ratio);\r
      gl.uniform1f(u.uStyle, STYLES[s.edgeStyle] ?? 0);\r
      const cubePixels = (1 - s.gap) * view.scale;\r
      const spacing = s.edgeStyle === 'dotted' ? Math.max(4, s.edgeWidth * 4) : Math.max(6, s.edgeWidth * 6);\r
      gl.uniform1f(u.uMarks, Math.max(1, Math.round(cubePixels / spacing)));\r
      gl.uniform1f(u.uOpacity, s.faceOpacity);\r
\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.enable(gl.CULL_FACE);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      if (s.faceOpacity >= 0.999) {\r
        gl.depthMask(true);\r
        gl.cullFace(gl.BACK);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
      } else {\r
        gl.depthMask(false);\r
        gl.cullFace(gl.FRONT);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
        gl.cullFace(gl.BACK);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
        gl.depthMask(true);\r
      }\r
    };\r
\r
    const step = dt => {\r
      const s = settingsRef.current;\r
      allocate(s.gridSize);\r
      clock += dt;\r
      if (introClock < 99) introClock += dt;\r
\r
      const live = s.autoAnimate && !reduce && (!pointer.inside || clock - pointer.moved > 3);\r
      let goalX = cursor.x;\r
      let goalY = cursor.y;\r
      let engaged = false;\r
      if (pointer.inside && clock - pointer.moved <= 3) {\r
        [goalX, goalY] = toWorld(pointer.x, pointer.y);\r
        engaged = true;\r
      } else if (live) {\r
        const reach = grid.size * 0.42;\r
        goalX = Math.sin(clock * 0.37) * reach * Math.cos(clock * 0.11);\r
        goalY = Math.sin(clock * 0.53 + 1.2) * reach;\r
        engaged = true;\r
      }\r
      if (!cursor.primed && engaged) {\r
        cursor.x = goalX;\r
        cursor.y = goalY;\r
        cursor.primed = true;\r
      }\r
      const follow = 1 - Math.exp(-dt * 18);\r
      const prevX = cursor.x;\r
      const prevY = cursor.y;\r
      cursor.x += (goalX - cursor.x) * follow;\r
      cursor.y += (goalY - cursor.y) * follow;\r
      const blend = 1 - Math.exp(-dt * 10);\r
      cursor.vx += ((cursor.x - prevX) / Math.max(dt, 0.001) - cursor.vx) * blend;\r
      cursor.vy += ((cursor.y - prevY) / Math.max(dt, 0.001) - cursor.vy) * blend;\r
      cursor.weight += ((engaged ? 1 : 0) - cursor.weight) * (1 - Math.exp(-dt * (engaged ? 6 : 2.5)));\r
\r
      const stiffness = 160 * s.speed * s.speed;\r
      const damping = 2 * (1 - 0.82 * s.bounce) * Math.sqrt(stiffness);\r
      const maxAngle = (s.maxAngle * Math.PI) / 180;\r
      const lift = 0.8;\r
      const travel = 8 * s.rippleSpeed;\r
      const fade = Math.exp(-dt * 3.2);\r
      const reachLimit = grid.size * 1.5 + 2;\r
      for (let k = rings.length - 1; k >= 0; k--) {\r
        if ((clock - rings[k].born) * travel > reachLimit) rings.splice(k, 1);\r
      }\r
      const speedNow = Math.hypot(cursor.vx, cursor.vy);\r
      const sweepX = speedNow > 0.0001 ? -cursor.vy / speedNow : 0;\r
      const sweepY = speedNow > 0.0001 ? cursor.vx / speedNow : 0;\r
      const sweep = reduce ? 0 : Math.min(speedNow, 40) * s.brush * 1.6;\r
      let moving = false;\r
\r
      for (let i = 0; i < grid.count; i++) {\r
        const [cx, cy] = cellOf(i);\r
        const dx = cx - cursor.x;\r
        const dy = cy - cursor.y;\r
        const distance = Math.hypot(dx, dy);\r
        const t = distance / s.radius;\r
        const falloff = t < 1 ? (1 - t * t) * (1 - t * t) * cursor.weight : 0;\r
        let targetX = 0;\r
        let targetY = 0;\r
        if (falloff > 0 && distance > 0.0001) {\r
          const tilt = maxAngle * falloff * (distance / Math.hypot(distance, lift));\r
          targetX = (dy / distance) * tilt;\r
          targetY = (-dx / distance) * tilt;\r
        }\r
        if (falloff > 0 && sweep > 0) {\r
          wx[i] += sweepX * sweep * falloff * dt * 4;\r
          wy[i] += sweepY * sweep * falloff * dt * 4;\r
        }\r
        glow[i] *= fade;\r
        for (let k = 0; k < rings.length; k++) {\r
          const ring = rings[k];\r
          const ox = cx - ring.x;\r
          const oy = cy - ring.y;\r
          const reach = Math.hypot(ox, oy);\r
          const now = (clock - ring.born) * travel;\r
          if (reach > now || reach <= now - travel * dt || reach < 0.0001) continue;\r
          const strength = Math.exp(-reach / (grid.size * 0.8));\r
          wx[i] -= (oy / reach) * 13 * strength;\r
          wy[i] += (ox / reach) * 13 * strength;\r
          glow[i] = Math.max(glow[i], strength);\r
        }\r
        if (glow[i] > 0.01) moving = true;\r
        if (reduce) {\r
          rx[i] = targetX;\r
          ry[i] = targetY;\r
          wx[i] = 0;\r
          wy[i] = 0;\r
        } else {\r
          wx[i] += (stiffness * (targetX - rx[i]) - damping * wx[i]) * dt;\r
          wy[i] += (stiffness * (targetY - ry[i]) - damping * wy[i]) * dt;\r
          rx[i] += wx[i] * dt;\r
          ry[i] += wy[i] * dt;\r
        }\r
        if (\r
          Math.abs(targetX - rx[i]) + Math.abs(targetY - ry[i]) > 0.0005 ||\r
          Math.abs(wx[i]) + Math.abs(wy[i]) > 0.0005\r
        ) {\r
          moving = true;\r
        }\r
\r
        let grow = 1;\r
        let tumble = 0;\r
        if (introClock < 99) {\r
          const local = clamp((introClock - delays[i] * 0.55) / INTRO_SECONDS, 0, 1);\r
          const eased = 1 - Math.pow(1 - local, 3);\r
          grow = eased;\r
          tumble = (1 - eased) * (Math.PI / 2);\r
          if (local < 1) moving = true;\r
        }\r
\r
        const tilt = [0, 0, 0, 1];\r
        toRotation(rx[i], ry[i], tilt, 0);\r
        const turn = [Math.sin(tumble / 2), 0, 0, Math.cos(tumble / 2)];\r
        const base = i * 8;\r
        instances[base] = cx;\r
        instances[base + 1] = cy;\r
        multiply(tilt, turn, instances, base + 2);\r
        instances[base + 6] = glow[i];\r
        instances[base + 7] = grow;\r
      }\r
      if (introClock >= INTRO_SECONDS + 0.6 && introClock < 99) introClock = 99;\r
      return (\r
        moving ||\r
        live ||\r
        rings.length > 0 ||\r
        (engaged && speedNow > 0.01) ||\r
        Math.abs((engaged ? 1 : 0) - cursor.weight) > 0.002\r
      );\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const active = s.paused ? false : step(dt);\r
      render();\r
      if (active) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      view.scale = Math.min(width, height) / (s.gridSize + 0.9);\r
      canvas.width = Math.max(1, Math.round(width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(height * view.ratio));\r
      allocate(s.gridSize);\r
      if (!raf) {\r
        step(0);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside) pointer.moved = clock;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const rect = container.getBoundingClientRect();\r
      ripple(event.clientX - rect.left, event.clientY - rect.top);\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    container.addEventListener('pointerdown', onPointerDown);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastSize = settingsRef.current.gridSize;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.gridSize !== lastSize || s.dpr !== lastDpr) {\r
        lastSize = s.gridSize;\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) {\r
        step(0);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      container.removeEventListener('pointerdown', onPointerDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(vertexBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      className={['relative h-full w-full touch-pan-y overflow-hidden', className].filter(Boolean).join(' ')}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Cubes;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
import './Cubes.css';\r
\r
export type CubesEdgeStyle = 'solid' | 'dashed' | 'dotted' | 'none';\r
\r
export interface CubesProps extends HTMLAttributes<HTMLDivElement> {\r
  gridSize?: number;\r
  gap?: number;\r
  faceColor?: string;\r
  edgeColor?: string;\r
  edgeWidth?: number;\r
  edgeStyle?: CubesEdgeStyle;\r
  faceOpacity?: number;\r
  shading?: number;\r
  maxAngle?: number;\r
  radius?: number;\r
  speed?: number;\r
  bounce?: number;\r
  brush?: number;\r
  perspective?: number;\r
  autoAnimate?: boolean;\r
  rippleOnClick?: boolean;\r
  rippleColor?: string;\r
  rippleSpeed?: number;\r
  intro?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  gridSize: number;\r
  gap: number;\r
  faceColor: string;\r
  edgeColor: string;\r
  edgeWidth: number;\r
  edgeStyle: CubesEdgeStyle;\r
  faceOpacity: number;\r
  shading: number;\r
  maxAngle: number;\r
  radius: number;\r
  speed: number;\r
  bounce: number;\r
  brush: number;\r
  perspective: number;\r
  autoAnimate: boolean;\r
  rippleOnClick: boolean;\r
  rippleColor: string;\r
  rippleSpeed: number;\r
  intro: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Quaternion = [number, number, number, number];\r
\r
const VERTEX = \`#version 300 es\r
in vec3 aPosition;\r
in vec3 aNormal;\r
in vec2 aUv;\r
in vec2 aCenter;\r
in vec4 aRotation;\r
in vec2 aState;\r
uniform mat4 uProjection;\r
uniform float uSize;\r
out vec3 vNormal;\r
out vec2 vUv;\r
out float vFlash;\r
\r
vec3 turn(vec4 q, vec3 v) {\r
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\r
}\r
\r
void main() {\r
  vec3 local = turn(aRotation, aPosition * uSize * aState.y);\r
  vNormal = turn(aRotation, aNormal);\r
  vUv = aUv;\r
  vFlash = aState.x;\r
  gl_Position = uProjection * vec4(vec3(aCenter, 0.0) + local, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec3 vNormal;\r
in vec2 vUv;\r
in float vFlash;\r
uniform vec3 uFace;\r
uniform vec3 uEdge;\r
uniform vec3 uRipple;\r
uniform vec3 uLight;\r
uniform float uShading;\r
uniform float uEdgeWidth;\r
uniform float uStyle;\r
uniform float uMarks;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 span = max(fwidth(vUv), vec2(0.00001));\r
  vec2 border = min(vUv, 1.0 - vUv) / span;\r
  bool vertical = border.x < border.y;\r
  float distance = min(border.x, border.y);\r
  float halfWidth = uEdgeWidth * 0.5;\r
  float cover = 1.0 - smoothstep(halfWidth - 0.5, halfWidth + 0.5, distance);\r
  float along = vertical ? vUv.y : vUv.x;\r
  float phase = along * uMarks;\r
  float step = max(vertical ? span.y : span.x, 0.00001) * uMarks;\r
  float offset = abs(fract(phase + 0.5) - 0.5);\r
  if (uStyle > 0.5 && uStyle < 1.5) {\r
    cover *= 1.0 - smoothstep(0.25 - step, 0.25 + step, offset);\r
  } else if (uStyle > 1.5 && uStyle < 2.5) {\r
    float radius = max(uEdgeWidth * 0.9, 1.0);\r
    float dot = length(vec2(offset / step, distance));\r
    cover = 1.0 - smoothstep(radius - 0.75, radius + 0.75, dot);\r
  } else if (uStyle > 2.5) {\r
    cover = 0.0;\r
  }\r
  vec3 normal = normalize(vNormal);\r
  cover *= smoothstep(0.06, 0.28, abs(normal.z));\r
  float side = clamp(1.0 - normal.z, 0.0, 1.0);\r
  float toward = clamp(0.6 + 0.6 * dot(normalize(normal.xy + vec2(0.00001)), normalize(uLight.xy)), 0.0, 1.0);\r
  vec3 face = mix(uFace, uEdge, side * mix(0.12, 0.42, toward) * uShading);\r
  face = mix(face, uRipple, vFlash * 0.22);\r
  vec3 edge = mix(uEdge, uRipple, vFlash);\r
  vec3 color = mix(face, edge, cover);\r
  float alpha = mix(uOpacity, 1.0, cover);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const FACES = [\r
  [0, 0, 1, 1, 0, 0, 0, 1, 0],\r
  [0, 0, -1, -1, 0, 0, 0, 1, 0],\r
  [1, 0, 0, 0, 0, -1, 0, 1, 0],\r
  [-1, 0, 0, 0, 0, 1, 0, 1, 0],\r
  [0, 1, 0, 1, 0, 0, 0, 0, -1],\r
  [0, -1, 0, 1, 0, 0, 0, 0, 1]\r
];\r
\r
const buildCube = () => {\r
  const vertices: number[] = [];\r
  const indices: number[] = [];\r
  FACES.forEach(([nx, ny, nz, ux, uy, uz, vx, vy, vz], face) => {\r
    [\r
      [0, 0],\r
      [1, 0],\r
      [1, 1],\r
      [0, 1]\r
    ].forEach(([u, v]) => {\r
      vertices.push(\r
        nx * 0.5 + (u - 0.5) * ux + (v - 0.5) * vx,\r
        ny * 0.5 + (u - 0.5) * uy + (v - 0.5) * vy,\r
        nz * 0.5 + (u - 0.5) * uz + (v - 0.5) * vz,\r
        nx,\r
        ny,\r
        nz,\r
        u,\r
        v\r
      );\r
    });\r
    const base = face * 4;\r
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);\r
  });\r
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };\r
};\r
\r
const STYLES: Record<CubesEdgeStyle, number> = { solid: 0, dashed: 1, dotted: 2, none: 3 };\r
const INTRO_SECONDS = 1.1;\r
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
  ['aPosition', 'aNormal', 'aUv', 'aCenter', 'aRotation', 'aState'].forEach((name, index) =>\r
    gl.bindAttribLocation(program, index, name)\r
  );\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRotation = (rx: number, ry: number, out: Quaternion | Float32Array, offset: number) => {\r
  const angle = Math.hypot(rx, ry);\r
  if (angle < 0.000001) {\r
    out[offset] = 0;\r
    out[offset + 1] = 0;\r
    out[offset + 2] = 0;\r
    out[offset + 3] = 1;\r
    return;\r
  }\r
  const s = Math.sin(angle / 2) / angle;\r
  out[offset] = rx * s;\r
  out[offset + 1] = ry * s;\r
  out[offset + 2] = 0;\r
  out[offset + 3] = Math.cos(angle / 2);\r
};\r
\r
const multiply = (a: Quaternion, b: Quaternion, out: Float32Array, offset: number) => {\r
  const [ax, ay, az, aw] = a;\r
  const [bx, by, bz, bw] = b;\r
  out[offset] = aw * bx + ax * bw + ay * bz - az * by;\r
  out[offset + 1] = aw * by - ax * bz + ay * bw + az * bx;\r
  out[offset + 2] = aw * bz + ax * by - ay * bx + az * bw;\r
  out[offset + 3] = aw * bw - ax * bx - ay * by - az * bz;\r
};\r
\r
const projection = (width: number, height: number, scale: number, perspective: number) => {\r
  const halfWidth = width / 2 / scale;\r
  const halfHeight = height / 2 / scale;\r
  const depth = Math.max(halfWidth, halfHeight) * 4 + 4;\r
  if (perspective <= 0.001) {\r
    return new Float32Array([1 / halfWidth, 0, 0, 0, 0, 1 / halfHeight, 0, 0, 0, 0, -1 / depth, 0, 0, 0, 0, 1]);\r
  }\r
  const fov = ((8 + perspective * 52) * Math.PI) / 180;\r
  const distance = halfHeight / Math.tan(fov / 2);\r
  const near = Math.max(0.1, distance - depth);\r
  const far = distance + depth;\r
  const f = 1 / Math.tan(fov / 2);\r
  const aspect = halfWidth / halfHeight;\r
  return new Float32Array([\r
    f / aspect,\r
    0,\r
    0,\r
    0,\r
    0,\r
    f,\r
    0,\r
    0,\r
    0,\r
    0,\r
    (far + near) / (near - far),\r
    -1,\r
    0,\r
    0,\r
    (2 * far * near) / (near - far) - ((far + near) / (near - far)) * distance,\r
    distance\r
  ]);\r
};\r
\r
export const Cubes = ({\r
  gridSize = 10,\r
  gap = 0.18,\r
  faceColor = '#120F17',\r
  edgeColor = '#ffffff',\r
  edgeWidth = 1,\r
  edgeStyle = 'solid',\r
  faceOpacity = 1,\r
  shading = 0.6,\r
  maxAngle = 45,\r
  radius = 3,\r
  speed = 1,\r
  bounce = 0.4,\r
  brush = 1,\r
  perspective = 0,\r
  autoAnimate = true,\r
  rippleOnClick = true,\r
  rippleColor = '#ffffff',\r
  rippleSpeed = 1,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: CubesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    gridSize: Math.round(clamp(gridSize, 1, 40)),\r
    gap: clamp(gap, 0, 0.9),\r
    faceColor: String(faceColor),\r
    edgeColor: String(edgeColor),\r
    edgeWidth: Math.max(0, edgeWidth),\r
    edgeStyle,\r
    faceOpacity: clamp(faceOpacity, 0, 1),\r
    shading: Math.max(0, shading),\r
    maxAngle,\r
    radius: Math.max(0.5, radius),\r
    speed: Math.max(0.05, speed),\r
    bounce: clamp(bounce, 0, 1),\r
    brush: Math.max(0, brush),\r
    perspective: clamp(perspective, 0, 1),\r
    autoAnimate,\r
    rippleOnClick,\r
    rippleColor: String(rippleColor),\r
    rippleSpeed: Math.max(0.05, rippleSpeed),\r
    intro,\r
    paused,\r
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
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
\r
    const cube = buildCube();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const vertexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);\r
    const instanceBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    [\r
      [3, 2, 0],\r
      [4, 4, 8],\r
      [5, 2, 24]\r
    ].forEach(([location, size, offset]) => {\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 32, offset);\r
      gl.vertexAttribDivisor(location, 1);\r
    });\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, [number, number, number]>();\r
    const toRgb = (value: string): [number, number, number] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb: [number, number, number] = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, scale: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, moved: 0 };\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, weight: 0, primed: false };\r
    const grid = { size: 0, count: 0 };\r
    let rx = new Float32Array(0);\r
    let ry = new Float32Array(0);\r
    let wx = new Float32Array(0);\r
    let wy = new Float32Array(0);\r
    let glow = new Float32Array(0);\r
    const rings: { x: number; y: number; born: number }[] = [];\r
    let delays = new Float32Array(0);\r
    let instances = new Float32Array(0);\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 99;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const allocate = (size: number) => {\r
      if (grid.size === size) return;\r
      grid.size = size;\r
      grid.count = size * size;\r
      rx = new Float32Array(grid.count);\r
      ry = new Float32Array(grid.count);\r
      wx = new Float32Array(grid.count);\r
      wy = new Float32Array(grid.count);\r
      glow = new Float32Array(grid.count);\r
      delays = new Float32Array(grid.count);\r
      instances = new Float32Array(grid.count * 8);\r
      const center = (size - 1) / 2;\r
      for (let i = 0; i < grid.count; i++) {\r
        const col = i % size;\r
        const row = Math.floor(i / size);\r
        delays[i] = Math.hypot(col - center, row - center) / Math.max(1, size / 2);\r
      }\r
    };\r
\r
    const cellOf = (i: number) => {\r
      const size = grid.size;\r
      const center = (size - 1) / 2;\r
      return [(i % size) - center, center - Math.floor(i / size)];\r
    };\r
\r
    const toWorld = (x: number, y: number): [number, number] => [\r
      (x - view.width / 2) / view.scale,\r
      (view.height / 2 - y) / view.scale\r
    ];\r
\r
    const ripple = (x: number, y: number) => {\r
      const s = settingsRef.current;\r
      if (!s.rippleOnClick || reduce) return;\r
      const [ox, oy] = toWorld(x, y);\r
      rings.push({ x: ox, y: oy, born: clock });\r
      if (rings.length > 6) rings.shift();\r
      wake();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!grid.count) return;\r
\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, instances, gl.DYNAMIC_DRAW);\r
      const u = shader.uniforms;\r
      gl.uniformMatrix4fv(u.uProjection, false, projection(view.width, view.height, view.scale, s.perspective));\r
      gl.uniform1f(u.uSize, 1 - s.gap);\r
      gl.uniform3fv(u.uFace, toRgb(s.faceColor));\r
      gl.uniform3fv(u.uEdge, toRgb(s.edgeColor));\r
      gl.uniform3fv(u.uRipple, toRgb(s.rippleColor));\r
      const light = [-0.42, 0.55, 0.72];\r
      const length = Math.hypot(...light);\r
      gl.uniform3f(u.uLight, light[0] / length, light[1] / length, light[2] / length);\r
      gl.uniform1f(u.uShading, s.shading);\r
      gl.uniform1f(u.uEdgeWidth, s.edgeWidth * view.ratio);\r
      gl.uniform1f(u.uStyle, STYLES[s.edgeStyle] ?? 0);\r
      const cubePixels = (1 - s.gap) * view.scale;\r
      const spacing = s.edgeStyle === 'dotted' ? Math.max(4, s.edgeWidth * 4) : Math.max(6, s.edgeWidth * 6);\r
      gl.uniform1f(u.uMarks, Math.max(1, Math.round(cubePixels / spacing)));\r
      gl.uniform1f(u.uOpacity, s.faceOpacity);\r
\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.enable(gl.CULL_FACE);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      if (s.faceOpacity >= 0.999) {\r
        gl.depthMask(true);\r
        gl.cullFace(gl.BACK);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
      } else {\r
        gl.depthMask(false);\r
        gl.cullFace(gl.FRONT);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
        gl.cullFace(gl.BACK);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
        gl.depthMask(true);\r
      }\r
    };\r
\r
    const step = (dt: number) => {\r
      const s = settingsRef.current;\r
      allocate(s.gridSize);\r
      clock += dt;\r
      if (introClock < 99) introClock += dt;\r
\r
      const live = s.autoAnimate && !reduce && (!pointer.inside || clock - pointer.moved > 3);\r
      let goalX = cursor.x;\r
      let goalY = cursor.y;\r
      let engaged = false;\r
      if (pointer.inside && clock - pointer.moved <= 3) {\r
        [goalX, goalY] = toWorld(pointer.x, pointer.y);\r
        engaged = true;\r
      } else if (live) {\r
        const reach = grid.size * 0.42;\r
        goalX = Math.sin(clock * 0.37) * reach * Math.cos(clock * 0.11);\r
        goalY = Math.sin(clock * 0.53 + 1.2) * reach;\r
        engaged = true;\r
      }\r
      if (!cursor.primed && engaged) {\r
        cursor.x = goalX;\r
        cursor.y = goalY;\r
        cursor.primed = true;\r
      }\r
      const follow = 1 - Math.exp(-dt * 18);\r
      const prevX = cursor.x;\r
      const prevY = cursor.y;\r
      cursor.x += (goalX - cursor.x) * follow;\r
      cursor.y += (goalY - cursor.y) * follow;\r
      const blend = 1 - Math.exp(-dt * 10);\r
      cursor.vx += ((cursor.x - prevX) / Math.max(dt, 0.001) - cursor.vx) * blend;\r
      cursor.vy += ((cursor.y - prevY) / Math.max(dt, 0.001) - cursor.vy) * blend;\r
      cursor.weight += ((engaged ? 1 : 0) - cursor.weight) * (1 - Math.exp(-dt * (engaged ? 6 : 2.5)));\r
\r
      const stiffness = 160 * s.speed * s.speed;\r
      const damping = 2 * (1 - 0.82 * s.bounce) * Math.sqrt(stiffness);\r
      const maxAngle = (s.maxAngle * Math.PI) / 180;\r
      const lift = 0.8;\r
      const travel = 8 * s.rippleSpeed;\r
      const fade = Math.exp(-dt * 3.2);\r
      const reachLimit = grid.size * 1.5 + 2;\r
      for (let k = rings.length - 1; k >= 0; k--) {\r
        if ((clock - rings[k].born) * travel > reachLimit) rings.splice(k, 1);\r
      }\r
      const speedNow = Math.hypot(cursor.vx, cursor.vy);\r
      const sweepX = speedNow > 0.0001 ? -cursor.vy / speedNow : 0;\r
      const sweepY = speedNow > 0.0001 ? cursor.vx / speedNow : 0;\r
      const sweep = reduce ? 0 : Math.min(speedNow, 40) * s.brush * 1.6;\r
      let moving = false;\r
\r
      for (let i = 0; i < grid.count; i++) {\r
        const [cx, cy] = cellOf(i);\r
        const dx = cx - cursor.x;\r
        const dy = cy - cursor.y;\r
        const distance = Math.hypot(dx, dy);\r
        const t = distance / s.radius;\r
        const falloff = t < 1 ? (1 - t * t) * (1 - t * t) * cursor.weight : 0;\r
        let targetX = 0;\r
        let targetY = 0;\r
        if (falloff > 0 && distance > 0.0001) {\r
          const tilt = maxAngle * falloff * (distance / Math.hypot(distance, lift));\r
          targetX = (dy / distance) * tilt;\r
          targetY = (-dx / distance) * tilt;\r
        }\r
        if (falloff > 0 && sweep > 0) {\r
          wx[i] += sweepX * sweep * falloff * dt * 4;\r
          wy[i] += sweepY * sweep * falloff * dt * 4;\r
        }\r
        glow[i] *= fade;\r
        for (let k = 0; k < rings.length; k++) {\r
          const ring = rings[k];\r
          const ox = cx - ring.x;\r
          const oy = cy - ring.y;\r
          const reach = Math.hypot(ox, oy);\r
          const now = (clock - ring.born) * travel;\r
          if (reach > now || reach <= now - travel * dt || reach < 0.0001) continue;\r
          const strength = Math.exp(-reach / (grid.size * 0.8));\r
          wx[i] -= (oy / reach) * 13 * strength;\r
          wy[i] += (ox / reach) * 13 * strength;\r
          glow[i] = Math.max(glow[i], strength);\r
        }\r
        if (glow[i] > 0.01) moving = true;\r
        if (reduce) {\r
          rx[i] = targetX;\r
          ry[i] = targetY;\r
          wx[i] = 0;\r
          wy[i] = 0;\r
        } else {\r
          wx[i] += (stiffness * (targetX - rx[i]) - damping * wx[i]) * dt;\r
          wy[i] += (stiffness * (targetY - ry[i]) - damping * wy[i]) * dt;\r
          rx[i] += wx[i] * dt;\r
          ry[i] += wy[i] * dt;\r
        }\r
        if (\r
          Math.abs(targetX - rx[i]) + Math.abs(targetY - ry[i]) > 0.0005 ||\r
          Math.abs(wx[i]) + Math.abs(wy[i]) > 0.0005\r
        ) {\r
          moving = true;\r
        }\r
\r
        let grow = 1;\r
        let tumble = 0;\r
        if (introClock < 99) {\r
          const local = clamp((introClock - delays[i] * 0.55) / INTRO_SECONDS, 0, 1);\r
          const eased = 1 - Math.pow(1 - local, 3);\r
          grow = eased;\r
          tumble = (1 - eased) * (Math.PI / 2);\r
          if (local < 1) moving = true;\r
        }\r
\r
        const tilt: Quaternion = [0, 0, 0, 1];\r
        toRotation(rx[i], ry[i], tilt, 0);\r
        const turn: Quaternion = [Math.sin(tumble / 2), 0, 0, Math.cos(tumble / 2)];\r
        const base = i * 8;\r
        instances[base] = cx;\r
        instances[base + 1] = cy;\r
        multiply(tilt, turn, instances, base + 2);\r
        instances[base + 6] = glow[i];\r
        instances[base + 7] = grow;\r
      }\r
      if (introClock >= INTRO_SECONDS + 0.6 && introClock < 99) introClock = 99;\r
      return (\r
        moving ||\r
        live ||\r
        rings.length > 0 ||\r
        (engaged && speedNow > 0.01) ||\r
        Math.abs((engaged ? 1 : 0) - cursor.weight) > 0.002\r
      );\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const active = s.paused ? false : step(dt);\r
      render();\r
      if (active) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      view.scale = Math.min(width, height) / (s.gridSize + 0.9);\r
      canvas.width = Math.max(1, Math.round(width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(height * view.ratio));\r
      allocate(s.gridSize);\r
      if (!raf) {\r
        step(0);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside) pointer.moved = clock;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      ripple(event.clientX - rect.left, event.clientY - rect.top);\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    container.addEventListener('pointerdown', onPointerDown);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastSize = settingsRef.current.gridSize;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.gridSize !== lastSize || s.dpr !== lastDpr) {\r
        lastSize = s.gridSize;\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) {\r
        step(0);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      container.removeEventListener('pointerdown', onPointerDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(vertexBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  return (\r
    <div ref={containerRef} className={\`cubes-container\${className ? \` \${className}\` : ''}\`} {...rest}>\r
      <canvas ref={canvasRef} className="cubes-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Cubes;\r
`,o=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes } from 'react';\r
\r
export type CubesEdgeStyle = 'solid' | 'dashed' | 'dotted' | 'none';\r
\r
export interface CubesProps extends HTMLAttributes<HTMLDivElement> {\r
  gridSize?: number;\r
  gap?: number;\r
  faceColor?: string;\r
  edgeColor?: string;\r
  edgeWidth?: number;\r
  edgeStyle?: CubesEdgeStyle;\r
  faceOpacity?: number;\r
  shading?: number;\r
  maxAngle?: number;\r
  radius?: number;\r
  speed?: number;\r
  bounce?: number;\r
  brush?: number;\r
  perspective?: number;\r
  autoAnimate?: boolean;\r
  rippleOnClick?: boolean;\r
  rippleColor?: string;\r
  rippleSpeed?: number;\r
  intro?: boolean;\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  gridSize: number;\r
  gap: number;\r
  faceColor: string;\r
  edgeColor: string;\r
  edgeWidth: number;\r
  edgeStyle: CubesEdgeStyle;\r
  faceOpacity: number;\r
  shading: number;\r
  maxAngle: number;\r
  radius: number;\r
  speed: number;\r
  bounce: number;\r
  brush: number;\r
  perspective: number;\r
  autoAnimate: boolean;\r
  rippleOnClick: boolean;\r
  rippleColor: string;\r
  rippleSpeed: number;\r
  intro: boolean;\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Quaternion = [number, number, number, number];\r
\r
const VERTEX = \`#version 300 es\r
in vec3 aPosition;\r
in vec3 aNormal;\r
in vec2 aUv;\r
in vec2 aCenter;\r
in vec4 aRotation;\r
in vec2 aState;\r
uniform mat4 uProjection;\r
uniform float uSize;\r
out vec3 vNormal;\r
out vec2 vUv;\r
out float vFlash;\r
\r
vec3 turn(vec4 q, vec3 v) {\r
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\r
}\r
\r
void main() {\r
  vec3 local = turn(aRotation, aPosition * uSize * aState.y);\r
  vNormal = turn(aRotation, aNormal);\r
  vUv = aUv;\r
  vFlash = aState.x;\r
  gl_Position = uProjection * vec4(vec3(aCenter, 0.0) + local, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
in vec3 vNormal;\r
in vec2 vUv;\r
in float vFlash;\r
uniform vec3 uFace;\r
uniform vec3 uEdge;\r
uniform vec3 uRipple;\r
uniform vec3 uLight;\r
uniform float uShading;\r
uniform float uEdgeWidth;\r
uniform float uStyle;\r
uniform float uMarks;\r
uniform float uOpacity;\r
out vec4 outColor;\r
\r
void main() {\r
  vec2 span = max(fwidth(vUv), vec2(0.00001));\r
  vec2 border = min(vUv, 1.0 - vUv) / span;\r
  bool vertical = border.x < border.y;\r
  float distance = min(border.x, border.y);\r
  float halfWidth = uEdgeWidth * 0.5;\r
  float cover = 1.0 - smoothstep(halfWidth - 0.5, halfWidth + 0.5, distance);\r
  float along = vertical ? vUv.y : vUv.x;\r
  float phase = along * uMarks;\r
  float step = max(vertical ? span.y : span.x, 0.00001) * uMarks;\r
  float offset = abs(fract(phase + 0.5) - 0.5);\r
  if (uStyle > 0.5 && uStyle < 1.5) {\r
    cover *= 1.0 - smoothstep(0.25 - step, 0.25 + step, offset);\r
  } else if (uStyle > 1.5 && uStyle < 2.5) {\r
    float radius = max(uEdgeWidth * 0.9, 1.0);\r
    float dot = length(vec2(offset / step, distance));\r
    cover = 1.0 - smoothstep(radius - 0.75, radius + 0.75, dot);\r
  } else if (uStyle > 2.5) {\r
    cover = 0.0;\r
  }\r
  vec3 normal = normalize(vNormal);\r
  cover *= smoothstep(0.06, 0.28, abs(normal.z));\r
  float side = clamp(1.0 - normal.z, 0.0, 1.0);\r
  float toward = clamp(0.6 + 0.6 * dot(normalize(normal.xy + vec2(0.00001)), normalize(uLight.xy)), 0.0, 1.0);\r
  vec3 face = mix(uFace, uEdge, side * mix(0.12, 0.42, toward) * uShading);\r
  face = mix(face, uRipple, vFlash * 0.22);\r
  vec3 edge = mix(uEdge, uRipple, vFlash);\r
  vec3 color = mix(face, edge, cover);\r
  float alpha = mix(uOpacity, 1.0, cover);\r
  outColor = vec4(color * alpha, alpha);\r
}\`;\r
\r
const FACES = [\r
  [0, 0, 1, 1, 0, 0, 0, 1, 0],\r
  [0, 0, -1, -1, 0, 0, 0, 1, 0],\r
  [1, 0, 0, 0, 0, -1, 0, 1, 0],\r
  [-1, 0, 0, 0, 0, 1, 0, 1, 0],\r
  [0, 1, 0, 1, 0, 0, 0, 0, -1],\r
  [0, -1, 0, 1, 0, 0, 0, 0, 1]\r
];\r
\r
const buildCube = () => {\r
  const vertices: number[] = [];\r
  const indices: number[] = [];\r
  FACES.forEach(([nx, ny, nz, ux, uy, uz, vx, vy, vz], face) => {\r
    [\r
      [0, 0],\r
      [1, 0],\r
      [1, 1],\r
      [0, 1]\r
    ].forEach(([u, v]) => {\r
      vertices.push(\r
        nx * 0.5 + (u - 0.5) * ux + (v - 0.5) * vx,\r
        ny * 0.5 + (u - 0.5) * uy + (v - 0.5) * vy,\r
        nz * 0.5 + (u - 0.5) * uz + (v - 0.5) * vz,\r
        nx,\r
        ny,\r
        nz,\r
        u,\r
        v\r
      );\r
    });\r
    const base = face * 4;\r
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);\r
  });\r
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };\r
};\r
\r
const STYLES: Record<CubesEdgeStyle, number> = { solid: 0, dashed: 1, dotted: 2, none: 3 };\r
const INTRO_SECONDS = 1.1;\r
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
  ['aPosition', 'aNormal', 'aUv', 'aCenter', 'aRotation', 'aState'].forEach((name, index) =>\r
    gl.bindAttribLocation(program, index, name)\r
  );\r
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
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);\r
  }\r
  return { program, uniforms };\r
};\r
\r
const toRotation = (rx: number, ry: number, out: Quaternion | Float32Array, offset: number) => {\r
  const angle = Math.hypot(rx, ry);\r
  if (angle < 0.000001) {\r
    out[offset] = 0;\r
    out[offset + 1] = 0;\r
    out[offset + 2] = 0;\r
    out[offset + 3] = 1;\r
    return;\r
  }\r
  const s = Math.sin(angle / 2) / angle;\r
  out[offset] = rx * s;\r
  out[offset + 1] = ry * s;\r
  out[offset + 2] = 0;\r
  out[offset + 3] = Math.cos(angle / 2);\r
};\r
\r
const multiply = (a: Quaternion, b: Quaternion, out: Float32Array, offset: number) => {\r
  const [ax, ay, az, aw] = a;\r
  const [bx, by, bz, bw] = b;\r
  out[offset] = aw * bx + ax * bw + ay * bz - az * by;\r
  out[offset + 1] = aw * by - ax * bz + ay * bw + az * bx;\r
  out[offset + 2] = aw * bz + ax * by - ay * bx + az * bw;\r
  out[offset + 3] = aw * bw - ax * bx - ay * by - az * bz;\r
};\r
\r
const projection = (width: number, height: number, scale: number, perspective: number) => {\r
  const halfWidth = width / 2 / scale;\r
  const halfHeight = height / 2 / scale;\r
  const depth = Math.max(halfWidth, halfHeight) * 4 + 4;\r
  if (perspective <= 0.001) {\r
    return new Float32Array([1 / halfWidth, 0, 0, 0, 0, 1 / halfHeight, 0, 0, 0, 0, -1 / depth, 0, 0, 0, 0, 1]);\r
  }\r
  const fov = ((8 + perspective * 52) * Math.PI) / 180;\r
  const distance = halfHeight / Math.tan(fov / 2);\r
  const near = Math.max(0.1, distance - depth);\r
  const far = distance + depth;\r
  const f = 1 / Math.tan(fov / 2);\r
  const aspect = halfWidth / halfHeight;\r
  return new Float32Array([\r
    f / aspect,\r
    0,\r
    0,\r
    0,\r
    0,\r
    f,\r
    0,\r
    0,\r
    0,\r
    0,\r
    (far + near) / (near - far),\r
    -1,\r
    0,\r
    0,\r
    (2 * far * near) / (near - far) - ((far + near) / (near - far)) * distance,\r
    distance\r
  ]);\r
};\r
\r
export const Cubes = ({\r
  gridSize = 10,\r
  gap = 0.18,\r
  faceColor = '#120F17',\r
  edgeColor = '#ffffff',\r
  edgeWidth = 1,\r
  edgeStyle = 'solid',\r
  faceOpacity = 1,\r
  shading = 0.6,\r
  maxAngle = 45,\r
  radius = 3,\r
  speed = 1,\r
  bounce = 0.4,\r
  brush = 1,\r
  perspective = 0,\r
  autoAnimate = true,\r
  rippleOnClick = true,\r
  rippleColor = '#ffffff',\r
  rippleSpeed = 1,\r
  intro = true,\r
  paused = false,\r
  dpr,\r
  className = '',\r
  ...rest\r
}: CubesProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    gridSize: Math.round(clamp(gridSize, 1, 40)),\r
    gap: clamp(gap, 0, 0.9),\r
    faceColor: String(faceColor),\r
    edgeColor: String(edgeColor),\r
    edgeWidth: Math.max(0, edgeWidth),\r
    edgeStyle,\r
    faceOpacity: clamp(faceOpacity, 0, 1),\r
    shading: Math.max(0, shading),\r
    maxAngle,\r
    radius: Math.max(0.5, radius),\r
    speed: Math.max(0.05, speed),\r
    bounce: clamp(bounce, 0, 1),\r
    brush: Math.max(0, brush),\r
    perspective: clamp(perspective, 0, 1),\r
    autoAnimate,\r
    rippleOnClick,\r
    rippleColor: String(rippleColor),\r
    rippleSpeed: Math.max(0.05, rippleSpeed),\r
    intro,\r
    paused,\r
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
      antialias: true,\r
      depth: true,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
    const shader = link(gl);\r
    if (!shader) return undefined;\r
\r
    const cube = buildCube();\r
    const vao = gl.createVertexArray();\r
    gl.bindVertexArray(vao);\r
    const vertexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);\r
    gl.enableVertexAttribArray(0);\r
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);\r
    gl.enableVertexAttribArray(1);\r
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);\r
    gl.enableVertexAttribArray(2);\r
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);\r
    const indexBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\r
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);\r
    const instanceBuffer = gl.createBuffer();\r
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
    [\r
      [3, 2, 0],\r
      [4, 4, 8],\r
      [5, 2, 24]\r
    ].forEach(([location, size, offset]) => {\r
      gl.enableVertexAttribArray(location);\r
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 32, offset);\r
      gl.vertexAttribDivisor(location, 1);\r
    });\r
\r
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });\r
    const colorCache = new Map<string, [number, number, number]>();\r
    const toRgb = (value: string): [number, number, number] => {\r
      const cached = colorCache.get(value);\r
      if (cached) return cached;\r
      let rgb: [number, number, number] = [1, 1, 1];\r
      if (probe) {\r
        probe.clearRect(0, 0, 1, 1);\r
        probe.fillStyle = '#ffffff';\r
        probe.fillStyle = value;\r
        probe.fillRect(0, 0, 1, 1);\r
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;\r
        rgb = [r / 255, g / 255, b / 255];\r
      }\r
      colorCache.set(value, rgb);\r
      return rgb;\r
    };\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, scale: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, moved: 0 };\r
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, weight: 0, primed: false };\r
    const grid = { size: 0, count: 0 };\r
    let rx = new Float32Array(0);\r
    let ry = new Float32Array(0);\r
    let wx = new Float32Array(0);\r
    let wy = new Float32Array(0);\r
    let glow = new Float32Array(0);\r
    const rings: { x: number; y: number; born: number }[] = [];\r
    let delays = new Float32Array(0);\r
    let instances = new Float32Array(0);\r
    let clock = 0;\r
    let introClock = settingsRef.current.intro && !reduce ? 0 : 99;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
\r
    const allocate = (size: number) => {\r
      if (grid.size === size) return;\r
      grid.size = size;\r
      grid.count = size * size;\r
      rx = new Float32Array(grid.count);\r
      ry = new Float32Array(grid.count);\r
      wx = new Float32Array(grid.count);\r
      wy = new Float32Array(grid.count);\r
      glow = new Float32Array(grid.count);\r
      delays = new Float32Array(grid.count);\r
      instances = new Float32Array(grid.count * 8);\r
      const center = (size - 1) / 2;\r
      for (let i = 0; i < grid.count; i++) {\r
        const col = i % size;\r
        const row = Math.floor(i / size);\r
        delays[i] = Math.hypot(col - center, row - center) / Math.max(1, size / 2);\r
      }\r
    };\r
\r
    const cellOf = (i: number) => {\r
      const size = grid.size;\r
      const center = (size - 1) / 2;\r
      return [(i % size) - center, center - Math.floor(i / size)];\r
    };\r
\r
    const toWorld = (x: number, y: number): [number, number] => [\r
      (x - view.width / 2) / view.scale,\r
      (view.height / 2 - y) / view.scale\r
    ];\r
\r
    const ripple = (x: number, y: number) => {\r
      const s = settingsRef.current;\r
      if (!s.rippleOnClick || reduce) return;\r
      const [ox, oy] = toWorld(x, y);\r
      rings.push({ x: ox, y: oy, born: clock });\r
      if (rings.length > 6) rings.shift();\r
      wake();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      const width = canvas.width;\r
      const height = canvas.height;\r
      gl.viewport(0, 0, width, height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\r
      if (!grid.count) return;\r
\r
      gl.useProgram(shader.program);\r
      gl.bindVertexArray(vao);\r
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);\r
      gl.bufferData(gl.ARRAY_BUFFER, instances, gl.DYNAMIC_DRAW);\r
      const u = shader.uniforms;\r
      gl.uniformMatrix4fv(u.uProjection, false, projection(view.width, view.height, view.scale, s.perspective));\r
      gl.uniform1f(u.uSize, 1 - s.gap);\r
      gl.uniform3fv(u.uFace, toRgb(s.faceColor));\r
      gl.uniform3fv(u.uEdge, toRgb(s.edgeColor));\r
      gl.uniform3fv(u.uRipple, toRgb(s.rippleColor));\r
      const light = [-0.42, 0.55, 0.72];\r
      const length = Math.hypot(...light);\r
      gl.uniform3f(u.uLight, light[0] / length, light[1] / length, light[2] / length);\r
      gl.uniform1f(u.uShading, s.shading);\r
      gl.uniform1f(u.uEdgeWidth, s.edgeWidth * view.ratio);\r
      gl.uniform1f(u.uStyle, STYLES[s.edgeStyle] ?? 0);\r
      const cubePixels = (1 - s.gap) * view.scale;\r
      const spacing = s.edgeStyle === 'dotted' ? Math.max(4, s.edgeWidth * 4) : Math.max(6, s.edgeWidth * 6);\r
      gl.uniform1f(u.uMarks, Math.max(1, Math.round(cubePixels / spacing)));\r
      gl.uniform1f(u.uOpacity, s.faceOpacity);\r
\r
      gl.enable(gl.DEPTH_TEST);\r
      gl.enable(gl.CULL_FACE);\r
      gl.enable(gl.BLEND);\r
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\r
      if (s.faceOpacity >= 0.999) {\r
        gl.depthMask(true);\r
        gl.cullFace(gl.BACK);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
      } else {\r
        gl.depthMask(false);\r
        gl.cullFace(gl.FRONT);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
        gl.cullFace(gl.BACK);\r
        gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, grid.count);\r
        gl.depthMask(true);\r
      }\r
    };\r
\r
    const step = (dt: number) => {\r
      const s = settingsRef.current;\r
      allocate(s.gridSize);\r
      clock += dt;\r
      if (introClock < 99) introClock += dt;\r
\r
      const live = s.autoAnimate && !reduce && (!pointer.inside || clock - pointer.moved > 3);\r
      let goalX = cursor.x;\r
      let goalY = cursor.y;\r
      let engaged = false;\r
      if (pointer.inside && clock - pointer.moved <= 3) {\r
        [goalX, goalY] = toWorld(pointer.x, pointer.y);\r
        engaged = true;\r
      } else if (live) {\r
        const reach = grid.size * 0.42;\r
        goalX = Math.sin(clock * 0.37) * reach * Math.cos(clock * 0.11);\r
        goalY = Math.sin(clock * 0.53 + 1.2) * reach;\r
        engaged = true;\r
      }\r
      if (!cursor.primed && engaged) {\r
        cursor.x = goalX;\r
        cursor.y = goalY;\r
        cursor.primed = true;\r
      }\r
      const follow = 1 - Math.exp(-dt * 18);\r
      const prevX = cursor.x;\r
      const prevY = cursor.y;\r
      cursor.x += (goalX - cursor.x) * follow;\r
      cursor.y += (goalY - cursor.y) * follow;\r
      const blend = 1 - Math.exp(-dt * 10);\r
      cursor.vx += ((cursor.x - prevX) / Math.max(dt, 0.001) - cursor.vx) * blend;\r
      cursor.vy += ((cursor.y - prevY) / Math.max(dt, 0.001) - cursor.vy) * blend;\r
      cursor.weight += ((engaged ? 1 : 0) - cursor.weight) * (1 - Math.exp(-dt * (engaged ? 6 : 2.5)));\r
\r
      const stiffness = 160 * s.speed * s.speed;\r
      const damping = 2 * (1 - 0.82 * s.bounce) * Math.sqrt(stiffness);\r
      const maxAngle = (s.maxAngle * Math.PI) / 180;\r
      const lift = 0.8;\r
      const travel = 8 * s.rippleSpeed;\r
      const fade = Math.exp(-dt * 3.2);\r
      const reachLimit = grid.size * 1.5 + 2;\r
      for (let k = rings.length - 1; k >= 0; k--) {\r
        if ((clock - rings[k].born) * travel > reachLimit) rings.splice(k, 1);\r
      }\r
      const speedNow = Math.hypot(cursor.vx, cursor.vy);\r
      const sweepX = speedNow > 0.0001 ? -cursor.vy / speedNow : 0;\r
      const sweepY = speedNow > 0.0001 ? cursor.vx / speedNow : 0;\r
      const sweep = reduce ? 0 : Math.min(speedNow, 40) * s.brush * 1.6;\r
      let moving = false;\r
\r
      for (let i = 0; i < grid.count; i++) {\r
        const [cx, cy] = cellOf(i);\r
        const dx = cx - cursor.x;\r
        const dy = cy - cursor.y;\r
        const distance = Math.hypot(dx, dy);\r
        const t = distance / s.radius;\r
        const falloff = t < 1 ? (1 - t * t) * (1 - t * t) * cursor.weight : 0;\r
        let targetX = 0;\r
        let targetY = 0;\r
        if (falloff > 0 && distance > 0.0001) {\r
          const tilt = maxAngle * falloff * (distance / Math.hypot(distance, lift));\r
          targetX = (dy / distance) * tilt;\r
          targetY = (-dx / distance) * tilt;\r
        }\r
        if (falloff > 0 && sweep > 0) {\r
          wx[i] += sweepX * sweep * falloff * dt * 4;\r
          wy[i] += sweepY * sweep * falloff * dt * 4;\r
        }\r
        glow[i] *= fade;\r
        for (let k = 0; k < rings.length; k++) {\r
          const ring = rings[k];\r
          const ox = cx - ring.x;\r
          const oy = cy - ring.y;\r
          const reach = Math.hypot(ox, oy);\r
          const now = (clock - ring.born) * travel;\r
          if (reach > now || reach <= now - travel * dt || reach < 0.0001) continue;\r
          const strength = Math.exp(-reach / (grid.size * 0.8));\r
          wx[i] -= (oy / reach) * 13 * strength;\r
          wy[i] += (ox / reach) * 13 * strength;\r
          glow[i] = Math.max(glow[i], strength);\r
        }\r
        if (glow[i] > 0.01) moving = true;\r
        if (reduce) {\r
          rx[i] = targetX;\r
          ry[i] = targetY;\r
          wx[i] = 0;\r
          wy[i] = 0;\r
        } else {\r
          wx[i] += (stiffness * (targetX - rx[i]) - damping * wx[i]) * dt;\r
          wy[i] += (stiffness * (targetY - ry[i]) - damping * wy[i]) * dt;\r
          rx[i] += wx[i] * dt;\r
          ry[i] += wy[i] * dt;\r
        }\r
        if (\r
          Math.abs(targetX - rx[i]) + Math.abs(targetY - ry[i]) > 0.0005 ||\r
          Math.abs(wx[i]) + Math.abs(wy[i]) > 0.0005\r
        ) {\r
          moving = true;\r
        }\r
\r
        let grow = 1;\r
        let tumble = 0;\r
        if (introClock < 99) {\r
          const local = clamp((introClock - delays[i] * 0.55) / INTRO_SECONDS, 0, 1);\r
          const eased = 1 - Math.pow(1 - local, 3);\r
          grow = eased;\r
          tumble = (1 - eased) * (Math.PI / 2);\r
          if (local < 1) moving = true;\r
        }\r
\r
        const tilt: Quaternion = [0, 0, 0, 1];\r
        toRotation(rx[i], ry[i], tilt, 0);\r
        const turn: Quaternion = [Math.sin(tumble / 2), 0, 0, Math.cos(tumble / 2)];\r
        const base = i * 8;\r
        instances[base] = cx;\r
        instances[base + 1] = cy;\r
        multiply(tilt, turn, instances, base + 2);\r
        instances[base + 6] = glow[i];\r
        instances[base + 7] = grow;\r
      }\r
      if (introClock >= INTRO_SECONDS + 0.6 && introClock < 99) introClock = 99;\r
      return (\r
        moving ||\r
        live ||\r
        rings.length > 0 ||\r
        (engaged && speedNow > 0.01) ||\r
        Math.abs((engaged ? 1 : 0) - cursor.weight) > 0.002\r
      );\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const active = s.paused ? false : step(dt);\r
      render();\r
      if (active) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.width = width;\r
      view.height = height;\r
      view.scale = Math.min(width, height) / (s.gridSize + 0.9);\r
      canvas.width = Math.max(1, Math.round(width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(height * view.ratio));\r
      allocate(s.gridSize);\r
      if (!raf) {\r
        step(0);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      pointer.x = event.clientX - rect.left;\r
      pointer.y = event.clientY - rect.top;\r
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;\r
      if (pointer.inside) pointer.moved = clock;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      ripple(event.clientX - rect.left, event.clientY - rect.top);\r
    };\r
\r
    const onVisibility = () => {\r
      last = 0;\r
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
    document.documentElement.addEventListener('pointerleave', onPointerLeave);\r
    container.addEventListener('pointerdown', onPointerDown);\r
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
\r
    let lastSize = settingsRef.current.gridSize;\r
    let lastDpr = settingsRef.current.dpr;\r
    wakeRef.current = () => {\r
      const s = settingsRef.current;\r
      if (s.gridSize !== lastSize || s.dpr !== lastDpr) {\r
        lastSize = s.gridSize;\r
        lastDpr = s.dpr;\r
        resize();\r
        return;\r
      }\r
      if (!raf) {\r
        step(0);\r
        render();\r
      }\r
      wake();\r
    };\r
\r
    return () => {\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      container.removeEventListener('pointerdown', onPointerDown);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteBuffer(vertexBuffer);\r
      gl.deleteBuffer(indexBuffer);\r
      gl.deleteBuffer(instanceBuffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(shader.program);\r
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
      className={['relative h-full w-full touch-pan-y overflow-hidden', className].filter(Boolean).join(' ')}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default Cubes;\r
`,a={usage:`// CREDIT
// Component inspired from Can Tastemel's original work for the lambda.ai landing page
// https://cantastemel.com

import Cubes from './Cubes'

<div style={{ height: '600px', position: 'relative' }}>
  <Cubes
    gridSize={10}
    faceColor="#120F17"
    edgeColor="#ffffff"
    maxAngle={45}
    radius={3}
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{a as cubes};
