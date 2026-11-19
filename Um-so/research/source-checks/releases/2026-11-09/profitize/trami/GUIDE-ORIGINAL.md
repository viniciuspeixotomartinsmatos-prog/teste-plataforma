# Guia do projeto — Trami

(Salve como `CLAUDE.md` na raiz do projeto se você usa o Claude Code, ou como `AGENTS.md` se usa o Codex, o Cursor ou outro agente. O conteúdo é o mesmo.)

Landing page da Trami, uma plataforma fictícia de automação de processos sem código para pequenas e médias empresas. Vite sem framework, Lenis só no desktop, Literata e Inter pelo Fontsource. **O produto nasce da paisagem:** a primeira tela é um céu de crepúsculo sobre morros e uma copa de árvores rosa; o painel do produto fica entre os dois, roda um fluxo sozinho e, no scroll, sai de trás das árvores. O resto da página é preto, com cards grafite e pedaços de interface vivos. A régua é site de premiação: se uma animação parece "ok", ainda não está pronta.

## Arquitetura
- **Uma seção por arquivo.** O `index.html` só tem as marcas `<!-- @secao nome -->`; o plugin `secoes` do `vite.config.js` troca cada uma pelo conteúdo de `src/sections/<nome>.html`, no dev e no build (vale dentro das seções: o hero inclui o `painel`). `icones.html` é o sprite de todos os ícones (`<symbol id="i-...">`, usados com `<use href="#i-...">`). Cada seção tem o `.html`, o `.css` (importado em `src/main.js`) e, quando se mexe, o módulo em `src/motion/<nome>.js` (chamado em `src/main.js`).
- **Duas escalas** (`src/styles/tokens.css`):
  - o hero está na escala de cena, `--hu`: 1 px de design numa tela de 1440 × 880, acompanhando o lado da tela que limita;
  - as outras seções estão na escala de site, `--su`: 1 px a partir de 1280 de largura, que só encolhe abaixo disso (no celular, a base é 390). Os tamanhos saem dos tokens (`--s-h2`, `--s-corpo`...), nunca de px soltos no texto de uma seção.
- **Peças desenhadas num tamanho fixo e reduzidas inteiras, como um print:** o painel do hero (`data-moldura`, 1180 × 740; 968 no celular, sem o menu lateral), a ilustração do "Por que" (`data-escala-de="520"`), as telinhas do "Como funciona" (340) e o palco das integrações (1200 × 480; 600 × 700 no celular). `src/motion/escala.js` escreve `--escala` = largura do contêiner ÷ largura de design, e o CSS dá outra largura de design no celular em `--de`. Dentro dessas peças, os tamanhos são os de uma interface de verdade (13 a 14 px).
- **Movimento** (`src/motion/`):
  - `rolagem.js`: Lenis só com mouse ou trackpad (`(hover: hover) and (pointer: fine)`), nunca no toque nem com movimento reduzido. Um laço de `requestAnimationFrame` só para quem segue a rolagem (`rolagem(fn)`), que dorme quando nada se mexe; com o Lenis, quem segue a rolagem roda no aviso de scroll dele, no mesmo quadro da página. A classe `.is-scrolling` desliga o hover enquanto a página rola com o cursor parado.
  - `hero.js`: a entrada (espera as duas imagens da paisagem, ou 1,2 s) e as três camadas (`data-camada`): `translateY = k × scrollY`, com o fundo em 0,5, a copa em 0,14 (0,06 no celular) e o painel e o texto em −0,22. Na tela, o céu anda a 0,5 da página, a copa a 0,86 e o painel a 1,22.
  - `painel.js`: o laço do fluxo (`CAMINHOS`, `CLIENTES`, `BIA`), que só roda com o painel na tela; no toque o painel é `inert` (vitrine).
  - `entradas.js`: entradas por marco de `[data-entra]` e `[data-titulo]` (títulos com um `.linha` por linha e `--atraso` por elemento). A checagem é pela posição a cada quadro de rolagem (topo abaixo de 88% da tela); quem já passou da tela entra direto no estado final.
  - `porque.js`, `como.js`, `integracoes.js`, `planos.js` (mensal e anual), `clientes.js` (`DEPOS`), `rodape.js` (o nome gigante e o pingo do "ı"), `logos.js` (no celular a faixa se duplica e roda sozinha), `nav.js` (o vidro depois de 24 px; sobe para fora quando o rodapé encosta nela), `toque.js` (estado de clique no toque, depois de 70 ms).
  - `src/estilo.js` e o `<style>` do `index.html`: no dev do Vite o CSS entra pelo JS; o body espera escondido até o estilo chegar, e as transições ficam desligadas até lá (nada anima do estilo padrão do navegador para o da página).
