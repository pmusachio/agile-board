---
id: TASK-131-wiki-compose-service
title: Compose service + WIKI_ROOT wiring
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
depends_on: ["TASK-130-fork-wiki-os", "TASK-033-compose-stack-gitea-caddy"]
blocks: ["TASK-132-wiki-caddy-route", "TASK-134-wiki-resource-check"]
related: []
---

## Description
Add the wiki-os fork as a Docker Compose service alongside gitea/caddy, with WIKI_ROOT pointing at the shared board-site volume (/srv/board, mounted read-only) — the same directory the publish hook already checks the corpus out into.

## Acceptance Criteria
- [ ] the service starts and indexes the live corpus; a story file shows up as a wiki page

## Subtasks

## Notes
