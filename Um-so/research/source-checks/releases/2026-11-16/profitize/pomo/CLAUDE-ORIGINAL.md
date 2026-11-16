# Guia do projeto — Pomo

(Salve como `CLAUDE.md` na raiz do projeto se você usa o Claude Code, ou como `AGENTS.md` se usa o Codex, o Cursor ou outro agente. O conteúdo é o mesmo.)

Landing page da Pomo, uma marca fictícia de sucos integrais de pomar próprio ("do pé para a garrafa, no mesmo dia"), com dez sabores. Vite sem framework, GSAP, Lenis, matter.js e três fontes gratuitas (Zodiak, Bodoni Moda e Figtree). **Funciona como um site de duas páginas sem corte entre elas:** a home é uma tela só, com a fila das garrafas (a roda, o trackpad e o dedo andam a fila; a página não rola), e o clique numa garrafa abre a página do produto, que rola, com a mesma garrafa descendo até o pé da tela e depois subindo por cima do nome. **As garrafas parecem 3D e não são: cada uma é a foto do vidro sem rótulo, e o rótulo, desenhado em código a partir do `src/config.js`, é enrolado num cilindro iluminado por um WebGL só, compartilhado.** Girar a garrafa é deslizar a arte no cilindro. O código já vem pronto em `arquivos/src/`, a página no `arquivos/index.html` e as imagens em `arquivos/public/`: o trabalho é montar, conferir e, depois, personalizar. A régua é site de premiação: se algo parece "ok", ainda não está pronto.

