# Estilo Duolingo: design system

> O livro de histórias: papel branco, títulos redondos em verde e botões que parecem adesivos colados na página.

O Duolingo trata a página como um livro infantil: fundo branco, títulos gordinhos e arredondados e um verde saturado que lê como "resposta certa" assim que aparece. O texto corrido fica num cinza calmo, para o verde e o azul fazerem todo o trabalho de emoção: o verde nos títulos e no progresso, o azul nos links e nas ações de apoio. Os botões e as etiquetas têm cantos bem redondos e contorno grosso de 2 px, como adesivos, sem sombra, sem gradiente e sem vidro. O rodapé é uma faixa verde que fecha a página.

Inspirado no site do Duolingo (https://www.duolingo.com). A ProfitizeBuild não tem relação com as marcas citadas. Os nomes e os logos só identificam a inspiração.

Siga este arquivo em todas as telas do projeto. Ele vale mais que o seu gosto: em caso de dúvida, volte a ele.

## Fundos

| Fundo | Cor | Texto | Texto suave | Acento | Onde |
|---|---|---|---|---|---|
| Papel branco | `#ffffff` | `#4b4b4b` | `#777777` | `#58cc02` | O fundo de todas as seções, com uma ilustração ao lado do texto |
| Verde ansioso | `#58cc02` | `#ffffff` | `#d7ffb8` | `#a5ed6e` | A faixa do rodapé e o botão principal |
| Verde de história | `#d7ffb8` | `#4b4b4b` | `#777777` | `#58cc02` | Um realce suave atrás de um destaque ou de uma conquista |
| Tinta da noite | `#000437` | `#ffffff` | `#afafaf` | `#1cb0f6` | Uma faixa escura de ênfase, usada uma vez na página |

## Acentos e detalhes

- **Verde ansioso** `#58cc02`: Os títulos grandes, o botão principal e a faixa do rodapé: é "vai" e "progresso"
- **Azul faísca** `#1cb0f6`: Os links e o texto dos botões de contorno, o companheiro curioso do verde
- **Folha nova** `#a5ed6e`: Os links do rodapé, sobre a faixa verde
- **Cinza lápis** `#777777`: O texto corrido, que recua para as cores falarem
- **Contorno** `#afafaf`: O contorno de 2 px dos botões e das etiquetas

## Tipografia

Fontes (todas no Google Fonts): Nunito.

O Duolingo usa a Feather nos títulos e a Duolingo Sans no resto, que são dele e não podem ser distribuídas. Aqui e no arquivo vai a Nunito nas duas: a 800 arredondada nos títulos, a 500 e a 700 no texto.

| Uso | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título de seção | Nunito | 800 | 48 a 64 px |
| Título de abertura | Nunito | 700 | 32 px |
| Subtítulo | Nunito | 700 | 19 px |
| Corpo | Nunito | 500 | 17 px |
| Rótulo | Nunito | 700 | 15 px |

## Componentes

- Botão principal: fundo `#58cc02`, texto `#ffffff`, cantos de 12 px.
- Botão secundário: sem fundo, texto `#1cb0f6`, contorno de 1 px em `#afafaf`, o mesmo canto.
- Campo: fundo do próprio fundo, fio `#afafaf`, rótulo em Nunito.
- Cartão: o fundo `#ffffff`, título em Nunito, preço e detalhes em Nunito.

## Faça

- Títulos grandes em verde, redondos e gordinhos, com as letras um pouco mais juntas.
- Texto corrido em cinza médio, para o verde e o azul se destacarem.
- Botões e etiquetas com cantos de 12 px e contorno grosso de 2 px, como adesivos.
- O azul só nos links e nos botões de contorno; o verde no botão principal.
- Seções brancas com uma ilustração colorida ao lado do texto, sem caixa em volta.
- Caixa alta com letras espaçadas só nos rótulos e nos botões.

## Evite

- Nada de sombra, gradiente ou efeito de vidro: tudo é cor chapada.
- Nada de texto colorido no meio dos parágrafos.
- Nenhum canto reto, nem nas etiquetas pequenas.
- A fonte redonda dos títulos nunca em tamanho pequeno.
- As cores das ilustrações (rosa, roxo, amarelo) nunca nos botões e menus.

## Movimento

- Os botões afundam um pouco no clique, como um adesivo apertado.
- Conquistas entram com um pulinho de mola, rápido e alegre.
- As ilustrações balançam de leve, sem distrair do texto.
