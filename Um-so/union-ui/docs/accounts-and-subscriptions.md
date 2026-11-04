# Contas e assinaturas

## Etapa atual: login obrigatório

Produção usa Supabase Auth, cookies HttpOnly/Secure/SameSite=Lax e validação da conta no servidor. Não basta existir um cookie. O middleware protege páginas e arquivos da plataforma antes do cache. A API também verifica o usuário e o banco aplica RLS às coleções. Sem configuração, o acesso falha fechado. As telas de conta, recuperação e os arquivos de inicialização permanecem públicos.

1. Conectar um projeto Supabase ao projeto Vercel `teste-plataforma`.
2. Configurar `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (ou os equivalentes `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` provisionados pela integração) e `APP_ORIGIN` com o domínio canônico HTTPS, sem barra final. Nenhuma chave administrativa é necessária no app.
3. Aplicar `supabase/migrations/20261104_accounts.sql` no projeto correto. O SQL cria somente a tabela de coleções, com isolamento por usuário.
4. Em Supabase Authentication, manter confirmação de e-mail habilitada, configurar o Site URL e permitir **exatamente** `APP_ORIGIN/api/auth/callback` e `APP_ORIGIN/api/auth/callback?next=/account/reset`. Configurar SMTP próprio para entrega pública; o remetente padrão do Supabase é limitado e não representa envio de produção validado.
5. Publicar e testar com uma conta descartável: cadastrar, receber/verificar e-mail, entrar com senha, recarregar uma rota direta, salvar coleções em dois dispositivos, recuperar senha, sair e confirmar bloqueio de arquivos diretos. Testar também senha incorreta, e-mail não confirmado e links expirados. Não declarar funcionamento integral antes desses testes reais.

O backend local Better Auth/SQLite continua disponível para desenvolvimento e testes isolados. Contas locais não são contas Supabase e não são migradas automaticamente. Dados privados em `var`, `.env.local` e `.vercel` nunca entram no Git.

### Configuração aplicada em 2026-11-04

O projeto Supabase `umso-accounts` (Free, São Paulo, referência `hoipjczqezeedflaiams`) foi criado pela integração nativa e conectado à Vercel. A tabela `workspaces` e sua política RLS foram aplicadas. Site URL e os dois retornos HTTPS acima foram salvos. As credenciais ficam exclusivamente nas variáveis privadas da Vercel e nos arquivos locais ignorados.

Uma conta descartável confirmou login real, cookies HttpOnly/Secure, gravação/leitura de coleções e bloqueio de leitura por outra conta e por visitante. O navegador local confirmou entrada, retorno à ferramenta, persistência após recarregar e saída. Essa primeira rodada usou conta confirmada de QA. A validação posterior de SMTP e links está registrada abaixo; entrega em caixa postal real continua sem comprovação.

Na Vercel, as rotas aninhadas da API devem usar o entrypoint concreto `api/index.js` com rewrite `/api/:path*` para `/api`. O arquivo com nome de catch-all não resolveu `/api/auth/get-session` no deployment Vite; a falha foi confirmada por HTTP 404 em produção. Manter o teste de roteamento e verificar o endpoint publicado após qualquer alteração de deploy.

### Domínio remetente escolhido

O usuário escolheu `nitidohig.com.br`. Remetente proposto para confirmações e recuperação: `nitido <acesso@nitidohig.com.br>`. A consulta DNS identificou os nameservers `nspro78.hostgator.com.br` e `nspro79.hostgator.com.br`, com MX `mx1.titan.email` e `mx2.titan.email` (prioridades 10 e 20). Isso identifica os serviços DNS/MX, mas não comprova que exista uma caixa postal ou licença disponível.

O remetente foi configurado via Resend Free, conforme verificação abaixo. Não contratar licença ou plano pago sem autorização. Não remover MX, não substituir SPF existente e não apontar o site para a Vercel como efeito colateral de configurar o remetente. Usar somente os registros exatos emitidos pelo provedor escolhido. O APP_ORIGIN continua no endereço Vercel funcional enquanto não houver uma mudança de domínio web com DNS e HTTPS confirmados.

## Depois: assinatura Kiwify

Valores definidos pelo usuário em 2026-11-04, em reais, pelo período completo:

| Plano | Período de acesso | Valor total |
| --- | --- | --- |
| Mensal | 1 mês | R$ 85,00 |
| Trimestral | 3 meses | R$ 165,00 |
| Anual | 12 meses | R$ 550,00 |

O usuário confirmou renovação automática para todos os planos: R$ 85,00 a cada mês, R$ 165,00 a cada 3 meses e R$ 550,00 a cada 12 meses. Registrar essa decisão não ativa checkout, assinatura ou cobrança. Não tratar R$ 165,00 e R$ 550,00 como valores mensais nem prometer parcelamento sem configuração confirmada na Kiwify.

Criar produto recorrente na Kiwify com entrega na plataforma externa. Enviar o usuário autenticado ao checkout. Processar webhooks no servidor com autenticação do evento, idempotência e conferência de produto, comprador e assinatura. Registrar direito de acesso no banco. Renovação mantém acesso até a data paga; cancelamento impede renovação sem encurtar período já pago; reembolso/chargeback e inadimplência seguem regra definida. Nunca liberar assinatura apenas pelo redirecionamento do checkout. Nenhuma cobrança foi ativada nesta etapa.

Referências oficiais: https://ajuda.kiwify.com.br/pt-br/article/como-criar-um-produto-de-assinatura-9crmrj/ e https://ajuda.kiwify.com.br/pt-br/article/como-funcionam-os-webhooks-2ydtgl/.

## Depois: planilha privada de contatos

Supabase é o cadastro principal; Google Sheets recebe uma cópia privada, por automação no servidor, com tentativas e deduplicação por ID. Separar dados operacionais de autorização para publicidade.

Campos propostos: ID, nome, sobrenome, e-mail, telefone opcional com DDI, país, data de cadastro, origem/UTMs, plano, situação da assinatura e registro da autorização de marketing (escolha, data, versão do aviso, revogação). Cidade/estado/CEP só se houver necessidade definida. Não exportar senhas, hashes de senha, tokens ou dados de pagamento. Não exigir dados demográficos desnecessários para acesso. A planilha de público deve conter apenas contatos elegíveis ao uso informado e permitir remoção após revogação.

Antes de configurar a exportação, escolher a conta Google e a planilha privada, apresentar o aviso de privacidade e confirmar os campos e a finalidade. Não há integração de planilha nem envio ao Meta nesta etapa.

## Correção de origem pública em 2026-11-04

O endereço público verificado da plataforma é `https://teste-plataforma-delta.vercel.app`. A variável `APP_ORIGIN` de produção estava apontando para o alias gerado de equipe, causando HTTP 403 com “Origem não autorizada.” em requisições legítimas do endereço público. A configuração da Vercel foi corrigida para o domínio público existente, sem alterar DNS nem a proteção de origem. A alteração só entra em vigor em uma nova publicação. O Site URL e os callbacks do Supabase também devem usar esse mesmo domínio; não declarar o cadastro e a entrega de e-mail validados antes da verificação real.

