# Raio-X — delivery and operation

Implemented 2026-11-09 at `/tools/raio-x`, through the existing authenticated Tools flow. The original Profitize Pro workflow was exercised with example.com: completion, five-category report, SEO filtering and copy-all correction prompts. Its private backend was not recovered. nitido uses an independently authored analyzer/scoring/prompt engine and closely follows the observed dark/amethyst layout; this is not a claim of identical source, every original rule or pixel-identical output.

## Working flow

1. Submit a public HTTP(S) domain. `/api/site-audit/site` validates URL and DNS, pins one public IP for the socket while preserving hostname/TLS verification, independently checks each redirect, and reads inert HTML. It inspects robots/sitemap, at most three same-origin JavaScript files and the HTTP-to-HTTPS path. No caller cookies, credentials, arbitrary ports or target scripts are executed.
2. Render static evidence immediately. `/api/site-audit/lab` independently validates its URL/DNS and requests official Google PageSpeed Insights v5, mobile, performance/accessibility/SEO/best-practices, pt-BR. Only whitelisted diagnostics, metrics and a bounded raster screenshot are returned. The URL is sent to Google; the form discloses this before submission.
3. Show five categories, weighted overall score, severity-sorted findings, expandable evidence, individual/all correction prompts, filtering, JSON download, lab retry and cancellation. Speed stays unscored when unavailable; overall coverage is explicitly partial. Pixel absence is informational unless a concrete configuration is observed. Static consent/tracker checks never claim working events or legal compliance. Prompts are deterministic and need no AI service or paid generation.
4. Save the last twelve reports locally under account-specific keys, without screenshots. History can be cleared, is not cloud-synced and is not encrypted against another person using this browser. No analysis history, raw HTML or raw secret matches are stored on the server. Candidate secret patterns and sensitive resource query parameters are masked. Detection is limited and cannot certify absence of secrets.

## Bounds and deployment

