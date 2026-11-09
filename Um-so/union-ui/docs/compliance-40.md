# Acompanhamento dos 40 requisitos — 9 de novembro de 2026

**Não há declaração de conformidade integral.** `Implementado/testado` descreve o escopo de código verificado; `Parcial` exige ação ou evidência adicional; `Bloqueado` não pode ser concluído com os acessos atuais. Documentos legais são minutas públicas identificadas como preparação, não parecer jurídico.

## Matriz

| Nº | Requisito | Estado e evidência | O que falta |
| --- | --- | --- | --- |
| 1 | Autenticação segura | Parcial. Supabase `getUser`, cookies HttpOnly/Secure/SameSite, confirmação e recuperação testadas com SDK. Produção Node sem Supabase agora falha fechada. | Confirmar parâmetros reais de Auth, MFA administrativo, SMTP e fluxos no navegador. |
| 2 | Controle de acesso | Parcial. Bypass de mídias corrigido com allowlist de boot; GET/HEAD/Range e sessão revogada testados. RLS e `WITH CHECK` executados em PostgreSQL local. | Verificar RLS/grants realmente aplicados e respostas da Vercel. Não publicar catálogo privado no adaptador estático Sites. |
| 3 | Criptografia de dados | Parcial. TLS exigido no cliente de produção; backup AES-256-GCM preparado e testado contra adulteração. | Confirmar criptografia em repouso/backup do provedor, armazenamento e gestão/rotação de chaves. |
| 4 | HTTPS/TLS | Parcial. Origem canônica HTTPS em produção, HSTS configurado e credenciais de Auth não podem usar HTTP remoto. | Verificar domínio, certificado, redirecionamento e headers do deploy final. |
| 5 | Hashing de senhas | Implementado/testado no escopo. Supabase Auth usa bcrypt com salt; app não guarda hash manual nem senha. Better Auth local possui hashing real testado. | Configuração e proteção de senhas vazadas do projeto remoto ainda não inspecionadas; hashing não é criptografia reversível. |
| 6 | SQL Injection | Implementado/testado nos fluxos revisados. SQLite parametrizado, PostgREST por proprietário e parâmetros SQL; texto malicioso preservado como dado em PostgreSQL local. | Não é afirmação de revisão de cada bundle gerado ou serviço externo. |
| 7 | XSS/CSRF | Parcial. Escape de HTML/React, mutações exigem Origin e recusam cross-site, demos opacas e mensagens verificadas. CSP base/objetos/framing aplicada. | CSP estrita de scripts tem limitações de demos inline; studios same-origin e todo conteúdo adquirido exigem revisão própria. |
| 8 | Rate Limiting | Parcial. Limites por login/cadastro/e-mail/leitura/escrita, IP do host, Retry-After, expiração e memória limitada testados. | Quotas são por processo; falta limite distribuído/WAF e confirmação das quotas nativas Supabase. |
| 9 | Proteção de APIs | Parcial. Sessão/ownership, chaves normais sem service_role, JSON estrito com limite de stream e métodos específicos. Webhook mantém assinatura própria. | Confirmar exposição e limites no ambiente real. |
| 10 | Auditoria de dependências | Implementado/testado. npm audit zero alertas conhecidos após correções; lockfile/overrides, Vite 6.4.6, Dependabot e workflow manual. | Repetir periodicamente; zero alertas não prova ausência de falhas. Confirmar alertas do repositório. |
| 11 | Política de Privacidade | Parcial. `/legal/privacy`, versão, dados, operadores, bases, direitos e limites publicados pelo build. | Revisão jurídica e comprovação operacional/identificação completa. |
| 12 | Bases legais | Parcial. Contrato, obrigação legal e legítimo interesse separados por operação no registro de tratamento. | Aprovar necessidade/proporcionalidade e avaliação de legítimo interesse; não usar consentimento genérico. |
| 13 | Minimização | Implementado no escopo atual. Conta pede nome/e-mail; sem cartão/documentos/dados sensíveis adicionais. Exportação exclui credenciais; logger novo não recebe identificadores. | Confirmar logs do host e dados de terceiros que usuários possam inserir nos próprios projetos. |
| 14 | Finalidades documentadas | Implementado. Registro de tratamento em `security-operations.md` e aviso público por finalidade. | Atualizar antes de qualquer nova finalidade/provedor. |
| 15 | Gestão de consentimento | Parcial. Opcionais não ativados; preferência somente essenciais; aceite de termos separado de marketing e checkbox não pré-marcado. | Antes de opcionais/vendas, registro imutável de versões/finalidades/retirada. Metadados editáveis não são prova definitiva de aceite. |
| 16 | Política de Cookies | Implementado como aviso da versão atual. `/legal/cookies` descreve sessão, local storage, essenciais, ausência de trackers opcionais e limitações de conteúdo externo. | Validar comportamento de rede de cada demo antes de liberação comercial. |
| 17 | Direitos dos titulares | Parcial. Exportação autenticada, correção de nome, links/canal informado e limpeza local separados. | Confirmar atendimento, prazos, demais direitos/correção de e-mail e entrega real na caixa de contato. |
| 18 | Exclusão de dados | Parcial. Local: exclusão/revogação/cascata testadas. Supabase: senha, confirmação, assinatura e revogação exigidas; falha fechada por padrão. | `ACCOUNT_DELETION_READY=false`; verificar banco real, Storage, concorrência, retenções e teste sintético antes de habilitar. |
| 19 | Retenção | Parcial. Limites e responsabilidades documentados; dados locais podem ser removidos; sem promessa de apagar backups instantaneamente. | Aprovar prazos por classe e aplicar expurgo real em host, suporte, logs e backups, respeitando retenções legais. |
| 20 | Contratos com operadores | Bloqueado. Inventário e checklist DPA/transferências preparados. | Responsável deve confirmar contratos efetivos, conta, região, suboperadores, transferências e cláusulas. Nenhum contrato foi aceito/assinado. |
| 21 | Termos de Uso | Parcial. `/legal/terms`, aceite informado no cadastro e versão atual requerida pelo backend Supabase. | Razão social/CEP, revisão jurídica e evidência imutável de contratação antes de vendas. |
| 22 | Transparência de preços | Implementado. R$85/1 mês, R$165/3 meses, R$550/12 meses são totais; código legado alinhado com Paddle e marketing. | Confirmar impostos/moeda/renovação no checkout quando for ativado. |
| 23 | Cobranças transparentes | Implementado no estado sem vendas. Integrações não foram ativadas; página informa indisponibilidade. Health público respondeu billingMode=disabled durante a execução. | Nenhum teste de cobrança real realizado; futura venda depende de aprovação e sandbox. |
| 24 | Cancelamento de assinaturas | Parcial. Integração de portal existente e política escrita; testes de domínio preservados. | Teste ponta a ponta no provedor e confirmação de atendimento antes de vender. |
| 25 | Reembolso | Parcial. Política não limita arrependimento legal; não há cobrança ativa. | Aprovação jurídica e procedimento real de solicitação/processamento quando houver vendas. |
| 26 | Identificação do fornecedor | Parcial. CNPJ com dígitos válidos, rua/número, Campo Grande/MS e e-mail informados pelo usuário publicados como incompletos. | Razão social, CEP e confirmação cadastral. Não usar nome presumido. |
| 27 | Publicidade transparente | Implementado no escopo revisado. Oferta pública em preparação, preços totais, demo própria e limitações explícitas; sem promessa de acesso comercial irrestrito ao inventário. | Rever toda comunicação futura antes de campanhas/vendas. |
| 28 | Depoimentos autênticos | Implementado na comunicação revisada: não foram adicionados depoimentos de clientes inventados. | Textos em componentes de demonstração são exemplos, não prova de uso real; revisar uso em campanhas futuras. |
| 29 | Licenças de uso | Bloqueado para liberação comercial integral. Avisos preservados, auditoria existente e página de limites. Cobrança mantida desativada. | Comprovar direitos por recurso/mídia/dependência e aplicar escopo comercial aprovado; acesso à fonte não é licença de redistribuição. |
| 30 | Transparência sobre IA | Implementado como aviso. `/legal/ai` informa IA no desenvolvimento/arte, prompt original/reconstruído e ausência de geração contratada automática com dados do usuário. | Informar novos provedores/tratamentos antes de ativá-los. |
| 31 | Backups automatizados | Bloqueado operacionalmente. Script de backup cifrado preparado; formato AES testado. | Projeto remoto sem acesso, pg_dump ausente, agenda, chave, armazenamento, retenção, alerta e restauração real não configurados/verificados. |
| 32 | Logs seguros | Parcial. Logger novo só registra categoria/status/horário; erros públicos não incluem segredos. | Auditar loggers do host/provedores, acessos, retenção e evidência de expurgo. |
| 33 | Monitoramento de ameaças | Parcial. Eventos e bloqueios mínimos no código; dependências auditadas. | Configurar/validar agregação, alertas e responsável no serviço existente. Não há SIEM/plantão ativo criado. |
| 34 | Resposta a incidentes | Parcial. Procedimento de contenção, evidências, recuperação e retrospectiva escrito. | Designar responsável/substituto e executar simulado. |
| 35 | Notificação de incidentes | Parcial. Critérios, canais e prazos RCIS documentados, inclusive comunicação aos titulares quando exigida. | Designar representante/encarregado, acesso ao SEI e ensaio. Não houve incidente confirmado nem comunicação fictícia. |
| 36 | Testes de segurança | Implementado no escopo local. Origem, IDOR, stream, limiter, chaves, logs, backup, sessão/exclusão, PostgreSQL RLS/cascata e ledger exercitados. | Teste de navegador e ambiente remoto bloqueados; não equivale a pentest externo completo. |
| 37 | Revisão de código | Parcial. Revisores independentes examinaram arquitetura e fronteiras; candidato real de assets validado e corrigido. | Revisão humana e proteção de branch/procedimentos de aprovação ainda não comprovados. |
| 38 | Privilégios administrativos | Parcial. Chave administrativa só no servidor e exclusão desativada; sessão normal rejeita chave secreta/service_role. | Inventariar acessos reais, MFA, menor privilégio e offboarding em GitHub/Vercel/Supabase. |
| 39 | Gestão de vulnerabilidades | Parcial. Política de reporte, correções verificadas, lockfile, Dependabot e revisão manual preparados. | Responsável, triagem contínua e alertas/remediação com evidência operacional. |
| 40 | Auditoria de conformidade | Parcial. Esta matriz, registro de tratamento, evidências de testes e auditoria técnica limitada estão disponíveis. | Fechar pendências, revisão jurídica/operacional e evidências remotas; não existe certificado de conformidade emitido. |

