# Do Prompt ao Site — Motion Design · ProfitizeBuild

TAREFA: montar e adaptar o filme "Do Prompt ao Site". 1920×1080, 30 fps, 16 s (480 quadros), com trilha. Um pedido é digitado numa caixa de prompt e enviado, e um scan desce pela caixa e a transforma na primeira tela de um site, que cresce até ocupar a tela. Depois, um segundo pedido acrescenta uma seção nova, montada pelo mesmo scan, e a página inteira recua.

O projeto completo vem no pacote: `arquivos/projeto/` (o código que desenha o filme quadro a quadro, as imagens, os efeitos sonoros e o plano da trilha) e `arquivos/referencia.mp4` (o filme pronto da demonstração). O guia (`CLAUDE.md` ou `AGENTS.md` nesta pasta) explica o motor, o mapa de quadros e onde mexer em cada coisa. Leia o guia antes de mudar qualquer código.

## Antes de começar: pergunte

Faça uma pergunta por vez e espere a resposta. O que já estiver preenchido no bloco PREENCHA, não pergunte de novo.

1. **O que o filme vai mostrar?** (a) a demonstração como está, só para ver funcionando; (b) o meu produto ou o meu site; (c) o site de um cliente.
2. **O que o card vira?** É a premissa do filme: o scan transforma a caixa do prompt nesta tela. Opções:
   - a primeira tela do site de verdade: peça o endereço, a pasta do código ou um print da primeira tela em tamanho de computador;
   - uma primeira tela nova no estilo da demonstração (título à esquerda, assunto recortado à direita, sobre um céu);
   - outra tela que a pessoa queira mostrar (o painel de um app, a página de um produto, uma loja).
3. **O pedido digitado.** A pessoa escreve, ou você escreve a partir da tela escolhida. São de 300 a 450 caracteres, no idioma do público, descrevendo a tela que o card vira.
4. **Segundo ato.** Quer o filme de 16 s, com um segundo pedido que acrescenta uma seção? Se sim, qual seção (na demonstração: o estúdio de gravação com o editor) e qual o pedido (de 80 a 120 caracteres). Sem o segundo ato, o filme tem 7,7 s e termina no recuo da página.
5. **Fundo da cena do prompt.** Um assunto recortado à direita da caixa (mascote, produto, pessoa), ou só o céu com as linhas finas. Avise já aqui: um assunto novo é uma imagem recortada, que a pessoa manda ou gera pelas receitas (`arquivos/receitas/LEIA.md`).
6. **Rótulo do modelo** ao lado do botão de enviar: "Opus 5.5", outro nome ou nenhum.
7. **Cores.** Manter o céu azul e o terracota do clique, ou usar as cores da marca (peça os códigos).
8. **Música.** A "Voxscape" da Mixkit (gratuita, você baixa) ou uma faixa da pessoa em MP3.

Em qualquer caminho: monte primeiro a demonstração como está, confira que ela bate com o `referencia.mp4` e só depois adapte.

## PREENCHA (opcional; o que ficar em branco, pergunte)

- Mostrar: [demonstração / meu produto / site de um cliente]
- O card vira: [endereço do site, pasta do código, print ou descrição da tela]
- Pedido digitado: [texto, ou "escreva você"]
- Segundo ato: [sim, com a seção ___ e o pedido ___ / não]
- Fundo da cena: [imagem recortada em ___ / só o céu]
- Rótulo do modelo: [Opus 5.5 / outro / nenhum]
- Cores: [manter / fundo do céu ___, acento do clique ___]
- Música: [Voxscape / meu arquivo ___]
- Idioma dos textos: [português / inglês / espanhol]

## Montar a demonstração

