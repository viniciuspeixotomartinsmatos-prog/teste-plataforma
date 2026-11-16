# Guia do projeto — Dicta

Filme de lançamento de um app, SaaS, produto digital ou serviço: 1080×1080 (ou 1080×1920 para Reels, ou 1920×1080), 30 fps, de 20 a 33 s, desenhado em HTML e three.js e renderizado quadro a quadro pelo Chromium headless, com trilha, efeitos sonoros e narração opcional. A história: o problema digitado no silêncio; o cursor do texto vira um ícone cromado que gira e pousa no começo da música; o produto em ação (uma entrada bagunçada vira um resultado limpo); a câmera mergulha no símbolo e o nome da marca entra no corte da música; o resultado em vários lugares; o slogan; as variações; o símbolo nasce do cursor e a chamada final cai na última batida.

O filme é feito de **cenas-molde**: cada cena tem um movimento medido e acabado, e o conteúdo dela (textos, símbolo, cores, a interface do produto, falas) vem de um arquivo de configuração. A demonstração (`filmes/demo.json`) é o lançamento da Dicta, uma marca fictícia: um teclado de voz para Mac que transforma fala bagunçada em texto limpo.

## Como funciona

1. **O config** (`filmes/<nome>.json`) diz a marca, as cores, o formato, quais cenas entram, o texto de cada uma e as falas.
2. **A linha do tempo** monta o filme: as cenas sempre na mesma ordem, cada uma com a duração que o conteúdo pede (mais letras digitadas e mais palavras na entrada alongam a abertura e a demonstração). Da marca em diante, tudo é contado em batidas da música (100 BPM): cada cena opcional que sai encurta o filme em batidas inteiras.
3. **O motor** (`engine/`) desenha cada quadro como função pura do tempo. As cores vêm de três papéis (fundo, texto, acento): o acento gera a família toda (os brilhos, as partes riscadas, o esmaecimento que leva cada frase embora). O símbolo do config vira o relevo do ícone 3D, o símbolo do nome e o desenho que nasce do cursor no fim.
4. **O som**: a trilha (`audio/trilha/`) é editada sozinha na linha do tempo (introdução abafada que se abre no mergulho, a virada no corte para a marca, o groove e a batida final da própria faixa); os efeitos (`audio/sfx/`) seguem os marcos das cenas; a mixagem sai em -14 LUFS.

## Comandos

Tudo da raiz do projeto. Precisa de Node 18+ e Python 3. O ffmpeg vem pelo `npm install` (se o npm avisar que pulou scripts de instalação, tudo bem: as ferramentas dão a permissão de execução ao ffmpeg sozinhas).

```bash
npm install
npx playwright install chromium
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt     # Windows: .venv\Scripts\pip
```

| Comando | O que faz |
|---|---|
| `node tools/render.mjs <filme> linha` | a linha do tempo: onde cada cena começa, o drop, a batida final |
| `node tools/render.mjs <filme> folha` | folha de contato (1 quadro a cada 0,5 s) → `out/<filme>/folha.jpg` |
| `node tools/render.mjs <filme> quadros 120,300-330:5` | quadros soltos no tamanho final → `out/<filme>/quadros/` (o texto pequeno da interface se julga aqui, não na folha) |
| `node tools/render.mjs demo compara arquivos/referencia.mp4` | a demo ao lado da referência, a cada segundo → `out/demo/compara.jpg` |
| `node tools/filme.mjs <filme> --rascunho` | o filme inteiro em meia resolução, com som (1 a 2 min) |
| `node tools/filme.mjs <filme>` | o filme final → `out/<filme>/<filme>.mp4` (3 a 6 min) |
| `node tools/filme.mjs <filme> --sem-musica` | só efeitos (e voz), para usar uma música do Instagram/TikTok ao postar |
| `node tools/voz.mjs <filme>` / `voz-elevenlabs.mjs` / `voz-confere.mjs` | falas (ver Voz) |

Depois de mudar o config, os quadros já renderizados ficam velhos: rode o filme com `--refaz`.

## O config

Parta de `filmes/demo.json` (copie para `filmes/<nome>.json`) e troque o conteúdo. Troque tudo, mesmo o que aparece pequeno (o nome no campo da janela, os cartões), senão a demo vaza para o filme.