## Verificação do painel HostGator em 2026-11-04

O acesso autenticado confirmou o Plano Turbo ativo e a oferta Titan Básico gratuita. Antes da ativação, a HostGator informa que a escolha é irreversível e que os próximos domínios adicionados à hospedagem usarão Titan Grátis automaticamente. Essa alteração global não foi confirmada. O cPanel disponível não apresentou a ferramenta de criação de contas de e-mail. Nenhum plano pago foi contratado e os registros MX/SPF existentes foram preservados.

Após autorização expressa do usuário, os termos do Resend foram aceitos e a integração nativa foi provisionada no plano Free, domínio `nitidohig.com.br`, região `sa-east-1`, para envio transacional separado. Não foi ativado Titan nem contratado plano pago.

O Site URL do Supabase foi salvo como `https://teste-plataforma-delta.vercel.app`, com callbacks exatos de confirmação e recuperação nesse domínio. Os dois callbacks do alias anterior foram preservados durante a transição. A tela do Supabase confirmou os quatro retornos e o novo Site URL.
## Confirmação por e-mail e retorno PKCE

O erro `pkce_code_verifier_not_found` significa que o retorno não encontrou o verificador daquele navegador. O adaptador agora mantém as alterações de cookies durante a requisição, entrega somente o último valor de cada cookie e preserva os cabeçalhos de cache do SDK. O callback aceita o identificador de fluxo `sb_flow_id` quando fornecido. Falhas de links antigos voltam para a tela de entrada com orientação e reenvio, sem JSON cru e sem conceder sessão a partir de um código não validado. O reenvio pelo SDK gera um novo verificador no navegador atual.

