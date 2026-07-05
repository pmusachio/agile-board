---
id: TASK-123-branch-pr-creation
title: Branch + PR creation via Gitea API
status: todo
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-012-ai-write-actions
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#backend", "#gitea"]
estimate: null
depends_on: ["TASK-122-pre-pr-validation-gate"]
blocks: ["TASK-124-guardrail-audit", "TASK-102-act-result-ui"]
related: ["[[TASK-062-contents-api-client]]"]
---

## Description
Create a branch, PUT each changed file to it (the same Contents API endpoints 21-write.js already uses), and open a PR whose body records the verbatim instruction plus a bulleted change summary. Authored with the logged-in user's token (D13); no new OAuth scope needed — write:repository already covers branches, contents, and pull requests.

## Acceptance Criteria
- [ ] a valid instruction yields a real Gitea PR containing exactly the intended changes; main is untouched until it's merged; merging fires the existing post-receive hook and updates the board

## Subtasks

## Notes
Merging is the only route to main — see TASK-124.