- **Imagens** em `public/img/` (WebP, com a versão `-1100` para telas pequenas): `hero-fundo` (a paisagem tratada), `hero-copa` (só a copa, com alfa; também entra espelhada nas Integrações e no rodapé), `folhas` (folhas desfocadas, em mesclagem *screen*), `clientes-fundo` (a floresta vista de cima) e `avatar/*.webp` (192 px).
- `fonte/` não entra no site: `camadas.py` faz o `hero-fundo` e o `hero-copa` a partir de `fonte/paisagem.png`, e `avatares.py` recorta os rostos de `fonte/avatares.png` (ver "Personalizar").

## Design system
- Tokens em `src/styles/tokens.css`, nunca cores soltas no CSS das seções:
  - página `--pagina #050506`, card `--card #151515`, fios `--fio` e `--fio-forte`;
  - céu `--ceu-0 #10131c`, `--ceu-1`, `--ceu-2`;
  - texto `--texto`, `--texto-2 #b9b8bd`, `--texto-3 #86858b`;
  - acento `--rosa #e9a7a0` (só detalhes: hover, brilhos) e `--estrela`;
  - interface do produto (`--ui-*`): fundo, cartão, bordas, tinta, menu escuro e os estados laranja, rosa, verde e roxo.
- **Tipos:** Literata variável (classe `.serifa`: eixo ótico 72, peso 300, tracking −0,035em, entrelinha 1,0) nos títulos; Inter variável no resto, com números tabulares na interface. Só pelo Fontsource (`@fontsource-variable/...`, importados em `src/main.js`): nenhum arquivo de fonte solto.
- **Tamanhos:** título do hero `clamp(40px, 60 × --hu, 76px)` (40 no celular); h2 58 (38 no celular); fecho 68 (39); h3 30 (24); corpo 18 (16); pequeno 15 (14); rótulo 13.
- Cantos: card 26 (22 no celular), ilustração 18, pílula 999. Botões em `src/styles/global.css`: `.botao--branco` e `.botao--grafite` (pílula), `.chip` branco com o símbolo.

## Regras de motion
- Curvas: `--ease cubic-bezier(0.19, 1, 0.22, 1)` nas entradas (1,0 a 1,6 s), `--ease-troca cubic-bezier(0.65, 0, 0.35, 1)` nas trocas de estado, `--t-micro 0.28s` nas microinterações.
- Texto por marco, nunca preso à rolagem: entra uma vez, com duração fixa, e termina no estado final mesmo com scroll rápido.
- Só as camadas do hero seguem a rolagem, e só com `transform`. Nada fica preso (sem pin), sem `filter: blur` animado em área grande, sem clarão.
- A interface viva (o fluxo do hero, os cursores, os passos, as integrações, os depoimentos) só anima com a peça na tela e para fora dela.
- Hover só dentro de `:where(html:not(.is-scrolling):not(.toque))`; no toque, o mesmo estado de clique (`.apertou`, pelo `toque.js`). Todo clicável novo ganha hover, foco visível e clique na linguagem da marca.
- `prefers-reduced-motion`: sem Lenis, sem parallax, sem o laço do fluxo (o estado final parado) e entradas sem deslocamento.

