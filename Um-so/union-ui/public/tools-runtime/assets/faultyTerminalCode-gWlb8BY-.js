const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import './FaultyTerminal.css';\r
\r
const INTRO_SECONDS = 2;\r
const MAX_CLICKS = 4;\r
const CLICK_SECONDS = { glitch: 0.7, degauss: 1.6 };\r
const GLYPHS = { blocks: 0, dots: 1, characters: 2 };\r
const CLICKS = { none: 0, glitch: 1, degauss: 2 };\r
\r
const FONT = [\r
  ['.###.', '#..##', '#.#.#', '##..#', '.###.'],\r
  ['..#..', '.##..', '..#..', '..#..', '.###.'],\r
  ['####.', '....#', '.###.', '#....', '#####'],\r
  ['####.', '....#', '.###.', '....#', '####.'],\r
  ['#..#.', '#..#.', '#####', '...#.', '...#.'],\r
  ['#####', '#....', '####.', '....#', '####.'],\r
  ['.###.', '#....', '####.', '#...#', '.###.'],\r
  ['#####', '....#', '...#.', '..#..', '..#..'],\r
  ['.###.', '#...#', '.###.', '#...#', '.###.'],\r
  ['.###.', '#...#', '.####', '....#', '.###.'],\r
  ['.###.', '#...#', '#####', '#...#', '#...#'],\r
  ['####.', '#...#', '####.', '#...#', '####.'],\r
  ['.####', '#....', '#....', '#....', '.####'],\r
  ['####.', '#...#', '#...#', '#...#', '####.'],\r
  ['#####', '#....', '####.', '#....', '#####'],\r
  ['#####', '#....', '####.', '#....', '#....'],\r
  ['.....', '..#..', '.###.', '..#..', '.....'],\r
  ['.....', '.....', '.###.', '.....', '.....'],\r
  ['.#...', '..#..', '...#.', '..#..', '.#...'],\r
  ['....#', '...#.', '..#..', '.#...', '#....'],\r
  ['.....', '#.#.#', '.###.', '#.#.#', '.....'],\r
  ['.....', '#####', '.....', '#####', '.....'],\r
  ['.....', '.....', '.....', '.....', '#####']\r
];\r
\r
const FONT_BITS = FONT.map(rows =>\r
  rows.reduce((bits, row, r) => {\r
    let value = bits;\r
    for (let c = 0; c < 5; c++) if (row[c] === '#') value += 2 ** (r * 5 + c);\r
    return value;\r
  }, 0)\r
);\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PATTERN = \`\r
float time;\r
\r
float noise(vec2 p) {\r
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2;\r
}\r
\r
mat2 rotate(float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  return mat2(c, -s, s, c);\r
}\r
\r
float fbm(vec2 p) {\r
  p *= 1.1;\r
  float f = 0.0;\r
  float amp = 0.5 * uNoiseAmp;\r
  mat2 modify0 = rotate(time * 0.02);\r
  f += amp * noise(p);\r
  p = modify0 * p * 2.0;\r
  amp *= 0.454545;\r
  mat2 modify1 = rotate(time * 0.02);\r
  f += amp * noise(p);\r
  p = modify1 * p * 2.0;\r
  amp *= 0.454545;\r
  f += amp * noise(p);\r
  return f;\r
}\r
\r
float pattern(vec2 p) {\r
  vec2 offset1 = vec2(1.0);\r
  vec2 offset0 = vec2(0.0);\r
  mat2 rot01 = rotate(0.1 * time);\r
  mat2 rot1 = rotate(0.1);\r
  vec2 q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));\r
  vec2 r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));\r
  return fbm(p + r);\r
}\r
\`;\r
\r
const CELL_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform float iTime;\r
uniform vec2 uGridMul;\r
uniform float uNoiseAmp;\r
uniform float uScale;\r
uniform vec2 uMouse;\r
uniform float uMouseStrength;\r
uniform float uUseMouse;\r
uniform float uPageLoadProgress;\r
uniform float uUsePageLoadAnimation;\r
uniform ivec2 uOrigin;\r
uniform sampler2D uPrev0;\r
uniform sampler2D uPrev1;\r
uniform float uDecay;\r
uniform float uFresh;\r
uniform float uHover;\r
\r
layout(location = 0) out vec4 outRings;\r
layout(location = 1) out vec4 outExtra;\r
\${PATTERN}\r
void main() {\r
  time = iTime * 0.333333;\r
  ivec2 texel = ivec2(gl_FragCoord.xy);\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 s = vec2(texel + uOrigin) / grid;\r
  float intensity = pattern(s * 0.1) * 1.3 - 0.03;\r
  float lift = 0.0;\r
  float strike = 0.0;\r
\r
  if (uUseMouse > 0.5) {\r
    vec2 mouseWorld = uMouse * uScale;\r
    float distToMouse = distance(s, mouseWorld);\r
    float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;\r
    intensity += mouseInfluence;\r
    float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;\r
    intensity += ripple;\r
    lift = mouseInfluence;\r
  }\r
\r
  if (uUsePageLoadAnimation > 0.5) {\r
    float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);\r
    float cellDelay = cellRandom * 0.8;\r
    float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);\r
    float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);\r
    intensity *= fadeAlpha;\r
    strike = sin(3.14159265 * cellProgress) * step(0.1, intensity);\r
  }\r
\r
  vec4 on0 = step(vec4(0.1), intensity - vec4(0.0, 1.0, 2.0, 4.0) * 0.0625);\r
  vec2 on1 = step(vec2(0.1), intensity - vec2(5.0, 8.0) * 0.0625);\r
  float level = clamp((intensity - 0.1) / 0.6, 0.0, 1.0);\r
  float heat = max(clamp(lift / 3.0, 0.0, 1.0) * uHover, strike);\r
\r
  vec4 prev0 = texelFetch(uPrev0, texel, 0) * (1.0 - uFresh);\r
  vec4 prev1 = texelFetch(uPrev1, texel, 0) * (1.0 - uFresh);\r
  vec4 fade0 = max(prev0 * uDecay - 1.0 / 255.0, 0.0);\r
  vec4 fade1 = max(prev1 * uDecay - 1.0 / 255.0, 0.0);\r
\r
  outRings = max(on0, fade0);\r
  outExtra = vec4(max(on1, fade1.xy), max(level, fade1.z), max(heat, fade1.w));\r
}\`;\r
\r
const fontArray = \`const uint FONT[\${FONT_BITS.length}] = uint[\${FONT_BITS.length}](\${FONT_BITS.map(\r
  bits => \`\${bits}u\`\r
).join(', ')});\`;\r
\r
const MAIN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform float iTime;\r
uniform vec3 iResolution;\r
uniform float uScale;\r
uniform vec2 uGridMul;\r
uniform float uDigitSize;\r
uniform float uScanlineIntensity;\r
uniform float uGlitchAmount;\r
uniform float uFlickerAmount;\r
uniform float uChromaticAberration;\r
uniform float uDither;\r
uniform float uCurvature;\r
uniform vec3 uTint;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform sampler2D uRings0;\r
uniform sampler2D uRings1;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCellCount;\r
uniform int uGlyphs;\r
uniform float uGlow;\r
uniform float uScramble;\r
uniform float uMouseGlow;\r
uniform float uVignette;\r
uniform vec4 uClicks[\${MAX_CLICKS}];\r
uniform int uClickMode;\r
uniform float uClickSeconds;\r
uniform float uClock;\r
\r
out vec4 outColor;\r
\r
\${fontArray}\r
\r
float time;\r
float clickTear;\r
float clickSplit;\r
float pixelHeat;\r
\r
float hash21(vec2 p) {\r
  p = fract(p * 234.56);\r
  p += dot(p, p + 34.56);\r
  return fract(p.x * p.y);\r
}\r
\r
float hashCell(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
ivec2 cellTexel(vec2 cell) {\r
  return clamp(ivec2(cell) - uOrigin, ivec2(0), uCellCount - 1);\r
}\r
\r
float ringValue(float n, vec4 r0, vec4 r1) {\r
  if (n < 0.5) return r0.x;\r
  if (n < 1.5) return r0.y;\r
  if (n < 2.5) return r0.z;\r
  if (n < 4.5) return r0.w;\r
  if (n < 5.5) return r1.x;\r
  return r1.y;\r
}\r
\r
float digit(vec2 p) {\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 cell = floor(p * grid);\r
  ivec2 texel = cellTexel(cell);\r
  vec4 r0 = texelFetch(uRings0, texel, 0);\r
  vec4 r1 = texelFetch(uRings1, texel, 0);\r
  float boost = 1.0 + r1.w * uMouseGlow * 1.3;\r
  pixelHeat = max(pixelHeat, r1.w);\r
  p = fract(p * grid);\r
  p *= uDigitSize;\r
\r
  float px5 = p.x * 5.0;\r
  float py5 = (1.0 - p.y) * 5.0;\r
  float x = fract(px5);\r
  float y = fract(py5);\r
  float i = floor(py5) - 2.0;\r
  float j = floor(px5) - 2.0;\r
  float inside = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);\r
\r
  if (uGlyphs == 2) {\r
    float rate = 1.2 + r1.w * uScramble * 18.0;\r
    float phase = hashCell(cell * 1.37 + 4.1);\r
    float epoch = floor(iTime * rate + phase * 7.0);\r
    float pick = hashCell(cell + vec2(epoch * 0.731, epoch * 1.913));\r
    uint glyph = FONT[int(min(pick * float(FONT.length()), float(FONT.length()) - 1.0))];\r
    int bit = int(i + 2.0) * 5 + int(j + 2.0);\r
    float lit = float((glyph >> uint(clamp(bit, 0, 24))) & 1u);\r
    float glow = max(r0.x, r1.z);\r
    float shade = 0.35 + 0.65 * r1.z;\r
    return inside * lit * glow * shade * boost * (0.2 + y * 0.8) * (0.75 + x * 0.25);\r
  }\r
\r
  float n = i * i + j * j;\r
  float on = ringValue(n, r0, r1);\r
  if (uGlyphs == 1) {\r
    vec2 d = vec2(x, y) - 0.5;\r
    float radius = 0.36 + 0.06 * on;\r
    float edge = fwidth(px5) * 0.75;\r
    float dot = 1.0 - smoothstep(radius - edge, radius + edge, length(d));\r
    return inside * on * dot * boost * (0.55 + 0.45 * (1.0 - length(d) / 0.5));\r
  }\r
  float brightness = on * (0.2 + y * 0.8) * (0.75 + x * 0.25);\r
  return inside * brightness * boost;\r
}\r
\r
float onOff(float a, float b, float c) {\r
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;\r
}\r
\r
float displace(vec2 look) {\r
  float y = look.y - mod(iTime * 0.25, 1.0);\r
  float window = 1.0 / (1.0 + 50.0 * y * y);\r
  return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;\r
}\r
\r
vec2 getLight(vec2 p) {\r
  float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;\r
  bar *= uScanlineIntensity;\r
\r
  float displacement = displace(p);\r
  p.x += displacement;\r
\r
  if (uGlitchAmount != 1.0) {\r
    float extra = displacement * (uGlitchAmount - 1.0);\r
    p.x += extra;\r
  }\r
\r
  p.x += clickTear;\r
\r
  float middle = digit(p);\r
\r
  const float off = 0.002;\r
  float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +\r
              digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +\r
              digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));\r
\r
  return vec2(0.9 * middle, sum * 0.1 * bar);\r
}\r
\r
float glowAt(vec2 p) {\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 cell = floor(p * grid);\r
  vec2 cellPx = iResolution.xy / (uScale * grid);\r
  float sigma = 0.5 * min(cellPx.x, cellPx.y);\r
  float center = 0.5 * min(1.0, 1.0 / max(uDigitSize, 0.001));\r
  float total = 0.0;\r
  for (int oy = -1; oy <= 1; oy++) {\r
    for (int ox = -1; ox <= 1; ox++) {\r
      vec2 c = cell + vec2(float(ox), float(oy));\r
      ivec2 texel = cellTexel(c);\r
      vec4 r0 = texelFetch(uRings0, texel, 0);\r
      vec4 r1 = texelFetch(uRings1, texel, 0);\r
      float emission = uGlyphs == 2\r
        ? max(r0.x, r1.z) * (0.35 + 0.65 * r1.z) * 0.45\r
        : (r0.x + 4.0 * (r0.y + r0.z + r0.w + r1.y) + 8.0 * r1.x) / 25.0;\r
      emission *= 1.0 + r1.w * uMouseGlow * 1.6;\r
      vec2 d = (p - (c + center) / grid) * iResolution.xy / uScale;\r
      total += emission * exp(-dot(d, d) / (2.0 * sigma * sigma));\r
    }\r
  }\r
  return total;\r
}\r
\r
vec2 barrel(vec2 uv) {\r
  vec2 c = uv * 2.0 - 1.0;\r
  float r2 = dot(c, c);\r
  c *= 1.0 + uCurvature * r2;\r
  return c * 0.5 + 0.5;\r
}\r
\r
void main() {\r
  time = iTime * 0.333333;\r
  vec2 uv = gl_FragCoord.xy / iResolution.xy;\r
\r
  if (uCurvature != 0.0) {\r
    uv = barrel(uv);\r
  }\r
\r
  clickTear = 0.0;\r
  clickSplit = 0.0;\r
  if (uClickMode > 0) {\r
    for (int k = 0; k < \${MAX_CLICKS}; k++) {\r
      vec4 click = uClicks[k];\r
      if (click.w <= 0.0) continue;\r
      float age = uClock - click.z;\r
      if (age < 0.0 || age > uClickSeconds) continue;\r
      float life = age / uClickSeconds;\r
      float envelope = (1.0 - life) * (1.0 - life);\r
      if (uClickMode == 1) {\r
        float tick = floor(age * 30.0);\r
        float bands = 14.0 + 26.0 * hashCell(vec2(click.z, tick * 0.37));\r
        float row = floor(uv.y * bands);\r
        float pickRow = hashCell(vec2(row + tick * 7.0, click.z * 17.0));\r
        float torn = step(0.42, pickRow);\r
        float reach = exp(-abs(uv.y - click.y) * 2.5);\r
        float shift = (hashCell(vec2(row * 1.7 + tick, click.z)) - 0.5) * 0.22;\r
        clickTear += shift * torn * envelope * reach;\r
        clickSplit = max(clickSplit, envelope * reach * (0.4 + 0.6 * torn));\r
      } else {\r
        vec2 aspect = vec2(iResolution.x / iResolution.y, 1.0);\r
        vec2 delta = (uv - click.xy) * aspect;\r
        float dist = length(delta);\r
        float front = age * 1.6;\r
        float band = exp(-pow((dist - front) / 0.18, 2.0));\r
        float wave = sin((dist - front) * 40.0) * band;\r
        uv += delta / aspect * wave * 0.05 * envelope;\r
        clickSplit = max(clickSplit, envelope * band);\r
      }\r
    }\r
  }\r
\r
  vec2 p = uv * uScale;\r
  pixelHeat = 0.0;\r
  vec2 lightG = getLight(p);\r
  float heat = pixelHeat;\r
  vec2 lightR = lightG;\r
  vec2 lightB = lightG;\r
\r
  float split = uChromaticAberration + clickSplit * 6.0;\r
  if (split != 0.0) {\r
    vec2 ca = vec2(split) / iResolution.xy;\r
    lightR = getLight(p + ca);\r
    lightB = getLight(p - ca);\r
  }\r
\r
  if (uGlow > 0.0) {\r
    float bloom = uGlow * 0.2 * glowAt(p);\r
    lightR.y += bloom;\r
    lightG.y += bloom;\r
    lightB.y += bloom;\r
  }\r
\r
  vec3 core = vec3(lightR.x, lightG.x, lightB.x);\r
  vec3 halo = vec3(lightR.y, lightG.y, lightB.y);\r
  vec3 raw = core + halo;\r
\r
  vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
  float peak = max(uTint.r, max(uTint.g, uTint.b));\r
  float phosphor = clamp(uGlow, 0.0, 1.0);\r
  vec3 vividTint = clamp(mix(vec3(dot(uTint, luma)), uTint, 1.0 + 0.8 * phosphor), 0.0, 1.0);\r
  vec3 coreTint = mix(uTint, vec3(peak), phosphor * 0.45 * smoothstep(0.45, 0.9, core));\r
  vec3 col = core * coreTint + halo * vividTint;\r
  col += (vec3(1.0) - uTint) * min(raw, vec3(1.0)) * heat * uMouseGlow * 0.6;\r
  col *= uBrightness;\r
\r
  if (uVignette > 0.0) {\r
    float edge = 0.04 + 0.22 * uVignette;\r
    vec2 fade = smoothstep(vec2(0.0), vec2(edge), uv) * smoothstep(vec2(0.0), vec2(edge), 1.0 - uv);\r
    float mask = fade.x * fade.y;\r
    mask = mask * mask * (3.0 - 2.0 * mask);\r
    float keep = mix(1.0, mask, clamp(uVignette * 1.5, 0.0, 1.0));\r
    col *= keep;\r
    core *= keep;\r
    halo *= keep;\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
    float lum = dot(uTint, luma);\r
    float peak = max(uTint.r, max(uTint.g, uTint.b));\r
    vec3 hue = uTint / max(peak, 0.0001);\r
    vec3 vivid = clamp(mix(vec3(dot(hue, luma)), hue, 1.6), 0.0, 1.0);\r
    vivid = clamp(vivid * (0.3 / max(dot(vivid, luma), 0.0001)), 0.0, 1.0);\r
    vec3 ink = mix(uTint, vivid, smoothstep(0.3, 0.6, lum));\r
    vec3 cover = (core * 1.15 + halo * 0.4) * uBrightness * (1.0 + heat * uMouseGlow * 0.4);\r
    if (uDither > 0.0) cover += (hash21(gl_FragCoord.xy) - 0.5) * (uDither * 0.003922);\r
    cover = clamp(cover, 0.0, 0.94);\r
    float alpha = max(cover.r, max(cover.g, cover.b));\r
    outColor = vec4(alpha - cover * (1.0 - ink), alpha);\r
    return;\r
  }\r
\r
  if (uDither > 0.0) {\r
    float rnd = hash21(gl_FragCoord.xy);\r
    col += (rnd - 0.5) * (uDither * 0.003922);\r
  }\r
\r
  col = clamp(col, 0.0, 1.0);\r
  outColor = vec4(col, max(col.r, max(col.g, col.b)));\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const hexToRgb = hex => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
export default function FaultyTerminal({\r
  scale = 1,\r
  gridMul = [2, 1],\r
  digitSize = 1.5,\r
  timeScale = 0.3,\r
  pause = false,\r
  scanlineIntensity = 0.3,\r
  glitchAmount = 1,\r
  flickerAmount = 1,\r
  noiseAmp = 1,\r
  chromaticAberration = 0,\r
  dither = 0,\r
  curvature = 0.2,\r
  tint = '#ffffff',\r
  mouseReact = true,\r
  mouseStrength = 0.2,\r
  pageLoadAnimation = true,\r
  brightness = 1,\r
  glyphs = 'blocks',\r
  glow = 0.5,\r
  persistence = 0.5,\r
  scramble = 0.5,\r
  mouseGlow = 0.6,\r
  vignette = 0.25,\r
  clickEffect = 'glitch',\r
  variation,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    scale: Math.max(0.05, scale),\r
    gridX: Math.max(0.1, (gridMul?.[0] ?? 2) * 15),\r
    gridY: Math.max(0.1, (gridMul?.[1] ?? 1) * 15),\r
    digitSize,\r
    timeScale,\r
    pause,\r
    scanlineIntensity,\r
    glitchAmount,\r
    flickerAmount,\r
    noiseAmp,\r
    chromaticAberration,\r
    dither: typeof dither === 'boolean' ? (dither ? 1 : 0) : dither,\r
    curvature,\r
    tint,\r
    mouseReact,\r
    mouseStrength,\r
    pageLoadAnimation,\r
    brightness,\r
    glyphs: GLYPHS[glyphs] ?? 0,\r
    glow: clamp(glow, 0, 3),\r
    persistence: clamp(persistence, 0, 1),\r
    scramble: clamp(scramble, 0, 1),\r
    mouseGlow: clamp(mouseGlow, 0, 1),\r
    vignette: clamp(vignette, 0, 1),\r
    clickEffect: CLICKS[clickEffect] ?? 0,\r
    clickSeconds: CLICK_SECONDS[clickEffect] ?? 1,\r
    variation,\r
    lightMode,\r
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
    const cellShader = link(gl, CELL_FRAGMENT);\r
    const mainShader = link(gl, MAIN_FRAGMENT);\r
    if (!cellShader || !mainShader) return undefined;\r
    const cu = cellShader.uniforms;\r
    const mu = mainShader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const makeTexture = () => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      return texture;\r
    };\r
    const targets = [0, 1].map(() => {\r
      const rings = makeTexture();\r
      const extra = makeTexture();\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rings, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, extra, 0);\r
      return { rings, extra, framebuffer };\r
    });\r
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, columns: 1 };\r
    const cells = { x: 0, y: 0, w: 1, h: 1, key: '' };\r
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const mouse = { x: 0.5, y: 0.5 };\r
    const clicks = new Float32Array(MAX_CLICKS * 4);\r
    let clickIndex = 0;\r
    let clock = 0;\r
    let hover = 0;\r
    let current = 0;\r
    let fresh = true;\r
    const seedOffset = settingsRef.current.variation;\r
    const initialOffset = typeof seedOffset === 'number' ? seedOffset * 10 : Math.random() * 100;\r
    let iTime = initialOffset * settingsRef.current.timeScale;\r
    let introClock = settingsRef.current.pageLoadAnimation && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const layoutCells = s => {\r
      const reach = 1 + Math.max(0, s.curvature) * 2;\r
      const uvMin = 0.5 - 0.5 * reach;\r
      const uvMax = 0.5 + 0.5 * reach;\r
      const margin = 0.06 * Math.max(1, Math.abs(s.glitchAmount)) * Math.max(1, Math.abs(s.flickerAmount)) + 0.2;\r
      const gridX = s.gridX * view.columns;\r
      const x0 = Math.floor((uvMin * s.scale - margin) * gridX) - 2;\r
      const x1 = Math.floor((uvMax * s.scale + margin) * gridX) + 2;\r
      const y0 = Math.floor((uvMin * s.scale - margin) * s.gridY) - 2;\r
      const y1 = Math.floor((uvMax * s.scale + margin) * s.gridY) + 2;\r
      const key = \`\${x0}:\${x1}:\${y0}:\${y1}\`;\r
      if (key === cells.key) return;\r
      cells.key = key;\r
      cells.x = x0;\r
      cells.y = y0;\r
      cells.w = Math.max(1, Math.min(4096, x1 - x0 + 1));\r
      cells.h = Math.max(1, Math.min(4096, y1 - y0 + 1));\r
      for (const target of targets) {\r
        for (const texture of [target.rings, target.extra]) {\r
          gl.bindTexture(gl.TEXTURE_2D, texture);\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cells.w, cells.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        }\r
      }\r
      fresh = true;\r
    };\r
\r
    const stepCells = (s, decay) => {\r
      const source = targets[current];\r
      const target = targets[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, cells.w, cells.h);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(cellShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.rings);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, source.extra);\r
      gl.uniform1i(cu.uPrev0, 0);\r
      gl.uniform1i(cu.uPrev1, 1);\r
      gl.uniform1f(cu.iTime, iTime);\r
      gl.uniform2f(cu.uGridMul, (s.gridX * view.columns) / 15, s.gridY / 15);\r
      gl.uniform1f(cu.uNoiseAmp, s.noiseAmp);\r
      gl.uniform1f(cu.uScale, s.scale);\r
      gl.uniform2f(cu.uMouse, mouse.x, mouse.y);\r
      gl.uniform1f(cu.uMouseStrength, s.mouseStrength);\r
      gl.uniform1f(cu.uUseMouse, s.mouseReact ? 1 : 0);\r
      gl.uniform1f(cu.uPageLoadProgress, introClock);\r
      gl.uniform1f(cu.uUsePageLoadAnimation, s.pageLoadAnimation ? 1 : 0);\r
      gl.uniform2i(cu.uOrigin, cells.x, cells.y);\r
      gl.uniform1f(cu.uDecay, decay);\r
      gl.uniform1f(cu.uFresh, fresh ? 1 : 0);\r
      gl.uniform1f(cu.uHover, hover);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      current = 1 - current;\r
      fresh = false;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const source = targets[current];\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(mainShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.rings);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, source.extra);\r
      gl.uniform1i(mu.uRings0, 0);\r
      gl.uniform1i(mu.uRings1, 1);\r
      gl.uniform1f(mu.iTime, iTime);\r
      gl.uniform3f(mu.iResolution, canvas.width, canvas.height, canvas.width / canvas.height);\r
      gl.uniform1f(mu.uScale, s.scale);\r
      gl.uniform2f(mu.uGridMul, (s.gridX * view.columns) / 15, s.gridY / 15);\r
      gl.uniform1f(mu.uDigitSize, s.digitSize);\r
      gl.uniform1f(mu.uScanlineIntensity, s.scanlineIntensity);\r
      gl.uniform1f(mu.uGlitchAmount, reduce ? 0 : s.glitchAmount);\r
      gl.uniform1f(mu.uFlickerAmount, reduce ? 0 : s.flickerAmount);\r
      gl.uniform1f(mu.uChromaticAberration, s.chromaticAberration);\r
      gl.uniform1f(mu.uDither, s.dither);\r
      gl.uniform1f(mu.uCurvature, s.curvature);\r
      gl.uniform3fv(mu.uTint, hexToRgb(s.tint));\r
      gl.uniform1f(mu.uBrightness, s.brightness);\r
      gl.uniform1f(mu.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform2i(mu.uOrigin, cells.x, cells.y);\r
      gl.uniform2i(mu.uCellCount, cells.w, cells.h);\r
      gl.uniform1i(mu.uGlyphs, s.glyphs);\r
      gl.uniform1f(mu.uGlow, s.glow);\r
      gl.uniform1f(mu.uScramble, s.scramble);\r
      gl.uniform1f(mu.uMouseGlow, s.mouseGlow);\r
      gl.uniform1f(mu.uVignette, s.vignette);\r
      gl.uniform4fv(mu.uClicks, clicks);\r
      gl.uniform1i(mu.uClickMode, s.clickEffect);\r
      gl.uniform1f(mu.uClickSeconds, s.clickSeconds);\r
      gl.uniform1f(mu.uClock, clock);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.columns = Math.min(1, view.width / view.height / 1.5);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      layoutCells(s);\r
      stepCells(s, 0);\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!s.pause && !reduce) iTime += dt * s.timeScale;\r
      const targetX = pointer.inside ? pointer.x : 0.5;\r
      const targetY = pointer.inside ? pointer.y : 0.5;\r
      const follow = 1 - Math.exp(-dt / (pointer.inside ? 0.19988 : 0.6));\r
      mouse.x += (targetX - mouse.x) * follow;\r
      mouse.y += (targetY - mouse.y) * follow;\r
      hover += ((pointer.inside ? 1 : 0) - hover) * (1 - Math.exp(-dt / 0.35));\r
      for (let k = 0; k < MAX_CLICKS; k++) {\r
        if (clicks[k * 4 + 3] > 0 && clock - clicks[k * 4 + 2] > s.clickSeconds) clicks[k * 4 + 3] = 0;\r
      }\r
      layoutCells(s);\r
      const decay = s.persistence > 0 ? Math.exp(-dt / (0.08 + s.persistence * 1.4)) : 0;\r
      stepCells(s, decay);\r
      draw();\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      let busy = !(s.pause || reduce) || introClock < 1;\r
      busy = busy || Math.abs(targetX - mouse.x) + Math.abs(targetY - mouse.y) > 0.0001;\r
      busy = busy || Math.abs((pointer.inside ? 1 : 0) - hover) > 0.001;\r
      for (let k = 0; k < MAX_CLICKS; k++) busy = busy || clicks[k * 4 + 3] > 0;\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 2.5) raf = requestAnimationFrame(frame);\r
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
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(rect.width, 1);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(rect.height, 1);\r
      return { x, y, inside: x >= 0 && x <= 1 && y >= 0 && y <= 1 };\r
    };\r
\r
    const onPointerMove = event => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || !s.clickEffect) return;\r
      const o = clickIndex * 4;\r
      clicks[o] = x;\r
      clicks[o + 1] = y;\r
      clicks[o + 2] = clock;\r
      clicks[o + 3] = 1;\r
      clickIndex = (clickIndex + 1) % MAX_CLICKS;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      for (const target of targets) {\r
        gl.deleteTexture(target.rings);\r
        gl.deleteTexture(target.extra);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(cellShader.program);\r
      gl.deleteProgram(mainShader.program);\r
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
      className={\`faulty-terminal-container\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="faulty-terminal-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
`,n=`.faulty-terminal-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
.faulty-terminal-canvas {\r
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
const INTRO_SECONDS = 2;\r
const MAX_CLICKS = 4;\r
const CLICK_SECONDS = { glitch: 0.7, degauss: 1.6 };\r
const GLYPHS = { blocks: 0, dots: 1, characters: 2 };\r
const CLICKS = { none: 0, glitch: 1, degauss: 2 };\r
\r
const FONT = [\r
  ['.###.', '#..##', '#.#.#', '##..#', '.###.'],\r
  ['..#..', '.##..', '..#..', '..#..', '.###.'],\r
  ['####.', '....#', '.###.', '#....', '#####'],\r
  ['####.', '....#', '.###.', '....#', '####.'],\r
  ['#..#.', '#..#.', '#####', '...#.', '...#.'],\r
  ['#####', '#....', '####.', '....#', '####.'],\r
  ['.###.', '#....', '####.', '#...#', '.###.'],\r
  ['#####', '....#', '...#.', '..#..', '..#..'],\r
  ['.###.', '#...#', '.###.', '#...#', '.###.'],\r
  ['.###.', '#...#', '.####', '....#', '.###.'],\r
  ['.###.', '#...#', '#####', '#...#', '#...#'],\r
  ['####.', '#...#', '####.', '#...#', '####.'],\r
  ['.####', '#....', '#....', '#....', '.####'],\r
  ['####.', '#...#', '#...#', '#...#', '####.'],\r
  ['#####', '#....', '####.', '#....', '#####'],\r
  ['#####', '#....', '####.', '#....', '#....'],\r
  ['.....', '..#..', '.###.', '..#..', '.....'],\r
  ['.....', '.....', '.###.', '.....', '.....'],\r
  ['.#...', '..#..', '...#.', '..#..', '.#...'],\r
  ['....#', '...#.', '..#..', '.#...', '#....'],\r
  ['.....', '#.#.#', '.###.', '#.#.#', '.....'],\r
  ['.....', '#####', '.....', '#####', '.....'],\r
  ['.....', '.....', '.....', '.....', '#####']\r
];\r
\r
const FONT_BITS = FONT.map(rows =>\r
  rows.reduce((bits, row, r) => {\r
    let value = bits;\r
    for (let c = 0; c < 5; c++) if (row[c] === '#') value += 2 ** (r * 5 + c);\r
    return value;\r
  }, 0)\r
);\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PATTERN = \`\r
float time;\r
\r
float noise(vec2 p) {\r
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2;\r
}\r
\r
mat2 rotate(float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  return mat2(c, -s, s, c);\r
}\r
\r
float fbm(vec2 p) {\r
  p *= 1.1;\r
  float f = 0.0;\r
  float amp = 0.5 * uNoiseAmp;\r
  mat2 modify0 = rotate(time * 0.02);\r
  f += amp * noise(p);\r
  p = modify0 * p * 2.0;\r
  amp *= 0.454545;\r
  mat2 modify1 = rotate(time * 0.02);\r
  f += amp * noise(p);\r
  p = modify1 * p * 2.0;\r
  amp *= 0.454545;\r
  f += amp * noise(p);\r
  return f;\r
}\r
\r
float pattern(vec2 p) {\r
  vec2 offset1 = vec2(1.0);\r
  vec2 offset0 = vec2(0.0);\r
  mat2 rot01 = rotate(0.1 * time);\r
  mat2 rot1 = rotate(0.1);\r
  vec2 q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));\r
  vec2 r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));\r
  return fbm(p + r);\r
}\r
\`;\r
\r
const CELL_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform float iTime;\r
uniform vec2 uGridMul;\r
uniform float uNoiseAmp;\r
uniform float uScale;\r
uniform vec2 uMouse;\r
uniform float uMouseStrength;\r
uniform float uUseMouse;\r
uniform float uPageLoadProgress;\r
uniform float uUsePageLoadAnimation;\r
uniform ivec2 uOrigin;\r
uniform sampler2D uPrev0;\r
uniform sampler2D uPrev1;\r
uniform float uDecay;\r
uniform float uFresh;\r
uniform float uHover;\r
\r
layout(location = 0) out vec4 outRings;\r
layout(location = 1) out vec4 outExtra;\r
\${PATTERN}\r
void main() {\r
  time = iTime * 0.333333;\r
  ivec2 texel = ivec2(gl_FragCoord.xy);\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 s = vec2(texel + uOrigin) / grid;\r
  float intensity = pattern(s * 0.1) * 1.3 - 0.03;\r
  float lift = 0.0;\r
  float strike = 0.0;\r
\r
  if (uUseMouse > 0.5) {\r
    vec2 mouseWorld = uMouse * uScale;\r
    float distToMouse = distance(s, mouseWorld);\r
    float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;\r
    intensity += mouseInfluence;\r
    float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;\r
    intensity += ripple;\r
    lift = mouseInfluence;\r
  }\r
\r
  if (uUsePageLoadAnimation > 0.5) {\r
    float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);\r
    float cellDelay = cellRandom * 0.8;\r
    float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);\r
    float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);\r
    intensity *= fadeAlpha;\r
    strike = sin(3.14159265 * cellProgress) * step(0.1, intensity);\r
  }\r
\r
  vec4 on0 = step(vec4(0.1), intensity - vec4(0.0, 1.0, 2.0, 4.0) * 0.0625);\r
  vec2 on1 = step(vec2(0.1), intensity - vec2(5.0, 8.0) * 0.0625);\r
  float level = clamp((intensity - 0.1) / 0.6, 0.0, 1.0);\r
  float heat = max(clamp(lift / 3.0, 0.0, 1.0) * uHover, strike);\r
\r
  vec4 prev0 = texelFetch(uPrev0, texel, 0) * (1.0 - uFresh);\r
  vec4 prev1 = texelFetch(uPrev1, texel, 0) * (1.0 - uFresh);\r
  vec4 fade0 = max(prev0 * uDecay - 1.0 / 255.0, 0.0);\r
  vec4 fade1 = max(prev1 * uDecay - 1.0 / 255.0, 0.0);\r
\r
  outRings = max(on0, fade0);\r
  outExtra = vec4(max(on1, fade1.xy), max(level, fade1.z), max(heat, fade1.w));\r
}\`;\r
\r
const fontArray = \`const uint FONT[\${FONT_BITS.length}] = uint[\${FONT_BITS.length}](\${FONT_BITS.map(\r
  bits => \`\${bits}u\`\r
).join(', ')});\`;\r
\r
const MAIN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform float iTime;\r
uniform vec3 iResolution;\r
uniform float uScale;\r
uniform vec2 uGridMul;\r
uniform float uDigitSize;\r
uniform float uScanlineIntensity;\r
uniform float uGlitchAmount;\r
uniform float uFlickerAmount;\r
uniform float uChromaticAberration;\r
uniform float uDither;\r
uniform float uCurvature;\r
uniform vec3 uTint;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform sampler2D uRings0;\r
uniform sampler2D uRings1;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCellCount;\r
uniform int uGlyphs;\r
uniform float uGlow;\r
uniform float uScramble;\r
uniform float uMouseGlow;\r
uniform float uVignette;\r
uniform vec4 uClicks[\${MAX_CLICKS}];\r
uniform int uClickMode;\r
uniform float uClickSeconds;\r
uniform float uClock;\r
\r
out vec4 outColor;\r
\r
\${fontArray}\r
\r
float time;\r
float clickTear;\r
float clickSplit;\r
float pixelHeat;\r
\r
float hash21(vec2 p) {\r
  p = fract(p * 234.56);\r
  p += dot(p, p + 34.56);\r
  return fract(p.x * p.y);\r
}\r
\r
float hashCell(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
ivec2 cellTexel(vec2 cell) {\r
  return clamp(ivec2(cell) - uOrigin, ivec2(0), uCellCount - 1);\r
}\r
\r
float ringValue(float n, vec4 r0, vec4 r1) {\r
  if (n < 0.5) return r0.x;\r
  if (n < 1.5) return r0.y;\r
  if (n < 2.5) return r0.z;\r
  if (n < 4.5) return r0.w;\r
  if (n < 5.5) return r1.x;\r
  return r1.y;\r
}\r
\r
float digit(vec2 p) {\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 cell = floor(p * grid);\r
  ivec2 texel = cellTexel(cell);\r
  vec4 r0 = texelFetch(uRings0, texel, 0);\r
  vec4 r1 = texelFetch(uRings1, texel, 0);\r
  float boost = 1.0 + r1.w * uMouseGlow * 1.3;\r
  pixelHeat = max(pixelHeat, r1.w);\r
  p = fract(p * grid);\r
  p *= uDigitSize;\r
\r
  float px5 = p.x * 5.0;\r
  float py5 = (1.0 - p.y) * 5.0;\r
  float x = fract(px5);\r
  float y = fract(py5);\r
  float i = floor(py5) - 2.0;\r
  float j = floor(px5) - 2.0;\r
  float inside = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);\r
\r
  if (uGlyphs == 2) {\r
    float rate = 1.2 + r1.w * uScramble * 18.0;\r
    float phase = hashCell(cell * 1.37 + 4.1);\r
    float epoch = floor(iTime * rate + phase * 7.0);\r
    float pick = hashCell(cell + vec2(epoch * 0.731, epoch * 1.913));\r
    uint glyph = FONT[int(min(pick * float(FONT.length()), float(FONT.length()) - 1.0))];\r
    int bit = int(i + 2.0) * 5 + int(j + 2.0);\r
    float lit = float((glyph >> uint(clamp(bit, 0, 24))) & 1u);\r
    float glow = max(r0.x, r1.z);\r
    float shade = 0.35 + 0.65 * r1.z;\r
    return inside * lit * glow * shade * boost * (0.2 + y * 0.8) * (0.75 + x * 0.25);\r
  }\r
\r
  float n = i * i + j * j;\r
  float on = ringValue(n, r0, r1);\r
  if (uGlyphs == 1) {\r
    vec2 d = vec2(x, y) - 0.5;\r
    float radius = 0.36 + 0.06 * on;\r
    float edge = fwidth(px5) * 0.75;\r
    float dot = 1.0 - smoothstep(radius - edge, radius + edge, length(d));\r
    return inside * on * dot * boost * (0.55 + 0.45 * (1.0 - length(d) / 0.5));\r
  }\r
  float brightness = on * (0.2 + y * 0.8) * (0.75 + x * 0.25);\r
  return inside * brightness * boost;\r
}\r
\r
float onOff(float a, float b, float c) {\r
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;\r
}\r
\r
float displace(vec2 look) {\r
  float y = look.y - mod(iTime * 0.25, 1.0);\r
  float window = 1.0 / (1.0 + 50.0 * y * y);\r
  return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;\r
}\r
\r
vec2 getLight(vec2 p) {\r
  float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;\r
  bar *= uScanlineIntensity;\r
\r
  float displacement = displace(p);\r
  p.x += displacement;\r
\r
  if (uGlitchAmount != 1.0) {\r
    float extra = displacement * (uGlitchAmount - 1.0);\r
    p.x += extra;\r
  }\r
\r
  p.x += clickTear;\r
\r
  float middle = digit(p);\r
\r
  const float off = 0.002;\r
  float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +\r
              digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +\r
              digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));\r
\r
  return vec2(0.9 * middle, sum * 0.1 * bar);\r
}\r
\r
float glowAt(vec2 p) {\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 cell = floor(p * grid);\r
  vec2 cellPx = iResolution.xy / (uScale * grid);\r
  float sigma = 0.5 * min(cellPx.x, cellPx.y);\r
  float center = 0.5 * min(1.0, 1.0 / max(uDigitSize, 0.001));\r
  float total = 0.0;\r
  for (int oy = -1; oy <= 1; oy++) {\r
    for (int ox = -1; ox <= 1; ox++) {\r
      vec2 c = cell + vec2(float(ox), float(oy));\r
      ivec2 texel = cellTexel(c);\r
      vec4 r0 = texelFetch(uRings0, texel, 0);\r
      vec4 r1 = texelFetch(uRings1, texel, 0);\r
      float emission = uGlyphs == 2\r
        ? max(r0.x, r1.z) * (0.35 + 0.65 * r1.z) * 0.45\r
        : (r0.x + 4.0 * (r0.y + r0.z + r0.w + r1.y) + 8.0 * r1.x) / 25.0;\r
      emission *= 1.0 + r1.w * uMouseGlow * 1.6;\r
      vec2 d = (p - (c + center) / grid) * iResolution.xy / uScale;\r
      total += emission * exp(-dot(d, d) / (2.0 * sigma * sigma));\r
    }\r
  }\r
  return total;\r
}\r
\r
vec2 barrel(vec2 uv) {\r
  vec2 c = uv * 2.0 - 1.0;\r
  float r2 = dot(c, c);\r
  c *= 1.0 + uCurvature * r2;\r
  return c * 0.5 + 0.5;\r
}\r
\r
void main() {\r
  time = iTime * 0.333333;\r
  vec2 uv = gl_FragCoord.xy / iResolution.xy;\r
\r
  if (uCurvature != 0.0) {\r
    uv = barrel(uv);\r
  }\r
\r
  clickTear = 0.0;\r
  clickSplit = 0.0;\r
  if (uClickMode > 0) {\r
    for (int k = 0; k < \${MAX_CLICKS}; k++) {\r
      vec4 click = uClicks[k];\r
      if (click.w <= 0.0) continue;\r
      float age = uClock - click.z;\r
      if (age < 0.0 || age > uClickSeconds) continue;\r
      float life = age / uClickSeconds;\r
      float envelope = (1.0 - life) * (1.0 - life);\r
      if (uClickMode == 1) {\r
        float tick = floor(age * 30.0);\r
        float bands = 14.0 + 26.0 * hashCell(vec2(click.z, tick * 0.37));\r
        float row = floor(uv.y * bands);\r
        float pickRow = hashCell(vec2(row + tick * 7.0, click.z * 17.0));\r
        float torn = step(0.42, pickRow);\r
        float reach = exp(-abs(uv.y - click.y) * 2.5);\r
        float shift = (hashCell(vec2(row * 1.7 + tick, click.z)) - 0.5) * 0.22;\r
        clickTear += shift * torn * envelope * reach;\r
        clickSplit = max(clickSplit, envelope * reach * (0.4 + 0.6 * torn));\r
      } else {\r
        vec2 aspect = vec2(iResolution.x / iResolution.y, 1.0);\r
        vec2 delta = (uv - click.xy) * aspect;\r
        float dist = length(delta);\r
        float front = age * 1.6;\r
        float band = exp(-pow((dist - front) / 0.18, 2.0));\r
        float wave = sin((dist - front) * 40.0) * band;\r
        uv += delta / aspect * wave * 0.05 * envelope;\r
        clickSplit = max(clickSplit, envelope * band);\r
      }\r
    }\r
  }\r
\r
  vec2 p = uv * uScale;\r
  pixelHeat = 0.0;\r
  vec2 lightG = getLight(p);\r
  float heat = pixelHeat;\r
  vec2 lightR = lightG;\r
  vec2 lightB = lightG;\r
\r
  float split = uChromaticAberration + clickSplit * 6.0;\r
  if (split != 0.0) {\r
    vec2 ca = vec2(split) / iResolution.xy;\r
    lightR = getLight(p + ca);\r
    lightB = getLight(p - ca);\r
  }\r
\r
  if (uGlow > 0.0) {\r
    float bloom = uGlow * 0.2 * glowAt(p);\r
    lightR.y += bloom;\r
    lightG.y += bloom;\r
    lightB.y += bloom;\r
  }\r
\r
  vec3 core = vec3(lightR.x, lightG.x, lightB.x);\r
  vec3 halo = vec3(lightR.y, lightG.y, lightB.y);\r
  vec3 raw = core + halo;\r
\r
  vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
  float peak = max(uTint.r, max(uTint.g, uTint.b));\r
  float phosphor = clamp(uGlow, 0.0, 1.0);\r
  vec3 vividTint = clamp(mix(vec3(dot(uTint, luma)), uTint, 1.0 + 0.8 * phosphor), 0.0, 1.0);\r
  vec3 coreTint = mix(uTint, vec3(peak), phosphor * 0.45 * smoothstep(0.45, 0.9, core));\r
  vec3 col = core * coreTint + halo * vividTint;\r
  col += (vec3(1.0) - uTint) * min(raw, vec3(1.0)) * heat * uMouseGlow * 0.6;\r
  col *= uBrightness;\r
\r
  if (uVignette > 0.0) {\r
    float edge = 0.04 + 0.22 * uVignette;\r
    vec2 fade = smoothstep(vec2(0.0), vec2(edge), uv) * smoothstep(vec2(0.0), vec2(edge), 1.0 - uv);\r
    float mask = fade.x * fade.y;\r
    mask = mask * mask * (3.0 - 2.0 * mask);\r
    float keep = mix(1.0, mask, clamp(uVignette * 1.5, 0.0, 1.0));\r
    col *= keep;\r
    core *= keep;\r
    halo *= keep;\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
    float lum = dot(uTint, luma);\r
    float peak = max(uTint.r, max(uTint.g, uTint.b));\r
    vec3 hue = uTint / max(peak, 0.0001);\r
    vec3 vivid = clamp(mix(vec3(dot(hue, luma)), hue, 1.6), 0.0, 1.0);\r
    vivid = clamp(vivid * (0.3 / max(dot(vivid, luma), 0.0001)), 0.0, 1.0);\r
    vec3 ink = mix(uTint, vivid, smoothstep(0.3, 0.6, lum));\r
    vec3 cover = (core * 1.15 + halo * 0.4) * uBrightness * (1.0 + heat * uMouseGlow * 0.4);\r
    if (uDither > 0.0) cover += (hash21(gl_FragCoord.xy) - 0.5) * (uDither * 0.003922);\r
    cover = clamp(cover, 0.0, 0.94);\r
    float alpha = max(cover.r, max(cover.g, cover.b));\r
    outColor = vec4(alpha - cover * (1.0 - ink), alpha);\r
    return;\r
  }\r
\r
  if (uDither > 0.0) {\r
    float rnd = hash21(gl_FragCoord.xy);\r
    col += (rnd - 0.5) * (uDither * 0.003922);\r
  }\r
\r
  col = clamp(col, 0.0, 1.0);\r
  outColor = vec4(col, max(col.r, max(col.g, col.b)));\r
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
const link = (gl, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const hexToRgb = hex => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
export default function FaultyTerminal({\r
  scale = 1,\r
  gridMul = [2, 1],\r
  digitSize = 1.5,\r
  timeScale = 0.3,\r
  pause = false,\r
  scanlineIntensity = 0.3,\r
  glitchAmount = 1,\r
  flickerAmount = 1,\r
  noiseAmp = 1,\r
  chromaticAberration = 0,\r
  dither = 0,\r
  curvature = 0.2,\r
  tint = '#ffffff',\r
  mouseReact = true,\r
  mouseStrength = 0.2,\r
  pageLoadAnimation = true,\r
  brightness = 1,\r
  glyphs = 'blocks',\r
  glow = 0.5,\r
  persistence = 0.5,\r
  scramble = 0.5,\r
  mouseGlow = 0.6,\r
  vignette = 0.25,\r
  clickEffect = 'glitch',\r
  variation,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}) {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    scale: Math.max(0.05, scale),\r
    gridX: Math.max(0.1, (gridMul?.[0] ?? 2) * 15),\r
    gridY: Math.max(0.1, (gridMul?.[1] ?? 1) * 15),\r
    digitSize,\r
    timeScale,\r
    pause,\r
    scanlineIntensity,\r
    glitchAmount,\r
    flickerAmount,\r
    noiseAmp,\r
    chromaticAberration,\r
    dither: typeof dither === 'boolean' ? (dither ? 1 : 0) : dither,\r
    curvature,\r
    tint,\r
    mouseReact,\r
    mouseStrength,\r
    pageLoadAnimation,\r
    brightness,\r
    glyphs: GLYPHS[glyphs] ?? 0,\r
    glow: clamp(glow, 0, 3),\r
    persistence: clamp(persistence, 0, 1),\r
    scramble: clamp(scramble, 0, 1),\r
    mouseGlow: clamp(mouseGlow, 0, 1),\r
    vignette: clamp(vignette, 0, 1),\r
    clickEffect: CLICKS[clickEffect] ?? 0,\r
    clickSeconds: CLICK_SECONDS[clickEffect] ?? 1,\r
    variation,\r
    lightMode,\r
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
    const cellShader = link(gl, CELL_FRAGMENT);\r
    const mainShader = link(gl, MAIN_FRAGMENT);\r
    if (!cellShader || !mainShader) return undefined;\r
    const cu = cellShader.uniforms;\r
    const mu = mainShader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const makeTexture = () => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      return texture;\r
    };\r
    const targets = [0, 1].map(() => {\r
      const rings = makeTexture();\r
      const extra = makeTexture();\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rings, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, extra, 0);\r
      return { rings, extra, framebuffer };\r
    });\r
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, columns: 1 };\r
    const cells = { x: 0, y: 0, w: 1, h: 1, key: '' };\r
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const mouse = { x: 0.5, y: 0.5 };\r
    const clicks = new Float32Array(MAX_CLICKS * 4);\r
    let clickIndex = 0;\r
    let clock = 0;\r
    let hover = 0;\r
    let current = 0;\r
    let fresh = true;\r
    const seedOffset = settingsRef.current.variation;\r
    const initialOffset = typeof seedOffset === 'number' ? seedOffset * 10 : Math.random() * 100;\r
    let iTime = initialOffset * settingsRef.current.timeScale;\r
    let introClock = settingsRef.current.pageLoadAnimation && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const layoutCells = s => {\r
      const reach = 1 + Math.max(0, s.curvature) * 2;\r
      const uvMin = 0.5 - 0.5 * reach;\r
      const uvMax = 0.5 + 0.5 * reach;\r
      const margin = 0.06 * Math.max(1, Math.abs(s.glitchAmount)) * Math.max(1, Math.abs(s.flickerAmount)) + 0.2;\r
      const gridX = s.gridX * view.columns;\r
      const x0 = Math.floor((uvMin * s.scale - margin) * gridX) - 2;\r
      const x1 = Math.floor((uvMax * s.scale + margin) * gridX) + 2;\r
      const y0 = Math.floor((uvMin * s.scale - margin) * s.gridY) - 2;\r
      const y1 = Math.floor((uvMax * s.scale + margin) * s.gridY) + 2;\r
      const key = \`\${x0}:\${x1}:\${y0}:\${y1}\`;\r
      if (key === cells.key) return;\r
      cells.key = key;\r
      cells.x = x0;\r
      cells.y = y0;\r
      cells.w = Math.max(1, Math.min(4096, x1 - x0 + 1));\r
      cells.h = Math.max(1, Math.min(4096, y1 - y0 + 1));\r
      for (const target of targets) {\r
        for (const texture of [target.rings, target.extra]) {\r
          gl.bindTexture(gl.TEXTURE_2D, texture);\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cells.w, cells.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        }\r
      }\r
      fresh = true;\r
    };\r
\r
    const stepCells = (s, decay) => {\r
      const source = targets[current];\r
      const target = targets[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, cells.w, cells.h);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(cellShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.rings);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, source.extra);\r
      gl.uniform1i(cu.uPrev0, 0);\r
      gl.uniform1i(cu.uPrev1, 1);\r
      gl.uniform1f(cu.iTime, iTime);\r
      gl.uniform2f(cu.uGridMul, (s.gridX * view.columns) / 15, s.gridY / 15);\r
      gl.uniform1f(cu.uNoiseAmp, s.noiseAmp);\r
      gl.uniform1f(cu.uScale, s.scale);\r
      gl.uniform2f(cu.uMouse, mouse.x, mouse.y);\r
      gl.uniform1f(cu.uMouseStrength, s.mouseStrength);\r
      gl.uniform1f(cu.uUseMouse, s.mouseReact ? 1 : 0);\r
      gl.uniform1f(cu.uPageLoadProgress, introClock);\r
      gl.uniform1f(cu.uUsePageLoadAnimation, s.pageLoadAnimation ? 1 : 0);\r
      gl.uniform2i(cu.uOrigin, cells.x, cells.y);\r
      gl.uniform1f(cu.uDecay, decay);\r
      gl.uniform1f(cu.uFresh, fresh ? 1 : 0);\r
      gl.uniform1f(cu.uHover, hover);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      current = 1 - current;\r
      fresh = false;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const source = targets[current];\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(mainShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.rings);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, source.extra);\r
      gl.uniform1i(mu.uRings0, 0);\r
      gl.uniform1i(mu.uRings1, 1);\r
      gl.uniform1f(mu.iTime, iTime);\r
      gl.uniform3f(mu.iResolution, canvas.width, canvas.height, canvas.width / canvas.height);\r
      gl.uniform1f(mu.uScale, s.scale);\r
      gl.uniform2f(mu.uGridMul, (s.gridX * view.columns) / 15, s.gridY / 15);\r
      gl.uniform1f(mu.uDigitSize, s.digitSize);\r
      gl.uniform1f(mu.uScanlineIntensity, s.scanlineIntensity);\r
      gl.uniform1f(mu.uGlitchAmount, reduce ? 0 : s.glitchAmount);\r
      gl.uniform1f(mu.uFlickerAmount, reduce ? 0 : s.flickerAmount);\r
      gl.uniform1f(mu.uChromaticAberration, s.chromaticAberration);\r
      gl.uniform1f(mu.uDither, s.dither);\r
      gl.uniform1f(mu.uCurvature, s.curvature);\r
      gl.uniform3fv(mu.uTint, hexToRgb(s.tint));\r
      gl.uniform1f(mu.uBrightness, s.brightness);\r
      gl.uniform1f(mu.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform2i(mu.uOrigin, cells.x, cells.y);\r
      gl.uniform2i(mu.uCellCount, cells.w, cells.h);\r
      gl.uniform1i(mu.uGlyphs, s.glyphs);\r
      gl.uniform1f(mu.uGlow, s.glow);\r
      gl.uniform1f(mu.uScramble, s.scramble);\r
      gl.uniform1f(mu.uMouseGlow, s.mouseGlow);\r
      gl.uniform1f(mu.uVignette, s.vignette);\r
      gl.uniform4fv(mu.uClicks, clicks);\r
      gl.uniform1i(mu.uClickMode, s.clickEffect);\r
      gl.uniform1f(mu.uClickSeconds, s.clickSeconds);\r
      gl.uniform1f(mu.uClock, clock);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.columns = Math.min(1, view.width / view.height / 1.5);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      layoutCells(s);\r
      stepCells(s, 0);\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!s.pause && !reduce) iTime += dt * s.timeScale;\r
      const targetX = pointer.inside ? pointer.x : 0.5;\r
      const targetY = pointer.inside ? pointer.y : 0.5;\r
      const follow = 1 - Math.exp(-dt / (pointer.inside ? 0.19988 : 0.6));\r
      mouse.x += (targetX - mouse.x) * follow;\r
      mouse.y += (targetY - mouse.y) * follow;\r
      hover += ((pointer.inside ? 1 : 0) - hover) * (1 - Math.exp(-dt / 0.35));\r
      for (let k = 0; k < MAX_CLICKS; k++) {\r
        if (clicks[k * 4 + 3] > 0 && clock - clicks[k * 4 + 2] > s.clickSeconds) clicks[k * 4 + 3] = 0;\r
      }\r
      layoutCells(s);\r
      const decay = s.persistence > 0 ? Math.exp(-dt / (0.08 + s.persistence * 1.4)) : 0;\r
      stepCells(s, decay);\r
      draw();\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      let busy = !(s.pause || reduce) || introClock < 1;\r
      busy = busy || Math.abs(targetX - mouse.x) + Math.abs(targetY - mouse.y) > 0.0001;\r
      busy = busy || Math.abs((pointer.inside ? 1 : 0) - hover) > 0.001;\r
      for (let k = 0; k < MAX_CLICKS; k++) busy = busy || clicks[k * 4 + 3] > 0;\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 2.5) raf = requestAnimationFrame(frame);\r
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
    const locate = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(rect.width, 1);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(rect.height, 1);\r
      return { x, y, inside: x >= 0 && x <= 1 && y >= 0 && y <= 1 };\r
    };\r
\r
    const onPointerMove = event => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = event => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || !s.clickEffect) return;\r
      const o = clickIndex * 4;\r
      clicks[o] = x;\r
      clicks[o + 1] = y;\r
      clicks[o + 2] = clock;\r
      clicks[o + 3] = 1;\r
      clickIndex = (clickIndex + 1) % MAX_CLICKS;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      for (const target of targets) {\r
        gl.deleteTexture(target.rings);\r
        gl.deleteTexture(target.extra);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(cellShader.program);\r
      gl.deleteProgram(mainShader.program);\r
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
}\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
import './FaultyTerminal.css';\r
\r
type Vec2 = [number, number];\r
\r
export type FaultyTerminalGlyphs = 'blocks' | 'dots' | 'characters';\r
export type FaultyTerminalClickEffect = 'glitch' | 'degauss' | 'none';\r
\r
export interface FaultyTerminalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  scale?: number;\r
  gridMul?: Vec2;\r
  digitSize?: number;\r
  timeScale?: number;\r
  pause?: boolean;\r
  scanlineIntensity?: number;\r
  glitchAmount?: number;\r
  flickerAmount?: number;\r
  noiseAmp?: number;\r
  chromaticAberration?: number;\r
  dither?: number | boolean;\r
  curvature?: number;\r
  tint?: string;\r
  mouseReact?: boolean;\r
  mouseStrength?: number;\r
  pageLoadAnimation?: boolean;\r
  brightness?: number;\r
  glyphs?: FaultyTerminalGlyphs;\r
  glow?: number;\r
  persistence?: number;\r
  scramble?: number;\r
  mouseGlow?: number;\r
  vignette?: number;\r
  clickEffect?: FaultyTerminalClickEffect;\r
  variation?: number;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  scale: number;\r
  gridX: number;\r
  gridY: number;\r
  digitSize: number;\r
  timeScale: number;\r
  pause: boolean;\r
  scanlineIntensity: number;\r
  glitchAmount: number;\r
  flickerAmount: number;\r
  noiseAmp: number;\r
  chromaticAberration: number;\r
  dither: number;\r
  curvature: number;\r
  tint: string;\r
  mouseReact: boolean;\r
  mouseStrength: number;\r
  pageLoadAnimation: boolean;\r
  brightness: number;\r
  glyphs: number;\r
  glow: number;\r
  persistence: number;\r
  scramble: number;\r
  mouseGlow: number;\r
  vignette: number;\r
  clickEffect: number;\r
  clickSeconds: number;\r
  variation?: number;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const INTRO_SECONDS = 2;\r
const MAX_CLICKS = 4;\r
const CLICK_SECONDS: Record<string, number> = { glitch: 0.7, degauss: 1.6 };\r
const GLYPHS: Record<string, number> = { blocks: 0, dots: 1, characters: 2 };\r
const CLICKS: Record<string, number> = { none: 0, glitch: 1, degauss: 2 };\r
\r
const FONT = [\r
  ['.###.', '#..##', '#.#.#', '##..#', '.###.'],\r
  ['..#..', '.##..', '..#..', '..#..', '.###.'],\r
  ['####.', '....#', '.###.', '#....', '#####'],\r
  ['####.', '....#', '.###.', '....#', '####.'],\r
  ['#..#.', '#..#.', '#####', '...#.', '...#.'],\r
  ['#####', '#....', '####.', '....#', '####.'],\r
  ['.###.', '#....', '####.', '#...#', '.###.'],\r
  ['#####', '....#', '...#.', '..#..', '..#..'],\r
  ['.###.', '#...#', '.###.', '#...#', '.###.'],\r
  ['.###.', '#...#', '.####', '....#', '.###.'],\r
  ['.###.', '#...#', '#####', '#...#', '#...#'],\r
  ['####.', '#...#', '####.', '#...#', '####.'],\r
  ['.####', '#....', '#....', '#....', '.####'],\r
  ['####.', '#...#', '#...#', '#...#', '####.'],\r
  ['#####', '#....', '####.', '#....', '#####'],\r
  ['#####', '#....', '####.', '#....', '#....'],\r
  ['.....', '..#..', '.###.', '..#..', '.....'],\r
  ['.....', '.....', '.###.', '.....', '.....'],\r
  ['.#...', '..#..', '...#.', '..#..', '.#...'],\r
  ['....#', '...#.', '..#..', '.#...', '#....'],\r
  ['.....', '#.#.#', '.###.', '#.#.#', '.....'],\r
  ['.....', '#####', '.....', '#####', '.....'],\r
  ['.....', '.....', '.....', '.....', '#####']\r
];\r
\r
const FONT_BITS = FONT.map(rows =>\r
  rows.reduce((bits, row, r) => {\r
    let value = bits;\r
    for (let c = 0; c < 5; c++) if (row[c] === '#') value += 2 ** (r * 5 + c);\r
    return value;\r
  }, 0)\r
);\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PATTERN = \`\r
float time;\r
\r
float noise(vec2 p) {\r
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2;\r
}\r
\r
mat2 rotate(float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  return mat2(c, -s, s, c);\r
}\r
\r
float fbm(vec2 p) {\r
  p *= 1.1;\r
  float f = 0.0;\r
  float amp = 0.5 * uNoiseAmp;\r
  mat2 modify0 = rotate(time * 0.02);\r
  f += amp * noise(p);\r
  p = modify0 * p * 2.0;\r
  amp *= 0.454545;\r
  mat2 modify1 = rotate(time * 0.02);\r
  f += amp * noise(p);\r
  p = modify1 * p * 2.0;\r
  amp *= 0.454545;\r
  f += amp * noise(p);\r
  return f;\r
}\r
\r
float pattern(vec2 p) {\r
  vec2 offset1 = vec2(1.0);\r
  vec2 offset0 = vec2(0.0);\r
  mat2 rot01 = rotate(0.1 * time);\r
  mat2 rot1 = rotate(0.1);\r
  vec2 q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));\r
  vec2 r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));\r
  return fbm(p + r);\r
}\r
\`;\r
\r
const CELL_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform float iTime;\r
uniform vec2 uGridMul;\r
uniform float uNoiseAmp;\r
uniform float uScale;\r
uniform vec2 uMouse;\r
uniform float uMouseStrength;\r
uniform float uUseMouse;\r
uniform float uPageLoadProgress;\r
uniform float uUsePageLoadAnimation;\r
uniform ivec2 uOrigin;\r
uniform sampler2D uPrev0;\r
uniform sampler2D uPrev1;\r
uniform float uDecay;\r
uniform float uFresh;\r
uniform float uHover;\r
\r
layout(location = 0) out vec4 outRings;\r
layout(location = 1) out vec4 outExtra;\r
\${PATTERN}\r
void main() {\r
  time = iTime * 0.333333;\r
  ivec2 texel = ivec2(gl_FragCoord.xy);\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 s = vec2(texel + uOrigin) / grid;\r
  float intensity = pattern(s * 0.1) * 1.3 - 0.03;\r
  float lift = 0.0;\r
  float strike = 0.0;\r
\r
  if (uUseMouse > 0.5) {\r
    vec2 mouseWorld = uMouse * uScale;\r
    float distToMouse = distance(s, mouseWorld);\r
    float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;\r
    intensity += mouseInfluence;\r
    float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;\r
    intensity += ripple;\r
    lift = mouseInfluence;\r
  }\r
\r
  if (uUsePageLoadAnimation > 0.5) {\r
    float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);\r
    float cellDelay = cellRandom * 0.8;\r
    float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);\r
    float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);\r
    intensity *= fadeAlpha;\r
    strike = sin(3.14159265 * cellProgress) * step(0.1, intensity);\r
  }\r
\r
  vec4 on0 = step(vec4(0.1), intensity - vec4(0.0, 1.0, 2.0, 4.0) * 0.0625);\r
  vec2 on1 = step(vec2(0.1), intensity - vec2(5.0, 8.0) * 0.0625);\r
  float level = clamp((intensity - 0.1) / 0.6, 0.0, 1.0);\r
  float heat = max(clamp(lift / 3.0, 0.0, 1.0) * uHover, strike);\r
\r
  vec4 prev0 = texelFetch(uPrev0, texel, 0) * (1.0 - uFresh);\r
  vec4 prev1 = texelFetch(uPrev1, texel, 0) * (1.0 - uFresh);\r
  vec4 fade0 = max(prev0 * uDecay - 1.0 / 255.0, 0.0);\r
  vec4 fade1 = max(prev1 * uDecay - 1.0 / 255.0, 0.0);\r
\r
  outRings = max(on0, fade0);\r
  outExtra = vec4(max(on1, fade1.xy), max(level, fade1.z), max(heat, fade1.w));\r
}\`;\r
\r
const fontArray = \`const uint FONT[\${FONT_BITS.length}] = uint[\${FONT_BITS.length}](\${FONT_BITS.map(\r
  bits => \`\${bits}u\`\r
).join(', ')});\`;\r
\r
const MAIN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform float iTime;\r
uniform vec3 iResolution;\r
uniform float uScale;\r
uniform vec2 uGridMul;\r
uniform float uDigitSize;\r
uniform float uScanlineIntensity;\r
uniform float uGlitchAmount;\r
uniform float uFlickerAmount;\r
uniform float uChromaticAberration;\r
uniform float uDither;\r
uniform float uCurvature;\r
uniform vec3 uTint;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform sampler2D uRings0;\r
uniform sampler2D uRings1;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCellCount;\r
uniform int uGlyphs;\r
uniform float uGlow;\r
uniform float uScramble;\r
uniform float uMouseGlow;\r
uniform float uVignette;\r
uniform vec4 uClicks[\${MAX_CLICKS}];\r
uniform int uClickMode;\r
uniform float uClickSeconds;\r
uniform float uClock;\r
\r
out vec4 outColor;\r
\r
\${fontArray}\r
\r
float time;\r
float clickTear;\r
float clickSplit;\r
float pixelHeat;\r
\r
float hash21(vec2 p) {\r
  p = fract(p * 234.56);\r
  p += dot(p, p + 34.56);\r
  return fract(p.x * p.y);\r
}\r
\r
float hashCell(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
ivec2 cellTexel(vec2 cell) {\r
  return clamp(ivec2(cell) - uOrigin, ivec2(0), uCellCount - 1);\r
}\r
\r
float ringValue(float n, vec4 r0, vec4 r1) {\r
  if (n < 0.5) return r0.x;\r
  if (n < 1.5) return r0.y;\r
  if (n < 2.5) return r0.z;\r
  if (n < 4.5) return r0.w;\r
  if (n < 5.5) return r1.x;\r
  return r1.y;\r
}\r
\r
float digit(vec2 p) {\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 cell = floor(p * grid);\r
  ivec2 texel = cellTexel(cell);\r
  vec4 r0 = texelFetch(uRings0, texel, 0);\r
  vec4 r1 = texelFetch(uRings1, texel, 0);\r
  float boost = 1.0 + r1.w * uMouseGlow * 1.3;\r
  pixelHeat = max(pixelHeat, r1.w);\r
  p = fract(p * grid);\r
  p *= uDigitSize;\r
\r
  float px5 = p.x * 5.0;\r
  float py5 = (1.0 - p.y) * 5.0;\r
  float x = fract(px5);\r
  float y = fract(py5);\r
  float i = floor(py5) - 2.0;\r
  float j = floor(px5) - 2.0;\r
  float inside = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);\r
\r
  if (uGlyphs == 2) {\r
    float rate = 1.2 + r1.w * uScramble * 18.0;\r
    float phase = hashCell(cell * 1.37 + 4.1);\r
    float epoch = floor(iTime * rate + phase * 7.0);\r
    float pick = hashCell(cell + vec2(epoch * 0.731, epoch * 1.913));\r
    uint glyph = FONT[int(min(pick * float(FONT.length()), float(FONT.length()) - 1.0))];\r
    int bit = int(i + 2.0) * 5 + int(j + 2.0);\r
    float lit = float((glyph >> uint(clamp(bit, 0, 24))) & 1u);\r
    float glow = max(r0.x, r1.z);\r
    float shade = 0.35 + 0.65 * r1.z;\r
    return inside * lit * glow * shade * boost * (0.2 + y * 0.8) * (0.75 + x * 0.25);\r
  }\r
\r
  float n = i * i + j * j;\r
  float on = ringValue(n, r0, r1);\r
  if (uGlyphs == 1) {\r
    vec2 d = vec2(x, y) - 0.5;\r
    float radius = 0.36 + 0.06 * on;\r
    float edge = fwidth(px5) * 0.75;\r
    float dot = 1.0 - smoothstep(radius - edge, radius + edge, length(d));\r
    return inside * on * dot * boost * (0.55 + 0.45 * (1.0 - length(d) / 0.5));\r
  }\r
  float brightness = on * (0.2 + y * 0.8) * (0.75 + x * 0.25);\r
  return inside * brightness * boost;\r
}\r
\r
float onOff(float a, float b, float c) {\r
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;\r
}\r
\r
float displace(vec2 look) {\r
  float y = look.y - mod(iTime * 0.25, 1.0);\r
  float window = 1.0 / (1.0 + 50.0 * y * y);\r
  return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;\r
}\r
\r
vec2 getLight(vec2 p) {\r
  float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;\r
  bar *= uScanlineIntensity;\r
\r
  float displacement = displace(p);\r
  p.x += displacement;\r
\r
  if (uGlitchAmount != 1.0) {\r
    float extra = displacement * (uGlitchAmount - 1.0);\r
    p.x += extra;\r
  }\r
\r
  p.x += clickTear;\r
\r
  float middle = digit(p);\r
\r
  const float off = 0.002;\r
  float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +\r
              digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +\r
              digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));\r
\r
  return vec2(0.9 * middle, sum * 0.1 * bar);\r
}\r
\r
float glowAt(vec2 p) {\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 cell = floor(p * grid);\r
  vec2 cellPx = iResolution.xy / (uScale * grid);\r
  float sigma = 0.5 * min(cellPx.x, cellPx.y);\r
  float center = 0.5 * min(1.0, 1.0 / max(uDigitSize, 0.001));\r
  float total = 0.0;\r
  for (int oy = -1; oy <= 1; oy++) {\r
    for (int ox = -1; ox <= 1; ox++) {\r
      vec2 c = cell + vec2(float(ox), float(oy));\r
      ivec2 texel = cellTexel(c);\r
      vec4 r0 = texelFetch(uRings0, texel, 0);\r
      vec4 r1 = texelFetch(uRings1, texel, 0);\r
      float emission = uGlyphs == 2\r
        ? max(r0.x, r1.z) * (0.35 + 0.65 * r1.z) * 0.45\r
        : (r0.x + 4.0 * (r0.y + r0.z + r0.w + r1.y) + 8.0 * r1.x) / 25.0;\r
      emission *= 1.0 + r1.w * uMouseGlow * 1.6;\r
      vec2 d = (p - (c + center) / grid) * iResolution.xy / uScale;\r
      total += emission * exp(-dot(d, d) / (2.0 * sigma * sigma));\r
    }\r
  }\r
  return total;\r
}\r
\r
vec2 barrel(vec2 uv) {\r
  vec2 c = uv * 2.0 - 1.0;\r
  float r2 = dot(c, c);\r
  c *= 1.0 + uCurvature * r2;\r
  return c * 0.5 + 0.5;\r
}\r
\r
void main() {\r
  time = iTime * 0.333333;\r
  vec2 uv = gl_FragCoord.xy / iResolution.xy;\r
\r
  if (uCurvature != 0.0) {\r
    uv = barrel(uv);\r
  }\r
\r
  clickTear = 0.0;\r
  clickSplit = 0.0;\r
  if (uClickMode > 0) {\r
    for (int k = 0; k < \${MAX_CLICKS}; k++) {\r
      vec4 click = uClicks[k];\r
      if (click.w <= 0.0) continue;\r
      float age = uClock - click.z;\r
      if (age < 0.0 || age > uClickSeconds) continue;\r
      float life = age / uClickSeconds;\r
      float envelope = (1.0 - life) * (1.0 - life);\r
      if (uClickMode == 1) {\r
        float tick = floor(age * 30.0);\r
        float bands = 14.0 + 26.0 * hashCell(vec2(click.z, tick * 0.37));\r
        float row = floor(uv.y * bands);\r
        float pickRow = hashCell(vec2(row + tick * 7.0, click.z * 17.0));\r
        float torn = step(0.42, pickRow);\r
        float reach = exp(-abs(uv.y - click.y) * 2.5);\r
        float shift = (hashCell(vec2(row * 1.7 + tick, click.z)) - 0.5) * 0.22;\r
        clickTear += shift * torn * envelope * reach;\r
        clickSplit = max(clickSplit, envelope * reach * (0.4 + 0.6 * torn));\r
      } else {\r
        vec2 aspect = vec2(iResolution.x / iResolution.y, 1.0);\r
        vec2 delta = (uv - click.xy) * aspect;\r
        float dist = length(delta);\r
        float front = age * 1.6;\r
        float band = exp(-pow((dist - front) / 0.18, 2.0));\r
        float wave = sin((dist - front) * 40.0) * band;\r
        uv += delta / aspect * wave * 0.05 * envelope;\r
        clickSplit = max(clickSplit, envelope * band);\r
      }\r
    }\r
  }\r
\r
  vec2 p = uv * uScale;\r
  pixelHeat = 0.0;\r
  vec2 lightG = getLight(p);\r
  float heat = pixelHeat;\r
  vec2 lightR = lightG;\r
  vec2 lightB = lightG;\r
\r
  float split = uChromaticAberration + clickSplit * 6.0;\r
  if (split != 0.0) {\r
    vec2 ca = vec2(split) / iResolution.xy;\r
    lightR = getLight(p + ca);\r
    lightB = getLight(p - ca);\r
  }\r
\r
  if (uGlow > 0.0) {\r
    float bloom = uGlow * 0.2 * glowAt(p);\r
    lightR.y += bloom;\r
    lightG.y += bloom;\r
    lightB.y += bloom;\r
  }\r
\r
  vec3 core = vec3(lightR.x, lightG.x, lightB.x);\r
  vec3 halo = vec3(lightR.y, lightG.y, lightB.y);\r
  vec3 raw = core + halo;\r
\r
  vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
  float peak = max(uTint.r, max(uTint.g, uTint.b));\r
  float phosphor = clamp(uGlow, 0.0, 1.0);\r
  vec3 vividTint = clamp(mix(vec3(dot(uTint, luma)), uTint, 1.0 + 0.8 * phosphor), 0.0, 1.0);\r
  vec3 coreTint = mix(uTint, vec3(peak), phosphor * 0.45 * smoothstep(0.45, 0.9, core));\r
  vec3 col = core * coreTint + halo * vividTint;\r
  col += (vec3(1.0) - uTint) * min(raw, vec3(1.0)) * heat * uMouseGlow * 0.6;\r
  col *= uBrightness;\r
\r
  if (uVignette > 0.0) {\r
    float edge = 0.04 + 0.22 * uVignette;\r
    vec2 fade = smoothstep(vec2(0.0), vec2(edge), uv) * smoothstep(vec2(0.0), vec2(edge), 1.0 - uv);\r
    float mask = fade.x * fade.y;\r
    mask = mask * mask * (3.0 - 2.0 * mask);\r
    float keep = mix(1.0, mask, clamp(uVignette * 1.5, 0.0, 1.0));\r
    col *= keep;\r
    core *= keep;\r
    halo *= keep;\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
    float lum = dot(uTint, luma);\r
    float peak = max(uTint.r, max(uTint.g, uTint.b));\r
    vec3 hue = uTint / max(peak, 0.0001);\r
    vec3 vivid = clamp(mix(vec3(dot(hue, luma)), hue, 1.6), 0.0, 1.0);\r
    vivid = clamp(vivid * (0.3 / max(dot(vivid, luma), 0.0001)), 0.0, 1.0);\r
    vec3 ink = mix(uTint, vivid, smoothstep(0.3, 0.6, lum));\r
    vec3 cover = (core * 1.15 + halo * 0.4) * uBrightness * (1.0 + heat * uMouseGlow * 0.4);\r
    if (uDither > 0.0) cover += (hash21(gl_FragCoord.xy) - 0.5) * (uDither * 0.003922);\r
    cover = clamp(cover, 0.0, 0.94);\r
    float alpha = max(cover.r, max(cover.g, cover.b));\r
    outColor = vec4(alpha - cover * (1.0 - ink), alpha);\r
    return;\r
  }\r
\r
  if (uDither > 0.0) {\r
    float rnd = hash21(gl_FragCoord.xy);\r
    col += (rnd - 0.5) * (uDither * 0.003922);\r
  }\r
\r
  col = clamp(col, 0.0, 1.0);\r
  outColor = vec4(col, max(col.r, max(col.g, col.b)));\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const hexToRgb = (hex: string): number[] => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
export default function FaultyTerminal({\r
  scale = 1,\r
  gridMul = [2, 1],\r
  digitSize = 1.5,\r
  timeScale = 0.3,\r
  pause = false,\r
  scanlineIntensity = 0.3,\r
  glitchAmount = 1,\r
  flickerAmount = 1,\r
  noiseAmp = 1,\r
  chromaticAberration = 0,\r
  dither = 0,\r
  curvature = 0.2,\r
  tint = '#ffffff',\r
  mouseReact = true,\r
  mouseStrength = 0.2,\r
  pageLoadAnimation = true,\r
  brightness = 1,\r
  glyphs = 'blocks',\r
  glow = 0.5,\r
  persistence = 0.5,\r
  scramble = 0.5,\r
  mouseGlow = 0.6,\r
  vignette = 0.25,\r
  clickEffect = 'glitch',\r
  variation,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: FaultyTerminalProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    scale: Math.max(0.05, scale),\r
    gridX: Math.max(0.1, (gridMul?.[0] ?? 2) * 15),\r
    gridY: Math.max(0.1, (gridMul?.[1] ?? 1) * 15),\r
    digitSize,\r
    timeScale,\r
    pause,\r
    scanlineIntensity,\r
    glitchAmount,\r
    flickerAmount,\r
    noiseAmp,\r
    chromaticAberration,\r
    dither: typeof dither === 'boolean' ? (dither ? 1 : 0) : dither,\r
    curvature,\r
    tint,\r
    mouseReact,\r
    mouseStrength,\r
    pageLoadAnimation,\r
    brightness,\r
    glyphs: GLYPHS[glyphs] ?? 0,\r
    glow: clamp(glow, 0, 3),\r
    persistence: clamp(persistence, 0, 1),\r
    scramble: clamp(scramble, 0, 1),\r
    mouseGlow: clamp(mouseGlow, 0, 1),\r
    vignette: clamp(vignette, 0, 1),\r
    clickEffect: CLICKS[clickEffect] ?? 0,\r
    clickSeconds: CLICK_SECONDS[clickEffect] ?? 1,\r
    variation,\r
    lightMode,\r
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
    const cellShader = link(gl, CELL_FRAGMENT);\r
    const mainShader = link(gl, MAIN_FRAGMENT);\r
    if (!cellShader || !mainShader) return undefined;\r
    const cu = cellShader.uniforms;\r
    const mu = mainShader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const makeTexture = () => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      return texture;\r
    };\r
    const targets = [0, 1].map(() => {\r
      const rings = makeTexture();\r
      const extra = makeTexture();\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rings, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, extra, 0);\r
      return { rings, extra, framebuffer };\r
    });\r
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, columns: 1 };\r
    const cells = { x: 0, y: 0, w: 1, h: 1, key: '' };\r
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const mouse = { x: 0.5, y: 0.5 };\r
    const clicks = new Float32Array(MAX_CLICKS * 4);\r
    let clickIndex = 0;\r
    let clock = 0;\r
    let hover = 0;\r
    let current = 0;\r
    let fresh = true;\r
    const seedOffset = settingsRef.current.variation;\r
    const initialOffset = typeof seedOffset === 'number' ? seedOffset * 10 : Math.random() * 100;\r
    let iTime = initialOffset * settingsRef.current.timeScale;\r
    let introClock = settingsRef.current.pageLoadAnimation && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const layoutCells = (s: Settings) => {\r
      const reach = 1 + Math.max(0, s.curvature) * 2;\r
      const uvMin = 0.5 - 0.5 * reach;\r
      const uvMax = 0.5 + 0.5 * reach;\r
      const margin = 0.06 * Math.max(1, Math.abs(s.glitchAmount)) * Math.max(1, Math.abs(s.flickerAmount)) + 0.2;\r
      const gridX = s.gridX * view.columns;\r
      const x0 = Math.floor((uvMin * s.scale - margin) * gridX) - 2;\r
      const x1 = Math.floor((uvMax * s.scale + margin) * gridX) + 2;\r
      const y0 = Math.floor((uvMin * s.scale - margin) * s.gridY) - 2;\r
      const y1 = Math.floor((uvMax * s.scale + margin) * s.gridY) + 2;\r
      const key = \`\${x0}:\${x1}:\${y0}:\${y1}\`;\r
      if (key === cells.key) return;\r
      cells.key = key;\r
      cells.x = x0;\r
      cells.y = y0;\r
      cells.w = Math.max(1, Math.min(4096, x1 - x0 + 1));\r
      cells.h = Math.max(1, Math.min(4096, y1 - y0 + 1));\r
      for (const target of targets) {\r
        for (const texture of [target.rings, target.extra]) {\r
          gl.bindTexture(gl.TEXTURE_2D, texture);\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cells.w, cells.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        }\r
      }\r
      fresh = true;\r
    };\r
\r
    const stepCells = (s: Settings, decay: number) => {\r
      const source = targets[current];\r
      const target = targets[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, cells.w, cells.h);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(cellShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.rings);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, source.extra);\r
      gl.uniform1i(cu.uPrev0, 0);\r
      gl.uniform1i(cu.uPrev1, 1);\r
      gl.uniform1f(cu.iTime, iTime);\r
      gl.uniform2f(cu.uGridMul, (s.gridX * view.columns) / 15, s.gridY / 15);\r
      gl.uniform1f(cu.uNoiseAmp, s.noiseAmp);\r
      gl.uniform1f(cu.uScale, s.scale);\r
      gl.uniform2f(cu.uMouse, mouse.x, mouse.y);\r
      gl.uniform1f(cu.uMouseStrength, s.mouseStrength);\r
      gl.uniform1f(cu.uUseMouse, s.mouseReact ? 1 : 0);\r
      gl.uniform1f(cu.uPageLoadProgress, introClock);\r
      gl.uniform1f(cu.uUsePageLoadAnimation, s.pageLoadAnimation ? 1 : 0);\r
      gl.uniform2i(cu.uOrigin, cells.x, cells.y);\r
      gl.uniform1f(cu.uDecay, decay);\r
      gl.uniform1f(cu.uFresh, fresh ? 1 : 0);\r
      gl.uniform1f(cu.uHover, hover);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      current = 1 - current;\r
      fresh = false;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const source = targets[current];\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(mainShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.rings);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, source.extra);\r
      gl.uniform1i(mu.uRings0, 0);\r
      gl.uniform1i(mu.uRings1, 1);\r
      gl.uniform1f(mu.iTime, iTime);\r
      gl.uniform3f(mu.iResolution, canvas.width, canvas.height, canvas.width / canvas.height);\r
      gl.uniform1f(mu.uScale, s.scale);\r
      gl.uniform2f(mu.uGridMul, (s.gridX * view.columns) / 15, s.gridY / 15);\r
      gl.uniform1f(mu.uDigitSize, s.digitSize);\r
      gl.uniform1f(mu.uScanlineIntensity, s.scanlineIntensity);\r
      gl.uniform1f(mu.uGlitchAmount, reduce ? 0 : s.glitchAmount);\r
      gl.uniform1f(mu.uFlickerAmount, reduce ? 0 : s.flickerAmount);\r
      gl.uniform1f(mu.uChromaticAberration, s.chromaticAberration);\r
      gl.uniform1f(mu.uDither, s.dither);\r
      gl.uniform1f(mu.uCurvature, s.curvature);\r
      gl.uniform3fv(mu.uTint, hexToRgb(s.tint));\r
      gl.uniform1f(mu.uBrightness, s.brightness);\r
      gl.uniform1f(mu.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform2i(mu.uOrigin, cells.x, cells.y);\r
      gl.uniform2i(mu.uCellCount, cells.w, cells.h);\r
      gl.uniform1i(mu.uGlyphs, s.glyphs);\r
      gl.uniform1f(mu.uGlow, s.glow);\r
      gl.uniform1f(mu.uScramble, s.scramble);\r
      gl.uniform1f(mu.uMouseGlow, s.mouseGlow);\r
      gl.uniform1f(mu.uVignette, s.vignette);\r
      gl.uniform4fv(mu.uClicks, clicks);\r
      gl.uniform1i(mu.uClickMode, s.clickEffect);\r
      gl.uniform1f(mu.uClickSeconds, s.clickSeconds);\r
      gl.uniform1f(mu.uClock, clock);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.columns = Math.min(1, view.width / view.height / 1.5);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      layoutCells(s);\r
      stepCells(s, 0);\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!s.pause && !reduce) iTime += dt * s.timeScale;\r
      const targetX = pointer.inside ? pointer.x : 0.5;\r
      const targetY = pointer.inside ? pointer.y : 0.5;\r
      const follow = 1 - Math.exp(-dt / (pointer.inside ? 0.19988 : 0.6));\r
      mouse.x += (targetX - mouse.x) * follow;\r
      mouse.y += (targetY - mouse.y) * follow;\r
      hover += ((pointer.inside ? 1 : 0) - hover) * (1 - Math.exp(-dt / 0.35));\r
      for (let k = 0; k < MAX_CLICKS; k++) {\r
        if (clicks[k * 4 + 3] > 0 && clock - clicks[k * 4 + 2] > s.clickSeconds) clicks[k * 4 + 3] = 0;\r
      }\r
      layoutCells(s);\r
      const decay = s.persistence > 0 ? Math.exp(-dt / (0.08 + s.persistence * 1.4)) : 0;\r
      stepCells(s, decay);\r
      draw();\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      let busy = !(s.pause || reduce) || introClock < 1;\r
      busy = busy || Math.abs(targetX - mouse.x) + Math.abs(targetY - mouse.y) > 0.0001;\r
      busy = busy || Math.abs((pointer.inside ? 1 : 0) - hover) > 0.001;\r
      for (let k = 0; k < MAX_CLICKS; k++) busy = busy || clicks[k * 4 + 3] > 0;\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 2.5) raf = requestAnimationFrame(frame);\r
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
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(rect.width, 1);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(rect.height, 1);\r
      return { x, y, inside: x >= 0 && x <= 1 && y >= 0 && y <= 1 };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || !s.clickEffect) return;\r
      const o = clickIndex * 4;\r
      clicks[o] = x;\r
      clicks[o + 1] = y;\r
      clicks[o + 2] = clock;\r
      clicks[o + 3] = 1;\r
      clickIndex = (clickIndex + 1) % MAX_CLICKS;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      for (const target of targets) {\r
        gl.deleteTexture(target.rings);\r
        gl.deleteTexture(target.extra);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(cellShader.program);\r
      gl.deleteProgram(mainShader.program);\r
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
      className={\`faulty-terminal-container\${className ? \` \${className}\` : ''}\`}\r
      style={style}\r
      {...rest}\r
    >\r
      <canvas ref={canvasRef} className="faulty-terminal-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
}\r
`,i=`'use client';\r
\r
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';\r
\r
type Vec2 = [number, number];\r
\r
export type FaultyTerminalGlyphs = 'blocks' | 'dots' | 'characters';\r
export type FaultyTerminalClickEffect = 'glitch' | 'degauss' | 'none';\r
\r
export interface FaultyTerminalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {\r
  scale?: number;\r
  gridMul?: Vec2;\r
  digitSize?: number;\r
  timeScale?: number;\r
  pause?: boolean;\r
  scanlineIntensity?: number;\r
  glitchAmount?: number;\r
  flickerAmount?: number;\r
  noiseAmp?: number;\r
  chromaticAberration?: number;\r
  dither?: number | boolean;\r
  curvature?: number;\r
  tint?: string;\r
  mouseReact?: boolean;\r
  mouseStrength?: number;\r
  pageLoadAnimation?: boolean;\r
  brightness?: number;\r
  glyphs?: FaultyTerminalGlyphs;\r
  glow?: number;\r
  persistence?: number;\r
  scramble?: number;\r
  mouseGlow?: number;\r
  vignette?: number;\r
  clickEffect?: FaultyTerminalClickEffect;\r
  variation?: number;\r
  lightMode?: boolean;\r
  dpr?: number;\r
  className?: string;\r
  style?: CSSProperties;\r
}\r
\r
type Settings = {\r
  scale: number;\r
  gridX: number;\r
  gridY: number;\r
  digitSize: number;\r
  timeScale: number;\r
  pause: boolean;\r
  scanlineIntensity: number;\r
  glitchAmount: number;\r
  flickerAmount: number;\r
  noiseAmp: number;\r
  chromaticAberration: number;\r
  dither: number;\r
  curvature: number;\r
  tint: string;\r
  mouseReact: boolean;\r
  mouseStrength: number;\r
  pageLoadAnimation: boolean;\r
  brightness: number;\r
  glyphs: number;\r
  glow: number;\r
  persistence: number;\r
  scramble: number;\r
  mouseGlow: number;\r
  vignette: number;\r
  clickEffect: number;\r
  clickSeconds: number;\r
  variation?: number;\r
  lightMode: boolean;\r
  dpr?: number;\r
};\r
\r
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };\r
\r
const INTRO_SECONDS = 2;\r
const MAX_CLICKS = 4;\r
const CLICK_SECONDS: Record<string, number> = { glitch: 0.7, degauss: 1.6 };\r
const GLYPHS: Record<string, number> = { blocks: 0, dots: 1, characters: 2 };\r
const CLICKS: Record<string, number> = { none: 0, glitch: 1, degauss: 2 };\r
\r
const FONT = [\r
  ['.###.', '#..##', '#.#.#', '##..#', '.###.'],\r
  ['..#..', '.##..', '..#..', '..#..', '.###.'],\r
  ['####.', '....#', '.###.', '#....', '#####'],\r
  ['####.', '....#', '.###.', '....#', '####.'],\r
  ['#..#.', '#..#.', '#####', '...#.', '...#.'],\r
  ['#####', '#....', '####.', '....#', '####.'],\r
  ['.###.', '#....', '####.', '#...#', '.###.'],\r
  ['#####', '....#', '...#.', '..#..', '..#..'],\r
  ['.###.', '#...#', '.###.', '#...#', '.###.'],\r
  ['.###.', '#...#', '.####', '....#', '.###.'],\r
  ['.###.', '#...#', '#####', '#...#', '#...#'],\r
  ['####.', '#...#', '####.', '#...#', '####.'],\r
  ['.####', '#....', '#....', '#....', '.####'],\r
  ['####.', '#...#', '#...#', '#...#', '####.'],\r
  ['#####', '#....', '####.', '#....', '#####'],\r
  ['#####', '#....', '####.', '#....', '#....'],\r
  ['.....', '..#..', '.###.', '..#..', '.....'],\r
  ['.....', '.....', '.###.', '.....', '.....'],\r
  ['.#...', '..#..', '...#.', '..#..', '.#...'],\r
  ['....#', '...#.', '..#..', '.#...', '#....'],\r
  ['.....', '#.#.#', '.###.', '#.#.#', '.....'],\r
  ['.....', '#####', '.....', '#####', '.....'],\r
  ['.....', '.....', '.....', '.....', '#####']\r
];\r
\r
const FONT_BITS = FONT.map(rows =>\r
  rows.reduce((bits, row, r) => {\r
    let value = bits;\r
    for (let c = 0; c < 5; c++) if (row[c] === '#') value += 2 ** (r * 5 + c);\r
    return value;\r
  }, 0)\r
);\r
\r
const VERTEX = \`#version 300 es\r
void main() {\r
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\r
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);\r
}\`;\r
\r
const PATTERN = \`\r
float time;\r
\r
float noise(vec2 p) {\r
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2;\r
}\r
\r
mat2 rotate(float angle) {\r
  float c = cos(angle);\r
  float s = sin(angle);\r
  return mat2(c, -s, s, c);\r
}\r
\r
float fbm(vec2 p) {\r
  p *= 1.1;\r
  float f = 0.0;\r
  float amp = 0.5 * uNoiseAmp;\r
  mat2 modify0 = rotate(time * 0.02);\r
  f += amp * noise(p);\r
  p = modify0 * p * 2.0;\r
  amp *= 0.454545;\r
  mat2 modify1 = rotate(time * 0.02);\r
  f += amp * noise(p);\r
  p = modify1 * p * 2.0;\r
  amp *= 0.454545;\r
  f += amp * noise(p);\r
  return f;\r
}\r
\r
float pattern(vec2 p) {\r
  vec2 offset1 = vec2(1.0);\r
  vec2 offset0 = vec2(0.0);\r
  mat2 rot01 = rotate(0.1 * time);\r
  mat2 rot1 = rotate(0.1);\r
  vec2 q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));\r
  vec2 r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));\r
  return fbm(p + r);\r
}\r
\`;\r
\r
const CELL_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform float iTime;\r
uniform vec2 uGridMul;\r
uniform float uNoiseAmp;\r
uniform float uScale;\r
uniform vec2 uMouse;\r
uniform float uMouseStrength;\r
uniform float uUseMouse;\r
uniform float uPageLoadProgress;\r
uniform float uUsePageLoadAnimation;\r
uniform ivec2 uOrigin;\r
uniform sampler2D uPrev0;\r
uniform sampler2D uPrev1;\r
uniform float uDecay;\r
uniform float uFresh;\r
uniform float uHover;\r
\r
layout(location = 0) out vec4 outRings;\r
layout(location = 1) out vec4 outExtra;\r
\${PATTERN}\r
void main() {\r
  time = iTime * 0.333333;\r
  ivec2 texel = ivec2(gl_FragCoord.xy);\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 s = vec2(texel + uOrigin) / grid;\r
  float intensity = pattern(s * 0.1) * 1.3 - 0.03;\r
  float lift = 0.0;\r
  float strike = 0.0;\r
\r
  if (uUseMouse > 0.5) {\r
    vec2 mouseWorld = uMouse * uScale;\r
    float distToMouse = distance(s, mouseWorld);\r
    float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;\r
    intensity += mouseInfluence;\r
    float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;\r
    intensity += ripple;\r
    lift = mouseInfluence;\r
  }\r
\r
  if (uUsePageLoadAnimation > 0.5) {\r
    float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);\r
    float cellDelay = cellRandom * 0.8;\r
    float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);\r
    float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);\r
    intensity *= fadeAlpha;\r
    strike = sin(3.14159265 * cellProgress) * step(0.1, intensity);\r
  }\r
\r
  vec4 on0 = step(vec4(0.1), intensity - vec4(0.0, 1.0, 2.0, 4.0) * 0.0625);\r
  vec2 on1 = step(vec2(0.1), intensity - vec2(5.0, 8.0) * 0.0625);\r
  float level = clamp((intensity - 0.1) / 0.6, 0.0, 1.0);\r
  float heat = max(clamp(lift / 3.0, 0.0, 1.0) * uHover, strike);\r
\r
  vec4 prev0 = texelFetch(uPrev0, texel, 0) * (1.0 - uFresh);\r
  vec4 prev1 = texelFetch(uPrev1, texel, 0) * (1.0 - uFresh);\r
  vec4 fade0 = max(prev0 * uDecay - 1.0 / 255.0, 0.0);\r
  vec4 fade1 = max(prev1 * uDecay - 1.0 / 255.0, 0.0);\r
\r
  outRings = max(on0, fade0);\r
  outExtra = vec4(max(on1, fade1.xy), max(level, fade1.z), max(heat, fade1.w));\r
}\`;\r
\r
const fontArray = \`const uint FONT[\${FONT_BITS.length}] = uint[\${FONT_BITS.length}](\${FONT_BITS.map(\r
  bits => \`\${bits}u\`\r
).join(', ')});\`;\r
\r
const MAIN_FRAGMENT = \`#version 300 es\r
precision highp float;\r
precision highp int;\r
\r
uniform float iTime;\r
uniform vec3 iResolution;\r
uniform float uScale;\r
uniform vec2 uGridMul;\r
uniform float uDigitSize;\r
uniform float uScanlineIntensity;\r
uniform float uGlitchAmount;\r
uniform float uFlickerAmount;\r
uniform float uChromaticAberration;\r
uniform float uDither;\r
uniform float uCurvature;\r
uniform vec3 uTint;\r
uniform float uBrightness;\r
uniform float uLightMode;\r
uniform sampler2D uRings0;\r
uniform sampler2D uRings1;\r
uniform ivec2 uOrigin;\r
uniform ivec2 uCellCount;\r
uniform int uGlyphs;\r
uniform float uGlow;\r
uniform float uScramble;\r
uniform float uMouseGlow;\r
uniform float uVignette;\r
uniform vec4 uClicks[\${MAX_CLICKS}];\r
uniform int uClickMode;\r
uniform float uClickSeconds;\r
uniform float uClock;\r
\r
out vec4 outColor;\r
\r
\${fontArray}\r
\r
float time;\r
float clickTear;\r
float clickSplit;\r
float pixelHeat;\r
\r
float hash21(vec2 p) {\r
  p = fract(p * 234.56);\r
  p += dot(p, p + 34.56);\r
  return fract(p.x * p.y);\r
}\r
\r
float hashCell(vec2 p) {\r
  vec3 q = fract(vec3(p.xyx) * 0.1031);\r
  q += dot(q, q.yzx + 33.33);\r
  return fract((q.x + q.y) * q.z);\r
}\r
\r
ivec2 cellTexel(vec2 cell) {\r
  return clamp(ivec2(cell) - uOrigin, ivec2(0), uCellCount - 1);\r
}\r
\r
float ringValue(float n, vec4 r0, vec4 r1) {\r
  if (n < 0.5) return r0.x;\r
  if (n < 1.5) return r0.y;\r
  if (n < 2.5) return r0.z;\r
  if (n < 4.5) return r0.w;\r
  if (n < 5.5) return r1.x;\r
  return r1.y;\r
}\r
\r
float digit(vec2 p) {\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 cell = floor(p * grid);\r
  ivec2 texel = cellTexel(cell);\r
  vec4 r0 = texelFetch(uRings0, texel, 0);\r
  vec4 r1 = texelFetch(uRings1, texel, 0);\r
  float boost = 1.0 + r1.w * uMouseGlow * 1.3;\r
  pixelHeat = max(pixelHeat, r1.w);\r
  p = fract(p * grid);\r
  p *= uDigitSize;\r
\r
  float px5 = p.x * 5.0;\r
  float py5 = (1.0 - p.y) * 5.0;\r
  float x = fract(px5);\r
  float y = fract(py5);\r
  float i = floor(py5) - 2.0;\r
  float j = floor(px5) - 2.0;\r
  float inside = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);\r
\r
  if (uGlyphs == 2) {\r
    float rate = 1.2 + r1.w * uScramble * 18.0;\r
    float phase = hashCell(cell * 1.37 + 4.1);\r
    float epoch = floor(iTime * rate + phase * 7.0);\r
    float pick = hashCell(cell + vec2(epoch * 0.731, epoch * 1.913));\r
    uint glyph = FONT[int(min(pick * float(FONT.length()), float(FONT.length()) - 1.0))];\r
    int bit = int(i + 2.0) * 5 + int(j + 2.0);\r
    float lit = float((glyph >> uint(clamp(bit, 0, 24))) & 1u);\r
    float glow = max(r0.x, r1.z);\r
    float shade = 0.35 + 0.65 * r1.z;\r
    return inside * lit * glow * shade * boost * (0.2 + y * 0.8) * (0.75 + x * 0.25);\r
  }\r
\r
  float n = i * i + j * j;\r
  float on = ringValue(n, r0, r1);\r
  if (uGlyphs == 1) {\r
    vec2 d = vec2(x, y) - 0.5;\r
    float radius = 0.36 + 0.06 * on;\r
    float edge = fwidth(px5) * 0.75;\r
    float dot = 1.0 - smoothstep(radius - edge, radius + edge, length(d));\r
    return inside * on * dot * boost * (0.55 + 0.45 * (1.0 - length(d) / 0.5));\r
  }\r
  float brightness = on * (0.2 + y * 0.8) * (0.75 + x * 0.25);\r
  return inside * brightness * boost;\r
}\r
\r
float onOff(float a, float b, float c) {\r
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;\r
}\r
\r
float displace(vec2 look) {\r
  float y = look.y - mod(iTime * 0.25, 1.0);\r
  float window = 1.0 / (1.0 + 50.0 * y * y);\r
  return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;\r
}\r
\r
vec2 getLight(vec2 p) {\r
  float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;\r
  bar *= uScanlineIntensity;\r
\r
  float displacement = displace(p);\r
  p.x += displacement;\r
\r
  if (uGlitchAmount != 1.0) {\r
    float extra = displacement * (uGlitchAmount - 1.0);\r
    p.x += extra;\r
  }\r
\r
  p.x += clickTear;\r
\r
  float middle = digit(p);\r
\r
  const float off = 0.002;\r
  float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +\r
              digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +\r
              digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));\r
\r
  return vec2(0.9 * middle, sum * 0.1 * bar);\r
}\r
\r
float glowAt(vec2 p) {\r
  vec2 grid = uGridMul * 15.0;\r
  vec2 cell = floor(p * grid);\r
  vec2 cellPx = iResolution.xy / (uScale * grid);\r
  float sigma = 0.5 * min(cellPx.x, cellPx.y);\r
  float center = 0.5 * min(1.0, 1.0 / max(uDigitSize, 0.001));\r
  float total = 0.0;\r
  for (int oy = -1; oy <= 1; oy++) {\r
    for (int ox = -1; ox <= 1; ox++) {\r
      vec2 c = cell + vec2(float(ox), float(oy));\r
      ivec2 texel = cellTexel(c);\r
      vec4 r0 = texelFetch(uRings0, texel, 0);\r
      vec4 r1 = texelFetch(uRings1, texel, 0);\r
      float emission = uGlyphs == 2\r
        ? max(r0.x, r1.z) * (0.35 + 0.65 * r1.z) * 0.45\r
        : (r0.x + 4.0 * (r0.y + r0.z + r0.w + r1.y) + 8.0 * r1.x) / 25.0;\r
      emission *= 1.0 + r1.w * uMouseGlow * 1.6;\r
      vec2 d = (p - (c + center) / grid) * iResolution.xy / uScale;\r
      total += emission * exp(-dot(d, d) / (2.0 * sigma * sigma));\r
    }\r
  }\r
  return total;\r
}\r
\r
vec2 barrel(vec2 uv) {\r
  vec2 c = uv * 2.0 - 1.0;\r
  float r2 = dot(c, c);\r
  c *= 1.0 + uCurvature * r2;\r
  return c * 0.5 + 0.5;\r
}\r
\r
void main() {\r
  time = iTime * 0.333333;\r
  vec2 uv = gl_FragCoord.xy / iResolution.xy;\r
\r
  if (uCurvature != 0.0) {\r
    uv = barrel(uv);\r
  }\r
\r
  clickTear = 0.0;\r
  clickSplit = 0.0;\r
  if (uClickMode > 0) {\r
    for (int k = 0; k < \${MAX_CLICKS}; k++) {\r
      vec4 click = uClicks[k];\r
      if (click.w <= 0.0) continue;\r
      float age = uClock - click.z;\r
      if (age < 0.0 || age > uClickSeconds) continue;\r
      float life = age / uClickSeconds;\r
      float envelope = (1.0 - life) * (1.0 - life);\r
      if (uClickMode == 1) {\r
        float tick = floor(age * 30.0);\r
        float bands = 14.0 + 26.0 * hashCell(vec2(click.z, tick * 0.37));\r
        float row = floor(uv.y * bands);\r
        float pickRow = hashCell(vec2(row + tick * 7.0, click.z * 17.0));\r
        float torn = step(0.42, pickRow);\r
        float reach = exp(-abs(uv.y - click.y) * 2.5);\r
        float shift = (hashCell(vec2(row * 1.7 + tick, click.z)) - 0.5) * 0.22;\r
        clickTear += shift * torn * envelope * reach;\r
        clickSplit = max(clickSplit, envelope * reach * (0.4 + 0.6 * torn));\r
      } else {\r
        vec2 aspect = vec2(iResolution.x / iResolution.y, 1.0);\r
        vec2 delta = (uv - click.xy) * aspect;\r
        float dist = length(delta);\r
        float front = age * 1.6;\r
        float band = exp(-pow((dist - front) / 0.18, 2.0));\r
        float wave = sin((dist - front) * 40.0) * band;\r
        uv += delta / aspect * wave * 0.05 * envelope;\r
        clickSplit = max(clickSplit, envelope * band);\r
      }\r
    }\r
  }\r
\r
  vec2 p = uv * uScale;\r
  pixelHeat = 0.0;\r
  vec2 lightG = getLight(p);\r
  float heat = pixelHeat;\r
  vec2 lightR = lightG;\r
  vec2 lightB = lightG;\r
\r
  float split = uChromaticAberration + clickSplit * 6.0;\r
  if (split != 0.0) {\r
    vec2 ca = vec2(split) / iResolution.xy;\r
    lightR = getLight(p + ca);\r
    lightB = getLight(p - ca);\r
  }\r
\r
  if (uGlow > 0.0) {\r
    float bloom = uGlow * 0.2 * glowAt(p);\r
    lightR.y += bloom;\r
    lightG.y += bloom;\r
    lightB.y += bloom;\r
  }\r
\r
  vec3 core = vec3(lightR.x, lightG.x, lightB.x);\r
  vec3 halo = vec3(lightR.y, lightG.y, lightB.y);\r
  vec3 raw = core + halo;\r
\r
  vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
  float peak = max(uTint.r, max(uTint.g, uTint.b));\r
  float phosphor = clamp(uGlow, 0.0, 1.0);\r
  vec3 vividTint = clamp(mix(vec3(dot(uTint, luma)), uTint, 1.0 + 0.8 * phosphor), 0.0, 1.0);\r
  vec3 coreTint = mix(uTint, vec3(peak), phosphor * 0.45 * smoothstep(0.45, 0.9, core));\r
  vec3 col = core * coreTint + halo * vividTint;\r
  col += (vec3(1.0) - uTint) * min(raw, vec3(1.0)) * heat * uMouseGlow * 0.6;\r
  col *= uBrightness;\r
\r
  if (uVignette > 0.0) {\r
    float edge = 0.04 + 0.22 * uVignette;\r
    vec2 fade = smoothstep(vec2(0.0), vec2(edge), uv) * smoothstep(vec2(0.0), vec2(edge), 1.0 - uv);\r
    float mask = fade.x * fade.y;\r
    mask = mask * mask * (3.0 - 2.0 * mask);\r
    float keep = mix(1.0, mask, clamp(uVignette * 1.5, 0.0, 1.0));\r
    col *= keep;\r
    core *= keep;\r
    halo *= keep;\r
  }\r
\r
  if (uLightMode > 0.5) {\r
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);\r
    float lum = dot(uTint, luma);\r
    float peak = max(uTint.r, max(uTint.g, uTint.b));\r
    vec3 hue = uTint / max(peak, 0.0001);\r
    vec3 vivid = clamp(mix(vec3(dot(hue, luma)), hue, 1.6), 0.0, 1.0);\r
    vivid = clamp(vivid * (0.3 / max(dot(vivid, luma), 0.0001)), 0.0, 1.0);\r
    vec3 ink = mix(uTint, vivid, smoothstep(0.3, 0.6, lum));\r
    vec3 cover = (core * 1.15 + halo * 0.4) * uBrightness * (1.0 + heat * uMouseGlow * 0.4);\r
    if (uDither > 0.0) cover += (hash21(gl_FragCoord.xy) - 0.5) * (uDither * 0.003922);\r
    cover = clamp(cover, 0.0, 0.94);\r
    float alpha = max(cover.r, max(cover.g, cover.b));\r
    outColor = vec4(alpha - cover * (1.0 - ink), alpha);\r
    return;\r
  }\r
\r
  if (uDither > 0.0) {\r
    float rnd = hash21(gl_FragCoord.xy);\r
    col += (rnd - 0.5) * (uDither * 0.003922);\r
  }\r
\r
  col = clamp(col, 0.0, 1.0);\r
  outColor = vec4(col, max(col.r, max(col.g, col.b)));\r
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
const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
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
const hexToRgb = (hex: string): number[] => {\r
  let h = String(hex || '#ffffff')\r
    .replace('#', '')\r
    .trim();\r
  if (h.length === 3 || h.length === 4)\r
    h = h\r
      .slice(0, 3)\r
      .split('')\r
      .map(c => c + c)\r
      .join('');\r
  const num = parseInt(h.slice(0, 6), 16);\r
  if (Number.isNaN(num)) return [1, 1, 1];\r
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];\r
};\r
\r
export default function FaultyTerminal({\r
  scale = 1,\r
  gridMul = [2, 1],\r
  digitSize = 1.5,\r
  timeScale = 0.3,\r
  pause = false,\r
  scanlineIntensity = 0.3,\r
  glitchAmount = 1,\r
  flickerAmount = 1,\r
  noiseAmp = 1,\r
  chromaticAberration = 0,\r
  dither = 0,\r
  curvature = 0.2,\r
  tint = '#ffffff',\r
  mouseReact = true,\r
  mouseStrength = 0.2,\r
  pageLoadAnimation = true,\r
  brightness = 1,\r
  glyphs = 'blocks',\r
  glow = 0.5,\r
  persistence = 0.5,\r
  scramble = 0.5,\r
  mouseGlow = 0.6,\r
  vignette = 0.25,\r
  clickEffect = 'glitch',\r
  variation,\r
  lightMode = false,\r
  dpr,\r
  className = '',\r
  style,\r
  ...rest\r
}: FaultyTerminalProps) {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    scale: Math.max(0.05, scale),\r
    gridX: Math.max(0.1, (gridMul?.[0] ?? 2) * 15),\r
    gridY: Math.max(0.1, (gridMul?.[1] ?? 1) * 15),\r
    digitSize,\r
    timeScale,\r
    pause,\r
    scanlineIntensity,\r
    glitchAmount,\r
    flickerAmount,\r
    noiseAmp,\r
    chromaticAberration,\r
    dither: typeof dither === 'boolean' ? (dither ? 1 : 0) : dither,\r
    curvature,\r
    tint,\r
    mouseReact,\r
    mouseStrength,\r
    pageLoadAnimation,\r
    brightness,\r
    glyphs: GLYPHS[glyphs] ?? 0,\r
    glow: clamp(glow, 0, 3),\r
    persistence: clamp(persistence, 0, 1),\r
    scramble: clamp(scramble, 0, 1),\r
    mouseGlow: clamp(mouseGlow, 0, 1),\r
    vignette: clamp(vignette, 0, 1),\r
    clickEffect: CLICKS[clickEffect] ?? 0,\r
    clickSeconds: CLICK_SECONDS[clickEffect] ?? 1,\r
    variation,\r
    lightMode,\r
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
    const cellShader = link(gl, CELL_FRAGMENT);\r
    const mainShader = link(gl, MAIN_FRAGMENT);\r
    if (!cellShader || !mainShader) return undefined;\r
    const cu = cellShader.uniforms;\r
    const mu = mainShader.uniforms;\r
    const vao = gl.createVertexArray();\r
\r
    const makeTexture = () => {\r
      const texture = gl.createTexture();\r
      gl.bindTexture(gl.TEXTURE_2D, texture);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
      return texture;\r
    };\r
    const targets = [0, 1].map(() => {\r
      const rings = makeTexture();\r
      const extra = makeTexture();\r
      const framebuffer = gl.createFramebuffer();\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rings, 0);\r
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, extra, 0);\r
      return { rings, extra, framebuffer };\r
    });\r
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const view = { width: 1, height: 1, ratio: 1, columns: 1 };\r
    const cells = { x: 0, y: 0, w: 1, h: 1, key: '' };\r
    const pointer = { x: 0.5, y: 0.5, inside: false };\r
    const mouse = { x: 0.5, y: 0.5 };\r
    const clicks = new Float32Array(MAX_CLICKS * 4);\r
    let clickIndex = 0;\r
    let clock = 0;\r
    let hover = 0;\r
    let current = 0;\r
    let fresh = true;\r
    const seedOffset = settingsRef.current.variation;\r
    const initialOffset = typeof seedOffset === 'number' ? seedOffset * 10 : Math.random() * 100;\r
    let iTime = initialOffset * settingsRef.current.timeScale;\r
    let introClock = settingsRef.current.pageLoadAnimation && !reduce ? 0 : 1;\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let quiet = 0;\r
\r
    const layoutCells = (s: Settings) => {\r
      const reach = 1 + Math.max(0, s.curvature) * 2;\r
      const uvMin = 0.5 - 0.5 * reach;\r
      const uvMax = 0.5 + 0.5 * reach;\r
      const margin = 0.06 * Math.max(1, Math.abs(s.glitchAmount)) * Math.max(1, Math.abs(s.flickerAmount)) + 0.2;\r
      const gridX = s.gridX * view.columns;\r
      const x0 = Math.floor((uvMin * s.scale - margin) * gridX) - 2;\r
      const x1 = Math.floor((uvMax * s.scale + margin) * gridX) + 2;\r
      const y0 = Math.floor((uvMin * s.scale - margin) * s.gridY) - 2;\r
      const y1 = Math.floor((uvMax * s.scale + margin) * s.gridY) + 2;\r
      const key = \`\${x0}:\${x1}:\${y0}:\${y1}\`;\r
      if (key === cells.key) return;\r
      cells.key = key;\r
      cells.x = x0;\r
      cells.y = y0;\r
      cells.w = Math.max(1, Math.min(4096, x1 - x0 + 1));\r
      cells.h = Math.max(1, Math.min(4096, y1 - y0 + 1));\r
      for (const target of targets) {\r
        for (const texture of [target.rings, target.extra]) {\r
          gl.bindTexture(gl.TEXTURE_2D, texture);\r
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cells.w, cells.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\r
        }\r
      }\r
      fresh = true;\r
    };\r
\r
    const stepCells = (s: Settings, decay: number) => {\r
      const source = targets[current];\r
      const target = targets[1 - current];\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);\r
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);\r
      gl.viewport(0, 0, cells.w, cells.h);\r
      gl.disable(gl.BLEND);\r
      gl.useProgram(cellShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.rings);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, source.extra);\r
      gl.uniform1i(cu.uPrev0, 0);\r
      gl.uniform1i(cu.uPrev1, 1);\r
      gl.uniform1f(cu.iTime, iTime);\r
      gl.uniform2f(cu.uGridMul, (s.gridX * view.columns) / 15, s.gridY / 15);\r
      gl.uniform1f(cu.uNoiseAmp, s.noiseAmp);\r
      gl.uniform1f(cu.uScale, s.scale);\r
      gl.uniform2f(cu.uMouse, mouse.x, mouse.y);\r
      gl.uniform1f(cu.uMouseStrength, s.mouseStrength);\r
      gl.uniform1f(cu.uUseMouse, s.mouseReact ? 1 : 0);\r
      gl.uniform1f(cu.uPageLoadProgress, introClock);\r
      gl.uniform1f(cu.uUsePageLoadAnimation, s.pageLoadAnimation ? 1 : 0);\r
      gl.uniform2i(cu.uOrigin, cells.x, cells.y);\r
      gl.uniform1f(cu.uDecay, decay);\r
      gl.uniform1f(cu.uFresh, fresh ? 1 : 0);\r
      gl.uniform1f(cu.uHover, hover);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);\r
      current = 1 - current;\r
      fresh = false;\r
    };\r
\r
    const draw = () => {\r
      const s = settingsRef.current;\r
      const source = targets[current];\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(mainShader.program);\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, source.rings);\r
      gl.activeTexture(gl.TEXTURE1);\r
      gl.bindTexture(gl.TEXTURE_2D, source.extra);\r
      gl.uniform1i(mu.uRings0, 0);\r
      gl.uniform1i(mu.uRings1, 1);\r
      gl.uniform1f(mu.iTime, iTime);\r
      gl.uniform3f(mu.iResolution, canvas.width, canvas.height, canvas.width / canvas.height);\r
      gl.uniform1f(mu.uScale, s.scale);\r
      gl.uniform2f(mu.uGridMul, (s.gridX * view.columns) / 15, s.gridY / 15);\r
      gl.uniform1f(mu.uDigitSize, s.digitSize);\r
      gl.uniform1f(mu.uScanlineIntensity, s.scanlineIntensity);\r
      gl.uniform1f(mu.uGlitchAmount, reduce ? 0 : s.glitchAmount);\r
      gl.uniform1f(mu.uFlickerAmount, reduce ? 0 : s.flickerAmount);\r
      gl.uniform1f(mu.uChromaticAberration, s.chromaticAberration);\r
      gl.uniform1f(mu.uDither, s.dither);\r
      gl.uniform1f(mu.uCurvature, s.curvature);\r
      gl.uniform3fv(mu.uTint, hexToRgb(s.tint));\r
      gl.uniform1f(mu.uBrightness, s.brightness);\r
      gl.uniform1f(mu.uLightMode, s.lightMode ? 1 : 0);\r
      gl.uniform2i(mu.uOrigin, cells.x, cells.y);\r
      gl.uniform2i(mu.uCellCount, cells.w, cells.h);\r
      gl.uniform1i(mu.uGlyphs, s.glyphs);\r
      gl.uniform1f(mu.uGlow, s.glow);\r
      gl.uniform1f(mu.uScramble, s.scramble);\r
      gl.uniform1f(mu.uMouseGlow, s.mouseGlow);\r
      gl.uniform1f(mu.uVignette, s.vignette);\r
      gl.uniform4fv(mu.uClicks, clicks);\r
      gl.uniform1i(mu.uClickMode, s.clickEffect);\r
      gl.uniform1f(mu.uClickSeconds, s.clickSeconds);\r
      gl.uniform1f(mu.uClock, clock);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const resize = () => {\r
      const s = settingsRef.current;\r
      view.width = Math.max(1, container.clientWidth);\r
      view.height = Math.max(1, container.clientHeight);\r
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      view.columns = Math.min(1, view.width / view.height / 1.5);\r
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));\r
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));\r
      layoutCells(s);\r
      stepCells(s, 0);\r
      draw();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 20) : 1 / 60;\r
      last = now;\r
      clock += dt;\r
      if (!s.pause && !reduce) iTime += dt * s.timeScale;\r
      const targetX = pointer.inside ? pointer.x : 0.5;\r
      const targetY = pointer.inside ? pointer.y : 0.5;\r
      const follow = 1 - Math.exp(-dt / (pointer.inside ? 0.19988 : 0.6));\r
      mouse.x += (targetX - mouse.x) * follow;\r
      mouse.y += (targetY - mouse.y) * follow;\r
      hover += ((pointer.inside ? 1 : 0) - hover) * (1 - Math.exp(-dt / 0.35));\r
      for (let k = 0; k < MAX_CLICKS; k++) {\r
        if (clicks[k * 4 + 3] > 0 && clock - clicks[k * 4 + 2] > s.clickSeconds) clicks[k * 4 + 3] = 0;\r
      }\r
      layoutCells(s);\r
      const decay = s.persistence > 0 ? Math.exp(-dt / (0.08 + s.persistence * 1.4)) : 0;\r
      stepCells(s, decay);\r
      draw();\r
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);\r
      let busy = !(s.pause || reduce) || introClock < 1;\r
      busy = busy || Math.abs(targetX - mouse.x) + Math.abs(targetY - mouse.y) > 0.0001;\r
      busy = busy || Math.abs((pointer.inside ? 1 : 0) - hover) > 0.001;\r
      for (let k = 0; k < MAX_CLICKS; k++) busy = busy || clicks[k * 4 + 3] > 0;\r
      quiet = busy ? 0 : quiet + dt;\r
      if (quiet < 2.5) raf = requestAnimationFrame(frame);\r
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
    const locate = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = (event.clientX - rect.left) / Math.max(rect.width, 1);\r
      const y = 1 - (event.clientY - rect.top) / Math.max(rect.height, 1);\r
      return { x, y, inside: x >= 0 && x <= 1 && y >= 0 && y <= 1 };\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const { x, y, inside } = locate(event);\r
      const was = pointer.inside;\r
      pointer.inside = inside;\r
      if (inside) {\r
        pointer.x = x;\r
        pointer.y = y;\r
      }\r
      if (inside || was) wake();\r
    };\r
\r
    const onPointerDown = (event: PointerEvent) => {\r
      const s = settingsRef.current;\r
      const { x, y, inside } = locate(event);\r
      if (!inside || reduce || !s.clickEffect) return;\r
      const o = clickIndex * 4;\r
      clicks[o] = x;\r
      clicks[o + 1] = y;\r
      clicks[o + 2] = clock;\r
      clicks[o + 3] = 1;\r
      clickIndex = (clickIndex + 1) % MAX_CLICKS;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      pointer.inside = false;\r
      wake();\r
    };\r
\r
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
    window.addEventListener('pointerdown', onPointerDown, { passive: true });\r
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      for (const target of targets) {\r
        gl.deleteTexture(target.rings);\r
        gl.deleteTexture(target.extra);\r
        gl.deleteFramebuffer(target.framebuffer);\r
      }\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(cellShader.program);\r
      gl.deleteProgram(mainShader.program);\r
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
}\r
`,o={usage:`import FaultyTerminal from './FaultyTerminal';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <FaultyTerminal
    tint="#A7EF9E"
    glyphs="blocks"
    scale={1.5}
    digitSize={1.2}
    timeScale={0.5}
    brightness={0.75}
    glow={0.5}
    persistence={0.5}
    mouseStrength={0.5}
    mouseGlow={0.6}
    curvature={0.1}
    vignette={0.25}
    clickEffect="glitch"
  />
</div>`,code:r,css:n,tailwind:e,tsCode:t,tsTailwind:i};export{o as faultyTerminal};
