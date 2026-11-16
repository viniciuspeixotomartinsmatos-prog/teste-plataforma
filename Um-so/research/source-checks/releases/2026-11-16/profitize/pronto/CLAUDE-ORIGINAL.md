# Guia do projeto — Pronto

Filme de lançamento de um produto digital (app, SaaS, plataforma, serviço com IA), 1920×1080, 30 fps, de 33 a 65 s, desenhado em HTML e renderizado quadro a quadro pelo Chromium headless, com trilha e efeitos sonoros. A história: um cursor de texto pisca no papel; o problema é digitado e o jeito antigo dá trabalho (a busca, a cascata de itens, as janelas que se multiplicam); tudo congela, a pergunta da virada é digitada no silêncio e, no drop da música, o cursor vira a marca; a marca vira a barra do produto, o pedido é digitado e o mouse clica em enviar; no escuro, o produto trabalha (as palavras-chave viram chips, as fontes voam, um contador sobe); o resultado se monta em cartões e um controle é arrastado; o produto acompanha e avisa no celular, o dedo toca em confirmar; uma lista vira check; uma montagem de outros usos no tempo da música; a frase final e a marca no acorde final.

A demonstração (`filmes/demo.json`) é o lançamento do **pronto**, uma busca com IA fictícia, com um roteiro de viagem. É o filme de referência (`arquivos/referencia.mp4`).

O filme é um **molde**: o movimento, a câmera, o tempo e o som de cada cena são fixos e medidos; o conteúdo (marca, cores, fonte, textos, números, ícones, fotos) vem do config. A interface do produto é desenhada em código com o acabamento da demo, nas cores e com os textos da marca. Ela não é a tela real do app da pessoa: se a pessoa tiver fotos ou prints, eles entram como mídia (o anexo do pedido, as fotos dos cartões, a montagem).

## Como funciona

1. **O config** (`filmes/<nome>.json`) diz a marca, as cores, a fonte, quais cenas entram e o conteúdo de cada uma.
2. **Os blocos.** O roteiro completo tem 10 blocos, sempre nesta ordem, cada um com a duração fixa (as fronteiras caem nos tempos fortes da música, a 120 BPM):

   | Bloco (`tipo`) | Duração | Obrigatório | A jogada |
   |---|---|---|---|
   | `abertura` | 5 s | sim | o cursor pisca três vezes e, no tempo forte, acende e troca de cor a cada batida |
   | `problema` | 6 s | não | a frase do problema digitada; a busca no jeito antigo; a cascata de itens; a escada de janelas com o contador |
   | `virada` | 6 s | sim | a pergunta no silêncio; no drop, o cursor vira a marca; o slogan |
   | `pedido` | 6 s | sim | a marca vira a barra; a mídia anexada entra; o pedido é digitado com a câmera seguindo; o mouse clica em enviar |
   | `trabalhando` | 6 s | não | no escuro: palavras-chave → chips, contador, as fontes voando, o anel de pontos e o túnel de luz |
   | `resultado` | 8 s | sim | o balão da resposta, o quadro com cartões, medidor e destaques, duas palavras gigantes, o controle arrastado |
   | `acompanha` | 6 s | não | "fica de olho": a linha que se desenha e muda no fim, o celular com a notificação, o toque em confirmar |
   | `acao` | 6 s | não | a lista do que o produto faz, cada linha vira check; duas palavras que caem dentro do check |
   | `montagem` | 8 s | não | outros usos em cortes no tempo da música, com quatro palavras na pílula de vidro |
   | `fecho` | 8 s | sim | a frase final digitada e apagada; a palavra que vira a marca no acorde final; slogan e chamada |

   O filme mais curto (só os obrigatórios) tem 33 s; com o problema, 39 s; o completo, 65 s. Para um filme de 30 a 45 s, escolha uma ou duas opcionais. Tirar um bloco não estica os outros: as cenas vizinhas cortam seco no tempo forte. `node tools/render.mjs <filme> linha` mostra onde cada bloco cai.
