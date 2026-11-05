const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import * as THREE from 'three';\r
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';\r
\r
import './BlobCursor.css';\r
\r
const CORE = 8;\r
const HEAD_RADIUS = 0.7;\r
const HEAD_BLEND = 0.6;\r
const MAX_TRAIL = 16;\r
const MAX_DROPS = 96;\r
const MAX_PARTS = 48;\r
const DROP_LIFE = 30;\r
const MATERIALS = ['chrome', 'jelly', 'pearl', 'ink'];\r
const BLENDS = ['normal', 'difference', 'exclusion', 'multiply', 'screen', 'overlay'];\r
const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [data-blob-grow]';\r
\r
const FIELD = \`\r
#define BLOB_MAX \${MAX_PARTS}\r
uniform vec4 blobSeg[BLOB_MAX];\r
uniform vec4 blobInfo[BLOB_MAX];\r
uniform int blobCount;\r
uniform int blobHeadEnd;\r
uniform int blobTubeEnd;\r
uniform float blobJoin;\r
uniform float blobLift;\r
uniform float blobTop;\r
uniform float blobRef;\r
uniform vec2 blobDepth;\r
varying vec2 vBlobSpot;\r
\r
vec4 blobPart(vec2 p, int i, float z) {\r
  vec4 seg = blobSeg[i];\r
  vec2 r = blobInfo[i].xy;\r
  vec2 axis = seg.zw - seg.xy;\r
  float len = length(axis);\r
  if (len <= abs(r.x - r.y) + 0.001) {\r
    vec2 d = p - (r.x >= r.y ? seg.xy : seg.zw);\r
    float dist = max(sqrt(dot(d, d) + z * z), 0.0001);\r
    return vec4(dist - max(r.x, r.y), vec3(d, z) / dist);\r
  }\r
  vec2 dir = axis / len;\r
  vec2 rel = p - seg.xy;\r
  float u = dot(rel, dir);\r
  vec2 side = rel - dir * u;\r
  float w = sqrt(dot(side, side) + z * z);\r
  float b = (r.x - r.y) / len;\r
  float a = sqrt(1.0 - b * b);\r
  float along = a * u - b * w;\r
  vec3 f = vec3(a * w + b * u - r.x, a, b);\r
  if (along < 0.0) {\r
    float d = max(sqrt(w * w + u * u), 0.0001);\r
    f = vec3(d - r.x, w / d, u / d);\r
  } else if (along > a * len) {\r
    float d = max(sqrt(w * w + (u - len) * (u - len)), 0.0001);\r
    f = vec3(d - r.y, w / d, (u - len) / d);\r
  }\r
  return vec4(f.x, vec3(dir * f.z, 0.0) + vec3(side, z) / max(w, 0.0001) * f.y);\r
}\r
\r
vec4 blobSmooth(vec4 a, vec4 b, float k) {\r
  float h = k > 0.0 ? max(k - abs(a.x - b.x), 0.0) / k : 0.0;\r
  float weight = b.x < a.x ? 1.0 - 0.5 * h * h : 0.5 * h * h;\r
  return vec4(min(a.x, b.x) - h * h * h * k / 6.0, mix(a.yzw, b.yzw, weight));\r
}\r
\r
vec4 blobShape(vec2 p, float z) {\r
  vec4 body = blobPart(p, 0, z);\r
  for (int i = 1; i < BLOB_MAX; i++) {\r
    if (i >= blobHeadEnd) break;\r
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);\r
  }\r
  if (blobTubeEnd > blobHeadEnd) {\r
    vec4 tube = blobPart(p, blobHeadEnd, z);\r
    for (int i = blobHeadEnd + 1; i < BLOB_MAX; i++) {\r
      if (i >= blobTubeEnd) break;\r
      tube = blobSmooth(tube, blobPart(p, i, z), blobInfo[i].z);\r
    }\r
    body = blobSmooth(body, tube, blobJoin);\r
  }\r
  for (int i = blobTubeEnd; i < BLOB_MAX; i++) {\r
    if (i >= blobCount) break;\r
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);\r
  }\r
  return body;\r
}\r
\`;\r
\r
const SURFACE = \`\r
  vec4 blobBase = blobShape(vBlobSpot, 0.0);\r
  float blobAlpha = clamp(0.5 - blobBase.x / max(fwidth(blobBase.x), 0.0001), 0.0, 1.0);\r
  if (blobAlpha <= 0.0) discard;\r
  float blobLow = 0.0;\r
  float blobHigh = blobTop;\r
  float blobZ = min(sqrt(max(-blobBase.x, 0.0) * max(2.0 * blobRef + blobBase.x, 0.0)), blobTop);\r
  for (int k = 0; k < 8; k++) {\r
    vec4 blobTry = blobShape(vBlobSpot, blobZ);\r
    if (blobTry.x > 0.0) blobHigh = blobZ;\r
    else blobLow = blobZ;\r
    float blobNext = blobZ - blobTry.x / max(blobTry.w, 0.0001);\r
    blobZ = blobNext > blobLow && blobNext < blobHigh ? blobNext : 0.5 * (blobLow + blobHigh);\r
  }\r
  vec4 blobAt = blobShape(vBlobSpot, blobZ);\r
  vec3 blobNormal = normalize(vec3(blobAt.yz, blobAt.w / blobLift));\r
  gl_FragDepth = blobDepth.x - blobDepth.y * blobZ * blobLift;\r
\`;\r
\r
const SURFACE_NORMAL = \`\r
  float faceDirection = 1.0;\r
  vec3 normal = normalize((viewMatrix * vec4(blobNormal, 0.0)).xyz);\r
  vec3 nonPerturbedNormal = normal;\r
\`;\r
\r
const sculpt = (shader, uniforms, body) => {\r
  Object.assign(shader.uniforms, uniforms);\r
  shader.vertexShader = shader.vertexShader\r
    .replace('void main() {', 'varying vec2 vBlobSpot;\\nvoid main() {')\r
    .replace(\r
      '#include <project_vertex>',\r
      '#include <project_vertex>\\n\\tvBlobSpot = (modelMatrix * vec4(transformed, 1.0)).xy;'\r
    );\r
  shader.fragmentShader = shader.fragmentShader\r
    .replace('void main() {', \`\${FIELD}\\nvoid main() {\\n\${body}\`)\r
    .replace(\r
      'vec4 diffuseColor = vec4( diffuse, opacity );',\r
      'vec4 diffuseColor = vec4( diffuse, opacity * blobAlpha );'\r
    )\r
    .replace('#include <normal_fragment_begin>', SURFACE_NORMAL);\r
};\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const mix = (a, b, t) => a + (b - a) * t;\r
\r
const createBody = () => ({ x: 0, y: 0, vx: 0, vy: 0, size: 0 });\r
\r
const BlobCursor = ({\r
  material = 'chrome',\r
  color = '#3B82F6',\r
  size = 140,\r
  morph = 0,\r
  morphSpeed = 0.4,\r
  depth = 1,\r
  trail = 16,\r
  lag = 0.55,\r
  goo = 1,\r
  stretch = 0.6,\r
  wobble = 1,\r
  drip = 0,\r
  splash = true,\r
  splashCount = 6,\r
  splashSpeed = 0.5,\r
  splashSize = 0.5,\r
  splashGravity = 0,\r
  regrow = 0.5,\r
  shine = 1,\r
  shadow = false,\r
  blend = 'normal',\r
  hideCursor = true,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const applyRef = useRef(null);\r
\r
  settingsRef.current = {\r
    material: MATERIALS.includes(material) ? material : 'chrome',\r
    color,\r
    size: clamp(size, 12, 400),\r
    morph: clamp(morph, 0, 1),\r
    morphSpeed: clamp(morphSpeed, 0, 1),\r
    depth: clamp(depth, 0, 1),\r
    trail: clamp(Math.round(trail), 0, MAX_TRAIL),\r
    lag: clamp(lag, 0, 1),\r
    goo: clamp(goo, 0, 1),\r
    stretch: clamp(stretch, 0, 1),\r
    wobble: clamp(wobble, 0, 1),\r
    drip: clamp(drip, 0, 1),\r
    splash,\r
    splashCount: clamp(Math.round(splashCount), 1, 32),\r
    splashSpeed: clamp(splashSpeed, 0, 1),\r
    splashSize: clamp(splashSize, 0, 1),\r
    splashGravity: clamp(splashGravity, 0, 1),\r
    regrow: clamp(regrow, 0, 1),\r
    shine: clamp(shine, 0, 1),\r
    shadow,\r
    blend: BLENDS.includes(blend) ? blend : 'normal',\r
    hideCursor\r
  };\r
\r
  useEffect(() => {\r
    applyRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
\r
    let renderer;\r
    try {\r
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true });\r
    } catch {\r
      return undefined;\r
    }\r
    renderer.setClearColor(0x000000, 0);\r
    renderer.outputColorSpace = THREE.SRGBColorSpace;\r
    renderer.toneMapping = THREE.ACESFilmicToneMapping;\r
    renderer.toneMappingExposure = 1;\r
    renderer.shadowMap.enabled = true;\r
    renderer.shadowMap.type = THREE.VSMShadowMap;\r
    renderer.shadowMap.autoUpdate = true;\r
    const canvas = renderer.domElement;\r
    canvas.className = 'blob-cursor-canvas';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    root.appendChild(canvas);\r
\r
    const scene = new THREE.Scene();\r
    const pmrem = new THREE.PMREMGenerator(renderer);\r
    const room = new RoomEnvironment();\r
    const environment = pmrem.fromScene(room, 0.03);\r
    pmrem.dispose();\r
    scene.environment = environment.texture;\r
    scene.environmentRotation.set(-0.9, 0.35, 0);\r
\r
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 6000);\r
    camera.position.set(0, 0, 2000);\r
\r
    const key = new THREE.DirectionalLight(0xffffff, 1.4);\r
    key.castShadow = true;\r
    key.shadow.mapSize.set(2048, 2048);\r
    key.shadow.radius = 14;\r
    key.shadow.blurSamples = 20;\r
    key.shadow.bias = -0.0004;\r
    scene.add(key, key.target);\r
\r
    const field = {\r
      blobSeg: { value: new Float32Array(MAX_PARTS * 4) },\r
      blobInfo: { value: new Float32Array(MAX_PARTS * 4) },\r
      blobCount: { value: 0 },\r
      blobHeadEnd: { value: 0 },\r
      blobTubeEnd: { value: 0 },\r
      blobJoin: { value: 0 },\r
      blobLift: { value: 1 },\r
      blobTop: { value: 1 },\r
      blobRef: { value: 1 },\r
      blobDepth: {\r
        value: new THREE.Vector2(\r
          (camera.position.z - camera.near) / (camera.far - camera.near),\r
          1 / (camera.far - camera.near)\r
        )\r
      }\r
    };\r
    const coat = shader => sculpt(shader, field, SURFACE);\r
    const blobPhysical = new THREE.MeshPhysicalMaterial({ transparent: true });\r
    const blobFlat = new THREE.MeshBasicMaterial({ transparent: true });\r
    blobPhysical.onBeforeCompile = coat;\r
    blobFlat.onBeforeCompile = coat;\r
    const cast = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });\r
    cast.onBeforeCompile = shader => sculpt(shader, field, 'if (blobShape(vBlobSpot, 0.0).x > 0.0) discard;');\r
    const sprayPhysical = new THREE.MeshPhysicalMaterial();\r
    const sprayFlat = new THREE.MeshBasicMaterial();\r
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blobPhysical);\r
    blob.castShadow = true;\r
    blob.frustumCulled = false;\r
    blob.customDepthMaterial = cast;\r
    scene.add(blob);\r
\r
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.22 }));\r
    ground.receiveShadow = true;\r
    scene.add(ground);\r
\r
    const sphere = new THREE.SphereGeometry(1, 32, 24);\r
    const spray = new THREE.InstancedMesh(sphere, sprayPhysical, MAX_DROPS);\r
    spray.castShadow = true;\r
    spray.frustumCulled = false;\r
    spray.count = 0;\r
    scene.add(spray);\r
    const placement = new THREE.Matrix4();\r
    const spin = new THREE.Quaternion();\r
    const stretchAxis = new THREE.Vector3();\r
    const xAxis = new THREE.Vector3(1, 0, 0);\r
    const spot = new THREE.Vector3();\r
    const extent = new THREE.Vector3();\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, down: false, hover: false, seen: false };\r
    const anchor = createBody();\r
    const core = Array.from({ length: CORE }, (_, i) => ({\r
      ...createBody(),\r
      spread: i / (CORE - 1),\r
      angle: (i / CORE) * Math.PI * 2,\r
      shape: 0,\r
      tx: 0,\r
      ty: 0,\r
      grow: 1\r
    }));\r
    const chain = Array.from({ length: MAX_TRAIL }, createBody);\r
    const drops = [];\r
    const swell = { value: 0, velocity: 0 };\r
    const mass = { value: 1, wait: 0 };\r
    const seeds = Array.from({ length: 4 }, () => Math.random() * Math.PI * 2);\r
    let clock = Math.random() * 60;\r
    let dripping = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
    let restoreCursor = null;\r
    let calm = 0;\r
\r
    const resize = () => {\r
      view.width = Math.max(1, root.clientWidth);\r
      view.height = Math.max(1, root.clientHeight);\r
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
      renderer.setSize(view.width, view.height, false);\r
      camera.left = -view.width / 2;\r
      camera.right = view.width / 2;\r
      camera.top = view.height / 2;\r
      camera.bottom = -view.height / 2;\r
      camera.updateProjectionMatrix();\r
      const reach = Math.max(view.width, view.height) * 0.75;\r
      const frustum = key.shadow.camera;\r
      frustum.left = -reach;\r
      frustum.right = reach;\r
      frustum.top = reach;\r
      frustum.bottom = -reach;\r
      frustum.near = 1;\r
      frustum.far = reach * 6;\r
      frustum.updateProjectionMatrix();\r
      ground.scale.set(view.width * 1.5, view.height * 1.5, 1);\r
      start();\r
    };\r
\r
    const apply = () => {\r
      const s = settingsRef.current;\r
      const tint = new THREE.Color();\r
      try {\r
        tint.set(s.color);\r
      } catch {\r
        tint.set('#ffffff');\r
      }\r
      for (const physical of [blobPhysical, sprayPhysical]) {\r
        physical.color.copy(tint);\r
        physical.metalness = 0;\r
        physical.roughness = 0.2;\r
        physical.clearcoat = 0;\r
        physical.clearcoatRoughness = 0;\r
        physical.iridescence = 0;\r
        physical.envMapIntensity = 1;\r
        if (s.material === 'chrome') {\r
          physical.metalness = 1;\r
          physical.roughness = mix(0.3, 0.04, s.shine);\r
          physical.envMapIntensity = mix(0.9, 1.3, s.shine);\r
        } else if (s.material === 'jelly') {\r
          physical.roughness = mix(0.5, 0.18, s.shine);\r
          physical.clearcoat = 1;\r
          physical.clearcoatRoughness = mix(0.25, 0.02, s.shine);\r
          physical.envMapIntensity = mix(0.5, 0.9, s.shine);\r
        } else if (s.material === 'pearl') {\r
          physical.metalness = 0.35;\r
          physical.roughness = mix(0.4, 0.1, s.shine);\r
          physical.clearcoat = 1;\r
          physical.clearcoatRoughness = 0.05;\r
          physical.iridescence = 1;\r
          physical.iridescenceIOR = 1.75;\r
          physical.iridescenceThicknessRange = [240, 820];\r
          physical.envMapIntensity = 1.15;\r
        }\r
        physical.needsUpdate = true;\r
      }\r
      blobFlat.color.copy(tint);\r
      sprayFlat.color.copy(tint);\r
      const ink = s.material === 'ink';\r
      blob.material = ink ? blobFlat : blobPhysical;\r
      spray.material = ink ? sprayFlat : sprayPhysical;\r
      ground.material.opacity = 0.22;\r
      root.style.mixBlendMode = s.blend;\r
      const parent = root.parentElement;\r
      if (s.hideCursor && parent && !restoreCursor) {\r
        const previous = parent.style.cursor;\r
        parent.style.cursor = 'none';\r
        restoreCursor = () => {\r
          parent.style.cursor = previous;\r
        };\r
      } else if (!s.hideCursor && restoreCursor) {\r
        restoreCursor();\r
        restoreCursor = null;\r
      }\r
      start();\r
    };\r
\r
    const place = (x, y) => {\r
      for (const body of [anchor, ...core, ...chain]) {\r
        body.x = x;\r
        body.y = y;\r
        body.vx = 0;\r
        body.vy = 0;\r
      }\r
    };\r
\r
    const locate = event => {\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onMove = event => {\r
      if (event.pointerType === 'touch' && !pointer.down) return;\r
      const spot = locate(event);\r
      if (spot.inside && (!pointer.inside || !pointer.seen) && swell.value < 0.05) place(spot.x, spot.y);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.seen = true;\r
      const target = event.target instanceof Element ? event.target : null;\r
      pointer.hover = spot.inside && !!target?.closest(INTERACTIVE);\r
      start();\r
    };\r
\r
    const burst = () => {\r
      const s = settingsRef.current;\r
      const radius = (s.size / 2) * Math.cbrt(mass.value);\r
      for (const ball of core) {\r
        const angle = Math.random() * Math.PI * 2;\r
        const push = radius * mix(4, 9, Math.random()) * mix(0.6, 1.2, s.wobble);\r
        ball.vx += Math.cos(angle) * push;\r
        ball.vy += Math.sin(angle) * push;\r
      }\r
      if (!s.splash) return;\r
      const size = mix(0.12, 0.42, s.splashSize);\r
      const speed = mix(320, 1600, s.splashSpeed);\r
      const offset = Math.random() * Math.PI * 2;\r
      const fresh = [];\r
      let lost = 0;\r
      for (let i = 0; i < s.splashCount; i++) {\r
        const angle = offset + (i / s.splashCount) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / s.splashCount);\r
        const grain = Math.random();\r
        const pace = speed * mix(1.3, 0.75, grain) * mix(0.85, 1.15, Math.random());\r
        const r = (s.size / 2) * size * mix(0.65, 1.3, grain);\r
        const vx = Math.cos(angle) * pace + anchor.vx * 0.4;\r
        const vy = Math.sin(angle) * pace + anchor.vy * 0.4;\r
        lost += Math.pow(r / (s.size / 2), 3);\r
        fresh.push({\r
          x: anchor.x + Math.cos(angle) * radius * 0.35,\r
          y: anchor.y + Math.sin(angle) * radius * 0.35,\r
          vx,\r
          vy,\r
          cx: vx * 0.45,\r
          cy: vy * 0.45,\r
          r,\r
          share: 0,\r
          age: 0,\r
          life: DROP_LIFE,\r
          drag: 0.6,\r
          free: false,\r
          sink: -1\r
        });\r
      }\r
      const before = mass.value;\r
      mass.value = Math.max(0.2, before - clamp(lost * 2.4, 0.25, 0.7));\r
      mass.wait = 0.28;\r
      for (const drop of fresh) {\r
        drop.share = ((before - mass.value) * Math.pow(drop.r / (s.size / 2), 3)) / lost;\r
        if (drops.length >= MAX_DROPS) drops.shift();\r
        drops.push(drop);\r
      }\r
    };\r
\r
    const onDown = event => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      if (event.pointerType === 'touch' && swell.value < 0.05) place(spot.x, spot.y);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.seen = true;\r
      pointer.down = true;\r
      swell.velocity -= 2;\r
      if (!reducedMotion) burst();\r
      start();\r
    };\r
\r
    const onUp = event => {\r
      if (!pointer.down) return;\r
      pointer.down = false;\r
      swell.velocity += 1.2;\r
      if (event.pointerType === 'touch') pointer.inside = false;\r
      start();\r
    };\r
\r
    const onLeave = event => {\r
      if (event.relatedTarget) return;\r
      pointer.inside = false;\r
      pointer.down = false;\r
      start();\r
    };\r
\r
    const onBlur = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
      start();\r
    };\r
\r
    const integrate = (body, tx, ty, stiffness, damping, h, frameX = 0, frameY = 0) => {\r
      body.vx += ((tx - body.x) * stiffness - (body.vx - frameX) * damping) * h;\r
      body.vy += ((ty - body.y) * stiffness - (body.vy - frameY) * damping) * h;\r
      body.x += body.vx * h;\r
      body.y += body.vy * h;\r
    };\r
\r
    const step = dt => {\r
      const s = settingsRef.current;\r
      const radius = s.size / 2;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      const anchorStiffness = reducedMotion ? 2400 : mix(1200, 160, s.lag);\r
      const coreStiffness = mix(900, 260, s.lag);\r
      const linkStiffness = mix(30000, 1500, s.stretch);\r
      const linkDamping = 2 * Math.sqrt(linkStiffness) * mix(0.95, 0.65, s.wobble);\r
      const bounce = mix(0.95, 0.4, s.wobble);\r
      const visible = pointer.inside && pointer.seen;\r
      const swellTarget = visible ? (pointer.down ? 0.86 : pointer.hover ? 1.3 : 1) : 0;\r
\r
      if (!reducedMotion) clock += dt * 4 * Math.pow(s.morphSpeed, 1.5);\r
      const bend = s.morph * (0.6 + 0.4 * Math.sin(clock * 0.71 + seeds[0]));\r
      const bendAngle = clock * 0.23 + seeds[1];\r
      const fold = s.morph * 0.8 * (0.5 + 0.5 * Math.sin(clock * 0.53 + seeds[2]));\r
      const foldAngle = seeds[3] - clock * 0.17;\r
      let strain = 0;\r
      for (const ball of core) {\r
        ball.shape = bend * Math.cos(2 * (ball.angle - bendAngle)) + fold * Math.cos(3 * (ball.angle - foldAngle));\r
        strain += (ball.shape * ball.shape) / CORE;\r
      }\r
      const hold = 1 / (1 + 0.3 * strain);\r
      for (const ball of core) {\r
        const out = radius * clamp(0.14 + 0.75 * ball.shape, 0, 0.8) * hold;\r
        ball.tx = Math.cos(ball.angle) * out;\r
        ball.ty = Math.sin(ball.angle) * out;\r
        ball.grow = (1 + 0.35 * ball.shape) * hold;\r
      }\r
\r
      for (let i = 0; i < steps; i++) {\r
        integrate(anchor, pointer.x, pointer.y, anchorStiffness, 2 * Math.sqrt(anchorStiffness) * 0.9, h);\r
        for (const ball of core) {\r
          const k = coreStiffness * mix(1.3, 0.7, ball.spread);\r
          integrate(\r
            ball,\r
            anchor.x + ball.tx,\r
            anchor.y + ball.ty,\r
            k,\r
            2 * Math.sqrt(k) * bounce,\r
            h,\r
            anchor.vx,\r
            anchor.vy\r
          );\r
        }\r
        for (let c = 0; c < s.trail; c++) {\r
          const leader = c > 0 ? chain[c - 1] : anchor;\r
          integrate(chain[c], leader.x, leader.y, linkStiffness, linkDamping, h);\r
        }\r
        const fall = s.splashGravity * 2200;\r
        const inward = 1 - Math.exp(-18 * h);\r
        for (const drop of drops) {\r
          drop.age += h;\r
          if (drop.sink >= 0) {\r
            const sunk = Math.min(1, drop.sink + h / 0.14);\r
            mass.value = Math.min(1.35, mass.value + drop.share * (sunk - drop.sink));\r
            drop.sink = sunk;\r
            drop.x += (anchor.x - drop.x) * inward;\r
            drop.y += (anchor.y - drop.y) * inward;\r
            continue;\r
          }\r
          const ease = Math.exp(-drop.drag * h);\r
          drop.vx = drop.cx + (drop.vx - drop.cx) * ease;\r
          drop.vy = drop.cy + (drop.vy - drop.cy) * ease + fall * h;\r
          drop.x += drop.vx * h;\r
          drop.y += drop.vy * h;\r
        }\r
        swell.velocity +=\r
          ((swellTarget - swell.value) * 300 - swell.velocity * 2 * Math.sqrt(300) * mix(0.8, 0.38, s.wobble)) * h;\r
        swell.value += swell.velocity * h;\r
        if (swell.value < 0) {\r
          swell.value = 0;\r
          swell.velocity = Math.max(0, swell.velocity);\r
        }\r
      }\r
\r
      const body = radius * Math.max(swell.value, 0) * Math.cbrt(mass.value);\r
      const touching = (drop, bodies) =>\r
        bodies.some(part => part.size > 0 && Math.hypot(drop.x - part.x, drop.y - part.y) < part.size + drop.r * 0.9);\r
      const tail = s.trail > 0 ? chain[s.trail - 1] : core[CORE - 1];\r
      const rush = Math.hypot(anchor.vx, anchor.vy);\r
      if (visible && !reducedMotion) dripping += dt * s.drip * 26 * clamp((rush - 600) / 1800, 0, 1);\r
      while (dripping >= 1) {\r
        dripping -= 1;\r
        const r = radius * mix(0.07, 0.17, Math.random());\r
        if (Math.hypot(tail.x - anchor.x, tail.y - anchor.y) < body + r * 2) continue;\r
        const share = Math.pow(r / radius, 3) * 2.4;\r
        mass.value = Math.max(0.2, mass.value - share);\r
        if (drops.length >= MAX_DROPS) drops.shift();\r
        drops.push({\r
          x: tail.x + (Math.random() - 0.5) * r,\r
          y: tail.y + (Math.random() - 0.5) * r,\r
          vx: tail.vx * 0.2,\r
          vy: tail.vy * 0.2,\r
          cx: 0,\r
          cy: 0,\r
          r,\r
          share,\r
          age: 0,\r
          life: mix(2.5, 4, Math.random()),\r
          drag: 9,\r
          free: true,\r
          sink: -1\r
        });\r
      }\r
      for (let i = drops.length - 1; i >= 0; i--) {\r
        const drop = drops[i];\r
        if (\r
          drop.free &&\r
          drop.sink < 0 &&\r
          drop.age > 0.3 &&\r
          swell.value > 0.05 &&\r
          (touching(drop, core) || touching(drop, chain))\r
        ) {\r
          drop.sink = 0;\r
          const kick = Math.min(0.5, drop.share * 4);\r
          for (const ball of core) {\r
            ball.vx += (drop.vx - anchor.vx) * kick;\r
            ball.vy += (drop.vy - anchor.vy) * kick;\r
          }\r
        }\r
        const margin = drop.r * 3;\r
        const outside =\r
          drop.x < -margin || drop.y < -margin || drop.x > view.width + margin || drop.y > view.height + margin;\r
        if (outside || drop.sink >= 1 || drop.age > drop.life) drops.splice(i, 1);\r
      }\r
      if (mass.wait > 0) mass.wait -= dt;\r
      else mass.value += (1 - mass.value) * (1 - Math.exp(-dt * mix(0.9, 6, s.regrow)));\r
    };\r
\r
    const build = () => {\r
      const s = settingsRef.current;\r
      const full = (s.size / 2) * Math.max(swell.value, 0);\r
      const radius = full * Math.cbrt(mass.value);\r
      const present = radius >= 0.5;\r
      const blend = radius * mix(0.3, 0.9, s.goo);\r
      const release = radius + blend;\r
      const lift = mix(0.3, 1, s.depth);\r
      const room = MAX_PARTS - CORE - s.trail;\r
      const parts = [];\r
      const merging = [];\r
      spray.count = 0;\r
      for (const part of core) part.size = 0;\r
      for (const part of chain) part.size = 0;\r
\r
      for (const drop of drops) {\r
        const gap = Math.hypot(drop.x - anchor.x, drop.y - anchor.y);\r
        const rise = drop.free || !present ? 1 : clamp((gap - radius * 0.55) / (radius * 0.6), 0, 1);\r
        const fade = Math.min(rise * rise * (3 - 2 * rise), drop.age / 0.06, (drop.life - drop.age) / 0.9);\r
        const r = drop.r * fade * (drop.sink < 0 ? 1 : Math.cbrt(1 - drop.sink));\r
        if (r < 0.6) continue;\r
        if (present && merging.length < room && (drop.sink >= 0 || (!drop.free && gap < release + r))) {\r
          const firm = drop.sink >= 0 ? 0 : clamp((gap - radius * 0.6) / (release + r - radius * 0.6), 0, 1);\r
          merging.push([\r
            drop.x,\r
            drop.y,\r
            drop.x,\r
            drop.y,\r
            r,\r
            r,\r
            Math.min(blend, r * 1.2) * (1 - firm * firm * (3 - 2 * firm))\r
          ]);\r
          continue;\r
        }\r
        drop.free = true;\r
        if (spray.count >= MAX_DROPS) continue;\r
        const speed = Math.hypot(drop.vx, drop.vy);\r
        const settle = present ? clamp((gap - release - r) / (r * 2), 0, 1) : 1;\r
        const pull = 1 + Math.min(speed / 2600, 0.6) * s.stretch * settle;\r
        stretchAxis.set(drop.vx, -drop.vy, 0);\r
        if (speed > 1) spin.setFromUnitVectors(xAxis, stretchAxis.normalize());\r
        else spin.identity();\r
        spot.set(drop.x - view.width / 2, view.height / 2 - drop.y, 0);\r
        extent.set(r * pull, r / Math.sqrt(pull), (r / Math.sqrt(pull)) * lift);\r
        placement.compose(spot, spin, extent);\r
        spray.setMatrixAt(spray.count, placement);\r
        spray.count++;\r
      }\r
      spray.instanceMatrix.needsUpdate = true;\r
\r
      const floor = -(s.size / 2) * 0.9 * lift;\r
      ground.position.set(0, 0, floor);\r
      key.target.position.set(0, 0, floor);\r
      key.position.set(-0.42, 0.5, 0.76).multiplyScalar(Math.max(view.width, view.height) * 2);\r
      if (!present) return { blob: false, spray: spray.count > 0 };\r
\r
      for (const ball of core) {\r
        const r = radius * HEAD_RADIUS * ball.grow;\r
        ball.size = r + radius * 0.3;\r
        parts.push([ball.x, ball.y, ball.x, ball.y, r, r, radius * HEAD_BLEND]);\r
      }\r
      const route = [anchor, ...chain.slice(0, s.trail)];\r
      const marks = [0];\r
      for (let c = 1; c < route.length; c++) {\r
        marks.push(marks[c - 1] + Math.hypot(route[c].x - route[c - 1].x, route[c].y - route[c - 1].y));\r
      }\r
      const length = marks[marks.length - 1];\r
      const grown = clamp(length / radius, 0, 1);\r
      const start = radius * mix(0.6, 0.95, grown * grown * (3 - 2 * grown));\r
      const taper = mix(0.75, 1.6, clamp(length / (radius * 6), 0, 1));\r
      const thickness = u => mix(radius * 0.1, start, Math.pow(1 - u, taper));\r
      const sample = distance => {\r
        let c = 1;\r
        while (c < marks.length - 1 && marks[c] < distance) c++;\r
        const span = marks[c] - marks[c - 1];\r
        const t = span > 0 ? clamp((distance - marks[c - 1]) / span, 0, 1) : 0;\r
        return [mix(route[c - 1].x, route[c].x, t), mix(route[c - 1].y, route[c].y, t)];\r
      };\r
      for (let c = 0; c < s.trail; c++) chain[c].size = thickness(length > 0 ? marks[c + 1] / length : 1);\r
      let previous = [anchor.x, anchor.y];\r
      for (let m = 1; m <= s.trail; m++) {\r
        const next = sample((length * m) / s.trail);\r
        parts.push([\r
          previous[0],\r
          previous[1],\r
          next[0],\r
          next[1],\r
          thickness((m - 1) / s.trail),\r
          thickness(m / s.trail),\r
          radius * 0.06\r
        ]);\r
        previous = next;\r
      }\r
      parts.push(...merging);\r
\r
      const seg = field.blobSeg.value;\r
      const info = field.blobInfo.value;\r
      let minX = Infinity;\r
      let minY = Infinity;\r
      let maxX = -Infinity;\r
      let maxY = -Infinity;\r
      const join = radius * mix(0.2, 0.6, s.goo);\r
      let top = join;\r
      parts.forEach(([ax, ay, bx, by, r1, r2, k], i) => {\r
        const x1 = ax - view.width / 2;\r
        const y1 = view.height / 2 - ay;\r
        const x2 = bx - view.width / 2;\r
        const y2 = view.height / 2 - by;\r
        const reach = Math.max(r1, r2) + k;\r
        seg.set([x1, y1, x2, y2], i * 4);\r
        info.set([r1, r2, k, 0], i * 4);\r
        minX = Math.min(minX, x1 - reach, x2 - reach);\r
        maxX = Math.max(maxX, x1 + reach, x2 + reach);\r
        minY = Math.min(minY, y1 - reach, y2 - reach);\r
        maxY = Math.max(maxY, y1 + reach, y2 + reach);\r
        top = Math.max(top, reach);\r
      });\r
      field.blobCount.value = parts.length;\r
      field.blobHeadEnd.value = CORE;\r
      field.blobTubeEnd.value = CORE + s.trail;\r
      field.blobJoin.value = join;\r
      field.blobTop.value = top;\r
      field.blobRef.value = radius;\r
      field.blobLift.value = lift;\r
      blob.position.set((minX + maxX) / 2, (minY + maxY) / 2, 0);\r
      blob.scale.set(maxX - minX + 4, maxY - minY + 4, 1);\r
      return { blob: true, spray: spray.count > 0 };\r
    };\r
\r
    const tick = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      step(dt);\r
      const built = build();\r
      const shown = built.blob || built.spray;\r
      blob.visible = built.blob;\r
      spray.visible = built.spray;\r
      ground.visible = shown && settingsRef.current.shadow;\r
      renderer.render(scene, camera);\r
      let energy =\r
        Math.hypot(anchor.vx, anchor.vy) +\r
        Math.abs(swell.velocity) * 40 +\r
        drops.length * 100 +\r
        Math.abs(1 - mass.value) * 400;\r
      for (const ball of core) energy += Math.hypot(ball.vx, ball.vy);\r
      for (let c = 0; c < settingsRef.current.trail; c++) energy += Math.hypot(chain[c].vx, chain[c].vy);\r
      const breathing =\r
        pointer.inside && settingsRef.current.morph > 0 && settingsRef.current.morphSpeed > 0 && !reducedMotion;\r
      calm = energy > 1.5 || breathing ? 0 : calm + dt;\r
      if (!shown && !pointer.inside) return;\r
      if (calm > 0.4) return;\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    function start() {\r
      if (raf || !alive) return;\r
      calm = 0;\r
      last = performance.now();\r
      raf = requestAnimationFrame(tick);\r
    }\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerup', onUp, { passive: true });\r
    window.addEventListener('pointercancel', onUp, { passive: true });\r
    document.addEventListener('pointerout', onLeave);\r
    window.addEventListener('blur', onBlur);\r
\r
    applyRef.current = apply;\r
    resize();\r
    apply();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      applyRef.current = null;\r
      restoreCursor?.();\r
      resizeObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      document.removeEventListener('pointerout', onLeave);\r
      window.removeEventListener('blur', onBlur);\r
      blob.geometry.dispose();\r
      blobPhysical.dispose();\r
      blobFlat.dispose();\r
      cast.dispose();\r
      sphere.dispose();\r
      spray.dispose();\r
      sprayPhysical.dispose();\r
      sprayFlat.dispose();\r
      ground.geometry.dispose();\r
      ground.material.dispose();\r
      environment.dispose();\r
      renderer.dispose();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return <div ref={rootRef} className={\`blob-cursor \${className}\`.trim()} style={style} />;\r
};\r
\r
export default BlobCursor;\r
`,n=`.blob-cursor {\r
  position: absolute;\r
  inset: 0;\r
  overflow: hidden;\r
  pointer-events: none;\r
}\r
\r
.blob-cursor-canvas {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import * as THREE from 'three';\r
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';\r
\r
const CORE = 8;\r
const HEAD_RADIUS = 0.7;\r
const HEAD_BLEND = 0.6;\r
const MAX_TRAIL = 16;\r
const MAX_DROPS = 96;\r
const MAX_PARTS = 48;\r
const DROP_LIFE = 30;\r
const MATERIALS = ['chrome', 'jelly', 'pearl', 'ink'];\r
const BLENDS = ['normal', 'difference', 'exclusion', 'multiply', 'screen', 'overlay'];\r
const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [data-blob-grow]';\r
\r
const FIELD = \`\r
#define BLOB_MAX \${MAX_PARTS}\r
uniform vec4 blobSeg[BLOB_MAX];\r
uniform vec4 blobInfo[BLOB_MAX];\r
uniform int blobCount;\r
uniform int blobHeadEnd;\r
uniform int blobTubeEnd;\r
uniform float blobJoin;\r
uniform float blobLift;\r
uniform float blobTop;\r
uniform float blobRef;\r
uniform vec2 blobDepth;\r
varying vec2 vBlobSpot;\r
\r
vec4 blobPart(vec2 p, int i, float z) {\r
  vec4 seg = blobSeg[i];\r
  vec2 r = blobInfo[i].xy;\r
  vec2 axis = seg.zw - seg.xy;\r
  float len = length(axis);\r
  if (len <= abs(r.x - r.y) + 0.001) {\r
    vec2 d = p - (r.x >= r.y ? seg.xy : seg.zw);\r
    float dist = max(sqrt(dot(d, d) + z * z), 0.0001);\r
    return vec4(dist - max(r.x, r.y), vec3(d, z) / dist);\r
  }\r
  vec2 dir = axis / len;\r
  vec2 rel = p - seg.xy;\r
  float u = dot(rel, dir);\r
  vec2 side = rel - dir * u;\r
  float w = sqrt(dot(side, side) + z * z);\r
  float b = (r.x - r.y) / len;\r
  float a = sqrt(1.0 - b * b);\r
  float along = a * u - b * w;\r
  vec3 f = vec3(a * w + b * u - r.x, a, b);\r
  if (along < 0.0) {\r
    float d = max(sqrt(w * w + u * u), 0.0001);\r
    f = vec3(d - r.x, w / d, u / d);\r
  } else if (along > a * len) {\r
    float d = max(sqrt(w * w + (u - len) * (u - len)), 0.0001);\r
    f = vec3(d - r.y, w / d, (u - len) / d);\r
  }\r
  return vec4(f.x, vec3(dir * f.z, 0.0) + vec3(side, z) / max(w, 0.0001) * f.y);\r
}\r
\r
vec4 blobSmooth(vec4 a, vec4 b, float k) {\r
  float h = k > 0.0 ? max(k - abs(a.x - b.x), 0.0) / k : 0.0;\r
  float weight = b.x < a.x ? 1.0 - 0.5 * h * h : 0.5 * h * h;\r
  return vec4(min(a.x, b.x) - h * h * h * k / 6.0, mix(a.yzw, b.yzw, weight));\r
}\r
\r
vec4 blobShape(vec2 p, float z) {\r
  vec4 body = blobPart(p, 0, z);\r
  for (int i = 1; i < BLOB_MAX; i++) {\r
    if (i >= blobHeadEnd) break;\r
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);\r
  }\r
  if (blobTubeEnd > blobHeadEnd) {\r
    vec4 tube = blobPart(p, blobHeadEnd, z);\r
    for (int i = blobHeadEnd + 1; i < BLOB_MAX; i++) {\r
      if (i >= blobTubeEnd) break;\r
      tube = blobSmooth(tube, blobPart(p, i, z), blobInfo[i].z);\r
    }\r
    body = blobSmooth(body, tube, blobJoin);\r
  }\r
  for (int i = blobTubeEnd; i < BLOB_MAX; i++) {\r
    if (i >= blobCount) break;\r
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);\r
  }\r
  return body;\r
}\r
\`;\r
\r
const SURFACE = \`\r
  vec4 blobBase = blobShape(vBlobSpot, 0.0);\r
  float blobAlpha = clamp(0.5 - blobBase.x / max(fwidth(blobBase.x), 0.0001), 0.0, 1.0);\r
  if (blobAlpha <= 0.0) discard;\r
  float blobLow = 0.0;\r
  float blobHigh = blobTop;\r
  float blobZ = min(sqrt(max(-blobBase.x, 0.0) * max(2.0 * blobRef + blobBase.x, 0.0)), blobTop);\r
  for (int k = 0; k < 8; k++) {\r
    vec4 blobTry = blobShape(vBlobSpot, blobZ);\r
    if (blobTry.x > 0.0) blobHigh = blobZ;\r
    else blobLow = blobZ;\r
    float blobNext = blobZ - blobTry.x / max(blobTry.w, 0.0001);\r
    blobZ = blobNext > blobLow && blobNext < blobHigh ? blobNext : 0.5 * (blobLow + blobHigh);\r
  }\r
  vec4 blobAt = blobShape(vBlobSpot, blobZ);\r
  vec3 blobNormal = normalize(vec3(blobAt.yz, blobAt.w / blobLift));\r
  gl_FragDepth = blobDepth.x - blobDepth.y * blobZ * blobLift;\r
\`;\r
\r
const SURFACE_NORMAL = \`\r
  float faceDirection = 1.0;\r
  vec3 normal = normalize((viewMatrix * vec4(blobNormal, 0.0)).xyz);\r
  vec3 nonPerturbedNormal = normal;\r
\`;\r
\r
const sculpt = (shader, uniforms, body) => {\r
  Object.assign(shader.uniforms, uniforms);\r
  shader.vertexShader = shader.vertexShader\r
    .replace('void main() {', 'varying vec2 vBlobSpot;\\nvoid main() {')\r
    .replace(\r
      '#include <project_vertex>',\r
      '#include <project_vertex>\\n\\tvBlobSpot = (modelMatrix * vec4(transformed, 1.0)).xy;'\r
    );\r
  shader.fragmentShader = shader.fragmentShader\r
    .replace('void main() {', \`\${FIELD}\\nvoid main() {\\n\${body}\`)\r
    .replace(\r
      'vec4 diffuseColor = vec4( diffuse, opacity );',\r
      'vec4 diffuseColor = vec4( diffuse, opacity * blobAlpha );'\r
    )\r
    .replace('#include <normal_fragment_begin>', SURFACE_NORMAL);\r
};\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const mix = (a, b, t) => a + (b - a) * t;\r
\r
const createBody = () => ({ x: 0, y: 0, vx: 0, vy: 0, size: 0 });\r
\r
const BlobCursor = ({\r
  material = 'chrome',\r
  color = '#3B82F6',\r
  size = 140,\r
  morph = 0,\r
  morphSpeed = 0.4,\r
  depth = 1,\r
  trail = 16,\r
  lag = 0.55,\r
  goo = 1,\r
  stretch = 0.6,\r
  wobble = 1,\r
  drip = 0,\r
  splash = true,\r
  splashCount = 6,\r
  splashSpeed = 0.5,\r
  splashSize = 0.5,\r
  splashGravity = 0,\r
  regrow = 0.5,\r
  shine = 1,\r
  shadow = false,\r
  blend = 'normal',\r
  hideCursor = true,\r
  className = '',\r
  style\r
}) => {\r
  const rootRef = useRef(null);\r
  const settingsRef = useRef(null);\r
  const applyRef = useRef(null);\r
\r
  settingsRef.current = {\r
    material: MATERIALS.includes(material) ? material : 'chrome',\r
    color,\r
    size: clamp(size, 12, 400),\r
    morph: clamp(morph, 0, 1),\r
    morphSpeed: clamp(morphSpeed, 0, 1),\r
    depth: clamp(depth, 0, 1),\r
    trail: clamp(Math.round(trail), 0, MAX_TRAIL),\r
    lag: clamp(lag, 0, 1),\r
    goo: clamp(goo, 0, 1),\r
    stretch: clamp(stretch, 0, 1),\r
    wobble: clamp(wobble, 0, 1),\r
    drip: clamp(drip, 0, 1),\r
    splash,\r
    splashCount: clamp(Math.round(splashCount), 1, 32),\r
    splashSpeed: clamp(splashSpeed, 0, 1),\r
    splashSize: clamp(splashSize, 0, 1),\r
    splashGravity: clamp(splashGravity, 0, 1),\r
    regrow: clamp(regrow, 0, 1),\r
    shine: clamp(shine, 0, 1),\r
    shadow,\r
    blend: BLENDS.includes(blend) ? blend : 'normal',\r
    hideCursor\r
  };\r
\r
  useEffect(() => {\r
    applyRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
\r
    let renderer;\r
    try {\r
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true });\r
    } catch {\r
      return undefined;\r
    }\r
    renderer.setClearColor(0x000000, 0);\r
    renderer.outputColorSpace = THREE.SRGBColorSpace;\r
    renderer.toneMapping = THREE.ACESFilmicToneMapping;\r
    renderer.toneMappingExposure = 1;\r
    renderer.shadowMap.enabled = true;\r
    renderer.shadowMap.type = THREE.VSMShadowMap;\r
    renderer.shadowMap.autoUpdate = true;\r
    const canvas = renderer.domElement;\r
    canvas.className = 'block w-full h-full';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    root.appendChild(canvas);\r
\r
    const scene = new THREE.Scene();\r
    const pmrem = new THREE.PMREMGenerator(renderer);\r
    const room = new RoomEnvironment();\r
    const environment = pmrem.fromScene(room, 0.03);\r
    pmrem.dispose();\r
    scene.environment = environment.texture;\r
    scene.environmentRotation.set(-0.9, 0.35, 0);\r
\r
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 6000);\r
    camera.position.set(0, 0, 2000);\r
\r
    const key = new THREE.DirectionalLight(0xffffff, 1.4);\r
    key.castShadow = true;\r
    key.shadow.mapSize.set(2048, 2048);\r
    key.shadow.radius = 14;\r
    key.shadow.blurSamples = 20;\r
    key.shadow.bias = -0.0004;\r
    scene.add(key, key.target);\r
\r
    const field = {\r
      blobSeg: { value: new Float32Array(MAX_PARTS * 4) },\r
      blobInfo: { value: new Float32Array(MAX_PARTS * 4) },\r
      blobCount: { value: 0 },\r
      blobHeadEnd: { value: 0 },\r
      blobTubeEnd: { value: 0 },\r
      blobJoin: { value: 0 },\r
      blobLift: { value: 1 },\r
      blobTop: { value: 1 },\r
      blobRef: { value: 1 },\r
      blobDepth: {\r
        value: new THREE.Vector2(\r
          (camera.position.z - camera.near) / (camera.far - camera.near),\r
          1 / (camera.far - camera.near)\r
        )\r
      }\r
    };\r
    const coat = shader => sculpt(shader, field, SURFACE);\r
    const blobPhysical = new THREE.MeshPhysicalMaterial({ transparent: true });\r
    const blobFlat = new THREE.MeshBasicMaterial({ transparent: true });\r
    blobPhysical.onBeforeCompile = coat;\r
    blobFlat.onBeforeCompile = coat;\r
    const cast = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });\r
    cast.onBeforeCompile = shader => sculpt(shader, field, 'if (blobShape(vBlobSpot, 0.0).x > 0.0) discard;');\r
    const sprayPhysical = new THREE.MeshPhysicalMaterial();\r
    const sprayFlat = new THREE.MeshBasicMaterial();\r
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blobPhysical);\r
    blob.castShadow = true;\r
    blob.frustumCulled = false;\r
    blob.customDepthMaterial = cast;\r
    scene.add(blob);\r
\r
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.22 }));\r
    ground.receiveShadow = true;\r
    scene.add(ground);\r
\r
    const sphere = new THREE.SphereGeometry(1, 32, 24);\r
    const spray = new THREE.InstancedMesh(sphere, sprayPhysical, MAX_DROPS);\r
    spray.castShadow = true;\r
    spray.frustumCulled = false;\r
    spray.count = 0;\r
    scene.add(spray);\r
    const placement = new THREE.Matrix4();\r
    const spin = new THREE.Quaternion();\r
    const stretchAxis = new THREE.Vector3();\r
    const xAxis = new THREE.Vector3(1, 0, 0);\r
    const spot = new THREE.Vector3();\r
    const extent = new THREE.Vector3();\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, down: false, hover: false, seen: false };\r
    const anchor = createBody();\r
    const core = Array.from({ length: CORE }, (_, i) => ({\r
      ...createBody(),\r
      spread: i / (CORE - 1),\r
      angle: (i / CORE) * Math.PI * 2,\r
      shape: 0,\r
      tx: 0,\r
      ty: 0,\r
      grow: 1\r
    }));\r
    const chain = Array.from({ length: MAX_TRAIL }, createBody);\r
    const drops = [];\r
    const swell = { value: 0, velocity: 0 };\r
    const mass = { value: 1, wait: 0 };\r
    const seeds = Array.from({ length: 4 }, () => Math.random() * Math.PI * 2);\r
    let clock = Math.random() * 60;\r
    let dripping = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
    let restoreCursor = null;\r
    let calm = 0;\r
\r
    const resize = () => {\r
      view.width = Math.max(1, root.clientWidth);\r
      view.height = Math.max(1, root.clientHeight);\r
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
      renderer.setSize(view.width, view.height, false);\r
      camera.left = -view.width / 2;\r
      camera.right = view.width / 2;\r
      camera.top = view.height / 2;\r
      camera.bottom = -view.height / 2;\r
      camera.updateProjectionMatrix();\r
      const reach = Math.max(view.width, view.height) * 0.75;\r
      const frustum = key.shadow.camera;\r
      frustum.left = -reach;\r
      frustum.right = reach;\r
      frustum.top = reach;\r
      frustum.bottom = -reach;\r
      frustum.near = 1;\r
      frustum.far = reach * 6;\r
      frustum.updateProjectionMatrix();\r
      ground.scale.set(view.width * 1.5, view.height * 1.5, 1);\r
      start();\r
    };\r
\r
    const apply = () => {\r
      const s = settingsRef.current;\r
      const tint = new THREE.Color();\r
      try {\r
        tint.set(s.color);\r
      } catch {\r
        tint.set('#ffffff');\r
      }\r
      for (const physical of [blobPhysical, sprayPhysical]) {\r
        physical.color.copy(tint);\r
        physical.metalness = 0;\r
        physical.roughness = 0.2;\r
        physical.clearcoat = 0;\r
        physical.clearcoatRoughness = 0;\r
        physical.iridescence = 0;\r
        physical.envMapIntensity = 1;\r
        if (s.material === 'chrome') {\r
          physical.metalness = 1;\r
          physical.roughness = mix(0.3, 0.04, s.shine);\r
          physical.envMapIntensity = mix(0.9, 1.3, s.shine);\r
        } else if (s.material === 'jelly') {\r
          physical.roughness = mix(0.5, 0.18, s.shine);\r
          physical.clearcoat = 1;\r
          physical.clearcoatRoughness = mix(0.25, 0.02, s.shine);\r
          physical.envMapIntensity = mix(0.5, 0.9, s.shine);\r
        } else if (s.material === 'pearl') {\r
          physical.metalness = 0.35;\r
          physical.roughness = mix(0.4, 0.1, s.shine);\r
          physical.clearcoat = 1;\r
          physical.clearcoatRoughness = 0.05;\r
          physical.iridescence = 1;\r
          physical.iridescenceIOR = 1.75;\r
          physical.iridescenceThicknessRange = [240, 820];\r
          physical.envMapIntensity = 1.15;\r
        }\r
        physical.needsUpdate = true;\r
      }\r
      blobFlat.color.copy(tint);\r
      sprayFlat.color.copy(tint);\r
      const ink = s.material === 'ink';\r
      blob.material = ink ? blobFlat : blobPhysical;\r
      spray.material = ink ? sprayFlat : sprayPhysical;\r
      ground.material.opacity = 0.22;\r
      root.style.mixBlendMode = s.blend;\r
      const parent = root.parentElement;\r
      if (s.hideCursor && parent && !restoreCursor) {\r
        const previous = parent.style.cursor;\r
        parent.style.cursor = 'none';\r
        restoreCursor = () => {\r
          parent.style.cursor = previous;\r
        };\r
      } else if (!s.hideCursor && restoreCursor) {\r
        restoreCursor();\r
        restoreCursor = null;\r
      }\r
      start();\r
    };\r
\r
    const place = (x, y) => {\r
      for (const body of [anchor, ...core, ...chain]) {\r
        body.x = x;\r
        body.y = y;\r
        body.vx = 0;\r
        body.vy = 0;\r
      }\r
    };\r
\r
    const locate = event => {\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onMove = event => {\r
      if (event.pointerType === 'touch' && !pointer.down) return;\r
      const spot = locate(event);\r
      if (spot.inside && (!pointer.inside || !pointer.seen) && swell.value < 0.05) place(spot.x, spot.y);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.seen = true;\r
      const target = event.target instanceof Element ? event.target : null;\r
      pointer.hover = spot.inside && !!target?.closest(INTERACTIVE);\r
      start();\r
    };\r
\r
    const burst = () => {\r
      const s = settingsRef.current;\r
      const radius = (s.size / 2) * Math.cbrt(mass.value);\r
      for (const ball of core) {\r
        const angle = Math.random() * Math.PI * 2;\r
        const push = radius * mix(4, 9, Math.random()) * mix(0.6, 1.2, s.wobble);\r
        ball.vx += Math.cos(angle) * push;\r
        ball.vy += Math.sin(angle) * push;\r
      }\r
      if (!s.splash) return;\r
      const size = mix(0.12, 0.42, s.splashSize);\r
      const speed = mix(320, 1600, s.splashSpeed);\r
      const offset = Math.random() * Math.PI * 2;\r
      const fresh = [];\r
      let lost = 0;\r
      for (let i = 0; i < s.splashCount; i++) {\r
        const angle = offset + (i / s.splashCount) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / s.splashCount);\r
        const grain = Math.random();\r
        const pace = speed * mix(1.3, 0.75, grain) * mix(0.85, 1.15, Math.random());\r
        const r = (s.size / 2) * size * mix(0.65, 1.3, grain);\r
        const vx = Math.cos(angle) * pace + anchor.vx * 0.4;\r
        const vy = Math.sin(angle) * pace + anchor.vy * 0.4;\r
        lost += Math.pow(r / (s.size / 2), 3);\r
        fresh.push({\r
          x: anchor.x + Math.cos(angle) * radius * 0.35,\r
          y: anchor.y + Math.sin(angle) * radius * 0.35,\r
          vx,\r
          vy,\r
          cx: vx * 0.45,\r
          cy: vy * 0.45,\r
          r,\r
          share: 0,\r
          age: 0,\r
          life: DROP_LIFE,\r
          drag: 0.6,\r
          free: false,\r
          sink: -1\r
        });\r
      }\r
      const before = mass.value;\r
      mass.value = Math.max(0.2, before - clamp(lost * 2.4, 0.25, 0.7));\r
      mass.wait = 0.28;\r
      for (const drop of fresh) {\r
        drop.share = ((before - mass.value) * Math.pow(drop.r / (s.size / 2), 3)) / lost;\r
        if (drops.length >= MAX_DROPS) drops.shift();\r
        drops.push(drop);\r
      }\r
    };\r
\r
    const onDown = event => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      if (event.pointerType === 'touch' && swell.value < 0.05) place(spot.x, spot.y);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.seen = true;\r
      pointer.down = true;\r
      swell.velocity -= 2;\r
      if (!reducedMotion) burst();\r
      start();\r
    };\r
\r
    const onUp = event => {\r
      if (!pointer.down) return;\r
      pointer.down = false;\r
      swell.velocity += 1.2;\r
      if (event.pointerType === 'touch') pointer.inside = false;\r
      start();\r
    };\r
\r
    const onLeave = event => {\r
      if (event.relatedTarget) return;\r
      pointer.inside = false;\r
      pointer.down = false;\r
      start();\r
    };\r
\r
    const onBlur = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
      start();\r
    };\r
\r
    const integrate = (body, tx, ty, stiffness, damping, h, frameX = 0, frameY = 0) => {\r
      body.vx += ((tx - body.x) * stiffness - (body.vx - frameX) * damping) * h;\r
      body.vy += ((ty - body.y) * stiffness - (body.vy - frameY) * damping) * h;\r
      body.x += body.vx * h;\r
      body.y += body.vy * h;\r
    };\r
\r
    const step = dt => {\r
      const s = settingsRef.current;\r
      const radius = s.size / 2;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      const anchorStiffness = reducedMotion ? 2400 : mix(1200, 160, s.lag);\r
      const coreStiffness = mix(900, 260, s.lag);\r
      const linkStiffness = mix(30000, 1500, s.stretch);\r
      const linkDamping = 2 * Math.sqrt(linkStiffness) * mix(0.95, 0.65, s.wobble);\r
      const bounce = mix(0.95, 0.4, s.wobble);\r
      const visible = pointer.inside && pointer.seen;\r
      const swellTarget = visible ? (pointer.down ? 0.86 : pointer.hover ? 1.3 : 1) : 0;\r
\r
      if (!reducedMotion) clock += dt * 4 * Math.pow(s.morphSpeed, 1.5);\r
      const bend = s.morph * (0.6 + 0.4 * Math.sin(clock * 0.71 + seeds[0]));\r
      const bendAngle = clock * 0.23 + seeds[1];\r
      const fold = s.morph * 0.8 * (0.5 + 0.5 * Math.sin(clock * 0.53 + seeds[2]));\r
      const foldAngle = seeds[3] - clock * 0.17;\r
      let strain = 0;\r
      for (const ball of core) {\r
        ball.shape = bend * Math.cos(2 * (ball.angle - bendAngle)) + fold * Math.cos(3 * (ball.angle - foldAngle));\r
        strain += (ball.shape * ball.shape) / CORE;\r
      }\r
      const hold = 1 / (1 + 0.3 * strain);\r
      for (const ball of core) {\r
        const out = radius * clamp(0.14 + 0.75 * ball.shape, 0, 0.8) * hold;\r
        ball.tx = Math.cos(ball.angle) * out;\r
        ball.ty = Math.sin(ball.angle) * out;\r
        ball.grow = (1 + 0.35 * ball.shape) * hold;\r
      }\r
\r
      for (let i = 0; i < steps; i++) {\r
        integrate(anchor, pointer.x, pointer.y, anchorStiffness, 2 * Math.sqrt(anchorStiffness) * 0.9, h);\r
        for (const ball of core) {\r
          const k = coreStiffness * mix(1.3, 0.7, ball.spread);\r
          integrate(\r
            ball,\r
            anchor.x + ball.tx,\r
            anchor.y + ball.ty,\r
            k,\r
            2 * Math.sqrt(k) * bounce,\r
            h,\r
            anchor.vx,\r
            anchor.vy\r
          );\r
        }\r
        for (let c = 0; c < s.trail; c++) {\r
          const leader = c > 0 ? chain[c - 1] : anchor;\r
          integrate(chain[c], leader.x, leader.y, linkStiffness, linkDamping, h);\r
        }\r
        const fall = s.splashGravity * 2200;\r
        const inward = 1 - Math.exp(-18 * h);\r
        for (const drop of drops) {\r
          drop.age += h;\r
          if (drop.sink >= 0) {\r
            const sunk = Math.min(1, drop.sink + h / 0.14);\r
            mass.value = Math.min(1.35, mass.value + drop.share * (sunk - drop.sink));\r
            drop.sink = sunk;\r
            drop.x += (anchor.x - drop.x) * inward;\r
            drop.y += (anchor.y - drop.y) * inward;\r
            continue;\r
          }\r
          const ease = Math.exp(-drop.drag * h);\r
          drop.vx = drop.cx + (drop.vx - drop.cx) * ease;\r
          drop.vy = drop.cy + (drop.vy - drop.cy) * ease + fall * h;\r
          drop.x += drop.vx * h;\r
          drop.y += drop.vy * h;\r
        }\r
        swell.velocity +=\r
          ((swellTarget - swell.value) * 300 - swell.velocity * 2 * Math.sqrt(300) * mix(0.8, 0.38, s.wobble)) * h;\r
        swell.value += swell.velocity * h;\r
        if (swell.value < 0) {\r
          swell.value = 0;\r
          swell.velocity = Math.max(0, swell.velocity);\r
        }\r
      }\r
\r
      const body = radius * Math.max(swell.value, 0) * Math.cbrt(mass.value);\r
      const touching = (drop, bodies) =>\r
        bodies.some(part => part.size > 0 && Math.hypot(drop.x - part.x, drop.y - part.y) < part.size + drop.r * 0.9);\r
      const tail = s.trail > 0 ? chain[s.trail - 1] : core[CORE - 1];\r
      const rush = Math.hypot(anchor.vx, anchor.vy);\r
      if (visible && !reducedMotion) dripping += dt * s.drip * 26 * clamp((rush - 600) / 1800, 0, 1);\r
      while (dripping >= 1) {\r
        dripping -= 1;\r
        const r = radius * mix(0.07, 0.17, Math.random());\r
        if (Math.hypot(tail.x - anchor.x, tail.y - anchor.y) < body + r * 2) continue;\r
        const share = Math.pow(r / radius, 3) * 2.4;\r
        mass.value = Math.max(0.2, mass.value - share);\r
        if (drops.length >= MAX_DROPS) drops.shift();\r
        drops.push({\r
          x: tail.x + (Math.random() - 0.5) * r,\r
          y: tail.y + (Math.random() - 0.5) * r,\r
          vx: tail.vx * 0.2,\r
          vy: tail.vy * 0.2,\r
          cx: 0,\r
          cy: 0,\r
          r,\r
          share,\r
          age: 0,\r
          life: mix(2.5, 4, Math.random()),\r
          drag: 9,\r
          free: true,\r
          sink: -1\r
        });\r
      }\r
      for (let i = drops.length - 1; i >= 0; i--) {\r
        const drop = drops[i];\r
        if (\r
          drop.free &&\r
          drop.sink < 0 &&\r
          drop.age > 0.3 &&\r
          swell.value > 0.05 &&\r
          (touching(drop, core) || touching(drop, chain))\r
        ) {\r
          drop.sink = 0;\r
          const kick = Math.min(0.5, drop.share * 4);\r
          for (const ball of core) {\r
            ball.vx += (drop.vx - anchor.vx) * kick;\r
            ball.vy += (drop.vy - anchor.vy) * kick;\r
          }\r
        }\r
        const margin = drop.r * 3;\r
        const outside =\r
          drop.x < -margin || drop.y < -margin || drop.x > view.width + margin || drop.y > view.height + margin;\r
        if (outside || drop.sink >= 1 || drop.age > drop.life) drops.splice(i, 1);\r
      }\r
      if (mass.wait > 0) mass.wait -= dt;\r
      else mass.value += (1 - mass.value) * (1 - Math.exp(-dt * mix(0.9, 6, s.regrow)));\r
    };\r
\r
    const build = () => {\r
      const s = settingsRef.current;\r
      const full = (s.size / 2) * Math.max(swell.value, 0);\r
      const radius = full * Math.cbrt(mass.value);\r
      const present = radius >= 0.5;\r
      const blend = radius * mix(0.3, 0.9, s.goo);\r
      const release = radius + blend;\r
      const lift = mix(0.3, 1, s.depth);\r
      const room = MAX_PARTS - CORE - s.trail;\r
      const parts = [];\r
      const merging = [];\r
      spray.count = 0;\r
      for (const part of core) part.size = 0;\r
      for (const part of chain) part.size = 0;\r
\r
      for (const drop of drops) {\r
        const gap = Math.hypot(drop.x - anchor.x, drop.y - anchor.y);\r
        const rise = drop.free || !present ? 1 : clamp((gap - radius * 0.55) / (radius * 0.6), 0, 1);\r
        const fade = Math.min(rise * rise * (3 - 2 * rise), drop.age / 0.06, (drop.life - drop.age) / 0.9);\r
        const r = drop.r * fade * (drop.sink < 0 ? 1 : Math.cbrt(1 - drop.sink));\r
        if (r < 0.6) continue;\r
        if (present && merging.length < room && (drop.sink >= 0 || (!drop.free && gap < release + r))) {\r
          const firm = drop.sink >= 0 ? 0 : clamp((gap - radius * 0.6) / (release + r - radius * 0.6), 0, 1);\r
          merging.push([\r
            drop.x,\r
            drop.y,\r
            drop.x,\r
            drop.y,\r
            r,\r
            r,\r
            Math.min(blend, r * 1.2) * (1 - firm * firm * (3 - 2 * firm))\r
          ]);\r
          continue;\r
        }\r
        drop.free = true;\r
        if (spray.count >= MAX_DROPS) continue;\r
        const speed = Math.hypot(drop.vx, drop.vy);\r
        const settle = present ? clamp((gap - release - r) / (r * 2), 0, 1) : 1;\r
        const pull = 1 + Math.min(speed / 2600, 0.6) * s.stretch * settle;\r
        stretchAxis.set(drop.vx, -drop.vy, 0);\r
        if (speed > 1) spin.setFromUnitVectors(xAxis, stretchAxis.normalize());\r
        else spin.identity();\r
        spot.set(drop.x - view.width / 2, view.height / 2 - drop.y, 0);\r
        extent.set(r * pull, r / Math.sqrt(pull), (r / Math.sqrt(pull)) * lift);\r
        placement.compose(spot, spin, extent);\r
        spray.setMatrixAt(spray.count, placement);\r
        spray.count++;\r
      }\r
      spray.instanceMatrix.needsUpdate = true;\r
\r
      const floor = -(s.size / 2) * 0.9 * lift;\r
      ground.position.set(0, 0, floor);\r
      key.target.position.set(0, 0, floor);\r
      key.position.set(-0.42, 0.5, 0.76).multiplyScalar(Math.max(view.width, view.height) * 2);\r
      if (!present) return { blob: false, spray: spray.count > 0 };\r
\r
      for (const ball of core) {\r
        const r = radius * HEAD_RADIUS * ball.grow;\r
        ball.size = r + radius * 0.3;\r
        parts.push([ball.x, ball.y, ball.x, ball.y, r, r, radius * HEAD_BLEND]);\r
      }\r
      const route = [anchor, ...chain.slice(0, s.trail)];\r
      const marks = [0];\r
      for (let c = 1; c < route.length; c++) {\r
        marks.push(marks[c - 1] + Math.hypot(route[c].x - route[c - 1].x, route[c].y - route[c - 1].y));\r
      }\r
      const length = marks[marks.length - 1];\r
      const grown = clamp(length / radius, 0, 1);\r
      const start = radius * mix(0.6, 0.95, grown * grown * (3 - 2 * grown));\r
      const taper = mix(0.75, 1.6, clamp(length / (radius * 6), 0, 1));\r
      const thickness = u => mix(radius * 0.1, start, Math.pow(1 - u, taper));\r
      const sample = distance => {\r
        let c = 1;\r
        while (c < marks.length - 1 && marks[c] < distance) c++;\r
        const span = marks[c] - marks[c - 1];\r
        const t = span > 0 ? clamp((distance - marks[c - 1]) / span, 0, 1) : 0;\r
        return [mix(route[c - 1].x, route[c].x, t), mix(route[c - 1].y, route[c].y, t)];\r
      };\r
      for (let c = 0; c < s.trail; c++) chain[c].size = thickness(length > 0 ? marks[c + 1] / length : 1);\r
      let previous = [anchor.x, anchor.y];\r
      for (let m = 1; m <= s.trail; m++) {\r
        const next = sample((length * m) / s.trail);\r
        parts.push([\r
          previous[0],\r
          previous[1],\r
          next[0],\r
          next[1],\r
          thickness((m - 1) / s.trail),\r
          thickness(m / s.trail),\r
          radius * 0.06\r
        ]);\r
        previous = next;\r
      }\r
      parts.push(...merging);\r
\r
      const seg = field.blobSeg.value;\r
      const info = field.blobInfo.value;\r
      let minX = Infinity;\r
      let minY = Infinity;\r
      let maxX = -Infinity;\r
      let maxY = -Infinity;\r
      const join = radius * mix(0.2, 0.6, s.goo);\r
      let top = join;\r
      parts.forEach(([ax, ay, bx, by, r1, r2, k], i) => {\r
        const x1 = ax - view.width / 2;\r
        const y1 = view.height / 2 - ay;\r
        const x2 = bx - view.width / 2;\r
        const y2 = view.height / 2 - by;\r
        const reach = Math.max(r1, r2) + k;\r
        seg.set([x1, y1, x2, y2], i * 4);\r
        info.set([r1, r2, k, 0], i * 4);\r
        minX = Math.min(minX, x1 - reach, x2 - reach);\r
        maxX = Math.max(maxX, x1 + reach, x2 + reach);\r
        minY = Math.min(minY, y1 - reach, y2 - reach);\r
        maxY = Math.max(maxY, y1 + reach, y2 + reach);\r
        top = Math.max(top, reach);\r
      });\r
      field.blobCount.value = parts.length;\r
      field.blobHeadEnd.value = CORE;\r
      field.blobTubeEnd.value = CORE + s.trail;\r
      field.blobJoin.value = join;\r
      field.blobTop.value = top;\r
      field.blobRef.value = radius;\r
      field.blobLift.value = lift;\r
      blob.position.set((minX + maxX) / 2, (minY + maxY) / 2, 0);\r
      blob.scale.set(maxX - minX + 4, maxY - minY + 4, 1);\r
      return { blob: true, spray: spray.count > 0 };\r
    };\r
\r
    const tick = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      step(dt);\r
      const built = build();\r
      const shown = built.blob || built.spray;\r
      blob.visible = built.blob;\r
      spray.visible = built.spray;\r
      ground.visible = shown && settingsRef.current.shadow;\r
      renderer.render(scene, camera);\r
      let energy =\r
        Math.hypot(anchor.vx, anchor.vy) +\r
        Math.abs(swell.velocity) * 40 +\r
        drops.length * 100 +\r
        Math.abs(1 - mass.value) * 400;\r
      for (const ball of core) energy += Math.hypot(ball.vx, ball.vy);\r
      for (let c = 0; c < settingsRef.current.trail; c++) energy += Math.hypot(chain[c].vx, chain[c].vy);\r
      const breathing =\r
        pointer.inside && settingsRef.current.morph > 0 && settingsRef.current.morphSpeed > 0 && !reducedMotion;\r
      calm = energy > 1.5 || breathing ? 0 : calm + dt;\r
      if (!shown && !pointer.inside) return;\r
      if (calm > 0.4) return;\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    function start() {\r
      if (raf || !alive) return;\r
      calm = 0;\r
      last = performance.now();\r
      raf = requestAnimationFrame(tick);\r
    }\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerup', onUp, { passive: true });\r
    window.addEventListener('pointercancel', onUp, { passive: true });\r
    document.addEventListener('pointerout', onLeave);\r
    window.addEventListener('blur', onBlur);\r
\r
    applyRef.current = apply;\r
    resize();\r
    apply();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      applyRef.current = null;\r
      restoreCursor?.();\r
      resizeObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      document.removeEventListener('pointerout', onLeave);\r
      window.removeEventListener('blur', onBlur);\r
      blob.geometry.dispose();\r
      blobPhysical.dispose();\r
      blobFlat.dispose();\r
      cast.dispose();\r
      sphere.dispose();\r
      spray.dispose();\r
      sprayPhysical.dispose();\r
      sprayFlat.dispose();\r
      ground.geometry.dispose();\r
      ground.material.dispose();\r
      environment.dispose();\r
      renderer.dispose();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`absolute inset-0 overflow-hidden pointer-events-none \${className}\`.trim()}\r
      style={style}\r
    />\r
  );\r
};\r
\r
export default BlobCursor;\r
`,t=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import * as THREE from 'three';\r
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';\r
\r
import './BlobCursor.css';\r
\r
type Material = 'chrome' | 'jelly' | 'pearl' | 'ink';\r
type Blend = 'normal' | 'difference' | 'exclusion' | 'multiply' | 'screen' | 'overlay';\r
type Part = [number, number, number, number, number, number, number];\r
\r
export interface BlobCursorProps {\r
  material?: Material;\r
  color?: string;\r
  size?: number;\r
  morph?: number;\r
  morphSpeed?: number;\r
  depth?: number;\r
  trail?: number;\r
  lag?: number;\r
  goo?: number;\r
  stretch?: number;\r
  wobble?: number;\r
  drip?: number;\r
  splash?: boolean;\r
  splashCount?: number;\r
  splashSpeed?: number;\r
  splashSize?: number;\r
  splashGravity?: number;\r
  regrow?: number;\r
  shine?: number;\r
  shadow?: boolean;\r
  blend?: Blend;\r
  hideCursor?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  material: Material;\r
  color: string;\r
  size: number;\r
  morph: number;\r
  morphSpeed: number;\r
  depth: number;\r
  trail: number;\r
  lag: number;\r
  goo: number;\r
  stretch: number;\r
  wobble: number;\r
  drip: number;\r
  splash: boolean;\r
  splashCount: number;\r
  splashSpeed: number;\r
  splashSize: number;\r
  splashGravity: number;\r
  regrow: number;\r
  shine: number;\r
  shadow: boolean;\r
  blend: Blend;\r
  hideCursor: boolean;\r
}\r
\r
interface Body {\r
  x: number;\r
  y: number;\r
  vx: number;\r
  vy: number;\r
  size: number;\r
}\r
\r
interface Drop {\r
  x: number;\r
  y: number;\r
  vx: number;\r
  vy: number;\r
  cx: number;\r
  cy: number;\r
  r: number;\r
  share: number;\r
  age: number;\r
  life: number;\r
  drag: number;\r
  free: boolean;\r
  sink: number;\r
}\r
\r
const CORE = 8;\r
const HEAD_RADIUS = 0.7;\r
const HEAD_BLEND = 0.6;\r
const MAX_TRAIL = 16;\r
const MAX_DROPS = 96;\r
const MAX_PARTS = 48;\r
const DROP_LIFE = 30;\r
const MATERIALS: Material[] = ['chrome', 'jelly', 'pearl', 'ink'];\r
const BLENDS: Blend[] = ['normal', 'difference', 'exclusion', 'multiply', 'screen', 'overlay'];\r
const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [data-blob-grow]';\r
\r
const FIELD = \`\r
#define BLOB_MAX \${MAX_PARTS}\r
uniform vec4 blobSeg[BLOB_MAX];\r
uniform vec4 blobInfo[BLOB_MAX];\r
uniform int blobCount;\r
uniform int blobHeadEnd;\r
uniform int blobTubeEnd;\r
uniform float blobJoin;\r
uniform float blobLift;\r
uniform float blobTop;\r
uniform float blobRef;\r
uniform vec2 blobDepth;\r
varying vec2 vBlobSpot;\r
\r
vec4 blobPart(vec2 p, int i, float z) {\r
  vec4 seg = blobSeg[i];\r
  vec2 r = blobInfo[i].xy;\r
  vec2 axis = seg.zw - seg.xy;\r
  float len = length(axis);\r
  if (len <= abs(r.x - r.y) + 0.001) {\r
    vec2 d = p - (r.x >= r.y ? seg.xy : seg.zw);\r
    float dist = max(sqrt(dot(d, d) + z * z), 0.0001);\r
    return vec4(dist - max(r.x, r.y), vec3(d, z) / dist);\r
  }\r
  vec2 dir = axis / len;\r
  vec2 rel = p - seg.xy;\r
  float u = dot(rel, dir);\r
  vec2 side = rel - dir * u;\r
  float w = sqrt(dot(side, side) + z * z);\r
  float b = (r.x - r.y) / len;\r
  float a = sqrt(1.0 - b * b);\r
  float along = a * u - b * w;\r
  vec3 f = vec3(a * w + b * u - r.x, a, b);\r
  if (along < 0.0) {\r
    float d = max(sqrt(w * w + u * u), 0.0001);\r
    f = vec3(d - r.x, w / d, u / d);\r
  } else if (along > a * len) {\r
    float d = max(sqrt(w * w + (u - len) * (u - len)), 0.0001);\r
    f = vec3(d - r.y, w / d, (u - len) / d);\r
  }\r
  return vec4(f.x, vec3(dir * f.z, 0.0) + vec3(side, z) / max(w, 0.0001) * f.y);\r
}\r
\r
vec4 blobSmooth(vec4 a, vec4 b, float k) {\r
  float h = k > 0.0 ? max(k - abs(a.x - b.x), 0.0) / k : 0.0;\r
  float weight = b.x < a.x ? 1.0 - 0.5 * h * h : 0.5 * h * h;\r
  return vec4(min(a.x, b.x) - h * h * h * k / 6.0, mix(a.yzw, b.yzw, weight));\r
}\r
\r
vec4 blobShape(vec2 p, float z) {\r
  vec4 body = blobPart(p, 0, z);\r
  for (int i = 1; i < BLOB_MAX; i++) {\r
    if (i >= blobHeadEnd) break;\r
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);\r
  }\r
  if (blobTubeEnd > blobHeadEnd) {\r
    vec4 tube = blobPart(p, blobHeadEnd, z);\r
    for (int i = blobHeadEnd + 1; i < BLOB_MAX; i++) {\r
      if (i >= blobTubeEnd) break;\r
      tube = blobSmooth(tube, blobPart(p, i, z), blobInfo[i].z);\r
    }\r
    body = blobSmooth(body, tube, blobJoin);\r
  }\r
  for (int i = blobTubeEnd; i < BLOB_MAX; i++) {\r
    if (i >= blobCount) break;\r
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);\r
  }\r
  return body;\r
}\r
\`;\r
\r
const SURFACE = \`\r
  vec4 blobBase = blobShape(vBlobSpot, 0.0);\r
  float blobAlpha = clamp(0.5 - blobBase.x / max(fwidth(blobBase.x), 0.0001), 0.0, 1.0);\r
  if (blobAlpha <= 0.0) discard;\r
  float blobLow = 0.0;\r
  float blobHigh = blobTop;\r
  float blobZ = min(sqrt(max(-blobBase.x, 0.0) * max(2.0 * blobRef + blobBase.x, 0.0)), blobTop);\r
  for (int k = 0; k < 8; k++) {\r
    vec4 blobTry = blobShape(vBlobSpot, blobZ);\r
    if (blobTry.x > 0.0) blobHigh = blobZ;\r
    else blobLow = blobZ;\r
    float blobNext = blobZ - blobTry.x / max(blobTry.w, 0.0001);\r
    blobZ = blobNext > blobLow && blobNext < blobHigh ? blobNext : 0.5 * (blobLow + blobHigh);\r
  }\r
  vec4 blobAt = blobShape(vBlobSpot, blobZ);\r
  vec3 blobNormal = normalize(vec3(blobAt.yz, blobAt.w / blobLift));\r
  gl_FragDepth = blobDepth.x - blobDepth.y * blobZ * blobLift;\r
\`;\r
\r
const SURFACE_NORMAL = \`\r
  float faceDirection = 1.0;\r
  vec3 normal = normalize((viewMatrix * vec4(blobNormal, 0.0)).xyz);\r
  vec3 nonPerturbedNormal = normal;\r
\`;\r
\r
const sculpt = (\r
  shader: THREE.WebGLProgramParametersWithUniforms,\r
  uniforms: Record<string, THREE.IUniform>,\r
  body: string\r
) => {\r
  Object.assign(shader.uniforms, uniforms);\r
  shader.vertexShader = shader.vertexShader\r
    .replace('void main() {', 'varying vec2 vBlobSpot;\\nvoid main() {')\r
    .replace(\r
      '#include <project_vertex>',\r
      '#include <project_vertex>\\n\\tvBlobSpot = (modelMatrix * vec4(transformed, 1.0)).xy;'\r
    );\r
  shader.fragmentShader = shader.fragmentShader\r
    .replace('void main() {', \`\${FIELD}\\nvoid main() {\\n\${body}\`)\r
    .replace(\r
      'vec4 diffuseColor = vec4( diffuse, opacity );',\r
      'vec4 diffuseColor = vec4( diffuse, opacity * blobAlpha );'\r
    )\r
    .replace('#include <normal_fragment_begin>', SURFACE_NORMAL);\r
};\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const mix = (a: number, b: number, t: number) => a + (b - a) * t;\r
\r
const createBody = (): Body => ({ x: 0, y: 0, vx: 0, vy: 0, size: 0 });\r
\r
const BlobCursor = ({\r
  material = 'chrome',\r
  color = '#3B82F6',\r
  size = 140,\r
  morph = 0,\r
  morphSpeed = 0.4,\r
  depth = 1,\r
  trail = 16,\r
  lag = 0.55,\r
  goo = 1,\r
  stretch = 0.6,\r
  wobble = 1,\r
  drip = 0,\r
  splash = true,\r
  splashCount = 6,\r
  splashSpeed = 0.5,\r
  splashSize = 0.5,\r
  splashGravity = 0,\r
  regrow = 0.5,\r
  shine = 1,\r
  shadow = false,\r
  blend = 'normal',\r
  hideCursor = true,\r
  className = '',\r
  style\r
}: BlobCursorProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const applyRef = useRef<(() => void) | null>(null);\r
\r
  settingsRef.current = {\r
    material: MATERIALS.includes(material) ? material : 'chrome',\r
    color,\r
    size: clamp(size, 12, 400),\r
    morph: clamp(morph, 0, 1),\r
    morphSpeed: clamp(morphSpeed, 0, 1),\r
    depth: clamp(depth, 0, 1),\r
    trail: clamp(Math.round(trail), 0, MAX_TRAIL),\r
    lag: clamp(lag, 0, 1),\r
    goo: clamp(goo, 0, 1),\r
    stretch: clamp(stretch, 0, 1),\r
    wobble: clamp(wobble, 0, 1),\r
    drip: clamp(drip, 0, 1),\r
    splash,\r
    splashCount: clamp(Math.round(splashCount), 1, 32),\r
    splashSpeed: clamp(splashSpeed, 0, 1),\r
    splashSize: clamp(splashSize, 0, 1),\r
    splashGravity: clamp(splashGravity, 0, 1),\r
    regrow: clamp(regrow, 0, 1),\r
    shine: clamp(shine, 0, 1),\r
    shadow,\r
    blend: BLENDS.includes(blend) ? blend : 'normal',\r
    hideCursor\r
  };\r
\r
  useEffect(() => {\r
    applyRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
\r
    let renderer: THREE.WebGLRenderer;\r
    try {\r
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true });\r
    } catch {\r
      return undefined;\r
    }\r
    renderer.setClearColor(0x000000, 0);\r
    renderer.outputColorSpace = THREE.SRGBColorSpace;\r
    renderer.toneMapping = THREE.ACESFilmicToneMapping;\r
    renderer.toneMappingExposure = 1;\r
    renderer.shadowMap.enabled = true;\r
    renderer.shadowMap.type = THREE.VSMShadowMap;\r
    renderer.shadowMap.autoUpdate = true;\r
    const canvas = renderer.domElement;\r
    canvas.className = 'blob-cursor-canvas';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    root.appendChild(canvas);\r
\r
    const scene = new THREE.Scene();\r
    const pmrem = new THREE.PMREMGenerator(renderer);\r
    const room = new RoomEnvironment();\r
    const environment = pmrem.fromScene(room, 0.03);\r
    pmrem.dispose();\r
    scene.environment = environment.texture;\r
    scene.environmentRotation.set(-0.9, 0.35, 0);\r
\r
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 6000);\r
    camera.position.set(0, 0, 2000);\r
\r
    const key = new THREE.DirectionalLight(0xffffff, 1.4);\r
    key.castShadow = true;\r
    key.shadow.mapSize.set(2048, 2048);\r
    key.shadow.radius = 14;\r
    key.shadow.blurSamples = 20;\r
    key.shadow.bias = -0.0004;\r
    scene.add(key, key.target);\r
\r
    const field = {\r
      blobSeg: { value: new Float32Array(MAX_PARTS * 4) },\r
      blobInfo: { value: new Float32Array(MAX_PARTS * 4) },\r
      blobCount: { value: 0 },\r
      blobHeadEnd: { value: 0 },\r
      blobTubeEnd: { value: 0 },\r
      blobJoin: { value: 0 },\r
      blobLift: { value: 1 },\r
      blobTop: { value: 1 },\r
      blobRef: { value: 1 },\r
      blobDepth: {\r
        value: new THREE.Vector2(\r
          (camera.position.z - camera.near) / (camera.far - camera.near),\r
          1 / (camera.far - camera.near)\r
        )\r
      }\r
    };\r
    const coat = (shader: THREE.WebGLProgramParametersWithUniforms) => sculpt(shader, field, SURFACE);\r
    const blobPhysical = new THREE.MeshPhysicalMaterial({ transparent: true });\r
    const blobFlat = new THREE.MeshBasicMaterial({ transparent: true });\r
    blobPhysical.onBeforeCompile = coat;\r
    blobFlat.onBeforeCompile = coat;\r
    const cast = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });\r
    cast.onBeforeCompile = shader => sculpt(shader, field, 'if (blobShape(vBlobSpot, 0.0).x > 0.0) discard;');\r
    const sprayPhysical = new THREE.MeshPhysicalMaterial();\r
    const sprayFlat = new THREE.MeshBasicMaterial();\r
    const blob = new THREE.Mesh<THREE.PlaneGeometry, THREE.Material>(new THREE.PlaneGeometry(1, 1), blobPhysical);\r
    blob.castShadow = true;\r
    blob.frustumCulled = false;\r
    blob.customDepthMaterial = cast;\r
    scene.add(blob);\r
\r
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.22 }));\r
    ground.receiveShadow = true;\r
    scene.add(ground);\r
\r
    const sphere = new THREE.SphereGeometry(1, 32, 24);\r
    const spray = new THREE.InstancedMesh<THREE.SphereGeometry, THREE.Material>(sphere, sprayPhysical, MAX_DROPS);\r
    spray.castShadow = true;\r
    spray.frustumCulled = false;\r
    spray.count = 0;\r
    scene.add(spray);\r
    const placement = new THREE.Matrix4();\r
    const spin = new THREE.Quaternion();\r
    const stretchAxis = new THREE.Vector3();\r
    const xAxis = new THREE.Vector3(1, 0, 0);\r
    const spot = new THREE.Vector3();\r
    const extent = new THREE.Vector3();\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, down: false, hover: false, seen: false };\r
    const anchor = createBody();\r
    const core = Array.from({ length: CORE }, (_, i) => ({\r
      ...createBody(),\r
      spread: i / (CORE - 1),\r
      angle: (i / CORE) * Math.PI * 2,\r
      shape: 0,\r
      tx: 0,\r
      ty: 0,\r
      grow: 1\r
    }));\r
    const chain = Array.from({ length: MAX_TRAIL }, createBody);\r
    const drops: Drop[] = [];\r
    const swell = { value: 0, velocity: 0 };\r
    const mass = { value: 1, wait: 0 };\r
    const seeds = Array.from({ length: 4 }, () => Math.random() * Math.PI * 2);\r
    let clock = Math.random() * 60;\r
    let dripping = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
    let restoreCursor: (() => void) | null = null;\r
    let calm = 0;\r
\r
    const resize = () => {\r
      view.width = Math.max(1, root.clientWidth);\r
      view.height = Math.max(1, root.clientHeight);\r
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
      renderer.setSize(view.width, view.height, false);\r
      camera.left = -view.width / 2;\r
      camera.right = view.width / 2;\r
      camera.top = view.height / 2;\r
      camera.bottom = -view.height / 2;\r
      camera.updateProjectionMatrix();\r
      const reach = Math.max(view.width, view.height) * 0.75;\r
      const frustum = key.shadow.camera;\r
      frustum.left = -reach;\r
      frustum.right = reach;\r
      frustum.top = reach;\r
      frustum.bottom = -reach;\r
      frustum.near = 1;\r
      frustum.far = reach * 6;\r
      frustum.updateProjectionMatrix();\r
      ground.scale.set(view.width * 1.5, view.height * 1.5, 1);\r
      start();\r
    };\r
\r
    const apply = () => {\r
      const s = settingsRef.current!;\r
      const tint = new THREE.Color();\r
      try {\r
        tint.set(s.color);\r
      } catch {\r
        tint.set('#ffffff');\r
      }\r
      for (const physical of [blobPhysical, sprayPhysical]) {\r
        physical.color.copy(tint);\r
        physical.metalness = 0;\r
        physical.roughness = 0.2;\r
        physical.clearcoat = 0;\r
        physical.clearcoatRoughness = 0;\r
        physical.iridescence = 0;\r
        physical.envMapIntensity = 1;\r
        if (s.material === 'chrome') {\r
          physical.metalness = 1;\r
          physical.roughness = mix(0.3, 0.04, s.shine);\r
          physical.envMapIntensity = mix(0.9, 1.3, s.shine);\r
        } else if (s.material === 'jelly') {\r
          physical.roughness = mix(0.5, 0.18, s.shine);\r
          physical.clearcoat = 1;\r
          physical.clearcoatRoughness = mix(0.25, 0.02, s.shine);\r
          physical.envMapIntensity = mix(0.5, 0.9, s.shine);\r
        } else if (s.material === 'pearl') {\r
          physical.metalness = 0.35;\r
          physical.roughness = mix(0.4, 0.1, s.shine);\r
          physical.clearcoat = 1;\r
          physical.clearcoatRoughness = 0.05;\r
          physical.iridescence = 1;\r
          physical.iridescenceIOR = 1.75;\r
          physical.iridescenceThicknessRange = [240, 820];\r
          physical.envMapIntensity = 1.15;\r
        }\r
        physical.needsUpdate = true;\r
      }\r
      blobFlat.color.copy(tint);\r
      sprayFlat.color.copy(tint);\r
      const ink = s.material === 'ink';\r
      blob.material = ink ? blobFlat : blobPhysical;\r
      spray.material = ink ? sprayFlat : sprayPhysical;\r
      ground.material.opacity = 0.22;\r
      root.style.mixBlendMode = s.blend;\r
      const parent = root.parentElement;\r
      if (s.hideCursor && parent && !restoreCursor) {\r
        const previous = parent.style.cursor;\r
        parent.style.cursor = 'none';\r
        restoreCursor = () => {\r
          parent.style.cursor = previous;\r
        };\r
      } else if (!s.hideCursor && restoreCursor) {\r
        restoreCursor();\r
        restoreCursor = null;\r
      }\r
      start();\r
    };\r
\r
    const place = (x: number, y: number) => {\r
      for (const body of [anchor, ...core, ...chain]) {\r
        body.x = x;\r
        body.y = y;\r
        body.vx = 0;\r
        body.vy = 0;\r
      }\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      if (event.pointerType === 'touch' && !pointer.down) return;\r
      const spot = locate(event);\r
      if (spot.inside && (!pointer.inside || !pointer.seen) && swell.value < 0.05) place(spot.x, spot.y);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.seen = true;\r
      const target = event.target instanceof Element ? event.target : null;\r
      pointer.hover = spot.inside && !!target?.closest(INTERACTIVE);\r
      start();\r
    };\r
\r
    const burst = () => {\r
      const s = settingsRef.current!;\r
      const radius = (s.size / 2) * Math.cbrt(mass.value);\r
      for (const ball of core) {\r
        const angle = Math.random() * Math.PI * 2;\r
        const push = radius * mix(4, 9, Math.random()) * mix(0.6, 1.2, s.wobble);\r
        ball.vx += Math.cos(angle) * push;\r
        ball.vy += Math.sin(angle) * push;\r
      }\r
      if (!s.splash) return;\r
      const size = mix(0.12, 0.42, s.splashSize);\r
      const speed = mix(320, 1600, s.splashSpeed);\r
      const offset = Math.random() * Math.PI * 2;\r
      const fresh: Drop[] = [];\r
      let lost = 0;\r
      for (let i = 0; i < s.splashCount; i++) {\r
        const angle = offset + (i / s.splashCount) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / s.splashCount);\r
        const grain = Math.random();\r
        const pace = speed * mix(1.3, 0.75, grain) * mix(0.85, 1.15, Math.random());\r
        const r = (s.size / 2) * size * mix(0.65, 1.3, grain);\r
        const vx = Math.cos(angle) * pace + anchor.vx * 0.4;\r
        const vy = Math.sin(angle) * pace + anchor.vy * 0.4;\r
        lost += Math.pow(r / (s.size / 2), 3);\r
        fresh.push({\r
          x: anchor.x + Math.cos(angle) * radius * 0.35,\r
          y: anchor.y + Math.sin(angle) * radius * 0.35,\r
          vx,\r
          vy,\r
          cx: vx * 0.45,\r
          cy: vy * 0.45,\r
          r,\r
          share: 0,\r
          age: 0,\r
          life: DROP_LIFE,\r
          drag: 0.6,\r
          free: false,\r
          sink: -1\r
        });\r
      }\r
      const before = mass.value;\r
      mass.value = Math.max(0.2, before - clamp(lost * 2.4, 0.25, 0.7));\r
      mass.wait = 0.28;\r
      for (const drop of fresh) {\r
        drop.share = ((before - mass.value) * Math.pow(drop.r / (s.size / 2), 3)) / lost;\r
        if (drops.length >= MAX_DROPS) drops.shift();\r
        drops.push(drop);\r
      }\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      if (event.pointerType === 'touch' && swell.value < 0.05) place(spot.x, spot.y);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.seen = true;\r
      pointer.down = true;\r
      swell.velocity -= 2;\r
      if (!reducedMotion) burst();\r
      start();\r
    };\r
\r
    const onUp = (event: PointerEvent) => {\r
      if (!pointer.down) return;\r
      pointer.down = false;\r
      swell.velocity += 1.2;\r
      if (event.pointerType === 'touch') pointer.inside = false;\r
      start();\r
    };\r
\r
    const onLeave = (event: PointerEvent) => {\r
      if (event.relatedTarget) return;\r
      pointer.inside = false;\r
      pointer.down = false;\r
      start();\r
    };\r
\r
    const onBlur = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
      start();\r
    };\r
\r
    const integrate = (\r
      body: Body,\r
      tx: number,\r
      ty: number,\r
      stiffness: number,\r
      damping: number,\r
      h: number,\r
      frameX = 0,\r
      frameY = 0\r
    ) => {\r
      body.vx += ((tx - body.x) * stiffness - (body.vx - frameX) * damping) * h;\r
      body.vy += ((ty - body.y) * stiffness - (body.vy - frameY) * damping) * h;\r
      body.x += body.vx * h;\r
      body.y += body.vy * h;\r
    };\r
\r
    const step = (dt: number) => {\r
      const s = settingsRef.current!;\r
      const radius = s.size / 2;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      const anchorStiffness = reducedMotion ? 2400 : mix(1200, 160, s.lag);\r
      const coreStiffness = mix(900, 260, s.lag);\r
      const linkStiffness = mix(30000, 1500, s.stretch);\r
      const linkDamping = 2 * Math.sqrt(linkStiffness) * mix(0.95, 0.65, s.wobble);\r
      const bounce = mix(0.95, 0.4, s.wobble);\r
      const visible = pointer.inside && pointer.seen;\r
      const swellTarget = visible ? (pointer.down ? 0.86 : pointer.hover ? 1.3 : 1) : 0;\r
\r
      if (!reducedMotion) clock += dt * 4 * Math.pow(s.morphSpeed, 1.5);\r
      const bend = s.morph * (0.6 + 0.4 * Math.sin(clock * 0.71 + seeds[0]));\r
      const bendAngle = clock * 0.23 + seeds[1];\r
      const fold = s.morph * 0.8 * (0.5 + 0.5 * Math.sin(clock * 0.53 + seeds[2]));\r
      const foldAngle = seeds[3] - clock * 0.17;\r
      let strain = 0;\r
      for (const ball of core) {\r
        ball.shape = bend * Math.cos(2 * (ball.angle - bendAngle)) + fold * Math.cos(3 * (ball.angle - foldAngle));\r
        strain += (ball.shape * ball.shape) / CORE;\r
      }\r
      const hold = 1 / (1 + 0.3 * strain);\r
      for (const ball of core) {\r
        const out = radius * clamp(0.14 + 0.75 * ball.shape, 0, 0.8) * hold;\r
        ball.tx = Math.cos(ball.angle) * out;\r
        ball.ty = Math.sin(ball.angle) * out;\r
        ball.grow = (1 + 0.35 * ball.shape) * hold;\r
      }\r
\r
      for (let i = 0; i < steps; i++) {\r
        integrate(anchor, pointer.x, pointer.y, anchorStiffness, 2 * Math.sqrt(anchorStiffness) * 0.9, h);\r
        for (const ball of core) {\r
          const k = coreStiffness * mix(1.3, 0.7, ball.spread);\r
          integrate(\r
            ball,\r
            anchor.x + ball.tx,\r
            anchor.y + ball.ty,\r
            k,\r
            2 * Math.sqrt(k) * bounce,\r
            h,\r
            anchor.vx,\r
            anchor.vy\r
          );\r
        }\r
        for (let c = 0; c < s.trail; c++) {\r
          const leader = c > 0 ? chain[c - 1] : anchor;\r
          integrate(chain[c], leader.x, leader.y, linkStiffness, linkDamping, h);\r
        }\r
        const fall = s.splashGravity * 2200;\r
        const inward = 1 - Math.exp(-18 * h);\r
        for (const drop of drops) {\r
          drop.age += h;\r
          if (drop.sink >= 0) {\r
            const sunk = Math.min(1, drop.sink + h / 0.14);\r
            mass.value = Math.min(1.35, mass.value + drop.share * (sunk - drop.sink));\r
            drop.sink = sunk;\r
            drop.x += (anchor.x - drop.x) * inward;\r
            drop.y += (anchor.y - drop.y) * inward;\r
            continue;\r
          }\r
          const ease = Math.exp(-drop.drag * h);\r
          drop.vx = drop.cx + (drop.vx - drop.cx) * ease;\r
          drop.vy = drop.cy + (drop.vy - drop.cy) * ease + fall * h;\r
          drop.x += drop.vx * h;\r
          drop.y += drop.vy * h;\r
        }\r
        swell.velocity +=\r
          ((swellTarget - swell.value) * 300 - swell.velocity * 2 * Math.sqrt(300) * mix(0.8, 0.38, s.wobble)) * h;\r
        swell.value += swell.velocity * h;\r
        if (swell.value < 0) {\r
          swell.value = 0;\r
          swell.velocity = Math.max(0, swell.velocity);\r
        }\r
      }\r
\r
      const body = radius * Math.max(swell.value, 0) * Math.cbrt(mass.value);\r
      const touching = (drop: Drop, bodies: Body[]) =>\r
        bodies.some(part => part.size > 0 && Math.hypot(drop.x - part.x, drop.y - part.y) < part.size + drop.r * 0.9);\r
      const tail = s.trail > 0 ? chain[s.trail - 1] : core[CORE - 1];\r
      const rush = Math.hypot(anchor.vx, anchor.vy);\r
      if (visible && !reducedMotion) dripping += dt * s.drip * 26 * clamp((rush - 600) / 1800, 0, 1);\r
      while (dripping >= 1) {\r
        dripping -= 1;\r
        const r = radius * mix(0.07, 0.17, Math.random());\r
        if (Math.hypot(tail.x - anchor.x, tail.y - anchor.y) < body + r * 2) continue;\r
        const share = Math.pow(r / radius, 3) * 2.4;\r
        mass.value = Math.max(0.2, mass.value - share);\r
        if (drops.length >= MAX_DROPS) drops.shift();\r
        drops.push({\r
          x: tail.x + (Math.random() - 0.5) * r,\r
          y: tail.y + (Math.random() - 0.5) * r,\r
          vx: tail.vx * 0.2,\r
          vy: tail.vy * 0.2,\r
          cx: 0,\r
          cy: 0,\r
          r,\r
          share,\r
          age: 0,\r
          life: mix(2.5, 4, Math.random()),\r
          drag: 9,\r
          free: true,\r
          sink: -1\r
        });\r
      }\r
      for (let i = drops.length - 1; i >= 0; i--) {\r
        const drop = drops[i];\r
        if (\r
          drop.free &&\r
          drop.sink < 0 &&\r
          drop.age > 0.3 &&\r
          swell.value > 0.05 &&\r
          (touching(drop, core) || touching(drop, chain))\r
        ) {\r
          drop.sink = 0;\r
          const kick = Math.min(0.5, drop.share * 4);\r
          for (const ball of core) {\r
            ball.vx += (drop.vx - anchor.vx) * kick;\r
            ball.vy += (drop.vy - anchor.vy) * kick;\r
          }\r
        }\r
        const margin = drop.r * 3;\r
        const outside =\r
          drop.x < -margin || drop.y < -margin || drop.x > view.width + margin || drop.y > view.height + margin;\r
        if (outside || drop.sink >= 1 || drop.age > drop.life) drops.splice(i, 1);\r
      }\r
      if (mass.wait > 0) mass.wait -= dt;\r
      else mass.value += (1 - mass.value) * (1 - Math.exp(-dt * mix(0.9, 6, s.regrow)));\r
    };\r
\r
    const build = () => {\r
      const s = settingsRef.current!;\r
      const full = (s.size / 2) * Math.max(swell.value, 0);\r
      const radius = full * Math.cbrt(mass.value);\r
      const present = radius >= 0.5;\r
      const blend = radius * mix(0.3, 0.9, s.goo);\r
      const release = radius + blend;\r
      const lift = mix(0.3, 1, s.depth);\r
      const room = MAX_PARTS - CORE - s.trail;\r
      const parts: Part[] = [];\r
      const merging: Part[] = [];\r
      spray.count = 0;\r
      for (const part of core) part.size = 0;\r
      for (const part of chain) part.size = 0;\r
\r
      for (const drop of drops) {\r
        const gap = Math.hypot(drop.x - anchor.x, drop.y - anchor.y);\r
        const rise = drop.free || !present ? 1 : clamp((gap - radius * 0.55) / (radius * 0.6), 0, 1);\r
        const fade = Math.min(rise * rise * (3 - 2 * rise), drop.age / 0.06, (drop.life - drop.age) / 0.9);\r
        const r = drop.r * fade * (drop.sink < 0 ? 1 : Math.cbrt(1 - drop.sink));\r
        if (r < 0.6) continue;\r
        if (present && merging.length < room && (drop.sink >= 0 || (!drop.free && gap < release + r))) {\r
          const firm = drop.sink >= 0 ? 0 : clamp((gap - radius * 0.6) / (release + r - radius * 0.6), 0, 1);\r
          merging.push([\r
            drop.x,\r
            drop.y,\r
            drop.x,\r
            drop.y,\r
            r,\r
            r,\r
            Math.min(blend, r * 1.2) * (1 - firm * firm * (3 - 2 * firm))\r
          ]);\r
          continue;\r
        }\r
        drop.free = true;\r
        if (spray.count >= MAX_DROPS) continue;\r
        const speed = Math.hypot(drop.vx, drop.vy);\r
        const settle = present ? clamp((gap - release - r) / (r * 2), 0, 1) : 1;\r
        const pull = 1 + Math.min(speed / 2600, 0.6) * s.stretch * settle;\r
        stretchAxis.set(drop.vx, -drop.vy, 0);\r
        if (speed > 1) spin.setFromUnitVectors(xAxis, stretchAxis.normalize());\r
        else spin.identity();\r
        spot.set(drop.x - view.width / 2, view.height / 2 - drop.y, 0);\r
        extent.set(r * pull, r / Math.sqrt(pull), (r / Math.sqrt(pull)) * lift);\r
        placement.compose(spot, spin, extent);\r
        spray.setMatrixAt(spray.count, placement);\r
        spray.count++;\r
      }\r
      spray.instanceMatrix.needsUpdate = true;\r
\r
      const floor = -(s.size / 2) * 0.9 * lift;\r
      ground.position.set(0, 0, floor);\r
      key.target.position.set(0, 0, floor);\r
      key.position.set(-0.42, 0.5, 0.76).multiplyScalar(Math.max(view.width, view.height) * 2);\r
      if (!present) return { blob: false, spray: spray.count > 0 };\r
\r
      for (const ball of core) {\r
        const r = radius * HEAD_RADIUS * ball.grow;\r
        ball.size = r + radius * 0.3;\r
        parts.push([ball.x, ball.y, ball.x, ball.y, r, r, radius * HEAD_BLEND]);\r
      }\r
      const route = [anchor, ...chain.slice(0, s.trail)];\r
      const marks = [0];\r
      for (let c = 1; c < route.length; c++) {\r
        marks.push(marks[c - 1] + Math.hypot(route[c].x - route[c - 1].x, route[c].y - route[c - 1].y));\r
      }\r
      const length = marks[marks.length - 1];\r
      const grown = clamp(length / radius, 0, 1);\r
      const start = radius * mix(0.6, 0.95, grown * grown * (3 - 2 * grown));\r
      const taper = mix(0.75, 1.6, clamp(length / (radius * 6), 0, 1));\r
      const thickness = (u: number) => mix(radius * 0.1, start, Math.pow(1 - u, taper));\r
      const sample = (distance: number) => {\r
        let c = 1;\r
        while (c < marks.length - 1 && marks[c] < distance) c++;\r
        const span = marks[c] - marks[c - 1];\r
        const t = span > 0 ? clamp((distance - marks[c - 1]) / span, 0, 1) : 0;\r
        return [mix(route[c - 1].x, route[c].x, t), mix(route[c - 1].y, route[c].y, t)];\r
      };\r
      for (let c = 0; c < s.trail; c++) chain[c].size = thickness(length > 0 ? marks[c + 1] / length : 1);\r
      let previous = [anchor.x, anchor.y];\r
      for (let m = 1; m <= s.trail; m++) {\r
        const next = sample((length * m) / s.trail);\r
        parts.push([\r
          previous[0],\r
          previous[1],\r
          next[0],\r
          next[1],\r
          thickness((m - 1) / s.trail),\r
          thickness(m / s.trail),\r
          radius * 0.06\r
        ]);\r
        previous = next;\r
      }\r
      parts.push(...merging);\r
\r
      const seg = field.blobSeg.value;\r
      const info = field.blobInfo.value;\r
      let minX = Infinity;\r
      let minY = Infinity;\r
      let maxX = -Infinity;\r
      let maxY = -Infinity;\r
      const join = radius * mix(0.2, 0.6, s.goo);\r
      let top = join;\r
      parts.forEach(([ax, ay, bx, by, r1, r2, k], i) => {\r
        const x1 = ax - view.width / 2;\r
        const y1 = view.height / 2 - ay;\r
        const x2 = bx - view.width / 2;\r
        const y2 = view.height / 2 - by;\r
        const reach = Math.max(r1, r2) + k;\r
        seg.set([x1, y1, x2, y2], i * 4);\r
        info.set([r1, r2, k, 0], i * 4);\r
        minX = Math.min(minX, x1 - reach, x2 - reach);\r
        maxX = Math.max(maxX, x1 + reach, x2 + reach);\r
        minY = Math.min(minY, y1 - reach, y2 - reach);\r
        maxY = Math.max(maxY, y1 + reach, y2 + reach);\r
        top = Math.max(top, reach);\r
      });\r
      field.blobCount.value = parts.length;\r
      field.blobHeadEnd.value = CORE;\r
      field.blobTubeEnd.value = CORE + s.trail;\r
      field.blobJoin.value = join;\r
      field.blobTop.value = top;\r
      field.blobRef.value = radius;\r
      field.blobLift.value = lift;\r
      blob.position.set((minX + maxX) / 2, (minY + maxY) / 2, 0);\r
      blob.scale.set(maxX - minX + 4, maxY - minY + 4, 1);\r
      return { blob: true, spray: spray.count > 0 };\r
    };\r
\r
    const tick = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      step(dt);\r
      const built = build();\r
      const shown = built.blob || built.spray;\r
      blob.visible = built.blob;\r
      spray.visible = built.spray;\r
      ground.visible = shown && settingsRef.current!.shadow;\r
      renderer.render(scene, camera);\r
      let energy =\r
        Math.hypot(anchor.vx, anchor.vy) +\r
        Math.abs(swell.velocity) * 40 +\r
        drops.length * 100 +\r
        Math.abs(1 - mass.value) * 400;\r
      for (const ball of core) energy += Math.hypot(ball.vx, ball.vy);\r
      for (let c = 0; c < settingsRef.current!.trail; c++) energy += Math.hypot(chain[c].vx, chain[c].vy);\r
      const breathing =\r
        pointer.inside && settingsRef.current!.morph > 0 && settingsRef.current!.morphSpeed > 0 && !reducedMotion;\r
      calm = energy > 1.5 || breathing ? 0 : calm + dt;\r
      if (!shown && !pointer.inside) return;\r
      if (calm > 0.4) return;\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    function start() {\r
      if (raf || !alive) return;\r
      calm = 0;\r
      last = performance.now();\r
      raf = requestAnimationFrame(tick);\r
    }\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerup', onUp, { passive: true });\r
    window.addEventListener('pointercancel', onUp, { passive: true });\r
    document.addEventListener('pointerout', onLeave);\r
    window.addEventListener('blur', onBlur);\r
\r
    applyRef.current = apply;\r
    resize();\r
    apply();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      applyRef.current = null;\r
      restoreCursor?.();\r
      resizeObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      document.removeEventListener('pointerout', onLeave);\r
      window.removeEventListener('blur', onBlur);\r
      blob.geometry.dispose();\r
      blobPhysical.dispose();\r
      blobFlat.dispose();\r
      cast.dispose();\r
      sphere.dispose();\r
      spray.dispose();\r
      sprayPhysical.dispose();\r
      sprayFlat.dispose();\r
      ground.geometry.dispose();\r
      ground.material.dispose();\r
      environment.dispose();\r
      renderer.dispose();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return <div ref={rootRef} className={\`blob-cursor \${className}\`.trim()} style={style} />;\r
};\r
\r
export default BlobCursor;\r
`,o=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import type { CSSProperties } from 'react';\r
import * as THREE from 'three';\r
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';\r
\r
type Material = 'chrome' | 'jelly' | 'pearl' | 'ink';\r
type Blend = 'normal' | 'difference' | 'exclusion' | 'multiply' | 'screen' | 'overlay';\r
type Part = [number, number, number, number, number, number, number];\r
\r
export interface BlobCursorProps {\r
  material?: Material;\r
  color?: string;\r
  size?: number;\r
  morph?: number;\r
  morphSpeed?: number;\r
  depth?: number;\r
  trail?: number;\r
  lag?: number;\r
  goo?: number;\r
  stretch?: number;\r
  wobble?: number;\r
  drip?: number;\r
  splash?: boolean;\r
  splashCount?: number;\r
  splashSpeed?: number;\r
  splashSize?: number;\r
  splashGravity?: number;\r
  regrow?: number;\r
  shine?: number;\r
  shadow?: boolean;\r
  blend?: Blend;\r
  hideCursor?: boolean;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
interface Settings {\r
  material: Material;\r
  color: string;\r
  size: number;\r
  morph: number;\r
  morphSpeed: number;\r
  depth: number;\r
  trail: number;\r
  lag: number;\r
  goo: number;\r
  stretch: number;\r
  wobble: number;\r
  drip: number;\r
  splash: boolean;\r
  splashCount: number;\r
  splashSpeed: number;\r
  splashSize: number;\r
  splashGravity: number;\r
  regrow: number;\r
  shine: number;\r
  shadow: boolean;\r
  blend: Blend;\r
  hideCursor: boolean;\r
}\r
\r
interface Body {\r
  x: number;\r
  y: number;\r
  vx: number;\r
  vy: number;\r
  size: number;\r
}\r
\r
interface Drop {\r
  x: number;\r
  y: number;\r
  vx: number;\r
  vy: number;\r
  cx: number;\r
  cy: number;\r
  r: number;\r
  share: number;\r
  age: number;\r
  life: number;\r
  drag: number;\r
  free: boolean;\r
  sink: number;\r
}\r
\r
const CORE = 8;\r
const HEAD_RADIUS = 0.7;\r
const HEAD_BLEND = 0.6;\r
const MAX_TRAIL = 16;\r
const MAX_DROPS = 96;\r
const MAX_PARTS = 48;\r
const DROP_LIFE = 30;\r
const MATERIALS: Material[] = ['chrome', 'jelly', 'pearl', 'ink'];\r
const BLENDS: Blend[] = ['normal', 'difference', 'exclusion', 'multiply', 'screen', 'overlay'];\r
const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [data-blob-grow]';\r
\r
const FIELD = \`\r
#define BLOB_MAX \${MAX_PARTS}\r
uniform vec4 blobSeg[BLOB_MAX];\r
uniform vec4 blobInfo[BLOB_MAX];\r
uniform int blobCount;\r
uniform int blobHeadEnd;\r
uniform int blobTubeEnd;\r
uniform float blobJoin;\r
uniform float blobLift;\r
uniform float blobTop;\r
uniform float blobRef;\r
uniform vec2 blobDepth;\r
varying vec2 vBlobSpot;\r
\r
vec4 blobPart(vec2 p, int i, float z) {\r
  vec4 seg = blobSeg[i];\r
  vec2 r = blobInfo[i].xy;\r
  vec2 axis = seg.zw - seg.xy;\r
  float len = length(axis);\r
  if (len <= abs(r.x - r.y) + 0.001) {\r
    vec2 d = p - (r.x >= r.y ? seg.xy : seg.zw);\r
    float dist = max(sqrt(dot(d, d) + z * z), 0.0001);\r
    return vec4(dist - max(r.x, r.y), vec3(d, z) / dist);\r
  }\r
  vec2 dir = axis / len;\r
  vec2 rel = p - seg.xy;\r
  float u = dot(rel, dir);\r
  vec2 side = rel - dir * u;\r
  float w = sqrt(dot(side, side) + z * z);\r
  float b = (r.x - r.y) / len;\r
  float a = sqrt(1.0 - b * b);\r
  float along = a * u - b * w;\r
  vec3 f = vec3(a * w + b * u - r.x, a, b);\r
  if (along < 0.0) {\r
    float d = max(sqrt(w * w + u * u), 0.0001);\r
    f = vec3(d - r.x, w / d, u / d);\r
  } else if (along > a * len) {\r
    float d = max(sqrt(w * w + (u - len) * (u - len)), 0.0001);\r
    f = vec3(d - r.y, w / d, (u - len) / d);\r
  }\r
  return vec4(f.x, vec3(dir * f.z, 0.0) + vec3(side, z) / max(w, 0.0001) * f.y);\r
}\r
\r
vec4 blobSmooth(vec4 a, vec4 b, float k) {\r
  float h = k > 0.0 ? max(k - abs(a.x - b.x), 0.0) / k : 0.0;\r
  float weight = b.x < a.x ? 1.0 - 0.5 * h * h : 0.5 * h * h;\r
  return vec4(min(a.x, b.x) - h * h * h * k / 6.0, mix(a.yzw, b.yzw, weight));\r
}\r
\r
vec4 blobShape(vec2 p, float z) {\r
  vec4 body = blobPart(p, 0, z);\r
  for (int i = 1; i < BLOB_MAX; i++) {\r
    if (i >= blobHeadEnd) break;\r
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);\r
  }\r
  if (blobTubeEnd > blobHeadEnd) {\r
    vec4 tube = blobPart(p, blobHeadEnd, z);\r
    for (int i = blobHeadEnd + 1; i < BLOB_MAX; i++) {\r
      if (i >= blobTubeEnd) break;\r
      tube = blobSmooth(tube, blobPart(p, i, z), blobInfo[i].z);\r
    }\r
    body = blobSmooth(body, tube, blobJoin);\r
  }\r
  for (int i = blobTubeEnd; i < BLOB_MAX; i++) {\r
    if (i >= blobCount) break;\r
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);\r
  }\r
  return body;\r
}\r
\`;\r
\r
const SURFACE = \`\r
  vec4 blobBase = blobShape(vBlobSpot, 0.0);\r
  float blobAlpha = clamp(0.5 - blobBase.x / max(fwidth(blobBase.x), 0.0001), 0.0, 1.0);\r
  if (blobAlpha <= 0.0) discard;\r
  float blobLow = 0.0;\r
  float blobHigh = blobTop;\r
  float blobZ = min(sqrt(max(-blobBase.x, 0.0) * max(2.0 * blobRef + blobBase.x, 0.0)), blobTop);\r
  for (int k = 0; k < 8; k++) {\r
    vec4 blobTry = blobShape(vBlobSpot, blobZ);\r
    if (blobTry.x > 0.0) blobHigh = blobZ;\r
    else blobLow = blobZ;\r
    float blobNext = blobZ - blobTry.x / max(blobTry.w, 0.0001);\r
    blobZ = blobNext > blobLow && blobNext < blobHigh ? blobNext : 0.5 * (blobLow + blobHigh);\r
  }\r
  vec4 blobAt = blobShape(vBlobSpot, blobZ);\r
  vec3 blobNormal = normalize(vec3(blobAt.yz, blobAt.w / blobLift));\r
  gl_FragDepth = blobDepth.x - blobDepth.y * blobZ * blobLift;\r
\`;\r
\r
const SURFACE_NORMAL = \`\r
  float faceDirection = 1.0;\r
  vec3 normal = normalize((viewMatrix * vec4(blobNormal, 0.0)).xyz);\r
  vec3 nonPerturbedNormal = normal;\r
\`;\r
\r
const sculpt = (\r
  shader: THREE.WebGLProgramParametersWithUniforms,\r
  uniforms: Record<string, THREE.IUniform>,\r
  body: string\r
) => {\r
  Object.assign(shader.uniforms, uniforms);\r
  shader.vertexShader = shader.vertexShader\r
    .replace('void main() {', 'varying vec2 vBlobSpot;\\nvoid main() {')\r
    .replace(\r
      '#include <project_vertex>',\r
      '#include <project_vertex>\\n\\tvBlobSpot = (modelMatrix * vec4(transformed, 1.0)).xy;'\r
    );\r
  shader.fragmentShader = shader.fragmentShader\r
    .replace('void main() {', \`\${FIELD}\\nvoid main() {\\n\${body}\`)\r
    .replace(\r
      'vec4 diffuseColor = vec4( diffuse, opacity );',\r
      'vec4 diffuseColor = vec4( diffuse, opacity * blobAlpha );'\r
    )\r
    .replace('#include <normal_fragment_begin>', SURFACE_NORMAL);\r
};\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const mix = (a: number, b: number, t: number) => a + (b - a) * t;\r
\r
const createBody = (): Body => ({ x: 0, y: 0, vx: 0, vy: 0, size: 0 });\r
\r
const BlobCursor = ({\r
  material = 'chrome',\r
  color = '#3B82F6',\r
  size = 140,\r
  morph = 0,\r
  morphSpeed = 0.4,\r
  depth = 1,\r
  trail = 16,\r
  lag = 0.55,\r
  goo = 1,\r
  stretch = 0.6,\r
  wobble = 1,\r
  drip = 0,\r
  splash = true,\r
  splashCount = 6,\r
  splashSpeed = 0.5,\r
  splashSize = 0.5,\r
  splashGravity = 0,\r
  regrow = 0.5,\r
  shine = 1,\r
  shadow = false,\r
  blend = 'normal',\r
  hideCursor = true,\r
  className = '',\r
  style\r
}: BlobCursorProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const settingsRef = useRef<Settings | null>(null);\r
  const applyRef = useRef<(() => void) | null>(null);\r
\r
  settingsRef.current = {\r
    material: MATERIALS.includes(material) ? material : 'chrome',\r
    color,\r
    size: clamp(size, 12, 400),\r
    morph: clamp(morph, 0, 1),\r
    morphSpeed: clamp(morphSpeed, 0, 1),\r
    depth: clamp(depth, 0, 1),\r
    trail: clamp(Math.round(trail), 0, MAX_TRAIL),\r
    lag: clamp(lag, 0, 1),\r
    goo: clamp(goo, 0, 1),\r
    stretch: clamp(stretch, 0, 1),\r
    wobble: clamp(wobble, 0, 1),\r
    drip: clamp(drip, 0, 1),\r
    splash,\r
    splashCount: clamp(Math.round(splashCount), 1, 32),\r
    splashSpeed: clamp(splashSpeed, 0, 1),\r
    splashSize: clamp(splashSize, 0, 1),\r
    splashGravity: clamp(splashGravity, 0, 1),\r
    regrow: clamp(regrow, 0, 1),\r
    shine: clamp(shine, 0, 1),\r
    shadow,\r
    blend: BLENDS.includes(blend) ? blend : 'normal',\r
    hideCursor\r
  };\r
\r
  useEffect(() => {\r
    applyRef.current?.();\r
  });\r
\r
  useEffect(() => {\r
    const root = rootRef.current;\r
    if (!root) return undefined;\r
\r
    let renderer: THREE.WebGLRenderer;\r
    try {\r
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true });\r
    } catch {\r
      return undefined;\r
    }\r
    renderer.setClearColor(0x000000, 0);\r
    renderer.outputColorSpace = THREE.SRGBColorSpace;\r
    renderer.toneMapping = THREE.ACESFilmicToneMapping;\r
    renderer.toneMappingExposure = 1;\r
    renderer.shadowMap.enabled = true;\r
    renderer.shadowMap.type = THREE.VSMShadowMap;\r
    renderer.shadowMap.autoUpdate = true;\r
    const canvas = renderer.domElement;\r
    canvas.className = 'block w-full h-full';\r
    canvas.setAttribute('aria-hidden', 'true');\r
    root.appendChild(canvas);\r
\r
    const scene = new THREE.Scene();\r
    const pmrem = new THREE.PMREMGenerator(renderer);\r
    const room = new RoomEnvironment();\r
    const environment = pmrem.fromScene(room, 0.03);\r
    pmrem.dispose();\r
    scene.environment = environment.texture;\r
    scene.environmentRotation.set(-0.9, 0.35, 0);\r
\r
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 6000);\r
    camera.position.set(0, 0, 2000);\r
\r
    const key = new THREE.DirectionalLight(0xffffff, 1.4);\r
    key.castShadow = true;\r
    key.shadow.mapSize.set(2048, 2048);\r
    key.shadow.radius = 14;\r
    key.shadow.blurSamples = 20;\r
    key.shadow.bias = -0.0004;\r
    scene.add(key, key.target);\r
\r
    const field = {\r
      blobSeg: { value: new Float32Array(MAX_PARTS * 4) },\r
      blobInfo: { value: new Float32Array(MAX_PARTS * 4) },\r
      blobCount: { value: 0 },\r
      blobHeadEnd: { value: 0 },\r
      blobTubeEnd: { value: 0 },\r
      blobJoin: { value: 0 },\r
      blobLift: { value: 1 },\r
      blobTop: { value: 1 },\r
      blobRef: { value: 1 },\r
      blobDepth: {\r
        value: new THREE.Vector2(\r
          (camera.position.z - camera.near) / (camera.far - camera.near),\r
          1 / (camera.far - camera.near)\r
        )\r
      }\r
    };\r
    const coat = (shader: THREE.WebGLProgramParametersWithUniforms) => sculpt(shader, field, SURFACE);\r
    const blobPhysical = new THREE.MeshPhysicalMaterial({ transparent: true });\r
    const blobFlat = new THREE.MeshBasicMaterial({ transparent: true });\r
    blobPhysical.onBeforeCompile = coat;\r
    blobFlat.onBeforeCompile = coat;\r
    const cast = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });\r
    cast.onBeforeCompile = shader => sculpt(shader, field, 'if (blobShape(vBlobSpot, 0.0).x > 0.0) discard;');\r
    const sprayPhysical = new THREE.MeshPhysicalMaterial();\r
    const sprayFlat = new THREE.MeshBasicMaterial();\r
    const blob = new THREE.Mesh<THREE.PlaneGeometry, THREE.Material>(new THREE.PlaneGeometry(1, 1), blobPhysical);\r
    blob.castShadow = true;\r
    blob.frustumCulled = false;\r
    blob.customDepthMaterial = cast;\r
    scene.add(blob);\r
\r
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.22 }));\r
    ground.receiveShadow = true;\r
    scene.add(ground);\r
\r
    const sphere = new THREE.SphereGeometry(1, 32, 24);\r
    const spray = new THREE.InstancedMesh<THREE.SphereGeometry, THREE.Material>(sphere, sprayPhysical, MAX_DROPS);\r
    spray.castShadow = true;\r
    spray.frustumCulled = false;\r
    spray.count = 0;\r
    scene.add(spray);\r
    const placement = new THREE.Matrix4();\r
    const spin = new THREE.Quaternion();\r
    const stretchAxis = new THREE.Vector3();\r
    const xAxis = new THREE.Vector3(1, 0, 0);\r
    const spot = new THREE.Vector3();\r
    const extent = new THREE.Vector3();\r
\r
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1 };\r
    const pointer = { x: 0, y: 0, inside: false, down: false, hover: false, seen: false };\r
    const anchor = createBody();\r
    const core = Array.from({ length: CORE }, (_, i) => ({\r
      ...createBody(),\r
      spread: i / (CORE - 1),\r
      angle: (i / CORE) * Math.PI * 2,\r
      shape: 0,\r
      tx: 0,\r
      ty: 0,\r
      grow: 1\r
    }));\r
    const chain = Array.from({ length: MAX_TRAIL }, createBody);\r
    const drops: Drop[] = [];\r
    const swell = { value: 0, velocity: 0 };\r
    const mass = { value: 1, wait: 0 };\r
    const seeds = Array.from({ length: 4 }, () => Math.random() * Math.PI * 2);\r
    let clock = Math.random() * 60;\r
    let dripping = 0;\r
    let raf = 0;\r
    let last = 0;\r
    let alive = true;\r
    let restoreCursor: (() => void) | null = null;\r
    let calm = 0;\r
\r
    const resize = () => {\r
      view.width = Math.max(1, root.clientWidth);\r
      view.height = Math.max(1, root.clientHeight);\r
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
      renderer.setSize(view.width, view.height, false);\r
      camera.left = -view.width / 2;\r
      camera.right = view.width / 2;\r
      camera.top = view.height / 2;\r
      camera.bottom = -view.height / 2;\r
      camera.updateProjectionMatrix();\r
      const reach = Math.max(view.width, view.height) * 0.75;\r
      const frustum = key.shadow.camera;\r
      frustum.left = -reach;\r
      frustum.right = reach;\r
      frustum.top = reach;\r
      frustum.bottom = -reach;\r
      frustum.near = 1;\r
      frustum.far = reach * 6;\r
      frustum.updateProjectionMatrix();\r
      ground.scale.set(view.width * 1.5, view.height * 1.5, 1);\r
      start();\r
    };\r
\r
    const apply = () => {\r
      const s = settingsRef.current!;\r
      const tint = new THREE.Color();\r
      try {\r
        tint.set(s.color);\r
      } catch {\r
        tint.set('#ffffff');\r
      }\r
      for (const physical of [blobPhysical, sprayPhysical]) {\r
        physical.color.copy(tint);\r
        physical.metalness = 0;\r
        physical.roughness = 0.2;\r
        physical.clearcoat = 0;\r
        physical.clearcoatRoughness = 0;\r
        physical.iridescence = 0;\r
        physical.envMapIntensity = 1;\r
        if (s.material === 'chrome') {\r
          physical.metalness = 1;\r
          physical.roughness = mix(0.3, 0.04, s.shine);\r
          physical.envMapIntensity = mix(0.9, 1.3, s.shine);\r
        } else if (s.material === 'jelly') {\r
          physical.roughness = mix(0.5, 0.18, s.shine);\r
          physical.clearcoat = 1;\r
          physical.clearcoatRoughness = mix(0.25, 0.02, s.shine);\r
          physical.envMapIntensity = mix(0.5, 0.9, s.shine);\r
        } else if (s.material === 'pearl') {\r
          physical.metalness = 0.35;\r
          physical.roughness = mix(0.4, 0.1, s.shine);\r
          physical.clearcoat = 1;\r
          physical.clearcoatRoughness = 0.05;\r
          physical.iridescence = 1;\r
          physical.iridescenceIOR = 1.75;\r
          physical.iridescenceThicknessRange = [240, 820];\r
          physical.envMapIntensity = 1.15;\r
        }\r
        physical.needsUpdate = true;\r
      }\r
      blobFlat.color.copy(tint);\r
      sprayFlat.color.copy(tint);\r
      const ink = s.material === 'ink';\r
      blob.material = ink ? blobFlat : blobPhysical;\r
      spray.material = ink ? sprayFlat : sprayPhysical;\r
      ground.material.opacity = 0.22;\r
      root.style.mixBlendMode = s.blend;\r
      const parent = root.parentElement;\r
      if (s.hideCursor && parent && !restoreCursor) {\r
        const previous = parent.style.cursor;\r
        parent.style.cursor = 'none';\r
        restoreCursor = () => {\r
          parent.style.cursor = previous;\r
        };\r
      } else if (!s.hideCursor && restoreCursor) {\r
        restoreCursor();\r
        restoreCursor = null;\r
      }\r
      start();\r
    };\r
\r
    const place = (x: number, y: number) => {\r
      for (const body of [anchor, ...core, ...chain]) {\r
        body.x = x;\r
        body.y = y;\r
        body.vx = 0;\r
        body.vy = 0;\r
      }\r
    };\r
\r
    const locate = (event: PointerEvent) => {\r
      const rect = root.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };\r
    };\r
\r
    const onMove = (event: PointerEvent) => {\r
      if (event.pointerType === 'touch' && !pointer.down) return;\r
      const spot = locate(event);\r
      if (spot.inside && (!pointer.inside || !pointer.seen) && swell.value < 0.05) place(spot.x, spot.y);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = spot.inside;\r
      pointer.seen = true;\r
      const target = event.target instanceof Element ? event.target : null;\r
      pointer.hover = spot.inside && !!target?.closest(INTERACTIVE);\r
      start();\r
    };\r
\r
    const burst = () => {\r
      const s = settingsRef.current!;\r
      const radius = (s.size / 2) * Math.cbrt(mass.value);\r
      for (const ball of core) {\r
        const angle = Math.random() * Math.PI * 2;\r
        const push = radius * mix(4, 9, Math.random()) * mix(0.6, 1.2, s.wobble);\r
        ball.vx += Math.cos(angle) * push;\r
        ball.vy += Math.sin(angle) * push;\r
      }\r
      if (!s.splash) return;\r
      const size = mix(0.12, 0.42, s.splashSize);\r
      const speed = mix(320, 1600, s.splashSpeed);\r
      const offset = Math.random() * Math.PI * 2;\r
      const fresh: Drop[] = [];\r
      let lost = 0;\r
      for (let i = 0; i < s.splashCount; i++) {\r
        const angle = offset + (i / s.splashCount) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / s.splashCount);\r
        const grain = Math.random();\r
        const pace = speed * mix(1.3, 0.75, grain) * mix(0.85, 1.15, Math.random());\r
        const r = (s.size / 2) * size * mix(0.65, 1.3, grain);\r
        const vx = Math.cos(angle) * pace + anchor.vx * 0.4;\r
        const vy = Math.sin(angle) * pace + anchor.vy * 0.4;\r
        lost += Math.pow(r / (s.size / 2), 3);\r
        fresh.push({\r
          x: anchor.x + Math.cos(angle) * radius * 0.35,\r
          y: anchor.y + Math.sin(angle) * radius * 0.35,\r
          vx,\r
          vy,\r
          cx: vx * 0.45,\r
          cy: vy * 0.45,\r
          r,\r
          share: 0,\r
          age: 0,\r
          life: DROP_LIFE,\r
          drag: 0.6,\r
          free: false,\r
          sink: -1\r
        });\r
      }\r
      const before = mass.value;\r
      mass.value = Math.max(0.2, before - clamp(lost * 2.4, 0.25, 0.7));\r
      mass.wait = 0.28;\r
      for (const drop of fresh) {\r
        drop.share = ((before - mass.value) * Math.pow(drop.r / (s.size / 2), 3)) / lost;\r
        if (drops.length >= MAX_DROPS) drops.shift();\r
        drops.push(drop);\r
      }\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      const spot = locate(event);\r
      if (!spot.inside) return;\r
      if (event.pointerType === 'touch' && swell.value < 0.05) place(spot.x, spot.y);\r
      pointer.x = spot.x;\r
      pointer.y = spot.y;\r
      pointer.inside = true;\r
      pointer.seen = true;\r
      pointer.down = true;\r
      swell.velocity -= 2;\r
      if (!reducedMotion) burst();\r
      start();\r
    };\r
\r
    const onUp = (event: PointerEvent) => {\r
      if (!pointer.down) return;\r
      pointer.down = false;\r
      swell.velocity += 1.2;\r
      if (event.pointerType === 'touch') pointer.inside = false;\r
      start();\r
    };\r
\r
    const onLeave = (event: PointerEvent) => {\r
      if (event.relatedTarget) return;\r
      pointer.inside = false;\r
      pointer.down = false;\r
      start();\r
    };\r
\r
    const onBlur = () => {\r
      pointer.inside = false;\r
      pointer.down = false;\r
      start();\r
    };\r
\r
    const integrate = (\r
      body: Body,\r
      tx: number,\r
      ty: number,\r
      stiffness: number,\r
      damping: number,\r
      h: number,\r
      frameX = 0,\r
      frameY = 0\r
    ) => {\r
      body.vx += ((tx - body.x) * stiffness - (body.vx - frameX) * damping) * h;\r
      body.vy += ((ty - body.y) * stiffness - (body.vy - frameY) * damping) * h;\r
      body.x += body.vx * h;\r
      body.y += body.vy * h;\r
    };\r
\r
    const step = (dt: number) => {\r
      const s = settingsRef.current!;\r
      const radius = s.size / 2;\r
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));\r
      const h = dt / steps;\r
      const anchorStiffness = reducedMotion ? 2400 : mix(1200, 160, s.lag);\r
      const coreStiffness = mix(900, 260, s.lag);\r
      const linkStiffness = mix(30000, 1500, s.stretch);\r
      const linkDamping = 2 * Math.sqrt(linkStiffness) * mix(0.95, 0.65, s.wobble);\r
      const bounce = mix(0.95, 0.4, s.wobble);\r
      const visible = pointer.inside && pointer.seen;\r
      const swellTarget = visible ? (pointer.down ? 0.86 : pointer.hover ? 1.3 : 1) : 0;\r
\r
      if (!reducedMotion) clock += dt * 4 * Math.pow(s.morphSpeed, 1.5);\r
      const bend = s.morph * (0.6 + 0.4 * Math.sin(clock * 0.71 + seeds[0]));\r
      const bendAngle = clock * 0.23 + seeds[1];\r
      const fold = s.morph * 0.8 * (0.5 + 0.5 * Math.sin(clock * 0.53 + seeds[2]));\r
      const foldAngle = seeds[3] - clock * 0.17;\r
      let strain = 0;\r
      for (const ball of core) {\r
        ball.shape = bend * Math.cos(2 * (ball.angle - bendAngle)) + fold * Math.cos(3 * (ball.angle - foldAngle));\r
        strain += (ball.shape * ball.shape) / CORE;\r
      }\r
      const hold = 1 / (1 + 0.3 * strain);\r
      for (const ball of core) {\r
        const out = radius * clamp(0.14 + 0.75 * ball.shape, 0, 0.8) * hold;\r
        ball.tx = Math.cos(ball.angle) * out;\r
        ball.ty = Math.sin(ball.angle) * out;\r
        ball.grow = (1 + 0.35 * ball.shape) * hold;\r
      }\r
\r
      for (let i = 0; i < steps; i++) {\r
        integrate(anchor, pointer.x, pointer.y, anchorStiffness, 2 * Math.sqrt(anchorStiffness) * 0.9, h);\r
        for (const ball of core) {\r
          const k = coreStiffness * mix(1.3, 0.7, ball.spread);\r
          integrate(\r
            ball,\r
            anchor.x + ball.tx,\r
            anchor.y + ball.ty,\r
            k,\r
            2 * Math.sqrt(k) * bounce,\r
            h,\r
            anchor.vx,\r
            anchor.vy\r
          );\r
        }\r
        for (let c = 0; c < s.trail; c++) {\r
          const leader = c > 0 ? chain[c - 1] : anchor;\r
          integrate(chain[c], leader.x, leader.y, linkStiffness, linkDamping, h);\r
        }\r
        const fall = s.splashGravity * 2200;\r
        const inward = 1 - Math.exp(-18 * h);\r
        for (const drop of drops) {\r
          drop.age += h;\r
          if (drop.sink >= 0) {\r
            const sunk = Math.min(1, drop.sink + h / 0.14);\r
            mass.value = Math.min(1.35, mass.value + drop.share * (sunk - drop.sink));\r
            drop.sink = sunk;\r
            drop.x += (anchor.x - drop.x) * inward;\r
            drop.y += (anchor.y - drop.y) * inward;\r
            continue;\r
          }\r
          const ease = Math.exp(-drop.drag * h);\r
          drop.vx = drop.cx + (drop.vx - drop.cx) * ease;\r
          drop.vy = drop.cy + (drop.vy - drop.cy) * ease + fall * h;\r
          drop.x += drop.vx * h;\r
          drop.y += drop.vy * h;\r
        }\r
        swell.velocity +=\r
          ((swellTarget - swell.value) * 300 - swell.velocity * 2 * Math.sqrt(300) * mix(0.8, 0.38, s.wobble)) * h;\r
        swell.value += swell.velocity * h;\r
        if (swell.value < 0) {\r
          swell.value = 0;\r
          swell.velocity = Math.max(0, swell.velocity);\r
        }\r
      }\r
\r
      const body = radius * Math.max(swell.value, 0) * Math.cbrt(mass.value);\r
      const touching = (drop: Drop, bodies: Body[]) =>\r
        bodies.some(part => part.size > 0 && Math.hypot(drop.x - part.x, drop.y - part.y) < part.size + drop.r * 0.9);\r
      const tail = s.trail > 0 ? chain[s.trail - 1] : core[CORE - 1];\r
      const rush = Math.hypot(anchor.vx, anchor.vy);\r
      if (visible && !reducedMotion) dripping += dt * s.drip * 26 * clamp((rush - 600) / 1800, 0, 1);\r
      while (dripping >= 1) {\r
        dripping -= 1;\r
        const r = radius * mix(0.07, 0.17, Math.random());\r
        if (Math.hypot(tail.x - anchor.x, tail.y - anchor.y) < body + r * 2) continue;\r
        const share = Math.pow(r / radius, 3) * 2.4;\r
        mass.value = Math.max(0.2, mass.value - share);\r
        if (drops.length >= MAX_DROPS) drops.shift();\r
        drops.push({\r
          x: tail.x + (Math.random() - 0.5) * r,\r
          y: tail.y + (Math.random() - 0.5) * r,\r
          vx: tail.vx * 0.2,\r
          vy: tail.vy * 0.2,\r
          cx: 0,\r
          cy: 0,\r
          r,\r
          share,\r
          age: 0,\r
          life: mix(2.5, 4, Math.random()),\r
          drag: 9,\r
          free: true,\r
          sink: -1\r
        });\r
      }\r
      for (let i = drops.length - 1; i >= 0; i--) {\r
        const drop = drops[i];\r
        if (\r
          drop.free &&\r
          drop.sink < 0 &&\r
          drop.age > 0.3 &&\r
          swell.value > 0.05 &&\r
          (touching(drop, core) || touching(drop, chain))\r
        ) {\r
          drop.sink = 0;\r
          const kick = Math.min(0.5, drop.share * 4);\r
          for (const ball of core) {\r
            ball.vx += (drop.vx - anchor.vx) * kick;\r
            ball.vy += (drop.vy - anchor.vy) * kick;\r
          }\r
        }\r
        const margin = drop.r * 3;\r
        const outside =\r
          drop.x < -margin || drop.y < -margin || drop.x > view.width + margin || drop.y > view.height + margin;\r
        if (outside || drop.sink >= 1 || drop.age > drop.life) drops.splice(i, 1);\r
      }\r
      if (mass.wait > 0) mass.wait -= dt;\r
      else mass.value += (1 - mass.value) * (1 - Math.exp(-dt * mix(0.9, 6, s.regrow)));\r
    };\r
\r
    const build = () => {\r
      const s = settingsRef.current!;\r
      const full = (s.size / 2) * Math.max(swell.value, 0);\r
      const radius = full * Math.cbrt(mass.value);\r
      const present = radius >= 0.5;\r
      const blend = radius * mix(0.3, 0.9, s.goo);\r
      const release = radius + blend;\r
      const lift = mix(0.3, 1, s.depth);\r
      const room = MAX_PARTS - CORE - s.trail;\r
      const parts: Part[] = [];\r
      const merging: Part[] = [];\r
      spray.count = 0;\r
      for (const part of core) part.size = 0;\r
      for (const part of chain) part.size = 0;\r
\r
      for (const drop of drops) {\r
        const gap = Math.hypot(drop.x - anchor.x, drop.y - anchor.y);\r
        const rise = drop.free || !present ? 1 : clamp((gap - radius * 0.55) / (radius * 0.6), 0, 1);\r
        const fade = Math.min(rise * rise * (3 - 2 * rise), drop.age / 0.06, (drop.life - drop.age) / 0.9);\r
        const r = drop.r * fade * (drop.sink < 0 ? 1 : Math.cbrt(1 - drop.sink));\r
        if (r < 0.6) continue;\r
        if (present && merging.length < room && (drop.sink >= 0 || (!drop.free && gap < release + r))) {\r
          const firm = drop.sink >= 0 ? 0 : clamp((gap - radius * 0.6) / (release + r - radius * 0.6), 0, 1);\r
          merging.push([\r
            drop.x,\r
            drop.y,\r
            drop.x,\r
            drop.y,\r
            r,\r
            r,\r
            Math.min(blend, r * 1.2) * (1 - firm * firm * (3 - 2 * firm))\r
          ]);\r
          continue;\r
        }\r
        drop.free = true;\r
        if (spray.count >= MAX_DROPS) continue;\r
        const speed = Math.hypot(drop.vx, drop.vy);\r
        const settle = present ? clamp((gap - release - r) / (r * 2), 0, 1) : 1;\r
        const pull = 1 + Math.min(speed / 2600, 0.6) * s.stretch * settle;\r
        stretchAxis.set(drop.vx, -drop.vy, 0);\r
        if (speed > 1) spin.setFromUnitVectors(xAxis, stretchAxis.normalize());\r
        else spin.identity();\r
        spot.set(drop.x - view.width / 2, view.height / 2 - drop.y, 0);\r
        extent.set(r * pull, r / Math.sqrt(pull), (r / Math.sqrt(pull)) * lift);\r
        placement.compose(spot, spin, extent);\r
        spray.setMatrixAt(spray.count, placement);\r
        spray.count++;\r
      }\r
      spray.instanceMatrix.needsUpdate = true;\r
\r
      const floor = -(s.size / 2) * 0.9 * lift;\r
      ground.position.set(0, 0, floor);\r
      key.target.position.set(0, 0, floor);\r
      key.position.set(-0.42, 0.5, 0.76).multiplyScalar(Math.max(view.width, view.height) * 2);\r
      if (!present) return { blob: false, spray: spray.count > 0 };\r
\r
      for (const ball of core) {\r
        const r = radius * HEAD_RADIUS * ball.grow;\r
        ball.size = r + radius * 0.3;\r
        parts.push([ball.x, ball.y, ball.x, ball.y, r, r, radius * HEAD_BLEND]);\r
      }\r
      const route = [anchor, ...chain.slice(0, s.trail)];\r
      const marks = [0];\r
      for (let c = 1; c < route.length; c++) {\r
        marks.push(marks[c - 1] + Math.hypot(route[c].x - route[c - 1].x, route[c].y - route[c - 1].y));\r
      }\r
      const length = marks[marks.length - 1];\r
      const grown = clamp(length / radius, 0, 1);\r
      const start = radius * mix(0.6, 0.95, grown * grown * (3 - 2 * grown));\r
      const taper = mix(0.75, 1.6, clamp(length / (radius * 6), 0, 1));\r
      const thickness = (u: number) => mix(radius * 0.1, start, Math.pow(1 - u, taper));\r
      const sample = (distance: number) => {\r
        let c = 1;\r
        while (c < marks.length - 1 && marks[c] < distance) c++;\r
        const span = marks[c] - marks[c - 1];\r
        const t = span > 0 ? clamp((distance - marks[c - 1]) / span, 0, 1) : 0;\r
        return [mix(route[c - 1].x, route[c].x, t), mix(route[c - 1].y, route[c].y, t)];\r
      };\r
      for (let c = 0; c < s.trail; c++) chain[c].size = thickness(length > 0 ? marks[c + 1] / length : 1);\r
      let previous = [anchor.x, anchor.y];\r
      for (let m = 1; m <= s.trail; m++) {\r
        const next = sample((length * m) / s.trail);\r
        parts.push([\r
          previous[0],\r
          previous[1],\r
          next[0],\r
          next[1],\r
          thickness((m - 1) / s.trail),\r
          thickness(m / s.trail),\r
          radius * 0.06\r
        ]);\r
        previous = next;\r
      }\r
      parts.push(...merging);\r
\r
      const seg = field.blobSeg.value;\r
      const info = field.blobInfo.value;\r
      let minX = Infinity;\r
      let minY = Infinity;\r
      let maxX = -Infinity;\r
      let maxY = -Infinity;\r
      const join = radius * mix(0.2, 0.6, s.goo);\r
      let top = join;\r
      parts.forEach(([ax, ay, bx, by, r1, r2, k], i) => {\r
        const x1 = ax - view.width / 2;\r
        const y1 = view.height / 2 - ay;\r
        const x2 = bx - view.width / 2;\r
        const y2 = view.height / 2 - by;\r
        const reach = Math.max(r1, r2) + k;\r
        seg.set([x1, y1, x2, y2], i * 4);\r
        info.set([r1, r2, k, 0], i * 4);\r
        minX = Math.min(minX, x1 - reach, x2 - reach);\r
        maxX = Math.max(maxX, x1 + reach, x2 + reach);\r
        minY = Math.min(minY, y1 - reach, y2 - reach);\r
        maxY = Math.max(maxY, y1 + reach, y2 + reach);\r
        top = Math.max(top, reach);\r
      });\r
      field.blobCount.value = parts.length;\r
      field.blobHeadEnd.value = CORE;\r
      field.blobTubeEnd.value = CORE + s.trail;\r
      field.blobJoin.value = join;\r
      field.blobTop.value = top;\r
      field.blobRef.value = radius;\r
      field.blobLift.value = lift;\r
      blob.position.set((minX + maxX) / 2, (minY + maxY) / 2, 0);\r
      blob.scale.set(maxX - minX + 4, maxY - minY + 4, 1);\r
      return { blob: true, spray: spray.count > 0 };\r
    };\r
\r
    const tick = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));\r
      last = now;\r
      step(dt);\r
      const built = build();\r
      const shown = built.blob || built.spray;\r
      blob.visible = built.blob;\r
      spray.visible = built.spray;\r
      ground.visible = shown && settingsRef.current!.shadow;\r
      renderer.render(scene, camera);\r
      let energy =\r
        Math.hypot(anchor.vx, anchor.vy) +\r
        Math.abs(swell.velocity) * 40 +\r
        drops.length * 100 +\r
        Math.abs(1 - mass.value) * 400;\r
      for (const ball of core) energy += Math.hypot(ball.vx, ball.vy);\r
      for (let c = 0; c < settingsRef.current!.trail; c++) energy += Math.hypot(chain[c].vx, chain[c].vy);\r
      const breathing =\r
        pointer.inside && settingsRef.current!.morph > 0 && settingsRef.current!.morphSpeed > 0 && !reducedMotion;\r
      calm = energy > 1.5 || breathing ? 0 : calm + dt;\r
      if (!shown && !pointer.inside) return;\r
      if (calm > 0.4) return;\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    function start() {\r
      if (raf || !alive) return;\r
      calm = 0;\r
      last = performance.now();\r
      raf = requestAnimationFrame(tick);\r
    }\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(root);\r
    window.addEventListener('pointermove', onMove, { passive: true });\r
    window.addEventListener('pointerdown', onDown, { passive: true });\r
    window.addEventListener('pointerup', onUp, { passive: true });\r
    window.addEventListener('pointercancel', onUp, { passive: true });\r
    document.addEventListener('pointerout', onLeave);\r
    window.addEventListener('blur', onBlur);\r
\r
    applyRef.current = apply;\r
    resize();\r
    apply();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      applyRef.current = null;\r
      restoreCursor?.();\r
      resizeObserver.disconnect();\r
      window.removeEventListener('pointermove', onMove);\r
      window.removeEventListener('pointerdown', onDown);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      document.removeEventListener('pointerout', onLeave);\r
      window.removeEventListener('blur', onBlur);\r
      blob.geometry.dispose();\r
      blobPhysical.dispose();\r
      blobFlat.dispose();\r
      cast.dispose();\r
      sphere.dispose();\r
      spray.dispose();\r
      sprayPhysical.dispose();\r
      sprayFlat.dispose();\r
      ground.geometry.dispose();\r
      ground.material.dispose();\r
      environment.dispose();\r
      renderer.dispose();\r
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);\r
    };\r
  }, []);\r
\r
  return (\r
    <div\r
      ref={rootRef}\r
      className={\`absolute inset-0 overflow-hidden pointer-events-none \${className}\`.trim()}\r
      style={style}\r
    />\r
  );\r
};\r
\r
export default BlobCursor;\r
`,s={dependencies:"three",usage:`import BlobCursor from './BlobCursor';

<div style={{ position: 'relative', height: '500px' }}>
  <BlobCursor material="chrome" color="#3B82F6" size={140} />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:o};export{s as blobCursor};