## Arquitetura
- **Uma seção por arquivo.** O `index.html` só tem o `<head>`, a tela da abertura, o rótulo do cursor e a ordem das seções (`<!-- @secao hero -->` etc.); o plugin `secoes` do `vite.config.js` troca cada marca pelo `src/sections/<nome>.html` no dev e no build. Cada seção tem o seu CSS ao lado. Ordem: `nav`, `menu`, e no `<main>` o `hero` (a home) e, depois dele, as seções da página do produto (`sabor`, `fotos`, `sabores`, `pomar` em três seções e `safra`); depois do `<main>`, `rodape` (com `data-produto`), que também é da página do produto.
- **Os dois modos** (`src/motion/troca.js`): `html.modo-inicio` (a home: o `hero` é fixo por cima de tudo, a página não rola, o Lenis fica parado e as seções da página do produto ficam `inert` por baixo) e `html.modo-produto` (o `hero` some e a página rola). O script do `<head>` escolhe o modo pelo endereço: sem nada, a home; com um sabor (`#uva`) ou uma seção (`#safra`), a página do produto. Cada sabor aberto entra no histórico, e o voltar do navegador refaz o caminho.
- **O CSS é uma folha só**, `src/styles/site.css` (por `@import`: as fontes, `tokens.css`, `base.css`, `pecas.css` e as seções), ligada por `<link>` no `<head>`. Antes dela, inline: o script que liga o tema (`?tema=`) e a abertura, a cor de fundo da primeira pintura, a tela da abertura e o "nada transiciona até assentar". Nunca importe CSS pelo JS: no dev do Vite ele chega depois dos módulos e a página pinta crua por um instante a cada recarregamento.
- **Módulos**:

  | arquivo | o que faz |
  |---|---|
  | `src/config.js` | **tudo o que muda de uma marca para outra**: `MARCA` (nome, linha do logo, frase do anel, texto do selo, volume, WhatsApp, e-mail) e `SABORES` (cada sabor: nome, complemento, cores do rótulo, frutas de papel, foto da garrafa, textos da ficha, tamanhos, validade e os meses da safra) |
  | `src/main.js` | liga tudo nesta ordem: rolagem (Lenis + freio da roda), barra, rótulo do cursor, os rótulos, o sabor, a fila do hero, a troca, nav e menu, links internos, a galeria, o pomar, a safra, o rodapé, a grade e, por último, a abertura |
  | `src/motion/troca.js` | a home e a página do produto: o modo, a roda e o teclado na home, o voo da garrafa clicada (da fila ou de um card) até o pé da página do produto, o véu creme da troca de sabor, a volta à home (logo, "Início", voltar do navegador), o histórico e os links de seção |
  | `src/marca/cilindro.js` | o WebGL compartilhado: um tubo iluminado, o shader com o deslocamento do rótulo (`uGiro`) e a faixa sem rótulo (`uLacuna`); desenha e copia para o canvas 2D de cada garrafa |
  | `src/marca/garrafa.js` | a garrafa (foto + canvas), as medidas de cada foto (`garrafas.json`), o gerenciador dos rótulos (uma arte nova por quadro, só redesenha o que mudou) e a reserva em 2D sem WebGL. `LACUNA` e `INCLINACAO` no topo |
  | `src/marca/rotulo.js` | a arte plana do rótulo de cada sabor, desenhada num canvas com as fontes do site |
  | `src/marca/frutas.js` | os contornos das frutas de papel (gerado por `arquivos/fonte/frutas.mjs`; não editar à mão) |
  | `src/motion/fila.js` | a fila da home: posições em laço, a do meio maior e acesa (com a classe `is-meio`), molas por garrafa, arrasto com embalo (no toque, de lado ou de pé), a roda empurrando a fila (`empurra`), o reajuste (parada há `AJUSTE_ESPERA` e sem o mouse em cima de uma garrafa, uma mola bem leve leva a garrafa mais perto até o meio; `AJUSTE_K`), a pílula "Arraste" só na faixa das garrafas, o ímã do cursor, a volta inteira do rótulo no hover, o teclado e o clique; cada garrafa guarda a pose da tela (`pose`), de onde ela sai no voo. Constantes no topo: `DEGRAU`, `VEL_MAX`, `CICLO`, `ESPERA_HOVER` |
  | `src/motion/abertura.js` | a abertura: as frutas com física (matter.js), o contador que é o carregamento de verdade e a varredura; `MIN_MS` e `MAX_MS` no topo |
  | `src/motion/sabor.js` | o alto da página do produto: troca o sabor (`mostra`), mede o nome para caber em duas linhas, a garrafa subindo presa à rolagem, o voo (`voa`: a garrafa sai da cena para uma camada fixa e pousa no pé, na mesma pose que a rolagem desenha com a página no alto) e o nome por máscara (`titulo`) |
  | `src/motion/sabores.js` | os cards da grade, montados do config, com o hover das frutas (`POUSOS`) |
  | `src/motion/fotos.js`, `pomar.js`, `safra.js`, `rodape.js` | a galeria (fila sem fim levada por transform, arrasto com embalo de no máximo uma foto, encaixe da foto mais perto no meio, paralaxe); a foto que cresce, as frutas em paralaxe (`FRUTAS_POMAR`) e o mote; a tabela da safra pelo mês de quem visita; o nome gigante medido para caber e os links do pedido |
  | `src/motion/nav.js`, `cursor.js`, `smooth.js`, `guia.js`, `rolando.js`, `scrollbar.js`, `ease.js` | a nav (presa ao alto da página: rola embora com ela e não volta no meio da rolagem) e o menu; o rótulo do cursor; Lenis no relógio do GSAP; o teto de velocidade da roda (`AVANCO`); hover desligado ao rolar; barra de rolagem própria; curvas, molas e `rolarAte` |
- **Endereço**: `?pronto` abre sem a abertura; `#laranja` (qualquer `id` de sabor) abre direto a página do produto daquele sabor e `#safra` (qualquer seção) a página do produto já nela (úteis para trabalhar nas seções de baixo); `?tema=anil | uva | vermelho` troca a paleta ao vivo.