## Validação desta entrega

- Suíte completa: 157 testes aprovados, nenhum ignorado ou falho; inclui os testes antigos do colaborador e os novos testes PostgreSQL.
- Build de produção: aprovado com Vite 6.4.6; houve build completo (2m11s) e recompilação final dos bundles (3,69s), reutilizando somente os arquivos públicos inalterados. Empacotamento Sites: 4/4 aprovado; isso valida formato, não autenticação do adaptador estático.
- Auditoria npm após a última dependência: zero alertas conhecidos. Revisão independente dos novos controles gerou correções adicionais e regressões.

## Evidências e limites

- Testes completos são descobertos automaticamente, incluindo os testes do colaborador antes omitidos pelo comando antigo. Ver resultado final registrado na entrega e no Git; não apresentar testes ignorados como aprovados.
- PostgreSQL local usa PGlite, sem acesso ao banco real: RLS/cascata e RPCs Paddle podem rodar sem credenciais. Nenhuma compra, conta de pagamento ou serviço pago novo foi ativado.
- Auditoria de dependências: `npm audit --json`; correções transitivas documentadas no lockfile. Repetir após instalar/atualizar pacotes.
- CUA retornou `Local browser use is disabled in Work settings`; não foi usado navegador alternativo para contornar o bloqueio. UI nova tem build/testes de DOM, mas sem validação visual desktop/mobile.
- Consulta pública de `/api/health` confirmou Supabase e cobrança desativada na versão então implantada. `/api/billing/config` respondeu 401; não foi contornado. Isso não confirma que o commit final já está no ar.
- Verificação de fornecedores não aconteceu: Supabase do app não consta da conexão, Vercel do projeto negou escopo. Estes bloqueios impedem marcar itens operacionais como concluídos.

