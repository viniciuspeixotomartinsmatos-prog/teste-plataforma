# Guia do projeto — Alísio

(Salve como `CLAUDE.md` na raiz do projeto se você usa o Claude Code, ou como `AGENTS.md` se usa o Codex, o Cursor ou outro agente. O conteúdo é o mesmo.)

Landing page da Alísio, agência de viagens sob medida. Vite sem framework, Three.js (a cena 3D ao vivo), GSAP (ScrollTrigger, SplitText, CustomEase) e Lenis. O site é **um filme só**: um palco preso durante a página inteira, com um canvas 3D atrás e uma camada de texto por cena. O impacto vem de três coisas, nessa ordem: a hero com **três janelas de avião em 3D** cujas persianas sobem e acendem a parede; a câmera que **atravessa a janela do meio** e desce pelas nuvens até o destino; e as passagens entre as cenas (a foto vira card, os cards voam para o globo, o globo desenrola no cartão de embarque, a câmera volta para a cabine à noite). A régua é site de premiação: se uma passagem parece "ok", ainda não está pronta.

## Design system
- Tokens em `src/styles/tokens.css`, nunca cores soltas no CSS das seções.
  - Cabine: `--parede #1a1613` (fundo), `--parede-funda #100d0b` (globo e cartão), `--moldura #ebe5dc`, `--persiana #cdc3b4`.
  - Texto: `--claro #f4efe7`, `--claro-2 #a59a8e` (o cinza quente de "Do roteiro ao embarque").
  - Cartão de embarque: `--papel #f2ede4`, `--tinta #1b1714`.
  - Luz e acento: `--luz #f6cf98` (o calor da janela na parede), `--mar #35b9c4` (o único acento: rotas, pontos dos destinos, foco dos campos).
  - Noite: `--noite #0b1322`, `--luar #a9bddc`.
- Tipos (Fontsource, livres): **Unbounded** variável nos títulos (560, tracking −0,025em), na marca e nos valores do cartão; **Manrope** variável no resto. Títulos com no máximo duas linhas, quebras com `<br>` e `white-space: nowrap` (no celular o título da hero e o do fecho podem quebrar sozinhos).
- Grade: `--gutter: clamp(16px, 3.2vw, 48px)`; a nav reserva `--nav-h` (88 px; 68 no celular) e nenhuma cena põe texto nessa faixa.
- Botões da marca: pílula creme "Montar roteiro" + botão redondo do avião (`.btn`, `.btn-aviao` em `base.css`).
- Vidro fosco só onde há imagem atrás: o chip dos cards e o formulário do fecho.
- Nada de HUD, rótulo com traço (—— TÍTULO), "role para..." ou linhas decorativas.

## A peça 3D (não substitua por imagem)
- `src/motion/stage/janela.js`: a moldura é um **perfil varrido entre dois contornos** (almofada de fora, vinco, forro de dentro, lábio fino); a oclusão está nas cores dos vértices. A persiana é um plano com shader (lábio no pé, sombra da caixa, luz atravessando quando fechada). Medidas: abertura `ABERTURA` (1 de largura), contorno `CONTORNO`.
- `src/motion/stage/parede.js`: a parede com três furos e o brilho de cada janela proporcional à abertura da persiana dela.
- `src/motion/stage/vista.js`: a vista é **foto em camadas**, cada uma numa profundidade (céu z −60, panorâmica z −40, nuvens perto z −6) e, para a descida, os recortes de nuvem, o mar e a ilha vista de cima (`CHAO`).
- `src/motion/stage/cabine.js`: monta a cabine (dia e noite são a mesma cena) e o "rig" da câmera com deslocamento de lente (`enquadrar()` encaixa as janelas no retângulo `.abertura__janelas` do layout).
- `src/motion/stage/globo.js` + `rotas.js`: o globo de pontos (máscara `public/globo/terra.png`, Natural Earth), as rotas e a conta que desenrola o globo no mapa do cartão (`kPlano`).

