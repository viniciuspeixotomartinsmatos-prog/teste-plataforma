# Auditoria de lançamento do catálogo — 12 de novembro de 2026

O inventário de 10.699 itens corresponde ao SHA-256 `2ba59702c04ba2ffcf6e6b1859ce695fe6ea5fde2ee15da56de3fe44422e24b8` de `public/data/catalog-live.json`. Nenhum item foi removido nesta auditoria.

## Rotas, prompts e ZIPs

Os 10.699 itens passaram no servidor autenticado local. A inspeção confirmou a rota de detalhe, um prompt não vazio e um ZIP descompactável com prévia, instruções e avisos de licença. Os cinco timeouts restantes passaram em execução isolada, um por vez, com limite maior para baixar cada recurso. A inspeção registra SHA-256 dos prompts e arquivos ZIP. Ela mede a integridade dos pacotes e a disponibilidade dos artefatos.

## Navegador

No checkpoint de 15h16 de Cuiabá, a fila principal tinha 6.377 de 10.368 itens examinados. Houve 5.831 aprovações de inicialização e mídia, 546 pendências e 5.872 registros com medidas desktop e mobile. A fila exclui 329 itens de uma triagem anterior e dois itens novos com evidência separada. A coleta continua por lote com checkpoints persistentes e uma fila separada repete as pendências em série.

O caso isolado `21st-88760f9fd73f` (Color Picker) abriu pela página de detalhe após o timeout em lote. O clique abriu controles de saturação, brilho, matiz, opacidade e código hexadecimal. `magic--glyph-matrix` abriu na página de detalhe autenticada em desktop e mobile após a correção da leitura do canvas.

`magic--video-text` reproduziu o erro no sandbox enquanto o vídeo original avançava. O carregador autenticado passou a reabrir a seleção de mídia quando a URL do elemento `source` chega após a primeira seleção. O vídeo voltou a preencher o texto animado na página de detalhe em desktop e mobile.

`21st-3acdf8f108b1` (Hairline Lockers) desenhava a geometria SVG com `aria-hidden`, mas permanecia com a espera aberta na página de detalhe. A prévia passou a reconhecer a geometria visível. O caso foi conferido em desktop e mobile, com testes de regressão para descartar SVGs que contêm apenas definições ou traços invisíveis.

A triagem automatizada cobre inicialização, mídia, medidas de viewport e sondagens limitadas. A aceitação de todos os fluxos, a revisão de direitos de redistribuição e a revisão operacional de produção seguem na [matriz de conformidade](../docs/compliance-40.md).
