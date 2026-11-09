# Guia do projeto — Scoopie

(Salve como `CLAUDE.md` na raiz do projeto se você usa o Claude Code, ou como `AGENTS.md` se usa o Codex, o Cursor ou outro agente. O conteúdo é o mesmo.)

Landing page da Scoopie, uma sorveteria fictícia de sorvete artesanal de pote, com delivery e lojas. Vite sem framework, Three.js, GSAP, Lenis, Matter.js e as fontes Bricolage Grotesque (Fontsource) e Bagel Fat One (no próprio site).

**A jogada é o pote de sorvete como um rolo de fita adesiva.** Ele aparece em 3D no hero, desce girando pela porta da geladeira, pousa na borda ondulada da seção seguinte e rola para a direita: o rótulo descola da frente dele e fica colado na página, primeiro a volta do rótulo e depois a faixa creme com a frase. Em seguida o pote cai no palco do sabor e, a cada sabor, dá uma volta e troca o rótulo pela parte de trás. O tom é de papelaria: papel amassado por cima de tudo, objetos presos com ímã, fotos em adesivo. A régua é site de premiação: se uma animação parece "ok", ainda não está pronta.

## Arquitetura

### HTML e CSS

- **O `index.html` junta as seções** de `src/sections/<nome>.html` pelo marcador `<!-- @secao nome -->` (plugin em `vite.config.js`), nesta ordem:
  1. `abertura` (o canvas da abertura) e `lacre` (a aba e o menu `#menu`);
  2. dentro do `main`: `hero`, `mural`, `sabores` (`#sabores`), `momentos` (`#momentos`) e `pedir` (`#pedir`);
  3. `rodape` (`#rodape`);
  4. o `<canvas class="palco">` do 3D e a camada `papel`.
- **O CSS** está em `src/styles/` e `src/sections/`:
  - `tokens.css`: as cores, as fontes (com o `@font-face` do logo) e as escalas;
  - `base.css`: o reset, o canvas do palco, o papel amassado e a barra de rolagem;
  - um CSS por seção, com o bloco do celular no fim de cada um.
- **Duas escalas** (`tokens.css`):
  - `--u` é a escala de cena: `min(100vw / 1440, 100svh / 900)`, que cabe inteira na tela. Valem por ela o hero, o mural, o palco do sabor, as linhas dos momentos e o rodapé.
  - `--su` é a escala de site: 1 px até 1280 de largura, que só encolhe abaixo disso. Valem por ela o título dos momentos e a chamada.
  - No celular (até 760 px) as duas partem de 390 de largura (`--u` com altura de referência de 700, a tela com a barra do navegador à mostra).

### O palco 3D (`src/three/`)

- **`palco.js`:** um canvas fixo (`.palco`, z-index 20, sem pegar o mouse) por cima das seções desenha o pote e a faixa. O roteiro é preso à rolagem e mora em `layout()` (que mede a página) e `atualiza(Y)` (a cada quadro):
  - **hero e mural:** marcos `{ y, x, yy, s, rx, rz }` (rolagem, posição na tela, px por cm, inclinações) numa curva que não passa do ponto; no hero, o pote segue o mouse numa mola;
  - **pouso e rolar:** o pote pousa na onda e rola sem escorregar; o rótulo cola na página a partir da frente (`uD` no pote, `uLimite` na faixa) e a faixa corre para a esquerda (`uDesliza`);
  - **palco do sabor:** o pote cai do alto e fica no meio, visto de cima; `trocaSabor(i)` dá a volta e troca o rótulo pela parte de trás (e a tampa no meio da volta);
  - depois que tudo sai da tela, o palco descansa (não desenha).
  - No celular, o pote do hero e o do palco encaixam no espaço livre medido no DOM (abaixo do título; entre o texto do sabor e o "O").
