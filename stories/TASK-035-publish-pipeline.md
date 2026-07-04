---
id: TASK-035-publish-pipeline
title: Publish pipeline
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
depends_on: ["TASK-011-manifest-generator", "TASK-034-gitea-init"]
blocks: []
related: []
---

## Description
A post-receive hook (or Gitea Actions) that checks out main into /srv/board and regenerates stories/index.json on every push; Caddy serves /srv/board as static files.

## Acceptance Criteria
- [ ] a push updates the served board within seconds

## Subtasks

## Notes
This is the step that makes "push to git" == "board updates" true.
