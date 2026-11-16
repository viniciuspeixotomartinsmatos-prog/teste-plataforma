# Patina — Motion Design · ProfitizeBuild

TAREFA: montar o filme "Patina" e fazer a versão do negócio da pessoa. Filme de lançamento, 1920×1080, 30 fps, de 20 a 40 s, com música e efeitos sonoros, sem narração. A linguagem: a frase digitada em tinta que assenta sobre uma imagem desfocada; o quadro cheio que encolhe para um card e se copia numa fileira; um wipe em pixels; a pergunta com chaves `{ }` e alças de seleção pulando no tempo; imagens girando no vão de uma palavra e explodindo num painel; as cores das imagens virando uma lista de etapas com ícones; uma barra de pedido de vidro com a digitação em macro; a imagem que se monta de pontos e resolve no drop da música; um baralho 3D de variações; o produto saindo do vão de uma frase em perspectiva e ligado por fios a um resultado em vários formatos; a frase final e o logo travando no silêncio.

O projeto completo vem no pacote: `arquivos/projeto/` (o motor que desenha o filme quadro a quadro, as cenas, a música e os efeitos) e `arquivos/referencia.mp4` (o filme pronto da demonstração: o lançamento da Patina, um estúdio de IA fictício que aprende o visual de uma marca). O guia (`CLAUDE.md` ou `AGENTS.md` nesta pasta) explica o config, cada cena, os limites de texto, as imagens e como conferir. Leia o guia antes de mudar qualquer coisa. Tudo se adapta pelo config (`filmes/<nome>.json`); não mude o código das cenas.

## Antes de começar: pergunte

Faça uma pergunta por vez e espere a resposta. O que já estiver preenchido no bloco PREENCHA, não pergunte de novo.

1. **O que o filme vai lançar?** (a) a demonstração como está, só para ver funcionando; (b) o meu negócio; (c) o negócio de um cliente meu. Em (b) ou (c): o que o negócio vende e para quem (um app, um SaaS, um produto digital, um serviço, uma loja, uma clínica...), o que o filme lança (o negócio inteiro, um produto, uma coleção, um serviço, uma funcionalidade) e, em uma frase, o que muda para o cliente dele. Se a pessoa tiver um site ou o código numa pasta, leia de lá os nomes, o tom e o que ele oferece.
2. **Material da marca.** O nome, o símbolo (SVG de uma cor, ou PNG sem fundo; sem símbolo, o filme usa um disco nas cores da marca), as cores (fundo, texto e uma ou duas cores fortes), a fonte se for gratuita, e o slogan se houver.
3. **As imagens.** Avise já aqui: as cenas de imagem pedem fotos (abertura 1, vão 6 a 8, montagem 1, baralho 4 a 8, formatos 3 ou 4; um filme completo usa de 15 a 25, que podem se repetir). Pergunte o que a pessoa tem: fotos do produto, das peças, do espaço, da equipe trabalhando, do resultado de um serviço, prints do app. Se faltar, ofereça (ver "As imagens" no guia): fotos de banco com licença livre, gerar com o gerador de imagem que ela usar (passe as receitas prontas), ou um filme só de texto, sem as cenas de imagem. Nada de imagem com marca de outra empresa.
4. **O roteiro.** Com as respostas, proponha 2 roteiros diferentes, cada um com: as cenas que entram (e por quê) e a duração que dá; para cada cena, os textos (a linha da abertura, a pergunta do gancho com o destaque, as etapas com ícone, rótulo e valor, o pedido digitado, as quatro palavras do baralho, a frase do manifesto e o cartão do produto, as saídas dos formatos com os chips, a chamada e o slogan) e as imagens de cada uma (qual foto, ou "gerar: <assunto>"). Mostre os dois lado a lado e espere a escolha (ou os ajustes). Regras do roteiro:
   - A demonstração é "Toda imagem de IA parece igual. E se a IA tivesse { o seu gosto }?" e mostra as referências virando um estilo, um pedido virando uma foto, a foto em todos os formatos. Traduza cada jogada para o negócio, sem copiar as frases: a abertura é o problema que o cliente dele sente; o gancho, a pergunta que o produto responde; as etapas, como funciona; o pedido, o que se digita, busca ou agenda nele; a montagem, o resultado; o baralho, as variações; o manifesto, o que a marca é; os formatos, onde o resultado chega.
   - Obrigatórias: gancho, chamada, fecho. Uma cena sem imagem boa fica de fora; o filme corta seco na batida.
   - Textos curtos (os limites estão no guia): a pergunta do gancho cabe numa linha, a chamada também.
   - Nada de número, preço, cliente, prazo ou resultado que a pessoa não deu apresentado como fato. Os chips dos formatos são rótulos de forma ("4:5", "Story", "PDF"), não números de desempenho. Texto que ela não deu e não é fato pode ser provisório, avisado.
   - Sem nome de cidade, estado ou lugar real na copy.

