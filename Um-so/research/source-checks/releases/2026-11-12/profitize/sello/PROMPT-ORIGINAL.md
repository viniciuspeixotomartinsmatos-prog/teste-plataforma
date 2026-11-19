# Sello: landing page de corretora de cripto com a águia de cromo em 3D

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o site da minha empresa** (corretora ou custódia de cripto, mesa de câmbio de cripto, gestora, banco digital, casa de ouro e câmbio) com esta estrutura e estas animações.
   - **Usar só algumas peças** num site que já tenho:
     - o emblema de cromo em 3D que fica na frente do título e acompanha o cursor (funciona com qualquer logo chapado);
     - o ano gigante com o emblema pousado no vão;
     - a coluna de sílabas gigantes na seção preta, com os serviços entrando aos pares;
     - as moedas em 3D que formam um anel em volta de uma palavra;
     - o painel ao vivo com a moeda no meio;
     - os cartões em forma de escudo com os saldos;
     - a navegação no pé com o menu em ladrilhos.
2. **Se for a empresa dela**, pergunte:
   - o nome, o que oferece (custódia, compra e venda, Pix, crédito, outro) e para quem;
   - os números que pode mostrar (sob custódia, em circulação, saldos) ou se prefere textos sem número;
   - o ano de fundação (é o número gigante da segunda seção);
   - o e-mail, o WhatsApp, o endereço, as redes e o link de "Entrar" e "Abrir conta";
   - **que material já tem**: o logo em SVG (ou PNG com fundo transparente). Ele vira o emblema de cromo em 3D e o relevo das moedas.

   Avise já aqui, com clareza, o que depende de material novo:
   - Nome, textos, serviços, números, contatos e cores mudam só com texto.
   - **O emblema 3D é feito do logo**: um comando transforma qualquer logo chapado (uma cor, sem degradê) na peça de cromo e no relevo da moeda. Logo com muito detalhe fino ou só com letras fica melhor com um símbolo mais cheio; o guia explica.
   - **Os números da demo (R$ 3,41 bi, 1.218.994.578, saldos dos escudos) são inventados**: só ficam os reais, ou textos sem número.
3. **Se forem peças:** quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa a landing page da **Sello**, uma corretora de cripto fictícia com cara de banco antigo: custódia em cofre frio, compra e venda pela mesa, Pix 24 horas, crédito com o bitcoin de garantia, prova de reservas a cada hora e o Real Sello, um real em token.

Leia antes o guia do projeto desta pasta (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes). Ele traz a arquitetura, o design system, o 3D, as regras do celular, como conferir e como personalizar.

Olhe também as imagens em `arquivos/conceito/`. São prints do site pronto, em `-desktop` (1456 × 840) e `-mobile` (390 de largura, em 2×):

- `01-abertura` (a janela abrindo) e `02-hero`;
- `03-casa` (a águia pousada no ano);
- `04-servicos` (as sílabas e o primeiro par) e `05-servicos-2`;
- `06-moeda` (a moeda sozinha) e `07-moeda-anel`;
- `08-lastro`, `09-cofre` e `10-rodape`.

**Tudo o que o site usa já vem pronto em `arquivos/site/`:**

- o `index.html` e o `vite.config.js`;
- o `package.json`, com as versões travadas, e o `package-lock.json`;
- o código em `src/`: o CSS de cada seção, os módulos de motion e o palco 3D (`src/gl/`);
- em `public/`: `aguia.svg` (o desenho da marca), `favicon.svg` e, em `3d/`, a águia inflada (`brasao.glb`) e o relevo da moeda (`moeda-relevo.webp`);
- em `fonte/`: `aguia.svg` (o desenho original) e `brasao.mjs`, o script que transforma o desenho na peça 3D e no relevo da moeda.

Use tudo isso como está. Não gere imagem nova, não reescreva os módulos, não troque versão de biblioteca e não "melhore" nada na montagem da demo. A demo tem de sair idêntica.

A ideia da página: **um banco antigo que guarda ativo novo.** O emblema da casa, uma águia heráldica de asas abertas, existe em cromo inflado (bordas redondas, como um balão de metal) e é o único objeto da página. Ele fica parado no ar enquanto o hero sobe, viaja girando até pousar entre os números do ano e volta no rodapé. Depois, as moedas da casa abrem num anel em volta da palavra REAL, caem, e a que sobra vira o centro do painel do lastro.

