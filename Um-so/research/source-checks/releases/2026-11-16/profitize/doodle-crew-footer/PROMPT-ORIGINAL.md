# Doodle Crew Footer — ProfitizeBuild
Objetivo: o rodapé de um site em React desenhado como a última página de um caderno de rascunhos: o nome da marca enorme, carimbado de ponta a ponta em tinta de pincel seco, e uma turma de personagens desenhados à mão morando nas letras (um encostado na primeira, outro sentado lá em cima com as pernas balançando, outro espiando por cima da borda), com desenhinhos de tinta caindo em volta. Quando o rodapé entra na tela, ele toca como um storyboard curto: a linha do chão se desenha, as letras são carimbadas uma a uma com um sopro de tinta, a turma aparece, os desenhinhos começam a cair e a frase e os botões sobem por último. Depois ele continua vivo: os olhos de todos seguem o ponteiro e piscam, as linhas tremem como desenho animado feito à mão, as letras balançam com o mouse em cima, o clique num personagem o faz pular e dizer a fala dele, e os desenhinhos fogem do ponteiro e estouram quando você pega um. A demo mostra a marca fictícia Construa, um estúdio que faz um jogo de construir desenhado à mão.

Contexto
  A palavra é texto SVG, uma letra por vez, com um filtro SVG de tinta (as bordas tremidas, os riscos do pincel seco e os furinhos). A largura de cada letra é medida com o measureText de um canvas na fonte de verdade, e medida de novo quando uma fonte da web chega atrasada, então a turma fica no lugar certo com qualquer fonte.
  A turma é desenhada no código, em SVG: yeti, kid (a criança de chapéu), bird, cat (o gato pirata), ghost e mushroom. Cada um mora numa letra, num de três lugares: front (no chão, na frente dela), top (sentado na borda de cima) ou behind (subindo de trás, só o alto aparece). Os olhos são mirados pelo código a cada quadro, para o ponteiro (ou, sem ele, para algum lugar e de vez em quando para um vizinho), e piscam. O tremor das linhas é a troca, a 8 quadros por segundo, de três filtros de turbulência sobre a turma e o chão.
  Os desenhinhos também são desenhados no código: brick (o tijolo), hammer (o martelo), pencil (o lápis), bulb (a lâmpada), gear (a engrenagem), cone (o cone de obra), house (a casinha) e paint (a lata de tinta). Eles caem, cada um na sua velocidade, balançando; o ponteiro os empurra para longe num raio de 110 px; o clique ou o toque estoura um deles, que volta pelo alto depois; e quem sai pela borda de baixo volta pela de cima.
  O storyboard toca uma vez, quando um oitavo do rodapé aparece na tela. Com o reduzir movimento do sistema ligado, tudo já aparece pronto, sem o tremor e sem a queda. O rodapé é um contêiner (container queries): com 860 px de largura ou menos (do rodapé, não da tela), a faixa de cima empilha e as colunas viram duas; com 480 px ou menos, os botões encolhem e o "Voltar ao topo" vira só a seta. As medidas usam a largura do layout (clientWidth), então ele continua certo dentro de um transform: scale.
  São dois arquivos. O rodapé (components/ui/doodle-crew-footer.tsx) tem os tipos, as contas (funções puras, exportadas), os desenhos da turma e dos desenhinhos e o CSS. A demo (components/doodle-crew-footer-demo.tsx) só põe o rodapé na largura toda.
  React (18 ou 19) e TypeScript, sem dependências. Sem Tailwind nem shadcn: o CSS mora no rodapé, numa <style>, com classes dcf-*. Nada é baixado: as fontes são as da pilha que o sistema já tiver ("Arial Black" na palavra, "Iowan Old Style", Palatino ou Georgia na frase), e não há imagem nenhuma.

Antes de começar
  Olhe a stack do projeto:
  - React com TypeScript (Next.js, Vite, Remix, Astro com React…): siga os passos abaixo. Os arquivos começam com "use client", que o Next.js exige e os outros ignoram.
  - React sem TypeScript: crie os arquivos como .jsx e tire só as anotações de tipo (os blocos type e interface, os ": Tipo", os "as Tipo", o "type" dentro do import da demo e os genéricos <…>). Não mude mais nada.
  - Sem React (HTML puro, Vue, Svelte, Angular…): pare e me avise antes de fazer qualquer coisa; este componente é React.
  Os arquivos vão na pasta de componentes do projeto (src/components ou components). O rodapé fica numa subpasta ui, como na estrutura do shadcn; se o projeto já tem components/ui, use essa.
  Não instale nada: o rodapé só usa o React.
  Mesmo que o projeto use Tailwind ou shadcn, não converta o CSS em classes utilitárias, não o mova para um .css separado e não troque os desenhos por imagens.

Implementação
  1. Crie components/ui/doodle-crew-footer.tsx com exatamente o conteúdo abaixo. Copie o arquivo inteiro, sem abreviar, sem reformatar, sem traduzir, sem renomear e sem "melhorar" nada, inclusive os desenhos e o CSS:

