# Vistal: imobiliária de alto padrão com o hero montado por oito agentes na frente de quem vê

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o site da minha imobiliária** (ou do meu empreendimento) com esta estrutura e esta abertura.
   - **Usar só algumas peças** (a montagem do topo pelos agentes, as residências em abas, a casa por dentro com os cômodos, o agendamento de visita) num site que já tenho.
2. Se for o negócio dela: o nome da imobiliária, os imóveis que quer mostrar (nome, onde, suítes, área, preço), o imóvel em destaque, o CRECI, os contatos e **que material já tem** (fotos dos imóveis por fora e por dentro, logo). Avise desde já:
   - a foto do topo precisa ser de uma casa com **céu limpo em cima** (o nome da marca fica atrás do telhado); com uma foto assim, o código já recorta o céu e faz a versão "crua" sozinho (o guia explica);
   - as fotos das residências e dos cômodos são da demo; com as dela, ficam iguais em paisagem 3:2 (o guia diz o tamanho de cada uma, e `arquivos/receitas/LEIA.md` tem os prompts para gerar).
3. Se forem peças: quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa a landing page de uma **imobiliária de residências de alto padrão chamada Vistal** (marca fictícia): casas de arquitetura autoral, coberturas e terrenos, "visitadas com hora marcada e com a documentação conferida antes da primeira conversa". Leia antes o guia do projeto desta pasta (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes: arquitetura, design system, regras de movimento e do celular, como conferir e como personalizar) e olhe as imagens em `arquivos/conceito/`: são prints do site pronto, o alvo de cada momento, em `-desktop` e `-mobile` (`01-montagem-caixas`, `02-montagem-letreiro`, `03-montagem-textos`, `04-passe-de-cor`, `05-hero`, `06-residencias`, `07-ardosia`, `08-como-funciona`, `09-visita`, `10-rodape`).

**Tudo o que o site usa já vem pronto em `arquivos/`:** o `index.html`, o `vite.config.js` (com o plugin que monta as seções), o código inteiro em `arquivos/src/` (seções em HTML e CSS, a montagem dos agentes e a lógica da página) e as fotos em `arquivos/public/`. Use tudo isso como está: não gere imagem nova, não reescreva os módulos e não troque nada por uma versão "mais simples". O trabalho é montar o projeto, instalar as dependências com as versões certas, copiar os arquivos para o lugar e conferir.

A ideia da página: **o site se monta na frente de quem chega, como uma equipe trabalhando num editor ao vivo**, e termina numa foto de capa de revista: a casa na hora azul, com o nome "vistal" gigante atrás do telhado.
- Abre num **palco escuro com a grade de 12 colunas**. Oito cursores com nome e cor (`layout-01`, `foto-01`, `nav-01`, `vidro-01`, `tipo-01`, `texto-01`, `texto-02`, `cor-01`) entram e desenham, cada um, a caixa pontilhada da sua peça, com seletor e medida.
- Depois cada um faz o seu trabalho: a **foto crua é varrida** por uma linha ciano; o **letreiro é digitado** letra a letra e o kerning é ajustado; a **casa é recortada** para passar na frente das letras; os vidros acendem; a nav, o card e a chamada são digitados. Um **painel da atividade** registra tudo com hora, agente e ação.
- No fim, `cor-01` passa a cor: a foto crua (cinza, luzes apagadas) vira a **hora azul com as janelas acesas**, e a equipe sai da tela no embalo, levando as caixas. Cerca de 8 segundos.
- Embaixo: **residências** em abas (Casas, Coberturas, Terrenos), a **Casa Ardósia por dentro** (cômodos em tela cheia que trocam por dissolve), **como funciona**, o **agendamento da visita** num cartão de vidro e o rodapé com o nome de borda a borda.

Nível de acabamento: site de premiação. Azul quase preto, vidro e a luz quente das janelas; nada de "exclusivo" e "sofisticado" nos textos.

---

## Parte 1 — O site

### Marca e tom
- Marca **Vistal** (fictícia), de "vista", em português do Brasil. O símbolo é o corte de uma casa: laje em balanço, piso de baixo e um pilar (SVG no `src/sections/nav.html` e `public/favicon.svg`).
- Tom sóbrio e direto, frases curtas ("A papelada vem antes da visita").
- Cores (`src/styles/tokens.css`): palco e página `#0b1018`; texto branco; vidro claro `rgba(255,255,255,.14)` com borda `.24`; vidro escuro do card `rgba(12,15,22,.52)`; aba ativa `#0d1016`; o ponto "em destaque" `#ffb35c` (a luz das janelas). As ferramentas dos agentes têm cores próprias (varredura `#5ee0e6`, guia `#ff4fa3` e uma cor por agente).
- Tipos (livres para uso comercial, pelo Fontsource): **Urbanist** 600 no letreiro, na marca e nos nomes das casas; **Geist** na interface e nos textos; **Geist Mono** nas etiquetas, no painel e nos números.