## Regras de motion
- **Curvas só de `src/motion/ease.js`** (CustomEase): `al-out` entradas ~1 s, `al-in` saídas ~0,4 s, `al-io` passagens, `al-quique` persianas subindo, `al-desce` persianas descendo.
- **Scroll dirige só câmera e imagem; tempo dirige texto.** O palco (`src/motion/palco.js`) entrega a cada cena o progresso suavizado (câmera, encolher do card, desenrolar do globo, saída do cartão) e o **marco** pelo scroll cru: títulos, persianas, cards, rotas, campos e o canhoto trocam por tempo quando o marco passa. Rolando rápido, a cena vai direto ao estado final.
- **Máscara de linha** (`src/motion/split.js`): entra subindo por dentro da máscara (folga para acento e descendente em `.ln-mask`), sai no lugar sem atravessá-la. Nenhum print parado mostra letra comida.
- **Nenhuma cena só aparece**: cada uma passa para a seguinte (janela → céu, foto → card, cards → pontos do globo, globo → mapa impresso, cartão → noite, noite → cabine, cabine → rodapé). Sem clarão, sem flash, sem zoom de mentira.
- Pins: um só (o palco), criado antes do Lenis; `ScrollTrigger.refresh()` e `lenis.resize()` depois das fontes e no resize.
- `prefers-reduced-motion`: sem Lenis, sem giro do mouse nem balanço, a câmera troca por corte entre estados, textos só com opacidade, persianas e canhoto sem animação.

## Interações (tudo que é clicável)
- **Nenhum link, botão, card, seta, campo ou controle clicável sem hover, foco pelo teclado e clique (pressionado).** No celular, o toque (`:active`) dá a resposta equivalente ao hover. Isso vale para qualquer elemento novo que entrar no site.
- **A linguagem dos estados é a da Alísio**, nunca um efeito pronto de biblioteca (sublinhado padrão, sombra genérica, "pulse", "glow" neon, zoom na foto):
  - **persiana**: a luz desce do alto e para com um lábio no pé (botões em pílula, botão do card, chips do formulário, envio);
  - **luz da janela**: brilho quente que cresce em volta (botão redondo do avião, marca);
  - **picote**: a linha de furos do cartão de embarque se desenha embaixo dos links de texto;
  - os rótulos do globo acendem a rota do destino; o canhoto descola no picote antes de rasgar.
- **Mesmas curvas e durações do site** (variáveis em `src/styles/interacoes.css`): entra com `al-out` em 0,6 s (`--t-entra`), sai com `al-in` em 0,35 s (`--t-sai`), clique em 0,18 s (`--t-clique`).
- **Foco:** anel turquesa (`--mar`) de 2 px com folga de 3 px em `:focus-visible`; o foco faz o mesmo que o hover. O foco nunca some (`outline: none` só com outro indicador no lugar, como no canhoto).
- **`cursor: pointer` só no que é clicável** (link, botão, select, rótulo de opção, canhoto e o card ativo). Hover só dentro de `@media (hover: hover)`, para não grudar no toque. Botões sem seleção de texto ao arrastar.
- **Formulário:** foco (luz turquesa por dentro), preenchido (ponto turquesa antes do rótulo), erro (o rótulo vira o aviso em coral, descendo como persiana; o aviso só some quando o campo fica certo), enviando (a persiana do botão desce devagar) e enviado (botão aceso, campos apagados, mensagem e as persianas das janelas subindo de novo).
- **Movimento reduzido:** os estados trocam sem animação (a regra global de `base.css` corta transições e animações; no JS, duração 0).
- Onde fica: o comum em `src/styles/interacoes.css`; os estados de cada peça no CSS dela (`src/sections/`); o que mexe no canvas ou no 3D no módulo da cena (rotas do globo em `src/motion/stage/rotas.js` + `src/main.js`, canhoto em `src/motion/cenas/cartao.js`, formulário em `src/motion/cenas/fecho.js`, card clicável em `src/motion/cenas/destinos.js`).

## Desempenho
- 60 fps no desktop e no celular com a CPU 4× mais lenta (medido). O canvas desenha sempre em 2× no desktop (numa tela 1× é supersampling: a borda branca das janelas contra o azul fica lisa; com só o MSAA ela sai em degraus) e até 1,5 no celular; se os quadros pesarem por uns 4 s seguidos, desce um degrau só (2 → 1,5; 1,5 → 1) (`renderer.js`). As fotos que a hero não usa (chão da descida, noite, recortes de nuvem) sobem para a GPU uma por quadro logo depois que as persianas abrem (`renderer.initTexture`, em `main.js`), já decodificadas fora do thread principal (`texturas.js`). Sem isso, a primeira passagem pelas nuvens trava ~80 ms enviando a foto do chão.
- O canvas só desenha o conjunto da cena atual (cabine, globo ou nada nos cards). Os shaders são compilados antes de o canvas aparecer.

