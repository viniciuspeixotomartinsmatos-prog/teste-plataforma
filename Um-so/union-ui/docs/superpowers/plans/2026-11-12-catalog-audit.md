# Continuação da auditoria do catálogo

## Inventário e retomada

1. Fixar commit e hash do catálogo. Atualizar o inventário estático e recuperar os resultados anteriores por ID e hash do HTML.
2. Incluir na fila itens novos, itens sem evidência e itens pendentes. Registrar os resultados por viewport para retomar após uma interrupção.

## Execução

1. Usar o servidor local autenticado em `scripts/runtime-audit/serve.mjs` e o navegador interno do Codex para abrir os iframes do aplicativo em desktop e mobile.
2. Executar `scripts/runtime-audit/packages.mjs` para verificar rotas HTTP, geração de prompts e estrutura dos ZIPs pelos exportadores do app.
3. Investigar falhas reproduzíveis em isolamento. Conferir interação real, cópia, renderização, execução fora da sessão e produção conforme o tipo de item. Registrar qualquer verificação que permaneça aberta.

## Evidência

Registrar inventário, commit, hashes, resultados, falhas e próximos pontos de retomada no relatório do catálogo. Confirmar que o endpoint de checkpoint exige sessão e rejeita origens externas. Validar os scripts antes de enviar os arquivos relevantes à branch compartilhada.
