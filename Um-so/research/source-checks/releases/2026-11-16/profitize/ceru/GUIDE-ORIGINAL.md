# Guia do projeto — Ceru

(Salve como `CLAUDE.md` na raiz do projeto se você usa o Claude Code, ou como `AGENTS.md` se usa o Codex, o Cursor ou outro agente. O conteúdo é o mesmo.)

Landing page da Ceru, uma plataforma de IA de chat fictícia ("Pense alto."). Vite sem framework, GSAP (com ScrollTrigger), Lenis, WebGL2 e três fontes livres (Source Serif 4, Schibsted Grotesk e Caveat). **O topo é uma pintura de paisagem em vídeo impressa por um shader em pixel art de oito tons de céu, com o título e a caixa de conversa no meio; o resto é uma página toda branca, de serifa nos títulos, um azul só de acento e nada arredondado, com as imagens das seções passando pelo mesmo pontilhado.** O código já vem pronto em `arquivos/src/`, a página no `arquivos/index.html`, o vídeo e as imagens em `arquivos/public/`: o trabalho é montar, conferir e, depois, personalizar. A régua é site de premiação: se algo parece "ok", ainda não está pronto.

## Arquitetura
- **Uma seção por arquivo.** O `index.html` só tem o `<head>` e a ordem das seções (`<!-- @secao hero -->` etc.); o plugin `secoes` do `vite.config.js` troca cada marca pelo `src/sections/<nome>.html` no dev e no build. Os textos estão nesses HTML; cada seção tem o seu CSS ao lado. Ordem: `nav`, `hero`, `prova` (selo e logos), `recursos` (abas), `pesquisa` (o rasgo), `como`, `manifesto`, `agentes` (para equipes), `acao`, `fecho` e, fora do `<main>`, `rodape`.
- **O CSS é uma folha só**, `src/styles/site.css` (por `@import`: as fontes, `tokens.css`, `base.css`, `pecas.css` e as seções), ligada por `<link>` no `<head>`. Antes dela, inline: o script que liga o tema (`?tema=`) e a abertura, o fundo branco, a cor do céu da primeira pintura (`.hero { background }`), o "nada transiciona até assentar" e a regra que esconde o texto do hero até o JS montar a abertura (se o JS não subir em 4 s, tudo aparece). Nunca importe CSS pelo JS: no dev do Vite ele chega depois dos módulos e a página pinta crua por um instante a cada recarregamento.
- **Módulos**:

  | arquivo | o que faz |
  |---|---|
  | `src/main.js` | liga tudo: rolagem, hero, conversa, nav, seções, pesquisa e abertura (esta depois das fontes, com teto de 1,5 s) |
  | `src/gl/ceu.frag.glsl` | o shader do céu (ver "O pixel") |
  | `src/gl/ceu.js` | o canvas WebGL2 do shader: tamanho em células, texturas (vídeo, foto), cover da imagem e os parâmetros do `estado` |
  | `src/gl/pixel.js` | o mesmo pontilhado em JS, num canvas 2D, para as imagens das seções (`[data-pixel]`): chegam em blocos e a versão fina é calculada em fatias de 5 ms antes de aparecerem |
  | `src/gl/paleta.js` | lê os oito tons `--px-0…7` e `--fundo` do CSS (o shader e as imagens usam a paleta do tema) |
  | `src/motion/hero.js` | o céu do hero: pôster e depois o vídeo, véu atrás do texto (medido no DOM), abertura em blocos, saída pela rolagem; desenha só quando chega quadro novo ou algo muda |
  | `src/motion/conversa.js` | a caixa de conversa: demonstração que digita, campo que cresce, envio e convite, painéis "+" e modelo, "Pesquisa na web", microfone, sugestões |
  | `src/motion/abertura.js` | a abertura por tempo (~1,5 s): os blocos do céu ganham resolução e o texto sobe; qualquer gesto pula |
  | `src/motion/secoes.js` | as imagens em pixel (`[data-pixel]`), a faixa de logos, as abas dos recursos, os passos, o manifesto, as chaves e botões dos cartões e as entradas por marco |
  | `src/motion/pesquisa.js` | o segundo canvas do shader, com o céu do dia e o da noite: o rasgo segue a rolagem e acende a linha do tempo |
  | `src/motion/nav.js` | o fio das caixas fora do hero, o link da seção na tela e o menu do celular |
  | `src/motion/smooth.js`, `guia.js`, `rolando.js`, `scrollbar.js`, `ancoras.js` | Lenis só com mouse e trackpad (com teto de velocidade), a classe `is-scrolling` que desliga o hover enquanto rola, a barra de rolagem própria e as âncoras pelo Lenis |
