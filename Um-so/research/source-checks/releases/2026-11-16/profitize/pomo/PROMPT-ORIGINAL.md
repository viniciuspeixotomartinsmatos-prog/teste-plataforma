# Pomo: sucos integrais numa fila de garrafas em laço, com o rótulo girando no vidro, a abertura de frutas com física e a mesma garrafa levada da home até a página do produto

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o site da minha marca** (suco, refrigerante artesanal, kombucha, chá gelado, cerveja, geleia, conserva, cosmético em pote: qualquer produto em embalagem cilíndrica com vários tipos) com esta estrutura e este movimento.
   - **Usar só algumas peças** (a fila de garrafas com o rótulo girando, a abertura com as frutas caindo, a passagem da garrafa clicada até a página do produto e a subida dela por cima do nome, a grade com as frutas saltando no hover, a foto que cresce até a tela cheia, o calendário da safra) num site que já tenho.
2. Se for a marca dela: o nome, os produtos (de 3 a 12, com o nome, a cor e a fruta ou o ingrediente de cada um), os textos que ela já tem, o número do WhatsApp com DDD e **que material já tem** (logo, fotos do produto, fotos do lugar). Avise desde já:
   - **os rótulos das garrafas são desenhados em código** a partir de um arquivo de configuração: trocar o nome da marca, um sabor ou uma cor redesenha todas as embalagens, sem imagem nova;
   - as garrafas são fotos do vidro **sem rótulo** com o suco dentro, em doze cores. Um produto de outra cor ou outra embalagem (pote, frasco, lata) pede fotos novas da embalagem sem rótulo, de frente, em fundo liso: o guia e `arquivos/receitas/` explicam como gerar ou fotografar;
   - as cinco fotos da galeria mostram as garrafas com o nome da demo: com outra marca, elas são trocadas por fotos do produto dela (ou a seção sai). A foto do pomar não tem marca e pode ficar;
   - o pedido abre o WhatsApp dela com o recado escrito. Não há loja por trás.
3. Se forem peças: quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa a landing page de uma marca de **sucos integrais chamada Pomo** (marca fictícia): "do pé para a garrafa, no mesmo dia". Dez sabores de um pomar próprio, sem açúcar, sem água e sem conservante. Leia antes o guia do projeto desta pasta (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes: arquitetura, design system, como funcionam as garrafas e os rótulos, regras de movimento e do celular, como conferir e como personalizar) e olhe as imagens em `arquivos/conceito/`: são prints do site pronto, o alvo de cada momento, em `-desktop` e `-mobile` (`01-abertura`, `02-home`, `03-home-hover`, `04-voo`, `05-produto`, `06-sabor`, `07-ficha`, `08-fotos`, `09-sabores`, `10-pomar`, `11-mote`, `12-safra`, `13-rodape`, `14-menu`).

**Tudo o que o site usa já vem pronto em `arquivos/`:** o `index.html`, o `vite.config.js` (com o plugin que monta as seções), o código inteiro em `arquivos/src/` (seções em HTML e CSS, os módulos de movimento, o desenho dos rótulos, as frutas de papel e o WebGL das garrafas) e as imagens em `arquivos/public/`. Só a fonte dos títulos (Zodiak, do Fontshare) não vem junto, porque a licença não deixa repassar o arquivo: ela se baixa de graça (Parte 2). Use tudo isso como está: não gere imagem nova, não reescreva os módulos e não troque nada por uma versão "mais simples" (o rótulo enrolado no cilindro não é um efeito de CSS e não sai de uma imagem pronta). O trabalho é montar o projeto, instalar as dependências com as versões certas, copiar os arquivos para o lugar, baixar a fonte e conferir.

A ideia da página: **as garrafas são as protagonistas, e o produto parece 3D sem ser 3D**. Cada garrafa é uma foto do vidro com o suco e, por cima, um rótulo desenhado em código e enrolado num cilindro iluminado: quando a garrafa gira, a arte desliza no vidro e, na faixa onde o rótulo não fecha, aparece o suco. O site funciona como duas páginas sem corte entre elas. A página abre com frutas de papel recortado caindo com física de verdade até encher a tela; uma varredura laranja descobre a **home, uma tela só**: a fila das dez garrafas sobre um pomo verde gigante, com uma frase em anel, e a rolagem ali só troca o sabor (a roda anda a fila; a página não rola). Clicar numa garrafa abre a **página do produto**, que rola, e **a garrafa nunca sai de cena**: a fila e o pomo somem, a mesma garrafa desce até o pé da tela girando o rótulo, o nome gigante entra por cima e, rolando, ela sobe por cima dele. Depois, a ficha, fotos para arrastar, a grade dos sabores com as frutas saltando no hover (o clique num card leva a garrafa dele até o alto da página), o pomar, o calendário da safra e o rodapé com o nome de borda a borda.

