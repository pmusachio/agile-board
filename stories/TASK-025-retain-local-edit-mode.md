---
id: TASK-025-retain-local-edit-mode
title: Retain local edit mode (optional)
status: done
priority: low
category: frontend
assignees: ["@paulo"]
epic: EPIC-002-board-viewer
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#viewer", "#decision"]
estimate: null
depends_on: ["TASK-022-frontmatter-parsing"]
blocks: []
related: []
---

## Description
Decide whether to adapt upstream’s File System Access folder-picker editing to per-file stories, or defer it and go git-only for editing in MVP1.

## Acceptance Criteria
- [x] decision recorded

## Subtasks

## Notes
Original decision: deferred. Upstream's single-kanban.md local-edit mode was kept intact as a dormant fallback, not adapted to the per-file story model — MVP1 editing was git-only, per PRD D4.

**Superseded (PRD D6):** once the board was actually used day-to-day, read-only-plus-git proved too limited (see EPIC-006). Rather than adapt the dormant local-folder mode, it was removed entirely — real editing now happens through the browser itself (Gitea OAuth2 login, drag-and-drop, edit modal — TASK-060..064), and upstream's local-folder/File System Access files (03-storage.js, 04-io.js, 10-archive.js, 11-generate.js) were deleted outright. This product is web-only now; see NOTICE for exactly what was removed.
