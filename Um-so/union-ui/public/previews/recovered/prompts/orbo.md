# ORBO: landing page de estética automotiva com o carro em 3D visto de cima

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o site da minha estética automotiva** (ou lava-rápido, PPF, polimento, envelopamento) com esta estrutura e estas animações.
   - **Usar só algumas peças** num site que já tenho:
     - o carro 3D que vira desenho técnico;
     - o mapa de serviços com o fio até a área do carro;
     - o trilho de fotos na frente da palavra gigante;
     - as polaroides arrastáveis;
     - as dúvidas em caixas.
2. **Se for a estética dela**, pergunte:
   - o nome e os serviços com o preço "a partir de";
   - o WhatsApp, o endereço, os horários e as redes;
   - **que material já tem**: fotos dos carros que entregou, uma foto do estúdio, avaliações reais com nome e carro, e o logo.

   Avise já aqui, com clareza, o que depende de material novo:
   - Nome, serviços, preços, contatos, horários e dúvidas mudam só com texto.
   - **O carro 3D é um modelo pronto**: um Aston Martin DB11 sem emblemas, de licença livre, com crédito obrigatório no rodapé. Ele serve para qualquer estética, e a cor da pintura muda no código. Outro carro precisa de um modelo 3D novo preparado no Blender (o guia explica) e não sai por prompt.
   - **As fotos dos trabalhos, do estúdio e das avaliações são fotos de banco** de carros que não são dela. O site fica muito mais forte com fotos dos carros que ela entregou e do estúdio dela.
   - **As avaliações, a nota do Google e os preços da demo são inventados**: só entram os reais.
3. **Se forem peças:** quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa a landing page da **ORBO**, uma estética automotiva fictícia que faz lavagem detalhada, polimento, vitrificação, PPF, higienização interna e faróis, e agenda pelo WhatsApp.

Leia antes o guia do projeto desta pasta (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes). Ele traz a arquitetura, o design system, as regras do carro e do celular, como conferir e como personalizar.

Olhe também as imagens em `arquivos/conceito/`. São prints do site pronto, em `-desktop` (1456 × 840) e `-mobile` (390 de largura, em 2×):

- `01-hero`;
- `02-passagem`;
- `03-mapa` (a lavagem acesa) e `03-mapa-2` (a higienização, com o interior em raio X);
- `04-trabalhos`;
- `05-estudio`;
- `06-avaliacoes`;
- `07-duvidas` e `07-duvidas-2` (uma aberta);
- `08-fecho`;
- `09-rodape`.

**Tudo o que o site usa já vem pronto em `arquivos/site/`:**

- o `index.html` e o `vite.config.js`;
- o `package.json`, com as versões travadas, e o `package-lock.json`;
- o código em `src/`: o CSS de cada seção, os módulos de motion e o palco 3D;
- em `public/`, o modelo `modelo/db11.glb` e o favicon;
- em `fonte/`:
  - `fotos.mjs`, o script que baixa e recorta as fotos de banco;
  - `prepara_db11.py`, o script do Blender que preparou o modelo;
  - a licença do modelo e os créditos das fotos.

As fotos não vêm no pacote: `npm run fotos` baixa cada uma do site de origem (Unsplash e Pexels) e grava os WebP em `public/img/`.

Use tudo isso como está. Não gere imagem nova, não reescreva os módulos, não troque versão de biblioteca e não "melhore" nada na montagem da demo. A demo tem de sair idêntica.

A ideia da página: **um carro só, visto de cima, preso no centro, e o mundo muda em volta dele.**

- Na abertura, uma faixa diagonal varre a tela escura e deixa o azul. O carro chega empoeirado pela direita e freia, e uma faixa de luz passa por ele deixando a pintura limpa.
- Rolando, a meia-lua preta do hero cresce e engole o azul. O papel claro sobe por trás do carro, e o carro vira um desenho técnico de linha fina.
- A cada passo da rolagem, um serviço acende a área dele no desenho, com o rótulo e o preço ao lado e um fio até o ponto do carro.
- Depois vêm os trabalhos entregues, o estúdio, as avaliações, as dúvidas e o fecho. No fecho, o mesmo carro sai dirigindo quando chega o rodapé.

