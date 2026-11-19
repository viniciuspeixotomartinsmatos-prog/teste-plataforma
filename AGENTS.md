# Shared project workflow

The user and a collaborator develop this project through GitHub. The canonical checkout is `C:/Users/jorge/OneDrive/Documentos/GitHub/teste-plataforma`; the application is in `Um-so/union-ui`, with research in `Um-so/research`. The shared branch is `jorge`, tracking `origin/jorge`.

## Synchronize before every new prompt

The user explicitly requires GitHub synchronization at the beginning of every new prompt concerning this project, before implementation. Inspect the current branch, worktree, index and remotes, then fetch `origin` and incorporate the latest `origin/jorge` changes. Read the applicable nested `AGENTS.md` after synchronization because the collaborator may have updated it.

Preserve all local and collaborator work. Use a fast-forward when possible. If the worktree is dirty or histories diverge, inspect and preserve those changes before integrating; do not blindly pull, discard edits, overwrite files, use a hard reset or force-push. Resolve conflicts only when the intended combined behavior is clear; otherwise explain the specific conflict and request the missing decision. If synchronization fails, report the failure rather than claiming the checkout is current.

After authorized project changes and appropriate verification, commit the relevant files, fetch again, incorporate any intervening collaborator updates, and push to `jorge` without rewriting shared history. Do not commit secrets, private runtime data or unrelated local work.

Stripe integration was explicitly cancelled. Keep payments disabled.