```tsx
"use client"

import * as React from "react"

/*
 * Doodle Crew Footer — o rodapé de um site desenhado como a última página de um
 * caderno de rascunhos. O nome da marca vem carimbado de ponta a ponta, em tinta de
 * pincel seco, e uma turma de personagens desenhados à mão mora nas letras: um se
 * encosta na primeira, outro senta lá em cima com as pernas balançando, outro espia
 * por cima da borda. Desenhinhos de tinta (tijolos, lápis, engrenagens) caem em volta.
 *
 * Quando o rodapé entra na tela, ele toca como um storyboard curto: a linha do chão se
 * desenha, as letras são carimbadas uma a uma com um sopro de tinta, a turma aparece
 * (sobe do chão, cai sentada ou sobe de trás da letra), os desenhinhos começam a cair e
 * a frase e os botões sobem por último.
 *
 * Depois ele continua vivo: todos os olhos seguem o ponteiro (e piscam), as linhas
 * tremem como desenho animado feito à mão, as letras balançam com o mouse em cima, o
 * clique num personagem o faz pular e dizer a fala dele, e os desenhinhos fogem do
 * ponteiro e estouram quando você pega um.
 *
 * Sem dependências e nada é baixado: o React é o único import, todo desenho é SVG no
 * próprio código e a textura da tinta é um filtro SVG.
 */

// As contas, puras: o arranjo da palavra, o lugar da turma, o olhar, a queda dos desenhinhos e o tempo do storyboard.

/** Um hash pequeno e determinístico → [0, 1): todo render arma a cena do mesmo jeito. */
export const hash = (n: number): number => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v)

/**
 * Arma a palavra a partir do avanço de cada letra (em unidades da fonte): a borda
 * esquerda de cada letra, com o `tracking` (em em) somado entre elas, e a largura
 * total. Um avanço inválido ou negativo conta como zero, para uma letra ruim não jogar a
 * palavra inteira para fora da página.
 */
export const layoutWord = (advances: number[], tracking: number, fontSize: number): { x: number[]; w: number[]; width: number } => {
  const x: number[] = []
  const w: number[] = []
  let at = 0
  const gap = (Number.isFinite(tracking) ? tracking : 0) * fontSize
  for (let i = 0; i < advances.length; i++) {
    const a = Number.isFinite(advances[i]) && advances[i] > 0 ? advances[i] : 0
    x.push(at)
    w.push(a)
    at += a + (i < advances.length - 1 ? gap : 0)
  }
  return { x, w, width: Math.max(0, at) }
}

export type Seat = "front" | "top" | "behind"

/**
 * Onde fica cada um da turma, em unidades da palavra (linha de base em y = 0, para
 * cima é negativo). `front` fica no chão, na frente da letra; `top` senta na borda de
 * cima dela; `behind` sobe de trás da letra, e só o alto aparece acima da borda.
 * `offset` desliza ao longo da letra, em larguras de letra.
 */
export const seatPoint = (seat: Seat, letterX: number, letterW: number, cap: number, offset: number, scale: number): { x: number; y: number } => {
  const x = letterX + letterW * (0.5 + (Number.isFinite(offset) ? offset : 0))
  if (seat === "top") return { x, y: -cap }
  if (seat === "behind") return { x, y: -cap + 30 * scale }
  return { x, y: 0 }
}

/**
 * Onde a pupila fica dentro do olho: apontada para o alvo, nunca a mais de `max` do
 * centro, e mais perto do centro quando o alvo chega perto, para o olho não pular
 * quando o ponteiro está bem em cima do rosto.
 */
export const lookAt = (ex: number, ey: number, tx: number, ty: number, max: number, reach: number): { x: number; y: number } => {
  const dx = tx - ex
  const dy = ty - ey
  const d = Math.hypot(dx, dy)
  if (!Number.isFinite(d) || d < 1e-6 || max <= 0) return { x: 0, y: 0 }
  const k = (max * Math.min(1, d / Math.max(1e-6, reach))) / d
  return { x: dx * k, y: dy * k }
}

export type Floater = {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  fall: number
  phase: number
  /** Os segundos que faltam do estouro; 0 é vivo. */
  pop: number
}

/**
 * Um passo da queda de um desenhinho: ele cai na velocidade dele e balança, o ponteiro
 * o empurra para longe dentro de `radius`, ele volta aos poucos à queda quando é solto
 * e dá a volta na caixa, para o céu nunca esvaziar. O que estourou espera o tempo dele e
 * volta pelo alto. `rand` dá o x novo na volta.
 */
export const stepFloater = (
  f: Floater,
  dt: number,
  t: number,
  w: number,
  h: number,
  px: number,
  py: number,
  radius: number,
  rand: () => number,
): Floater => {
  const step = clamp(Number.isFinite(dt) ? dt : 0, 0, 0.05)
  const m = 40
  if (f.pop > 0) {
    f.pop -= step
    if (f.pop <= 0) {
      f.pop = 0
      f.x = rand() * w
      f.y = -m
      f.vx = 0
      f.vy = f.fall
    }
    return f
  }
  const sway = Math.sin(t * 0.7 + f.phase) * 14
  if (Number.isFinite(px) && Number.isFinite(py) && radius > 0) {
    const dx = f.x - px
    const dy = f.y - py
    const d = Math.hypot(dx, dy)
    if (d < radius && d > 0.01) {
      const k = (1 - d / radius) * (1 - d / radius) * 2400
      f.vx += (dx / d) * k * step
      f.vy += (dy / d) * k * step
      f.vr += (dx > 0 ? 1 : -1) * k * 0.004 * step
    }
  }
  const ease = Math.min(1, step * 2.4)
  f.vx += (sway - f.vx) * ease
  f.vy += (f.fall - f.vy) * ease
  f.vr += (Math.sin(f.phase * 3) * 18 - f.vr) * Math.min(1, step * 0.8)
  f.x += f.vx * step
  f.y += f.vy * step
  f.rot = (f.rot + f.vr * step) % 360
  if (f.y > h + m) {
    f.y = -m
    f.x = rand() * w
  } else if (f.y < -m * 3) {
    f.y = h + m
  }
  if (f.x < -m) f.x = w + m
  else if (f.x > w + m) f.x = -m
  return f
}

/**
 * O storyboard, em ms a partir de quando o rodapé entra na tela: a linha do chão se
 * desenha, as letras são carimbadas da esquerda para a direita, a turma chega depois da
 * palavra, e então os desenhinhos, a frase palavra por palavra e os botões.
 */
export const timeline = (letters: number, crew: number, words: number, actions: number) => {
  const L = Math.max(0, Math.floor(letters) || 0)
  const C = Math.max(0, Math.floor(crew) || 0)
  const W = Math.max(0, Math.floor(words) || 0)
  const A = Math.max(0, Math.floor(actions) || 0)
  const letter = (i: number) => 160 + i * 80
  const crewStart = letter(Math.max(0, L - 1)) + 420
  const member = (j: number) => crewStart + j * 130
  const doodles = crewStart + Math.max(0, C - 1) * 130 * 0.5
  const copy = crewStart + 260
  const word = (k: number) => copy + k * 45
  const actionsStart = word(W) + 120
  const action = (k: number) => actionsStart + k * 110
  const total = Math.max(member(Math.max(0, C - 1)) + 720, action(Math.max(0, A - 1)) + 600, letter(Math.max(0, L - 1)) + 560)
  return { ground: 60, letter, crewStart, member, doodles, word, action, total }
}

export type CrewKind = "yeti" | "kid" | "bird" | "cat" | "ghost" | "mushroom"
export type DoodleKind = "brick" | "hammer" | "pencil" | "bulb" | "gear" | "cone" | "house" | "paint"
export type DoodleCrewPreset = "auto" | "paper" | "night" | "riso" | "sunny"

export interface CrewMember {
  kind: CrewKind
  /** O índice da letra da palavra em que ele mora. */
  letter: number
  /** `front` fica na frente da letra, `top` senta nela, `behind` espia por cima. O padrão depende do tipo. */
  seat?: Seat
  /** Desliza ao longo da letra, em larguras de letra. 0 é o meio. */
  offset?: number
  /** O tamanho em relação à letra. Padrão: 1. */
  scale?: number
  /** Vira para o outro lado. */
  flip?: boolean
  /** Entra no rótulo acessível. */
  name?: string
  /** O que ele diz no clique. */
  says?: string
}

export interface FooterLink {
  label: string
  href?: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export interface FooterAction {
  label: string
  href?: string
  icon?: DoodleKind
  variant?: "solid" | "outline"
  onClick?: () => void
}

export interface DoodleCrewFooterProps {
  /** A palavra gigante. Curta, em maiúsculas: de 4 a 9 letras fica melhor. */
  wordmark?: string
  /** O nome da marca, no canto de cima à esquerda. */
  brand?: string
  /** Uma ou duas frases embaixo da marca. */
  blurb?: string
  /** A frase embaixo da palavra. */
  tagline?: string
  columns?: FooterColumn[]
  /** Os botões em pílula embaixo da frase. */
  actions?: FooterAction[]
  /** A barra de baixo, à esquerda. */
  copyright?: string
  legal?: FooterLink[]
  socials?: FooterLink[]
  /** Mostra o botão de voltar ao topo na barra de baixo. Padrão: true. */
  backToTop?: boolean
  crew?: CrewMember[]
  /** Quais desenhinhos caem em volta da palavra. A lista vazia os desliga. */
  doodles?: DoodleKind[]
  /** Quantos desenhinhos de uma vez. Padrão: 12. */
  doodleCount?: number
  /** `auto` segue os tokens --color-background e --color-foreground da página. */
  preset?: DoodleCrewPreset
  palette?: { background?: string; ink?: string; accent?: string }
  /** A fonte da palavra. As grotescas bem pesadas carimbam melhor. */
  fontFamily?: string
  /** A fonte da frase e do texto da marca. */
  serifFamily?: string
  /** O espaço entre as letras da palavra, em em. Padrão: -0,02. */
  tracking?: number
  /** A brincadeira do ponteiro, do hover e do clique. Padrão: true. */
  interactive?: boolean
  /** Falso transforma os links e os botões em texto, para o rodapé caber dentro de outro link. Padrão: true. */
  links?: boolean
  /** A altura mínima, um comprimento definido. O rodapé passa dela se o conteúdo precisar. */
  height?: string
  className?: string
}

const PRESETS = {
  auto: { background: "var(--color-background, #ffffff)", ink: "var(--color-foreground, #0d0d0d)", accent: "#ff6b2c" },
  paper: { background: "#ffffff", ink: "#0d0d0d", accent: "#ff6b2c" },
  night: { background: "#0e0e10", ink: "#f4f1ea", accent: "#ff8a3d" },
  riso: { background: "#f4f2ff", ink: "#2433c9", accent: "#ff4f8b" },
  sunny: { background: "#ffd94a", ink: "#141414", accent: "#e8402a" },
}

// A turma de fábrica, nas letras de CONSTRUA: o yeti encostado no C, o passarinho no alto do O, o cogumelo na frente
// do N, a criança sentada no T, o fantasma espiando por trás do R e o gato pirata na frente do A.
const DEFAULT_CREW: CrewMember[] = [
  { kind: "yeti", letter: 0, seat: "front", offset: -0.32, name: "Bruno", says: "Tô com fome. Tijolo conta?" },
  { kind: "bird", letter: 1, seat: "top", offset: 0.02, name: "Piu", says: "Piu! Segue a gente. Sério." },
  { kind: "mushroom", letter: 2, seat: "front", offset: 0.12, scale: 0.95, name: "Cogu", says: "Não sou venenoso. Juro." },
  { kind: "kid", letter: 4, seat: "top", offset: -0.05, name: "Juno", says: "Aqui em cima! Melhor lugar da casa." },
  { kind: "ghost", letter: 5, seat: "behind", offset: -0.08, name: "Bu", says: "Bu! …desculpa. Oi." },
  { kind: "cat", letter: 7, seat: "front", offset: 0.42, flip: true, name: "Capitão", says: "Arr. Belo cursor." },
]

const DEFAULT_COLUMNS: FooterColumn[] = [
  { title: "Jogar", links: [{ label: "Baixar", href: "#" }, { label: "Notas da versão", href: "#" }, { label: "Próximos passos", href: "#" }, { label: "Wiki", href: "#" }] },
  { title: "Loja", links: [{ label: "Adesivos", href: "#" }, { label: "Pelúcias", href: "#" }, { label: "Pôsteres", href: "#" }, { label: "Vale-presente", href: "#" }] },
  { title: "Comunidade", links: [{ label: "Discord", href: "#" }, { label: "Fan art", href: "#" }, { label: "Eventos", href: "#" }, { label: "Criadores", href: "#" }] },
  { title: "Estúdio", links: [{ label: "Sobre", href: "#" }, { label: "Vagas", href: "#" }, { label: "Imprensa", href: "#" }, { label: "Contato", href: "#" }] },
]

const DEFAULT_ACTIONS: FooterAction[] = [
  { label: "Pegar o pacote de adesivos", href: "#", icon: "pencil", variant: "outline" },
  { label: "Jogar grátis", href: "#", icon: "hammer", variant: "solid" },
]

const DEFAULT_DOODLES: DoodleKind[] = ["brick", "hammer", "pencil", "gear", "bulb", "cone", "house", "paint"]

const ACCENT = {
  brick: "#e8673a",
  brickTop: "#f4936a",
  brickSide: "#c4522b",
  wood: "#e0a35e",
  steel: "#a8b3bf",
  steelDark: "#7f8a96",
  pencil: "#ffd23f",
  eraser: "#ff8fa3",
  ferrule: "#c9d1d9",
  shaving: "#f6c99a",
  glass: "#ffe066",
  socket: "#b8c2cc",
  gear: "#4fb6e8",
  cone: "#ff7a1a",
  coneBase: "#e2560d",
  stripe: "#ffffff",
  wall: "#fff1d6",
  roof: "#e8402a",
  can: "#c9d1d9",
  paint: "#ff5c7a",
}

// ---- os desenhos da turma ----------------------------------------------------------
// Cada tipo é desenhado nas unidades dele: o centro da base em (0, 0), para cima é
// negativo, umas 144 unidades para a altura de uma maiúscula. Os olhos vêm à parte, para
// quem desenha poder mirá-los e piscá-los.

type Eye = { x: number; y: number; r: number; pupil: number; max: number }
type Art = {
  /** O tamanho em relação às letras, antes da escala do próprio personagem. */
  k: number
  box: { l: number; r: number; t: number; b: number }
  eyes: Eye[]
  seat: Seat
  body: (hatch: string) => React.ReactNode
  front?: () => React.ReactNode
  idle?: string
}

const ART: { [k: string]: Art } = {
  yeti: {
    k: 1,
    box: { l: -72, r: 60, t: -140, b: 6 },
    seat: "front",
    eyes: [
      { x: -15, y: -86, r: 8, pupil: 3.6, max: 3.6 },
      { x: 13, y: -88, r: 8, pupil: 3.6, max: 3.6 },
    ],
    body: (hatch) => (
      <>
        <ellipse className="dcf-shadow" cx="0" cy="2" rx="54" ry="5" />
        <path d="M-40 -92 C-62 -92 -70 -76 -68 -56 L-66 -30 C-64 -18 -54 -16 -44 -20 Z" />
        <path d="M-40 -92 C-62 -92 -70 -76 -68 -56 L-66 -30 C-64 -18 -54 -16 -44 -20 Z" fill={hatch} stroke="none" />
        <path className="n" d="M-67 -64 C-58 -59 -50 -59 -43 -64" />
        <path d="M-30 -104 C-40 -112 -44 -124 -40 -138 C-32 -129 -22 -122 -13 -114 Z" />
        <path d="M18 -114 C26 -124 36 -130 47 -133 C45 -120 41 -110 32 -101 Z" />
        <path className="n" d="M-38 -124 L-28 -119 M39 -125 L33 -116" />
        <path d="M-44 -2 C-54 -28 -54 -66 -42 -90 C-32 -110 -14 -118 2 -118 C22 -118 40 -108 48 -88 C58 -64 58 -28 48 -2 C30 4 -26 4 -44 -2 Z" />
        <path d="M40 -96 C54 -66 54 -30 46 -4 C40 -2 34 -1 30 0 C40 -30 42 -64 33 -101 Z" fill={hatch} stroke="none" />
        <path className="n" d="M-7 -117 C-5 -126 1 -128 3 -120 C5 -127 11 -126 11 -116" />
        <path className="n thin" d="M-14 -24 l-3 4 M8 -40 l3 4 M14 -46 l3 3 M20 -30 l3 3" />
        <path className="n" d="M-48 -62 C-22 -50 10 -32 49 -26 M-50 -52 C-24 -40 8 -22 49 -16" />
        <rect x="-12" y="-46" width="15" height="13" rx="2.5" transform="rotate(26 -4.5 -39.5)" />
        <path d="M-46 -60 C-62 -50 -63 -29 -51 -19 C-45 -15 -38 -19 -40 -28 C-43 -36 -40 -46 -36 -52" />
        <path d="M46 -58 C61 -46 61 -26 51 -18 C45 -14 38 -18 40 -26 C43 -34 41 -44 37 -50" />
        <path d="M-37 -2 C-41 -14 -23 -19 -16 -7 C-14 0 -26 4 -37 -2 Z" />
        <path d="M37 -2 C41 -14 23 -19 16 -7 C14 0 26 4 37 -2 Z" />
        <path className="n thin" d="M-30 -4 l1 -4 M-24 -3 l1 -4 M30 -4 l-1 -4 M24 -3 l-1 -4" />
        <path className="n" d="M-23 -98 L-9 -96 M6 -98 L20 -100" />
        <path className="n" d="M-12 -70 C-6 -64 6 -64 12 -71" />
        <path d="M3 -66.5 L5.5 -60 L8 -67.5 Z" />
      </>
    ),
  },
  kid: {
    k: 1.28,
    box: { l: -30, r: 30, t: -88, b: 42 },
    seat: "top",
    eyes: [
      { x: -6, y: -58, r: 0, pupil: 2.5, max: 1.8 },
      { x: 6.5, y: -58, r: 0, pupil: 2.5, max: 1.8 },
    ],
    body: (hatch) => (
      <>
        <path d="M-15 -6 L-3 -6 C-3 8 -5 20 -6 30 L-15 30 C-15 18 -16 6 -15 -6 Z" />
        <path d="M3 -6 L15 -6 C17 6 19 16 22 27 L12 30 C10 18 6 6 3 -6 Z" />
        <path d="M3 -6 L15 -6 C17 6 19 16 22 27 L12 30 C10 18 6 6 3 -6 Z" fill={hatch} stroke="none" />
        <path className="k" d="M-17 30 C-20 34 -20 40 -14 41 L-2 41 C2 40 0 34 -5 30 Z" />
        <path className="k" d="M11 29 C8 34 10 40 16 40 L26 38 C29 36 27 30 22 27 Z" />
        <path d="M-20 -4 C-22 -20 -18 -38 -10 -44 L10 -44 C18 -38 22 -20 20 -4 Z" />
        <path className="n thick" d="M-19.5 -14 L19.5 -14 M-18.5 -26 L18.5 -26 M-14 -36 L14 -36" />
        <path className="n" d="M-18 -36 C-28 -28 -30 -14 -26 -5" />
        <circle cx="-26" cy="-3" r="4" />
        <path className="n" d="M18 -36 C27 -30 30 -18 28 -7" />
        <circle cx="28" cy="-4" r="4" />
        <circle cx="-17" cy="-58" r="4" />
        <circle cx="17" cy="-58" r="4" />
        <circle cx="0" cy="-60" r="17" />
        <path className="n thin" d="M-11 -52 l2 -2 M-8 -52 l2 -2 M8 -52 l2 -2 M11 -52 l2 -2" />
        <path className="n" d="M-5 -50 C-2 -47 2 -47 5 -50" />
        <path d="M-15 -70 C-14 -87 14 -87 15 -70 Z" />
        <path d="M-27 -68 C-16 -75 16 -75 27 -68 C18 -63 -18 -63 -27 -68 Z" />
        <path className="n thick" d="M-14.5 -74 C-6 -77 6 -77 14.5 -74" />
      </>
    ),
  },
  bird: {
    k: 1.22,
    box: { l: -34, r: 30, t: -62, b: 2 },
    seat: "top",
    eyes: [
      { x: 3, y: -30, r: 4.6, pupil: 2.3, max: 2 },
      { x: 12, y: -31, r: 4.6, pupil: 2.3, max: 2 },
    ],
    idle: "dcf-peck",
    body: (hatch) => (
      <>
        <path className="n" d="M-5 0 L-5 -7 M-9 0 L-1 0 M5 0 L5 -7 M1 0 L9 0" />
        <path d="M-17 -16 C-26 -18 -31 -14 -33 -9 C-26 -10 -20 -8 -15 -10 Z" />
        <path d="M-18 -14 C-20 -30 -10 -40 2 -40 C16 -40 22 -28 20 -16 C18 -6 8 -4 0 -4 C-10 -4 -17 -8 -18 -14 Z" />
        <path d="M-11 -25 C-3 -26 1 -18 -3 -13 C-9 -12 -15 -17 -11 -25 Z" fill={hatch} />
        <path className="o" d="M19 -30 L29 -27 L19 -23 Z" />
        <path className="a" d="M-3 -38 L4 -59 L12 -37 Z" />
        <path className="n thin" d="M-1 -44 L10 -46 M1 -51 L8 -52" />
        <circle cx="4" cy="-60" r="2.8" />
      </>
    ),
  },
  cat: {
    k: 1.06,
    box: { l: -30, r: 52, t: -110, b: 4 },
    seat: "front",
    eyes: [{ x: 10, y: -76, r: 6, pupil: 2.8, max: 2.6 }],
    body: (hatch) => (
      <>
        <ellipse className="dcf-shadow" cx="4" cy="2" rx="32" ry="4" />
        <g className="dcf-tail">
          <path d="M18 -4 C42 -4 52 -24 46 -44 C44 -51 36 -53 34 -46 C40 -30 34 -16 16 -14 Z" />
          <path className="n thin" d="M40 -16 l5 4 M45 -30 l6 1 M43 -42 l6 -3" />
        </g>
        <path d="M-22 0 C-28 -18 -24 -42 -14 -52 L14 -52 C24 -42 28 -18 22 0 C10 3 -10 3 -22 0 Z" />
        <path d="M14 -46 C24 -36 26 -16 22 0 C18 1 14 2 12 2 C16 -14 16 -32 10 -46 Z" fill={hatch} stroke="none" />
        <path className="n" d="M-8 -30 L-9 -1 M8 -30 L9 -1" />
        <path d="M-16 1 C-16 -5 -3 -5 -3 1 Z M3 1 C3 -5 16 -5 16 1 Z" />
        <path className="a" d="M-18 -55 C-6 -49 6 -49 18 -55 L17 -46 C6 -40 -6 -40 -17 -46 Z" />
        <path className="a" d="M9 -45 L18 -32 L6 -37 Z" />
        <path d="M-22 -86 L-25 -107 L-7 -96 Z" />
        <path d="M8 -96 L23 -108 L22 -86 Z" />
        <path className="n thin" d="M-20 -92 L-21 -101 M18 -101 L18 -92" />
        <path d="M-26 -70 C-28 -88 -16 -98 0 -98 C16 -98 28 -88 26 -70 C24 -56 12 -50 0 -50 C-12 -50 -24 -56 -26 -70 Z" />
        <path className="n thin" d="M-4 -97 L-3 -90 M3 -97 L3 -91" />
        <path className="n" d="M-26 -80 C-14 -83 4 -87 25 -93" />
        <ellipse className="k" cx="-10" cy="-76" rx="7.5" ry="6.5" />
        <path className="k" d="M-2.5 -68 L2.5 -68 L0 -64.5 Z" />
        <path className="n" d="M0 -64.5 C-1 -60.5 -5 -60.5 -6 -62.5 M0 -64.5 C1 -60.5 5 -60.5 6 -62.5" />
        <path className="n thin" d="M-15 -66 L-29 -68 M-15 -63 L-28 -59 M15 -66 L29 -68 M15 -63 L28 -59" />
      </>
    ),
  },
  ghost: {
    k: 1.3,
    box: { l: -26, r: 26, t: -70, b: 0 },
    seat: "behind",
    eyes: [
      { x: -8, y: -44, r: 6.5, pupil: 3.2, max: 3 },
      { x: 9, y: -44, r: 6.5, pupil: 3.2, max: 3 },
    ],
    idle: "dcf-bob",
    body: (hatch) => (
      <>
        <path d="M-23 -14 L-23 -40 C-23 -59 -12 -67 0 -67 C12 -67 23 -59 23 -40 L23 -14 C12 -10 -12 -10 -23 -14 Z" />
        <path d="M13 -61 C21 -54 23 -46 23 -36 L23 -15 L15 -13 L15 -36 C15 -46 15 -54 13 -61 Z" fill={hatch} stroke="none" />
        <path className="n thin" d="M-16 -56 C-12 -61 -6 -63 -2 -63" />
        <path className="k" d="M-5 -33 C-3 -27 4 -27 6 -33 Z" />
        <path className="n thin" d="M-17 -35 l3 -2 M-14 -34 l3 -2 M14 -35 l3 -2 M17 -34 l3 -2" />
      </>
    ),
    front: () => (
      <>
        <path d="M-25 -32 C-27 -38 -21 -42 -17 -38 C-15 -42 -10 -41 -10 -36 L-11 -30 C-15 -28 -22 -28 -25 -32 Z" />
        <path d="M25 -32 C27 -38 21 -42 17 -38 C15 -42 10 -41 10 -36 L11 -30 C15 -28 22 -28 25 -32 Z" />
      </>
    ),
  },
  mushroom: {
    k: 1.12,
    box: { l: -27, r: 27, t: -56, b: 4 },
    seat: "front",
    eyes: [
      { x: -4.5, y: -16, r: 0, pupil: 1.9, max: 1.3 },
      { x: 4.5, y: -16, r: 0, pupil: 1.9, max: 1.3 },
    ],
    idle: "dcf-sway",
    body: (hatch) => (
      <>
        <ellipse className="dcf-shadow" cx="0" cy="2" rx="18" ry="3" />
        <path className="n" d="M-10 -15 L-17 -9 M10 -15 L17 -11" />
        <path d="M-10 0 C-12 -10 -10 -22 -8 -28 L8 -28 C10 -22 12 -10 10 0 C4 2 -4 2 -10 0 Z" />
        <path d="M5 -27 C9 -20 11 -10 10 0 C8 1 6 1.5 4 1.5 C6 -8 6 -18 2 -27 Z" fill={hatch} stroke="none" />
        <path className="r" d="M-25 -28 C-27 -45 -12 -55 0 -55 C12 -55 27 -45 25 -28 C14 -23 -14 -23 -25 -28 Z" />
        <circle cx="-12" cy="-40" r="4.2" />
        <circle cx="6" cy="-46" r="3.4" />
        <circle cx="15" cy="-34" r="3" />
        <circle cx="-2" cy="-33" r="2.4" />
        <path className="n" d="M-2 -10 C-1 -8 1 -8 2 -10" />
      </>
    ),
  },
}

/** Cada desenhinho numa caixa de 32 unidades, com o centro em (0, 0). */
const Doodle = ({ kind }: { kind: DoodleKind }) => {
  switch (kind) {
    case "brick":
      return (
        <>
          <path fill={ACCENT.brickTop} d="M-12.5 -2.5 L-6.5 -9 L13 -9 L7 -2.5 Z" />
          <path fill={ACCENT.brickSide} d="M7 -2.5 L13 -9 L13 3 L7 9.5 Z" />
          <path fill={ACCENT.brick} d="M-12.5 -2.5 L7 -2.5 L7 9.5 L-12.5 9.5 Z" />
          <path fill="none" strokeWidth="1.2" d="M-9 1.5 L-5.5 1.5 M-1.5 5.5 L3 5.5 M-3.5 -6 L1 -6" />
        </>
      )
    case "hammer":
      return (
        <g transform="rotate(-38)">
          <path fill={ACCENT.wood} d="M-2.3 -4 L2.3 -4 L2.7 12.5 C2.7 14.6 -2.7 14.6 -2.7 12.5 Z" />
          <path fill="none" strokeWidth="1.2" d="M-2.5 7.5 L2.5 7.5 M-2.6 10 L2.6 10" />
          <path fill={ACCENT.steel} d="M-11 -11.5 L7 -11.5 C9.6 -11.5 11 -10 11 -7.8 C11 -5.6 9.6 -4 7 -4 L-11 -4 Z" />
          <path fill={ACCENT.steelDark} d="M-13.5 -12.5 L-11 -12.5 L-11 -3 L-13.5 -3 Z" />
        </g>
      )
    case "pencil":
      return (
        <g transform="rotate(-40)">
          <path fill={ACCENT.eraser} d="M-11 -3.6 L-13 -3.6 C-15 -3.6 -15.6 -2 -15.6 0 C-15.6 2 -15 3.6 -13 3.6 L-11 3.6 Z" />
          <path fill={ACCENT.ferrule} d="M-11 -3.6 L-7.6 -3.6 L-7.6 3.6 L-11 3.6 Z" />
          <path fill={ACCENT.pencil} d="M-7.6 -3.6 L8 -3.6 L8 3.6 L-7.6 3.6 Z" />
          <path fill="none" strokeWidth="1.1" d="M-7.6 0 L8 0" />
          <path fill={ACCENT.shaving} d="M8 -3.6 L14.8 0 L8 3.6 Z" />
          <path style={{ fill: "var(--dcf-ink)" }} d="M12.3 -1.3 L14.8 0 L12.3 1.3 Z" />
        </g>
      )
    case "bulb":
      return (
        <>
          <path fill="none" d="M-12.5 -11 L-10.5 -9.4 M12.5 -11 L10.5 -9.4 M0 -15.6 L0 -13.6" />
          <path fill={ACCENT.glass} d="M0 -12 C5.8 -12 9.4 -8 9.4 -3.4 C9.4 0.4 6.6 2.6 5 5 L-5 5 C-6.6 2.6 -9.4 0.4 -9.4 -3.4 C-9.4 -8 -5.8 -12 0 -12 Z" />
          <path fill="none" strokeWidth="1.3" d="M-2.6 5 L-1.6 -1 L0 0.8 L1.6 -1 L2.6 5" />
          <path fill="none" strokeWidth="1.2" d="M-5.6 -6.8 C-4.8 -8.6 -3.2 -9.6 -1.4 -9.8" />
          <path fill={ACCENT.socket} d="M-4.8 5 L4.8 5 L4.4 10.6 C4.2 12.2 -4.2 12.2 -4.4 10.6 Z" />
          <path fill="none" strokeWidth="1.2" d="M-4.6 7.8 L4.6 7.8" />
        </>
      )
    case "gear":
      return (
        <path
          fill={ACCENT.gear}
          fillRule="evenodd"
          d="M-2.4 -9.3 L-1.9 -12.5 A12.6 12.6 0 0 1 1.9 -12.5 L2.4 -9.3 A9.6 9.6 0 0 1 4.9 -8.3 L7.5 -10.1 A12.6 12.6 0 0 1 10.1 -7.5 L8.3 -4.9 A9.6 9.6 0 0 1 9.3 -2.4 L12.5 -1.9 A12.6 12.6 0 0 1 12.5 1.9 L9.3 2.4 A9.6 9.6 0 0 1 8.3 4.9 L10.1 7.5 A12.6 12.6 0 0 1 7.5 10.1 L4.9 8.3 A9.6 9.6 0 0 1 2.4 9.3 L1.9 12.5 A12.6 12.6 0 0 1 -1.9 12.5 L-2.4 9.3 A9.6 9.6 0 0 1 -4.9 8.3 L-7.5 10.1 A12.6 12.6 0 0 1 -10.1 7.5 L-8.3 4.9 A9.6 9.6 0 0 1 -9.3 2.4 L-12.5 1.9 A12.6 12.6 0 0 1 -12.5 -1.9 L-9.3 -2.4 A9.6 9.6 0 0 1 -8.3 -4.9 L-10.1 -7.5 A12.6 12.6 0 0 1 -7.5 -10.1 L-4.9 -8.3 A9.6 9.6 0 0 1 -2.4 -9.3 Z M0 -4 A4 4 0 1 0 0 4 A4 4 0 1 0 0 -4 Z"
        />
      )
    case "cone":
      return (
        <>
          <path fill={ACCENT.cone} d="M-2.6 -12.6 C-1.4 -13.6 1.4 -13.6 2.6 -12.6 L9 8 L-9 8 Z" />
          <path fill={ACCENT.stripe} d="M-4.9 -5.4 L4.9 -5.4 L6.1 -1.6 L-6.1 -1.6 Z" />
          <path fill={ACCENT.coneBase} d="M-13 8 L13 8 C13.8 8 14.2 8.6 14.2 9.4 L14.2 10.8 C14.2 11.6 13.8 12.2 13 12.2 L-13 12.2 C-13.8 12.2 -14.2 11.6 -14.2 10.8 L-14.2 9.4 C-14.2 8.6 -13.8 8 -13 8 Z" />
        </>
      )
    case "house":
      return (
        <>
          <path fill={ACCENT.roof} d="M5.6 -5 L5.6 -12.6 L9.6 -12.6 L9.6 -1.4 Z" />
          <path fill={ACCENT.wall} d="M-10 -1.5 L10 -1.5 L10 12 L-10 12 Z" />
          <path fill={ACCENT.roof} d="M-13.6 0.4 L0 -12.6 L13.6 0.4 Z" />
          <path fill={ACCENT.gear} d="M1.6 12 L1.6 5.4 C1.6 3.4 7 3.4 7 5.4 L7 12 Z" />
          <path fill={ACCENT.pencil} d="M-7.6 3.4 L-2.6 3.4 L-2.6 8.4 L-7.6 8.4 Z" />
          <path fill="none" strokeWidth="1.2" d="M-5.1 3.4 L-5.1 8.4 M-7.6 5.9 L-2.6 5.9" />
        </>
      )
    case "paint":
      return (
        <>
          <path fill="none" d="M-8.6 -5.4 C-8 -14.4 8 -14.4 8.6 -5.4" />
          <path fill={ACCENT.can} d="M-9.6 -5 L9.6 -5 L8.2 11.6 C8 13.2 -8 13.2 -8.2 11.6 Z" />
          <path fill={ACCENT.paint} d="M-9.6 -5 L9.6 -5 L9.3 -1.6 C8.4 -0.8 7.6 -1.6 6.8 -0.8 L6.8 3.8 C6.8 5.6 4.6 5.6 4.6 3.8 L4.6 -0.6 C3.2 0 1.8 -1.4 0.4 -0.6 C-1 0.2 -1.9 -1.2 -2.9 -0.4 L-2.9 1.8 C-2.9 3.6 -5.1 3.6 -5.1 1.8 L-5.1 -0.6 C-6.6 -0.2 -8 -1.6 -9.3 -1.6 Z" />
          <ellipse fill={ACCENT.paint} cx="0" cy="-5" rx="9.6" ry="2.6" />
        </>
      )
  }
  return null
}

const DoodleIcon = ({ kind, size = 18 }: { kind: DoodleKind; size?: number }) => (
  <svg className="dcf-icon" viewBox="-16 -16 32 32" width={size} height={size} aria-hidden="true">
    <Doodle kind={kind} />
  </svg>
)

type Metrics = { advances: number[]; cap: number }

const FONT_SIZE = 200
const DEFAULT_FONT = '"Arial Black", "Inter Display", Inter, "Helvetica Neue", Helvetica, Arial, sans-serif'
const DEFAULT_SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif'

const estimate = (word: string): Metrics => ({
  advances: Array.from(word).map((c) => (c === " " ? 0.3 : /[IJ1]/.test(c) ? 0.42 : /[MW]/.test(c) ? 0.98 : 0.76) * FONT_SIZE),
  cap: 0.73 * FONT_SIZE,
})

const measure = (word: string, family: string): Metrics | null => {
  if (typeof document === "undefined") return null
  const ctx = document.createElement("canvas").getContext("2d")
  if (!ctx) return null
  ctx.font = "900 " + FONT_SIZE + "px " + family
  const chars = Array.from(word)
  const advances: number[] = []
  let prev = 0
  for (let i = 0; i < chars.length; i++) {
    const wNow = ctx.measureText(chars.slice(0, i + 1).join("")).width
    advances.push(wNow - prev)
    prev = wNow
  }
  const m = ctx.measureText(word.replace(/\s/g, "") || "H")
  const cap = m.actualBoundingBoxAscent > 0 ? m.actualBoundingBoxAscent : 0.73 * FONT_SIZE
  return { advances, cap }
}

const useIso = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

// "#" é o link de exemplo: o clique nele não pula para o topo nem entra no histórico
const holdPlaceholder = (e: React.MouseEvent<HTMLAnchorElement>) => {
  if (e.currentTarget.getAttribute("href") === "#") e.preventDefault()
}

const Link = ({ link, className, on }: { link: FooterLink; className?: string; on: boolean }) =>
  link.href && on ? (
    <a className={className} href={link.href} onClick={holdPlaceholder}>
      <span>{link.label}</span>
      <svg className="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength={1} d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4" />
      </svg>
    </a>
  ) : (
    <span className={className}>{link.label}</span>
  )

export default function DoodleCrewFooter({
  wordmark = "CONSTRUA",
  brand = "construa",
  blurb = "Desenhamos cada quadro à mão e soltamos um capítulo novo a cada estação. Venha construir com a gente.",
  tagline = "Um mundo desenhado à mão para quem nunca parou de inventar.",
  columns = DEFAULT_COLUMNS,
  actions = DEFAULT_ACTIONS,
  copyright = "© 2026 Construa Estúdio. Desenhado à mão em Curitiba.",
  legal = [{ label: "Privacidade", href: "#" }, { label: "Termos", href: "#" }, { label: "Cookies", href: "#" }],
  socials = [{ label: "Discord", href: "#" }, { label: "YouTube", href: "#" }, { label: "TikTok", href: "#" }, { label: "Instagram", href: "#" }],
  backToTop = true,
  crew = DEFAULT_CREW,
  doodles = DEFAULT_DOODLES,
  doodleCount = 12,
  preset = "auto",
  palette,
  fontFamily = DEFAULT_FONT,
  serifFamily = DEFAULT_SERIF,
  tracking = -0.02,
  interactive = true,
  links = true,
  height = "760px",
  className,
}: DoodleCrewFooterProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const word = wordmark.toUpperCase()
  const chars = React.useMemo(() => Array.from(word), [word])
  const colors = { ...(PRESETS[preset] || PRESETS.auto), ...(palette || {}) }

  const rootRef = React.useRef(null as HTMLElement | null)
  const svgRef = React.useRef(null as SVGSVGElement | null)
  const worldRef = React.useRef(null as HTMLDivElement | null)
  const crewLayerRefs = React.useRef([] as (SVGGElement | null)[])
  const eyeRefs = React.useRef([] as { blink: SVGGElement | null; pupil: SVGGElement | null }[][])
  const doodleRefs = React.useRef([] as (HTMLDivElement | null)[])

  const [metrics, setMetrics] = React.useState(() => estimate(word))
  const [play, setPlay] = React.useState(false)
  const [reduced, setReduced] = React.useState(false)
  const [talking, setTalking] = React.useState(-1)
  const [hopping, setHopping] = React.useState(-1)
  const talkTimer = React.useRef(0)

  // ---- mede a fonte de verdade, e de novo quando uma fonte da web chega atrasada ----
  useIso(() => {
    const run = () => {
      const m = measure(word, fontFamily)
      if (m) setMetrics(m)
    }
    run()
    const fonts = typeof document !== "undefined" ? document.fonts : undefined
    if (!fonts) return
    let alive = true
    fonts.ready.then(() => alive && run())
    fonts.addEventListener?.("loadingdone", run)
    return () => {
      alive = false
      fonts.removeEventListener?.("loadingdone", run)
    }
  }, [word, fontFamily])

  const layout = React.useMemo(() => layoutWord(metrics.advances, tracking, FONT_SIZE), [metrics, tracking])
  const cap = metrics.cap

  const placed = React.useMemo(
    () =>
      crew
        .map((m, i) => {
          const art = ART[m.kind]
          if (!art || !chars.length) return null
          const li = clamp(Math.floor(m.letter) || 0, 0, chars.length - 1)
          const scale = (cap / 144) * art.k * (m.scale ?? 1)
          const seat = m.seat || art.seat
          const p = seatPoint(seat, layout.x[li], layout.w[li], cap, m.offset ?? 0, scale)
          return { i, m, art, seat, scale, ...p, flip: m.flip ? -1 : 1 }
        })
        .filter(Boolean) as { i: number; m: CrewMember; art: Art; seat: Seat; scale: number; x: number; y: number; flip: number }[],
    [crew, chars.length, layout, cap],
  )

  // O viewBox abraça a palavra, a turma e o chão.
  const view = React.useMemo(() => {
    let l = 0
    let r = layout.width
    let t = -cap
    let b = 30
    for (const p of placed) {
      const bx = p.flip > 0 ? [p.art.box.l, p.art.box.r] : [-p.art.box.r, -p.art.box.l]
      l = Math.min(l, p.x + bx[0] * p.scale)
      r = Math.max(r, p.x + bx[1] * p.scale)
      t = Math.min(t, p.y + p.art.box.t * p.scale)
      b = Math.max(b, p.y + p.art.box.b * p.scale)
    }
    const pad = 24
    return { x: l - pad, y: t - pad, w: r - l + pad * 2, h: b - t + pad * 2 }
  }, [layout, placed, cap])

  const words = tagline.split(/\s+/).filter(Boolean)
  const tl = timeline(chars.length, placed.length, words.length, actions.length)

  const ground = React.useMemo(() => {
    const x0 = view.x + 6
    const x1 = view.x + view.w - 6
    let d = "M" + x0.toFixed(1) + " 6"
    const n = 14
    for (let k = 1; k <= n; k++) {
      const x = x0 + ((x1 - x0) * k) / n
      d += " Q" + (x - (x1 - x0) / n / 2).toFixed(1) + " " + (6 + (hash(k * 3.1) - 0.5) * 5).toFixed(1) + " " + x.toFixed(1) + " " + (6 + (hash(k * 7.7) - 0.5) * 2).toFixed(1)
    }
    let tufts = ""
    for (let k = 0; k < 22; k++) {
      const x = x0 + 20 + hash(k * 11.3) * (x1 - x0 - 40)
      const s = 0.7 + hash(k * 5.9) * 0.6
      tufts += "M" + x.toFixed(1) + " 6 l" + (2 * s).toFixed(1) + " " + (-9 * s).toFixed(1) + " M" + (x + 3 * s).toFixed(1) + " 6 l" + (1 * s).toFixed(1) + " " + (-12 * s).toFixed(1) + " M" + (x + 6 * s).toFixed(1) + " 6 l" + (-1 * s).toFixed(1) + " " + (-7 * s).toFixed(1) + " "
    }
    const pebbles = Array.from({ length: 9 }, (_, k) => ({ x: x0 + 40 + hash(k * 17.1) * (x1 - x0 - 80), y: 14 + hash(k * 2.3) * 8, r: 2 + hash(k * 9.4) * 2.6 }))
    return { d, tufts, pebbles }
  }, [view])

  // ---- os desenhinhos ----
  const doodleList = React.useMemo(() => {
    const kinds = doodles.length ? doodles : []
    const n = kinds.length ? clamp(Math.floor(doodleCount) || 0, 0, 40) : 0
    return Array.from({ length: n }, (_, k) => ({
      kind: kinds[k % kinds.length],
      size: 22 + hash(k * 4.7) * 14,
      seed: k,
    }))
  }, [doodles, doodleCount])

  const sim = React.useRef({
    floaters: [] as Floater[],
    w: 0,
    h: 0,
    px: NaN,
    py: NaN,
    inside: false,
    visible: false,
    gaze: [] as { x: number; y: number; tx: number; ty: number; next: number; blinkAt: number; blink: number }[],
    seed: 1,
    start: 0,
  })

  // Desenha cada desenhinho no lugar dele. Só mexe nos refs: é a mesma função a vida toda.
  const paintDoodles = React.useCallback(() => {
    const s = sim.current
    const k = clamp(s.w / 1100, 0.5, 1)
    for (let i = 0; i < s.floaters.length; i++) {
      const el = doodleRefs.current[i]
      const f = s.floaters[i]
      if (!el || !f) continue
      let sc = k
      let op = 1
      if (f.pop > 0) {
        const age = 1.4 - f.pop
        sc = k * (1 + Math.min(1, age / 0.3) * 0.7)
        op = Math.max(0, 1 - age / 0.3)
      }
      el.style.transform = "translate3d(" + f.x.toFixed(1) + "px," + f.y.toFixed(1) + "px,0) rotate(" + f.rot.toFixed(1) + "deg) scale(" + sc.toFixed(3) + ")"
      el.style.opacity = String(op)
    }
  }, [])

  // Espalha os desenhinhos quando o mundo ganha tamanho e, quando ele muda de tamanho, os leva junto, na proporção. O
  // tamanho é o do layout (clientWidth), não o da tela: dentro de um transform: scale os dois são diferentes.
  useIso(() => {
    const el = worldRef.current
    if (!el) return
    const s = sim.current
    const size = () => {
      const width = el.clientWidth
      const height = el.clientHeight
      const ow = s.w
      const oh = s.h
      s.w = width
      s.h = height
      if (s.floaters.length !== doodleList.length || !ow) {
        s.floaters = doodleList.map((_, k) => ({
          x: (0.04 + 0.92 * ((k + hash(k * 9.1) * 0.8) / Math.max(1, doodleList.length))) * width,
          y: (0.02 + hash(k * 3.3) * 0.56) * height,
          vx: 0,
          vy: 0,
          rot: (hash(k * 1.7) - 0.5) * 50,
          vr: (hash(k * 6.1) - 0.5) * 30,
          fall: 9 + hash(k * 2.9) * 16,
          phase: hash(k * 8.3) * Math.PI * 2,
          pop: 0,
        }))
      } else if (ow && oh) {
        for (const f of s.floaters) {
          f.x *= width / ow
          f.y *= height / oh
        }
      }
      paintDoodles()
    }
    size()
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(size)
    ro.observe(el)
    return () => ro.disconnect()
  }, [doodleList, paintDoodles])

  // ---- movimento reduzido ----
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener?.("change", on)
    return () => mq.removeEventListener?.("change", on)
  }, [])

  // ---- o storyboard começa quando o rodapé entra na tela; fora dela, o laço dorme ----
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const s = sim.current
    if (typeof IntersectionObserver === "undefined") {
      // sem o IntersectionObserver, o storyboard toca logo, no próximo quadro
      s.visible = true
      const id = window.setTimeout(() => setPlay(true))
      return () => window.clearTimeout(id)
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          s.visible = e.isIntersecting
          if (e.isIntersecting && e.intersectionRatio > 0.12) setPlay(true)
        }
      },
      { threshold: [0, 0.12, 0.3] },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [])

  React.useEffect(() => {
    if (play && !sim.current.start) sim.current.start = performance.now()
  }, [play])

  // ---- o laço da vida: os olhos, as piscadas, os desenhinhos e o tremor das linhas ----
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const s = sim.current
    let raf = 0
    let last = performance.now()
    let boilAt = 0
    let boil = 0
    const rand = () => {
      s.seed = (s.seed * 16807) % 2147483647
      return s.seed / 2147483647
    }
    const svgPoint = (svg: SVGSVGElement, cx: number, cy: number) => {
      const m = svg.getScreenCTM()
      if (!m) return null
      const inv = m.inverse()
      return { x: inv.a * cx + inv.c * cy + inv.e, y: inv.b * cx + inv.d * cy + inv.f }
    }
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!s.visible || document.hidden) {
        last = now
        return
      }
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = now / 1000
      const svg = svgRef.current
      const world = worldRef.current

      // os olhos
      let target = null as null | { x: number; y: number }
      if (svg && s.inside && interactive) target = svgPoint(svg, s.px, s.py)
      for (let c = 0; c < placed.length; c++) {
        const p = placed[c]
        const g = (s.gaze[c] ||= { x: 0, y: 0, tx: 0, ty: 0, next: 0, blinkAt: t + 1 + hash(c * 3.7) * 3, blink: 0 })
        if (!target && t > g.next) {
          // à toa: olha para algum lugar e, de vez em quando, para um vizinho
          const other = placed[(c + 1 + Math.floor(rand() * Math.max(1, placed.length - 1))) % placed.length]
          if (other && rand() < 0.45) {
            g.tx = other.x
            g.ty = other.y - 60 * other.scale
          } else {
            g.tx = p.x + (rand() - 0.5) * 900
            g.ty = p.y - 80 * p.scale + (rand() - 0.5) * 500
          }
          g.next = t + 1.4 + rand() * 2.6
        }
        if (t > g.blinkAt) {
          g.blink = 0.16
          g.blinkAt = t + 2.2 + rand() * 4
        }
        g.blink = Math.max(0, g.blink - dt)
        const lid = g.blink > 0 ? 0.12 + Math.abs(g.blink - 0.08) / 0.08 * 0.88 : 1
        const eyes = eyeRefs.current[c] || []
        for (let e = 0; e < p.art.eyes.length; e++) {
          const eye = p.art.eyes[e]
          const ex = p.x + eye.x * p.scale * p.flip
          const ey = p.y + eye.y * p.scale
          const tx = target ? target.x : g.tx
          const ty = target ? target.y : g.ty
          const o = lookAt(ex, ey, tx, ty, eye.max, 220)
          const ref = eyes[e]
          if (!ref) continue
          const key = "_o" + e
          const prev = (g as unknown as { [k: string]: { x: number; y: number } })[key] || { x: 0, y: 0 }
          const ease = Math.min(1, dt * (target ? 14 : 6))
          const nx = prev.x + (o.x * p.flip - prev.x) * ease
          const ny = prev.y + (o.y - prev.y) * ease
          ;(g as unknown as { [k: string]: { x: number; y: number } })[key] = { x: nx, y: ny }
          if (ref.pupil) ref.pupil.setAttribute("transform", "translate(" + nx.toFixed(2) + " " + ny.toFixed(2) + ")")
          if (ref.blink) ref.blink.setAttribute("transform", "translate(0 " + (eye.y * (1 - lid)).toFixed(2) + ") scale(1 " + lid.toFixed(3) + ")")
        }
      }

      // os desenhinhos: o ponteiro vem da tela para o layout, com a escala de algum transform em volta
      if (world && s.floaters.length) {
        const started = play && s.start ? now - s.start > tl.doodles || reduced : false
        if (started) {
          const r = world.getBoundingClientRect()
          const kx = r.width ? s.w / r.width : 1
          const ky = r.height ? s.h / r.height : 1
          const px = s.inside && interactive ? (s.px - r.left) * kx : NaN
          const py = s.inside && interactive ? (s.py - r.top) * ky : NaN
          if (!reduced) for (const f of s.floaters) stepFloater(f, dt, t, s.w, s.h, px, py, 110, rand)
          paintDoodles()
        }
      }

      // o tremor das linhas: três versões desenhadas à mão, trocadas a 8 quadros por segundo
      if (!reduced && now - boilAt > 125) {
        boilAt = now
        boil = (boil + 1) % 3
        const f = "url(#" + uid + "-boil" + boil + ")"
        for (const el of crewLayerRefs.current) if (el) el.setAttribute("filter", f)
      }
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [placed, play, reduced, interactive, uid, tl.doodles, paintDoodles])

  React.useEffect(() => () => window.clearTimeout(talkTimer.current), [])

  const onPointerMove = (e: React.PointerEvent) => {
    const s = sim.current
    s.px = e.clientX
    s.py = e.clientY
    s.inside = true
  }
  const onPointerLeave = () => {
    sim.current.inside = false
  }

  const poke = (c: number) => {
    if (!interactive) return
    setTalking(c)
    setHopping(-1)
    requestAnimationFrame(() => setHopping(c))
    window.clearTimeout(talkTimer.current)
    talkTimer.current = window.setTimeout(() => {
      setTalking(-1)
      setHopping(-1)
    }, 2600)
  }

  const popDoodle = (k: number) => {
    if (!interactive) return
    const f = sim.current.floaters[k]
    if (f && f.pop <= 0) {
      f.pop = 1.4
      paintDoodles()
    }
  }

  const toTop = () => {
    if (typeof window === "undefined") return
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
  }

  const hatch = "url(#" + uid + "-hatch)"
  const vars = {
    "--dcf-bg": colors.background,
    "--dcf-ink": colors.ink,
    "--dcf-accent": colors.accent,
    "--dcf-serif": serifFamily,
    "--dcf-display": fontFamily,
    minHeight: height,
  } as React.CSSProperties

  const pct = (v: number, base: number, span: number) => (((v - base) / span) * 100).toFixed(3) + "%"

  const renderCrew = (p: (typeof placed)[number], part: "body" | "front") => (
    <g key={p.i + part} transform={"translate(" + p.x.toFixed(2) + " " + p.y.toFixed(2) + ") scale(" + (p.scale * p.flip).toFixed(4) + " " + p.scale.toFixed(4) + ")"}>
      <g className={"dcf-arrive dcf-arrive-" + p.seat} style={{ "--d": tl.member(p.i) + "ms" } as React.CSSProperties}>
        <g className={"dcf-hopper" + (hopping === p.i ? " is-hop" : "")}>
          <g className={"dcf-art" + (p.art.idle ? " " + p.art.idle : "")} style={{ "--i": p.i } as React.CSSProperties}>
            {part === "body" ? (
              <>
                {p.art.body(hatch)}
                {p.art.eyes.map((eye, e) => (
                  <g
                    key={e}
                    ref={(el) => {
                      ;(eyeRefs.current[p.i] ||= [])[e] = { ...(eyeRefs.current[p.i]?.[e] || { pupil: null }), blink: el }
                    }}
                  >
                    {eye.r > 0 && <circle cx={eye.x} cy={eye.y} r={eye.r} />}
                    <g
                      ref={(el) => {
                        ;(eyeRefs.current[p.i] ||= [])[e] = { ...(eyeRefs.current[p.i]?.[e] || { blink: null }), pupil: el }
                      }}
                    >
                      <circle className="k" cx={eye.x} cy={eye.y} r={eye.pupil} />
                      <circle className="dcf-glint" cx={eye.x + eye.pupil * 0.35} cy={eye.y - eye.pupil * 0.4} r={eye.pupil * 0.32} />
                    </g>
                  </g>
                ))}
              </>
            ) : (
              p.art.front?.()
            )}
          </g>
        </g>
      </g>
    </g>
  )

  return (
    <footer
      ref={rootRef}
      className={"dcf" + (className ? " " + className : "")}
      data-play={play || reduced ? "1" : "0"}
      data-interactive={interactive ? "1" : "0"}
      style={vars}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <style>{CSS}</style>

      <div className="dcf-top dcf-rise" style={{ "--d": "0ms" } as React.CSSProperties}>
        <div className="dcf-brand">
          <span className="dcf-logo" aria-hidden="true">
            <svg viewBox="-60 -150 120 120" width="30" height="30">
              <g className="dcf-art">
                <path d="M-30 -104 C-40 -112 -44 -124 -40 -138 C-32 -129 -22 -122 -13 -114 Z" />
                <path d="M18 -114 C26 -124 36 -130 47 -133 C45 -120 41 -110 32 -101 Z" />
                <path d="M-44 -30 C-54 -56 -54 -70 -42 -90 C-32 -110 -14 -118 2 -118 C22 -118 40 -108 48 -88 C58 -68 56 -54 48 -30 Z" />
                <circle className="k" cx="-15" cy="-84" r="5.5" />
                <circle className="k" cx="13" cy="-86" r="5.5" />
                <path className="n" d="M-12 -66 C-6 -60 6 -60 12 -67" />
              </g>
            </svg>
          </span>
          <span className="dcf-brandname">{brand}</span>
        </div>
        {blurb && <p className="dcf-blurb">{blurb}</p>}
        {columns.length > 0 && (
          <nav className="dcf-cols" aria-label="Rodapé">
            {columns.map((col) => (
              <div className="dcf-col" key={col.title}>
                <h3 className="dcf-coltitle">{col.title}</h3>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link link={l} className="dcf-link" on={links} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </div>

      <div className="dcf-world" ref={worldRef}>
        <div className="dcf-stage">
          <h2 className="dcf-sr">{wordmark}</h2>
          <svg
            ref={svgRef}
            className="dcf-svg"
            viewBox={view.x.toFixed(1) + " " + view.y.toFixed(1) + " " + view.w.toFixed(1) + " " + view.h.toFixed(1)}
            aria-hidden="false"
            role="group"
            aria-label={wordmark + " — conheça a turma"}
          >
            <defs>
              <pattern id={uid + "-hatch"} width="4.6" height="4.6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
                <line x1="0" y1="0" x2="0" y2="4.6" style={{ stroke: "var(--dcf-ink)" }} strokeWidth="1.25" />
              </pattern>
              {[0, 1, 2].map((k) => (
                <filter key={k} id={uid + "-boil" + k} x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={k * 7 + 3} result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              ))}
              <filter id={uid + "-ink"} x="-4%" y="-6%" width="108%" height="112%">
                <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="11" result="edge" />
                <feDisplacementMap in="SourceGraphic" in2="edge" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough" />
                <feTurbulence type="fractalNoise" baseFrequency="0.018 0.32" numOctaves="2" seed="4" result="streak" />
                <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -16 5.6" result="streakA" />
                <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="9" result="speck" />
                <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -24 7.0" result="speckA" />
                <feComposite in="streakA" in2="speckA" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="holes" />
                <feComposite in="rough" in2="holes" operator="out" />
              </filter>
            </defs>

            <g ref={(el) => void (crewLayerRefs.current[0] = el)}>
              <g className="dcf-ground">
                <path className="dcf-draw" pathLength={1} d={ground.d} style={{ "--d": tl.ground + "ms" } as React.CSSProperties} />
                <path className="dcf-tufts dcf-fade" d={ground.tufts} style={{ "--d": tl.ground + 500 + "ms" } as React.CSSProperties} />
                {ground.pebbles.map((pb, k) => (
                  <ellipse key={k} className="dcf-pebble dcf-fade" cx={pb.x} cy={pb.y} rx={pb.r * 1.5} ry={pb.r} style={{ "--d": tl.ground + 600 + "ms" } as React.CSSProperties} />
                ))}
              </g>
              {placed.filter((p) => p.seat === "behind").map((p) => renderCrew(p, "body"))}
            </g>

            {chars.map((c, i) =>
              c === " " ? null : (
                <g key={i} className="dcf-letter" style={{ "--d": tl.letter(i) + "ms", "--r": ((hash(i * 2.3) - 0.5) * 9).toFixed(2) + "deg" } as React.CSSProperties}>
                  <g className="dcf-glyph">
                    <text x={layout.x[i]} y={0} fontSize={FONT_SIZE} fontWeight={900} style={{ fontFamily }} filter={"url(#" + uid + "-ink)"}>
                      {c}
                    </text>
                  </g>
                  <path
                    className="dcf-dust"
                    d={
                      "M" + (layout.x[i] - 6) + " -6 l-16 -6 M" + (layout.x[i] - 4) + " -16 l-12 -12 M" + (layout.x[i] + layout.w[i] + 6) + " -6 l16 -6 M" + (layout.x[i] + layout.w[i] + 4) + " -16 l12 -12"
                    }
                  />
                </g>
              ),
            )}

            <g ref={(el) => void (crewLayerRefs.current[1] = el)}>
              {placed.filter((p) => p.seat === "behind").map((p) => renderCrew(p, "front"))}
              {placed.filter((p) => p.seat !== "behind").map((p) => renderCrew(p, "body"))}
            </g>

            {interactive &&
              placed.map((p) => {
                const bx = p.flip > 0 ? [p.art.box.l, p.art.box.r] : [-p.art.box.r, -p.art.box.l]
                const top = p.art.box.t
                const bottom = p.seat === "behind" ? -30 : p.art.box.b
                return (
                  <rect
                    key={"hit" + p.i}
                    className="dcf-hit"
                    x={p.x + bx[0] * p.scale}
                    y={p.y + top * p.scale}
                    width={(bx[1] - bx[0]) * p.scale}
                    height={(bottom - top) * p.scale}
                    rx={12}
                    role="button"
                    tabIndex={0}
                    aria-label={(p.m.name || p.m.kind) + (p.m.says ? ": " + p.m.says : "")}
                    onClick={() => poke(p.i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        poke(p.i)
                      }
                    }}
                  />
                )
              })}
          </svg>

          <div className="dcf-bubbles" aria-live="polite">
            {placed.map((p) =>
              talking === p.i && p.m.says ? (
                <div
                  key={p.i}
                  className={"dcf-bubble" + (p.x > view.x + view.w * 0.72 ? " is-left" : "")}
                  style={{ left: pct(p.x, view.x, view.w), top: pct(p.y + p.art.box.t * p.scale - 6, view.y, view.h) }}
                >
                  {p.m.says}
                </div>
              ) : null,
            )}
          </div>
        </div>

        {doodleList.length > 0 && (
          <div className="dcf-doodles" aria-hidden="true">
            {doodleList.map((d, k) => (
              <div
                key={k}
                className="dcf-doodle"
                ref={(el) => void (doodleRefs.current[k] = el)}
                style={{ width: d.size, height: d.size, marginLeft: -d.size / 2, marginTop: -d.size / 2 }}
                onPointerDown={() => popDoodle(k)}
              >
                <span className="dcf-doodle-in" style={{ "--d": tl.doodles + k * 70 + "ms" } as React.CSSProperties}>
                  <svg viewBox="-16 -16 32 32" width={d.size} height={d.size}>
                    <Doodle kind={d.kind} />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="dcf-cta">
          <p className="dcf-tagline">
            {words.map((w, k) => (
              <span key={k} className="dcf-word" style={{ "--d": tl.word(k) + "ms" } as React.CSSProperties}>
                {w}{" "}
              </span>
            ))}
          </p>
          {actions.length > 0 && (
            <div className="dcf-actions">
              {actions.map((a, k) => {
                const inner = (
                  <>
                    {a.icon && <DoodleIcon kind={a.icon} />}
                    <span>{a.label}</span>
                  </>
                )
                const cls = "dcf-btn dcf-pop " + (a.variant === "outline" ? "is-outline" : "is-solid")
                const st = { "--d": tl.action(k) + "ms" } as React.CSSProperties
                if (!links) {
                  return (
                    <span key={a.label} className={cls} style={st}>
                      {inner}
                    </span>
                  )
                }
                return a.href ? (
                  <a
                    key={a.label}
                    className={cls}
                    style={st}
                    href={a.href}
                    onClick={(e) => {
                      holdPlaceholder(e)
                      a.onClick?.()
                    }}
                  >
                    {inner}
                  </a>
                ) : (
                  <button key={a.label} type="button" className={cls} style={st} onClick={a.onClick}>
                    {inner}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="dcf-bar dcf-rise" style={{ "--d": "120ms" } as React.CSSProperties}>
        <p className="dcf-copy">{copyright}</p>
        {legal.length > 0 && (
          <ul className="dcf-inline">
            {legal.map((l) => (
              <li key={l.label}>
                <Link link={l} className="dcf-link" on={links} />
              </li>
            ))}
          </ul>
        )}
        {socials.length > 0 && (
          <ul className="dcf-inline dcf-socials">
            {socials.map((l) => (
              <li key={l.label}>
                <Link link={l} className="dcf-link" on={links} />
              </li>
            ))}
          </ul>
        )}
        {backToTop &&
          (links ? (
            <button type="button" className="dcf-totop" onClick={toTop}>
              <span>Voltar ao topo</span>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M12 20 C11 14 12.5 9 12 4 M6 10 C8 8 10 6 12 4 C14 6 16 8 18.5 9.5" />
              </svg>
            </button>
          ) : (
            <span className="dcf-totop">
              <span>Voltar ao topo</span>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M12 20 C11 14 12.5 9 12 4 M6 10 C8 8 10 6 12 4 C14 6 16 8 18.5 9.5" />
              </svg>
            </span>
          ))}
      </div>
    </footer>
  )
}

// O CSS mora aqui, numa <style>, com classes dcf-*. O rodapé é um contêiner (container dcf): as quebras e as folgas
// seguem a largura dele, não a da tela, e ele fica igual numa coluna estreita ou dentro de um transform: scale.
const CSS =
  ".dcf{position:relative;isolation:isolate;overflow:hidden;overflow:clip;width:100%;box-sizing:border-box;display:flex;flex-direction:column;container:dcf/inline-size;background:var(--dcf-bg);color:var(--dcf-ink);font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Inter,Roboto,sans-serif;font-weight:400;line-height:1.5;letter-spacing:normal;text-align:left;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;--dcf-soft:color-mix(in oklab,var(--dcf-ink) 62%,var(--dcf-bg));--dcf-line:color-mix(in oklab,var(--dcf-ink) 14%,var(--dcf-bg));--dcf-pad:clamp(16px,4cqw,56px)}" +
  ":where(.dcf) *,:where(.dcf) *::before,:where(.dcf) *::after{box-sizing:border-box}" +
  ":where(.dcf) a{color:inherit;text-decoration:none}" +
  ":where(.dcf) button{appearance:none;background:none;border:0;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer}" +
  ":where(.dcf) h2,:where(.dcf) h3,:where(.dcf) p,:where(.dcf) ul{margin:0;padding:0}" +
  ":where(.dcf) ul{list-style:none}" +
  ".dcf svg{max-width:none;overflow:visible}" +
  ".dcf :focus-visible{outline:2px dashed var(--dcf-ink);outline-offset:4px;border-radius:6px}" +
  ".dcf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}" +
  // a faixa de cima
  ".dcf-top{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,2fr);grid-template-rows:auto 1fr;column-gap:clamp(24px,5cqw,80px);row-gap:14px;padding:clamp(28px,4.5cqw,56px) var(--dcf-pad) 0;max-width:1360px;width:100%;margin:0 auto;position:relative;z-index:3}" +
  ".dcf-brand{display:flex;align-items:center;gap:10px;grid-column:1;grid-row:1}" +
  ".dcf-logo{display:grid;place-items:center;width:40px;height:40px;border-radius:999px;border:2px solid var(--dcf-ink);background:var(--dcf-bg);transform:rotate(-6deg);transition:transform .35s cubic-bezier(.3,1.6,.5,1)}" +
  ".dcf-brand:hover .dcf-logo{transform:rotate(8deg) scale(1.06)}" +
  ".dcf-brandname{font-weight:800;font-size:19px;letter-spacing:-.02em}" +
  ".dcf-blurb{grid-column:1;grid-row:2;font-family:var(--dcf-serif);font-size:15px;line-height:1.55;color:var(--dcf-soft);max-width:34ch}" +
  ".dcf-cols{grid-column:2;grid-row:1/span 2;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}" +
  ".dcf-coltitle{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px}" +
  ".dcf-col li{margin:0 0 7px}" +
  ".dcf-link{position:relative;display:inline-block;font-size:14px;font-weight:550;color:var(--dcf-soft);padding:2px 0;transition:color .2s}" +
  ".dcf-link:hover{color:var(--dcf-ink)}" +
  ".dcf-squiggle{position:absolute;left:-2px;right:-2px;bottom:-4px;width:calc(100% + 4px);height:7px;pointer-events:none}" +
  ".dcf-squiggle path{fill:none;stroke:var(--dcf-accent);stroke-width:2.2;stroke-linecap:round;stroke-dasharray:1 2;stroke-dashoffset:1;transition:stroke-dashoffset .35s cubic-bezier(.4,0,.2,1)}" +
  ".dcf-link:hover .dcf-squiggle path,.dcf-link:focus-visible .dcf-squiggle path{stroke-dashoffset:0}" +
  // o mundo: a palavra, a turma e o chão
  ".dcf-world{position:relative;flex:1;display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(22px,4cqw,48px) var(--dcf-pad) 0;max-width:1360px;width:100%;margin:0 auto}" +
  ".dcf-stage{position:relative;z-index:1}" +
  ".dcf-svg{display:block;width:100%;height:auto;user-select:none;-webkit-user-select:none}" +
  ".dcf-svg text{fill:var(--dcf-ink)}" +
  ".dcf-art{fill:var(--dcf-bg);stroke:var(--dcf-ink);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}" +
  ".dcf-art .n{fill:none}.dcf-art .k{fill:var(--dcf-ink)}.dcf-art .a{fill:var(--dcf-accent)}.dcf-art .o{fill:#ff9f1c}.dcf-art .r{fill:#ff4d4d}" +
  ".dcf-art .thin{stroke-width:1.5}.dcf-art .thick{stroke-width:3.4}" +
  ".dcf-art .dcf-glint{fill:var(--dcf-bg);stroke:none}" +
  ".dcf-art .dcf-shadow{fill:var(--dcf-ink);stroke:none;opacity:.14}" +
  ".dcf-ground path{fill:none;stroke:var(--dcf-ink);stroke-width:2.4;stroke-linecap:round}" +
  ".dcf-ground .dcf-tufts{stroke-width:1.8}" +
  ".dcf-pebble{fill:var(--dcf-bg);stroke:var(--dcf-ink);stroke-width:1.6}" +
  ".dcf-dust{fill:none;stroke:var(--dcf-ink);stroke-width:3;stroke-linecap:round;opacity:0}" +
  ".dcf-hit{fill:transparent;stroke:none;cursor:pointer;outline:none}" +
  ".dcf-hit:focus-visible{stroke:var(--dcf-ink);stroke-width:2.5;stroke-dasharray:6 6}" +
  ".dcf-glyph{transform-box:fill-box;transform-origin:50% 100%}" +
  ".dcf[data-interactive='1'] .dcf-glyph:hover{animation:dcf-jiggle .6s cubic-bezier(.3,1.5,.5,1)}" +
  ".dcf-art.dcf-bob{animation:dcf-bob 3.2s ease-in-out infinite}" +
  ".dcf-art.dcf-sway{transform-box:fill-box;transform-origin:50% 100%;animation:dcf-swing 4s ease-in-out infinite}" +
  ".dcf-art.dcf-peck{transform-box:fill-box;transform-origin:50% 100%;animation:dcf-peck 5.5s ease-in-out infinite}" +
  ".dcf-tail{transform-box:fill-box;transform-origin:0% 100%;animation:dcf-tail 2.8s ease-in-out infinite}" +
  ".dcf-hopper{transform-box:fill-box;transform-origin:50% 100%}" +
  ".dcf-hopper.is-hop{animation:dcf-hop .62s cubic-bezier(.3,.7,.4,1)}" +
  ".dcf-arrive{transform-box:fill-box;transform-origin:50% 100%}" +
  // os balões de fala
  ".dcf-bubbles{position:absolute;inset:0;pointer-events:none;z-index:2}" +
  ".dcf-bubble{position:absolute;transform:translate(-50%,-100%) rotate(-2deg);transform-origin:50% 100%;background:var(--dcf-bg);color:var(--dcf-ink);border:2px solid var(--dcf-ink);border-radius:16px;padding:7px 12px;font-size:13px;font-weight:700;line-height:1.25;white-space:nowrap;box-shadow:3px 3px 0 var(--dcf-ink);animation:dcf-bubble .32s cubic-bezier(.3,1.6,.5,1) both;margin-top:-4px}" +
  ".dcf-bubble::after{content:'';position:absolute;left:50%;bottom:-9px;width:14px;height:14px;background:var(--dcf-bg);border-right:2px solid var(--dcf-ink);border-bottom:2px solid var(--dcf-ink);transform:translateX(-50%) rotate(45deg) skew(8deg,8deg)}" +
  ".dcf-bubble.is-left{transform:translate(-88%,-100%) rotate(2deg);transform-origin:88% 100%}" +
  ".dcf-bubble.is-left::after{left:88%}" +
  // os desenhinhos
  ".dcf-doodles{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden}" +
  ".dcf-doodle{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;will-change:transform;touch-action:manipulation}" +
  ".dcf-doodle-in{display:block;width:100%;height:100%}" +
  ".dcf[data-interactive='0'] .dcf-doodle{pointer-events:none}" +
  ".dcf-doodle svg,.dcf-icon{display:block;stroke:var(--dcf-ink);stroke-width:1.9;stroke-linejoin:round;stroke-linecap:round}" +
  ".dcf-doodle svg{width:100%;height:100%;filter:drop-shadow(2px 2px 0 color-mix(in oklab,var(--dcf-ink) 18%,transparent))}" +
  // a frase e os botões
  ".dcf-cta{position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;gap:20px;padding:clamp(20px,3cqw,34px) 0 clamp(30px,4cqw,48px);text-align:center}" +
  ".dcf-tagline{font-family:var(--dcf-serif);font-size:clamp(17px,1.9cqw,22px);line-height:1.4;letter-spacing:-.005em;max-width:44ch;text-wrap:balance}" +
  ".dcf-word{display:inline-block;white-space:pre}" +
  ".dcf-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}" +
  ".dcf-btn{display:inline-flex;align-items:center;gap:8px;height:46px;padding:0 20px 0 16px;border-radius:999px;border:2px solid var(--dcf-ink);font-size:14.5px;font-weight:750;letter-spacing:-.01em;box-shadow:0 3px 0 var(--dcf-ink);transition:transform .18s cubic-bezier(.3,1.4,.5,1),box-shadow .18s cubic-bezier(.3,1.4,.5,1)}" +
  ".dcf-btn.is-outline{background:var(--dcf-bg);color:var(--dcf-ink)}" +
  ".dcf-btn.is-solid{background:var(--dcf-ink);color:var(--dcf-bg);box-shadow:0 3px 0 var(--dcf-accent)}" +
  ".dcf-btn.is-solid .dcf-icon{stroke:var(--dcf-bg)}" +
  ".dcf-btn:hover{transform:translateY(-2px) rotate(-1.2deg);box-shadow:0 5px 0 var(--dcf-ink)}" +
  ".dcf-btn.is-solid:hover{box-shadow:0 5px 0 var(--dcf-accent)}" +
  ".dcf-btn:active{transform:translateY(2px);box-shadow:0 1px 0 var(--dcf-ink);transition-duration:.06s}" +
  ".dcf-btn.is-solid:active{box-shadow:0 1px 0 var(--dcf-accent)}" +
  ".dcf-btn:hover .dcf-icon{animation:dcf-wiggle .5s ease-in-out}" +
  // a barra de baixo
  ".dcf-bar{position:relative;z-index:3;display:flex;flex-wrap:wrap;align-items:center;gap:10px 26px;padding:18px var(--dcf-pad) 22px;max-width:1360px;width:100%;margin:0 auto;border-top:1.5px dashed var(--dcf-line);font-size:13px}" +
  ".dcf-copy{color:var(--dcf-soft);margin-right:auto}" +
  ".dcf-inline{display:flex;flex-wrap:wrap;gap:4px 18px}" +
  ".dcf-inline .dcf-link{font-size:13px}" +
  ".dcf-socials .dcf-link{color:var(--dcf-ink);font-weight:700}" +
  ".dcf-totop{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px;border:1.5px solid var(--dcf-ink);transition:transform .2s cubic-bezier(.3,1.5,.5,1)}" +
  ".dcf-totop svg{fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}" +
  ".dcf-totop:hover{transform:translateY(-2px)}" +
  ".dcf-totop:hover svg{animation:dcf-up .6s ease-in-out infinite}" +
  // o storyboard: tudo escondido até começar, e então cada peça entra no --d dela
  ".dcf[data-play='0'] .dcf-letter,.dcf[data-play='0'] .dcf-arrive,.dcf[data-play='0'] .dcf-word,.dcf[data-play='0'] .dcf-pop,.dcf[data-play='0'] .dcf-rise,.dcf[data-play='0'] .dcf-fade,.dcf[data-play='0'] .dcf-doodle-in{opacity:0}" +
  ".dcf[data-play='0'] .dcf-draw{stroke-dasharray:1 2;stroke-dashoffset:1}" +
  ".dcf-letter{transform-box:fill-box;transform-origin:50% 100%}" +
  ".dcf[data-play='1'] .dcf-letter{animation:dcf-stamp .62s cubic-bezier(.2,.8,.25,1.15) var(--d) both}" +
  ".dcf[data-play='1'] .dcf-dust{animation:dcf-dust .5s ease-out calc(var(--d) + .22s) both}" +
  ".dcf[data-play='1'] .dcf-draw{stroke-dasharray:1 2;animation:dcf-draw 1.1s cubic-bezier(.6,0,.3,1) var(--d) both}" +
  ".dcf[data-play='1'] .dcf-fade{animation:dcf-fade .6s ease-out var(--d) both}" +
  ".dcf[data-play='1'] .dcf-arrive-front{animation:dcf-rise-up .75s cubic-bezier(.3,1.5,.5,1) var(--d) both}" +
  ".dcf[data-play='1'] .dcf-arrive-top{animation:dcf-plop .8s cubic-bezier(.3,.9,.4,1) var(--d) both}" +
  ".dcf[data-play='1'] .dcf-arrive-behind{animation:dcf-peek .9s cubic-bezier(.3,1.4,.5,1) var(--d) both}" +
  ".dcf[data-play='1'] .dcf-word{animation:dcf-word .6s cubic-bezier(.2,.8,.3,1) var(--d) both}" +
  ".dcf[data-play='1'] .dcf-pop{animation:dcf-popin .55s cubic-bezier(.3,1.6,.5,1) var(--d) both}" +
  ".dcf[data-play='1'] .dcf-rise{animation:dcf-fadeup .7s cubic-bezier(.2,.8,.3,1) var(--d) both}" +
  ".dcf[data-play='1'] .dcf-doodle-in{animation:dcf-fade .6s ease-out var(--d) both}" +
  "@keyframes dcf-stamp{0%{opacity:0;transform:translateY(-34%) scale(1.28) rotate(var(--r))}55%{opacity:1;transform:translateY(2%) scale(.95,1.05) rotate(0deg)}75%{transform:translateY(0) scale(1.04,.95)}100%{opacity:1;transform:none}}" +
  "@keyframes dcf-dust{0%{opacity:0;stroke-dasharray:0 40}30%{opacity:.9}100%{opacity:0;stroke-dasharray:14 40;stroke-dashoffset:-16}}" +
  "@keyframes dcf-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}" +
  "@keyframes dcf-fade{from{opacity:0}to{opacity:1}}" +
  "@keyframes dcf-rise-up{0%{opacity:0;transform:translateY(30%) scale(.7,.3)}45%{opacity:1;transform:translateY(-8%) scale(.92,1.12)}70%{transform:translateY(0) scale(1.08,.92)}100%{opacity:1;transform:none}}" +
  "@keyframes dcf-plop{0%{opacity:0;transform:translateY(-90%)}50%{opacity:1;transform:translateY(0) scale(1.1,.86)}68%{transform:translateY(-10%) scale(.96,1.04)}84%{transform:translateY(0) scale(1.03,.97)}100%{opacity:1;transform:none}}" +
  "@keyframes dcf-peek{0%{opacity:0;transform:translateY(55%)}60%{opacity:1;transform:translateY(-6%)}100%{opacity:1;transform:none}}" +
  "@keyframes dcf-word{from{opacity:0;transform:translateY(.6em) rotate(3deg)}to{opacity:1;transform:none}}" +
  "@keyframes dcf-popin{0%{opacity:0;transform:translateY(10px) scale(.6) rotate(-4deg)}100%{opacity:1;transform:none}}" +
  "@keyframes dcf-fadeup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}" +
  "@keyframes dcf-jiggle{0%{transform:none}25%{transform:rotate(-4deg) scale(1.03,.97)}50%{transform:rotate(3deg) translateY(-3%)}75%{transform:rotate(-1.5deg)}100%{transform:none}}" +
  "@keyframes dcf-hop{0%{transform:none}18%{transform:scale(1.12,.84)}45%{transform:translateY(-28%) scale(.94,1.08)}72%{transform:translateY(0) scale(1.1,.88)}86%{transform:scale(.97,1.03)}100%{transform:none}}" +
  "@keyframes dcf-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}" +
  "@keyframes dcf-swing{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2.5deg)}}" +
  "@keyframes dcf-peck{0%,62%,100%{transform:none}66%{transform:rotate(14deg) translateY(2px)}70%{transform:none}74%{transform:rotate(12deg) translateY(2px)}78%{transform:none}}" +
  "@keyframes dcf-tail{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-12deg)}}" +
  "@keyframes dcf-bubble{from{opacity:0;scale:.6}to{opacity:1;scale:1}}" +
  "@keyframes dcf-wiggle{0%,100%{transform:none}30%{transform:rotate(-14deg) scale(1.15)}60%{transform:rotate(10deg)}}" +
  "@keyframes dcf-up{0%,100%{transform:none}50%{transform:translateY(-3px)}}" +
  "@container dcf (max-width:860px){.dcf-top{grid-template-columns:1fr;grid-template-rows:auto}.dcf-brand,.dcf-blurb,.dcf-cols{grid-column:1;grid-row:auto}.dcf-cols{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:14px;row-gap:22px}.dcf-copy{width:100%;margin-right:0}}" +
  "@container dcf (max-width:480px){.dcf-btn{height:42px;font-size:13.5px;padding:0 16px 0 13px}.dcf-bubble{font-size:12px;padding:6px 10px}.dcf-totop span{display:none}}" +
  "@media (prefers-reduced-motion:reduce){.dcf *,.dcf *::before,.dcf *::after{animation:none!important;transition:none!important}.dcf .dcf-letter,.dcf .dcf-arrive,.dcf .dcf-word,.dcf .dcf-pop,.dcf .dcf-rise,.dcf .dcf-fade,.dcf .dcf-doodle-in{opacity:1!important}.dcf .dcf-draw{stroke-dashoffset:0!important}.dcf .dcf-dust{opacity:0!important}}"
```

  2. Crie components/doodle-crew-footer-demo.tsx, ao lado da pasta ui, com exatamente este conteúdo. O import é relativo e funciona sem alias; se o rodapé ficou em outro lugar, ajuste só esse caminho:

