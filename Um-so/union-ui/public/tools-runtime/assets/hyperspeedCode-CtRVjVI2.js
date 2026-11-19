const r=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import * as THREE from 'three';\r
\r
import './Hyperspeed.css';\r
\r
const TRAVEL = 400;\r
const MAX_CARS = 160;\r
const MAX_POLES = 80;\r
const MAX_DUST = 1500;\r
const MAX_COLORS = 8;\r
const CURVES = ['straight', 'gentle', 'winding', 'hills', 'racing', 'deep'];\r
\r
const THEMES = {\r
  dark: {\r
    background: 'transparent',\r
    road: '#08080a',\r
    lines: '#25252d',\r
    tail: ['#d856bf', '#6750a2', '#c247ac'],\r
    head: ['#03b3c3', '#0e5ea5', '#324555'],\r
    poles: ['#03b3c3'],\r
    dust: '#ffffff'\r
  },\r
  light: {\r
    background: 'transparent',\r
    road: '#efeff2',\r
    lines: '#d0d0d7',\r
    tail: ['#d856bf', '#6750a2', '#c247ac'],\r
    head: ['#03b3c3', '#0e5ea5', '#324555'],\r
    poles: ['#03b3c3'],\r
    dust: '#18181b'\r
  }\r
};\r
\r
const BEND = /* glsl */ \`\r
  uniform float uTime;\r
  uniform float uCurvature;\r
  uniform vec4 uCurveA;\r
  uniform float uCurveB;\r
  uniform float uFogNear;\r
  uniform float uFogFar;\r
  uniform float uPixel;\r
  #define PI 3.14159265358979\r
  float nsin(float v) { return sin(v) * 0.5 + 0.5; }\r
  vec3 gentle(float p) {\r
    return vec3(\r
      cos(p * PI * 5.0 + uTime) * 25.0 - cos(0.02 * PI * 5.0 + uTime) * 25.0,\r
      sin(p * PI * 2.0 + PI * 0.5 + uTime) * 15.0 - sin(0.02 * PI * 2.0 + PI * 0.5 + uTime) * 15.0,\r
      0.0\r
    );\r
  }\r
  float windX(float p) { return cos(PI * p * 4.0 + uTime) * 25.0 + pow(cos(PI * p * 8.0 + uTime * 2.0), 2.0) * 5.0; }\r
  float windY(float p) { return -nsin(PI * p * 8.0 + uTime) * 10.0 - pow(nsin(PI * p + uTime / 8.0), 5.0) * 10.0; }\r
  vec3 winding(float p) { return vec3(windX(p) - windX(0.0125), windY(p) - windY(0.0125), 0.0); }\r
  vec3 hills(float p) {\r
    return vec3(\r
      cos(p * PI * 3.0 + uTime) * 30.0 - cos(0.02 * PI * 3.0 + uTime) * 30.0,\r
      nsin(p * PI * 6.0 + uTime) * 30.0 - nsin(0.02 * PI * 6.0 + uTime) * 30.0,\r
      nsin(p * PI * 10.0 + uTime) * 20.0 - nsin(0.02 * PI * 10.0 + uTime) * 20.0\r
    );\r
  }\r
  vec3 racing(float p) {\r
    return vec3(\r
      sin(p * PI * 2.0 + uTime) * 35.0 - sin(0.0125 * PI * 2.0 + uTime) * 35.0,\r
      sin(p * PI * 3.0 + uTime) * 10.0 - sin(0.0125 * PI * 3.0 + uTime) * 10.0,\r
      0.0\r
    );\r
  }\r
  float deepX(float p) { return sin(p * PI * 4.0 + uTime) * 10.0; }\r
  float deepY(float p) { return pow(abs(p * 10.0), 2.0) + sin(p * PI * 8.0 + uTime) * 20.0; }\r
  vec3 deep(float p) { return vec3(deepX(p) - deepX(0.02), deepY(p) - deepY(0.02), 0.0); }\r
  vec3 bend(float p) {\r
    vec3 d = gentle(p) * uCurveA.x + winding(p) * uCurveA.y + hills(p) * uCurveA.z + racing(p) * uCurveA.w + deep(p) * uCurveB;\r
    return d * uCurvature;\r
  }\r
\`;\r
\r
const STREAK_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeedA;\r
  attribute vec4 aSeedB;\r
  attribute float aPair;\r
  attribute float aTone;\r
  uniform float uTravel;\r
  uniform float uRoadX;\r
  uniform float uRoadWidth;\r
  uniform float uLanes;\r
  uniform float uDirection;\r
  uniform vec2 uSpeedRange;\r
  uniform float uTrail;\r
  uniform float uStretch;\r
  uniform float uSize;\r
  uniform float uRadiusScale;\r
  uniform float uMirror;\r
  uniform vec3 uColors[\${MAX_COLORS}];\r
  uniform float uColorCount;\r
  varying vec2 vUv;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vThin;\r
  void main() {\r
    float laneWidth = uRoadWidth / uLanes;\r
    float lane = min(floor(aSeedA.x * uLanes), uLanes - 1.0);\r
    float laneX = (lane + 0.5) * laneWidth - uRoadWidth * 0.5 + (aSeedA.y - 0.5) * 0.5 * laneWidth;\r
    float carWidth = mix(0.3, 0.5, aSeedA.z) * laneWidth;\r
    float radius = mix(0.05, 0.14, aSeedA.w) * uSize;\r
    float len = mix(0.03, 0.2, aSeedB.x) * uTravel * uTrail * (1.0 + uStretch);\r
    float speed = mix(uSpeedRange.x, uSpeedRange.y, aSeedB.y) * uDirection;\r
    vec3 center = vec3(\r
      uRoadX + laneX + aPair * carWidth,\r
      aSeedB.w * 0.8 + radius * 1.3,\r
      position.z * len + len - mod(uTime * speed + aSeedB.z * uTravel, uTravel)\r
    );\r
    vAbove = center.y;\r
    center.y = mix(center.y, -center.y * 1.8, uMirror);\r
    center += bend(abs(center.z / uTravel));\r
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);\r
    float wanted = radius * uRadiusScale;\r
    float shown = max(wanted, depth * uPixel * 0.75);\r
    vThin = wanted / shown;\r
    vec3 p = center + vec3(position.x * shown, position.y * shown * mix(1.0, 2.2, uMirror), 0.0);\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vec3 n = normal;\r
    n.y *= 1.0 - 2.0 * uMirror;\r
    vNormal = normalize(normalMatrix * n);\r
    vView = -mv.xyz;\r
    vUv = uv;\r
    vColor = uColors[int(min(floor(aTone * uColorCount), uColorCount - 1.0))];\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const STREAK_FRAGMENT = /* glsl */ \`\r
  uniform vec2 uFade;\r
  uniform float uIntensity;\r
  uniform float uSharp;\r
  uniform float uCore;\r
  uniform float uMirror;\r
  varying vec2 vUv;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vThin;\r
  void main() {\r
    float facing = abs(dot(normalize(vNormal), normalize(vView)));\r
    float alpha = pow(facing, uSharp) * smoothstep(uFade.x, uFade.y, vUv.x) * uIntensity * vThin * (1.0 - vFog);\r
    alpha *= mix(1.0, exp(-vAbove * 0.9), uMirror);\r
    if (alpha < 0.003) discard;\r
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));\r
  }\r
\`;\r
\r
const POLE_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeed;\r
  attribute float aIndex;\r
  attribute float aSide;\r
  uniform float uTravel;\r
  uniform float uCount;\r
  uniform float uEdge;\r
  uniform float uHeight;\r
  uniform float uRadiusScale;\r
  uniform float uMirror;\r
  uniform vec3 uColors[\${MAX_COLORS}];\r
  uniform float uColorCount;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vHeight;\r
  varying float vThin;\r
  void main() {\r
    vHeight = position.y + 0.5;\r
    float width = mix(0.08, 0.22, aSeed.y);\r
    float height = mix(1.3, 1.9, aSeed.z) * uHeight;\r
    float spacing = uTravel / max(uCount, 1.0);\r
    vec3 center = vec3(\r
      aSide * uEdge,\r
      vHeight * height,\r
      -uTravel + mod(uTime * 120.0 + (aIndex + aSeed.x * 0.6) * spacing, uTravel)\r
    );\r
    vAbove = center.y;\r
    center.y = mix(center.y, -center.y * 1.6, uMirror);\r
    center += bend(abs(center.z / uTravel));\r
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);\r
    float wanted = width * uRadiusScale;\r
    float shown = max(wanted, depth * uPixel * 0.75);\r
    vThin = wanted / shown;\r
    vec3 p = center + vec3(position.x * shown, 0.0, position.z * shown);\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vNormal = normalize(normalMatrix * normal);\r
    vView = -mv.xyz;\r
    vColor = uColors[int(min(floor(aSeed.w * uColorCount), uColorCount - 1.0))];\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const POLE_FRAGMENT = /* glsl */ \`\r
  uniform float uIntensity;\r
  uniform float uSharp;\r
  uniform float uCore;\r
  uniform float uMirror;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vHeight;\r
  varying float vThin;\r
  void main() {\r
    float facing = abs(dot(normalize(vNormal), normalize(vView)));\r
    float ends = smoothstep(0.0, 0.08, vHeight) * smoothstep(1.0, 0.9, vHeight);\r
    float alpha = pow(facing, uSharp) * ends * uIntensity * vThin * (1.0 - vFog);\r
    alpha *= mix(1.0, exp(-vAbove * 0.6), uMirror);\r
    if (alpha < 0.003) discard;\r
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));\r
  }\r
\`;\r
\r
const DUST_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeed;\r
  attribute float aEnd;\r
  uniform float uTravel;\r
  uniform float uStretch;\r
  uniform float uSpread;\r
  varying float vAlpha;\r
  void main() {\r
    float x = (aSeed.x - 0.5) * uSpread;\r
    float y = mix(1.0, 42.0, aSeed.y * aSeed.y);\r
    float speed = mix(140.0, 260.0, aSeed.w);\r
    float z = -uTravel + mod(uTime * speed + aSeed.z * uTravel, uTravel);\r
    float len = (0.6 + uStretch * 7.0) * mix(0.6, 1.4, aSeed.w);\r
    vec3 p = vec3(x, y, z + aEnd * len);\r
    p += bend(abs(p.z / uTravel));\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vAlpha = aEnd * (1.0 - smoothstep(uFogNear, uFogFar, -mv.z));\r
  }\r
\`;\r
\r
const DUST_FRAGMENT = /* glsl */ \`\r
  uniform vec3 uColor;\r
  uniform float uIntensity;\r
  varying float vAlpha;\r
  void main() {\r
    gl_FragColor = vec4(uColor, vAlpha * uIntensity);\r
  }\r
\`;\r
\r
const ROAD_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  uniform float uTravel;\r
  uniform float uWidth;\r
  varying vec2 vRoad;\r
  varying float vFog;\r
  void main() {\r
    vec3 p = position;\r
    p.x *= uWidth;\r
    vRoad = vec2(p.x, p.z);\r
    p += bend(abs(p.z / uTravel));\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const ROAD_FRAGMENT = /* glsl */ \`\r
  uniform float uTime;\r
  uniform vec3 uRoadColor;\r
  uniform vec3 uLineColor;\r
  uniform vec3 uBackground;\r
  uniform float uRoadWidth;\r
  uniform float uMedian;\r
  uniform float uLanes;\r
  uniform float uTransparent;\r
  uniform float uOpacity;\r
  varying vec2 vRoad;\r
  varying float vFog;\r
  float stripe(float d, float w) {\r
    float aa = fwidth(d) * 1.2;\r
    return 1.0 - smoothstep(w - aa, w + aa, d);\r
  }\r
  void main() {\r
    float rx = abs(vRoad.x) - uMedian * 0.5;\r
    vec3 color = rx < 0.0 ? mix(uRoadColor, uLineColor, 0.12) : uRoadColor;\r
    if (rx >= 0.0) {\r
      float laneWidth = uRoadWidth / uLanes;\r
      float shoulder = max(stripe(abs(rx - 0.3), 0.07), stripe(abs(rx - (uRoadWidth - 0.3)), 0.07));\r
      float nearest = floor(rx / laneWidth + 0.5);\r
      float inner = step(0.5, nearest) * step(nearest, uLanes - 0.5);\r
      float dash = step(0.5, fract((vRoad.y - uTime * 120.0) / 14.0));\r
      float marks = max(shoulder, stripe(abs(rx - nearest * laneWidth), 0.06) * inner * dash);\r
      color = mix(color, uLineColor, marks);\r
    }\r
    float alpha = mix(1.0, 1.0 - vFog, uTransparent) * uOpacity;\r
    gl_FragColor = vec4(mix(color, uBackground, vFog * (1.0 - uTransparent)), alpha);\r
  }\r
\`;\r
\r
const QUAD_VERTEX = /* glsl */ \`\r
  varying vec2 vUv;\r
  void main() {\r
    vUv = uv;\r
    gl_Position = vec4(position.xy, 0.0, 1.0);\r
  }\r
\`;\r
\r
const DOWN_FRAGMENT = /* glsl */ \`\r
  uniform sampler2D uTexture;\r
  uniform vec2 uTexel;\r
  varying vec2 vUv;\r
  vec4 tap(vec2 offset) {\r
    return min(texture2D(uTexture, vUv + uTexel * offset), vec4(1.0));\r
  }\r
  void main() {\r
    vec4 sum = tap(vec2(0.0)) * 4.0 + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));\r
    gl_FragColor = sum * 0.125;\r
  }\r
\`;\r
\r
const TENT = /* glsl */ \`\r
  uniform sampler2D uTexture;\r
  uniform vec2 uTexel;\r
  varying vec2 vUv;\r
  vec4 tent() {\r
    vec4 sum = texture2D(uTexture, vUv + uTexel * vec2(-1.0, 0.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(1.0, 0.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, -1.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, 1.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, -0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, -0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, 0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, 0.5)) * 2.0;\r
    return sum / 12.0;\r
  }\r
\`;\r
\r
const UP_FRAGMENT = /* glsl */ \`\r
  \${TENT}\r
  void main() {\r
    gl_FragColor = tent();\r
  }\r
\`;\r
\r
const BLOOM_FRAGMENT = /* glsl */ \`\r
  \${TENT}\r
  uniform float uStrength;\r
  uniform float uCeiling;\r
  uniform float uLight;\r
  void main() {\r
    vec4 color = tent() * uStrength;\r
    float peak = max(uLight > 0.5 ? color.a : max(color.r, max(color.g, color.b)), 0.0001);\r
    color *= uCeiling * (1.0 - exp(-peak / uCeiling)) / peak;\r
    gl_FragColor = uLight > 0.5 ? color : vec4(color.rgb, 0.0);\r
  }\r
\`;\r
\r
let colorContext = null;\r
\r
const toRgb = color => {\r
  colorContext = colorContext ?? document.createElement('canvas').getContext('2d');\r
  if (!colorContext) return [1, 1, 1];\r
  colorContext.fillStyle = '#000000';\r
  colorContext.fillStyle = color;\r
  const value = String(colorContext.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? [0, 0, 0];\r
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];\r
};\r
\r
const fillPalette = (uniform, count, colors) => {\r
  const list = colors.length ? colors : ['#ffffff'];\r
  for (let i = 0; i < MAX_COLORS; i++) uniform.value[i].fromArray(toRgb(list[i % list.length]));\r
  count.value = Math.min(list.length, MAX_COLORS);\r
};\r
\r
const instanced = source => {\r
  const geometry = new THREE.InstancedBufferGeometry();\r
  geometry.setIndex(source.index);\r
  Object.entries(source.attributes).forEach(([name, attribute]) => geometry.setAttribute(name, attribute));\r
  return geometry;\r
};\r
\r
const nsin = value => Math.sin(value) * 0.5 + 0.5;\r
const windX = (q, t) => Math.cos(Math.PI * q * 4 + t) * 25 + Math.cos(Math.PI * q * 8 + t * 2) ** 2 * 5;\r
const windY = (q, t) => -nsin(Math.PI * q * 8 + t) * 10 - nsin(Math.PI * q + t / 8) ** 5 * 10;\r
const deepX = (q, t) => Math.sin(q * Math.PI * 4 + t) * 10;\r
const deepY = (q, t) => Math.abs(q * 10) ** 2 + Math.sin(q * Math.PI * 8 + t) * 20;\r
\r
const curveShapes = (p, t) => {\r
  const { PI, cos, sin } = Math;\r
  return [\r
    [\r
      cos(p * PI * 5 + t) * 25 - cos(0.02 * PI * 5 + t) * 25,\r
      sin(p * PI * 2 + PI * 0.5 + t) * 15 - sin(0.02 * PI * 2 + PI * 0.5 + t) * 15,\r
      0\r
    ],\r
    [windX(p, t) - windX(0.0125, t), windY(p, t) - windY(0.0125, t), 0],\r
    [\r
      cos(p * PI * 3 + t) * 30 - cos(0.02 * PI * 3 + t) * 30,\r
      nsin(p * PI * 6 + t) * 30 - nsin(0.02 * PI * 6 + t) * 30,\r
      nsin(p * PI * 10 + t) * 20 - nsin(0.02 * PI * 10 + t) * 20\r
    ],\r
    [\r
      sin(p * PI * 2 + t) * 35 - sin(0.0125 * PI * 2 + t) * 35,\r
      sin(p * PI * 3 + t) * 10 - sin(0.0125 * PI * 3 + t) * 10,\r
      0\r
    ],\r
    [deepX(p, t) - deepX(0.02, t), deepY(p, t) - deepY(0.02, t), 0]\r
  ];\r
};\r
\r
const lookShapes = (t, curvature) => {\r
  const p = 0.025;\r
  const [gentle, , hills, racing] = curveShapes(p, t);\r
  return [\r
    [gentle[0] * curvature * 2, gentle[1] * curvature * 0.4, -3],\r
    [(windX(p, t) - windX(p + 0.007, t)) * curvature * -2, (windY(p, t) - windY(p + 0.007, t)) * curvature * -5, -10],\r
    [hills[0] * curvature * 2, hills[1] * curvature * 2, hills[2] * curvature * 2 - 5],\r
    [racing[0] * curvature, racing[1] * curvature, -5],\r
    [(deepX(p, t) - deepX(p + 0.01, t)) * curvature * -2, (deepY(p, t) - deepY(p + 0.01, t)) * curvature * -4, -10]\r
  ];\r
};\r
\r
const Hyperspeed = ({\r
  curve = 'winding',\r
  curvature = 1,\r
  speed = 1,\r
  boost = 3,\r
  fov = 90,\r
  boostFov = 130,\r
  lanes = 3,\r
  roadWidth = 10,\r
  medianWidth = 2,\r
  density = 40,\r
  trailLength = 1,\r
  lightSize = 1,\r
  poles = 20,\r
  poleHeight = 1,\r
  dust = 100,\r
  glow = 0.6,\r
  reflections = 0.5,\r
  steer = 0.35,\r
  tailColors,\r
  headColors,\r
  poleColors,\r
  roadColor,\r
  roadOpacity = 0.1,\r
  lineColor,\r
  background,\r
  theme = 'dark',\r
  interactive = true,\r
  boosting = false,\r
  onBoostStart,\r
  onBoostEnd,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const settings = {\r
    light: theme === 'light',\r
    curve: CURVES.includes(curve) ? curve : 'winding',\r
    curvature: Math.max(0, curvature),\r
    speed: Math.max(0, speed),\r
    boost: Math.max(1, boost),\r
    fov: Math.min(170, Math.max(20, fov)),\r
    boostFov: Math.min(170, Math.max(20, boostFov)),\r
    lanes: Math.max(1, Math.round(lanes)),\r
    roadWidth: Math.max(1, roadWidth),\r
    medianWidth: Math.max(0, medianWidth),\r
    density: Math.min(MAX_CARS, Math.max(0, Math.round(density))),\r
    trailLength: Math.max(0.05, trailLength),\r
    lightSize: Math.max(0.1, lightSize),\r
    poles: Math.min(MAX_POLES, Math.max(0, Math.round(poles))),\r
    poleHeight: Math.max(0.1, poleHeight),\r
    dust: Math.min(MAX_DUST, Math.max(0, Math.round(dust))),\r
    glow: Math.max(0, glow),\r
    reflections: Math.max(0, reflections),\r
    steer: Math.max(0, steer),\r
    tailColors: tailColors?.length ? tailColors : palette.tail,\r
    headColors: headColors?.length ? headColors : palette.head,\r
    poleColors: poleColors?.length ? poleColors : palette.poles,\r
    roadColor: roadColor ?? palette.road,\r
    roadOpacity: Math.min(1, Math.max(0, roadOpacity)),\r
    lineColor: lineColor ?? palette.lines,\r
    background: background ?? palette.background,\r
    dustColor: palette.dust,\r
    interactive,\r
    boosting\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const callbacksRef = useRef({ onBoostStart, onBoostEnd });\r
  callbacksRef.current = { onBoostStart, onBoostEnd };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });\r
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;\r
    renderer.autoClear = false;\r
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
    container.appendChild(renderer.domElement);\r
\r
    const scene = new THREE.Scene();\r
    const camera = new THREE.PerspectiveCamera(settingsRef.current.fov, 1, 0.1, 10000);\r
    camera.position.set(0, 8, -5);\r
\r
    const shared = {\r
      uTime: { value: 0 },\r
      uCurvature: { value: 1 },\r
      uCurveA: { value: new THREE.Vector4() },\r
      uCurveB: { value: 0 },\r
      uFogNear: { value: TRAVEL * 0.22 },\r
      uFogFar: { value: TRAVEL * 0.95 },\r
      uTravel: { value: TRAVEL },\r
      uStretch: { value: 0 },\r
      uPixel: { value: 0.001 }\r
    };\r
    const disposables = [];\r
    const effectMaterials = [];\r
\r
    const material = (vertexShader, fragmentShader, uniforms, options = {}) => {\r
      const created = new THREE.ShaderMaterial({\r
        vertexShader,\r
        fragmentShader,\r
        uniforms: { ...shared, ...uniforms },\r
        transparent: true,\r
        depthWrite: false,\r
        ...options\r
      });\r
      disposables.push(created);\r
      return created;\r
    };\r
\r
    const swatches = () => ({\r
      value: Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(1, 1, 1))\r
    });\r
\r
    const roadGeometry = new THREE.PlaneGeometry(1, TRAVEL, 1, 220);\r
    roadGeometry.rotateX(-Math.PI / 2);\r
    roadGeometry.translate(0, 0, -TRAVEL / 2);\r
    disposables.push(roadGeometry);\r
    const roadUniforms = {\r
      uWidth: { value: 1 },\r
      uRoadColor: { value: new THREE.Vector3() },\r
      uLineColor: { value: new THREE.Vector3() },\r
      uBackground: { value: new THREE.Vector3() },\r
      uRoadWidth: { value: 10 },\r
      uMedian: { value: 2 },\r
      uLanes: { value: 3 },\r
      uTransparent: { value: 0 },\r
      uOpacity: { value: 1 }\r
    };\r
    const roadMaterial = material(ROAD_VERTEX, ROAD_FRAGMENT, roadUniforms, { transparent: true, depthWrite: true });\r
    const road = new THREE.Mesh(roadGeometry, roadMaterial);\r
    road.frustumCulled = false;\r
    road.renderOrder = 0;\r
    road.layers.enable(1);\r
    scene.add(road);\r
\r
    const tube = new THREE.TubeGeometry(\r
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)),\r
      24,\r
      1,\r
      7,\r
      false\r
    );\r
    disposables.push(tube);\r
\r
    const streakGroup = (direction, fade, speedRange) => {\r
      const geometry = instanced(tube);\r
      const seedA = new Float32Array(MAX_CARS * 2 * 4);\r
      const seedB = new Float32Array(MAX_CARS * 2 * 4);\r
      const pair = new Float32Array(MAX_CARS * 2);\r
      const tone = new Float32Array(MAX_CARS * 2);\r
      for (let i = 0; i < MAX_CARS; i++) {\r
        const a = [Math.random(), Math.random(), Math.random(), Math.random()];\r
        const b = [Math.random(), Math.random(), Math.random(), Math.random() * Math.random()];\r
        const shade = Math.random();\r
        for (let side = 0; side < 2; side++) {\r
          const index = i * 2 + side;\r
          seedA.set(a, index * 4);\r
          seedB.set(b, index * 4);\r
          pair[index] = side ? 0.5 : -0.5;\r
          tone[index] = shade;\r
        }\r
      }\r
      geometry.setAttribute('aSeedA', new THREE.InstancedBufferAttribute(seedA, 4));\r
      geometry.setAttribute('aSeedB', new THREE.InstancedBufferAttribute(seedB, 4));\r
      geometry.setAttribute('aPair', new THREE.InstancedBufferAttribute(pair, 1));\r
      geometry.setAttribute('aTone', new THREE.InstancedBufferAttribute(tone, 1));\r
      geometry.instanceCount = 0;\r
      disposables.push(geometry);\r
      const uniforms = {\r
        uRoadX: { value: 0 },\r
        uRoadWidth: { value: 10 },\r
        uLanes: { value: 3 },\r
        uDirection: { value: direction },\r
        uSpeedRange: { value: new THREE.Vector2(...speedRange) },\r
        uTrail: { value: 1 },\r
        uSize: { value: 1 },\r
        uColors: swatches(),\r
        uColorCount: { value: 1 },\r
        uFade: { value: new THREE.Vector2(...fade) }\r
      };\r
      const layer = (radiusScale, sharp, mirror, order) => {\r
        const layerMaterial = material(\r
          STREAK_VERTEX,\r
          STREAK_FRAGMENT,\r
          {\r
            ...uniforms,\r
            uRadiusScale: { value: radiusScale },\r
            uSharp: { value: sharp },\r
            uMirror: { value: mirror },\r
            uIntensity: { value: 1 },\r
            uCore: { value: 0 }\r
          },\r
          { depthTest: !mirror }\r
        );\r
        effectMaterials.push(layerMaterial);\r
        const mesh = new THREE.Mesh(geometry, layerMaterial);\r
        mesh.frustumCulled = false;\r
        mesh.renderOrder = order;\r
        if (!mirror) mesh.layers.enable(1);\r
        scene.add(mesh);\r
        return layerMaterial;\r
      };\r
      return {\r
        geometry,\r
        uniforms,\r
        reflection: layer(2.1, 1.2, 1, 1),\r
        core: layer(1, 0.85, 0, 3)\r
      };\r
    };\r
\r
    const tail = streakGroup(1, [0, 0.6], [60, 80]);\r
    const head = streakGroup(-1, [1, 0.4], [120, 160]);\r
\r
    const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);\r
    disposables.push(cylinder);\r
    const poleGeometry = instanced(cylinder);\r
    const poleSeed = new Float32Array(MAX_POLES * 2 * 4);\r
    const poleIndex = new Float32Array(MAX_POLES * 2);\r
    const poleSide = new Float32Array(MAX_POLES * 2);\r
    for (let i = 0; i < MAX_POLES; i++) {\r
      for (let side = 0; side < 2; side++) {\r
        const index = i * 2 + side;\r
        poleSeed.set([Math.random(), Math.random(), Math.random(), Math.random()], index * 4);\r
        poleIndex[index] = i + (side ? 0.5 : 0);\r
        poleSide[index] = side ? 1 : -1;\r
      }\r
    }\r
    poleGeometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(poleSeed, 4));\r
    poleGeometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(poleIndex, 1));\r
    poleGeometry.setAttribute('aSide', new THREE.InstancedBufferAttribute(poleSide, 1));\r
    poleGeometry.instanceCount = 0;\r
    disposables.push(poleGeometry);\r
    const poleUniforms = {\r
      uCount: { value: 20 },\r
      uEdge: { value: 11 },\r
      uHeight: { value: 1 },\r
      uColors: swatches(),\r
      uColorCount: { value: 1 }\r
    };\r
    const poleLayer = (radiusScale, sharp, mirror, order) => {\r
      const layerMaterial = material(\r
        POLE_VERTEX,\r
        POLE_FRAGMENT,\r
        {\r
          ...poleUniforms,\r
          uRadiusScale: { value: radiusScale },\r
          uSharp: { value: sharp },\r
          uMirror: { value: mirror },\r
          uIntensity: { value: 1 },\r
          uCore: { value: 0 }\r
        },\r
        { depthTest: !mirror }\r
      );\r
      effectMaterials.push(layerMaterial);\r
      const mesh = new THREE.Mesh(poleGeometry, layerMaterial);\r
      mesh.frustumCulled = false;\r
      mesh.renderOrder = order;\r
      if (!mirror) mesh.layers.enable(1);\r
      scene.add(mesh);\r
      return layerMaterial;\r
    };\r
    const polesLayers = {\r
      reflection: poleLayer(2.4, 1.2, 1, 1),\r
      core: poleLayer(1, 0.8, 0, 3)\r
    };\r
\r
    const dustGeometry = new THREE.BufferGeometry();\r
    const dustSeed = new Float32Array(MAX_DUST * 2 * 4);\r
    const dustEnd = new Float32Array(MAX_DUST * 2);\r
    for (let i = 0; i < MAX_DUST; i++) {\r
      const seed = [Math.random(), Math.random(), Math.random(), Math.random()];\r
      dustSeed.set(seed, i * 8);\r
      dustSeed.set(seed, i * 8 + 4);\r
      dustEnd[i * 2 + 1] = 1;\r
    }\r
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_DUST * 2 * 3), 3));\r
    dustGeometry.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 4));\r
    dustGeometry.setAttribute('aEnd', new THREE.BufferAttribute(dustEnd, 1));\r
    dustGeometry.setDrawRange(0, 0);\r
    disposables.push(dustGeometry);\r
    const dustUniforms = {\r
      uSpread: { value: 140 },\r
      uColor: { value: new THREE.Vector3(1, 1, 1) },\r
      uIntensity: { value: 0.5 }\r
    };\r
    const dustMaterial = material(DUST_VERTEX, DUST_FRAGMENT, dustUniforms);\r
    effectMaterials.push(dustMaterial);\r
    const dustLines = new THREE.LineSegments(dustGeometry, dustMaterial);\r
    dustLines.frustumCulled = false;\r
    dustLines.renderOrder = 4;\r
    scene.add(dustLines);\r
\r
    const floatTargets =\r
      renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');\r
    const levels = Array.from({ length: 5 }, (_, index) => {\r
      const target = new THREE.WebGLRenderTarget(1, 1, {\r
        type: floatTargets ? THREE.HalfFloatType : THREE.UnsignedByteType,\r
        depthBuffer: index === 0\r
      });\r
      disposables.push(target);\r
      return target;\r
    });\r
    const quadScene = new THREE.Scene();\r
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);\r
    const quadGeometry = new THREE.PlaneGeometry(2, 2);\r
    disposables.push(quadGeometry);\r
    const quad = new THREE.Mesh(quadGeometry);\r
    quad.frustumCulled = false;\r
    quadScene.add(quad);\r
    const blur = (fragmentShader, options) => {\r
      const created = new THREE.ShaderMaterial({\r
        vertexShader: QUAD_VERTEX,\r
        fragmentShader,\r
        uniforms: {\r
          uTexture: { value: null },\r
          uTexel: { value: new THREE.Vector2() },\r
          uStrength: { value: 1 },\r
          uCeiling: { value: 1 },\r
          uLight: { value: 0 }\r
        },\r
        depthTest: false,\r
        depthWrite: false,\r
        ...options\r
      });\r
      disposables.push(created);\r
      return created;\r
    };\r
    const downMaterial = blur(DOWN_FRAGMENT, { blending: THREE.NoBlending });\r
    const upMaterial = blur(UP_FRAGMENT, {\r
      blending: THREE.CustomBlending,\r
      blendSrc: THREE.OneFactor,\r
      blendDst: THREE.OneFactor,\r
      blendSrcAlpha: THREE.OneFactor,\r
      blendDstAlpha: THREE.OneFactor\r
    });\r
    const bloomMaterial = blur(BLOOM_FRAGMENT, { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor });\r
    const pass = (passMaterial, source, target) => {\r
      quad.material = passMaterial;\r
      passMaterial.uniforms.uTexture.value = source.texture;\r
      passMaterial.uniforms.uTexel.value.set(1 / source.width, 1 / source.height);\r
      renderer.setRenderTarget(target);\r
      renderer.render(quadScene, quadCamera);\r
    };\r
    const clearColor = new THREE.Color();\r
    let clearAlpha = 0;\r
\r
    const state = {\r
      boost: 0,\r
      held: false,\r
      boosted: false,\r
      fov: settingsRef.current.fov,\r
      fovVelocity: 0,\r
      steerX: 0,\r
      steerY: 0,\r
      pointerX: 0,\r
      pointerY: 0,\r
      weights: [0, 0, 0, 0, 0],\r
      visible: true\r
    };\r
    const keys = { tail: '', head: '', poles: '', surface: '', light: null };\r
    const lookTarget = new THREE.Vector3();\r
    let raf = 0;\r
    let last = performance.now();\r
    let alive = true;\r
\r
    const syncColors = s => {\r
      const tailKey = s.tailColors.join();\r
      if (tailKey !== keys.tail) {\r
        keys.tail = tailKey;\r
        fillPalette(tail.uniforms.uColors, tail.uniforms.uColorCount, s.tailColors);\r
      }\r
      const headKey = s.headColors.join();\r
      if (headKey !== keys.head) {\r
        keys.head = headKey;\r
        fillPalette(head.uniforms.uColors, head.uniforms.uColorCount, s.headColors);\r
      }\r
      const poleKey = s.poleColors.join();\r
      if (poleKey !== keys.poles) {\r
        keys.poles = poleKey;\r
        fillPalette(poleUniforms.uColors, poleUniforms.uColorCount, s.poleColors);\r
      }\r
      const surfaceKey = [s.roadColor, s.lineColor, s.background, s.dustColor].join();\r
      if (surfaceKey !== keys.surface) {\r
        keys.surface = surfaceKey;\r
        roadUniforms.uRoadColor.value.fromArray(toRgb(s.roadColor));\r
        roadUniforms.uLineColor.value.fromArray(toRgb(s.lineColor));\r
        dustUniforms.uColor.value.fromArray(toRgb(s.dustColor));\r
        const transparent = s.background === 'transparent';\r
        const backdrop = transparent ? [0, 0, 0] : toRgb(s.background);\r
        roadUniforms.uBackground.value.fromArray(backdrop);\r
        roadUniforms.uTransparent.value = transparent ? 1 : 0;\r
        clearColor.setRGB(...backdrop, THREE.LinearSRGBColorSpace);\r
        clearAlpha = transparent ? 0 : 1;\r
      }\r
      if (keys.light !== s.light) {\r
        keys.light = s.light;\r
        effectMaterials.forEach(item => {\r
          item.blending = s.light ? THREE.NormalBlending : THREE.AdditiveBlending;\r
          item.needsUpdate = true;\r
        });\r
        bloomMaterial.blendDst = s.light ? THREE.OneMinusSrcAlphaFactor : THREE.OneFactor;\r
        bloomMaterial.blendSrcAlpha = s.light ? THREE.OneFactor : THREE.ZeroFactor;\r
        bloomMaterial.blendDstAlpha = s.light ? THREE.OneMinusSrcAlphaFactor : THREE.OneFactor;\r
        bloomMaterial.uniforms.uLight.value = s.light ? 1 : 0;\r
      }\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      renderer.setSize(width, height, false);\r
      levels.forEach((target, index) =>\r
        target.setSize(\r
          Math.max(1, Math.round(width / 2 ** (index + 1))),\r
          Math.max(1, Math.round(height / 2 ** (index + 1)))\r
        )\r
      );\r
      camera.aspect = width / height;\r
      camera.updateProjectionMatrix();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      syncColors(s);\r
\r
      const wanted = (state.held && s.interactive) || s.boosting ? 1 : 0;\r
      state.boost += (wanted - state.boost) * (1 - Math.exp(-dt / (wanted > state.boost ? 0.28 : 0.85)));\r
      const pace = s.speed * (reduce ? 0.3 : 1) * (1 + (s.boost - 1) * state.boost);\r
      shared.uTime.value += dt * pace;\r
      shared.uStretch.value = state.boost * 1.1;\r
      shared.uCurvature.value = s.curvature;\r
\r
      const target = CURVES.indexOf(s.curve) - 1;\r
      const blend = 1 - Math.exp(-dt / 0.6);\r
      state.weights = state.weights.map((weight, index) => weight + ((index === target ? 1 : 0) - weight) * blend);\r
      shared.uCurveA.value.set(state.weights[0], state.weights[1], state.weights[2], state.weights[3]);\r
      shared.uCurveB.value = state.weights[4];\r
\r
      const halfRoad = s.roadWidth / 2 + s.medianWidth / 2;\r
      const surface = 0.45 + 0.55 * s.roadOpacity;\r
      [tail, head].forEach((group, index) => {\r
        group.geometry.instanceCount = s.density * 2;\r
        group.uniforms.uRoadX.value = index ? halfRoad : -halfRoad;\r
        group.uniforms.uRoadWidth.value = s.roadWidth;\r
        group.uniforms.uLanes.value = s.lanes;\r
        group.uniforms.uTrail.value = s.trailLength;\r
        group.uniforms.uSize.value = s.lightSize;\r
        group.core.uniforms.uIntensity.value = s.light ? 0.95 : 1 + 0.35 * state.boost;\r
        group.core.uniforms.uCore.value = s.light ? 0 : 0.75;\r
        group.reflection.uniforms.uIntensity.value = s.reflections * (s.light ? 0.22 : 0.42) * surface;\r
      });\r
\r
      poleGeometry.instanceCount = s.poles * 2;\r
      poleUniforms.uCount.value = Math.max(1, s.poles);\r
      poleUniforms.uEdge.value = s.roadWidth + s.medianWidth / 2 + 0.8;\r
      poleUniforms.uHeight.value = s.poleHeight;\r
      polesLayers.core.uniforms.uIntensity.value = s.light ? 0.9 : 1;\r
      polesLayers.core.uniforms.uCore.value = s.light ? 0 : 0.6;\r
      polesLayers.reflection.uniforms.uIntensity.value = s.reflections * (s.light ? 0.2 : 0.38) * surface;\r
\r
      dustGeometry.setDrawRange(0, s.dust * 2);\r
      dustUniforms.uIntensity.value = (s.light ? 0.35 : 0.45) * (1 + state.boost);\r
      dustUniforms.uSpread.value = (s.roadWidth * 2 + s.medianWidth) * 5;\r
\r
      roadUniforms.uWidth.value = s.roadWidth * 2 + s.medianWidth + 3;\r
      roadUniforms.uRoadWidth.value = s.roadWidth;\r
      roadUniforms.uMedian.value = s.medianWidth;\r
      roadUniforms.uLanes.value = s.lanes;\r
      roadUniforms.uOpacity.value = s.roadOpacity;\r
      roadMaterial.depthWrite = s.roadOpacity > 0.5;\r
\r
      const fovTarget = reduce ? s.fov : s.fov + (s.boostFov - s.fov) * state.boost;\r
      state.fovVelocity += ((fovTarget - state.fov) * 90 - state.fovVelocity * 13) * dt;\r
      state.fov += state.fovVelocity * dt;\r
      camera.fov = state.fov;\r
      shared.uPixel.value = (2 * Math.tan((state.fov * Math.PI) / 360)) / Math.max(1, renderer.domElement.height);\r
\r
      const steerBlend = 1 - Math.exp(-dt / 0.35);\r
      const follow = s.interactive ? s.steer : 0;\r
      state.steerX += (state.pointerX * follow - state.steerX) * steerBlend;\r
      state.steerY += (state.pointerY * follow - state.steerY) * steerBlend;\r
      camera.position.set(state.steerX * s.roadWidth * 0.45, 8 - state.steerY * 2.5, -5);\r
\r
      const looks = lookShapes(shared.uTime.value, s.curvature);\r
      const straight = 1 - state.weights.reduce((sum, weight) => sum + weight, 0);\r
      lookTarget.set(0, 0, -10 * straight);\r
      looks.forEach((look, index) => {\r
        lookTarget.x += look[0] * state.weights[index];\r
        lookTarget.y += look[1] * state.weights[index];\r
        lookTarget.z += look[2] * state.weights[index];\r
      });\r
      lookTarget.x += state.steerX * 2.5;\r
      lookTarget.add(camera.position);\r
      camera.lookAt(lookTarget);\r
      camera.updateProjectionMatrix();\r
\r
      renderer.setRenderTarget(null);\r
      renderer.setClearColor(clearColor, clearAlpha);\r
      renderer.clear();\r
      renderer.render(scene, camera);\r
\r
      if (s.glow > 0) {\r
        const pixel = shared.uPixel.value;\r
        shared.uPixel.value = pixel * (renderer.domElement.height / levels[0].height);\r
        camera.layers.set(1);\r
        roadMaterial.colorWrite = false;\r
        renderer.setRenderTarget(levels[0]);\r
        renderer.setClearColor(0x000000, 0);\r
        renderer.clear();\r
        renderer.render(scene, camera);\r
        roadMaterial.colorWrite = true;\r
        camera.layers.set(0);\r
        shared.uPixel.value = pixel;\r
        for (let i = 1; i < levels.length; i++) pass(downMaterial, levels[i - 1], levels[i]);\r
        for (let i = levels.length - 1; i > 1; i--) pass(upMaterial, levels[i], levels[i - 1]);\r
        bloomMaterial.uniforms.uStrength.value = s.glow * (s.light ? 0.5 : 1.4);\r
        bloomMaterial.uniforms.uCeiling.value = s.glow * (s.light ? 0.3 : 0.5);\r
        pass(bloomMaterial, levels[1], null);\r
      }\r
\r
      if (state.visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !state.visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const setHeld = held => {\r
      if (state.held === held) return;\r
      state.held = held;\r
      if (!settingsRef.current.interactive) return;\r
      if (held) callbacksRef.current.onBoostStart?.();\r
      else callbacksRef.current.onBoostEnd?.();\r
    };\r
\r
    const onDown = event => {\r
      if (event.button !== 0 && event.pointerType === 'mouse') return;\r
      setHeld(true);\r
    };\r
    const onUp = () => setHeld(false);\r
    const onMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      state.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;\r
      state.pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;\r
    };\r
    const onLeave = () => {\r
      state.pointerX = 0;\r
      state.pointerY = 0;\r
    };\r
    const onMenu = event => {\r
      if (settingsRef.current.interactive) event.preventDefault();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
    container.addEventListener('pointerdown', onDown);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('contextmenu', onMenu);\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('pointercancel', onUp);\r
    window.addEventListener('blur', onUp);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('contextmenu', onMenu);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      window.removeEventListener('blur', onUp);\r
      disposables.forEach(item => item.dispose());\r
      renderer.dispose();\r
      renderer.domElement.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`hyperspeed\${className ? \` \${className}\` : ''}\`} style={style} />;\r
};\r
\r
export default Hyperspeed;\r
`,e=`.hyperspeed {\r
  position: absolute;\r
  inset: 0;\r
  overflow: hidden;\r
  touch-action: pan-y;\r
  -webkit-tap-highlight-color: transparent;\r
  -webkit-touch-callout: none;\r
  user-select: none;\r
}\r
\r
.hyperspeed canvas {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
}\r
`,n=`'use client';\r
\r
import { useEffect, useRef } from 'react';\r
import * as THREE from 'three';\r
\r
const TRAVEL = 400;\r
const MAX_CARS = 160;\r
const MAX_POLES = 80;\r
const MAX_DUST = 1500;\r
const MAX_COLORS = 8;\r
const CURVES = ['straight', 'gentle', 'winding', 'hills', 'racing', 'deep'];\r
\r
const THEMES = {\r
  dark: {\r
    background: 'transparent',\r
    road: '#08080a',\r
    lines: '#25252d',\r
    tail: ['#d856bf', '#6750a2', '#c247ac'],\r
    head: ['#03b3c3', '#0e5ea5', '#324555'],\r
    poles: ['#03b3c3'],\r
    dust: '#ffffff'\r
  },\r
  light: {\r
    background: 'transparent',\r
    road: '#efeff2',\r
    lines: '#d0d0d7',\r
    tail: ['#d856bf', '#6750a2', '#c247ac'],\r
    head: ['#03b3c3', '#0e5ea5', '#324555'],\r
    poles: ['#03b3c3'],\r
    dust: '#18181b'\r
  }\r
};\r
\r
const BEND = /* glsl */ \`\r
  uniform float uTime;\r
  uniform float uCurvature;\r
  uniform vec4 uCurveA;\r
  uniform float uCurveB;\r
  uniform float uFogNear;\r
  uniform float uFogFar;\r
  uniform float uPixel;\r
  #define PI 3.14159265358979\r
  float nsin(float v) { return sin(v) * 0.5 + 0.5; }\r
  vec3 gentle(float p) {\r
    return vec3(\r
      cos(p * PI * 5.0 + uTime) * 25.0 - cos(0.02 * PI * 5.0 + uTime) * 25.0,\r
      sin(p * PI * 2.0 + PI * 0.5 + uTime) * 15.0 - sin(0.02 * PI * 2.0 + PI * 0.5 + uTime) * 15.0,\r
      0.0\r
    );\r
  }\r
  float windX(float p) { return cos(PI * p * 4.0 + uTime) * 25.0 + pow(cos(PI * p * 8.0 + uTime * 2.0), 2.0) * 5.0; }\r
  float windY(float p) { return -nsin(PI * p * 8.0 + uTime) * 10.0 - pow(nsin(PI * p + uTime / 8.0), 5.0) * 10.0; }\r
  vec3 winding(float p) { return vec3(windX(p) - windX(0.0125), windY(p) - windY(0.0125), 0.0); }\r
  vec3 hills(float p) {\r
    return vec3(\r
      cos(p * PI * 3.0 + uTime) * 30.0 - cos(0.02 * PI * 3.0 + uTime) * 30.0,\r
      nsin(p * PI * 6.0 + uTime) * 30.0 - nsin(0.02 * PI * 6.0 + uTime) * 30.0,\r
      nsin(p * PI * 10.0 + uTime) * 20.0 - nsin(0.02 * PI * 10.0 + uTime) * 20.0\r
    );\r
  }\r
  vec3 racing(float p) {\r
    return vec3(\r
      sin(p * PI * 2.0 + uTime) * 35.0 - sin(0.0125 * PI * 2.0 + uTime) * 35.0,\r
      sin(p * PI * 3.0 + uTime) * 10.0 - sin(0.0125 * PI * 3.0 + uTime) * 10.0,\r
      0.0\r
    );\r
  }\r
  float deepX(float p) { return sin(p * PI * 4.0 + uTime) * 10.0; }\r
  float deepY(float p) { return pow(abs(p * 10.0), 2.0) + sin(p * PI * 8.0 + uTime) * 20.0; }\r
  vec3 deep(float p) { return vec3(deepX(p) - deepX(0.02), deepY(p) - deepY(0.02), 0.0); }\r
  vec3 bend(float p) {\r
    vec3 d = gentle(p) * uCurveA.x + winding(p) * uCurveA.y + hills(p) * uCurveA.z + racing(p) * uCurveA.w + deep(p) * uCurveB;\r
    return d * uCurvature;\r
  }\r
\`;\r
\r
const STREAK_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeedA;\r
  attribute vec4 aSeedB;\r
  attribute float aPair;\r
  attribute float aTone;\r
  uniform float uTravel;\r
  uniform float uRoadX;\r
  uniform float uRoadWidth;\r
  uniform float uLanes;\r
  uniform float uDirection;\r
  uniform vec2 uSpeedRange;\r
  uniform float uTrail;\r
  uniform float uStretch;\r
  uniform float uSize;\r
  uniform float uRadiusScale;\r
  uniform float uMirror;\r
  uniform vec3 uColors[\${MAX_COLORS}];\r
  uniform float uColorCount;\r
  varying vec2 vUv;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vThin;\r
  void main() {\r
    float laneWidth = uRoadWidth / uLanes;\r
    float lane = min(floor(aSeedA.x * uLanes), uLanes - 1.0);\r
    float laneX = (lane + 0.5) * laneWidth - uRoadWidth * 0.5 + (aSeedA.y - 0.5) * 0.5 * laneWidth;\r
    float carWidth = mix(0.3, 0.5, aSeedA.z) * laneWidth;\r
    float radius = mix(0.05, 0.14, aSeedA.w) * uSize;\r
    float len = mix(0.03, 0.2, aSeedB.x) * uTravel * uTrail * (1.0 + uStretch);\r
    float speed = mix(uSpeedRange.x, uSpeedRange.y, aSeedB.y) * uDirection;\r
    vec3 center = vec3(\r
      uRoadX + laneX + aPair * carWidth,\r
      aSeedB.w * 0.8 + radius * 1.3,\r
      position.z * len + len - mod(uTime * speed + aSeedB.z * uTravel, uTravel)\r
    );\r
    vAbove = center.y;\r
    center.y = mix(center.y, -center.y * 1.8, uMirror);\r
    center += bend(abs(center.z / uTravel));\r
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);\r
    float wanted = radius * uRadiusScale;\r
    float shown = max(wanted, depth * uPixel * 0.75);\r
    vThin = wanted / shown;\r
    vec3 p = center + vec3(position.x * shown, position.y * shown * mix(1.0, 2.2, uMirror), 0.0);\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vec3 n = normal;\r
    n.y *= 1.0 - 2.0 * uMirror;\r
    vNormal = normalize(normalMatrix * n);\r
    vView = -mv.xyz;\r
    vUv = uv;\r
    vColor = uColors[int(min(floor(aTone * uColorCount), uColorCount - 1.0))];\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const STREAK_FRAGMENT = /* glsl */ \`\r
  uniform vec2 uFade;\r
  uniform float uIntensity;\r
  uniform float uSharp;\r
  uniform float uCore;\r
  uniform float uMirror;\r
  varying vec2 vUv;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vThin;\r
  void main() {\r
    float facing = abs(dot(normalize(vNormal), normalize(vView)));\r
    float alpha = pow(facing, uSharp) * smoothstep(uFade.x, uFade.y, vUv.x) * uIntensity * vThin * (1.0 - vFog);\r
    alpha *= mix(1.0, exp(-vAbove * 0.9), uMirror);\r
    if (alpha < 0.003) discard;\r
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));\r
  }\r
\`;\r
\r
const POLE_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeed;\r
  attribute float aIndex;\r
  attribute float aSide;\r
  uniform float uTravel;\r
  uniform float uCount;\r
  uniform float uEdge;\r
  uniform float uHeight;\r
  uniform float uRadiusScale;\r
  uniform float uMirror;\r
  uniform vec3 uColors[\${MAX_COLORS}];\r
  uniform float uColorCount;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vHeight;\r
  varying float vThin;\r
  void main() {\r
    vHeight = position.y + 0.5;\r
    float width = mix(0.08, 0.22, aSeed.y);\r
    float height = mix(1.3, 1.9, aSeed.z) * uHeight;\r
    float spacing = uTravel / max(uCount, 1.0);\r
    vec3 center = vec3(\r
      aSide * uEdge,\r
      vHeight * height,\r
      -uTravel + mod(uTime * 120.0 + (aIndex + aSeed.x * 0.6) * spacing, uTravel)\r
    );\r
    vAbove = center.y;\r
    center.y = mix(center.y, -center.y * 1.6, uMirror);\r
    center += bend(abs(center.z / uTravel));\r
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);\r
    float wanted = width * uRadiusScale;\r
    float shown = max(wanted, depth * uPixel * 0.75);\r
    vThin = wanted / shown;\r
    vec3 p = center + vec3(position.x * shown, 0.0, position.z * shown);\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vNormal = normalize(normalMatrix * normal);\r
    vView = -mv.xyz;\r
    vColor = uColors[int(min(floor(aSeed.w * uColorCount), uColorCount - 1.0))];\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const POLE_FRAGMENT = /* glsl */ \`\r
  uniform float uIntensity;\r
  uniform float uSharp;\r
  uniform float uCore;\r
  uniform float uMirror;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vHeight;\r
  varying float vThin;\r
  void main() {\r
    float facing = abs(dot(normalize(vNormal), normalize(vView)));\r
    float ends = smoothstep(0.0, 0.08, vHeight) * smoothstep(1.0, 0.9, vHeight);\r
    float alpha = pow(facing, uSharp) * ends * uIntensity * vThin * (1.0 - vFog);\r
    alpha *= mix(1.0, exp(-vAbove * 0.6), uMirror);\r
    if (alpha < 0.003) discard;\r
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));\r
  }\r
\`;\r
\r
const DUST_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeed;\r
  attribute float aEnd;\r
  uniform float uTravel;\r
  uniform float uStretch;\r
  uniform float uSpread;\r
  varying float vAlpha;\r
  void main() {\r
    float x = (aSeed.x - 0.5) * uSpread;\r
    float y = mix(1.0, 42.0, aSeed.y * aSeed.y);\r
    float speed = mix(140.0, 260.0, aSeed.w);\r
    float z = -uTravel + mod(uTime * speed + aSeed.z * uTravel, uTravel);\r
    float len = (0.6 + uStretch * 7.0) * mix(0.6, 1.4, aSeed.w);\r
    vec3 p = vec3(x, y, z + aEnd * len);\r
    p += bend(abs(p.z / uTravel));\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vAlpha = aEnd * (1.0 - smoothstep(uFogNear, uFogFar, -mv.z));\r
  }\r
\`;\r
\r
const DUST_FRAGMENT = /* glsl */ \`\r
  uniform vec3 uColor;\r
  uniform float uIntensity;\r
  varying float vAlpha;\r
  void main() {\r
    gl_FragColor = vec4(uColor, vAlpha * uIntensity);\r
  }\r
\`;\r
\r
const ROAD_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  uniform float uTravel;\r
  uniform float uWidth;\r
  varying vec2 vRoad;\r
  varying float vFog;\r
  void main() {\r
    vec3 p = position;\r
    p.x *= uWidth;\r
    vRoad = vec2(p.x, p.z);\r
    p += bend(abs(p.z / uTravel));\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const ROAD_FRAGMENT = /* glsl */ \`\r
  uniform float uTime;\r
  uniform vec3 uRoadColor;\r
  uniform vec3 uLineColor;\r
  uniform vec3 uBackground;\r
  uniform float uRoadWidth;\r
  uniform float uMedian;\r
  uniform float uLanes;\r
  uniform float uTransparent;\r
  uniform float uOpacity;\r
  varying vec2 vRoad;\r
  varying float vFog;\r
  float stripe(float d, float w) {\r
    float aa = fwidth(d) * 1.2;\r
    return 1.0 - smoothstep(w - aa, w + aa, d);\r
  }\r
  void main() {\r
    float rx = abs(vRoad.x) - uMedian * 0.5;\r
    vec3 color = rx < 0.0 ? mix(uRoadColor, uLineColor, 0.12) : uRoadColor;\r
    if (rx >= 0.0) {\r
      float laneWidth = uRoadWidth / uLanes;\r
      float shoulder = max(stripe(abs(rx - 0.3), 0.07), stripe(abs(rx - (uRoadWidth - 0.3)), 0.07));\r
      float nearest = floor(rx / laneWidth + 0.5);\r
      float inner = step(0.5, nearest) * step(nearest, uLanes - 0.5);\r
      float dash = step(0.5, fract((vRoad.y - uTime * 120.0) / 14.0));\r
      float marks = max(shoulder, stripe(abs(rx - nearest * laneWidth), 0.06) * inner * dash);\r
      color = mix(color, uLineColor, marks);\r
    }\r
    float alpha = mix(1.0, 1.0 - vFog, uTransparent) * uOpacity;\r
    gl_FragColor = vec4(mix(color, uBackground, vFog * (1.0 - uTransparent)), alpha);\r
  }\r
\`;\r
\r
const QUAD_VERTEX = /* glsl */ \`\r
  varying vec2 vUv;\r
  void main() {\r
    vUv = uv;\r
    gl_Position = vec4(position.xy, 0.0, 1.0);\r
  }\r
\`;\r
\r
const DOWN_FRAGMENT = /* glsl */ \`\r
  uniform sampler2D uTexture;\r
  uniform vec2 uTexel;\r
  varying vec2 vUv;\r
  vec4 tap(vec2 offset) {\r
    return min(texture2D(uTexture, vUv + uTexel * offset), vec4(1.0));\r
  }\r
  void main() {\r
    vec4 sum = tap(vec2(0.0)) * 4.0 + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));\r
    gl_FragColor = sum * 0.125;\r
  }\r
\`;\r
\r
const TENT = /* glsl */ \`\r
  uniform sampler2D uTexture;\r
  uniform vec2 uTexel;\r
  varying vec2 vUv;\r
  vec4 tent() {\r
    vec4 sum = texture2D(uTexture, vUv + uTexel * vec2(-1.0, 0.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(1.0, 0.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, -1.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, 1.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, -0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, -0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, 0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, 0.5)) * 2.0;\r
    return sum / 12.0;\r
  }\r
\`;\r
\r
const UP_FRAGMENT = /* glsl */ \`\r
  \${TENT}\r
  void main() {\r
    gl_FragColor = tent();\r
  }\r
\`;\r
\r
const BLOOM_FRAGMENT = /* glsl */ \`\r
  \${TENT}\r
  uniform float uStrength;\r
  uniform float uCeiling;\r
  uniform float uLight;\r
  void main() {\r
    vec4 color = tent() * uStrength;\r
    float peak = max(uLight > 0.5 ? color.a : max(color.r, max(color.g, color.b)), 0.0001);\r
    color *= uCeiling * (1.0 - exp(-peak / uCeiling)) / peak;\r
    gl_FragColor = uLight > 0.5 ? color : vec4(color.rgb, 0.0);\r
  }\r
\`;\r
\r
let colorContext = null;\r
\r
const toRgb = color => {\r
  colorContext = colorContext ?? document.createElement('canvas').getContext('2d');\r
  if (!colorContext) return [1, 1, 1];\r
  colorContext.fillStyle = '#000000';\r
  colorContext.fillStyle = color;\r
  const value = String(colorContext.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? [0, 0, 0];\r
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];\r
};\r
\r
const fillPalette = (uniform, count, colors) => {\r
  const list = colors.length ? colors : ['#ffffff'];\r
  for (let i = 0; i < MAX_COLORS; i++) uniform.value[i].fromArray(toRgb(list[i % list.length]));\r
  count.value = Math.min(list.length, MAX_COLORS);\r
};\r
\r
const instanced = source => {\r
  const geometry = new THREE.InstancedBufferGeometry();\r
  geometry.setIndex(source.index);\r
  Object.entries(source.attributes).forEach(([name, attribute]) => geometry.setAttribute(name, attribute));\r
  return geometry;\r
};\r
\r
const nsin = value => Math.sin(value) * 0.5 + 0.5;\r
const windX = (q, t) => Math.cos(Math.PI * q * 4 + t) * 25 + Math.cos(Math.PI * q * 8 + t * 2) ** 2 * 5;\r
const windY = (q, t) => -nsin(Math.PI * q * 8 + t) * 10 - nsin(Math.PI * q + t / 8) ** 5 * 10;\r
const deepX = (q, t) => Math.sin(q * Math.PI * 4 + t) * 10;\r
const deepY = (q, t) => Math.abs(q * 10) ** 2 + Math.sin(q * Math.PI * 8 + t) * 20;\r
\r
const curveShapes = (p, t) => {\r
  const { PI, cos, sin } = Math;\r
  return [\r
    [\r
      cos(p * PI * 5 + t) * 25 - cos(0.02 * PI * 5 + t) * 25,\r
      sin(p * PI * 2 + PI * 0.5 + t) * 15 - sin(0.02 * PI * 2 + PI * 0.5 + t) * 15,\r
      0\r
    ],\r
    [windX(p, t) - windX(0.0125, t), windY(p, t) - windY(0.0125, t), 0],\r
    [\r
      cos(p * PI * 3 + t) * 30 - cos(0.02 * PI * 3 + t) * 30,\r
      nsin(p * PI * 6 + t) * 30 - nsin(0.02 * PI * 6 + t) * 30,\r
      nsin(p * PI * 10 + t) * 20 - nsin(0.02 * PI * 10 + t) * 20\r
    ],\r
    [\r
      sin(p * PI * 2 + t) * 35 - sin(0.0125 * PI * 2 + t) * 35,\r
      sin(p * PI * 3 + t) * 10 - sin(0.0125 * PI * 3 + t) * 10,\r
      0\r
    ],\r
    [deepX(p, t) - deepX(0.02, t), deepY(p, t) - deepY(0.02, t), 0]\r
  ];\r
};\r
\r
const lookShapes = (t, curvature) => {\r
  const p = 0.025;\r
  const [gentle, , hills, racing] = curveShapes(p, t);\r
  return [\r
    [gentle[0] * curvature * 2, gentle[1] * curvature * 0.4, -3],\r
    [(windX(p, t) - windX(p + 0.007, t)) * curvature * -2, (windY(p, t) - windY(p + 0.007, t)) * curvature * -5, -10],\r
    [hills[0] * curvature * 2, hills[1] * curvature * 2, hills[2] * curvature * 2 - 5],\r
    [racing[0] * curvature, racing[1] * curvature, -5],\r
    [(deepX(p, t) - deepX(p + 0.01, t)) * curvature * -2, (deepY(p, t) - deepY(p + 0.01, t)) * curvature * -4, -10]\r
  ];\r
};\r
\r
const ROOT =\r
  'absolute inset-0 overflow-hidden touch-pan-y select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full';\r
\r
const Hyperspeed = ({\r
  curve = 'winding',\r
  curvature = 1,\r
  speed = 1,\r
  boost = 3,\r
  fov = 90,\r
  boostFov = 130,\r
  lanes = 3,\r
  roadWidth = 10,\r
  medianWidth = 2,\r
  density = 40,\r
  trailLength = 1,\r
  lightSize = 1,\r
  poles = 20,\r
  poleHeight = 1,\r
  dust = 100,\r
  glow = 0.6,\r
  reflections = 0.5,\r
  steer = 0.35,\r
  tailColors,\r
  headColors,\r
  poleColors,\r
  roadColor,\r
  roadOpacity = 0.1,\r
  lineColor,\r
  background,\r
  theme = 'dark',\r
  interactive = true,\r
  boosting = false,\r
  onBoostStart,\r
  onBoostEnd,\r
  className = '',\r
  style\r
}) => {\r
  const containerRef = useRef(null);\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const settings = {\r
    light: theme === 'light',\r
    curve: CURVES.includes(curve) ? curve : 'winding',\r
    curvature: Math.max(0, curvature),\r
    speed: Math.max(0, speed),\r
    boost: Math.max(1, boost),\r
    fov: Math.min(170, Math.max(20, fov)),\r
    boostFov: Math.min(170, Math.max(20, boostFov)),\r
    lanes: Math.max(1, Math.round(lanes)),\r
    roadWidth: Math.max(1, roadWidth),\r
    medianWidth: Math.max(0, medianWidth),\r
    density: Math.min(MAX_CARS, Math.max(0, Math.round(density))),\r
    trailLength: Math.max(0.05, trailLength),\r
    lightSize: Math.max(0.1, lightSize),\r
    poles: Math.min(MAX_POLES, Math.max(0, Math.round(poles))),\r
    poleHeight: Math.max(0.1, poleHeight),\r
    dust: Math.min(MAX_DUST, Math.max(0, Math.round(dust))),\r
    glow: Math.max(0, glow),\r
    reflections: Math.max(0, reflections),\r
    steer: Math.max(0, steer),\r
    tailColors: tailColors?.length ? tailColors : palette.tail,\r
    headColors: headColors?.length ? headColors : palette.head,\r
    poleColors: poleColors?.length ? poleColors : palette.poles,\r
    roadColor: roadColor ?? palette.road,\r
    roadOpacity: Math.min(1, Math.max(0, roadOpacity)),\r
    lineColor: lineColor ?? palette.lines,\r
    background: background ?? palette.background,\r
    dustColor: palette.dust,\r
    interactive,\r
    boosting\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const callbacksRef = useRef({ onBoostStart, onBoostEnd });\r
  callbacksRef.current = { onBoostStart, onBoostEnd };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });\r
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;\r
    renderer.autoClear = false;\r
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
    container.appendChild(renderer.domElement);\r
\r
    const scene = new THREE.Scene();\r
    const camera = new THREE.PerspectiveCamera(settingsRef.current.fov, 1, 0.1, 10000);\r
    camera.position.set(0, 8, -5);\r
\r
    const shared = {\r
      uTime: { value: 0 },\r
      uCurvature: { value: 1 },\r
      uCurveA: { value: new THREE.Vector4() },\r
      uCurveB: { value: 0 },\r
      uFogNear: { value: TRAVEL * 0.22 },\r
      uFogFar: { value: TRAVEL * 0.95 },\r
      uTravel: { value: TRAVEL },\r
      uStretch: { value: 0 },\r
      uPixel: { value: 0.001 }\r
    };\r
    const disposables = [];\r
    const effectMaterials = [];\r
\r
    const material = (vertexShader, fragmentShader, uniforms, options = {}) => {\r
      const created = new THREE.ShaderMaterial({\r
        vertexShader,\r
        fragmentShader,\r
        uniforms: { ...shared, ...uniforms },\r
        transparent: true,\r
        depthWrite: false,\r
        ...options\r
      });\r
      disposables.push(created);\r
      return created;\r
    };\r
\r
    const swatches = () => ({\r
      value: Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(1, 1, 1))\r
    });\r
\r
    const roadGeometry = new THREE.PlaneGeometry(1, TRAVEL, 1, 220);\r
    roadGeometry.rotateX(-Math.PI / 2);\r
    roadGeometry.translate(0, 0, -TRAVEL / 2);\r
    disposables.push(roadGeometry);\r
    const roadUniforms = {\r
      uWidth: { value: 1 },\r
      uRoadColor: { value: new THREE.Vector3() },\r
      uLineColor: { value: new THREE.Vector3() },\r
      uBackground: { value: new THREE.Vector3() },\r
      uRoadWidth: { value: 10 },\r
      uMedian: { value: 2 },\r
      uLanes: { value: 3 },\r
      uTransparent: { value: 0 },\r
      uOpacity: { value: 1 }\r
    };\r
    const roadMaterial = material(ROAD_VERTEX, ROAD_FRAGMENT, roadUniforms, { transparent: true, depthWrite: true });\r
    const road = new THREE.Mesh(roadGeometry, roadMaterial);\r
    road.frustumCulled = false;\r
    road.renderOrder = 0;\r
    road.layers.enable(1);\r
    scene.add(road);\r
\r
    const tube = new THREE.TubeGeometry(\r
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)),\r
      24,\r
      1,\r
      7,\r
      false\r
    );\r
    disposables.push(tube);\r
\r
    const streakGroup = (direction, fade, speedRange) => {\r
      const geometry = instanced(tube);\r
      const seedA = new Float32Array(MAX_CARS * 2 * 4);\r
      const seedB = new Float32Array(MAX_CARS * 2 * 4);\r
      const pair = new Float32Array(MAX_CARS * 2);\r
      const tone = new Float32Array(MAX_CARS * 2);\r
      for (let i = 0; i < MAX_CARS; i++) {\r
        const a = [Math.random(), Math.random(), Math.random(), Math.random()];\r
        const b = [Math.random(), Math.random(), Math.random(), Math.random() * Math.random()];\r
        const shade = Math.random();\r
        for (let side = 0; side < 2; side++) {\r
          const index = i * 2 + side;\r
          seedA.set(a, index * 4);\r
          seedB.set(b, index * 4);\r
          pair[index] = side ? 0.5 : -0.5;\r
          tone[index] = shade;\r
        }\r
      }\r
      geometry.setAttribute('aSeedA', new THREE.InstancedBufferAttribute(seedA, 4));\r
      geometry.setAttribute('aSeedB', new THREE.InstancedBufferAttribute(seedB, 4));\r
      geometry.setAttribute('aPair', new THREE.InstancedBufferAttribute(pair, 1));\r
      geometry.setAttribute('aTone', new THREE.InstancedBufferAttribute(tone, 1));\r
      geometry.instanceCount = 0;\r
      disposables.push(geometry);\r
      const uniforms = {\r
        uRoadX: { value: 0 },\r
        uRoadWidth: { value: 10 },\r
        uLanes: { value: 3 },\r
        uDirection: { value: direction },\r
        uSpeedRange: { value: new THREE.Vector2(...speedRange) },\r
        uTrail: { value: 1 },\r
        uSize: { value: 1 },\r
        uColors: swatches(),\r
        uColorCount: { value: 1 },\r
        uFade: { value: new THREE.Vector2(...fade) }\r
      };\r
      const layer = (radiusScale, sharp, mirror, order) => {\r
        const layerMaterial = material(\r
          STREAK_VERTEX,\r
          STREAK_FRAGMENT,\r
          {\r
            ...uniforms,\r
            uRadiusScale: { value: radiusScale },\r
            uSharp: { value: sharp },\r
            uMirror: { value: mirror },\r
            uIntensity: { value: 1 },\r
            uCore: { value: 0 }\r
          },\r
          { depthTest: !mirror }\r
        );\r
        effectMaterials.push(layerMaterial);\r
        const mesh = new THREE.Mesh(geometry, layerMaterial);\r
        mesh.frustumCulled = false;\r
        mesh.renderOrder = order;\r
        if (!mirror) mesh.layers.enable(1);\r
        scene.add(mesh);\r
        return layerMaterial;\r
      };\r
      return {\r
        geometry,\r
        uniforms,\r
        reflection: layer(2.1, 1.2, 1, 1),\r
        core: layer(1, 0.85, 0, 3)\r
      };\r
    };\r
\r
    const tail = streakGroup(1, [0, 0.6], [60, 80]);\r
    const head = streakGroup(-1, [1, 0.4], [120, 160]);\r
\r
    const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);\r
    disposables.push(cylinder);\r
    const poleGeometry = instanced(cylinder);\r
    const poleSeed = new Float32Array(MAX_POLES * 2 * 4);\r
    const poleIndex = new Float32Array(MAX_POLES * 2);\r
    const poleSide = new Float32Array(MAX_POLES * 2);\r
    for (let i = 0; i < MAX_POLES; i++) {\r
      for (let side = 0; side < 2; side++) {\r
        const index = i * 2 + side;\r
        poleSeed.set([Math.random(), Math.random(), Math.random(), Math.random()], index * 4);\r
        poleIndex[index] = i + (side ? 0.5 : 0);\r
        poleSide[index] = side ? 1 : -1;\r
      }\r
    }\r
    poleGeometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(poleSeed, 4));\r
    poleGeometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(poleIndex, 1));\r
    poleGeometry.setAttribute('aSide', new THREE.InstancedBufferAttribute(poleSide, 1));\r
    poleGeometry.instanceCount = 0;\r
    disposables.push(poleGeometry);\r
    const poleUniforms = {\r
      uCount: { value: 20 },\r
      uEdge: { value: 11 },\r
      uHeight: { value: 1 },\r
      uColors: swatches(),\r
      uColorCount: { value: 1 }\r
    };\r
    const poleLayer = (radiusScale, sharp, mirror, order) => {\r
      const layerMaterial = material(\r
        POLE_VERTEX,\r
        POLE_FRAGMENT,\r
        {\r
          ...poleUniforms,\r
          uRadiusScale: { value: radiusScale },\r
          uSharp: { value: sharp },\r
          uMirror: { value: mirror },\r
          uIntensity: { value: 1 },\r
          uCore: { value: 0 }\r
        },\r
        { depthTest: !mirror }\r
      );\r
      effectMaterials.push(layerMaterial);\r
      const mesh = new THREE.Mesh(poleGeometry, layerMaterial);\r
      mesh.frustumCulled = false;\r
      mesh.renderOrder = order;\r
      if (!mirror) mesh.layers.enable(1);\r
      scene.add(mesh);\r
      return layerMaterial;\r
    };\r
    const polesLayers = {\r
      reflection: poleLayer(2.4, 1.2, 1, 1),\r
      core: poleLayer(1, 0.8, 0, 3)\r
    };\r
\r
    const dustGeometry = new THREE.BufferGeometry();\r
    const dustSeed = new Float32Array(MAX_DUST * 2 * 4);\r
    const dustEnd = new Float32Array(MAX_DUST * 2);\r
    for (let i = 0; i < MAX_DUST; i++) {\r
      const seed = [Math.random(), Math.random(), Math.random(), Math.random()];\r
      dustSeed.set(seed, i * 8);\r
      dustSeed.set(seed, i * 8 + 4);\r
      dustEnd[i * 2 + 1] = 1;\r
    }\r
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_DUST * 2 * 3), 3));\r
    dustGeometry.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 4));\r
    dustGeometry.setAttribute('aEnd', new THREE.BufferAttribute(dustEnd, 1));\r
    dustGeometry.setDrawRange(0, 0);\r
    disposables.push(dustGeometry);\r
    const dustUniforms = {\r
      uSpread: { value: 140 },\r
      uColor: { value: new THREE.Vector3(1, 1, 1) },\r
      uIntensity: { value: 0.5 }\r
    };\r
    const dustMaterial = material(DUST_VERTEX, DUST_FRAGMENT, dustUniforms);\r
    effectMaterials.push(dustMaterial);\r
    const dustLines = new THREE.LineSegments(dustGeometry, dustMaterial);\r
    dustLines.frustumCulled = false;\r
    dustLines.renderOrder = 4;\r
    scene.add(dustLines);\r
\r
    const floatTargets =\r
      renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');\r
    const levels = Array.from({ length: 5 }, (_, index) => {\r
      const target = new THREE.WebGLRenderTarget(1, 1, {\r
        type: floatTargets ? THREE.HalfFloatType : THREE.UnsignedByteType,\r
        depthBuffer: index === 0\r
      });\r
      disposables.push(target);\r
      return target;\r
    });\r
    const quadScene = new THREE.Scene();\r
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);\r
    const quadGeometry = new THREE.PlaneGeometry(2, 2);\r
    disposables.push(quadGeometry);\r
    const quad = new THREE.Mesh(quadGeometry);\r
    quad.frustumCulled = false;\r
    quadScene.add(quad);\r
    const blur = (fragmentShader, options) => {\r
      const created = new THREE.ShaderMaterial({\r
        vertexShader: QUAD_VERTEX,\r
        fragmentShader,\r
        uniforms: {\r
          uTexture: { value: null },\r
          uTexel: { value: new THREE.Vector2() },\r
          uStrength: { value: 1 },\r
          uCeiling: { value: 1 },\r
          uLight: { value: 0 }\r
        },\r
        depthTest: false,\r
        depthWrite: false,\r
        ...options\r
      });\r
      disposables.push(created);\r
      return created;\r
    };\r
    const downMaterial = blur(DOWN_FRAGMENT, { blending: THREE.NoBlending });\r
    const upMaterial = blur(UP_FRAGMENT, {\r
      blending: THREE.CustomBlending,\r
      blendSrc: THREE.OneFactor,\r
      blendDst: THREE.OneFactor,\r
      blendSrcAlpha: THREE.OneFactor,\r
      blendDstAlpha: THREE.OneFactor\r
    });\r
    const bloomMaterial = blur(BLOOM_FRAGMENT, { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor });\r
    const pass = (passMaterial, source, target) => {\r
      quad.material = passMaterial;\r
      passMaterial.uniforms.uTexture.value = source.texture;\r
      passMaterial.uniforms.uTexel.value.set(1 / source.width, 1 / source.height);\r
      renderer.setRenderTarget(target);\r
      renderer.render(quadScene, quadCamera);\r
    };\r
    const clearColor = new THREE.Color();\r
    let clearAlpha = 0;\r
\r
    const state = {\r
      boost: 0,\r
      held: false,\r
      boosted: false,\r
      fov: settingsRef.current.fov,\r
      fovVelocity: 0,\r
      steerX: 0,\r
      steerY: 0,\r
      pointerX: 0,\r
      pointerY: 0,\r
      weights: [0, 0, 0, 0, 0],\r
      visible: true\r
    };\r
    const keys = { tail: '', head: '', poles: '', surface: '', light: null };\r
    const lookTarget = new THREE.Vector3();\r
    let raf = 0;\r
    let last = performance.now();\r
    let alive = true;\r
\r
    const syncColors = s => {\r
      const tailKey = s.tailColors.join();\r
      if (tailKey !== keys.tail) {\r
        keys.tail = tailKey;\r
        fillPalette(tail.uniforms.uColors, tail.uniforms.uColorCount, s.tailColors);\r
      }\r
      const headKey = s.headColors.join();\r
      if (headKey !== keys.head) {\r
        keys.head = headKey;\r
        fillPalette(head.uniforms.uColors, head.uniforms.uColorCount, s.headColors);\r
      }\r
      const poleKey = s.poleColors.join();\r
      if (poleKey !== keys.poles) {\r
        keys.poles = poleKey;\r
        fillPalette(poleUniforms.uColors, poleUniforms.uColorCount, s.poleColors);\r
      }\r
      const surfaceKey = [s.roadColor, s.lineColor, s.background, s.dustColor].join();\r
      if (surfaceKey !== keys.surface) {\r
        keys.surface = surfaceKey;\r
        roadUniforms.uRoadColor.value.fromArray(toRgb(s.roadColor));\r
        roadUniforms.uLineColor.value.fromArray(toRgb(s.lineColor));\r
        dustUniforms.uColor.value.fromArray(toRgb(s.dustColor));\r
        const transparent = s.background === 'transparent';\r
        const backdrop = transparent ? [0, 0, 0] : toRgb(s.background);\r
        roadUniforms.uBackground.value.fromArray(backdrop);\r
        roadUniforms.uTransparent.value = transparent ? 1 : 0;\r
        clearColor.setRGB(...backdrop, THREE.LinearSRGBColorSpace);\r
        clearAlpha = transparent ? 0 : 1;\r
      }\r
      if (keys.light !== s.light) {\r
        keys.light = s.light;\r
        effectMaterials.forEach(item => {\r
          item.blending = s.light ? THREE.NormalBlending : THREE.AdditiveBlending;\r
          item.needsUpdate = true;\r
        });\r
        bloomMaterial.blendDst = s.light ? THREE.OneMinusSrcAlphaFactor : THREE.OneFactor;\r
        bloomMaterial.blendSrcAlpha = s.light ? THREE.OneFactor : THREE.ZeroFactor;\r
        bloomMaterial.blendDstAlpha = s.light ? THREE.OneMinusSrcAlphaFactor : THREE.OneFactor;\r
        bloomMaterial.uniforms.uLight.value = s.light ? 1 : 0;\r
      }\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      renderer.setSize(width, height, false);\r
      levels.forEach((target, index) =>\r
        target.setSize(\r
          Math.max(1, Math.round(width / 2 ** (index + 1))),\r
          Math.max(1, Math.round(height / 2 ** (index + 1)))\r
        )\r
      );\r
      camera.aspect = width / height;\r
      camera.updateProjectionMatrix();\r
      wake();\r
    };\r
\r
    const frame = now => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      syncColors(s);\r
\r
      const wanted = (state.held && s.interactive) || s.boosting ? 1 : 0;\r
      state.boost += (wanted - state.boost) * (1 - Math.exp(-dt / (wanted > state.boost ? 0.28 : 0.85)));\r
      const pace = s.speed * (reduce ? 0.3 : 1) * (1 + (s.boost - 1) * state.boost);\r
      shared.uTime.value += dt * pace;\r
      shared.uStretch.value = state.boost * 1.1;\r
      shared.uCurvature.value = s.curvature;\r
\r
      const target = CURVES.indexOf(s.curve) - 1;\r
      const blend = 1 - Math.exp(-dt / 0.6);\r
      state.weights = state.weights.map((weight, index) => weight + ((index === target ? 1 : 0) - weight) * blend);\r
      shared.uCurveA.value.set(state.weights[0], state.weights[1], state.weights[2], state.weights[3]);\r
      shared.uCurveB.value = state.weights[4];\r
\r
      const halfRoad = s.roadWidth / 2 + s.medianWidth / 2;\r
      const surface = 0.45 + 0.55 * s.roadOpacity;\r
      [tail, head].forEach((group, index) => {\r
        group.geometry.instanceCount = s.density * 2;\r
        group.uniforms.uRoadX.value = index ? halfRoad : -halfRoad;\r
        group.uniforms.uRoadWidth.value = s.roadWidth;\r
        group.uniforms.uLanes.value = s.lanes;\r
        group.uniforms.uTrail.value = s.trailLength;\r
        group.uniforms.uSize.value = s.lightSize;\r
        group.core.uniforms.uIntensity.value = s.light ? 0.95 : 1 + 0.35 * state.boost;\r
        group.core.uniforms.uCore.value = s.light ? 0 : 0.75;\r
        group.reflection.uniforms.uIntensity.value = s.reflections * (s.light ? 0.22 : 0.42) * surface;\r
      });\r
\r
      poleGeometry.instanceCount = s.poles * 2;\r
      poleUniforms.uCount.value = Math.max(1, s.poles);\r
      poleUniforms.uEdge.value = s.roadWidth + s.medianWidth / 2 + 0.8;\r
      poleUniforms.uHeight.value = s.poleHeight;\r
      polesLayers.core.uniforms.uIntensity.value = s.light ? 0.9 : 1;\r
      polesLayers.core.uniforms.uCore.value = s.light ? 0 : 0.6;\r
      polesLayers.reflection.uniforms.uIntensity.value = s.reflections * (s.light ? 0.2 : 0.38) * surface;\r
\r
      dustGeometry.setDrawRange(0, s.dust * 2);\r
      dustUniforms.uIntensity.value = (s.light ? 0.35 : 0.45) * (1 + state.boost);\r
      dustUniforms.uSpread.value = (s.roadWidth * 2 + s.medianWidth) * 5;\r
\r
      roadUniforms.uWidth.value = s.roadWidth * 2 + s.medianWidth + 3;\r
      roadUniforms.uRoadWidth.value = s.roadWidth;\r
      roadUniforms.uMedian.value = s.medianWidth;\r
      roadUniforms.uLanes.value = s.lanes;\r
      roadUniforms.uOpacity.value = s.roadOpacity;\r
      roadMaterial.depthWrite = s.roadOpacity > 0.5;\r
\r
      const fovTarget = reduce ? s.fov : s.fov + (s.boostFov - s.fov) * state.boost;\r
      state.fovVelocity += ((fovTarget - state.fov) * 90 - state.fovVelocity * 13) * dt;\r
      state.fov += state.fovVelocity * dt;\r
      camera.fov = state.fov;\r
      shared.uPixel.value = (2 * Math.tan((state.fov * Math.PI) / 360)) / Math.max(1, renderer.domElement.height);\r
\r
      const steerBlend = 1 - Math.exp(-dt / 0.35);\r
      const follow = s.interactive ? s.steer : 0;\r
      state.steerX += (state.pointerX * follow - state.steerX) * steerBlend;\r
      state.steerY += (state.pointerY * follow - state.steerY) * steerBlend;\r
      camera.position.set(state.steerX * s.roadWidth * 0.45, 8 - state.steerY * 2.5, -5);\r
\r
      const looks = lookShapes(shared.uTime.value, s.curvature);\r
      const straight = 1 - state.weights.reduce((sum, weight) => sum + weight, 0);\r
      lookTarget.set(0, 0, -10 * straight);\r
      looks.forEach((look, index) => {\r
        lookTarget.x += look[0] * state.weights[index];\r
        lookTarget.y += look[1] * state.weights[index];\r
        lookTarget.z += look[2] * state.weights[index];\r
      });\r
      lookTarget.x += state.steerX * 2.5;\r
      lookTarget.add(camera.position);\r
      camera.lookAt(lookTarget);\r
      camera.updateProjectionMatrix();\r
\r
      renderer.setRenderTarget(null);\r
      renderer.setClearColor(clearColor, clearAlpha);\r
      renderer.clear();\r
      renderer.render(scene, camera);\r
\r
      if (s.glow > 0) {\r
        const pixel = shared.uPixel.value;\r
        shared.uPixel.value = pixel * (renderer.domElement.height / levels[0].height);\r
        camera.layers.set(1);\r
        roadMaterial.colorWrite = false;\r
        renderer.setRenderTarget(levels[0]);\r
        renderer.setClearColor(0x000000, 0);\r
        renderer.clear();\r
        renderer.render(scene, camera);\r
        roadMaterial.colorWrite = true;\r
        camera.layers.set(0);\r
        shared.uPixel.value = pixel;\r
        for (let i = 1; i < levels.length; i++) pass(downMaterial, levels[i - 1], levels[i]);\r
        for (let i = levels.length - 1; i > 1; i--) pass(upMaterial, levels[i], levels[i - 1]);\r
        bloomMaterial.uniforms.uStrength.value = s.glow * (s.light ? 0.5 : 1.4);\r
        bloomMaterial.uniforms.uCeiling.value = s.glow * (s.light ? 0.3 : 0.5);\r
        pass(bloomMaterial, levels[1], null);\r
      }\r
\r
      if (state.visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !state.visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const setHeld = held => {\r
      if (state.held === held) return;\r
      state.held = held;\r
      if (!settingsRef.current.interactive) return;\r
      if (held) callbacksRef.current.onBoostStart?.();\r
      else callbacksRef.current.onBoostEnd?.();\r
    };\r
\r
    const onDown = event => {\r
      if (event.button !== 0 && event.pointerType === 'mouse') return;\r
      setHeld(true);\r
    };\r
    const onUp = () => setHeld(false);\r
    const onMove = event => {\r
      const rect = container.getBoundingClientRect();\r
      state.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;\r
      state.pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;\r
    };\r
    const onLeave = () => {\r
      state.pointerX = 0;\r
      state.pointerY = 0;\r
    };\r
    const onMenu = event => {\r
      if (settingsRef.current.interactive) event.preventDefault();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
    container.addEventListener('pointerdown', onDown);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('contextmenu', onMenu);\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('pointercancel', onUp);\r
    window.addEventListener('blur', onUp);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('contextmenu', onMenu);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      window.removeEventListener('blur', onUp);\r
      disposables.forEach(item => item.dispose());\r
      renderer.dispose();\r
      renderer.domElement.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`} style={style} />;\r
};\r
\r
export default Hyperspeed;\r
`,t=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
import * as THREE from 'three';\r
\r
import './Hyperspeed.css';\r
\r
export type HyperspeedCurve = 'straight' | 'gentle' | 'winding' | 'hills' | 'racing' | 'deep';\r
\r
export type HyperspeedProps = {\r
  curve?: HyperspeedCurve;\r
  curvature?: number;\r
  speed?: number;\r
  boost?: number;\r
  fov?: number;\r
  boostFov?: number;\r
  lanes?: number;\r
  roadWidth?: number;\r
  medianWidth?: number;\r
  density?: number;\r
  trailLength?: number;\r
  lightSize?: number;\r
  poles?: number;\r
  poleHeight?: number;\r
  dust?: number;\r
  glow?: number;\r
  reflections?: number;\r
  steer?: number;\r
  tailColors?: string[];\r
  headColors?: string[];\r
  poleColors?: string[];\r
  roadColor?: string;\r
  roadOpacity?: number;\r
  lineColor?: string;\r
  background?: string;\r
  theme?: 'dark' | 'light';\r
  interactive?: boolean;\r
  boosting?: boolean;\r
  onBoostStart?: () => void;\r
  onBoostEnd?: () => void;\r
  className?: string;\r
  style?: React.CSSProperties;\r
};\r
\r
type Vec3 = [number, number, number];\r
\r
type Swatches = { value: THREE.Vector3[] };\r
\r
type Palette = {\r
  background: string;\r
  road: string;\r
  lines: string;\r
  tail: string[];\r
  head: string[];\r
  poles: string[];\r
  dust: string;\r
};\r
\r
type Settings = {\r
  light: boolean;\r
  curve: HyperspeedCurve;\r
  curvature: number;\r
  speed: number;\r
  boost: number;\r
  fov: number;\r
  boostFov: number;\r
  lanes: number;\r
  roadWidth: number;\r
  medianWidth: number;\r
  density: number;\r
  trailLength: number;\r
  lightSize: number;\r
  poles: number;\r
  poleHeight: number;\r
  dust: number;\r
  glow: number;\r
  reflections: number;\r
  steer: number;\r
  tailColors: string[];\r
  headColors: string[];\r
  poleColors: string[];\r
  roadColor: string;\r
  roadOpacity: number;\r
  lineColor: string;\r
  background: string;\r
  dustColor: string;\r
  interactive: boolean;\r
  boosting: boolean;\r
};\r
\r
const TRAVEL = 400;\r
const MAX_CARS = 160;\r
const MAX_POLES = 80;\r
const MAX_DUST = 1500;\r
const MAX_COLORS = 8;\r
const CURVES: HyperspeedCurve[] = ['straight', 'gentle', 'winding', 'hills', 'racing', 'deep'];\r
\r
const THEMES: Record<'dark' | 'light', Palette> = {\r
  dark: {\r
    background: 'transparent',\r
    road: '#08080a',\r
    lines: '#25252d',\r
    tail: ['#d856bf', '#6750a2', '#c247ac'],\r
    head: ['#03b3c3', '#0e5ea5', '#324555'],\r
    poles: ['#03b3c3'],\r
    dust: '#ffffff'\r
  },\r
  light: {\r
    background: 'transparent',\r
    road: '#efeff2',\r
    lines: '#d0d0d7',\r
    tail: ['#d856bf', '#6750a2', '#c247ac'],\r
    head: ['#03b3c3', '#0e5ea5', '#324555'],\r
    poles: ['#03b3c3'],\r
    dust: '#18181b'\r
  }\r
};\r
\r
const BEND = /* glsl */ \`\r
  uniform float uTime;\r
  uniform float uCurvature;\r
  uniform vec4 uCurveA;\r
  uniform float uCurveB;\r
  uniform float uFogNear;\r
  uniform float uFogFar;\r
  uniform float uPixel;\r
  #define PI 3.14159265358979\r
  float nsin(float v) { return sin(v) * 0.5 + 0.5; }\r
  vec3 gentle(float p) {\r
    return vec3(\r
      cos(p * PI * 5.0 + uTime) * 25.0 - cos(0.02 * PI * 5.0 + uTime) * 25.0,\r
      sin(p * PI * 2.0 + PI * 0.5 + uTime) * 15.0 - sin(0.02 * PI * 2.0 + PI * 0.5 + uTime) * 15.0,\r
      0.0\r
    );\r
  }\r
  float windX(float p) { return cos(PI * p * 4.0 + uTime) * 25.0 + pow(cos(PI * p * 8.0 + uTime * 2.0), 2.0) * 5.0; }\r
  float windY(float p) { return -nsin(PI * p * 8.0 + uTime) * 10.0 - pow(nsin(PI * p + uTime / 8.0), 5.0) * 10.0; }\r
  vec3 winding(float p) { return vec3(windX(p) - windX(0.0125), windY(p) - windY(0.0125), 0.0); }\r
  vec3 hills(float p) {\r
    return vec3(\r
      cos(p * PI * 3.0 + uTime) * 30.0 - cos(0.02 * PI * 3.0 + uTime) * 30.0,\r
      nsin(p * PI * 6.0 + uTime) * 30.0 - nsin(0.02 * PI * 6.0 + uTime) * 30.0,\r
      nsin(p * PI * 10.0 + uTime) * 20.0 - nsin(0.02 * PI * 10.0 + uTime) * 20.0\r
    );\r
  }\r
  vec3 racing(float p) {\r
    return vec3(\r
      sin(p * PI * 2.0 + uTime) * 35.0 - sin(0.0125 * PI * 2.0 + uTime) * 35.0,\r
      sin(p * PI * 3.0 + uTime) * 10.0 - sin(0.0125 * PI * 3.0 + uTime) * 10.0,\r
      0.0\r
    );\r
  }\r
  float deepX(float p) { return sin(p * PI * 4.0 + uTime) * 10.0; }\r
  float deepY(float p) { return pow(abs(p * 10.0), 2.0) + sin(p * PI * 8.0 + uTime) * 20.0; }\r
  vec3 deep(float p) { return vec3(deepX(p) - deepX(0.02), deepY(p) - deepY(0.02), 0.0); }\r
  vec3 bend(float p) {\r
    vec3 d = gentle(p) * uCurveA.x + winding(p) * uCurveA.y + hills(p) * uCurveA.z + racing(p) * uCurveA.w + deep(p) * uCurveB;\r
    return d * uCurvature;\r
  }\r
\`;\r
\r
const STREAK_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeedA;\r
  attribute vec4 aSeedB;\r
  attribute float aPair;\r
  attribute float aTone;\r
  uniform float uTravel;\r
  uniform float uRoadX;\r
  uniform float uRoadWidth;\r
  uniform float uLanes;\r
  uniform float uDirection;\r
  uniform vec2 uSpeedRange;\r
  uniform float uTrail;\r
  uniform float uStretch;\r
  uniform float uSize;\r
  uniform float uRadiusScale;\r
  uniform float uMirror;\r
  uniform vec3 uColors[\${MAX_COLORS}];\r
  uniform float uColorCount;\r
  varying vec2 vUv;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vThin;\r
  void main() {\r
    float laneWidth = uRoadWidth / uLanes;\r
    float lane = min(floor(aSeedA.x * uLanes), uLanes - 1.0);\r
    float laneX = (lane + 0.5) * laneWidth - uRoadWidth * 0.5 + (aSeedA.y - 0.5) * 0.5 * laneWidth;\r
    float carWidth = mix(0.3, 0.5, aSeedA.z) * laneWidth;\r
    float radius = mix(0.05, 0.14, aSeedA.w) * uSize;\r
    float len = mix(0.03, 0.2, aSeedB.x) * uTravel * uTrail * (1.0 + uStretch);\r
    float speed = mix(uSpeedRange.x, uSpeedRange.y, aSeedB.y) * uDirection;\r
    vec3 center = vec3(\r
      uRoadX + laneX + aPair * carWidth,\r
      aSeedB.w * 0.8 + radius * 1.3,\r
      position.z * len + len - mod(uTime * speed + aSeedB.z * uTravel, uTravel)\r
    );\r
    vAbove = center.y;\r
    center.y = mix(center.y, -center.y * 1.8, uMirror);\r
    center += bend(abs(center.z / uTravel));\r
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);\r
    float wanted = radius * uRadiusScale;\r
    float shown = max(wanted, depth * uPixel * 0.75);\r
    vThin = wanted / shown;\r
    vec3 p = center + vec3(position.x * shown, position.y * shown * mix(1.0, 2.2, uMirror), 0.0);\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vec3 n = normal;\r
    n.y *= 1.0 - 2.0 * uMirror;\r
    vNormal = normalize(normalMatrix * n);\r
    vView = -mv.xyz;\r
    vUv = uv;\r
    vColor = uColors[int(min(floor(aTone * uColorCount), uColorCount - 1.0))];\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const STREAK_FRAGMENT = /* glsl */ \`\r
  uniform vec2 uFade;\r
  uniform float uIntensity;\r
  uniform float uSharp;\r
  uniform float uCore;\r
  uniform float uMirror;\r
  varying vec2 vUv;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vThin;\r
  void main() {\r
    float facing = abs(dot(normalize(vNormal), normalize(vView)));\r
    float alpha = pow(facing, uSharp) * smoothstep(uFade.x, uFade.y, vUv.x) * uIntensity * vThin * (1.0 - vFog);\r
    alpha *= mix(1.0, exp(-vAbove * 0.9), uMirror);\r
    if (alpha < 0.003) discard;\r
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));\r
  }\r
\`;\r
\r
const POLE_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeed;\r
  attribute float aIndex;\r
  attribute float aSide;\r
  uniform float uTravel;\r
  uniform float uCount;\r
  uniform float uEdge;\r
  uniform float uHeight;\r
  uniform float uRadiusScale;\r
  uniform float uMirror;\r
  uniform vec3 uColors[\${MAX_COLORS}];\r
  uniform float uColorCount;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vHeight;\r
  varying float vThin;\r
  void main() {\r
    vHeight = position.y + 0.5;\r
    float width = mix(0.08, 0.22, aSeed.y);\r
    float height = mix(1.3, 1.9, aSeed.z) * uHeight;\r
    float spacing = uTravel / max(uCount, 1.0);\r
    vec3 center = vec3(\r
      aSide * uEdge,\r
      vHeight * height,\r
      -uTravel + mod(uTime * 120.0 + (aIndex + aSeed.x * 0.6) * spacing, uTravel)\r
    );\r
    vAbove = center.y;\r
    center.y = mix(center.y, -center.y * 1.6, uMirror);\r
    center += bend(abs(center.z / uTravel));\r
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);\r
    float wanted = width * uRadiusScale;\r
    float shown = max(wanted, depth * uPixel * 0.75);\r
    vThin = wanted / shown;\r
    vec3 p = center + vec3(position.x * shown, 0.0, position.z * shown);\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vNormal = normalize(normalMatrix * normal);\r
    vView = -mv.xyz;\r
    vColor = uColors[int(min(floor(aSeed.w * uColorCount), uColorCount - 1.0))];\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const POLE_FRAGMENT = /* glsl */ \`\r
  uniform float uIntensity;\r
  uniform float uSharp;\r
  uniform float uCore;\r
  uniform float uMirror;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vHeight;\r
  varying float vThin;\r
  void main() {\r
    float facing = abs(dot(normalize(vNormal), normalize(vView)));\r
    float ends = smoothstep(0.0, 0.08, vHeight) * smoothstep(1.0, 0.9, vHeight);\r
    float alpha = pow(facing, uSharp) * ends * uIntensity * vThin * (1.0 - vFog);\r
    alpha *= mix(1.0, exp(-vAbove * 0.6), uMirror);\r
    if (alpha < 0.003) discard;\r
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));\r
  }\r
\`;\r
\r
const DUST_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeed;\r
  attribute float aEnd;\r
  uniform float uTravel;\r
  uniform float uStretch;\r
  uniform float uSpread;\r
  varying float vAlpha;\r
  void main() {\r
    float x = (aSeed.x - 0.5) * uSpread;\r
    float y = mix(1.0, 42.0, aSeed.y * aSeed.y);\r
    float speed = mix(140.0, 260.0, aSeed.w);\r
    float z = -uTravel + mod(uTime * speed + aSeed.z * uTravel, uTravel);\r
    float len = (0.6 + uStretch * 7.0) * mix(0.6, 1.4, aSeed.w);\r
    vec3 p = vec3(x, y, z + aEnd * len);\r
    p += bend(abs(p.z / uTravel));\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vAlpha = aEnd * (1.0 - smoothstep(uFogNear, uFogFar, -mv.z));\r
  }\r
\`;\r
\r
const DUST_FRAGMENT = /* glsl */ \`\r
  uniform vec3 uColor;\r
  uniform float uIntensity;\r
  varying float vAlpha;\r
  void main() {\r
    gl_FragColor = vec4(uColor, vAlpha * uIntensity);\r
  }\r
\`;\r
\r
const ROAD_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  uniform float uTravel;\r
  uniform float uWidth;\r
  varying vec2 vRoad;\r
  varying float vFog;\r
  void main() {\r
    vec3 p = position;\r
    p.x *= uWidth;\r
    vRoad = vec2(p.x, p.z);\r
    p += bend(abs(p.z / uTravel));\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const ROAD_FRAGMENT = /* glsl */ \`\r
  uniform float uTime;\r
  uniform vec3 uRoadColor;\r
  uniform vec3 uLineColor;\r
  uniform vec3 uBackground;\r
  uniform float uRoadWidth;\r
  uniform float uMedian;\r
  uniform float uLanes;\r
  uniform float uTransparent;\r
  uniform float uOpacity;\r
  varying vec2 vRoad;\r
  varying float vFog;\r
  float stripe(float d, float w) {\r
    float aa = fwidth(d) * 1.2;\r
    return 1.0 - smoothstep(w - aa, w + aa, d);\r
  }\r
  void main() {\r
    float rx = abs(vRoad.x) - uMedian * 0.5;\r
    vec3 color = rx < 0.0 ? mix(uRoadColor, uLineColor, 0.12) : uRoadColor;\r
    if (rx >= 0.0) {\r
      float laneWidth = uRoadWidth / uLanes;\r
      float shoulder = max(stripe(abs(rx - 0.3), 0.07), stripe(abs(rx - (uRoadWidth - 0.3)), 0.07));\r
      float nearest = floor(rx / laneWidth + 0.5);\r
      float inner = step(0.5, nearest) * step(nearest, uLanes - 0.5);\r
      float dash = step(0.5, fract((vRoad.y - uTime * 120.0) / 14.0));\r
      float marks = max(shoulder, stripe(abs(rx - nearest * laneWidth), 0.06) * inner * dash);\r
      color = mix(color, uLineColor, marks);\r
    }\r
    float alpha = mix(1.0, 1.0 - vFog, uTransparent) * uOpacity;\r
    gl_FragColor = vec4(mix(color, uBackground, vFog * (1.0 - uTransparent)), alpha);\r
  }\r
\`;\r
\r
const QUAD_VERTEX = /* glsl */ \`\r
  varying vec2 vUv;\r
  void main() {\r
    vUv = uv;\r
    gl_Position = vec4(position.xy, 0.0, 1.0);\r
  }\r
\`;\r
\r
const DOWN_FRAGMENT = /* glsl */ \`\r
  uniform sampler2D uTexture;\r
  uniform vec2 uTexel;\r
  varying vec2 vUv;\r
  vec4 tap(vec2 offset) {\r
    return min(texture2D(uTexture, vUv + uTexel * offset), vec4(1.0));\r
  }\r
  void main() {\r
    vec4 sum = tap(vec2(0.0)) * 4.0 + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));\r
    gl_FragColor = sum * 0.125;\r
  }\r
\`;\r
\r
const TENT = /* glsl */ \`\r
  uniform sampler2D uTexture;\r
  uniform vec2 uTexel;\r
  varying vec2 vUv;\r
  vec4 tent() {\r
    vec4 sum = texture2D(uTexture, vUv + uTexel * vec2(-1.0, 0.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(1.0, 0.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, -1.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, 1.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, -0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, -0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, 0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, 0.5)) * 2.0;\r
    return sum / 12.0;\r
  }\r
\`;\r
\r
const UP_FRAGMENT = /* glsl */ \`\r
  \${TENT}\r
  void main() {\r
    gl_FragColor = tent();\r
  }\r
\`;\r
\r
const BLOOM_FRAGMENT = /* glsl */ \`\r
  \${TENT}\r
  uniform float uStrength;\r
  uniform float uCeiling;\r
  uniform float uLight;\r
  void main() {\r
    vec4 color = tent() * uStrength;\r
    float peak = max(uLight > 0.5 ? color.a : max(color.r, max(color.g, color.b)), 0.0001);\r
    color *= uCeiling * (1.0 - exp(-peak / uCeiling)) / peak;\r
    gl_FragColor = uLight > 0.5 ? color : vec4(color.rgb, 0.0);\r
  }\r
\`;\r
\r
let colorContext: CanvasRenderingContext2D | null = null;\r
\r
const toRgb = (color: string): Vec3 => {\r
  colorContext = colorContext ?? document.createElement('canvas').getContext('2d');\r
  if (!colorContext) return [1, 1, 1];\r
  colorContext.fillStyle = '#000000';\r
  colorContext.fillStyle = color;\r
  const value = String(colorContext.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? [0, 0, 0];\r
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];\r
};\r
\r
const fillPalette = (uniform: Swatches, count: { value: number }, colors: string[]) => {\r
  const list = colors.length ? colors : ['#ffffff'];\r
  for (let i = 0; i < MAX_COLORS; i++) uniform.value[i].fromArray(toRgb(list[i % list.length]));\r
  count.value = Math.min(list.length, MAX_COLORS);\r
};\r
\r
const instanced = (source: THREE.BufferGeometry) => {\r
  const geometry = new THREE.InstancedBufferGeometry();\r
  geometry.setIndex(source.index);\r
  Object.entries(source.attributes).forEach(([name, attribute]) => geometry.setAttribute(name, attribute));\r
  return geometry;\r
};\r
\r
const nsin = (value: number) => Math.sin(value) * 0.5 + 0.5;\r
const windX = (q: number, t: number) => Math.cos(Math.PI * q * 4 + t) * 25 + Math.cos(Math.PI * q * 8 + t * 2) ** 2 * 5;\r
const windY = (q: number, t: number) => -nsin(Math.PI * q * 8 + t) * 10 - nsin(Math.PI * q + t / 8) ** 5 * 10;\r
const deepX = (q: number, t: number) => Math.sin(q * Math.PI * 4 + t) * 10;\r
const deepY = (q: number, t: number) => Math.abs(q * 10) ** 2 + Math.sin(q * Math.PI * 8 + t) * 20;\r
\r
const curveShapes = (p: number, t: number): Vec3[] => {\r
  const { PI, cos, sin } = Math;\r
  return [\r
    [\r
      cos(p * PI * 5 + t) * 25 - cos(0.02 * PI * 5 + t) * 25,\r
      sin(p * PI * 2 + PI * 0.5 + t) * 15 - sin(0.02 * PI * 2 + PI * 0.5 + t) * 15,\r
      0\r
    ],\r
    [windX(p, t) - windX(0.0125, t), windY(p, t) - windY(0.0125, t), 0],\r
    [\r
      cos(p * PI * 3 + t) * 30 - cos(0.02 * PI * 3 + t) * 30,\r
      nsin(p * PI * 6 + t) * 30 - nsin(0.02 * PI * 6 + t) * 30,\r
      nsin(p * PI * 10 + t) * 20 - nsin(0.02 * PI * 10 + t) * 20\r
    ],\r
    [\r
      sin(p * PI * 2 + t) * 35 - sin(0.0125 * PI * 2 + t) * 35,\r
      sin(p * PI * 3 + t) * 10 - sin(0.0125 * PI * 3 + t) * 10,\r
      0\r
    ],\r
    [deepX(p, t) - deepX(0.02, t), deepY(p, t) - deepY(0.02, t), 0]\r
  ];\r
};\r
\r
const lookShapes = (t: number, curvature: number): Vec3[] => {\r
  const p = 0.025;\r
  const [gentle, , hills, racing] = curveShapes(p, t);\r
  return [\r
    [gentle[0] * curvature * 2, gentle[1] * curvature * 0.4, -3],\r
    [(windX(p, t) - windX(p + 0.007, t)) * curvature * -2, (windY(p, t) - windY(p + 0.007, t)) * curvature * -5, -10],\r
    [hills[0] * curvature * 2, hills[1] * curvature * 2, hills[2] * curvature * 2 - 5],\r
    [racing[0] * curvature, racing[1] * curvature, -5],\r
    [(deepX(p, t) - deepX(p + 0.01, t)) * curvature * -2, (deepY(p, t) - deepY(p + 0.01, t)) * curvature * -4, -10]\r
  ];\r
};\r
\r
const Hyperspeed = ({\r
  curve = 'winding',\r
  curvature = 1,\r
  speed = 1,\r
  boost = 3,\r
  fov = 90,\r
  boostFov = 130,\r
  lanes = 3,\r
  roadWidth = 10,\r
  medianWidth = 2,\r
  density = 40,\r
  trailLength = 1,\r
  lightSize = 1,\r
  poles = 20,\r
  poleHeight = 1,\r
  dust = 100,\r
  glow = 0.6,\r
  reflections = 0.5,\r
  steer = 0.35,\r
  tailColors,\r
  headColors,\r
  poleColors,\r
  roadColor,\r
  roadOpacity = 0.1,\r
  lineColor,\r
  background,\r
  theme = 'dark',\r
  interactive = true,\r
  boosting = false,\r
  onBoostStart,\r
  onBoostEnd,\r
  className = '',\r
  style\r
}: HyperspeedProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const settings: Settings = {\r
    light: theme === 'light',\r
    curve: CURVES.includes(curve) ? curve : 'winding',\r
    curvature: Math.max(0, curvature),\r
    speed: Math.max(0, speed),\r
    boost: Math.max(1, boost),\r
    fov: Math.min(170, Math.max(20, fov)),\r
    boostFov: Math.min(170, Math.max(20, boostFov)),\r
    lanes: Math.max(1, Math.round(lanes)),\r
    roadWidth: Math.max(1, roadWidth),\r
    medianWidth: Math.max(0, medianWidth),\r
    density: Math.min(MAX_CARS, Math.max(0, Math.round(density))),\r
    trailLength: Math.max(0.05, trailLength),\r
    lightSize: Math.max(0.1, lightSize),\r
    poles: Math.min(MAX_POLES, Math.max(0, Math.round(poles))),\r
    poleHeight: Math.max(0.1, poleHeight),\r
    dust: Math.min(MAX_DUST, Math.max(0, Math.round(dust))),\r
    glow: Math.max(0, glow),\r
    reflections: Math.max(0, reflections),\r
    steer: Math.max(0, steer),\r
    tailColors: tailColors?.length ? tailColors : palette.tail,\r
    headColors: headColors?.length ? headColors : palette.head,\r
    poleColors: poleColors?.length ? poleColors : palette.poles,\r
    roadColor: roadColor ?? palette.road,\r
    roadOpacity: Math.min(1, Math.max(0, roadOpacity)),\r
    lineColor: lineColor ?? palette.lines,\r
    background: background ?? palette.background,\r
    dustColor: palette.dust,\r
    interactive,\r
    boosting\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const callbacksRef = useRef({ onBoostStart, onBoostEnd });\r
  callbacksRef.current = { onBoostStart, onBoostEnd };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });\r
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;\r
    renderer.autoClear = false;\r
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
    container.appendChild(renderer.domElement);\r
\r
    const scene = new THREE.Scene();\r
    const camera = new THREE.PerspectiveCamera(settingsRef.current.fov, 1, 0.1, 10000);\r
    camera.position.set(0, 8, -5);\r
\r
    const shared = {\r
      uTime: { value: 0 },\r
      uCurvature: { value: 1 },\r
      uCurveA: { value: new THREE.Vector4() },\r
      uCurveB: { value: 0 },\r
      uFogNear: { value: TRAVEL * 0.22 },\r
      uFogFar: { value: TRAVEL * 0.95 },\r
      uTravel: { value: TRAVEL },\r
      uStretch: { value: 0 },\r
      uPixel: { value: 0.001 }\r
    };\r
    const disposables: { dispose: () => void }[] = [];\r
    const effectMaterials: THREE.ShaderMaterial[] = [];\r
\r
    const material = (\r
      vertexShader: string,\r
      fragmentShader: string,\r
      uniforms: Record<string, THREE.IUniform>,\r
      options: THREE.ShaderMaterialParameters = {}\r
    ) => {\r
      const created = new THREE.ShaderMaterial({\r
        vertexShader,\r
        fragmentShader,\r
        uniforms: { ...shared, ...uniforms },\r
        transparent: true,\r
        depthWrite: false,\r
        ...options\r
      });\r
      disposables.push(created);\r
      return created;\r
    };\r
\r
    const swatches = (): Swatches => ({\r
      value: Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(1, 1, 1))\r
    });\r
\r
    const roadGeometry = new THREE.PlaneGeometry(1, TRAVEL, 1, 220);\r
    roadGeometry.rotateX(-Math.PI / 2);\r
    roadGeometry.translate(0, 0, -TRAVEL / 2);\r
    disposables.push(roadGeometry);\r
    const roadUniforms = {\r
      uWidth: { value: 1 },\r
      uRoadColor: { value: new THREE.Vector3() },\r
      uLineColor: { value: new THREE.Vector3() },\r
      uBackground: { value: new THREE.Vector3() },\r
      uRoadWidth: { value: 10 },\r
      uMedian: { value: 2 },\r
      uLanes: { value: 3 },\r
      uTransparent: { value: 0 },\r
      uOpacity: { value: 1 }\r
    };\r
    const roadMaterial = material(ROAD_VERTEX, ROAD_FRAGMENT, roadUniforms, { transparent: true, depthWrite: true });\r
    const road = new THREE.Mesh(roadGeometry, roadMaterial);\r
    road.frustumCulled = false;\r
    road.renderOrder = 0;\r
    road.layers.enable(1);\r
    scene.add(road);\r
\r
    const tube = new THREE.TubeGeometry(\r
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)),\r
      24,\r
      1,\r
      7,\r
      false\r
    );\r
    disposables.push(tube);\r
\r
    const streakGroup = (direction: number, fade: [number, number], speedRange: [number, number]) => {\r
      const geometry = instanced(tube);\r
      const seedA = new Float32Array(MAX_CARS * 2 * 4);\r
      const seedB = new Float32Array(MAX_CARS * 2 * 4);\r
      const pair = new Float32Array(MAX_CARS * 2);\r
      const tone = new Float32Array(MAX_CARS * 2);\r
      for (let i = 0; i < MAX_CARS; i++) {\r
        const a = [Math.random(), Math.random(), Math.random(), Math.random()];\r
        const b = [Math.random(), Math.random(), Math.random(), Math.random() * Math.random()];\r
        const shade = Math.random();\r
        for (let side = 0; side < 2; side++) {\r
          const index = i * 2 + side;\r
          seedA.set(a, index * 4);\r
          seedB.set(b, index * 4);\r
          pair[index] = side ? 0.5 : -0.5;\r
          tone[index] = shade;\r
        }\r
      }\r
      geometry.setAttribute('aSeedA', new THREE.InstancedBufferAttribute(seedA, 4));\r
      geometry.setAttribute('aSeedB', new THREE.InstancedBufferAttribute(seedB, 4));\r
      geometry.setAttribute('aPair', new THREE.InstancedBufferAttribute(pair, 1));\r
      geometry.setAttribute('aTone', new THREE.InstancedBufferAttribute(tone, 1));\r
      geometry.instanceCount = 0;\r
      disposables.push(geometry);\r
      const uniforms = {\r
        uRoadX: { value: 0 },\r
        uRoadWidth: { value: 10 },\r
        uLanes: { value: 3 },\r
        uDirection: { value: direction },\r
        uSpeedRange: { value: new THREE.Vector2(...speedRange) },\r
        uTrail: { value: 1 },\r
        uSize: { value: 1 },\r
        uColors: swatches(),\r
        uColorCount: { value: 1 },\r
        uFade: { value: new THREE.Vector2(...fade) }\r
      };\r
      const layer = (radiusScale: number, sharp: number, mirror: number, order: number) => {\r
        const layerMaterial = material(\r
          STREAK_VERTEX,\r
          STREAK_FRAGMENT,\r
          {\r
            ...uniforms,\r
            uRadiusScale: { value: radiusScale },\r
            uSharp: { value: sharp },\r
            uMirror: { value: mirror },\r
            uIntensity: { value: 1 },\r
            uCore: { value: 0 }\r
          },\r
          { depthTest: !mirror }\r
        );\r
        effectMaterials.push(layerMaterial);\r
        const mesh = new THREE.Mesh(geometry, layerMaterial);\r
        mesh.frustumCulled = false;\r
        mesh.renderOrder = order;\r
        if (!mirror) mesh.layers.enable(1);\r
        scene.add(mesh);\r
        return layerMaterial;\r
      };\r
      return {\r
        geometry,\r
        uniforms,\r
        reflection: layer(2.1, 1.2, 1, 1),\r
        core: layer(1, 0.85, 0, 3)\r
      };\r
    };\r
\r
    const tail = streakGroup(1, [0, 0.6], [60, 80]);\r
    const head = streakGroup(-1, [1, 0.4], [120, 160]);\r
\r
    const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);\r
    disposables.push(cylinder);\r
    const poleGeometry = instanced(cylinder);\r
    const poleSeed = new Float32Array(MAX_POLES * 2 * 4);\r
    const poleIndex = new Float32Array(MAX_POLES * 2);\r
    const poleSide = new Float32Array(MAX_POLES * 2);\r
    for (let i = 0; i < MAX_POLES; i++) {\r
      for (let side = 0; side < 2; side++) {\r
        const index = i * 2 + side;\r
        poleSeed.set([Math.random(), Math.random(), Math.random(), Math.random()], index * 4);\r
        poleIndex[index] = i + (side ? 0.5 : 0);\r
        poleSide[index] = side ? 1 : -1;\r
      }\r
    }\r
    poleGeometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(poleSeed, 4));\r
    poleGeometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(poleIndex, 1));\r
    poleGeometry.setAttribute('aSide', new THREE.InstancedBufferAttribute(poleSide, 1));\r
    poleGeometry.instanceCount = 0;\r
    disposables.push(poleGeometry);\r
    const poleUniforms = {\r
      uCount: { value: 20 },\r
      uEdge: { value: 11 },\r
      uHeight: { value: 1 },\r
      uColors: swatches(),\r
      uColorCount: { value: 1 }\r
    };\r
    const poleLayer = (radiusScale: number, sharp: number, mirror: number, order: number) => {\r
      const layerMaterial = material(\r
        POLE_VERTEX,\r
        POLE_FRAGMENT,\r
        {\r
          ...poleUniforms,\r
          uRadiusScale: { value: radiusScale },\r
          uSharp: { value: sharp },\r
          uMirror: { value: mirror },\r
          uIntensity: { value: 1 },\r
          uCore: { value: 0 }\r
        },\r
        { depthTest: !mirror }\r
      );\r
      effectMaterials.push(layerMaterial);\r
      const mesh = new THREE.Mesh(poleGeometry, layerMaterial);\r
      mesh.frustumCulled = false;\r
      mesh.renderOrder = order;\r
      if (!mirror) mesh.layers.enable(1);\r
      scene.add(mesh);\r
      return layerMaterial;\r
    };\r
    const polesLayers = {\r
      reflection: poleLayer(2.4, 1.2, 1, 1),\r
      core: poleLayer(1, 0.8, 0, 3)\r
    };\r
\r
    const dustGeometry = new THREE.BufferGeometry();\r
    const dustSeed = new Float32Array(MAX_DUST * 2 * 4);\r
    const dustEnd = new Float32Array(MAX_DUST * 2);\r
    for (let i = 0; i < MAX_DUST; i++) {\r
      const seed = [Math.random(), Math.random(), Math.random(), Math.random()];\r
      dustSeed.set(seed, i * 8);\r
      dustSeed.set(seed, i * 8 + 4);\r
      dustEnd[i * 2 + 1] = 1;\r
    }\r
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_DUST * 2 * 3), 3));\r
    dustGeometry.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 4));\r
    dustGeometry.setAttribute('aEnd', new THREE.BufferAttribute(dustEnd, 1));\r
    dustGeometry.setDrawRange(0, 0);\r
    disposables.push(dustGeometry);\r
    const dustUniforms = {\r
      uSpread: { value: 140 },\r
      uColor: { value: new THREE.Vector3(1, 1, 1) },\r
      uIntensity: { value: 0.5 }\r
    };\r
    const dustMaterial = material(DUST_VERTEX, DUST_FRAGMENT, dustUniforms);\r
    effectMaterials.push(dustMaterial);\r
    const dustLines = new THREE.LineSegments(dustGeometry, dustMaterial);\r
    dustLines.frustumCulled = false;\r
    dustLines.renderOrder = 4;\r
    scene.add(dustLines);\r
\r
    const floatTargets =\r
      renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');\r
    const levels = Array.from({ length: 5 }, (_, index) => {\r
      const target = new THREE.WebGLRenderTarget(1, 1, {\r
        type: floatTargets ? THREE.HalfFloatType : THREE.UnsignedByteType,\r
        depthBuffer: index === 0\r
      });\r
      disposables.push(target);\r
      return target;\r
    });\r
    const quadScene = new THREE.Scene();\r
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);\r
    const quadGeometry = new THREE.PlaneGeometry(2, 2);\r
    disposables.push(quadGeometry);\r
    const quad = new THREE.Mesh(quadGeometry);\r
    quad.frustumCulled = false;\r
    quadScene.add(quad);\r
    const blur = (fragmentShader: string, options: THREE.ShaderMaterialParameters) => {\r
      const created = new THREE.ShaderMaterial({\r
        vertexShader: QUAD_VERTEX,\r
        fragmentShader,\r
        uniforms: {\r
          uTexture: { value: null },\r
          uTexel: { value: new THREE.Vector2() },\r
          uStrength: { value: 1 },\r
          uCeiling: { value: 1 },\r
          uLight: { value: 0 }\r
        },\r
        depthTest: false,\r
        depthWrite: false,\r
        ...options\r
      });\r
      disposables.push(created);\r
      return created;\r
    };\r
    const downMaterial = blur(DOWN_FRAGMENT, { blending: THREE.NoBlending });\r
    const upMaterial = blur(UP_FRAGMENT, {\r
      blending: THREE.CustomBlending,\r
      blendSrc: THREE.OneFactor,\r
      blendDst: THREE.OneFactor,\r
      blendSrcAlpha: THREE.OneFactor,\r
      blendDstAlpha: THREE.OneFactor\r
    });\r
    const bloomMaterial = blur(BLOOM_FRAGMENT, { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor });\r
    const pass = (\r
      passMaterial: THREE.ShaderMaterial,\r
      source: THREE.WebGLRenderTarget,\r
      target: THREE.WebGLRenderTarget | null\r
    ) => {\r
      quad.material = passMaterial;\r
      passMaterial.uniforms.uTexture.value = source.texture;\r
      passMaterial.uniforms.uTexel.value.set(1 / source.width, 1 / source.height);\r
      renderer.setRenderTarget(target);\r
      renderer.render(quadScene, quadCamera);\r
    };\r
    const clearColor = new THREE.Color();\r
    let clearAlpha = 0;\r
\r
    const state = {\r
      boost: 0,\r
      held: false,\r
      boosted: false,\r
      fov: settingsRef.current.fov,\r
      fovVelocity: 0,\r
      steerX: 0,\r
      steerY: 0,\r
      pointerX: 0,\r
      pointerY: 0,\r
      weights: [0, 0, 0, 0, 0],\r
      visible: true\r
    };\r
    const keys = { tail: '', head: '', poles: '', surface: '', light: null as boolean | null };\r
    const lookTarget = new THREE.Vector3();\r
    let raf = 0;\r
    let last = performance.now();\r
    let alive = true;\r
\r
    const syncColors = (s: Settings) => {\r
      const tailKey = s.tailColors.join();\r
      if (tailKey !== keys.tail) {\r
        keys.tail = tailKey;\r
        fillPalette(tail.uniforms.uColors, tail.uniforms.uColorCount, s.tailColors);\r
      }\r
      const headKey = s.headColors.join();\r
      if (headKey !== keys.head) {\r
        keys.head = headKey;\r
        fillPalette(head.uniforms.uColors, head.uniforms.uColorCount, s.headColors);\r
      }\r
      const poleKey = s.poleColors.join();\r
      if (poleKey !== keys.poles) {\r
        keys.poles = poleKey;\r
        fillPalette(poleUniforms.uColors, poleUniforms.uColorCount, s.poleColors);\r
      }\r
      const surfaceKey = [s.roadColor, s.lineColor, s.background, s.dustColor].join();\r
      if (surfaceKey !== keys.surface) {\r
        keys.surface = surfaceKey;\r
        roadUniforms.uRoadColor.value.fromArray(toRgb(s.roadColor));\r
        roadUniforms.uLineColor.value.fromArray(toRgb(s.lineColor));\r
        dustUniforms.uColor.value.fromArray(toRgb(s.dustColor));\r
        const transparent = s.background === 'transparent';\r
        const backdrop: Vec3 = transparent ? [0, 0, 0] : toRgb(s.background);\r
        roadUniforms.uBackground.value.fromArray(backdrop);\r
        roadUniforms.uTransparent.value = transparent ? 1 : 0;\r
        clearColor.setRGB(...backdrop, THREE.LinearSRGBColorSpace);\r
        clearAlpha = transparent ? 0 : 1;\r
      }\r
      if (keys.light !== s.light) {\r
        keys.light = s.light;\r
        effectMaterials.forEach(item => {\r
          item.blending = s.light ? THREE.NormalBlending : THREE.AdditiveBlending;\r
          item.needsUpdate = true;\r
        });\r
        bloomMaterial.blendDst = s.light ? THREE.OneMinusSrcAlphaFactor : THREE.OneFactor;\r
        bloomMaterial.blendSrcAlpha = s.light ? THREE.OneFactor : THREE.ZeroFactor;\r
        bloomMaterial.blendDstAlpha = s.light ? THREE.OneMinusSrcAlphaFactor : THREE.OneFactor;\r
        bloomMaterial.uniforms.uLight.value = s.light ? 1 : 0;\r
      }\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      renderer.setSize(width, height, false);\r
      levels.forEach((target, index) =>\r
        target.setSize(\r
          Math.max(1, Math.round(width / 2 ** (index + 1))),\r
          Math.max(1, Math.round(height / 2 ** (index + 1)))\r
        )\r
      );\r
      camera.aspect = width / height;\r
      camera.updateProjectionMatrix();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      syncColors(s);\r
\r
      const wanted = (state.held && s.interactive) || s.boosting ? 1 : 0;\r
      state.boost += (wanted - state.boost) * (1 - Math.exp(-dt / (wanted > state.boost ? 0.28 : 0.85)));\r
      const pace = s.speed * (reduce ? 0.3 : 1) * (1 + (s.boost - 1) * state.boost);\r
      shared.uTime.value += dt * pace;\r
      shared.uStretch.value = state.boost * 1.1;\r
      shared.uCurvature.value = s.curvature;\r
\r
      const target = CURVES.indexOf(s.curve) - 1;\r
      const blend = 1 - Math.exp(-dt / 0.6);\r
      state.weights = state.weights.map((weight, index) => weight + ((index === target ? 1 : 0) - weight) * blend);\r
      shared.uCurveA.value.set(state.weights[0], state.weights[1], state.weights[2], state.weights[3]);\r
      shared.uCurveB.value = state.weights[4];\r
\r
      const halfRoad = s.roadWidth / 2 + s.medianWidth / 2;\r
      const surface = 0.45 + 0.55 * s.roadOpacity;\r
      [tail, head].forEach((group, index) => {\r
        group.geometry.instanceCount = s.density * 2;\r
        group.uniforms.uRoadX.value = index ? halfRoad : -halfRoad;\r
        group.uniforms.uRoadWidth.value = s.roadWidth;\r
        group.uniforms.uLanes.value = s.lanes;\r
        group.uniforms.uTrail.value = s.trailLength;\r
        group.uniforms.uSize.value = s.lightSize;\r
        group.core.uniforms.uIntensity.value = s.light ? 0.95 : 1 + 0.35 * state.boost;\r
        group.core.uniforms.uCore.value = s.light ? 0 : 0.75;\r
        group.reflection.uniforms.uIntensity.value = s.reflections * (s.light ? 0.22 : 0.42) * surface;\r
      });\r
\r
      poleGeometry.instanceCount = s.poles * 2;\r
      poleUniforms.uCount.value = Math.max(1, s.poles);\r
      poleUniforms.uEdge.value = s.roadWidth + s.medianWidth / 2 + 0.8;\r
      poleUniforms.uHeight.value = s.poleHeight;\r
      polesLayers.core.uniforms.uIntensity.value = s.light ? 0.9 : 1;\r
      polesLayers.core.uniforms.uCore.value = s.light ? 0 : 0.6;\r
      polesLayers.reflection.uniforms.uIntensity.value = s.reflections * (s.light ? 0.2 : 0.38) * surface;\r
\r
      dustGeometry.setDrawRange(0, s.dust * 2);\r
      dustUniforms.uIntensity.value = (s.light ? 0.35 : 0.45) * (1 + state.boost);\r
      dustUniforms.uSpread.value = (s.roadWidth * 2 + s.medianWidth) * 5;\r
\r
      roadUniforms.uWidth.value = s.roadWidth * 2 + s.medianWidth + 3;\r
      roadUniforms.uRoadWidth.value = s.roadWidth;\r
      roadUniforms.uMedian.value = s.medianWidth;\r
      roadUniforms.uLanes.value = s.lanes;\r
      roadUniforms.uOpacity.value = s.roadOpacity;\r
      roadMaterial.depthWrite = s.roadOpacity > 0.5;\r
\r
      const fovTarget = reduce ? s.fov : s.fov + (s.boostFov - s.fov) * state.boost;\r
      state.fovVelocity += ((fovTarget - state.fov) * 90 - state.fovVelocity * 13) * dt;\r
      state.fov += state.fovVelocity * dt;\r
      camera.fov = state.fov;\r
      shared.uPixel.value = (2 * Math.tan((state.fov * Math.PI) / 360)) / Math.max(1, renderer.domElement.height);\r
\r
      const steerBlend = 1 - Math.exp(-dt / 0.35);\r
      const follow = s.interactive ? s.steer : 0;\r
      state.steerX += (state.pointerX * follow - state.steerX) * steerBlend;\r
      state.steerY += (state.pointerY * follow - state.steerY) * steerBlend;\r
      camera.position.set(state.steerX * s.roadWidth * 0.45, 8 - state.steerY * 2.5, -5);\r
\r
      const looks = lookShapes(shared.uTime.value, s.curvature);\r
      const straight = 1 - state.weights.reduce((sum, weight) => sum + weight, 0);\r
      lookTarget.set(0, 0, -10 * straight);\r
      looks.forEach((look, index) => {\r
        lookTarget.x += look[0] * state.weights[index];\r
        lookTarget.y += look[1] * state.weights[index];\r
        lookTarget.z += look[2] * state.weights[index];\r
      });\r
      lookTarget.x += state.steerX * 2.5;\r
      lookTarget.add(camera.position);\r
      camera.lookAt(lookTarget);\r
      camera.updateProjectionMatrix();\r
\r
      renderer.setRenderTarget(null);\r
      renderer.setClearColor(clearColor, clearAlpha);\r
      renderer.clear();\r
      renderer.render(scene, camera);\r
\r
      if (s.glow > 0) {\r
        const pixel = shared.uPixel.value;\r
        shared.uPixel.value = pixel * (renderer.domElement.height / levels[0].height);\r
        camera.layers.set(1);\r
        roadMaterial.colorWrite = false;\r
        renderer.setRenderTarget(levels[0]);\r
        renderer.setClearColor(0x000000, 0);\r
        renderer.clear();\r
        renderer.render(scene, camera);\r
        roadMaterial.colorWrite = true;\r
        camera.layers.set(0);\r
        shared.uPixel.value = pixel;\r
        for (let i = 1; i < levels.length; i++) pass(downMaterial, levels[i - 1], levels[i]);\r
        for (let i = levels.length - 1; i > 1; i--) pass(upMaterial, levels[i], levels[i - 1]);\r
        bloomMaterial.uniforms.uStrength.value = s.glow * (s.light ? 0.5 : 1.4);\r
        bloomMaterial.uniforms.uCeiling.value = s.glow * (s.light ? 0.3 : 0.5);\r
        pass(bloomMaterial, levels[1], null);\r
      }\r
\r
      if (state.visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !state.visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const setHeld = (held: boolean) => {\r
      if (state.held === held) return;\r
      state.held = held;\r
      if (!settingsRef.current.interactive) return;\r
      if (held) callbacksRef.current.onBoostStart?.();\r
      else callbacksRef.current.onBoostEnd?.();\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      if (event.button !== 0 && event.pointerType === 'mouse') return;\r
      setHeld(true);\r
    };\r
    const onUp = () => setHeld(false);\r
    const onMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      state.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;\r
      state.pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;\r
    };\r
    const onLeave = () => {\r
      state.pointerX = 0;\r
      state.pointerY = 0;\r
    };\r
    const onMenu = (event: MouseEvent) => {\r
      if (settingsRef.current.interactive) event.preventDefault();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
    container.addEventListener('pointerdown', onDown);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('contextmenu', onMenu);\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('pointercancel', onUp);\r
    window.addEventListener('blur', onUp);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('contextmenu', onMenu);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      window.removeEventListener('blur', onUp);\r
      disposables.forEach(item => item.dispose());\r
      renderer.dispose();\r
      renderer.domElement.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`hyperspeed\${className ? \` \${className}\` : ''}\`} style={style} />;\r
};\r
\r
export default Hyperspeed;\r
`,o=`'use client';\r
\r
import React, { useEffect, useRef } from 'react';\r
import * as THREE from 'three';\r
\r
export type HyperspeedCurve = 'straight' | 'gentle' | 'winding' | 'hills' | 'racing' | 'deep';\r
\r
export type HyperspeedProps = {\r
  curve?: HyperspeedCurve;\r
  curvature?: number;\r
  speed?: number;\r
  boost?: number;\r
  fov?: number;\r
  boostFov?: number;\r
  lanes?: number;\r
  roadWidth?: number;\r
  medianWidth?: number;\r
  density?: number;\r
  trailLength?: number;\r
  lightSize?: number;\r
  poles?: number;\r
  poleHeight?: number;\r
  dust?: number;\r
  glow?: number;\r
  reflections?: number;\r
  steer?: number;\r
  tailColors?: string[];\r
  headColors?: string[];\r
  poleColors?: string[];\r
  roadColor?: string;\r
  roadOpacity?: number;\r
  lineColor?: string;\r
  background?: string;\r
  theme?: 'dark' | 'light';\r
  interactive?: boolean;\r
  boosting?: boolean;\r
  onBoostStart?: () => void;\r
  onBoostEnd?: () => void;\r
  className?: string;\r
  style?: React.CSSProperties;\r
};\r
\r
type Vec3 = [number, number, number];\r
\r
type Swatches = { value: THREE.Vector3[] };\r
\r
type Palette = {\r
  background: string;\r
  road: string;\r
  lines: string;\r
  tail: string[];\r
  head: string[];\r
  poles: string[];\r
  dust: string;\r
};\r
\r
type Settings = {\r
  light: boolean;\r
  curve: HyperspeedCurve;\r
  curvature: number;\r
  speed: number;\r
  boost: number;\r
  fov: number;\r
  boostFov: number;\r
  lanes: number;\r
  roadWidth: number;\r
  medianWidth: number;\r
  density: number;\r
  trailLength: number;\r
  lightSize: number;\r
  poles: number;\r
  poleHeight: number;\r
  dust: number;\r
  glow: number;\r
  reflections: number;\r
  steer: number;\r
  tailColors: string[];\r
  headColors: string[];\r
  poleColors: string[];\r
  roadColor: string;\r
  roadOpacity: number;\r
  lineColor: string;\r
  background: string;\r
  dustColor: string;\r
  interactive: boolean;\r
  boosting: boolean;\r
};\r
\r
const TRAVEL = 400;\r
const MAX_CARS = 160;\r
const MAX_POLES = 80;\r
const MAX_DUST = 1500;\r
const MAX_COLORS = 8;\r
const CURVES: HyperspeedCurve[] = ['straight', 'gentle', 'winding', 'hills', 'racing', 'deep'];\r
\r
const THEMES: Record<'dark' | 'light', Palette> = {\r
  dark: {\r
    background: 'transparent',\r
    road: '#08080a',\r
    lines: '#25252d',\r
    tail: ['#d856bf', '#6750a2', '#c247ac'],\r
    head: ['#03b3c3', '#0e5ea5', '#324555'],\r
    poles: ['#03b3c3'],\r
    dust: '#ffffff'\r
  },\r
  light: {\r
    background: 'transparent',\r
    road: '#efeff2',\r
    lines: '#d0d0d7',\r
    tail: ['#d856bf', '#6750a2', '#c247ac'],\r
    head: ['#03b3c3', '#0e5ea5', '#324555'],\r
    poles: ['#03b3c3'],\r
    dust: '#18181b'\r
  }\r
};\r
\r
const BEND = /* glsl */ \`\r
  uniform float uTime;\r
  uniform float uCurvature;\r
  uniform vec4 uCurveA;\r
  uniform float uCurveB;\r
  uniform float uFogNear;\r
  uniform float uFogFar;\r
  uniform float uPixel;\r
  #define PI 3.14159265358979\r
  float nsin(float v) { return sin(v) * 0.5 + 0.5; }\r
  vec3 gentle(float p) {\r
    return vec3(\r
      cos(p * PI * 5.0 + uTime) * 25.0 - cos(0.02 * PI * 5.0 + uTime) * 25.0,\r
      sin(p * PI * 2.0 + PI * 0.5 + uTime) * 15.0 - sin(0.02 * PI * 2.0 + PI * 0.5 + uTime) * 15.0,\r
      0.0\r
    );\r
  }\r
  float windX(float p) { return cos(PI * p * 4.0 + uTime) * 25.0 + pow(cos(PI * p * 8.0 + uTime * 2.0), 2.0) * 5.0; }\r
  float windY(float p) { return -nsin(PI * p * 8.0 + uTime) * 10.0 - pow(nsin(PI * p + uTime / 8.0), 5.0) * 10.0; }\r
  vec3 winding(float p) { return vec3(windX(p) - windX(0.0125), windY(p) - windY(0.0125), 0.0); }\r
  vec3 hills(float p) {\r
    return vec3(\r
      cos(p * PI * 3.0 + uTime) * 30.0 - cos(0.02 * PI * 3.0 + uTime) * 30.0,\r
      nsin(p * PI * 6.0 + uTime) * 30.0 - nsin(0.02 * PI * 6.0 + uTime) * 30.0,\r
      nsin(p * PI * 10.0 + uTime) * 20.0 - nsin(0.02 * PI * 10.0 + uTime) * 20.0\r
    );\r
  }\r
  vec3 racing(float p) {\r
    return vec3(\r
      sin(p * PI * 2.0 + uTime) * 35.0 - sin(0.0125 * PI * 2.0 + uTime) * 35.0,\r
      sin(p * PI * 3.0 + uTime) * 10.0 - sin(0.0125 * PI * 3.0 + uTime) * 10.0,\r
      0.0\r
    );\r
  }\r
  float deepX(float p) { return sin(p * PI * 4.0 + uTime) * 10.0; }\r
  float deepY(float p) { return pow(abs(p * 10.0), 2.0) + sin(p * PI * 8.0 + uTime) * 20.0; }\r
  vec3 deep(float p) { return vec3(deepX(p) - deepX(0.02), deepY(p) - deepY(0.02), 0.0); }\r
  vec3 bend(float p) {\r
    vec3 d = gentle(p) * uCurveA.x + winding(p) * uCurveA.y + hills(p) * uCurveA.z + racing(p) * uCurveA.w + deep(p) * uCurveB;\r
    return d * uCurvature;\r
  }\r
\`;\r
\r
const STREAK_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeedA;\r
  attribute vec4 aSeedB;\r
  attribute float aPair;\r
  attribute float aTone;\r
  uniform float uTravel;\r
  uniform float uRoadX;\r
  uniform float uRoadWidth;\r
  uniform float uLanes;\r
  uniform float uDirection;\r
  uniform vec2 uSpeedRange;\r
  uniform float uTrail;\r
  uniform float uStretch;\r
  uniform float uSize;\r
  uniform float uRadiusScale;\r
  uniform float uMirror;\r
  uniform vec3 uColors[\${MAX_COLORS}];\r
  uniform float uColorCount;\r
  varying vec2 vUv;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vThin;\r
  void main() {\r
    float laneWidth = uRoadWidth / uLanes;\r
    float lane = min(floor(aSeedA.x * uLanes), uLanes - 1.0);\r
    float laneX = (lane + 0.5) * laneWidth - uRoadWidth * 0.5 + (aSeedA.y - 0.5) * 0.5 * laneWidth;\r
    float carWidth = mix(0.3, 0.5, aSeedA.z) * laneWidth;\r
    float radius = mix(0.05, 0.14, aSeedA.w) * uSize;\r
    float len = mix(0.03, 0.2, aSeedB.x) * uTravel * uTrail * (1.0 + uStretch);\r
    float speed = mix(uSpeedRange.x, uSpeedRange.y, aSeedB.y) * uDirection;\r
    vec3 center = vec3(\r
      uRoadX + laneX + aPair * carWidth,\r
      aSeedB.w * 0.8 + radius * 1.3,\r
      position.z * len + len - mod(uTime * speed + aSeedB.z * uTravel, uTravel)\r
    );\r
    vAbove = center.y;\r
    center.y = mix(center.y, -center.y * 1.8, uMirror);\r
    center += bend(abs(center.z / uTravel));\r
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);\r
    float wanted = radius * uRadiusScale;\r
    float shown = max(wanted, depth * uPixel * 0.75);\r
    vThin = wanted / shown;\r
    vec3 p = center + vec3(position.x * shown, position.y * shown * mix(1.0, 2.2, uMirror), 0.0);\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vec3 n = normal;\r
    n.y *= 1.0 - 2.0 * uMirror;\r
    vNormal = normalize(normalMatrix * n);\r
    vView = -mv.xyz;\r
    vUv = uv;\r
    vColor = uColors[int(min(floor(aTone * uColorCount), uColorCount - 1.0))];\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const STREAK_FRAGMENT = /* glsl */ \`\r
  uniform vec2 uFade;\r
  uniform float uIntensity;\r
  uniform float uSharp;\r
  uniform float uCore;\r
  uniform float uMirror;\r
  varying vec2 vUv;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vThin;\r
  void main() {\r
    float facing = abs(dot(normalize(vNormal), normalize(vView)));\r
    float alpha = pow(facing, uSharp) * smoothstep(uFade.x, uFade.y, vUv.x) * uIntensity * vThin * (1.0 - vFog);\r
    alpha *= mix(1.0, exp(-vAbove * 0.9), uMirror);\r
    if (alpha < 0.003) discard;\r
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));\r
  }\r
\`;\r
\r
const POLE_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeed;\r
  attribute float aIndex;\r
  attribute float aSide;\r
  uniform float uTravel;\r
  uniform float uCount;\r
  uniform float uEdge;\r
  uniform float uHeight;\r
  uniform float uRadiusScale;\r
  uniform float uMirror;\r
  uniform vec3 uColors[\${MAX_COLORS}];\r
  uniform float uColorCount;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vHeight;\r
  varying float vThin;\r
  void main() {\r
    vHeight = position.y + 0.5;\r
    float width = mix(0.08, 0.22, aSeed.y);\r
    float height = mix(1.3, 1.9, aSeed.z) * uHeight;\r
    float spacing = uTravel / max(uCount, 1.0);\r
    vec3 center = vec3(\r
      aSide * uEdge,\r
      vHeight * height,\r
      -uTravel + mod(uTime * 120.0 + (aIndex + aSeed.x * 0.6) * spacing, uTravel)\r
    );\r
    vAbove = center.y;\r
    center.y = mix(center.y, -center.y * 1.6, uMirror);\r
    center += bend(abs(center.z / uTravel));\r
    float depth = max(0.1, -(modelViewMatrix * vec4(center, 1.0)).z);\r
    float wanted = width * uRadiusScale;\r
    float shown = max(wanted, depth * uPixel * 0.75);\r
    vThin = wanted / shown;\r
    vec3 p = center + vec3(position.x * shown, 0.0, position.z * shown);\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vNormal = normalize(normalMatrix * normal);\r
    vView = -mv.xyz;\r
    vColor = uColors[int(min(floor(aSeed.w * uColorCount), uColorCount - 1.0))];\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const POLE_FRAGMENT = /* glsl */ \`\r
  uniform float uIntensity;\r
  uniform float uSharp;\r
  uniform float uCore;\r
  uniform float uMirror;\r
  varying vec3 vNormal;\r
  varying vec3 vView;\r
  varying vec3 vColor;\r
  varying float vFog;\r
  varying float vAbove;\r
  varying float vHeight;\r
  varying float vThin;\r
  void main() {\r
    float facing = abs(dot(normalize(vNormal), normalize(vView)));\r
    float ends = smoothstep(0.0, 0.08, vHeight) * smoothstep(1.0, 0.9, vHeight);\r
    float alpha = pow(facing, uSharp) * ends * uIntensity * vThin * (1.0 - vFog);\r
    alpha *= mix(1.0, exp(-vAbove * 0.6), uMirror);\r
    if (alpha < 0.003) discard;\r
    gl_FragColor = vec4(mix(vColor, vec3(1.0), pow(facing, 12.0) * uCore), min(alpha, 1.0));\r
  }\r
\`;\r
\r
const DUST_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  attribute vec4 aSeed;\r
  attribute float aEnd;\r
  uniform float uTravel;\r
  uniform float uStretch;\r
  uniform float uSpread;\r
  varying float vAlpha;\r
  void main() {\r
    float x = (aSeed.x - 0.5) * uSpread;\r
    float y = mix(1.0, 42.0, aSeed.y * aSeed.y);\r
    float speed = mix(140.0, 260.0, aSeed.w);\r
    float z = -uTravel + mod(uTime * speed + aSeed.z * uTravel, uTravel);\r
    float len = (0.6 + uStretch * 7.0) * mix(0.6, 1.4, aSeed.w);\r
    vec3 p = vec3(x, y, z + aEnd * len);\r
    p += bend(abs(p.z / uTravel));\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vAlpha = aEnd * (1.0 - smoothstep(uFogNear, uFogFar, -mv.z));\r
  }\r
\`;\r
\r
const DUST_FRAGMENT = /* glsl */ \`\r
  uniform vec3 uColor;\r
  uniform float uIntensity;\r
  varying float vAlpha;\r
  void main() {\r
    gl_FragColor = vec4(uColor, vAlpha * uIntensity);\r
  }\r
\`;\r
\r
const ROAD_VERTEX = /* glsl */ \`\r
  \${BEND}\r
  uniform float uTravel;\r
  uniform float uWidth;\r
  varying vec2 vRoad;\r
  varying float vFog;\r
  void main() {\r
    vec3 p = position;\r
    p.x *= uWidth;\r
    vRoad = vec2(p.x, p.z);\r
    p += bend(abs(p.z / uTravel));\r
    vec4 mv = modelViewMatrix * vec4(p, 1.0);\r
    gl_Position = projectionMatrix * mv;\r
    vFog = smoothstep(uFogNear, uFogFar, -mv.z);\r
  }\r
\`;\r
\r
const ROAD_FRAGMENT = /* glsl */ \`\r
  uniform float uTime;\r
  uniform vec3 uRoadColor;\r
  uniform vec3 uLineColor;\r
  uniform vec3 uBackground;\r
  uniform float uRoadWidth;\r
  uniform float uMedian;\r
  uniform float uLanes;\r
  uniform float uTransparent;\r
  uniform float uOpacity;\r
  varying vec2 vRoad;\r
  varying float vFog;\r
  float stripe(float d, float w) {\r
    float aa = fwidth(d) * 1.2;\r
    return 1.0 - smoothstep(w - aa, w + aa, d);\r
  }\r
  void main() {\r
    float rx = abs(vRoad.x) - uMedian * 0.5;\r
    vec3 color = rx < 0.0 ? mix(uRoadColor, uLineColor, 0.12) : uRoadColor;\r
    if (rx >= 0.0) {\r
      float laneWidth = uRoadWidth / uLanes;\r
      float shoulder = max(stripe(abs(rx - 0.3), 0.07), stripe(abs(rx - (uRoadWidth - 0.3)), 0.07));\r
      float nearest = floor(rx / laneWidth + 0.5);\r
      float inner = step(0.5, nearest) * step(nearest, uLanes - 0.5);\r
      float dash = step(0.5, fract((vRoad.y - uTime * 120.0) / 14.0));\r
      float marks = max(shoulder, stripe(abs(rx - nearest * laneWidth), 0.06) * inner * dash);\r
      color = mix(color, uLineColor, marks);\r
    }\r
    float alpha = mix(1.0, 1.0 - vFog, uTransparent) * uOpacity;\r
    gl_FragColor = vec4(mix(color, uBackground, vFog * (1.0 - uTransparent)), alpha);\r
  }\r
\`;\r
\r
const QUAD_VERTEX = /* glsl */ \`\r
  varying vec2 vUv;\r
  void main() {\r
    vUv = uv;\r
    gl_Position = vec4(position.xy, 0.0, 1.0);\r
  }\r
\`;\r
\r
const DOWN_FRAGMENT = /* glsl */ \`\r
  uniform sampler2D uTexture;\r
  uniform vec2 uTexel;\r
  varying vec2 vUv;\r
  vec4 tap(vec2 offset) {\r
    return min(texture2D(uTexture, vUv + uTexel * offset), vec4(1.0));\r
  }\r
  void main() {\r
    vec4 sum = tap(vec2(0.0)) * 4.0 + tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));\r
    gl_FragColor = sum * 0.125;\r
  }\r
\`;\r
\r
const TENT = /* glsl */ \`\r
  uniform sampler2D uTexture;\r
  uniform vec2 uTexel;\r
  varying vec2 vUv;\r
  vec4 tent() {\r
    vec4 sum = texture2D(uTexture, vUv + uTexel * vec2(-1.0, 0.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(1.0, 0.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, -1.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.0, 1.0));\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, -0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, -0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(-0.5, 0.5)) * 2.0;\r
    sum += texture2D(uTexture, vUv + uTexel * vec2(0.5, 0.5)) * 2.0;\r
    return sum / 12.0;\r
  }\r
\`;\r
\r
const UP_FRAGMENT = /* glsl */ \`\r
  \${TENT}\r
  void main() {\r
    gl_FragColor = tent();\r
  }\r
\`;\r
\r
const BLOOM_FRAGMENT = /* glsl */ \`\r
  \${TENT}\r
  uniform float uStrength;\r
  uniform float uCeiling;\r
  uniform float uLight;\r
  void main() {\r
    vec4 color = tent() * uStrength;\r
    float peak = max(uLight > 0.5 ? color.a : max(color.r, max(color.g, color.b)), 0.0001);\r
    color *= uCeiling * (1.0 - exp(-peak / uCeiling)) / peak;\r
    gl_FragColor = uLight > 0.5 ? color : vec4(color.rgb, 0.0);\r
  }\r
\`;\r
\r
let colorContext: CanvasRenderingContext2D | null = null;\r
\r
const toRgb = (color: string): Vec3 => {\r
  colorContext = colorContext ?? document.createElement('canvas').getContext('2d');\r
  if (!colorContext) return [1, 1, 1];\r
  colorContext.fillStyle = '#000000';\r
  colorContext.fillStyle = color;\r
  const value = String(colorContext.fillStyle);\r
  if (value.startsWith('#')) {\r
    const hex = parseInt(value.slice(1, 7), 16);\r
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];\r
  }\r
  const parts = value.match(/[\\d.]+/g)?.map(Number) ?? [0, 0, 0];\r
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];\r
};\r
\r
const fillPalette = (uniform: Swatches, count: { value: number }, colors: string[]) => {\r
  const list = colors.length ? colors : ['#ffffff'];\r
  for (let i = 0; i < MAX_COLORS; i++) uniform.value[i].fromArray(toRgb(list[i % list.length]));\r
  count.value = Math.min(list.length, MAX_COLORS);\r
};\r
\r
const instanced = (source: THREE.BufferGeometry) => {\r
  const geometry = new THREE.InstancedBufferGeometry();\r
  geometry.setIndex(source.index);\r
  Object.entries(source.attributes).forEach(([name, attribute]) => geometry.setAttribute(name, attribute));\r
  return geometry;\r
};\r
\r
const nsin = (value: number) => Math.sin(value) * 0.5 + 0.5;\r
const windX = (q: number, t: number) => Math.cos(Math.PI * q * 4 + t) * 25 + Math.cos(Math.PI * q * 8 + t * 2) ** 2 * 5;\r
const windY = (q: number, t: number) => -nsin(Math.PI * q * 8 + t) * 10 - nsin(Math.PI * q + t / 8) ** 5 * 10;\r
const deepX = (q: number, t: number) => Math.sin(q * Math.PI * 4 + t) * 10;\r
const deepY = (q: number, t: number) => Math.abs(q * 10) ** 2 + Math.sin(q * Math.PI * 8 + t) * 20;\r
\r
const curveShapes = (p: number, t: number): Vec3[] => {\r
  const { PI, cos, sin } = Math;\r
  return [\r
    [\r
      cos(p * PI * 5 + t) * 25 - cos(0.02 * PI * 5 + t) * 25,\r
      sin(p * PI * 2 + PI * 0.5 + t) * 15 - sin(0.02 * PI * 2 + PI * 0.5 + t) * 15,\r
      0\r
    ],\r
    [windX(p, t) - windX(0.0125, t), windY(p, t) - windY(0.0125, t), 0],\r
    [\r
      cos(p * PI * 3 + t) * 30 - cos(0.02 * PI * 3 + t) * 30,\r
      nsin(p * PI * 6 + t) * 30 - nsin(0.02 * PI * 6 + t) * 30,\r
      nsin(p * PI * 10 + t) * 20 - nsin(0.02 * PI * 10 + t) * 20\r
    ],\r
    [\r
      sin(p * PI * 2 + t) * 35 - sin(0.0125 * PI * 2 + t) * 35,\r
      sin(p * PI * 3 + t) * 10 - sin(0.0125 * PI * 3 + t) * 10,\r
      0\r
    ],\r
    [deepX(p, t) - deepX(0.02, t), deepY(p, t) - deepY(0.02, t), 0]\r
  ];\r
};\r
\r
const lookShapes = (t: number, curvature: number): Vec3[] => {\r
  const p = 0.025;\r
  const [gentle, , hills, racing] = curveShapes(p, t);\r
  return [\r
    [gentle[0] * curvature * 2, gentle[1] * curvature * 0.4, -3],\r
    [(windX(p, t) - windX(p + 0.007, t)) * curvature * -2, (windY(p, t) - windY(p + 0.007, t)) * curvature * -5, -10],\r
    [hills[0] * curvature * 2, hills[1] * curvature * 2, hills[2] * curvature * 2 - 5],\r
    [racing[0] * curvature, racing[1] * curvature, -5],\r
    [(deepX(p, t) - deepX(p + 0.01, t)) * curvature * -2, (deepY(p, t) - deepY(p + 0.01, t)) * curvature * -4, -10]\r
  ];\r
};\r
\r
const ROOT =\r
  'absolute inset-0 overflow-hidden touch-pan-y select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full';\r
\r
const Hyperspeed = ({\r
  curve = 'winding',\r
  curvature = 1,\r
  speed = 1,\r
  boost = 3,\r
  fov = 90,\r
  boostFov = 130,\r
  lanes = 3,\r
  roadWidth = 10,\r
  medianWidth = 2,\r
  density = 40,\r
  trailLength = 1,\r
  lightSize = 1,\r
  poles = 20,\r
  poleHeight = 1,\r
  dust = 100,\r
  glow = 0.6,\r
  reflections = 0.5,\r
  steer = 0.35,\r
  tailColors,\r
  headColors,\r
  poleColors,\r
  roadColor,\r
  roadOpacity = 0.1,\r
  lineColor,\r
  background,\r
  theme = 'dark',\r
  interactive = true,\r
  boosting = false,\r
  onBoostStart,\r
  onBoostEnd,\r
  className = '',\r
  style\r
}: HyperspeedProps) => {\r
  const containerRef = useRef<HTMLDivElement>(null);\r
  const palette = THEMES[theme] ?? THEMES.dark;\r
  const settings: Settings = {\r
    light: theme === 'light',\r
    curve: CURVES.includes(curve) ? curve : 'winding',\r
    curvature: Math.max(0, curvature),\r
    speed: Math.max(0, speed),\r
    boost: Math.max(1, boost),\r
    fov: Math.min(170, Math.max(20, fov)),\r
    boostFov: Math.min(170, Math.max(20, boostFov)),\r
    lanes: Math.max(1, Math.round(lanes)),\r
    roadWidth: Math.max(1, roadWidth),\r
    medianWidth: Math.max(0, medianWidth),\r
    density: Math.min(MAX_CARS, Math.max(0, Math.round(density))),\r
    trailLength: Math.max(0.05, trailLength),\r
    lightSize: Math.max(0.1, lightSize),\r
    poles: Math.min(MAX_POLES, Math.max(0, Math.round(poles))),\r
    poleHeight: Math.max(0.1, poleHeight),\r
    dust: Math.min(MAX_DUST, Math.max(0, Math.round(dust))),\r
    glow: Math.max(0, glow),\r
    reflections: Math.max(0, reflections),\r
    steer: Math.max(0, steer),\r
    tailColors: tailColors?.length ? tailColors : palette.tail,\r
    headColors: headColors?.length ? headColors : palette.head,\r
    poleColors: poleColors?.length ? poleColors : palette.poles,\r
    roadColor: roadColor ?? palette.road,\r
    roadOpacity: Math.min(1, Math.max(0, roadOpacity)),\r
    lineColor: lineColor ?? palette.lines,\r
    background: background ?? palette.background,\r
    dustColor: palette.dust,\r
    interactive,\r
    boosting\r
  };\r
  const settingsRef = useRef(settings);\r
  settingsRef.current = settings;\r
  const callbacksRef = useRef({ onBoostStart, onBoostEnd });\r
  callbacksRef.current = { onBoostStart, onBoostEnd };\r
\r
  useEffect(() => {\r
    const container = containerRef.current;\r
    if (!container) return undefined;\r
\r
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;\r
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });\r
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;\r
    renderer.autoClear = false;\r
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));\r
    container.appendChild(renderer.domElement);\r
\r
    const scene = new THREE.Scene();\r
    const camera = new THREE.PerspectiveCamera(settingsRef.current.fov, 1, 0.1, 10000);\r
    camera.position.set(0, 8, -5);\r
\r
    const shared = {\r
      uTime: { value: 0 },\r
      uCurvature: { value: 1 },\r
      uCurveA: { value: new THREE.Vector4() },\r
      uCurveB: { value: 0 },\r
      uFogNear: { value: TRAVEL * 0.22 },\r
      uFogFar: { value: TRAVEL * 0.95 },\r
      uTravel: { value: TRAVEL },\r
      uStretch: { value: 0 },\r
      uPixel: { value: 0.001 }\r
    };\r
    const disposables: { dispose: () => void }[] = [];\r
    const effectMaterials: THREE.ShaderMaterial[] = [];\r
\r
    const material = (\r
      vertexShader: string,\r
      fragmentShader: string,\r
      uniforms: Record<string, THREE.IUniform>,\r
      options: THREE.ShaderMaterialParameters = {}\r
    ) => {\r
      const created = new THREE.ShaderMaterial({\r
        vertexShader,\r
        fragmentShader,\r
        uniforms: { ...shared, ...uniforms },\r
        transparent: true,\r
        depthWrite: false,\r
        ...options\r
      });\r
      disposables.push(created);\r
      return created;\r
    };\r
\r
    const swatches = (): Swatches => ({\r
      value: Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(1, 1, 1))\r
    });\r
\r
    const roadGeometry = new THREE.PlaneGeometry(1, TRAVEL, 1, 220);\r
    roadGeometry.rotateX(-Math.PI / 2);\r
    roadGeometry.translate(0, 0, -TRAVEL / 2);\r
    disposables.push(roadGeometry);\r
    const roadUniforms = {\r
      uWidth: { value: 1 },\r
      uRoadColor: { value: new THREE.Vector3() },\r
      uLineColor: { value: new THREE.Vector3() },\r
      uBackground: { value: new THREE.Vector3() },\r
      uRoadWidth: { value: 10 },\r
      uMedian: { value: 2 },\r
      uLanes: { value: 3 },\r
      uTransparent: { value: 0 },\r
      uOpacity: { value: 1 }\r
    };\r
    const roadMaterial = material(ROAD_VERTEX, ROAD_FRAGMENT, roadUniforms, { transparent: true, depthWrite: true });\r
    const road = new THREE.Mesh(roadGeometry, roadMaterial);\r
    road.frustumCulled = false;\r
    road.renderOrder = 0;\r
    road.layers.enable(1);\r
    scene.add(road);\r
\r
    const tube = new THREE.TubeGeometry(\r
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)),\r
      24,\r
      1,\r
      7,\r
      false\r
    );\r
    disposables.push(tube);\r
\r
    const streakGroup = (direction: number, fade: [number, number], speedRange: [number, number]) => {\r
      const geometry = instanced(tube);\r
      const seedA = new Float32Array(MAX_CARS * 2 * 4);\r
      const seedB = new Float32Array(MAX_CARS * 2 * 4);\r
      const pair = new Float32Array(MAX_CARS * 2);\r
      const tone = new Float32Array(MAX_CARS * 2);\r
      for (let i = 0; i < MAX_CARS; i++) {\r
        const a = [Math.random(), Math.random(), Math.random(), Math.random()];\r
        const b = [Math.random(), Math.random(), Math.random(), Math.random() * Math.random()];\r
        const shade = Math.random();\r
        for (let side = 0; side < 2; side++) {\r
          const index = i * 2 + side;\r
          seedA.set(a, index * 4);\r
          seedB.set(b, index * 4);\r
          pair[index] = side ? 0.5 : -0.5;\r
          tone[index] = shade;\r
        }\r
      }\r
      geometry.setAttribute('aSeedA', new THREE.InstancedBufferAttribute(seedA, 4));\r
      geometry.setAttribute('aSeedB', new THREE.InstancedBufferAttribute(seedB, 4));\r
      geometry.setAttribute('aPair', new THREE.InstancedBufferAttribute(pair, 1));\r
      geometry.setAttribute('aTone', new THREE.InstancedBufferAttribute(tone, 1));\r
      geometry.instanceCount = 0;\r
      disposables.push(geometry);\r
      const uniforms = {\r
        uRoadX: { value: 0 },\r
        uRoadWidth: { value: 10 },\r
        uLanes: { value: 3 },\r
        uDirection: { value: direction },\r
        uSpeedRange: { value: new THREE.Vector2(...speedRange) },\r
        uTrail: { value: 1 },\r
        uSize: { value: 1 },\r
        uColors: swatches(),\r
        uColorCount: { value: 1 },\r
        uFade: { value: new THREE.Vector2(...fade) }\r
      };\r
      const layer = (radiusScale: number, sharp: number, mirror: number, order: number) => {\r
        const layerMaterial = material(\r
          STREAK_VERTEX,\r
          STREAK_FRAGMENT,\r
          {\r
            ...uniforms,\r
            uRadiusScale: { value: radiusScale },\r
            uSharp: { value: sharp },\r
            uMirror: { value: mirror },\r
            uIntensity: { value: 1 },\r
            uCore: { value: 0 }\r
          },\r
          { depthTest: !mirror }\r
        );\r
        effectMaterials.push(layerMaterial);\r
        const mesh = new THREE.Mesh(geometry, layerMaterial);\r
        mesh.frustumCulled = false;\r
        mesh.renderOrder = order;\r
        if (!mirror) mesh.layers.enable(1);\r
        scene.add(mesh);\r
        return layerMaterial;\r
      };\r
      return {\r
        geometry,\r
        uniforms,\r
        reflection: layer(2.1, 1.2, 1, 1),\r
        core: layer(1, 0.85, 0, 3)\r
      };\r
    };\r
\r
    const tail = streakGroup(1, [0, 0.6], [60, 80]);\r
    const head = streakGroup(-1, [1, 0.4], [120, 160]);\r
\r
    const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);\r
    disposables.push(cylinder);\r
    const poleGeometry = instanced(cylinder);\r
    const poleSeed = new Float32Array(MAX_POLES * 2 * 4);\r
    const poleIndex = new Float32Array(MAX_POLES * 2);\r
    const poleSide = new Float32Array(MAX_POLES * 2);\r
    for (let i = 0; i < MAX_POLES; i++) {\r
      for (let side = 0; side < 2; side++) {\r
        const index = i * 2 + side;\r
        poleSeed.set([Math.random(), Math.random(), Math.random(), Math.random()], index * 4);\r
        poleIndex[index] = i + (side ? 0.5 : 0);\r
        poleSide[index] = side ? 1 : -1;\r
      }\r
    }\r
    poleGeometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(poleSeed, 4));\r
    poleGeometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(poleIndex, 1));\r
    poleGeometry.setAttribute('aSide', new THREE.InstancedBufferAttribute(poleSide, 1));\r
    poleGeometry.instanceCount = 0;\r
    disposables.push(poleGeometry);\r
    const poleUniforms = {\r
      uCount: { value: 20 },\r
      uEdge: { value: 11 },\r
      uHeight: { value: 1 },\r
      uColors: swatches(),\r
      uColorCount: { value: 1 }\r
    };\r
    const poleLayer = (radiusScale: number, sharp: number, mirror: number, order: number) => {\r
      const layerMaterial = material(\r
        POLE_VERTEX,\r
        POLE_FRAGMENT,\r
        {\r
          ...poleUniforms,\r
          uRadiusScale: { value: radiusScale },\r
          uSharp: { value: sharp },\r
          uMirror: { value: mirror },\r
          uIntensity: { value: 1 },\r
          uCore: { value: 0 }\r
        },\r
        { depthTest: !mirror }\r
      );\r
      effectMaterials.push(layerMaterial);\r
      const mesh = new THREE.Mesh(poleGeometry, layerMaterial);\r
      mesh.frustumCulled = false;\r
      mesh.renderOrder = order;\r
      if (!mirror) mesh.layers.enable(1);\r
      scene.add(mesh);\r
      return layerMaterial;\r
    };\r
    const polesLayers = {\r
      reflection: poleLayer(2.4, 1.2, 1, 1),\r
      core: poleLayer(1, 0.8, 0, 3)\r
    };\r
\r
    const dustGeometry = new THREE.BufferGeometry();\r
    const dustSeed = new Float32Array(MAX_DUST * 2 * 4);\r
    const dustEnd = new Float32Array(MAX_DUST * 2);\r
    for (let i = 0; i < MAX_DUST; i++) {\r
      const seed = [Math.random(), Math.random(), Math.random(), Math.random()];\r
      dustSeed.set(seed, i * 8);\r
      dustSeed.set(seed, i * 8 + 4);\r
      dustEnd[i * 2 + 1] = 1;\r
    }\r
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_DUST * 2 * 3), 3));\r
    dustGeometry.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 4));\r
    dustGeometry.setAttribute('aEnd', new THREE.BufferAttribute(dustEnd, 1));\r
    dustGeometry.setDrawRange(0, 0);\r
    disposables.push(dustGeometry);\r
    const dustUniforms = {\r
      uSpread: { value: 140 },\r
      uColor: { value: new THREE.Vector3(1, 1, 1) },\r
      uIntensity: { value: 0.5 }\r
    };\r
    const dustMaterial = material(DUST_VERTEX, DUST_FRAGMENT, dustUniforms);\r
    effectMaterials.push(dustMaterial);\r
    const dustLines = new THREE.LineSegments(dustGeometry, dustMaterial);\r
    dustLines.frustumCulled = false;\r
    dustLines.renderOrder = 4;\r
    scene.add(dustLines);\r
\r
    const floatTargets =\r
      renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');\r
    const levels = Array.from({ length: 5 }, (_, index) => {\r
      const target = new THREE.WebGLRenderTarget(1, 1, {\r
        type: floatTargets ? THREE.HalfFloatType : THREE.UnsignedByteType,\r
        depthBuffer: index === 0\r
      });\r
      disposables.push(target);\r
      return target;\r
    });\r
    const quadScene = new THREE.Scene();\r
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);\r
    const quadGeometry = new THREE.PlaneGeometry(2, 2);\r
    disposables.push(quadGeometry);\r
    const quad = new THREE.Mesh(quadGeometry);\r
    quad.frustumCulled = false;\r
    quadScene.add(quad);\r
    const blur = (fragmentShader: string, options: THREE.ShaderMaterialParameters) => {\r
      const created = new THREE.ShaderMaterial({\r
        vertexShader: QUAD_VERTEX,\r
        fragmentShader,\r
        uniforms: {\r
          uTexture: { value: null },\r
          uTexel: { value: new THREE.Vector2() },\r
          uStrength: { value: 1 },\r
          uCeiling: { value: 1 },\r
          uLight: { value: 0 }\r
        },\r
        depthTest: false,\r
        depthWrite: false,\r
        ...options\r
      });\r
      disposables.push(created);\r
      return created;\r
    };\r
    const downMaterial = blur(DOWN_FRAGMENT, { blending: THREE.NoBlending });\r
    const upMaterial = blur(UP_FRAGMENT, {\r
      blending: THREE.CustomBlending,\r
      blendSrc: THREE.OneFactor,\r
      blendDst: THREE.OneFactor,\r
      blendSrcAlpha: THREE.OneFactor,\r
      blendDstAlpha: THREE.OneFactor\r
    });\r
    const bloomMaterial = blur(BLOOM_FRAGMENT, { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor });\r
    const pass = (\r
      passMaterial: THREE.ShaderMaterial,\r
      source: THREE.WebGLRenderTarget,\r
      target: THREE.WebGLRenderTarget | null\r
    ) => {\r
      quad.material = passMaterial;\r
      passMaterial.uniforms.uTexture.value = source.texture;\r
      passMaterial.uniforms.uTexel.value.set(1 / source.width, 1 / source.height);\r
      renderer.setRenderTarget(target);\r
      renderer.render(quadScene, quadCamera);\r
    };\r
    const clearColor = new THREE.Color();\r
    let clearAlpha = 0;\r
\r
    const state = {\r
      boost: 0,\r
      held: false,\r
      boosted: false,\r
      fov: settingsRef.current.fov,\r
      fovVelocity: 0,\r
      steerX: 0,\r
      steerY: 0,\r
      pointerX: 0,\r
      pointerY: 0,\r
      weights: [0, 0, 0, 0, 0],\r
      visible: true\r
    };\r
    const keys = { tail: '', head: '', poles: '', surface: '', light: null as boolean | null };\r
    const lookTarget = new THREE.Vector3();\r
    let raf = 0;\r
    let last = performance.now();\r
    let alive = true;\r
\r
    const syncColors = (s: Settings) => {\r
      const tailKey = s.tailColors.join();\r
      if (tailKey !== keys.tail) {\r
        keys.tail = tailKey;\r
        fillPalette(tail.uniforms.uColors, tail.uniforms.uColorCount, s.tailColors);\r
      }\r
      const headKey = s.headColors.join();\r
      if (headKey !== keys.head) {\r
        keys.head = headKey;\r
        fillPalette(head.uniforms.uColors, head.uniforms.uColorCount, s.headColors);\r
      }\r
      const poleKey = s.poleColors.join();\r
      if (poleKey !== keys.poles) {\r
        keys.poles = poleKey;\r
        fillPalette(poleUniforms.uColors, poleUniforms.uColorCount, s.poleColors);\r
      }\r
      const surfaceKey = [s.roadColor, s.lineColor, s.background, s.dustColor].join();\r
      if (surfaceKey !== keys.surface) {\r
        keys.surface = surfaceKey;\r
        roadUniforms.uRoadColor.value.fromArray(toRgb(s.roadColor));\r
        roadUniforms.uLineColor.value.fromArray(toRgb(s.lineColor));\r
        dustUniforms.uColor.value.fromArray(toRgb(s.dustColor));\r
        const transparent = s.background === 'transparent';\r
        const backdrop: Vec3 = transparent ? [0, 0, 0] : toRgb(s.background);\r
        roadUniforms.uBackground.value.fromArray(backdrop);\r
        roadUniforms.uTransparent.value = transparent ? 1 : 0;\r
        clearColor.setRGB(...backdrop, THREE.LinearSRGBColorSpace);\r
        clearAlpha = transparent ? 0 : 1;\r
      }\r
      if (keys.light !== s.light) {\r
        keys.light = s.light;\r
        effectMaterials.forEach(item => {\r
          item.blending = s.light ? THREE.NormalBlending : THREE.AdditiveBlending;\r
          item.needsUpdate = true;\r
        });\r
        bloomMaterial.blendDst = s.light ? THREE.OneMinusSrcAlphaFactor : THREE.OneFactor;\r
        bloomMaterial.blendSrcAlpha = s.light ? THREE.OneFactor : THREE.ZeroFactor;\r
        bloomMaterial.blendDstAlpha = s.light ? THREE.OneMinusSrcAlphaFactor : THREE.OneFactor;\r
        bloomMaterial.uniforms.uLight.value = s.light ? 1 : 0;\r
      }\r
    };\r
\r
    const resize = () => {\r
      const width = Math.max(1, container.clientWidth);\r
      const height = Math.max(1, container.clientHeight);\r
      renderer.setSize(width, height, false);\r
      levels.forEach((target, index) =>\r
        target.setSize(\r
          Math.max(1, Math.round(width / 2 ** (index + 1))),\r
          Math.max(1, Math.round(height / 2 ** (index + 1)))\r
        )\r
      );\r
      camera.aspect = width / height;\r
      camera.updateProjectionMatrix();\r
      wake();\r
    };\r
\r
    const frame = (now: number) => {\r
      raf = 0;\r
      if (!alive) return;\r
      const s = settingsRef.current;\r
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));\r
      last = now;\r
      syncColors(s);\r
\r
      const wanted = (state.held && s.interactive) || s.boosting ? 1 : 0;\r
      state.boost += (wanted - state.boost) * (1 - Math.exp(-dt / (wanted > state.boost ? 0.28 : 0.85)));\r
      const pace = s.speed * (reduce ? 0.3 : 1) * (1 + (s.boost - 1) * state.boost);\r
      shared.uTime.value += dt * pace;\r
      shared.uStretch.value = state.boost * 1.1;\r
      shared.uCurvature.value = s.curvature;\r
\r
      const target = CURVES.indexOf(s.curve) - 1;\r
      const blend = 1 - Math.exp(-dt / 0.6);\r
      state.weights = state.weights.map((weight, index) => weight + ((index === target ? 1 : 0) - weight) * blend);\r
      shared.uCurveA.value.set(state.weights[0], state.weights[1], state.weights[2], state.weights[3]);\r
      shared.uCurveB.value = state.weights[4];\r
\r
      const halfRoad = s.roadWidth / 2 + s.medianWidth / 2;\r
      const surface = 0.45 + 0.55 * s.roadOpacity;\r
      [tail, head].forEach((group, index) => {\r
        group.geometry.instanceCount = s.density * 2;\r
        group.uniforms.uRoadX.value = index ? halfRoad : -halfRoad;\r
        group.uniforms.uRoadWidth.value = s.roadWidth;\r
        group.uniforms.uLanes.value = s.lanes;\r
        group.uniforms.uTrail.value = s.trailLength;\r
        group.uniforms.uSize.value = s.lightSize;\r
        group.core.uniforms.uIntensity.value = s.light ? 0.95 : 1 + 0.35 * state.boost;\r
        group.core.uniforms.uCore.value = s.light ? 0 : 0.75;\r
        group.reflection.uniforms.uIntensity.value = s.reflections * (s.light ? 0.22 : 0.42) * surface;\r
      });\r
\r
      poleGeometry.instanceCount = s.poles * 2;\r
      poleUniforms.uCount.value = Math.max(1, s.poles);\r
      poleUniforms.uEdge.value = s.roadWidth + s.medianWidth / 2 + 0.8;\r
      poleUniforms.uHeight.value = s.poleHeight;\r
      polesLayers.core.uniforms.uIntensity.value = s.light ? 0.9 : 1;\r
      polesLayers.core.uniforms.uCore.value = s.light ? 0 : 0.6;\r
      polesLayers.reflection.uniforms.uIntensity.value = s.reflections * (s.light ? 0.2 : 0.38) * surface;\r
\r
      dustGeometry.setDrawRange(0, s.dust * 2);\r
      dustUniforms.uIntensity.value = (s.light ? 0.35 : 0.45) * (1 + state.boost);\r
      dustUniforms.uSpread.value = (s.roadWidth * 2 + s.medianWidth) * 5;\r
\r
      roadUniforms.uWidth.value = s.roadWidth * 2 + s.medianWidth + 3;\r
      roadUniforms.uRoadWidth.value = s.roadWidth;\r
      roadUniforms.uMedian.value = s.medianWidth;\r
      roadUniforms.uLanes.value = s.lanes;\r
      roadUniforms.uOpacity.value = s.roadOpacity;\r
      roadMaterial.depthWrite = s.roadOpacity > 0.5;\r
\r
      const fovTarget = reduce ? s.fov : s.fov + (s.boostFov - s.fov) * state.boost;\r
      state.fovVelocity += ((fovTarget - state.fov) * 90 - state.fovVelocity * 13) * dt;\r
      state.fov += state.fovVelocity * dt;\r
      camera.fov = state.fov;\r
      shared.uPixel.value = (2 * Math.tan((state.fov * Math.PI) / 360)) / Math.max(1, renderer.domElement.height);\r
\r
      const steerBlend = 1 - Math.exp(-dt / 0.35);\r
      const follow = s.interactive ? s.steer : 0;\r
      state.steerX += (state.pointerX * follow - state.steerX) * steerBlend;\r
      state.steerY += (state.pointerY * follow - state.steerY) * steerBlend;\r
      camera.position.set(state.steerX * s.roadWidth * 0.45, 8 - state.steerY * 2.5, -5);\r
\r
      const looks = lookShapes(shared.uTime.value, s.curvature);\r
      const straight = 1 - state.weights.reduce((sum, weight) => sum + weight, 0);\r
      lookTarget.set(0, 0, -10 * straight);\r
      looks.forEach((look, index) => {\r
        lookTarget.x += look[0] * state.weights[index];\r
        lookTarget.y += look[1] * state.weights[index];\r
        lookTarget.z += look[2] * state.weights[index];\r
      });\r
      lookTarget.x += state.steerX * 2.5;\r
      lookTarget.add(camera.position);\r
      camera.lookAt(lookTarget);\r
      camera.updateProjectionMatrix();\r
\r
      renderer.setRenderTarget(null);\r
      renderer.setClearColor(clearColor, clearAlpha);\r
      renderer.clear();\r
      renderer.render(scene, camera);\r
\r
      if (s.glow > 0) {\r
        const pixel = shared.uPixel.value;\r
        shared.uPixel.value = pixel * (renderer.domElement.height / levels[0].height);\r
        camera.layers.set(1);\r
        roadMaterial.colorWrite = false;\r
        renderer.setRenderTarget(levels[0]);\r
        renderer.setClearColor(0x000000, 0);\r
        renderer.clear();\r
        renderer.render(scene, camera);\r
        roadMaterial.colorWrite = true;\r
        camera.layers.set(0);\r
        shared.uPixel.value = pixel;\r
        for (let i = 1; i < levels.length; i++) pass(downMaterial, levels[i - 1], levels[i]);\r
        for (let i = levels.length - 1; i > 1; i--) pass(upMaterial, levels[i], levels[i - 1]);\r
        bloomMaterial.uniforms.uStrength.value = s.glow * (s.light ? 0.5 : 1.4);\r
        bloomMaterial.uniforms.uCeiling.value = s.glow * (s.light ? 0.3 : 0.5);\r
        pass(bloomMaterial, levels[1], null);\r
      }\r
\r
      if (state.visible) raf = requestAnimationFrame(frame);\r
    };\r
\r
    const wake = () => {\r
      if (raf || !alive || !state.visible) return;\r
      last = performance.now();\r
      raf = requestAnimationFrame(frame);\r
    };\r
\r
    const setHeld = (held: boolean) => {\r
      if (state.held === held) return;\r
      state.held = held;\r
      if (!settingsRef.current.interactive) return;\r
      if (held) callbacksRef.current.onBoostStart?.();\r
      else callbacksRef.current.onBoostEnd?.();\r
    };\r
\r
    const onDown = (event: PointerEvent) => {\r
      if (event.button !== 0 && event.pointerType === 'mouse') return;\r
      setHeld(true);\r
    };\r
    const onUp = () => setHeld(false);\r
    const onMove = (event: PointerEvent) => {\r
      const rect = container.getBoundingClientRect();\r
      state.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;\r
      state.pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;\r
    };\r
    const onLeave = () => {\r
      state.pointerX = 0;\r
      state.pointerY = 0;\r
    };\r
    const onMenu = (event: MouseEvent) => {\r
      if (settingsRef.current.interactive) event.preventDefault();\r
    };\r
\r
    const resizeObserver = new ResizeObserver(resize);\r
    resizeObserver.observe(container);\r
    const visibility = new IntersectionObserver(entries => {\r
      state.visible = entries.some(entry => entry.isIntersecting);\r
      if (state.visible) wake();\r
    });\r
    visibility.observe(container);\r
    container.addEventListener('pointerdown', onDown);\r
    container.addEventListener('pointermove', onMove);\r
    container.addEventListener('pointerleave', onLeave);\r
    container.addEventListener('contextmenu', onMenu);\r
    window.addEventListener('pointerup', onUp);\r
    window.addEventListener('pointercancel', onUp);\r
    window.addEventListener('blur', onUp);\r
    resize();\r
\r
    return () => {\r
      alive = false;\r
      cancelAnimationFrame(raf);\r
      resizeObserver.disconnect();\r
      visibility.disconnect();\r
      container.removeEventListener('pointerdown', onDown);\r
      container.removeEventListener('pointermove', onMove);\r
      container.removeEventListener('pointerleave', onLeave);\r
      container.removeEventListener('contextmenu', onMenu);\r
      window.removeEventListener('pointerup', onUp);\r
      window.removeEventListener('pointercancel', onUp);\r
      window.removeEventListener('blur', onUp);\r
      disposables.forEach(item => item.dispose());\r
      renderer.dispose();\r
      renderer.domElement.remove();\r
    };\r
  }, []);\r
\r
  return <div ref={containerRef} className={\`\${ROOT}\${className ? \` \${className}\` : ''}\`} style={style} />;\r
};\r
\r
export default Hyperspeed;\r
`,a={dependencies:"three",usage:`import Hyperspeed from './Hyperspeed';

<div style={{ position: 'relative', width: '100%', height: 600 }}>
  <Hyperspeed
    curve="winding"
    curvature={1}
    speed={1}
    boost={3}
    fov={90}
    boostFov={130}
    lanes={3}
    roadWidth={10}
    medianWidth={2}
    density={40}
    trailLength={1}
    lightSize={1}
    poles={20}
    dust={100}
    glow={0.6}
    reflections={0.5}
    roadOpacity={0.1}
    steer={0.35}
    tailColors={['#d856bf', '#6750a2', '#c247ac']}
    headColors={['#03b3c3', '#0e5ea5', '#324555']}
    poleColors={['#03b3c3']}
    interactive
  />
</div>`,code:r,css:e,tailwind:n,tsCode:t,tsTailwind:o};export{a as hyperspeed};
