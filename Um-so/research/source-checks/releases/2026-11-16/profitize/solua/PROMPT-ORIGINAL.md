# Solua: lançamento imobiliário à beira-mar, com a página nascendo de dentro de um círculo e os títulos entrando letra a letra

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o site do meu empreendimento** (ou da minha incorporadora) com esta estrutura e este movimento.
   - **Usar só algumas peças** (a abertura em círculo, o hero com dia e noite, o título correndo pela borda do semicírculo, o trilho lateral com o mapa, as comodidades em abas, as duas janelas da arquitetura, o fecho que se recolhe no rodapé, o agendamento de visita) num site que já tenho.
2. Se for o empreendimento dela: o nome, o que é (casas, apartamentos, lotes), quantas unidades, os tipos (nome, quartos, área), as comodidades, as referências do entorno e a quantos minutos ficam, a incorporadora e o escritório de arquitetura, a previsão de entrega, o número do registro de incorporação e o CRECI, os contatos e **que material já tem** (as perspectivas oficiais do empreendimento, fotos do decorado, logo). Avise desde já:
   - o hero precisa de uma imagem quase quadrada (10:9) com **céu limpo nos 45% de cima** (o nome fica ali) e, para as abas "de dia / de noite", **a mesma vista à noite**, no mesmo enquadramento; sem a noturna, as abas saem;
   - as outras imagens são da demo; com as dela, ficam iguais nos formatos que o guia lista, e `arquivos/receitas/LEIA.md` tem os prompts para gerar o que faltar;
   - anúncio de lançamento precisa do número do registro de incorporação (e o CRECI de quem vende) no rodapé: sem eles, o site não deve ir ao ar.
3. Se forem peças: quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa a landing page do **Solua Residencial** (marca fictícia), um condomínio fechado de 24 residências à beira-mar, entre a praia e a mata atlântica, com jardim tropical, piscina e solário nas coberturas. Leia antes o guia do projeto desta pasta (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes: arquitetura, design system, regras de movimento e do celular, como conferir e como personalizar) e olhe as imagens em `arquivos/conceito/`: são prints do site pronto, o alvo de cada momento, em `-desktop` e `-mobile` (`01-abertura-nome`, `02-abertura-circulo`, `03-hero`, `04-hero-noite`, `05-razoes-arco`, `06-razoes-slider`, `07-citacao`, `08-trilho-conceito`, `09-trilho-litoral`, `10-trilho-mapa`, `11-litoral`, `12-tipos`, `13-residencias`, `14-comodidades`, `15-interiores`, `16-arquitetura-janelas` (só no computador), `17-arquitetura`, `18-sanfona`, `19-fecho`, `20-visita`).

**Tudo o que o site usa já vem pronto em `arquivos/`:** o `index.html`, o `vite.config.js` (com o plugin que monta as seções), o código inteiro em `arquivos/src/` (seções em HTML, as folhas de estilo e os 25 módulos de movimento) e as imagens em `arquivos/public/`. Use tudo isso como está: não gere imagem nova, não reescreva os módulos e não troque nada por uma versão "mais simples". O trabalho é montar o projeto, instalar as dependências com as versões certas, copiar os arquivos para o lugar e conferir.

A ideia da página: **um lançamento imobiliário com movimento de revista.** O que impressiona é o acabamento do movimento, e ele é o produto: os tempos, as curvas e a ordem de cada entrada estão medidos e não se mexem.
- A página **nasce de dentro de um círculo, o sol**: enquanto tudo baixa, o nome aparece entre "Sol" e "Lua" e uma linha vertical enche com o carregamento de verdade; cheia, um furo redondo com a foto do hero sobe do pé da tela e mergulha para cima até cobrir tudo, e o hero aparece já no lugar.
- **Cada título entra letra a letra, de perfil**, virando de frente enquanto sobe; o "Beira-mar" em letra cursiva chega deitado, da direita; os parágrafos sobem linha a linha de dentro da máscara.
- Embaixo, cenas presas à rolagem: o hero que cresce pela beira da piscina, o título que corre pela borda de um semicírculo, um trilho lateral com o mapa do litoral, as comodidades em abas, duas janelas recortadas no linho que se fundem e crescem até a foto tomar a tela, e o convite final que se recolhe numa moldura enquanto o rodapé sobe.

Nível de acabamento: site de premiação. Verde da mata, areia e linho; nada de "exclusivo" e "sofisticado" nos textos.

---

## Parte 1 — O site

