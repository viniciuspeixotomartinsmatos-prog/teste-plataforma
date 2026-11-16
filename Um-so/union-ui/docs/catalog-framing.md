# Enquadramento do catálogo

A grade usa cards 16:9, três colunas no desktop, duas no tablet e uma no celular. Favoritar, comparar, abrir e editar são ações independentes. Os totais da navegação contam os cards após o agrupamento de variantes. A lista mantém títulos e metadados legíveis.

O modo Inteligente usa a proporção da mídia, o tipo de recurso e a região protegida quando disponível. Para recortes pequenos, tenta ajustar o ponto focal. Para recortes que atingiriam a região protegida ou mídias com proporção distante do card, preserva a imagem inteira. Capturas de interfaces usam um limite mais conservador. Regiões de texto, botões e imagens são estimadas pelo layout do DOM durante a captura. Vídeos e imagens existentes sem esses dados usam proporção e tipo de recurso. A análise não identifica semanticamente rostos ou produtos.

## Ajuste manual

Após aplicar `supabase/migrations/20261116_catalog_preview_framing.sql`, contas com `nitido_moderator` podem abrir **Editar enquadramento** nas ações de um card. O painel mostra a mídia original e o resultado, com controles de modo, ponto focal, zoom, fundo e área segura. A alteração persiste por ID no Supabase e aparece no catálogo após salvar. O processamento da imagem ocorre em lote, e a composição final aplica os ajustes salvos no navegador às mesmas miniaturas responsivas. Vídeos permanecem silenciados e são carregados sob intenção de hover ou foco.

## Captura e derivados

Execute na raiz da aplicação, com IDs já publicados:

```sh
node scripts/frame-catalog-previews.mjs ID1 ID2
node scripts/frame-catalog-previews.mjs --capture ID1 ID2
```

A captura usa um servidor de prévias isolado em loopback (`PREVIEW_CAPTURE_ORIGIN`). É possível selecionar o Chromium com `PREVIEW_BROWSER_EXECUTABLE`. O navegador roda em contexto novo e bloqueia ativos fora da origem local. A captura aguarda fontes e imagens por até 4,5 segundos e usa viewport 16:9. Use a imagem retida quando ela mostrar melhor o estado representativo. Revise o conteúdo, sobretudo entradas com movimento, antes de publicar.

Os derivados WebP têm até 480 e 960 px, preservam proporção e usam URLs com hash. Arquivos já registrados são reaproveitados, e `--refresh` recalcula apenas os IDs indicados. A fila tem dois trabalhos simultâneos. A aplicação usa `srcset`, carregamento preguiçoso e o quadro 16:9 reserva espaço antes do carregamento. As rotas continuam privadas com `no-store`.

O primeiro lote contém seis capturas de demos e três imagens retidas. Imagens menores que 480 px geram um único tamanho para evitar ampliação. Os demais itens usam as mídias já existentes e recebem o enquadramento ao renderizar. A validação local abrange 1600, 1024 e 390 px, claro/escuro, busca, favoritos, coleções, comparação, edição de enquadramento com conta sintética e vídeo Kairo por hover.

O preenchimento de prévias preservadas usa uma versão desfocada da mesma mídia nos espaços restantes. O modo Inteligente pode preencher a área quando a região protegida cabe no recorte. Os modos manuais mantêm o ajuste escolhido. Se um WebP derivado falhar, o card tenta a imagem original antes da demo.
