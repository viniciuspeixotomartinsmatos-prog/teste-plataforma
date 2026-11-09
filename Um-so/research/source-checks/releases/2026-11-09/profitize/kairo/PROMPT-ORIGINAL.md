# Kairo: portfólio que se monta sozinho na frente de quem visita

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o meu portfólio** (dev, designer, freelancer, estúdio, consultor) com esta estrutura e esta montagem pelos agentes.
   - **Usar só algumas peças** (o enxame de cursores que monta a página, o hero com o nome gigante e a foto recortada, os cards de projeto com filtro, o comparador "do rascunho ao ar", a trajetória em sanfona) num site que já tenho.
2. Se for o portfólio dela: o nome, o que ela faz numa frase, para quem trabalha, os números que são reais (anos, projetos, clientes), três projetos com nome, categoria, ano e uma frase, a trajetória (cargos e anos), as ferramentas que usa, o contato e as redes, e **que material já tem**: uma foto dela, prints dos projetos e, se houver, o wireframe de um deles. Avise já aqui, com clareza, o que depende de material novo:
   - Textos, números, projetos, trajetória, ferramentas e contato mudam só com texto.
   - **A foto do hero é de uma pessoa que não existe.** Para pôr a dela: uma foto de perfil ou de três quartos, com o fundo recortado (o guia explica como recortar de graça). Sem recorte, a foto não fica na frente do título como na demo.
   - **As telas dos projetos são imagens geradas por IA.** O melhor é o print de verdade de cada projeto, em modo escuro (tela branca estoura na gravação com o celular).
   - **O comparador "Do rascunho. Ao ar." pede o wireframe e a tela final do mesmo projeto, no mesmo enquadramento.** Sem wireframe, o guia mostra como deixar só a tela final.
3. Se forem peças: quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa o portfólio do **Kairo**, um engenheiro de IA e automação fictício que monta agentes, automações e painéis para empresas pequenas e médias. Leia antes o guia do projeto desta pasta (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes: arquitetura, design system, regras do enxame e do celular, como conferir e como personalizar) e olhe as imagens em `arquivos/conceito/`. São prints do site pronto, já montado, em `-desktop` (1456 × 840) e `-mobile` (390 de largura); as seções altas têm um segundo print `-2`: `01-hero`, `02-projetos`, `03-bastidor`, `04-sobre`, `05-trajetoria` e `06-contato`.

**Tudo o que o site usa já vem pronto em `arquivos/site/`**: o `index.html`, o `vite.config.js` (com o plugin que monta a página a partir das seções), o `package.json` com as versões travadas e o `package-lock.json`, o código em `src/` (o HTML e o CSS de cada seção, os módulos do enxame, os tokens), as imagens em `public/` e, em `fonte/`, a foto original e o script que recorta o fundo. Use tudo isso como está: não gere imagem nova, não reescreva os módulos, não troque versão de biblioteca e não "melhore" nada na montagem da demo. A demo tem de sair idêntica.

A ideia da página: **o site se constrói na frente de quem visita.** Ao abrir, a tela está vazia, com o símbolo no centro; dezoito cursores coloridos, como colegas num editor multiplayer, chegam pelas bordas, rodeiam o símbolo e se espalham. Cada um pega um bloco: arrasta a caixa de seleção azul com a medida ao vivo, deixa o esboço cinza, volta e aplica o conteúdo (digita o texto, acende o título como neon, revela a foto em preto e branco e depois em cor). Alguns itens saem de uma cópia arrastada de outro pronto, e alguns nascem fora do lugar e são arrastados até encaixar, com a linha-guia rosa. A barra fixa no pé conta os agentes e as camadas, faz um Tour sozinho pela página e monta tudo de novo. Montada a página, os cursores formam uma fila que dá voltas soltas pela tela.

Nível de acabamento: site de premiação. Nada pisca, nada fica cortado, e quem rola no meio da montagem vê tudo fechar na hora.

---

## Parte 1 — O site

### Marca e tom
- Público do site: dono de empresa e líder de produto procurando quem automatize a operação com IA.
- Tom direto e confiante, sem jargão inventado: frases curtas com o resultado ("Construo agentes que atendem, vendem e cobram sozinhos").
- Tokens (`src/styles/tokens.css`):
  - página `#0b0909` com um grão fino parado por cima;
  - vermelho puro em bloco `#e8261c` (botão, ponto final quadrado, play, alça) e `#ff4a3d` nos números e nas palavras em vermelho;
  - PORTFÓLIO num degradê de `#c9241b` para `#4d0e0b`; card vermelho do Sobre de `#8e1a14` para `#4e0e0b`;
  - texto `#f3eeec`, cinzas `#b3abaa` e `#807877`, fios brancos a 9% e 16%;
  - ferramenta dos agentes: seleção `#3ea2ff`, etiqueta de medida `#1b8cf2`, linha-guia `#ff3e9a`.
