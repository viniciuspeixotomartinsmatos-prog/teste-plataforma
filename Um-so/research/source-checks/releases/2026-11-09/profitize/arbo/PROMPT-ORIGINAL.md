# Arbo: landing page de lançamento imobiliário com a torre que se explora andar por andar

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o site do meu empreendimento** com esta estrutura e estas animações.
   - **Usar só algumas peças** (o explorador da fachada com o hover nos andares, a maquete 3D cortada, a galeria dos cômodos) num site que já tenho.
2. Se for o empreendimento dela: o nome, o endereço, quantos andares e unidades, as tipologias (área, suítes, vagas, preço), a incorporadora e a arquitetura, o contato e **que material já tem**. Avise já aqui, com clareza, o que depende de material novo:
   - Textos, preços, status de cada andar (disponível, reservado, vendido), endereço e contato mudam só com texto.
   - **A fachada, o mapa dos andares, a maquete 3D, as fotos dos cômodos e o voo até a cobertura são renders de uma cena 3D do prédio da demo.** Nenhum deles se edita por prompt nem por cima da imagem. Para mostrar o prédio dela, há dois caminhos (o guia, seção "Personalizar", e `fonte/LEIA.md` explicam passo a passo):
     - **Sem 3D:** usar os renders e as fotos que o arquiteto ou a incorporadora já têm (fachada, plantas humanizadas, decorado), com o mapa dos andares pintado à mão. O site tem reserva para o que faltar.
     - **Com 3D:** refazer tudo no Blender (gratuito) com os scripts que vêm prontos. Diga sem rodeio: **renderizar é pesado e, dependendo do computador, leva horas; num notebook sem placa de vídeo pode passar de um dia.**
3. Se forem peças: quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa a landing page da **Arbo**, o lançamento de uma torre residencial fictícia na Vila Nova Conceição, em São Paulo: vinte andares, um apartamento por andar, tipo de 248 m² e cobertura de 316 m² com piscina, entrega em dezembro de 2028. Leia antes o guia do projeto desta pasta (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes: arquitetura, design system, regras de motion, como conferir e como personalizar) e olhe as imagens em `arquivos/conceito/`. São prints do site pronto, o alvo de cada estado, em `-desktop` e `-mobile`: `01-fachada`, `02-andar` (hover no 14º), `03-planta` (a maquete do tipo), `04-galeria` (o living), `06-cobertura` (a maquete da cobertura) e as seções da página (`10-sobre` a `19-rodape`).

**Tudo o que o site usa já vem pronto em `arquivos/site/`**: o `index.html`, o `package.json` com as versões travadas e o `package-lock.json`, o código em `src/` (CSS por seção, os módulos de movimento, os dados das unidades), as imagens, os modelos 3D e os vídeos em `public/`, e as ferramentas para refazer o prédio em `fonte/`. Use tudo isso como está: não gere imagem nova, não reescreva os módulos, não troque versão de biblioteca e não "melhore" nada na montagem da demo. A demo tem de sair idêntica.

A ideia da página: **o prédio é a interface.** A primeira tela é a torre à noite, numa rua arborizada, e cada andar é clicável.
- Passar o mouse num andar acende só ele, com o contorno e um card ligado por um fio: o número, a tipologia, o preço e o status.
- O clique leva para dentro: a fachada aproxima até a laje daquele andar e a laje dissolve na **maquete 3D do apartamento, cortada e mobiliada**, que a câmera mostra de cima, com o card da unidade ao lado.
- Da maquete, a câmera mergulha em cada cômodo até o olhar exato da foto, que ocupa a tela.
- Abaixo do explorador, uma página de lançamento calma e clara: o empreendimento, a arquitetura, o apartamento, a cobertura, as áreas comuns, a ficha e o contato.

Nível de acabamento: site de premiação. Nenhuma transição corta: cada passo dissolve no seguinte, no mesmo lugar da tela.

