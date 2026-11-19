# Ceru: plataforma de IA de chat com uma paisagem pintada em vídeo, impressa em pixel azul por um shader, e a conversa no meio do céu

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o site da minha empresa** (assistente de IA, chatbot, SaaS, software, startup de tecnologia) com esta estrutura e este visual.
   - **Usar só algumas peças** (o céu em pixel com a caixa de conversa, as abas com imagem e cartão, o céu que rasga e mostra a noite, a grade com marcas de corte, o cartão de ação com anotação à mão, o pontilhado aplicado às imagens) num site que já tenho.
2. Se for a empresa dela: o nome, o que o produto faz (de 3 a 4 capacidades, como escrever, pesquisar, analisar, automatizar), a frase principal, o endereço da página de cadastro ou do app, os números que pode afirmar (clientes, equipes, avaliações), os logos de clientes que pode mostrar, o plano grátis (se houver) e **que material já tem** (logo, cores, imagens). Avise desde já:
   - o céu do topo é um vídeo de uma paisagem pintada, feito para a demo: não se edita por prompt. Ela pode manter o da demo (é uma paisagem genérica, sem marca), gerar outra paisagem com as receitas de `arquivos/receitas/` (o guia explica, com um script pronto para fechar o loop) ou usar só uma imagem parada;
   - a cor do pixel sai da paleta do site, não da imagem: trocar as cores da marca muda o céu junto, sem gerar nada de novo;
   - a caixa de conversa da demo não responde de verdade: ela mostra um convite para criar conta. Para levar ao produto, liga-se o botão ao cadastro ou ao app dela (o guia explica);
   - os logos de clientes da demo são inventados: entram os dela, ou a faixa sai.
3. Se forem peças: quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa a landing page de uma **plataforma de IA de chat chamada Ceru** (marca fictícia, de "cerúleo", o azul do céu): "Pense alto." Leia antes o guia do projeto desta pasta (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes: arquitetura, o pixel, design system, regras de movimento e do celular, como conferir e como personalizar) e olhe as imagens em `arquivos/conceito/`: são prints do site pronto, o alvo de cada momento, em `-desktop` e `-mobile` (`01-abertura`, `02-hero`, `03-conversa-enviada`, `04-prova-e-recursos`, `05-recursos`, `06-pesquisa`, `07-como-funciona`, `08-manifesto`, `09-equipes`, `10-acao`, `11-fecho`, `12-rodape`).

**Tudo o que o site usa já vem pronto em `arquivos/`:** o `index.html`, o `vite.config.js` (com o plugin que monta as seções), o código inteiro em `arquivos/src/` (seções em HTML e CSS, os módulos de movimento e o shader), o vídeo e as imagens em `arquivos/public/`. Use tudo isso como está: não gere imagem nem vídeo novo, não reescreva o shader nem os módulos e não troque nada por uma versão "mais simples". O trabalho é montar o projeto, instalar as dependências com as versões certas, copiar os arquivos para o lugar e conferir.

A ideia da página: **uma startup de IA clara, com o céu em pixel**. O topo é uma pintura de paisagem (céu azul, nuvens brancas, montanhas, lago, árvores escuras nas bordas) em vídeo, impressa por um shader em quadradinhos de canto vivo com oito tons de céu, do branco ao azul-marinho: de longe é pintura, de perto é pixel art. No meio do céu, o título em serifa e a caixa de conversa convidando a escrever. O resto da página é branco, com serifa nos títulos, uma grotesca na interface, um azul só de acento e nada arredondado (botões, caixas, abas, chaves e cartões de canto vivo). As imagens das seções passam pelo mesmo pontilhado.

Nível de acabamento: site de premiação. Tom de produto de tecnologia calmo e direto: frases curtas, sem "revolucionário", "poder da IA" ou "o futuro é agora".

---

## Parte 1 — O site

### Marca e tom
- Marca **Ceru** (fictícia). O logo é um quadradinho de pixels em SVG (duas linhas em xadrez sobre um bloco cheio: o céu se desfazendo em pixel) com o nome "ceru" em minúsculas, na serifa, em `src/sections/nav.html` e `rodape.html`; o favicon é o mesmo desenho (`public/favicon.svg`).
- Cores por papel em `src/styles/tokens.css`: `--fundo` `#ffffff` (a página toda é branca), `--tinta` `#0d1830`, `--apoio` `#47536b`, `--suave` `#7d889d`, `--linha` `#dde3ed`, `--acento` `#1f66e5`, `--escuro` `#0a1328` (o painel "Como funciona") e os oito tons do pixel `--px-0` (`#ffffff`) a `--px-7` (`#17223d`). Duas paletas prontas por `?tema=anil` (violeta) e `?tema=mar` (verde-água): o céu muda junto.
- Tipo: **Source Serif 4** variável no tamanho óptico de display (títulos, peso 400, tracking apertado), **Schibsted Grotesk** variável (interface e texto) e **Caveat** (só a anotação à mão). As três são livres para uso comercial, pelo Fontsource.

