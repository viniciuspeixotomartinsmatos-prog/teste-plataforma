# Verificação — Um só.

## Forty security/privacy requirements — 2026-11-09

- Scope: explicit private asset gating, API/body/origin/limiter controls, legal pages, account export/profile/deletion/essential preferences and operator-only encrypted backup tooling. Existing cosmic login artwork and layout preserved; legal links and signup acknowledgement added.
- Code checks: final full suite 157/157 passed, zero skipped; production build passed with Vite 6.4.6 (full build 2m11s; final source rebundle 3.69s reusing unchanged public files); Sites packaging 4/4; npm audit zero known vulnerabilities. PostgreSQL RLS/WITH CHECK/cascade and Paddle ledger tests use isolated PGlite without remote services.
- HTTP evidence: anonymous private-media GET/HEAD/Range denied, authenticated Range served with private/no-store, same cookie denied after logout. Account data export/correction/deletion and session revocation exercised locally. Server deletion remains disabled pending remote checks.
- Browser: latest authorized IAB attempt returned `Local browser use is disabled in Work settings`; no alternate-browser bypass. New privacy controls, legal pages and signup acknowledgement have build/DOM/code evidence, not actual desktop/mobile screenshot or full visual QA.
- Operational gaps: owning Supabase project unavailable through current connector; Vercel owner scope unavailable; backup schedule/restore, provider contracts, retention, admin MFA, monitoring and supplier identity completion remain pending. Refer to `docs/compliance-40.md`; no legal or exhaustive security certification is claimed.
- final result: code checks passed; visual and remote operational verification blocked

## Splash Cursor loading fix — 2026-11-09

- Target flow: `/component/splash-cursor-47c705` opens its actual cursor effect, confirms a presented frame, accepts pointer movement/click and exits loading. A stalled request or renderer must stop with a retry action.
- Found: original effect canvas is inside an aria-hidden decorative root; readiness excluded that canvas. Source also returned silently when WebGL2/float targets were unavailable. Preparation lacked a shared abort deadline and a late ready message could hide a failed attempt.
- Fixed: explicit pending/presented renderer markers; original WebGL renderer retained with startup and context-loss callbacks; interactive Canvas 2D ink compatibility renderer for failed/unsupported GPU initialization. Compatibility output differs from the original fluid shader. Original source and renderer notes included in exported payload.
- Shared loader: one 20-second deadline covers HTML and resource preparation, including work that ignores AbortSignal. Navigation cancels preparation. A renderer still unready after 30 seconds is unloaded; late ready messages cannot revive an error. Retry uses a fresh attempt.
- Code checks: 95/95 full-suite tests passed, production build passed (2m25s), Sites packaging tests 4/4, existing interaction audit 5/5. Final generated runtime HTML, bundle, package and overrides byte-compared/synchronized with build output after adapter regeneration.
- New tests: rendered React loading/error/retry flow with accelerated deadlines; hanging HTML and asset preparation; canvas pixel changes, resize, movement and click; compiled original demo startup with missing WebGL, unsupported float targets and thrown context creation. Tests assert checked readiness after real fallback pixel output and exact retention of the original TSX.
- Browser: CUA inventory returned `Local browser use is disabled in Work settings`. No alternate-browser bypass used. Desktop/mobile screenshots, actual browser WebGL shader output and authenticated production behavior remain unverified. Previous 21st batch stays unpublished; this fix does not validate those candidates.
- final result: code checks passed; browser QA blocked

## 21st November 9 update stage

- Scope: 168 unpublished candidates, including 144 component examples, 16 independently assembled theme demos and eight compiled template references.
- Browser result: `Local browser use is disabled in Work settings` opening the local audit page. No alternate browser or screenshot bypass. Startup, visible frames, media decoding, layout and interactions remain unverified for this batch.
- Code validation: 89/89 tests, production build (3m24s) and 4/4 Sites packaging tests passed. Includes source/media hashes, theme DOM controls and four prompt/archive samples, not all-item export or visual verification.
- Six components retain original compiled examples because upstream helpers are missing; editable-source limitations are disclosed. Nine template captures incomplete; two hosts return HTTP 402. Those eleven are not candidates.
- Production catalogs unchanged. Publication requires actual individual browser evidence and matching preview SHA-256 through the guarded publisher.
- final result: blocked — authorized browser validation unavailable

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
# 2026-11-04 — Product name nitido

