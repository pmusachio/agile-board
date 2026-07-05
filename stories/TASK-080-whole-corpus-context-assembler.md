---
id: TASK-080-whole-corpus-context-assembler
title: Whole-corpus context assembler
status: done
priority: high
category: data
assignees: ["@paulo"]
epic: EPIC-008-context-assembly
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#data"]
estimate: null
depends_on: ["TASK-070-graph-schema-builder-script"]
blocks: ["TASK-092-gemini-call"]
related: []
---

## Description
Given the current corpus size, start with the simplest correct approach (PRD D9): one function that assembles all stories' frontmatter + body + the graph into one bounded text block — no embeddings, no vector DB, no ranking/selection.

## Acceptance Criteria
- [x] produces one context blob, under a defined token budget, from the full live corpus

## Subtasks

## Notes
Explicitly not building retrieval/ranking yet — revisit only if story count grows enough to threaten the budget (see PRD #14.4). Implemented as scripts/lib/context.mjs (loadCorpus + assembleContext, pure/synchronous, no disk I/O in assembleContext itself so it's trivially testable with fixtures). Verified against the live 79-story corpus: assembled context is 93,258 chars against an 800,000-char (~200k token) budget — comfortably under, confirming D9's premise at the current corpus size.
