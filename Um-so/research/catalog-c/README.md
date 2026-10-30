# Animate UI and shadcnblocks catalog research

This directory contains publicly accessible material observed on 2026-10-26 for the user's requested reconstruction. The user states ownership of these products. No authentication, API keys, paid gate bypass or private account access was used.

## Outputs

- `catalog.json`: unified source metadata. Each entry has its source, identity, title, category, original URL and installation reference.
- `code/<id>.json`: actual source file bundle, `{ "files": [{ "path": "...", "content": "..." }] }`. Metadata references this file through `codePath`, relative to the workspace root.
- `assets/`: copied original preview JPG assets where present in the official Animate UI repository; referenced through `localImagePath`.
- `summary.json`: counts by source and coverage.
- `errors.json`: requests that failed or source bundles unavailable without authentication.
- `build_catalog.py`: reproducible extraction script.

## Official sources

Animate UI: <https://animate-ui.com>, <https://github.com/imskyleen/animate-ui>. Registry metadata and source are from `apps/v2/registry`, with documented package primitives from `apps/v2/content/docs` and `packages/react/src` / `packages/vue/src`. React and Vue variants remain separate entries. Animated icons are tagged as `kind: icon`. Original preview assets come from `apps/v2/public/previews`.

shadcnblocks: <https://www.shadcnblocks.com/sitemap.xml>, public category listing pages (their embedded, publicly delivered Astro props), <https://www.shadcnblocks.com/blocks/free>, and the unauthenticated documented registry <https://www.shadcnblocks.com/r/{name}>. A second public source is <https://github.com/shadcnblocks/shadcn-ui-blocks>, the official free blocks repository.

## Coverage and provenance

Metadata marked `public-listing` comes directly from a source category page. Metadata marked `sitemap-only` has a source URL and slug, with a readable label derived from that slug; a missing source description remains empty. Metadata indexing is separate from source availability. `availability: local` means the file bundle exists locally; `availability: pro` indicates an observed non-free source access tier; `availability: external` means code was not retained locally. None of those flags claim that an iframe is embeddable or that a source is self-contained without its dependencies.

The catalog's `image` is a source/provenance URL, not proof that the image was downloaded. Use `localImagePath` when present, or deliberately download the image to the app's own assets before rendering it. Do not treat a screenshot as a live runnable component.

Both repositories currently carry MIT + Commons Clause conditions. Exact notices are retained as `LICENSE-animate-ui.md` and `LICENSE-shadcnblocks.md`. Preserve those notices in derivative work and account for their component redistribution restrictions before any publication; the user's ownership statement is recorded above.

