# Sticker Slap Footer — ProfitizeBuild
Objetivo: o rodapé de um site em React com cara de estúdio alto astral: uma moldura creme, um painel verde-escuro com três colunas (vagas, estúdio, contato) e o nome da marca enorme, numa letra cursiva gorda que afunda na borda de baixo, com adesivos recortados colados por cima. Quando o rodapé entra na tela, o painel cresce de dentro da moldura, as etiquetas pulam, as linhas sobem, a palavra se escreve sozinha num traço só de caneta e cada adesivo bate na hora em que a caneta passa embaixo dele. Depois vira brinquedo: arrastar os adesivos, dois cliques para mandar um de volta, clicar na palavra para escrever tudo de novo, clicar no e-mail para copiar e abrir os créditos num balão. A demo mostra a marca fictícia Brisa.

Contexto
  A cursiva é um alfabeto de traço único desenhado em SVG (SCRIPT, de a a z, ! e .): as letras emendam num caminho só, e é esse caminho que se desenha com stroke-dashoffset. Os pingos do i e os cortes do t são traços à parte, desenhados depois. A palavra é inclinada 9 graus, e a borda de baixo do painel a corta um pouco acima da linha de base. Acentos saem e maiúsculas viram minúsculas.
  Os adesivos são SVG desenhados no código, com o recorte branco de um adesivo de verdade, uma sombra e um brilho que passa no hover. São sete: stamp (o selo laranja de borda ondulada, "oba!"), sun (o sol de óculos escuros), watermelon (a fatia de melancia), bubble (o balão lilás, "oi!"), vinyl (o disco de vinil), rocket (o foguete) e coffee (a xícara, fora da lista de fábrica). Cada um cai no alto da letra que está embaixo dele, com uma inclinação e uma profundidade tiradas de uma semente: todo render os põe no mesmo lugar.
  O roteiro toca uma vez, quando um quinto do rodapé aparece na tela. Além disso, enquanto a página rola, o painel cresce de 90% a 100% e os cantos assentam, preso à rolagem (--ssf-sp). O arraste inclina o adesivo com a velocidade da mão, o solta com um tranco e vale em porcentagem da caixa da palavra, então continua certo com a janela mudando de tamanho ou dentro de um transform: scale. O mouse sobre o rodapé move os adesivos de leve, cada um numa profundidade (paralaxe).
  Pelo teclado: cada adesivo é um botão; as setas movem (com Shift, mais longe), e o Esc ou o Home o mandam de volta. Com o reduzir movimento do sistema ligado, tudo já aparece no estado final, sem o roteiro. Com 760 px de largura ou menos (do rodapé), as colunas viram uma só e a palavra passa um pouco da largura, cortada dos lados.
  São dois arquivos. O rodapé (components/ui/sticker-slap-footer.tsx) tem os tipos, o alfabeto, as contas (funções puras, exportadas), os adesivos e o CSS. A demo (components/sticker-slap-footer-demo.tsx) só põe o rodapé na largura toda.
  React (18 ou 19) e TypeScript, sem dependências. Sem Tailwind nem shadcn: o CSS mora no rodapé, numa <style>, com classes ssf-*. Nada é baixado: a fonte é a primeira da pilha que a página já tiver ("DM Sans", Manrope ou a do sistema), e não há imagem nenhuma.

Antes de começar
  Olhe a stack do projeto:
  - React com TypeScript (Next.js, Vite, Remix, Astro com React…): siga os passos abaixo. Os arquivos começam com "use client", que o Next.js exige e os outros ignoram.
  - React sem TypeScript: crie os arquivos como .jsx e tire só as anotações de tipo (os blocos type e interface, os ": Tipo", os "as Tipo", o "type" dentro do import da demo e os genéricos <…>). Não mude mais nada.
  - Sem React (HTML puro, Vue, Svelte, Angular…): pare e me avise antes de fazer qualquer coisa; este componente é React.
  Os arquivos vão na pasta de componentes do projeto (src/components ou components). O rodapé fica numa subpasta ui, como na estrutura do shadcn; se o projeto já tem components/ui, use essa.
  Não instale nada: o rodapé só usa o React.
  Mesmo que o projeto use Tailwind ou shadcn, não converta o CSS em classes utilitárias, não o mova para um .css separado e não troque os adesivos por imagens.

Implementação
  1. Crie components/ui/sticker-slap-footer.tsx com exatamente o conteúdo abaixo. Copie o arquivo inteiro, sem abreviar, sem reformatar, sem traduzir, sem renomear e sem "melhorar" nada, inclusive o alfabeto e o CSS:

