# Guia do projeto — Patina

Filme de lançamento de 20 a 40 s, 1920×1080, 30 fps, desenhado em HTML e renderizado quadro a quadro pelo Chromium headless, com música e efeitos sonoros (sem narração). A linguagem: texto digitado com tinta que assenta, o quadro cheio que encolhe para um card, wipe em pixels, chaves `{ }` e alças de seleção que pulam no tempo, imagens girando no vão de uma palavra, lista de etapas com ícones, barra de pedido com digitação em macro, a imagem que se monta de pontos, baralho 3D de variações, um resultado em vários formatos e o logo travando no silêncio.

A demonstração (`filmes/demo.json`) é o lançamento da Patina, um estúdio de IA fictício que aprende o visual de uma marca. As imagens dela foram geradas para esta marca fictícia e servem só para ver o filme funcionando.

O filme é feito de **cenas-molde**: cada cena tem um movimento medido e acabado, e o conteúdo dela (textos, cores, marca, logo, fontes, imagens, etapas, formatos) vem do config. Não mude o código das cenas: tudo se adapta pelo config.

## Como funciona

1. **O config** (`filmes/<nome>.json`) diz a marca, as cores, as fontes e as cenas, cada uma com os seus textos e imagens.
2. **A linha do tempo** monta o filme na grade da música (140 BPM: 1 batida = 0,43 s, 1 compasso = 1,71 s). As cenas vêm sempre na mesma ordem e cada uma ocupa compassos inteiros, então o drop da música cai sempre na revelação da imagem e a batida final na trava do logo. Tirar uma cena encurta o filme.
3. **O motor** (`engine/`) desenha cada quadro como função do tempo. Os eventos de som nascem no mesmo ponto em que a imagem anima.
4. **O som**: a música (`audio/trilha/laser-groove.mp3`) é recortada nos compassos para o drop dela cair no drop do filme; os efeitos (cliques, teclas, swooshes, pops, o brilho do logo) são sintetizados em código (`tools/sfx.py`); a mixagem sai em −14 LUFS.

## Comandos

Tudo da raiz do projeto. Precisa de Node 18+ e Python 3. O ffmpeg vem pelo `npm install` (se o npm avisar que pulou scripts de instalação, tudo bem: as ferramentas dão a permissão de execução ao ffmpeg sozinhas).

```bash
npm install
npx playwright install chromium
python3 -m venv .venv && .venv/bin/pip install numpy scipy soundfile pyloudnorm   # Windows: .venv\Scripts\pip
```

| Comando | O que faz |
|---|---|
| `node tools/render.mjs <filme> linha` | a linha do tempo: onde cada cena começa e termina (e os avisos de texto longo, ícone ou imagem) |
| `node tools/render.mjs <filme> folha` | folha de contato, 1 quadro por segundo → `out/<filme>/folha.jpg` |
| `node tools/render.mjs <filme> folha --passo 10` | folha mais densa (o passo é em quadros, 30 por segundo) |
| `node tools/render.mjs <filme> quadros 120,300-330:5` | quadros soltos em 1920×1080 → `out/<filme>/quadros/` (o texto pequeno se julga aqui) |
| `node tools/render.mjs demo compara arquivos/referencia.mp4` | a demo ao lado da referência, nos mesmos quadros → `out/demo/compara.jpg` |
| `node tools/filme.mjs <filme> --rascunho` | o filme inteiro em 960×540, com som |
| `node tools/filme.mjs <filme>` | o filme final → `out/<filme>/<filme>.mp4` |
| `node tools/filme.mjs <filme> --sem-musica` | só os efeitos, para postar com uma música do Instagram/TikTok |

Os avisos aparecem no fim de cada comando ("avisos:"). Nenhum aviso pode sobrar no filme final.

## O config

Parta de `filmes/demo.json` (copie para `filmes/<nome>.json`) e troque o conteúdo. Toda cena que entrar precisa dos seus textos trocados: o que ficar com o texto da demo sai no filme.

### A marca, as cores e as fontes

