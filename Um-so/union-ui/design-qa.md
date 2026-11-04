# Verificação — Um só.

Atualização: 28/10/2026. URL local: http://127.0.0.1:4173/.

## Objetivo atual

Um produto único, com identidade provisória “Um só.”, categorias comuns, prévias automáticas, código, prompt, ZIP, favoritos, coleções e comparação. Os nomes das bibliotecas não são filtros ou créditos na interface. A procedência e os avisos técnicos são preservados nos arquivos.

## Cobertura

- 17.243 registros no inventário; 10.591 entradas com prévia local no catálogo publicado.
- 2.794 entradas publicadas têm fontes editáveis recuperadas. A maioria das demais tem HTML compilado; isso não equivale à recuperação do TSX original.
- A auditoria de compilação não apresenta falhas React remanescentes. O motor Vue foi integrado: 865 fontes com exemplos compilam. Permanecem cinco utilitários sem interface própria.
- Os 6.652 registros ainda fora do catálogo publicado permanecem no inventário interno.

## Código e comportamento

- Vue: quatro testes de interação aprovados (SVG animado, abas, diálogo e código de verificação).
- A auditoria de inicialização dos exemplos Vue verificou 92 entradas: 90 aprovadas, duas dependem de GPU e permanecem sem validação visual. Evidência: ../research/vue-startup-audit.json.
- O ZIP e o prompt preservam a linguagem Vue e o arquivo example.vue; o código da interface identifica o framework correto.

- A suíte principal cobre integridade dos caminhos, busca, categorias, favoritos, coleções, comparação, código, temas, rotas e cópia de prompt com HTML executável.
- O teste de Particles usa o componente real e um canvas 2D no Node: confere a quantidade de partículas, reação ao cursor, alteração para 42 partículas e presença de pixels desenhados.
- Cinco testes de interação passam: acordeão, etapas, abas, mudança de tema e ordenação da tabela. Evidência: ../research/interaction-audit.json.
- Os 116 blocos examinados inicializam sem erro no JSDOM. Essa auditoria não verifica layout, GPU, mídia externa ou todas as interações. Evidência: ../research/block-startup-audit.json.
- As 38 implementações recuperadas pelo conector também compilam com suas dependências. Evidência: ../research/connected-compilation.json.
- O teste de ZIP descompacta o resultado e verifica fontes, configuração, JavaScript/CSS incorporados, fonte local incorporada e notices completos.

## Verificação visual já realizada

Em uma sessão anterior desta conversa, o navegador local permitiu conferir o catálogo e Particles no desktop e em 390 × 844. Foram observados a prévia automática, os controles de partículas, a busca/filtros no celular e o download real do ZIP. A ação de copiar prompt exibiu a confirmação; o conteúdo da área de transferência foi validado nos testes de código, não lido pelo navegador.

Depois disso, a ferramenta voltou a informar “Local browser use is disabled in Work settings”. O usuário escolheu continuar pelos testes de código. A restrição não foi contornada. As alterações mais recentes ainda precisam de inspeção visual; não há confirmação de aparência ou funcionamento de todos os 10.591 previews.

## Ferramentas e backend em 28/10/2026

- Cinco estúdios compilados com fontes, workers, mídia e fontes tipográficas locais: áudio, fundos, texturas, formas e apresentações. As adaptações retiram a promoção das bibliotecas da interface, localizam controles e mantêm os avisos técnicos.
- Os estúdios de áudio e fundos foram montados a partir do bundle de produção no JSDOM: diálogo de código, cópia dos arquivos completos e geração de ZIP passaram; a seleção de som também foi exercitada. CSS e GPU não são renderizados nesse teste.
- O motor real de áudio gerou amostras não silenciosas; alteração de duração e afinação, waveform e WAV mono/estéreo em 16/24/32 bits passaram. Esse teste usa implementação Web Audio em Node, sem reproduzir nos alto-falantes.
- Variantes de shader, rastreamento de campos para SVG e importação/exportação de estilos de textura passaram. Os quatro testes originais do motor de shader também passaram.
- Contas com senha protegida, sessão HttpOnly, logout, recuperação de acesso e coleções isoladas por usuário implementadas. Conflitos concorrentes de favoritos foram reproduzidos e corrigidos.
- O servidor de produção testa bloqueio de caminhos privados, limites de corpo, arquivos pagos quando explicitamente habilitados e respostas parciais de vídeo.
- Stripe cancelada pelo usuário; integração desligada e interface de checkout retirada do fluxo. Nenhuma nova configuração externa após o cancelamento.

## Evidência do navegador nesta etapa

