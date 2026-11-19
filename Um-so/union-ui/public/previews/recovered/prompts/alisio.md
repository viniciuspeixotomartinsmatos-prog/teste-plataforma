# Alísio: landing page de agência de viagens com três janelas de avião em 3D

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o site da minha agência** com esta estrutura e estas animações.
   - **Usar só algumas peças** (as janelas em 3D, o globo com rotas, o cartão de embarque) num site que já tenho.
2. Se for a agência dela: o nome, que tipo de viagem vende e para quem, e **que material já tem** (fotos de destinos, logo, cores, contato). Avise desde já: as janelas, o globo e o cartão de embarque são código e trocam de cor e texto na hora; **a vista pela janela e as fotos dos destinos são imagens**. Para trocá-las ela precisa de fotos boas (o guia diz o formato) ou de imagens novas geradas com as receitas de `arquivos/receitas/LEIA.md`; sem isso, a demo continua com o mar e a ilha da Alísio, que servem para qualquer agência.
3. Se forem peças: quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa a landing page da **Alísio**, uma agência de viagens que monta viagens sob medida: voos, hotéis e passeios num plano só, com um especialista acompanhando pelo WhatsApp. Leia antes o guia do projeto desta pasta (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes: design system, regras de motion, como conferir e como personalizar) e olhe as imagens em `arquivos/conceito/`: são prints do site pronto, o alvo de cada cena (`-desktop` e `-mobile`). As fotos já vêm prontas em `arquivos/img/`, a máscara do globo em `arquivos/globo/terra.png`, e o código mais difícil pronto em `arquivos/codigo/` (a cena 3D inteira, o palco, cada cena e o CSS). Use tudo isso; não gere imagem nova.

A ideia da página: **o site é um filme só**. A hero é uma parede de cabine com **três janelas de avião em 3D**; as persianas sobem e a luz de cada janela esquenta a parede. O scroll é a câmera: ela atravessa a janela do meio, desce pelas nuvens até uma ilha vista de cima, e a foto da ilha vira o primeiro card dos destinos. Os cards voam para os seus pontos num globo de pontos, o globo desenrola num mapa que é impresso num cartão de embarque, e no fim a câmera volta de ré pela mesma janela para a cabine, agora à noite, com o formulário. Nível de acabamento: site de premiação (Awwwards). Nenhuma seção empilhada: cada cena passa para a seguinte.

---

## Parte 1 — O site

### Marca e tom
- Público de 28 a 55 anos que viaja uma ou duas vezes por ano (lua de mel, férias em família) e paga para não montar a viagem sozinho.
- Tom curto e concreto, caloroso sem exagero. O assunto é a viagem e o lugar, nunca o avião nem a companhia aérea. Nada de "experiência inesquecível", "paraíso", "sonho".
- Tokens: parede da cabine `#1a1613` (fundo), parede funda `#100d0b`, moldura `#ebe5dc`, persiana `#cdc3b4`, texto claro `#f4efe7`, texto secundário `#a59a8e`, papel do cartão `#f2ede4`, tinta `#1b1714`, luz da janela `#f6cf98`, acento único turquesa `#35b9c4` (rotas, pontos dos destinos, foco), noite `#0b1322`, luar `#a9bddc`.
- Tipos (Fontsource, livres): **Unbounded** variável nos títulos (560, tracking −0,025em), na marca "Alísio" (600), na palavra "Mundo" e nos valores do cartão; **Manrope** variável no resto (nav 15 px, corpo 15–17 px, rótulos em caixa alta 11,5 px com tracking 0,14em).

