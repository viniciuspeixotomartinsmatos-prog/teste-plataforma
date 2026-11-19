import{a as Qt,j as Gr}from"./index-DrbxZl7q.js";import{i as Zr,s as Jr,a as Qr,t as Je,u as ve,d as So,e as Le,b as dr,f as ea}from"./index-DGRdFj5X.js";const ta="aero-shards",oa="aero-shards-canvas",ko=["full","left","right","center"],Ao={glass:[0,0,0,0],chrome:[1,0,0,0]},Qe=24,j=160,K=4,eo=3.1,ra=2.75,aa=[1,.5],mr=1,q=[2.7,3.9,5.6,8.1,11.6],na=[.26,.23,.2,.17,.14],sa=[1,1.3,1.8,2.6,3.6],ur=[1,.8,.52,.32,.2],Z=q.length,Lo=3.4,ia={plus:0,dots:1},Ro=8,ca=[[.37,.61],[.83,.12],[.21,.88],[.66,.44],[.05,.27]],la=4,vr=2.6,fa=4,pa=[[.2,-.78],[-.72,.02],[.58,-.06],[-.24,.62],[.8,.3]],ha=[.84,.62,.44,.28,.14],da=[[.98,.78],[.9,.7],[.84,.64],[.8,.6],[.76,.56]],F=Math.PI*2,gr=`
struct Frame {
  view: vec4f,
  eye: vec4f,
  forward: vec4f,
  right: vec4f,
  up: vec4f,
  shard: vec4f,
  accent: vec4f,
  marker: vec4f,
  surface: vec4f,
}

struct Layer {
  view: vec4f,
  look: vec4f,
}

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) @interpolate(flat, first) center: vec4f,
  @location(1) @interpolate(flat, first) axis: vec4f,
  @location(2) @interpolate(flat, first) normal: vec4f,
  @location(3) @interpolate(flat, first) p01: vec4f,
  @location(4) @interpolate(flat, first) p23: vec4f,
  @location(5) @interpolate(flat, first) p4: vec4f,
  @location(6) @interpolate(flat, first) topA: vec4f,
  @location(7) @interpolate(flat, first) topB: vec4f,
  @location(8) @interpolate(flat, first) topC: vec4f,
  @location(9) @interpolate(flat, first) bottomA: vec4f,
  @location(10) @interpolate(flat, first) bottomB: vec4f,
  @location(11) @interpolate(flat, first) bottomC: vec4f,
}

struct FragmentOut {
  @location(0) color: vec4f,
  @builtin(frag_depth) depth: f32,
}

@group(0) @binding(0) var<uniform> scene: Frame;
@group(0) @binding(1) var<storage, read> shards: array<vec4f>;
@group(0) @binding(2) var<uniform> layerInfo: Layer;

fn project(world: vec3f) -> vec3f {
  let offset = world - scene.eye.xyz;
  let depth = max(dot(offset, scene.forward.xyz), 0.05);
  let x = dot(offset, scene.right.xyz);
  let y = dot(offset, scene.up.xyz);
  return vec3f(layerInfo.view.x * 0.5 + x * layerInfo.view.z / depth, layerInfo.view.y * 0.5 - y * layerInfo.view.z / depth, depth);
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> VertexOut {
  let index = instance * 6u;
  let a = shards[index];
  let b = shards[index + 1u];
  let c = shards[index + 2u];
  let d = shards[index + 3u];
  let e = shards[index + 4u];
  let f = shards[index + 5u];
  let center = a.xyz;
  let size = a.w;
  let axis = normalize(b.xyz);
  let normal = normalize(c.xyz);
  let side = normalize(cross(normal, axis));

  var out: VertexOut;
  let middle = project(center);
  if (middle.z < 0.35 || size <= 0.0) {
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);
    return out;
  }

  let count = i32(f.z);
  let points = array<vec2f, 5>(d.xy, d.zw, e.xy, e.zw, f.xy);
  var low = vec2f(1e9);
  var high = vec2f(-1e9);
  var tops = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));
  var bottoms = array<vec2f, 5>(vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0), vec2f(0.0));
  for (var i = 0; i < 5; i += 1) {
    let corner = points[min(i, count - 1)];
    let onPlate = center + (axis * corner.x + side * corner.y) * size;
    let top = project(onPlate + normal * b.w * size);
    let bottom = project(onPlate - normal * b.w * size);
    tops[i] = top.xy;
    bottoms[i] = bottom.xy;
    low = min(low, min(top.xy, bottom.xy));
    high = max(high, max(top.xy, bottom.xy));
  }
  low -= vec2f(2.0);
  high += vec2f(2.0);
  let corners = array<vec2f, 6>(vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0), vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0));
  let pixel = mix(low, high, corners[vertexIndex]);
  out.position = vec4f(pixel.x / layerInfo.view.x * 2.0 - 1.0, 1.0 - pixel.y / layerInfo.view.y * 2.0, 0.5, 1.0);
  out.center = a;
  out.axis = vec4f(axis, b.w);
  out.normal = vec4f(normal, c.w);
  out.p01 = d;
  out.p23 = e;
  out.p4 = f;
  out.topA = vec4f(tops[0], tops[1]);
  out.topB = vec4f(tops[2], tops[3]);
  out.topC = vec4f(tops[4], 0.0, 0.0);
  out.bottomA = vec4f(bottoms[0], bottoms[1]);
  out.bottomB = vec4f(bottoms[2], bottoms[3]);
  out.bottomC = vec4f(bottoms[4], 0.0, 0.0);
  return out;
}

fn cross2(a: vec2f, b: vec2f) -> f32 {
  return a.x * b.y - a.y * b.x;
}

fn outlineCoverage(p: vec2f, points: array<vec2f, 5>, count: i32) -> f32 {
  var area = 0.0;
  for (var i = 0; i < 5; i += 1) {
    if (i < count) {
      area += cross2(points[i], points[(i + 1) % count]);
    }
  }
  let orient = select(-1.0, 1.0, area > 0.0);
  var distance = -1e9;
  for (var i = 0; i < 5; i += 1) {
    if (i < count) {
      let a = points[i];
      let edge = points[(i + 1) % count] - a;
      let span = length(edge);
      if (span > 1e-4) {
        let n = vec2f(edge.y, -edge.x) * (orient / span);
        distance = max(distance, dot(p - a, n));
      }
    }
  }
  return clamp(0.5 - distance, 0.0, 1.0);
}

struct Prism {
  points: array<vec2f, 5>,
  count: i32,
  half: f32,
}

struct Hit {
  near: f32,
  far: f32,
  normal: vec3f,
}

fn plane(prism: Prism, k: i32) -> vec4f {
  if (k == 0) { return vec4f(0.0, 0.0, 1.0, prism.half); }
  if (k == 1) { return vec4f(0.0, 0.0, -1.0, prism.half); }
  let a = prism.points[k - 2];
  let b = prism.points[(k - 1) % prism.count];
  let edge = b - a;
  let n = normalize(vec2f(edge.y, -edge.x));
  return vec4f(n, 0.0, dot(n, a));
}

fn trace(prism: Prism, ro: vec3f, rd: vec3f) -> Hit {
  var hit: Hit;
  hit.near = -1e9;
  hit.far = 1e9;
  hit.normal = vec3f(0.0, 0.0, 1.0);
  for (var k = 0; k < 7; k += 1) {
    if (k < prism.count + 2) {
      let p = plane(prism, k);
      let denom = dot(p.xyz, rd);
      let gap = p.w - dot(p.xyz, ro);
      if (abs(denom) < 1e-7) {
        if (gap < 0.0) { hit.far = -1e9; }
      } else {
        let t = gap / denom;
        if (denom < 0.0) {
          if (t > hit.near) {
            hit.near = t;
            hit.normal = p.xyz;
          }
        } else if (t < hit.far) {
          hit.far = t;
        }
      }
    }
  }
  return hit;
}

fn exitFrom(prism: Prism, ro: vec3f, rd: vec3f) -> vec4f {
  var best = 1e9;
  var normal = vec3f(0.0, 0.0, -1.0);
  for (var k = 0; k < 7; k += 1) {
    if (k < prism.count + 2) {
      let p = plane(prism, k);
      let denom = dot(p.xyz, rd);
      if (denom > 1e-6) {
        let t = (p.w - dot(p.xyz, ro)) / denom;
        if (t < best) {
          best = t;
          normal = p.xyz;
        }
      }
    }
  }
  return vec4f(normal, max(best, 0.0));
}

fn rectLight(r: vec3f, dir: vec3f, across: vec3f, extent: vec2f, soft: f32) -> f32 {
  let facing = dot(r, dir);
  if (facing <= 0.0) { return 0.0; }
  let up = cross(dir, across);
  let u = dot(r, across) / facing;
  let v = dot(r, up) / facing;
  let a = 1.0 - smoothstep(extent.x - soft, extent.x + soft, abs(u));
  let b = 1.0 - smoothstep(extent.y - soft, extent.y + soft, abs(v));
  return a * b;
}

const KEY_DIR = vec3f(-0.28, 0.72, 0.64) / length(vec3f(-0.28, 0.72, 0.64));
const KEY_ACROSS = vec3f(0.92, 0.0, 0.4) / length(vec3f(0.92, 0.0, 0.4));
const LEFT_DIR = vec3f(-0.86, 0.12, 0.5) / length(vec3f(-0.86, 0.12, 0.5));
const LEFT_ACROSS = vec3f(0.5, 0.0, 0.86) / length(vec3f(0.5, 0.0, 0.86));
const RIM_DIR = vec3f(0.78, 0.22, -0.58) / length(vec3f(0.78, 0.22, -0.58));
const RIM_ACROSS = vec3f(0.6, 0.0, 0.8) / length(vec3f(0.6, 0.0, 0.8));
const TOP_DIR = vec3f(0.05, 0.94, -0.33) / length(vec3f(0.05, 0.94, -0.33));
const TOP_ACROSS = vec3f(1.0, 0.0, 0.0);

fn lobe(r: vec3f, dir: vec3f, width: f32) -> f32 {
  return exp((dot(r, dir) - 1.0) / (width * width));
}

fn studio(r: vec3f, soft: f32, accent: vec3f, ink: vec3f) -> vec3f {
  let sky = clamp(r.y * 0.5 + 0.5, 0.0, 1.0);
  var col = mix(ink * 0.03, ink * 0.12 + accent * 0.03, smoothstep(0.25, 0.95, sky));
  col += mix(ink, vec3f(1.0), 0.6) * lobe(r, KEY_DIR, 0.38) * 3.6;
  col += mix(accent, vec3f(1.0), 0.2) * lobe(r, RIM_DIR, 0.34) * 3.4;
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.12, 0.8), 0.08 + soft) * 3.2;
  col += vec3f(1.0, 0.98, 1.0) * rectLight(r, TOP_DIR, TOP_ACROSS, vec2f(0.9, 0.1), 0.08 + soft) * 2.6;
  return col;
}

fn studioLight(r: vec3f, soft: f32, accent: vec3f) -> vec3f {
  let ground = vec3f(0.2, 0.2, 0.23);
  let skyTone = vec3f(0.97, 0.97, 0.99);
  var col = mix(ground, skyTone, smoothstep(-0.08 - soft, 0.16 + soft, r.y));
  col = mix(col, vec3f(0.55, 0.55, 0.6), lobe(r, vec3f(0.0, -1.0, 0.0), 0.5) * 0.4);
  col += vec3f(0.4) * rectLight(r, KEY_DIR, KEY_ACROSS, vec2f(0.46, 0.3), 0.07 + soft);
  col -= vec3f(0.55) * rectLight(r, LEFT_DIR, LEFT_ACROSS, vec2f(0.1, 0.85), 0.05 + soft);
  col -= vec3f(0.45) * rectLight(r, RIM_DIR, RIM_ACROSS, vec2f(0.12, 0.9), 0.05 + soft);
  return clamp(col, vec3f(0.05), vec3f(1.2));
}

fn schlick(cosine: f32, f0: f32) -> f32 {
  return f0 + (1.0 - f0) * pow(1.0 - clamp(cosine, 0.0, 1.0), 5.0);
}

fn rayFor(pixel: vec2f) -> vec3f {
  let x = pixel.x - layerInfo.view.x * 0.5;
  let y = layerInfo.view.y * 0.5 - pixel.y;
  return normalize(scene.forward.xyz * layerInfo.view.z + scene.right.xyz * x + scene.up.xyz * y);
}

struct Surface {
  coverage: f32,
  color: vec3f,
  alpha: f32,
  depth: f32,
}

fn shade(pixel: vec2f, in: VertexOut) -> Surface {
  let center = in.center.xyz;
  let size = in.center.w;
  let axis = in.axis.xyz;
  let plateNormal = in.normal.xyz;
  let side = normalize(cross(plateNormal, axis));
  var prism: Prism;
  prism.points = array<vec2f, 5>(in.p01.xy, in.p01.zw, in.p23.xy, in.p23.zw, in.p4.xy);
  prism.count = i32(in.p4.z);
  prism.half = in.axis.w;

  let eye = scene.eye.xyz;
  let toLocal = mat3x3f(axis.x, side.x, plateNormal.x, axis.y, side.y, plateNormal.y, axis.z, side.z, plateNormal.z);
  let fromLocal = mat3x3f(axis, side, plateNormal);
  let origin = toLocal * (eye - center) / size;

  let rd = rayFor(pixel);
  let ray = toLocal * rd;
  let denom = dot(ray, vec3f(0.0, 0.0, 1.0));
  let flatT = -origin.z / select(denom, 1e-4, abs(denom) < 1e-4);
  let flatPoint = origin.xy + ray.xy * flatT;
  let footprint = max(length(fwidth(flatPoint)) * 0.7, 1e-4);
  let softBase = clamp(length(fwidth(reflect(rd, plateNormal))) * 0.5, 0.0, 0.5);

  let primary = trace(prism, origin, ray);
  let tops = array<vec2f, 5>(in.topA.xy, in.topA.zw, in.topB.xy, in.topB.zw, in.topC.xy);
  let bottoms = array<vec2f, 5>(in.bottomA.xy, in.bottomA.zw, in.bottomB.xy, in.bottomB.zw, in.bottomC.xy);
  let coverage = max(outlineCoverage(pixel, tops, prism.count), outlineCoverage(pixel, bottoms, prism.count));

  var surface: Surface;
  let facing = select(-1.0, 1.0, origin.z > 0.0);
  let capT = (facing * prism.half - origin.z) / select(ray.z, -1e-4 * facing, abs(ray.z) < 1e-4);
  let missed = primary.near > primary.far;
  let hitT = select(primary.near, capT, missed);
  let hitNormal = select(primary.normal, vec3f(0.0, 0.0, facing), missed);
  surface.coverage = select(0.0, coverage, hitT > 0.0);
  surface.color = vec3f(0.0);
  surface.alpha = 0.0;
  surface.depth = 1.0;
  if (surface.coverage <= 0.0) { return surface; }
  let mainRay = ray;

  let local = origin + mainRay * hitT;
  let worldRay = fromLocal * mainRay;
  let viewDepth = max(hitT * size * dot(worldRay, scene.forward.xyz), 0.05);
  surface.depth = clamp(1.0 - 0.3 / viewDepth, 0.0, 1.0);

  let radius = max(prism.half * 1.15, footprint * 2.5);
  var n = hitNormal;
  var bevel = 0.0;
  if (abs(n.z) > 0.5) {
    var gap = 1e9;
    for (var k = 2; k < 7; k += 1) {
      if (k < prism.count + 2) {
        let p = plane(prism, k);
        gap = min(gap, p.w - dot(p.xy, local.xy));
      }
    }
    var toward = vec2f(0.0);
    for (var k = 2; k < 7; k += 1) {
      if (k < prism.count + 2) {
        let p = plane(prism, k);
        let g = p.w - dot(p.xy, local.xy);
        toward += p.xy * exp(-(g - gap) / (radius * 0.35));
      }
    }
    toward = normalize(toward);
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);
    let angle = bevel * bevel * 0.7853982;
    n = normalize(n * cos(angle) + vec3f(toward, 0.0) * sin(angle));
  } else {
    let gap = prism.half - abs(local.z);
    bevel = clamp(1.0 - gap / radius, 0.0, 1.0);
    let angle = bevel * bevel * 0.7853982;
    n = normalize(n * cos(angle) + vec3f(0.0, 0.0, sign(local.z)) * sin(angle));
  }
  let bendRate = 1.8 / max(radius / footprint, 1.0);
  let normal = normalize(fromLocal * n);
  let view = -worldRay;
  let reflected = reflect(worldRay, normal);
  let soft = softBase + bendRate * smoothstep(0.0, 0.25, bevel) * 1.2 + clamp(footprint * 0.6, 0.0, 0.5);
  let ndv = clamp(dot(normal, view), 0.0, 1.0);

  let accent = scene.accent.rgb;
  let base = scene.shard.rgb;
  let world = center + fromLocal * local * size;
  let height = clamp(0.5 + world.y * 0.45, 0.0, 1.0);
  let tone = mix(accent, base, height);
  let body = mix(tone, mix(base, accent, 0.5), in.normal.w * 0.3);
  let mode = scene.surface.x;
  let lightMode = scene.up.w > 0.5;
  let wrap = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);

  var color = vec3f(0.0);
  var alpha = 1.0;
  let chrome = mode > 0.5;
  if (lightMode) {
    let env = studioLight(reflected, soft, accent);
    if (chrome) {
      color = env * mix(body, vec3f(1.0), 0.6);
    } else {
      let fresnel = schlick(ndv, 0.05);
      let diffuse = clamp(dot(normal, KEY_DIR) * 0.5 + 0.5, 0.0, 1.0);
      alpha = clamp(0.32 + fresnel * 0.5 + (1.0 - abs(n.z)) * 0.5, 0.0, 1.0);
      color = mix(body, vec3f(1.0), 0.15) * (0.5 + 0.4 * diffuse) * alpha + (env - vec3f(0.78)) * fresnel * 0.8;
    }
  } else if (chrome) {
    let env = studio(reflected, soft, accent, body);
    color = env * mix(body, vec3f(1.0), 0.55) * 0.9 + body * 0.02;
  } else {
    let fresnel = schlick(ndv, 0.04);
    let env = studio(reflected, soft, accent, body);
    var light = vec3f(0.0);
    var cursor = local;
    var direction = toLocal * refract(worldRay, normal, 1.0 / 1.5);
    var travelled = 0.0;
    var carry = 1.0 - fresnel;
    var through = 0.0;
    for (var bounce = 0; bounce < 3; bounce += 1) {
      let outlet = exitFrom(prism, cursor, direction);
      travelled += outlet.w;
      cursor = cursor + direction * outlet.w;
      let outward = outlet.xyz;
      let escaped = refract(direction, -outward, 1.5);
      if (dot(escaped, escaped) > 0.0) {
        let leave = schlick(dot(direction, outward), 0.04);
        let worldOut = normalize(fromLocal * escaped);
        let absorb = exp(-(vec3f(1.0) - body) * travelled * size * 22.0);
        let straight = smoothstep(0.97, 0.999, dot(worldOut, worldRay));
        let energy = carry * (1.0 - leave);
        light += studio(worldOut, soft * 2.0 + 0.04, accent, body) * absorb * energy * (1.0 - straight) * 2.0;
        through += energy * straight * (absorb.r + absorb.g + absorb.b) / 3.0;
        carry *= leave;
      }
      direction = reflect(direction, outward);
    }
    let edge = max(pow(1.0 - abs(n.z), 1.2), bevel * bevel * 0.85);
    let glow = mix(mix(body, accent, 0.35), vec3f(1.0), 0.28) * edge * (0.35 + 0.45 * wrap);
    color = env * fresnel * 0.85 + light * (1.0 - smoothstep(0.0, 0.6, bevel)) + body * 0.02 + glow;
    alpha = clamp(1.0 - through + edge * 0.25, 0.0, 1.0);
  }

  color *= select(1.3, 1.0, lightMode);
  let haze = smoothstep(3.5, 12.0, viewDepth) * layerInfo.look.x;
  let hazeColor = select(mix(base, accent, 0.5) * 0.3, mix(base, vec3f(1.0), 0.72), lightMode);
  color = mix(color, hazeColor * alpha + color * 0.3, haze);
  let flash = in.p4.w;
  color += mix(accent, vec3f(1.0), 0.35) * flash * select(0.5, 0.0, lightMode) * max(alpha, 0.35);
  alpha = max(alpha, flash * 0.45 * select(1.0, 0.0, lightMode));
  surface.color = color;
  surface.alpha = alpha;
  return surface;
}

@fragment
fn fs_solid(in: VertexOut) -> FragmentOut {
  let surface = shade(in.position.xy, in);
  if (surface.coverage < 0.999 || surface.alpha < 0.6) { discard; }
  var out: FragmentOut;
  out.color = vec4f(surface.color, surface.alpha);
  out.depth = surface.depth;
  return out;
}

@fragment
fn fs_edge(in: VertexOut) -> FragmentOut {
  let surface = shade(in.position.xy, in);
  if (surface.coverage <= 0.001 || (surface.coverage >= 0.9996 && surface.alpha >= 0.62)) { discard; }
  var out: FragmentOut;
  out.color = vec4f(surface.color, surface.alpha) * surface.coverage;
  out.depth = surface.depth;
  return out;
}
`,xr=`
struct Spread { texel: vec4f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> spreadInfo: Spread;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let sigma = max(spreadInfo.texel.z, 0.3);
  let reach = min(i32(ceil(sigma * 2.6)), 20);
  var total = textureSampleLevel(source, linearSampler, uv, 0.0);
  var weight = 1.0;
  for (var i = 1; i <= reach; i += 1) {
    let w = exp(-f32(i * i) / (2.0 * sigma * sigma));
    let o = spreadInfo.texel.xy * f32(i);
    total += (textureSampleLevel(source, linearSampler, uv + o, 0.0) + textureSampleLevel(source, linearSampler, uv - o, 0.0)) * w;
    weight += 2.0 * w;
  }
  return total / weight;
}
`,ma=`
struct Shade {
  info: vec4f,
  more: vec4f,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var depthMap: texture_depth_2d;
@group(0) @binding(2) var<uniform> shadeInfo: Shade;

@fragment
fn fs_main(@builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let bounds = vec2i(textureDimensions(source)) - vec2i(1);
  let here = vec2i(pixel.xy);
  let color = textureLoad(source, here, 0);
  if (color.a <= 0.002 || shadeInfo.info.z <= 0.0) { return color; }
  let depth = textureLoad(depthMap, here, 0);
  let east = textureLoad(depthMap, clamp(here + vec2i(1, 0), vec2i(0), bounds), 0);
  let west = textureLoad(depthMap, clamp(here - vec2i(1, 0), vec2i(0), bounds), 0);
  let south = textureLoad(depthMap, clamp(here + vec2i(0, 1), vec2i(0), bounds), 0);
  let north = textureLoad(depthMap, clamp(here - vec2i(0, 1), vec2i(0), bounds), 0);
  let limit = shadeInfo.more.x * 0.5;
  let slopeX = clamp(select(east - depth, depth - west, abs(depth - west) < abs(east - depth)), -limit, limit);
  let slopeY = clamp(select(south - depth, depth - north, abs(depth - north) < abs(south - depth)), -limit, limit);
  var occlusion = 0.0;
  for (var i = 1; i <= 12; i += 1) {
    let offset = -shadeInfo.info.xy * f32(i);
    let probe = clamp(vec2i(pixel.xy + offset), vec2i(0), bounds);
    let other = textureLoad(depthMap, probe, 0);
    let expected = depth + slopeX * offset.x + slopeY * offset.y;
    let closer = smoothstep(shadeInfo.more.x * 0.6, shadeInfo.more.x * 2.4, expected - other);
    let reach = 1.0 - f32(i - 1) / 12.0;
    occlusion = max(occlusion, closer * reach * reach);
  }
  return vec4f(color.rgb * (1.0 - occlusion * shadeInfo.info.z), color.a);
}
`,yr=`
struct Blend { info: vec4f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> mixInfo: Blend;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  return textureSampleLevel(source, linearSampler, uv, 0.0) * mixInfo.info.x;
}
`,ua=`
struct Frame {
  view: vec4f,
  eye: vec4f,
  forward: vec4f,
  right: vec4f,
  up: vec4f,
  shard: vec4f,
  accent: vec4f,
  marker: vec4f,
  surface: vec4f,
}

struct MarkerOut {
  @builtin(position) position: vec4f,
  @location(0) local: vec2f,
  @location(1) @interpolate(flat, first) shape: vec4f,
  @location(2) @interpolate(flat, first) light: vec4f,
}

@group(0) @binding(0) var<uniform> scene: Frame;
@group(0) @binding(1) var<storage, read> markers: array<vec4f>;

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instance: u32) -> MarkerOut {
  let a = markers[instance * 2u];
  let b = markers[instance * 2u + 1u];
  let offset = a.xyz - scene.eye.xyz;
  let depth = max(dot(offset, scene.forward.xyz), 0.05);
  let center = vec2f(
    scene.view.x * 0.5 + dot(offset, scene.right.xyz) * scene.view.z / depth,
    scene.view.y * 0.5 - dot(offset, scene.up.xyz) * scene.view.z / depth,
  );
  let pixel = scene.marker.y;
  let size = scene.marker.z * clamp(sqrt(scene.marker.w / depth), 0.6, 1.3) * b.z;
  let blur = min(scene.forward.w * abs(1.0 - scene.eye.w / depth), scene.right.w) * 0.18;
  let frame = b.y;
  let reach = select(size, size * 2.6, frame > 0.001) + blur + 1.5 * pixel;
  let corners = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0));
  let corner = corners[vertexIndex % 6u] * reach;
  var out: MarkerOut;
  if (depth < 0.35 || a.w <= 0.002) {
    out.position = vec4f(2.0, 2.0, 0.5, 1.0);
    return out;
  }
  let at = center + corner;
  out.position = vec4f(at.x / scene.view.x * 2.0 - 1.0, 1.0 - at.y / scene.view.y * 2.0, 0.5, 1.0);
  out.local = corner;
  out.shape = vec4f(size, blur, frame, pixel);
  out.light = vec4f(b.x, a.w, 0.0, 0.0);
  return out;
}

fn bar(value: f32, edge: f32, soft: f32) -> f32 {
  return clamp((edge - value) / soft + 0.5, 0.0, 1.0);
}

@fragment
fn fs_main(in: MarkerOut) -> @location(0) vec4f {
  let size = in.shape.x;
  let blur = in.shape.y;
  let frame = in.shape.z;
  let pixel = in.shape.w;
  let q = abs(in.local);
  let soft = 1.0 + blur;
  let thick = 0.6 * pixel + blur * 0.5;
  let energy = (0.6 * pixel) / thick;
  var cover = 0.0;
  if (scene.marker.x < 0.5) {
    let across = bar(q.x, size, soft) * bar(q.y, thick, soft);
    let down = bar(q.y, size, soft) * bar(q.x, thick, soft);
    cover = max(across, down) * energy;
  } else {
    cover = bar(length(in.local), size * 0.42 + blur * 0.3, soft) * mix(1.0, energy, 0.6);
  }
  if (frame > 0.001) {
    let edge = size * 2.3;
    let span = edge * 0.45;
    let line = 0.5 * pixel;
    let sides = bar(abs(q.x - edge), line, 1.0) * bar(edge - span - q.y, 0.0, 1.0) * bar(q.y - edge - line, 0.0, 1.0);
    let caps = bar(abs(q.y - edge), line, 1.0) * bar(edge - span - q.x, 0.0, 1.0) * bar(q.x - edge - line, 0.0, 1.0);
    cover = max(cover, max(sides, caps) * frame * 0.85);
  }
  let glow = in.light.x;
  let fade = in.light.y;
  let tint = mix(scene.shard.rgb, scene.accent.rgb, 0.4);
  if (scene.up.w > 0.5) {
    let ink = (1.0 - exp(-glow * 1.6)) * 0.85 * cover * fade;
    return vec4f(mix(tint, scene.accent.rgb, 0.5) * 0.55 * ink, ink);
  }
  let light = cover * glow * fade;
  let color = (1.0 - exp(-mix(tint, vec3f(1.0), 0.35) * light * 1.6)) * 1.4;
  return vec4f(color, max(max(color.r, color.g), color.b) * 0.8);
}
`,va=`
struct Bloom { texel: vec4f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> bloom: Bloom;

fn bright(uv: vec2f) -> vec3f {
  let color = textureSampleLevel(source, linearSampler, uv, 0.0).rgb;
  let peak = max(max(color.r, color.g), color.b);
  return color * smoothstep(bloom.texel.z, bloom.texel.z + bloom.texel.w, peak);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let o = bloom.texel.xy;
  let total = bright(uv + vec2f(o.x, o.y)) + bright(uv + vec2f(-o.x, o.y)) + bright(uv + vec2f(o.x, -o.y)) + bright(uv - o);
  return vec4f(total * 0.25, 0.0);
}
`,ga=`
struct Bloom { texel: vec4f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> bloom: Bloom;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let o = bloom.texel.xy;
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.25;
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, o.y), 0.0) * 0.1875;
  color += textureSampleLevel(source, linearSampler, uv + vec2f(-o.x, o.y), 0.0) * 0.1875;
  color += textureSampleLevel(source, linearSampler, uv + vec2f(o.x, -o.y), 0.0) * 0.1875;
  color += textureSampleLevel(source, linearSampler, uv - o, 0.0) * 0.1875;
  return color;
}
`,br=`
struct Bloom { texel: vec4f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var<uniform> bloom: Bloom;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let delta = bloom.texel.xy;
  var color = textureSampleLevel(source, linearSampler, uv, 0.0) * 0.181862;
  color += (textureSampleLevel(source, linearSampler, uv + delta * 1.423135, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 1.423135, 0.0)) * 0.284316;
  color += (textureSampleLevel(source, linearSampler, uv + delta * 3.326702, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 3.326702, 0.0)) * 0.106598;
  color += (textureSampleLevel(source, linearSampler, uv + delta * 5.242989, 0.0) + textureSampleLevel(source, linearSampler, uv - delta * 5.242989, 0.0)) * 0.018156;
  return color;
}
`,xa=`
struct Finish {
  info: vec4f,
  paper: vec4f,
  mode: vec4f,
}
@group(0) @binding(0) var sceneTexture: texture_2d<f32>;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var bloom0: texture_2d<f32>;
@group(0) @binding(3) var bloom1: texture_2d<f32>;
@group(0) @binding(4) var bloom2: texture_2d<f32>;
@group(0) @binding(5) var bloom3: texture_2d<f32>;
@group(0) @binding(6) var<uniform> finish: Finish;

fn hash12(value: vec2f) -> f32 {
  let p = fract(value * vec2f(0.1031, 0.1030));
  let mixed = p + dot(p, p.yx + 33.33);
  return fract((mixed.x + mixed.y) * mixed.x);
}

fn smootherstep(x: f32) -> f32 {
  let t = clamp(x, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

@fragment
fn fs_main(@location(0) uv: vec2f, @builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let scene = textureLoad(sceneTexture, vec2i(pixel.xy), 0);
  let alpha = clamp(scene.a, 0.0, 1.0);
  let noise = hash12(floor(pixel.xy) + vec2f(finish.info.y, finish.info.y * 1.618)) - 0.5;
  let grain = 1.0 + noise * finish.info.x;
  var rgb = vec3f(0.0);
  var a = alpha;
  if (finish.mode.x > 0.5) {
    rgb = clamp(scene.rgb, vec3f(0.0), vec3f(alpha)) * grain;
  } else {
    var halo = textureSampleLevel(bloom0, linearSampler, uv, 0.0).rgb * 0.4;
    halo += textureSampleLevel(bloom1, linearSampler, uv, 0.0).rgb * 0.3;
    halo += textureSampleLevel(bloom2, linearSampler, uv, 0.0).rgb * 0.2;
    halo += textureSampleLevel(bloom3, linearSampler, uv, 0.0).rgb * 0.1;
    halo = halo * finish.info.z;
    rgb = (1.0 - exp(-max(scene.rgb, vec3f(0.0)) * finish.info.w)) * grain + halo / (1.0 + halo);
    a = max(alpha, max(max(rgb.r, rgb.g), rgb.b));
  }
  let vignette = finish.mode.y;
  if (vignette > 0.0) {
    let size = vec2f(textureDimensions(sceneTexture));
    let reach = max(vignette * 0.5 * min(size.x, size.y), 1.0);
    let fromEdge = min(pixel.xy, size - pixel.xy);
    let mask = smootherstep(fromEdge.x / reach) * smootherstep(fromEdge.y / reach);
    rgb *= mask;
    a *= mask;
  }
  rgb = clamp(rgb, vec3f(0.0), vec3f(max(a, 0.0)));
  if (finish.paper.a > 0.5) {
    return vec4f(finish.paper.rgb * (1.0 - a) + rgb, 1.0);
  }
  return vec4f(rgb, a);
}
`,N=(y,u,s)=>Math.min(s,Math.max(u,y)),et=y=>{const u=N(y,0,1);return u*u*u*(u*(u*6-15)+10)};let ht=null;const Eo=(y,u)=>{if(y==="transparent")return null;if(typeof document>"u"||(ht||(ht=document.createElement("canvas").getContext("2d")),!ht))return u;ht.fillStyle="#000000",ht.fillStyle=y;const s=ht.fillStyle;if(s.startsWith("#")){const z=parseInt(s.slice(1),16);return[(z>>16&255)/255,(z>>8&255)/255,(z&255)/255]}const Y=/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(s);return Y?Y[4]!==void 0&&Number(Y[4])===0?null:[Number(Y[1])/255,Number(Y[2])/255,Number(Y[3])/255]:u},wr=()=>{var y;return typeof window<"u"&&(((y=window.matchMedia)==null?void 0:y.call(window,"(prefers-reduced-motion: reduce)").matches)??!1)},_o=(y,u,s,Y)=>{let z=Math.imul(y+2654435769,2246822507)^Math.imul(u+1663821227,3266489909);return z^=Math.imul(s+668265263,374761393)^Math.imul(Y+2135587861,2654435761),z=Math.imul(z^z>>>15,739982445),z=Math.imul(z^z>>>12,695872825),((z^z>>>15)>>>0)/4294967296},ya=y=>()=>{y=y+1831565813|0;let u=Math.imul(y^y>>>15,1|y);return u=u+Math.imul(u^u>>>7,61|u)^u,((u^u>>>14)>>>0)/4294967296},ba=(y,u,s,Y,z)=>{let J,le,Q;if(y===0){J=-1.32+2.64*s;const X=pa[u];le=X[0]+(X[1]-X[0])*s+.1*Math.sin(s*F*.7+u*2.3)+.045*Math.sin(s*F*1.9+u),Q=q[u]+.35*Math.sin(s*Math.PI*1.4+u*1.9)}else if(y===3){const X=s*F+u*.9+Math.PI*.5,Pe=da[u];J=Math.cos(X)*Pe[0],le=Math.sin(X)*Pe[1]-.02,Q=q[u]*1.1-Math.sin(X)*(.5+u*.25)}else{const X=y===1?-1:1;le=1.32-2.64*s,J=X*(ha[u]+.1*Math.sin(s*F*.6+u*1.3)+.03*Math.sin(s*F*2.1+u)-.08*(1-s)),Q=q[u]+.3*Math.sin(s*Math.PI*1.2+u)}return z[0]=J*Y*Q/K,z[1]=le*Q/K,z[2]=K-Q,z},Mr=(y,u)=>{const s=ya(u),Y=[];let z=0;for(let J=0;J<Z;J+=1){const le=J===Z-1?y-z:Math.round(y*na[J]);z+=le;for(let Q=0;Q<le;Q+=1){const X=s()*2-1,Pe=s(),W=[];if(Pe<.55){const D=.17+s()*.15;W.push([1,(s()-.5)*.08]),W.push([-.5-s()*.25,D*(.8+s()*.4)]),W.push([-.5-s()*.25,-D*(.8+s()*.4)])}else if(Pe<.8){const D=.2+s()*.14;W.push([1,0]),W.push([(s()-.3)*.5,D]),W.push([-.55-s()*.2,(s()-.5)*.1]),W.push([(s()-.3)*.5,-D*(.8+s()*.4)])}else{const D=s()<.5?4:5,ot=.4+s()*.3,to=s()*F;for(let dt=0;dt<D;dt+=1){const Pt=to+(dt+(s()-.5)*.6)*F/D;W.push([Math.cos(Pt),Math.sin(Pt)*ot])}}const tt=W.length;let It=0,Ft=0;for(const D of W)It+=D[0]/tt,Ft+=D[1]/tt;const Ot=[];for(let D=0;D<5;D+=1){const ot=W[Math.min(D,tt-1)];Ot.push(ot[0]-It,ot[1]-Ft)}Y.push({level:J,phase:(Q+s())/Math.max(le,1),lane:Math.sign(X)*Math.pow(Math.abs(X),.85),layer:Math.sqrt(-2*Math.log(Math.max(s(),1e-6)))*Math.cos(F*s()),size:.6+s()*s()*1.25,shape:Ot,sides:tt,thickness:.06+s()*.04,yaw:(s()-.5)*.36,bank:(s()-.5)*.5,pitch:(s()-.5)*.24,tint:s(),drift:[s()*F,s()*F,s()*F],rate:[.3+s()*.35,.25+s()*.35,.3+s()*.3],flutter:[s()*F,.5+s()*.5],arrive:s(),sign:s()<.5?-1:1,slot:[s()*F,.06+.3*Math.sqrt(s()),s()-.5,s()<.85?1:-1],offset:[0,0,0],velocity:[0,0,0],tilt:0,tiltVelocity:0,flash:0,gather:0,joined:!1,position:[0,0,0],s:0})}}return Y};function Sa({shardColor:y="#896ABD",accentColor:u="#A855F7",backgroundColor:s="transparent",lightMode:Y=!1,placement:z="full",material:J="glass",count:le=1300,shardSize:Q=1,spread:X=1,twist:Pe=1,billow:W=1,speed:tt=1,scale:It=1,depthOfField:Ft=.75,glow:Ot=.35,grain:D=.06,vignette:ot=.3,intro:to=!0,mouseInteraction:dt=!0,mouseStrength:Pt=.6,markers:zr="plus",pulseOnClick:Sr=!0,holdToGather:kr=!0,parallax:Ar=.5,paused:Lr=!1,dpr:Rr=2,className:Er="",style:_r,onError:Io}){const Fo=Qt.useRef(null),Tt=Qt.useRef(Io);Tt.current=Io;const Oo={shard:Eo(y,[.54,.42,.74])??[.54,.42,.74],accent:Eo(u,[.66,.33,.97])??[.66,.33,.97],paper:Eo(s,null),lightMode:Y,placement:Math.max(0,ko.indexOf(z)),material:Ao[J]??Ao.glass,count:Math.round(N(le,100,6e3)),shardSize:N(Q,.2,4),spread:N(X,0,3),twist:N(Pe,0,3),billow:N(W,0,3),speed:N(tt,0,4),scale:N(It,.4,2.5),depthOfField:N(Ft,0,1),glow:N(Ot,0,2),grain:N(D,0,.5),vignette:N(ot,0,1),intro:to,mouseInteraction:dt,mouseStrength:N(Pt,0,1),markers:ia[zr]??-1,pulseOnClick:Sr,holdToGather:kr,parallax:N(Ar,0,1),paused:Lr,dpr:Math.max(.5,Rr)},Re=Qt.useRef(Oo);return Re.current=Oo,Qt.useEffect(()=>{const oe=Fo.current;if(!oe)return;const Ct=document.createElement("canvas");Ct.className=oa,oe.appendChild(Ct);let mt=!1,Ee=null,Dt=0;const ut=[],Po=d=>{var vt;mt||(mt=!0,cancelAnimationFrame(Dt),Ee==null||Ee.dispose(),Ee=null,(vt=Tt.current)==null||vt.call(Tt,d instanceof Error?d:new Error(String(d))))};return(async()=>{if(typeof navigator>"u"||!("gpu"in navigator))throw new Error("WebGPU is not available");const d=await Zr({powerPreference:"high-performance"});if(Ee=d,mt){d.dispose();return}ut.push(d.onError(Po));const vt=navigator.gpu.getPreferredCanvasFormat(),To=()=>{const o=Math.min(window.devicePixelRatio||1,Re.current.dpr);return[Math.max(1,Math.round(oe.clientWidth*o)),Math.max(1,Math.round(oe.clientHeight*o))]},g=Jr(d,Ct,{autoResize:!1,size:To(),format:vt,alphaMode:"premultiplied"}),_e=Qr(d,{minFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}),Te=Je(d,{size:g.size,format:"rgba16float"}),Vt=o=>[Math.max(1,Math.round(g.size[0]/2**(o+1))),Math.max(1,Math.round(g.size[1]/2**(o+1)))],re=Array.from({length:fa},(o,t)=>({main:Je(d,{size:Vt(t),format:"rgba16float"}),spare:Je(d,{size:Vt(t),format:"rgba16float"})})),Ht=ve(d,{view:[1,1,1,0],eye:[0,0,K,eo],forward:[0,0,-1,0],right:[1,0,0,0],up:[0,1,0,0],shard:[.54,.42,.74,.5],accent:[.66,.33,.97,0],marker:[0,1,4,K],surface:[7,0,0,2.4]});let gt=0,rt=null,ae=new Float32Array(0);const oo=So(d,{shader:ua,vertices:6,cull:"none",depth:!1,blend:"premultiplied",label:"aero-shards-markers"}),Co=o=>{o<=gt&&rt||(gt=Math.max(o,512),ae=new Float32Array(gt*Ro),rt=dr(d,ae.byteLength,"read"),oo.set({scene:Ht,markers:rt}))};Co(512);const fe=o=>[Math.max(1,Math.round(g.size[0]*o)),Math.max(1,Math.round(g.size[1]*o))],ge=aa.map((o,t)=>({scale:o,layer:Je(d,{size:fe(o),format:"rgba16float",depth:"depth32float"}),shaded:Je(d,{size:fe(o),format:"rgba16float"}),temp:Je(d,{size:t===0?[1,1]:fe(o),format:"rgba16float"}),blurred:Je(d,{size:t===0?[1,1]:fe(o),format:"rgba16float"}),softReady:t!==0})),ro=q.map(()=>ve(d,{view:[1,1,1,0],look:[.7,0,0,0]})),Do=q.map(()=>ve(d,{texel:[0,0,0,0]})),Vo=q.map(()=>ve(d,{texel:[0,0,0,0]})),ao=q.map(()=>ve(d,{info:[1,0,0,0]})),Ho=q.map(()=>ve(d,{info:[0,0,0,0],more:[0,0,0,0]})),no=q.map((o,t)=>So(d,{shader:gr,entry:{fragment:"fs_solid"},vertices:6,cull:"none",depth:{write:!0,compare:"less"},label:`aero-shards-solid-${t}`})),so=q.map((o,t)=>So(d,{shader:gr,entry:{fragment:"fs_edge"},vertices:6,cull:"none",depth:{write:!1,compare:"less"},blend:"premultiplied",label:`aero-shards-edge-${t}`})),io=q.map((o,t)=>ge.map((c,p)=>({shadow:Le(d,ma,{label:`aero-shards-shadow-${t}-${p}`,set:{source:c.layer,depthMap:c.layer.depth,shadeInfo:Ho[t]}}),blurX:Le(d,xr,{label:`aero-shards-depth-x-${t}-${p}`,set:{source:c.shaded,linearSampler:_e,spreadInfo:Do[t]}}),blurY:Le(d,xr,{label:`aero-shards-depth-y-${t}-${p}`,set:{source:c.temp,linearSampler:_e,spreadInfo:Vo[t]}}),sharp:Le(d,yr,{label:`aero-shards-sharp-${t}-${p}`,blend:"premultiplied",set:{source:c.shaded,linearSampler:_e,mixInfo:ao[t]}}),soft:Le(d,yr,{label:`aero-shards-soft-${t}-${p}`,blend:"premultiplied",set:{source:c.blurred,linearSampler:_e,mixInfo:ao[t]}})})));let xt=0,Ce=null,Nt=new Float32Array(0),V=new Float32Array(0),yt=new Float32Array(0);const No=o=>{o<=xt&&Ce||(xt=Math.max(o,256),Nt=new Float32Array(xt*Qe),V=new Float32Array(xt*Qe),yt=new Float32Array(xt),Ce=dr(d,Nt.byteLength,"read"),q.forEach((t,c)=>{no[c].set({scene:Ht,shards:Ce,layerInfo:ro[c]}),so[c].set({scene:Ht,shards:Ce,layerInfo:ro[c]})}))};No(Re.current.count);const co=re.map((o,t)=>{const c=t===0?Te:re[t-1].main,p=ve(d,{texel:[0,0,0,0]}),h=ve(d,{texel:[0,0,0,0]}),b=ve(d,{texel:[0,0,0,0]});return{source:c,level:o,downParams:p,horizontalParams:h,verticalParams:b,down:Le(d,t===0?va:ga,{label:`aero-shards-down-${t}`,set:{source:c,linearSampler:_e,bloom:p}}),horizontal:Le(d,br,{label:`aero-shards-blur-x-${t}`,set:{source:o.main,linearSampler:_e,bloom:h}}),vertical:Le(d,br,{label:`aero-shards-blur-y-${t}`,set:{source:o.spare,linearSampler:_e,bloom:b}})}}),qo=ve(d,{info:[0,0,0,1],paper:[0,0,0,0],mode:[0,0,0,0]}),Bo=Le(d,xa,{label:"aero-shards-finish",set:{sceneTexture:Te,linearSampler:_e,bloom0:re[0].main,bloom1:re[1].main,bloom2:re[2].main,bloom3:re[3].main,finish:qo}});if(await Promise.all([...no.map(o=>o.compile(ge[0].layer)),...so.map(o=>o.compile(ge[0].layer)),...io.flatMap(o=>o.flatMap((t,c)=>[t.shadow.compile(ge[c].shaded),t.blurX.compile(ge[c].temp),t.blurY.compile(ge[c].blurred),t.sharp.compile(Te),t.soft.compile(Te)])),oo.compile(Te),Bo.compile({colors:[vt]}),...co.flatMap((o,t)=>[o.down.compile(re[t].main),o.horizontal.compile(re[t].spare),o.vertical.compile(re[t].main)])]),mt)return;const qt=Array.from({length:Z},()=>({position:new Float32Array(j*3),tangent:new Float32Array(j*3),across:new Float32Array(j*3),lift:new Float32Array(j*3),length:1})),Bt=[0,0,0,0,0],lo=[0,0,0,0,0],xe=new Float32Array((j+1)*3),bt=new Float32Array(j+1),jt=[0,0,0];let jo="";const e={visible:!1,clock:0,last:0,travel:new Float64Array(Z),roll:0,twist:0,drift:0,introAt:-1,weights:ko.map((o,t)=>t===Re.current.placement?1:0),weightVelocity:[0,0,0,0],shards:Mr(Re.current.count,1337),order:[],pointer:[.5,.5],inside:!1,presence:0,yaw:0,pitch:0,yawVelocity:0,pitchVelocity:0,pressAt:-1,pressPoint:null,holding:!1,hold:0,reach:0,gatherCenter:[0,0,0],rings:[],markerDrift:0,markerTarget:"",markerTotal:0,targets:new Map,quiet:0,seen:null},Ir=o=>{const t=e.weights[3]>.999,c=`${o.toFixed(4)}|${e.weights.map(p=>p.toFixed(4)).join(",")}`;if(c===jo)return t;jo=c;for(let p=0;p<Z;p+=1){const h=qt[p];let b=0;for(let v=0;v<=j;v+=1){const B=v/j;let S=0,l=0,n=0;for(let i=0;i<4;i+=1){const f=e.weights[i];f<1e-4||(ba(i,p,B,o,jt),S+=jt[0]*f,l+=jt[1]*f,n+=jt[2]*f)}xe[v*3]=S,xe[v*3+1]=l,xe[v*3+2]=n,v>0&&(b+=Math.hypot(S-xe[v*3-3],l-xe[v*3-2],n-xe[v*3-1])),bt[v]=b}h.length=Math.max(b,.001);let A=0;for(let v=0;v<j;v+=1){const B=v/(j-1)*b;for(;A<j-1&&bt[A+1]<B;)A+=1;const S=Math.max(bt[A+1]-bt[A],1e-6),l=N((B-bt[A])/S,0,1);for(let n=0;n<3;n+=1)h.position[v*3+n]=xe[A*3+n]+(xe[A*3+3+n]-xe[A*3+n])*l}let E=0,_=1,O=0;for(let v=0;v<j;v+=1){const B=Math.max(0,v-1),S=Math.min(j-1,v+1);let l=h.position[S*3]-h.position[B*3],n=h.position[S*3+1]-h.position[B*3+1],i=h.position[S*3+2]-h.position[B*3+2];const f=Math.hypot(l,n,i)||1;l/=f,n/=f,i/=f,v===0&&(E=-n,_=l,O=0);const m=E*l+_*n+O*i;E-=l*m,_-=n*m,O-=i*m;const P=Math.hypot(E,_,O)||1;E/=P,_/=P,O/=P,h.tangent[v*3]=l,h.tangent[v*3+1]=n,h.tangent[v*3+2]=i,h.across[v*3]=E,h.across[v*3+1]=_,h.across[v*3+2]=O,h.lift[v*3]=n*O-i*_,h.lift[v*3+1]=i*E-l*O,h.lift[v*3+2]=l*_-n*E}}return t},Yo=()=>{const o=To();o[0]===g.size[0]&&o[1]===g.size[1]||(g.resize(o),Te.resize(o),ge.forEach(t=>{t.layer.resize(fe(t.scale)),t.shaded.resize(fe(t.scale)),t.softReady&&(t.temp.resize(fe(t.scale)),t.blurred.resize(fe(t.scale)))}),re.forEach((t,c)=>{t.main.resize(Vt(c)),t.spare.resize(Vt(c))}),io.forEach(t=>t.forEach((c,p)=>c.shadow.set({depthMap:ge[p].layer.depth}))),e.quiet=0)},$o=new ResizeObserver(Yo);$o.observe(oe),ut.push(()=>$o.disconnect());const r={eye:[0,0,K],forward:[0,0,-1],right:[1,0,0],up:[0,1,0],focal:1},Ko=o=>{const t=Math.cos(e.yaw),c=Math.sin(e.yaw),p=Math.cos(e.pitch),h=Math.sin(e.pitch);r.eye[0]=c*p*K,r.eye[1]=h*K,r.eye[2]=t*p*K,r.forward[0]=-c*p,r.forward[1]=-h,r.forward[2]=-t*p;const b=Math.hypot(r.forward[2],r.forward[0])||1;r.right[0]=-r.forward[2]/b,r.right[1]=0,r.right[2]=r.forward[0]/b,r.up[0]=r.right[1]*r.forward[2]-r.right[2]*r.forward[1],r.up[1]=r.right[2]*r.forward[0]-r.right[0]*r.forward[2],r.up[2]=r.right[0]*r.forward[1]-r.right[1]*r.forward[0],r.focal=g.size[1]*.5*K*o.scale},R=[0,0,1],Xo=(o,t)=>{const c=(o-.5)*g.size[0],p=(.5-t)*g.size[1];R[0]=r.forward[0]*r.focal+r.right[0]*c+r.up[0]*p,R[1]=r.forward[1]*r.focal+r.right[1]*c+r.up[1]*p,R[2]=r.forward[2]*r.focal+r.right[2]*c+r.up[2]*p;const h=Math.hypot(R[0],R[1],R[2])||1;return R[0]/=h,R[1]/=h,R[2]/=h,R},Fr=(o,t,c)=>{const p=g.size[0]/Math.max(g.size[1],1),h=Ir(p),b=o.intro&&!c,A=e.introAt<0?0:e.clock-e.introAt,E=o.mouseInteraction&&!c?e.presence*o.mouseStrength:0;let _=0,O=0,v=0;E>.001&&(Xo(e.pointer[0],e.pointer[1]),_=R[0],O=R[1],v=R[2]);const B=Math.max(1,Math.ceil(t/(1/120))),S=t/Math.max(B,1),l=g.size[1]*.5,n=e.rings.map(w=>{const a=w.age/vr;return{x:w.x,y:w.y,age:w.age,strength:(1-Math.exp(-w.age/.06))*(1-a)*(1-a)}}),i=(w,a,I,k)=>{const M=w-r.eye[0],ee=a-r.eye[1],ne=I-r.eye[2],ye=Math.max(M*r.forward[0]+ee*r.forward[1]+ne*r.forward[2],.05);return k[0]=(M*r.right[0]+ee*r.right[1]+ne*r.right[2])*r.focal/ye/l,k[1]=(M*r.up[0]+ee*r.up[1]+ne*r.up[2])*r.focal/ye/l,ye},f=(w,a,I)=>{let k=0;for(const M of n){const ee=Math.max(0,M.age-I*.07)*2.3,ne=Math.hypot(w-M.x,a-M.y);k+=Math.exp(-((ne-ee)*(ne-ee))/.012)*M.strength}return k},m=[0,0],P=e.shards,L=Math.min(1,o.twist);for(let w=0;w<P.length;w+=1){const a=P[w],I=a.level,k=qt[I];let M=(a.phase+e.travel[I])%1,ee=1,ne=0;if(b){const x=I*.22+Math.max(0,M-.1)*(Lo-1-(Z-1)*.22)+a.arrive*.15,T=N((A-x)/.9,0,1);ee=et(T);const C=(1-T)*(1-T);M=h?M-C*.06:Math.max(0,M-C*.06),ne=C*.9*a.sign}a.s=M;const ye=(M%1+1)%1*(j-1),De=Math.floor(ye),H=Math.min(De+1,j-1),Ve=ye-De,U=(x,T)=>x[De*3+T]+(x[H*3+T]-x[De*3+T])*Ve,pe=U(k.position,0),$t=U(k.position,1),Kt=U(k.position,2),He=U(k.tangent,0),he=U(k.tangent,1),wt=U(k.tangent,2),Ne=U(k.across,0),qe=U(k.across,1),Be=U(k.across,2),at=U(k.lift,0),je=U(k.lift,1),se=U(k.lift,2),ie=o.twist*(M*F*.6+e.twist+I*1.7),Ye=Math.cos(ie),de=Math.sin(ie),Mt=Ne*Ye+at*de,zt=qe*Ye+je*de,fo=Be*Ye+se*de,St=at*Ye-Ne*de,Xt=je*Ye-qe*de,po=se*Ye-Be*de,me=q[I]/K,kt=o.spread*(.15+.035*q[I])*(.8+.3*Math.sin(M*F*1.3+I*.8)),$e=a.lane*kt,Fe=a.layer*.012*me,Ut=h?1:et(M/.12)*et((1-M)/.12),nt=o.billow*.16*me*Math.sin(M*F*1.3-e.drift*.5+I*1.1)*(.4+.6*Ut),be=o.billow*.06*me*Math.sin(M*F*.8-e.drift*.35+I*2.4),At=.009*me,st=e.drift,Lt=pe+at*nt+Ne*be+Mt*$e+St*Fe+Math.sin(st*a.rate[0]+a.drift[0])*At,Rt=$t+je*nt+qe*be+zt*$e+Xt*Fe+Math.sin(st*a.rate[1]+a.drift[1])*At,ce=Kt+se*nt+Be*be+fo*$e+po*Fe+Math.sin(st*a.rate[2]+a.drift[2])*At;let te=0,we=0,Ke=0,Xe=0;const it=Lt+a.offset[0],ho=Rt+a.offset[1],mo=ce+a.offset[2];if(E>.001){const x=it-r.eye[0],T=ho-r.eye[1],C=mo-r.eye[2],G=x*_+T*O+C*v,ke=x-_*G,Ae=T-O*G,ue=C-v*G,Oe=Math.hypot(ke,Ae,ue),Jt=.24*me/o.scale,_t=Math.exp(-(Oe*Oe)/(Jt*Jt));if(_t>.002&&Oe>1e-5){const Ze=ke/Oe,bo=Ae/Oe,wo=ue/Oe,Mo=(Ze*He+bo*he+wo*wt)*.7,zo=E*_t*9*me;te+=(Ze-He*Mo)*zo,we+=(bo-he*Mo)*zo,Ke+=(wo-wt*Mo)*zo,Xe+=E*_t*1.1*(Ze*Ne+bo*qe+wo*Be)}}if(e.hold>.001&&a.joined){const x=a.slot,T=x[0]+e.clock*(.8/(.12+x[1]))*x[3],C=x[1]/o.scale,G=e.gatherCenter[0]+Math.cos(T)*C,ke=e.gatherCenter[1]+Math.sin(T)*C*.75,Ae=e.gatherCenter[2]+Math.sin(T)*C*.45+x[2]*.3;a.gather+=(e.hold-a.gather)*(1-Math.exp(-t/.3));const ue=a.gather*30;te+=(G-it)*ue,we+=(ke-ho)*ue,Ke+=(Ae-mo)*ue,Xe+=a.gather*.6*Math.sin(T)}else a.gather+=(0-a.gather)*(1-Math.exp(-t/.2));if(n.length){i(it,ho,mo,m);for(const x of n){const T=Math.max(0,x.age-I*.07)*2.3,C=m[0]-x.x,G=m[1]-x.y,ke=Math.hypot(C,G),Ae=Math.exp(-((ke-T)*(ke-T))/.012)*x.strength;if(Ae>.01){a.flash=Math.max(a.flash,Ae*.75);const ue=Math.max(ke,.05),Oe=(r.right[0]*C+r.up[0]*G)/ue,Jt=(r.right[1]*C+r.up[1]*G)/ue,_t=(r.right[2]*C+r.up[2]*G)/ue;Xe+=Ae*1.4*(Oe*Ne+Jt*qe+_t*Be);const Ze=Ae*2.2*me/Math.max(ke,.05);te+=(r.right[0]*C+r.up[0]*G)*Ze,we+=(r.right[1]*C+r.up[1]*G)*Ze,Ke+=(r.right[2]*C+r.up[2]*G)*Ze}}}const uo=24*(1-a.gather*.95);for(let x=0;x<B;x+=1)a.velocity[0]+=(te-uo*a.offset[0]-7.5*a.velocity[0])*S,a.velocity[1]+=(we-uo*a.offset[1]-7.5*a.velocity[1])*S,a.velocity[2]+=(Ke-uo*a.offset[2]-7.5*a.velocity[2])*S,a.offset[0]+=a.velocity[0]*S,a.offset[1]+=a.velocity[1]*S,a.offset[2]+=a.velocity[2]*S,a.tiltVelocity+=(90*(Xe-a.tilt)-15*a.tiltVelocity)*S,a.tilt+=a.tiltVelocity*S;a.flash*=Math.exp(-t/.45);const Wt=Lt+a.offset[0],Gt=Rt+a.offset[1],Zt=ce+a.offset[2];a.position[0]=Wt,a.position[1]=Gt,a.position[2]=Zt;let Ue=r.eye[0]-Wt,We=r.eye[1]-Gt,Ge=r.eye[2]-Zt;const vo=Math.hypot(Ue,We,Ge)||1;Ue/=vo,We/=vo,Ge/=vo;let Me=He+a.velocity[0]*.05,ze=he+a.velocity[1]*.05,Se=wt+a.velocity[2]*.05;const go=Me*Ue+ze*We+Se*Ge;Me-=Ue*go,ze-=We*go,Se-=Ge*go;let Et=Math.hypot(Me,ze,Se);Et<1e-4&&(Me=r.right[0],ze=r.right[1],Se=r.right[2],Et=1),Me/=Et,ze/=Et,Se/=Et;const er=We*Se-Ge*ze,tr=Ge*Me-Ue*Se,or=Ue*ze-We*Me,rr=a.yaw+.05*Math.sin(e.clock*a.flutter[1]*.7+a.flutter[0]),ct=Math.cos(rr),lt=Math.sin(rr),ar=Me*ct+er*lt,nr=ze*ct+tr*lt,sr=Se*ct+or*lt,Pr=er*ct-Me*lt,Tr=tr*ct-ze*lt,Cr=or*ct-Se*lt,Dr=.8*L*Math.sin(ie)+.3*Math.sin(M*F*1.6-e.roll*.55+I*.9+a.lane*.7),Vr=.06*Math.sin(e.clock*a.flutter[1]+a.flutter[0]),ir=mr*Math.tanh((Dr+a.bank+Vr+a.tilt+ne)/mr),xo=Math.cos(ir),yo=Math.sin(ir),cr=Ue*xo+Pr*yo,lr=We*xo+Tr*yo,fr=Ge*xo+Cr*yo,pr=a.pitch+.2*Math.sin(M*F*1.1-e.roll*.4+I*2.1),ft=Math.cos(pr),pt=Math.sin(pr),Hr=ar*ft+cr*pt,Nr=nr*ft+lr*pt,qr=sr*ft+fr*pt,Br=cr*ft-ar*pt,jr=lr*ft-nr*pt,Yr=fr*ft-sr*pt,$r=Wt-r.eye[0],Kr=Gt-r.eye[1],Xr=Zt-r.eye[2],Ur=$r*r.forward[0]+Kr*r.forward[1]+Xr*r.forward[2];yt[w]=Ur;const Wr=1-.45*a.lane*a.lane,hr=.062*o.shardSize*a.size*sa[I]*ee*Math.sqrt(Ut)*Wr,$=w*Qe;V[$]=Wt,V[$+1]=Gt,V[$+2]=Zt,V[$+3]=hr>1e-5?hr:0,V[$+4]=Hr,V[$+5]=Nr,V[$+6]=qr,V[$+7]=a.thickness,V[$+8]=Br,V[$+9]=jr,V[$+10]=Yr,V[$+11]=a.tint;for(let x=0;x<10;x+=1)V[$+12+x]=a.shape[x];V[$+22]=a.sides,V[$+23]=a.flash}let Ie=0;for(let w=0;w<Z;w+=1)Bt[w]=0,lo[w]=0;if(o.markers>=0){const w=g.size[1]/Math.max(oe.clientHeight,1),a=(e.pointer[0]-.5)*2*p,I=(.5-e.pointer[1])*2,k=o.mouseInteraction&&!c?e.presence:0,M=e.targets,ee=new Map,ne=1-Math.exp(-t/.12);let ye="",De=72;for(let H=Z-1;H>=0;H-=1){lo[H]=Ie;const Ve=q[H],U=Ve/K,pe=.42*Math.pow(U,.55),$t=p*Ve/(K*o.scale)*1.12+pe,Kt=Ve/(K*o.scale)*1.12+pe,He=e.markerDrift,he=ca[H],wt=Math.floor((He-$t)/pe-he[0]),Ne=Math.ceil((He+$t)/pe-he[0]),qe=Math.floor(-Kt/pe-he[1]),Be=Math.ceil(Kt/pe-he[1]),at=o.spread*(.15+.035*Ve)*1.4,je=qt[H].position;for(let se=wt;se<=Ne;se+=1)for(let ie=qe;ie<=Be;ie+=1){if(_o(H,se,ie,11)>.5)continue;const de=(se+he[0])*pe-He,Mt=(ie+he[1])*pe,zt=K-Ve,fo=i(de,Mt,zt,m);if(Math.abs(m[0])>p*1.05||Math.abs(m[1])>1.05)continue;let St=1/0;for(let te=0;te<j;te+=2){const we=de-je[te*3],Ke=Mt-je[te*3+1],Xe=zt-je[te*3+2],it=we*we+Ke*Ke+Xe*Xe;it<St&&(St=it)}const Xt=Math.exp(-St/(at*at)),po=_o(H,se,ie,23),me=_o(H,se,ie,37),kt=po<.07?.5+.5*Math.sin(e.clock*(1.4+me*2.2)+me*40):0,$e=Math.hypot(m[0]-a,m[1]-I)*l/w,Fe=`${H}:${se}:${ie}`;H<=2&&k>.01&&$e<De&&(De=$e,ye=Fe);const Ut=Fe===e.markerTarget?k*(1-et(($e-30)/42)):0,nt=M.get(Fe)??0,be=nt+(Ut-nt)*ne;be>.002&&ee.set(Fe,be);const At=Math.max(et((kt-.55)/.4),be);let st=0;n.length&&(st=f(m[0],m[1],H));let Lt=1;if(b){const te=N((m[0]/p+1)*.5,0,1),we=H*.22+.35+te*(Lo-1.3-(Z-1)*.22);Lt=et((A-we)/.5)}const Rt=ur[H]*(1-et((fo-3)/10)*.45)*Lt;if(Rt<.002)continue;Ie>=gt&&Co(gt*2);const ce=Ie*Ro;ae[ce]=de,ae[ce+1]=Mt,ae[ce+2]=zt,ae[ce+3]=Rt,ae[ce+4]=.42+.5*Xt+kt*.9+be*1.3+st*2.5,ae[ce+5]=At,ae[ce+6]=1+.15*Xt+.3*kt+.2*be,ae[ce+7]=0,Ie+=1,Bt[H]+=1}}e.targets=ee,e.markerTarget=ye}e.markerTotal=Ie},Or=(o,t,c)=>{Ko(o);const p=e.shards;No(p.length),Fr(o,t,c),e.order.length!==p.length&&(e.order=p.map((l,n)=>n));const h=e.order;for(let l=0;l<p.length;l+=1)yt[l]+=p[l].level*100;for(let l=1;l<h.length;l+=1){const n=h[l],i=yt[n];let f=l-1;for(;f>=0&&yt[h[f]]<i;)h[f+1]=h[f],f-=1;h[f+1]=n}const b=[0,0,0,0,0];for(let l=0;l<h.length;l+=1){const n=h[l]*Qe,i=l*Qe;b[p[h[l]].level]+=1;for(let f=0;f<Qe;f+=1)Nt[i+f]=V[n+f]}Ce==null||Ce.write(Nt.subarray(0,p.length*Qe)),e.markerTotal>0&&(rt==null||rt.write(ae.subarray(0,e.markerTotal*Ro)));const A=[0,0,0,0,0];let E=0;for(let l=Z-1;l>=0;l-=1)A[l]=E,E+=b[l];Ht.set({view:[g.size[0],g.size[1],r.focal,e.clock],eye:[r.eye[0],r.eye[1],r.eye[2],eo],forward:[r.forward[0],r.forward[1],r.forward[2],o.depthOfField*g.size[1]*.03],right:[r.right[0],r.right[1],r.right[2],g.size[1]*.05],up:[r.up[0],r.up[1],r.up[2],o.lightMode?1:0],shard:[...o.shard,0],accent:[...o.accent,0],surface:o.material,marker:[o.markers,g.size[1]/Math.max(oe.clientHeight,1),4*(g.size[1]/Math.max(oe.clientHeight,1)),eo]}),co.forEach(({downParams:l,horizontalParams:n,verticalParams:i,source:f,level:m})=>{l.set({texel:[.5/f.size[0],.5/f.size[1],.75,.5]}),n.set({texel:[1/m.main.size[0],0,0,0]}),i.set({texel:[0,1/m.main.size[1],0,0]})});const _=o.paper??[0,0,0],O=o.glow>.001&&!o.lightMode;qo.set({info:[o.grain,Math.floor(e.clock*24),O?o.glow:0,1.3],paper:[_[0],_[1],_[2],o.paper?1:0],mode:[o.lightMode?1:0,o.vignette,0,0]});const v=o.depthOfField*g.size[1]*.012,B=g.size[1]*.02,S=q.map((l,n)=>{const i=Math.min(v*Math.abs(1-ra/l),B),f=i>=2.2?1:0,m=ge[f],P=i>=.45;P&&!m.softReady&&(m.softReady=!0,m.temp.resize(fe(m.scale)),m.blurred.resize(fe(m.scale)));const L=m.layer.size;ro[n].set({view:[L[0],L[1],r.focal*(L[0]/g.size[0]),n],look:[o.lightMode?.5:.7,0,0,0]});const Ie=i*m.scale;Do[n].set({texel:[1/L[0],0,Ie,0]}),Vo[n].set({texel:[0,1/L[1],Ie,0]}),ao[n].set({info:[ur[n],0,0,0]});const w=Math.max(.6,1.4*(L[0]/Math.max(oe.clientWidth,1))),a=o.material===Ao.glass?0:o.lightMode?.32:.62;return Ho[n].set({info:[w*.55,w*.85,a,0],more:[45e-5,0,0,0]}),{group:m,groupIndex:f,soft:P}});ea(d,l=>{for(let n=Z-1;n>=0;n-=1){const{group:i,groupIndex:f,soft:m}=S[n],P=io[n][f];b[n]>0&&(l.pass({target:i.layer,clear:[0,0,0,0],clearDepth:1},L=>{L.draw(no[n],{instances:b[n],firstInstance:A[n]}),L.draw(so[n],{instances:b[n],firstInstance:A[n]})}),l.pass({target:i.shaded,clear:[0,0,0,0]},L=>L.draw(P.shadow)),m&&(l.pass({target:i.temp,clear:[0,0,0,0]},L=>L.draw(P.blurX)),l.pass({target:i.blurred,clear:[0,0,0,0]},L=>L.draw(P.blurY)))),l.pass({target:Te,clear:n===Z-1?[0,0,0,0]:!1},L=>{Bt[n]>0&&L.draw(oo,{instances:Bt[n],firstInstance:lo[n]}),b[n]>0&&L.draw(m?P.soft:P.sharp)})}co.forEach((n,i)=>{const f=re[i];if(!O){l.pass({target:f.main,clear:[0,0,0,0]},()=>{});return}l.pass({target:f.main,clear:[0,0,0,0]},m=>m.draw(n.down)),l.pass({target:f.spare,clear:[0,0,0,0]},m=>m.draw(n.horizontal)),l.pass({target:f.main,clear:[0,0,0,0]},m=>m.draw(n.vertical))}),l.pass({target:g,clear:[0,0,0,0]},n=>n.draw(Bo))})},Uo=o=>{if(Dt=requestAnimationFrame(Uo),!e.visible||document.hidden){e.last=o;return}const t=Re.current,c=e.last?Math.min((o-e.last)/1e3,.05):0;e.last=o;const p=wr();e.clock+=c,e.introAt<0&&(e.introAt=e.clock),e.shards.length!==t.count&&(e.shards=Mr(t.count,1337),e.order=[]);const h=!t.paused&&!p;if(h){for(let i=0;i<Z;i+=1)e.travel[i]=(e.travel[i]+c*t.speed*.09/qt[i].length)%1;e.roll+=c*t.speed*1,e.twist+=c*t.speed*.08,e.drift+=c*t.speed}const b=ko.map((i,f)=>f===t.placement?1:0);let A=!1;const E=Math.exp(-4*c);for(let i=0;i<4;i+=1){const f=e.weights[i]-b[i],m=e.weightVelocity[i]+4*f;e.weights[i]=b[i]+(f+m*c)*E,e.weightVelocity[i]=(e.weightVelocity[i]-4*m*c)*E,Math.abs(e.weights[i]-b[i])>5e-4&&(A=!0)}A||(e.weights=b,e.weightVelocity=[0,0,0,0]);const _=t.mouseInteraction&&e.inside&&!p;e.presence+=((_?1:0)-e.presence)*(1-Math.exp(-c/.25));const O=_?t.parallax:0,v=(e.pointer[0]-.5)*O*.14,B=(e.pointer[1]-.5)*O*.08;e.yawVelocity+=(38*(v-e.yaw)-11*e.yawVelocity)*c,e.pitchVelocity+=(38*(B-e.pitch)-11*e.pitchVelocity)*c,e.yaw+=e.yawVelocity*c,e.pitch+=e.pitchVelocity*c;const S=Math.abs(v-e.yaw)+Math.abs(B-e.pitch)>1e-4||Math.abs(e.yawVelocity)+Math.abs(e.pitchVelocity)>1e-4;if(e.pressAt>=0&&e.pressPoint&&t.holdToGather&&!p&&e.clock-e.pressAt>.18){if(!e.holding){e.holding=!0,Ko(t),Xo(e.pressPoint[0],e.pressPoint[1]);const f=eo/Math.max(R[0]*r.forward[0]+R[1]*r.forward[1]+R[2]*r.forward[2],.2);e.gatherCenter=[r.eye[0]+R[0]*f,r.eye[1]+R[1]*f,r.eye[2]+R[2]*f],e.reach=0}e.hold=Math.min(1,e.hold+c/.5),e.reach=Math.min(e.reach+c*.5,.55);const i=(.22+e.reach)/t.scale;for(const f of e.shards){if(f.joined||f.level>2)continue;const m=f.position[0]-e.gatherCenter[0],P=f.position[1]-e.gatherCenter[1];m*m+P*P<i*i&&(f.joined=!0)}}else if(e.hold>0&&(e.hold=Math.max(0,e.hold-c/.3),e.hold===0))for(const i of e.shards)i.joined=!1;for(const i of e.rings)i.age+=c;e.rings=e.rings.filter(i=>i.age<vr),h&&(e.markerDrift+=c*t.speed*.045);const l=e.shards.some(i=>i.flash>.01||Math.abs(i.tiltVelocity)>.01||Math.abs(i.tilt)>.01),n=A||S||l||e.presence>.002||e.rings.length>0||e.hold>0||t.intro&&!p&&e.clock-e.introAt<Lo+.5;e.seen!==t||n||h?e.quiet=0:e.quiet+=1,e.seen=t,!(e.quiet>30)&&(Yo(),Or(t,c,p))},Wo=o=>{const t=oe.getBoundingClientRect();return{point:[(o.clientX-t.left)/Math.max(t.width,1),(o.clientY-t.top)/Math.max(t.height,1)],inside:o.clientX>=t.left&&o.clientX<=t.right&&o.clientY>=t.top&&o.clientY<=t.bottom}},Go=o=>{const t=Wo(o);e.inside=t.inside,t.inside&&(e.pointer=t.point)},Zo=()=>{e.inside=!1},Jo=o=>{const t=Re.current;if(o.button!==0||wr()||!t.mouseInteraction||o.target instanceof Element&&o.target.closest('a, button, input, textarea, select, label, [role="button"]'))return;const c=Wo(o);c.inside&&(e.pointer=c.point,e.pressAt=e.clock,e.pressPoint=c.point)},Yt=()=>{const o=Re.current;if(!(e.pressAt<0)){if(!e.holding&&o.pulseOnClick&&e.pressPoint){const t=g.size[0]/Math.max(g.size[1],1);e.rings.push({x:(e.pressPoint[0]*2-1)*t,y:1-e.pressPoint[1]*2,age:0}),e.rings.length>la&&e.rings.shift()}if(e.holding)for(const t of e.shards)t.joined&&(t.tiltVelocity+=9*t.sign);e.pressAt=-1,e.holding=!1}};window.addEventListener("pointermove",Go,{passive:!0}),window.addEventListener("pointerdown",Jo),window.addEventListener("pointerup",Yt),window.addEventListener("pointercancel",Yt),document.documentElement.addEventListener("pointerleave",Zo),ut.push(()=>{window.removeEventListener("pointermove",Go),window.removeEventListener("pointerdown",Jo),window.removeEventListener("pointerup",Yt),window.removeEventListener("pointercancel",Yt),document.documentElement.removeEventListener("pointerleave",Zo)});const Qo=new IntersectionObserver(o=>{e.visible=o.some(t=>t.isIntersecting)});Qo.observe(oe),ut.push(()=>Qo.disconnect()),Dt=requestAnimationFrame(Uo)})().catch(Po),()=>{mt=!0,cancelAnimationFrame(Dt),ut.forEach(d=>d()),Ee==null||Ee.dispose(),Ct.remove()}},[]),Gr.jsx("div",{ref:Fo,className:[ta,Er].filter(Boolean).join(" "),style:_r})}export{Sa as default};