## PREENCHA (opcional; o que ficar em branco, pergunte)

- Lançar: [demonstração / meu negócio: ___ / negócio de cliente: ___]
- O que o negócio vende, para quem, e o que o filme lança: [___]
- Nome, slogan: [___]; símbolo: [caminho do SVG/PNG ___ / disco nas cores]
- Cores: [fundo ___, texto ___, destaque ___, destaque 2 ___]; fonte: [___ / a padrão]
- Imagens: [pasta com fotos ___ / gerar / banco de imagens / só texto]
- Idioma dos textos: [português / inglês / espanhol]

## Montar a demonstração

1. Copie o conteúdo de `arquivos/projeto/` para a raiz desta pasta (`cp -R arquivos/projeto/. .`). Precisa de Node 18+ e do Python 3.
2. `npm install`, `npx playwright install chromium` e o ambiente do som: `python3 -m venv .venv && .venv/bin/pip install numpy scipy soundfile pyloudnorm` (no Windows, `.venv\Scripts\pip`).
3. `node tools/render.mjs demo compara arquivos/referencia.mp4` e abra `out/demo/compara.jpg`: cada par é o quadro da demo ao lado do mesmo quadro da referência, e os dois têm de ser iguais.
4. `node tools/filme.mjs demo --rascunho` gera `out/demo/demo-rascunho.mp4` com som. Se a pessoa escolheu (a), faça o final (`node tools/filme.mjs demo`) e pare aqui.

## O filme da pessoa

1. **Config.** Copie `filmes/demo.json` para `filmes/<marca>.json` e preencha com o roteiro escolhido, de cima a baixo: `marca`, `cores`, `fontes` e as `cenas` (só as que entram, na ordem do guia). Troque todos os textos da demo das cenas que ficam. Antes de renderizar, procure sobras: `grep -niE "patina|linho|domingo|estúdio de ia|chave de estilo|referências|midia/demo" filmes/<marca>.json`. O que aparecer, troque.
2. **Mídia.** Em `midia/<marca>/`: as imagens (JPG, PNG ou WebP, 1000 px ou mais no lado menor; em pé para montagem, baralho e a 1ª e 4ª saída dos formatos; deitada para o fundo do pedido e a 2ª saída), o símbolo (`simbolo.svg`: abra e apague qualquer fundo; de PNG, peça um SVG ou use o PNG sem fundo) e a fonte, se houver. Se for gerar imagens, use as receitas de `midia/demo/receitas/` como modelo (o estilo da marca em todas, o herói primeiro e as variações com ele de referência) e diga à pessoa qual ferramenta usar e quanto custa nela. Os ícones vêm do pacote lucide: confira cada nome em `engine/js/lucide.js` antes de usar.
3. **Folha.** `node tools/render.mjs <marca> linha` (nenhum aviso) e `node tools/render.mjs <marca> folha --passo 15`; abra a imagem. Depois confira em `quadros` (1920×1080) o que é pequeno: as etapas prontas, o pedido no plano aberto, o cartão no manifesto, o grafo dos formatos no fim, o logo travado (use a `linha` para saber os quadros de cada cena). Mostre à pessoa e ajuste o config até passar no critério de aceite. Para olhar uma emenda, 6 a 8 quadros seguidos.
4. **Rascunho e final.** `node tools/filme.mjs <marca> --rascunho` e entregue à pessoa para assistir com som; você confere pelos quadros e pela saída da mixagem (-14 LUFS); corrija o que ela apontar; depois `node tools/filme.mjs <marca>` para o final em `out/<marca>/<marca>.mp4`.
5. No fim, diga à pessoa o crédito obrigatório da música (está em `CREDITS.md`; sem crédito, `--sem-musica` e uma música do app de postar) e liste o que ainda é da demonstração e o que ficou de fora do roteiro.

## Critério de aceite

- A demonstração renderiza igual ao `referencia.mp4` antes de qualquer mudança.
- No filme da pessoa: a marca dela no fecho e na marca-d'água do pedido; as cores dela em tudo (nada do cobre e do verdete da demo quando as cores são outras); nenhum texto cortado, vazando do quadro ou encolhido com aviso; nenhuma palavra nem imagem da demo sobrando; nenhum ícone trocado pelo padrão (aviso de ícone no log).
- As imagens são dela, de banco com licença ou geradas para ela, nítidas no tamanho em que aparecem.
- Cada emenda entre cenas é um corte limpo na batida ou o movimento da própria cena: nada de quadro vazio perdido, piscada ou pulo.
- O MP4 final tem 1920×1080, 30 fps, som em torno de -14 LUFS, e a duração que a linha do tempo diz.
