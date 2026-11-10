# Acompanhamento dos 40 requisitos — 10 de novembro de 2026

**Não há declaração de conformidade integral.** `Implementado/testado` descreve o escopo de código verificado; `Parcial` exige ação ou evidência adicional; `Bloqueado` não pode ser concluído com os acessos atuais. Documentos legais são minutas públicas identificadas como preparação, não parecer jurídico.

## Matriz

| Nº | Requisito | Estado e evidência | O que falta |
| --- | --- | --- | --- |
| 1 | Autenticação segura | Parcial. Produção rejeitou login antes da confirmação. Contas sintéticas confirmaram login, cookies HttpOnly/Secure/SameSite=Lax, entrega de confirmação e recuperação via Resend e troca de senha. MFA ativo na conta Supabase revisada. | Verificar MFA nos demais acessos administrativos e acompanhar entregabilidade. |
| 2 | Controle de acesso | Verificado nas rotas e tabela amostradas. GET/HEAD/Range de mídia privada e exportação anônima retornaram 401 com cache privado. RLS remota impediu leitura e inserção cruzadas. Os grants excedentes de `workspaces` foram revogados. | Revisar demais recursos por amostragem e repetir quando o esquema mudar. Preservar proteção no caminho de produção. |
| 3 | Criptografia de dados | Parcial. TLS exigido no cliente de produção; backup AES-256-GCM preparado e testado contra adulteração. | Confirmar criptografia em repouso/backup do provedor, armazenamento e gestão/rotação de chaves. |
| 4 | HTTPS/TLS | Verificado no domínio Vercel ativo. Certificado aceito pelo cliente HTTP, redirecionamento HTTP 308 para HTTPS e HSTS nas respostas amostradas. | Revalidar após troca de domínio ou configuração. Confirmar política TLS para conexões administrativas ao banco. |
| 5 | Hashing de senhas | Implementado/testado no escopo. Supabase Auth usa bcrypt com salt; app não guarda hash manual nem senha. Better Auth local possui hashing real testado. | Configuração e proteção de senhas vazadas do projeto remoto ainda não inspecionadas; hashing não é criptografia reversível. |
| 6 | SQL Injection | Implementado/testado nos fluxos revisados. SQLite parametrizado, PostgREST por proprietário e parâmetros SQL; texto malicioso preservado como dado em PostgreSQL local. | Não é afirmação de revisão de cada bundle gerado ou serviço externo. |
| 7 | XSS/CSRF | Parcial. Escape de HTML/React, mutações exigem Origin e recusam cross-site, demos opacas e mensagens verificadas. CSP base/objetos/framing aplicada. | CSP estrita de scripts tem limitações de demos inline; studios same-origin e todo conteúdo adquirido exigem revisão própria. |
| 8 | Rate Limiting | Parcial. Vercel WAF limita POSTs em `/api/auth/` a 60 por IP em 60 s dentro do plano Hobby. A resposta 429 do WAF foi verificada. O Supabase tem quotas próprias de Auth e o app mantém limites por processo. | A cobertura do WAF é de autenticação. Outros fluxos do app ainda não têm limite distribuído próprio. |
| 9 | Proteção de APIs | Parcial. Sessão/ownership, chaves normais sem service_role, JSON estrito com limite de stream e métodos específicos. Webhook mantém assinatura própria. | Confirmar exposição e limites no ambiente real. |
| 10 | Auditoria de dependências | Implementado/testado. npm audit zero alertas conhecidos após correções; lockfile/overrides, Vite 6.4.6, Dependabot e workflow manual. | Repetir periodicamente; zero alertas não prova ausência de falhas. Confirmar alertas do repositório. |
| 11 | Política de Privacidade | Parcial. `/legal/privacy`, versão, dados, operadores, bases, direitos e limites publicados pelo build. | Revisão jurídica e comprovação operacional/identificação completa. |
| 12 | Bases legais | Parcial. Contrato, obrigação legal e legítimo interesse separados por operação no registro de tratamento. | Aprovar necessidade/proporcionalidade e avaliação de legítimo interesse; não usar consentimento genérico. |
| 13 | Minimização | Implementado no escopo atual. Conta pede nome/e-mail; sem cartão/documentos/dados sensíveis adicionais. Exportação exclui credenciais; logger novo não recebe identificadores. | Confirmar logs do host e dados de terceiros que usuários possam inserir nos próprios projetos. |
| 14 | Finalidades documentadas | Parcial. Avisos públicos e registro incluem o Resend e o envio da URL pública ao Google PageSpeed Insights quando solicitado pelo usuário no Raio-X. | Validar tratamento, retenção e instrumento de transferência dos operadores. |
| 15 | Gestão de consentimento | Parcial. Opcionais não ativados; preferência somente essenciais; aceite de termos separado de marketing e checkbox não pré-marcado. | Antes de opcionais/vendas, registro imutável de versões/finalidades/retirada. Metadados editáveis não são prova definitiva de aceite. |
| 16 | Política de Cookies | Implementado como aviso da versão atual. `/legal/cookies` descreve sessão, local storage, essenciais, ausência de trackers opcionais e limitações de conteúdo externo. | Validar comportamento de rede de cada demo antes de liberação comercial. |
| 17 | Direitos dos titulares | Parcial. Correção de nome e exportação autenticada verificadas em produção com contas sintéticas. A exportação voltou a responder 200 e anexo privado após tratar a tabela Paddle ausente com cobrança desativada. | Confirmar atendimento, correção de e-mail, prazos e recebimento no canal informado. |
| 18 | Exclusão de dados | Parcial. A API em produção recusou exclusão automática com `deletion_setup_required`. Revogação de sessão após recuperação foi observada. Remoção administrativa de contas sintéticas confirmou cascata de `workspaces`. O projeto tinha zero buckets. | Manter `ACCOUNT_DELETION_READY=false`. Falta ensaio da própria API em ambiente isolado, tratamento futuro de Storage, retenções e conciliação de assinaturas. |
| 19 | Retenção | Parcial. Limites e responsabilidades documentados; dados locais podem ser removidos; sem promessa de apagar backups instantaneamente. | Aprovar prazos por classe e aplicar expurgo real em host, suporte, logs e backups, respeitando retenções legais. |
| 20 | Contratos com operadores | Bloqueado. Inventário e checklist DPA/transferências preparados. | Responsável deve confirmar contratos efetivos, conta, região, suboperadores, transferências e cláusulas. Nenhum contrato foi aceito/assinado. |
| 21 | Termos de Uso | Parcial. `/legal/terms` apresenta a identificação informada pelo titular. O cadastro pede aceite e o backend exige a versão atual. | Revisão jurídica e evidência imutável de contratação antes de vendas. |
| 22 | Transparência de preços | Implementado. R$85/1 mês, R$165/3 meses, R$550/12 meses são totais; código legado alinhado com Paddle e marketing. | Confirmar impostos/moeda/renovação no checkout quando for ativado. |
| 23 | Cobranças transparentes | Implementado no estado sem vendas. Integrações não foram ativadas; página informa indisponibilidade. Health público respondeu billingMode=disabled durante a execução. | Nenhum teste de cobrança real realizado; futura venda depende de aprovação e sandbox. |
| 24 | Cancelamento de assinaturas | Parcial. Integração de portal existente e política escrita; testes de domínio preservados. | Teste ponta a ponta no provedor e confirmação de atendimento antes de vender. |
| 25 | Reembolso | Parcial. Política não limita arrependimento legal; não há cobrança ativa. | Aprovação jurídica e procedimento real de solicitação/processamento quando houver vendas. |
| 26 | Identificação do fornecedor | Dados informados pelo titular completos no código da plataforma e da página comercial: razão social, CNPJ, endereço, CEP e canal de privacidade. | Conferência cadastral oficial e revisão jurídica da apresentação para a futura oferta comercial. |
| 27 | Publicidade transparente | Implementado no escopo revisado. Oferta pública em preparação, preços totais, demo própria e limitações explícitas; sem promessa de acesso comercial irrestrito ao inventário. | Rever toda comunicação futura antes de campanhas/vendas. |
| 28 | Depoimentos autênticos | Implementado na comunicação revisada: não foram adicionados depoimentos de clientes inventados. | Textos em componentes de demonstração são exemplos, não prova de uso real; revisar uso em campanhas futuras. |
| 29 | Licenças de uso | Bloqueado para liberação comercial integral. Avisos preservados, auditoria existente e página de limites. Cobrança mantida desativada. | Comprovar direitos por recurso/mídia/dependência e aplicar escopo comercial aprovado; acesso à fonte não é licença de redistribuição. |
| 30 | Transparência sobre IA | Implementado como aviso. `/legal/ai` informa IA no desenvolvimento/arte, prompt original/reconstruído e ausência de geração contratada automática com dados do usuário. | Informar novos provedores/tratamentos antes de ativá-los. |
| 31 | Backups automatizados | Bloqueado operacionalmente. O painel do `umso-accounts` confirma que o plano Free não inclui backups gerenciados. Restauração sintética local cifrada recuperou dados, RLS, grants e cascata. | `pg_dump`, executor recorrente, armazenamento restrito, retenção, alerta e restauração operacional ainda não configurados. |
| 32 | Logs seguros | Parcial. Logger novo só registra categoria/status/horário; erros públicos não incluem segredos. | Auditar loggers do host/provedores, acessos, retenção e evidência de expurgo. |
| 33 | Monitoramento de ameaças | Parcial. Eventos e bloqueios mínimos no código; dependências auditadas. | Configurar/validar agregação, alertas e responsável no serviço existente. Não há SIEM/plantão ativo criado. |
| 34 | Resposta a incidentes | Parcial. Procedimento de contenção, evidências, recuperação e retrospectiva escrito. | Designar responsável/substituto e executar simulado. |
| 35 | Notificação de incidentes | Parcial. Critérios, canais e prazos RCIS documentados, inclusive comunicação aos titulares quando exigida. | Designar representante/encarregado, acesso ao SEI e ensaio. Não houve incidente confirmado nem comunicação fictícia. |
| 36 | Testes de segurança | Verificado no escopo local e nos fluxos remotos descritos nesta matriz. Navegador autorizado confirmou login, tela de recuperação, redirecionamento do catálogo e aviso do fornecedor. | Falta entrega de e-mails e ensaio abrangente da superfície de terceiros. |
| 37 | Revisão de código | Parcial. Revisores independentes examinaram arquitetura e fronteiras. A API pública de regras efetivas da branch `jorge` retornou zero regras visíveis. | Confirmar proteção clássica, regras administrativas, revisão humana e procedimentos de aprovação. |
| 38 | Privilégios administrativos | Parcial. O titular cadastrou MFA na conta Supabase usada nesta revisão, com confirmação no painel após reabrir a tela. Os grants de `workspaces` para `authenticated` foram reduzidos a SELECT, INSERT, UPDATE e DELETE. | Falta inventário completo e MFA dos demais administradores em GitHub, Vercel e Supabase. |
| 39 | Gestão de vulnerabilidades | Parcial. Política de reporte, correções verificadas, lockfile, Dependabot e revisão manual preparados. | Responsável, triagem contínua e alertas/remediação com evidência operacional. |
| 40 | Auditoria de conformidade | Parcial. Esta matriz, registro de tratamento, evidências de testes e auditoria técnica limitada estão disponíveis. | Fechar pendências, revisão jurídica/operacional e evidências remotas; não existe certificado de conformidade emitido. |

