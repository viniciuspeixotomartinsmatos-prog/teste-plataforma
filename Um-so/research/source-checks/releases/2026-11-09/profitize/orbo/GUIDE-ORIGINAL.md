# Guia do projeto — ORBO

(Salve como `CLAUDE.md` na raiz do projeto se você usa o Claude Code, ou como `AGENTS.md` se usa o Codex, o Cursor ou outro agente. O conteúdo é o mesmo.)

Landing page da ORBO, uma estética automotiva fictícia (lavagem detalhada, polimento, vitrificação, PPF, higienização interna e faróis) que agenda pelo WhatsApp. Vite sem framework, Three.js, GSAP, Lenis e a fonte Archivo pelo Fontsource.

**A jogada é um carro só, visto de cima, preso no centro, com o mundo mudando em volta dele.** Ele chega empoeirado na abertura e uma faixa de luz deixa a pintura limpa. Depois a meia-lua preta cresce e engole o azul, o papel sobe por trás e o carro vira desenho técnico, com a área de cada serviço acesa. No fim, ele sai dirigindo quando o rodapé aparece. A régua é site de premiação: se uma animação parece "ok", ainda não está pronta.

## Arquitetura

### HTML e CSS

- **O `index.html` tem todas as seções**, nesta ordem:
  1. `nav` e `#menu`;
  2. a cena presa `.cena`, com a abertura, o hero e o mapa `#servicos`;
  3. `.trabalhos`, `.estudio`, `.parede` (as avaliações) e `.duvidas`;
  4. o fecho `.fecho`;
  5. o rodapé `.rodape`;
  6. o `<canvas class="palco">`.
- **O CSS** está em `src/styles/` e `src/sections/`:
  - `tokens.css` e `base.css`: as cores, as escalas e o reset;
  - `nav.css`: a nav e o menu;
  - `botao.css`: a pílula com a seta;
  - `cena.css`: a abertura, o hero e o mapa;
  - `secoes.css`: trabalhos, estúdio, avaliações, dúvidas, fecho e rodapé.
- **Duas escalas** (`src/styles/tokens.css`):
  - `--u` é a escala de cena: 1 px num quadro de 1456 × 840, que cabe inteiro na tela. Valem por ela o hero, o mapa, o fecho e os trabalhos.
  - `--su` é a escala de site: 1 px a partir de 1280 de largura, que só encolhe abaixo disso. Valem por ela as seções comuns, com os tamanhos dos tokens (`--s-h2` 60, `--s-h2-fecho` 78, `--s-corpo` 18...), nunca px soltos.
  - No celular (até 1023 px, ou tela em pé com proporção até 4:5), as duas escalas partem de 390 × 844.

### O palco 3D (`src/gl/palco.js`)

- **Um canvas fixo** (`.palco`, z-index 3) desenha o carro ao vivo. Ele fica por cima da cena presa (z-index 1) e do fecho (2), e por baixo das seções comuns (`.secao`, z-index 4, fundo opaco), que passam por cima dele. Só desenha quando a cena ou o fecho estão na tela (`estado.ativo`, em `src/main.js`).
- **Os módulos de motion só mexem no `palco.estado`:**
  - `vagaA`, `vagaB` e `mistura`: as caixas da página onde o carro se encaixa (`.hero__vaga`, `.mapa__vaga`, `.fecho__vaga`) e quanto ele já foi de uma para a outra. O carro cabe no comprimento da caixa; caixa em pé deixa o carro de bico para cima (celular).
  - `desenho`: de 0 (o carro) a 1 (o desenho técnico).
  - `zona` e `zonaMix`: a área acesa e a fusão da anterior para ela.
  - `raioX`: a força das linhas do interior.
  - `poeira` e `varredura`: a pintura suja e a faixa de luz da abertura.
  - `desloc`: quanto o carro andou para chegar ou sair.
