---
id: TASK-090-assistant-api-scaffold
title: Minimal API service scaffold
status: done
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-009-assistant-backend
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#backend", "#infra"]
estimate: null
depends_on: []
blocks: ["TASK-091-gitea-token-auth-guard"]
related: []
---

## Description
Small Node.js HTTP service (matches existing scripts/*.mjs tooling — no new language, per D10) with one endpoint (POST /api/ask); new Docker Compose service alongside gitea/caddy; new Caddy route.

## Acceptance Criteria
- [x] a request through Caddy reaches the service end-to-end

## Subtasks

## Notes
Infra already exists (EPIC-003) — this only adds one more Compose service and Caddy route to it.

**Deployed live 2026-07-05** (explicit go-ahead given): `https://agile-board.duckdns.org/api/health` returns `{"ok":true}` through the real Caddy route to the real `assistant-api` container. Two real bugs caught during deployment, both fixed: (1) `docker-compose.yml`'s Dockerfile path assumed the deployed directory is named `infra/` like the repo — it's actually `agile-board-infra/` on this VM, a pre-existing naming difference from initial provisioning; (2) a classic Docker single-file bind-mount gotcha — `tar` extraction replaces a file via a new inode, so `caddy reload` reported "config is unchanged" even though the host file was correct; fixed by force-recreating the Caddy container (`docker compose up -d --force-recreate caddy`) so the bind mount reattaches. Regression-checked: board and Gitea both still respond normally after the change.
