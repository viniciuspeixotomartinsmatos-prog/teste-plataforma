# Segurança, privacidade e operação — 10 de novembro de 2026

## Estado real

O navegador autorizado deu acesso ao Supabase `umso-accounts`, na região `sa-east-1`, e a CLI confirmou a Vercel na equipe proprietária. A matriz de 40 requisitos registra o que foi comprovado com metadados, requisições anônimas e contas sintéticas. Contratos efetivos, atendimento, retenção, monitoramento e operação jurídica continuam sujeitos a validação.

O contato público informado pelo responsável é `nitidocompany@gmail.com`; a titularidade e o recebimento dessa caixa ainda não foram verificados. O CNPJ informado tem dígitos verificadores válidos. Razão social e CEP não foram confirmados. Não preencher por suposição. Os documentos públicos permanecem identificados como preparação até identificação completa e revisão jurídica.

## Registro de tratamento

| Operação | Dados e finalidade | Base proposta | Operador / localização | Retenção e controle |
| --- | --- | --- | --- | --- |
| Conta e autenticação | Nome, e-mail, hash e sessão; criar/manter acesso | LGPD art. 7º, V | Supabase; região real pendente | Conta enquanto necessária; hash e sessão geridos pelo provedor. Verificar confirmação, política de senha, MFA administrativo e expiração. |
| Favoritos e coleções | IDs de recursos, nomes de coleções e revisão; executar organização solicitada | Art. 7º, V | Supabase Postgres | Proprietário verificado e RLS no SQL; confirmar políticas aplicadas. Cascata prevista após exclusão de Auth. |
| Projetos e preferências locais | Conteúdo criado, tema/idioma, cache de sincronização | Art. 7º, V | Navegador do usuário | Persistem até limpeza/exportação. Montador não promete sincronização da conta. Limpeza local é separada da exclusão do servidor. |
| Prevenção de abuso | Identificador de rede temporário e contadores por categoria | Art. 7º, IX, sujeito à avaliação de legítimo interesse | Memória de cada processo | Janela de 60 segundos; coleta de IP não entra no log criado pelo app. Instâncias serverless não compartilham quota. |
| Logs operacionais | Tipo de evento, status e horário; investigar falhas | Art. 7º, II ou IX conforme finalidade | Saída do app e logs do host | Não incluir corpo, senha, token, link de recuperação, e-mail ou ID de conta no logger novo. Retenção/coleta do host pendentes. |
| Atendimento aos titulares | Pedido, contato e prova proporcional de titularidade | Arts. 7º, II e V; arts. 18 e 19 | Canal informado e operador de e-mail a confirmar | Definir responsável, registro de solicitações, prazo e descarte. Não pedir documento por padrão. |
| Incidentes | Cronologia, categorias afetadas, impacto e comunicações | Obrigação legal e proteção de direitos | Repositório privado de incidentes, não este Git público | Registro por pelo menos cinco anos conforme RCIS; acesso restrito. Configuração e responsável pendentes. |
| Cobrança futura | Identificadores de transação e assinatura, sem cartão completo | Contrato/obrigação legal quando aplicável | Paddle, atualmente desativado | Rever contratos, direitos do catálogo, política fiscal, cancelamento/reembolso e retenção antes de ativar. |
| Análise de site solicitada | URL pública informada, relatório e eventual imagem do Lighthouse. O app envia a URL ao PageSpeed Insights, como indicado no formulário. | Execução solicitada pelo usuário, sujeita à revisão do tratamento e da transferência | Vercel e Google PageSpeed Insights; destino e instrumento de transferência ainda a verificar | O app não persiste histórico no servidor. Histórico de até 12 relatórios fica no navegador, por conta, até limpeza ou substituição. A retenção do operador e dos logs do host ainda precisa ser verificada. |
| Publicidade / analytics opcionais | Nenhuma finalidade opcional ativada | Não aplicável nesta versão | Nenhum provedor adicionado | Preferências são essenciais somente. Futuro consentimento precisa ser específico, revogável e comprovável; metadados editáveis de usuário não são um registro imutável. |