## Fontes de referência verificadas

- [LGPD — bases, direitos, segurança e responsabilidade](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ANPD — comunicação de incidentes](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis)
- [ANPD — RCIS e registro de cinco anos](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca)
- [Comércio eletrônico — Decreto 7.962/2013](https://legislacao.presidencia.gov.br/atos/?ano=2013&ato=61ccXTE5ENVpWT68f&numero=7962&tipo=DEC)
- [Supabase — segurança de senhas](https://supabase.com/docs/guides/auth/password-security)
- [Supabase — exclusão e gerenciamento de usuários](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase — backups e planos](https://supabase.com/docs/guides/platform/backups)
- [Vercel — headers de rede confiáveis](https://vercel.com/docs/headers/request-headers)

## Auditoria técnica inicial

Codex Security concluiu a revisão limitada da versão `fc99b826`, preservando o snapshot anterior às correções. Registrou uma falha média de exposição de assets privados, corrigida nesta entrega com regressões HTTP. O relatório original não é uma certificação do novo commit e preserva as pendências de cobertura e operação. A revisão independente posterior também gerou correções no backup, na seleção de assinaturas e na validação de chaves.

Telemetria devolvida pela ferramenta, com cobertura **parcial**: 25.403.119 tokens de entrada, 107.767 de saída, total 25.510.886; 25.039.616 tokens de entrada em cache e três threads indisponíveis. São métricas parciais do rollout, não uma fatura nem uma aferição completa e isolada desta implementação.
