# Lente — ProfitizeBuild
Objetivo: a abertura de uma marca em vidro. Uma gota de vidro transparente cai sobre o logo, se abre num ladrilho de cantos suaves (como um ícone de app) e segura o logo grande contra a borda, onde a refração o curva para dentro e o abre em cores, como luz passando por um prisma. Uma faixa de luz atravessa o vidro, a luz da borda gira, e então o vidro se desfaz e fica só o logo, nítido, no meio da tela. Em loop, com uma pausa na marca pronta; o clique toca de novo.

Contexto
  É um passe WebGL2 só, sem dependências. O logo (um SVG ou uma imagem) vira um campo de distância uma vez por logo, e cada quadro é só o shader: a borda do vidro refrata o logo pela lei de Snell, com um índice para cada cor do espectro, e os cantos focam o que está atrás num ponto, como uma lente.
  Todo o movimento mora numa linha do tempo de molas (a gota que cresce, o ladrilho que se abre, o zoom que desliza, o vidro que solta), e o shader só recebe os números dela. O visual é a soma exata dessas contas e dos números dos presets. Por isso o código vem inteiro e vai letra por letra.
  O contexto WebGL e o campo do logo só são criados quando o bloco chega a 400 px da tela, e o desenho para quando ele sai. Sem WebGL2, a marca aparece parada.

Antes de começar
  Olhe a stack do projeto:
  - React com TypeScript (Next.js, Vite, Remix, Astro com React…): siga os passos abaixo. O lente.tsx começa com 'use client', que o Next.js exige e os outros ignoram.
  - React sem TypeScript: crie os arquivos como .js e .jsx e tire só as anotações de tipo (os ": Tipo", os "as Tipo", os "!" de não nulo, os "type" dentro dos imports, as declarações "type" e "interface" e os genéricos <…>). Não mude mais nada.
  - Sem React (HTML puro com bundler, Vue, Svelte, Angular…): crie só o lente-shader.ts (ou lente-shader.js, sem as anotações de tipo) e chame mountLente(elemento, { logo: '<svg …>…</svg>' }) quando o elemento já estiver na página; guarde o que ela devolve e chame .destroy() quando o elemento sair (onUnmounted, onDestroy, ngOnDestroy). O elemento precisa de largura e altura.
  Os três arquivos vão juntos numa pasta lente, dentro da pasta de componentes do projeto (src/components/lente ou components/lente).
  Não há pacote para instalar. Mesmo que o projeto use Tailwind ou um design system, não converta nada: os arquivos ficam como estão.

Implementação
  1. Crie components/lente/lente-shader.ts com exatamente o conteúdo abaixo. Copie o arquivo inteiro, sem abreviar, sem reformatar, sem traduzir, sem renomear e sem "melhorar" nada, inclusive o GLSL e os números dos presets:

```ts
/*
 * Lente: uma gota de vidro cai sobre a marca, se abre num ladrilho de cantos suaves e segura o logo grande contra a
 * borda, onde a refração o curva e o abre em cores. Depois o vidro some e fica a marca.
 * Um passe WebGL2 só, sem dependências. Sem WebGL2, a marca aparece parada (máscara em CSS).
 * Shader e linha do tempo em molas adaptados de glass-icon-reveal, de zanwei (licença MIT).
 *
 * mountLente(elemento, opções) põe o canvas dentro do elemento e devolve { update, replay, destroy }. O contexto WebGL e
 * o campo de distância do logo só são criados quando o elemento chega a 400 px da tela; o desenho para fora da tela.
 */

export type LenteLook = "light" | "dark"

export interface LenteTuning {
  /** Altura da placa de vidro sobre o logo: quanto a borda o curva */
  opticalDepth: number
  /** Separação de cores em tudo o que a borda puxa para dentro */
  dispersion: number
  /** Brilho de cor espalhado por dentro da borda */
  colorBleed: number
  doubleBevel: number
  bevelWidth: number
  /** Expoente da superelipse do ladrilho: 2 é círculo, ~5 é ícone de app */
  corner: number
  cornerPull: number
  cornerWidth: number
  cornerFocus: number
  edgeSmear: number
  stretch: number
  tilt: number
  /** Lente da gota recém-nascida */
  bulge: number
  specular: number
  halo: number
  shadow: number
  ripple: number
  /** Mola da gota: 0 = sem passar do ponto */
  bounce: number
  /** Período da mola da gota, em segundos */
  response: number
  startSize: number
  startZoom: number
  /** Segundos que o logo leva para sair do aumento da gota (o trecho em que a borda o curva) */
  glide: number
  /** Segundos que o logo fica sob o vidro */
  present: number
  drift: number
  swell: number
  focus: number
  /** Faixa de luz que atravessa o vidro enquanto ele segura o logo (0 = nenhuma) */
  sheen: number
  /** Quanto a luz gira em volta da borda enquanto o vidro segura, em radianos */
  lightTurn: number
}

export interface LenteSettings extends LenteTuning {
  tileSize: number
  logoScale: number
  finalScale: number
  logoOffset: [number, number]
  iconPlate: boolean
  keepPlate: boolean
  originalColors: boolean
  background: string
  plateColor: string
  logoColor: string
  hold: number
}

const LIGHT: LenteSettings = {
  tileSize: 260, logoScale: 0.62, finalScale: 0.9, logoOffset: [0, 0], iconPlate: false, keepPlate: false, originalColors: false,
  opticalDepth: 1.15, dispersion: 1.9, colorBleed: 1.4, doubleBevel: 1, bevelWidth: 0.15, corner: 4.4,
  cornerPull: 2.2, cornerWidth: 2.4, cornerFocus: 0.55, edgeSmear: 2.6, stretch: 0, tilt: 0.3, bulge: 1.1,
  specular: 1, halo: 0, shadow: 1, ripple: 0.8,
  bounce: 0.06, response: 0.46, startSize: 0.18, startZoom: 2.4, glide: 2.5, present: 2.7, drift: 0.1, swell: 0.45, focus: 1,
  sheen: 0.9, lightTurn: 1.15,
  hold: 1.4, background: "#ecebe6", plateColor: "#ffffff", logoColor: "#0d5c46",
}

const LOOKS: Record<LenteLook, LenteSettings> = {
  light: LIGHT,
  dark: {
    ...LIGHT, logoScale: 0.7, finalScale: 1, iconPlate: true,
    halo: 1, shadow: 0, ripple: 0.45, startZoom: 1.7, drift: 0.05,
    opticalDepth: 0.8, bevelWidth: 0.2, dispersion: 1,
    colorBleed: 0.5, corner: 4.8, cornerPull: 1.5, edgeSmear: 1.2, tilt: 0, cornerWidth: 1.3, cornerFocus: 0.42,
    background: "#0a0a0a", plateColor: "#101012", logoColor: "#f4f1ea",
  },
}

/** Marca da demo (Vedra, fictícia): uma gema lapidada com uma janela triangular. Troque pelo SVG da sua marca */
export const VEDRA_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill-rule="evenodd" d="M18 34 34 14h32l16 20-32 54ZM37 38h26L50 62Z"/></svg>`