### 00 — Abertura (~1,5 s, por tempo)
- Na primeira pintura, o hero é um bloco só da cor média do céu (inline no `<head>`). O shader começa em blocos de 64 células e ganha resolução em degraus (64, 32, 16, 8, 4, 2, 1), primeiro perto da caixa de conversa e por último nas bordas: a imagem "pensa" e chega. Junto, o título, o subtítulo, a conversa e as sugestões sobem com fade em sequência e a nav desce. No fim, a caixa começa a digitar sugestões sozinha.
- Qualquer gesto (roda, toque, tecla) pula para o fim. `?pronto`, link com âncora ou movimento reduzido abrem a página pronta.

### 01 — Hero
- O céu ocupa a tela toda: o vídeo (7,5 s em loop, mudo) desenhado pelo shader em células quadradas de 3 px de CSS (2,67 no celular), sempre um número inteiro de pixels da tela, com o pontilhado de Bayer 8×8 e os dois tons da paleta que melhor misturam cada cor. Um véu claro, também em pixel, clareia o céu atrás do título e da conversa. Sem hover nem efeito de cursor: o céu só se mexe com o vídeo.
- Com o hero inteiro na tela, a imagem vai até a borda, sem nada branco. Depois de ~6% de rolagem, a borda de baixo começa a se desfazer na cor da página, em blocos que engrossam conforme o hero sai.
- No meio: "Pense alto." (h1, serifa grande), o subtítulo "O Ceru escreve, pesquisa e analisa com você, a partir dos seus arquivos, e-mails e planilhas. É só começar a conversa." e a **conversa**: caixa branca de canto vivo com o campo ("Pergunte ao Ceru ou descreva uma tarefa") e a barra: "+" (abre o painel de anexo: enviar arquivo, Drive, planilha), "Pesquisa na web" (liga e desliga), o seletor de modelo "Ceru 2 · Rápido" (Rápido, Raciocínio, Pesquisa profunda), o microfone e o botão de enviar quadrado (azul quando há texto). Embaixo, quatro sugestões (duas no celular) que preenchem o campo.
- Com o campo vazio, uma demonstração digita pedidos de exemplo e apaga; ela para no foco. Enter envia (Shift+Enter quebra linha); envio vazio faz a caixa tremer; envio com texto mostra, dentro da caixa, a pergunta e o convite "O Ceru já está pensando nisso. Crie sua conta grátis para ver a resposta e continuar a conversa." com "Criar conta grátis" e "Nova pergunta". O microfone "ouve" por 4 s (quatro barrinhas no lugar do ícone).
- A nav: caixas brancas soltas sobre o céu (o logo à esquerda; "Produto", "Pesquisa", "Como funciona", "Equipes", "Entrar" e o botão azul "Comece grátis" à direita). Fora do hero, as caixas ganham um fio. No celular: logo, "Comece grátis" e o menu quadrado azul.

### 02 — Prova social e logos
- Centrado: quatro quadradinhos com iniciais em tons de azul e "Mais de 40 mil equipes já pensam com o Ceru", entre dois fios. Embaixo, a faixa de logos fictícios em células com fio fino, rolando sozinha (para no hover; cada logo acende).

### 03 — Recursos (abas)
- À esquerda, a barra azul de abas ("Escrever", "Pesquisar", "Analisar", "Automatizar"; a ativa em branco), o título, o texto e quatro itens com ícone de traço fino em grade 2×2. À direita, a imagem em pixel com um cartão branco da interface por cima (o rascunho de e-mail, a resposta com fontes citadas, o gráfico de vendas por dia, a rotina de toda segunda).
- As abas trocam sozinhas a cada 6 s enquanto a seção está na tela (uma barra de tempo enche na aba ativa); o clique e as setas do teclado trocam e param a troca automática. Na troca, o texto sai e entra, e a imagem nova chega em blocos que ganham resolução, como a abertura.

### 04 — Pesquisa profunda (o céu que rasga)
- Um painel de céu do dia em pixel, de borda a borda dentro das margens. Com a rolagem, um rasgo de borda irregular, com a borda clara de papel e sombra para dentro, abre a partir do canto de cima à direita e mostra o céu da noite estrelada atrás (o mesmo shader, com duas imagens). Ele para antes de cobrir a coluna do texto.
- À esquerda, "Pesquisa profunda", "Vá além da primeira página de resultados", o texto e "Testar a pesquisa". No meio, três cartões empilhados (48 fontes lidas; o relatório "Mercado de energia solar residencial" com "+38%" e um gráfico; exportar o PDF). À direita, a linha do tempo de quatro pontos ("Planeja a busca", "Lê 48 fontes", "Compara e confere", "Escreve com citações"), que acendem um a um enquanto o rasgo abre.