### A marca, as cores e o formato

| Campo | O quê |
|---|---|
| `nome` | o mesmo nome do arquivo |
| `idioma` | `"pt"`, `"en"` ou `"es"` (os textos são todos do config) |
| `formato` | `"quadrado"` (1080×1080, o padrão), `"vertical"` (1080×1920, Reels/Stories/TikTok) ou `"horizontal"` (1920×1080). A composição é a do quadrado, centrada: no vertical e no horizontal o fundo continua acima e abaixo (ou dos lados) |
| `fps` | `30` (padrão). `60` também funciona (render mais lento) |
| `marca.nome` | o nome no corte para a marca e no fim. Até ~10 caracteres no corpo cheio; nomes mais longos diminuem |
| `marca.simbolo` | SVG do símbolo **de uma cor, em formas preenchidas** (não traços: no Figma/Illustrator, "Outline stroke" / "Contornar traçado" antes de exportar), sem fundo. **Abra o SVG antes:** um `<rect>` ou círculo de fundo do tamanho do desenho vira um quadrado no ícone; apague. Cada forma de primeiro nível do SVG é uma "parte" do símbolo |
| `marca.ancora` | o índice (de 0) da parte que é uma **barra vertical** (um traço de letra, um cursor, uma haste). O cursor do filme vira essa barra no fim e as outras partes crescem a partir dela. `null` quando o símbolo não tem barra: o cursor fica no centro e some enquanto o símbolo cresce |
| `marca.onda` | opcional: `{ "cx", "cy", "r", "ang", "sw" }` nas unidades do SVG: o arco que sai do símbolo no drop (centro, raio, meio-ângulo em graus, espessura). `null` = um anel em volta do símbolo |
| `marca.fonte` | `{ "familia": "Manrope", "arquivos": [{ "arquivo": "midia/x/fonte-400.woff2", "peso": 400 }, ...] }` ou `null` (Inter). Entra nos textos grandes (abertura, marca, slogan, fim); a interface é sempre Inter. Fonte gratuita para uso comercial, pesos 400, 500 e 700. Para baixar uma do Google Fonts: numa pasta temporária, `npm pack @fontsource/<nome>`, `tar xzf` no `.tgz` e copie `files/<nome>-latin-400-normal.woff2` (e 500, 700) e o `LICENSE` para `midia/<filme>/fonte/` |
| `cores.fundo` | o fundo. **Tem de ser escuro** (quase preto; um toque da cor da marca funciona: `#04120E`, `#0B0A12`) |
| `cores.texto` | o texto (claro) |
| `cores.acento` | a cor de destaque: as partes riscadas, as barras de áudio, a bolha enviada, a onda, o brilho do fim. Clara o bastante para brilhar no escuro |
| `voz` | `"sem"`, `"elevenlabs"` ou `"arquivos"` (falas gravadas) |

O ícone 3D é sempre grafite cromado com o símbolo em relevo branco: é a cara do filme, e serve a qualquer marca.

### As cenas

**A ordem é sempre esta**: `gancho` → `giro` → `demo` → `marca` → `usos` → `slogan` → `variacoes` → `fecho`. **Obrigatórias**: gancho, giro, demo, marca, fecho. As outras saem com `"ativa": false` (ou sem o objeto), e o filme encurta em batidas inteiras. Toda cena aceita `"fala"` (o texto que a voz diz; não aparece na tela).

**gancho** — no silêncio, o problema. A linha 1 entra palavra por palavra; a linha 2 é digitada tecla a tecla, com um erro e um apagar; o cursor fica piscando e vira a borda do ícone.

| Campo | Exemplo | Limites |
|---|---|---|
| `linha1` | `"Pensar é rápido."` | a situação. Até ~28 caracteres no corpo cheio, até ~40 diminuindo |
| `linha2` | `"Digitar, nem tanto."` | a virada (o problema). Mesmos limites. Mais letras = abertura mais longa (~0,13 s por letra) |
| `erro` | `4` | a posição (de 0) de uma letra onde a pessoa erra: digita a letra seguinte, apaga e segue. Não pode ser um espaço. Sem o campo, sem erro |

**giro** — o cursor vira o ícone de lado, gira três voltas e pousa de frente na batida. Sem campos (o ícone usa `marca.simbolo`).