O navegador permitiu abrir a conta e entrar com um usuário de teste local. A página mostrou o nome da conta e o estado de coleções sincronizadas. Particles exibiu os controles e a prévia automática. Em seguida, o controle voltou a responder “Local browser use is disabled in Work settings”. A restrição não foi contornada. A aparência final dos novos estúdios em desktop/celular, os codecs do navegador, GPU e captura de tela/câmera não foram validados no navegador.

## Limites atuais

Os 6.652 registros sem demonstração recuperada continuam fora do catálogo público. Muitos itens publicados têm HTML executável, sem TSX original. Recursos externos de alguns componentes ainda requerem internet. Não foi confirmado o funcionamento visual de todos os 10.591 previews.

Para publicar contas em produção, ainda é necessário configurar o domínio HTTPS, um serviço SMTP e a hospedagem Node com volume persistente. A entrega local não configura esses serviços externos.

## Validação final

- 31 testes da suíte principal aprovados.
- Auditorias dos estúdios de áudio e fundos no JSDOM aprovadas.
- Quatro testes originais do motor de shader aprovados.
- Build de produção aprovado em 1 min 55 s.
- Quatro testes do adaptador estático aprovados.
- Teste do build servido pelo Node aprovado: rotas, três frames de ferramentas, recursos locais, conta, acesso sem cobrança e assets da interface.

## Capas do catálogo — 29/10/2026

- Auditoria inicial: 9.876 cards sem imagem ligada ao catálogo.
- Recuperadas 5.539 imagens originais, decodificadas antes da inclusão, e 245 vídeos MP4 validados.
- Geradas 1.546 capas SVG a partir do desenho montado de cada ícone. A auditoria rasterizou todos os SVGs; seis ícones de sinal zero têm somente pequenos pontos, conforme os originais. Nenhum SVG ficou sem geometria.
- Estado final: 7.800 capas locais e 2.791 capas com a própria demonstração. Todos os 10.591 cards publicados têm uma fonte visual.
- Cards sem imagem e imagens quebradas usam o próprio iframe com sandbox allow-scripts; o teste verifica troca após erro e desmontagem ao sair da região visível. Vídeos são mudos, carregam sob demanda e param quando o card sai da tela.
- Verificação visual real no navegador local, desktop padrão e 390×844: busca Magic Card mostrou os previews nos cards antes vazios, sem overflow horizontal na amostra mobile. Os avisos React encontrados no histórico do console foram produzidos pelo hot reload após alterar a lista de dependências de um efeito durante desenvolvimento; revisão limpa é feita após reload.
- Restauradas as fontes e a configuração TypeScript necessárias aos exemplos Vue no repositório compartilhado. O .gitignore anterior excluía o cache inteiro.
- 33 testes da suíte principal e quatro do adaptador passaram. Build de produção aprovado. Isso não representa inspeção visual de cada componente ou de todos os vídeos.

Após a otimização (WebP, largura máxima 800 px, qualidade 82), os 33 testes passaram novamente. As novas capas ocupam 79 MiB; os 245 vídeos ocupam 264 MiB. Depois de recarregar a página de teste, o console não registrou novos erros: sete cards, imagem decodificada e cinco previews montados na região visível, sem overflow horizontal. A tela de comparação também usa a mídia real.

## Playground e montador — 30/10/2026

- Auditoria `npm run audit:previews`: 10.591 documentos publicados, 7.800 imagens e 245 vídeos locais; 24.030 caminhos únicos conferidos, nenhum arquivo vazio/ausente identificado. Relatório em `var/audits/preview-files.json`. É uma checagem estática; não certifica a execução de todos os componentes nem serviços externos.
- Corrigidas dependências ausentes da recompilação de Tabs e Data Table. Restauradas as fontes React originais e a implementação compartilhada de Table. Os cinco testes de interação em JSDOM passaram com os bundles recompilados.
- Corrigida a rota de componente com URI malformada, que podia lançar erro na página inteira. Inicialização instrumentada usa timer, evitando depender de dois frames de animação em iframes fora da tela. O playground preserva texto dinâmico não editado e não reinicia animações concluídas ao aplicar estilos.
- Testes de projeto verificam ordem, cópias independentes, desfazer/refazer, importação validada e limite de 30 seções. Testes do bridge verificam edição literal sem injeção de HTML, preservação dos elementos aninhados, restauração e rejeição de mensagens de outra janela. Exportação verifica HTML executável, configurações, alturas responsivas e licenças.
- No navegador real: adicionada Magic Card, alterado botão para “Entrar agora”, duplicada seção, acionados desfazer/refazer, recarregada a página e baixado `pagina.zip`. O JSON baixado preservou o texto nas duas seções. Os iframes renderizaram as duas cópias. Particles abriu automaticamente, e o campo de título alterou a prévia para “Meu universo.”.
- Desktop e 390×844 revisados. Corrigida navegação móvel em duas linhas para manter os cinco links visíveis. Na amostra mobile, documento de 375 px dentro do viewport de 390 px: nenhum overflow horizontal. Evidências locais em `var/audits/builder-mobile.png` e `var/audits/playground-desktop.png`.
- Suíte principal: 36 testes aprovados; adaptador Sites: quatro. Build completo aprovado; recompilação final de produção sem recópia dos assets estáticos também aprovada. Nenhuma cobrança foi ativada.
- Limites: projetos são locais, compartilhados por JSON; páginas exportadas compõem runtimes isolados. Recursos externos e integrações de formulários não se tornam serviços reais automaticamente. A inspeção visual cobre os fluxos acima, não as 10.591 demonstrações individualmente.

