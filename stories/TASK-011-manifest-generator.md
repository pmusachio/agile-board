---
id: TASK-011-manifest-generator
title: Manifest generator
status: done
priority: high
category: data
assignees: ["@paulo"]
epic: EPIC-001-data-pipeline
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#data", "#tooling"]
estimate: null
depends_on: ["TASK-010-seed-stories"]
blocks: ["TASK-012-validation-check", "TASK-021-remote-read-only-load-mode", "TASK-035-publish-pipeline"]
related: []
---

## Description
A zero-dependency Node script that scans stories/*.md and emits stories/index.json — the lightweight manifest the board fetches to render cards.

## Acceptance Criteria
- [x] running it produces index.json listing all stories with cached metadata

## Subtasks

## Notes
scripts/build-manifest.mjs. Pure Node built-ins, no npm install required.
