const e=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
import './LaserFlow.css';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
out vec4 outColor;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform float uScale;\r
uniform float uTime;\r
uniform float uBeamX;\r
uniform vec4 uSurface;\r
uniform float uRadius;\r
uniform vec3 uIntro;\r
uniform vec4 uPour;\r
uniform vec2 uRun;\r
uniform vec4 uLens;\r
uniform sampler2D uReveal;\r
uniform vec4 uRevealMap;\r
uniform vec2 uRevealInfo;\r
uniform float uAtmosphere;\r
uniform vec4 uAmount;\r
uniform vec4 uShape;\r
uniform vec4 uExtra;\r
uniform float uTheme;\r
uniform vec3 uTint[16];\r
\r
#define BEAM uTint[0]\r
#define LEFT uTint[1]\r
#define RIGHT uTint[2]\r
#define CYAN uTint[3]\r
#define PINK uTint[4]\r
#define LILAC uTint[5]\r
#define SKY uTint[6]\r
#define PURPLE uTint[7]\r
#define DEEP uTint[8]\r
#define MIST uTint[9]\r
#define NAVY uTint[10]\r
#define WARM uTint[11]\r
#define EMBER uTint[12]\r
#define WHITE uTint[13]\r
#define HAZE uTint[14]\r
#define LAVENDER uTint[15]\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);\r
}\r
\r
float fbm(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);\r
  for (int i = 0; i < 5; i++) {\r
    v += a * noise(p);\r
    p = m * p;\r
    a *= 0.5;\r
  }\r
  return v;\r
}\r
\r
float sq(float x) {\r
  return x * x;\r
}\r
\r
float roundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
vec3 spill(float e, float fall, float strength, float front, float t, out vec3 glow) {\r
  glow = vec3(0.0);\r
  if (strength < 0.0005) return vec3(0.0);\r
  float f = max(fall, 0.0);\r
  float d = max(e, 0.0);\r
  float u = d / (6.0 + 0.28 * f);\r
  float start = smoothstep(-6.0, 12.0, fall);\r
  float fade = exp(-sq(max(f - 125.0, 0.0) / 40.0));\r
  float streak = 0.88 + 0.24 * noise(vec2(u * 6.0, f / 22.0 - t * 1.7));\r
  float bright = pow(strength, 1.5);\r
  float soft = sqrt(strength);\r
  float warmth = smoothstep(90.0, 130.0, f);\r
  vec3 coreK = mix(WHITE, WARM, warmth * exp(-d / 9.0));\r
  float core = mix(9.0, 2.6, warmth) * exp(-sq(d / (3.5 + 0.04 * f))) * exp(-sq(max(f - 130.0, 0.0) / 38.0));\r
  float wall = 24.0 * exp(-sq(d / 1.1)) * exp(-sq(max(f - 100.0, 0.0) / 30.0));\r
  float bandCenter = 0.7 - 0.3 * smoothstep(30.0, 110.0, f);\r
  float offset = u - bandCenter;\r
  float decay = (1.05 - bandCenter) / 1.31;\r
  float profile = offset < 0.0 ? exp(-sq(offset / 0.3)) : exp(-offset / decay);\r
  profile *= 1.0 - smoothstep(1.0, 1.4, u);\r
  vec3 bandA = mix(CYAN, PINK, smoothstep(50.0, 75.0, f));\r
  bandA = mix(bandA, LILAC, smoothstep(100.0, 125.0, f));\r
  vec3 bandB = mix(SKY, PURPLE, smoothstep(50.0, 75.0, f));\r
  vec3 fanK = mix(bandA, bandB, smoothstep(0.06, 0.18, offset));\r
  fanK = mix(fanK, DEEP, smoothstep(0.22, 0.42, offset));\r
  vec3 thread = WHITE * wall * bright + coreK * core * streak * bright;\r
  glow += fanK * 4.5 * profile * fade * streak * bright;\r
  glow += MIST * 0.7 * exp(-max(u - 1.0, 0.0) / 0.9) * smoothstep(0.7, 1.2, u) * fade * soft;\r
  glow += EMBER * 0.35 * exp(-sq((f - 165.0) / 22.0)) * exp(-d / 25.0) * bright;\r
  float lag = u * (6.0 + 0.28 * f) * 0.35;\r
  float reveal = 1.0 - smoothstep(front - 70.0, front + 8.0, f + lag);\r
  glow *= start * reveal;\r
  return thread * start * reveal;\r
}\r
\r
vec3 easeLight(vec3 light, float amount) {\r
  return -log(max(1.0 - amount * (1.0 - exp(-light)), vec3(0.0001)));\r
}\r
\r
void main() {\r
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y * uDpr - gl_FragCoord.y) / uDpr;\r
  vec2 p = frag / uScale;\r
  float t = uTime;\r
  float bx = uBeamX / uScale;\r
  float sl = uSurface.x / uScale;\r
  float sy = uSurface.y / uScale;\r
  float sr = uSurface.z / uScale;\r
  float sb = uSurface.w / uScale;\r
  float radius = uRadius / uScale;\r
  float dx = p.x - bx;\r
  float adx = abs(dx);\r
  float h = sy - p.y;\r
  float hp = max(h, 0.0);\r
  float above = smoothstep(-0.5, 0.5, h);\r
  float side = smoothstep(-24.0, 24.0, dx);\r
  vec3 sideK = mix(mix(LAVENDER, LEFT, smoothstep(40.0, 140.0, adx)), RIGHT, side);\r
  float beamWidth = uShape.x;\r
  float flare = uShape.y;\r
  float spread = 250.0 * uShape.z;\r
  float reachL = max(bx - sl, 1.0);\r
  float reachR = max(sr - bx, 1.0);\r
  float reach = dx < 0.0 ? reachL : reachR;\r
  float layerLen = clamp(0.29 * reach, 20.0, 100.0) * sqrt(uShape.z);\r
  float run = uRun.x;\r
  float runMask = 1.0 - smoothstep(run - 34.0, run + 6.0, adx);\r
  float bead = exp(-sq((adx - run + 16.0) / (18.0 + 0.04 * run))) * uRun.y;\r
  float flowMask = (1.0 - smoothstep(0.75 * spread, 1.1 * spread, adx)) * runMask;\r
  float edgeMask = (1.0 - smoothstep(0.8 * spread, 1.25 * spread, adx)) * runMask;\r
  float bloom = uIntro.y;\r
  vec2 center = vec2((sl + sr) * 0.5, (sy + sb) * 0.5);\r
  vec2 halfSize = vec2((sr - sl) * 0.5, (sb - sy) * 0.5);\r
  float sd = roundBox(p - center, halfSize, radius);\r
  float outline = max(sd, 0.0);\r
  float below = max(p.y - sy - radius, 0.0);\r
  float hug = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 14.0));\r
  float hugWide = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 40.0));\r
\r
  vec3 col = vec3(0.0);\r
\r
  float breathe = 1.0 + uExtra.x * (0.12 * sin(t * 1.5708) + 0.08 * (noise(vec2(t * 0.5, 3.0)) - 0.5));\r
\r
  float front = uIntro.x / uScale;\r
  float drop = smoothstep(front + 10.0, front - 110.0, p.y);\r
  float falling = 1.0 - smoothstep(sy - 24.0, sy, front);\r
  float top = mix(0.3, 1.0, smoothstep(0.0, 0.3 * sy, p.y));\r
  float beamCore = 24.0 * exp(-adx / (2.0 * beamWidth));\r
  float beamHalo = 1.3 * exp(-adx / (6.0 * beamWidth)) + 0.3 * exp(-adx / (22.0 * beamWidth));\r
  vec3 haloK = mix(BEAM, sideK, exp(-hp / 80.0));\r
  col += (BEAM * beamCore + haloK * beamHalo) * top * above * drop;\r
  float head = exp(-sq((p.y - front) / 24.0)) * falling;\r
  col += mix(WHITE, BEAM, 0.35) * head * (7.0 * exp(-adx / (2.6 * beamWidth)) + 1.0 * exp(-adx / (14.0 * beamWidth)));\r
\r
  float psi = adx * (outline + 1.0);\r
  float rise = max(hp - 17.9 * flare, 0.0);\r
  float skirtAmp = 16.6 * (exp(-sq(rise / (11.8 * flare))) + 0.3 * exp(-rise / (60.0 * flare)));\r
  float skirtSpread = mix(134.0, 155.0, side) * breathe * flare * flare * mix(0.35, 1.0, min(bloom, 1.0)) * max(bloom, 1.0);\r
  float skirt = skirtAmp * exp(-psi / skirtSpread) * exp(-sq(adx / (max(layerLen, 60.0 * sqrt(uShape.z)) * 1.48))) * hug;\r
  col += sideK * skirt * flowMask * min(bloom, 1.0);\r
\r
  float layer = 12.0 * exp(-adx / layerLen) * exp(-outline / (0.19 * layerLen)) * (1.0 + 0.4 * bead);\r
  col += sideK * layer * hug * flowMask * min(bloom, 1.0);\r
  float washMask = smoothstep(sl - 60.0, sl + 6.0, p.x) * (1.0 - smoothstep(sr - 6.0, sr + 45.0, p.x));\r
  float wash = 1.4 * exp(-adx / 100.0) * exp(-outline / 30.0);\r
  col += mix(BEAM, sideK, 0.25) * wash * hugWide * washMask * flowMask * min(bloom, 1.0);\r
  float highWash = 0.7 * exp(-adx / 140.0) * exp(-outline / 60.0);\r
  col += mix(BEAM, NAVY, 0.5) * highWash * hugWide * washMask * runMask * min(bloom, 1.0);\r
\r
  float sideSign = dx < 0.0 ? 0.0 : 1.0;\r
  float along = 0.5 * log((hp + 1.0) / (adx + 1.0));\r
  float lineScale = 6.0;\r
  float lp = log(max(psi, 1.0) / (120.0 * flare * flare)) * lineScale;\r
  float lineIndex = floor(lp) + sideSign * 97.0;\r
  float wobble = 0.22 * (noise(vec2(lineIndex * 3.7, t * 0.4 + along)) - 0.5);\r
  float lf = fract(lp + wobble) - 0.5;\r
  float gradient = lineScale * length(vec2(hp + 1.0, adx)) / max(psi, 1.0) / uScale;\r
  float halfWidth = max(0.35 * gradient, 0.0001);\r
  float drawWidth = max(halfWidth, 0.6 * gradient);\r
  float lineShape = exp(-lf * lf / (drawWidth * drawWidth)) * (halfWidth / drawWidth);\r
  float lineOn = step(0.3, hash(vec2(lineIndex, 1.3)));\r
  float lineFlow = smoothstep(0.25, 0.85, noise(vec2(lineIndex * 5.3 + 2.0, along * 3.0 + t * 1.1)));\r
  float flareArea = 120.0 * flare * flare;\r
  float lineEnvelope = smoothstep(0.85 * flareArea, 1.4 * flareArea, psi) * (1.0 - smoothstep(3.2 * flareArea, 7.5 * flareArea, psi));\r
  lineEnvelope *= exp(-adx / (layerLen * 1.5)) * hug * flowMask * (1.0 - smoothstep(35.0 * flare, 80.0 * flare, hp));\r
  float lineBright = mix(0.35, 1.0, hash(vec2(lineIndex, 4.0)));\r
  col += mix(sideK, WHITE, 0.6) * lineShape * lineOn * lineFlow * lineEnvelope * lineBright * 2.6 * uAmount.w * min(bloom, 1.0);\r
\r
  float edgeGlow = 22.8 * exp(-sq(adx / (150.0 * uShape.z))) * edgeMask * (1.0 + 0.9 * bead);\r
  float onTop = 1.0 - smoothstep(sy + radius, sy + radius + 10.0, p.y);\r
  float edgeLine = (exp(-sq(max(sd, 0.0) / 0.9)) + 0.12 * exp(-max(sd, 0.0) / 3.0)) * edgeGlow * onTop;\r
  col += mix(sideK, WHITE, 0.6) * edgeLine * min(bloom, 1.0);\r