## Design system
- **Cores são papéis, não nomes de cor** (`src/styles/tokens.css`): `--pagina` `#fbf3e6` (creme: a home, o alto da página do produto e o véu da troca, todos na mesma cor para a troca não ter corte); `--tinta` `#173f2a` (texto); `--forma` `#173f2a` (o pomo da home e o rodapé); `--forma-tinta` (texto sobre a forma); `--destaque` `#ff6a1a` (títulos, varredura, menu, anel, botões); `--apoio` (texto secundário); `--card` (cards em repouso); `--pilula` (pílulas e o rótulo do cursor).
- **Cada sabor traz as cores dele** no `config.js`: `fundo` (o claro do rótulo, e o card aceso), `fruta`, `folha`, `detalhe` e `semente` (a fruta de papel), `faixa` e `letra` (a faixa de baixo do rótulo), `card`.
- **Tipo**: **Zodiak** variável (Fontshare: títulos em caixa alta, peso 400, o contador, o anel, os nomes dos cards, o menu e o nome do rodapé; o itálico no "sucos do pé" do rodapé), **Bodoni Moda** só no logo da nav (é o mesmo do rótulo das garrafas e das fotos) e **Figtree** variável (texto e interface, 400/600; rótulos em caixa alta a 12–13 px com espaçamento). Nunca abaixo de 12 px. O nome do sabor fica sempre em duas linhas: `sabor.js` reduz o corpo só quando a linha mais larga não cabe.
- **Pílula** (`.pilula`, em `pecas.css`): no hover cresce com mola, escurece e o texto sai por cima enquanto a cópia entra por baixo (por isso o texto aparece duas vezes no HTML, a segunda com `aria-hidden`); no clique afunda.
- **Folhinha**: a folha de papel é o enfeite da marca (separador da ficha e do texto, ícone da pílula do cursor, bola da nav, itens do menu).
- **Escala**: as seções comuns usam `--su` (1 px de design até 1280 de largura, encolhe abaixo; nunca cresce): título de seção 64 px no desktop e 40 no celular, corpo 16–19. A home, o alto da página do produto, a galeria, a foto do pomar, as frutas do pomar e o rodapé são cenas (`data-cena`) e acompanham a tela.

## As garrafas e os rótulos
- Cada garrafa é um `<div class="garrafa">` com a `<img class="garrafa__vidro">` (o vidro sem rótulo, WebP com fundo transparente) e um `<canvas class="garrafa__rotulo">` por cima, no mesmo tamanho. `--asp` é a proporção da foto.
- `src/marca/garrafas.json` guarda, para cada foto, a largura, a altura e o **corpo reto** (`topo`, `base`, `esq`, `dir`, em frações da imagem): é onde o rótulo encosta. `geometria()` tira dali a faixa do rótulo, o raio do cilindro e a proporção da arte. Esse arquivo é gerado por `arquivos/fonte/garrafas.mjs`: não chute os números.
- O rótulo é desenhado **uma vez por sabor** (`rotulo.js`) e sobe para a GPU; a partir daí cada garrafa só pede "desenhe com este giro" (`giro` em voltas: 0 é a frente, 0,5 as costas). Uma garrafa só redesenha se estiver na tela e o giro mudou, e no máximo uma arte nova é criada por quadro (desenhar e subir uma arte leva ~10–25 ms).
- **Um WebGL para tudo**: nunca crie um contexto WebGL por garrafa (o navegador limita a ~16 e perde os mais velhos). Sem WebGL, `garrafa.js` enrola a arte em 2D, em fatias, com uma sombra lateral.
- O cilindro é inclinado de leve (`INCLINACAO`, a câmera da foto olha um pouco de cima): as bordas do rótulo fazem um sorriso, como no vidro de verdade. `LACUNA` é a fração da volta sem rótulo, onde aparece o suco.