Nível de acabamento: site de premiação.

---

## Parte 1 — O site

### Marca e tom
- Público: quem tem cripto e quer guardar com segurança de banco (pessoas, empresas e tesourarias, fundos).
- Tom sóbrio e curto, frases que soam como uma casa antiga falando de ativo novo. Nada de "revolucione", "o futuro do dinheiro", foguete ou lua.
- **Cores**, por papel (tokens em `src/styles/tokens.css`):
  - `--hero-fundo` e `--hero-tinta`: o hero e a casa (a casa fica inteira na cor do hero);
  - `--destaque`: as sílabas dos serviços, os escudinhos, um dos escudos do cofre e o título do rodapé; `--destaque-chip` nos chips do lastro;
  - preto puro nos serviços, no rodapé, nos botões e na barra; branco nas seções da moeda, do lastro e do cofre.
  - **A demo usa a paleta verde-água** (`#c1e7e8`). Há mais cinco prontas, trocadas por `data-paleta` no `<html>` (o `?paleta=` da URL faz o mesmo): `lavanda`, `marfim` (a águia vira ouro), `preto` (o hero escuro, com a águia prateada), `vermelho` e `limao`. Com `?paletas` na URL aparece uma fileira de amostras para comparar, e as teclas 1 a 6 trocam na hora.
  - O 3D de cada paleta (o estúdio que o cromo reflete, a cor do metal, as moedas e o furta-cor delas) fica em `src/paletas.js`; na verde-água, o cromo reflete um estúdio verde-água e as moedas são metal anodizado roxo, azul-noite, grafite, prata e lilás.
- **Tipo** (Fontsource, livres):
  - **Noto Serif Display** variável nos títulos, com o eixo de largura em 87,5% (`--largura-serifa`); 100% e peso 520 nas sílabas e no R E A L;
  - **Gloock** no ano "20 14";
  - **Geist** variável no texto e na interface.

### Regras de movimento (valem para a página inteira)
1. **Curvas próprias** (CustomEase, em `ease.js`): `se-out` `0.23,1,0.32,1` nas entradas, `se-in` `0.6,0,0.84,0.2` nas saídas e `se-io` `0.77,0,0.175,1` nas viagens.
2. **O que é imagem segue a rolagem** (a águia viajando e girando, a coluna de sílabas, o anel de moedas, a moeda indo para o lastro). **Texto e estados trocam por marco**, com tempo fixo, nos dois sentidos: títulos por máscara de linha, a frase que acende, os pares de serviços, os números que contam.
3. **Freio na rolagem** (`guia.js`): a roda tem teto de ~0,9 tela por segundo; a página sempre rola presa ao gesto e nunca para sozinha. No toque, a rolagem é a nativa, sem nada cancelado.
4. **Títulos com no máximo duas ou três linhas curtas.** Nada de HUD, rótulo com traço, contador "01/04", "role para..." ou linha decorativa solta.

### O 3D (`src/gl/`)
- **Um canvas só, fixo, do tamanho da tela** (`palco.js`), por cima do texto e por baixo da navegação. Ele só desenha quando alguma peça mudou e nunca com o palco vazio. As peças ficam em coordenadas de tela: "centro em (x, y) px, altura h px".
- **Vagas:** caixas vazias do HTML (`.vaga--hero`, `.vaga--ano`, `.vaga--lastro`, `.vaga--fecho`) dizem onde a águia e a moeda ficam em cada trecho. O diretor (`diretor.js`) lê a rolagem a cada quadro e move a águia entre elas.
- **A águia** (`brasao.js`): a malha `public/3d/brasao.glb` com MeshPhysicalMaterial metálico (rugosidade 0,2, iridescência leve) refletindo o estúdio de `palco.js` (cúpula em degradê verde-água, três caixas de luz e uma faixa cinza na frente). Respira parada (balanço lento) e inclina na direção do cursor numa mola pouco amortecida.
- **As moedas** (`moedas.js`): um InstancedMesh de cilindros (12 no desktop, 9 no celular) com o relevo da face em mapa de normais (`moeda-relevo.webp`) e serrilha na borda; uma cor por moeda.
- **As letras R E A L** são desenhadas no 3D, com a mesma fonte e no lugar exato das letras do HTML (pela linha de base), para as moedas passarem atrás delas. O HTML fica com as letras transparentes (e visíveis sem WebGL).

