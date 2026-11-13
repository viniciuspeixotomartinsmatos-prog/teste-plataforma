# Organized icon library — 2026-11-10

## Inventory and provenance

The authenticated `/icons` explorer has 29,416 upstream vector records, grouped into style/weight variants rather than counted as independent identical drawings. Seven families: Lucide 2,109; Tabler 6,305; Phosphor 9,161; Hugeicons 6,091; Remix 3,229; Heroicons 1,288; Material Line 1,233. The source JSON is retained in `../research/icons/2026-11-10`, with SHA-256s and original license texts. `scripts/import-icon-library.mjs` compiles safe structured SVG nodes. It rejects scripts, unknown element types, event handlers, remote hrefs/paint references and executable URLs. Runtime renders React SVG elements, without evaluating icon code or using arbitrary HTML injection.

The observed 21st page offered family/category browsing and SVG/React/Vue/React Native copy. Its copy action opened an account dialog. This implementation independently imports the same seven open upstream families; it does not claim a byte-identical gated 21st census, its authored prompts, or its private semantic backend. Integration prompts here are authored by nitido. The 38 semantic categories are derived from real names and do not imply original human/AI curation. User searches accept PT/EN concepts and common misspellings through a local lexical/intent fallback; no paid AI/embedding integration is simulated.

Existing 1,546 animated React icon components remain in the original catalog under `/?kind=icon&legacy=1`, with their existing code, demos and individual license notices. Do not apply the permissive SVG-family licenses to those independently licensed components.

## Function and export

Filter by family, meaning, animation and style. Groups expose real weight/size variants. The editor changes size/color, pauses/replays original SMIL animation, copies source or integration prompts and downloads a ZIP with original SVG, React, Vue, optional React Native, README and full original license. React/Vue exports scope SVG definition IDs per component instance. Browser SMIL animation is explicitly unsupported for React Native; the app never substitutes a falsely advertised native animation. Reduced motion pauses the original SVG at a visible frame.

## Delivery budget

Protected files still require a verified session. Vercel Function responses have a finite payload cap; original full-family JSON reached 8.6 MiB and would break there. Runtime now uses 234 chunks of up to 128 vectors, fetched only as visible results or selected variants need them. Largest chunk: 395,125 bytes. Compact metadata: 2,030,206 bytes. The importer and tests bound individual chunks to 2 MB and metadata to 3 MB, below the platform's documented 4.5 MB response cap. Full-family files are not published. [Platform limits](https://vercel.com/docs/functions/limitations).

## Validation scope

All 29,416 records resolve to bounded original vector geometry and safe structured nodes. Representative exports from all seven families compile as React/Vue, plus static native JSX; original body/path data and full licenses survive downloads. Authorized browser verified 96 actual nonempty SVG bounds spanning all seven families, Phosphor user duotone switching, keyboard size 48→52, and actual ZIP download with byte-matching original license and SVG body. Material Line animation pause/resume was read from the live SVG DOM; reduced motion paused at five seconds and disabled the brand color-wave animation. Desktop/mobile layouts and filter drawer were inspected. This does not claim manual visual inspection of every one of 29,416 drawings or a complete React Native application run.

Metadata and drawing requests have a twenty-second deadline, visible retry and progressive preservation of completed chunks. A stalled-request regression verifies that loading ends without fake drawings.

## Production acceptance

Commit `62d20a084` reached READY as `dpl_BrDzjWMQnet3oWYRK24iNAzBLJN9` and was checked at the public production alias with the authorized account. All seven families rendered in the initial grid. Phosphor people filtering returned 48 base drawings and 288 variants; user duotone displayed two actual paths. A production ZIP downloaded through the visible control; `LICENSE.txt` equals the upstream license byte for byte and the SVG contains the original body. Anonymous metadata/chunk GET, HEAD and Range requests returned 401 with private/no-store; the exact public hero artwork remained accessible.

Copied Vue source now embeds the full license as an HTML comment, independently of the ZIP's LICENSE.txt. Prompts state the actual export prerequisites: React 18+, Vue 3.5+ (`useId`), or React with react-native-svg; standalone SVG does not require those frameworks. Copy-prompt success is shown in the button. The local browser and focused tests verified that feedback; the shared production release is checked separately after push.