3. **O motor** (`engine/`) desenha cada quadro como função pura do tempo: renderizar um quadro sozinho dá o mesmo resultado que chegar nele em sequência, em qualquer ordem ou número de abas.
4. **O cursor do mouse e o dedo** miram o alvo medido no próprio quadro (o centro do botão de enviar, o botão do controle, o botão de confirmar da notificação), com a câmera e o 3D por cima. Com qualquer texto, cor ou tamanho, eles chegam em cima do botão certo. Nunca troque isso por coordenadas fixas.
5. **O som**: a trilha (`audio/trilha/your-call.mp3`) é cortada por bloco: abafada na abertura, a quebra do baixo no problema, o drop no logo, contínua daí em diante e abafada no escuro, acorde final sintetizado. Os efeitos (teclas, cliques, whooshes, pops, checks, a notificação) são sintetizados em código e nascem dos mesmos instantes da imagem. Mixagem em -14 LUFS.

## Comandos

Tudo da raiz do projeto. Precisa de Node 18+ e Python 3. O ffmpeg vem pelo `npm install` (se o npm avisar que pulou scripts de instalação, tudo bem: as ferramentas dão a permissão de execução ao ffmpeg sozinhas).

```bash
npm install
npx playwright install chromium
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt     # Windows: .venv\Scripts\pip
```

| Comando | O que faz |
|---|---|
| `node tools/render.mjs <filme> linha` | os blocos e onde cada um cai (segundos e quadros) |
| `node tools/render.mjs <filme> folha` | folha de contato, um quadro a cada 0,5 s → `out/<filme>/folha.jpg` (`--passo 30` = um por segundo) |
| `node tools/render.mjs <filme> quadros 630-690:3` | quadros em 1920×1080 → `out/<filme>/quadros/` (o texto pequeno se julga aqui, não na folha) |
| `node tools/render.mjs demo compara arquivos/referencia.mp4` | a demo ao lado da referência, nos mesmos quadros → `out/demo/compara.jpg` |
| `node tools/filme.mjs <filme>` | o filme final com som → `out/<filme>/<filme>.mp4` (5 a 15 min, conforme a máquina) |
| `node tools/filme.mjs <filme> --sem-musica` | só os efeitos, para usar uma música do Instagram/TikTok ao postar |
| `node tools/filme.mjs <filme> --abas 2` | menos abas paralelas (máquina fraca) |

Depois de mudar o config, os quadros já renderizados ficam velhos: rode o filme com `--refaz`.

## O config

Parta de `filmes/demo.json` (o roteiro completo) ou de `filmes/exemplo-clinica.json` (um filme curto, de 39 s, com o símbolo de uma marca, sem foto). Copie para `filmes/<nome>.json` e troque tudo. Só as cenas listadas em `cenas` entram no filme (os obrigatórios entram sempre). Textos são explícitos: nada é gerado ou traduzido pelo código.

### A marca, as cores e a fonte

| Campo | O quê |
|---|---|
| `nome` | o mesmo nome do arquivo |
| `idioma` | `"pt-BR"` (formata os números); os textos são os do config |
| `marca.nome` | o nome da marca (no par símbolo + nome e na notificação). Até ~14 caracteres no corpo cheio; mais longo, encolhe |
| `marca.simbolo` | o símbolo, SVG (o melhor) ou PNG sem fundo, nas cores dele. **Abra o SVG antes:** um `<rect>` de fundo do tamanho do desenho vira um quadrado; apague. Proporção de quadrada a 2:1 |
| `marca.logotipo` | opcional: SVG do nome escrito (o logotipo), no lugar do nome em texto. `marca.logotipoAltura` = a altura dele em relação ao símbolo (padrão 0,62) |
| `marca.corNome` | opcional: a cor do nome em texto (padrão: `cores.tinta`) |
| `marca.logo` | só a demo usa `"monolinha"` (o "p" do pronto desenhado à mão). Qualquer outra marca: não ponha o campo |
| `cores.papel` | o fundo claro do filme (o "papel"). **Tem de ser claro**: o filme é claro, com o mundo escuro só no "trabalhando" |
| `cores.tinta` | o texto (escuro) |
| `cores.gradiente` | 2 a 4 cores da marca, na ordem: o cursor acende nelas, o anel, as bordas de IA, os brilhos, os gráficos. Cores vivas |
| `cores.acao` | a cor dos botões, do selo, dos checks (a mais forte da marca; branco tem de ler bem em cima dela) |
| `cores.link`, `cores.noite` | opcionais: o azul dos itens do jeito antigo (padrão `#1A3FD1`) e o fundo do mundo escuro (padrão `#07070C`) |
| `fonte` | opcional: `{ "familia": "Manrope", "arquivos": [{ "arquivo": "midia/<nome>/manrope-400.woff2", "peso": "400" }, { …"peso": "500 600" }, { …"peso": "700" }] }`, ou um arquivo variável com `"peso": "100 900"`. Fonte gratuita para uso comercial (Google Fonts, Fontshare). Para baixar uma do Google Fonts: numa pasta temporária, `npm pack @fontsource/<nome>`, `tar xzf` no `.tgz` e copie `files/<nome>-latin-400-normal.woff2` (e 500, 700) para `midia/<nome>/`. Sem `fonte`: DM Sans |

