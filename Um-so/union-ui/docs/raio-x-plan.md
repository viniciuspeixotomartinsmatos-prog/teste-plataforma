# Raio-X implementation plan — 2026-11-09

The user approved implementing the closest functional equivalent to the Profitize Raio-X after the original was exercised on example.com: complete score 77, five categories, severity groups, SEO filter and copy-all correction prompts. Public reference source and nine unrelated skills/design-system inventories are research only. This implementation focuses exclusively on Raio-X.

## Files and approach

- `server/site-audit-network.mjs`: public HTTP(S) address validation, DNS resolution and address pinning, independently validated redirects, bounded bytes, TLS verification and deadlines. No caller cookies/headers, private IP access or arbitrary ports.
- `server/site-audit-inspect.mjs`: inert HTML parsing and evidence extraction, bounded same-host script/robots/sitemap inspections, masked secret candidates, SEO/tracker/privacy findings. Never execute or obey target content.
- `server/site-audit-lab.mjs`: official mobile PageSpeed Insights request, category/audit normalization, metrics and safe screenshot extraction. An unavailable measurement stays unavailable; no fabricated score or fake screenshot.
- `src/site-audit-report.js`: original authored scoring, evidence-based findings and actionable correction prompts, with the same five reference categories and explicit coverage limitations.
- `server/site-audit-service.mjs`: authenticated, stateless initial and lab stages, concurrency and per-owner expiring quotas. No stored passwords, raw secret matches or browser cookies. Each stage validates the public URL again; no analysis handle or server-side job store is needed.
- `server/supabase-app.mjs`, `server/application.mjs`: authenticated endpoints for the existing production and isolated local account backends. No auth bypass or payment activation.
- `src/SiteAuditPage.jsx`, `src/site-audit.css`, `src/ToolsPage.jsx`: Tools entry and faithful dark/amethyst star-field hero, pill URL field, report ring/mobile screenshot, categories, severity/detail controls, copy-one/all, retry, cancel and local account-isolated history. Preserve nitido branding and surrounding navigation.
- `tests/site-audit*.test.mjs`: actual parser/scoring, SSRF/DNS/redirect, body/time bounds, API ownership and UI interactions. Verify desktop/mobile browser states, a real public target and PageSpeed success/failure. Run full suite, dependency audit, production build and packaging checks.

## Edge cases and honest boundaries

Reject credentials/query secrets in submitted URLs, localhost/private/IPv6-mapped IPs and redirect pivots; strip fragments. Classify TLS/HTTP/non-HTML/timeouts separately. Avoid treating missing HTML content in a client-rendered app as proof of missing runtime features. Tracker absence is informational when advertising is not required. Privacy checks are technical observations, not legal certification. Never expose secret candidates verbatim. Do not load untrusted HTML in the parent app.

PageSpeed metrics are external lab measurements and can vary; static HTML is not an executed mobile render. Partial results retain useful site evidence and offer retry for the lab stage. The optional server-side PageSpeed key is never sent to the browser or logs. No paid quota, new service or billing activation is authorized. History stays on this browser, separated by account and deletable from its history panel; cross-device synchronization is not claimed.

## Acceptance

Real site inspection returns concrete evidence and categorized findings; lab results use actual Google data or clearly disclose failure. Filter/copy/retry/history controls work. Pending work terminates or cancels. Anonymous requests are denied, every submitted target is validated and local history keys are account-specific. Desktop/mobile screenshots and browser interactions support visual claims. Commit and push only after relevant checks, incorporating collaborator updates without force.
