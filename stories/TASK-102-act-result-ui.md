---
id: TASK-102-act-result-ui
title: Act result — proposed-change summary + PR link
status: todo
priority: high
category: frontend
assignees: ["@paulo"]
epic: EPIC-010-chat-ui
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#viewer", "#gitea"]
estimate: null
depends_on: ["TASK-100-chat-panel", "TASK-123-branch-pr-creation"]
blocks: []
related: []
---

## Description
When the instruction was an act (not a question), render the plain-language change summary and a link to the opened PR (the interaction pattern approved in planning: "Done — opened PR #14: …"). When the backend refused to open one (validation gate, TASK-122), render the refusal reason instead.

## Acceptance Criteria
- [ ] an act instruction shows the change summary and a working PR link; a refused instruction shows the reason and no PR link

## Subtasks

## Notes