### Os blocos

Todos os textos encolhem até caber e a digitação acelera para terminar no tempo do bloco, mas os limites abaixo são os que ficam bonitos (testados). Fora deles o texto fica pequeno ou a digitação corre demais. Ícones: ver Ícones.

**`problema`** (opcional)

| Campo | O quê | Limite |
|---|---|---|
| `frase` | o problema, digitado no centro ("Pesquisar dá trabalho.") | até ~28 caracteres |
| `busca.placeholder`, `busca.texto` | a caixa do jeito antigo: o placeholder e o que é digitado nela | texto até ~40 |
| `busca.icone` | opcional; padrão a lupa | |
| `itens` | `[{ "titulo", "fonte" }]`: a cascata (resultados, mensagens, tarefas, planilhas…) e os títulos das janelas | 6 a 14 itens; título até ~48, fonte até ~24 |
| `contador` | `{ "de": 3, "ate": 37, "rotulo": "abas abertas", "icone": "abas" }`: o selo que conta | rótulo até ~30 |

**`virada`** (obrigatório)

| Campo | O quê | Limite |
|---|---|---|
| `pergunta` | a virada, digitada no silêncio ("E se a busca resolvesse?"). As letras são sugadas para o cursor no drop | até ~32 |
| `slogan` | sob a marca ("A busca com IA que resolve.") | até ~60 |

**`pedido`** (obrigatório)

| Campo | O quê | Limite |
|---|---|---|
| `placeholder` | o texto da barra vazia | até ~30 |
| `texto` | o pedido: uma frase (quebrada sozinha) ou uma lista de linhas | com anexo: 2 linhas (~45 caracteres cada); sem anexo: 3 linhas; até ~100 no total |
| `anexo` | opcional: uma foto (`midia/<nome>/x.jpg`, quadrada ou paisagem) que entra voando antes do texto. `anexoFoco` = o `background-position` do recorte | |
| `destaques` | trechos exatos do `texto` que acendem no escuro (um por cor do gradiente) | 3 a 5 |
| `iconeEnviar` | opcional; padrão a seta | |

**`trabalhando`** (opcional)

| Campo | O quê | Limite |
|---|---|---|
| `chips` | `[{ "texto", "icone" }]`: o que o produto entendeu do pedido | 3 a 5, até ~24 cada (a fileira encolhe para caber) |
| `contador` | `{ "antes": "lendo", "ate": 312, "depois": "fontes" }` | |
| `fontes` | `[["origem", "o dado"], …]`: as telas que voam | 6 a 18; dado até ~40 |

**`resultado`** (obrigatório)