\r
  float pour = uShape.w;\r
  float baseline = exp(-sq(130.0 / 150.0));\r
  float strengthR = exp(-sq(reachR / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachR)) / baseline * pour;\r
  float strengthL = exp(-sq(reachL / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachL)) / baseline * pour;\r
  float fallY = p.y - sy - 0.3 * radius;\r
  float rightHalf = smoothstep(center.x - 4.0, center.x + 4.0, p.x);\r
  float haloR = exp(-length(p - vec2(sr - 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthR);\r
  float haloL = exp(-length(p - vec2(sl + 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthL);\r
  vec3 glowR;\r
  vec3 glowL;\r
  col += spill(sd, fallY, strengthR, uPour.y, t, glowR) * rightHalf;\r
  col += spill(sd, fallY, strengthL, uPour.x, t, glowL) * (1.0 - rightHalf);\r
  col += easeLight(glowR * rightHalf + NAVY * 0.9 * haloR, uPour.w);\r
  col += easeLight(glowL * (1.0 - rightHalf) + NAVY * 0.9 * haloL, uPour.z);\r
\r
  vec2 toLens = frag - uLens.xy;\r
  float lens = exp(-dot(toLens, toLens) / sq(uLens.z)) * uLens.w;\r
  col *= 1.0 + 0.35 * lens * hug;\r
  float fogAmount = uAmount.y * uAtmosphere;\r
  float near = exp(-adx / 150.0);\r
  float envelope = near * (0.3 + 0.4 * exp(-hp / 50.0) + 1.2 * exp(-p.y / 120.0));\r
  if (fogAmount > 0.001 && h > -2.0 && envelope * max(0.25, 6.0 * exp(-adx / 50.0)) > 0.002) {\r
    vec2 fq = vec2(dx / 1.7, h) / 85.0 + vec2(t * 0.012, -t * 0.03) + uExtra.zw;\r
    vec2 fw = vec2(fbm(fq * 1.3 + vec2(1.7, 9.2) + t * 0.03), fbm(fq * 1.3 + vec2(8.3, 2.8) - t * 0.025));\r
    float cloud = fbm(fq + 1.4 * fw);\r
    float density = smoothstep(0.5, 0.78, cloud);\r
    float lit = exp(-adx / 50.0);\r
    float fogMask = smoothstep(-2.0, 20.0, h);\r
    float reached = smoothstep(front + 80.0, front - 40.0, p.y);\r
    vec3 fog = (HAZE * 0.45 + BEAM * 6.0 * lit * reached) * density * envelope * fogMask;\r
    float surfaceLit = exp(-adx / (layerLen * 1.3)) * exp(-outline / 28.0) * hugWide * flowMask * washMask * min(bloom, 1.0);\r
    fog += sideK * 2.2 * surfaceLit * (smoothstep(0.38, 0.72, cloud) - 0.35) * fogMask;\r
    float smoke = smoothstep(0.3, 0.75, cloud);\r
    fog += BEAM * 0.35 * exp(-adx / (22.0 * beamWidth)) * (0.35 + 0.9 * smoke) * fogMask * top * drop;\r
    col += fog * fogAmount * (1.0 + 1.2 * lens) * mix(1.0, 0.45, uTheme);\r
  }\r
\r
  if (uRevealInfo.y > 0.001 && uLens.w > 0.002) {\r
    vec2 toReveal = frag - uLens.xy;\r
    float reveal = exp(-dot(toReveal, toReveal) / sq(uRevealInfo.x)) * uLens.w;\r
    vec2 uv = frag * uRevealMap.xy + uRevealMap.zw;\r
    float onImage = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);\r
    vec4 ui = texture(uReveal, uv);\r
    float ink = max(ui.r, max(ui.g, ui.b)) * onImage;\r
    float lit = clamp(col.b * 0.9, 0.0, 1.0) * (1.0 - smoothstep(0.9, 2.2, col.b));\r
    float clearance = smoothstep(60.0 * sqrt(beamWidth), 150.0 * sqrt(beamWidth), adx);\r
    col += mix(BEAM, WHITE, 0.4) * ink * reveal * lit * clearance * uRevealInfo.y * 2.2;\r
  }\r
\r
  float haze = col.b;\r
  float dotGrid = 1.0 - smoothstep(0.16, 0.32, length(fract(frag / 3.0) - 0.5));\r
  col += BEAM * dotGrid * clamp(haze, 0.0, 1.5) * (1.0 - smoothstep(1.5, 4.0, haze)) * (0.18 + 0.3 * lens) * uExtra.y;\r
  if (lens > 0.002) {\r
    vec2 drift = frag - vec2(0.0, t * 14.0);\r
    vec2 sparkCell = floor(drift / 7.0);\r
    vec2 sparkPos = (sparkCell + 0.2 + 0.6 * vec2(hash(sparkCell + 5.1), hash(sparkCell + 2.3))) * 7.0;\r
    float sparkDist = length(drift - sparkPos);\r
    float sparkOn = step(0.8, hash(sparkCell + 8.8));\r
    float sparkTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(sparkCell + 3.7) * 6.283);\r
    col += WHITE * exp(-sparkDist * sparkDist / 0.35) * sparkOn * sparkTwinkle * lens * clamp(haze * 1.5, 0.0, 1.0) * 1.6 * uAmount.z;\r
  }\r
\r
  float dustAmount = uAmount.z;\r
  if (dustAmount > 0.001) {\r
    float dustLp = log(max(psi, 1.0) / (120.0 * flare * flare)) * 2.2;\r
    vec2 flowCell = vec2(dustLp / 1.1, (along + t * 0.22) / 0.06);\r
    vec2 cellId = floor(flowCell) + vec2(sideSign * 131.0, 0.0);\r
    vec2 cellJitter = vec2(hash(cellId + 1.7), hash(cellId + 8.3));\r
    vec2 particleFlow = (floor(flowCell) + 0.1 + cellJitter * 0.8) * vec2(1.1, 0.06);\r
    float particlePsi = 120.0 * flare * flare * exp(particleFlow.x / 2.2);\r
    float particleAlong = particleFlow.y - t * 0.22;\r
    float particleX = sqrt(particlePsi * exp(-2.0 * particleAlong)) - 1.0;\r
    float particleH = sqrt(particlePsi * exp(2.0 * particleAlong)) - 1.0;\r
    float particleDist = length(vec2(adx - particleX, hp - particleH)) * uScale;\r
    float particleOn = step(0.62, hash(cellId + 3.1));\r
    float particleTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(cellId + 9.2) * 6.283);\r
    float dustZone = exp(-sq(log(max(psi, 1.0) / (200.0 * flare * flare)) / 0.55)) * hug * flowMask * smoothstep(0.0, 6.0, outline);\r
    col += WHITE * exp(-particleDist * particleDist / 0.3) * particleOn * particleTwinkle * dustZone * 3.0 * dustAmount * min(bloom, 1.0);\r
\r
    vec2 glitterCell = vec2(dx / 3.0, (p.y - t * 26.0) / 9.0);\r
    vec2 glitterId = floor(glitterCell);\r
    vec2 glitterJitter = vec2(hash(glitterId + 4.4), hash(glitterId + 2.9));\r
    vec2 glitterPos = (glitterId + 0.15 + glitterJitter * 0.7) * vec2(3.0, 9.0);\r
    float glitterDist = length(vec2(dx, p.y - t * 26.0) - glitterPos) * uScale;\r
    float glitterOn = step(0.7, hash(glitterId + 6.6));\r
    float glitterTwinkle = 0.5 + 0.5 * sin(t * 6.0 + hash(glitterId + 1.1) * 6.283);\r
    float glitterZone = exp(-adx / (5.0 * beamWidth)) * smoothstep(1.5, 4.0, adx / beamWidth) * above * smoothstep(25.0, 70.0, hp) * top * drop;\r
    col += WHITE * exp(-glitterDist * glitterDist / 0.25) * glitterOn * glitterTwinkle * glitterZone * 2.2 * dustAmount * uAtmosphere;\r
  }\r
\r
  col *= uAmount.x * (1.0 + uIntro.z * 0.9 * exp(-length(vec2(dx, h * 1.6)) / 70.0));\r
  col *= smoothstep(-0.75, 0.25, sd * uScale);\r
\r
  vec3 emit = 1.0 - exp(-col * mix(1.0, 0.6, uTheme));\r
  float peak = max(emit.r, max(emit.g, emit.b));\r
  if (uTheme > 0.5) {\r
    float low = min(emit.r, min(emit.g, emit.b));\r
    float chroma = peak - low;\r
    vec3 hue = (emit - low) / max(chroma, 0.0001);\r
    float alpha = clamp(pow(chroma, 1.35) * 1.3, 0.0, 1.0) * 0.9;\r
    outColor = vec4((hue * 0.82 + 0.06) * alpha, alpha);\r
  } else {\r
    outColor = vec4(emit, peak);\r
  }\r
}\`;\r
\r
const TINTS = [\r
  [0, 1],\r
  [-11.5, 0.77],\r
  [9.5, 0.95],\r
  [-53.5, 0.79],\r
  [39.5, 0.77],\r
  [16, 0.81],\r
  [-16.3, 0.92],\r
  [13.3, 0.96],\r
  [3, 1.01],\r
  [1, 0.68],\r
  [1, 1.15],\r
  [142.5, 0.51],\r
  [113.6, 0.28],\r
  [-7.5, 0.13],\r
  [-2.7, 0.32],\r
  [7.5, 0.81]\r
];\r
\r
const BASE_SATURATION = 0.78;\r
const MAX_RENDER_DIM = 2048;\r
const INTRO_DROP = 1.25;\r
const INTRO_END = 5;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const easeOut = x => 1 - Math.pow(1 - clamp(x, 0, 1), 3);\r
const spring = time => {\r
  const omega = 8;\r
  const zeta = 0.62;\r
  const damped = omega * Math.sqrt(1 - zeta * zeta);\r
  return (\r
    1 - Math.exp(-zeta * omega * time) * (Math.cos(damped * time) + ((zeta * omega) / damped) * Math.sin(damped * time))\r
  );\r
};\r
\r
const toHsv = ([r, g, b]) => {\r
  const max = Math.max(r, g, b);\r
  const min = Math.min(r, g, b);\r
  const delta = max - min;\r
  let hue = 0;\r
  if (delta > 0) {\r
    if (max === r) hue = ((g - b) / delta) % 6;\r
    else if (max === g) hue = (b - r) / delta + 2;\r
    else hue = (r - g) / delta + 4;\r
  }\r
  return [(hue * 60 + 360) % 360, max > 0 ? delta / max : 0];\r
};\r
\r
const fromHsv = (hue, saturation) => {\r
  const h = (((hue % 360) + 360) % 360) / 60;\r
  const c = saturation;\r
  const x = c * (1 - Math.abs((h % 2) - 1));\r
  const m = 1 - c;\r
  const [r, g, b] =\r
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];\r
  return [r + m, g + m, b + m];\r
};\r
\r
const buildTints = rgb => {\r
  const [hue, saturation] = toHsv(rgb);\r
  const strength = saturation / BASE_SATURATION;\r
  const data = new Float32Array(TINTS.length * 3);\r
  TINTS.forEach(([shift, scale], index) => {\r
    data.set(fromHsv(hue + shift, clamp(BASE_SATURATION * scale * strength, 0, 1)), index * 3);\r
  });\r
  return data;\r
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
const link = (gl, vertexSource, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl, program, names) => {\r
  const result = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
export const LaserFlow = ({\r
  surfaceRef,\r
  beamPosition = 0.6,\r
  surfaceLevel = 1,\r
  color = '#3847ff',\r
  intensity = 1.8,\r
  beamWidth = 1.5,\r
  flare = 1.5,\r
  spread = 1.5,\r
  spill = 1,\r
  fog = 0.2,\r
  dust = 1.6,\r
  streaks = 1.5,\r
  dots = 1,\r
  pulse = 1.5,\r
  speed = 1.5,\r
  seed = 3,\r
  mouseInteraction = true,\r
  revealImage,\r
  revealRadius = 220,\r
  revealOpacity = 0.6,\r
  intro = true,\r
  theme = 'dark',\r
  paused = false,\r
  dpr,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    surfaceRef,\r
    beamPosition: clamp(beamPosition, 0, 1),\r
    surfaceLevel: clamp(surfaceLevel, 0, 1),\r
    color: String(color),\r
    intensity: Math.max(0, intensity),\r
    beamWidth: clamp(beamWidth, 0.2, 5),\r
    flare: clamp(flare, 0.2, 4),\r
    spread: clamp(spread, 0.1, 4),\r
    spill: Math.max(0, spill),\r
    fog: Math.max(0, fog),\r
    dust: Math.max(0, dust),\r
    streaks: Math.max(0, streaks),\r
    dots: Math.max(0, dots),\r
    pulse: Math.max(0, pulse),\r
    speed,\r
    seed,\r
    mouseInteraction,\r
    revealImage,\r
    revealRadius: Math.max(1, revealRadius),\r
    revealOpacity: clamp(revealOpacity, 0, 1),\r
    intro,\r
    theme,\r
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
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl, VERTEX, FRAGMENT);\r
    if (!program) return undefined;\r
\r
    const uniforms = locate(gl, program, [\r
      'uResolution',\r
      'uDpr',\r
      'uScale',\r
      'uTime',\r
      'uBeamX',\r
      'uSurface',\r
      'uRadius',\r
      'uIntro',\r
      'uPour',\r
      'uRun',\r
      'uLens',\r
      'uReveal',\r
      'uRevealMap',\r
      'uRevealInfo',\r
      'uAtmosphere',\r
      'uAmount',\r
      'uShape',\r
      'uExtra',\r
      'uTheme',\r
      'uTint'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const positionLocation = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(positionLocation);\r
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const revealTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      introTime: settingsRef.current.intro && !reduce ? 0 : INTRO_END,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      colorKey: '',\r
      tints: buildTints([0.22, 0.28, 1]),\r
      observed: null,\r
      pointer: { x: 0, y: 0, inside: false },\r
      lens: { x: 0, y: 0, vx: 0, vy: 0, strength: 0, placed: false },\r
      reveal: { src: '', ready: false, width: 1, height: 1, image: null }\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = value => {\r
      if (!probeContext) return [0.22, 0.28, 1];\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#3847ff';\r
      probeContext.fillStyle = value;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColor = s => {\r
      if (s.color === state.colorKey) return;\r
      state.colorKey = s.color;\r
      state.tints = buildTints(toRgb(s.color));\r
    };\r
\r
    const resolveReveal = s => {\r
      const src = s.revealImage ? String(s.revealImage) : '';\r
      const reveal = state.reveal;\r
      if (src === reveal.src) return;\r
      reveal.src = src;\r
      reveal.ready = false;\r
      if (reveal.image) reveal.image.onload = null;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || reveal.src !== src) return;\r
        const width = image.naturalWidth || image.width || 1;\r
        const height = image.naturalHeight || image.height || 1;\r
        const scale = Math.min(1, 2048 / Math.max(width, height));\r
        const sheet = document.createElement('canvas');\r
        sheet.width = Math.max(1, Math.round(width * scale));\r
        sheet.height = Math.max(1, Math.round(height * scale));\r
        sheet.getContext('2d')?.drawImage(image, 0, 0, sheet.width, sheet.height);\r
        gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
        reveal.width = sheet.width;\r
        reveal.height = sheet.height;\r
        reveal.ready = true;\r
        wakeRef.current?.();\r
      };\r
      image.src = src;\r
      reveal.image = image;\r
    };\r
\r
    const measure = (s, width, height) => {\r
      const element = s.surfaceRef?.current ?? null;\r
      if (element !== state.observed) {\r
        if (state.observed) resizeObserver.unobserve(state.observed);\r
        if (element) resizeObserver.observe(element);\r
        state.observed = element;\r
      }\r
      if (element) {\r
        const box = container.getBoundingClientRect();\r
        const rect = element.getBoundingClientRect();\r
        if (rect.width > 0) {\r
          const computed = getComputedStyle(element);\r
          const radius = Math.max(\r
            parseFloat(computed.borderTopLeftRadius) || 0,\r
            parseFloat(computed.borderTopRightRadius) || 0\r
          );\r
          return {\r
            left: rect.left - box.left,\r
            top: rect.top - box.top,\r
            right: rect.right - box.left,\r
            bottom: rect.bottom - box.top,\r
            radius: Math.min(radius, rect.width / 2, rect.height / 2),\r
            real: true\r
          };\r
        }\r
      }\r
      return {\r
        left: -width * 2,\r
        top: s.surfaceLevel * height,\r
        right: width * 3,\r
        bottom: height * 3,\r
        radius: 0,\r
        real: false\r
      };\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const s = settingsRef.current;\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = canvas.width / width;\r
      render();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColor(s);\r
      const { width, height } = state;\r
      const scale = Math.max(0.2, Math.min(width / 585, height / 507));\r
      let surface = measure(s, width, height);\r
      let beamX = s.beamPosition * width;\r
      if (surface.real) {\r
        const margin = surface.radius + 6;\r
        if (beamX >= surface.left && beamX <= surface.right) {\r
          beamX = clamp(beamX, surface.left + margin, surface.right - margin);\r
        } else {\r
          surface = { left: -width * 2, top: height, right: width * 3, bottom: height * 3, radius: 0, real: false };\r
        }\r
      }\r
      const startY = -0.15 * height;\r
      const span = surface.top - startY + 0.3 * height;\r
      const it = state.introTime;\r
      const settled = it >= INTRO_END;\r
      const front = settled ? surface.top + 0.3 * height : startY + span * Math.pow(clamp(it / INTRO_DROP, 0, 1), 1.3);\r
      const impact = INTRO_DROP * Math.pow(Math.max(0, surface.top - startY) / span, 1 / 1.3);\r
      const tau = it - impact;\r
      const bloom = settled ? 1 : tau <= 0 ? 0 : spring(tau);\r
      const flash = settled || tau <= 0 ? 0 : Math.exp(-tau / 0.35) * (1 - Math.exp(-tau / 0.05));\r
      const runRange = s.spread * 250 * 1.3 + 80;\r
      const runFront = settled ? 100000 : tau <= 0 ? -40 : runRange * (1 - Math.exp(-1.15 * tau));\r
      const beadStrength = settled || tau <= 0 ? 0 : Math.exp(-1.15 * tau) * (1 - Math.exp(-tau / 0.08));\r
      const pour = reach => {\r
        if (settled) return [1000, 1];\r
        if (tau <= 0) return [-reach, 0];\r
        const target = Math.min(reach, runRange * 0.97);\r
        const arrival = -Math.log(1 - target / runRange) / 1.15;\r
        const elapsed = tau - arrival;\r
        const ease = clamp((elapsed + 0.15) / 0.8, 0, 1);\r
        const fill = ease * ease * ease * (ease * (ease * 6 - 15) + 10);\r
        if (elapsed <= 0) return [runFront - target, fill];\r
        const speed = 1.15 * (runRange - target);\r
        return [speed * elapsed + 260 * elapsed * elapsed, fill];\r
      };\r
      const [frontL, fillL] = pour((beamX - surface.left) / scale);\r
      const [frontR, fillR] = pour((surface.right - beamX) / scale);\r
      const atmosphere = settled\r
        ? 1\r
        : tau <= 0\r
          ? 0.3 * easeOut(it / INTRO_DROP)\r
          : 0.3 + 0.7 * (1 - Math.exp(-1.3 * tau));\r
      const seedValue = Number(s.seed) || 0;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.uResolution, width, height);\r
      gl.uniform1f(uniforms.uDpr, state.ratio);\r
      gl.uniform1f(uniforms.uScale, scale);\r
      gl.uniform1f(uniforms.uTime, state.time);\r
      gl.uniform1f(uniforms.uBeamX, beamX);\r
      gl.uniform4f(uniforms.uSurface, surface.left, surface.top, surface.right, surface.bottom);\r
      gl.uniform1f(uniforms.uRadius, surface.radius);\r
      gl.uniform3f(uniforms.uIntro, front, bloom, flash);\r
      gl.uniform4f(uniforms.uPour, frontL, frontR, fillL, fillR);\r
      gl.uniform2f(uniforms.uRun, runFront, beadStrength);\r
      gl.uniform4f(uniforms.uLens, state.lens.x, state.lens.y, 95 * scale, state.lens.strength);\r
      resolveReveal(s);\r
      const { reveal } = state;\r
      const cover = Math.max(width / reveal.width, height / reveal.height);\r
      const coverWidth = reveal.width * cover;\r
      const coverHeight = reveal.height * cover;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
      gl.uniform1i(uniforms.uReveal, 0);\r
      gl.uniform4f(\r
        uniforms.uRevealMap,\r
        1 / coverWidth,\r
        1 / coverHeight,\r
        (coverWidth - width) / 2 / coverWidth,\r
        (coverHeight - height) / 2 / coverHeight\r
      );\r
      gl.uniform2f(uniforms.uRevealInfo, s.revealRadius, reveal.ready ? s.revealOpacity : 0);\r
      gl.uniform1f(uniforms.uAtmosphere, atmosphere);\r
      gl.uniform4f(uniforms.uAmount, s.intensity, s.fog, s.dust, s.streaks);\r
      gl.uniform4f(uniforms.uShape, s.beamWidth, s.flare, s.spread, s.spill);\r
      gl.uniform4f(uniforms.uExtra, s.pulse, s.dots, 34.34 + seedValue * 7.31, 11.58 + seedValue * 3.17);\r
      gl.uniform1f(uniforms.uTheme, s.theme === 'light' ? 1 : 0);\r
      gl.uniform3fv(uniforms.uTint, state.tints);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      const introducing = state.introTime < INTRO_END;\r
      if (introducing) state.introTime = Math.min(INTRO_END, state.introTime + dt);\r
\r
      const { pointer, lens } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      if (active && !lens.placed) {\r
        lens.x = pointer.x;\r
        lens.y = pointer.y;\r
        lens.vx = 0;\r
        lens.vy = 0;\r
        lens.placed = true;\r
      }\r
      const ax = 120 * (pointer.x - lens.x) - 19 * lens.vx;\r
      const ay = 120 * (pointer.y - lens.y) - 19 * lens.vy;\r
      lens.vx += ax * dt;\r
      lens.vy += ay * dt;\r
      lens.x += lens.vx * dt;\r
      lens.y += lens.vy * dt;\r
      const goal = active ? 1 : 0;\r
      lens.strength += (goal - lens.strength) * (1 - Math.exp(-dt / (goal > lens.strength ? 0.3 : 0.55)));\r
      if (lens.strength < 0.001 && !active) lens.placed = false;\r
\r
      render();\r
      const settling =\r
        Math.abs(state.lens.strength - (s.mouseInteraction && state.pointer.inside ? 1 : 0)) > 0.002 ||\r
        Math.hypot(state.lens.vx, state.lens.vy) > 0.5;\r
      if (moving || introducing || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
      wake();\r
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
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(revealTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div ref={containerRef} className={\`laser-flow-container\${className ? \` \${className}\` : ''}\`} {...attributes}>\r
      <canvas ref={canvasRef} className="laser-flow-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LaserFlow;\r
`,r=`.laser-flow-container {\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
  pointer-events: none;\r
}\r
\r
.laser-flow-canvas {\r
  position: absolute;\r
  inset: 0;\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
out vec4 outColor;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform float uScale;\r
uniform float uTime;\r
uniform float uBeamX;\r
uniform vec4 uSurface;\r
uniform float uRadius;\r
uniform vec3 uIntro;\r
uniform vec4 uPour;\r
uniform vec2 uRun;\r
uniform vec4 uLens;\r
uniform sampler2D uReveal;\r
uniform vec4 uRevealMap;\r
uniform vec2 uRevealInfo;\r
uniform float uAtmosphere;\r
uniform vec4 uAmount;\r
uniform vec4 uShape;\r
uniform vec4 uExtra;\r
uniform float uTheme;\r
uniform vec3 uTint[16];\r
\r
#define BEAM uTint[0]\r
#define LEFT uTint[1]\r
#define RIGHT uTint[2]\r
#define CYAN uTint[3]\r
#define PINK uTint[4]\r
#define LILAC uTint[5]\r
#define SKY uTint[6]\r
#define PURPLE uTint[7]\r
#define DEEP uTint[8]\r
#define MIST uTint[9]\r
#define NAVY uTint[10]\r
#define WARM uTint[11]\r
#define EMBER uTint[12]\r
#define WHITE uTint[13]\r
#define HAZE uTint[14]\r
#define LAVENDER uTint[15]\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);\r
}\r
\r
float fbm(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);\r
  for (int i = 0; i < 5; i++) {\r
    v += a * noise(p);\r
    p = m * p;\r
    a *= 0.5;\r
  }\r
  return v;\r
}\r
\r
float sq(float x) {\r
  return x * x;\r
}\r
\r
float roundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
vec3 spill(float e, float fall, float strength, float front, float t, out vec3 glow) {\r
  glow = vec3(0.0);\r
  if (strength < 0.0005) return vec3(0.0);\r
  float f = max(fall, 0.0);\r
  float d = max(e, 0.0);\r
  float u = d / (6.0 + 0.28 * f);\r
  float start = smoothstep(-6.0, 12.0, fall);\r
  float fade = exp(-sq(max(f - 125.0, 0.0) / 40.0));\r
  float streak = 0.88 + 0.24 * noise(vec2(u * 6.0, f / 22.0 - t * 1.7));\r
  float bright = pow(strength, 1.5);\r
  float soft = sqrt(strength);\r
  float warmth = smoothstep(90.0, 130.0, f);\r
  vec3 coreK = mix(WHITE, WARM, warmth * exp(-d / 9.0));\r
  float core = mix(9.0, 2.6, warmth) * exp(-sq(d / (3.5 + 0.04 * f))) * exp(-sq(max(f - 130.0, 0.0) / 38.0));\r
  float wall = 24.0 * exp(-sq(d / 1.1)) * exp(-sq(max(f - 100.0, 0.0) / 30.0));\r
  float bandCenter = 0.7 - 0.3 * smoothstep(30.0, 110.0, f);\r
  float offset = u - bandCenter;\r
  float decay = (1.05 - bandCenter) / 1.31;\r
  float profile = offset < 0.0 ? exp(-sq(offset / 0.3)) : exp(-offset / decay);\r
  profile *= 1.0 - smoothstep(1.0, 1.4, u);\r
  vec3 bandA = mix(CYAN, PINK, smoothstep(50.0, 75.0, f));\r
  bandA = mix(bandA, LILAC, smoothstep(100.0, 125.0, f));\r
  vec3 bandB = mix(SKY, PURPLE, smoothstep(50.0, 75.0, f));\r
  vec3 fanK = mix(bandA, bandB, smoothstep(0.06, 0.18, offset));\r
  fanK = mix(fanK, DEEP, smoothstep(0.22, 0.42, offset));\r
  vec3 thread = WHITE * wall * bright + coreK * core * streak * bright;\r
  glow += fanK * 4.5 * profile * fade * streak * bright;\r
  glow += MIST * 0.7 * exp(-max(u - 1.0, 0.0) / 0.9) * smoothstep(0.7, 1.2, u) * fade * soft;\r
  glow += EMBER * 0.35 * exp(-sq((f - 165.0) / 22.0)) * exp(-d / 25.0) * bright;\r
  float lag = u * (6.0 + 0.28 * f) * 0.35;\r
  float reveal = 1.0 - smoothstep(front - 70.0, front + 8.0, f + lag);\r
  glow *= start * reveal;\r
  return thread * start * reveal;\r
}\r
\r
vec3 easeLight(vec3 light, float amount) {\r
  return -log(max(1.0 - amount * (1.0 - exp(-light)), vec3(0.0001)));\r
}\r
\r
void main() {\r
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y * uDpr - gl_FragCoord.y) / uDpr;\r
  vec2 p = frag / uScale;\r
  float t = uTime;\r
  float bx = uBeamX / uScale;\r
  float sl = uSurface.x / uScale;\r
  float sy = uSurface.y / uScale;\r
  float sr = uSurface.z / uScale;\r
  float sb = uSurface.w / uScale;\r
  float radius = uRadius / uScale;\r
  float dx = p.x - bx;\r
  float adx = abs(dx);\r
  float h = sy - p.y;\r
  float hp = max(h, 0.0);\r
  float above = smoothstep(-0.5, 0.5, h);\r
  float side = smoothstep(-24.0, 24.0, dx);\r
  vec3 sideK = mix(mix(LAVENDER, LEFT, smoothstep(40.0, 140.0, adx)), RIGHT, side);\r
  float beamWidth = uShape.x;\r
  float flare = uShape.y;\r
  float spread = 250.0 * uShape.z;\r
  float reachL = max(bx - sl, 1.0);\r
  float reachR = max(sr - bx, 1.0);\r
  float reach = dx < 0.0 ? reachL : reachR;\r
  float layerLen = clamp(0.29 * reach, 20.0, 100.0) * sqrt(uShape.z);\r
  float run = uRun.x;\r
  float runMask = 1.0 - smoothstep(run - 34.0, run + 6.0, adx);\r
  float bead = exp(-sq((adx - run + 16.0) / (18.0 + 0.04 * run))) * uRun.y;\r
  float flowMask = (1.0 - smoothstep(0.75 * spread, 1.1 * spread, adx)) * runMask;\r
  float edgeMask = (1.0 - smoothstep(0.8 * spread, 1.25 * spread, adx)) * runMask;\r
  float bloom = uIntro.y;\r
  vec2 center = vec2((sl + sr) * 0.5, (sy + sb) * 0.5);\r
  vec2 halfSize = vec2((sr - sl) * 0.5, (sb - sy) * 0.5);\r
  float sd = roundBox(p - center, halfSize, radius);\r
  float outline = max(sd, 0.0);\r
  float below = max(p.y - sy - radius, 0.0);\r
  float hug = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 14.0));\r
  float hugWide = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 40.0));\r
\r
  vec3 col = vec3(0.0);\r
\r
  float breathe = 1.0 + uExtra.x * (0.12 * sin(t * 1.5708) + 0.08 * (noise(vec2(t * 0.5, 3.0)) - 0.5));\r
\r
  float front = uIntro.x / uScale;\r
  float drop = smoothstep(front + 10.0, front - 110.0, p.y);\r
  float falling = 1.0 - smoothstep(sy - 24.0, sy, front);\r
  float top = mix(0.3, 1.0, smoothstep(0.0, 0.3 * sy, p.y));\r
  float beamCore = 24.0 * exp(-adx / (2.0 * beamWidth));\r
  float beamHalo = 1.3 * exp(-adx / (6.0 * beamWidth)) + 0.3 * exp(-adx / (22.0 * beamWidth));\r
  vec3 haloK = mix(BEAM, sideK, exp(-hp / 80.0));\r
  col += (BEAM * beamCore + haloK * beamHalo) * top * above * drop;\r
  float head = exp(-sq((p.y - front) / 24.0)) * falling;\r
  col += mix(WHITE, BEAM, 0.35) * head * (7.0 * exp(-adx / (2.6 * beamWidth)) + 1.0 * exp(-adx / (14.0 * beamWidth)));\r
\r
  float psi = adx * (outline + 1.0);\r
  float rise = max(hp - 17.9 * flare, 0.0);\r
  float skirtAmp = 16.6 * (exp(-sq(rise / (11.8 * flare))) + 0.3 * exp(-rise / (60.0 * flare)));\r
  float skirtSpread = mix(134.0, 155.0, side) * breathe * flare * flare * mix(0.35, 1.0, min(bloom, 1.0)) * max(bloom, 1.0);\r
  float skirt = skirtAmp * exp(-psi / skirtSpread) * exp(-sq(adx / (max(layerLen, 60.0 * sqrt(uShape.z)) * 1.48))) * hug;\r
  col += sideK * skirt * flowMask * min(bloom, 1.0);\r
\r
  float layer = 12.0 * exp(-adx / layerLen) * exp(-outline / (0.19 * layerLen)) * (1.0 + 0.4 * bead);\r
  col += sideK * layer * hug * flowMask * min(bloom, 1.0);\r
  float washMask = smoothstep(sl - 60.0, sl + 6.0, p.x) * (1.0 - smoothstep(sr - 6.0, sr + 45.0, p.x));\r
  float wash = 1.4 * exp(-adx / 100.0) * exp(-outline / 30.0);\r
  col += mix(BEAM, sideK, 0.25) * wash * hugWide * washMask * flowMask * min(bloom, 1.0);\r
  float highWash = 0.7 * exp(-adx / 140.0) * exp(-outline / 60.0);\r
  col += mix(BEAM, NAVY, 0.5) * highWash * hugWide * washMask * runMask * min(bloom, 1.0);\r
\r
  float sideSign = dx < 0.0 ? 0.0 : 1.0;\r
  float along = 0.5 * log((hp + 1.0) / (adx + 1.0));\r
  float lineScale = 6.0;\r
  float lp = log(max(psi, 1.0) / (120.0 * flare * flare)) * lineScale;\r
  float lineIndex = floor(lp) + sideSign * 97.0;\r
  float wobble = 0.22 * (noise(vec2(lineIndex * 3.7, t * 0.4 + along)) - 0.5);\r
  float lf = fract(lp + wobble) - 0.5;\r
  float gradient = lineScale * length(vec2(hp + 1.0, adx)) / max(psi, 1.0) / uScale;\r
  float halfWidth = max(0.35 * gradient, 0.0001);\r
  float drawWidth = max(halfWidth, 0.6 * gradient);\r
  float lineShape = exp(-lf * lf / (drawWidth * drawWidth)) * (halfWidth / drawWidth);\r
  float lineOn = step(0.3, hash(vec2(lineIndex, 1.3)));\r
  float lineFlow = smoothstep(0.25, 0.85, noise(vec2(lineIndex * 5.3 + 2.0, along * 3.0 + t * 1.1)));\r
  float flareArea = 120.0 * flare * flare;\r
  float lineEnvelope = smoothstep(0.85 * flareArea, 1.4 * flareArea, psi) * (1.0 - smoothstep(3.2 * flareArea, 7.5 * flareArea, psi));\r
  lineEnvelope *= exp(-adx / (layerLen * 1.5)) * hug * flowMask * (1.0 - smoothstep(35.0 * flare, 80.0 * flare, hp));\r
  float lineBright = mix(0.35, 1.0, hash(vec2(lineIndex, 4.0)));\r
  col += mix(sideK, WHITE, 0.6) * lineShape * lineOn * lineFlow * lineEnvelope * lineBright * 2.6 * uAmount.w * min(bloom, 1.0);\r
\r
  float edgeGlow = 22.8 * exp(-sq(adx / (150.0 * uShape.z))) * edgeMask * (1.0 + 0.9 * bead);\r
  float onTop = 1.0 - smoothstep(sy + radius, sy + radius + 10.0, p.y);\r
  float edgeLine = (exp(-sq(max(sd, 0.0) / 0.9)) + 0.12 * exp(-max(sd, 0.0) / 3.0)) * edgeGlow * onTop;\r
  col += mix(sideK, WHITE, 0.6) * edgeLine * min(bloom, 1.0);\r
\r
  float pour = uShape.w;\r
  float baseline = exp(-sq(130.0 / 150.0));\r
  float strengthR = exp(-sq(reachR / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachR)) / baseline * pour;\r
  float strengthL = exp(-sq(reachL / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachL)) / baseline * pour;\r
  float fallY = p.y - sy - 0.3 * radius;\r
  float rightHalf = smoothstep(center.x - 4.0, center.x + 4.0, p.x);\r
  float haloR = exp(-length(p - vec2(sr - 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthR);\r
  float haloL = exp(-length(p - vec2(sl + 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthL);\r
  vec3 glowR;\r
  vec3 glowL;\r
  col += spill(sd, fallY, strengthR, uPour.y, t, glowR) * rightHalf;\r
  col += spill(sd, fallY, strengthL, uPour.x, t, glowL) * (1.0 - rightHalf);\r
  col += easeLight(glowR * rightHalf + NAVY * 0.9 * haloR, uPour.w);\r
  col += easeLight(glowL * (1.0 - rightHalf) + NAVY * 0.9 * haloL, uPour.z);\r
\r
  vec2 toLens = frag - uLens.xy;\r
  float lens = exp(-dot(toLens, toLens) / sq(uLens.z)) * uLens.w;\r
  col *= 1.0 + 0.35 * lens * hug;\r
  float fogAmount = uAmount.y * uAtmosphere;\r
  float near = exp(-adx / 150.0);\r
  float envelope = near * (0.3 + 0.4 * exp(-hp / 50.0) + 1.2 * exp(-p.y / 120.0));\r
  if (fogAmount > 0.001 && h > -2.0 && envelope * max(0.25, 6.0 * exp(-adx / 50.0)) > 0.002) {\r
    vec2 fq = vec2(dx / 1.7, h) / 85.0 + vec2(t * 0.012, -t * 0.03) + uExtra.zw;\r
    vec2 fw = vec2(fbm(fq * 1.3 + vec2(1.7, 9.2) + t * 0.03), fbm(fq * 1.3 + vec2(8.3, 2.8) - t * 0.025));\r
    float cloud = fbm(fq + 1.4 * fw);\r
    float density = smoothstep(0.5, 0.78, cloud);\r
    float lit = exp(-adx / 50.0);\r
    float fogMask = smoothstep(-2.0, 20.0, h);\r
    float reached = smoothstep(front + 80.0, front - 40.0, p.y);\r
    vec3 fog = (HAZE * 0.45 + BEAM * 6.0 * lit * reached) * density * envelope * fogMask;\r
    float surfaceLit = exp(-adx / (layerLen * 1.3)) * exp(-outline / 28.0) * hugWide * flowMask * washMask * min(bloom, 1.0);\r
    fog += sideK * 2.2 * surfaceLit * (smoothstep(0.38, 0.72, cloud) - 0.35) * fogMask;\r
    float smoke = smoothstep(0.3, 0.75, cloud);\r
    fog += BEAM * 0.35 * exp(-adx / (22.0 * beamWidth)) * (0.35 + 0.9 * smoke) * fogMask * top * drop;\r
    col += fog * fogAmount * (1.0 + 1.2 * lens) * mix(1.0, 0.45, uTheme);\r
  }\r
\r
  if (uRevealInfo.y > 0.001 && uLens.w > 0.002) {\r
    vec2 toReveal = frag - uLens.xy;\r
    float reveal = exp(-dot(toReveal, toReveal) / sq(uRevealInfo.x)) * uLens.w;\r
    vec2 uv = frag * uRevealMap.xy + uRevealMap.zw;\r
    float onImage = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);\r
    vec4 ui = texture(uReveal, uv);\r
    float ink = max(ui.r, max(ui.g, ui.b)) * onImage;\r
    float lit = clamp(col.b * 0.9, 0.0, 1.0) * (1.0 - smoothstep(0.9, 2.2, col.b));\r
    float clearance = smoothstep(60.0 * sqrt(beamWidth), 150.0 * sqrt(beamWidth), adx);\r
    col += mix(BEAM, WHITE, 0.4) * ink * reveal * lit * clearance * uRevealInfo.y * 2.2;\r
  }\r
\r
  float haze = col.b;\r
  float dotGrid = 1.0 - smoothstep(0.16, 0.32, length(fract(frag / 3.0) - 0.5));\r
  col += BEAM * dotGrid * clamp(haze, 0.0, 1.5) * (1.0 - smoothstep(1.5, 4.0, haze)) * (0.18 + 0.3 * lens) * uExtra.y;\r
  if (lens > 0.002) {\r
    vec2 drift = frag - vec2(0.0, t * 14.0);\r
    vec2 sparkCell = floor(drift / 7.0);\r
    vec2 sparkPos = (sparkCell + 0.2 + 0.6 * vec2(hash(sparkCell + 5.1), hash(sparkCell + 2.3))) * 7.0;\r
    float sparkDist = length(drift - sparkPos);\r
    float sparkOn = step(0.8, hash(sparkCell + 8.8));\r
    float sparkTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(sparkCell + 3.7) * 6.283);\r
    col += WHITE * exp(-sparkDist * sparkDist / 0.35) * sparkOn * sparkTwinkle * lens * clamp(haze * 1.5, 0.0, 1.0) * 1.6 * uAmount.z;\r
  }\r
\r
  float dustAmount = uAmount.z;\r
  if (dustAmount > 0.001) {\r
    float dustLp = log(max(psi, 1.0) / (120.0 * flare * flare)) * 2.2;\r
    vec2 flowCell = vec2(dustLp / 1.1, (along + t * 0.22) / 0.06);\r
    vec2 cellId = floor(flowCell) + vec2(sideSign * 131.0, 0.0);\r
    vec2 cellJitter = vec2(hash(cellId + 1.7), hash(cellId + 8.3));\r
    vec2 particleFlow = (floor(flowCell) + 0.1 + cellJitter * 0.8) * vec2(1.1, 0.06);\r
    float particlePsi = 120.0 * flare * flare * exp(particleFlow.x / 2.2);\r
    float particleAlong = particleFlow.y - t * 0.22;\r
    float particleX = sqrt(particlePsi * exp(-2.0 * particleAlong)) - 1.0;\r
    float particleH = sqrt(particlePsi * exp(2.0 * particleAlong)) - 1.0;\r
    float particleDist = length(vec2(adx - particleX, hp - particleH)) * uScale;\r
    float particleOn = step(0.62, hash(cellId + 3.1));\r
    float particleTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(cellId + 9.2) * 6.283);\r
    float dustZone = exp(-sq(log(max(psi, 1.0) / (200.0 * flare * flare)) / 0.55)) * hug * flowMask * smoothstep(0.0, 6.0, outline);\r
    col += WHITE * exp(-particleDist * particleDist / 0.3) * particleOn * particleTwinkle * dustZone * 3.0 * dustAmount * min(bloom, 1.0);\r
\r
    vec2 glitterCell = vec2(dx / 3.0, (p.y - t * 26.0) / 9.0);\r
    vec2 glitterId = floor(glitterCell);\r
    vec2 glitterJitter = vec2(hash(glitterId + 4.4), hash(glitterId + 2.9));\r
    vec2 glitterPos = (glitterId + 0.15 + glitterJitter * 0.7) * vec2(3.0, 9.0);\r
    float glitterDist = length(vec2(dx, p.y - t * 26.0) - glitterPos) * uScale;\r
    float glitterOn = step(0.7, hash(glitterId + 6.6));\r
    float glitterTwinkle = 0.5 + 0.5 * sin(t * 6.0 + hash(glitterId + 1.1) * 6.283);\r
    float glitterZone = exp(-adx / (5.0 * beamWidth)) * smoothstep(1.5, 4.0, adx / beamWidth) * above * smoothstep(25.0, 70.0, hp) * top * drop;\r
    col += WHITE * exp(-glitterDist * glitterDist / 0.25) * glitterOn * glitterTwinkle * glitterZone * 2.2 * dustAmount * uAtmosphere;\r
  }\r
\r
  col *= uAmount.x * (1.0 + uIntro.z * 0.9 * exp(-length(vec2(dx, h * 1.6)) / 70.0));\r
  col *= smoothstep(-0.75, 0.25, sd * uScale);\r
\r
  vec3 emit = 1.0 - exp(-col * mix(1.0, 0.6, uTheme));\r
  float peak = max(emit.r, max(emit.g, emit.b));\r
  if (uTheme > 0.5) {\r
    float low = min(emit.r, min(emit.g, emit.b));\r
    float chroma = peak - low;\r
    vec3 hue = (emit - low) / max(chroma, 0.0001);\r
    float alpha = clamp(pow(chroma, 1.35) * 1.3, 0.0, 1.0) * 0.9;\r
    outColor = vec4((hue * 0.82 + 0.06) * alpha, alpha);\r
  } else {\r
    outColor = vec4(emit, peak);\r
  }\r
}\`;\r
\r
const TINTS = [\r
  [0, 1],\r
  [-11.5, 0.77],\r
  [9.5, 0.95],\r
  [-53.5, 0.79],\r
  [39.5, 0.77],\r
  [16, 0.81],\r
  [-16.3, 0.92],\r
  [13.3, 0.96],\r
  [3, 1.01],\r
  [1, 0.68],\r
  [1, 1.15],\r
  [142.5, 0.51],\r
  [113.6, 0.28],\r
  [-7.5, 0.13],\r
  [-2.7, 0.32],\r
  [7.5, 0.81]\r
];\r
\r
const BASE_SATURATION = 0.78;\r
const MAX_RENDER_DIM = 2048;\r
const INTRO_DROP = 1.25;\r
const INTRO_END = 5;\r
\r
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));\r
const easeOut = x => 1 - Math.pow(1 - clamp(x, 0, 1), 3);\r
const spring = time => {\r
  const omega = 8;\r
  const zeta = 0.62;\r
  const damped = omega * Math.sqrt(1 - zeta * zeta);\r
  return (\r
    1 - Math.exp(-zeta * omega * time) * (Math.cos(damped * time) + ((zeta * omega) / damped) * Math.sin(damped * time))\r
  );\r
};\r
\r
const toHsv = ([r, g, b]) => {\r
  const max = Math.max(r, g, b);\r
  const min = Math.min(r, g, b);\r
  const delta = max - min;\r
  let hue = 0;\r
  if (delta > 0) {\r
    if (max === r) hue = ((g - b) / delta) % 6;\r
    else if (max === g) hue = (b - r) / delta + 2;\r
    else hue = (r - g) / delta + 4;\r
  }\r
  return [(hue * 60 + 360) % 360, max > 0 ? delta / max : 0];\r
};\r
\r
const fromHsv = (hue, saturation) => {\r
  const h = (((hue % 360) + 360) % 360) / 60;\r
  const c = saturation;\r
  const x = c * (1 - Math.abs((h % 2) - 1));\r
  const m = 1 - c;\r
  const [r, g, b] =\r
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];\r
  return [r + m, g + m, b + m];\r
};\r
\r
const buildTints = rgb => {\r
  const [hue, saturation] = toHsv(rgb);\r
  const strength = saturation / BASE_SATURATION;\r
  const data = new Float32Array(TINTS.length * 3);\r
  TINTS.forEach(([shift, scale], index) => {\r
    data.set(fromHsv(hue + shift, clamp(BASE_SATURATION * scale * strength, 0, 1)), index * 3);\r
  });\r
  return data;\r
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
const link = (gl, vertexSource, fragmentSource) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl, program, names) => {\r
  const result = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
export const LaserFlow = ({\r
  surfaceRef,\r
  beamPosition = 0.6,\r
  surfaceLevel = 1,\r
  color = '#3847ff',\r
  intensity = 1.8,\r
  beamWidth = 1.5,\r
  flare = 1.5,\r
  spread = 1.5,\r
  spill = 1,\r
  fog = 0.2,\r
  dust = 1.6,\r
  streaks = 1.5,\r
  dots = 1,\r
  pulse = 1.5,\r
  speed = 1.5,\r
  seed = 3,\r
  mouseInteraction = true,\r
  revealImage,\r
  revealRadius = 220,\r
  revealOpacity = 0.6,\r
  intro = true,\r
  theme = 'dark',\r
  paused = false,\r
  dpr,\r
  ...rest\r
}) => {\r
  const containerRef = useRef(null);\r
  const canvasRef = useRef(null);\r
  const wakeRef = useRef(null);\r
  const settings = {\r
    surfaceRef,\r
    beamPosition: clamp(beamPosition, 0, 1),\r
    surfaceLevel: clamp(surfaceLevel, 0, 1),\r
    color: String(color),\r
    intensity: Math.max(0, intensity),\r
    beamWidth: clamp(beamWidth, 0.2, 5),\r
    flare: clamp(flare, 0.2, 4),\r
    spread: clamp(spread, 0.1, 4),\r
    spill: Math.max(0, spill),\r
    fog: Math.max(0, fog),\r
    dust: Math.max(0, dust),\r
    streaks: Math.max(0, streaks),\r
    dots: Math.max(0, dots),\r
    pulse: Math.max(0, pulse),\r
    speed,\r
    seed,\r
    mouseInteraction,\r
    revealImage,\r
    revealRadius: Math.max(1, revealRadius),\r
    revealOpacity: clamp(revealOpacity, 0, 1),\r
    intro,\r
    theme,\r
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
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl, VERTEX, FRAGMENT);\r
    if (!program) return undefined;\r
\r
    const uniforms = locate(gl, program, [\r
      'uResolution',\r
      'uDpr',\r
      'uScale',\r
      'uTime',\r
      'uBeamX',\r
      'uSurface',\r
      'uRadius',\r
      'uIntro',\r
      'uPour',\r
      'uRun',\r
      'uLens',\r
      'uReveal',\r
      'uRevealMap',\r
      'uRevealInfo',\r
      'uAtmosphere',\r
      'uAmount',\r
      'uShape',\r
      'uExtra',\r
      'uTheme',\r
      'uTint'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const positionLocation = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(positionLocation);\r
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const revealTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      introTime: settingsRef.current.intro && !reduce ? 0 : INTRO_END,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      colorKey: '',\r
      tints: buildTints([0.22, 0.28, 1]),\r
      observed: null,\r
      pointer: { x: 0, y: 0, inside: false },\r
      lens: { x: 0, y: 0, vx: 0, vy: 0, strength: 0, placed: false },\r
      reveal: { src: '', ready: false, width: 1, height: 1, image: null }\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = value => {\r
      if (!probeContext) return [0.22, 0.28, 1];\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#3847ff';\r
      probeContext.fillStyle = value;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColor = s => {\r
      if (s.color === state.colorKey) return;\r
      state.colorKey = s.color;\r
      state.tints = buildTints(toRgb(s.color));\r
    };\r
\r
    const resolveReveal = s => {\r
      const src = s.revealImage ? String(s.revealImage) : '';\r
      const reveal = state.reveal;\r
      if (src === reveal.src) return;\r
      reveal.src = src;\r
      reveal.ready = false;\r
      if (reveal.image) reveal.image.onload = null;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || reveal.src !== src) return;\r
        const width = image.naturalWidth || image.width || 1;\r
        const height = image.naturalHeight || image.height || 1;\r
        const scale = Math.min(1, 2048 / Math.max(width, height));\r
        const sheet = document.createElement('canvas');\r
        sheet.width = Math.max(1, Math.round(width * scale));\r
        sheet.height = Math.max(1, Math.round(height * scale));\r
        sheet.getContext('2d')?.drawImage(image, 0, 0, sheet.width, sheet.height);\r
        gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
        reveal.width = sheet.width;\r
        reveal.height = sheet.height;\r
        reveal.ready = true;\r
        wakeRef.current?.();\r
      };\r
      image.src = src;\r
      reveal.image = image;\r
    };\r
\r
    const measure = (s, width, height) => {\r
      const element = s.surfaceRef?.current ?? null;\r
      if (element !== state.observed) {\r
        if (state.observed) resizeObserver.unobserve(state.observed);\r
        if (element) resizeObserver.observe(element);\r
        state.observed = element;\r
      }\r
      if (element) {\r
        const box = container.getBoundingClientRect();\r
        const rect = element.getBoundingClientRect();\r
        if (rect.width > 0) {\r
          const computed = getComputedStyle(element);\r
          const radius = Math.max(\r
            parseFloat(computed.borderTopLeftRadius) || 0,\r
            parseFloat(computed.borderTopRightRadius) || 0\r
          );\r
          return {\r
            left: rect.left - box.left,\r
            top: rect.top - box.top,\r
            right: rect.right - box.left,\r
            bottom: rect.bottom - box.top,\r
            radius: Math.min(radius, rect.width / 2, rect.height / 2),\r
            real: true\r
          };\r
        }\r
      }\r
      return {\r
        left: -width * 2,\r
        top: s.surfaceLevel * height,\r
        right: width * 3,\r
        bottom: height * 3,\r
        radius: 0,\r
        real: false\r
      };\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const s = settingsRef.current;\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = canvas.width / width;\r
      render();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColor(s);\r
      const { width, height } = state;\r
      const scale = Math.max(0.2, Math.min(width / 585, height / 507));\r
      let surface = measure(s, width, height);\r
      let beamX = s.beamPosition * width;\r
      if (surface.real) {\r
        const margin = surface.radius + 6;\r
        if (beamX >= surface.left && beamX <= surface.right) {\r
          beamX = clamp(beamX, surface.left + margin, surface.right - margin);\r
        } else {\r
          surface = { left: -width * 2, top: height, right: width * 3, bottom: height * 3, radius: 0, real: false };\r
        }\r
      }\r
      const startY = -0.15 * height;\r
      const span = surface.top - startY + 0.3 * height;\r
      const it = state.introTime;\r
      const settled = it >= INTRO_END;\r
      const front = settled ? surface.top + 0.3 * height : startY + span * Math.pow(clamp(it / INTRO_DROP, 0, 1), 1.3);\r
      const impact = INTRO_DROP * Math.pow(Math.max(0, surface.top - startY) / span, 1 / 1.3);\r
      const tau = it - impact;\r
      const bloom = settled ? 1 : tau <= 0 ? 0 : spring(tau);\r
      const flash = settled || tau <= 0 ? 0 : Math.exp(-tau / 0.35) * (1 - Math.exp(-tau / 0.05));\r
      const runRange = s.spread * 250 * 1.3 + 80;\r
      const runFront = settled ? 100000 : tau <= 0 ? -40 : runRange * (1 - Math.exp(-1.15 * tau));\r
      const beadStrength = settled || tau <= 0 ? 0 : Math.exp(-1.15 * tau) * (1 - Math.exp(-tau / 0.08));\r
      const pour = reach => {\r
        if (settled) return [1000, 1];\r
        if (tau <= 0) return [-reach, 0];\r
        const target = Math.min(reach, runRange * 0.97);\r
        const arrival = -Math.log(1 - target / runRange) / 1.15;\r
        const elapsed = tau - arrival;\r
        const ease = clamp((elapsed + 0.15) / 0.8, 0, 1);\r
        const fill = ease * ease * ease * (ease * (ease * 6 - 15) + 10);\r
        if (elapsed <= 0) return [runFront - target, fill];\r
        const speed = 1.15 * (runRange - target);\r
        return [speed * elapsed + 260 * elapsed * elapsed, fill];\r
      };\r
      const [frontL, fillL] = pour((beamX - surface.left) / scale);\r
      const [frontR, fillR] = pour((surface.right - beamX) / scale);\r
      const atmosphere = settled\r
        ? 1\r
        : tau <= 0\r
          ? 0.3 * easeOut(it / INTRO_DROP)\r
          : 0.3 + 0.7 * (1 - Math.exp(-1.3 * tau));\r
      const seedValue = Number(s.seed) || 0;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.uResolution, width, height);\r
      gl.uniform1f(uniforms.uDpr, state.ratio);\r
      gl.uniform1f(uniforms.uScale, scale);\r
      gl.uniform1f(uniforms.uTime, state.time);\r
      gl.uniform1f(uniforms.uBeamX, beamX);\r
      gl.uniform4f(uniforms.uSurface, surface.left, surface.top, surface.right, surface.bottom);\r
      gl.uniform1f(uniforms.uRadius, surface.radius);\r
      gl.uniform3f(uniforms.uIntro, front, bloom, flash);\r
      gl.uniform4f(uniforms.uPour, frontL, frontR, fillL, fillR);\r
      gl.uniform2f(uniforms.uRun, runFront, beadStrength);\r
      gl.uniform4f(uniforms.uLens, state.lens.x, state.lens.y, 95 * scale, state.lens.strength);\r
      resolveReveal(s);\r
      const { reveal } = state;\r
      const cover = Math.max(width / reveal.width, height / reveal.height);\r
      const coverWidth = reveal.width * cover;\r
      const coverHeight = reveal.height * cover;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
      gl.uniform1i(uniforms.uReveal, 0);\r
      gl.uniform4f(\r
        uniforms.uRevealMap,\r
        1 / coverWidth,\r
        1 / coverHeight,\r
        (coverWidth - width) / 2 / coverWidth,\r
        (coverHeight - height) / 2 / coverHeight\r
      );\r
      gl.uniform2f(uniforms.uRevealInfo, s.revealRadius, reveal.ready ? s.revealOpacity : 0);\r
      gl.uniform1f(uniforms.uAtmosphere, atmosphere);\r
      gl.uniform4f(uniforms.uAmount, s.intensity, s.fog, s.dust, s.streaks);\r
      gl.uniform4f(uniforms.uShape, s.beamWidth, s.flare, s.spread, s.spill);\r
      gl.uniform4f(uniforms.uExtra, s.pulse, s.dots, 34.34 + seedValue * 7.31, 11.58 + seedValue * 3.17);\r
      gl.uniform1f(uniforms.uTheme, s.theme === 'light' ? 1 : 0);\r
      gl.uniform3fv(uniforms.uTint, state.tints);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      const introducing = state.introTime < INTRO_END;\r
      if (introducing) state.introTime = Math.min(INTRO_END, state.introTime + dt);\r
\r
      const { pointer, lens } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      if (active && !lens.placed) {\r
        lens.x = pointer.x;\r
        lens.y = pointer.y;\r
        lens.vx = 0;\r
        lens.vy = 0;\r
        lens.placed = true;\r
      }\r
      const ax = 120 * (pointer.x - lens.x) - 19 * lens.vx;\r
      const ay = 120 * (pointer.y - lens.y) - 19 * lens.vy;\r
      lens.vx += ax * dt;\r
      lens.vy += ay * dt;\r
      lens.x += lens.vx * dt;\r
      lens.y += lens.vy * dt;\r
      const goal = active ? 1 : 0;\r
      lens.strength += (goal - lens.strength) * (1 - Math.exp(-dt / (goal > lens.strength ? 0.3 : 0.55)));\r
      if (lens.strength < 0.001 && !active) lens.placed = false;\r
\r
      render();\r
      const settling =\r
        Math.abs(state.lens.strength - (s.mouseInteraction && state.pointer.inside ? 1 : 0)) > 0.002 ||\r
        Math.hypot(state.lens.vx, state.lens.vy) > 0.5;\r
      if (moving || introducing || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
      wake();\r
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
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(revealTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`pointer-events-none relative h-full w-full\${className ? \` \${className}\` : ''}\`}\r
      {...attributes}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LaserFlow;\r
`,t=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes, type RefObject } from 'react';\r
\r
import './LaserFlow.css';\r
\r
export interface LaserFlowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {\r
  surfaceRef?: RefObject<HTMLElement | null>;\r
  beamPosition?: number;\r
  surfaceLevel?: number;\r
  color?: string;\r
  intensity?: number;\r
  beamWidth?: number;\r
  flare?: number;\r
  spread?: number;\r
  spill?: number;\r
  fog?: number;\r
  dust?: number;\r
  streaks?: number;\r
  dots?: number;\r
  pulse?: number;\r
  speed?: number;\r
  seed?: number;\r
  mouseInteraction?: boolean;\r
  revealImage?: string;\r
  revealRadius?: number;\r
  revealOpacity?: number;\r
  intro?: boolean;\r
  theme?: 'dark' | 'light';\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  surfaceRef?: RefObject<HTMLElement | null>;\r
  beamPosition: number;\r
  surfaceLevel: number;\r
  color: string;\r
  intensity: number;\r
  beamWidth: number;\r
  flare: number;\r
  spread: number;\r
  spill: number;\r
  fog: number;\r
  dust: number;\r
  streaks: number;\r
  dots: number;\r
  pulse: number;\r
  speed: number;\r
  seed: number;\r
  mouseInteraction: boolean;\r
  revealImage?: string;\r
  revealRadius: number;\r
  revealOpacity: number;\r
  intro: boolean;\r
  theme: 'dark' | 'light';\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Surface = {\r
  left: number;\r
  top: number;\r
  right: number;\r
  bottom: number;\r
  radius: number;\r
  real: boolean;\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
out vec4 outColor;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform float uScale;\r
uniform float uTime;\r
uniform float uBeamX;\r
uniform vec4 uSurface;\r
uniform float uRadius;\r
uniform vec3 uIntro;\r
uniform vec4 uPour;\r
uniform vec2 uRun;\r
uniform vec4 uLens;\r
uniform sampler2D uReveal;\r
uniform vec4 uRevealMap;\r
uniform vec2 uRevealInfo;\r
uniform float uAtmosphere;\r
uniform vec4 uAmount;\r
uniform vec4 uShape;\r
uniform vec4 uExtra;\r
uniform float uTheme;\r
uniform vec3 uTint[16];\r
\r
#define BEAM uTint[0]\r
#define LEFT uTint[1]\r
#define RIGHT uTint[2]\r
#define CYAN uTint[3]\r
#define PINK uTint[4]\r
#define LILAC uTint[5]\r
#define SKY uTint[6]\r
#define PURPLE uTint[7]\r
#define DEEP uTint[8]\r
#define MIST uTint[9]\r
#define NAVY uTint[10]\r
#define WARM uTint[11]\r
#define EMBER uTint[12]\r
#define WHITE uTint[13]\r
#define HAZE uTint[14]\r
#define LAVENDER uTint[15]\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);\r
}\r
\r
float fbm(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);\r
  for (int i = 0; i < 5; i++) {\r
    v += a * noise(p);\r
    p = m * p;\r
    a *= 0.5;\r
  }\r
  return v;\r
}\r
\r
float sq(float x) {\r
  return x * x;\r
}\r
\r
float roundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
vec3 spill(float e, float fall, float strength, float front, float t, out vec3 glow) {\r
  glow = vec3(0.0);\r
  if (strength < 0.0005) return vec3(0.0);\r
  float f = max(fall, 0.0);\r
  float d = max(e, 0.0);\r
  float u = d / (6.0 + 0.28 * f);\r
  float start = smoothstep(-6.0, 12.0, fall);\r
  float fade = exp(-sq(max(f - 125.0, 0.0) / 40.0));\r
  float streak = 0.88 + 0.24 * noise(vec2(u * 6.0, f / 22.0 - t * 1.7));\r
  float bright = pow(strength, 1.5);\r
  float soft = sqrt(strength);\r
  float warmth = smoothstep(90.0, 130.0, f);\r
  vec3 coreK = mix(WHITE, WARM, warmth * exp(-d / 9.0));\r
  float core = mix(9.0, 2.6, warmth) * exp(-sq(d / (3.5 + 0.04 * f))) * exp(-sq(max(f - 130.0, 0.0) / 38.0));\r
  float wall = 24.0 * exp(-sq(d / 1.1)) * exp(-sq(max(f - 100.0, 0.0) / 30.0));\r
  float bandCenter = 0.7 - 0.3 * smoothstep(30.0, 110.0, f);\r
  float offset = u - bandCenter;\r
  float decay = (1.05 - bandCenter) / 1.31;\r
  float profile = offset < 0.0 ? exp(-sq(offset / 0.3)) : exp(-offset / decay);\r
  profile *= 1.0 - smoothstep(1.0, 1.4, u);\r
  vec3 bandA = mix(CYAN, PINK, smoothstep(50.0, 75.0, f));\r
  bandA = mix(bandA, LILAC, smoothstep(100.0, 125.0, f));\r
  vec3 bandB = mix(SKY, PURPLE, smoothstep(50.0, 75.0, f));\r
  vec3 fanK = mix(bandA, bandB, smoothstep(0.06, 0.18, offset));\r
  fanK = mix(fanK, DEEP, smoothstep(0.22, 0.42, offset));\r
  vec3 thread = WHITE * wall * bright + coreK * core * streak * bright;\r
  glow += fanK * 4.5 * profile * fade * streak * bright;\r
  glow += MIST * 0.7 * exp(-max(u - 1.0, 0.0) / 0.9) * smoothstep(0.7, 1.2, u) * fade * soft;\r
  glow += EMBER * 0.35 * exp(-sq((f - 165.0) / 22.0)) * exp(-d / 25.0) * bright;\r
  float lag = u * (6.0 + 0.28 * f) * 0.35;\r
  float reveal = 1.0 - smoothstep(front - 70.0, front + 8.0, f + lag);\r
  glow *= start * reveal;\r
  return thread * start * reveal;\r
}\r
\r
vec3 easeLight(vec3 light, float amount) {\r
  return -log(max(1.0 - amount * (1.0 - exp(-light)), vec3(0.0001)));\r
}\r
\r
void main() {\r
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y * uDpr - gl_FragCoord.y) / uDpr;\r
  vec2 p = frag / uScale;\r
  float t = uTime;\r
  float bx = uBeamX / uScale;\r
  float sl = uSurface.x / uScale;\r
  float sy = uSurface.y / uScale;\r
  float sr = uSurface.z / uScale;\r
  float sb = uSurface.w / uScale;\r
  float radius = uRadius / uScale;\r
  float dx = p.x - bx;\r
  float adx = abs(dx);\r
  float h = sy - p.y;\r
  float hp = max(h, 0.0);\r
  float above = smoothstep(-0.5, 0.5, h);\r
  float side = smoothstep(-24.0, 24.0, dx);\r
  vec3 sideK = mix(mix(LAVENDER, LEFT, smoothstep(40.0, 140.0, adx)), RIGHT, side);\r
  float beamWidth = uShape.x;\r
  float flare = uShape.y;\r
  float spread = 250.0 * uShape.z;\r
  float reachL = max(bx - sl, 1.0);\r
  float reachR = max(sr - bx, 1.0);\r
  float reach = dx < 0.0 ? reachL : reachR;\r
  float layerLen = clamp(0.29 * reach, 20.0, 100.0) * sqrt(uShape.z);\r
  float run = uRun.x;\r
  float runMask = 1.0 - smoothstep(run - 34.0, run + 6.0, adx);\r
  float bead = exp(-sq((adx - run + 16.0) / (18.0 + 0.04 * run))) * uRun.y;\r
  float flowMask = (1.0 - smoothstep(0.75 * spread, 1.1 * spread, adx)) * runMask;\r
  float edgeMask = (1.0 - smoothstep(0.8 * spread, 1.25 * spread, adx)) * runMask;\r
  float bloom = uIntro.y;\r
  vec2 center = vec2((sl + sr) * 0.5, (sy + sb) * 0.5);\r
  vec2 halfSize = vec2((sr - sl) * 0.5, (sb - sy) * 0.5);\r
  float sd = roundBox(p - center, halfSize, radius);\r
  float outline = max(sd, 0.0);\r
  float below = max(p.y - sy - radius, 0.0);\r
  float hug = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 14.0));\r
  float hugWide = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 40.0));\r