### Regras de movimento (valem para a página inteira)
1. **Curvas próprias** (CustomEase, em `ease.js` e nas variáveis CSS): `al-out` `0.16,1,0.3,1` entradas (~1 s), `al-in` `0.7,0,0.84,0` saídas (~0,4 s), `al-io` `0.86,0,0.07,1` passagens, `al-quique` persiana subindo (passa um pouco do ponto e assenta), `al-desce` persiana descendo.
2. **Um palco só**: a página inteira (menos o rodapé) é um pin de ~15 telas no desktop; o canvas do Three.js fica atrás e cada cena tem uma camada de texto por cima. O palco entrega a cada cena o **progresso suavizado** (câmera e imagens seguem o scroll) e o **marco** atual pelo scroll cru (texto e estados trocam por tempo).
3. **Texto nunca preso ao scroll.** Títulos entram por máscara de linha (sobem de dentro dela, ~1 s, folga para acento e descendente) e saem no lugar (~0,4 s). Rolando rápido, cada cena vai direto ao estado final.
4. **Freio na rolagem** (`guia.js`): a página sempre rola presa ao gesto e nunca para sozinha, mas a roda tem teto de velocidade: o alvo da rolagem nunca fica mais que 0,17 tela à frente de onde a página está (~0,9 tela por segundo no máximo, por mais forte que seja o gesto). No toque, o dedo arrastando segue o dedo e só a inércia ao soltar tem teto (1,1 tela). Nada de parada que segura o gesto: isso parece travado.
5. Títulos com no máximo duas linhas. Nada de HUD, rótulo com traço, "role para..." ou linha decorativa. Sem clarão, sem flash, sem zoom falso.

### 0 — Sem tela de carregamento
Não há loader: a abertura é o próprio carregamento. A página nasce na cor da parede; assim que as fontes chegam, a nav acende e os textos da hero entram. Quando as fotos da cena terminam de baixar, a cabine aparece no escuro com as três persianas **fechadas** (o canvas sobe de opacidade em ~1 s) e as persianas sobem. A página só rola depois disso.

### 1 — Abertura (a hero, `00-hero-*`)
- Parede marrom-escura, três janelas lado a lado um pouco abaixo do centro (no celular a do meio no centro com ~78% da largura e as laterais cortadas pelas bordas).
- As persianas sobem **uma depois da outra** (0,36 s entre elas, 1,55 s cada, com quique) e param em alturas diferentes: a da esquerda cobre um terço, a do meio sobe toda, a da direita cobre um quarto. A luz de cada janela cresce com a persiana e esquenta a parede em volta, devagar.
- Pela janela: **uma paisagem só** atrás das três (mar azul-turquesa, uma ilha verde pequena no meio, ilhotas à esquerda, uma ilha distante à direita, nuvens grandes embaixo nos lados). O mouse gira a câmera em volta da parede: a moldura quase não sai do lugar e a vista anda atrás dela. Sem mouse, um balanço lento de cruzeiro.
- Textos: nav "Alísio" · "Destinos · Roteiros · Como funciona · Contato" · "Atendimento 7 dias" · "ola@alisio.com.br"; título em uma linha **"Viagens sob medida"**; "Do roteiro ao embarque"; no pé "Voos, hotéis e passeios / num só plano." (esquerda), o botão pílula "Montar roteiro" com o botão redondo do avião (meio) e "Um especialista acompanha / a viagem pelo WhatsApp." (direita).
- No primeiro toque do scroll os textos saem.

### 2 — Pela janela (`01-janela-*`, `02-ceu-*`, `03-descida-*`)
- A câmera avança para a janela do meio: as laterais saem pelas bordas, **a moldura passa rente às bordas da tela**, o vidro some e a câmera atravessa a abertura.
- Lá fora, a vista inteira sem moldura (as nuvens perto andam mais que a ilha). Entra no alto, com um véu azul liso atrás: **"Comece pelo / tipo de lugar."** e "Ilhas, serras, neve ou deserto. / O destino exato a gente acha junto."
- A câmera inclina para baixo e desce: os recortes de nuvem passam em parallax, a névoa azul abre e embaixo aparece a ilha **vista de cima**, que termina ocupando a tela inteira. Em volta dela, mar aberto de verdade (`destino-ilhas-chao.webp`: a foto no meio do mar estendido, com a borda dissolvida): nunca a borda da foto esticada, que aparece como um retângulo com listras.

