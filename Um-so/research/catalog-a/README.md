# Public catalog acquisition

`catalog-light.json` is the main app index; `catalog.json` additionally embeds each component's default source files. Both contain the same 620 component entries.

Source IDs: `aceternity`, `magic`, `reactbits`.

Relative `codeFile`, `additionalCodeFiles`, `variants[].codeFile`, `examples[].codeFile`, and `thumbnailLocal` values resolve against this directory. Each codeFile is a real registry-shaped JSON document with `files[].path`, `files[].type`, and `files[].content`. Default code and example source are separate. Retain full relative paths when copying to public app data.

- Magic UI: all 78 UI components plus 170 real example registry files; official repository `magicuidesign/magicui` and public registry snapshot.
- React Bits: all 419 named component groups, retaining all 1,274 JS/TS and CSS/Tailwind registry variants. Default prefers TypeScript + Tailwind. Also includes 218 real demo modules. Official repository `DavidHDev/react-bits`.
- Aceternity UI: all 123 public component docs linked in the source index. Public source included for 113 entries (exact registry names from rendered documentation plus visible documentation code); 182 real example blocks extracted without executing page scripts. Ten documentation entries contain no public source. Such records have `availability: documentation` and an empty `files` array; do not fabricate source.

332 real preview images are in `assets/`. Assets not observed in source inventories are not invented. Code/asset URLs retain upstream provenance.

`coverage.json` contains acquisition errors and explicit unavailable entries. `magic-license.md` and `reactbits-license.md` preserve licenses. React Bits is MIT + Commons Clause, not plain MIT; preserve its full license and attribution. Aceternity source was obtained only through public documentation/registry responses; no paid/private content or authentication bypass was accessed.

Snapshot acquired 2026-10-26. No API keys, account cookies, or private data were used.
