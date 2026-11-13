# Sobrevoo — Motion Design · ProfitizeBuild

TAREFA: fazer o filme "Sobrevoo" de uma landing page. 1440×1152 (5:4), 60 fps, 14,5 s, com trilha. A página inteira fica deitada num piso de estúdio claro. Uma câmera de drone rasante percorre a página do topo ao rodapé, devagar no começo, rápida no meio e devagar no fim, e as peças da página (cards, fotos, prints do produto, botões) descolam do papel, sobem e inclinam para a câmera. No rodapé, a câmera sobe até ver a página inteira de cima, mergulha de volta no hero, que pousa como um cartão flutuante, e o título entra palavra por palavra.

O projeto completo vem no pacote: `arquivos/projeto/` (o motor em WebGL que desenha o filme quadro a quadro, a captura da página, o render, os efeitos sonoros e o plano da trilha, com uma demonstração já capturada) e `arquivos/referencia.mp4` (o filme pronto da demonstração). O guia (`CLAUDE.md` ou `AGENTS.md` nesta pasta) explica o motor, o arquivo de configuração e onde mexer em cada coisa. Leia o guia antes de mudar qualquer código.

## Antes de começar: pergunte

Faça uma pergunta por vez e espere a resposta. O que já estiver preenchido no bloco PREENCHA, não pergunte de novo.

1. **De qual landing page é o filme?** (a) só a demonstração, para ver funcionando; (b) uma página publicada: peça o endereço; (c) uma página que está no computador: peça a pasta do projeto (você sobe o servidor local dela). A página precisa abrir em 1440 px de largura sem login.
2. **Nome da marca** e **o título do fim**: uma frase curta e uma cauda em itálico, como "Saiba onde está" / "cada real." (a frase com até ~20 caracteres, a cauda com até ~14). A pessoa escreve, ou você propõe 3 opções a partir do título da página.
3. **O que tampa a página e o que fica de fora:** banner de cookies, chat, pop-up, barra de aviso. Liste o que viu ao abrir a página e confirme o que esconder. Meça a altura da página: com mais de ~8.000 px, o voo passa rápido e a vista de cima vira um fio. Nesse caso, proponha esconder as seções longas só de texto (as que não têm nenhuma peça para subir) e só esconda com o sim da pessoa.
   Avise já aqui: o filme mostra a página parada, capturada. O que só existe em movimento (cenas 3D ou WebGL que mudam com a rolagem, vídeos, contadores) aparece como estiver no quadro congelado, ou some. Página cuja graça está nisso rende um filme mais pobre.
4. **Música.** "Tears In Rain", de Scott Buckley (gratuita, CC BY 4.0, você baixa), ou uma faixa da pessoa em MP3.

Em qualquer caminho: monte primeiro a demonstração como está, confira que ela bate com o `referencia.mp4` e só depois faça o filme da página da pessoa.

## PREENCHA (opcional; o que ficar em branco, pergunte)

- Página: [demonstração / endereço ___ / pasta do projeto ___]
- Marca: [nome]
- Título do fim: [frase ___ / cauda em itálico ___ / "proponha"]
- Esconder: [cookies, chat, pop-up... ou "nada"]
- Música: [Tears In Rain / meu arquivo ___]

## Montar a demonstração

1. Copie o conteúdo de `arquivos/projeto/` para a raiz desta pasta (`cp -R arquivos/projeto/. .`). Precisa de Node 18+, do ffmpeg e do Python 3 com numpy, scipy e soundfile; se faltarem, crie um ambiente só para o projeto: `python3 -m venv .venv && .venv/bin/pip install numpy scipy soundfile` e use `.venv/bin/python` no lugar de `python`.
2. `npm install` e `npx playwright install chromium`.
3. Baixe a música: `curl -L https://www.scottbuckley.com.au/library/wp-content/uploads/2019/07/sb_tearsinrain.mp3 -o audio/tears-in-rain.mp3` ("Tears In Rain", de Scott Buckley, CC BY 4.0: o crédito vai na descrição do vídeo, ver `CREDITS.md`).
4. A demonstração (a página "Prado") já está capturada em `captura/prado/`. Não rode a captura para ela.
5. Mostre 8 quadros antes de renderizar: `node tools/quadros.mjs prado 0 1.5 3 4.5 6 7.3 9.3 11` gera `quadros/prado/t-*.png` e uma `folha.jpg`. Abra e confira com o `referencia.mp4` nos mesmos tempos.
6. Filme: `node tools/render.mjs prado` (gera `out/prado/sobrevoo-60.mp4`; leva alguns minutos), `node tools/deixas.mjs prado` (os momentos dos sons, tirados do motor), `python tools/mix.py prado` (gera `out/prado/trilha.wav`) e
   `ffmpeg -i out/prado/sobrevoo-60.mp4 -i out/prado/trilha.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/prado/sobrevoo.mp4`.

## O filme da página da pessoa

O motor não muda: câmera, tempos, curvas, foco e composição do fim valem para qualquer página. O trabalho é o arquivo `sites/<marca>.json` (o nome do arquivo é o nome do site nos comandos), principalmente a escolha das peças que descolam. Use `sites/prado.json` como modelo.

