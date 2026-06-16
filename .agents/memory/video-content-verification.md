---
name: Verifying multi-scene video content
description: How to confirm a video-js artifact actually shows real product content across all scenes
---

The `screenshot` tool reloads the iframe on every call, so it always restarts a looping video-js artifact at scene 0 — you cannot catch later scenes by spacing screenshots apart.

**To verify a multi-scene walkthrough actually renders the intended content, grep the scene files** (`src/components/video/video_scenes/Scene*.tsx`) for the real copy/labels that each scene must contain, rather than relying on screenshots.

**Why:** This project's user repeatedly rejected videos that were abstract title cards "showing nothing about the course." A walkthrough must demonstrably contain the real app screens (sidebar nav, dashboard KPIs, the 8 topic titles, depth toggle, streaming tutor, AI grading + detection chip, analytics mastery). Grepping for those exact strings is the reliable proof; one screenshot only ever shows the intro.

**How to apply:** After a video-js build, run the recording validation (`scripts/validate-recording.sh`) AND grep the scenes for required content strings. Note the typecheck on fresh video-js scaffolds fails on pre-existing framer-motion typings + missing DOM lib in read-only scaffold files (hooks.ts, animations.ts, main.tsx) — this does not block the Vite runtime or export, and the skill says typecheck is not part of the first-build gate.