Nível de acabamento: site de premiação.

---

## Parte 1 — O site

### Marca e tom
- Público: dono de carro que quer o carro bem cuidado e protegido e agenda pelo WhatsApp.
- Tom direto e confiante, de estúdio caprichado, com o preço "a partir de" às claras. Nada de "experiência única", "paixão por carros" ou "o melhor da região".
- **Cores** (tokens em `src/styles/tokens.css`):
  - azul elétrico `#1238ff` em bloco (hero, trabalhos, card do fecho);
  - preto `#060607` (meia-lua, estúdio, avaliações, rodapé);
  - papel `#f2f1ec` (desenho técnico, dúvidas) e tinta `#10131c` (texto e linhas sobre o papel);
  - a faixa da abertura em `#3d5bff`;
  - branco.
- **Tipo:** **Archivo** variável pelo Fontsource (livre).
  - Largura 125%, peso 850–900 e caixa alta no nome, nos títulos, nos serviços e no menu (classe `.larga`).
  - Largura normal no texto corrido.
  - No celular os títulos caem para largura 104%, para caber em duas linhas.
- **O carro:** um esportivo preto, sempre visto de cima, com o bico para a esquerda (no celular, para cima). O acabamento é **matcap chapado**: preto fosco com volume suave (teto e capô um pouco mais claros), uma borda azul que assenta o carro no fundo, e nenhum reflexo realista.

### Regras de movimento (valem para a página inteira)
1. **Curvas próprias** (CustomEase, em `ease.js`):
   - `ob-out` `0.16,1,0.3,1` nas entradas;
   - `ob-in` `0.7,0,0.84,0` nas saídas;
   - `ob-io` `0.86,0,0.07,1` nos blocos;
   - `ob-freio` no carro freando: chega rápido e assenta sem passar do ponto.
2. **Uma cena presa só** (hero → passagem → mapa), de 7,8 telas no desktop e 5 no celular.
   - **Segue a rolagem:** a meia-lua crescendo, o papel subindo, o carro indo da caixa do hero para a do mapa e virando desenho.
   - **Troca por marco, com tempo fixo:** o texto, a área acesa e o fio.
3. **Texto nunca preso ao scroll.** Títulos entram por máscara de linha (sobem de dentro dela, ~1 s) e saem no lugar. Rolando rápido, cada marco termina inteiro.
4. **Freio na rolagem** (`guia.js`): a página sempre rola presa ao gesto e nunca para sozinha. A roda tem teto de ~0,9 tela por segundo; no toque, a rolagem é a nativa.
5. **Títulos com no máximo duas linhas.** Nada de HUD, rótulo com traço, contador "01/06", "role para..." ou linha decorativa.

### 0 — Abertura (~2,4 s, por tempo; termina no hero)
- Tela preta. Uma faixa diagonal ("/", azul `#3d5bff`) atravessa da esquerda para a direita em ~1 s e deixa o azul atrás dela.
- As letras de ORBO entram de lado, uma depois da outra, saindo de um borrão.
- O carro chega pela direita, **empoeirado** (pintura bege-acinzentada com manchas), e **freia** no lugar. A meia-lua sobe um pouco por baixo.
- Uma **faixa de luz diagonal**, na mesma inclinação, atravessa o carro devagar (~1 s). Por onde ela passa, a pintura fica preta e limpa.
- A nav acende; o título e o botão entram por último.
- Rolar, clicar ou teclar acelera a abertura até o fim (5×), sem segurar a página. Com movimento reduzido, ou com a página aberta já rolada, abre direto no hero.

### 1 — Hero (`01-hero`)
- **Nav:**
  - à esquerda, o menu (duas linhas);
  - no centro, "ORBO" pequeno;
  - à direita, "Agendar" numa pílula com contorno.
