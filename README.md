# Um só.

Aplicativo de componentes, previews interativos e ferramentas de criação. O código principal está em `union-ui/`; as fontes de apoio ficam em `research/`.

## Executar localmente

Requer Node.js 24 ou superior.

```sh
cd union-ui
npm ci
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

Abra http://127.0.0.1:4173 .

```sh
npm test
npm run build
npm start
```

A Stripe está desligada. Contas usam um novo banco privado local em `var/`, nunca versionado. Para produção, configure HTTPS, SMTP e volume persistente conforme `union-ui/README.md` e `.env.example`.

O catálogo publicado contém 10.591 entradas com prévia local. Consulte `union-ui/design-qa.md` para a cobertura real e limitações. Previews compilados não equivalem à recuperação do código-fonte original. Avisos técnicos estão preservados.

O `index.html` preexistente na raiz foi preservado; a entrada do aplicativo é `union-ui/index.html`.