### 05 — Como funciona
- Painel azul-marinho dentro das margens: "Como funciona", "Do pedido à entrega, numa conversa", o texto à direita e três passos com ícone num quadrado azul, número, título e texto (conecte suas ferramentas, peça como pediria a um colega, revise e envie). Um fio azul se desenha sobre cada passo quando ele entra.

### 06 — Manifesto
- Um parágrafo grande em serifa ("O Ceru junta escrita, pesquisa e análise num lugar só…") que acende do cinza para a tinta palavra a palavra quando a linha passa do meio da tela (cada palavra troca por tempo, com transição).

### 07 — Para equipes
- "Assistentes que trabalham juntos" à esquerda, o texto à direita. Embaixo, uma grade de três células com fio fino e quadradinhos pretos nos cantos (marcas de corte de gráfica). Cada célula tem uma imagem em pixel (um campo sob o céu) com um painel de vidro azul por cima (a mesa de tarefas, o fluxo de três passos com "+", as regras com chaves e "Aplicar a todos os assistentes"), o número, o título e o texto. No celular, as células viram um trilho que rola de lado com encaixe.

### 08 — Da resposta à ação
- "Um clique" (rótulo azul), "Da resposta à ação, sem trocar de aba", o texto e o botão escuro "Comece grátis". Embaixo, uma imagem larga de céu em pixel com o cartão branco "Resumo pronto para enviar" (quatro números em serifa: decisões, tarefas, prazos, pendências; "Enviar ao time" e "Editar") e a anotação à mão em branco "Um clique e o time recebe", com um fio tracejado até o botão. "Enviar ao time" vira "Enviado ✓" com um aviso.

### 09 — Fecho e rodapé
- A paisagem do topo, em pixel e parada, sai da página (o topo dela se desfaz na cor da página) com um cartão branco no meio: "Comece com uma pergunta", "Grátis para sempre no plano pessoal. Sem cartão de crédito para começar." e os botões "Criar conta grátis" e "Falar com vendas".
- Rodapé branco de borda a borda, alto: o logo e a frase à esquerda, três colunas de links à direita e a linha de base (© e "Feito para pensar alto") presa no pé.

### Movimento e acessibilidade
- Rolagem suave (Lenis) só com mouse e trackpad; no toque, a rolagem é a nativa.
- As entradas são **por marco**: quando a peça chega na tela, a animação roda inteira, por tempo. Só três coisas seguem a rolagem: o pé do hero se desfazendo, o rasgo da pesquisa e o acender do manifesto (palavra a palavra, com transição).
- As imagens em pixel chegam em blocos ao entrar na tela; a versão fina de cada uma é calculada em fatias de poucos milissegundos antes de ela chegar (a rolagem nunca trava).
- Hover desligado enquanto a página rola (`html.is-scrolling`) e só com mouse; todo clicável tem hover, clique e foco por teclado visível em azul.
- `prefers-reduced-motion`: sem abertura, sem Lenis, sem entradas, o vídeo parado no 1º quadro e as imagens já nítidas.

---

## Parte 2 — Como construir (stack)

- **Vite sem framework**: HTML, CSS e JS puros. Crie o arquivo `package.json` escrevendo-o direto (não use `npm init` nem um template do `npm create`, que trazem campos e arquivos a mais), com `"type": "module"`, `"private": true` e os scripts `"dev": "vite"`, `"build": "vite build"` e `"preview": "vite preview"` (nome e versão à sua escolha), e instale com versão travada, escrito por extenso (`npm install`, não `npm i`), um comando por linha:
  - `npm install -E gsap@3.15.0 lenis@1.3.26 @fontsource-variable/source-serif-4@5.3.1 @fontsource-variable/schibsted-grotesk@5.3.0 @fontsource-variable/caveat@5.3.0`;
  - `npm install -E -D vite@8.3.5` (dependência de desenvolvimento).