- **ORBO gigante** em branco no topo. O carro fica por cima do pé das letras e entra um pouco na **meia-lua preta**, um círculo mais largo que a tela subindo de baixo.
- Na meia-lua, centrados:
  - **"Polimento, vitrificação e PPF. / Seu carro com brilho de zero."** em caixa alta larga;
  - o botão **"Agendar pelo WhatsApp"** (pílula branca com a seta num círculo azul).
- **Cursor:** com mouse, o brilho da pintura segue o cursor numa mola que passa do ponto e volta.
- **Celular:** o carro fica em pé (bico para cima) entre o ORBO e a meia-lua.

### 2 — Passagem (`02-passagem`)
- O título e o botão saem. O ORBO sobe e some.
- A meia-lua **cresce até cobrir a tela**, e o **papel claro sobe de baixo, por trás do carro**.
- O carro continua no centro e encolhe para a caixa do mapa.

### 3 — Mapa de serviços (`03-mapa`, `03-mapa-2`)
- O carro **vira desenho técnico** de linha fina em tinta: contorno, vincos, rodas e o **interior visto pelo teto** (bancos, volante), em traço mais fraco.
- **"Do capô / ao carpete."** entra no alto à esquerda.
- **Seis serviços, um por marco** (a cada 10% da cena):
  - **Ao entrar**, a área do serviço acende no desenho: as linhas ficam azuis e a área ganha um azul a 20%.
  - **O rótulo** entra numa coluna ao lado do carro: o nome em caixa alta larga, uma frase e a pílula azul do preço.
  - **O fio** fino se desenha do rótulo até o ponto da área, e um ponto azul acende na ponta.
- **Os seis serviços:**
  1. **Lavagem detalhada**, o carro inteiro por fora: "Shampoo neutro, descontaminação da pintura e das rodas e secagem sem risco." — a partir de R$ 120.
  2. **Polimento técnico**, só a pintura: "Tira riscos finos e marcas de lavagem em três etapas: corte, refino e lustro." — a partir de R$ 690.
  3. **Vitrificação**, pintura, vidros e rodas: "Camada cerâmica que protege a pintura por até três anos e faz a água escorrer." — a partir de R$ 1.290.
  4. **PPF frontal**, capô, para-choque, para-lamas até a porta e retrovisores: "Película transparente no capô, para-choque, para-lamas e retrovisores contra pedrinhas da estrada." — a partir de R$ 3.900.
  5. **Higienização interna**, o interior em **raio X**, com as linhas da cabine fortes e nada por cima: "Bancos, carpete e teto com extratora; couro limpo e hidratado." — a partir de R$ 390.
  6. **Faróis**: "Lixamento, polimento e verniz UV: o farol amarelado volta transparente." — a partir de R$ 220.
- **Celular:** o rótulo fica embaixo, de borda a borda, e o fio sobe até a área.

### 4 — Trabalhos (`04-trabalhos`)
- Fundo azul. **ENTREGUES** gigante em preto, na largura toda, atrás das cartas, andando devagar no sentido contrário.
- **"Carros que / saíram daqui."** no alto à esquerda e o botão escuro "Ver mais no Instagram" no pé.
- **Seis cartas brancas** inclinadas, como polaroides: foto 4:5 e a legenda (o carro em negrito, o serviço em cinza).
  - Elas passam de lado **presas à rolagem**, linear e contínuo, sem trava por carta.
  - As legendas: Porsche 911 · Vitrificação; Polestar 2 · Polimento técnico; Audi TT · PPF frontal; Porsche 356 · Polimento e vitrificação; BMW M4 · Vitrificação; Renault Mégane · Lavagem detalhada.
- **Celular:** trilho lateral nativo com encaixe (carta de 74% da largura), sem a rolagem presa.

