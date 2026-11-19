# Um só. — entrega do projeto em 28/10/2026

Abra a pasta union-ui no terminal e use Node.js 24 ou superior:

    npm ci
    npm run dev -- --host 127.0.0.1 --port 4173 --strictPort

Abra http://127.0.0.1:4173 . Para criar o build: npm run build.

Inclui o código do aplicativo, os cinco estúdios compilados, previews, arquivos locais de componentes, imagens, fontes, testes e os caches de pesquisa necessários para reconstrução. Mantenha research ao lado de union-ui.

Não inclui node_modules, senhas, sessões, contas de teste, bancos de dados, configurações secretas ou logs. O diretório dist foi omitido para não duplicar os mesmos 4 GB de recursos; npm run build o recria. Não é necessário baixar novamente o catálogo para usar esta entrega.

A Stripe está desligada e o acesso está aberto. Favoritos e coleções pessoais deste computador não fazem parte do pacote.

Validação: 31 testes, build e testes do servidor aprovados. Auditorias de exportação de áudio e fundos realizadas no JSDOM. A revisão visual final dos novos estúdios, GPU e codecs do navegador permanece pendente. O catálogo publicado tem 10.591 entradas; 6.652 registros do inventário continuam fora dele. Veja union-ui/design-qa.md.

Para publicar contas, configure HTTPS, e-mail SMTP e armazenamento persistente conforme union-ui/README.md e .env.example. A execução local cria um banco novo em var/.
