# Dicta — Motion Design · ProfitizeBuild

TAREFA: montar o filme "Dicta" e fazer a versão do produto da pessoa. Filme de lançamento de um app, SaaS, produto digital ou serviço, 1080×1080 (ou 1080×1920 para Reels, ou 1920×1080), 30 fps, de 20 a 33 s, com trilha, efeitos e narração opcional. A história: no silêncio, o problema em duas linhas (a segunda digitada, com um erro e um apagar); o cursor do texto vira um ícone cromado com o símbolo da marca, que gira e pousa no começo da música; o produto em ação, num pedaço de interface (uma entrada bagunçada chega, as partes erradas são riscadas e viram poeira, o resto se junta num resultado limpo); a câmera mergulha no símbolo e o nome da marca entra no corte da música; o resultado em vários lugares; o slogan com a palavra torta que se endireita; as variações; o símbolo nasce do cursor e a chamada cai na batida final.

O projeto completo vem no pacote: `arquivos/projeto/` (o motor que desenha o filme quadro a quadro, as cenas, a trilha e os efeitos) e `arquivos/referencia.mp4` (o filme pronto da demonstração, o lançamento da Dicta, um teclado de voz para Mac, marca fictícia). O guia (`CLAUDE.md` ou `AGENTS.md` nesta pasta) explica o config, cada cena e seus limites, o símbolo, a voz e como conferir. Leia o guia antes de mudar qualquer coisa. Tudo se adapta pelo config (`filmes/<nome>.json`); não mude o código das cenas.

## Antes de começar: pergunte

Faça uma pergunta por vez e espere a resposta. O que já estiver preenchido no bloco PREENCHA, não pergunte de novo.

1. **O que o filme vai lançar?** (a) a demonstração como está, só para ver funcionando; (b) o meu produto ou serviço; (c) o de um cliente meu. Em (b) ou (c): o que o produto faz e para quem, o problema que ele resolve, e o "antes e depois" dele (o que a pessoa tem na mão antes, bagunçado, e o que o produto entrega, limpo). Se a pessoa tiver o código do app numa pasta, leia de lá os nomes das telas, dos campos e dos botões.
2. **Material da marca.** O símbolo (SVG de uma cor; PNG sem fundo serve para começar, mas avise que o ícone 3D precisa do SVG em formas preenchidas), as cores (fundo escuro, texto, destaque), a fonte se for gratuita. Marca de fundo claro usa a versão escura dela (o filme é de luz sobre o escuro).
3. **Formato.** Quadrado (feed), vertical (Reels, Stories, TikTok) ou deitado (YouTube, site). Avise: o vertical e o deitado usam a composição do quadrado, centrada, com o fundo continuando acima e abaixo (ou dos lados).
4. **Voz.** (a) ElevenLabs conectada ao Claude Code (o melhor: a IA gera as falas sozinha); (b) ElevenLabs pela chave da API; (c) sem voz, só trilha e efeitos (como a demonstração). Avise: uso comercial da voz exige plano pago da ElevenLabs, e o filme segue a música, então as falas têm de ser curtas.
5. **O roteiro.** Com as respostas, proponha 2 roteiros diferentes, cada um com: as cenas que entram (e por quê), as duas linhas do gancho (e onde é o erro de digitação), a janela da demo (título e a linha de cima), a entrada bloco a bloco com o que sai, o que muda e o que entra, o resultado limpo, a tecla (ou sem tecla), o slogan da marca, os cartões dos usos, as partes do slogan com a parte torta, as variações e a legenda, a chamada final e as falas (se houver voz). Mostre os dois lado a lado e espere a escolha (ou os ajustes). Regras do roteiro:
   - A demonstração é "fala bagunçada → texto limpo" para um teclado de voz. Traduza a jogada para o produto (um app de agenda de clínica: a mensagem solta do paciente vira "Limpeza marcada: quarta, 9h."; um curso de escrita: o rascunho do aluno vira uma frase de venda; um app financeiro: a linha crua do extrato vira um lançamento com categoria), sem copiar as frases da demo.
   - O gancho é problema → virada: a linha 1 é a situação, a linha 2 (digitada) é o problema ou a virada.
   - A entrada é o que o cliente da pessoa tem de verdade antes do produto (uma mensagem, um rascunho, um extrato, uma anotação), com o vocabulário real; o resultado é o que o produto entrega. Use o vocabulário do produto nos textos de interface (título da janela, nome dos cartões).
   - As cenas `usos`, `slogan` e `variacoes` são opcionais: entram quando têm o que dizer (variações só se o produto tem versões de verdade: idiomas, especialidades, formatos). Um roteiro pode ser o completo (~31 s) e o outro o curto, só com as obrigatórias (~20 s).
   - Nada de número, preço, cliente, prazo ou resultado que a pessoa não deu apresentado como fato: pergunte, ou use exemplos claramente de demonstração (nomes inventados, valores redondos). Nada de cidade, estado ou ponto turístico nos textos.
   - Copy profissional e curta, no idioma do filme, sem tradução literal; nada de "coisas", "soluções", "inovador".
   - Falas (se houver voz): 2 a 4, curtas, uma ideia cada, nas cenas gancho, demo, marca ou fecho; cada uma tem de caber na cena (o guia diz o espaço).

## PREENCHA (opcional; o que ficar em branco, pergunte)