```tsx
"use client"

import DoodleCrewFooter, { type DoodleCrewFooterProps } from "./ui/doodle-crew-footer"

/**
 * O rodapé sozinho, na largura toda. A largura importa: dentro de um contêiner flex que centraliza, um item com
 * width: auto encolhe, e a palavra some. As props passam para o rodapé: <DoodleCrewFooterDemo preset="night" />, por
 * exemplo.
 */
export default function DoodleCrewFooterDemo(props: DoodleCrewFooterProps) {
  return (
    <div style={{ width: "100%" }}>
      <DoodleCrewFooter {...props} />
    </div>
  )
}
```

  3. Mostre a demo numa página só dela, que ocupa a tela inteira:
     - Next.js (App Router): crie app/doodle-crew-footer/page.tsx (ou src/app/doodle-crew-footer/page.tsx) que só devolve <DoodleCrewFooterDemo />. Se o layout envolver as páginas num container com padding ou largura máxima, a demo fica fora dele.
     - Vite ou outro React sem rotas: o App.tsx só devolve <DoodleCrewFooterDemo />. Com react-router, uma rota /doodle-crew-footer.
     - Nada de margem em volta: o body fica com margin: 0. Tire da página da demo os estilos globais de template que centralizam o body ou o #root, dão padding, largura máxima, cor de fundo ou cor de texto (os do create-vite e do create-next-app fazem isso). Pode remover esses estilos de exemplo se o projeto ainda for o template.