1. **Abrir a página.** Endereço público, ou o servidor local do projeto (`npm run dev`, `npx vite preview`, `python3 -m http.server`). Tire um print em 1440 px de largura e olhe a página inteira antes de escolher qualquer coisa.
2. **Listar as candidatas:** `node tools/elementos.mjs <endereço>` lista cada caixa com cantos arredondados, imagem, botão e link, com a posição e o tamanho. Leia também o HTML e o CSS da página para achar seletores estáveis (classes, não `nth-child`).
3. **Escolher as peças** (`flutuantes`, uma linha por grupo de seletor). É isto que faz o filme:
   - **Descolam:** cards com cantos arredondados, prints e mockups do produto, fotos em moldura, avatares e depoimentos em card, widgets, campos de formulário, botões. Peças que já parecem objetos soltos.
   - **Não descolam:** blocos de texto, títulos, seções e faixas de largura inteira, fundos, a barra do menu inteira, o rodapé, nada com mais de ~1300 px de largura. Elas ficam no papel; o contraste entre o papel e o que sobe é o efeito.
   - **Quantidade:** de 6 a 12 grupos, de 15 a 35 peças no total, espalhadas pela página. Toda seção que tem cards ganha algo; seção só de texto fica no papel.
   - **Altura (`lift`, em px):** peças grandes abaixo do hero, de 150 a 220; fotos e avatares, de 150 a 200; widgets dentro de um card que já sobe (filhos: a captura percebe sozinha que estão dentro de outra peça), de 60 a 90; campos e botões, de 40 a 60.
   - **Hero:** as peças do hero sobem por tempo nos 2 primeiros segundos e devem subir pouco, para o título continuar legível: o print do produto, de 40 a 60; chips, selos e botões, de 15 a 30. Um recorte de largura inteira por cima da imagem do hero (morros, produto, pessoa) leva `"inclina": 0`, o `raio` do cartão do hero e um `lift` só um pouco maior que o da peça que ele cobre, para não abrir fresta.
   - **Leque (`espalha`):** numa linha de 4 ou mais peças pequenas (fotos, logos, avatares), `"espalha": 0.3` a `0.5` abre a linha para os lados depois que ela sobe. Uma linha só por filme, no máximo duas.
   - **Inclinação geral:** `"inclinacao": 22` (graus que a peça vira para a câmera, pela borda de baixo). Página com muitas peças altas: 15.
4. **O resto do config:** `url`, `marca`, `logo` (o seletor do símbolo da marca no menu; se o símbolo não tiver elemento próprio, o logo inteiro, e o ladrilho usa o quadrado da esquerda), `hero` (o seletor da primeira seção), `esconder` (banners, chat, pop-ups, seções autorizadas), `css` (CSS extra injetado na captura, para forçar o estado final das animações de entrada), `titulo` (`frase` e `cauda`) e `alturaCartao` (padrão 880: a altura, em px de página, do cartão que pousa no fim; se o hero tem um objeto no centro que o corte pegaria, use a altura do hero inteiro).
5. **Capturar:** `node tools/captura.mjs sites/<marca>.json` grava `captura/<marca>/`. Confira o `conferencia.jpg` (a página inteira, sem banner nem pop-up) e abra cada recorte em `captura/<marca>/el/`: borda limpa, cantos arredondados sem sujeira, nada cortado, nenhuma peça vazia ou transparente.
   - **Seções em branco no `conferencia.jpg`** quase sempre são animações de entrada (texto que sobe, foto revelada por `clip-path`) que voltaram ao estado escondido quando a captura subiu de volta ao topo. Leia o CSS e o JS da página, ache as classes do estado escondido e do revelado, e force o final no `css` do config, por exemplo `".reveal, .linha > span { opacity: 1 !important; transform: none !important; }"`. Capture de novo e confira até a página inteira aparecer.
6. **Quadros:** `node tools/quadros.mjs <marca> 0 1.5 3 4.5 6 7.3 9.3 11`. Mostre a folha e confira a lista do "Critério de aceite". Ajuste os `lift`, os seletores e o `espalha` e capture de novo até passar. Toda mudança no config pede captura nova.
7. **Filme e som:** os mesmos passos da demonstração, com `<marca>` no lugar de `prado`. Rode `node tools/deixas.mjs <marca>` sempre depois de mudar as peças: cada linha de peças que descola é uma deixa do som.

## Regras

- Não mude a câmera (altura, ângulo, lente), as curvas, os tempos, o foco nem a composição do fim, a menos que a pessoa peça. Os números foram medidos e ajustados juntos; mudar um desmonta os outros. Se a pessoa pedir, mude e refaça as deixas.
- A página é capturada como está, em 1440 px. Não reescreva a página da pessoa para o filme. Se algo aparece mal (animação parada no meio, vídeo preto, imagem que carrega tarde), resolva na captura: o seletor em `esconder`, ou o elemento fora dos `flutuantes`.
- Página muito longa (mais de ~8.000 px) passa mais rápido no voo. Avise a pessoa, e só esconda seções inteiras com a autorização dela.
- Música própria: troque o arquivo em `audio/trilha.json` e acerte os trechos para a entrada forte da faixa cair em 9,97 s, quando o cartão pousa (ver o guia).
- Ao terminar, liste o que ainda é da demonstração (o título, a música) e lembre o crédito da música na descrição do vídeo.

## Critério de aceite

- 0 s: o hero inteiro no quadro, o título dele legível, piso claro acima da página.
- 1,5 a 6 s: as peças descolam conforme entram por baixo, com sombra macia no papel. Nenhuma atravessa outra, nenhuma fica com borda branca ou canto sujo, e o leque abre depois de subir.
- 7,3 s: o rodapé no quadro, e a câmera já começa a subir. 9,3 s: a página inteira de cima, numa faixa.
- 11 s: o cartão do hero pousado, com o selo da marca, a frase e a cauda em itálico em no máximo 2 linhas, e nenhum texto cortado.
- O filme final tem 1440×1152, 60 fps e 14,5 s, com som em torno de -14 LUFS. Os sons das peças caem quando elas sobem, e a entrada da música cai no pouso do cartão.
