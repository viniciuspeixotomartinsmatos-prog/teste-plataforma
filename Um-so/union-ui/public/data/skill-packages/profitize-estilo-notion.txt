# Estilo Notion: design system

> O caderno de papel quente: fundo creme, cartões brancos com fio fino e cores vivas só em pílulas e blocos de destaque.

O Notion parece um caderno bem usado sob a luz da tarde: o fundo é um branco quente, quase creme, e os cartões brancos ficam por cima com um fio fino, sem sombra. Os títulos são grandes, sem serifa e com as letras bem juntas, e uma serifa aparece de vez em quando numa frase de abertura, com voz de revista. A cor entra como pontuação: um azul só no botão principal, uma pílula pêssego ou amarela em volta de uma palavra do título e blocos inteiros pintados de amarelo, coral, azul-céu ou azul-noite, como post-its.

Inspirado no site do Notion (https://www.notion.com). A ProfitizeBuild não tem relação com as marcas citadas. Os nomes e os logos só identificam a inspiração.

Siga este arquivo em todas as telas do projeto. Ele vale mais que o seu gosto: em caso de dúvida, volte a ele.

## Fundos

| Fundo | Cor | Texto | Texto suave | Acento | Onde |
|---|---|---|---|---|---|
| Papel quente | `#f6f5f4` | `#000000` | `#615d59` | `#0075de` | O fundo da página inteira, do topo ao rodapé |
| Cartão branco | `#ffffff` | `#000000` | `#696969` | `#0075de` | Os cartões, que ficam sobre o papel com um fio fino |
| Amarelo post-it | `#ffb110` | `#000000` | `#111111` | - | Os blocos de destaque, com o produto dentro |
| Azul-noite | `#02093a` | `#ffffff` | `#e6f3fe` | `#ffb110` | Um bloco escuro de vez em quando, como uma ilha |

## Acentos e detalhes

- **Azul Notion** `#0075de`: O único botão cheio de cada tela
- **Azul clarinho** `#e6f3fe`: O fundo do botão secundário, com o texto em azul
- **Pêssego** `#f6d5b8`: A pílula em volta de uma palavra do título
- **Coral** `#f64932`: Blocos de destaque e enfeites, revezando com o amarelo
- **Azul-céu** `#62aef0`: Blocos claros e os enfeites desenhados à mão

## Tipografia

Fontes (todas no Google Fonts): Inter, Source Serif 4.

O Notion usa a NotionInter, uma versão própria da Inter, e a Lyon Text nas frases de abertura, que é paga. Aqui e no arquivo vão a Inter e a Source Serif 4, as gratuitas mais parecidas.

| Uso | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título do topo | Inter | 700 | clamp(54px, 6.5vw, 96px) |
| Título de seção | Inter | 600 | 54 px |
| Frase de abertura | Source Serif 4 | 400 | 18 px |
| Título do cartão | Inter | 700 | 22 px |
| Corpo | Inter | 400 | 16 px |
| Legenda | Inter | 500 | 12 px |

## Componentes

- Botão principal: fundo `#0075de`, texto `#ffffff`, cantos de 8 px.
- Botão secundário: fundo `#e6f3fe`, texto `#0075de`, o mesmo canto.
- Campo: fundo do próprio fundo, fio `rgba(0, 0, 0, 0.08)`, rótulo em Inter.
- Cartão: o fundo `#f6f5f4`, título em Inter, preço e detalhes em Inter.

## Faça

- Fundo de papel quente na página e cartões brancos por cima, nunca o contrário.
- Um azul só, no botão principal de cada tela; o resto em texto ou no azul clarinho.
- Títulos grandes com as letras bem juntas; o texto corrido no espaçamento normal.
- Cartões com um fio fino e cantos de 12 px; botões com cantos de 8 px.
- Uma palavra do título dentro de uma pílula colorida, para chamar o olho.
- Blocos de destaque pintados de amarelo, coral, azul-céu ou azul-noite, um de cada vez.

## Evite

- Nada de fundo branco puro na página: o creme é a marca do estilo.
- Nada de sombra nos cartões de conteúdo.
- Nenhum segundo botão colorido na mesma tela.
- Nada de gradiente: só cores chapadas.
- A serifa só nas frases de abertura, nunca em menus ou botões.

## Movimento

- O passar do mouse muda as coisas em 200 ms, suave.
- Os bonequinhos e enfeites do topo entram com um pulinho de mola.
