# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Product decisions

- The user requested a new application merging 21st, Aceternity UI, Magic UI, React Bits, Kokonut UI, shadcnblocks, Motion Primitives, Tailark and Animate UI.
- The temporary visible identity is “Um só.” until the user supplies a final name. Present a single product: no library names, source logos, credits, authors or library filters in the product UI. Preserve original code and required notices in technical files.
- Every published catalog entry must open an automatic interactive preview. Do not present metadata-only references or unassembled components as working previews. Keep the complete acquisition inventory internally while implementing the remaining entries.
- React and Vue previews share the same catalog and controls. Preserve the actual framework in metadata, prompts and export filenames; Vue examples must remain .vue files. Use original executable demos and preserve scoped styles and local dependencies.
- Preserve global search, category filters, favorites, collections, comparison, working prompt copying and downloadable packages.
- Portuguese is the workspace interface language. Preserve original component names and code.
- The user intends to send additional improvements. Apply those as steering to this workspace rather than starting over.
- Catalog counts include variants, animated icons, helpers and references. Do not present all indexed entries as fully implemented independent components.
- Earlier browser checks verified the desktop/mobile catalog and Particles interactions. Browser control subsequently became disabled again. The user explicitly chose to continue code tests for now; do not ask again or bypass that setting. Record the exact scope in `design-qa.md`. DOM tests and successful builds are not visual verification of subsequent edits or every preview.
- On 2026-10-28 local browser access became available again and the local app opened successfully. Use the authorized IAB to verify the new tools and account flows, including desktop/mobile states. Do not use unrelated native windows or Chrome sessions.

- On 2026-10-28 the user cancelled Stripe work explicitly. Keep payment integration disabled, do not provision accounts/prices or request Stripe authorization. Continue the remaining app work with access open. Preserve the agreed prices internally for later.

- Preview covers must show the actual item: recover source images locally; where unavailable, use its own local executable preview, loaded near the viewport. Never substitute a generic category image or another item’s thumbnail.
- User explicitly enabled the Caveman skill for all further conversation: concise Portuguese, full technical accuracy. Keep documentation and code complete.
- The shared playground bridge customizes isolated demos without executing editor-supplied code. Preserve nested DOM nodes, original animation behavior when unedited, validated colors/text settings and parent-window message checks.
- `/builder` stores projects locally under `umso:pages:v1`; it does not claim account synchronization. Preserve JSON import/export, per-section isolation, history and desktop/mobile heights. Exported pages retain license notices. Do not describe compiled HTML sections as recovered editable React source.
- The source folders `research/catalog-c/animate-repo/packages/react/src` and `research/shared-registry/components/ui/table.tsx` are required for recompilation. Do not exclude them as disposable caches. Run `npm run test:interactions` when changing source resolution.