/* ------------------------------------------------------------------ *
 * Logo → textura + campo de distância
 * ------------------------------------------------------------------ */
const TEX = 1024 // lado da textura do logo
const BOX = 0.75 // parte da textura que o logo ocupa (o resto é folga para o campo de distância)

interface LogoData {
  canvas: HTMLCanvasElement
  sdf: Float32Array
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    if (!src.startsWith("data:")) img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("lente: não deu para carregar o logo"))
    img.src = src
  })
}

const isMarkup = (logo: string) => logo.trimStart().startsWith("<")

// SVG em texto → data URL no tamanho da textura; currentColor vira branco (só a forma importa).
function svgToUrl(text: string) {
  const svg = new DOMParser().parseFromString(text, "image/svg+xml").documentElement
  if (!svg || svg.nodeName.toLowerCase() !== "svg") throw new Error("lente: SVG inválido")
  let w = parseFloat(svg.getAttribute("width") || "")
  let h = parseFloat(svg.getAttribute("height") || "")
  const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number)
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) [w, h] = [vb[2], vb[3]]
  if (!(w > 0 && h > 0)) w = h = 100
  const s = TEX / Math.max(w, h)
  svg.setAttribute("width", String(Math.round(w * s)))
  svg.setAttribute("height", String(Math.round(h * s)))
  const out = new XMLSerializer().serializeToString(svg).replace(/currentColor/g, "#ffffff")
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(out)
}

const logoUrl = (logo: string) => (isMarkup(logo) ? svgToUrl(logo) : logo)

// Desenha a imagem num canvas TEX×TEX, recortada nos pixels visíveis e encaixada na caixa do logo.
// Imagem opaca (JPG, PNG chapado) perde a cor do canto, para a marca virar a forma.
function fitToTexture(source: CanvasImageSource, sw: number, sh: number) {
  const tmp = document.createElement("canvas")
  tmp.width = tmp.height = TEX
  const tc = tmp.getContext("2d", { willReadFrequently: true })!
  const s0 = Math.min(TEX / sw, TEX / sh)
  const dx0 = (TEX - sw * s0) / 2
  const dy0 = (TEX - sh * s0) / 2
  tc.drawImage(source, dx0, dy0, sw * s0, sh * s0)
  const d = tc.getImageData(0, 0, TEX, TEX).data

  let opaque = true
  for (let i = 3; i < d.length; i += 4 * 97) if (d[i] < 250) { opaque = false; break }
  const key = [d[0], d[1], d[2]]
  const keyAlpha = (r: number, g: number, b: number) =>
    Math.min(1, Math.max(0, (Math.hypot(r - key[0], g - key[1], b - key[2]) / 441 - 0.08) / 0.2))

  let x0 = TEX, y0 = TEX, x1 = -1, y1 = -1
  for (let y = 0; y < TEX; y++) {
    for (let x = 0; x < TEX; x++) {
      const i = (y * TEX + x) * 4
      const a = opaque ? keyAlpha(d[i], d[i + 1], d[i + 2]) * 255 : d[i + 3]
      if (a > 8) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) throw new Error("lente: o logo está vazio")
  const bw = x1 - x0 + 1
  const bh = y1 - y0 + 1
  const s = (TEX * BOX) / Math.max(bw, bh)

  const out = document.createElement("canvas")
  out.width = out.height = TEX
  const oc = out.getContext("2d", { willReadFrequently: true })!
  oc.imageSmoothingQuality = "high"
  oc.drawImage(source, TEX / 2 - (x0 + bw / 2 - dx0) * s, TEX / 2 - (y0 + bh / 2 - dy0) * s, sw * s0 * s, sh * s0 * s)
  if (opaque) {
    const im = oc.getImageData(0, 0, TEX, TEX)
    const e = im.data
    for (let i = 0; i < e.length; i += 4) e[i + 3] = Math.round(e[i + 3] * keyAlpha(e[i], e[i + 1], e[i + 2]))
    oc.putImageData(im, 0, 0)
  }
  return out
}

// Campo de distância com sinal a partir do alfa (transformada de distância exata, Felzenszwalb):
// + fora, − dentro, em unidades da textura.
function buildSdf(canvas: HTMLCanvasElement) {
  const n = TEX * TEX
  const alpha = canvas.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, TEX, TEX).data
  const INF = 1e20
  const outer = new Float64Array(n)
  const inner = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const a = alpha[i * 4 + 3] / 255
    if (a >= 1) { outer[i] = 0; inner[i] = INF }
    else if (a <= 0) { outer[i] = INF; inner[i] = 0 }
    else {
      const dd = 0.5 - a
      outer[i] = dd > 0 ? dd * dd : 0
      inner[i] = dd < 0 ? dd * dd : 0
    }
  }
  const f = new Float64Array(TEX)
  const z = new Float64Array(TEX + 1)
  const v = new Uint16Array(TEX)
  edt(outer, f, v, z, INF)
  edt(inner, f, v, z, INF)
  const sdf = new Float32Array(n)
  for (let i = 0; i < n; i++) sdf[i] = (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) / TEX
  return sdf
}

function edt(grid: Float64Array, f: Float64Array, v: Uint16Array, z: Float64Array, INF: number) {
  for (let x = 0; x < TEX; x++) edt1d(grid, x, TEX, f, v, z, INF)
  for (let y = 0; y < TEX; y++) edt1d(grid, y * TEX, 1, f, v, z, INF)
}

function edt1d(grid: Float64Array, offset: number, stride: number, f: Float64Array, v: Uint16Array, z: Float64Array, INF: number) {
  v[0] = 0
  z[0] = -INF
  z[1] = INF
  f[0] = grid[offset]
  for (let q = 1, k = 0, s = 0; q < TEX; q++) {
    f[q] = grid[offset + q * stride]
    const q2 = q * q
    do {
      const r = v[k]
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2
    } while (s <= z[k] && --k > -1)
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = INF
  }
  for (let q = 0, k = 0; q < TEX; q++) {
    while (z[k + 1] < q) k++
    const r = v[k]
    const qr = q - r
    grid[offset + q * stride] = f[r] + qr * qr
  }
}

// Um campo por logo para a página toda: montar leva ~100 ms, e remontagens e cópias reaproveitam.
const logoCache = new Map<string, Promise<LogoData>>()

function loadLogo(logo: string) {
  let job = logoCache.get(logo)
  if (!job) {
    job = loadImage(logoUrl(logo)).then((img) => {
      const canvas = fitToTexture(img, img.naturalWidth || TEX, img.naturalHeight || TEX)
      return { canvas, sdf: buildSdf(canvas) }
    })
    logoCache.set(logo, job)
    job.catch(() => logoCache.delete(logo))
  }
  return job
}