### 3 — Destinos (`04-destinos-*`)
- **Passagem**: a foto da ilha em tela cheia é a mesma imagem do primeiro card. O card assume no enquadramento exato do 3D e **encolhe** até o quadro de largura inteira com cantos arredondados (preso ao scroll).
- Pilha de quatro cards **presa ao scroll** (nunca uma animação disparada): **Ilhas** ("Água morna, areia branca e barco / até a próxima praia.", 7 a 12 dias, a partir de R$ 8.900 por pessoa), **Serras** ("Estrada de curva, lareira acesa / e café na varanda.", 4 a 7 dias, R$ 3.400), **Neve** ("Esqui de manhã, chocolate quente / à tarde e aula para quem nunca foi.", 7 a 10 dias, R$ 14.700), **Deserto** ("Dunas no fim da tarde, jantar / no acampamento e céu sem luz.", 6 a 9 dias, R$ 11.200). O card novo sobe por baixo **na proporção da rolagem, em linha reta** (cada um num trecho de ~0,7 tela de scroll, com uma pausa curta entre eles); o anterior recua (escala 0,95 em volta da borda de cima do quadro, 7 px para cima) e escurece na mesma proporção e fica espiando por cima, nunca dentro da faixa da nav (no máximo dois espiando). Só o texto do card troca por marco, quando ele está chegando (70% da subida).
- Cada card: o tipo em Unbounded grande no canto de baixo à esquerda, a frase, e à direita um **chip de vidro fosco** com a duração, o preço de partida e o botão "Montar roteiro →" (que já marca o tipo no formulário do fim). A foto desliza devagar dentro do card (nunca zoom).

### 4 — Mundo (`05-mundo-*`)
- **Passagem**: a câmera recua. Os textos do card saem, e presos ao scroll (cerca de 1,5 tela), em duas fases: (1) a pilha encolhe e **se abre numa fileira de quatro cards pequenos lado a lado sobre o globo** (2 × 2 no celular), os de trás saindo de trás do da frente e clareando, enquanto o globo aparece e assenta em volta; (2) da fileira, cada card voa até o seu ponto no globo, quase juntos, do fundo da pilha para a frente (a ilha primeiro), e some nele. O voo só começa depois que os textos do card saíram. Nunca deixar o card da frente grande cobrindo o globo enquanto os outros saem de trás dele. O globo aparece de perto e se afasta até caber no mesmo trecho.
- Globo escuro de **pontos creme** (amostrados da máscara de continentes) com a palavra gigante **"Mundo"** atrás, na largura da tela. Um ponto "Você" no Brasil (sem cidade). Um marco por rota: o arco turquesa sai de "Você" e se desenha até o destino (1,25 s), a ponta acende e o rótulo do tipo aparece (Ilhas no Caribe, Serras nos Andes, Neve nos Alpes, Deserto na Arábia: nenhum nome no site). O globo gira devagar com o scroll.
- Textos: "Roteiros em 64 países, / com quem já esteve lá." (esquerda), "3.200 viagens planejadas / desde 2014." (direita) e o par de botões no meio.

### 5 — Como funciona: o cartão de embarque (`06-cartao-*`)
- **Passagem**: o globo **desenrola em mapa plano** (preso ao scroll): os pontos da frente achatam primeiro e os das bordas por último, até o retângulo do cartão. O papel é impresso por cima (de cima para baixo, descendo um pouco da "fenda") e os pontos passam a ser a tinta do mapa impresso nele, no mesmo lugar, com as rotas tracejadas.
- O cartão: "Alísio · Como funciona · Cartão de embarque"; "De: Sua ideia ✈ Para: A viagem pronta"; três campos que preenchem por marco, com os caracteres girando como painel de aeroporto: **01 · Conversa — 20 min** ("Você conta o que quer, quanto quer gastar e quando pode ir."), **02 · Roteiro — 72 h** ("Um plano dia a dia com voos, hotéis e passeios, ajustado até ficar do seu jeito."), **03 · Viagem — 7 dias** ("Tudo reservado antes do embarque e um especialista no WhatsApp a semana toda."). Canhoto: "Passageiro: Você", "Assento: Janela", "Embarque: Quando quiser" e um código de barras.
- No último marco o canhoto **rasga no picote** (puxa, depois cai girando; as duas bordas ficam picotadas) e revela "Montar roteiro" com "Sem custo até você aprovar o roteiro."
- No celular o cartão é **vertical**, com o mapa no alto e o canhoto embaixo.

