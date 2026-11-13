# Trami: landing page de SaaS com o produto nascendo de trás da floresta

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o site do meu produto** (um software, um app, uma plataforma ou um serviço digital) com esta estrutura e estas animações.
   - **Usar só algumas peças** (o hero com o painel subindo de trás das árvores, o painel do produto com o fluxo rodando sozinho, as integrações com os fios acendendo, os planos com mensal e anual, os depoimentos que trocam pelos rostos) num site que já tenho.
2. Se for o produto dela: o nome, o que ele faz numa frase, para quem é, os três passos de uso, as ferramentas com que ele se conecta, os planos e os preços, os depoimentos e os números de clientes reais, o contato e **que material já tem**: logo, prints da tela do produto, fotos e logos de clientes. Avise já aqui, com clareza, o que depende de material novo:
   - Textos, planos, preços, passos, integrações, depoimentos, números e contato mudam só com texto.
   - **O painel do hero é uma tela de exemplo feita em código** (um construtor de fluxos). Para mostrar o produto dela, há três caminhos (o guia, seção "Personalizar", explica cada um): manter o painel trocando só os textos do fluxo; pôr no lugar um print da tela do produto dela, mantendo a moldura, a copa e o movimento (o mais simples); ou redesenhar o painel em código com as telas dela (o mais trabalhoso).
   - **A paisagem do hero (céu, morros e copa) é uma foto gerada por IA e tratada por um script**: serve para qualquer marca. Trocar é opcional e pede uma imagem nova num gerador de imagem, com a receita que vem pronta, e o script de tratamento (Python).
   - **Os rostos dos depoimentos e dos colegas no painel são fotos geradas de pessoas que não existem.** Depoimento de verdade pede a foto de verdade do cliente, com a autorização dele.
3. Se forem peças: quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa a landing page da **Trami**, uma plataforma fictícia de automação de processos sem código para pequenas e médias empresas: monta fluxos (gatilho → regras → ações), conecta as ferramentas que a empresa já usa e mostra cada execução. Leia antes o guia do projeto desta pasta (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes: arquitetura, design system, regras de motion e de celular, como conferir e como personalizar) e olhe as imagens em `arquivos/conceito/`. São prints do site pronto, o alvo de cada seção depois da entrada, em `-desktop` (1456 × 840) e `-mobile` (390 de largura): `01-hero`, `02-por-que`, `03-como-funciona`, `04-integracoes`, `05-planos`, `06-clientes`, `07-fecho` e `08-rodape`.

**Tudo o que o site usa já vem pronto em `arquivos/site/`**: o `index.html`, o `vite.config.js` (com o plugin que monta a página a partir das seções), o `package.json` com as versões travadas e o `package-lock.json`, o código em `src/` (o HTML e o CSS de cada seção, os módulos de movimento, os tokens), as imagens em `public/` e, em `fonte/`, os scripts que tratam a paisagem e recortam os rostos, com os originais. Use tudo isso como está: não gere imagem nova, não reescreva os módulos, não troque versão de biblioteca e não "melhore" nada na montagem da demo. A demo tem de sair idêntica.

A ideia da página: **o produto nasce da paisagem.** A primeira tela é um céu de crepúsculo, do grafite ao rosa, sobre morros com névoa, e uma copa de árvores iluminada de rosa na frente. O painel da Trami fica entre os morros e a copa, que cobre a metade de baixo dele, e o fluxo dentro dele roda sozinho. Ao rolar, as três camadas andam em velocidades diferentes, e o painel sai de trás das árvores. O resto da página é preto, com cards grafite, pedaços de interface vivos, a folhagem entrando nas seções e o nome "Trami" gigante afundando na copa no fim.

Nível de acabamento: site de premiação. Cada texto entra uma vez, por marco, e termina no estado final mesmo com o scroll rápido. Nada fica preso na rolagem, e nada pisca.

---

## Parte 1 — O site

