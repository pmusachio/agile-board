---
id: TASK-132-wiki-caddy-route
title: Caddy /wiki/ route
status: in-progress
priority: high
category: infra
assignees: ["@paulo"]
epic: EPIC-013-wiki-os-fork-deploy
created: 2026-07-04
started: 2026-07-06
due: null
finished: null
tags: ["#wiki", "#infra"]
estimate: null
depends_on: ["TASK-131-wiki-compose-service"]
blocks: ["TASK-133-wiki-links-graph-verify", "TASK-150-board-wiki-link"]
related: []
---

## Description
Add a handle_path /wiki/* block serving the static Quartz output from /srv/wiki, mirroring the existing /git/* block in infra/Caddyfile — since Quartz emits clean URLs (no .html extension), the block needs a try_files rewrite, not just file_server on its own.

## Acceptance Criteria
- [ ] https://<domain>/wiki/ serves the wiki over HTTPS

## Subtasks

## Notes
Written: `handle_path /wiki/* { root * /srv/wiki; try_files {path} {path}.html {path}/index.html /404.html; file_server }` — the try_files recipe is Caddy's own documented pattern for exactly this ("serve clean URLs for a static site"), confirmed against Caddy's docs rather than assumed. Not yet deployed/verified against the real domain.
