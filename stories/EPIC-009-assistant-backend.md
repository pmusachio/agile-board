---
id: EPIC-009-assistant-backend
title: Assistant backend service
status: todo
priority: high
category: backend
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#backend"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-008-context-assembly]]", "[[EPIC-010-chat-ui]]", "[[EPIC-003-infrastructure]]"]
---

## Description
The project's first backend: a small Node.js service that verifies a caller's Gitea token, assembles context, calls Gemini with a server-side-only API key, and returns the answer. Needed because an LLM API key can't safely live in browser JS the way Gitea's OAuth2 could (D10). Deployed as a new Docker Compose service on the same OCI VM, proxied by the existing Caddy instance.

## Acceptance Criteria
- [ ] TASK-090..093 complete

## Subtasks

## Notes
Auth reuses Gitea's own /api/v1/user check (same call the client already makes in write-mode) — no new auth system. Gated behind login per D8, so usage is attributable and rate-limitable from day one.
