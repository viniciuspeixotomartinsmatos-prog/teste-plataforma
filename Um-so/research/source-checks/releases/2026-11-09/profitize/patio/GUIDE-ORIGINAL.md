# Guia do projeto — Pátio

(Salve como `CLAUDE.md` na raiz do projeto se você usa o Claude Code, ou como `AGENTS.md` se usa o Codex, o Cursor ou outro agente. O conteúdo é o mesmo.)

Landing page do Pátio, app de gestão de condomínio (reservas, boletos, portaria, avisos). Vite sem framework, HTML, CSS e JS puros, uma fonte só (DM Sans). **Página inteira com rolagem suave (Lenis, `src/motion/lenis.js`)**: sem GSAP, sem seção presa, sem trava de rolagem. O impacto vem de três coisas, nessa ordem: o hero com os cards de foto que andam em passos, cada um com um widget de vidro mostrando o app; a foto aérea do condomínio parada ao fundo enquanto as telas do síndico e do morador passam por cima, uma de cada lado; e as passagens entre as seções (o card do hero que vira moldura, o quadradinho do logo que cresce até ser o card de preço, o formulário que atravessa a borda da última foto). A régua é site de premiação: se uma passagem parece "ok", ainda não está pronta.

## Design system
- Tokens em `src/styles/tokens.css`, nunca cores ou medidas soltas no CSS das seções.
  - `--bg #FAFAF8`, `--surface #FFFFFF`, `--ink #151515`, `--ink-2 #6B6B66`, `--ink-3 #9C9C96`, `--line #E5E5E0`, `--line-2 #D4D4CE`.
  - **Uma cor só**: `--green #11914B` (logo, status do app, card de preço, foco), com `--green-press #0B7038`, `--green-dot #4CC27A` e `--green-soft rgba(17, 145, 75,.08)`. Não acrescente uma segunda cor: o que precisa de destaque fica preto.
  - Vidro: `--glass rgba(255,255,255,.66)` (widgets) e `--glass-tag rgba(240,240,234,.42)` (etiquetas sobre foto), sempre com `backdrop-filter`.
- **Uma família, uma escala**: título do hero (peso 370), títulos de seção (400, −0,03em, 2 linhas no máximo, cada linha um `span.linha` em bloco), títulos das folhas, numerais leves (300, −0,05em, unidade pequena em cinza ao lado), texto de apoio cinza, corpo, interface 13–15 px. Nada de mono, nada de caixa alta, nada de rótulo com traço antes.
- **Etiqueta** (`.etiqueta`) é o único rótulo de seção, a mesma em todas (o hero não tem).
- **Grade**: margem `--margin`; o eixo vertical de 29,43vw (borda dos cards do hero) organiza o título "Dois lados" e os números. Superfícies arredondadas: cards `--r-card`, molduras `--r-frame`, sempre a `--inset` da borda da tela.
- **Fotos**: o mesmo tratamento em todas (`arquivos/fonte/fotos.mjs`), luz de dia para fim de tarde ao longo da página. Nenhuma foto com logo, placa, letreiro ou lugar reconhecível.
- **Telas do app** são HTML e CSS (`src/telas/`), retas, sem celular inclinado nem mockup genérico. Elas ilustram; nada nelas é clicável (`pointer-events: none`).

## Regras de motion
- **A rolagem nunca para.** O Lenis só suaviza a roda e o trackpad (por baixo ela segue nativa). Um fundo pode ficar `sticky` enquanto o conteúdo passa por cima; o conteúdo nunca para. Nunca prender uma seção, nunca trocar etapas pela rolagem, nunca sequestrar o scroll.
- **Curvas e durações dos tokens**: `--ease-out` `cubic-bezier(.16,1,.3,1)` para entradas e hover, `--ease-io` `cubic-bezier(.65,0,.35,1)` para trocas (carrossel, abrir pergunta). `--t-tap` 180 ms, `--t-hover` 320 ms, `--t-state` 640 ms, `--t-enter` 900 ms. Nada de `ease` padrão nem fade genérico de 0,3 s.
- **Texto entra por marco, uma vez** (`[data-entra]`, `[data-entra="linhas"]`, `src/motion/entradas.js`), com duração fixa, e termina no estado final mesmo rolando rápido. Texto nunca acompanha a rolagem.
- **Só imagem e moldura acompanham a rolagem**, suavizadas, num laço único (`src/motion/rolagem.js`): abertura das molduras (`lados.js`, `moldura.js`), zoom da foto aérea, foto final andando, crescimento do card de preço (`preco.js`). O laço para quando nada anda.
- **Folhas, telas, formulário e perguntas não têm entrada**: chegam com a rolagem, prontos. Uma folha branca vazia passando na rolagem rápida é o pior defeito do site.
- Passou direto (rolagem rápida, âncora): o card de preço já está aberto, os títulos já entraram. Nada fica no meio do caminho.
- Telas do app animam por tempo e **só enquanto estão na tela** (`IntersectionObserver`), e voltam ao começo quando saem.
- Depois do `load`, as imagens são baixadas e decodificadas uma a uma (`img.decode()`): nenhuma foto grande aparece em branco no primeiro quadro.
- `prefers-reduced-motion`: sem abertura, zoom, movimento de foto nem crescimento (o card de preço aberto); entradas só por opacidade; carrossel por fade, sem troca automática; telas paradas; números no valor final.

