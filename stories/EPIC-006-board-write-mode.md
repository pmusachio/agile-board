---
id: EPIC-006-board-write-mode
title: MVP1.5 — write-enabled board (login, drag-and-drop, editing)
status: in-progress
priority: high
category: frontend
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: 2026-07-04
due: null
finished: null
tags: ["#viewer", "#gitea"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-002-board-viewer]]"]
---

## Description
After using the live MVP1 board day-to-day, read-only-plus-git-editing proved too limited: no drag-and-drop between columns, no way to add information to a card without a local git checkout. This epic adds a "Log in with Gitea" button (OAuth2 + PKCE, self-service accounts, no approval needed) and a real write-back path so logged-in users get drag-and-drop status changes and the full edit-task modal, persisting as real commits via Gitea's Contents API — on top of the unmodified read-only mode, not replacing it.

## Acceptance Criteria
- [ ] a freshly self-registered Gitea account can log in, drag a card, and edit a card, landing as real commits visible in Gitea and reflected on the public board
- [ ] anonymous read-only behavior is completely unchanged
- [ ] a save conflict (409) surfaces clearly instead of silently overwriting

## Subtasks
- [ ] TASK-060..064 complete

## Notes
Explicitly out of scope for this pass: creating/deleting stories from the UI, archive, column management, editing the graph-edge fields (depends_on/blocks/related/epic) via a form — those stay git/Gitea-web-editor only.