Nível de acabamento: site de premiação. Tom de quem planta e colhe: frases curtas e concretas (pé, colheita, prensa, geladeira), sem "experiência", "detox" nem "superalimento".

---

## Parte 1 — O site

### Marca e tom
- Marca **Pomo** (fictícia), de "pomo", o fruto (a raiz de pomar), em português do Brasil. O logo é POMO em serifa, com "sucos do pé" em itálico embaixo e, em cima, o símbolo: uma laranja de papel recortado com folha (SVG em `src/sections/nav.html`, `rodape.html` e `public/favicon.svg`).
- Cores (`src/styles/tokens.css`, por papel): creme `#fbf3e6` (fundo), verde-mata `#173f2a` (texto, o pomo da home e o rodapé), tangerina `#ff6a1a` (títulos, varredura, menu, anel, botões). Cada sabor traz as cores do próprio rótulo em `src/config.js`.
- Tipo: **Zodiak** variável nos títulos (caixa alta, peso 400, uma serifa de moda de contraste médio; o itálico no "sucos do pé" do rodapé), **Bodoni Moda** só no logo da nav (o mesmo do rótulo das garrafas) e **Figtree** variável no texto e na interface. Todas gratuitas para uso comercial: a Zodiak do Fontshare, as outras pelo Fontsource.
- Interface em pílulas com borda fina: "Sabores" e "O pomar" à esquerda, o logo no meio, "Menu" e uma bola tangerina com a folha à direita. No hover a pílula cresce com mola, escurece e o texto sai por cima enquanto o mesmo entra por baixo. A folha de papel é o enfeite da marca (separadores, rótulo do cursor, itens do menu).

### 00 — Abertura (~2,5 s, é o carregamento)
- A primeira coisa pintada é a tela creme com o contador "0%" em serifa tangerina, no meio. Frutas de papel recortado (laranja, uva, maracujá cortado, caju com a castanha, goiaba cortada, abacaxi, limão, manga, fatia de melancia, jabuticaba no galho, folhas, gengibre) **caem com física** (matter.js: cada contorno vira um corpo), batem e se empilham até encher a tela, passando por cima do número.
- O contador anda até 100% em ~1,7 s, mas espera em 92% enquanto as fontes, as fotos das garrafas da primeira tela e os rótulos delas não estão prontos. Quando as frutas assentam, uma varredura tangerina sobe do pé, cobre tudo e sai pelo alto, descobrindo a home.
- Clique empurra as frutas; rolar, tecla ou o dedo arrastando levam ao fim. `?pronto`, link com âncora ou movimento reduzido abrem a página pronta.

### 01 — Home (a fila, uma tela só)
- A home não rola: a roda do mouse e o trackpad, nos dois sentidos, andam a fila; o dedo também, de lado ou de pé; as setas do teclado andam de sabor em sabor e Enter abre o do meio.
- Um pomo gigante verde-mata (polígono de papel recortado com folha e cabinho) nasce do pé da tela, e em volta dele, por dentro da borda, a frase "do pé para a garrafa · no mesmo dia" em serifa tangerina, num anel que gira junto com a fila.
- Na frente, **as dez garrafas numa trilha levemente inclinada que corre em laço**: a do meio é a maior e a mais acesa; as das pontas encolhem, escurecem e desfocam; cada uma inclina numa onda que anda com a fila. Na entrada, elas sobem da esquerda para a direita, saindo do transparente, e cada rótulo dá uma volta.
- **O rótulo gira no vidro**: contra o movimento da fila (e volta à frente quando ela para), na direção do cursor que chega perto e, parado 0,26 s sobre uma garrafa, numa volta inteira, mostrando as costas (ingredientes, tabela nutricional, código de barras). A garrafa mais perto do cursor é puxada até ele e cresce um pouco; a pílula "Ver o sabor" segue o mouse em cima das garrafas, e a pílula "Arraste" só na faixa delas (entre uma garrafa e outra), nunca no resto da tela.
- Arrastar anda a fila com embalo (o clique depois de arrastar não conta). O movimento é livre e fluido, e a fila para onde o gesto deixar; **parada por alguns segundos, ela faz um reajuste bem leve** e a garrafa mais perto desliza devagar até o meio, maior e acesa. No teclado, Tab passa pelas garrafas (a focada vai para o meio) e as setas andam.