### 6 — A noite e o fecho (`07-noite-*`, `08-fecho-*`)
- **Passagem**: o cartão sobe com o scroll e atrás dele está o mar escuro. A câmera sobe do mar (a ilha à noite, vista de cima) pelas nuvens ao luar, levanta até o horizonte e **volta de ré pela janela do meio** para dentro da cabine.
- A cabine à noite: as mesmas três janelas, a mesma vista ao luar, a ponta da asa com a luz vermelha pulsando devagar na janela da direita; a luz da janela fica fria e uma luz quente de cabine vem de cima.
- No marco, as persianas **descem até a metade** uma depois da outra e o formulário entra num **painel de vidro fosco** sobre o quarto de baixo das janelas: Nome, WhatsApp, Quando, Pessoas, o botão "Montar roteiro" e os tipos (Ilhas, Serras, Neve, Deserto, Ainda não sei). Título "Para onde vamos?" e "Em até 2 horas um especialista chama você no WhatsApp." Ao enviar: "Recebido, {nome}. Um especialista chama você no WhatsApp em até 2 horas."

### 7 — Rodapé (`09-rodape-*`)
O pin solta e a cabine sobe junto com a página; a parede continua sem emenda no rodapé, que cabe numa tela. A marca "Alísio" grande e, à direita, "Viagens sob medida, / do roteiro ao embarque."; embaixo, três colunas curtas (Destinos: cada tipo leva ao seu card; Agência; Fale com a gente: WhatsApp, e-mail, "Atendimento 7 dias, das 8h às 22h", Instagram) e, no canto vazio à direita delas, **o avião pequeno com o rastro** (`rodape-aviao.webp`, na escala da gravura, avança um pouco com o scroll) e a linha legal em duas linhas, alinhada à direita: "© 2026 Alísio Viagens e Turismo Ltda." / "CNPJ 00.000.000/0001-00 · Cadastur 00.000000.00-0". A **gravura em creme das quatro paisagens** (ilhas, serras, neve, deserto; `rodape-gravura.webp`, já sem o céu vazio) fecha a página: o céu dela sobe por trás do pé das colunas, as montanhas encostam no texto, e ela sobe mais devagar que o texto. Nada embaixo da gravura.

### Nav
- Nav fixa transparente (marca, links, contato); some ao descer e volta ao subir. No celular: marca + botão redondo do avião. Os links pulam para o ponto da cena com uma cortina curta da cor da parede (0,38 s para entrar, 0,7 s para sair), sem atravessar o filme.
- Barra de rolagem própria, fina e sobreposta (a nativa escondida); engrossa no hover e arrasta.

### Interações (tudo que é clicável)
Nenhum link, botão, card, seta, campo ou controle clicável sem **hover, foco pelo teclado e clique** (pressionado); no celular, o **toque** faz o papel do hover. Os estados falam a língua do site, nunca um efeito genérico: a **persiana** (a luz desce do alto e para com um lábio âmbar no pé), a **luz da janela** (um brilho quente que cresce em volta) e o **picote** do cartão de embarque (a linha de furos se desenha). Mesmas curvas do site: entra com `al-out` em 0,6 s, sai com `al-in` em 0,35 s, clique em 0,18 s. Tudo em `arquivos/codigo/estilos/interacoes.css` (o comum) e no CSS de cada cena.
- **Marca "Alísio"** (nav e rodapé): acende na cor da luz da janela (`#f6cf98`) com brilho quente.
- **Links de texto** (nav, e-mail, rodapé): o picote se desenha da esquerda para a direita embaixo da palavra e apaga para a direita ao sair; no clique e no toque, a palavra fica a 72% com o picote aceso.
- **Botão em pílula "Montar roteiro"**: a persiana de luz (`#fbe4c2` → `#f6cf98`, lábio `#dfa962` de 2 px) desce do alto e o texto desce junto, trocado pela cópia que vem de cima; clique afunda para 0,97.
- **Botão redondo do avião**: a luz da janela acende em volta e o avião decola (sai pela diagonal e volta pelo canto oposto); clique afunda para 0,94.
- **Card de destino ativo**: o card inteiro é clicável (leva ao formulário com o tipo marcado); em qualquer ponto dele, o botão acende com a persiana, o vidro fosco clareia e a seta segue viagem (sai pela direita, volta pela esquerda).
- **Rótulos do globo**: são botões (levam ao card do tipo) que só recebem clique e Tab quando aparecem; hover, foco e toque deixam o rótulo creme e acendem a rota daquele destino (linha mais grossa, halo turquesa, ponto maior).
- **Canhoto do cartão de embarque** (até destacar): é um botão; hover e foco descolam a ponta no picote (gira 2°, ganha sombra, os furos escurecem); apertar descola mais e o clique rola a página até o marco do rasgo. Depois de destacado, deixa de ser botão.
- **Formulário (vidro fosco)**: hover clareia borda e rótulo; foco acende a luz turquesa por dentro do campo; **preenchido** ganha o ponto turquesa antes do rótulo (WhatsApp com máscara `(00) 00000-0000`); **erro** troca o rótulo pelo aviso em coral ("FALTA O NOME", "CONFIRA O NÚMERO"), que desce como persiana, e o foco vai para o primeiro campo errado; os chips do tipo afundam no clique e o escolhido recebe a persiana creme; **enviando** a persiana do botão desce devagar ("Enviando…"); **enviado**, o botão fica aceso ("Recebido"), os campos apagam, a mensagem desce e **as três persianas sobem de novo** com o quique da abertura.
- **Regras**: foco com anel turquesa de 2 px e folga de 3 px (o foco faz o mesmo que o hover); `cursor: pointer` só no que é clicável; hover só dentro de `@media (hover: hover)` (no toque ele não gruda); `:active` como estado de toque (um ouvinte de `touchstart` na página liga o `:active` no iOS; `-webkit-tap-highlight-color: transparent`); botões sem seleção de texto; com movimento reduzido, os estados trocam sem animação.