/* ------------------------------------------------------------------ *
 * Shader
 * ------------------------------------------------------------------ */
const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uCenter;      // centro, px do aparelho
uniform float uTile;       // lado do ladrilho, px do aparelho
uniform sampler2D uSdf;    // distância com sinal, unidades da textura, + fora
uniform sampler2D uCol;    // cor pré-multiplicada, com mipmaps
uniform float uTexSize;
uniform float uBoxFrac;

uniform float uPlateScale; // tamanho da placa em relação ao ladrilho
uniform float uShapeN;     // expoente da superelipse: 2 = círculo
uniform float uCornerN;    // expoente final, usado pelo fantasma
uniform float uOptics;     // 1 = refração cheia, 0 = plano
uniform float uPlateAlpha; // 1 = vidro à mostra, 0 = só o logo
uniform float uLogoHalf;   // meio lado do logo em unidades da placa (com o zoom)
uniform vec2 uLogoOff;     // centro do logo, unidades da placa
uniform float uBold;       // engorda do traço, em meios lados do logo
uniform float uBlur;       // maciez da borda, unidades da placa
uniform float uFrost;      // leitoso dentro da gota nova
uniform float uDome;       // altura da lente
uniform float uDrop;       // 1 enquanto o vidro é gota redonda, 0 quando vira ladrilho
uniform float uPinch;      // estiramento da face para os cantos, na borda
uniform float uTilt;       // estiramento extra dos cantos da diagonal que sobe (0–1)
uniform float uRim;
uniform float uHalo;
uniform float uShadow;
uniform float uGhost;
uniform float uRipR;       // raio da onda, em placas
uniform float uRipA;
uniform float uBare;       // 1 quando o logo já pode aparecer sem vidro (o fim)
uniform float uReach;      // largura da faixa da borda, unidades da placa
uniform float uCornerPull; // quanto os cantos puxam mais que os lados
uniform float uStreak;     // quanto um canto arrasta o conteúdo ao longo da borda, em larguras de faixa
uniform float uWiden;      // quanto a faixa que dobra alarga para os cantos
uniform float uSlab;       // altura da placa sobre o logo, unidades da placa
uniform float uEtaSpread;  // espalhamento do índice pelo espectro (vermelho mais alto)
uniform float uFocus;      // quanto para dentro, na diagonal, um canto foca
uniform float uFocusK;     // rapidez com que a vista volta do foco ao longo da faixa
uniform float uFocusSplit; // quanto o vermelho foca mais para dentro que o violeta
uniform float uRimLine;    // quanto da faixa a linha de visão leva para virar para o foco
uniform float uCornerOn;   // 0 com o vidro redondo, 1 quando vira ladrilho
uniform float uDissolve;   // 0 → 1 enquanto o vidro solta o logo
uniform float uGlow;       // cor espalhada na borda
uniform float uFaceDisp;   // separação de cor lateral na face
uniform float uVivid;      // saturação da luz separada

uniform float uDisp;
uniform float uDouble;
uniform float uBevelW;
uniform float uSpec;
uniform float uIconPlate;
uniform float uUseColor;
uniform float uLightScene; // 1 = fundo claro, 0 = escuro
uniform float uLightGlass; // o mesmo para o que fica sob o vidro (a placa, quando há)
uniform float uKeep;       // 1 = o vidro assenta numa placa chapada em vez de sumir
uniform float uSheen;      // força da faixa de luz na face
uniform float uSweep;      // posição dessa faixa, em placas ao longo da diagonal
uniform float uLightAng;   // quanto a luz da borda girou, radianos

uniform vec3 uBg;
uniform vec3 uPlateCol;
uniform vec3 uLogoCol;

float px; // um pixel do aparelho em unidades da placa

vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }

// aa: tamanho de um pixel da tela em q, unidades da placa.
vec4 logoAt(vec2 q, float blur, float aa) {
  float L = uLogoHalf;
  float k = 0.5 * uBoxFrac / L;
  vec2 uv = vec2(0.5 + (q.x - uLogoOff.x) * k, 0.5 - (q.y - uLogoOff.y) * k);
  float d = texture(uSdf, uv).r / k;
  float w = 0.75 * aa + blur;
  float a = 1.0 - smoothstep(-w, w, d - uBold * L);
  vec3 c = uLogoCol;
  if (uUseColor > 0.5) {
    float lod = log2(max(1.0, w * k * uTexSize));
    vec4 c0 = textureLod(uCol, uv, lod);
    vec4 c1 = textureLod(uCol, uv, lod + 3.0);
    vec4 c2 = textureLod(uCol, uv, 7.0);
    c = c2.rgb / max(c2.a, 1e-4);
    c = mix(c, c1.rgb / max(c1.a, 1e-4), smoothstep(0.0, 0.06, c1.a));
    c = mix(c, c0.rgb / max(c0.a, 1e-4), smoothstep(0.02, 0.3, c0.a));
  }
  return vec4(c, a);
}

// Campo da superelipse. Devolve a distância com sinal (unidades da placa, − dentro); g = 1 na borda.
float shape(vec2 p, float scale, float n, out vec2 nOut, out float g, out vec2 dg) {
  vec2 pp = p / scale;
  vec2 a = max(abs(pp), vec2(1e-6));
  g = pow(pow(a.x, n) + pow(a.y, n), 1.0 / n);
  dg = sign(pp) * pow(a, vec2(n - 1.0)) * pow(max(g, 1e-6), 1.0 - n);
  float dgl = max(length(dg), 1e-6);
  nOut = dg / dgl;
  return (g - 1.0) / dgl * scale;
}

// Raio de curvatura (unidades da placa) do contorno da forma que passa por p.
float contourRadius(vec2 p, float scale, float n) {
  vec2 a = max(abs(p / scale), vec2(1e-4));
  vec2 a1 = pow(a, vec2(n - 1.0));
  vec2 a2 = pow(a, vec2(n - 2.0));
  float k = (n - 1.0) * (a2.x * a1.y * a1.y + a2.y * a1.x * a1.x) / pow(max(dot(a1, a1), 1e-30), 1.5);
  return scale / max(k, 1e-3);
}

// Para onde olha o vidro em x = s / bwF na borda arredondada: uma placa uSlab acima do logo, com
// quarto de círculo de raio bwF na beira. A linha de visão reta dobra para dentro pela lei de Snell:
// a beira de fora olha mais fundo, e a vista volta à face ao longo da borda.
vec2 refractSample(float x, float bwF, float eta, float R, vec2 dirOut, vec2 p, float dome, float offMul) {
  float u = clamp(1.0 - x, 0.0, 0.995);
  float th = asin(u), thr = asin(u / eta);
  float z = uSlab + bwF * sqrt(1.0 - u * u);
  float off = offMul * z * tan(th - thr);
  off = off / (1.0 + off / (6.0 * R));
  return p - (dirOut * off + p * dome) * uOptics;
}