---

## Parte 1 — O site

### Marca e tom
- Público: compradores de alto padrão em São Paulo (famílias de 35 a 60 anos) e corretores que mostram o lançamento a eles.
- Tom de incorporadora séria: frases curtas, com números concretos ("Cada laje avança 2,4 m sobre a rua"), sem "viva o extraordinário" nem superlativo vazio.
- Tokens (`src/styles/tokens.css`):
  - a noite: ardósia `#0f1620`, `#1a2430`, `#243140` e breu `#070b11`;
  - a luz e os materiais: luz `#f3c98b`, oliva `#6f7350`, travertino `#d9cbb4`, areia `#e2cfa8`, creme `#f1ece3`, papel `#efe9df`;
  - a marca nas seções claras: branco `#ffffff`, musgo `#4c5b34` (botões e logo) e tinta `#12150f`;
  - vidro escuro `rgba(12,18,26,.84)` com fios em creme a 16% e 42%.
- Tipos (Fontsource, livres): **Instrument Serif** 400 e itálico (títulos, números, a marca) e **Inter** 400, 500 e 600 (o resto).
- Logo: "Arbo" em Instrument Serif.

### 00 — Carga e abertura
- Uma tela escura com "Arbo" e uma linha que corre, até as fontes e a fachada chegarem. Então ela some e a fachada recua de um zoom leve perto do hall até o quadro normal; a nav e os textos sobem.

### 01 — Explorador do prédio (alvo: `conceito/01` a `06`)
- **Nav** em pílulas de vidro: "Arbo · Vila Nova Conceição · São Paulo" à esquerda; Empreendimento · Apartamento · Cobertura e o botão creme "Agendar visita" à direita. Depois do explorador, a nav fica clara.
- **Fachada:** a torre na hora azul, com "Lançamento · Rua das Tipuanas, 410" e o título "Vinte andares, *um apartamento* em cada." à esquerda, "Passe o mouse num andar" (no toque, "Clique em um andar") e, no pé, "Entrega dez/2028 · Role para o lançamento ↓". Números dos andares à esquerda da torre.
- **Hover num andar:** o andar acende (o recorte do render aceso), ganha contorno, e o card de vidro aparece ligado por um fio: "Andar", o selo de status (Disponível, Reservado, Vendido), "14º", "Tipo · 3 suítes · 248 m²", o preço ("R$ 10,8 mi") e "Clique para ver a planta". No celular, o primeiro toque mostra o card com "Ver planta →" e o segundo abre.
- **Clique (2º ao 20º):** o zoom pinta a torre em alta, num canvas, até a laje ocupar 72% da largura; a fachada desfoca e a laje dissolve na maquete 3D de frente, que sobe até a vista do corte. O card da unidade entra pela direita: "Apartamento 141", área, suítes, vagas, preço, o texto, a lista dos cômodos e os botões "Ver fotos" e "Voltar à fachada". A maquete flutua e pode ser arrastada, com limite.
- **Cobertura (21º):** um vídeo de 1,3 s parte do quadro da fachada, sobe pelo prédio e termina vendo a cobertura de cima; o último quadro dissolve na maquete sem teto.
- **Galeria:** a câmera mergulha pelo vão sem teto até o olhar exato da foto e dissolve nela; legenda em serifa ("Living e jantar"), "← Voltar à planta" e as abas dos cômodos.
- **No celular:** a torre ocupa a tela em pé, com os números dos andares ao lado; o card do andar sobe no pé da tela com o botão "Ver planta →"; na planta, a maquete fica em cima e o card embaixo, com "Ver fotos" e "Voltar à fachada" presos ao pé; a galeria mostra a foto inteira no meio, com as abas que correm de lado.
- **Reservas:** sem WebGL, com movimento reduzido ou com o modelo ainda carregando, a planta é a imagem fixa do corte inclinada em CSS 3D; sem o vídeo, a cobertura usa o mesmo mergulho dos outros andares.