### Marca e tom
- Marca **Solua** (fictícia), de sol + lua, em português do Brasil. O símbolo é o sol inteiro sobre a linha do mar com a lua desenhada embaixo (`#simbolo` em `src/sections/topo.html`; `public/marca.svg`).
- Tom calmo, de revista, frases curtas; a frase da casa é "Dias de sol, noites de lua". Nenhuma cidade ou estado: só "litoral".
- Cores em papéis (`src/styles/tokens.css`), nunca pelo nome: `--escuro` `#13261c` (verde da mata: abertura e rodapé), `--secao` `#e8dcc6` (areia), `--claro` `#f6f2ea` (linho), `--tinta` `#172a20`, `--acento` `#c4552d`. `?tema=mar`, `?tema=terra` e `?tema=noite` trocam a paleta inteira.
- Tipos (livres para uso comercial, pelo Fontsource): **Imbue** (didone condensada) nos títulos em caixa alta; **Imperial Script** no "Beira-mar" e nas palavras cursivas; **Archivo** expandida nos rótulos e nos botões, em caixa alta espaçada, e no corpo de texto.

### O motion da casa (os números)
- Três durações (0,45 / 0,85 / 1,3 s), escalonamento de 0,09 s e atraso de entrada de 0,25 s; as curvas da casa (`s-io`, `s-out`, `s-in`, `s-ease`, `s-mergulho`, `s-lateral`, `s-carga`), todas em `src/motion/ease.js`.
- Seis entradas de texto e bloco (`src/motion/texto.js`), cada uma com a saída e o estado inicial: `h` (títulos: letra de perfil subindo), `a` (cursiva: letra deitada chegando da direita), `p` (linhas saindo da máscara), `ctn` (blocos subindo), `linha` (fios descendo) e `slide` (fotos entrando pela diagonal). Entrada longa (1,3 s), saída curta (0,45 s).
- As entradas acontecem por marco (quando a peça cruza o pé da tela) e por tempo, nunca escorregando com a rolagem: rolar rápido nunca deixa meia palavra.

### 01 — Abertura (o pré-carregamento)
- Primeira visita da sessão: o nome "Solua Residencial / Beira-mar" entre "Sol" e "Lua"; a moldura com cantos recortados e a foto do hero apagada acendem; a **linha vertical enche com o download real** de todas as fotos e fontes (nunca mais rápido que 2,4 s). Tudo baixado: o sol nasce (o furo redondo sobe do pé, com dois anéis de eco) e mergulha (2,5 s), a foto do hero desinfla de 0,78 para 1.
- Na volta (recarregar na mesma sessão), só o círculo. **Ela não reage a rolagem nem a gesto: é um carregamento.** `?pronto` abre direto no hero; `?longa` e `?curta` forçam cada versão.

### 02 — Topo fixo
- Selo redondo com o nome girando (30°/s, acelera com a rolagem, leva ao topo); "Escolher uma residência" à direita; "Agendar visita" e "Contato"; a barra de rolagem própria com o contador 00 → 100 e o pegador que arrasta; "Role" com seta. As peças trocam de cor pela seção que passa atrás delas. No celular: selo e "Menu" embaixo.

### 03 — Hero ("Solua Residencial / Beira-mar")
- A foto 10:9 presa enquanto o texto sobe mais rápido; depois a foto cresce até 1,9x pela beira da piscina, e o semicírculo da seção seguinte sobe por cima. "Sol na varanda" à esquerda, "Lua na piscina" à direita, as abas **de dia / de noite** no meio (a foto da noite entra em 0,8 s e um fio em degradê desliza até a aba).
- Três pinos pulsando na foto ("Pedra que dura", "Luz e brisa", "Um jardim por casa"): no hover, o cartão abre ao lado do cursor e o segue. Botão redondo "Ver residências disponíveis", magnético.

### 04 — Três razões
- Um semicírculo de areia sobe com "Três razões para escolher a Solua" correndo pela borda: as palavras se afastam pela curva enquanto ele atravessa a tela. Embaixo, um slider com "Pé na areia", "Feito para durar" e "Só 24 casas", que troca sozinho a cada 6,5 s com a barra enchendo, setas e a foto entrando pela diagonal.

### 05 — Citação
- Foto da casa no fim de tarde, com a frase da equipe de arquitetura no pé.

### 06 — Trilho lateral (só no computador; no celular, empilhado)
- Preso à rolagem, uma faixa anda para a esquerda com três painéis: **o conceito** (cresce de 0,8 e acende), **"Entre mar e mata"** (as três linhas do título deslizam em sentidos opostos) e **o mapa do litoral**, um traço que se desenha da esquerda para a direita com as distâncias (praia 2 min, trilha 5, marina 10, centro 15, golfe 20, aeroporto 40). No celular, o mapa se arrasta de lado ("Arraste para ver mais").

### 07 — Litoral
- A foto aérea assenta de 1,12 para 1 enquanto a seção entra, com nuvens recortadas correndo por cima sem parar.