### Movimento reduzido
Sem Lenis, sem giro do mouse nem balanço; a câmera troca **por corte** entre estados (janelas → lá fora → ilha de cima; noite lá fora → cabine), o card e o globo trocam sem animação, textos só com opacidade, persianas e canhoto no lugar.

---

## Parte 2 — Como construir (stack)

- **Vite sem framework**: HTML, CSS e JS puros. Instale com versão travada (`npm i -E`): `three@0.186.1`, `gsap@3.15.0` (ScrollTrigger, SplitText e CustomEase, gratuitos), `lenis@1.3.26`, `@fontsource-variable/unbounded@5.3.0`, `@fontsource-variable/manrope@5.3.0` (importe `wght.css` de cada uma); `vite@8.3.3` como dependência de desenvolvimento. Scripts: `dev`, `build`, `preview`.
- Copie `arquivos/img/*` para `public/img/`, `arquivos/globo/terra.png` para `public/globo/`, `arquivos/favicon.svg` para `public/`, `arquivos/codigo/main.js` para `src/main.js`, `arquivos/codigo/vite.config.js` para a raiz, `arquivos/codigo/motion/` para `src/motion/` e `arquivos/codigo/estilos/` para `src/styles/` (`tokens.css`, `base.css` e `interacoes.css`) e `src/sections/` (os outros: um CSS por cena). O `interacoes.css` é importado por último no `main.js` (vale sobre as seções). Leia o cabeçalho de cada módulo. Os scripts de `arquivos/fonte/` (`camadas.py`, `terra.py`) vão em `fonte/scripts/`: só servem para refazer as imagens.
- **Os módulos**:
  - `motion/stage/`: `renderer.js` (canvas, dpr, ajuste de desempenho), `texturas.js` (carga, com as fotos decodificadas fora do thread principal por `ImageBitmapLoader`), `janela.js` (moldura em loft, persiana, vidro), `parede.js`, `vista.js` (camadas de foto, nuvens, mar, ilha de cima, noite), `cabine.js` (a cena das janelas e o rig da câmera), `rig.js` (órbita do mouse, caminho por quadros-chave, altura que cobre a tela), `globo.js` (pontos, desenrolar), `rotas.js` (rotas em canvas 2D e o mapa impresso).
  - `motion/`: `palco.js` (o pin único, progresso suavizado e marcos), `ease.js`, `smooth.js` (Lenis + ScrollTrigger), `split.js` (máscara de linha), `flap.js` (painel de aeroporto), `guia.js` (teto de velocidade da rolagem), `nav.js`, `rodape.js`, `scrollbar.js`.
  - `motion/cenas/`: `abertura.js`, `voo.js`, `destinos.js`, `mundo.js`, `cartao.js`, `noite.js`, `fecho.js` — uma por cena, cada uma com `telas` (comprimento no scroll), `marcos` e `atualizar()`/`passo()`.
