# Recuperação do catálogo Profitize

**Objetivo:** incorporar todos os itens observados do catálogo público à biblioteca Um só., com prévias locais, deduplicação e pacotes exportáveis. Não afirmar recuperação de backend nem de fontes não publicadas.

**Arquitetura:** extrair módulos compilados dos bundles públicos, preservar seus shaders e animações num runtime isolado, espelhar demos e mídias, e acrescentar registros ao catálogo existente. Prompts novos devem declarar reconstrução; o código compilado nunca será rotulado como TSX original.

**Tecnologias:** Node 24, parser Babel, React compilado recuperado, catálogo estático Vite existente.

- [x] Inspecionar 82 itens e preservar Evidence REA do JavaScript público em arquivo local.
- [x] Testar primeiro o runtime de módulos (ESM, CommonJS, aliases e imports dinâmicos) e o filtro de duplicatas.
- [x] Criar `scripts/lib/recovered-runtime.mjs` e `scripts/import-profitize.mjs`; materializar prévias, assets, prompts e relatório de cobertura.
- [x] Incorporar os registros e a fonte técnica aos catálogos, preservando as entradas existentes e a identidade do app.
- [x] Verificar todas as referências locais, executar testes e build, abrir prévias no navegador e documentar limitações.
- [ ] Atualizar a branch compartilhada, fazer commit e push para `jorge`, e verificar o deploy da Vercel.

As 5 landing pages sem demo externa e os 2 motions têm vídeo público. Preservar reprodução e prompt reconstruído sem apresentá-los como uma página HTML original recuperada.
