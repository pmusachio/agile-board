---
id: EPIC-008-context-assembly
title: Context assembly for the assistant
status: done
priority: high
category: data
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#data"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-007-knowledge-graph-builder]]", "[[EPIC-009-assistant-backend]]"]
---

## Description
Assemble the graph plus story bodies into the context the model actually sees. PRD D9: whole-corpus context assembly, not embeddings/vector search — the current ~40-50 story corpus fits comfortably in Gemini's context window, so ranking/retrieval would be solving a problem this project doesn't have yet.

## Acceptance Criteria
- [x] TASK-080..081 complete

## Subtasks

## Notes
Deliberately the simplest correct option at this scale (see PRD #14.4). Revisit only if the corpus grows enough to threaten the context budget.