### Marca e tom
- Público: dono e gestor de pequena e média empresa, e o time de operações que repete à mão o mesmo processo (cadastro de cliente, cobrança, aprovação, admissão) em planilha e WhatsApp.
- Tom direto, calmo, sem jargão de TI: frases curtas com o resultado ("O cadastro de um cliente novo caiu de dois dias para nove minutos"), nada de "revolucione" nem "solução completa".
- Tokens (`src/styles/tokens.css`):
  - página `#050506`, card grafite `#151515`, fios em branco a 8% e 14%;
  - céu do hero `#10131c`, `#161a25`, `#1d202c`;
  - texto branco, cinza `#b9b8bd` e `#86858b`;
  - acento rosa da copa `#e9a7a0` (só em detalhes: hover dos botões, brilhos) e estrela `#f5b83d`;
  - interface do produto, clara: fundo `#f3f3f4`, cartão `#ffffff`, bordas `#e6e6e8` e `#d9d9dd`, tinta `#141416`, menu escuro `#0e0e10`; estados laranja `#e0782f` (passo selecionado), rosa `#e5484d` (parar), verde `#2f9e6b` (salvo, execução ok) e roxo `#6e56cf`.
- Tipos (Fontsource, livres): **Literata** variável, eixo ótico em 72, peso 300 e tracking −0,035em nos títulos; **Inter** variável no texto, nos botões e na interface (números tabulares na interface).
- Logo: um **T feito de fluxo** (um nó embaixo, o gatilho; a haste sobe e se divide em dois ramos com um nó em cada ponta, o "se / senão"), branco num círculo preto, ao lado de "Trami".

### 01 — Hero (alvo: `conceito/01-hero`)
- **Nav** fixa: o logo à esquerda; Produto · Casos de uso · Integrações · Preços · Conteúdos no centro; os botões "Entrar" (branco) e "Começar grátis" (grafite) à direita. Depois de rolar, ganha um vidro escuro com um fio embaixo; no fim da página, sobe para fora quando o rodapé encosta nela.
- O chip "Automação sem código para empresas →" (leva ao "Por que"), o título **"Toda a sua operação / no piloto automático"**, o subtítulo ("Monte fluxos sem código, conecte as ferramentas que a equipe já usa e acompanhe cada etapa em tempo real, com a IA apontando o que melhorar."), o botão branco "Conhecer a plataforma" e a nota "★ 4,9 em 1.200+ avaliações".
- **O painel da Trami**, entre os morros e a copa: o construtor do fluxo "Boas-vindas ao cliente" (menu lateral escuro, a barra com "Rascunho", "Salvo agora", os colegas, "Salvar rascunho" e "Publicar", o fluxo com gatilho, validação, "se / senão" e ações, o painel de propriedades à direita e "Últimas execuções" no pé). Desenhado em 1180 × 740 e reduzido como um print.
- **Ao carregar:** o céu e a copa já estão lá; o título sobe linha por linha, por máscara, e o chip, o texto e o botão sobem logo depois. O painel nasce de trás das árvores: começa 330 px abaixo, só a ponta aparece no vale, e sobe em 2,1 s, desacelerando. Então o fluxo **roda sozinho**: o gatilho pisca, uma luz anda pelo fio até "Validar", os campos ganham check um a um, o caminho "se válido" acende até a ação (alterna plano anual e mensal), o contador de execuções sobe, um aviso confirma e o cliente da vez entra em "Últimas execuções". A Bia (um cursor verde com nome) passeia e troca a etiqueta. Repete a cada ~8 s, só com o painel na tela.
- **No scroll:** o céu e os morros andam a 0,5 da página, a copa a 0,86, e o painel e o texto a 1,22. Relativo à copa, o painel sobe e sai quase inteiro de trás das árvores em ~650 px. O degradê do pé do hero é parado e garante o preto na emenda com a seção seguinte. Nada fica preso.
- No pé do hero, sobre a copa que escurece até o preto: "Mais de 3.000 empresas / rodam seus processos na Trami" e cinco logos inventados (Vettra, Norve, bravio, Amarra, kova).

