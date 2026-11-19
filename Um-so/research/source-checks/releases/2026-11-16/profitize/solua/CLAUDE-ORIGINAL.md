# Guia do projeto — Solua

(Salve como `CLAUDE.md` na raiz do projeto se você usa o Claude Code, ou como `AGENTS.md` se usa o Codex, o Cursor ou outro agente. O conteúdo é o mesmo.)

Landing page do Solua Residencial, um lançamento imobiliário fictício: condomínio fechado de 24 residências à beira-mar, entre a praia e a mata. Vite sem framework, GSAP (com ScrollTrigger e SplitText), Lenis, fontes Imbue, Imperial Script e Archivo. **A página nasce de dentro de um círculo (o sol) que sobe e mergulha, e cada título entra letra a letra; embaixo, cenas presas à rolagem contam o empreendimento.** O código já vem pronto em `arquivos/src/`, a página no `arquivos/index.html` e as imagens em `arquivos/public/`: o trabalho é montar, conferir e, depois, personalizar. A régua é site de premiação: o movimento é o produto, e os tempos, as curvas e a ordem das entradas estão medidos. Se algo parece "ok", ainda não está pronto.

## Arquitetura
- **Uma seção por arquivo.** O `index.html` só tem o `<head>` e a ordem das seções (`<!-- @secao hero -->` etc.); o plugin `secoes` do `vite.config.js` troca cada marca pelo `src/sections/<nome>.html` no dev e no build. Os textos e os dados (tipos, áreas, comodidades, distâncias, contatos) estão nesses HTML.
- **O CSS é uma folha só**, `src/styles/site.css` (por `@import`, nesta ordem: as três fontes, `tokens.css`, `base.css` e uma folha por seção), ligada por `<link>` no `<head>`. Antes dela, inline: o script que escolhe o tema e a versão da abertura, a cor de fundo e a trava `html:not(.assentou)` sem transição. Nunca importe CSS pelo JS: no dev do Vite ele chega depois dos módulos e a página pinta crua por um instante a cada recarregamento.
- **Módulos** (`src/motion/`; cada um explica o que faz no cabeçalho):

  | arquivo | o que faz |
  |---|---|
  | `src/main.js` | começa o pré-carregamento, mede a altura da tela, liga a rolagem, as cenas e as interações e, por último, a abertura, que solta as entradas de texto no mergulho |
  | `ease.js` | as durações (0,45 / 0,85 / 1,3 s), o escalonamento, o atraso e as curvas da casa. Todo movimento sai daqui |
  | `texto.js`, `revela.js` | as seis entradas (`h`, `a`, `p`, `ctn`, `linha`, `slide`) com saída e estado inicial; `cabe`, que encolhe o título que não quebra sozinho quando o texto não cabe; a entrada por marco das peças com `data-revela` |
  | `precarga.js`, `abertura.js` | o pré-carregamento (todas as fotos e fontes, decodificadas depois no tempo livre) e a abertura: o nome, a linha de carga e o círculo que sobe e mergulha |
  | `rolagem.js`, `rolando.js`, `encaixe.js`, `ancoras.js` | o Lenis (duração 1,25 s, teto de velocidade `TETO`, toque nativo); o hover que descansa enquanto rola; o encaixe na seção ao parar; os links de âncora |
  | `hero.js`, `dicas.js` | o hero preso (texto mais rápido, a foto crescendo pela piscina), as abas de dia e de noite, o pulso dos pinos; os cartões dos pinos que seguem o cursor (no celular, uma folha que sobe) |
  | `razoes.js`, `slider.js` | o título correndo pela borda do semicírculo; o slider da casa (razões, tipos e galeria: troca a cada 6,5 s, setas, foto pela diagonal) |
  | `trilho.js`, `local.js`, `paralaxe.js` | o trilho lateral (conceito, "Entre mar e mata", o mapa que se desenha); a aérea que assenta; a paralaxe das fotos e das flores |
  | `comodidades.js`, `arquitetura.js`, `sanfona.js`, `fecho.js` | as abas e a cena presa das comodidades; as duas janelas que se fundem e crescem; a sanfona; o convite que se recolhe no rodapé |
  | `selo.js`, `barra.js`, `tema.js` | o topo fixo: o selo que gira; a barra de rolagem com o contador; a troca de cor das peças fixas pela seção que passa atrás |
  | `interacoes.js`, `modal.js` | os hovers da casa (letras que rolam, link de perfil, círculo que fecha, botão magnético) e o toque; o agendamento de visita e o menu do celular |
