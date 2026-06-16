---
name: Deleting an artifact
description: How to remove an artifact cleanly when there is no deleteArtifact callback.
---

There is no `deleteArtifact` callback. To remove an artifact, just delete its directory (`rm -rf artifacts/<slug>`).

**Why:** Artifact-managed workflows (named `artifacts/<slug>: <service>`) CANNOT be removed via `removeWorkflow` — it returns `PROHIBITED_ACTION` ("managed by an artifact"). The workflow + registry entry are auto-removed when the directory is deleted (the platform emits "Removed artifact: …").

**How to apply:** After `rm -rf` the dir(s): run `pnpm install` to refresh the lockfile (workspace globs pick up the removal), then scrub dangling references in README.md, BLUEPRINT.md, replit.md, and `.agents/agent_assets_metadata.toml` (asset entries point at the now-deleted files). Verify with a repo-wide grep for the old slug.