## Celular (regras que nunca quebram)
O corte é em 760 px, e cada seção tem uma composição própria para 390 px: o painel vira janela sem o menu lateral; Como funciona e Planos viram trilhos laterais nativos com encaixe (Planos com o Equipe primeiro); as Integrações viram um palco em pé (`data-xm`/`data-ym`); Por que e Clientes empilham. Ao personalizar, estas regras continuam valendo:
1. **Nada rola para o lado**, em nenhuma altura da página e em nenhum estado (entrada, menu, animação). Corrija a origem (título grande demais, `100vw` com barra, `translateX` de entrada, trilho sem `overflow`); trilho lateral de propósito fica dentro do próprio contêiner com `overflow-x: auto`. Rede de segurança: `html, body { overflow-x: clip }` (`clip`, não `hidden`, que quebra o `position: sticky`).
2. **O script nunca briga com o dedo.** No toque, a rolagem é a nativa: nada de Lenis com `syncTouch` e nenhum `scrollTo` enquanto o dedo ou a inércia rolam (no iPhone, um `scrollTo` no meio da inércia dá o tranco que parece travar).
3. **Imagens e quadros cabem na memória do iPhone** (~150 MB decodificados ao mesmo tempo). Nada de `img.decode()` em lote nem de guardar sequências de quadros decodificadas; vídeo ou sequência nova no celular: ≤ 720 px de largura e uma janela de quadros em volta do atual.
4. **Nada redimensiona o palco durante a rolagem.** No iPhone a barra do Safari some e volta rolando: o que está em `dvh` muda de tamanho no meio do scroll. Alturas de seção em `svh` (o hero usa `100svh`), nunca `100vh`; mudança só de altura menor que ~120 px no toque se ignora.

E mais: títulos em no máximo duas linhas no celular (encurte a frase antes de encolher abaixo de 38 px), alvos de toque de 40 a 44 px (a área clicável cresce com padding ou `::after`, sem mudar o desenho) e campos com fonte de 16 px ou mais.

## Como checar
1. `npm run dev` (porta 5193); olhar a 1456 × 840 e a 390 × 844, no Chrome e no Safari. Para o celular de verdade, `npm run dev -- --host` e o endereço de rede.
2. Recarregar: o título sobe por linha, o painel nasce de trás da copa e, depois, o fluxo roda (a luz até "Validar", os checks, o caminho aceso, o contador, a linha nova em "Últimas execuções").
3. Rolar devagar pelo hero: o painel sai das árvores, a copa nunca descobre o que está atrás dela e a emenda com o "Por que" fica preta.
4. Cada seção entra uma vez e termina no estado final. Rolar rápido até o fim e voltar: nenhum texto parado no meio da entrada.
5. Integrações: os fios acendem um por vez; hover num app. Planos: mensal e anual (também com as setas do teclado). Clientes: os rostos, as setas e a troca sozinha a cada 8 s.
6. Fim da página: o nome gigante sobe da copa; numa tela baixa, a nav sai de cima do rodapé.
7. Celular: nada rola para o lado em nenhuma altura, os trilhos encaixam, o painel não pega o dedo e os títulos ficam em duas linhas.
8. Movimento reduzido; Tab com foco visível em tudo (os controles do painel ficam fora do Tab: é uma demonstração); console sem erros; `npm run build` passa.

## Personalizar

O site chega como a demo da Trami, uma marca inventada. Esta seção vale sempre que a pessoa pedir uma mudança, hoje ou daqui a meses: trocar a marca, um texto, um preço, uma imagem, o painel, ou levar uma peça para outro site.

### Antes de mexer
- Se ainda não sabe o objetivo, pergunte qual destes é (uma pergunta por vez, em linguagem simples):
  1. **Ver a demo funcionando** como está, para trocar depois.
  2. **O site do meu produto**, com esta estrutura e estas animações.
  3. **Só algumas peças** (o hero com o painel e a copa, o painel com o fluxo vivo, as integrações, os planos, os depoimentos) para um site que já existe.
- Para o caminho 2, pergunte o que ainda não sabe: o nome, o que o produto faz numa frase, para quem, os três passos de uso, as integrações, os planos e preços, os depoimentos e números de clientes reais, o contato, as redes e **que material já tem** (logo em SVG, prints da tela do produto, fotos de quem dá depoimento, logos de clientes). Não peça tudo de uma vez.
- Para o caminho 3, pergunte quais peças e onde fica o site de destino. Leia o código do destino antes: se for React, Next ou outro framework, adapte os módulos de `src/motion/` e o CSS da peça em vez de colar o HTML desta página.
- Diga com clareza, sem rodeio: **o painel do hero é uma tela de exemplo feita em código** (um construtor de fluxos), **a paisagem é uma foto gerada por IA** e **os rostos são de pessoas que não existem**. Ninguém "põe o meu produto no painel" editando uma imagem: ou se trocam os textos do painel, ou entra um print da tela do produto, ou o painel é redesenhado em código.

