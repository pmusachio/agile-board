---
id: TASK-102-act-result-ui
title: Act result — proposed-change summary + PR link
status: done
priority: high
category: frontend
assignees: ["@paulo"]
epic: EPIC-010-chat-ui
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#viewer", "#gitea"]
estimate: null
depends_on: ["TASK-100-chat-panel", "TASK-123-branch-pr-creation"]
blocks: []
related: []
---

## Description
When the instruction was an act (not a question), render the plain-language change summary and a link to the opened PR (the interaction pattern approved in planning: "Done — opened PR #14: …"). When the backend refused to open one (validation gate, TASK-122), render the refusal reason instead.

## Acceptance Criteria
- [x] an act instruction shows the change summary and a working PR link; a refused instruction shows the reason and no PR link

## Subtasks

## Notes
Verified in a real browser preview with a stubbed backend response: a successful propose renders "Done — proposed: TASK-092, TASK-100" plus a working link to the stubbed PR url; a 422 validation refusal renders the top-level error plus the specific per-file validation detail, with no link.
