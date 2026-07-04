---
id: TASK-040-remotes-mirror
title: Remotes + mirror
status: done
priority: medium
category: process
assignees: ["@paulo"]
epic: EPIC-004-git-workflow
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#git", "#github"]
estimate: null
depends_on: ["TASK-034-gitea-init"]
blocks: []
related: []
---

## Description
Configure Gitea’s push-mirror to GitHub so one push updates both remotes, or document a manual dual-remote workflow if that’s not practical.

## Acceptance Criteria
- [x] a push to Gitea appears on GitHub with full history

## Subtasks

## Notes
First attempt failed silently (mirror saved without the GitHub username/token actually attached — `could not read Username for 'https://github.com'`). Paulo removed and recreated it with both credential fields filled in; this story's own status update is the live test proving it now syncs automatically on push, with no manual push to GitHub needed.