\r
  vec3 col = vec3(0.0);\r
\r
  float breathe = 1.0 + uExtra.x * (0.12 * sin(t * 1.5708) + 0.08 * (noise(vec2(t * 0.5, 3.0)) - 0.5));\r
\r
  float front = uIntro.x / uScale;\r
  float drop = smoothstep(front + 10.0, front - 110.0, p.y);\r
  float falling = 1.0 - smoothstep(sy - 24.0, sy, front);\r
  float top = mix(0.3, 1.0, smoothstep(0.0, 0.3 * sy, p.y));\r
  float beamCore = 24.0 * exp(-adx / (2.0 * beamWidth));\r
  float beamHalo = 1.3 * exp(-adx / (6.0 * beamWidth)) + 0.3 * exp(-adx / (22.0 * beamWidth));\r
  vec3 haloK = mix(BEAM, sideK, exp(-hp / 80.0));\r
  col += (BEAM * beamCore + haloK * beamHalo) * top * above * drop;\r
  float head = exp(-sq((p.y - front) / 24.0)) * falling;\r
  col += mix(WHITE, BEAM, 0.35) * head * (7.0 * exp(-adx / (2.6 * beamWidth)) + 1.0 * exp(-adx / (14.0 * beamWidth)));\r
\r
  float psi = adx * (outline + 1.0);\r
  float rise = max(hp - 17.9 * flare, 0.0);\r
  float skirtAmp = 16.6 * (exp(-sq(rise / (11.8 * flare))) + 0.3 * exp(-rise / (60.0 * flare)));\r
  float skirtSpread = mix(134.0, 155.0, side) * breathe * flare * flare * mix(0.35, 1.0, min(bloom, 1.0)) * max(bloom, 1.0);\r
  float skirt = skirtAmp * exp(-psi / skirtSpread) * exp(-sq(adx / (max(layerLen, 60.0 * sqrt(uShape.z)) * 1.48))) * hug;\r
  col += sideK * skirt * flowMask * min(bloom, 1.0);\r