```tsx
"use client"

import * as React from "react"

/*
 * Sticker Slap Footer — o rodapé de um estúdio, alto astral: uma moldura creme, um
 * painel verde com três colunas (vagas, estúdio, contato) e o nome da marca enorme,
 * numa letra cursiva gorda, afundando na borda de baixo, com adesivos colados por
 * cima dele.
 *
 * O roteiro: quando o rodapé entra na tela, o painel cresce de dentro da moldura e os
 * cantos assentam. Depois as etiquetas das colunas pulam, as linhas sobem das máscaras,
 * a palavra se escreve num traço só de caneta (os cortes do t e os pingos do i por
 * último) e cada adesivo bate na hora em que a caneta passa embaixo dele. Depois disso
 * vira brinquedo: dá para arrastar os adesivos para qualquer lugar (eles inclinam com o
 * movimento e batem ao soltar), dois cliques mandam um de volta, o clique na palavra a
 * escreve de novo, o clique no e-mail copia e os créditos abrem num balão.
 *
 * Sem dependências e nada é baixado. Só o React: a cursiva é um alfabeto de traço único
 * em SVG, e todos os adesivos são desenhados aqui.
 */

// As contas, puras: o alfabeto, o arranjo da palavra, as estrelas e o lugar dos adesivos.

/** Um hash pequeno e determinístico → [0, 1): todo render põe as coisas no mesmo lugar. */
export const hash = (n: number): number => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

export const round = (v: number): number => Math.round(v * 100) / 100

export const clamp = (v: number, lo: number, hi: number): number => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo)

/**
 * A cursiva gorda de traço único: [avanço, traço principal, traços com a caneta
 * levantada, levanta depois?]. Altura de x 10, linha de base em 0, y para baixo. Todo
 * traço principal começa em (0, -1) e, se não levanta, termina em (avanço, -1), então as
 * letras emendam num caminho só. Só M / L / C absolutos: x e y simplesmente se alternam.
 */
export const SCRIPT: Record<string, [number, string, string?, number?]> = {
  a: [10.2, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -10L7.8 -3C7.8 -0.8 8.8 -1 10.2 -1"],
  b: [9.4, "M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -1L1.8 -6C2.4 -9 3.4 -10 4.8 -10C6.8 -10 8.2 -8 8.2 -5C8.2 -2 6.6 0 4.8 0C3.4 0 2.4 -0.6 1.8 -1.6C2.4 -0.6 3.4 0 4.8 0C6.6 0 7.8 -0.8 9.4 -1"],
  c: [8.8, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C5.6 -10 6.6 -9.6 7 -8.6C6.6 -9.6 5.6 -10 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6 0 7 -1 8.8 -1"],
  d: [10.2, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -19L7.8 -3C7.8 -0.8 8.8 -1 10.2 -1"],
  e: [9.4, "M0 -1C3.4 -2.4 8 -4.4 8 -7.6C8 -9.4 6.6 -10.4 4.8 -10.4C2.2 -10.4 0.8 -7.8 0.8 -5C0.8 -1.8 2.6 0 5 0C6.8 0 8 -1 9.4 -1"],
  f: [7, "M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 7.2C1.8 9.6 3.2 9.6 3.8 7.6C4.4 5 4.8 -1 7 -1", "M-0.4 -9.4L5.4 -9.4"],
  g: [9.6, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -10L7.8 4C7.8 8.6 5.8 9.6 4.2 9.6C2 9.6 1.4 7.6 2.8 6C4.6 4 7.4 1.4 9.6 -1"],
  h: [10, "M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -1L1.8 -5.6C2.6 -8.6 4 -10 5.6 -10C7.2 -10 7.8 -8.8 7.8 -7L7.8 -3C7.8 -0.8 8.8 -1 10 -1"],
  i: [5, "M0 -1C1.2 -1.4 2 -6 2.2 -10L2.2 -3C2.2 -0.8 3.4 -1 5 -1", "M2.4 -15.2L2.5 -15.3"],
  j: [5.4, "M0 -1C1.2 -1.4 2 -6 2.2 -10L2.2 4.6C2.2 9.6 -0.6 9.8 -0.2 7.4C0.2 5 3.4 1.4 5.4 -1", "M2.4 -15.2L2.5 -15.3"],
  k: [9.6, "M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -1L1.8 -4.6C3 -8 5.6 -10.4 7 -9.6C8.4 -8.6 7 -5.6 3.6 -5C5.6 -4.6 6.6 -1 9.6 -1"],
  l: [6.4, "M0 -1C2.8 -3 6.2 -12 6 -16.4C5.8 -19.8 1.8 -20 1.8 -16.4L1.8 -3.2C1.8 -0.6 4 -1 6.4 -1"],
  m: [14.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.4 -8.6 3.4 -10 4.8 -10C6.2 -10 7 -9 7 -7L7 -1L7 -5.6C7.6 -8.6 8.6 -10 10 -10C11.4 -10 12.2 -9 12.2 -7L12.2 -3C12.2 -0.8 13.2 -1 14.6 -1"],
  n: [9.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.4 -8.6 3.4 -10 4.8 -10C6.4 -10 7.2 -9 7.2 -7L7.2 -3C7.2 -0.8 8.2 -1 9.6 -1"],
  o: [9, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5C7.6 -7.8 6.1 -10 4.3 -10C6 -10 7.4 -9.2 9 -9", "", 1],
  p: [9.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 9L1.8 -5.6C2.4 -8.6 3.4 -10 5 -10C7 -10 8.2 -8 8.2 -5C8.2 -2 6.6 0 4.8 0C3.4 0 2.4 -0.6 1.8 -1.6C2.4 -0.6 3.4 0 4.8 0C6.6 0 7.8 -0.8 9.6 -1"],
  q: [10.4, "M0 -1C1.4 -1.4 1.4 -9.6 4.3 -10C2.5 -10 1 -7.8 1 -5C1 -2.2 2.5 0 4.3 0C6.1 0 7.6 -2.2 7.6 -5L7.8 -10L7.8 9C8.8 6 9 0 10.4 -1"],
  r: [8.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -1L1.8 -5.6C2.6 -8.6 4.2 -10 5.8 -10C6.8 -10 7.6 -9.6 8.2 -8.8", "", 1],
  s: [8.4, "M0 -1C1.6 -2 3 -7 4.4 -10.2C5.6 -8 7.4 -6 7.4 -3.6C7.4 -1.2 5.6 0 3.6 0C2 0 1 -0.6 0.6 -1.6C1 -0.6 2 0 3.6 0C5.6 0 6.8 -0.8 8.4 -1"],
  t: [6.6, "M0 -1C1 -1.4 2.2 -8 2.4 -15L2.4 -3.2C2.4 -0.8 4 -1 6.6 -1", "M-0.8 -9.6L6.2 -9.6"],
  u: [10, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -3.6C1.8 -1 3 0 4.6 0C6.2 0 7.4 -1.4 7.6 -4L7.6 -9.8L7.6 -3C7.6 -0.8 8.6 -1 10 -1"],
  v: [9, "M0 -1C1.2 -1.6 1.6 -6 1.6 -9.6C1.6 -6 2.6 0 4.4 0C6.4 0 7.6 -6 7.6 -9.6C8 -9 8.4 -8.8 9 -8.8", "", 1],
  w: [12.6, "M0 -1C1.2 -1.6 1.6 -6 1.6 -9.6L1.6 -3.6C1.6 -1 2.6 0 4 0C5.4 0 6.2 -1 6.2 -3.6L6.2 -8L6.2 -3.6C6.2 -1 7 0 8.4 0C9.8 0 10.8 -1 10.8 -3.6L10.8 -9.6C11.2 -9 11.8 -8.8 12.6 -8.8", "", 1],
  x: [9, "M0 -1C1.6 -2 2 -8.6 3 -9.6L7 -1C7.6 -0.4 8.4 -1 9 -1", "M7.4 -9.6L2.4 -0.4"],
  y: [9.6, "M0 -1C1.2 -1.6 1.6 -6 1.8 -9.6L1.8 -3.6C1.8 -1 3 0 4.6 0C6.2 0 7.4 -1.4 7.6 -4L7.6 -9.8L7.6 4.4C7.6 9 5.6 9.6 4.2 9.6C2 9.6 1.4 7.6 2.8 6C4.6 4 7.4 1.6 9.6 -1"],
  z: [8.8, "M0 -1C1 -2 1.4 -9.6 2.6 -9.6L7.4 -9.6L1.6 -0.2L6 -0.2C7 -0.2 7.8 -1 8.8 -1"],
  "!": [4, "M2 -16L2 -4.4", "M2 -0.6L2.1 -0.7", 1],
  ".": [3.6, "M1.8 -0.6L1.9 -0.7", "", 1],
}

/** O esticado na horizontal e o vão entre as letras, em unidades da cursiva. */
export const SX = 1.22
export const TRACK = 1
export const WORD_GAP = 6

/** Desloca e estica todo x de um caminho absoluto de M/L/C. */
export const place = (d: string, dx: number, sx: number = SX): string => {
  let k = 0
  return d.replace(/-?\d*\.?\d+/g, (n) => (k++ % 2 === 0 ? String(round(+n * sx + dx)) : n))
}

export type ScriptBox = { x0: number; x1: number; top: number }
export type ScriptWord = { main: string; extra: string[]; width: number; top: number; bottom: number; boxes: ScriptBox[] }

const extent = (d: string): number[] => {
  const n = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number)
  return n.filter((_, i) => i % 2 === 1)
}

/**
 * Arranja o texto na cursiva: um traço principal contínuo (só levanta onde a letra
 * levanta ou num espaço) e os traços com a caneta levantada, desenhados depois.
 * Maiúsculas viram minúsculas, os acentos saem, e o que não existe vira espaço.
 */
export const layoutScript = (text: string): ScriptWord => {
  const clean = String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
  let x = 0
  let main = ""
  const extra: string[] = []
  const boxes: ScriptBox[] = []
  let lift = true
  let top = 0
  let bottom = 0
  for (const ch of clean) {
    const g = SCRIPT[ch]
    if (!g) {
      if (main) x += WORD_GAP
      lift = true
      continue
    }
    const d = place(g[1], x)
    main += lift ? d : "L" + d.slice(1)
    if (g[2]) extra.push(place(g[2], x))
    const ys = extent(g[1] + (g[2] ?? ""))
    const t = Math.min(...ys)
    top = Math.min(top, t)
    bottom = Math.max(bottom, ...ys)
    boxes.push({ x0: round(x), x1: round(x + g[0] * SX), top: t })
    lift = !!g[3]
    x += g[0] * SX + TRACK
  }
  return { main, extra, width: boxes.length ? round(x - TRACK) : 0, top, bottom, boxes }
}

/** Uma estrela fechada: `points` pontas, raios alternados. */
export const starPath = (points: number, outer: number, inner: number, cx: number = 0, cy: number = 0, wobble: number = 0, seed: number = 0): string => {
  const n = Math.max(3, Math.floor(points) || 3)
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 ? inner : outer * (1 + (hash(i * 9.7 + seed) - 0.5) * wobble)
    pts.push(round(cx + Math.cos(a) * r) + " " + round(cy + Math.sin(a) * r))
  }
  return "M" + pts.join("L") + "Z"
}

/** Um selo de borda ondulada: `n` arcos em volta de um círculo. */
export const scallopPath = (n: number, r: number, cx: number = 0, cy: number = 0): string => {
  const count = Math.max(3, Math.floor(n) || 3)
  const bump = round(r * Math.sin(Math.PI / count) * 1.06)
  const at = (i: number) => {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2
    return round(cx + Math.cos(a) * r) + " " + round(cy + Math.sin(a) * r)
  }
  let d = "M" + at(0)
  for (let i = 1; i <= count; i++) d += "A" + bump + " " + bump + " 0 0 1 " + at(i)
  return d + "Z"
}

export type Spot = { x: number; y: number; size: number; rotate: number; depth: number }

/**
 * Onde n adesivos pousam numa palavra, em unidades da cursiva: espalhados por igual,
 * cada um no alto da letra embaixo dele (uns por cima dela, outros batidos em cima do
 * traço), com uma inclinação e uma profundidade de paralaxe tiradas da semente.
 */
export const stickerSpots = (word: ScriptWord, n: number, seed: number = 0): Spot[] => {
  const count = Math.max(0, Math.floor(n) || 0)
  if (!count || !word.width) return []
  return Array.from({ length: count }, (_, i) => {
    const x = ((i + 0.5) / count) * word.width
    const box = word.boxes.find((b) => x >= b.x0 && x <= b.x1 + TRACK) ?? word.boxes[word.boxes.length - 1]
    const lift = [1.5, -5, -1, -7, 0.5, -4, -2][i % 7]
    return {
      x: round(x + (hash(i * 4.1 + seed) - 0.5) * 3),
      y: round(clamp(box.top + 2.5 + lift, word.top - 4, -4)),
      size: round(6.4 + hash(i * 2.3 + seed + 1) * 2.4),
      rotate: round((hash(i * 7.7 + seed + 2) - 0.5) * 34),
      depth: round(0.4 + hash(i * 5.5 + seed + 3) * 0.8),
    }
  })
}

export type StickerKind = "stamp" | "sun" | "watermelon" | "bubble" | "vinyl" | "rocket" | "coffee"

export type StickerSpec =
  | StickerKind
  | {
      kind?: StickerKind
      /** A sua arte (um <img>, um <svg>…). Substitui `kind`. */
      node?: React.ReactNode
      /** O nome para o leitor de tela, como "Adesivo do sol". */
      label?: string
      /** O texto dos adesivos stamp e bubble. */
      text?: string
      /** A posição em % da caixa da palavra; sem ela, ele acha uma letra. */
      x?: number
      y?: number
      /** A largura em % da caixa da palavra. */
      size?: number
      rotate?: number
    }

export type SocialKind = "linkedin" | "instagram" | "tiktok" | "x" | "youtube" | "dribbble"
export type Social = { kind: SocialKind; href: string; label?: string }
export type Job = { title: string; href?: string }
export type Credit = { role: string; name: string }

export interface StickerSlapFooterProps {
  /** A palavra gigante, na cursiva. Letras de a a z, `!` e `.`; o resto vira espaço. */
  wordmark?: string
  /** Para onde a palavra pequena da barra de cima leva. */
  homeHref?: string
  /** O link da estrela no canto de cima. `""` esconde. */
  navLabel?: string
  navHref?: string
  /** O link de mensagem: o balão do canto e a linha do contato. `""` esconde os dois. */
  chatHref?: string
  chatLabel?: string
  jobsLabel?: string
  /** `[]` esconde a coluna. */
  jobs?: Job[]
  officeLabel?: string
  /** Uma linha por item. `[]` esconde a coluna. */
  address?: string[]
  mapLabel?: string
  mapHref?: string
  contactLabel?: string
  /** O clique copia (sem permissão, abre o `mailto:`). `""` esconde. */
  email?: string
  copiedLabel?: string
  /** As letras miúdas embaixo do contato. `""` esconde. */
  note?: string
  socials?: Social[]
  stickers?: StickerSpec[]
  /** `[]` esconde os créditos. */
  credits?: Credit[]
  creditsLabel?: string
  /** Falso: os links viram texto, para o rodapé caber dentro de outro link. */
  links?: boolean
  /** A altura mínima. Qualquer comprimento definido do CSS. */
  height?: string
  /** O teto da altura da palavra, para palavra curta não ficar enorme. */
  wordmarkMaxHeight?: string
  /** A moldura. */
  paper?: string
  /** O painel. */
  panel?: string
  /** O texto da moldura e das etiquetas. */
  ink?: string
  /** A palavra e o texto do painel. Sem ela, vale `paper`. */
  cream?: string
  /** A estrela do canto e o contorno do foco. */
  accent?: string
  fontSans?: string
  onStickerMove?: (index: number, x: number, y: number) => void
  className?: string
}

const DEFAULT_JOBS: Job[] = [{ title: "motion designer sênior", href: "#" }, { title: "produção júnior", href: "#" }]
const DEFAULT_SOCIALS: Social[] = [
  { kind: "linkedin", href: "#" },
  { kind: "instagram", href: "#" },
  { kind: "tiktok", href: "#" },
]
// o balão com lugar marcado: no lugar calculado para esta palavra, ele cobria o pingo do i
const DEFAULT_STICKERS: StickerSpec[] = ["stamp", "sun", "watermelon", { kind: "bubble", x: 63, y: 17 }, "vinyl", "rocket"]
const DEFAULT_CREDITS: Credit[] = [
  { role: "design e código", name: "a turma da brisa" },
  { role: "adesivos", name: "desenhados em código, pode descolar" },
  { role: "letra", name: "uma caneta de feltro e a fonte do sistema" },
]

const LABELS: Record<StickerKind, string> = {
  stamp: "Adesivo do selo",
  sun: "Adesivo do sol de óculos",
  watermelon: "Adesivo da melancia",
  bubble: "Adesivo do balão de fala",
  vinyl: "Adesivo do disco de vinil",
  rocket: "Adesivo do foguete",
  coffee: "Adesivo da xícara de café",
}

/** O quanto abaixo da linha de base a borda do painel corta a palavra, em unidades da cursiva. */
const CUT = -1.2
const STROKE = 3.3
/** A cursiva inclina: tan(9°). */
const SLANT = 0.1584

const SQUIGGLE = "M1 5C7 1 11 1 15 4S24 8 29 4S38 0 43 4S52 8 57 4S66 1 71 4S80 7 87 3"

const ICONS: Record<SocialKind, React.ReactNode> = {
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="M8 10.5V16.5M12 16.5V10.5M12 13.2C12 11.6 13.1 10.4 14.6 10.4C16.1 10.4 17 11.4 17 13.1V16.5" />
      <path className="ssf-dot" d="M8 7.4L8 7.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5.2" />
      <circle cx="12" cy="12" r="3.8" />
      <path className="ssf-dot" d="M16.9 7.1L16.9 7.2" />
    </>
  ),
  tiktok: <path d="M13.6 4V15A3.3 3.3 0 1 1 10.3 11.7M13.6 4C14 6.6 15.8 8.2 18.4 8.4" />,
  x: <path d="M5 4.5H8.8L19 19.5H15.2ZM18.6 4.5L13.3 10.5M5.4 19.5L10.7 13.5" />,
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12.4" rx="4" />
      <path d="M10.4 9.6L14.6 12.2L10.4 14.8Z" />
    </>
  ),
  dribbble: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M7.4 4.9C11 9 13.6 14 15 20.2M3.6 10.6C9 11 14 9.6 18 6.2M5.6 17.6C8.6 14 13 12.6 20.4 13.4" />
    </>
  ),
}

const CSS =
  ".ssf{position:relative;isolation:isolate;overflow:hidden;overflow:clip;container-type:inline-size;display:flex;flex-direction:column;width:100%;box-sizing:border-box;padding:0 clamp(6px,.9cqw,12px) clamp(6px,.9cqw,12px);background:var(--ssf-paper);color:var(--ssf-ink);font-family:var(--ssf-sans);font-weight:500;letter-spacing:0;-webkit-font-smoothing:antialiased}" +
  ":where(.ssf) *,:where(.ssf) *::before,:where(.ssf) *::after{box-sizing:border-box}" +
  ":where(.ssf) button{appearance:none;background:none;border:0;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer}" +
  ":where(.ssf) a{color:inherit;text-decoration:none}" +
  ":where(.ssf) ul,:where(.ssf) p,:where(.ssf) h3{margin:0;padding:0;list-style:none;font:inherit}" +
  ".ssf svg{display:block;max-width:none;overflow:visible}" +
  ".ssf :focus-visible{outline:2.5px solid var(--ssf-accent);outline-offset:3px;border-radius:6px}" +
  ".ssf-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}" +
  // a barra de cima
  ".ssf-top{position:relative;z-index:2;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:clamp(14px,2cqw,26px) clamp(10px,1.6cqw,22px) clamp(24px,5cqw,80px)}" +
  ".ssf-nav{justify-self:start;position:relative;display:grid;place-items:center;width:clamp(58px,6.2cqw,80px);height:clamp(42px,4.4cqw,56px);font-weight:800;font-size:clamp(15px,1.6cqw,20px);letter-spacing:-.02em;color:var(--ssf-ink)}" +
  ".ssf-nav svg{position:absolute;left:-6%;top:-14%;width:72%;height:auto;color:var(--ssf-accent);transition:transform .7s cubic-bezier(.2,1.4,.3,1)}" +
  ".ssf-nav span{position:relative;transition:transform .4s cubic-bezier(.2,1.6,.3,1)}" +
  "a.ssf-nav:hover svg{transform:rotate(72deg) scale(1.12)}" +
  "a.ssf-nav:hover span{transform:rotate(-6deg) scale(1.06)}" +
  ".ssf-logo{display:block;color:var(--ssf-ink)}" +
  ".ssf-logo svg{height:clamp(24px,2.5cqw,34px);width:auto}" +
  ".ssf-logo path{fill:none;stroke:currentColor;stroke-width:3.3;stroke-linecap:round;stroke-linejoin:round}" +
  ".ssf-chat{justify-self:end;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;color:var(--ssf-ink);transition:transform .45s cubic-bezier(.2,1.6,.3,1)}" +
  ".ssf-chat svg{width:24px;height:24px}" +
  "a.ssf-chat:hover{transform:rotate(-14deg) scale(1.12)}" +
  // o painel
  ".ssf-panel{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;overflow:hidden;overflow:clip;border-radius:clamp(14px,1.8cqw,24px);background:var(--ssf-panel);color:var(--ssf-cream);transform-origin:50% 100%}" +
  ".ssf-cols{position:relative;z-index:1;display:grid;grid-template-columns:repeat(var(--ssf-n,3),minmax(0,1fr));gap:clamp(22px,3cqw,44px) clamp(16px,2.4cqw,36px);padding:clamp(26px,5.4cqw,72px) clamp(18px,1.8cqw,26px) clamp(20px,3cqw,40px)}" +
  ".ssf-col{display:flex;flex-direction:column;align-items:flex-start;min-width:0}" +
  ".ssf-tag{display:inline-block;margin-bottom:clamp(14px,1.6cqw,22px);padding:.28em .72em .32em;border-radius:999px;background:var(--ssf-cream);color:var(--ssf-ink);font-size:clamp(12px,1.05cqw,14px);font-weight:600;line-height:1.2;letter-spacing:-.005em}" +
  ".ssf-big{font-size:clamp(19px,2.1cqw,30px);font-weight:800;line-height:1.16;letter-spacing:-.022em}" +
  ".ssf-line{display:block;overflow:hidden;overflow:clip;padding:0 .08em .06em;margin:0 -.08em -.06em}" +
  ".ssf-line>*{display:inline-block}" +
  ".ssf-big a,.ssf-big button{position:relative;text-align:left;transition:color .2s}" +
  ".ssf-big a::after,.ssf-big button::after{content:'';position:absolute;left:0;right:0;bottom:-.02em;height:.09em;border-radius:1em;background:currentColor;transform:scaleX(0);transform-origin:100% 50%;transition:transform .45s cubic-bezier(.6,0,.2,1)}" +
  ".ssf-big a:hover::after,.ssf-big button:hover::after,.ssf-big a:focus-visible::after,.ssf-big button:focus-visible::after{transform:scaleX(1);transform-origin:0 50%}" +
  ".ssf-copy{display:inline-grid !important}" +
  ".ssf-copy>span{grid-area:1/1;transition:transform .5s cubic-bezier(.2,1.2,.3,1),opacity .3s}" +
  ".ssf-copy .ssf-done{transform:translateY(105%);opacity:0}" +
  ".ssf-copy.is-copied .ssf-addr{transform:translateY(-105%);opacity:0}" +
  ".ssf-copy.is-copied .ssf-done{transform:none;opacity:1}" +
  ".ssf-ast{display:inline-block;margin-left:.04em;transition:transform .6s cubic-bezier(.2,1.6,.3,1)}" +
  ".ssf-big a:hover .ssf-ast{transform:rotate(180deg) scale(1.2)}" +
  ".ssf-map{position:relative;display:inline-block;margin-top:clamp(16px,1.8cqw,24px);font-size:clamp(14px,1.25cqw,17px);font-weight:700;letter-spacing:-.01em;padding-bottom:.55em}" +
  ".ssf-map svg{position:absolute;left:-2%;bottom:0;width:104%;height:.5em}" +
  ".ssf-map path{fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-dasharray:var(--l,120px) var(--l,120px);stroke-dashoffset:0}" +
  "a.ssf-map:hover path,a.ssf-map:focus-visible path{animation:ssf-rewrite .7s cubic-bezier(.6,0,.3,1)}" +
  ".ssf-note{margin-top:clamp(12px,1.3cqw,18px);max-width:34ch;font-size:clamp(11px,.92cqw,13px);line-height:1.45;opacity:.82}" +
  ".ssf-socials{display:flex;gap:clamp(8px,.9cqw,12px);margin-top:clamp(16px,2cqw,26px)}" +
  ".ssf-soc{display:grid;place-items:center;width:clamp(34px,2.9cqw,40px);height:clamp(34px,2.9cqw,40px);border-radius:12px;color:var(--ssf-cream);box-shadow:inset 0 0 0 1.5px color-mix(in oklab,var(--ssf-cream) 45%,transparent);transition:background .25s,color .25s,box-shadow .25s,transform .45s cubic-bezier(.2,1.6,.3,1)}" +
  ".ssf-soc svg{width:58%;height:58%}" +
  ".ssf-soc svg *{fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}" +
  ".ssf-soc .ssf-dot{stroke-width:2.8}" +
  "a.ssf-soc:hover,a.ssf-soc:focus-visible{background:var(--ssf-cream);color:var(--ssf-panel);box-shadow:inset 0 0 0 1.5px var(--ssf-cream);transform:translateY(-3px) rotate(-8deg)}" +
  // o palco da palavra: por cima das colunas, para o adesivo arrastado até lá cobrir o texto e continuar pegável
  ".ssf-stage{position:relative;z-index:2;margin-top:auto;width:min(100%,calc(var(--ssf-wmh) * var(--ssf-ar)));align-self:center;padding:0 clamp(6px,.8cqw,12px)}" +
  ".ssf-stage-in{position:relative;container-type:inline-size}" +
  ".ssf-wm-btn{display:block;width:100%;border-radius:0 !important;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
  ".ssf-wm{width:100%;height:auto;color:var(--ssf-cream)}" +
  ".ssf-wm path{fill:none;stroke:currentColor;stroke-width:" + STROKE + ";stroke-linecap:round;stroke-linejoin:round}" +
  // os adesivos
  ".ssf-st{position:absolute;z-index:3;translate:-50% -50%;touch-action:none;user-select:none;-webkit-user-select:none}" +
  ".ssf-st-btn{display:block;width:100%;cursor:grab;rotate:calc(var(--r) + var(--tilt,0deg));transition:rotate .5s cubic-bezier(.2,1.4,.3,1)}" +
  ".ssf-st.is-drag{z-index:9}" +
  ".ssf-st.is-drag .ssf-st-btn{cursor:grabbing;transition:rotate .12s linear}" +
  ".ssf-st-lift{display:block;transition:transform .35s cubic-bezier(.2,1.5,.3,1),filter .35s}" +
  ".ssf-st-lift{filter:drop-shadow(0 1px .5px rgba(2,32,22,.32)) drop-shadow(0 4px 6px rgba(2,32,22,.22))}" +
  ".ssf-st-btn:hover .ssf-st-lift,.ssf-st-btn:focus-visible .ssf-st-lift{transform:translateY(-4%) scale(1.06);filter:drop-shadow(0 2px 1px rgba(2,32,22,.24)) drop-shadow(0 14px 16px rgba(2,32,22,.34))}" +
  ".ssf-st.is-drag .ssf-st-lift{transform:translateY(-7%) scale(1.12);filter:drop-shadow(0 2px 1px rgba(2,32,22,.2)) drop-shadow(0 22px 22px rgba(2,32,22,.38))}" +
  ".ssf-st-slap{display:block}" +
  ".ssf-st svg{width:100%;height:auto}" +
  ".ssf-sheen{transform:translateX(-130%);transition:transform 0s}" +
  ".ssf-st-btn:hover .ssf-sheen{transform:translateX(130%);transition:transform .9s cubic-bezier(.4,0,.2,1)}" +
  ".ssf-ring{position:absolute;left:50%;top:50%;width:150%;aspect-ratio:1;translate:-50% -50%;border-radius:50%;border:2px solid var(--ssf-cream);opacity:0;pointer-events:none}" +
  // os créditos
  ".ssf-credits{position:absolute;z-index:6;right:clamp(10px,1.2cqw,16px);bottom:clamp(10px,1.2cqw,16px)}" +
  ".ssf-pill{display:block;padding:.3em .8em .34em;border-radius:999px;background:var(--ssf-ink);color:var(--ssf-paper);font-size:clamp(12px,1cqw,14px);font-weight:600;transition:transform .4s cubic-bezier(.2,1.6,.3,1),background .2s}" +
  ".ssf-pill:hover{transform:rotate(-5deg) scale(1.06)}" +
  ".ssf-pop{position:absolute;right:0;bottom:calc(100% + 10px);width:max-content;max-width:min(300px,80cqw);padding:14px 16px;border-radius:16px;background:var(--ssf-paper);color:var(--ssf-ink);box-shadow:0 0 0 4px #fff,0 18px 40px rgba(2,32,22,.4);transform-origin:90% 100%;animation:ssf-popin .45s cubic-bezier(.2,1.5,.3,1)}" +
  ".ssf-pop li{display:flex;flex-direction:column;padding:6px 0;font-size:13px;line-height:1.3}" +
  ".ssf-pop li+li{border-top:1.5px dashed color-mix(in oklab,var(--ssf-ink) 22%,transparent)}" +
  ".ssf-pop b{font-size:11px;font-weight:600;opacity:.6;text-transform:lowercase}" +
  ".ssf-pop strong{font-weight:800;letter-spacing:-.01em}" +
  "@container (max-width: 760px){.ssf-cols{grid-template-columns:minmax(0,1fr)}.ssf-top{padding-bottom:24px}.ssf-stage{width:min(118%,calc(var(--ssf-wmh) * var(--ssf-ar)));max-width:none}}" +
  "@keyframes ssf-rewrite{0%{stroke-dashoffset:var(--l,120px)}100%{stroke-dashoffset:0}}" +
  "@keyframes ssf-popin{from{opacity:0;transform:translateY(10px) scale(.7) rotate(4deg)}}" +
  // o roteiro: tudo acima é o estado final, e o movimento só acrescenta o jeito de chegar lá
  "@media (prefers-reduced-motion: no-preference){" +
  ".ssf-panel{scale:calc(.9 + .1 * var(--ssf-sp,1));border-radius:calc(clamp(14px,1.8cqw,24px) + (1 - var(--ssf-sp,1)) * 60px)}" +
  ".ssf-stage-in{transform:translateY(calc((1 - var(--ssf-sp,1)) * 18%))}" +
  ".ssf-st{transform:translate(calc(var(--ssf-px,0) * var(--d) * 9px),calc(var(--ssf-py,0) * var(--d) * 6px));transition:transform .7s cubic-bezier(.2,.8,.2,1)}" +
  ".ssf-st.is-drag{transition:none}" +
  ".ssf:not(.is-in) .ssf-top>*,.ssf:not(.is-in) .ssf-tag,.ssf:not(.is-in) .ssf-line>*,.ssf:not(.is-in) .ssf-map,.ssf:not(.is-in) .ssf-note,.ssf:not(.is-in) .ssf-soc,.ssf:not(.is-in) .ssf-pill{opacity:0}" +
  ".ssf.is-in .ssf-top>*{animation:ssf-fall .8s cubic-bezier(.2,1.3,.3,1) both}" +
  ".ssf.is-in .ssf-top>:nth-child(2){animation-delay:.08s}.ssf.is-in .ssf-top>:nth-child(3){animation-delay:.16s}" +
  ".ssf.is-in .ssf-panel{animation:ssf-grow 1.1s cubic-bezier(.7,0,.2,1) both}" +
  ".ssf.is-in .ssf-tag{animation:ssf-pop .7s cubic-bezier(.2,1.7,.3,1) both;animation-delay:calc(.45s + var(--c) * .1s)}" +
  ".ssf.is-in .ssf-line>*{animation:ssf-rise .8s cubic-bezier(.2,.9,.2,1) both;animation-delay:calc(.55s + var(--c) * .1s + var(--i) * .07s)}" +
  ".ssf.is-in .ssf-map,.ssf.is-in .ssf-note{animation:ssf-fade .7s ease both;animation-delay:calc(.85s + var(--c) * .1s)}" +
  ".ssf.is-in .ssf-soc{animation:ssf-pop .6s cubic-bezier(.2,1.7,.3,1) both;animation-delay:calc(1s + var(--i) * .08s)}" +
  ".ssf.is-in .ssf-pill{animation:ssf-pop .6s cubic-bezier(.2,1.7,.3,1) both;animation-delay:var(--end)}" +
  ".ssf .ssf-wm path{stroke-dasharray:var(--l,3000px) calc(var(--l,3000px) + 8px);stroke-dashoffset:calc(var(--l,3000px) + 4px)}" +
  ".ssf:not(.is-in) .ssf-wm path{visibility:hidden}" +
  ".ssf.is-in .ssf-wm path{animation:ssf-write var(--dur) var(--at) cubic-bezier(.55,.1,.35,1) both}" +
  ".ssf:not(.is-in) .ssf-st-slap{opacity:0}" +
  ".ssf.is-in .ssf-st-slap{animation:ssf-slap .62s var(--at) cubic-bezier(.3,1.5,.4,1) both}" +
  ".ssf.is-in .ssf-ring{animation:ssf-ring .7s var(--at) cubic-bezier(.2,.8,.2,1) both}" +
  "a.ssf-logo:hover path{animation:ssf-rewrite 1.1s cubic-bezier(.55,.1,.35,1)}" +
  ".ssf-logo path{stroke-dasharray:var(--l,3000px) calc(var(--l,3000px) + 8px)}" +
  ".ssf-st-btn:active .ssf-st-lift{transform:translateY(-6%) scale(1.1)}" +
  "}" +
  "@keyframes ssf-write{0%{stroke-dashoffset:calc(var(--l,3000px) + 4px);visibility:visible}100%{stroke-dashoffset:0;visibility:visible}}" +
  "@keyframes ssf-fall{from{opacity:0;transform:translateY(-14px) rotate(-6deg)}}" +
  "@keyframes ssf-grow{0%{clip-path:inset(30% 12% 0 12% round 80px);transform:translateY(40px)}100%{clip-path:inset(0 0 0 0 round 0);transform:none}}" +
  "@keyframes ssf-pop{0%{opacity:0;transform:scale(.4) rotate(-12deg)}100%{opacity:1;transform:none}}" +
  "@keyframes ssf-rise{from{opacity:1;transform:translateY(110%)}to{opacity:1;transform:none}}" +
  "@keyframes ssf-fade{from{opacity:0;transform:translateY(8px)}}" +
  "@keyframes ssf-slap{0%{opacity:0;transform:scale(2.1) rotate(24deg) translateY(-30%);filter:blur(1.5px)}55%{opacity:1;transform:scale(.9) rotate(-3deg);filter:none}78%{transform:scale(1.05) rotate(1deg)}100%{opacity:1;transform:none}}" +
  "@keyframes ssf-ring{0%{opacity:0;transform:scale(.3)}40%{opacity:.75}100%{opacity:0;transform:scale(1)}}"

/** Grava em --l o comprimento de verdade de cada caminho, para o desenho entrar. */
const useStrokeLengths = (ref: React.RefObject<Element | null>, key: string) =>
  React.useEffect(() => {
    ref.current?.querySelectorAll<SVGPathElement>("path[data-draw]").forEach((p) => {
      p.style.setProperty("--l", Math.ceil(p.getTotalLength()) + 1 + "px")
    })
  }, [ref, key])

/** Uma palavra na cursiva, encolhida para caber: as legendas dos adesivos. */
function ScriptText({ text, cx, cy, w, color, stroke = STROKE }: { text: string; cx: number; cy: number; w: number; color: string; stroke?: number }) {
  const { main, extra, width, top } = React.useMemo(() => layoutScript(text), [text])
  if (!width) return null
  const s = w / (width + stroke)
  const h = (-top + 1) * s
  return (
    <g transform={"translate(" + round(cx - (width * s) / 2) + " " + round(cy + h / 2 - s) + ") scale(" + round(s) + ")"}>
      <path d={main + extra.join("")} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

const STAMP = scallopPath(14, 47, 60, 60)
const SUN = starPath(12, 58, 40, 60, 60)
const RIND = "M6 34H114A54 54 0 0 1 6 34Z"
const BUBBLE = "M62 14C91 14 112 31 112 53C112 75 91 92 62 92C54 92 47 91 40 88L14 104L23 79C13 72 8 63 8 53C8 31 32 14 62 14Z"
const HULL = "M60 4C79 20 87 44 85 72H35C33 44 41 20 60 4Z"
const FIN_L = "M36 50L16 82L37 76Z"
const FIN_R = "M84 50L104 82L83 76Z"
const FLAME = "M44 76H76L60 116Z"
const MUG = "M18 44H88V84A20 20 0 0 1 68 104H38A20 20 0 0 1 18 84Z"

/** A silhueta (o recorte branco) e a arte por cima, numa caixa de 120 × 120. */
const stickerArt = (kind: StickerKind, text?: string): { shape: React.ReactNode; art: React.ReactNode } => {
  switch (kind) {
    case "stamp":
      return {
        shape: <path d={STAMP} />,
        art: (
          <>
            <path d={STAMP} fill="#ff7a1a" />
            <circle cx="60" cy="60" r="37" fill="none" stroke="#fff3d6" strokeWidth="2.6" strokeDasharray="1 7" strokeLinecap="round" />
            <ScriptText text={text ?? "oba!"} cx={60} cy={59} w={62} color="#2a1405" stroke={2.5} />
          </>
        ),
      }
    case "sun":
      return {
        shape: <path d={SUN} />,
        art: (
          <>
            <path d={SUN} fill="#ffb300" />
            <circle cx="60" cy="60" r="34" fill="#ffd93b" />
            <rect x="32" y="46" width="25" height="17" rx="7" fill="#17140f" />
            <rect x="63" y="46" width="25" height="17" rx="7" fill="#17140f" />
            <path d="M55 51H65" stroke="#17140f" strokeWidth="4" />
            <path d="M38 50L44 56M69 50L75 56" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
            <path d="M46 74Q60 88 74 74" fill="none" stroke="#17140f" strokeWidth="4.5" strokeLinecap="round" />
          </>
        ),
      }
    case "watermelon":
      return {
        shape: <path d={RIND} />,
        art: (
          <>
            <path d={RIND} fill="#1f9d57" />
            <path d="M11 34H109A49 49 0 0 1 11 34Z" fill="#e7f8d9" />
            <path d="M16 34H104A44 44 0 0 1 16 34Z" fill="#ff4d67" />
            <g fill="#1b1416">
              <ellipse cx="38" cy="46" rx="3" ry="5" transform="rotate(16 38 46)" />
              <ellipse cx="60" cy="44" rx="3" ry="5" />
              <ellipse cx="82" cy="46" rx="3" ry="5" transform="rotate(-16 82 46)" />
              <ellipse cx="49" cy="62" rx="3" ry="5" transform="rotate(10 49 62)" />
              <ellipse cx="71" cy="62" rx="3" ry="5" transform="rotate(-10 71 62)" />
            </g>
          </>
        ),
      }
    case "bubble":
      return {
        shape: <path d={BUBBLE} />,
        art: (
          <>
            <path d={BUBBLE} fill="#c9a8ff" />
            <ScriptText text={text ?? "oi!"} cx={61} cy={52} w={text ? 76 : 40} color="#35137a" stroke={2.5} />
          </>
        ),
      }
    case "vinyl":
      return {
        shape: <circle cx="60" cy="60" r="52" />,
        art: (
          <>
            <circle cx="60" cy="60" r="52" fill="#17161a" />
            <g fill="none" stroke="#3b3942" strokeWidth="1.4">
              <circle cx="60" cy="60" r="44" />
              <circle cx="60" cy="60" r="37" />
              <circle cx="60" cy="60" r="30" />
            </g>
            <path d="M24 38A42 42 0 0 1 46 20M96 82A42 42 0 0 1 74 100" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".55" />
            <circle cx="60" cy="60" r="20" fill="#ff4f93" />
            <circle cx="60" cy="60" r="13" fill="none" stroke="#ffd0e3" strokeWidth="1.6" />
            <circle cx="60" cy="60" r="3.6" fill="#fff" />
          </>
        ),
      }
    case "coffee":
      return {
        shape: (
          <>
            <path d={MUG} />
            <circle cx="90" cy="66" r="19" />
            <rect x="36" y="14" width="9" height="24" rx="4.5" />
            <rect x="58" y="10" width="9" height="28" rx="4.5" />
          </>
        ),
        art: (
          <>
            <circle cx="90" cy="66" r="14" fill="none" stroke="#d8352a" strokeWidth="8" />
            <path d={MUG} fill="#d8352a" />
            <rect x="18" y="44" width="70" height="9" fill="#4a2616" />
            <path d="M53 90C42 82 38 76 41 70C44 65 50 65 53 70C56 65 62 65 65 70C68 76 64 82 53 90Z" fill="#fff3d6" />
            <rect x="36" y="14" width="9" height="24" rx="4.5" fill="#c9b8a4" />
            <rect x="58" y="10" width="9" height="28" rx="4.5" fill="#c9b8a4" />
          </>
        ),
      }
    case "rocket":
    default:
      return {
        shape: (
          <>
            <path d={HULL} />
            <path d={FIN_L} />
            <path d={FIN_R} />
            <path d={FLAME} />
          </>
        ),
        art: (
          <>
            <path d={FLAME} fill="#ff7a1a" />
            <path d="M51 76H69L60 100Z" fill="#ffd93b" />
            <path d={FIN_L} fill="#ffb300" />
            <path d={FIN_R} fill="#ffb300" />
            <path d={HULL} fill="#ef3e4a" />
            <path d="M60 4C69 12 75 21 79 32H41C45 21 51 12 60 4Z" fill="#fff3d6" />
            <circle cx="60" cy="48" r="12" fill="#fff" />
            <circle cx="60" cy="48" r="8" fill="#49c6f0" />
            <path d="M56 45A5 5 0 0 1 61 42" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          </>
        ),
      }
  }
}

function StickerSvg({ kind, text }: { kind: StickerKind; text?: string }) {
  const id = "ssf" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const { shape, art } = stickerArt(kind, text)
  return (
    <svg viewBox="-6 -6 132 132" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id + "c"}>{shape}</clipPath>
        <linearGradient id={id + "g"} x1="0" x2="1" y1="0" y2="0">
          <stop offset=".35" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".65" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="#fff" stroke="#fff" strokeWidth="11" strokeLinejoin="round">
        {shape}
      </g>
      {art}
      <g clipPath={"url(#" + id + "c)"}>
        <g transform="rotate(20 60 60)">
          <rect className="ssf-sheen" x="-30" y="-30" width="180" height="180" fill={"url(#" + id + "g)"} />
        </g>
      </g>
    </svg>
  )
}

const isExternal = (href?: string) => !!href && /^https?:/.test(href)

/** Um link de verdade, ou texto quando o rodapé está dentro de outro link (links={false}). */
function Go({ live, href, children, ...rest }: { live: boolean; href?: string; children: React.ReactNode; className?: string; style?: React.CSSProperties; "aria-label"?: string }) {
  if (!live) return <span {...rest}>{children}</span>
  return (
    <a
      {...rest}
      href={href || "#"}
      target={isExternal(href) ? "_blank" : undefined}
      rel={isExternal(href) ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (!href || href === "#") e.preventDefault()
      }}
    >
      {children}
    </a>
  )
}

type Placed = { x: number; y: number }

export default function StickerSlapFooter({
  wordmark = "brisa",
  homeHref = "#",
  navLabel = "obras",
  navHref = "#",
  chatHref = "#",
  chatLabel = "manda um áudio",
  jobsLabel = "procurando trabalho?",
  jobs = DEFAULT_JOBS,
  officeLabel = "estúdio",
  address = ["rua das laranjeiras, 17", "são paulo, sp"],
  mapLabel = "Google Maps",
  mapHref = "#",
  contactLabel = "contato",
  email = "ola@brisa.studio",
  copiedLabel = "copiado, até já!",
  note = "*ligação dá um frio na barriga. mensagem e áudio são sempre bem-vindos.",
  socials = DEFAULT_SOCIALS,
  stickers = DEFAULT_STICKERS,
  credits = DEFAULT_CREDITS,
  creditsLabel = "créditos",
  links = true,
  height = "100svh",
  wordmarkMaxHeight = "43svh",
  paper = "#f6efe0",
  panel = "#0c5f46",
  ink = "#15120e",
  cream,
  accent = "#ff4f93",
  fontSans = "'DM Sans', 'Manrope', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  onStickerMove,
  className = "",
}: StickerSlapFooterProps) {
  const rootRef = React.useRef<HTMLElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const popRef = React.useRef<HTMLDivElement>(null)
  const [seen, setSeen] = React.useState(false)
  const [run, setRun] = React.useState(0)
  const [copied, setCopied] = React.useState(0)
  const [open, setOpen] = React.useState(false)
  const [moved, setMoved] = React.useState<Record<number, Placed>>({})
  const [order, setOrder] = React.useState<number[]>([])
  const drag = React.useRef<{ i: number; id: number; sx: number; sy: number; px: number; py: number; lx: number; t: number; tilt: number; w: number; h: number; went: boolean } | null>(null)

  const word = React.useMemo(() => layoutScript(wordmark), [wordmark])
  const small = word
  const pad = STROKE / 2 + 0.6
  const vbX = -1.4 - pad
  const vbY = word.top - pad
  const vbW = Math.max(word.width, 1) + 2.8 + pad * 2 - word.top * SLANT
  const vbH = word.bottom + pad - vbY
  const cutH = CUT - vbY
  const smallVb = [-pad - 1, small.top - pad, Math.max(small.width, 1) + pad * 2 + 2 - small.top * SLANT, -small.top + pad * 2 + 1].map(round).join(" ")

  const spots = React.useMemo(() => stickerSpots(word, stickers.length, 3), [word, stickers.length])
  const drawDur = clamp(0.7 + word.width / 45, 1.1, 2.6)
  const writeAt = 1.05
  const toPct = (s: Spot) => ({ x: ((s.x - s.y * SLANT - vbX) / vbW) * 100, y: ((s.y - vbY) / vbH) * 100 })

  const items = stickers.map((spec, i) => {
    const o = typeof spec === "string" ? { kind: spec } : spec
    const spot = spots[i] ?? { x: 0, y: 0, size: 11, rotate: 0, depth: 1 }
    const auto = toPct(spot)
    const home = { x: o.x ?? auto.x, y: o.y ?? auto.y }
    const xf = clamp((home.x / 100) * vbW + vbX, 0, word.width) / Math.max(word.width, 1)
    return {
      i,
      kind: (o.kind ?? "stamp") as StickerKind,
      node: o.node,
      text: o.text,
      label: o.label ?? LABELS[(o.kind ?? "stamp") as StickerKind],
      home,
      at: moved[i] ?? home,
      size: o.size ?? (spot.size / vbW) * 100,
      rotate: o.rotate ?? spot.rotate,
      depth: spot.depth,
      // bate na hora em que a caneta passa embaixo dele
      delay: writeAt + drawDur * Math.pow(xf, 0.92) + 0.08,
    }
  })
  const endAt = writeAt + drawDur + word.extra.length * 0.16 + 0.5

  useStrokeLengths(rootRef, wordmark + run)

  // O roteiro toca uma vez, na primeira vez que um quinto do rodapé aparece na tela.
  React.useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Preso à rolagem: 0 com o rodapé ainda abaixo da dobra, 1 quando ele enche a tela (ou está todo à vista), suavizado em --ssf-sp.
  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = document.documentElement.clientHeight || r.height
      const span = Math.min(r.height, vh) || 1
      const p = clamp((vh - r.top) / span, 0, 1)
      el.style.setProperty("--ssf-sp", (1 - Math.pow(1 - p, 2)).toFixed(4))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    addEventListener("scroll", onScroll, { passive: true, capture: true })
    addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener("scroll", onScroll, { capture: true })
      removeEventListener("resize", onScroll)
    }
  }, [])

  React.useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(0), 2200)
    return () => clearTimeout(id)
  }, [copied])

  React.useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      // o Esc fecha só os créditos, não o que estiver em volta do rodapé
      if (e.key === "Escape") {
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

  const copy = async () => {
    if (!email) return
    try {
      await navigator.clipboard.writeText(email)
      setCopied((c) => c + 1)
    } catch {
      window.location.href = "mailto:" + email
    }
  }

  const raise = (i: number) => setOrder((o) => [...o.filter((k) => k !== i), i])

  const putAt = (i: number, p: Placed, announce: boolean = true) => {
    setMoved((m) => ({ ...m, [i]: p }))
    if (announce) onStickerMove?.(i, round(p.x), round(p.y))
  }

  const wiggle = (el: Element | null, frames: Keyframe[], duration: number) => {
    if (!reduced()) (el as HTMLElement | null)?.animate?.(frames, { duration, easing: "cubic-bezier(.3,1.4,.4,1)" })
  }
  const slapFrames: Keyframe[] = [{ transform: "scale(1.14)" }, { transform: "scale(.93,1.04)", offset: 0.4 }, { transform: "scale(1.02,.98)", offset: 0.7 }, { transform: "none" }]
  const shakeFrames: Keyframe[] = [{ transform: "none" }, { transform: "rotate(-14deg) scale(1.1)", offset: 0.3 }, { transform: "rotate(9deg)", offset: 0.6 }, { transform: "none" }]

  const onDown = (e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    if (e.button !== 0 || !stageRef.current) return
    const r = stageRef.current.getBoundingClientRect()
    const at = items[i].at
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // um ponteiro que já saiu não captura: o arraste segue pelos eventos que chegarem
    }
    drag.current = { i, id: e.pointerId, sx: at.x, sy: at.y, px: e.clientX, py: e.clientY, lx: e.clientX, t: e.timeStamp, tilt: 0, w: r.width, h: r.height, went: false }
    raise(i)
  }
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.px
    const dy = e.clientY - d.py
    if (!d.went && Math.hypot(dx, dy) < 4) return
    const host = e.currentTarget.parentElement
    if (!host) return
    if (!d.went) host.classList.add("is-drag")
    d.went = true
    const x = clamp(d.sx + (dx / d.w) * 100, 1, 99)
    const y = clamp(d.sy + (dy / d.h) * 100, -70, 96)
    host.style.left = x + "%"
    host.style.top = y + "%"
    // inclina com o movimento: a velocidade, suavizada
    const now = e.timeStamp
    const v = (e.clientX - d.lx) / Math.max(1, now - d.t)
    d.tilt = d.tilt * 0.75 + clamp(v * 22, -24, 24) * 0.25
    d.lx = e.clientX
    d.t = now
    host.style.setProperty("--tilt", d.tilt.toFixed(2) + "deg")
  }
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    const host = e.currentTarget.parentElement
    host?.classList.remove("is-drag")
    host?.style.setProperty("--tilt", "0deg")
    const lift = e.currentTarget.querySelector(".ssf-st-lift")
    if (d.went && host) {
      putAt(d.i, { x: parseFloat(host.style.left), y: parseFloat(host.style.top) })
      wiggle(lift, slapFrames, 420)
    } else wiggle(lift, shakeFrames, 520)
  }
  const onKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const step = e.shiftKey ? 6 : 2
    const at = items[i].at
    const go: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (go[e.key]) {
      e.preventDefault()
      raise(i)
      putAt(i, { x: clamp(at.x + go[e.key][0], 1, 99), y: clamp(at.y + go[e.key][1], -70, 96) })
    } else if (e.key === "Home" || e.key === "Escape") {
      e.preventDefault()
      goHome(i, e.currentTarget)
    }
  }
  const goHome = (i: number, btn: HTMLElement) => {
    setMoved((m) => {
      const next = { ...m }
      delete next[i]
      return next
    })
    onStickerMove?.(i, round(items[i].home.x), round(items[i].home.y))
    wiggle(btn.querySelector(".ssf-st-lift"), slapFrames, 420)
  }

  // Escreve de novo: a palavra se redesenha e cada adesivo bate de volta no lugar.
  const replay = () => {
    setMoved({})
    setRun((r) => r + 1)
  }

  const style = {
    "--ssf-paper": paper,
    "--ssf-panel": panel,
    "--ssf-ink": ink,
    "--ssf-cream": cream ?? paper,
    "--ssf-accent": accent,
    "--ssf-sans": fontSans,
    "--ssf-wmh": wordmarkMaxHeight,
    "--ssf-ar": String(round(vbW / cutH)),
    minHeight: height,
  } as React.CSSProperties

  const onPointer = (e: React.PointerEvent<HTMLElement>) => {
    const el = rootRef.current
    if (!el || e.pointerType !== "mouse") return
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) return
    el.style.setProperty("--ssf-px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3))
    el.style.setProperty("--ssf-py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3))
  }
  const onLeave = () => {
    rootRef.current?.style.setProperty("--ssf-px", "0")
    rootRef.current?.style.setProperty("--ssf-py", "0")
  }

  const cols: React.ReactNode[] = []
  if (jobs.length)
    cols.push(
      <div className="ssf-col" key="jobs">
        <h3 className="ssf-tag">{jobsLabel}</h3>
        <ul className="ssf-big">
          {jobs.map((j, i) => (
            <li key={i} className="ssf-line" style={{ "--i": i } as React.CSSProperties}>
              {j.href ? (
                <Go live={links} href={j.href}>
                  {j.title}
                </Go>
              ) : (
                <span>{j.title}</span>
              )}
            </li>
          ))}
        </ul>
      </div>,
    )
  if (address.length)
    cols.push(
      <div className="ssf-col" key="office">
        <h3 className="ssf-tag">{officeLabel}</h3>
        <address className="ssf-big" style={{ fontStyle: "normal" }}>
          {address.map((l, i) => (
            <span key={i} className="ssf-line" style={{ "--i": i } as React.CSSProperties}>
              <span>{l}</span>
            </span>
          ))}
        </address>
        {mapLabel && (
          <Go live={links} className="ssf-map" href={mapHref}>
            {mapLabel}
            <svg viewBox="0 0 88 8" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d={SQUIGGLE} data-draw="" />
            </svg>
          </Go>
        )}
      </div>,
    )
  if (email || chatHref || socials.length)
    cols.push(
      <div className="ssf-col" key="contact">
        <h3 className="ssf-tag">{contactLabel}</h3>
        <ul className="ssf-big">
          {email && (
            <li className="ssf-line" style={{ "--i": 0 } as React.CSSProperties}>
              <button type="button" className={"ssf-copy" + (copied ? " is-copied" : "")} onClick={copy} title="Copiar o e-mail">
                <span className="ssf-addr">{email}</span>
                <span className="ssf-done" aria-hidden="true">
                  {copiedLabel}
                </span>
              </button>
            </li>
          )}
          {chatHref && chatLabel && (
            <li className="ssf-line" style={{ "--i": 1 } as React.CSSProperties}>
              <Go live={links} href={chatHref}>
                {chatLabel}
                {note && <span className="ssf-ast">*</span>}
              </Go>
            </li>
          )}
        </ul>
        {note && <p className="ssf-note">{note}</p>}
        {socials.length > 0 && (
          <ul className="ssf-socials">
            {socials.map((s, i) => (
              <li key={i}>
                <Go live={links} className="ssf-soc" href={s.href} aria-label={s.label ?? s.kind} style={{ "--i": i } as React.CSSProperties}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    {ICONS[s.kind]}
                  </svg>
                </Go>
              </li>
            ))}
          </ul>
        )}
        <span className="ssf-sr" role="status">
          {copied ? "E-mail copiado" : ""}
        </span>
      </div>,
    )

  return (
    <footer
      ref={rootRef}
      className={"ssf" + (seen ? " is-in" : "") + (className ? " " + className : "")}
      style={style}
      onPointerMove={onPointer}
      onPointerLeave={onLeave}
    >
      <style>{CSS}</style>

      <div className="ssf-top">
        {navLabel ? (
          <Go live={links} className="ssf-nav" href={navHref}>
            <svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
              <path d={starPath(11, 48, 30, 0, 0, 0.3, 7)} fill="currentColor" />
            </svg>
            <span>{navLabel}</span>
          </Go>
        ) : (
          <span />
        )}
        <Go live={links} className="ssf-logo" href={homeHref} aria-label={wordmark + ", início"}>
          <svg viewBox={smallVb} aria-hidden="true" focusable="false">
            <path d={small.main + small.extra.join("")} data-draw="" transform="skewX(-9)" />
          </svg>
        </Go>
        {chatHref ? (
          <Go live={links} className="ssf-chat" href={chatHref} aria-label={chatLabel || "Mande uma mensagem"}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 2.6A9.4 9.4 0 0 0 3.9 16.8L2.7 21.3L7.3 20.1A9.4 9.4 0 1 0 12 2.6Z" fill="currentColor" />
              <path d="M8.6 7.6C9.2 7.2 9.7 7.4 10 8L10.6 9.5C10.8 10 10.5 10.4 10.1 10.8C10.8 12.2 11.8 13.2 13.2 13.9C13.6 13.5 14 13.2 14.5 13.4L16 14C16.6 14.3 16.8 14.8 16.4 15.4C15.7 16.4 14.6 16.8 13.4 16.3C10.6 15.2 8.8 13.4 7.7 10.6C7.2 9.4 7.6 8.3 8.6 7.6Z" fill="var(--ssf-paper)" />
            </svg>
          </Go>
        ) : (
          <span />
        )}
      </div>

      <div className="ssf-panel">
        {cols.length > 0 && (
          <div className="ssf-cols" style={{ "--ssf-n": cols.length } as React.CSSProperties}>
            {cols.map((c, k) => (
              <React.Fragment key={k}>{React.cloneElement(c as React.ReactElement<{ style?: React.CSSProperties }>, { style: { "--c": k } as React.CSSProperties })}</React.Fragment>
            ))}
          </div>
        )}

        <div className="ssf-stage">
          <div className="ssf-stage-in" ref={stageRef} style={{ marginBottom: round(-((vbH - cutH) / vbW) * 100) + "%" }}>
            <button type="button" className="ssf-wm-btn" onClick={replay} aria-label={"Escrever " + wordmark + " de novo"}>
              <svg key={run} className="ssf-wm" viewBox={[vbX, vbY, vbW, vbH].map(round).join(" ")} aria-hidden="true" focusable="false">
                <g transform={"skewX(-9)"}>
                  <path d={word.main} data-draw="" style={{ "--dur": drawDur + "s", "--at": writeAt + "s" } as React.CSSProperties} />
                  {word.extra.map((d, k) => (
                    <path key={k} d={d} data-draw="" style={{ "--dur": ".28s", "--at": round(writeAt + drawDur + k * 0.16) + "s" } as React.CSSProperties} />
                  ))}
                </g>
              </svg>
            </button>

            {items.map((s) => (
              <div
                key={s.i}
                className="ssf-st"
                style={
                  {
                    left: s.at.x + "%",
                    top: s.at.y + "%",
                    width: "max(" + round(s.size) + "cqw, 46px)",
                    zIndex: 3 + Math.max(0, order.indexOf(s.i) + 1),
                    "--r": s.rotate + "deg",
                    "--d": s.depth,
                    "--at": round(s.delay) + "s",
                  } as React.CSSProperties
                }
              >
                <button
                  type="button"
                  className="ssf-st-btn"
                  aria-label={s.label + ". Arraste, ou use as setas, para mover. O Esc o põe de volta."}
                  onPointerDown={(e) => onDown(e, s.i)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                  onDoubleClick={(e) => goHome(s.i, e.currentTarget)}
                  onKeyDown={(e) => onKey(e, s.i)}
                >
                  <span key={run} className="ssf-st-slap">
                    <span className="ssf-st-lift">{s.node ?? <StickerSvg kind={s.kind} text={s.text} />}</span>
                  </span>
                </button>
                <span key={"r" + run} className="ssf-ring" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>

        {credits.length > 0 && (
          <div className="ssf-credits" ref={popRef}>
            {open && (
              <ul className="ssf-pop">
                {credits.map((c, i) => (
                  <li key={i}>
                    <b>{c.role}</b>
                    <strong>{c.name}</strong>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="ssf-pill"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              style={{ "--end": round(endAt) + "s" } as React.CSSProperties}
            >
              {creditsLabel}
            </button>
          </div>
        )}
      </div>
    </footer>
  )
}
```

  2. Crie components/sticker-slap-footer-demo.tsx, ao lado da pasta ui, com exatamente este conteúdo. O import é relativo e funciona sem alias; se o rodapé ficou em outro lugar, ajuste só esse caminho:

