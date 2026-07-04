---
id: TASK-072-wire-graph-into-publish-pipeline
title: Wire graph builder into the publish pipeline
status: todo
priority: medium
category: infra
assignees: ["@paulo"]
epic: EPIC-007-knowledge-graph-builder
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#graph", "#infra"]
estimate: null
depends_on: ["TASK-070-graph-schema-builder-script", "TASK-035-publish-pipeline"]
blocks: []
related: []
---

## Description
Extend the existing post-receive hook / validate-stories.mjs to (re)build graph.json on every push, same as index.json today.

## Acceptance Criteria
- [ ] pushing a story with a new depends_on edge updates graph.json on the live server with no manual step

## Subtasks

## Notes