**demo** — o produto em ação, num pedaço de interface: a janela entra de perto da lente, o ícone encolhe para dentro da pílula do produto, a tecla é segurada, a entrada bagunçada chega palavra por palavra, a tecla solta, as partes que saem ficam na cor do acento, são riscadas e viram poeira que voa para o ícone, e o resto se junta no resultado limpo. Depois a câmera mergulha no símbolo.

| Campo | Exemplo | Limites |
|---|---|---|
| `janela` | `{ "titulo": "Nova mensagem", "campo": "Para", "valor": "Marina Costa" }` | o lugar onde o resultado aparece. `campo`/`valor` = a linha de cima (destinatário, cliente, projeto); `""` some |
| `entrada` | `"[tipo,] [então] vamos>Vamos passar o lançamento pra>para [é…] [sexta…] [não,] quinta"` | a entrada, bloco a bloco, separados por espaço: `[x]` = sai (riscado e desfeito); `a>B` = aparece como `a` e vira `B`; `+B` = só aparece no resultado; `_` = espaço dentro de um bloco. De 4 a ~16 blocos; o texto bruto cabe em 4 linhas (~150 caracteres) e o resultado em 3. Mais blocos = demonstração mais longa (~0,2 s por bloco) |
| `ponto` | `"."` | a pontuação que cai no fim do resultado; `""` sem |
| `tecla` | `{ "texto": "fn", "icone": "globe" }` | a tecla segurada enquanto a entrada chega (`texto` até ~7 letras, `icone` do lucide). `null` = sem tecla (o contorno da pílula acende) |
| `contador` | `true` | o 0:0N na pílula (faz sentido para voz; `false` para os outros) |

**marca** — o corte seco na virada da música: `[símbolo] Nome` na primeira batida, as palavras do slogan nas colcheias seguintes, uma onda sai do símbolo no drop, e a linha some no esmaecimento.

| Campo | Exemplo | Limites |
|---|---|---|
| `slogan` | `"Fale para escrever."` | de 1 a ~5 palavras (entram em até 3 grupos). Com nome e slogan longos, o slogan desce para a 2ª linha |

**usos** — o mesmo resultado em vários lugares: de 2 a 4 cartões voam de perto da lente para a grade; o texto entra em cada um com a pílula do produto; a legenda em cima.

| Campo | Exemplo | Limites |
|---|---|---|
| `legenda` | `["Funciona", "em qualquer", "app."]` | 1 a 3 partes (uma por batida), ~32 caracteres somados |
| `cartoes` | ver abaixo | 2 a 4. Cada um: `nome` (~16), `icone` (lucide) e um dos tipos |

Tipos de cartão (o texto se ajusta até 72 % do tamanho; o render avisa quando um cartão tem texto demais):
- `"texto"`: `titulo` (~30), `corpo` (~80), `assinatura` (~30) — um e-mail, um post, uma nota;
- `"chat"`: `recebida` (~40) e `enviada` (~40, na bolha do acento; é ela que entra);
- `"lista"`: `titulo` (~30) e `itens` (2 a 3, ~32 cada) — uma agenda, um plano, um pedido;
- `"codigo"`: `inicio` (número da 1ª linha) e `linhas` (2 a 3, ~42 cada; comentários, palavras-chave e textos entre aspas ganham cor).

**slogan** — a promessa em 2 a 4 partes, uma por batida; a parte "bagunçada" chega torta e se endireita quando a última entra.

| Campo | Exemplo | Limites |
|---|---|---|
| `partes` | `["Fala", "solta.", "Texto", "pronto."]` | 2 a 4, ~32 caracteres somados numa linha (quebra em duas se passar) |
| `baguncada` | `1` | o índice da parte que chega torta (ou sem o campo) |

**variacoes** — uma palavra grande que se refaz em blocos de pixel a cada colcheia (idiomas, especialidades, formatos, cidades não: ver Regras), com uma legenda; a última se recolhe no cursor.

| Campo | Exemplo | Limites |
|---|---|---|
| `palavras` | `["Olá", "Hello", "Hola", "Bonjour"]` | 2 a 8, até ~12 letras cada (alfabeto latino, cirílico ou grego) |
| `legenda` | `"Mais de 100 idiomas."` | ~30 caracteres |