## Microinterações
- Todo clicável tem **hover, foco visível e estado de clique**, na curva e na duração dos tokens: links com o quadradinho verde que nasce antes da palavra; botões pílula com o fundo indo para o verde e o rótulo rolando para cima; setas com a seta trocando na direção do movimento; cards com a foto aproximando devagar; perguntas com o "+" que vira "×"; campos com borda verde e rótulo que sobe.
- Foco: anel verde de 2 px (branco dentro do card verde). O carrossel com foco desenha o anel no card ativo e aceita ← →.
- Hover desligado enquanto a página rola (`html.is-scrolling`, em `rolagem.js`): todo seletor de hover fica dentro de `@media (hover: hover)` e de `:where(html:not(.is-scrolling))`.
- Toque: o pressionado (`.is-pressionado`) entra 70 ms depois do dedo e não pisca em arrasto (`toque.js`).
- Barra de rolagem própria, fina e sobreposta (`barra.js`); a nativa escondida, nunca `scrollbar-gutter`.
- Nav fixa que some ao descer e volta ao subir; escondida durante a rolagem de um link de âncora, para não cobrir o título de destino.

## Desempenho
- 60 fps na rolagem, no desktop e no celular. Um laço só de `requestAnimationFrame` para tudo que acompanha a rolagem; nada lê layout em `scroll` fora dele.
- Fotos em WebP no tamanho em que aparecem (cards 900/1300 px, fotos largas 1600/2880 px, versão vertical de 1100 px no celular, miniaturas de 240 px). Nenhuma biblioteca além da fonte.

## Como checar
1. `npm run dev`; olhar a 1456 × 840 e a 390 × 844, no Chrome e no Safari (o vidro fosco dos widgets só se confere num navegador de verdade).
2. Hero: igual ao `arquivos/conceito/00-hero-*`. Clicar nas setas, arrastar, usar ← → com o foco no carrossel e o gesto lateral do trackpad: um gesto = um card; o contador rola, a legenda troca, o widget entra depois do card. Parado, troca sozinho a cada 6 s.
3. Rolar devagar até o fim, de 200 em 200 px: a foto aérea abre e fica parada; as folhas do síndico e do morador passam por cima, uma de cada lado; o painel recebe reserva, visita e boleto sozinho; o celular libera a visita sozinho; o quadrado verde cresce até o card de preço; a última foto abre e o formulário atravessa a borda dela.
4. Rolar a página inteira rápido (1200 px de uma vez) e voltar: nenhuma foto em branco, nenhuma folha vazia, nenhum título cortado ou pela metade, o card de preço aberto.
5. Passar o Tab do começo ao fim: todo clicável recebe foco visível; o menu do celular prende o foco e fecha com Esc.
6. No celular: arrastar os cards com o dedo (arrastar na vertical rola a página), abrir o menu, abrir uma pergunta, enviar o formulário vazio (erros) e preenchido (enviando, enviado).
7. Rolar com o cursor parado no meio da tela: nenhum hover acende no caminho.
8. Repetir com movimento reduzido ligado no sistema.
9. Console sem erros; `npm run build` passa.

## Personalizar

O site chega como a demo do Pátio, uma marca inventada. Esta seção vale sempre que a pessoa pedir uma mudança, hoje ou daqui a meses: trocar a marca, um texto, uma foto, uma tela do app, ou levar uma peça para outro site.

### Antes de mexer
- Se ainda não sabe o objetivo, pergunte qual destes é (uma pergunta por vez, em linguagem simples):
  1. **Ver a demo funcionando** como está, para trocar depois.
  2. **O site da minha marca**, com esta estrutura e estas animações.
  3. **Só algumas peças** (o carrossel do hero, as telas do app, o card de preço, o formulário) para um site que já existe.
- Para o caminho 2, pergunte o que ainda não sabe: nome do app, o que ele faz e para quem, preço e condições, cores e logo (se tiver), números reais de uso, e **que material a pessoa já tem** (prints do app, fotos de prédios). Não peça tudo de uma vez.
- Para o caminho 3, pergunte quais peças e onde fica o site de destino. Leia o código do destino antes: se for React, Next ou outro framework, adapte o módulo de `src/motion/` ao framework em vez de colar o HTML desta página.
- Diga com clareza o que muda só com texto e o que depende de material novo (tabela abaixo). Não há vídeo nem 3D: o que é visual são fotos (trocar o arquivo) e telas do app em HTML (editar o texto e os números).

