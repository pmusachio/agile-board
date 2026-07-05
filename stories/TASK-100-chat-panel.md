---
id: TASK-100-chat-panel
title: Chat panel (logged-in only)
status: todo
priority: high
category: frontend
assignees: ["@paulo"]
epic: EPIC-010-chat-ui
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#viewer"]
estimate: null
depends_on: ["TASK-092-gemini-call"]
blocks: ["TASK-101-loading-error-states", "TASK-102-act-result-ui"]
related: []
---

## Description
New additive script board/scripts/22-assistant.js (next number after 21-write.js, same non-invasive layering — no vendored file touched). Panel/button gated on window.__agileBoardWriteMode (the same flag write-mode already sets); calls the new backend with the already-stored Gitea token.

## Acceptance Criteria
- [ ] logged in, a typed question returns a rendered answer; logged out, no chat affordance renders at all

## Subtasks

## Notes
