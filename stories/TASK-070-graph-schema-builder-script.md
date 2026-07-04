---
id: TASK-070-graph-schema-builder-script
title: Graph schema & builder script
status: todo
priority: high
category: data
assignees: ["@paulo"]
epic: EPIC-007-knowledge-graph-builder
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#graph", "#data"]
estimate: null
depends_on: []
blocks: ["TASK-071-wikilink-body-resolution", "TASK-072-wire-graph-into-publish-pipeline"]
related: []
---

## Description
Define stories/graph.json's shape — one node per story (id/title/status/type) plus edges for depends_on/blocks (reversed too, so "what's blocked on X" is a direct lookup) and epic (reversed into per-epic child lists). Write scripts/build-graph.mjs, analogous to scripts/build-manifest.mjs.

## Acceptance Criteria
- [ ] running it over the current stories/ produces a valid graph with correct bidirectional edges for every relationship in the corpus

## Subtasks
- [ ] Define the graph.json node/edge shape
- [ ] Implement scripts/build-graph.mjs
- [ ] Compute reverse edges (blocked_by, epic children)

## Notes
Edges already exist in the schema (D3/G2) — this only builds the derived artifact.
