# Revocable collection sharing

Implemented routes: POST/DELETE `/api/collection-shares` for the verified owner, POST `/api/shared-collection` for capability lookup, GET `/api/sharing/config` for availability, and public exact SPA shell `/shared`. All other catalog/media/code authentication remains intact. A visitor sees only selected collection name/description and known catalog names/categories/component links. The protected previews themselves remain behind login; this is not the later public-preview catalog implementation.

A link uses 32 random bytes and stores only SHA-256. The raw token is in a URL fragment, not in server request paths or query logs; lookup sends it by same-origin POST. Successful/error responses are private/no-store. Token possession grants read access only, not owner identity or workspace/edit access. Creating another link rotates it; revocation deletes it. Account deletion cascades. Collection removal triggers permanent revocation even if an old snapshot restores the same collection ID. No arbitrary URL, source code, preview path, private email or other workspace collection is projected.

The UI warns the owner what will be shared before creating a link, waits for account synchronization and offers copy/open/revoke. Unprovisioned production databases report unavailable rather than presenting a successful fake link. Runtime availability comes from the actual RPC probe; no paid service or privileged backend key was introduced.

## Validation

PostgreSQL WASM test executes the actual migration and verifies anonymous table-list denial, cross-owner mutation denial, scoped RPC output, unknown token, rotation, collection removal/restoration and account cascade. Local API tests exercise actual sign-up/session/workspace, guest creation rejection, own collection resolution, public read-only output, method rejection, rotation and revocation. UI regression checks POST transport, escaped hostile strings, absence of edit controls and explicit revoked-link error. Source: [Supabase database function security](https://supabase.com/docs/guides/database/functions).

Authorized local browser created a real link, opened its two-item ordered collection, revoked it, reloaded and observed unavailable. A fresh link remained readable after signing out of the isolated local account; opening a protected component redirected to login. Screenshot evidence in ignored `var/glass-qa/shared-collection.png` and `shared-guest.png`. This is local evidence, not production acceptance.

## Production prerequisite

Apply `supabase/migrations/20261110_collection_shares.sql` to the existing `umso-accounts` project, after confirming its existing `workspaces` schema. The connected Supabase tool currently lists unrelated projects; do not apply this migration there. The user is opening the correct dashboard. The migration does not expose the workspace table. Verify the exact deployed app and two-user/anonymous revocation flow after migration. Until then, production sharing remains unavailable and is not marked complete.