- Tipos (Fontsource, livres): **Anton** (PORTFÓLIO, o nome, os títulos condensados, os números), **Caveat** variável em 600 ("Olá, eu sou" e a assinatura) e **Manrope** variável (texto, rótulos em caixa alta e os títulos grotescos em 800 com tracking −0,06em).
- Símbolo: um quadrado preto de cantos arredondados com dois blocos vermelhos espelhados formando um "Y" com o vão no centro.

### 01 — Hero (alvo: `conceito/01-hero`)
- **Nav** de borda a borda com fio embaixo: o símbolo e "KAIRO." à esquerda; Projetos · Sobre · Trajetória · Contato no centro (o da seção na tela ganha um ponto vermelho); "Vamos conversar ↗" à direita.
- No alto, "Engenheiro de IA" em vermelho sobre "Automação · Sistemas"; à direita, "● Disponível para novos projetos".
- **PORTFÓLIO** cheio, no degradê vermelho, na largura toda entre as margens. **A foto recortada** do Kairo de perfil, com luz vermelha e azul, fica na frente do título e some no preto embaixo.
- À esquerda: "Olá, eu sou" manuscrito e inclinado, **KAIRO.** gigante em branco com o ponto vermelho quadrado, "Engenheiro de IA & automação" em vermelho, o parágrafo, o botão vermelho "Ver projetos ↓" e "Remoto · atendo o Brasil inteiro" com o ícone de local.
- À direita: o asterisco num anel vermelho com "Cada tarefa repetida. Um agente." e três números com fio entre eles (9+ anos escrevendo código; 120 projetos entregues, nota 4,9 de 5; 26 agentes no ar agora ↗).
- No pé, um fio e dois textos: "▶ Ver um caso por dentro · Agente / WhatsApp" à esquerda e "Projetos selecionados / 2017–2026" à direita. O meio fica para a barra dos agentes.

### 02 — Projetos (alvo: `conceito/02-projetos`)
- "01 / Projetos selecionados", **"Trabalho que roda sozinho."** e "Todos os projetos →".
- Abas Todos · Agentes · Automação · Dados com sublinhado vermelho (apagam os de fora sem mexer no layout) e uma busca por nome ou categoria (tira da grade os que não batem, com "Limpar a busca").
- Três cards: a tela do projeto com a etiqueta no canto, o número vermelho grande, o nome, a categoria e o ano e a seta ↗. Balcão Ágil (agentes, 2025), Cobrança Leve (automação, 2024), Medidor (dados, 2026). Telas em modo escuro.
- "Feito com / As ferramentas de sempre.": doze logos (Python, TypeScript, Postgres, n8n, Claude, Docker, Supabase, FastAPI, Redis, LangChain, Node.js, WhatsApp API) numa faixa que corre devagar, com pausa, setas e "Ver todas (12) +", que vira grade com os nomes.

### 03 — Bastidor (alvo: `conceito/03-bastidor`)
- "Por baixo do capô", **"Do rascunho. Ao ar."** (a segunda linha em vermelho), o parágrafo e a ficha do projeto.
- O comparador: o wireframe escuro à esquerda e a tela final à direita, divididos por uma alça vermelha redonda que se arrasta (mouse, toque ou setas do teclado), com as etiquetas "Rascunho" e "No ar".

### 04 — Sobre (alvo: `conceito/04-sobre`)
- "02 / Por trás do código", **"Mais que código. Sistemas que trabalham."** e a bio ao lado.
- Três colunas com fio entre elas: formação e serviços (dois itens com o ano em vermelho, as tags e seis ícones de ferramentas); "Do diagnóstico ao ar" em cinco passos numerados ligados por um fio vermelho; e o card vermelho com aspas, "Agente bom é o que você esquece que está rodando.", a assinatura manuscrita e "Vamos automatizar o que se repete."

### 05 — Trajetória (alvo: `conceito/05-trajetoria`)
- "03 / Trajetória", **"Sempre construindo. Sempre no ar."** e "Experiência & marcos".
- A experiência em sanfona (uma aberta por vez; o ano fica vermelho na aberta; + vira −) e, ao lado, "Alguns marcos", **"No ar. Em uso."** e os três projetos com seta.

### 06 — Contato (alvo: `conceito/06-contato`)
- "04 / Seu próximo projeto", **"Me conta o que se repete."**, o diagnóstico em um dia útil e "Começar uma conversa" com a seta num anel.
- Os canais em linhas com ícone num anel vermelho: e-mail, WhatsApp, agenda, GitHub, LinkedIn, onde.
- Um card escuro inclinado, "Kairo Sistemas · Replay · **Montada ao vivo.**", cujo play vermelho monta a página de novo.
- "Me conta do seu projeto" abre um formulário (nome, e-mail, o que se repete) que monta o e-mail. Rodapé com o nome, a frase e quatro ícones.