## Regras de movimento
- **A física da abertura anda em passo fixo** (1/120 s, com o resto guardado para o quadro seguinte) e com mais iterações de contato que o padrão do matter.js: com passo variável, a pilha de polígonos treme e troca de lugar em vez de assentar. O DOM de cada fruta só muda quando ela anda mais de meio pixel.
- **A abertura é o carregamento**: o contador anda pelo tempo (100% em `MIN_MS`, ~1,7 s) e espera em 92% até as fontes, as fotos das garrafas da primeira tela e os rótulos delas estarem prontos; as frutas caem com física e, quando assentam (ou em ~2,7 s), a varredura sobe e descobre a home, que entra por baixo. Rolar, tecla ou dedo arrastando levam ao fim; clique empurra as frutas. Nada pesado roda na carga: os rótulos são criados um por quadro.
- **A fila** anda por molas no relógio do GSAP: a roda e o trackpad nos dois sentidos (a home não rola), arrastar (no toque, de lado ou de pé), as setas do teclado. O gesto é livre e com embalo, e a fila para onde ele deixar. **Parada há 1,6 s** (e sem o mouse em cima de uma garrafa), ela faz um reajuste leve: a garrafa mais perto desliza até o meio numa mola mole, que parte parada, não passa de ~90 px/s e leva ~1,8 s. Fora isso, a fila não anda sozinha. O rótulo gira contra o movimento e volta à frente quando a fila para.
- **A troca não tem corte, e a garrafa nunca sai de cena.** O clique numa garrafa da fila: as outras, o pomo e o anel somem em ~0,4 s; a garrafa do produto aparece exatamente sobre a clicada (centro, altura, inclinação e o giro do rótulo, guardados em `pose`), e a clicada some no mesmo quadro; ela desce até o pé da tela em ~0,95 s, de costas, dando entre meia e uma volta e meia no rótulo; o nome entra por máscara, linha a linha, quando ela chega. O card da grade faz o mesmo de onde estiver, com um véu creme cobrindo a página enquanto ela volta ao alto. A página do produto, a home e o véu têm a mesma cor.
- **A garrafa do produto** sobe presa à rolagem (é objeto: pode ser scrub, amortecido pelo Lenis) e a pose dela com a página no alto é a mesma em que o voo pousa; os textos entram por marco, nunca pela posição da rolagem.
- **Hover só com movimento de verdade do mouse.** Enquanto a página rola, o hover descansa (`html.is-scrolling`, de `rolando.js`): a rolagem passando um card por baixo do cursor parado não acende nada.
- **A rolagem nunca para sozinha** na página do produto: o freio (`guia.js`) só limita a velocidade da roda (~2 telas por segundo); no toque, a rolagem é a nativa do aparelho, e `rolarAte` usa a rolagem nativa do navegador (o Lenis não conduz o dedo). Na home o Lenis fica parado o tempo todo (a abertura e o menu não o religam ali).
- **Toque**: o navegador manda um `pointerleave` assim que o dedo levanta; quem apaga coisas ao sair do ponteiro confere `pointerType === 'mouse'`.
- **Primeira pintura**: a tela creme da abertura está no HTML e a cor dela no `<style>` do `<head>`; `html:not(.assentou) *` fica sem transição até o `main.js` marcar `assentou`, dois quadros depois.
- `prefers-reduced-motion`: sem abertura, sem Lenis, a fila sem entrada, a troca sem voo (um véu rápido), a garrafa do produto já assentada, a foto do pomar já cheia e as frutas paradas.

## Celular: regras que não se quebram
- **Nunca rolar para o lado.** `overflow-x: clip` no `html` e no `body` é só a rede de segurança (`clip`, não `hidden`, que quebra o `sticky`); se algo vazar, conserte a origem. As frutas dos cards podem passar da borda do card, nunca da tela (a seção recorta).
- **O script nunca briga com o dedo**: Lenis sem `syncTouch`, nenhum `scrollTo` enquanto o dedo ou a inércia rolam. Na home a página não rola (`overflow: hidden` no `html` e no `body`) e o hero usa `touch-action: none`: o dedo, de lado ou de pé, anda a fila. Na página do produto a rolagem é a nativa.
- **Alturas em `svh`**, nunca `100vh` nem `dvh` (a barra do Safari some e volta). As medidas de cena vêm de `alturaTela()` (`ease.js`), que lê o `100svh`. Conferir em 390 × 844, 393 × 659 e 375 × 553.
- **Memória**: os rótulos ficam na GPU (um por sabor) e o canvas de cada garrafa tem no máximo 1,6× (hero) ou 2× (sabor e cards) o tamanho em CSS. Não suba a densidade nem a `largura` da arte no celular.
- Hover só dentro de `@media (hover: hover)`; alvos de toque de 44 px (as pílulas crescem a área por `::after` sem mudar o desenho).

