---
id: TASK-023-card-read-only-detail-view
title: Card + read-only detail view
status: done
priority: high
category: frontend
assignees: ["@paulo"]
epic: EPIC-002-board-viewer
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#viewer"]
estimate: null
depends_on: ["TASK-021-remote-read-only-load-mode", "TASK-022-frontmatter-parsing"]
blocks: []
related: []
---

## Description
Cards show id/title/assignees/priority/tags/due; clicking one lazy-loads and renders the story’s Description/Acceptance Criteria/Subtasks/Notes, with every write control (edit, archive, delete, drag, subtask toggles) stripped.

## Acceptance Criteria
- [x] clicking a card shows its rendered Markdown body; no write controls in remote mode

## Subtasks

## Notes
Acceptance Criteria and Subtasks checkboxes are merged into one checklist, since upstream’s modal only has one checklist slot with a progress bar. Verified locally by clicking a card: description/checklist/notes render, lazy-fetched on first open, and the modal shows Close only — no edit/archive/delete, no drag, no add-subtask row, checkboxes disabled.
