# 🔎 Functional Intelligence

**A rigorous, self-paced introduction to how reasoning and aptitude tests work — and how to beat them — that teaches, tutors, drills, and grades itself, built for researchers and professionals entering the field.**

Functional Intelligence is a self-paced, single-user web course on the skills behind reasoning and aptitude tests — taught, tutored, drilled, and graded entirely by AI, with built-in academic-integrity enforcement. A complete one-unit curriculum builds the subject from first principles, one idea at a time: how every pattern grid, series, analogy, odd-one-out, and spatial puzzle is really a hunt for a hidden rule, and how disciplined method — not raw talent — turns that hunt into a score.

---

## ✨ Features

- **One unit, 6 topics** — a complete syllabus: pattern grids (finding the rule that fills the blank) · number and letter series (spotting what comes next) · analogies (how A-to-B locks onto C-to-what) · odd-one-out (what doesn't belong, and why) · spatial reasoning (rotating, folding, and seeing it in your head) · test-craft (timing, elimination, and smart guessing — the capstone).
- **Three-depth lessons** — every lesson reads at **Short / Medium / Long** length, AI-rewritten while keeping the same examples and learning objectives.
- **Section-scoped AI tutor** — ask about the exact paragraph you're reading; answers stream back token-by-token, grounded in that lecture section.
- **Adaptive practice** — generated problem sets that get harder on a streak and ease off after a miss; per-session difficulty persists. Every question asks you to reason about a concrete puzzle or test-taking scenario, not to recite.
- **AI-graded assignments** — two homework sets, a timed unit test, and a cumulative final, each scored for semantic equivalence with a written rationale and a rolled-up percent score.
- **Two-layer AI-authorship detection** — every submission is screened by a static text classifier (GPTZero) **and** a diachronic keystroke-pattern detector, each with a human-readable verdict.
- **Diagnostic reasoning checks** — two ungraded instruments (Functional Intelligence subject reasoning and General Reasoning), each offered in three formats and three lengths, at four points in the journey (before, one-third, two-thirds, and after the course). They are unlimited practice with fresh questions every attempt and never affect the grade (coursework is 100%).
- **Live analytics** — dashboard KPIs (attempts, accuracy, streak), per-topic mastery, and a recent-activity feed.
- **Operator diagnostics** — one-click self-tests that verify the entire stack (database, OpenAI, GPTZero, detection, and the practice/grade loop) before you trust a session.

---

## 🏗️ Architecture

This is a [pnpm](https://pnpm.io/) workspace monorepo. The course runs as several artifacts plus shared libraries:

```
artifacts/
  qr-course/        # React + Vite frontend (the student app)
  api-server/       # Express API: lessons, tutor, practice, grading, detection, diagnostics
lib/
  db/               # Drizzle ORM schema + Postgres connection
  api-spec/         # OpenAPI contract → generated React Query hooks + Zod validators
```

**Contract-first:** a single OpenAPI document is the source of truth. React Query hooks (client) and Zod validators (server) are generated from it, so request/response shapes can't drift.

**Tech stack:** React, Vite, TypeScript, Tailwind, Express, Drizzle ORM, PostgreSQL, Clerk (auth), OpenAI (tutoring/grading), GPTZero (AI detection), Framer Motion (video).

---

## 🔑 Configuration

The app reads the following secrets/environment variables (managed in the Replit **Secrets** pane):

| Key | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (e.g. a Neon database) |
| `OPENAI_API_KEY` | OpenAI key for the tutor, practice generation, and grading |
| `OPENAI_BASE_URL` | OpenAI-compatible base URL |
| `GPTZERO_API_KEY` | GPTZero key for static AI-authorship detection |
| `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` | Clerk authentication (server + client) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key exposed to the frontend |
| `SESSION_SECRET` | Server session signing |

---

## 🚀 Running

The app runs through Replit **workflows** (not `pnpm dev` at the root). Each artifact has its own workflow that supplies the `PORT` and base-path it needs.

Typical local checks:

```bash
# Typecheck a package
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/qr-course run typecheck

# Apply the database schema (Drizzle)
pnpm --filter @workspace/db run push

# Regenerate API hooks/validators from the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

The API server seeds the course content on startup and self-heals when the content version changes, so a fresh database is populated automatically once `DATABASE_URL` and the schema are in place.

### Authentication

Sign-in uses **Clerk** with email/password and social SSO (including **Sign in with Google**). Social providers are toggled from the workspace **Auth** pane — enabling Google there makes it appear on the sign-in screen automatically; no code change is required. For a branded Google consent screen in production, add your own Google OAuth Client ID/Secret in the Auth pane.

---

## 🩺 Diagnostics

Open the **Diagnostics** page in the app (or hit the API directly) to run:

- **System diagnostic** (`GET /api/diagnostics/system`) — environment, database round-trip, course-seed integrity, OpenAI chat + JSON mode, the detection pipeline, an AI-positive control sample, and GPTZero connectivity.
- **Synthetic-student diagnostic** (`POST /api/diagnostics/synthetic-run`) — spins up a fake student, runs a practice session, takes and submits a full assignment, and verifies grading + detection + analytics all reflect the run.

---

## 📚 Who it's for

- **Researchers & professionals entering the field** — a complete, rigorous grounding in how reasoning and aptitude tests work, with on-demand tutoring and adaptive practice.
- **Instructors & curriculum designers** — a working reference for AI-taught, AI-graded, AI-detection-screened coursework.
- **Academic-integrity researchers** — a live testbed for layered AI-authorship detection (text classification + keystroke behavior).
- **Product & engineering teams** — a reference implementation of contract-first full-stack architecture, streaming AI UX, and self-diagnostic tooling.

---

*Functional Intelligence — where the curriculum, the tutor, the grader, and the integrity check all live in one room.*
