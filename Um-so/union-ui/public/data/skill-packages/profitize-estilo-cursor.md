# Estilo Cursor: design system

> Um ateliê em papel creme: títulos leves, tinta quase preta, cantos de 4 px e uma brasa laranja só nos links.

O Cursor parece um caderno editorial, não um painel de software. O fundo é um creme quente, o texto é uma tinta quase preta, e os títulos falam baixo: peso normal, nunca negrito, com as letras se apertando conforme crescem. Uma serifa clássica aparece nos subtítulos e nos textos longos, e uma fonte de código marca os nomes de arquivo, os comandos e as etiquetas. As superfícies são planas como papel, separadas por fios finos e sombras quentes e suaves; os cantos são quase retos, de 4 px, em tudo. Um laranja-brasa acende só os links e as palavras em destaque.

Inspirado no site do Cursor (https://cursor.com). A ProfitizeBuild não tem relação com as marcas citadas. Os nomes e os logos só identificam a inspiração.

Siga este arquivo em todas as telas do projeto. Ele vale mais que o seu gosto: em caso de dúvida, volte a ele.

## Fundos

| Fundo | Cor | Texto | Texto suave | Acento | Onde |
|---|---|---|---|---|---|
| Pergaminho | `#f7f7f4` | `#26251e` | `#7a7974` | `#f54e00` | O fundo da página inteira |
| Osso | `#f2f1ed` | `#26251e` | `#7a7974` | `#f54e00` | Os cartões e as janelas do produto |
| Linho | `#e6e5e0` | `#26251e` | `#7a7974` | `#c08532` | O botão secundário e os selos dos clientes |

## Acentos e detalhes

- **Brasa** `#f54e00`: Só nos links e nas palavras em destaque; nunca como fundo
- **Tinta** `#26251e`: O texto e o fundo do botão principal, no lugar do preto puro
- **Âmbar** `#c08532`: Os botões de ação dentro das telas do produto
- **Floresta** `#34785c`: Os botões de confirmar dentro das telas do produto
- **Pedra** `#cdcdc9`: Os fios de 1 px e as divisórias

## Tipografia

Fontes (todas no Google Fonts): Inter, EB Garamond, JetBrains Mono.

O Cursor usa a CursorGothic e a Berkeley Mono, que são pagas. Aqui e no arquivo vão a Inter no peso 400 nos títulos e no texto e a JetBrains Mono no código; a EB Garamond é a mesma do site deles.

| Uso | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título | Inter | 400 | 72 px |
| Título de seção | Inter | 400 | 36 px |
| Subtítulo editorial | EB Garamond | 400 | 26 px |
| Corpo | Inter | 400 | 16 px |
| Código e etiquetas | JetBrains Mono | 400 | 12 px |

## Componentes

- Botão principal: fundo `#26251e`, texto `#f7f7f4`, cantos de 4 px.
- Botão secundário: sem fundo, texto `#26251e`, contorno de 1 px em `#cdcdc9`, o mesmo canto.
- Campo: fundo do próprio fundo, fio `#cdcdc9`, rótulo em JetBrains Mono.
- Cartão: o fundo `#f2f1ed`, título em Inter, preço e detalhes em JetBrains Mono.

## Faça

- Cantos de 4 px em todos os botões, cartões e campos.
- Títulos sempre no peso normal, com as letras mais juntas quanto maior o tamanho.
- Fundo creme e cartões um tom mais escuro, separados por fios finos.
- A serifa só nos subtítulos e nos textos longos, nunca nos botões.
- A fonte de código nos comandos, nos nomes de arquivo e nas etiquetas.
- O botão escuro ao lado de um botão claro no mesmo grupo.

## Evite

- Nada de branco puro nem de preto puro: tudo é creme e tinta quente.
- Nada de negrito nos títulos.
- Nada de pílula: os cantos ficam em 4 px.
- Nada de gradiente, brilho ou sombra azulada.
- Nunca o laranja como fundo de botão ou de seção.

## Movimento

- Trocas de cor curtas, de 150 ms, sem movimento chamativo.
- O sublinhado aparece no link só ao passar o mouse.