Como usar no projeto
  <DoodleCrewFooter wordmark="SUAMARCA" brand="suamarca" tagline="A frase da sua marca." columns={[{ title: "Produto", links: [{ label: "Preços", href: "/precos" }] }]} actions={[{ label: "Começar", href: "/cadastro", icon: "pencil", variant: "solid" }]} />
  - wordmark: a palavra gigante, em maiúsculas. De 4 a 9 letras fica melhor. brand, blurb e tagline: o nome pequeno no canto de cima, o texto embaixo dele e a frase embaixo da palavra.
  - columns ([{ title, links: [{ label, href }] }]), legal e socials ([{ label, href }]), copyright e backToTop: as colunas e a barra de baixo. Lista vazia ([]) ou texto vazio ("") some. Link sem href vira texto, e o "#" de exemplo não pula para o topo.
  - actions: os botões em pílula, [{ label, href, icon, variant, onClick }], com variant "solid" ou "outline" e icon com o nome de um desenhinho. Sem href, o botão é um <button>.
  - crew: a turma, [{ kind, letter, seat, offset, scale, flip, name, says }]. kind é yeti, kid, bird, cat, ghost ou mushroom; letter é o índice da letra da palavra (começa em 0); seat é front, top ou behind (o padrão depende do tipo); offset desliza ao longo da letra, em larguras de letra (0 é o meio); scale é o tamanho; flip vira para o outro lado; name entra no rótulo acessível e says é a fala do clique. A turma de fábrica (DEFAULT_CREW) foi montada para as letras de CONSTRUA: com outra palavra, reveja o letter, o seat e o offset de cada um.
  - doodles: quais desenhinhos caem (brick, hammer, pencil, bulb, gear, cone, house, paint); [] os desliga. doodleCount: quantos de uma vez (12 de fábrica, até 40).
  - preset: auto (segue os tokens --color-background e --color-foreground do projeto, como os do shadcn; sem eles, papel branco e tinta quase preta), paper, night, riso ou sunny. palette ({ background, ink, accent }) troca cores soltas.
  - fontFamily: a fonte da palavra (as grotescas bem pesadas carimbam melhor). serifFamily: a da frase e do texto da marca. tracking: o espaço entre as letras da palavra, em em (-0,02 de fábrica).
  - interactive: falso desliga o ponteiro, o hover e o clique. links: falso transforma os links e os botões em texto, para o rodapé caber dentro de outro link. height: a altura mínima, um comprimento definido ("760px" de fábrica); o rodapé passa dela se o conteúdo precisar. className: classes a mais na raiz.
  Os textos de exemplo (a Construa, DEFAULT_COLUMNS, DEFAULT_ACTIONS, DEFAULT_CREW) saem quando você passa os seus.