### A passagem: clicar numa garrafa abre a página do produto (a garrafa nunca sai de cena)
- No clique, as outras garrafas, o pomo e o anel somem em ~0,4 s, e **a mesma garrafa** (o mesmo rótulo, no mesmo giro, sem pular de lugar nem de tamanho) desce até o pé da tela em ~0,95 s, de costas, dando entre meia e uma volta e meia no rótulo. A página do produto tem a mesma cor creme da home, então não há corte: quando a garrafa chega, o nome entra por máscara, linha a linha, e a página passa a rolar. O endereço vira `#laranja` (o sabor aberto); o logo, "Início" no menu e o voltar do navegador levam de volta à fila, com aquele sabor no meio.

### 02 — O sabor (o alto da página do produto)
- Fundo creme. O nome em duas linhas, gigante, em serifa tangerina ("SUCO DE / LARANJA", "ABACAXI COM / HORTELÃ"; o corpo diminui só quando a linha mais larga não cabe), fica preso enquanto **a garrafa sobe do pé da tela**, girando o rótulo das costas para a frente e desinclinando, e para por cima do nome. Nos lados, o tipo do sabor ("Cítrico") e "Colhido e engarrafado no dia".
- Depois a ficha, centrada entre folhinhas: a descrição, os ingredientes e três colunas com fios (combina com, tamanhos em pílulas redondas, validade).

### 03 — Fotos
- No creme da página, cinco fotos 3:2 numa fila sem fim, sempre com uma foto no meio da tela e as vizinhas cortadas nas bordas, com o mesmo respiro em cima e embaixo: as garrafas deitadas numa mesa de pedra com sombra de folhas, o maracujá em still escuro, o suco de laranja servido no café da manhã, um caixote de garrafas sob a laranjeira e a melancia gelada na beira da piscina. Arrastar (o mouse ou o dedo de lado) anda a fila com embalo, no máximo uma foto por piparote, e a foto mais perto se encaixa no meio quando ela para; o trackpad de lado e as setas também andam; com o mouse, a pílula "Arraste" e as fotos andando um pouco por dentro da moldura. O dedo de pé continua rolando a página.

### 04 — Os sabores do pomar
- Os dez sabores em cards (5 × 2; 2 colunas no celular), cada um com a garrafa e o nome. **No hover (foco ou toque)**, o card inclina, ganha a cor clara do rótulo e as frutas de papel do sabor saltam de trás da garrafa com mola, uma depois da outra, vazando da borda do card; o rótulo vira um pouco. Clicar num card: um véu creme cobre a página, ela volta ao alto com aquele sabor, e a garrafa do card voa até o pé da tela (crescendo até o tamanho da página do produto) enquanto o nome novo entra.

### 05 — O pomar
- "O POMAR" e, embaixo, uma foto num card de cantos arredondados que **cresce até a tela cheia** com a rolagem (as bordas e o raio somem, a foto desce do zoom) e fica presa um instante com a frase "Colhido de manhã, engarrafado à tarde" por cima, que entra por marco.
- Um parágrafo entre folhinhas sobre o pomar e, depois, as frutas de papel enormes passando em velocidades diferentes (paralaxe) pelas laterais, em volta do mote preso no meio: "Se não deu no pé, não vai pra garrafa."

### 06 — Safra
- "SAFRA", uma frase ("Suco integral não se faz de fruta guardada...") e uma tabela de fios: sabor (com a fruta de papel e o selo "agora"), quando sai e as garrafas. As abas em pílula, presas no pé da tela enquanto a tabela passa, trocam entre **"Na safra agora"** (o que dá no mês de quem visita, pelo relógio dele) e **"Logo mais"** (o resto, com o mês em que volta). As linhas entram uma a uma.

### 07 — Rodapé
- Verde-mata. **POMO de borda a borda** em serifa tangerina (medido para caber inteiro na largura) e "sucos do pé" em itálico; as letras sobem uma a uma quando o rodapé aparece. Quatro colunas com fios: o símbolo e a razão social, os links, "Onde comprar" com o botão "Fazer um pedido" (abre o WhatsApp com o recado) e o contato.

