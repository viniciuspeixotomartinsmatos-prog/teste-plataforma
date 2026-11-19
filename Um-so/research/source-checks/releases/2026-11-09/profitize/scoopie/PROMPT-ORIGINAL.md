# Scoopie: landing page de sorveteria com o pote em 3D que solta o rótulo

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o site da minha marca** (sorveteria, gelateria, açaiteria, doceria, ou outro produto que venha numa embalagem) com esta estrutura e estas animações.
   - **Usar só algumas peças** num site que já tenho:
     - o pote em 3D que desce pela página, rola e solta o rótulo, que vira a faixa ondulada;
     - o sabor em destaque, com a cor abrindo em círculo e o seletor de potes;
     - a porta de geladeira com os objetos em paralaxe e as letras entrando fora de ordem;
     - as linhas gigantes com foto que andam de lado;
     - o rodapé com potes, colheres e ícones caindo com física;
     - a abertura com as faixas de arco-íris;
     - a aba "puxe o lacre" que desce o menu.
2. **Se for a marca dela**, pergunte:
   - o nome e a frase da marca;
   - os sabores ou produtos (até cinco funciona melhor), cada um com uma cor e uma frase curta;
   - **a embalagem**: é um pote, um copo, uma lata ou um pote baixo? Peça uma foto dela de lado, ou que descreva (tipo, volume, cor da tampa);
   - os links de delivery, das lojas e das redes;
   - **que material já tem**: o logo, a arte do rótulo, fotos do produto e de clientes com ele.

   Avise já aqui, com clareza, o que depende de material novo:
   - Nome, frase, sabores, cores e textos mudam só com texto. **O logo, a tampa, a faixa e os potinhos do seletor se redesenham sozinhos** com o nome novo.
   - **A embalagem em 3D é feita em código**, sem modelo baixado. Se o produto dela vem numa embalagem redonda (pote, copo, lata, pote baixo), dá para refazer com as medidas tiradas da foto ou da descrição. Se não é redonda, leia a nota "Produto que não é redondo", no fim deste prompt, e diga a ela o que muda.
   - **A arte de cada rótulo é uma imagem** (as da demo são de sorvete). Ela pode mandar a arte dela, gerar uma nova com as receitas de `arquivos/receitas/` ou começar com a da demo.
   - **As fotos da demo mostram o pote da Scoopie** (com o rótulo de pistache, morango...), sem o nome da marca. O site fica muito mais forte com fotos do produto dela; até lá, valem como rascunho.
   - **O prazo "40 minutos", as lojas e as redes da demo são inventados**: só entram os reais.
3. **Se forem peças:** quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa a landing page da **Scoopie**, uma sorveteria fictícia de sorvete artesanal de pote, com delivery e lojas.

Leia antes o guia do projeto desta pasta (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes). Ele traz a arquitetura, o design system, as regras do pote 3D e do celular, como conferir e como personalizar.

Olhe também as imagens em `arquivos/conceito/`. São prints do site pronto, em `-desktop` (1456 × 840) e `-mobile` (390 × 844, em 2×):

- `01-abertura` (o logo e as faixas de arco-íris subindo);
- `02-hero`;
- `03-mural`;
- `04-faixa` (o pote rolando e o rótulo virando a faixa);
- `05-sabor` (pistache) e `05-sabor-2` (açaí);
- `06-momentos` e `06-momentos-2`;
- `07-chamada`;
- `08-rodape`;
- `09-menu`.

**Tudo o que o site usa já vem pronto em `arquivos/site/`:**

- o `index.html` e o `vite.config.js` (que junta as seções de `src/sections/*.html` no `index.html`);
- o `package.json`, com as versões travadas, e o `package-lock.json`;
- o código em `src/`: o CSS e o HTML de cada seção, os módulos de motion e o pote 3D;
- em `public/`, as imagens (`img/`), a fonte do logo (`fonts/`) e o favicon;
- em `fonte/`, o conversor de imagens (`npm run imagens`) e as licenças da fonte do logo e dos ícones.

Use tudo isso como está. Não gere imagem nova, não reescreva os módulos, não troque versão de biblioteca e não "melhore" nada na montagem da demo. A demo tem de sair idêntica.