- **Parâmetros de URL**: `?pronto` abre direto no hero (para trabalhar nas seções de baixo sem a abertura); `?longa` e `?curta` forçam cada versão da abertura; `?tema=mata|mar|terra|noite` troca a paleta.

## Design system
- **Cores em papéis**, nunca pelo nome (`tokens.css`): `--escuro` (abertura, rodapé, fundo das fotos), `--secao` (areia), `--claro` (linho), `--tinta` (texto), `--acento`, `--branco`. Quatro paletas: `mata` (padrão: `#13261c`, `#e8dcc6`, `#f6f2ea`, `#172a20`, `#c4552d`), `mar`, `terra` e `noite`; o mapa de temas do `<head>` do `index.html` repete só a cor de fundo de cada uma.
- **Superfícies**: cada seção diz a cor do texto e das linhas pela classe (`t-foto`, `t-escuro`, `t-claro`, `t-secao`) e marca o fundo com `data-fundo` (é por ele que o topo fixo troca de cor).
- **Tipos**: Imbue (títulos em caixa alta, `--display`), Imperial Script (`--script`, só nas palavras cursivas), Archivo expandida (`--sans`: rótulos e botões em caixa alta espaçada, e o corpo). Os rótulos ficam em 12–13 px.
- **Escala**: `--u` é 1 px num quadro de 1600 de largura (acompanha a tela até 1600 e para; no celular, quadro de 416). Grade de 10 colunas (4 no celular), margem `--m` de 48u, vão `--g` de 16u. Os títulos grandes (o nome do hero, "Arquitetura") são a assinatura do site e ficam grandes de propósito; o resto segue título de seção ~64 px e corpo 16–18.

## Regras de movimento
- **Tudo sai de `ease.js` e `texto.js`.** Não invente curva nem duração nova: uma peça nova entra com uma das seis entradas e as três durações. É isso que dá ao site uma assinatura só.
- **Texto entra por marco e por tempo, nunca escorregando com a rolagem.** O que acompanha a rolagem (scrub) são as cenas: o hero, o semicírculo, o trilho, as comodidades, a arquitetura e o fecho. Rolar rápido nunca deixa meia palavra.
- **A abertura é um carregamento.** Ela não reage a rolagem nem a gesto, a página fica travada até ela terminar, e a linha mostra o download real (nunca mais rápido que 2,4 s; se a rede travar, segue em 15 s). Na volta, só o círculo. Não ponha "pular com qualquer gesto" e não tire o `precarga.js`: é ele que deixa a rolagem lisa depois.
- **Rolagem**: Lenis em modo de duração (1,25 s, saída exponencial) com teto de 1,25 tela à frente (um gesto forte não atravessa as cenas presas de uma vez). Nada de parada que engole o gesto. O encaixe só age 60 ms depois de parar, só no computador.
- **Foto em tela presa nunca desce com a tela parada**: abriria uma faixa da cor do fundo no topo. A foto da arquitetura é 10% mais alta que a tela, sobe devagar enquanto a tela está presa e só fica para trás quando a tela sai. Gatilho de ScrollTrigger sempre na área (`.arq__area`, `.hero__area`...), nunca no elemento `sticky`.
- **Cartão que segue o cursor** (`dicas.js`): mede com `offsetWidth/offsetHeight` (a escala de entrada não entra na conta), não vira para cima (para a 16 px da borda e desliza) e só passa para a esquerda deslizando.
- **Primeira pintura**: o CSS chega por `<link>`, o fundo vem inline e o `main.js` só marca `assentou` depois de dois quadros. Sem isso, as peças com transição nascem visíveis e somem no primeiro quadro.
- `prefers-reduced-motion`: sem abertura, sem Lenis, entradas secas.