### 0 — Abertura (`01-abertura`)
- Tela preta feita de quatro barras em volta de uma janela. S, a águia (o desenho chapado, branco) e O sobem juntos no pé, à direita; se espalham pela borda de baixo (S à esquerda, a águia no meio, O à direita); uma janela pequena abre no meio, com o hero já montado, e cresce até a tela inteira enquanto o monograma desce.
- **Celular:** o monograma tem o corpo pela largura (26% dela), não pela altura: assim o S · águia · O começa junto na metade da direita e tem espaço para deslizar até as bordas.
- ~3 s; qualquer gesto acelera; a janela só abre com o 3D pronto (no máximo 6 s). `?abertura=0` pula. Sem abertura com movimento reduzido.

### 1 — Hero (`02-hero`)
- Fundo verde-água. **"UMA CASA / SÓLIDA PARA / ATIVOS DIGITAIS"** no alto, centrado, em caixa alta (a última linha ocupa ~70% da largura).
- **A águia de cromo** na frente, do meio para baixo, cortando a última linha do título.
- Rótulos pequenos na altura de 55%: "Uma casa de guarda desde 2005" e "Reservas atestadas a cada hora".
- Nos dois cantos de baixo, um espelho do outro: à esquerda "Sob custódia R$ 3,41 bi", contando, com a barra BTC 44 · ETH 26 · BRL 18 · Ouro 12; à direita, alinhados à direita, "Custódia, compra e venda e crédito em cripto, com Pix a qualquer hora. Desde 2005 a casa guarda o que é seu: primeiro ouro, hoje também bitcoin." e o botão "Abrir conta".
- No alto: o logo (a águia) e "Entrar ↗". No pé, a barra de navegação.
- **Celular:** em coluna: o título no alto, a águia com a altura que sobra entre ele e o texto (o topo dela entra na última linha), o texto e o botão no pé; sem rótulos nem custódia.

### 2 — A casa (`03-casa`)
- A casa continua na cor do hero (nada de branco no meio): a águia fica parada no ar enquanto o título sobe e a seção chega.
- Quatro colunas finas: **O que fazemos** (o parágrafo dos serviços), **Para quem** (Pessoas · Empresas e tesourarias · Fundos e family offices), **Segurança** (Chaves em cofre frio · Seguro contra roubo · Auditoria independente) e **A casa** (Fundada em 2005 · Quatro sócios · Mesa 24 horas).
- No meio da página, centrada, a frase que acende palavra por palavra: "Muita coisa mudou no que a casa guarda desde 2005. O jeito de guardar, nunca: num lugar só, com o mesmo nome e os sócios respondendo por cada real."
- **"20" e "05" gigantes** em Gloock no pé, em duas metades iguais, cada número encostado no vão do meio (as duas metades têm a mesma largura de tinta, por isso o ano é 2005), e a águia **pousa no vão**, no centro exato, girando uma volta na viagem. O palco fica preso meia tela com tudo montado.
- **Celular:** a cena presa é só a frase e o "20 · 05" com a águia, numa tela; a frase acende quando a águia já pousou, e as quatro colunas vêm logo depois, rolando.

### 3 — Serviços (`04-servicos`, `05-servicos-2`)
- Da cor do hero para o preto num degradê longo. Cena preta presa. **QUA / TRO / SER / VI / ÇOS** em sílabas gigantes na cor de destaque numa coluna estreita, subindo com a rolagem por cima de uma coluna de texto cinza (a frase da casa repetida) que embaralha no pé. Embaixo da coluna: "Guarde, mova, peça crédito e confira. A casa não opera contra você e não dá palpite de preço."
- No fundo, a estrutura do cofre em fios finos, simétrica (um losango grande, um V invertido no meio, duas linhas horizontais embaixo), com nós em losango nos encontros e riscos de luz andando pelos fios.
- **Os serviços entram aos pares**, por marco, com um escudinho verde-água com ícone, o título em serifa, o texto e a linha "para quem":
  - **Custódia** e **Pix 24 horas** (com a coluna ainda passando);
  - **Crédito** e **Prova de reservas** (com a coluna já fora), e a faixa de números rodando no pé, abaixo das duas linhas de baixo da estrutura (reserva, liquidado hoje, sob custódia, em circulação, bitcoin, último extrato).
