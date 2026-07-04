---
id: TASK-035-publish-pipeline
title: Publish pipeline
status: done
priority: high
category: infra
assignees: ["@paulo"]
epic: EPIC-003-infrastructure
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#infra", "#gitea"]
estimate: null
depends_on: ["TASK-011-manifest-generator", "TASK-034-gitea-init"]
blocks: []
related: []
---

## Description
A post-receive hook (or Gitea Actions) that checks out main into /srv/board and regenerates stories/index.json on every push; Caddy serves /srv/board as static files.

## Acceptance Criteria
- [x] a push updates the served board within seconds

## Subtasks

## Notes
This is the step that makes "push to git" == "board updates" true. Caught a real bug while installing this: a generic Python-template rule (`lib/`) in .gitignore was silently excluding scripts/lib/frontmatter.mjs from every commit, which broke build-manifest.mjs's import as soon as it ran on the actual server. Fixed in the same push that got the hook working.