## Celular: regras que não se quebram
- **Nunca rolar para o lado**, em nenhum momento (abertura, menu aberto, entrada de letra). Se algo vazar, conserte a origem; `overflow-x: clip` no `html` e no `body` é só a rede de segurança (`clip`, não `hidden`, que quebra o `sticky`).
- **A altura da tela é fixa** (`--vh`, medida pelo JS, que ignora as mudanças de menos de 120 px da barra do Safari): o hero e as cenas não mudam de tamanho no meio da rolagem. Nada de `100vh` nem `dvh` nas seções.
- **No toque, a rolagem é a do aparelho**: o filtro do Lenis devolve `true` para o toque. Nunca cancele o `touchend` (mata o clique nos botões).
- Composição própria: topo embaixo (selo à esquerda, "Menu" à direita); hero com a foto em tela cheia, sem pinos; os semicírculos com um SVG próprio; o trilho vira pilha e o mapa se arrasta de lado; os tipos em pilha; as comodidades sem o botão redondo; a arquitetura sem as janelas (a foto com o texto); flores menores, só nas bordas e longe do texto. Os textos do pé das seções de foto ficam acima da barra de baixo (folga de 110 px + a área segura).
- Hover só com mouse (`html:not(.toque)`, e nunca enquanto rola); no toque, o toque dá a mesma resposta e desfaz sozinho. Alvos de toque de 44 px; campos com fonte de 16 px.
- Conferir em 390 × 844, 393 × 659 e 375 × 553.

## Como checar
- `npm run build` sem erro e sem aviso de arquivo faltando.
- `npx vite preview`, numa aba anônima (para ver a abertura longa): o nome entre "Sol" e "Lua", a linha enchendo, o círculo subindo e mergulhando, o hero no lugar com o título entrando letra a letra; recarregar mostra só o círculo e nunca a página crua; console limpo.
- `?pronto` e rolando de cima a baixo, devagar e depressa: cada cena faz o que o prompt descreve, nenhum título fica pela metade, nenhuma faixa da cor de fundo aparece em volta das fotos presas, o topo fixo troca de cor na passagem das seções.
- Mouse e teclado: abas de dia e de noite, os cartões dos pinos, as setas dos sliders, as abas das comodidades, a sanfona, o agendamento até "Recebido", Tab em tudo.
- Celular nos três tamanhos e o `dist/` numa subpasta, com um servidor estático de verdade (o prompt diz como): sem 404.

## Personalizar

Vale para qualquer mudança, agora ou depois.

### As três perguntas
1. É a demo, o empreendimento da pessoa, ou peças soltas?
2. Que material ela já tem (perspectivas oficiais, fotos do decorado, logo, os dados dos tipos e das comodidades, as referências do entorno com os minutos, o número do registro de incorporação e o CRECI) e o que falta?
3. O que ela quer manter da demo (a abertura em círculo, o hero com dia e noite, o trilho com o mapa, as comodidades, a arquitetura das janelas, o agendamento)?

### O que muda e onde

