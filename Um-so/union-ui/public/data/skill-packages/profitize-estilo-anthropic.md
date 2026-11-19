# Estilo Anthropic: design system

> O caderno de pesquisa: pergaminho marfim, títulos e textos em serifa, e um terracota só na ação que importa.

A Anthropic escreve o site como uma publicação de pesquisa em papel antigo. No lugar dos cinzas frios de tecnologia, tons de marfim e aveia dão a cada fundo cara de papel, e uma serifa carrega a voz nos títulos e também no texto corrido, o que é raro em site de tecnologia. A letra sem serifa fica só nos menus, nos botões e nas etiquetas. Nada de sombra: os cartões se separam pelo tom do papel e por um fio fino. Um único terracota aparece no botão da ação mais importante, e o rodapé escuro é a única inversão da página.

Inspirado no site da Anthropic (https://www.anthropic.com). A ProfitizeBuild não tem relação com as marcas citadas. Os nomes e os logos só identificam a inspiração.

Siga este arquivo em todas as telas do projeto. Ele vale mais que o seu gosto: em caso de dúvida, volte a ele.

## Fundos

| Fundo | Cor | Texto | Texto suave | Acento | Onde |
|---|---|---|---|---|---|
| Pergaminho | `#f0eee6` | `#141413` | `#87867f` | `#d97757` | O fundo da página inteira |
| Marfim | `#faf9f5` | `#141413` | `#87867f` | `#d97757` | Os cartões e os painéis, um tom acima do fundo |
| Papel manilha | `#f5e3c7` | `#141413` | `#87867f` | `#c6613f` | O cartão de destaque, como uma página especial de revista |
| Ardósia | `#141413` | `#faf9f5` | `#b0aea5` | `#d97757` | O rodapé e as faixas escuras, a única inversão |

## Acentos e detalhes

- **Argila** `#d97757`: O único destaque: o botão da ação mais importante da página
- **Argila funda** `#c6613f`: O mesmo botão ao passar o mouse ou apertar
- **Aveia** `#e3dacc`: Os painéis agrupados, um papel mais escuro para variar
- **Pedra** `#cccbc8`: Os fios de 1 px entre seções e em volta dos cartões
- **Nuvem** `#b0aea5`: Os textos de apoio e os itens inativos do menu

## Tipografia

Fontes (todas no Google Fonts): Source Serif 4, Inter, JetBrains Mono.

A Anthropic usa fontes próprias, a Anthropic Serif e a Anthropic Sans, que não podem ser distribuídas. Aqui e no arquivo vão a Source Serif 4 no lugar da serifa e a Inter no lugar da sem serifa.

| Uso | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título editorial | Source Serif 4 | 400 | 68 px |
| Título declarativo | Inter | 700 | 61 px |
| Título de cartão | Inter | 600 | 24 px |
| Corpo | Source Serif 4 | 400 | 20 px |
| Menu e etiquetas | Inter | 500 | 12 a 16 px |
| Código | JetBrains Mono | 400 | 16 px |

## Componentes

- Botão principal: fundo `#d97757`, texto `#ffffff`, cantos de 8 px.
- Botão secundário: sem fundo, texto `#141413`, contorno de 1 px em `#87867f`, o mesmo canto.
- Campo: fundo do próprio fundo, fio `#cccbc8`, rótulo em Inter.
- Botões e campo em Inter, mesmo com o texto em Source Serif 4.
- Cartão: o fundo `#faf9f5`, título em Source Serif 4, preço e detalhes em Inter.

## Faça

- Fundo de papel marfim, nunca branco puro.
- Serifa nos títulos e no texto corrido; sem serifa só nos menus, botões e etiquetas.
- Cartões com cantos de 24 px, separados pelo tom do papel e por um fio fino.
- O terracota num botão só por página, o da ação que mais importa.
- Links sempre sublinhados, como num texto impresso.
- O botão cheio com só os cantos de baixo arredondados, como uma aba de fichário.

## Evite

- Nada de cinza frio, azul ou qualquer cor fora dos tons de terra.
- Nada de sombra: a profundidade vem do tom do papel.
- O terracota nunca em ícone, enfeite ou mais de um botão.
- Nada de texto corrido em letra sem serifa.
- Nada de gradiente, brilho ou fundo com cor lavada.

## Movimento

- Tudo calmo: os textos aparecem num fade lento, sem deslizar.
- O sublinhado dos links engrossa de leve ao passar o mouse.
- O botão terracota escurece no hover, sem crescer nem pular.
