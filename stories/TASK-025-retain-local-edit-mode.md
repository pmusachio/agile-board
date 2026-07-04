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
Decision: deferred. Upstream’s original single-kanban.md local-edit mode is kept fully intact and untouched as a dormant fallback (it still works standalone if you open board/index.html with no stories/ folder present), but it was NOT adapted to the per-file story model. MVP1 editing is git-only, per PRD D4.
