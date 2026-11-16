# Pronto — Motion Design · ProfitizeBuild

TAREFA: montar o filme "Pronto" e fazer a versão do produto da pessoa. Vídeo de lançamento de um produto digital (app, SaaS, plataforma, serviço com IA), 1920×1080, 30 fps, de 33 a 65 s (o ideal para postar: 33 a 45 s), com trilha e efeitos. A história: um cursor de texto pisca no papel e acende no ritmo da música; o problema é digitado e o jeito antigo dá trabalho (uma busca, uma cascata de itens, janelas que se multiplicam); tudo congela, a pergunta da virada é digitada no silêncio e, no drop, **o cursor vira a marca**; a marca se estica e vira a barra do produto, o pedido é digitado com a câmera correndo atrás do cursor e **o mouse clica em enviar**; uma onda escura sai do clique e o produto trabalha (chips, fontes voando, contador, túnel de luz); **o resultado se monta em cartões** e o mouse arrasta um controle; o produto acompanha e avisa no celular, o dedo toca em confirmar; uma lista vira check; uma montagem de outros usos no tempo da música; a frase final e a marca no acorde final.

O projeto completo vem no pacote: `arquivos/projeto/` (o motor que desenha o filme quadro a quadro, as cenas, a trilha, os efeitos sintetizados e as ferramentas) e `arquivos/referencia.mp4` (o filme pronto da demonstração: o pronto, uma busca com IA fictícia, montando um roteiro de viagem). O guia (`CLAUDE.md` ou `AGENTS.md` nesta pasta) explica o config, cada cena e seus limites, os ícones, a mídia e como conferir. Leia o guia antes de mudar qualquer coisa. Tudo se adapta pelo config (`filmes/<nome>.json`); não mude o código das cenas.

## Antes de começar: pergunte

Faça uma pergunta por vez e espere a resposta. O que já estiver preenchido no bloco PREENCHA, não pergunte de novo.

1. **O que o filme vai lançar?** (a) a demonstração como está, só para ver funcionando; (b) o meu produto; (c) o produto de um cliente meu. Em (b) ou (c): o que o produto faz e para quem, que problema ele tira da vida da pessoa (o "jeito antigo" que dá trabalho), o que a pessoa pede a ele (um pedido típico, com detalhes reais) e o que ele entrega de volta. Se a pessoa tiver o site ou o código do produto numa pasta, leia de lá os nomes, os botões e o vocabulário.
2. **O que o produto faz sozinho depois do pedido?** Ele acompanha algo e avisa (um preço, uma agenda, um estoque, uma métrica)? Ele executa uma lista de ações (reserva, agenda, publica, envia)? Ele serve para outros pedidos diferentes (para a montagem)? Cada resposta "sim" é uma cena que pode entrar.
3. **Material da marca.** O símbolo (SVG, ou PNG sem fundo), o nome, as cores (2 a 4 cores vivas da marca e a cor dos botões), a fonte (se for gratuita: Google Fonts, Fontshare) e o que vai na chamada final (onde baixar, o site, a oferta). Avise: o filme é claro (fundo cor de papel); uma marca escura usa as cores dela sobre o papel claro.
4. **Fotos.** Fotos do produto ou do que ele resolve (um prato, um imóvel, um paciente de banco de imagem, um print do app) para o anexo do pedido, os cartões do resultado e a montagem. Avise: sem fotos, essas peças saem com degradês e ícones nas cores da marca, e fica bonito do mesmo jeito; o app de verdade não aparece, a interface é desenhada pelo filme nas cores dela.
5. **O roteiro.** Com as respostas, proponha 2 roteiros diferentes, cada um com: as cenas que entram (e por quê) e a duração total; o problema digitado e o jeito antigo (a busca e os itens da cascata); a pergunta da virada e o slogan; o pedido digitado e os destaques; os chips e as fontes (se houver o "trabalhando"); o resultado (balão, título, cartões, controle, palavras gigantes); o acompanhamento e a notificação; a lista da ação; os cartões e as palavras da montagem; a frase final, a palavra que vira a marca e a chamada. Mostre os dois lado a lado e espere a escolha (ou os ajustes). Regras do roteiro:
   - A demonstração é uma busca que **resolve** (monta o roteiro, fica de olho no preço, reserva). Traduza cada jogada para o produto da pessoa, sem copiar as frases da demo. Exemplo, um app de agenda para clínica: problema "Encaixar paciente dá trabalho." (a planilha, os recados no WhatsApp, as ligações); virada "E se a agenda se organizasse sozinha?"; pedido "Encaixe a Dra. Lívia na quinta à tarde e confirme os pacientes de amanhã."; resultado a semana com os horários; acompanha as confirmações e avisa que um paciente quer remarcar.
   - Um roteiro curto (33 a 45 s: os obrigatórios mais uma ou duas cenas) e um mais completo; diga a duração de cada um.
   - Os textos usam o vocabulário do produto e do público dela, curtos (os limites estão no guia).
   - **Nada de número, preço, cliente, nota ou resultado que a pessoa não deu apresentado como fato.** Pergunte, ou use números de exemplo e marque como exemplo (no subtítulo: "valores de exemplo").

