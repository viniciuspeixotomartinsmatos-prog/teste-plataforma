# Paddle international subscriptions

## Implemented scope

Paddle replaces Kiwify as the intended future billing provider. Existing Stripe provisioning is cancelled and must not be run. Billing stays disabled by default. There are no invented live IDs, provider credentials, foreign prices or paid users.

After Kiwify's definitive refusal on 2026-11-09, the chosen model is to manage subscriptions and access in nitido and outsource checkout to Paddle. The customer manages their subscription from `/plans` via the Paddle portal. The operator manages charges, refunds and renewals in Paddle while Supabase enforces account access. Asaas remains a possible BRL-only integration if the business later prioritizes local billing. A gateway does not settle the outstanding content permissions.

- Public pre-rendered home, contact, terms, privacy and cancellation/refund pages: `/pt/` and `/en/`.
- Public demonstration is original nitido code independent of restricted source catalogs. Marketing pages are `noindex,follow` while commercial scope is unresolved; the staging sitemap deliberately contains no URLs.
- `/plans?lang=pt-BR` and `/plans?lang=en` show total amounts by billing period. Authentication and billing pages support PT/EN; the existing catalog interface is still primarily Portuguese and original item names/code are preserved.
- Supabase login remains mandatory for catalog, preview, code, tools and builder access. Production middleware enforces paid access only when Paddle is fully enabled. Disabled billing preserves the prior authenticated development access.
- Authenticated server-side checkout binds user/customer/transaction. Webhooks verify the raw body and signature, retrieve provider records and apply an atomic PostgreSQL ledger. Checkout UI completion never grants access by itself.
- Renewals, cancellation, paid-through access, past-due paid periods, refunds and chargeback warnings have explicit behavior. Every approved refund, including partial refunds, conservatively revokes access. Reversals require trusted manual reconciliation; they do not automatically reactivate access.

## Local checks

Use Node **24.x**. Node20 cannot execute the existing `node:sqlite` authentication tests or current JSDOM dependencies.

```powershell
npm run test:billing
npm test
npm run test:sites
npm run build
npm run billing:paddle:setup -- --dry-run
```

`tests/paddle-database.test.mjs` executes the migration against isolated PostgreSQL WASM when `PADDLE_TEST_PGLITE_MODULE` points to an installed `@electric-sql/pglite` ESM entry. It never targets production. Without that optional module it reports a skipped test, not a database validation success. The implementation session used PGlite 0.5.15 outside the repository and executed the SQL/RLS tests.

## External setup, in order

1. Create/sign into the official [Sandbox account](https://sandbox-login.paddle.com/signup). The owner must enter credentials and accept contractual terms. Production account verification, identity documents and payout configuration are owner actions.
2. Apply `supabase/migrations/20261106_paddle_billing.sql` to a dedicated Supabase test project first. It creates customer bindings, checkout reservations, subscription history and event-ledger records, with RLS and service-role-only mutation RPCs. Read and execute the complete migration; do not cherry-pick individual functions.
3. In private server environment variables, set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PADDLE_ENV=sandbox` and the sandbox `PADDLE_API_KEY`. Do not prefix secrets with `VITE_` or commit/export them into client bundles.
4. Review `npm run billing:paddle:setup -- --dry-run`. Run `--apply` only against sandbox after the account exists. The script reuses product/price records with exact app markers and rejects conflicting catalog records; ambiguous network failures require reviewing the dashboard before retrying. It never provisions live products.
5. Set `PADDLE_PRODUCT_ID` and the three emitted price IDs. Prices must be active, trial-free, without price overrides and match the exact approved values: BRL 8500 cents/month x1, 16500/month x3, 55000/month x12. These are full-period totals, not installments.
6. Create a **sandbox client-side token** and a notification destination at `APP_ORIGIN/api/billing/webhook`; store its signing secret in `PADDLE_WEBHOOK_SECRET`. Subscribe to transaction completion, relevant subscription lifecycle changes and adjustment events supported by `server/paddle-billing.mjs`. Set default payment link to `/billing`. The destination is an exact public webhook route; it does not accept browser credentials as event proof.
7. Set `PADDLE_CLIENT_TOKEN` and `PADDLE_BILLING_ENABLED=true` in the test deployment only. Keep `BILLING_ENABLED=false` (legacy Stripe). Complete test checkout, duplicate delivery, renewal, cancellation, expiry, refund and account-isolation scenarios. Confirm actual database access and failure paths, not just a checkout modal or success page.
8. Choose foreign prices commercially. `PADDLE_REGIONAL_PRICES_JSON` accepts an array of `{planId,currency,amount,priceId}` for `monthly`, `quarterly`, `yearly` and `USD`/`EUR`. Amounts are integer minor units. Add distinct verified provider prices; do not use dashboard currency overrides. Until configured, only approved BRL totals are offered, including to international customers. The display must match checkout currency and period.
9. Verify that `acesso@nitidohig.com.br` receives inbound support messages. It was selected by the user, but previous outbound transactional verification does not prove a receiving mailbox. Confirm seller identity and review PT/EN terms, privacy, refund policy and the real commercial feature scope before live sales. No new DNS/MX changes were made.
10. Resolve every [license blocker](license-audit-2026-11-06.md), present the exact offering to Paddle and obtain approval. Only then configure separate live credentials/IDs, approve deployed scope, set both approval flags and complete controlled live verification. Sandbox and live IDs/data never mix.

## Operational behavior

- `/api/billing/config`: public, sanitized configuration; no private keys, provider price IDs or customer data.
- `/api/billing/checkout`: authenticated same-origin POST `{planId,locale,currency?}`. The server selects amount/price and returns a bound `transactionId` for Paddle.js.
- `/api/billing/portal`: authenticated same-origin POST `{}`. Uses only the stored current user's customer ID.
- `/api/billing/subscription`: authenticated GET, exposes only the current user's sanitized subscription.
- `/api/billing/webhook`: exact public POST, maximum 256 KiB, timestamp-checked HMAC over raw bytes. Retries must receive the existing ledger result without duplicate entitlement changes. A failed DB write remains retryable rather than being acknowledged as processed.
- Retain historical subscriptions and isolate their late events from current paid access. New subscriptions cannot replace a current prepaid subscription. Ambiguous checkout creation fails closed and requires trusted reconciliation rather than risking a second payable subscription.

Provider references: [checkout](https://developer.paddle.com/build/checkout/build-overlay-checkout/), [webhook signatures](https://developer.paddle.com/webhooks/signature-verification/), [currencies](https://developer.paddle.com/concepts/sell/supported-currencies/). Charging currency, balance currency and payout currency are different; eligibility and payout configuration must be checked in the actual account.
