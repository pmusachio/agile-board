---
id: TASK-091-gitea-token-auth-guard
title: Gitea-token auth guard
status: todo
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-009-assistant-backend
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#backend", "#gitea"]
estimate: null
depends_on: ["TASK-090-assistant-api-scaffold"]
blocks: ["TASK-092-gemini-call"]
related: []
---

## Description
Verify the caller's bearer token against Gitea's /api/v1/user (same call 21-write.js's fetchUsername() already makes client-side) before doing anything else; reject missing/invalid tokens. No new auth system.

## Acceptance Criteria
- [ ] no/bad token is rejected; a real logged-in user's token is accepted

## Subtasks

## Notes