Os modelos revisáveis estão em `supabase/templates/confirmation.html` e `supabase/templates/recovery.html`. Depois de publicar o código, aplicar os respectivos corpos nos modelos **Confirm signup** e **Reset password** do projeto Supabase `hoipjczqezeedflaiams`. Eles apontam para `{{ .SiteURL }}/account?token_hash={{ .TokenHash }}&type=email` ou `type=recovery`. A página só valida o token depois do clique em **Confirmar e continuar**, por POST em `/api/auth/verify-email`, para não consumir o link durante uma prévia automática do e-mail. O token é validado pelo Supabase; tipos não suportados e tokens reutilizados não liberam sessão.

Não desabilitar confirmação de e-mail nem usar uma chave administrativa para contornar esse fluxo. Os cookies continuam HttpOnly/Secure/SameSite=Lax e os retornos de recuperação são internos. O usuário confirmou recebimento de um e-mail, mas isso não comprova entrega pública para qualquer destinatário.

Os dois modelos foram aplicados e salvos no painel Supabase pela sessão administrativa da integração Vercel. Os e-mails emitidos no teste de produção confirmaram os assuntos em português e os links com o domínio canônico, `token_hash` e o tipo correto. Os arquivos locais não alteram automaticamente o serviço hospedado; futuras mudanças também precisam ser aplicadas no painel.

## SMTP e fluxo de e-mail verificados em 2026-11-04

O Resend retornou domínio `verified` e todos os registros exigidos `verified`: TXT `resend._domainkey`, CNAME `rsend` para `rsend-sae1.forge.rmta.net` e CNAME `send` para `send.forge.rmta.net`, TTL 300. Foram adicionados somente esses três registros à zona HostGator. Site, MX Titan e SPF/DMARC existentes foram preservados.

SMTP personalizado foi habilitado e salvo no Supabase: host `smtp.resend.com`, porta TLS 465, usuário `resend`, nome `nitido` e remetente `acesso@nitidohig.com.br`. A senha é a chave privada da integração, nunca registrada neste documento ou no Git. O limite inicial de autenticação permaneceu em 30 e-mails/hora.

Foi testado por HTTP no endereço público `https://teste-plataforma-delta.vercel.app`, com uma conta descartável e destinatário simulado `delivered+...@resend.dev`:

- Cadastro respondeu 200 com confirmação obrigatória; tentativa de login antes da confirmação foi bloqueada.
- E-mail de confirmação apresentou o modelo salvo e evento Resend `delivered`; seu token foi validado pelo endpoint publicado, com sessão real e cookies HttpOnly/Secure/SameSite=Lax. Reuso do token foi rejeitado.
- Login com senha funcionou. Recuperação enviou outro e-mail com evento `delivered`, modelo salvo e tipo `recovery`; validação encaminhou para `/account/reset`.
- Troca de senha respondeu 200; senha antiga foi rejeitada e senha nova autenticou. Saída respondeu 200 e acesso anônimo a `/api/workspace` respondeu 401.
- A conta descartável e os arquivos privados com suas credenciais foram removidos após os testes.

Os 13 testes locais de autenticação, interface de conta, confirmação e roteamento Vercel passaram. Os destinatários `resend.dev` simulam entrega: esses resultados comprovam integração SMTP e fluxo dos links, mas não chegada à caixa de entrada de Gmail, Outlook ou outro destinatário real. Essa verificação de recebimento permanece pendente. Nenhuma assinatura, cobrança ou exportação de contatos foi ativada.
