---
id: EPIC-010-chat-ui
title: Chat UI in the board
status: todo
priority: medium
category: frontend
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#viewer"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-009-assistant-backend]]", "[[EPIC-006-board-write-mode]]"]
---

## Description
A chat panel layered on top of the board the same non-invasive way write-mode was (`board/scripts/22-assistant.js`, no vendored file touched), visible only to logged-in users, calling the new assistant backend with the already-stored Gitea token.

## Acceptance Criteria
- [ ] TASK-100..101 complete

## Subtasks

## Notes
Reuses `window.__agileBoardWriteMode` as the visibility gate — the same flag EPIC-006 already introduced, so a logged-out visitor sees nothing new at all.