float gauss(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }
float band(float x, float a, float b, float w) { return smoothstep(a - w, a, x) * (1.0 - smoothstep(b, b + w, x)); }

// Espectro visível, do vermelho (0) ao violeta (1).
float bump(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }
vec3 spectrum(float x) {
  return vec3(bump(x, 0.34, 0.2) + 0.08 * bump(x, 0.93, 0.05), bump(x, 0.58, 0.1), bump(x, 0.8, 0.11));
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  px = 2.0 / uTile;
  vec2 p = (gl_FragCoord.xy - uCenter) * px;

  vec4 lg = logoAt(p, uBlur, px);
  vec3 plain = mix(uBg, lg.rgb, lg.a * uBare);

  vec2 nOut, dg; float g;
  float sd = shape(p, uPlateScale, uShapeN, nOut, g, dg);
  float s = -sd;
  float bw = max(uBevelW, 0.004) * uPlateScale;
  float x = clamp(s / bw, 0.0, 1.0);
  float R = contourRadius(p, uPlateScale, uShapeN);
  vec2 pq = p * p;
  float diag = 4.0 * pq.x * pq.y / max((pq.x + pq.y) * (pq.x + pq.y), 1e-6);
  float tilt = mix(1.0 - uTilt, 1.0, smoothstep(-0.02, 0.02, p.x * p.y));
  float pinchPart = uPinch * min(g * g, 1.0) * diag * diag * tilt;
  float dome = uDome * (1.0 - min(g * g, 1.0)) + pinchPart;
  vec2 dirOut = normalize(mix(nOut, p / max(length(p), 1e-4), 0.2));
  // Os cantos curvam nos dois sentidos, então puxam o conteúdo de mais fundo que os lados.
  float cornerness = max(smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y), smoothstep(0.15, 0.75, diag));
  float offMul = 1.0 + 0.4 * max(uCornerPull - 1.0, 0.0) * tilt * cornerness * uCornerOn;
  // Em volta de um canto, todas as linhas de visão se encontram num foco um pouco para dentro na diagonal.
  vec2 focus = sign(p) * (pow(0.5, 1.0 / uShapeN) - uFocus * 0.70710678) * uPlateScale;
  float focusW = tilt * cornerness * uOptics * uCornerOn;
  float bwF = max(uReach, 0.004) * (1.0 + uWiden * tilt * cornerness * uCornerOn);
  float xf = clamp(s / bwF, 0.0, 1.0);
  // Tamanho de um pixel depois da refração, medido em fluxo de controle uniforme.
  vec2 qc = refractSample(xf, bwF, 1.5, R, dirOut, p, dome, offMul);
  float foot = max(max(length(dFdx(qc)), length(dFdy(qc))), 0.25 * px);

  // Fundo: o fantasma da antecipação, a onda, a sombra leve e o halo.
  vec3 bg = uBg;
  vec3 lift = mix(uBg + vec3(0.06), mix(uBg, vec3(1.0), 0.55), uLightScene);
  if (uGhost > 0.001) {
    vec2 gn, gdg; float gg;
    float gsd = shape(p, 1.0, uCornerN, gn, gg, gdg);
    bg = mix(bg, lift, uGhost * 0.12 * (1.0 - smoothstep(-0.16, 0.14, gsd)));
    bg *= 1.0 - uGhost * 0.03 * uLightScene * exp(-max(gsd, 0.0) / 0.12) * step(0.0, gsd);
  }
  float outside = max(sd, 0.0);
  if (uRipA > 0.001) {
    float d0 = (uRipR - 1.0) * uPlateScale;
    float rx = (sd - d0) / 0.022;
    float ring = exp(-rx * rx);
    bg += uRipA * ring * (0.04 * (0.55 + 0.45 * dot(nOut, normalize(vec2(-0.5, 0.8))))) * mix(0.5, 1.0, uLightScene);
    bg -= uRipA * 0.016 * uLightScene * exp(-(rx - 1.6) * (rx - 1.6));
  }
  float shadowFall = max(sd, 0.0) / (0.9 * uPlateScale);
  bg *= 1.0 - uShadow * 0.03 * exp(-shadowFall * shadowFall) * step(0.0, sd);
  vec3 haloCol = mix(vec3(0.62, 0.69, 0.80), vec3(1.0), uLightScene);
  bg = mix(bg, haloCol, clamp(uHalo * (0.30 * exp(-outside / (0.025 * uPlateScale)) + 0.07 * exp(-outside / (0.12 * uPlateScale))), 0.0, 1.0) * step(0.0, sd));

  vec3 col = bg;
  float soft = px + uBlur * 0.8 + 0.06 * uDissolve * (1.0 - uKeep) * uPlateScale;
  if (sd < soft) {
    // Superfície de luz: um quarto de superelipse, plano na face e íngreme na borda.
    float y1 = 1.0 - x;
    const float K = 2.6;
    float base1 = max(1.0 - pow(y1, K), 1e-4);
    float db = min(pow(y1, K - 1.0) * pow(base1, 1.0 / K - 1.0), 25.0);
    // Um segundo degrau, mais baixo, logo dentro do primeiro desenha a linha fina de dentro.
    float s1 = bw * 0.62;
    float w2 = bw * 0.22;
    float t2 = clamp((s - s1) / w2, -1.0, 1.0);
    float dh2 = uDouble * bw * 0.16;
    float dd = dh2 * 0.5 * cos(t2 * 1.5707963) * 1.5707963 / w2 * step(abs(t2), 0.999);
    vec2 gDome = -uDome * 2.0 * g * dg * step(g, 1.0);
    vec2 grad = -(db + dd) * nOut + gDome;

    vec3 back = mix(uBg, uPlateCol, uIconPlate);
    vec3 liftG = mix(back + vec3(0.06), mix(back, vec3(1.0), 0.55), uLightGlass);
    float rblur = uBlur + 0.05 * length(qc - p) + min(uGlow * uOptics * (1.0 - xf) * foot / px, 0.04);

    // Cada comprimento de onda refrata pelo próprio índice: o que a borda puxa abre em cores e a face
    // fica nítida. Nos cantos, as amostras também se arrastam ao longo da borda.
    float cornerW = smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y);
    float streak = 0.35 * uStreak * bw * mix(0.15, 1.0, cornerW) * pow(1.0 - xf, 1.5) * uOptics;
    vec2 tangent = vec2(-nOut.y, nOut.x);
    vec3 acc = vec3(0.0), wsum = vec3(0.0);
    for (int i = 0; i < 20; i++) {
      float lam = (float(i) + 0.5) / 20.0;
      float c = uDisp * (1.0 - 2.0 * lam);
      vec2 along = tangent * (streak * 2.0 * (fract(float(i) * 0.618034 + 0.31) - 0.5));
      float cf = uDisp * (1.0 - 2.0 * lam) * (lam > 0.5 ? 1.0 : 0.5);
      vec2 sp = refractSample(xf, bwF, 1.5 + uEtaSpread * c, R, dirOut, p + along,
                              dome + pinchPart * 0.3 * c, offMul);
      vec2 focusL = focus - sign(p) * (0.70710678 * uFocusSplit * c * uPlateScale);
      float wFocus = pow(1.0 - xf, uFocusK) * smoothstep(0.0, uRimLine * (1.0 + 0.6 * c), xf);
      sp = mix(sp, mix(p + along, focusL, wFocus), focusW);
      float faceOnly = smoothstep(0.7, 1.0, xf) * uOptics;
      sp *= 1.0 + uFaceDisp * cf * faceOnly;
      vec4 l = logoAt(sp, rblur + 0.12 * streak + uFaceDisp * 0.5 * max(c, 0.0) * faceOnly, foot);
      vec3 w = spectrum(lam);
      acc += mix(back, l.rgb, l.a) * w;
      wsum += w;
    }
    vec3 trans = acc / wsum;
    float tl = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    trans = clamp(tl + (trans - tl) * (1.0 + uVivid * uOptics), 0.0, 1.0);
    // A gota nova é leitosa; a névoa só clareia.
    float hazeLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    float hazeGate = mix(1.0 - smoothstep(0.25, 0.75, hazeLum), smoothstep(0.25, 0.75, hazeLum), uLightGlass);
    trans = mix(trans, liftG, uFrost * 0.45 * hazeGate);

    float glassAmt = pow(1.0 - uDissolve, 1.5);
    float lit = uSpec * glassAmt;
    vec3 rimCol = mix(vec3(0.80, 0.87, 0.97), vec3(1.0), uLightGlass);

    // Fundo claro: a borda grossa brilha branca e macia sobre a face limpa, com um filete claro em cima
    // e à direita e uma silhueta escura e fina à esquerda e embaixo.
    float sc = uPlateScale;
    float tLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    float lightOnly = smoothstep(0.35, 0.85, tLum);
    float hw = smoothstep(-0.85, 0.5, dot(nOut, rot(vec2(0.5, 0.866), uLightAng)));
    float tileBand = band(s, 0.016 * sc, 0.075 * sc, 0.022 * sc);
    float dropBand = (1.0 - smoothstep(0.06 * sc, 0.13 * sc, s)) * smoothstep(0.0, 0.004 * sc, s);
    float glow = mix(0.32 * tileBand, 0.75 * dropBand, uDrop) * lightOnly;
    float edgeLine = gauss(s, 0.005 * sc, 0.0045 * sc);
    float lip = gauss(s, 0.15 * sc, 0.007 * sc) * uDouble * (1.0 - uDrop);
    vec3 lightGlass = mix(trans, vec3(1.0), glow * glassAmt);
    lightGlass += (0.075 * hw * edgeLine + 0.06 * (0.4 + 0.6 * hw) * lip) * lit;
    lightGlass *= 1.0 - 0.05 * (1.0 - hw) * edgeLine * glassAmt * (1.0 - uDrop);
    lightGlass = mix(lightGlass, vec3(1.0), 0.55 * uDrop * glassAmt * edgeLine);

    // Fundo escuro: uma luz fria de borda que cresce para a beira íngreme, e um brilho pequeno.
    vec3 Nl = normalize(vec3(-grad, 1.0));
    float edge = 1.0 - Nl.z;
    vec2 ldir = rot(normalize(vec2(-0.62, 0.78)), uLightAng);
    float side = dot(nOut, ldir);
    float fres = pow(edge, 1.5);
    vec3 rim = rimCol * fres * (0.35 + 0.65 * max(side, -side * 0.8)) * uRim * 0.65;
    vec3 Hv = normalize(normalize(vec3(-0.45, 0.6, 0.66)) + vec3(0.0, 0.0, 1.0));
    float spc = pow(max(dot(Nl, Hv), 0.0), 140.0) * 0.8 * smoothstep(0.0, 0.25, y1);
    vec3 darkGlass = trans * (1.0 - 0.25 * fres) + (rim + vec3(spc)) * lit;
    darkGlass = mix(darkGlass, rimCol, uDrop * 0.4 * uSpec * (1.0 - smoothstep(0.0, 0.1 * uPlateScale, s)));
    vec3 glass = mix(darkGlass, lightGlass, uLightGlass);

    // Enquanto o vidro segura o logo, uma faixa de luz atravessa a face, mais forte perto da borda.
    float sweepD = dot(p / uPlateScale, normalize(vec2(0.8, 0.6))) - uSweep;
    float sheen = uSheen * glassAmt * exp(-sweepD * sweepD / 0.03) * (0.55 + 0.45 * (1.0 - x));
    glass = mix(glass, vec3(1.0), sheen * mix(0.22, 0.42, uLightGlass));

    float cov = clamp(0.5 - sd / soft, 0.0, 1.0);
    col = mix(bg, glass, cov);
  }

  vec3 outc = mix(plain, col, uPlateAlpha);
  outc += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  outColor = vec4(outc, 1.0);
}`

/* ------------------------------------------------------------------ *
 * Renderizador
 * ------------------------------------------------------------------ */
type Frame = ReturnType<typeof frameAt>

function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false })
  if (!gl) return null
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || "shader")
    return sh
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "program")
  gl.useProgram(prog)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, "aPos")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const U: Record<string, WebGLUniformLocation | null> = {}
  const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(prog, i)!
    U[info.name] = gl.getUniformLocation(prog, info.name)
  }

  const sdfTex = gl.createTexture()
  const colTex = gl.createTexture()
  gl.uniform1i(U.uSdf, 0)
  gl.uniform1i(U.uCol, 1)
  let hasLogo = false

  const params = (filter: number) => {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }

  function setLogo(logo: LogoData) {
    gl!.activeTexture(gl!.TEXTURE0)
    gl!.bindTexture(gl!.TEXTURE_2D, sdfTex)
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.R16F, TEX, TEX, 0, gl!.RED, gl!.FLOAT, logo.sdf)
    params(gl!.LINEAR)

    gl!.activeTexture(gl!.TEXTURE1)
    gl!.bindTexture(gl!.TEXTURE_2D, colTex)
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, gl!.RGBA, gl!.UNSIGNED_BYTE, logo.canvas)
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl!.generateMipmap(gl!.TEXTURE_2D)
    params(gl!.LINEAR_MIPMAP_LINEAR)
    hasLogo = true
  }

  function render(fr: Frame, w: number, h: number, tilePx: number) {
    if (!hasLogo) return
    gl!.viewport(0, 0, w, h)
    gl!.uniform2f(U.uCenter, w / 2, h / 2)
    gl!.uniform1f(U.uTile, tilePx)
    gl!.uniform1f(U.uTexSize, TEX)
    gl!.uniform1f(U.uBoxFrac, BOX)
    for (const k in fr) {
      const v = fr[k as keyof Frame]
      if (typeof v === "number" && U[k]) gl!.uniform1f(U[k], v)
    }
    gl!.uniform3fv(U.uBg, fr.uBg)
    gl!.uniform3fv(U.uPlateCol, fr.uPlateCol)
    gl!.uniform3fv(U.uLogoCol, fr.uLogoCol)
    gl!.uniform2fv(U.uLogoOff, fr.uLogoOff)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }

  function dispose() {
    gl!.getExtension("WEBGL_lose_context")?.loseContext()
  }

  return { setLogo, render, dispose }
}

/* ------------------------------------------------------------------ *
 * Linha do tempo em molas
 * ------------------------------------------------------------------ */
const TAIL = 1.1 // do vidro soltar até tudo parar, segundos
const OUTRO = 0.5 // só no loop: o logo desfoca antes da próxima volta
const endOf = (P: LenteSettings) => P.present + TAIL

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const smoother = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "")
  if (h.length === 3) h = h.replace(/./g, "$&$&")
  const v = parseInt(h.slice(0, 6), 16) || 0
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]
}
const luminance = ([r, g, b]: number[]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

// Resposta de uma mola solta em t = 0, de 0 para 1 (amortecimento 1 = sem passar do ponto;
// response = período da mola sem amortecimento, segundos).
function spring(t: number, response: number, damping: number) {
  if (t <= 0) return 0
  const w = (2 * Math.PI) / response
  if (damping >= 1) return 1 - Math.exp(-w * t) * (1 + w * t)
  const wd = w * Math.sqrt(1 - damping * damping)
  return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t))
}

const reachCache = new Map<string, number>()
function timeToReach(level: number, response: number, damping: number) {
  const key = `${level}/${response}/${damping}`
  let t = reachCache.get(key)
  if (t === undefined) {
    let lo = 0
    let hi = 3
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2
      if (spring(mid, response, damping) < level) lo = mid
      else hi = mid
    }
    reachCache.set(key, (t = hi))
  }
  return t
}

// Todo o movimento mora aqui; o shader só recebe os números. A gota cresce numa mola, vira ladrilho ao
// pousar, o logo sai do aumento devagar e o vidro o segura enquanto a faixa de luz passa e a luz da borda
// gira. Depois o vidro solta: fica a marca, ou, com keepPlate, o vidro assenta numa placa de ícone.
function frameAt(T: number, P: LenteSettings, outro = 0) {
  const tx = P.present
  const keep = P.keepPlate ? 1 : 0
  const damping = 1 - P.bounce
  const grow = spring(T + 0.01, P.response, damping)
  const tl = timeToReach(0.85, P.response, damping) - 0.01 // a gota pousa: sai a onda
  const tm = timeToReach(0.92, P.response, damping) - 0.01 // e se abre em ladrilho
  const morph = spring(T - tm, 0.4, 1)
  const drop = 1 - smooth(0.05, 1, morph)
  const appear = smooth(0, 0.08, T)
  const drift = P.drift * spring(T - 0.3, 2.2, 1)
  // Um quarto do zoom vai com a gota que pousa, o resto desliza devagar: o logo fica grande contra a
  // borda, onde o vidro mais o curva.
  const zoomIn = 0.25 * spring(T, 0.7, 1) + 0.75 * smoother(0, P.glide, T)
  const settle = spring(T - 0.5, 2.4, 1)
  const exit = spring(T - tx, 0.95, 1)
  const release = spring(T - tx - 0.05, 0.65, 1)
  const dome = 0.15 * P.bulge * (1 - smooth(0.4, 0.95, grow))
  const view = (1 + (P.startZoom - 1) * (1 - zoomIn)) * (1 - 0.045 * settle) * mix(1, P.finalScale, exit) * (1 - 0.06 * outro)
  const bandW = mix(P.bevelWidth, Math.max(P.bevelWidth, 0.4), drop)
  const plateScale = mix(P.startSize, 1, grow) * (1 + drift) * (1 + 0.14 * release * (1 - keep)) * (1 - keep * (0.03 * release + 0.06 * outro))
  const bg = hexToRgb(P.background)
  return {
    uPlateScale: plateScale,
    uShapeN: mix(2, P.corner, morph),
    uCornerN: P.corner,
    uOptics: 1 - smooth(0.55, 1, release),
    uPlateAlpha: keep ? appear * (1 - outro) : appear * (1 - smooth(0.45, 1, release)),
    uLogoHalf: P.logoScale * view,
    uLogoOff: [P.logoOffset[0] * view, P.logoOffset[1] * view] as [number, number],
    uKeep: keep,
    uSheen: P.sheen,
    uSweep: mix(-1.6, 1.6, smoother(0.9, tx - 0.1, T)),
    uLightAng: P.lightTurn * smoother(0.4, tx + 0.4, T),
    uBold: P.swell * 0.03 * (1 - zoomIn),
    uBlur: P.focus * 0.05 * (1 - smooth(0.3, 0.95, grow)) + 0.03 * outro,
    uFrost: P.focus * (1 - smooth(0.5, 0.95, grow)),
    uPinch: 0.38 * P.stretch * smooth(0.1, 0.9, morph) * smooth(0.75, 0.97, zoomIn),
    uTilt: P.tilt,
    uDome: dome,
    uDrop: drop,
    uRim: 1 + 0.8 * drop,
    uHalo: P.halo * (0.5 + 0.5 * drop) * (1 - keep * release),
    uShadow: Math.max(P.shadow * smooth(0.45, 0.8, grow) * (1 - smooth(0, 0.6, morph)), 0.8 * P.shadow * keep * release),
    uGhost: smooth(0, 0.03, T) * (1 - smooth(0.04, 0.08, T)),
    uRipR: 1 + 0.9 * Math.max(0, T - tl),
    uRipA: P.ripple * smooth(tl, tl + 0.06, T) * Math.exp(-Math.max(0, T - tl) / 0.6),
    uBare: (1 - keep) * smooth(tx - 0.25, tx, T) * (1 - outro),
    uReach: bandW * plateScale,
    uCornerPull: P.cornerPull,
    uStreak: P.edgeSmear,
    uWiden: P.cornerWidth,
    uSlab: 0.3 * P.opticalDepth,
    uEtaSpread: 0.06,
    uFocus: P.cornerFocus,
    uFocusK: 1.0,
    uFocusSplit: 0.056 * P.colorBleed,
    uRimLine: 0.09,
    uCornerOn: smooth(0.35, 1, morph),
    uGlow: 0.012 * P.colorBleed,
    uFaceDisp: 0.012 * P.dispersion,
    uVivid: 0.85,
    uDissolve: release,
    uDisp: P.dispersion,
    uDouble: P.doubleBevel,
    uBevelW: bandW * (1 - release),
    uSpec: P.specular,
    uIconPlate: P.iconPlate ? 1 : 0,
    uUseColor: P.originalColors ? 1 : 0,
    uLightScene: luminance(bg) > 0.5 ? 1 : 0,
    uLightGlass: luminance(P.iconPlate ? hexToRgb(P.plateColor) : bg) > 0.5 ? 1 : 0,
    uBg: bg,
    uPlateCol: hexToRgb(P.plateColor),
    uLogoCol: hexToRgb(P.logoColor),
  }
}

// Dono do canvas: um novo a cada montagem (um contexto perdido nunca volta no mesmo elemento),
// desenhado só enquanto está na tela e só quando algo mudou.
function startEngine(
  wrap: HTMLElement,
  live: { current: Live },
) {
  const canvas = document.createElement("canvas")
  canvas.setAttribute("aria-hidden", "true")
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block"
  wrap.appendChild(canvas)

  let renderer: ReturnType<typeof createRenderer> = null
  try {
    renderer = createRenderer(canvas)
  } catch (err) {
    console.error(err)
  }
  if (!renderer) {
    canvas.remove()
    return null
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  let logo: LogoData | null = null
  let time = reduceMotion ? 1.6 : 0 // um quadro parado com o vidro
  let playing = !reduceMotion
  let pauseLeft = 0
  let outro = 0
  let dirty = true
  let visible = false
  let lost = false
  let raf = 0
  let last = 0

  function tick(now: number) {
    raf = 0
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    const { settings: P, loop, speed, time: fixed } = live.current
    const end = endOf(P)
    if (fixed !== undefined) {
      // Depois do fim, o tempo congelado segue pela pausa do loop e pelo desfoque.
      playing = false
      time = fixed
      outro = clamp01((fixed - end - Math.max(0.05, P.hold)) / OUTRO)
    } else if (playing && logo) {
      if (pauseLeft > 0) {
        // Pausa do loop: segura a marca pronta (nada a redesenhar), depois desfoca para a próxima
        // volta começar vazia.
        pauseLeft -= dt
        const was = outro
        outro = clamp01(1 - pauseLeft / OUTRO)
        if (pauseLeft <= 0) {
          pauseLeft = 0
          outro = 0
          time = 0
        }
        if (outro !== was || time === 0) dirty = true
      } else {
        time += dt * speed
        if (time >= end) {
          time = end
          if (loop) pauseLeft = Math.max(0.05, P.hold) + OUTRO
          else playing = false
        }
        dirty = true
      }
    }
    if (dirty && logo && renderer && !lost) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      const w = Math.max(1, Math.round(cw * dpr))
      const h = Math.max(1, Math.round(ch * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      const tile = Math.min(P.tileSize, Math.min(cw, ch) / 1.75)
      renderer.render(frameAt(Math.min(time, end), P, outro), w, h, tile * dpr)
      dirty = false
    }
    if (visible && playing && logo && !lost) raf = requestAnimationFrame(tick)
  }

  function kick() {
    if (raf || !visible || lost) return
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) kick()
    else if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  })
  io.observe(wrap)
  const ro = new ResizeObserver(() => {
    dirty = true
    kick()
  })
  ro.observe(wrap)

  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
  }
  const onRestored = () => {
    lost = false
    try {
      renderer = createRenderer(canvas)
      if (renderer && logo) renderer.setLogo(logo)
    } catch (err) {
      console.error(err)
    }
    dirty = true
    kick()
  }
  canvas.addEventListener("webglcontextlost", onLost)
  canvas.addEventListener("webglcontextrestored", onRestored)

  const restart = () => {
    time = 0
    playing = true
    pauseLeft = 0
    outro = 0
  }

  return {
    setLogo(data: LogoData) {
      logo = data
      renderer?.setLogo(data)
      if (!reduceMotion) restart()
      dirty = true
      kick()
    },
    replay() {
      restart()
      dirty = true
      kick()
    },
    invalidate() {
      dirty = true
      kick()
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      renderer?.dispose()
      canvas.remove()
    },
  }
}


/* ------------------------------------------------------------------ *
 * Montagem
 * ------------------------------------------------------------------ */
export type LenteOptions = Partial<Omit<LenteSettings, keyof LenteTuning>> & {
  /** SVG em texto (`<svg …>…</svg>`) ou URL de imagem. Só a forma conta, a não ser com `originalColors`.
   * Padrão: a marca da demo (Vedra) */
  logo?: string
  /** Ponto de partida: vidro claro sobre fundo claro, ou vidro escuro com placa de ícone */
  look?: LenteLook
  loop?: boolean
  speed?: number
  /** Congela a revelação neste segundo em vez de tocar (uso preso à rolagem ou parado). Depois do fim, segue pela
   * pausa e pelo desfoque do loop, então 0 … fim + hold + 0,5 é uma volta inteira sem emenda */
  time?: number
  /** Ajuste fino do vidro e do movimento */
  tuning?: Partial<LenteTuning>
  /** Nome acessível da marca */
  label?: string
}

type Live = { settings: LenteSettings; loop: boolean; speed: number; time?: number }

const OWN = ["tileSize", "logoScale", "finalScale", "logoOffset", "iconPlate", "keepPlate", "originalColors", "background", "plateColor", "logoColor", "hold"] as const

function resolve(o: LenteOptions): Live {
  const own: Partial<LenteSettings> = {}
  for (const k of OWN) if (o[k] !== undefined) Object.assign(own, { [k]: o[k] })
  return { settings: { ...LOOKS[o.look ?? "light"], ...own, ...o.tuning }, loop: o.loop ?? true, speed: o.speed ?? 1, time: o.time }
}

export function mountLente(el: HTMLElement, options: LenteOptions = {}) {
  let opts = options
  const live = { current: resolve(opts) }
  // undefined: ainda longe da tela; null: sem WebGL2 (fica a marca parada)
  let engine: ReturnType<typeof startEngine> | undefined
  let fallback: HTMLSpanElement | null = null
  let logoKey = ""
  let destroyed = false

  if (getComputedStyle(el).position === "static") el.style.position = "relative"
  Object.assign(el.style, { overflow: "hidden", isolation: "isolate", cursor: "pointer", userSelect: "none" })
  if (!el.hasAttribute("role")) el.setAttribute("role", "img")

  function paint() {
    el.style.backgroundColor = live.current.settings.background
    el.setAttribute("aria-label", opts.label ?? "Vedra")
    if (engine !== null) return
    const P = live.current.settings
    if (!fallback) {
      fallback = document.createElement("span")
      fallback.setAttribute("aria-hidden", "true")
      el.appendChild(fallback)
    }
    const size = P.tileSize * P.logoScale * P.finalScale * BOX
    const mask = `url("${logoUrl(opts.logo ?? VEDRA_MARK)}") center / contain no-repeat`
    fallback.style.cssText = `position:absolute;inset:0;margin:auto;display:block;width:${size}px;height:${size}px;max-width:40%;max-height:40%;background-color:${P.logoColor};-webkit-mask:${mask};mask:${mask}`
  }

  function loadCurrentLogo() {
    const logo = opts.logo ?? VEDRA_MARK
    if (logo === logoKey) return
    logoKey = logo
    loadLogo(logo).then(
      (data) => {
        if (!destroyed && logoKey === logo) engine?.setLogo(data)
      },
      (err) => console.error(err),
    )
  }

  paint()
  // O contexto e o campo de distância (~100 ms) só nascem quando o elemento chega a 400 px da tela.
  const near = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      near.disconnect()
      engine = startEngine(el, live)
      if (engine) loadCurrentLogo()
      else paint()
    },
    { rootMargin: "400px" },
  )
  near.observe(el)

  const onClick = () => engine?.replay()
  el.addEventListener("click", onClick)

  return {
    /** Troca as opções (todas de uma vez, como na primeira chamada) */
    update(next: LenteOptions) {
      opts = next
      live.current = resolve(next)
      paint()
      if (engine) {
        loadCurrentLogo()
        engine.invalidate()
      }
    },
    /** Toca a revelação de novo, do começo (o clique no elemento faz o mesmo) */
    replay() {
      engine?.replay()
    },
    destroy() {
      destroyed = true
      near.disconnect()
      el.removeEventListener("click", onClick)
      engine?.dispose()
      fallback?.remove()
    },
  }
}
```

  2. Crie components/lente/lente.tsx, na mesma pasta, com exatamente este conteúdo:

