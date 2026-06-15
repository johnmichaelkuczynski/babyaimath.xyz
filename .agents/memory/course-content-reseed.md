---
name: Course content reseed (seeded data migrations)
description: How to make seeded reference-data changes self-heal across all DBs (incl. prod) instead of stranding old rows.
---

# Self-healing seeded course content

Course content (topics/lectures/assignments/problems) is **data rows** seeded by the API server on startup, not files. So changing the seed file does NOT update databases that already have rows — dev and prod keep the old content.

**Why prod is the hard case:** republishing migrates **schema, not data**, and agent `executeSql` against prod is **read-only**. The only thing that can replace stale prod *data* is the app's own startup seed logic. (Data replacement is not a schema migration, so it doesn't violate the "don't script prod schema migrations" rule.)

**Two-part gate that actually self-heals:**
- A **content marker** (known row's existence) alone is NOT enough: once the marker exists, later edits to the *same* content are never picked up.
- Add a **content version** stamped in a tiny `seed_meta` key/value table. Reseed when the marker is missing OR the stored version != the current `SEED_CONTENT_VERSION`. **Bump the version constant on every seed-content edit** or the change won't propagate.
- Do the wipe + full reseed + version-stamp in **one transaction**, so the marker/version only become visible after the whole curriculum commits (a mid-seed crash rolls back instead of stranding partial content).
- Reading `seed_meta` must tolerate the table not existing yet (treat as version-unset) so a boot that races schema migration still heals on the next boot.

**Tradeoff:** a version bump TRUNCATEs student-progress tables too. Acceptable for a single-user/self-paced course; reconsider if multi-user.

**Why:** seeded reference data that changes *meaning* (not just shape) silently rots in existing/prod DBs unless the reseed is gated on a version, not just emptiness or a marker.

**Curriculum-size coupling:** the number of topics/units is hardcoded in places beyond the seed — the system diagnostic asserts a minimum topic count, and the course overview route iterates a fixed week list and bounds `weekNumber` validation. When you change how many topics/units the curriculum has, update these in lockstep or the operator diagnostic false-fails and overview leaks phantom units.

**Schema drift silently defeats the reseed:** the wipe+reseed runs in one transaction, so if the live DB's `lectures`/etc. schema lags the code (e.g. missing `body_*_examples` columns the seed inserts), the INSERT throws, the whole tx (incl. the TRUNCATE) rolls back, and the OLD content keeps serving — the overview header (from route code) updates while the lectures (from DB) do not, which looks baffling. Fix: run `pnpm --filter @workspace/db run push` to sync schema, then restart so the reseed can commit. **When a content/version bump doesn't take effect, check api-server boot logs for a seed transaction error before assuming the marker/version logic is wrong.** Both the app and `drizzle.config.ts` read the same `DATABASE_URL`, so a push targets the same DB the app seeds.

**Domain-string scatter (subject conversions):** changing the course *subject* (e.g. data-analytics → evo-psych) is NOT just a seed edit. The subject name leaks into LLM prompt strings across every route (grading/tutor/practice/course/diagnostics/admin), the reasoning-instrument generator+feedback prompts in `reasoning.ts` (separate from the curriculum seed), AND frontend copy (index.html, Landing/Layout/App/Dashboard/Reasoning). Always grep the whole `api-server/src` + `qr-course/src` tree for the old subject before declaring a conversion done — the seed is the smallest part. Note: reasoning dilemmas are everyday-judgment scenarios, so keep their prompt framing domain-agnostic, not tied to the course subject.