- **`pote.js`:** o pote em cm: o corpo (tronco de cone com a fita), o fundo, a saia da tampa (um perfil girado) e o topo com a arte da tampa. `luzEstudio()` é a luz.
- **`fita.js`:** o rótulo e a faixa são o mesmo material. Cada ponto da fita tem uma posição ao longo do comprimento: a primeira volta é o rótulo do sabor, depois vem a faixa creme. Também desenha a onda (`onda(W, H)`, que recorta a seção do sabor e guia a faixa) e a geometria da faixa.
- **`artes.js`:** desenhos em canvas: o rótulo (a arte + o selo creme do sabor), a tampa (o texto em volta + o logo) e a faixa (a frase + a tampa entre as frases).
- **`marca.js`:** o logo: cada letra num giro e numa altura, o adesivo creme com os miolos fechados e as gotas (`GOTAS`: em que letra pinga e o comprimento).
- **`sombra.js`:** a sombra do pote e da faixa, no próprio WebGL: o palco desenhado de novo numa resolução baixa (só o alfa), desfocado e posto por baixo, deslocado para baixo. É o drop-shadow dos objetos do mural, sem o custo de um filtro CSS na tela cheia.
- **`retratos.js`:** os potinhos do seletor, dos adesivos dos momentos e da física do rodapé, desenhados pelo mesmo 3D depois da abertura (cada sabor em 3/4 e a tampa de cima). As imagens `public/img/pote-*.webp` e `tampa-*.webp` são só a reserva para quando o WebGL falha.

### Os dados (`src/config.js`)

Tudo o que muda de uma marca para outra:

- `MARCA`: o nome (o logo, a tampa, a faixa, a abertura e o rodapé se redesenham com ele);
- `SABORES`: `id`, `nome`, `cor` (o fundo do palco), `titulo` (o nome gigante, tom sobre tom), `tinta` (o texto pequeno sobre o fundo), `arte` (o rótulo) e `desc`;
- `FRASE_FAIXA`: a frase que o rótulo vira;
- `EMBALAGEM`: as medidas do pote, a saia da tampa, as cores e os textos do selo e da tampa (veja "A embalagem", abaixo).

### Motion (`src/motion/`)

- `main.js`: a ordem de início, os links internos, os retratos e a física carregando perto do rodapé.
- `abertura.js`: o logo letra por letra e as cinco faixas em arco (1,45 s).
- `hero.js`: o logo do hero (tamanho pelo `font-size` de `.hero__marca`) e as letras pulando.
- `mural.js` e `paralaxe.js`: a paralaxe dos `[data-v]` e as letras do kraft em ordem aleatória.
- `sabores.js`: os cinco marcos do palco do sabor, a tinta em círculo, o título, o texto e o seletor.
- `momentos.js`: o título e as linhas andando de lado.
- `pedir.js`: as letras do "BORA PEDIR?".
- `fisica.js`: a física do rodapé (Matter.js), com pegar e jogar.
- `lacre.js`: a aba e o menu.
- `letras.js`: quebra o texto em letras (com o `aria-label` da palavra inteira) e as anima pelo navegador (`animaLetras`).
- `smooth.js`: Lenis + ScrollTrigger num relógio só, e `rolaPara()` (Lenis no mouse, rolagem nativa no toque).
- `guia.js`: o teto de velocidade da roda.
- `scrollbar.js` e `rolando.js`: a barra própria e o `.is-scrolling`.

### Imagens (`public/img/`, WebP)

- `rotulo-<sabor>.webp` (1536 × 1024) e `rotulo-<sabor>-m.webp` (1024 × 683, a do celular): a arte de cada rótulo.
- `foto-colher`, `foto-crianca`, `foto-casquinha`, `foto-brinde` (adesivos do palco do sabor) e `foto-comemorar`, `foto-dividir`, `foto-esquecer` (as linhas dos momentos): 760 × 760.
- `foto-maos.webp` (900 × 1350): a chamada.
- `lista`, `ingresso`, `polaroide`, `convite`, `desenho`, `kraft` e `ima-1` a `ima-5`: os objetos do mural, com fundo transparente.
- `colher-1` a `colher-3`: a física do rodapé.
- `papel-alfa.webp`: o papel amassado por cima de tudo (os vincos em preto com alfa); `papel.webp` é o original, cinza.
- `pote-*`, `tampa-*`: a reserva dos retratos.

Todas foram geradas por IA; os prompts estão em `arquivos/receitas/`.

## Design system