**fecho** — o cursor volta e vira o símbolo, o símbolo desliza para a esquerda revelando o nome, e na batida final o brilho passa pelo nome e a chamada entra. Corte seco para o preto.

| Campo | Exemplo | Limites |
|---|---|---|
| `chamada` | `"Já disponível para Mac."` | ~40 caracteres (o que fazer agora: baixar, testar, se inscrever) |

### Ícones

Onde o config pede um ícone (`tecla.icone`, `cartoes[].icone`): um nome do pacote **lucide** em kebab-case (`calendar-days`, `mail`, `message-square`, `sparkles`, `wand-sparkles`, `receipt`...). Todos estão em `engine/lucide.js`; confira antes (`grep '"nome-do-icone":' engine/lucide.js`). Um nome que não existe vira um ponto, com aviso no log.

## Mídia

Em `midia/<nome>/`: `simbolo.svg` (obrigatório) e, se houver, a fonte da marca. Nada com marca de outra empresa (sem logos de apps de terceiros nos cartões: os nomes dos cartões são genéricos, "E-mail", "Chat", "Agenda").

## Voz

Três caminhos (o filme funciona nos três):

1. **ElevenLabs conectada ao Claude Code** (o preferido). Uma vez só: `claude mcp add --transport http elevenlabs https://api.elevenlabs.io/v1/mcp`, depois `/mcp` dentro do Claude Code e o login na conta da ElevenLabs. Para cada cena com fala, gere a fala com a ferramenta de texto para voz do MCP (voz `cyD08lEy76q03ER1jZ7y` ou outra no idioma do filme; modelo `eleven_v4`, ou o melhor multilíngue disponível) e salve como `audio/voz/<filme>/<tipo>.mp3`. Depois: `node tools/voz.mjs <filme>`.
2. **ElevenLabs pela chave da API**: a chave num arquivo `.env` na raiz (`ELEVENLABS_API_KEY=...`) e `node tools/voz-elevenlabs.mjs <filme>`.
3. **Sem voz**: `"voz": "sem"` (como a demonstração).

Regras:
- **Uso comercial da voz exige plano pago da ElevenLabs.**
- **O filme segue a música: as cenas não esticam para a voz.** A fala começa 0,15 s depois do início da cena e tem de acabar antes da próxima; `tools/voz.mjs` mostra o espaço de cada cena e avisa "NÃO CABE". Espaço típico: gancho ~4 s, giro ~2,3 s, demo ~6,5 s, marca ~3,5 s, usos e slogan ~3,5 s, variações ~2,3 s, fecho ~4,5 s.
- 2 a 4 falas curtas, uma ideia cada. O gancho e a demo têm sons de tecla e de interface: a fala ali fica por cima, então frase curta.
- A fala é o texto falado, não o da tela: escreva nomes como se pronunciam.
- Confira o que a voz disse sem ouvir: `node tools/voz-confere.mjs <filme>` (precisa da chave).

## Música

A trilha é "Secrets of the Schoolyard", de Kevin MacLeod (incompetech.com), licença **Creative Commons Attribution 4.0**: uso comercial liberado **com crédito obrigatório** na legenda ou na descrição do post (o texto está em `CREDITS.md`). Ela se edita sozinha para qualquer duração. Outra faixa: só uma de 4/4 com uma virada antes de um tempo forte e uma batida final; meça e escreva um `audio/trilha/<nome>.json` como o `trilha.json` (bpm, entrada, drop, fim, introFim, em segundos da faixa) e ponha `"trilha": "<nome>"` no config. Para postar com música da moda (e sem crédito): `--sem-musica` e a música escolhida no app.

## Conferir

- **Folha** depois de cada mudança no config: `node tools/render.mjs <filme> folha`. A folha é pequena: o texto da interface se confere em `quadros`.
- **Quadros-chave** (use `linha` para saber onde cada cena está): a linha 2 digitada inteira; o ícone pousado de frente (o símbolo inteiro, sem forma faltando); a entrada inteira na janela, o resultado limpo; a linha da marca; os cartões cheios; o slogan; a última palavra das variações; o símbolo montado no fecho e o nome com a chamada.
- **Emendas**: 6 a 8 quadros seguidos em volta do pouso do ícone, do mergulho e de cada troca de cena.
- Nenhum texto cortado nem vazando da janela, do cartão ou do quadro; nenhuma palavra da demo (`grep -niE "dicta|marina|rafael|lançamento|quinta|fn" filmes/<filme>.json`); nenhum laranja da demo quando o acento é outro; o seu símbolo no ícone, na linha da marca, na pílula dos cartões e no fim; nenhum aviso de ícone no log.
- Demo contra a referência: `node tools/render.mjs demo compara arquivos/referencia.mp4`.
- Rascunho com som antes do final.

