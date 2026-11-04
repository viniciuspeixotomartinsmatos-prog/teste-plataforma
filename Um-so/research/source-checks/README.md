# Public source checks

Run `python scripts/check-source-updates.py` from `Um-so/union-ui`. The script also resolves its checkout paths when launched elsewhere. It performs read-only unauthenticated HTTP requests, compares public content routes with the integrated catalog, and writes dated evidence plus `latest.json`. Official registry metadata is compared with retained snapshots for Magic UI, React Bits, Kokonut and Motion Primitives. Tailark's public registry source files are compared using Git blob hashes.

This is discovery evidence, not executable preview verification. Unmatched routes include category pages, setup documentation, aliases and already integrated tools whose routes are stored outside the component catalog. Never import every unmatched route or report the route count as missing components. Registry metadata equality does not establish identical implementation code. Sitemap discovery does not fully cover new applications, icons, video features, paid releases or changes inside an existing component.

## 2026-11-04

The checkout was clean and synchronized with `origin/jorge`, at `789c6ab050b9ad0215e19234686ddccd6b89932e`. All ten sources were contacted. No application catalog entry was published by this check.

- **Profitize:** confirmed three actual new public landing-page records, not just unmatched route names: **Argila**, **Lavri** and **Skeleton**. Their metadata dates are 2026-11-04. Original poster and MP4 URLs returned HTTP 200. Six public media files were retained under `pending/profitize`; metadata and SHA-256 evidence are retained alongside them. Video decoding, playback, reconstructed prompts and portable download verification remain pending. No original account-only prompt was obtained.
- **Magic UI:** official registry contains one new component, **Dither Field**, and nine examples. These ten public JSON source bundles were retained under `pending/magic`. Executable preview assembly, source dependency resolution, interaction checks, prompts and exports remain pending.
- **21st:** sitemap exposed 10,176 matching component/theme/template routes. 1,330 routes do not match exact URLs in the current application catalog. This is a triage queue, not 1,330 verified new components. Themes, aliases and older omissions must be distinguished before acquisition. New app/icon/video functionality was observed on the public homepage but was not reconstructed or fully audited here.
- **Aceternity:** route candidates include interactions, templates, categories and installation documentation. Acquisition/access-tier classification and runtime validation remain pending.
- **React Bits:** registry metadata remains identical to the retained 1,274-item snapshot. Five unmatched tool URLs are known tool routes; the component-only catalog comparison does not establish that these are missing. Implementation changes and tool versions were not fully compared.
- **Kokonut:** registry metadata remains identical to the retained 107-item snapshot. Unmatched documentation routes need classification; this is not a verified release count.
- **shadcnblocks:** all 4,653 currently observed matching public sitemap routes match integrated catalog URLs. Existing implementation updates, private source availability and runtime health were not fully rechecked.
- **Motion Primitives:** sitemap returned HTTP 404. Official GitHub registry fallback succeeded, with 33 entries and identical retained metadata. The sitemap failure does not imply the library is unavailable.
- **Tailark:** all 470 public `registry/bases` TSX files match the retained source snapshot after normalizing line endings. Commercial content outside this repository was not audited. The sitemap did not expose matching content routes.
- **Animate UI:** candidate routes include icon setup documentation and a carousel primitive. Actual new source/runtime differences remain to be checked.

The authorized in-app browser was unavailable: `Browser is not available: iab`. The project instructions restrict verification to the authorized IAB and prohibit substituting unrelated Chrome sessions. Consequently, pending acquisitions were kept outside `public/` and were not advertised as working previews. No request to change browser settings was repeated.

The previously shipped nine Profitize additions are now deployed: Vercel reports deployment `dpl_GkXhScdL6nwvsQztgQHjvkrP1yZW` **Ready**, associated with commit `789c6ab`. The production alias serves coverage with `observed: 91`, `published: 91`; both new component HTML files and the release runtime return HTTP 200 with expected MIME types. This verifies publication and asset delivery, not a fresh visual production test. Prior local runtime validation remains documented in `profitize/releases/2026-11-03/browser-qa.json`.

Stripe and payments remain disabled. No credentials, authentication bypass, new services or new costs were used.

## Next execution

Synchronize Git first. Compare with `latest.json` and the pending manifest before downloading again. Assemble Dither Field and the three recorded-video references, then verify browser interaction/playback, prompts and downloads before publication. Continue classifying the other route candidates and checking actual source changes. Preserve old IDs, notice files, sandbox isolation and collaborator changes. A new dated check must not silently convert unresolved candidates into completed work.