- **Acabamento matcap chapado.** Cada parte do carro usa uma esfera de tons desenhada num canvas (`MC` em `palco.js`): o centro é a superfície virada para cima (teto, capô) e a borda é a lateral. Sem luz, sem reflexo, sem PBR. A pintura é um shader próprio, que mistura o matcap sujo (bege com ruído) e o limpo pela faixa diagonal (`varredura`) e desloca o brilho com o cursor (`apontar()`, numa mola).
- **Desenho técnico.**
  - O contorno sai da diferença de profundidade e de normal da casca do carro.
  - O interior é desenhado por baixo, em traço mais fraco, como se o teto fosse transparente.
  - Cada serviço tem uma máscara de área em `REGRAS` (`lavagem`, `polimento`, `vitrificacao`, `ppf`, `interior`, `farois`), que pinta a área de azul a 20% e as linhas dela de azul.
  - Contorno e máscaras só são refeitos quando a câmera, o tamanho ou a área mudam. `aquecer()` compila tudo em quadros ociosos no fim da abertura, senão a primeira entrada no mapa trava.
- **Nomes do modelo:** `classe()`, a caixa da cabine e as peças do PPF leem os nomes de malha e de material do DB11 (`public/modelo/db11.glb`). Outro modelo exige trocar esses nomes (veja "Outro carro", abaixo).

### Motion (`src/motion/`)

- `main.js`: a ordem de início e qual vaga vale em cada trecho (cena: hero → mapa; fecho: a vaga do card).
- `cena.js`: a cena presa.
  - **Pela rolagem, o contínuo:** a meia-lua cresce entre 3% e 17% da cena; o papel sobe entre 15% e 27%; o carro vai da vaga do hero para a do mapa entre 17% e 31%; vira desenho entre 25% e 33%.
  - **Por marco, com tempo fixo:** o hero sai em 3%, o título do mapa entra em 31% e os serviços entram a partir de 36%, um a cada 10%.
  - Cada `li.servico` usa três atributos: `data-zona` (a área em `REGRAS`), `data-ancora="fx,fz"` (o ponto do carro onde o fio termina, em frações do comprimento e da largura, frente = −0,5) e `data-lado` (`e`/`d`: a coluna do rótulo no desktop).
- `abertura.js`: a abertura por tempo (~2,4 s); qualquer gesto acelera 5×.
- `trabalhos.js`: o trilho preso à rolagem no desktop e a palavra com parallax.
- `parede.js`: a física das polaroides.
- `duvidas.js`: o acordeão, uma aberta por vez, com a altura animada.
- `fecho.js`: os blocos do título; o carro sai e volta.
- `nav.js`: o menu, os links e a cor da nav pelo fundo embaixo dela.
- `fotos.js`: carrega `data-foto="pasta/nome"` como `/img/pasta/nome.webp` perto da tela. A lista `FOTOS` diz quais existem; as outras ficam no cinza `#23252b`.
- `split.js`: a máscara de linha dos títulos (`entrar()`/`sair()`).
- `guia.js`: o teto de velocidade da roda.
- `smooth.js`: Lenis + ScrollTrigger num relógio só.
- `scrollbar.js`: a barra fina própria.
- `ease.js`: as curvas, e as constantes `REDUZIDO` e `CELULAR`.

### Arquivos e scripts

- **Fotos** em `public/img/` (WebP), geradas por `npm run fotos` a partir de fotos de banco (`fonte/fotos.mjs`; créditos em `fonte/FOTOS.md`): `trabalhos/01–06` (720 × 900), `estudio/01` (1760 × 990) e `parede/01–06` (640 × 480).
- **Modelo 3D:** `public/modelo/db11.glb` (Draco, 1,16 MB), preparado por `fonte/prepara_db11.py` no Blender.
- `fonte/` não entra no build.

## Design system