- **O HTML** (escreva o `index.html` com estas classes, que os módulos e o CSS usam): `<html lang="pt-BR" class="carregando inicio">` e, no `<head>`, um `<style>` curto: `html, body { background: #1a1613; margin: 0 }`, `html.carregando { overflow: hidden }`, `html.inicio .nav, .palco__gl { opacity: 0 }`, `html:not(.estilo) body { visibility: hidden }` e `html:not(.estilo) * { transition: none !important }` (o `main.js` tira essas classes na hora certa); um `<svg>` de símbolos com `#i-aviao` e `#i-seta`; `header.nav` (`.nav__marca`, `.nav__links`, `.nav__contato`, `.nav__aviao.btn-aviao`), com `data-ir="abertura|destinos|mundo|cartao|fecho"` nos links; `main > .palco` contendo `.palco__palavra > span` ("Mundo"), `canvas.palco__gl`, `canvas.palco__rotas` e as seções `section.cena`:
  - `.abertura` (`.abertura__topo` com `h1.titulo.abertura__titulo` e `p.abertura__sub`; `.abertura__janelas` vazio, é o retângulo onde as janelas 3D se encaixam; `.abertura__pe` com `.abertura__esq`, `.par-cta.abertura__cta` e `.abertura__dir`);
  - `.voo` (`h2.titulo.voo__titulo`, `p.voo__texto`);
  - `.destinos` com quatro `article.card[data-tipo]` (`.card__foto > img`, `.card__sombra`, `.card__texto` com `h2.titulo.card__titulo` e `p.card__frase`, `.card__vidro` com `.card__dias`, `.card__preco` e `a.card__ir[data-tipo-escolhe]`); a primeira foto é `/img/destino-ilhas.webp`;
  - `.mundo` (`.mundo__esq`, `.mundo__dir`, `.mundo__rotulos` com cinco `.rotulo`, o primeiro `.rotulo--casa` "Você", e `.par-cta.mundo__cta`);
  - `.cartao > .bilhete > .bilhete__papel` com `canvas.bilhete__mapa`, `.bilhete__corpo` (`.bilhete__cab`, `.bilhete__rota`, `ol.bilhete__campos` com três `li.campo` de `.bilhete__rot`, `p.campo__valor[data-flap]` e `p.campo__texto`), `.bilhete__baixo` (botão + `.bilhete__nota`) e `.canhoto` (`.canhoto__marca`, `dl.canhoto__dados`, `.canhoto__barras`);
  - `.fecho` (`.fecho__topo` com título e `.fecho__sub`; `form.form` com `.form__linha` de quatro `.form__campo` + `button.form__enviar`, e `.form__baixo` com `fieldset.form__tipos` e `p.form__ok`);
  - depois do `main`, `footer.rodape` (`.rodape__topo` com `.rodape__marca` e `.rodape__frase`; `.rodape__meio` com `.rodape__colunas` e `.rodape__lado` = `img.rodape__aviao` + `p.rodape__legal`; `.rodape__gravura > img`).
  Os textos com animação de linha levam `data-linhas`; títulos de duas linhas usam `<br>`.
- **Ordem de inicialização** (`main.js` pronto): renderer → fontes → a cena de abertura e os textos dela entram → fotos e máscara → `criarCabine`, `criarGlobo`, `criarRotas` → as outras cenas → o pin do palco **antes** do Lenis → guia, nav, barra, rodapé → `renderer.compile()` → o canvas aparece → `abertura.abrir()` → `lenis.start()`.
- Antes de entregar, confira as interações uma por uma: passe o mouse, navegue com Tab e clique em cada elemento da lista acima (no desktop), toque em cada um no celular, e envie o formulário vazio e preenchido.
- No fim: `npm run build` passa, o console fica limpo, o scroll roda a 60 fps (também no celular com a CPU 4× mais lenta) e o `dist/` sobe em qualquer hospedagem estática.

Siga o guia do projeto (`CLAUDE.md` ou `AGENTS.md`) para conferir o resultado cena por cena contra as imagens de `arquivos/conceito/`.
