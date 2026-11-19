# Planos do nitido

O catálogo e as prévias são públicos. A cópia de prompts exige conta e continua sujeita às permissões e cotas abaixo. A escolha de plano e período é preservada ao entrar ou cadastrar.

| Plano | Mensal | Trimestral, total | Anual, total |
| --- | --- | --- | --- |
| Pro | R$ 49,90 | R$ 134,90 | R$ 479,90 |
| Max | R$ 89,90 | R$ 242,90 | R$ 859,90 |

Preços definidos como proposta inicial a partir da solicitação do usuário em 19/11/2026. Os descontos são aproximadamente 10% no trimestre e 20% no ano. A margem depende das taxas e do uso real da infraestrutura. O catálogo canônico fica em `src/billing-catalog.js`.

O checkout por nível usa seis preços distintos em `PADDLE_TIER_PRICES_JSON`, com `tier` (pro/max), `planId` (monthly/quarterly/yearly) e `priceId`. O servidor compara valor, moeda, produto, período e quantidade com o preço canônico antes de criar uma transação vinculada à conta. O acesso pago depende da confirmação do servidor e do preço registrado, inclusive em mudanças e revogação da assinatura.

Em 19/11/2026 o painel Paddle de produção ainda exibia “Changes needed on your website” e exigia reenvio do domínio. A integração permanece desabilitada até a aprovação e configuração reais. Os botões preservam a escolha e informam essa indisponibilidade. As cinco tabelas de cobrança foram instaladas no Supabase identificado, com RLS e funções restritas ao servidor. Uma transação sintética validou reserva, confirmação, mudança paga e isolamento e foi revertida integralmente.

| Plano | Catálogo e arquivos | Ferramentas | Cotas iniciais por mês |
| --- | --- | --- | --- |
| Gratuito | Login, prévias, favoritos, coleções e consulta às Skills | Estúdio de fundos | 5 prompts de demonstração e 3 aberturas do Estúdio de fundos |
| Pro | Benefícios do Gratuito, prompts de integração e downloads de Skills | Fundos, áudio, texturas, formas e Raio-X | 15 prompts diferentes por semana, até 60 por mês, mais 40 aberturas de estúdios e 15 execuções do Raio-X por mês |
| Max | Todos os benefícios, incluindo Design Systems | Todas as ferramentas, incluindo Estúdio de apresentação | Sem cotas comerciais |

A cota conta a primeira liberação de cada item do catálogo por conta. Copiar novamente um prompt do mesmo item, inclusive para outra ferramenta, não consome outra vaga, inclusive após a virada da semana ou do mês, desde que o plano atual permita acessar o item. O Pro tem 15 por semana de segunda a domingo, sem acumular saldo, e teto de 60 no mês civil, inclusive em meses com cinco semanas. A semana vira à meia-noite de segunda-feira no horário de Cuiabá. O teto mensal segue o mês civil em UTC. As demonstrações gratuitas estão em `freePromptIds`. As 40 aberturas de estúdios são compartilhadas no Pro. O limite do Raio-X se refere a chamadas iniciadas de análise, laboratório ou captura renderizada. O controle de segurança e concorrência operacional do Raio-X se aplica aos três níveis.

Os limites e a associação das ferramentas ficam em `src/plan-access.js`. O Supabase registra o consumo por conta, mês e ação. O servidor verifica o nível com metadados administrados no Auth ou uma assinatura Paddle de produção ativa e associada explicitamente a um nível por `NITIDO_PADDLE_PRICE_TIERS`. Os tickets de abertura de estúdio deduplicam carregamentos da mesma sessão.

O comparativo fica em `/plans?view=acessos`. A produção da Vercel aplica obrigatoriamente as permissões e cotas, inclusive com checkout desativado e mesmo se a variável de ativação estiver ausente ou falsa. Em outros ambientes, use `NITIDO_PLAN_ACCESS_ENABLED=true`. São necessárias as migrações `20261116183000_nitido_plan_quotas.sql`, `20261116190000_nitido_weekly_prompts.sql` e `20261116193000_nitido_prompt_unlocks.sql`. Para contas sintéticas Pro e Max, configure `nitido_plan` em `app_metadata` via Auth Admin.

Antes da venda, cadastre os seis preços no Paddle, associe seus IDs e configure chave, token do checkout e webhook no ambiente correto. Ative a cobrança após a aprovação real do provedor e o teste de compra e cancelamento. O catálogo entrega prompts por Claude, Codex, Gemini, Cursor e Lovable pelo botão Copiar prompt. Os arquivos de código do catálogo e os ZIPs históricos não são incluídos na publicação. As prévias interativas continuam executando seus arquivos de demonstração no navegador.