- **Parâmetros de URL**: `?pronto` abre sem a abertura (útil para trabalhar nas seções de baixo); `?tema=anil | mar` troca a paleta ao vivo, céu incluído.

## O pixel (`src/gl/ceu.frag.glsl` e `src/gl/pixel.js`)
- Cada pixel do canvas é uma **célula** da tela: o canvas tem o tamanho da grade (`ceil(largura × dpr / célula)`) e o CSS o amplia com `image-rendering: pixelated`, então cada célula sai como um quadrado de canto vivo. A célula tem sempre um número inteiro de pixels da tela; por isso o canvas fica um pouco maior que a caixa e é cortado nas bordas. Tamanho em `--celula` (`tokens.css`): 3 px de CSS no desktop, 2,67 no celular. Menor que 2,5 vira ruído; maior que 4 perde a pintura.
- Para cada célula: a média da área da imagem (mipmap), o tratamento (contraste e saturação, em `estado.tom`), o véu e a impressão com os **dois tons da paleta que melhor misturam a cor**, escolhidos por um limiar de Bayer 8×8. A paleta são os oito tons `--px-0` (o mais claro) a `--px-7` (o mais escuro), em `tokens.css`.
- **Abertura** (`estado.abre`, 0 → 1): blocos de 2^n células, mais finos perto de `estado.foco` (a conversa).
- **Véu** (`estado.veu`, `veuForca`): clareia o céu atrás do texto, em pixel; o hero mede o título e a conversa no DOM.
- **Pé** (`estado.sai`, o progresso da saída do hero): nada desfeito com o hero inteiro na tela; depois de ~6% de rolagem, a borda de baixo se desfaz na cor da página (`--fundo`) em blocos que engrossam.
- **Rasgo** (`estado.rasgo` e `rasgoC`, só na pesquisa): o buraco de borda irregular com papel claro e sombra que mostra a imagem `u_b`.
- **Cover e enquadramento**: `estado.focoImg` (como `object-position`) e `estado.zoomImg`; nas imagens das seções, o atributo `data-foco="x y"` (0 a 1).
- O canvas do hero só desenha quando chega quadro novo do vídeo (`requestVideoFrameCallback`), num seek, na abertura, na rolagem ou ao mudar de tamanho; com o hero fora da tela ou a aba escondida, para.

## Design system
- **Cores são papéis, não nomes de cor** (`src/styles/tokens.css`): `--fundo` (a página, toda branca, e a cor em que o pixel se desfaz), `--fundo-2` (preenchimento apagado de botões e barras), `--tinta`, `--apoio`, `--suave`, `--linha`, `--linha-forte`, `--acento` e `--acento-forte` (o azul da marca e o hover), `--acento-claro` (selos e item ativo), `--cartao`, `--escuro` e companhia (o painel "Como funciona") e os oito tons do pixel. Nada de seção com fundo cinza: a página é branca.
- **Um acento só**: o azul faz os botões, a barra das abas, os selos, os ícones e o foco. O pixel do céu é a única área de cor grande.
- **Tipo**: títulos em Source Serif 4 com `font-variation-settings: 'opsz' 60`, peso 400 e tracking de −0,03em; interface e texto em Schibsted Grotesk; Caveat só na anotação à mão. Tamanhos na escala de site: título de seção 56–64 px (fecho até 80; celular 36–46), corpo 16–18, rótulos e interface 12–15, nada abaixo de 12. O hero é cena (`--u`, unidade que acompanha a tela). As seções usam `--su` (1 px de design = 1 px de verdade a partir de 1280, e só encolhe abaixo).
- **Nada arredondado**: botões, caixas, abas, chaves, selos, ícones e cartões de canto vivo; sombras macias e fios de 1 px.
- **Peças**: `.botao` (o rótulo sobe e outro entra por baixo no hover), `.cartao-ui` (cartão branco de interface), `.selo`, `.chip`, `.chave` (liga/desliga quadrado), `.tag`, `.vidro` (painel azul translúcido sobre imagem), `.topo-dividido` (título à esquerda, parágrafo à direita), `.rotulo` (quadradinho azul + texto), as marcas de corte da grade de "Para equipes".