### O que muda e onde
| o quê | onde | precisa de material novo? |
|---|---|---|
| Nome, textos, títulos, perguntas, links, rodapé | `src/sections/*.html` (`hero`, `lados`, `numeros`, `preco`, `perguntas`, `teste`, `rodape`, `nav`) | não |
| Logo | `.logo` em `src/sections/nav.html` (nav e menu), `rodape.html` e `entrar.html` (quadrado + nome), e `public/favicon.svg` | só se a marca já tiver um logo |
| Cores, fontes, tamanhos, raios, curvas | `src/styles/tokens.css` (a página inteira usa os tokens) | não |
| As quatro funções do carrossel (título, frase, legenda, widget) | `li[data-cartao]` em `src/sections/hero.html` (a legenda do contador fica em `data-legenda`) | não; foto nova se a função mudar |
| Ritmo do carrossel | `AUTO_MS` em `src/motion/carrossel.js` (troca sozinha) | não |
| Painel do síndico (nomes, números, agenda) | `src/telas/painel.html`; os avisos que chegam sozinhos em `EVENTOS` (`src/motion/painel.js`) | não; prints do app real, se quiser trocar por imagem |
| App do morador (telas, nome digitado) | `src/telas/celular.html` (três `section[data-tela]`); o roteiro e os tempos em `volta()` (`src/motion/celular.js`) | não |
| Números de uso | `src/sections/numeros.html` (`data-conta` é o valor final) | não; números reais da marca |
| Preço por unidade e faixa da calculadora | `POR_UNIDADE` em `src/motion/preco.js`; `min`, `max` e `value` do `input[data-range]` e o total inicial em `src/sections/preco.html` | não |
| Envio do formulário | `enviar()` em `src/motion/form.js` (hoje simulado: troque pelo envio de verdade: WhatsApp, e-mail, planilha) | não |
| Fotos | `public/img/` (mesmo nome, mesmos tamanhos; ver `arquivos/receitas/LEIA.md`) | sim: fotos novas |
| Tirar uma seção | apague o include em `index.html`, o import do CSS e a chamada dela em `src/main.js`; confira a passagem entre as vizinhas | não |

### Material da pessoa
Para cada foto, ofereça estes caminhos, do mais simples para o mais trabalhoso, e deixe a pessoa escolher:
1. **Manter a foto da demo por enquanto** e trocar o resto. O site fica pronto hoje.
2. **Usar fotos que ela já tem** (o condomínio de um cliente com autorização, o prédio da administradora). Antes de trocar, confira: mesma proporção da vaga (cards em retrato ~0,85:1; fotos largas em paisagem 3:2, com um recorte vertical para o celular), boa resolução (2900 px de largura nas fotos largas, 1300 px nos cards), luz parecida entre as fotos, nada de logo, placa ou rosto em primeiro plano. Rode `node arquivos/fonte/fotos.mjs` (ajustando os recortes no topo do arquivo) para cortar, igualar a cor e exportar. Foto que não serve (escura, tremida, de celular na vertical numa vaga horizontal) estraga a seção: diga isso e proponha o caminho 3.
3. **Gerar fotos novas para os cards** com o estilo comum de `arquivos/receitas/estilo.txt` mais um assunto por card (a receita está no `LEIA.md`), em qualquer gerador de imagem. Ou **escolher fotos de banco** com licença livre (Unsplash sem o selo Unsplash+, ou Pexels), seguindo o que cada vaga pede em `arquivos/receitas/LEIA.md`: área verde para reservas, entrada para portaria, piscina ou jardim para boletos, salão ou espaço gourmet para avisos, vista de cima para o fundo de "Dois lados", céu claro com prédios para o teste grátis.
4. **Sem foto nenhuma** numa vaga: o card do carrossel mostra o fundo liso dele (bege) com o título branco sobre a sombra, e a seção "Dois lados" mostra o fundo verde-escuro da moldura com o título branco. Funciona e continua legível, mas fica visivelmente incompleto: use só enquanto a foto não chega.

As telas do app são texto: troque nomes, números e itens no HTML. Se a pessoa preferir mostrar o app real, use prints dela no mesmo enquadramento (painel em paisagem, celular reto), em WebP, no lugar do HTML.

### Regras ao trocar
- As regras de motion continuam valendo: rolagem que nunca para, título em 2 linhas no máximo (quebre com `span.linha`), texto nunca preso à rolagem, folhas sem entrada.
- A única cor continua sendo uma: se a marca tiver outra cor principal, ela substitui o verde em `--green` e nos tons derivados; não some uma segunda.
- Os textos dos cards do hero ficam em duas linhas curtas; o widget mostra um estado real da função (reserva confirmada, visita liberada, boleto pago, aviso lido).
- Nada de número, preço, nome de condomínio ou depoimento inventado como se fosse da marca: o que a pessoa não informou fica marcado como `[preencher]` e entra na lista do fim.
- Depois de cada troca, rode o "Como checar" de novo nos trechos que mudaram, e no fim liste para a pessoa o que ficou da demo (fotos, textos, números) e o que falta ela mandar.
