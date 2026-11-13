const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import { draw, effect, frame, init, sampler, storage, surface, target, uniforms } from 'vgpu';\r
import './AeroShards.css';\r
\r
const ROOT = 'aero-shards';\r
const CANVAS = 'aero-shards-canvas';\r
\r
const PLACEMENTS = ['full', 'left', 'right', 'center'];\r
const MATERIALS = {\r
  glass: [0, 0, 0, 0],\r
  chrome: [1, 0, 0, 0]\r
};\r
const FLOATS = 24;\r
const SAMPLES = 160;\r
const CAMERA = 4;\r
const FOCUS = 3.1;\r
const SHARD_FOCUS = 2.75;\r
const LAYER_SCALES = [1, 0.5];\r
const MAX_BANK = 1.0;\r
const DEPTHS = [2.7, 3.9, 5.6, 8.1, 11.6];\r
const SHARE = [0.26, 0.23, 0.2, 0.17, 0.14];\r
const GROWTH = [1, 1.3, 1.8, 2.6, 3.6];\r
const FADE = [1, 0.8, 0.52, 0.32, 0.2];\r
const LEVELS = DEPTHS.length;\r
const INTRO_SECONDS = 3.4;\r
const MARKER_STYLES = { plus: 0, dots: 1 };\r
const MARKER_FLOATS = 8;\r
const MARKER_PHASES = [\r
  [0.37, 0.61],\r
  [0.83, 0.12],\r
  [0.21, 0.88],\r
  [0.66, 0.44],\r
  [0.05, 0.27]\r
];\r
const MAX_RINGS = 4;\r
const RING_SECONDS = 2.6;\r
const BLOOM_LEVELS = 4;\r
const FULL_SLOPES = [\r
  [0.2, -0.78],\r
  [-0.72, 0.02],\r
  [0.58, -0.06],\r
  [-0.24, 0.62],\r
  [0.8, 0.3]\r
];\r
const SIDE_OFFSETS = [0.84, 0.62, 0.44, 0.28, 0.14];\r
const RING_SIZES = [\r
  [0.98, 0.78],\r
  [0.9, 0.7],\r
  [0.84, 0.64],\r
  [0.8, 0.6],\r
  [0.76, 0.56]\r
];\r
const TAU = Math.PI * 2;\r
\r
const SHARD_SHADER = \`\r
struct Frame {\r
  view: vec4f,\r
  eye: vec4f,\r
  forward: vec4f,\r
  right: vec4f,\r
  up: vec4f,\r
  shard: vec4f,\r
  accent: vec4f,\r
  marker: vec4f,\r
  surface: vec4f,\r
}\r
\r
struct Layer {\r
  view: vec4f,\r
  look: vec4f,\r
}\r
\r
struct VertexOut {\r
  @builtin(position) position: vec4f,\r
  @location(0) @interpolate(flat, first) center: vec4f,\r
  @location(1) @interpolate(flat, first) axis: vec4f,\r
  @location(2) @interpolate(flat, first) normal: vec4f,\r
  @location(3) @interpolate(flat, first) p01: vec4f,\r
  @location(4) @interpolate(flat, first) p23: vec4f,\r
  @location(5) @interpolate(flat, first) p4: vec4f,\r
  @location(6) @interpolate(flat, first) topA: vec4f,\r
  @location(7) @interpolate(flat, first) topB: vec4f,\r
  @location(8) @interpolate(flat, first) topC: vec4f,\r
  @location(9) @interpolate(flat, first) bottomA: vec4f,\r
  @location(10) @interpolate(flat, first) bottomB: vec4f,\r
  @location(11) @interpolate(flat, first) bottomC: vec4f,\r
}\r
\r
struct FragmentOut {\r
  @location(0) color: vec4f,\r
  @builtin(frag_depth) depth: f32,\r
}\r
\r
@group(0) @binding(0) var<uniform> scene: Frame;\r
@group(0) @binding(1) var<storage, read> shards: array<vec4f>;\r
@group(0) @binding(2) var<uniform> layerInfo: Layer;\r
\r
fn project(world: vec3f) -> vec3f {\r
  let offset = world - scene.eye.xyz;\r
  let depth = max(dot(offset, scene.forward.xyz), 0.05);\r
  let x = dot(offset, scene.right.xyz);\r
  let y = dot(offset, scene.up.xyz);\r
  return vec3f(layerInfo.view.x * 0.5 + x * layerInfo.view.z / depth, layerInfo.view.y * 0.5 - y * layerInfo.view.z / depth, depth);\r
}\r
\r
@vertex\r
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> VertexOut {\r
  let index = instance * 6u;\r
  let a = shards[index];\r
  let b = shards[index + 1u];\r
  let c = shards[index + 2u];\r
  let d = shards[index + 3u];\r
  let e = shards[index + 4u];\r
  let f = shards[index + 5u];\r
  let center = a.xyz;\r
  let size = a.w;\r
  let axis = normalize(b.xyz);\r
  let normal = normalize(c.xyz);\r
  let side = normalize(cross(normal, axis));\r
\r
  var out: VertexOut;\r
  let middle = project(center);\r
  if (middle.z < 0.35 || size <= 0.0) {\r
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);\r
    return out;\r
  }\r
\r
  let count = i32(f.z);\r
  let points = array<vec2f, 5>(d.xy, d.zw, e.xy, e.zw, f.xy);\r
  var low = vec2f(1e9);\r
  var high = vec2f(-1e9);\r
  var tops = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));\r
  var bottoms = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));\r
  for (var i = 0; i < 5; i += 1) {\r
    let corner = points[min(i, count - 1)];\r
    let onPlate = center + (axis * corner.x + side * corner.y) * size;\r
    let top = project(onPlate + normal * b.w * size);\r
    let bottom = project(onPlate - normal * b.w * size);\r
    tops[i] = top.xy;\r
    bottoms[i] = bottom.xy;\r
    low = min(low, min(top.xy, bottom.xy));\r
    high = max(high, max(top.xy, bottom.xy));\r
  }\r
  low -= vec2f(2.0);\r
  high += vec2f(2.0);\r
  let corners = array<vec2f, 6>(vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0), vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0));\r
  let pixel = mix(low, high, corners[vertexIndex]);\r
  out.position = vec4f(pixel.x / layerInfo.view.x * 2.0 - 1.0, 1.0 - pixel.y / layerInfo.view.y * 2.0, 0.5, 1.0);\r
  out.center = a;\r
  out.axis = vec4f(axis, b.w);\r
  out.normal = vec4f(normal, c.w);\r
  out.p01 = d;\r
  out.p23 = e;\r
  out.p4 = f;\r
  out.topA = vec4f(tops[0], tops[1]);\r
  out.topB = vec4f(tops[2], tops[3]);\r
  out.topC = vec4f(tops[4], 0.0, 0.0);\r
  out.bottomA = vec4f(bottoms[0], bottoms[1]);\r
  out.bottomB = vec4f(bottoms[2], bottoms[3]);\r
  out.bottomC = vec4f(bottoms[4], 0.0, 0.0);\r
  return out;\r
}\r
\r
fn cross2(a: vec2f, b: vec2f) -> f32 {\r
  return a.x * b.y - a.y * b.x;\r
}\r
\r
fn outlineCoverage(p: vec2f, points: array<vec2f, 5>, count: i32) -> f32 {\r
  var area = 0.0;\r
  for (var i = 0; i < 5; i += 1) {\r
    if (i < count) {\r
      area += cross2(points[i], points[(i + 1) % count]);\r
    }\r
  }\r
  let orient = select(-1.0, 1.0, area > 0.0);\r
  var distance = -1e9;\r
  for (var i = 0; i < 5; i += 1) {\r
    if (i < count) {\r
      let a = points[i];\r
      let edge = points[(i + 1) % count] - a;\r
      let span = length(edge);\r
      if (span > 1e-4) {\r
        let n = vec2f(edge.y, -edge.x) * (orient / span);\r
        distance = max(distance, dot(p - a, n));\r
      }\r
    }\r
  }\r
  return clamp(0.5 - distance, 0.0, 1.0);\r
}\r
\r
struct Prism {\r
  points: array<vec2f, 5>,\r
  count: i32,\r
  half: f32,\r
}\r
\r
struct Hit {\r
  near: f32,\r
  far: f32,\r
  normal: vec3f,\r
}\r
\r
fn plane(prism: Prism, k: i32) -> vec4f {\r
  if (k == 0) { return vec4f(0.0, 0.0, 1.0, prism.half); }\r
  if (k == 1) { return vec4f(0.0, 0.0, -1.0, prism.half); }\r
  let a = prism.points[k - 2];\r
  let b = prism.points[(k - 1) % prism.count];\r
  let edge = b - a;\r
  let n = normalize(vec2f(edge.y, -edge.x));\r
  return vec4f(n, 0.0, dot(n, a));\r
}\r
\r
fn trace(prism: Prism, ro: vec3f, rd: vec3f) -> Hit {\r
  var hit: Hit;\r
  hit.near = -1e9;\r
  hit.far = 1e9;\r
  hit.normal = vec3f(0.0, 0.0, 1.0);\r
  for (var k = 0; k < 7; k += 1) {\r
    if (k < prism.count + 2) {\r
      let p = plane(prism, k);\r
      let denom = dot(p.xyz, rd);\r
      let gap = p.w - dot(p.xyz, ro);\r
      if (abs(denom) < 1e-7) {\r
        if (gap < 0.0) { hit.far = -1e9; }\r
      } else {\r
        let t = gap / denom;\r
        if (denom < 0.0) {\r
          if (t > hit.near) {\r
            hit.near = t;\r
            hit.normal = p.xyz;\r
          }\r
        } else if (t < hit.far) {\r
          hit.far = t;\r
        }\r
      }\r
    }\r
  }\r
  return hit;\r
}\r
\r
fn exitFrom(prism: Prism, ro: vec3f, rd: vec3f) -> vec4f {\r
  var best = 1e9;\r
  var normal = vec3f(0.0, 0.0, -1.0);\r
  for (var k = 0; k < 7; k += 1) {\r
    if (k < prism.count + 2) {\r
      let p = plane(prism, k);\r
      let denom = dot(p.xyz, rd);\r
      if (denom > 1e-6) {\r
        let t = (p.w - dot(p.xyz, ro)) / denom;\r
        if (t < best) {\r
          best = t;\r
          normal = p.xyz;\r
        }\r
      }\r
    }\r
  }\r
  return vec4f(normal, max(best, 0.0));\r
}\r
\r
fn rectLight(r: vec3f, dir: vec3f, across: vec3f, extent: vec2f, soft: f32) -> f32 {\r
  let facing = dot(r, dir);\r
  if (facing <= 0.0) { return 0.0; }\r
  let up = cross(dir, across);\r
  let u = dot(r, across) / facing;\r
  let v = dot(r, up) / facing;\r
  let a = 1.0 - smoothstep(extent.x - soft, extent.x + soft, abs(u));\r
  let b = 1.0 - smoothstep(extent.y - soft, extent.y + soft, abs(v));\r
  return a * b;\r
}\r
\r
const KEY_DIR = vec3f(-0.28, 0.72, 0.64) / length(vec3f(-0.28, 0.72, 0.64));\r
const KEY_ACROSS = vec3f(0.92, 0.0, 0.4) / length(vec3f(0.92, 0.0, 0.4));\r
const LEFT_DIR = vec3f(-0.86, 0.12, 0.5) / length(vec3f(-0.86, 0.12, 0.5));\r
const LEFT_ACROSS = vec3f(0.5, 0.0, 0.86) / length(vec3f(0.5, 0.0, 0.86));\r
const RIM_DIR = vec3f(0.78, 0.22, -0.58) / length(vec3f(0.78, 0.22, -0.58));\r
const RIM_ACROSS = vec3f(0.6, 0.0, 0.8) / length(vec3f(0.6, 0.0, 0.8));\r
const TOP_DIR = vec3f(0.05, 0.94, -0.33) / length(vec3f(0.05, 0.94, -0.33));\r
const TOP_ACROSS = vec3f(1.0, 0.0, 0.0);\r
\r
fn lobe(r: vec3f, dir: vec3f, width: f32) -> f32 {\r
  return exp((dot(r, dir) - 1.0) / (width * width));\r
}\r
\r
fn studio(r: vec3f, soft: f32, accent: vec3f, ink: vec3f) -> vec3f {\r
  let sky = clamp(r.y * 0.5 + 0.5, 0.0, 1.0);\r
  var col = mix(ink * 0.03, ink * 0.12 + accent * 0.03, smoothstep(0.25, 0.95, sky));\r
  col += mix(ink, vec3f(1.0), 0.6) * lobe(r, KEY_DIR, 0.38) * 3.6;\r
  col += mix(accent, vec3f(1.0), 0.2) * lobe(r, RIM_DIR, 0.34) * 3.4;\r
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.12, 0.8), 0.08 + soft) * 3.2;\r
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, TOP_DIR, TOP_ACROSS, vec2f(0.9, 0.1), 0.08 + soft) * 2.6;\r
  return col;\r
}\r
\r
fn studioLight(r: vec3f, soft: f32, accent: vec3f) -> vec3f {\r
  let ground = vec3f(0.2, 0.2, 0.23);\r
  let skyTone = vec3f(0.97, 0.97, 0.99);\r
  var col = mix(ground, skyTone, smoothstep(-0.08 - soft, 0.16 + soft, r.y));\r
  col = mix(col, vec3f(0.55, 0.55, 0.6), lobe(r, vec3f(0.0, -1.0, 0.0), 0.5) * 0.4);\r
  col += vec3f(0.4) * rectLight(r, KEY_DIR, KEY_ACROSS, vec2f(0.46, 0.3), 0.07 + soft);\r
  col -= vec3f(0.55) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.1, 0.85), 0.05 + soft);\r
  col -= vec3f(0.45) * rectLight(r, RIM_DIR, RIM_ACROSS, vec2f(0.12, 0.9), 0.05 + soft);\r
  return clamp(col, vec3f(0.05), vec3f(1.2));\r
}\r
\r
fn schlick(cosine: f32, f0: f32) -> f32 {\r
  return f0 + (1.0 - f0) * pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);\r
}\r
\r
fn rayFor(pixel: vec2f) -> vec3f {\r
  let x = pixel.x - layerInfo.view.x * 0.5;\r
  let y = layerInfo.view.y * 0.5 - pixel.y;\r
  return normalize(scene.forward.xyz * layerInfo.view.z + scene.right.xyz * x + scene.up.xyz * y);\r
}\r
\r
struct Surface {\r
  coverage: f32,\r
  color: vec3f,\r
  alpha: f32,\r
  depth: f32,\r
}\r
\r
fn shade(pixel: vec2f, in: VertexOut) -> Surface {\r
  let center = in.center.xyz;\r
  let size = in.center.w;\r
  let axis = in.axis.xyz;\r
  let plateNormal = in.normal.xyz;\r
  let side = normalize(cross(plateNormal, axis));\r
  var prism: Prism;\r
  prism.points = array<vec2f, 5>(in.p01.xy, in.p01.zw, in.p23.xy, in.p23.zw, in.p4.xy);\r
  prism.count = i32(in.p4.z);\r
  prism.half = in.axis.w;\r
\r
  let eye = scene.eye.xyz;\r
  let toLocal = mat3x3f(axis.x, side.x, plateNormal.x, axis.y, side.y, plateNormal.y, axis.z, side.z, plateNormal.z);\r
  let fromLocal = mat3x3f(axis, side, plateNormal);\r
  let origin = toLocal * (eye - center) / size;\r
\r
  let rd = rayFor(pixel);\r
  let ray = toLocal * rd;\r
  let denom = dot(ray, vec3f(0.0, 0.0, 1.0));\r
  let flatT = -origin.z / select(denom, 1e-4, abs(denom) < 1e-4);\r
  let flatPoint = origin.xy + ray.xy * flatT;\r
  let footprint = max(length(fwidth(flatPoint)) * 0.7, 1e-4);\r
  let softBase = clamp(length(fwidth(reflect(rd, plateNormal))) * 0.5, 0.0, 0.5);\r
\r
  let primary = trace(prism, origin, ray);\r
  let tops = array<vec2f, 5>(in.topA.xy, in.topA.zw, in.topB.xy, in.topB.zw, in.topC.xy);\r
  let bottoms = array<vec2f, 5>(in.bottomA.xy, in.bottomA.zw, in.bottomB.xy, in.bottomB.zw, in.bottomC.xy);\r
  let coverage = max(outlineCoverage(pixel, tops, prism.count), outlineCoverage(pixel, bottoms, prism.count));\r
\r
  var surface: Surface;\r
  let facing = select(-1.0, 1.0, origin.z > 0.0);\r
  let capT = (facing * prism.half - origin.z) / select(ray.z, -1e-4 * facing, abs(ray.z) < 1e-4);\r
  let missed = primary.near > primary.far;\r
  let hitT = select(primary.near, capT, missed);\r
  let hitNormal = select(primary.normal, vec3f(0.0, 0.0, facing), missed);\r
  surface.coverage = select(0.0, coverage, hitT > 0.0);\r
  surface.color = vec3f(0.0);\r
  surface.alpha = 0.0;\r
  surface.depth = 1.0;\r
  if (surface.coverage <= 0.0) { return surface; }\r
  let mainRay = ray;\r
\r
  let local = origin + mainRay * hitT;\r
  let worldRay = fromLocal * mainRay;\r
  let viewDepth = max(hitT * size * dot(worldRay, scene.forward.xyz), 0.05);\r
  surface.depth = clamp(1.0 - 0.3 / viewDepth, 0.0, 1.0);\r
\r
  let radius = max(prism.half * 1.15, footprint * 2.5);\r
  var n = hitNormal;\r
  var bevel = 0.0;\r
  if (abs(n.z) > 0.5) {\r
    var gap = 1e9;\r
    for (var k = 2; k < 7; k += 1) {\r
      if (k < prism.count + 2) {\r
        let p = plane(prism, k);\r
        gap = min(gap, p.w - dot(p.xy, local.xy));\r
      }\r
    }\r
    var toward = vec2f(0.0);\r
    for (var k = 2; k < 7; k += 1) {\r
      if (k < prism.count + 2) {\r
        let p = plane(prism, k);\r
        let g = p.w - dot(p.xy, local.xy);\r
        toward += p.xy * exp(-(g - gap) / (radius * 0.35));\r
      }\r
    }\r
    toward = normalize(toward);\r
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);\r
    let angle = bevel * bevel * 0.7853982;\r
    n = normalize(n * cos(angle) + vec3f(toward, 0.0) * sin(angle));\r
  } else {\r
    let gap = prism.half - abs(local.z);\r
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);\r
    let angle = bevel * bevel * 0.7853982;\r
    n = normalize(n * cos(angle) + vec3f(0.0, 0.0, sign(local.z)) * sin(angle));\r
  }\r
  let bendRate = 1.8 / max(radius / footprint, 1.0);\r
  let normal = normalize(fromLocal * n);\r
  let view = -worldRay;\r
  let reflected = reflect(worldRay, normal);\r
  let soft = softBase + bendRate * smoothstep(0.0, 0.25, bevel) * 1.2 + clamp(footprint * 0.6, 0.0, 0.5);\r
  let ndv = clamp(dot(normal, view), 0.0, 1.0);\r
\r
  let accent = scene.accent.rgb;\r
  let base = scene.shard.rgb;\r
  let world = center + fromLocal * local * size;\r
  let height = clamp(0.5 + world.y * 0.45, 0.0, 1.0);\r
  let tone = mix(accent, base, height);\r
  let body = mix(tone, mix(base, accent, 0.5), in.normal.w * 0.3);\r
  let mode = scene.surface.x;\r
  let lightMode = scene.up.w > 0.5;\r
  let wrap = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);\r
\r
  var color = vec3f(0.0);\r
  var alpha = 1.0;\r
  let chrome = mode > 0.5;\r
  if (lightMode) {\r
    let env = studioLight(reflected, soft, accent);\r
    if (chrome) {\r
      color = env * mix(body, vec3f(1.0), 0.6);\r
    } else {\r
      let fresnel = schlick(ndv, 0.05);\r
      let diffuse = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);\r
      alpha = clamp(0.32 + fresnel * 0.5 + (1.0 - abs(n.z)) * 0.5, 0.0, 1.0);\r
      color = mix(body, vec3f(1.0), 0.15) * (0.5 + 0.4 * diffuse) * alpha + (env - vec3f(0.78)) * fresnel * 0.8;\r
    }\r
  } else if (chrome) {\r
    let env = studio(reflected, soft, accent, body);\r
    color = env * mix(body, vec3f(1.0), 0.55) * 0.9 + body * 0.02;\r
  } else {\r
    let fresnel = schlick(ndv, 0.04);\r
    let env = studio(reflected, soft, accent, body);\r
    var light = vec3f(0.0);\r
    var cursor = local;\r
    var direction = toLocal * refract(worldRay, normal, 1.0 / 1.5);\r
    var travelled = 0.0;\r
    var carry = 1.0 - fresnel;\r
    var through = 0.0;\r
    for (var bounce = 0; bounce < 3; bounce += 1) {\r
      let outlet = exitFrom(prism, cursor, direction);\r
      travelled += outlet.w;\r
      cursor = cursor + direction * outlet.w;\r
      let outward = outlet.xyz;\r
      let escaped = refract(direction, -outward, 1.5);\r
      if (dot(escaped, escaped) > 0.0) {\r
        let leave = schlick(dot(direction, outward), 0.04);\r
        let worldOut = normalize(fromLocal * escaped);\r
        let absorb = exp(-(vec3f(1.0) - body) * travelled * size * 22.0);\r
        let straight = smoothstep(0.97, 0.999, dot(worldOut, worldRay));\r
        let energy = carry * (1.0 - leave);\r
        light += studio(worldOut, soft * 2.0 + 0.04, accent, body) * absorb * energy * (1.0 - straight) * 2.0;\r
        through += energy * straight * (absorb.r + absorb.g + absorb.b) / 3.0;\r
        carry *= leave;\r
      }\r
      direction = reflect(direction, outward);\r
    }\r
    let edge = max(pow(1.0 - abs(n.z), 1.2), bevel * bevel * 0.85);\r
    let glow = mix(mix(body, accent, 0.35), vec3f(1.0), 0.28) * edge * (0.35 + 0.45 * wrap);\r
    color = env * fresnel * 0.85 + light * (1.0 - smoothstep(0.0, 0.6, bevel)) + body * 0.02 + glow;\r
    alpha = clamp(1.0 - through + edge * 0.25, 0.0, 1.0);\r
  }\r
\r
  color *= select(1.3, 1.0, lightMode);\r
  let haze = smoothstep(3.5, 12.0, viewDepth) * layerInfo.look.x;\r
  let hazeColor = select(mix(base, accent, 0.5) * 0.3, mix(base, vec3f(1.0), 0.72), lightMode);\r
  color = mix(color, hazeColor * alpha + color * 0.3, haze);\r
  let flash = in.p4.w;\r
  color += mix(accent, vec3f(1.0), 0.35) * flash * select(0.5, 0.0, lightMode) * max(alpha, 0.35);\r
  alpha = max(alpha, flash * 0.45 * select(1.0, 0.0, lightMode));\r
  surface.color = color;\r
  surface.alpha = alpha;\r
  return surface;\r
}\r
\r
@fragment\r
fn fs_solid(in: VertexOut) -> FragmentOut {\r
  let surface = shade(in.position.xy, in);\r
  if (surface.coverage < 0.999 || surface.alpha < 0.6) { discard; }\r
  var out: FragmentOut;\r
  out.color = vec4f(surface.color, surface.alpha);\r
  out.depth = surface.depth;\r
  return out;\r
}\r
\r
@fragment\r
fn fs_edge(in: VertexOut) -> FragmentOut {\r
  let surface = shade(in.position.xy, in);\r
  if (surface.coverage <= 0.001 || (surface.coverage >= 0.9996 && surface.alpha >= 0.62)) { discard; }\r
  var out: FragmentOut;\r
  out.color = vec4f(surface.color, surface.alpha) * surface.coverage;\r
  out.depth = surface.depth;\r
  return out;\r
}\r
\`;\r
\r
const LAYER_BLUR_SHADER = \`\r
struct Spread { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> spreadInfo: Spread;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let sigma = max(spreadInfo.texel.z, 0.3);\r
  let reach = min(i32(ceil(sigma * 2.6)), 20);\r
  var total = textureSampleLevel(source, linearSampler, uv, 0.0);\r
  var weight = 1.0;\r
  for (var i = 1; i <= reach; i += 1) {\r
    let w = exp(-f32(i * i) / (2.0 * sigma * sigma));\r
    let o = spreadInfo.texel.xy * f32(i);\r
    total += (textureSampleLevel(source, linearSampler, uv + o, 0.0) + textureSampleLevel(source, linearSampler, uv - o, 0.0)) * w;\r
    weight += 2.0 * w;\r
  }\r
  return total / weight;\r
}\r
\`;\r
\r
const SHADOW_SHADER = \`\r
struct Shade {\r
  info: vec4f,\r
  more: vec4f,\r
}\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var depthMap: texture_depth_2d;\r
@group(0) @binding(2) var<uniform> shadeInfo: Shade;\r
\r
@fragment\r
fn fs_main(@builtin(position) pixel: vec4f) -> @location(0) vec4f {\r
  let bounds = vec2i(textureDimensions(source)) - vec2i(1);\r
  let here = vec2i(pixel.xy);\r
  let color = textureLoad(source, here, 0);\r
  if (color.a <= 0.002 || shadeInfo.info.z <= 0.0) { return color; }\r
  let depth = textureLoad(depthMap, here, 0);\r
  let east = textureLoad(depthMap, clamp(here + vec2i(1, 0), vec2i(0), bounds), 0);\r
  let west = textureLoad(depthMap, clamp(here - vec2i(1, 0), vec2i(0), bounds), 0);\r
  let south = textureLoad(depthMap, clamp(here + vec2i(0, 1), vec2i(0), bounds), 0);\r
  let north = textureLoad(depthMap, clamp(here - vec2i(0, 1), vec2i(0), bounds), 0);\r
  let limit = shadeInfo.more.x * 0.5;\r
  let slopeX = clamp(select(east - depth, depth - west, abs(depth - west) < abs(east - depth)), -limit, limit);\r
  let slopeY = clamp(select(south - depth, depth - north, abs(depth - north) < abs(south - depth)), -limit, limit);\r
  var occlusion = 0.0;\r
  for (var i = 1; i <= 12; i += 1) {\r
    let offset = -shadeInfo.info.xy * f32(i);\r
    let probe = clamp(vec2i(pixel.xy + offset), vec2i(0), bounds);\r
    let other = textureLoad(depthMap, probe, 0);\r
    let expected = depth + slopeX * offset.x + slopeY * offset.y;\r
    let closer = smoothstep(shadeInfo.more.x * 0.6, shadeInfo.more.x * 2.4, expected - other);\r
    let reach = 1.0 - f32(i - 1) / 12.0;\r
    occlusion = max(occlusion, closer * reach * reach);\r
  }\r
  return vec4f(color.rgb * (1.0 - occlusion * shadeInfo.info.z), color.a);\r
}\r
\`;\r
\r
const COMPOSITE_SHADER = \`\r
struct Blend { info: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> mixInfo: Blend;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  return textureSampleLevel(source, linearSampler, uv, 0.0) * mixInfo.info.x;\r
}\r
\`;\r
\r
const MARKER_SHADER = \`\r
struct Frame {\r
  view: vec4f,\r
  eye: vec4f,\r
  forward: vec4f,\r
  right: vec4f,\r
  up: vec4f,\r
  shard: vec4f,\r
  accent: vec4f,\r
  marker: vec4f,\r
  surface: vec4f,\r
}\r
\r
struct MarkerOut {\r
  @builtin(position) position: vec4f,\r
  @location(0) local: vec2f,\r
  @location(1) @interpolate(flat, first) shape: vec4f,\r
  @location(2) @interpolate(flat, first) light: vec4f,\r
}\r
\r
@group(0) @binding(0) var<uniform> scene: Frame;\r
@group(0) @binding(1) var<storage, read> markers: array<vec4f>;\r
\r
@vertex\r
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> MarkerOut {\r
  let a = markers[instance * 2u];\r
  let b = markers[instance * 2u + 1u];\r
  let offset = a.xyz - scene.eye.xyz;\r
  let depth = max(dot(offset, scene.forward.xyz), 0.05);\r
  let center = vec2f(\r
    scene.view.x * 0.5 + dot(offset, scene.right.xyz) * scene.view.z / depth,\r
    scene.view.y * 0.5 - dot(offset, scene.up.xyz) * scene.view.z / depth,\r
  );\r
  let pixel = scene.marker.y;\r
  let size = scene.marker.z * clamp(sqrt(scene.marker.w / depth), 0.6, 1.3) * b.z;\r
  let blur = min(scene.forward.w * abs(1.0 - scene.eye.w / depth), scene.right.w) * 0.18;\r
  let frame = b.y;\r
  let reach = select(size, size * 2.6, frame > 0.001) + blur + 1.5 * pixel;\r
  let corners = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0));\r
  let corner = corners[vertexIndex % 6u] * reach;\r
  var out: MarkerOut;\r
  if (depth < 0.35 || a.w <= 0.002) {\r
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);\r
    return out;\r
  }\r
  let at = center + corner;\r
  out.position = vec4f(at.x / scene.view.x * 2.0 - 1.0, 1.0 - at.y / scene.view.y * 2.0, 0.5, 1.0);\r
  out.local = corner;\r
  out.shape = vec4f(size, blur, frame, pixel);\r
  out.light = vec4f(b.x, a.w, 0.0, 0.0);\r
  return out;\r
}\r
\r
fn bar(value: f32, edge: f32, soft: f32) -> f32 {\r
  return clamp((edge - value) / soft + 0.5, 0.0, 1.0);\r
}\r
\r
@fragment\r
fn fs_main(in: MarkerOut) -> @location(0) vec4f {\r
  let size = in.shape.x;\r
  let blur = in.shape.y;\r
  let frame = in.shape.z;\r
  let pixel = in.shape.w;\r
  let q = abs(in.local);\r
  let soft = 1.0 + blur;\r
  let thick = 0.6 * pixel + blur * 0.5;\r
  let energy = (0.6 * pixel) / thick;\r
  var cover = 0.0;\r
  if (scene.marker.x < 0.5) {\r
    let across = bar(q.x, size, soft) * bar(q.y, thick, soft);\r
    let down = bar(q.y, size, soft) * bar(q.x, thick, soft);\r
    cover = max(across, down) * energy;\r
  } else {\r
    cover = bar(length(in.local), size * 0.42 + blur * 0.3, soft) * mix(1.0, energy, 0.6);\r
  }\r
  if (frame > 0.001) {\r
    let edge = size * 2.3;\r
    let span = edge * 0.45;\r
    let line = 0.5 * pixel;\r
    let sides = bar(abs(q.x - edge), line, 1.0) * bar(edge - span - q.y, 0.0, 1.0) * bar(q.y - edge - line, 0.0, 1.0);\r
    let caps = bar(abs(q.y - edge), line, 1.0) * bar(edge - span - q.x, 0.0, 1.0) * bar(q.x - edge - line, 0.0, 1.0);\r
    cover = max(cover, max(sides, caps) * frame * 0.85);\r
  }\r
  let glow = in.light.x;\r
  let fade = in.light.y;\r
  let tint = mix(scene.shard.rgb, scene.accent.rgb, 0.4);\r
  if (scene.up.w > 0.5) {\r
    let ink = (1.0 - exp(-glow * 1.6)) * 0.85 * cover * fade;\r
    return vec4f(mix(tint, scene.accent.rgb, 0.5) * 0.55 * ink, ink);\r
  }\r
  let light = cover * glow * fade;\r
  let color = (1.0 - exp(-mix(tint, vec3f(1.0), 0.35) * light * 1.6)) * 1.4;\r
  return vec4f(color, max(max(color.r, color.g), color.b) * 0.8);\r
}\r
\`;\r
\r
const PREFILTER_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
fn bright(uv: vec2f) -> vec3f {\r
  let color = textureSampleLevel(source, linearSampler, uv, 0.0).rgb;\r
  let peak = max(max(color.r, color.g), color.b);\r
  return color * smoothstep(bloom.texel.z, bloom.texel.z + bloom.texel.w, peak);\r
}\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let o = bloom.texel.xy;\r
  let total = bright(uv + vec2f(o.x, o.y)) + bright(uv + vec2f(-o.x, o.y)) + bright(uv + vec2f(o.x, -o.y)) + bright(uv - o);\r
  return vec4f(total * 0.25, 0.0);\r
}\r
\`;\r
\r
const DOWNSAMPLE_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let o = bloom.texel.xy;\r
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.25;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(-o.x, o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, -o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv - o, 0.0) * 0.1875;\r
  return color;\r
}\r
\`;\r
\r
const BLUR_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let delta = bloom.texel.xy;\r
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.181862;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 1.423135, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 1.423135, 0.0)) * 0.284316;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 3.326702, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 3.326702, 0.0)) * 0.106598;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 5.242989, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 5.242989, 0.0)) * 0.018156;\r
  return color;\r
}\r
\`;\r
\r
const FINISH_SHADER = \`\r
struct Finish {\r
  info: vec4f,\r
  paper: vec4f,\r
  mode: vec4f,\r
}\r
@group(0) @binding(0) var sceneTexture: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var bloom0: texture_2d<f32>;\r
@group(0) @binding(3) var bloom1: texture_2d<f32>;\r
@group(0) @binding(4) var bloom2: texture_2d<f32>;\r
@group(0) @binding(5) var bloom3: texture_2d<f32>;\r
@group(0) @binding(6) var<uniform> finish: Finish;\r
\r
fn hash12(value: vec2f) -> f32 {\r
  let p = fract(value * vec2f(0.1031, 0.1030));\r
  let mixed = p + dot(p, p.yx + 33.33);\r
  return fract((mixed.x + mixed.y) * mixed.x);\r
}\r
\r
fn smootherstep(x: f32) -> f32 {\r
  let t = clamp(x, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f, @builtin(position) pixel: vec4f) -> @location(0) vec4f {\r
  let scene = textureLoad(sceneTexture, vec2i(pixel.xy), 0);\r
  let alpha = clamp(scene.a, 0.0, 1.0);\r
  let noise = hash12(floor(pixel.xy) + vec2f(finish.info.y, finish.info.y * 1.618)) - 0.5;\r
  let grain = 1.0 + noise * finish.info.x;\r
  var rgb = vec3f(0.0);\r
  var a = alpha;\r
  if (finish.mode.x > 0.5) {\r
    rgb = clamp(scene.rgb, vec3f(0.0), vec3f(alpha)) * grain;\r
  } else {\r
    var halo = textureSampleLevel(bloom0, linearSampler, uv, 0.0).rgb * 0.4;\r
    halo += textureSampleLevel(bloom1, linearSampler, uv, 0.0).rgb * 0.3;\r
    halo += textureSampleLevel(bloom2, linearSampler, uv, 0.0).rgb * 0.2;\r
    halo += textureSampleLevel(bloom3, linearSampler, uv, 0.0).rgb * 0.1;\r
    halo = halo * finish.info.z;\r
    rgb = (1.0 - exp(-max(scene.rgb, vec3f(0.0)) * finish.info.w)) * grain + halo / (1.0 + halo);\r
    a = max(alpha, max(max(rgb.r, rgb.g), rgb.b));\r
  }\r
  let vignette = finish.mode.y;\r
  if (vignette > 0.0) {\r
    let size = vec2f(textureDimensions(sceneTexture));\r
    let reach = max(vignette * 0.5 * min(size.x, size.y), 1.0);\r
    let fromEdge = min(pixel.xy, size - pixel.xy);\r
    let mask = smootherstep(fromEdge.x / reach) * smootherstep(fromEdge.y / reach);\r
    rgb *= mask;\r
    a *= mask;\r
  }\r
  rgb = clamp(rgb, vec3f(0.0), vec3f(max(a, 0.0)));\r
  if (finish.paper.a > 0.5) {\r
    return vec4f(finish.paper.rgb * (1.0 - a) + rgb, 1.0);\r
  }\r
  return vec4f(rgb, a);\r
}\r
\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smoother = x => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
let probe = null;\r
\r
const parseColor = (value, fallback) => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
const latticeHash = (a, b, c, d) => {\r
  let h = Math.imul(a + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);\r
  h ^= Math.imul(c + 0x27d4eb2f, 0x165667b1) ^ Math.imul(d + 0x7f4a7c15, 0x9e3779b1);\r
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);\r
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;\r
};\r
\r
const random = seed => () => {\r
  seed = (seed + 0x6d2b79f5) | 0;\r
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);\r
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
};\r
\r
const ribbonPoint = (placement, level, s, aspect, out) => {\r
  let u;\r
  let v;\r
  let d;\r
  if (placement === 0) {\r
    u = -1.32 + 2.64 * s;\r
    const slope = FULL_SLOPES[level];\r
    v =\r
      slope[0] +\r
      (slope[1] - slope[0]) * s +\r
      0.1 * Math.sin(s * TAU * 0.7 + level * 2.3) +\r
      0.045 * Math.sin(s * TAU * 1.9 + level);\r
    d = DEPTHS[level] + 0.35 * Math.sin(s * Math.PI * 1.4 + level * 1.9);\r
  } else if (placement === 3) {\r
    const angle = s * TAU + level * 0.9 + Math.PI * 0.5;\r
    const size = RING_SIZES[level];\r
    u = Math.cos(angle) * size[0];\r
    v = Math.sin(angle) * size[1] - 0.02;\r
    d = DEPTHS[level] * 1.1 - Math.sin(angle) * (0.5 + level * 0.25);\r
  } else {\r
    const mirror = placement === 1 ? -1 : 1;\r
    v = 1.32 - 2.64 * s;\r
    u =\r
      mirror *\r
      (SIDE_OFFSETS[level] +\r
        0.1 * Math.sin(s * TAU * 0.6 + level * 1.3) +\r
        0.03 * Math.sin(s * TAU * 2.1 + level) -\r
        0.08 * (1 - s));\r
    d = DEPTHS[level] + 0.3 * Math.sin(s * Math.PI * 1.2 + level);\r
  }\r
  out[0] = (u * aspect * d) / CAMERA;\r
  out[1] = (v * d) / CAMERA;\r
  out[2] = CAMERA - d;\r
  return out;\r
};\r
\r
const createShards = (count, seed) => {\r
  const next = random(seed);\r
  const shards = [];\r
  let made = 0;\r
  for (let level = 0; level < LEVELS; level += 1) {\r
    const amount = level === LEVELS - 1 ? count - made : Math.round(count * SHARE[level]);\r
    made += amount;\r
    for (let index = 0; index < amount; index += 1) {\r
      const flat = next() * 2 - 1;\r
      const family = next();\r
      const outline = [];\r
      if (family < 0.55) {\r
        const spread = 0.17 + next() * 0.15;\r
        outline.push([1, (next() - 0.5) * 0.08]);\r
        outline.push([-0.5 - next() * 0.25, spread * (0.8 + next() * 0.4)]);\r
        outline.push([-0.5 - next() * 0.25, -spread * (0.8 + next() * 0.4)]);\r
      } else if (family < 0.8) {\r
        const spread = 0.2 + next() * 0.14;\r
        outline.push([1, 0]);\r
        outline.push([(next() - 0.3) * 0.5, spread]);\r
        outline.push([-0.55 - next() * 0.2, (next() - 0.5) * 0.1]);\r
        outline.push([(next() - 0.3) * 0.5, -spread * (0.8 + next() * 0.4)]);\r
      } else {\r
        const sides = next() < 0.5 ? 4 : 5;\r
        const stretch = 0.4 + next() * 0.3;\r
        const turn = next() * TAU;\r
        for (let corner = 0; corner < sides; corner += 1) {\r
          const angle = turn + ((corner + (next() - 0.5) * 0.6) * TAU) / sides;\r
          outline.push([Math.cos(angle), Math.sin(angle) * stretch]);\r
        }\r
      }\r
      const sides = outline.length;\r
      let mx = 0;\r
      let my = 0;\r
      for (const point of outline) {\r
        mx += point[0] / sides;\r
        my += point[1] / sides;\r
      }\r
      const shape = [];\r
      for (let corner = 0; corner < 5; corner += 1) {\r
        const point = outline[Math.min(corner, sides - 1)];\r
        shape.push(point[0] - mx, point[1] - my);\r
      }\r
      shards.push({\r
        level,\r
        phase: (index + next()) / Math.max(amount, 1),\r
        lane: Math.sign(flat) * Math.pow(Math.abs(flat), 0.85),\r
        layer: Math.sqrt(-2 * Math.log(Math.max(next(), 1e-6))) * Math.cos(TAU * next()),\r
        size: 0.6 + next() * next() * 1.25,\r
        shape,\r
        sides,\r
        thickness: 0.06 + next() * 0.04,\r
        yaw: (next() - 0.5) * 0.36,\r
        bank: (next() - 0.5) * 0.5,\r
        pitch: (next() - 0.5) * 0.24,\r
        tint: next(),\r
        drift: [next() * TAU, next() * TAU, next() * TAU],\r
        rate: [0.3 + next() * 0.35, 0.25 + next() * 0.35, 0.3 + next() * 0.3],\r
        flutter: [next() * TAU, 0.5 + next() * 0.5],\r
        arrive: next(),\r
        sign: next() < 0.5 ? -1 : 1,\r
        slot: [next() * TAU, 0.06 + 0.3 * Math.sqrt(next()), next() - 0.5, next() < 0.85 ? 1 : -1],\r
        offset: [0, 0, 0],\r
        velocity: [0, 0, 0],\r
        tilt: 0,\r
        tiltVelocity: 0,\r
        flash: 0,\r
        gather: 0,\r
        joined: false,\r
        position: [0, 0, 0],\r
        s: 0\r
      });\r
    }\r
  }\r
  return shards;\r
};\r
\r
export default function AeroShards({\r
  shardColor = '#896ABD',\r
  accentColor = '#A855F7',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  placement = 'full',\r
  material = 'glass',\r
  count = 1300,\r
  shardSize = 1,\r
  spread = 1,\r
  twist = 1,\r
  billow = 1,\r
  speed = 1,\r
  scale = 1,\r
  depthOfField = 0.75,\r
  glow = 0.35,\r
  grain = 0.06,\r
  vignette = 0.3,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.6,\r
  markers = 'plus',\r
  pulseOnClick = true,\r
  holdToGather = true,\r
  parallax = 0.5,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style,\r
  onError\r
}) {\r
  const containerRef = useRef(null);\r
  const onErrorRef = useRef(onError);\r
  onErrorRef.current = onError;\r
\r
  const settings = {\r
    shard: parseColor(shardColor, [0.54, 0.42, 0.74]) ?? [0.54, 0.42, 0.74],\r
    accent: parseColor(accentColor, [0.66, 0.33, 0.97]) ?? [0.66, 0.33, 0.97],\r
    paper: parseColor(backgroundColor, null),\r
    lightMode,\r
    placement: Math.max(0, PLACEMENTS.indexOf(placement)),\r
    material: MATERIALS[material] ?? MATERIALS.glass,\r
    count: Math.round(clamp(count, 100, 6000)),\r
    shardSize: clamp(shardSize, 0.2, 4),\r
    spread: clamp(spread, 0, 3),\r
    twist: clamp(twist, 0, 3),\r
    billow: clamp(billow, 0, 3),\r
    speed: clamp(speed, 0, 4),\r
    scale: clamp(scale, 0.4, 2.5),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    grain: clamp(grain, 0, 0.5),\r
    vignette: clamp(vignette, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    markers: MARKER_STYLES[markers] ?? -1,\r
    pulseOnClick,\r
    holdToGather,\r
    parallax: clamp(parallax, 0, 1),\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
\r
    let disposed = false;\r
    let gpu = null;\r
    let raf = 0;\r
    const cleanups = [];\r
\r
    const fail = error => {\r
      if (disposed) return;\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      gpu?.dispose();\r
      gpu = null;\r
      onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));\r
    };\r
\r
    const start = async () => {\r
      if (typeof navigator === 'undefined' || !('gpu' in navigator)) throw new Error('WebGPU is not available');\r
      const instance = await init({ powerPreference: 'high-performance' });\r
      gpu = instance;\r
      if (disposed) {\r
        instance.dispose();\r
        return;\r
      }\r
      cleanups.push(instance.onError(fail));\r
      const format = navigator.gpu.getPreferredCanvasFormat();\r
      const sizeFor = () => {\r
        const ratio = Math.min(window.devicePixelRatio || 1, settingsRef.current.dpr);\r
        return [\r
          Math.max(1, Math.round(container.clientWidth * ratio)),\r
          Math.max(1, Math.round(container.clientHeight * ratio))\r
        ];\r
      };\r
      const output = surface(instance, canvas, {\r
        autoResize: false,\r
        size: sizeFor(),\r
        format,\r
        alphaMode: 'premultiplied'\r
      });\r
      const linear = sampler(instance, {\r
        minFilter: 'linear',\r
        magFilter: 'linear',\r
        addressModeU: 'clamp-to-edge',\r
        addressModeV: 'clamp-to-edge'\r
      });\r
      const scene = target(instance, { size: output.size, format: 'rgba16float' });\r
      const levelSize = index => [\r
        Math.max(1, Math.round(output.size[0] / 2 ** (index + 1))),\r
        Math.max(1, Math.round(output.size[1] / 2 ** (index + 1)))\r
      ];\r
      const levels = Array.from({ length: BLOOM_LEVELS }, (_, index) => ({\r
        main: target(instance, { size: levelSize(index), format: 'rgba16float' }),\r
        spare: target(instance, { size: levelSize(index), format: 'rgba16float' })\r
      }));\r
      const frameParams = uniforms(instance, {\r
        view: [1, 1, 1, 0],\r
        eye: [0, 0, CAMERA, FOCUS],\r
        forward: [0, 0, -1, 0],\r
        right: [1, 0, 0, 0],\r
        up: [0, 1, 0, 0],\r
        shard: [0.54, 0.42, 0.74, 0.5],\r
        accent: [0.66, 0.33, 0.97, 0],\r
        marker: [0, 1, 4, CAMERA],\r
        surface: [7, 0, 0, 2.4]\r
      });\r
      let markerCapacity = 0;\r
      let markerBuffer = null;\r
      let markerData = new Float32Array(0);\r
      const markerDraw = draw(instance, {\r
        shader: MARKER_SHADER,\r
        vertices: 6,\r
        cull: 'none',\r
        depth: false,\r
        blend: 'premultiplied',\r
        label: 'aero-shards-markers'\r
      });\r
      const ensureMarkers = needed => {\r
        if (needed <= markerCapacity && markerBuffer) return;\r
        markerCapacity = Math.max(needed, 512);\r
        markerData = new Float32Array(markerCapacity * MARKER_FLOATS);\r
        markerBuffer = storage(instance, markerData.byteLength, 'read');\r
        markerDraw.set({ scene: frameParams, markers: markerBuffer });\r
      };\r
      ensureMarkers(512);\r
      const groupSize = scale => [\r
        Math.max(1, Math.round(output.size[0] * scale)),\r
        Math.max(1, Math.round(output.size[1] * scale))\r
      ];\r
      const groups = LAYER_SCALES.map((scale, index) => ({\r
        scale,\r
        layer: target(instance, { size: groupSize(scale), format: 'rgba16float', depth: 'depth32float' }),\r
        shaded: target(instance, { size: groupSize(scale), format: 'rgba16float' }),\r
        temp: target(instance, { size: index === 0 ? [1, 1] : groupSize(scale), format: 'rgba16float' }),\r
        blurred: target(instance, { size: index === 0 ? [1, 1] : groupSize(scale), format: 'rgba16float' }),\r
        softReady: index !== 0\r
      }));\r
      const layerParams = DEPTHS.map(() => uniforms(instance, { view: [1, 1, 1, 0], look: [0.7, 0, 0, 0] }));\r
      const spreadX = DEPTHS.map(() => uniforms(instance, { texel: [0, 0, 0, 0] }));\r
      const spreadY = DEPTHS.map(() => uniforms(instance, { texel: [0, 0, 0, 0] }));\r
      const mixParams = DEPTHS.map(() => uniforms(instance, { info: [1, 0, 0, 0] }));\r
      const shadeParams = DEPTHS.map(() => uniforms(instance, { info: [0, 0, 0, 0], more: [0, 0, 0, 0] }));\r
      const shardSolid = DEPTHS.map((_, level) =>\r
        draw(instance, {\r
          shader: SHARD_SHADER,\r
          entry: { fragment: 'fs_solid' },\r
          vertices: 6,\r
          cull: 'none',\r
          depth: { write: true, compare: 'less' },\r
          label: \`aero-shards-solid-\${level}\`\r
        })\r
      );\r
      const shardEdge = DEPTHS.map((_, level) =>\r
        draw(instance, {\r
          shader: SHARD_SHADER,\r
          entry: { fragment: 'fs_edge' },\r
          vertices: 6,\r
          cull: 'none',\r
          depth: { write: false, compare: 'less' },\r
          blend: 'premultiplied',\r
          label: \`aero-shards-edge-\${level}\`\r
        })\r
      );\r
      const layerPasses = DEPTHS.map((_, level) =>\r
        groups.map((group, index) => ({\r
          shadow: effect(instance, SHADOW_SHADER, {\r
            label: \`aero-shards-shadow-\${level}-\${index}\`,\r
            set: { source: group.layer, depthMap: group.layer.depth, shadeInfo: shadeParams[level] }\r
          }),\r
          blurX: effect(instance, LAYER_BLUR_SHADER, {\r
            label: \`aero-shards-depth-x-\${level}-\${index}\`,\r
            set: { source: group.shaded, linearSampler: linear, spreadInfo: spreadX[level] }\r
          }),\r
          blurY: effect(instance, LAYER_BLUR_SHADER, {\r
            label: \`aero-shards-depth-y-\${level}-\${index}\`,\r
            set: { source: group.temp, linearSampler: linear, spreadInfo: spreadY[level] }\r
          }),\r
          sharp: effect(instance, COMPOSITE_SHADER, {\r
            label: \`aero-shards-sharp-\${level}-\${index}\`,\r
            blend: 'premultiplied',\r
            set: { source: group.shaded, linearSampler: linear, mixInfo: mixParams[level] }\r
          }),\r
          soft: effect(instance, COMPOSITE_SHADER, {\r
            label: \`aero-shards-soft-\${level}-\${index}\`,\r
            blend: 'premultiplied',\r
            set: { source: group.blurred, linearSampler: linear, mixInfo: mixParams[level] }\r
          })\r
        }))\r
      );\r
      let capacity = 0;\r
      let shardBuffer = null;\r
      let upload = new Float32Array(0);\r
      let staging = new Float32Array(0);\r
      let depths = new Float32Array(0);\r
      const ensureCapacity = needed => {\r
        if (needed <= capacity && shardBuffer) return;\r
        capacity = Math.max(needed, 256);\r
        upload = new Float32Array(capacity * FLOATS);\r
        staging = new Float32Array(capacity * FLOATS);\r
        depths = new Float32Array(capacity);\r
        shardBuffer = storage(instance, upload.byteLength, 'read');\r
        DEPTHS.forEach((_, level) => {\r
          shardSolid[level].set({ scene: frameParams, shards: shardBuffer, layerInfo: layerParams[level] });\r
          shardEdge[level].set({ scene: frameParams, shards: shardBuffer, layerInfo: layerParams[level] });\r
        });\r
      };\r
      ensureCapacity(settingsRef.current.count);\r
\r
      const passes = levels.map((level, index) => {\r
        const source = index === 0 ? scene : levels[index - 1].main;\r
        const downParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        const horizontalParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        const verticalParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        return {\r
          source,\r
          level,\r
          downParams,\r
          horizontalParams,\r
          verticalParams,\r
          down: effect(instance, index === 0 ? PREFILTER_SHADER : DOWNSAMPLE_SHADER, {\r
            label: \`aero-shards-down-\${index}\`,\r
            set: { source, linearSampler: linear, bloom: downParams }\r
          }),\r
          horizontal: effect(instance, BLUR_SHADER, {\r
            label: \`aero-shards-blur-x-\${index}\`,\r
            set: { source: level.main, linearSampler: linear, bloom: horizontalParams }\r
          }),\r
          vertical: effect(instance, BLUR_SHADER, {\r
            label: \`aero-shards-blur-y-\${index}\`,\r
            set: { source: level.spare, linearSampler: linear, bloom: verticalParams }\r
          })\r
        };\r
      });\r
      const finishParams = uniforms(instance, { info: [0, 0, 0, 1], paper: [0, 0, 0, 0], mode: [0, 0, 0, 0] });\r
      const finish = effect(instance, FINISH_SHADER, {\r
        label: 'aero-shards-finish',\r
        set: {\r
          sceneTexture: scene,\r
          linearSampler: linear,\r
          bloom0: levels[0].main,\r
          bloom1: levels[1].main,\r
          bloom2: levels[2].main,\r
          bloom3: levels[3].main,\r
          finish: finishParams\r
        }\r
      });\r
      await Promise.all([\r
        ...shardSolid.map(item => item.compile(groups[0].layer)),\r
        ...shardEdge.map(item => item.compile(groups[0].layer)),\r
        ...layerPasses.flatMap(list =>\r
          list.flatMap((item, index) => [\r
            item.shadow.compile(groups[index].shaded),\r
            item.blurX.compile(groups[index].temp),\r
            item.blurY.compile(groups[index].blurred),\r
            item.sharp.compile(scene),\r
            item.soft.compile(scene)\r
          ])\r
        ),\r
        markerDraw.compile(scene),\r
        finish.compile({ colors: [format] }),\r
        ...passes.flatMap((pass, index) => [\r
          pass.down.compile(levels[index].main),\r
          pass.horizontal.compile(levels[index].spare),\r
          pass.vertical.compile(levels[index].main)\r
        ])\r
      ]);\r
      if (disposed) return;\r
\r
      const paths = Array.from({ length: LEVELS }, () => ({\r
        position: new Float32Array(SAMPLES * 3),\r
        tangent: new Float32Array(SAMPLES * 3),\r
        across: new Float32Array(SAMPLES * 3),\r
        lift: new Float32Array(SAMPLES * 3),\r
        length: 1\r
      }));\r
      const markerCounts = [0, 0, 0, 0, 0];\r
      const markerStarts = [0, 0, 0, 0, 0];\r
      const raw = new Float32Array((SAMPLES + 1) * 3);\r
      const lengths = new Float32Array(SAMPLES + 1);\r
      const point = [0, 0, 0];\r
      let pathKey = '';\r
\r
      const state = {\r
        visible: false,\r
        clock: 0,\r
        last: 0,\r
        travel: new Float64Array(LEVELS),\r
        roll: 0,\r
        twist: 0,\r
        drift: 0,\r
        introAt: -1,\r
        weights: PLACEMENTS.map((_, index) => (index === settingsRef.current.placement ? 1 : 0)),\r
        weightVelocity: [0, 0, 0, 0],\r
        shards: createShards(settingsRef.current.count, 1337),\r
        order: [],\r
        pointer: [0.5, 0.5],\r
        inside: false,\r
        presence: 0,\r
        yaw: 0,\r
        pitch: 0,\r
        yawVelocity: 0,\r
        pitchVelocity: 0,\r
        pressAt: -1,\r
        pressPoint: null,\r
        holding: false,\r
        hold: 0,\r
        reach: 0,\r
        gatherCenter: [0, 0, 0],\r
        rings: [],\r
        markerDrift: 0,\r
        markerTarget: '',\r
        markerTotal: 0,\r
        targets: new Map(),\r
        quiet: 0,\r
        seen: null\r
      };\r
\r
      const buildPaths = aspect => {\r
        const closed = state.weights[3] > 0.999;\r
        const key = \`\${aspect.toFixed(4)}|\${state.weights.map(w => w.toFixed(4)).join(',')}\`;\r
        if (key === pathKey) return closed;\r
        pathKey = key;\r
        for (let level = 0; level < LEVELS; level += 1) {\r
          const path = paths[level];\r
          let total = 0;\r
          for (let i = 0; i <= SAMPLES; i += 1) {\r
            const s = i / SAMPLES;\r
            let x = 0;\r
            let y = 0;\r
            let z = 0;\r
            for (let k = 0; k < 4; k += 1) {\r
              const weight = state.weights[k];\r
              if (weight < 0.0001) continue;\r
              ribbonPoint(k, level, s, aspect, point);\r
              x += point[0] * weight;\r
              y += point[1] * weight;\r
              z += point[2] * weight;\r
            }\r
            raw[i * 3] = x;\r
            raw[i * 3 + 1] = y;\r
            raw[i * 3 + 2] = z;\r
            if (i > 0) total += Math.hypot(x - raw[i * 3 - 3], y - raw[i * 3 - 2], z - raw[i * 3 - 1]);\r
            lengths[i] = total;\r
          }\r
          path.length = Math.max(total, 1e-3);\r
          let cursor = 0;\r
          for (let i = 0; i < SAMPLES; i += 1) {\r
            const want = (i / (SAMPLES - 1)) * total;\r
            while (cursor < SAMPLES - 1 && lengths[cursor + 1] < want) cursor += 1;\r
            const span = Math.max(lengths[cursor + 1] - lengths[cursor], 1e-6);\r
            const f = clamp((want - lengths[cursor]) / span, 0, 1);\r
            for (let c = 0; c < 3; c += 1) {\r
              path.position[i * 3 + c] = raw[cursor * 3 + c] + (raw[cursor * 3 + 3 + c] - raw[cursor * 3 + c]) * f;\r
            }\r
          }\r
          let px = 0;\r
          let py = 1;\r
          let pz = 0;\r
          for (let i = 0; i < SAMPLES; i += 1) {\r
            const a = Math.max(0, i - 1);\r
            const b = Math.min(SAMPLES - 1, i + 1);\r
            let tx = path.position[b * 3] - path.position[a * 3];\r
            let ty = path.position[b * 3 + 1] - path.position[a * 3 + 1];\r
            let tz = path.position[b * 3 + 2] - path.position[a * 3 + 2];\r
            const tl = Math.hypot(tx, ty, tz) || 1;\r
            tx /= tl;\r
            ty /= tl;\r
            tz /= tl;\r
            if (i === 0) {\r
              px = -ty;\r
              py = tx;\r
              pz = 0;\r
            }\r
            const along = px * tx + py * ty + pz * tz;\r
            px -= tx * along;\r
            py -= ty * along;\r
            pz -= tz * along;\r
            const pl = Math.hypot(px, py, pz) || 1;\r
            px /= pl;\r
            py /= pl;\r
            pz /= pl;\r
            path.tangent[i * 3] = tx;\r
            path.tangent[i * 3 + 1] = ty;\r
            path.tangent[i * 3 + 2] = tz;\r
            path.across[i * 3] = px;\r
            path.across[i * 3 + 1] = py;\r
            path.across[i * 3 + 2] = pz;\r
            path.lift[i * 3] = ty * pz - tz * py;\r
            path.lift[i * 3 + 1] = tz * px - tx * pz;\r
            path.lift[i * 3 + 2] = tx * py - ty * px;\r
          }\r
        }\r
        return closed;\r
      };\r
\r
      const resize = () => {\r
        const next = sizeFor();\r
        if (next[0] === output.size[0] && next[1] === output.size[1]) return;\r
        output.resize(next);\r
        scene.resize(next);\r
        groups.forEach(group => {\r
          group.layer.resize(groupSize(group.scale));\r
          group.shaded.resize(groupSize(group.scale));\r
          if (group.softReady) {\r
            group.temp.resize(groupSize(group.scale));\r
            group.blurred.resize(groupSize(group.scale));\r
          }\r
        });\r
        levels.forEach((level, index) => {\r
          level.main.resize(levelSize(index));\r
          level.spare.resize(levelSize(index));\r
        });\r
        layerPasses.forEach(list =>\r
          list.forEach((item, index) => item.shadow.set({ depthMap: groups[index].layer.depth }))\r
        );\r
        state.quiet = 0;\r
      };\r
      const sizes = new ResizeObserver(resize);\r
      sizes.observe(container);\r
      cleanups.push(() => sizes.disconnect());\r
\r
      const cam = { eye: [0, 0, CAMERA], forward: [0, 0, -1], right: [1, 0, 0], up: [0, 1, 0], focal: 1 };\r
\r
      const updateCamera = s => {\r
        const cy = Math.cos(state.yaw);\r
        const sy = Math.sin(state.yaw);\r
        const cp = Math.cos(state.pitch);\r
        const sp = Math.sin(state.pitch);\r
        cam.eye[0] = sy * cp * CAMERA;\r
        cam.eye[1] = sp * CAMERA;\r
        cam.eye[2] = cy * cp * CAMERA;\r
        cam.forward[0] = -sy * cp;\r
        cam.forward[1] = -sp;\r
        cam.forward[2] = -cy * cp;\r
        const rl = Math.hypot(cam.forward[2], cam.forward[0]) || 1;\r
        cam.right[0] = -cam.forward[2] / rl;\r
        cam.right[1] = 0;\r
        cam.right[2] = cam.forward[0] / rl;\r
        cam.up[0] = cam.right[1] * cam.forward[2] - cam.right[2] * cam.forward[1];\r
        cam.up[1] = cam.right[2] * cam.forward[0] - cam.right[0] * cam.forward[2];\r
        cam.up[2] = cam.right[0] * cam.forward[1] - cam.right[1] * cam.forward[0];\r
        cam.focal = output.size[1] * 0.5 * CAMERA * s.scale;\r
      };\r
\r
      const ray = [0, 0, 1];\r
      const rayAt = (px, py) => {\r
        const x = (px - 0.5) * output.size[0];\r
        const y = (0.5 - py) * output.size[1];\r
        ray[0] = cam.forward[0] * cam.focal + cam.right[0] * x + cam.up[0] * y;\r
        ray[1] = cam.forward[1] * cam.focal + cam.right[1] * x + cam.up[1] * y;\r
        ray[2] = cam.forward[2] * cam.focal + cam.right[2] * x + cam.up[2] * y;\r
        const length = Math.hypot(ray[0], ray[1], ray[2]) || 1;\r
        ray[0] /= length;\r
        ray[1] /= length;\r
        ray[2] /= length;\r
        return ray;\r
      };\r
\r
      const simulate = (s, dt, reduced) => {\r
        const aspect = output.size[0] / Math.max(output.size[1], 1);\r
        const closed = buildPaths(aspect);\r
        const introOn = s.intro && !reduced;\r
        const introAge = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
        const hover = s.mouseInteraction && !reduced ? state.presence * s.mouseStrength : 0;\r
        let rx = 0;\r
        let ry = 0;\r
        let rz = 0;\r
        if (hover > 0.001) {\r
          rayAt(state.pointer[0], state.pointer[1]);\r
          rx = ray[0];\r
          ry = ray[1];\r
          rz = ray[2];\r
        }\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
        const h = dt / Math.max(steps, 1);\r
        const halfHeight = output.size[1] * 0.5;\r
        const rings = state.rings.map(ring => {\r
          const life = ring.age / RING_SECONDS;\r
          return {\r
            x: ring.x,\r
            y: ring.y,\r
            age: ring.age,\r
            strength: (1 - Math.exp(-ring.age / 0.06)) * (1 - life) * (1 - life)\r
          };\r
        });\r
        const screenOf = (x, y, z, out) => {\r
          const ex = x - cam.eye[0];\r
          const ey = y - cam.eye[1];\r
          const ez = z - cam.eye[2];\r
          const depth = Math.max(ex * cam.forward[0] + ey * cam.forward[1] + ez * cam.forward[2], 0.05);\r
          out[0] = ((ex * cam.right[0] + ey * cam.right[1] + ez * cam.right[2]) * cam.focal) / depth / halfHeight;\r
          out[1] = ((ex * cam.up[0] + ey * cam.up[1] + ez * cam.up[2]) * cam.focal) / depth / halfHeight;\r
          return depth;\r
        };\r
        const ringBand = (sx, sy, level) => {\r
          let total = 0;\r
          for (const ring of rings) {\r
            const radius = Math.max(0, ring.age - level * 0.07) * 2.3;\r
            const distance = Math.hypot(sx - ring.x, sy - ring.y);\r
            total += Math.exp(-((distance - radius) * (distance - radius)) / 0.012) * ring.strength;\r
          }\r
          return total;\r
        };\r
        const flat = [0, 0];\r
        const shards = state.shards;\r
        const twistWeight = Math.min(1, s.twist);\r
        for (let index = 0; index < shards.length; index += 1) {\r
          const shard = shards[index];\r
          const level = shard.level;\r
          const path = paths[level];\r
          let s0 = (shard.phase + state.travel[level]) % 1;\r
          let appear = 1;\r
          let introBank = 0;\r
          if (introOn) {\r
            const begin =\r
              level * 0.22 + Math.max(0, s0 - 0.1) * (INTRO_SECONDS - 1.0 - (LEVELS - 1) * 0.22) + shard.arrive * 0.15;\r
            const local = clamp((introAge - begin) / 0.9, 0, 1);\r
            appear = smoother(local);\r
            const glide = (1 - local) * (1 - local);\r
            s0 = closed ? s0 - glide * 0.06 : Math.max(0, s0 - glide * 0.06);\r
            introBank = glide * 0.9 * shard.sign;\r
          }\r
          shard.s = s0;\r
          const f = (((s0 % 1) + 1) % 1) * (SAMPLES - 1);\r
          const i0 = Math.floor(f);\r
          const i1 = Math.min(i0 + 1, SAMPLES - 1);\r
          const t = f - i0;\r
          const at = (array, c) => array[i0 * 3 + c] + (array[i1 * 3 + c] - array[i0 * 3 + c]) * t;\r
          const cx = at(path.position, 0);\r
          const cy = at(path.position, 1);\r
          const cz = at(path.position, 2);\r
          const tx = at(path.tangent, 0);\r
          const ty = at(path.tangent, 1);\r
          const tz = at(path.tangent, 2);\r
          const ax0 = at(path.across, 0);\r
          const ay0 = at(path.across, 1);\r
          const az0 = at(path.across, 2);\r
          const lx0 = at(path.lift, 0);\r
          const ly0 = at(path.lift, 1);\r
          const lz0 = at(path.lift, 2);\r
          const angle = s.twist * (s0 * TAU * 0.6 + state.twist + level * 1.7);\r
          const ca = Math.cos(angle);\r
          const sa = Math.sin(angle);\r
          const ax = ax0 * ca + lx0 * sa;\r
          const ay = ay0 * ca + ly0 * sa;\r
          const az = az0 * ca + lz0 * sa;\r
          const bx = lx0 * ca - ax0 * sa;\r
          const by = ly0 * ca - ay0 * sa;\r
          const bz = lz0 * ca - az0 * sa;\r
          const depthScale = DEPTHS[level] / CAMERA;\r
          const width =\r
            s.spread * (0.15 + 0.035 * DEPTHS[level]) * (0.8 + 0.3 * Math.sin(s0 * TAU * 1.3 + level * 0.8));\r
          const lane = shard.lane * width;\r
          const layer = shard.layer * 0.012 * depthScale;\r
          const taper = closed ? 1 : smoother(s0 / 0.12) * smoother((1 - s0) / 0.12);\r
          const billow =\r
            s.billow *\r
            0.16 *\r
            depthScale *\r
            Math.sin(s0 * TAU * 1.3 - state.drift * 0.5 + level * 1.1) *\r
            (0.4 + 0.6 * taper);\r
          const sway = s.billow * 0.06 * depthScale * Math.sin(s0 * TAU * 0.8 - state.drift * 0.35 + level * 2.4);\r
          const wobble = 0.009 * depthScale;\r
          const drift = state.drift;\r
          const hx =\r
            cx +\r
            lx0 * billow +\r
            ax0 * sway +\r
            ax * lane +\r
            bx * layer +\r
            Math.sin(drift * shard.rate[0] + shard.drift[0]) * wobble;\r
          const hy =\r
            cy +\r
            ly0 * billow +\r
            ay0 * sway +\r
            ay * lane +\r
            by * layer +\r
            Math.sin(drift * shard.rate[1] + shard.drift[1]) * wobble;\r
          const hz =\r
            cz +\r
            lz0 * billow +\r
            az0 * sway +\r
            az * lane +\r
            bz * layer +\r
            Math.sin(drift * shard.rate[2] + shard.drift[2]) * wobble;\r
\r
          let fx = 0;\r
          let fy = 0;\r
          let fz = 0;\r
          let tiltTarget = 0;\r
          const px = hx + shard.offset[0];\r
          const py = hy + shard.offset[1];\r
          const pz = hz + shard.offset[2];\r
          if (hover > 0.001) {\r
            const ex = px - cam.eye[0];\r
            const ey = py - cam.eye[1];\r
            const ez = pz - cam.eye[2];\r
            const along = ex * rx + ey * ry + ez * rz;\r
            const qx = ex - rx * along;\r
            const qy = ey - ry * along;\r
            const qz = ez - rz * along;\r
            const gap = Math.hypot(qx, qy, qz);\r
            const reach = (0.24 * depthScale) / s.scale;\r
            const falloff = Math.exp(-(gap * gap) / (reach * reach));\r
            if (falloff > 0.002 && gap > 1e-5) {\r
              const nx = qx / gap;\r
              const ny = qy / gap;\r
              const nz = qz / gap;\r
              const sideways = (nx * tx + ny * ty + nz * tz) * 0.7;\r
              const strength = hover * falloff * 9 * depthScale;\r
              fx += (nx - tx * sideways) * strength;\r
              fy += (ny - ty * sideways) * strength;\r
              fz += (nz - tz * sideways) * strength;\r
              tiltTarget += hover * falloff * 1.1 * (nx * ax0 + ny * ay0 + nz * az0);\r
            }\r
          }\r
\r
          if (state.hold > 0.001 && shard.joined) {\r
            const slot = shard.slot;\r
            const orbit = slot[0] + state.clock * (0.8 / (0.12 + slot[1])) * slot[3];\r
            const radius = slot[1] / s.scale;\r
            const gx = state.gatherCenter[0] + Math.cos(orbit) * radius;\r
            const gy = state.gatherCenter[1] + Math.sin(orbit) * radius * 0.75;\r
            const gz = state.gatherCenter[2] + Math.sin(orbit) * radius * 0.45 + slot[2] * 0.3;\r
            shard.gather += (state.hold - shard.gather) * (1 - Math.exp(-dt / 0.3));\r
            const pull = shard.gather * 30;\r
            fx += (gx - px) * pull;\r
            fy += (gy - py) * pull;\r
            fz += (gz - pz) * pull;\r
            tiltTarget += shard.gather * 0.6 * Math.sin(orbit);\r
          } else {\r
            shard.gather += (0 - shard.gather) * (1 - Math.exp(-dt / 0.2));\r
          }\r
\r
          if (rings.length) {\r
            screenOf(px, py, pz, flat);\r
            for (const ring of rings) {\r
              const radius = Math.max(0, ring.age - level * 0.07) * 2.3;\r
              const dxr = flat[0] - ring.x;\r
              const dyr = flat[1] - ring.y;\r
              const distance = Math.hypot(dxr, dyr);\r
              const band = Math.exp(-((distance - radius) * (distance - radius)) / 0.012) * ring.strength;\r
              if (band > 0.01) {\r
                shard.flash = Math.max(shard.flash, band * 0.75);\r
                const outward = Math.max(distance, 0.05);\r
                const ux = (cam.right[0] * dxr + cam.up[0] * dyr) / outward;\r
                const uy = (cam.right[1] * dxr + cam.up[1] * dyr) / outward;\r
                const uz = (cam.right[2] * dxr + cam.up[2] * dyr) / outward;\r
                tiltTarget += band * 1.4 * (ux * ax0 + uy * ay0 + uz * az0);\r
                const push = (band * 2.2 * depthScale) / Math.max(distance, 0.05);\r
                fx += (cam.right[0] * dxr + cam.up[0] * dyr) * push;\r
                fy += (cam.right[1] * dxr + cam.up[1] * dyr) * push;\r
                fz += (cam.right[2] * dxr + cam.up[2] * dyr) * push;\r
              }\r
            }\r
          }\r
\r
          const stiffness = 24 * (1 - shard.gather * 0.95);\r
          for (let step = 0; step < steps; step += 1) {\r
            shard.velocity[0] += (fx - stiffness * shard.offset[0] - 7.5 * shard.velocity[0]) * h;\r
            shard.velocity[1] += (fy - stiffness * shard.offset[1] - 7.5 * shard.velocity[1]) * h;\r
            shard.velocity[2] += (fz - stiffness * shard.offset[2] - 7.5 * shard.velocity[2]) * h;\r
            shard.offset[0] += shard.velocity[0] * h;\r
            shard.offset[1] += shard.velocity[1] * h;\r
            shard.offset[2] += shard.velocity[2] * h;\r
            shard.tiltVelocity += (90 * (tiltTarget - shard.tilt) - 15 * shard.tiltVelocity) * h;\r
            shard.tilt += shard.tiltVelocity * h;\r
          }\r
          shard.flash *= Math.exp(-dt / 0.45);\r
\r
          const ox = hx + shard.offset[0];\r
          const oy = hy + shard.offset[1];\r
          const oz = hz + shard.offset[2];\r
          shard.position[0] = ox;\r
          shard.position[1] = oy;\r
          shard.position[2] = oz;\r
\r
          let vx = cam.eye[0] - ox;\r
          let vy = cam.eye[1] - oy;\r
          let vz = cam.eye[2] - oz;\r
          const vl = Math.hypot(vx, vy, vz) || 1;\r
          vx /= vl;\r
          vy /= vl;\r
          vz /= vl;\r
          let dx = tx + shard.velocity[0] * 0.05;\r
          let dy = ty + shard.velocity[1] * 0.05;\r
          let dz = tz + shard.velocity[2] * 0.05;\r
          const facingPart = dx * vx + dy * vy + dz * vz;\r
          dx -= vx * facingPart;\r
          dy -= vy * facingPart;\r
          dz -= vz * facingPart;\r
          let dl = Math.hypot(dx, dy, dz);\r
          if (dl < 1e-4) {\r
            dx = cam.right[0];\r
            dy = cam.right[1];\r
            dz = cam.right[2];\r
            dl = 1;\r
          }\r
          dx /= dl;\r
          dy /= dl;\r
          dz /= dl;\r
          const wx = vy * dz - vz * dy;\r
          const wy = vz * dx - vx * dz;\r
          const wz = vx * dy - vy * dx;\r
          const yaw = shard.yaw + 0.05 * Math.sin(state.clock * shard.flutter[1] * 0.7 + shard.flutter[0]);\r
          const cyaw = Math.cos(yaw);\r
          const syaw = Math.sin(yaw);\r
          const kx = dx * cyaw + wx * syaw;\r
          const ky = dy * cyaw + wy * syaw;\r
          const kz = dz * cyaw + wz * syaw;\r
          const jx = wx * cyaw - dx * syaw;\r
          const jy = wy * cyaw - dy * syaw;\r
          const jz = wz * cyaw - dz * syaw;\r
          const wave =\r
            0.8 * twistWeight * Math.sin(angle) +\r
            0.3 * Math.sin(s0 * TAU * 1.6 - state.roll * 0.55 + level * 0.9 + shard.lane * 0.7);\r
          const flutter = 0.06 * Math.sin(state.clock * shard.flutter[1] + shard.flutter[0]);\r
          const bank = MAX_BANK * Math.tanh((wave + shard.bank + flutter + shard.tilt + introBank) / MAX_BANK);\r
          const cb = Math.cos(bank);\r
          const sb = Math.sin(bank);\r
          const mx = vx * cb + jx * sb;\r
          const my = vy * cb + jy * sb;\r
          const mz = vz * cb + jz * sb;\r
          const pitch = shard.pitch + 0.2 * Math.sin(s0 * TAU * 1.1 - state.roll * 0.4 + level * 2.1);\r
          const cp = Math.cos(pitch);\r
          const sp = Math.sin(pitch);\r
          const axisX = kx * cp + mx * sp;\r
          const axisY = ky * cp + my * sp;\r
          const axisZ = kz * cp + mz * sp;\r
          const nx = mx * cp - kx * sp;\r
          const ny = my * cp - ky * sp;\r
          const nz = mz * cp - kz * sp;\r
\r
          const ex = ox - cam.eye[0];\r
          const ey = oy - cam.eye[1];\r
          const ez = oz - cam.eye[2];\r
          const viewDepth = ex * cam.forward[0] + ey * cam.forward[1] + ez * cam.forward[2];\r
          depths[index] = viewDepth;\r
          const core = 1 - 0.45 * shard.lane * shard.lane;\r
          const size = 0.062 * s.shardSize * shard.size * GROWTH[level] * appear * Math.sqrt(taper) * core;\r
          const o = index * FLOATS;\r
          staging[o] = ox;\r
          staging[o + 1] = oy;\r
          staging[o + 2] = oz;\r
          staging[o + 3] = size > 1e-5 ? size : 0;\r
          staging[o + 4] = axisX;\r
          staging[o + 5] = axisY;\r
          staging[o + 6] = axisZ;\r
          staging[o + 7] = shard.thickness;\r
          staging[o + 8] = nx;\r
          staging[o + 9] = ny;\r
          staging[o + 10] = nz;\r
          staging[o + 11] = shard.tint;\r
          for (let k = 0; k < 10; k += 1) staging[o + 12 + k] = shard.shape[k];\r
          staging[o + 22] = shard.sides;\r
          staging[o + 23] = shard.flash;\r
        }\r
\r
        let markerTotal = 0;\r
        for (let level = 0; level < LEVELS; level += 1) {\r
          markerCounts[level] = 0;\r
          markerStarts[level] = 0;\r
        }\r
        if (s.markers >= 0) {\r
          const ratio = output.size[1] / Math.max(container.clientHeight, 1);\r
          const pointerX = (state.pointer[0] - 0.5) * 2 * aspect;\r
          const pointerY = (0.5 - state.pointer[1]) * 2;\r
          const engaged = s.mouseInteraction && !reduced ? state.presence : 0;\r
          const previousTargets = state.targets;\r
          const nextTargets = new Map();\r
          const targetEase = 1 - Math.exp(-dt / 0.12);\r
          let nearestKey = '';\r
          let nearestGap = 72;\r
          for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
            markerStarts[level] = markerTotal;\r
            const depth = DEPTHS[level];\r
            const depthScale = depth / CAMERA;\r
            const spacing = 0.42 * Math.pow(depthScale, 0.55);\r
            const halfW = ((aspect * depth) / (CAMERA * s.scale)) * 1.12 + spacing;\r
            const halfH = (depth / (CAMERA * s.scale)) * 1.12 + spacing;\r
            const drift = state.markerDrift;\r
            const phase = MARKER_PHASES[level];\r
            const i0 = Math.floor((drift - halfW) / spacing - phase[0]);\r
            const i1 = Math.ceil((drift + halfW) / spacing - phase[0]);\r
            const j0 = Math.floor(-halfH / spacing - phase[1]);\r
            const j1 = Math.ceil(halfH / spacing - phase[1]);\r
            const band = s.spread * (0.15 + 0.035 * depth) * 1.4;\r
            const position = paths[level].position;\r
            for (let i = i0; i <= i1; i += 1) {\r
              for (let j = j0; j <= j1; j += 1) {\r
                const keep = latticeHash(level, i, j, 11);\r
                if (keep > 0.5) continue;\r
                const x = (i + phase[0]) * spacing - drift;\r
                const y = (j + phase[1]) * spacing;\r
                const z = CAMERA - depth;\r
                const markerDepth = screenOf(x, y, z, flat);\r
                if (Math.abs(flat[0]) > aspect * 1.05 || Math.abs(flat[1]) > 1.05) continue;\r
                let best = Infinity;\r
                for (let k = 0; k < SAMPLES; k += 2) {\r
                  const dx = x - position[k * 3];\r
                  const dy = y - position[k * 3 + 1];\r
                  const dz = z - position[k * 3 + 2];\r
                  const d2 = dx * dx + dy * dy + dz * dz;\r
                  if (d2 < best) best = d2;\r
                }\r
                const near = Math.exp(-best / (band * band));\r
                const blinkSeed = latticeHash(level, i, j, 23);\r
                const blinkRate = latticeHash(level, i, j, 37);\r
                const blink =\r
                  blinkSeed < 0.07 ? 0.5 + 0.5 * Math.sin(state.clock * (1.4 + blinkRate * 2.2) + blinkRate * 40) : 0;\r
                const pointerGap = (Math.hypot(flat[0] - pointerX, flat[1] - pointerY) * halfHeight) / ratio;\r
                const key = \`\${level}:\${i}:\${j}\`;\r
                if (level <= 2 && engaged > 0.01 && pointerGap < nearestGap) {\r
                  nearestGap = pointerGap;\r
                  nearestKey = key;\r
                }\r
                const wanted = key === state.markerTarget ? engaged * (1 - smoother((pointerGap - 30) / 42)) : 0;\r
                const before = previousTargets.get(key) ?? 0;\r
                const target = before + (wanted - before) * targetEase;\r
                if (target > 0.002) nextTargets.set(key, target);\r
                const bracket = Math.max(smoother((blink - 0.55) / 0.4), target);\r
                let ring = 0;\r
                if (rings.length) ring = ringBand(flat[0], flat[1], level);\r
                let reveal = 1;\r
                if (introOn) {\r
                  const across = clamp((flat[0] / aspect + 1) * 0.5, 0, 1);\r
                  const begin = level * 0.22 + 0.35 + across * (INTRO_SECONDS - 1.3 - (LEVELS - 1) * 0.22);\r
                  reveal = smoother((introAge - begin) / 0.5);\r
                }\r
                const fade = FADE[level] * (1 - smoother((markerDepth - 3) / 10) * 0.45) * reveal;\r
                if (fade < 0.002) continue;\r
                if (markerTotal >= markerCapacity) ensureMarkers(markerCapacity * 2);\r
                const o = markerTotal * MARKER_FLOATS;\r
                markerData[o] = x;\r
                markerData[o + 1] = y;\r
                markerData[o + 2] = z;\r
                markerData[o + 3] = fade;\r
                markerData[o + 4] = 0.42 + 0.5 * near + blink * 0.9 + target * 1.3 + ring * 2.5;\r
                markerData[o + 5] = bracket;\r
                markerData[o + 6] = 1 + 0.15 * near + 0.3 * blink + 0.2 * target;\r
                markerData[o + 7] = 0;\r
                markerTotal += 1;\r
                markerCounts[level] += 1;\r
              }\r
            }\r
          }\r
          state.targets = nextTargets;\r
          state.markerTarget = nearestKey;\r
        }\r
        state.markerTotal = markerTotal;\r
      };\r
\r
      const render = (s, dt, reduced) => {\r
        updateCamera(s);\r
        const shards = state.shards;\r
        ensureCapacity(shards.length);\r
        simulate(s, dt, reduced);\r
        if (state.order.length !== shards.length) state.order = shards.map((_, index) => index);\r
        const order = state.order;\r
        for (let i = 0; i < shards.length; i += 1) depths[i] += shards[i].level * 100;\r
        for (let i = 1; i < order.length; i += 1) {\r
          const value = order[i];\r
          const key = depths[value];\r
          let j = i - 1;\r
          while (j >= 0 && depths[order[j]] < key) {\r
            order[j + 1] = order[j];\r
            j -= 1;\r
          }\r
          order[j + 1] = value;\r
        }\r
        const counts = [0, 0, 0, 0, 0];\r
        for (let slot = 0; slot < order.length; slot += 1) {\r
          const from = order[slot] * FLOATS;\r
          const to = slot * FLOATS;\r
          counts[shards[order[slot]].level] += 1;\r
          for (let k = 0; k < FLOATS; k += 1) upload[to + k] = staging[from + k];\r
        }\r
        shardBuffer?.write(upload.subarray(0, shards.length * FLOATS));\r
        if (state.markerTotal > 0) markerBuffer?.write(markerData.subarray(0, state.markerTotal * MARKER_FLOATS));\r
        const starts = [0, 0, 0, 0, 0];\r
        let running = 0;\r
        for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
          starts[level] = running;\r
          running += counts[level];\r
        }\r
\r
        frameParams.set({\r
          view: [output.size[0], output.size[1], cam.focal, state.clock],\r
          eye: [cam.eye[0], cam.eye[1], cam.eye[2], FOCUS],\r
          forward: [cam.forward[0], cam.forward[1], cam.forward[2], s.depthOfField * output.size[1] * 0.03],\r
          right: [cam.right[0], cam.right[1], cam.right[2], output.size[1] * 0.05],\r
          up: [cam.up[0], cam.up[1], cam.up[2], s.lightMode ? 1 : 0],\r
          shard: [...s.shard, 0],\r
          accent: [...s.accent, 0],\r
          surface: s.material,\r
          marker: [\r
            s.markers,\r
            output.size[1] / Math.max(container.clientHeight, 1),\r
            4 * (output.size[1] / Math.max(container.clientHeight, 1)),\r
            FOCUS\r
          ]\r
        });\r
        passes.forEach(({ downParams, horizontalParams, verticalParams, source, level }) => {\r
          downParams.set({ texel: [0.5 / source.size[0], 0.5 / source.size[1], 0.75, 0.5] });\r
          horizontalParams.set({ texel: [1 / level.main.size[0], 0, 0, 0] });\r
          verticalParams.set({ texel: [0, 1 / level.main.size[1], 0, 0] });\r
        });\r
        const paper = s.paper ?? [0, 0, 0];\r
        const blooming = s.glow > 0.001 && !s.lightMode;\r
        finishParams.set({\r
          info: [s.grain, Math.floor(state.clock * 24), blooming ? s.glow : 0, 1.3],\r
          paper: [paper[0], paper[1], paper[2], s.paper ? 1 : 0],\r
          mode: [s.lightMode ? 1 : 0, s.vignette, 0, 0]\r
        });\r
\r
        const coc = s.depthOfField * output.size[1] * 0.012;\r
        const cap = output.size[1] * 0.02;\r
        const plan = DEPTHS.map((depth, level) => {\r
          const sigma = Math.min(coc * Math.abs(1 - SHARD_FOCUS / depth), cap);\r
          const groupIndex = sigma >= 2.2 ? 1 : 0;\r
          const group = groups[groupIndex];\r
          const soft = sigma >= 0.45;\r
          if (soft && !group.softReady) {\r
            group.softReady = true;\r
            group.temp.resize(groupSize(group.scale));\r
            group.blurred.resize(groupSize(group.scale));\r
          }\r
          const size = group.layer.size;\r
          layerParams[level].set({\r
            view: [size[0], size[1], cam.focal * (size[0] / output.size[0]), level],\r
            look: [s.lightMode ? 0.5 : 0.7, 0, 0, 0]\r
          });\r
          const local = sigma * group.scale;\r
          spreadX[level].set({ texel: [1 / size[0], 0, local, 0] });\r
          spreadY[level].set({ texel: [0, 1 / size[1], local, 0] });\r
          mixParams[level].set({ info: [FADE[level], 0, 0, 0] });\r
          const step = Math.max(0.6, 1.4 * (size[0] / Math.max(container.clientWidth, 1)));\r
          const shadowStrength = s.material === MATERIALS.glass ? 0 : s.lightMode ? 0.32 : 0.62;\r
          shadeParams[level].set({ info: [step * 0.55, step * 0.85, shadowStrength, 0], more: [0.00045, 0, 0, 0] });\r
          return { group, groupIndex, soft };\r
        });\r
\r
        frame(instance, current => {\r
          for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
            const { group, groupIndex, soft } = plan[level];\r
            const steps = layerPasses[level][groupIndex];\r
            if (counts[level] > 0) {\r
              current.pass({ target: group.layer, clear: [0, 0, 0, 0], clearDepth: 1 }, pass => {\r
                pass.draw(shardSolid[level], { instances: counts[level], firstInstance: starts[level] });\r
                pass.draw(shardEdge[level], { instances: counts[level], firstInstance: starts[level] });\r
              });\r
              current.pass({ target: group.shaded, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.shadow));\r
              if (soft) {\r
                current.pass({ target: group.temp, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.blurX));\r
                current.pass({ target: group.blurred, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.blurY));\r
              }\r
            }\r
            current.pass({ target: scene, clear: level === LEVELS - 1 ? [0, 0, 0, 0] : false }, pass => {\r
              if (markerCounts[level] > 0) {\r
                pass.draw(markerDraw, { instances: markerCounts[level], firstInstance: markerStarts[level] });\r
              }\r
              if (counts[level] > 0) pass.draw(soft ? steps.soft : steps.sharp);\r
            });\r
          }\r
          passes.forEach((pass, index) => {\r
            const level = levels[index];\r
            if (!blooming) {\r
              current.pass({ target: level.main, clear: [0, 0, 0, 0] }, () => {});\r
              return;\r
            }\r
            current.pass({ target: level.main, clear: [0, 0, 0, 0] }, p => p.draw(pass.down));\r
            current.pass({ target: level.spare, clear: [0, 0, 0, 0] }, p => p.draw(pass.horizontal));\r
            current.pass({ target: level.main, clear: [0, 0, 0, 0] }, p => p.draw(pass.vertical));\r
          });\r
          current.pass({ target: output, clear: [0, 0, 0, 0] }, pass => pass.draw(finish));\r
        });\r
      };\r
\r
      const tick = now => {\r
        raf = requestAnimationFrame(tick);\r
        if (!state.visible || document.hidden) {\r
          state.last = now;\r
          return;\r
        }\r
        const s = settingsRef.current;\r
        const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 0;\r
        state.last = now;\r
        const reduced = prefersReduced();\r
        state.clock += dt;\r
        if (state.introAt < 0) state.introAt = state.clock;\r
        if (state.shards.length !== s.count) {\r
          state.shards = createShards(s.count, 1337);\r
          state.order = [];\r
        }\r
        const moving = !s.paused && !reduced;\r
        if (moving) {\r
          for (let level = 0; level < LEVELS; level += 1) {\r
            state.travel[level] = (state.travel[level] + (dt * s.speed * 0.09) / paths[level].length) % 1;\r
          }\r
          state.roll += dt * s.speed * 1.0;\r
          state.twist += dt * s.speed * 0.08;\r
          state.drift += dt * s.speed;\r
        }\r
\r
        const goal = PLACEMENTS.map((_, index) => (index === s.placement ? 1 : 0));\r
        let settling = false;\r
        const decay = Math.exp(-4 * dt);\r
        for (let index = 0; index < 4; index += 1) {\r
          const offset = state.weights[index] - goal[index];\r
          const momentum = state.weightVelocity[index] + 4 * offset;\r
          state.weights[index] = goal[index] + (offset + momentum * dt) * decay;\r
          state.weightVelocity[index] = (state.weightVelocity[index] - 4 * momentum * dt) * decay;\r
          if (Math.abs(state.weights[index] - goal[index]) > 0.0005) settling = true;\r
        }\r
        if (!settling) {\r
          state.weights = goal;\r
          state.weightVelocity = [0, 0, 0, 0];\r
        }\r
\r
        const engaged = s.mouseInteraction && state.inside && !reduced;\r
        state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.25));\r
        const lean = engaged ? s.parallax : 0;\r
        const targetYaw = (state.pointer[0] - 0.5) * lean * 0.14;\r
        const targetPitch = (state.pointer[1] - 0.5) * lean * 0.08;\r
        state.yawVelocity += (38 * (targetYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
        state.pitchVelocity += (38 * (targetPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
        state.yaw += state.yawVelocity * dt;\r
        state.pitch += state.pitchVelocity * dt;\r
        const leaning =\r
          Math.abs(targetYaw - state.yaw) + Math.abs(targetPitch - state.pitch) > 1e-4 ||\r
          Math.abs(state.yawVelocity) + Math.abs(state.pitchVelocity) > 1e-4;\r
\r
        if (\r
          state.pressAt >= 0 &&\r
          state.pressPoint &&\r
          s.holdToGather &&\r
          !reduced &&\r
          state.clock - state.pressAt > 0.18\r
        ) {\r
          if (!state.holding) {\r
            state.holding = true;\r
            updateCamera(s);\r
            rayAt(state.pressPoint[0], state.pressPoint[1]);\r
            const travelTo =\r
              FOCUS / Math.max(ray[0] * cam.forward[0] + ray[1] * cam.forward[1] + ray[2] * cam.forward[2], 0.2);\r
            state.gatherCenter = [\r
              cam.eye[0] + ray[0] * travelTo,\r
              cam.eye[1] + ray[1] * travelTo,\r
              cam.eye[2] + ray[2] * travelTo\r
            ];\r
            state.reach = 0;\r
          }\r
          state.hold = Math.min(1, state.hold + dt / 0.5);\r
          state.reach = Math.min(state.reach + dt * 0.5, 0.55);\r
          const reach = (0.22 + state.reach) / s.scale;\r
          for (const shard of state.shards) {\r
            if (shard.joined || shard.level > 2) continue;\r
            const gx = shard.position[0] - state.gatherCenter[0];\r
            const gy = shard.position[1] - state.gatherCenter[1];\r
            if (gx * gx + gy * gy < reach * reach) shard.joined = true;\r
          }\r
        } else if (state.hold > 0) {\r
          state.hold = Math.max(0, state.hold - dt / 0.3);\r
          if (state.hold === 0) {\r
            for (const shard of state.shards) shard.joined = false;\r
          }\r
        }\r
\r
        for (const ring of state.rings) ring.age += dt;\r
        state.rings = state.rings.filter(ring => ring.age < RING_SECONDS);\r
        if (moving) state.markerDrift += dt * s.speed * 0.045;\r
\r
        const flashing = state.shards.some(\r
          shard => shard.flash > 0.01 || Math.abs(shard.tiltVelocity) > 0.01 || Math.abs(shard.tilt) > 0.01\r
        );\r
        const transient =\r
          settling ||\r
          leaning ||\r
          flashing ||\r
          state.presence > 0.002 ||\r
          state.rings.length > 0 ||\r
          state.hold > 0 ||\r
          (s.intro && !reduced && state.clock - state.introAt < INTRO_SECONDS + 0.5);\r
        if (state.seen !== s || transient || moving) state.quiet = 0;\r
        else state.quiet += 1;\r
        state.seen = s;\r
        if (state.quiet > 30) return;\r
        resize();\r
        render(s, dt, reduced);\r
      };\r
\r
      const local = event => {\r
        const rect = container.getBoundingClientRect();\r
        return {\r
          point: [\r
            (event.clientX - rect.left) / Math.max(rect.width, 1),\r
            (event.clientY - rect.top) / Math.max(rect.height, 1)\r
          ],\r
          inside:\r
            event.clientX >= rect.left &&\r
            event.clientX <= rect.right &&\r
            event.clientY >= rect.top &&\r
            event.clientY <= rect.bottom\r
        };\r
      };\r
\r
      const onMove = event => {\r
        const hit = local(event);\r
        state.inside = hit.inside;\r
        if (hit.inside) state.pointer = hit.point;\r
      };\r
\r
      const onLeave = () => {\r
        state.inside = false;\r
      };\r
\r
      const onDown = event => {\r
        const s = settingsRef.current;\r
        if (event.button !== 0 || prefersReduced() || !s.mouseInteraction) return;\r
        if (\r
          event.target instanceof Element &&\r
          event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
        )\r
          return;\r
        const hit = local(event);\r
        if (!hit.inside) return;\r
        state.pointer = hit.point;\r
        state.pressAt = state.clock;\r
        state.pressPoint = hit.point;\r
      };\r
\r
      const onUp = () => {\r
        const s = settingsRef.current;\r
        if (state.pressAt < 0) return;\r
        if (!state.holding && s.pulseOnClick && state.pressPoint) {\r
          const aspect = output.size[0] / Math.max(output.size[1], 1);\r
          state.rings.push({\r
            x: (state.pressPoint[0] * 2 - 1) * aspect,\r
            y: 1 - state.pressPoint[1] * 2,\r
            age: 0\r
          });\r
          if (state.rings.length > MAX_RINGS) state.rings.shift();\r
        }\r
        if (state.holding) {\r
          for (const shard of state.shards) {\r
            if (shard.joined) shard.tiltVelocity += 9 * shard.sign;\r
          }\r
        }\r
        state.pressAt = -1;\r
        state.holding = false;\r
      };\r
\r
      window.addEventListener('pointermove', onMove, { passive: true });\r
      window.addEventListener('pointerdown', onDown);\r
      window.addEventListener('pointerup', onUp);\r
      window.addEventListener('pointercancel', onUp);\r
      document.documentElement.addEventListener('pointerleave', onLeave);\r
      cleanups.push(() => {\r
        window.removeEventListener('pointermove', onMove);\r
        window.removeEventListener('pointerdown', onDown);\r
        window.removeEventListener('pointerup', onUp);\r
        window.removeEventListener('pointercancel', onUp);\r
        document.documentElement.removeEventListener('pointerleave', onLeave);\r
      });\r
\r
      const visibility = new IntersectionObserver(entries => {\r
        state.visible = entries.some(entry => entry.isIntersecting);\r
      });\r
      visibility.observe(container);\r
      cleanups.push(() => visibility.disconnect());\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    start().catch(fail);\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      cleanups.forEach(cleanup => cleanup());\r
      gpu?.dispose();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,n=`.aero-shards {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.aero-shards-canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import { draw, effect, frame, init, sampler, storage, surface, target, uniforms } from 'vgpu';\r
\r
const ROOT = 'relative h-full w-full overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const PLACEMENTS = ['full', 'left', 'right', 'center'];\r
const MATERIALS = {\r
  glass: [0, 0, 0, 0],\r
  chrome: [1, 0, 0, 0]\r
};\r
const FLOATS = 24;\r
const SAMPLES = 160;\r
const CAMERA = 4;\r
const FOCUS = 3.1;\r
const SHARD_FOCUS = 2.75;\r
const LAYER_SCALES = [1, 0.5];\r
const MAX_BANK = 1.0;\r
const DEPTHS = [2.7, 3.9, 5.6, 8.1, 11.6];\r
const SHARE = [0.26, 0.23, 0.2, 0.17, 0.14];\r
const GROWTH = [1, 1.3, 1.8, 2.6, 3.6];\r
const FADE = [1, 0.8, 0.52, 0.32, 0.2];\r
const LEVELS = DEPTHS.length;\r
const INTRO_SECONDS = 3.4;\r
const MARKER_STYLES = { plus: 0, dots: 1 };\r
const MARKER_FLOATS = 8;\r
const MARKER_PHASES = [\r
  [0.37, 0.61],\r
  [0.83, 0.12],\r
  [0.21, 0.88],\r
  [0.66, 0.44],\r
  [0.05, 0.27]\r
];\r
const MAX_RINGS = 4;\r
const RING_SECONDS = 2.6;\r
const BLOOM_LEVELS = 4;\r
const FULL_SLOPES = [\r
  [0.2, -0.78],\r
  [-0.72, 0.02],\r
  [0.58, -0.06],\r
  [-0.24, 0.62],\r
  [0.8, 0.3]\r
];\r
const SIDE_OFFSETS = [0.84, 0.62, 0.44, 0.28, 0.14];\r
const RING_SIZES = [\r
  [0.98, 0.78],\r
  [0.9, 0.7],\r
  [0.84, 0.64],\r
  [0.8, 0.6],\r
  [0.76, 0.56]\r
];\r
const TAU = Math.PI * 2;\r
\r
const SHARD_SHADER = \`\r
struct Frame {\r
  view: vec4f,\r
  eye: vec4f,\r
  forward: vec4f,\r
  right: vec4f,\r
  up: vec4f,\r
  shard: vec4f,\r
  accent: vec4f,\r
  marker: vec4f,\r
  surface: vec4f,\r
}\r
\r
struct Layer {\r
  view: vec4f,\r
  look: vec4f,\r
}\r
\r
struct VertexOut {\r
  @builtin(position) position: vec4f,\r
  @location(0) @interpolate(flat, first) center: vec4f,\r
  @location(1) @interpolate(flat, first) axis: vec4f,\r
  @location(2) @interpolate(flat, first) normal: vec4f,\r
  @location(3) @interpolate(flat, first) p01: vec4f,\r
  @location(4) @interpolate(flat, first) p23: vec4f,\r
  @location(5) @interpolate(flat, first) p4: vec4f,\r
  @location(6) @interpolate(flat, first) topA: vec4f,\r
  @location(7) @interpolate(flat, first) topB: vec4f,\r
  @location(8) @interpolate(flat, first) topC: vec4f,\r
  @location(9) @interpolate(flat, first) bottomA: vec4f,\r
  @location(10) @interpolate(flat, first) bottomB: vec4f,\r
  @location(11) @interpolate(flat, first) bottomC: vec4f,\r
}\r
\r
struct FragmentOut {\r
  @location(0) color: vec4f,\r
  @builtin(frag_depth) depth: f32,\r
}\r
\r
@group(0) @binding(0) var<uniform> scene: Frame;\r
@group(0) @binding(1) var<storage, read> shards: array<vec4f>;\r
@group(0) @binding(2) var<uniform> layerInfo: Layer;\r
\r
fn project(world: vec3f) -> vec3f {\r
  let offset = world - scene.eye.xyz;\r
  let depth = max(dot(offset, scene.forward.xyz), 0.05);\r
  let x = dot(offset, scene.right.xyz);\r
  let y = dot(offset, scene.up.xyz);\r
  return vec3f(layerInfo.view.x * 0.5 + x * layerInfo.view.z / depth, layerInfo.view.y * 0.5 - y * layerInfo.view.z / depth, depth);\r
}\r
\r
@vertex\r
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> VertexOut {\r
  let index = instance * 6u;\r
  let a = shards[index];\r
  let b = shards[index + 1u];\r
  let c = shards[index + 2u];\r
  let d = shards[index + 3u];\r
  let e = shards[index + 4u];\r
  let f = shards[index + 5u];\r
  let center = a.xyz;\r
  let size = a.w;\r
  let axis = normalize(b.xyz);\r
  let normal = normalize(c.xyz);\r
  let side = normalize(cross(normal, axis));\r
\r
  var out: VertexOut;\r
  let middle = project(center);\r
  if (middle.z < 0.35 || size <= 0.0) {\r
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);\r
    return out;\r
  }\r
\r
  let count = i32(f.z);\r
  let points = array<vec2f, 5>(d.xy, d.zw, e.xy, e.zw, f.xy);\r
  var low = vec2f(1e9);\r
  var high = vec2f(-1e9);\r
  var tops = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));\r
  var bottoms = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));\r
  for (var i = 0; i < 5; i += 1) {\r
    let corner = points[min(i, count - 1)];\r
    let onPlate = center + (axis * corner.x + side * corner.y) * size;\r
    let top = project(onPlate + normal * b.w * size);\r
    let bottom = project(onPlate - normal * b.w * size);\r
    tops[i] = top.xy;\r
    bottoms[i] = bottom.xy;\r
    low = min(low, min(top.xy, bottom.xy));\r
    high = max(high, max(top.xy, bottom.xy));\r
  }\r
  low -= vec2f(2.0);\r
  high += vec2f(2.0);\r
  let corners = array<vec2f, 6>(vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0), vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0));\r
  let pixel = mix(low, high, corners[vertexIndex]);\r
  out.position = vec4f(pixel.x / layerInfo.view.x * 2.0 - 1.0, 1.0 - pixel.y / layerInfo.view.y * 2.0, 0.5, 1.0);\r
  out.center = a;\r
  out.axis = vec4f(axis, b.w);\r
  out.normal = vec4f(normal, c.w);\r
  out.p01 = d;\r
  out.p23 = e;\r
  out.p4 = f;\r
  out.topA = vec4f(tops[0], tops[1]);\r
  out.topB = vec4f(tops[2], tops[3]);\r
  out.topC = vec4f(tops[4], 0.0, 0.0);\r
  out.bottomA = vec4f(bottoms[0], bottoms[1]);\r
  out.bottomB = vec4f(bottoms[2], bottoms[3]);\r
  out.bottomC = vec4f(bottoms[4], 0.0, 0.0);\r
  return out;\r
}\r
\r
fn cross2(a: vec2f, b: vec2f) -> f32 {\r
  return a.x * b.y - a.y * b.x;\r
}\r
\r
fn outlineCoverage(p: vec2f, points: array<vec2f, 5>, count: i32) -> f32 {\r
  var area = 0.0;\r
  for (var i = 0; i < 5; i += 1) {\r
    if (i < count) {\r
      area += cross2(points[i], points[(i + 1) % count]);\r
    }\r
  }\r
  let orient = select(-1.0, 1.0, area > 0.0);\r
  var distance = -1e9;\r
  for (var i = 0; i < 5; i += 1) {\r
    if (i < count) {\r
      let a = points[i];\r
      let edge = points[(i + 1) % count] - a;\r
      let span = length(edge);\r
      if (span > 1e-4) {\r
        let n = vec2f(edge.y, -edge.x) * (orient / span);\r
        distance = max(distance, dot(p - a, n));\r
      }\r
    }\r
  }\r
  return clamp(0.5 - distance, 0.0, 1.0);\r
}\r
\r
struct Prism {\r
  points: array<vec2f, 5>,\r
  count: i32,\r
  half: f32,\r
}\r
\r
struct Hit {\r
  near: f32,\r
  far: f32,\r
  normal: vec3f,\r
}\r
\r
fn plane(prism: Prism, k: i32) -> vec4f {\r
  if (k == 0) { return vec4f(0.0, 0.0, 1.0, prism.half); }\r
  if (k == 1) { return vec4f(0.0, 0.0, -1.0, prism.half); }\r
  let a = prism.points[k - 2];\r
  let b = prism.points[(k - 1) % prism.count];\r
  let edge = b - a;\r
  let n = normalize(vec2f(edge.y, -edge.x));\r
  return vec4f(n, 0.0, dot(n, a));\r
}\r
\r
fn trace(prism: Prism, ro: vec3f, rd: vec3f) -> Hit {\r
  var hit: Hit;\r
  hit.near = -1e9;\r
  hit.far = 1e9;\r
  hit.normal = vec3f(0.0, 0.0, 1.0);\r
  for (var k = 0; k < 7; k += 1) {\r
    if (k < prism.count + 2) {\r
      let p = plane(prism, k);\r
      let denom = dot(p.xyz, rd);\r
      let gap = p.w - dot(p.xyz, ro);\r
      if (abs(denom) < 1e-7) {\r
        if (gap < 0.0) { hit.far = -1e9; }\r
      } else {\r
        let t = gap / denom;\r
        if (denom < 0.0) {\r
          if (t > hit.near) {\r
            hit.near = t;\r
            hit.normal = p.xyz;\r
          }\r
        } else if (t < hit.far) {\r
          hit.far = t;\r
        }\r
      }\r
    }\r
  }\r
  return hit;\r
}\r
\r
fn exitFrom(prism: Prism, ro: vec3f, rd: vec3f) -> vec4f {\r
  var best = 1e9;\r
  var normal = vec3f(0.0, 0.0, -1.0);\r
  for (var k = 0; k < 7; k += 1) {\r
    if (k < prism.count + 2) {\r
      let p = plane(prism, k);\r
      let denom = dot(p.xyz, rd);\r
      if (denom > 1e-6) {\r
        let t = (p.w - dot(p.xyz, ro)) / denom;\r
        if (t < best) {\r
          best = t;\r
          normal = p.xyz;\r
        }\r
      }\r
    }\r
  }\r
  return vec4f(normal, max(best, 0.0));\r
}\r
\r
fn rectLight(r: vec3f, dir: vec3f, across: vec3f, extent: vec2f, soft: f32) -> f32 {\r
  let facing = dot(r, dir);\r
  if (facing <= 0.0) { return 0.0; }\r
  let up = cross(dir, across);\r
  let u = dot(r, across) / facing;\r
  let v = dot(r, up) / facing;\r
  let a = 1.0 - smoothstep(extent.x - soft, extent.x + soft, abs(u));\r
  let b = 1.0 - smoothstep(extent.y - soft, extent.y + soft, abs(v));\r
  return a * b;\r
}\r
\r
const KEY_DIR = vec3f(-0.28, 0.72, 0.64) / length(vec3f(-0.28, 0.72, 0.64));\r
const KEY_ACROSS = vec3f(0.92, 0.0, 0.4) / length(vec3f(0.92, 0.0, 0.4));\r
const LEFT_DIR = vec3f(-0.86, 0.12, 0.5) / length(vec3f(-0.86, 0.12, 0.5));\r
const LEFT_ACROSS = vec3f(0.5, 0.0, 0.86) / length(vec3f(0.5, 0.0, 0.86));\r
const RIM_DIR = vec3f(0.78, 0.22, -0.58) / length(vec3f(0.78, 0.22, -0.58));\r
const RIM_ACROSS = vec3f(0.6, 0.0, 0.8) / length(vec3f(0.6, 0.0, 0.8));\r
const TOP_DIR = vec3f(0.05, 0.94, -0.33) / length(vec3f(0.05, 0.94, -0.33));\r
const TOP_ACROSS = vec3f(1.0, 0.0, 0.0);\r
\r
fn lobe(r: vec3f, dir: vec3f, width: f32) -> f32 {\r
  return exp((dot(r, dir) - 1.0) / (width * width));\r
}\r
\r
fn studio(r: vec3f, soft: f32, accent: vec3f, ink: vec3f) -> vec3f {\r
  let sky = clamp(r.y * 0.5 + 0.5, 0.0, 1.0);\r
  var col = mix(ink * 0.03, ink * 0.12 + accent * 0.03, smoothstep(0.25, 0.95, sky));\r
  col += mix(ink, vec3f(1.0), 0.6) * lobe(r, KEY_DIR, 0.38) * 3.6;\r
  col += mix(accent, vec3f(1.0), 0.2) * lobe(r, RIM_DIR, 0.34) * 3.4;\r
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.12, 0.8), 0.08 + soft) * 3.2;\r
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, TOP_DIR, TOP_ACROSS, vec2f(0.9, 0.1), 0.08 + soft) * 2.6;\r
  return col;\r
}\r
\r
fn studioLight(r: vec3f, soft: f32, accent: vec3f) -> vec3f {\r
  let ground = vec3f(0.2, 0.2, 0.23);\r
  let skyTone = vec3f(0.97, 0.97, 0.99);\r
  var col = mix(ground, skyTone, smoothstep(-0.08 - soft, 0.16 + soft, r.y));\r
  col = mix(col, vec3f(0.55, 0.55, 0.6), lobe(r, vec3f(0.0, -1.0, 0.0), 0.5) * 0.4);\r
  col += vec3f(0.4) * rectLight(r, KEY_DIR, KEY_ACROSS, vec2f(0.46, 0.3), 0.07 + soft);\r
  col -= vec3f(0.55) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.1, 0.85), 0.05 + soft);\r
  col -= vec3f(0.45) * rectLight(r, RIM_DIR, RIM_ACROSS, vec2f(0.12, 0.9), 0.05 + soft);\r
  return clamp(col, vec3f(0.05), vec3f(1.2));\r
}\r
\r
fn schlick(cosine: f32, f0: f32) -> f32 {\r
  return f0 + (1.0 - f0) * pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);\r
}\r
\r
fn rayFor(pixel: vec2f) -> vec3f {\r
  let x = pixel.x - layerInfo.view.x * 0.5;\r
  let y = layerInfo.view.y * 0.5 - pixel.y;\r
  return normalize(scene.forward.xyz * layerInfo.view.z + scene.right.xyz * x + scene.up.xyz * y);\r
}\r
\r
struct Surface {\r
  coverage: f32,\r
  color: vec3f,\r
  alpha: f32,\r
  depth: f32,\r
}\r
\r
fn shade(pixel: vec2f, in: VertexOut) -> Surface {\r
  let center = in.center.xyz;\r
  let size = in.center.w;\r
  let axis = in.axis.xyz;\r
  let plateNormal = in.normal.xyz;\r
  let side = normalize(cross(plateNormal, axis));\r
  var prism: Prism;\r
  prism.points = array<vec2f, 5>(in.p01.xy, in.p01.zw, in.p23.xy, in.p23.zw, in.p4.xy);\r
  prism.count = i32(in.p4.z);\r
  prism.half = in.axis.w;\r
\r
  let eye = scene.eye.xyz;\r
  let toLocal = mat3x3f(axis.x, side.x, plateNormal.x, axis.y, side.y, plateNormal.y, axis.z, side.z, plateNormal.z);\r
  let fromLocal = mat3x3f(axis, side, plateNormal);\r
  let origin = toLocal * (eye - center) / size;\r
\r
  let rd = rayFor(pixel);\r
  let ray = toLocal * rd;\r
  let denom = dot(ray, vec3f(0.0, 0.0, 1.0));\r
  let flatT = -origin.z / select(denom, 1e-4, abs(denom) < 1e-4);\r
  let flatPoint = origin.xy + ray.xy * flatT;\r
  let footprint = max(length(fwidth(flatPoint)) * 0.7, 1e-4);\r
  let softBase = clamp(length(fwidth(reflect(rd, plateNormal))) * 0.5, 0.0, 0.5);\r
\r
  let primary = trace(prism, origin, ray);\r
  let tops = array<vec2f, 5>(in.topA.xy, in.topA.zw, in.topB.xy, in.topB.zw, in.topC.xy);\r
  let bottoms = array<vec2f, 5>(in.bottomA.xy, in.bottomA.zw, in.bottomB.xy, in.bottomB.zw, in.bottomC.xy);\r
  let coverage = max(outlineCoverage(pixel, tops, prism.count), outlineCoverage(pixel, bottoms, prism.count));\r
\r
  var surface: Surface;\r
  let facing = select(-1.0, 1.0, origin.z > 0.0);\r
  let capT = (facing * prism.half - origin.z) / select(ray.z, -1e-4 * facing, abs(ray.z) < 1e-4);\r
  let missed = primary.near > primary.far;\r
  let hitT = select(primary.near, capT, missed);\r
  let hitNormal = select(primary.normal, vec3f(0.0, 0.0, facing), missed);\r
  surface.coverage = select(0.0, coverage, hitT > 0.0);\r
  surface.color = vec3f(0.0);\r
  surface.alpha = 0.0;\r
  surface.depth = 1.0;\r
  if (surface.coverage <= 0.0) { return surface; }\r
  let mainRay = ray;\r
\r
  let local = origin + mainRay * hitT;\r
  let worldRay = fromLocal * mainRay;\r
  let viewDepth = max(hitT * size * dot(worldRay, scene.forward.xyz), 0.05);\r
  surface.depth = clamp(1.0 - 0.3 / viewDepth, 0.0, 1.0);\r
\r
  let radius = max(prism.half * 1.15, footprint * 2.5);\r
  var n = hitNormal;\r
  var bevel = 0.0;\r
  if (abs(n.z) > 0.5) {\r
    var gap = 1e9;\r
    for (var k = 2; k < 7; k += 1) {\r
      if (k < prism.count + 2) {\r
        let p = plane(prism, k);\r
        gap = min(gap, p.w - dot(p.xy, local.xy));\r
      }\r
    }\r
    var toward = vec2f(0.0);\r
    for (var k = 2; k < 7; k += 1) {\r
      if (k < prism.count + 2) {\r
        let p = plane(prism, k);\r
        let g = p.w - dot(p.xy, local.xy);\r
        toward += p.xy * exp(-(g - gap) / (radius * 0.35));\r
      }\r
    }\r
    toward = normalize(toward);\r
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);\r
    let angle = bevel * bevel * 0.7853982;\r
    n = normalize(n * cos(angle) + vec3f(toward, 0.0) * sin(angle));\r
  } else {\r
    let gap = prism.half - abs(local.z);\r
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);\r
    let angle = bevel * bevel * 0.7853982;\r
    n = normalize(n * cos(angle) + vec3f(0.0, 0.0, sign(local.z)) * sin(angle));\r
  }\r
  let bendRate = 1.8 / max(radius / footprint, 1.0);\r
  let normal = normalize(fromLocal * n);\r
  let view = -worldRay;\r
  let reflected = reflect(worldRay, normal);\r
  let soft = softBase + bendRate * smoothstep(0.0, 0.25, bevel) * 1.2 + clamp(footprint * 0.6, 0.0, 0.5);\r
  let ndv = clamp(dot(normal, view), 0.0, 1.0);\r
\r
  let accent = scene.accent.rgb;\r
  let base = scene.shard.rgb;\r
  let world = center + fromLocal * local * size;\r
  let height = clamp(0.5 + world.y * 0.45, 0.0, 1.0);\r
  let tone = mix(accent, base, height);\r
  let body = mix(tone, mix(base, accent, 0.5), in.normal.w * 0.3);\r
  let mode = scene.surface.x;\r
  let lightMode = scene.up.w > 0.5;\r
  let wrap = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);\r
\r
  var color = vec3f(0.0);\r
  var alpha = 1.0;\r
  let chrome = mode > 0.5;\r
  if (lightMode) {\r
    let env = studioLight(reflected, soft, accent);\r
    if (chrome) {\r
      color = env * mix(body, vec3f(1.0), 0.6);\r
    } else {\r
      let fresnel = schlick(ndv, 0.05);\r
      let diffuse = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);\r
      alpha = clamp(0.32 + fresnel * 0.5 + (1.0 - abs(n.z)) * 0.5, 0.0, 1.0);\r
      color = mix(body, vec3f(1.0), 0.15) * (0.5 + 0.4 * diffuse) * alpha + (env - vec3f(0.78)) * fresnel * 0.8;\r
    }\r
  } else if (chrome) {\r
    let env = studio(reflected, soft, accent, body);\r
    color = env * mix(body, vec3f(1.0), 0.55) * 0.9 + body * 0.02;\r
  } else {\r
    let fresnel = schlick(ndv, 0.04);\r
    let env = studio(reflected, soft, accent, body);\r
    var light = vec3f(0.0);\r
    var cursor = local;\r
    var direction = toLocal * refract(worldRay, normal, 1.0 / 1.5);\r
    var travelled = 0.0;\r
    var carry = 1.0 - fresnel;\r
    var through = 0.0;\r
    for (var bounce = 0; bounce < 3; bounce += 1) {\r
      let outlet = exitFrom(prism, cursor, direction);\r
      travelled += outlet.w;\r
      cursor = cursor + direction * outlet.w;\r
      let outward = outlet.xyz;\r
      let escaped = refract(direction, -outward, 1.5);\r
      if (dot(escaped, escaped) > 0.0) {\r
        let leave = schlick(dot(direction, outward), 0.04);\r
        let worldOut = normalize(fromLocal * escaped);\r
        let absorb = exp(-(vec3f(1.0) - body) * travelled * size * 22.0);\r
        let straight = smoothstep(0.97, 0.999, dot(worldOut, worldRay));\r
        let energy = carry * (1.0 - leave);\r
        light += studio(worldOut, soft * 2.0 + 0.04, accent, body) * absorb * energy * (1.0 - straight) * 2.0;\r
        through += energy * straight * (absorb.r + absorb.g + absorb.b) / 3.0;\r
        carry *= leave;\r
      }\r
      direction = reflect(direction, outward);\r
    }\r
    let edge = max(pow(1.0 - abs(n.z), 1.2), bevel * bevel * 0.85);\r
    let glow = mix(mix(body, accent, 0.35), vec3f(1.0), 0.28) * edge * (0.35 + 0.45 * wrap);\r
    color = env * fresnel * 0.85 + light * (1.0 - smoothstep(0.0, 0.6, bevel)) + body * 0.02 + glow;\r
    alpha = clamp(1.0 - through + edge * 0.25, 0.0, 1.0);\r
  }\r
\r
  color *= select(1.3, 1.0, lightMode);\r
  let haze = smoothstep(3.5, 12.0, viewDepth) * layerInfo.look.x;\r
  let hazeColor = select(mix(base, accent, 0.5) * 0.3, mix(base, vec3f(1.0), 0.72), lightMode);\r
  color = mix(color, hazeColor * alpha + color * 0.3, haze);\r
  let flash = in.p4.w;\r
  color += mix(accent, vec3f(1.0), 0.35) * flash * select(0.5, 0.0, lightMode) * max(alpha, 0.35);\r
  alpha = max(alpha, flash * 0.45 * select(1.0, 0.0, lightMode));\r
  surface.color = color;\r
  surface.alpha = alpha;\r
  return surface;\r
}\r
\r
@fragment\r
fn fs_solid(in: VertexOut) -> FragmentOut {\r
  let surface = shade(in.position.xy, in);\r
  if (surface.coverage < 0.999 || surface.alpha < 0.6) { discard; }\r
  var out: FragmentOut;\r
  out.color = vec4f(surface.color, surface.alpha);\r
  out.depth = surface.depth;\r
  return out;\r
}\r
\r
@fragment\r
fn fs_edge(in: VertexOut) -> FragmentOut {\r
  let surface = shade(in.position.xy, in);\r
  if (surface.coverage <= 0.001 || (surface.coverage >= 0.9996 && surface.alpha >= 0.62)) { discard; }\r
  var out: FragmentOut;\r
  out.color = vec4f(surface.color, surface.alpha) * surface.coverage;\r
  out.depth = surface.depth;\r
  return out;\r
}\r
\`;\r
\r
const LAYER_BLUR_SHADER = \`\r
struct Spread { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> spreadInfo: Spread;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let sigma = max(spreadInfo.texel.z, 0.3);\r
  let reach = min(i32(ceil(sigma * 2.6)), 20);\r
  var total = textureSampleLevel(source, linearSampler, uv, 0.0);\r
  var weight = 1.0;\r
  for (var i = 1; i <= reach; i += 1) {\r
    let w = exp(-f32(i * i) / (2.0 * sigma * sigma));\r
    let o = spreadInfo.texel.xy * f32(i);\r
    total += (textureSampleLevel(source, linearSampler, uv + o, 0.0) + textureSampleLevel(source, linearSampler, uv - o, 0.0)) * w;\r
    weight += 2.0 * w;\r
  }\r
  return total / weight;\r
}\r
\`;\r
\r
const SHADOW_SHADER = \`\r
struct Shade {\r
  info: vec4f,\r
  more: vec4f,\r
}\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var depthMap: texture_depth_2d;\r
@group(0) @binding(2) var<uniform> shadeInfo: Shade;\r
\r
@fragment\r
fn fs_main(@builtin(position) pixel: vec4f) -> @location(0) vec4f {\r
  let bounds = vec2i(textureDimensions(source)) - vec2i(1);\r
  let here = vec2i(pixel.xy);\r
  let color = textureLoad(source, here, 0);\r
  if (color.a <= 0.002 || shadeInfo.info.z <= 0.0) { return color; }\r
  let depth = textureLoad(depthMap, here, 0);\r
  let east = textureLoad(depthMap, clamp(here + vec2i(1, 0), vec2i(0), bounds), 0);\r
  let west = textureLoad(depthMap, clamp(here - vec2i(1, 0), vec2i(0), bounds), 0);\r
  let south = textureLoad(depthMap, clamp(here + vec2i(0, 1), vec2i(0), bounds), 0);\r
  let north = textureLoad(depthMap, clamp(here - vec2i(0, 1), vec2i(0), bounds), 0);\r
  let limit = shadeInfo.more.x * 0.5;\r
  let slopeX = clamp(select(east - depth, depth - west, abs(depth - west) < abs(east - depth)), -limit, limit);\r
  let slopeY = clamp(select(south - depth, depth - north, abs(depth - north) < abs(south - depth)), -limit, limit);\r
  var occlusion = 0.0;\r
  for (var i = 1; i <= 12; i += 1) {\r
    let offset = -shadeInfo.info.xy * f32(i);\r
    let probe = clamp(vec2i(pixel.xy + offset), vec2i(0), bounds);\r
    let other = textureLoad(depthMap, probe, 0);\r
    let expected = depth + slopeX * offset.x + slopeY * offset.y;\r
    let closer = smoothstep(shadeInfo.more.x * 0.6, shadeInfo.more.x * 2.4, expected - other);\r
    let reach = 1.0 - f32(i - 1) / 12.0;\r
    occlusion = max(occlusion, closer * reach * reach);\r
  }\r
  return vec4f(color.rgb * (1.0 - occlusion * shadeInfo.info.z), color.a);\r
}\r
\`;\r
\r
const COMPOSITE_SHADER = \`\r
struct Blend { info: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> mixInfo: Blend;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  return textureSampleLevel(source, linearSampler, uv, 0.0) * mixInfo.info.x;\r
}\r
\`;\r
\r
const MARKER_SHADER = \`\r
struct Frame {\r
  view: vec4f,\r
  eye: vec4f,\r
  forward: vec4f,\r
  right: vec4f,\r
  up: vec4f,\r
  shard: vec4f,\r
  accent: vec4f,\r
  marker: vec4f,\r
  surface: vec4f,\r
}\r
\r
struct MarkerOut {\r
  @builtin(position) position: vec4f,\r
  @location(0) local: vec2f,\r
  @location(1) @interpolate(flat, first) shape: vec4f,\r
  @location(2) @interpolate(flat, first) light: vec4f,\r
}\r
\r
@group(0) @binding(0) var<uniform> scene: Frame;\r
@group(0) @binding(1) var<storage, read> markers: array<vec4f>;\r
\r
@vertex\r
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> MarkerOut {\r
  let a = markers[instance * 2u];\r
  let b = markers[instance * 2u + 1u];\r
  let offset = a.xyz - scene.eye.xyz;\r
  let depth = max(dot(offset, scene.forward.xyz), 0.05);\r
  let center = vec2f(\r
    scene.view.x * 0.5 + dot(offset, scene.right.xyz) * scene.view.z / depth,\r
    scene.view.y * 0.5 - dot(offset, scene.up.xyz) * scene.view.z / depth,\r
  );\r
  let pixel = scene.marker.y;\r
  let size = scene.marker.z * clamp(sqrt(scene.marker.w / depth), 0.6, 1.3) * b.z;\r
  let blur = min(scene.forward.w * abs(1.0 - scene.eye.w / depth), scene.right.w) * 0.18;\r
  let frame = b.y;\r
  let reach = select(size, size * 2.6, frame > 0.001) + blur + 1.5 * pixel;\r
  let corners = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0));\r
  let corner = corners[vertexIndex % 6u] * reach;\r
  var out: MarkerOut;\r
  if (depth < 0.35 || a.w <= 0.002) {\r
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);\r
    return out;\r
  }\r
  let at = center + corner;\r
  out.position = vec4f(at.x / scene.view.x * 2.0 - 1.0, 1.0 - at.y / scene.view.y * 2.0, 0.5, 1.0);\r
  out.local = corner;\r
  out.shape = vec4f(size, blur, frame, pixel);\r
  out.light = vec4f(b.x, a.w, 0.0, 0.0);\r
  return out;\r
}\r
\r
fn bar(value: f32, edge: f32, soft: f32) -> f32 {\r
  return clamp((edge - value) / soft + 0.5, 0.0, 1.0);\r
}\r
\r
@fragment\r
fn fs_main(in: MarkerOut) -> @location(0) vec4f {\r
  let size = in.shape.x;\r
  let blur = in.shape.y;\r
  let frame = in.shape.z;\r
  let pixel = in.shape.w;\r
  let q = abs(in.local);\r
  let soft = 1.0 + blur;\r
  let thick = 0.6 * pixel + blur * 0.5;\r
  let energy = (0.6 * pixel) / thick;\r
  var cover = 0.0;\r
  if (scene.marker.x < 0.5) {\r
    let across = bar(q.x, size, soft) * bar(q.y, thick, soft);\r
    let down = bar(q.y, size, soft) * bar(q.x, thick, soft);\r
    cover = max(across, down) * energy;\r
  } else {\r
    cover = bar(length(in.local), size * 0.42 + blur * 0.3, soft) * mix(1.0, energy, 0.6);\r
  }\r
  if (frame > 0.001) {\r
    let edge = size * 2.3;\r
    let span = edge * 0.45;\r
    let line = 0.5 * pixel;\r
    let sides = bar(abs(q.x - edge), line, 1.0) * bar(edge - span - q.y, 0.0, 1.0) * bar(q.y - edge - line, 0.0, 1.0);\r
    let caps = bar(abs(q.y - edge), line, 1.0) * bar(edge - span - q.x, 0.0, 1.0) * bar(q.x - edge - line, 0.0, 1.0);\r
    cover = max(cover, max(sides, caps) * frame * 0.85);\r
  }\r
  let glow = in.light.x;\r
  let fade = in.light.y;\r
  let tint = mix(scene.shard.rgb, scene.accent.rgb, 0.4);\r
  if (scene.up.w > 0.5) {\r
    let ink = (1.0 - exp(-glow * 1.6)) * 0.85 * cover * fade;\r
    return vec4f(mix(tint, scene.accent.rgb, 0.5) * 0.55 * ink, ink);\r
  }\r
  let light = cover * glow * fade;\r
  let color = (1.0 - exp(-mix(tint, vec3f(1.0), 0.35) * light * 1.6)) * 1.4;\r
  return vec4f(color, max(max(color.r, color.g), color.b) * 0.8);\r
}\r
\`;\r
\r
const PREFILTER_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
fn bright(uv: vec2f) -> vec3f {\r
  let color = textureSampleLevel(source, linearSampler, uv, 0.0).rgb;\r
  let peak = max(max(color.r, color.g), color.b);\r
  return color * smoothstep(bloom.texel.z, bloom.texel.z + bloom.texel.w, peak);\r
}\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let o = bloom.texel.xy;\r
  let total = bright(uv + vec2f(o.x, o.y)) + bright(uv + vec2f(-o.x, o.y)) + bright(uv + vec2f(o.x, -o.y)) + bright(uv - o);\r
  return vec4f(total * 0.25, 0.0);\r
}\r
\`;\r
\r
const DOWNSAMPLE_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let o = bloom.texel.xy;\r
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.25;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(-o.x, o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, -o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv - o, 0.0) * 0.1875;\r
  return color;\r
}\r
\`;\r
\r
const BLUR_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let delta = bloom.texel.xy;\r
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.181862;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 1.423135, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 1.423135, 0.0)) * 0.284316;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 3.326702, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 3.326702, 0.0)) * 0.106598;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 5.242989, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 5.242989, 0.0)) * 0.018156;\r
  return color;\r
}\r
\`;\r
\r
const FINISH_SHADER = \`\r
struct Finish {\r
  info: vec4f,\r
  paper: vec4f,\r
  mode: vec4f,\r
}\r
@group(0) @binding(0) var sceneTexture: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var bloom0: texture_2d<f32>;\r
@group(0) @binding(3) var bloom1: texture_2d<f32>;\r
@group(0) @binding(4) var bloom2: texture_2d<f32>;\r
@group(0) @binding(5) var bloom3: texture_2d<f32>;\r
@group(0) @binding(6) var<uniform> finish: Finish;\r
\r
fn hash12(value: vec2f) -> f32 {\r
  let p = fract(value * vec2f(0.1031, 0.1030));\r
  let mixed = p + dot(p, p.yx + 33.33);\r
  return fract((mixed.x + mixed.y) * mixed.x);\r
}\r
\r
fn smootherstep(x: f32) -> f32 {\r
  let t = clamp(x, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f, @builtin(position) pixel: vec4f) -> @location(0) vec4f {\r
  let scene = textureLoad(sceneTexture, vec2i(pixel.xy), 0);\r
  let alpha = clamp(scene.a, 0.0, 1.0);\r
  let noise = hash12(floor(pixel.xy) + vec2f(finish.info.y, finish.info.y * 1.618)) - 0.5;\r
  let grain = 1.0 + noise * finish.info.x;\r
  var rgb = vec3f(0.0);\r
  var a = alpha;\r
  if (finish.mode.x > 0.5) {\r
    rgb = clamp(scene.rgb, vec3f(0.0), vec3f(alpha)) * grain;\r
  } else {\r
    var halo = textureSampleLevel(bloom0, linearSampler, uv, 0.0).rgb * 0.4;\r
    halo += textureSampleLevel(bloom1, linearSampler, uv, 0.0).rgb * 0.3;\r
    halo += textureSampleLevel(bloom2, linearSampler, uv, 0.0).rgb * 0.2;\r
    halo += textureSampleLevel(bloom3, linearSampler, uv, 0.0).rgb * 0.1;\r
    halo = halo * finish.info.z;\r
    rgb = (1.0 - exp(-max(scene.rgb, vec3f(0.0)) * finish.info.w)) * grain + halo / (1.0 + halo);\r
    a = max(alpha, max(max(rgb.r, rgb.g), rgb.b));\r
  }\r
  let vignette = finish.mode.y;\r
  if (vignette > 0.0) {\r
    let size = vec2f(textureDimensions(sceneTexture));\r
    let reach = max(vignette * 0.5 * min(size.x, size.y), 1.0);\r
    let fromEdge = min(pixel.xy, size - pixel.xy);\r
    let mask = smootherstep(fromEdge.x / reach) * smootherstep(fromEdge.y / reach);\r
    rgb *= mask;\r
    a *= mask;\r
  }\r
  rgb = clamp(rgb, vec3f(0.0), vec3f(max(a, 0.0)));\r
  if (finish.paper.a > 0.5) {\r
    return vec4f(finish.paper.rgb * (1.0 - a) + rgb, 1.0);\r
  }\r
  return vec4f(rgb, a);\r
}\r
\`;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
\r
const smoother = x => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
let probe = null;\r
\r
const parseColor = (value, fallback) => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
const latticeHash = (a, b, c, d) => {\r
  let h = Math.imul(a + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);\r
  h ^= Math.imul(c + 0x27d4eb2f, 0x165667b1) ^ Math.imul(d + 0x7f4a7c15, 0x9e3779b1);\r
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);\r
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;\r
};\r
\r
const random = seed => () => {\r
  seed = (seed + 0x6d2b79f5) | 0;\r
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);\r
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
};\r
\r
const ribbonPoint = (placement, level, s, aspect, out) => {\r
  let u;\r
  let v;\r
  let d;\r
  if (placement === 0) {\r
    u = -1.32 + 2.64 * s;\r
    const slope = FULL_SLOPES[level];\r
    v =\r
      slope[0] +\r
      (slope[1] - slope[0]) * s +\r
      0.1 * Math.sin(s * TAU * 0.7 + level * 2.3) +\r
      0.045 * Math.sin(s * TAU * 1.9 + level);\r
    d = DEPTHS[level] + 0.35 * Math.sin(s * Math.PI * 1.4 + level * 1.9);\r
  } else if (placement === 3) {\r
    const angle = s * TAU + level * 0.9 + Math.PI * 0.5;\r
    const size = RING_SIZES[level];\r
    u = Math.cos(angle) * size[0];\r
    v = Math.sin(angle) * size[1] - 0.02;\r
    d = DEPTHS[level] * 1.1 - Math.sin(angle) * (0.5 + level * 0.25);\r
  } else {\r
    const mirror = placement === 1 ? -1 : 1;\r
    v = 1.32 - 2.64 * s;\r
    u =\r
      mirror *\r
      (SIDE_OFFSETS[level] +\r
        0.1 * Math.sin(s * TAU * 0.6 + level * 1.3) +\r
        0.03 * Math.sin(s * TAU * 2.1 + level) -\r
        0.08 * (1 - s));\r
    d = DEPTHS[level] + 0.3 * Math.sin(s * Math.PI * 1.2 + level);\r
  }\r
  out[0] = (u * aspect * d) / CAMERA;\r
  out[1] = (v * d) / CAMERA;\r
  out[2] = CAMERA - d;\r
  return out;\r
};\r
\r
const createShards = (count, seed) => {\r
  const next = random(seed);\r
  const shards = [];\r
  let made = 0;\r
  for (let level = 0; level < LEVELS; level += 1) {\r
    const amount = level === LEVELS - 1 ? count - made : Math.round(count * SHARE[level]);\r
    made += amount;\r
    for (let index = 0; index < amount; index += 1) {\r
      const flat = next() * 2 - 1;\r
      const family = next();\r
      const outline = [];\r
      if (family < 0.55) {\r
        const spread = 0.17 + next() * 0.15;\r
        outline.push([1, (next() - 0.5) * 0.08]);\r
        outline.push([-0.5 - next() * 0.25, spread * (0.8 + next() * 0.4)]);\r
        outline.push([-0.5 - next() * 0.25, -spread * (0.8 + next() * 0.4)]);\r
      } else if (family < 0.8) {\r
        const spread = 0.2 + next() * 0.14;\r
        outline.push([1, 0]);\r
        outline.push([(next() - 0.3) * 0.5, spread]);\r
        outline.push([-0.55 - next() * 0.2, (next() - 0.5) * 0.1]);\r
        outline.push([(next() - 0.3) * 0.5, -spread * (0.8 + next() * 0.4)]);\r
      } else {\r
        const sides = next() < 0.5 ? 4 : 5;\r
        const stretch = 0.4 + next() * 0.3;\r
        const turn = next() * TAU;\r
        for (let corner = 0; corner < sides; corner += 1) {\r
          const angle = turn + ((corner + (next() - 0.5) * 0.6) * TAU) / sides;\r
          outline.push([Math.cos(angle), Math.sin(angle) * stretch]);\r
        }\r
      }\r
      const sides = outline.length;\r
      let mx = 0;\r
      let my = 0;\r
      for (const point of outline) {\r
        mx += point[0] / sides;\r
        my += point[1] / sides;\r
      }\r
      const shape = [];\r
      for (let corner = 0; corner < 5; corner += 1) {\r
        const point = outline[Math.min(corner, sides - 1)];\r
        shape.push(point[0] - mx, point[1] - my);\r
      }\r
      shards.push({\r
        level,\r
        phase: (index + next()) / Math.max(amount, 1),\r
        lane: Math.sign(flat) * Math.pow(Math.abs(flat), 0.85),\r
        layer: Math.sqrt(-2 * Math.log(Math.max(next(), 1e-6))) * Math.cos(TAU * next()),\r
        size: 0.6 + next() * next() * 1.25,\r
        shape,\r
        sides,\r
        thickness: 0.06 + next() * 0.04,\r
        yaw: (next() - 0.5) * 0.36,\r
        bank: (next() - 0.5) * 0.5,\r
        pitch: (next() - 0.5) * 0.24,\r
        tint: next(),\r
        drift: [next() * TAU, next() * TAU, next() * TAU],\r
        rate: [0.3 + next() * 0.35, 0.25 + next() * 0.35, 0.3 + next() * 0.3],\r
        flutter: [next() * TAU, 0.5 + next() * 0.5],\r
        arrive: next(),\r
        sign: next() < 0.5 ? -1 : 1,\r
        slot: [next() * TAU, 0.06 + 0.3 * Math.sqrt(next()), next() - 0.5, next() < 0.85 ? 1 : -1],\r
        offset: [0, 0, 0],\r
        velocity: [0, 0, 0],\r
        tilt: 0,\r
        tiltVelocity: 0,\r
        flash: 0,\r
        gather: 0,\r
        joined: false,\r
        position: [0, 0, 0],\r
        s: 0\r
      });\r
    }\r
  }\r
  return shards;\r
};\r
\r
export default function AeroShards({\r
  shardColor = '#896ABD',\r
  accentColor = '#A855F7',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  placement = 'full',\r
  material = 'glass',\r
  count = 1300,\r
  shardSize = 1,\r
  spread = 1,\r
  twist = 1,\r
  billow = 1,\r
  speed = 1,\r
  scale = 1,\r
  depthOfField = 0.75,\r
  glow = 0.35,\r
  grain = 0.06,\r
  vignette = 0.3,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.6,\r
  markers = 'plus',\r
  pulseOnClick = true,\r
  holdToGather = true,\r
  parallax = 0.5,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style,\r
  onError\r
}) {\r
  const containerRef = useRef(null);\r
  const onErrorRef = useRef(onError);\r
  onErrorRef.current = onError;\r
\r
  const settings = {\r
    shard: parseColor(shardColor, [0.54, 0.42, 0.74]) ?? [0.54, 0.42, 0.74],\r
    accent: parseColor(accentColor, [0.66, 0.33, 0.97]) ?? [0.66, 0.33, 0.97],\r
    paper: parseColor(backgroundColor, null),\r
    lightMode,\r
    placement: Math.max(0, PLACEMENTS.indexOf(placement)),\r
    material: MATERIALS[material] ?? MATERIALS.glass,\r
    count: Math.round(clamp(count, 100, 6000)),\r
    shardSize: clamp(shardSize, 0.2, 4),\r
    spread: clamp(spread, 0, 3),\r
    twist: clamp(twist, 0, 3),\r
    billow: clamp(billow, 0, 3),\r
    speed: clamp(speed, 0, 4),\r
    scale: clamp(scale, 0.4, 2.5),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    grain: clamp(grain, 0, 0.5),\r
    vignette: clamp(vignette, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    markers: MARKER_STYLES[markers] ?? -1,\r
    pulseOnClick,\r
    holdToGather,\r
    parallax: clamp(parallax, 0, 1),\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
\r
    let disposed = false;\r
    let gpu = null;\r
    let raf = 0;\r
    const cleanups = [];\r
\r
    const fail = error => {\r
      if (disposed) return;\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      gpu?.dispose();\r
      gpu = null;\r
      onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));\r
    };\r
\r
    const start = async () => {\r
      if (typeof navigator === 'undefined' || !('gpu' in navigator)) throw new Error('WebGPU is not available');\r
      const instance = await init({ powerPreference: 'high-performance' });\r
      gpu = instance;\r
      if (disposed) {\r
        instance.dispose();\r
        return;\r
      }\r
      cleanups.push(instance.onError(fail));\r
      const format = navigator.gpu.getPreferredCanvasFormat();\r
      const sizeFor = () => {\r
        const ratio = Math.min(window.devicePixelRatio || 1, settingsRef.current.dpr);\r
        return [\r
          Math.max(1, Math.round(container.clientWidth * ratio)),\r
          Math.max(1, Math.round(container.clientHeight * ratio))\r
        ];\r
      };\r
      const output = surface(instance, canvas, {\r
        autoResize: false,\r
        size: sizeFor(),\r
        format,\r
        alphaMode: 'premultiplied'\r
      });\r
      const linear = sampler(instance, {\r
        minFilter: 'linear',\r
        magFilter: 'linear',\r
        addressModeU: 'clamp-to-edge',\r
        addressModeV: 'clamp-to-edge'\r
      });\r
      const scene = target(instance, { size: output.size, format: 'rgba16float' });\r
      const levelSize = index => [\r
        Math.max(1, Math.round(output.size[0] / 2 ** (index + 1))),\r
        Math.max(1, Math.round(output.size[1] / 2 ** (index + 1)))\r
      ];\r
      const levels = Array.from({ length: BLOOM_LEVELS }, (_, index) => ({\r
        main: target(instance, { size: levelSize(index), format: 'rgba16float' }),\r
        spare: target(instance, { size: levelSize(index), format: 'rgba16float' })\r
      }));\r
      const frameParams = uniforms(instance, {\r
        view: [1, 1, 1, 0],\r
        eye: [0, 0, CAMERA, FOCUS],\r
        forward: [0, 0, -1, 0],\r
        right: [1, 0, 0, 0],\r
        up: [0, 1, 0, 0],\r
        shard: [0.54, 0.42, 0.74, 0.5],\r
        accent: [0.66, 0.33, 0.97, 0],\r
        marker: [0, 1, 4, CAMERA],\r
        surface: [7, 0, 0, 2.4]\r
      });\r
      let markerCapacity = 0;\r
      let markerBuffer = null;\r
      let markerData = new Float32Array(0);\r
      const markerDraw = draw(instance, {\r
        shader: MARKER_SHADER,\r
        vertices: 6,\r
        cull: 'none',\r
        depth: false,\r
        blend: 'premultiplied',\r
        label: 'aero-shards-markers'\r
      });\r
      const ensureMarkers = needed => {\r
        if (needed <= markerCapacity && markerBuffer) return;\r
        markerCapacity = Math.max(needed, 512);\r
        markerData = new Float32Array(markerCapacity * MARKER_FLOATS);\r
        markerBuffer = storage(instance, markerData.byteLength, 'read');\r
        markerDraw.set({ scene: frameParams, markers: markerBuffer });\r
      };\r
      ensureMarkers(512);\r
      const groupSize = scale => [\r
        Math.max(1, Math.round(output.size[0] * scale)),\r
        Math.max(1, Math.round(output.size[1] * scale))\r
      ];\r
      const groups = LAYER_SCALES.map((scale, index) => ({\r
        scale,\r
        layer: target(instance, { size: groupSize(scale), format: 'rgba16float', depth: 'depth32float' }),\r
        shaded: target(instance, { size: groupSize(scale), format: 'rgba16float' }),\r
        temp: target(instance, { size: index === 0 ? [1, 1] : groupSize(scale), format: 'rgba16float' }),\r
        blurred: target(instance, { size: index === 0 ? [1, 1] : groupSize(scale), format: 'rgba16float' }),\r
        softReady: index !== 0\r
      }));\r
      const layerParams = DEPTHS.map(() => uniforms(instance, { view: [1, 1, 1, 0], look: [0.7, 0, 0, 0] }));\r
      const spreadX = DEPTHS.map(() => uniforms(instance, { texel: [0, 0, 0, 0] }));\r
      const spreadY = DEPTHS.map(() => uniforms(instance, { texel: [0, 0, 0, 0] }));\r
      const mixParams = DEPTHS.map(() => uniforms(instance, { info: [1, 0, 0, 0] }));\r
      const shadeParams = DEPTHS.map(() => uniforms(instance, { info: [0, 0, 0, 0], more: [0, 0, 0, 0] }));\r
      const shardSolid = DEPTHS.map((_, level) =>\r
        draw(instance, {\r
          shader: SHARD_SHADER,\r
          entry: { fragment: 'fs_solid' },\r
          vertices: 6,\r
          cull: 'none',\r
          depth: { write: true, compare: 'less' },\r
          label: \`aero-shards-solid-\${level}\`\r
        })\r
      );\r
      const shardEdge = DEPTHS.map((_, level) =>\r
        draw(instance, {\r
          shader: SHARD_SHADER,\r
          entry: { fragment: 'fs_edge' },\r
          vertices: 6,\r
          cull: 'none',\r
          depth: { write: false, compare: 'less' },\r
          blend: 'premultiplied',\r
          label: \`aero-shards-edge-\${level}\`\r
        })\r
      );\r
      const layerPasses = DEPTHS.map((_, level) =>\r
        groups.map((group, index) => ({\r
          shadow: effect(instance, SHADOW_SHADER, {\r
            label: \`aero-shards-shadow-\${level}-\${index}\`,\r
            set: { source: group.layer, depthMap: group.layer.depth, shadeInfo: shadeParams[level] }\r
          }),\r
          blurX: effect(instance, LAYER_BLUR_SHADER, {\r
            label: \`aero-shards-depth-x-\${level}-\${index}\`,\r
            set: { source: group.shaded, linearSampler: linear, spreadInfo: spreadX[level] }\r
          }),\r
          blurY: effect(instance, LAYER_BLUR_SHADER, {\r
            label: \`aero-shards-depth-y-\${level}-\${index}\`,\r
            set: { source: group.temp, linearSampler: linear, spreadInfo: spreadY[level] }\r
          }),\r
          sharp: effect(instance, COMPOSITE_SHADER, {\r
            label: \`aero-shards-sharp-\${level}-\${index}\`,\r
            blend: 'premultiplied',\r
            set: { source: group.shaded, linearSampler: linear, mixInfo: mixParams[level] }\r
          }),\r
          soft: effect(instance, COMPOSITE_SHADER, {\r
            label: \`aero-shards-soft-\${level}-\${index}\`,\r
            blend: 'premultiplied',\r
            set: { source: group.blurred, linearSampler: linear, mixInfo: mixParams[level] }\r
          })\r
        }))\r
      );\r
      let capacity = 0;\r
      let shardBuffer = null;\r
      let upload = new Float32Array(0);\r
      let staging = new Float32Array(0);\r
      let depths = new Float32Array(0);\r
      const ensureCapacity = needed => {\r
        if (needed <= capacity && shardBuffer) return;\r
        capacity = Math.max(needed, 256);\r
        upload = new Float32Array(capacity * FLOATS);\r
        staging = new Float32Array(capacity * FLOATS);\r
        depths = new Float32Array(capacity);\r
        shardBuffer = storage(instance, upload.byteLength, 'read');\r
        DEPTHS.forEach((_, level) => {\r
          shardSolid[level].set({ scene: frameParams, shards: shardBuffer, layerInfo: layerParams[level] });\r
          shardEdge[level].set({ scene: frameParams, shards: shardBuffer, layerInfo: layerParams[level] });\r
        });\r
      };\r
      ensureCapacity(settingsRef.current.count);\r
\r
      const passes = levels.map((level, index) => {\r
        const source = index === 0 ? scene : levels[index - 1].main;\r
        const downParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        const horizontalParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        const verticalParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        return {\r
          source,\r
          level,\r
          downParams,\r
          horizontalParams,\r
          verticalParams,\r
          down: effect(instance, index === 0 ? PREFILTER_SHADER : DOWNSAMPLE_SHADER, {\r
            label: \`aero-shards-down-\${index}\`,\r
            set: { source, linearSampler: linear, bloom: downParams }\r
          }),\r
          horizontal: effect(instance, BLUR_SHADER, {\r
            label: \`aero-shards-blur-x-\${index}\`,\r
            set: { source: level.main, linearSampler: linear, bloom: horizontalParams }\r
          }),\r
          vertical: effect(instance, BLUR_SHADER, {\r
            label: \`aero-shards-blur-y-\${index}\`,\r
            set: { source: level.spare, linearSampler: linear, bloom: verticalParams }\r
          })\r
        };\r
      });\r
      const finishParams = uniforms(instance, { info: [0, 0, 0, 1], paper: [0, 0, 0, 0], mode: [0, 0, 0, 0] });\r
      const finish = effect(instance, FINISH_SHADER, {\r
        label: 'aero-shards-finish',\r
        set: {\r
          sceneTexture: scene,\r
          linearSampler: linear,\r
          bloom0: levels[0].main,\r
          bloom1: levels[1].main,\r
          bloom2: levels[2].main,\r
          bloom3: levels[3].main,\r
          finish: finishParams\r
        }\r
      });\r
      await Promise.all([\r
        ...shardSolid.map(item => item.compile(groups[0].layer)),\r
        ...shardEdge.map(item => item.compile(groups[0].layer)),\r
        ...layerPasses.flatMap(list =>\r
          list.flatMap((item, index) => [\r
            item.shadow.compile(groups[index].shaded),\r
            item.blurX.compile(groups[index].temp),\r
            item.blurY.compile(groups[index].blurred),\r
            item.sharp.compile(scene),\r
            item.soft.compile(scene)\r
          ])\r
        ),\r
        markerDraw.compile(scene),\r
        finish.compile({ colors: [format] }),\r
        ...passes.flatMap((pass, index) => [\r
          pass.down.compile(levels[index].main),\r
          pass.horizontal.compile(levels[index].spare),\r
          pass.vertical.compile(levels[index].main)\r
        ])\r
      ]);\r
      if (disposed) return;\r
\r
      const paths = Array.from({ length: LEVELS }, () => ({\r
        position: new Float32Array(SAMPLES * 3),\r
        tangent: new Float32Array(SAMPLES * 3),\r
        across: new Float32Array(SAMPLES * 3),\r
        lift: new Float32Array(SAMPLES * 3),\r
        length: 1\r
      }));\r
      const markerCounts = [0, 0, 0, 0, 0];\r
      const markerStarts = [0, 0, 0, 0, 0];\r
      const raw = new Float32Array((SAMPLES + 1) * 3);\r
      const lengths = new Float32Array(SAMPLES + 1);\r
      const point = [0, 0, 0];\r
      let pathKey = '';\r
\r
      const state = {\r
        visible: false,\r
        clock: 0,\r
        last: 0,\r
        travel: new Float64Array(LEVELS),\r
        roll: 0,\r
        twist: 0,\r
        drift: 0,\r
        introAt: -1,\r
        weights: PLACEMENTS.map((_, index) => (index === settingsRef.current.placement ? 1 : 0)),\r
        weightVelocity: [0, 0, 0, 0],\r
        shards: createShards(settingsRef.current.count, 1337),\r
        order: [],\r
        pointer: [0.5, 0.5],\r
        inside: false,\r
        presence: 0,\r
        yaw: 0,\r
        pitch: 0,\r
        yawVelocity: 0,\r
        pitchVelocity: 0,\r
        pressAt: -1,\r
        pressPoint: null,\r
        holding: false,\r
        hold: 0,\r
        reach: 0,\r
        gatherCenter: [0, 0, 0],\r
        rings: [],\r
        markerDrift: 0,\r
        markerTarget: '',\r
        markerTotal: 0,\r
        targets: new Map(),\r
        quiet: 0,\r
        seen: null\r
      };\r
\r
      const buildPaths = aspect => {\r
        const closed = state.weights[3] > 0.999;\r
        const key = \`\${aspect.toFixed(4)}|\${state.weights.map(w => w.toFixed(4)).join(',')}\`;\r
        if (key === pathKey) return closed;\r
        pathKey = key;\r
        for (let level = 0; level < LEVELS; level += 1) {\r
          const path = paths[level];\r
          let total = 0;\r
          for (let i = 0; i <= SAMPLES; i += 1) {\r
            const s = i / SAMPLES;\r
            let x = 0;\r
            let y = 0;\r
            let z = 0;\r
            for (let k = 0; k < 4; k += 1) {\r
              const weight = state.weights[k];\r
              if (weight < 0.0001) continue;\r
              ribbonPoint(k, level, s, aspect, point);\r
              x += point[0] * weight;\r
              y += point[1] * weight;\r
              z += point[2] * weight;\r
            }\r
            raw[i * 3] = x;\r
            raw[i * 3 + 1] = y;\r
            raw[i * 3 + 2] = z;\r
            if (i > 0) total += Math.hypot(x - raw[i * 3 - 3], y - raw[i * 3 - 2], z - raw[i * 3 - 1]);\r
            lengths[i] = total;\r
          }\r
          path.length = Math.max(total, 1e-3);\r
          let cursor = 0;\r
          for (let i = 0; i < SAMPLES; i += 1) {\r
            const want = (i / (SAMPLES - 1)) * total;\r
            while (cursor < SAMPLES - 1 && lengths[cursor + 1] < want) cursor += 1;\r
            const span = Math.max(lengths[cursor + 1] - lengths[cursor], 1e-6);\r
            const f = clamp((want - lengths[cursor]) / span, 0, 1);\r
            for (let c = 0; c < 3; c += 1) {\r
              path.position[i * 3 + c] = raw[cursor * 3 + c] + (raw[cursor * 3 + 3 + c] - raw[cursor * 3 + c]) * f;\r
            }\r
          }\r
          let px = 0;\r
          let py = 1;\r
          let pz = 0;\r
          for (let i = 0; i < SAMPLES; i += 1) {\r
            const a = Math.max(0, i - 1);\r
            const b = Math.min(SAMPLES - 1, i + 1);\r
            let tx = path.position[b * 3] - path.position[a * 3];\r
            let ty = path.position[b * 3 + 1] - path.position[a * 3 + 1];\r
            let tz = path.position[b * 3 + 2] - path.position[a * 3 + 2];\r
            const tl = Math.hypot(tx, ty, tz) || 1;\r
            tx /= tl;\r
            ty /= tl;\r
            tz /= tl;\r
            if (i === 0) {\r
              px = -ty;\r
              py = tx;\r
              pz = 0;\r
            }\r
            const along = px * tx + py * ty + pz * tz;\r
            px -= tx * along;\r
            py -= ty * along;\r
            pz -= tz * along;\r
            const pl = Math.hypot(px, py, pz) || 1;\r
            px /= pl;\r
            py /= pl;\r
            pz /= pl;\r
            path.tangent[i * 3] = tx;\r
            path.tangent[i * 3 + 1] = ty;\r
            path.tangent[i * 3 + 2] = tz;\r
            path.across[i * 3] = px;\r
            path.across[i * 3 + 1] = py;\r
            path.across[i * 3 + 2] = pz;\r
            path.lift[i * 3] = ty * pz - tz * py;\r
            path.lift[i * 3 + 1] = tz * px - tx * pz;\r
            path.lift[i * 3 + 2] = tx * py - ty * px;\r
          }\r
        }\r
        return closed;\r
      };\r
\r
      const resize = () => {\r
        const next = sizeFor();\r
        if (next[0] === output.size[0] && next[1] === output.size[1]) return;\r
        output.resize(next);\r
        scene.resize(next);\r
        groups.forEach(group => {\r
          group.layer.resize(groupSize(group.scale));\r
          group.shaded.resize(groupSize(group.scale));\r
          if (group.softReady) {\r
            group.temp.resize(groupSize(group.scale));\r
            group.blurred.resize(groupSize(group.scale));\r
          }\r
        });\r
        levels.forEach((level, index) => {\r
          level.main.resize(levelSize(index));\r
          level.spare.resize(levelSize(index));\r
        });\r
        layerPasses.forEach(list =>\r
          list.forEach((item, index) => item.shadow.set({ depthMap: groups[index].layer.depth }))\r
        );\r
        state.quiet = 0;\r
      };\r
      const sizes = new ResizeObserver(resize);\r
      sizes.observe(container);\r
      cleanups.push(() => sizes.disconnect());\r
\r
      const cam = { eye: [0, 0, CAMERA], forward: [0, 0, -1], right: [1, 0, 0], up: [0, 1, 0], focal: 1 };\r
\r
      const updateCamera = s => {\r
        const cy = Math.cos(state.yaw);\r
        const sy = Math.sin(state.yaw);\r
        const cp = Math.cos(state.pitch);\r
        const sp = Math.sin(state.pitch);\r
        cam.eye[0] = sy * cp * CAMERA;\r
        cam.eye[1] = sp * CAMERA;\r
        cam.eye[2] = cy * cp * CAMERA;\r
        cam.forward[0] = -sy * cp;\r
        cam.forward[1] = -sp;\r
        cam.forward[2] = -cy * cp;\r
        const rl = Math.hypot(cam.forward[2], cam.forward[0]) || 1;\r
        cam.right[0] = -cam.forward[2] / rl;\r
        cam.right[1] = 0;\r
        cam.right[2] = cam.forward[0] / rl;\r
        cam.up[0] = cam.right[1] * cam.forward[2] - cam.right[2] * cam.forward[1];\r
        cam.up[1] = cam.right[2] * cam.forward[0] - cam.right[0] * cam.forward[2];\r
        cam.up[2] = cam.right[0] * cam.forward[1] - cam.right[1] * cam.forward[0];\r
        cam.focal = output.size[1] * 0.5 * CAMERA * s.scale;\r
      };\r
\r
      const ray = [0, 0, 1];\r
      const rayAt = (px, py) => {\r
        const x = (px - 0.5) * output.size[0];\r
        const y = (0.5 - py) * output.size[1];\r
        ray[0] = cam.forward[0] * cam.focal + cam.right[0] * x + cam.up[0] * y;\r
        ray[1] = cam.forward[1] * cam.focal + cam.right[1] * x + cam.up[1] * y;\r
        ray[2] = cam.forward[2] * cam.focal + cam.right[2] * x + cam.up[2] * y;\r
        const length = Math.hypot(ray[0], ray[1], ray[2]) || 1;\r
        ray[0] /= length;\r
        ray[1] /= length;\r
        ray[2] /= length;\r
        return ray;\r
      };\r
\r
      const simulate = (s, dt, reduced) => {\r
        const aspect = output.size[0] / Math.max(output.size[1], 1);\r
        const closed = buildPaths(aspect);\r
        const introOn = s.intro && !reduced;\r
        const introAge = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
        const hover = s.mouseInteraction && !reduced ? state.presence * s.mouseStrength : 0;\r
        let rx = 0;\r
        let ry = 0;\r
        let rz = 0;\r
        if (hover > 0.001) {\r
          rayAt(state.pointer[0], state.pointer[1]);\r
          rx = ray[0];\r
          ry = ray[1];\r
          rz = ray[2];\r
        }\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
        const h = dt / Math.max(steps, 1);\r
        const halfHeight = output.size[1] * 0.5;\r
        const rings = state.rings.map(ring => {\r
          const life = ring.age / RING_SECONDS;\r
          return {\r
            x: ring.x,\r
            y: ring.y,\r
            age: ring.age,\r
            strength: (1 - Math.exp(-ring.age / 0.06)) * (1 - life) * (1 - life)\r
          };\r
        });\r
        const screenOf = (x, y, z, out) => {\r
          const ex = x - cam.eye[0];\r
          const ey = y - cam.eye[1];\r
          const ez = z - cam.eye[2];\r
          const depth = Math.max(ex * cam.forward[0] + ey * cam.forward[1] + ez * cam.forward[2], 0.05);\r
          out[0] = ((ex * cam.right[0] + ey * cam.right[1] + ez * cam.right[2]) * cam.focal) / depth / halfHeight;\r
          out[1] = ((ex * cam.up[0] + ey * cam.up[1] + ez * cam.up[2]) * cam.focal) / depth / halfHeight;\r
          return depth;\r
        };\r
        const ringBand = (sx, sy, level) => {\r
          let total = 0;\r
          for (const ring of rings) {\r
            const radius = Math.max(0, ring.age - level * 0.07) * 2.3;\r
            const distance = Math.hypot(sx - ring.x, sy - ring.y);\r
            total += Math.exp(-((distance - radius) * (distance - radius)) / 0.012) * ring.strength;\r
          }\r
          return total;\r
        };\r
        const flat = [0, 0];\r
        const shards = state.shards;\r
        const twistWeight = Math.min(1, s.twist);\r
        for (let index = 0; index < shards.length; index += 1) {\r
          const shard = shards[index];\r
          const level = shard.level;\r
          const path = paths[level];\r
          let s0 = (shard.phase + state.travel[level]) % 1;\r
          let appear = 1;\r
          let introBank = 0;\r
          if (introOn) {\r
            const begin =\r
              level * 0.22 + Math.max(0, s0 - 0.1) * (INTRO_SECONDS - 1.0 - (LEVELS - 1) * 0.22) + shard.arrive * 0.15;\r
            const local = clamp((introAge - begin) / 0.9, 0, 1);\r
            appear = smoother(local);\r
            const glide = (1 - local) * (1 - local);\r
            s0 = closed ? s0 - glide * 0.06 : Math.max(0, s0 - glide * 0.06);\r
            introBank = glide * 0.9 * shard.sign;\r
          }\r
          shard.s = s0;\r
          const f = (((s0 % 1) + 1) % 1) * (SAMPLES - 1);\r
          const i0 = Math.floor(f);\r
          const i1 = Math.min(i0 + 1, SAMPLES - 1);\r
          const t = f - i0;\r
          const at = (array, c) => array[i0 * 3 + c] + (array[i1 * 3 + c] - array[i0 * 3 + c]) * t;\r
          const cx = at(path.position, 0);\r
          const cy = at(path.position, 1);\r
          const cz = at(path.position, 2);\r
          const tx = at(path.tangent, 0);\r
          const ty = at(path.tangent, 1);\r
          const tz = at(path.tangent, 2);\r
          const ax0 = at(path.across, 0);\r
          const ay0 = at(path.across, 1);\r
          const az0 = at(path.across, 2);\r
          const lx0 = at(path.lift, 0);\r
          const ly0 = at(path.lift, 1);\r
          const lz0 = at(path.lift, 2);\r
          const angle = s.twist * (s0 * TAU * 0.6 + state.twist + level * 1.7);\r
          const ca = Math.cos(angle);\r
          const sa = Math.sin(angle);\r
          const ax = ax0 * ca + lx0 * sa;\r
          const ay = ay0 * ca + ly0 * sa;\r
          const az = az0 * ca + lz0 * sa;\r
          const bx = lx0 * ca - ax0 * sa;\r
          const by = ly0 * ca - ay0 * sa;\r
          const bz = lz0 * ca - az0 * sa;\r
          const depthScale = DEPTHS[level] / CAMERA;\r
          const width =\r
            s.spread * (0.15 + 0.035 * DEPTHS[level]) * (0.8 + 0.3 * Math.sin(s0 * TAU * 1.3 + level * 0.8));\r
          const lane = shard.lane * width;\r
          const layer = shard.layer * 0.012 * depthScale;\r
          const taper = closed ? 1 : smoother(s0 / 0.12) * smoother((1 - s0) / 0.12);\r
          const billow =\r
            s.billow *\r
            0.16 *\r
            depthScale *\r
            Math.sin(s0 * TAU * 1.3 - state.drift * 0.5 + level * 1.1) *\r
            (0.4 + 0.6 * taper);\r
          const sway = s.billow * 0.06 * depthScale * Math.sin(s0 * TAU * 0.8 - state.drift * 0.35 + level * 2.4);\r
          const wobble = 0.009 * depthScale;\r
          const drift = state.drift;\r
          const hx =\r
            cx +\r
            lx0 * billow +\r
            ax0 * sway +\r
            ax * lane +\r
            bx * layer +\r
            Math.sin(drift * shard.rate[0] + shard.drift[0]) * wobble;\r
          const hy =\r
            cy +\r
            ly0 * billow +\r
            ay0 * sway +\r
            ay * lane +\r
            by * layer +\r
            Math.sin(drift * shard.rate[1] + shard.drift[1]) * wobble;\r
          const hz =\r
            cz +\r
            lz0 * billow +\r
            az0 * sway +\r
            az * lane +\r
            bz * layer +\r
            Math.sin(drift * shard.rate[2] + shard.drift[2]) * wobble;\r
\r
          let fx = 0;\r
          let fy = 0;\r
          let fz = 0;\r
          let tiltTarget = 0;\r
          const px = hx + shard.offset[0];\r
          const py = hy + shard.offset[1];\r
          const pz = hz + shard.offset[2];\r
          if (hover > 0.001) {\r
            const ex = px - cam.eye[0];\r
            const ey = py - cam.eye[1];\r
            const ez = pz - cam.eye[2];\r
            const along = ex * rx + ey * ry + ez * rz;\r
            const qx = ex - rx * along;\r
            const qy = ey - ry * along;\r
            const qz = ez - rz * along;\r
            const gap = Math.hypot(qx, qy, qz);\r
            const reach = (0.24 * depthScale) / s.scale;\r
            const falloff = Math.exp(-(gap * gap) / (reach * reach));\r
            if (falloff > 0.002 && gap > 1e-5) {\r
              const nx = qx / gap;\r
              const ny = qy / gap;\r
              const nz = qz / gap;\r
              const sideways = (nx * tx + ny * ty + nz * tz) * 0.7;\r
              const strength = hover * falloff * 9 * depthScale;\r
              fx += (nx - tx * sideways) * strength;\r
              fy += (ny - ty * sideways) * strength;\r
              fz += (nz - tz * sideways) * strength;\r
              tiltTarget += hover * falloff * 1.1 * (nx * ax0 + ny * ay0 + nz * az0);\r
            }\r
          }\r
\r
          if (state.hold > 0.001 && shard.joined) {\r
            const slot = shard.slot;\r
            const orbit = slot[0] + state.clock * (0.8 / (0.12 + slot[1])) * slot[3];\r
            const radius = slot[1] / s.scale;\r
            const gx = state.gatherCenter[0] + Math.cos(orbit) * radius;\r
            const gy = state.gatherCenter[1] + Math.sin(orbit) * radius * 0.75;\r
            const gz = state.gatherCenter[2] + Math.sin(orbit) * radius * 0.45 + slot[2] * 0.3;\r
            shard.gather += (state.hold - shard.gather) * (1 - Math.exp(-dt / 0.3));\r
            const pull = shard.gather * 30;\r
            fx += (gx - px) * pull;\r
            fy += (gy - py) * pull;\r
            fz += (gz - pz) * pull;\r
            tiltTarget += shard.gather * 0.6 * Math.sin(orbit);\r
          } else {\r
            shard.gather += (0 - shard.gather) * (1 - Math.exp(-dt / 0.2));\r
          }\r
\r
          if (rings.length) {\r
            screenOf(px, py, pz, flat);\r
            for (const ring of rings) {\r
              const radius = Math.max(0, ring.age - level * 0.07) * 2.3;\r
              const dxr = flat[0] - ring.x;\r
              const dyr = flat[1] - ring.y;\r
              const distance = Math.hypot(dxr, dyr);\r
              const band = Math.exp(-((distance - radius) * (distance - radius)) / 0.012) * ring.strength;\r
              if (band > 0.01) {\r
                shard.flash = Math.max(shard.flash, band * 0.75);\r
                const outward = Math.max(distance, 0.05);\r
                const ux = (cam.right[0] * dxr + cam.up[0] * dyr) / outward;\r
                const uy = (cam.right[1] * dxr + cam.up[1] * dyr) / outward;\r
                const uz = (cam.right[2] * dxr + cam.up[2] * dyr) / outward;\r
                tiltTarget += band * 1.4 * (ux * ax0 + uy * ay0 + uz * az0);\r
                const push = (band * 2.2 * depthScale) / Math.max(distance, 0.05);\r
                fx += (cam.right[0] * dxr + cam.up[0] * dyr) * push;\r
                fy += (cam.right[1] * dxr + cam.up[1] * dyr) * push;\r
                fz += (cam.right[2] * dxr + cam.up[2] * dyr) * push;\r
              }\r
            }\r
          }\r
\r
          const stiffness = 24 * (1 - shard.gather * 0.95);\r
          for (let step = 0; step < steps; step += 1) {\r
            shard.velocity[0] += (fx - stiffness * shard.offset[0] - 7.5 * shard.velocity[0]) * h;\r
            shard.velocity[1] += (fy - stiffness * shard.offset[1] - 7.5 * shard.velocity[1]) * h;\r
            shard.velocity[2] += (fz - stiffness * shard.offset[2] - 7.5 * shard.velocity[2]) * h;\r
            shard.offset[0] += shard.velocity[0] * h;\r
            shard.offset[1] += shard.velocity[1] * h;\r
            shard.offset[2] += shard.velocity[2] * h;\r
            shard.tiltVelocity += (90 * (tiltTarget - shard.tilt) - 15 * shard.tiltVelocity) * h;\r
            shard.tilt += shard.tiltVelocity * h;\r
          }\r
          shard.flash *= Math.exp(-dt / 0.45);\r
\r
          const ox = hx + shard.offset[0];\r
          const oy = hy + shard.offset[1];\r
          const oz = hz + shard.offset[2];\r
          shard.position[0] = ox;\r
          shard.position[1] = oy;\r
          shard.position[2] = oz;\r
\r
          let vx = cam.eye[0] - ox;\r
          let vy = cam.eye[1] - oy;\r
          let vz = cam.eye[2] - oz;\r
          const vl = Math.hypot(vx, vy, vz) || 1;\r
          vx /= vl;\r
          vy /= vl;\r
          vz /= vl;\r
          let dx = tx + shard.velocity[0] * 0.05;\r
          let dy = ty + shard.velocity[1] * 0.05;\r
          let dz = tz + shard.velocity[2] * 0.05;\r
          const facingPart = dx * vx + dy * vy + dz * vz;\r
          dx -= vx * facingPart;\r
          dy -= vy * facingPart;\r
          dz -= vz * facingPart;\r
          let dl = Math.hypot(dx, dy, dz);\r
          if (dl < 1e-4) {\r
            dx = cam.right[0];\r
            dy = cam.right[1];\r
            dz = cam.right[2];\r
            dl = 1;\r
          }\r
          dx /= dl;\r
          dy /= dl;\r
          dz /= dl;\r
          const wx = vy * dz - vz * dy;\r
          const wy = vz * dx - vx * dz;\r
          const wz = vx * dy - vy * dx;\r
          const yaw = shard.yaw + 0.05 * Math.sin(state.clock * shard.flutter[1] * 0.7 + shard.flutter[0]);\r
          const cyaw = Math.cos(yaw);\r
          const syaw = Math.sin(yaw);\r
          const kx = dx * cyaw + wx * syaw;\r
          const ky = dy * cyaw + wy * syaw;\r
          const kz = dz * cyaw + wz * syaw;\r
          const jx = wx * cyaw - dx * syaw;\r
          const jy = wy * cyaw - dy * syaw;\r
          const jz = wz * cyaw - dz * syaw;\r
          const wave =\r
            0.8 * twistWeight * Math.sin(angle) +\r
            0.3 * Math.sin(s0 * TAU * 1.6 - state.roll * 0.55 + level * 0.9 + shard.lane * 0.7);\r
          const flutter = 0.06 * Math.sin(state.clock * shard.flutter[1] + shard.flutter[0]);\r
          const bank = MAX_BANK * Math.tanh((wave + shard.bank + flutter + shard.tilt + introBank) / MAX_BANK);\r
          const cb = Math.cos(bank);\r
          const sb = Math.sin(bank);\r
          const mx = vx * cb + jx * sb;\r
          const my = vy * cb + jy * sb;\r
          const mz = vz * cb + jz * sb;\r
          const pitch = shard.pitch + 0.2 * Math.sin(s0 * TAU * 1.1 - state.roll * 0.4 + level * 2.1);\r
          const cp = Math.cos(pitch);\r
          const sp = Math.sin(pitch);\r
          const axisX = kx * cp + mx * sp;\r
          const axisY = ky * cp + my * sp;\r
          const axisZ = kz * cp + mz * sp;\r
          const nx = mx * cp - kx * sp;\r
          const ny = my * cp - ky * sp;\r
          const nz = mz * cp - kz * sp;\r
\r
          const ex = ox - cam.eye[0];\r
          const ey = oy - cam.eye[1];\r
          const ez = oz - cam.eye[2];\r
          const viewDepth = ex * cam.forward[0] + ey * cam.forward[1] + ez * cam.forward[2];\r
          depths[index] = viewDepth;\r
          const core = 1 - 0.45 * shard.lane * shard.lane;\r
          const size = 0.062 * s.shardSize * shard.size * GROWTH[level] * appear * Math.sqrt(taper) * core;\r
          const o = index * FLOATS;\r
          staging[o] = ox;\r
          staging[o + 1] = oy;\r
          staging[o + 2] = oz;\r
          staging[o + 3] = size > 1e-5 ? size : 0;\r
          staging[o + 4] = axisX;\r
          staging[o + 5] = axisY;\r
          staging[o + 6] = axisZ;\r
          staging[o + 7] = shard.thickness;\r
          staging[o + 8] = nx;\r
          staging[o + 9] = ny;\r
          staging[o + 10] = nz;\r
          staging[o + 11] = shard.tint;\r
          for (let k = 0; k < 10; k += 1) staging[o + 12 + k] = shard.shape[k];\r
          staging[o + 22] = shard.sides;\r
          staging[o + 23] = shard.flash;\r
        }\r
\r
        let markerTotal = 0;\r
        for (let level = 0; level < LEVELS; level += 1) {\r
          markerCounts[level] = 0;\r
          markerStarts[level] = 0;\r
        }\r
        if (s.markers >= 0) {\r
          const ratio = output.size[1] / Math.max(container.clientHeight, 1);\r
          const pointerX = (state.pointer[0] - 0.5) * 2 * aspect;\r
          const pointerY = (0.5 - state.pointer[1]) * 2;\r
          const engaged = s.mouseInteraction && !reduced ? state.presence : 0;\r
          const previousTargets = state.targets;\r
          const nextTargets = new Map();\r
          const targetEase = 1 - Math.exp(-dt / 0.12);\r
          let nearestKey = '';\r
          let nearestGap = 72;\r
          for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
            markerStarts[level] = markerTotal;\r
            const depth = DEPTHS[level];\r
            const depthScale = depth / CAMERA;\r
            const spacing = 0.42 * Math.pow(depthScale, 0.55);\r
            const halfW = ((aspect * depth) / (CAMERA * s.scale)) * 1.12 + spacing;\r
            const halfH = (depth / (CAMERA * s.scale)) * 1.12 + spacing;\r
            const drift = state.markerDrift;\r
            const phase = MARKER_PHASES[level];\r
            const i0 = Math.floor((drift - halfW) / spacing - phase[0]);\r
            const i1 = Math.ceil((drift + halfW) / spacing - phase[0]);\r
            const j0 = Math.floor(-halfH / spacing - phase[1]);\r
            const j1 = Math.ceil(halfH / spacing - phase[1]);\r
            const band = s.spread * (0.15 + 0.035 * depth) * 1.4;\r
            const position = paths[level].position;\r
            for (let i = i0; i <= i1; i += 1) {\r
              for (let j = j0; j <= j1; j += 1) {\r
                const keep = latticeHash(level, i, j, 11);\r
                if (keep > 0.5) continue;\r
                const x = (i + phase[0]) * spacing - drift;\r
                const y = (j + phase[1]) * spacing;\r
                const z = CAMERA - depth;\r
                const markerDepth = screenOf(x, y, z, flat);\r
                if (Math.abs(flat[0]) > aspect * 1.05 || Math.abs(flat[1]) > 1.05) continue;\r
                let best = Infinity;\r
                for (let k = 0; k < SAMPLES; k += 2) {\r
                  const dx = x - position[k * 3];\r
                  const dy = y - position[k * 3 + 1];\r
                  const dz = z - position[k * 3 + 2];\r
                  const d2 = dx * dx + dy * dy + dz * dz;\r
                  if (d2 < best) best = d2;\r
                }\r
                const near = Math.exp(-best / (band * band));\r
                const blinkSeed = latticeHash(level, i, j, 23);\r
                const blinkRate = latticeHash(level, i, j, 37);\r
                const blink =\r
                  blinkSeed < 0.07 ? 0.5 + 0.5 * Math.sin(state.clock * (1.4 + blinkRate * 2.2) + blinkRate * 40) : 0;\r
                const pointerGap = (Math.hypot(flat[0] - pointerX, flat[1] - pointerY) * halfHeight) / ratio;\r
                const key = \`\${level}:\${i}:\${j}\`;\r
                if (level <= 2 && engaged > 0.01 && pointerGap < nearestGap) {\r
                  nearestGap = pointerGap;\r
                  nearestKey = key;\r
                }\r
                const wanted = key === state.markerTarget ? engaged * (1 - smoother((pointerGap - 30) / 42)) : 0;\r
                const before = previousTargets.get(key) ?? 0;\r
                const target = before + (wanted - before) * targetEase;\r
                if (target > 0.002) nextTargets.set(key, target);\r
                const bracket = Math.max(smoother((blink - 0.55) / 0.4), target);\r
                let ring = 0;\r
                if (rings.length) ring = ringBand(flat[0], flat[1], level);\r
                let reveal = 1;\r
                if (introOn) {\r
                  const across = clamp((flat[0] / aspect + 1) * 0.5, 0, 1);\r
                  const begin = level * 0.22 + 0.35 + across * (INTRO_SECONDS - 1.3 - (LEVELS - 1) * 0.22);\r
                  reveal = smoother((introAge - begin) / 0.5);\r
                }\r
                const fade = FADE[level] * (1 - smoother((markerDepth - 3) / 10) * 0.45) * reveal;\r
                if (fade < 0.002) continue;\r
                if (markerTotal >= markerCapacity) ensureMarkers(markerCapacity * 2);\r
                const o = markerTotal * MARKER_FLOATS;\r
                markerData[o] = x;\r
                markerData[o + 1] = y;\r
                markerData[o + 2] = z;\r
                markerData[o + 3] = fade;\r
                markerData[o + 4] = 0.42 + 0.5 * near + blink * 0.9 + target * 1.3 + ring * 2.5;\r
                markerData[o + 5] = bracket;\r
                markerData[o + 6] = 1 + 0.15 * near + 0.3 * blink + 0.2 * target;\r
                markerData[o + 7] = 0;\r
                markerTotal += 1;\r
                markerCounts[level] += 1;\r
              }\r
            }\r
          }\r
          state.targets = nextTargets;\r
          state.markerTarget = nearestKey;\r
        }\r
        state.markerTotal = markerTotal;\r
      };\r
\r
      const render = (s, dt, reduced) => {\r
        updateCamera(s);\r
        const shards = state.shards;\r
        ensureCapacity(shards.length);\r
        simulate(s, dt, reduced);\r
        if (state.order.length !== shards.length) state.order = shards.map((_, index) => index);\r
        const order = state.order;\r
        for (let i = 0; i < shards.length; i += 1) depths[i] += shards[i].level * 100;\r
        for (let i = 1; i < order.length; i += 1) {\r
          const value = order[i];\r
          const key = depths[value];\r
          let j = i - 1;\r
          while (j >= 0 && depths[order[j]] < key) {\r
            order[j + 1] = order[j];\r
            j -= 1;\r
          }\r
          order[j + 1] = value;\r
        }\r
        const counts = [0, 0, 0, 0, 0];\r
        for (let slot = 0; slot < order.length; slot += 1) {\r
          const from = order[slot] * FLOATS;\r
          const to = slot * FLOATS;\r
          counts[shards[order[slot]].level] += 1;\r
          for (let k = 0; k < FLOATS; k += 1) upload[to + k] = staging[from + k];\r
        }\r
        shardBuffer?.write(upload.subarray(0, shards.length * FLOATS));\r
        if (state.markerTotal > 0) markerBuffer?.write(markerData.subarray(0, state.markerTotal * MARKER_FLOATS));\r
        const starts = [0, 0, 0, 0, 0];\r
        let running = 0;\r
        for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
          starts[level] = running;\r
          running += counts[level];\r
        }\r
\r
        frameParams.set({\r
          view: [output.size[0], output.size[1], cam.focal, state.clock],\r
          eye: [cam.eye[0], cam.eye[1], cam.eye[2], FOCUS],\r
          forward: [cam.forward[0], cam.forward[1], cam.forward[2], s.depthOfField * output.size[1] * 0.03],\r
          right: [cam.right[0], cam.right[1], cam.right[2], output.size[1] * 0.05],\r
          up: [cam.up[0], cam.up[1], cam.up[2], s.lightMode ? 1 : 0],\r
          shard: [...s.shard, 0],\r
          accent: [...s.accent, 0],\r
          surface: s.material,\r
          marker: [\r
            s.markers,\r
            output.size[1] / Math.max(container.clientHeight, 1),\r
            4 * (output.size[1] / Math.max(container.clientHeight, 1)),\r
            FOCUS\r
          ]\r
        });\r
        passes.forEach(({ downParams, horizontalParams, verticalParams, source, level }) => {\r
          downParams.set({ texel: [0.5 / source.size[0], 0.5 / source.size[1], 0.75, 0.5] });\r
          horizontalParams.set({ texel: [1 / level.main.size[0], 0, 0, 0] });\r
          verticalParams.set({ texel: [0, 1 / level.main.size[1], 0, 0] });\r
        });\r
        const paper = s.paper ?? [0, 0, 0];\r
        const blooming = s.glow > 0.001 && !s.lightMode;\r
        finishParams.set({\r
          info: [s.grain, Math.floor(state.clock * 24), blooming ? s.glow : 0, 1.3],\r
          paper: [paper[0], paper[1], paper[2], s.paper ? 1 : 0],\r
          mode: [s.lightMode ? 1 : 0, s.vignette, 0, 0]\r
        });\r
\r
        const coc = s.depthOfField * output.size[1] * 0.012;\r
        const cap = output.size[1] * 0.02;\r
        const plan = DEPTHS.map((depth, level) => {\r
          const sigma = Math.min(coc * Math.abs(1 - SHARD_FOCUS / depth), cap);\r
          const groupIndex = sigma >= 2.2 ? 1 : 0;\r
          const group = groups[groupIndex];\r
          const soft = sigma >= 0.45;\r
          if (soft && !group.softReady) {\r
            group.softReady = true;\r
            group.temp.resize(groupSize(group.scale));\r
            group.blurred.resize(groupSize(group.scale));\r
          }\r
          const size = group.layer.size;\r
          layerParams[level].set({\r
            view: [size[0], size[1], cam.focal * (size[0] / output.size[0]), level],\r
            look: [s.lightMode ? 0.5 : 0.7, 0, 0, 0]\r
          });\r
          const local = sigma * group.scale;\r
          spreadX[level].set({ texel: [1 / size[0], 0, local, 0] });\r
          spreadY[level].set({ texel: [0, 1 / size[1], local, 0] });\r
          mixParams[level].set({ info: [FADE[level], 0, 0, 0] });\r
          const step = Math.max(0.6, 1.4 * (size[0] / Math.max(container.clientWidth, 1)));\r
          const shadowStrength = s.material === MATERIALS.glass ? 0 : s.lightMode ? 0.32 : 0.62;\r
          shadeParams[level].set({ info: [step * 0.55, step * 0.85, shadowStrength, 0], more: [0.00045, 0, 0, 0] });\r
          return { group, groupIndex, soft };\r
        });\r
\r
        frame(instance, current => {\r
          for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
            const { group, groupIndex, soft } = plan[level];\r
            const steps = layerPasses[level][groupIndex];\r
            if (counts[level] > 0) {\r
              current.pass({ target: group.layer, clear: [0, 0, 0, 0], clearDepth: 1 }, pass => {\r
                pass.draw(shardSolid[level], { instances: counts[level], firstInstance: starts[level] });\r
                pass.draw(shardEdge[level], { instances: counts[level], firstInstance: starts[level] });\r
              });\r
              current.pass({ target: group.shaded, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.shadow));\r
              if (soft) {\r
                current.pass({ target: group.temp, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.blurX));\r
                current.pass({ target: group.blurred, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.blurY));\r
              }\r
            }\r
            current.pass({ target: scene, clear: level === LEVELS - 1 ? [0, 0, 0, 0] : false }, pass => {\r
              if (markerCounts[level] > 0) {\r
                pass.draw(markerDraw, { instances: markerCounts[level], firstInstance: markerStarts[level] });\r
              }\r
              if (counts[level] > 0) pass.draw(soft ? steps.soft : steps.sharp);\r
            });\r
          }\r
          passes.forEach((pass, index) => {\r
            const level = levels[index];\r
            if (!blooming) {\r
              current.pass({ target: level.main, clear: [0, 0, 0, 0] }, () => {});\r
              return;\r
            }\r
            current.pass({ target: level.main, clear: [0, 0, 0, 0] }, p => p.draw(pass.down));\r
            current.pass({ target: level.spare, clear: [0, 0, 0, 0] }, p => p.draw(pass.horizontal));\r
            current.pass({ target: level.main, clear: [0, 0, 0, 0] }, p => p.draw(pass.vertical));\r
          });\r
          current.pass({ target: output, clear: [0, 0, 0, 0] }, pass => pass.draw(finish));\r
        });\r
      };\r
\r
      const tick = now => {\r
        raf = requestAnimationFrame(tick);\r
        if (!state.visible || document.hidden) {\r
          state.last = now;\r
          return;\r
        }\r
        const s = settingsRef.current;\r
        const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 0;\r
        state.last = now;\r
        const reduced = prefersReduced();\r
        state.clock += dt;\r
        if (state.introAt < 0) state.introAt = state.clock;\r
        if (state.shards.length !== s.count) {\r
          state.shards = createShards(s.count, 1337);\r
          state.order = [];\r
        }\r
        const moving = !s.paused && !reduced;\r
        if (moving) {\r
          for (let level = 0; level < LEVELS; level += 1) {\r
            state.travel[level] = (state.travel[level] + (dt * s.speed * 0.09) / paths[level].length) % 1;\r
          }\r
          state.roll += dt * s.speed * 1.0;\r
          state.twist += dt * s.speed * 0.08;\r
          state.drift += dt * s.speed;\r
        }\r
\r
        const goal = PLACEMENTS.map((_, index) => (index === s.placement ? 1 : 0));\r
        let settling = false;\r
        const decay = Math.exp(-4 * dt);\r
        for (let index = 0; index < 4; index += 1) {\r
          const offset = state.weights[index] - goal[index];\r
          const momentum = state.weightVelocity[index] + 4 * offset;\r
          state.weights[index] = goal[index] + (offset + momentum * dt) * decay;\r
          state.weightVelocity[index] = (state.weightVelocity[index] - 4 * momentum * dt) * decay;\r
          if (Math.abs(state.weights[index] - goal[index]) > 0.0005) settling = true;\r
        }\r
        if (!settling) {\r
          state.weights = goal;\r
          state.weightVelocity = [0, 0, 0, 0];\r
        }\r
\r
        const engaged = s.mouseInteraction && state.inside && !reduced;\r
        state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.25));\r
        const lean = engaged ? s.parallax : 0;\r
        const targetYaw = (state.pointer[0] - 0.5) * lean * 0.14;\r
        const targetPitch = (state.pointer[1] - 0.5) * lean * 0.08;\r
        state.yawVelocity += (38 * (targetYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
        state.pitchVelocity += (38 * (targetPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
        state.yaw += state.yawVelocity * dt;\r
        state.pitch += state.pitchVelocity * dt;\r
        const leaning =\r
          Math.abs(targetYaw - state.yaw) + Math.abs(targetPitch - state.pitch) > 1e-4 ||\r
          Math.abs(state.yawVelocity) + Math.abs(state.pitchVelocity) > 1e-4;\r
\r
        if (\r
          state.pressAt >= 0 &&\r
          state.pressPoint &&\r
          s.holdToGather &&\r
          !reduced &&\r
          state.clock - state.pressAt > 0.18\r
        ) {\r
          if (!state.holding) {\r
            state.holding = true;\r
            updateCamera(s);\r
            rayAt(state.pressPoint[0], state.pressPoint[1]);\r
            const travelTo =\r
              FOCUS / Math.max(ray[0] * cam.forward[0] + ray[1] * cam.forward[1] + ray[2] * cam.forward[2], 0.2);\r
            state.gatherCenter = [\r
              cam.eye[0] + ray[0] * travelTo,\r
              cam.eye[1] + ray[1] * travelTo,\r
              cam.eye[2] + ray[2] * travelTo\r
            ];\r
            state.reach = 0;\r
          }\r
          state.hold = Math.min(1, state.hold + dt / 0.5);\r
          state.reach = Math.min(state.reach + dt * 0.5, 0.55);\r
          const reach = (0.22 + state.reach) / s.scale;\r
          for (const shard of state.shards) {\r
            if (shard.joined || shard.level > 2) continue;\r
            const gx = shard.position[0] - state.gatherCenter[0];\r
            const gy = shard.position[1] - state.gatherCenter[1];\r
            if (gx * gx + gy * gy < reach * reach) shard.joined = true;\r
          }\r
        } else if (state.hold > 0) {\r
          state.hold = Math.max(0, state.hold - dt / 0.3);\r
          if (state.hold === 0) {\r
            for (const shard of state.shards) shard.joined = false;\r
          }\r
        }\r
\r
        for (const ring of state.rings) ring.age += dt;\r
        state.rings = state.rings.filter(ring => ring.age < RING_SECONDS);\r
        if (moving) state.markerDrift += dt * s.speed * 0.045;\r
\r
        const flashing = state.shards.some(\r
          shard => shard.flash > 0.01 || Math.abs(shard.tiltVelocity) > 0.01 || Math.abs(shard.tilt) > 0.01\r
        );\r
        const transient =\r
          settling ||\r
          leaning ||\r
          flashing ||\r
          state.presence > 0.002 ||\r
          state.rings.length > 0 ||\r
          state.hold > 0 ||\r
          (s.intro && !reduced && state.clock - state.introAt < INTRO_SECONDS + 0.5);\r
        if (state.seen !== s || transient || moving) state.quiet = 0;\r
        else state.quiet += 1;\r
        state.seen = s;\r
        if (state.quiet > 30) return;\r
        resize();\r
        render(s, dt, reduced);\r
      };\r
\r
      const local = event => {\r
        const rect = container.getBoundingClientRect();\r
        return {\r
          point: [\r
            (event.clientX - rect.left) / Math.max(rect.width, 1),\r
            (event.clientY - rect.top) / Math.max(rect.height, 1)\r
          ],\r
          inside:\r
            event.clientX >= rect.left &&\r
            event.clientX <= rect.right &&\r
            event.clientY >= rect.top &&\r
            event.clientY <= rect.bottom\r
        };\r
      };\r
\r
      const onMove = event => {\r
        const hit = local(event);\r
        state.inside = hit.inside;\r
        if (hit.inside) state.pointer = hit.point;\r
      };\r
\r
      const onLeave = () => {\r
        state.inside = false;\r
      };\r
\r
      const onDown = event => {\r
        const s = settingsRef.current;\r
        if (event.button !== 0 || prefersReduced() || !s.mouseInteraction) return;\r
        if (\r
          event.target instanceof Element &&\r
          event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
        )\r
          return;\r
        const hit = local(event);\r
        if (!hit.inside) return;\r
        state.pointer = hit.point;\r
        state.pressAt = state.clock;\r
        state.pressPoint = hit.point;\r
      };\r
\r
      const onUp = () => {\r
        const s = settingsRef.current;\r
        if (state.pressAt < 0) return;\r
        if (!state.holding && s.pulseOnClick && state.pressPoint) {\r
          const aspect = output.size[0] / Math.max(output.size[1], 1);\r
          state.rings.push({\r
            x: (state.pressPoint[0] * 2 - 1) * aspect,\r
            y: 1 - state.pressPoint[1] * 2,\r
            age: 0\r
          });\r
          if (state.rings.length > MAX_RINGS) state.rings.shift();\r
        }\r
        if (state.holding) {\r
          for (const shard of state.shards) {\r
            if (shard.joined) shard.tiltVelocity += 9 * shard.sign;\r
          }\r
        }\r
        state.pressAt = -1;\r
        state.holding = false;\r
      };\r
\r
      window.addEventListener('pointermove', onMove, { passive: true });\r
      window.addEventListener('pointerdown', onDown);\r
      window.addEventListener('pointerup', onUp);\r
      window.addEventListener('pointercancel', onUp);\r
      document.documentElement.addEventListener('pointerleave', onLeave);\r
      cleanups.push(() => {\r
        window.removeEventListener('pointermove', onMove);\r
        window.removeEventListener('pointerdown', onDown);\r
        window.removeEventListener('pointerup', onUp);\r
        window.removeEventListener('pointercancel', onUp);\r
        document.documentElement.removeEventListener('pointerleave', onLeave);\r
      });\r
\r
      const visibility = new IntersectionObserver(entries => {\r
        state.visible = entries.some(entry => entry.isIntersecting);\r
      });\r
      visibility.observe(container);\r
      cleanups.push(() => visibility.disconnect());\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    start().catch(fail);\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      cleanups.forEach(cleanup => cleanup());\r
      gpu?.dispose();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
import { draw, effect, frame, init, sampler, storage, surface, target, uniforms } from 'vgpu';\r
import './AeroShards.css';\r
\r
export interface AeroShardsProps {\r
  shardColor?: string;\r
  accentColor?: string;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  placement?: 'full' | 'left' | 'right' | 'center';\r
  material?: 'glass' | 'chrome';\r
  count?: number;\r
  shardSize?: number;\r
  spread?: number;\r
  twist?: number;\r
  billow?: number;\r
  speed?: number;\r
  scale?: number;\r
  depthOfField?: number;\r
  glow?: number;\r
  grain?: number;\r
  vignette?: number;\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  markers?: 'plus' | 'dots' | 'none';\r
  pulseOnClick?: boolean;\r
  holdToGather?: boolean;\r
  parallax?: number;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
  onError?: (error: Error) => void;\r
}\r
\r
type RGB = [number, number, number];\r
\r
interface Shard {\r
  level: number;\r
  phase: number;\r
  lane: number;\r
  layer: number;\r
  size: number;\r
  shape: number[];\r
  sides: number;\r
  thickness: number;\r
  yaw: number;\r
  bank: number;\r
  pitch: number;\r
  tint: number;\r
  drift: number[];\r
  rate: number[];\r
  flutter: number[];\r
  arrive: number;\r
  sign: number;\r
  slot: number[];\r
  offset: number[];\r
  velocity: number[];\r
  tilt: number;\r
  tiltVelocity: number;\r
  flash: number;\r
  gather: number;\r
  joined: boolean;\r
  position: number[];\r
  s: number;\r
}\r
\r
interface Ring {\r
  x: number;\r
  y: number;\r
  age: number;\r
}\r
\r
const ROOT = 'aero-shards';\r
const CANVAS = 'aero-shards-canvas';\r
\r
const PLACEMENTS = ['full', 'left', 'right', 'center'];\r
const MATERIALS: Record<string, number[]> = {\r
  glass: [0, 0, 0, 0],\r
  chrome: [1, 0, 0, 0]\r
};\r
const FLOATS = 24;\r
const SAMPLES = 160;\r
const CAMERA = 4;\r
const FOCUS = 3.1;\r
const SHARD_FOCUS = 2.75;\r
const LAYER_SCALES = [1, 0.5];\r
const MAX_BANK = 1.0;\r
const DEPTHS = [2.7, 3.9, 5.6, 8.1, 11.6];\r
const SHARE = [0.26, 0.23, 0.2, 0.17, 0.14];\r
const GROWTH = [1, 1.3, 1.8, 2.6, 3.6];\r
const FADE = [1, 0.8, 0.52, 0.32, 0.2];\r
const LEVELS = DEPTHS.length;\r
const INTRO_SECONDS = 3.4;\r
const MARKER_STYLES: Record<string, number> = { plus: 0, dots: 1 };\r
const MARKER_FLOATS = 8;\r
const MARKER_PHASES = [\r
  [0.37, 0.61],\r
  [0.83, 0.12],\r
  [0.21, 0.88],\r
  [0.66, 0.44],\r
  [0.05, 0.27]\r
];\r
const MAX_RINGS = 4;\r
const RING_SECONDS = 2.6;\r
const BLOOM_LEVELS = 4;\r
const FULL_SLOPES = [\r
  [0.2, -0.78],\r
  [-0.72, 0.02],\r
  [0.58, -0.06],\r
  [-0.24, 0.62],\r
  [0.8, 0.3]\r
];\r
const SIDE_OFFSETS = [0.84, 0.62, 0.44, 0.28, 0.14];\r
const RING_SIZES = [\r
  [0.98, 0.78],\r
  [0.9, 0.7],\r
  [0.84, 0.64],\r
  [0.8, 0.6],\r
  [0.76, 0.56]\r
];\r
const TAU = Math.PI * 2;\r
\r
const SHARD_SHADER = \`\r
struct Frame {\r
  view: vec4f,\r
  eye: vec4f,\r
  forward: vec4f,\r
  right: vec4f,\r
  up: vec4f,\r
  shard: vec4f,\r
  accent: vec4f,\r
  marker: vec4f,\r
  surface: vec4f,\r
}\r
\r
struct Layer {\r
  view: vec4f,\r
  look: vec4f,\r
}\r
\r
struct VertexOut {\r
  @builtin(position) position: vec4f,\r
  @location(0) @interpolate(flat, first) center: vec4f,\r
  @location(1) @interpolate(flat, first) axis: vec4f,\r
  @location(2) @interpolate(flat, first) normal: vec4f,\r
  @location(3) @interpolate(flat, first) p01: vec4f,\r
  @location(4) @interpolate(flat, first) p23: vec4f,\r
  @location(5) @interpolate(flat, first) p4: vec4f,\r
  @location(6) @interpolate(flat, first) topA: vec4f,\r
  @location(7) @interpolate(flat, first) topB: vec4f,\r
  @location(8) @interpolate(flat, first) topC: vec4f,\r
  @location(9) @interpolate(flat, first) bottomA: vec4f,\r
  @location(10) @interpolate(flat, first) bottomB: vec4f,\r
  @location(11) @interpolate(flat, first) bottomC: vec4f,\r
}\r
\r
struct FragmentOut {\r
  @location(0) color: vec4f,\r
  @builtin(frag_depth) depth: f32,\r
}\r
\r
@group(0) @binding(0) var<uniform> scene: Frame;\r
@group(0) @binding(1) var<storage, read> shards: array<vec4f>;\r
@group(0) @binding(2) var<uniform> layerInfo: Layer;\r
\r
fn project(world: vec3f) -> vec3f {\r
  let offset = world - scene.eye.xyz;\r
  let depth = max(dot(offset, scene.forward.xyz), 0.05);\r
  let x = dot(offset, scene.right.xyz);\r
  let y = dot(offset, scene.up.xyz);\r
  return vec3f(layerInfo.view.x * 0.5 + x * layerInfo.view.z / depth, layerInfo.view.y * 0.5 - y * layerInfo.view.z / depth, depth);\r
}\r
\r
@vertex\r
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> VertexOut {\r
  let index = instance * 6u;\r
  let a = shards[index];\r
  let b = shards[index + 1u];\r
  let c = shards[index + 2u];\r
  let d = shards[index + 3u];\r
  let e = shards[index + 4u];\r
  let f = shards[index + 5u];\r
  let center = a.xyz;\r
  let size = a.w;\r
  let axis = normalize(b.xyz);\r
  let normal = normalize(c.xyz);\r
  let side = normalize(cross(normal, axis));\r
\r
  var out: VertexOut;\r
  let middle = project(center);\r
  if (middle.z < 0.35 || size <= 0.0) {\r
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);\r
    return out;\r
  }\r
\r
  let count = i32(f.z);\r
  let points = array<vec2f, 5>(d.xy, d.zw, e.xy, e.zw, f.xy);\r
  var low = vec2f(1e9);\r
  var high = vec2f(-1e9);\r
  var tops = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));\r
  var bottoms = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));\r
  for (var i = 0; i < 5; i += 1) {\r
    let corner = points[min(i, count - 1)];\r
    let onPlate = center + (axis * corner.x + side * corner.y) * size;\r
    let top = project(onPlate + normal * b.w * size);\r
    let bottom = project(onPlate - normal * b.w * size);\r
    tops[i] = top.xy;\r
    bottoms[i] = bottom.xy;\r
    low = min(low, min(top.xy, bottom.xy));\r
    high = max(high, max(top.xy, bottom.xy));\r
  }\r
  low -= vec2f(2.0);\r
  high += vec2f(2.0);\r
  let corners = array<vec2f, 6>(vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0), vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0));\r
  let pixel = mix(low, high, corners[vertexIndex]);\r
  out.position = vec4f(pixel.x / layerInfo.view.x * 2.0 - 1.0, 1.0 - pixel.y / layerInfo.view.y * 2.0, 0.5, 1.0);\r
  out.center = a;\r
  out.axis = vec4f(axis, b.w);\r
  out.normal = vec4f(normal, c.w);\r
  out.p01 = d;\r
  out.p23 = e;\r
  out.p4 = f;\r
  out.topA = vec4f(tops[0], tops[1]);\r
  out.topB = vec4f(tops[2], tops[3]);\r
  out.topC = vec4f(tops[4], 0.0, 0.0);\r
  out.bottomA = vec4f(bottoms[0], bottoms[1]);\r
  out.bottomB = vec4f(bottoms[2], bottoms[3]);\r
  out.bottomC = vec4f(bottoms[4], 0.0, 0.0);\r
  return out;\r
}\r
\r
fn cross2(a: vec2f, b: vec2f) -> f32 {\r
  return a.x * b.y - a.y * b.x;\r
}\r
\r
fn outlineCoverage(p: vec2f, points: array<vec2f, 5>, count: i32) -> f32 {\r
  var area = 0.0;\r
  for (var i = 0; i < 5; i += 1) {\r
    if (i < count) {\r
      area += cross2(points[i], points[(i + 1) % count]);\r
    }\r
  }\r
  let orient = select(-1.0, 1.0, area > 0.0);\r
  var distance = -1e9;\r
  for (var i = 0; i < 5; i += 1) {\r
    if (i < count) {\r
      let a = points[i];\r
      let edge = points[(i + 1) % count] - a;\r
      let span = length(edge);\r
      if (span > 1e-4) {\r
        let n = vec2f(edge.y, -edge.x) * (orient / span);\r
        distance = max(distance, dot(p - a, n));\r
      }\r
    }\r
  }\r
  return clamp(0.5 - distance, 0.0, 1.0);\r
}\r
\r
struct Prism {\r
  points: array<vec2f, 5>,\r
  count: i32,\r
  half: f32,\r
}\r
\r
struct Hit {\r
  near: f32,\r
  far: f32,\r
  normal: vec3f,\r
}\r
\r
fn plane(prism: Prism, k: i32) -> vec4f {\r
  if (k == 0) { return vec4f(0.0, 0.0, 1.0, prism.half); }\r
  if (k == 1) { return vec4f(0.0, 0.0, -1.0, prism.half); }\r
  let a = prism.points[k - 2];\r
  let b = prism.points[(k - 1) % prism.count];\r
  let edge = b - a;\r
  let n = normalize(vec2f(edge.y, -edge.x));\r
  return vec4f(n, 0.0, dot(n, a));\r
}\r
\r
fn trace(prism: Prism, ro: vec3f, rd: vec3f) -> Hit {\r
  var hit: Hit;\r
  hit.near = -1e9;\r
  hit.far = 1e9;\r
  hit.normal = vec3f(0.0, 0.0, 1.0);\r
  for (var k = 0; k < 7; k += 1) {\r
    if (k < prism.count + 2) {\r
      let p = plane(prism, k);\r
      let denom = dot(p.xyz, rd);\r
      let gap = p.w - dot(p.xyz, ro);\r
      if (abs(denom) < 1e-7) {\r
        if (gap < 0.0) { hit.far = -1e9; }\r
      } else {\r
        let t = gap / denom;\r
        if (denom < 0.0) {\r
          if (t > hit.near) {\r
            hit.near = t;\r
            hit.normal = p.xyz;\r
          }\r
        } else if (t < hit.far) {\r
          hit.far = t;\r
        }\r
      }\r
    }\r
  }\r
  return hit;\r
}\r
\r
fn exitFrom(prism: Prism, ro: vec3f, rd: vec3f) -> vec4f {\r
  var best = 1e9;\r
  var normal = vec3f(0.0, 0.0, -1.0);\r
  for (var k = 0; k < 7; k += 1) {\r
    if (k < prism.count + 2) {\r
      let p = plane(prism, k);\r
      let denom = dot(p.xyz, rd);\r
      if (denom > 1e-6) {\r
        let t = (p.w - dot(p.xyz, ro)) / denom;\r
        if (t < best) {\r
          best = t;\r
          normal = p.xyz;\r
        }\r
      }\r
    }\r
  }\r
  return vec4f(normal, max(best, 0.0));\r
}\r
\r
fn rectLight(r: vec3f, dir: vec3f, across: vec3f, extent: vec2f, soft: f32) -> f32 {\r
  let facing = dot(r, dir);\r
  if (facing <= 0.0) { return 0.0; }\r
  let up = cross(dir, across);\r
  let u = dot(r, across) / facing;\r
  let v = dot(r, up) / facing;\r
  let a = 1.0 - smoothstep(extent.x - soft, extent.x + soft, abs(u));\r
  let b = 1.0 - smoothstep(extent.y - soft, extent.y + soft, abs(v));\r
  return a * b;\r
}\r
\r
const KEY_DIR = vec3f(-0.28, 0.72, 0.64) / length(vec3f(-0.28, 0.72, 0.64));\r
const KEY_ACROSS = vec3f(0.92, 0.0, 0.4) / length(vec3f(0.92, 0.0, 0.4));\r
const LEFT_DIR = vec3f(-0.86, 0.12, 0.5) / length(vec3f(-0.86, 0.12, 0.5));\r
const LEFT_ACROSS = vec3f(0.5, 0.0, 0.86) / length(vec3f(0.5, 0.0, 0.86));\r
const RIM_DIR = vec3f(0.78, 0.22, -0.58) / length(vec3f(0.78, 0.22, -0.58));\r
const RIM_ACROSS = vec3f(0.6, 0.0, 0.8) / length(vec3f(0.6, 0.0, 0.8));\r
const TOP_DIR = vec3f(0.05, 0.94, -0.33) / length(vec3f(0.05, 0.94, -0.33));\r
const TOP_ACROSS = vec3f(1.0, 0.0, 0.0);\r
\r
fn lobe(r: vec3f, dir: vec3f, width: f32) -> f32 {\r
  return exp((dot(r, dir) - 1.0) / (width * width));\r
}\r
\r
fn studio(r: vec3f, soft: f32, accent: vec3f, ink: vec3f) -> vec3f {\r
  let sky = clamp(r.y * 0.5 + 0.5, 0.0, 1.0);\r
  var col = mix(ink * 0.03, ink * 0.12 + accent * 0.03, smoothstep(0.25, 0.95, sky));\r
  col += mix(ink, vec3f(1.0), 0.6) * lobe(r, KEY_DIR, 0.38) * 3.6;\r
  col += mix(accent, vec3f(1.0), 0.2) * lobe(r, RIM_DIR, 0.34) * 3.4;\r
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.12, 0.8), 0.08 + soft) * 3.2;\r
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, TOP_DIR, TOP_ACROSS, vec2f(0.9, 0.1), 0.08 + soft) * 2.6;\r
  return col;\r
}\r
\r
fn studioLight(r: vec3f, soft: f32, accent: vec3f) -> vec3f {\r
  let ground = vec3f(0.2, 0.2, 0.23);\r
  let skyTone = vec3f(0.97, 0.97, 0.99);\r
  var col = mix(ground, skyTone, smoothstep(-0.08 - soft, 0.16 + soft, r.y));\r
  col = mix(col, vec3f(0.55, 0.55, 0.6), lobe(r, vec3f(0.0, -1.0, 0.0), 0.5) * 0.4);\r
  col += vec3f(0.4) * rectLight(r, KEY_DIR, KEY_ACROSS, vec2f(0.46, 0.3), 0.07 + soft);\r
  col -= vec3f(0.55) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.1, 0.85), 0.05 + soft);\r
  col -= vec3f(0.45) * rectLight(r, RIM_DIR, RIM_ACROSS, vec2f(0.12, 0.9), 0.05 + soft);\r
  return clamp(col, vec3f(0.05), vec3f(1.2));\r
}\r
\r
fn schlick(cosine: f32, f0: f32) -> f32 {\r
  return f0 + (1.0 - f0) * pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);\r
}\r
\r
fn rayFor(pixel: vec2f) -> vec3f {\r
  let x = pixel.x - layerInfo.view.x * 0.5;\r
  let y = layerInfo.view.y * 0.5 - pixel.y;\r
  return normalize(scene.forward.xyz * layerInfo.view.z + scene.right.xyz * x + scene.up.xyz * y);\r
}\r
\r
struct Surface {\r
  coverage: f32,\r
  color: vec3f,\r
  alpha: f32,\r
  depth: f32,\r
}\r
\r
fn shade(pixel: vec2f, in: VertexOut) -> Surface {\r
  let center = in.center.xyz;\r
  let size = in.center.w;\r
  let axis = in.axis.xyz;\r
  let plateNormal = in.normal.xyz;\r
  let side = normalize(cross(plateNormal, axis));\r
  var prism: Prism;\r
  prism.points = array<vec2f, 5>(in.p01.xy, in.p01.zw, in.p23.xy, in.p23.zw, in.p4.xy);\r
  prism.count = i32(in.p4.z);\r
  prism.half = in.axis.w;\r
\r
  let eye = scene.eye.xyz;\r
  let toLocal = mat3x3f(axis.x, side.x, plateNormal.x, axis.y, side.y, plateNormal.y, axis.z, side.z, plateNormal.z);\r
  let fromLocal = mat3x3f(axis, side, plateNormal);\r
  let origin = toLocal * (eye - center) / size;\r
\r
  let rd = rayFor(pixel);\r
  let ray = toLocal * rd;\r
  let denom = dot(ray, vec3f(0.0, 0.0, 1.0));\r
  let flatT = -origin.z / select(denom, 1e-4, abs(denom) < 1e-4);\r
  let flatPoint = origin.xy + ray.xy * flatT;\r
  let footprint = max(length(fwidth(flatPoint)) * 0.7, 1e-4);\r
  let softBase = clamp(length(fwidth(reflect(rd, plateNormal))) * 0.5, 0.0, 0.5);\r
\r
  let primary = trace(prism, origin, ray);\r
  let tops = array<vec2f, 5>(in.topA.xy, in.topA.zw, in.topB.xy, in.topB.zw, in.topC.xy);\r
  let bottoms = array<vec2f, 5>(in.bottomA.xy, in.bottomA.zw, in.bottomB.xy, in.bottomB.zw, in.bottomC.xy);\r
  let coverage = max(outlineCoverage(pixel, tops, prism.count), outlineCoverage(pixel, bottoms, prism.count));\r
\r
  var surface: Surface;\r
  let facing = select(-1.0, 1.0, origin.z > 0.0);\r
  let capT = (facing * prism.half - origin.z) / select(ray.z, -1e-4 * facing, abs(ray.z) < 1e-4);\r
  let missed = primary.near > primary.far;\r
  let hitT = select(primary.near, capT, missed);\r
  let hitNormal = select(primary.normal, vec3f(0.0, 0.0, facing), missed);\r
  surface.coverage = select(0.0, coverage, hitT > 0.0);\r
  surface.color = vec3f(0.0);\r
  surface.alpha = 0.0;\r
  surface.depth = 1.0;\r
  if (surface.coverage <= 0.0) { return surface; }\r
  let mainRay = ray;\r
\r
  let local = origin + mainRay * hitT;\r
  let worldRay = fromLocal * mainRay;\r
  let viewDepth = max(hitT * size * dot(worldRay, scene.forward.xyz), 0.05);\r
  surface.depth = clamp(1.0 - 0.3 / viewDepth, 0.0, 1.0);\r
\r
  let radius = max(prism.half * 1.15, footprint * 2.5);\r
  var n = hitNormal;\r
  var bevel = 0.0;\r
  if (abs(n.z) > 0.5) {\r
    var gap = 1e9;\r
    for (var k = 2; k < 7; k += 1) {\r
      if (k < prism.count + 2) {\r
        let p = plane(prism, k);\r
        gap = min(gap, p.w - dot(p.xy, local.xy));\r
      }\r
    }\r
    var toward = vec2f(0.0);\r
    for (var k = 2; k < 7; k += 1) {\r
      if (k < prism.count + 2) {\r
        let p = plane(prism, k);\r
        let g = p.w - dot(p.xy, local.xy);\r
        toward += p.xy * exp(-(g - gap) / (radius * 0.35));\r
      }\r
    }\r
    toward = normalize(toward);\r
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);\r
    let angle = bevel * bevel * 0.7853982;\r
    n = normalize(n * cos(angle) + vec3f(toward, 0.0) * sin(angle));\r
  } else {\r
    let gap = prism.half - abs(local.z);\r
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);\r
    let angle = bevel * bevel * 0.7853982;\r
    n = normalize(n * cos(angle) + vec3f(0.0, 0.0, sign(local.z)) * sin(angle));\r
  }\r
  let bendRate = 1.8 / max(radius / footprint, 1.0);\r
  let normal = normalize(fromLocal * n);\r
  let view = -worldRay;\r
  let reflected = reflect(worldRay, normal);\r
  let soft = softBase + bendRate * smoothstep(0.0, 0.25, bevel) * 1.2 + clamp(footprint * 0.6, 0.0, 0.5);\r
  let ndv = clamp(dot(normal, view), 0.0, 1.0);\r
\r
  let accent = scene.accent.rgb;\r
  let base = scene.shard.rgb;\r
  let world = center + fromLocal * local * size;\r
  let height = clamp(0.5 + world.y * 0.45, 0.0, 1.0);\r
  let tone = mix(accent, base, height);\r
  let body = mix(tone, mix(base, accent, 0.5), in.normal.w * 0.3);\r
  let mode = scene.surface.x;\r
  let lightMode = scene.up.w > 0.5;\r
  let wrap = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);\r
\r
  var color = vec3f(0.0);\r
  var alpha = 1.0;\r
  let chrome = mode > 0.5;\r
  if (lightMode) {\r
    let env = studioLight(reflected, soft, accent);\r
    if (chrome) {\r
      color = env * mix(body, vec3f(1.0), 0.6);\r
    } else {\r
      let fresnel = schlick(ndv, 0.05);\r
      let diffuse = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);\r
      alpha = clamp(0.32 + fresnel * 0.5 + (1.0 - abs(n.z)) * 0.5, 0.0, 1.0);\r
      color = mix(body, vec3f(1.0), 0.15) * (0.5 + 0.4 * diffuse) * alpha + (env - vec3f(0.78)) * fresnel * 0.8;\r
    }\r
  } else if (chrome) {\r
    let env = studio(reflected, soft, accent, body);\r
    color = env * mix(body, vec3f(1.0), 0.55) * 0.9 + body * 0.02;\r
  } else {\r
    let fresnel = schlick(ndv, 0.04);\r
    let env = studio(reflected, soft, accent, body);\r
    var light = vec3f(0.0);\r
    var cursor = local;\r
    var direction = toLocal * refract(worldRay, normal, 1.0 / 1.5);\r
    var travelled = 0.0;\r
    var carry = 1.0 - fresnel;\r
    var through = 0.0;\r
    for (var bounce = 0; bounce < 3; bounce += 1) {\r
      let outlet = exitFrom(prism, cursor, direction);\r
      travelled += outlet.w;\r
      cursor = cursor + direction * outlet.w;\r
      let outward = outlet.xyz;\r
      let escaped = refract(direction, -outward, 1.5);\r
      if (dot(escaped, escaped) > 0.0) {\r
        let leave = schlick(dot(direction, outward), 0.04);\r
        let worldOut = normalize(fromLocal * escaped);\r
        let absorb = exp(-(vec3f(1.0) - body) * travelled * size * 22.0);\r
        let straight = smoothstep(0.97, 0.999, dot(worldOut, worldRay));\r
        let energy = carry * (1.0 - leave);\r
        light += studio(worldOut, soft * 2.0 + 0.04, accent, body) * absorb * energy * (1.0 - straight) * 2.0;\r
        through += energy * straight * (absorb.r + absorb.g + absorb.b) / 3.0;\r
        carry *= leave;\r
      }\r
      direction = reflect(direction, outward);\r
    }\r
    let edge = max(pow(1.0 - abs(n.z), 1.2), bevel * bevel * 0.85);\r
    let glow = mix(mix(body, accent, 0.35), vec3f(1.0), 0.28) * edge * (0.35 + 0.45 * wrap);\r
    color = env * fresnel * 0.85 + light * (1.0 - smoothstep(0.0, 0.6, bevel)) + body * 0.02 + glow;\r
    alpha = clamp(1.0 - through + edge * 0.25, 0.0, 1.0);\r
  }\r
\r
  color *= select(1.3, 1.0, lightMode);\r
  let haze = smoothstep(3.5, 12.0, viewDepth) * layerInfo.look.x;\r
  let hazeColor = select(mix(base, accent, 0.5) * 0.3, mix(base, vec3f(1.0), 0.72), lightMode);\r
  color = mix(color, hazeColor * alpha + color * 0.3, haze);\r
  let flash = in.p4.w;\r
  color += mix(accent, vec3f(1.0), 0.35) * flash * select(0.5, 0.0, lightMode) * max(alpha, 0.35);\r
  alpha = max(alpha, flash * 0.45 * select(1.0, 0.0, lightMode));\r
  surface.color = color;\r
  surface.alpha = alpha;\r
  return surface;\r
}\r
\r
@fragment\r
fn fs_solid(in: VertexOut) -> FragmentOut {\r
  let surface = shade(in.position.xy, in);\r
  if (surface.coverage < 0.999 || surface.alpha < 0.6) { discard; }\r
  var out: FragmentOut;\r
  out.color = vec4f(surface.color, surface.alpha);\r
  out.depth = surface.depth;\r
  return out;\r
}\r
\r
@fragment\r
fn fs_edge(in: VertexOut) -> FragmentOut {\r
  let surface = shade(in.position.xy, in);\r
  if (surface.coverage <= 0.001 || (surface.coverage >= 0.9996 && surface.alpha >= 0.62)) { discard; }\r
  var out: FragmentOut;\r
  out.color = vec4f(surface.color, surface.alpha) * surface.coverage;\r
  out.depth = surface.depth;\r
  return out;\r
}\r
\`;\r
\r
const LAYER_BLUR_SHADER = \`\r
struct Spread { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> spreadInfo: Spread;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let sigma = max(spreadInfo.texel.z, 0.3);\r
  let reach = min(i32(ceil(sigma * 2.6)), 20);\r
  var total = textureSampleLevel(source, linearSampler, uv, 0.0);\r
  var weight = 1.0;\r
  for (var i = 1; i <= reach; i += 1) {\r
    let w = exp(-f32(i * i) / (2.0 * sigma * sigma));\r
    let o = spreadInfo.texel.xy * f32(i);\r
    total += (textureSampleLevel(source, linearSampler, uv + o, 0.0) + textureSampleLevel(source, linearSampler, uv - o, 0.0)) * w;\r
    weight += 2.0 * w;\r
  }\r
  return total / weight;\r
}\r
\`;\r
\r
const SHADOW_SHADER = \`\r
struct Shade {\r
  info: vec4f,\r
  more: vec4f,\r
}\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var depthMap: texture_depth_2d;\r
@group(0) @binding(2) var<uniform> shadeInfo: Shade;\r
\r
@fragment\r
fn fs_main(@builtin(position) pixel: vec4f) -> @location(0) vec4f {\r
  let bounds = vec2i(textureDimensions(source)) - vec2i(1);\r
  let here = vec2i(pixel.xy);\r
  let color = textureLoad(source, here, 0);\r
  if (color.a <= 0.002 || shadeInfo.info.z <= 0.0) { return color; }\r
  let depth = textureLoad(depthMap, here, 0);\r
  let east = textureLoad(depthMap, clamp(here + vec2i(1, 0), vec2i(0), bounds), 0);\r
  let west = textureLoad(depthMap, clamp(here - vec2i(1, 0), vec2i(0), bounds), 0);\r
  let south = textureLoad(depthMap, clamp(here + vec2i(0, 1), vec2i(0), bounds), 0);\r
  let north = textureLoad(depthMap, clamp(here - vec2i(0, 1), vec2i(0), bounds), 0);\r
  let limit = shadeInfo.more.x * 0.5;\r
  let slopeX = clamp(select(east - depth, depth - west, abs(depth - west) < abs(east - depth)), -limit, limit);\r
  let slopeY = clamp(select(south - depth, depth - north, abs(depth - north) < abs(south - depth)), -limit, limit);\r
  var occlusion = 0.0;\r
  for (var i = 1; i <= 12; i += 1) {\r
    let offset = -shadeInfo.info.xy * f32(i);\r
    let probe = clamp(vec2i(pixel.xy + offset), vec2i(0), bounds);\r
    let other = textureLoad(depthMap, probe, 0);\r
    let expected = depth + slopeX * offset.x + slopeY * offset.y;\r
    let closer = smoothstep(shadeInfo.more.x * 0.6, shadeInfo.more.x * 2.4, expected - other);\r
    let reach = 1.0 - f32(i - 1) / 12.0;\r
    occlusion = max(occlusion, closer * reach * reach);\r
  }\r
  return vec4f(color.rgb * (1.0 - occlusion * shadeInfo.info.z), color.a);\r
}\r
\`;\r
\r
const COMPOSITE_SHADER = \`\r
struct Blend { info: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> mixInfo: Blend;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  return textureSampleLevel(source, linearSampler, uv, 0.0) * mixInfo.info.x;\r
}\r
\`;\r
\r
const MARKER_SHADER = \`\r
struct Frame {\r
  view: vec4f,\r
  eye: vec4f,\r
  forward: vec4f,\r
  right: vec4f,\r
  up: vec4f,\r
  shard: vec4f,\r
  accent: vec4f,\r
  marker: vec4f,\r
  surface: vec4f,\r
}\r
\r
struct MarkerOut {\r
  @builtin(position) position: vec4f,\r
  @location(0) local: vec2f,\r
  @location(1) @interpolate(flat, first) shape: vec4f,\r
  @location(2) @interpolate(flat, first) light: vec4f,\r
}\r
\r
@group(0) @binding(0) var<uniform> scene: Frame;\r
@group(0) @binding(1) var<storage, read> markers: array<vec4f>;\r
\r
@vertex\r
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> MarkerOut {\r
  let a = markers[instance * 2u];\r
  let b = markers[instance * 2u + 1u];\r
  let offset = a.xyz - scene.eye.xyz;\r
  let depth = max(dot(offset, scene.forward.xyz), 0.05);\r
  let center = vec2f(\r
    scene.view.x * 0.5 + dot(offset, scene.right.xyz) * scene.view.z / depth,\r
    scene.view.y * 0.5 - dot(offset, scene.up.xyz) * scene.view.z / depth,\r
  );\r
  let pixel = scene.marker.y;\r
  let size = scene.marker.z * clamp(sqrt(scene.marker.w / depth), 0.6, 1.3) * b.z;\r
  let blur = min(scene.forward.w * abs(1.0 - scene.eye.w / depth), scene.right.w) * 0.18;\r
  let frame = b.y;\r
  let reach = select(size, size * 2.6, frame > 0.001) + blur + 1.5 * pixel;\r
  let corners = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0));\r
  let corner = corners[vertexIndex % 6u] * reach;\r
  var out: MarkerOut;\r
  if (depth < 0.35 || a.w <= 0.002) {\r
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);\r
    return out;\r
  }\r
  let at = center + corner;\r
  out.position = vec4f(at.x / scene.view.x * 2.0 - 1.0, 1.0 - at.y / scene.view.y * 2.0, 0.5, 1.0);\r
  out.local = corner;\r
  out.shape = vec4f(size, blur, frame, pixel);\r
  out.light = vec4f(b.x, a.w, 0.0, 0.0);\r
  return out;\r
}\r
\r
fn bar(value: f32, edge: f32, soft: f32) -> f32 {\r
  return clamp((edge - value) / soft + 0.5, 0.0, 1.0);\r
}\r
\r
@fragment\r
fn fs_main(in: MarkerOut) -> @location(0) vec4f {\r
  let size = in.shape.x;\r
  let blur = in.shape.y;\r
  let frame = in.shape.z;\r
  let pixel = in.shape.w;\r
  let q = abs(in.local);\r
  let soft = 1.0 + blur;\r
  let thick = 0.6 * pixel + blur * 0.5;\r
  let energy = (0.6 * pixel) / thick;\r
  var cover = 0.0;\r
  if (scene.marker.x < 0.5) {\r
    let across = bar(q.x, size, soft) * bar(q.y, thick, soft);\r
    let down = bar(q.y, size, soft) * bar(q.x, thick, soft);\r
    cover = max(across, down) * energy;\r
  } else {\r
    cover = bar(length(in.local), size * 0.42 + blur * 0.3, soft) * mix(1.0, energy, 0.6);\r
  }\r
  if (frame > 0.001) {\r
    let edge = size * 2.3;\r
    let span = edge * 0.45;\r
    let line = 0.5 * pixel;\r
    let sides = bar(abs(q.x - edge), line, 1.0) * bar(edge - span - q.y, 0.0, 1.0) * bar(q.y - edge - line, 0.0, 1.0);\r
    let caps = bar(abs(q.y - edge), line, 1.0) * bar(edge - span - q.x, 0.0, 1.0) * bar(q.x - edge - line, 0.0, 1.0);\r
    cover = max(cover, max(sides, caps) * frame * 0.85);\r
  }\r
  let glow = in.light.x;\r
  let fade = in.light.y;\r
  let tint = mix(scene.shard.rgb, scene.accent.rgb, 0.4);\r
  if (scene.up.w > 0.5) {\r
    let ink = (1.0 - exp(-glow * 1.6)) * 0.85 * cover * fade;\r
    return vec4f(mix(tint, scene.accent.rgb, 0.5) * 0.55 * ink, ink);\r
  }\r
  let light = cover * glow * fade;\r
  let color = (1.0 - exp(-mix(tint, vec3f(1.0), 0.35) * light * 1.6)) * 1.4;\r
  return vec4f(color, max(max(color.r, color.g), color.b) * 0.8);\r
}\r
\`;\r
\r
const PREFILTER_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
fn bright(uv: vec2f) -> vec3f {\r
  let color = textureSampleLevel(source, linearSampler, uv, 0.0).rgb;\r
  let peak = max(max(color.r, color.g), color.b);\r
  return color * smoothstep(bloom.texel.z, bloom.texel.z + bloom.texel.w, peak);\r
}\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let o = bloom.texel.xy;\r
  let total = bright(uv + vec2f(o.x, o.y)) + bright(uv + vec2f(-o.x, o.y)) + bright(uv + vec2f(o.x, -o.y)) + bright(uv - o);\r
  return vec4f(total * 0.25, 0.0);\r
}\r
\`;\r
\r
const DOWNSAMPLE_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let o = bloom.texel.xy;\r
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.25;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(-o.x, o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, -o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv - o, 0.0) * 0.1875;\r
  return color;\r
}\r
\`;\r
\r
const BLUR_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let delta = bloom.texel.xy;\r
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.181862;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 1.423135, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 1.423135, 0.0)) * 0.284316;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 3.326702, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 3.326702, 0.0)) * 0.106598;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 5.242989, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 5.242989, 0.0)) * 0.018156;\r
  return color;\r
}\r
\`;\r
\r
const FINISH_SHADER = \`\r
struct Finish {\r
  info: vec4f,\r
  paper: vec4f,\r
  mode: vec4f,\r
}\r
@group(0) @binding(0) var sceneTexture: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var bloom0: texture_2d<f32>;\r
@group(0) @binding(3) var bloom1: texture_2d<f32>;\r
@group(0) @binding(4) var bloom2: texture_2d<f32>;\r
@group(0) @binding(5) var bloom3: texture_2d<f32>;\r
@group(0) @binding(6) var<uniform> finish: Finish;\r
\r
fn hash12(value: vec2f) -> f32 {\r
  let p = fract(value * vec2f(0.1031, 0.1030));\r
  let mixed = p + dot(p, p.yx + 33.33);\r
  return fract((mixed.x + mixed.y) * mixed.x);\r
}\r
\r
fn smootherstep(x: f32) -> f32 {\r
  let t = clamp(x, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f, @builtin(position) pixel: vec4f) -> @location(0) vec4f {\r
  let scene = textureLoad(sceneTexture, vec2i(pixel.xy), 0);\r
  let alpha = clamp(scene.a, 0.0, 1.0);\r
  let noise = hash12(floor(pixel.xy) + vec2f(finish.info.y, finish.info.y * 1.618)) - 0.5;\r
  let grain = 1.0 + noise * finish.info.x;\r
  var rgb = vec3f(0.0);\r
  var a = alpha;\r
  if (finish.mode.x > 0.5) {\r
    rgb = clamp(scene.rgb, vec3f(0.0), vec3f(alpha)) * grain;\r
  } else {\r
    var halo = textureSampleLevel(bloom0, linearSampler, uv, 0.0).rgb * 0.4;\r
    halo += textureSampleLevel(bloom1, linearSampler, uv, 0.0).rgb * 0.3;\r
    halo += textureSampleLevel(bloom2, linearSampler, uv, 0.0).rgb * 0.2;\r
    halo += textureSampleLevel(bloom3, linearSampler, uv, 0.0).rgb * 0.1;\r
    halo = halo * finish.info.z;\r
    rgb = (1.0 - exp(-max(scene.rgb, vec3f(0.0)) * finish.info.w)) * grain + halo / (1.0 + halo);\r
    a = max(alpha, max(max(rgb.r, rgb.g), rgb.b));\r
  }\r
  let vignette = finish.mode.y;\r
  if (vignette > 0.0) {\r
    let size = vec2f(textureDimensions(sceneTexture));\r
    let reach = max(vignette * 0.5 * min(size.x, size.y), 1.0);\r
    let fromEdge = min(pixel.xy, size - pixel.xy);\r
    let mask = smootherstep(fromEdge.x / reach) * smootherstep(fromEdge.y / reach);\r
    rgb *= mask;\r
    a *= mask;\r
  }\r
  rgb = clamp(rgb, vec3f(0.0), vec3f(max(a, 0.0)));\r
  if (finish.paper.a > 0.5) {\r
    return vec4f(finish.paper.rgb * (1.0 - a) + rgb, 1.0);\r
  }\r
  return vec4f(rgb, a);\r
}\r
\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smoother = (x: number) => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
let probe: CanvasRenderingContext2D | null = null;\r
\r
const parseColor = (value: string, fallback: RGB | null): RGB | null => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
const latticeHash = (a: number, b: number, c: number, d: number) => {\r
  let h = Math.imul(a + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);\r
  h ^= Math.imul(c + 0x27d4eb2f, 0x165667b1) ^ Math.imul(d + 0x7f4a7c15, 0x9e3779b1);\r
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);\r
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;\r
};\r
\r
const random = (seed: number) => () => {\r
  seed = (seed + 0x6d2b79f5) | 0;\r
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);\r
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
};\r
\r
const ribbonPoint = (placement: number, level: number, s: number, aspect: number, out: number[]) => {\r
  let u;\r
  let v;\r
  let d;\r
  if (placement === 0) {\r
    u = -1.32 + 2.64 * s;\r
    const slope = FULL_SLOPES[level];\r
    v =\r
      slope[0] +\r
      (slope[1] - slope[0]) * s +\r
      0.1 * Math.sin(s * TAU * 0.7 + level * 2.3) +\r
      0.045 * Math.sin(s * TAU * 1.9 + level);\r
    d = DEPTHS[level] + 0.35 * Math.sin(s * Math.PI * 1.4 + level * 1.9);\r
  } else if (placement === 3) {\r
    const angle = s * TAU + level * 0.9 + Math.PI * 0.5;\r
    const size = RING_SIZES[level];\r
    u = Math.cos(angle) * size[0];\r
    v = Math.sin(angle) * size[1] - 0.02;\r
    d = DEPTHS[level] * 1.1 - Math.sin(angle) * (0.5 + level * 0.25);\r
  } else {\r
    const mirror = placement === 1 ? -1 : 1;\r
    v = 1.32 - 2.64 * s;\r
    u =\r
      mirror *\r
      (SIDE_OFFSETS[level] +\r
        0.1 * Math.sin(s * TAU * 0.6 + level * 1.3) +\r
        0.03 * Math.sin(s * TAU * 2.1 + level) -\r
        0.08 * (1 - s));\r
    d = DEPTHS[level] + 0.3 * Math.sin(s * Math.PI * 1.2 + level);\r
  }\r
  out[0] = (u * aspect * d) / CAMERA;\r
  out[1] = (v * d) / CAMERA;\r
  out[2] = CAMERA - d;\r
  return out;\r
};\r
\r
const createShards = (count: number, seed: number): Shard[] => {\r
  const next = random(seed);\r
  const shards: Shard[] = [];\r
  let made = 0;\r
  for (let level = 0; level < LEVELS; level += 1) {\r
    const amount = level === LEVELS - 1 ? count - made : Math.round(count * SHARE[level]);\r
    made += amount;\r
    for (let index = 0; index < amount; index += 1) {\r
      const flat = next() * 2 - 1;\r
      const family = next();\r
      const outline = [];\r
      if (family < 0.55) {\r
        const spread = 0.17 + next() * 0.15;\r
        outline.push([1, (next() - 0.5) * 0.08]);\r
        outline.push([-0.5 - next() * 0.25, spread * (0.8 + next() * 0.4)]);\r
        outline.push([-0.5 - next() * 0.25, -spread * (0.8 + next() * 0.4)]);\r
      } else if (family < 0.8) {\r
        const spread = 0.2 + next() * 0.14;\r
        outline.push([1, 0]);\r
        outline.push([(next() - 0.3) * 0.5, spread]);\r
        outline.push([-0.55 - next() * 0.2, (next() - 0.5) * 0.1]);\r
        outline.push([(next() - 0.3) * 0.5, -spread * (0.8 + next() * 0.4)]);\r
      } else {\r
        const sides = next() < 0.5 ? 4 : 5;\r
        const stretch = 0.4 + next() * 0.3;\r
        const turn = next() * TAU;\r
        for (let corner = 0; corner < sides; corner += 1) {\r
          const angle = turn + ((corner + (next() - 0.5) * 0.6) * TAU) / sides;\r
          outline.push([Math.cos(angle), Math.sin(angle) * stretch]);\r
        }\r
      }\r
      const sides = outline.length;\r
      let mx = 0;\r
      let my = 0;\r
      for (const point of outline) {\r
        mx += point[0] / sides;\r
        my += point[1] / sides;\r
      }\r
      const shape = [];\r
      for (let corner = 0; corner < 5; corner += 1) {\r
        const point = outline[Math.min(corner, sides - 1)];\r
        shape.push(point[0] - mx, point[1] - my);\r
      }\r
      shards.push({\r
        level,\r
        phase: (index + next()) / Math.max(amount, 1),\r
        lane: Math.sign(flat) * Math.pow(Math.abs(flat), 0.85),\r
        layer: Math.sqrt(-2 * Math.log(Math.max(next(), 1e-6))) * Math.cos(TAU * next()),\r
        size: 0.6 + next() * next() * 1.25,\r
        shape,\r
        sides,\r
        thickness: 0.06 + next() * 0.04,\r
        yaw: (next() - 0.5) * 0.36,\r
        bank: (next() - 0.5) * 0.5,\r
        pitch: (next() - 0.5) * 0.24,\r
        tint: next(),\r
        drift: [next() * TAU, next() * TAU, next() * TAU],\r
        rate: [0.3 + next() * 0.35, 0.25 + next() * 0.35, 0.3 + next() * 0.3],\r
        flutter: [next() * TAU, 0.5 + next() * 0.5],\r
        arrive: next(),\r
        sign: next() < 0.5 ? -1 : 1,\r
        slot: [next() * TAU, 0.06 + 0.3 * Math.sqrt(next()), next() - 0.5, next() < 0.85 ? 1 : -1],\r
        offset: [0, 0, 0],\r
        velocity: [0, 0, 0],\r
        tilt: 0,\r
        tiltVelocity: 0,\r
        flash: 0,\r
        gather: 0,\r
        joined: false,\r
        position: [0, 0, 0],\r
        s: 0\r
      });\r
    }\r
  }\r
  return shards;\r
};\r
\r
export default function AeroShards({\r
  shardColor = '#896ABD',\r
  accentColor = '#A855F7',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  placement = 'full',\r
  material = 'glass',\r
  count = 1300,\r
  shardSize = 1,\r
  spread = 1,\r
  twist = 1,\r
  billow = 1,\r
  speed = 1,\r
  scale = 1,\r
  depthOfField = 0.75,\r
  glow = 0.35,\r
  grain = 0.06,\r
  vignette = 0.3,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.6,\r
  markers = 'plus',\r
  pulseOnClick = true,\r
  holdToGather = true,\r
  parallax = 0.5,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style,\r
  onError\r
}: AeroShardsProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const onErrorRef = useRef(onError);\r
  onErrorRef.current = onError;\r
\r
  const settings = {\r
    shard: parseColor(shardColor, [0.54, 0.42, 0.74]) ?? [0.54, 0.42, 0.74],\r
    accent: parseColor(accentColor, [0.66, 0.33, 0.97]) ?? [0.66, 0.33, 0.97],\r
    paper: parseColor(backgroundColor, null),\r
    lightMode,\r
    placement: Math.max(0, PLACEMENTS.indexOf(placement)),\r
    material: MATERIALS[material] ?? MATERIALS.glass,\r
    count: Math.round(clamp(count, 100, 6000)),\r
    shardSize: clamp(shardSize, 0.2, 4),\r
    spread: clamp(spread, 0, 3),\r
    twist: clamp(twist, 0, 3),\r
    billow: clamp(billow, 0, 3),\r
    speed: clamp(speed, 0, 4),\r
    scale: clamp(scale, 0.4, 2.5),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    grain: clamp(grain, 0, 0.5),\r
    vignette: clamp(vignette, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    markers: MARKER_STYLES[markers] ?? -1,\r
    pulseOnClick,\r
    holdToGather,\r
    parallax: clamp(parallax, 0, 1),\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
\r
    let disposed = false;\r
    let gpu: Awaited<ReturnType<typeof init>> | null = null;\r
    let raf = 0;\r
    const cleanups: Array<() => void> = [];\r
\r
    const fail = (error: unknown) => {\r
      if (disposed) return;\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      gpu?.dispose();\r
      gpu = null;\r
      onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));\r
    };\r
\r
    const start = async () => {\r
      if (typeof navigator === 'undefined' || !('gpu' in navigator)) throw new Error('WebGPU is not available');\r
      const instance = await init({ powerPreference: 'high-performance' });\r
      gpu = instance;\r
      if (disposed) {\r
        instance.dispose();\r
        return;\r
      }\r
      cleanups.push(instance.onError(fail));\r
      const format = (\r
        navigator as Navigator & { gpu: { getPreferredCanvasFormat(): string } }\r
      ).gpu.getPreferredCanvasFormat();\r
      const sizeFor = (): [number, number] => {\r
        const ratio = Math.min(window.devicePixelRatio || 1, settingsRef.current.dpr);\r
        return [\r
          Math.max(1, Math.round(container.clientWidth * ratio)),\r
          Math.max(1, Math.round(container.clientHeight * ratio))\r
        ];\r
      };\r
      const output = surface(instance, canvas, {\r
        autoResize: false,\r
        size: sizeFor(),\r
        format,\r
        alphaMode: 'premultiplied'\r
      });\r
      const linear = sampler(instance, {\r
        minFilter: 'linear',\r
        magFilter: 'linear',\r
        addressModeU: 'clamp-to-edge',\r
        addressModeV: 'clamp-to-edge'\r
      });\r
      const scene = target(instance, { size: output.size, format: 'rgba16float' });\r
      const levelSize = (index: number): [number, number] => [\r
        Math.max(1, Math.round(output.size[0] / 2 ** (index + 1))),\r
        Math.max(1, Math.round(output.size[1] / 2 ** (index + 1)))\r
      ];\r
      const levels = Array.from({ length: BLOOM_LEVELS }, (_, index) => ({\r
        main: target(instance, { size: levelSize(index), format: 'rgba16float' }),\r
        spare: target(instance, { size: levelSize(index), format: 'rgba16float' })\r
      }));\r
      const frameParams = uniforms(instance, {\r
        view: [1, 1, 1, 0],\r
        eye: [0, 0, CAMERA, FOCUS],\r
        forward: [0, 0, -1, 0],\r
        right: [1, 0, 0, 0],\r
        up: [0, 1, 0, 0],\r
        shard: [0.54, 0.42, 0.74, 0.5],\r
        accent: [0.66, 0.33, 0.97, 0],\r
        marker: [0, 1, 4, CAMERA],\r
        surface: [7, 0, 0, 2.4]\r
      });\r
      let markerCapacity = 0;\r
      let markerBuffer: ReturnType<typeof storage> | null = null;\r
      let markerData = new Float32Array(0);\r
      const markerDraw = draw(instance, {\r
        shader: MARKER_SHADER,\r
        vertices: 6,\r
        cull: 'none',\r
        depth: false,\r
        blend: 'premultiplied',\r
        label: 'aero-shards-markers'\r
      });\r
      const ensureMarkers = (needed: number) => {\r
        if (needed <= markerCapacity && markerBuffer) return;\r
        markerCapacity = Math.max(needed, 512);\r
        markerData = new Float32Array(markerCapacity * MARKER_FLOATS);\r
        markerBuffer = storage(instance, markerData.byteLength, 'read');\r
        markerDraw.set({ scene: frameParams, markers: markerBuffer });\r
      };\r
      ensureMarkers(512);\r
      const groupSize = (scale: number): [number, number] => [\r
        Math.max(1, Math.round(output.size[0] * scale)),\r
        Math.max(1, Math.round(output.size[1] * scale))\r
      ];\r
      const groups = LAYER_SCALES.map((scale, index) => ({\r
        scale,\r
        layer: target(instance, { size: groupSize(scale), format: 'rgba16float', depth: 'depth32float' }),\r
        shaded: target(instance, { size: groupSize(scale), format: 'rgba16float' }),\r
        temp: target(instance, { size: index === 0 ? [1, 1] : groupSize(scale), format: 'rgba16float' }),\r
        blurred: target(instance, { size: index === 0 ? [1, 1] : groupSize(scale), format: 'rgba16float' }),\r
        softReady: index !== 0\r
      }));\r
      const layerParams = DEPTHS.map(() => uniforms(instance, { view: [1, 1, 1, 0], look: [0.7, 0, 0, 0] }));\r
      const spreadX = DEPTHS.map(() => uniforms(instance, { texel: [0, 0, 0, 0] }));\r
      const spreadY = DEPTHS.map(() => uniforms(instance, { texel: [0, 0, 0, 0] }));\r
      const mixParams = DEPTHS.map(() => uniforms(instance, { info: [1, 0, 0, 0] }));\r
      const shadeParams = DEPTHS.map(() => uniforms(instance, { info: [0, 0, 0, 0], more: [0, 0, 0, 0] }));\r
      const shardSolid = DEPTHS.map((_, level) =>\r
        draw(instance, {\r
          shader: SHARD_SHADER,\r
          entry: { fragment: 'fs_solid' },\r
          vertices: 6,\r
          cull: 'none',\r
          depth: { write: true, compare: 'less' },\r
          label: \`aero-shards-solid-\${level}\`\r
        })\r
      );\r
      const shardEdge = DEPTHS.map((_, level) =>\r
        draw(instance, {\r
          shader: SHARD_SHADER,\r
          entry: { fragment: 'fs_edge' },\r
          vertices: 6,\r
          cull: 'none',\r
          depth: { write: false, compare: 'less' },\r
          blend: 'premultiplied',\r
          label: \`aero-shards-edge-\${level}\`\r
        })\r
      );\r
      const layerPasses = DEPTHS.map((_, level) =>\r
        groups.map((group, index) => ({\r
          shadow: effect(instance, SHADOW_SHADER, {\r
            label: \`aero-shards-shadow-\${level}-\${index}\`,\r
            set: { source: group.layer, depthMap: group.layer.depth, shadeInfo: shadeParams[level] }\r
          }),\r
          blurX: effect(instance, LAYER_BLUR_SHADER, {\r
            label: \`aero-shards-depth-x-\${level}-\${index}\`,\r
            set: { source: group.shaded, linearSampler: linear, spreadInfo: spreadX[level] }\r
          }),\r
          blurY: effect(instance, LAYER_BLUR_SHADER, {\r
            label: \`aero-shards-depth-y-\${level}-\${index}\`,\r
            set: { source: group.temp, linearSampler: linear, spreadInfo: spreadY[level] }\r
          }),\r
          sharp: effect(instance, COMPOSITE_SHADER, {\r
            label: \`aero-shards-sharp-\${level}-\${index}\`,\r
            blend: 'premultiplied',\r
            set: { source: group.shaded, linearSampler: linear, mixInfo: mixParams[level] }\r
          }),\r
          soft: effect(instance, COMPOSITE_SHADER, {\r
            label: \`aero-shards-soft-\${level}-\${index}\`,\r
            blend: 'premultiplied',\r
            set: { source: group.blurred, linearSampler: linear, mixInfo: mixParams[level] }\r
          })\r
        }))\r
      );\r
      let capacity = 0;\r
      let shardBuffer: ReturnType<typeof storage> | null = null;\r
      let upload = new Float32Array(0);\r
      let staging = new Float32Array(0);\r
      let depths = new Float32Array(0);\r
      const ensureCapacity = (needed: number) => {\r
        if (needed <= capacity && shardBuffer) return;\r
        capacity = Math.max(needed, 256);\r
        upload = new Float32Array(capacity * FLOATS);\r
        staging = new Float32Array(capacity * FLOATS);\r
        depths = new Float32Array(capacity);\r
        shardBuffer = storage(instance, upload.byteLength, 'read');\r
        DEPTHS.forEach((_, level) => {\r
          shardSolid[level].set({ scene: frameParams, shards: shardBuffer, layerInfo: layerParams[level] });\r
          shardEdge[level].set({ scene: frameParams, shards: shardBuffer, layerInfo: layerParams[level] });\r
        });\r
      };\r
      ensureCapacity(settingsRef.current.count);\r
\r
      const passes = levels.map((level, index) => {\r
        const source = index === 0 ? scene : levels[index - 1].main;\r
        const downParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        const horizontalParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        const verticalParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        return {\r
          source,\r
          level,\r
          downParams,\r
          horizontalParams,\r
          verticalParams,\r
          down: effect(instance, index === 0 ? PREFILTER_SHADER : DOWNSAMPLE_SHADER, {\r
            label: \`aero-shards-down-\${index}\`,\r
            set: { source, linearSampler: linear, bloom: downParams }\r
          }),\r
          horizontal: effect(instance, BLUR_SHADER, {\r
            label: \`aero-shards-blur-x-\${index}\`,\r
            set: { source: level.main, linearSampler: linear, bloom: horizontalParams }\r
          }),\r
          vertical: effect(instance, BLUR_SHADER, {\r
            label: \`aero-shards-blur-y-\${index}\`,\r
            set: { source: level.spare, linearSampler: linear, bloom: verticalParams }\r
          })\r
        };\r
      });\r
      const finishParams = uniforms(instance, { info: [0, 0, 0, 1], paper: [0, 0, 0, 0], mode: [0, 0, 0, 0] });\r
      const finish = effect(instance, FINISH_SHADER, {\r
        label: 'aero-shards-finish',\r
        set: {\r
          sceneTexture: scene,\r
          linearSampler: linear,\r
          bloom0: levels[0].main,\r
          bloom1: levels[1].main,\r
          bloom2: levels[2].main,\r
          bloom3: levels[3].main,\r
          finish: finishParams\r
        }\r
      });\r
      await Promise.all([\r
        ...shardSolid.map(item => item.compile(groups[0].layer)),\r
        ...shardEdge.map(item => item.compile(groups[0].layer)),\r
        ...layerPasses.flatMap(list =>\r
          list.flatMap((item, index) => [\r
            item.shadow.compile(groups[index].shaded),\r
            item.blurX.compile(groups[index].temp),\r
            item.blurY.compile(groups[index].blurred),\r
            item.sharp.compile(scene),\r
            item.soft.compile(scene)\r
          ])\r
        ),\r
        markerDraw.compile(scene),\r
        finish.compile({ colors: [format] }),\r
        ...passes.flatMap((pass, index) => [\r
          pass.down.compile(levels[index].main),\r
          pass.horizontal.compile(levels[index].spare),\r
          pass.vertical.compile(levels[index].main)\r
        ])\r
      ]);\r
      if (disposed) return;\r
\r
      const paths = Array.from({ length: LEVELS }, () => ({\r
        position: new Float32Array(SAMPLES * 3),\r
        tangent: new Float32Array(SAMPLES * 3),\r
        across: new Float32Array(SAMPLES * 3),\r
        lift: new Float32Array(SAMPLES * 3),\r
        length: 1\r
      }));\r
      const markerCounts = [0, 0, 0, 0, 0];\r
      const markerStarts = [0, 0, 0, 0, 0];\r
      const raw = new Float32Array((SAMPLES + 1) * 3);\r
      const lengths = new Float32Array(SAMPLES + 1);\r
      const point = [0, 0, 0];\r
      let pathKey = '';\r
\r
      const state = {\r
        visible: false,\r
        clock: 0,\r
        last: 0,\r
        travel: new Float64Array(LEVELS),\r
        roll: 0,\r
        twist: 0,\r
        drift: 0,\r
        introAt: -1,\r
        weights: PLACEMENTS.map((_, index): number => (index === settingsRef.current.placement ? 1 : 0)),\r
        weightVelocity: [0, 0, 0, 0],\r
        shards: createShards(settingsRef.current.count, 1337),\r
        order: [] as number[],\r
        pointer: [0.5, 0.5],\r
        inside: false,\r
        presence: 0,\r
        yaw: 0,\r
        pitch: 0,\r
        yawVelocity: 0,\r
        pitchVelocity: 0,\r
        pressAt: -1,\r
        pressPoint: null as number[] | null,\r
        holding: false,\r
        hold: 0,\r
        reach: 0,\r
        gatherCenter: [0, 0, 0],\r
        rings: [] as Ring[],\r
        markerDrift: 0,\r
        markerTarget: '',\r
        markerTotal: 0,\r
        targets: new Map<string, number>(),\r
        quiet: 0,\r
        seen: null as typeof settings | null\r
      };\r
\r
      const buildPaths = (aspect: number) => {\r
        const closed = state.weights[3] > 0.999;\r
        const key = \`\${aspect.toFixed(4)}|\${state.weights.map(w => w.toFixed(4)).join(',')}\`;\r
        if (key === pathKey) return closed;\r
        pathKey = key;\r
        for (let level = 0; level < LEVELS; level += 1) {\r
          const path = paths[level];\r
          let total = 0;\r
          for (let i = 0; i <= SAMPLES; i += 1) {\r
            const s = i / SAMPLES;\r
            let x = 0;\r
            let y = 0;\r
            let z = 0;\r
            for (let k = 0; k < 4; k += 1) {\r
              const weight = state.weights[k];\r
              if (weight < 0.0001) continue;\r
              ribbonPoint(k, level, s, aspect, point);\r
              x += point[0] * weight;\r
              y += point[1] * weight;\r
              z += point[2] * weight;\r
            }\r
            raw[i * 3] = x;\r
            raw[i * 3 + 1] = y;\r
            raw[i * 3 + 2] = z;\r
            if (i > 0) total += Math.hypot(x - raw[i * 3 - 3], y - raw[i * 3 - 2], z - raw[i * 3 - 1]);\r
            lengths[i] = total;\r
          }\r
          path.length = Math.max(total, 1e-3);\r
          let cursor = 0;\r
          for (let i = 0; i < SAMPLES; i += 1) {\r
            const want = (i / (SAMPLES - 1)) * total;\r
            while (cursor < SAMPLES - 1 && lengths[cursor + 1] < want) cursor += 1;\r
            const span = Math.max(lengths[cursor + 1] - lengths[cursor], 1e-6);\r
            const f = clamp((want - lengths[cursor]) / span, 0, 1);\r
            for (let c = 0; c < 3; c += 1) {\r
              path.position[i * 3 + c] = raw[cursor * 3 + c] + (raw[cursor * 3 + 3 + c] - raw[cursor * 3 + c]) * f;\r
            }\r
          }\r
          let px = 0;\r
          let py = 1;\r
          let pz = 0;\r
          for (let i = 0; i < SAMPLES; i += 1) {\r
            const a = Math.max(0, i - 1);\r
            const b = Math.min(SAMPLES - 1, i + 1);\r
            let tx = path.position[b * 3] - path.position[a * 3];\r
            let ty = path.position[b * 3 + 1] - path.position[a * 3 + 1];\r
            let tz = path.position[b * 3 + 2] - path.position[a * 3 + 2];\r
            const tl = Math.hypot(tx, ty, tz) || 1;\r
            tx /= tl;\r
            ty /= tl;\r
            tz /= tl;\r
            if (i === 0) {\r
              px = -ty;\r
              py = tx;\r
              pz = 0;\r
            }\r
            const along = px * tx + py * ty + pz * tz;\r
            px -= tx * along;\r
            py -= ty * along;\r
            pz -= tz * along;\r
            const pl = Math.hypot(px, py, pz) || 1;\r
            px /= pl;\r
            py /= pl;\r
            pz /= pl;\r
            path.tangent[i * 3] = tx;\r
            path.tangent[i * 3 + 1] = ty;\r
            path.tangent[i * 3 + 2] = tz;\r
            path.across[i * 3] = px;\r
            path.across[i * 3 + 1] = py;\r
            path.across[i * 3 + 2] = pz;\r
            path.lift[i * 3] = ty * pz - tz * py;\r
            path.lift[i * 3 + 1] = tz * px - tx * pz;\r
            path.lift[i * 3 + 2] = tx * py - ty * px;\r
          }\r
        }\r
        return closed;\r
      };\r
\r
      const resize = () => {\r
        const next = sizeFor();\r
        if (next[0] === output.size[0] && next[1] === output.size[1]) return;\r
        output.resize(next);\r
        scene.resize(next);\r
        groups.forEach(group => {\r
          group.layer.resize(groupSize(group.scale));\r
          group.shaded.resize(groupSize(group.scale));\r
          if (group.softReady) {\r
            group.temp.resize(groupSize(group.scale));\r
            group.blurred.resize(groupSize(group.scale));\r
          }\r
        });\r
        levels.forEach((level, index) => {\r
          level.main.resize(levelSize(index));\r
          level.spare.resize(levelSize(index));\r
        });\r
        layerPasses.forEach(list =>\r
          list.forEach((item, index) => item.shadow.set({ depthMap: groups[index].layer.depth }))\r
        );\r
        state.quiet = 0;\r
      };\r
      const sizes = new ResizeObserver(resize);\r
      sizes.observe(container);\r
      cleanups.push(() => sizes.disconnect());\r
\r
      const cam = { eye: [0, 0, CAMERA], forward: [0, 0, -1], right: [1, 0, 0], up: [0, 1, 0], focal: 1 };\r
\r
      const updateCamera = (s: typeof settings) => {\r
        const cy = Math.cos(state.yaw);\r
        const sy = Math.sin(state.yaw);\r
        const cp = Math.cos(state.pitch);\r
        const sp = Math.sin(state.pitch);\r
        cam.eye[0] = sy * cp * CAMERA;\r
        cam.eye[1] = sp * CAMERA;\r
        cam.eye[2] = cy * cp * CAMERA;\r
        cam.forward[0] = -sy * cp;\r
        cam.forward[1] = -sp;\r
        cam.forward[2] = -cy * cp;\r
        const rl = Math.hypot(cam.forward[2], cam.forward[0]) || 1;\r
        cam.right[0] = -cam.forward[2] / rl;\r
        cam.right[1] = 0;\r
        cam.right[2] = cam.forward[0] / rl;\r
        cam.up[0] = cam.right[1] * cam.forward[2] - cam.right[2] * cam.forward[1];\r
        cam.up[1] = cam.right[2] * cam.forward[0] - cam.right[0] * cam.forward[2];\r
        cam.up[2] = cam.right[0] * cam.forward[1] - cam.right[1] * cam.forward[0];\r
        cam.focal = output.size[1] * 0.5 * CAMERA * s.scale;\r
      };\r
\r
      const ray = [0, 0, 1];\r
      const rayAt = (px: number, py: number) => {\r
        const x = (px - 0.5) * output.size[0];\r
        const y = (0.5 - py) * output.size[1];\r
        ray[0] = cam.forward[0] * cam.focal + cam.right[0] * x + cam.up[0] * y;\r
        ray[1] = cam.forward[1] * cam.focal + cam.right[1] * x + cam.up[1] * y;\r
        ray[2] = cam.forward[2] * cam.focal + cam.right[2] * x + cam.up[2] * y;\r
        const length = Math.hypot(ray[0], ray[1], ray[2]) || 1;\r
        ray[0] /= length;\r
        ray[1] /= length;\r
        ray[2] /= length;\r
        return ray;\r
      };\r
\r
      const simulate = (s: typeof settings, dt: number, reduced: boolean) => {\r
        const aspect = output.size[0] / Math.max(output.size[1], 1);\r
        const closed = buildPaths(aspect);\r
        const introOn = s.intro && !reduced;\r
        const introAge = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
        const hover = s.mouseInteraction && !reduced ? state.presence * s.mouseStrength : 0;\r
        let rx = 0;\r
        let ry = 0;\r
        let rz = 0;\r
        if (hover > 0.001) {\r
          rayAt(state.pointer[0], state.pointer[1]);\r
          rx = ray[0];\r
          ry = ray[1];\r
          rz = ray[2];\r
        }\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
        const h = dt / Math.max(steps, 1);\r
        const halfHeight = output.size[1] * 0.5;\r
        const rings = state.rings.map(ring => {\r
          const life = ring.age / RING_SECONDS;\r
          return {\r
            x: ring.x,\r
            y: ring.y,\r
            age: ring.age,\r
            strength: (1 - Math.exp(-ring.age / 0.06)) * (1 - life) * (1 - life)\r
          };\r
        });\r
        const screenOf = (x: number, y: number, z: number, out: number[]) => {\r
          const ex = x - cam.eye[0];\r
          const ey = y - cam.eye[1];\r
          const ez = z - cam.eye[2];\r
          const depth = Math.max(ex * cam.forward[0] + ey * cam.forward[1] + ez * cam.forward[2], 0.05);\r
          out[0] = ((ex * cam.right[0] + ey * cam.right[1] + ez * cam.right[2]) * cam.focal) / depth / halfHeight;\r
          out[1] = ((ex * cam.up[0] + ey * cam.up[1] + ez * cam.up[2]) * cam.focal) / depth / halfHeight;\r
          return depth;\r
        };\r
        const ringBand = (sx: number, sy: number, level: number) => {\r
          let total = 0;\r
          for (const ring of rings) {\r
            const radius = Math.max(0, ring.age - level * 0.07) * 2.3;\r
            const distance = Math.hypot(sx - ring.x, sy - ring.y);\r
            total += Math.exp(-((distance - radius) * (distance - radius)) / 0.012) * ring.strength;\r
          }\r
          return total;\r
        };\r
        const flat = [0, 0];\r
        const shards = state.shards;\r
        const twistWeight = Math.min(1, s.twist);\r
        for (let index = 0; index < shards.length; index += 1) {\r
          const shard = shards[index];\r
          const level = shard.level;\r
          const path = paths[level];\r
          let s0 = (shard.phase + state.travel[level]) % 1;\r
          let appear = 1;\r
          let introBank = 0;\r
          if (introOn) {\r
            const begin =\r
              level * 0.22 + Math.max(0, s0 - 0.1) * (INTRO_SECONDS - 1.0 - (LEVELS - 1) * 0.22) + shard.arrive * 0.15;\r
            const local = clamp((introAge - begin) / 0.9, 0, 1);\r
            appear = smoother(local);\r
            const glide = (1 - local) * (1 - local);\r
            s0 = closed ? s0 - glide * 0.06 : Math.max(0, s0 - glide * 0.06);\r
            introBank = glide * 0.9 * shard.sign;\r
          }\r
          shard.s = s0;\r
          const f = (((s0 % 1) + 1) % 1) * (SAMPLES - 1);\r
          const i0 = Math.floor(f);\r
          const i1 = Math.min(i0 + 1, SAMPLES - 1);\r
          const t = f - i0;\r
          const at = (array: Float32Array, c: number) =>\r
            array[i0 * 3 + c] + (array[i1 * 3 + c] - array[i0 * 3 + c]) * t;\r
          const cx = at(path.position, 0);\r
          const cy = at(path.position, 1);\r
          const cz = at(path.position, 2);\r
          const tx = at(path.tangent, 0);\r
          const ty = at(path.tangent, 1);\r
          const tz = at(path.tangent, 2);\r
          const ax0 = at(path.across, 0);\r
          const ay0 = at(path.across, 1);\r
          const az0 = at(path.across, 2);\r
          const lx0 = at(path.lift, 0);\r
          const ly0 = at(path.lift, 1);\r
          const lz0 = at(path.lift, 2);\r
          const angle = s.twist * (s0 * TAU * 0.6 + state.twist + level * 1.7);\r
          const ca = Math.cos(angle);\r
          const sa = Math.sin(angle);\r
          const ax = ax0 * ca + lx0 * sa;\r
          const ay = ay0 * ca + ly0 * sa;\r
          const az = az0 * ca + lz0 * sa;\r
          const bx = lx0 * ca - ax0 * sa;\r
          const by = ly0 * ca - ay0 * sa;\r
          const bz = lz0 * ca - az0 * sa;\r
          const depthScale = DEPTHS[level] / CAMERA;\r
          const width =\r
            s.spread * (0.15 + 0.035 * DEPTHS[level]) * (0.8 + 0.3 * Math.sin(s0 * TAU * 1.3 + level * 0.8));\r
          const lane = shard.lane * width;\r
          const layer = shard.layer * 0.012 * depthScale;\r
          const taper = closed ? 1 : smoother(s0 / 0.12) * smoother((1 - s0) / 0.12);\r
          const billow =\r
            s.billow *\r
            0.16 *\r
            depthScale *\r
            Math.sin(s0 * TAU * 1.3 - state.drift * 0.5 + level * 1.1) *\r
            (0.4 + 0.6 * taper);\r
          const sway = s.billow * 0.06 * depthScale * Math.sin(s0 * TAU * 0.8 - state.drift * 0.35 + level * 2.4);\r
          const wobble = 0.009 * depthScale;\r
          const drift = state.drift;\r
          const hx =\r
            cx +\r
            lx0 * billow +\r
            ax0 * sway +\r
            ax * lane +\r
            bx * layer +\r
            Math.sin(drift * shard.rate[0] + shard.drift[0]) * wobble;\r
          const hy =\r
            cy +\r
            ly0 * billow +\r
            ay0 * sway +\r
            ay * lane +\r
            by * layer +\r
            Math.sin(drift * shard.rate[1] + shard.drift[1]) * wobble;\r
          const hz =\r
            cz +\r
            lz0 * billow +\r
            az0 * sway +\r
            az * lane +\r
            bz * layer +\r
            Math.sin(drift * shard.rate[2] + shard.drift[2]) * wobble;\r
\r
          let fx = 0;\r
          let fy = 0;\r
          let fz = 0;\r
          let tiltTarget = 0;\r
          const px = hx + shard.offset[0];\r
          const py = hy + shard.offset[1];\r
          const pz = hz + shard.offset[2];\r
          if (hover > 0.001) {\r
            const ex = px - cam.eye[0];\r
            const ey = py - cam.eye[1];\r
            const ez = pz - cam.eye[2];\r
            const along = ex * rx + ey * ry + ez * rz;\r
            const qx = ex - rx * along;\r
            const qy = ey - ry * along;\r
            const qz = ez - rz * along;\r
            const gap = Math.hypot(qx, qy, qz);\r
            const reach = (0.24 * depthScale) / s.scale;\r
            const falloff = Math.exp(-(gap * gap) / (reach * reach));\r
            if (falloff > 0.002 && gap > 1e-5) {\r
              const nx = qx / gap;\r
              const ny = qy / gap;\r
              const nz = qz / gap;\r
              const sideways = (nx * tx + ny * ty + nz * tz) * 0.7;\r
              const strength = hover * falloff * 9 * depthScale;\r
              fx += (nx - tx * sideways) * strength;\r
              fy += (ny - ty * sideways) * strength;\r
              fz += (nz - tz * sideways) * strength;\r
              tiltTarget += hover * falloff * 1.1 * (nx * ax0 + ny * ay0 + nz * az0);\r
            }\r
          }\r
\r
          if (state.hold > 0.001 && shard.joined) {\r
            const slot = shard.slot;\r
            const orbit = slot[0] + state.clock * (0.8 / (0.12 + slot[1])) * slot[3];\r
            const radius = slot[1] / s.scale;\r
            const gx = state.gatherCenter[0] + Math.cos(orbit) * radius;\r
            const gy = state.gatherCenter[1] + Math.sin(orbit) * radius * 0.75;\r
            const gz = state.gatherCenter[2] + Math.sin(orbit) * radius * 0.45 + slot[2] * 0.3;\r
            shard.gather += (state.hold - shard.gather) * (1 - Math.exp(-dt / 0.3));\r
            const pull = shard.gather * 30;\r
            fx += (gx - px) * pull;\r
            fy += (gy - py) * pull;\r
            fz += (gz - pz) * pull;\r
            tiltTarget += shard.gather * 0.6 * Math.sin(orbit);\r
          } else {\r
            shard.gather += (0 - shard.gather) * (1 - Math.exp(-dt / 0.2));\r
          }\r
\r
          if (rings.length) {\r
            screenOf(px, py, pz, flat);\r
            for (const ring of rings) {\r
              const radius = Math.max(0, ring.age - level * 0.07) * 2.3;\r
              const dxr = flat[0] - ring.x;\r
              const dyr = flat[1] - ring.y;\r
              const distance = Math.hypot(dxr, dyr);\r
              const band = Math.exp(-((distance - radius) * (distance - radius)) / 0.012) * ring.strength;\r
              if (band > 0.01) {\r
                shard.flash = Math.max(shard.flash, band * 0.75);\r
                const outward = Math.max(distance, 0.05);\r
                const ux = (cam.right[0] * dxr + cam.up[0] * dyr) / outward;\r
                const uy = (cam.right[1] * dxr + cam.up[1] * dyr) / outward;\r
                const uz = (cam.right[2] * dxr + cam.up[2] * dyr) / outward;\r
                tiltTarget += band * 1.4 * (ux * ax0 + uy * ay0 + uz * az0);\r
                const push = (band * 2.2 * depthScale) / Math.max(distance, 0.05);\r
                fx += (cam.right[0] * dxr + cam.up[0] * dyr) * push;\r
                fy += (cam.right[1] * dxr + cam.up[1] * dyr) * push;\r
                fz += (cam.right[2] * dxr + cam.up[2] * dyr) * push;\r
              }\r
            }\r
          }\r
\r
          const stiffness = 24 * (1 - shard.gather * 0.95);\r
          for (let step = 0; step < steps; step += 1) {\r
            shard.velocity[0] += (fx - stiffness * shard.offset[0] - 7.5 * shard.velocity[0]) * h;\r
            shard.velocity[1] += (fy - stiffness * shard.offset[1] - 7.5 * shard.velocity[1]) * h;\r
            shard.velocity[2] += (fz - stiffness * shard.offset[2] - 7.5 * shard.velocity[2]) * h;\r
            shard.offset[0] += shard.velocity[0] * h;\r
            shard.offset[1] += shard.velocity[1] * h;\r
            shard.offset[2] += shard.velocity[2] * h;\r
            shard.tiltVelocity += (90 * (tiltTarget - shard.tilt) - 15 * shard.tiltVelocity) * h;\r
            shard.tilt += shard.tiltVelocity * h;\r
          }\r
          shard.flash *= Math.exp(-dt / 0.45);\r
\r
          const ox = hx + shard.offset[0];\r
          const oy = hy + shard.offset[1];\r
          const oz = hz + shard.offset[2];\r
          shard.position[0] = ox;\r
          shard.position[1] = oy;\r
          shard.position[2] = oz;\r
\r
          let vx = cam.eye[0] - ox;\r
          let vy = cam.eye[1] - oy;\r
          let vz = cam.eye[2] - oz;\r
          const vl = Math.hypot(vx, vy, vz) || 1;\r
          vx /= vl;\r
          vy /= vl;\r
          vz /= vl;\r
          let dx = tx + shard.velocity[0] * 0.05;\r
          let dy = ty + shard.velocity[1] * 0.05;\r
          let dz = tz + shard.velocity[2] * 0.05;\r
          const facingPart = dx * vx + dy * vy + dz * vz;\r
          dx -= vx * facingPart;\r
          dy -= vy * facingPart;\r
          dz -= vz * facingPart;\r
          let dl = Math.hypot(dx, dy, dz);\r
          if (dl < 1e-4) {\r
            dx = cam.right[0];\r
            dy = cam.right[1];\r
            dz = cam.right[2];\r
            dl = 1;\r
          }\r
          dx /= dl;\r
          dy /= dl;\r
          dz /= dl;\r
          const wx = vy * dz - vz * dy;\r
          const wy = vz * dx - vx * dz;\r
          const wz = vx * dy - vy * dx;\r
          const yaw = shard.yaw + 0.05 * Math.sin(state.clock * shard.flutter[1] * 0.7 + shard.flutter[0]);\r
          const cyaw = Math.cos(yaw);\r
          const syaw = Math.sin(yaw);\r
          const kx = dx * cyaw + wx * syaw;\r
          const ky = dy * cyaw + wy * syaw;\r
          const kz = dz * cyaw + wz * syaw;\r
          const jx = wx * cyaw - dx * syaw;\r
          const jy = wy * cyaw - dy * syaw;\r
          const jz = wz * cyaw - dz * syaw;\r
          const wave =\r
            0.8 * twistWeight * Math.sin(angle) +\r
            0.3 * Math.sin(s0 * TAU * 1.6 - state.roll * 0.55 + level * 0.9 + shard.lane * 0.7);\r
          const flutter = 0.06 * Math.sin(state.clock * shard.flutter[1] + shard.flutter[0]);\r
          const bank = MAX_BANK * Math.tanh((wave + shard.bank + flutter + shard.tilt + introBank) / MAX_BANK);\r
          const cb = Math.cos(bank);\r
          const sb = Math.sin(bank);\r
          const mx = vx * cb + jx * sb;\r
          const my = vy * cb + jy * sb;\r
          const mz = vz * cb + jz * sb;\r
          const pitch = shard.pitch + 0.2 * Math.sin(s0 * TAU * 1.1 - state.roll * 0.4 + level * 2.1);\r
          const cp = Math.cos(pitch);\r
          const sp = Math.sin(pitch);\r
          const axisX = kx * cp + mx * sp;\r
          const axisY = ky * cp + my * sp;\r
          const axisZ = kz * cp + mz * sp;\r
          const nx = mx * cp - kx * sp;\r
          const ny = my * cp - ky * sp;\r
          const nz = mz * cp - kz * sp;\r
\r
          const ex = ox - cam.eye[0];\r
          const ey = oy - cam.eye[1];\r
          const ez = oz - cam.eye[2];\r
          const viewDepth = ex * cam.forward[0] + ey * cam.forward[1] + ez * cam.forward[2];\r
          depths[index] = viewDepth;\r
          const core = 1 - 0.45 * shard.lane * shard.lane;\r
          const size = 0.062 * s.shardSize * shard.size * GROWTH[level] * appear * Math.sqrt(taper) * core;\r
          const o = index * FLOATS;\r
          staging[o] = ox;\r
          staging[o + 1] = oy;\r
          staging[o + 2] = oz;\r
          staging[o + 3] = size > 1e-5 ? size : 0;\r
          staging[o + 4] = axisX;\r
          staging[o + 5] = axisY;\r
          staging[o + 6] = axisZ;\r
          staging[o + 7] = shard.thickness;\r
          staging[o + 8] = nx;\r
          staging[o + 9] = ny;\r
          staging[o + 10] = nz;\r
          staging[o + 11] = shard.tint;\r
          for (let k = 0; k < 10; k += 1) staging[o + 12 + k] = shard.shape[k];\r
          staging[o + 22] = shard.sides;\r
          staging[o + 23] = shard.flash;\r
        }\r
\r
        let markerTotal = 0;\r
        for (let level = 0; level < LEVELS; level += 1) {\r
          markerCounts[level] = 0;\r
          markerStarts[level] = 0;\r
        }\r
        if (s.markers >= 0) {\r
          const ratio = output.size[1] / Math.max(container.clientHeight, 1);\r
          const pointerX = (state.pointer[0] - 0.5) * 2 * aspect;\r
          const pointerY = (0.5 - state.pointer[1]) * 2;\r
          const engaged = s.mouseInteraction && !reduced ? state.presence : 0;\r
          const previousTargets = state.targets;\r
          const nextTargets = new Map();\r
          const targetEase = 1 - Math.exp(-dt / 0.12);\r
          let nearestKey = '';\r
          let nearestGap = 72;\r
          for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
            markerStarts[level] = markerTotal;\r
            const depth = DEPTHS[level];\r
            const depthScale = depth / CAMERA;\r
            const spacing = 0.42 * Math.pow(depthScale, 0.55);\r
            const halfW = ((aspect * depth) / (CAMERA * s.scale)) * 1.12 + spacing;\r
            const halfH = (depth / (CAMERA * s.scale)) * 1.12 + spacing;\r
            const drift = state.markerDrift;\r
            const phase = MARKER_PHASES[level];\r
            const i0 = Math.floor((drift - halfW) / spacing - phase[0]);\r
            const i1 = Math.ceil((drift + halfW) / spacing - phase[0]);\r
            const j0 = Math.floor(-halfH / spacing - phase[1]);\r
            const j1 = Math.ceil(halfH / spacing - phase[1]);\r
            const band = s.spread * (0.15 + 0.035 * depth) * 1.4;\r
            const position = paths[level].position;\r
            for (let i = i0; i <= i1; i += 1) {\r
              for (let j = j0; j <= j1; j += 1) {\r
                const keep = latticeHash(level, i, j, 11);\r
                if (keep > 0.5) continue;\r
                const x = (i + phase[0]) * spacing - drift;\r
                const y = (j + phase[1]) * spacing;\r
                const z = CAMERA - depth;\r
                const markerDepth = screenOf(x, y, z, flat);\r
                if (Math.abs(flat[0]) > aspect * 1.05 || Math.abs(flat[1]) > 1.05) continue;\r
                let best = Infinity;\r
                for (let k = 0; k < SAMPLES; k += 2) {\r
                  const dx = x - position[k * 3];\r
                  const dy = y - position[k * 3 + 1];\r
                  const dz = z - position[k * 3 + 2];\r
                  const d2 = dx * dx + dy * dy + dz * dz;\r
                  if (d2 < best) best = d2;\r
                }\r
                const near = Math.exp(-best / (band * band));\r
                const blinkSeed = latticeHash(level, i, j, 23);\r
                const blinkRate = latticeHash(level, i, j, 37);\r
                const blink =\r
                  blinkSeed < 0.07 ? 0.5 + 0.5 * Math.sin(state.clock * (1.4 + blinkRate * 2.2) + blinkRate * 40) : 0;\r
                const pointerGap = (Math.hypot(flat[0] - pointerX, flat[1] - pointerY) * halfHeight) / ratio;\r
                const key = \`\${level}:\${i}:\${j}\`;\r
                if (level <= 2 && engaged > 0.01 && pointerGap < nearestGap) {\r
                  nearestGap = pointerGap;\r
                  nearestKey = key;\r
                }\r
                const wanted = key === state.markerTarget ? engaged * (1 - smoother((pointerGap - 30) / 42)) : 0;\r
                const before = previousTargets.get(key) ?? 0;\r
                const target = before + (wanted - before) * targetEase;\r
                if (target > 0.002) nextTargets.set(key, target);\r
                const bracket = Math.max(smoother((blink - 0.55) / 0.4), target);\r
                let ring = 0;\r
                if (rings.length) ring = ringBand(flat[0], flat[1], level);\r
                let reveal = 1;\r
                if (introOn) {\r
                  const across = clamp((flat[0] / aspect + 1) * 0.5, 0, 1);\r
                  const begin = level * 0.22 + 0.35 + across * (INTRO_SECONDS - 1.3 - (LEVELS - 1) * 0.22);\r
                  reveal = smoother((introAge - begin) / 0.5);\r
                }\r
                const fade = FADE[level] * (1 - smoother((markerDepth - 3) / 10) * 0.45) * reveal;\r
                if (fade < 0.002) continue;\r
                if (markerTotal >= markerCapacity) ensureMarkers(markerCapacity * 2);\r
                const o = markerTotal * MARKER_FLOATS;\r
                markerData[o] = x;\r
                markerData[o + 1] = y;\r
                markerData[o + 2] = z;\r
                markerData[o + 3] = fade;\r
                markerData[o + 4] = 0.42 + 0.5 * near + blink * 0.9 + target * 1.3 + ring * 2.5;\r
                markerData[o + 5] = bracket;\r
                markerData[o + 6] = 1 + 0.15 * near + 0.3 * blink + 0.2 * target;\r
                markerData[o + 7] = 0;\r
                markerTotal += 1;\r
                markerCounts[level] += 1;\r
              }\r
            }\r
          }\r
          state.targets = nextTargets;\r
          state.markerTarget = nearestKey;\r
        }\r
        state.markerTotal = markerTotal;\r
      };\r
\r
      const render = (s: typeof settings, dt: number, reduced: boolean) => {\r
        updateCamera(s);\r
        const shards = state.shards;\r
        ensureCapacity(shards.length);\r
        simulate(s, dt, reduced);\r
        if (state.order.length !== shards.length) state.order = shards.map((_, index) => index);\r
        const order = state.order;\r
        for (let i = 0; i < shards.length; i += 1) depths[i] += shards[i].level * 100;\r
        for (let i = 1; i < order.length; i += 1) {\r
          const value = order[i];\r
          const key = depths[value];\r
          let j = i - 1;\r
          while (j >= 0 && depths[order[j]] < key) {\r
            order[j + 1] = order[j];\r
            j -= 1;\r
          }\r
          order[j + 1] = value;\r
        }\r
        const counts = [0, 0, 0, 0, 0];\r
        for (let slot = 0; slot < order.length; slot += 1) {\r
          const from = order[slot] * FLOATS;\r
          const to = slot * FLOATS;\r
          counts[shards[order[slot]].level] += 1;\r
          for (let k = 0; k < FLOATS; k += 1) upload[to + k] = staging[from + k];\r
        }\r
        shardBuffer?.write(upload.subarray(0, shards.length * FLOATS));\r
        if (state.markerTotal > 0) markerBuffer?.write(markerData.subarray(0, state.markerTotal * MARKER_FLOATS));\r
        const starts = [0, 0, 0, 0, 0];\r
        let running = 0;\r
        for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
          starts[level] = running;\r
          running += counts[level];\r
        }\r
\r
        frameParams.set({\r
          view: [output.size[0], output.size[1], cam.focal, state.clock],\r
          eye: [cam.eye[0], cam.eye[1], cam.eye[2], FOCUS],\r
          forward: [cam.forward[0], cam.forward[1], cam.forward[2], s.depthOfField * output.size[1] * 0.03],\r
          right: [cam.right[0], cam.right[1], cam.right[2], output.size[1] * 0.05],\r
          up: [cam.up[0], cam.up[1], cam.up[2], s.lightMode ? 1 : 0],\r
          shard: [...s.shard, 0],\r
          accent: [...s.accent, 0],\r
          surface: s.material,\r
          marker: [\r
            s.markers,\r
            output.size[1] / Math.max(container.clientHeight, 1),\r
            4 * (output.size[1] / Math.max(container.clientHeight, 1)),\r
            FOCUS\r
          ]\r
        });\r
        passes.forEach(({ downParams, horizontalParams, verticalParams, source, level }) => {\r
          downParams.set({ texel: [0.5 / source.size[0], 0.5 / source.size[1], 0.75, 0.5] });\r
          horizontalParams.set({ texel: [1 / level.main.size[0], 0, 0, 0] });\r
          verticalParams.set({ texel: [0, 1 / level.main.size[1], 0, 0] });\r
        });\r
        const paper = s.paper ?? [0, 0, 0];\r
        const blooming = s.glow > 0.001 && !s.lightMode;\r
        finishParams.set({\r
          info: [s.grain, Math.floor(state.clock * 24), blooming ? s.glow : 0, 1.3],\r
          paper: [paper[0], paper[1], paper[2], s.paper ? 1 : 0],\r
          mode: [s.lightMode ? 1 : 0, s.vignette, 0, 0]\r
        });\r
\r
        const coc = s.depthOfField * output.size[1] * 0.012;\r
        const cap = output.size[1] * 0.02;\r
        const plan = DEPTHS.map((depth, level) => {\r
          const sigma = Math.min(coc * Math.abs(1 - SHARD_FOCUS / depth), cap);\r
          const groupIndex = sigma >= 2.2 ? 1 : 0;\r
          const group = groups[groupIndex];\r
          const soft = sigma >= 0.45;\r
          if (soft && !group.softReady) {\r
            group.softReady = true;\r
            group.temp.resize(groupSize(group.scale));\r
            group.blurred.resize(groupSize(group.scale));\r
          }\r
          const size = group.layer.size;\r
          layerParams[level].set({\r
            view: [size[0], size[1], cam.focal * (size[0] / output.size[0]), level],\r
            look: [s.lightMode ? 0.5 : 0.7, 0, 0, 0]\r
          });\r
          const local = sigma * group.scale;\r
          spreadX[level].set({ texel: [1 / size[0], 0, local, 0] });\r
          spreadY[level].set({ texel: [0, 1 / size[1], local, 0] });\r
          mixParams[level].set({ info: [FADE[level], 0, 0, 0] });\r
          const step = Math.max(0.6, 1.4 * (size[0] / Math.max(container.clientWidth, 1)));\r
          const shadowStrength = s.material === MATERIALS.glass ? 0 : s.lightMode ? 0.32 : 0.62;\r
          shadeParams[level].set({ info: [step * 0.55, step * 0.85, shadowStrength, 0], more: [0.00045, 0, 0, 0] });\r
          return { group, groupIndex, soft };\r
        });\r
\r
        frame(instance, current => {\r
          for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
            const { group, groupIndex, soft } = plan[level];\r
            const steps = layerPasses[level][groupIndex];\r
            if (counts[level] > 0) {\r
              current.pass({ target: group.layer, clear: [0, 0, 0, 0], clearDepth: 1 }, pass => {\r
                pass.draw(shardSolid[level], { instances: counts[level], firstInstance: starts[level] });\r
                pass.draw(shardEdge[level], { instances: counts[level], firstInstance: starts[level] });\r
              });\r
              current.pass({ target: group.shaded, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.shadow));\r
              if (soft) {\r
                current.pass({ target: group.temp, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.blurX));\r
                current.pass({ target: group.blurred, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.blurY));\r
              }\r
            }\r
            current.pass({ target: scene, clear: level === LEVELS - 1 ? [0, 0, 0, 0] : false }, pass => {\r
              if (markerCounts[level] > 0) {\r
                pass.draw(markerDraw, { instances: markerCounts[level], firstInstance: markerStarts[level] });\r
              }\r
              if (counts[level] > 0) pass.draw(soft ? steps.soft : steps.sharp);\r
            });\r
          }\r
          passes.forEach((pass, index) => {\r
            const level = levels[index];\r
            if (!blooming) {\r
              current.pass({ target: level.main, clear: [0, 0, 0, 0] }, () => {});\r
              return;\r
            }\r
            current.pass({ target: level.main, clear: [0, 0, 0, 0] }, p => p.draw(pass.down));\r
            current.pass({ target: level.spare, clear: [0, 0, 0, 0] }, p => p.draw(pass.horizontal));\r
            current.pass({ target: level.main, clear: [0, 0, 0, 0] }, p => p.draw(pass.vertical));\r
          });\r
          current.pass({ target: output, clear: [0, 0, 0, 0] }, pass => pass.draw(finish));\r
        });\r
      };\r
\r
      const tick = (now: number) => {\r
        raf = requestAnimationFrame(tick);\r
        if (!state.visible || document.hidden) {\r
          state.last = now;\r
          return;\r
        }\r
        const s = settingsRef.current;\r
        const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 0;\r
        state.last = now;\r
        const reduced = prefersReduced();\r
        state.clock += dt;\r
        if (state.introAt < 0) state.introAt = state.clock;\r
        if (state.shards.length !== s.count) {\r
          state.shards = createShards(s.count, 1337);\r
          state.order = [];\r
        }\r
        const moving = !s.paused && !reduced;\r
        if (moving) {\r
          for (let level = 0; level < LEVELS; level += 1) {\r
            state.travel[level] = (state.travel[level] + (dt * s.speed * 0.09) / paths[level].length) % 1;\r
          }\r
          state.roll += dt * s.speed * 1.0;\r
          state.twist += dt * s.speed * 0.08;\r
          state.drift += dt * s.speed;\r
        }\r
\r
        const goal = PLACEMENTS.map((_, index) => (index === s.placement ? 1 : 0));\r
        let settling = false;\r
        const decay = Math.exp(-4 * dt);\r
        for (let index = 0; index < 4; index += 1) {\r
          const offset = state.weights[index] - goal[index];\r
          const momentum = state.weightVelocity[index] + 4 * offset;\r
          state.weights[index] = goal[index] + (offset + momentum * dt) * decay;\r
          state.weightVelocity[index] = (state.weightVelocity[index] - 4 * momentum * dt) * decay;\r
          if (Math.abs(state.weights[index] - goal[index]) > 0.0005) settling = true;\r
        }\r
        if (!settling) {\r
          state.weights = goal;\r
          state.weightVelocity = [0, 0, 0, 0];\r
        }\r
\r
        const engaged = s.mouseInteraction && state.inside && !reduced;\r
        state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.25));\r
        const lean = engaged ? s.parallax : 0;\r
        const targetYaw = (state.pointer[0] - 0.5) * lean * 0.14;\r
        const targetPitch = (state.pointer[1] - 0.5) * lean * 0.08;\r
        state.yawVelocity += (38 * (targetYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
        state.pitchVelocity += (38 * (targetPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
        state.yaw += state.yawVelocity * dt;\r
        state.pitch += state.pitchVelocity * dt;\r
        const leaning =\r
          Math.abs(targetYaw - state.yaw) + Math.abs(targetPitch - state.pitch) > 1e-4 ||\r
          Math.abs(state.yawVelocity) + Math.abs(state.pitchVelocity) > 1e-4;\r
\r
        if (\r
          state.pressAt >= 0 &&\r
          state.pressPoint &&\r
          s.holdToGather &&\r
          !reduced &&\r
          state.clock - state.pressAt > 0.18\r
        ) {\r
          if (!state.holding) {\r
            state.holding = true;\r
            updateCamera(s);\r
            rayAt(state.pressPoint[0], state.pressPoint[1]);\r
            const travelTo =\r
              FOCUS / Math.max(ray[0] * cam.forward[0] + ray[1] * cam.forward[1] + ray[2] * cam.forward[2], 0.2);\r
            state.gatherCenter = [\r
              cam.eye[0] + ray[0] * travelTo,\r
              cam.eye[1] + ray[1] * travelTo,\r
              cam.eye[2] + ray[2] * travelTo\r
            ];\r
            state.reach = 0;\r
          }\r
          state.hold = Math.min(1, state.hold + dt / 0.5);\r
          state.reach = Math.min(state.reach + dt * 0.5, 0.55);\r
          const reach = (0.22 + state.reach) / s.scale;\r
          for (const shard of state.shards) {\r
            if (shard.joined || shard.level > 2) continue;\r
            const gx = shard.position[0] - state.gatherCenter[0];\r
            const gy = shard.position[1] - state.gatherCenter[1];\r
            if (gx * gx + gy * gy < reach * reach) shard.joined = true;\r
          }\r
        } else if (state.hold > 0) {\r
          state.hold = Math.max(0, state.hold - dt / 0.3);\r
          if (state.hold === 0) {\r
            for (const shard of state.shards) shard.joined = false;\r
          }\r
        }\r
\r
        for (const ring of state.rings) ring.age += dt;\r
        state.rings = state.rings.filter(ring => ring.age < RING_SECONDS);\r
        if (moving) state.markerDrift += dt * s.speed * 0.045;\r
\r
        const flashing = state.shards.some(\r
          shard => shard.flash > 0.01 || Math.abs(shard.tiltVelocity) > 0.01 || Math.abs(shard.tilt) > 0.01\r
        );\r
        const transient =\r
          settling ||\r
          leaning ||\r
          flashing ||\r
          state.presence > 0.002 ||\r
          state.rings.length > 0 ||\r
          state.hold > 0 ||\r
          (s.intro && !reduced && state.clock - state.introAt < INTRO_SECONDS + 0.5);\r
        if (state.seen !== s || transient || moving) state.quiet = 0;\r
        else state.quiet += 1;\r
        state.seen = s;\r
        if (state.quiet > 30) return;\r
        resize();\r
        render(s, dt, reduced);\r
      };\r
\r
      const local = (event: PointerEvent) => {\r
        const rect = container.getBoundingClientRect();\r
        return {\r
          point: [\r
            (event.clientX - rect.left) / Math.max(rect.width, 1),\r
            (event.clientY - rect.top) / Math.max(rect.height, 1)\r
          ],\r
          inside:\r
            event.clientX >= rect.left &&\r
            event.clientX <= rect.right &&\r
            event.clientY >= rect.top &&\r
            event.clientY <= rect.bottom\r
        };\r
      };\r
\r
      const onMove = (event: PointerEvent) => {\r
        const hit = local(event);\r
        state.inside = hit.inside;\r
        if (hit.inside) state.pointer = hit.point;\r
      };\r
\r
      const onLeave = () => {\r
        state.inside = false;\r
      };\r
\r
      const onDown = (event: PointerEvent) => {\r
        const s = settingsRef.current;\r
        if (event.button !== 0 || prefersReduced() || !s.mouseInteraction) return;\r
        if (\r
          event.target instanceof Element &&\r
          event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
        )\r
          return;\r
        const hit = local(event);\r
        if (!hit.inside) return;\r
        state.pointer = hit.point;\r
        state.pressAt = state.clock;\r
        state.pressPoint = hit.point;\r
      };\r
\r
      const onUp = () => {\r
        const s = settingsRef.current;\r
        if (state.pressAt < 0) return;\r
        if (!state.holding && s.pulseOnClick && state.pressPoint) {\r
          const aspect = output.size[0] / Math.max(output.size[1], 1);\r
          state.rings.push({\r
            x: (state.pressPoint[0] * 2 - 1) * aspect,\r
            y: 1 - state.pressPoint[1] * 2,\r
            age: 0\r
          });\r
          if (state.rings.length > MAX_RINGS) state.rings.shift();\r
        }\r
        if (state.holding) {\r
          for (const shard of state.shards) {\r
            if (shard.joined) shard.tiltVelocity += 9 * shard.sign;\r
          }\r
        }\r
        state.pressAt = -1;\r
        state.holding = false;\r
      };\r
\r
      window.addEventListener('pointermove', onMove, { passive: true });\r
      window.addEventListener('pointerdown', onDown);\r
      window.addEventListener('pointerup', onUp);\r
      window.addEventListener('pointercancel', onUp);\r
      document.documentElement.addEventListener('pointerleave', onLeave);\r
      cleanups.push(() => {\r
        window.removeEventListener('pointermove', onMove);\r
        window.removeEventListener('pointerdown', onDown);\r
        window.removeEventListener('pointerup', onUp);\r
        window.removeEventListener('pointercancel', onUp);\r
        document.documentElement.removeEventListener('pointerleave', onLeave);\r
      });\r
\r
      const visibility = new IntersectionObserver(entries => {\r
        state.visible = entries.some(entry => entry.isIntersecting);\r
      });\r
      visibility.observe(container);\r
      cleanups.push(() => visibility.disconnect());\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    start().catch(fail);\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      cleanups.forEach(cleanup => cleanup());\r
      gpu?.dispose();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,a=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties } from 'react';\r
import { draw, effect, frame, init, sampler, storage, surface, target, uniforms } from 'vgpu';\r
\r
export interface AeroShardsProps {\r
  shardColor?: string;\r
  accentColor?: string;\r
  backgroundColor?: string;\r
  lightMode?: boolean;\r
  placement?: 'full' | 'left' | 'right' | 'center';\r
  material?: 'glass' | 'chrome';\r
  count?: number;\r
  shardSize?: number;\r
  spread?: number;\r
  twist?: number;\r
  billow?: number;\r
  speed?: number;\r
  scale?: number;\r
  depthOfField?: number;\r
  glow?: number;\r
  grain?: number;\r
  vignette?: number;\r
  intro?: boolean;\r
  mouseInteraction?: boolean;\r
  mouseStrength?: number;\r
  markers?: 'plus' | 'dots' | 'none';\r
  pulseOnClick?: boolean;\r
  holdToGather?: boolean;\r
  parallax?: number;\r
  paused?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
  onError?: (error: Error) => void;\r
}\r
\r
type RGB = [number, number, number];\r
\r
interface Shard {\r
  level: number;\r
  phase: number;\r
  lane: number;\r
  layer: number;\r
  size: number;\r
  shape: number[];\r
  sides: number;\r
  thickness: number;\r
  yaw: number;\r
  bank: number;\r
  pitch: number;\r
  tint: number;\r
  drift: number[];\r
  rate: number[];\r
  flutter: number[];\r
  arrive: number;\r
  sign: number;\r
  slot: number[];\r
  offset: number[];\r
  velocity: number[];\r
  tilt: number;\r
  tiltVelocity: number;\r
  flash: number;\r
  gather: number;\r
  joined: boolean;\r
  position: number[];\r
  s: number;\r
}\r
\r
interface Ring {\r
  x: number;\r
  y: number;\r
  age: number;\r
}\r
\r
const ROOT = 'relative h-full w-full overflow-hidden';\r
const CANVAS = 'absolute inset-0 block h-full w-full';\r
\r
const PLACEMENTS = ['full', 'left', 'right', 'center'];\r
const MATERIALS: Record<string, number[]> = {\r
  glass: [0, 0, 0, 0],\r
  chrome: [1, 0, 0, 0]\r
};\r
const FLOATS = 24;\r
const SAMPLES = 160;\r
const CAMERA = 4;\r
const FOCUS = 3.1;\r
const SHARD_FOCUS = 2.75;\r
const LAYER_SCALES = [1, 0.5];\r
const MAX_BANK = 1.0;\r
const DEPTHS = [2.7, 3.9, 5.6, 8.1, 11.6];\r
const SHARE = [0.26, 0.23, 0.2, 0.17, 0.14];\r
const GROWTH = [1, 1.3, 1.8, 2.6, 3.6];\r
const FADE = [1, 0.8, 0.52, 0.32, 0.2];\r
const LEVELS = DEPTHS.length;\r
const INTRO_SECONDS = 3.4;\r
const MARKER_STYLES: Record<string, number> = { plus: 0, dots: 1 };\r
const MARKER_FLOATS = 8;\r
const MARKER_PHASES = [\r
  [0.37, 0.61],\r
  [0.83, 0.12],\r
  [0.21, 0.88],\r
  [0.66, 0.44],\r
  [0.05, 0.27]\r
];\r
const MAX_RINGS = 4;\r
const RING_SECONDS = 2.6;\r
const BLOOM_LEVELS = 4;\r
const FULL_SLOPES = [\r
  [0.2, -0.78],\r
  [-0.72, 0.02],\r
  [0.58, -0.06],\r
  [-0.24, 0.62],\r
  [0.8, 0.3]\r
];\r
const SIDE_OFFSETS = [0.84, 0.62, 0.44, 0.28, 0.14];\r
const RING_SIZES = [\r
  [0.98, 0.78],\r
  [0.9, 0.7],\r
  [0.84, 0.64],\r
  [0.8, 0.6],\r
  [0.76, 0.56]\r
];\r
const TAU = Math.PI * 2;\r
\r
const SHARD_SHADER = \`\r
struct Frame {\r
  view: vec4f,\r
  eye: vec4f,\r
  forward: vec4f,\r
  right: vec4f,\r
  up: vec4f,\r
  shard: vec4f,\r
  accent: vec4f,\r
  marker: vec4f,\r
  surface: vec4f,\r
}\r
\r
struct Layer {\r
  view: vec4f,\r
  look: vec4f,\r
}\r
\r
struct VertexOut {\r
  @builtin(position) position: vec4f,\r
  @location(0) @interpolate(flat, first) center: vec4f,\r
  @location(1) @interpolate(flat, first) axis: vec4f,\r
  @location(2) @interpolate(flat, first) normal: vec4f,\r
  @location(3) @interpolate(flat, first) p01: vec4f,\r
  @location(4) @interpolate(flat, first) p23: vec4f,\r
  @location(5) @interpolate(flat, first) p4: vec4f,\r
  @location(6) @interpolate(flat, first) topA: vec4f,\r
  @location(7) @interpolate(flat, first) topB: vec4f,\r
  @location(8) @interpolate(flat, first) topC: vec4f,\r
  @location(9) @interpolate(flat, first) bottomA: vec4f,\r
  @location(10) @interpolate(flat, first) bottomB: vec4f,\r
  @location(11) @interpolate(flat, first) bottomC: vec4f,\r
}\r
\r
struct FragmentOut {\r
  @location(0) color: vec4f,\r
  @builtin(frag_depth) depth: f32,\r
}\r
\r
@group(0) @binding(0) var<uniform> scene: Frame;\r
@group(0) @binding(1) var<storage, read> shards: array<vec4f>;\r
@group(0) @binding(2) var<uniform> layerInfo: Layer;\r
\r
fn project(world: vec3f) -> vec3f {\r
  let offset = world - scene.eye.xyz;\r
  let depth = max(dot(offset, scene.forward.xyz), 0.05);\r
  let x = dot(offset, scene.right.xyz);\r
  let y = dot(offset, scene.up.xyz);\r
  return vec3f(layerInfo.view.x * 0.5 + x * layerInfo.view.z / depth, layerInfo.view.y * 0.5 - y * layerInfo.view.z / depth, depth);\r
}\r
\r
@vertex\r
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> VertexOut {\r
  let index = instance * 6u;\r
  let a = shards[index];\r
  let b = shards[index + 1u];\r
  let c = shards[index + 2u];\r
  let d = shards[index + 3u];\r
  let e = shards[index + 4u];\r
  let f = shards[index + 5u];\r
  let center = a.xyz;\r
  let size = a.w;\r
  let axis = normalize(b.xyz);\r
  let normal = normalize(c.xyz);\r
  let side = normalize(cross(normal, axis));\r
\r
  var out: VertexOut;\r
  let middle = project(center);\r
  if (middle.z < 0.35 || size <= 0.0) {\r
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);\r
    return out;\r
  }\r
\r
  let count = i32(f.z);\r
  let points = array<vec2f, 5>(d.xy, d.zw, e.xy, e.zw, f.xy);\r
  var low = vec2f(1e9);\r
  var high = vec2f(-1e9);\r
  var tops = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));\r
  var bottoms = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));\r
  for (var i = 0; i < 5; i += 1) {\r
    let corner = points[min(i, count - 1)];\r
    let onPlate = center + (axis * corner.x + side * corner.y) * size;\r
    let top = project(onPlate + normal * b.w * size);\r
    let bottom = project(onPlate - normal * b.w * size);\r
    tops[i] = top.xy;\r
    bottoms[i] = bottom.xy;\r
    low = min(low, min(top.xy, bottom.xy));\r
    high = max(high, max(top.xy, bottom.xy));\r
  }\r
  low -= vec2f(2.0);\r
  high += vec2f(2.0);\r
  let corners = array<vec2f, 6>(vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0), vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0));\r
  let pixel = mix(low, high, corners[vertexIndex]);\r
  out.position = vec4f(pixel.x / layerInfo.view.x * 2.0 - 1.0, 1.0 - pixel.y / layerInfo.view.y * 2.0, 0.5, 1.0);\r
  out.center = a;\r
  out.axis = vec4f(axis, b.w);\r
  out.normal = vec4f(normal, c.w);\r
  out.p01 = d;\r
  out.p23 = e;\r
  out.p4 = f;\r
  out.topA = vec4f(tops[0], tops[1]);\r
  out.topB = vec4f(tops[2], tops[3]);\r
  out.topC = vec4f(tops[4], 0.0, 0.0);\r
  out.bottomA = vec4f(bottoms[0], bottoms[1]);\r
  out.bottomB = vec4f(bottoms[2], bottoms[3]);\r
  out.bottomC = vec4f(bottoms[4], 0.0, 0.0);\r
  return out;\r
}\r
\r
fn cross2(a: vec2f, b: vec2f) -> f32 {\r
  return a.x * b.y - a.y * b.x;\r
}\r
\r
fn outlineCoverage(p: vec2f, points: array<vec2f, 5>, count: i32) -> f32 {\r
  var area = 0.0;\r
  for (var i = 0; i < 5; i += 1) {\r
    if (i < count) {\r
      area += cross2(points[i], points[(i + 1) % count]);\r
    }\r
  }\r
  let orient = select(-1.0, 1.0, area > 0.0);\r
  var distance = -1e9;\r
  for (var i = 0; i < 5; i += 1) {\r
    if (i < count) {\r
      let a = points[i];\r
      let edge = points[(i + 1) % count] - a;\r
      let span = length(edge);\r
      if (span > 1e-4) {\r
        let n = vec2f(edge.y, -edge.x) * (orient / span);\r
        distance = max(distance, dot(p - a, n));\r
      }\r
    }\r
  }\r
  return clamp(0.5 - distance, 0.0, 1.0);\r
}\r
\r
struct Prism {\r
  points: array<vec2f, 5>,\r
  count: i32,\r
  half: f32,\r
}\r
\r
struct Hit {\r
  near: f32,\r
  far: f32,\r
  normal: vec3f,\r
}\r
\r
fn plane(prism: Prism, k: i32) -> vec4f {\r
  if (k == 0) { return vec4f(0.0, 0.0, 1.0, prism.half); }\r
  if (k == 1) { return vec4f(0.0, 0.0, -1.0, prism.half); }\r
  let a = prism.points[k - 2];\r
  let b = prism.points[(k - 1) % prism.count];\r
  let edge = b - a;\r
  let n = normalize(vec2f(edge.y, -edge.x));\r
  return vec4f(n, 0.0, dot(n, a));\r
}\r
\r
fn trace(prism: Prism, ro: vec3f, rd: vec3f) -> Hit {\r
  var hit: Hit;\r
  hit.near = -1e9;\r
  hit.far = 1e9;\r
  hit.normal = vec3f(0.0, 0.0, 1.0);\r
  for (var k = 0; k < 7; k += 1) {\r
    if (k < prism.count + 2) {\r
      let p = plane(prism, k);\r
      let denom = dot(p.xyz, rd);\r
      let gap = p.w - dot(p.xyz, ro);\r
      if (abs(denom) < 1e-7) {\r
        if (gap < 0.0) { hit.far = -1e9; }\r
      } else {\r
        let t = gap / denom;\r
        if (denom < 0.0) {\r
          if (t > hit.near) {\r
            hit.near = t;\r
            hit.normal = p.xyz;\r
          }\r
        } else if (t < hit.far) {\r
          hit.far = t;\r
        }\r
      }\r
    }\r
  }\r
  return hit;\r
}\r
\r
fn exitFrom(prism: Prism, ro: vec3f, rd: vec3f) -> vec4f {\r
  var best = 1e9;\r
  var normal = vec3f(0.0, 0.0, -1.0);\r
  for (var k = 0; k < 7; k += 1) {\r
    if (k < prism.count + 2) {\r
      let p = plane(prism, k);\r
      let denom = dot(p.xyz, rd);\r
      if (denom > 1e-6) {\r
        let t = (p.w - dot(p.xyz, ro)) / denom;\r
        if (t < best) {\r
          best = t;\r
          normal = p.xyz;\r
        }\r
      }\r
    }\r
  }\r
  return vec4f(normal, max(best, 0.0));\r
}\r
\r
fn rectLight(r: vec3f, dir: vec3f, across: vec3f, extent: vec2f, soft: f32) -> f32 {\r
  let facing = dot(r, dir);\r
  if (facing <= 0.0) { return 0.0; }\r
  let up = cross(dir, across);\r
  let u = dot(r, across) / facing;\r
  let v = dot(r, up) / facing;\r
  let a = 1.0 - smoothstep(extent.x - soft, extent.x + soft, abs(u));\r
  let b = 1.0 - smoothstep(extent.y - soft, extent.y + soft, abs(v));\r
  return a * b;\r
}\r
\r
const KEY_DIR = vec3f(-0.28, 0.72, 0.64) / length(vec3f(-0.28, 0.72, 0.64));\r
const KEY_ACROSS = vec3f(0.92, 0.0, 0.4) / length(vec3f(0.92, 0.0, 0.4));\r
const LEFT_DIR = vec3f(-0.86, 0.12, 0.5) / length(vec3f(-0.86, 0.12, 0.5));\r
const LEFT_ACROSS = vec3f(0.5, 0.0, 0.86) / length(vec3f(0.5, 0.0, 0.86));\r
const RIM_DIR = vec3f(0.78, 0.22, -0.58) / length(vec3f(0.78, 0.22, -0.58));\r
const RIM_ACROSS = vec3f(0.6, 0.0, 0.8) / length(vec3f(0.6, 0.0, 0.8));\r
const TOP_DIR = vec3f(0.05, 0.94, -0.33) / length(vec3f(0.05, 0.94, -0.33));\r
const TOP_ACROSS = vec3f(1.0, 0.0, 0.0);\r
\r
fn lobe(r: vec3f, dir: vec3f, width: f32) -> f32 {\r
  return exp((dot(r, dir) - 1.0) / (width * width));\r
}\r
\r
fn studio(r: vec3f, soft: f32, accent: vec3f, ink: vec3f) -> vec3f {\r
  let sky = clamp(r.y * 0.5 + 0.5, 0.0, 1.0);\r
  var col = mix(ink * 0.03, ink * 0.12 + accent * 0.03, smoothstep(0.25, 0.95, sky));\r
  col += mix(ink, vec3f(1.0), 0.6) * lobe(r, KEY_DIR, 0.38) * 3.6;\r
  col += mix(accent, vec3f(1.0), 0.2) * lobe(r, RIM_DIR, 0.34) * 3.4;\r
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.12, 0.8), 0.08 + soft) * 3.2;\r
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, TOP_DIR, TOP_ACROSS, vec2f(0.9, 0.1), 0.08 + soft) * 2.6;\r
  return col;\r
}\r
\r
fn studioLight(r: vec3f, soft: f32, accent: vec3f) -> vec3f {\r
  let ground = vec3f(0.2, 0.2, 0.23);\r
  let skyTone = vec3f(0.97, 0.97, 0.99);\r
  var col = mix(ground, skyTone, smoothstep(-0.08 - soft, 0.16 + soft, r.y));\r
  col = mix(col, vec3f(0.55, 0.55, 0.6), lobe(r, vec3f(0.0, -1.0, 0.0), 0.5) * 0.4);\r
  col += vec3f(0.4) * rectLight(r, KEY_DIR, KEY_ACROSS, vec2f(0.46, 0.3), 0.07 + soft);\r
  col -= vec3f(0.55) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.1, 0.85), 0.05 + soft);\r
  col -= vec3f(0.45) * rectLight(r, RIM_DIR, RIM_ACROSS, vec2f(0.12, 0.9), 0.05 + soft);\r
  return clamp(col, vec3f(0.05), vec3f(1.2));\r
}\r
\r
fn schlick(cosine: f32, f0: f32) -> f32 {\r
  return f0 + (1.0 - f0) * pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);\r
}\r
\r
fn rayFor(pixel: vec2f) -> vec3f {\r
  let x = pixel.x - layerInfo.view.x * 0.5;\r
  let y = layerInfo.view.y * 0.5 - pixel.y;\r
  return normalize(scene.forward.xyz * layerInfo.view.z + scene.right.xyz * x + scene.up.xyz * y);\r
}\r
\r
struct Surface {\r
  coverage: f32,\r
  color: vec3f,\r
  alpha: f32,\r
  depth: f32,\r
}\r
\r
fn shade(pixel: vec2f, in: VertexOut) -> Surface {\r
  let center = in.center.xyz;\r
  let size = in.center.w;\r
  let axis = in.axis.xyz;\r
  let plateNormal = in.normal.xyz;\r
  let side = normalize(cross(plateNormal, axis));\r
  var prism: Prism;\r
  prism.points = array<vec2f, 5>(in.p01.xy, in.p01.zw, in.p23.xy, in.p23.zw, in.p4.xy);\r
  prism.count = i32(in.p4.z);\r
  prism.half = in.axis.w;\r
\r
  let eye = scene.eye.xyz;\r
  let toLocal = mat3x3f(axis.x, side.x, plateNormal.x, axis.y, side.y, plateNormal.y, axis.z, side.z, plateNormal.z);\r
  let fromLocal = mat3x3f(axis, side, plateNormal);\r
  let origin = toLocal * (eye - center) / size;\r
\r
  let rd = rayFor(pixel);\r
  let ray = toLocal * rd;\r
  let denom = dot(ray, vec3f(0.0, 0.0, 1.0));\r
  let flatT = -origin.z / select(denom, 1e-4, abs(denom) < 1e-4);\r
  let flatPoint = origin.xy + ray.xy * flatT;\r
  let footprint = max(length(fwidth(flatPoint)) * 0.7, 1e-4);\r
  let softBase = clamp(length(fwidth(reflect(rd, plateNormal))) * 0.5, 0.0, 0.5);\r
\r
  let primary = trace(prism, origin, ray);\r
  let tops = array<vec2f, 5>(in.topA.xy, in.topA.zw, in.topB.xy, in.topB.zw, in.topC.xy);\r
  let bottoms = array<vec2f, 5>(in.bottomA.xy, in.bottomA.zw, in.bottomB.xy, in.bottomB.zw, in.bottomC.xy);\r
  let coverage = max(outlineCoverage(pixel, tops, prism.count), outlineCoverage(pixel, bottoms, prism.count));\r
\r
  var surface: Surface;\r
  let facing = select(-1.0, 1.0, origin.z > 0.0);\r
  let capT = (facing * prism.half - origin.z) / select(ray.z, -1e-4 * facing, abs(ray.z) < 1e-4);\r
  let missed = primary.near > primary.far;\r
  let hitT = select(primary.near, capT, missed);\r
  let hitNormal = select(primary.normal, vec3f(0.0, 0.0, facing), missed);\r
  surface.coverage = select(0.0, coverage, hitT > 0.0);\r
  surface.color = vec3f(0.0);\r
  surface.alpha = 0.0;\r
  surface.depth = 1.0;\r
  if (surface.coverage <= 0.0) { return surface; }\r
  let mainRay = ray;\r
\r
  let local = origin + mainRay * hitT;\r
  let worldRay = fromLocal * mainRay;\r
  let viewDepth = max(hitT * size * dot(worldRay, scene.forward.xyz), 0.05);\r
  surface.depth = clamp(1.0 - 0.3 / viewDepth, 0.0, 1.0);\r
\r
  let radius = max(prism.half * 1.15, footprint * 2.5);\r
  var n = hitNormal;\r
  var bevel = 0.0;\r
  if (abs(n.z) > 0.5) {\r
    var gap = 1e9;\r
    for (var k = 2; k < 7; k += 1) {\r
      if (k < prism.count + 2) {\r
        let p = plane(prism, k);\r
        gap = min(gap, p.w - dot(p.xy, local.xy));\r
      }\r
    }\r
    var toward = vec2f(0.0);\r
    for (var k = 2; k < 7; k += 1) {\r
      if (k < prism.count + 2) {\r
        let p = plane(prism, k);\r
        let g = p.w - dot(p.xy, local.xy);\r
        toward += p.xy * exp(-(g - gap) / (radius * 0.35));\r
      }\r
    }\r
    toward = normalize(toward);\r
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);\r
    let angle = bevel * bevel * 0.7853982;\r
    n = normalize(n * cos(angle) + vec3f(toward, 0.0) * sin(angle));\r
  } else {\r
    let gap = prism.half - abs(local.z);\r
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);\r
    let angle = bevel * bevel * 0.7853982;\r
    n = normalize(n * cos(angle) + vec3f(0.0, 0.0, sign(local.z)) * sin(angle));\r
  }\r
  let bendRate = 1.8 / max(radius / footprint, 1.0);\r
  let normal = normalize(fromLocal * n);\r
  let view = -worldRay;\r
  let reflected = reflect(worldRay, normal);\r
  let soft = softBase + bendRate * smoothstep(0.0, 0.25, bevel) * 1.2 + clamp(footprint * 0.6, 0.0, 0.5);\r
  let ndv = clamp(dot(normal, view), 0.0, 1.0);\r
\r
  let accent = scene.accent.rgb;\r
  let base = scene.shard.rgb;\r
  let world = center + fromLocal * local * size;\r
  let height = clamp(0.5 + world.y * 0.45, 0.0, 1.0);\r
  let tone = mix(accent, base, height);\r
  let body = mix(tone, mix(base, accent, 0.5), in.normal.w * 0.3);\r
  let mode = scene.surface.x;\r
  let lightMode = scene.up.w > 0.5;\r
  let wrap = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);\r
\r
  var color = vec3f(0.0);\r
  var alpha = 1.0;\r
  let chrome = mode > 0.5;\r
  if (lightMode) {\r
    let env = studioLight(reflected, soft, accent);\r
    if (chrome) {\r
      color = env * mix(body, vec3f(1.0), 0.6);\r
    } else {\r
      let fresnel = schlick(ndv, 0.05);\r
      let diffuse = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);\r
      alpha = clamp(0.32 + fresnel * 0.5 + (1.0 - abs(n.z)) * 0.5, 0.0, 1.0);\r
      color = mix(body, vec3f(1.0), 0.15) * (0.5 + 0.4 * diffuse) * alpha + (env - vec3f(0.78)) * fresnel * 0.8;\r
    }\r
  } else if (chrome) {\r
    let env = studio(reflected, soft, accent, body);\r
    color = env * mix(body, vec3f(1.0), 0.55) * 0.9 + body * 0.02;\r
  } else {\r
    let fresnel = schlick(ndv, 0.04);\r
    let env = studio(reflected, soft, accent, body);\r
    var light = vec3f(0.0);\r
    var cursor = local;\r
    var direction = toLocal * refract(worldRay, normal, 1.0 / 1.5);\r
    var travelled = 0.0;\r
    var carry = 1.0 - fresnel;\r
    var through = 0.0;\r
    for (var bounce = 0; bounce < 3; bounce += 1) {\r
      let outlet = exitFrom(prism, cursor, direction);\r
      travelled += outlet.w;\r
      cursor = cursor + direction * outlet.w;\r
      let outward = outlet.xyz;\r
      let escaped = refract(direction, -outward, 1.5);\r
      if (dot(escaped, escaped) > 0.0) {\r
        let leave = schlick(dot(direction, outward), 0.04);\r
        let worldOut = normalize(fromLocal * escaped);\r
        let absorb = exp(-(vec3f(1.0) - body) * travelled * size * 22.0);\r
        let straight = smoothstep(0.97, 0.999, dot(worldOut, worldRay));\r
        let energy = carry * (1.0 - leave);\r
        light += studio(worldOut, soft * 2.0 + 0.04, accent, body) * absorb * energy * (1.0 - straight) * 2.0;\r
        through += energy * straight * (absorb.r + absorb.g + absorb.b) / 3.0;\r
        carry *= leave;\r
      }\r
      direction = reflect(direction, outward);\r
    }\r
    let edge = max(pow(1.0 - abs(n.z), 1.2), bevel * bevel * 0.85);\r
    let glow = mix(mix(body, accent, 0.35), vec3f(1.0), 0.28) * edge * (0.35 + 0.45 * wrap);\r
    color = env * fresnel * 0.85 + light * (1.0 - smoothstep(0.0, 0.6, bevel)) + body * 0.02 + glow;\r
    alpha = clamp(1.0 - through + edge * 0.25, 0.0, 1.0);\r
  }\r
\r
  color *= select(1.3, 1.0, lightMode);\r
  let haze = smoothstep(3.5, 12.0, viewDepth) * layerInfo.look.x;\r
  let hazeColor = select(mix(base, accent, 0.5) * 0.3, mix(base, vec3f(1.0), 0.72), lightMode);\r
  color = mix(color, hazeColor * alpha + color * 0.3, haze);\r
  let flash = in.p4.w;\r
  color += mix(accent, vec3f(1.0), 0.35) * flash * select(0.5, 0.0, lightMode) * max(alpha, 0.35);\r
  alpha = max(alpha, flash * 0.45 * select(1.0, 0.0, lightMode));\r
  surface.color = color;\r
  surface.alpha = alpha;\r
  return surface;\r
}\r
\r
@fragment\r
fn fs_solid(in: VertexOut) -> FragmentOut {\r
  let surface = shade(in.position.xy, in);\r
  if (surface.coverage < 0.999 || surface.alpha < 0.6) { discard; }\r
  var out: FragmentOut;\r
  out.color = vec4f(surface.color, surface.alpha);\r
  out.depth = surface.depth;\r
  return out;\r
}\r
\r
@fragment\r
fn fs_edge(in: VertexOut) -> FragmentOut {\r
  let surface = shade(in.position.xy, in);\r
  if (surface.coverage <= 0.001 || (surface.coverage >= 0.9996 && surface.alpha >= 0.62)) { discard; }\r
  var out: FragmentOut;\r
  out.color = vec4f(surface.color, surface.alpha) * surface.coverage;\r
  out.depth = surface.depth;\r
  return out;\r
}\r
\`;\r
\r
const LAYER_BLUR_SHADER = \`\r
struct Spread { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> spreadInfo: Spread;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let sigma = max(spreadInfo.texel.z, 0.3);\r
  let reach = min(i32(ceil(sigma * 2.6)), 20);\r
  var total = textureSampleLevel(source, linearSampler, uv, 0.0);\r
  var weight = 1.0;\r
  for (var i = 1; i <= reach; i += 1) {\r
    let w = exp(-f32(i * i) / (2.0 * sigma * sigma));\r
    let o = spreadInfo.texel.xy * f32(i);\r
    total += (textureSampleLevel(source, linearSampler, uv + o, 0.0) + textureSampleLevel(source, linearSampler, uv - o, 0.0)) * w;\r
    weight += 2.0 * w;\r
  }\r
  return total / weight;\r
}\r
\`;\r
\r
const SHADOW_SHADER = \`\r
struct Shade {\r
  info: vec4f,\r
  more: vec4f,\r
}\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var depthMap: texture_depth_2d;\r
@group(0) @binding(2) var<uniform> shadeInfo: Shade;\r
\r
@fragment\r
fn fs_main(@builtin(position) pixel: vec4f) -> @location(0) vec4f {\r
  let bounds = vec2i(textureDimensions(source)) - vec2i(1);\r
  let here = vec2i(pixel.xy);\r
  let color = textureLoad(source, here, 0);\r
  if (color.a <= 0.002 || shadeInfo.info.z <= 0.0) { return color; }\r
  let depth = textureLoad(depthMap, here, 0);\r
  let east = textureLoad(depthMap, clamp(here + vec2i(1, 0), vec2i(0), bounds), 0);\r
  let west = textureLoad(depthMap, clamp(here - vec2i(1, 0), vec2i(0), bounds), 0);\r
  let south = textureLoad(depthMap, clamp(here + vec2i(0, 1), vec2i(0), bounds), 0);\r
  let north = textureLoad(depthMap, clamp(here - vec2i(0, 1), vec2i(0), bounds), 0);\r
  let limit = shadeInfo.more.x * 0.5;\r
  let slopeX = clamp(select(east - depth, depth - west, abs(depth - west) < abs(east - depth)), -limit, limit);\r
  let slopeY = clamp(select(south - depth, depth - north, abs(depth - north) < abs(south - depth)), -limit, limit);\r
  var occlusion = 0.0;\r
  for (var i = 1; i <= 12; i += 1) {\r
    let offset = -shadeInfo.info.xy * f32(i);\r
    let probe = clamp(vec2i(pixel.xy + offset), vec2i(0), bounds);\r
    let other = textureLoad(depthMap, probe, 0);\r
    let expected = depth + slopeX * offset.x + slopeY * offset.y;\r
    let closer = smoothstep(shadeInfo.more.x * 0.6, shadeInfo.more.x * 2.4, expected - other);\r
    let reach = 1.0 - f32(i - 1) / 12.0;\r
    occlusion = max(occlusion, closer * reach * reach);\r
  }\r
  return vec4f(color.rgb * (1.0 - occlusion * shadeInfo.info.z), color.a);\r
}\r
\`;\r
\r
const COMPOSITE_SHADER = \`\r
struct Blend { info: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> mixInfo: Blend;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  return textureSampleLevel(source, linearSampler, uv, 0.0) * mixInfo.info.x;\r
}\r
\`;\r
\r
const MARKER_SHADER = \`\r
struct Frame {\r
  view: vec4f,\r
  eye: vec4f,\r
  forward: vec4f,\r
  right: vec4f,\r
  up: vec4f,\r
  shard: vec4f,\r
  accent: vec4f,\r
  marker: vec4f,\r
  surface: vec4f,\r
}\r
\r
struct MarkerOut {\r
  @builtin(position) position: vec4f,\r
  @location(0) local: vec2f,\r
  @location(1) @interpolate(flat, first) shape: vec4f,\r
  @location(2) @interpolate(flat, first) light: vec4f,\r
}\r
\r
@group(0) @binding(0) var<uniform> scene: Frame;\r
@group(0) @binding(1) var<storage, read> markers: array<vec4f>;\r
\r
@vertex\r
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> MarkerOut {\r
  let a = markers[instance * 2u];\r
  let b = markers[instance * 2u + 1u];\r
  let offset = a.xyz - scene.eye.xyz;\r
  let depth = max(dot(offset, scene.forward.xyz), 0.05);\r
  let center = vec2f(\r
    scene.view.x * 0.5 + dot(offset, scene.right.xyz) * scene.view.z / depth,\r
    scene.view.y * 0.5 - dot(offset, scene.up.xyz) * scene.view.z / depth,\r
  );\r
  let pixel = scene.marker.y;\r
  let size = scene.marker.z * clamp(sqrt(scene.marker.w / depth), 0.6, 1.3) * b.z;\r
  let blur = min(scene.forward.w * abs(1.0 - scene.eye.w / depth), scene.right.w) * 0.18;\r
  let frame = b.y;\r
  let reach = select(size, size * 2.6, frame > 0.001) + blur + 1.5 * pixel;\r
  let corners = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0));\r
  let corner = corners[vertexIndex % 6u] * reach;\r
  var out: MarkerOut;\r
  if (depth < 0.35 || a.w <= 0.002) {\r
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);\r
    return out;\r
  }\r
  let at = center + corner;\r
  out.position = vec4f(at.x / scene.view.x * 2.0 - 1.0, 1.0 - at.y / scene.view.y * 2.0, 0.5, 1.0);\r
  out.local = corner;\r
  out.shape = vec4f(size, blur, frame, pixel);\r
  out.light = vec4f(b.x, a.w, 0.0, 0.0);\r
  return out;\r
}\r
\r
fn bar(value: f32, edge: f32, soft: f32) -> f32 {\r
  return clamp((edge - value) / soft + 0.5, 0.0, 1.0);\r
}\r
\r
@fragment\r
fn fs_main(in: MarkerOut) -> @location(0) vec4f {\r
  let size = in.shape.x;\r
  let blur = in.shape.y;\r
  let frame = in.shape.z;\r
  let pixel = in.shape.w;\r
  let q = abs(in.local);\r
  let soft = 1.0 + blur;\r
  let thick = 0.6 * pixel + blur * 0.5;\r
  let energy = (0.6 * pixel) / thick;\r
  var cover = 0.0;\r
  if (scene.marker.x < 0.5) {\r
    let across = bar(q.x, size, soft) * bar(q.y, thick, soft);\r
    let down = bar(q.y, size, soft) * bar(q.x, thick, soft);\r
    cover = max(across, down) * energy;\r
  } else {\r
    cover = bar(length(in.local), size * 0.42 + blur * 0.3, soft) * mix(1.0, energy, 0.6);\r
  }\r
  if (frame > 0.001) {\r
    let edge = size * 2.3;\r
    let span = edge * 0.45;\r
    let line = 0.5 * pixel;\r
    let sides = bar(abs(q.x - edge), line, 1.0) * bar(edge - span - q.y, 0.0, 1.0) * bar(q.y - edge - line, 0.0, 1.0);\r
    let caps = bar(abs(q.y - edge), line, 1.0) * bar(edge - span - q.x, 0.0, 1.0) * bar(q.x - edge - line, 0.0, 1.0);\r
    cover = max(cover, max(sides, caps) * frame * 0.85);\r
  }\r
  let glow = in.light.x;\r
  let fade = in.light.y;\r
  let tint = mix(scene.shard.rgb, scene.accent.rgb, 0.4);\r
  if (scene.up.w > 0.5) {\r
    let ink = (1.0 - exp(-glow * 1.6)) * 0.85 * cover * fade;\r
    return vec4f(mix(tint, scene.accent.rgb, 0.5) * 0.55 * ink, ink);\r
  }\r
  let light = cover * glow * fade;\r
  let color = (1.0 - exp(-mix(tint, vec3f(1.0), 0.35) * light * 1.6)) * 1.4;\r
  return vec4f(color, max(max(color.r, color.g), color.b) * 0.8);\r
}\r
\`;\r
\r
const PREFILTER_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
fn bright(uv: vec2f) -> vec3f {\r
  let color = textureSampleLevel(source, linearSampler, uv, 0.0).rgb;\r
  let peak = max(max(color.r, color.g), color.b);\r
  return color * smoothstep(bloom.texel.z, bloom.texel.z + bloom.texel.w, peak);\r
}\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let o = bloom.texel.xy;\r
  let total = bright(uv + vec2f(o.x, o.y)) + bright(uv + vec2f(-o.x, o.y)) + bright(uv + vec2f(o.x, -o.y)) + bright(uv - o);\r
  return vec4f(total * 0.25, 0.0);\r
}\r
\`;\r
\r
const DOWNSAMPLE_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let o = bloom.texel.xy;\r
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.25;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(-o.x, o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, -o.y), 0.0) * 0.1875;\r
  color += textureSampleLevel(source, linearSampler, uv - o, 0.0) * 0.1875;\r
  return color;\r
}\r
\`;\r
\r
const BLUR_SHADER = \`\r
struct Bloom { texel: vec4f }\r
@group(0) @binding(0) var source: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var<uniform> bloom: Bloom;\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {\r
  let delta = bloom.texel.xy;\r
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.181862;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 1.423135, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 1.423135, 0.0)) * 0.284316;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 3.326702, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 3.326702, 0.0)) * 0.106598;\r
  color += (textureSampleLevel(source, linearSampler, uv + delta * 5.242989, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 5.242989, 0.0)) * 0.018156;\r
  return color;\r
}\r
\`;\r
\r
const FINISH_SHADER = \`\r
struct Finish {\r
  info: vec4f,\r
  paper: vec4f,\r
  mode: vec4f,\r
}\r
@group(0) @binding(0) var sceneTexture: texture_2d<f32>;\r
@group(0) @binding(1) var linearSampler: sampler;\r
@group(0) @binding(2) var bloom0: texture_2d<f32>;\r
@group(0) @binding(3) var bloom1: texture_2d<f32>;\r
@group(0) @binding(4) var bloom2: texture_2d<f32>;\r
@group(0) @binding(5) var bloom3: texture_2d<f32>;\r
@group(0) @binding(6) var<uniform> finish: Finish;\r
\r
fn hash12(value: vec2f) -> f32 {\r
  let p = fract(value * vec2f(0.1031, 0.1030));\r
  let mixed = p + dot(p, p.yx + 33.33);\r
  return fract((mixed.x + mixed.y) * mixed.x);\r
}\r
\r
fn smootherstep(x: f32) -> f32 {\r
  let t = clamp(x, 0.0, 1.0);\r
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\r
}\r
\r
@fragment\r
fn fs_main(@location(0) uv: vec2f, @builtin(position) pixel: vec4f) -> @location(0) vec4f {\r
  let scene = textureLoad(sceneTexture, vec2i(pixel.xy), 0);\r
  let alpha = clamp(scene.a, 0.0, 1.0);\r
  let noise = hash12(floor(pixel.xy) + vec2f(finish.info.y, finish.info.y * 1.618)) - 0.5;\r
  let grain = 1.0 + noise * finish.info.x;\r
  var rgb = vec3f(0.0);\r
  var a = alpha;\r
  if (finish.mode.x > 0.5) {\r
    rgb = clamp(scene.rgb, vec3f(0.0), vec3f(alpha)) * grain;\r
  } else {\r
    var halo = textureSampleLevel(bloom0, linearSampler, uv, 0.0).rgb * 0.4;\r
    halo += textureSampleLevel(bloom1, linearSampler, uv, 0.0).rgb * 0.3;\r
    halo += textureSampleLevel(bloom2, linearSampler, uv, 0.0).rgb * 0.2;\r
    halo += textureSampleLevel(bloom3, linearSampler, uv, 0.0).rgb * 0.1;\r
    halo = halo * finish.info.z;\r
    rgb = (1.0 - exp(-max(scene.rgb, vec3f(0.0)) * finish.info.w)) * grain + halo / (1.0 + halo);\r
    a = max(alpha, max(max(rgb.r, rgb.g), rgb.b));\r
  }\r
  let vignette = finish.mode.y;\r
  if (vignette > 0.0) {\r
    let size = vec2f(textureDimensions(sceneTexture));\r
    let reach = max(vignette * 0.5 * min(size.x, size.y), 1.0);\r
    let fromEdge = min(pixel.xy, size - pixel.xy);\r
    let mask = smootherstep(fromEdge.x / reach) * smootherstep(fromEdge.y / reach);\r
    rgb *= mask;\r
    a *= mask;\r
  }\r
  rgb = clamp(rgb, vec3f(0.0), vec3f(max(a, 0.0)));\r
  if (finish.paper.a > 0.5) {\r
    return vec4f(finish.paper.rgb * (1.0 - a) + rgb, 1.0);\r
  }\r
  return vec4f(rgb, a);\r
}\r
\`;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
\r
const smoother = (x: number) => {\r
  const t = clamp(x, 0, 1);\r
  return t * t * t * (t * (t * 6 - 15) + 10);\r
};\r
\r
let probe: CanvasRenderingContext2D | null = null;\r
\r
const parseColor = (value: string, fallback: RGB | null): RGB | null => {\r
  if (value === 'transparent') return null;\r
  if (typeof document === 'undefined') return fallback;\r
  if (!probe) probe = document.createElement('canvas').getContext('2d');\r
  if (!probe) return fallback;\r
  probe.fillStyle = '#000000';\r
  probe.fillStyle = value;\r
  const text = probe.fillStyle;\r
  if (text.startsWith('#')) {\r
    const hex = parseInt(text.slice(1), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const match = /rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/.exec(text);\r
  if (!match) return fallback;\r
  if (match[4] !== undefined && Number(match[4]) === 0) return null;\r
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];\r
};\r
\r
const prefersReduced = () =>\r
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);\r
\r
const latticeHash = (a: number, b: number, c: number, d: number) => {\r
  let h = Math.imul(a + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);\r
  h ^= Math.imul(c + 0x27d4eb2f, 0x165667b1) ^ Math.imul(d + 0x7f4a7c15, 0x9e3779b1);\r
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);\r
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);\r
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;\r
};\r
\r
const random = (seed: number) => () => {\r
  seed = (seed + 0x6d2b79f5) | 0;\r
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);\r
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\r
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\r
};\r
\r
const ribbonPoint = (placement: number, level: number, s: number, aspect: number, out: number[]) => {\r
  let u;\r
  let v;\r
  let d;\r
  if (placement === 0) {\r
    u = -1.32 + 2.64 * s;\r
    const slope = FULL_SLOPES[level];\r
    v =\r
      slope[0] +\r
      (slope[1] - slope[0]) * s +\r
      0.1 * Math.sin(s * TAU * 0.7 + level * 2.3) +\r
      0.045 * Math.sin(s * TAU * 1.9 + level);\r
    d = DEPTHS[level] + 0.35 * Math.sin(s * Math.PI * 1.4 + level * 1.9);\r
  } else if (placement === 3) {\r
    const angle = s * TAU + level * 0.9 + Math.PI * 0.5;\r
    const size = RING_SIZES[level];\r
    u = Math.cos(angle) * size[0];\r
    v = Math.sin(angle) * size[1] - 0.02;\r
    d = DEPTHS[level] * 1.1 - Math.sin(angle) * (0.5 + level * 0.25);\r
  } else {\r
    const mirror = placement === 1 ? -1 : 1;\r
    v = 1.32 - 2.64 * s;\r
    u =\r
      mirror *\r
      (SIDE_OFFSETS[level] +\r
        0.1 * Math.sin(s * TAU * 0.6 + level * 1.3) +\r
        0.03 * Math.sin(s * TAU * 2.1 + level) -\r
        0.08 * (1 - s));\r
    d = DEPTHS[level] + 0.3 * Math.sin(s * Math.PI * 1.2 + level);\r
  }\r
  out[0] = (u * aspect * d) / CAMERA;\r
  out[1] = (v * d) / CAMERA;\r
  out[2] = CAMERA - d;\r
  return out;\r
};\r
\r
const createShards = (count: number, seed: number): Shard[] => {\r
  const next = random(seed);\r
  const shards: Shard[] = [];\r
  let made = 0;\r
  for (let level = 0; level < LEVELS; level += 1) {\r
    const amount = level === LEVELS - 1 ? count - made : Math.round(count * SHARE[level]);\r
    made += amount;\r
    for (let index = 0; index < amount; index += 1) {\r
      const flat = next() * 2 - 1;\r
      const family = next();\r
      const outline = [];\r
      if (family < 0.55) {\r
        const spread = 0.17 + next() * 0.15;\r
        outline.push([1, (next() - 0.5) * 0.08]);\r
        outline.push([-0.5 - next() * 0.25, spread * (0.8 + next() * 0.4)]);\r
        outline.push([-0.5 - next() * 0.25, -spread * (0.8 + next() * 0.4)]);\r
      } else if (family < 0.8) {\r
        const spread = 0.2 + next() * 0.14;\r
        outline.push([1, 0]);\r
        outline.push([(next() - 0.3) * 0.5, spread]);\r
        outline.push([-0.55 - next() * 0.2, (next() - 0.5) * 0.1]);\r
        outline.push([(next() - 0.3) * 0.5, -spread * (0.8 + next() * 0.4)]);\r
      } else {\r
        const sides = next() < 0.5 ? 4 : 5;\r
        const stretch = 0.4 + next() * 0.3;\r
        const turn = next() * TAU;\r
        for (let corner = 0; corner < sides; corner += 1) {\r
          const angle = turn + ((corner + (next() - 0.5) * 0.6) * TAU) / sides;\r
          outline.push([Math.cos(angle), Math.sin(angle) * stretch]);\r
        }\r
      }\r
      const sides = outline.length;\r
      let mx = 0;\r
      let my = 0;\r
      for (const point of outline) {\r
        mx += point[0] / sides;\r
        my += point[1] / sides;\r
      }\r
      const shape = [];\r
      for (let corner = 0; corner < 5; corner += 1) {\r
        const point = outline[Math.min(corner, sides - 1)];\r
        shape.push(point[0] - mx, point[1] - my);\r
      }\r
      shards.push({\r
        level,\r
        phase: (index + next()) / Math.max(amount, 1),\r
        lane: Math.sign(flat) * Math.pow(Math.abs(flat), 0.85),\r
        layer: Math.sqrt(-2 * Math.log(Math.max(next(), 1e-6))) * Math.cos(TAU * next()),\r
        size: 0.6 + next() * next() * 1.25,\r
        shape,\r
        sides,\r
        thickness: 0.06 + next() * 0.04,\r
        yaw: (next() - 0.5) * 0.36,\r
        bank: (next() - 0.5) * 0.5,\r
        pitch: (next() - 0.5) * 0.24,\r
        tint: next(),\r
        drift: [next() * TAU, next() * TAU, next() * TAU],\r
        rate: [0.3 + next() * 0.35, 0.25 + next() * 0.35, 0.3 + next() * 0.3],\r
        flutter: [next() * TAU, 0.5 + next() * 0.5],\r
        arrive: next(),\r
        sign: next() < 0.5 ? -1 : 1,\r
        slot: [next() * TAU, 0.06 + 0.3 * Math.sqrt(next()), next() - 0.5, next() < 0.85 ? 1 : -1],\r
        offset: [0, 0, 0],\r
        velocity: [0, 0, 0],\r
        tilt: 0,\r
        tiltVelocity: 0,\r
        flash: 0,\r
        gather: 0,\r
        joined: false,\r
        position: [0, 0, 0],\r
        s: 0\r
      });\r
    }\r
  }\r
  return shards;\r
};\r
\r
export default function AeroShards({\r
  shardColor = '#896ABD',\r
  accentColor = '#A855F7',\r
  backgroundColor = 'transparent',\r
  lightMode = false,\r
  placement = 'full',\r
  material = 'glass',\r
  count = 1300,\r
  shardSize = 1,\r
  spread = 1,\r
  twist = 1,\r
  billow = 1,\r
  speed = 1,\r
  scale = 1,\r
  depthOfField = 0.75,\r
  glow = 0.35,\r
  grain = 0.06,\r
  vignette = 0.3,\r
  intro = true,\r
  mouseInteraction = true,\r
  mouseStrength = 0.6,\r
  markers = 'plus',\r
  pulseOnClick = true,\r
  holdToGather = true,\r
  parallax = 0.5,\r
  paused = false,\r
  dpr = 2,\r
  className = '',\r
  style,\r
  onError\r
}: AeroShardsProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const onErrorRef = useRef(onError);\r
  onErrorRef.current = onError;\r
\r
  const settings = {\r
    shard: parseColor(shardColor, [0.54, 0.42, 0.74]) ?? [0.54, 0.42, 0.74],\r
    accent: parseColor(accentColor, [0.66, 0.33, 0.97]) ?? [0.66, 0.33, 0.97],\r
    paper: parseColor(backgroundColor, null),\r
    lightMode,\r
    placement: Math.max(0, PLACEMENTS.indexOf(placement)),\r
    material: MATERIALS[material] ?? MATERIALS.glass,\r
    count: Math.round(clamp(count, 100, 6000)),\r
    shardSize: clamp(shardSize, 0.2, 4),\r
    spread: clamp(spread, 0, 3),\r
    twist: clamp(twist, 0, 3),\r
    billow: clamp(billow, 0, 3),\r
    speed: clamp(speed, 0, 4),\r
    scale: clamp(scale, 0.4, 2.5),\r
    depthOfField: clamp(depthOfField, 0, 1),\r
    glow: clamp(glow, 0, 2),\r
    grain: clamp(grain, 0, 0.5),\r
    vignette: clamp(vignette, 0, 1),\r
    intro,\r
    mouseInteraction,\r
    mouseStrength: clamp(mouseStrength, 0, 1),\r
    markers: MARKER_STYLES[markers] ?? -1,\r
    pulseOnClick,\r
    holdToGather,\r
    parallax: clamp(parallax, 0, 1),\r
    paused,\r
    dpr: Math.max(0.5, dpr)\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
    const canvas = document.createElement('canvas');\r
    canvas.className = CANVAS;\r
    container.appendChild(canvas);\r
\r
    let disposed = false;\r
    let gpu: Awaited<ReturnType<typeof init>> | null = null;\r
    let raf = 0;\r
    const cleanups: Array<() => void> = [];\r
\r
    const fail = (error: unknown) => {\r
      if (disposed) return;\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      gpu?.dispose();\r
      gpu = null;\r
      onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));\r
    };\r
\r
    const start = async () => {\r
      if (typeof navigator === 'undefined' || !('gpu' in navigator)) throw new Error('WebGPU is not available');\r
      const instance = await init({ powerPreference: 'high-performance' });\r
      gpu = instance;\r
      if (disposed) {\r
        instance.dispose();\r
        return;\r
      }\r
      cleanups.push(instance.onError(fail));\r
      const format = (\r
        navigator as Navigator & { gpu: { getPreferredCanvasFormat(): string } }\r
      ).gpu.getPreferredCanvasFormat();\r
      const sizeFor = (): [number, number] => {\r
        const ratio = Math.min(window.devicePixelRatio || 1, settingsRef.current.dpr);\r
        return [\r
          Math.max(1, Math.round(container.clientWidth * ratio)),\r
          Math.max(1, Math.round(container.clientHeight * ratio))\r
        ];\r
      };\r
      const output = surface(instance, canvas, {\r
        autoResize: false,\r
        size: sizeFor(),\r
        format,\r
        alphaMode: 'premultiplied'\r
      });\r
      const linear = sampler(instance, {\r
        minFilter: 'linear',\r
        magFilter: 'linear',\r
        addressModeU: 'clamp-to-edge',\r
        addressModeV: 'clamp-to-edge'\r
      });\r
      const scene = target(instance, { size: output.size, format: 'rgba16float' });\r
      const levelSize = (index: number): [number, number] => [\r
        Math.max(1, Math.round(output.size[0] / 2 ** (index + 1))),\r
        Math.max(1, Math.round(output.size[1] / 2 ** (index + 1)))\r
      ];\r
      const levels = Array.from({ length: BLOOM_LEVELS }, (_, index) => ({\r
        main: target(instance, { size: levelSize(index), format: 'rgba16float' }),\r
        spare: target(instance, { size: levelSize(index), format: 'rgba16float' })\r
      }));\r
      const frameParams = uniforms(instance, {\r
        view: [1, 1, 1, 0],\r
        eye: [0, 0, CAMERA, FOCUS],\r
        forward: [0, 0, -1, 0],\r
        right: [1, 0, 0, 0],\r
        up: [0, 1, 0, 0],\r
        shard: [0.54, 0.42, 0.74, 0.5],\r
        accent: [0.66, 0.33, 0.97, 0],\r
        marker: [0, 1, 4, CAMERA],\r
        surface: [7, 0, 0, 2.4]\r
      });\r
      let markerCapacity = 0;\r
      let markerBuffer: ReturnType<typeof storage> | null = null;\r
      let markerData = new Float32Array(0);\r
      const markerDraw = draw(instance, {\r
        shader: MARKER_SHADER,\r
        vertices: 6,\r
        cull: 'none',\r
        depth: false,\r
        blend: 'premultiplied',\r
        label: 'aero-shards-markers'\r
      });\r
      const ensureMarkers = (needed: number) => {\r
        if (needed <= markerCapacity && markerBuffer) return;\r
        markerCapacity = Math.max(needed, 512);\r
        markerData = new Float32Array(markerCapacity * MARKER_FLOATS);\r
        markerBuffer = storage(instance, markerData.byteLength, 'read');\r
        markerDraw.set({ scene: frameParams, markers: markerBuffer });\r
      };\r
      ensureMarkers(512);\r
      const groupSize = (scale: number): [number, number] => [\r
        Math.max(1, Math.round(output.size[0] * scale)),\r
        Math.max(1, Math.round(output.size[1] * scale))\r
      ];\r
      const groups = LAYER_SCALES.map((scale, index) => ({\r
        scale,\r
        layer: target(instance, { size: groupSize(scale), format: 'rgba16float', depth: 'depth32float' }),\r
        shaded: target(instance, { size: groupSize(scale), format: 'rgba16float' }),\r
        temp: target(instance, { size: index === 0 ? [1, 1] : groupSize(scale), format: 'rgba16float' }),\r
        blurred: target(instance, { size: index === 0 ? [1, 1] : groupSize(scale), format: 'rgba16float' }),\r
        softReady: index !== 0\r
      }));\r
      const layerParams = DEPTHS.map(() => uniforms(instance, { view: [1, 1, 1, 0], look: [0.7, 0, 0, 0] }));\r
      const spreadX = DEPTHS.map(() => uniforms(instance, { texel: [0, 0, 0, 0] }));\r
      const spreadY = DEPTHS.map(() => uniforms(instance, { texel: [0, 0, 0, 0] }));\r
      const mixParams = DEPTHS.map(() => uniforms(instance, { info: [1, 0, 0, 0] }));\r
      const shadeParams = DEPTHS.map(() => uniforms(instance, { info: [0, 0, 0, 0], more: [0, 0, 0, 0] }));\r
      const shardSolid = DEPTHS.map((_, level) =>\r
        draw(instance, {\r
          shader: SHARD_SHADER,\r
          entry: { fragment: 'fs_solid' },\r
          vertices: 6,\r
          cull: 'none',\r
          depth: { write: true, compare: 'less' },\r
          label: \`aero-shards-solid-\${level}\`\r
        })\r
      );\r
      const shardEdge = DEPTHS.map((_, level) =>\r
        draw(instance, {\r
          shader: SHARD_SHADER,\r
          entry: { fragment: 'fs_edge' },\r
          vertices: 6,\r
          cull: 'none',\r
          depth: { write: false, compare: 'less' },\r
          blend: 'premultiplied',\r
          label: \`aero-shards-edge-\${level}\`\r
        })\r
      );\r
      const layerPasses = DEPTHS.map((_, level) =>\r
        groups.map((group, index) => ({\r
          shadow: effect(instance, SHADOW_SHADER, {\r
            label: \`aero-shards-shadow-\${level}-\${index}\`,\r
            set: { source: group.layer, depthMap: group.layer.depth, shadeInfo: shadeParams[level] }\r
          }),\r
          blurX: effect(instance, LAYER_BLUR_SHADER, {\r
            label: \`aero-shards-depth-x-\${level}-\${index}\`,\r
            set: { source: group.shaded, linearSampler: linear, spreadInfo: spreadX[level] }\r
          }),\r
          blurY: effect(instance, LAYER_BLUR_SHADER, {\r
            label: \`aero-shards-depth-y-\${level}-\${index}\`,\r
            set: { source: group.temp, linearSampler: linear, spreadInfo: spreadY[level] }\r
          }),\r
          sharp: effect(instance, COMPOSITE_SHADER, {\r
            label: \`aero-shards-sharp-\${level}-\${index}\`,\r
            blend: 'premultiplied',\r
            set: { source: group.shaded, linearSampler: linear, mixInfo: mixParams[level] }\r
          }),\r
          soft: effect(instance, COMPOSITE_SHADER, {\r
            label: \`aero-shards-soft-\${level}-\${index}\`,\r
            blend: 'premultiplied',\r
            set: { source: group.blurred, linearSampler: linear, mixInfo: mixParams[level] }\r
          })\r
        }))\r
      );\r
      let capacity = 0;\r
      let shardBuffer: ReturnType<typeof storage> | null = null;\r
      let upload = new Float32Array(0);\r
      let staging = new Float32Array(0);\r
      let depths = new Float32Array(0);\r
      const ensureCapacity = (needed: number) => {\r
        if (needed <= capacity && shardBuffer) return;\r
        capacity = Math.max(needed, 256);\r
        upload = new Float32Array(capacity * FLOATS);\r
        staging = new Float32Array(capacity * FLOATS);\r
        depths = new Float32Array(capacity);\r
        shardBuffer = storage(instance, upload.byteLength, 'read');\r
        DEPTHS.forEach((_, level) => {\r
          shardSolid[level].set({ scene: frameParams, shards: shardBuffer, layerInfo: layerParams[level] });\r
          shardEdge[level].set({ scene: frameParams, shards: shardBuffer, layerInfo: layerParams[level] });\r
        });\r
      };\r
      ensureCapacity(settingsRef.current.count);\r
\r
      const passes = levels.map((level, index) => {\r
        const source = index === 0 ? scene : levels[index - 1].main;\r
        const downParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        const horizontalParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        const verticalParams = uniforms(instance, { texel: [0, 0, 0, 0] });\r
        return {\r
          source,\r
          level,\r
          downParams,\r
          horizontalParams,\r
          verticalParams,\r
          down: effect(instance, index === 0 ? PREFILTER_SHADER : DOWNSAMPLE_SHADER, {\r
            label: \`aero-shards-down-\${index}\`,\r
            set: { source, linearSampler: linear, bloom: downParams }\r
          }),\r
          horizontal: effect(instance, BLUR_SHADER, {\r
            label: \`aero-shards-blur-x-\${index}\`,\r
            set: { source: level.main, linearSampler: linear, bloom: horizontalParams }\r
          }),\r
          vertical: effect(instance, BLUR_SHADER, {\r
            label: \`aero-shards-blur-y-\${index}\`,\r
            set: { source: level.spare, linearSampler: linear, bloom: verticalParams }\r
          })\r
        };\r
      });\r
      const finishParams = uniforms(instance, { info: [0, 0, 0, 1], paper: [0, 0, 0, 0], mode: [0, 0, 0, 0] });\r
      const finish = effect(instance, FINISH_SHADER, {\r
        label: 'aero-shards-finish',\r
        set: {\r
          sceneTexture: scene,\r
          linearSampler: linear,\r
          bloom0: levels[0].main,\r
          bloom1: levels[1].main,\r
          bloom2: levels[2].main,\r
          bloom3: levels[3].main,\r
          finish: finishParams\r
        }\r
      });\r
      await Promise.all([\r
        ...shardSolid.map(item => item.compile(groups[0].layer)),\r
        ...shardEdge.map(item => item.compile(groups[0].layer)),\r
        ...layerPasses.flatMap(list =>\r
          list.flatMap((item, index) => [\r
            item.shadow.compile(groups[index].shaded),\r
            item.blurX.compile(groups[index].temp),\r
            item.blurY.compile(groups[index].blurred),\r
            item.sharp.compile(scene),\r
            item.soft.compile(scene)\r
          ])\r
        ),\r
        markerDraw.compile(scene),\r
        finish.compile({ colors: [format] }),\r
        ...passes.flatMap((pass, index) => [\r
          pass.down.compile(levels[index].main),\r
          pass.horizontal.compile(levels[index].spare),\r
          pass.vertical.compile(levels[index].main)\r
        ])\r
      ]);\r
      if (disposed) return;\r
\r
      const paths = Array.from({ length: LEVELS }, () => ({\r
        position: new Float32Array(SAMPLES * 3),\r
        tangent: new Float32Array(SAMPLES * 3),\r
        across: new Float32Array(SAMPLES * 3),\r
        lift: new Float32Array(SAMPLES * 3),\r
        length: 1\r
      }));\r
      const markerCounts = [0, 0, 0, 0, 0];\r
      const markerStarts = [0, 0, 0, 0, 0];\r
      const raw = new Float32Array((SAMPLES + 1) * 3);\r
      const lengths = new Float32Array(SAMPLES + 1);\r
      const point = [0, 0, 0];\r
      let pathKey = '';\r
\r
      const state = {\r
        visible: false,\r
        clock: 0,\r
        last: 0,\r
        travel: new Float64Array(LEVELS),\r
        roll: 0,\r
        twist: 0,\r
        drift: 0,\r
        introAt: -1,\r
        weights: PLACEMENTS.map((_, index): number => (index === settingsRef.current.placement ? 1 : 0)),\r
        weightVelocity: [0, 0, 0, 0],\r
        shards: createShards(settingsRef.current.count, 1337),\r
        order: [] as number[],\r
        pointer: [0.5, 0.5],\r
        inside: false,\r
        presence: 0,\r
        yaw: 0,\r
        pitch: 0,\r
        yawVelocity: 0,\r
        pitchVelocity: 0,\r
        pressAt: -1,\r
        pressPoint: null as number[] | null,\r
        holding: false,\r
        hold: 0,\r
        reach: 0,\r
        gatherCenter: [0, 0, 0],\r
        rings: [] as Ring[],\r
        markerDrift: 0,\r
        markerTarget: '',\r
        markerTotal: 0,\r
        targets: new Map<string, number>(),\r
        quiet: 0,\r
        seen: null as typeof settings | null\r
      };\r
\r
      const buildPaths = (aspect: number) => {\r
        const closed = state.weights[3] > 0.999;\r
        const key = \`\${aspect.toFixed(4)}|\${state.weights.map(w => w.toFixed(4)).join(',')}\`;\r
        if (key === pathKey) return closed;\r
        pathKey = key;\r
        for (let level = 0; level < LEVELS; level += 1) {\r
          const path = paths[level];\r
          let total = 0;\r
          for (let i = 0; i <= SAMPLES; i += 1) {\r
            const s = i / SAMPLES;\r
            let x = 0;\r
            let y = 0;\r
            let z = 0;\r
            for (let k = 0; k < 4; k += 1) {\r
              const weight = state.weights[k];\r
              if (weight < 0.0001) continue;\r
              ribbonPoint(k, level, s, aspect, point);\r
              x += point[0] * weight;\r
              y += point[1] * weight;\r
              z += point[2] * weight;\r
            }\r
            raw[i * 3] = x;\r
            raw[i * 3 + 1] = y;\r
            raw[i * 3 + 2] = z;\r
            if (i > 0) total += Math.hypot(x - raw[i * 3 - 3], y - raw[i * 3 - 2], z - raw[i * 3 - 1]);\r
            lengths[i] = total;\r
          }\r
          path.length = Math.max(total, 1e-3);\r
          let cursor = 0;\r
          for (let i = 0; i < SAMPLES; i += 1) {\r
            const want = (i / (SAMPLES - 1)) * total;\r
            while (cursor < SAMPLES - 1 && lengths[cursor + 1] < want) cursor += 1;\r
            const span = Math.max(lengths[cursor + 1] - lengths[cursor], 1e-6);\r
            const f = clamp((want - lengths[cursor]) / span, 0, 1);\r
            for (let c = 0; c < 3; c += 1) {\r
              path.position[i * 3 + c] = raw[cursor * 3 + c] + (raw[cursor * 3 + 3 + c] - raw[cursor * 3 + c]) * f;\r
            }\r
          }\r
          let px = 0;\r
          let py = 1;\r
          let pz = 0;\r
          for (let i = 0; i < SAMPLES; i += 1) {\r
            const a = Math.max(0, i - 1);\r
            const b = Math.min(SAMPLES - 1, i + 1);\r
            let tx = path.position[b * 3] - path.position[a * 3];\r
            let ty = path.position[b * 3 + 1] - path.position[a * 3 + 1];\r
            let tz = path.position[b * 3 + 2] - path.position[a * 3 + 2];\r
            const tl = Math.hypot(tx, ty, tz) || 1;\r
            tx /= tl;\r
            ty /= tl;\r
            tz /= tl;\r
            if (i === 0) {\r
              px = -ty;\r
              py = tx;\r
              pz = 0;\r
            }\r
            const along = px * tx + py * ty + pz * tz;\r
            px -= tx * along;\r
            py -= ty * along;\r
            pz -= tz * along;\r
            const pl = Math.hypot(px, py, pz) || 1;\r
            px /= pl;\r
            py /= pl;\r
            pz /= pl;\r
            path.tangent[i * 3] = tx;\r
            path.tangent[i * 3 + 1] = ty;\r
            path.tangent[i * 3 + 2] = tz;\r
            path.across[i * 3] = px;\r
            path.across[i * 3 + 1] = py;\r
            path.across[i * 3 + 2] = pz;\r
            path.lift[i * 3] = ty * pz - tz * py;\r
            path.lift[i * 3 + 1] = tz * px - tx * pz;\r
            path.lift[i * 3 + 2] = tx * py - ty * px;\r
          }\r
        }\r
        return closed;\r
      };\r
\r
      const resize = () => {\r
        const next = sizeFor();\r
        if (next[0] === output.size[0] && next[1] === output.size[1]) return;\r
        output.resize(next);\r
        scene.resize(next);\r
        groups.forEach(group => {\r
          group.layer.resize(groupSize(group.scale));\r
          group.shaded.resize(groupSize(group.scale));\r
          if (group.softReady) {\r
            group.temp.resize(groupSize(group.scale));\r
            group.blurred.resize(groupSize(group.scale));\r
          }\r
        });\r
        levels.forEach((level, index) => {\r
          level.main.resize(levelSize(index));\r
          level.spare.resize(levelSize(index));\r
        });\r
        layerPasses.forEach(list =>\r
          list.forEach((item, index) => item.shadow.set({ depthMap: groups[index].layer.depth }))\r
        );\r
        state.quiet = 0;\r
      };\r
      const sizes = new ResizeObserver(resize);\r
      sizes.observe(container);\r
      cleanups.push(() => sizes.disconnect());\r
\r
      const cam = { eye: [0, 0, CAMERA], forward: [0, 0, -1], right: [1, 0, 0], up: [0, 1, 0], focal: 1 };\r
\r
      const updateCamera = (s: typeof settings) => {\r
        const cy = Math.cos(state.yaw);\r
        const sy = Math.sin(state.yaw);\r
        const cp = Math.cos(state.pitch);\r
        const sp = Math.sin(state.pitch);\r
        cam.eye[0] = sy * cp * CAMERA;\r
        cam.eye[1] = sp * CAMERA;\r
        cam.eye[2] = cy * cp * CAMERA;\r
        cam.forward[0] = -sy * cp;\r
        cam.forward[1] = -sp;\r
        cam.forward[2] = -cy * cp;\r
        const rl = Math.hypot(cam.forward[2], cam.forward[0]) || 1;\r
        cam.right[0] = -cam.forward[2] / rl;\r
        cam.right[1] = 0;\r
        cam.right[2] = cam.forward[0] / rl;\r
        cam.up[0] = cam.right[1] * cam.forward[2] - cam.right[2] * cam.forward[1];\r
        cam.up[1] = cam.right[2] * cam.forward[0] - cam.right[0] * cam.forward[2];\r
        cam.up[2] = cam.right[0] * cam.forward[1] - cam.right[1] * cam.forward[0];\r
        cam.focal = output.size[1] * 0.5 * CAMERA * s.scale;\r
      };\r
\r
      const ray = [0, 0, 1];\r
      const rayAt = (px: number, py: number) => {\r
        const x = (px - 0.5) * output.size[0];\r
        const y = (0.5 - py) * output.size[1];\r
        ray[0] = cam.forward[0] * cam.focal + cam.right[0] * x + cam.up[0] * y;\r
        ray[1] = cam.forward[1] * cam.focal + cam.right[1] * x + cam.up[1] * y;\r
        ray[2] = cam.forward[2] * cam.focal + cam.right[2] * x + cam.up[2] * y;\r
        const length = Math.hypot(ray[0], ray[1], ray[2]) || 1;\r
        ray[0] /= length;\r
        ray[1] /= length;\r
        ray[2] /= length;\r
        return ray;\r
      };\r
\r
      const simulate = (s: typeof settings, dt: number, reduced: boolean) => {\r
        const aspect = output.size[0] / Math.max(output.size[1], 1);\r
        const closed = buildPaths(aspect);\r
        const introOn = s.intro && !reduced;\r
        const introAge = state.introAt < 0 ? 0 : state.clock - state.introAt;\r
        const hover = s.mouseInteraction && !reduced ? state.presence * s.mouseStrength : 0;\r
        let rx = 0;\r
        let ry = 0;\r
        let rz = 0;\r
        if (hover > 0.001) {\r
          rayAt(state.pointer[0], state.pointer[1]);\r
          rx = ray[0];\r
          ry = ray[1];\r
          rz = ray[2];\r
        }\r
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));\r
        const h = dt / Math.max(steps, 1);\r
        const halfHeight = output.size[1] * 0.5;\r
        const rings = state.rings.map(ring => {\r
          const life = ring.age / RING_SECONDS;\r
          return {\r
            x: ring.x,\r
            y: ring.y,\r
            age: ring.age,\r
            strength: (1 - Math.exp(-ring.age / 0.06)) * (1 - life) * (1 - life)\r
          };\r
        });\r
        const screenOf = (x: number, y: number, z: number, out: number[]) => {\r
          const ex = x - cam.eye[0];\r
          const ey = y - cam.eye[1];\r
          const ez = z - cam.eye[2];\r
          const depth = Math.max(ex * cam.forward[0] + ey * cam.forward[1] + ez * cam.forward[2], 0.05);\r
          out[0] = ((ex * cam.right[0] + ey * cam.right[1] + ez * cam.right[2]) * cam.focal) / depth / halfHeight;\r
          out[1] = ((ex * cam.up[0] + ey * cam.up[1] + ez * cam.up[2]) * cam.focal) / depth / halfHeight;\r
          return depth;\r
        };\r
        const ringBand = (sx: number, sy: number, level: number) => {\r
          let total = 0;\r
          for (const ring of rings) {\r
            const radius = Math.max(0, ring.age - level * 0.07) * 2.3;\r
            const distance = Math.hypot(sx - ring.x, sy - ring.y);\r
            total += Math.exp(-((distance - radius) * (distance - radius)) / 0.012) * ring.strength;\r
          }\r
          return total;\r
        };\r
        const flat = [0, 0];\r
        const shards = state.shards;\r
        const twistWeight = Math.min(1, s.twist);\r
        for (let index = 0; index < shards.length; index += 1) {\r
          const shard = shards[index];\r
          const level = shard.level;\r
          const path = paths[level];\r
          let s0 = (shard.phase + state.travel[level]) % 1;\r
          let appear = 1;\r
          let introBank = 0;\r
          if (introOn) {\r
            const begin =\r
              level * 0.22 + Math.max(0, s0 - 0.1) * (INTRO_SECONDS - 1.0 - (LEVELS - 1) * 0.22) + shard.arrive * 0.15;\r
            const local = clamp((introAge - begin) / 0.9, 0, 1);\r
            appear = smoother(local);\r
            const glide = (1 - local) * (1 - local);\r
            s0 = closed ? s0 - glide * 0.06 : Math.max(0, s0 - glide * 0.06);\r
            introBank = glide * 0.9 * shard.sign;\r
          }\r
          shard.s = s0;\r
          const f = (((s0 % 1) + 1) % 1) * (SAMPLES - 1);\r
          const i0 = Math.floor(f);\r
          const i1 = Math.min(i0 + 1, SAMPLES - 1);\r
          const t = f - i0;\r
          const at = (array: Float32Array, c: number) =>\r
            array[i0 * 3 + c] + (array[i1 * 3 + c] - array[i0 * 3 + c]) * t;\r
          const cx = at(path.position, 0);\r
          const cy = at(path.position, 1);\r
          const cz = at(path.position, 2);\r
          const tx = at(path.tangent, 0);\r
          const ty = at(path.tangent, 1);\r
          const tz = at(path.tangent, 2);\r
          const ax0 = at(path.across, 0);\r
          const ay0 = at(path.across, 1);\r
          const az0 = at(path.across, 2);\r
          const lx0 = at(path.lift, 0);\r
          const ly0 = at(path.lift, 1);\r
          const lz0 = at(path.lift, 2);\r
          const angle = s.twist * (s0 * TAU * 0.6 + state.twist + level * 1.7);\r
          const ca = Math.cos(angle);\r
          const sa = Math.sin(angle);\r
          const ax = ax0 * ca + lx0 * sa;\r
          const ay = ay0 * ca + ly0 * sa;\r
          const az = az0 * ca + lz0 * sa;\r
          const bx = lx0 * ca - ax0 * sa;\r
          const by = ly0 * ca - ay0 * sa;\r
          const bz = lz0 * ca - az0 * sa;\r
          const depthScale = DEPTHS[level] / CAMERA;\r
          const width =\r
            s.spread * (0.15 + 0.035 * DEPTHS[level]) * (0.8 + 0.3 * Math.sin(s0 * TAU * 1.3 + level * 0.8));\r
          const lane = shard.lane * width;\r
          const layer = shard.layer * 0.012 * depthScale;\r
          const taper = closed ? 1 : smoother(s0 / 0.12) * smoother((1 - s0) / 0.12);\r
          const billow =\r
            s.billow *\r
            0.16 *\r
            depthScale *\r
            Math.sin(s0 * TAU * 1.3 - state.drift * 0.5 + level * 1.1) *\r
            (0.4 + 0.6 * taper);\r
          const sway = s.billow * 0.06 * depthScale * Math.sin(s0 * TAU * 0.8 - state.drift * 0.35 + level * 2.4);\r
          const wobble = 0.009 * depthScale;\r
          const drift = state.drift;\r
          const hx =\r
            cx +\r
            lx0 * billow +\r
            ax0 * sway +\r
            ax * lane +\r
            bx * layer +\r
            Math.sin(drift * shard.rate[0] + shard.drift[0]) * wobble;\r
          const hy =\r
            cy +\r
            ly0 * billow +\r
            ay0 * sway +\r
            ay * lane +\r
            by * layer +\r
            Math.sin(drift * shard.rate[1] + shard.drift[1]) * wobble;\r
          const hz =\r
            cz +\r
            lz0 * billow +\r
            az0 * sway +\r
            az * lane +\r
            bz * layer +\r
            Math.sin(drift * shard.rate[2] + shard.drift[2]) * wobble;\r
\r
          let fx = 0;\r
          let fy = 0;\r
          let fz = 0;\r
          let tiltTarget = 0;\r
          const px = hx + shard.offset[0];\r
          const py = hy + shard.offset[1];\r
          const pz = hz + shard.offset[2];\r
          if (hover > 0.001) {\r
            const ex = px - cam.eye[0];\r
            const ey = py - cam.eye[1];\r
            const ez = pz - cam.eye[2];\r
            const along = ex * rx + ey * ry + ez * rz;\r
            const qx = ex - rx * along;\r
            const qy = ey - ry * along;\r
            const qz = ez - rz * along;\r
            const gap = Math.hypot(qx, qy, qz);\r
            const reach = (0.24 * depthScale) / s.scale;\r
            const falloff = Math.exp(-(gap * gap) / (reach * reach));\r
            if (falloff > 0.002 && gap > 1e-5) {\r
              const nx = qx / gap;\r
              const ny = qy / gap;\r
              const nz = qz / gap;\r
              const sideways = (nx * tx + ny * ty + nz * tz) * 0.7;\r
              const strength = hover * falloff * 9 * depthScale;\r
              fx += (nx - tx * sideways) * strength;\r
              fy += (ny - ty * sideways) * strength;\r
              fz += (nz - tz * sideways) * strength;\r
              tiltTarget += hover * falloff * 1.1 * (nx * ax0 + ny * ay0 + nz * az0);\r
            }\r
          }\r
\r
          if (state.hold > 0.001 && shard.joined) {\r
            const slot = shard.slot;\r
            const orbit = slot[0] + state.clock * (0.8 / (0.12 + slot[1])) * slot[3];\r
            const radius = slot[1] / s.scale;\r
            const gx = state.gatherCenter[0] + Math.cos(orbit) * radius;\r
            const gy = state.gatherCenter[1] + Math.sin(orbit) * radius * 0.75;\r
            const gz = state.gatherCenter[2] + Math.sin(orbit) * radius * 0.45 + slot[2] * 0.3;\r
            shard.gather += (state.hold - shard.gather) * (1 - Math.exp(-dt / 0.3));\r
            const pull = shard.gather * 30;\r
            fx += (gx - px) * pull;\r
            fy += (gy - py) * pull;\r
            fz += (gz - pz) * pull;\r
            tiltTarget += shard.gather * 0.6 * Math.sin(orbit);\r
          } else {\r
            shard.gather += (0 - shard.gather) * (1 - Math.exp(-dt / 0.2));\r
          }\r
\r
          if (rings.length) {\r
            screenOf(px, py, pz, flat);\r
            for (const ring of rings) {\r
              const radius = Math.max(0, ring.age - level * 0.07) * 2.3;\r
              const dxr = flat[0] - ring.x;\r
              const dyr = flat[1] - ring.y;\r
              const distance = Math.hypot(dxr, dyr);\r
              const band = Math.exp(-((distance - radius) * (distance - radius)) / 0.012) * ring.strength;\r
              if (band > 0.01) {\r
                shard.flash = Math.max(shard.flash, band * 0.75);\r
                const outward = Math.max(distance, 0.05);\r
                const ux = (cam.right[0] * dxr + cam.up[0] * dyr) / outward;\r
                const uy = (cam.right[1] * dxr + cam.up[1] * dyr) / outward;\r
                const uz = (cam.right[2] * dxr + cam.up[2] * dyr) / outward;\r
                tiltTarget += band * 1.4 * (ux * ax0 + uy * ay0 + uz * az0);\r
                const push = (band * 2.2 * depthScale) / Math.max(distance, 0.05);\r
                fx += (cam.right[0] * dxr + cam.up[0] * dyr) * push;\r
                fy += (cam.right[1] * dxr + cam.up[1] * dyr) * push;\r
                fz += (cam.right[2] * dxr + cam.up[2] * dyr) * push;\r
              }\r
            }\r
          }\r
\r
          const stiffness = 24 * (1 - shard.gather * 0.95);\r
          for (let step = 0; step < steps; step += 1) {\r
            shard.velocity[0] += (fx - stiffness * shard.offset[0] - 7.5 * shard.velocity[0]) * h;\r
            shard.velocity[1] += (fy - stiffness * shard.offset[1] - 7.5 * shard.velocity[1]) * h;\r
            shard.velocity[2] += (fz - stiffness * shard.offset[2] - 7.5 * shard.velocity[2]) * h;\r
            shard.offset[0] += shard.velocity[0] * h;\r
            shard.offset[1] += shard.velocity[1] * h;\r
            shard.offset[2] += shard.velocity[2] * h;\r
            shard.tiltVelocity += (90 * (tiltTarget - shard.tilt) - 15 * shard.tiltVelocity) * h;\r
            shard.tilt += shard.tiltVelocity * h;\r
          }\r
          shard.flash *= Math.exp(-dt / 0.45);\r
\r
          const ox = hx + shard.offset[0];\r
          const oy = hy + shard.offset[1];\r
          const oz = hz + shard.offset[2];\r
          shard.position[0] = ox;\r
          shard.position[1] = oy;\r
          shard.position[2] = oz;\r
\r
          let vx = cam.eye[0] - ox;\r
          let vy = cam.eye[1] - oy;\r
          let vz = cam.eye[2] - oz;\r
          const vl = Math.hypot(vx, vy, vz) || 1;\r
          vx /= vl;\r
          vy /= vl;\r
          vz /= vl;\r
          let dx = tx + shard.velocity[0] * 0.05;\r
          let dy = ty + shard.velocity[1] * 0.05;\r
          let dz = tz + shard.velocity[2] * 0.05;\r
          const facingPart = dx * vx + dy * vy + dz * vz;\r
          dx -= vx * facingPart;\r
          dy -= vy * facingPart;\r
          dz -= vz * facingPart;\r
          let dl = Math.hypot(dx, dy, dz);\r
          if (dl < 1e-4) {\r
            dx = cam.right[0];\r
            dy = cam.right[1];\r
            dz = cam.right[2];\r
            dl = 1;\r
          }\r
          dx /= dl;\r
          dy /= dl;\r
          dz /= dl;\r
          const wx = vy * dz - vz * dy;\r
          const wy = vz * dx - vx * dz;\r
          const wz = vx * dy - vy * dx;\r
          const yaw = shard.yaw + 0.05 * Math.sin(state.clock * shard.flutter[1] * 0.7 + shard.flutter[0]);\r
          const cyaw = Math.cos(yaw);\r
          const syaw = Math.sin(yaw);\r
          const kx = dx * cyaw + wx * syaw;\r
          const ky = dy * cyaw + wy * syaw;\r
          const kz = dz * cyaw + wz * syaw;\r
          const jx = wx * cyaw - dx * syaw;\r
          const jy = wy * cyaw - dy * syaw;\r
          const jz = wz * cyaw - dz * syaw;\r
          const wave =\r
            0.8 * twistWeight * Math.sin(angle) +\r
            0.3 * Math.sin(s0 * TAU * 1.6 - state.roll * 0.55 + level * 0.9 + shard.lane * 0.7);\r
          const flutter = 0.06 * Math.sin(state.clock * shard.flutter[1] + shard.flutter[0]);\r
          const bank = MAX_BANK * Math.tanh((wave + shard.bank + flutter + shard.tilt + introBank) / MAX_BANK);\r
          const cb = Math.cos(bank);\r
          const sb = Math.sin(bank);\r
          const mx = vx * cb + jx * sb;\r
          const my = vy * cb + jy * sb;\r
          const mz = vz * cb + jz * sb;\r
          const pitch = shard.pitch + 0.2 * Math.sin(s0 * TAU * 1.1 - state.roll * 0.4 + level * 2.1);\r
          const cp = Math.cos(pitch);\r
          const sp = Math.sin(pitch);\r
          const axisX = kx * cp + mx * sp;\r
          const axisY = ky * cp + my * sp;\r
          const axisZ = kz * cp + mz * sp;\r
          const nx = mx * cp - kx * sp;\r
          const ny = my * cp - ky * sp;\r
          const nz = mz * cp - kz * sp;\r
\r
          const ex = ox - cam.eye[0];\r
          const ey = oy - cam.eye[1];\r
          const ez = oz - cam.eye[2];\r
          const viewDepth = ex * cam.forward[0] + ey * cam.forward[1] + ez * cam.forward[2];\r
          depths[index] = viewDepth;\r
          const core = 1 - 0.45 * shard.lane * shard.lane;\r
          const size = 0.062 * s.shardSize * shard.size * GROWTH[level] * appear * Math.sqrt(taper) * core;\r
          const o = index * FLOATS;\r
          staging[o] = ox;\r
          staging[o + 1] = oy;\r
          staging[o + 2] = oz;\r
          staging[o + 3] = size > 1e-5 ? size : 0;\r
          staging[o + 4] = axisX;\r
          staging[o + 5] = axisY;\r
          staging[o + 6] = axisZ;\r
          staging[o + 7] = shard.thickness;\r
          staging[o + 8] = nx;\r
          staging[o + 9] = ny;\r
          staging[o + 10] = nz;\r
          staging[o + 11] = shard.tint;\r
          for (let k = 0; k < 10; k += 1) staging[o + 12 + k] = shard.shape[k];\r
          staging[o + 22] = shard.sides;\r
          staging[o + 23] = shard.flash;\r
        }\r
\r
        let markerTotal = 0;\r
        for (let level = 0; level < LEVELS; level += 1) {\r
          markerCounts[level] = 0;\r
          markerStarts[level] = 0;\r
        }\r
        if (s.markers >= 0) {\r
          const ratio = output.size[1] / Math.max(container.clientHeight, 1);\r
          const pointerX = (state.pointer[0] - 0.5) * 2 * aspect;\r
          const pointerY = (0.5 - state.pointer[1]) * 2;\r
          const engaged = s.mouseInteraction && !reduced ? state.presence : 0;\r
          const previousTargets = state.targets;\r
          const nextTargets = new Map();\r
          const targetEase = 1 - Math.exp(-dt / 0.12);\r
          let nearestKey = '';\r
          let nearestGap = 72;\r
          for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
            markerStarts[level] = markerTotal;\r
            const depth = DEPTHS[level];\r
            const depthScale = depth / CAMERA;\r
            const spacing = 0.42 * Math.pow(depthScale, 0.55);\r
            const halfW = ((aspect * depth) / (CAMERA * s.scale)) * 1.12 + spacing;\r
            const halfH = (depth / (CAMERA * s.scale)) * 1.12 + spacing;\r
            const drift = state.markerDrift;\r
            const phase = MARKER_PHASES[level];\r
            const i0 = Math.floor((drift - halfW) / spacing - phase[0]);\r
            const i1 = Math.ceil((drift + halfW) / spacing - phase[0]);\r
            const j0 = Math.floor(-halfH / spacing - phase[1]);\r
            const j1 = Math.ceil(halfH / spacing - phase[1]);\r
            const band = s.spread * (0.15 + 0.035 * depth) * 1.4;\r
            const position = paths[level].position;\r
            for (let i = i0; i <= i1; i += 1) {\r
              for (let j = j0; j <= j1; j += 1) {\r
                const keep = latticeHash(level, i, j, 11);\r
                if (keep > 0.5) continue;\r
                const x = (i + phase[0]) * spacing - drift;\r
                const y = (j + phase[1]) * spacing;\r
                const z = CAMERA - depth;\r
                const markerDepth = screenOf(x, y, z, flat);\r
                if (Math.abs(flat[0]) > aspect * 1.05 || Math.abs(flat[1]) > 1.05) continue;\r
                let best = Infinity;\r
                for (let k = 0; k < SAMPLES; k += 2) {\r
                  const dx = x - position[k * 3];\r
                  const dy = y - position[k * 3 + 1];\r
                  const dz = z - position[k * 3 + 2];\r
                  const d2 = dx * dx + dy * dy + dz * dz;\r
                  if (d2 < best) best = d2;\r
                }\r
                const near = Math.exp(-best / (band * band));\r
                const blinkSeed = latticeHash(level, i, j, 23);\r
                const blinkRate = latticeHash(level, i, j, 37);\r
                const blink =\r
                  blinkSeed < 0.07 ? 0.5 + 0.5 * Math.sin(state.clock * (1.4 + blinkRate * 2.2) + blinkRate * 40) : 0;\r
                const pointerGap = (Math.hypot(flat[0] - pointerX, flat[1] - pointerY) * halfHeight) / ratio;\r
                const key = \`\${level}:\${i}:\${j}\`;\r
                if (level <= 2 && engaged > 0.01 && pointerGap < nearestGap) {\r
                  nearestGap = pointerGap;\r
                  nearestKey = key;\r
                }\r
                const wanted = key === state.markerTarget ? engaged * (1 - smoother((pointerGap - 30) / 42)) : 0;\r
                const before = previousTargets.get(key) ?? 0;\r
                const target = before + (wanted - before) * targetEase;\r
                if (target > 0.002) nextTargets.set(key, target);\r
                const bracket = Math.max(smoother((blink - 0.55) / 0.4), target);\r
                let ring = 0;\r
                if (rings.length) ring = ringBand(flat[0], flat[1], level);\r
                let reveal = 1;\r
                if (introOn) {\r
                  const across = clamp((flat[0] / aspect + 1) * 0.5, 0, 1);\r
                  const begin = level * 0.22 + 0.35 + across * (INTRO_SECONDS - 1.3 - (LEVELS - 1) * 0.22);\r
                  reveal = smoother((introAge - begin) / 0.5);\r
                }\r
                const fade = FADE[level] * (1 - smoother((markerDepth - 3) / 10) * 0.45) * reveal;\r
                if (fade < 0.002) continue;\r
                if (markerTotal >= markerCapacity) ensureMarkers(markerCapacity * 2);\r
                const o = markerTotal * MARKER_FLOATS;\r
                markerData[o] = x;\r
                markerData[o + 1] = y;\r
                markerData[o + 2] = z;\r
                markerData[o + 3] = fade;\r
                markerData[o + 4] = 0.42 + 0.5 * near + blink * 0.9 + target * 1.3 + ring * 2.5;\r
                markerData[o + 5] = bracket;\r
                markerData[o + 6] = 1 + 0.15 * near + 0.3 * blink + 0.2 * target;\r
                markerData[o + 7] = 0;\r
                markerTotal += 1;\r
                markerCounts[level] += 1;\r
              }\r
            }\r
          }\r
          state.targets = nextTargets;\r
          state.markerTarget = nearestKey;\r
        }\r
        state.markerTotal = markerTotal;\r
      };\r
\r
      const render = (s: typeof settings, dt: number, reduced: boolean) => {\r
        updateCamera(s);\r
        const shards = state.shards;\r
        ensureCapacity(shards.length);\r
        simulate(s, dt, reduced);\r
        if (state.order.length !== shards.length) state.order = shards.map((_, index) => index);\r
        const order = state.order;\r
        for (let i = 0; i < shards.length; i += 1) depths[i] += shards[i].level * 100;\r
        for (let i = 1; i < order.length; i += 1) {\r
          const value = order[i];\r
          const key = depths[value];\r
          let j = i - 1;\r
          while (j >= 0 && depths[order[j]] < key) {\r
            order[j + 1] = order[j];\r
            j -= 1;\r
          }\r
          order[j + 1] = value;\r
        }\r
        const counts = [0, 0, 0, 0, 0];\r
        for (let slot = 0; slot < order.length; slot += 1) {\r
          const from = order[slot] * FLOATS;\r
          const to = slot * FLOATS;\r
          counts[shards[order[slot]].level] += 1;\r
          for (let k = 0; k < FLOATS; k += 1) upload[to + k] = staging[from + k];\r
        }\r
        shardBuffer?.write(upload.subarray(0, shards.length * FLOATS));\r
        if (state.markerTotal > 0) markerBuffer?.write(markerData.subarray(0, state.markerTotal * MARKER_FLOATS));\r
        const starts = [0, 0, 0, 0, 0];\r
        let running = 0;\r
        for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
          starts[level] = running;\r
          running += counts[level];\r
        }\r
\r
        frameParams.set({\r
          view: [output.size[0], output.size[1], cam.focal, state.clock],\r
          eye: [cam.eye[0], cam.eye[1], cam.eye[2], FOCUS],\r
          forward: [cam.forward[0], cam.forward[1], cam.forward[2], s.depthOfField * output.size[1] * 0.03],\r
          right: [cam.right[0], cam.right[1], cam.right[2], output.size[1] * 0.05],\r
          up: [cam.up[0], cam.up[1], cam.up[2], s.lightMode ? 1 : 0],\r
          shard: [...s.shard, 0],\r
          accent: [...s.accent, 0],\r
          surface: s.material,\r
          marker: [\r
            s.markers,\r
            output.size[1] / Math.max(container.clientHeight, 1),\r
            4 * (output.size[1] / Math.max(container.clientHeight, 1)),\r
            FOCUS\r
          ]\r
        });\r
        passes.forEach(({ downParams, horizontalParams, verticalParams, source, level }) => {\r
          downParams.set({ texel: [0.5 / source.size[0], 0.5 / source.size[1], 0.75, 0.5] });\r
          horizontalParams.set({ texel: [1 / level.main.size[0], 0, 0, 0] });\r
          verticalParams.set({ texel: [0, 1 / level.main.size[1], 0, 0] });\r
        });\r
        const paper = s.paper ?? [0, 0, 0];\r
        const blooming = s.glow > 0.001 && !s.lightMode;\r
        finishParams.set({\r
          info: [s.grain, Math.floor(state.clock * 24), blooming ? s.glow : 0, 1.3],\r
          paper: [paper[0], paper[1], paper[2], s.paper ? 1 : 0],\r
          mode: [s.lightMode ? 1 : 0, s.vignette, 0, 0]\r
        });\r
\r
        const coc = s.depthOfField * output.size[1] * 0.012;\r
        const cap = output.size[1] * 0.02;\r
        const plan = DEPTHS.map((depth, level) => {\r
          const sigma = Math.min(coc * Math.abs(1 - SHARD_FOCUS / depth), cap);\r
          const groupIndex = sigma >= 2.2 ? 1 : 0;\r
          const group = groups[groupIndex];\r
          const soft = sigma >= 0.45;\r
          if (soft && !group.softReady) {\r
            group.softReady = true;\r
            group.temp.resize(groupSize(group.scale));\r
            group.blurred.resize(groupSize(group.scale));\r
          }\r
          const size = group.layer.size;\r
          layerParams[level].set({\r
            view: [size[0], size[1], cam.focal * (size[0] / output.size[0]), level],\r
            look: [s.lightMode ? 0.5 : 0.7, 0, 0, 0]\r
          });\r
          const local = sigma * group.scale;\r
          spreadX[level].set({ texel: [1 / size[0], 0, local, 0] });\r
          spreadY[level].set({ texel: [0, 1 / size[1], local, 0] });\r
          mixParams[level].set({ info: [FADE[level], 0, 0, 0] });\r
          const step = Math.max(0.6, 1.4 * (size[0] / Math.max(container.clientWidth, 1)));\r
          const shadowStrength = s.material === MATERIALS.glass ? 0 : s.lightMode ? 0.32 : 0.62;\r
          shadeParams[level].set({ info: [step * 0.55, step * 0.85, shadowStrength, 0], more: [0.00045, 0, 0, 0] });\r
          return { group, groupIndex, soft };\r
        });\r
\r
        frame(instance, current => {\r
          for (let level = LEVELS - 1; level >= 0; level -= 1) {\r
            const { group, groupIndex, soft } = plan[level];\r
            const steps = layerPasses[level][groupIndex];\r
            if (counts[level] > 0) {\r
              current.pass({ target: group.layer, clear: [0, 0, 0, 0], clearDepth: 1 }, pass => {\r
                pass.draw(shardSolid[level], { instances: counts[level], firstInstance: starts[level] });\r
                pass.draw(shardEdge[level], { instances: counts[level], firstInstance: starts[level] });\r
              });\r
              current.pass({ target: group.shaded, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.shadow));\r
              if (soft) {\r
                current.pass({ target: group.temp, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.blurX));\r
                current.pass({ target: group.blurred, clear: [0, 0, 0, 0] }, pass => pass.draw(steps.blurY));\r
              }\r
            }\r
            current.pass({ target: scene, clear: level === LEVELS - 1 ? [0, 0, 0, 0] : false }, pass => {\r
              if (markerCounts[level] > 0) {\r
                pass.draw(markerDraw, { instances: markerCounts[level], firstInstance: markerStarts[level] });\r
              }\r
              if (counts[level] > 0) pass.draw(soft ? steps.soft : steps.sharp);\r
            });\r
          }\r
          passes.forEach((pass, index) => {\r
            const level = levels[index];\r
            if (!blooming) {\r
              current.pass({ target: level.main, clear: [0, 0, 0, 0] }, () => {});\r
              return;\r
            }\r
            current.pass({ target: level.main, clear: [0, 0, 0, 0] }, p => p.draw(pass.down));\r
            current.pass({ target: level.spare, clear: [0, 0, 0, 0] }, p => p.draw(pass.horizontal));\r
            current.pass({ target: level.main, clear: [0, 0, 0, 0] }, p => p.draw(pass.vertical));\r
          });\r
          current.pass({ target: output, clear: [0, 0, 0, 0] }, pass => pass.draw(finish));\r
        });\r
      };\r
\r
      const tick = (now: number) => {\r
        raf = requestAnimationFrame(tick);\r
        if (!state.visible || document.hidden) {\r
          state.last = now;\r
          return;\r
        }\r
        const s = settingsRef.current;\r
        const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 0;\r
        state.last = now;\r
        const reduced = prefersReduced();\r
        state.clock += dt;\r
        if (state.introAt < 0) state.introAt = state.clock;\r
        if (state.shards.length !== s.count) {\r
          state.shards = createShards(s.count, 1337);\r
          state.order = [];\r
        }\r
        const moving = !s.paused && !reduced;\r
        if (moving) {\r
          for (let level = 0; level < LEVELS; level += 1) {\r
            state.travel[level] = (state.travel[level] + (dt * s.speed * 0.09) / paths[level].length) % 1;\r
          }\r
          state.roll += dt * s.speed * 1.0;\r
          state.twist += dt * s.speed * 0.08;\r
          state.drift += dt * s.speed;\r
        }\r
\r
        const goal = PLACEMENTS.map((_, index) => (index === s.placement ? 1 : 0));\r
        let settling = false;\r
        const decay = Math.exp(-4 * dt);\r
        for (let index = 0; index < 4; index += 1) {\r
          const offset = state.weights[index] - goal[index];\r
          const momentum = state.weightVelocity[index] + 4 * offset;\r
          state.weights[index] = goal[index] + (offset + momentum * dt) * decay;\r
          state.weightVelocity[index] = (state.weightVelocity[index] - 4 * momentum * dt) * decay;\r
          if (Math.abs(state.weights[index] - goal[index]) > 0.0005) settling = true;\r
        }\r
        if (!settling) {\r
          state.weights = goal;\r
          state.weightVelocity = [0, 0, 0, 0];\r
        }\r
\r
        const engaged = s.mouseInteraction && state.inside && !reduced;\r
        state.presence += ((engaged ? 1 : 0) - state.presence) * (1 - Math.exp(-dt / 0.25));\r
        const lean = engaged ? s.parallax : 0;\r
        const targetYaw = (state.pointer[0] - 0.5) * lean * 0.14;\r
        const targetPitch = (state.pointer[1] - 0.5) * lean * 0.08;\r
        state.yawVelocity += (38 * (targetYaw - state.yaw) - 11 * state.yawVelocity) * dt;\r
        state.pitchVelocity += (38 * (targetPitch - state.pitch) - 11 * state.pitchVelocity) * dt;\r
        state.yaw += state.yawVelocity * dt;\r
        state.pitch += state.pitchVelocity * dt;\r
        const leaning =\r
          Math.abs(targetYaw - state.yaw) + Math.abs(targetPitch - state.pitch) > 1e-4 ||\r
          Math.abs(state.yawVelocity) + Math.abs(state.pitchVelocity) > 1e-4;\r
\r
        if (\r
          state.pressAt >= 0 &&\r
          state.pressPoint &&\r
          s.holdToGather &&\r
          !reduced &&\r
          state.clock - state.pressAt > 0.18\r
        ) {\r
          if (!state.holding) {\r
            state.holding = true;\r
            updateCamera(s);\r
            rayAt(state.pressPoint[0], state.pressPoint[1]);\r
            const travelTo =\r
              FOCUS / Math.max(ray[0] * cam.forward[0] + ray[1] * cam.forward[1] + ray[2] * cam.forward[2], 0.2);\r
            state.gatherCenter = [\r
              cam.eye[0] + ray[0] * travelTo,\r
              cam.eye[1] + ray[1] * travelTo,\r
              cam.eye[2] + ray[2] * travelTo\r
            ];\r
            state.reach = 0;\r
          }\r
          state.hold = Math.min(1, state.hold + dt / 0.5);\r
          state.reach = Math.min(state.reach + dt * 0.5, 0.55);\r
          const reach = (0.22 + state.reach) / s.scale;\r
          for (const shard of state.shards) {\r
            if (shard.joined || shard.level > 2) continue;\r
            const gx = shard.position[0] - state.gatherCenter[0];\r
            const gy = shard.position[1] - state.gatherCenter[1];\r
            if (gx * gx + gy * gy < reach * reach) shard.joined = true;\r
          }\r
        } else if (state.hold > 0) {\r
          state.hold = Math.max(0, state.hold - dt / 0.3);\r
          if (state.hold === 0) {\r
            for (const shard of state.shards) shard.joined = false;\r
          }\r
        }\r
\r
        for (const ring of state.rings) ring.age += dt;\r
        state.rings = state.rings.filter(ring => ring.age < RING_SECONDS);\r
        if (moving) state.markerDrift += dt * s.speed * 0.045;\r
\r
        const flashing = state.shards.some(\r
          shard => shard.flash > 0.01 || Math.abs(shard.tiltVelocity) > 0.01 || Math.abs(shard.tilt) > 0.01\r
        );\r
        const transient =\r
          settling ||\r
          leaning ||\r
          flashing ||\r
          state.presence > 0.002 ||\r
          state.rings.length > 0 ||\r
          state.hold > 0 ||\r
          (s.intro && !reduced && state.clock - state.introAt < INTRO_SECONDS + 0.5);\r
        if (state.seen !== s || transient || moving) state.quiet = 0;\r
        else state.quiet += 1;\r
        state.seen = s;\r
        if (state.quiet > 30) return;\r
        resize();\r
        render(s, dt, reduced);\r
      };\r
\r
      const local = (event: PointerEvent) => {\r
        const rect = container.getBoundingClientRect();\r
        return {\r
          point: [\r
            (event.clientX - rect.left) / Math.max(rect.width, 1),\r
            (event.clientY - rect.top) / Math.max(rect.height, 1)\r
          ],\r
          inside:\r
            event.clientX >= rect.left &&\r
            event.clientX <= rect.right &&\r
            event.clientY >= rect.top &&\r
            event.clientY <= rect.bottom\r
        };\r
      };\r
\r
      const onMove = (event: PointerEvent) => {\r
        const hit = local(event);\r
        state.inside = hit.inside;\r
        if (hit.inside) state.pointer = hit.point;\r
      };\r
\r
      const onLeave = () => {\r
        state.inside = false;\r
      };\r
\r
      const onDown = (event: PointerEvent) => {\r
        const s = settingsRef.current;\r
        if (event.button !== 0 || prefersReduced() || !s.mouseInteraction) return;\r
        if (\r
          event.target instanceof Element &&\r
          event.target.closest('a, button, input, textarea, select, label, [role="button"]')\r
        )\r
          return;\r
        const hit = local(event);\r
        if (!hit.inside) return;\r
        state.pointer = hit.point;\r
        state.pressAt = state.clock;\r
        state.pressPoint = hit.point;\r
      };\r
\r
      const onUp = () => {\r
        const s = settingsRef.current;\r
        if (state.pressAt < 0) return;\r
        if (!state.holding && s.pulseOnClick && state.pressPoint) {\r
          const aspect = output.size[0] / Math.max(output.size[1], 1);\r
          state.rings.push({\r
            x: (state.pressPoint[0] * 2 - 1) * aspect,\r
            y: 1 - state.pressPoint[1] * 2,\r
            age: 0\r
          });\r
          if (state.rings.length > MAX_RINGS) state.rings.shift();\r
        }\r
        if (state.holding) {\r
          for (const shard of state.shards) {\r
            if (shard.joined) shard.tiltVelocity += 9 * shard.sign;\r
          }\r
        }\r
        state.pressAt = -1;\r
        state.holding = false;\r
      };\r
\r
      window.addEventListener('pointermove', onMove, { passive: true });\r
      window.addEventListener('pointerdown', onDown);\r
      window.addEventListener('pointerup', onUp);\r
      window.addEventListener('pointercancel', onUp);\r
      document.documentElement.addEventListener('pointerleave', onLeave);\r
      cleanups.push(() => {\r
        window.removeEventListener('pointermove', onMove);\r
        window.removeEventListener('pointerdown', onDown);\r
        window.removeEventListener('pointerup', onUp);\r
        window.removeEventListener('pointercancel', onUp);\r
        document.documentElement.removeEventListener('pointerleave', onLeave);\r
      });\r
\r
      const visibility = new IntersectionObserver(entries => {\r
        state.visible = entries.some(entry => entry.isIntersecting);\r
      });\r
      visibility.observe(container);\r
      cleanups.push(() => visibility.disconnect());\r
      raf = requestAnimationFrame(tick);\r
    };\r
\r
    start().catch(fail);\r
\r
    return () => {\r
      disposed = true;\r
      cancelAnimationFrame(raf);\r
      cleanups.forEach(cleanup => cleanup());\r
      gpu?.dispose();\r
      canvas.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={[ROOT, className].filter(Boolean).join(' ')} style={style} />;\r
}\r
`,s={dependencies:"vgpu",usage:`import AeroShards from './AeroShards';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <AeroShards
    shardColor="#896ABD"
    accentColor="#A855F7"
    placement="full"
    material="glass"
    markers="plus"
    count={1300}
    depthOfField={0.75}
    vignette={0.3}
    mouseInteraction
    pulseOnClick
    holdToGather
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:a};export{s as aeroShards};
