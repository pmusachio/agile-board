---
id: TASK-132-wiki-caddy-route
title: Caddy /wiki/ route
status: done
priority: high
category: infra
assignees: ["@paulo"]
epic: EPIC-013-wiki-os-fork-deploy
created: 2026-07-04
started: 2026-07-06
due: null
finished: 2026-07-06
tags: ["#wiki", "#infra"]
estimate: null
depends_on: ["TASK-131-wiki-compose-service"]
blocks: ["TASK-133-wiki-links-graph-verify", "TASK-150-board-wiki-link"]
related: []
---

## Description
Add a handle_path /wiki/* block serving the static Quartz output from /srv/wiki/public, mirroring the existing /git/* block in infra/Caddyfile — since Quartz emits clean URLs (no .html extension), the block needs a try_files rewrite, not just file_server on its own.

## Acceptance Criteria
- [x] https://<domain>/wiki/ serves the wiki over HTTPS

## Subtasks

## Notes
**Live 2026-07-06:** `https://agile-board.duckdns.org/wiki/` returns 200 with the right
title; a story page (`/wiki/EPIC-009-assistant-backend`) resolves via try_files with no
`.html` in the URL, exactly as designed.

One change from the original plan: root is `/srv/wiki/public`, not `/srv/wiki` itself.
Quartz's build recreates its output directory (remove + recreate) as its first step, which
fails with `EACCES` on `/srv/wiki` directly — it's the wiki-site volume's mount root, and
Docker refuses to let anything inside a container rmdir a mount point regardless of file
ownership (confirmed directly: `rmdir /srv/wiki` as the owning user still says "Permission
denied"). Building into a subdirectory of the volume sidesteps it. The `try_files` recipe
itself needed no changes — confirmed correct against Caddy's own docs.