- **Cores** em `src/styles/tokens.css`, nunca soltas no CSS das seções: `--rosa #ff6db8` (fundo), `--choco #3b1a12` (títulos, mural, rodapé), `--creme #fff1de` (selos, faixa), `--kraft #b98a57` e as cores dos sabores. A cor de cada sabor no palco vem de `SABORES` (`src/config.js`).
- **Cores no 3D e no canvas:** `COR` em `src/three/artes.js` (rosa, chocolate e creme do selo, da tampa e da faixa) e `corTampa`/`corFundo` em `EMBALAGEM`. Mudou o rosa ou o chocolate da marca: mude também o `COR`, o `theme-color` e o fundo do `<style>` do `index.html`, o `CORES` das faixas da abertura (`abertura.js`) e o `favicon.svg`.
- **Tipo:**
  - Bricolage Grotesque variável, peso 800 e largura 75% em caixa alta nos títulos; o texto corrido na mesma família.
  - O logo em Bagel Fat One (`public/fonts/`, `@font-face` em `tokens.css`), desenhado em canvas por `marca.js`.
- **Peças comuns:**
  - `.botao` (`--escuro`, `--creme`, `--linha`): pílula que sobe e inclina de leve no hover e afunda no clique;
  - `.adesivo`: foto quadrada com cantos arredondados e sombra;
  - o selo `.selo-pedir` e os potes do `.seletor`;
  - a camada `.papel` por cima de tudo.

## Regras de motion

- **O que é imagem segue a rolagem** (o pote, a paralaxe, as linhas, a faixa); **texto e troca de estado entram por marco**, com tempo fixo, e terminam inteiros mesmo rolando rápido. Nunca prenda texto ao scrub.
- **A roda tem teto de velocidade** (`guia.js`, ~0,9 tela por segundo); a página sempre rola presa ao gesto e nunca para sozinha. No toque, a rolagem é a nativa.
- **O palco do sabor** tem um marco por sabor (`sabores.js` divide a seção presa em partes iguais). Mais ou menos sabores: a altura de `.sabores` em `sabores.css` (`100svh + n × 48svh`, `40svh` no celular), os botões do `.seletor` e a lista `SABORES`.
- **O pote passa por cima da faixa** depois que sai rolando (a faixa vira só a borda da página). Seção nova entre o mural e os sabores muda a onda e o pouso: mexa só depois de ler `layout()` em `palco.js`.
- **Hover só com o cursor de verdade:** dentro de `@media (hover: hover) and (pointer: fine)` e com `html:not(.is-scrolling)`.
- **Títulos** com no máximo duas linhas. Nada de HUD, contador "01/05", "role para..." ou linha decorativa.
- **`prefers-reduced-motion`:** sem Lenis, abertura com fade, texto sem pular, trocas sem animação, física já assentada.

## Celular (regras que nunca quebram)

O corte é `max-width: 760px`. A composição muda assim:

- **Hero:** ESFRIAR e A CABEÇA na mesma largura, abaixo da aba; o pote encaixa embaixo do título, sem seguir o cursor.
- **Mural:** uma coluna; o kraft à direita (o texto acompanha a largura do papel em `cqw`) e o pote descendo pela beirada esquerda.
- **Sabor:** o texto e o botão no alto, o pote no meio, "O SABOR" embaixo, a fileira de potes do seletor no pé; sem o selo.
- **Momentos:** título de 40 px, linhas menores, três adesivos.
- **Chamada:** a foto em cima, o card embaixo, os botões na largura toda.
- **Rodapé:** links em duas colunas, a física com menos corpos e o chão acima da linha das redes.

Ao personalizar, estas regras continuam valendo:

1. **Nada rola para o lado**, em nenhuma altura e em nenhum momento (abertura, menu aberto, física caindo). `html, body { overflow-x: clip }` é a rede de segurança; o mural, o palco e o rodapé recortam o que passa da borda.
2. **O script nunca briga com o dedo.** O Lenis fica sem `syncTouch`, e nenhum `scrollTo` roda enquanto o dedo ou a inércia rolam: os links e o seletor usam `rolaPara()`, que no toque usa a rolagem nativa. Na física, o corpo só é puxado 70 ms depois do toque.
3. **O palco não muda de tamanho rolando.** O canvas fica em `100lvh`, o palco usa a altura grande da tela e ignora mudança só de altura menor que 120 px no toque (a barra do Safari indo e voltando). `dpr` no máximo 1,5 no celular. Alturas de seção em `svh`, nunca `100vh`.
4. **Leve:** a página abre com ~2,4 MB. Os rótulos do celular são os de 1024 px, os outros sabores carregam nos respiros depois da abertura e o Matter.js só perto do rodapé. Alvos de toque de 44 px.