```tsx
'use client'

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react'
import { mountLente, type LenteOptions } from './lente-shader'

type Props = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & LenteOptions

/**
 * A marca revelada por uma gota de vidro. O canvas preenche o div inteiro e o ladrilho fica no meio, então o tamanho
 * vem do className ou do style: dê largura e altura ao bloco. O resto é do lente-shader.ts. O clique toca de novo.
 */
export function Lente({ logo, look, background, logoColor, plateColor, iconPlate, keepPlate, originalColors, tileSize, logoScale, finalScale, logoOffset, loop, hold, speed, time, tuning, label = 'Vedra', ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const lente = useRef<ReturnType<typeof mountLente> | null>(null)
  // As opções passam por JSON: objetos e listas escritos no JSX não refazem nada a cada render.
  const key = JSON.stringify({ logo, look, background, logoColor, plateColor, iconPlate, keepPlate, originalColors, tileSize, logoScale, finalScale, logoOffset, loop, hold, speed, time, tuning, label })
  const first = useRef(key)

  useEffect(() => {
    const l = mountLente(ref.current!, JSON.parse(first.current) as LenteOptions)
    lente.current = l
    return () => {
      lente.current = null
      l.destroy()
    }
  }, [])

  useEffect(() => {
    lente.current?.update(JSON.parse(key) as LenteOptions)
  }, [key])

  return <div ref={ref} role="img" aria-label={label} {...props} />
}
```

  3. Crie components/lente/lente-demo.tsx, na mesma pasta, com exatamente este conteúdo:

