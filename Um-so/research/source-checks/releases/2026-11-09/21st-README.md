# 21st update stage — 2026-11-09

Status: staged, not published. Authorized browser control returned `Local browser use is disabled in Work settings`. No alternative browser was used and no successful browser evidence was fabricated.

Code and retained artifacts pushed to `origin/jorge` in `f50a1963d`. Deployment inspection returned HTTP 403 for the owning Vercel team (`Not authorized`); no deployment success is claimed. Reauthorize team access through the connector when the user is available. Windows Git operations on deeply nested original template resource names may require `git -c core.longpaths=true`; source bytes and evidence hashes are protected by scoped `.gitattributes` rules.

## Coverage

- All 125 newly observed routes resolved: 92 components, 14 themes and 19 templates. Metadata: `21st-target-metadata.json`.
- 92 original component/demo bundles acquired through the existing connector, combined with 52 earlier retained bundles: 144 distinct component candidates.
- 138 demonstrations compiled from original source with local dependencies. Six projects have missing upstream helper imports; their own original compiled examples were retained instead. Exports disclose missing editable source and reconstructed integration instructions. See `21st-compile.json` and `21st-original-bundles.json`.
- 16 themes staged: 14 new plus two earlier themes. Original CSS retained unchanged. Independently assembled token demonstrations provide form, theme and reset controls; they are not recovered upstream application projects.
- 19 public template demos checked: eight complete bounded static captures staged, nine incomplete captures and two original hosts returning HTTP 402. Partial captures remain research only. Compiled reference pages do not recover editable projects or backend behavior. Access restrictions were respected.
- 207 original media resources retained with byte counts and SHA-256 hashes in `21st-media.json`.
- `21st-candidate-catalog.json` contains 168 candidates. Production catalog, connected patches and live catalog remain unchanged.

## Validation

89/89 code tests, production build (3m24s) and 4/4 Sites packaging tests passed. New tests cover source retention, media hashes, original theme CSS and DOM controls, four actual prompt/archive samples and refusal to publish without browser evidence. These checks do not establish visual correctness, presented canvas frames, media decoding or every item's interaction and download behavior.

Browser startup, visible output, media, interactions, prompt and download need individual evidence for each candidate. `scripts/publish-21st-release.mjs` refuses absent/incomplete evidence and checks preview hashes. There is intentionally no `21st-browser-validation.json` yet.

No generation credits, new paid services, Stripe or charges were activated. Original code comments and notices retained; additional package notices are in `public/licenses/21st-release-dependencies.md`.

## Resume

Run from `Um-so/union-ui`, synchronizing `jorge` with `origin/jorge` first and preserving collaborator changes.

1. `node scripts/integrate-21st-releases.mjs` reconstructs source packages, compiles and restores production catalog inputs.
2. `node scripts/stage-21st-themes.mjs` builds isolated CSS demonstrations.
3. `python scripts/retain-21st-release-media.py` retains original public media.
4. `node scripts/build-preview-styles.mjs` rebuilds demonstration styles.
5. `node scripts/prepare-21st-candidates.mjs` assembles candidates from sources, original bundles and complete template captures.
6. Start `scripts/preview-audit-server.mjs` with `AUDIT_CATALOG_FILE=var/21st-audit-catalog.json` and an available audit port. Restart after changes; rows load at startup.
7. When authorized browser control is available, verify each candidate's actual startup, visible output, media and interaction, then prompt and download. Record evidence using the publisher schema. Resolve failures before accepting an item.
8. Publish accepted items through the guarded publisher; run relevant tests, build and catalog checks, then verify deployment before claiming completion.

`scripts/retain-21st-template-demos.mjs` can retry normal public static captures. Keep the eleven unresolved templates pending until their actual failures are resolved. Do not manufacture success or substitute unrelated examples.
