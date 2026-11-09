# Security policy

## Scope and invariants

Production uses verified Supabase identities, ownership checks and database RLS. Missing production configuration must fail closed. Public account/marketing boot assets are an explicit exception; catalog media, demos, source packages, studios and user records require authentication. Local Better Auth/SQLite is for isolated development/testing, not an alternative production account provider.

Treat acquired demos as executable third-party content. Keep opaque preview sandboxes, frame/message validation, static-resource allowlists and required notices. A successful build, an iframe load event or a mounted canvas is not proof of a working preview. Dedicated compiled studios currently use same-origin frames; their larger trusted surface needs separate review before claiming exhaustive isolation.

Never expose service-role keys in browser config, use user-editable metadata for authorization, log passwords/session tokens/reset links, concatenate SQL input or accept foreign browser origins for mutations. Webhooks use their own bounded-body signature checks. Do not activate Stripe or other live billing during security work.

## Reporting and response

Private contact supplied by the owner: nitidocompany@gmail.com. Do not include passwords, full tokens, complete databases or personal documents. Report affected route/revision, minimal reproduction and redacted impact. Do not publish sensitive exploitation details before remediation. Mailbox receipt and responder ownership still need operational confirmation.

Proposed triage targets, pending owner approval: critical within 24 hours, high within 72 hours, moderate within 30 days, low within 90 days. These are internal targets, not a claim of an active on-call service. See `docs/security-operations.md` for incidents, notification, backups, retention and operator evidence.

## Changes and verification

Synchronize shared `jorge` before changes. Preserve collaborator work; no force push. Review source-to-sink boundaries and legitimate workflows, not just one sample URL. Run relevant security tests, the complete suite, dependency audit and build. New tests are automatically discovered by `npm test`. An optional manual GitHub workflow provides the same checks; it does not activate scheduled runner costs. Dependabot version updates target `jorge`; repository security-alert settings and default-branch monitoring must be confirmed by an administrator.

The scoped November 9 review covers application security controls, not every generated component, embedded studio bundle or provider configuration. Do not represent it as penetration-test certification, legal approval or proof of compliance for all 40 requirements. Track unresolved requirements explicitly in `docs/compliance-40.md`.