## Como checar
- `npm run build` sem aviso de arquivo faltando.
- `npx vite preview`: console limpo; a abertura roda inteira em tempo real (as frutas caem e enchem a tela por cima do contador, a varredura sobe, o pomo verde nasce do pé e as garrafas entram da esquerda para a direita, cada rótulo dando uma volta); recarregar nunca mostra a página crua; `?pronto` abre direto.
- Na home, com o mouse: a roda e o trackpad andam a fila e a página não rola; a garrafa mais perto do cursor vira o rótulo para ele e é puxada; parado sobre uma, o rótulo dá uma volta inteira e aparece a pílula "Ver o sabor"; arrastar anda a fila com embalo e os rótulos giram contra o movimento.
- O clique numa garrafa: a fila e o pomo somem, a mesma garrafa desce até o pé da tela girando o rótulo (sem pular de tamanho nem de lugar no começo e no fim), o nome entra por máscara e o endereço vira `#<sabor>`; o logo e o voltar do navegador levam de volta à fila, com o sabor aberto no meio.
- Rolando a página do produto de cima a baixo, devagar e depressa: a garrafa sobe do pé, gira das costas para a frente e para por cima do nome; a ficha; a galeria arrasta; na grade, o hover inclina o card, troca a cor e solta as frutas, e o clique num card leva a garrafa dele até o alto da página com o sabor novo; a foto do pomar cresce até a tela cheia e a frase entra; as frutas passam em velocidades diferentes em volta do mote; a safra mostra o que dá neste mês e a outra aba o que vem depois; o nome gigante do rodapé cabe inteiro.
- Rótulos: em todas as garrafas, a marca, o nome do sabor e a faixa legíveis, sem fio cinza na beirada do vidro sobre o verde do pomo.
- Celular (390 px) e o `dist/` numa subpasta, com um servidor estático de verdade (o prompt diz como): sem 404 e sem rolagem para o lado.
- Em conferência automática (navegador sem janela), a home se confere com `?pronto` e a página do produto com `#laranja` (ela abre direto, sem a home). Leve a página com `window.scrollTo(0, y)`, esperando 1,5 s a cada parada (os textos entram por marco em até 1 s), em vez de simular a roda: o freio segura a roda em ~2 telas por segundo e um teste apressado não chega ao fim da página.

## Personalizar

Vale para qualquer mudança, agora ou depois.

### As três perguntas
1. É a demo, a marca da pessoa (suco, refrigerante artesanal, kombucha, chá gelado, geleia, conserva, cosmético em pote: qualquer produto em embalagem cilíndrica com vários tipos) ou peças soltas?
2. Que material ela já tem (logo, nome dos produtos, cores, fotos do produto, fotos do lugar, o número do WhatsApp) e o que falta?
3. O que ela quer manter da demo (a abertura com as frutas, a fila de garrafas na home, a passagem da garrafa para a página do produto, a grade com o hover, o pomar, a safra)?

### O que muda e onde

| o quê | onde | precisa de material novo? |
|---|---|---|
| Nome, linha do logo, frase do anel, selo, volume | `MARCA` em `src/config.js` (o rótulo, o anel e o nome do rodapé leem dali) **e** o texto em `src/sections/nav.html` (o logo e o `aria-label`), `index.html` (`<title>` e `description`) e os `alt` em `fotos.html` e `pomar.html` | não: os rótulos se redesenham sozinhos |
| Os sabores (nome, cores, frutas, ficha, safra) | `SABORES` em `src/config.js`: cada item gera a garrafa da fila, a página do produto, o card da grade, a linha da safra e o rótulo. O `id` não pode repetir e vira o endereço da página do produto (`#uva`), então não pode ser igual ao `id` de uma seção (`sabor`, `sabores`, `pomar`, `safra`, `comprar`, `topo`); `garrafa` é o arquivo em `public/garrafas/` | só se a cor do produto não existir entre as garrafas da demo (abaixo) |
| Quantos sabores | a mesma lista, de 3 a 12: com menos de dez, a fila do hero repete a lista para fechar a volta na tela larga (as cópias ficam fora do teclado e do leitor de tela); a grade é de 5 colunas no desktop e 2 no celular, então 5 ou 10 fecham as linhas | não |
| Símbolo | o `<svg class="nav__simbolo">` de `nav.html`, o do rodapé em `rodape.html` e `public/favicon.svg` | se for o logo da pessoa: o SVG dela |
| O pomo do hero | o `<svg class="hero__pomo">` de `hero.html` (gerado por `arquivos/fonte/frutas.mjs`, no fim: `forma-hero.json`) | não |
| Textos das seções | `hero.html` (o `h1`), `sabor.html` (os rótulos laterais), `pomar.html` (título, frase da foto, parágrafo e mote), `safra.html` (título e introdução) e `rodape.html` | não |
| WhatsApp e e-mail | `MARCA.whatsapp` (só dígitos: 55 + DDD + número) e `MARCA.email`; os links com `data-whatsapp` e `data-email` usam esses dois | o número da pessoa |
| Cores | `src/styles/tokens.css` (os papéis) **e** a cor repetida no `<style>` do `index.html` (`--pagina`, que é a primeira pintura) e o `theme-color` | não |
| Outra paleta pronta | veja com `?tema=anil`, `uva` ou `vermelho`. Para adotar uma: copie os valores da classe `.tema-*` para o `:root` do `tokens.css`; depois apague as classes `.tema-*` dos dois arquivos e a lista do script do `<head>` | não |
| Fontes | `src/styles/fontes.css` (a Zodiak por `@font-face`, de `src/fonts/`; as outras por `@import`) e `--serifa` (títulos), `--marca` (o logo) e `--sans` em `tokens.css`; o rótulo das garrafas usa `SERIFA` e `SANS` no topo de `rotulo.js` (Bodoni Moda e Figtree, as mesmas do logo). A Zodiak é do Fontshare (licença FFL: uso comercial liberado, o arquivo não se repassa) | não |

