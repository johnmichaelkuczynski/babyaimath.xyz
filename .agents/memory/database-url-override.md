---
name: DATABASE_URL platform override
description: The app's DATABASE_URL resolves to a Replit platform DB and shadows any user-set DATABASE_URL secret.
---

# DATABASE_URL is platform-injected (shadows user secrets)

In this project `process.env.DATABASE_URL` resolves to host `helium`, db `heliumdb` — a Replit-platform-injected value. There is **no** `.env` or code that sets it.

- A user can add a `DATABASE_URL` *secret* (e.g. an external Neon URL), but the platform-injected `DATABASE_URL` **wins**, so the app keeps using `heliumdb`. The user's external URL is then unreadable from env/shell/sandbox because it's shadowed everywhere.
- `checkDatabase()` may report `provisioned: false` even though the app has a fully working database at `heliumdb` (the skill's provisioning check and the app's actual `DATABASE_URL` are not the same source of truth).
- The agent has **no tool to deprovision** the platform DB. Switching the app to a user's external DB requires the user to remove the platform database in the Database pane so their secret takes effect — it cannot be done agent-side.

**Why:** explains the confusing case where a user insists "use my external DATABASE_URL" but the app won't. **How to apply:** classify the live `DATABASE_URL` host (print host/dbname only, never the password) before assuming which DB is in use; don't trust `checkDatabase()` alone.

## Resolution + post-switch schema push
Once the user removes the platform DB in the Database pane, the secret takes effect and the app uses the external DB (confirmed live host `ep-...neon.tech`/`neondb`). Two follow-on gotchas:

- **Re-run the schema push against the NEW DB.** `pnpm --filter @workspace/db run push` targets whatever `DATABASE_URL` is in the shell. A push done while the OLD platform DB was active does NOT migrate the new external DB. Symptom: boot logs show `Seed failed … column "body_*_examples" of relation "lectures" does not exist` while `/api/course/overview` still returns correct content (old rows survive via base `body`/`body_medium`/`body_long` columns; the failing reseed transaction rolls back so the version stamp never commits → it retries every boot). Fix: run `push` again now that the shell `DATABASE_URL` points at the external DB, then restart. Healthy boot reads `Seed: course content present and current, skipping`.
- **Stale log files mislead.** `/tmp/logs/*api-server*` keeps pre-fix boots; always `refresh_all_logs` and read the newest file before concluding the DB is broken.