1. Copie o conteúdo de `arquivos/projeto/` para a raiz desta pasta (`cp -R arquivos/projeto/. .`). Precisa de Node 18+, do ffmpeg e do Python 3 com numpy, scipy e soundfile; se faltarem, crie um ambiente só para o projeto: `python3 -m venv .venv && .venv/bin/pip install numpy scipy soundfile` e use `.venv/bin/python` no lugar de `python`.
2. `npm install` e `npx playwright install chromium`.
3. Baixe a música: `curl -L https://assets.mixkit.co/music/571/571.mp3 -o audio/voxscape.mp3` ("Voxscape", de Eugenio Mininni, Mixkit Stock Music Free License).
4. Mostre 4 quadros antes de renderizar o filme: `npm run quadros -- quadros 20 82 114 200` gera `quadros/f020.png` etc. (o pedido digitando, o clique, o scan no meio do card e a página no recuo). Abra as imagens e confira com o `referencia.mp4` nos mesmos tempos (0,67 s, 2,73 s, 3,8 s e 6,67 s).
5. Filme: `npm run render` (gera `out/mudo.mp4`), `python tools/mix.py` (gera `audio/trilha.wav`) e
   `ffmpeg -i out/mudo.mp4 -i audio/trilha.wav -map 0:v -map 1:a -c:v copy -af apad -c:a aac -b:a 256k -shortest -movflags +faststart out/filme.mp4`.

## Adaptar

- **Premissa.** Um scan só: a faixa ciano desce pelo card, e acima dela o card já é a tela nova; quando ela chega ao fim, o card cresce até a tela cheia. Nada de escurecer o card antes, segundo scan, fusão de imagens ou troca de fundo escondida num véu.
- **A tela que o card vira** é HTML de verdade, desenhado em 1920×1080 no bloco PÁGINA do `index.html` (`#hero` = fundo, `#content` = textos e botões, `#nav` = topo). Recrie a tela escolhida nesse bloco:
  - com o site da pessoa (endereço ou código): leia as cores, as fontes, os tamanhos e os textos reais e refaça a primeira tela em HTML e CSS. Fonte paga vira a gratuita mais parecida (Google Fonts ou Fontsource, pelo npm);
  - só com um print: refaça em HTML a partir do print. Usar o print como imagem é o caminho rápido, se a pessoa pedir: um `<img>` de pelo menos 1920 px cobrindo o `#hero` e o `#content` vazio;
  - o que fica ancorado embaixo (`bottom: 0`) acompanha o card quando a altura dele muda. Título em no máximo 2 linhas;
  - sem imagem à direita, recomponha em vez de deixar a metade vazia: título centralizado, ou um print do produto (tela do app, celular) no lugar do assunto recortado.
- **Textos digitados:** em `conteudo.js` (`PROMPT`, `PROMPT2`, `MODELO`, `SEGUNDO_ATO`).
- **Segunda seção:** o bloco SEGUNDA SEÇÃO do `index.html` (1920×1080, logo abaixo da primeira tela). Os movimentos que acontecem dentro dela (a agulha, o clique, o zoom na prévia, as fichas) estão em `film.js`, na parte "estúdio": adapte ou apague os que não fizerem sentido para a seção nova.
- **Fundo da cena:** `assets/salto.png` (troque a imagem, ou apague o `<img id="subject">`). As cores do céu ficam em `film.css` (`#sky`, `#heroSky`).
- **Tempos e movimento:** não mude os tempos, as curvas, a câmera nem o scan, a menos que a pessoa peça. Se mudar, mude as deixas de som do mesmo trecho (ver o guia).
- **Som:** depois de trocar os textos digitados, refaça as teclas: `node tools/deixas.mjs > audio/deixas.json` e `python tools/mix.py --deixas audio/deixas.json`. Sem o segundo ato, mixe com `--dur 7.733` (os efeitos do 2º ato saem sozinhos). Outra música: aponte o arquivo em `audio/trilha.json` e acerte os trechos nos graves dela (ver o guia).
- **Dados:** nada de número, depoimento ou cliente inventado na página. O que faltar fica `[preencher]` e entra na lista final.
- Ao terminar, liste o que ainda é da demonstração (imagens, textos, cores, música).

## Critério de aceite

- Os quadros 20, 82, 114 e 200 (e 300, 370 e 460 com o segundo ato) têm a mesma composição e o mesmo tempo do `referencia.mp4`.
- O scan é uma passada contínua, e o card cresce sem corte. Nenhum texto sai cortado na tela, e nenhum quadro fica vazio ou piscando.
- O filme final tem 1920×1080, 30 fps e a duração certa (16 s, ou 7,7 s sem o segundo ato), com som em torno de -14 LUFS, e o último quadro é preto.