## Correção das demonstrações — 30/10/2026

- Triagem automatizada no navegador executou as 10.591 entradas publicadas. A última rodada marcou 23 casos para revisão; cinco receberam correções posteriores e aguardam novo teste. O bloqueio de uso do navegador nas configurações do Work impediu concluir essa rodada. O relatório por entrada está em reports/preview-runtime-audit.json. Isso não equivale a validar manualmente todas as interações.
- Circular Carousel foi visto no navegador com as três imagens locais carregadas, sem os ícones quebrados da captura do usuário. Evidência em var/audits/circular-carousel-fixed.png. A tentativa de entrada por teclado encontrou limitação de foco da ferramenta; não se declara esse gesto aprovado.
- Corrigidos exemplos com largura zero, conteúdo demonstrativo ausente, armazenamento indisponível em sandbox opaco, helpers ausentes em workers serializados e entrega incorreta de bundles recém-gerados pelo Vite. Sandbox continua sem allow-same-origin.
- Cache local de 5915 mapeamentos de mídia, aproximadamente 1107 MiB de arquivos únicos. Proveniência e dados recompostos estão explícitos em data/demo-local-assets.json e licenses/demo-media-recovery.txt. Substituição de dados de exemplo não significa recuperação do original.
- Restaurados o GLB original do modelo ASCII, a cena/renderer/imagens originais de Energy Beam, os favicons do exemplo CRM, o módulo Markdown compilado localmente e o motor compatível de Sparkles. Uss usa uma reconstrução interativa identificada nos arquivos técnicos.
- Suíte principal: 42 testes aprovados antes dos dois testes adicionais de integridade. Os sete testes de saúde finais passaram; os dois adicionais verificam todos os caminhos mapeados e GLB/Markdown. Cinco testes de interação em JSDOM aprovados. Build e adaptador registrados abaixo após conclusão.
- Nenhuma cobrança ativada. A branch de publicação informada pelo usuário é jorge.

Build de produção aprovado em 3 min 17 s; quatro testes do adaptador Sites aprovados. Corrigido também o contêiner sem tamanho de Warp Gradient; a verificação visual dessa última correção continua pendente.

Validação final após as últimas mudanças: 45 testes principais aprovados. Nova compilação da interface aprovada em 2,18 s, reutilizando os assets estáticos já copiados. A auditoria estática examinou 13.352 documentos/bundles e não encontrou referências locais de mídia sem arquivo ou remapeamento válido. Essa checagem não certifica serviços externos.

Após a revisão da exportação portátil, os nove testes de saúde passaram, incluindo um novo teste que exige renderer JS, cena JSON e imagens aninhadas de Energy Beam incorporados no HTML. A suíte principal anterior tinha 45 testes; esse caso acrescenta um teste ao total.

## Shape Waves — 03/11/2026

- GitHub synchronized before changes: jorge current with origin/jorge. Production reproduced an invisible canvas, opacity-0 and data-ready=false, while the host advertised interaction. The original WebGPU error callback was not handled by its demo; mounted/background heuristics could incorrectly mark it ready.
- Added a compatible Canvas 2D renderer while retaining the original GPU implementation. It draws the mixed shape grid, animated noise bands, text cutout, damped pointer ripples, colors, pause and resized output. It remains visible during GPU startup and takes over on adapter rejection, startup timeout or device error. Its raster antialiasing/glow differs from WGSL; no claim of pixel identity.
- Readiness respects explicit pending markers and excludes unready renderer canvases/backgrounds. Original sandbox and authenticated-parent asset relay remain enabled. Additional demo dependencies are retained in source exports.
- Local real browser: shapes and text cutout visible, canvas data-ready=true, interaction click accepted, mobile preview resized to a 488×750 backing canvas at device scale. Desktop and mobile screenshots in var/audits/shape-waves-fixed-desktop.png and shape-waves-fixed-mobile.png. No claim of a successful native WebGPU frame on this environment.
- Four focused tests passed: actual raster pixels animate, pointer ripples change pixels with background paused, text masking/colors/resize work, pending renderers cannot announce readiness, and both absent WebGPU and adapter rejection mount a ready compatible canvas. Related preview/export/protected-asset tests passed before the final source cleanup; final full suite and build follow below.

