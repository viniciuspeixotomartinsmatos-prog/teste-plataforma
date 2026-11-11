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

Os lotes [0–59](../reports/catalog-runtime-batch-0000-0060-2026-11-11.json), [60–209](../reports/catalog-runtime-batch-0060-0210-2026-11-11.json) e [210–359](../reports/catalog-runtime-batch-0210-0360-2026-11-11.json) completaram 360 triagens, com 320 aprovações e 40 pendências. Com os nove prioritários, são 369 IDs distintos nesta rodada: 329 aprovados na triagem e 40 pendentes. Glyph Matrix atingiu o prazo sem sinal de prontidão; repetir isoladamente, verificar pixels e a inicialização do renderizador. O relatório anterior de 103 casos tem escopo e data próprios; não somar aprovações sem deduplicar IDs e conferir hashes.

Produção: `c68978f05` em READY, alias `teste-plataforma-delta.vercel.app`. A [verificação HTTP autenticada](../reports/catalog-production-audit-2026-11-11.json) registra nove rotas, nove ZIPs gerados com os dados servidos pelo domínio, igualdade de SHA-256 nos cinco arquivos selecionados, Range autenticado `206` e GET/HEAD/Range anônimos `401` nos cinco caminhos protegidos. Nenhum e-mail enviado; a conta sintética foi removida. Cobrança desativada. A evidência de execução no navegador acima é local.

Verificação de código: suíte base 222/222, testes focados finais 29/29, build final e Sites 4/4. Na primeira suíte completa do candidato, 224/225 passaram; o teste de empacotamento Sites tentou ler `dist/client/index.html` enquanto o build recriava a pasta. Sites 4/4 passou após o build; o resultado do teste concorrente não é contado como suíte completa aprovada.

Para reproduzir a integridade estática a partir da aplicação:

```sh
node scripts/audit-preview-files.mjs reports/catalog-static-inventory-2026-11-11.jsonl
```

Para continuar a triagem por faixas estáveis do mesmo catálogo, gere lotes de até 150, use a rota protegida do servidor normal e baixe um checkpoint por lote:

```sh
node scripts/runtime-audit/build.mjs --start=360 --limit=150
```

A rota é `/tools/runtime-audit/index.html`; exige sessão. O relatório traz faixa, commit, hash do catálogo e hashes do documento bruto e preparado. Preserve o hash do catálogo ou refaça a fila por ID. `passed` nessa ferramenta significa apenas triagem. Para aceitação completa, confira página real, aparência desktop/mobile, interações aplicáveis com entrada real, prompt e clipboard, conteúdo e execução do ZIP e publicação autenticada. Resultados ausentes continuam pendentes.