| Campo | O quê | Limite |
|---|---|---|
| `balao` | `{ "forte": "Pronto.", "texto": "Montei seu roteiro de 4 dias." }` | até ~60 no total |
| `titulo`, `subtitulo` | o cabeçalho do quadro | título até ~24, subtítulo até ~44 |
| `medidor` | opcional: `{ "rotulo", "valor", "depois", "total", "formato" }`; a barra enche até `valor/total` e vai a `depois` quando o controle é arrastado. `formato`: `"brl"`, `"numero"` ou `{ "formato": "numero", "sufixo": "h" }` | |
| `controle` | opcional: `{ "rotulo", "opcoes": ["a", "b", "c"], "alvo": 1 }`: o controle que o mouse arrasta da primeira opção até `alvo` | 2 a 4 opções, curtas |
| `cartoes` | `[{ "foto", "etiqueta", "titulo", "linhas": [["hora", "texto", "selo"], …], "extra": ["hora", "texto"] }]`. A `extra` entra quando o controle é arrastado. Sem `foto`, um degradê nas cores da marca. Hora e selo são opcionais (`""`) | 3 ou 4 cartões; 3 linhas; texto até ~26; título até ~20 |
| `destaque` | `{ "icone", "titulo", "texto", "rotulo", "valor", "etiquetas": [] }`: o cartão de baixo que descola e vem para a câmera no fim | etiquetas até 3 |
| `lateral` | opcional: `{ "foto" ou "icone", "titulo", "texto", "nota", "notaTexto", "valor" }`. Sem ele, o destaque ocupa a largura toda | |
| `palavras` | duas palavras gigantes em 3D ("Zero abas.", "Um plano.") | até ~14 cada |

**`acompanha`** (opcional; vem logo depois do resultado)

| Campo | O quê | Limite |
|---|---|---|
| `titulo` | digitado em cima ("E fica de olho.") | até ~24 |
| `item` | `{ "icone", "titulo", "texto", "selo" }`: o que está sendo acompanhado | |
| `rotulo`, `formato`, `valorInicial` | o número grande e o rótulo dele; `valorInicial` (padrão: o primeiro da série) conta até o último | |
| `serie`, `rotulos` | os pontos da linha (a mudança é o último ponto: cai ou sobe) e os rótulos embaixo | 5 a 10 pontos |
| `faixa` | opcional: `[min, max]` do eixo; sem ele, calculado | |
| `meta` | opcional: `{ "valor", "rotulo" }`, a linha tracejada | |
| `variacao` | o selo da mudança ("−R$ 418", "+3 agora") | |
| `celular` | `{ "data", "hora", "app", "quando", "titulo", "texto", "sim", "nao" }`: a notificação; o dedo toca em `sim` | título até ~50, texto até ~80, botões até ~12 |

**`acao`** (opcional)

| Campo | O quê | Limite |
|---|---|---|
| `titulo`, `feito` | "Reservando tudo…" vira "Tudo reservado" | até ~28 |
| `itens` | `[{ "titulo", "texto", "valor", "icone" }]`, cada linha vira check | 3 a 5; título até ~30 |
| `total` | opcional: `{ "rotulo", "destaque", "valor", "formato" }` | |
| `palavras` | duas palavras que caem dentro do check ("Tudo", "reservado.") | juntas até ~20 |

**`montagem`** (opcional)

| Campo | O quê | Limite |
|---|---|---|
| `palavras` | quatro palavras no tempo da música ("Pergunte.", "Compare.", "Decida.", "Resolva.") | até ~12 cada |
| `rotulo`, `botao2` | o selo de cada cartão e o segundo botão | |
| `cartoes` | 4 a 8: `{ "pergunta", "titulo", "linhas": [["a", "b", true]], "botao" }` e o lado esquerdo: `"foto"` (quase quadrada), ou `"numero": { "grande", "texto" }`, ou `"barras": [[0.9, "a", "b", true], …]`, ou `"horarios": ["7h", "8h", "9h", "10h"]` com `"escolhido": 1`, ou só `"icone"` | pergunta até ~50; título até 2 linhas |

**`fecho`** (obrigatório)

| Campo | O quê | Limite |
|---|---|---|
| `frase` | a frase final, digitada e apagada ("É só perguntar.") | até ~22 |
| `palavra` | digitada depois; vira a marca no acorde final (em geral, o nome com ponto: "Pronto.") | até ~14 |
| `slogan` | sob a marca | até ~60 |
| `chamada` | opcional: a pílula de baixo ("Disponível hoje · iOS · Android · Web") | até ~60 |

## Ícones