Ajustes
  Os desenhinhos: Doodle desenha cada um numa caixa de 32 × 32 com o centro em (0, 0); acrescentar um é um case novo ali, o nome em DoodleKind e as cores em ACCENT. A fila de fábrica é DEFAULT_DOODLES. A turma: cada personagem está em ART, com o corpo, os olhos (que o código mira), a caixa, o lugar de fábrica e o tamanho (k). Quem senta (top) e quem espia (behind) ficam melhor em letra de topo reto (T, E, F, H, R); atrás de uma letra aberta em cima (U, V, Y), quem espia aparece dentro dela. O tempo do storyboard: timeline() (em ms). A tinta da palavra: o filtro -ink. O tremor: os três filtros -boil e os 125 ms do laço. O raio da fuga dos desenhinhos: o 110 do stepFloater no laço. As cores: PRESETS e, fixas, ACCENT e as classes .o e .r do CSS.

Verificação
  - O typecheck (npx tsc --noEmit; no Vite, npx tsc -b, porque o tsconfig da raiz só aponta para os outros) e o build passam, e o console do navegador fica limpo.
  - Numa tela de desktop, ao abrir: a linha do chão se desenha da esquerda para a direita, as letras de "CONSTRUA" são carimbadas uma a uma, enormes, em tinta preta com falhas de pincel seco, e a turma chega: o yeti de mochila encostado no C, o passarinho de chapéu de festa no alto do O, o cogumelo vermelho na frente do N, a criança de chapéu sentada no T com as pernas penduradas, o fantasma espiando por cima do R com as mãos na borda e o gato pirata na frente do A. Os desenhinhos começam a cair, e a frase e os dois botões ("Pegar o pacote de adesivos" e "Jogar grátis") sobem por último.
  - Em cima, a marca "construa" com o logo redondo, o texto embaixo dela e as colunas Jogar, Loja, Comunidade e Estúdio; embaixo, a barra com o copyright, os links, as redes e o "Voltar ao topo".
  - Os olhos de todos seguem o ponteiro e piscam de vez em quando; com o ponteiro fora, eles olham em volta. As linhas da turma e do chão tremem de leve o tempo todo.
  - O clique num personagem o faz pular e abre um balão com a fala dele (no yeti, "Tô com fome. Tijolo conta?"), que some em uns 2,6 segundos. Pelo teclado, o Tab chega em cada personagem, e o Enter ou o espaço fazem o mesmo.
  - O mouse em cima de uma letra a faz balançar. Os desenhinhos fogem do ponteiro, e o clique num deles o estoura; ele volta pelo alto depois. Os links ganham um sublinhado ondulado laranja no hover.
  - Numa tela de celular de 375 px, a faixa de cima empilha (a marca, o texto e as colunas em duas), a palavra cabe na largura e nada cria rolagem horizontal; os botões ficam menores e o "Voltar ao topo" vira só a seta.
  - Com o reduzir movimento do sistema ligado, tudo já aparece pronto, sem o tremor e sem a queda.

Ao terminar, diga o endereço em que a demo abriu e o caminho de cada arquivo criado.