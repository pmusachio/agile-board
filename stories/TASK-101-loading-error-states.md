---
id: TASK-101-loading-error-states
title: Loading/error states for the chat panel
status: done
priority: low
category: frontend
assignees: ["@paulo"]
epic: EPIC-010-chat-ui
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#viewer"]
estimate: null
depends_on: ["TASK-100-chat-panel"]
blocks: []
related: []
---

## Description
Pending indicator while waiting on the model; clear error on failure/throttling, reusing the existing showNotification() convention from write-mode.

## Acceptance Criteria
- [x] a slow or failed request always shows a clear state, never a silently stuck UI

## Subtasks

## Notes
Deliberate deviation from the original plan: rendered directly into the panel's own result area rather than the global showNotification() toast. A toast is right for board-level actions (drag/edit) that happen elsewhere on the page; the assistant panel already has a persistent, dedicated response area, and a transient toast would risk disappearing before a multi-line answer or validation error is read. Verified all states in a real browser preview: pending text while a request is in flight, plus distinct clear messages for 401/429/503/500/network-failure — none silently stuck.