- **Celular:** a coluna passa primeiro e os quatro serviços entram um de cada vez.

### 4 — A moeda (`06-moeda`, `07-moeda-anel`)
- Do preto para o branco num degradê longo. Uma moeda sobe girando sozinha; **R E A L** aparece gigante, espalhado na largura, com S E L L O miúdo embaixo.
- As outras moedas saem de trás dela como um rolo e **abrem num anel inclinado em volta das letras** (a parte de cima passa atrás, a de baixo na frente); o anel gira; cada moeda vira no próprio eixo.
- Tudo devagar: a moeda sozinha gira lentinho, por tempo (~20° por segundo, uma volta a cada ~18 s), no máximo duas voltas e desacelerando no fim; as do anel balançam ou viram com calma, e só as do anel formado viram inteiras.
- No fim, as moedas caem e sobra a primeira, que cresce no meio da tela.

### 5 — O lastro (`08-lastro`)
- A moeda vai para o meio de uma faixa clara em arco e balança devagar, na mesma cor que tinha no R E A L (ela não troca de cor em nenhum momento).
- À esquerda: o total em circulação (1.218.994.578, subindo devagar como painel ao vivo), "Real Sello em circulação, 100% em reais" e a ficha com chips verde-água (Emitido contra: Depósitos na casa · Resgate: Na hora, um por um · Rede: Ethereum · Reserva atestada: A cada hora).
- À direita: emitidos (+84.200.000) e resgatados (−61.900.000) hoje, com barras tracejadas, e o saldo do dia (+22.300.000) com a nota.
- No pé: **"UM TOKEN, / UM REAL / GUARDADO"** à esquerda; o botão e o texto à direita.

### 6 — O cofre (`09-cofre`)
- "Quatro ativos" e "Atualizado a cada hora" nas laterais; no meio **"O QUE ESTÁ / NO COFRE"**, o texto e o botão "Ver o extrato".
- Quatro **escudos** (preto, verde-água, preto, preto): Bitcoin 18.402,51 BTC, Ether 214.880,04 ETH, Reais 1.204.660.000 BRL, Ouro 44.180 oz, com o saldo contando e o ícone em traço à mão no pé. Fundo branco com losangos bem claros.

### 7 — Fecho e rodapé (`10-rodape`)
- **"GUARDE COM / QUEM RESPONDE"** em verde-água, o texto e os botões "Abrir conta" (claro) e "Falar com a mesa".
- A grade: Mesa (e-mail, WhatsApp), Horário, Endereço (exemplo), Siga; o aviso legal.
- O monograma **S · O gigante** no pé, cortado pela borda, com a águia de cromo de volta no vão (meia volta enquanto sobe).

### Navegação e menu
- **No pé, dois blocos** centrados: "Sello" e o nome da parte em que você está (Casa, Serviços, Real Sello, Reservas, Contato), que troca subindo, com o ☰. Pretos no claro, brancos no escuro. No hover, o rótulo rola como no botão e o fundo clareia; os cantos ficam retos.
- **O menu** sobe em ladrilhos quadrados a partir da barra (Casa, Real Sello / Serviços, Reservas, Abrir conta / Instagram, X, LinkedIn), com a página desfocada atrás. Esc e clique fora fecham; o foco fica preso nos ladrilhos.
- Os links rolam até a seção. **Barra de rolagem** própria e fina, com a nativa escondida.

### Interações (tudo que é clicável)
- **Botão chanfrado** (preto com os cantos cortados): no hover o rótulo sai por cima e a cópia sobe de baixo, o fundo clareia e o chanfro cresce; aperta 0,97 no clique; foco com anel interno.
- **Barra:** nos dois blocos, o rótulo rola como no botão e o fundo clareia (cantos retos, sem chanfro); o ☰ se abre e vira × com o menu aberto. **Ladrilhos:** ficam brancos (a cor de destaque no escuro) e o rótulo desce.
- **Logo:** gira e cresce no hover. **Links:** sublinhado que corre da esquerda. **Escudos:** sobem e o ícone gira.
- **A águia** inclina na direção do cursor numa mola (passa do ponto e balança).
- **Regras gerais:** hover só com mouse e fora da rolagem (`.is-scrolling`); toque sem o realce cinza; alvos de toque de 44 px; "Pular para o conteúdo" no Tab.