- Final validation: 64 tests in the complete suite passed, plus all five source interaction checks. The four focused tests passed again after the final fallback-state adjustment. Browser download shape-waves-121669.zip (453,365 bytes) contained GPU source, compatible renderer and embedded executable preview; no local runtime script fetch remained. The clean browser console reported no new warnings/errors. Build and Sites results are appended after completion.

- Production build passed in 4 min 52 s; four Sites adapter tests passed. After merging collaborator commit 22b488262, all 12 targeted app/builder/protected-asset/Shape Waves tests passed. The merged interface was rebuilt using the copied static assets, and the collaborator assets/current preview were synchronized into the local build. No deployment credentials or isolation settings changed.

## Profitize: nove lançamentos — 03/11/2026

- Sincronizado origin/jorge antes da alteração. O catálogo público mostrava 91 itens contra os 82 retidos. Adicionados Lusco, Sushi Conveyor Menu, Maison, Clareira, Akari, Ollo, Glassy Coverflow Carousel, Sulko e Shari. O total publicado do Profitize é 91: 77 demonstrações executáveis e 14 referências gravadas, com 16 IDs anteriores consolidados preservados.
- As sete landing pages novas usam seus vídeos originais locais, com controles. Os dois componentes usam os módulos compilados públicos novos em modo stage, mantendo o runtime inicial separado. Todos os prompts continuam identificados como reconstruídos, sem reivindicar o código TSX ou o prompt original do servidor.
- Navegador real: 9/9 novos itens inicializaram sem erros e sem imagens quebradas. Os sete vídeos chegaram a readyState=4 com dimensões válidas, duração entre 20,6 e 28,8 segundos e nenhum erro de mídia. No Sushi, pausa funcionou, um prato abriu o diálogo, e Adicionar ao pedido alterou o contador de 0 para 1. No carrossel, Próximo alterou Duna: Parte Dois (3/6) para Ainda Estou Aqui (4/6). Capturas em var/audits/profitize-sushi-updated.png e profitize-carousel-updated.png; resultados em research/profitize/releases/2026-11-03/browser-qa.json.
- A tentativa de abrir o trailer não produziu um diálogo verificável; o teste por teclado foi interrompido quando o uso do navegador foi desativado nas configurações. Reprodução do YouTube e demais estados não são declarados aprovados. Não se contornou o bloqueio.
- Auditoria de exportação e preparação para sandbox protegido: 91/91 aprovados em cada auditoria. Um teste adicional verificou as imagens de pratos e pôsteres montadas dinamicamente: os downloads mantêm o mapa dos URLs originais para imagens incorporadas em data URLs.
- A suíte completa anterior passou com 65 testes; dez testes finais de catálogo/exportação passaram após a correção do mapa portátil. Build completo aprovado em 4 min 37 s e quatro testes Sites aprovados. Validação final da interface é recompilada abaixo após a última mudança. A análise REA foi estática e limitada a um dos 67 bundles; a evidência e suas limitações foram preservadas.

- Conclusão da validação desta atualização: 66 testes principais aprovados após a correção de exportação; recompilação final da interface aprovada em 3,80 s com os assets estáticos do build completo anterior. O escopo de vídeo é reprodução/decodificação das sete prévias originais. A abertura/reprodução de trailers externos no YouTube continua sem confirmação visual.
# 2026-11-04 — Dither Field and four recorded references

After Git synchronization and the user's authorization to continue, a dedicated project Chrome session was available. Dither Field's original default WebGL2 example rendered visible animated dots, responded to pointer dragging, and rendered at mobile preview width and in the light preview theme. Nine original example sources are retained; the other examples were not separately browser-verified. No GPU-loss or unsupported-WebGL simulation was performed for this component.

Original Argila, Lavri, Skeleton and Colina videos decoded in opaque `allow-scripts allow-downloads` frames with readyState 4 and no JavaScript/media/image errors. Argila playback and its native pause control were exercised in the actual component page. Prompt-copy success was observed for Argila and Dither Field. Their browser ZIP downloads were generated and inspected, and automated archive checks proved original MP4 bytes were embedded for all four recorded references. These remain videos with reconstructed prompts; they do not claim editable original landing-page projects or recovered backend functionality.

Validation: 69 application tests passed; recovered exports 95/95; protected-preview preparation 95/95; complete production build passed; four Sites packaging tests passed. Final static catalog/source updates were synchronized into the build output and byte-compared after the build. Screenshot: `var/audits/dither-field-2026-11-04.png`. Details and per-video browser evidence: `../research/source-checks/README.md` and `browser-videos-2026-11-04.json`. Publication status is verified separately after pushing.