## PREENCHA (opcional; o que ficar em branco, pergunte)

- Lançar: [demonstração / meu produto: ___ / produto de cliente: ___]
- O produto, para quem, o problema que ele resolve: [___]
- Um pedido típico e o que ele entrega: [___]
- Depois do pedido, ele acompanha / executa / serve para outros pedidos: [___]
- Símbolo: [caminho do SVG/PNG ___]; nome ___
- Cores: [gradiente ___, botões ___]; fonte: [___ / nenhuma]
- Chamada final (onde baixar, site, oferta): [___]
- Fotos: [pasta ___ / nenhuma]
- Duração: [curto, 33 a 45 s / completo, até 65 s]

## Montar a demonstração

1. Copie o conteúdo de `arquivos/projeto/` para a raiz desta pasta (`cp -R arquivos/projeto/. .`). Precisa de Node 18+ e do Python 3.
2. `npm install`, `npx playwright install chromium` e o ambiente do som: `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt` (no Windows, `.venv\Scripts\pip`).
3. `node tools/render.mjs demo compara arquivos/referencia.mp4` e abra `out/demo/compara.jpg`: cada par é o quadro da referência ao lado do mesmo quadro do render, e os dois têm de ser iguais.
4. `node tools/filme.mjs demo` gera `out/demo/demo.mp4` com som (de 5 a 15 min, conforme a máquina; `--abas 2` numa máquina fraca). Se a pessoa escolheu (a), pare aqui e entregue o filme.

## O filme da pessoa

1. **Config.** Copie `filmes/exemplo-clinica.json` (curto, marca com símbolo) ou `filmes/demo.json` (completo) para `filmes/<marca>.json` e preencha com o roteiro escolhido, de cima a baixo: `nome`, `marca`, `cores`, `fonte` e as `cenas` (só as que entram; a ordem é sempre a do guia). Troque **tudo**, mesmo o que aparece pequeno ou desfocado (os itens da cascata, as fontes que voam, as linhas dos cartões). Antes de renderizar, procure sobras: `grep -niE "lisboa|bonde|alfama|sintra|voo|pronto|agendu|lívia" filmes/<marca>.json`; o que aparecer, troque.
2. **Mídia.** Em `midia/<marca>/`: o símbolo (`simbolo.svg`; abra e apague qualquer retângulo de fundo), a fonte (se houver) e as fotos. Confira cada nome de ícone no `engine/js/lucide.js`.
3. **Folha.** `node tools/render.mjs <marca> folha` e abra a imagem. Confira em `quadros` (1920×1080) o que é pequeno, e os três momentos do cursor em quadros seguidos (o clique no enviar, o arrasto do controle, o toque na notificação; `linha` diz onde cada bloco começa e o guia diz em que segundo do bloco cai cada um): a ponta em cima do botão certo. Mostre à pessoa e ajuste o config até passar no critério de aceite.
4. **Filme.** `node tools/filme.mjs <marca> --refaz` e entregue `out/<marca>/<marca>.mp4` para a pessoa assistir com som; corrija o que ela apontar e rode de novo.
5. No fim, diga à pessoa o crédito obrigatório da música (está em `CREDITS.md`; sem crédito, `--sem-musica` e uma música do app de postar) e liste o que ainda é da demonstração (fotos, textos) e o que ficou de fora do roteiro.

## Critério de aceite

- A demonstração renderiza igual ao `referencia.mp4` antes de qualquer mudança.
- No filme da pessoa: a marca dela no drop, na barra, na notificação e no fecho; as cores dela em tudo (nenhum violeta ou azul da demo quando a marca é outra); nenhum texto cortado ou vazando da caixa ou do quadro; nenhuma palavra da demo sobrando; nenhum aviso de ícone no log.
- O cursor do mouse e o dedo chegam em cima do botão (enviar, o botão do controle, confirmar), sem pulo entre quadros vizinhos.
- Cada emenda entre cenas é o movimento da própria cena ou um corte seco no tempo forte: nada de quadro preto perdido, piscada ou pulo.
- Nenhum número apresentado como fato sem ter vindo da pessoa.
- O MP4 final tem 1920×1080, 30 fps, som em torno de -14 LUFS e a duração que a `linha` diz.