### O que muda e onde
| o quê | onde | precisa de material novo? |
|---|---|---|
| Nome da marca, `<title>` e `description` | `index.html`, e cada "Trami" em `src/sections/*.html` e `src/motion/*.js` | não |
| Símbolo do logo e favicon | `<symbol id="i-t">` em `src/sections/icones.html`; `public/favicon.svg` | o SVG da marca, se houver |
| Chip, título, subtítulo, botão e nota do hero | `src/sections/hero.html` | não (nota e número de avaliações só se forem reais) |
| O painel do produto | `src/sections/painel.html` e `painel.css`; o laço em `src/motion/painel.js` | depende do caminho (abaixo) |
| Faixa de logos de clientes | `src/sections/logos.html` (um `<svg>` branco por logo, com `currentColor`) e a frase no `hero.html` | sim: os logos reais em SVG; sem eles, tire a faixa |
| Por que | `src/sections/porque.html`; as frases do balão em `src/motion/porque.js` (`FRASES`) | não |
| Os três passos | `src/sections/como.html` | não |
| Integrações | `src/sections/integracoes.html`: nome em `data-nome`, ícone no `<use href>`, posição em `data-x`/`data-y` (palco 1200 × 480) e `data-xm`/`data-ym` (celular, 600 × 700); ícones novos em `icones.html` | não (ícones de linha genéricos; logo de outra empresa só com permissão de uso da marca) |
| Planos e preços | `src/sections/planos.html` (`data-mensal` e `data-anual` em cada preço, o selo, as listas, a nota de rodapé) | não |
| Depoimentos | `src/motion/clientes.js` (`DEPOS`), o primeiro também no HTML inicial de `clientes.html`; fotos em `public/img/avatar/` | sim: a foto de verdade de cada cliente, quadrada, com autorização |
| Fecho, rodapé, contato, redes, links legais | `src/sections/fecho.html` e `rodape.html` | não |
| Nome gigante do rodapé | o texto em `data-gigante-texto` e o `viewBox` do `<svg>` em `rodape.html`; o índice da letra do pingo em `src/motion/rodape.js` | não |
| Cores e tipos | `src/styles/tokens.css`; fontes em `src/main.js` e no `package.json` (Fontsource) | não |
| Paisagem do hero | `public/img/hero-fundo*.webp` e `hero-copa*.webp`, feitos pelo `fonte/camadas.py`; constantes em `hero.css` e `hero.html` | sim, se quiser trocar (opcional) |
| Folhas e floresta dos Clientes | `public/img/folhas.webp`, `clientes-fundo*.webp` | sim, se quiser trocar (opcional) |
| Tirar uma seção | a marca no `index.html`, o import do CSS e a chamada do módulo em `src/main.js`, e o link dela na nav e no rodapé | não |

### Material da pessoa
Para cada peça visual, ofereça estes caminhos, do mais simples para o mais trabalhoso, e deixe a pessoa escolher:

**O painel do hero**
1. **Manter o painel e trocar os textos:** o nome do fluxo, os nós (gatilho, validação, ações), os campos, os colegas e a lista de clientes em `painel.html` e `painel.js`. Serve bem para qualquer automação, CRM, ERP, plataforma de atendimento ou ferramenta de equipe.
2. **Pôr um print da tela do produto no lugar** (o mais simples para quem tem o produto pronto): um print da tela principal, de 1600 px de largura ou mais, recortado em 1180 × 740 de proporção (no celular a janela é 968 × 740: o print pode ser o mesmo, cortado pela esquerda, ou um segundo print). Salve em `public/img/produto.webp` (e `produto-celular.webp`, se houver) e troque o bloco `<div class="app" data-app>…</div>` inteiro em `painel.html` por `<img class="app__print" src="/img/produto.webp" alt="Tela do <produto>" width="1180" height="740">`, dentro da `.moldura`, com `.app__print { display: block; width: 100%; height: 100%; object-fit: cover; object-position: left top; }` no `painel.css`. A moldura, a copa, a subida e o parallax ficam iguais; sem o `data-app`, o laço do `painel.js` simplesmente não roda. Print escuro funciona, mas o contraste com a copa rosa é o do painel claro: avise.
3. **Redesenhar o painel em código** com as telas do produto (o mais trabalhoso, o mais vivo): o mesmo esqueleto (`.moldura` > `.app` a 1180 × 740 de design, tamanhos de interface de verdade, ícones do sprite) e, se houver animação, o laço do `painel.js` adaptado aos novos nós, só com o painel na tela.