Qualquer nome do pacote lucide em kebab-case (`calendar-check`, `shopping-bag`, `graduation-cap`, `stethoscope`…; a lista inteira está em `engine/js/lucide.js`, procure com `grep -o '"nome-aqui"' engine/js/lucide.js`), os desenhos próprios do filme (`aviao`, `cama`, `peixe`, `bonde`, `talheres`, `pino`, `calendario`, `pessoas`, `moeda`, `abas`, `lupa`, `seta-cima`) ou o caminho de uma imagem. Nome que não existe vira um círculo e aparece um aviso no log do render: corrija.

## Mídia

Tudo em `midia/<nome>/`, com o caminho a partir da raiz do projeto no config. Fotos em JPG de até ~1600 px: os cartões do resultado cortam em paisagem 2:1, a montagem em quase quadrado (700×660), o lateral em 200×176, o anexo em quadrado. Fotos de banco só com licença livre (Unsplash, Pexels, domínio público); prints e fotos do produto da pessoa são o melhor. A demo usa fotos de domínio público (`midia/demo/CREDITOS-FOTOS.md`).

## Qualidade (como conferir)

- Folha de contato depois de cada mudança; quadros em 1920×1080 nos pontos pequenos: os itens da cascata, os cartões do resultado, a notificação, a lista da ação, os cartões da montagem.
- Os três momentos do cursor, em quadros seguidos (6 a 10): o clique no enviar (fim do pedido), o arrasto do controle (fim do resultado), o toque em confirmar (fim do acompanha). A ponta tem de estar em cima do botão. `linha` diz onde cada bloco começa; os momentos caem, a partir do início do bloco, em 5,3–5,8 s (pedido), 6,0–7,0 s (resultado) e 4,9–5,6 s (acompanha).
- Nada cortado, nada vazando da caixa ou do quadro, nenhuma reticência no meio de um texto importante (encurte o texto), nenhuma sobra da demo: `grep -niE "lisboa|bonde|pronto|voo|alfama|sintra|R\$ 7" filmes/<nome>.json`.
- O log do render sem `ERROS` e sem aviso de ícone.
- O MP4: 1920×1080, 30 fps, som em -14 LUFS (a mixagem imprime o valor).

## Personalizar

Três perguntas antes de mexer: **o que o produto resolve** (o problema e a virada), **qual pedido mostra isso melhor** (o pedido e o resultado), **o que o produto faz sozinho depois** (acompanha, ação, montagem).

| O quê | Onde | Precisa de material novo? |
|---|---|---|
| Marca (nome, símbolo, logotipo) | `marca` | o símbolo em SVG ou PNG sem fundo |
| Cores | `cores` | não |
| Fonte | `fonte` + `midia/<nome>/` | o arquivo da fonte (gratuita) |
| Textos, números, ícones de cada cena | o objeto da cena em `cenas` | não |
| Quais cenas entram (duração) | a lista `cenas` | não |
| Foto do anexo, dos cartões, da montagem | `anexo`, `cartoes[].foto`, `lateral.foto`, `montagem.cartoes[].foto` | fotos (ou deixe sem: o filme usa degradês e ícones) |
| Trilha | `audio/trilha/` + `tools/trilha.py --drop <s>` | uma faixa de 120 BPM com licença; ou `--sem-musica` |
| Movimento, câmera, tempo das cenas | `engine/js/b-*.js` | não mexa: o acabamento está medido |

Regras ao trocar:
- **Nada inventado como fato.** Número, preço, nota, cliente, depoimento ou resultado que a pessoa não deu entra como exemplo explícito (no subtítulo: "valores de exemplo") ou é perguntado. Nunca no título como fato.
- O que a pessoa não deu e é só texto de cena (os itens da cascata, as fontes que voam) pode ser plausível do nicho, e você avisa que é provisório.
- A interface é desenhada pelo filme; o app de verdade da pessoa não aparece, a não ser pelas fotos/prints que ela der (anexo, cartões, montagem). Diga isso a ela.
- No fim, liste o que ainda é da demo (fotos, textos) e o que ficou de fora do roteiro.
- Não edite o código das cenas para encaixar um texto: encurte o texto.
