# Planos do nitido

| Plano | Catálogo e arquivos | Ferramentas | Cotas iniciais por mês |
| --- | --- | --- | --- |
| Gratuito | Login, prévias, favoritos, coleções e consulta às Skills | Estúdio de fundos | 5 prompts de demonstração e 3 aberturas do Estúdio de fundos |
| Pro | Benefícios do Gratuito, prompts de integração e downloads de Skills | Fundos, áudio, texturas, formas e Raio-X | 15 prompts diferentes por semana, até 60 por mês, mais 40 aberturas de estúdios e 15 execuções do Raio-X por mês |
| Max | Todos os benefícios, incluindo Design Systems | Todas as ferramentas, incluindo Estúdio de apresentação | Sem cotas comerciais |

A cota conta a primeira liberação de cada item do catálogo por conta. Copiar novamente um prompt do mesmo item, inclusive para outra ferramenta, não consome outra vaga, inclusive após a virada da semana ou do mês, desde que o plano atual permita acessar o item. O Pro tem 15 por semana de segunda a domingo, sem acumular saldo, e teto de 60 no mês civil, inclusive em meses com cinco semanas. A semana vira à meia-noite de segunda-feira no horário de Cuiabá. O teto mensal segue o mês civil em UTC. As demonstrações gratuitas estão em `freePromptIds`. As 40 aberturas de estúdios são compartilhadas no Pro. O limite do Raio-X se refere a chamadas iniciadas de análise, laboratório ou captura renderizada. O controle de segurança e concorrência operacional do Raio-X se aplica aos três níveis.

Os limites e a associação das ferramentas ficam em `src/plan-access.js`. O Supabase registra o consumo por conta, mês e ação. O servidor verifica o nível com metadados administrados no Auth ou uma assinatura Paddle de produção ativa e associada explicitamente a um nível por `NITIDO_PADDLE_PRICE_TIERS`. Os tickets de abertura de estúdio deduplicam carregamentos da mesma sessão.

O comparativo fica em `/plans?view=acessos`. Para testar as permissões completas em ambiente de teste, aplique as migrações `20261116183000_nitido_plan_quotas.sql`, `20261116190000_nitido_weekly_prompts.sql` e `20261116193000_nitido_prompt_unlocks.sql` e use `NITIDO_PLAN_ACCESS_ENABLED=true`. Para contas sintéticas Pro e Max, configure `nitido_plan` em `app_metadata` via Auth Admin. A ausência da variável preserva a política anterior em produção.

Antes da venda, aprove preços por nível e período, associe os IDs dos preços e ajuste o checkout, que hoje está bloqueado no modo de planos. O catálogo entrega prompts por Claude, Codex, Gemini, Cursor e Lovable pelo botão Copiar prompt. Os arquivos de código do catálogo e os ZIPs históricos não são incluídos na publicação. As prévias interativas continuam executando seus arquivos de demonstração no navegador.