## Leveza (regras que nunca quebram)

O site tem de rodar liso até num notebook com tela de 120 Hz, sem perder nada do visual. Ao personalizar:

- **Nada de `filter` no canvas do palco** (`.palco`): a sombra do pote é a de `sombra.js`. Um `drop-shadow` ali refaz um desfoque na tela cheia a cada quadro.
- **Nada de `mix-blend-mode` em camada de tela cheia.** O papel amassado é preto com alfa (`papel-alfa.webp`); se trocar a textura, gere de novo assim (o cinza vira alfa: `255 − cinza`).
- **O palco só redesenha quando algo muda:** quem mexer no roteiro (`atualiza` em `palco.js`) põe o valor novo na `chave` de lá, senão a mudança não aparece.
- **Trabalho pesado só nos respiros:** textura nova sobe para a GPU com `renderer.initTexture` dentro de `folga()` (`main.js`), nunca no primeiro quadro em que aparece; imagem nova vem por `carregaImagem` (que já decodifica fora da thread principal).
- **Letras que entram pulando** passam por `animaLetras` (`src/motion/letras.js`): o navegador anima a posição, o giro e a opacidade fora da thread principal, com a curva do GSAP copiada ponto a ponto. Não troque por um tween do GSAP letra por letra: cada quadro repintaria o texto (e o que estiver atrás dele).
- **A abertura:** as letras do logo são camadas soltas animadas pelo navegador (`letrasMarca` em `marca.js`, usada em `abertura.js`); só quando a última assenta o canvas desenha o logo pronto. Não volte a desenhá-las quadro a quadro no canvas: o pote 3D é montado nesse mesmo instante e a animação travaria.
- **Shader novo** (material novo no palco ou na sombra) entra no `compileAsync` do fim de `criaPalco`, senão o primeiro quadro em que ele aparece trava a página.
- **Física:** a sombra de cada corpo é pronta (`sombraDe` em `fisica.js`), e o canvas só redesenha enquanto algo se mexe.
- **O que anda em paralaxe** leva `data-v` (e com isso a camada própria de `base.css`); sombra em `filter` só em elemento que é camada.

## Como checar

1. **Abrir.** Rode `npm run dev` (porta 5310) e olhe a 1456 × 840 e a 390 × 844, no Chrome e no Safari. Para o celular de verdade, `npm run dev -- --host`.
2. **Comparar.** Confira cada trecho contra o print de `arquivos/conceito/` (ou o novo desenho, depois de personalizar).
3. **A abertura** (recarregue a página): o logo entra pulando, as faixas de arco-íris sobem e descobrem o hero, e as letras de ESFRIAR A CABEÇA pulam.
4. **O pote, rolando devagar:** ele segue o mouse no hero, desce girando pelo mural sem cobrir o texto do kraft, pousa na onda e rola para a direita; o rótulo descola da frente sem buraco e vira a faixa com a frase; a faixa continua correndo depois que o pote sai.
5. **O palco do sabor:** o pote cai passando por cima da faixa, e cada sabor troca a cor em círculo, o nome, o texto e o rótulo (pela parte de trás, no meio da volta). O seletor leva ao sabor certo.
6. **A roda, rolando rápido:** o teto segura a página, e cada marco termina inteiro (o pote encurta as voltas para não ficar para trás).
7. **O resto:** as linhas dos momentos andando de lado, as letras da chamada, a física do rodapé (pegar, jogar, clicar num pote leva ao sabor), o menu do lacre (abre, Esc fecha e devolve o foco, cada link chega na seção).
8. **No fim:** com movimento reduzido a página funciona sem animação; o console fica sem erros; `npm run build` passa; no celular, nada rola para o lado em nenhuma altura.

