---
id: TASK-080-whole-corpus-context-assembler
title: Whole-corpus context assembler
status: todo
priority: high
category: data
assignees: ["@paulo"]
epic: EPIC-008-context-assembly
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#data"]
estimate: null
depends_on: ["TASK-070-graph-schema-builder-script"]
blocks: ["TASK-092-gemini-call"]
related: []
---

## Description
Given the current corpus size, start with the simplest correct approach (PRD D9): one function that assembles all stories' frontmatter + body + the graph into one bounded text block — no embeddings, no vector DB, no ranking/selection.

## Acceptance Criteria
- [ ] produces one context blob, under a defined token budget, from the full live corpus

## Subtasks

## Notes
Explicitly not building retrieval/ranking yet — revisit only if story count grows enough to threaten the budget (see PRD #14.4).