| o quê | onde | precisa de material novo? |
|---|---|---|
| Nome da marca | `hero.html` (o `h1` e o "Beira-mar"), `abertura.html` (o nome, "Sol" e "Lua" e a linha do pé), `topo.html` (o texto do selo, em volta do círculo, e o título do menu do celular), `razoes.html` (o título nos dois arcos e no `h2` escondido), `trilho.html`, `citacao.html`, `arquitetura.html`, `sanfona.html`, `fecho.html`, o `<title>` e a `description` do `index.html` | não. O nome vai em duas linhas com `<br>` (o título não quebra sozinho); se não couber, ele encolhe até caber (`cabe`, chamado no `main.js`), mas nome muito comprido fica pequeno: prefira o nome curto da marca e o resto na cursiva. O texto do selo tem `textLength` medido para a volta do círculo (mantenha ~30 letras ou ajuste). O título dos dois arcos tem que caber na curva: até ~35 letras, ou reduza o `data-espaco` |
| Símbolo | o `<symbol id="simbolo">` em `topo.html` e `public/marca.svg` | se for o logo da pessoa: o SVG dela, numa cor só |
| Pinos do hero | os três `.pino` em `hero.html` (a posição `--x`/`--y` sobre a foto e o `data-pino`) e os cartões em `dicas.html` (título e texto; o `data-dica` igual ao `data-pino`) | não. Com outra foto, ponha cada pino num ponto que existe nela (a fachada, a varanda, o jardim); sem pinos, apague a `<ul class="pinos">` e os cartões (o código não sente falta) |
| Tipos de residência | os slides de `tipos.html` (quartos, área, texto, botão) e o bloco de áreas logo abaixo; as opções do seletor em `modal.html` | as fotos dos tipos |
| Razões | os três slides de `razoes.html` | as fotos |
| Mapa e distâncias | a lista de pontos do mapa em `trilho.html` (nome, minutos e a posição `--x`/`--y` sobre o traço) e o texto do painel do litoral | não |
| Comodidades | as cinco abas e textos em `comodidades.html` | uma foto por aba |
| Interiores e galeria | `interiores.html` (os opcionais e os textos) e as quatro fotos da galeria | as fotos |
| Arquitetura e sobre o empreendimento | `arquitetura.html` (a frase e o escritório), `sanfona.html` (incorporadora, vendas, aprovação, entrega) | a foto da arquitetura |
| Contatos | `fecho.html` (telefone, endereço), os links do topo | não |
| Registro de incorporação e CRECI | as duas linhas legais do rodapé em `fecho.html` (a demo traz números de exemplo, só com zeros) | os números da pessoa; sem eles, `[preencher]` |
| Envio do agendamento | `src/motion/modal.js` (hoje só mostra "Recebido") | ligar ao WhatsApp ou ao e-mail da pessoa |
| Cores e fontes | `tokens.css` (os papéis e as quatro paletas), o mapa de temas no `<head>` do `index.html` e o `theme-color`; os `@import` das fontes em `site.css` e `--display`, `--script`, `--sans` | não |

### Peças do lugar (empreendimento fora da praia)

A demo é um condomínio de praia; estes pontos falam do lugar e mudam junto com ele:

| peça da demo | onde | no empreendimento da pessoa |
|---|---|---|
| "Beira-mar" (a cursiva sob o nome) | `hero.html`, `abertura.html` | uma ou duas palavras do lugar ("Jardins", "Alto da Serra"); curta, cabe na cursiva |
| "Sol" e "Lua" em volta do nome na abertura; "Sol na varanda" e "Lua na piscina" no hero | `abertura.html`, `hero.html` | duas palavras do conceito da marca dela, ou tire os lados |
| "Dias de sol, noites de lua" (a frase da casa) | `razoes.html`, `tipos.html`, `sanfona.html` | a frase da marca dela |
| "Entre mar e mata" | `trilho.html` (três linhas curtas) | as duas coisas que o lugar junta ("Entre o parque / e o / centro") |
| O mapa (praia, trilha, marina, centro, golfe, aeroporto) | os seis `.mapa__ponto` em `trilho.html` (o sétimo, `--casa`, é o próprio empreendimento) | as referências do entorno (metrô, parque, escola, shopping, hospital) com os minutos |
| A aérea com nuvens e os rótulos "Pé na areia · Mata atlântica · Litoral brasileiro" | `local.html` e a imagem `aerea` | a foto de drone do bairro e três rótulos dele; as nuvens servem para qualquer lugar |
| As flores de flamboyant | `public/img/flor-1` a `flor-3` | a árvore da região, ou ficam |