- **Cores** em `src/styles/tokens.css`, nunca soltas no CSS das seções:
  - azul elétrico `--azul #1238ff` em bloco (hero, trabalhos, card do fecho) e `--azul-fundo #0e2ad6` no hover;
  - `--preto #060607` (meia-lua, estúdio, avaliações, rodapé) e `--grafite #15161a`;
  - `--papel #f2f1ec` (desenho técnico, dúvidas) e `--tinta #10131c` (texto e linhas sobre o papel);
  - `--branco`, `--cinza #5b6170` e `--cinza-claro`;
  - a faixa da abertura é `#3d5bff`.
- **Cores no palco:** os tons do carro, a tinta e o azul do desenho estão em `src/gl/palco.js` (`MC`, `TINTA`, `AZUL`). Mudou o azul da marca: mude também o `AZUL`, a última parada de `MC.limpo` e `MC.vidro` (a borda que assenta o carro no fundo), o `theme-color` do `index.html` e o `favicon.svg`.
- **Tipo:** Archivo variável, importada em `src/main.js`.
  - `.larga` é largura 125%, peso 850 e caixa alta: no nome, nos títulos, nos serviços e nos links do menu. No celular a largura cai para 104%, para os títulos caberem em duas linhas.
  - O texto corrido usa largura 100, peso normal.
- **Peças comuns:**
  - `.botao` (`--claro`/`--escuro`): pílula com a seta num círculo azul. No hover, a seta sai pela direita e outra entra pela esquerda, e o fundo clareia um tom.
  - `.fundo-claro`: seção em papel; o foco fica azul.
  - `.servico__preco`: a pílula azul do preço.

## Regras de motion

- **Uma cena presa só** (hero → passagem → mapa), de 7,8 telas no desktop e 5 no celular. O que é contínuo segue a rolagem. Texto, área acesa e fio trocam por marco com tempo fixo: rolando rápido, cada marco termina inteiro e nunca fica meia linha na tela. Nunca prenda texto ao scrub.
- **A roda tem teto de velocidade** (`guia.js`, ~0,9 tela por segundo); a página sempre rola presa ao gesto e nunca para sozinha. No toque, a rolagem é a nativa.
- **Seção nova:**
  - entre a cena e o fecho, ela é `.secao` com fundo opaco, senão o carro aparece através dela;
  - uma seção que deva mostrar o carro precisa de uma vaga e de uma entrada no `onde()` do `main.js`.
- **Mais ou menos serviços:** `M.servico0 + n × M.passoServico` (`cena.js`) tem de terminar antes do fim da cena. Com 6, termina em 96%; com 8, use `passoServico` 0,075 ou aumente a altura de `.cena` em `cena.css`.
- **Títulos** com no máximo duas linhas. Nada de HUD, rótulo com traço, contador "01/06", "role para..." ou linha decorativa.
- **`prefers-reduced-motion`:** abre direto no hero, sem abertura e sem Lenis; as trocas acontecem sem animação (texto só com opacidade); o carro sai e volta sem andar.

## Celular (regras que nunca quebram)

O corte é `(max-width: 1023px), (max-aspect-ratio: 4/5)` (o iPad em pé usa o celular). A composição muda assim:

- **Hero:** o carro fica em pé entre o ORBO e a meia-lua.
- **Mapa:** o rótulo do serviço fica embaixo, de borda a borda, com o fio subindo até a área.
- **Trabalhos:** viram um trilho lateral nativo com encaixe (carta de 74% da largura), sem rolagem presa.
- **Avaliações:** ficam em duas colunas.
- **Cena presa:** 500 telas/100 em vez de 780.

Ao personalizar, estas regras continuam valendo:

1. **Nada rola para o lado**, em nenhuma altura e em nenhum momento (abertura, menu aberto, carro saindo). `html, body { overflow-x: clip }` é a rede de segurança. O trilho dos trabalhos rola dentro do próprio contêiner (`overflow-x: auto`).
2. **O script nunca briga com o dedo.** O Lenis fica sem `syncTouch` e nenhum `scrollTo` roda enquanto o dedo ou a inércia rolam. Os links do menu usam a rolagem nativa no toque.
3. **O palco não muda de tamanho rolando.** O canvas fica em `100lvh` e ignora mudança só de altura menor que 120 px no toque (a barra do Safari indo e voltando). O DPR fica em no máximo 1,5 no celular. Alturas de seção em `svh`, nunca `100vh`.
4. **Leve:** fotos em WebP nos tamanhos de `fonte/fotos.mjs`, modelo com Draco até ~2 MB. Alvos de toque de 44 px, títulos em no máximo duas linhas.