### Material da pessoa

As garrafas e as fotos são imagens prontas. **O rótulo não é**: ele sai do código, então mudar o nome da marca, um sabor ou uma cor não precisa de imagem nova. Para cada peça, do mais simples ao mais trabalhoso:

- **Garrafas** (`public/garrafas/<nome>.webp`, até 1100 px de altura, e `<nome>-640.webp`, com fundo transparente; vidro **sem rótulo**):
  1. usar as da demo: são vidro liso com suco de doze cores (laranja, uva, maracujá, caju, goiaba, abacaxi, limão, manga, melancia, jabuticaba, tangerina, acerola). Um sabor novo usa a de cor mais parecida (`garrafa: 'uva'` para açaí);
  2. gerar novas com os prompts de `arquivos/receitas/` (o `LEIA.md` explica a ordem: três garrafas por imagem, a primeira leva como referência das outras);
  3. fotografar a embalagem da pessoa **sem rótulo**, de frente, sobre fundo liso e claro. Funciona com outra garrafa, pote ou frasco, desde que o corpo seja um cilindro reto.

  Em qualquer caso, salve as imagens em `arquivos/fonte/bruto/` e rode, da raiz do projeto, `npm install -E -D sharp@0.35.5` e depois `node arquivos/fonte/garrafas.mjs`: ele recorta, limpa a beirada do vidro, grava os dois tamanhos e **mede o corpo** em `src/marca/garrafas.json` (o site lê dali onde o rótulo encosta).
- **Fotos da galeria** (`public/fotos/mesa`, `maracuja`, `cafe`, `caixote`, `verao`, 3:2, 1536 px, mais `-1200` e `-800`): mostram as garrafas com o nome POMO. **Com outra marca, troque as cinco** ou tire a seção (apague `<!-- @secao fotos -->` do `index.html`). Fotos reais do produto da pessoa funcionam melhor que geradas; para gerar, anexe a garrafa já com o rótulo dela (a página `arquivos/fonte/garrafa.html` monta a imagem; o `LEIA.md` explica). Depois, `node arquivos/fonte/fotos.mjs`.
- **Foto do pomar** (`public/fotos/pomar`): fileiras de laranjeiras sem marca, serve para qualquer pomar ou sítio. Uma foto do lugar da pessoa, na horizontal, fica melhor.
- **Frutas de papel**: as treze da demo (`src/marca/frutas.js`) cobrem os dez sabores. Para outra fruta, o `LEIA.md` explica como desenhar no `arquivos/fonte/frutas.mjs`.

### Regras ao trocar
- Nada de dado inventado como se fosse da pessoa: a tabela nutricional do rótulo, o CNPJ, o código de barras, os meses da safra, a validade, o "doze pés de laranja" do pomar e o número do WhatsApp são exemplos. O que ela não mandou fica `[preencher]` (nunca no `h1` do hero nem no nome do sabor). A tabela nutricional de verdade vem do laudo do produto.
- Mantenha o que dá o efeito: a garrafa inteira, de frente, sem rótulo na foto; um rótulo por sabor, com a cor dele; a do meio da fila maior e acesa; a home de uma tela só e a mesma garrafa indo da fila até a página do produto (a home, o alto da página do produto e o véu na mesma cor); o nome gigante atrás da garrafa; as frutas de papel como linguagem (abertura, cards, pomar, safra).
- O número do WhatsApp da demo é de exemplo e não leva a lugar nenhum: troque antes de publicar e diga isso à pessoa. O pedido não é uma loja: abre a conversa com o recado escrito.
- Nada de cidade real na demo; no site da pessoa, use o endereço dela.
- Termine com a lista do que ainda é da demo: fotos da galeria (com a marca POMO), textos, tabela nutricional, número do WhatsApp, CNPJ.