A ideia da página: **o pote de sorvete é o rolo de fita adesiva.** Ele aparece em 3D no hero, desce girando pela porta da geladeira e pousa na borda ondulada da seção seguinte. Ali ele rola para a direita, e o rótulo descola da frente dele e fica colado na página: primeiro a volta do rótulo, depois uma faixa creme com a frase da marca. Depois o pote cai no palco do sabor, visto de cima, e a cada sabor dá uma volta e troca o rótulo pela parte de trás. O tom é de papelaria e colagem: papel amassado por cima de tudo, objetos presos com ímã, fotos em adesivo.

Nível de acabamento: site de premiação.

---

## Parte 1 — O site

### Marca e tom
- Público: quem pede sorvete no delivery e leva pote para casa, 18 a 40 anos.
- Tom brincalhão e curto, títulos em caixa alta. Fala do dia a dia (o calor, o fim de namoro, a prova) e do que toda sorveteria mostra: sabores, potes, lojas, delivery. Nada de cidade ou lugar real.
- **Cores** (tokens em `src/styles/tokens.css`):
  - rosa-chiclete `#ff6db8` (fundo principal);
  - chocolate `#3b1a12` (títulos, mural, rodapé);
  - creme `#fff1de` (selos, a faixa, o texto sobre o chocolate);
  - os sabores trazem as outras: pistache `#7fc241`, morango `#e8263d`, maracujá `#ffc21f`, açaí `#5b2a86`, chocolate `#6b3a23`.
- **Tipo:**
  - **Bricolage Grotesque** variável pelo Fontsource (livre): títulos em peso 800 e largura 75%, em caixa alta; o texto corrido na mesma família.
  - **O logo** usa **Bagel Fat One** (Google Fonts, OFL), servida pelo próprio site (`public/fonts/`) e pré-carregada: "scoopie" em caixa baixa, cada letra num giro e numa altura, com um contorno creme de adesivo (os miolos das letras fechados) que escorre em duas gotas. É desenhado em canvas (`src/three/marca.js`) e aparece na abertura, no hero, na tampa, na faixa e no rodapé.
- **Textura:** papel amassado por cima de tudo (`public/img/papel-alfa.webp`): os vincos em preto com transparência, o mesmo que multiplicar pelo papel cinza, sem `mix-blend-mode`.

### O pote (3D ao vivo, Three.js)
- **Feito em código:** um tronco de cone de papel (o corpo) com o rótulo em volta e uma tampa de chocolate com saia e borda arredondada, com verniz leve. Medidas, cores e textos da embalagem em `EMBALAGEM` (`src/config.js`).
- **O rótulo vai até a borda:** a arte de cada sabor (`public/img/rotulo-<sabor>.webp`, estampa serigráfica de três tintas, sem letras) com um selo creme arredondado no meio da frente, o nome do sabor e "SORVETE ARTESANAL · 500 ML".
- **A tampa:** o logo rosa no meio e o texto "SORVETE ARTESANAL • SABOR • 500 ML" em volta.
- **A fita** (`src/three/fita.js`): o rótulo do pote e a faixa ondulada são o mesmo material. A primeira volta é o rótulo do sabor; depois dela vem a faixa creme com a frase e a tampa entre as frases, como um rolo que não acaba.

### Regras de movimento (valem para a página inteira)
1. **O que é imagem anda preso à rolagem:** o pote, a paralaxe do mural, as linhas gigantes, o rótulo descolando, a faixa correndo.
2. **Texto e troca de estado entram por marco, com tempo fixo** (nunca presos ao scrub). Rolando rápido, cada marco termina inteiro; ao sair, fica o estado final.
3. **Freio na rolagem** (`src/motion/guia.js`): a página sempre rola presa ao gesto e nunca para sozinha. A roda tem teto de ~0,9 tela por segundo; no toque, a rolagem é a nativa.
4. **Hover só com o cursor de verdade:** `.is-scrolling` enquanto a página rola com o cursor parado, e todo hover dentro de `@media (hover: hover)`.
5. **Títulos com no máximo duas linhas.** Nada de HUD, contador "01/05", "role para..." ou linha decorativa.