### 02 — A página (alvo: `conceito/10-sobre` a `19-rodape`)
- **O empreendimento:** a frase "Vinte andares sobre a Rua das Tipuanas, *um apartamento em cada* e a sala *voltada para o norte.*"
- **A arquitetura:** a foto da fachada em destaque, com a nota de vidro (as lajes em balanço de 2,4 m, as jardineiras em zigue-zague, a lâmina de basalto) e o botão "Explorar o prédio".
- **Apartamento tipo** e **A cobertura:** foto grande e texto lado a lado (a cobertura invertida), os números (248 m², 3 suítes, 4 vagas; 316 m², 2 suítes, 6 vagas), o preço e o botão "Ver em 3D", que sobe e abre o explorador já na planta daquele andar; embaixo, três ambientes.
- **Para quem mora:** dois cards de vidro, o lobby com pé-direito de 6 m e o terraço sobre o embasamento.
- **O empreendimento em números:** 22 pavimentos, 20 unidades, 1.480 m² de terreno, dez/2028, e a ficha (endereço, incorporação Seiva, arquitetura Estúdio Linde, paisagismo, interiores, vagas, elevadores).
- **Contato:** "Agende uma *visita* ao decorado.", o telefone e o formulário (nome, telefone, e-mail, tipologia), que valida e simula o envio.
- **Rodapé:** a marca, as colunas de links, o aviso legal ("Imagens meramente ilustrativas…") e "Arbo" gigante.
- Cada bloco entra uma vez, com fade e deslocamento curto, quando chega à tela.

### Interações e movimento
- Todo clicável tem hover, foco visível e estado de clique. Os links da nav e do rodapé, com a planta ou a galeria abertas, primeiro devolvem o explorador à fachada e só então rolam.
- Scroll suave com Lenis no relógio do GSAP; durante as transições do explorador, a página fica travada.
- Movimento reduzido: só fades, a planta é a imagem fixa e o vídeo não toca.

---

## Parte 2 — Como construir (stack)

- **Vite sem framework**: HTML, CSS e JS puros. GSAP 3.15.0 (ScrollTrigger), Lenis 1.3.27, Three 0.187.0 (importado só quando o explorador precisa da maquete), Instrument Serif e Inter pelo Fontsource 5.3.0, Vite 8.3.5. As versões estão travadas no `package.json` e no `package-lock.json`.
- **Monte assim, nesta ordem:**
  1. Copie **todo** o conteúdo de `arquivos/site/` para a raiz do projeto, mantendo as pastas (`index.html`, `package.json`, `package-lock.json`, `.gitignore`, `src/`, `public/`, `fonte/`). Copie, não reescreva: são mais de 4 mil linhas acertadas uma a uma. Não copie `arquivos/conceito/` para o site (são só os prints de referência).
  2. Rode `npm ci` (instala exatamente as versões do `package-lock.json`). Se o `npm ci` falhar, use `npm install` sem mudar nenhuma versão.
  3. Rode `npm run build` (tem de passar; o aviso de bloco grande do `maquete3d` é esperado: é o Three, carregado sob demanda).
  4. Rode `npm run dev` e abra `http://localhost:5197`.
- **Confira contra os prints de `arquivos/conceito/`**, na tela de 1456×840 e na de 390×844: a fachada, o hover no 14º, a planta do 14º, a galeria, a cobertura e cada seção. Console sem erros. Se algo não bater, o erro está na cópia (arquivo faltando ou alterado), não no código: compare com `arquivos/site/`.
- `fonte/` não entra no site (o Vite ignora a pasta). São os scripts que refazem o prédio no Blender e as imagens; só são usados no caminho "com 3D" da seção "Personalizar" do guia, que começa em `fonte/LEIA.md`.
- No fim: `npm run build` gera o `dist/`, que sobe em qualquer hospedagem estática.