### Menu
- Um painel tangerina desce do alto; os itens (Início, O sabor, Sabores, O pomar, Safra) em serifa gigante, cada um mais recuado para a direita, com fios entre eles, sobem por máscara um a um. O item da seção atual fica claro com a folha (na home, "Início"); o hover desliza o item e acende a folha. "Menu" vira "Fechar"; Esc fecha. "Início" volta à fila; na home, os outros itens (e as pílulas da nav) abrem a página do produto do sabor do meio já naquela seção.

### Movimento e acessibilidade
- Na página do produto, rolagem suave (Lenis) com um teto de velocidade na roda (~2 telas por segundo); no toque, a rolagem é a nativa. Nenhuma parada que engole o gesto. Na home a página não rola.
- O que anda com a rolagem são os objetos (a fila, a garrafa do sabor, a foto do pomar, as frutas); o que é texto entra por marco; o que responde ao cursor anda por mola.
- Hover desligado enquanto a página rola (`html.is-scrolling`) e só com mouse; todo clicável tem hover, clique e foco por teclado.
- Barra de rolagem própria; a nav fica presa ao alto da página: rola embora com ela e só reaparece quando a página volta ao alto (nunca no meio da rolagem).
- `prefers-reduced-motion`: sem abertura, sem Lenis, a fila sem entrada, a passagem sem voo (um véu rápido), a garrafa do produto já assentada, a foto do pomar já cheia.
- `?tema=anil`, `?tema=uva` ou `?tema=vermelho` trocam a paleta ao vivo, para comparar.

---

## Parte 2 — Como construir (stack)

- **Vite sem framework**: HTML, CSS e JS puros. Crie o `package.json` à mão (não use um template do `npm create`, que traz arquivos de exemplo), com `"type": "module"`, `"private": true` e os scripts `"dev": "vite"`, `"build": "vite build"` e `"preview": "vite preview"` (nome e versão à sua escolha), e instale com versão travada, escrito por extenso (`npm install`, não `npm i`), um comando por linha:
  - `npm install -E gsap@3.15.0 lenis@1.3.26 matter-js@0.20.0 @fontsource-variable/bodoni-moda@5.3.0 @fontsource-variable/figtree@5.3.0`;
  - `npm install -E -D vite@8.3.5` (dependência de desenvolvimento).
- **Copie os arquivos** com `cp` (as pastas inteiras de uma vez, um comando por linha, sem encadear com `&&`: em sessões com permissões restritas, comando composto pede aprovação):

  | de | para |
  |---|---|
  | `arquivos/index.html` | a raiz |
  | `arquivos/vite.config.js` | a raiz (o plugin `secoes` troca cada `<!-- @secao nome -->` do `index.html` por `src/sections/nome.html`; `base: './'`: o `dist/` abre em qualquer pasta da hospedagem) |
  | `arquivos/src/` (a pasta inteira) | `src/` |
  | `arquivos/public/` (a pasta inteira) | `public/` |

  Os comandos, da raiz do projeto: `cp arquivos/index.html .`, `cp arquivos/vite.config.js .`, `cp -R arquivos/src src` e `cp -R arquivos/public public` (sem barra no fim do nome da pasta). Copie antes de existir uma pasta `src/` ou `public/` na raiz (senão o `cp -R` cria `src/src/`). A pasta `arquivos/` continua onde está: não entra no site nem no `dist/`.

  Confira depois da cópia: `src/main.js` e `src/config.js`; `src/marca/` com `cilindro.js`, `garrafa.js`, `rotulo.js`, `frutas.js` e `garrafas.json`; `src/motion/` com 16 módulos (`abertura.js`, `cursor.js`, `ease.js`, `fila.js`, `fotos.js`, `guia.js`, `nav.js`, `pomar.js`, `rodape.js`, `rolando.js`, `sabor.js`, `sabores.js`, `safra.js`, `scrollbar.js`, `smooth.js`, `troca.js`); `src/sections/` (nav, menu, hero, sabor, fotos, sabores, pomar, safra e rodape, cada um em `.html` e `.css`, e `abertura.css`); `src/styles/` (`site.css`, `fontes.css`, `tokens.css`, `base.css`, `pecas.css`); `src/fonts/` com o `LEIA.txt` e a licença; `public/favicon.svg`; `public/garrafas/` com 24 imagens `.webp` (doze garrafas, cada uma no tamanho grande e no `-640`); e `public/fotos/` com 18 imagens `.webp` (seis fotos em três larguras).
