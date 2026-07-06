---
id: EPIC-012-ai-write-actions
title: AI write actions (propose via Gitea PR)
status: done
priority: high
category: backend
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-06
tags: ["#ai", "#backend", "#gitea"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-009-assistant-backend]]", "[[EPIC-010-chat-ui]]", "[[EPIC-006-board-write-mode]]"]
---

## Description
The "control everything" core of MVP2 (PRD D11/D12): turn a natural-language instruction into an auditable Gitea pull request. Built on the EPIC-009 backend — the model chooses from a bounded, schema-aligned action toolset (never raw file bytes), the backend validates and applies each action via fetch-merge-write, then opens a branch + PR a human reviews and merges. Nothing reaches `main` without that merge, so "the AI controls the board" and "a person approved every change" are simultaneously true.

## Acceptance Criteria
- [x] TASK-120..124 complete (all 5, including TASK-123's live run — see its notes)
- [x] a valid instruction opens a single PR with exactly the intended changes; main is untouched until merge (**verified live 2026-07-06, PR #1**)
- [x] an invalid/impossible instruction is refused with a clear reason and no PR (verified: the pre-PR validation gate correctly refuses before any PR would open)

## Subtasks

## Notes
This is the write path MVP3 was originally going to build for transcript ingestion; pulling it into MVP2 (D11) means MVP3 narrows to just the transcript → instructions front-end feeding this same pipeline. The fetch-merge-write discipline (TASK-121) is a direct carry-over of the MVP1.5 data-loss lesson: a writer that rebuilds a file from a partial view silently drops the rest.

**Genuinely done as of 2026-07-06.** The full pipeline was exercised for real through the
board's own 🤖 Assistant panel: the instruction "Mark TASK-060-oauth2-pkce-login,
TASK-062-contents-api-client, and TASK-063-autosave-override-unsanitize as done" produced
[PR #1](https://agile-board.duckdns.org/git/paulo/agile-board/pulls/1) with a 3-file,
3-line diff — exactly and only the `status:` field in each story, nothing else touched.
`main` stayed unchanged until Paulo reviewed and merge was authorized; merging fired the
existing post-receive hook and the live board's `stories/index.json` reflected all three
as `done` within seconds, no manual step. This is the same dogfooding trick used to close
out the three stale MVP1.5 statuses it names — one live test did double duty.