Renamed the visible product to `nitido`, exactly as requested: lowercase, without an accent or trailing period. Updated signed-in and signed-out headers, footer, route titles, initial HTML title, tool-frame title, tool-generated brand text, presentation sample assets and account-email display strings. Existing storage identifiers, routes, technical source notices and collaborator authentication changes were preserved.

The dedicated local browser session displayed `nitido` on the login header and `Sua conta — nitido` in the page title. Screenshot: `var/audits/nitido-brand.png`. Eleven relevant application/authentication/export tests passed. Tool bundles were rebuilt, with 426 relative chunk references checked. The production build passed, followed by all four Sites packaging tests. The packaging check was initially run while the build was still copying files; its temporary missing-index failure disappeared after the build completed.
## 2026-11-04 — Email confirmation callback

The reported `pkce_code_verifier_not_found` was reproduced with the real installed Supabase SDK and a mocked Auth transport by opening a callback without its PKCE cookie. No code from the user's screenshot, personal password or live user token was consumed. A separate production reset request for a unique nonexistent `.invalid` address confirmed that the live API emits Secure/HttpOnly verifier cookies; it did not create an account or deliver a message.

The callback now redirects to a useful account screen instead of raw JSON. Source tests cover actual SDK signup and resend verifier persistence, matching flow IDs, token-hash verification without a signup cookie, recovery routing, replay rejection and origin protection. The account confirmation UI performs no verification during GET/render; an explicit button submits the token by POST. Screenshots: `var/audits/email-callback-recovery.png` and `var/audits/email-confirmation-ready.png`.

The final full suite passed 82 tests. Pending signup no longer triggers session refresh calls that could clear pending PKCE state. The complete production build and all four Sites packaging tests passed. Local browser inspection confirmed the new callback guidance. Applying the two retained hosted email templates remains pending project-owner access to Supabase through the Vercel integration; no real email-link confirmation or password recovery is claimed verified end to end yet.
## 2026-11-05 — Auth Fuse account screen

The user's screenshot and supplied compiled HTML were the visual reference. The account screen now uses a compact unboxed left-hand form and the two original purple astronaut WebP illustrations on the right, with subtle floating motion, form transitions and a typed Portuguese quote. The artwork was extracted without editing or running the attached compiled application. Header, footer attribution text and copy use nitido. Asset provenance is retained in `public/licenses/auth-fuse-assets.md`. The reference's dummy social-sign-in callback and demo selector were not introduced as working authentication controls.

Existing login, signup, verification, resend, reset and signed-in workspace behavior remain connected to the existing account API. Added a labelled password-visibility button, resetting visibility and clearing the password when switching form modes. Fields preserve autocomplete, labels, required constraints, 12-character new-password minimum and pending/error messages. The decorative image is hidden at narrow widths; reduced-motion styles disable float, fade and caret animation, and the quote is immediately complete when reduced motion is active at mount.

The dedicated authorized project browser showed both original illustrations decoded, login-to-signup switching, password visibility toggling and recovery navigation. Desktop composition was inspected at the browser's default 1536 × 730 size. The 390 × 844 viewport showed no horizontal overflow (`scrollWidth: 390`), readable form controls and hidden artwork. Both dark and light mobile states were inspected. Screenshots: `var/audits/auth-fuse-desktop.png` and `var/audits/auth-fuse-mobile.png`. The temporary viewport override was reset afterward. No personal credentials were entered and no production account was created during this visual change.

Final verification: 83 tests passed with two concurrent workers, production build and all four Sites packaging checks passed. The first unrestricted test run, performed while the full public asset build was busy, timed out on the existing catalog interaction test and retained its React worker; that owned failed worker was stopped, the test passed separately, and the entire suite passed with bounded concurrency. The final CSS adjustment was rebuilt without copying the already verified public assets again. Supabase cookies, origin policy, callback handlers, email templates and payment settings were not changed.


## Cosmic login reference — 2026-11-05