- **A fonte dos títulos (Zodiak, do Fontshare)**: a licença não deixa o arquivo vir no pacote, então baixe direto de lá (a pessoa aceita a licença ao usar; é gratuita para uso comercial): `curl -L -o zodiak.zip https://api.fontshare.com/v2/fonts/download/zodiak`, depois `unzip -o zodiak.zip -d zodiak`, e copie para `src/fonts/` os dois arquivos da pasta `Fonts/WEB/fonts/` do zip: `cp zodiak/Zodiak_Complete/Fonts/WEB/fonts/Zodiak-Variable.woff2 src/fonts/` e `cp zodiak/Zodiak_Complete/Fonts/WEB/fonts/Zodiak-VariableItalic.woff2 src/fonts/` (se o caminho do zip for outro, procure os dois `.woff2` com `find zodiak -name "Zodiak-Variable*.woff2"`). Apague o zip e a pasta `zodiak/` depois. O `src/styles/fontes.css` já aponta para eles; sem os arquivos, os títulos caem numa serifa do sistema.
- **CSS numa folha só, por `<link>`**: o `arquivos/index.html` já traz, no `<head>`, o script que liga o tema e a abertura antes de qualquer arquivo, a cor de fundo da primeira pintura, a tela da abertura e o "nada transiciona até assentar" inline, e depois `<link rel="stylesheet" href="/src/styles/site.css">` (as fontes, os tokens e as seções por `@import`). Mantenha assim e nunca importe CSS pelo JS: no dev do Vite ele chega depois dos módulos e a página aparece crua por um instante a cada recarregamento.
- Leia o cabeçalho dos módulos antes de mexer em qualquer coisa. O mapa de cada arquivo está no guia. Não crie um contexto WebGL por garrafa: o `src/marca/cilindro.js` é um só, compartilhado.
- `arquivos/conceito/` e `arquivos/receitas/` não entram no site; `arquivos/fonte/` só serve para preparar imagens novas e redesenhar as frutas (ver o guia).
- No fim:
  - `npm run build` passa sem aviso de arquivo faltando;
  - `npx vite preview` abre o site, a abertura roda inteira (as frutas caem e enchem a tela por cima do contador, a varredura sobe, o pomo nasce do pé e as garrafas entram), o console fica limpo e recarregar nunca mostra a página sem estilo; `?pronto` abre sem a abertura; os títulos estão na Zodiak (serifa de contraste médio, não a do sistema);
  - todas as garrafas mostram o rótulo (POMO, o nome do sabor e a faixa), sem fio cinza na beirada do vidro;
  - na home: a roda anda a fila e a página não rola; o rótulo da garrafa mais perto vira para o cursor; parado sobre uma, ele dá uma volta inteira; arrastar anda a fila com embalo;
  - clicar numa garrafa: a fila e o pomo somem e a mesma garrafa desce até o pé da tela, sem pular, com o nome entrando por cima; o logo volta à fila; `#laranja` no endereço abre direto a página do produto;
  - rolando a página do produto: a garrafa sobe girando e assenta por cima do nome, a galeria arrasta, o hover da grade solta as frutas, o clique num card leva a garrafa dele ao alto da página, a foto do pomar cresce até a tela cheia, as frutas passam em volta do mote, a safra troca de aba e o nome do rodapé cabe inteiro;
  - nada rola para o lado no celular (390 px); lá a home mostra a garrafa do meio com as vizinhas espiando nas bordas e anda com o dedo, de lado ou de pé;
  - o `dist/` sobe em qualquer hospedagem estática, inclusive numa subpasta. Confira com um servidor estático de verdade, não com o `vite preview` (ele devolve o `index.html` para qualquer caminho e esconde arquivo faltando): `mkdir teste-estatico`, `cp -R dist teste-estatico/pomo` e `python3 -m http.server 8080 --directory teste-estatico` (ou outra porta, se essa estiver ocupada); abra `http://localhost:8080/pomo/`, confira o console sem nenhum 404, as garrafas com rótulo e as fotos, feche o servidor e apague a pasta `teste-estatico/`.