## Como checar

1. **Abrir.** Rode `npm run dev` (porta 5232) e olhe a 1456 × 840 e a 390 × 844, no Chrome e no Safari. Para o celular de verdade, `npm run dev -- --host`.
2. **Comparar.** Confira cada trecho contra o print de `arquivos/conceito/` (ou o novo desenho, depois de personalizar).
3. **A abertura** (recarregue a página). A faixa atravessa a tela escura e deixa o azul. O ORBO entra de lado saindo do borrão. O carro chega empoeirado pela direita e freia. A faixa de luz passa por ele e a pintura fica preta. O título e o botão entram por último.
4. **A cena, rolando devagar.** A meia-lua cresce, o papel sobe e o carro vira desenho. Cada um dos seis serviços acende a área certa, e o fio termina em cima dela. A higienização mostra o interior forte.
5. **A roda, rolando rápido.** O teto de velocidade segura a página, e cada marco termina inteiro.
6. **O resto da página.**
   - O trilho dos trabalhos (desktop) e o encaixe dele (celular).
   - As polaroides: pegar, jogar e bater na borda. No toque, o arrasto vertical rola a página.
   - As dúvidas, uma aberta por vez.
   - O título do fecho em blocos.
   - O carro saindo quando o rodapé aparece e voltando quando a página sobe.
7. **Os controles.** O menu abre e fecha com Esc. Cada link chega na seção certa (Serviços para no começo do mapa). O Tab mostra o foco em tudo.
8. **O resto.**
   - Com movimento reduzido, a página abre direto no hero.
   - O console fica sem erros.
   - `npm run build` passa.
   - No celular, nada rola para o lado em nenhuma altura.

## Personalizar

O site chega como a demo da ORBO, uma estética inventada. Esta seção vale sempre que a pessoa pedir uma mudança, hoje ou daqui a meses: trocar o nome, um serviço, um preço, uma foto, ou levar uma peça para outro site.

### Antes de mexer

- Se ainda não sabe o objetivo, pergunte qual destes é (uma pergunta por vez, em linguagem simples):
  1. **Ver a demo funcionando** como está, para trocar depois.
  2. **O site da minha estética** (ou lava-rápido, PPF, polimento, envelopamento) com esta estrutura e estas animações.
  3. **Só algumas peças** (o carro 3D que vira desenho técnico, o mapa de serviços com o fio até a área, o trilho de fotos na frente da palavra gigante, as polaroides arrastáveis, as dúvidas em caixas) para um site que já existe.
- **Para o caminho 2**, pergunte o que ainda não sabe, sem pedir tudo de uma vez:
  - o nome;
  - os serviços com o preço "a partir de";
  - o WhatsApp, o endereço (com ou sem cidade), os horários e as redes;
  - as dúvidas que os clientes mais fazem;
  - **que material já tem**: fotos de carros que entregou, do estúdio e avaliações reais com nome e carro.
- **Para o caminho 3**, pergunte quais peças e onde fica o site de destino. Leia o código do destino antes.
  - O carro é `src/gl/palco.js` mais o modelo: precisa de um canvas fixo, de uma caixa (`vaga`) na página e de alguém mexendo no `estado`, como `src/motion/cena.js`.
  - Em React ou Next, crie o palco num `useEffect` e chame `quadro()` no laço de animação.
- **Diga com clareza, sem rodeio:**
  - O carro 3D é um modelo pronto (um Aston Martin DB11 sem emblemas, com crédito obrigatório no rodapé). A cor muda no código; outro carro só com um modelo 3D novo, nunca por prompt.
  - As fotos dos trabalhos, do estúdio e das avaliações são fotos de banco, de carros e lugares que não são dela.
  - As avaliações, a nota do Google e os preços são inventados.

