---
name: Diagnostic answer-format versions
description: How the three selectable answer formats per diagnostic test relate to grading and progress.
---

Each diagnostic reasoning test is one logical `(instrument, phase)` group offered in THREE selectable answer formats (mcq | hybrid | written), seeded as separate assessment rows (2 instruments × 2 phases × 3 formats = 12 rows).

**Rule:** the formats are ALTERNATIVES, not extra required work. A student picks ONE format per group and takes it.

**Why:** treating each of the 12 rows as independently-required work inflates the diagnostics denominator — completing one format per group (the intended path) would otherwise read as 4/12 instead of full credit.

**How to apply:**
- Any gradebook / progress / callout aggregation over diagnostics MUST group by `(instrument, phase)` and treat any-format-pass as a group pass (expected 4 groups), never count per assessment row.
- The dashboard callout and gradebook reasoning rows are collapsed to one row per group and link to the chooser (`/reasoning`) so the student picks a format.
- No cheating/AI-authorship detection runs on diagnostics (intentional) — the keystroke trace from the shared AnswerInput is captured but ignored on this path.
- Per-format question content is NOT forced identical; the app generates fresh same-kind variant items per attempt, and the student only sees the one format they chose, so divergence across formats is never observed.

**Brevity mandate (audience = busy college students/professors):** keep written effort minimal or they abandon the test and score artificially low.
- Hybrid's written justification is OPTIONAL (graded on the chosen option); only the pure Written format requires text. Never block submit on a missing hybrid note.
- Prompts/instructions must invite a one-sentence answer; never over-structure ("give three examples, one about X, one about Y…").
- Written/hybrid grading judges the CORE idea only — short, fragmentary, ALL-CAPS answers must pass; never penalize length/form (gradeAnswer already enforces this).
- Diagnostic textareas use AnswerInput `compact` + `allowPaste` (no detection here, so pasting is fine).
- Seed instructions are part of the reseed signature, so wording changes self-heal on restart.

**Selectable length per attempt (on top of format):** before starting (and again on retake) the student picks Short / Medium / Long, mapping to question counts — critical {5,10,15}, ethical {3,6,10}. Critical medium == prior behavior; ethical was widened to 3/6/10 (user wanted "a few"→"a lot", 1/2/3 felt too small).
- `length` is an OPTIONAL field on the start request (default medium); count resolves server-side via `itemCountFor(instrument, length)`. `LENGTH_COUNTS` is duplicated client+server — keep them in lockstep if either changes.
- Detail GET returns a required `status` (not_started|in_progress|passed) the frontend keys off.
- **The length picker must be reachable for `in_progress` tests, not just `not_started`.** Auto-resume (no picker) ONLY for `passed` (loads review). For `in_progress` the picker shows a "Continue where I left off" shortcut (resume same items) PLUS length buttons that restart fresh.
  **Why:** an earlier version auto-resumed `in_progress` and silently skipped the picker, so any already-started test never offered the length choice (user hit exactly this on the one in-progress test and thought the feature was missing).
- **Restarting at a new length = `retake:true`, which DELETES the existing in_progress attempt (items first, then row) and creates a fresh one.** Plain (non-retake) start still resumes in_progress. Because a restart can momentarily leave >1 in_progress under a race, the submit handler targets the NEWEST attempt (order DESC), never the oldest, so grading matches the item IDs actually shown.

- **Short/Medium/Long MUST render as visible, clickable buttons directly on the Diagnostics LIST page (`/reasoning`), one set per format — not hidden behind a "Begin" that opens a length picker later.** Each length button deep-links `/reasoning/:id?length=<len>`; the runner reads it (wouter `useSearch`), auto-starts once (useRef guard, reset per `:id`), then strips the query via `setLocation(path,{replace:true})` so refresh resumes. The in-runner picker stays only as the no-param fallback (resume/review).
  **Why:** the user asked ≥5× "WHERE is short/medium/long?" Two wrong attempts failed: (1) tiny buttons that auto-started felt like landing straight in a test; (2) format-only buttons + a hint, with length moved entirely into the runner — the user screenshotted the list and said the option still wasn't there. The choice is only "found" when the three length buttons are physically on the list page next to each format. Do NOT bury length behind a click.
