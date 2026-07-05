---
id: TASK-070-graph-schema-builder-script
title: Graph schema & builder script
status: done
priority: high
category: data
assignees: ["@paulo"]
epic: EPIC-007-knowledge-graph-builder
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#graph", "#data"]
estimate: null
depends_on: []
blocks: ["TASK-071-wikilink-body-resolution", "TASK-072-wire-graph-into-publish-pipeline"]
related: []
---

## Description
Define stories/graph.json's shape — one node per story (id/title/status/type) plus edges for depends_on/blocks (reversed too, so "what's blocked on X" is a direct lookup) and epic (reversed into per-epic child lists). Write scripts/build-graph.mjs, analogous to scripts/build-manifest.mjs.

## Acceptance Criteria
- [x] running it over the current stories/ produces a valid graph with correct bidirectional edges for every relationship in the corpus

## Subtasks
- [x] Define the graph.json node/edge shape
- [x] Implement scripts/build-graph.mjs
- [x] Compute reverse edges (blocked_by, epic children)

## Notes
Edges already exist in the schema (D3/G2) — this only builds the derived artifact. Verified: running it over the live 79-story corpus produces correct reverse depends_on/blocks lookups and epic_children grouping (spot-checked TASK-092's depended_on_by and EPIC-007's epic_children).