## Como checar
1. `npm run dev`; olhar a 1456 × 840 e a 390 × 844, no Chrome e no Safari.
2. Recarregar: sem tela de carregamento; os textos da hero entram, a cabine aparece no escuro e as três persianas sobem uma depois da outra com um quique e a parede esquenta em volta de cada janela. Mexer o mouse: a moldura quase não sai do lugar e a vista anda atrás dela.
3. Rolar devagar: a moldura do meio passa rente às bordas, o vidro some, a vista se abre lá fora, "Comece pelo tipo de lugar." entra, a câmera inclina e desce pelas nuvens até a ilha vista de cima.
4. A ilha em tela cheia vira o card "Ilhas" sem salto e encolhe até o quadro de cantos arredondados; os outros cards sobem presos ao scroll (em linha reta, na proporção da rolagem) e o anterior escurece e fica espiando por cima. Rolar o mais rápido possível: a página nunca passa de ~1 tela por segundo e nunca trava.
5. No fim dos cards, a pilha, presa ao scroll, encolhe e se abre numa fileira de quatro sobre o globo (2 × 2 no celular), e dali cada card voa até o seu ponto, a ilha primeiro; nenhum card grande cobre o globo; rolar de volta refaz a pilha; "Mundo" atrás; uma rota por marco, com o rótulo do tipo. No celular, o globo assenta acima dos textos de baixo: "Você" e as rotas nunca passam por trás de "Roteiros em 64 países".
6. O globo desenrola em mapa plano e o papel do cartão é impresso por cima, com o mesmo mapa; os campos giram como painel de aeroporto; o canhoto rasga no picote e mostra "Montar roteiro".
7. O cartão sobe, a câmera sai do mar escuro, passa pelas nuvens ao luar e volta de ré pela janela do meio; as persianas descem até a metade e o formulário entra no vidro fosco.
8. Parar em cada cena: nenhum título cortado, nenhuma meia linha, nada embaixo da nav.
9. Rolar a página inteira rápido e voltar: tudo assenta. Repetir com movimento reduzido.
10. Interações, uma por uma: passar o mouse, navegar com Tab e clicar em cada elemento clicável (marca, links, botões, botão do avião, card, rótulos do globo, canhoto, campos, chips, envio, rodapé); no celular, tocar em cada um. Enviar o formulário vazio (erro), preencher (preenchido) e enviar (as persianas sobem). Nada clicável sem hover, foco e clique; nada não clicável com a mão.
11. Console sem erros; `npm run build` passa.

## Personalizar

O site chega como a demo da Alísio, uma agência inventada. Esta seção vale sempre que a pessoa pedir uma mudança, hoje ou daqui a meses: trocar a marca, um texto, uma foto, ou levar uma peça para outro site.

### Antes de mexer
- Se ainda não sabe o objetivo, pergunte qual destes é (uma pergunta por vez, em linguagem simples):
  1. **Ver a demo funcionando** como está, para trocar depois.
  2. **O site da minha marca**, com esta estrutura e estas animações.
  3. **Só algumas peças** (as janelas 3D, o globo, o cartão de embarque) para um site que já existe.
- Para o caminho 2, pergunte o que ainda não sabe: nome, o que vende e para quem, destinos ou tipos de viagem, preços de partida, contato (WhatsApp, e-mail, horário), cores e logo, e **que fotos a pessoa já tem**. Não peça tudo de uma vez.
- Para o caminho 3, pergunte quais peças e onde fica o site de destino. Leia o código do destino antes: se for React ou Next, adapte o módulo de `src/motion/` ao framework em vez de colar o HTML desta página.
- Diga com clareza o que muda só com texto e o que depende de foto nova (tabela abaixo). As janelas, o globo e o cartão são código e trocam de cor e texto na hora; a vista pela janela e os destinos são fotos.