## Evidência operacional de 10 de novembro

- Checkout da conta Vini sincronizado com `origin/jorge`. O caminho da conta Jorge não estava disponível neste computador.
- Vercel `teste-plataforma`, equipe `novonormaladm-7417s-projects`. Os logs registraram publicação bem-sucedida do commit `5adc38b6d` no deploy `dpl_2m4w65td7GmQ4NrMzB5v7bMw4XLM`. Após a reestruturação dos caminhos de assets, a publicação voltou a passar. No fechamento das verificações iniciais, o alias de produção apontava para `dpl_BrDzjWMQnet3oWYRK24iNAzBLJN9`, commit `62d20a084`.
- O domínio respondeu com `billingMode=disabled`. As páginas de conta, planos, marketing PT/EN e aviso de privacidade responderam 200. Catálogo e mídia privada responderam 401 sem sessão. A exportação anônima respondeu 401 com `private, no-store`.
- Supabase `umso-accounts`, organização Free vinculada à Vercel, região `sa-east-1`. O endpoint usado pelo app coincide com o projeto do painel. A tabela `public.workspaces` tem RLS, `USING` e `WITH CHECK` pelo titular e chave estrangeira com `ON DELETE CASCADE`. O papel `anon` não tinha grants na tabela. Consulta administrativa examinou metadados e uma contagem de buckets.
- A migração `20261110_workspace_grants.sql` registra a revogação aplicada e conferida no banco. Nenhum comando de truncamento foi executado no banco real. O teste local confirma que `TRUNCATE` é recusado.
- Dois usuários sintéticos foram criados e removidos pela administração de Auth. Foram verificados o login, a confirmação e recuperação por tokens gerados pela administração, a troca de senha, a rejeição da sessão anterior, o perfil e o isolamento dos workspaces. Nenhum e-mail foi disparado nesse ensaio. A remoção administrativa limpou os workspaces sintéticos por cascata.
- SMTP personalizado inicialmente desligado. O painel confirmou URL canônica e redirects de callback/reset específicos. Após autorização, o SMTP foi ativado com Resend, remetente do domínio verificado `nitidohig.com.br` e chave exclusiva de envio restrita ao domínio. A configuração persistiu após recarregar o painel. A conta informou franquia de 100 envios por dia e 3.000 por mês. Nenhum plano novo foi contratado.
- O Resend registrou `delivered` para confirmação e recuperação do mesmo cadastro sintético em um alias da caixa autorizada. Os tokens dos dois e-mails foram aceitos pelo app e a troca de senha funcionou. A conta sintética foi removida. O teste não verifica a operação do canal de atendimento a titulares.
- A Vercel publicou `54f35dc95` no deploy `dpl_4cPUpvHzAzXtypFxaMGGb3jbGaEM` e apontou o domínio de produção para ele. A exportação autenticada retornou 200 com JSON em anexo, dados da própria conta, cache privado e nenhuma senha. O teste confirmou cobrança desativada e a exclusão automática ainda bloqueada. A conta sintética e seu workspace foram removidos.
- Restauração local de snapshot cifrado de PostgreSQL WASM com dados sintéticos aprovada. O ensaio verificou as duas linhas, isolamento RLS, recusa de truncamento e cascata após restaurar.
- Validação local em Node 24: 184 testes aprovados, zero falhos e zero ignorados. Build de produção aprovado com Vite 6.4.6, reempacotamento de templates e geração dos arquivos Sites. A auditoria npm do lockfile retornou zero alertas conhecidos.
- Após aprovação do titular, foi publicada a regra `nitido-auth-post-rate-limit` no projeto `teste-plataforma`. Em um teste controlado, 60 POSTs com origem inválida retornaram 403 da aplicação e o 61º retornou 429 do WAF. O health check continuou em 200 com cobrança desativada. Nenhum login ou e-mail foi disparado.
- Por solicitação do titular, cadastro e redefinição no app exigem pelo menos oito caracteres, uma maiúscula e um número. No Supabase `umso-accounts`, uma conta sintética alterou a senha para oito caracteres (maiúsculas e números) e entrou com a nova senha. A conta foi removida, sem envio de e-mail nem alteração no painel.
- O plano do projeto na Vercel é Hobby. As regras do provedor restringem esse plano a uso não comercial. A elegibilidade da hospedagem precisa ser resolvida antes da operação paga. [Política de uso da Vercel](https://vercel.com/docs/limits/fair-use-guidelines)

## Validação de 9 de novembro

- Suíte completa: 157 testes aprovados, nenhum ignorado ou falho; inclui os testes antigos do colaborador e os novos testes PostgreSQL.
- Build de produção: aprovado com Vite 6.4.6; houve build completo (2m11s) e recompilação final dos bundles (3,69s), reutilizando somente os arquivos públicos inalterados. Empacotamento Sites: 4/4 aprovado; isso valida formato, não autenticação do adaptador estático.
- Auditoria npm após a última dependência: zero alertas conhecidos. Revisão independente dos novos controles gerou correções adicionais e regressões.

## Evidências e limites de 9 de novembro

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
