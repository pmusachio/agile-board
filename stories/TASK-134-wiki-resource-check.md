---
id: TASK-134-wiki-resource-check
title: Resource-fit check on the VM
status: todo
priority: medium
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
blocks: []
related: []
---

## Description
Measure resource usage (memory during the build step, disk for node_modules + output) on the 1GB Always-Free VM (Gitea + Caddy + assistant-api, now also running the wiki's build step inside the gitea container on every push); if it doesn't fit, document/apply a lighter fallback.

## Acceptance Criteria
- [ ] the box runs all services stably, or the fallback is in place and documented

## Subtasks

## Notes
The VM is VM.Standard.E2.1.Micro (1 OCPU, ~1GB RAM + a 2GB swapfile). D14's pivot from
wiki-os to Quartz (see EPIC-013's notes) changes the shape of this risk: there's no
persistent Node/Fastify process or SQLite index competing for RAM at all times now, only
a build step (`npm ci` once, then `quartz build` on every push) that needs to complete
without OOM. Local build of the real 79-story corpus took under 1s and produced 116 small
static files — the real open question is `npm ci`'s one-time cost (485 packages, including
`sharp`'s native binary) inside the gitea container's Alpine/musl environment specifically,
which hasn't been tested yet. That's the first thing to check once deployed.