- Lançar: [demonstração / meu produto: ___ / produto de cliente: ___]
- O produto, para quem, o problema e o antes → depois: [___]
- Nomes das telas, campos e botões (ou a pasta do código do app): [___]
- Símbolo: [caminho do SVG/PNG ___]; nome ___
- Cores: [fundo ___, texto ___, destaque ___]; fonte: [___ / nenhuma]
- Formato: [quadrado / vertical / deitado]
- Voz: [ElevenLabs conectada / ElevenLabs com chave / sem voz]
- Idioma dos textos e das falas: [português / inglês / espanhol]

## Montar a demonstração

1. Copie o conteúdo de `arquivos/projeto/` para a raiz desta pasta (`cp -R arquivos/projeto/. .`). Precisa de Node 18+ e do Python 3.
2. `npm install`, `npx playwright install chromium` e o ambiente do som: `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt` (no Windows, `.venv\Scripts\pip`).
3. `node tools/render.mjs demo compara arquivos/referencia.mp4` e abra `out/demo/compara.jpg`: cada par é o quadro da demo ao lado do mesmo instante da referência, e os dois têm de ser iguais.
4. `node tools/filme.mjs demo --rascunho` gera `out/demo/demo-rascunho.mp4` com som (1 a 2 minutos). Se a pessoa escolheu (a), faça o final (`node tools/filme.mjs demo`) e pare aqui.

## O filme da pessoa

1. **Mídia.** Em `midia/<marca>/`: o símbolo como `simbolo.svg`. Abra o SVG: uma cor só, formas preenchidas (traços convertidos em contorno), nenhum `<rect>` ou círculo de fundo do tamanho do desenho; cada forma de primeiro nível é uma parte. Veja se alguma parte é uma barra vertical (vira a `ancora`). De PNG, peça o SVG ou trace um de uma cor. A fonte, se houver (`.woff2`, pesos 400, 500 e 700, como o guia explica).
2. **Config.** Copie `filmes/demo.json` para `filmes/<marca>.json` e preencha com o roteiro escolhido, de cima a baixo: `nome`, `idioma`, `formato`, `marca`, `cores`, `voz` e as `cenas` (só as que entram, na ordem do guia). Os campos e os limites estão no guia. Confira os ícones no `engine/lucide.js`. Antes de renderizar, procure sobras da demo: `grep -niE "dicta|marina|rafael|lançamento|quinta|para mac" filmes/<marca>.json`.
3. **Folha.** `node tools/render.mjs <marca> linha` e `node tools/render.mjs <marca> folha`; abra a imagem. Depois confira em `quadros` o que é pequeno (use a `linha` para achar cada cena): o ícone de frente (o símbolo inteiro e centrado), a entrada inteira e o resultado na janela, a linha da marca, os cartões cheios, o símbolo montado e o nome no fim. Mostre à pessoa e ajuste o config até passar no critério de aceite. Para olhar uma emenda, 6 a 8 quadros seguidos.
4. **Voz** (se tiver):
   - Conectada: se a ElevenLabs ainda não estiver no Claude Code, peça para a pessoa rodar `claude mcp add --transport http elevenlabs https://api.elevenlabs.io/v1/mcp`, reabrir o Claude Code, digitar `/mcp` e entrar na conta. Gere cada fala com a ferramenta de texto para voz do MCP e salve como `audio/voz/<marca>/<tipo da cena>.mp3`. Se a ferramenta devolver um link, baixe. Se o MCP não salvar arquivo nenhum, use o caminho da chave.
   - Com chave: a chave em `.env` na raiz (`ELEVENLABS_API_KEY=...`) e `node tools/voz-elevenlabs.mjs <marca>`.
   - Depois de gerar: `node tools/voz.mjs <marca>` mostra a duração de cada fala e o espaço da cena; "NÃO CABE" = encurte a frase e gere de novo só ela. Confira o que a voz disse: `node tools/voz-confere.mjs <marca>`.
   - Sem voz: `"voz": "sem"`.
5. **Rascunho e final.** `node tools/filme.mjs <marca> --rascunho` e entregue à pessoa para assistir com som; você confere pelos quadros e pela saída da mixagem (-14 LUFS); corrija o que ela apontar; depois `node tools/filme.mjs <marca> --refaz` para o final em `out/<marca>/<marca>.mp4`.
6. No fim, diga à pessoa o crédito obrigatório da música (está em `CREDITS.md`; sem crédito, `--sem-musica` e uma música do app de postar) e liste o que ainda é da demonstração e o que ficou de fora do roteiro.

## Critério de aceite

- A demonstração renderiza igual ao `referencia.mp4` antes de qualquer mudança.
- No filme da pessoa: o símbolo dela no ícone 3D (inteiro, sem forma faltando nem quadrado de fundo), na linha da marca, na pílula dos cartões e no fim; as cores dela, nenhum laranja da demo quando o acento é outro; nenhum texto cortado ou vazando da janela, do cartão ou do quadro; nenhuma palavra da demo sobrando; nenhum aviso de ícone no log.
- A entrada da demo conta o "antes" do produto e o resultado conta o "depois", com o vocabulário dele; nenhum número, preço ou cliente inventado como fato.
- Cada emenda entre cenas é o corte seco na batida ou o movimento da própria cena: nada de quadro perdido, piscada ou pulo.
- Nenhuma fala passa da cena dela, e a transcrição confere com o texto, com o nome da marca certo.
- O MP4 final tem o formato pedido (1080×1080, 1080×1920 ou 1920×1080), 30 fps, som em torno de -14 LUFS, e a duração que a linha do tempo diz.