### Material da pessoa

Para cada imagem, do mais simples ao mais trabalhoso: (1) manter a da demo; (2) usar a perspectiva oficial ou a foto da pessoa no formato certo; (3) gerar com os prompts de `arquivos/receitas/` (o `LEIA.md` dá a ordem, o que vai com referência e os formatos). Para converter qualquer imagem nova: salve o PNG com o nome da receita em `arquivos/fonte/bruto/`, rode uma vez `npm install -D -E sharp@0.35.5` e depois `node arquivos/fonte/imagens.mjs <nomes>`: ele grava as duas larguras do WebP em `public/img/` com o nome que o HTML já usa.

- **Toda imagem nova passa pelo `imagens.mjs`.** Nunca solte um JPG ou PNG grande direto em `public/img/` nem aponte um `src` para um arquivo fora do padrão `<nome>-<largura>.webp`: a abertura espera todas as imagens baixarem, e um render de 4 MB deixa a abertura lenta para todo mundo, no celular principalmente. Imagem num lugar novo: copie uma `<img>` do mesmo tipo (com `srcset`, `sizes`, `width` e `height`) e troque só o nome.
- **Hero** (`hero-dia`, `hero-noite`): 10:9, a vista da piscina ou da fachada com **céu limpo nos 45% de cima** (o nome fica ali) e o assunto no meio; a noturna no mesmo enquadramento. Sem a noturna: apague o bloco `.hero__abas` e a `<img>` da noite em `hero.html` (o código não sente falta). Sem céu limpo: o nome perde o fundo calmo; escolha outra vista em vez de escurecer a foto.
- **Fotos de tela cheia** (`citacao`, `aerea`, `comod-1` a `comod-5`, `arquitetura`, `cta`): paisagem, no formato da tabela do `LEIA.md`, o assunto no meio (as cenas cortam as bordas conforme a tela).
- **Fotos de conteúdo** (`razoes-*`, `tipo-*`, `terraco`, `interior-1`, `galeria-*`): os formatos da tabela; todas na mesma luz deixam o site coerente.
- **Flores e nuvens**: as flores são galhos recortados (fundo branco → recorte); as nuvens são recortadas pela luz (fundo preto). Trocar a flor pela árvore da região é opcional; as nuvens servem para qualquer lugar.
- Imagem gerada mostra um empreendimento que não existe: num lançamento de verdade, use as perspectivas oficiais e marque "imagens meramente ilustrativas" (o rodapé já traz a linha).

### Regras ao trocar
- Nada de dado inventado como se fosse da pessoa: áreas, quartos, distâncias, telefone, endereço, prazo de entrega, número de unidades e o nome da incorporadora que ela não mandou ficam `[preencher]` (nunca no título do hero nem no selo).
- Mantenha o que dá o efeito: o nome no céu do hero, as entradas da casa em todo título novo, o pré-carregamento, as cenas presas com as áreas do mesmo tamanho (mudar a altura de uma área muda o tempo da cena inteira).
- O agendamento é uma demonstração: não envia nada. Para valer, ligue o "Quero agendar" ao WhatsApp (link `wa.me` com a mensagem montada) ou a um formulário de e-mail, e diga isso à pessoa.
- **Lançamento imobiliário**: o anúncio precisa trazer o número do registro de incorporação e o cartório (Lei 4.591/64, art. 32); quem vende costuma pôr o CRECI. Os dois ficam nas linhas legais do rodapé; sem os números, `[preencher]`, e diga à pessoa que o site não deve ir ao ar assim.
- Nada de cidade real na demo; no site da pessoa, use o endereço dela.
- Termine com a lista do que ainda é da demo: imagens, tipos e áreas, comodidades, distâncias e pontos do mapa, os textos de praia, os pinos, contatos, incorporadora, registro e CRECI.
