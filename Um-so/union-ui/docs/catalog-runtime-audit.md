# Auditoria das prévias — 2026-11-11

Base `1214db1fa`, branch `jorge`. A lista publicada contém 10.679 IDs distintos. O [inventário estático](../reports/catalog-static-inventory-2026-11-11.jsonl) registra rota, tipo e SHA-256 de cada documento, além do SHA-256 do catálogo. Os 10.679 documentos e as referências locais verificadas existem. Esta etapa não comprova pintura, interação, codec, layout, prompt ou exportação.

O [lote prioritário](../reports/catalog-priority-audit-2026-11-11.json) passou 9/9 na triagem de inicialização/mídia com login descartável, servidor normal e iframe de origem opaca. Os nove ZIPs foram gerados pelos exportadores do app com respostas do servidor autenticado, extraídos e examinados. As nove prévias extraídas foram abertas em outra origem local, fora da sessão; isso ainda não cobre todos os tamanhos, controles e caminhos de cada item.

| Entrada | Evidência e limite |
| --- | --- |
| Liquid Aurora | Gradiente visível no app e na prévia extraída; botão de copiar prompt testado; controle de viewport mobile acionado. |
| Loader e Loader 10 | Anel e barra originais visíveis nos HTMLs extraídos. |
| Progress e Rising Ball | Barra preenchida em 30% e bola sobre plataformas visíveis nos HTMLs extraídos. |
| Hls Video Player | O navegador devolvia `maybe` para HLS nativo, mas a reprodução falhava com código 4. A adaptação prefere o HLS.js original quando MSE aceita AVC/AAC e o suporte nativo é incerto. O relógio avançou no iframe e na exportação. Playlist e segmento são os originais; a prévia depende de internet. [HLS.js](https://github.com/video-dev/hls.js#compatibility). |
| Mine e Oval Eggs | Os MP4s locais são idênticos aos servidos pela origem e foram preservados nos ZIPs. Chromium falhava com código 3; o decodificador FFmpeg registrou avisos de parâmetros AVC. Os derivados VP9 sem perdas mantêm os 18 e 20 quadros, respectivamente, com MD5 de pixels idêntico para cada quadro decodificado. O relógio avançou no iframe e nos dois HTMLs extraídos. |
| Mosaik | O erro do ensaio vinha das requisições de Draco para `/draco/`, não de uma chamada de login. Os decodificadores públicos Draco 1.5.5 e sua licença passaram a integrar a rota autenticada e o ZIP. O modelo 3D apareceu no pacote executado com `serve.mjs`; clique real em `How it works` mudou a âncora para `#how`. A aplicação original de workspace e seu backend permanecem fora da recuperação; o host Supabase original não resolveu no ensaio. |

O [lote de 60](../reports/catalog-runtime-batch-0000-0060-2026-11-11.json) acrescentou 59 aprovações de triagem e uma pendência: Glyph Matrix atingiu o prazo sem sinal de prontidão. Próximo passo: repetir isoladamente, verificar pixels e a inicialização do renderizador. O relatório anterior de 103 casos tem escopo e data próprios; não somar aprovações sem deduplicar IDs e conferir hashes.

Para reproduzir a integridade estática a partir da aplicação:

```sh
node scripts/audit-preview-files.mjs reports/catalog-static-inventory-2026-11-11.jsonl
```

Para continuar a triagem por faixas estáveis do mesmo catálogo, gere lotes de até 150, use a rota protegida do servidor normal e baixe um checkpoint por lote:

```sh
node scripts/runtime-audit/build.mjs --start=60 --limit=150
```

A rota é `/tools/runtime-audit/index.html`; exige sessão. O relatório traz faixa, commit, hash do catálogo e hashes do documento bruto e preparado. Preserve o hash do catálogo ou refaça a fila por ID. `passed` nessa ferramenta significa apenas triagem. Para aceitação completa, confira página real, aparência desktop/mobile, interações aplicáveis com entrada real, prompt e clipboard, conteúdo e execução do ZIP e publicação autenticada. Resultados ausentes continuam pendentes.