- HTML 2 MB; resources 250 KB; each same-origin script 500 KB; three scripts; five redirects per request; 30,000 parsed nodes; 300 images; image/script URL length bounded.
- DNS deadline at most five seconds; socket deadline twelve seconds (probes five seconds); site stage twenty-five seconds. PageSpeed seventy seconds and lab stage seventy-five seconds. Browser total deadline 105 seconds. Cancel aborts the browser fetch; backend cancellation depends on request-signal propagation in the host and its own deadlines always bound work.
- Three concurrent analyses per Node process, twelve initial inspections/eight lab requests per authenticated user per hour, expiring bounded in-memory counters. These are **not distributed quotas** and reset on cold starts. Verify WAF/provider-wide limits before higher public traffic; account verification and existing CSRF/request bounds remain mandatory.
- Vercel `api/index.js` has a ninety-second maximum duration, following [Vercel's function duration configuration](https://vercel.com/docs/functions/configuring-functions/duration). No new paid service or billing activation was performed. Existing hosting execution usage still applies.
- Optional server-only `GOOGLE_PAGESPEED_API_KEY` uses an existing approved Google project with available quota. Never use a `VITE_` variable or commit the key. See [PageSpeed API](https://developers.google.com/speed/docs/insights/v5/get-started) and [runPagespeed](https://developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed). No key was provisioned or quota purchased in this task.

## Evidence

- Full `npm test`: **170 passed**, zero failures, including twelve Raio-X tests for SSRF, mixed DNS, address pinning, redirect pivots, transferred bytes/deadlines, inert parsing, redaction, Lighthouse normalization, quota/failure behavior, authenticated owner/origin boundaries, scoring and UI filter/copy/history/cancel behavior.
- `npm run build` passed; the final source changes were rebuilt with Vite using the already copied unchanged public directory. `npm run test:sites`: four passed. Existing worker and packaging inputs preserved.
- `npm audit --omit=dev`: zero known production dependency vulnerabilities at execution time.
- Authorized IAB, isolated local Better Auth account and SQLite (not customer accounts): real example.com inspection completed, Google quota error preserved a partial report, category filtering, expanded correction, individual/all clipboard contents and downloaded JSON verified. Desktop and 390×844 mobile were inspected, no horizontal overflow, no captured console errors. Evidence screenshots remain in ignored `var/raio-x-browser/desktop.png` and `mobile.png`; downloaded report in the user's Downloads. Tests do not establish every possible site's behavior.
- The original Profitize service successfully measured example.com; our direct Google call returned HTTP 429 without an API key. **Live successful Google metrics/screenshot retrieval remains unverified in nitido until an approved key with quota is configured.** Normalization/success UI is covered with structured fixtures and explicitly marked fictional demo data, not claimed as a live measurement.

## Remaining boundaries

This is an initial public-page audit. It does not execute target checkout/login, automatically repair a repository, validate ad conversions, certify LGPD compliance, enumerate all routes, or defeat target access restrictions. Blocked/non-HTML/TLS/timeout targets produce a clear error. Client-rendered sites may need a successful Lighthouse run and manual inspection to confirm static findings. A screenshot is displayed only when actually returned by Google. No made-up thumbnails or results replace it. Source skills and design systems remain deferred; this delivery does not claim their acquisition.

## Provider configuration follow-up — 2026-11-09

The operator supplied a PageSpeed key and authorized server-side use. It was saved through the authenticated Vercel dashboard as a **Secret**, production only, under `GOOGLE_PAGESPEED_API_KEY`; its value is not in the repository. A direct official API call with example.com returned HTTP 200, real Lighthouse category scores and a final screenshot. Subsequent calls returned Google HTTP 500/internalError, so the adapter now retries only HTTP 500/502/503/504 once, after 750 ms, sharing the original seventy-second deadline. Authentication/quota failures are not retried. Thirteen focused audit tests pass, including retry capacity, shared deadline and cancellation. Successful production UI measurement still requires verification after publication.

The first Vercel deployment of commit 122d372 passed its build and then failed while deploying outputs with an internal Vercel error. A production redeploy was initiated using the saved Secret. Do not equate successful compilation or direct provider tests with production availability; inspect the deployment and authenticated report before claiming completion.

## Static delivery repair — 2026-11-09

Authenticated Vercel CLI inspection identified the previously generic deployment failure as `IMMUTABLE_STATIC_HASH_MISMATCH`. Four recovered template bundles carry Next.js `static/immutable` addresses even though their loader URLs were adapted during recovery. The production packaging step now moves only the copied distribution of these four bundles into `static/recovered`, updating literal, escaped and encoded references. This avoids claiming the original globally immutable content addresses for adapted bundles; it does not disable platform integrity checks or authentication. Raw retained source and technical notices remain untouched in `public`/research.

`repackage-retained-static.mjs` runs after Vite and before the unchanged Sites packaging helper. All 265 copied files remain present, binary font/image bytes match retained originals, and fourteen reference files change in the distribution. The guarded/idempotent fixture verifies loader/CSS paths, media preservation and unchanged retained source. Full suite: 172 passed, zero failures; Sites packaging: four passed. The deployment result is the acceptance check for this suspected cause, not the compilation result alone.


## Reference criteria and visual revision — 2026-11-10

The previous deployment is confirmed READY at commit d69ef65b6 after distribution-only immutable-path repair. The production PageSpeed Secret remains server-side and production-only.

The scoring frontend captured from the authorized reference is now retained separately in `src/site-audit-reference-rules.js`, including technical provenance. Its 42 checks use category weights 25/20/20/15/20 and severity factors 1/.7/.35/0. The observed 77-point reference example reproduces every category score (61/94/75/84/76), including through our normalization adapter. This is a commercial landing-page profile: absence of Meta Pixel is penalized heavily. It is not a universal recommendation to track visitors; purpose, necessity and consent must be confirmed before applying tracking prompts. Legal statements and absence-of-secret claims are scoped rather than certified.

The backend is independently implemented, not recovered. It maps actual HTML, same-origin script fingerprints and official mobile Lighthouse audit nodes/network requests to the reference schema. A sharing-image request is bounded and checked for a raster content type. Unknown/failed probes remain limited evidence. Screenshots come only from validated Google raster data. An incomplete mobile run has no overall grade. The private reference backend, rendering timing and provider runs can differ; equal rules do not promise identical measurements on every run. Never force 76 to match a screenshot.

The original Eco Park test executed today returned 75 (speed 68, mobile 84, SEO 100, Pixel 15, privacy 97), versus the user's earlier 76/speed70. This directly illustrates provider variation. Production nitido comparison is recorded below after release validation.

The UI follows the supplied dark reference: luminous arc, left score ring and actual phone capture, five category cards, severity groups, visible individual copy actions and top-right History / Analyze again / Copy all. A full reanalysis refreshes both HTML and Google data. History is owner-scoped local storage, at most twelve reports, evicting oldest reports to target two million serialized characters; full raster capture remains attached. Storage failures are explicit. Older records without the current criteria stamp discard obsolete measurements and require reanalysis. Deleting history requires a second explicit click. JSON export includes measured evidence and correction prompts.

The global Apple-inspired system, supplied exact bitmap identity and icon-only color animation apply to the rest of the shell. Raio-X and brand colors are user-specified exceptions. No source demonstrations, private catalog permissions, payment settings or third-party subscriptions are changed.
