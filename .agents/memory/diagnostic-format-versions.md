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