**A paisagem do hero** (opcional: a demo serve para qualquer marca, e o rosa da copa é o acento da paleta)
1. **Manter a da demo.**
2. **Gerar outra com a receita** `arquivos/receitas/paisagem.prompt.txt` (qualquer gerador de imagem, 16:9, o maior tamanho que ele der): mesma composição (céu nos 28% de cima, morros, a faixa de névoa e a crista da copa entre 54% e 66% da altura), outras cores se a marca pedir. Salve como `fonte/paisagem.png` e rode `python3 fonte/camadas.py --conferir /tmp/conferir` (precisa de Python 3 com `pip install numpy pillow`). Ele faz `public/img/hero-fundo*.webp` e `hero-copa*.webp` e grava `fonte/camadas.json` com a largura, a altura, o topo da copa e a crista. Se a imagem nova não tiver 1672 × 941 ou a crista mudou, ajuste: em `hero.css`, `941 / 1672` (altura ÷ largura, em `--palco-h` e no bloco do celular), `0.6854` (`cristaMax ÷ altura`) e, em `.hero__copa-img`, `top: 54.84%` e `height: 45.16%` (`topoCopa ÷ altura` e o resto); em `hero.html`, os `width`/`height` das duas imagens. Confira a máscara em `/tmp/conferir/copa-sobre-magenta.png`: a borda tem de seguir as folhas, sem faixa de céu grudada.
3. As cores do script (`camadas.py`, bloco "copa") puxam a luz para o rosa. Para outro acento, mude `alvo_luz`, `alvo_meio` e `alvo_sombra`, e o `--rosa` dos tokens junto.

**Os rostos** (depoimentos e colegas do painel)
1. **Depoimento real pede a foto real**, quadrada, de 192 px ou mais, com a autorização da pessoa: `public/img/avatar/<nome>.webp`, e o `foto` do `DEPOS` aponta para ela.
2. Os colegas do painel e do "Por que" podem ficar os da demo (são figurantes de interface) ou ser gerados de novo com `arquivos/receitas/avatares.prompt.txt` (uma folha 4 × 2 sobre fundo branco), salva em `fonte/avatares.png` e recortada com `python3 fonte/avatares.py` (grava os oito em `public/img/avatar/`, com os nomes da demo).
3. Nunca use rosto gerado num depoimento de cliente de verdade.

**Folhas e floresta dos Clientes**: as receitas `folhas.prompt.txt` (fundo preto puro; recorte a parte com as folhas, 836 × 1024, e salve em `public/img/folhas.webp`) e `clientes-fundo.prompt.txt` (com a paisagem do hero anexada como referência; 2:1, salve em 1672 e 1100 px de largura). Sem imagem nova, ficam as da demo.

**Logos de clientes**: SVG de uma cor só, com `fill="currentColor"`, na altura da faixa (viewBox de 32 de altura). Sem os logos reais, tire a faixa e a frase "Mais de 3.000 empresas" (número que não é real não entra).

### Regras ao trocar
- As regras de motion e de celular continuam valendo: texto por marco, só o hero segue a rolagem, interface viva só na tela, nada rola para o lado, títulos em duas linhas.
- Texto novo no hero tem de caber: o painel desce sozinho para baixo do texto quando ele cresce (`hero.js`, `ajusta`), mas um subtítulo de quatro linhas empurra o painel para dentro da copa. Encurte antes.
- O nome gigante precisa do `viewBox` justo nas letras novas: meça com `getBBox()` do `<text>` no navegador e ajuste; se o nome não tiver "i", tire o `<circle>` do pingo e a função `poe` do `rodape.js`.
- Nada de número, nota, avaliação, depoimento, cliente, logo ou certificação inventados como se fossem da empresa: o que a pessoa não informou fica `[preencher]` e entra na lista do fim. A nota "4,9 em 1.200+ avaliações", os números dos depoimentos e "Mais de 3.000 empresas" só ficam se forem reais.
- Preço com "a partir de", impostos e fidelidade como a pessoa disser; "sob consulta" é uma saída honesta.
- Depois de cada troca, rode o "Como checar" de novo nos trechos que mudaram e, no fim, liste para a pessoa o que ainda é da demo (textos, rostos, logos, a paisagem, o painel) e o que falta ela mandar.
