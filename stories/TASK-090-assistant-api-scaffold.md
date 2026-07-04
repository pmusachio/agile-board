---
id: TASK-090-assistant-api-scaffold
title: Minimal API service scaffold
status: todo
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-009-assistant-backend
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#backend", "#infra"]
estimate: null
depends_on: []
blocks: ["TASK-091-gitea-token-auth-guard"]
related: []
---

## Description
Small Node.js HTTP service (matches existing scripts/*.mjs tooling — no new language, per D10) with one endpoint (POST /api/ask); new Docker Compose service alongside gitea/caddy; new Caddy route.

## Acceptance Criteria
- [ ] a request through Caddy reaches the service end-to-end

## Subtasks

## Notes
Infra already exists (EPIC-003) — this only adds one more Compose service and Caddy route to it.
