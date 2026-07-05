---
id: TASK-072-wire-graph-into-publish-pipeline
title: Wire graph builder into the publish pipeline
status: done
priority: medium
category: infra
assignees: ["@paulo"]
epic: EPIC-007-knowledge-graph-builder
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#graph", "#infra"]
estimate: null
depends_on: ["TASK-070-graph-schema-builder-script", "TASK-035-publish-pipeline"]
blocks: []
related: []
---

## Description
Extend the existing post-receive hook / validate-stories.mjs to (re)build graph.json on every push, same as index.json today.

## Acceptance Criteria
- [x] pushing a story with a new depends_on edge updates graph.json on the live server with no manual step

## Subtasks

## Notes
Added `node scripts/build-graph.mjs` as a second step in infra/hooks/post-receive, right after build-manifest.mjs. graph.json gitignored alongside index.json (both are build artifacts, not source of truth). The tracked infra/hooks/post-receive file is NOT auto-synced to the live server — the actual hook lives inside the bare repo at /data/git/repositories/paulo/agile-board.git/hooks/post-receive inside the gitea container (same gotcha noted in TASK-035). Updated it live via the same SSH access used throughout infra work; content verified byte-for-byte via `docker exec cat`. Will do a final end-to-end confirmation (push a story change, check graph.json appears in /srv/board) after this commit reaches Gitea.
