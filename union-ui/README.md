# Um só.

Aplicação local com catálogo único, busca, prévias interativas, código, favoritos, coleções e comparação. A identidade é provisória até a definição do nome final. A interface não organiza o produto por bibliotecas nem promove as fontes; a procedência e os avisos técnicos ficam nos arquivos de pesquisa e exportação.

## Uso e comportamento

- Abrir um componente inicia a prévia automaticamente em um iframe isolado.
- Particles oferece quantidade, tamanho, suavidade, velocidade e cor, com resposta ao cursor.
- A busca aceita português e inglês; Ctrl/Cmd K abre a busca global. Há filtros por categoria e tipo, favoritos, coleções e comparação de até três itens.
- O prompt inclui a implementação e os arquivos auxiliares quando recuperados. Para itens com apenas uma prévia compilada, inclui o HTML executável completo e identifica essa diferença no próprio prompt.
- O ZIP contém preview.html, configurações atuais quando aplicáveis, arquivos disponíveis, instruções e avisos técnicos completos. JavaScript, CSS e fontes locais do motor nativo são incorporados ao HTML; recursos externos ainda podem precisar de internet.
- Favoritos e coleções funcionam sem conta no navegador. Com login, ficam no banco SQLite do servidor e sincronizam entre sessões; conflitos são mesclados sem perder adições remotas. O tema continua local.

## Cobertura verificável

O inventário completo tem 17.243 registros, incluindo variantes, ícones, utilitários e referências. O app carrega somente public/data/catalog-live.json: entradas com uma prévia local e, no caso do motor nativo, uma demonstração montada.

Os números atuais ficam em public/data/catalog-coverage.json. Os resultados e as causas de falha ficam em public/data/preview-readiness.json. “Ready” nesse relatório significa compilação bem-sucedida, não inspeção visual de cada componente.

Há duas formas de código: fontes React e Vue editáveis recuperadas e demonstrações HTML compiladas. Uma demonstração compilada não equivale à recuperação do TSX original. O motor local também compila Vue, usando SFCs, estilos com escopo e exemplos originais. Conteúdo privado e recursos ainda dependentes dos sites de origem não foram recuperados integralmente. A autenticação e a sincronização já têm backend real. Pagamentos foram desativados por decisão do usuário. O inventário pendente permanece preservado.

## Desenvolvimento

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
npm test
npm run test:interactions
npm run build
npm run test:sites
```

O build gera dist/client, dist/server e dist/.openai/hosting.json. O motor nativo usa esbuild, o compilador de SFC do Vue e dependências NPM locais. As versões compatíveis estão fixadas pelo package-lock.json. Os previews de componentes usam sandbox sem acesso à origem do app. Os cinco estúdios integrados usam um iframe da mesma origem para armazenamento, exportação de arquivos e captura de mídia solicitada pelo usuário.

## Atualização do catálogo

```sh
node scripts/build-preview-inventory.mjs --retry-blocked --concurrency=4
node scripts/build-preview-styles.mjs
npm run catalog:publish
```

Use --refresh para recompilar fontes existentes. O modo --upgrade-runtime retoma a atualização de prévias ainda produzidas pelo motor anterior, sem recompilar as já atualizadas. Não execute dois processos que escrevam preview-readiness.json simultaneamente.

Os importadores dependem dos arquivos em ../research. Preserve esse diretório, os manifests e os notices para reproduzir as aquisições. A aplicação está configurada como noindex,nofollow para uso local. O alcance da verificação está documentado em design-qa.md.

## Ferramentas e contas

A rota /tools reúne áudio, fundos, texturas, formas e apresentações. Os motores e seus recursos são compilados para public/tools-runtime; não são embeds dos sites originais. Os arquivos das ferramentas podem ser copiados ou baixados; o áudio oferece WAV, MP3 e OGG conforme suporte do navegador, e os estúdios gráficos oferecem os formatos do respectivo editor. Compartilhamentos retornam às rotas do Um só. e preservam os parâmetros.

Para reproduzir a aquisição e compilação: node scripts/import-tools.mjs e npm run build:tools. Esses comandos dependem do cache em ../research. As fontes originais são mantidas; as adaptações do produto ficam em server/tool-adapters. O build normal utiliza os estúdios já compilados. npm run test:tools cobre síntese de áudio, WAV, SVG, estilos e o fluxo de exportação de código no JSDOM, sem validar GPU ou saída de áudio de um navegador.

## Servidor de produção

O servidor Node em server/start.mjs serve o build, a autenticação e as coleções. Use Node 24 ou superior, armazenamento persistente em var/ e as variáveis de .env.example. npm start executa esse servidor. O Dockerfile prepara a mesma aplicação. Os testes verificam isolamento por usuário, sessões, conflitos, arquivos privados, limites de requisição e leitura parcial de mídia.

Em desenvolvimento, os e-mails de recuperação são gravados somente na caixa privada var/mail; não são enviados. Em produção, configure SMTP_URL, MAIL_FROM e APP_ORIGIN HTTPS. A inicialização de produção falha se o e-mail não estiver configurado. Faça backup consistente do banco SQLite e mantenha uma única instância gravadora com volume persistente.

A cobrança permanece desligada (BILLING_ENABLED=false), e o acesso a ferramentas e downloads está aberto. Os preços acordados ficam preservados internamente, sem checkout ativo. O adaptador estático de Sites continua intacto para demonstração visual; ele não executa o backend Node nem substitui a hospedagem das contas. Nenhuma publicação pública foi realizada nesta etapa.
