# Public source catalog coverage

Captured from the official public repositories on 2026-10-26.

| Source | Entries | Coverage |
| --- | ---: | --- |
| Kokonut UI | 107 | Every item in the official registry.json: 102 components, 4 hooks, 1 library helper. Includes published docs paths, descriptions, keywords, dependency manifests, original files, and first MDX Preview markup where available. |
| Motion Primitives | 33 | Every component in public/c/registry.json. Original core source and all examples referenced by each docs page's filePath attribute are retained. |
| Tailark | 470 | Every TSX source file under registry/bases, including Base UI and Radix alternatives, Dusk/Mist/Veil kits, blocks, pages, helper components and UI primitives. This is source-file coverage, not 470 independently advertised marketing blocks. |
| Total | 610 | All entries have source code. 478 have a demoCode field. 104 entries reference one of six original Tailark category preview assets. |

## Artifacts

- `catalog.json`: metadata with a `codePath` for each entry; 610 unique IDs.
- `code/{id}.json`: original `files` with full contents, `demoCode` when available, package/registry dependencies, license, and source URL.
- `assets/`: six original Tailark category previews, Kokonut logo/motion image, Motion Primitives light/dark product images. `thumbnailPath` points to these local artifacts where available.
- `licenses/`: exact MIT license notices for all three sources.
- `build_catalog.py`: reproducible metadata/source extraction from the cloned repositories. The final local asset materialization is reflected in catalog.json.
- `stats.json`: counts.

## Live preview details

`demoCode` differs from original component source:

- Kokonut: generated wrapper around the original first MDX `<Preview>` children and original import declarations. The wrapper is infrastructure; the displayed JSX is original. Some examples require installed package dependencies and shared UI components.
- Motion Primitives: exact first original TSX example from the docs; additional original examples remain in `files` with `type: "example"`.
- Tailark: exact original source when it has a default export. Direct internal import closure is included in `files`. These examples may use Next.js Link/Image; a local preview compiler must supply adapters. `previewUrl` for Tailark points to its homepage because its current public app no longer exposes the old source demo route shape.

For a generic runtime, do not claim these examples are already runnable without dependency resolution. The recorded `hasDemo` indicates available example code, not successful execution.

## Source provenance

- Kokonut: https://github.com/kokonut-labs/kokonutui, commit `d33a196aa574553b6c49f947ed6e510bfe1c06c3`.
- Motion Primitives: https://github.com/ibelick/motion-primitives, commit `120f64f6ca60348e251f929e9c81f11ccbe45eda`.
- Tailark: https://github.com/tailark/blocks, commit `8139698115c1341bfd2e3e286c04bb4d8146f472`.

## Availability limits

This catalog contains public open-source content. Private accounts, paid templates, commercial product backend, private assets and unpublished work were not accessed. Kokonut's public pro marketing images are not source templates and were not indexed as usable code. Tailark's published `oss-tailark.com` registry host did not resolve during capture; actual code is retained from its official repository and the installation command is recorded with this explicit availability warning.

Preserve the exact copyright/license notices when copying source into the final app.