## Regras de movimento
- **Entradas por marco, por tempo**: quando a peça chega na tela, a animação roda inteira. Só seguem a rolagem o pé do hero, o rasgo da pesquisa e o acender do manifesto.
- **A abertura é o carregamento**: não há tela de loading. O céu começa em blocos grandes desde o primeiro quadro e ganha resolução em ~1,5 s. Qualquer gesto leva ao fim.
- **Sem efeito de cursor nem ondas no céu**: o céu só se mexe com o vídeo. Não acrescente hover no canvas.
- **Hover só com movimento de verdade do mouse.** Enquanto a página rola, o hover descansa (`html.is-scrolling`). Hover novo vai dentro de `@media (hover: hover)` e de `html:not(.is-scrolling)`, como os que já existem.
- **Imagens em pixel nunca travam a rolagem**: a versão fina sai em fatias (`preparar()` em `pixel.js`), começando uma tela e meia antes de a imagem chegar. Imagem nova entra pelo `data-pixel`, nunca calculando tudo de uma vez no meio da rolagem.
- **Primeira pintura**: `html:not(.assentou) *` fica sem transição até o `main.js` marcar `assentou`, dois quadros depois.
- `prefers-reduced-motion`: sem abertura, sem Lenis, sem entradas, o vídeo parado no 1º quadro e as imagens já nítidas.

## Celular: regras que não se quebram
- **Nunca rolar para o lado.** Se algo vazar, conserte a origem (coluna de grid com `1fr` em vez de `minmax(0, 1fr)`, texto que não quebra, `100vw`). O trilho de "Para equipes" rola dentro dele mesmo, não a página.
- **Alturas em `svh`**, nunca `100vh` nem `dvh`: a barra do Safari some e volta e mudaria o tamanho do hero no meio da rolagem. Conferir em 390 × 844, 393 × 659 e 375 × 553.
- **O vídeo**: 960 × 540, ~600 KB, `muted playsinline loop`, com pôster. No modo de economia de energia o iPhone não deixa o vídeo tocar sozinho: fica o 1º quadro, em pixel, e tudo continua funcionando.
- **Composição própria**: o hero puxa o enquadramento para as nuvens da esquerda (`enquadrar()` em `hero.js`); a nav mostra o logo, "Comece grátis" e o menu; a conversa esconde os rótulos dos botões; duas sugestões; abas em largura cheia; cartões e passos em coluna.
- Hover só dentro de `@media (hover: hover)`; alvos de toque de 40 px ou mais; campo com fonte de 16 px (senão o iPhone dá zoom).

## Como checar
- `npm run build` sem aviso de arquivo faltando.
- `npx vite preview`: console limpo; a abertura roda inteira em tempo real; recarregar nunca mostra a página crua; `?pronto` abre direto.
- De perto (zoom de print), cada célula é um quadrado nítido de cor chapada da paleta, sem borrão nem meio-tom.
- O hero parado não tem branco no pé; rolando, o pé se desfaz em blocos. As nuvens andam em loop sem salto.
- A conversa, as abas, o rasgo, o manifesto, as chaves, o "+" do fluxo e "Enviar ao time" (ver o prompt).
- Navegue por Tab do começo ao fim: tudo o que é clicável aparece com o foco azul, na ordem da leitura.
- Celular (390 px) e o `dist/` numa subpasta, com um servidor estático de verdade (o prompt diz como): sem 404 e sem rolagem para o lado.
- Em conferência automática (navegador sem janela), abra com `?pronto` e leve a página com `window.scrollTo(0, y)`, esperando ~1,5 s a cada parada (as entradas e as imagens em pixel chegam por tempo). O WebGL do navegador sem janela pode cair em software: os prints valem, a medição de quadros por segundo não.