\r
  float layer = 12.0 * exp(-adx / layerLen) * exp(-outline / (0.19 * layerLen)) * (1.0 + 0.4 * bead);\r
  col += sideK * layer * hug * flowMask * min(bloom, 1.0);\r
  float washMask = smoothstep(sl - 60.0, sl + 6.0, p.x) * (1.0 - smoothstep(sr - 6.0, sr + 45.0, p.x));\r
  float wash = 1.4 * exp(-adx / 100.0) * exp(-outline / 30.0);\r
  col += mix(BEAM, sideK, 0.25) * wash * hugWide * washMask * flowMask * min(bloom, 1.0);\r
  float highWash = 0.7 * exp(-adx / 140.0) * exp(-outline / 60.0);\r
  col += mix(BEAM, NAVY, 0.5) * highWash * hugWide * washMask * runMask * min(bloom, 1.0);\r
\r
  float sideSign = dx < 0.0 ? 0.0 : 1.0;\r
  float along = 0.5 * log((hp + 1.0) / (adx + 1.0));\r
  float lineScale = 6.0;\r
  float lp = log(max(psi, 1.0) / (120.0 * flare * flare)) * lineScale;\r
  float lineIndex = floor(lp) + sideSign * 97.0;\r
  float wobble = 0.22 * (noise(vec2(lineIndex * 3.7, t * 0.4 + along)) - 0.5);\r
  float lf = fract(lp + wobble) - 0.5;\r
  float gradient = lineScale * length(vec2(hp + 1.0, adx)) / max(psi, 1.0) / uScale;\r
  float halfWidth = max(0.35 * gradient, 0.0001);\r
  float drawWidth = max(halfWidth, 0.6 * gradient);\r
  float lineShape = exp(-lf * lf / (drawWidth * drawWidth)) * (halfWidth / drawWidth);\r
  float lineOn = step(0.3, hash(vec2(lineIndex, 1.3)));\r
  float lineFlow = smoothstep(0.25, 0.85, noise(vec2(lineIndex * 5.3 + 2.0, along * 3.0 + t * 1.1)));\r
  float flareArea = 120.0 * flare * flare;\r
  float lineEnvelope = smoothstep(0.85 * flareArea, 1.4 * flareArea, psi) * (1.0 - smoothstep(3.2 * flareArea, 7.5 * flareArea, psi));\r
  lineEnvelope *= exp(-adx / (layerLen * 1.5)) * hug * flowMask * (1.0 - smoothstep(35.0 * flare, 80.0 * flare, hp));\r
  float lineBright = mix(0.35, 1.0, hash(vec2(lineIndex, 4.0)));\r
  col += mix(sideK, WHITE, 0.6) * lineShape * lineOn * lineFlow * lineEnvelope * lineBright * 2.6 * uAmount.w * min(bloom, 1.0);\r
