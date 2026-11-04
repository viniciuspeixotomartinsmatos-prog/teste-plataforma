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

## Depois: assinatura Kiwify

Criar produto recorrente na Kiwify com entrega na plataforma externa. Enviar o usuário autenticado ao checkout. Processar webhooks no servidor com autenticação do evento, idempotência e conferência de produto, comprador e assinatura. Registrar direito de acesso no banco. Renovação mantém acesso até a data paga; cancelamento impede renovação sem encurtar período já pago; reembolso/chargeback e inadimplência seguem regra definida. Nunca liberar assinatura apenas pelo redirecionamento do checkout. Nenhuma cobrança foi ativada nesta etapa.

Referências oficiais: https://ajuda.kiwify.com.br/pt-br/article/como-criar-um-produto-de-assinatura-9crmrj/ e https://ajuda.kiwify.com.br/pt-br/article/como-funcionam-os-webhooks-2ydtgl/.

## Depois: planilha privada de contatos

Supabase é o cadastro principal; Google Sheets recebe uma cópia privada, por automação no servidor, com tentativas e deduplicação por ID. Separar dados operacionais de autorização para publicidade.

Campos propostos: ID, nome, sobrenome, e-mail, telefone opcional com DDI, país, data de cadastro, origem/UTMs, plano, situação da assinatura e registro da autorização de marketing (escolha, data, versão do aviso, revogação). Cidade/estado/CEP só se houver necessidade definida. Não exportar senhas, hashes de senha, tokens ou dados de pagamento. Não exigir dados demográficos desnecessários para acesso. A planilha de público deve conter apenas contatos elegíveis ao uso informado e permitir remoção após revogação.

Antes de configurar a exportação, escolher a conta Google e a planilha privada, apresentar o aviso de privacidade e confirmar os campos e a finalidade. Não há integração de planilha nem envio ao Meta nesta etapa.
