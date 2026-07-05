---
id: TASK-090-assistant-api-scaffold
title: Minimal API service scaffold
status: in-progress
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-009-assistant-backend
created: 2026-07-04
started: 2026-07-05
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
- [ ] a request through Caddy reaches the service end-to-end (**not yet — needs the live deploy step below**)

## Subtasks

## Notes
Infra already exists (EPIC-003) — this only adds one more Compose service and Caddy route to it.

**Status as of 2026-07-05:** code complete and verified locally — assistant/server.mjs
(Node built-ins only, no npm deps), infra/assistant.Dockerfile, docker-compose.yml's new
assistant-api service (no host port, reachable only via Caddy, mounts board-site:/srv/board
read-only), and a new Caddyfile `/api/*` block (`handle`, not `handle_path` — this service's
own routes are literally `/api/ask` etc, unlike Gitea's path-agnostic API). Verified with a
local `node assistant/server.mjs`: /health responds; the whole request pipeline (auth →
rate-limit → corpus/graph load) works end-to-end over real HTTP.

**Not done: the actual live deploy.** Copying this new service onto the OCI VM and adding it
to the running Docker Compose stack is a real change to shared production infra (new
container, new Caddy route) — paused for Paulo's explicit go-ahead rather than assumed,
per the project's own OCI-boundary rule. See docs/RUNBOOK.md's new assistant-backend
section for the exact steps once approved. Everything up to that point is safe, reviewed,
committed code — nothing is lost by pausing here.
