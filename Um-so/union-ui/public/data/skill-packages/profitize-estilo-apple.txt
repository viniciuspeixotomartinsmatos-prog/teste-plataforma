# Estilo Apple: design system

> A galeria branca: o produto no centro, a tipografia preta e compacta, e um azul só para os links e os botões.

A Apple trata a página como uma galeria: a foto enorme do produto ocupa o centro, e a tipografia preta e compacta dá a cada frase um peso quase editorial. As seções alternam o branco e um cinza muito claro, sem sombra nem gradiente; os cantos arredondados nas fotos suavizam o desenho sem virar um painel de cartões. Um único azul saturado aparece só nos links e nos botões de compra.

Inspirado no site da Apple (https://www.apple.com). A ProfitizeBuild não tem relação com as marcas citadas. Os nomes e os logos só identificam a inspiração.

Siga este arquivo em todas as telas do projeto. Ele vale mais que o seu gosto: em caso de dúvida, volte a ele.

## Fundos

| Fundo | Cor | Texto | Texto suave | Acento | Onde |
|---|---|---|---|---|---|
| Branco galeria | `#ffffff` | `#1d1d1f` | `#6e6e73` | `#0066cc` | O fundo da página e as seções de produto |
| Névoa | `#f5f5f7` | `#1d1d1f` | `#6e6e73` | `#0066cc` | As faixas alternadas e o rodapé |
| Vitrine escura | `#000000` | `#f5f5f7` | `#86868b` | `#2997ff` | As seções de destaque, com o produto no escuro |

## Acentos e detalhes

- **Azul dos links** `#0066cc`: Os links no meio do texto
- **Azul de compra** `#0071e3`: Os botões cheios: Comprar, Saiba mais
- **Fio** `#d2d2d7`: As divisórias de 1 px e os contornos

## Tipografia

Fontes (todas no Google Fonts): Inter.

A Apple usa a SF Pro, que é dela e não pode ser distribuída. Aqui e no arquivo vai a Inter, a gratuita mais parecida.

| Uso | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título do produto | Inter | 600 | clamp(48px, 6vw, 96px) |
| Título de seção | Inter | 600 | 48 px |
| Subtítulo | Inter | 500 | 28 px |
| Corpo | Inter | 400 | 17 px |
| Legenda | Inter | 400 | 12 px |

## Componentes

- Botão principal: fundo `#0071e3`, texto `#ffffff`, cantos de pílula.
- Botão secundário: sem fundo, texto `#0071e3`, contorno de 1 px em `#0071e3`, o mesmo canto.
- Campo: fundo do próprio fundo, fio `#d2d2d7`, rótulo em Inter.
- Cartão: o fundo `#f5f5f7`, título em Inter, preço e detalhes em Inter.

## Faça

- O produto no centro, em foto grande, com bastante branco em volta.
- Títulos curtos em preto, com as letras um pouco mais juntas.
- Um azul só, para os links e os botões; o resto em preto e cinza.
- Seções brancas e cinza-claro alternadas para separar os assuntos.
- Cantos arredondados nas fotos e nos cartões, sem contorno.

## Evite

- Nada de sombra, gradiente ou borda grossa nos cartões.
- Nenhuma segunda cor de destaque.
- Nada de blocos longos de texto: uma frase por ideia.
- Nada de ícones decorativos em volta do produto.

## Movimento

- O produto entra devagar com a rolagem, sem pular.
- Os textos aparecem num fade curto, de baixo para cima.