- Source visual truth: `C:/Users/jorge/AppData/Local/Temp/codex-clipboard-5c8e8262-4420-411c-8c8f-86f0f5e1639b.png` (1672 × 941 pixels).
- Implementation: local `/account`, IAB temporary 1672 × 941 viewport (reported innerHeight 942; density 1). The browser displayed an intermediate desktop screenshot during the comparison. No final screenshot was persisted: browser access was disabled during the final check.
- Full-view comparison: navy space composition, astronaut, rays, left glass card, brand and right quote were reviewed against the supplied reference. Exact original layered artwork was unavailable; background was edited with Image Gen to remove UI before implementing actual HTML controls.
- Focused comparison: DOM geometry of card, emblem, title, subtitle, inputs, submit and quote measured in the browser. Initial card was 736px tall against reference 720px, fields were 482px against reference 493px; adjusted label line-height, heading/support gaps and asymmetric horizontal padding. Final browser comparison remains unverified.
- Fonts/typography: local Inter, 44px desktop title, 20px subtitle/input, 18px labels, 24px submit, 30px italic quote. No rasterized form text.
- Spacing/layout rhythm: viewport-scaled two-column desktop layout with approximately 594px card at x132/y119. Responsive readable form replaces the desktop split below 900px; mobile visual check remains pending.
- Colors/tokens: fixed reference navy, lilac icon/field outlines, luminous amethyst border and violet-to-lilac submit. Existing global product tokens retained outside the auth screen.
- Image quality: 1672 × 941 PNG background generated by editing the supplied reference; no unsupported claim of pixel-identical original artwork.
- Copy/content: reference login heading, subtitle, placeholders, signup/support links and quote retained in Portuguese. Signup/recovery/confirmation modes preserve existing actual behavior.
- Findings: [P2 verification gap] Final desktop/mobile visual comparison and post-change browser interactions are blocked by “Local browser use is disabled in Work settings”. Temporary viewport reset could not be performed after access was disabled. Do not claim exact 100% fidelity or complete visual QA.
- Implementation screenshot path: unavailable for the final revision; prior Auth Fuse screenshots are superseded and must not be presented as current.
- Browser console check: not completed after final changes because browser access was disabled.
- Verification results: full suite 83/83 passed with test concurrency 2; production `npm run build` passed (2m31s), including Sites preparation; `npm run test:sites` passed 4/4. `git diff --check` passed. These checks do not substitute for final visual QA.
- final result: blocked


## Profitize November 9 integration

Scope: eight new entries, seven recorded video references and one original interactive React component. Original prompts, guide files and supporting ZIPs preserved. Existing login mock QA status above remains unchanged; this catalog verification does not certify that separate screen.

- Source: original Profitize listing/detail UI under an existing Pro session; retained original prompts and media in `../research/source-checks/releases/2026-11-09/profitize/`.
- Browser: authorized IAB, local loopback audit server, opaque sandbox startup audit 8/8 without errors after fixing JSX runtime. First failure and fixed rerun are recorded honestly in the acquisition log.
- Desktop evidence: `var/audits/2026-11-09/sticker-footer.jpg` (full original React footer after replay, approximately 1264px wide). Native keyboard movement changed the sticker's position; Escape reset it; replay and credits expanded correctly. Original code-provided lettering, stickers, copy and colors retained without replacement artwork.
- Mobile evidence: `var/audits/2026-11-09/sticker-footer-mobile.jpg`, 390px CSS viewport; document scroll width 390px. Source media same subject/crop as original MP4/poster, videos contain-fit with native controls; Kairo tested at 390 × 844. Temporary viewport override reset afterward.
- Playback evidence: all seven readyState 4, videoWidth 960, no media errors; currentTime advanced for all seven. Originals range from 18.8s to 29.53s.
- Export evidence: actual copied Kairo prompt exercised through rendered app DOM; all eight prompt outputs preserve original downloaded text. Seven exported support ZIPs byte-compared; exported previews embed identical MP4 bytes. Interactive source export includes both original TSX files and an inlined standalone preview.
- Limits: authenticated production UI interactions, original support ZIP projects' individual builds and full touch/drag physics are not claimed verified. No server-side application behavior was recovered from a recorded preview. Whole-source inventory differences elsewhere remain pending.
- final result: passed

- Release validation: 84/84 full-suite tests passed; production build passed in 3m49s; Sites packaging tests passed 4/4. Closing static metadata and all new assets byte-compared with the production build output after source-check bookkeeping.


## 2026-11-10 — Apple shell, exact supplied identity and Raio-X reference

