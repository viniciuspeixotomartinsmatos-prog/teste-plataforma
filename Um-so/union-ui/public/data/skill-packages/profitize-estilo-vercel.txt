# Estilo Vercel: design system

> O terminal impresso em papel: preto, branco e cinza, títulos grandes e leves e etiquetas pequenas em letra de terminal.

A Vercel é quase toda em preto e branco: um fundo branco gelo, o texto quase preto e bordas tão finas que só se notam de perto. Os títulos são grandes mas leves, com as letras e as linhas bem juntas, e as etiquetas pequenas vêm em caixa alta numa letra de terminal, como um carimbo. Não há foto nem ilustração: a profundidade vem dos tons de cinza e de um fio fino em volta dos cartões, e a única cor é um verde discreto no "✓" das confirmações.

Inspirado no site da Vercel (https://vercel.com). A ProfitizeBuild não tem relação com as marcas citadas. Os nomes e os logos só identificam a inspiração.

Siga este arquivo em todas as telas do projeto. Ele vale mais que o seu gosto: em caso de dúvida, volte a ele.

## Fundos

| Fundo | Cor | Texto | Texto suave | Acento | Onde |
|---|---|---|---|---|---|
| Papel gelo | `#fafafa` | `#171717` | `#4d4d4d` | `#297a3a` | O fundo da página inteira, sem faixas nem divisórias |
| Cartão branco | `#ffffff` | `#171717` | `#666666` | `#297a3a` | Os cartões e os campos, com o fio fino em volta |
| Obsidiana | `#171717` | `#ffffff` | `#a8a8a8` | - | Um cartão invertido de vez em quando, para quebrar a grade |

## Acentos e detalhes

- **Obsidiana** `#171717`: Os títulos e o botão cheio; nunca o preto puro no texto
- **Grafite** `#4d4d4d`: O texto corrido e o botão secundário
- **Fio** `#ebebeb`: As bordas de 1 px em volta dos cartões e dos botões
- **Fumaça** `#a8a8a8`: O texto de exemplo nos campos e os ícones apagados
- **Verde terminal** `#297a3a`: Só no "✓" das confirmações e em palavras curtas

## Tipografia

Fontes (todas no Google Fonts): Geist, Geist Mono.

A Vercel usa a Geist, a fonte dela, e a Geist Mono nas etiquetas. As duas são gratuitas e de licença aberta, então aqui e no arquivo vão elas mesmas.

| Uso | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título do topo | Geist | 450 | 64 px |
| Título de seção | Geist | 400 | 30 px |
| Corpo | Geist | 400 | 16 px |
| Etiqueta | Geist Mono | 400 | 11 px |
| Terminal | Geist Mono | 400 | 13 px |

## Componentes

- Botão principal: fundo `#171717`, texto `#ffffff`, cantos de 6 px.
- Botão secundário: sem fundo, texto `#171717`, contorno de 1 px em `#ebebeb`, o mesmo canto.
- Campo: fundo do próprio fundo, fio `#ebebeb`, rótulo em Geist Mono.
- Cartão: o fundo `#fafafa`, título em Geist, preço e detalhes em Geist Mono.

## Faça

- Texto e botão principal no quase preto, nunca no preto puro.
- Cantos de 6 px em cartões e botões; a pílula só nos botões pequenos do menu.
- Títulos leves, grandes e com as letras bem juntas.
- Etiquetas e detalhes sempre na letra de terminal, pequenas e em caixa alta.
- Cartões separados por um fio fino de 1 px, sem sombra.
- Mostre o produto funcionando: uma janelinha de terminal vale mais que uma foto.

## Evite

- Nenhuma cor além do verde das confirmações.
- Nada de títulos em negrito.
- Nada de sombra para dar profundidade.
- Nada de foto, ilustração ou 3D.
- Nada de cantos grandes e arredondados nos cartões.

## Movimento

- Trocas rápidas e discretas, sem pulo nem mola.
- O texto do terminal aparece linha a linha, como se estivesse rodando.
