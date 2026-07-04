---
id: TASK-101-loading-error-states
title: Loading/error states for the chat panel
status: todo
priority: low
category: frontend
assignees: ["@paulo"]
epic: EPIC-010-chat-ui
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#viewer"]
estimate: null
depends_on: ["TASK-100-chat-panel"]
blocks: []
related: []
---

## Description
Pending indicator while waiting on the model; clear error on failure/throttling, reusing the existing showNotification() convention from write-mode.

## Acceptance Criteria
- [ ] a slow or failed request always shows a clear state, never a silently stuck UI

## Subtasks

## Notes
