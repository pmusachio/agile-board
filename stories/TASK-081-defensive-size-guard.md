---
id: TASK-081-defensive-size-guard
title: Defensive context size guard
status: done
priority: low
category: data
assignees: ["@paulo"]
epic: EPIC-008-context-assembly
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#data"]
estimate: null
depends_on: ["TASK-080-whole-corpus-context-assembler"]
blocks: []
related: []
---

## Description
If the assembled context ever exceeds the model's budget, truncate/prioritize (drop story bodies before graph structure) rather than failing opaquely.

## Acceptance Criteria
- [x] an artificially oversized fixture triggers the truncation path predictably

## Subtasks

## Notes
Same function as TASK-080 (assembleContext in scripts/lib/context.mjs) — over budget, it drops story bodies (replaced with a placeholder) but keeps every story's frontmatter summary line and the full graph structure untouched. Verified with a synthetic 50-story fixture carrying 2.5M chars of body text against an 800,000-char budget: truncation triggers, final context is 32,128 chars (well under budget), and the omission notice is present.