Minimização não significa apagar registros obrigatórios: confirmar aplicabilidade dos logs de acesso do Marco Civil e respectivas restrições antes de definir retenção no host. Não presumir prazo de seis meses para todo dado, nem aplicar cinco anos indiscriminadamente a todas as contas. Criar avaliação de legítimo interesse e, se aplicável, relatório de impacto antes de ampliar finalidades ou dados tratados.

## Operadores e transferências

Inventariar Supabase (Auth/Postgres), Vercel (hosting/logs), provedor de e-mail efetivo, GitHub (código; nunca base de usuários) e Paddle apenas antes da ativação. Registrar contrato/DPA vigente, versão, conta contratante, região, suboperadores, tratamento internacional, mecanismo de transferência, eliminação/devolução, suporte a direitos e comunicação de incidentes. Links de referência não provam aceitação contratual. Nenhum contrato foi assinado nesta implementação.

- [DPA do Supabase](https://supabase.com/legal/customer-resources/data-processing-addendum)
- [DPA da Vercel](https://vercel.com/legal/dpa)
- [DPA do Resend](https://resend.com/legal/dpa)
- [Documentação da API Google PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/get-started)
- [Regulamento de Transferência Internacional da ANPD](https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados)
- [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

## Exclusão e direitos

Exportação só lê a conta autenticada, coleções próprias e registros próprios de assinatura; nunca exporta hash, cookies ou credenciais. Correção atual permite nome; e-mail e demais direitos usam atendimento autenticado/proporcional. A exclusão Supabase permanece `ACCOUNT_DELETION_READY=false`.

Antes de habilitar exclusão: verificar RLS/grants, chaves estrangeiras/cascatas, ausência ou tratamento de objetos Storage, retenções obrigatórias e conciliação de assinaturas. Testar com duas contas sintéticas separadas, incluindo exportação, senha incorreta, conta de terceiro, cancelamento, falha do provedor, revogação global, tentativas posteriores de leitura e restauração de backup respeitando exclusões. Não usar clientes reais para ensaios. O código exige senha atual, confirmação `EXCLUIR`, ausência de assinatura ativa e revogação global antes da chamada administrativa. Falha de exclusão após revogação deve gerar atendimento, nunca resposta falsa de sucesso.

Aceite de termos e ciência da política são separados de marketing. A versão registrada nos metadados de cadastro é informativa: usuário pode alterar metadados; não usá-los como autorização ou prova imutável. Antes de vendas, implementar e validar registro append-only de aceite/consentimentos aplicáveis com versão, finalidade, origem, horário do servidor e retirada, minimizando dados.

## Backups e recuperação

`npm run backup:encrypted` é uma ferramenta operacional preparada, não um backup agendado em funcionamento. Exige `pg_dump` instalado, conexão PostgreSQL restrita e TLS `verify-full`, diretório absoluto fora do checkout e chave AES-256-GCM de 32 bytes em base64 separada do backup. Credenciais entram no ambiente do processo, não na linha de comando. Nenhum dump em texto aberto é escrito; falhas removem apenas o arquivo recém-criado. Não registrar conexão, chave ou conteúdo. Usar armazenamento restrito e verificar ACLs no Windows: modos POSIX sozinhos não comprovam ACL NTFS.

O painel do `umso-accounts` informa que o plano Free não inclui backups gerenciados. O ambiente atual não dispõe de `pg_dump` nem de um executor recorrente validado. Um ensaio local cifrou e restaurou um snapshot PostgreSQL WASM descartável com duas contas sintéticas, preservando dados, RLS, grants e cascata. O ensaio não usou dump do Supabase. Sem agenda, armazenamento e alertas validados, a operação continua pendente. [Backups do Supabase](https://supabase.com/docs/guides/platform/backups)

Definir RPO/RTO, janela, agenda no ambiente já contratado, cópia externa, retenção e alerta de falhas. Antes da ativação, testar restauração em banco descartável, integridade, isolamento de produção, acesso às chaves e aplicação de pedidos de exclusão depois de restaurar. A ausência desses ensaios bloqueia marcar o requisito de backup como concluído.

## Monitoramento e incidentes

O logger estruturado adiciona eventos mínimos de bloqueio/exportação/exclusão, sem requisições completas. Não existe SIEM, alerta de plantão ou canal de escalonamento provisionado nesta mudança. Configurar agregação e alertas no serviço existente, confirmar recebimento com evento sintético e limitar acesso/retensão antes de afirmar monitoramento ativo. Verificar separadamente logs do Supabase/Vercel: ausência de dados sensíveis no logger novo não comprova ausência em logs do provedor.

Procedimento proposto:

1. Designar responsável e substituto. Registrar descoberta, origem, serviços e evidência mínima em área privada; preservar logs sem copiar segredos ou banco inteiro para chat/Git.
2. Confirmar alcance, risco e dados afetados. Conter o vetor, suspender rotas/credenciais comprometidas e revogar sessões quando necessário. Mudanças amplas e destrutivas exigem plano e validação.
3. Corrigir causa, revisar fronteiras equivalentes, executar regressões e validar recuperação. Investigar fornecedor quando a causa estiver fora da aplicação.
4. Avaliar comunicação com responsável jurídico/encarregado. A regra geral do RCIS para incidente com risco ou dano relevante é até três dias úteis desde o conhecimento de que afetou dados pessoais, ressalvadas regras específicas aplicáveis. Comunicar à ANPD e aos titulares quando exigido; não anunciar incidentes hipotéticos. Agentes elegíveis a regras diferenciadas exigem avaliação própria, não presunção.
5. Registrar natureza, categorias/quantidade, consequências, medidas, contatos e motivos de eventual atraso. Guardar registro do incidente por pelo menos cinco anos. Realizar retrospectiva e ação corretiva.

[Procedimento e orientação da ANPD](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis), [regulamento e registro mínimo](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca).

## Administração, dependências e revisão

O painel da conta Supabase conectada mostrou MFA por configurar. O titular precisa cadastrar o fator. Ainda é necessário verificar os demais administradores, proteção da branch e revogação na saída. O papel `authenticated` perdeu `TRUNCATE`, `REFERENCES` e `TRIGGER` em `public.workspaces`. A autorização da aplicação não deriva de `user_metadata`.

O Supabase tem confirmação de e-mail habilitada e usa SMTP do Resend no domínio de envio verificado `nitidohig.com.br`. A credencial é dedicada ao envio e limitada ao domínio. O teste sintético confirmou entrega de cadastro e recuperação no Resend, uso dos dois tokens e troca de senha. Monitorar a franquia de 100 envios diários e 3.000 mensais e rotacionar a credencial pelo processo administrativo. O canal de atendimento a titulares ainda precisa de teste próprio. [SMTP do Supabase](https://supabase.com/docs/guides/auth/auth-smtp)

A Vercel mostrou mitigação automática ativa e firewall personalizado sem configuração. O limite por processo da aplicação e as quotas nativas do Supabase Auth não demonstram um limite distribuído para as rotas do nitido. O limite do WAF sujeito a cobrança por uso não foi ativado. [Preços do WAF da Vercel](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing)

O audit npm retornou zero alertas conhecidos após Vite 6.4.6 e overrides compatíveis para parser 6.1.5 e MCP server 2.3.0. Isso não prova ausência de vulnerabilidades, nem substitui revisão dos runtimes adquiridos. Lockfile preservado, scripts de instalação não aprovados indiscriminadamente. Dependabot cria propostas de atualização para `jorge`; o workflow de revisão é manual, com ações fixadas por commit, permissões só de leitura e sem execução agendada de runners.

Revisão independente verificou fronteiras de autenticação e acesso aos assets. O adaptador estático Sites permanece uma demonstração sem autenticação conforme AGENTS: não publicar o catálogo privado por esse caminho. Vercel/Node são os caminhos de produção avaliados. Licenças de muitos recursos permanecem sem liberação comercial; não ativar cobrança para todo o inventário com base apenas em uma assinatura nas fontes ou em avisos de licença anexados.
