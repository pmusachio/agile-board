---
id: EPIC-007-knowledge-graph-builder
title: Knowledge graph builder
status: todo
priority: high
category: data
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#graph", "#data"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-001-data-pipeline]]", "[[EPIC-008-context-assembly]]"]
---

## Description
Turn the relationship fields every story already carries (`depends_on`/`blocks`/`related`/`epic`) plus `[[wiki-links]]` inside story bodies into a real, generated graph (`stories/graph.json`) — the foundation the MVP2 assistant reasons over. See docs/PRD.md #14.4.

## Acceptance Criteria
- [ ] TASK-070..072 complete

## Subtasks

## Notes
No docs/story.schema.json changes needed — these fields were already specified as graph edges in MVP1 (D3). This epic only builds the derived artifact, it doesn't add data.