### 0 — Abertura (~2,5 s, por tempo; termina no hero) — `01-abertura`
- Tela rosa. O logo "scoopie" entra letra por letra, pulando (0,5 s cada, uma a cada 75 ms).
- Quando o site está pronto (fontes e pote 3D), **cinco faixas em arco** nas cores dos sabores (morango, maracujá, pistache, açaí, chocolate) sobem de baixo em 1,45 s e descobrem o hero embaixo da última. Na metade da subida, as letras do hero começam a pular.
- Com movimento reduzido: sem faixas, só um fade.

### 1 — Hero — `02-hero`
- "A [logo] TÁ AQUI PRA" pequeno no alto e **ESFRIAR / A CABEÇA** gigante. As letras entram pulando uma a uma (por tempo), cada uma girando de leve.
- O rosa termina numa **curva larga** que desce sobre o chocolate, e o pote fica na borda dela, inclinado, com a tampa virada para quem olha.
- **O pote segue o cursor** numa mola que passa do ponto e volta (só com o mouse).
- **Celular:** ESFRIAR e A CABEÇA na mesma largura, abaixo da aba do lacre; o pote encaixa no espaço livre embaixo do título.

### 2 — Mural (a porta da geladeira) — `03-mural`
- Fundo chocolate. Objetos recortados presos por ímãs, em paralaxe presa à rolagem, cada um numa velocidade:
  - uma lista de compras com "sorvete" riscado e "2 sorvetes!!" circulado;
  - um ingresso de cinema; uma polaroide de duas amigas de pijama dividindo um pote;
  - um convite de aniversário de 8 anos; um desenho de criança;
  - os ímãs (morango, casquinha, sol, botão, pistache).
- **O papel kraft** diz, em sete linhas: "FIM DE NAMORO, / PROVA DE CÁLCULO, / REUNIÃO QUE PODIA / SER UM E-MAIL, / CALOR DE RACHAR. / A GENTE TÁ AQUI PRA / ESFRIAR A CABEÇA." As letras entram em ordem aleatória quando o papel chega (por marco).
- **O pote desce girando** pelo meio do mural, preso à rolagem, e termina parado, pronto para pousar.
- **Celular:** uma coluna (ingresso e lista no alto, o kraft à direita, polaroide e convite lado a lado, o desenho embaixo); o pote desce pela beirada esquerda, menor, sem cobrir o texto.

### 3 — O rótulo vira a faixa — `04-faixa`
- Na borda de baixo do mural, **o pote pousa na onda**, a borda de cima da seção seguinte (a mesma onda recorta a seção e desenha a faixa).
- Ele **rola para a direita**, e o rótulo descola da frente dele e fica colado na página: primeiro a volta do rótulo (PISTACHE), depois a faixa creme "QUANDO A VIDA ESQUENTA, A GENTE GELA", com a tampa entre as frases.
- Enquanto o pote rola, a faixa corre para a esquerda; depois que ele sai pela direita, ela continua correndo com a rolagem.

### 4 — Sabor em destaque — `05-sabor`, `05-sabor-2`
- A seção fica presa enquanto a página rola (cinco marcos, um por sabor). Fundo na cor do sabor; "O" e o nome do sabor gigantes, tom sobre tom, atrás do pote.
- **O pote cai do alto**, passando por cima da faixa, e para no meio, visto de cima (a tampa de frente), boiando de leve.
- **A cada marco:**
  - a cor nova abre em círculo a partir do pote (0,6 s);
  - o nome sai pulando e o novo entra letra por letra;
  - o texto do sabor troca;
  - o pote dá uma volta inteira e troca o rótulo **pela parte de trás**, no meio da volta, e a tampa junto.