### O enxame (a jogada da página)
- **Abertura (~7 s):** a página vazia com o símbolo no centro; os cursores entram pelas bordas e rodeiam o símbolo enquanto a barra diz "Escaneando a página…" (é o tempo das fontes e da foto carregarem). Depois se espalham e desenham o esqueleto do hero, caixa por caixa; o título acende letra por letra; o resto entra digitado, os blocos aparecem e a foto entra em preto e branco e ganha cor.
- **Cada seção** é montada quando o topo dela passa de 62% da tela, e chegam agentes novos pelas bordas (de 18 até uns 29).
- **Duplicar:** nas listas repetidas (números do hero, cards, tags, passos, marcos, canais) só o primeiro item nasce do zero; os outros saem de uma cópia que um agente arrasta, com o cursor de copiar, até a vaga, e o conteúdo é trocado.
- **Ajustar:** a foto do hero, o título dos Projetos, o comparador, a assinatura, o título da Trajetória e a primeira linha do Contato nascem deslocados; um agente os arrasta de volta e eles encaixam com a linha-guia rosa.
- **Testes:** com a seção pronta, um agente testa o filtro dos projetos, arrasta a alça do comparador e abre a segunda experiência da trajetória, voltando depois. O que a pessoa já tocou não é mais testado.
- **Rolou no meio:** a montagem do hero acelera 5×; o que sai da tela fecha na hora; nenhum agente volta para cima atrás de um pedaço que ninguém está vendo.
- **Fim:** com o contato na tela, ou com a página toda montada, os agentes parados formam uma fila que dá voltas soltas, em S, oitos e arcos largos, por cima do texto. A barra mostra "Montada por N agentes em N s".
- **A barra (fixa no pé):** os avatares, o número de agentes, as camadas com a barra de progresso, **Tour** (rola sozinho, parando com cada seção centrada e esperando cada montagem), velocidade 1× / 2× / 4× e "montar de novo".
- `?pronto` na URL abre a página já montada; com movimento reduzido, ela abre montada e sem agentes. `?reel` (ou `?reel=0.75`) baixa só o branco das letras e esconde a barra de rolagem, para gravar a tela com o celular.

### Interações
- Hover e foco mostram a **seleção do editor** (o fio azul com as quatro alças) em volta do que é clicável; clique encolhe a 0,97; as setas andam 3–4 px. Botão vermelho clareia no hover; os anéis enchem de vermelho; nos cards a tela cresce 3,5% e a seta sobe em vermelho.
- Hover desligado enquanto a página rola com o cursor parado.

### Celular (390 px)
- Oito cursores. O hero vira coluna (título na largura da tela, foto, nome, texto, botão em largura cheia, números) em três montagens separadas. Os cards dos projetos viram um trilho lateral com encaixe. Nav só com a marca e "Vamos conversar". Nada rola para o lado e os alvos de toque têm 44 px.

---

## Parte 2 — Como construir (stack)

- **Vite sem framework**: HTML, CSS e JS puros. GSAP 3.15.0, Anton, Caveat e Manrope pelo Fontsource 5.3.0, Vite 8.3.5. As versões estão travadas no `package.json` e no `package-lock.json`.
- **Monte assim, nesta ordem:**
  1. Copie **todo** o conteúdo de `arquivos/site/` para a raiz do projeto, mantendo as pastas (`index.html`, `vite.config.js`, `package.json`, `package-lock.json`, `.gitignore`, `src/`, `public/`, `fonte/`). Copie, não reescreva: o enxame tem mil linhas acertadas uma a uma. Não copie `arquivos/conceito/` nem `arquivos/receitas/` para o site (são os prints de referência e as receitas das imagens).
  2. Rode `npm ci` (instala exatamente as versões do `package-lock.json`). Se o `npm ci` falhar, use `npm install` sem mudar nenhuma versão.
  3. Rode `npm run build` (tem de passar sem erro).
  4. Rode `npm run dev` e abra `http://localhost:5300`. Se a porta estiver ocupada, use `npx vite --port 5301`. Para abrir no celular, na mesma rede Wi-Fi, `npm run dev -- --host` e o endereço de rede que o Vite mostrar.
- O `index.html` só tem as marcas `<!-- @secao nome -->`: o plugin do `vite.config.js` troca cada uma pelo conteúdo de `src/sections/<nome>.html`, no dev e no build. Não cole as seções à mão no `index.html`.
- **Confira contra os prints de `arquivos/conceito/`** com `?pronto` na URL (a página já montada), na tela de 1456 × 840 e na de 390 × 844. Depois, sem `?pronto`: a abertura com o símbolo, a montagem do hero em ~7 s e o Tour até o fim. Console sem erros, nada rolando para o lado no celular. Se algo não bater, o erro está na cópia (arquivo faltando ou alterado), não no código: compare com `arquivos/site/`.
- `fonte/` não entra no site (o Vite não usa a pasta): é a foto original e o script que recorta o fundo, usados só na seção "Personalizar" do guia.
- No fim: `npm run build` gera o `dist/`, que sobe em qualquer hospedagem estática (Vercel, Netlify, Hostinger).
