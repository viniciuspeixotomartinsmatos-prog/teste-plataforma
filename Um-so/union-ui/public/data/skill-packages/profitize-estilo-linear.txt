# Estilo Linear: design system

> Um painel de comando à meia-noite: quase preto, letras brancas e precisas, e um verde-limão elétrico só no botão principal.

A Linear trata o escuro como o chão de tudo: o fundo é um quase preto, e os cartões sobem degrau a degrau em pretos um pouco mais claros, separados por fios finíssimos, não por sombra. O texto é branco e cinza-azulado, em pesos médios, nunca em negrito, com as letras um pouco mais juntas nos títulos. A única cor que chama é um verde-limão elétrico, usado num só botão por tela. O resto da graça vem da própria tela do produto, mostrada grande dentro de molduras escuras, com etiquetas pequenas e códigos em fonte de máquina de escrever.

Inspirado no site do Linear (https://linear.app). A ProfitizeBuild não tem relação com as marcas citadas. Os nomes e os logos só identificam a inspiração.

Siga este arquivo em todas as telas do projeto. Ele vale mais que o seu gosto: em caso de dúvida, volte a ele.

## Fundos

| Fundo | Cor | Texto | Texto suave | Acento | Onde |
|---|---|---|---|---|---|
| Vazio | `#08090a` | `#ffffff` | `#8a8f98` | `#e4f222` | O fundo da página inteira, de ponta a ponta |
| Carbono | `#0f1011` | `#ffffff` | `#8a8f98` | `#e4f222` | As molduras com a tela do produto, os cartões e a barra do topo |
| Obsidiana | `#161718` | `#d0d6e0` | `#8a8f98` | `#e4f222` | Os painéis dentro de cartões, um degrau acima |
| Grafite | `#23252a` | `#d0d6e0` | `#8a8f98` | - | O fundo dos botões discretos e das áreas que respondem ao mouse |

## Acentos e detalhes

- **Verde-limão** `#e4f222`: O único botão colorido, um por tela, e o marcador da aba ativa
- **Fio** `#23252a`: As bordas finas que separam cartões e seções, no lugar da sombra
- **Névoa** `#d0d6e0`: O texto do corpo e dos botões sobre o escuro
- **Verde pulso** `#27a644`: Etiquetas e contornos de apoio, nunca como botão
- **Íris** `#6366f1`: O fundo das etiquetas de categoria, em pequenas doses

## Tipografia

Fontes (todas no Google Fonts): Inter, JetBrains Mono.

Os títulos e o corpo da Linear já são na Inter, que é gratuita. Os códigos e atalhos usam a Berkeley Mono, que é paga: aqui e no arquivo vai a JetBrains Mono no lugar.

| Uso | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título principal | Inter | 510 | 64 a 72 px |
| Título de seção | Inter | 510 | 48 px |
| Subtítulo | Inter | 400 | 32 px |
| Destaque do corpo | Inter | 590 | 20 px |
| Corpo | Inter | 400 | 16 px |
| Código e atalho | JetBrains Mono | 400 | 12 px |

## Componentes

- Botão principal: fundo `#e4f222`, texto `#08090a`, cantos de 6 px.
- Botão secundário: sem fundo, texto `#d0d6e0`, contorno de 1 px em `#23252a`, o mesmo canto.
- Campo: fundo do próprio fundo, fio `#23252a`, rótulo em JetBrains Mono.
- Cartão: o fundo `#0f1011`, título em Inter, preço e detalhes em JetBrains Mono.

## Faça

- O fundo quase preto de ponta a ponta, com os cartões um degrau mais claros.
- Fios finos de 1 px entre as partes, no lugar da sombra.
- O verde-limão num só botão por tela; os outros botões ficam neutros.
- Títulos em peso médio, com as letras um pouco mais juntas.
- A tela do produto grande, dentro de uma moldura escura de cantos de 12 px.
- Códigos, atalhos e números de tarefa na fonte mono, pequenos.

## Evite

- Nada de negrito pesado: o mais forte é o peso médio.
- Nada de gradiente em botões, cartões ou textos.
- Nenhuma segunda cor de botão além do verde-limão.
- Nada de cantos muito redondos: 6 px nos botões, 12 px nos cartões.
- Nada de texto colorido no corpo: só branco e os cinzas-azulados.
- Nada de fotos ou ilustrações: a imagem é sempre a tela do produto.

## Movimento

- Transições curtas e secas, de 150 a 200 ms, sem quicar.
- A tela do produto entra com um fade e uma leve subida, como se acendesse.
- No hover, a borda clareia um tom; nada cresce nem pula.