## Personalizar

Vale para qualquer mudança, agora ou depois.

### As três perguntas
1. É a demo, a empresa da pessoa (assistente de IA, chatbot, SaaS, software) ou peças soltas?
2. Que material ela já tem (logo, cores, números, logos de clientes, endereço do cadastro ou do app) e o que falta?
3. O que ela quer manter da demo (o céu em pixel com a conversa, as abas, o rasgo da pesquisa, a grade de equipes, o cartão de ação)?

### O que muda e onde

| o quê | onde | precisa de material novo? |
|---|---|---|
| Nome da marca | o logo em `nav.html` e `rodape.html` (`.nav__nome`, o `<span>` do `.rodape__logo` e os `aria-label`), `index.html` (`<title>`, `description`, `og:*`), e os textos que dizem "Ceru" em `hero.html`, `prova.html`, `recursos.html`, `pesquisa.html`, `como.html`, `manifesto.html`, `acao.html`, `fecho.html` e `rodape.html` | não. O nome é texto na serifa: até ~8 letras cabe na caixa da nav |
| Logo da pessoa | troque o `<svg class="marca">` e o nome em `nav.html` e `rodape.html` por um `<img>` ou `<svg>` dela, com altura de ~20 px; o favicon em `public/favicon.svg` | o logo em SVG |
| Título, subtítulo e pedidos de exemplo | `hero.html` (`h1` curto, de uma ou duas linhas; o subtítulo em até duas linhas); a lista `DEMOS` e as `SUGESTOES` no topo de `conversa.js` (os textos dos botões em `hero.html`) | não |
| Para onde a conversa leva | `hero.html`: o convite (`.resposta`) e o `href` de "Criar conta grátis" (hoje `#fecho`). Para levar ao produto, aponte o botão para o cadastro ou o app; para levar a pergunta junto, troque o `submit` de `conversa.js` por `location.href = 'https://app…?q=' + encodeURIComponent(texto)` | o endereço do cadastro ou do app |
| Modelos e opções da barra | `hero.html`: os itens do painel `data-pop-painel="modelo"` (`data-valor` é o nome que aparece no botão) e do painel de anexo | não |
| Logos de clientes | `prova.html`: cada `<li class="logo">` (os da demo são inventados). Use SVG de uma cor só com `fill="currentColor"`, ~24 px de altura, de clientes que autorizaram; sem logos, apague a `<div class="logos">` | os logos |
| Recursos (abas) | `recursos.html`: o rótulo de cada aba e o `<template data-aba-conteudo>` dela (título, texto, quatro itens e o cartão), com `data-img` (a imagem) e `data-foco` | não, ou uma imagem 16:9 por aba |
| Pesquisa | `pesquisa.html`: textos, cartões e os quatro pontos da linha do tempo; as duas imagens em `pesquisa.js` (`k2-nuvens.jpg` e `k3-noite.jpg`) | não |
| Como funciona | `como.html`: os três passos (ícone, título, texto) | não |
| Manifesto | `manifesto.html`: até ~30 palavras, para caber em ~4 linhas | não |
| Para equipes | `agentes.html`: os três painéis de vidro, títulos e textos; a imagem de cada célula (`data-pixel`, `data-foco`) | não |
| Ação | `acao.html`: o cartão (título, os quatro números, os botões) e a anotação à mão (curta: uma linha) | não |
| Fecho e rodapé | `fecho.html` (título, frase, botões) e `rodape.html` (colunas de links, linha de base) | não |
| Cores | `src/styles/tokens.css`: os papéis e os oito tons `--px-0…7` (do mais claro ao mais escuro, todos da mesma família de cor, `--px-0` branco); a cor do céu da primeira pintura (`.hero { background }`) e o `theme-color` no `index.html` | não: o céu muda junto |
| Outra paleta pronta | veja com `?tema=anil` ou `?tema=mar`. Para adotar uma: copie os valores do bloco `html.tema-…` para o `:root` do `tokens.css` e apague os blocos `html.tema-…` (e o trecho que lê `?tema=` no `index.html`, se quiser) | não |
| Tamanho do pixel | `--celula` em `tokens.css` (3 no desktop, 2,67 no celular) | não |
| Fontes | os `@import` no topo de `site.css` e `--serifa`, `--grotesca` e `--mao` em `tokens.css` | não |

