---
id: EPIC-012-ai-write-actions
title: AI write actions (propose via Gitea PR)
status: todo
priority: high
category: backend
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#backend", "#gitea"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-009-assistant-backend]]", "[[EPIC-010-chat-ui]]", "[[EPIC-006-board-write-mode]]"]
---

## Description
The "control everything" core of MVP2 (PRD D11/D12): turn a natural-language instruction into an auditable Gitea pull request. Built on the EPIC-009 backend — the model chooses from a bounded, schema-aligned action toolset (never raw file bytes), the backend validates and applies each action via fetch-merge-write, then opens a branch + PR a human reviews and merges. Nothing reaches `main` without that merge, so "the AI controls the board" and "a person approved every change" are simultaneously true.

## Acceptance Criteria
- [ ] TASK-120..124 complete
- [ ] a valid instruction opens a single PR with exactly the intended changes; main is untouched until merge
- [ ] an invalid/impossible instruction is refused with a clear reason and no PR

## Subtasks

## Notes
This is the write path MVP3 was originally going to build for transcript ingestion; pulling it into MVP2 (D11) means MVP3 narrows to just the transcript → instructions front-end feeding this same pipeline. The fetch-merge-write discipline (TASK-121) is a direct carry-over of the MVP1.5 data-loss lesson: a writer that rebuilds a file from a partial view silently drops the rest.