### 01 — Hero (a montagem)
- A cena tem a proporção da foto (3:2) e cobre a tela; o telhado cai a ~50% da altura e o letreiro "vistal" se mede por ele (o telhado corta as letras na mesma altura em qualquer tela). Camadas: grade do palco → foto (crua + cor) → letreiro → recorte da casa (crua + cor, com a máscara) → véu no pé → pílulas de tipo, card e chamada → nav.
- Peças: nav em pílula de vidro (Início, Residências, Ardósia, Como funciona, Contato) e "Agendar visita" branco à direita; três pílulas de tipo à direita ("01 Casas 24 imóveis", "02 Coberturas", "03 Terrenos"); card escuro "Em destaque · Casa Ardósia · Frente para o mar · condomínio fechado · 5 suítes · 6 vagas · 812 m² · R$ 14.800.000 · Ver imóvel"; chamada à direita com "Ver residências".
- A montagem (`src/motion/enxame.js`) é uma lista de tarefas com dono e dependências: cada agente faz as suas na ordem e, sem tarefa liberada, contorna a caixa da próxima peça como quem mede, sem nunca parar. Saída em equipe durante o passe de cor; o contador do painel desce a zero e ele fecha com a saída do último.
- `?pronto` e movimento reduzido abrem o hero já montado. Mudar a largura da janela no meio fecha a montagem na hora. Se o script não subir em 4 s, a página aparece pronta.

### 02 — Residências ("Residências à venda")
- Título centrado, uma linha de apoio e as abas Casas / Coberturas / Terrenos (as pílulas do hero levam à aba certa). Duas fotos 5:4 lado a lado por aba, com nome, onde, suítes, área e preço; o terreno numa faixa 5:2. "Agendar visita" em vidro no canto de cada foto abre a visita com aquele imóvel escolhido.

### 03 — A Casa Ardósia por dentro
- Cena de tela cheia: Sala, Cozinha, Suíte e Varanda trocam por dissolve, com um leve recuo da foto. Legenda no pé esquerdo (andar em caixa alta pequena + nome do cômodo grande), abas no pé direito. Sozinha, anda a cada 4,5 s enquanto está na tela, até alguém tocar nas abas. Ficha em vidro escuro no alto à direita (no celular, logo abaixo da foto) com suítes, vagas, área, terreno, preço e "Agendar visita".

### 04 — Como funciona ("A papelada vem antes da visita")
- Título centrado e três colunas: o texto sobre a Vistal com "Falar com um corretor", a foto em pé da porta de cumaru no meio e dois tópicos com fio à direita (documentação conferida, uma visita por vez).

### 05 — Visita (o fecho)
- A foto da varanda sob um véu liso; à esquerda "Marque a visita", à direita o cartão de vidro: imóvel, os seis próximos dias (sem domingo), horários com alguns ocupados (riscados), nome e WhatsApp com máscara, o resumo da escolha e "Confirmar visita". Confirmar mostra "Visita pedida" com o dia e a hora. Não envia nada (é uma demonstração).

### 06 — Rodapé
- Marca e frase, colunas de links com fio (Residências, Vistal, Contato), linha legal com CRECI fictício e "vistal" de borda a borda, cortado pela base e apagando para baixo.

### Movimento e acessibilidade
- Depois do hero, a página rola nativa (sem rolagem suave por script). As peças entram por marco (`[data-revela]`, por tempo, mesmo se a rolagem passar rápido). A nav fica presa no topo depois da montagem, com um véu escuro passando do hero e a aba da seção atual acesa.
- Hover desligado enquanto a página rola (`html.rolando`); hover só com mouse; foco por teclado com contorno branco; abas com setas, Home e End.
- `prefers-reduced-motion`: hero montado e trocas secas.

---

## Parte 2 — Como construir (stack)

