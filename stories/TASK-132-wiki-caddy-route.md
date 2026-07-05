---
id: TASK-132-wiki-caddy-route
title: Caddy /wiki/ route
status: todo
priority: high
category: infra
assignees: ["@paulo"]
epic: EPIC-013-wiki-os-fork-deploy
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#wiki", "#infra"]
estimate: null
depends_on: ["TASK-131-wiki-compose-service"]
blocks: ["TASK-133-wiki-links-graph-verify", "TASK-150-board-wiki-link"]
related: []
---

## Description
Add a handle_path /wiki/* block reverse-proxying the wiki service, mirroring the existing /git/* block in infra/Caddyfile.

## Acceptance Criteria
- [ ] https://<domain>/wiki/ serves the wiki over HTTPS

## Subtasks

## Notes