## Personalizar

Antes de mudar, três perguntas: o que o produto faz e para quem, que material a pessoa já tem (símbolo, cores, fonte, os nomes das telas do produto) e se terá voz. Depois:

| O quê | Onde | Precisa de material novo? |
|---|---|---|
| Nome, símbolo, cores, fonte | `marca`, `cores` | O símbolo em SVG de uma cor, em formas preenchidas; a fonte, se a marca tiver uma gratuita |
| O problema e a virada | cena `gancho` | Não |
| O produto em ação (bagunçado → limpo) | cena `demo` | Não: a interface é desenhada em código com os textos do config |
| Onde o resultado aparece | cena `usos` | Não |
| Slogan, variações, chamada | cenas `marca`, `slogan`, `variacoes`, `fecho` | Não |
| Formato (1:1, 9:16, 16:9) | `formato` | Não |
| Narração | `fala` das cenas + Voz | Conta da ElevenLabs (paga, para uso comercial) |

**Como a jogada vira o produto da pessoa** (a demonstração é "fala bagunçada → texto limpo"; nunca copie as frases dela):
- **App de agenda para clínica**: gancho "Paciente escreve do jeito dele. / Sua agenda, não."; a demo é a mensagem do paciente (`[oi,] [tudo_bem?] [queria] marcar>Limpeza [uma] limpeza…>marcada: [terça…] [não,] quarta>quarta, de_manhã>9h`) que vira "Limpeza marcada: quarta, 9h."; usos: Agenda, Lembrete, E-mail; slogan "Mensagem solta. Horário certo."; sem tecla, sem contador.
- **Curso online de escrita**: gancho "Você sabe o que quer dizer. / O texto é que não sai."; a demo é o rascunho do aluno virando uma frase de venda; usos: Post, E-mail, Anúncio, Roteiro; variações: Post, E-mail, Anúncio, Roteiro, Bio; tecla "Revisar".
- **App financeiro para MEI**: gancho "O extrato não explica nada. / O Kontro explica."; a demo é uma linha crua do extrato (`[PIX_REC] [***4821] 850,00>R$_850,00 [12/03] studio>· aurora>Estúdio_Aurora +· +Receita`) virando um lançamento com categoria; só as cenas obrigatórias, para um filme de ~20 s.

**Regras ao trocar**
- Não mude os movimentos, as curvas, os tempos nem o código das cenas, a menos que a pessoa peça: o acabamento do filme está neles. Tudo se adapta pelo config.
- Use o vocabulário do produto da pessoa em todo texto de interface (o nome da tela, do campo, do botão), no idioma do filme.
- Dados que a pessoa não deu (números de resultado, preços, clientes reais, "mais de 100 idiomas") não se inventam como fato: pergunte, ou use exemplos claramente de demonstração (nomes inventados, valores redondos).
- Nada de cidade, estado ou ponto turístico nos textos (variações de cidades também não).
- No fim, liste o que ainda é da demonstração.

## Arquivos

| O quê | Onde |
|---|---|
| Configs dos filmes | `filmes/` (`demo.json`) |
| Mídia | `midia/<filme>/` |
| Cenas | `engine/src/shots/` (`gancho.js`, `giro.js`, `demo.js`, `marca.js`, `usos.js`, `slogan.js`, `variacoes.js`, `fecho.js`); o comentário no topo de cada uma lista os campos |
| Núcleo | `engine/src/timeline.js` (linha do tempo), `marca.js` (símbolo), `icon3d.js` (ícone 3D), `core.js` (cores e curvas), `type.js` (texto), `main.js` |
| Trilha, efeitos, falas | `audio/trilha/`, `audio/sfx/`, `audio/voz/<filme>/`; a mixagem em `tools/som.py` |
| Saída | `out/<filme>/` |