## Personalizar

O site chega como a demo da Scoopie, uma sorveteria inventada. Esta seção vale sempre que a pessoa pedir uma mudança, hoje ou daqui a meses: trocar o nome, um sabor, a embalagem, uma foto, ou levar uma peça para outro site.

### Antes de mexer

- Se ainda não sabe o objetivo, pergunte qual destes é (uma pergunta por vez, em linguagem simples):
  1. **Ver a demo funcionando** como está, para trocar depois.
  2. **O site da minha marca** (sorveteria, gelateria, açaiteria, doceria, ou outro produto numa embalagem) com esta estrutura e estas animações.
  3. **Só algumas peças** (o pote 3D com o rótulo virando faixa, o sabor em destaque com o seletor, a porta de geladeira, as linhas gigantes, a física do rodapé, a abertura de arco-íris, a aba do lacre) para um site que já existe.
- **Para o caminho 2**, pergunte o que ainda não sabe, sem pedir tudo de uma vez:
  - o nome e a frase da marca;
  - os sabores ou produtos (até cinco funciona melhor), com uma cor e uma frase curta para cada;
  - a embalagem: foto de lado ou descrição (tipo, volume, cor da tampa);
  - os links de delivery, das lojas e das redes;
  - **que material já tem**: o logo, a arte do rótulo, fotos do produto e de clientes com ele.
- **Para o caminho 3**, pergunte quais peças e onde fica o site de destino. Leia o código do destino antes.
  - O pote é `src/three/` inteiro mais `src/config.js`: precisa de um canvas fixo por cima da página e de alguém chamando `atualiza(scrollY)` a cada quadro, como o `main.js`. As medidas da onda e do palco vêm das seções (`secoes` em `main.js`).
  - Em React ou Next, crie o palco num `useEffect`, chame `atualiza` no laço do GSAP e `layout()` no resize.
- **Diga com clareza, sem rodeio:**
  - o logo, a tampa, a faixa e os potinhos se redesenham sozinhos com o nome novo;
  - a embalagem é código: redonda sai por configuração, não redonda muda o gesto principal (veja abaixo);
  - a arte dos rótulos e as fotos da demo são de sorvete e mostram o pote da Scoopie;
  - o prazo de entrega, as lojas e as redes da demo são inventados.

### O que muda e onde

| o quê | onde | precisa de material novo? |
|---|---|---|
| Nome | `MARCA` em `src/config.js` (o logo, a tampa, a faixa, a abertura e o rodapé); no `index.html`, o `<title>` e a `description`; o `.so-leitor` do hero e do rodapé, a linha do © e o `alt` da foto da chamada | não |
| As gotas do logo | `GOTAS` em `src/three/marca.js`: `[índice da letra, comprimento]`. Pingue embaixo de letras redondas (o, e, a, u), nunca de letra com perna (p, g, j, y) | não |
| Logo próprio (arquivo) | `desenhaMarca` em `marca.js` desenha o nome com a fonte. Para o logo da pessoa, desenhe a imagem dela no lugar (`ctx.drawImage`) nos mesmos pontos: abertura, hero, tampa (`desenhaTampa`), faixa e rodapé | o logo em SVG ou PNG transparente |
| Frase da faixa | `FRASE_FAIXA` em `src/config.js` (curta: uma linha de até ~40 caracteres) | não |
| Sabores | `SABORES` em `src/config.js` (nome, cores, texto, arte); os botões do `.seletor` em `sabores.html` (um por sabor, com `data-sabor` e `data-retrato`) e a altura de `.sabores` (veja "Regras de motion") | a arte do rótulo de cada um |
| Título "O PISTACHE" | o "O" é `.sabores__o` em `sabores.html`; o nome vem de `SABORES`. Nome comprido: confira que cabe na largura no celular (96u) | não |
| Hero | `hero.html` ("A [logo] TÁ AQUI PRA", ESFRIAR, A CABEÇA). Palavras de outro tamanho: os `font-size` de `.hero__l` em `hero.css` (no celular, cada linha com o seu, para as duas ficarem na mesma largura) | não |
| Texto do kraft | as sete `.l` de `mural.html` (cada uma é uma linha; até ~20 caracteres) | não |
| Momentos | `momentos.html`: o título e as três linhas (PRA + foto + verbo) | fotos, se trocar |
| Chamada | `pedir.html`: título, texto, botões e os links | não |
| Rodapé e menu | `rodape.html` (links, frase, linha de baixo, redes em texto) e `lacre.html` (os links e a linha de baixo); os ícones da física em `main.js` (`redes`: nome, ícone e link) | não |
| Links de delivery, lojas e redes | os `href` de `pedir.html`, `rodape.html`, `lacre.html` e as `redes` do `main.js` (hoje apontam para `#pedir` e `#rodape`) | os links reais |
| Cores | `src/styles/tokens.css`; `COR` em `artes.js`; `CORES` das faixas em `abertura.js`; `theme-color` e o `<style>` do `index.html`; `favicon.svg` | não |
| Embalagem | `EMBALAGEM` em `src/config.js` e, se a tampa for de outro formato, o `perfil` em `src/three/pote.js` (veja "A embalagem") | uma foto de lado ou a descrição |
| Textos da embalagem | `linhaRotulo` e `voltaTampa` em `EMBALAGEM` | não |
| Tirar uma seção | o `<!-- @secao -->` no `index.html`, a chamada dela no `main.js` e os links no menu e no rodapé. O mural e os sabores fazem parte do roteiro do pote: não tire | não |

