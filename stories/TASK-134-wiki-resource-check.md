---
id: TASK-134-wiki-resource-check
title: Resource-fit check on the VM
status: done
priority: medium
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
blocks: []
related: []
---

## Description
Measure resource usage (memory during the build step, disk for node_modules + output) on the 1GB Always-Free VM (Gitea + Caddy + assistant-api, now also running the wiki's build step inside the gitea container on every push); if it doesn't fit, document/apply a lighter fallback.

## Acceptance Criteria
- [x] the box runs all services stably, or the fallback is in place and documented

## Subtasks

## Notes
**Measured live 2026-07-06**, before and after the real build: `free -h` stayed at
~450-530MB used / ~950MB total throughout (swap barely touched, 125-230MB of 2GB), `df -h /`
at 16% of 45GB. `npm ci` installed 446 packages in ~1 minute; the wiki build itself (79
stories → 116 static files) took ~16s, single-threaded on this VM's 1 vCPU. No fallback
needed — the box handles it comfortably. D14's pivot from wiki-os to Quartz (see EPIC-013's
notes) is why: no persistent Node/Fastify process or SQLite index ever competing for RAM,
just an occasional build step that finishes in seconds.