### 08 — As residências
- Slider dos três tipos (Térreo + pátio, Garden, Cobertura duplex) com quartos, área, texto e botão; depois o bloco "Residências de 104 a 244 m²…".

### 09 — Comodidades
- Cena presa: cinco abas (Condomínio fechado, Piscina, Espaço gourmet, Spa e academia, Paisagismo) trocam a foto pela diagonal e os textos; rolando, a foto cresce até 1,9x e o conteúdo apaga enquanto a seção seguinte sobe por cima, em arco.

### 10 — Interiores ("Sol dentro de casa")
- Seção em arco com o título grande, a foto do terraço, os opcionais de cada casa e uma galeria em slider.

### 11 — Arquitetura (só no computador; no celular, a foto com o texto)
- Duas janelas recortadas no linho, em alturas diferentes, sobem, se alinham e se fundem numa só; a moldura cresce 1,9x até sumir pelas bordas, as flores abrem para os lados e a foto desinfla de 0,8 para 1. "Arquitetura" entra ocupando a largura, depois a frase, o autor e o botão "Agendar uma visita".

### 12 — Sobre o empreendimento
- Sanfona com Incorporadora, Vendas, Projeto aprovado e Entrega 2028: um item aberto por vez, o + gira até virar ×, os outros apagam no hover.

### 13 — Fecho e rodapé
- A foto do convite ("Vista para o mar / De todas as coberturas", "Agendar uma visita") se recolhe numa moldura enquanto o rodapé verde cresce e acende: telefone, endereço, as linhas legais (registro de incorporação e CRECI, com números de exemplo) e "Voltar ao topo".

### 14 — Agendar visita e menu do celular
- O cartão do agendamento cai girando em perspectiva: nome, WhatsApp, e-mail e a residência de interesse num seletor próprio; rótulo que sobe no foco, erro por campo, "Enviando…" e "Recebido". Não envia nada (é uma demonstração). Esc fecha e o Tab fica preso dentro.
- O menu do celular abre num painel escuro, com os itens entrando no motion da casa.

### Rolagem, interações e acessibilidade
- No computador, rolagem suave (Lenis, 1,25 s por gesto, com teto de velocidade para um gesto forte não atravessar as cenas presas); 60 ms depois de parar, a página encaixa na seção que ocupa mais da metade da tela. No toque, a rolagem é a nativa do aparelho.
- Hovers (letras que rolam nos itens de menu, o link que vira de perfil, os arcos que fecham o círculo dos botões) descansam enquanto a página rola; no toque, o toque dá a mesma resposta. Foco por teclado visível em tudo o que é clicável.
- `prefers-reduced-motion`: sem abertura, sem rolagem suave, entradas secas.

---

## Parte 2 — Como construir (stack)

- **Vite sem framework**: HTML, CSS e JS puros. Crie o arquivo `package.json` escrevendo-o direto (não use `npm init` nem um template do `npm create`, que trazem campos e arquivos a mais), com `"type": "module"`, `"private": true` e os scripts `"dev": "vite"`, `"build": "vite build"` e `"preview": "vite preview"` (nome e versão à sua escolha), e instale com versão travada, escrito por extenso (`npm install`, não `npm i`), um comando por linha:
  - `npm install -E gsap@3.15.1 lenis@1.3.27 @fontsource-variable/imbue@5.3.0 @fontsource-variable/archivo@5.3.0 @fontsource/imperial-script@5.3.0`;
  - `npm install -E -D vite@8.3.8` (dependência de desenvolvimento).
- **Copie os arquivos** com `cp` (as pastas inteiras de uma vez, um comando por linha, sem encadear com `&&`: em sessões com permissões restritas, comando composto pede aprovação):

  | de | para |
  |---|---|
  | `arquivos/index.html` | a raiz |
  | `arquivos/vite.config.js` | a raiz (o plugin `secoes` troca cada `<!-- @secao nome -->` do `index.html` por `src/sections/nome.html`; `base: './'`: o `dist/` abre em qualquer pasta da hospedagem) |
  | `arquivos/src/` (a pasta inteira) | `src/` |
  | `arquivos/public/` (a pasta inteira) | `public/` |

  Os comandos, da raiz do projeto: `cp arquivos/index.html .`, `cp arquivos/vite.config.js .`, `cp -R arquivos/src src` e `cp -R arquivos/public public` (sem barra no fim do nome da pasta). Copie antes de existir uma pasta `src/` ou `public/` na raiz (senão o `cp -R` cria `src/src/`); se alguma já existir de uma tentativa anterior, apague-a antes de copiar. A pasta `arquivos/` continua onde está: não entra no site nem no `dist/`.

  Confira depois da cópia: `src/main.js`; `src/motion/` com 25 módulos (`abertura.js`, `ancoras.js`, `arquitetura.js`, `barra.js`, `comodidades.js`, `dicas.js`, `ease.js`, `encaixe.js`, `fecho.js`, `hero.js`, `interacoes.js`, `local.js`, `modal.js`, `paralaxe.js`, `precarga.js`, `razoes.js`, `revela.js`, `rolagem.js`, `rolando.js`, `sanfona.js`, `selo.js`, `slider.js`, `tema.js`, `texto.js`, `trilho.js`); `src/sections/` com 15 HTML (`abertura`, `topo`, `hero`, `razoes`, `citacao`, `trilho`, `local`, `tipos`, `comodidades`, `interiores`, `arquitetura`, `sanfona`, `fecho`, `modal`, `dicas`); `src/styles/` com 14 folhas (`site.css`, `tokens.css`, `base.css` e uma por seção); `public/marca.svg`; e `public/img/` com 50 imagens (as fotos em duas larguras, como `hero-dia-960.webp` e `hero-dia-1440.webp`, mais `nuvens.webp` e `flor-1.webp` a `flor-3.webp`).