### O que muda e onde

| o quê | onde | precisa de material novo? |
|---|---|---|
| Nome, `<title>`, `description` | `index.html`: `<title>`, meta, `.nav__logo` (e o `aria-label`), `.hero__marca`, `.rodape__marca`, `.rodape__nome` e a linha do © | não |
| O nome gigante do hero | `.hero__marca`: um `<span>` por letra (a abertura anima cada uma). Nome mais longo: ajuste o `font-size` de `.hero__marca` em `cena.css` (248 no desktop, 96 no celular, em `--u`) até caber com folga e o carro cobrir só o pé das letras | não |
| Logo e favicon | `.nav__logo` é texto; `public/favicon.svg` | o SVG da marca, se houver |
| WhatsApp | todo `https://wa.me/5500000000000` do `index.html` (nav, menu, hero, fecho e rodapé), com o DDI e o DDD: `https://wa.me/55DDNUMERO` | não |
| Título e botão do hero | `.hero__titulo` (duas linhas com `<br>`; no celular quebra sozinho) | não |
| Serviços | cada `li.servico` do `#servicos`: nome, texto, preço; `data-zona` (uma das seis áreas de `REGRAS` em `palco.js`), `data-ancora` e `data-lado`; a lista do rodapé | não |
| Serviço novo com área nova | uma regra nova em `REGRAS` (`palco.js`) dizendo que peças acendem; o `li` com essa `data-zona`; o `M` em `cena.js` (veja "Regras de motion") | não |
| Trabalhos | cada `.carta`: legenda (`<b>` carro, `<span>` serviço) e `data-foto`; a lista `FOTOS` em `src/motion/fotos.js`; a vaga em `fonte/fotos.mjs` | sim: fotos (abaixo) |
| Estúdio | `.estudio`: rótulo, título, texto e o `aria-label` da foto; `estudio/01` | sim: a foto (abaixo) |
| Avaliações | cada `.polaroide`: a frase, `Nome · Carro`, a posição e a inclinação no `style` (`--x`, `--y` em % do mural, `--r`); `.parede__nota` | avaliações reais; fotos (abaixo) |
| Dúvidas | cada `details.duvida`: a pergunta no `summary > span`, a resposta no `p` | não |
| Fecho | `.fecho__titulo`: cada `<span>` é um bloco revelado; `.fecho__acoes` | não |
| Rodapé | `.rodape__grade` (frase, serviços, endereço, horários, contato), `.rodape__fim` | não |
| Menu | `#menu`: os links e o `.menu__pe` (horários) | não |
| Cores | `src/styles/tokens.css`; no carro e no desenho, `AZUL`, `TINTA` e `MC` em `palco.js` (veja "Design system"); `theme-color` e `favicon.svg` | não |
| Cor do carro | as paradas de `MC.limpo` em `palco.js`: centro (teto e capô), meio, lateral, e as duas últimas são a borda azul. Carro branco, por exemplo: `#ffffff`, `#e4e6ec`, `#c3c8d2`, `#8794d8`, `#2a42c8` (confira o contraste com o ORBO branco atrás dele) | não |
| Tirar uma seção | o `<section>` no `index.html`, a chamada dela no `src/main.js` (`trabalhos()`, `parede()`, `duvidas()`) e o link no menu e no rodapé | não |
| Outro carro | `public/modelo/`, `fonte/prepara_db11.py` e os nomes do modelo em `palco.js` | sim: um modelo 3D (abaixo) |

### Material da pessoa

Para cada peça visual, ofereça estes caminhos, do mais simples para o mais trabalhoso, e deixe a pessoa escolher.

**As fotos dos trabalhos** (as seis cartas de "Entregues")

