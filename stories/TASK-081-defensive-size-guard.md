---
id: TASK-081-defensive-size-guard
title: Defensive context size guard
status: todo
priority: low
category: data
assignees: ["@paulo"]
epic: EPIC-008-context-assembly
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#data"]
estimate: null
depends_on: ["TASK-080-whole-corpus-context-assembler"]
blocks: []
related: []
---

## Description
If the assembled context ever exceeds the model's budget, truncate/prioritize (drop story bodies before graph structure) rather than failing opaquely.

## Acceptance Criteria
- [ ] an artificially oversized fixture triggers the truncation path predictably

## Subtasks

## Notes
