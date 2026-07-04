---
id: TASK-093-basic-abuse-guard
title: Basic abuse guard
status: todo
priority: medium
category: backend
assignees: ["@paulo"]
epic: EPIC-009-assistant-backend
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#backend"]
estimate: null
depends_on: ["TASK-092-gemini-call"]
blocks: []
related: []
---

## Description
Simple per-user rate limit (e.g. N requests/minute) — cheap now that every request carries a real identity (TASK-091).

## Acceptance Criteria
- [ ] rapid-fire requests from one account are throttled with a clear error, not silently billed forever

## Subtasks

## Notes