### Material da pessoa

Para cada peça visual, ofereça estes caminhos, do mais simples para o mais trabalhoso, e deixe a pessoa escolher. Toda imagem nova entra pelo conversor, que corta e grava no tamanho certo:

```
npm run imagens -- rotulo <id-do-sabor> <arquivo>   # o rótulo (e a versão do celular)
npm run imagens -- foto <nome> <arquivo>             # foto quadrada: colher, crianca, casquinha, brinde, comemorar, dividir, esquecer
npm run imagens -- chamada <arquivo>                 # a foto em pé da chamada
npm run imagens -- objeto <nome> <arquivo>           # objeto do mural (recorta fundo verde ou magenta chapado)
```

**A arte do rótulo** (uma por sabor)

1. **A arte da embalagem dela**, se já existe: o arquivo do designer ou uma foto bem chapada da arte aberta. Ela dá a volta no pote, então as laterais devem emendar e o meio é a frente. Não traga o nome nem o logo na arte: o selo do sabor é desenhado por cima.
2. **Gerar uma nova** com as receitas (`arquivos/receitas/rotulo-*.txt` e o `LEIA.md`): troque os motivos pelos ingredientes do produto dela e mantenha o resto (sem letras, até a borda, três tintas, motivo forte no meio).
3. **Manter a da demo** por enquanto, se ela vende sorvete com esses sabores.

**As fotos** (os adesivos do palco do sabor, as linhas dos momentos e a chamada)

1. **Fotos do produto dela**, em situações como as da demo (alguém comendo, um aniversário, dividindo, a pilha de potes na mão), quadradas (a da chamada em pé, 2:3).
2. **Gerar** com as receitas. A embalagem nova já aparece no site: salve um potinho do seletor (botão direito, "salvar imagem") e mande junto como referência, para o pote da foto ser o dela (`arquivos/receitas/_pote.txt`).
3. **Manter as da demo** por enquanto: mostram o pote da Scoopie, sem o nome. Antes de publicar, ou entram fotos do produto dela ou os adesivos saem (apague os `<img class="adesivo">` de `sabores.html`).

**Os objetos do mural**

São da porta de uma geladeira qualquer e servem para quase toda marca. Só a lista de compras fala de sorvete ("sorvete" riscado, "2 sorvetes!!"): para outro produto, gere de novo pela receita `lista.txt`, trocando o item.

### A embalagem (o produto em 3D)

O pote não é um modelo baixado: é um tronco de cone (o corpo, com o rótulo em volta) e uma tampa com saia, em `src/three/pote.js`, com as medidas de `EMBALAGEM` (`src/config.js`). O rótulo, a faixa, a inclinação do rolar, o tamanho do pote em cada pose e os potinhos se ajustam sozinhos a essas medidas. Para a embalagem da pessoa:

