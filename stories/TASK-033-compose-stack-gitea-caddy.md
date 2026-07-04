---
id: TASK-033-compose-stack-gitea-caddy
title: Compose stack: Gitea + Caddy
status: todo
priority: high
category: infra
assignees: ["@paulo"]
epic: EPIC-003-infrastructure
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#infra", "#gitea"]
estimate: null
depends_on: ["TASK-031-networking", "TASK-032-domain-dns"]
blocks: []
related: []
---

## Description
Docker Compose stack running Gitea and Caddy (automatic HTTPS via Let’s Encrypt) with persistent volumes.

## Acceptance Criteria
- [ ] Gitea UI reachable at https://<subdomain>/ with a valid certificate

## Subtasks

## Notes
infra/docker-compose.yml is written and ready; this task is the actual `docker compose up` on the VM.