### 02 — Por que (alvo: `conceito/02-por-que`)
- O chip branco com o símbolo, "Por que a Trami", e o título **"Automação não pode / ser uma caixa-preta"**.
- O card grafite largo: à esquerda, o "Fluxo de boas-vindas" ilustrado, com três colegas mexendo ao mesmo tempo (cursores com foto que andam, um bloco que se liga, o balão "pode publicar!"); à direita, o símbolo num ladrilho, "Feita para a equipe confiar", o parágrafo e o botão "Ver casos de uso"; o símbolo gigante apagado no fundo do card.
- Entra por marcos: o título por linha, o card sobe e as peças da ilustração em cascata.

### 03 — Como funciona (alvo: `conceito/03-como-funciona`)
- **"Três passos para tirar / o processo da planilha"**: três cards grafite em escada (o do meio mais baixo), cada um com um pedaço de interface vivo num painel claro:
  1. **Conecte as ferramentas**: três apps, os fios acendem até a Trami e a chave vira "Conectado".
  2. **Monte o fluxo arrastando**: a Lu arrasta um bloco até o encaixe e o fio novo se desenha.
  3. **Acompanhe cada execução**: "Refazer" é apertado, a execução que falhou fica verde e uma nova entra no topo.

### 04 — Integrações (alvo: `conceito/04-integracoes`)
- **"Conecta com tudo que / a sua empresa já usa"** e "Mais de 120 integrações prontas, API aberta e webhooks para o que faltar."
- Um card grafite largo com a Trami no centro e doze apps em volta (E-mail, Planilhas, Chat, Agenda, Pagamentos, Notas fiscais, Arquivos, Banco de dados, Avisos, CRM, Loja virtual, Relatórios), ligados por fios curvos. Um por vez acende em laranja, com a luz correndo pelo fio: um dado entrando na Trami, ou uma ação saindo e o app ganhando um check verde.
- A copa do hero, espelhada, sobe pelo pé do card escondendo a fileira de baixo, e folhas desfocadas em luz rosa cruzam o canto de cima.
- Hover num app: ele sobe 4 px com um anel rosado, o nome aparece embaixo e o fio dele acende.

### 05 — Planos (alvo: `conceito/05-planos`)
- **"Comece grátis. / Cresça no seu ritmo."** (a segunda linha em cinza) e a chave Mensal / Anual −20%: o fundo branco desliza e os preços trocam.
- Três cards: **Essencial** (R$ 0), **Equipe** (R$ 189 por mês, ou 151 no anual; o card claro com "Mais escolhido") e **Empresa** (sob consulta), cada um com o ícone num ladrilho, o botão de largura cheia e a lista do que inclui. Embaixo, "Preços em reais, sem fidelidade. No anual, cobrado uma vez por ano."

### 06 — Clientes (alvo: `conceito/06-clientes`)
- **"Quem automatiza / não volta à planilha"** e um card com a floresta vista de cima, escura à esquerda: o depoimento em serifa à esquerda, a pessoa com foto, nome e cargo, e três números em vidro à direita.
- Três rostos embaixo trocam o depoimento (clique, toque ou setas do teclado), e ele troca sozinho a cada 8 s com o card na tela; o mouse em cima do card pausa. Os três clientes (Ateliê Linho, Studio Raiz, Casa Nômade) são os mesmos que passam pela lista de execuções do painel do hero.

### 07 — Fecho e rodapé (alvo: `conceito/07-fecho` e `08-rodape`)
- **"Coloque um processo / no automático hoje"**, "14 dias grátis, sem cartão de crédito.", "Começar grátis" e "Falar com vendas".
- O rodapé de borda a borda, na mesma margem da nav: o logo, a frase "Automação de processos sem código para empresas", as colunas Produto, Empresa e Contato, um fio, o copyright, os links legais e quatro ícones sociais.
- No pé, **"Trami" gigante** na largura inteira, nítido, afundando na copa do hero (o pingo do i é um nó redondo). Ele sobe de trás da copa quando chega à tela.