```tsx
"use client"

import StickerSlapFooter, { type StickerSlapFooterProps } from "./ui/sticker-slap-footer"

/**
 * O rodapé sozinho, na largura toda e com a altura da tela, para o roteiro inteiro aparecer de uma vez. As props passam
 * para o rodapé: <StickerSlapFooterDemo wordmark="estudio" panel="#3a2bd6" />, por exemplo.
 */
export default function StickerSlapFooterDemo(props: StickerSlapFooterProps) {
  return (
    <div style={{ width: "100%" }}>
      <StickerSlapFooter {...props} />
    </div>
  )
}
```

  3. Mostre a demo numa página só dela, que ocupa a tela inteira:
     - Next.js (App Router): crie app/sticker-slap-footer/page.tsx (ou src/app/sticker-slap-footer/page.tsx) que só devolve <StickerSlapFooterDemo />. Se o layout envolver as páginas num container com padding ou largura máxima, a demo fica fora dele.
     - Vite ou outro React sem rotas: o App.tsx só devolve <StickerSlapFooterDemo />. Com react-router, uma rota /sticker-slap-footer.
     - Nada de margem em volta: o body fica com margin: 0. Tire da página da demo os estilos globais de template que centralizam o body ou o #root, dão padding, largura máxima, cor de fundo ou cor de texto (os do create-vite e do create-next-app fazem isso). Pode remover esses estilos de exemplo se o projeto ainda for o template.