### Movimento reduzido e sem WebGL
- **Movimento reduzido:** sem abertura, sem Lenis, a águia parada (sem giro nem balanço), moedas sem giro, textos só com opacidade.
- **Sem WebGL:** a águia vira o desenho chapado com um degradê de prata nas vagas, a moeda do lastro um disco, e o R E A L fica no HTML.

---

## Parte 2 — Como construir (stack)

- **Vite sem framework.** As bibliotecas, com as versões travadas no `package.json` e no `package-lock.json`:
  - Three.js 0.186.1, GSAP 3.15.0 (ScrollTrigger, SplitText e CustomEase), Lenis 1.3.26;
  - @fontsource-variable/noto-serif-display 5.3.0, @fontsource/gloock 5.3.0 e @fontsource-variable/geist 5.3.0;
  - Vite 8.3.3; sharp, delaunator, @gltf-transform e meshoptimizer só para o script do emblema (`fonte/brasao.mjs`).
- **Monte assim, nesta ordem:**
  1. **Copie todo o conteúdo de `arquivos/site/`** para a raiz do projeto, mantendo as pastas (`index.html`, `vite.config.js`, `package.json`, `package-lock.json`, `.gitignore`, `src/`, `public/`, `fonte/`).
     - Copie, não reescreva: o cromo, a viagem da águia e o anel de moedas foram acertados um a um.
     - Não copie `arquivos/conceito/` nem `arquivos/receitas/` para o site: são os prints de referência e a receita do desenho.
  2. **Rode `npm ci`**, que instala exatamente as versões do `package-lock.json`. Se ele falhar, use `npm install` sem mudar nenhuma versão.
  3. **Rode `npm run build`**, que tem de passar sem erro. (A peça 3D já vem pronta em `public/3d/`; `npm run brasao` só é preciso para trocar o emblema.)
  4. **Rode `npm run dev`** e abra `http://localhost:5350`.
     - Se a porta estiver ocupada, use `npx vite --port 5351`.
     - Para abrir no celular, na mesma rede Wi-Fi, use `npm run dev -- --host` e o endereço de rede que o Vite mostrar.
- **Confira contra os prints de `arquivos/conceito/`**, na tela de 1456 × 840 e na de 390 × 844, e olhe também a 390 × 664, a altura de um iPhone com as barras do Safari abertas (no hero e na casa nada pode se cruzar):
  - a abertura (monograma, janela) e o hero com a águia cortando o título;
  - a águia pousando no "20 · 05", com os dois números simétricos em volta dela;
  - as sílabas e os pares de serviços;
  - o anel de moedas em volta do R E A L e a moeda indo para o lastro;
  - o cofre e o rodapé com a águia entre o S e o O.

  O console fica sem erros, e nada rola para o lado no celular. Se algo não bater, o erro está na cópia (arquivo faltando ou alterado): compare com `arquivos/site/`.
- **Primeira pintura nunca crua.** O CSS entra numa folha única ligada por `<link>` no `<head>` do `index.html` (`src/styles/site.css`, com as fontes por `@import` dentro dela), nunca importado pelo JS; antes do link, inline, vão o fundo preto e a tela preta da abertura. Com o CSS importado pelo JS, o site aparece cru (fundo branco, texto sem estilo) por um instante a cada recarregamento, porque no dev do Vite ele só chega depois dos módulos. Ao personalizar, mantenha assim.
- **`fonte/` não entra no site** (o Vite não usa a pasta). Ela guarda o desenho original e o script do emblema.
- **No fim:** `npm run build` gera o `dist/` (~2,3 MB, mais da metade em fontes de outros alfabetos que o navegador nem baixa; o site abre com ~0,7 MB), que sobe em qualquer hospedagem estática (Vercel, Netlify, Hostinger). O `vite.config.js` usa `base: './'`: o site funciona na raiz do domínio ou numa subpasta.