- **CSS numa folha só, por `<link>`**: o `arquivos/index.html` já traz, no `<head>`, o script que escolhe o tema e a versão da abertura antes de qualquer arquivo, a cor de fundo, o "nada transiciona até assentar" inline, e depois `<link rel="stylesheet" href="/src/styles/site.css">` (as fontes, os tokens e as seções por `@import`). Mantenha assim e nunca importe CSS pelo JS: no dev do Vite ele chega depois dos módulos e a página aparece crua por um instante a cada recarregamento.
- **A abertura é um pré-carregamento de verdade** (`src/motion/precarga.js` e `abertura.js`): ela segura a página até as fotos e as fontes chegarem e a linha mostra esse progresso. Não faça a abertura pular com a rolagem nem tire o pré-carregamento: é ele que deixa a rolagem lisa depois.
- Leia o cabeçalho dos módulos antes de mexer em qualquer coisa: `src/main.js` liga o pré-carregamento, a rolagem, as cenas presas, as interações e, por último, a abertura, que solta as entradas de texto no momento do mergulho. O mapa de cada arquivo está no guia.
- `arquivos/conceito/` e `arquivos/receitas/` não entram no site; `arquivos/fonte/` só serve para converter imagens novas (ver o guia).
- No fim:
  - `npm run build` passa sem erro e sem aviso de arquivo faltando;
  - `npx vite preview` abre o site e a abertura roda inteira (nome entre "Sol" e "Lua", a linha enchendo, o círculo subindo e mergulhando, o hero no lugar com o título entrando letra a letra); recarregar mostra só o círculo; o console fica limpo e recarregar nunca mostra a página sem estilo; `?pronto` abre direto no hero e `?tema=mar` troca a paleta;
  - rolando devagar e depressa: o hero cresce pela piscina e o semicírculo sobe com o título correndo pela borda; o trilho anda de lado e o mapa se desenha; as nuvens correm sobre a aérea; nas comodidades, a foto cresce e a seção em arco sobe por cima; na arquitetura, as duas janelas se fundem e crescem até a foto tomar a tela, sem nenhuma faixa da cor de fundo aparecendo no topo; o convite se recolhe na moldura do rodapé; nenhum título fica pela metade;
  - com o mouse e o teclado: as abas de dia e de noite trocam a foto; passar o mouse num pino abre o cartão ao lado do cursor sem pulo; as setas dos sliders, as abas das comodidades e a sanfona respondem; "Agendar visita" abre o cartão, o formulário mostra os erros e chega a "Recebido"; Tab mostra o foco em tudo o que é clicável;
  - nada rola para o lado no celular (390 × 844, e também numa tela baixa, 393 × 659): o topo fica embaixo (selo e "Menu"), o trilho vira pilha, o mapa se arrasta de lado e os textos do pé das seções ficam acima da barra;
  - o `dist/` sobe em qualquer hospedagem estática, inclusive numa subpasta. Confira com um servidor estático de verdade, não com o `vite preview` (ele devolve o `index.html` para qualquer caminho e esconde arquivo faltando): crie uma pasta de teste ao lado da pasta do projeto (por exemplo `../teste-solua/`), copie o `dist/` para dentro dela com o nome `solua/` (`cp -R dist ../teste-solua/solua`), rode `python3 -m http.server 8765` dentro da pasta de teste (ou outra porta, se essa estiver ocupada), abra `http://localhost:8765/solua/` e confira o console sem nenhum 404, a abertura terminando e as fotos de todas as seções. Depois derrube o servidor e apague a pasta de teste;
  - as conferências de tela (abertura, rolagem, mouse e teclado, celular) pedem um navegador. Se você não tiver como ver a página, abra o site para a pessoa e confira com ela, item por item, em vez de dar por conferido.
