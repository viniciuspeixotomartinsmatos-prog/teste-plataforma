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

Uma conta descartável confirmou login real, cookies HttpOnly/Secure, gravação/leitura de coleções e bloqueio de leitura por outra conta e por visitante. O navegador local confirmou entrada, retorno à ferramenta, persistência após recarregar e saída. Esses testes usam conta confirmada de QA; não comprovam entrega de e-mail. SMTP personalizado e verificação do domínio remetente continuam pendentes. Não é necessário comprar uma caixa postal, mas o provedor de envio precisa verificar o domínio escolhido.

Na Vercel, as rotas aninhadas da API devem usar o entrypoint concreto `api/index.js` com rewrite `/api/:path*` para `/api`. O arquivo com nome de catch-all não resolveu `/api/auth/get-session` no deployment Vite; a falha foi confirmada por HTTP 404 em produção. Manter o teste de roteamento e verificar o endpoint publicado após qualquer alteração de deploy.

### Domínio remetente escolhido

O usuário escolheu `nitidohig.com.br`. Remetente proposto para confirmações e recuperação: `nitido <acesso@nitidohig.com.br>`. A consulta DNS identificou os nameservers `nspro78.hostgator.com.br` e `nspro79.hostgator.com.br`, com MX `mx1.titan.email` e `mx2.titan.email` (prioridades 10 e 20). Isso identifica os serviços DNS/MX, mas não comprova que exista uma caixa postal ou licença disponível.

O próximo passo depende do acesso ao painel HostGator para verificar o serviço de e-mail e configurar o remetente/SMTP. Não contratar licença ou plano pago sem autorização. Não remover MX, não substituir SPF existente e não apontar o site para a Vercel como efeito colateral de configurar o remetente. Usar somente os registros exatos emitidos pelo provedor escolhido. O APP_ORIGIN continua no endereço Vercel funcional enquanto não houver uma mudança de domínio web com DNS e HTTPS confirmados.

## Depois: assinatura Kiwify

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

Foi preparada a integração nativa Resend, plano Free, domínio `nitidohig.com.br`, região `sa-east-1`, para envio transacional separado. A criação ficou bloqueada pelo aceite obrigatório dos termos do fornecedor; ainda não há recurso Resend provisionado, SMTP ativo ou entrega de e-mail comprovada. O próximo passo depende da decisão do usuário na página de aceite da integração.

O Site URL do Supabase foi salvo como `https://teste-plataforma-delta.vercel.app`, com callbacks exatos de confirmação e recuperação nesse domínio. Os dois callbacks do alias anterior foram preservados durante a transição. A tela do Supabase confirmou os quatro retornos e o novo Site URL.
## Confirmação por e-mail e retorno PKCE

O erro `pkce_code_verifier_not_found` significa que o retorno não encontrou o verificador daquele navegador. O adaptador agora mantém as alterações de cookies durante a requisição, entrega somente o último valor de cada cookie e preserva os cabeçalhos de cache do SDK. O callback aceita o identificador de fluxo `sb_flow_id` quando fornecido. Falhas de links antigos voltam para a tela de entrada com orientação e reenvio, sem JSON cru e sem conceder sessão a partir de um código não validado. O reenvio pelo SDK gera um novo verificador no navegador atual.

Os modelos revisáveis estão em `supabase/templates/confirmation.html` e `supabase/templates/recovery.html`. Depois de publicar o código, aplicar os respectivos corpos nos modelos **Confirm signup** e **Reset password** do projeto Supabase `hoipjczqezeedflaiams`. Eles apontam para `{{ .SiteURL }}/account?token_hash={{ .TokenHash }}&type=email` ou `type=recovery`. A página só valida o token depois do clique em **Confirmar e continuar**, por POST em `/api/auth/verify-email`, para não consumir o link durante uma prévia automática do e-mail. O token é validado pelo Supabase; tipos não suportados e tokens reutilizados não liberam sessão.

Não desabilitar confirmação de e-mail nem usar uma chave administrativa para contornar esse fluxo. Os cookies continuam HttpOnly/Secure/SameSite=Lax e os retornos de recuperação são internos. O usuário confirmou recebimento de um e-mail, mas isso não comprova entrega pública para qualquer destinatário.

Nesta implementação, a atualização dos modelos no painel ainda depende do acesso ao projeto pela integração Vercel, na conta administradora `novonormaladm@gmail.com`. A sessão Supabase pessoal atualmente disponível não vê esse projeto. Os arquivos locais dos modelos não alteram automaticamente o serviço hospedado.