Como usar no projeto
  <StickerSlapFooter wordmark="suamarca" email="ola@suamarca.com.br" address={["rua tal, 100", "curitiba, pr"]} jobs={[{ title: "design sênior", href: "/vagas" }]} />
  - wordmark: a palavra gigante e a pequena da barra de cima. De 4 a 8 letras fica melhor: palavra curta encosta no teto de altura, e longa fica menor, porque cabe na largura. Só letras de a a z, ! e . (o resto vira espaço).
  - jobsLabel e jobs, officeLabel, address, mapLabel e mapHref, contactLabel, email, copiedLabel, chatLabel, chatHref e note: o texto e os links das colunas. Coluna com a lista vazia ([]) ou texto vazia ("") some. O e-mail copia no clique; sem permissão para copiar, abre o mailto:.
  - navLabel e navHref: a estrela do canto de cima ("" esconde). homeHref: para onde a palavra pequena leva. socials: [{ kind, href, label }], com linkedin, instagram, tiktok, x, youtube ou dribbble.
  - stickers: a lista de adesivos. Um nome (stamp, sun, watermelon, bubble, vinyl, rocket, coffee) ou um objeto { kind, text, node, label, x, y, size, rotate }: text é o texto do stamp e do bubble (só letras de a a z, ! e .), node é a sua arte (um <img>, um <svg>), x, y e size são porcentagens da caixa da palavra. onStickerMove(índice, x, y) avisa quando um adesivo muda de lugar, para guardar onde a pessoa o deixou.
  - credits ([{ role, name }], [] esconde) e creditsLabel: o balão dos créditos.
  - paper (a moldura), panel (o painel), ink (o texto da moldura e das etiquetas), cream (a palavra e o texto do painel; sem ela, vale paper) e accent (a estrela e o contorno do foco): as cores. fontSans: a fonte.
  - height: a altura mínima, um comprimento definido ("100svh" de fábrica, "720px"). wordmarkMaxHeight: o teto da altura da palavra ("43svh" de fábrica). Se a soma de tudo passar da tela, baixe este.
  - links: falso transforma os links em texto, para o rodapé caber dentro de outro link. className: classes a mais na raiz.
  Os textos de exemplo (a Brisa, DEFAULT_JOBS, DEFAULT_CREDITS) saem quando você passa os seus.