- Em volta: quatro fotos em adesivo (colher no pote, casquinha, brinde de copinhos, criança lambuzada), o texto do sabor com o botão "Pedir esse" à esquerda, o selo redondo "PEDIR AGORA" com a colher no meio e, à direita, **os cinco potes do seletor** (o clique leva a rolagem até o marco daquele sabor).
- **Os sabores** (em `src/config.js`):
  1. Pistache: "Pistache torrado e moído na hora, com pedaço inteiro no meio de cada colherada."
  2. Morango: "Morango de verdade batido com creme, e mais pedaço guardado no fundo do pote."
  3. Maracujá: "Azedinho na medida, com calda de maracujá e as sementes, do jeito que tem que ser."
  4. Açaí: "Açaí grosso e cremoso, com banana no meio e aquele roxo que mancha a colher."
  5. Chocolate: "Chocolate meio amargo, bem cremoso, com raspas por cima pra quem não divide."
- **Celular:** o texto e o botão no alto, o pote no meio, "O PISTACHE" embaixo, a fileira dos cinco potes do seletor no pé; sem o selo.

### 5 — Momentos — `06-momentos`, `06-momentos-2`
- "PROS MOMENTOS DE TODO DIA." monta com as letras em ordem aleatória.
- Três **linhas gigantes**, cada uma andando de lado presa à rolagem (uma para cada lado): **PRA [foto] COMEMORAR** (aniversário com vela no pote), **PRA [foto] DIVIDIR** (três colheres no pote de chocolate), **PRA [foto] ESQUECER** (alguém de pijama chorando com o açaí).
- Potes e tampas em adesivo em profundidades diferentes, em paralaxe.

### 6 — Chamada — `07-chamada`
- A foto em card (alguém de suéter colorido segurando três potes) ao lado de um card de chocolate arredondado: **"BORA / PEDIR?"** em rosa (as letras sobem uma vez, quando o card chega), "Chega gelado na sua porta em até 40 minutos, ou te espera na loja mais perto." e os botões "Pedir no delivery" e "Achar uma loja".

### 7 — Rodapé — `08-rodape`
- Chocolate, com a borda de cima em curva. Os links (Sabores, Momentos, Lojas, Delivery, Contato), o logo em rosa e **ESFRIAR / A CABEÇA** gigante em rosa.
- **Quando ele chega, os cinco potes, as colheres e os ícones das redes caem com física** (Matter.js), batem e se empilham. Dá para pegar e jogar com o mouse (cursor de mão) ou com o dedo (de lado: o gesto vertical rola a página). Clicar num pote leva ao sabor dele; clicar num ícone abre a rede.
- A linha de baixo: "© 2026 Scoopie Sorvetes · Sorvete artesanal de pote" e os links das redes em texto.

### Fixos
- **A aba "PUXE O LACRE"** no canto de cima, como o lacre da tampa (`09-menu`): no hover ela estica e o texto desce girando; o clique desce o menu, um papel creme com a borda picotada, com os links gigantes (Sabores, Momentos, Bora pedir, Lojas). A aba vira "FECHAR"; Esc ou a aba fecham e o foco volta para ela; cada link fecha o menu e rola até a seção.
- **Barra de rolagem própria:** um fio creme que aparece ao rolar e some parado; no mouse, engrossa e dá para arrastar.
- Sem som.

### Interações (tudo que é clicável)
- **Botões** (Pedir esse, Pedir no delivery, Achar uma loja): no hover sobem e inclinam de leve e trocam o preenchimento; no clique afundam; foco com contorno.
- **Seletor de sabores:** no hover o pote pequeno sobe e gira; o ativo fica maior, com um traço embaixo.
- **Selo PEDIR AGORA:** no hover o selo gira.
- **Links do rodapé:** sublinhado rosa que cresce no hover.
- **Links internos** rolam suave pelo Lenis (no toque, pela rolagem nativa do navegador).
- **Regras gerais:** hover só dentro de `@media (hover: hover)`; toque sem o realce cinza; alvos de toque de 44 px; foco visível em tudo.

### Movimento reduzido
Sem Lenis, abertura só com fade, texto sem pular, trocas de sabor sem animação e a física já assentada.

### Celular
A composição de cada seção está descrita acima e no guia (seção "Celular"). A página nunca rola para o lado, o pote 3D fica em `dpr` 1,5, os rótulos vêm em 1024 px e o Matter.js só carrega perto do rodapé.