### Interações e movimento
- Curva da marca `cubic-bezier(0.19, 1, 0.22, 1)` nas entradas (1,0 a 1,6 s), `cubic-bezier(0.65, 0, 0.35, 1)` nas trocas de estado, microinterações em 0,28 s.
- Todo clicável tem hover, foco visível e estado de clique: o botão branco esquenta para um rosa muito claro de baixo para cima e a seta anda; o grafite acende a borda e um brilho rosa passa por dentro; os links da nav ganham uma pílula translúcida que cresce do centro; os ramos do logo abrem um pouco; a estrela da nota gira um quinto de volta; os links do rodapé desenham um fio da esquerda. Clique encolhe para 0,96–0,97.
- Hover desligado enquanto a página rola com o cursor parado, e no toque o mesmo estado de clique.
- Só as camadas do hero seguem a rolagem (só `transform`). Scroll suave com Lenis só no desktop (mouse ou trackpad); no toque e com movimento reduzido, scroll nativo.
- A interface viva (o fluxo do hero, os cursores, os passos, as integrações) só anima com a peça na tela.
- Movimento reduzido: sem parallax, sem o laço do fluxo (o estado final parado) e entradas sem deslocamento.

### Celular (390 px)
- Hero: título em duas linhas, botão e nota empilhados; o painel vem como janela sem o menu lateral, com o fluxo inteiro na largura e o painel de propriedades saindo pela borda da direita, e não reage ao dedo (é vitrine).
- Por que e Clientes empilham; Como funciona e Planos viram trilhos laterais nativos com encaixe, com a ponta do próximo card até a borda (Planos com o Equipe primeiro); Integrações vira um palco em pé com os doze apps em volta da Trami.
- Todos os títulos em duas linhas, alvos de toque de 40 a 44 px e nada rola para o lado.

---

## Parte 2 — Como construir (stack)

- **Vite sem framework**: HTML, CSS e JS puros. Lenis 1.3.27, Literata e Inter variáveis pelo Fontsource 5.3.0, Vite 8.3.3. Sem GSAP e sem Three: todo o movimento é CSS e JavaScript próprio. As versões estão travadas no `package.json` e no `package-lock.json`.
- **Monte assim, nesta ordem:**
  1. Copie **todo** o conteúdo de `arquivos/site/` para a raiz do projeto, mantendo as pastas (`index.html`, `vite.config.js`, `package.json`, `package-lock.json`, `.gitignore`, `src/`, `public/`, `fonte/`). Copie, não reescreva: são quase 3 mil linhas acertadas uma a uma. Não copie `arquivos/conceito/` nem `arquivos/receitas/` para o site (são os prints de referência e as receitas das imagens).
  2. Rode `npm ci` (instala exatamente as versões do `package-lock.json`). Se o `npm ci` falhar, use `npm install` sem mudar nenhuma versão.
  3. Rode `npm run build` (tem de passar sem erro).
  4. Rode `npm run dev` e abra `http://localhost:5193`. Se a porta estiver ocupada, use `npx vite --port 5194`. Para abrir no celular, na mesma rede Wi-Fi, `npm run dev -- --host` e o endereço de rede que o Vite mostrar.
- O `index.html` só tem as marcas `<!-- @secao nome -->`: o plugin do `vite.config.js` troca cada uma pelo conteúdo de `src/sections/<nome>.html`, no dev e no build. Não cole as seções à mão no `index.html`.
- **Confira contra os prints de `arquivos/conceito/`**, na tela de 1456 × 840 e na de 390 × 844: o hero depois da entrada (com o painel em cima e o fluxo rodando) e cada seção depois de entrar. Console sem erros, nada rolando para o lado no celular. Se algo não bater, o erro está na cópia (arquivo faltando ou alterado), não no código: compare com `arquivos/site/`.
- `fonte/` não entra no site (o Vite não usa a pasta). São os scripts que tratam uma paisagem nova e recortam os rostos: só são usados na seção "Personalizar" do guia, com as receitas de `arquivos/receitas/`.
- No fim: `npm run build` gera o `dist/`, que sobe em qualquer hospedagem estática (Vercel, Netlify, Hostinger).
