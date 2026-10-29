const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/morph-DJYg0K78.js","assets/svg-Bx2QwCHk.js"])))=>i.map(i=>d[i]);
import{a as w,j as n,_ as sa,r as Os}from"./index-DrbxZl7q.js";import{d as $e}from"./umso-D7eMVaq5.js";import{I as xe,c as H,a as Ge,u as Xs,T as at,b as Q,P as lt,d as et,e as _t}from"./studio-BPa5ocsp.js";import{G as Ja,g as Hs}from"./Gallery-8ACswSAs.js";import{p as Jo,a as Ye,P as Vs}from"./PreviewColorList-DuXPVOMb.js";import{B as Ys}from"./index-BYiulxf-.js";import{P as ba,l as Qo,w as Ws}from"./PropControls-NV4Fn-by.js";import{c as Ks,P as Zs,l as Js}from"./presetColors-CKqfAuk6.js";import{a as Qs}from"./CodeExample-CsLzz70A.js";import{d as en,c as Qa}from"./compose-AyYbj9lG.js";/* empty css            */const xt=[{id:"circle",name:"Circle",params:[{key:"stretch",label:"Stretch",min:.3,max:1,step:.01,default:1}],glsl:`float sd_circle(vec2 p, vec4 a, vec4 b) {
  float s = a.x;
  if (s > 0.999) return length(p) - 1.0;
  vec2 ab = vec2(1.0, s);
  vec2 q = abs(p);
  float best = 1e9;
  for (int k = 0; k < 2; k++) {
    float w = k == 0 ? atan(q.y, q.x * s) : 1.570796327;
    for (int i = 0; i < 6; i++) {
      vec2 cs = vec2(cos(w), sin(w));
      vec2 u = ab * cs;
      vec2 v = ab * vec2(-cs.y, cs.x);
      w = clamp(w + dot(q - u, v) / max(dot(q - u, u) + dot(v, v), 0.05), 0.0, 1.570796327);
    }
    best = min(best, length(q - ab * vec2(cos(w), sin(w))));
  }
  return dot(q / ab, q / ab) > 1.0 ? best : -best;
}`},{id:"box",name:"Box",params:[{key:"width",label:"Largura",min:.04,max:1,step:.01,default:1},{key:"height",label:"Altura",min:.04,max:1,step:.01,default:1},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.3}],glsl:`float sd_box(vec2 p, vec4 a, vec4 b) {
  vec2 h = vec2(a.x, a.y);
  float r = a.z * min(h.x, h.y);
  vec2 q = abs(p) - h + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}`},{id:"polygon",name:"Polygon",params:[{key:"sides",label:"Sides",min:3,max:12,step:1,default:6},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.15}],glsl:`float sd_polygon(vec2 p, vec4 a, vec4 b) {
  float n = floor(a.x + 0.5);
  float rr = a.y * 0.45;
  float r = 1.0 - rr;
  float an = PI / n;
  vec2 acs = vec2(cos(an), sin(an));
  float bn = mod(atan(p.x, -p.y), 2.0 * an) - an;
  p = length(p) * vec2(cos(bn), abs(sin(bn)));
  p -= r * acs;
  p.y += clamp(-p.y, 0.0, r * acs.y);
  return length(p) * sign(p.x) - rr;
}`},{id:"star",name:"Star",params:[{key:"points",label:"Points",min:3,max:16,step:1,default:5},{key:"inner",label:"Inner radius",min:.15,max:.95,step:.01,default:.48},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.1}],glsl:`float sd_star(vec2 p, vec4 a, vec4 b) {
  float n = floor(a.x + 0.5);
  float rr = a.z * 0.25;
  float r = 1.0 - rr;
  float an = PI / n;
  float en = atan(sin(an), cos(an) - min(pow(clamp(a.y, 0.0, 1.0), 1.42), cos(an)));
  vec2 acs = vec2(cos(an), sin(an));
  vec2 ecs = vec2(cos(en), sin(en));
  float bn = mod(atan(p.x, -p.y), 2.0 * an) - an;
  p = length(p) * vec2(cos(bn), abs(sin(bn)));
  p -= r * acs;
  p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);
  return length(p) * sign(p.x) - rr;
}`},{id:"ring",name:"Ring",params:[{key:"thickness",label:"Thickness",min:.05,max:.95,step:.01,default:.36}],glsl:`float sd_ring(vec2 p, vec4 a, vec4 b) {
  float t = a.x;
  return abs(length(p) - (1.0 - t * 0.5)) - t * 0.5;
}`},{id:"blob",name:"Blob",params:[{key:"lobes",label:"Lobes",min:2,max:9,step:1,default:3},{key:"wobble",label:"Wobble",min:0,max:.6,step:.01,default:.22},{key:"variation",label:"Variação",min:0,max:100,step:1,default:0}],glsl:`vec3 blob_radius(float t, float n, float w, vec3 ph) {
  vec3 f = vec3(n, n + 1.0, 2.0 * n - 1.0);
  vec3 s = sin(f * t + ph);
  vec3 k = vec3(0.55, 0.3, 0.15) * w * 0.5;
  return vec3(1.0 - w * 0.55 + dot(k, s), dot(k * f, cos(f * t + ph)), -dot(k * f * f, s));
}

float sd_blob(vec2 p, vec4 a, vec4 b) {
  float n = floor(a.x + 0.5);
  float w = a.y;
  float s = a.z;
  vec3 ph = vec3(fract(sin(s * 12.9898 + 1.3) * 43758.5453), fract(sin(s * 78.233 + 4.1) * 43758.5453), fract(sin(s * 37.719 + 2.7) * 43758.5453)) * TAU;
  float t0 = atan(p.y, p.x);
  float lp = length(p);
  float r0 = blob_radius(t0, n, w, ph).x;
  float dr = abs(lp - r0);
  float win = lp > dr ? asin(dr / lp) : PI;
  int count = 21 + 3 * int(n);
  float mid = 0.5 * float(count - 1);
  float step = win / mid;
  vec2 best = vec2(dr * dr, t0);
  vec2 next = vec2(1e9, t0);
  for (int i = 0; i < count; i++) {
    float t = t0 + step * (float(i) - mid);
    vec2 e = p - blob_radius(t, n, w, ph).x * vec2(cos(t), sin(t));
    float dd = dot(e, e);
    bool far = abs(t - best.y) > 2.5 * step;
    if (dd < best.x) {
      if (far) next = best;
      best = vec2(dd, t);
    } else if (dd < next.x && far) {
      next = vec2(dd, t);
    }
  }
  float d2 = best.x;
  for (int k = 0; k < 2; k++) {
    if (k == 1 && next.x > 1e8) break;
    float t = k == 0 ? best.y : next.y;
    for (int j = 0; j < 5; j++) {
      vec3 r = blob_radius(t, n, w, ph);
      vec2 u = vec2(cos(t), sin(t));
      vec2 v = vec2(-u.y, u.x);
      vec2 dq = p - r.x * u;
      d2 = min(d2, dot(dq, dq));
      vec2 c1 = r.y * u + r.x * v;
      vec2 c2 = (r.z - r.x) * u + 2.0 * r.y * v;
      float g2 = max(dot(c1, c1) - dot(dq, c2), 0.25 * dot(c1, c1));
      t += clamp(dot(dq, c1) / g2, -step, step);
    }
  }
  float d = sqrt(d2);
  return lp > r0 ? d : -d;
}`},{id:"triangle",name:"Triangle",params:[{key:"width",label:"Largura",min:.2,max:1,step:.01,default:.58},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.12}],glsl:`float triangle_iso(vec2 p, vec2 q) {
  p.x = abs(p.x);
  vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
  vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);
  float s = -sign(q.y);
  vec2 d = min(vec2(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2(dot(b, b), s * (p.y - q.y)));
  return -sqrt(d.x) * sign(d.y);
}

float sd_triangle(vec2 p, vec4 a, vec4 b) {
  float k = clamp(a.x, 0.2, 1.0);
  float h = k <= 0.5 ? 2.0 : 1.0 / k;
  float w = h * k;
  float rin = w * h / (w + sqrt(w * w + h * h));
  float rr = clamp(a.y, 0.0, 1.0) * rin * 0.8;
  float s = (rin - rr) / rin;
  float cy = 0.5 * h - rin;
  vec2 apex = vec2(0.0, cy - s * (cy + 0.5 * h));
  return triangle_iso(p - apex, vec2(w, h) * s) - rr;
}`},{id:"diamond",name:"Diamond",params:[{key:"width",label:"Largura",min:.2,max:1,step:.01,default:.72},{key:"height",label:"Altura",min:.2,max:1,step:.01,default:1},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.1}],glsl:`float sd_diamond(vec2 p, vec4 a, vec4 b) {
  vec2 r = vec2(a.x, a.y);
  float rr = clamp(a.z, 0.0, 1.0) * 0.6 * r.x * r.y / length(r);
  vec2 c = r - rr;
  vec2 q = abs(p);
  float h = clamp(((c.x - 2.0 * q.x) * c.x - (c.y - 2.0 * q.y) * c.y) / dot(c, c), -1.0, 1.0);
  float d = length(q - 0.5 * c * vec2(1.0 - h, 1.0 + h));
  return d * sign(q.x * c.y + q.y * c.x - c.x * c.y) - rr;
}`},{id:"heart",name:"Heart",params:[{key:"width",label:"Largura",min:0,max:1,step:.01,default:.5},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.15}],glsl:`float sd_heart(vec2 p, vec4 a, vec4 b) {
  float th = mix(0.6, 0.9708, clamp(a.x, 0.0, 1.0));
  float sn = sin(th);
  float cs = cos(th);
  float wd = 0.5 * (sn + sn / cs);
  float ht = (1.0 + cs * cs + sn) / (2.0 * cs);
  float rr = clamp(a.y, 0.0, 1.0) * 0.3;
  float l = min((1.0 - rr) / wd, (2.0 - 2.0 * rr) / ht);
  vec2 q = vec2(abs(p.x), 0.5 * ht * l - p.y);
  vec2 u = vec2(sn, cs);
  vec2 t = l * u;
  float r = 0.5 * l * sn / cs;
  if (dot(q - t, u) > 0.0) return length(q - t - r * vec2(-cs, sn)) - r - rr;
  float ds = length(q - u * clamp(dot(q, u), 0.0, l));
  float dn = length(q - vec2(0.0, l / cs));
  return min(ds, dn) * sign(q.x * cs - q.y * sn) - rr;
}`},{id:"egg",name:"Egg",params:[{key:"taper",label:"Taper",min:0,max:1,step:.01,default:.5}],glsl:`float sd_egg(vec2 p, vec4 a, vec4 b) {
  float f = 1.0 - 0.85 * clamp(a.x, 0.0, 1.0);
  float ra = min(1.0, 2.0 / (1.0 + 1.7320508 * (1.0 - f) + f));
  float rb = ra * f;
  float r = ra - rb;
  float top = 1.7320508 * r + rb;
  vec2 q = vec2(abs(p.x), 0.5 * (top - ra) - p.y);
  float d;
  if (q.y < 0.0) d = length(q) - r;
  else if (1.7320508 * (q.x + r) < q.y) d = length(q - vec2(0.0, 1.7320508 * r));
  else d = length(q + vec2(r, 0.0)) - 2.0 * r;
  return d - rb;
}`},{id:"drop",name:"Drop",params:[{key:"length",label:"Duração",min:0,max:1,step:.01,default:.35},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.1}],glsl:`float sd_drop(vec2 p, vec4 a, vec4 b) {
  float len = mix(1.1, 2.4, clamp(a.x, 0.0, 1.0));
  float tip = clamp(a.y, 0.0, 1.0) * 0.45;
  float r1 = min(1.0, 2.0 / (1.0 + len + tip));
  float r2 = r1 * tip;
  float h = r1 * len;
  vec2 q = vec2(abs(p.x), 0.5 * (h + r2 - r1) - p.y);
  float sb = (r1 - r2) / h;
  float ca = sqrt(1.0 - sb * sb);
  float k = dot(q, vec2(-sb, ca));
  if (k < 0.0) return length(q) - r1;
  if (k > ca * h) return length(q - vec2(0.0, h)) - r2;
  return dot(q, vec2(ca, sb)) - r1;
}`},{id:"leaf",name:"Leaf",params:[{key:"width",label:"Largura",min:.15,max:1,step:.01,default:.55},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:0}],glsl:`float sd_leaf(vec2 p, vec4 a, vec4 b) {
  float k = clamp(a.x, 0.15, 1.0);
  float rr = clamp(a.y, 0.0, 1.0) * k * 0.6;
  float hb = 1.0 - rr;
  float kw = k - rr;
  float r = 0.5 * (kw + hb * hb / kw);
  float off = 0.5 * (hb * hb / kw - kw);
  vec2 q = abs(p);
  float d = (q.y - hb) * off > q.x * hb ? length(q - vec2(0.0, hb)) : length(q + vec2(off, 0.0)) - r;
  return d - rr;
}`},{id:"moon",name:"Moon",params:[{key:"phase",label:"Phase",min:0,max:1,step:.01,default:.45},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.2}],glsl:`float sd_moon(vec2 p, vec4 a, vec4 b) {
  float dd = mix(0.25, 1.5, clamp(a.x, 0.0, 1.0));
  float rr = clamp(a.y, 0.0, 1.0) * 0.12;
  float ra = 1.0 - rr;
  float rb = 1.0 + rr;
  vec2 q = vec2(p.x + 0.5 * (0.5 * dd - 1.0), abs(p.y));
  float ca = (ra * ra - rb * rb + dd * dd) / (2.0 * dd);
  float cb = sqrt(max(ra * ra - ca * ca, 0.0));
  if (dd * (q.x * cb - q.y * ca) > dd * dd * max(cb - q.y, 0.0)) return length(q - vec2(ca, cb)) - rr;
  return max(length(q) - ra, rb - length(q - vec2(dd, 0.0))) - rr;
}`},{id:"pie",name:"Pie",params:[{key:"sweep",label:"Sweep",min:10,max:360,step:1,default:280},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.15}],glsl:`float sd_pie(vec2 p, vec4 a, vec4 b) {
  float al = radians(clamp(a.x, 10.0, 360.0)) * 0.5;
  if (al > PI - 0.001) return length(p) - 1.0;
  float rr = clamp(a.y, 0.0, 1.0) * 0.2;
  float r = 1.0 - rr;
  vec2 q = vec2(abs(p.y), -p.x);
  vec2 c = vec2(sin(al), cos(al));
  float l = length(q) - r;
  float m = length(q - c * clamp(dot(q, c), 0.0, r));
  return max(l, m * sign(c.y * q.x - c.x * q.y)) - rr;
}`},{id:"arc",name:"Arc",params:[{key:"sweep",label:"Sweep",min:10,max:360,step:1,default:270},{key:"thickness",label:"Thickness",min:.05,max:.9,step:.01,default:.32},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:1}],glsl:`float sd_arc(vec2 p, vec4 a, vec4 b) {
  float al = radians(clamp(a.x, 10.0, 360.0)) * 0.5;
  float th = clamp(a.y, 0.05, 0.9);
  float r = 1.0 - 0.5 * th;
  vec2 q = vec2(abs(p.x), -p.y);
  if (al > PI - 0.001) return abs(length(q) - r) - 0.5 * th;
  float rr = clamp(a.z, 0.0, 1.0) * 0.5 * th;
  float an = max(al - rr / r, 0.0);
  float tt = th - 2.0 * rr;
  vec2 n = vec2(cos(an), sin(an));
  q = mat2(n.x, n.y, -n.y, n.x) * q;
  float cap = length(vec2(q.x, max(0.0, abs(r - q.y) - 0.5 * tt))) * sign(q.x);
  return max(abs(length(q) - r) - 0.5 * tt, cap) - rr;
}`},{id:"cross",name:"Cross",params:[{key:"thickness",label:"Thickness",min:.1,max:1,step:.01,default:.6},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.3},{key:"inner",label:"Inner roundness",min:0,max:1,step:.01,default:.3}],glsl:`float sd_cross(vec2 p, vec4 a, vec4 b) {
  float w = 0.5 * clamp(a.x, 0.1, 1.0);
  float ro = clamp(a.y, 0.0, 1.0) * w;
  float ri = min(clamp(a.z, 0.0, 1.0) * w, 1.0 - w - ro);
  vec2 q = abs(p);
  if (q.y > q.x) q = q.yx;
  if (q.x < w + ri) return ri - length(q - vec2(w + ri));
  vec2 e = q - vec2(1.0, w) + ro;
  return length(max(e, 0.0)) + min(max(e.x, e.y), 0.0) - ro;
}`},{id:"squircle",name:"Squircle",params:[{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.5}],glsl:`float squircle_x(float y, float n) {
  return pow(max(1.0 - pow(y, n), 0.0), 1.0 / n);
}

float squircle_solve(vec2 q, float n, float y, float yd) {
  for (int i = 0; i < 5; i++) {
    float yy = max(y, 1e-4);
    float x = squircle_x(yy, n);
    float r = yy / x;
    float x1 = -pow(r, n - 1.0);
    float x2 = -(n - 1.0) * pow(r, n - 2.0) / pow(x, n + 1.0);
    float g1 = -(q.x - x) * x1 - (q.y - yy);
    float g2 = x1 * x1 - (q.x - x) * x2 + 1.0;
    y = clamp(yy - g1 / max(g2, 0.25), 0.0, yd);
  }
  return y;
}

float sd_squircle(vec2 p, vec4 a, vec4 b) {
  float k = 1.0 - clamp(a.x, 0.0, 1.0);
  float n = 2.0 + 10.0 * k * k;
  vec2 q = abs(p);
  if (q.y > q.x) q = q.yx;
  float yd = pow(0.5, 1.0 / n);
  float s = pow(pow(q.x, n) + pow(q.y, n), 1.0 / n);
  float y1 = squircle_solve(q, n, clamp(q.y / max(s, 1e-4), 0.0, yd), yd);
  float y2 = squircle_solve(q, n, clamp(q.y, 0.0, yd), yd);
  float d1 = length(q - vec2(squircle_x(y1, n), y1));
  float d2 = length(q - vec2(squircle_x(y2, n), y2));
  return min(d1, d2) * sign(s - 1.0);
}`},{id:"flower",name:"Flower",params:[{key:"petals",label:"Petals",min:3,max:12,step:1,default:5},{key:"depth",label:"Petal depth",min:0,max:1,step:.01,default:.7},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.15}],glsl:`float sd_flower(vec2 p, vec4 a, vec4 b) {
  float n = floor(a.x + 0.5);
  float an = PI / n;
  float sn = sin(an);
  float cs = cos(an);
  float c = (0.985 - 0.885 * pow(1.0 - clamp(a.y, 0.0, 1.0), 2.5)) / (1.0 + sn);
  float rp = 1.0 - c;
  float rho = clamp(a.z, 0.0, 1.0) * 0.6 * rp;
  float bn = mod(atan(p.x, -p.y) + an, 2.0 * an) - an;
  vec2 q = length(p) * vec2(cos(bn), abs(sin(bn)));
  float rf = rp + rho;
  vec2 f = (c * cs + sqrt(rf * rf - c * c * sn * sn)) * vec2(cs, sn);
  vec2 dq = q - vec2(c, 0.0);
  vec2 df = f - vec2(c, 0.0);
  if (df.x * dq.y - df.y * dq.x < 0.0) return length(dq) - rp;
  return rho - length(q - f);
}`},{id:"sun",name:"Sun",params:[{key:"rays",label:"Rays",min:3,max:24,step:1,default:8},{key:"core",label:"Core size",min:.1,max:.7,step:.01,default:.42},{key:"width",label:"Ray width",min:0,max:1,step:.01,default:.5},{key:"gap",label:"Gap",min:0,max:1,step:.01,default:.4}],glsl:`float sd_sun(vec2 p, vec4 a, vec4 b) {
  float n = floor(a.x + 0.5);
  float an = PI / n;
  float core = clamp(a.y, 0.1, 0.7);
  float rs = core + clamp(a.w, 0.0, 1.0) * 0.25;
  float w = min(mix(0.015, min(0.9 * an * rs, 0.16), clamp(a.z, 0.0, 1.0)), 0.5 * (1.0 - rs));
  float r1 = rs + w;
  float r2 = max(1.0 - w, r1);
  float bn = mod(atan(p.x, -p.y) + an, 2.0 * an) - an;
  vec2 q = length(p) * vec2(cos(bn), abs(sin(bn)));
  float ray = length(vec2(q.x - clamp(q.x, r1, r2), q.y)) - w;
  return min(length(p) - core, ray);
}`},{id:"gear",name:"Gear",params:[{key:"teeth",label:"Teeth",min:5,max:18,step:1,default:8},{key:"depth",label:"Tooth depth",min:0,max:1,step:.01,default:.5},{key:"hole",label:"Hole",min:0,max:1,step:.01,default:.5},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.3}],glsl:`float gear_seg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}

float sd_gear(vec2 p, vec4 a, vec4 b) {
  float n = floor(a.x + 0.5);
  float an = PI / n;
  float depth = mix(0.1, 0.32, clamp(a.y, 0.0, 1.0));
  float r0 = 1.0 - depth;
  float a0 = an * 0.58;
  float h1 = 0.68 * r0 * sin(a0);
  float rr = clamp(a.w, 0.0, 1.0) * 0.5 * min(h1, depth);
  float rh = clamp(a.z, 0.0, 1.0) * 0.55;
  vec2 f0 = r0 * vec2(cos(a0), sin(a0));
  vec2 f1 = vec2(sqrt(1.0 - h1 * h1), h1);
  vec2 tf = normalize(f1 - f0);
  vec2 nf = vec2(-tf.y, tf.x);
  float cf = dot(f0, nf) - rr;
  float o1 = 1.0 - rr;
  float o0 = r0 - rr;
  vec2 g0 = cf * nf + sqrt(o0 * o0 - cf * cf) * tf;
  vec2 g1 = cf * nf + sqrt(o1 * o1 - cf * cf) * tf;
  float bn = mod(atan(p.x, -p.y) + an, 2.0 * an) - an;
  float len = length(p);
  vec2 q = len * vec2(cos(bn), abs(sin(bn)));
  float ang = atan(q.y, q.x);
  float dt = ang <= atan(g1.y, g1.x) ? abs(len - o1) : length(q - g1);
  float dr = ang >= atan(g0.y, g0.x) ? abs(len - o0) : length(q - g0);
  float dist = min(min(dt, dr), gear_seg(q, g0, g1));
  bool inside = len < o0 || (len < o1 && dot(q, nf) < cf);
  float d = inside ? -dist : dist;
  if (rh > 0.001) d = max(d, rh + rr - len);
  return d - rr;
}`},{id:"shield",name:"Shield",params:[{key:"width",label:"Largura",min:.5,max:1,step:.01,default:.82},{key:"point",label:"Point",min:0,max:1,step:.01,default:.5},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.3}],glsl:`float sd_shield(vec2 p, vec4 a, vec4 b) {
  float w = clamp(a.x, 0.5, 1.0);
  float ys = mix(1.0 - w, -0.55, clamp(a.y, 0.0, 1.0));
  float big = (w * w + (1.0 - ys) * (1.0 - ys)) / (2.0 * w);
  float rr = clamp(a.z, 0.0, 1.0) * 0.25 * w;
  float wi = w - rr;
  float top = -1.0 + rr;
  float ri = big - rr;
  vec2 c = vec2(w - big, ys);
  vec2 q = vec2(abs(p.x), p.y);
  vec2 v = q - c;
  vec2 td = vec2(-c.x, sqrt(max(ri * ri - c.x * c.x, 0.0)));
  float dTop = length(q - vec2(clamp(q.x, 0.0, wi), top));
  float dSide = length(q - vec2(wi, clamp(q.y, top, ys)));
  bool onArc = v.y >= 0.0 && v.x * td.y - v.y * td.x >= 0.0;
  float dArc = onArc ? abs(length(v) - ri) : min(length(q - vec2(wi, ys)), length(q - vec2(0.0, ys + td.y)));
  bool inside = q.y <= ys ? q.y >= top && q.x <= wi : length(v) < ri;
  float dist = min(min(dTop, dSide), dArc);
  return (inside ? -dist : dist) - rr;
}`},{id:"arrow",name:"Arrow",params:[{key:"head",label:"Head size",min:0,max:1,step:.01,default:.5},{key:"shaft",label:"Shaft width",min:0,max:1,step:.01,default:.4},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.2}],glsl:`float arrow_seg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}

float sd_arrow(vec2 p, vec4 a, vec4 b) {
  float hs = clamp(a.x, 0.0, 1.0);
  float hl = mix(0.6, 1.3, hs);
  float hw = mix(0.6, 1.0, hs);
  float sw = mix(0.1, 0.7, clamp(a.y, 0.0, 1.0)) * hw;
  float rr = clamp(a.z, 0.0, 1.0) * 0.5 * min(sw, 0.25);
  vec2 q = vec2(abs(p.x), p.y);
  float m = length(vec2(hl, hw));
  vec2 n1 = vec2(hl, -hw) / m;
  float c1 = hw / m - rr;
  float yb = -1.0 + hl - rr;
  float sx = sw - rr;
  float ye = 1.0 - rr;
  vec2 v0 = vec2(0.0, -c1 * m / hw);
  vec2 v1 = vec2((c1 * m + yb * hw) / hl, yb);
  vec2 v2 = vec2(sx, yb);
  vec2 v3 = vec2(sx, ye);
  vec2 v4 = vec2(0.0, ye);
  float dist = min(min(arrow_seg(q, v0, v1), arrow_seg(q, v1, v2)), min(arrow_seg(q, v2, v3), arrow_seg(q, v3, v4)));
  bool inside = (dot(q, n1) < c1 && q.y < yb) || (q.x < sx && q.y >= yb && q.y < ye);
  return (inside ? -dist : dist) - rr;
}`},{id:"chevron",name:"Chevron",params:[{key:"angle",label:"Ângulo",min:40,max:150,step:1,default:90},{key:"thickness",label:"Thickness",min:.05,max:.8,step:.01,default:.36},{key:"roundness",label:"Roundness",min:0,max:1,step:.01,default:.2}],glsl:`float chevron_seg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}

float sd_chevron(vec2 p, vec4 a, vec4 b) {
  float be = radians(clamp(a.x, 40.0, 150.0)) * 0.5;
  float sb = sin(be);
  float cb = cos(be);
  float h = min(1.9, cb / sb);
  float t = min(clamp(a.y, 0.05, 0.8), 0.85 * h * sb);
  float rr = clamp(a.z, 0.0, 1.0) * 0.5 * t;
  vec2 n = vec2(cb, -sb);
  float ko = 0.5 * h * sb - rr;
  float ki = 0.5 * h * sb - t + rr;
  float ye = 0.5 * h - rr;
  vec2 q = vec2(abs(p.x), p.y);
  vec2 c0 = vec2(0.0, -ko / sb);
  vec2 c1 = vec2((ko + ye * sb) / cb, ye);
  vec2 c2 = vec2((ki + ye * sb) / cb, ye);
  vec2 c3 = vec2(0.0, -ki / sb);
  float dist = min(min(chevron_seg(q, c0, c1), chevron_seg(q, c1, c2)), chevron_seg(q, c2, c3));
  float k = dot(q, n);
  bool inside = k < ko && k > ki && q.y < ye;
  return (inside ? -dist : dist) - rr;
}`},{id:"wave",name:"Wave",params:[{key:"waves",label:"Waves",min:.5,max:4,step:.5,default:1.5},{key:"amplitude",label:"Amplitude",min:0,max:1,step:.01,default:.7},{key:"thickness",label:"Thickness",min:.04,max:.6,step:.01,default:.22}],glsl:`float sd_wave(vec2 p, vec4 a, vec4 b) {
  float th = clamp(a.z, 0.04, 0.6);
  float xe = 1.0 - 0.5 * th;
  float m = floor(2.0 * clamp(a.x, 0.5, 4.0) + 0.5);
  float len = 2.0 * xe / m;
  float amp = max(clamp(a.y, 0.0, 1.0) * 0.5 * len, 1e-4);
  float r = (0.25 * len * len + amp * amp) / (2.0 * amp);
  float i0 = clamp(floor((p.x + xe) / len), 0.0, m - 1.0);
  float best = 1e9;
  for (int j = -1; j <= 1; j++) {
    float i = clamp(i0 + float(j), 0.0, m - 1.0);
    float h = amp + (mod(i, 2.0) < 0.5 ? p.y : -p.y);
    float x = abs(p.x + xe - (i + 0.5) * len);
    float d = (r - amp) * x > 0.5 * len * (r - h) ? length(vec2(x - 0.5 * len, amp - h)) : abs(x * x + h * h - 2.0 * r * h) / (length(vec2(x, r - h)) + r);
    best = min(best, d);
  }
  return best - 0.5 * th;
}`},{id:"spiral",name:"Spiral",params:[{key:"turns",label:"Turns",min:.5,max:6,step:.25,default:2.5},{key:"thickness",label:"Thickness",min:.1,max:.9,step:.01,default:.45}],glsl:`float sd_spiral(vec2 p, vec4 a, vec4 b) {
  float k = clamp(a.y, 0.1, 0.9);
  float th1 = PI + TAU * clamp(a.x, 0.5, 6.0);
  float rad = 1.0 / (1.0 + k * PI / th1);
  float sc = rad / th1;
  vec2 q = vec2(-p.x, p.y);
  float ph = atan(q.y, q.x);
  float k0 = clamp(floor((length(q) / sc - ph) / TAU + 0.5), ceil((PI - ph) / TAU), floor((th1 - ph) / TAU));
  float best = 1e9;
  for (int i = -1; i <= 1; i++) {
    float th = clamp(ph + TAU * (k0 + float(i)), PI, th1);
    for (int j = 0; j < 4; j++) {
      float cs = cos(th);
      float sn = sin(th);
      vec2 dq = q - sc * th * vec2(cs, sn);
      vec2 c1 = sc * vec2(cs - th * sn, sn + th * cs);
      vec2 c2 = sc * vec2(-2.0 * sn - th * cs, 2.0 * cs - th * sn);
      float g2 = max(dot(c1, c1) - dot(dq, c2), 0.25 * dot(c1, c1));
      th = clamp(th + clamp(dot(dq, c1) / g2, -0.6, 0.6), PI, th1);
    }
    best = min(best, length(q - sc * th * vec2(cos(th), sin(th))));
  }
  return best - k * PI * sc;
}`}],es=Object.fromEntries(xt.map((e,a)=>[e.id,a])),fa=Object.fromEntries(xt.map(e=>[e.id,e])),tn=e=>{var a;return Object.fromEntries((((a=fa[e])==null?void 0:a.params)||[]).map(t=>[t.key,t.default]))},an=(e,a={})=>{var s;const t=(((s=fa[e])==null?void 0:s.params)||[]).map(o=>a[o.key]??o.default);for(;t.length<8;)t.push(0);return[t.slice(0,4),t.slice(4,8)]},Ia=32,Fa=16,on=["x","y","z","w"],eo=e=>`uMatP[${Math.floor(e/4)}].${on[e%4]}`;function ts(e=[]){let a=0,t=0;const s=[],o=[];if(e.forEach(r=>{if(r.type==="color")s.push({param:r,color:t}),o.push(`#define C_${r.name} uMatC[${t}]`),t+=1;else if(r.type==="colorArray"){const i=Math.max(1,r.maxItems??4);s.push({param:r,color:t,size:i,count:a}),o.push(`#define C_${r.name}(k) uMatC[${t} + (k)]`),o.push(`#define N_${r.name} ${eo(a)}`),t+=i,a+=1}else s.push({param:r,float:a}),o.push(`#define P_${r.name} ${eo(a)}`),a+=1}),a>Ia||t>Fa)throw new Error(`Material uses ${a} numbers and ${t} colors, more than the shader allows.`);return{slots:s,defines:o.join(`
`)}}const to=e=>{const a=Jo(e);return a?[a.r,a.g,a.b,a.a??1]:[1,1,1,1]},sn=(e,a)=>{if(e.type==="boolean")return a?1:0;if(e.type==="select"){if(typeof a=="number")return a;const s=(e.options||[]).findIndex(o=>o.value===a);return s<0?0:s}const t=Number(a);return Number.isFinite(t)?t:0},as=e=>Object.fromEntries((e||[]).map(a=>[a.name,a.default]));function nn(e,a={}){const t=new Float32Array(Ia),s=new Float32Array(Fa*4);return e.slots.forEach(o=>{const{param:r}=o,i=a[r.name]??r.default;if(o.color!==void 0&&o.size){const l=(Array.isArray(i)?i:[i]).filter(Boolean).slice(0,o.size);l.forEach((m,c)=>s.set(to(m),(o.color+c)*4)),t[o.count]=l.length}else o.color!==void 0?s.set(to(i),o.color*4):t[o.float]=sn(r,i)}),{floats:t,colors:s}}const na=10,Ra=e=>((e==null?void 0:e.layers)||[]).filter(a=>a.visible!==!1).slice(0,na),ft=(e={},a={})=>{var i,l;const t=Ra(e.a),s=Ra(e.b),o=[...t,...s],r=[...new Set(o.filter(m=>m.type!=="text"&&m.type!=="image").map(m=>es[m.type]??0))].sort((m,c)=>m-c);return{capacity:Math.max(1,t.length,s.length),types:r,morph:!!e.b,patterns:o.some(m=>m.pattern&&m.pattern!=="none"),radialCopies:o.some(m=>!["row","column"].includes(m.layout)&&Math.round(m.repeat??1)>1),linearCopies:o.some(m=>["row","column"].includes(m.layout)&&Math.round(m.repeat??1)>1),shadow:!!((i=a.shadow)!=null&&i.on&&(a.shadow.opacity??.35)>0),bevel:!!((l=a.gloss)!=null&&l.on)}},rn=e=>`${e.capacity}:${e.types.join(",")}:${[e.morph,e.patterns,e.radialCopies,e.linearCopies,e.shadow,e.bevel].map(Number).join("")}`,Ve=4,ta=100,os=4,ln=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,cn=e=>xt.flatMap((a,t)=>!e||e.includes(t)?[`  if (t == ${t}) return sd_${a.id}(p, a, b);`]:[]).join(`
`),mn=e=>`
${e.kind==="fill"?"#define HAS_FILL_MATERIAL 1":"#define HAS_MATERIAL 1"}
#define MATERIAL_OUTSIDE ${e.outside?"true":"false"}
#define MATERIAL_NORMALS ${e.normals===!1?"false":"true"}
#define MATERIAL_REACH ${(e.reach??.32).toFixed(4)}
uniform vec4 uMatP[${Ia/4}];
uniform vec4 uMatC[${Fa}];
uniform vec4 uSurface;
${e.defines||""}

struct Surface {
  vec2 p;
  vec2 uv;
  vec2 frag;
  vec2 res;
  float unit;
  float px;
  float d;
  float aa;
  float cov;
  vec2 n;
  float slope;
  float time;
};
`,fn=e=>`
${e.glsl}
`,un=e=>`
float shapeAt(vec2 q) {
  return scene(q);
}

vec4 backdropAt(vec2 q) {
  return backgroundColor(q);
}

float surfaceRim(Surface s, float width) {
  return clamp(1.0 + s.d / max(width, 1e-4), 0.0, 1.0);
}

vec3 domeNormal(Surface s, float width) {
  float x = min(surfaceRim(s, width), 0.985) * smoothstep(0.15, 0.85, s.slope);
  return normalize(vec3(s.n * x, sqrt(1.0 - x * x)));
}

float domeHeight(Surface s, float width) {
  float x = surfaceRim(s, width);
  return sqrt(max(1.0 - x * x, 0.0));
}

${e.glsl}
`,dn=(e=null,{capacity:a=na,types:t=null,morph:s=!0,patterns:o=!0,radialCopies:r=!0,linearCopies:i=!0,shadow:l=!0,bevel:m=!0}={})=>`#version 300 es
precision highp float;
precision highp int;
#define PI 3.14159265359
#define TAU 6.28318530718
#define MAXL ${a}
${e?mn(e):""}
uniform int uCountA;
uniform int uCountB;
uniform int uType[${a*2}];
uniform vec4 uA[${a*2}];
uniform vec4 uB[${a*2}];
uniform vec4 uXf[${a*2}];
uniform vec4 uRep[${a*2}];
uniform vec4 uMod[${a*2}];
uniform vec4 uPat[${a*2}];
uniform vec4 uPat2[${a*2}];
uniform vec4 uMarkA;
uniform vec4 uMarkB;
uniform float uMorph;
uniform sampler2D uMask0;
uniform sampler2D uMask1;
uniform sampler2D uMask2;
uniform sampler2D uMask3;
uniform vec4 uMaskInfo[${Ve}];
uniform sampler2D uLogoTex;
uniform int uLogoLayer;
uniform sampler2D uMatTex;
uniform sampler2D uSurfTex;
uniform vec4 uSurfInfo;

uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uUnit;
uniform float uEncode;
uniform float uTime;

uniform vec4 uFill;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;
uniform vec4 uOutline;
uniform vec4 uOutlineColor;
uniform vec4 uShadow;
uniform vec4 uShadowOffset;
uniform vec4 uShadowColor;
uniform vec4 uGlow;
uniform vec4 uGlowColor;
uniform vec4 uBevel;
uniform vec4 uBg;
uniform vec4 uBgColor1;
uniform vec4 uBgColor2;

out vec4 outColor;

mat2 rot2(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

float smin(float a, float b, float k) {
  if (k <= 0.0) return min(a, b);
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float smax(float a, float b, float k) {
  return -smin(-a, -b, k);
}

${xt.filter((c,d)=>!t||t.includes(d)).map(c=>c.glsl).join(`

`)}

float primitive(int t, vec2 p, vec4 a, vec4 b) {
  if (t < 0) return 1000.0;
  if (abs(p.x) + abs(p.y) < 1e-6) p.x = 1e-6;
${cn(t)}
  return length(p) - 1.0;
}

float maskTexel(int slot, vec2 uv) {
  if (slot == 0) return texture(uMask0, uv).r;
  if (slot == 1) return texture(uMask1, uv).r;
  if (slot == 2) return texture(uMask2, uv).r;
  return texture(uMask3, uv).r;
}

float sampleMask(int slot, vec2 q) {
  vec2 half_ = uMaskInfo[slot].xy;
  vec2 c = clamp(q, -half_, half_);
  vec2 uv = c / half_ * 0.5 + 0.5;
  float inner = maskTexel(slot, uv);
  return inner + length(q - c);
}

vec2 copyPoint(vec2 p, float n, float phase, int k) {
  float sector = TAU / n;
  float a = atan(p.y, p.x + 1e-9) - phase;
  a = mod(a + sector * 0.5, sector) - sector * 0.5 + float(k) * sector;
  return length(p) * vec2(cos(a), sin(a));
}

int copyReach(float n) {
  return n < 1.5 ? 0 : n < 4.5 ? 1 : 2;
}

vec2 layerPoint(int i, vec2 p) {
  vec4 xf = uXf[i];
  vec2 q = rot2(-xf.w) * (p - xf.xy) / xf.z;
  if (uRep[i].w > 0.5) q.x = -q.x;
  return q;
}

float stripeField(float u, float spacing, float weight) {
  return abs(mod(u + spacing * 0.5, spacing) - spacing * 0.5) - weight * spacing * 0.5;
}

float sphereWarp(float x, float bulge, out float slope) {
  float c = clamp(x, -0.999, 0.999);
  slope = mix(1.0, (2.0 / PI) / sqrt(1.0 - c * c), bulge);
  return mix(x, asin(c) * 2.0 / PI, bulge);
}

float patternField(int i, vec2 q) {
  vec4 pat = uPat[i];
  vec4 pat2 = uPat2[i];
  float type = pat.x;
  float spacing = 2.0 / max(pat.y, 1.0);
  float weight = clamp(pat.z, 0.02, 0.98);
  float bulge = clamp(pat2.x, 0.0, 1.0);
  float taper = clamp(pat2.y, 0.0, 1.0);
  vec2 r = rot2(-pat.w) * q;
  if (type < 1.5) {
    float slope;
    float u = sphereWarp(r.y, bulge, slope);
    float w = weight * mix(1.0, 1.0 - taper, clamp((u + 1.0) * 0.5, 0.0, 1.0));
    return stripeField(u, spacing, w) / slope;
  }
  if (type < 2.5) {
    float rho = length(r);
    float w = weight * mix(1.0, 1.0 - taper, clamp(rho, 0.0, 1.0));
    return stripeField(rho, spacing, w);
  }
  if (type < 3.5) {
    float rho = length(r);
    float sector = TAU / max(pat.y, 1.0);
    float a = abs(mod(atan(r.y, r.x) + sector * 0.5, sector) - sector * 0.5);
    float wedge = (a - weight * sector * 0.5) * rho;
    float beam = sin(min(a, PI * 0.5)) * rho - weight * spacing * 0.25;
    return mix(wedge, beam, taper);
  }
  if (type < 4.5) {
    float sy;
    float v = sphereWarp(r.y, bulge, sy);
    float lat = sqrt(max(1.0 - r.y * r.y * bulge, 1e-3));
    float sx;
    float u = sphereWarp(r.x / lat, bulge, sx);
    float a = stripeField(u, spacing, weight * 0.5) / (sx / lat);
    float b = stripeField(v, spacing, weight * 0.5) / sy;
    return min(a, b);
  }
  vec2 cell = floor(r / spacing + 0.5) * spacing;
  float fade =
    type < 5.5
      ? clamp((cell.x + 1.0) * 0.5, 0.0, 1.0)
      : smoothstep(0.0, 1.0, length(cell));
  float radius = weight * spacing * 0.5 * (1.0 - taper * fade);
  return length(r - cell) - max(radius, 0.0);
}

float shapeCore(int i, vec2 q) {
  int t = uType[i];
  float d = t >= ${ta} ? sampleMask(t - ${ta}, q) : primitive(t, q, uA[i], uB[i]);
  ${o?`if (uPat[i].x > 0.5) {
    float f = patternField(i, q);
    d = uPat2[i].z > 0.5 ? max(d, -f) : max(d, f);
  }`:""}
  return d;
}

vec2 rowAxis(int i) {
  return uPat2[i].w < 1.5 ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
}

vec2 rowFold(int i, vec2 q) {
  vec4 rep = uRep[i];
  if (uPat2[i].w < 0.5 || rep.x < 1.5) return q;
  vec2 axis = rowAxis(i);
  float gap = max(rep.y, 0.01);
  float start = -gap * (rep.x - 1.0) * 0.5;
  float k = clamp(floor((dot(q, axis) - start) / gap + 0.5), 0.0, rep.x - 1.0);
  return q - axis * (start + k * gap);
}

float layerShape(int i, vec2 p) {
  vec2 q = layerPoint(i, p);
  ${i?`vec4 rep = uRep[i];
  float d;
  if (uPat2[i].w > 0.5 && rep.x > 1.5) {
    vec2 axis = rowAxis(i);
    float gap = max(rep.y, 0.01);
    float start = -gap * (rep.x - 1.0) * 0.5;
    float k = clamp(floor((dot(q, axis) - start) / gap + 0.5), 0.0, rep.x - 1.0);
    d = 1e5;
    for (int j = -1; j <= 1; j++) {
      float kk = clamp(k + float(j), 0.0, rep.x - 1.0);
      d = min(d, shapeCore(i, q - axis * (start + kk * gap)));
    }
  } else {
    d = shapeCore(i, q);
  }`:"float d = shapeCore(i, q);"}
  return d * uXf[i].z;
}

float layerSD(int i, vec2 p) {
  vec4 rep = uRep[i];
  if (rep.z > 0.5) p.x = abs(p.x);
  ${r?`int reach = uPat2[i].w > 0.5 ? 0 : copyReach(rep.x);
  float d = 1e5;
  for (int k = -2; k <= 2; k++) {
    if (k < -reach || k > reach) continue;
    d = min(d, layerShape(i, reach > 0 ? copyPoint(p, rep.x, rep.y, k) : p));
  }`:"float d = min(1e5, layerShape(i, p));"}
  vec4 m = uMod[i];
  d -= m.x;
  if (m.y > 0.0) d = abs(d) - m.y;
  return d;
}

float combine(float d, float s, float op, float k) {
  if (op < 0.5) return min(d, s);
  if (op < 1.5) return smin(d, s, k);
  if (op < 2.5) return smax(d, -s, k);
  if (op < 3.5) return smax(d, s, k);
  return max(min(d, s), -max(d, s));
}

float sceneRange(int start, int count, vec4 mark, vec2 p) {
  p = rot2(-mark.y) * (p - mark.zw) / mark.x;
  float d = 1e5;
  for (int k = 0; k < MAXL; k++) {
    if (k >= count) break;
    int i = start + k;
    float s = layerSD(i, p);
    d = k == 0 ? s : combine(d, s, uMod[i].z, uMod[i].w);
  }
  return d * mark.x;
}

float scene(vec2 p) {
  ${s?`int passes = uMorph > 0.0 && uMorph < 1.0 ? 2 : 1;
  int first = uMorph >= 1.0 ? 1 : 0;
  float result[2];
  result[0] = 1e5;
  result[1] = 1e5;
  for (int s = 0; s < 2; s++) {
    if (s >= passes) break;
    bool second = first + s == 1;
    result[s] = sceneRange(second ? MAXL : 0, second ? uCountB : uCountA, second ? uMarkB : uMarkA, p);
  }
  return passes == 2 ? mix(result[0], result[1], uMorph) : result[0];`:"return sceneRange(0, uCountA, uMarkA, p);"}
}

vec4 encodeField(float d) {
  float v = floor(clamp(d / ${os.toFixed(1)} + 0.5, 0.0, 1.0) * 16777215.0);
  float r = floor(v / 65536.0);
  v -= r * 65536.0;
  float g = floor(v / 256.0);
  float b = v - g * 256.0;
  return vec4(r, g, b, 255.0) / 255.0;
}

vec4 over(vec4 base, vec4 top) {
  return top + base * (1.0 - top.a);
}

vec3 toLinear(vec3 c) {
  return pow(c, vec3(2.2));
}

vec3 toDisplay(vec3 c) {
  return pow(max(c, 0.0), vec3(1.0 / 2.2));
}

vec4 materialColor(vec2 p) {
  vec2 uv = (p * uUnit + uCenter) / uResolution;
  vec4 t = texture(uMatTex, uv);
  float a = t.a + uColor1.a * (1.0 - t.a);
  if (a < 1e-4) return vec4(0.0);
  vec3 c = (t.rgb * t.a + uColor1.rgb * uColor1.a * (1.0 - t.a)) / a;
  return vec4(c, a);
}

${(e==null?void 0:e.kind)==="fill"?fn(e):""}
vec4 gradientColor(vec4 kind, vec2 p) {
  if (kind.x < 1.5) return uColor1;
#ifdef HAS_FILL_MATERIAL
  if (kind.x > 6.5) return fill(p, uTime);
#endif
  if (kind.x > 5.5) return materialColor(p);
  if (kind.x > 4.5) {
    if (uLogoLayer < 0) return uColor1;
    int slot = uType[uLogoLayer] - ${ta};
    vec2 h = uMaskInfo[slot].xy;
    vec4 rep = uRep[uLogoLayer];
    vec2 m = rot2(-uMarkA.y) * (p - uMarkA.zw) / uMarkA.x;
    if (rep.z > 0.5) m.x = abs(m.x);
    int reach = uPat2[uLogoLayer].w > 0.5 ? 0 : copyReach(rep.x);
    for (int k = -2; k <= 2; k++) {
      if (k < -reach || k > reach) continue;
      vec2 q = rowFold(uLogoLayer, layerPoint(uLogoLayer, reach > 0 ? copyPoint(m, rep.x, rep.y, k) : m));
      vec2 uv = q / h * 0.5 + 0.5;
      if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) continue;
      vec4 c = texture(uLogoTex, uv);
      if (c.a >= 0.02) return vec4(c.rgb / c.a, 1.0);
    }
    return uColor1;
  }
  float t;
  if (kind.x < 2.5) {
    vec2 dir = vec2(sin(kind.y), -cos(kind.y));
    t = dot(p, dir) * 0.5 / max(kind.z, 0.05) + 0.5;
  } else if (kind.x < 3.5) {
    t = length(p) / max(kind.z, 0.05);
  } else {
    t = fract((atan(p.x, -p.y) - kind.y) / TAU);
  }
  t = clamp(t, 0.0, 1.0);
  vec3 c;
  float alpha;
  if (kind.w > 0.5) {
    float u = t * 2.0;
    vec3 a = u < 1.0 ? toLinear(uColor1.rgb) : toLinear(uColor2.rgb);
    vec3 b = u < 1.0 ? toLinear(uColor2.rgb) : toLinear(uColor3.rgb);
    float f = u < 1.0 ? u : u - 1.0;
    c = toDisplay(mix(a, b, f));
    alpha = u < 1.0 ? mix(uColor1.a, uColor2.a, f) : mix(uColor2.a, uColor3.a, f);
  } else {
    c = toDisplay(mix(toLinear(uColor1.rgb), toLinear(uColor2.rgb), t));
    alpha = mix(uColor1.a, uColor2.a, t);
  }
  return vec4(c, alpha);
}

vec4 backgroundColor(vec2 p) {
  if (uBg.x < 0.5) return vec4(0.0);
  if (uBg.x < 1.5) return uBgColor1;
  vec2 dir = vec2(sin(uBg.y), -cos(uBg.y));
  float t = clamp(dot(p, dir) * 0.5 / max(uBg.z, 0.05) + 0.5, 0.0, 1.0);
  vec3 c = toDisplay(mix(toLinear(uBgColor1.rgb), toLinear(uBgColor2.rgb), t));
  return vec4(c, mix(uBgColor1.a, uBgColor2.a, t));
}
vec3 bevelNormal(vec2 p, float d, vec2 g, float bw, out vec2 shift) {
  vec2 n;
  float rim;
  vec3 N;
  if (uSurfInfo.z > 0.5) {
    vec4 sf = texture(uSurfTex, p * uSurfInfo.xy + 0.5);
    float q = 1.0 - clamp(sf.x, 0.0, 1.0);
    float slope = q / max(sqrt(max(1.0 - q * q, 0.0)), 0.12);
    n = -sf.yz * bw * q;
    rim = 1.0;
    N = normalize(vec3(-sf.yz * slope * bw, 1.0));
  } else {
    float glen = length(g);
    n = glen > 1e-5 ? g / glen : vec2(0.0);
    rim = min(clamp(1.0 + d / bw, 0.0, 1.0), 0.985) * smoothstep(0.15, 0.85, glen);
    N = normalize(vec3(n * rim, sqrt(1.0 - rim * rim)));
  }
  shift = n * rim * rim * bw * uBevel.w * 0.6;
  return N;
}

vec3 dither(vec2 f) {
  float a = fract(52.9829189 * fract(dot(f, vec2(0.06711056, 0.00583715))));
  float b = fract(52.9829189 * fract(dot(f + vec2(17.0, 31.0), vec2(0.06711056, 0.00583715))));
  return vec3((a + b - 1.0) / 255.0);
}

float bevelLight(vec3 N) {
  vec3 L = normalize(vec3(cos(uBevel.y) * 0.62, sin(uBevel.y) * 0.62, 0.78));
  float diffuse = max(dot(N, L), 0.0) / L.z;
  float occlusion = mix(1.0, 0.78, 1.0 - N.z);
  return mix(1.0, diffuse * occlusion, uBevel.x);
}
${e&&e.kind!=="fill"?un(e):""}
void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 p = (frag - uCenter) / uUnit;
  float px = 1.0 / uUnit;
  bool shadowed = ${l?"uEncode < 0.5 && uShadow.x > 0.0":"false"};
#ifdef HAS_MATERIAL
  bool beveled = ${m?"uEncode < 0.5 && MATERIAL_NORMALS":"false"};
  float bw = max(uSurface.x, px);
#else
  bool lit = uEncode < 0.5 && uFill.x > 0.5 && uBevel.z > 0.0;
  bool beveled = ${m?"lit && uSurfInfo.z < 0.5":"false"};
  float bw = max(uBevel.z, px);
#endif
  float e = clamp(bw * 0.2, px * 1.5, max(bw * 0.5, px * 1.5));
  ${l||m?`vec2 points[6];
  points[0] = p;
  int count = 1;
  int shadowAt = -1;
  if (shadowed) {
    shadowAt = count;
    points[count] = p - uShadowOffset.xy;
    count += 1;
  }
  int glossAt = -1;
  if (beveled) {
    glossAt = count;
    points[count] = p + vec2(e, 0.0);
    points[count + 1] = p - vec2(e, 0.0);
    points[count + 2] = p + vec2(0.0, e);
    points[count + 3] = p - vec2(0.0, e);
    count += 4;
  }
  float values[6];
  for (int k = 0; k < 6; k++) {
    if (k >= count) break;
    values[k] = scene(points[k]);
  }
  float d = values[0];
  float aa = clamp(length(vec2(dFdx(d), dFdy(d))), px * 0.5, px * 1.5);
  vec2 g = glossAt >= 0
    ? vec2(values[glossAt] - values[glossAt + 1], values[glossAt + 2] - values[glossAt + 3]) / (2.0 * e)
    : vec2(0.0);`:`float d = scene(p);
  float aa = clamp(length(vec2(dFdx(d), dFdy(d))), px * 0.5, px * 1.5);
  vec2 g = vec2(0.0);`}
  if (uEncode > 1.5) {
    outColor = vec4(d, 0.0, 0.0, 1.0);
    return;
  }
  if (uEncode > 0.5) {
    outColor = encodeField(d);
    return;
  }

  vec4 bg = backgroundColor(p);
  vec4 col = vec4(bg.rgb * bg.a, bg.a);

  ${l?`if (shadowAt >= 0) {
    float ds = values[shadowAt];
    float blur = max(uShadow.y, px);
    float a = (1.0 - smoothstep(-blur, blur, ds)) * uShadow.x;
    col = over(col, vec4(uShadowColor.rgb, 1.0) * a * uShadowColor.a);
  }`:""}

  if (uGlow.x > 0.0) {
    float g = exp(-max(d, 0.0) / max(uGlow.y, 0.01)) * uGlow.x;
    g *= clamp(d / aa + 0.5, 0.0, 1.0);
    col = over(col, vec4(uGlowColor.rgb, 1.0) * clamp(g, 0.0, 1.0) * uGlowColor.a);
  }

  if (uOutline.x > 0.0) {
    float w = uOutline.y;
    float dout = uOutline.z > 0.5 ? abs(d) - w * 0.5 : d - w;
    float c = clamp(0.5 - dout / aa, 0.0, 1.0);
    col = over(col, vec4(uOutlineColor.rgb, 1.0) * c * uOutlineColor.a);
  }

#ifdef HAS_MATERIAL
  {
    Surface s;
    s.p = p;
    s.uv = frag / uResolution;
    s.frag = frag;
    s.res = uResolution;
    s.unit = uUnit;
    s.px = px;
    s.d = d;
    s.aa = aa;
    s.cov = clamp(0.5 - d / aa, 0.0, 1.0);
    s.slope = length(g);
    s.n = s.slope > 1e-5 ? g / s.slope : vec2(0.0);
    s.time = uTime;
    vec4 m = material(s);
    float reach = 1.0 - smoothstep(MATERIAL_REACH * 0.55, MATERIAL_REACH, d);
    float ma = clamp(MATERIAL_OUTSIDE ? m.a * max(reach, s.cov) : m.a * s.cov, 0.0, 1.0);
    col = over(col, vec4(clamp(m.rgb, 0.0, 1.0) * ma, ma));
  }
#else
  float fillCov = clamp(0.5 - d / aa, 0.0, 1.0);
  if (uFill.x > 0.5 && (uFill.x < 6.5 || fillCov > 0.0)) {
    float cov = fillCov;
    vec4 fc;
    if (lit) {
      vec2 shift;
      vec3 N = bevelNormal(p, d, g, bw, shift);
      bool bend = uFill.x < 4.5 || uFill.x > 5.5;
      fc = gradientColor(uFill, bend ? p + shift : p);
      fc.rgb = clamp(fc.rgb * bevelLight(N) + dither(gl_FragCoord.xy), 0.0, 1.0);
    } else {
      fc = gradientColor(uFill, p);
    }
    col = over(col, vec4(fc.rgb, 1.0) * fc.a * cov);
  }
#endif

  outColor = col;
}`;let ao=0;const ss=()=>(ao+=1,`layer-${Date.now().toString(36)}-${ao}`),Da=[{value:"add",label:"Adicionar"},{value:"merge",label:"Mesclar"},{value:"cut",label:"Recortar"},{value:"keep",label:"Manter"},{value:"exclude",label:"Excluir"}],Aa=[{value:"1:1",label:"Square",w:1,h:1},{value:"4:3",label:"4:3",w:4,h:3},{value:"16:9",label:"16:9",w:16,h:9},{value:"3:4",label:"3:4",w:3,h:4},{value:"9:16",label:"9:16",w:9,h:16}],Lt=[{value:"Geist",label:"Geist",weights:[400,500,600,700,800,900]},{value:"Inter",label:"Inter",google:"Inter:wght@400;500;600;700;800;900",weights:[400,500,600,700,800,900]},{value:"Space Grotesk",label:"Space Grotesk",google:"Space+Grotesk:wght@400;500;600;700",weights:[400,500,600,700]},{value:"Syne",label:"Syne",google:"Syne:wght@400;500;600;700;800",weights:[400,500,600,700,800]},{value:"Bricolage Grotesque",label:"Bricolage Grotesque",google:"Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800",weights:[400,600,800]},{value:"Unbounded",label:"Unbounded",google:"Unbounded:wght@400;600;800;900",weights:[400,600,800,900]},{value:"Archivo Black",label:"Archivo Black",google:"Archivo+Black",weights:[400]},{value:"Fraunces",label:"Fraunces",google:"Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800",weights:[400,600,800]},{value:"DM Serif Display",label:"DM Serif Display",google:"DM+Serif+Display",weights:[400]},{value:"Instrument Serif",label:"Instrument Serif",google:"Instrument+Serif",weights:[400]},{value:"Sora",label:"Sora",google:"Sora:wght@400;600;800",weights:[400,600,800]},{value:"Geist Mono",label:"Geist Mono",weights:[400,500,600,700,800]}],pn={x:0,y:0,size:.7,rotation:0,op:"add",outline:0,round:0,repeat:1,spin:0,mirror:!1,visible:!0},hn=.12,ns=e=>e.smooth??(e.op==="merge"?hn:0),ua=(e,a={})=>{const{params:t,...s}=a;return{id:ss(),type:e,...pn,...s,params:{...tn(e),...t||{}}}},rs=(e="Mark",a={})=>{const{text:t,...s}=a;return ua("text",{size:.85,...s,text:{value:e,font:"Geist",weight:800,tracking:-.02,...t||{}}})},ls=(e,a={})=>ua("image",{size:.85,...a,image:{name:e.name,src:e.src,key:e.key}}),bt=e=>e.type==="text"||e.type==="image",is=e=>{var a,t,s;return e.name?e.name:e.type==="text"?(a=e.text)!=null&&a.value?`“${e.text.value}”`:"Texto":e.type==="image"?((t=e.image)==null?void 0:t.name)||"Logo":((s=fa[e.type])==null?void 0:s.name)||e.type},Na=e=>{var a,t;if(e.type==="text"){const s=e.text||{};return`text:${s.value}|${s.font}|${s.weight}|${s.tracking}`}return e.type==="image"?`image:${((a=e.image)==null?void 0:a.key)||((t=e.image)==null?void 0:t.src)}`:null},oo={kind:"linear",color1:"#ffffff",color2:"#cbcbd3",color3:"#8d8d99",stops:2,angle:160,extent:1},Ft={outline:{on:!1,width:.03,color:"#ffffff",mode:"outside"},shadow:{on:!1,opacity:.35,blur:.1,x:0,y:.06,color:"#000000"},glow:{on:!1,intensity:.7,radius:.12,color:"#ffffff"},gloss:{on:!1,strength:.25,angle:225,bevel:.4,bend:2.5}},so={ratio:"1:1",background:{kind:"none",color1:"#120f17",color2:"#2a2238",angle:180,extent:1}},vn={on:!1,target:null,duration:1.6,hold:.8,ease:"smooth"},no={dark:"#f2f2f2",light:"#141414"},cs=e=>({kind:"solid",color1:e?no.light:no.dark,ink:!0}),Ca=(e={},{light:a=!1}={})=>{var t,s,o,r;return{version:1,name:e.name||"Untitled mark",preset:e.id||null,artboard:{...so,...e.artboard||{},background:{...so.background,...((t=e.artboard)==null?void 0:t.background)||{}}},mark:{scale:((s=e.mark)==null?void 0:s.scale)??1,rotation:((o=e.mark)==null?void 0:o.rotation)??0,x:0,y:0,layers:(((r=e.mark)==null?void 0:r.layers)||[{type:"star"}]).map(i=>{var l;return i.type==="text"?rs((l=i.text)==null?void 0:l.value,i):i.type==="image"?ls(i.image,i):ua(i.type,i)})},fill:e.ink?{...oo,...cs(a)}:{...oo,...e.fill||{}},effects:Object.fromEntries(Object.entries(Ft).map(([i,l])=>{var m;return[i,{...l,...((m=e.effects)==null?void 0:m[i])||{}}]})),material:e.material||{id:"flat",props:{}},morph:{...vn}}},mt=e=>Aa.find(a=>a.value===e.ratio)||Aa[0],gn=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,yt=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
out vec4 outColor;
`,xn=`${yt}
uniform sampler2D uSdf;
uniform float uLength;
void main() {
  float d = texelFetch(uSdf, ivec2(gl_FragCoord.xy), 0).r;
  outColor = vec4(d < 0.0 ? 1.0 - exp(d / uLength) : 0.0, 0.0, 0.0, 1.0);
}`,bn=`${yt}
uniform sampler2D uCoarse;
uniform sampler2D uSdf;
void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  if (texelFetch(uSdf, c, 0).r >= 0.0) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  ivec2 size = textureSize(uCoarse, 0);
  vec2 f = clamp((vec2(c) + 0.5) * 0.5 - 0.5, vec2(0.0), vec2(size - 1));
  ivec2 i0 = ivec2(floor(f));
  ivec2 i1 = min(i0 + 1, size - 1);
  vec2 t = f - vec2(i0);
  float a = mix(texelFetch(uCoarse, i0, 0).r, texelFetch(uCoarse, ivec2(i1.x, i0.y), 0).r, t.x);
  float b = mix(texelFetch(uCoarse, ivec2(i0.x, i1.y), 0).r, texelFetch(uCoarse, i1, 0).r, t.x);
  outColor = vec4(mix(a, b, t.y), 0.0, 0.0, 1.0);
}`,yn=`${yt}
uniform sampler2D uU;
uniform sampler2D uSdf;
uniform float uScreen;
uniform float uOmega;
uniform int uParity;
const float MIN_THETA = 0.1;

float side(ivec2 c, ivec2 o, ivec2 size, float dc, out float value) {
  ivec2 n = c + o;
  value = 0.0;
  if (n.x < 0 || n.y < 0 || n.x >= size.x || n.y >= size.y) return MIN_THETA;
  float dn = texelFetch(uSdf, n, 0).r;
  if (dn < 0.0) {
    value = texelFetch(uU, n, 0).r;
    return 1.0;
  }
  return clamp(dc / (dc - dn), MIN_THETA, 1.0);
}

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float u = texelFetch(uU, c, 0).r;
  float dc = texelFetch(uSdf, c, 0).r;
  if (dc >= 0.0 || ((c.x + c.y) & 1) != uParity) {
    outColor = vec4(u, 0.0, 0.0, 1.0);
    return;
  }
  ivec2 size = textureSize(uU, 0);
  float ve;
  float vw;
  float vs;
  float vn;
  float te = side(c, ivec2(1, 0), size, dc, ve);
  float tw = side(c, ivec2(-1, 0), size, dc, vw);
  float ts = side(c, ivec2(0, 1), size, dc, vs);
  float tn = side(c, ivec2(0, -1), size, dc, vn);
  float kx = 2.0 / (te + tw);
  float ky = 2.0 / (ts + tn);
  float sum = uScreen + kx * (ve / te + vw / tw) + ky * (vs / ts + vn / tn);
  float diag = kx * (1.0 / te + 1.0 / tw) + ky * (1.0 / ts + 1.0 / tn) + uScreen;
  outColor = vec4(u + uOmega * (sum / diag - u), 0.0, 0.0, 1.0);
}`,wn=`${yt}
uniform sampler2D uU;
uniform sampler2D uSdf;
uniform float uUnit;
const float MIN_THETA = 0.08;

float slopeAlong(ivec2 c, ivec2 o, ivec2 size, float uc, float dc) {
  ivec2 p = c + o;
  ivec2 m = c - o;
  bool pr = p.x >= 0 && p.y >= 0 && p.x < size.x && p.y < size.y;
  bool mr = m.x >= 0 && m.y >= 0 && m.x < size.x && m.y < size.y;
  float dp = pr ? texelFetch(uSdf, p, 0).r : dc;
  float dm = mr ? texelFetch(uSdf, m, 0).r : dc;
  bool pIn = dp < 0.0;
  bool mIn = dm < 0.0;
  float up = pIn ? (pr ? texelFetch(uU, p, 0).r : uc) : 0.0;
  float um = mIn ? (mr ? texelFetch(uU, m, 0).r : uc) : 0.0;
  if (pIn && mIn) return (up - um) * 0.5;
  float tp = pIn ? 1.0 : clamp(dc / (dc - dp), MIN_THETA, 1.0);
  float tm = mIn ? 1.0 : clamp(dc / (dc - dm), MIN_THETA, 1.0);
  return (tm * tm * up - tp * tp * um - (tm * tm - tp * tp) * uc) / (tm * tp * (tm + tp));
}

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float dc = texelFetch(uSdf, c, 0).r;
  if (dc >= 0.0) {
    outColor = vec4(0.0);
    return;
  }
  ivec2 size = textureSize(uU, 0);
  float uc = texelFetch(uU, c, 0).r;
  float gx = slopeAlong(c, ivec2(1, 0), size, uc, dc) * uUnit;
  float gr = slopeAlong(c, ivec2(0, 1), size, uc, dc) * uUnit;
  outColor = vec4(uc, gx, -gr, 1.0);
}`,kn=`${yt}
uniform sampler2D uSrc;
uniform float uUnit;
void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec4 own = texelFetch(uSrc, c, 0);
  if (own.a > 0.25) {
    outColor = own;
    return;
  }
  ivec2 size = textureSize(uSrc, 0);
  vec3 sum = vec3(0.0);
  float count = 0.0;
  for (int k = 0; k < 4; k++) {
    ivec2 o = k == 0 ? ivec2(1, 0) : k == 1 ? ivec2(-1, 0) : k == 2 ? ivec2(0, 1) : ivec2(0, -1);
    ivec2 n = c + o;
    if (n.x < 0 || n.y < 0 || n.x >= size.x || n.y >= size.y) continue;
    vec4 v = texelFetch(uSrc, n, 0);
    if (v.a < 0.25) continue;
    sum += vec3(v.x - (v.y * float(o.x) - v.z * float(o.y)) / uUnit, v.y, v.z);
    count += 1.0;
  }
  outColor = count > 0.0 ? vec4(sum / count, 0.5) : vec4(0.0);
}`,_n=`${yt}
uniform sampler2D uSrc;
uniform ivec2 uDir;
uniform float uSigma;
void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  ivec2 size = textureSize(uSrc, 0);
  vec4 center = texelFetch(uSrc, c, 0);
  if (center.a < 0.25) {
    outColor = center;
    return;
  }
  vec3 sum = center.rgb;
  float total = 1.0;
  for (int k = 1; k <= 4; k++) {
    float w = exp(-float(k * k) / (2.0 * uSigma * uSigma));
    vec4 a = texelFetch(uSrc, clamp(c + uDir * k, ivec2(0), size - 1), 0);
    vec4 b = texelFetch(uSrc, clamp(c - uDir * k, ivec2(0), size - 1), 0);
    float wa = a.a > 0.25 ? w : 0.0;
    float wb = b.a > 0.25 ? w : 0.0;
    sum += wa * a.rgb + wb * b.rgb;
    total += wa + wb;
  }
  outColor = vec4(sum / total, center.a);
}`,ya={coarsest:60,middle:10,finest:16},zn=40,Tn=1.6,ro=1.2,ut=(e,a,t)=>{const s=e.createShader(e.VERTEX_SHADER);e.shaderSource(s,gn),e.compileShader(s);const o=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(o,a),e.compileShader(o);const r=e.createProgram();e.attachShader(r,s),e.attachShader(r,o),e.bindAttribLocation(r,0,"aPosition"),e.linkProgram(r);const i=e.getProgramParameter(r,e.LINK_STATUS),l=i?"":e.getShaderInfoLog(o)||e.getProgramInfoLog(r);if(e.deleteShader(s),e.deleteShader(o),!i)throw e.deleteProgram(r),new Error(`Shape Magic surface shader failed: ${l}`);return{program:r,loc:Object.fromEntries(t.map(m=>[m,e.getUniformLocation(r,m)]))}},En=(e,a)=>{let t=0;for(;Math.min(e,a)/2**t>zn;)t+=1;const s=2**t;return{count:t+1,width:Math.ceil(e/s)*s,height:Math.ceil(a/s)*s}};function Sn(e,a){if(!e.getExtension("EXT_color_buffer_float"))return null;let t=null,s=[],o=null,r="";const i=()=>t||(t={init:ut(e,xn,["uSdf","uLength"]),upsample:ut(e,bn,["uCoarse","uSdf"]),relax:ut(e,yn,["uU","uSdf","uScreen","uOmega","uParity"]),gradient:ut(e,wn,["uU","uSdf","uUnit"]),dilate:ut(e,kn,["uSrc","uUnit"]),blur:ut(e,_n,["uSrc","uDir","uSigma"])},t),l=(p,u,P,T=e.NEAREST)=>{const z=e.createTexture();e.bindTexture(e.TEXTURE_2D,z);const M={r32:[e.R32F,e.RED],rgba32:[e.RGBA32F,e.RGBA],rgba16:[e.RGBA16F,e.RGBA]},[L,N]=M[P];e.texImage2D(e.TEXTURE_2D,0,L,p,u,0,N,e.FLOAT,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,T),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,T),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const _=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,_),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,z,0),{texture:z,fbo:_,width:p,height:u}},m=p=>{p&&(e.deleteFramebuffer(p.fbo),e.deleteTexture(p.texture))},c=()=>{s.forEach(p=>{m(p.sdf),p.u.forEach(m)}),o&&Object.values(o).forEach(m),s=[],o=null},d=(p,u,P)=>{const T=En(p,u),z=`${T.width}x${T.height}`;if(z!==r){c();for(let M=0;M<T.count;M++){const L=T.width/2**M,N=T.height/2**M;s.push({width:L,height:N,sdf:l(L,N,"r32"),u:[l(L,N,"r32"),l(L,N,"r32")]})}if(o={grad:l(T.width,T.height,"rgba32"),temp:l(T.width,T.height,"rgba32"),out:l(T.width,T.height,"rgba16",e.LINEAR)},r=z,e.bindFramebuffer(e.FRAMEBUFFER,s[0].sdf.fbo),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)return e.bindFramebuffer(e.FRAMEBUFFER,null),c(),r="",null}return s.forEach((M,L)=>{M.unit=P/2**L}),s.map(M=>({fbo:M.sdf.fbo,width:M.width,height:M.height,unit:M.unit}))},v=(p,u,P,T)=>{e.bindFramebuffer(e.FRAMEBUFFER,u.fbo),e.viewport(0,0,u.width,u.height),e.useProgram(p.program),P.forEach(([z,M],L)=>{e.activeTexture(e.TEXTURE0+L),e.bindTexture(e.TEXTURE_2D,M),e.uniform1i(p.loc[z],L)}),T==null||T(p.loc),e.drawArrays(e.TRIANGLE_STRIP,0,4)};return{prepare:d,run:p=>{const u=i();e.disable(e.BLEND),e.bindVertexArray(a);let P=null;for(let z=s.length-1;z>=0;z--){const M=s[z],L=Math.max(p,.75/M.unit),N=Math.max(p*M.unit,.75),_=1/(N*N);P?v(u.upsample,M.u[0],[["uCoarse",P.texture],["uSdf",M.sdf.texture]]):v(u.init,M.u[0],[["uSdf",M.sdf.texture]],ae=>e.uniform1f(ae.uLength,L));const U=z===s.length-1?ya.coarsest:z===0?ya.finest:ya.middle;let O=0;for(let ae=0;ae<U;ae++)for(let oe=0;oe<2;oe++)v(u.relax,M.u[1-O],[["uU",M.u[O].texture],["uSdf",M.sdf.texture]],pe=>{e.uniform1f(pe.uScreen,_),e.uniform1f(pe.uOmega,Tn),e.uniform1i(pe.uParity,oe)}),O=1-O;P=M.u[O]}const T=s[0];return v(u.gradient,o.grad,[["uU",P.texture],["uSdf",T.sdf.texture]],z=>e.uniform1f(z.uUnit,T.unit)),v(u.dilate,o.temp,[["uSrc",o.grad.texture]],z=>e.uniform1f(z.uUnit,T.unit)),v(u.dilate,o.grad,[["uSrc",o.temp.texture]],z=>e.uniform1f(z.uUnit,T.unit)),v(u.blur,o.temp,[["uSrc",o.grad.texture]],z=>{e.uniform2i(z.uDir,1,0),e.uniform1f(z.uSigma,ro)}),v(u.blur,o.out,[["uSrc",o.temp.texture]],z=>{e.uniform2i(z.uDir,0,1),e.uniform1f(z.uSigma,ro)}),e.bindFramebuffer(e.FRAMEBUFFER,null),{texture:o.out.texture,info:[T.unit/T.width,-T.unit/T.height,1,0]}},dispose:()=>{c(),t&&Object.values(t).forEach(p=>e.deleteProgram(p.program)),t=null}}}const zt=.1,Pn=.08,lo=1.2,Rn=[[1,0],[-1,0],[0,1],[0,-1]],An=[1,2,3,4].map(e=>Math.exp(-(e*e)/(2*lo*lo))),io=(e,a,t,s,o)=>{const r=e.slice();for(let i=0;i<t;i++)for(let l=0;l<a;l++){const m=(i*a+l)*4;if(r[m+3]<.25)continue;let c=r[m],d=r[m+1],v=r[m+2],x=1;for(let h=1;h<=4;h++)for(const p of[1,-1]){const u=Math.min(a-1,Math.max(0,l+s*h*p)),T=(Math.min(t-1,Math.max(0,i+o*h*p))*a+u)*4;if(r[T+3]<.25)continue;const z=An[h-1];c+=z*r[T],d+=z*r[T+1],v+=z*r[T+2],x+=z}e[m]=c/x,e[m+1]=d/x,e[m+2]=v/x}},Cn=(e,a,t)=>{const s=Math.max(1,Math.floor(a/2)),o=Math.max(1,Math.floor(t/2)),r=new Float32Array(s*o);for(let i=0;i<o;i++)for(let l=0;l<s;l++){const m=i*2*a+l*2,c=Math.min(l*2+1,a-1)-l*2,d=Math.min(i*2+1,t-1)-i*2;r[i*s+l]=(e[m]+e[m+c]+e[m+d*a]+e[m+d*a+c])*.25}return{data:r,width:s,height:o}},Mn=(e,a,t,s,o)=>{const r=new Float32Array(s*o);for(let i=0;i<o;i++){const l=Math.min(Math.max((i+.5)/2-.5,0),t-1),m=Math.floor(l),c=Math.min(m+1,t-1),d=l-m;for(let v=0;v<s;v++){const x=Math.min(Math.max((v+.5)/2-.5,0),a-1),h=Math.floor(x),p=Math.min(h+1,a-1),u=x-h,P=e[m*a+h]*(1-u)+e[m*a+p]*u,T=e[c*a+h]*(1-u)+e[c*a+p]*u;r[i*s+v]=P*(1-d)+T*d}}return r},Ln=(e,a,t,s)=>{const o=a*t,r=new Float32Array(o*4),i=new Float32Array(o),l=new Uint8Array(o);for(let c=0;c<o;c++)l[c]=e[c]<0?1:0;const m=(c,d)=>Math.max(zt,Math.min(1,e[c]/(e[c]-e[d])));for(let c=0;c<t;c++)for(let d=0;d<a;d++){const v=c*a+d;if(!l[v])continue;const x=d+1<a?v+1:-1,h=d>0?v-1:-1,p=c+1<t?v+a:-1,u=c>0?v-a:-1,P=x>=0&&l[x]?1:x>=0?m(v,x):zt,T=h>=0&&l[h]?1:h>=0?m(v,h):zt,z=p>=0&&l[p]?1:p>=0?m(v,p):zt,M=u>=0&&l[u]?1:u>=0?m(v,u):zt,L=2/(P+T),N=2/(z+M);r[v*4]=x>=0&&l[x]?L/P:0,r[v*4+1]=h>=0&&l[h]?L/T:0,r[v*4+2]=p>=0&&l[p]?N/z:0,r[v*4+3]=u>=0&&l[u]?N/M:0,i[v]=L*(1/P+1/T)+N*(1/z+1/M)+s}return{weights:r,diagonal:i,inside:l}},qn=(e,a,t,s,o,r,i)=>{const{weights:l,diagonal:m,inside:c}=s;for(let d=0;d<r;d++)for(let v=0;v<2;v++)for(let x=0;x<t;x++)for(let h=x+v&1;h<a;h+=2){const p=x*a+h;if(!c[p])continue;const u=p*4;let P=o;l[u]&&(P+=l[u]*e[p+1]),l[u+1]&&(P+=l[u+1]*e[p-1]),l[u+2]&&(P+=l[u+2]*e[p+a]),l[u+3]&&(P+=l[u+3]*e[p-a]),e[p]+=i*(P/m[p]-e[p])}},jn=(e,a,t,s)=>{const{data:o,width:r,height:i,unit:l}=e,m=Math.max(a*l,.75),c=1/(m*m),d=Ln(o,r,i,c),v=t||new Float32Array(r*i);if(t)for(let x=0;x<v.length;x++)d.inside[x]||(v[x]=0);else for(let x=0;x<v.length;x++)v[x]=o[x]<0?1-Math.exp(o[x]*l/m):0;return qn(v,r,i,d,c,s,1.6),v};function In(e,a){const{data:t,width:s,height:o,unit:r}=e,i=new Float32Array(t.length);for(let h=0;h<t.length;h++)i[h]=t[h];const l=[{data:i,width:s,height:o,unit:r}];for(;Math.min(l[l.length-1].width,l[l.length-1].height)>40;){const h=l[l.length-1],p=Cn(h.data,h.width,h.height);l.push({...p,unit:h.unit/2})}let m=null;for(let h=l.length-1;h>=0;h--){const p=l[h],u=l[h+1],P=m&&u?Mn(m,u.width,u.height,p.width,p.height):null;m=jn(p,a,P,h===l.length-1?60:h===0?14:10)}const c=new Float32Array(s*o*4),d=h=>i[h]<0,v=(h,p)=>Math.max(Pn,Math.min(1,i[h]/(i[h]-i[p]))),x=(h,p,u)=>{const P=p<0||d(p),T=u<0||d(u),z=p<0?m[h]:P?m[p]:0,M=u<0?m[h]:T?m[u]:0;if(P&&T)return(z-M)/2;const L=P?1:v(h,p),N=T?1:v(h,u);return(N*N*z-L*L*M-(N*N-L*L)*m[h])/(N*L*(N+L))};for(let h=0;h<o;h++)for(let p=0;p<s;p++){const u=h*s+p;d(u)&&(c[u*4]=m[u],c[u*4+1]=x(u,p+1<s?u+1:-1,p>0?u-1:-1)*r,c[u*4+2]=x(u,h+1<o?u+s:-1,h>0?u-s:-1)*r,c[u*4+3]=1)}for(let h=0;h<2;h++){const p=c.slice();for(let u=0;u<o;u++)for(let P=0;P<s;P++){const T=u*s+P;if(c[T*4+3]>.25)continue;let z=0,M=0,L=0,N=0;for(const[_,U]of Rn){const O=P+_,ae=u+U;if(O<0||ae<0||O>=s||ae>=o)continue;const oe=(ae*s+O)*4;c[oe+3]<.25||(z+=c[oe]-(c[oe+1]*_+c[oe+2]*U)/r,M+=c[oe+1],L+=c[oe+2],N+=1)}N&&(p[T*4]=z/N,p[T*4+1]=M/N,p[T*4+2]=L/N,p[T*4+3]=.5)}c.set(p)}return io(c,s,o,1,0),io(c,s,o,0,1),{data:c,width:s,height:o,unit:r}}const Fn={add:0,merge:1,cut:2,keep:3,exclude:4},Dn={none:0,lines:1,rings:2,rays:3,grid:4,dots:5,halftone:6},co={radial:0,row:1,column:2},Nn={none:0,solid:1,linear:2,radial:3,conic:4,logo:5,texture:6,material:7},Bn={none:0,color:1,linear:2},it=Math.PI/180,ot=(e,a=[1,1,1,1])=>{const t=Jo(e);return t?[t.r,t.g,t.b,t.a??1]:a},Un=(e,a,t)=>{const s=e.createShader(e.VERTEX_SHADER);e.shaderSource(s,a),e.compileShader(s);const o=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(o,t),e.compileShader(o);const r=e.createProgram();return e.attachShader(r,s),e.attachShader(r,o),e.bindAttribLocation(r,0,"aPosition"),e.linkProgram(r),{program:r,vs:s,fs:o}},$n=(e,{program:a,vs:t,fs:s})=>{const o=e.getProgramParameter(a,e.LINK_STATUS),r=o?"":e.getShaderInfoLog(s)||e.getShaderInfoLog(t)||e.getProgramInfoLog(a);if(e.deleteShader(t),e.deleteShader(s),!o)throw e.deleteProgram(a),new Error(`Shape Magic shader failed: ${r}`);return a},Gn=["uCountA","uCountB","uType","uA","uB","uXf","uRep","uMod","uPat","uPat2","uMarkA","uMarkB","uMorph","uMask0","uMask1","uMask2","uMask3","uMaskInfo","uLogoTex","uLogoLayer","uResolution","uCenter","uUnit","uEncode","uTime","uFill","uColor1","uColor2","uColor3","uOutline","uOutlineColor","uShadow","uShadowOffset","uShadowColor","uGlow","uGlowColor","uBevel","uMatTex","uSurfTex","uSurfInfo","uMatP","uMatC","uSurface","uBg","uBgColor1","uBgColor2"],On=(e,a={})=>{const t=a[e.id],o=e.type==="text"||e.type==="image"?t!==void 0?ta+t:-1:es[e.type]??0,[r,i]=an(e.type,e.params);return{type:o,a:r,b:i,xf:[e.x??0,e.y??0,Math.max(e.size??1,.001),(e.rotation??0)*it],rep:[Math.max(1,Math.round(e.repeat??1)),co[e.layout]?e.gap??2.3:(e.spin??0)*it,e.mirror?1:0,e.flip?1:0],mod:[e.round??0,e.outline??0,Fn[e.op]??0,ns(e)],pat:[Dn[e.pattern]??0,e.density??8,e.weight??.5,(e.patternAngle??0)*it],pat2:[e.bulge??0,e.taper??0,e.invert?1:0,co[e.layout]??0]}},Xn=e=>({type:new Int32Array(e*2),...Object.fromEntries(["a","b","xf","rep","mod","pat","pat2"].map(a=>[a,new Float32Array(e*8)]))});function Ut(e,{preserve:a=!1}={}){const t=e.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:a});if(!t)throw new Error("WebGL2 is not available.");const s=t.getExtension("KHR_parallel_shader_compile"),o=new Map,r=new Map;let i=null,l={},m=!1,c=ft();const d=(g,S=c)=>`${(g==null?void 0:g.id)||""}|${rn(S)}`,v=g=>{const S=o.get(g);return S&&(o.delete(g),o.set(g,S)),S},x=(g,S)=>{if(!r.size)for(const[W,J]of o){if(o.size<32)break;J!==i&&(t.deleteProgram(J.program),o.delete(W))}const C=g?ts(g.params):null,D=dn(g?{glsl:g.glsl,kind:g.kind,outside:!!g.outside,normals:g.normals!==!1,reach:g.reach,defines:C.defines}:null,{...S,bevel:g&&g.kind!=="fill"?g.normals!==!1:S.bevel});return{def:g,layout:C,variant:S,started:Un(t,ln,D)}},h=(g,S)=>{r.delete(g);const C=$n(t,S.started),D={program:C,layout:S.layout,def:S.def,capacity:S.variant.capacity,arrays:Xn(S.variant.capacity),loc:Object.fromEntries(Gn.map(W=>[W,t.getUniformLocation(C,W)]))};return o.set(g,D),D},p=(g,S)=>{const C=d(g,S);return v(C)||h(C,r.get(C)||x(g,S))},u=(g,S=c)=>{if(m)return Promise.reject(new Error("Renderer was disposed."));const C=d(g,S);if(o.has(C))return Promise.resolve(v(C));if(r.has(C))return r.get(C).promise;const D=x(g,S);return D.promise=new Promise((W,J)=>{const k=()=>{if(o.has(C)){W(o.get(C));return}if(m||r.get(C)!==D||t.isContextLost()){J(new Error("Shader compile was cancelled."));return}if(s&&!t.getProgramParameter(D.started.program,s.COMPLETION_STATUS_KHR)){setTimeout(k,16);return}try{W(h(C,D))}catch(R){J(R)}};setTimeout(k,0)}),r.set(C,D),D.promise},P=(g,S)=>{i=p(g,S),l=i.loc,le=i.arrays,t.useProgram(i.program)},T=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,T),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),t.STATIC_DRAW);const z=t.createVertexArray();t.bindVertexArray(z),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0);const M=Sn(t,z),L=t.getExtension("EXT_texture_filter_anisotropic"),N=()=>{const g=t.createTexture();return t.bindTexture(t.TEXTURE_2D,g),t.texImage2D(t.TEXTURE_2D,0,t.R16F,1,1,0,t.RED,t.FLOAT,new Float32Array([1])),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),g},_=Array.from({length:Ve},()=>({texture:N(),info:[1,1,0,0],key:null,color:null})),U=t.createTexture();t.bindTexture(t.TEXTURE_2D,U),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,1,1,0,t.RGBA,t.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));let O=-1,ae=U;const oe=[0,0,0,0],pe=t.createTexture(),ge=g=>{if(t.bindTexture(t.TEXTURE_2D,pe),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),!g){t.texImage2D(t.TEXTURE_2D,0,t.RGBA16F,1,1,0,t.RGBA,t.FLOAT,new Float32Array(4));return}t.pixelStorei(t.UNPACK_ALIGNMENT,1),t.texImage2D(t.TEXTURE_2D,0,t.RGBA16F,g.width,g.height,0,t.RGBA,t.FLOAT,g.data)};ge(null);let ue={key:"",ready:!1,texture:pe,info:oe},ee=!1;const ne=t.createTexture(),re=g=>{if(t.bindTexture(t.TEXTURE_2D,ne),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.MIRRORED_REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.MIRRORED_REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),!g){t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,1,1,0,t.RGBA,t.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR);return}if(t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,t.RGBA,t.UNSIGNED_BYTE,g),t.generateMipmap(t.TEXTURE_2D),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),L){const S=t.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT);t.texParameterf(t.TEXTURE_2D,L.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,S))}};re(null);let le=null,se=null;const he=(g,S)=>{const C=_[g];if(C){if(!S){C.info=[1,1,0,0],C.key=null,C.color&&(t.deleteTexture(C.color),C.color=null),t.bindTexture(t.TEXTURE_2D,C.texture),t.texImage2D(t.TEXTURE_2D,0,t.R16F,1,1,0,t.RED,t.FLOAT,new Float32Array([1]));return}C.key!==S.key&&S.data&&(t.bindTexture(t.TEXTURE_2D,C.texture),t.pixelStorei(t.UNPACK_ALIGNMENT,1),t.texImage2D(t.TEXTURE_2D,0,t.R16F,S.width,S.height,0,t.RED,t.FLOAT,S.data),C.info=[S.halfW,S.halfH,0,0],C.key=S.key,C.color&&(t.deleteTexture(C.color),C.color=null),S.color&&(C.color=t.createTexture(),t.bindTexture(t.TEXTURE_2D,C.color),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,t.RGBA,t.UNSIGNED_BYTE,S.color),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)))}},Te=(g,S,C)=>{const D=Ra(g);return D.forEach((W,J)=>{var A;const k=S+J,R=On(W,C);if(S===0&&O<0&&W.type==="image"&&C[W.id]!==void 0){const q=(A=_[C[W.id]])==null?void 0:A.color;q&&(O=k,ae=q)}le.type[k]=R.type,le.a.set(R.a,k*4),le.b.set(R.b,k*4),le.xf.set(R.xf,k*4),le.rep.set(R.rep,k*4),le.mod.set(R.mod,k*4),le.pat.set(R.pat,k*4),le.pat2.set(R.pat2,k*4)}),D.length},qe=g=>[Math.max((g==null?void 0:g.scale)??1,.001),((g==null?void 0:g.rotation)??0)*it,(g==null?void 0:g.x)??0,(g==null?void 0:g.y)??0],we=({a:g,b:S=null,morph:C=0,maskSlots:D={}})=>{O=-1,ae=U;const W=Te(g,0,D),J=S?Te(S,i.capacity,D):0;t.uniform1i(l.uCountA,W),t.uniform1i(l.uCountB,J),t.uniform1iv(l.uType,le.type),t.uniform4fv(l.uA,le.a),t.uniform4fv(l.uB,le.b),t.uniform4fv(l.uXf,le.xf),t.uniform4fv(l.uRep,le.rep),t.uniform4fv(l.uMod,le.mod),t.uniform4fv(l.uPat,le.pat),t.uniform4fv(l.uPat2,le.pat2),t.uniform4fv(l.uMarkA,qe(g)),t.uniform4fv(l.uMarkB,qe(S||g)),t.uniform1f(l.uMorph,S?C:0);const k=new Float32Array(Ve*4);_.forEach((R,A)=>{t.activeTexture(t.TEXTURE0+A),t.bindTexture(t.TEXTURE_2D,R.texture),t.uniform1i(l[`uMask${A}`],A),k.set(R.info,A*4)}),t.uniform4fv(l.uMaskInfo,k),t.activeTexture(t.TEXTURE0+Ve),t.bindTexture(t.TEXTURE_2D,ae),t.uniform1i(l.uLogoTex,Ve),t.uniform1i(l.uLogoLayer,O),t.activeTexture(t.TEXTURE0+Ve+1),t.bindTexture(t.TEXTURE_2D,ne),t.uniform1i(l.uMatTex,Ve+1),t.activeTexture(t.TEXTURE0+Ve+2),t.bindTexture(t.TEXTURE_2D,ee?ue.texture:pe),t.uniform1i(l.uSurfTex,Ve+2),t.uniform4fv(l.uSurfInfo,ee?ue.info:oe)},We=(g={})=>{const S=g.fill||{kind:"solid",color1:"#ffffff"},C=Nn[S.kind]??1;t.uniform4fv(l.uFill,[C,(S.angle??0)*it,S.extent??1,S.stops===3?1:0]),t.uniform4fv(l.uColor1,ot(S.color1??"#ffffff")),t.uniform4fv(l.uColor2,ot(S.color2??S.color1??"#ffffff")),t.uniform4fv(l.uColor3,ot(S.color3??S.color2??"#ffffff"));const D=g.outline||{};t.uniform4fv(l.uOutline,[D.on?1:0,D.width??.04,D.mode==="center"?1:0,0]),t.uniform4fv(l.uOutlineColor,ot(D.color??"#000000"));const W=g.shadow||{};t.uniform4fv(l.uShadow,[W.on?W.opacity??.35:0,W.blur??.12,0,0]),t.uniform4fv(l.uShadowOffset,[W.x??0,W.y??.08,0,0]),t.uniform4fv(l.uShadowColor,ot(W.color??"#000000"));const J=g.glow||{};t.uniform4fv(l.uGlow,[J.on?J.intensity??.8:0,J.radius??.12,0,0]),t.uniform4fv(l.uGlowColor,ot(J.color??S.color1??"#ffffff"));const k=g.gloss||{};t.uniform4fv(l.uBevel,[k.strength??.25,(k.angle??225)*it,k.on?Math.max(k.bevel??.4,.005):0,k.bend??2.5]);const R=g.material;if(i.def){const q=i.def,G=(R==null?void 0:R.values)||{},$=nn(i.layout,G);t.uniform4fv(l.uMatP,$.floats),t.uniform4fv(l.uMatC,$.colors);const te=typeof q.surface=="string"?q.params.find(me=>me.name===q.surface):null,ie=typeof q.surface=="number"?q.surface:G[q.surface]??(te==null?void 0:te.default)??.2;t.uniform4fv(l.uSurface,[Number(ie)||.2,0,0,0])}const A=g.background||{kind:"none"};t.uniform4fv(l.uBg,[Bn[A.kind]??0,(A.angle??180)*it,A.extent??1,0]),t.uniform4fv(l.uBgColor1,ot(A.color1??"#000000",[0,0,0,1])),t.uniform4fv(l.uBgColor2,ot(A.color2??A.color1??"#000000",[0,0,0,1]))},Fe=({width:g,height:S,unit:C,center:D,encode:W=!1,time:J=0})=>{t.uniform2f(l.uResolution,g,S),t.uniform2f(l.uCenter,(D==null?void 0:D[0])??g/2,(D==null?void 0:D[1])??S/2),t.uniform1f(l.uUnit,C??Math.min(g,S)/2),t.uniform1f(l.uEncode,Number(W)||0),t.uniform1f(l.uTime,J),t.viewport(0,0,g,S),t.disable(t.BLEND),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.bindVertexArray(z),t.drawArrays(t.TRIANGLE_STRIP,0,4)},Ke=(g,S,C,D,W)=>{const J=Math.min(1,W/Math.max(C,D)),k=Math.max(16,Math.round(C*J)),R=Math.max(16,Math.round(D*J)),A=JSON.stringify([g.a,g.b||null,g.b?g.morph:0,g.maskSlots||{},_.map(me=>me.key),k,R,S]);if(A===ue.key)return ue.ready;ee=!1;const q=M==null?void 0:M.prepare(k,R,Math.min(k,R)/2);if(q){P(null,ft(g)),we(g),q.forEach(ye=>{t.bindFramebuffer(t.FRAMEBUFFER,ye.fbo),Fe({width:ye.width,height:ye.height,unit:ye.unit,center:[ye.width/2,ye.height/2],encode:2})});const me=M.run(S);return ue={key:A,ready:!0,texture:me.texture,info:me.info},!0}if(g.b)return ue={key:A,ready:!1,texture:pe,info:oe},!1;const G=288,$=Math.max(16,Math.round(C>=D?G:G*C/D)),te=Math.max(16,Math.round(C>=D?G*D/C:G)),ie=In(Ee({scene:g,width:$,height:te}),S);return ge(ie),ue={key:A,ready:!0,texture:pe,info:[ie.unit/$,ie.unit/te,1,0]},!0},De=({scene:g,style:S,width:C,height:D,unit:W,center:J,time:k=0,surfaceResolution:R=768})=>{var q;(e.width!==C||e.height!==D)&&(e.width=C,e.height=D);const A=S==null?void 0:S.gloss;ee=!!(A!=null&&A.on&&Ke(g,Math.max(A.bevel??.4,.005),C,D,R)),t.bindFramebuffer(t.FRAMEBUFFER,null),P(((q=S==null?void 0:S.material)==null?void 0:q.def)||null,ft(g,S)),we(g),We(S),Fe({width:C,height:D,unit:W,center:J,time:k})},ve=(g,S)=>{if(se&&se.width===g&&se.height===S)return se;se&&(t.deleteFramebuffer(se.fbo),t.deleteTexture(se.texture));const C=t.createTexture();t.bindTexture(t.TEXTURE_2D,C),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,g,S,0,t.RGBA,t.UNSIGNED_BYTE,null),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST);const D=t.createFramebuffer();return t.bindFramebuffer(t.FRAMEBUFFER,D),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,C,0),se={fbo:D,texture:C,width:g,height:S},se},Ee=({scene:g,width:S,height:C,unit:D,center:W})=>{const J=ve(S,C);t.bindFramebuffer(t.FRAMEBUFFER,J.fbo),P(null,ft(g)),we(g),Fe({width:S,height:C,unit:D,center:W,encode:!0});const k=new Uint8Array(S*C*4);t.readPixels(0,0,S,C,t.RGBA,t.UNSIGNED_BYTE,k),t.bindFramebuffer(t.FRAMEBUFFER,null);const R=new Float32Array(S*C);for(let A=0;A<C;A++){const q=(C-1-A)*S;for(let G=0;G<S;G++){const $=(q+G)*4,te=(k[$]*65536+k[$+1]*256+k[$+2])/16777215;R[A*S+G]=(te-.5)*os}}return{data:R,width:S,height:C,unit:D??Math.min(S,C)/2,center:W??[S/2,C/2]}};return{gl:t,draw:De,readField:Ee,setMask:he,setMaterialTexture:re,prepare:g=>u(g||null),prepareAsync:u,prepareScene:(g,S={})=>{var W,J;const C=ft(g,S);c=C;const D=[u(((W=S.material)==null?void 0:W.def)||null,C)];return(J=S.gloss)!=null&&J.on&&D.push(u(null,ft(g))),Promise.all(D)},isReady:g=>o.has(d(g)),dispose:()=>{m=!0,_.forEach(g=>{t.deleteTexture(g.texture),g.color&&t.deleteTexture(g.color)}),t.deleteTexture(U),se&&(t.deleteFramebuffer(se.fbo),t.deleteTexture(se.texture)),t.deleteTexture(ne),t.deleteTexture(pe),M==null||M.dispose(),t.deleteBuffer(T),t.deleteVertexArray(z),o.forEach(g=>t.deleteProgram(g.program)),o.clear(),r.forEach(g=>{t.deleteProgram(g.started.program),t.deleteShader(g.started.vs),t.deleteShader(g.started.fs)}),r.clear()}}}const qt=1e20,Ma=896,Hn=.14,mo=(e,a,t,s,o,r,i)=>{for(let c=0;c<s;c++)o[c]=e[a+c*t];const l=(c,d)=>(o[c]+c*c-(o[d]+d*d))/(2*c-2*d);let m=0;r[0]=0,i[0]=-qt,i[1]=qt;for(let c=1;c<s;c++){let d=l(c,r[m]);for(;d<=i[m];)m--,d=l(c,r[m]);m++,r[m]=c,i[m]=d,i[m+1]=qt}m=0;for(let c=0;c<s;c++){for(;i[m+1]<c;)m++;const d=c-r[m];e[a+c*t]=d*d+o[r[m]]}},fo=(e,a,t)=>{const s=Math.max(a,t),o=new Float64Array(s),r=new Uint16Array(s),i=new Float64Array(s+1);for(let l=0;l<a;l++)mo(e,l,a,t,o,r,i);for(let l=0;l<t;l++)mo(e,l*a,1,a,o,r,i)};function ms(e,a,t){const s=a*t,o=new Float64Array(s),r=new Float64Array(s);for(let c=0;c<s;c++){const d=e[c]/255;if(d>=1)o[c]=0,r[c]=qt;else if(d<=0)o[c]=qt,r[c]=0;else{const v=.5-d;o[c]=v>0?v*v:0,r[c]=v<0?v*v:0}}fo(o,a,t),fo(r,a,t);const i=Math.max(a,t),l=2/i,m=new Float32Array(s);for(let c=0;c<s;c++)m[c]=(Math.sqrt(o[c])-Math.sqrt(r[c]))*l;return{data:m,width:a,height:t,halfW:a/i,halfH:t/i}}const fs=(e,a)=>{const t=Math.max(e,a),s=Math.round(t*Hn),o=document.createElement("canvas");return o.width=e+s*2,o.height=a+s*2,{canvas:o,pad:s}},us=e=>{const t=e.getContext("2d",{willReadFrequently:!0}).getImageData(0,0,e.width,e.height).data,s=new Uint8ClampedArray(e.width*e.height);for(let o=0;o<s.length;o++)s[o]=t[o*4+3];return s},Vn=(e,a,t)=>{const s=e.getImageData(0,0,a,t),o=s.data;let r=!0;for(let d=3;d<o.length;d+=4)if(o[d]<250){r=!1;break}if(!r)return;const l=[0,a-1,(t-1)*a,t*a-1].map(d=>[o[d*4],o[d*4+1],o[d*4+2]]).reduce((d,v)=>d.map((x,h)=>x+v[h]/4),[0,0,0]);let m=0;for(let d=0;d<o.length;d+=4){const v=Math.hypot(o[d]-l[0],o[d+1]-l[1],o[d+2]-l[2]);v>m&&(m=v)}const c=Math.max(24,m*.5);for(let d=0;d<o.length;d+=4){const v=Math.hypot(o[d]-l[0],o[d+1]-l[1],o[d+2]-l[2]);o[d+3]=Math.round(Math.min(1,Math.max(0,(v-c*.5)/(c*.5)))*255)}e.putImageData(s,0,0)},Yn=e=>{const a=e.getContext("2d",{willReadFrequently:!0}),{width:t,height:s}=e,o=a.getImageData(0,0,t,s).data;let r=t,i=s,l=-1,m=-1;for(let c=0;c<s;c++)for(let d=0;d<t;d++)o[(c*t+d)*4+3]>8&&(d<r&&(r=d),d>l&&(l=d),c<i&&(i=c),c>m&&(m=c));return l<0?null:{x:r,y:i,width:l-r+1,height:m-i+1}};async function Wn(e,a){const t=new Image;t.decoding="async",t.src=e,await t.decode();const s=t.naturalWidth||512,o=t.naturalHeight||512,r=Ma/Math.max(s,o),i=Math.max(1,Math.round(s*r)),l=Math.max(1,Math.round(o*r)),m=document.createElement("canvas");m.width=i,m.height=l;const c=m.getContext("2d",{willReadFrequently:!0});c.drawImage(t,0,0,i,l),Vn(c,i,l);const d=Yn(m);if(!d)throw new Error("That image looks empty.");const v=Ma/Math.max(d.width,d.height),x=Math.max(1,Math.round(d.width*Math.min(v,1.6))),h=Math.max(1,Math.round(d.height*Math.min(v,1.6))),{canvas:p,pad:u}=fs(x,h),P=p.getContext("2d",{willReadFrequently:!0});return P.imageSmoothingQuality="high",P.drawImage(m,d.x,d.y,d.width,d.height,u,u,x,h),{...ms(us(p),p.width,p.height),key:a,aspect:x/h,color:p}}async function Kn({text:e,font:a="Geist",weight:t=700,tracking:s=0,key:o}){var N;const r=String(e||"").trim()||"Aa",i=360,l=`${t} ${i}px "${a}"`;try{await((N=document.fonts)==null?void 0:N.load(l,r))}catch{await Promise.resolve()}const m=document.createElement("canvas").getContext("2d");m.font=l,m.letterSpacing=`${s*i}px`;const c=m.measureText(r),d=Math.ceil(c.actualBoundingBoxAscent??i*.8),v=Math.ceil(c.actualBoundingBoxDescent??i*.2),x=Math.ceil(c.actualBoundingBoxLeft??0),h=Math.ceil(c.actualBoundingBoxRight??c.width),p=Math.max(1,x+h),u=Math.max(1,d+v),P=Math.min(1,Ma/Math.max(p,u)),{canvas:T,pad:z}=fs(Math.round(p*P),Math.round(u*P)),M=T.getContext("2d",{willReadFrequently:!0});return M.scale(P,P),M.font=l,M.letterSpacing=`${s*i}px`,M.fillStyle="#000",M.textBaseline="alphabetic",M.fillText(r,z/P+x,z/P+d),{...ms(us(T),T.width,T.height),key:o,aspect:p/u}}const jt=new Map,Tt=new Map,wa=new Map,Zn=e=>{const a=Lt.find(s=>s.value===e);if(!(a!=null&&a.google)||typeof document>"u")return Promise.resolve();if(wa.has(e))return wa.get(e);const t=new Promise(s=>{const o=document.createElement("link");o.rel="stylesheet",o.href=`https://fonts.googleapis.com/css2?family=${a.google}&display=block`,o.onload=()=>s(),o.onerror=()=>s(),document.head.appendChild(o)});return wa.set(e,t),t},ds=e=>jt.get(e)||null,Dt=e=>{const a=Na(e);if(!a)return Promise.resolve(null);if(jt.has(a))return Promise.resolve(jt.get(a));if(Tt.has(a))return Tt.get(a);const t=(async()=>{if(e.type==="text"){const s=e.text||{};return await Zn(s.font),Kn({text:s.value,font:s.font,weight:s.weight,tracking:s.tracking,key:a})}return Wn(e.image.src,a)})().then(s=>(jt.set(a,s),Tt.delete(a),s)).catch(s=>{throw Tt.delete(a),s});return Tt.set(a,t),t},st=e=>{const a=[],t={};return e.filter(Boolean).flat().filter(s=>s&&bt(s)&&s.visible!==!1).forEach(s=>{const o=Na(s);let r=a.indexOf(o);r<0&&a.length<Ve&&(a.push(o),r=a.length-1),r>=0&&(t[s.id]=r)}),{keys:a,slots:t}},$t=(e,a)=>{for(let t=0;t<Ve;t++)e.setMask(t,a[t]?ds(a[t]):null)},ps=e=>e.every(a=>jt.has(a)),Jn=650,Qn=(e,a)=>{switch(a.type){case"set":{const t=typeof a.update=="function"?a.update(e.present):a.update;if(t===e.present)return e;const s=Date.now();return{past:a.key&&a.key===e.key&&s-e.at<Jn?e.past:[...e.past,e.present].slice(-120),present:t,future:[],key:a.key||null,at:s}}case"replace":{const t=typeof a.value=="function"?a.value(e.present):a.value;return t===e.present?e:{...e,present:t,key:null}}case"undo":{if(!e.past.length)return e;const t=e.past[e.past.length-1];return{past:e.past.slice(0,-1),present:t,future:[e.present,...e.future],key:null,at:0}}case"redo":{if(!e.future.length)return e;const[t,...s]=e.future;return{past:[...e.past,e.present],present:t,future:s,key:null,at:0}}default:return e}};function er(e){const[a,t]=w.useReducer(Qn,void 0,()=>({past:[],present:typeof e=="function"?e():e,future:[],key:null,at:0})),s=w.useCallback((l,m)=>t({type:"set",update:l,key:m}),[]),o=w.useCallback(l=>t({type:"replace",value:l}),[]),r=w.useCallback(()=>t({type:"undo"}),[]),i=w.useCallback(()=>t({type:"redo"}),[]);return{doc:a.present,set:s,replace:o,undo:r,redo:i,canUndo:a.past.length>0,canRedo:a.future.length>0}}const uo=e=>e*e*(3-2*e),tr=e=>(Math.max(0,e.hold??.8)+Math.max(.05,e.duration??1.6))*2,hs=(e,a)=>{const t=Math.max(0,a.hold??.8),s=Math.max(.05,a.duration??1.6),o=(t+s)*2,r=(e%o+o)%o;return r<t?0:r<t+s?uo((r-t)/s):r<t*2+s?1:1-uo((r-t*2-s)/s)},ar=[{id:"m-lines",label:"Lines"},{id:"m-dots",label:"Dots"},{id:"m-rays",label:"Grids & rays"},{id:"m-arcs",label:"Arcs"},{id:"m-forms",label:"Forms"},{id:"m-type",label:"Type"}],vs=[{id:"m-latitude",name:"Latitude",group:"m-lines",tags:["sphere","planet","globe","stripes"],ink:!0,mark:{layers:[{type:"circle",size:.8842,pattern:"lines",density:11,weight:.55,patternAngle:18,bulge:1},{type:"circle",size:.84,op:"keep",smooth:0}]}},{id:"m-diagonal",name:"Diagonal",group:"m-lines",tags:["stripes","disc","diagonal","motion"],ink:!0,mark:{layers:[{type:"circle",size:.84,pattern:"lines",density:9,weight:.5,patternAngle:135}]}},{id:"m-fade",name:"Fade",group:"m-lines",tags:["bars","gradient","disc","rhythm"],ink:!0,mark:{layers:[{type:"circle",size:.84,rotation:180,pattern:"lines",density:9,weight:.84,patternAngle:90,taper:.85}]}},{id:"m-weave",name:"Weave",group:"m-lines",tags:["quadrants","basket","stripes","textile"],ink:!0,mark:{layers:[{type:"pie",params:{sweep:90,roundness:0},size:.84,rotation:45,repeat:2,pattern:"lines",density:10,weight:.5,patternAngle:135,invert:!0},{type:"pie",params:{sweep:90,roundness:0},size:.84,rotation:135,repeat:2,pattern:"lines",density:10,weight:.5,patternAngle:135,invert:!0},{type:"cross",params:{thickness:.1,roundness:0,inner:0},size:.84,op:"cut",smooth:0}]}},{id:"m-shift",name:"Shift",group:"m-lines",tags:["stripes","op art","offset","disc"],ink:!0,mark:{layers:[{type:"pie",params:{sweep:180,roundness:0},size:.875,pattern:"lines",density:13,weight:.5},{type:"pie",params:{sweep:180,roundness:0},size:.875,rotation:180,pattern:"lines",density:13,weight:.5,invert:!0},{type:"circle",size:.84,op:"keep",smooth:0}]}},{id:"m-quarter",name:"Quarter",group:"m-lines",tags:["quarter","corner","stripes","fan"],ink:!0,mark:{layers:[{type:"pie",params:{sweep:90,roundness:0},x:-.76,y:.76,size:1.52,rotation:135,pattern:"lines",density:10,weight:.5,patternAngle:90,invert:!0}]}},{id:"m-pills",name:"Pills",group:"m-lines",tags:["bars","stack","disc","sun"],ink:!0,mark:{layers:[{type:"box",params:{width:1,height:.1848,roundness:1},y:-.72,size:.3517},{type:"box",params:{width:1,height:.0965,roundness:1},y:-.48,size:.6735},{type:"box",params:{width:1,height:.0811,roundness:1},y:-.24,size:.8019},{type:"box",params:{width:1,height:.0774,roundness:1},size:.84},{type:"box",params:{width:1,height:.0811,roundness:1},y:.24,size:.8019},{type:"box",params:{width:1,height:.0965,roundness:1},y:.48,size:.6735},{type:"box",params:{width:1,height:.1848,roundness:1},y:.72,size:.3517}]}},{id:"m-zed",name:"Zed",group:"m-lines",tags:["z","letter","stripes","speed"],ink:!0,mark:{layers:[{type:"box",params:{width:1,height:.1818,roundness:0},y:-.6055,size:.74},{type:"box",params:{width:1,height:.1818,roundness:0},y:.6055,size:.74},{type:"box",params:{width:1,height:.1307,roundness:0},size:1.1942,rotation:137.2821},{type:"box",params:{width:1,height:1,roundness:0},size:.74,pattern:"lines",density:11,weight:.56,op:"keep",smooth:0}]}},{id:"m-peak",name:"Peak",group:"m-lines",tags:["mountain","triangle","stripes","summit"],ink:!0,mark:{layers:[{type:"triangle",params:{width:.6111,roundness:0},y:-.02,size:.84,pattern:"lines",density:11,weight:.72,patternAngle:180,taper:.6}]}},{id:"m-zigzag",name:"Zigzag",group:"m-lines",tags:["zigzag","chevron","mountains","energy"],ink:!0,mark:{layers:[{type:"chevron",params:{angle:90,thickness:.25,roundness:0},x:.26,y:-.36,size:.52,mirror:!0},{type:"chevron",params:{angle:90,thickness:.25,roundness:0},x:.26,size:.52,mirror:!0},{type:"chevron",params:{angle:90,thickness:.25,roundness:0},x:.26,y:.36,size:.52,mirror:!0}]}},{id:"m-halftone",name:"Halftone",group:"m-dots",tags:["dots","sphere","print","gradient"],ink:!0,mark:{layers:[{type:"circle",size:.84,pattern:"halftone",density:11,weight:.95,taper:.72}]}},{id:"m-dot-globe",name:"Dot globe",group:"m-dots",tags:["dots","sphere","globe","planet"],ink:!0,mark:{layers:[{type:"circle",y:-.7576,size:.05,repeat:5,layout:"row",gap:2.638},{type:"circle",y:-.5798,size:.0774,repeat:5,layout:"row",gap:3.2448},{type:"circle",y:-.3138,size:.1012,repeat:5,layout:"row",gap:3.2448},{type:"circle",size:.1095,repeat:5,layout:"row",gap:3.2448},{type:"circle",y:.3138,size:.1012,repeat:5,layout:"row",gap:3.2448},{type:"circle",y:.5798,size:.0774,repeat:5,layout:"row",gap:3.2448},{type:"circle",y:.7576,size:.05,repeat:5,layout:"row",gap:2.638}]}},{id:"m-dot-fade",name:"Dot fade",group:"m-dots",tags:["dots","gradient","grid","fade"],ink:!0,mark:{layers:[{type:"box",params:{width:1,height:1,roundness:0},size:.72,pattern:"dots",density:7,weight:.9,taper:.9}]}},{id:"m-dot-diamond",name:"Dot diamond",group:"m-dots",tags:["dots","diamond","sparkle","star"],ink:!0,mark:{layers:[{type:"box",params:{width:1,height:1,roundness:0},size:.62,rotation:45,pattern:"halftone",density:7,weight:.95,taper:.6}]}},{id:"m-dot-ring",name:"Dot ring",group:"m-dots",tags:["dots","ring","circle","loop"],ink:!0,mark:{layers:[{type:"circle",x:.68,size:.15,repeat:8}]}},{id:"m-dot-burst",name:"Dot burst",group:"m-dots",tags:["dots","radial","bloom","firework"],ink:!0,mark:{layers:[{type:"circle",size:.13},{type:"circle",x:.33,size:.09,repeat:6},{type:"circle",x:.56,size:.066,repeat:12,spin:15},{type:"circle",x:.78,size:.05,repeat:16,spin:11.25}]}},{id:"m-bonds",name:"Bonds",group:"m-dots",tags:["dots","network","molecule","diamond"],ink:!0,mark:{layers:[{type:"circle",x:.64,size:.15,repeat:4},{type:"diamond",params:{width:1,height:1,roundness:0},size:.64,outline:.036}]}},{id:"m-trio",name:"Trio",group:"m-dots",tags:["molecule","atom","dots","science"],ink:!0,mark:{layers:[{type:"circle",y:-.14,size:.3},{type:"circle",x:.4728,y:.2294,size:.17,mirror:!0},{type:"box",params:{width:1,height:.1167,roundness:0},x:.2364,y:.0447,size:.3,rotation:38,mirror:!0}]}},{id:"m-meridian",name:"Meridian",group:"m-rays",tags:["globe","world","grid","sphere"],ink:!0,mark:{layers:[{type:"circle",size:.84,pattern:"grid",density:6,weight:.3,bulge:1},{type:"ring",params:{thickness:.05},size:.84}]}},{id:"m-flag",name:"Flag",group:"m-rays",tags:["grid","flag","wave","mesh"],ink:!0,mark:{layers:[{type:"wave",params:{waves:1,amplitude:.5,thickness:.5},size:1.04,outline:.025},{type:"wave",params:{waves:1,amplitude:.5,thickness:.2857},size:.91,outline:.025},{type:"wave",params:{waves:1,amplitude:.5,thickness:.0621},size:.805},{type:"wave",params:{waves:1,amplitude:.5,thickness:.5},size:1.04,pattern:"lines",density:8,weight:.1923,patternAngle:90},{type:"box",params:{width:.805,height:1,roundness:0},size:1,op:"keep",smooth:0}]}},{id:"m-sunburst",name:"Sunburst",group:"m-rays",tags:["sun","rays","burst","radiant"],ink:!0,mark:{layers:[{type:"circle",size:.84,pattern:"rays",density:28,weight:.5},{type:"circle",size:.2,op:"cut",smooth:0}]}},{id:"m-petals",name:"Petals",group:"m-rays",tags:["flower","petals","bloom","radial"],ink:!0,mark:{layers:[{type:"leaf",params:{width:.2,roundness:0},x:.48,size:.36,rotation:90,repeat:16}]}},{id:"m-fan",name:"Fan",group:"m-rays",tags:["rays","quarter","corner","spotlight"],ink:!0,mark:{layers:[{type:"pie",params:{sweep:90,roundness:0},x:-.76,y:.76,size:1.52,rotation:135,pattern:"rays",density:28,weight:.5},{type:"pie",params:{sweep:90,roundness:0},x:-.76,y:.76,size:.42,rotation:135,op:"cut",smooth:0}]}},{id:"m-hourglass",name:"Hourglass",group:"m-rays",tags:["rays","time","bowtie","focus"],ink:!0,mark:{layers:[{type:"box",params:{width:1,height:1,roundness:0},size:.74,pattern:"rays",density:28,weight:.5},{type:"pie",params:{sweep:90,roundness:0},size:1.2,rotation:90,repeat:2,op:"keep",smooth:0},{type:"circle",size:.1,op:"cut",smooth:0}]}},{id:"m-aperture",name:"Aperture",group:"m-rays",tags:["camera","shutter","lens","photo"],ink:!0,mark:{layers:[{type:"circle",size:.8},{type:"box",params:{width:.0428,height:1,roundness:0},x:.25,y:.4153,size:.5847,repeat:6,op:"cut",smooth:0},{type:"polygon",params:{sides:6,roundness:0},size:.2887,op:"cut",smooth:0}]}},{id:"m-sunrise",name:"Sunrise",group:"m-arcs",tags:["rainbow","sun","horizon","arch"],ink:!0,mark:{layers:[{type:"arc",params:{sweep:180,thickness:.6667,roundness:0},y:.425,size:.9,pattern:"rings",density:9,weight:.5},{type:"pie",params:{sweep:180,roundness:0},y:.425,size:.25,rotation:90}]}},{id:"m-corner",name:"Corner",group:"m-arcs",tags:["rainbow","quarter","signal","radio"],ink:!0,mark:{layers:[{type:"arc",params:{sweep:90,thickness:.6667,roundness:0},x:-.755,y:.755,size:1.5988,rotation:45,pattern:"rings",density:9,weight:.5},{type:"pie",params:{sweep:90,roundness:0},x:-.755,y:.755,size:.4441,rotation:135}]}},{id:"m-arch",name:"Arch",group:"m-arcs",tags:["arch","gate","lines","parallel"],ink:!0,mark:{layers:[{type:"box",params:{width:.6522,height:1,roundness:1},y:.4,size:1.15,outline:.05},{type:"box",params:{width:.5789,height:1,roundness:1},y:.4,size:.95,outline:.05},{type:"box",params:{width:.4667,height:1,roundness:1},y:.4,size:.75,outline:.05},{type:"box",params:{width:.2727,height:1,roundness:1},y:.4,size:.55,outline:.05},{type:"box",params:{width:1,height:.3231,roundness:0},y:1.2,size:1.3,op:"cut",smooth:0}]}},{id:"m-hook",name:"Hook",group:"m-arcs",tags:["j","hook","lines","parallel"],ink:!0,mark:{layers:[{type:"box",params:{width:.6522,height:1,roundness:1},y:-.4,size:1.15,outline:.05},{type:"box",params:{width:.5789,height:1,roundness:1},y:-.4,size:.95,outline:.05},{type:"box",params:{width:.4667,height:1,roundness:1},y:-.4,size:.75,outline:.05},{type:"box",params:{width:.2727,height:1,roundness:1},y:-.4,size:.55,outline:.05},{type:"box",params:{width:1,height:.3231,roundness:0},y:-1.2,size:1.3,op:"cut",smooth:0},{type:"box",params:{width:1,height:.8,roundness:0},x:-.5,y:-.6,size:.5,op:"cut",smooth:0}]}},{id:"m-shell",name:"Shell",group:"m-arcs",tags:["shell","fan","arcs","nautilus"],ink:!0,mark:{layers:[{type:"arc",params:{sweep:180,thickness:.1176,roundness:0},y:.425,size:.85},{type:"arc",params:{sweep:180,thickness:.1538,roundness:0},x:-.2,y:.425,size:.65},{type:"arc",params:{sweep:180,thickness:.2222,roundness:0},x:-.4,y:.425,size:.45},{type:"arc",params:{sweep:180,thickness:.4,roundness:0},x:-.6,y:.425,size:.25}]}},{id:"m-eccentric",name:"Eccentric",group:"m-arcs",tags:["circles","depth","tunnel","echo"],ink:!0,mark:{layers:[{type:"ring",params:{thickness:.1037},y:-.03,size:.82},{type:"ring",params:{thickness:.1318},y:.01,size:.645},{type:"ring",params:{thickness:.1809},y:.05,size:.47},{type:"ring",params:{thickness:.2881},y:.09,size:.295},{type:"circle",y:.13,size:.12}]}},{id:"m-ripple",name:"Ripple",group:"m-arcs",tags:["rings","ripple","wave","echo"],ink:!0,mark:{layers:[{type:"box",params:{width:1,height:1,roundness:0},x:.34,y:-.34,size:1.56,pattern:"rings",density:13,weight:.5},{type:"circle",size:.84,op:"keep",smooth:0}]}},{id:"m-golden",name:"Golden",group:"m-arcs",tags:["spiral","swirl","golden","shell"],ink:!0,mark:{layers:[{type:"arc",params:{sweep:91.5,thickness:.1235,roundness:0},x:.1514,y:.475,size:1.0125,rotation:-44.25},{type:"arc",params:{sweep:93,thickness:.1924,roundness:0},x:.1514,y:.1121,size:.6496,rotation:45},{type:"arc",params:{sweep:93,thickness:.2939,roundness:0},x:.3757,y:.1121,size:.4254,rotation:135},{type:"arc",params:{sweep:93,thickness:.4359,roundness:0},x:.3757,y:.2507,size:.2868,rotation:-135},{type:"arc",params:{sweep:93,thickness:.6216,roundness:0},x:.29,y:.2507,size:.2011,rotation:-45},{type:"arc",params:{sweep:93,thickness:.8437,roundness:0},x:.29,y:.1978,size:.1482,rotation:45}]}},{id:"m-waves",name:"Waves",group:"m-arcs",tags:["water","wave","flow","sea"],ink:!0,mark:{layers:[{type:"wave",params:{waves:2,amplitude:.6,thickness:.14},size:.8,repeat:4,layout:"column",gap:.5}]}},{id:"m-astroid",name:"Astroid",group:"m-forms",tags:["star","sparkle","spark","shine"],ink:!0,mark:{layers:[{type:"box",params:{width:1,height:1,roundness:0},size:.84},{type:"circle",x:1.1879,size:.84,repeat:4,spin:45,op:"cut",smooth:.1}]}},{id:"m-bite",name:"Bite",group:"m-forms",tags:["square","notch","tile","soft"],ink:!0,mark:{layers:[{type:"box",params:{width:1,height:1,roundness:.4},size:.74},{type:"circle",x:1.0465,size:.42,repeat:4,spin:45,op:"cut",smooth:.04}]}},{id:"m-nested",name:"Nested",group:"m-forms",tags:["diamond","square","op art","concentric"],ink:!0,mark:{layers:[{type:"diamond",params:{width:1,height:1,roundness:0},size:1.48},{type:"diamond",params:{width:1,height:1,roundness:0},size:1.2686,op:"exclude"},{type:"diamond",params:{width:1,height:1,roundness:0},size:1.0571,op:"exclude"},{type:"diamond",params:{width:1,height:1,roundness:0},size:.8457,op:"exclude"},{type:"diamond",params:{width:1,height:1,roundness:0},size:.6343,op:"exclude"},{type:"diamond",params:{width:1,height:1,roundness:0},size:.4229,op:"exclude"},{type:"diamond",params:{width:1,height:1,roundness:0},size:.2114,op:"exclude"},{type:"box",params:{width:1,height:1,roundness:0},size:.74,op:"keep",smooth:0}]}},{id:"m-quadrants",name:"Quadrants",group:"m-forms",tags:["triangles","square","diamond","bauhaus"],ink:!0,mark:{layers:[{type:"triangle",params:{width:1,roundness:0},x:-.58,y:-.58,size:.5091,rotation:-45},{type:"triangle",params:{width:1,roundness:0},x:.58,y:-.58,size:.5091,rotation:45},{type:"triangle",params:{width:1,roundness:0},x:-.58,y:.58,size:.5091,rotation:-135},{type:"triangle",params:{width:1,roundness:0},x:.58,y:.58,size:.5091,rotation:135}]}},{id:"m-vane",name:"Vane",group:"m-forms",tags:["triangles","pinwheel","windmill","spin"],ink:!0,mark:{layers:[{type:"triangle",params:{width:1,roundness:0},x:-.2,y:-.6,size:.5657,rotation:45,repeat:4}]}},{id:"m-chain",name:"Chain",group:"m-forms",tags:["link","chain","connect","together"],ink:!0,mark:{layers:[{type:"box",params:{width:1,height:1,roundness:.36},x:-.22,y:-.22,size:.5,outline:.05},{type:"box",params:{width:1,height:1,roundness:.36},x:.22,y:.22,size:.5,outline:.05},{type:"box",params:{width:1,height:.7273,roundness:0},x:-.28,y:.28,size:.11,op:"cut",smooth:0},{type:"box",params:{width:1,height:1,roundness:.36},x:.22,y:.22,size:.5,outline:.05},{type:"box",params:{width:.7273,height:1,roundness:0},x:.28,y:-.28,size:.11,op:"cut",smooth:0},{type:"box",params:{width:.3846,height:1,roundness:0},x:.28,y:-.28,size:.13}]}},{id:"m-isometric",name:"Isometric",group:"m-forms",tags:["cube","isometric","box","stripes"],ink:!0,mark:{layers:[{type:"diamond",params:{width:1,height:.5774,roundness:0},y:-.43,size:.7448,repeat:3,pattern:"lines",density:10,weight:.5,patternAngle:150},{type:"box",params:{width:1,height:.06,roundness:0},y:.5,size:.5,rotation:90,repeat:3,op:"cut",smooth:0}]}},{id:"m-cross",name:"Cross",group:"m-forms",tags:["x","cross","close","kiss"],ink:!0,mark:{layers:[{type:"box",params:{width:1,height:.1416,roundness:1},size:.9885,rotation:45},{type:"box",params:{width:1,height:.1416,roundness:1},size:.9885,rotation:135,op:"exclude"}]}},{id:"m-trefoil",name:"Trefoil",group:"m-forms",tags:["circles","three","overlap","venn"],ink:!0,mark:{layers:[{type:"circle",y:-.32,size:.47},{type:"circle",x:.3204,y:.235,size:.47,op:"exclude"},{type:"circle",x:-.3204,y:.235,size:.47,op:"exclude"}]}},{id:"m-metaball",name:"Metaball",group:"m-forms",tags:["blob","liquid","lobes","soft"],ink:!0,mark:{layers:[{type:"circle",y:-.45,size:.33},{type:"circle",x:.45,size:.33,op:"merge",smooth:.3},{type:"circle",y:.45,size:.33,op:"merge",smooth:.3},{type:"circle",x:-.45,size:.33,op:"merge",smooth:.3}]}},{id:"m-quarter-n",name:"Quarter N",group:"m-forms",tags:["n","letter","quarter","bauhaus"],ink:!0,mark:{layers:[{type:"circle",params:{stretch:.5},x:-.67,y:.67,size:1.34,rotation:90},{type:"circle",params:{stretch:.5},x:.67,y:-.67,size:1.34,rotation:90},{type:"box",params:{width:1,height:1,roundness:0},size:.67,op:"keep",smooth:0}]}},{id:"m-propeller",name:"Propeller",group:"m-forms",tags:["leaves","spin","fan","four"],ink:!0,mark:{layers:[{type:"leaf",params:{width:.44,roundness:0},x:.4,y:-.17,size:.44,rotation:90,repeat:4}]}},{id:"m-striped-s",name:"Striped S",group:"m-type",tags:["letter","s","stripes","initial"],ink:!0,mark:{layers:[{type:"text",text:{value:"S",font:"Archivo Black",weight:400},size:.94,pattern:"lines",density:12,weight:.56}]}},{id:"m-halftone-a",name:"Halftone a",group:"m-type",tags:["letter","a","dots","initial"],ink:!0,mark:{layers:[{type:"circle",size:.84,pattern:"halftone",density:11,weight:.94,taper:.7},{type:"box",params:{width:1,height:1,roundness:0},size:.3818,op:"cut",smooth:0},{type:"text",text:{value:"a",font:"Geist",weight:800},size:.44}]}},{id:"m-cut-g",name:"Cut G",group:"m-type",tags:["letter","g","monogram","stripes"],ink:!0,mark:{layers:[{type:"circle",size:.84,pattern:"lines",density:13,weight:.56},{type:"text",text:{value:"G",font:"Geist",weight:900},size:.7,round:.035,op:"cut",smooth:0}]}},{id:"m-tile-y",name:"Tile y",group:"m-type",tags:["letter","y","serif","initial"],ink:!0,mark:{layers:[{type:"box",params:{width:1,height:1,roundness:.18},size:.74,pattern:"lines",density:13,weight:.5,patternAngle:135},{type:"text",text:{value:"y",font:"Fraunces",weight:800},size:.7,round:.05,op:"cut",smooth:0},{type:"text",text:{value:"y",font:"Fraunces",weight:800},size:.7}]}},{id:"m-amp",name:"Amp",group:"m-type",tags:["ampersand","and","stripes","studio"],ink:!0,mark:{layers:[{type:"text",text:{value:"&",font:"Bricolage Grotesque",weight:800},size:.96,pattern:"lines",density:14,weight:.56}]}},{id:"m-split-e",name:"Split e",group:"m-type",tags:["letter","e","contrast","half"],ink:!0,mark:{layers:[{type:"text",text:{value:"e",font:"Geist",weight:900},x:-.04,size:.9},{type:"box",params:{width:.5065,height:1,roundness:0},x:.35,size:.77,op:"exclude"}]}}];Object.fromEntries(vs.map(e=>[e.id,e]));const or="m-bite",sr=[{id:"geometric",label:"Geometric"},{id:"organic",label:"Organic"},{id:"liquid",label:"Liquid"},{id:"symbols",label:"Symbols"},{id:"badges",label:"Badges"},{id:"letters",label:"Lettermarks"},{id:"line",label:"Outline"}],Et={kind:"solid",color1:"#ff5640",color2:"#e5383b",color3:"#b8243a"},Yt={kind:"solid",color1:"#ff7a1c",color2:"#f0561a",color3:"#c93d12"},ka={kind:"solid",color1:"#ffb21e",color2:"#ff8a14",color3:"#e5600f"},St={kind:"solid",color1:"#12b76a",color2:"#0b8f55",color3:"#086b44"},Pt={kind:"solid",color1:"#0fb5a6",color2:"#0b8f88",color3:"#0a6b6a"},Wt={kind:"solid",color1:"#2f6bff",color2:"#2447d6",color3:"#1c32a8"},Rt={kind:"solid",color1:"#323f9c",color2:"#26307a",color3:"#1c2459"},Kt={kind:"solid",color1:"#ff4f8b",color2:"#e5306d",color3:"#b81f55"},po={kind:"solid",color1:"#d8cdb8",color2:"#b8ab94",color3:"#8f8571"},nr={kind:"linear",color1:"#ffb36b",color2:"#ff4f5e",color3:"#c2367a",angle:160},_a={kind:"linear",color1:"#7fd7ff",color2:"#2f5bff",color3:"#2a2fb8",angle:160},ho={kind:"linear",color1:"#7af0c0",color2:"#0f9d76",color3:"#0b6b5a",angle:160},vo={kind:"linear",color1:"#ff9ac1",color2:"#e0336b",color3:"#9e1f5a",angle:160},go={kind:"linear",color1:"#ffe066",color2:"#ff8a1f",color3:"#e8541a",angle:160},rr={kind:"linear",color1:"#ffd166",color2:"#ff4d2e",color3:"#c42a3c",angle:180},xo={kind:"linear",color1:"#a5e4ff",color2:"#3a8dff",color3:"#2b55d6",angle:180},lr={kind:"linear",color1:"#ff8f5a",color2:"#e5304f",color3:"#a8204f",angle:160},ir={kind:"linear",color1:"#6fdc8c",color2:"#127a4a",color3:"#0b5235",angle:180},cr={kind:"radial",color1:"#ffd36b",color2:"#ff5a3c",color3:"#d6304a",extent:.9},mr={kind:"linear",color1:"#ffd29a",color2:"#ff5d8f",color3:"#c2367a",stops:3,angle:150},fr={kind:"conic",color1:"#ffb36b",color2:"#ff4f5e",color3:"#ffb36b",stops:3,angle:0},ur=[{id:"hexa",name:"Cube",group:"geometric",tags:["box","hexagon","isometric","3d"],mark:{layers:[{type:"polygon",params:{sides:6,roundness:.18},size:.86},{type:"wave",params:{waves:1,amplitude:0,thickness:.26},x:.5,size:.5,repeat:3,spin:90,op:"cut",smooth:0}]},fill:Wt},{id:"orbit",name:"Orbit",group:"geometric",tags:["ring","planet","satellite","space"],mark:{layers:[{type:"ring",params:{thickness:.24},size:.74},{type:"circle",x:.5,y:-.5,size:.26,op:"cut",smooth:.06},{type:"circle",x:.5,y:-.5,size:.15,op:"add"}]},fill:xo},{id:"spark",name:"Spark",group:"geometric",tags:["star","sparkle","shine","twinkle"],mark:{layers:[{type:"star",params:{points:4,inner:.46,roundness:.35},size:.86}]},fill:go},{id:"knot",name:"Knot",group:"geometric",tags:["rings","weave","trinity","interlocked"],mark:{layers:[{type:"ring",params:{thickness:.2222},y:-.3,size:.54},{type:"ring",params:{thickness:.2222},x:.2598,y:.15,size:.54,op:"add"},{type:"ring",params:{thickness:.2222},x:-.2598,y:.15,size:.54,op:"add"},{type:"arc",params:{sweep:64,thickness:.3158,roundness:0},x:.15,y:.2598,size:.57,rotation:57.2,repeat:3,spin:-30,op:"cut",smooth:0},{type:"arc",params:{sweep:80,thickness:.2222,roundness:0},x:.15,y:.2598,size:.54,rotation:57.2,repeat:3,spin:-30,op:"add"},{type:"arc",params:{sweep:64,thickness:.3158,roundness:0},x:-.15,y:-.2598,size:.57,rotation:122.8,repeat:3,spin:150,op:"cut",smooth:0},{type:"arc",params:{sweep:80,thickness:.2222,roundness:0},x:-.15,y:-.2598,size:.54,rotation:122.8,repeat:3,spin:150,op:"add"}]},fill:Pt},{id:"portal",name:"Portal",group:"geometric",tags:["arch","door","gate","squircle"],mark:{layers:[{type:"squircle",params:{roundness:.55},size:.82},{type:"circle",size:.34,op:"cut",smooth:0},{type:"box",params:{width:.67,height:1,roundness:0},y:.48,size:.5,op:"cut",smooth:0}]},fill:vo},{id:"pinwheel",name:"Pinwheel",group:"geometric",tags:["fan","spin","blades","motion"],mark:{layers:[{type:"pie",params:{sweep:180,roundness:.3},x:.325,y:-.269,size:.4,rotation:-135,repeat:4}]},fill:fr},{id:"stack",name:"Stack",group:"geometric",tags:["layers","stack","diamond","data"],mark:{layers:[{type:"diamond",params:{width:1,height:.56,roundness:.35},y:.3,size:.84},{type:"diamond",params:{width:1,height:.56,roundness:.35},y:.1,size:.96,op:"cut",smooth:0},{type:"diamond",params:{width:1,height:.56,roundness:.35},y:.03,size:.84,op:"add"},{type:"diamond",params:{width:1,height:.56,roundness:.35},y:-.17,size:.96,op:"cut",smooth:0},{type:"diamond",params:{width:1,height:.56,roundness:.35},y:-.24,size:.84,op:"add"}]},fill:Rt},{id:"tile",name:"Tile",group:"geometric",tags:["square","quarter","star","bauhaus"],mark:{layers:[{type:"pie",params:{sweep:90,roundness:0},x:.98,size:.68,repeat:4,spin:45}]},fill:Et},{id:"speed",name:"Velocidade",group:"geometric",tags:["stripes","motion","sport","fast"],mark:{layers:[{type:"wave",params:{waves:1,amplitude:0,thickness:.34},x:-.4879,y:-.4879,size:1,rotation:-45},{type:"wave",params:{waves:1,amplitude:0,thickness:.34},x:-.1626,y:-.1626,size:1,rotation:-45,op:"add"},{type:"wave",params:{waves:1,amplitude:0,thickness:.34},x:.1626,y:.1626,size:1,rotation:-45,op:"add"},{type:"wave",params:{waves:1,amplitude:0,thickness:.34},x:.4879,y:.4879,size:1,rotation:-45,op:"add"},{type:"circle",size:.84,op:"keep",smooth:0}]},fill:_a},{id:"split",name:"Split",group:"geometric",tags:["half","bauhaus","contrast","balance"],mark:{layers:[{type:"circle",size:.8},{type:"box",params:{width:.5,height:1,roundness:0},x:.4,size:.8,op:"exclude"}]},fill:St},{id:"bloom",name:"Bloom",group:"organic",tags:["flower","petals","blossom","spring"],mark:{layers:[{type:"circle",params:{stretch:.55},x:.5,size:.36,repeat:6,spin:-90},{type:"circle",size:.36,op:"merge",smooth:.16},{type:"circle",size:.13,op:"cut",smooth:.04}]},fill:cr},{id:"laurel",name:"Laurel",group:"organic",tags:["wreath","award","leaves","victory"],mark:{layers:[{type:"leaf",params:{width:.5,roundness:.3},x:.7,size:.18,rotation:25,repeat:12,spin:15,mirror:!0},{type:"leaf",params:{width:.5,roundness:.3},x:.1812,y:-.6761,size:.18,rotation:-50,round:.02,mirror:!0,op:"cut",smooth:0},{type:"star",params:{points:5,inner:.5,roundness:.3},y:.02,size:.3,op:"add"}]},fill:ka},{id:"pebble",name:"Cairn",group:"organic",tags:["stones","balance","calm","pebble"],mark:{layers:[{type:"circle",params:{stretch:.5},y:.47,size:.62},{type:"circle",params:{stretch:.55},x:.04,y:-.11,size:.44,rotation:-6,op:"add"},{type:"circle",params:{stretch:.62},x:-.02,y:-.58,size:.3,rotation:8,op:"add"}]},fill:po},{id:"clover",name:"Clover",group:"organic",tags:["luck","leaf","hearts","nature"],mark:{layers:[{type:"heart",params:{width:.5,roundness:.3},x:.4,size:.4,rotation:90,repeat:4,spin:-45}]},fill:St},{id:"sprout",name:"Sprout",group:"organic",tags:["plant","seedling","grow","leaves"],mark:{layers:[{type:"leaf",params:{width:.55,roundness:.2},x:-.3,y:-.33,size:.44,rotation:-50},{type:"leaf",params:{width:.55,roundness:.2},x:.3,y:-.33,size:.44,rotation:50,op:"add"},{type:"box",params:{width:.2,height:1,roundness:1},y:.27,size:.38,op:"add"}]},fill:ho},{id:"tidal",name:"Tidal",group:"organic",tags:["waves","water","ocean","sea"],mark:{layers:[{type:"circle",size:.84},{type:"wave",params:{waves:1.5,amplitude:.22,thickness:.12},y:-.12,size:.9,op:"cut",smooth:0},{type:"wave",params:{waves:1.5,amplitude:.22,thickness:.12},y:.22,size:.9,op:"cut",smooth:0}]},fill:_a},{id:"petals",name:"Lotus",group:"organic",tags:["flower","yoga","calm","wellness"],mark:{layers:[{type:"leaf",params:{width:.5,roundness:.2},y:-.04,size:.6},{type:"leaf",params:{width:.5,roundness:.2},x:.3078,y:.166,size:.5,rotation:38,mirror:!0,op:"add"},{type:"leaf",params:{width:.5,roundness:.2},x:.3687,y:.4681,size:.38,rotation:76,mirror:!0,op:"add"}]},fill:vo},{id:"pine",name:"Pine",group:"organic",tags:["tree","forest","outdoors","evergreen"],mark:{layers:[{type:"triangle",params:{width:.75,roundness:.3},y:-.52,size:.36},{type:"triangle",params:{width:.75,roundness:.3},y:-.2,size:.5,op:"add"},{type:"triangle",params:{width:.75,roundness:.3},y:.17,size:.64,op:"add"},{type:"box",params:{width:.24,height:1,roundness:.3},y:.62,size:.18,op:"add"}]},fill:ir},{id:"twins",name:"Twins",group:"liquid",tags:["cells","split","goo","pair"],mark:{layers:[{type:"circle",x:-.31,y:.31,size:.39},{type:"circle",x:.31,y:-.31,size:.39,op:"merge",smooth:.44}]},fill:mr},{id:"blocks",name:"Fuse",group:"liquid",tags:["square","circle","morph","shapes"],mark:{layers:[{type:"box",params:{width:1,height:1,roundness:.3},x:-.3,y:-.3,size:.42},{type:"circle",x:.36,y:.36,size:.4,op:"merge",smooth:.34}]},fill:Yt},{id:"drip",name:"Drip",group:"liquid",tags:["drop","melt","paint","goo"],mark:{layers:[{type:"box",params:{width:1,height:.5,roundness:1},y:-.36,size:.8},{type:"box",params:{width:.3103,height:1,roundness:1},x:-.44,size:.29,op:"merge",smooth:.14},{type:"box",params:{width:.2,height:1,roundness:1},x:-.06,y:.16,size:.45,op:"merge",smooth:.14},{type:"box",params:{width:.4091,height:1,roundness:1},x:.38,y:-.07,size:.22,op:"merge",smooth:.14},{type:"circle",x:-.06,y:.72,size:.07}]},fill:Kt},{id:"molecule",name:"Molecule",group:"liquid",tags:["atom","science","node","goo"],mark:{layers:[{type:"circle",y:.08,size:.34},{type:"circle",y:-.52,size:.2,op:"merge",smooth:.3},{type:"circle",x:.5196,y:.38,size:.2,op:"merge",smooth:.3},{type:"circle",x:-.5196,y:.38,size:.2,op:"merge",smooth:.3}]},fill:Pt},{id:"plus",name:"Plus",group:"liquid",tags:["cross","health","add","soft"],mark:{layers:[{type:"box",params:{width:1,height:.38,roundness:1},size:.82},{type:"box",params:{width:1,height:.38,roundness:1},size:.82,rotation:90,op:"merge",smooth:.3}]},fill:ho},{id:"cloud",name:"Cloud",group:"liquid",tags:["weather","sky","storage","soft"],mark:{layers:[{type:"box",params:{width:1,height:.36,roundness:1},y:.26,size:.8},{type:"circle",x:-.24,size:.34,op:"merge",smooth:.12},{type:"circle",x:.2,y:-.12,size:.44,op:"merge",smooth:.12}]},fill:xo},{id:"splat",name:"Splat",group:"liquid",tags:["ink","paint","splash","drops"],mark:{layers:[{type:"circle",x:-.03,y:.1,size:.44},{type:"circle",x:.43,y:-.16,size:.16,op:"merge",smooth:.2},{type:"circle",x:-.47,y:-.2,size:.13,op:"merge",smooth:.2},{type:"circle",x:-.33,y:.56,size:.15,op:"merge",smooth:.2},{type:"circle",x:.31,y:.52,size:.11,op:"merge",smooth:.2},{type:"circle",x:.05,y:-.4,size:.1,op:"merge",smooth:.2},{type:"circle",x:.69,y:.2,size:.065,op:"add"},{type:"circle",x:-.71,y:.26,size:.05,op:"add"},{type:"circle",x:.17,y:-.68,size:.06,op:"add"}]},fill:Rt},{id:"pulse",name:"Pulse",group:"symbols",tags:["heart","love","health","beat"],mark:{layers:[{type:"heart",params:{width:.5,roundness:.35},y:.02,size:.84},{type:"wave",params:{waves:1,amplitude:.3,thickness:.12},y:-.02,size:.92,op:"cut",smooth:0}]},fill:Kt},{id:"bolt",name:"Bolt",group:"symbols",tags:["lightning","energy","fast","power"],mark:{layers:[{type:"triangle",params:{width:.34,roundness:.25},x:-.12,y:-.3,size:.56,rotation:24.6},{type:"triangle",params:{width:.34,roundness:.25},x:.12,y:.3,size:.56,rotation:204.6,op:"merge",smooth:.03}]},fill:ka},{id:"pin",name:"Pin",group:"symbols",tags:["map","location","place","marker"],mark:{layers:[{type:"drop",params:{length:.45,roundness:.15},size:.86,rotation:180},{type:"circle",y:-.2,size:.24,op:"cut",smooth:0}]},fill:Et},{id:"night",name:"Night",group:"symbols",tags:["moon","crescent","star","sleep"],mark:{layers:[{type:"moon",params:{phase:.42,roundness:.4},x:-.06,y:.06,size:.78,rotation:-25},{type:"star",params:{points:4,inner:.45,roundness:.35},x:.48,y:-.44,size:.26,op:"add"}]},fill:Rt},{id:"sunset",name:"Sunset",group:"symbols",tags:["sun","retro","horizon","summer"],mark:{layers:[{type:"circle",size:.84},{type:"wave",params:{waves:1,amplitude:0,thickness:.07},y:.14,size:1,op:"cut",smooth:0},{type:"wave",params:{waves:1,amplitude:0,thickness:.11},y:.36,size:1,op:"cut",smooth:0},{type:"wave",params:{waves:1,amplitude:0,thickness:.15},y:.6,size:1,op:"cut",smooth:0}]},fill:nr},{id:"iris",name:"Iris",group:"symbols",tags:["eye","vision","see","focus"],mark:{layers:[{type:"leaf",params:{width:.58,roundness:.25},size:.84,rotation:90},{type:"circle",size:.34,op:"cut",smooth:0},{type:"circle",size:.19,op:"add"}]},fill:Pt},{id:"summit",name:"Summit",group:"symbols",tags:["mountain","peak","outdoors","climb"],mark:{layers:[{type:"triangle",params:{width:.62,roundness:.1},x:.15,y:-.03,size:.72},{type:"triangle",params:{width:.62,roundness:.1},x:-.38,y:.19,size:.48,outline:.06,op:"cut",smooth:0},{type:"triangle",params:{width:.62,roundness:.1},x:-.38,y:.19,size:.48,op:"add"}]},fill:_a},{id:"north",name:"North",group:"symbols",tags:["compass","star","direction","explore"],mark:{layers:[{type:"circle",size:.5},{type:"star",params:{points:4,inner:.36,roundness:.2},size:.86,op:"exclude"}]},fill:St},{id:"flame",name:"Flame",group:"symbols",tags:["fire","hot","energy","torch"],mark:{layers:[{type:"drop",params:{length:.55,roundness:.15},size:.86},{type:"circle",x:.48,y:-.42,size:.36,op:"cut",smooth:.06},{type:"drop",params:{length:.35,roundness:.2},x:-.02,y:.38,size:.3,op:"cut",smooth:0}]},fill:rr},{id:"burst",name:"Burst",group:"badges",tags:["sticker","sale","star","new"],mark:{layers:[{type:"star",params:{points:16,inner:.62,roundness:.3},size:.86},{type:"star",params:{points:5,inner:.5,roundness:.3},size:.34,op:"cut",smooth:0}]},fill:Yt},{id:"verified",name:"Verified",group:"badges",tags:["check","seal","trust","approved"],mark:{layers:[{type:"star",params:{points:12,inner:.82,roundness:.8},size:.86},{type:"wave",params:{waves:1,amplitude:0,thickness:.5224},x:-.21,y:.07,size:.2488,rotation:45,op:"cut",smooth:0},{type:"wave",params:{waves:1,amplitude:0,thickness:.3266},x:.14,y:-.05,size:.398,rotation:-48.65,op:"cut",smooth:0}]},fill:Wt},{id:"crest",name:"Crest",group:"badges",tags:["shield","chevron","rank","secure"],mark:{layers:[{type:"shield",params:{width:.84,point:.6,roundness:.35},size:.86},{type:"chevron",params:{angle:100,thickness:.3,roundness:.3},y:.02,size:.52,op:"cut",smooth:0},{type:"chevron",params:{angle:100,thickness:.3,roundness:.3},y:-.3,size:.52,op:"cut",smooth:0}]},fill:Rt},{id:"medal",name:"Medal",group:"badges",tags:["award","prize","ribbon","winner"],mark:{layers:[{type:"box",params:{width:.36,height:1,roundness:.1},x:.2,y:.37,size:.42,rotation:-22,mirror:!0},{type:"diamond",params:{width:.5,height:.5,roundness:0},x:.37,y:.81,size:.36,rotation:-22,mirror:!0,op:"cut",smooth:0},{type:"circle",y:-.25,size:.62,op:"cut",smooth:0},{type:"circle",y:-.25,size:.54,op:"add"},{type:"star",params:{points:5,inner:.5,roundness:.3},y:-.26,size:.27,op:"cut",smooth:0}]},fill:ka},{id:"ticket",name:"Ticket",group:"badges",tags:["event","pass","admit","coupon"],mark:{layers:[{type:"box",params:{width:1,height:.62,roundness:.25},size:.78,rotation:-12},{type:"circle",x:-.763,y:.162,size:.15,op:"cut",smooth:0},{type:"circle",x:.763,y:-.162,size:.15,op:"cut",smooth:0}]},fill:go},{id:"charge",name:"Charge",group:"badges",tags:["hexagon","bolt","energy","power"],mark:{layers:[{type:"polygon",params:{sides:6,roundness:.3},size:.86,rotation:30},{type:"triangle",params:{width:.34,roundness:.25},x:-.074,y:-.185,size:.345,rotation:24.6,op:"cut",smooth:0},{type:"triangle",params:{width:.34,roundness:.25},x:.074,y:.185,size:.345,rotation:204.6,op:"cut",smooth:0}]},fill:Et},{id:"monogram",name:"Monogram",group:"letters",tags:["letter","serif","initial","circle"],mark:{layers:[{type:"circle",size:.86},{type:"text",text:{value:"R",font:"Fraunces",weight:800},size:.66,op:"cut",smooth:0}]},fill:po},{id:"wordmark",name:"Wordmark",group:"letters",tags:["text","word","logotype","brand"],mark:{layers:[{type:"text",text:{value:"bits",font:"Bricolage Grotesque",weight:800,tracking:-.04},x:-.1,y:.06,size:.9},{type:"star",params:{points:4,inner:.46,roundness:.35},x:.64,y:-.33,size:.17,op:"add"}]},fill:Wt},{id:"initial",name:"Initial",group:"letters",tags:["letter","app","icon","squircle"],mark:{layers:[{type:"squircle",params:{roundness:.62},size:.8},{type:"text",text:{value:"a",font:"Geist",weight:800},y:-.04,size:.6,op:"cut",smooth:0}]},fill:Et},{id:"ampersand",name:"Ampersand",group:"letters",tags:["and","serif","studio","elegant"],mark:{layers:[{type:"text",text:{value:"&",font:"Instrument Serif",weight:400},size:1}]},fill:Yt},{id:"serif",name:"Serif",group:"letters",tags:["letter","g","editorial","elegant"],mark:{layers:[{type:"text",text:{value:"g",font:"Fraunces",weight:800},size:1}]},fill:Rt},{id:"emblem",name:"Emblem",group:"letters",tags:["letter","ring","badge","bold"],mark:{layers:[{type:"ring",params:{thickness:.12},size:.86},{type:"text",text:{value:"N",font:"Unbounded",weight:800},size:.66,op:"add"}]},fill:St},{id:"hello",name:"Hello",group:"letters",tags:["text","word","friendly","dot"],mark:{layers:[{type:"text",text:{value:"hey",font:"Sora",weight:800,tracking:-.03},x:-.1,size:.96},{type:"circle",x:.7,y:.19,size:.095,op:"add"}]},fill:Kt},{id:"globe",name:"Globe",group:"line",tags:["world","web","earth","global"],mark:{layers:[{type:"circle",size:.8,outline:.055},{type:"circle",params:{stretch:.42},size:.8,rotation:90,outline:.055,op:"add"},{type:"wave",params:{waves:1,amplitude:0,thickness:.1375},size:.8,op:"add"}]},fill:Wt},{id:"link",name:"Link",group:"line",tags:["chain","connect","url","join"],mark:{layers:[{type:"box",params:{width:1,height:.46,roundness:1},x:-.24,y:.24,size:.5,rotation:-45,outline:.065},{type:"box",params:{width:1,height:.46,roundness:1},x:.24,y:-.24,size:.5,rotation:-45,outline:.065,op:"add"}]},fill:Pt},{id:"octagram",name:"Octagram",group:"line",tags:["star","squares","geometry","pattern"],mark:{layers:[{type:"box",params:{width:1,height:1,roundness:.15},size:.58,outline:.05},{type:"box",params:{width:1,height:1,roundness:.15},size:.58,rotation:45,outline:.05,op:"add"}]},fill:St},{id:"coil",name:"Coil",group:"line",tags:["spiral","swirl","hypnotic","shell"],mark:{layers:[{type:"spiral",params:{turns:3,thickness:.32},x:-.06,y:-.06,size:.82}]},fill:lr},{id:"trinity",name:"Trinity",group:"line",tags:["triquetra","knot","loops","petals"],mark:{layers:[{type:"leaf",params:{width:.5,roundness:0},y:-.27,size:.42,outline:.06},{type:"leaf",params:{width:.5,roundness:0},x:.3464,y:.33,size:.42,rotation:120,outline:.06,op:"add"},{type:"leaf",params:{width:.5,roundness:0},x:-.3464,y:.33,size:.42,rotation:240,outline:.06,op:"add"}]},fill:Pt},{id:"venn",name:"Venn",group:"line",tags:["circles","overlap","together","community"],mark:{layers:[{type:"circle",y:-.19,size:.44,outline:.05},{type:"circle",x:.19,y:.14,size:.44,outline:.05,op:"add"},{type:"circle",x:-.19,y:.14,size:.44,outline:.05,op:"add"}]},fill:Kt},{id:"echo",name:"Eco",group:"line",tags:["circles","ripple","target","sound"],mark:{layers:[{type:"circle",size:.8,outline:.05},{type:"circle",y:.2,size:.58,outline:.05,op:"add"},{type:"circle",y:.4,size:.36,outline:.05,op:"add"},{type:"circle",y:.6,size:.14,op:"add"}]},fill:Et},{id:"rosette",name:"Rosette",group:"line",tags:["flower","circles","sacred","pattern"],mark:{layers:[{type:"circle",y:-.41,size:.41,outline:.04},{type:"circle",x:.3551,y:-.205,size:.41,outline:.04,op:"add"},{type:"circle",x:.3551,y:.205,size:.41,outline:.04,op:"add"},{type:"circle",y:.41,size:.41,outline:.04,op:"add"},{type:"circle",x:-.3551,y:.205,size:.41,outline:.04,op:"add"},{type:"circle",x:-.3551,y:-.205,size:.41,outline:.04,op:"add"}]},fill:Yt}],dr=[...ar,...sr],Gt=[...vs,...ur],za=Object.fromEntries(Gt.map(e=>[e.id,e])),pr=or,hr=[...["dark","light"].flatMap(e=>Gt.map(a=>({key:`mark:${a.id}`,file:`mark-${a.id}-${e}.webp`,size:220,light:e==="light",preset:a}))),...xt.map(e=>({key:`shape:${e.id}`,file:`shape-${e.id}.webp`,size:96,preset:{mark:{layers:[{type:e.id,size:.78}]}},style:{fill:{kind:"solid",color1:"#ffffff"}}}))],bo=e=>Object.fromEntries(hr.filter(a=>a.light===void 0||a.light===e).map(a=>[a.key,`/assets/shape-magic/${a.file}`])),vr={dark:bo(!1),light:bo(!0)},gr={id:"chrome",name:"Studio chrome",kind:"shape",group:"metal",source:"shaders.com",animated:!0,outside:!1,surface:.15,params:[{name:"tint",label:"Tint",type:"color",default:"#ffffff"},{name:"warm",label:"Warm light",type:"color",default:"#ffa94d"},{name:"cool",label:"Cool light",type:"color",default:"#82a7e6"},{name:"bevel",label:"Bevel",type:"number",min:.02,max:.8,step:.01,default:.7},{name:"profile",label:"Machined",type:"number",min:0,max:1,step:.01,default:0},{name:"softness",label:"Softness",type:"number",min:0,max:1,step:.01,default:.3},{name:"accents",label:"Accent lights",type:"number",min:0,max:2,step:.01,default:.9},{name:"shadows",label:"Shadows",type:"number",min:0,max:1,step:.01,default:.7},{name:"dispersion",label:"Dispersion",type:"number",min:0,max:1,step:.01,default:.3},{name:"exposure",label:"Exposure",type:"number",min:0,max:2,step:.01,default:1},{name:"rotation",label:"Rotação",type:"number",min:0,max:360,step:1,default:0},{name:"speed",label:"Velocidade",type:"number",min:0,max:4,step:.01,default:.5}],glsl:`
float m_ss(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

vec3 m_lin(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 m_srgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec2 m_hash22(vec2 p) {
  uvec2 u = floatBitsToUint(p * vec2(141421356.0, 2718281828.0));
  uint h = u.x ^ u.y;
  return vec2(uvec2(h) * uvec2(3141592653u, 1618033988u)) / 4294967295.0;
}

vec3 m_perlin(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec2 ga = m_hash22(i) * 2.0 - 1.0;
  vec2 gb = m_hash22(i + vec2(1.0, 0.0)) * 2.0 - 1.0;
  vec2 gc = m_hash22(i + vec2(0.0, 1.0)) * 2.0 - 1.0;
  vec2 gd = m_hash22(i + vec2(1.0, 1.0)) * 2.0 - 1.0;
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  float k = va - vb - vc + vd;
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
  vec2 deriv = ga + (gb - ga) * u.x + (gc - ga) * u.y + (ga - gb - gc + gd) * (u.x * u.y) + du * (u.yx * k + vec2(vb, vc) - va);
  return vec3(value, deriv);
}

float m_bevelSin(float t, float shape) {
  float k1 = smoothstep(0.0, 0.14, t);
  float k2 = smoothstep(0.68, 0.92, t);
  return mix(1.0 - t, mix(1.0, 0.72 * (1.0 - k2), k1), shape);
}

vec3 m_neutral(vec3 c) {
  float x = min(c.r, min(c.g, c.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  c -= offset;
  float peak = max(c.r, max(c.g, c.b));
  if (peak < 0.76) return c;
  float newPeak = 1.0 - 0.0576 / (peak + 0.24 - 0.76);
  c *= newPeak / peak;
  float g = 1.0 - 1.0 / (0.15 * (peak - newPeak) + 1.0);
  return mix(c, vec3(newPeak), g);
}

float m_roundBox(vec2 q) {
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

vec3 m_studio(vec3 e, float boxSoftIn, float stripSoft, float spectral, float shadows, vec3 warmC, vec3 coolC) {
  float horiz = e.x / (length(e.xy) + 0.0001);
  float warmSide = 0.35 + 0.65 * smoothstep(-0.7, 0.7, horiz);
  float coolSide = 0.45 + 0.55 * smoothstep(-0.7, 0.7, -horiz);
  float up = smoothstep(-0.65, 1.0, e.y);
  vec3 graphite = coolC * 0.03 + vec3(0.003, 0.003, 0.004);
  vec3 baseLo = mix(vec3(0.17, 0.175, 0.19), graphite, shadows);
  vec3 env = mix(baseLo, vec3(0.56, 0.57, 0.6), up * up);
  env += vec3(0.55, 0.55, 0.56) * smoothstep(0.3, 0.9, e.y);
  float cd = (e.y + 0.45) / 0.2;
  env += coolC * exp(-cd * cd) * spectral * 0.2 * coolSide;
  float facing = m_ss(0.18, -0.1, e.z);
  float pz = max(0.32 - e.z, 0.06);
  vec2 q = e.xy / pz;
  float dbox = m_roundBox(vec2(abs(q.x) - 0.62, abs(q.y - 0.3) - 0.28));
  float boxSoft = 0.05 + boxSoftIn * 0.4;
  env += vec3(2.9, 2.87, 2.82) * m_ss(boxSoft, -0.6 * boxSoft, dbox) * facing;
  env *= mix(1.0, mix(0.55, 0.07, shadows), smoothstep(0.5, 0.92, abs(e.x)));
  float gw = 0.065 + stripSoft * 0.05;
  float dOut = max(dbox, 0.0) / gw;
  env += warmC * exp(-dOut * dOut) * smoothstep(-0.06, 0.1, dbox) * spectral * 1.3 * warmSide * facing;
  float fb = (e.y + 0.12) / 0.05;
  env += warmC * exp(-fb * fb) * spectral * 0.5 * warmSide * (1.0 - facing);
  float dcard = m_roundBox(vec2(abs(q.x) - 0.7, abs(q.y + 0.78) - 0.05));
  env += vec3(0.5, 0.5, 0.52) * m_ss(boxSoft, -0.6 * boxSoft, dcard) * facing;
  return env;
}

float m_width(Surface s, float bevel) {
  float depth = max(-s.d, 0.0);
  float k = bevel - depth;
  float w = bevel;
  if (k <= 0.0) return w;
  for (int i = 0; i < 4; i++) {
    float g = shapeAt(s.p - s.n * k) + depth + k;
    float c = smoothstep(0.0, 0.5 * k, g);
    if (c <= 0.0) break;
    w = mix(w, depth + k - 0.5 * g, c);
    k *= 0.5;
  }
  return min(bevel, w);
}

float m_tilt(Surface s, float bevel, float shape, float wobble) {
  float depth = max(-s.d, 0.0);
  float we = m_width(s, bevel);
  float band = min(0.02, 0.2 * we);
  float t = clamp((depth - band) / max(we - band, 1e-4), 0.0, 1.0);
  t = clamp(t + wobble * t * (1.0 - t), 0.0, 1.0);
  return min(m_bevelSin(t, shape), 0.98) * smoothstep(0.0, 0.2, s.slope);
}

vec4 material(Surface s) {
  if (s.d > max(0.02, 2.0 * s.aa)) return vec4(0.0);
  float t = s.time * P_speed + 15.0;
  vec2 pat = s.p * 0.5;
  float rimN = m_perlin(pat * 21.0).x;
  float tilt = m_tilt(s, P_bevel, P_profile, rimN * 0.132);
  vec3 n = vec3(s.n * tilt, -sqrt(1.0 - tilt * tilt));
  vec2 wg = clamp(m_perlin(pat * 1.05 + vec2(t * 0.08, 0.0)).yz, -4.0, 4.0) * 0.03;
  n = normalize(vec3(n.xy + wg, n.z));
  vec3 view = normalize(vec3(s.p * 0.275, 1.0));
  vec3 R = reflect(view, n);
  float tiltV = 1.0 - clamp(-dot(n, view), 0.0, 1.0);
  float rotA = radians(P_rotation) + sin(t * 0.23) * 0.05;
  float envC = cos(rotA);
  float envS = sin(rotA);
  float upY = -R.y;
  float rx0 = R.x * envC - upY * envS;
  float ry0 = R.x * envS + upY * envC;
  float orbit = sin(t * 0.5) * 0.4 + sin(t * 0.19 + 1.7) * 0.2;
  float oc = cos(orbit);
  float os = sin(orbit);
  float rx = rx0 * oc + R.z * os;
  float rz0 = R.z * oc - rx0 * os;
  float nod = sin(t * 0.31 + 0.9) * 0.12;
  float ry = ry0 * cos(nod) - rz0 * sin(nod);
  float rz = rz0 * cos(nod) + ry0 * sin(nod);
  float faceness = smoothstep(0.75, 1.0, -n.z);
  float softEff = P_softness + faceness * 0.2;
  vec3 warmC = m_lin(C_warm.rgb);
  vec3 coolC = m_lin(C_cool.rgb);
  float delta = P_dispersion * (0.004 + tiltV * tiltV * 0.06);
  vec3 envG = m_studio(vec3(rx, ry, rz), softEff, P_softness, P_accents, P_shadows, warmC, coolC);
  vec3 envR = m_studio(vec3(rx, ry + delta, rz), softEff, P_softness, P_accents, P_shadows, warmC, coolC);
  vec3 envB = m_studio(vec3(rx, ry - delta, rz), softEff, P_softness, P_accents, P_shadows, warmC, coolC);
  vec3 env = vec3(envR.r, envG.g, envB.b);
  vec3 rgb = m_neutral(env * P_exposure * m_lin(C_tint.rgb));
  return vec4(m_srgb(rgb), 1.0);
}
`},xr={id:"brushed-metal",name:"Brushed metal",kind:"shape",group:"metal",source:"shaders.com",animated:!0,outside:!1,surface:.15,params:[{name:"light",label:"Light color",type:"color",default:"#e9ebef"},{name:"dark",label:"Dark color",type:"color",default:"#26282d"},{name:"bevel",label:"Bevel",type:"number",min:.02,max:.8,step:.01,default:.7},{name:"angle",label:"Brush angle",type:"number",min:0,max:360,step:1,default:0},{name:"streaks",label:"Streaks",type:"number",min:0,max:1,step:.01,default:.8},{name:"grain",label:"Grain",type:"number",min:0,max:1,step:.01,default:.4},{name:"density",label:"Grain density",type:"number",min:.25,max:4,step:.01,default:2},{name:"roughness",label:"Roughness",type:"number",min:0,max:1,step:.01,default:.4},{name:"reflections",label:"Reflections",type:"number",min:0,max:2,step:.01,default:1.4},{name:"lightAngle",label:"Light angle",type:"number",min:0,max:360,step:1,default:215},{name:"speed",label:"Velocidade",type:"number",min:0,max:4,step:.01,default:.4}],glsl:`
float m_ss(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

vec3 m_lin(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 m_srgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

uint m_rotl(uint x, uint k) {
  return (x << k) | (x >> (32u - k));
}

uint m_hash(int x, int y) {
  uint seed = 0xdeadbeefu + 21u;
  uint a = seed + uint(x);
  uint b = seed + uint(y);
  uint c = seed;
  c ^= b; c -= m_rotl(b, 14u);
  a ^= c; a -= m_rotl(c, 11u);
  b ^= a; b -= m_rotl(a, 25u);
  c ^= b; c -= m_rotl(b, 16u);
  a ^= c; a -= m_rotl(c, 4u);
  b ^= a; b -= m_rotl(a, 14u);
  c ^= b; c -= m_rotl(b, 24u);
  return c;
}

float m_grad(uint h, float x, float y) {
  h &= 7u;
  float u = h < 4u ? x : y;
  float v = 2.0 * (h < 4u ? y : x);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_noise(vec2 p) {
  vec2 fl = floor(p);
  ivec2 i = ivec2(fl);
  vec2 f = p - fl;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float v0 = m_grad(m_hash(i.x, i.y), f.x, f.y);
  float v1 = m_grad(m_hash(i.x + 1, i.y), f.x - 1.0, f.y);
  float v2 = m_grad(m_hash(i.x, i.y + 1), f.x, f.y - 1.0);
  float v3 = m_grad(m_hash(i.x + 1, i.y + 1), f.x - 1.0, f.y - 1.0);
  return 0.6616 * mix(mix(v0, v1, u.x), mix(v2, v3, u.x), u.y);
}

float m_width(Surface s, float bevel) {
  float depth = max(-s.d, 0.0);
  float k = bevel - depth;
  float w = bevel;
  if (k <= 0.0) return w;
  for (int i = 0; i < 4; i++) {
    float g = shapeAt(s.p - s.n * k) + depth + k;
    float c = smoothstep(0.0, 0.5 * k, g);
    if (c <= 0.0) break;
    w = mix(w, depth + k - 0.5 * g, c);
    k *= 0.5;
  }
  return min(bevel, w);
}

vec2 m_dome(Surface s, float bevel) {
  float depth = max(-s.d, 0.0);
  float we = m_width(s, bevel);
  float band = min(0.02, 0.2 * we);
  float x = min(1.0 - clamp((depth - band) / max(we - band, 1e-4), 0.0, 1.0), 0.98);
  return vec2(x * smoothstep(0.0, 0.2, s.slope), we * sqrt(1.0 - x * x));
}

float m_studio5(vec2 r, vec2 rot, float keyRad, float drift, float str, float skyGain) {
  vec2 e = vec2(r.x * rot.x - r.y * rot.y, r.x * rot.y + r.y * rot.x);
  float sky = smoothstep(-0.7, 0.85, e.y);
  float lum = sky * sky * skyGain;
  lum += m_ss(keyRad, keyRad * 0.2, length(e - vec2(drift, 0.55))) * 1.7 * str;
  lum += m_ss(keyRad * 1.15, keyRad * 0.23, length(e - vec2(-0.55 + drift, 0.18))) * 1.05 * str;
  lum += m_ss(keyRad, keyRad * 0.2, length(e - vec2(0.55 + drift, 0.1))) * str;
  lum += m_ss(keyRad * 1.3, keyRad * 0.26, length(e - vec2(0.2 + drift, -0.5))) * 0.7 * str;
  lum += m_ss(keyRad * 1.1, keyRad * 0.22, length(e - vec2(-0.35 + drift, -0.25))) * 0.85 * str;
  return lum;
}

float m_ward(vec3 n, vec3 dir, vec3 L, vec3 V, float aT, float aB) {
  vec3 T = normalize(dir - n * dot(n, dir));
  vec3 B = cross(n, T);
  vec3 H = normalize(L - V);
  float hT = dot(H, T) / max(aT, 0.0001);
  float hB = dot(H, B) / max(aB, 0.0001);
  float hN = clamp(abs(dot(H, n)), 0.0001, 1.0);
  return exp(-(hT * hT + hB * hB) / ((hN + 1.0) * 0.5));
}

vec4 material(Surface s) {
  if (s.d > max(0.02, 2.0 * s.aa)) return vec4(0.0);
  float t = s.time * P_speed;
  vec2 dome = m_dome(s, P_bevel);
  vec3 n = vec3(s.n * dome.x, -sqrt(1.0 - dome.x * dome.x));
  float ba = radians(P_angle);
  vec2 T = vec2(cos(ba), sin(ba));
  vec2 B = vec2(-T.y, T.x);
  vec2 pat = (s.p + vec2(-0.7, 0.5) * dome.y) * 0.5;
  float along = dot(pat, T);
  float across = dot(pat, B);
  float aniso = P_streaks;
  float dens = P_density * 150.0;
  float driftA = sin(t * 0.05) * 0.35;
  float sheenAmt = aniso * 0.5 + 0.08;
  float sheen = m_noise(vec2(along * 1.3 + driftA, across * 6.5));
  float lines = m_noise(vec2(along * 4.5, across * dens)) + 0.5 * m_noise(vec2(along * 8.0 + 3.1, across * dens * 2.3 + 7.7));
  float rAcross = sheen * sheenAmt + lines * P_grain * 0.16;
  float rAlong = m_noise(vec2(along * 1.3 + 15.21 + driftA, across * 6.5)) * sheenAmt * 0.12;
  n = normalize(vec3(n.xy + B * rAcross + T * rAlong, n.z));
  vec3 view = normalize(vec3(s.p * 0.3, 1.0));
  float rough = clamp(P_roughness, 0.0, 1.0);
  vec3 R = reflect(view, n);
  float keyRad = mix(0.42, 0.16, 1.0 - rough);
  float drift = sin(t * 0.07) * 0.05;
  float stepv = aniso * (rough * 0.6 + 0.25) * 0.105;
  float env = 0.0;
  for (int i = 0; i < 9; i++) {
    float o = float(i - 4);
    env += m_studio5(R.xy + T * (stepv * o), vec2(1.0, 0.0), keyRad, drift, P_reflections, 0.38) * exp(-o * o / 8.82);
  }
  env /= 5.1032;
  float la = radians(P_lightAngle);
  vec3 L = normalize(vec3(cos(la), sin(la), -0.7));
  float baseA = mix(0.05, 0.45, rough);
  float spec = m_ward(n, vec3(T, 0.0), L, view, baseA * (1.0 + aniso * 7.0), max(baseA * (1.0 - aniso * 0.55), 0.02)) * mix(0.45, 1.1, 1.0 - rough);
  float grazing = 1.0 - clamp(-dot(n, view), 0.0, 1.0);
  float lit = clamp((env + spec) * (1.0 + grazing * grazing * grazing * 0.6), 0.0, 1.7);
  vec3 rgb = mix(m_lin(C_dark.rgb), m_lin(C_light.rgb), lit);
  return vec4(m_srgb(rgb), 1.0);
}
`},br={id:"quicksilver",name:"Quicksilver",kind:"shape",group:"metal",source:"shaders.com",animated:!0,outside:!1,surface:.15,params:[{name:"light",label:"Light color",type:"color",default:"#eef0f6"},{name:"dark",label:"Dark color",type:"color",default:"#141414"},{name:"bevel",label:"Bevel",type:"number",min:.02,max:.8,step:.01,default:.1},{name:"turbulence",label:"Turbulence",type:"number",min:0,max:1.5,step:.01,default:1},{name:"ripple",label:"Ripple scale",type:"number",min:.5,max:8,step:.01,default:3},{name:"swirl",label:"Swirl",type:"number",min:0,max:1.5,step:.01,default:1.5},{name:"sharpness",label:"Sharpness",type:"number",min:0,max:1,step:.01,default:.6},{name:"reflections",label:"Reflections",type:"number",min:0,max:2,step:.01,default:1.5},{name:"dispersion",label:"Dispersion",type:"number",min:0,max:1,step:.01,default:.25},{name:"lightAngle",label:"Light angle",type:"number",min:0,max:360,step:1,default:265},{name:"speed",label:"Velocidade",type:"number",min:0,max:4,step:.01,default:.5}],glsl:`
float m_ss(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

vec3 m_lin(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 m_srgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec2 m_hash22(vec2 p) {
  uvec2 u = floatBitsToUint(p * vec2(141421356.0, 2718281828.0));
  uint h = u.x ^ u.y;
  return vec2(uvec2(h) * uvec2(3141592653u, 1618033988u)) / 4294967295.0;
}

vec3 m_perlin(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec2 ga = m_hash22(i) * 2.0 - 1.0;
  vec2 gb = m_hash22(i + vec2(1.0, 0.0)) * 2.0 - 1.0;
  vec2 gc = m_hash22(i + vec2(0.0, 1.0)) * 2.0 - 1.0;
  vec2 gd = m_hash22(i + vec2(1.0, 1.0)) * 2.0 - 1.0;
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  float k = va - vb - vc + vd;
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
  vec2 deriv = ga + (gb - ga) * u.x + (gc - ga) * u.y + (ga - gb - gc + gd) * (u.x * u.y) + du * (u.yx * k + vec2(vb, vc) - va);
  return vec3(value, deriv);
}

float m_width(Surface s, float bevel) {
  float depth = max(-s.d, 0.0);
  float k = bevel - depth;
  float w = bevel;
  if (k <= 0.0) return w;
  for (int i = 0; i < 4; i++) {
    float g = shapeAt(s.p - s.n * k) + depth + k;
    float c = smoothstep(0.0, 0.5 * k, g);
    if (c <= 0.0) break;
    w = mix(w, depth + k - 0.5 * g, c);
    k *= 0.5;
  }
  return min(bevel, w);
}

vec2 m_dome(Surface s, float bevel) {
  float depth = max(-s.d, 0.0);
  float we = m_width(s, bevel);
  float x = min(1.0 - clamp(depth / max(we, 1e-4), 0.0, 1.0), 0.9995);
  return vec2(x * smoothstep(0.0, 0.2, s.slope), we * sqrt(1.0 - x * x));
}

float m_studio(vec2 r, float keyRad, float drift, float str) {
  float sky = smoothstep(-0.7, 0.85, r.y);
  float lum = sky * sky * 0.4;
  lum += m_ss(keyRad * 1.05, keyRad * 0.21, length(r - vec2(drift, 0.55))) * 1.75 * str;
  lum += m_ss(keyRad * 1.25, keyRad * 0.25, length(r - vec2(-0.45 + drift, -0.4))) * 1.15 * str;
  lum += m_ss(keyRad * 1.15, keyRad * 0.23, length(r - vec2(0.55 + drift, 0.1))) * 1.1 * str;
  return lum;
}

vec4 material(Surface s) {
  if (s.d > max(0.02, 2.0 * s.aa)) return vec4(0.0);
  float t = s.time * P_speed;
  vec2 dome = m_dome(s, P_bevel);
  vec3 n = vec3(s.n * dome.x, -sqrt(1.0 - dome.x * dome.x));
  vec2 pat = (s.p + vec2(-0.7, 0.5) * dome.y) * 0.5;
  float flowT = t * 0.12;
  vec2 q = pat * P_ripple * 2.6;
  vec2 wi = q * 0.6;
  vec2 w = vec2(
    sin(wi.x * 1.7 + flowT * 0.7 + 1.7) * cos(wi.y * 1.3 + flowT * 0.5 + 2.3),
    cos(wi.x * 1.4 + flowT * 0.9 + 8.7) * sin(wi.y * 1.6 + flowT * 0.6 + 5.1)
  );
  vec2 hg = clamp(m_perlin(q + w * P_swirl * 0.9).yz * 0.62, -4.0, 4.0);
  n = normalize(vec3(n.xy - hg * P_turbulence * 0.5, n.z));
  vec3 view = normalize(vec3(s.p * 0.3, 1.0));
  vec3 R = reflect(view, n);
  float sharp = clamp(P_sharpness, 0.0, 1.0);
  float keyRad = mix(0.5, 0.18, sharp);
  float drift = sin(t * 0.07) * 0.05;
  float la = radians(P_lightAngle);
  vec3 L = normalize(vec3(cos(la), sin(la), -0.7));
  vec3 H = normalize(L + vec3(0.0, 0.0, -1.0));
  float spec = pow(clamp(dot(n, H), 0.0, 1.0), mix(60.0, 900.0, sharp)) * mix(0.4, 1.4, sharp);
  float lumG = m_studio(R.xy, keyRad, drift, P_reflections) + spec;
  float dth = P_dispersion * 0.09 * (0.4 + (1.0 - clamp(-n.z, 0.0, 1.0)) * 1.3);
  float lumB = m_studio(vec2(R.x + R.y * dth, R.y - R.x * dth), keyRad, drift, P_reflections) + spec;
  vec3 lum = clamp(vec3(lumG * 2.0 - lumB, lumG, lumB), 0.0, 1.8);
  vec3 rgb = mix(m_lin(C_dark.rgb), m_lin(C_light.rgb), lum);
  return vec4(m_srgb(rgb), 1.0);
}
`},yr={id:"obsidian",name:"Obsidian",kind:"shape",group:"solid",source:"shaders.com",animated:!0,outside:!1,surface:.15,params:[{name:"body",label:"Body color",type:"color",default:"#06071a"},{name:"colors",label:"Iridescence",type:"colorArray",default:["#ff2f7a","#2a2cff","#5fe6ff","#a6ffd8","#ffb3e6"],minItems:2,maxItems:6},{name:"bevel",label:"Bevel",type:"number",min:.02,max:.8,step:.01,default:.16},{name:"strength",label:"Color strength",type:"number",min:0,max:1.5,step:.01,default:1},{name:"rimWidth",label:"Rim width",type:"number",min:0,max:1,step:.01,default:.55},{name:"rimSoftness",label:"Rim softness",type:"number",min:.02,max:.6,step:.01,default:.25},{name:"flowAngle",label:"Flow angle",type:"number",min:0,max:360,step:1,default:30},{name:"flowScale",label:"Flow scale",type:"number",min:.2,max:4,step:.01,default:1},{name:"gloss",label:"Gloss",type:"number",min:0,max:2,step:.01,default:.35},{name:"speed",label:"Velocidade",type:"number",min:0,max:4,step:.01,default:.5}],glsl:`
float m_ss(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

vec3 m_lin(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 m_srgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 m_oklab(vec3 c) {
  vec3 lms = vec3(
    dot(c, vec3(0.4122214708, 0.5363325363, 0.0514459929)),
    dot(c, vec3(0.2119034982, 0.6806995451, 0.1073969566)),
    dot(c, vec3(0.0883024619, 0.2817188376, 0.6299787005))
  );
  lms = sign(lms) * pow(abs(lms), vec3(1.0 / 3.0));
  return vec3(
    dot(lms, vec3(0.2104542553, 0.7936177850, -0.0040720468)),
    dot(lms, vec3(1.9779984951, -2.4285922050, 0.4505937099)),
    dot(lms, vec3(0.0259040371, 0.7827717662, -0.8086757660))
  );
}

vec3 m_fromOklab(vec3 lab) {
  vec3 lms = vec3(
    lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z,
    lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z,
    lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z
  );
  lms = lms * lms * lms;
  return vec3(
    dot(lms, vec3(4.0767416621, -3.3077115913, 0.2309699292)),
    dot(lms, vec3(-1.2684380046, 2.6097574011, -0.3413193965)),
    dot(lms, vec3(-0.0041960863, -0.7034186147, 1.7076147010))
  );
}

vec3 m_palette(float t) {
  float n = clamp(N_colors, 1.0, 6.0);
  if (n < 1.5) return m_lin(C_colors(0).rgb);
  float x = clamp(t, 0.0, 1.0) * (n - 1.0);
  float i = min(floor(x), n - 2.0);
  int k = int(i);
  vec3 a = m_oklab(m_lin(C_colors(k).rgb));
  vec3 b = m_oklab(m_lin(C_colors(k + 1).rgb));
  return max(m_fromOklab(mix(a, b, x - i)), 0.0);
}

float m_width(Surface s, float bevel) {
  float depth = max(-s.d, 0.0);
  float k = bevel - depth;
  float w = bevel;
  if (k <= 0.0) return w;
  for (int i = 0; i < 4; i++) {
    float g = shapeAt(s.p - s.n * k) + depth + k;
    float c = smoothstep(0.0, 0.5 * k, g);
    if (c <= 0.0) break;
    w = mix(w, depth + k - 0.5 * g, c);
    k *= 0.5;
  }
  return min(bevel, w);
}

vec2 m_dome(Surface s, float bevel) {
  float depth = max(-s.d, 0.0);
  float we = m_width(s, bevel);
  float x = min(1.0 - clamp(depth / max(we, 1e-4), 0.0, 1.0), 0.9995);
  return vec2(x * smoothstep(0.0, 0.2, s.slope), we * sqrt(1.0 - x * x));
}

float m_studio5(vec2 e, float keyRad, float str, float skyGain) {
  float sky = smoothstep(-0.7, 0.85, e.y);
  float lum = sky * sky * skyGain;
  lum += m_ss(keyRad, keyRad * 0.2, length(e - vec2(0.0, 0.55))) * 1.7 * str;
  lum += m_ss(keyRad * 1.15, keyRad * 0.23, length(e - vec2(-0.55, 0.18))) * 1.05 * str;
  lum += m_ss(keyRad, keyRad * 0.2, length(e - vec2(0.55, 0.1))) * str;
  lum += m_ss(keyRad * 1.3, keyRad * 0.26, length(e - vec2(0.2, -0.5))) * 0.7 * str;
  lum += m_ss(keyRad * 1.1, keyRad * 0.22, length(e - vec2(-0.35, -0.25))) * 0.85 * str;
  return lum;
}

vec4 material(Surface s) {
  if (s.d > max(0.02, 2.0 * s.aa)) return vec4(0.0);
  float t = s.time * P_speed + 3.0;
  vec2 dome = m_dome(s, P_bevel);
  vec3 n = vec3(s.n * dome.x, -sqrt(1.0 - dome.x * dome.x));
  vec3 view = normalize(vec3(s.p * 0.3, 1.0));
  float grazing = 1.0 - clamp(-dot(n, view), 0.0, 1.0);
  float rimEdge = 1.0 - P_rimWidth;
  float rim = smoothstep(rimEdge - P_rimSoftness, rimEdge + P_rimSoftness, grazing);
  float fa = radians(P_flowAngle);
  vec2 pat = (s.p + vec2(-0.7, 0.5) * dome.y) * 0.5;
  float along = dot(pat, vec2(cos(fa), sin(fa)));
  float phase = along * P_flowScale / 0.55 + grazing * 0.9 + t * 0.2;
  float m = mod(abs(phase), 2.0);
  vec3 iri = m_palette(m > 1.0 ? 2.0 - m : m);
  vec3 R = reflect(view, n);
  float shine = m_studio5(R.xy, 0.3, P_gloss, 0.25) * (0.04 + pow(grazing, 4.0) * 0.96);
  vec3 walls = mix(m_lin(C_body.rgb), iri, rim * P_strength);
  vec3 rgb = walls + mix(iri, vec3(1.0), 0.6) * shine * 0.5;
  return vec4(m_srgb(rgb), 1.0);
}
`},wr={id:"glass",name:"Glass",kind:"shape",group:"glass",source:"shaders.com",animated:!1,outside:!1,surface:"bevel",params:[{name:"tint",label:"Tint",type:"color",default:"#ffffff"},{name:"backdrop",label:"Backdrop",type:"select",options:[{value:0,label:"Artboard"},{value:1,label:"Studio"},{value:2,label:"Checker"}],default:0},{name:"bevel",label:"Bevel",type:"number",min:.04,max:.7,step:.01,default:.28},{name:"refraction",label:"Refraction",type:"number",min:0,max:2,step:.01,default:1},{name:"dispersion",label:"Dispersion",type:"number",min:0,max:1,step:.01,default:.5},{name:"blur",label:"Desfoque",type:"number",min:0,max:1,step:.01,default:0},{name:"edge",label:"Edge light",type:"number",min:0,max:1,step:.01,default:.7},{name:"highlight",label:"Highlight",type:"number",min:0,max:1,step:.01,default:.5},{name:"angle",label:"Light angle",type:"number",min:0,max:360,step:1,default:300}],glsl:`
float m_check(vec2 q, float w) {
  vec2 p = q / 0.125;
  vec2 f = vec2(w / 0.125 + 1e-3);
  vec2 i = 2.0 * (abs(fract((p - 0.5 * f) * 0.5) - 0.5) - abs(fract((p + 0.5 * f) * 0.5) - 0.5)) / f;
  return 0.5 - 0.5 * i.x * i.y;
}

float m_lobe(vec2 v, vec2 c, float r, float w) {
  return 1.0 - smoothstep(r * 0.2 - w, r + w, length(v - c));
}

vec3 m_studio(vec2 v, vec2 l, float w) {
  vec2 side = vec2(-l.y, l.x);
  float up = -dot(v, vec2(0.0, 1.0));
  vec3 c = vec3(0.3 + 0.25 * smoothstep(-0.3, 1.0, up));
  c *= 1.0 - 0.7 * m_lobe(v, -l * 0.7, 0.34, w + 0.15);
  c += vec3(1.5) * m_lobe(v, l * 0.62, 0.3, w);
  c += vec3(0.55) * m_lobe(v, side * 0.72 - l * 0.1, 0.24, w);
  c += vec3(0.3) * m_lobe(v, -side * 0.66 - l * 0.35, 0.28, w);
  return c;
}

vec4 m_behind(vec2 q, vec2 v, vec2 l, float w) {
  if (P_backdrop > 1.5) {
    return vec4(toLinear(vec3(mix(0.8, 0.6, m_check(q, w)))), 1.0);
  }
  float open = smoothstep(0.04, 0.6, length(v)) * 0.55;
  vec4 st = vec4(m_studio(v, l, w * 2.0) * open, open);
  if (P_backdrop > 0.5) return st;
  vec4 b = backdropAt(q);
  return vec4(toLinear(b.rgb) * b.a, b.a) + st * (1.0 - b.a);
}

vec4 material(Surface s) {
  float bw = max(P_bevel, 1e-3);
  vec2 g = s.n * min(s.slope, 1.0);
  float depth = clamp(-s.d / bw, 0.0, 1.0);
  float strength = (1.0 - depth) * (1.0 - depth);
  vec2 off = -g * 0.3 * P_refraction * strength;
  vec2 q = s.p + off;
  vec2 fq = fwidth(q);
  if (s.d > 0.02) return vec4(0.0);

  float a = radians(P_angle);
  vec2 l = vec2(cos(a), sin(a));
  float w = max(max(fq.x, fq.y), s.px) + P_blur * 0.15;
  vec2 chr = off * P_dispersion * 0.06;
  vec2 v = off / 0.3;
  vec2 cv = v * P_dispersion * 0.08;
  vec4 tR = m_behind(q + chr, v + cv, l, w);
  vec4 tG = m_behind(q, v, l, w);
  vec4 tB = m_behind(q - chr, v - cv, l, w);
  vec4 t = vec4(tR.r, tG.g, tB.b, tG.a);
  vec3 tint = toLinear(C_tint.rgb);
  t.rgb *= tint;
  float veilA = 0.05;
  t += vec4(tint * 0.45 * veilA, veilA) * (1.0 - t.a);

  vec3 N = domeNormal(s, bw);
  vec2 R = 2.0 * N.z * N.xy;
  float graze = 1.0 - N.z;
  float F = clamp(0.04 + 0.96 * graze * graze, 0.0, 1.0) * P_edge;
  vec3 E = m_studio(R, l, 0.0);
  vec4 col = vec4(E * F, F) + t * (1.0 - F);

  vec3 n3 = normalize(vec3(g, 2.0));
  vec3 h = vec3(l, 2.0) * 0.4472136;
  vec3 hk = normalize(normalize(vec3(l * 0.75, 0.66)) + vec3(0.0, 0.0, 1.0));
  float base = pow(hk.z, 48.0);
  float lobe = max(pow(max(dot(N, hk), 0.0), 48.0) - base, 0.0) / (1.0 - base);
  float spec = (pow(clamp(dot(n3, h), 0.0, 1.0), 22.6) * strength * 0.5 + lobe) * P_highlight;
  float fd = clamp(-s.d / 0.04, 0.0, 1.0);
  float rim = (1.0 - fd) * (1.0 - fd) * P_edge * 0.5;
  float facing = clamp(dot(g, l) * 0.5 + 0.5, 0.0, 1.0);
  float line = (1.0 - smoothstep(s.px * 0.5, s.px * 2.0, -s.d)) * (0.3 + 0.7 * facing) * P_edge;
  float light = spec + rim + line;
  col += vec4(vec3(light), light);
  col.a = clamp(col.a, 0.0, 1.0);
  return vec4(toDisplay(col.rgb / max(col.a, 1e-4)), col.a);
}
`},kr={id:"crystal",name:"Crystal",kind:"shape",group:"glass",source:"shaders.com",animated:!1,outside:!1,surface:"bevel",params:[{name:"tint",label:"Tint",type:"color",default:"#ffffff"},{name:"backdrop",label:"Backdrop",type:"select",options:[{value:0,label:"Artboard"},{value:1,label:"Studio"},{value:2,label:"Checker"}],default:0},{name:"facets",label:"Facets",type:"number",min:3,max:24,step:1,default:5},{name:"bevel",label:"Bevel",type:"number",min:.04,max:.7,step:.01,default:.3},{name:"refraction",label:"Refraction",type:"number",min:0,max:3,step:.01,default:1.2},{name:"dispersion",label:"Dispersion",type:"number",min:0,max:2,step:.01,default:.5},{name:"highlights",label:"Highlights",type:"number",min:0,max:2,step:.01,default:.35},{name:"shadows",label:"Shadows",type:"number",min:0,max:1,step:.01,default:.3},{name:"brightness",label:"Brilho",type:"number",min:.5,max:3,step:.01,default:.9},{name:"angle",label:"Light angle",type:"number",min:0,max:360,step:1,default:270}],glsl:`
uint m_rotl(uint x, uint k) {
  return (x << k) | (x >> (32u - k));
}

float m_mx(ivec2 c, uint z) {
  uint s0 = 3735928584u;
  uint a = s0 + uint(c.x);
  uint b = s0 + uint(c.y);
  uint h = s0 + z;
  h ^= b;
  h -= m_rotl(b, 14u);
  a ^= h;
  a -= m_rotl(h, 11u);
  b ^= a;
  b -= m_rotl(a, 25u);
  h ^= b;
  h -= m_rotl(b, 16u);
  a ^= h;
  a -= m_rotl(h, 4u);
  b ^= a;
  b -= m_rotl(a, 14u);
  h ^= b;
  h -= m_rotl(b, 24u);
  return float(h) / 4294967295.0;
}

vec4 m_cells(vec2 p) {
  vec2 fl = floor(p);
  ivec2 i = ivec2(fl);
  vec2 f = p - fl;
  float d1 = 1e6;
  float d2 = 1e6;
  vec2 s1 = vec2(0.0);
  vec2 s2 = vec2(0.0);
  ivec2 id = i;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      ivec2 c = i + ivec2(x, y);
      vec2 sp = vec2(x, y) + vec2(m_mx(c, 0u), m_mx(c, 1u));
      vec2 k = sp - f;
      float dd = dot(k, k);
      if (dd < d1) {
        d2 = d1;
        s2 = s1;
        d1 = dd;
        s1 = sp;
        id = c;
      } else if (dd < d2) {
        d2 = dd;
        s2 = sp;
      }
    }
  }
  float edge = (d2 - d1) / max(2.0 * length(s2 - s1), 1e-4);
  return vec4(vec2(id), edge, 0.0);
}

vec2 m_dir(vec4 c) {
  float ang = m_mx(ivec2(c.xy), 2u) * TAU;
  return vec2(cos(ang), sin(ang));
}

vec2 m_fold(vec2 d, float sector) {
  float r = length(d);
  float th = atan(d.y, d.x) + PI;
  float inSector = fract(th / sector) * sector;
  float folded = min(inSector, sector - inSector);
  return vec2(r * cos(folded), r * sin(folded));
}

float m_rand(vec2 id, vec2 k) {
  return fract(sin(dot(id, k)) * 43758.5453);
}

float m_check(vec2 q, float w) {
  vec2 p = q / 0.06;
  vec2 f = vec2(w / 0.06 + 1e-3);
  vec2 i = 2.0 * (abs(fract((p - 0.5 * f) * 0.5) - 0.5) - abs(fract((p + 0.5 * f) * 0.5) - 0.5)) / f;
  return 0.5 - 0.5 * i.x * i.y;
}

float m_lobe(vec2 v, vec2 c, float r) {
  return 1.0 - smoothstep(r * 0.2, r, length(v - c));
}

vec3 m_studio(vec2 v, vec2 l) {
  vec2 side = vec2(-l.y, l.x);
  vec3 c = vec3(0.42 + 0.3 * smoothstep(-0.6, 0.8, -v.y));
  c *= 1.0 - 0.8 * m_lobe(v, -l * 0.55, 0.34);
  c *= 1.0 - 0.6 * m_lobe(v, side * 0.62, 0.22);
  c += vec3(1.4) * m_lobe(v, l * 0.5, 0.26);
  c += vec3(0.6) * m_lobe(v, -side * 0.6 + l * 0.2, 0.2);
  return c;
}

vec4 m_behind(vec2 q, vec2 v, vec2 l, float w) {
  if (P_backdrop > 1.5) {
    return vec4(toLinear(vec3(mix(0.8, 0.6, m_check(q, w)))), 1.0);
  }
  float open = 0.62 + 0.3 * smoothstep(0.05, 0.6, length(v));
  vec4 st = vec4(m_studio(v, l) * open, open);
  if (P_backdrop > 0.5) return st;
  vec4 b = backdropAt(q);
  return vec4(toLinear(b.rgb) * b.a, b.a) + st * (1.0 - b.a);
}

vec4 material(Surface s) {
  if (s.d > 0.02) return vec4(0.0);
  float bw = max(P_bevel, 1e-3);
  vec2 g = s.n * min(s.slope, 1.0);
  vec2 pd = s.p * 0.5;
  float sdf = s.d * 0.5;
  float depthNorm = clamp(-s.d / bw, 0.0, 1.0);
  float rNorm = length(pd) / 0.35;
  float a = radians(P_angle);
  vec2 l = vec2(cos(a), sin(a));
  vec3 L = normalize(vec3(l, -0.75));
  vec3 H = normalize(L + vec3(0.0, 0.0, -1.0));
  vec3 L2 = normalize(vec3(-l.y, l.x, -0.4));
  vec3 H2 = normalize(L2 + vec3(0.0, 0.0, -1.0));

  float sector = TAU / max(P_facets, 1.0);
  vec2 fUv = m_fold(pd, sector);
  float vScale = P_facets * 1.2 * (1.0 + clamp(rNorm, 0.0, 1.0) * 0.6);
  vec4 c0 = m_cells(vec2(0.0));

  float cpx = s.px * 0.5 * vScale;
  vec2 p1 = fUv * vScale;
  vec4 c1 = m_cells(p1);
  vec2 n1 = m_dir(c1);
  float table = (all(equal(c1.xy, c0.xy)) ? 1.0 : 0.0) * (1.0 - smoothstep(0.3, 0.45, rNorm));
  float tableSuppress = 1.0 - table * 0.9;
  float bevelSlope = (1.0 - smoothstep(0.0, 1.0, depthNorm)) * 1.7 * (1.0 - table);
  vec3 nSurf = normalize(vec3(g * bevelSlope, -1.0));
  float grazing = 1.0 - clamp(-nSurf.z, 0.0, 1.0);
  float seam1 = smoothstep(0.0, 0.05 + cpx * 1.5, c1.z);
  float cellRand = m_rand(floor(p1), vec2(12.9898, 78.233));
  vec3 nF1 = normalize(nSurf + vec3(n1 * 0.55 * tableSuppress, 0.0));
  float ndlS = dot(nSurf, L);
  float ndl1 = (dot(nF1, L) - ndlS) * 2.2;

  vec2 p2 = fUv * vScale * 1.7 + vec2(3.7, 1.2);
  vec4 c2 = m_cells(p2);
  vec2 n2 = m_dir(c2);
  vec3 nF2 = normalize(nSurf + vec3(n2 * 0.4 * tableSuppress, 0.0));
  float ndl2 = (dot(nF2, L2) - dot(nSurf, L2)) * 2.2;

  float amp = clamp(P_refraction * 0.8, 0.0, 1.6);
  vec3 nRefr = normalize(nSurf + vec3(n1 * 0.75 * amp * tableSuppress, 0.0) + vec3(n2 * 0.55 * amp, 0.0));
  vec3 refr = refract(vec3(0.0, 0.0, 1.0), nRefr, 1.0 / (1.0 + P_refraction * 0.55));
  vec2 bend = refr.xy / max(refr.z, 0.25);

  float thickEff = clamp(-sdf, 0.0, 0.12) * 1.6;
  float offMag = thickEff * (0.55 + cellRand * 0.9);
  vec2 halo = -g * P_refraction * 0.15 * 0.4 * (1.0 - smoothstep(0.0, 1.0, depthNorm));
  vec2 off = (bend * offMag + halo) * 2.0;

  vec3 nBack = normalize(vec3(n2 * 0.7, -1.0));
  vec3 bounce = reflect(refr, nBack);
  vec2 bounceOff = bounce.xy / max(abs(bounce.z), 0.3) * thickEff * 0.8 * 2.0;
  float innerW = (grazing * 0.5 + 0.18) * (cellRand * 0.7 + 0.3);

  vec2 pb = pd + bend * thickEff * 1.2;
  vec2 p3 = m_fold(pb, sector) * vScale * 1.4 + vec2(9.1, 4.7);
  vec4 c3 = m_cells(p3);
  vec2 n3 = m_dir(c3);
  float cellRand3 = m_rand(floor(p3), vec2(31.727, 57.131));
  float w3 = clamp(thickEff * 2.5, 0.0, 1.0) * clamp(P_refraction * 1.2, 0.0, 1.0);
  float wedgeLit = dot(n3, l) * 0.5 + 0.5;
  float mosaicLevel = (cellRand3 * 0.9 + 0.55) * (wedgeLit * 0.7 + 0.65);
  float edge3 = smoothstep(0.0, 0.05 + cpx * 2.5, c3.z) * 0.45 + 0.55;
  float mosaicMul = mosaicLevel * edge3;
  float mosaicFire = smoothstep(0.75, 1.0, wedgeLit * (cellRand3 + 0.4)) * w3 * 0.8;

  vec2 lens = s.p / 1.5 + off;

  float lit1 = clamp(ndl1, 0.0, 1.0);
  float shadow1 = clamp(-ndl1, 0.0, 1.0);
  float bright1 = max(1.0 + lit1 * P_highlights - shadow1 * P_shadows, 0.02);
  float lit2 = clamp(ndl2, 0.0, 1.0);
  float shadow2 = clamp(-ndl2, 0.0, 1.0);
  float bright2 = 1.0 + lit2 * P_highlights * 0.5 - shadow2 * P_shadows * 0.5;
  float surfBright = 1.0 + clamp(ndlS, 0.0, 1.0) * P_highlights * 0.4 - clamp(-ndlS, 0.0, 1.0) * P_shadows * 0.6;
  float combined = bright1 * bright2 * surfBright;

  vec2 chr = off * P_dispersion * 0.12;
  float edgeDarken = mix(seam1, 1.0, table) * 0.4 + 0.6;
  float facetMul = (combined + table * 0.25) * edgeDarken * mix(1.0, mosaicMul, w3) * P_brightness;
  float ndh1 = clamp(dot(nF1, H), 0.0, 1.0);
  float ndh2 = clamp(dot(nF2, H2), 0.0, 1.0);
  float flash = (pow(ndh1, 110.0) * 2.2 + pow(ndh2, 56.0) * 0.9 + smoothstep(0.965, 0.995, ndh1) * 3.0 + mosaicFire) * P_highlights * P_brightness;
  float fresnel = pow(grazing, 3.75) * 0.05 * 2.0;

  float w = s.px;
  vec2 v = off / 0.2;
  vec2 cv = v * P_dispersion * 0.12;
  vec4 tR = m_behind(lens + chr, v + cv, l, w);
  vec4 tG = m_behind(lens, v, l, w);
  vec4 tB = m_behind(lens - chr, v - cv, l, w);
  vec4 tI = m_behind(lens + bounceOff, (off + bounceOff) / 0.2, l, w);
  vec4 primary = vec4(tR.r, tG.g, tB.b, tG.a);
  vec4 body = mix(primary, tI, innerW);
  body.rgb *= facetMul * toLinear(C_tint.rgb);
  float light = flash + fresnel;
  vec4 col = body + vec4(vec3(light), light);
  col.a = clamp(col.a, 0.0, 1.0);
  return vec4(toDisplay(col.rgb / max(col.a, 1e-4)), col.a);
}
`},_r={id:"frost",name:"Frost",kind:"shape",group:"glass",source:"shaders.com",animated:!0,outside:!1,surface:"bevel",params:[{name:"ice",label:"Ice color",type:"color",default:"#0597fc"},{name:"bevel",label:"Bevel",type:"number",min:.04,max:.7,step:.01,default:.3},{name:"density",label:"Densidade",type:"number",min:0,max:10,step:.01,default:5},{name:"frost",label:"Frost",type:"number",min:0,max:1,step:.01,default:.8},{name:"reach",label:"Frost depth",type:"number",min:0,max:1,step:.01,default:.6},{name:"scale",label:"Crystal scale",type:"number",min:.3,max:4,step:.01,default:1},{name:"sparkle",label:"Sparkle",type:"number",min:0,max:1,step:.01,default:.5},{name:"gloss",label:"Gloss",type:"number",min:0,max:1,step:.01,default:.6},{name:"angle",label:"Light angle",type:"number",min:0,max:360,step:1,default:300},{name:"speed",label:"Velocidade",type:"number",min:0,max:2,step:.01,default:.3}],glsl:`
uint m_hash(ivec2 c, uint k) {
  uvec2 v = uvec2(c) * 1664525u + uvec2(1013904223u, 1013904223u + k * 2654435769u);
  v.x += v.y * 1664525u;
  v.y += v.x * 1664525u;
  v ^= v >> 16u;
  v.x += v.y * 1664525u;
  v.y += v.x * 1664525u;
  v ^= v >> 16u;
  return v.x ^ v.y;
}

float m_grad(uint h, float x, float y) {
  uint k = h & 7u;
  float u = k < 4u ? x : y;
  float v = 2.0 * (k < 4u ? y : x);
  return ((k & 1u) != 0u ? -u : u) + ((k & 2u) != 0u ? -v : v);
}

float m_noise(vec2 p) {
  vec2 fl = floor(p);
  ivec2 i = ivec2(fl);
  vec2 f = p - fl;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = m_grad(m_hash(i, 0u), f.x, f.y);
  float b = m_grad(m_hash(i + ivec2(1, 0), 0u), f.x - 1.0, f.y);
  float c = m_grad(m_hash(i + ivec2(0, 1), 0u), f.x, f.y - 1.0);
  float d = m_grad(m_hash(i + ivec2(1, 1), 0u), f.x - 1.0, f.y - 1.0);
  return 0.6616 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float m_worley(vec2 p) {
  vec2 fl = floor(p);
  ivec2 i = ivec2(fl);
  vec2 f = p - fl;
  float best = 1e6;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      ivec2 c = i + ivec2(x, y);
      vec2 o = vec2(float(m_hash(c, 1u) >> 8u), float(m_hash(c, 2u) >> 8u)) / 16777216.0;
      vec2 diff = vec2(x, y) + o - f;
      best = min(best, dot(diff, diff));
    }
  }
  return best;
}

vec4 material(Surface s) {
  if (s.d > 0.02) return vec4(0.0);
  float t = s.time * P_speed;
  float bw = max(P_bevel, 1e-3);

  float ridge = smoothstep(0.15, 0.85, s.slope);
  float xb = clamp(1.0 + s.d / bw, 0.0, 1.0);
  float xs = clamp(1.0 + s.d / 0.7, 0.0, 1.0);
  float x = min(pow(pow(xb, 4.0) + pow(xs * 0.72, 4.0), 0.25), 0.97) * ridge;
  float slope = x / sqrt(1.0 - x * x);
  vec3 nBase = normalize(vec3(s.n * slope, -1.0));
  float steep = 1.0 / (1.0 + min(slope * slope, 2.0) * 2.0);
  float chord = 0.35 * sqrt(max(1.0 - xs * xs, 0.0));
  vec2 pat = vec2(s.p.x * 0.5 - chord * 0.7, -s.p.y * 0.5 - chord * 0.5);

  float thickness = clamp(chord * 2.0, 0.0, 1.2) * P_density;
  float depthT = clamp(thickness * 1.2, 0.0, 1.0);
  vec3 transmit = exp(-thickness * vec3(1.6, 0.85, 0.45));
  vec3 ice = toLinear(C_ice.rgb);
  vec3 scattered = mix(vec3(1.0), ice, depthT) * transmit;

  float reach = max(P_reach * 0.3, 0.01);
  float field = (1.0 - smoothstep(0.0, reach, chord)) * P_frost;
  vec3 fx = vec3(0.0);
  float glint = 0.0;
  float a = radians(P_angle);
  vec3 L = normalize(vec3(cos(a), sin(a), -0.6));
  vec3 H = normalize(L + vec3(0.0, 0.0, -1.0));
  if (field > 0.0) {
    float fs = P_scale * 60.0;
    float e = 0.004;
    float n0 = m_noise(pat * fs);
    float nx = (m_noise(vec2(pat.x + e, pat.y) * fs) - n0) / e;
    float ny = (m_noise(vec2(pat.x, pat.y + e) * fs) - n0) / e;
    float amp = field * 3.0 * steep;
    float wc = m_worley(pat * P_scale * 40.0);
    fx = vec3(nx * amp * 0.03, ny * amp * 0.03, (1.0 - smoothstep(0.0, 0.25, wc)) * field);
  }
  vec3 n = normalize(vec3(nBase.xy + fx.xy, nBase.z));
  float ndl = dot(n, L);
  float ndh = clamp(dot(n, H), 0.0, 1.0);
  if (field > 0.0) {
    float gf = m_noise(vec2(pat.x * 190.0 + 13.7, pat.y * 190.0 - 4.3)) * 0.5 + 0.5;
    float tw = sin(t * 3.0 + gf * 40.0) * 0.5 + 0.5;
    glint = smoothstep(0.72, 0.96, gf * tw) * (pow(ndh, 6.0) * 0.6 + 0.4) * field * P_sparkle;
  }

  float wrap = ndl * 0.5 + 0.5;
  float sss = pow(max(wrap, 0.0), 0.7);
  float back = clamp(dot(L, vec3(0.0, 0.0, 1.0)) * 0.5 + 0.5, 0.0, 1.0);
  vec3 forward = transmit * back * 0.5 * (1.0 - depthT * 0.4);
  vec3 sssRgb = scattered * (sss * 0.6 + 0.5) + forward * 0.5;
  vec3 frostRgb = vec3(0.95, 0.98, 1.0) * (fx.z * 0.4 + glint * 4.0);

  float graze = 1.0 - clamp(-n.z, 0.0, 1.0);
  vec3 fres = vec3(0.85, 0.93, 1.0) * pow(graze, 3.0) * 0.02 * 1.5;
  float spec = pow(ndh, 16.0) * 0.4 * P_gloss;
  vec3 rgb = sssRgb + vec3(spec) + fres + frostRgb;
  return vec4(toDisplay(rgb), 1.0);
}
`},zr={id:"water",name:"Water",kind:"shape",group:"glass",source:"shaders.com",animated:!0,outside:!1,surface:"bevel",params:[{name:"color",label:"Water color",type:"color",default:"#00bfeb"},{name:"bevel",label:"Bevel",type:"number",min:.04,max:.7,step:.01,default:.3},{name:"depth",label:"Profundidade",type:"number",min:0,max:8,step:.01,default:5},{name:"choppiness",label:"Choppiness",type:"number",min:0,max:1.5,step:.01,default:.8},{name:"waves",label:"Wave density",type:"number",min:1,max:12,step:.01,default:6},{name:"swirl",label:"Swirl",type:"number",min:0,max:1.5,step:.01,default:.6},{name:"caustics",label:"Caustics",type:"number",min:0,max:2,step:.01,default:.15},{name:"foam",label:"Foam",type:"number",min:0,max:1,step:.01,default:.3},{name:"angle",label:"Sun angle",type:"number",min:0,max:360,step:1,default:30},{name:"speed",label:"Velocidade",type:"number",min:0,max:4,step:.01,default:.5}],glsl:`
uint m_hash(ivec2 c) {
  uvec2 v = uvec2(c) * 1664525u + 1013904223u;
  v.x += v.y * 1664525u;
  v.y += v.x * 1664525u;
  v ^= v >> 16u;
  v.x += v.y * 1664525u;
  v.y += v.x * 1664525u;
  v ^= v >> 16u;
  return v.x ^ v.y;
}

float m_grad(uint h, float x, float y) {
  uint k = h & 7u;
  float u = k < 4u ? x : y;
  float v = 2.0 * (k < 4u ? y : x);
  return ((k & 1u) != 0u ? -u : u) + ((k & 2u) != 0u ? -v : v);
}

float m_noise(vec2 p) {
  vec2 fl = floor(p);
  ivec2 i = ivec2(fl);
  vec2 f = p - fl;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = m_grad(m_hash(i), f.x, f.y);
  float b = m_grad(m_hash(i + ivec2(1, 0)), f.x - 1.0, f.y);
  float c = m_grad(m_hash(i + ivec2(0, 1)), f.x, f.y - 1.0);
  float d = m_grad(m_hash(i + ivec2(1, 1)), f.x - 1.0, f.y - 1.0);
  return 0.6616 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float m_fbm(vec2 p) {
  float n0 = m_noise(p);
  float n1 = m_noise(p * 2.07 + vec2(4.3, 9.1)) * 0.5;
  float n2 = m_noise(p * 4.13 + vec2(1.7, 8.2)) * 0.25;
  return (n0 + n1 + n2) * 0.52;
}

vec3 m_sky(vec2 r, vec2 l, float sharp) {
  float up = clamp(r.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 above = mix(vec3(0.9, 0.96, 1.0), vec3(0.2, 0.46, 0.85), smoothstep(0.5, 1.0, up));
  vec3 base = mix(vec3(0.04, 0.1, 0.16), above, smoothstep(0.4, 0.55, up));
  vec2 sunAt = vec2(l.x * 0.8, l.y * 0.8 + 0.12);
  float rad = mix(0.5, 0.13, sharp);
  float sun = 1.0 - smoothstep(rad * 0.15, rad, length(r - sunAt));
  return base + vec3(1.0, 0.97, 0.88) * sun * 1.5;
}

vec4 material(Surface s) {
  if (s.d > 0.02) return vec4(0.0);
  float t = s.time * P_speed;
  float bw = max(P_bevel, 1e-3);
  float a = radians(P_angle);
  vec2 l = vec2(cos(a), sin(a));
  float sharp = 0.1;

  float ridge = smoothstep(0.15, 0.85, s.slope);
  float xb = clamp(1.0 + s.d / bw, 0.0, 1.0);
  float xs = clamp(1.0 + s.d / 0.7, 0.0, 1.0);
  float xw = xs * 0.72;
  float x = min(pow(pow(xb, 4.0) + pow(xw, 4.0), 0.25), 0.985) * ridge;
  vec3 G = normalize(vec3(s.n * x, sqrt(1.0 - x * x)));
  float dh = sqrt(max(1.0 - xs * xs, 0.0));
  float hz = 0.35 * dh;

  float wz = 0.16 * sqrt(max(1.0 - xb * xb, 0.0));
  vec2 pat = vec2(s.p.x * 0.5 - wz * 0.7, -s.p.y * 0.5 - wz * 0.5);
  float freq = P_waves * 2.4;
  float flowT = t * 0.2;
  vec2 q = vec2(pat.x * freq * 0.8, pat.y * freq * 1.25);
  vec2 wi = q * 0.6;
  vec2 warp = vec2(
    sin(wi.x * 1.7 + flowT * 0.7 + 1.7) * cos(wi.y * 1.3 + flowT * 0.5 + 2.3),
    cos(wi.x * 1.4 + flowT * 0.9 + 8.7) * sin(wi.y * 1.6 + flowT * 0.6 + 5.1)
  );
  vec2 qw = q + warp * P_swirl * 0.9 + vec2(0.0, -flowT);
  float n0 = m_noise(qw);
  float h0 = (n0 + m_noise(qw * 2.07 + vec2(4.3, 9.1)) * 0.5 + m_noise(qw * 4.13 + vec2(1.7, 8.2)) * 0.25) * 0.52;
  float h0n1 = n0 * 0.52;
  float re = 0.06;
  float hx = clamp((m_noise(qw + vec2(re, 0.0)) * 0.52 - h0n1) / re, -4.0, 4.0);
  float hy = clamp((m_noise(qw + vec2(0.0, re)) * 0.52 - h0n1) / re, -4.0, 4.0);
  float fre = 0.025;
  vec2 qf = qw * 3.3 + vec2(flowT * 1.7, -flowT * 1.15) + vec2(11.3, 4.7);
  float f0 = m_noise(qf) * 0.52;
  float fxg = clamp((m_noise(qf + vec2(fre, 0.0)) * 0.52 - f0) / fre, -4.0, 4.0);
  float fyg = clamp((m_noise(qf + vec2(0.0, fre)) * 0.52 - f0) / fre, -4.0, 4.0);
  float relief = P_choppiness * 0.5;
  float fine = P_choppiness * 0.22;
  vec3 n = normalize(vec3(G.x - hx * relief - fxg * fine, G.y - hy * relief - fyg * fine, -G.z));

  vec3 R = reflect(vec3(0.0, 0.0, 1.0), n);
  vec3 refl = m_sky(R.xy, l, sharp) * 2.0;

  float thickness = 0.7 * dh * P_depth;
  float depthT = clamp(thickness * 1.3, 0.0, 1.0);
  vec3 wc = toLinear(C_color.rgb);
  vec3 absorb = (1.0 - wc) * 2.2;
  vec3 transmit = exp(-thickness * absorb);
  vec3 shallow = mix(wc, vec3(1.0), 0.5);
  vec3 bodyTint = mix(shallow, wc, depthT) * transmit + wc * depthT * 0.18;

  vec3 L = normalize(vec3(l, -0.7));
  vec3 H = normalize(L + vec3(0.0, 0.0, -1.0));
  float ndl = dot(n, L);
  float diffuse = pow(clamp(ndl * 0.5 + 0.5, 0.0, 1.0), 0.8) * 0.5 + 0.5;

  vec3 tdir = refract(vec3(0.0, 0.0, 1.0), n, 1.0 / 1.333);
  vec3 transSky = m_sky(tdir.xy, l, sharp) * transmit;
  float clarityT = 0.4 * (1.0 - depthT * 0.8);
  vec3 body = mix(bodyTint, transSky * 0.6 + bodyTint * 0.4, clarityT) * diffuse;

  float causT = t * 3.0;
  vec2 causP = pat * 6.0 + vec2(sin(causT * 0.15) * 0.4, -causT * 0.3);
  float c1 = 1.0 - abs(m_fbm(causP));
  float c2 = 1.0 - abs(m_fbm(causP * 1.9 + vec2(3.7, -causT * 0.18)));
  float causV = pow(clamp(c1 * 0.6 + c2 * 0.4, 0.0, 1.0), 3.0);
  float causMask = (depthT * 0.8 + 0.2) * P_caustics;
  body = body * (1.0 + causV * causMask * 0.7) + vec3(0.55, 0.82, 1.0) * causV * causMask * 0.45;

  float graze = 1.0 - clamp(-n.z, 0.0, 1.0);
  float fres = clamp(0.04 + pow(graze, 5.0) * 0.96, 0.0, 1.0);
  vec3 col = mix(body, refl, fres);

  float ndh = clamp(dot(n, H), 0.0, 1.0);
  float spec = pow(ndh, mix(40.0, 600.0, sharp)) * mix(0.3, 1.3, sharp);
  col += vec3(1.0, 0.98, 0.92) * spec;

  float crest = smoothstep(0.62, 0.92, clamp(h0 * 0.5 + 0.5, 0.0, 1.0));
  float shore = 1.0 - smoothstep(0.0, 0.045, hz);
  float foam = clamp(crest + shore * 0.7, 0.0, 1.0) * P_foam;
  col = mix(col, vec3(1.0), foam * 0.85);

  return vec4(toDisplay(col), 1.0);
}
`},Tr={id:"thin-film",name:"Thin film",kind:"shape",group:"glass",source:"shaders.com",animated:!0,outside:!1,surface:"width",params:[{name:"palette",label:"Palette",type:"select",options:[{value:0,label:"Rainbow"},{value:1,label:"Personalizado"}],default:0},{name:"colors",label:"Cores",type:"colorArray",default:["#2b6fff","#ffffff","#ff7a21"],minItems:2,maxItems:5},{name:"width",label:"Rim width",type:"number",min:.04,max:.7,step:.01,default:.35},{name:"intensity",label:"Intensidade",type:"number",min:0,max:2,step:.01,default:1},{name:"thickness",label:"Film thickness",type:"number",min:0,max:1,step:.01,default:.5},{name:"dispersion",label:"Dispersion",type:"number",min:0,max:1,step:.01,default:.5},{name:"saturation",label:"Saturação",type:"number",min:0,max:1,step:.01,default:1},{name:"hue",label:"Hue shift",type:"number",min:0,max:1,step:.01,default:0},{name:"angle",label:"Light angle",type:"number",min:0,max:360,step:1,default:300},{name:"speed",label:"Velocidade",type:"number",min:-1,max:1,step:.01,default:.1}],glsl:`
vec3 m_oklab(vec3 c) {
  vec3 lms = mat3(0.4122214708, 0.2119034982, 0.0883024619, 0.5363325363, 0.6806995451, 0.2817188376, 0.0514459929, 0.1073969566, 0.6299787005) * c;
  lms = pow(max(lms, 0.0), vec3(1.0 / 3.0));
  return mat3(0.2104542553, 1.9779984951, 0.0259040371, 0.7936177850, -2.4285922050, 0.7827717662, -0.0040720468, 0.4505937099, -0.8086757660) * lms;
}

vec3 m_linear(vec3 lab) {
  vec3 lms = mat3(1.0, 1.0, 1.0, 0.3963377774, -0.1055613458, -0.0894841775, 0.2158037573, -0.0638541728, -1.2914855480) * lab;
  lms = lms * lms * lms;
  return mat3(4.0767416621, -1.2684380046, -0.0041960863, -3.3077115913, 2.6097574011, -0.7034186147, 0.2309699292, -0.3413193965, 1.7076147010) * lms;
}

vec3 m_custom(float phase) {
  float n = max(N_colors, 1.0);
  float t = fract(phase) * n;
  float i = floor(t);
  float f = t - i;
  int a = int(i);
  int b = int(mod(i + 1.0, n));
  vec3 ca = m_oklab(toLinear(C_colors(a).rgb));
  vec3 cb = m_oklab(toLinear(C_colors(b).rgb));
  return max(m_linear(mix(ca, cb, f)), 0.0);
}

vec4 material(Surface s) {
  if (s.d > 0.02) return vec4(0.0);
  float bw = max(P_width, 1e-3);
  float xb = clamp(1.0 + s.d / bw, 0.0, 1.0);
  float xw = clamp(1.0 + s.d / 0.7, 0.0, 1.0) * 0.72;
  float x = min(pow(pow(xb, 4.0) + pow(xw, 4.0), 0.25), 0.995);
  float cosView = sqrt(1.0 - x * x);
  float rim = pow(1.0 - cosView, 1.5);
  float halfChord = 0.5 * bw * sqrt(max(1.0 - x * x, 0.0));

  float a = radians(P_angle);
  vec2 l = vec2(cos(a), sin(a));
  vec2 n = s.n * smoothstep(0.0, 0.6, s.slope);
  float baseCos = dot(n, l);
  float baseSin = n.y * l.x - n.x * l.y;
  float theta = s.time * P_speed * TAU;
  float rotated = baseCos * cos(theta) + baseSin * sin(theta);
  float phase = P_hue + P_dispersion * rotated + P_thickness * halfChord * 10.0;

  vec3 film = P_palette > 0.5
    ? m_custom(phase)
    : cos((phase + vec3(0.0, 0.3333, 0.6667)) * TAU) * 0.5 + 0.5;
  vec3 col = mix(vec3(1.0), film, P_saturation) * P_intensity;
  float alpha = clamp(rim, 0.0, 1.0);
  vec3 shown = toDisplay(col * rim * alpha) / max(alpha, 1e-4);
  return vec4(shown, alpha);
}
`},Er={id:"neon",name:"Neon",kind:"shape",group:"light",source:"shaders.com",animated:!0,outside:!0,normals:!1,surface:.05,params:[{name:"color",label:"Tube",type:"color",default:"#00ddff"},{name:"shade",label:"Shade",type:"color",default:"#2f6bff"},{name:"glowColor",label:"Glow",type:"color",default:"#00ddff"},{name:"twoTone",label:"Two-tone",type:"number",min:0,max:1,step:.01,default:.5},{name:"width",label:"Tube width",type:"number",min:.006,max:.1,step:.001,default:.02},{name:"intensity",label:"Brilho",type:"number",min:.5,max:4,step:.01,default:1.5},{name:"core",label:"Hot core",type:"number",min:0,max:1,step:.01,default:.6},{name:"glow",label:"Glow strength",type:"number",min:0,max:2,step:.01,default:.6},{name:"glowSize",label:"Glow size",type:"number",min:.05,max:1,step:.01,default:.25},{name:"angle",label:"Light angle",type:"number",min:0,max:360,step:1,default:300},{name:"corners",label:"Corner rounding",type:"number",min:0,max:1,step:.01,default:.15},{name:"flicker",label:"Flicker",type:"number",min:0,max:1,step:.01,default:0},{name:"flow",label:"Flow",type:"number",min:0,max:1,step:.01,default:.3},{name:"speed",label:"Velocidade",type:"number",min:0,max:5,step:.1,default:.6}],glsl:`
float m_flicker(float t, float amount) {
  float c = sin(t * 17.13) + sin(t * 31.71) * 0.5 + sin(t * 47.29) * 0.3;
  float th = mix(-2.0, 0.8, amount);
  return smoothstep(th - 0.1, th + 0.1, c);
}

vec4 material(Surface s) {
  float tube = P_width * 0.5;
  float eps = 0.008 + P_corners * 0.03;
  float glowR = max(P_glowSize, 0.001);
  float reach = glowR * 0.56;
  float e2 = eps * 2.0;
  if (s.d > reach + e2 + s.aa) return vec4(0.0);
  if (s.d < -(P_width + e2 * 2.0 + s.aa * 2.0)) return vec4(0.0);

  float t = s.time * P_speed;
  float pxH = s.px * 0.5;
  float softPx = max(pxH, 0.004);

  float sC = s.d * 0.5;
  float sR = shapeAt(s.p + vec2(e2, 0.0)) * 0.5;
  float sL = shapeAt(s.p - vec2(e2, 0.0)) * 0.5;
  float sU = shapeAt(s.p + vec2(0.0, e2)) * 0.5;
  float sD = shapeAt(s.p - vec2(0.0, e2)) * 0.5;

  vec2 g = vec2(sR - sL, sU - sD) / (eps * 2.0);
  float sdf = mix(sC, (sC + sR + sL + sU + sD) / 5.0, P_corners);
  vec2 gn = g / max(length(g), 0.0001);

  float depth = clamp(-sdf / max(tube, 0.001), 0.0, 1.0);
  float inner = smoothstep(tube + softPx, tube - softPx, -sdf);
  float outer = smoothstep(softPx, -softPx, sdf);
  float tubeMask = outer * inner;

  float cz = sqrt(max(depth * (2.0 - depth), 0.0));
  vec3 n = vec3(gn * (1.0 - depth), cz);

  float a = radians(P_angle);
  vec3 L = normalize(vec3(cos(a), sin(a), 0.7));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float diffuse = clamp(dot(n, L), 0.0, 1.0);
  float shininess = exp2(8.0 - 0.5 * 7.0);
  float spec = pow(clamp(dot(n, H), 0.0, 1.0), shininess) * 0.5;

  float ang = atan(s.p.y, s.p.x);
  float flow = mix(1.0, sin(ang * 2.0 + t) * 0.5 + 0.5, P_flow);

  vec3 color = toLinear(C_color.rgb);
  vec3 shade = toLinear(C_shade.rgb);
  vec3 base = mix(color, mix(shade, color, diffuse), P_twoTone);
  vec3 tubeRgb = base * (0.12 + diffuse * 0.55 + cz * 0.35) + spec;
  float hot = smoothstep(0.55, 1.0, depth) * P_core * flow;
  tubeRgb = mix(tubeRgb, mix(color, vec3(1.0), 0.75), hot);
  tubeRgb *= mix(1.0, flow, 0.4);

  float so = max(sdf, 0.0);
  float glow = (exp(-so * 12.0 / glowR) * 0.7 + exp(-so * 4.0 / glowR) * 0.35) * P_glow;
  glow *= smoothstep(-0.003, 0.003, sdf);
  glow *= 1.0 - smoothstep(0.35, 1.0, s.d / reach);

  float level = P_intensity * m_flicker(t, P_flicker);
  vec3 tubeLit = tubeRgb * level;
  vec3 glowLit = toLinear(C_glowColor.rgb) * glow * level;
  float glowA = clamp(glow * 0.6, 0.0, 1.0);
  vec3 rgb = mix(glowLit, tubeLit, tubeMask);
  float alpha = max(tubeMask, glowA);

  vec3 shown = toDisplay(clamp(rgb * alpha, 0.0, 1.0));
  float outA = max(alpha, max(shown.r, max(shown.g, shown.b)));
  return vec4(shown / max(outA, 1e-4), outA);
}
`},Sr={id:"light-edge",name:"Light edge",kind:"shape",group:"light",source:"shaders.com",animated:!0,outside:!0,normals:!1,surface:.1,params:[{name:"colors",label:"Cores",type:"colorArray",default:["#2f6bff","#00e0ff","#bdf6ff"],minItems:1,maxItems:6},{name:"thickness",label:"Thickness",type:"number",min:.01,max:1,step:.01,default:.25},{name:"softness",label:"Softness",type:"number",min:0,max:1,step:.01,default:.5},{name:"intensity",label:"Intensidade",type:"number",min:0,max:1,step:.01,default:.6},{name:"bloom",label:"Bloom",type:"number",min:0,max:1,step:.01,default:.3},{name:"spots",label:"Spots",type:"number",min:1,max:5,step:1,default:3},{name:"spotSize",label:"Spot size",type:"number",min:0,max:1,step:.01,default:.5},{name:"pulse",label:"Pulse",type:"number",min:0,max:1,step:.01,default:0},{name:"smoke",label:"Smoke",type:"number",min:0,max:1,step:.01,default:.3},{name:"speed",label:"Velocidade",type:"number",min:0,max:4,step:.1,default:1},{name:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],glsl:`
float m_hash12(vec2 p) {
  uvec2 u = floatBitsToUint(p * vec2(141421356.0, 2718281828.0));
  return float((u.x ^ u.y) * 3141592653u) / 4294967295.0;
}

vec2 m_hash22(vec2 p) {
  uvec2 u = floatBitsToUint(p * vec2(141421356.0, 2718281828.0));
  uint h = u.x ^ u.y;
  return vec2(float(h * 3141592653u), float(h * 1618033988u)) / 4294967295.0;
}

float m_value(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(m_hash12(i), m_hash12(i + vec2(1.0, 0.0)), f.x),
    mix(m_hash12(i + vec2(0.0, 1.0)), m_hash12(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

vec4 material(Surface s) {
  float th = max(0.5 * P_thickness * 0.35, 0.002);
  float reach = max(th * 3.2, 0.14);
  if (s.d > reach) return vec4(0.0);
  float soft = P_softness;
  float anim = s.time * P_speed;
  float t = anim * 1.2 + 131.0;

  float bt = 0.18 * anim;
  float beat = clamp(pow(abs(sin(bt * TAU)), 10.0) + 0.6 * pow(abs(sin((bt - 0.15) * TAU)), 10.0), 0.0, 1.0);

  float depth = max(-s.d * 0.5, 0.0);
  float field = s.d > 0.0 ? s.d * 0.5 : -sqrt(depth * (0.7 - depth));
  float f = field + mix(th, 0.0, soft);
  float bd = abs(f);
  float borderTh = mix(th, 3.0 * th, soft);
  float aa = s.px;
  float e0 = min(mix(borderTh, -borderTh, soft), borderTh + aa);
  float e1 = max(mix(borderTh, -borderTh, soft), borderTh + aa);
  float border = 1.0 - smoothstep(e0, e1, bd);
  border = pow(clamp(border, 0.0, 1.0), 1.0 + soft);

  vec2 suv = s.p * 0.5 * 1.75;
  float drift = 0.5 * t;
  float n1 = m_value(suv * 2.7 + drift);
  float n2 = m_value(suv * 3.4 - drift);
  float smoke = clamp(3.0 * n1, 0.0, 1.0) - n2;
  float smokeTh = clamp(th + 0.2, 0.1, 0.4);
  float smokeBand = pow(clamp(1.0 - smoothstep(-smokeTh, smokeTh + aa, bd), 0.0, 1.0), 2.0);
  smoke *= smokeBand;
  smoke = 30.0 * smoke * smoke * (0.5 * P_smoke * P_smoke);
  smoke *= mix(1.0, beat, P_pulse);
  border = clamp(border + clamp(smoke, 0.0, 1.0), 0.0, 1.0);
  border *= 1.0 - smoothstep(reach * 0.55, reach, s.d);

  float angle01 = atan(s.p.y, s.p.x) / TAU;
  float boost = 1.0 + (1.0 + 4.0 * soft) * P_intensity;
  float seed = P_variation;

  vec3 mixed = vec3(0.0);
  float w = 0.0;
  float ba = 0.0;
  vec3 ac = vec3(0.0);
  float aacc = 0.0;
  for (int k = 0; k < 6; k++) {
    if (float(k) >= N_colors) break;
    float ci = float(k);
    float over = 0.0;
    float add = 0.0;
    for (int j = 0; j < 5; j++) {
      float sj = float(j);
      if (sj >= P_spots) break;
      vec2 rv = m_hash22(vec2(sj * 10.0 + 2.0 + seed * 7.31, 40.0 + ci + seed * 3.17));
      float sf = 0.1 + 0.15 * abs(sin(sj * (2.0 + ci)) * cos(sj * (2.0 + 2.5 * ci)));
      float dir = rv.y < 0.5 ? -1.0 : 1.0;
      float st = (sf * t + rv.x * 3.0) * dir;
      bool even = abs(ci - 2.0 * floor(ci * 0.5)) < 0.5;
      float wave = even ? sin(t + sj * (5.0 - 1.5 * ci)) : cos(t + sj * (3.0 + 1.3 * ci));
      float mask = 0.5 + 0.5 * wave;
      float pw = clamp(2.0 * P_pulse - rv.x, 0.0, 1.0);
      mask = mix(mask, beat, pw);
      float atg = fract(angle01 + st);
      float ss = 0.05 + 0.6 * P_spotSize * P_spotSize + 0.05 * rv.x;
      ss = mix(ss, 0.1, pw);
      float sector = smoothstep(0.5 - ss, 0.5, atg) * (1.0 - smoothstep(0.5, 0.5 + ss, atg));
      sector = clamp(sector * mask * border * boost, 0.0, 1.0);
      over += (1.0 - over) * sector;
      add += sector;
    }
    vec4 c = C_colors(k);
    vec3 lc = toLinear(c.rgb);
    float wn = c.a * over;
    float tt = wn / max(w + wn, 0.00001);
    mixed = mix(mixed, lc, tt);
    ba += (1.0 - ba) * wn;
    ac += lc * c.a * add;
    aacc += c.a * add;
    w += wn;
  }

  float kb = P_bloom * 4.0;
  vec3 accumC = mix(mixed * ba, ac, kb);
  float accumA = clamp(mix(ba, aacc, kb), 0.0, 1.0);
  vec3 straight = clamp(accumC / max(accumA, 0.0001), 0.0, 1.0);

  vec3 shown = toDisplay(straight * accumA);
  float outA = max(accumA, max(shown.r, max(shown.g, shown.b)));
  return vec4(shown / max(outA, 1e-4), outA);
}
`},Pr={id:"irradiance",name:"Irradiance",kind:"shape",group:"light",source:"shaders.com",animated:!0,heavy:!0,outside:!0,surface:"bevel",params:[{name:"lightA",label:"Claro",type:"color",default:"#8fb0ff"},{name:"lightB",label:"Second light",type:"color",default:"#ffb347"},{name:"angle",label:"Light angle",type:"number",min:0,max:360,step:1,default:315},{name:"distance",label:"Light distance",type:"number",min:.5,max:2,step:.01,default:1.15},{name:"intensity",label:"Intensidade",type:"number",min:0,max:8,step:.01,default:3},{name:"reach",label:"Spill",type:"number",min:.03,max:.6,step:.01,default:.13},{name:"core",label:"Rim",type:"number",min:0,max:2,step:.01,default:1},{name:"shadows",label:"Shadows",type:"boolean",default:!0},{name:"body",label:"Body",type:"color",default:"#2e2e2e"},{name:"bevel",label:"Bevel",type:"number",min:.005,max:.3,step:.001,default:.03},{name:"speed",label:"Orbit speed",type:"number",min:0,max:2,step:.01,default:.15}],glsl:`
const float m_RANGE = 2.4;
const float m_HEIGHT = 1.0;
const float m_WRAP = 0.1;
const float m_CW = 1.0;

float m_invSq(float dist) {
  float r = dist / m_RANGE;
  return 1.0 / (1.0 + r * r);
}

float m_facing(vec2 n, vec2 from, vec2 light) {
  vec2 toL = light - from;
  float dist = length(toL);
  float f = clamp((dot(n, toL / max(dist, 1e-4)) + m_WRAP) / (1.0 + m_WRAP), 0.0, 1.0);
  return f * m_invSq(dist);
}

float m_visible(vec2 from, vec2 light, float eps) {
  vec2 seg = light - from;
  float len = length(seg);
  vec2 dir = seg / max(len, 1e-4);
  float vis = 1.0;
  float t = eps * 2.0;
  for (int k = 0; k < 8; k++) {
    if (t >= len) break;
    vec2 q = from + dir * t;
    float dd = shapeAt(q);
    vis = min(vis, clamp(dd / max(t * 0.4, eps), 0.0, 1.0));
    if (vis <= 0.0 || (dot(q, q) > 1.44 && dot(q, dir) > 0.0)) break;
    t += max(dd, eps);
  }
  return vis;
}

vec3 m_tone(vec3 c) {
  return 1.0 - exp(-c);
}

vec4 material(Surface s) {
  float reach = P_reach;
  if (s.d > reach) return vec4(0.0);

  float a = radians(P_angle) + s.time * P_speed;
  vec2 l0 = vec2(cos(a), sin(a)) * P_distance;
  vec2 l1 = -l0;
  vec3 c0 = toLinear(C_lightA.rgb) * P_intensity;
  vec3 c1 = toLinear(C_lightB.rgb) * P_intensity;
  vec3 bodyC = toLinear(C_body.rgb);

  vec3 body = vec3(0.0);
  if (s.cov > 0.0) {
    float rimT = clamp(-s.d / max(P_bevel, 0.003), 0.0, 1.0);
    float sb = min(1.0 - rimT, 0.9995) * smoothstep(0.15, 0.85, s.slope);
    vec3 n = vec3(s.n * sb, sqrt(1.0 - sb * sb));
    vec3 lit = vec3(0.0);
    for (int i = 0; i < 2; i++) {
      vec2 lp = i == 0 ? l0 : l1;
      vec3 lc = i == 0 ? c0 : c1;
      vec2 delta = lp - s.p;
      vec3 L = normalize(vec3(delta, m_HEIGHT));
      float bodyLit = m_invSq(length(delta)) * 0.6;
      vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
      float glint = pow(max(dot(n, H), 0.0), 60.0) * 0.6;
      lit += bodyC * max(dot(n, L), 0.0) * bodyLit + lc * glint * bodyLit;
    }
    body = m_tone(bodyC * 0.3 + lit);
  }

  vec4 glow = vec4(0.0);
  if (s.cov < 1.0) {
    float eps = max(s.px * 1.5, 0.003);
    float lift = max(eps * 2.0 - s.d, 0.0);
    vec2 o = s.p + s.n * lift;
    float d0 = s.d + lift;
    float base = s.slope > 1e-4 ? atan(-s.n.y, -s.n.x) : 0.0;
    float acc0 = 0.0;
    float acc1 = 0.0;
    for (int i = 0; i < 4; i++) {
      float ang = base + (float(i) + 0.5) * TAU / 4.0;
      vec2 dir = vec2(cos(ang), sin(ang));
      float d1 = shapeAt(o + dir * d0);
      float t2 = d0 + max(d1, eps);
      float d2 = shapeAt(o + dir * t2);
      float best = min(d1 / (d0 * m_CW), d2 / (t2 * m_CW));
      float cover = (0.99 - clamp(best, 0.0, 1.0)) / 0.99;
      if (cover > 0.0) {
        vec2 pos = o + dir * t2;
        float gx = shapeAt(pos + vec2(eps, 0.0)) - d2;
        float gy = shapeAt(pos + vec2(0.0, eps)) - d2;
        vec2 hn = normalize(vec2(gx, gy + 1e-6));
        vec2 hit = pos - hn * d2;
        acc0 += cover * m_facing(hn, hit, l0);
        acc1 += cover * m_facing(hn, hit, l1);
      }
    }
    float w = max(0.01, s.px * 1.5);
    float rim = (1.0 - smoothstep(0.0, w, max(s.d, 0.0))) * P_core;
    vec2 ep = s.p - s.n * max(s.d, 0.0);
    float fade = 1.0 - smoothstep(reach * 0.25, reach, max(s.d, 0.0));
    float e0 = acc0 / 4.0 * fade + m_facing(s.n, ep, l0) * rim;
    float e1 = acc1 / 4.0 * fade + m_facing(s.n, ep, l1) * rim;
    if (P_shadows > 0.5) {
      if (e0 > 0.0) e0 *= m_visible(o, l0, eps);
      if (e1 > 0.0) e1 *= m_visible(o, l1, eps);
    }
    vec3 g = m_tone(c0 * e0 + c1 * e1);
    float ga = clamp(max(g.r, max(g.g, g.b)), 0.0, 1.0);
    glow = vec4(g / max(ga, 1e-4), ga);
  }

  vec3 rgb = mix(glow.rgb, body, s.cov);
  float alpha = mix(glow.a, 1.0, s.cov);
  vec3 shown = toDisplay(clamp(rgb * alpha, 0.0, 1.0));
  float outA = max(alpha, max(shown.r, max(shown.g, shown.b)));
  return vec4(shown / max(outA, 1e-4), outA);
}
`},Rr={id:"hologram",name:"Hologram",kind:"shape",group:"light",source:"shaders.com",animated:!0,outside:!0,surface:.1,params:[{name:"color",label:"Cor",type:"color",default:"#5ec8ff"},{name:"brightness",label:"Brilho",type:"number",min:.2,max:3,step:.01,default:2.5},{name:"fill",label:"Fill",type:"number",min:0,max:1,step:.01,default:.45},{name:"edgeGlow",label:"Edge glow",type:"number",min:0,max:2.5,step:.01,default:1},{name:"depthLines",label:"Depth lines",type:"number",min:0,max:1,step:.01,default:.5},{name:"density",label:"Line density",type:"number",min:4,max:70,step:1,default:26},{name:"scanlines",label:"Scanlines",type:"number",min:0,max:1,step:.01,default:.55},{name:"scanCount",label:"Scanline count",type:"number",min:20,max:400,step:1,default:130},{name:"flicker",label:"Flicker",type:"number",min:0,max:1,step:.01,default:.3},{name:"distortion",label:"Distortion",type:"number",min:0,max:1,step:.01,default:.1},{name:"speed",label:"Velocidade",type:"number",min:0,max:3,step:.01,default:1}],glsl:`
uint m_rotl(uint x, int k) {
  return (x << uint(k)) | (x >> uint(32 - k));
}

uint m_hashInt(int x, int y) {
  uint seed = 0xdeadbeefu + (2u << 2u) + 13u;
  uint a = seed + uint(x);
  uint b = seed + uint(y);
  uint c = seed;
  c ^= b; c -= m_rotl(b, 14);
  a ^= c; a -= m_rotl(c, 11);
  b ^= a; b -= m_rotl(a, 25);
  c ^= b; c -= m_rotl(b, 16);
  a ^= c; a -= m_rotl(c, 4);
  b ^= a; b -= m_rotl(a, 14);
  c ^= b; c -= m_rotl(b, 24);
  return c;
}

float m_grad(uint h, float x, float y) {
  h &= 7u;
  float u = h < 4u ? x : y;
  float v = 2.0 * (h < 4u ? y : x);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_perlin(vec2 p) {
  int X = int(floor(p.x));
  int Y = int(floor(p.y));
  float fx = p.x - float(X);
  float fy = p.y - float(Y);
  float u = fx * fx * fx * (fx * (fx * 6.0 - 15.0) + 10.0);
  float v = fy * fy * fy * (fy * (fy * 6.0 - 15.0) + 10.0);
  float a = m_grad(m_hashInt(X, Y), fx, fy);
  float b = m_grad(m_hashInt(X + 1, Y), fx - 1.0, fy);
  float c = m_grad(m_hashInt(X, Y + 1), fx, fy - 1.0);
  float d = m_grad(m_hashInt(X + 1, Y + 1), fx - 1.0, fy - 1.0);
  return 0.6616 * mix(mix(a, b, u), mix(c, d, u), v);
}

float m_hash12(vec2 p) {
  uvec2 u = floatBitsToUint(p * vec2(141421356.0, 2718281828.0));
  return float((u.x ^ u.y) * 3141592653u) / 4294967295.0;
}

vec4 material(Surface s) {
  if (s.d > 0.06) return vec4(0.0);
  float t = s.time * P_speed;
  float uvY = s.p.y * 0.5 + 0.5;
  vec2 grad = s.n * s.slope;

  float wob = sin(uvY * 38.0 + t * 2.3) * 0.5 + sin(uvY * 11.5 - t * 1.7) * 0.5;
  float d = s.d + grad.x * wob * P_distortion * 0.024;
  float cov = clamp(0.5 - d / s.aa, 0.0, 1.0);
  if (cov <= 0.0) return vec4(0.0);

  float depthT = max(-d * 0.5, 0.0);
  float px = s.px * 0.5;
  float R = 0.35;
  float tt = min(depthT, R);
  float z = sqrt(max(tt * (2.0 - tt / R) * R, 0.0));
  float dz = depthT < R ? (R - tt) / max(z, px) : 0.0;
  float slope = min(dz * s.slope, 2.0);
  vec3 nrm = normalize(vec3(s.n * slope, -1.0));
  float fres = pow(clamp(1.0 - abs(nrm.z), 0.0, 1.0), 2.2);
  float thickness = z;
  float rimBase = exp(-z * 5.5) * 0.55 + fres;
  float metric = 1.2 - z;
  float rate = dz * s.slope;
  float gradX = clamp(dz, 0.0, 4.0) * grad.x;
  float rim = rimBase * P_edgeGlow;
  float bodyFill = (1.0 - exp(-thickness * 5.0)) * P_fill;

  float phase = metric * P_density - t * 1.2;
  float fr = fract(phase);
  float distI = min(fr, 1.0 - fr);
  float periodPx = 1.0 / max(P_density * rate * px, 1e-5);
  float lines = 1.0 - smoothstep(0.0, 0.06, distI);
  lines = mix(0.12, lines, smoothstep(2.0, 4.0, periodPx));
  float contour = lines * P_depthLines;

  float scanPhase = uvY * P_scanCount - t * 3.0;
  float scan = sin(scanPhase * TAU) * 0.5 + 0.5;
  float scanPx = 1.0 / max(P_scanCount * px, 1e-5);
  scan = mix(0.5, scan, smoothstep(1.8, 3.5, scanPx));
  float scanMask = mix(1.0, scan, P_scanlines);

  float sweepD = uvY - fract(t * 0.16);
  float sweepGlow = exp(-sweepD * sweepD * 650.0) * 0.1;

  float shimmer = sin(t * 40.0) * 0.04 + sin(t * 23.3) * 0.03;
  float drop = smoothstep(0.6, 0.95, m_perlin(vec2(t * 6.0, 11.0)) * 0.5 + 0.5);
  float flick = (1.0 + shimmer) * (1.0 - P_flicker * drop * 0.7);

  float gn = m_hash12(vec2(s.frag.x + t * 57.3, s.frag.y));
  float grainMul = 1.0 + (gn - 0.5) * 0.45 * 0.6;

  float glow = bodyFill + rim + contour;
  float core = (glow * scanMask * flick * grainMul + sweepGlow * scanMask) * P_brightness;

  float fringe = rim * gradX * (P_distortion * 0.12 + 0.04) * 0.1;
  vec3 color = toLinear(C_color.rgb);
  vec3 rgb = vec3(color.r * (core + fringe), color.g * core, color.b * (core - fringe));
  float hot = clamp(rim * 0.5 + sweepGlow, 0.0, 0.8);
  rgb = mix(rgb, vec3(core), hot);
  float alpha = clamp(core, 0.0, 1.0) * cov;

  vec3 shown = toDisplay(clamp(rgb * alpha, 0.0, 1.0));
  float outA = max(alpha, max(shown.r, max(shown.g, shown.b)));
  return vec4(shown / max(outA, 1e-4), outA);
}
`},Ar={id:"holo-foil",name:"Holo foil",kind:"shape",group:"light",source:"shaders.com",animated:!0,outside:!1,surface:.08,params:[{name:"hueShift",label:"Hue shift",type:"number",min:0,max:360,step:1,default:0},{name:"foilScale",label:"Patch size",type:"number",min:.3,max:6,step:.01,default:1.5},{name:"saturation",label:"Saturação",type:"number",min:0,max:1,step:.01,default:.75},{name:"silver",label:"Silver",type:"number",min:0,max:1,step:.01,default:.5},{name:"roughness",label:"Roughness",type:"number",min:0,max:1,step:.01,default:.25},{name:"crinkle",label:"Crinkle",type:"number",min:0,max:1,step:.01,default:.5},{name:"crinkleScale",label:"Crinkle size",type:"number",min:.3,max:6,step:.01,default:1},{name:"sparkle",label:"Glitter",type:"number",min:0,max:1,step:.01,default:.55},{name:"speed",label:"Velocidade",type:"number",min:0,max:2,step:.01,default:1}],glsl:`
const vec2 m_LD = vec2(0.5, -0.8660254);
const vec3 m_L = vec3(0.37164709, -0.64371163, -0.66896474);

uint m_rotl(uint x, int k) {
  return (x << uint(k)) | (x >> uint(32 - k));
}

uint m_hashInt(int x, int y) {
  uint seed = 0xdeadbeefu + (2u << 2u) + 13u;
  uint a = seed + uint(x);
  uint b = seed + uint(y);
  uint c = seed;
  c ^= b; c -= m_rotl(b, 14);
  a ^= c; a -= m_rotl(c, 11);
  b ^= a; b -= m_rotl(a, 25);
  c ^= b; c -= m_rotl(b, 16);
  a ^= c; a -= m_rotl(c, 4);
  b ^= a; b -= m_rotl(a, 14);
  c ^= b; c -= m_rotl(b, 24);
  return c;
}

float m_grad(uint h, float x, float y) {
  h &= 7u;
  float u = h < 4u ? x : y;
  float v = 2.0 * (h < 4u ? y : x);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_noise(vec2 p) {
  int X = int(floor(p.x));
  int Y = int(floor(p.y));
  float fx = p.x - float(X);
  float fy = p.y - float(Y);
  float u = fx * fx * fx * (fx * (fx * 6.0 - 15.0) + 10.0);
  float v = fy * fy * fy * (fy * (fy * 6.0 - 15.0) + 10.0);
  float a = m_grad(m_hashInt(X, Y), fx, fy);
  float b = m_grad(m_hashInt(X + 1, Y), fx - 1.0, fy);
  float c = m_grad(m_hashInt(X, Y + 1), fx, fy - 1.0);
  float d = m_grad(m_hashInt(X + 1, Y + 1), fx - 1.0, fy - 1.0);
  return 0.6616 * mix(mix(a, b, u), mix(c, d, u), v);
}

vec3 m_rainbow(float t) {
  return cos((t + vec3(0.0, 1.0 / 3.0, 2.0 / 3.0)) * TAU) * 0.5 + 0.5;
}

vec4 material(Surface s) {
  if (s.d > 0.02) return vec4(0.0);
  float t = s.time * P_speed;
  float sdf = s.d * 0.5;
  vec2 pd = s.p * 0.5;
  vec2 grad = s.n * s.slope;

  float edgeT = clamp(-sdf / 0.06, 0.0, 1.0);
  vec2 base = grad * (1.0 - edgeT) * 0.35;

  float crScale = P_crinkleScale * 1.35;
  float crAmp = P_crinkle * 0.8;
  float neps = 0.02;
  vec2 cq = pd * crScale + vec2(2.7, 11.3);
  float w0 = m_noise(cq);
  float wx = (m_noise(cq + vec2(neps * crScale, 0.0)) - w0) / neps;
  float wy = (m_noise(cq + vec2(0.0, neps * crScale)) - w0) / neps;
  vec3 n = normalize(vec3(base + vec2(wx, wy) * crAmp * 0.4, -1.0));

  float fScale = P_foilScale * 2.2;
  float drift = t * 0.06;
  float blotch = m_noise(pd * fScale + drift * m_LD)
    + m_noise(pd * fScale * 2.1 + vec2(5.2, 9.4) - drift * m_LD * 1.6) * 0.4;
  float tilt = dot(n.xy, m_LD);
  float ramp = dot(pd, m_LD) * 0.8;
  float sv = clamp(P_silver, 0.0, 1.0);
  float s1 = smoothstep(0.0, 0.5, sv);
  float s2 = smoothstep(0.4, 1.0, sv);
  float hue = blotch * 0.45 * mix(1.0, 0.5, s2) + ramp * mix(1.0, 1.8, s2) + tilt * 1.4 + t * 0.18 + P_hueShift / 360.0;

  float sat = clamp(P_saturation, 0.0, 1.0);
  float env = smoothstep(-0.5, 0.5, dot(n.xy, vec2(0.6, 0.8)) * 3.0 + dot(pd, vec2(-0.5, 0.9)) * 1.2);
  vec3 silver = vec3(0.72, 0.73, 0.76) * mix(1.0, 0.3 + 0.75 * env, s1);
  float k = mix(1.0, 1.8, s1);
  float w = mix(1.0, 0.55, s1) * mix(1.0, 0.62, s2);
  float u = fract(hue * k + 0.5) - 0.5;
  float inBand = 1.0 - smoothstep(0.3 * w, 0.5 * w, abs(u));
  float bandHue = mix(0.0, 0.6667, s1) + u / w * mix(1.0, 0.6667, s1);
  vec3 spectral = pow(m_rainbow(bandHue), vec3(mix(1.0, 2.4, s2))) * mix(1.0, 1.25, s2);
  float spectralAmt = sat * mix(0.85, inBand * mix(0.85, 1.0, s2), s1);
  vec3 tint = mix(silver, spectral, spectralAmt);

  float rough = clamp(P_roughness, 0.0, 1.0);
  vec3 H = normalize(m_L + vec3(0.0, 0.0, -1.0));
  float ndl = clamp(dot(n, m_L) * 0.5 + 0.5, 0.0, 1.0);
  float ndh = clamp(dot(n, H), 0.0, 1.0);
  float sheen = pow(ndh, 7.0) * 0.45 * (1.0 - rough * 0.35);
  float specCore = pow(ndh, mix(42.0, 12.0, rough)) * 0.85 * (1.0 - rough * 0.55);
  vec3 spec = tint * sheen + mix(tint, vec3(1.0), 0.6) * specCore;

  vec2 fq = pd * 190.0;
  float flakeN = m_noise(fq);
  float flakePhase = m_noise(fq + vec2(47.3, -31.1));
  float twinkle = sin(t * 2.2 + flakePhase * 12.6) * 0.5 + 0.5;
  float flakeMask = smoothstep(0.52, 0.62, flakeN * 0.75 + twinkle * 0.3) * clamp(P_sparkle, 0.0, 1.0);
  vec3 flake = m_rainbow(hue + 0.33 + flakePhase * 0.5) * (0.85 + twinkle * 0.55) * (ndl * 0.6 + 0.7);

  float grain = m_noise(pd * 420.0);
  float grainMul = 1.0 + grain * rough * 0.28;

  vec3 foil = tint * (ndl * 0.5 + 0.62) + spec;
  foil = mix(foil, flake, flakeMask) * grainMul;
  return vec4(toDisplay(clamp(foil, 0.0, 1.0)), 1.0);
}
`},Cr={id:"heatmap",name:"Heatmap",kind:"shape",group:"heat",source:"paper",animated:!0,outside:!0,normals:!1,surface:.04,params:[{name:"colors",label:"Cores",type:"colorArray",default:["#11206a","#1f3ba2","#2f63e7","#6bd7ff","#ffe679","#ff991e","#ff4c00"],minItems:2,maxItems:10},{name:"base",label:"Base color",type:"color",default:"#000000"},{name:"innerGlow",label:"Inner glow",type:"number",min:0,max:1,step:.01,default:.5},{name:"outerGlow",label:"Outer glow",type:"number",min:0,max:1,step:.01,default:0},{name:"contour",label:"Contour",type:"number",min:0,max:1,step:.01,default:.5},{name:"angle",label:"Ângulo",type:"number",min:0,max:360,step:1,default:0},{name:"noise",label:"Grain",type:"number",min:0,max:1,step:.01,default:0},{name:"speed",label:"Velocidade",type:"number",min:0,max:3,step:.01,default:1}],glsl:`
const float m_box = 1.6;

float m_sst(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

float m_lst(float a, float b, float x) {
  return clamp((x - a) / (b - a), 0.0, 1.0);
}

float m_circle(vec2 uv, vec2 c, vec2 r) {
  return 1.0 - m_sst(r.x, r.y, length(uv - c));
}

float m_cdf(float x) {
  float y = x * 0.70710678;
  float y2 = y * y;
  float e = sqrt(1.0 - exp(-y2 * (1.27323954 + 0.147 * y2) / (1.0 + 0.147 * y2)));
  return 0.5 + 0.5 * sign(y) * e;
}

float m_shadow(vec2 uv, float t, float contour) {
  vec2 su = uv;
  float posY = mix(-1.0, 2.0, t);
  su.y -= 0.5;
  float grow = m_sst(0.0, 0.8, posY) * m_lst(1.4, 0.9, posY);
  su *= vec2(1.0, 1.0 + 1.5 * grow);
  su.y += 0.5;
  float outerR = 1.0 - 0.3 * (m_sst(0.1, 0.2, t) * (1.0 - m_sst(0.2, 0.5, t)));
  float s = m_circle(su, vec2(0.5, posY - 0.2), vec2(0.4, outerR));
  s = pow(s, 1.4) * 1.2;
  float pos = posY - uv.y;
  float flat_ = m_lst(-0.4, 0.0, pos) * (1.0 - m_sst(0.0, 1.2, pos));
  flat_ = pow(flat_, 3.0);
  s = mix(flat_, s, 1.0 - m_sst(0.0, 0.3, pos));
  float ang = -2.0 - t * TAU;
  float right = m_circle(uv, vec2(0.95 - 0.2 * cos(ang), 0.4 - 0.1 * sin(ang)), vec2(0.15, 0.3));
  s = mix(s, 0.0, right * m_sst(0.6, 0.7, t) * (1.0 - m_sst(0.8, 0.9, t)));
  float top = m_circle(uv, vec2(0.5, 0.19), vec2(0.05, 0.25));
  top += 2.0 * contour * m_circle(uv, vec2(0.5, 0.19), vec2(0.2, 0.5));
  top *= 0.55 * m_sst(0.2, 0.3, t) * (1.0 - m_sst(0.3, 0.45, t));
  s = mix(s, 0.0, top);
  float leaf = m_circle(uv, vec2(0.53, 0.13), vec2(0.08, 0.19));
  leaf = mix(leaf, 0.0, 1.0 - m_sst(0.4, 0.54, uv.x));
  leaf = mix(0.0, leaf, m_sst(0.0, 0.2, uv.y));
  leaf *= m_sst(0.5, 1.1, posY) * m_sst(1.5, 1.3, posY);
  s += leaf;
  float bottom = m_sst(0.0, 0.4, t) * (1.0 - m_sst(0.6, 0.8, t));
  s = mix(s, 0.0, bottom * m_circle(uv, vec2(0.52, 0.92), vec2(0.09, 0.25)));
  float drift = m_sst(0.0, 0.6, t) * (1.0 - m_sst(0.6, 1.0, t));
  s = mix(s, 0.5, m_circle(uv, vec2(0.0, 1.2 - 0.5 * drift), vec2(0.1, 0.3)));
  s = mix(s, 0.0, m_circle(uv, vec2(1.0, 0.5 + 0.5 * drift), vec2(0.1, 0.3)));
  float rise = m_sst(0.3, 0.4, t);
  s = mix(s, 1.0, m_circle(uv, vec2(0.95, 0.2 + 0.2 * rise * m_sst(0.7, 0.5, t)), vec2(0.07, 0.22)));
  s = mix(s, 1.0, m_circle(uv, vec2(0.95, 0.2 + 0.2 * rise * (1.0 - m_sst(0.5, 0.7, t))), vec2(0.07, 0.22)));
  s /= max(1e-4, m_sst(1.0, 0.85, uv.y));
  return min(s, 1.0);
}

float m_hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec4 material(Surface s) {
  vec2 tex = s.p / (1.75 * m_box) + 0.5;
  float t = 0.1 * s.time * P_speed - 0.3;
  float t1 = fract(t);
  float t2 = fract(t + 1.0 / 3.0);
  float t3 = fract(t + 2.0 / 3.0);
  float a = -P_angle * PI / 180.0;
  vec2 c = tex - 0.5;
  vec2 au = vec2(c.x * cos(a) - c.y * sin(a), c.x * sin(a) + c.y * cos(a)) + 0.5;

  float shape = clamp(0.5 + s.d / (0.011 * m_box), 0.0, 1.0);
  float sigma = 0.15 * m_box;
  float r = sigma * 0.65;
  float soft = sigma * 0.9;
  float big = m_cdf(s.d / soft) * 0.2;
  big += m_cdf(shapeAt(s.p + vec2(r, 0.0)) / soft) * 0.2;
  big += m_cdf(shapeAt(s.p - vec2(r, 0.0)) / soft) * 0.2;
  big += m_cdf(shapeAt(s.p + vec2(0.0, r)) / soft) * 0.2;
  big += m_cdf(shapeAt(s.p - vec2(0.0, r)) / soft) * 0.2;
  float small = m_cdf(s.d / (0.0185 * m_box));
  float outerBlur = shape * (1.0 - big);
  float innerBlur = (1.0 - shape) * big;
  float contour = (1.0 - shape) * small;

  float inner = 0.8 + 0.8 * innerBlur;
  inner = mix(inner, 0.0, m_shadow(au, t1, innerBlur));
  inner = mix(inner, 0.0, m_shadow(au, t2, innerBlur));
  inner = mix(inner, 0.0, m_shadow(au, t3, innerBlur));
  inner *= 2.0 * P_innerGlow;
  inner += P_contour * 2.0 * contour;
  inner = min(1.0, inner) * (1.0 - shape);

  float band = fract(t1 * 3.0 - 0.1);
  float outer = 0.9 * pow(outerBlur, 0.8);
  float y = fract(au.y - band);
  outer *= 0.5 + m_sst(0.3, 0.65, y) * (1.0 - m_sst(0.65, 1.0, y));
  outer *= 5.0 * P_outerGlow * P_outerGlow;

  inner = pow(inner, 1.2);
  float heat = clamp(inner + outer, 0.0, 1.0);
  heat += (0.005 + 0.35 * P_noise) * (m_hash(s.frag * 0.01) - 0.5);

  float n = N_colors;
  float mixer = heat * n;
  vec4 g = C_colors(0);
  g.rgb *= g.a;
  float fade = clamp(mixer, 0.0, 1.0);
  for (int i = 2; i <= 10; i++) {
    if (float(i) > n) break;
    float m = clamp(mixer - float(i - 1), 0.0, 1.0);
    vec4 k = C_colors(i - 1);
    k.rgb *= k.a;
    g = mix(g, k, m);
  }
  vec3 col = g.rgb * fade;
  float alpha = g.a * fade;
  float back = C_base.a * s.cov;
  col += C_base.rgb * back * (1.0 - alpha);
  alpha += back * (1.0 - alpha);
  col += 0.02 * alpha * (m_hash(s.frag * 0.01 + 1.0) - 0.5);
  if (alpha < 1e-4) return vec4(0.0);
  return vec4(col / alpha, alpha);
}
`},Mr={id:"thermal",name:"Thermal",kind:"shape",group:"heat",source:"shaders.com",animated:!0,outside:!0,normals:!1,surface:.04,params:[{name:"colors",label:"Cores",type:"colorArray",default:["#02010e","#260c84","#972a96","#d86b3c","#f5e374","#ffffff"],minItems:2,maxItems:8},{name:"innerGlow",label:"Inner glow",type:"number",min:0,max:1,step:.01,default:.4},{name:"outerGlow",label:"Outer glow",type:"number",min:0,max:1,step:.01,default:0},{name:"contour",label:"Contour",type:"number",min:0,max:1,step:.01,default:.5},{name:"angle",label:"Ângulo",type:"number",min:0,max:360,step:1,default:90},{name:"speed",label:"Velocidade",type:"number",min:0,max:4,step:.01,default:1}],glsl:`
float m_hash(vec2 p) {
  uvec2 u = floatBitsToUint(p * vec2(141421356.0, 2718281828.0));
  return float((u.x ^ u.y) * 3141592653u) / 4294967295.0;
}

float m_value(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(m_hash(i), m_hash(i + vec2(1.0, 0.0)), f.x),
    mix(m_hash(i + vec2(0.0, 1.0)), m_hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float m_front(float a, float b, float tk, float phase) {
  float pos = mix(-0.6, 0.6, tk);
  float wob = m_value(vec2(b * 4.0 + phase * 13.7, tk * 3.0 + phase * 7.1)) - 0.5;
  float e = a - pos + wob * 0.12;
  float band = exp(-e * e / 0.0256);
  float gate = smoothstep(0.0, 0.15, tk) * (1.0 - smoothstep(0.85, 1.0, tk));
  return clamp(band * gate, 0.0, 1.0);
}

vec3 m_toLab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = sign(l) * pow(abs(l), 1.0 / 3.0);
  m = sign(m) * pow(abs(m), 1.0 / 3.0);
  s = sign(s) * pow(abs(s), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  );
}

vec3 m_fromLab(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec4 m_ramp(float t) {
  float n = max(N_colors, 1.0);
  vec4 c0 = C_colors(0);
  vec3 lab = m_toLab(toLinear(c0.rgb));
  float alpha = c0.a;
  for (int i = 1; i < 8; i++) {
    if (float(i) >= n) break;
    float a = float(i - 1) / (n - 1.0);
    float b = float(i) / (n - 1.0);
    float seg = clamp((t - a) / max(b - a, 1e-6), 0.0, 1.0);
    vec4 ci = C_colors(i);
    float wa = alpha * (1.0 - seg);
    float wb = ci.a * seg;
    lab = (lab * wa + m_toLab(toLinear(ci.rgb)) * wb) / max(wa + wb, 0.001);
    alpha = wa + wb;
  }
  return vec4(toDisplay(m_fromLab(lab)), alpha);
}

vec4 material(Surface s) {
  float t = s.time * P_speed;
  float depth = clamp(-s.d, 0.0, 0.7);
  float f = s.d > 0.0 ? s.d * 0.5 : -0.5 * sqrt(max(depth * (1.4 - depth), 0.0));
  float inside = s.cov;
  vec2 rel = s.p * 0.5;
  float ang = P_angle * PI / 180.0;
  vec2 along = vec2(cos(ang), sin(ang));
  vec2 across = vec2(-along.y, along.x);
  float a = dot(rel, along);
  float b = -dot(rel, across);
  float base = 0.1 * t - 0.3;

  float innerBlur = exp(-max(-f, 0.0) / 0.12);
  float inner = 0.8 + 0.8 * innerBlur;
  inner = mix(inner, 0.0, m_front(a, b, fract(base), 1.0));
  inner = mix(inner, 0.0, m_front(a, b, fract(base + 1.0 / 3.0), 2.0));
  inner = mix(inner, 0.0, m_front(a, b, fract(base + 2.0 / 3.0), 3.0));
  inner *= 2.0 * P_innerGlow;
  inner += P_contour * 2.0 * exp(-abs(f) / 0.03);
  inner = min(inner, 1.0) * inside;
  inner = pow(max(inner, 0.0), 1.2);

  float reach = 0.05 + 0.15 * P_outerGlow;
  float outerBlur = exp(-max(f, 0.0) / reach);
  if (s.d > 0.0) {
    float r = reach * 1.2;
    float k = 0.5 / reach;
    outerBlur += exp(-max(shapeAt(s.p + vec2(r, 0.0)), 0.0) * k);
    outerBlur += exp(-max(shapeAt(s.p - vec2(r, 0.0)), 0.0) * k);
    outerBlur += exp(-max(shapeAt(s.p + vec2(0.0, r)), 0.0) * k);
    outerBlur += exp(-max(shapeAt(s.p - vec2(0.0, r)), 0.0) * k);
    outerBlur *= 0.2;
  }
  vec2 edge = smoothstep(vec2(-0.06), vec2(0.1), s.uv) * (1.0 - smoothstep(vec2(0.9), vec2(1.06), s.uv));
  float sweep = fract(base * 3.0 - 0.1);
  float y = fract(a * 1.2 - sweep);
  float mask = 0.5 + smoothstep(0.3, 0.65, y) * (1.0 - smoothstep(0.65, 1.0, y));
  float outer = 0.9 * pow(outerBlur, 0.8) * mask * 5.0 * P_outerGlow * P_outerGlow * (1.0 - inside) * edge.x * edge.y;

  float heat = clamp(inner + outer, 0.0, 1.0);
  heat += 0.005 * (m_hash(s.frag * vec2(1.7, 1.3)) - 0.5);
  heat = clamp(heat, 0.0, 1.0);
  float cover = clamp(inside + outer, 0.0, 1.0);
  vec4 ramp = m_ramp(heat);
  return vec4(clamp(ramp.rgb, 0.0, 1.0), ramp.a * cover);
}
`},Lr={id:"gem-smoke",name:"Gem smoke",kind:"shape",group:"heat",source:"paper",animated:!0,outside:!0,normals:!1,surface:.04,params:[{name:"colors",label:"Smoke",type:"colorArray",default:["#333333","#e7e6df"],minItems:1,maxItems:6},{name:"inner",label:"Inner color",type:"color",default:"#fafaf5"},{name:"innerGlow",label:"Inner smoke",type:"number",min:0,max:1,step:.01,default:1},{name:"outerGlow",label:"Outer smoke",type:"number",min:0,max:1,step:.01,default:0},{name:"innerDistortion",label:"Inner swirl",type:"number",min:0,max:1,step:.01,default:.8},{name:"outerDistortion",label:"Outer swirl",type:"number",min:0,max:1,step:.01,default:.6},{name:"offset",label:"Deslocamento",type:"number",min:-1,max:1,step:.01,default:0},{name:"angle",label:"Ângulo",type:"number",min:0,max:360,step:1,default:0},{name:"size",label:"Tamanho",type:"number",min:0,max:1,step:.01,default:.8},{name:"speed",label:"Velocidade",type:"number",min:0,max:3,step:.01,default:1}],glsl:`
const float m_box = 1.8;
const float m_ramp = 0.19;
const float m_refPx = 0.005;

vec4 material(Surface s) {
  float time = s.time * P_speed;
  vec2 obj = vec2(s.p.x, -s.p.y) / m_box;
  float roundness = pow(smoothstep(0.0, m_ramp, -s.d), 0.25);
  float alphaIn = s.cov;

  vec2 suv = rot2(P_angle * PI / 180.0) * obj;
  suv *= mix(4.0, 1.0, P_size);
  vec2 iuv = suv;
  vec2 ouv = suv;
  iuv.y += P_innerDistortion * (1.0 - smoothstep(0.0, 1.0, length(0.4 * iuv)));
  iuv.y -= 0.4 * P_innerDistortion;
  iuv.y += 0.7 * P_offset * roundness;
  ouv.y += P_outerDistortion * (1.0 - smoothstep(0.0, 1.0, length(0.4 * ouv)));
  ouv.y -= 0.4 * P_outerDistortion;

  float swirlIn = P_innerDistortion * roundness;
  float swirlOut = P_outerDistortion;
  float k = m_refPx / s.px;
  for (int i = 1; i < 5; i++) {
    float fi = float(i);
    float stretchIn = max(length(dFdx(iuv)), length(dFdy(iuv))) * k;
    float sIn = swirlIn / (1.0 + stretchIn * 8.0);
    iuv.x += sIn / fi * cos(time + fi * 2.9 * iuv.y);
    iuv.y += sIn / fi * cos(time + fi * 1.5 * iuv.x);
    float stretchOut = max(length(dFdx(ouv)), length(dFdy(ouv))) * k;
    float sOut = swirlOut / (1.0 + stretchOut * 8.0);
    ouv.x += sOut / fi * cos(time + fi * 2.9 * ouv.y);
    ouv.y += sOut / fi * cos(time + fi * 1.5 * ouv.x);
  }

  float innerShape = exp(-1.5 * dot(iuv, iuv)) * (0.01 + 0.99 * P_innerGlow) * alphaIn;
  float outerShape = exp(-1.5 * dot(ouv, ouv)) * P_outerGlow * P_outerGlow * (1.0 - alphaIn);

  float n = N_colors;
  float mixer = (innerShape + outerShape) * n;
  vec4 g = C_colors(0);
  g.rgb *= g.a;
  float mask = smoothstep(0.0, 1.0, clamp(mixer, 0.0, 1.0));
  for (int i = 2; i <= 6; i++) {
    if (float(i) > n) break;
    float m = smoothstep(0.0, 1.0, clamp(mixer - float(i - 1), 0.0, 1.0));
    vec4 c = C_colors(i - 1);
    c.rgb *= c.a;
    g = mix(g, c, m);
  }
  vec3 col = g.rgb * mask;
  float alpha = g.a * mask;
  float innerA = C_inner.a * alphaIn;
  col += C_inner.rgb * innerA * (1.0 - alpha);
  alpha += innerA * (1.0 - alpha);
  if (alpha < 1e-4) return vec4(0.0);
  return vec4(col / alpha, alpha);
}
`},qr={id:"smoke",name:"Smoke",kind:"shape",group:"volume",source:"shaders.com",animated:!0,outside:!1,normals:!1,surface:.1,params:[{name:"fresh",label:"Fresh",type:"color",default:"#8cf3ff"},{name:"aged",label:"Aged",type:"color",default:"#04a0d6"},{name:"sourceX",label:"Source x",type:"number",min:-.9,max:.9,step:.01,default:0},{name:"sourceY",label:"Source y",type:"number",min:-.9,max:.9,step:.01,default:.5},{name:"direction",label:"Direção",type:"number",min:0,max:360,step:1,default:0},{name:"spread",label:"Spread",type:"number",min:0,max:180,step:1,default:60},{name:"intensity",label:"Intensidade",type:"number",min:.1,max:1,step:.01,default:1},{name:"dissipation",label:"Dissipation",type:"number",min:.1,max:5,step:.1,default:.3},{name:"detail",label:"Detalhe",type:"number",min:0,max:50,step:1,default:25},{name:"decay",label:"Color decay",type:"number",min:0,max:3,step:.1,default:.4},{name:"speed",label:"Velocidade",type:"number",min:0,max:2,step:.01,default:1}],glsl:`
uint m_hash(uvec3 v) {
  uint h = v.x * 0x8da6b343u ^ v.y * 0xd8163841u ^ v.z * 0xcb1ab31fu;
  h ^= h >> 16u;
  h *= 0x7feb352du;
  h ^= h >> 15u;
  h *= 0x846ca68bu;
  h ^= h >> 16u;
  return h;
}

float m_grad(uint h, vec2 f) {
  h &= 7u;
  float u = h < 4u ? f.x : f.y;
  float v = 2.0 * (h < 4u ? f.y : f.x);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_noise(vec2 p, uint z) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  uvec3 c = uvec3(uvec2(ivec2(i)), z);
  float a = m_grad(m_hash(c), f);
  float b = m_grad(m_hash(c + uvec3(1u, 0u, 0u)), f - vec2(1.0, 0.0));
  float d = m_grad(m_hash(c + uvec3(0u, 1u, 0u)), f - vec2(0.0, 1.0));
  float e = m_grad(m_hash(c + uvec3(1u, 1u, 0u)), f - vec2(1.0, 1.0));
  return 0.6616 * mix(mix(a, b, w.x), mix(d, e, w.x), w.y);
}

float m_fbm(vec2 p, uint z) {
  float sum = 0.0;
  float amp = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    sum += amp * m_noise(p, z + uint(i));
    p = r * p * 2.03 + vec2(1.7, 9.2);
    amp *= 0.5;
  }
  return sum;
}

vec4 material(Surface s) {
  if (s.d > 0.02) return vec4(0.0);
  float t = s.time * P_speed;
  float ang = radians(P_direction);
  vec2 up = vec2(sin(ang), -cos(ang));
  vec2 side = vec2(-up.y, up.x);
  vec2 src0 = vec2(P_sourceX, P_sourceY);
  float d0 = shapeAt(src0);
  vec2 g0 = vec2(shapeAt(src0 + vec2(0.01, 0.0)) - d0, shapeAt(src0 + vec2(0.0, 0.01)) - d0);
  vec2 srcP = src0 - g0 / max(length(g0), 1e-5) * max(d0 + 0.07, 0.0);
  vec2 rel = s.p - srcP;
  float a = dot(rel, up);
  float c = dot(rel, side);
  float turb = P_detail / 25.0;
  vec2 q = vec2(c, a - 0.3 * t);

  vec2 warp = vec2(m_fbm(q * 1.7 + vec2(0.0, t * 0.12), 0u), m_fbm(q * 1.7 + vec2(5.2, 1.3) - vec2(0.0, t * 0.1), 8u));
  vec2 fine = vec2(m_fbm(q * 4.6 + warp * 0.8 + vec2(0.0, t * 0.2), 48u), m_fbm(q * 4.6 + vec2(2.7, 8.1) - warp * 0.8, 56u));
  float h = max(a, 0.0);
  float amp = turb * (0.02 + 0.36 * min(h, 1.4));
  float cw = c + (warp.x + fine.x * 0.35) * amp;
  float aw = a + (warp.y + fine.y * 0.25) * amp * 0.5;
  float hw = max(aw, 0.0);
  float src = 0.055;
  float width = src + hw * tan(radians(min(P_spread, 178.0)) * 0.5) * 0.58;
  float flare = smoothstep(-0.3, -0.02, s.d) * smoothstep(0.15, 0.7, hw);
  width *= 1.0 + flare * 1.2;
  float core = exp(-cw * cw / (width * width));
  core *= smoothstep(-src * 1.5, src, aw);
  core *= exp(-hw * P_dissipation * 0.8);
  float wisps = smoothstep(-0.32, 0.42, m_fbm(q * 3.6 + warp * 1.1 * turb + fine * 0.5, 16u));
  float dens = smoothstep(0.03, 0.8, core * mix(0.38, 1.0, wisps)) * 0.8;
  dens += core * exp(-hw * 7.0) * 0.7;
  float plume = dens * P_intensity;

  vec2 fq = s.p * 1.1 + vec2(0.0, -t * 0.04);
  vec2 fw = vec2(m_fbm(fq + vec2(t * 0.025, 0.0), 24u), m_fbm(fq + vec2(3.1, -t * 0.03), 32u));
  float body = m_fbm(fq * 1.6 + fw * (0.5 + turb * 0.5), 40u);
  float fill = clamp(0.62 + body * 0.55, 0.0, 1.0) * P_intensity * 0.4 / (0.75 + P_dissipation);

  float total = plume + fill;
  float age = clamp(hw * P_decay * 1.1 + (1.0 - core) * 0.3, 0.0, 1.0);
  float ageMix = (plume * age + fill) / max(total, 1e-4);
  vec3 col = toDisplay(mix(toLinear(C_fresh.rgb), toLinear(C_aged.rgb), clamp(ageMix, 0.0, 1.0)));
  return vec4(col, clamp(total, 0.0, 1.0) * C_fresh.a);
}
`},jr={id:"nebula",name:"Nebula",kind:"shape",group:"volume",source:"shaders.com",animated:!0,outside:!1,surface:"bevel",params:[{name:"gas",label:"Gas",type:"color",default:"#ff5e7a"},{name:"veil",label:"Veil",type:"color",default:"#3a5bdb"},{name:"core",label:"Core",type:"color",default:"#ffd9b0"},{name:"density",label:"Densidade",type:"number",min:0,max:1,step:.01,default:1},{name:"cavity",label:"Cavity",type:"number",min:0,max:1,step:.01,default:.3},{name:"dust",label:"Dust",type:"number",min:0,max:1,step:.01,default:.55},{name:"billow",label:"Billow",type:"number",min:0,max:1,step:.01,default:.6},{name:"gasScale",label:"Gas scale",type:"number",min:.1,max:1,step:.01,default:.45},{name:"stars",label:"Stars",type:"number",min:0,max:1,step:.01,default:.07},{name:"glass",label:"Glass",type:"number",min:0,max:2,step:.01,default:1},{name:"bevel",label:"Bevel",type:"number",min:.05,max:.8,step:.01,default:.7},{name:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:12},{name:"speed",label:"Velocidade",type:"number",min:0,max:4,step:.01,default:.3}],glsl:`
uint m_hash(uvec3 v) {
  uint h = v.x * 0x8da6b343u ^ v.y * 0xd8163841u ^ v.z * 0xcb1ab31fu;
  h ^= h >> 16u;
  h *= 0x7feb352du;
  h ^= h >> 15u;
  h *= 0x846ca68bu;
  h ^= h >> 16u;
  return h;
}

float m_grad3(uint h, vec3 f) {
  h &= 15u;
  float u = h < 8u ? f.x : f.y;
  float v = h < 4u ? f.y : ((h == 12u || h == 14u) ? f.x : f.z);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = p - i;
  vec3 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  uvec3 c = uvec3(ivec3(i));
  float a = m_grad3(m_hash(c), f);
  float b = m_grad3(m_hash(c + uvec3(1u, 0u, 0u)), f - vec3(1.0, 0.0, 0.0));
  float d = m_grad3(m_hash(c + uvec3(0u, 1u, 0u)), f - vec3(0.0, 1.0, 0.0));
  float e = m_grad3(m_hash(c + uvec3(1u, 1u, 0u)), f - vec3(1.0, 1.0, 0.0));
  float g = m_grad3(m_hash(c + uvec3(0u, 0u, 1u)), f - vec3(0.0, 0.0, 1.0));
  float k = m_grad3(m_hash(c + uvec3(1u, 0u, 1u)), f - vec3(1.0, 0.0, 1.0));
  float l = m_grad3(m_hash(c + uvec3(0u, 1u, 1u)), f - vec3(0.0, 1.0, 1.0));
  float m = m_grad3(m_hash(c + uvec3(1u, 1u, 1u)), f - vec3(1.0, 1.0, 1.0));
  return 0.982 * mix(mix(mix(a, b, w.x), mix(d, e, w.x), w.y), mix(mix(g, k, w.x), mix(l, m, w.x), w.y), w.z);
}

float m_grad2(uint h, vec2 f) {
  h &= 7u;
  float u = h < 4u ? f.x : f.y;
  float v = 2.0 * (h < 4u ? f.y : f.x);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  uvec3 c = uvec3(uvec2(ivec2(i)), 0u);
  float a = m_grad2(m_hash(c), f);
  float b = m_grad2(m_hash(c + uvec3(1u, 0u, 0u)), f - vec2(1.0, 0.0));
  float d = m_grad2(m_hash(c + uvec3(0u, 1u, 0u)), f - vec2(0.0, 1.0));
  float e = m_grad2(m_hash(c + uvec3(1u, 1u, 0u)), f - vec2(1.0, 1.0));
  return 0.6616 * mix(mix(a, b, w.x), mix(d, e, w.x), w.y);
}

float m_worley(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  float best = 1e6;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      uint h = m_hash(uvec3(uvec2(ivec2(i + o)), 9u));
      vec2 r = vec2(float(h & 65535u), float(h >> 16u)) / 65535.0;
      vec2 q = o + r - f;
      best = min(best, dot(q, q));
    }
  }
  return best;
}

vec3 m_stars(vec2 p, float vf, vec2 rad, vec2 keep, vec2 bright, float rate, float spread, float t, vec3 from, vec3 to, float tint) {
  float v = m_noise2(p * vf) * 0.5 + 0.5;
  float tw = 0.175;
  float shimmer = 1.0 - tw + sin(t * rate + v * spread) * tw;
  float g = (1.0 - smoothstep(0.0005, rad.x + v * rad.y, m_worley(p))) * smoothstep(keep.x, keep.y, v);
  return mix(from, to, v) * g * (bright.x + v * v * bright.y) * shimmer * tint * P_stars;
}

void m_medium(vec3 p, float freq, float drift, float seed, float billow, out float dens, out float mid, out float fine) {
  vec3 q = vec3(
    p.x * freq + drift + seed,
    p.y * freq - drift * 0.7 + seed * 0.53,
    p.z * freq * 1.25 + drift * 1.3 + seed * 0.79
  );
  float warp = m_noise3(q * 0.5 + vec3(drift * 1.4, 0.0, -drift * 0.9));
  vec3 qw = q + vec3(warp, -warp * 0.73, warp * 0.41) * billow;
  mid = m_noise3(qw * 2.13 + vec3(5.2, 1.3, 8.4));
  fine = m_noise3(qw * 4.31 + vec3(9.1, 3.7, 1.2));
  dens = (m_noise3(qw) + mid * 0.5 + fine * 0.27) * 0.57;
}

vec3 m_toLab(vec3 c) {
  vec3 lms = vec3(
    dot(c, vec3(0.4122214708, 0.5363325363, 0.0514459929)),
    dot(c, vec3(0.2119034982, 0.6806995451, 0.1073969566)),
    dot(c, vec3(0.0883024619, 0.2817188376, 0.6299787005))
  );
  lms = sign(lms) * pow(abs(lms), vec3(1.0 / 3.0));
  return vec3(
    dot(lms, vec3(0.2104542553, 0.793617785, -0.0040720468)),
    dot(lms, vec3(1.9779984951, -2.428592205, 0.4505937099)),
    dot(lms, vec3(0.0259040371, 0.7827717662, -0.808675766))
  );
}

vec3 m_fromLab(vec3 l) {
  vec3 lms = vec3(
    l.x + 0.3963377774 * l.y + 0.2158037573 * l.z,
    l.x - 0.1055613458 * l.y - 0.0638541728 * l.z,
    l.x - 0.0894841775 * l.y - 1.291485548 * l.z
  );
  lms = lms * lms * lms;
  return vec3(
    dot(lms, vec3(4.0767416621, -3.3077115913, 0.2309699292)),
    dot(lms, vec3(-1.2684380046, 2.6097574011, -0.3413193965)),
    dot(lms, vec3(-0.0041960863, -0.7034186147, 1.707614701))
  );
}

vec3 m_neutral(vec3 c) {
  float x = min(c.r, min(c.g, c.b));
  float off = x < 0.08 ? x - 6.25 * x * x : 0.04;
  c -= off;
  float peak = max(c.r, max(c.g, c.b));
  if (peak < 0.76) return c;
  float np = 1.0 - 0.0576 / (peak - 0.52);
  c *= np / peak;
  float g = 1.0 - 1.0 / (0.15 * (peak - np) + 1.0);
  return mix(c, vec3(np), g);
}

float m_box(vec2 e, vec2 at, float r, float gain) {
  return (1.0 - smoothstep(r * 0.2, r, length(e - at))) * gain;
}

float m_studio(vec2 r, vec2 rot, float k, float strength) {
  vec2 e = vec2(r.x * rot.x - r.y * rot.y, r.x * rot.y + r.y * rot.x);
  float sky = smoothstep(-0.7, 0.85, e.y);
  float lum = m_box(e, vec2(0.0, 0.55), k, 1.7);
  lum += m_box(e, vec2(-0.55, 0.18), k * 1.15, 1.05);
  lum += m_box(e, vec2(0.55, 0.1), k, 1.0);
  lum += m_box(e, vec2(0.2, -0.5), k * 1.3, 0.7);
  lum += m_box(e, vec2(-0.35, -0.25), k * 1.1, 0.85);
  return sky * sky * 0.32 + lum * strength;
}

vec4 material(Surface s) {
  if (s.d > 0.02) return vec4(0.0);
  float t = s.time * P_speed;
  vec3 veil = toLinear(C_veil.rgb);
  vec3 core = toLinear(C_core.rgb);
  vec3 labV = m_toLab(veil);
  vec3 labG = m_toLab(toLinear(C_gas.rgb));
  vec3 labC = m_toLab(core);

  vec3 N = domeNormal(s, P_bevel);
  float aspect = s.res.x / s.res.y;
  vec3 view = normalize(vec3((s.uv.x - 0.5) * aspect * 0.6, (s.uv.y - 0.5) * 0.6, -1.0));
  vec2 place = s.p * 0.5;
  vec2 interior = place + N.xy * 0.08;
  float pathLen = 0.9 * P_bevel * domeHeight(s, P_bevel);
  vec2 shear = view.xy * 0.55;

  float freq = P_gasScale * 3.1;
  float drift = t * 0.14;
  float seed = P_variation * 7.31;
  float jit = float(m_hash(uvec3(uvec2(ivec2(s.frag)), 3u)) & 65535u) / 65535.0 * 0.025;
  float macro = m_noise2(vec2(place.x * 1.3 + drift * 0.6 + seed * 0.37, place.y * 1.3 + seed * 0.61)) * 0.5;
  float cav = mix(-0.35, 0.5, P_cavity);
  float billow = P_billow * 0.55;
  float eGain = 0.3 + pathLen * 0.9;
  float aGain = (0.5 + pathLen * 2.2) * P_density * 0.5;

  vec3 trans = vec3(1.0);
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    float fi = (float(i) + 0.5) / 6.0;
    float z = pathLen * (fi + jit);
    float g;
    float mid;
    float fine;
    m_medium(vec3(interior + shear * z, z), freq, drift, seed, billow, g, mid, fine);
    float wall = smoothstep(0.0, 0.11, pathLen * min(fi, 1.0 - fi));
    float ridge = 1.0 - clamp(abs(fine) * 1.6, 0.0, 1.0);
    float dens = smoothstep(0.0, 0.5, g + macro - cav) * wall * (0.65 + ridge * 0.7);
    float dust = smoothstep(0.45, 0.75, mid) * wall * P_dust;
    vec3 body = max(m_fromLab(mix(mix(labV, labG, smoothstep(0.05, 0.75, dens)), labC, smoothstep(0.85, 1.3, dens))), 0.0);
    float dim = 1.0 - fi * 0.45;
    float haze = smoothstep(-0.7, 0.3, g) * 0.05 * wall;
    vec3 emit = (body * dens + veil * haze) * dim;
    vec3 absorb = vec3(dens * aGain) + vec3(1.5, 1.0, 0.55) * dust * aGain * 2.2;
    acc += emit * trans * eGain;
    trans *= exp(-absorb);
  }

  vec2 farP = (interior + shear * pathLen * 1.1) * 34.0;
  vec3 far = m_stars(farP, 0.13, vec2(0.004, 0.013), vec2(0.35, 0.75), vec2(0.3, 1.2), 1.7, 40.0, t, vec3(0.72, 0.82, 1.0), vec3(1.0, 0.92, 0.82), 1.6);
  vec2 nearP = (interior + shear * pathLen * 0.25) * 19.04 + vec2(7.3, 2.9);
  vec3 near = m_stars(nearP, 0.11, vec2(0.003, 0.01), vec2(0.45, 0.8), vec2(0.35, 1.3), 2.3, 34.0, t, vec3(0.75, 0.85, 1.0), vec3(1.0, 0.95, 0.88), 1.8);

  vec2 ld = vec2(0.70710678, -0.70710678);
  vec3 L = normalize(vec3(ld, 0.7));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float ndh = clamp(dot(N, H), 0.0, 1.0);
  vec3 R = reflect(view, N);
  float fres = 0.04 + 0.96 * pow(1.0 - clamp(-dot(view, N), 0.0, 1.0), 5.0);
  float env = (m_studio(R.xy, ld, 0.2, 0.7) * 0.6 + 0.1) * fres * P_glass;
  float spec = (pow(ndh, 70.0) * 1.3 + pow(ndh, 11.0) * 0.14) * 1.15 * P_glass;

  vec3 floorC = max(m_fromLab(mix(labV, labG, 0.25)), 0.0);
  vec3 rgb = floorC * 0.06 * trans + acc + far * trans + near * mix(trans, vec3(1.0), 0.35);
  rgb += vec3(0.85, 0.92, 1.08) * env + vec3(1.0, 0.98, 0.95) * spec;
  return vec4(toDisplay(m_neutral(rgb)), 1.0);
}
`},Ir={id:"plastic",name:"Plastic",kind:"shape",group:"solid",source:"shaders.com",animated:!0,outside:!1,surface:.15,params:[{name:"top",label:"Top color",type:"color",default:"#f5f5f7"},{name:"bottom",label:"Bottom color",type:"color",default:"#d9dade"},{name:"puffiness",label:"Puffiness",type:"number",min:.03,max:.8,step:.01,default:.3},{name:"roughness",label:"Roughness",type:"number",min:0,max:1,step:.01,default:.12},{name:"gloss",label:"Gloss",type:"number",min:0,max:2,step:.01,default:1},{name:"crumple",label:"Crumple",type:"number",min:0,max:1,step:.01,default:.25},{name:"dentSize",label:"Dent density",type:"number",min:.5,max:10,step:.1,default:1},{name:"coverage",label:"Coverage",type:"number",min:0,max:1,step:.01,default:1},{name:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0},{name:"lightAngle",label:"Light angle",type:"number",min:0,max:360,step:1,default:315},{name:"speed",label:"Velocidade",type:"number",min:0,max:4,step:.01,default:1}],glsl:`
vec3 m_lin(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 m_srgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

uint m_rotl(uint x, uint k) {
  return (x << k) | (x >> (32u - k));
}

uint m_hash(int x, int y) {
  uint seed = 0xdeadbeefu + 21u;
  uint a = seed + uint(x);
  uint b = seed + uint(y);
  uint c = seed;
  c ^= b; c -= m_rotl(b, 14u);
  a ^= c; a -= m_rotl(c, 11u);
  b ^= a; b -= m_rotl(a, 25u);
  c ^= b; c -= m_rotl(b, 16u);
  a ^= c; a -= m_rotl(c, 4u);
  b ^= a; b -= m_rotl(a, 14u);
  c ^= b; c -= m_rotl(b, 24u);
  return c;
}

float m_grad(uint h, float x, float y) {
  h &= 7u;
  float u = h < 4u ? x : y;
  float v = 2.0 * (h < 4u ? y : x);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_noise(vec2 p) {
  vec2 fl = floor(p);
  ivec2 i = ivec2(fl);
  vec2 f = p - fl;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float v0 = m_grad(m_hash(i.x, i.y), f.x, f.y);
  float v1 = m_grad(m_hash(i.x + 1, i.y), f.x - 1.0, f.y);
  float v2 = m_grad(m_hash(i.x, i.y + 1), f.x, f.y - 1.0);
  float v3 = m_grad(m_hash(i.x + 1, i.y + 1), f.x - 1.0, f.y - 1.0);
  return 0.6616 * mix(mix(v0, v1, u.x), mix(v2, v3, u.x), u.y);
}

float m_width(Surface s, float bevel) {
  float depth = max(-s.d, 0.0);
  float k = bevel - depth;
  float w = bevel;
  if (k <= 0.0) return w;
  for (int i = 0; i < 4; i++) {
    float g = shapeAt(s.p - s.n * k) + depth + k;
    float c = smoothstep(0.0, 0.5 * k, g);
    if (c <= 0.0) break;
    w = mix(w, depth + k - 0.5 * g, c);
    k *= 0.5;
  }
  return min(bevel, w);
}

float m_crumple(vec2 p, float cs, float so) {
  return abs(m_noise(vec2(p.x * cs + so, p.y * cs + so * 0.617))) + 0.45 * abs(m_noise(vec2(p.x * cs * 2.3 + 13.1 + so, p.y * cs * 2.3 + 7.7 + so * 0.617)));
}

float m_box(float x, float lo, float hi, float s) {
  return smoothstep(lo - s, lo + s, x) * (1.0 - smoothstep(hi - s, hi + s, x));
}

vec4 material(Surface s) {
  if (s.d > max(0.02, 2.0 * s.aa)) return vec4(0.0);
  float t = s.time * P_speed + 3.0;
  float depth = max(-s.d, 0.0);
  float range = max(P_puffiness, 0.02);
  float we = m_width(s, range);
  float dn = clamp(depth / max(we, 1e-4), 0.0, 1.0);
  float bevel = sqrt(max(1.0 - dn * dn, 0.0)) * 2.4 * smoothstep(0.0, 0.2, s.slope);
  vec3 n = normalize(vec3(s.n * bevel, -1.0));
  vec2 pat = s.p * 0.5;
  float cs = P_dentSize * 4.0;
  float so = P_variation * 7.31;
  float c0 = m_crumple(pat, cs, so);
  vec2 cg = vec2(m_crumple(pat + vec2(0.012, 0.0), cs, so) - c0, m_crumple(pat + vec2(0.0, 0.012), cs, so) - c0) / 0.012;
  float covNoise = m_noise(vec2(pat.x * 2.6 + so + 31.7, pat.y * 2.6 + so * 0.617 + 17.3)) * 0.5 + 0.5;
  float th = 1.25 - clamp(P_coverage, 0.0, 1.0) * 1.75;
  float cw = P_crumple * 0.9 * smoothstep(th - 0.25, th + 0.25, covNoise) * (smoothstep(0.0, 0.35, dn) * 0.85 + 0.15);
  n = normalize(vec3(n.xy + cg * cw * 0.25, n.z));
  float grazing = 1.0 - clamp(-n.z, 0.0, 1.0);
  vec3 R = reflect(vec3(0.0, 0.0, 1.0), n);
  float rough = clamp(P_roughness, 0.0, 1.0);
  float la = radians(P_lightAngle + t * 6.0);
  vec2 l = vec2(cos(la), sin(la));
  float jit = rough * m_noise(pat * 140.0) * 0.18;
  float eu = R.x * l.x + R.y * l.y + jit;
  float ev = -R.x * l.y + R.y * l.x + jit * 0.6;
  float soft = mix(0.02, 0.45, rough);
  float key = m_box(eu, 0.18, 0.95, soft) * m_box(ev, -0.42, 0.42, soft) * (1.0 - m_box(ev, -0.045, 0.045, soft * 0.6) * 0.8 * (1.0 - rough));
  float strip = m_box(eu, -0.16, -0.05, soft * 0.7) * m_box(ev, -0.85, 0.85, soft) * 0.85;
  float fill = m_box(eu, -0.95, -0.45, soft * 1.6) * m_box(ev, -0.6, 0.6, soft * 1.6) * 0.3;
  float env = (key + strip + fill + clamp(eu * 0.5 + 0.5, 0.0, 1.0) * 0.12) * (1.0 - rough * 0.55);
  vec3 L = normalize(vec3(l, -0.8));
  vec3 H = normalize(L + vec3(0.0, 0.0, -1.0));
  float glint = pow(clamp(dot(n, H), 0.0, 1.0), exp2(mix(9.0, 4.0, rough))) * 1.6 * (1.0 - rough * 0.7);
  float spec = (env + glint) * P_gloss * (0.3 + grazing * grazing * grazing * 0.7);
  float lit = clamp(dot(n, L), -1.0, 1.0) * 0.5 + 0.5;
  float diffuse = mix(1.0 - 0.2625, 1.1575, lit);
  float ao = mix(0.6, 1.0, smoothstep(0.0, 1.0, clamp(depth / min(0.05, 0.5 * we), 0.0, 1.0)));
  float rim = pow(grazing, 3.5) * 0.4 * (lit * 0.6 + 0.4);
  float g = smoothstep(0.0, 1.0, clamp(pat.y / 0.7 + 0.5, 0.0, 1.0));
  vec3 base = mix(m_lin(C_top.rgb), m_lin(C_bottom.rgb), g);
  vec3 rgb = base * diffuse * ao + spec + rim;
  return vec4(m_srgb(rgb), 1.0);
}
`},Fr={id:"carbon-fiber",name:"Carbon fiber",kind:"shape",group:"solid",source:"shaders.com",animated:!1,outside:!1,surface:.15,params:[{name:"sheenColor",label:"Fiber color",type:"color",default:"#b9bdc6"},{name:"resin",label:"Resin color",type:"color",default:"#0b0c0e"},{name:"bevel",label:"Bevel",type:"number",min:.02,max:.8,step:.01,default:.7},{name:"weave",label:"Weave",type:"select",options:[{value:0,label:"Twill"},{value:1,label:"Plain"}],default:0},{name:"density",label:"Weave density",type:"number",min:2,max:50,step:.5,default:30},{name:"angle",label:"Weave angle",type:"number",min:0,max:360,step:1,default:0},{name:"depth",label:"Weave depth",type:"number",min:0,max:1,step:.01,default:.5},{name:"sheen",label:"Fiber sheen",type:"number",min:0,max:1.5,step:.01,default:1.2},{name:"roughness",label:"Roughness",type:"number",min:0,max:1,step:.01,default:.5},{name:"clearcoat",label:"Clearcoat",type:"number",min:0,max:2,step:.01,default:1.2},{name:"lightAngle",label:"Light angle",type:"number",min:0,max:360,step:1,default:215}],glsl:`
float m_ss(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

vec3 m_lin(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 m_srgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

uint m_rotl(uint x, uint k) {
  return (x << k) | (x >> (32u - k));
}

uint m_hash(int x, int y) {
  uint seed = 0xdeadbeefu + 21u;
  uint a = seed + uint(x);
  uint b = seed + uint(y);
  uint c = seed;
  c ^= b; c -= m_rotl(b, 14u);
  a ^= c; a -= m_rotl(c, 11u);
  b ^= a; b -= m_rotl(a, 25u);
  c ^= b; c -= m_rotl(b, 16u);
  a ^= c; a -= m_rotl(c, 4u);
  b ^= a; b -= m_rotl(a, 14u);
  c ^= b; c -= m_rotl(b, 24u);
  return c;
}

float m_grad(uint h, float x, float y) {
  h &= 7u;
  float u = h < 4u ? x : y;
  float v = 2.0 * (h < 4u ? y : x);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_noise(vec2 p) {
  vec2 fl = floor(p);
  ivec2 i = ivec2(fl);
  vec2 f = p - fl;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float v0 = m_grad(m_hash(i.x, i.y), f.x, f.y);
  float v1 = m_grad(m_hash(i.x + 1, i.y), f.x - 1.0, f.y);
  float v2 = m_grad(m_hash(i.x, i.y + 1), f.x, f.y - 1.0);
  float v3 = m_grad(m_hash(i.x + 1, i.y + 1), f.x - 1.0, f.y - 1.0);
  return 0.6616 * mix(mix(v0, v1, u.x), mix(v2, v3, u.x), u.y);
}

float m_width(Surface s, float bevel) {
  float depth = max(-s.d, 0.0);
  float k = bevel - depth;
  float w = bevel;
  if (k <= 0.0) return w;
  for (int i = 0; i < 4; i++) {
    float g = shapeAt(s.p - s.n * k) + depth + k;
    float c = smoothstep(0.0, 0.5 * k, g);
    if (c <= 0.0) break;
    w = mix(w, depth + k - 0.5 * g, c);
    k *= 0.5;
  }
  return min(bevel, w);
}

vec3 m_dome(Surface s, float bevel) {
  float depth = max(-s.d, 0.0);
  float w = m_width(s, bevel);
  float we = min(bevel, w * mix(0.55, 1.0, smoothstep(0.25, 0.9, w / max(bevel, 1e-4))));
  float band = min(0.02, 0.2 * we);
  float x = min(1.0 - clamp((depth - band) / max(we - band, 1e-4), 0.0, 1.0), 0.98);
  float xw = min(x, 0.85);
  return vec3(x * smoothstep(0.0, 0.2, s.slope), (asin(xw) - xw) * we, inversesqrt(1.0 - xw * xw));
}

float m_studio5(vec2 e, float keyRad, float str, float skyGain) {
  float sky = smoothstep(-0.7, 0.85, e.y);
  float lum = sky * sky * skyGain;
  lum += m_ss(keyRad, keyRad * 0.2, length(e - vec2(0.0, 0.55))) * 1.7 * str;
  lum += m_ss(keyRad * 1.15, keyRad * 0.23, length(e - vec2(-0.55, 0.18))) * 1.05 * str;
  lum += m_ss(keyRad, keyRad * 0.2, length(e - vec2(0.55, 0.1))) * str;
  lum += m_ss(keyRad * 1.3, keyRad * 0.26, length(e - vec2(0.2, -0.5))) * 0.7 * str;
  lum += m_ss(keyRad * 1.1, keyRad * 0.22, length(e - vec2(-0.35, -0.25))) * 0.85 * str;
  return lum;
}

float m_ward(vec3 n, vec3 dir, vec3 L, vec3 V, float aT, float aB) {
  vec3 T = normalize(dir - n * dot(n, dir));
  vec3 B = cross(n, T);
  vec3 H = normalize(L - V);
  float hT = dot(H, T) / max(aT, 0.0001);
  float hB = dot(H, B) / max(aB, 0.0001);
  float hN = clamp(abs(dot(H, n)), 0.0001, 1.0);
  return exp(-(hT * hT + hB * hB) / ((hN + 1.0) * 0.5));
}

vec4 material(Surface s) {
  if (s.d > max(0.02, 2.0 * s.aa)) return vec4(0.0);
  vec3 dome = m_dome(s, P_bevel);
  vec3 ng = vec3(s.n * dome.x, -sqrt(1.0 - dome.x * dome.x));
  vec2 pat = (s.p + s.n * dome.y) * vec2(0.5, -0.5);
  float wa = radians(P_angle);
  vec2 T = vec2(cos(wa), sin(wa));
  vec2 B = vec2(-T.y, T.x);
  float warp = dot(pat, T);
  float weft = dot(pat, B);
  vec2 cellUV = vec2(warp, weft) * P_density;
  vec2 cell = floor(cellUV);
  vec2 f = cellUV - cell - 0.5;
  float parity;
  if (P_weave > 0.5) {
    float s2 = cell.x + cell.y;
    parity = s2 - 2.0 * floor(s2 / 2.0);
  } else {
    float s4 = cell.x - cell.y + 64.0;
    parity = s4 - 4.0 * floor(s4 / 4.0) >= 2.0 ? 1.0 : 0.0;
  }
  vec2 fiber = mix(T, B, parity) * vec2(1.0, -1.0);
  vec2 crossAxis = mix(B, T, parity) * vec2(1.0, -1.0);
  float acrossLocal = mix(f.y, f.x, parity);
  float alongLocal = mix(warp, weft, parity);
  float cellPx = 2.0 / (P_density * dome.z * s.px);
  float fine = smoothstep(14.0, 28.0, cellPx);
  float bulge = sin(acrossLocal * PI) * P_depth * 0.32;
  float filament = (sin(acrossLocal * TAU * 7.0) + m_noise(vec2(alongLocal * 2.0, acrossLocal * 40.0)) * 0.18) * 0.13 * fine;
  float tilt = (bulge + filament) * smoothstep(3.0, 6.0, cellPx);
  vec3 n = normalize(vec3(ng.xy + crossAxis * tilt, ng.z));
  float edge = min(0.5 - abs(f.x), 0.5 - abs(f.y));
  float ao = mix(0.5, 1.0, smoothstep(0.0, max(0.05, 1.2 / cellPx), edge));
  ao = mix(0.86, ao, smoothstep(2.0, 5.0, cellPx));
  vec3 view = normalize(vec3(s.p * 0.3, 1.0));
  float grazing = 1.0 - clamp(-dot(ng, view), 0.0, 1.0);
  vec3 R = reflect(view, ng);
  float rough = clamp(P_roughness, 0.0, 1.0);
  float la = radians(P_lightAngle);
  vec3 L = normalize(vec3(cos(la), sin(la), -0.7));
  float baseA = mix(0.06, 0.5, rough);
  float sheenA = m_ward(n, vec3(fiber, 0.0), L, view, baseA * 6.0, baseA);
  float sheenB = m_ward(n, vec3(crossAxis, 0.0), L, view, baseA * 6.0, baseA);
  float sheen = mix((sheenA + sheenB) * 0.5, sheenA, smoothstep(2.5, 5.0, cellPx)) * P_sheen;
  float ndl = clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0);
  float bodyLum = clamp(0.035 + ndl * 0.1 + sheen, 0.0, 1.3);
  vec3 body = mix(m_lin(C_resin.rgb), m_lin(C_sheenColor.rgb), bodyLum) * ao;
  float coat = m_studio5(R.xy, 0.16, 2.0, 0.3) * (0.05 + pow(grazing, 5.0) * 0.95) * P_clearcoat;
  return vec4(m_srgb(body + coat), 1.0);
}
`},dt=e=>{const a=Math.sin(e*12.9898)*43758.5453;return a-Math.floor(a)},yo=e=>e.toFixed(6),Dr=Array.from({length:7},(e,a)=>{const t=a*2.399963,s=Math.sqrt((a+.5)/7),o=[s*Math.cos(t),s*Math.sin(t),.5+dt(a+1),.5+dt(a+7)],r=[.5+dt(a+13),dt(a+2)*6.2831853,dt(a+5)*6.2831853,dt(a+9)*6.2831853];return`  pot += m_charge(q, t, vec4(${o.map(yo).join(", ")}), vec4(${r.map(yo).join(", ")}), drift, baseR);`}).join(`
`),Nr={id:"goo",name:"Goo",kind:"shape",group:"relief",source:"shaders.com",animated:!0,outside:!1,surface:.25,params:[{name:"color",label:"Cor",type:"color",default:"#67c667"},{name:"bevel",label:"Roundness",type:"number",min:.02,max:.8,step:.01,default:.32},{name:"blobSize",label:"Blob size",type:"number",min:.1,max:1,step:.01,default:.3},{name:"bulge",label:"Bulge",type:"number",min:0,max:1.5,step:.01,default:1},{name:"wobble",label:"Wobble",type:"number",min:0,max:1,step:.01,default:.5},{name:"angle",label:"Light angle",type:"number",min:0,max:360,step:1,default:300},{name:"wetness",label:"Highlights",type:"number",min:0,max:5,step:.01,default:2},{name:"translucency",label:"Translucency",type:"number",min:0,max:1,step:.01,default:.6},{name:"speed",label:"Velocidade",type:"number",min:0,max:2,step:.01,default:.5},{name:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:1}],glsl:`
vec3 m_charge(vec2 q, float t, vec4 pf, vec4 ph, float drift, float baseR) {
  vec2 c = pf.xy * 0.45 + drift * vec2(sin(t * pf.z + ph.y), cos(t * pf.w + ph.z));
  float r = baseR * (1.0 + 0.3 * sin(t * ph.x + ph.w));
  float inv = 1.0 / max(r * r, 1e-4);
  vec2 dq = q - c;
  float e = exp(-dot(dq, dq) * inv);
  return vec3(e, -2.0 * inv * e * dq);
}

vec4 material(Surface s) {
  if (s.d > 0.02) return vec4(0.0);
  float t = s.time * P_speed + P_variation;
  vec2 q = s.p * 0.5;
  float drift = P_wobble * 0.12;
  float baseR = P_blobSize * 0.38 * 1.07;
  vec3 pot = vec3(0.0);
${Dr}

  float contain = 0.9;
  float f = s.d * 0.5;
  float i0 = 1.0 - smoothstep(-0.06, 0.06, f);
  float H = pot.x * mix(1.0, i0, contain) + i0 * contain;

  float rim = clamp(1.0 + s.d / P_bevel, 0.0, 0.985) * smoothstep(0.15, 0.85, s.slope);
  vec2 dome = s.n * rim / sqrt(1.0 - rim * rim);
  float lift = P_bulge * 0.12 + 0.03;
  vec3 n = normalize(vec3(dome - pot.yz * mix(1.0, i0, contain) * lift, 1.0));
  float bulge = sqrt(max(H - 0.5, 0.0)) * P_bulge;
  float thick = clamp(bulge + max(-f, 0.0) * contain * 1.2, 0.0, 1.0);

  float la = P_angle * PI / 180.0;
  vec3 L = normalize(vec3(cos(la), sin(la), 0.8));
  vec3 Hv = normalize(L + vec3(0.0, 0.0, 1.0));
  float ndl = clamp(dot(n, L), 0.0, 1.0);
  float ndh = clamp(dot(n, Hv), 0.0, 1.0);
  float spec = pow(ndh, 232.0) * 1.7 + pow(ndh, 32.0) * 0.25 + smoothstep(0.992, 0.999, ndh) * 1.9;
  spec += pow(1.0 - clamp(n.z, 0.0, 1.0), 5.0) * 0.25;
  vec3 goo = toLinear(C_color.rgb);
  vec3 sss = goo * P_translucency * exp(-2.0 * (1.0 - thick)) * (ndl * 0.5 + 0.5);
  vec3 body = goo * (0.25 + ndl * 0.7);
  vec3 rgb = body + sss + vec3(spec * P_wetness);
  return vec4(toDisplay(rgb), C_color.a);
}
`},Br={id:"emboss",name:"Emboss",kind:"shape",group:"relief",source:"shaders.com",animated:!1,outside:!0,reach:99,surface:"bevel",params:[{name:"paper",label:"Paper",type:"color",default:"#ebeae6"},{name:"mode",label:"Relief",type:"select",options:[{value:0,label:"Debossed"},{value:1,label:"Embossed"}],default:0},{name:"surround",label:"Surround",type:"boolean",default:!1},{name:"depth",label:"Profundidade",type:"number",min:.05,max:1,step:.01,default:.5},{name:"bevel",label:"Bevel",type:"number",min:.004,max:.12,step:.001,default:.02},{name:"angle",label:"Light angle",type:"number",min:0,max:360,step:1,default:260},{name:"light",label:"Highlights",type:"number",min:0,max:2,step:.01,default:.25},{name:"shadow",label:"Shadows",type:"number",min:0,max:1,step:.01,default:.3},{name:"grain",label:"Grain",type:"number",min:0,max:1,step:.01,default:.5}],glsl:`
float m_hash(vec2 p) {
  uvec2 u = floatBitsToUint(p * vec2(141421356.0, 2718281828.0));
  return float((u.x ^ u.y) * 3141592653u) / 4294967295.0;
}

float m_noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(m_hash(i), m_hash(i + vec2(1.0, 0.0)), f.x),
    mix(m_hash(i + vec2(0.0, 1.0)), m_hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float m_paper(vec2 q) {
  float n = m_noise(q * 9.0) * 0.45;
  n += m_noise(rot2(0.7) * q * vec2(26.0, 70.0)) * 0.3;
  n += m_noise(rot2(-1.1) * q * vec2(60.0, 150.0)) * 0.25;
  return n - 0.5;
}

float m_height(float d, float depth, float w) {
  return depth * smoothstep(0.0, -w, d);
}

vec4 material(Surface s) {
  bool surround = P_surround > 0.5;
  if (!surround && s.d > s.aa * 2.0) return vec4(0.0);
  float depth = (P_mode > 0.5 ? 1.0 : -1.0) * P_depth;
  float ad = max(abs(depth), 1e-4);
  float w = max(P_bevel, s.px);
  float la = P_angle * PI / 180.0;
  vec2 dir = vec2(cos(la), sin(la));

  float x = clamp(-s.d / w, 0.0, 1.0);
  float ramp = 6.0 * x * (1.0 - x) / w;
  vec2 grad = -depth * ramp * s.n * s.slope * 2.0;
  vec3 N = normalize(vec3(-grad, 1.0));
  vec3 L = vec3(dir * 0.8192, 0.5735);
  float lit = (dot(N, L) - 0.5735) * P_light;
  float hi = max(lit, 0.0);
  float edge = max(-lit, 0.0);

  float drop = 0.0;
  float spread = ad * 0.12;
  float soft = ad * 0.12;
  float mid = s.d + w * 0.5;
  if (abs(mid) < spread + soft + w) {
    float hC = m_height(s.d, depth, w);
    float h1 = depth * smoothstep(soft, -soft, shapeAt(s.p + dir * spread * 0.5) + w * 0.5);
    float h2 = depth * smoothstep(soft, -soft, shapeAt(s.p + dir * spread) + w * 0.5);
    drop = smoothstep(0.0, 0.5, (h1 - hC) / ad) * 0.55 + smoothstep(0.0, 0.5, (h2 - hC) / ad) * 0.45;
  }
  float shade = clamp(edge + drop, 0.0, 1.0) * P_shadow;

  vec2 q = s.p * (1.0 - depth * 0.05 * s.cov);
  vec3 paper = C_paper.rgb * (1.0 + m_paper(q) * P_grain * 0.08);
  vec3 col = clamp(paper * (1.0 - shade) + hi, 0.0, 1.0);
  return vec4(col, C_paper.a * (surround ? 1.0 : s.cov));
}
`},Ur={id:"voxels",name:"Voxels",kind:"shape",group:"volume",source:"shaders.com",animated:!1,heavy:!0,outside:!0,normals:!1,surface:.05,params:[{name:"colorA",label:"Topo",type:"color",default:"#6ea8ff"},{name:"colorB",label:"Base",type:"color",default:"#1d2b4f"},{name:"palette",label:"Palette",type:"select",options:[{value:0,label:"Sólido"},{value:1,label:"Altura"},{value:2,label:"Profundidade"},{value:3,label:"Random"},{value:4,label:"Top / sides"}],default:1},{name:"size",label:"Voxel size",type:"number",min:.025,max:.15,step:.001,default:.05},{name:"height",label:"Altura",type:"number",min:0,max:.5,step:.01,default:.3},{name:"bevel",label:"Bevel",type:"number",min:.05,max:.8,step:.01,default:.6},{name:"tilt",label:"Tilt",type:"number",min:0,max:.8,step:.01,default:.35},{name:"lightAngle",label:"Light angle",type:"number",min:0,max:360,step:1,default:225},{name:"shadows",label:"Shadows",type:"number",min:0,max:1,step:.01,default:.85},{name:"seams",label:"Seams",type:"number",min:0,max:1,step:.01,default:.2},{name:"jitter",label:"Jitter",type:"number",min:0,max:1,step:.01,default:.25},{name:"gloss",label:"Gloss",type:"number",min:0,max:1,step:.01,default:.35}],glsl:`
uint m_hash(uvec3 v) {
  uint h = v.x * 0x8da6b343u ^ v.y * 0xd8163841u ^ v.z * 0xcb1ab31fu;
  h ^= h >> 16u;
  h *= 0x7feb352du;
  h ^= h >> 15u;
  h *= 0x846ca68bu;
  h ^= h >> 16u;
  return h;
}

vec3 m_toLab(vec3 c) {
  vec3 lms = vec3(
    dot(c, vec3(0.4122214708, 0.5363325363, 0.0514459929)),
    dot(c, vec3(0.2119034982, 0.6806995451, 0.1073969566)),
    dot(c, vec3(0.0883024619, 0.2817188376, 0.6299787005))
  );
  lms = pow(max(lms, 0.0), vec3(1.0 / 3.0));
  return vec3(
    dot(lms, vec3(0.2104542553, 0.793617785, -0.0040720468)),
    dot(lms, vec3(1.9779984951, -2.428592205, 0.4505937099)),
    dot(lms, vec3(0.0259040371, 0.7827717662, -0.808675766))
  );
}

vec3 m_fromLab(vec3 l) {
  vec3 lms = vec3(
    l.x + 0.3963377774 * l.y + 0.2158037573 * l.z,
    l.x - 0.1055613458 * l.y - 0.0638541728 * l.z,
    l.x - 0.0894841775 * l.y - 1.291485548 * l.z
  );
  lms = lms * lms * lms;
  return vec3(
    dot(lms, vec3(4.0767416621, -3.3077115913, 0.2309699292)),
    dot(lms, vec3(-1.2684380046, 2.6097574011, -0.3413193965)),
    dot(lms, vec3(-0.0041960863, -0.7034186147, 1.707614701))
  );
}

float m_column(vec2 cell, float v, float layers, float width) {
  float d = shapeAt(cell * v);
  if (d > -0.02 * v) return 0.0;
  float x = clamp(-d / width, 0.0, 1.0);
  float dome = sqrt(max(1.0 - (1.0 - x) * (1.0 - x), 0.0));
  return (floor(layers * dome + 0.5) + 1.0) * v;
}

struct m_Hit {
  float z;
  float axis;
  float prev;
  float h;
  vec2 cell;
  vec2 stp;
};

m_Hit m_trace(vec2 p, vec2 e, float top, float v, float layers, float width) {
  vec2 a = (p + e * top) / v + 0.5;
  vec2 dir = p / v + 0.5 - a;
  vec2 cell = floor(a);
  vec2 stp = vec2(dir.x < 0.0 ? -1.0 : 1.0, dir.y < 0.0 ? -1.0 : 1.0);
  vec2 inv = 1.0 / max(abs(dir), vec2(1e-6));
  vec2 tMax = vec2(
    (stp.x > 0.0 ? cell.x + 1.0 - a.x : a.x - cell.x) * inv.x,
    (stp.y > 0.0 ? cell.y + 1.0 - a.y : a.y - cell.y) * inv.y
  );
  float sIn = 0.0;
  float axis = -1.0;
  float prev = 0.0;
  m_Hit hit = m_Hit(-1.0, -1.0, 0.0, 0.0, cell, stp);
  for (int i = 0; i < 24; i++) {
    float sOut = min(min(tMax.x, tMax.y), 1.0);
    float h = m_column(cell, v, layers, width);
    float zIn = top * (1.0 - sIn);
    if (h > 0.0 && h >= top * (1.0 - sOut)) {
      bool side = h >= zIn;
      hit = m_Hit(side ? zIn : h, side ? axis : -1.0, prev, h, cell, stp);
      break;
    }
    if (sOut >= 1.0) break;
    prev = h;
    if (tMax.x < tMax.y) {
      cell.x += stp.x;
      sIn = tMax.x;
      tMax.x += inv.x;
      axis = 0.0;
    } else {
      cell.y += stp.y;
      sIn = tMax.y;
      tMax.y += inv.y;
      axis = 1.0;
    }
  }
  return hit;
}

vec3 m_shade(m_Hit hit, vec2 p, vec2 e, float v, float layers, float width, float px) {
  vec2 hp = p + e * hit.z;
  vec2 cc = hit.cell * v;
  float half_ = v * 0.5;
  float level = hit.axis < 0.0 ? hit.h / v - 1.0 : floor(hit.z / v - 1e-4);
  vec3 l = vec3(hp - cc, hit.z - (level + 0.5) * v);
  vec3 faceN = hit.axis < 0.0 ? vec3(0.0, 0.0, 1.0) : (hit.axis < 0.5 ? vec3(-hit.stp.x, 0.0, 0.0) : vec3(0.0, -hit.stp.y, 0.0));
  vec3 tangent = 1.0 - abs(faceN);
  vec3 al = abs(l) * tangent;
  float edge = clamp(max(max(al.x, al.y), al.z) / half_, 0.0, 1.0);
  float rEff = max(half_ * 0.12, px * 0.9);
  vec3 n = normalize(faceN * rEff + sign(l) * max(abs(l) - (half_ - rEff), 0.0) * tangent);

  float az = radians(P_lightAngle);
  float el = radians(42.0);
  vec3 L = normalize(vec3(cos(az) * cos(el), sin(az) * cos(el), sin(el)));
  vec3 V = normalize(vec3(e, 1.0));

  float shadow = 1.0;
  if (P_shadows > 0.001 && dot(n, L) > -0.12) {
    shadow = 0.0;
    vec2 ld = normalize(vec2(cos(az), sin(az)));
    float rise = tan(el);
    for (int k = 1; k <= 3; k++) {
      float dist = float(k) * 0.75 * v;
      vec2 pk = hp + ld * dist + faceN.xy * v * 0.05;
      float hk = m_column(floor(pk / v + 0.5), v, layers, width);
      shadow = max(shadow, smoothstep(0.0, v * 0.35, hk - (hit.z + dist * rise)));
    }
  }

  uint hsh = m_hash(uvec3(uvec2(ivec2(hit.cell + 4096.0)), uint(level + 1.0)));
  float rnd = float(hsh & 65535u) / 65535.0;
  vec3 ca = toLinear(C_colorA.rgb);
  vec3 cb = toLinear(C_colorB.rgb);
  float pt = 0.0;
  if (P_palette > 0.5 && P_palette < 1.5) pt = clamp(0.5 + cc.y / 1.8, 0.0, 1.0);
  if (P_palette > 1.5 && P_palette < 2.5) pt = 1.0 - (level + 0.5) / (layers + 1.0);
  if (P_palette > 2.5 && P_palette < 3.5) pt = rnd;
  if (P_palette > 3.5) pt = 1.0 - smoothstep(0.35, 0.75, n.z);
  vec3 base = P_palette < 0.5 ? ca : m_fromLab(mix(m_toLab(ca), m_toLab(cb), pt));
  vec3 albedo = base * (1.0 + (rnd - 0.5) * P_jitter * 0.6);

  float ao = hit.axis >= 0.0 ? mix(0.55, 1.0, smoothstep(0.0, v * 0.8, hit.z - hit.prev)) : 1.0;
  float ndl = clamp((dot(n, L) + 0.12) / 1.12, 0.0, 1.0);
  float lit = 1.0 - shadow * P_shadows;
  vec3 key = vec3(1.0, 0.89, 0.74) * 1.1;
  vec3 sky = vec3(0.35, 0.45, 0.68);
  vec3 ambient = mix(sky * 0.35, sky, clamp(-n.y, 0.0, 1.0)) * 0.55 * ao;
  float shin = exp2(mix(3.0, 7.5, P_gloss));
  float lobe = pow(clamp(dot(n, normalize(L + V)), 0.0, 1.0), shin) * mix(0.2, 1.4, P_gloss);
  float rim = 0.02 + pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 5.0) * P_gloss * 0.5;
  float sw = 0.04 + P_seams * 0.12;
  float fw = px / half_;
  float seam = smoothstep(1.0 - sw - fw, 1.0 - sw + fw, edge) * sw / max(sw, fw);
  vec3 rgb = albedo * (key * ndl * lit + ambient) + key * lobe * 0.6 * lit + sky * rim * 0.3 * ao;
  return rgb * (1.0 - P_seams * 0.75 * seam);
}

vec4 material(Surface s) {
  float v = P_size;
  float layers = clamp(floor(P_height / v + 0.5), 0.0, 16.0);
  float width = max(P_bevel, v);
  float top = (layers + 1.0) * v + 1e-4;
  vec2 e = vec2(0.70710678) * P_tilt;
  if (s.d > top * P_tilt + v) return vec4(0.0);
  vec2 off = vec2(0.25, -0.25) * s.px;
  m_Hit h1 = m_trace(s.p + off, e, top, v, layers, width);
  m_Hit h2 = m_trace(s.p - off, e, top, v, layers, width);
  float w1 = h1.z >= 0.0 ? 1.0 : 0.0;
  float w2 = h2.z >= 0.0 ? 1.0 : 0.0;
  if (w1 + w2 < 0.5) return vec4(0.0);
  vec3 c1 = w1 > 0.5 ? m_shade(h1, s.p + off, e, v, layers, width, s.px) : vec3(0.0);
  bool same = w1 > 0.5 && h1.axis == h2.axis && all(equal(h1.cell, h2.cell)) && abs(h1.z - h2.z) < v * 0.5;
  vec3 c2 = w2 > 0.5 ? (same ? c1 : m_shade(h2, s.p - off, e, v, layers, width, s.px)) : vec3(0.0);
  vec3 rgb = (c1 * w1 + c2 * w2) / (w1 + w2);
  return vec4(toDisplay(clamp(rgb, 0.0, 1.0)), (w1 + w2) * 0.5);
}
`},$r={id:"particles",name:"Dust",kind:"shape",group:"volume",source:"shaders.com",animated:!0,outside:!0,surface:.05,params:[{name:"rest",label:"Cor",type:"color",default:"#8ec5ff"},{name:"excited",label:"Excited",type:"color",default:"#ff7ad9"},{name:"density",label:"Densidade",type:"number",min:.25,max:4,step:.01,default:1.4},{name:"size",label:"Tamanho",type:"number",min:.002,max:.02,step:5e-4,default:.0075},{name:"shape",label:"Shape",type:"select",options:[{value:0,label:"Dot"},{value:1,label:"Square"},{value:2,label:"Glow"}],default:0},{name:"softness",label:"Softness",type:"number",min:0,max:1,step:.01,default:.1},{name:"exposure",label:"Exposure",type:"number",min:.2,max:3,step:.01,default:1},{name:"depth",label:"Profundidade",type:"number",min:0,max:.8,step:.01,default:.25},{name:"agitation",label:"Agitation",type:"number",min:0,max:1,step:.01,default:.12},{name:"stir",label:"Stir",type:"number",min:0,max:1,step:.01,default:0},{name:"speed",label:"Velocidade",type:"number",min:0,max:3,step:.01,default:1}],glsl:`
uint m_hash(uvec3 v) {
  uint h = v.x * 0x8da6b343u ^ v.y * 0xd8163841u ^ v.z * 0xcb1ab31fu;
  h ^= h >> 16u;
  h *= 0x7feb352du;
  h ^= h >> 15u;
  h *= 0x846ca68bu;
  h ^= h >> 16u;
  return h;
}

vec4 m_rand(uvec3 v) {
  uint a = m_hash(v);
  uint b = m_hash(uvec3(a, v.y ^ 0x9e3779b9u, v.z + 17u));
  return vec4(float(a & 65535u), float(a >> 16u), float(b & 65535u), float(b >> 16u)) / 65535.0;
}

vec3 m_toLab(vec3 c) {
  vec3 lms = vec3(
    dot(c, vec3(0.4122214708, 0.5363325363, 0.0514459929)),
    dot(c, vec3(0.2119034982, 0.6806995451, 0.1073969566)),
    dot(c, vec3(0.0883024619, 0.2817188376, 0.6299787005))
  );
  lms = pow(max(lms, 0.0), vec3(1.0 / 3.0));
  return vec3(
    dot(lms, vec3(0.2104542553, 0.793617785, -0.0040720468)),
    dot(lms, vec3(1.9779984951, -2.428592205, 0.4505937099)),
    dot(lms, vec3(0.0259040371, 0.7827717662, -0.808675766))
  );
}

vec3 m_fromLab(vec3 l) {
  vec3 lms = vec3(
    l.x + 0.3963377774 * l.y + 0.2158037573 * l.z,
    l.x - 0.1055613458 * l.y - 0.0638541728 * l.z,
    l.x - 0.0894841775 * l.y - 1.291485548 * l.z
  );
  lms = lms * lms * lms;
  return vec3(
    dot(lms, vec3(4.0767416621, -3.3077115913, 0.2309699292)),
    dot(lms, vec3(-1.2684380046, 2.6097574011, -0.3413193965)),
    dot(lms, vec3(-0.0041960863, -0.7034186147, 1.707614701))
  );
}

vec4 material(Surface s) {
  float h = 0.034 / sqrt(max(P_density, 0.05));
  float r0 = min(P_size, h * 0.6);
  if (s.d > r0 * 1.6 + s.px * 2.0) return vec4(0.0);
  float t = s.time * P_speed;
  float soft = P_shape > 1.5 ? 1.0 : P_softness;
  float aa = s.px * 0.75;
  vec2 grad = s.n * s.slope;
  float budget = max(0.0, 0.98 - r0 * 1.35 / h);
  float jitter = min(0.3, budget * 0.4);
  float wob = min(P_agitation * 1.2, budget * 0.25);
  float push = min(0.45, budget * 0.4) * P_stir;
  vec2 stir = vec2(sin(t * 0.37) + 0.35 * sin(t * 0.83 + 1.3), 0.8 * cos(t * 0.29 + 0.6) + 0.3 * sin(t * 0.61)) * 0.45;
  float stirR = 0.22;
  float energy = 0.0;
  float excite = 0.0;
  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    mat2 R = rot2(fk * 1.7 + 0.4);
    vec2 shift = vec2(fk * 0.37, fk * 0.71);
    vec2 q = R * s.p / h + shift;
    vec2 sg = R * stir / h + shift;
    vec2 cell = floor(q);
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 c = cell + vec2(float(i), float(j));
        uvec3 key = uvec3(uvec2(ivec2(c)), uint(k));
        vec4 a = m_rand(key);
        vec4 b = m_rand(key + uvec3(0u, 0u, 8u));
        vec2 home = c + 0.5 + (a.xy - 0.5) * 2.0 * jitter;
        float ph = b.x * TAU;
        float fr = (0.7 + b.y * 0.9) * (0.6 + P_agitation * 2.5);
        vec2 pg = home + vec2(sin(t * fr * 2.3 + ph), cos(t * fr * 1.9 + ph * 1.7)) * wob;
        vec2 toS = pg - sg;
        float ds = length(toS) * h / stirR;
        float fall = exp(-ds * ds) * P_stir;
        pg += toS / max(length(toS), 1e-4) * push * exp(-ds * ds);
        vec2 off = ((pg - q) * R) * h;
        float dc = s.d + dot(grad, off);
        float tk = clamp(-dc / max(P_depth, 1e-3), 0.0, 1.0);
        float th = P_depth < 1e-3 ? step(dc, 0.0) : sqrt(max(1.0 - (1.0 - tk) * (1.0 - tk), 0.0));
        float keep = step(a.z, th) * step(dc, 0.0) * (1.0 - P_stir * (1.0 - smoothstep(0.25, 0.85, ds)));
        if (keep <= 0.0) continue;
        float rad = r0 * (0.65 + 0.7 * a.w);
        float dist = length(off);
        float sd = P_shape > 0.5 && P_shape < 1.5 ? max(abs(off.x), abs(off.y)) - rad * 0.9 : dist - rad;
        float hard = clamp(0.5 - sd / (aa * 2.0), 0.0, 1.0);
        float qq = dist * dist / (rad * rad);
        float w = mix(hard, exp(-2.5 * qq), soft);
        float bright = (0.7 + 0.6 * a.w) * keep;
        energy += w * bright;
        excite += w * bright * clamp(fall * 1.4 + smoothstep(0.45, 1.0, P_agitation) * b.z * 0.9, 0.0, 1.0);
      }
    }
  }
  if (energy <= 1e-5) return vec4(0.0);
  float alpha = 1.0 - exp(-1.6 * energy * P_exposure);
  vec3 la = m_toLab(toLinear(C_rest.rgb));
  vec3 lb = m_toLab(toLinear(C_excited.rgb));
  vec3 col = toDisplay(m_fromLab(mix(la, lb, clamp(excite / energy, 0.0, 1.0))));
  return vec4(col, alpha * C_rest.a);
}
`},Gr={id:"aurora-flow",name:"Aurora flow",kind:"fill",group:"pattern",source:"shaders.com",animated:!0,params:[{name:"colorA",label:"Base",type:"color",default:"#a533f8"},{name:"colorB",label:"Core",type:"color",default:"#22ee88"},{name:"colorC",label:"Tips",type:"color",default:"#1694e8"},{name:"sky",label:"Sky",type:"color",default:"#0a0813"},{name:"intensity",label:"Intensidade",type:"number",min:0,max:200,step:1,default:140},{name:"balance",label:"Balance",type:"number",min:0,max:100,step:1,default:70},{name:"height",label:"Altura",type:"number",min:10,max:200,step:1,default:120},{name:"position",label:"Posição",type:"number",min:-.5,max:1,step:.01,default:.3},{name:"waviness",label:"Waviness",type:"number",min:0,max:200,step:1,default:50},{name:"rays",label:"Rays",type:"number",min:0,max:100,step:1,default:35},{name:"scale",label:"Escala",type:"number",min:.25,max:4,step:.05,default:1},{name:"speed",label:"Velocidade",type:"number",min:-10,max:10,step:.1,default:5},{name:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],glsl:`
const float m_OFFSETS[4] = float[4](0.0, 3.1, 6.7, 9.4);
const float m_WEIGHTS[4] = float[4](1.0, 0.65, 0.45, 0.3);

vec3 m_lin(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 m_srgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(0.41666)) - 0.055, step(0.0031308, c));
}

vec4 m_mix(vec4 a, vec4 b, float t) {
  float wa = a.a * (1.0 - t);
  float wb = b.a * t;
  float w = wa + wb;
  return vec4((a.rgb * wa + b.rgb * wb) / max(w, 0.001), w);
}

float m_phase(float seed, float k, float big) {
  return fract(sin(seed * k) * big) * 6.283185307179586;
}

uint m_rotl(uint x, int k) {
  return (x << uint(k)) | (x >> uint(32 - k));
}

uint m_hash(int x, int y, int z) {
  uint s = 0xdeadbeefu + 25u;
  uint a = s + uint(x);
  uint b = s + uint(y);
  uint c = s + uint(z);
  c ^= b;
  c -= m_rotl(b, 14);
  a ^= c;
  a -= m_rotl(c, 11);
  b ^= a;
  b -= m_rotl(a, 25);
  c ^= b;
  c -= m_rotl(b, 16);
  a ^= c;
  a -= m_rotl(c, 4);
  b ^= a;
  b -= m_rotl(a, 14);
  c ^= b;
  c -= m_rotl(b, 24);
  return c;
}

float m_grad(uint h, vec3 f) {
  h &= 15u;
  float u = h < 8u ? f.x : f.y;
  float v = h < 4u ? f.y : (h == 12u || h == 14u ? f.x : f.z);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_noise(vec3 p) {
  vec3 i = floor(p);
  ivec3 c = ivec3(i);
  vec3 f = p - i;
  vec3 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float n000 = m_grad(m_hash(c.x, c.y, c.z), f);
  float n100 = m_grad(m_hash(c.x + 1, c.y, c.z), f - vec3(1.0, 0.0, 0.0));
  float n010 = m_grad(m_hash(c.x, c.y + 1, c.z), f - vec3(0.0, 1.0, 0.0));
  float n110 = m_grad(m_hash(c.x + 1, c.y + 1, c.z), f - vec3(1.0, 1.0, 0.0));
  float n001 = m_grad(m_hash(c.x, c.y, c.z + 1), f - vec3(0.0, 0.0, 1.0));
  float n101 = m_grad(m_hash(c.x + 1, c.y, c.z + 1), f - vec3(1.0, 0.0, 1.0));
  float n011 = m_grad(m_hash(c.x, c.y + 1, c.z + 1), f - vec3(0.0, 1.0, 1.0));
  float n111 = m_grad(m_hash(c.x + 1, c.y + 1, c.z + 1), f - vec3(1.0, 1.0, 1.0));
  float lo = mix(mix(n000, n100, w.x), mix(n010, n110, w.x), w.y);
  float hi = mix(mix(n001, n101, w.x), mix(n011, n111, w.x), w.y);
  return 0.982 * mix(lo, hi, w.z);
}

vec4 fill(vec2 p, float time) {
  float span = 1.7 * max(P_scale, 0.05);
  vec2 uv = vec2(0.5 + p.x / span, P_position + (p.y - (P_position - 0.5) * 1.7) / span);
  float t = time * P_speed;
  float wav = P_waviness * 0.01;
  float rayAmount = P_rays * 0.01;
  float height = P_height * 0.01;
  float wx = (uv.x - 0.5) * 2.0;
  float sum = 0.0;
  float total = 0.0;
  for (int i = 0; i < 4; i++) {
    float slow = t * 0.06 + m_OFFSETS[i];
    float seed = P_variation + float(i) * 31.7;
    float arc = sin(wx * 0.7 + slow * 0.4 + m_phase(seed, 12.9, 4758.5)) * 0.15
      + sin(wx * 1.6 + slow * 0.65 + m_phase(seed, 78.2, 2847.1)) * 0.08
      + sin(wx * 2.9 + slow * 0.3 + m_phase(seed, 41.6, 1593.7)) * 0.04;
    float warp = m_noise(vec3(wx * 0.5, slow * 0.25, seed * 0.1));
    float pathY = P_position + arc * wav + warp * 0.14 * wav;
    float wave = sin((wx + warp * 2.5) * (mix(6.0, 20.0, rayAmount) * 0.15) + slow * 0.1 + m_phase(seed, 53.7, 3847.2));
    float rays = pow(max(wave * 0.5 + 0.5, 0.0), 1.5);
    float dist = uv.y - pathY;
    float extent = height * mix(0.4, 1.0, rays) * (rays * 0.4 + 0.6);
    float envelope = smoothstep(-0.04, 0.015, dist) * (1.0 - smoothstep(0.0, extent, dist));
    float colorT = clamp(dist / (extent + 0.001), 0.0, 1.0);
    float section = mix(0.4, 1.0, warp * 0.5 + 0.5);
    float core = exp((colorT - 0.2) * (colorT - 0.2) * -6.0) * 0.3 + 1.0;
    float alpha = envelope * rays * section * core * m_WEIGHTS[i];
    sum += colorT * alpha;
    total += alpha;
  }
  float avgT = pow(sum / (total + 0.001), mix(2.5, 0.4, P_balance * 0.01));
  vec4 a = vec4(m_lin(C_colorA.rgb), C_colorA.a);
  vec4 b = vec4(m_lin(C_colorB.rgb), C_colorB.a);
  vec4 c = vec4(m_lin(C_colorC.rgb), C_colorC.a);
  vec4 color = m_mix(m_mix(a, b, smoothstep(0.0, 0.2, avgT)), c, smoothstep(0.4, 0.85, avgT));
  float glow = total * P_intensity * 0.018;
  vec3 light = m_srgb(clamp(color.rgb * glow, 0.0, 1.0));
  float la = clamp(glow * 0.5, 0.0, 1.0);
  float sa = C_sky.a * (1.0 - la);
  float oa = la + sa;
  return vec4((light * la + C_sky.rgb * sa) / max(oa, 0.0001), oa);
}
`},Or={id:"flowing-gradient",name:"Flowing gradient",kind:"fill",group:"pattern",source:"shaders.com",animated:!0,params:[{name:"colorA",label:"Color A",type:"color",default:"#0a0015"},{name:"colorB",label:"Color B",type:"color",default:"#6b17e6"},{name:"colorC",label:"Color C",type:"color",default:"#ff4d6a"},{name:"colorD",label:"Color D",type:"color",default:"#ff6b35"},{name:"distortion",label:"Distortion",type:"number",min:0,max:2,step:.05,default:.5},{name:"scale",label:"Escala",type:"number",min:.25,max:4,step:.05,default:1},{name:"speed",label:"Velocidade",type:"number",min:0,max:10,step:.1,default:1},{name:"variation",label:"Variação",type:"number",min:0,max:100,step:1,default:0}],glsl:`
vec3 m_lin(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 m_srgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(0.41666)) - 0.055, step(0.0031308, c));
}

vec3 m_lch(vec3 c) {
  vec3 lms = vec3(
    0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b,
    0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b,
    0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b
  );
  vec3 q = sign(lms) * pow(abs(lms), vec3(1.0 / 3.0));
  vec3 lab = vec3(
    0.2104542553 * q.x + 0.793617785 * q.y - 0.0040720468 * q.z,
    1.9779984951 * q.x - 2.428592205 * q.y + 0.4505937099 * q.z,
    0.0259040371 * q.x + 0.7827717662 * q.y - 0.808675766 * q.z
  );
  float chroma = length(lab.yz);
  return vec3(lab.x, chroma, chroma > 1e-7 ? atan(lab.z, lab.y) : 0.0);
}

vec3 m_rgb(vec3 lch) {
  vec3 lab = vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.291485548 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  );
}

vec4 m_mix(vec4 a, vec4 b, float t) {
  float wa = a.a * (1.0 - t);
  float wb = b.a * t;
  float w = wa + wb;
  return vec4((a.rgb * wa + b.rgb * wb) / max(w, 0.001), w);
}

uint m_rotl(uint x, int k) {
  return (x << uint(k)) | (x >> uint(32 - k));
}

uint m_hash(int x, int y, int z) {
  uint s = 0xdeadbeefu + 25u;
  uint a = s + uint(x);
  uint b = s + uint(y);
  uint c = s + uint(z);
  c ^= b;
  c -= m_rotl(b, 14);
  a ^= c;
  a -= m_rotl(c, 11);
  b ^= a;
  b -= m_rotl(a, 25);
  c ^= b;
  c -= m_rotl(b, 16);
  a ^= c;
  a -= m_rotl(c, 4);
  b ^= a;
  b -= m_rotl(a, 14);
  c ^= b;
  c -= m_rotl(b, 24);
  return c;
}

float m_grad(uint h, vec3 f) {
  h &= 15u;
  float u = h < 8u ? f.x : f.y;
  float v = h < 4u ? f.y : (h == 12u || h == 14u ? f.x : f.z);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_noise(vec3 p) {
  vec3 i = floor(p);
  ivec3 c = ivec3(i);
  vec3 f = p - i;
  vec3 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float n000 = m_grad(m_hash(c.x, c.y, c.z), f);
  float n100 = m_grad(m_hash(c.x + 1, c.y, c.z), f - vec3(1.0, 0.0, 0.0));
  float n010 = m_grad(m_hash(c.x, c.y + 1, c.z), f - vec3(0.0, 1.0, 0.0));
  float n110 = m_grad(m_hash(c.x + 1, c.y + 1, c.z), f - vec3(1.0, 1.0, 0.0));
  float n001 = m_grad(m_hash(c.x, c.y, c.z + 1), f - vec3(0.0, 0.0, 1.0));
  float n101 = m_grad(m_hash(c.x + 1, c.y, c.z + 1), f - vec3(1.0, 0.0, 1.0));
  float n011 = m_grad(m_hash(c.x, c.y + 1, c.z + 1), f - vec3(0.0, 1.0, 1.0));
  float n111 = m_grad(m_hash(c.x + 1, c.y + 1, c.z + 1), f - vec3(1.0, 1.0, 1.0));
  float lo = mix(mix(n000, n100, w.x), mix(n010, n110, w.x), w.y);
  float hi = mix(mix(n001, n101, w.x), mix(n011, n111, w.x), w.y);
  return 0.982 * mix(lo, hi, w.z);
}

vec4 m_warp(vec2 at, float scale, float z, vec2 offA, vec2 offB, float reach, float strength) {
  vec3 wp = vec3(at * scale, z);
  float nx = m_noise(wp + vec3(offA, 0.0));
  float ny = m_noise(wp + vec3(offB, 0.0));
  return vec4(at + vec2(nx, ny) * reach * strength, nx, ny);
}

vec4 fill(vec2 p, float time) {
  vec2 centred = p / (1.7 * max(P_scale, 0.05));
  float t = time * P_speed * 0.075;
  float seed = P_variation * 0.17;
  float strength = P_distortion;
  float spin = m_noise(vec3(centred.x * 0.8 + t * 0.4, centred.y * 0.8 - t * 0.25, seed));
  float angle = spin * 12.566370614359172 * strength;
  vec2 rot = vec2(
    centred.x * cos(angle) - centred.y * sin(angle),
    centred.x * sin(angle) + centred.y * cos(angle)
  );
  float shearT = t * 2.0;
  float shearX = rot.x + sin(rot.y * 5.0 + shearT) / 50.0 * strength;
  float shearY = rot.y + sin(shearX * 7.5 + shearT) / 25.0 * strength;
  vec4 level1 = m_warp(vec2(shearX, shearY), 2.0, t * 0.5 + seed, vec2(5.2, 1.3), vec2(1.7, 9.2), 0.25, strength);
  float tz = t * 0.3 + seed;
  vec4 level2 = m_warp(level1.xy, 1.5, tz, vec2(8.3, 2.8), vec2(3.1, 7.4), 0.2, strength);
  float zone = m_noise(vec3(level2.xy * 1.8, tz));
  float hardness = pow(max(level1.z * 0.5 + 0.5, 0.0), 1.5);
  float edge = mix(0.5, 0.008, hardness);
  float t1 = smoothstep(-edge, edge, zone);
  float t2 = smoothstep(-edge, edge, level1.w);
  vec4 a = vec4(m_lch(m_lin(C_colorA.rgb)), C_colorA.a);
  vec4 b = vec4(m_lch(m_lin(C_colorB.rgb)), C_colorB.a);
  vec4 c = vec4(m_lch(m_lin(C_colorC.rgb)), C_colorC.a);
  vec4 d = vec4(m_lch(m_lin(C_colorD.rgb)), C_colorD.a);
  vec4 base = m_mix(m_mix(a, b, t1), m_mix(c, d, t1), t2);
  float fold = max(1.0 - abs(t1 * 2.0 - 1.0), 1.0 - abs(t2 * 2.0 - 1.0)) * hardness;
  float light = (level2.z * 0.5 + 0.5) * 0.12 + 0.94;
  vec3 rgb = clamp(m_rgb(base.rgb) * light * (1.0 + fold * 0.35), 0.0, 1.0);
  return vec4(m_srgb(rgb), clamp(base.a, 0.0, 1.0));
}
`},Xr={id:"plasma-flow",name:"Plasma flow",kind:"fill",group:"pattern",source:"shaders.com",animated:!0,params:[{name:"colors",label:"Cores",type:"colorArray",default:["#7018be","#000000"],minItems:2,maxItems:6},{name:"intensity",label:"Intensidade",type:"number",min:.1,max:3,step:.1,default:1.8},{name:"contrast",label:"Contraste",type:"number",min:0,max:3,step:.1,default:1},{name:"balance",label:"Balance",type:"number",min:0,max:100,step:1,default:50},{name:"density",label:"Densidade",type:"number",min:0,max:4,step:.1,default:2},{name:"warp",label:"Warp",type:"number",min:0,max:1,step:.01,default:.4},{name:"speed",label:"Velocidade",type:"number",min:0,max:5,step:.1,default:2}],glsl:`
vec3 m_lin(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 m_srgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(0.41666)) - 0.055, step(0.0031308, c));
}

vec4 m_stop(int k) {
  vec4 c = C_colors(k);
  return vec4(m_lin(c.rgb), c.a);
}

vec4 m_ramp(float t) {
  float n = clamp(N_colors, 1.0, 6.0);
  float x = clamp(t, 0.0, 1.0) * max(n - 1.0, 0.0);
  int i = int(min(floor(x), max(n - 2.0, 0.0)));
  float f = clamp(x - float(i), 0.0, 1.0);
  vec4 a = m_stop(i);
  vec4 b = m_stop(min(i + 1, int(n) - 1));
  float wa = a.a * (1.0 - f);
  float wb = b.a * f;
  float w = wa + wb;
  return vec4((a.rgb * wa + b.rgb * wb) / max(w, 0.001), w);
}

uint m_rotl(uint x, int k) {
  return (x << uint(k)) | (x >> uint(32 - k));
}

uint m_hash(int x, int y, int z) {
  uint s = 0xdeadbeefu + 25u;
  uint a = s + uint(x);
  uint b = s + uint(y);
  uint c = s + uint(z);
  c ^= b;
  c -= m_rotl(b, 14);
  a ^= c;
  a -= m_rotl(c, 11);
  b ^= a;
  b -= m_rotl(a, 25);
  c ^= b;
  c -= m_rotl(b, 16);
  a ^= c;
  a -= m_rotl(c, 4);
  b ^= a;
  b -= m_rotl(a, 14);
  c ^= b;
  c -= m_rotl(b, 24);
  return c;
}

float m_grad(uint h, vec3 f) {
  h &= 15u;
  float u = h < 8u ? f.x : f.y;
  float v = h < 4u ? f.y : (h == 12u || h == 14u ? f.x : f.z);
  return ((h & 1u) != 0u ? -u : u) + ((h & 2u) != 0u ? -v : v);
}

float m_noise(vec3 p) {
  vec3 i = floor(p);
  ivec3 c = ivec3(i);
  vec3 f = p - i;
  vec3 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float n000 = m_grad(m_hash(c.x, c.y, c.z), f);
  float n100 = m_grad(m_hash(c.x + 1, c.y, c.z), f - vec3(1.0, 0.0, 0.0));
  float n010 = m_grad(m_hash(c.x, c.y + 1, c.z), f - vec3(0.0, 1.0, 0.0));
  float n110 = m_grad(m_hash(c.x + 1, c.y + 1, c.z), f - vec3(1.0, 1.0, 0.0));
  float n001 = m_grad(m_hash(c.x, c.y, c.z + 1), f - vec3(0.0, 0.0, 1.0));
  float n101 = m_grad(m_hash(c.x + 1, c.y, c.z + 1), f - vec3(1.0, 0.0, 1.0));
  float n011 = m_grad(m_hash(c.x, c.y + 1, c.z + 1), f - vec3(0.0, 1.0, 1.0));
  float n111 = m_grad(m_hash(c.x + 1, c.y + 1, c.z + 1), f - vec3(1.0, 1.0, 1.0));
  float lo = mix(mix(n000, n100, w.x), mix(n010, n110, w.x), w.y);
  float hi = mix(mix(n001, n101, w.x), mix(n011, n111, w.x), w.y);
  return 0.982 * mix(lo, hi, w.z);
}

vec4 fill(vec2 p, float time) {
  vec3 pos = vec3(p / 1.7 * exp(P_density - 1.0) + 0.5 * exp(1.0), 0.0);
  float t = time * P_speed * 0.125;
  float amount = P_warp * 4.0;
  float qx = m_noise(pos + vec3(t * 0.3, t * -0.2, 0.0));
  float qy = m_noise(pos + vec3(5.2, 1.3, t * 0.25));
  vec3 warped = pos + vec3(qx, qy, 0.0) * amount;
  float rx = m_noise(warped + vec3(1.7, 9.2, t * 0.15));
  float ry = m_noise(warped + vec3(8.3, 2.8, t * 0.13));
  float v = m_noise(pos + vec3(rx, ry, 0.0) * amount) * 0.5 + 0.5;
  float spread = pow(max(v, 0.0), 5.0 / max(P_intensity, 0.01));
  float contrasted = clamp((spread - 0.5) * P_contrast + 0.5, 0.0, 1.0);
  float balanced = clamp(contrasted + P_balance / 100.0 - 0.5, 0.0, 1.0);
  vec4 c = m_ramp(1.0 - balanced);
  return vec4(m_srgb(c.rgb), c.a);
}
`},Hr={id:"swirl",name:"Swirl",kind:"fill",group:"pattern",source:"shaders.com",animated:!0,params:[{name:"colors",label:"Cores",type:"colorArray",default:["#1275d8","#e19136"],minItems:2,maxItems:6},{name:"blend",label:"Blend",type:"number",min:0,max:100,step:1,default:50},{name:"detail",label:"Detalhe",type:"number",min:.2,max:5,step:.1,default:1},{name:"scale",label:"Escala",type:"number",min:.25,max:4,step:.05,default:1},{name:"speed",label:"Velocidade",type:"number",min:0,max:5,step:.1,default:1}],glsl:`
vec3 m_lin(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 m_srgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(0.41666)) - 0.055, step(0.0031308, c));
}

vec4 m_stop(int k) {
  vec4 c = C_colors(k);
  return vec4(m_lin(c.rgb), c.a);
}

vec4 m_ramp(float t) {
  float n = clamp(N_colors, 1.0, 6.0);
  float x = clamp(t, 0.0, 1.0) * max(n - 1.0, 0.0);
  int i = int(min(floor(x), max(n - 2.0, 0.0)));
  float f = clamp(x - float(i), 0.0, 1.0);
  vec4 a = m_stop(i);
  vec4 b = m_stop(min(i + 1, int(n) - 1));
  float wa = a.a * (1.0 - f);
  float wb = b.a * f;
  float w = wa + wb;
  return vec4((a.rgb * wa + b.rgb * wb) / max(w, 0.001), w);
}

float m_flow(vec2 uv, float detail, float t) {
  float f1 = detail;
  vec2 d1 = vec2(
    uv.x + (sin(uv.y * (f1 * 1.7) + t * 0.8) * 0.12 + cos(uv.x * (f1 * 0.9) - t * 0.5) * 0.05),
    uv.y + (cos(uv.x * (f1 * 1.3) - t * 0.6) * 0.12 + sin(uv.y * (f1 * 1.1) + t * 0.7) * 0.05)
  );
  float p1 = sin(d1.x * (f1 * 2.1) + d1.y * (f1 * 1.8) + t * 0.4);
  float f2 = detail * 2.1;
  vec2 d2 = vec2(
    d1.x + (cos(d1.y * (f2 * 2.7) - t * 0.45) * 0.07 + sin(d1.x * (f2 * 1.9) + t * 0.6) * 0.04),
    d1.y + (sin(d1.x * (f2 * 2.3) + t * 0.65) * 0.07 + cos(d1.y * (f2 * 1.6) - t * 0.4) * 0.04)
  );
  float p2 = cos(d2.x * (f2 * 1.4) - d2.y * (f2 * 1.9) + t * 0.35);
  float f3 = detail * 3.7;
  vec2 d3 = vec2(
    d2.x + (sin(d2.y * (f3 * 1.8) + t * 0.85) * 0.04 + cos(d2.x * (f3 * 1.3) - t * 0.55) * 0.025 + sin((d2.x + d2.y) * (f3 * 0.7) + t * 0.9) * 0.02),
    d2.y + (cos(d2.x * (f3 * 1.6) - t * 0.75) * 0.04 + sin(d2.y * (f3 * 1.1) + t * 0.5) * 0.025 + cos((d2.x + d2.y) * (f3 * 0.8) - t * 0.95) * 0.02)
  );
  float p3 = sin(d3.x * (f3 * 1.1) + d3.y * (f3 * 1.5) - t * 0.55);
  return p1 * 0.45 + p2 * 0.35 + p3 * 0.2;
}

vec4 fill(vec2 p, float time) {
  vec2 uv = 0.5 + p * 0.82 / max(P_scale, 0.05);
  float t = time * P_speed;
  float pattern = m_flow(uv, P_detail, t);
  float k = smoothstep(0.3, 0.7, pattern * 0.5 + 0.5 + (P_blend - 50.0) * 0.006);
  vec4 c = m_ramp(k) * (sin(t * 2.5 + pattern * 8.0) * 0.015 + 1.0);
  return vec4(m_srgb(clamp(c.rgb, 0.0, 1.0)), clamp(c.a, 0.0, 1.0));
}
`},gs=[{id:"fx-heat",label:"Heat and smoke",ids:["heatmap","gem-smoke","nebula","thermal","smoke"]},{id:"fx-metal",label:"Metal",ids:["chrome","quicksilver","brushed-metal","obsidian"]},{id:"fx-glass",label:"Glass",ids:["glass","crystal","frost","water","thin-film"]},{id:"fx-light",label:"Claro",ids:["holo-foil","neon","light-edge","irradiance","hologram"]},{id:"fx-surface",label:"Surface",ids:["plastic","goo","emboss","carbon-fiber","voxels","particles"]},{id:"patterns",label:"Patterns",ids:["aurora-flow","flowing-gradient","plasma-flow","swirl"]}],Vr=[gr,xr,br,yr,wr,kr,_r,zr,Tr,Er,Sr,Pr,Rr,Ar,Cr,Mr,Lr,qr,jr,Ir,Fr,Nr,Br,Ur,$r,Gr,Or,Xr,Hr],ra=Object.fromEntries(Vr.map(e=>[e.id,e])),Yr=[{id:"metal",label:"Liquid metal"},...gs.map(e=>({id:e.id,label:e.label})),{id:"backgrounds",label:"Background fills"},{id:"fills",label:"Fills"}],Ue=(e,a,t,s)=>({id:`fill:${e}`,group:"fills",kind:"flat",name:a,fill:t,effects:s}),xs=[Ue("cloud","Cloud",{kind:"linear",color1:"#ffffff",color2:"#cbcbd3",angle:180}),Ue("ink","Ink",{kind:"solid",color1:"#151218"}),Ue("cobalt","Cobalt",{kind:"solid",color1:"#2f6bff"}),Ue("dusk","Dusk",{kind:"linear",color1:"#ffd29a",color2:"#ff5d8f",color3:"#c2367a",stops:3,angle:150}),Ue("ocean","Ocean",{kind:"linear",color1:"#a4f3ff",color2:"#1d6bff",angle:170}),Ue("mint","Mint",{kind:"radial",color1:"#e9fff5",color2:"#2ccf91",extent:1.1}),Ue("ember","Ember",{kind:"linear",color1:"#ffe08a",color2:"#ff4b2b",angle:180}),Ue("candy","Candy",{kind:"conic",color1:"#ff8ad8",color2:"#8fd3ff",color3:"#ff8ad8",stops:3,angle:0}),Ue("chalk","Chalk",{kind:"solid",color1:"#f2efe8"}),Ue("lime","Lime",{kind:"linear",color1:"#f2ff9a",color2:"#4cd964",angle:135}),Ue("satin","Satin",{kind:"linear",color1:"#f6f6f8",color2:"#8d8d99",angle:200},{gloss:{on:!0,strength:.6,angle:225,bevel:.1}}),Ue("neon","Glow",{kind:"solid",color1:"#d9fbff"},{glow:{on:!0,intensity:.85,radius:.1,color:"#28e6ff"}})],Wr={color:"#ffffff",density:2,softness:.1,dispersion:.3,distortion:.07,edgeBend:.6,angle:70,speed:1,mouseTilt:.5},pt=(e,a,t)=>({id:`metal:${e}`,group:"metal",kind:"metal",name:a,props:{...Wr,...t}}),Kr=[pt("chrome","Chrome",{}),pt("liquid","Liquid",{edgeBend:.92,distortion:.22,density:2.6,dispersion:.45}),pt("noir","Noir",{color:"#b4b4ba",softness:.6,density:1.6,dispersion:0,distortion:.05,edgeBend:.5,angle:90}),pt("gold","Gold",{color:"#f2c46b",dispersion:.15}),pt("prism","Spectrum",{color:"#9cc4ff",softness:.8,density:6,dispersion:1,distortion:.4,edgeBend:.4,angle:0}),pt("brushed","Mist",{softness:1,density:2.5,dispersion:0,distortion:0,edgeBend:.5,angle:100})],bs=[{name:"color",label:"Cor",type:"color",default:"#ffffff"},{name:"density",label:"Densidade",type:"number",min:.5,max:8,step:.1,default:2},{name:"softness",label:"Softness",type:"number",min:0,max:1,step:.01,default:.1},{name:"dispersion",label:"Dispersion",type:"number",min:0,max:1,step:.01,default:.3},{name:"distortion",label:"Distortion",type:"number",min:0,max:1,step:.01,default:.07},{name:"edgeBend",label:"Edge bend",type:"number",min:0,max:1,step:.01,default:.6},{name:"angle",label:"Ângulo",type:"number",min:0,max:360,step:1,default:70},{name:"speed",label:"Velocidade",type:"number",min:0,max:3,step:.05,default:1},{name:"mouseTilt",label:"Mouse tilt",type:"number",min:0,max:1.5,step:.05,default:.5}],Zr=new Set(["grid-distortion","grid-motion","image-trail","ribbons","laser-flow","splash-cursor","click-spark","magic-rings","ghost-cursor"]),Jr=Ys.filter(e=>!Zr.has(e.id)).map(e=>({id:`bg:${e.id}`,group:"backgrounds",kind:"background",name:e.label,background:e.id,entry:e})),Qr=gs.flatMap(e=>e.ids.map(a=>({id:`fx:${a}`,group:e.id,kind:"procedural",name:ra[a].name,def:ra[a]}))),Ba=[...Kr,...Qr,...Jr,...xs],el=Object.fromEntries(Ba.map(e=>[e.id,e])),da=e=>Object.fromEntries(e.props.map(a=>[a.name,a.default])),pa=e=>({...da(e.entry),...e.lookProps||{},...e.props}),Oe=e=>{var s,o;const a=((s=e.material)==null?void 0:s.id)||"flat";if(a==="flat")return{kind:"flat"};if(a==="metal")return{kind:"metal",props:e.material.props||{}};if(a.startsWith("fx:")){const r=ra[a.slice(3)];return r?{kind:"procedural",def:r,props:e.material.props||{}}:{kind:"flat"}}const t=(o=el[a])==null?void 0:o.entry;return t?{kind:"background",entry:t,props:e.material.props||{},look:e.material.look||null,lookProps:e.material.lookProps||null}:{kind:"flat"}},La=220;let Zt=null,wo=Promise.resolve();const tl=()=>{if(Zt)return Zt;const e=document.createElement("canvas");return e.width=La,e.height=La,Zt={canvas:e,renderer:Ut(e,{preserve:!0})},Zt},ko=(e,a,t=La,s=0)=>{const o=wo.then(async()=>{const{canvas:r,renderer:i}=tl(),l=st([e.mark.layers]),m={a:e.mark,maskSlots:l.slots};return await i.prepareScene(m,a),$t(i,l.keys),i.draw({scene:m,style:a,width:t,height:t,time:s}),r.toDataURL("image/png")});return wo=o.catch(()=>{}),o},al=async e=>{const a=e.filter(bt);await Promise.all(a.map(t=>Dt(t).catch(()=>null)))},ol=()=>new Promise(e=>setTimeout(e,0)),sl=(e=!1)=>vr[e?"light":"dark"],_o=e=>{const a=String(e||"").replace("#","");if(a.length<6)return .5;const[t,s,o]=[0,2,4].map(r=>parseInt(a.slice(r,r+2),16)/255);return .2126*t+.7152*s+.0722*o};function nl(e,a,t){const[s,o]=w.useState({}),r=JSON.stringify([e.mark,a]),i=w.useRef(e);i.current=e;const l=w.useRef(null);return w.useEffect(()=>{if(!t||l.current===r)return;let m=!1;const c=setTimeout(async()=>{var h,p;const d=i.current;if(await al(d.mark.layers),m)return;const v=st([d.mark.layers]);if(!ps(v.keys))return;const x={silhouette:await ko(d,{fill:{kind:"solid",color1:"#ffffff"}},160)};o(u=>({...u,silhouette:x.silhouette}));for(const u of xs){if(await ol(),m)return;const P=(_o(u.fill.color1)+_o(u.fill.color2||u.fill.color1))/2,T=a?P>.82:P<.16,z=((h=u.effects)==null?void 0:h.gloss)||{on:!1},M={fill:u.fill,glow:((p=u.effects)==null?void 0:p.glow)||{on:!1},gloss:z,background:T?{kind:"color",color1:a?"#26232d":"#e8e5ee"}:{kind:"none"}};x[u.id]=await ko(d,M)}m||(l.current=r,o(x))},180);return()=>{m=!0,clearTimeout(c)}},[r,a,t]),s}let Jt=null;const rl=()=>{if(Jt)return Jt;const e=document.createElement("canvas");return Jt={canvas:e,renderer:Ut(e,{preserve:!0})},Jt},ll=async(e,a=1024)=>{const t=mt(e.artboard),s=t.w>=t.h?a:Math.round(a*t.w/t.h),o=t.w>=t.h?Math.round(a*t.h/t.w):a,{canvas:r,renderer:i}=rl(),l=st([e.mark.layers]),m={a:e.mark,maskSlots:l.slots},c={fill:{kind:"solid",color1:"#ffffff"},background:{kind:"none"}};return await i.prepareScene(m,c),$t(i,l.keys),i.draw({scene:m,style:c,width:s,height:o}),r};function il(e,a){const[t,s]=w.useState(null),o=w.useRef(e);o.current=e;const r=JSON.stringify([e.mark,e.artboard.ratio]),i=w.useRef(0);return w.useEffect(()=>{if(!a)return;let l=!1;return clearTimeout(i.current),i.current=setTimeout(async()=>{const m=o.current;if(await Promise.all(m.mark.layers.filter(bt).map(v=>Dt(v).catch(()=>null))),l)return;const c=st([m.mark.layers]);if(!ps(c.keys))return;const d=await ll(m,1024);l||s(d.toDataURL("image/png"))},120),()=>{l=!0,clearTimeout(i.current)}},[r,a]),t}const cl="/tools-runtime/shape-frame.html",ys=e=>`${cl}?${new URLSearchParams(e)}`;function ml({id:e,props:a,active:t,capture:s=!1,playing:o=!0}){const[r,i]=w.useState(null),[l,m]=w.useState(null),[c,d]=w.useState("idle"),[v]=w.useState(()=>ys({theme:"dark"})),x=w.useRef(null),h=w.useRef(a);return h.current=a,w.useEffect(()=>{if(x.current=null,m(null),d("idle"),!r)return;let p=null;const u=()=>{var z;const T=(z=r.contentWindow)==null?void 0:z.__rbStudio;!T||T===p||(p=T,x.current=null,m(T))},P=T=>{var z;T.source===r.contentWindow&&((z=T.data)==null?void 0:z.type)==="rb-shape-frame"&&u()};return window.addEventListener("message",P),r.addEventListener("load",u),u(),()=>{window.removeEventListener("message",P),r.removeEventListener("load",u)}},[r]),w.useEffect(()=>{var p;l&&((p=l.setCapture)==null||p.call(l,!!(t&&e&&s)))},[l,t,e,s]),w.useEffect(()=>{l&&(!t||!o?l.clock.pause():l.clock.resume())},[l,t,o]),w.useEffect(()=>{var p;if(l){if(!t||!e){x.current&&((p=l.clear)==null||p.call(l),x.current=null,d("idle"));return}if(x.current===e){l.update(a);return}x.current=e,d("loading"),l.load(e,a).then(u=>{!u||x.current!==e||(l.update(h.current),d("ready"))}).catch(()=>d("error"))}},[l,t,e,a]),{iframeRef:i,src:v,bridge:l,status:c}}const ws=e=>{var a,t;return(t=(a=e.material)==null?void 0:a.id)!=null&&t.startsWith("fx:")&&ra[e.material.id.slice(3)]||null},la=(e,{forMask:a=!1}={})=>{var r,i;if(a)return{fill:{kind:"solid",color1:"#ffffff"},background:{kind:"none"}};const t=ws(e);if(t){const l={def:t,values:{...as(t.params),...e.material.props||{}}};return{fill:t.kind==="fill"?{kind:"material"}:{kind:"solid",color1:"#ffffff"},material:l,outline:e.effects.outline,shadow:e.effects.shadow,glow:e.effects.glow,gloss:t.kind==="fill"?e.effects.gloss:{on:!1},background:e.artboard.background}}const s=!e.material||e.material.id==="flat",o=(i=(r=e.material)==null?void 0:r.id)==null?void 0:i.startsWith("bg:");return{fill:s?e.fill:o?{kind:"texture",color1:e.material.base??"#0c0b10"}:{kind:"none"},outline:e.effects.outline,shadow:e.effects.shadow,glow:e.effects.glow,gloss:s||o?e.effects.gloss:{on:!1},background:e.artboard.background}},be=Math.PI/180,Le=([e,a],t)=>{const s=Math.cos(t),o=Math.sin(t);return[e*s-a*o,e*o+a*s]},ks=e=>((e+180)%360+360)%360-180,gt=e=>{if(bt(e)){const a=ds(Na(e));return a?[a.halfW,a.halfH]:[1,e.type==="text"?.4:1]}return[1,1]},_s=e=>Math.round(e.repeat??1)>1,Qe=(e,a)=>{const t=_s(e)?(e.spin??0)*be:0,s=Le([e.x??0,e.y??0],t),o=(a.rotation??0)*be,r=Le([s[0]*a.scale,s[1]*a.scale],o);return{center:[r[0]+(a.x??0),r[1]+(a.y??0)],angle:o+t+(e.rotation??0)*be,scale:a.scale*(e.size??1),spin:t,markRot:o}},ct=(e,a,t)=>{const s=_s(e)?(e.spin??0)*be:0;let o=[t[0]-(a.x??0),t[1]-(a.y??0)];return o=Le(o,-(a.rotation??0)*be),o=[o[0]/a.scale,o[1]/a.scale],o=Le(o,-s),{x:Math.round(o[0]*1e3)/1e3,y:Math.round(o[1]*1e3)/1e3}},fl=(e,a,t,s=0)=>{let o=[e[0]-(t.x??0),e[1]-(t.y??0)];o=Le(o,-(t.rotation??0)*be),o=[o[0]/t.scale,o[1]/t.scale],a.mirror&&(o[0]=Math.abs(o[0]));const r=Math.round(a.repeat??1);if(r>1){const l=Math.PI*2/r;let m=Math.atan2(o[1],o[0])-(a.spin??0)*be;m=((m+l/2)%l+l)%l-l/2+s*l;const c=Math.hypot(o[0],o[1]);o=[c*Math.cos(m),c*Math.sin(m)]}const i=Le([o[0]-(a.x??0),o[1]-(a.y??0)],-(a.rotation??0)*be);return[i[0]/(a.size??1),i[1]/(a.size??1)]},ul=e=>{const a=Math.round(e.repeat??1);return a<2?[0]:a<5?[0,-1,1]:[0,-1,1,-2,2]},At=(e,a)=>{const t=a.layers.filter(s=>s.visible!==!1);for(let s=t.length-1;s>=0;s--){const o=t[s],[r,i]=gt(o);if(ul(o).some(m=>{const c=fl(e,o,a,m);return Math.abs(c[0])<=r*1.02&&Math.abs(c[1])<=i*1.02}))return o}return null},dl=[[-1,-1],[1,-1],[1,1],[-1,1]];function Ua(e,a,t){return dl.map(([s,o])=>{const r=Le([s*t[0],o*t[1]],a);return[e[0]+r[0],e[1]+r[1]]})}function ha(e){let a=1/0,t=1/0,s=-1/0,o=-1/0;return e.forEach(([r,i])=>{a=Math.min(a,r),t=Math.min(t,i),s=Math.max(s,r),o=Math.max(o,i)}),{minX:a,minY:t,maxX:s,maxY:o,cx:(a+s)/2,cy:(t+o)/2}}const aa=(e,a)=>{const t=Qe(e,a),[s,o]=gt(e);return ha(Ua(t.center,t.angle,[s*t.scale,o*t.scale]))},Ta=(e,a)=>{const t=Math.max(1,Math.round(e.repeat??1)),[s,o]=gt(e),r=(a.rotation??0)*be,i=t>1?(e.spin??0)*be:0,l=[s*(e.size??1)*a.scale,o*(e.size??1)*a.scale],m=[],c=e.mirror?[1,-1]:[1];for(let d=0;d<t;d++){const v=i+d*Math.PI*2/t;c.forEach(x=>{const h=Le([e.x??0,e.y??0],v),p=[h[0]*x,h[1]],u=Le([p[0]*a.scale,p[1]*a.scale],r),P=[u[0]+(a.x??0),u[1]+(a.y??0)],T=x>0?r+v+(e.rotation??0)*be:r-v-(e.rotation??0)*be;m.push(...Ua(P,T,l))})}return ha(m)},ia=e=>e.length?ha(e.flatMap(a=>[[a.minX,a.minY],[a.maxX,a.maxY]])):null,zs=e=>{const a=mt(e);return a.w>=a.h?[a.w/a.h,1]:[1,a.h/a.w]},pl=(e,a)=>e.minX<=a.maxX&&e.maxX>=a.minX&&e.minY<=a.maxY&&e.maxY>=a.minY,hl=(e,a,t,s)=>{const o=Qe(e,a),r=(o.markRot+o.spin)/be,i=t==="x"?-(e.rotation??0)-2*r:180-(e.rotation??0)-2*r,l=s?t==="x"?[2*s[0]-o.center[0],o.center[1]]:[o.center[0],2*s[1]-o.center[1]]:o.center;return{...s?ct(e,a,l):{},flip:!e.flip,rotation:Math.round(ks(i)*10)/10}},zo=(e,a,t)=>{let s=null;return e.forEach(o=>{a.forEach(r=>{const i=r-o;Math.abs(i)<=t&&(!s||Math.abs(i)<Math.abs(s.diff))&&(s={diff:i,target:r})})}),s},vl=(e,a,t)=>{let s=[e[0]-(t.x??0),e[1]-(t.y??0)];s=Le(s,-(t.rotation??0)*be);const o=!!a.mirror&&s[0]<0;o&&(s=[-s[0],s[1]]);const r=Math.round(a.repeat??1);if(r<2)return{copy:0,mirrored:o};const i=Math.PI*2/r,l=Math.atan2(s[1],s[0])-(a.spin??0)*be,m=Math.atan2(a.y??0,a.x??0);return{copy:Math.round((l-m)/i),mirrored:o}},Ts=(e,a)=>{const t=Math.round(e.repeat??1);return t>1?a.copy*Math.PI*2/t:0},gl=(e,a,t={copy:0,mirrored:!1})=>{const r=(Math.round(e.repeat??1)>1?(e.spin??0)*be:0)+Ts(e,t);let i=Le([e.x??0,e.y??0],r);const l=t.mirrored?-1:1;i=[i[0]*l,i[1]];const m=(a.rotation??0)*be,c=Le([i[0]*a.scale,i[1]*a.scale],m),d=(r+(e.rotation??0)*be)*l;return{center:[c[0]+(a.x??0),c[1]+(a.y??0)],angle:m+d,scale:a.scale*(e.size??1)}},xl=(e,a,t)=>{const s=gl(e,a,t),[o,r]=gt(e);return ha(Ua(s.center,s.angle,[o*s.scale,r*s.scale]))},bl=(e,a,t,s,o={copy:0,mirrored:!1})=>{let r=Le(s,-(a.rotation??0)*be);r=[r[0]/a.scale,r[1]/a.scale],o.mirrored&&(r=[-r[0],r[1]]);const l=Math.round(e.repeat??1)>1?(e.spin??0)*be:0;return r=Le(r,-(l+Ts(e,o))),{x:Math.round((t.x+r[0])*1e3)/1e3,y:Math.round((t.y+r[1])*1e3)/1e3}};function Es({thumbs:e,onPick:a,onText:t,onLogo:s,onClose:o,placement:r="below"}){const i=w.useRef(null);return w.useEffect(()=>{const l=c=>{var d,v,x;!((d=i.current)!=null&&d.contains(c.target))&&!((x=(v=c.target).closest)!=null&&x.call(v,'[aria-expanded="true"]'))&&o()},m=c=>{c.key==="Escape"&&o()};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",m),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",m)}},[o]),n.jsxs("div",{className:"smg-picker","data-placement":r,ref:i,role:"menu",children:[n.jsx("div",{className:"smg-picker-grid",children:xt.map(l=>n.jsxs("button",{type:"button",role:"menuitem",className:"smg-picker-item",title:l.name,onClick:()=>a(l.id),children:[n.jsx("span",{className:"smg-picker-thumb",children:e[`shape:${l.id}`]&&n.jsx("img",{src:e[`shape:${l.id}`],alt:"",draggable:!1})}),n.jsx("span",{className:"smg-picker-name",children:l.name})]},l.id))}),n.jsxs("div",{className:"smg-picker-actions",children:[n.jsxs("button",{type:"button",role:"menuitem",className:"lab-menu-item",onClick:t,children:[n.jsx(xe,{icon:H.TextIcon}),n.jsx("span",{children:"Texto"})]}),n.jsxs("button",{type:"button",role:"menuitem",className:"lab-menu-item",onClick:s,children:[n.jsx(xe,{icon:H.Upload04Icon}),n.jsx("span",{children:"Your logo"})]})]})]})}const Ss=typeof navigator<"u"&&/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent),Ce=Ss?"⌘":"Ctrl ",rt=Ss?"⌥":"Alt ",yl=[{title:"Select",items:[["Add to selection","⇧ click"],["Select several","Drag on empty space"],["Select all",`${Ce}A`],["Edit text","Double-click"]]},{title:"Move and shape",items:[["Nudge","Arrows, ⇧ for more"],["Move in a straight line","⇧ while dragging"],["Skip snapping",`Hold ${Ce}`],["Rotate in 15° steps","⇧ while rotating"],["Duplicate while dragging",`Hold ${rt}`]]},{title:"Arrange",items:[["Align left, center, right",`${rt}A  ${rt}H  ${rt}D`],["Align top, middle, bottom",`${rt}W  ${rt}V  ${rt}S`],["Flip","⇧H  ⇧V"],["Forward, backward",`${Ce}]  ${Ce}[`],["To front, to back",`⇧${Ce}]  ⇧${Ce}[`],["Hide",`⇧${Ce}H`]]},{title:"Editar",items:[["Copy, cut, paste",`${Ce}C  ${Ce}X  ${Ce}V`],["Duplicar",`${Ce}D`],["Excluir","⌫"],["Undo, redo",`${Ce}Z  ⇧${Ce}Z`],["Add text","T"],["Upload a logo",`${Ce}O`],["Play or pause","Espaço"],["Exportar","E"]]}];function wl({onClose:e}){const a=w.useRef(null);return w.useEffect(()=>{const t=o=>{var r,i,l;!((r=a.current)!=null&&r.contains(o.target))&&!((l=(i=o.target).closest)!=null&&l.call(i,'[aria-expanded="true"]'))&&e()},s=o=>{o.key==="Escape"&&e()};return document.addEventListener("pointerdown",t),document.addEventListener("keydown",s),()=>{document.removeEventListener("pointerdown",t),document.removeEventListener("keydown",s)}},[e]),n.jsx("div",{className:"smg-shortcuts",ref:a,role:"dialog","aria-label":"Keyboard shortcuts",children:yl.map(t=>n.jsxs("section",{className:"smg-shortcuts-group",children:[n.jsx("h3",{children:t.title}),t.items.map(([s,o])=>n.jsxs("div",{className:"smg-shortcut",children:[n.jsx("span",{children:s}),n.jsx("kbd",{children:o})]},s))]},t.title))})}function kl({thumbs:e,canPlay:a,playing:t,snapping:s,onToggleSnapping:o,onTogglePlay:r,onUpload:i,onAddShape:l,onAddText:m,onExport:c}){const[d,v]=w.useState(!1),[x,h]=w.useState(!1);return n.jsxs("div",{className:"docs-toolbar lab-toolbar smg-toolbar",children:[n.jsxs("div",{className:"lab-toolbar-group lab-toolbar-start",children:[n.jsx(Ge,{label:"Upload an SVG or PNG logo",hint:`${Ce}O`,placement:"bottom",children:n.jsxs("button",{type:"button",className:"docs-tool lab-upload","aria-label":"Upload a logo",onClick:i,children:[n.jsx(xe,{icon:H.Upload04Icon}),n.jsx("span",{children:"Upload logo"})]})}),n.jsxs("div",{className:"lab-menu-root",children:[n.jsxs("button",{type:"button",className:"docs-tool smg-tool","aria-haspopup":"menu","aria-expanded":d,onClick:()=>v(p=>!p),children:[n.jsx(xe,{icon:H.PlusSignIcon}),n.jsx("span",{children:"Shape"})]}),d&&n.jsx(Es,{thumbs:e,onPick:p=>{v(!1),l(p)},onText:()=>{v(!1),m()},onLogo:()=>{v(!1),i()},onClose:()=>v(!1)})]}),n.jsx(Ge,{label:"Add text",hint:"T",placement:"bottom",children:n.jsxs("button",{type:"button",className:"docs-tool smg-tool","aria-label":"Add text",onClick:m,children:[n.jsx(xe,{icon:H.TextIcon}),n.jsx("span",{children:"Texto"})]})})]}),n.jsxs("div",{className:"lab-toolbar-group",children:[n.jsxs("div",{className:"docs-track bs-actions",role:"group","aria-label":"Editor",children:[a&&n.jsx(Ge,{label:t?"Pausar":"Reproduzir",hint:"Espaço",placement:"bottom",children:n.jsx("button",{type:"button",className:"docs-segment docs-segment--icon","aria-label":t?"Pausar":"Reproduzir",onClick:r,children:n.jsx(xe,{icon:t?H.PauseIcon:H.PlayIcon})})}),n.jsx(Ge,{label:s?"Snapping on":"Snapping off",hint:`Hold ${Ce} to skip`,placement:"bottom",children:n.jsx("button",{type:"button",className:"docs-segment docs-segment--icon smg-snap","aria-label":"Encaixe","aria-pressed":s,onClick:o,children:n.jsx(xe,{icon:H.Magnet01Icon})})})]}),n.jsxs("div",{className:"lab-menu-root",children:[n.jsx(Ge,{label:"Shortcuts",placement:"bottom",children:n.jsx("button",{type:"button",className:"docs-tool docs-tool--icon","aria-label":"Keyboard shortcuts","aria-expanded":x,onClick:()=>h(p=>!p),children:n.jsx(xe,{icon:H.KeyboardIcon})})}),x&&n.jsx(wl,{onClose:()=>h(!1)})]}),n.jsx(Ge,{label:"SVG, PNG, favicon, video or code",hint:"E",placement:"bottom",children:n.jsxs("button",{type:"button",className:"bs-export",onClick:c,children:[n.jsx(xe,{icon:H.Download04Icon}),n.jsx("span",{children:"Exportar"})]})})]})]})}const _l=6,To=3,Eo=(e,a)=>{if(a)return Math.round(e/15)*15;const t=Math.round(e/45)*45;return Math.abs(e-t)<3?t:e};function zl({canvasRef:e,doc:a,selection:t,onSelect:s,onLayersChange:o,onDuplicate:r,onEditText:i,onMeasure:l,material:m,dropping:c,hint:d,snapping:v=!0,padding:x=40,onUpload:h,onPointerFeed:p}){const u=w.useRef(null),[P,T]=w.useState({width:0,height:0}),[z,M]=w.useState(null),[L,N]=w.useState(null),[_,U]=w.useState(null),O=mt(a.artboard);w.useLayoutEffect(()=>{const k=u.current;if(!k)return;const R=()=>T({width:k.clientWidth,height:k.clientHeight});R();const A=new ResizeObserver(R);return A.observe(k),()=>A.disconnect()},[]);const ae=Math.max(0,P.width-x*2),oe=Math.max(0,P.height-x*2-(d?28:0)),pe=Math.min(ae/O.w,oe/O.h),ge=Math.max(0,Math.floor(O.w*pe)),ue=Math.max(0,Math.floor(O.h*pe)),ee=Math.min(ge,ue)/2;w.useLayoutEffect(()=>{ge&&ue&&l({width:ge,height:ue})},[ge,ue,l]);const ne=w.useCallback((k,R)=>{const A=R.getBoundingClientRect();return[(k.clientX-A.left-ge/2)/ee,(k.clientY-A.top-ue/2)/ee]},[ge,ue,ee]),re=a.mark,le=re.layers.filter(k=>k.visible!==!1),se=le.filter(k=>t.includes(k.id)),he=se.length===1?se[0]:null,Te=se.length>1?ia(se.map(k=>Ta(k,re))):null,qe=(k,R,A)=>{var te;const q=k.currentTarget;(te=q.setPointerCapture)==null||te.call(q,k.pointerId);const G=ie=>R(ie),$=ie=>{q.removeEventListener("pointermove",G),q.removeEventListener("pointerup",$),q.removeEventListener("pointercancel",$),q.removeEventListener("lostpointercapture",$),A==null||A(ie)};q.addEventListener("pointermove",G),q.addEventListener("pointerup",$),q.addEventListener("pointercancel",$),q.addEventListener("lostpointercapture",$)},we=(k,R,{surface:A,clickId:q=null}={})=>{const G=ne(k,A),$=`move-${Date.now()}`;let te=R,ie=!1;const me=R.length===1,ye=me?vl(G,R[0],re):null,ze=R.map(ce=>Qe(ce,re).center),tt=R.map(ce=>({x:ce.x??0,y:ce.y??0})),Me=me?xl(R[0],re,ye):ia(R.map(ce=>Ta(ce,re))),K=le.filter(ce=>!R.some(Pe=>Pe.id===ce.id)),de=[0],Ne=[0];K.forEach(ce=>{const Pe=aa(ce,re);de.push(Pe.minX,Pe.cx,Pe.maxX),Ne.push(Pe.minY,Pe.cy,Pe.maxY)});let Se=!1;qe(k,ce=>{const Pe=ne(ce,A);let Re=Pe[0]-G[0],je=Pe[1]-G[1];if(!Se&&Math.hypot(Re,je)*ee<To)return;if(!Se&&ce.altKey&&!ie){ie=!0;const Ie=r(R.map(Ze=>Ze.id),$);Ie!=null&&Ie.length&&(te=Ie)}Se=!0,ce.shiftKey&&(Math.abs(Re)>Math.abs(je)?je=0:Re=0);let Ae=null,Xe=null;if(v&&!(ce.metaKey||ce.ctrlKey)){const Ie=_l/ee;(!ce.shiftKey||Re!==0)&&(Ae=zo([Me.minX+Re,Me.cx+Re,Me.maxX+Re],de,Ie),Ae&&(Re+=Ae.diff)),(!ce.shiftKey||je!==0)&&(Xe=zo([Me.minY+je,Me.cy+je,Me.maxY+je],Ne,Ie),Xe&&(je+=Xe.diff))}N(Ae||Xe?{x:(Ae==null?void 0:Ae.target)??null,y:(Xe==null?void 0:Xe.target)??null}:null);const wt={};te.forEach((Ie,Ze)=>{wt[Ie.id]=me?bl(R[Ze],re,tt[Ze],[Re,je],ye):ct(Ie,re,[ze[Ze][0]+Re,ze[Ze][1]+je])}),o(wt,$)},()=>{N(null),!Se&&q&&t.length>1&&s([q])})},We=(k,R,A)=>{k.preventDefault(),k.stopPropagation();const q=k.currentTarget.closest(".smg-artboard"),G=ne(k,q),$=Math.max(Math.hypot(G[0]-A[0],G[1]-A[1]),.001),te=R.map(me=>({center:Qe(me,re).center,size:me.size??1})),ie=`scale-${Date.now()}`;qe(k,me=>{const ye=ne(me,q),ze=Math.max(Math.hypot(ye[0]-A[0],ye[1]-A[1]),.001)/$,tt={};R.forEach((Me,K)=>{const de=te[K],Ne=Math.min(3,Math.max(.02,de.size*ze)),Se=Ne/de.size,ce={size:Math.round(Ne*1e3)/1e3};R.length>1&&Object.assign(ce,ct(Me,re,[A[0]+(de.center[0]-A[0])*Se,A[1]+(de.center[1]-A[1])*Se])),tt[Me.id]=ce}),o(tt,ie)})},Fe=(k,R,A)=>{k.preventDefault(),k.stopPropagation();const q=k.currentTarget.closest(".smg-artboard"),G=ne(k,q),$=Math.atan2(G[1]-A[1],G[0]-A[0]),te=R.map(me=>({center:Qe(me,re).center,rotation:me.rotation??0})),ie=`rotate-${Date.now()}`;qe(k,me=>{const ye=ne(me,q);let ze=(Math.atan2(ye[1]-A[1],ye[0]-A[0])-$)/be;R.length>1&&(ze=Eo(ze,me.shiftKey));const tt={};R.forEach((Me,K)=>{const de=te[K];let Ne=de.rotation+ze;R.length===1&&(Ne=Eo(Ne,me.shiftKey));const Se={rotation:Math.round(ks(Ne)*10)/10};if(R.length>1){const ce=Le([de.center[0]-A[0],de.center[1]-A[1]],ze*be);Object.assign(Se,ct(Me,re,[A[0]+ce[0],A[1]+ce[1]]))}tt[Me.id]=Se}),o(tt,ie)})},Ke=(k,R,A)=>{const q=ne(k,R),G=A?t:[];let $=!1;qe(k,te=>{const ie=ne(te,R);if(!$&&Math.hypot(ie[0]-q[0],ie[1]-q[1])*ee<To)return;$=!0;const me={minX:Math.min(q[0],ie[0]),maxX:Math.max(q[0],ie[0]),minY:Math.min(q[1],ie[1]),maxY:Math.max(q[1],ie[1])};U(me);const ye=le.filter(ze=>pl(Ta(ze,re),me)).map(ze=>ze.id);s([...new Set([...G,...ye])])},()=>{U(null),!$&&!A&&s([])})},De=(k,R)=>{if(!p)return;const A=R.currentTarget.getBoundingClientRect();p(k,R.clientX-A.left,R.clientY-A.top,R.buttons)},ve=k=>{if(De("down",k),k.button!==0)return;const R=k.currentTarget,A=ne(k,R),q=At(A,re),G=k.shiftKey||k.metaKey||k.ctrlKey;if(!q){Ke(k,R,G);return}if(G){const $=t.includes(q.id)?t.filter(te=>te!==q.id):[...t,q.id];s($);return}if(t.includes(q.id)){we(k,se,{surface:R,clickId:q.id});return}s([q.id]),we(k,[q],{surface:R})},Ee=k=>{if(k.button!==0)return;k.stopPropagation();const R=k.currentTarget.closest(".smg-artboard");if(k.shiftKey||k.metaKey||k.ctrlKey){const q=At(ne(k,R),re);q&&s(t.includes(q.id)?t.filter(G=>G!==q.id):[...t,q.id]);return}const A=At(ne(k,R),re);if(A&&!t.includes(A.id)){s([A.id]),we(k,[A],{surface:R});return}we(k,se,{surface:R,clickId:(A==null?void 0:A.id)??null})},nt=k=>{if(De("move",k),k.buttons)return;const R=At(ne(k,k.currentTarget),re);M(R&&!t.includes(R.id)?R.id:null)},I=k=>{const R=At(ne(k,k.currentTarget),re);(R==null?void 0:R.type)==="text"&&(i==null||i(R.id))},F=([k,R])=>[ge/2+k*ee,ue/2+R*ee],_e=k=>{const[R,A]=F(k.center);return`translate(${R} ${A}) rotate(${k.angle/be})`},g=(k,R)=>{const A=Qe(k,re),[q,G]=gt(k);return n.jsx("g",{transform:_e(A),children:n.jsx("rect",{className:R,x:-q*A.scale*ee,y:-G*A.scale*ee,width:q*A.scale*ee*2,height:G*A.scale*ee*2,rx:"6"})},`${R}-${k.id}`)},S=z?le.find(k=>k.id===z):null,[C,D]=zs(a.artboard),W=a.artboard.background.kind==="none";let J=null;if(he){const k=Qe(he,re),[R,A]=gt(he),q=R*k.scale*ee,G=A*k.scale*ee;J=n.jsxs("g",{transform:_e(k),children:[n.jsx("rect",{className:"smg-select",x:-q,y:-G,width:q*2,height:G*2,rx:"6",onPointerDown:Ee}),n.jsx("line",{className:"smg-select-line",x1:"0",y1:-G,x2:"0",y2:-G-22}),n.jsx("circle",{className:"smg-handle smg-handle--rotate",cx:"0",cy:-G-26,r:"6",onPointerDown:$=>Fe($,[he],k.center)}),[[1,1],[-1,1],[1,-1],[-1,-1]].map(([$,te])=>n.jsx("rect",{className:"smg-handle",x:$*q-5,y:te*G-5,width:"10",height:"10",rx:"3",onPointerDown:ie=>We(ie,[he],k.center)},`${$}${te}`))]})}else if(Te){const[k,R]=F([Te.minX,Te.minY]),[A,q]=F([Te.maxX,Te.maxY]),G=[Te.cx,Te.cy];J=n.jsxs("g",{children:[se.map($=>g($,"smg-member")),n.jsx("rect",{className:"smg-select smg-select--group",x:k,y:R,width:A-k,height:q-R,rx:"6",onPointerDown:Ee}),n.jsx("line",{className:"smg-select-line",x1:(k+A)/2,y1:R,x2:(k+A)/2,y2:R-22}),n.jsx("circle",{className:"smg-handle smg-handle--rotate",cx:(k+A)/2,cy:R-26,r:"6",onPointerDown:$=>Fe($,se,G)}),[[k,R],[A,R],[k,q],[A,q]].map(([$,te])=>n.jsx("rect",{className:"smg-handle",x:$-5,y:te-5,width:"10",height:"10",rx:"3",onPointerDown:ie=>We(ie,se,G)},`${$}-${te}`))]})}return n.jsxs("div",{className:"lab-stage smg-stage",ref:u,"data-dragging":c?"":void 0,style:{"--smg-aspect":O.w/O.h},children:[ge>0&&n.jsxs("div",{className:"smg-artboard","data-transparent":W?"":void 0,style:{width:ge,height:ue},onPointerDown:ve,onPointerMove:nt,onPointerLeave:k=>{M(null),De("leave",k)},onPointerUp:k=>De("up",k),onDoubleClick:I,children:[n.jsx("canvas",{ref:e,className:"smg-canvas"}),m,n.jsxs("svg",{className:"smg-overlay",width:ge,height:ue,"aria-hidden":"true",children:[S&&g(S,"smg-hover"),(L==null?void 0:L.x)!==null&&(L==null?void 0:L.x)!==void 0&&n.jsx("line",{className:"smg-guide",x1:F([L.x,0])[0],x2:F([L.x,0])[0],y1:F([0,-D])[1],y2:F([0,D])[1]}),(L==null?void 0:L.y)!==null&&(L==null?void 0:L.y)!==void 0&&n.jsx("line",{className:"smg-guide",x1:F([-C,0])[0],x2:F([C,0])[0],y1:F([0,L.y])[1],y2:F([0,L.y])[1]}),J,_&&n.jsx("rect",{className:"smg-marquee",x:F([_.minX,0])[0],y:F([0,_.minY])[1],width:(_.maxX-_.minX)*ee,height:(_.maxY-_.minY)*ee})]})]}),d&&n.jsx("button",{type:"button",className:"lab-hint",onClick:h,children:n.jsx("span",{children:"Drop or paste an SVG or PNG logo to style it"})}),c&&n.jsx("div",{className:"lab-drop",children:n.jsx("span",{children:"Drop to add your logo"})})]})}const oa=44,So=[{value:"solid",label:"Sólido"},{value:"linear",label:"Linear"},{value:"radial",label:"Radial"},{value:"conic",label:"Conic"}],Tl=[{value:"none",label:"None"},{value:"color",label:"Cor"},{value:"linear",label:"Gradiente"}],El=[{value:"none",label:"None"},{value:"lines",label:"Lines"},{value:"rings",label:"Rings"},{value:"rays",label:"Rays"},{value:"grid",label:"Grid"},{value:"dots",label:"Dots"},{value:"halftone",label:"Halftone"}],Sl=[{value:"radial",label:"Around center"},{value:"row",label:"Row"},{value:"column",label:"Column"}],Pl=[{value:"outside",label:"Outside"},{value:"center",label:"Centered"}],Rl=e=>{const[a,t]=w.useState({id:null,presets:null});return w.useEffect(()=>{if(!e)return;let s=!0;return Qo(e).then(o=>{s&&t({id:e.id,presets:o})}),()=>{s=!1}},[e]),e&&a.id===e.id?a.presets:null};function Al({material:e,onSelect:a}){const t=Rl(e.entry),s=w.useMemo(()=>{var r;if(!((r=t==null?void 0:t.options)!=null&&r.length))return[];const o=da(e.entry);return t.options.map(i=>({option:i,colors:Ks({...o,...t.resolve(i.value,{light:!1,defaults:o,props:o})},e.entry.props)}))},[t,e.entry]);return s.length?n.jsxs("section",{className:"customize-frame lab-section",children:[n.jsx("div",{className:"customize-heading",children:n.jsx("h2",{children:"Composições"})}),n.jsx("div",{className:"preview-options bs-presets",children:s.map(({option:o,colors:r})=>n.jsx(Zs,{option:o,colors:r,active:e.look===o.value,onSelect:a},o.value))})]}):null}function Je({title:e,actions:a,children:t,className:s=""}){return n.jsxs("section",{className:`customize-frame lab-section ${s}`,children:[n.jsxs("div",{className:"customize-heading",children:[n.jsx("h2",{children:e}),a&&n.jsx("div",{className:"customize-heading-actions",children:a})]}),n.jsx("div",{className:"preview-options lab-options",children:t})]})}function Qt({label:e,hint:a,icon:t,onClick:s,disabled:o}){return n.jsx(Ge,{label:e,hint:a,children:n.jsx("button",{type:"button",className:"customize-heading-action lab-heading-icon","aria-label":e,onClick:s,disabled:o,children:n.jsx(xe,{icon:t,size:15})})})}const Cl=[{value:"left",label:"Align left",hint:"⌥A",icon:H.AlignLeftIcon},{value:"hcenter",label:"Align centers",hint:"⌥H",icon:H.AlignHorizontalCenterIcon},{value:"right",label:"Align right",hint:"⌥D",icon:H.AlignRightIcon},{value:"top",label:"Align top",hint:"⌥W",icon:H.AlignTopIcon},{value:"vcenter",label:"Align middles",hint:"⌥V",icon:H.AlignVerticalCenterIcon},{value:"bottom",label:"Align bottom",hint:"⌥S",icon:H.AlignBottomIcon}];function Ct({label:e,hint:a,icon:t,onClick:s,disabled:o}){return n.jsx(Ge,{label:e,hint:a,children:n.jsx("button",{type:"button",className:"docs-segment docs-segment--icon smg-arrange-button","aria-label":e,onClick:s,disabled:o,children:n.jsx(xe,{icon:t,size:15})})})}function Po({count:e,actions:a}){const t=e>1;return n.jsxs("div",{className:"smg-arrange smg-full",children:[n.jsx("div",{className:"docs-track smg-arrange-group",role:"group","aria-label":t?"Align layers":"Align to artboard",children:Cl.map(s=>n.jsx(Ct,{label:t?s.label:`${s.label} to artboard`,hint:s.hint,icon:s.icon,onClick:()=>a.alignSelection(s.value)},s.value))}),n.jsxs("div",{className:"docs-track smg-arrange-group",role:"group","aria-label":"Distribute and flip",children:[t&&n.jsxs(n.Fragment,{children:[n.jsx(Ct,{label:"Distribute horizontally",icon:H.DistributeHorizontalCenterIcon,onClick:()=>a.distributeSelection("x"),disabled:e<3}),n.jsx(Ct,{label:"Distribute vertically",icon:H.DistributeVerticalCenterIcon,onClick:()=>a.distributeSelection("y"),disabled:e<3})]}),n.jsx(Ct,{label:"Flip horizontal",hint:"⇧H",icon:H.FlipHorizontalIcon,onClick:()=>a.flipSelection("x")}),n.jsx(Ct,{label:"Flip vertical",hint:"⇧V",icon:H.FlipVerticalIcon,onClick:()=>a.flipSelection("y")})]})]})}function Ml({layer:e,index:a,count:t,selected:s,drag:o,thumb:r,onSelect:i,onToggle:l,onDragStart:m}){var v,x;let c=0;if(o)if(o.index===a)c=o.dy;else{const h=Math.max(0,Math.min(t-1,Math.round(o.index+o.dy/oa)));o.index<a&&h>=a&&(c=-oa),o.index>a&&h<=a&&(c=oa)}const d=is(e);return n.jsxs("div",{className:"lab-layer smg-layer",role:"option","aria-selected":s,"data-dragging":(o==null?void 0:o.index)===a?"":void 0,"data-hidden":e.visible===!1?"":void 0,style:{transform:c?`translateY(${c}px)`:void 0},onClick:h=>i(e.id,{toggle:h.shiftKey||h.metaKey||h.ctrlKey}),children:[n.jsx("button",{type:"button",className:"lab-layer-grip","aria-label":`Reorder ${d}`,onPointerDown:h=>m(h,a),onClick:h=>h.stopPropagation(),children:n.jsx(xe,{icon:H.DragDropVerticalIcon,size:14})}),n.jsx("span",{className:"smg-layer-icon","aria-hidden":"true",children:e.type==="image"&&((v=e.image)!=null&&v.src)?n.jsx("img",{src:e.image.src,alt:"",draggable:!1,"data-logo":""}):r?n.jsx("img",{src:r,alt:"",draggable:!1}):n.jsx("span",{children:e.type==="text"?"T":""})}),n.jsx("span",{className:"lab-layer-name",children:d}),a>0&&e.op!=="add"&&n.jsx("span",{className:"lab-layer-mix",children:(x=Da.find(h=>h.value===e.op))==null?void 0:x.label}),n.jsx(Ge,{label:e.visible===!1?"Show":"Hide",children:n.jsx("button",{type:"button",className:"lab-icon-button lab-layer-eye","aria-label":e.visible===!1?`Show ${d}`:`Hide ${d}`,onClick:h=>{h.stopPropagation(),l(e.id,e.visible===!1)},children:n.jsx(xe,{icon:e.visible===!1?H.ViewOffSlashIcon:H.ViewIcon,size:15})})})]})}function Ll({layer:e,index:a,onLayer:t,onParam:s,onText:o,onReplaceImage:r,textRef:i}){var v,x,h,p;const l=fa[e.type],m=e.pattern||"none",c=Lt.find(u=>{var P;return u.value===((P=e.text)==null?void 0:P.font)})||Lt[0],d=a>0;return n.jsxs(n.Fragment,{children:[e.type==="text"&&n.jsxs(n.Fragment,{children:[n.jsx("div",{className:"smg-text-field",ref:i,children:n.jsx(Vs,{title:"Texto",value:((v=e.text)==null?void 0:v.value)??"",maxLength:24,onChange:u=>o({value:u})})}),n.jsx(lt,{title:"Fonte",options:Lt.map(u=>({value:u.value,label:u.label})),value:(x=e.text)==null?void 0:x.font,onChange:u=>{var z;const P=Lt.find(M=>M.value===u),T=P!=null&&P.weights.includes((z=e.text)==null?void 0:z.weight)?e.text.weight:P==null?void 0:P.weights.at(-1);o({font:u,weight:T})}}),n.jsx(lt,{title:"Weight",options:c.weights.map(u=>({value:u,label:String(u)})),value:(h=e.text)==null?void 0:h.weight,onChange:u=>o({weight:Number(u)})}),n.jsx(Q,{title:"Spacing",min:-.12,max:.4,step:.01,value:((p=e.text)==null?void 0:p.tracking)??0,onChange:u=>o({tracking:u},"tracking")})]}),e.type==="image"&&n.jsx("button",{type:"button",className:"docs-tool smg-wide",onClick:r,children:"Replace logo"}),l==null?void 0:l.params.map(u=>{var P;return n.jsx(Q,{title:u.label,min:u.min,max:u.max,step:u.step,value:((P=e.params)==null?void 0:P[u.key])??u.default,onChange:T=>s(u.key,T)},u.key)}),d&&n.jsx("div",{className:"smg-full",children:n.jsx(at,{label:"Combine",value:e.op,options:Da,onChange:u=>t({op:u}),className:"smg-ops"})}),d&&["merge","cut","keep"].includes(e.op)&&n.jsx(Q,{title:"Smoothness",min:0,max:.6,step:.005,value:ns(e),onChange:u=>t({smooth:u},"smooth")}),n.jsx(Q,{title:"Tamanho",min:.05,max:1.6,step:.005,value:e.size,onChange:u=>t({size:u},"size")}),n.jsx(Q,{title:"Rotação",min:-180,max:180,step:1,valueUnit:"°",value:e.rotation,onChange:u=>t({rotation:u},"rotation")}),n.jsx(Q,{title:"Position X",min:-1.2,max:1.2,step:.005,value:e.x,onChange:u=>t({x:u},"x")}),n.jsx(Q,{title:"Position Y",min:-1.2,max:1.2,step:.005,value:e.y,onChange:u=>t({y:u},"y")}),n.jsx(lt,{title:"Pattern",options:El,value:e.pattern||"none",onChange:u=>t({pattern:u})}),m!=="none"&&n.jsxs(n.Fragment,{children:[n.jsx(Q,{title:m==="rays"?"Rays":"Densidade",min:2,max:m==="rays"?48:40,step:1,value:e.density??8,onChange:u=>t({density:u},"density")}),n.jsx(Q,{title:"Weight",min:.05,max:.95,step:.01,value:e.weight??.5,onChange:u=>t({weight:u},"weight")}),m!=="rings"&&m!=="halftone"&&n.jsx(Q,{title:"Pattern angle",min:0,max:180,step:1,valueUnit:"°",value:e.patternAngle??0,onChange:u=>t({patternAngle:u},"pattern-angle")}),(m==="lines"||m==="grid")&&n.jsx(Q,{title:"Bulge",min:0,max:1,step:.01,value:e.bulge??0,onChange:u=>t({bulge:u},"bulge")}),n.jsx(Q,{title:"Taper",min:0,max:1,step:.01,value:e.taper??0,onChange:u=>t({taper:u},"taper")}),n.jsx(et,{title:"Cut out",isChecked:!!e.invert,onChange:u=>t({invert:u})})]}),n.jsx(Q,{title:"Repeat",min:1,max:16,step:1,value:e.repeat,onChange:u=>t({repeat:u},"repeat")}),e.repeat>1&&n.jsx(lt,{title:"Layout",options:Sl,value:e.layout||"radial",onChange:u=>t({layout:u})}),e.repeat>1&&(e.layout||"radial")==="radial"&&n.jsx(Q,{title:"Spin",min:-180,max:180,step:1,valueUnit:"°",value:e.spin,onChange:u=>t({spin:u},"spin")}),e.repeat>1&&(e.layout||"radial")!=="radial"&&n.jsx(Q,{title:"Gap",min:.5,max:6,step:.05,value:e.gap??2.3,onChange:u=>t({gap:u},"gap")}),n.jsx(Q,{title:"Hollow",min:0,max:.3,step:.002,value:e.outline,onChange:u=>t({outline:u},"outline")}),n.jsx(Q,{title:"Round",min:0,max:.3,step:.002,value:e.round,onChange:u=>t({round:u},"round")}),n.jsx(et,{title:"Mirror",isChecked:!!e.mirror,onChange:u=>t({mirror:u})})]})}function ql({fill:e,onFill:a,hasLogo:t}){const s=!["solid","none","logo"].includes(e.kind),o=t?[...So,{value:"logo",label:"Logo"}]:So;return n.jsxs(n.Fragment,{children:[n.jsx("div",{className:"smg-full",children:n.jsx(at,{label:"Fill type",value:e.kind,options:o,onChange:r=>a({kind:r}),className:"smg-kinds"})}),n.jsx(Ye,{title:s?"Start":e.kind==="logo"?"Other shapes":"Cor",color:e.color1,alpha:!0,onChange:r=>a({color1:r},"color1")}),s&&n.jsx(Ye,{title:e.stops===3?"Middle":"End",color:e.color2,alpha:!0,onChange:r=>a({color2:r},"color2")}),s&&e.stops===3&&n.jsx(Ye,{title:"End",color:e.color3,alpha:!0,onChange:r=>a({color3:r},"color3")}),s&&n.jsx(et,{title:"Three colors",isChecked:e.stops===3,onChange:r=>a({stops:r?3:2})}),(e.kind==="linear"||e.kind==="conic")&&n.jsx(Q,{title:"Ângulo",min:0,max:360,step:1,valueUnit:"°",value:e.angle??0,onChange:r=>a({angle:r},"angle")}),(e.kind==="linear"||e.kind==="radial")&&n.jsx(Q,{title:"Spread",min:.3,max:2,step:.01,value:e.extent??1,onChange:r=>a({extent:r},"extent")})]})}const jl=["Bevel","Puffiness","Roundness","Relief","Altura"],Il=e=>{if(e.kind==="metal")return"Liquid metal builds its own 3D edge. Edge bend above sets how far it wraps.";if(e.kind!=="procedural"||e.def.kind==="fill")return null;const a=e.def.params.find(t=>jl.includes(t.label));return a?`${e.def.name} builds its own 3D surface. ${a.label} above sets its depth.`:`${e.def.name} is shaded by its own settings above, so it has no bevel.`};function Fl({effects:e,accent:a,onEffect:t,bevel:s=!0,surfaceNote:o=null}){const{outline:r,shadow:i,glow:l,gloss:m}=e;return n.jsxs(n.Fragment,{children:[n.jsx(et,{title:"Outline",isChecked:r.on,onChange:c=>t("outline",{on:c})}),r.on&&n.jsxs(n.Fragment,{children:[n.jsx(Q,{title:"Outline width",min:.005,max:.2,step:.001,value:r.width,onChange:c=>t("outline",{width:c},"outline-width")}),n.jsx(lt,{title:"Outline position",options:Pl,value:r.mode,onChange:c=>t("outline",{mode:c})}),n.jsx(Ye,{title:"Outline color",color:r.color,alpha:!0,onChange:c=>t("outline",{color:c},"outline-color")})]}),n.jsx(et,{title:"Sombra",isChecked:i.on,onChange:c=>t("shadow",{on:c})}),i.on&&n.jsxs(n.Fragment,{children:[n.jsx(Q,{title:"Shadow opacity",min:0,max:1,step:.01,value:i.opacity,onChange:c=>t("shadow",{opacity:c},"shadow-opacity")}),n.jsx(Q,{title:"Shadow blur",min:0,max:.4,step:.005,value:i.blur,onChange:c=>t("shadow",{blur:c},"shadow-blur")}),n.jsx(Q,{title:"Shadow distance",min:-.3,max:.3,step:.005,value:i.y,onChange:c=>t("shadow",{y:c},"shadow-y")}),n.jsx(Ye,{title:"Shadow color",color:i.color,alpha:!0,onChange:c=>t("shadow",{color:c},"shadow-color")})]}),n.jsx(et,{title:"Glow",isChecked:l.on,onChange:c=>t("glow",c&&l.color===Ft.glow.color&&a?{on:c,color:a}:{on:c})}),l.on&&n.jsxs(n.Fragment,{children:[n.jsx(Q,{title:"Glow strength",min:0,max:1.5,step:.01,value:l.intensity,onChange:c=>t("glow",{intensity:c},"glow-intensity")}),n.jsx(Q,{title:"Glow size",min:.01,max:.5,step:.005,value:l.radius,onChange:c=>t("glow",{radius:c},"glow-radius")}),n.jsx(Ye,{title:"Glow color",color:l.color,alpha:!0,onChange:c=>t("glow",{color:c},"glow-color")})]}),s&&n.jsx(et,{title:"Bevel",isChecked:m.on,onChange:c=>t("gloss",{on:c})}),!s&&o&&n.jsx("p",{className:"smg-note smg-full",children:o}),s&&m.on&&n.jsxs(n.Fragment,{children:[n.jsx(Q,{title:"Bevel size",min:.02,max:.5,step:.005,value:m.bevel??.4,onChange:c=>t("gloss",{bevel:c},"gloss-bevel")}),n.jsx(Q,{title:"Bend",min:0,max:3,step:.05,value:m.bend??2.5,onChange:c=>t("gloss",{bend:c},"gloss-bend")}),n.jsx(Q,{title:"Claro",min:0,max:1,step:.01,value:m.strength??.25,onChange:c=>t("gloss",{strength:c},"gloss-strength")}),n.jsx(Q,{title:"Light angle",min:0,max:360,step:1,valueUnit:"°",value:m.angle??225,onChange:c=>t("gloss",{angle:c},"gloss-angle")})]})]})}function Dl({doc:e,selection:a,thumbs:t,history:s,actions:o,focusText:r}){var N;const[i,l]=w.useState(null),[m,c]=w.useState(!1),d=w.useRef(null),v=w.useRef(null),x=Xs(d,".preview-options > *"),h=e.mark.layers,p=h.filter(_=>a.includes(_.id)),u=p.length===1?h.indexOf(p[0]):-1,P=u>=0?h[u]:null,T=Oe(e),z=p.length>1&&p.every(_=>_.op===p[0].op)?p[0].op:null;w.useEffect(()=>{if(!r)return;const _=requestAnimationFrame(()=>{var O,ae;const U=(O=v.current)==null?void 0:O.querySelector("input");U&&(U.focus(),U.select(),(ae=U.closest(".lab-section"))==null||ae.scrollIntoView({block:"nearest",behavior:"smooth"}))});return()=>cancelAnimationFrame(_)},[r]);const M=(_,U)=>{if(_.button!==0)return;_.preventDefault(),_.stopPropagation();const O=_.clientY,ae=h[U].id;l({index:U,dy:0});const oe=ge=>l({index:U,dy:ge.clientY-O}),pe=ge=>{window.removeEventListener("pointermove",oe),window.removeEventListener("pointerup",pe),window.removeEventListener("pointercancel",pe);const ue=Math.max(0,Math.min(h.length-1,Math.round(U+(ge.clientY-O)/oa)));l(null),ue!==U&&o.moveLayer(ae,ue)};window.addEventListener("pointermove",oe),window.addEventListener("pointerup",pe),window.addEventListener("pointercancel",pe)},L=e.artboard.background;return n.jsx("aside",{className:"lab-panel smg-panel","aria-label":"Mark settings",children:n.jsx("div",{className:"lab-scroll-shell","data-top":x.top?"":void 0,"data-bottom":x.bottom?"":void 0,children:n.jsxs("div",{className:"lab-scroll lab-panel-scroll",ref:d,children:[n.jsxs(Je,{title:"Camadas",actions:n.jsxs(n.Fragment,{children:[n.jsx(Qt,{label:"Desfazer",hint:"⌘Z",icon:H.Undo02Icon,onClick:s.undo,disabled:!s.canUndo}),n.jsx(Qt,{label:"Refazer",hint:"⇧⌘Z",icon:H.Redo02Icon,onClick:s.redo,disabled:!s.canRedo}),n.jsx(Qt,{label:"Duplicar",hint:"⌘D",icon:H.Copy01Icon,onClick:o.duplicateSelection,disabled:!p.length}),n.jsx(Qt,{label:"Excluir",hint:"⌫",icon:H.Delete02Icon,onClick:o.removeSelection,disabled:!p.length||p.length>=h.length})]}),className:"smg-layers-section",children:[n.jsx("div",{className:"lab-layers smg-layers",role:"listbox","aria-label":"Shape layers",children:[...h].reverse().map(_=>{const U=h.indexOf(_);return n.jsx(Ml,{layer:_,index:U,count:h.length,selected:a.includes(_.id),drag:i,thumb:t[`shape:${_.type}`],onSelect:o.selectLayer,onToggle:o.toggleLayer,onDragStart:M},_.id)})}),n.jsxs("div",{className:"smg-add-row smg-full",children:[n.jsxs("button",{type:"button",className:"docs-tool smg-add",onClick:()=>c(_=>!_),"aria-expanded":m,children:[n.jsx(xe,{icon:H.PlusSignIcon,size:15}),n.jsx("span",{children:"Add shape"})]}),m&&n.jsx(Es,{thumbs:t,onPick:_=>{c(!1),o.addShape(_)},onText:()=>{c(!1),o.addText()},onLogo:()=>{c(!1),o.upload()},onClose:()=>c(!1)})]})]}),p.length>1&&n.jsxs(Je,{title:`${p.length} layers`,children:[n.jsx(Po,{count:p.length,actions:o}),p.some(_=>h.indexOf(_)>0)&&n.jsx("div",{className:"smg-full",children:n.jsx(at,{label:"Combine",value:z,options:Da,onChange:_=>o.setSelectionOp(_),className:"smg-ops"})})]}),P&&n.jsxs(Je,{title:is(P),children:[n.jsx(Po,{count:1,actions:o}),n.jsx(Ll,{layer:P,index:u,textRef:v,onLayer:(_,U)=>o.updateLayer(P.id,_,U),onParam:(_,U)=>o.updateLayer(P.id,O=>({params:{...O.params,[_]:U}}),`param-${_}`),onText:(_,U)=>o.updateLayer(P.id,O=>({text:{...O.text,..._}}),U?`text-${U}`:void 0),onReplaceImage:o.upload})]}),T.kind==="flat"&&n.jsx(Je,{title:"Fill",children:n.jsx(ql,{fill:e.fill,onFill:o.setFill,hasLogo:h.some(_=>_.type==="image")})}),T.kind==="metal"&&n.jsx(Je,{title:"Liquid metal",children:n.jsx(ba,{definitions:bs,props:T.props,onChange:(_,U)=>o.setMaterialProp(_,U)})}),T.kind==="procedural"&&n.jsx(Je,{title:T.def.name,children:n.jsx(ba,{definitions:T.def.params,props:{...Object.fromEntries(T.def.params.map(_=>[_.name,_.default])),...T.props},onChange:(_,U)=>o.setMaterialProp(_,U)})}),T.kind==="background"&&n.jsx(Al,{material:T,onSelect:o.applyLook}),T.kind==="background"&&n.jsxs(Je,{title:T.entry.label,children:[n.jsx(Ye,{title:"Base color",color:e.material.base??"#0c0b10",alpha:!0,onChange:_=>o.setMaterialBase(_)}),n.jsx(ba,{definitions:T.entry.props,props:pa(T),onChange:(_,U)=>o.setMaterialProp(_,U)})]}),n.jsx(Je,{title:"Efeitos",children:n.jsx(Fl,{effects:e.effects,accent:T.kind==="flat"&&e.fill.kind!=="logo"?e.fill.color1:null,onEffect:o.setEffect,bevel:T.kind!=="metal"&&!(T.kind==="procedural"&&T.def.kind!=="fill"),surfaceNote:Il(T)})}),n.jsxs(Je,{title:"Artboard",children:[n.jsx(Q,{title:"Mark size",min:.2,max:1.6,step:.005,value:e.mark.scale,onChange:_=>o.setMark({scale:_},"mark-scale")}),n.jsx(Q,{title:"Mark rotation",min:-180,max:180,step:1,valueUnit:"°",value:e.mark.rotation,onChange:_=>o.setMark({rotation:_},"mark-rotation")}),n.jsx(lt,{title:"Shape",options:Aa.map(_=>({value:_.value,label:_.label})),value:e.artboard.ratio,onChange:_=>o.setArtboard({ratio:_})}),n.jsx("div",{className:"smg-full",children:n.jsx(at,{label:"Fundo",value:L.kind,options:Tl,onChange:_=>o.setBackground({kind:_}),className:"smg-kinds"})}),L.kind!=="none"&&n.jsx(Ye,{title:L.kind==="linear"?"Topo":"Background color",color:L.color1,alpha:!0,onChange:_=>o.setBackground({color1:_},"bg-color1")}),L.kind==="linear"&&n.jsx(Ye,{title:"Base",color:L.color2,alpha:!0,onChange:_=>o.setBackground({color2:_},"bg-color2")})]}),n.jsxs(Je,{title:"Morph",children:[n.jsx(et,{title:"Morph",isChecked:e.morph.on,onChange:_=>o.setMorph({on:_})}),e.morph.on&&T.kind==="metal"&&n.jsx("p",{className:"smg-note smg-full",children:"Liquid metal pauses while morph plays. It returns when morph is off."}),e.morph.on&&n.jsxs(n.Fragment,{children:[n.jsx(lt,{title:"Into",options:Gt.map(_=>({value:_.id,label:_.name})),value:((N=e.morph.target)==null?void 0:N.preset)||"",onChange:_=>o.setMorphTarget(_)}),n.jsx(Q,{title:"Morph time",min:.3,max:4,step:.05,valueUnit:"s",value:e.morph.duration,onChange:_=>o.setMorph({duration:_},"morph-duration")}),n.jsx(Q,{title:"Hold",min:0,max:3,step:.05,valueUnit:"s",value:e.morph.hold,onChange:_=>o.setMorph({hold:_},"morph-hold")})]})]})]})})})}const Ps=(e,...a)=>{const t=e.trim().toLowerCase().split(/\s+/).filter(Boolean);if(!t.length)return!0;const s=a.join(" ").toLowerCase();return t.every(o=>s.includes(o))},Rs=({query:e,kind:a})=>n.jsxs("p",{className:"lab-empty lab-empty--search",children:["No ",a," match “",e.trim(),"”."]});function As({name:e,active:a,onClick:t,children:s}){return n.jsxs("button",{type:"button",className:"lab-tile smg-tile","aria-pressed":a,onClick:t,title:e,children:[n.jsx("span",{className:"lab-tile-media smg-tile-media",children:s}),n.jsx("span",{className:"lab-tile-name",children:e})]})}function Nl({thumbs:e,activeId:a,onApply:t,query:s=""}){const o=dr.map(r=>{const i=Gt.filter(l=>l.group===r.id&&Ps(s,l.name,r.label,l.tags||""));return i.length?n.jsxs("section",{className:"lab-group",children:[n.jsx("h3",{className:"lab-group-title",children:r.label}),n.jsx("div",{className:"lab-grid",children:i.map(l=>n.jsx(As,{name:l.name,active:a===l.id,onClick:()=>t(l),children:e[`mark:${l.id}`]?n.jsx("img",{src:e[`mark:${l.id}`],alt:"",draggable:!1}):n.jsx("span",{className:"lab-tile-wait"})},l.id))})]},r.id):null});return o.some(Boolean)?o:n.jsx(Rs,{query:s,kind:"marks"})}function Bl({thumbs:e,activeId:a,light:t,onApply:s,query:o=""}){const r=e.silhouette,i=r?{WebkitMaskImage:`url(${r})`,maskImage:`url(${r})`}:null,l=Yr.map(m=>{const c=Ba.filter(d=>d.group===m.id&&Ps(o,d.name,m.label));return c.length?n.jsxs("section",{className:"lab-group",children:[n.jsx("h3",{className:"lab-group-title",children:m.label}),n.jsx("div",{className:"lab-grid",children:c.map(d=>{let v;return d.kind==="procedural"?v=n.jsx("img",{src:`/assets/shape-magic/fx-${d.def.id}.webp`,alt:"",loading:"lazy",draggable:!1}):d.kind==="metal"?v=n.jsx("img",{className:"smg-ball",src:`/assets/shape-magic/metal-${d.id.slice(6)}.webp`,alt:"",loading:"lazy",draggable:!1}):d.kind==="flat"?v=e[d.id]?n.jsx("img",{src:e[d.id],alt:"",draggable:!1}):n.jsx("span",{className:"lab-tile-wait"}):i?v=n.jsx("span",{className:"smg-swatch",style:{...i,backgroundImage:`url(/assets/studio/${d.background}-${t?"light":"dark"}.webp)`}}):v=n.jsx("span",{className:"lab-tile-wait"}),n.jsx(As,{name:d.name,active:a===d.id,onClick:()=>s(d),children:v},d.id)})})]},m.id):null});return l.some(Boolean)?l:n.jsx(Rs,{query:o,kind:"materials"})}function Ul({material:e,code:a,svg:t,name:s}){var x;const o=e.kind==="metal"?"MetallicPaint":e.kind==="background"?e.entry.name||e.entry.label.replace(/[^a-zA-Z0-9]/g,""):null,[r,i]=w.useState(null),[l,m]=w.useState("");if(w.useEffect(()=>{let h=!0;if(m(""),i(null),!!o)return Js({name:o}).then(p=>{if(h){if(!p)throw Error("O código do material não foi encontrado.");i(p)}}).catch(p=>{h&&m(p.message)}),()=>{h=!1}},[o]),l)return n.jsx("p",{role:"alert",children:l});if(o&&!r)return n.jsx("p",{children:"Preparando os arquivos do material…"});if(o&&!(t!=null&&t.svg)&&!(t!=null&&t.mask))return n.jsx("p",{children:"Preparando a forma para exportação…"});const c=t!=null&&t.mask||t!=null&&t.svg?{[s+".svg"]:t.mask||t.svg}:{},d=((x=/export default function ([A-Za-z_$][\w$]*)/.exec(a.code))==null?void 0:x[1])||s,v=o?{...r,usage:a.code,...c}:{code:a.code,...c};return n.jsx(Qs,{codeObject:v,componentName:o||d})}const $l=(()=>{const e=new Uint32Array(256);for(let a=0;a<256;a++){let t=a;for(let s=0;s<8;s++)t=t&1?3988292384^t>>>1:t>>>1;e[a]=t>>>0}return e})(),Gl=e=>{let a=4294967295;for(let t=0;t<e.length;t++)a=$l[(a^e[t])&255]^a>>>8;return(a^4294967295)>>>0},Ol=async e=>e instanceof Uint8Array?e:typeof e=="string"?new TextEncoder().encode(e):new Uint8Array(await e.arrayBuffer()),Xl=(e=new Date)=>({time:e.getHours()<<11|e.getMinutes()<<5|Math.floor(e.getSeconds()/2),day:e.getFullYear()-1980<<9|e.getMonth()+1<<5|e.getDate()});async function Hl(e){const a=new TextEncoder,t=Xl(),s=[],o=[];let r=0;for(const m of e){const c=a.encode(m.name),d=await Ol(m.data),v=Gl(d),x=new DataView(new ArrayBuffer(30));x.setUint32(0,67324752,!0),x.setUint16(4,20,!0),x.setUint16(6,2048,!0),x.setUint16(8,0,!0),x.setUint16(10,t.time,!0),x.setUint16(12,t.day,!0),x.setUint32(14,v,!0),x.setUint32(18,d.length,!0),x.setUint32(22,d.length,!0),x.setUint16(26,c.length,!0),s.push(new Uint8Array(x.buffer),c,d);const h=new DataView(new ArrayBuffer(46));h.setUint32(0,33639248,!0),h.setUint16(4,20,!0),h.setUint16(6,20,!0),h.setUint16(8,2048,!0),h.setUint16(12,t.time,!0),h.setUint16(14,t.day,!0),h.setUint32(16,v,!0),h.setUint32(20,d.length,!0),h.setUint32(24,d.length,!0),h.setUint16(28,c.length,!0),h.setUint32(42,r,!0),o.push(new Uint8Array(h.buffer),c),r+=30+c.length+d.length}const i=o.reduce((m,c)=>m+c.length,0),l=new DataView(new ArrayBuffer(22));return l.setUint32(0,101010256,!0),l.setUint16(8,e.length,!0),l.setUint16(10,e.length,!0),l.setUint32(12,i,!0),l.setUint32(16,r,!0),new Blob([...s,...o,new Uint8Array(l.buffer)],{type:"application/zip"})}async function Vl(e){const a=await Promise.all(e.map(async({size:o,blob:r})=>({size:o,bytes:new Uint8Array(await r.arrayBuffer())}))),t=new DataView(new ArrayBuffer(6+a.length*16));t.setUint16(2,1,!0),t.setUint16(4,a.length,!0);let s=6+a.length*16;return a.forEach((o,r)=>{const i=6+r*16;t.setUint8(i,o.size>=256?0:o.size),t.setUint8(i+1,o.size>=256?0:o.size),t.setUint16(i+4,1,!0),t.setUint16(i+6,32,!0),t.setUint32(i+8,o.bytes.length,!0),t.setUint32(i+12,s,!0),s+=o.bytes.length}),new Blob([new Uint8Array(t.buffer),...a.map(o=>o.bytes)],{type:"image/x-icon"})}const It=e=>Math.max(2,Math.round(e/2)*2),Yl=()=>new DOMException("Export cancelled","AbortError"),Nt=e=>{if(e!=null&&e.aborted)throw Yl()},Wl=e=>new Promise(a=>setTimeout(a,e)),$a=()=>new Promise(e=>{const a=new MessageChannel;a.port1.onmessage=()=>e(),a.port2.postMessage(0)}),Bt=(e,a)=>{const t=mt(e.artboard);return t.w>=t.h?{width:a,height:Math.round(a*t.h/t.w)}:{width:Math.round(a*t.w/t.h),height:a}},Cs=async e=>{const a=[...e.mark.layers,...e.morph.on&&e.morph.target?e.morph.target.layers:[]];await Promise.all(a.filter(bt).map(t=>Dt(t)))},Ot=(e,a)=>{const t=document.createElement("canvas");return t.width=e,t.height=a,t},Ro=(e,a)=>{const t=Ot(e,a);return{canvas:t,renderer:Ut(t,{preserve:!0})}},Ao=(e,a,{width:t,height:s,morphT:o=0,style:r,time:i=0})=>{const l=a.morph.on&&a.morph.target,m=st([a.mark.layers,l?a.morph.target.layers:null]);$t(e,m.keys),e.draw({scene:{a:a.mark,b:l?a.morph.target:null,morph:l?o:0,maskSlots:m.slots},style:r||la(a),width:t,height:s,time:i,surfaceResolution:1024})},Co={fill:{kind:"solid",color1:"#ffffff"},background:{kind:"none"}},Ms=e=>{const a=Oe(e);return e.morph.on&&e.morph.target?!0:a.kind==="procedural"?!!a.def.animated:a.kind!=="flat"},Mo=(e,a)=>{const t=Oe(e);return t.kind==="metal"?{kind:"metal",id:"metal",props:{...t.props,imageSrc:a,scale:1,intro:!1,backgroundColor:"transparent"}}:t.kind==="background"?{kind:"background",id:`bg:${t.entry.id}`,props:pa(t)}:null};async function Kl({layout:e,output:a}){const t=document.createElement("iframe");t.src=ys({theme:"dark",clock:"manual",seed:1,dpr:a.width/e.width}),t.setAttribute("aria-hidden","true"),t.tabIndex=-1,Object.assign(t.style,{position:"fixed",left:"0px",top:"0px",width:`${e.width}px`,height:`${e.height}px`,border:"0",opacity:"0",pointerEvents:"none",zIndex:"-1",colorScheme:"dark"}),document.body.appendChild(t);let s;try{s=await Ws(t)}catch(i){throw t.remove(),i}const o=Ot(a.width,a.height),r=o.getContext("2d");return{canvas:o,async load(i,l,m){await s.load(i,l);const c=t.contentDocument,d=performance.now();for(let v=0;;v+=1){Nt(m),s.clock.step(1),await Wl(16);const x=s.stage(),h=x?Qa(x).layers.length:0,p=[...c.images].every(u=>u.complete);if(v>=18&&h>0&&p||performance.now()-d>9e3)break}},step(i){s.clock.step(i)},draw(){en(r,Qa(s.stage()),a.width,a.height)},destroy(){t.remove()}}}const Zl=(e,a)=>{const t=Math.max(240,Math.min(a||560,900));return{width:t,height:Math.round(t*e.height/e.width)}};async function Ga(e,a,{previewWidth:t,background:s=!0,signal:o}){await Cs(e),Nt(o);const r=Ro(a.width,a.height),i=Ro(a.width,a.height),l=Ot(a.width,a.height),m=l.getContext("2d"),c=s?la(e):{...la(e),background:{kind:"none"}},d=e.morph.on&&!!e.morph.target,v=Oe(e).kind,x={a:e.mark,b:d?e.morph.target:null};try{await r.renderer.prepareScene(x,c),v==="metal"&&!d&&await i.renderer.prepareScene(x,Co),Nt(o)}catch(u){throw r.renderer.dispose(),i.renderer.dispose(),u}let h=null,p=null;return v==="background"?p=Mo(e,null):v==="metal"&&!d&&(Ao(i.renderer,e,{width:a.width,height:a.height,style:Co}),p=Mo(e,i.canvas.toDataURL("image/png"))),p&&(h=await Kl({layout:Zl(a,t),output:a}),await h.load(p.id,p.props,o)),{canvas:l,render(u,P){const T=d?hs(u,e.morph):0;h&&p.kind==="background"&&(P&&h.step(P),h.draw(),r.renderer.setMaterialTexture(h.canvas)),Ao(r.renderer,e,{width:a.width,height:a.height,morphT:T,style:c,time:u}),m.clearRect(0,0,a.width,a.height),m.drawImage(r.canvas,0,0),h&&p.kind==="metal"&&(P&&h.step(P),h.draw(),m.drawImage(h.canvas,0,0))},advance(u){h==null||h.step(u)},destroy(){h==null||h.destroy(),r.renderer.dispose(),i.renderer.dispose()}}}const Jl=(e,a="image/png",t)=>new Promise((s,o)=>e.toBlob(r=>r?s(r):o(new Error("The image could not be encoded.")),a,t));async function qa(e,{longSide:a=2048,background:t=!0,previewWidth:s,moment:o=1.2,signal:r}={}){const i=Bt(e,a),l=await Ga(e,i,{previewWidth:s,background:t,signal:r});try{if(Ms(e)&&Oe(e).kind!=="flat"){const m=Math.round(o*1e3/16);for(let c=0;c<m;c+=1)l.advance(16),c%8===7&&await $a()}return l.render(e.morph.on?0:o,16),{blob:await Jl(l.canvas),width:i.width,height:i.height}}finally{l.destroy()}}const Ql={mp4:["avc","hevc","av1","vp9"],webm:["vp9","av1","vp8"]},e0=[2560,1920,1280,1080,720],Lo={standard:.08,high:.16,max:.3},t0=(e,a,t,s,o)=>{const r=o==="webm"?.65:1,i=a*t*s*(Lo[e]||Lo.standard)*r;return Math.round(Math.min(Math.max(i,6e5),6e7))},Ls=(e,a)=>a==="webm"?new e.WebMOutputFormat:new e.Mp4OutputFormat({fastStart:"in-memory"});async function a0(e,a,t,s,o,r){const i=Ls(e,a).getSupportedVideoCodecs(),l=Ql[a==="webm"?"webm":"mp4"].filter(v=>i.includes(v)),m=async(v,x)=>{const h=t0(r,v,x,o,a),p=await e.getFirstEncodableVideoCodec(l,{width:v,height:x,quality:new e.Quality({bitrate:h}),frameRate:o}).catch(()=>null);return p?{codec:p,width:v,height:x,bitrate:h}:null},c=await m(t,s);if(c)return c;const d=Math.max(t,s);for(const v of e0){if(v>=d)continue;const x=v/d,h=await m(It(t*x),It(s*x));if(h)return h}return null}const o0=e=>e.morph.on&&e.morph.target?tr(e.morph):6;async function s0(e,{format:a,longSide:t,fps:s,duration:o,quality:r="high",fill:i,previewWidth:l,signal:m,onProgress:c}){const d=await sa(()=>import("./index-C8Mz0d7G.js").then(N=>N.i),[]),v=Bt(e,t),x=await a0(d,a,It(v.width),It(v.height),s,r);if(!x)throw new Error("This browser cannot encode video at this size. Try a smaller size or WebM.");const h=[];x.width!==It(v.width)&&h.push(`Saved at ${x.width} × ${x.height}, the largest size this browser can encode.`);const p={width:x.width,height:x.height};c==null||c({phase:"loading",progress:0});const u=await Ga(e,p,{previewWidth:l,background:!0,signal:m}),P=Ot(p.width,p.height),T=P.getContext("2d"),z=new d.BufferTarget,M=new d.Output({format:Ls(d,a),target:z});let L=!1;try{const N=new d.CanvasSource(P,{codec:x.codec,quality:new d.Quality({bitrate:x.bitrate}),keyFrameInterval:2});M.addVideoTrack(N,{frameRate:s}),await M.start();const _=Math.max(1,Math.round(o*s)),U=1e3/s;for(let O=0;O<_;O+=1)Nt(m),u.render(O/s,O===0?0:U),T.fillStyle=i,T.fillRect(0,0,p.width,p.height),T.drawImage(u.canvas,0,0),await N.add(O/s,1/s),c==null||c({phase:"rendering",progress:(O+1)/_}),O%2===1&&await $a();return N.close(),await M.finalize(),L=!0,{blob:new Blob([z.buffer],{type:a==="webm"?"video/webm":"video/mp4"}),width:p.width,height:p.height,notes:h}}finally{L||await M.cancel().catch(()=>{}),u.destroy()}}async function n0(e,{longSide:a,fps:t,duration:s,fill:o,previewWidth:r,signal:i,onProgress:l}){const{GIFEncoder:m,quantize:c,applyPalette:d}=await sa(async()=>{const{GIFEncoder:P,quantize:T,applyPalette:z}=await import("./gifenc-CkcR2wYB.js").then(M=>M.g);return{GIFEncoder:P,quantize:T,applyPalette:z}},[]),v=Bt(e,a);l==null||l({phase:"loading",progress:0});const x=await Ga(e,v,{previewWidth:r,background:!0,signal:i}),p=Ot(v.width,v.height).getContext("2d",{willReadFrequently:!0}),u=m();try{const P=Math.max(1,Math.round(s*t)),T=Math.round(1e3/t),z=1e3/t;let M=null;for(let L=0;L<P;L+=1){Nt(i),x.render(L/t,L===0?0:z),p.fillStyle=o,p.fillRect(0,0,v.width,v.height),p.drawImage(x.canvas,0,0);const N=p.getImageData(0,0,v.width,v.height).data,_=M&&Oe(e).kind==="flat"?M:c(N,256,{format:"rgb565"});M||(M=_),u.writeFrame(d(N,_,"rgb565"),v.width,v.height,{palette:_,delay:T,repeat:0}),l==null||l({phase:"rendering",progress:(L+1)/P}),await $a()}return u.finish(),{blob:new Blob([u.bytes()],{type:"image/gif"}),width:v.width,height:v.height,notes:[]}}finally{x.destroy()}}const r0=e=>({...e,artboard:{...e.artboard,ratio:"1:1"}}),ht=async(e,a,{background:t})=>(await qa(r0(e),{longSide:a,background:t})).blob;async function l0(e,{svg:a,appleBackground:t}){const s={...e,artboard:{...e.artboard,background:{...e.artboard.background,kind:"color",color1:t}}},[o,r,i,l,m,c]=await Promise.all([ht(e,16,{background:!0}),ht(e,32,{background:!0}),ht(e,48,{background:!0}),ht(s,180,{background:!0}),ht(e,192,{background:!0}),ht(e,512,{background:!0})]),d=await Vl([{size:16,blob:o},{size:32,blob:r},{size:48,blob:i}]),v=JSON.stringify({name:e.name||"App",icons:[{src:"/icon-192.png",sizes:"192x192",type:"image/png"},{src:"/icon-512.png",sizes:"512x512",type:"image/png"}]},null,2),x=[{name:"favicon.ico",data:d},{name:"apple-touch-icon.png",data:l},{name:"icon-192.png",data:m},{name:"icon-512.png",data:c},{name:"site.webmanifest",data:v}];return a&&x.unshift({name:"favicon.svg",data:a}),Hl(x)}const qo=`<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />`,ca=e=>typeof e=="number"?Math.round(e*1e4)/1e4:e,i0=e=>JSON.stringify(Array.isArray(e)?e.map(ca):ca(e)),vt=e=>{const a=ca(Number(e)||0);return Number.isInteger(a)?`${a}.0`:String(a)},jo={bevel:.4,bend:2.5,strength:.25,angle:225},c0=e=>e!=null&&e.on?{...jo,...e,bevel:Math.max(e.bevel??jo.bevel,.005)}:null,m0=e=>{const a=e.angle*Math.PI/180;return`
vec3 bevelNormal(vec2 p, out vec2 shift) {
  vec4 sf = texture(uSurf, p * uFieldScale + 0.5);
  float q = 1.0 - clamp(sf.x, 0.0, 1.0);
  float slope = q / max(sqrt(max(1.0 - q * q, 0.0)), 0.12);
  shift = -sf.yz * q * ${vt(e.bevel*e.bevel*e.bend*.6)};
  return normalize(vec3(-sf.yz * slope * ${vt(e.bevel)}, 1.0));
}

vec3 dither(vec2 f) {
  float a = fract(52.9829189 * fract(dot(f, vec2(0.06711056, 0.00583715))));
  float b = fract(52.9829189 * fract(dot(f + vec2(17.0, 31.0), vec2(0.06711056, 0.00583715))));
  return vec3((a + b - 1.0) / 255.0);
}

float bevelLight(vec3 N) {
  vec3 L = normalize(vec3(${vt(Math.cos(a)*.62)}, ${vt(Math.sin(a)*.62)}, 0.78));
  float diffuse = max(dot(N, L), 0.0) / L.z;
  float occlusion = mix(1.0, 0.78, 1.0 - N.z);
  return mix(1.0, diffuse * occlusion, ${vt(e.strength)});
}
`},qs=(e,a)=>`#version 300 es
precision highp float;
#define PI 3.14159265359
#define TAU 6.28318530718
#define MATERIAL_OUTSIDE ${e.outside?"true":"false"}
#define MATERIAL_REACH ${(e.reach??.32).toFixed(4)}
uniform sampler2D uField;
uniform sampler2D uSurf;
uniform vec2 uFieldScale;
uniform vec2 uResolution;
uniform float uTime;
uniform vec4 uMatP[8];
uniform vec4 uMatC[16];
uniform vec4 uSurface;
out vec4 outColor;
${a.defines}

struct Surface {
  vec2 p;
  vec2 uv;
  vec2 frag;
  vec2 res;
  float unit;
  float px;
  float d;
  float aa;
  float cov;
  vec2 n;
  float slope;
  float time;
};

mat2 rot2(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

float smin(float a, float b, float k) {
  if (k <= 0.0) return min(a, b);
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float smax(float a, float b, float k) {
  return -smin(-a, -b, k);
}

vec4 over(vec4 base, vec4 top) {
  return top + base * (1.0 - top.a);
}

vec3 toLinear(vec3 c) {
  return pow(c, vec3(2.2));
}

vec3 toDisplay(vec3 c) {
  return pow(max(c, 0.0), vec3(1.0 / 2.2));
}

float shapeAt(vec2 q) {
  return texture(uField, q * uFieldScale + 0.5).r;
}

vec4 backdropAt(vec2 q) {
  return vec4(0.0);
}

float surfaceRim(Surface s, float width) {
  return clamp(1.0 + s.d / max(width, 1e-4), 0.0, 1.0);
}

vec3 domeNormal(Surface s, float width) {
  float x = min(surfaceRim(s, width), 0.985) * smoothstep(0.15, 0.85, s.slope);
  return normalize(vec3(s.n * x, sqrt(1.0 - x * x)));
}

float domeHeight(Surface s, float width) {
  float x = surfaceRim(s, width);
  return sqrt(max(1.0 - x * x, 0.0));
}
`,js=(e,a=!0)=>`
  float unit = min(uResolution.x, uResolution.y) * 0.5;
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 p = (frag - uResolution * 0.5) / unit;
  float px = 1.0 / unit;
  float bw = max(${e}, px);
  float e = clamp(bw * 0.2, px * 1.5, max(bw * 0.5, px * 1.5));
  float d = shapeAt(p);
  float aa = clamp(length(vec2(dFdx(d), dFdy(d))), px * 0.5, px * 1.5);
  vec2 g = ${a?"vec2(shapeAt(p + vec2(e, 0.0)) - shapeAt(p - vec2(e, 0.0)), shapeAt(p + vec2(0.0, e)) - shapeAt(p - vec2(0.0, e))) / (2.0 * e)":"vec2(0.0)"};
  Surface s;
  s.p = p;
  s.uv = frag / uResolution;
  s.frag = frag;
  s.res = uResolution;
  s.unit = unit;
  s.px = px;
  s.d = d;
  s.aa = aa;
  s.cov = clamp(0.5 - d / aa, 0.0, 1.0);
  s.slope = length(g);
  s.n = s.slope > 1e-5 ? g / s.slope : vec2(0.0);
  s.time = uTime;
`,f0=(e,a)=>`${qs(e,a)}
${e.glsl}

void main() {
${js("uSurface.x",e.normals!==!1)}
  vec4 m = material(s);
  float reach = 1.0 - smoothstep(MATERIAL_REACH * 0.55, MATERIAL_REACH, d);
  float a = clamp(MATERIAL_OUTSIDE ? m.a * max(reach, s.cov) : m.a * s.cov, 0.0, 1.0);
  outColor = vec4(clamp(m.rgb, 0.0, 1.0) * a, a);
}
`,u0=(e,a,t)=>`${qs(e,a)}
${e.glsl}
${t?m0(t):""}
void main() {
${js("0.2",!1)}
  vec4 fc;${t?`
  vec2 shift;
  vec3 N = bevelNormal(p, shift);
  fc = fill(p + shift, uTime);
  fc.rgb = clamp(fc.rgb * bevelLight(N) + dither(gl_FragCoord.xy), 0.0, 1.0);`:`
  fc = fill(p, uTime);`}
  float a = clamp(fc.a * s.cov, 0.0, 1.0);
  outColor = vec4(clamp(fc.rgb, 0.0, 1.0) * a, a);
}
`,d0=e=>e.slots.map(a=>{const t=a.param.name;return a.color!==void 0&&a.size?`  const ${t}List = (Array.isArray(${t}) ? ${t} : [${t}]).slice(0, ${a.size});
  ${t}List.forEach((value, index) => colors.set(toRgba(value), (${a.color} + index) * 4));
  floats[${a.count}] = ${t}List.length;`:a.color!==void 0?`  colors.set(toRgba(${t}), ${a.color*4});`:a.param.type==="boolean"?`  floats[${a.float}] = ${t} ? 1 : 0;`:`  floats[${a.float}] = Number(${t}) || 0;`}).join(`
`),Io={"shaders.com":"Material adapted from Shaders.com by Shader Effects Inc., MIT License, https://github.com/shader-effects-inc/shaders",paper:"Material adapted from Paper Shaders, Apache License 2.0, https://github.com/paper-design/shaders"},p0=`
const shrink = (data, width, height) => {
  const w = Math.max(1, Math.floor(width / 2));
  const h = Math.max(1, Math.floor(height / 2));
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * 2 * width + x * 2;
      const r = Math.min(x * 2 + 1, width - 1) - x * 2;
      const d = (Math.min(y * 2 + 1, height - 1) - y * 2) * width;
      out[y * w + x] = (data[i] + data[i + r] + data[i + d] + data[i + d + r]) * 0.25;
    }
  }
  return { data: out, width: w, height: h };
};

const grow = (coarse, cw, ch, width, height) => {
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    const fy = Math.min(Math.max((y + 0.5) / 2 - 0.5, 0), ch - 1);
    const y0 = Math.floor(fy);
    const y1 = Math.min(y0 + 1, ch - 1);
    for (let x = 0; x < width; x++) {
      const fx = Math.min(Math.max((x + 0.5) / 2 - 0.5, 0), cw - 1);
      const x0 = Math.floor(fx);
      const x1 = Math.min(x0 + 1, cw - 1);
      const a = coarse[y0 * cw + x0] * (1 - fx + x0) + coarse[y0 * cw + x1] * (fx - x0);
      const b = coarse[y1 * cw + x0] * (1 - fx + x0) + coarse[y1 * cw + x1] * (fx - x0);
      out[y * width + x] = a * (1 - fy + y0) + b * (fy - y0);
    }
  }
  return out;
};

const relaxLevel = (sdf, width, height, unit, length, start, sweeps) => {
  const pixels = Math.max(length * unit, 0.75);
  const screen = 1 / (pixels * pixels);
  const count = width * height;
  const inside = new Uint8Array(count);
  for (let i = 0; i < count; i++) inside[i] = sdf[i] < 0 ? 1 : 0;
  const weights = new Float32Array(count * 4);
  const diagonal = new Float32Array(count);
  const theta = (c, n) => Math.max(0.1, Math.min(1, sdf[c] / (sdf[c] - sdf[n])));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = y * width + x;
      if (!inside[c]) continue;
      const near = [x + 1 < width ? c + 1 : -1, x > 0 ? c - 1 : -1, y + 1 < height ? c + width : -1, y > 0 ? c - width : -1];
      const t = near.map(n => (n >= 0 && inside[n] ? 1 : n >= 0 ? theta(c, n) : 0.1));
      const kx = 2 / (t[0] + t[1]);
      const ky = 2 / (t[2] + t[3]);
      near.forEach((n, k) => {
        weights[c * 4 + k] = n >= 0 && inside[n] ? (k < 2 ? kx : ky) / t[k] : 0;
      });
      diagonal[c] = kx * (1 / t[0] + 1 / t[1]) + ky * (1 / t[2] + 1 / t[3]) + screen;
    }
  }
  const u = start || new Float32Array(count);
  for (let i = 0; i < count; i++) {
    if (!inside[i]) u[i] = 0;
    else if (!start) u[i] = 1 - Math.exp((sdf[i] * unit) / pixels);
  }
  for (let sweep = 0; sweep < sweeps; sweep++) {
    for (let parity = 0; parity < 2; parity++) {
      for (let y = 0; y < height; y++) {
        for (let x = (y + parity) & 1; x < width; x += 2) {
          const c = y * width + x;
          if (!inside[c]) continue;
          const w = c * 4;
          const sum =
            screen +
            weights[w] * (u[c + 1] || 0) +
            weights[w + 1] * (u[c - 1] || 0) +
            weights[w + 2] * (u[c + width] || 0) +
            weights[w + 3] * (u[c - width] || 0);
          u[c] += 1.6 * (sum / diagonal[c] - u[c]);
        }
      }
    }
  }
  return u;
};

const inflate = (field, length) => {
  const { data, width, height } = field;
  const unit = Math.min(width, height) / 2;
  const levels = [{ data, width, height, unit }];
  while (Math.min(levels[levels.length - 1].width, levels[levels.length - 1].height) > 40) {
    const last = levels[levels.length - 1];
    levels.push({ ...shrink(last.data, last.width, last.height), unit: last.unit / 2 });
  }
  let u = null;
  for (let index = levels.length - 1; index >= 0; index--) {
    const level = levels[index];
    const coarser = levels[index + 1];
    const start = u && coarser ? grow(u, coarser.width, coarser.height, level.width, level.height) : null;
    const sweeps = index === levels.length - 1 ? 60 : index === 0 ? 14 : 10;
    u = relaxLevel(level.data, level.width, level.height, level.unit, length, start, sweeps);
  }
  const out = new Float32Array(width * height * 4);
  const inside = i => data[i] < 0;
  const theta = (c, n) => Math.max(0.08, Math.min(1, data[c] / (data[c] - data[n])));
  const slope = (c, plus, minus) => {
    const pIn = plus < 0 || inside(plus);
    const mIn = minus < 0 || inside(minus);
    const up = plus < 0 ? u[c] : pIn ? u[plus] : 0;
    const um = minus < 0 ? u[c] : mIn ? u[minus] : 0;
    if (pIn && mIn) return (up - um) / 2;
    const tp = pIn ? 1 : theta(c, plus);
    const tm = mIn ? 1 : theta(c, minus);
    return (tm * tm * up - tp * tp * um - (tm * tm - tp * tp) * u[c]) / (tm * tp * (tm + tp));
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = y * width + x;
      if (!inside(c)) continue;
      out[c * 4] = u[c];
      out[c * 4 + 1] = slope(c, x + 1 < width ? c + 1 : -1, x > 0 ? c - 1 : -1) * unit;
      out[c * 4 + 2] = slope(c, y + 1 < height ? c + width : -1, y > 0 ? c - width : -1) * unit;
      out[c * 4 + 3] = 1;
    }
  }
  const sides = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let ring = 0; ring < 2; ring++) {
    const next = out.slice();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = (y * width + x) * 4;
        if (out[c + 3] > 0.25) continue;
        let sum = 0;
        let gx = 0;
        let gy = 0;
        let count = 0;
        for (const [dx, dy] of sides) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const k = (ny * width + nx) * 4;
          if (out[k + 3] < 0.25) continue;
          sum += out[k] - (out[k + 1] * dx + out[k + 2] * dy) / unit;
          gx += out[k + 1];
          gy += out[k + 2];
          count += 1;
        }
        if (!count) continue;
        next[c] = sum / count;
        next[c + 1] = gx / count;
        next[c + 2] = gy / count;
        next[c + 3] = 0.5;
      }
    }
    out.set(next);
  }
  const weights = [1, 2, 3, 4].map(k => Math.exp(-(k * k) / 2.88));
  for (const [dx, dy] of [[1, 0], [0, 1]]) {
    const source = out.slice();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = (y * width + x) * 4;
        if (source[c + 3] < 0.25) continue;
        let total = 1;
        const sum = [source[c], source[c + 1], source[c + 2]];
        for (let k = 1; k <= 4; k++) {
          for (const sign of [1, -1]) {
            const nx = Math.min(width - 1, Math.max(0, x + dx * k * sign));
            const ny = Math.min(height - 1, Math.max(0, y + dy * k * sign));
            const n = (ny * width + nx) * 4;
            if (source[n + 3] < 0.25) continue;
            const w = weights[k - 1];
            sum[0] += w * source[n];
            sum[1] += w * source[n + 1];
            sum[2] += w * source[n + 2];
            total += w;
          }
        }
        out[c] = sum[0] / total;
        out[c + 1] = sum[1] / total;
        out[c + 2] = sum[2] / total;
      }
    }
  }
  return out;
};
`;function h0(e,a,{name:t,gloss:s,assetName:o,aspect:r}){const i=ts(e.params),l={...as(e.params),...a},m=e.kind==="fill"?c0(s):null,c=e.kind==="fill"?u0(e,i,m):f0(e,i),d=e.params.map(T=>T.name),v=typeof e.surface=="number"?e.surface:l[e.surface]??.2,x=d.map(T=>`${T} = ${i0(l[T])}`).join(`,
  `),h=d.join(", "),p=Io[e.source]?`
${t}.credits = '${Io[e.source]}';
`:"",u=!!m;return{code:`import { useEffect, useRef } from 'react';
import logo from './${o}';

const VERTEX = \`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}\`;

const FRAGMENT = \`${c.replace(/`/g,"\\`")}\`;

const toRgba = value => {
  const hex = String(value || '#ffffff').replace('#', '');
  const full = hex.length <= 4 ? hex.split('').map(char => char + char).join('') : hex;
  const channel = index => parseInt(full.slice(index, index + 2), 16) / 255;
  return [channel(0), channel(2), channel(4), full.length >= 8 ? channel(6) : 1];
};

const solve = (grid, offset, stride, length, f, v, z) => {
  for (let i = 0; i < length; i++) f[i] = grid[offset + i * stride];
  let k = 0;
  v[0] = 0;
  z[0] = -1e20;
  z[1] = 1e20;
  for (let q = 1; q < length; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = 1e20;
  }
  k = 0;
  for (let q = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    grid[offset + q * stride] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
};

const distances = (grid, width, height) => {
  const size = Math.max(width, height);
  const f = new Float64Array(size);
  const v = new Int32Array(size);
  const z = new Float64Array(size + 1);
  for (let x = 0; x < width; x++) solve(grid, x, width, height, f, v, z);
  for (let y = 0; y < height; y++) solve(grid, y * width, 1, width, f, v, z);
};

const loadField = src =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const long = 640;
      const ratio = image.width / image.height || 1;
      const width = Math.round(ratio >= 1 ? long : long * ratio);
      const height = Math.round(ratio >= 1 ? long / ratio : long);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      const outer = new Float64Array(width * height);
      const inner = new Float64Array(width * height);
      for (let i = 0; i < width * height; i++) {
        const a = pixels[i * 4 + 3] / 255;
        const edge = 0.5 - a;
        outer[i] = a >= 1 ? 0 : a <= 0 ? 1e20 : edge > 0 ? edge * edge : 0;
        inner[i] = a <= 0 ? 0 : a >= 1 ? 1e20 : edge < 0 ? edge * edge : 0;
      }
      distances(outer, width, height);
      distances(inner, width, height);
      const unit = Math.min(width, height) / 2;
      const data = new Float32Array(width * height);
      for (let i = 0; i < data.length; i++) data[i] = (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) / unit;
      resolve({ data, width, height });
    };
    image.onerror = reject;
    image.src = src;
  });

${u?p0:""}
const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

export default function ${t}({
  src = logo,
  className,
  style,
  ${x}
}) {
  const canvasRef = useRef(null);
  const settings = useRef({});
  settings.current = { ${h} };

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return undefined;
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uniform = name => gl.getUniformLocation(program, name);
    const texture = gl.createTexture();
    const surface = gl.createTexture();
    let field = null;
    let frame = 0;
    let alive = true;
    const started = performance.now();

    const pack = ({ ${h} }) => {
      const floats = new Float32Array(32);
      const colors = new Float32Array(64);
${d0(i)}
      return { floats, colors };
    };

    const render = now => {
      frame = requestAnimationFrame(render);
      if (!field) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const { floats, colors } = pack(settings.current);
      const fieldUnit = Math.min(field.width, field.height) / 2;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniform('uResolution'), width, height);
      gl.uniform2f(uniform('uFieldScale'), fieldUnit / field.width, fieldUnit / field.height);
      gl.uniform1f(uniform('uTime'), (now - started) / 1000);
      gl.uniform4fv(uniform('uMatP'), floats);
      gl.uniform4fv(uniform('uMatC'), colors);
      gl.uniform4f(uniform('uSurface'), ${vt(v).replace(/\.0$/,"")}, 0, 0, 0);
      gl.uniform1i(uniform('uField'), 0);
      gl.uniform1i(uniform('uSurf'), 1);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    loadField(src)
      .then(result => {
        if (!alive) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, result.width, result.height, 0, gl.RED, gl.FLOAT, result.data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);${u?`
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, surface);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, result.width, result.height, 0, gl.RGBA, gl.FLOAT, inflate(result, ${ca(m==null?void 0:m.bevel)}));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.activeTexture(gl.TEXTURE0);`:""}
        field = result;
      })
      .catch(() => {});
    frame = requestAnimationFrame(render);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      gl.deleteTexture(texture);
      gl.deleteTexture(surface);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', aspectRatio: '${r}', ...style }}
    />
  );
}
${p}`,install:null}}const v0={color:"#ffffff",density:2,softness:.1,dispersion:.3,distortion:.07,edgeBend:.6,angle:70,speed:1,mouseTilt:.5},ja=e=>typeof e=="number"?Math.round(e*1e3)/1e3:e,g0=e=>typeof e=="string"?`"${e}"`:typeof e=="boolean"?e?"":"={false}":`{${JSON.stringify(ja(e))}}`,Fo=(e,a)=>Object.entries(e).map(([t,s])=>{const o=g0(s);return o===""?`${a}${t}`:o.startsWith("=")?`${a}${t}${o}`:`${a}${t}=${o}`}).join(`
`),Do=(e,a)=>Object.fromEntries(Object.entries(e).filter(([t,s])=>JSON.stringify(ja(s))!==JSON.stringify(ja(a[t])))),Ea=e=>{const a=mt(e.artboard);return`${a.w} / ${a.h}`},ma=e=>(String(e||"Logo").replace(/[^a-zA-Z0-9]+(.)?/g,(a,t)=>t?t.toUpperCase():"").replace(/^[^a-zA-Z]+/,"").replace(/^./,a=>a.toUpperCase())||"Logo")+(/(logo|mark)$/i.test(e||"")?"":"Mark");function x0(e,{assetName:a="logo.svg"}={}){const t=Oe(e),s=ma(e.name);if(t.kind==="procedural")return h0(t.def,t.props,{name:s,gloss:e.effects.gloss,assetName:a,aspect:Ea(e)});if(t.kind==="metal"){const o=Do(Object.fromEntries(bs.map(i=>[i.name,t.props[i.name]??i.default])),v0),r=Fo({imageSrc:"__LOGO__",...o,scale:1},"        ").replace('imageSrc="__LOGO__"',"imageSrc={logo}");return{install:'npx shadcn@latest add "https://reactbits.dev/default/animations/metallic-paint"',code:`import MetallicPaint from './MetallicPaint';
import logo from './${a}';

export default function ${s}() {
  return (
    <div style={{ width: 480, aspectRatio: '${Ea(e)}' }}>
      <MetallicPaint
${r}
      />
    </div>
  );
}
`}}if(t.kind==="background"){const o=t.entry,r=da(o),i=Do(pa(t),r),l=o.label.replace(/[^a-zA-Z0-9]/g,""),m=Object.keys(i).length?`
${Fo(i,"        ")}
      `:" ";return{install:o.installCommand,code:`import ${l} from './${l}';
import logo from './${a}';

export default function ${s}() {
  return (
    <div
      style={{
        width: 480,
        aspectRatio: '${Ea(e)}',
        background: '${e.material.base??"#0c0b10"}',
        WebkitMaskImage: \`url(\${logo})\`,
        maskImage: \`url(\${logo})\`,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%'
      }}
    >
      <${l}${m}/>
    </div>
  );
}
`}}return null}const b0=Object.assign({"../geometry/morph.js":()=>sa(()=>import("./morph-DJYg0K78.js"),__vite__mapDeps([0,1])),"../geometry/svg.js":()=>sa(()=>import("./svg-Bx2QwCHk.js"),[])}),Is=async e=>{const a=b0[e];if(!a)throw new Error("Vector export is not ready yet.");return a()},y0=()=>Is("../geometry/svg.js"),No="0.45 0 0.55 1",w0=e=>{const a=Math.max(0,e.hold??.8),t=Math.max(.05,e.duration??1.6),s=(a+t)*2,o=[0,a,a+t,a*2+t,s].map(r=>Math.round(r/s*1e4)/1e4);return{total:Math.round(s*1e3)/1e3,keyTimes:o.join(";"),keySplines:["0 0 1 1",No,"0 0 1 1",No].join(";")}},k0=(e,a,t,s)=>{const o=[e,e,a,a,e].join(";");return s?`<animate attributeName="d" dur="${t.total}s" repeatCount="indefinite" calcMode="spline" keyTimes="${t.keyTimes}" keySplines="${t.keySplines}" values="${o}" />`:`<animate attributeName="d" dur="${t.total}s" repeatCount="indefinite" calcMode="spline" keyTimes="${t.keyTimes}" keySplines="${t.keySplines}" values="${o}"/>`},Bo=(e,a,t,s,o)=>{const r=e.indexOf("<path");if(r<0)return e;const i=e.indexOf("/>",r),l=e.slice(r,i).replace(/\s+$/,""),m=e.slice(e.lastIndexOf(`
`,r)+1,r);return`${e.slice(0,r)}${l}>
${m}  ${k0(a,t,s,o)}
${m}</path>${e.slice(i+2)}`};async function Uo(e,a=1024){await Cs(e);const t=mt(e.artboard),s=t.w>=t.h?a:Math.round(a*t.w/t.h),o=t.w>=t.h?Math.round(a*t.h/t.w):a,r=document.createElement("canvas"),i=Ut(r,{preserve:!0});try{const l=st([e.mark.layers]),m={a:e.mark,maskSlots:l.slots};return await i.prepareScene(m),$t(i,l.keys),i.readField({scene:m,width:s,height:o})}finally{i.dispose()}}async function _0(e,{background:a=!1,longSide:t=1024}={}){var p;const s=await y0(),o=await Uo(e,t),r=s.fieldToPath(o,{tolerance:.5,viewBox:[o.width,o.height]}),i=Oe(e).kind==="flat",l=e.effects.outline,m=i?e.fill.kind==="logo"?{kind:"solid",color1:e.fill.color1||"#111111"}:e.fill:{kind:"solid",color1:"#ffffff"},c={d:r.d,width:o.width,height:o.height,fill:m,background:a&&e.artboard.background.kind!=="none"?e.artboard.background:null,outline:i&&l.on?{color:l.color,width:l.width*(Math.min(o.width,o.height)/2),mode:l.mode}:null,fillRule:"evenodd"};if(((p=e.morph)==null?void 0:p.on)&&e.morph.target){const u=await Is("../geometry/morph.js"),P=await Uo({...e,mark:e.morph.target,morph:{...e.morph,on:!1}},t),T=s.fieldToPath(P,{tolerance:.5,viewBox:[P.width,P.height]}),z=u.morphPaths(r.contours,T.contours),M=w0(e.morph),L={...c,d:z.from},N=Bo(s.buildSVG(L),z.from,z.to,M,!1),_=Bo(s.toReactComponent(L,{name:ma(e.name)}),z.from,z.to,M,!0),U=s.buildSVG({d:r.d,width:o.width,height:o.height,fill:{kind:"solid",color1:"#000000"},fillRule:"evenodd"}),O=(z.segments||[]).reduce((ae,oe)=>ae+oe,0);return{svg:N,mask:U,react:_,d:z.from,segments:O,animated:!0}}const v=s.buildSVG(c),x=s.buildSVG({d:r.d,width:o.width,height:o.height,fill:{kind:"solid",color1:"#000000"},fillRule:"evenodd"}),h=s.toReactComponent(c,{name:ma(e.name)});return{svg:v,mask:x,react:h,d:r.d,segments:r.segments??r.count??0}}const $o=e=>e>1048576?`${(e/1048576).toFixed(1)} MB`:`${Math.max(1,Math.round(e/1024))} KB`,Mt=({title:e,value:a,options:t,onChange:s})=>n.jsx("div",{className:"scrubber",children:n.jsxs("div",{className:"scrubber-track bs-choice",children:[n.jsx("span",{className:"bs-choice-label",children:e}),n.jsx(at,{label:e,value:a,options:t,onChange:s})]})}),z0=[{value:512,label:"512"},{value:1024,label:"1K"},{value:2048,label:"2K"},{value:4096,label:"4K"}],T0=[{value:"mp4",label:"MP4"},{value:"webm",label:"WebM"},{value:"gif",label:"GIF"}],E0=[{value:720,label:"720"},{value:1080,label:"1080"},{value:1440,label:"1440"}],S0=[24,30,60].map(e=>({value:e,label:String(e)})),P0=[{value:320,label:"320"},{value:480,label:"480"},{value:640,label:"640"}],R0={loading:"Preparing",rendering:"Rendering"};let ea=null;const A0=e=>String(e||"mark").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"mark";function C0({doc:e,light:a,onClose:t}){var ve,Ee,nt;const s=Ms(e),o=Oe(e),r=w.useMemo(()=>[{value:"image",label:"PNG",icon:H.Image01Icon},{value:"vector",label:"SVG",icon:H.ShapesIcon},{value:"icons",label:"Icons",icon:H.DashboardSquare01Icon},...s?[{value:"video",label:"Vídeo",icon:H.Video01Icon}]:[],{value:"code",label:"Código",icon:H.CodeIcon}],[s]),[i,l]=w.useState(()=>ea&&r.some(I=>I.value===ea)?ea:"image"),[m,c]=w.useState({size:2048,background:!0}),[d,v]=w.useState({background:!1}),[x,h]=w.useState({apple:e.artboard.background.kind==="color"?e.artboard.background.color1:"#0c0b10"}),[p,u]=w.useState(()=>({format:"mp4",size:1080,gifSize:480,fps:30,duration:Math.min(12,Math.round(o0(e)*10)/10),fill:e.artboard.background.kind==="color"?e.artboard.background.color1:a?"#ffffff":"#0c0b10"})),[P,T]=w.useState(null),[z,M]=w.useState(null),[L,N]=w.useState(null),[_,U]=w.useState(null),[O,ae]=w.useState(null),oe=w.useRef(null),pe=w.useRef(null),ge=!!L,ue=mt(e.artboard),ee=A0(e.name),ne=w.useMemo(()=>e,[e]),re=I=>{ea=I,l(I),U(null),ae(null)};w.useEffect(()=>{var _e;const I=document.activeElement;(_e=pe.current)==null||_e.focus({preventScroll:!0});const F=g=>{g.key==="Escape"&&!oe.current&&(g.stopPropagation(),t())};return document.addEventListener("keydown",F),()=>{var g,S;document.removeEventListener("keydown",F),(g=oe.current)==null||g.abort(),(S=I==null?void 0:I.focus)==null||S.call(I,{preventScroll:!0})}},[t]),w.useEffect(()=>{let I=!0;return qa(ne,{longSide:900,background:!0}).then(({blob:F})=>I&&T(URL.createObjectURL(F))).catch(()=>{}),()=>{I=!1}},[ne]),w.useEffect(()=>{let I=!0;return _0(ne,{background:d.background}).then(F=>I&&M(F)).catch(F=>I&&M({error:(F==null?void 0:F.message)||"The vector could not be traced."})),()=>{I=!1}},[ne,d.background]),w.useEffect(()=>()=>P&&URL.revokeObjectURL(P),[P]),w.useEffect(()=>()=>(_==null?void 0:_.url)&&URL.revokeObjectURL(_.url),[_]);const le=w.useCallback(async(I,F)=>{const _e=new AbortController;oe.current=_e,ae(null),U(null),N({phase:"loading",progress:0,label:I});try{return await F(_e.signal,S=>N(C=>C&&{...C,...S}))}catch(g){return(g==null?void 0:g.name)!=="AbortError"&&ae((g==null?void 0:g.message)||"Export failed."),null}finally{oe.current=null,N(null)}},[]),se=async(I,F)=>{try{await navigator.clipboard.writeText(I),$e.toast.success(F)}catch{$e.toast.error("Could not copy")}},he=async I=>{const F=await le("image",_e=>qa(ne,{longSide:m.size,background:m.background,signal:_e}));if(F){if(I==="copy"){try{await navigator.clipboard.write([new window.ClipboardItem({"image/png":F.blob})]),$e.toast.success("Image copied")}catch{$e.toast.error("Could not copy the image")}return}_t(F.blob,`${ee}.png`)}},Te=async()=>{const I=p.format==="gif",F=await le("video",(g,S)=>I?n0(ne,{longSide:p.gifSize,fps:Math.min(p.fps,24),duration:p.duration,fill:p.fill,signal:g,onProgress:S}):s0(ne,{format:p.format,longSide:p.size,fps:p.fps,duration:p.duration,fill:p.fill,signal:g,onProgress:S}));if(!F)return;const _e=URL.createObjectURL(F.blob);U({url:_e,type:F.blob.type,size:F.blob.size,notes:F.notes}),_t(F.blob,`${ee}.${I?"gif":p.format}`)},qe=async()=>{const I=await le("icons",()=>l0(ne,{svg:z==null?void 0:z.svg,appleBackground:x.apple}));I&&_t(I,`${ee}-icons.zip`)},we=o.kind==="flat"?z!=null&&z.react?{code:z.react}:null:x0(e,{assetName:`${ee}.svg`}),We=Bt(e,m.size),Fe=Bt(e,p.format==="gif"?p.gifSize:p.size),Ke={image:`${We.width} × ${We.height} · PNG${e.artboard.background.kind==="none"||!m.background?" · transparent":""}`,vector:z!=null&&z.svg?`${z.animated?"Animated morph · ":""}${z.segments} curves · ${$o(new Blob([z.svg]).size)}`:z!=null&&z.error?"":"Tracing…",icons:"ICO, SVG, Apple touch and manifest icons",video:`${Fe.width} × ${Fe.height} · ${p.format==="gif"?Math.min(p.fps,24):p.fps} fps · ${p.duration.toFixed(1)}s · ${p.format.toUpperCase()}`,code:o.kind==="flat"?"React component with an inline SVG":o.kind==="procedural"?"Self-contained WebGL component for your mark":"Componente aplicado à sua forma"}[i],De=i==="vector"&&(z!=null&&z.svg)?n.jsx("img",{src:`data:image/svg+xml;charset=utf-8,${encodeURIComponent(z.svg)}`,alt:""}):(ve=_==null?void 0:_.type)!=null&&ve.startsWith("video")?n.jsx("video",{src:_.url,autoPlay:!0,loop:!0,muted:!0,playsInline:!0}):(_==null?void 0:_.type)==="image/gif"?n.jsx("img",{src:_.url,alt:""}):P?n.jsx("img",{src:P,alt:""}):n.jsx("span",{className:"bs-spinner bs-xp-spinner"});return Os.createPortal(n.jsx("div",{className:"bs-backdrop",onMouseDown:I=>I.target===I.currentTarget&&!ge&&t(),children:n.jsxs("div",{className:"bs-dialog lab-dialog",role:"dialog","aria-modal":"true","aria-labelledby":"smg-export-title",ref:pe,tabIndex:-1,children:[n.jsxs("header",{className:"bs-dialog-head",children:[n.jsx("h2",{id:"smg-export-title",className:"bs-dialog-title",children:"Exportar"}),n.jsx(at,{label:"Export as",value:i,options:r.map(I=>({...I,disabled:ge&&I.value!==i})),onChange:re}),n.jsx("button",{type:"button",className:"docs-tool bs-dialog-close","aria-label":"Fechar",onClick:t,disabled:ge,children:n.jsx(xe,{icon:H.Cancel01Icon})})]}),n.jsx("div",{className:"bs-dialog-body",children:n.jsxs("div",{className:"bs-xp",children:[n.jsx("div",{className:"bs-xp-well",children:n.jsxs("div",{className:"bs-xp-media smg-xp-media","data-transparent":e.artboard.background.kind==="none"&&i!=="video"?"":void 0,style:{"--xp-aspect":ue.w/ue.h},children:[De,L&&n.jsxs("div",{className:"bs-progress",role:"status",children:[n.jsx("span",{className:"bs-progress-label",children:R0[L.phase]||"Working"}),n.jsx("span",{className:"bs-progress-bar",children:n.jsx("i",{style:{transform:`scaleX(${Math.max(.02,L.progress||0)})`}})}),n.jsxs("span",{className:"bs-progress-time",children:[Math.round((L.progress||0)*100),"%"]})]})]})}),n.jsxs("div",{className:"bs-xp-side",children:[n.jsx("div",{className:"customize-frame bs-xp-card",children:n.jsxs("div",{className:"preview-options bs-options",children:[i==="image"&&n.jsxs(n.Fragment,{children:[n.jsx(Mt,{title:"Tamanho",value:m.size,options:z0,onChange:I=>c(F=>({...F,size:I}))}),e.artboard.background.kind!=="none"&&n.jsx(et,{title:"Fundo",isChecked:m.background,onChange:I=>c(F=>({...F,background:I}))})]}),i==="vector"&&n.jsx(et,{title:"Fundo",isChecked:d.background,isDisabled:e.artboard.background.kind==="none",onChange:I=>v(F=>({...F,background:I}))}),i==="icons"&&n.jsx(Ye,{title:"Icon background",color:x.apple,onChange:I=>h(F=>({...F,apple:I}))}),i==="video"&&n.jsxs(n.Fragment,{children:[n.jsx(Mt,{title:"Formato",value:p.format,options:T0,onChange:I=>u(F=>({...F,format:I}))}),p.format==="gif"?n.jsx(Mt,{title:"Tamanho",value:p.gifSize,options:P0,onChange:I=>u(F=>({...F,gifSize:I}))}):n.jsxs(n.Fragment,{children:[n.jsx(Mt,{title:"Tamanho",value:p.size,options:E0,onChange:I=>u(F=>({...F,size:I}))}),n.jsx(Mt,{title:"Frame rate",value:p.fps,options:S0,onChange:I=>u(F=>({...F,fps:I}))})]}),n.jsx(Q,{title:"Duração",min:1,max:20,step:.1,valueUnit:"s",value:p.duration,onChange:I=>u(F=>({...F,duration:I}))}),e.artboard.background.kind==="none"&&n.jsx(Ye,{title:"Fundo",color:p.fill,onChange:I=>u(F=>({...F,fill:I}))})]}),i==="code"&&we&&n.jsx(Ul,{material:o,code:we,svg:z,name:ee})]})}),n.jsxs("div",{className:"bs-xp-notes",children:[i==="vector"&&n.jsxs("p",{children:["A clean path you can edit in Figma or Illustrator. Shadow, glow and bevel stay in the PNG",e.fill.kind==="logo"?", and logo colors export as one color.":e.fill.kind==="conic"?", and conic fills export as their first color.":"."]}),i==="vector"&&(z==null?void 0:z.error)&&n.jsx("p",{className:"bs-xp-error",children:z.error}),i==="icons"&&n.jsx("button",{type:"button",className:"smg-code-install smg-snippet",onClick:()=>se(qo,"Tags copied"),children:n.jsx("code",{children:qo})}),i==="code"&&o.kind!=="flat"&&n.jsxs("p",{children:["Download the mask as ",n.jsxs("code",{children:[ee,".svg"]})," next to the component. It is the shape this material fills.",o.kind==="background"&&((Ee=e.effects.gloss)!=null&&Ee.on)?" The 3D bevel is baked into the image and video exports.":"",o.kind==="procedural"?" Shadow, glow and outline stay in the image exports.":""]}),(nt=_==null?void 0:_.notes)==null?void 0:nt.map(I=>n.jsx("p",{children:I},I)),O&&n.jsx("p",{className:"bs-xp-error",children:O})]}),n.jsxs("div",{className:"bs-xp-footer",children:[n.jsxs("p",{className:"bs-xp-meta",children:[Ke,_&&` · ${$o(_.size)}`]}),n.jsx("div",{className:"bs-xp-actions",children:L?n.jsx("button",{type:"button",className:"docs-tool bs-wide-button",onClick:()=>{var I;return(I=oe.current)==null?void 0:I.abort()},children:"Cancelar"}):i==="image"?n.jsxs(n.Fragment,{children:[n.jsx(Ge,{label:"Copy image",placement:"top",children:n.jsx("button",{type:"button",className:"docs-tool bs-xp-square","aria-label":"Copy image",onClick:()=>he("copy"),children:n.jsx(xe,{icon:H.Copy01Icon})})}),n.jsxs("button",{type:"button",className:"bs-export bs-wide-button",onClick:()=>he("download"),children:[n.jsx(xe,{icon:H.Download04Icon}),n.jsx("span",{children:"Download PNG"})]})]}):i==="vector"?n.jsxs(n.Fragment,{children:[n.jsx(Ge,{label:"Copy SVG",placement:"top",children:n.jsx("button",{type:"button",className:"docs-tool bs-xp-square","aria-label":"Copy SVG",disabled:!(z!=null&&z.svg),onClick:()=>se(z.svg,"SVG copied"),children:n.jsx(xe,{icon:H.Copy01Icon})})}),n.jsxs("button",{type:"button",className:"bs-export bs-wide-button",disabled:!(z!=null&&z.svg),onClick:()=>_t(new Blob([z.svg],{type:"image/svg+xml"}),`${ee}.svg`),children:[n.jsx(xe,{icon:H.Download04Icon}),n.jsx("span",{children:"Download SVG"})]})]}):i==="icons"?n.jsxs("button",{type:"button",className:"bs-export bs-wide-button",onClick:qe,children:[n.jsx(xe,{icon:H.Download04Icon}),n.jsx("span",{children:"Download icons"})]}):i==="video"?n.jsxs("button",{type:"button",className:"bs-export bs-wide-button",onClick:Te,children:[n.jsx(xe,{icon:H.Video01Icon}),n.jsxs("span",{children:["Render ",p.format==="gif"?"GIF":"video"]})]}):n.jsxs(n.Fragment,{children:[o.kind!=="flat"&&n.jsx(Ge,{label:"Download mask SVG",placement:"top",children:n.jsx("button",{type:"button",className:"docs-tool bs-xp-square","aria-label":"Download mask SVG",disabled:!(z!=null&&z.mask),onClick:()=>_t(new Blob([z.mask],{type:"image/svg+xml"}),`${ee}.svg`),children:n.jsx(xe,{icon:H.Download04Icon})})}),n.jsxs("button",{type:"button",className:"bs-export bs-wide-button",disabled:!we,onClick:()=>se(we.code,`${ma(e.name)} copied`),children:[n.jsx(xe,{icon:H.Copy01Icon}),n.jsx("span",{children:"Copy code"})]})]})})]})]})]})})]})}),document.body)}const M0="(min-width: 1280px)",L0="(min-width: 1024px)",Fs="rb-shape-magic-snapping",Go="shapeMagicLayers",q0=[{value:"marks",label:"Formas"},{value:"materials",label:"Materiais"}],Oo=[{value:"marks",label:"Formas"},{value:"materials",label:"Materiais"},{value:"edit",label:"Editar"}],Xo=e=>{const[a,t]=w.useState(()=>window.matchMedia(e).matches);return w.useEffect(()=>{const s=window.matchMedia(e),o=()=>t(s.matches);return o(),s.addEventListener("change",o),()=>s.removeEventListener("change",o)},[e]),a},j0=()=>{const e=()=>document.documentElement.getAttribute("data-theme")==="light",[a,t]=w.useState(e);return w.useEffect(()=>{const s=new MutationObserver(()=>t(e()));return s.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme","class"]}),()=>s.disconnect()},[]),a},I0=()=>{try{return window.localStorage.getItem(Fs)!=="off"}catch{return!0}},F0=e=>{try{window.localStorage.setItem(Fs,e?"on":"off")}catch{return}},D0=e=>new Promise((a,t)=>{const s=new FileReader;s.onload=()=>a(s.result),s.onerror=()=>t(s.error),s.readAsDataURL(e)}),Ho=e=>/^image\/(svg\+xml|png|jpeg|webp|gif)$/.test((e==null?void 0:e.type)||"")||/\.(svg|png|jpe?g|webp)$/i.test((e==null?void 0:e.name)||""),Sa=e=>{var a;return!!((a=e==null?void 0:e.closest)!=null&&a.call(e,'input, textarea, select, [contenteditable="true"], [role="dialog"]'))},Vo="fx:thermal",Yo=e=>({...Ca(e).mark,preset:e.id}),Wo=(e,a={})=>({...e,id:ss(),params:{...e.params},...e.text?{text:{...e.text}}:{},...e.image?{image:{...e.image}}:{},...a});let Pa=null;function K0({toolSelector:e}){var Va,Ya,Wa;const a=Xo(M0),t=Xo(L0),s=j0(),o=er(()=>({...Ca(za[pr],{light:s}),material:{id:Vo,props:{},preset:Vo}})),{doc:r,set:i,replace:l}=o,[m,c]=w.useState([]),[d,v]=w.useState("marks"),[x,h]=w.useState("marks"),[p,u]=w.useState({}),[P,T]=w.useState(0),[z,M]=w.useState(null),[L,N]=w.useState(!1),[_,U]=w.useState(!0),[O,ae]=w.useState(!1),[oe,pe]=w.useState(!1),[ge,ue]=w.useState(!1),[ee,ne]=w.useState(I0),[re,le]=w.useState(0),se=w.useRef(null),he=w.useRef(null),Te=w.useRef(0),qe=w.useRef(0),we=w.useRef(null),We=w.useRef(null),Fe=w.useRef(0),Ke=w.useRef(!0),De=w.useRef(-1),ve=w.useRef(r);ve.current=r;const Ee=w.useRef(m);Ee.current=m,w.useEffect(()=>{l(f=>{var b;return(b=f.fill)!=null&&b.ink?{...f,fill:{...f.fill,...cs(s)}}:f})},[s,l]);const nt=a?d==="materials":x==="materials",I=sl(s),F=nl(r,s,nt&&L),_e=w.useMemo(()=>({...I,...F}),[I,F]),g=Oe(r),S=g.kind==="procedural"?g.def:null,C=r.morph.on&&!!r.morph.target,D=g.kind==="background",W=g.kind==="metal"&&!C,J=D||W,k=il(r,W),R=!!(S!=null&&S.animated),A=C||D||R,q=w.useMemo(()=>g.kind==="metal"?{...g.props,imageSrc:k||void 0,scale:1,intro:!1,backgroundColor:"transparent"}:g.kind==="background"?pa(g):{},[g,k]),G=g.kind==="metal"?"metal":g.kind==="background"?`bg:${g.entry.id}`:null,$=ml({id:G,props:q,active:J&&(g.kind!=="metal"||!!k),capture:D,playing:_}),te=[r.mark.layers,C?r.morph.target.layers:null],me=st(te).keys.join("|");w.useEffect(()=>{var b;let f=!1;return[...ve.current.mark.layers,...ve.current.morph.on?((b=ve.current.morph.target)==null?void 0:b.layers)||[]:[]].filter(bt).forEach(y=>Dt(y).then(()=>!f&&T(E=>E+1)).catch(E=>!f&&$e.toast.error((E==null?void 0:E.message)||"That logo could not be read."))),()=>{f=!0}},[me]);const ye=w.useCallback(()=>{const f=se.current;if(!f)return null;if(he.current&&he.current.gl.canvas!==f&&(he.current.dispose(),he.current=null,De.current=-1),!he.current)try{he.current=Ut(f)}catch(b){return $e.toast.error(b.message),null}return he.current},[]),ze=w.useCallback(async f=>{var ke,Y;if(!z)return;const b=ye();if(!b)return;const y=++Te.current,E=ve.current,j=E.morph.on&&E.morph.target,X=st([E.mark.layers,j?E.morph.target.layers:null]);$t(b,X.keys);const B=Math.min(window.devicePixelRatio||1,(ke=ws(E))!=null&&ke.heavy?1:2),Z={a:E.mark,b:j?E.morph.target:null,morph:j?hs(f,E.morph):0,maskSlots:X.slots},V=la(E);try{if(await b.prepareScene(Z,V),y!==Te.current||he.current!==b)return;b.draw({scene:Z,style:V,width:Math.round(z.width*B),height:Math.round(z.height*B),time:f,surfaceResolution:j?512:768}),N(!0)}catch(fe){y===Te.current&&he.current===b&&$e.toast.error(((Y=fe==null?void 0:fe.message)==null?void 0:Y.slice(0,160))||"The preview could not be rendered.")}},[z,ye]),tt=w.useCallback((f,b,y,E)=>{var j,X;return(X=(j=$.bridge)==null?void 0:j.pointer)==null?void 0:X.call(j,f,b,y,E)},[$.bridge]),Me=w.useCallback(()=>{const f=$.bridge,b=he.current;if(!(f!=null&&f.capture)||!b)return!1;const y=f.capture();return!y||y.version===De.current||y.canvas.width<2?!1:(b.setMaterialTexture(y.canvas),De.current=y.version,!0)},[$.bridge]);w.useEffect(()=>{var f;De.current=-1,(f=he.current)==null||f.setMaterialTexture(null),Ke.current=!0},[G]),w.useEffect(()=>{Ke.current=!0,!A&&ze(Fe.current)},[r,ze,P,A]),w.useEffect(()=>{if(!A)return;let f=0,b=!1,y=performance.now();const E=async j=>{const X=Math.min((j-y)/1e3,.1);y=j;let B=Ke.current;Ke.current=!1,_&&(Fe.current+=X,(C||R)&&(B=!0)),D&&Me()&&(B=!0),B&&await ze(Fe.current),b||(f=requestAnimationFrame(E))};return f=requestAnimationFrame(E),()=>{b=!0,cancelAnimationFrame(f)}},[A,_,C,R,D,ze,Me]),w.useEffect(()=>()=>{var f;Te.current+=1,qe.current+=1,(f=he.current)==null||f.dispose(),he.current=null},[]);const K=w.useCallback((f,b)=>i(f,b),[i]),de=w.useCallback((f,b)=>K(y=>({...y,mark:{...y.mark,layers:y.mark.layers.map(E=>f[E.id]?{...E,...typeof f[E.id]=="function"?f[E.id](E):f[E.id]}:E)}}),b),[K]),Ne=w.useCallback((f,b,y)=>de({[f]:b},y?`layer-${f}-${y}`:void 0),[de]),Se=w.useCallback(f=>ve.current.mark.layers.length+f<=na?!0:($e.toast.error(`A mark can have up to ${na} layers.`),!1),[]),ce=w.useCallback(f=>{Se(1)&&(K(b=>({...b,preset:null,mark:{...b.mark,layers:[...b.mark.layers,f]}})),c([f.id]),t||h("edit"))},[K,t,Se]),Pe=w.useCallback((f,b,y=!0)=>{const E=ve.current.mark.layers.filter(B=>f.includes(B.id));if(!E.length||!Se(E.length))return[];const j=new Map(E.map(B=>[B.id,Wo(B,y?{x:(B.x??0)+.08,y:(B.y??0)+.08}:{})]));K(B=>{const Z=[];return B.mark.layers.forEach(V=>{Z.push(V),j.has(V.id)&&Z.push(j.get(V.id))}),{...B,preset:null,mark:{...B.mark,layers:Z}}},b);const X=[...j.values()];return c(X.map(B=>B.id)),X},[K,Se]),Re=w.useCallback(f=>K(b=>{const y=b.mark.layers.filter(E=>!f.includes(E.id));return y.length?{...b,mark:{...b.mark,layers:y}}:b}),[K]),je=w.useCallback((f,b)=>K(y=>{const E=[...y.mark.layers],j=E.filter(Z=>f.includes(Z.id));if(!j.length)return y;if(b==="front"||b==="back"){const Z=E.filter(V=>!f.includes(V.id));return{...y,mark:{...y.mark,layers:b==="front"?[...Z,...j]:[...j,...Z]}}}const X=b==="forward"?1:-1;return(X>0?[...E.keys()].reverse():[...E.keys()]).forEach(Z=>{if(!f.includes(E[Z].id))return;const V=Z+X;V<0||V>=E.length||f.includes(E[V].id)||([E[Z],E[V]]=[E[V],E[Z]])}),{...y,mark:{...y.mark,layers:E}}}),[K]),Ae=w.useCallback(()=>ve.current.mark.layers.filter(f=>Ee.current.includes(f.id)),[]),Xe=w.useCallback(f=>{const b=ve.current,y=Ae().filter(Z=>Z.visible!==!1);if(!y.length)return;const[E,j]=zs(b.artboard),X=y.length===1?{minX:-E,maxX:E,cx:0,minY:-j,maxY:j,cy:0}:ia(y.map(Z=>aa(Z,b.mark))),B={};y.forEach(Z=>{const V=aa(Z,b.mark),ke=Qe(Z,b.mark).center;let Y=0,fe=0;f==="left"&&(Y=X.minX-V.minX),f==="hcenter"&&(Y=X.cx-V.cx),f==="right"&&(Y=X.maxX-V.maxX),f==="top"&&(fe=X.minY-V.minY),f==="vcenter"&&(fe=X.cy-V.cy),f==="bottom"&&(fe=X.maxY-V.maxY),B[Z.id]=ct(Z,b.mark,[ke[0]+Y,ke[1]+fe])}),de(B)},[Ae,de]),wt=w.useCallback(f=>{const b=ve.current,y=Ae().filter(V=>V.visible!==!1);if(y.length<3)return;const E=f==="x"?0:1,j=y.map(V=>({layer:V,center:Qe(V,b.mark).center})).sort((V,ke)=>V.center[E]-ke.center[E]),X=j[0].center[E],B=j[j.length-1].center[E],Z={};j.forEach((V,ke)=>{const Y=[...V.center];Y[E]=X+(B-X)*ke/(j.length-1),Z[V.layer.id]=ct(V.layer,b.mark,Y)}),de(Z)},[Ae,de]),Ie=w.useCallback(f=>{const b=ve.current,y=Ae();if(!y.length)return;const E=y.length>1?(X=>[X.cx,X.cy])(ia(y.map(X=>aa(X,b.mark)))):null,j={};y.forEach(X=>{j[X.id]=hl(X,b.mark,f,E)}),de(j)},[Ae,de]),Ze=w.useCallback(()=>{const f=Ae();if(!f.length)return;const b=f.every(y=>y.visible===!1);de(Object.fromEntries(f.map(y=>[y.id,{visible:b}])))},[Ae,de]),Oa=w.useCallback(f=>{if(!(f!=null&&f.length)||!Se(f.length))return;const b=new Set(ve.current.mark.layers.map(E=>E.id)),y=f.map(E=>Wo(E,b.has(E.id)?{x:(E.x??0)+.06,y:(E.y??0)+.06}:{}));K(E=>({...E,preset:null,mark:{...E.mark,layers:[...E.mark.layers,...y]}})),c(y.map(E=>E.id))},[K,Se]),Xa=w.useCallback((f,{toggle:b=!1}={})=>{c(y=>b?y.includes(f)?y.filter(E=>E!==f):[...y,f]:[f])},[]),Xt=w.useMemo(()=>({select:c,selectLayer:Xa,updateLayer:Ne,updateLayers:de,addShape:f=>ce(ua(f,{size:.34,x:.5,y:-.5,op:ve.current.mark.layers.length?"exclude":"add"})),addText:()=>ce(rs("Mark",{size:.6,op:ve.current.mark.layers.length?"cut":"add"})),upload:()=>{var f;return(f=we.current)==null?void 0:f.click()},removeLayer:f=>Re([f]),removeSelection:()=>Re(Ee.current),duplicateLayer:f=>Pe([f]),duplicateSelection:()=>Pe(Ee.current),moveLayer:(f,b)=>K(y=>{const E=[...y.mark.layers],j=E.findIndex(B=>B.id===f);if(j<0)return y;const[X]=E.splice(j,1);return E.splice(b,0,X),{...y,mark:{...y.mark,layers:E}}}),reorderSelection:f=>je(Ee.current,f),toggleLayer:(f,b)=>Ne(f,{visible:b}),toggleSelectionVisibility:Ze,alignSelection:Xe,distributeSelection:wt,flipSelection:Ie,setSelectionOp:f=>K(b=>({...b,mark:{...b.mark,layers:b.mark.layers.map((y,E)=>E>0&&Ee.current.includes(y.id)?{...y,op:f}:y)}})),setFill:(f,b)=>K(y=>({...y,fill:{...y.fill,ink:!1,...f}}),b&&`fill-${b}`),setEffect:(f,b,y)=>K(E=>({...E,effects:{...E.effects,[f]:{...E.effects[f],...b}}}),y&&`effect-${y}`),setMark:(f,b)=>K(y=>({...y,mark:{...y.mark,...f}}),b),setArtboard:f=>K(b=>({...b,artboard:{...b.artboard,...f}})),setBackground:(f,b)=>K(y=>({...y,artboard:{...y.artboard,background:{...y.artboard.background,...f}}}),b),setMaterialProp:(f,b)=>K(y=>({...y,material:{...y.material,props:{...y.material.props,[f]:b}}}),`material-${f}`),setMaterialBase:f=>K(b=>({...b,material:{...b.material,base:f}}),"material-base"),applyLook:async f=>{const b=Oe(ve.current).entry,y=b?await Qo(b):null;if(!y)return;const E=da(b),j=y.resolve(f,{light:!1,defaults:E,props:E});K(X=>{var B;return((B=X.material)==null?void 0:B.id)===`bg:${b.id}`?{...X,material:{...X.material,look:f,lookProps:j,props:{}}}:X})},setMorph:(f,b)=>K(y=>{const E={...y.morph,...f};return E.on&&!E.target&&(E.target=Yo(za[y.preset==="m-astroid"?"m-metaball":"m-astroid"])),{...y,morph:E}},b),setMorphTarget:f=>K(b=>({...b,morph:{...b.morph,target:Yo(za[f])}}))}),[Xa,Ne,de,ce,Re,Pe,K,je,Ze,Xe,wt,Ie]),Ds=w.useCallback(f=>{const b=Ca(f,{light:s});K(y=>{var E;return{...y,preset:f.id,name:f.name,mark:b.mark,fill:((E=y.material)==null?void 0:E.id)==="flat"||!y.material?b.fill:y.fill,effects:{...y.effects,glow:b.effects.glow,gloss:b.effects.gloss}}}),c([]),ue(!1)},[K,s]),Ns=w.useCallback(async f=>{var y,E;const b=++qe.current;if(f.kind==="procedural")try{await(((y=ye())==null?void 0:y.prepareAsync(f.def))??Promise.resolve())}catch(j){b===qe.current&&$e.toast.error(((E=j==null?void 0:j.message)==null?void 0:E.slice(0,160))||"That material could not start.");return}b===qe.current&&K(j=>{var Z,V,ke;const X=Zo(f),B=X===Zo(Oe(j));return f.kind==="procedural"?{...j,material:{id:f.id,props:{},preset:f.id},effects:X==="auto"&&!B?{...j.effects,gloss:Ko}:j.effects}:f.kind==="flat"?{...j,material:{id:"flat",props:{},preset:f.id},fill:{...j.fill,extent:1,stops:2,ink:!1,...f.fill},effects:{...j.effects,glow:(Z=f.effects)!=null&&Z.glow?{...Ft.glow,...f.effects.glow}:{...j.effects.glow,on:!1},gloss:(V=f.effects)!=null&&V.gloss?{...Ft.gloss,...f.effects.gloss}:{...j.effects.gloss,on:!1}}}:f.kind==="metal"?{...j,material:{id:"metal",props:{...f.props},preset:f.id}}:{...j,material:{id:f.id,props:{},base:((ke=j.material)==null?void 0:ke.base)??"#0c0b10",preset:f.id},effects:B?j.effects:{...j.effects,gloss:Ko}}})},[K,ye]),Ht=w.useCallback(async f=>{if(!Ho(f)){$e.toast.error("Use an SVG, PNG, JPG or WebP logo.");return}try{const b=await D0(f),y=f.name.replace(/\.[^.]+$/,"")||"Logo",E=ls({name:y,src:b,key:`${f.name}:${f.size}:${f.lastModified}`},{size:.86});await Dt(E),K(j=>({...j,preset:null,name:y,mark:{...j.mark,scale:1,rotation:0,layers:[E]},fill:{...j.fill,kind:"logo"},material:{id:"flat",props:{}},morph:{...j.morph,on:!1}})),c([E.id]),ue(!0),$e.toast.success("Logo added. Pick a material to style it."),a?v("materials"):h("materials")}catch(b){$e.toast.error((b==null?void 0:b.message)||"That logo could not be read.")}},[K,a]);w.useEffect(()=>{let f=0;const b=Y=>{var fe;return[...((fe=Y.dataTransfer)==null?void 0:fe.types)||[]].includes("Files")},y=Y=>{b(Y)&&(f+=1,pe(!0))},E=Y=>{b(Y)&&(f=Math.max(0,f-1),f||pe(!1))},j=Y=>{b(Y)&&Y.preventDefault()},X=Y=>{var Be,He;if(!b(Y))return;Y.preventDefault(),f=0,pe(!1);const fe=(He=(Be=Y.dataTransfer)==null?void 0:Be.files)==null?void 0:He[0];fe&&Ht(fe)},B=Y=>{var Be;if(Sa(Y.target))return!1;const fe=ve.current.mark.layers.filter(He=>Ee.current.includes(He.id));return fe.length?(Pa=fe,(Be=Y.clipboardData)==null||Be.setData("text/plain",JSON.stringify({[Go]:1,layers:fe})),Y.preventDefault(),!0):!1},Z=Y=>{B(Y)},V=Y=>{B(Y)&&Re(Ee.current)},ke=Y=>{var Ka,Za;const fe=[...((Ka=Y.clipboardData)==null?void 0:Ka.files)||[]].find(Ho);if(fe){Y.preventDefault(),Ht(fe);return}if(Sa(Y.target))return;const Be=(Za=Y.clipboardData)==null?void 0:Za.getData("text/plain");let He=null;if(Be)try{const kt=JSON.parse(Be);kt!=null&&kt[Go]&&Array.isArray(kt.layers)&&(He=kt.layers)}catch{He=null}!He&&!Be&&Pa&&(He=Pa),He&&(Y.preventDefault(),Oa(He))};return window.addEventListener("dragenter",y),window.addEventListener("dragleave",E),window.addEventListener("dragover",j),window.addEventListener("drop",X),window.addEventListener("copy",Z),window.addEventListener("cut",V),window.addEventListener("paste",ke),()=>{window.removeEventListener("dragenter",y),window.removeEventListener("dragleave",E),window.removeEventListener("dragover",j),window.removeEventListener("drop",X),window.removeEventListener("copy",Z),window.removeEventListener("cut",V),window.removeEventListener("paste",ke)}},[Ht,Oa,Re]);const Bs=w.useCallback(()=>{ne(f=>(F0(!f),!f))},[]),Ha=A,Vt=w.useRef(null);Vt.current=f=>{var X;if(Sa(f.target)||O)return;const b=f.metaKey||f.ctrlKey,y=f.key.toLowerCase(),E=f.code,j=m.length>0;if(b&&y==="z")f.preventDefault(),f.shiftKey?o.redo():o.undo();else if(b&&y==="y")f.preventDefault(),o.redo();else if(b&&y==="d")f.preventDefault(),j&&Pe(m);else if(b&&y==="a")f.preventDefault(),c(r.mark.layers.map(B=>B.id));else if(b&&y==="o")f.preventDefault(),(X=we.current)==null||X.click();else if(b&&f.shiftKey&&y==="h")f.preventDefault(),Ze();else if(b&&(E==="BracketRight"||E==="BracketLeft")){if(f.preventDefault(),!j)return;const B=E==="BracketRight";je(m,f.shiftKey?B?"front":"back":B?"forward":"backward")}else{if(b)return;if(f.altKey&&j&&["KeyA","KeyD","KeyH","KeyW","KeyS","KeyV"].includes(E))f.preventDefault(),Xe({KeyA:"left",KeyD:"right",KeyH:"hcenter",KeyW:"top",KeyS:"bottom",KeyV:"vcenter"}[E]);else if(f.shiftKey&&j&&(y==="h"||y==="v"))f.preventDefault(),Ie(y==="h"?"x":"y");else if((y==="backspace"||y==="delete")&&j)f.preventDefault(),Re(m),c([]);else if(y==="escape")c([]);else if(y==="e")ae(!0);else if(y==="t")Xt.addText();else if(y===" "&&Ha)f.preventDefault(),U(B=>!B);else if(y==="/")f.preventDefault(),requestAnimationFrame(()=>{var B;return(B=We.current)==null?void 0:B.focus()});else if(j&&y.startsWith("arrow")){f.preventDefault();const B=f.shiftKey?.05:.01,Z=y==="arrowleft"?-B:y==="arrowright"?B:0,V=y==="arrowup"?-B:y==="arrowdown"?B:0,ke=ve.current,Y={};ke.mark.layers.filter(fe=>m.includes(fe.id)).forEach(fe=>{const Be=Qe(fe,ke.mark).center;Y[fe.id]=ct(fe,ke.mark,[Be[0]+Z,Be[1]+V])}),de(Y,"nudge")}}},w.useEffect(()=>{const f=b=>{var y;return(y=Vt.current)==null?void 0:y.call(Vt,b)};return window.addEventListener("keydown",f),()=>window.removeEventListener("keydown",f)},[]),w.useEffect(()=>{c(f=>{const b=f.filter(y=>r.mark.layers.some(E=>E.id===y));return b.length===f.length?f:b})},[r]);const Us=w.useCallback(f=>{c([f]),le(b=>b+1),t||h("edit")},[t]),$s=((Va=r.material)==null?void 0:Va.preset)||(((Ya=r.material)==null?void 0:Ya.id)==="flat"?null:(Wa=r.material)==null?void 0:Wa.id),va=f=>f==="marks"?n.jsx(Nl,{thumbs:_e,activeId:r.preset,onApply:Ds,query:p.marks||""}):n.jsx(Bl,{thumbs:_e,activeId:$s,light:s,onApply:Ns,query:p.materials||""}),ga=f=>n.jsx(Hs,{inputRef:We,value:p[f]??"",onChange:b=>u(y=>({...y,[f]:b})),placeholder:f==="materials"?`Search ${Ba.length} materials`:`Search ${Gt.length} marks`}),xa=n.jsx(Dl,{doc:r,selection:m,thumbs:_e,history:o,actions:Xt,focusText:re}),Gs=J&&n.jsx("iframe",{ref:$.iframeRef,src:$.src,title:"Material preview",className:"smg-material","data-ready":$.status==="ready"?"":void 0,"data-source":D?"":void 0,tabIndex:-1});return n.jsxs("div",{className:"lab smg","data-layout":a?"wide":t?"desktop":"compact",children:[n.jsx("input",{ref:we,type:"file",accept:"image/svg+xml,image/png,image/jpeg,image/webp,.svg,.png,.jpg,.jpeg,.webp",hidden:!0,onChange:f=>{var y;const b=(y=f.target.files)==null?void 0:y[0];b&&Ht(b),f.target.value=""}}),a&&n.jsxs("aside",{className:"lab-rail","aria-label":"Marks and materials",children:[e,n.jsx(at,{label:"Library",value:d,options:q0,onChange:v,className:"lab-rail-tabs"}),ga(d),n.jsx(Ja,{children:va(d)})]}),n.jsxs("section",{className:"lab-main","aria-label":"Editor",children:[n.jsx(kl,{thumbs:_e,canPlay:Ha,playing:_,snapping:ee,onToggleSnapping:Bs,onTogglePlay:()=>U(f=>!f),onUpload:()=>{var f;return(f=we.current)==null?void 0:f.click()},onAddShape:f=>Xt.addShape(f),onAddText:Xt.addText,onExport:()=>ae(!0)}),n.jsx(zl,{canvasRef:se,doc:r,selection:m,onSelect:c,onLayersChange:de,onDuplicate:(f,b)=>Pe(f,b,!1),onEditText:Us,onMeasure:M,material:Gs,dropping:oe,hint:t&&!ge,snapping:ee,padding:t?40:14,onUpload:()=>{var f;return(f=we.current)==null?void 0:f.click()},onPointerFeed:J?tt:void 0})]}),a?xa:t?n.jsxs("aside",{className:"lab-side","aria-label":"Library and settings",children:[e,n.jsx(at,{label:"Panels",value:x,options:Oo,onChange:h,className:"lab-mobile-tabs"}),x==="edit"?xa:n.jsxs(n.Fragment,{children:[ga(x),n.jsx(Ja,{children:va(x)})]})]}):n.jsxs("section",{className:"lab-mobile","aria-label":"Library and settings",children:[n.jsx(at,{label:"Panels",value:x,options:Oo,onChange:h,className:"lab-mobile-tabs"}),x==="edit"?xa:n.jsxs(n.Fragment,{children:[ga(x),n.jsx("div",{className:"lab-mobile-gallery",children:va(x)})]})]}),O&&n.jsx(C0,{doc:r,light:s,onClose:()=>ae(!1)})]})}const Ko={...Ft.gloss,on:!0},Zo=e=>e?e.kind==="procedural"?e.def.kind==="fill"?"auto":"shape":e.kind==="background"?"auto":e.kind||"flat":"flat";export{K0 as default};
