---
id: TASK-034-gitea-init
title: Gitea init
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
depends_on: ["TASK-033-compose-stack-gitea-caddy"]
blocks: []
related: []
---

## Description
Create the Gitea admin user and the org/repo that will hold this project.

## Acceptance Criteria
- [x] can push to the repo over HTTPS/SSH

## Subtasks

## Notes
Skipped the web install wizard entirely: set GITEA__security__INSTALL_LOCK=true so Gitea boots straight into a ready SQLite instance, then created the admin user non-interactively via `gitea admin user create`. Repo created via the Gitea API rather than the UI. Admin credentials and a scoped push token were generated locally and saved to files on Paulo's machine — never printed in chat.