### Leveza
O site tem de rodar liso até num notebook com tela de 120 Hz, sem perder nada do visual. O guia (seção "Leveza") lista o que o deixa leve: a sombra do pote feita no próprio WebGL (nunca `filter` no canvas), o papel sem `mix-blend-mode`, o palco que só redesenha quando algo muda e o trabalho pesado (texturas, retratos) só nos respiros do navegador.

---

## Parte 2 — Como construir (stack)

- **Vite sem framework.** As bibliotecas, com as versões travadas no `package.json` e no `package-lock.json`:
  - three 0.186.1, GSAP 3.15.0 (ScrollTrigger), Lenis 1.3.27, matter-js 0.20.0 e @fontsource-variable/bricolage-grotesque 5.3.0;
  - Vite 8.3.5 e sharp 0.35.5 (sharp só para o conversor de imagens).
- **Monte assim, nesta ordem:**
  1. **Copie todo o conteúdo de `arquivos/site/`** para a raiz do projeto, mantendo as pastas (`index.html`, `vite.config.js`, `package.json`, `package-lock.json`, `.gitignore`, `src/`, `public/`, `fonte/`).
     - Copie, não reescreva: o pote, a fita e o roteiro do palco foram acertados um a um.
     - Não copie `arquivos/conceito/` nem `arquivos/receitas/` para o site: são os prints de referência e as receitas das imagens.
  2. **Rode `npm ci`**, que instala exatamente as versões do `package-lock.json`. Se ele falhar, use `npm install` sem mudar nenhuma versão.
  3. **Rode `npm run build`**, que tem de passar sem erro.
  4. **Rode `npm run dev`** e abra `http://localhost:5310`.
     - Se a porta estiver ocupada, use `npx vite --port 5311`.
     - Para abrir no celular, na mesma rede Wi-Fi, use `npm run dev -- --host` e o endereço de rede que o Vite mostrar.
- **Confira contra os prints de `arquivos/conceito/`**, na tela de 1456 × 840 e na de 390 × 844:
  - a abertura terminando no hero;
  - o pote descendo pelo mural, pousando na onda e o rótulo virando a faixa;
  - os cinco sabores, com a volta do pote a cada um;
  - as linhas dos momentos, a chamada e a física do rodapé.

  O console fica sem erros, e nada rola para o lado no celular. Se algo não bater, o erro está na cópia (arquivo faltando ou alterado): compare com `arquivos/site/`.
- **`fonte/` não entra no site** (o Vite não serve a pasta no build). Ela guarda o conversor de imagens (`npm run imagens`) e as licenças.
- **No fim:** `npm run build` gera o `dist/`, que sobe em qualquer hospedagem estática (Vercel, Netlify, Hostinger).

---

## A embalagem da pessoa (quando ela não vende o pote de sorvete da demo)

O pote é código, então outra embalagem redonda é outra configuração, não um modelo novo. Siga "A embalagem" no guia: peça uma foto de lado (ou a descrição: tipo, volume, cor), tire a proporção (altura, largura da boca e do fundo), preencha `EMBALAGEM` em `src/config.js` e, se a tampa tiver outro formato, ajuste o perfil dela em `src/three/pote.js`. O rótulo, a faixa, o rolar e os potinhos se ajustam sozinhos.

**Produto que não é redondo** (caixa, saco, sachê, frasco achatado): o rótulo só consegue descolar de um corpo redondo, então não tente refazer a fita para ele. Sugira à pessoa um destes caminhos, nesta ordem:

1. **Manter uma embalagem redonda como objeto da marca** (um pote, copo ou lata com a arte dela). É ela que conta a história do rótulo virando faixa; o produto de verdade aparece nas fotos dos adesivos, das linhas e da chamada.
2. **Trocar o pote por um modelo 3D do produto** (um `.glb` com licença livre, ou modelado simples em código, como uma caixa com cantos arredondados) nas poses do hero, do mural e do palco do sabor. Na seção 3, a faixa entra sozinha pela borda da onda e corre com a rolagem, sem descolar de nada. Diga a ela que isso leva algumas horas e muda o gesto principal do site.