```tsx
import { Lente } from './lente'

/** A demo: a marca Vedra (fictícia) revelada pelo vidro, no meio de um fundo areia, na tela inteira. */
export default function LenteDemo() {
  return <Lente style={{ height: '100svh', minHeight: 420 }} />
}
```

  4. Mostre a demo numa página só dela, que ocupa a tela inteira:
     - Next.js (App Router): crie app/lente/page.tsx (ou src/app/lente/page.tsx) que só devolve <LenteDemo />. Se o layout envolver as páginas num container com padding ou largura máxima, a demo fica fora dele.
     - Vite ou outro React sem rotas: o App.tsx só devolve <LenteDemo />. Com react-router, uma rota /lente.
     - Nada de margem em volta: o body fica com margin: 0. Tire da página da demo os estilos globais de template que centralizam o body ou o #root, dão padding, largura máxima, cor de fundo ou cor de texto (os do create-vite e do create-next-app fazem isso). Pode remover esses estilos de exemplo se o projeto for novo.
  5. Rode o projeto e abra a demo.

Como usar no projeto
  <Lente logo={logoSvg} label="Sua marca" logoColor="#111111" background="#f2f0eb" className="abertura" />
  - logo é o SVG da marca em texto ('<svg …>…</svg>', por exemplo importado com ?raw no Vite) ou a URL de uma imagem (PNG com fundo transparente; de outro domínio, só com CORS liberado). Só a forma conta: a cor vem de logoColor. Com originalColors, o logo mantém as cores dele. Sem logo, entra a marca da demo (Vedra, fictícia).
  - É um <div> com as props de um div (className, style, id…). O canvas preenche o div inteiro e o ladrilho fica no meio, no máximo com tileSize px (260) e menor se o bloco for pequeno: dê largura e altura ao bloco (a tela inteira de uma abertura, a metade de um hero).
  - background é a cor que o canvas pinta: use a da página, para o bloco não aparecer como um retângulo. Com fundo claro o vidro é claro; com look="dark" ele vira vidro escuro sobre uma placa de ícone (plateColor), e o fundo vai a quase preto.
  - keepPlate termina no ícone de app (o vidro assenta numa placa) em vez do logo solto. loop={false} toca uma vez e para; hold é quanto a marca pronta fica antes da próxima volta; speed acelera ou freia tudo.
  - time congela a animação num segundo (0 a ~5,7 é uma volta inteira, com a pausa): serve para prender a revelação à rolagem.
  - label vai no aria-label: leitor de tela lê o nome da marca.
  - Com "reduzir movimento" ligado no sistema, fica um quadro parado com o vidro.