\r
  float edgeGlow = 22.8 * exp(-sq(adx / (150.0 * uShape.z))) * edgeMask * (1.0 + 0.9 * bead);\r
  float onTop = 1.0 - smoothstep(sy + radius, sy + radius + 10.0, p.y);\r
  float edgeLine = (exp(-sq(max(sd, 0.0) / 0.9)) + 0.12 * exp(-max(sd, 0.0) / 3.0)) * edgeGlow * onTop;\r
  col += mix(sideK, WHITE, 0.6) * edgeLine * min(bloom, 1.0);\r
\r
  float pour = uShape.w;\r
  float baseline = exp(-sq(130.0 / 150.0));\r
  float strengthR = exp(-sq(reachR / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachR)) / baseline * pour;\r
  float strengthL = exp(-sq(reachL / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachL)) / baseline * pour;\r
  float fallY = p.y - sy - 0.3 * radius;\r
  float rightHalf = smoothstep(center.x - 4.0, center.x + 4.0, p.x);\r
  float haloR = exp(-length(p - vec2(sr - 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthR);\r
  float haloL = exp(-length(p - vec2(sl + 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthL);\r
  vec3 glowR;\r
  vec3 glowL;\r
  col += spill(sd, fallY, strengthR, uPour.y, t, glowR) * rightHalf;\r
  col += spill(sd, fallY, strengthL, uPour.x, t, glowL) * (1.0 - rightHalf);\r
  col += easeLight(glowR * rightHalf + NAVY * 0.9 * haloR, uPour.w);\r
  col += easeLight(glowL * (1.0 - rightHalf) + NAVY * 0.9 * haloL, uPour.z);\r
\r
  vec2 toLens = frag - uLens.xy;\r
  float lens = exp(-dot(toLens, toLens) / sq(uLens.z)) * uLens.w;\r
  col *= 1.0 + 0.35 * lens * hug;\r
  float fogAmount = uAmount.y * uAtmosphere;\r
  float near = exp(-adx / 150.0);\r
  float envelope = near * (0.3 + 0.4 * exp(-hp / 50.0) + 1.2 * exp(-p.y / 120.0));\r
  if (fogAmount > 0.001 && h > -2.0 && envelope * max(0.25, 6.0 * exp(-adx / 50.0)) > 0.002) {\r
    vec2 fq = vec2(dx / 1.7, h) / 85.0 + vec2(t * 0.012, -t * 0.03) + uExtra.zw;\r
    vec2 fw = vec2(fbm(fq * 1.3 + vec2(1.7, 9.2) + t * 0.03), fbm(fq * 1.3 + vec2(8.3, 2.8) - t * 0.025));\r
    float cloud = fbm(fq + 1.4 * fw);\r
    float density = smoothstep(0.5, 0.78, cloud);\r
    float lit = exp(-adx / 50.0);\r
    float fogMask = smoothstep(-2.0, 20.0, h);\r
    float reached = smoothstep(front + 80.0, front - 40.0, p.y);\r
    vec3 fog = (HAZE * 0.45 + BEAM * 6.0 * lit * reached) * density * envelope * fogMask;\r
    float surfaceLit = exp(-adx / (layerLen * 1.3)) * exp(-outline / 28.0) * hugWide * flowMask * washMask * min(bloom, 1.0);\r
    fog += sideK * 2.2 * surfaceLit * (smoothstep(0.38, 0.72, cloud) - 0.35) * fogMask;\r
    float smoke = smoothstep(0.3, 0.75, cloud);\r
    fog += BEAM * 0.35 * exp(-adx / (22.0 * beamWidth)) * (0.35 + 0.9 * smoke) * fogMask * top * drop;\r
    col += fog * fogAmount * (1.0 + 1.2 * lens) * mix(1.0, 0.45, uTheme);\r
  }\r
\r
  if (uRevealInfo.y > 0.001 && uLens.w > 0.002) {\r
    vec2 toReveal = frag - uLens.xy;\r
    float reveal = exp(-dot(toReveal, toReveal) / sq(uRevealInfo.x)) * uLens.w;\r
    vec2 uv = frag * uRevealMap.xy + uRevealMap.zw;\r
    float onImage = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);\r
    vec4 ui = texture(uReveal, uv);\r
    float ink = max(ui.r, max(ui.g, ui.b)) * onImage;\r
    float lit = clamp(col.b * 0.9, 0.0, 1.0) * (1.0 - smoothstep(0.9, 2.2, col.b));\r
    float clearance = smoothstep(60.0 * sqrt(beamWidth), 150.0 * sqrt(beamWidth), adx);\r
    col += mix(BEAM, WHITE, 0.4) * ink * reveal * lit * clearance * uRevealInfo.y * 2.2;\r
  }\r
\r
  float haze = col.b;\r
  float dotGrid = 1.0 - smoothstep(0.16, 0.32, length(fract(frag / 3.0) - 0.5));\r
  col += BEAM * dotGrid * clamp(haze, 0.0, 1.5) * (1.0 - smoothstep(1.5, 4.0, haze)) * (0.18 + 0.3 * lens) * uExtra.y;\r
  if (lens > 0.002) {\r
    vec2 drift = frag - vec2(0.0, t * 14.0);\r
    vec2 sparkCell = floor(drift / 7.0);\r
    vec2 sparkPos = (sparkCell + 0.2 + 0.6 * vec2(hash(sparkCell + 5.1), hash(sparkCell + 2.3))) * 7.0;\r
    float sparkDist = length(drift - sparkPos);\r
    float sparkOn = step(0.8, hash(sparkCell + 8.8));\r
    float sparkTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(sparkCell + 3.7) * 6.283);\r
    col += WHITE * exp(-sparkDist * sparkDist / 0.35) * sparkOn * sparkTwinkle * lens * clamp(haze * 1.5, 0.0, 1.0) * 1.6 * uAmount.z;\r
  }\r
\r
  float dustAmount = uAmount.z;\r
  if (dustAmount > 0.001) {\r
    float dustLp = log(max(psi, 1.0) / (120.0 * flare * flare)) * 2.2;\r
    vec2 flowCell = vec2(dustLp / 1.1, (along + t * 0.22) / 0.06);\r
    vec2 cellId = floor(flowCell) + vec2(sideSign * 131.0, 0.0);\r
    vec2 cellJitter = vec2(hash(cellId + 1.7), hash(cellId + 8.3));\r
    vec2 particleFlow = (floor(flowCell) + 0.1 + cellJitter * 0.8) * vec2(1.1, 0.06);\r
    float particlePsi = 120.0 * flare * flare * exp(particleFlow.x / 2.2);\r
    float particleAlong = particleFlow.y - t * 0.22;\r
    float particleX = sqrt(particlePsi * exp(-2.0 * particleAlong)) - 1.0;\r
    float particleH = sqrt(particlePsi * exp(2.0 * particleAlong)) - 1.0;\r
    float particleDist = length(vec2(adx - particleX, hp - particleH)) * uScale;\r
    float particleOn = step(0.62, hash(cellId + 3.1));\r
    float particleTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(cellId + 9.2) * 6.283);\r
    float dustZone = exp(-sq(log(max(psi, 1.0) / (200.0 * flare * flare)) / 0.55)) * hug * flowMask * smoothstep(0.0, 6.0, outline);\r
    col += WHITE * exp(-particleDist * particleDist / 0.3) * particleOn * particleTwinkle * dustZone * 3.0 * dustAmount * min(bloom, 1.0);\r
\r
    vec2 glitterCell = vec2(dx / 3.0, (p.y - t * 26.0) / 9.0);\r
    vec2 glitterId = floor(glitterCell);\r
    vec2 glitterJitter = vec2(hash(glitterId + 4.4), hash(glitterId + 2.9));\r
    vec2 glitterPos = (glitterId + 0.15 + glitterJitter * 0.7) * vec2(3.0, 9.0);\r
    float glitterDist = length(vec2(dx, p.y - t * 26.0) - glitterPos) * uScale;\r
    float glitterOn = step(0.7, hash(glitterId + 6.6));\r
    float glitterTwinkle = 0.5 + 0.5 * sin(t * 6.0 + hash(glitterId + 1.1) * 6.283);\r
    float glitterZone = exp(-adx / (5.0 * beamWidth)) * smoothstep(1.5, 4.0, adx / beamWidth) * above * smoothstep(25.0, 70.0, hp) * top * drop;\r
    col += WHITE * exp(-glitterDist * glitterDist / 0.25) * glitterOn * glitterTwinkle * glitterZone * 2.2 * dustAmount * uAtmosphere;\r
  }\r
\r
  col *= uAmount.x * (1.0 + uIntro.z * 0.9 * exp(-length(vec2(dx, h * 1.6)) / 70.0));\r
  col *= smoothstep(-0.75, 0.25, sd * uScale);\r
\r
  vec3 emit = 1.0 - exp(-col * mix(1.0, 0.6, uTheme));\r
  float peak = max(emit.r, max(emit.g, emit.b));\r
  if (uTheme > 0.5) {\r
    float low = min(emit.r, min(emit.g, emit.b));\r
    float chroma = peak - low;\r
    vec3 hue = (emit - low) / max(chroma, 0.0001);\r
    float alpha = clamp(pow(chroma, 1.35) * 1.3, 0.0, 1.0) * 0.9;\r
    outColor = vec4((hue * 0.82 + 0.06) * alpha, alpha);\r
  } else {\r
    outColor = vec4(emit, peak);\r
  }\r
}\`;\r
\r
const TINTS = [\r
  [0, 1],\r
  [-11.5, 0.77],\r
  [9.5, 0.95],\r
  [-53.5, 0.79],\r
  [39.5, 0.77],\r
  [16, 0.81],\r
  [-16.3, 0.92],\r
  [13.3, 0.96],\r
  [3, 1.01],\r
  [1, 0.68],\r
  [1, 1.15],\r
  [142.5, 0.51],\r
  [113.6, 0.28],\r
  [-7.5, 0.13],\r
  [-2.7, 0.32],\r
  [7.5, 0.81]\r
];\r
\r
const BASE_SATURATION = 0.78;\r
const MAX_RENDER_DIM = 2048;\r
const INTRO_DROP = 1.25;\r
const INTRO_END = 5;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);\r
const spring = (time: number) => {\r
  const omega = 8;\r
  const zeta = 0.62;\r
  const damped = omega * Math.sqrt(1 - zeta * zeta);\r
  return (\r
    1 - Math.exp(-zeta * omega * time) * (Math.cos(damped * time) + ((zeta * omega) / damped) * Math.sin(damped * time))\r
  );\r
};\r
\r
const toHsv = ([r, g, b]: number[]): [number, number] => {\r
  const max = Math.max(r, g, b);\r
  const min = Math.min(r, g, b);\r
  const delta = max - min;\r
  let hue = 0;\r
  if (delta > 0) {\r
    if (max === r) hue = ((g - b) / delta) % 6;\r
    else if (max === g) hue = (b - r) / delta + 2;\r
    else hue = (r - g) / delta + 4;\r
  }\r
  return [(hue * 60 + 360) % 360, max > 0 ? delta / max : 0];\r
};\r
\r
const fromHsv = (hue: number, saturation: number): number[] => {\r
  const h = (((hue % 360) + 360) % 360) / 60;\r
  const c = saturation;\r
  const x = c * (1 - Math.abs((h % 2) - 1));\r
  const m = 1 - c;\r
  const [r, g, b] =\r
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];\r
  return [r + m, g + m, b + m];\r
};\r
\r
const buildTints = (rgb: number[]) => {\r
  const [hue, saturation] = toHsv(rgb);\r
  const strength = saturation / BASE_SATURATION;\r
  const data = new Float32Array(TINTS.length * 3);\r
  TINTS.forEach(([shift, scale], index) => {\r
    data.set(fromHsv(hue + shift, clamp(BASE_SATURATION * scale * strength, 0, 1)), index * 3);\r
  });\r
  return data;\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {\r
  const result: Record<string, WebGLUniformLocation | null> = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
export const LaserFlow = ({\r
  surfaceRef,\r
  beamPosition = 0.6,\r
  surfaceLevel = 1,\r
  color = '#3847ff',\r
  intensity = 1.8,\r
  beamWidth = 1.5,\r
  flare = 1.5,\r
  spread = 1.5,\r
  spill = 1,\r
  fog = 0.2,\r
  dust = 1.6,\r
  streaks = 1.5,\r
  dots = 1,\r
  pulse = 1.5,\r
  speed = 1.5,\r
  seed = 3,\r
  mouseInteraction = true,\r
  revealImage,\r
  revealRadius = 220,\r
  revealOpacity = 0.6,\r
  intro = true,\r
  theme = 'dark',\r
  paused = false,\r
  dpr,\r
  ...rest\r
}: LaserFlowProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    surfaceRef,\r
    beamPosition: clamp(beamPosition, 0, 1),\r
    surfaceLevel: clamp(surfaceLevel, 0, 1),\r
    color: String(color),\r
    intensity: Math.max(0, intensity),\r
    beamWidth: clamp(beamWidth, 0.2, 5),\r
    flare: clamp(flare, 0.2, 4),\r
    spread: clamp(spread, 0.1, 4),\r
    spill: Math.max(0, spill),\r
    fog: Math.max(0, fog),\r
    dust: Math.max(0, dust),\r
    streaks: Math.max(0, streaks),\r
    dots: Math.max(0, dots),\r
    pulse: Math.max(0, pulse),\r
    speed,\r
    seed,\r
    mouseInteraction,\r
    revealImage,\r
    revealRadius: Math.max(1, revealRadius),\r
    revealOpacity: clamp(revealOpacity, 0, 1),\r
    intro,\r
    theme,\r
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
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl, VERTEX, FRAGMENT);\r
    if (!program) return undefined;\r
\r
    const uniforms = locate(gl, program, [\r
      'uResolution',\r
      'uDpr',\r
      'uScale',\r
      'uTime',\r
      'uBeamX',\r
      'uSurface',\r
      'uRadius',\r
      'uIntro',\r
      'uPour',\r
      'uRun',\r
      'uLens',\r
      'uReveal',\r
      'uRevealMap',\r
      'uRevealInfo',\r
      'uAtmosphere',\r
      'uAmount',\r
      'uShape',\r
      'uExtra',\r
      'uTheme',\r
      'uTint'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const positionLocation = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(positionLocation);\r
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const revealTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      introTime: settingsRef.current.intro && !reduce ? 0 : INTRO_END,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      colorKey: '',\r
      tints: buildTints([0.22, 0.28, 1]),\r
      observed: null as HTMLElement | null,\r
      pointer: { x: 0, y: 0, inside: false },\r
      lens: { x: 0, y: 0, vx: 0, vy: 0, strength: 0, placed: false },\r
      reveal: { src: '', ready: false, width: 1, height: 1, image: null as HTMLImageElement | null }\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = (value: string): number[] => {\r
      if (!probeContext) return [0.22, 0.28, 1];\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#3847ff';\r
      probeContext.fillStyle = value;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColor = (s: Settings) => {\r
      if (s.color === state.colorKey) return;\r
      state.colorKey = s.color;\r
      state.tints = buildTints(toRgb(s.color));\r
    };\r
\r
    const resolveReveal = (s: Settings) => {\r
      const src = s.revealImage ? String(s.revealImage) : '';\r
      const reveal = state.reveal;\r
      if (src === reveal.src) return;\r
      reveal.src = src;\r
      reveal.ready = false;\r
      if (reveal.image) reveal.image.onload = null;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || reveal.src !== src) return;\r
        const width = image.naturalWidth || image.width || 1;\r
        const height = image.naturalHeight || image.height || 1;\r
        const scale = Math.min(1, 2048 / Math.max(width, height));\r
        const sheet = document.createElement('canvas');\r
        sheet.width = Math.max(1, Math.round(width * scale));\r
        sheet.height = Math.max(1, Math.round(height * scale));\r
        sheet.getContext('2d')?.drawImage(image, 0, 0, sheet.width, sheet.height);\r
        gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
        reveal.width = sheet.width;\r
        reveal.height = sheet.height;\r
        reveal.ready = true;\r
        wakeRef.current?.();\r
      };\r
      image.src = src;\r
      reveal.image = image;\r
    };\r
\r
    const measure = (s: Settings, width: number, height: number): Surface => {\r
      const element = s.surfaceRef?.current ?? null;\r
      if (element !== state.observed) {\r
        if (state.observed) resizeObserver.unobserve(state.observed);\r
        if (element) resizeObserver.observe(element);\r
        state.observed = element;\r
      }\r
      if (element) {\r
        const box = container.getBoundingClientRect();\r
        const rect = element.getBoundingClientRect();\r
        if (rect.width > 0) {\r
          const computed = getComputedStyle(element);\r
          const radius = Math.max(\r
            parseFloat(computed.borderTopLeftRadius) || 0,\r
            parseFloat(computed.borderTopRightRadius) || 0\r
          );\r
          return {\r
            left: rect.left - box.left,\r
            top: rect.top - box.top,\r
            right: rect.right - box.left,\r
            bottom: rect.bottom - box.top,\r
            radius: Math.min(radius, rect.width / 2, rect.height / 2),\r
            real: true\r
          };\r
        }\r
      }\r
      return {\r
        left: -width * 2,\r
        top: s.surfaceLevel * height,\r
        right: width * 3,\r
        bottom: height * 3,\r
        radius: 0,\r
        real: false\r
      };\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const s = settingsRef.current;\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = canvas.width / width;\r
      render();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColor(s);\r
      const { width, height } = state;\r
      const scale = Math.max(0.2, Math.min(width / 585, height / 507));\r
      let surface = measure(s, width, height);\r
      let beamX = s.beamPosition * width;\r
      if (surface.real) {\r
        const margin = surface.radius + 6;\r
        if (beamX >= surface.left && beamX <= surface.right) {\r
          beamX = clamp(beamX, surface.left + margin, surface.right - margin);\r
        } else {\r
          surface = { left: -width * 2, top: height, right: width * 3, bottom: height * 3, radius: 0, real: false };\r
        }\r
      }\r
      const startY = -0.15 * height;\r
      const span = surface.top - startY + 0.3 * height;\r
      const it = state.introTime;\r
      const settled = it >= INTRO_END;\r
      const front = settled ? surface.top + 0.3 * height : startY + span * Math.pow(clamp(it / INTRO_DROP, 0, 1), 1.3);\r
      const impact = INTRO_DROP * Math.pow(Math.max(0, surface.top - startY) / span, 1 / 1.3);\r
      const tau = it - impact;\r
      const bloom = settled ? 1 : tau <= 0 ? 0 : spring(tau);\r
      const flash = settled || tau <= 0 ? 0 : Math.exp(-tau / 0.35) * (1 - Math.exp(-tau / 0.05));\r
      const runRange = s.spread * 250 * 1.3 + 80;\r
      const runFront = settled ? 100000 : tau <= 0 ? -40 : runRange * (1 - Math.exp(-1.15 * tau));\r
      const beadStrength = settled || tau <= 0 ? 0 : Math.exp(-1.15 * tau) * (1 - Math.exp(-tau / 0.08));\r
      const pour = (reach: number): [number, number] => {\r
        if (settled) return [1000, 1];\r
        if (tau <= 0) return [-reach, 0];\r
        const target = Math.min(reach, runRange * 0.97);\r
        const arrival = -Math.log(1 - target / runRange) / 1.15;\r
        const elapsed = tau - arrival;\r
        const ease = clamp((elapsed + 0.15) / 0.8, 0, 1);\r
        const fill = ease * ease * ease * (ease * (ease * 6 - 15) + 10);\r
        if (elapsed <= 0) return [runFront - target, fill];\r
        const speed = 1.15 * (runRange - target);\r
        return [speed * elapsed + 260 * elapsed * elapsed, fill];\r
      };\r
      const [frontL, fillL] = pour((beamX - surface.left) / scale);\r
      const [frontR, fillR] = pour((surface.right - beamX) / scale);\r
      const atmosphere = settled\r
        ? 1\r
        : tau <= 0\r
          ? 0.3 * easeOut(it / INTRO_DROP)\r
          : 0.3 + 0.7 * (1 - Math.exp(-1.3 * tau));\r
      const seedValue = Number(s.seed) || 0;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.uResolution, width, height);\r
      gl.uniform1f(uniforms.uDpr, state.ratio);\r
      gl.uniform1f(uniforms.uScale, scale);\r
      gl.uniform1f(uniforms.uTime, state.time);\r
      gl.uniform1f(uniforms.uBeamX, beamX);\r
      gl.uniform4f(uniforms.uSurface, surface.left, surface.top, surface.right, surface.bottom);\r
      gl.uniform1f(uniforms.uRadius, surface.radius);\r
      gl.uniform3f(uniforms.uIntro, front, bloom, flash);\r
      gl.uniform4f(uniforms.uPour, frontL, frontR, fillL, fillR);\r
      gl.uniform2f(uniforms.uRun, runFront, beadStrength);\r
      gl.uniform4f(uniforms.uLens, state.lens.x, state.lens.y, 95 * scale, state.lens.strength);\r
      resolveReveal(s);\r
      const { reveal } = state;\r
      const cover = Math.max(width / reveal.width, height / reveal.height);\r
      const coverWidth = reveal.width * cover;\r
      const coverHeight = reveal.height * cover;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
      gl.uniform1i(uniforms.uReveal, 0);\r
      gl.uniform4f(\r
        uniforms.uRevealMap,\r
        1 / coverWidth,\r
        1 / coverHeight,\r
        (coverWidth - width) / 2 / coverWidth,\r
        (coverHeight - height) / 2 / coverHeight\r
      );\r
      gl.uniform2f(uniforms.uRevealInfo, s.revealRadius, reveal.ready ? s.revealOpacity : 0);\r
      gl.uniform1f(uniforms.uAtmosphere, atmosphere);\r
      gl.uniform4f(uniforms.uAmount, s.intensity, s.fog, s.dust, s.streaks);\r
      gl.uniform4f(uniforms.uShape, s.beamWidth, s.flare, s.spread, s.spill);\r
      gl.uniform4f(uniforms.uExtra, s.pulse, s.dots, 34.34 + seedValue * 7.31, 11.58 + seedValue * 3.17);\r
      gl.uniform1f(uniforms.uTheme, s.theme === 'light' ? 1 : 0);\r
      gl.uniform3fv(uniforms.uTint, state.tints);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      const introducing = state.introTime < INTRO_END;\r
      if (introducing) state.introTime = Math.min(INTRO_END, state.introTime + dt);\r
\r
      const { pointer, lens } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      if (active && !lens.placed) {\r
        lens.x = pointer.x;\r
        lens.y = pointer.y;\r
        lens.vx = 0;\r
        lens.vy = 0;\r
        lens.placed = true;\r
      }\r
      const ax = 120 * (pointer.x - lens.x) - 19 * lens.vx;\r
      const ay = 120 * (pointer.y - lens.y) - 19 * lens.vy;\r
      lens.vx += ax * dt;\r
      lens.vy += ay * dt;\r
      lens.x += lens.vx * dt;\r
      lens.y += lens.vy * dt;\r
      const goal = active ? 1 : 0;\r
      lens.strength += (goal - lens.strength) * (1 - Math.exp(-dt / (goal > lens.strength ? 0.3 : 0.55)));\r
      if (lens.strength < 0.001 && !active) lens.placed = false;\r
\r
      render();\r
      const settling =\r
        Math.abs(state.lens.strength - (s.mouseInteraction && state.pointer.inside ? 1 : 0)) > 0.002 ||\r
        Math.hypot(state.lens.vx, state.lens.vy) > 0.5;\r
      if (moving || introducing || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
      wake();\r
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
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(revealTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div ref={containerRef} className={\`laser-flow-container\${className ? \` \${className}\` : ''}\`} {...attributes}>\r
      <canvas ref={canvasRef} className="laser-flow-canvas" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LaserFlow;\r
`,a=`'use client';\r
\r
import { useEffect, useRef, type HTMLAttributes, type RefObject } from 'react';\r
\r
export interface LaserFlowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {\r
  surfaceRef?: RefObject<HTMLElement | null>;\r
  beamPosition?: number;\r
  surfaceLevel?: number;\r
  color?: string;\r
  intensity?: number;\r
  beamWidth?: number;\r
  flare?: number;\r
  spread?: number;\r
  spill?: number;\r
  fog?: number;\r
  dust?: number;\r
  streaks?: number;\r
  dots?: number;\r
  pulse?: number;\r
  speed?: number;\r
  seed?: number;\r
  mouseInteraction?: boolean;\r
  revealImage?: string;\r
  revealRadius?: number;\r
  revealOpacity?: number;\r
  intro?: boolean;\r
  theme?: 'dark' | 'light';\r
  paused?: boolean;\r
  dpr?: number;\r
}\r
\r
type Settings = {\r
  surfaceRef?: RefObject<HTMLElement | null>;\r
  beamPosition: number;\r
  surfaceLevel: number;\r
  color: string;\r
  intensity: number;\r
  beamWidth: number;\r
  flare: number;\r
  spread: number;\r
  spill: number;\r
  fog: number;\r
  dust: number;\r
  streaks: number;\r
  dots: number;\r
  pulse: number;\r
  speed: number;\r
  seed: number;\r
  mouseInteraction: boolean;\r
  revealImage?: string;\r
  revealRadius: number;\r
  revealOpacity: number;\r
  intro: boolean;\r
  theme: 'dark' | 'light';\r
  paused: boolean;\r
  dpr?: number;\r
};\r
\r
type Surface = {\r
  left: number;\r
  top: number;\r
  right: number;\r
  bottom: number;\r
  radius: number;\r
  real: boolean;\r
};\r
\r
const VERTEX = \`#version 300 es\r
in vec2 aPosition;\r
void main() {\r
  gl_Position = vec4(aPosition, 0.0, 1.0);\r
}\`;\r
\r
const FRAGMENT = \`#version 300 es\r
precision highp float;\r
out vec4 outColor;\r
uniform vec2 uResolution;\r
uniform float uDpr;\r
uniform float uScale;\r
uniform float uTime;\r
uniform float uBeamX;\r
uniform vec4 uSurface;\r
uniform float uRadius;\r
uniform vec3 uIntro;\r
uniform vec4 uPour;\r
uniform vec2 uRun;\r
uniform vec4 uLens;\r
uniform sampler2D uReveal;\r
uniform vec4 uRevealMap;\r
uniform vec2 uRevealInfo;\r
uniform float uAtmosphere;\r
uniform vec4 uAmount;\r
uniform vec4 uShape;\r
uniform vec4 uExtra;\r
uniform float uTheme;\r
uniform vec3 uTint[16];\r
\r
#define BEAM uTint[0]\r
#define LEFT uTint[1]\r
#define RIGHT uTint[2]\r
#define CYAN uTint[3]\r
#define PINK uTint[4]\r
#define LILAC uTint[5]\r
#define SKY uTint[6]\r
#define PURPLE uTint[7]\r
#define DEEP uTint[8]\r
#define MIST uTint[9]\r
#define NAVY uTint[10]\r
#define WARM uTint[11]\r
#define EMBER uTint[12]\r
#define WHITE uTint[13]\r
#define HAZE uTint[14]\r
#define LAVENDER uTint[15]\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  vec2 u = f * f * (3.0 - 2.0 * f);\r
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);\r
}\r
\r
float fbm(vec2 p) {\r
  float v = 0.0;\r
  float a = 0.5;\r
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);\r
  for (int i = 0; i < 5; i++) {\r
    v += a * noise(p);\r
    p = m * p;\r
    a *= 0.5;\r
  }\r
  return v;\r
}\r
\r
float sq(float x) {\r
  return x * x;\r
}\r
\r
float roundBox(vec2 p, vec2 b, float r) {\r
  vec2 q = abs(p) - b + r;\r
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\r
}\r
\r
vec3 spill(float e, float fall, float strength, float front, float t, out vec3 glow) {\r
  glow = vec3(0.0);\r
  if (strength < 0.0005) return vec3(0.0);\r
  float f = max(fall, 0.0);\r
  float d = max(e, 0.0);\r
  float u = d / (6.0 + 0.28 * f);\r
  float start = smoothstep(-6.0, 12.0, fall);\r
  float fade = exp(-sq(max(f - 125.0, 0.0) / 40.0));\r
  float streak = 0.88 + 0.24 * noise(vec2(u * 6.0, f / 22.0 - t * 1.7));\r
  float bright = pow(strength, 1.5);\r
  float soft = sqrt(strength);\r
  float warmth = smoothstep(90.0, 130.0, f);\r
  vec3 coreK = mix(WHITE, WARM, warmth * exp(-d / 9.0));\r
  float core = mix(9.0, 2.6, warmth) * exp(-sq(d / (3.5 + 0.04 * f))) * exp(-sq(max(f - 130.0, 0.0) / 38.0));\r
  float wall = 24.0 * exp(-sq(d / 1.1)) * exp(-sq(max(f - 100.0, 0.0) / 30.0));\r
  float bandCenter = 0.7 - 0.3 * smoothstep(30.0, 110.0, f);\r
  float offset = u - bandCenter;\r
  float decay = (1.05 - bandCenter) / 1.31;\r
  float profile = offset < 0.0 ? exp(-sq(offset / 0.3)) : exp(-offset / decay);\r
  profile *= 1.0 - smoothstep(1.0, 1.4, u);\r
  vec3 bandA = mix(CYAN, PINK, smoothstep(50.0, 75.0, f));\r
  bandA = mix(bandA, LILAC, smoothstep(100.0, 125.0, f));\r
  vec3 bandB = mix(SKY, PURPLE, smoothstep(50.0, 75.0, f));\r
  vec3 fanK = mix(bandA, bandB, smoothstep(0.06, 0.18, offset));\r
  fanK = mix(fanK, DEEP, smoothstep(0.22, 0.42, offset));\r
  vec3 thread = WHITE * wall * bright + coreK * core * streak * bright;\r
  glow += fanK * 4.5 * profile * fade * streak * bright;\r
  glow += MIST * 0.7 * exp(-max(u - 1.0, 0.0) / 0.9) * smoothstep(0.7, 1.2, u) * fade * soft;\r
  glow += EMBER * 0.35 * exp(-sq((f - 165.0) / 22.0)) * exp(-d / 25.0) * bright;\r
  float lag = u * (6.0 + 0.28 * f) * 0.35;\r
  float reveal = 1.0 - smoothstep(front - 70.0, front + 8.0, f + lag);\r
  glow *= start * reveal;\r
  return thread * start * reveal;\r
}\r
\r
vec3 easeLight(vec3 light, float amount) {\r
  return -log(max(1.0 - amount * (1.0 - exp(-light)), vec3(0.0001)));\r
}\r
\r
void main() {\r
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y * uDpr - gl_FragCoord.y) / uDpr;\r
  vec2 p = frag / uScale;\r
  float t = uTime;\r
  float bx = uBeamX / uScale;\r
  float sl = uSurface.x / uScale;\r
  float sy = uSurface.y / uScale;\r
  float sr = uSurface.z / uScale;\r
  float sb = uSurface.w / uScale;\r
  float radius = uRadius / uScale;\r
  float dx = p.x - bx;\r
  float adx = abs(dx);\r
  float h = sy - p.y;\r
  float hp = max(h, 0.0);\r
  float above = smoothstep(-0.5, 0.5, h);\r
  float side = smoothstep(-24.0, 24.0, dx);\r
  vec3 sideK = mix(mix(LAVENDER, LEFT, smoothstep(40.0, 140.0, adx)), RIGHT, side);\r
  float beamWidth = uShape.x;\r
  float flare = uShape.y;\r
  float spread = 250.0 * uShape.z;\r
  float reachL = max(bx - sl, 1.0);\r
  float reachR = max(sr - bx, 1.0);\r
  float reach = dx < 0.0 ? reachL : reachR;\r
  float layerLen = clamp(0.29 * reach, 20.0, 100.0) * sqrt(uShape.z);\r
  float run = uRun.x;\r
  float runMask = 1.0 - smoothstep(run - 34.0, run + 6.0, adx);\r
  float bead = exp(-sq((adx - run + 16.0) / (18.0 + 0.04 * run))) * uRun.y;\r
  float flowMask = (1.0 - smoothstep(0.75 * spread, 1.1 * spread, adx)) * runMask;\r
  float edgeMask = (1.0 - smoothstep(0.8 * spread, 1.25 * spread, adx)) * runMask;\r
  float bloom = uIntro.y;\r
  vec2 center = vec2((sl + sr) * 0.5, (sy + sb) * 0.5);\r
  vec2 halfSize = vec2((sr - sl) * 0.5, (sb - sy) * 0.5);\r
  float sd = roundBox(p - center, halfSize, radius);\r
  float outline = max(sd, 0.0);\r
  float below = max(p.y - sy - radius, 0.0);\r
  float hug = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 14.0));\r
  float hugWide = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 40.0));\r
\r
  vec3 col = vec3(0.0);\r
\r
  float breathe = 1.0 + uExtra.x * (0.12 * sin(t * 1.5708) + 0.08 * (noise(vec2(t * 0.5, 3.0)) - 0.5));\r
\r
  float front = uIntro.x / uScale;\r
  float drop = smoothstep(front + 10.0, front - 110.0, p.y);\r
  float falling = 1.0 - smoothstep(sy - 24.0, sy, front);\r
  float top = mix(0.3, 1.0, smoothstep(0.0, 0.3 * sy, p.y));\r
  float beamCore = 24.0 * exp(-adx / (2.0 * beamWidth));\r
  float beamHalo = 1.3 * exp(-adx / (6.0 * beamWidth)) + 0.3 * exp(-adx / (22.0 * beamWidth));\r
  vec3 haloK = mix(BEAM, sideK, exp(-hp / 80.0));\r
  col += (BEAM * beamCore + haloK * beamHalo) * top * above * drop;\r
  float head = exp(-sq((p.y - front) / 24.0)) * falling;\r
  col += mix(WHITE, BEAM, 0.35) * head * (7.0 * exp(-adx / (2.6 * beamWidth)) + 1.0 * exp(-adx / (14.0 * beamWidth)));\r
\r
  float psi = adx * (outline + 1.0);\r
  float rise = max(hp - 17.9 * flare, 0.0);\r
  float skirtAmp = 16.6 * (exp(-sq(rise / (11.8 * flare))) + 0.3 * exp(-rise / (60.0 * flare)));\r
  float skirtSpread = mix(134.0, 155.0, side) * breathe * flare * flare * mix(0.35, 1.0, min(bloom, 1.0)) * max(bloom, 1.0);\r
  float skirt = skirtAmp * exp(-psi / skirtSpread) * exp(-sq(adx / (max(layerLen, 60.0 * sqrt(uShape.z)) * 1.48))) * hug;\r
  col += sideK * skirt * flowMask * min(bloom, 1.0);\r
\r
  float layer = 12.0 * exp(-adx / layerLen) * exp(-outline / (0.19 * layerLen)) * (1.0 + 0.4 * bead);\r
  col += sideK * layer * hug * flowMask * min(bloom, 1.0);\r
  float washMask = smoothstep(sl - 60.0, sl + 6.0, p.x) * (1.0 - smoothstep(sr - 6.0, sr + 45.0, p.x));\r
  float wash = 1.4 * exp(-adx / 100.0) * exp(-outline / 30.0);\r
  col += mix(BEAM, sideK, 0.25) * wash * hugWide * washMask * flowMask * min(bloom, 1.0);\r
  float highWash = 0.7 * exp(-adx / 140.0) * exp(-outline / 60.0);\r
  col += mix(BEAM, NAVY, 0.5) * highWash * hugWide * washMask * runMask * min(bloom, 1.0);\r
\r
  float sideSign = dx < 0.0 ? 0.0 : 1.0;\r
  float along = 0.5 * log((hp + 1.0) / (adx + 1.0));\r
  float lineScale = 6.0;\r
  float lp = log(max(psi, 1.0) / (120.0 * flare * flare)) * lineScale;\r
  float lineIndex = floor(lp) + sideSign * 97.0;\r
  float wobble = 0.22 * (noise(vec2(lineIndex * 3.7, t * 0.4 + along)) - 0.5);\r
  float lf = fract(lp + wobble) - 0.5;\r
  float gradient = lineScale * length(vec2(hp + 1.0, adx)) / max(psi, 1.0) / uScale;\r
  float halfWidth = max(0.35 * gradient, 0.0001);\r
  float drawWidth = max(halfWidth, 0.6 * gradient);\r
  float lineShape = exp(-lf * lf / (drawWidth * drawWidth)) * (halfWidth / drawWidth);\r
  float lineOn = step(0.3, hash(vec2(lineIndex, 1.3)));\r
  float lineFlow = smoothstep(0.25, 0.85, noise(vec2(lineIndex * 5.3 + 2.0, along * 3.0 + t * 1.1)));\r
  float flareArea = 120.0 * flare * flare;\r
  float lineEnvelope = smoothstep(0.85 * flareArea, 1.4 * flareArea, psi) * (1.0 - smoothstep(3.2 * flareArea, 7.5 * flareArea, psi));\r
  lineEnvelope *= exp(-adx / (layerLen * 1.5)) * hug * flowMask * (1.0 - smoothstep(35.0 * flare, 80.0 * flare, hp));\r
  float lineBright = mix(0.35, 1.0, hash(vec2(lineIndex, 4.0)));\r
  col += mix(sideK, WHITE, 0.6) * lineShape * lineOn * lineFlow * lineEnvelope * lineBright * 2.6 * uAmount.w * min(bloom, 1.0);\r
\r
  float edgeGlow = 22.8 * exp(-sq(adx / (150.0 * uShape.z))) * edgeMask * (1.0 + 0.9 * bead);\r
  float onTop = 1.0 - smoothstep(sy + radius, sy + radius + 10.0, p.y);\r
  float edgeLine = (exp(-sq(max(sd, 0.0) / 0.9)) + 0.12 * exp(-max(sd, 0.0) / 3.0)) * edgeGlow * onTop;\r
  col += mix(sideK, WHITE, 0.6) * edgeLine * min(bloom, 1.0);\r
\r
  float pour = uShape.w;\r
  float baseline = exp(-sq(130.0 / 150.0));\r
  float strengthR = exp(-sq(reachR / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachR)) / baseline * pour;\r
  float strengthL = exp(-sq(reachL / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachL)) / baseline * pour;\r
  float fallY = p.y - sy - 0.3 * radius;\r
  float rightHalf = smoothstep(center.x - 4.0, center.x + 4.0, p.x);\r
  float haloR = exp(-length(p - vec2(sr - 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthR);\r
  float haloL = exp(-length(p - vec2(sl + 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthL);\r
  vec3 glowR;\r
  vec3 glowL;\r
  col += spill(sd, fallY, strengthR, uPour.y, t, glowR) * rightHalf;\r
  col += spill(sd, fallY, strengthL, uPour.x, t, glowL) * (1.0 - rightHalf);\r
  col += easeLight(glowR * rightHalf + NAVY * 0.9 * haloR, uPour.w);\r
  col += easeLight(glowL * (1.0 - rightHalf) + NAVY * 0.9 * haloL, uPour.z);\r
\r
  vec2 toLens = frag - uLens.xy;\r
  float lens = exp(-dot(toLens, toLens) / sq(uLens.z)) * uLens.w;\r
  col *= 1.0 + 0.35 * lens * hug;\r
  float fogAmount = uAmount.y * uAtmosphere;\r
  float near = exp(-adx / 150.0);\r
  float envelope = near * (0.3 + 0.4 * exp(-hp / 50.0) + 1.2 * exp(-p.y / 120.0));\r
  if (fogAmount > 0.001 && h > -2.0 && envelope * max(0.25, 6.0 * exp(-adx / 50.0)) > 0.002) {\r
    vec2 fq = vec2(dx / 1.7, h) / 85.0 + vec2(t * 0.012, -t * 0.03) + uExtra.zw;\r
    vec2 fw = vec2(fbm(fq * 1.3 + vec2(1.7, 9.2) + t * 0.03), fbm(fq * 1.3 + vec2(8.3, 2.8) - t * 0.025));\r
    float cloud = fbm(fq + 1.4 * fw);\r
    float density = smoothstep(0.5, 0.78, cloud);\r
    float lit = exp(-adx / 50.0);\r
    float fogMask = smoothstep(-2.0, 20.0, h);\r
    float reached = smoothstep(front + 80.0, front - 40.0, p.y);\r
    vec3 fog = (HAZE * 0.45 + BEAM * 6.0 * lit * reached) * density * envelope * fogMask;\r
    float surfaceLit = exp(-adx / (layerLen * 1.3)) * exp(-outline / 28.0) * hugWide * flowMask * washMask * min(bloom, 1.0);\r
    fog += sideK * 2.2 * surfaceLit * (smoothstep(0.38, 0.72, cloud) - 0.35) * fogMask;\r
    float smoke = smoothstep(0.3, 0.75, cloud);\r
    fog += BEAM * 0.35 * exp(-adx / (22.0 * beamWidth)) * (0.35 + 0.9 * smoke) * fogMask * top * drop;\r
    col += fog * fogAmount * (1.0 + 1.2 * lens) * mix(1.0, 0.45, uTheme);\r
  }\r
\r
  if (uRevealInfo.y > 0.001 && uLens.w > 0.002) {\r
    vec2 toReveal = frag - uLens.xy;\r
    float reveal = exp(-dot(toReveal, toReveal) / sq(uRevealInfo.x)) * uLens.w;\r
    vec2 uv = frag * uRevealMap.xy + uRevealMap.zw;\r
    float onImage = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);\r
    vec4 ui = texture(uReveal, uv);\r
    float ink = max(ui.r, max(ui.g, ui.b)) * onImage;\r
    float lit = clamp(col.b * 0.9, 0.0, 1.0) * (1.0 - smoothstep(0.9, 2.2, col.b));\r
    float clearance = smoothstep(60.0 * sqrt(beamWidth), 150.0 * sqrt(beamWidth), adx);\r
    col += mix(BEAM, WHITE, 0.4) * ink * reveal * lit * clearance * uRevealInfo.y * 2.2;\r
  }\r
\r
  float haze = col.b;\r
  float dotGrid = 1.0 - smoothstep(0.16, 0.32, length(fract(frag / 3.0) - 0.5));\r
  col += BEAM * dotGrid * clamp(haze, 0.0, 1.5) * (1.0 - smoothstep(1.5, 4.0, haze)) * (0.18 + 0.3 * lens) * uExtra.y;\r
  if (lens > 0.002) {\r
    vec2 drift = frag - vec2(0.0, t * 14.0);\r
    vec2 sparkCell = floor(drift / 7.0);\r
    vec2 sparkPos = (sparkCell + 0.2 + 0.6 * vec2(hash(sparkCell + 5.1), hash(sparkCell + 2.3))) * 7.0;\r
    float sparkDist = length(drift - sparkPos);\r
    float sparkOn = step(0.8, hash(sparkCell + 8.8));\r
    float sparkTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(sparkCell + 3.7) * 6.283);\r
    col += WHITE * exp(-sparkDist * sparkDist / 0.35) * sparkOn * sparkTwinkle * lens * clamp(haze * 1.5, 0.0, 1.0) * 1.6 * uAmount.z;\r
  }\r
\r
  float dustAmount = uAmount.z;\r
  if (dustAmount > 0.001) {\r
    float dustLp = log(max(psi, 1.0) / (120.0 * flare * flare)) * 2.2;\r
    vec2 flowCell = vec2(dustLp / 1.1, (along + t * 0.22) / 0.06);\r
    vec2 cellId = floor(flowCell) + vec2(sideSign * 131.0, 0.0);\r
    vec2 cellJitter = vec2(hash(cellId + 1.7), hash(cellId + 8.3));\r
    vec2 particleFlow = (floor(flowCell) + 0.1 + cellJitter * 0.8) * vec2(1.1, 0.06);\r
    float particlePsi = 120.0 * flare * flare * exp(particleFlow.x / 2.2);\r
    float particleAlong = particleFlow.y - t * 0.22;\r
    float particleX = sqrt(particlePsi * exp(-2.0 * particleAlong)) - 1.0;\r
    float particleH = sqrt(particlePsi * exp(2.0 * particleAlong)) - 1.0;\r
    float particleDist = length(vec2(adx - particleX, hp - particleH)) * uScale;\r
    float particleOn = step(0.62, hash(cellId + 3.1));\r
    float particleTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(cellId + 9.2) * 6.283);\r
    float dustZone = exp(-sq(log(max(psi, 1.0) / (200.0 * flare * flare)) / 0.55)) * hug * flowMask * smoothstep(0.0, 6.0, outline);\r
    col += WHITE * exp(-particleDist * particleDist / 0.3) * particleOn * particleTwinkle * dustZone * 3.0 * dustAmount * min(bloom, 1.0);\r
\r
    vec2 glitterCell = vec2(dx / 3.0, (p.y - t * 26.0) / 9.0);\r
    vec2 glitterId = floor(glitterCell);\r
    vec2 glitterJitter = vec2(hash(glitterId + 4.4), hash(glitterId + 2.9));\r
    vec2 glitterPos = (glitterId + 0.15 + glitterJitter * 0.7) * vec2(3.0, 9.0);\r
    float glitterDist = length(vec2(dx, p.y - t * 26.0) - glitterPos) * uScale;\r
    float glitterOn = step(0.7, hash(glitterId + 6.6));\r
    float glitterTwinkle = 0.5 + 0.5 * sin(t * 6.0 + hash(glitterId + 1.1) * 6.283);\r
    float glitterZone = exp(-adx / (5.0 * beamWidth)) * smoothstep(1.5, 4.0, adx / beamWidth) * above * smoothstep(25.0, 70.0, hp) * top * drop;\r
    col += WHITE * exp(-glitterDist * glitterDist / 0.25) * glitterOn * glitterTwinkle * glitterZone * 2.2 * dustAmount * uAtmosphere;\r
  }\r
\r
  col *= uAmount.x * (1.0 + uIntro.z * 0.9 * exp(-length(vec2(dx, h * 1.6)) / 70.0));\r
  col *= smoothstep(-0.75, 0.25, sd * uScale);\r
\r
  vec3 emit = 1.0 - exp(-col * mix(1.0, 0.6, uTheme));\r
  float peak = max(emit.r, max(emit.g, emit.b));\r
  if (uTheme > 0.5) {\r
    float low = min(emit.r, min(emit.g, emit.b));\r
    float chroma = peak - low;\r
    vec3 hue = (emit - low) / max(chroma, 0.0001);\r
    float alpha = clamp(pow(chroma, 1.35) * 1.3, 0.0, 1.0) * 0.9;\r
    outColor = vec4((hue * 0.82 + 0.06) * alpha, alpha);\r
  } else {\r
    outColor = vec4(emit, peak);\r
  }\r
}\`;\r
\r
const TINTS = [\r
  [0, 1],\r
  [-11.5, 0.77],\r
  [9.5, 0.95],\r
  [-53.5, 0.79],\r
  [39.5, 0.77],\r
  [16, 0.81],\r
  [-16.3, 0.92],\r
  [13.3, 0.96],\r
  [3, 1.01],\r
  [1, 0.68],\r
  [1, 1.15],\r
  [142.5, 0.51],\r
  [113.6, 0.28],\r
  [-7.5, 0.13],\r
  [-2.7, 0.32],\r
  [7.5, 0.81]\r
];\r
\r
const BASE_SATURATION = 0.78;\r
const MAX_RENDER_DIM = 2048;\r
const INTRO_DROP = 1.25;\r
const INTRO_END = 5;\r
\r
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));\r
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);\r
const spring = (time: number) => {\r
  const omega = 8;\r
  const zeta = 0.62;\r
  const damped = omega * Math.sqrt(1 - zeta * zeta);\r
  return (\r
    1 - Math.exp(-zeta * omega * time) * (Math.cos(damped * time) + ((zeta * omega) / damped) * Math.sin(damped * time))\r
  );\r
};\r
\r
const toHsv = ([r, g, b]: number[]): [number, number] => {\r
  const max = Math.max(r, g, b);\r
  const min = Math.min(r, g, b);\r
  const delta = max - min;\r
  let hue = 0;\r
  if (delta > 0) {\r
    if (max === r) hue = ((g - b) / delta) % 6;\r
    else if (max === g) hue = (b - r) / delta + 2;\r
    else hue = (r - g) / delta + 4;\r
  }\r
  return [(hue * 60 + 360) % 360, max > 0 ? delta / max : 0];\r
};\r
\r
const fromHsv = (hue: number, saturation: number): number[] => {\r
  const h = (((hue % 360) + 360) % 360) / 60;\r
  const c = saturation;\r
  const x = c * (1 - Math.abs((h % 2) - 1));\r
  const m = 1 - c;\r
  const [r, g, b] =\r
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];\r
  return [r + m, g + m, b + m];\r
};\r
\r
const buildTints = (rgb: number[]) => {\r
  const [hue, saturation] = toHsv(rgb);\r
  const strength = saturation / BASE_SATURATION;\r
  const data = new Float32Array(TINTS.length * 3);\r
  TINTS.forEach(([shift, scale], index) => {\r
    data.set(fromHsv(hue + shift, clamp(BASE_SATURATION * scale * strength, 0, 1)), index * 3);\r
  });\r
  return data;\r
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
const link = (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) => {\r
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);\r
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);\r
  const program = gl.createProgram();\r
  if (!vertex || !fragment || !program) return null;\r
  gl.attachShader(program, vertex);\r
  gl.attachShader(program, fragment);\r
  gl.linkProgram(program);\r
  gl.deleteShader(vertex);\r
  gl.deleteShader(fragment);\r
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;\r
  gl.deleteProgram(program);\r
  return null;\r
};\r
\r
const locate = (gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]) => {\r
  const result: Record<string, WebGLUniformLocation | null> = {};\r
  for (const name of names) result[name] = gl.getUniformLocation(program, name);\r
  return result;\r
};\r
\r
export const LaserFlow = ({\r
  surfaceRef,\r
  beamPosition = 0.6,\r
  surfaceLevel = 1,\r
  color = '#3847ff',\r
  intensity = 1.8,\r
  beamWidth = 1.5,\r
  flare = 1.5,\r
  spread = 1.5,\r
  spill = 1,\r
  fog = 0.2,\r
  dust = 1.6,\r
  streaks = 1.5,\r
  dots = 1,\r
  pulse = 1.5,\r
  speed = 1.5,\r
  seed = 3,\r
  mouseInteraction = true,\r
  revealImage,\r
  revealRadius = 220,\r
  revealOpacity = 0.6,\r
  intro = true,\r
  theme = 'dark',\r
  paused = false,\r
  dpr,\r
  ...rest\r
}: LaserFlowProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const canvasRef = useRef<HTMLCanvasElement>(null);\r
  const wakeRef = useRef<(() => void) | null>(null);\r
  const settings: Settings = {\r
    surfaceRef,\r
    beamPosition: clamp(beamPosition, 0, 1),\r
    surfaceLevel: clamp(surfaceLevel, 0, 1),\r
    color: String(color),\r
    intensity: Math.max(0, intensity),\r
    beamWidth: clamp(beamWidth, 0.2, 5),\r
    flare: clamp(flare, 0.2, 4),\r
    spread: clamp(spread, 0.1, 4),\r
    spill: Math.max(0, spill),\r
    fog: Math.max(0, fog),\r
    dust: Math.max(0, dust),\r
    streaks: Math.max(0, streaks),\r
    dots: Math.max(0, dots),\r
    pulse: Math.max(0, pulse),\r
    speed,\r
    seed,\r
    mouseInteraction,\r
    revealImage,\r
    revealRadius: Math.max(1, revealRadius),\r
    revealOpacity: clamp(revealOpacity, 0, 1),\r
    intro,\r
    theme,\r
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
      antialias: false,\r
      depth: false,\r
      stencil: false\r
    });\r
    if (!container || !canvas || !gl) return undefined;\r
\r
    const program = link(gl, VERTEX, FRAGMENT);\r
    if (!program) return undefined;\r
\r
    const uniforms = locate(gl, program, [\r
      'uResolution',\r
      'uDpr',\r
      'uScale',\r
      'uTime',\r
      'uBeamX',\r
      'uSurface',\r
      'uRadius',\r
      'uIntro',\r
      'uPour',\r
      'uRun',\r
      'uLens',\r
      'uReveal',\r
      'uRevealMap',\r
      'uRevealInfo',\r
      'uAtmosphere',\r
      'uAmount',\r
      'uShape',\r
      'uExtra',\r
      'uTheme',\r
      'uTint'\r
    ]);\r
\r
    const vao = gl.createVertexArray();\r
    const buffer = gl.createBuffer();\r
    gl.bindVertexArray(vao);\r
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\r
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);\r
    const positionLocation = gl.getAttribLocation(program, 'aPosition');\r
    gl.enableVertexAttribArray(positionLocation);\r
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);\r
    gl.bindVertexArray(null);\r
\r
    const revealTexture = gl.createTexture();\r
    gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\r
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\r
\r
    const probe = document.createElement('canvas');\r
    probe.width = 1;\r
    probe.height = 1;\r
    const probeContext = probe.getContext('2d', { willReadFrequently: true });\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const state = {\r
      time: 0,\r
      introTime: settingsRef.current.intro && !reduce ? 0 : INTRO_END,\r
      width: 1,\r
      height: 1,\r
      ratio: 1,\r
      colorKey: '',\r
      tints: buildTints([0.22, 0.28, 1]),\r
      observed: null as HTMLElement | null,\r
      pointer: { x: 0, y: 0, inside: false },\r
      lens: { x: 0, y: 0, vx: 0, vy: 0, strength: 0, placed: false },\r
      reveal: { src: '', ready: false, width: 1, height: 1, image: null as HTMLImageElement | null }\r
    };\r
    let raf = 0;\r
    let last = 0;\r
    let visible = true;\r
    let alive = true;\r
\r
    const toRgb = (value: string): number[] => {\r
      if (!probeContext) return [0.22, 0.28, 1];\r
      probeContext.clearRect(0, 0, 1, 1);\r
      probeContext.fillStyle = '#3847ff';\r
      probeContext.fillStyle = value;\r
      probeContext.fillRect(0, 0, 1, 1);\r
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;\r
      return [r / 255, g / 255, b / 255];\r
    };\r
\r
    const resolveColor = (s: Settings) => {\r
      if (s.color === state.colorKey) return;\r
      state.colorKey = s.color;\r
      state.tints = buildTints(toRgb(s.color));\r
    };\r
\r
    const resolveReveal = (s: Settings) => {\r
      const src = s.revealImage ? String(s.revealImage) : '';\r
      const reveal = state.reveal;\r
      if (src === reveal.src) return;\r
      reveal.src = src;\r
      reveal.ready = false;\r
      if (reveal.image) reveal.image.onload = null;\r
      if (!src) return;\r
      const image = new Image();\r
      image.crossOrigin = 'anonymous';\r
      image.decoding = 'async';\r
      image.onload = () => {\r
        if (!alive || reveal.src !== src) return;\r
        const width = image.naturalWidth || image.width || 1;\r
        const height = image.naturalHeight || image.height || 1;\r
        const scale = Math.min(1, 2048 / Math.max(width, height));\r
        const sheet = document.createElement('canvas');\r
        sheet.width = Math.max(1, Math.round(width * scale));\r
        sheet.height = Math.max(1, Math.round(height * scale));\r
        sheet.getContext('2d')?.drawImage(image, 0, 0, sheet.width, sheet.height);\r
        gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);\r
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet);\r
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);\r
        reveal.width = sheet.width;\r
        reveal.height = sheet.height;\r
        reveal.ready = true;\r
        wakeRef.current?.();\r
      };\r
      image.src = src;\r
      reveal.image = image;\r
    };\r
\r
    const measure = (s: Settings, width: number, height: number): Surface => {\r
      const element = s.surfaceRef?.current ?? null;\r
      if (element !== state.observed) {\r
        if (state.observed) resizeObserver.unobserve(state.observed);\r
        if (element) resizeObserver.observe(element);\r
        state.observed = element;\r
      }\r
      if (element) {\r
        const box = container.getBoundingClientRect();\r
        const rect = element.getBoundingClientRect();\r
        if (rect.width > 0) {\r
          const computed = getComputedStyle(element);\r
          const radius = Math.max(\r
            parseFloat(computed.borderTopLeftRadius) || 0,\r
            parseFloat(computed.borderTopRightRadius) || 0\r
          );\r
          return {\r
            left: rect.left - box.left,\r
            top: rect.top - box.top,\r
            right: rect.right - box.left,\r
            bottom: rect.bottom - box.top,\r
            radius: Math.min(radius, rect.width / 2, rect.height / 2),\r
            real: true\r
          };\r
        }\r
      }\r
      return {\r
        left: -width * 2,\r
        top: s.surfaceLevel * height,\r
        right: width * 3,\r
        bottom: height * 3,\r
        radius: 0,\r
        real: false\r
      };\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      const s = settingsRef.current;\r
      const baseDpr = Math.min(s.dpr || window.devicePixelRatio || 1, 2);\r
      const longest = Math.max(width, height) * baseDpr;\r
      const ratio = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;\r
      const pixelWidth = Math.max(1, Math.round(width * ratio));\r
      const pixelHeight = Math.max(1, Math.round(height * ratio));\r
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {\r
        canvas.width = pixelWidth;\r
        canvas.height = pixelHeight;\r
      }\r
      state.width = width;\r
      state.height = height;\r
      state.ratio = canvas.width / width;\r
      render();\r
    };\r
\r
    const render = () => {\r
      const s = settingsRef.current;\r
      resolveColor(s);\r
      const { width, height } = state;\r
      const scale = Math.max(0.2, Math.min(width / 585, height / 507));\r
      let surface = measure(s, width, height);\r
      let beamX = s.beamPosition * width;\r
      if (surface.real) {\r
        const margin = surface.radius + 6;\r
        if (beamX >= surface.left && beamX <= surface.right) {\r
          beamX = clamp(beamX, surface.left + margin, surface.right - margin);\r
        } else {\r
          surface = { left: -width * 2, top: height, right: width * 3, bottom: height * 3, radius: 0, real: false };\r
        }\r
      }\r
      const startY = -0.15 * height;\r
      const span = surface.top - startY + 0.3 * height;\r
      const it = state.introTime;\r
      const settled = it >= INTRO_END;\r
      const front = settled ? surface.top + 0.3 * height : startY + span * Math.pow(clamp(it / INTRO_DROP, 0, 1), 1.3);\r
      const impact = INTRO_DROP * Math.pow(Math.max(0, surface.top - startY) / span, 1 / 1.3);\r
      const tau = it - impact;\r
      const bloom = settled ? 1 : tau <= 0 ? 0 : spring(tau);\r
      const flash = settled || tau <= 0 ? 0 : Math.exp(-tau / 0.35) * (1 - Math.exp(-tau / 0.05));\r
      const runRange = s.spread * 250 * 1.3 + 80;\r
      const runFront = settled ? 100000 : tau <= 0 ? -40 : runRange * (1 - Math.exp(-1.15 * tau));\r
      const beadStrength = settled || tau <= 0 ? 0 : Math.exp(-1.15 * tau) * (1 - Math.exp(-tau / 0.08));\r
      const pour = (reach: number): [number, number] => {\r
        if (settled) return [1000, 1];\r
        if (tau <= 0) return [-reach, 0];\r
        const target = Math.min(reach, runRange * 0.97);\r
        const arrival = -Math.log(1 - target / runRange) / 1.15;\r
        const elapsed = tau - arrival;\r
        const ease = clamp((elapsed + 0.15) / 0.8, 0, 1);\r
        const fill = ease * ease * ease * (ease * (ease * 6 - 15) + 10);\r
        if (elapsed <= 0) return [runFront - target, fill];\r
        const speed = 1.15 * (runRange - target);\r
        return [speed * elapsed + 260 * elapsed * elapsed, fill];\r
      };\r
      const [frontL, fillL] = pour((beamX - surface.left) / scale);\r
      const [frontR, fillR] = pour((surface.right - beamX) / scale);\r
      const atmosphere = settled\r
        ? 1\r
        : tau <= 0\r
          ? 0.3 * easeOut(it / INTRO_DROP)\r
          : 0.3 + 0.7 * (1 - Math.exp(-1.3 * tau));\r
      const seedValue = Number(s.seed) || 0;\r
\r
      gl.viewport(0, 0, canvas.width, canvas.height);\r
      gl.clearColor(0, 0, 0, 0);\r
      gl.clear(gl.COLOR_BUFFER_BIT);\r
      gl.useProgram(program);\r
      gl.uniform2f(uniforms.uResolution, width, height);\r
      gl.uniform1f(uniforms.uDpr, state.ratio);\r
      gl.uniform1f(uniforms.uScale, scale);\r
      gl.uniform1f(uniforms.uTime, state.time);\r
      gl.uniform1f(uniforms.uBeamX, beamX);\r
      gl.uniform4f(uniforms.uSurface, surface.left, surface.top, surface.right, surface.bottom);\r
      gl.uniform1f(uniforms.uRadius, surface.radius);\r
      gl.uniform3f(uniforms.uIntro, front, bloom, flash);\r
      gl.uniform4f(uniforms.uPour, frontL, frontR, fillL, fillR);\r
      gl.uniform2f(uniforms.uRun, runFront, beadStrength);\r
      gl.uniform4f(uniforms.uLens, state.lens.x, state.lens.y, 95 * scale, state.lens.strength);\r
      resolveReveal(s);\r
      const { reveal } = state;\r
      const cover = Math.max(width / reveal.width, height / reveal.height);\r
      const coverWidth = reveal.width * cover;\r
      const coverHeight = reveal.height * cover;\r
      gl.activeTexture(gl.TEXTURE0);\r
      gl.bindTexture(gl.TEXTURE_2D, revealTexture);\r
      gl.uniform1i(uniforms.uReveal, 0);\r
      gl.uniform4f(\r
        uniforms.uRevealMap,\r
        1 / coverWidth,\r
        1 / coverHeight,\r
        (coverWidth - width) / 2 / coverWidth,\r
        (coverHeight - height) / 2 / coverHeight\r
      );\r
      gl.uniform2f(uniforms.uRevealInfo, s.revealRadius, reveal.ready ? s.revealOpacity : 0);\r
      gl.uniform1f(uniforms.uAtmosphere, atmosphere);\r
      gl.uniform4f(uniforms.uAmount, s.intensity, s.fog, s.dust, s.streaks);\r
      gl.uniform4f(uniforms.uShape, s.beamWidth, s.flare, s.spread, s.spill);\r
      gl.uniform4f(uniforms.uExtra, s.pulse, s.dots, 34.34 + seedValue * 7.31, 11.58 + seedValue * 3.17);\r
      gl.uniform1f(uniforms.uTheme, s.theme === 'light' ? 1 : 0);\r
      gl.uniform3fv(uniforms.uTint, state.tints);\r
      gl.bindVertexArray(vao);\r
      gl.drawArrays(gl.TRIANGLES, 0, 3);\r
      gl.bindVertexArray(null);\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive || !visible || document.hidden) return;\r
      const s = settingsRef.current;\r
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;\r
      last = now;\r
      const moving = !s.paused && !reduce;\r
      if (moving) state.time += dt * s.speed;\r
      const introducing = state.introTime < INTRO_END;\r
      if (introducing) state.introTime = Math.min(INTRO_END, state.introTime + dt);\r
\r
      const { pointer, lens } = state;\r
      const active = s.mouseInteraction && pointer.inside && !reduce;\r
      if (active && !lens.placed) {\r
        lens.x = pointer.x;\r
        lens.y = pointer.y;\r
        lens.vx = 0;\r
        lens.vy = 0;\r
        lens.placed = true;\r
      }\r
      const ax = 120 * (pointer.x - lens.x) - 19 * lens.vx;\r
      const ay = 120 * (pointer.y - lens.y) - 19 * lens.vy;\r
      lens.vx += ax * dt;\r
      lens.vy += ay * dt;\r
      lens.x += lens.vx * dt;\r
      lens.y += lens.vy * dt;\r
      const goal = active ? 1 : 0;\r
      lens.strength += (goal - lens.strength) * (1 - Math.exp(-dt / (goal > lens.strength ? 0.3 : 0.55)));\r
      if (lens.strength < 0.001 && !active) lens.placed = false;\r
\r
      render();\r
      const settling =\r
        Math.abs(state.lens.strength - (s.mouseInteraction && state.pointer.inside ? 1 : 0)) > 0.002 ||\r
        Math.hypot(state.lens.vx, state.lens.vy) > 0.5;\r
      if (moving || introducing || settling) raf = requestAnimationFrame(frame);\r
      else last = 0;\r
    };\r
\r
    const wake = () => {\r
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const onPointerMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      const x = event.clientX - rect.left;\r
      const y = event.clientY - rect.top;\r
      state.pointer.x = x;\r
      state.pointer.y = y;\r
      state.pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;\r
      wake();\r
    };\r
\r
    const onPointerLeave = () => {\r
      state.pointer.inside = false;\r
      wake();\r
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
    document.addEventListener('visibilitychange', onVisibility);\r
    resize();\r
    wake();\r
\r
    wakeRef.current = () => {\r
      if (!raf) render();\r
      wake();\r
    };\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      wakeRef.current = null;\r
      resizeObserver.disconnect();\r
      intersection.disconnect();\r
      window.removeEventListener('pointermove', onPointerMove);\r
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);\r
      document.removeEventListener('visibilitychange', onVisibility);\r
      gl.deleteTexture(revealTexture);\r
      gl.deleteBuffer(buffer);\r
      gl.deleteVertexArray(vao);\r
      gl.deleteProgram(program);\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    wakeRef.current?.();\r
  });\r
\r
  const { className = '', ...attributes } = rest;\r
\r
  return (\r
    <div\r
      ref={containerRef}\r
      className={\`pointer-events-none relative h-full w-full\${className ? \` \${className}\` : ''}\`}\r
      {...attributes}\r
    >\r
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />\r
    </div>\r
  );\r
};\r
\r
export default LaserFlow;\r
`,o={usage:`import { useRef } from 'react';
import LaserFlow from './LaserFlow';

export default function Hero() {
  const cardRef = useRef(null);

  return (
    <div style={{ position: 'relative', height: '600px', overflow: 'hidden' }}>
      <LaserFlow
        surfaceRef={cardRef}
        beamPosition={0.6}
        color="#3847ff"
        intensity={1.8}
        flare={1.5}
        spread={1.5}
        spill={1}
        fog={0.2}
        dust={1.6}
        revealImage="/your-ui.png"
        revealRadius={220}
        revealOpacity={0.6}
      />

      <div
        ref={cardRef}
        style={{
          position: 'absolute',
          left: '18%',
          right: '28%',
          top: '52%',
          bottom: '-24px',
          borderRadius: '14px',
          background: '#0b0b0d'
        }}
      >
        {/* Your content here */}
      </div>
    </div>
  );
}`,code:e,css:r,tailwind:n,tsCode:t,tsTailwind:a};export{o as laserFlow};
