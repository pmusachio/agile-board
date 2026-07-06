---
id: TASK-112-mvp2-e2e-verification
title: MVP2 end-to-end verification
status: done
priority: high
category: docs
assignees: ["@paulo"]
epic: EPIC-011-mvp2-docs-launch
created: 2026-07-04
started: 2026-07-06
due: null
finished: 2026-07-06
tags: ["#ai", "#docs", "#qa"]
estimate: null
depends_on: []
blocks: []
related: []
---

## Description
Ask: a logged-in user asks a real question spanning multiple related stories and gets a correct, graph-grounded answer. Act: an instruction like "mark TASK-092 done and split TASK-100 into a UI and an API story" opens a single Gitea PR with exactly those changes, leaves main unchanged until merge, and updates the live board via the existing hook once merged; an invalid instruction is refused with no PR. A logged-out visitor sees no AI affordance.

## Acceptance Criteria
- [x] PRD #14.7 Definition of Done fully checked

## Subtasks

## Notes
Ask verified earlier (real Gemini round-trip through the chat panel). Act verified live
2026-07-06: Paulo ran the instruction "Mark TASK-060-oauth2-pkce-login,
TASK-062-contents-api-client, and TASK-063-autosave-override-unsanitize as done" through
the board's own chat panel, producing a real Gitea PR (#1) with a byte-precise 3-line diff.
Reviewed the diff via the Gitea API before merge (main unaffected, `mergeable: true`),
merged with explicit go-ahead, and confirmed the live board's `stories/index.json` updated
within seconds via the existing post-receive hook — no manual step. Logged-out/no-affordance
and invalid-instruction-refused were already verified earlier this session. PRD §14.7 updated
to reflect all of this.