- **Copie os arquivos** com `cp` (as pastas inteiras de uma vez, um comando por linha, sem encadear com `&&`: em sessões com permissões restritas, comando composto pede aprovação):

  | de | para |
  |---|---|
  | `arquivos/index.html` | a raiz |
  | `arquivos/vite.config.js` | a raiz (o plugin `secoes` troca cada `<!-- @secao nome -->` do `index.html` por `src/sections/nome.html`; `base: './'`: o `dist/` abre em qualquer pasta da hospedagem) |
  | `arquivos/src/` (a pasta inteira) | `src/` |
  | `arquivos/public/` (a pasta inteira) | `public/` |

  Os comandos, da raiz do projeto: `cp arquivos/index.html .`, `cp arquivos/vite.config.js .`, `cp -R arquivos/src src` e `cp -R arquivos/public public` (sem barra no fim do nome da pasta). Copie antes de existir uma pasta `src/` ou `public/` na raiz (senão o `cp -R` cria `src/src/`). A pasta `arquivos/` continua onde está: não entra no site nem no `dist/`.

  Confira depois da cópia: `src/main.js`; `src/gl/` com `ceu.frag.glsl` (o shader), `ceu.js`, `paleta.js` e `pixel.js`; `src/motion/` com 12 módulos (`abertura.js`, `ancoras.js`, `conversa.js`, `ease.js`, `guia.js`, `hero.js`, `nav.js`, `pesquisa.js`, `rolando.js`, `scrollbar.js`, `secoes.js`, `smooth.js`); `src/sections/` (nav, hero, prova, recursos, pesquisa, como, manifesto, agentes, acao, fecho e rodape, cada um em `.html` e `.css`); `src/styles/` (`site.css`, `tokens.css`, `base.css`, `pecas.css`); `public/favicon.svg`; `public/video/ceu.mp4`; e `public/img/` com `ceu-poster.jpg`, `k1-lago.jpg`, `k2-nuvens.jpg`, `k3-noite.jpg` e `k4-campo.jpg`.
- **CSS numa folha só, por `<link>`**: o `arquivos/index.html` já traz, no `<head>`, o script que liga o tema e a abertura antes de qualquer arquivo, o fundo branco e a cor do céu da primeira pintura, o "nada transiciona até assentar" e o que esconde o texto da abertura, inline, e depois `<link rel="stylesheet" href="/src/styles/site.css">` (as fontes, os tokens e as seções por `@import`). Mantenha assim e nunca importe CSS pelo JS: no dev do Vite ele chega depois dos módulos e a página aparece crua por um instante a cada recarregamento.
- O shader é importado como texto (`import frag from './ceu.frag.glsl?raw'`, recurso do próprio Vite): não converta para outro formato. Ele roda em WebGL2; sem WebGL2, o hero mostra a pintura parada, sem pixel.
- Leia o cabeçalho dos módulos antes de mexer em qualquer coisa: `src/main.js` liga a rolagem, o hero, a conversa, a nav, as seções, a pesquisa e a abertura. O mapa de cada arquivo está no guia.
- `arquivos/conceito/` e `arquivos/receitas/` não entram no site; `arquivos/fonte/loop.mjs` só serve para fazer o loop de um vídeo novo (ver o guia).
- No fim:
  - `npm run build` passa sem aviso de arquivo faltando;
  - `npx vite preview` abre o site, a abertura roda inteira (os blocos ganham resolução a partir da conversa, o texto sobe), o console fica limpo e recarregar nunca mostra a página sem estilo; `?pronto` abre sem a abertura;
  - de perto, cada célula do céu é um quadrado nítido, sem borrão; as nuvens andam em loop sem salto;
  - com o hero inteiro na tela não há nada branco no pé; rolando, a borda de baixo se desfaz em blocos;
  - a conversa: a demonstração digita com o campo vazio e para no foco; Enter com texto mostra o convite; Enter vazio treme; o "+" e o seletor de modelo abrem e fecham (Esc e clique fora); as sugestões preenchem o campo;
  - as abas trocam (clique, setas e sozinhas) com a imagem chegando em blocos; o rasgo da pesquisa abre com a rolagem e os pontos da linha do tempo acendem; o manifesto acende palavra a palavra; as chaves, o "+" do fluxo e "Enviar ao time" respondem;
  - `?tema=anil` e `?tema=mar` trocam a paleta da página e do céu;
  - nada rola para o lado no celular (390 px); lá a nav mostra o logo, "Comece grátis" e o menu, e as células de "Para equipes" rolam de lado;
  - o `dist/` sobe em qualquer hospedagem estática, inclusive numa subpasta. Confira com um servidor estático de verdade, não com o `vite preview` (ele devolve o `index.html` para qualquer caminho e esconde arquivo faltando): copie o `dist/` para uma pasta `ceru/` dentro de uma pasta de teste fora do projeto (por exemplo, `../teste-ceru/`, ao lado do projeto), rode `python3 -m http.server 8080` na pasta de teste (ou outra porta, se essa estiver ocupada), abra `http://localhost:8080/ceru/` e confira o console sem nenhum 404, o vídeo do céu e as imagens das seções. Sem navegador, confira por `curl -I` que respondem 200: o `index.html`, cada arquivo de `assets/`, `video/ceu.mp4` e as cinco imagens de `img/` (as quatro `k*.jpg` não aparecem no `index.html`: o JS as carrega pelos `data-pixel` e pela pesquisa, então conferir só o HTML deixaria passar a falta delas).
