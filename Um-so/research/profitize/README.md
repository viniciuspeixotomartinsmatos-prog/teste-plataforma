# Recuperação ProfitizeBuild

Foram observados 82 itens publicados: 47 componentes/shaders, 33 landing pages e 2 motions. A coleta usou os documentos e bundles públicos de https://profitize.com.br/build. Nenhuma sessão, senha ou cookie foi exportado.

## Integração

O catálogo recebe 66 entradas novas. Outros 16 títulos tinham um único registro correspondente no catálogo 21st existente: seus IDs e rotas foram preservados, e suas prévias foram atualizadas. Os caminhos anteriores ficam em `recoveryOriginal`. Nomes genéricos com múltiplas variantes, como Aurora e Avatar Group, não são descartados por coincidência de nome.

Os 82 itens continuam acessíveis na biblioteca: 75 demonstrações executáveis e 7 referências gravadas. Os últimos são Classe G, Grau, M4 Competition, Rastro, Trilha e os 2 motions. Eles têm reprodução de vídeo e prompt de reconstrução, sem uma implementação interativa inventada.

Todos os prompts acrescentados são reconstruídos e identificados como tal. Os módulos recuperados são JavaScript compilado público, não os projetos TSX originais. O backend original, contas, pagamentos e conteúdo privado não foram recuperados.

## Arquivos técnicos

- `catalog.json`: inventário observado e metadados originais.
- `bundle-manifest.json` e `raw-bundles/`: URLs, hashes e bundles públicos coletados.
- `runtime-snapshot.json`: fábricas e aliases compilados necessários às demonstrações.
- `styles/`: folhas originais coletadas.
- `rea-summary.json` e `rea-evidence.json.gz`: Evidence da análise REA inicial de 4 bundles selecionados. As limitações dessa análise permanecem no próprio registro; ela não prova execução nem cobertura dos módulos coletados depois.
- `coverage.json`: relação de itens, consolidações, modos de prévia e ocorrências da importação.
- `browser-qa*.json` e `export-qa.json`: resultados de verificações, com escopo descrito nos registros. Uma checagem de inicialização não equivale à inspeção de cada estado interativo.

## Reprodução

Dentro de `Um-so/union-ui`, execute `npm run catalog:recover-profitize`. O comando recria o runtime a partir do snapshot e consulta as demos públicas. Para reutilizar demos já materializadas, execute `node scripts/import-profitize.mjs --only-demo=none`.

`node scripts/serve-recovery-qa.mjs` fornece o ensaio de navegador em http://127.0.0.1:4182/recovery-qa.html. `node scripts/audit-recovered-exports.mjs` verifica a incorporação dos arquivos usados nos downloads.

## Adaptações do sandbox

As demonstrações continuam sem `allow-same-origin`. Armazenamento indisponível usa memória temporária do próprio iframe, sem acessar os dados da biblioteca. Mosaik usa navegação em memória e não persiste a autenticação da demo. O carregador de Tecla resolve URLs contra `document.baseURI`. As sequências de Corda foram retidas localmente, com imagens carregadas em modo CORS. Nenhuma dessas adaptações habilita serviços de backend inexistentes.

Algumas mídias externas originais e URLs montadas dinamicamente continuam dependentes de internet. Os downloads de componentes incorporam scripts, folhas e recursos locais explícitos; caminhos dinâmicos remanescentes de mídia apontam para a origem pública original. As landing pages são entregues com seu grafo de módulos e `serve.mjs`, evitando quebrar imports circulares ao tentar incorporá-los num único HTML. O README de cada ZIP explica a execução por HTTP local.

Mosaik pode mostrar um aviso de dependência externa quando seu backend público falha. A demonstração visual permanece renderizada; isso não significa que o serviço de contas original foi restaurado. A auditoria registra esse estado separadamente de uma inicialização limpa.