Ajustes
  Tamanho do logo: logoScale (0.62) é o logo dentro do ladrilho; finalScale (0.9) é quanto ele fica depois que o vidro sai. Logo largo (uma palavra) pede logoScale menor, uns 0.5.
  O vidro (em tuning, que mistura no preset): opticalDepth (1.15) é o quanto a borda curva o logo; dispersion (1.9) e colorBleed (1.4), o quanto ela abre em cores (0 dá um vidro sem arco-íris); corner (4.4) é o canto do ladrilho (2 é círculo, 5 é ícone de app).
  O ritmo (em tuning): glide (2.5) é quanto o logo leva para sair do aumento da gota; present (2.7), quanto o vidro segura o logo; bounce (0.06), o embalo da gota ao pousar.
  Exemplo: <Lente tuning={{ dispersion: 1, present: 2 }} />.

Verificação
  - O typecheck (npx tsc --noEmit) e o build passam, e o console do navegador fica limpo.
  - A página da demo é um fundo areia com uma gota de vidro que cai no meio, vira um ladrilho claro de cantos suaves e mostra a gema verde da Vedra grande, curvada e com fios de azul e de amarelo na borda do vidro; uma faixa de luz passa pelo vidro, ele se desfaz e fica a gema verde, menor e nítida, no meio. Depois de uma pausa, a gema desfoca e tudo começa de novo.
  - Clicar na demo toca a revelação do começo.
  - Mudar o tamanho da janela mantém o ladrilho no meio e inteiro.
  - Com "reduzir movimento" ligado no sistema, fica um quadro parado com o vidro.

Ao terminar, diga o endereço em que a demo abriu e o caminho de cada arquivo criado.