### 5 — O estúdio (`05-estudio`)
- Uma foto de ponta a ponta: um carro preto fosco sob luminárias de LED no teto.
- Degradê escuro no pé, com a legenda à esquerda:
  - o rótulo "O estúdio";
  - **"Box fechado, / luz de inspeção."**;
  - "O carro fica num box climatizado, longe de poeira e sol, do começo ao fim do serviço. Você acompanha pelo WhatsApp."

### 6 — Avaliações (`06-avaliacoes`)
- **No topo**, sobre o fundo preto: **"Quem deixou / o carro aqui."** e, à direita, "5,0 no Google · 312 avaliações".
- **Seis polaroides** espalhadas e inclinadas. Cada uma tem a foto 4:3 do carro do cliente, a frase entre aspas e "Nome · Carro" em azul.
  - **Entrada:** caem no lugar uma a uma quando o mural aparece.
  - **Arrastar:** dá para **pegar, arrastar e jogar** cada uma. Ela inclina para o lado em que anda, segue no embalo com atrito e bate nas bordas do mural.
  - **No toque**, só o arrasto de lado pega a foto; o vertical rola a página.
- **Os depoimentos:**
  - Renata · VW Fusca: "Entreguei o carro com a pintura cheia de marca de lava-rápido e voltou parecendo de vitrine."
  - Marcelo · Toyota Corolla: "Fiz a vitrificação faz um ano e a água ainda escorre como no primeiro dia."
  - Juliana · Jeep Wrangler: "Mandei foto, recebi o orçamento em meia hora e o carro ficou pronto no dia combinado."
  - Paulo · Porsche 911: "O PPF salvou meu capô numa viagem de estrada de terra. Nenhum arranhão."
  - Camila · Fiat 500: "A higienização tirou até o cheiro do cachorro. Parece carro novo por dentro."
  - Eduardo · Suzuki Swift: "Os faróis estavam amarelos e opacos. Voltaram transparentes, e o farol alto ilumina de novo."
- **Celular:** duas colunas, três linhas.

### 7 — Dúvidas (`07-duvidas`, `07-duvidas-2`)
- Fundo de papel, com "Dúvidas" à esquerda e seis caixas com contorno à direita.
- **A aberta vira bloco azul** com texto branco, e o + vira −. Uma aberta por vez, com a altura animada.
- As perguntas: "Quanto tempo o carro fica no estúdio?", "Quanto dura a vitrificação?", "O polimento tira todos os riscos?", "Vocês buscam e levam o carro?", "Como faço o orçamento?", "Quais as formas de pagamento?". As respostas estão no `index.html`.

### 8 — Fecho (`08-fecho`)
- Um **card azul** de cantos arredondados, com uma margem preta em volta.
- **O título "Seu carro / merece / esse brilho."** é revelado palavra por palavra: um bloco preto cresce sobre a palavra e recolhe para o outro lado, deixando-a.
- **O carro**, o mesmo do topo, fica parado no meio do card. Embaixo, "Agendar pelo WhatsApp" e "Avaliação gratuita no estúdio".
- **A saída:** quando o rodapé começa a aparecer, o carro **sai dirigindo pela esquerda**, acelerando, por tempo (1,5 s). Subindo de volta, ele volta para a vaga freando.

### 9 — Rodapé (`09-rodape`)
- Fundo preto, em quatro colunas:
  - ORBO com "Estética automotiva. Polimento, vitrificação, PPF e higienização com hora marcada.";
  - Serviços (links);
  - Estúdio: "Rua das Acácias, 480 / Galpão 3", "Seg. a sex., 8h às 18h / Sáb., 8h às 13h";
  - Contato: WhatsApp, Instagram e o e-mail.
- **Linha de baixo:** "© 2026 ORBO Estética Automotiva" e **o crédito do modelo 3D**, obrigatório pela licença CC-BY.
- **ORBO gigante** cortado pela borda de baixo.

