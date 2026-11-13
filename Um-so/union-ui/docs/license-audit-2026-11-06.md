# Commercial redistribution screening — 2026-11-06

This is an engineering screening of the existing nitido research catalog, not per-file legal clearance. Source access, recovery authorization, compilation and a paid source subscription do not establish downstream distribution rights. License notices must be retained, but notices alone do not create permission.

## Findings

| Source | Local evidence (`public/licenses/` unless stated) | Official evidence | Commercial status |
| --- | --- | --- | --- |
| Magic UI | `catalog-a-magic-license.md` | [MIT](https://raw.githubusercontent.com/magicuidesign/magicui/main/LICENSE.md) | Candidate for individually verified OSS files, with holder and notices; no blanket clearance for paid tiers/media. |
| Kokonut UI | `catalog-b-kokonut-LICENSE.txt` | [MIT](https://raw.githubusercontent.com/kokonut-labs/kokonutui/main/LICENSE) | Candidate for verified repository code; review media, fonts and Pro separately. |
| Motion Primitives | `catalog-b-motion-LICENSE.txt` | [MIT](https://github.com/ibelick/motion-primitives/blob/main/LICENCE.md) | Candidate for verified OSS files, excluding unverified Pro content. |
| Tailark | `catalog-b-tailark-LICENSE.txt` | [MIT](https://raw.githubusercontent.com/tailark/blocks/main/LICENCE.md), [tier distinction](https://tailark.com/docs) | Candidate for verified OSS kits; not paid Quartz pages/illustrations without a compatible grant. |
| React Bits | `catalog-a-reactbits-license.md` | [License](https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md) | Block commercial redistribution and copied hosted tools pending specific permission. End-product use is not permission to distribute a component library, ports or export packs. |
| Animate UI/ports | `catalog-c-LICENSE-animate-ui.md`, `catalog-c-LICENSE-animate-vue.md` | [License](https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md) | Block component redistribution pending written permission; Commons Clause restricts resale/bundling. |
| shadcnblocks | `catalog-c-LICENSE-shadcnblocks.md` | [License](https://www.shadcnblocks.com/license), [terms](https://www.shadcnblocks.com/terms) | Block current commercial catalog/builder model. Directory exception is free, public without login, original links/registry and other restrictions; it does not cover nitido's authenticated mirror. |
| Aceternity | `ATTRIBUTIONS.md` links to source terms; no complete file-specific grant attached | [License](https://ui.aceternity.com/licence) | Uncleared. End-product rights are distinct from source/marketplace/template redistribution; do not assume free entries share a permissive grant. |
| 21st submissions/captures | `ATTRIBUTIONS.md`, `../research/connected-components/10466.json` (relative to app) has source/demo but no individual license | [Terms §§2–3](https://21st.dev/terms) | Uncleared captured previews/media/metadata and author code. Individual MIT code would not automatically cover the separately captured platform content. |
| Profitize recovery | `../research/profitize/README.md`, manifests/releases and `scripts/import-profitize.mjs` | Observed origin `https://profitize.com.br/build`; no redistribution grant located | Uncleared compiled runtimes, recorded references, images, fonts and embedded third-party material. User recovery authorization is not a supplier license. |

The acquisition inventory contains **95 Profitize-derived records**, including **16 merged into existing 21st IDs** and **79 recovered entries**. A filter only matching `sourceId === 'recovered'` misses the merged records. This inventory is not a count of production-ready or cleared products.

## Existing product limitations

- `src/component-export.js` and `src/builder-export.js` attach notices but do not provide an item-specific redistribution authorization gate. Prompts may expose source or compiled HTML; this must be included in a future permissions model.
- React Bits restrictions cover copied hosted tools as well as downloads. Disabling downloads alone does not clear those tools.
- Repository-level `MIT` labels do not prove that every mirrored media asset or author submission belongs to that license.
- This change preserves research and existing noncommercial development access; it does **not** certify the existing authenticated catalog for commercial distribution or rehosting.
- Public PT/EN marketing uses a newly authored demonstration, without exposing the recovered catalog or its previews.

## Required commercial scope decision

Default every resource to `review_required`. For each item, record original source URL, revision/hash, rights holder, exact grant and proof, assets/dependency grants and permission flags for display, hosted runtime, prompts, code copy, downloads and builder export. Review the actual deployed inventory, including aliases/merged recovery IDs. Exclude or replace restricted resources, or obtain express written permission covering the proposed use. Do not treat a routine paid end-product license as resale permission.

Paddle separately reviews the business model under its [Acceptable Use Policy](https://www.paddle.com/help/start/account-verification/what-am-i-not-allowed-to-sell-on-paddle) and [Master Services Agreement](https://www.paddle.com/legal/terms). Present the actual curated-library model and authorization evidence, rather than relabelling it as an unrelated SaaS. Sandbox operation does not constitute live approval.

`PADDLE_LICENSE_APPROVED=false` and `PADDLE_LIVE_APPROVED=false` are mandatory defaults. Neither flag should be changed until the reviewed deployed scope and provider approval justify it. No item-level clearance or third-party permission was obtained in this implementation.