### Material da pessoa

O vídeo e as imagens são pinturas de paisagem geradas para a demo: mostram um céu genérico, sem marca, e não se editam por prompt (não dá para "trocar a montanha do fundo": é outro vídeo, outra imagem). A cor, essa sim, vem da paleta do site. Para cada peça, do mais simples ao mais trabalhoso:

- **O céu do hero** (`public/video/ceu.mp4`, 960 × 540, 7,5 s em loop, e o pôster `public/img/ceu-poster.jpg`, o 1º quadro exato):
  1. manter o da demo (serve para qualquer marca: é uma paisagem, não um produto);
  2. **outro clipe**: um vídeo de paisagem com câmera parada, 8 a 10 s, 16:9 (de um gerador de vídeo a partir das receitas em `arquivos/receitas/`, ou filmado). Da raiz do projeto, `npm install -E -D @ffmpeg-installer/ffmpeg@1.1.0` e `node arquivos/fonte/loop.mjs caminho/do/clipe.mp4`: ele corta, funde o fim no começo (sem salto), reduz e grava o vídeo e o pôster no lugar;
  3. **sem vídeo**: apague o `<video>` de `src/sections/hero.html` e troque `public/img/ceu-poster.jpg` por uma pintura 16:9 de 960 px ou mais. O pixel, a abertura e a saída continuam; só as nuvens ficam paradas.
- **As imagens das seções** (`public/img/k1-lago.jpg`, `k2-nuvens.jpg`, `k3-noite.jpg`, `k4-campo.jpg`, JPG de 960 px): qualquer imagem serve, porque o site reduz e pinta em pixel sozinho; o enquadramento se ajusta no `data-foco` de cada uma. As receitas têm os prompts das quatro, no mesmo estilo de pintura.
- **O que funciona melhor**: pintura de paisagem de pincelada larga, céu claro em cima, um vão claro no meio para o texto, escuro nas bordas e embaixo, tons frios. Foto com muito detalhe miúdo (folhagem fina, cidade) vira ruído; imagem quente (pôr do sol) vira cinza na paleta azul. Nada de pessoas, prédios, texto ou logo na imagem.

### Regras ao trocar
- Nada de dado inventado como se fosse da pessoa: "Mais de 40 mil equipes", os logos de clientes, "48 fontes lidas", "+38%", "R$ 18,4 mil", "R$ 5 mil", os quatro números do cartão de ação, "30 línguas", "40 apps", "500 páginas", "Grátis para sempre no plano pessoal" e o © são da demo. O que ela não mandou fica `[preencher]` (nunca no `h1` do hero nem num título de seção); logo de cliente só com autorização.
- Mantenha o que dá o efeito: a célula em px inteiro de tela (nada de canvas no tamanho da caixa com `object-fit`, que borra), a paleta de oito tons de uma família de cor só com `--px-0` branco, o véu atrás do texto, o pé sem nada branco com o hero parado, a página toda branca e nada arredondado.
- A conversa da demo não responde: ligue o botão ao cadastro ou ao app antes de publicar e diga isso à pessoa.
- Nada de cidade real nos textos da demo; no site da pessoa, use os dados dela.
- Termine com a lista do que ainda é da demo: o céu (vídeo e imagens), os logos de clientes, os números, os textos de exemplo dos cartões e o destino da conversa.