- Applied the user's Apple-inspired system to the shell, public/translated marketing, legal and account surfaces. Original isolated component art remains independent. Raio-X retains its explicit dark reference palette and semantic score colors.
- The original 2172×724 PNG is byte-identical to the supplied file (SHA-256 `73b47483deaeee127c511f2ea9b4e5e69643ebde3ce289eda8d58ff093113f4d`). The alpha mask preserves the icon shape and stationary lettering; a periodic four-second gradient moves only within the icon. Authorized browser CSS inspection confirmed four seconds, and emulated reduced motion resolved to `animation-name: none`; the emulation was reset.
- Authorized IAB: desktop catalog, 390×844 mobile catalog and Raio-X hero/report actions inspected. A real footer overflow was found and fixed; mobile document scroll width equals its 375px content viewport (390px including scrollbar). Phone layout, category cards and visible copy actions remain accessible. Anonymous local login was reloaded and visually checked after fixing exact public CSS boot-module paths; no catalog-media access was broadened.
- Full suite: 176 passed. Build including all retained public files passed; final incremental source rebuild used the unchanged copied public distribution plus the updated Apple CSS. Sites packaging tests: four passed. Subsequent app/security checks: fifteen passed.
- Scoring fixture reproduces reference 77 and categories 61/94/75/84/76, including our adapter. Two additional tests cover renderer audit evidence/tracker network requests and robots/probe failures. UI regression verifies that Analyze again refreshes the actual result URL and retains the actual raster screenshot in account-local history.
- The authorized original service measured Eco Park as 75 today: speed68/mobile84/SEO100/Pixel15/privacy97. Its earlier supplied screenshot was76/speed70. Actual nitido production measurement and release result are recorded in `docs/raio-x.md` after the deployment. A fixture and DOM tests alone are not production screenshot validation.


## 2026-11-10 — Approved liquid-glass redesign and organized icons

- Source of truth: user-supplied `Interface nitido — Biblioteca Criativa em Vidro.png`; this supersedes the flat Apple-only shell. The existing routes, actual demo images, original logo geometry and account/code boundaries remain intact. Header, hero, large search, pill controls, glass sidebar and three preview cards follow the reference composition. The cards retain their actual assets rather than using the mockup's invented example covers.
- Separate hero illustration: built-in Image Gen transparent output, retained as `public/assets/branding/nitido-glass-layers.png`; complete prompt/provenance in `docs/design-assets.md`. Original company logo bitmap remains byte-identical. Only its internal icon colors circulate; wordmark and geometry stay stationary.
- Authorized IAB at1672×941: measured header, hero, search, controls, sidebar, grid and first card rectangles matched exactly across light/dark states. Subsequent adjustments affect both themes equally. Hover/entry/CTA-border motion and subtle hero float honor reduced motion. No alternative dark layout or image substitution.
- Mobile390×844: document content width375px equals scroll width375px (scrollbar accounts for the remainder). Catalog and icon library remain usable; icon filter drawer opened/closed. Existing component preview code remains isolated and unchanged.
- Browser: all seven icon families produced96 nonempty actual SVG bounds in the visible grid. Phosphor user variant switched to duotone, keyboard size changed48→52, and a real ZIP downloaded. SVG body and LICENSE.txt byte-match the original data; export contains React, Vue and static React Native files. Material Line SMIL pause/resume and reduced-motion pause at five seconds were read from the live SVG DOM. Brand animation resolved to none under reduced motion; emulation reset.
- The new chunk protocol was reloaded in the browser:48/48 visible filtered drawings rendered without an error. Runtime uses234 chunks, largest395,125bytes, and a2,030,206-byte index. Original oversized full-family responses are no longer shipped. Every vector record and all family licenses are checked structurally; representative React/Vue/native exports compile. This is not manual visual inspection of every vector or a complete native-app run.
- Full suite after the final bounded/progressive loader:183 passed, zero failures. The real stalled-request regression ends loading with retry after20seconds. Production build passed, retained static packaging preserved, Sites handoff tests included in the suite; final incremental code build uses the same copied unchanged retained public assets and current icon chunks.
- Production Raio-X prerequisite is complete: Eco Park75, reference75; actual mobile screenshot and seven correction prompts were exported. See `docs/raio-x.md` for measured-category differences and clipboard automation readback limits.
- Evidence in ignored `var/glass-qa`: light.png, dark.png, icons-desktop.png, icons-mobile.png. Production acceptance of the new redesign remains the final release check.
