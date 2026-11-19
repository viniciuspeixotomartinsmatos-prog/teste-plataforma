# Estilo Wise: design system

> Verde-floresta com um limão elétrico: títulos enormes em caixa alta, tudo em pílula e nenhuma sombra.

A Wise fala alto e com confiança. Um verde-floresta quase preto carrega o texto, a navegação e as seções escuras, e um verde-limão elétrico aparece só onde há uma ação a fazer: o botão principal, a aba ativa, um destaque. Os títulos são blocos de letra pesadíssima, apertada, que anunciam cada seção. O resto fica calmo, num fundo branco com cinzas levemente esverdeados. Botões, abas e etiquetas são pílulas; os cartões têm cantos suaves. Não há gradiente: o ritmo vem de alternar o branco e o verde-floresta, com o limão invertendo junto.

Inspirado no site da Wise (https://wise.com). A ProfitizeBuild não tem relação com as marcas citadas. Os nomes e os logos só identificam a inspiração.

Siga este arquivo em todas as telas do projeto. Ele vale mais que o seu gosto: em caso de dúvida, volte a ele.

## Fundos

| Fundo | Cor | Texto | Texto suave | Acento | Onde |
|---|---|---|---|---|---|
| Papel | `#ffffff` | `#0e0f0c` | `#6a6c6a` | `#163300` | O fundo da página e a maior parte das seções |
| Névoa | `#e8ebe6` | `#0e0f0c` | `#6a6c6a` | `#163300` | Os cartões e os painéis suaves sobre o branco |
| Verde-lavado | `#e2f6d5` | `#163300` | `#454745` | - | Os destaques leves e as etiquetas |
| Floresta | `#163300` | `#ffffff` | `#e2f6d5` | `#9fe870` | As seções escuras e o bloco de enviar, com o título em limão |

## Acentos e detalhes

- **Limão elétrico** `#9fe870`: O fundo do botão principal e da aba ativa; nunca como cor de texto no branco
- **Floresta** `#163300`: Os textos fortes, a navegação, os ícones e o contorno do botão secundário
- **Abeto** `#054d28`: Os cartões dentro das seções escuras
- **Carvão** `#454745`: O texto corrido, no lugar do preto puro
- **Seixo** `#868685`: Os textos de apoio e o fio dos campos

## Tipografia

Fontes (todas no Google Fonts): Inter.

A Wise usa a Wise Sans nos títulos, que é dela e não pode ser distribuída. Aqui e no arquivo vai a Inter no peso 900, com as letras bem juntas; no resto, a Inter mesmo, como no site deles.

| Uso | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título gigante | Inter | 900 | clamp(56px, 8vw, 105px) |
| Título de seção | Inter | 700 | 45 px |
| Subtítulo | Inter | 600 | 25 px |
| Corpo | Inter | 400 | 18 px |
| Legenda | Inter | 500 | 14 px |

## Componentes

- Botão principal: fundo `#9fe870`, texto `#163300`, cantos de pílula.
- Botão secundário: sem fundo, texto `#9fe870`, contorno de 1 px em `#9fe870`, o mesmo canto.
- Campo: fundo do próprio fundo, fio `#2f5a12`, rótulo em Inter.
- Cartão: o fundo `#163300`, título em Inter, preço e detalhes em Inter.

## Faça

- Títulos grandes em caixa alta, pesadíssimos e com as letras bem juntas.
- O limão só no botão principal e na aba ativa: um por seção basta.
- Botões, abas e etiquetas em pílula; cartões e campos com cantos suaves.
- Verde-floresta no lugar do preto, nos textos fortes e nas seções escuras.
- Alterne seções brancas e verde-floresta para dar ritmo à página.
- Ao lado do botão cheio, a segunda ação vira um link sublinhado.

## Evite

- Nada de gradiente, brilho ou sombra forte: o desenho é chapado.
- Nunca o limão como cor de texto sobre o branco: não dá para ler.
- Nada de cantos retos em botões e etiquetas.
- Nada de dois botões cheios lado a lado.
- Nada de preto puro no texto corrido: use o carvão.

## Movimento

- Transições curtas e firmes, sem quicar.
- A aba ativa desliza o limão de uma opção para a outra.
