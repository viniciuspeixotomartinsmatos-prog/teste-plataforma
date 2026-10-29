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