### Nav e menu
- **A cor da nav troca sozinha:** tinta sobre o papel do mapa e sobre as dúvidas, branca no resto.
- **O menu:** o botão vira um X e a tela preta desce (`clip-path`), com os seis links gigantes e os horários embaixo.
- **Os links** andam 14 px e ficam azuis no hover, e rolam até a seção (Serviços para no começo do mapa, dentro da cena presa). Esc fecha e devolve o foco.
- **Barra de rolagem** própria e fina, com a nativa escondida.

### Interações (tudo que é clicável)
- **Botões em pílula:** no hover, a seta sai pela direita e outra entra pela esquerda, e o fundo clareia um tom. No clique, afundam para 0,98. O foco tem contorno branco (azul sobre o papel).
- **"Agendar" da nav:** enche de branco com o texto azul (de tinta sobre o papel).
- **Caixas das dúvidas:** escurecem de leve no hover.
- **Polaroides:** ganham sombra maior no hover e mais ainda pegas.
- **Links do rodapé:** ficam azul-claros.
- **Regras gerais:**
  - hover só dentro de `@media (hover: hover)`;
  - toque sem o realce cinza;
  - alvos de toque de 44 px;
  - um link "Pular para os serviços" que aparece no Tab.

### Movimento reduzido
Abre direto no hero, sem abertura, sem Lenis e sem o brilho seguindo o cursor. Texto só com opacidade, e trocas sem animação.

---

## Parte 2 — Como construir (stack)

- **Vite sem framework.** As bibliotecas, com as versões travadas no `package.json` e no `package-lock.json`:
  - three 0.186.1, GSAP 3.15.0 (ScrollTrigger, SplitText e CustomEase), Lenis 1.3.26 e @fontsource-variable/archivo 5.2.8;
  - Vite 8.3.3 e sharp 0.35.5 (sharp só para o script das fotos).
- **Monte assim, nesta ordem:**
  1. **Copie todo o conteúdo de `arquivos/site/`** para a raiz do projeto, mantendo as pastas (`index.html`, `vite.config.js`, `package.json`, `package-lock.json`, `.gitignore`, `src/`, `public/`, `fonte/`).
     - Copie, não reescreva: o palco 3D tem shaders acertados um a um.
     - Não copie `arquivos/conceito/` nem `arquivos/receitas/` para o site: são os prints de referência e as receitas.
  2. **Rode `npm ci`**, que instala exatamente as versões do `package-lock.json`. Se ele falhar, use `npm install` sem mudar nenhuma versão.
  3. **Rode `npm run fotos`.** Ele baixa as 13 fotos de banco e grava os WebP em `public/img/` (precisa de internet). Se uma foto não baixar, o erro mostra a página dela: baixe por lá, salve no caminho que o erro indicar e rode de novo.
  4. **Rode `npm run build`**, que tem de passar sem erro.
  5. **Rode `npm run dev`** e abra `http://localhost:5232`.
     - Se a porta estiver ocupada, use `npx vite --port 5233`.
     - Para abrir no celular, na mesma rede Wi-Fi, use `npm run dev -- --host` e o endereço de rede que o Vite mostrar.
- **Confira contra os prints de `arquivos/conceito/`**, na tela de 1456 × 840 e na de 390 × 844:
  - a abertura terminando no hero;
  - a cena presa até o sexto serviço;
  - o trilho, o estúdio, as polaroides e as dúvidas;
  - o fecho e o carro saindo no rodapé.

  O console fica sem erros, e nada rola para o lado no celular. Se algo não bater, o erro está na cópia (arquivo faltando ou alterado) ou numa foto que não baixou: compare com `arquivos/site/`.
- **`fonte/` não entra no site** (o Vite não usa a pasta). Ela guarda o script das fotos e os originais baixados, o script do Blender que preparou o modelo (só para trocar de carro), a licença do modelo e os créditos das fotos.
- **No fim:** `npm run build` gera o `dist/` (com o modelo 3D de 1,2 MB), que sobe em qualquer hospedagem estática (Vercel, Netlify, Hostinger).
