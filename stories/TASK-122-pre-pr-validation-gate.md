---
id: TASK-122-pre-pr-validation-gate
title: Pre-PR validation gate
status: todo
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-012-ai-write-actions
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#backend"]
estimate: null
depends_on: ["TASK-121-mutation-applier"]
blocks: ["TASK-123-branch-pr-creation"]
related: ["[[TASK-012-validation-check]]"]
---

## Description
Before opening any PR, run the same schema + referential-integrity checks validate-stories.mjs runs over the proposed tree; refuse (clear message, no PR) on an invalid enum, malformed frontmatter, or a dangling depends_on/blocks/related/epic reference. This is the structural guarantee that the AI can't author an invalid or destructive file.

## Acceptance Criteria
- [ ] an instruction that would create an invalid or dangling story is rejected with a reason and opens no PR

## Subtasks

## Notes
Reuse the existing validator logic rather than reimplementing it, so client, publish pipeline, and AI writer all agree on what "valid" means.