### O que muda e onde
| o quê | onde | precisa de material novo? |
|---|---|---|
| Nome, textos, preços, contato, rodapé | `index.html` | não |
| Cores da marca | `src/styles/tokens.css`; cor das molduras em `materialMoldura()` (`src/motion/stage/janela.js`), da parede em `criarParede()` (`parede.js`), do globo em `uCor` (`globo.js`), das rotas em `desenhar({ cor })` (`rotas.js`) | não |
| Fontes | `@fontsource` no `package.json` + `--f-titulo`/`--f-texto` em `tokens.css` | não |
| Altura das persianas na hero | `ALTURAS_HERO` em `src/motion/cenas/abertura.js` (0 fechada, 1 aberta) | não |
| Tipos de destino (cards) | os quatro `article.card` no `index.html` e as fotos `public/img/destino-*.webp` | foto nova por tipo |
| Rotas do globo e o ponto "Você" | `CASA` e `DESTINOS` em `src/motion/stage/globo.js` (latitude e longitude) e os `.rotulo` no `index.html` | não |
| Campos do cartão de embarque | `.campo` no `index.html` (o valor que gira vem de `data-flap`) | não |
| Formulário (campos, para onde vai) | `.form` no `index.html`; o envio está em `src/motion/cenas/fecho.js` (hoje só confirma na tela; troque por um link `wa.me` ou pela API do seu CRM) | não |
| Estados de hover, foco, clique e toque | `src/styles/interacoes.css` (persiana, luz da janela, picote, curvas) e o CSS de cada seção; elemento novo herda os estados se usar as classes `.btn`, `.btn-aviao` ou `.picote` | não |
| Duração de cada cena no scroll | `telas` e `marcos` em cada arquivo de `src/motion/cenas/` | não |
| A vista pela janela (mar e ilha) | `public/img/vista-ilha.webp` + `vista-ceu.webp` + `noite-vista.webp` (feitas por `fonte/scripts/camadas.py` a partir de uma panorâmica) | sim: uma panorâmica larga |
| Nuvens | `public/img/nuvens-perto.webp`, `nuvens-longe.webp`, `nuvem-0…8.webp` | sim, se quiser outras |
| A descida (o destino visto de cima) | `public/img/destino-ilhas.webp` + `destino-ilhas-chao.webp` | sim: foto zenital |
| Rodapé (gravura e o avião separado dela) | `public/img/rodape-gravura.webp`, `public/img/rodape-aviao.webp` | sim, se quiser outra |

### Material da pessoa
Para cada peça visual, ofereça estes caminhos, do mais simples para o mais trabalhoso, e deixe a pessoa escolher:
1. **Manter a imagem da demo por enquanto** e trocar o resto. A ilha e as nuvens servem para qualquer agência de viagem; o site fica pronto hoje.
2. **Usar fotos que ela já tem.** Antes de trocar, confira: destinos em paisagem 16:9 com pelo menos 1600 px e o canto de baixo à esquerda calmo (o texto do card fica ali); a vista da janela precisa ser **uma panorâmica larga (3:1)** tirada do alto, com o horizonte a um quarto da altura e o lugar principal pequeno no meio; a descida precisa de uma foto **vista de cima** do mesmo lugar. Foto que não serve (vertical, escura, de celular) estraga a cena: diga isso e proponha o caminho 3.
3. **Gerar com IA** seguindo `arquivos/receitas/LEIA.md`: são os prompts que fizeram cada imagem da demo. A pessoa roda no gerador que usar (com a hero da demo como referência) e devolve os arquivos; você roda `python3 fonte/scripts/camadas.py` para montar as camadas.
4. **Sem foto nova**: a vista e a descida continuam com o mar e a ilha da demo; troque só os cards dos destinos.

### Regras ao trocar
- As regras de motion acima continuam valendo: título em 2 linhas no máximo, texto nunca preso ao scroll, nenhuma passagem vira corte seco.
- Todo elemento clicável que entrar (botão, link, card, campo) nasce com hover, foco e clique na linguagem da seção "Interações" acima; confira um por um, no desktop e no celular, antes de entregar.
- A foto da descida (`destino-ilhas.webp`) e a do primeiro card são **a mesma imagem**: o card assume a tela no enquadramento exato do 3D. Trocou uma, troque a outra e refaça o `-chao`: `camadas.py` gera a tela, o gerador estende o mar em volta (`destino-ilhas-fora`) e o script põe a foto original no meio, em resolução cheia. Nunca esticar nem espelhar a borda da foto: na descida isso aparece como um retângulo com listras.
- Se a panorâmica mudar, ajuste `HORIZONTE_FOTO` e `PAN_LARGURA` em `src/motion/stage/vista.js` com os valores que o `camadas.py` imprime.
- Nada de texto, preço, número ou depoimento inventado como se fosse da marca: o que a pessoa não informou fica como `[preencher]` e entra na lista do fim. Os números da demo (64 países, 3.200 viagens, preços de partida) são fictícios.
- Depois de cada troca, rode o "Como checar" de novo nos trechos que mudaram e liste para a pessoa o que ainda é da demo (fotos, textos) e o que falta ela mandar.