- **Vite sem framework**: HTML, CSS e JS puros. Crie o `package.json` à mão (não use um template do `npm create`, que traz arquivos de exemplo), com `"type": "module"`, `"private": true` e os scripts `"dev": "vite"`, `"build": "vite build"` e `"preview": "vite preview"` (nome e versão à sua escolha), e instale com versão travada, escrito por extenso (`npm install`, não `npm i`), um comando por linha:
  - `npm install -E gsap@3.15.0 @fontsource-variable/urbanist@5.3.0 @fontsource-variable/geist@5.3.0 @fontsource-variable/geist-mono@5.3.0`;
  - `npm install -E -D vite@8.3.5` (dependência de desenvolvimento).
- **Copie os arquivos** com `cp -R` (as pastas inteiras de uma vez, um comando por linha, sem encadear com `&&`: em sessões com permissões restritas, comando composto pede aprovação):

  | de | para |
  |---|---|
  | `arquivos/index.html` | a raiz |
  | `arquivos/vite.config.js` | a raiz (o plugin `secoes` troca cada `<!-- @secao nome -->` do `index.html` por `src/sections/nome.html`; `base: './'`: o `dist/` abre em qualquer pasta da hospedagem) |
  | `arquivos/src/` (a pasta inteira) | `src/` |
  | `arquivos/public/` (a pasta inteira) | `public/` |

  Os comandos, da raiz do projeto: `cp arquivos/index.html .`, `cp arquivos/vite.config.js .`, `cp -R arquivos/src src` e `cp -R arquivos/public public` (sem barra no fim do nome da pasta). Copie antes de existir uma pasta `src/` ou `public/` na raiz (senão o `cp -R` cria `src/src/`). A pasta `arquivos/` continua onde está: não entra no site nem no `dist/`.

  Confira depois da cópia: `src/main.js`, `src/motion/` (`enxame.js`, `agentes.js`, `caixas.js`, `digita.js`), `src/pagina/` (`pagina.js`, `abas.js`, `residencias.js`, `ardosia.js`, `visita.js`), `src/sections/` (nav, hero, residencias, ardosia, como, visita e rodape, cada um em `.html` e `.css`), `src/styles/` (com `site.css`), `public/favicon.svg` e `public/img/` com 13 fotos (`casa.webp`, `casa-crua.webp`, `casa-recorte.webp`, `int-sala`, `int-cozinha`, `int-suite`, `int-varanda`, `res-jatoba`, `res-seixo`, `res-cobertura`, `res-duplex`, `res-terreno`, `sobre-porta`).
- **CSS numa folha só, por `<link>`**: o `arquivos/index.html` já traz, no `<head>`, o script que escolhe o modo (monta ou pronto) antes de qualquer arquivo, o fundo do palco e o "nada transiciona até assentar" inline, e depois `<link rel="stylesheet" href="/src/styles/site.css">` (fontes, tokens e seções por `@import`). Mantenha assim e nunca importe CSS pelo JS: no dev do Vite ele chega depois dos módulos e a página aparece crua por um instante a cada recarregamento.
- Leia o cabeçalho dos módulos antes de mexer em qualquer coisa: `src/main.js` liga a montagem primeiro e depois a página (hover desligado ao rolar, entradas, nav, cômodos e os atalhos para as abas e a visita). O mapa de cada arquivo está no guia.
- `arquivos/conceito/` e `arquivos/receitas/` não entram no site; `arquivos/fonte/` só serve para refazer as fotos (ver o guia).
- No fim:
  - `npm run build` passa sem aviso de arquivo faltando;
  - `npx vite preview` abre o site, a montagem roda inteira (caixas, varredura, letreiro digitado, recorte, passe de cor, equipe saindo), o console fica limpo e recarregar nunca mostra a página sem estilo; `?pronto` abre montado;
  - rolando: as abas das residências trocam as fotos, a Casa Ardósia troca de cômodo sozinha e pelas abas, "Agendar visita" de uma foto leva à visita com aquele imóvel, e o agendamento chega a "Visita pedida";
  - nada rola para o lado no celular (390 px) e a montagem também acontece lá, na composição em coluna;
  - o `dist/` sobe em qualquer hospedagem estática, inclusive numa subpasta. Confira com um servidor estático de verdade, não com o `vite preview` (ele devolve o `index.html` para qualquer caminho e esconde arquivo faltando): copie o `dist/` para uma pasta `imobiliaria/` dentro de uma pasta de teste, rode `python3 -m http.server 8080` na pasta de teste, abra `http://localhost:8080/imobiliaria/` e confira o console sem nenhum 404, a casa recortada na frente das letras e as fotos das seções.