1. **Fotos dos carros que ela entregou** (o melhor): em pé ou que recortem bem em 4:5, carro inteiro ou um detalhe forte (farol, roda, reflexo), luz boa, placa fora do recorte. Salve como `fonte/fotos/trabalhos/0N.jpg` e rode `npm run fotos -- trabalhos/0N`. Se o carro ficar cortado, ajuste o `foco` da vaga em `fonte/fotos.mjs`.
2. **Fotos de banco** com o mesmo clima (estúdio escuro, luz de LED, detalhe). As receitas e os termos de busca estão em `arquivos/receitas/LEIA.md`.
3. **Manter as da demo** por enquanto. O título diz "Carros que saíram daqui": com fotos de banco, isso não é verdade. Antes de publicar, ou entram fotos reais ou o título muda (por exemplo, "O acabamento que a gente entrega."). Diga isso à pessoa.
4. **Mais ou menos de seis cartas:** acrescente ou tire `li.carta` e as vagas em `fotos.js` e `fotos.mjs`. O trilho se ajusta sozinho. A inclinação de cada carta vem do `--r` e do `--dy` em `secoes.css` (`.carta:nth-child(...)`).

**A foto do estúdio**

1. **O box dela**, em paisagem, com pelo menos 1760 px de largura, luz de teto, e espaço livre embaixo à esquerda para a legenda. Salve como `fonte/fotos/estudio/01.jpg`; tire o `zoom` e mude o `foco` da vaga, porque o corte da esquerda era só da foto da demo.
2. **Foto de banco** de estúdio de detalhamento.
3. **O texto acompanha a foto:** se o box não é climatizado, a frase muda.

**As avaliações (polaroides)**

- Só entram avaliações reais, com o nome e o carro. A nota "5,0 no Google · 312 avaliações" só fica se for a dela; senão sai ou vira `[preencher]`.
- As fotos podem ser do carro do próprio cliente (com autorização) ou fotos de banco do mesmo modelo de carro, em 4:3. Com menos de seis, apague as polaroides que sobrarem e redistribua `--x`/`--y`. No celular, a grade de duas colunas é fixa em `secoes.css`.

**O carro 3D**

1. **Manter o DB11.** Serve para qualquer estética. O crédito do rodapé ("Modelo 3D: ... CC-BY 4.0") fica, porque a licença exige.
2. **Mudar a cor da pintura:** veja "Cor do carro" na tabela.
3. **Outro carro.** Precisa de um modelo 3D novo, gratuito, que fique bom visto de cima. Escolher, baixar e preparar no Blender está em `arquivos/receitas/LEIA.md`. No código, troque em `palco.js`:
   - os nomes de material e de malha em `classe()` (pintura, vidro, vidro do farol, lanterna, farol, roda, pneu, interior);
   - a caixa da cabine (`seat_F|steer`: bancos e volante);
   - as peças do PPF (`_hood_`, `bumper_F`, `mirror`, `_body_`, `_door_L_`);
   - o `headlight` da regra dos faróis;
   - o caminho `'/modelo/db11.glb'`.

   Depois, acerte o `data-ancora` de cada serviço e o crédito do rodapé. Diga à pessoa que isso leva uma ou duas horas e não sai por prompt sem o arquivo do modelo.

### Regras ao trocar

- Nada de número, nota, avaliação, preço, prazo ou "carro entregue" inventado como se fosse da pessoa: o que ela não informou fica `[preencher]` e entra na lista do fim.
- Nada de cidade se a pessoa não quiser: o endereço sem cidade, como na demo, é uma saída honesta.
- Ao trocar uma foto, rode `npm run fotos -- <vaga>` e confira o recorte nas duas larguras. Com o DB11 no site, o crédito do modelo fica no rodapé. As fotos de banco não exigem crédito, mas o registro fica em `fonte/FOTOS.md`.
- Depois de cada troca, rode o "Como checar" de novo e, no fim, liste para a pessoa o que ainda é da demo (fotos, avaliações, nota, preços, endereço, textos) e o que falta ela mandar.