1. **Peça uma foto da embalagem de lado** (de frente, sem perspectiva forte, de preferência num fundo liso) **ou a descrição**: o tipo, o volume, a cor da tampa e, se souber, a altura e os diâmetros.
2. **Tire a proporção.** Pela foto, meça em pixels a altura do corpo (sem a tampa), a largura da boca e a do fundo, e converta para cm mantendo a altura entre 6 e 12 cm (só a proporção importa; nessa faixa o resto da página fica no tamanho certo). Pela descrição, parta destas medidas típicas:

   | embalagem | `altura` | `rTopo` | `rBase` | `saia` | tampa |
   |---|---|---|---|---|---|
   | pote de sorvete de 500 ml (a demo) | 9,4 | 4,8 | 4,0 | 1,0 | encaixe, chocolate |
   | pote de 1 L | 10,5 | 6,0 | 5,0 | 1,1 | encaixe |
   | copo de açaí de 300 ml | 10,0 | 4,6 | 3,0 | 0,5 | domo ou plana |
   | pote baixo de 250 g (doce, creme) | 5,5 | 4,6 | 4,1 | 1,2 | rosca |
   | lata de 350 ml | 12,2 | 3,3 | 3,3 | 0,4 | metal, `#c9ccd1` |

3. **Preencha `EMBALAGEM`:** `rTopo` e `rBase` (metade das larguras), `altura`, `saia` (quanto a tampa desce pelo corpo; o rótulo acaba embaixo dela), `corTampa`, `corFundo`, e os textos `linhaRotulo` e `voltaTampa`.
4. **Tampa de outro formato** (domo de copo, rosca de pote de vidro, borda de lata): mude o `perfil` em `criaPote`. São pontos `[raio, altura]` em cm, de baixo para cima, girados em volta do eixo, a partir da boca (altura 0); o topo plano (`topo`) fica no último ponto. Um domo é uma sequência de pontos subindo e fechando para o centro; uma lata é uma borda fina (`rTopo + 0,05`) de 0,4 cm com o topo um pouco abaixo dela.
5. **Confira, nesta ordem:** o hero (o pote inteiro, a tampa virada para quem olha, sem cobrir o título), o mural (o pote não cobre o texto do kraft), o rolar na onda (a frente do pote encosta na faixa e o rótulo descola sem buraco) e o palco do sabor visto de cima. Se o pote ficar grande ou pequeno demais numa pose, ajuste o `s` dos marcos em `palco.js` (no desktop) ou deixe o encaixe do celular fazer o trabalho.

### Produto que não é redondo

Caixa, saco, sachê ou frasco achatado: o rótulo só descola de um corpo redondo, então não refaça a fita para ele. Sugira, nesta ordem:

1. **Manter uma embalagem redonda como objeto da marca** (um pote, copo ou lata com a arte dela). É ela que conta a história do rótulo virando faixa; o produto de verdade aparece nas fotos.
2. **Trocar o pote por um modelo 3D do produto** (um `.glb` de licença livre, ou modelado simples em código, como uma caixa de cantos arredondados) nas poses do hero, do mural e do palco do sabor. Na seção da faixa, ela entra sozinha pela borda da onda e corre com a rolagem, sem descolar de nada (`uLimite` alto desde o começo e o pote escondido no trecho do rolar). Diga à pessoa que isso leva algumas horas e muda o gesto principal do site.

### Regras ao trocar

- Nada de número, prazo, loja, preço ou avaliação inventados como se fossem da pessoa: o que ela não informou fica `[preencher]` e entra na lista do fim.
- Nada de cidade se a pessoa não quiser.
- Rótulos e fotos novos entram pelo `npm run imagens`, nos tamanhos de cima. A arte do rótulo nunca leva o nome ou o logo (o selo e a tampa já trazem).
- Depois de trocar a embalagem, confira as quatro poses do pote (veja "A embalagem") no desktop e no celular.
- Depois de cada troca, rode o "Como checar" de novo e, no fim, liste para a pessoa o que ainda é da demo (rótulos, fotos, objetos do mural, textos, links) e o que falta ela mandar.