Ajustes
  Os adesivos: stickerArt desenha cada um numa caixa de 120 × 120; acrescentar um é um case novo ali, o nome em StickerKind e a legenda em LABELS. O balão de fábrica tem o lugar marcado em DEFAULT_STICKERS, para não cobrir o pingo do i de "brisa": com outra palavra, troque-o por "bubble" e ele acha uma letra. O tempo da escrita: drawDur (a duração do traço) e writeAt (quando ele começa). A grossura da letra: STROKE. O corte da palavra: CUT. A inclinação: o skewX(-9) e SLANT, que mudam juntos. O tranco do adesivo: slapFrames e o keyframe ssf-slap.

Verificação
  - O typecheck (npx tsc --noEmit; no Vite, npx tsc -b, porque o tsconfig da raiz só aponta para os outros) e o build passam, e o console do navegador fica limpo.
  - Numa tela de desktop, ao abrir: o painel verde cresce de dentro da moldura creme, as etiquetas pulam, as linhas sobem e a palavra "brisa" se escreve da esquerda para a direita, enorme, com a base cortada pela borda de baixo. O pingo do i vem por último. Cada adesivo bate na palavra, com um anel, quando a caneta passa embaixo dele: o selo laranja "oba!", o sol de óculos, a melancia, o balão lilás "oi!", o vinil e o foguete. No fim aparece o botão "créditos", no canto de baixo à direita.
  - Em cima, a estrela rosa com "obras", "brisa" pequeno no meio e o balão de mensagem à direita. No painel, as colunas "procurando trabalho?", "estúdio" (com o Google Maps sublinhado por uma onda) e "contato" (com o e-mail, "manda um áudio*", a nota e três redes).
  - Arrastar um adesivo: ele sobe, inclina com a mão, segue o ponteiro exatamente e, ao soltar, bate no lugar. Dá para deixá-lo em cima das colunas e pegar de novo. Dois cliques o mandam de volta.
  - O clique na palavra apaga a palavra e a escreve de novo, com todos os adesivos batendo de volta no lugar. O clique no e-mail troca o texto por "copiado, até já!" por 2 segundos, e o endereço está na área de transferência. "créditos" abre o balão, e o clique fora ou o Esc o fecham.
  - Pelo teclado: o Tab chega a cada adesivo com um contorno rosa, as setas o movem e o Esc o põe de volta.
  - Numa tela de celular de 375 px, as colunas ficam uma embaixo da outra, a palavra passa um pouco da largura e nada cria rolagem horizontal; os adesivos se arrastam com o dedo sem rolar a página.
  - Com o reduzir movimento do sistema ligado, tudo já aparece pronto, sem o roteiro.

Ao terminar, diga o endereço em que a demo abriu e o caminho de cada arquivo criado.