| Campo | O quê |
|---|---|
| `marca.nome` | o nome da marca (o logo do fecho e a marca-d'água do pedido) |
| `marca.logo.simbolo` | `"disco"` (uma esfera no gradiente das cores da marca, como a da demo) ou o caminho de um SVG/PNG **de uma cor, sem fundo** (`midia/<filme>/simbolo.svg`). Abra o SVG antes: um `<rect>` ou círculo de fundo do tamanho do desenho vira um bloco; apague e deixe só o desenho |
| `marca.logo.cor` | só com símbolo de imagem: a cor dele (padrão: o gradiente do disco) |
| `marca.logo.haste` | `true` só quando o nome começa com p, b, d ou q e se quer o truque da demo (a letra vira uma haste com o símbolo no lugar do bojo); aí `palavra` é o resto do nome (`"atina"`). Padrão: símbolo à esquerda + nome |
| `marca.logo.escala` | o tamanho do símbolo de imagem em relação à altura das letras (padrão 1,25) |
| `marca.fonte` | a fonte do nome no logo: `{ "arquivos": [{ "arquivo": "midia/x/fonte-700.woff2", "peso": 700 }], "peso": 700 }`. `null` = a fonte do texto em 600 |
| `fontes.texto` | a fonte de todo o texto: `{ "arquivos": [{ "arquivo", "peso" }, ...] }`, pesos 400, 500 e 600. `null` = Instrument Sans |
| `fontes.destaque` | a fonte das palavras de destaque (as em itálico): `{ "arquivos": [{ "arquivo", "estilo": "italic" }], "italico": true }`. `null` = Instrument Serif itálica |
| `cores.fundo` | o fundo do filme. Claro funciona melhor (a demo é creme); escuro também funciona (os cartões ficam brancos) |
| `cores.tinta` | o texto sobre o fundo |
| `cores.apagado` | o texto secundário (os valores das etapas, o "Destilando…") |
| `cores.acento` | a cor forte: a tinta da digitação, o botão de enviar, a palavra do gancho, os ícones das etapas |
| `cores.acento2` | a segunda cor: o item final das etapas, o "Pronta", o fim do gradiente da chamada |
| `cores.brilho` | a tinta clara em que as palavras de destaque nascem antes de assentar |
| `cores.paleta` | 3 a 6 cores: as bolinhas que as imagens soltam, as amostras das etapas e do cartão, os pontos da montagem |
| `cores.gradiente` | 5 cores: as manchas do fundo do manifesto e dos formatos |
| `cores.pixels` | 6 a 8 cores: os blocos do wipe em pixels da abertura |
| `cores.porta`, `porta2`, `base`, `sombra`, `texto2` | raros: o pino das saídas de imagem e de vídeo, o fundo de uma imagem carregando, a cor das sombras, o slogan |

Sem `paleta`, `gradiente` e `pixels`, eles saem das outras cores. Para baixar uma fonte do Google Fonts sem mexer no `package.json`: numa pasta temporária, `npm pack @fontsource/<nome-da-fonte>` (ex. `@fontsource/dm-sans`), `tar xzf` no `.tgz` e copie `package/files/<nome>-latin-400-normal.woff2` (e 500, 600 ou 700) e o `LICENSE` para `midia/<filme>/fonte/`. Só fonte gratuita para uso comercial.

### As cenas

**A ordem é sempre esta**: `abertura` → `gancho` → `vao` → `etapas` → `pedido` → `montagem` → `baralho` → `manifesto` → `formatos` → `chamada` → `fecho`. **Obrigatórias**: gancho, chamada, fecho. As outras podem ficar de fora (não ponha, ou `"ativa": false`). Cada uma tem a sua duração em compassos (a demo completa tem 40,5 s; só as obrigatórias, ~11 s). Nas tabelas, "imagens" diz o que a cena precisa.

**abertura** (8 batidas) — o problema. Uma imagem em tela cheia, desfocada, com a primeira linha digitada em tinta que assenta; o quadro encolhe para um card, o card se copia numa fileira e a segunda linha entra; um wipe em pixels come tudo. **Imagens: 1** (retrato; ou 6 em `copias` para uma fileira de imagens diferentes).

| Campo | Exemplo | Limites |
|---|---|---|
| `imagem`, `foco` | `"midia/x/generica.jpg"`, `"50% 34%"` | a imagem "do problema" (a foto genérica, a que todo mundo usa); `foco` = o ponto que fica no card |
| `linha1` | `"Toda imagem de IA"` | digitada, branca sobre a imagem. Até ~32 caracteres no corpo cheio |
| `linha2` | `"parece igual."` | entra palavra a palavra, embaixo da fileira. Até ~34 |
| `tinta`, `cor_texto`, `fundo_quadro` | `"#FFB8E9"` | raros: a cor em que as letras nascem, a cor final delas, o fundo atrás da imagem |

**gancho** (4 batidas) — a pergunta. As palavras de `antes` entram, as chaves `{ }` se abrem, `dentro` e `destaque` entram, alças de seleção pulam a cada tempo e terminam no destaque.

| Campo | Exemplo | Limites |
|---|---|---|
| `antes` | `"E se a IA tivesse"` | 2 a 6 palavras |
| `dentro`, `destaque`, `fim` | `"o seu"`, `"gosto"`, `"?"` | dentro das chaves: `dentro` normal e `destaque` em itálico na cor de acento. `fim` = a pontuação depois da chave (`""` tira) |

A frase inteira cabe numa linha: até ~42 caracteres no corpo cheio; mais longa, o corpo encolhe (mínimo ~60 caracteres). Ela é a jogada do filme: o vão abre entre `dentro` e `destaque`.

**vao** (4 batidas) — as outras palavras saem, o vão entre `dentro` e `destaque` abre, três janelas giram pelas imagens como um caça-níquel e explodem num painel com todas; uma pílula embaixo. **Imagens: 6 a 8** (o ideal é 8).

| Campo | Exemplo | Limites |
|---|---|---|
| `imagens` | 8 caminhos | quadradas ou em pé funcionam melhor; as de paisagem são cortadas |
| `final` | `[1, 4, 3]` | as três que param nas janelas (índices de 0) |
| `pilula` | `"**8** referências"` | `**` = negrito. Até ~40. `""` tira |
| `cores` | `[0, 1, 1, 2, 4, 2, 3, 2]` | raro: a cor da paleta que cada imagem solta (padrão: a mais próxima da cor média dela) |

**etapas** (8 batidas) — as cores voam para o centro, o título entra com um brilho passando, e os itens entram um por batida, com ícone, rótulo e valor; o último leva a segunda cor e o status troca para pronto.

| Campo | Exemplo | Limites |
|---|---|---|
| `titulo` | `"Destilando o seu estilo"` | até ~34 |
| `itens` | `[{ "icone": "sol", "rotulo": "Luz", "valor": "sol baixo, sombras longas" }]` | **3 a 5**. `rotulo` até ~12; `valor` até ~36. Em vez de `valor`: `"cores": true` (as bolinhas da paleta; as cores que voam pousam nelas) ou `"chip": "nome"` (uma etiqueta branca, boa para o último item) |
| `status` | `["Destilando…", "Pronta"]` | o "trabalhando" e o "pronto" |

Sem item de cores, cada cor voa para o ícone de uma etapa. A lista inteira encolhe se passar da largura (aviso abaixo de 70%).

**pedido** (até a montagem) — o "app": uma barra de vidro sobre o meio-tom de uma foto, o nome da marca gigante ao fundo; a câmera entra em macro na digitação e acompanha o cursor de texto, volta ao plano aberto e o cursor clica em enviar. **Imagens: 0 ou 1** (o fundo; sem ele, o fundo liso com a marca-d'água).

| Campo | Exemplo | Limites |
|---|---|---|
| `texto` | `"campanha de linho, terraço, pôr do sol"` | o que a pessoa digita: um pedido, uma busca, um agendamento. Até ~42 no corpo cheio; até ~55 encolhendo |
| `chip` | `"Linho de Domingo"` | a etiqueta à esquerda (com a mini paleta). Até ~22. `""` tira |
| `fundo` | `"midia/x/foto.jpg"` | uma foto em paisagem; vira meio-tom nas cores dela |

**montagem** (até o drop) — pontos nas cores da paleta pipocam e montam a imagem; no drop da música ela passa por dois passes de falsa cor e resolve na foto. **Imagens: 1** (em pé, 4:5 ou 2:3: a imagem-herói, o resultado).

| Campo | Exemplo | Limites |
|---|---|---|
| `imagem`, `foco` | `"midia/x/heroi.jpg"` | a imagem que se monta (fica num card de 560×700) |
| `pilula` | `"Gerando com **Linho de Domingo**"` | até ~40. `""` tira |
| `passes` | `{ "a": [...], "b": [...] }` | raro: as cores dos dois passes (padrão: das cores da marca) |

**baralho** (12 batidas) — as variações trocam no tempo e empilham num baralho 3D; quatro palavras entram em volta da carta da frente (duas em cima/embaixo, duas à direita). No fim, o baralho floresce no gradiente (se vier manifesto ou formatos) ou some no fundo. **Imagens: 4 a 8** (em pé, como a da montagem).

| Campo | Exemplo | Limites |
|---|---|---|
| `imagens` | 8 caminhos | variações do mesmo resultado (o mesmo produto em outras cenas, outros ângulos, outras peças) |
| `palavras` | `["Cada", "foto.", "Seu", "visual."]` | 4 palavras curtas: as duas primeiras formam uma frase, as duas últimas outra (a quarta em itálico). Até ~10 caracteres cada |

**manifesto** (8 batidas; 12 sem formatos) — sobre o gradiente, a frase entra palavra a palavra com o espaçamento relaxando e as alças crescendo; a frase abre e o cartão do produto sai do vão em perspectiva (free transform).

| Campo | Exemplo | Limites |
|---|---|---|
| `antes`, `destaque` | `"O estúdio de IA que aprende"`, `"o seu visual."` | a frase, com o fim em itálico. Até 8 palavras e ~45 caracteres somados |
| `cartao` | ver abaixo | o cartão do produto, que também é o nó central dos formatos |

`cartao`: `icone` (ver Ícones), `titulo` (até ~18) e `subtitulo` (até ~18), `cores` (`true` mostra a paleta), `linhas` (até 3 pares `[rótulo, valor]`, valor até ~30), `miniaturas` (até 6 imagens pequenas; sem elas o cartão fica mais baixo). **Imagens: 0 a 6.**

**formatos** (16 batidas) — o cartão vira um nó ligado por fios a 3 ou 4 saídas, cada uma num formato; a câmera corre pelos fios e abre no conjunto; a legenda entra em cima; um brilho passa por todas as saídas. **Imagens: 3 ou 4.**

| Campo | Exemplo | Limites |
|---|---|---|
| `saidas` | `[{ "imagem", "foco", "texto", "fraco", "chips": ["Campanha", "4:5", "4K"] }]` | **3 ou 4**, nesta ordem de forma: 1ª em pé 4:5 (com legenda), 2ª deitada 16:9 (é a de vídeo: tem play e barra de progresso; com legenda), 3ª quadrada, 4ª em pé 9:16. `texto` até ~60, `fraco` (o fim apagado) até ~20, `chips` 3 rótulos curtos (até ~10 cada) |
| `legenda` | `["Uma chave.", "Todo formato."]` | a 2ª parte em itálico. Até ~34 somados |
| `cartao` | | só quando não há manifesto (o cartão entra direto no lugar dele) |

**chamada** (8 batidas) — a frase final grande, palavra a palavra, o destaque em itálico com o gradiente do acento; as alças pulam no destaque, na frase toda, de volta no destaque; um cisalhamento recolhe a frase num ponto.

| Campo | Exemplo | Limites |
|---|---|---|
| `antes`, `destaque` | `"Deixe com a sua"`, `"cara."` | até 7 palavras; ~24 caracteres no corpo cheio, até ~45 encolhendo |

**fecho** (5,7 s) — o símbolo cai grande, encolhe para o lugar, o nome sai de trás com máscara e desfoque; a música para e o logo trava no silêncio; o slogan. Campo: `slogan` (até ~40; `""` tira).

### Ícones

Onde o config pede um ícone (`etapas.itens[].icone`, `cartao.icone`):
- os desenhados para o filme: `paleta`, `sol`, `grao`, `lente`, `chave`, `chaveP`, `imagem`, `video`, `check`;
- ou qualquer ícone do pacote **lucide** em kebab-case (`shirt`, `calendar-check`, `droplets`, `wallet`, `trending-up`, `package-check`...): todos os de lucide.dev estão em `engine/js/lucide.js`. Procure lá antes (`grep '"nome-do-icone"' engine/js/lucide.js`); um nome que não existe vira `sparkles`, com aviso.

## As imagens

O que depende de imagem, por cena: abertura 1, vão 6 a 8, pedido 0 ou 1, montagem 1, baralho 4 a 8, manifesto 0 a 6 miniaturas, formatos 3 ou 4. Um filme completo usa de 15 a 25 imagens (podem se repetir entre cenas: a imagem da montagem pode ser a 1ª saída dos formatos, as do vão podem ser as miniaturas).

O que serve, do mais simples ao mais trabalhoso:
1. **As fotos do negócio**: produtos, peças, o espaço, a equipe trabalhando, o resultado de um serviço, prints do app (uma tela de celular cabe bem nas cenas em pé). JPG ou PNG, de 1000 px ou mais no lado menor. As cenas cortam para preencher (`foco` escolhe o que fica).
2. **Fotos de banco com licença livre** (Unsplash, Pexels): confira a licença na página de cada foto, prefira fotos sem marca de terceiros visível e sem rosto reconhecível de alguém famoso.
3. **Gerar** com o gerador de imagem que a pessoa tiver (ChatGPT, Gemini, Midjourney, Ideogram, Firefly...). As receitas da demo estão em `midia/demo/receitas/`: um parágrafo de estilo (`_estilo.txt`) que vai em toda imagem, mais o assunto de cada uma. Troque o estilo pela cara da marca (a luz, a paleta em hex, a lente, a textura) e os assuntos pelo produto da pessoa; gere a imagem-herói primeiro e use-a como referência nas variações, para todas parecerem da mesma sessão. Peça proporção em pé (2:3) para montagem e baralho, quadrada ou em pé para o vão.
4. **Sem imagem nenhuma**: um filme só de texto funciona. Tire `abertura`, `vao`, `montagem`, `baralho` e `formatos`; deixe o `pedido` sem `fundo` e o `cartao` sem `miniaturas`. Fica: gancho → etapas → pedido → manifesto → chamada → fecho (~23 s).

Nada com marca de outra empresa visível nas imagens.

## Música e efeitos

A música é "Laser Groove", de Kevin MacLeod (incompetech.com), licença **Creative Commons Attribution 4.0**: uso comercial e em vídeo liberados **com crédito obrigatório** na legenda ou na descrição do post (o texto está em `CREDITS.md`). Ela é recortada nos compassos para qualquer duração: o drop dela cai na revelação da montagem (sem montagem, na primeira cena depois do pedido) e a batida final na trava do logo. Os efeitos são sintetizados em código, livres. Para postar com uma música da moda (e sem crédito): `node tools/filme.mjs <filme> --sem-musica` e a música escolhida no app. Outra faixa só se for de 140 BPM, com um drop marcado e um final seco: `.venv/bin/python tools/trilha.py <filme> <faixa.mp3> --drop <segundo do drop> --fim <segundo da batida final>`, depois `tools/mix.py` (ver `tools/filme.mjs`).

## Formato

Só 1920×1080 (16:9). Cada cena é composta para o quadro deitado (a pergunta numa linha com o vão abrindo para os lados, o painel de imagens espalhado, o grafo com a câmera correndo para a direita); em pé ou quadrado, o texto ficaria pequeno demais ou as peças sairiam do quadro. Para o Reels/TikTok, poste o 16:9 como está ou peça uma versão recomposta: não reescale.

## Conferir

- **Linha** e **folha** depois de cada mudança no config: `node tools/render.mjs <filme> linha` (nenhum aviso) e `node tools/render.mjs <filme> folha --passo 15`.
- **Quadros** em 1920×1080 do que é pequeno: as etapas prontas (o último item), o pedido no plano aberto (o texto inteiro na barra), o cartão no manifesto, o grafo dos formatos no fim (as legendas e os chips), o logo travado. Use a `linha` para saber os quadros de cada cena; numa emenda entre cenas, 6 a 8 quadros seguidos.
- Nenhum texto cortado nem vazando do quadro; nenhuma palavra da demo sobrando (procure no config: `grep -niE "patina|linho|domingo|estúdio de ia|chave de estilo|referências" filmes/<filme>.json`); nenhuma imagem da demo (`grep -n "midia/demo" filmes/<filme>.json`).
- Demo contra a referência: `node tools/render.mjs demo compara arquivos/referencia.mp4`.
- Rascunho com som antes do final: `node tools/filme.mjs <filme> --rascunho`.

## Personalizar

Antes de mudar, três perguntas: o que o negócio vende e o que o filme lança (um produto, uma coleção, um serviço, um app, uma funcionalidade), que material a pessoa já tem (logo, cores, fonte, fotos, prints) e que imagens vai conseguir (as dela, de banco, geradas, ou nenhuma). Depois:

| O quê | Onde | Precisa de material novo? |
|---|---|---|
| Nome, logo, cores, fontes | `marca`, `cores`, `fontes` | O símbolo em SVG de uma cor (ou o disco); a fonte, se for gratuita |
| A pergunta do gancho e a frase final | cenas `gancho`, `chamada`, `fecho` | Não |
| As etapas (como funciona) | cena `etapas` | Não |
| O pedido (o que se digita no produto) | cena `pedido` | Uma foto de fundo, opcional |
| O resultado e as variações | cenas `montagem`, `baralho` | Sim: 1 + 4 a 8 imagens |
| O produto e onde ele chega | cenas `manifesto`, `formatos` | 3 ou 4 imagens; miniaturas opcionais |
| O problema da abertura | cena `abertura` | 1 imagem |
| Quais cenas entram | a lista `cenas` | Não |

**Regras ao trocar**
- Não mude os movimentos, as curvas, os tempos nem o código das cenas, a menos que a pessoa peça: o acabamento do filme está neles.
- Traduza cada jogada para o negócio, sem copiar as frases da demo: o gancho é a pergunta que o produto responde; as etapas, como ele funciona; o pedido, o que a pessoa digita ou escolhe nele; a montagem, o resultado; o baralho, as variações; os formatos, onde o resultado chega.
- Nada de número, preço, cliente, prazo ou resultado que a pessoa não deu apresentado como fato. Use rótulos de forma ("4:5", "PDF"), nomes de exemplo (um pedido de exemplo, um cliente fictício avisado como exemplo) ou pergunte. Texto que ela não deu e não é fato pode ser provisório, avisado.
- No fim, liste o que ainda é da demonstração (texto ou imagem) e o que ficou de fora.

## Arquivos

| O quê | Onde |
|---|---|
| Configs dos filmes | `filmes/` (`demo.json`) |
| Mídia | `midia/<filme>/` (a da demo e as receitas das imagens em `midia/demo/`) |
| Cenas | `engine/js/cenas/abertura.js`, `gancho.js` (gancho, vão, etapas), `pedido.js`, `montagem.js` (montagem, baralho), `manifesto.js` (manifesto, formatos), `chamada.js` (chamada, fecho) |
| Núcleo | `engine/js/nucleo.js` (config, cores, linha do tempo), `fx.js` (pixels, gradiente, pontos, meio-tom), `kit.js` (logo, ícones, cursor), `main.js` |
| Música e efeitos | `audio/trilha/`, `tools/trilha.py`, `tools/sfx.py`, `tools/mix.py` |
| Saída | `out/<filme>/` |
