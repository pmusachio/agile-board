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
Measure memory before/after on the 1GB Always-Free VM (Gitea + Caddy + assistant-api + wiki); if it doesn't fit, document/apply the lighter-mode fallback (pre-built assets / static export) per the PRD risk row.

## Acceptance Criteria
- [ ] the box runs all services stably, or the fallback is in place and documented

## Subtasks

## Notes
The VM is VM.Standard.E2.1.Micro (1 OCPU, ~1GB RAM + a 2GB swapfile). wiki-os adds a Node/Fastify process + SQLite index on top of an already-crowded box.
